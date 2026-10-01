import Phaser from 'phaser';
import {
  COURT_RIGHT,
  GROUND_Y,
  PLAYER_GRAVITY,
  PLAYER_H,
  PLAYER_JUMP_V,
  PLAYER_SPEED,
  RACKET_HEAD_R,
  VIEW_H,
  VIEW_W,
} from '../constants';
import { drawCharacter } from '../draw/character';
import { drawRacketHead, racketFrameColor } from '../draw/racket';
import type { Cosmetic } from '../cosmetics';
import { P } from '../theme';
import type { NetLink } from '../../net/link';
import { isTouchDevice } from '../device';
import { sfx } from '../audio';

// ---- fish table (name, value, radius, leap chance weight) ------------------
interface FishKind {
  name: string;
  value: number;
  r: number;
  color: number;
  weight: number;
}
const FISH_KINDS: FishKind[] = [
  { name: '小鱼', value: 8, r: 12, color: 0x8fb6d9, weight: 50 },
  { name: '鲈鱼', value: 25, r: 17, color: 0x5c9e58, weight: 28 },
  { name: '金枪鱼', value: 60, r: 23, color: 0x3d6fd4, weight: 15 },
  { name: '锦鲤', value: 150, r: 20, color: 0xe86a4a, weight: 7 },
];

// pond geometry (right half of the court, same floor as the match)
const WATER_X = 700;
const WATER_Y = GROUND_Y - 46;
const WATER_RIGHT = COURT_RIGHT;

// fish share the badminton ball's physics feel
const FISH_GRAVITY = 1350;
const FISH_DRAG = 0.0016;

const REEL_TIME = 0.55;
const POSE_HZ = 12;

interface Fish {
  kind: FishKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hooked: boolean;
  alive: boolean;
  flip: 1 | -1;
}

interface Angler {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
}

export interface FishingSceneData {
  cosmetic: Cosmetic;
  session: NetLink | null;
  rodLevel: number;
  /** reports the basket so the Vue page can show / sell it */
  onBasket?: (count: number, value: number) => void;
}

/**
 * Fishing pond: same court proportions and the same gravity + quadratic drag
 * the badminton ball uses, but the racket is a rod and the "shuttle" is a fish
 * leaping out of the pond. Touch a fish with the racket head to hook it.
 */
export class FishingScene extends Phaser.Scene {
  private cfg!: FishingSceneData;
  private me!: Angler;
  private remote: Angler | null = null;
  private remoteSkin: Cosmetic | null = null;
  private racketAng = -0.6;
  private reach = 0;

  private fish: Fish[] = [];
  private leapTimer = 1;
  private basket: FishKind[] = [];
  private reel = 0;
  private reelFish: Fish | null = null;
  private rodLevel = 1;

  private g!: Phaser.GameObjects.Graphics;
  private face: Phaser.GameObjects.Text | null = null;
  private hud!: Phaser.GameObjects.Text;
  private pops: { t: Phaser.GameObjects.Text; life: number }[] = [];

  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private poseClock = 0;
  /** touch: drag anywhere to move, the round button jumps */
  private touch = isTouchDevice();
  private pointerWasDown = false;

  constructor() {
    super('FishingScene');
  }

  create(data: FishingSceneData): void {
    this.cfg = data;
    this.rodLevel = Math.max(1, data.rodLevel || 1);
    this.me = { x: 420, y: GROUND_Y, vx: 0, vy: 0, onGround: true, facing: 1 };
    this.fish = [];
    this.basket = [];
    this.reel = 0;
    this.reelFish = null;

    this.g = this.add.graphics();
    this.face = this.add.text(0, 0, this.cfg.cosmetic.emoji, { fontSize: '24px' }).setDepth(6);
    this.hud = this.add
      .text(16, 12, '', {
        fontFamily: 'inherit',
        fontSize: '17px',
        color: '#1f3a52',
        fontStyle: 'bold',
      })
      .setDepth(10);
    this.refreshHud();

    const kb = this.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys('A,D,W,LEFT,RIGHT,SPACE') as Record<
        string,
        Phaser.Input.Keyboard.Key
      >;
    }

    const link = this.cfg.session;
    if (link) {
      link.onMessage = (m) => {
        if (m.t === 'fishPose') {
          if (!this.remote)
            this.remote = { x: m.x, y: m.y, vx: 0, vy: 0, onGround: true, facing: 1 };
          this.remote.x = m.x;
          this.remote.y = m.y;
          this.racketAng = this.racketAng; // keep local aim untouched
          this.remoteAng = m.a;
          this.remoteReach = m.r;
          this.remote.facing = m.x > WATER_X ? -1 : 1;
        } else if (m.t === 'fishCatch') {
          this.pop(`${link.role === 'host' ? '对方' : '房主'}钓到 ${m.fish} +¥${m.value}`, 0x2a7ad4);
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
    this.stepRacket();
    this.stepFish(dt);
    this.stepPops(dt);
    this.draw();
    this.sendPose(dt);
  }

  // ---- player --------------------------------------------------------------
  private stepPlayer(dt: number): void {
    const k = this.keys;
    const p = this.input.activePointer;
    let dir = 0;
    if (k?.A.isDown || k?.LEFT.isDown) dir -= 1;
    if (k?.D.isDown || k?.RIGHT.isDown) dir += 1;

    if (this.touch && p.isDown) {
      // touch: chase the finger (the jump button is handled below)
      const target = Phaser.Math.Clamp(p.worldX, 60, WATER_X - 40);
      const dx = target - this.me.x;
      if (Math.abs(dx) > 8) dir = Math.sign(dx);
    }

    if (dir !== 0) {
      this.me.vx = dir * PLAYER_SPEED;
      this.me.facing = dir > 0 ? 1 : -1;
    } else {
      this.me.vx *= 0.72;
      if (Math.abs(this.me.vx) < 6) this.me.vx = 0;
    }
    if ((k?.SPACE.isDown || k?.W.isDown || this.jumpPressed()) && this.me.onGround) {
      this.me.vy = PLAYER_JUMP_V;
      this.me.onGround = false;
    }
    this.pointerWasDown = p.isDown;

    this.me.vy += PLAYER_GRAVITY * dt;
    this.me.x = Phaser.Math.Clamp(this.me.x + this.me.vx * dt, 60, WATER_X - 40);
    this.me.y += this.me.vy * dt;
    if (this.me.y >= GROUND_Y) {
      this.me.y = GROUND_Y;
      this.me.vy = 0;
      this.me.onGround = true;
    }
  }

  /** the racket is a rod: head sits between the shoulder and the pointer */
  private stepRacket(): void {
    const p = this.input.activePointer;
    const sx = this.me.x;
    const sy = this.me.y - PLAYER_H * 0.72;
    const maxReach = 80 + this.rodLevel * 14;
    const dx = p.worldX - sx;
    const dy = p.worldY - sy;
    this.reach = Phaser.Math.Clamp(Math.hypot(dx, dy) * 0.9, 34, maxReach);
    this.racketAng = Math.atan2(dy, dx);
    if (Math.abs(this.racketAng) > Math.PI / 2) this.me.facing = -1;
    else this.me.facing = 1;
  }

  /** the on-screen jump button (touch only) */
  private jumpButton(): { x: number; y: number; r: number } {
    return { x: 86, y: GROUND_Y - 66, r: 36 };
  }

  private jumpPressed(): boolean {
    if (!this.touch) return false;
    const p = this.input.activePointer;
    const b = this.jumpButton();
    const inside =
      p.isDown && Phaser.Math.Distance.Between(p.worldX, p.worldY, b.x, b.y) <= b.r;
    // fire on the press edge so holding the button doesn't pogo
    return inside && !this.pointerWasDown;
  }

  private headX(): number {
    return this.me.x + Math.cos(this.racketAng) * this.reach;
  }
  private headY(): number {
    return this.me.y - PLAYER_H * 0.72 + Math.sin(this.racketAng) * this.reach;
  }

  // ---- fish ----------------------------------------------------------------
  private stepFish(dt: number): void {
    this.leapTimer -= dt;
    if (this.leapTimer <= 0) {
      this.leapTimer = 0.9 + Math.random() * 1.4;
      this.spawnFish();
    }

    const hx = this.headX();
    const hy = this.headY();
    const hookR = RACKET_HEAD_R + this.rodLevel * 2;

    for (const f of this.fish) {
      if (f.hooked) {
        f.x = hx;
        f.y = hy;
        continue;
      }
      const speed = Math.hypot(f.vx, f.vy);
      const drag = FISH_DRAG * speed;
      f.vx -= f.vx * drag * dt;
      f.vy -= f.vy * drag * dt;
      f.vy += FISH_GRAVITY * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.flip = f.vx >= 0 ? 1 : -1;

      if (f.y < WATER_Y - 6 && Phaser.Math.Distance.Between(hx, hy, f.x, f.y) < hookR) {
        f.hooked = true;
        this.reelFish = f;
        this.reel = REEL_TIME;
        sfx.hit('drive');
        this.cameras.main.shake(90, 0.004);
        continue;
      }
      // back under the surface: gone
      if (f.y >= WATER_Y + 34) {
        f.alive = false;
        this.splash(f.x, f.kind.color);
      }
    }

    // reeling: hold on the hook a beat, then it is landed
    if (this.reelFish) {
      this.reel -= dt;
      if (this.reel <= 0) {
        const f = this.reelFish;
        f.alive = false;
        this.basket.push(f.kind);
        sfx.point();
        this.pop(`钓到 ${f.kind.name} ¥${f.kind.value}`, f.kind.color);
        this.cfg.session?.send({ t: 'fishCatch', fish: f.kind.name, value: f.kind.value });
        this.reelFish = null;
        this.refreshHud();
      }
    }

    this.fish = this.fish.filter((f) => f.alive);
  }

  private spawnFish(): void {
    const total = FISH_KINDS.reduce((s, k) => s + k.weight, 0);
    let x = Math.random() * total;
    let kind = FISH_KINDS[0];
    for (const k of FISH_KINDS) {
      x -= k.weight;
      if (x <= 0) {
        kind = k;
        break;
      }
    }
    const from = WATER_X + 40 + Math.random() * (WATER_RIGHT - WATER_X - 80);
    const vx = (Math.random() < 0.65 ? -1 : 1) * (120 + Math.random() * 260);
    const vy = -(760 + Math.random() * 420);
    this.fish.push({ kind, x: from, y: WATER_Y + 30, vx, vy, hooked: false, alive: true, flip: 1 });
    this.splash(from, kind.color);
  }

  private splash(x: number, color: number): void {
    sfx.land();
    for (let i = 0; i < 6; i++) {
      const drops = this.add.circle(x, WATER_Y, 2 + Math.random() * 2, color, 0.7);
      this.tweens.add({
        targets: drops,
        y: WATER_Y - 20 - Math.random() * 30,
        x: x + (Math.random() - 0.5) * 40,
        alpha: 0,
        duration: 320 + Math.random() * 200,
        onComplete: () => drops.destroy(),
      });
    }
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
    const value = this.basket.reduce((s, k) => s + k.value, 0);
    this.hud.setText(`鱼篓 ${this.basket.length} 条 · 值 ¥${value}`);
    this.cfg.onBasket?.(this.basket.length, value);
  }

  /** sell everything in the basket; returns the coins earned */
  sellBasket(): number {
    const value = this.basket.reduce((s, k) => s + k.value, 0);
    this.basket = [];
    this.refreshHud();
    return value;
  }

  // ---- networking ----------------------------------------------------------
  private sendPose(dt: number): void {
    if (!this.cfg.session) return;
    this.poseClock -= dt;
    if (this.poseClock > 0) return;
    this.poseClock = 1 / POSE_HZ;
    this.cfg.session.send({
      t: 'fishPose',
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
    g.fillStyle(0xbfe0f5, 1);
    g.fillRect(0, 0, VIEW_W, GROUND_Y);
    g.fillStyle(0x9d7b4f, 1);
    g.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
    g.fillStyle(0x8a6a42, 1);
    g.fillRect(0, GROUND_Y, VIEW_W, 6);

    // pond
    g.fillStyle(0x2f7fae, 0.92);
    g.fillRect(WATER_X, WATER_Y, WATER_RIGHT - WATER_X, GROUND_Y - WATER_Y);
    g.fillStyle(0xbfe6f8, 0.9);
    for (let x = WATER_X; x < WATER_RIGHT; x += 26) {
      const y = WATER_Y + Math.sin((x + this.time.now / 260) / 22) * 2.4;
      g.fillEllipse(x, y, 18, 4);
    }
    g.fillStyle(0x276a94, 1);
    g.fillRect(WATER_X - 4, GROUND_Y - 6, WATER_RIGHT - WATER_X + 8, 6);

    // fish
    for (const f of this.fish) {
      g.fillStyle(f.kind.color, f.y > WATER_Y ? 0.55 : 1);
      g.fillEllipse(f.x, f.y, f.kind.r * 2.4, f.kind.r * 1.4);
      g.fillTriangle(
        f.x - f.flip * f.kind.r * 1.1,
        f.y,
        f.x - f.flip * f.kind.r * 1.9,
        f.y - f.kind.r * 0.7,
        f.x - f.flip * f.kind.r * 1.9,
        f.y + f.kind.r * 0.7,
      );
      g.fillStyle(0x10222e, 1);
      g.fillCircle(f.x + f.flip * f.kind.r * 0.9, f.y - 2, 2);
    }

    this.drawAngler(g, this.me, this.cfg.cosmetic, this.racketAng, this.reach, true);
    if (this.remote)
      this.drawAngler(g, this.remote, this.remoteSkin ?? this.cfg.cosmetic, this.remoteAng, this.remoteReach, false);

    if (this.touch) {
      const b = this.jumpButton();
      const p = this.input.activePointer;
      const on =
        p.isDown && Phaser.Math.Distance.Between(p.worldX, p.worldY, b.x, b.y) <= b.r;
      g.fillStyle(0x1f3a52, on ? 0.5 : 0.28);
      g.fillCircle(b.x, b.y, b.r);
      g.lineStyle(2, 0x1f3a52, 0.6);
      g.strokeCircle(b.x, b.y, b.r);
      g.lineStyle(4, 0x1f3a52, 0.85);
      g.strokeTriangle(b.x - 12, b.y + 10, b.x + 12, b.y + 10, b.x, b.y - 14);
    }
  }

  private drawAngler(
    g: Phaser.GameObjects.Graphics,
    a: Angler,
    cos: Cosmetic,
    ang: number,
    reach: number,
    isMe: boolean,
  ): void {
    // rod line: shoulder → racket head
    const hx = a.x + Math.cos(ang) * reach;
    const hy = a.y - PLAYER_H * 0.72 + Math.sin(ang) * reach;
    g.lineStyle(3, 0x6b5233, 0.95);
    g.lineBetween(a.x, a.y - PLAYER_H * 0.72, hx, hy);

    drawCharacter(
      g,
      this.time.now,
      cos,
      { x: a.x, feetY: a.y, facing: a.facing, color: isMe ? P.player0 : 0xd4902c },
      { face: isMe ? this.face : null },
    );

    g.save();
    g.translateCanvas(hx, hy);
    g.rotateCanvas(ang);
    drawRacketHead(g, this.time.now, cos.racketSkin, racketFrameColor(cos.racketSkin, cos.racket));
    g.restore();
  }
}
