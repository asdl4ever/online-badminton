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

// the block sits in front of the player, same ground as the court
const ROCK_X = 600;
const ROCK_R = 56;
const HIT_COOLDOWN = 0.22;
/** head speed (px/s) needed for a contact to count as a strike */
const SWING_MIN = 550;

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

  private kindIdx = 0;
  private hp = ORE_KINDS[0].hp;
  private cooldown = 0;
  private total = 0;
  private debris: Debris[] = [];

  private g!: Phaser.GameObjects.Graphics;
  /** shared character rigs — drawn exactly like the match scene's players */
  private rigMe!: PlayerRig;
  private rigOther!: PlayerRig;
  private hud!: Phaser.GameObjects.Text;
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
    this.kindIdx = 0;
    this.hp = ORE_KINDS[0].hp;
    this.total = 0;
    this.debris = [];
    this.me = { x: 430, y: GROUND_Y, vx: 0, vy: 0, onGround: true, facing: 1 };

    this.g = this.add.graphics();
    this.rigMe = createPlayerRig(this);
    this.rigOther = createPlayerRig(this);
    this.hud = this.add
      .text(16, 12, '', { fontSize: '17px', color: '#3a2c18', fontStyle: 'bold' })
      .setDepth(10);
    this.refreshHud();

    const kb = this.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys('A,D,W,LEFT,RIGHT,SPACE') as Record<
        string,
        Phaser.Input.Keyboard.Key
      >;
    }
    // multi-touch: the default single pointer cannot move and aim at once
    this.input.addPointer(3);
    this.touchControls = isTouchDevice() ? new TouchControls(this) : null;

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
          this.remote.facing = m.x > ROCK_X ? -1 : 1;
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

  toggleEditMode(): void {
    this.touchControls?.setEditing(!this.touchControls.editing);
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

    this.me.vy += PLAYER_GRAVITY * dt;
    this.me.x = Phaser.Math.Clamp(this.me.x + this.me.vx * dt, 60, ROCK_X - ROCK_R - 40);
    this.me.y += this.me.vy * dt;
    if (this.me.y >= GROUND_Y) {
      this.me.y = GROUND_Y;
      this.me.vy = 0;
      this.me.onGround = true;
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

  // ---- the rock ------------------------------------------------------------
  private stepRock(dt: number): void {
    this.cooldown -= dt;
    const kind = ORE_KINDS[this.kindIdx];

    const hx = this.headX();
    const hy = this.headY();
    const dx = hx - ROCK_X;
    const dy = hy - (GROUND_Y - ROCK_R);
    const touching = Math.hypot(dx, dy) < ROCK_R + RACKET_HEAD_R;

    // only a real swing breaks ore: the head must be moving fast enough and
    // travelling towards the rock — resting it against the surface does nothing
    const toRockX = -dx;
    const toRockY = -dy;
    const closing = this.swingVX * toRockX + this.swingVY * toRockY;
    const swinging =
      Math.hypot(this.swingVX, this.swingVY) >= SWING_MIN && closing > 0;

    if (touching && swinging && this.cooldown <= 0) {
      this.cooldown = HIT_COOLDOWN;
      this.hp -= 1;
      sfx.hit('drive');
      this.cameras.main.shake(90, 0.005);
      this.spawnDebris(hx, hy, kind.color, 4);
      if (this.hp <= 0) this.breakRock(kind);
    }
  }

  private breakRock(kind: OreKind): void {
    sfx.point();
    this.cameras.main.shake(220, 0.012);
    this.spawnDebris(ROCK_X, GROUND_Y - ROCK_R, kind.color, 14);
    this.spawnDebris(ROCK_X, GROUND_Y - ROCK_R, kind.ore, 8);
    this.total += kind.value;
    this.pop(`${kind.name} 碎了 +¥${kind.value}`, kind.ore);
    this.cfg.session?.send({ t: 'mineBreak', ore: kind.name, value: kind.value });
    this.refreshHud();

    // next block in the cycle
    this.kindIdx = (this.kindIdx + 1) % ORE_KINDS.length;
    this.hp = ORE_KINDS[this.kindIdx].hp;
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

  private refreshHud(): void {
    const kind = ORE_KINDS[this.kindIdx];
    this.hud.setText(`当前 ${kind.name} · 耐久 ${this.hp}/${kind.hp} · 已挖 ¥${this.total}`);
    this.cfg.onEarn?.(this.total);
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

    // sky + ground
    g.fillStyle(0xc9c2ae, 1);
    g.fillRect(0, 0, VIEW_W, GROUND_Y);
    g.fillStyle(0x6f5b40, 1);
    g.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
    g.fillStyle(0x5d4b34, 1);
    g.fillRect(0, GROUND_Y, VIEW_W, 6);

    // the ore block, with cracks proportional to damage taken
    const kind = ORE_KINDS[this.kindIdx];
    const frac = this.hp / kind.hp;
    const cy = GROUND_Y - ROCK_R;
    g.fillStyle(kind.color, 1);
    g.fillRoundedRect(ROCK_X - ROCK_R, cy - ROCK_R + 6, ROCK_R * 2, ROCK_R * 2 - 6, 16);
    g.lineStyle(3, 0x3a3a34, 0.5);
    g.strokeRoundedRect(ROCK_X - ROCK_R, cy - ROCK_R + 6, ROCK_R * 2, ROCK_R * 2 - 6, 16);
    // ore veins
    g.fillStyle(kind.ore, 0.95);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.6;
      g.fillCircle(
        ROCK_X + Math.cos(a) * ROCK_R * 0.55,
        cy + Math.sin(a) * ROCK_R * 0.5,
        4 + (i % 2) * 2,
      );
    }
    // cracks: up to 4, appearing as durability drops
    g.lineStyle(2, 0x2c2c26, 0.8);
    const cracks = Math.round((1 - frac) * 4);
    for (let i = 0; i < cracks; i++) {
      const a = i * 1.7 + 0.4;
      const sx = ROCK_X + Math.cos(a) * ROCK_R * 0.8;
      const sy = cy + Math.sin(a) * ROCK_R * 0.7;
      g.lineBetween(sx, sy, ROCK_X, cy + (i - 1.5) * 6);
    }

    // debris
    for (const d of this.debris) {
      g.fillStyle(d.color, Math.min(1, d.life));
      g.fillCircle(d.x, d.y, d.r);
    }

    this.drawAngler(g, this.me, this.cfg.cosmetic, this.racketAng, this.reach, true);
    if (this.remote)
      this.drawAngler(g, this.remote, this.cfg.cosmetic, this.remoteAng, this.remoteReach, false);
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
    );
  }
}
