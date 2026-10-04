import Phaser from 'phaser';
import {
  GROUND_Y,
  PLAYER_GRAVITY,
  PLAYER_H,
  PLAYER_JUMP_V,
  PLAYER_SPEED,
  RACKET_HEAD_R,
  RACKET_MAX,
  RACKET_SPEED_CAP,
  RACKET_SMOOTH,
  RACKET_TELEPORT,
  VIEW_H,
  VIEW_W,
} from '../constants';
import { createPlayerRig, type PlayerRig } from '../draw/rig';
import { RacketTracker } from '../racket';
import { TouchControls, isTouchDevice } from '../touch';
import { SCENE_BG_PAD, fitFixedView, onSceneResize } from '../zoom';
import { joystickAlwaysOn } from '../device';
import type { WorldConfig } from '../config';
import type { Cosmetic } from '../cosmetics';
import type { NetLink } from '../../net/link';
import { P } from '../theme';
import { sfx } from '../audio';

// ---- 棉花地 -----------------------------------------------------------------
/** 一次有效挥拍要有多快才算「拍下去」 */
const SWING_MIN = 550;
const HIT_COOLDOWN = 0.22;
/** 拍头离棉花多近算碰到 */
const HIT_R = 46;
/** 摘完一整片地的重生倒计时（秒） */
const REGEN_S = 60;
const FARM_STATE_KEY = 'bmt-farm-state';

const ROWS = 3;
const COLS = 8;
const SPACING_X = 96;
const SPACING_Y = 66;
/** 每株能摘几朵（随机 1..3） */
const PLANT_HP_MIN = 1;
const PLANT_HP_MAX = 3;

interface CottonPlant {
  x: number;
  y: number;
  /** 还能摘几朵 */
  hp: number;
  /** 初始朵数（用来决定画几颗棉桃） */
  maxHp: number;
}

interface Puff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
}

interface Farmer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
}

export interface FarmSceneData {
  cosmetic: Cosmetic;
  /** 一次挥拍能同时摘几朵（= progress.farmLevel） */
  harvest: number;
  /**
   * 本场累计摘到几朵**棉花材料**（页面拿去显示）。
   * 棉花不是金币：要拉去赚钱区交给农场主收购才换钱（见 `game/items.ts` 的 `MATERIALS`）。
   */
  onPick?: (total: number) => void;
  /** 仅供联机占位，农场目前是单机玩法 */
  session?: NetLink | null;
}

/**
 * 农场：一片棉花地，用球拍把棉花「拍」下来（**得到棉花材料，不是金币**；
 * 拉去赚钱区交给农场主才换钱，见 `game/items.ts` 的 `MATERIALS`）。
 * - 一次有效挥拍摘 `harvest` 朵（升级后一次能摘更多）
 * - 摘完一整片地后 60 秒重新长出来
 * - 买了拖拉机之后，页面上的按钮可以直接「一键收全地」
 */
export class FarmScene extends Phaser.Scene {
  private cfg!: FarmSceneData;
  private me!: Farmer;
  private racketAng = -0.6;
  private reach = 0;
  private swingVX = 0;
  private swingVY = 0;

  private plants: CottonPlant[] = [];
  private regen = 0;
  private cooldown = 0;
  private total = 0;
  private puffs: Puff[] = [];

  /** 静态背景层（天空 / 草地 / 远山）：create 时画一次，不参与每帧重画 */
  private bg!: Phaser.GameObjects.Graphics;
  private g!: Phaser.GameObjects.Graphics;
  /** 角色单独一层（depth 2）：emoji 脸在它之下，装备不会被脸盖住 */
  private charG!: Phaser.GameObjects.Graphics;
  /** 帽子/宠物层：在 emoji 头（depth 3）之上 */
  private charOverG!: Phaser.GameObjects.Graphics;
  private rigMe!: PlayerRig;
  private regenText!: Phaser.GameObjects.Text;
  private pops: { t: Phaser.GameObjects.Text; life: number }[] = [];

  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private racket = new RacketTracker();
  private touchControls: TouchControls | null = null;

  constructor() {
    super('FarmScene');
  }

  create(data: FarmSceneData): void {
    this.cfg = data;
    this.restoreOrGenerate();
    this.total = 0;
    this.puffs = [];
    this.me = { x: 200, y: GROUND_Y, vx: 0, vy: 0, onGround: true, facing: 1 };

    this.regenText = this.add
      .text(fieldCenterX(), GROUND_Y - 200, '', {
        fontSize: '22px',
        color: '#5f8f4a',
        fontStyle: 'bold',
        stroke: '#f3f7ee',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(12)
      .setVisible(false);

    // 背景层先建（同 depth 下先建的先画，于是垫在动态层下面）
    this.bg = this.add.graphics();
    this.drawBackdrop();
    this.g = this.add.graphics();
    this.charG = this.add.graphics().setDepth(2);
    this.charOverG = this.add.graphics().setDepth(4);
    this.rigMe = createPlayerRig(this);
    this.cfg.onPick?.(this.total);

    const kb = this.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys('A,D,W,LEFT,RIGHT,SPACE') as Record<
        string,
        Phaser.Input.Keyboard.Key
      >;
    }
    this.input.addPointer(3);
    // 触屏必开；桌面端开了「摇杆常显」也开
    this.touchControls = isTouchDevice() || joystickAlwaysOn() ? new TouchControls() : null;

    // 画面铺满：等比放大到铺满容器并居中（多余的一圈露的是背景，不做拉伸）
    const fit = () => fitFixedView(this);
    fit();
    onSceneResize(this, fit);

    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta / 1000, 1 / 20);
    this.stepPlayer(dt);
    this.stepRacket(dt);
    this.stepPlants(dt);
    this.stepPuffs(dt);
    this.stepPops(dt);
    this.draw();
    this.touchControls?.draw();
  }

  /** 升级后页面同步进来：一次挥拍摘几朵 */
  setHarvest(n: number): void {
    this.cfg.harvest = Math.max(1, Math.round(n));
  }

  /** 拖拉机：一键收全地（返回本次收了几朵棉花，没有棉花时返回 0） */
  collectAll(): number {
    if (!this.plants.length) return 0;
    let gain = 0;
    for (const p of this.plants) gain += p.hp;
    this.total += gain;
    this.plants = [];
    this.regen = REGEN_S;
    this.persistFarm();
    this.cfg.onPick?.(this.total);
    for (let i = 0; i < 30; i++) {
      this.spawnPuff(fieldCenterX() + (Math.random() - 0.5) * 640, GROUND_Y - 60, 2);
    }
    sfx.point();
    this.cameras.main.shake(200, 0.008);
    return gain;
  }

  /** 整片地还有多少朵可摘 */
  remaining(): number {
    return this.plants.reduce((s, p) => s + p.hp, 0);
  }

  // ---- player --------------------------------------------------------------
  private stepPlayer(dt: number): void {
    const k = this.keys;
    const t = this.touchControls?.read();
    const left = k?.A.isDown || k?.LEFT.isDown || !!t?.left;
    const right = k?.D.isDown || k?.RIGHT.isDown || !!t?.right;
    const dir = (left ? -1 : 0) + (right ? 1 : 0);

    if (dir !== 0) {
      this.me.vx = dir * PLAYER_SPEED;
      this.me.facing = dir > 0 ? 1 : -1;
    } else {
      this.me.vx *= 0.72;
      if (Math.abs(this.me.vx) < 6) this.me.vx = 0;
    }
    if ((k?.SPACE.isDown || k?.W.isDown || !!t?.jump) && this.me.onGround) {
      this.me.vy = PLAYER_JUMP_V;
      this.me.onGround = false;
    }

    this.me.vy += PLAYER_GRAVITY * dt;
    this.me.x = Phaser.Math.Clamp(this.me.x + this.me.vx * dt, 60, VIEW_W - 60);
    this.me.y += this.me.vy * dt;
    if (this.me.y >= GROUND_Y) {
      this.me.y = GROUND_Y;
      this.me.vy = 0;
      this.me.onGround = true;
    } else {
      this.me.onGround = false;
    }
  }

  private stepRacket(dt: number): void {
    const shoulderX = this.me.x;
    const shoulderY = this.me.y - PLAYER_H * 0.72;
    const cfg = {
      racketMax: RACKET_MAX,
      racketTeleport: RACKET_TELEPORT,
      racketSpeedCap: RACKET_SPEED_CAP,
      racketSmooth: RACKET_SMOOTH,
    } as unknown as WorldConfig;

    const tc = this.touchControls;
    let targetX: number;
    let targetY: number;
    let freeze: boolean;
    if (tc) {
      targetX = shoulderX + tc.joyX * RACKET_MAX;
      targetY = shoulderY + tc.joyY * RACKET_MAX;
      freeze = !tc.joyActive;
    } else {
      const p = this.input.activePointer;
      targetX = p.worldX;
      targetY = p.worldY;
      freeze = false;
    }

    const st = this.racket.update(targetX, targetY, shoulderX, shoulderY, dt, freeze, cfg);
    this.racketAng = Math.atan2(st.ry, st.rx);
    this.reach = Math.hypot(st.rx, st.ry);
    this.swingVX = st.rvx;
    this.swingVY = st.rvy;
  }

  private headX(): number {
    return this.me.x + Math.cos(this.racketAng) * this.reach;
  }
  private headY(): number {
    return this.me.y - PLAYER_H * 0.72 + Math.sin(this.racketAng) * this.reach;
  }

  // ---- 棉花地 ---------------------------------------------------------------
  private persistFarm(): void {
    try {
      const state = {
        plants: this.plants.map((p) => ({ hp: p.hp, maxHp: p.maxHp })),
        regenUntil: this.plants.length === 0 ? Date.now() + this.regen * 1000 : 0,
      };
      localStorage.setItem(FARM_STATE_KEY, JSON.stringify(state));
    } catch {
      /* private mode：存不进去就每次重新生成 */
    }
  }

  private restoreOrGenerate(): void {
    try {
      const raw = localStorage.getItem(FARM_STATE_KEY);
      if (raw) {
        // 老存档里还带着 `value`（每朵棉花的旧卖价），现在不用了：一朵 = 1 个棉花材料
        const state = JSON.parse(raw) as {
          plants: { hp: number; maxHp: number }[];
          regenUntil: number;
        };
        if (state.regenUntil > Date.now()) {
          this.plants = [];
          this.regen = (state.regenUntil - Date.now()) / 1000;
          return;
        }
        if (state.plants.length > 0) {
          const total = ROWS * COLS;
          this.plants = state.plants
            .slice(0, total)
            .map((p, i) => ({ ...this.slotPos(i), hp: p.hp, maxHp: p.maxHp }))
            .filter((p) => p.hp > 0);
          return;
        }
      }
    } catch {
      /* 存档坏了就重新生成 */
    }
    this.generateField();
  }

  /** 第 i 株的坐标（先底行后上行，每行从左到右） */
  private slotPos(i: number): { x: number; y: number } {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const cx = fieldCenterX();
    return {
      x: cx + (col - (COLS - 1) / 2) * SPACING_X,
      // 第 0 行贴着地面，往上依次排开
      y: GROUND_Y - 18 - row * SPACING_Y,
    };
  }

  private generateField(): void {
    this.plants = [];
    for (let i = 0; i < ROWS * COLS; i++) {
      const hp = PLANT_HP_MIN + Math.floor(Math.random() * (PLANT_HP_MAX - PLANT_HP_MIN + 1));
      this.plants.push({ ...this.slotPos(i), hp, maxHp: hp });
    }
    this.regen = 0;
    this.persistFarm();
  }

  private stepPlants(dt: number): void {
    if (!this.plants.length) {
      this.regen -= dt;
      if (this.regen <= 0) this.generateField();
      return;
    }

    this.cooldown -= dt;
    const hx = this.headX();
    const hy = this.headY();

    // 拍头附近的棉花（按距离排序）
    const near = this.plants
      .map((p) => ({ p, d: Math.hypot(hx - p.x, hy - p.y - 26) }))
      .filter((e) => e.d < HIT_R)
      .sort((a, b) => a.d - b.d);
    if (!near.length) return;

    // 只有「真的挥下去」才算采：拍头要够快、且朝着棉花去
    const closing =
      this.swingVX * (near[0].p.x - hx) + this.swingVY * (near[0].p.y - 26 - hy);
    const swinging = Math.hypot(this.swingVX, this.swingVY) >= SWING_MIN && closing > 0;
    if (!swinging || this.cooldown > 0) return;

    this.cooldown = HIT_COOLDOWN;
    sfx.hit('drive');
    // 一次挥拍摘 `harvest` 朵（升级后更多）
    const n = Math.min(Math.max(1, Math.round(this.cfg.harvest)), near.length);
    for (let i = 0; i < n; i++) this.pickOne(near[i].p);
    this.cameras.main.shake(70, 0.003);
  }

  private pickOne(p: CottonPlant): void {
    p.hp -= 1;
    this.total += 1;
    this.spawnPuff(p.x, p.y - 26, 5);
    this.pickPop(p.x, p.y - 70);
    this.cfg.onPick?.(this.total);

    if (p.hp <= 0) {
      this.plants = this.plants.filter((w) => w !== p);
      if (!this.plants.length) this.regen = REGEN_S;
      this.persistFarm();
    }
  }

  private spawnPuff(x: number, y: number, n: number): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 60 + Math.random() * 170;
      this.puffs.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 120,
        r: 4 + Math.random() * 5,
        life: 1.1,
      });
    }
  }

  private stepPuffs(dt: number): void {
    for (const p of this.puffs) {
      p.vy += 420 * dt;
      p.vx *= 0.98;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.puffs = this.puffs.filter((p) => p.life > 0);
  }

  private stepPops(dt: number): void {
    for (const p of this.pops) {
      p.life -= dt;
      p.t.y -= 26 * dt;
      p.t.setAlpha(Math.max(0, p.life));
      if (p.life <= 0) p.t.destroy();
    }
    this.pops = this.pops.filter((p) => p.life > 0);
  }

  /** 摘到棉花时的收获反馈：棉花图标 + 跳动的数字（+1 个棉花材料，不是金币） */
  private pickPop(x: number, y: number): void {
    const icon = this.add
      .text(x - 12, y, '🧵', { fontSize: '30px' })
      .setOrigin(0.5)
      .setDepth(14)
      .setScale(0.3);
    const num = this.add
      .text(x + 18, y, '+1', {
        fontSize: '28px',
        color: '#fff3c4',
        fontStyle: 'bold',
        stroke: '#5a4415',
        strokeThickness: 5,
      })
      .setOrigin(0, 0.5)
      .setDepth(14)
      .setScale(0.3);

    this.tweens.add({ targets: [icon, num], scale: 1, duration: 240, ease: 'Back.Out' });
    this.tweens.add({
      targets: [icon, num],
      y: y - 40,
      duration: 220,
      ease: 'Quad.Out',
      yoyo: true,
      hold: 40,
    });
    this.tweens.add({
      targets: [icon, num],
      y: y - 72,
      alpha: 0,
      delay: 820,
      duration: 400,
      ease: 'Sine.In',
      onComplete: () => {
        icon.destroy();
        num.destroy();
      },
    });
  }

  // ---- drawing -------------------------------------------------------------
  /** 天空 / 草地 / 远山：静态，create 时画一次（每帧重画纯属浪费） */
  private drawBackdrop(): void {
    const g = this.bg;
    // 多画一圈（pad）：手机横屏比 16:9 更宽时，两侧露的是天空与草地而不是黑边
    const pad = SCENE_BG_PAD;
    const w = VIEW_W + pad * 2;
    g.fillStyle(0xcfe9f7, 1);
    g.fillRect(-pad, -pad, w, GROUND_Y + pad);
    g.fillStyle(0x8cc46a, 1);
    g.fillRect(-pad, GROUND_Y, w, VIEW_H - GROUND_Y + pad);
    g.fillStyle(0x76b055, 1);
    g.fillRect(-pad, GROUND_Y, w, 6);
    // 远处一排小山
    g.fillStyle(0xbcd9a8, 1);
    for (let i = 0; i < 5; i++) {
      g.fillCircle(180 + i * 380, GROUND_Y - 10, 120);
    }
  }

  private draw(): void {
    const g = this.g;
    g.clear();
    this.charG.clear();
    this.charOverG.clear();

    // 棉花：绿色茎叶 + 白棉桃（朵数随剩余 hp 减少）
    for (const p of this.plants) {
      g.fillStyle(0x5f8f4a, 1);
      g.fillRect(p.x - 3, p.y - 30, 6, 34);
      g.fillEllipse(p.x - 12, p.y + 2, 26, 12);
      g.fillEllipse(p.x + 12, p.y + 2, 26, 12);
      g.fillStyle(0x4f7a3e, 1);
      g.fillEllipse(p.x, p.y + 4, 22, 10);
      // 棉桃：按剩余比例画
      const shown = Math.max(1, Math.round((p.hp / p.maxHp) * p.maxHp));
      for (let i = 0; i < shown; i++) {
        const a = (i / Math.max(1, p.maxHp)) * Math.PI - Math.PI / 2;
        g.fillStyle(0xf7fafc, 1);
        g.fillCircle(p.x + Math.cos(a) * 9, p.y - 34 + Math.sin(a) * 5, 8);
        g.fillStyle(0xe4ecf2, 1);
        g.fillCircle(p.x + Math.cos(a) * 9 - 2, p.y - 36 + Math.sin(a) * 5, 3);
      }
    }

    if (!this.plants.length) {
      this.regenText.setText(`棉花地重新生长中 ${Math.ceil(this.regen)}s`).setVisible(true);
    } else {
      this.regenText.setVisible(false);
    }

    // 棉花飞絮
    for (const p of this.puffs) {
      g.fillStyle(0xffffff, Math.min(1, p.life) * 0.9);
      g.fillCircle(p.x, p.y, p.r);
    }

    this.drawFarmer(this.me, this.cfg.cosmetic, this.racketAng, this.reach);
  }

  private drawFarmer(f: Farmer, cos: Cosmetic, ang: number, reach: number): void {
    this.rigMe.draw(
      this.charG,
      this.time.now,
      cos,
      { x: f.x, feetY: f.y, facing: f.facing, color: P.player0 },
      Math.cos(ang) * reach,
      Math.sin(ang) * reach,
      Math.hypot(this.swingVX, this.swingVY),
      RACKET_HEAD_R,
      this.charOverG,
      this.racket.path.pts,
    );
  }
}

/** 田地的水平中心 */
function fieldCenterX(): number {
  return VIEW_W * 0.62;
}
