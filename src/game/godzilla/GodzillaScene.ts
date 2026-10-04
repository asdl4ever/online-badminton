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
import { RacketTracker } from '../racket';
import { TouchControls, isTouchDevice } from '../touch';
import { SCENE_BG_PAD, fitFixedView, onSceneResize } from '../zoom';
import { joystickAlwaysOn } from '../device';
import type { WorldConfig } from '../config';
import type { Cosmetic } from '../cosmetics';
import { GZ_DIFFS, GZ_HEARTS, type GzDifficulty } from '../godzilla';
import { sfx } from '../audio';
import { P } from '../theme';

/**
 * 「哥斯拉来袭」：巨兽站在场右侧，朝玩家吐**火球**（用球拍拍回去砸它扣血）
 * 和**贴地激光**（跳起来躲）。玩家 3 颗心，被激光扫到 / 被火球砸中掉一颗；
 * 哥斯拉血空 = 胜利，心空 = 失败。
 *
 * 操作与矿洞 / 农场同一套：WASD / 摇杆走动跳，鼠标或右摇杆控制球拍，
 * 拍头足够快、朝着火球挥过去就能把它拍回去。
 */
export interface GodzillaSceneCfg {
  difficulty: GzDifficulty;
  cosmetic: Cosmetic;
  /** 挑战结束（win = 击杀成功） */
  onEnd: (win: boolean) => void;
}

interface Fireball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  reflected: boolean;
  dead: boolean;
}

const GRAVITY = 1500;
const WALK = 280;
const JUMP_V = 640;
const GZ_X = 1120;
/** 哥斯拉胸口（火球拍回去的命中点） */
const GZ_CHEST_X = GZ_X - 70;
const GZ_CHEST_Y = GROUND_Y - 190;
const GZ_HIT_R = 110;
const PLAYER_LEFT = 50;
const PLAYER_RIGHT = 880;

export class GodzillaScene extends Phaser.Scene {
  private cfg!: GodzillaSceneCfg;
  private diff = GZ_DIFFS.normal;

  /** 静态背景层（夜空 / 月亮 / 云 / 城市废墟 / 地面）：create 时画一次，不参与每帧重画 */
  private bg!: Phaser.GameObjects.Graphics;
  /** 氛围层（飘云 / 探照灯 / 火场明灭 / 火星）：每帧只重画这几个元素，垫在角色下面 */
  private bgAmb!: Phaser.GameObjects.Graphics;
  private g!: Phaser.GameObjects.Graphics;
  private charG!: Phaser.GameObjects.Graphics;
  /** 帽子/宠物层：在 emoji 头（depth 3）之上 */
  private charOverG!: Phaser.GameObjects.Graphics;
  private rigMe!: PlayerRig;
  private racket = new RacketTracker();
  private touchControls: TouchControls | null = null;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

  private me: { x: number; y: number; vy: number; onGround: boolean; facing: 1 | -1 } = {
    x: 260,
    y: GROUND_Y,
    vy: 0,
    onGround: true,
    facing: 1,
  };
  private racketSt = { rx: 40, ry: -10, rvx: 0, rvy: 0 };
  private racketHead = { x: 0, y: 0 };

  private hp = 1;
  private hearts = GZ_HEARTS;
  private invuln = 0;
  private intro = 3;
  private ended = false;
  private endTimer = -1;
  private gzAlpha = 1;
  private gzFlash = 0;
  /** 张嘴蓄能的高光计时（吐火球 / 激光蓄力时嘴里亮起来） */
  private mouthGlow = 0;
  private fireballs: Fireball[] = [];
  private fireballTimer = 2.4;
  private laserTimer = 6;
  /** laser: -1 无; 0..1 = 蓄力进度; 之后是光束位置 */
  private laserPhase: 'idle' | 'warn' | 'beam' = 'idle';
  private laserT = 0;
  private laserX = 0;
  private readyText!: Phaser.GameObjects.Text;

  constructor() {
    super('GodzillaScene');
  }

  init(cfg: GodzillaSceneCfg): void {
    this.cfg = cfg;
    this.diff = GZ_DIFFS[cfg.difficulty] ?? GZ_DIFFS.normal;
    this.hp = this.diff.hits;
    this.hearts = GZ_HEARTS;
    this.me = { x: 260, y: GROUND_Y, vy: 0, onGround: true, facing: 1 };
    this.fireballs = [];
    this.laserPhase = 'idle';
    this.laserT = 0;
    this.laserX = 0;
    this.intro = 2;
    this.ended = false;
    this.endTimer = -1;
    this.invuln = 0;
    this.gzAlpha = 1;
    this.mouthGlow = 0;
    this.fireballTimer = 2.4;
    this.laserTimer = this.diff.laserEvery;
  }

  create(): void {
    this.bg = this.add.graphics().setDepth(0);
    this.drawBackdrop();
    this.bgAmb = this.add.graphics().setDepth(0.5);
    this.g = this.add.graphics().setDepth(1);
    this.charG = this.add.graphics().setDepth(2);
    this.charOverG = this.add.graphics().setDepth(4);
    this.rigMe = createPlayerRig(this);
    // 开场倒计时：手机上加载慢也能看清再开打
    this.readyText = this.add
      .text(VIEW_W / 2, VIEW_H / 2 - 60, '', {
        fontFamily: 'Arial',
        fontSize: '64px',
        color: '#ffd45c',
        fontStyle: 'bold',
        stroke: '#1a0c08',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(30);

    const kb = this.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys('A,D,W,LEFT,RIGHT,SPACE') as Record<
        string,
        Phaser.Input.Keyboard.Key
      >;
    }
    // 多点触控：走 + 挥拍同时进行
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
    if (this.mouthGlow > 0) this.mouthGlow = Math.max(0, this.mouthGlow - dt * 1.6);
    if (this.ended) {
      this.stepEnd(dt);
      this.g.clear();
      this.charG.clear();
      this.charOverG.clear();
      this.drawAmbient();
      this.drawGz();
      this.drawHud();
      this.touchControls?.draw();
      return;
    }

    this.stepPlayer(dt);
    this.stepRacket(dt);
    this.stepIntro(dt);
    if (this.intro > 0) {
      this.readyText
        .setVisible(true)
        .setText(String(Math.max(1, Math.ceil(this.intro))))
        .setScale(1 + (this.intro % 1) * 0.25);
    }
    this.stepFireballs(dt);
    this.stepLaser(dt);
    this.stepEndcheck(dt);

    this.charG.clear();
    this.charOverG.clear();
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

    this.g.clear();
    this.drawAmbient();
    this.drawGz();
    this.drawFireballs();
    this.drawLaser();
    this.drawHud();
    this.touchControls?.draw();
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

  // ---- 哥斯拉的攻击 --------------------------------------------------------

  private stepIntro(dt: number): void {
    if (this.intro > 0) {
      this.intro -= dt;
      if (this.intro <= 0) {
        // 倒计时归零的那一瞬间：「开战!」闪一下然后隐藏
        this.readyText.setText('开战!').setScale(1.2);
        this.time.delayedCall(600, () => this.readyText.setVisible(false));
      }
      return;
    }
    // 血打空之后的收尾演出里，哥斯拉不再出手（不然赢了还会被火球砸掉心）
    if (this.hp <= 0) return;
    // 火球
    this.fireballTimer -= dt;
    const alive = this.fireballs.filter((b) => !b.dead).length;
    if (this.fireballTimer <= 0 && alive < this.diff.maxFireballs) {
      this.fireballTimer = this.diff.fireballEvery;
      this.spitFireball();
    }
    // 激光
    this.laserTimer -= dt;
    if (this.laserTimer <= 0 && this.laserPhase === 'idle') {
      this.laserTimer = this.diff.laserEvery;
      this.laserPhase = 'warn';
      this.laserT = 0;
      // 蓄力 0.9 秒里嘴里亮着，玩家一看就知道激光要来了
      this.mouthGlow = 0.9;
    }
  }

  private spitFireball(): void {
    // 发射瞬间瞄准玩家当前位置，直线飞过来（不拐弯、不带重力）
    const sx = GZ_X - 60;
    const sy = GROUND_Y - 240;
    const tx = this.me.x;
    const ty = this.me.y - PLAYER_H * 0.45;
    const dx = tx - sx;
    const dy = ty - sy;
    const len = Math.hypot(dx, dy) || 1;
    const speed = this.diff.fireballSpeed;
    this.fireballs.push({
      x: sx,
      y: sy,
      vx: (dx / len) * speed,
      vy: (dy / len) * speed,
      reflected: false,
      dead: false,
    });
    // 嘴里的火光：吐球那一下亮起来，随后衰减
    this.mouthGlow = 0.5;
    sfx.net();
  }

  private hurtPlayer(): void {
    // 开场倒计时期间绝对无敌：手机上加载慢，不能人还没看清就被打死
    if (this.invuln > 0 || this.ended || this.intro > 0) return;
    this.hearts -= 1;
    this.invuln = 1.2;
    sfx.hit('smash');
    this.cameras.main.shake(180, 0.012);
    if (this.hearts <= 0) this.finish(false);
  }

  private stepFireballs(dt: number): void {
    const speedCap = this.diff.fireballSpeed * 1.2;
    const rSpeed = Math.hypot(this.racketSt.rvx, this.racketSt.rvy);
    for (const b of this.fireballs) {
      if (b.dead) continue;
      // 直线飞行（瞄准玩家发射），反弹后也直线飞向哥斯拉
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // 拍头够快、且挥拍方向「朝着火球所在的位置」→ 反弹回哥斯拉。
      // （之前的判定要求拍速与球飞行方向相反——火球从右往左飞、玩家往左迎击
      //   方向相同被误判，所以"明明打中了却不反弹"。）
      const dHead = Phaser.Math.Distance.Between(
        this.racketHead.x,
        this.racketHead.y,
        b.x,
        b.y,
      );
      let swungAtBall = false;
      if (!b.reflected && dHead < 46 && rSpeed > 380) {
        const dirx = (b.x - this.racketHead.x) / dHead;
        const diry = (b.y - this.racketHead.y) / dHead;
        swungAtBall =
          this.racketSt.rvx * dirx + this.racketSt.rvy * diry > 0.2 * rSpeed;
      }
      if (!b.reflected && dHead < 46 && rSpeed > 380 && swungAtBall) {
        const dx = GZ_CHEST_X - b.x;
        const dy = GZ_CHEST_Y - b.y;
        const len = Math.hypot(dx, dy) || 1;
        const sp = Math.min(speedCap * 1.6, Math.max(speedCap, rSpeed * 1.4));
        b.vx = (dx / len) * sp;
        b.vy = (dy / len) * sp;
        b.reflected = true;
        sfx.hit('drive');
        continue;
      }

      // 打到哥斯拉
      if (
        b.reflected &&
        Phaser.Math.Distance.Between(b.x, b.y, GZ_CHEST_X, GZ_CHEST_Y) < GZ_HIT_R
      ) {
        b.dead = true;
        this.hp -= 1;
        this.gzFlash = 0.35;
        sfx.point();
        this.cameras.main.shake(140, 0.008);
        // 血条清空 = 击杀成功：以前这里漏了收尾，血打空了也不结束（`hp` 只减不判）
        if (this.hp <= 0) this.finish(true);
        continue;
      }

      // 砸到玩家（没拍回去的）
      if (!b.reflected) {
        const px = this.me.x;
        const py = this.me.y - PLAYER_H * 0.45;
        if (Phaser.Math.Distance.Between(b.x, b.y, px, py) < 38) {
          b.dead = true;
          this.hurtPlayer();
          continue;
        }
      }

      // 落地：砸得离玩家近也算波及
      if (b.y > GROUND_Y - 10) {
        b.dead = true;
        if (!b.reflected) {
          const d = Math.abs(b.x - this.me.x);
          if (d < 70) this.hurtPlayer();
        }
      }
      if (b.x < -60 || b.x > VIEW_W + 60) b.dead = true;
    }
    this.fireballs = this.fireballs.filter((b) => !b.dead);
  }

  private stepLaser(dt: number): void {
    if (this.laserPhase === 'idle') return;
    this.laserT += dt;
    if (this.laserPhase === 'warn') {
      if (this.laserT > 0.9) {
        this.laserPhase = 'beam';
        this.laserT = 0;
        this.laserX = GZ_X - 80;
        sfx.hit('smash');
      }
      return;
    }
    // 光束贴地往左扫，跳起来躲
    this.laserX -= this.diff.laserSpeed * dt;
    const onBeam =
      Math.abs(this.me.x - this.laserX) < 24 && this.me.y > GROUND_Y - 58;
    if (onBeam) this.hurtPlayer();
    if (this.laserX < -40) this.laserPhase = 'idle';
  }

  private stepEndcheck(dt: number): void {
    if (this.endTimer < 0) return;
    this.endTimer -= dt;
    this.gzAlpha = Math.max(0, this.gzAlpha - dt * 0.8);
    if (this.endTimer <= 0 && !this.ended) {
      this.ended = true;
    }
  }

  private finish(win: boolean): void {
    if (this.endTimer >= 0 || this.ended) return;
    if (win) {
      sfx.win();
      this.cameras.main.shake(600, 0.014);
      this.endTimer = 1.4;
    } else {
      sfx.lose();
      this.endTimer = 0.8;
    }
    this.time.delayedCall((win ? 1.4 : 0.8) * 1000, () => {
      this.cfg.onEnd(win);
    });
  }

  private stepEnd(dt: number): void {
    if (this.invuln > 0) this.invuln -= dt;
  }

  // ---- 绘制 ---------------------------------------------------------------

  /**
   * 静态背景：夜空渐变 → 星空 → 月亮 → 云带 → 燃烧的城市废墟 → 海岸与地面。
   * create 时画一次（会动的部分在 `drawAmbient`）。
   */
  private drawBackdrop(): void {
    const g = this.bg;
    // 多画一圈（pad）：手机横屏比 16:9 更宽时，两侧露的是夜空与地面而不是黑边
    const pad = SCENE_BG_PAD;
    const w = VIEW_W + pad * 2;
    const h = VIEW_H + pad * 2;
    const x0 = -pad;
    const y0 = -pad;

    // ---- 夜空：高空深靛 → 地平线被城市火场烧成暗红 ----
    g.fillStyle(0x060a16, 1);
    g.fillRect(x0, y0, w, h);
    g.fillGradientStyle(0x060a16, 0x060a16, 0x241733, 0x241733, 1, 1, 1, 1);
    g.fillRect(x0, y0, w, GROUND_Y + pad);
    // 地平线上那一圈红光（远处城市在烧）
    g.fillGradientStyle(0x241733, 0x241733, 0x7a2f2c, 0x7a2f2c, 0, 0, 0.9, 0.9);
    g.fillRect(x0, GROUND_Y - 340, w, 340);

    // ---- 星空：大小/亮度各不相同，少数亮星带十字星芒 ----
    for (let i = 0; i < 170; i++) {
      const sx = x0 + rnd(i, 1) * w;
      const sy = y0 + rnd(i, 2) * (GROUND_Y - 300);
      const r = 0.7 + rnd(i, 3) * 1.5;
      g.fillStyle(0xdfe9ff, 0.2 + rnd(i, 4) * 0.55);
      g.fillCircle(sx, sy, r);
      if (rnd(i, 5) > 0.94) {
        g.fillStyle(0xdfe9ff, 0.35);
        g.fillRect(sx - 6, sy - 0.5, 12, 1);
        g.fillRect(sx - 0.5, sy - 6, 1, 12);
      }
    }

    // ---- 月亮：外层光晕（多层薄圈，叠出柔和的晕）→ 月盘 → 环形山 + 边缘微光 ----
    const mx = 210;
    const my = 128;
    for (let k = 9; k >= 1; k--) {
      g.fillStyle(0xdce6ff, 0.022 * (10 - k));
      g.fillCircle(mx, my, 46 + k * 7);
    }
    g.fillStyle(0xf7f1dc, 0.98);
    g.fillCircle(mx, my, 46);
    g.fillStyle(0xded8bf, 0.7);
    g.fillCircle(mx - 15, my - 8, 9);
    g.fillCircle(mx + 10, my + 14, 12);
    g.fillCircle(mx + 22, my - 17, 6);
    g.fillCircle(mx - 4, my + 25, 5);
    g.fillCircle(mx - 26, my + 4, 7);
    // 亮面那侧补一圈边缘光
    g.lineStyle(3, 0xffffff, 0.5);
    g.beginPath();
    g.arc(mx, my, 44, Math.PI * 0.75, Math.PI * 1.6);
    g.strokePath();

    // ---- 云带：几团横向拉开的暗云，底部被火光染红 ----
    const cloud = (cx: number, cy: number, s: number, alpha: number): void => {
      g.fillStyle(0x2c2440, alpha);
      g.fillEllipse(cx, cy, 260 * s, 46 * s);
      g.fillEllipse(cx - 90 * s, cy + 10 * s, 170 * s, 38 * s);
      g.fillEllipse(cx + 100 * s, cy + 6 * s, 190 * s, 34 * s);
      g.fillEllipse(cx + 20 * s, cy - 18 * s, 150 * s, 40 * s);
      g.fillStyle(0x6b3630, alpha * 0.55);
      g.fillEllipse(cx + 10 * s, cy + 20 * s, 210 * s, 22 * s);
    };
    cloud(420, 170, 1.15, 0.75);
    cloud(880, 120, 0.9, 0.6);
    cloud(1180, 215, 1.25, 0.7);
    cloud(60, 300, 1.0, 0.55);

    // ---- 燃烧的城市废墟：三层剪影（越远越淡），破口/断塔/零星窗口灯火 ----
    drawCityLayer(g, x0, w, 0);
    drawCityLayer(g, x0, w, 1);
    drawCityLayer(g, x0, w, 2);

    // ---- 地面：湿沥青 + 裂缝 + 碎石 + 警戒线，近景有反着火光的水洼 ----
    g.fillStyle(0x14161f, 1);
    g.fillRect(x0, GROUND_Y, w, VIEW_H - GROUND_Y + pad);
    g.fillGradientStyle(0x3a2126, 0x3a2126, 0x14161f, 0x14161f, 0.75, 0.75, 1, 1);
    g.fillRect(x0, GROUND_Y, w, 46);
    g.fillStyle(0x232a3a, 1);
    g.fillRect(x0, GROUND_Y, w, 3);
    g.fillStyle(0x39435c, 1);
    g.fillRect(x0, GROUND_Y, w, 1);
    // 地面裂缝
    g.lineStyle(2, 0x090b12, 0.9);
    for (let i = 0; i < 14; i++) {
      let cx = x0 + rnd(i, 11) * w;
      let cy = GROUND_Y + 12 + rnd(i, 12) * 60;
      g.beginPath();
      g.moveTo(cx, cy);
      for (let k = 0; k < 3; k++) {
        cx += (rnd(i * 7 + k, 13) - 0.5) * 70;
        cy += 6 + rnd(i * 7 + k, 14) * 16;
        g.lineTo(cx, cy);
      }
      g.strokePath();
    }
    // 碎石
    for (let i = 0; i < 60; i++) {
      const sx = x0 + rnd(i, 21) * w;
      const sy = GROUND_Y + 6 + rnd(i, 22) * 74;
      g.fillStyle(i % 5 === 0 ? 0x2b3040 : 0x1d212c, 1);
      g.fillRect(sx, sy, 3 + rnd(i, 23) * 9, 2 + rnd(i, 24) * 4);
    }
    // 哥斯拉脚下那一段警戒斜纹（场地边缘被军警拉了带子）
    for (let i = 0; i < 60; i++) {
      const sx = 980 + i * 9;
      if (sx > VIEW_W + pad) break;
      g.fillStyle(i % 2 ? 0xc9a24a : 0x1b1d26, 0.55);
      g.fillTriangle(sx, GROUND_Y + 4, sx + 6, GROUND_Y + 4, sx, GROUND_Y + 14);
    }
    // 远景水洼：映着一片火光
    g.fillStyle(0x8a3a2e, 0.28);
    g.fillEllipse(300, GROUND_Y + 46, 220, 20);
    g.fillStyle(0xb0503a, 0.16);
    g.fillEllipse(880, GROUND_Y + 58, 280, 22);
  }

  /**
   * 每帧重画的**氛围层**：缓慢飘过的云、扫来扫去的军用探照灯、城市里明灭的火光、
   * 以及从地面往上飘的火星。只有几十个图形，开销可以忽略。
   */
  private drawAmbient(): void {
    const g = this.bgAmb;
    g.clear();
    const pad = SCENE_BG_PAD;
    const w = VIEW_W + pad * 2;
    const now = this.time.now;

    // ---- 探照灯：三道冷白光柱在地平线上缓慢摆动 ----
    for (let i = 0; i < 3; i++) {
      const baseX = 180 + i * 380;
      const a = Math.sin(now / (2600 + i * 700) + i) * 0.5;
      const dir = i % 2 === 0 ? 1 : -1;
      const len = 900;
      const tx = baseX + dir * Math.sin(a) * len * 0.8;
      g.fillStyle(0xbfd8ff, 0.06);
      g.fillTriangle(baseX - 26, GROUND_Y - 300, baseX + 26, GROUND_Y - 300, tx, GROUND_Y - 620);
      g.fillStyle(0xbfd8ff, 0.16);
      g.fillCircle(baseX, GROUND_Y - 300, 3.5);
    }

    // ---- 城市火场：贴着废墟根部明灭的小火头（三层由外到内，看着才像在烧）----
    for (let i = 0; i < 12; i++) {
      const fx = 80 + i * 108 + Math.sin(now / 1300 + i * 2) * 6;
      const fy = GROUND_Y - 16 - (i % 3) * 12;
      const pulse = 0.4 + 0.3 * Math.abs(Math.sin(now / (420 + i * 90) + i));
      const s = 1 + (i % 3) * 0.25;
      g.fillStyle(0xff4a12, pulse * 0.16);
      g.fillCircle(fx, fy, 30 * s);
      g.fillStyle(0xff8a3c, pulse * 0.3);
      g.fillCircle(fx, fy - 2, 17 * s);
      g.fillStyle(0xffd07a, pulse * 0.55);
      g.fillCircle(fx, fy - 5, 7 * s);
    }

    // ---- 飘云：比静态云亮一档，缓慢横移后循环 ----
    for (let i = 0; i < 4; i++) {
      const speed = 6 + i * 3;
      const cx = -pad + (((i * 520 + 120 + (now / 1000) * speed) % (w + 500)) - 250);
      const cy = 110 + i * 74;
      const s = 0.85 + i * 0.12;
      g.fillStyle(0x3a2f4e, 0.42);
      g.fillEllipse(cx, cy, 240 * s, 40 * s);
      g.fillEllipse(cx - 80 * s, cy + 9 * s, 160 * s, 32 * s);
      g.fillEllipse(cx + 90 * s, cy + 5 * s, 175 * s, 30 * s);
      g.fillStyle(0x7a4038, 0.2);
      g.fillEllipse(cx, cy + 16 * s, 190 * s, 18 * s);
    }

    // ---- 火星：从地面往上飘，越高越淡 ----
    for (let i = 0; i < 26; i++) {
      const phase = (now / 1000 / 3.2 + i * 0.137) % 1;
      const sx = 60 + ((i * 173) % (VIEW_W + pad * 2)) - pad + Math.sin(now / 700 + i) * 14;
      const sy = GROUND_Y + 30 - phase * 420;
      g.fillStyle(0xffb066, (1 - phase) * 0.5);
      g.fillCircle(sx, sy, 1.4 + (1 - phase) * 1.6);
    }
  }


  /**
   * 哥斯拉本体：侧视厚皮巨兽——粗腿三爪大脚、甩到身后的长尾、一排泛着原子蓝光的
   * 背鳍、分节腹甲、短胳膊，以及吻部 / 上下牙 / 琥珀竖瞳。呼吸与尾巴都在动；
   * 受击瞬间整体泛红，张嘴（吐火球 / 激光蓄力）时嘴里亮起火光。
   */
  private drawGz(): void {
    if (this.gzAlpha <= 0) return;
    const g = this.g;
    const flash = this.gzFlash > 0;
    if (this.gzFlash > 0) this.gzFlash -= 0.016;
    const now = this.time.now;
    const bob = Math.sin(now / 420) * 4;
    const sway = Math.sin(now / 560);
    const breath = Math.sin(now / 520) * 0.5 + 0.5;
    /** 背鳍 / 眼睛的发光强度：受击与张嘴时拉满 */
    const glow = Math.min(1, 0.3 + breath * 0.3 + this.mouthGlow * 0.8);

    // 受击那一下整体泛红
    const body = flash ? 0xd06a5a : 0x416f55;
    const back = flash ? 0xa8483c : 0x2c4d3c;
    const deep = flash ? 0x8a3830 : 0x1b3024;
    const belly = flash ? 0xe6b6a0 : 0xa9cf95;
    const bellyShade = flash ? 0xc89884 : 0x83a874;
    const claw = 0xe8e4d0;
    const eye = flash ? 0xffffff : 0xffc24a;

    const bodyCx = GZ_X + 4;
    const bodyCy = GROUND_Y - 165 + bob;
    const headCx = GZ_X - 90;
    const headCy = GROUND_Y - 292 + bob;

    g.setAlpha(this.gzAlpha);

    // ---- 尾巴：从胯部向右甩出去（分段圆，越远越细），尾尖微微抬起 ----
    const tailN = 9;
    for (let i = tailN; i >= 1; i--) {
      const t = i / tailN;
      const tx = GZ_X + 24 + 205 * t + sway * 24 * t;
      const ty = GROUND_Y - 120 + 98 * t * t + sway * 6 * t;
      g.fillStyle(t > 0.45 ? back : body, 1);
      g.fillCircle(tx, ty, 33 - 26 * t);
    }
    // 尾巴上的背鳍（越往尾尖越小）
    for (let k = 0; k < 4; k++) {
      const t = 0.2 + k * 0.21;
      const tx = GZ_X + 24 + 205 * t + sway * 24 * t;
      const ty = GROUND_Y - 120 + 98 * t * t + sway * 6 * t;
      const s = 26 - k * 4;
      g.fillStyle(deep, 1);
      g.fillTriangle(tx + 4, ty - 4, tx + s, ty - s * 0.75, tx + 6, ty + 6);
      g.fillStyle(0x7fc8f0, 0.2 + glow * 0.35);
      g.fillTriangle(tx + 6, ty - 4, tx + s * 0.8, ty - s * 0.6, tx + 8, ty + 4);
    }

    // ---- 远侧那条腿（压深一档、稍微偏后）----
    g.fillStyle(deep, 1);
    g.fillEllipse(GZ_X + 66, GROUND_Y - 84, 66, 108);
    g.fillRect(GZ_X + 40, GROUND_Y - 62, 54, 60);
    g.fillEllipse(GZ_X + 56, GROUND_Y - 6, 96, 22);
    for (let k = 0; k < 3; k++) {
      g.fillTriangle(
        GZ_X + 20 - k * 18,
        GROUND_Y - 12,
        GZ_X - 6 - k * 18,
        GROUND_Y - 6,
        GZ_X + 20 - k * 18,
        GROUND_Y + 4,
      );
    }

    // ---- 躯干：背侧深、腹侧浅，左半边迎着火光 ----
    g.fillStyle(back, 1);
    g.fillEllipse(bodyCx + 12, bodyCy, 178, 250);
    g.fillStyle(body, 1);
    g.fillEllipse(bodyCx - 4, bodyCy + 2, 160, 240);
    // 腹甲（分节的浅色带）
    g.fillStyle(belly, 1);
    g.fillEllipse(bodyCx - 48, bodyCy + 16, 74, 186);
    g.fillStyle(bellyShade, 0.95);
    for (let k = 0; k < 7; k++) {
      g.fillRoundedRect(bodyCx - 78, bodyCy - 74 + k * 24, 62, 4, 2);
    }
    // 背上的鳞纹（贴着背部轮廓排）
    g.fillStyle(deep, 0.4);
    for (let k = 0; k < 22; k++) {
      const px = bodyCx + 18 + (k % 3) * 26;
      const py = bodyCy - 104 + Math.floor(k / 3) * 26;
      if (px > bodyCx + 78 || py > bodyCy + 106) continue;
      g.fillCircle(px, py, 3.4);
    }
    // 迎着火光那一侧的暖色轮廓光
    g.lineStyle(4, 0xffa04a, 0.14 + breath * 0.06);
    g.strokeEllipse(bodyCx - 4, bodyCy + 2, 160, 240);

    // ---- 背鳍：从脖子一路排到屁股，根部暗、尖端亮 ----
    for (let k = 0; k < 7; k++) {
      const t = k / 6;
      const sx = GZ_X + 62 - t * 46;
      const sy = GROUND_Y - 78 - t * 214 + bob;
      const s = 46 - Math.abs(t - 0.42) * 34;
      g.fillStyle(deep, 1);
      g.fillTriangle(sx - s * 0.7, sy + s * 0.3, sx + s * 0.7, sy + s * 0.3, sx + s * 0.05, sy - s * 0.9);
      g.fillStyle(0x7fc8f0, 0.22 + glow * 0.42);
      g.fillTriangle(sx - s * 0.46, sy + s * 0.24, sx + s * 0.46, sy + s * 0.24, sx + s * 0.05, sy - s * 0.7);
      g.fillStyle(0xeaf8ff, 0.18 + glow * 0.5);
      g.fillTriangle(sx - s * 0.16, sy + s * 0.1, sx + s * 0.2, sy + s * 0.1, sx + s * 0.05, sy - s * 0.46);
    }

    // ---- 近侧腿 + 三爪大脚（脚爪朝玩家这边）----
    g.fillStyle(back, 1);
    g.fillRect(GZ_X - 6, GROUND_Y - 132, 68, 128);
    g.fillStyle(body, 1);
    g.fillEllipse(GZ_X + 26, GROUND_Y - 108, 88, 132);
    g.fillRect(GZ_X - 2, GROUND_Y - 66, 60, 60);
    g.fillStyle(body, 1);
    g.fillEllipse(GZ_X + 6, GROUND_Y - 6, 104, 24);
    g.fillStyle(claw, 1);
    for (let k = 0; k < 3; k++) {
      const cx = GZ_X - 34 - k * 18;
      g.fillTriangle(cx, GROUND_Y - 14, cx - 22, GROUND_Y - 5, cx, GROUND_Y + 5);
    }

    // ---- 脖子 + 头 ----
    g.fillStyle(back, 1);
    g.fillEllipse(GZ_X - 46, GROUND_Y - 246 + bob, 96, 116);
    g.fillStyle(body, 1);
    g.fillEllipse(GZ_X - 58, GROUND_Y - 250 + bob, 88, 108);
    // 头骨 + 前伸的吻部
    g.fillStyle(body, 1);
    g.fillEllipse(headCx, headCy, 132, 104);
    g.fillEllipse(headCx - 56, headCy + 12, 92, 62);
    // 头顶往后的一小截角
    g.fillStyle(back, 1);
    g.fillTriangle(GZ_X - 44, GROUND_Y - 330 + bob, GZ_X - 18, GROUND_Y - 356 + bob, GZ_X - 26, GROUND_Y - 322 + bob);
    g.fillTriangle(GZ_X - 22, GROUND_Y - 342 + bob, GZ_X + 4, GROUND_Y - 362 + bob, GZ_X - 4, GROUND_Y - 330 + bob);
    // 眉骨
    g.fillStyle(deep, 1);
    g.fillTriangle(headCx - 40, headCy - 26, headCx + 6, headCy - 34, headCx - 12, headCy - 4);
    // 上颚 + 嘴缝 + 下颚
    g.fillStyle(body, 1);
    g.fillEllipse(headCx - 60, headCy + 4, 86, 40);
    g.fillStyle(deep, 1);
    g.fillEllipse(headCx - 62, headCy + 24, 84, 10);
    g.fillStyle(body, 1);
    g.fillEllipse(headCx - 56, headCy + 36, 74, 28);
    // 上下两排牙
    g.fillStyle(0xfff6e0, 1);
    for (let k = 0; k < 5; k++) {
      const tx = headCx - 96 + k * 15;
      g.fillTriangle(tx, headCy + 16, tx + 7, headCy + 16, tx + 3.5, headCy + 29);
      g.fillTriangle(tx + 4, headCy + 34, tx + 11, headCy + 34, tx + 7.5, headCy + 22);
    }
    // 琥珀竖瞳（受击变白）+ 高光 + 鼻孔
    g.fillStyle(eye, 1);
    g.fillCircle(headCx - 34, headCy - 18, 9);
    g.fillStyle(flash ? 0xd85858 : 0x1a0c08, 1);
    g.fillRect(headCx - 36, headCy - 26, 4, 16);
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(headCx - 37, headCy - 21, 2.4);
    g.fillStyle(deep, 1);
    g.fillCircle(headCx - 96, headCy - 4, 3);

    // 张嘴蓄能：嘴里的火光（吐火球 / 激光蓄力那 0.9 秒）
    if (this.mouthGlow > 0) {
      const m = Math.min(1, this.mouthGlow * 1.6);
      const mx = headCx - 92;
      const my = headCy + 20;
      g.fillStyle(0xffd07a, 0.25 * m);
      g.fillCircle(mx, my, 46 * m);
      g.fillStyle(0xff8a3c, 0.4 * m);
      g.fillCircle(mx, my, 28 * m);
      g.fillStyle(0xfff2c8, 0.75 * m);
      g.fillCircle(mx, my, 13 * m);
    }

    // ---- 近侧的短胳膊 + 三爪 ----
    g.fillStyle(body, 1);
    g.fillEllipse(GZ_X - 46, GROUND_Y - 224, 62, 40);
    g.fillRoundedRect(GZ_X - 118, GROUND_Y - 222, 76, 26, 12);
    g.fillStyle(claw, 1);
    for (let k = 0; k < 3; k++) {
      const cx = GZ_X - 126 - k * 12;
      g.fillTriangle(cx, GROUND_Y - 214 + k * 8, cx - 20, GROUND_Y - 208 + k * 8, cx, GROUND_Y - 198 + k * 8);
    }

    // ---- 血条：右上角（分段刻度 + 数值）----
    const bw = 360;
    const bx = VIEW_W - bw - 24;
    const by = 26;
    const frac = Phaser.Math.Clamp(this.hp / this.diff.hits, 0, 1);
    g.setAlpha(1);
    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(bx - 4, by - 4, bw + 8, 26, 8);
    g.fillStyle(0x2c3e50, 1);
    g.fillRoundedRect(bx, by, bw, 18, 6);
    g.fillStyle(flash ? 0xff8a8a : 0xd85858, 1);
    if (frac > 0) g.fillRoundedRect(bx, by, bw * frac, 18, 6);
    // 分段刻度（每 5 击一格）
    g.fillStyle(0x0a1220, 0.5);
    const step = bw / this.diff.hits;
    for (let k = 1; k < this.diff.hits; k++) {
      if (k % 5 !== 0) continue;
      g.fillRect(bx + step * k - 0.5, by, 1.5, 18);
    }
    // 被打掉的那截上还压着一层暗红（看得出剩余比例）
    g.lineStyle(2, 0xf2ead0, 0.7);
    g.strokeRoundedRect(bx, by, bw, 18, 6);
    g.fillStyle(0xffd45c, 0.85);
    g.fillRect(bx + bw + 8, by + 4, 4, 10);
  }

  private drawFireballs(): void {
    const g = this.g;
    const now = this.time.now;
    for (const b of this.fireballs) {
      // 拖尾
      for (let k = 1; k <= 4; k++) {
        g.fillStyle(b.reflected ? 0x8fe0ff : 0xff7a2a, 0.3 - k * 0.05);
        g.fillCircle(b.x - b.vx * k * 0.014, b.y - b.vy * k * 0.014, 14 - k * 2);
      }
      const core = b.reflected ? 0xffffff : 0xffd07a;
      const shell = b.reflected ? 0x8fe0ff : 0xff7a2a;
      g.fillStyle(shell, 0.9);
      g.fillCircle(b.x, b.y, 15);
      g.fillStyle(core, 1);
      g.fillCircle(b.x, b.y, 8 + Math.sin(now / 80) * 1.5);
    }
  }

  private drawLaser(): void {
    if (this.laserPhase === 'idle') return;
    const g = this.g;
    if (this.laserPhase === 'warn') {
      // 蓄力警告：哥斯拉嘴前一道攒能量的红线 + 场地右缘的警示条
      const w = Math.min(1, this.laserT / 0.9);
      g.fillStyle(0xd85858, 0.25 + 0.45 * Math.sin(this.time.now / 60) * w);
      g.fillRect(GZ_X - 120, GROUND_Y - 10, 120, 6);
      g.fillStyle(0xffd45c, 0.8);
      g.fillRect(0, 0, VIEW_W * w, 4);
      return;
    }
    // 光束本体：贴地的一整条，外圈红光 + 白芯
    const bx = this.laserX;
    g.fillStyle(0xd85858, 0.35);
    g.fillRect(bx - 34, GROUND_Y - 52, 68, 52);
    g.fillStyle(0xff5a4d, 0.9);
    g.fillRect(bx - 22, GROUND_Y - 42, 44, 42);
    g.fillStyle(0xffffff, 0.85);
    g.fillRect(bx - 8, GROUND_Y - 34, 16, 34);
  }

  private drawHud(): void {
    const g = this.g;
    // 心：左上角
    for (let k = 0; k < GZ_HEARTS; k++) {
      const full = k < this.hearts;
      const blink = this.invuln > 0 && Math.sin(this.time.now / 80) > 0;
      g.fillStyle(full && !blink ? 0xff5a4d : 0x2c3e50, 1);
      const hx = 30 + k * 34;
      const hy = 32;
      g.fillCircle(hx - 7, hy - 3, 8);
      g.fillCircle(hx + 7, hy - 3, 8);
      g.fillTriangle(hx - 15, hy, hx + 15, hy, hx, hy + 18);
    }
    // 难度标签已在 create 里挂成 Text，这里不用再画
  }
}

// ---- 背景用的确定性工具（背景是静态层：每次画出来必须一模一样，不能每帧乱跳）----

/** 确定性伪随机（0~1）：同一个 `i` / `seed` 永远得到同一个值 */
function rnd(i: number, seed = 1): number {
  const v = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

/** 城市剪影的层次参数：越近越高、越黑、窗口越少 */
const CITY_LAYERS = [
  { color: 0x1d2236, hMin: 90, hMax: 200, gap: 26, win: 0.3 },
  { color: 0x151a2b, hMin: 150, hMax: 310, gap: 16, win: 0.26 },
  { color: 0x0b0f1c, hMin: 200, hMax: 430, gap: 6, win: 0.14 },
];

/** 倾斜多边形（倒掉的塔 / 斜撑）：按中心 + 尺寸画一个可以歪的方块 */
function tiltedBlock(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  baseY: number,
  bw: number,
  bh: number,
  skew: number,
): void {
  g.beginPath();
  g.moveTo(cx - bw / 2 - skew, baseY);
  g.lineTo(cx - bw / 2 + skew, baseY - bh);
  g.lineTo(cx + bw / 2 + skew, baseY - bh);
  g.lineTo(cx + bw / 2 - skew, baseY);
  g.closePath();
  g.fillPath();
}

/**
 * 一层城市废墟剪影：连排高楼 + 被砸成锯齿的楼顶 + 零星还亮着的窗口。
 * 最近的那一层另外放两个地标——倒掉的电视塔与断成两截的吊车——让画面有故事感。
 */
function drawCityLayer(
  g: Phaser.GameObjects.Graphics,
  x0: number,
  w: number,
  layer: number,
): void {
  const spec = CITY_LAYERS[layer] ?? CITY_LAYERS[0];
  let x = x0;
  let i = layer * 1000;

  while (x < x0 + w) {
    const bw = spec.gap + rnd(i, 31 + layer) * 74;
    const bh = spec.hMin + rnd(i, 41 + layer) * (spec.hMax - spec.hMin);
    const top = GROUND_Y - bh;

    // 楼体（顶边随机起伏 = 被砸开的破口）
    g.fillStyle(spec.color, 1);
    g.beginPath();
    g.moveTo(x, GROUND_Y);
    g.lineTo(x, top);
    for (let k = 1; k <= 4; k++) {
      g.lineTo(x + (bw * k) / 4, top + (rnd(i * 13 + k, 61) - 0.5) * 24);
    }
    g.lineTo(x + bw, GROUND_Y);
    g.closePath();
    g.fillPath();

    // 楼顶还竖着的那截断旗杆 / 天线
    if (rnd(i, 91) > 0.72) {
      g.fillRect(x + bw * (0.2 + rnd(i, 92) * 0.5), top - 26, 2, 26);
    }

    // 窗口灯火（大部分是黑的，零星橙光 + 偶尔一盏冷白）
    const winW = 4;
    const winH = 5;
    for (let wx = x + 5; wx < x + bw - 7; wx += 11) {
      for (let wy = top + 14; wy < GROUND_Y - 14; wy += 14) {
        const v = rnd(i * 31 + wx * 3 + wy, 71 + layer);
        if (v > 1 - spec.win) {
          g.fillStyle(v > 0.985 ? 0x8fe0ff : 0xff9a4a, 0.35 + rnd(wx + wy, 81) * 0.45);
          g.fillRect(wx, wy, winW, winH);
        }
      }
    }
    x += bw;
    i += 1;
  }

  if (layer !== 2) return;
  // 地标 1：向左倒掉的电视塔（塔身倾斜 + 顶部折了一截）
  g.fillStyle(spec.color, 1);
  const tvx = x0 + w * 0.34;
  tiltedBlock(g, tvx, GROUND_Y, 26, 300, -46);
  tiltedBlock(g, tvx - 60, GROUND_Y - 296, 18, 120, -18);
  // 地标 2：断了臂的吊车（立柱 + 斜出去的那截臂）
  const crx = x0 + w * 0.72;
  g.fillRect(crx, GROUND_Y - 320, 8, 320);
  g.beginPath();
  g.moveTo(crx + 4, GROUND_Y - 320);
  g.lineTo(crx + 150, GROUND_Y - 372);
  g.lineTo(crx + 150, GROUND_Y - 360);
  g.lineTo(crx + 4, GROUND_Y - 308);
  g.closePath();
  g.fillPath();
  // 断掉的一截臂 + 悬着的吊钩
  g.fillRect(crx + 40, GROUND_Y - 300, 96, 7);
  g.fillRect(crx + 128, GROUND_Y - 300, 2, 46);
  g.fillCircle(crx + 129, GROUND_Y - 252, 5);
}
