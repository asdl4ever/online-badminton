import Phaser from 'phaser';
import {
  GROUND_Y,
  PLAYER_GRAVITY,
  PLAYER_H,
  PLAYER_JUMP_V,
  PLAYER_SPEED,
  PLAYER_W,
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
import { joystickAlwaysOn } from '../device';
import type { WorldConfig } from '../config';
import type { Cosmetic } from '../cosmetics';
import { P } from '../theme';
import type { NetLink } from '../../net/link';
import { sfx } from '../audio';

// ---- ore table: each broken block yields coins straight away ---------------
interface OreKind {
  name: string;
  hp: number;
  value: number;
  color: number;
  ore: number; // the sparkly vein colour
}
const ORE_KINDS: OreKind[] = [
  { name: '石头', hp: 3, value: 5, color: 0x8d949e, ore: 0x6d747e },
  { name: '铁矿', hp: 6, value: 12, color: 0x9e8a72, ore: 0xc98a4b },
  { name: '金矿', hp: 10, value: 30, color: 0x8f8f7a, ore: 0xffd45c },
  { name: '钻石矿', hp: 16, value: 80, color: 0x7a8f9e, ore: 0x6fe3ff },
];

// 矿山：进图生成一座由方块矿石叠成的小山，挖空后 1 分钟重新生成
const MINE_X = 600;
const BLOCK_S = 64; // 每块矿石的边长
const MOUNTAIN_ROWS = 5; // 底行 9 块，往上每行减 2，共 25 块
const REGEN_S = 60; // 挖空后的重生倒计时（秒）
/** 矿山状态存档：退出再进来，山还是那座山，恢复倒计时也照走 */
const MINE_STATE_KEY = 'bmt-mine-state';

/** 每行第一块的下标（底行 9 块、每行减 2）→ [0, 9, 16, 21, 24]，总数 25 */
const MOUNTAIN_STARTS: number[] = (() => {
  const starts: number[] = [];
  let acc = 0;
  for (let r = 0; r < MOUNTAIN_ROWS; r++) {
    starts.push(acc);
    acc += 9 - 2 * r;
  }
  return starts;
})();
const MOUNTAIN_TOTAL = MOUNTAIN_ROWS * 9 - MOUNTAIN_ROWS * (MOUNTAIN_ROWS - 1);
const HIT_COOLDOWN = 0.22;
/** head speed (px/s) needed for a contact to count as a strike */
const SWING_MIN = 550;

/** one ore block of the mountain */
interface OreBlock {
  x: number;
  y: number;
  kind: OreKind;
  hp: number;
}

// debris shares the shuttle's gravity + quadratic drag
const DEBRIS_GRAVITY = 1350;
const DEBRIS_DRAG = 0.0016;

interface Debris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: number;
  life: number;
}

interface Miner {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
}

export interface MiningSceneData {
  cosmetic: Cosmetic;
  session: NetLink | null;
  /** reports earnings so the Vue page can show a running total */
  onEarn?: (total: number) => void;
}

/**
 * Mining: a block of ore in front of the player, broken by swinging the racket
 * into it. Debris flies with the same gravity + quadratic drag the shuttle
 * uses; each broken block pays coins on the spot.
 */
export class MiningScene extends Phaser.Scene {
  private cfg!: MiningSceneData;
  private me!: Miner;
  private remote: Miner | null = null;
  private racketAng = -0.6;
  private reach = 0;
  /** smoothed head velocity from the tracker — a strike needs real speed */
  private swingVX = 0;
  private swingVY = 0;

  private blocks: OreBlock[] = [];
  /** 挖空后的重生倒计时（>0 表示矿山恢复中） */
  private regen = 0;
  private cooldown = 0;
  private total = 0;
  private debris: Debris[] = [];

  private g!: Phaser.GameObjects.Graphics;
  /** 角色单独一层（depth 2）：emoji 脸在它之下，装备不会被脸盖住 */
  private charG!: Phaser.GameObjects.Graphics;
  /** 帽子/宠物层：在 emoji 头（depth 3）之上 */
  private charOverG!: Phaser.GameObjects.Graphics;
  /** shared character rigs — drawn exactly like the match scene's players */
  private rigMe!: PlayerRig;
  private rigOther!: PlayerRig;
  private regenText!: Phaser.GameObjects.Text;
  private pops: { t: Phaser.GameObjects.Text; life: number }[] = [];

  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private poseClock = 0;
  /** exactly the match controls: tracker + sticks on touch */
  private racket = new RacketTracker();
  private touchControls: TouchControls | null = null;

  constructor() {
    super('MiningScene');
  }

  create(data: MiningSceneData): void {
    this.cfg = data;
    this.restoreOrGenerate();
    this.total = 0;
    this.debris = [];
    this.me = { x: 230, y: GROUND_Y, vx: 0, vy: 0, onGround: true, facing: 1 };
    this.regenText = this.add
      .text(MINE_X, GROUND_Y - 150, '', {
        fontSize: '22px',
        color: '#8d949e',
        fontStyle: 'bold',
        stroke: '#3a3a34',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(12)
      .setVisible(false);

    this.g = this.add.graphics();
    this.charG = this.add.graphics().setDepth(2);
    this.charOverG = this.add.graphics().setDepth(4);
    this.rigMe = createPlayerRig(this);
    this.rigOther = createPlayerRig(this);
    // 左上角不再写矿石耐久 / 金币：耐久看裂纹，收获看破坏时的金币跳动
    this.cfg.onEarn?.(this.total);

    const kb = this.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys('A,D,W,LEFT,RIGHT,SPACE') as Record<
        string,
        Phaser.Input.Keyboard.Key
      >;
    }
    // multi-touch: the default single pointer cannot move and aim at once
    this.input.addPointer(3);
    // 触屏必开；桌面端开了「摇杆常显」也开
    this.touchControls = isTouchDevice() || joystickAlwaysOn() ? new TouchControls(this) : null;

    const link = this.cfg.session;
    if (link) {
      link.onMessage = (m) => {
        if (m.t === 'minePose') {
          if (!this.remote)
            this.remote = { x: m.x, y: m.y, vx: 0, vy: 0, onGround: true, facing: 1 };
          this.remote.x = m.x;
          this.remote.y = m.y;
          this.remoteAng = m.a;
          this.remoteReach = m.r;
          this.remote.facing = m.x > MINE_X ? -1 : 1;
        } else if (m.t === 'mineBreak') {
          this.pop(`对方挖到 ${m.ore} +¥${m.value}`, 0x2a7ad4);
        }
      };
      link.onDisconnected = () => {
        this.remote = null;
        this.pop('对方已离开', 0x8b97a8);
      };
    }

    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  private remoteAng = -0.6;
  private remoteReach = 90;

  update(_time: number, delta: number): void {
    const dt = Math.min(delta / 1000, 1 / 20);
    this.stepPlayer(dt);
    this.stepRacket(dt);
    this.stepRock(dt);
    this.stepDebris(dt);
    this.stepPops(dt);
    this.draw();
    this.touchControls?.draw();
    this.sendPose(dt);
  }

  // ---- player --------------------------------------------------------------
  private stepPlayer(dt: number): void {
    const k = this.keys;
    // one read() per frame: it consumes the queued jump
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

    const prevY = this.me.y;
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
    this.resolveRockCollision(prevY);
  }

  /**
   * 矿石是实体，不能穿过去：从侧面撞上会被顶开，从上方落下则站在块顶上。
   * 山是很多方块，逐块做同样的判定。
   */
  private resolveRockCollision(prevY: number): void {
    const me = this.me;
    const halfW = PLAYER_W / 2 + 2;
    const half = BLOCK_S / 2;

    for (const b of this.blocks) {
      const left = b.x - half;
      const right = b.x + half;
      const top = b.y - half;

      // 水平方向没碰上，或者整个人已经在这一块上方 → 不碰
      if (me.x + halfW <= left || me.x - halfW >= right) continue;
      if (me.y <= top) continue;

      // 这一帧是从上方落下来的 → 踩上去
      if (prevY <= top + 2 && me.vy >= 0) {
        me.y = top;
        me.vy = 0;
        me.onGround = true;
        return;
      }

      // 其余情况从侧面顶出去（哪边近就往哪边）
      me.x = me.x < b.x ? left - halfW : right + halfW;
      me.vx = 0;
      return;
    }
  }

  /**
   * The racket is a pickaxe, driven exactly like the match racket: the
   * tracker pins the head to the pointer (or the right stick), clamps it to
   * racket reach and smooths its velocity.
   */
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

  // ---- the mountain ----------------------------------------------------------
  /** 加权随机一块矿种：普通多、钻石少 */
  private pickKind(): OreKind {
    const r = Math.random();
    return r < 0.45 ? ORE_KINDS[0] : r < 0.75 ? ORE_KINDS[1] : r < 0.93 ? ORE_KINDS[2] : ORE_KINDS[3];
  }

  /**
   * 把山的状态写到 localStorage（退出 / 刷新后再进，山和倒计时都还在）。
   * 方块位置由行列决定，所以只需要存矿种下标和剩余耐久。
   */
  private persistMine(): void {
    try {
      const state = {
        blocks: this.blocks.map((b) => ({ k: ORE_KINDS.indexOf(b.kind), hp: b.hp })),
        regenUntil: this.blocks.length === 0 ? Date.now() + this.regen * 1000 : 0,
      };
      localStorage.setItem(MINE_STATE_KEY, JSON.stringify(state));
    } catch {
      /* private mode：存不进去就退化为每次重新生成 */
    }
  }

  /** 进图时先看存档：还在恢复就接着倒计时，没挖完就接着挖 */
  private restoreOrGenerate(): void {
    try {
      const raw = localStorage.getItem(MINE_STATE_KEY);
      if (raw) {
        const state = JSON.parse(raw) as {
          blocks: { k: number; hp: number }[];
          regenUntil: number;
        };
        if (state.regenUntil > Date.now()) {
          this.blocks = [];
          this.regen = (state.regenUntil - Date.now()) / 1000;
          return;
        }
        if (state.blocks.length > 0) {
          this.blocks = state.blocks
            .filter((b) => b.k >= 0 && b.k < ORE_KINDS.length && b.hp > 0)
            .map((b, i) => this.makeBlock(i, ORE_KINDS[b.k], b.hp));
          return;
        }
      }
    } catch {
      /* 存档坏了就重新生成 */
    }
    this.generateMountain();
  }

  /** 按山的第 i 块（先底行后上行、每行从左到右）算出世界坐标 */
  private makeBlock(i: number, kind: OreKind, hp: number): OreBlock {
    let row = MOUNTAIN_ROWS - 1;
    while (i < MOUNTAIN_STARTS[row]) row--;
    const width = 9 - row * 2;
    const inRow = i - MOUNTAIN_STARTS[row];
    return {
      x: MINE_X + (inRow - (width - 1) / 2) * BLOCK_S,
      y: GROUND_Y - 6 - BLOCK_S / 2 - row * BLOCK_S,
      kind,
      hp,
    };
  }

  /** 生成矿石山：底行 9 块，往上每行减 2（共 25 块），矿种逐块加权随机 */
  private generateMountain(): void {
    this.blocks = [];
    for (let i = 0; i < MOUNTAIN_TOTAL; i++) {
      const kind = this.pickKind();
      this.blocks.push(this.makeBlock(i, kind, kind.hp));
    }
    this.regen = 0;
    this.persistMine();
  }

  private stepRock(dt: number): void {
    // 挖空恢复中：倒计时归零重新生成一座山
    if (this.blocks.length === 0) {
      this.regen -= dt;
      if (this.regen <= 0) this.generateMountain();
      return;
    }

    this.cooldown -= dt;
    const hx = this.headX();
    const hy = this.headY();

    // 找拍头碰到的那一块（取最近的一块）
    let hit: OreBlock | null = null;
    let best = Infinity;
    for (const b of this.blocks) {
      const d = Math.hypot(hx - b.x, hy - b.y);
      if (d < BLOCK_S / 2 + RACKET_HEAD_R + 4 && d < best) {
        best = d;
        hit = b;
      }
    }
    if (!hit) return;

    // only a real swing breaks ore: the head must be moving fast enough and
    // travelling towards the rock — resting it against the surface does nothing
    const closing = this.swingVX * (hit.x - hx) + this.swingVY * (hit.y - hy);
    const swinging = Math.hypot(this.swingVX, this.swingVY) >= SWING_MIN && closing > 0;
    if (swinging && this.cooldown <= 0) {
      this.cooldown = HIT_COOLDOWN;
      hit.hp -= 1;
      sfx.hit('drive');
      this.cameras.main.shake(90, 0.005);
      this.spawnDebris(hx, hy, hit.kind.color, 4);
      if (hit.hp <= 0) this.breakBlock(hit);
    }
  }

  private breakBlock(b: OreBlock): void {
    sfx.point();
    this.cameras.main.shake(220, 0.012);
    this.spawnDebris(b.x, b.y, b.kind.color, 14);
    this.spawnDebris(b.x, b.y, b.kind.ore, 8);
    this.total += b.kind.value;
    this.coinPop(b.x, b.y - BLOCK_S, b.kind.value);
    this.cfg.session?.send({ t: 'mineBreak', ore: b.kind.name, value: b.kind.value });
    this.cfg.onEarn?.(this.total);

    this.blocks = this.blocks.filter((w) => w !== b);
    // 整座山挖空 → 1 分钟后重新生成；存档跟着更新（部分挖完退出也保留进度）
    if (this.blocks.length === 0) this.regen = REGEN_S;
    this.persistMine();
  }

  private spawnDebris(x: number, y: number, color: number, n: number): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 200 + Math.random() * 500;
      this.debris.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 250,
        r: 2.5 + Math.random() * 4,
        color,
        life: 1.2,
      });
    }
  }

  private stepDebris(dt: number): void {
    for (const d of this.debris) {
      const speed = Math.hypot(d.vx, d.vy);
      const drag = DEBRIS_DRAG * speed;
      d.vx -= d.vx * drag * dt;
      d.vy -= d.vy * drag * dt;
      d.vy += DEBRIS_GRAVITY * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.life -= dt;
      if (d.y > GROUND_Y - 3) {
        d.y = GROUND_Y - 3;
        d.vy *= -0.3;
        d.vx *= 0.6;
      }
    }
    this.debris = this.debris.filter((d) => d.life > 0);
  }

  private pop(text: string, color: number): void {
    const t = this.add
      .text(this.me.x, this.me.y - PLAYER_H - 26, text, {
        fontSize: '16px',
        color: `#${color.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(12);
    this.pops.push({ t, life: 1.4 });
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

  /**
   * 破坏矿石时的收获反馈：金币图标 + 跳动的数字。
   * 先弹出来（回弹缩放），再向上跳一下，最后飘起淡出。
   */
  private coinPop(x: number, y: number, value: number): void {
    const icon = this.add
      .text(x - 12, y, '🪙', { fontSize: '36px' })
      .setOrigin(0.5)
      .setDepth(14)
      .setScale(0.3);
    const num = this.add
      .text(x + 18, y, `+${value}`, {
        fontSize: '30px',
        color: '#ffd45c',
        fontStyle: 'bold',
        stroke: '#3a2c18',
        strokeThickness: 5,
      })
      .setOrigin(0, 0.5)
      .setDepth(14)
      .setScale(0.3);

    // 1) 弹出来（回弹）
    this.tweens.add({
      targets: [icon, num],
      scale: 1,
      duration: 260,
      ease: 'Back.Out',
    });
    // 2) 跳一下再落回原位
    this.tweens.add({
      targets: [icon, num],
      y: y - 44,
      duration: 240,
      ease: 'Quad.Out',
      yoyo: true,
      hold: 40,
    });
    // 3) 飘起淡出，收尾销毁
    this.tweens.add({
      targets: [icon, num],
      y: y - 76,
      alpha: 0,
      delay: 900,
      duration: 420,
      ease: 'Sine.In',
      onComplete: () => {
        icon.destroy();
        num.destroy();
      },
    });
  }

  // ---- networking ----------------------------------------------------------
  private sendPose(dt: number): void {
    if (!this.cfg.session) return;
    this.poseClock -= dt;
    if (this.poseClock > 0) return;
    this.poseClock = 1 / 12;
    this.cfg.session.send({
      t: 'minePose',
      x: Math.round(this.me.x),
      y: Math.round(this.me.y),
      a: Math.round(this.racketAng * 100) / 100,
      r: Math.round(this.reach),
    });
  }

  // ---- drawing -------------------------------------------------------------
  private draw(): void {
    const g = this.g;
    g.clear();
    this.charG.clear();
    this.charOverG.clear();

    // sky + ground
    g.fillStyle(0xc9c2ae, 1);
    g.fillRect(0, 0, VIEW_W, GROUND_Y);
    g.fillStyle(0x6f5b40, 1);
    g.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
    g.fillStyle(0x5d4b34, 1);
    g.fillRect(0, GROUND_Y, VIEW_W, 6);

    // 矿石山：逐块画方块 + 矿脉 + 裂纹（裂纹随耐久加深）
    for (const b of this.blocks) {
      const half = BLOCK_S / 2;
      const frac = b.hp / b.kind.hp;
      g.fillStyle(b.kind.color, 1);
      g.fillRoundedRect(b.x - half, b.y - half + 4, BLOCK_S, BLOCK_S - 4, 10);
      g.lineStyle(2.5, 0x3a3a34, 0.5);
      g.strokeRoundedRect(b.x - half, b.y - half + 4, BLOCK_S, BLOCK_S - 4, 10);
      // ore veins
      g.fillStyle(b.kind.ore, 0.95);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.6;
        g.fillCircle(b.x + Math.cos(a) * half * 0.45, b.y + Math.sin(a) * half * 0.4, 3.5);
      }
      // cracks: up to 3, appearing as durability drops
      g.lineStyle(1.8, 0x2c2c26, 0.8);
      const cracks = Math.round((1 - frac) * 3);
      for (let i = 0; i < cracks; i++) {
        const a = i * 2.1 + 0.5;
        g.lineBetween(
          b.x + Math.cos(a) * half * 0.7,
          b.y + Math.sin(a) * half * 0.6,
          b.x,
          b.y,
        );
      }
    }

    // 挖空恢复中：倒计时提示
    if (this.blocks.length === 0) {
      this.regenText
        .setText(`矿山恢复中 ${Math.ceil(this.regen)}s`)
        .setVisible(true);
    } else {
      this.regenText.setVisible(false);
    }

    // debris
    for (const d of this.debris) {
      g.fillStyle(d.color, Math.min(1, d.life));
      g.fillCircle(d.x, d.y, d.r);
    }

    this.drawAngler(this.charG, this.me, this.cfg.cosmetic, this.racketAng, this.reach, true);
    if (this.remote)
      this.drawAngler(this.charG, this.remote, this.cfg.cosmetic, this.remoteAng, this.remoteReach, false);
  }

  private drawAngler(
    g: Phaser.GameObjects.Graphics,
    a: Miner,
    cos: Cosmetic,
    ang: number,
    reach: number,
    isMe: boolean,
  ): void {
    // same rig the match scene uses: body + arm + racket, identical visuals
    const rig = isMe ? this.rigMe : this.rigOther;
    rig.draw(
      g,
      this.time.now,
      cos,
      {
        x: a.x,
        feetY: a.y,
        facing: a.facing,
        color: isMe ? P.player0 : P.player1,
      },
      Math.cos(ang) * reach,
      Math.sin(ang) * reach,
      Math.hypot(this.swingVX, this.swingVY),
      RACKET_HEAD_R,
      this.charOverG,
    );
  }
}
