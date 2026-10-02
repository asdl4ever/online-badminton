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
    this.fireballTimer = 2.4;
    this.laserTimer = this.diff.laserEvery;
  }

  create(): void {
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
      isTouchDevice() || joystickAlwaysOn() ? new TouchControls(this) : null;

    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(0.033, delta / 1000);
    if (this.ended) {
      this.stepEnd(dt);
      this.g.clear();
      this.drawBackdrop();
      this.drawGz();
      this.drawHud();
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
    this.rigMe.draw(
      this.charG,
      this.time.now,
      this.cfg.cosmetic,
      { x: this.me.x, feetY: this.me.y, facing: this.me.facing, color: P.player0 },
      this.racketSt.rx,
      this.racketSt.ry,
      0,
      0,
      this.charOverG,
    );

    this.g.clear();
    this.drawBackdrop();
    this.drawGz();
    this.drawFireballs();
    this.drawLaser();
    this.drawHud();
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

  private drawBackdrop(): void {
    const g = this.g;
    // 夜空 + 远山
    g.fillStyle(0x0a1220, 1);
    g.fillRect(0, 0, VIEW_W, VIEW_H);
    g.fillStyle(0x101c2c, 1);
    g.fillTriangle(160, GROUND_Y, 420, GROUND_Y - 220, 680, GROUND_Y);
    g.fillTriangle(520, GROUND_Y, 820, GROUND_Y - 160, 1120, GROUND_Y);
    // 月亮
    g.fillStyle(0xf2ead0, 0.9);
    g.fillCircle(180, 120, 44);
    g.fillStyle(0x0a1220, 1);
    g.fillCircle(198, 108, 40);
    // 地面
    g.fillStyle(0x1c2836, 1);
    g.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
    g.lineStyle(2, 0x2c3e50, 1);
    g.lineBetween(0, GROUND_Y, VIEW_W, GROUND_Y);
  }

  private drawGz(): void {
    if (this.gzAlpha <= 0) return;
    const g = this.g;
    const flash = this.gzFlash > 0;
    if (this.gzFlash > 0) this.gzFlash -= 0.016;
    const body = flash ? 0xd85858 : 0x33584a;
    const dark = flash ? 0xa03838 : 0x24403a;
    const belly = 0x9cc48e;
    const bob = Math.sin(this.time.now / 420) * 3;

    g.setAlpha(this.gzAlpha);
    // 尾巴
    g.fillStyle(dark, 1);
    g.fillEllipse(GZ_X + 90, GROUND_Y - 60 + bob, 150, 34);
    // 身体
    g.fillStyle(body, 1);
    g.fillEllipse(GZ_X, GROUND_Y - 120, 190, 240);
    g.fillStyle(belly, 1);
    g.fillEllipse(GZ_X - 30, GROUND_Y - 110, 90, 170);
    // 背鳍
    for (let k = 0; k < 5; k++) {
      g.fillStyle(dark, 1);
      g.fillTriangle(
        GZ_X + 40,
        GROUND_Y - 60 - k * 36,
        GZ_X + 78,
        GROUND_Y - 92 - k * 36,
        GZ_X + 40,
        GROUND_Y - 110 - k * 36,
      );
    }
    // 头
    g.fillStyle(body, 1);
    g.fillEllipse(GZ_X - 55, GROUND_Y - 268 + bob, 110, 80);
    g.fillStyle(belly, 1);
    g.fillEllipse(GZ_X - 88, GROUND_Y - 250 + bob, 34, 26);
    // 眼
    g.fillStyle(0xffd45c, 1);
    g.fillCircle(GZ_X - 82, GROUND_Y - 284 + bob, 8);
    g.fillStyle(0x1a0c08, 1);
    g.fillCircle(GZ_X - 85, GROUND_Y - 284 + bob, 3.4);
    // 手臂
    g.fillStyle(body, 1);
    g.fillRoundedRect(GZ_X - 80, GROUND_Y - 190, 56, 22, 10);

    // 血条：右上角（哥斯拉头顶上方）
    const bw = 360;
    const bx = VIEW_W - bw - 24;
    const by = 26;
    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(bx - 4, by - 4, bw + 8, 26, 8);
    g.fillStyle(0x2c3e50, 1);
    g.fillRoundedRect(bx, by, bw, 18, 6);
    const frac = Phaser.Math.Clamp(this.hp / this.diff.hits, 0, 1);
    g.fillStyle(flash ? 0xff8a8a : 0xd85858, 1);
    if (frac > 0) g.fillRoundedRect(bx, by, bw * frac, 18, 6);
    g.lineStyle(2, 0xf2ead0, 0.7);
    g.strokeRoundedRect(bx, by, bw, 18, 6);
    g.setAlpha(1);
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
