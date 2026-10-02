import { NET_TOP, NET_X, PLAYER_H } from './constants';
import { clamp, simulateTrajectory } from './physics';
import { homeX, shoulderPoint } from './simulation';
import type { PlayerInput, World } from './types';
import type { PlayerStats } from './players';

/**
 * 人机的**唯一数据源是四维**（技术 / 速度 / 进攻 / 防守）。
 *
 * 这里没有手配的难度表：难度、战术风格、命中精度全部由四维推导——
 * 技术 → 命中精度，速度 → 反应时间，进攻 → 压网倾向，防守 → 抬高球与站位。
 * 移动速度 / 出球力度 / 判定半径另走 `attrsFromStats`（见 players.ts）在模拟层生效。
 */

/** 显示用难度档（由四维派生，不驱动行为） */
export type Difficulty = 'easy' | 'normal' | 'hard';

/** AI 的战术风格（由四维派生，不再单独存） */
export type AiStyle = 'attack' | 'defense' | 'balanced' | 'speed' | 'legend';

/** 中性五维（60 出头 ≈ 普通业余水平） */
export const NEUTRAL_STATS: PlayerStats = {
  technique: 62,
  speed: 62,
  attack: 62,
  defense: 62,
  jump: 62,
};

export const STAT_KEYS: (keyof PlayerStats)[] = [
  'technique',
  'speed',
  'attack',
  'defense',
  'jump',
];

export const STYLE_META: Record<AiStyle, { label: string; desc: string; color: string }> = {
  attack: { label: '暴力进攻', desc: '压网强攻，多用扣杀', color: '#ff5a4d' },
  defense: { label: '稳守反击', desc: '高远球为主，失误低', color: '#3d8bfd' },
  balanced: { label: '均衡', desc: '攻守兼备', color: '#8b97a8' },
  speed: { label: '速度型', desc: '跑动快，力量稍弱', color: '#39d0a0' },
  // 传奇：五维全线拉满，高远球（loft）与压网扣杀（aggression）同时拉满
  legend: { label: '传奇', desc: '高远球压底线，逮到机会就扣杀', color: '#ffd45c' },
};

/** 五维全部达到这条线才算「传奇」（只有皮泽恩这种存在够得着） */
const LEGEND_THRESHOLD = 92;

/** 四维 → 风格：哪一维明显最高就是什么类型，没有明显最高的就是均衡 */
export function styleFromStats(s: PlayerStats): AiStyle {
  // 五维全线爆表：普通风格分不出来（既爱高远球又爱扣杀），单独给「传奇」
  if (STAT_KEYS.every((k) => s[k] >= LEGEND_THRESHOLD)) return 'legend';
  const hi = Math.max(...STAT_KEYS.map((k) => s[k]));
  const leaders = STAT_KEYS.filter((k) => s[k] >= hi - 5);
  if (leaders.length === 1) {
    if (leaders[0] === 'attack') return 'attack';
    if (leaders[0] === 'defense') return 'defense';
    // 弹跳型也算速度型（都靠身体）
    if (leaders[0] === 'speed' || leaders[0] === 'jump') return 'speed';
  }
  return 'balanced';
}

/** 四维 → 显示难度档（只给 UI 看） */
export function tierFromStats(s: PlayerStats): Difficulty {
  const avg = STAT_KEYS.reduce((sum, k) => sum + s[k], 0) / STAT_KEYS.length;
  if (avg < 56) return 'easy';
  if (avg < 72) return 'normal';
  return 'hard';
}

/** 把 0–100 的一项线性映射到 [from, to] */
const lerp = (from: number, to: number, v: number): number =>
  from + (to - from) * Math.max(0, Math.min(1, v / 100));

/** 四维派生出的行为参数 */
interface Behavior {
  /** 落点预判误差（px） */
  posError: number;
  /** 反应延迟（s） */
  reaction: number;
  /** 出球角度误差（rad） */
  aimError: number;
  /** 接触点误差（px）—— 命中率 */
  contactError: number;
  /** 出球力度的波动幅度（技术越高越稳） */
  control: number;
  /** 非受迫性失误率（手一抖：球变软、角度变偏）——再强的球员也有下限 */
  blunder: number;
  /** 扣杀所需的「球高出网顶」余量（px，越大越保守）——技术决定敢不敢扣 */
  smashMargin: number;
  /** 扣杀仰角（越负越平、越狠）——技术决定扣得住扣不住 */
  smashAngle: number;
  /** 网前小球（轻吊）倾向 —— 技术好的手感细腻、爱搓小球 */
  drop: number;
  /** 起跳意愿（弹跳 + 进攻）——球高了敢跳起来扣 */
  jumpiness: number;
  /** 压网强攻（扣杀）倾向，同时放大「网前」判定范围 */
  aggression: number;
  /** 抬高球倍率 */
  loft: number;
  /** 站位前后偏移（正数更靠网） */
  approach: number;
}

/**
 * 四维 → 行为：
 * - 技术 = 出球质量（角度更准、力度更稳）
 * - 防守 = 命中率 + 反应（接得到、反应快、预判准）
 * - 进攻 = 扣杀倾向与站位（力量在物理层，见 players.attrsFromStats）
 * - 速度 = 只走物理层的跑动速度，这里不参与
 */
export function behaviorFromStats(s: PlayerStats): Behavior {
  return {
    // 技术 → 出球质量（含扣杀判断与网前小球手感）
    aimError: lerp(0.5, 0.05, s.technique),
    control: lerp(0.22, 0.03, s.technique),
    // 失误率保底 5%：顶级球员也会偶尔手软，留出反击机会
    blunder: Math.max(0.05, lerp(0.3, 0.02, s.technique)),
    smashMargin: lerp(130, 30, s.technique),
    smashAngle: lerp(-0.03, -0.2, s.technique),
    drop: lerp(0.15, 0.85, s.technique),
    // 弹跳 + 进攻 → 起跳意愿（弹跳占大头）
    jumpiness: lerp(0.2, 0.95, s.jump * 0.6 + s.attack * 0.4),
    // 防守 → 命中率 + 反应 + 预判（精度上限：再准也有 12px 的误差兜底）
    contactError: Math.max(12, lerp(95, 4, s.defense)),
    reaction: lerp(0.28, 0.06, s.defense),
    posError: lerp(190, 24, s.defense),
    // 进攻 → 扣杀倾向与压网站位
    aggression: lerp(0.5, 1.7, s.attack),
    approach: lerp(-150, 130, s.attack),
    // 防守型出球更高更稳
    loft: lerp(0.78, 1.4, s.defense),
  };
}

const SWING_COMMIT = 0.14;

function readyInput(facing: 1 | -1): PlayerInput {
  return {
    left: false,
    right: false,
    jump: false,
    rx: 44 * facing,
    ry: -70,
    rvx: 0,
    rvy: 0,
  };
}

export class AIController {
  /** 由四维算好的行为参数（构造 / setStats 时算一次） */
  private beh: Behavior;
  private errorTimer = 0;
  private errorOffset = 0;
  private reactionTimer = 0;
  private targetX: number;
  private swingTimer = 0;
  private swing: { rx: number; ry: number; rvx: number; rvy: number } | null = null;
  /** 拍头当前姿态（相对肩膀的偏移）：每帧朝目标平滑靠拢，不瞬移 */
  private trk = { rx: 44, ry: -70 };
  /** 本次挥拍的起点（引拍位）：挥拍动画从它扫向击球点 */
  private swingFrom = { rx: 44, ry: -70 };
  private swingAge = 0;
  /** 累计时间：给待机拍头一点轻微的呼吸感 */
  private t = 0;

  constructor(stats: PlayerStats = NEUTRAL_STATS, side: 0 | 1 = 1) {
    this.beh = behaviorFromStats(stats);
    this.targetX = homeX(side);
  }

  setStats(stats: PlayerStats): void {
    this.beh = behaviorFromStats(stats);
  }

  update(world: World, me: 0 | 1, dt: number): PlayerInput {
    const beh = this.beh;
    const wc = world.config;
    const p = world.players[me];
    const shuttle = world.shuttle;
    const dir = p.facing;
    const mySide = me === 0 ? -1 : 1;
    /** 四维决定的“主场站位”：进攻型更靠网，防守型更靠后 */
    const home = homeX(me) + -mySide * beh.approach;
    const input = readyInput(dir);

    this.reactionTimer -= dt;
    this.errorTimer -= dt;
    if (this.errorTimer <= 0) {
      this.errorTimer = 0.45 + Math.random() * 0.5;
      this.errorOffset = (Math.random() * 2 - 1) * beh.posError;
    }

    // --- where should the body go -----------------------------------------
    if (world.mode === 'juggle') {
      this.targetX = world.juggle.turn === me ? shuttle.x : home;
    } else if (world.phase === 'serve') {
      this.targetX = home;
    } else if (world.phase === 'rally' && shuttle.live) {
      const travel = shuttle.vx >= 0 ? 1 : -1;
      const traj = simulateTrajectory(shuttle.x, shuttle.y, shuttle.vx, shuttle.vy, travel, wc);
      const incoming = mySide < 0 ? traj.landX < NET_X : traj.landX > NET_X;
      if (incoming) {
        if (this.reactionTimer <= 0) {
          this.reactionTimer = beh.reaction;
          let tx = traj.landX + this.errorOffset;
          tx = mySide < 0 ? Math.min(tx, NET_X - 40) : Math.max(tx, NET_X + 40);
          this.targetX = tx;
        }
      } else {
        this.targetX = home;
      }
    } else {
      this.targetX = home;
    }

    const dx = this.targetX - p.x;
    if (dx > 12) input.right = true;
    else if (dx < -12) input.left = true;

    // --- juggle challenge: keep the shuttle up, never let it drop ---------
    if (world.mode === 'juggle') {
      if (world.juggle.turn !== me || world.phase !== 'rally') {
        input.left = false;
        input.right = false;
        return input;
      }
      const sh = shoulderPoint(p);
      const sdx = shuttle.x - sh.x;
      const sdy = shuttle.y - sh.y;
      const dist = Math.hypot(sdx, sdy);
      if (dist < 180) {
        const reach = Math.min(dist, wc.racketMax);
        input.rx = dist > 1 ? (sdx / dist) * reach : 0;
        input.ry = dist > 1 ? (sdy / dist) * reach : -reach;
        input.rvx = dir * 120;
        input.rvy = -950;
        input.left = false;
        input.right = false;
      }
      return input;
    }

    // --- serve ------------------------------------------------------------
    if (world.phase === 'serve') {
      if (world.server === me) {
        if (world.phaseTimer < 0.2) {
          const speed = wc.serveSpeedMin + 220;
          input.rvx = dir * speed * Math.cos(0.68);
          input.rvy = -speed * Math.sin(0.68);
        }
        // 发球动作：与发球倒计时同步的「引拍 → 向前挥出」，不再是僵直的待机位
        const T = wc.servePause;
        const k = Math.min(1, Math.max(0, (T - world.phaseTimer) / (T - 0.2)));
        const e = k * k * (3 - 2 * k); // smoothstep
        input.rx = dir * (-30 + 76 * e);
        input.ry = -95 + 25 * e;
      }
      return input;
    }

    // --- racket -----------------------------------------------------------
    if (world.phase === 'rally' && shuttle.live) {
      const sh = shoulderPoint(p);
      const sdx = shuttle.x - sh.x;
      const sdy = shuttle.y - sh.y;
      const dist = Math.hypot(sdx, sdy);

      // 球明显高过头顶 → 跳起来（弹跳 + 进攻 决定跳的频率）
      const aboveHead = shuttle.y < p.y - PLAYER_H * 0.85;
      if (p.onGround && aboveHead && dist < 200 && Math.random() < beh.jumpiness) {
        input.jump = true;
      }

      const incoming = mySide < 0 ? shuttle.x < NET_X : shuttle.x > NET_X;

      if (this.swingTimer > 0 && this.swing) {
        this.swingTimer -= dt;
        this.swingAge += dt;
        // 挥拍动画：拍头从引拍位沿一条外鼓的弧线扫向击球点。
        // 目标点每帧追着球重算（球还在飞），保证弧线终点依然对准来球；
        // easeOut 先快后缓，前几帧就基本到位 → 命中判定依旧可靠。
        const reach = Math.min(dist, wc.racketMax);
        const tx = dist > 1 ? (sdx / dist) * reach : 0;
        const ty = dist > 1 ? (sdy / dist) * reach : -reach;
        const k = Math.min(1, this.swingAge / 0.09);
        const e = 1 - (1 - k) * (1 - k);
        const mx = tx - this.swingFrom.rx;
        const my = ty - this.swingFrom.ry;
        const ml = Math.hypot(mx, my) || 1;
        const bow = Math.sin(k * Math.PI) * 36 * dir; // 中途往外鼓一下 → 看得见的弧线
        input.rx = this.swingFrom.rx + mx * e + (-my / ml) * bow;
        input.ry = this.swingFrom.ry + my * e + (mx / ml) * bow;
        input.rvx = this.swing.rvx;
        input.rvy = this.swing.rvy;
        input.left = false;
        input.right = false;
        return input;
      }

      // 不挥拍时拍头也不僵住：平滑跟随目标姿态。
      // 球迎面而来（≤340px）先收到脑后做引拍；平时在体前待命。
      let wantX = 44 * dir;
      let wantY = -70;
      if (incoming && dist > 1 && dist < 340) {
        wantX = -dir * 26;
        wantY = -88;
      }
      this.t += dt;
      const sm = 1 - Math.exp(-10 * dt);
      this.trk.rx += (wantX - this.trk.rx) * sm;
      this.trk.ry += (wantY - this.trk.ry) * sm;
      input.rx = this.trk.rx;
      input.ry = this.trk.ry;
      // 轻微的挥速起伏：像真人举着拍子在手里微调
      input.rvx = dir * (110 + Math.sin(this.t * 3.1) * 50);
      input.rvy = -70 + Math.cos(this.t * 2.4) * 40;

      if (incoming && dist > 1 && dist < 150) {
        // 扣杀门槛：球要高过网一定余量，技术低的人余量要求更大（于是不会一路扣到网上）
        const highEnough = shuttle.y < NET_TOP - beh.smashMargin;
        // 进攻型把「网前」范围放大，但不再无脑放大到全场地
        const nearNet = Math.abs(p.x - NET_X) < 340 * (0.7 + 0.45 * beh.aggression);
        const aboveNet = shuttle.y < NET_TOP - 30;
        let elevation: number;
        let speed: number;
        if (highEnough && nearNet && beh.aggression > 1.1) {
          // 扣杀：还站在地上就先跳起来，在空中完成
          if (p.onGround) input.jump = true;
          elevation = beh.smashAngle;
          speed = 1950;
        } else if (!aboveHead && nearNet && Math.random() < beh.drop) {
          // 技术型：球不高、人在网前 → 轻吊网前小球
          elevation = 0.32;
          speed = 900;
        } else if (aboveNet) {
          elevation = 0.62 * beh.loft;
          speed = 1380;
        } else if (shuttle.y > NET_TOP + 55) {
          elevation = 0.85 * beh.loft;
          speed = 1240;
        } else {
          elevation = 0.22 * beh.loft;
          speed = 1320;
        }
        elevation += (Math.random() * 2 - 1) * beh.aimError;
        // 力度波动由「技术」控制：技术高 → 出球质量稳定
        speed *= 1 + (Math.random() * 2 - 1) * beh.control;
        // 偶尔手一抖：球变软、角度变偏 —— 再强的球员也留出被反击的机会
        if (Math.random() < beh.blunder) {
          speed *= 0.62;
          elevation += (Math.random() * 2 - 1) * 0.22;
        }
        elevation = clamp(elevation, wc.aimMin, wc.aimMax);

        const reach = Math.min(dist, wc.racketMax);
        const err = beh.contactError;
        const rx = (sdx / dist) * reach + (Math.random() * 2 - 1) * err;
        const ry = (sdy / dist) * reach + (Math.random() * 2 - 1) * err;
        this.swing = {
          rx,
          ry,
          rvx: dir * speed * Math.cos(elevation),
          rvy: -speed * Math.sin(elevation),
        };
        this.swingTimer = SWING_COMMIT;
        // 挥拍动画从「当前引拍位」出发，扫向击球点（位置在上方 commit 分支里逐帧插值）
        this.swingFrom = { rx: this.trk.rx, ry: this.trk.ry };
        this.swingAge = 0;
        input.rx = this.swingFrom.rx;
        input.ry = this.swingFrom.ry;
        input.rvx = this.swing.rvx;
        input.rvy = this.swing.rvy;
        input.left = false;
        input.right = false;
        return input;
      }
    }

    return input;
  }
}
