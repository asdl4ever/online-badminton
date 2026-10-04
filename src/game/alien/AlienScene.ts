import Phaser from 'phaser';
import {
  GROUND_Y,
  PLAYER_H,
  RACKET_MAX,
  RACKET_SMOOTH,
  RACKET_SPEED_CAP,
  RACKET_TELEPORT,
  VIEW_H,
  VIEW_W,
} from '../constants';
import { createPlayerRig, type PlayerRig } from '../draw/rig';
import { drawAlien } from '../draw/character';
import { RacketTracker } from '../racket';
import { TouchControls, isTouchDevice } from '../touch';
import { SCENE_BG_PAD, fitFixedView, onSceneResize } from '../zoom';
import { joystickAlwaysOn } from '../device';
import type { WorldConfig } from '../config';
import type { Cosmetic } from '../cosmetics';
import { ALIEN_DURATION, ALIEN_HEARTS } from '../alien';
import { sfx } from '../audio';
import { P } from '../theme';

/**
 * 「外星人降临」：飞碟在头顶盘旋，不断往下吐**陨石**——每颗里都裹着一个外星人。
 *
 * - 拍中陨石 = 把它击飞、里面的外星人算击败（+1）；
 * - 没拍中的陨石落地 → 外星人着陆，在地上朝你跑，拍到它也算击败（+1）；
 * - 被陨石砸到、或被跑动的外星人碰到，掉 1 颗心；心空提前结束；
 * - 一局 60 秒，时间到按击杀数结算。
 *
 * 操作与矿洞 / 农场 / 哥斯拉同一套：WASD / 摇杆走动跳，鼠标或右摇杆控球拍。
 * 只有真的挥拍才算数（拍头速度够 + 朝目标挥），把拍子贴着陨石没用。
 */
export interface AlienSceneCfg {
  cosmetic: Cosmetic;
  /** 一局结束（kills = 本局击杀数） */
  onEnd: (kills: number) => void;
}

/** 天上的陨石（里面裹着外星人） */
interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  /** 已被击飞 / 已落地 */
  dead: boolean;
}

/** 着陆后在地上跑的外星人 */
interface Goblin {
  x: number;
  y: number;
  facing: 1 | -1;
  alive: boolean;
  /** 距离下一枪还有几秒 */
  fireIn: number;
  /** 刚开完枪的枪口闪光计时（纯视觉） */
  flash: number;
}

/** 落地外星人打出的子弹 */
interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 打中玩家 / 被拍掉 / 飞出画面：下一帧清掉 */
  dead: boolean;
}

// ---- 手感旋钮（改这里就能调难度）----------------------------------------
const GRAVITY = 1150;
const WALK = 300;
const JUMP_V = 660;
const PLAYER_LEFT = 46;
const PLAYER_RIGHT = VIEW_W - 46;
/** 飞碟盘旋的高度与速度 */
const UFO_Y = 132;
const UFO_SPEED = 165;
const UFO_MARGIN = 210;
/** 第一颗陨石的等待时间（秒） */
const SPAWN_FIRST = 1.1;
/**
 * 吐陨石的间隔：开局 SPAWN_SLOW，越往后越快、到最后一刻是 SPAWN_FAST。
 * 用二次曲线（ramp²）而不是线性，前半场体感差不多、**最后 20 秒明显变密**。
 */
const SPAWN_SLOW = 1.35;
const SPAWN_FAST = 0.3;
/** 落地外星人的跑速 */
const GOBLIN_SPEED = 132;
/** 落地后第一枪的等待 / 之后每枪的间隔（秒） */
const FIRE_FIRST = 1.4;
const FIRE_EVERY = 2.6;
/** 子弹速度 / 命中判定半径 */
const BULLET_SPEED = 340;
const BULLET_R = 9;
/** 拍头命中半径：陨石 / 外星人 */
const METEOR_R = 30;
const GOBLIN_R = 26;
/** 算一次有效击打所需的最小拍头速度（px/s） */
const SWING_MIN = 520;
/** 两次击打之间的冷却（秒） */
const HIT_COOLDOWN = 0.16;
/** 被砸到 / 被碰到掉血的判定半径 */
const DAMAGE_R = 40;
const INVULN_S = 1.2;

export class AlienScene extends Phaser.Scene {
  private cfg!: AlienSceneCfg;

  private g!: Phaser.GameObjects.Graphics;
  private charG!: Phaser.GameObjects.Graphics;
  private charOverG!: Phaser.GameObjects.Graphics;
  private rigMe!: PlayerRig;
  private racket = new RacketTracker();
  private touchControls: TouchControls | null = null;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

  private me = {
    x: 260,
    y: GROUND_Y,
    vy: 0,
    onGround: true,
    facing: 1 as 1 | -1,
  };
  private racketSt = { rx: 40, ry: -10, rvx: 0, rvy: 0 };
  private racketHead = { x: 0, y: 0 };
  private hitCooldown = 0;

  private ufoX = VIEW_W / 2;
  private ufoDir: 1 | -1 = 1;
  private spawnTimer = SPAWN_FIRST;
  private elapsed = 0;
  private timeLeft = ALIEN_DURATION;
  private kills = 0;
  private hearts = ALIEN_HEARTS;
  private invuln = 0;
  private intro = 2.5;
  private ended = false;
  private endTimer = -1;

  private meteors: Meteor[] = [];
  private goblins: Goblin[] = [];
  /** 落地外星人打出来的子弹 */
  private bullets: Bullet[] = [];
  /** 被击飞的陨石：只做视觉，飞出去就没了 */
  private flung: { x: number; y: number; vx: number; vy: number; spin: number }[] = [];
  private pops: { text: Phaser.GameObjects.Text; life: number; vy: number }[] = [];

  private readyText!: Phaser.GameObjects.Text;
  private killsText!: Phaser.GameObjects.Text;

  constructor() {
    super('AlienScene');
  }

  init(cfg: AlienSceneCfg): void {
    this.cfg = cfg;
    this.me = { x: 260, y: GROUND_Y, vy: 0, onGround: true, facing: 1 };
    this.racketSt = { rx: 40, ry: -10, rvx: 0, rvy: 0 };
    this.racketHead = { x: 0, y: 0 };
    this.hitCooldown = 0;
    this.ufoX = VIEW_W / 2;
    this.ufoDir = 1;
    this.spawnTimer = SPAWN_FIRST;
    this.elapsed = 0;
    this.timeLeft = ALIEN_DURATION;
    this.kills = 0;
    this.hearts = ALIEN_HEARTS;
    this.invuln = 0;
    this.intro = 2.5;
    this.ended = false;
    this.endTimer = -1;
    this.meteors = [];
    this.goblins = [];
    this.bullets = [];
    this.flung = [];
    this.pops = [];
  }

  create(): void {
    this.g = this.add.graphics().setDepth(1);
    this.charG = this.add.graphics().setDepth(2);
    this.charOverG = this.add.graphics().setDepth(4);
    this.rigMe = createPlayerRig(this);

    this.readyText = this.add
      .text(VIEW_W / 2, VIEW_H / 2 - 60, '', {
        fontFamily: 'Arial',
        fontSize: '64px',
        color: '#9ceeb8',
        fontStyle: 'bold',
        stroke: '#0a1230',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(30);

    // 右上角的击杀数（Graphics 画数字不划算，挂一个 Text）
    this.killsText = this.add
      .text(VIEW_W - 87, 76, '', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#dfe9ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(26);

    const kb = this.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys('A,D,W,LEFT,RIGHT,SPACE') as Record<
        string,
        Phaser.Input.Keyboard.Key
      >;
    }
    this.input.addPointer(3);
    this.touchControls =
      isTouchDevice() || joystickAlwaysOn() ? new TouchControls() : null;

    // 画面铺满：等比放大到铺满容器并居中（多余的一圈露的是背景，不做拉伸）
    const fit = () => fitFixedView(this);
    fit();
    onSceneResize(this, fit);

    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(0.033, delta / 1000);

    if (!this.ended) {
      this.stepPlayer(dt);
      this.stepRacket(dt);
      this.stepIntro(dt);
      if (this.intro <= 0) {
        this.elapsed += dt;
        this.timeLeft -= dt;
        this.stepUfo(dt);
        this.stepMeteors(dt);
        this.stepGoblins(dt);
        this.stepBullets(dt);
        this.stepFlung(dt);
        this.stepHits(dt);
        if (this.timeLeft <= 0) {
          this.timeLeft = 0;
          this.finish();
        }
      }
    } else if (this.endTimer > 0) {
      this.endTimer -= dt;
    }

    this.stepPops(dt);
    this.draw();
  }

  // ---- 玩家 --------------------------------------------------------------

  private stepPlayer(dt: number): void {
    const k = this.keys;
    const t = this.touchControls?.read();
    const left = k?.A.isDown || k?.LEFT.isDown || !!t?.left;
    const right = k?.D.isDown || k?.RIGHT.isDown || !!t?.right;
    const jump = k?.W.isDown || k?.SPACE.isDown || !!t?.jump;

    if (left && !right) {
      this.me.x -= WALK * dt;
      this.me.facing = -1;
    } else if (right && !left) {
      this.me.x += WALK * dt;
      this.me.facing = 1;
    }
    this.me.x = Phaser.Math.Clamp(this.me.x, PLAYER_LEFT, PLAYER_RIGHT);

    if (jump && this.me.onGround) {
      this.me.vy = -JUMP_V;
      this.me.onGround = false;
      sfx.hit('lift');
    }
    this.me.vy += GRAVITY * dt;
    this.me.y += this.me.vy * dt;
    if (this.me.y >= GROUND_Y) {
      this.me.y = GROUND_Y;
      this.me.vy = 0;
      this.me.onGround = true;
    }

    if (this.invuln > 0) this.invuln -= dt;
  }

  private shoulder(): { x: number; y: number } {
    return { x: this.me.x, y: this.me.y - PLAYER_H * 0.55 };
  }

  private stepRacket(dt: number): void {
    const sh = this.shoulder();
    let tx: number;
    let ty: number;
    let freeze: boolean;
    const tc = this.touchControls;
    if (tc) {
      tx = sh.x + tc.joyX * RACKET_MAX;
      ty = sh.y + tc.joyY * RACKET_MAX;
      freeze = !tc.joyActive;
    } else {
      const p = this.input.activePointer;
      tx = p.worldX;
      ty = p.worldY;
      freeze = false;
    }
    const cfg = {
      racketMax: RACKET_MAX,
      racketTeleport: RACKET_TELEPORT,
      racketSpeedCap: RACKET_SPEED_CAP,
      racketSmooth: RACKET_SMOOTH,
    } as unknown as WorldConfig;
    const st = this.racket.update(tx, ty, sh.x, sh.y, dt, freeze, cfg);
    this.racketSt = st;
    this.racketHead.x = sh.x + st.rx;
    this.racketHead.y = sh.y + st.ry;
  }

  private stepIntro(dt: number): void {
    if (this.intro <= 0) return;
    this.intro -= dt;
    if (this.intro <= 0) {
      this.readyText.setText('开战!').setScale(1.2);
      this.time.delayedCall(600, () => this.readyText.setVisible(false));
    } else {
      this.readyText
        .setVisible(true)
        .setText(String(Math.max(1, Math.ceil(this.intro))))
        .setScale(1 + (this.intro % 1) * 0.25);
    }
  }

  // ---- 飞碟与陨石 --------------------------------------------------------

  private stepUfo(dt: number): void {
    this.ufoX += this.ufoDir * UFO_SPEED * dt;
    if (this.ufoX > VIEW_W - UFO_MARGIN) {
      this.ufoX = VIEW_W - UFO_MARGIN;
      this.ufoDir = -1;
    } else if (this.ufoX < UFO_MARGIN) {
      this.ufoX = UFO_MARGIN;
      this.ufoDir = 1;
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    // 越到后面掉得越密（二次曲线：最后 20 秒最凶）
    const ramp = Phaser.Math.Clamp(this.elapsed / ALIEN_DURATION, 0, 1);
    this.spawnTimer = SPAWN_SLOW + (SPAWN_FAST - SPAWN_SLOW) * ramp * ramp;
    this.spitMeteor();
  }

  private spitMeteor(): void {
    const sx = this.ufoX;
    const sy = UFO_Y + 26;
    // 落点瞄着玩家、带一点随机，横着飞过去再落下
    const targetX = Phaser.Math.Clamp(
      this.me.x + Phaser.Math.Between(-150, 150),
      70,
      VIEW_W - 70,
    );
    this.meteors.push({
      x: sx,
      y: sy,
      vx: Phaser.Math.Clamp((targetX - sx) * 0.75, -330, 330),
      vy: 40,
      spin: Math.random() * Math.PI * 2,
      dead: false,
    });
    sfx.net();
  }

  private stepMeteors(dt: number): void {
    for (const m of this.meteors) {
      if (m.dead) continue;
      m.vy += GRAVITY * dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.spin += dt * 6;

      // 砸到玩家
      if (this.toPlayer(m.x, m.y) < DAMAGE_R) {
        m.dead = true;
        this.hurtPlayer();
        continue;
      }
      // 落地 → 里面的外星人爬出来
      if (m.y >= GROUND_Y - METEOR_R * 0.4) {
        m.dead = true;
        this.goblins.push({
          x: Phaser.Math.Clamp(m.x, 60, VIEW_W - 60),
          y: GROUND_Y,
          facing: m.x < this.me.x ? 1 : -1,
          alive: true,
          // 落地后喘口气才开枪，给玩家一点反应时间
          fireIn: FIRE_FIRST + Math.random() * 0.5,
          flash: 0,
        });
        sfx.land();
      }
    }
    this.meteors = this.meteors.filter((m) => !m.dead);
    this.goblins = this.goblins.filter((g) => g.alive);
  }

  private stepGoblins(dt: number): void {
    for (const g of this.goblins) {
      const dir = this.me.x > g.x ? 1 : -1;
      g.facing = dir;
      g.x += dir * GOBLIN_SPEED * dt;
      g.y = GROUND_Y;
      if (g.flash > 0) g.flash -= dt;

      // 一边靠近一边朝玩家点射
      g.fireIn -= dt;
      if (g.fireIn <= 0) {
        g.fireIn = FIRE_EVERY;
        this.shootAtPlayer(g);
      }

      if (this.toPlayer(g.x, GROUND_Y - PLAYER_H * 0.4) < DAMAGE_R + 10) {
        g.alive = false;
        this.hurtPlayer();
      }
    }
  }

  /** 落地外星人朝玩家打一发（枪口在它胸口高度，带一点点散布） */
  private shootAtPlayer(g: Goblin): void {
    const sx = g.x + g.facing * 10;
    const sy = GROUND_Y - PLAYER_H * 0.62;
    const tx = this.me.x;
    const ty = this.me.y - PLAYER_H * 0.5;
    const ang = Math.atan2(ty - sy, tx - sx) + (Math.random() - 0.5) * 0.16;
    this.bullets.push({
      x: sx,
      y: sy,
      vx: Math.cos(ang) * BULLET_SPEED,
      vy: Math.sin(ang) * BULLET_SPEED,
      dead: false,
    });
    g.flash = 0.12;
    // 比拍球的「drive」更闷一点，听得出这是它开枪
    sfx.hit('clear');
  }

  private stepBullets(dt: number): void {
    for (const b of this.bullets) {
      if (b.dead) continue;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      // 打中玩家：掉一颗心
      if (this.toPlayer(b.x, b.y) < DAMAGE_R - 6) {
        b.dead = true;
        this.hurtPlayer();
        continue;
      }
      if (b.x < -40 || b.x > VIEW_W + 40 || b.y < -40 || b.y > VIEW_H + 40) b.dead = true;
    }
    this.bullets = this.bullets.filter((b) => !b.dead);
  }

  private toPlayer(x: number, y: number): number {
    return Math.hypot(x - this.me.x, y - (this.me.y - PLAYER_H * 0.45));
  }

  private hurtPlayer(): void {
    if (this.invuln > 0 || this.ended || this.intro > 0) return;
    this.hearts -= 1;
    this.invuln = INVULN_S;
    sfx.hit('smash');
    this.cameras.main.shake(180, 0.012);
    if (this.hearts <= 0) {
      this.hearts = 0;
      this.finish();
    }
  }

  // ---- 挥拍命中 ----------------------------------------------------------

  private stepHits(dt: number): void {
    if (this.hitCooldown > 0) this.hitCooldown -= dt;
    if (this.hitCooldown > 0) return;

    const hx = this.racketHead.x;
    const hy = this.racketHead.y;
    const speed = Math.hypot(this.racketSt.rvx, this.racketSt.rvy);
    if (speed < SWING_MIN) return;

    // 飞来的子弹：拍掉它（不给分，但能保命）——最紧急，先判
    for (const b of this.bullets) {
      if (b.dead) continue;
      if (Math.hypot(b.x - hx, b.y - hy) > BULLET_R + 30) continue;
      const closing = this.racketSt.rvx * (b.x - hx) + this.racketSt.rvy * (b.y - hy);
      if (closing <= 0) continue;
      b.dead = true;
      this.hitCooldown = HIT_COOLDOWN * 0.6;
      sfx.hit('drive');
      return;
    }

    // 天上的陨石：拍中就算击飞（外星人一起被干掉）
    for (const m of this.meteors) {
      if (m.dead) continue;
      if (Math.hypot(m.x - hx, m.y - hy) > METEOR_R + 26) continue;
      const closing = this.racketSt.rvx * (m.x - hx) + this.racketSt.rvy * (m.y - hy);
      if (closing <= 0) continue;
      m.dead = true;
      // 朝球拍指的方向飞出去
      this.spawnFlyingRock(m.x, m.y, Math.atan2(this.racketSt.ry, this.racketSt.rx));
      this.countKill(m.x, m.y);
      return;
    }

    // 地上的外星人：同样的判据
    for (const g of this.goblins) {
      if (!g.alive) continue;
      const gy = g.y - PLAYER_H * 0.5;
      if (Math.hypot(g.x - hx, gy - hy) > GOBLIN_R + 30) continue;
      const closing = this.racketSt.rvx * (g.x - hx) + this.racketSt.rvy * (gy - hy);
      if (closing <= 0) continue;
      g.alive = false;
      this.countKill(g.x, gy);
      return;
    }
  }

  /** 被击飞的陨石：只做视觉，往斜上方飞出去、掉出画面就没了 */
  private spawnFlyingRock(x: number, y: number, ang: number): void {
    this.flung.push({
      x,
      y,
      vx: Math.cos(ang) * 560,
      vy: Math.sin(ang) * 560 - 140,
      spin: Math.random() * Math.PI * 2,
    });
  }

  private stepFlung(dt: number): void {
    for (const f of this.flung) {
      f.vy += GRAVITY * 0.5 * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.spin += dt * 10;
    }
    this.flung = this.flung.filter(
      (f) => f.x > -120 && f.x < VIEW_W + 120 && f.y < VIEW_H + 120,
    );
  }

  private countKill(x: number, y: number): void {
    this.kills += 1;
    this.hitCooldown = HIT_COOLDOWN;
    sfx.hit('smash');
    this.cameras.main.shake(110, 0.006);
    this.spawnPop(x, y, `+1`, 0x9ceeb8);
  }

  private spawnPop(x: number, y: number, text: string, color: number): void {
    const t = this.add
      .text(x, y - 20, text, {
        fontFamily: 'Arial',
        fontSize: '30px',
        color: `#${color.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold',
        stroke: '#0a1230',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(25);
    this.pops.push({ text: t, life: 0.8, vy: -70 });
  }

  private stepPops(dt: number): void {
    for (const p of this.pops) {
      p.life -= dt;
      p.text.y += p.vy * dt;
      p.text.setAlpha(Math.max(0, p.life / 0.8));
    }
    for (const p of this.pops) if (p.life <= 0) p.text.destroy();
    this.pops = this.pops.filter((p) => p.life > 0);
  }

  private finish(): void {
    if (this.ended) return;
    this.ended = true;
    this.endTimer = 1.4;
    sfx.point();
    this.time.delayedCall(1400, () => this.cfg.onEnd(this.kills));
  }

  // ---- 绘制 --------------------------------------------------------------

  private draw(): void {
    const g = this.g;
    g.clear();
    this.charG.clear();
    this.charOverG.clear();

    this.drawBackdrop();
    this.drawUfo();
    this.drawMeteors();
    this.drawGoblins();
    this.drawBullets();

    this.rigMe.draw(
      this.charG,
      this.time.now,
      this.cfg.cosmetic,
      { x: this.me.x, feetY: this.me.y, facing: this.me.facing, color: P.player0 },
      this.racketSt.rx,
      this.racketSt.ry,
      Math.hypot(this.racketSt.rvx, this.racketSt.rvy),
      0,
      this.charOverG,
      this.racket.path.pts,
    );

    this.drawHud();
    this.touchControls?.draw();
  }

  private drawBackdrop(): void {
    const g = this.g;
    // 多画一圈（pad）：手机横屏比 16:9 更宽时，两侧露的是夜空与地面而不是黑边
    const pad = SCENE_BG_PAD;
    const w = VIEW_W + pad * 2;
    // 夜空 + 星
    g.fillStyle(0x080f22, 1);
    g.fillRect(-pad, -pad, w, VIEW_H + pad * 2);
    for (let k = 0; k < 40; k++) {
      const sx = ((k * 137) % VIEW_W) + ((k * 53) % 7);
      const sy = ((k * 89) % (GROUND_Y - 40)) + 12;
      const tw = 0.35 + 0.45 * Math.abs(Math.sin(this.time.now / 900 + k));
      g.fillStyle(0xdfe9ff, tw);
      g.fillCircle(sx, sy, k % 5 === 0 ? 1.8 : 1.1);
    }
    // 远处的星环（异星地貌）
    g.fillStyle(0x1a2340, 1);
    g.fillTriangle(120, GROUND_Y, 440, GROUND_Y - 210, 760, GROUND_Y);
    g.fillTriangle(620, GROUND_Y, 940, GROUND_Y - 150, 1260, GROUND_Y);
    g.lineStyle(3, 0x3a4a7a, 0.55);
    g.strokeEllipse(VIEW_W / 2, 300, 900, 120);
    // 地面
    g.fillStyle(0x16203a, 1);
    g.fillRect(-pad, GROUND_Y, w, VIEW_H - GROUND_Y + pad);
    g.lineStyle(2, 0x2c3e60, 1);
    g.lineBetween(-pad, GROUND_Y, VIEW_W + pad, GROUND_Y);
  }

  private drawUfo(): void {
    const g = this.g;
    const x = this.ufoX;
    const y = UFO_Y + Math.sin(this.time.now / 600) * 6;
    const bob = Math.sin(this.time.now / 400);

    // 朝下的绿色探测光（提示它正在撒东西）
    g.fillStyle(0x6fe09a, 0.1 + 0.05 * bob);
    g.beginPath();
    g.moveTo(x - 34, y + 22);
    g.lineTo(x + 34, y + 22);
    g.lineTo(x + 150, GROUND_Y);
    g.lineTo(x - 150, GROUND_Y);
    g.closePath();
    g.fillPath();
    // 碟身
    g.fillStyle(0x8fa6b8, 1);
    g.fillEllipse(x, y + 10, 210, 44);
    g.fillStyle(0x9fd8e8, 1);
    g.fillEllipse(x, y - 4, 190, 38);
    g.fillStyle(0xd8e6f0, 0.92);
    g.fillEllipse(x, y - 12, 120, 22);
    // 玻璃罩 + 里面那只外星人
    g.fillStyle(0x9fe8ff, 0.3);
    g.fillCircle(x, y - 40, 40);
    g.fillStyle(0x6fe09a, 1);
    g.fillEllipse(x, y - 36, 34, 44);
    g.fillStyle(0x0e1a14, 1);
    g.fillEllipse(x - 9, y - 43, 12, 16);
    g.fillEllipse(x + 9, y - 43, 12, 16);
    g.lineStyle(3, 0xd8e6f0, 0.8);
    g.strokeCircle(x, y - 40, 40);
    // 一圈交替闪的灯
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2 + this.time.now / 260;
      g.fillStyle(k % 2 ? 0xffd45c : 0x6fe09a, 0.9);
      g.fillCircle(x + Math.cos(a) * 96, y + 8 + Math.sin(a) * 18, 4);
    }
  }

  private drawMeteors(): void {
    const g = this.g;
    for (const m of this.meteors) {
      // 尾焰
      g.fillStyle(0xff8a3c, 0.5);
      g.fillCircle(m.x - m.vx * 0.03, m.y - m.vy * 0.03, METEOR_R * 0.62);
      g.fillStyle(0xffd07a, 0.7);
      g.fillCircle(m.x - m.vx * 0.015, m.y - m.vy * 0.015, METEOR_R * 0.45);
      // 岩体
      g.fillStyle(0x5a606c, 1);
      g.fillCircle(m.x, m.y, METEOR_R);
      g.fillStyle(0x3f4550, 1);
      for (let k = 0; k < 5; k++) {
        const a = m.spin + k * 1.26;
        g.fillCircle(m.x + Math.cos(a) * 11, m.y + Math.sin(a) * 10, 5);
      }
      // 裹在里面的外星人透出一点绿
      g.fillStyle(0x6fe09a, 0.5 + 0.25 * Math.sin(this.time.now / 200));
      g.fillCircle(m.x, m.y, METEOR_R * 0.34);
    }
    // 被击飞的那几块：拖一条火尾飞走
    for (const f of this.flung) {
      g.fillStyle(0xffa04a, 0.45);
      g.fillCircle(f.x - f.vx * 0.04, f.y - f.vy * 0.04, METEOR_R * 0.66);
      g.fillStyle(0x6a707c, 1);
      g.fillCircle(f.x, f.y, METEOR_R * 0.7);
      g.fillStyle(0x9ceeb8, 0.7);
      g.fillCircle(f.x, f.y, METEOR_R * 0.3);
    }
  }

  private drawGoblins(): void {
    const g = this.g;
    for (const gob of this.goblins) {
      if (!gob.alive) continue;
      g.save();
      g.translateCanvas(gob.x, gob.y);
      g.scaleCanvas(0.62, 0.62);
      drawAlien(
        g,
        this.time.now,
        { x: 0, feetY: 0, facing: gob.facing, color: 0x6fe09a },
      );
      g.restore();
      // 枪口闪光：开完枪的一瞬间在胸前亮一下
      if (gob.flash > 0) {
        g.fillStyle(0xd8fff0, gob.flash * 6);
        g.fillCircle(gob.x + gob.facing * 22, GROUND_Y - PLAYER_H * 0.62, 9);
      }
    }
  }

  /** 子弹：幽绿的弹丸 + 一小截拖尾 */
  private drawBullets(): void {
    const g = this.g;
    for (const b of this.bullets) {
      if (b.dead) continue;
      g.fillStyle(0x6fe09a, 0.28);
      g.fillCircle(b.x - b.vx * 0.02, b.y - b.vy * 0.02, BULLET_R + 3);
      g.fillStyle(0x9ceeb8, 0.85);
      g.fillCircle(b.x, b.y, BULLET_R * 0.7);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(b.x, b.y, BULLET_R * 0.32);
    }
  }

  private drawHud(): void {
    const g = this.g;
    // 心：左上角
    for (let k = 0; k < ALIEN_HEARTS; k++) {
      const full = k < this.hearts;
      const blink = this.invuln > 0 && Math.sin(this.time.now / 80) > 0;
      g.fillStyle(full && !blink ? 0xff5a4d : 0x2c3e50, 1);
      const hx = 30 + k * 34;
      const hy = 32;
      g.fillCircle(hx - 7, hy - 3, 8);
      g.fillCircle(hx + 7, hy - 3, 8);
      g.fillTriangle(hx - 15, hy, hx + 15, hy, hx, hy + 18);
    }
    // 计时条（顶部中间）
    const bw = 420;
    const bx = VIEW_W / 2 - bw / 2;
    const frac = Phaser.Math.Clamp(this.timeLeft / ALIEN_DURATION, 0, 1);
    g.fillStyle(0x000000, 0.45);
    g.fillRoundedRect(bx - 4, 18, bw + 8, 24, 8);
    g.fillStyle(0x24406a, 1);
    g.fillRoundedRect(bx, 22, bw, 16, 6);
    g.fillStyle(frac > 0.25 ? 0x6fe09a : 0xff8a8a, 1);
    if (frac > 0) g.fillRoundedRect(bx, 22, bw * frac, 16, 6);

    // 击杀数（右上）
    g.fillStyle(0x000000, 0.45);
    g.fillRoundedRect(VIEW_W - 150, 56, 126, 40, 10);
    this.killsText.setText(`🛸 ${this.kills}`);
  }
}
