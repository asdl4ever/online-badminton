import Phaser from 'phaser';
import {
  CONTACT_R,
  COURT_LEFT,
  COURT_RIGHT,
  GROUND_Y,
  NET_TICK_HZ,
  NET_X,
  NET_INPUT_HZ,
  PLAYER_H,
  RACKET_MAX,
  VIEW_H,
  VIEW_W,
} from '../constants';
import type { SimEvent } from '../types';
import {
  EMPTY_INPUT,
  type MatchRole,
  type PlayerInput,
  type PlayerState,
  type World,
} from '../types';
import {
  applySnapshot,
  createWorld,
  lerpWorld,
  racketHead,
  serializeWorld,
  shoulderPoint,
  stepPlayerLocal,
  stepWorld,
} from '../simulation';
import { AIController, type Difficulty } from '../ai';
import { createControls, readControls, type ControlKeys } from '../input';
import { RacketTracker } from '../racket';
import { TouchControls, enterMobileFullscreen, isTouchDevice } from '../touch';
import type { NetLink, NetMessage } from '../../net/link';

export interface HudState {
  score: [number, number];
  phase: World['phase'];
  winner: number;
  localIndex: 0 | 1;
  roomCode: string;
  opponentConnected: boolean;
  server: 0 | 1;
}

export interface MatchConfig {
  role: MatchRole;
  difficulty: Difficulty;
  session: NetLink | null;
  onHud: (state: HudState) => void;
  onDisconnect: (message: string) => void;
  onEvent: (event: SimEvent) => void;
}

const FIXED_DT = 1 / 60;
const MAX_ACCUM = 0.25;

export class GameScene extends Phaser.Scene {
  private cfg!: MatchConfig;
  private world!: World;
  private target!: World;
  private controls!: ControlKeys;
  private ai!: AIController;
  private racket!: RacketTracker;
  private touchControls: TouchControls | null = null;
  private touchAsked = false;

  private accum = 0;
  private netAccum = 0;
  private remoteInput: PlayerInput = { ...EMPTY_INPUT };
  private hasSnapshot = false;
  private lastHud = '';
  private trail: { x: number; y: number }[] = [];
  private flashes: { x: number; y: number; life: number }[] = [];
  private tmp = new Phaser.Math.Vector2();

  private dynamic!: Phaser.GameObjects.Graphics;
  private scoreLeft!: Phaser.GameObjects.Text;
  private scoreRight!: Phaser.GameObjects.Text;
  private message!: Phaser.GameObjects.Text;
  private subMessage!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  init(data: MatchConfig | undefined): void {
    this.cfg = data ?? (this.game.registry.get('matchConfig') as MatchConfig);
    this.world = createWorld();
    this.target = createWorld();
    this.accum = 0;
    this.netAccum = 0;
    this.hasSnapshot = false;
    this.remoteInput = { ...EMPTY_INPUT };
    this.lastHud = '';
    this.trail = [];
    this.flashes = [];
  }

  create(): void {
    this.controls = createControls(this);
    this.ai = new AIController(this.cfg.difficulty, 1);
    this.racket = new RacketTracker();
    this.input.keyboard?.addCapture('UP,DOWN,LEFT,RIGHT,W,A,S,D');
    this.input.mouse?.disableContextMenu();

    const bg = this.add.graphics();
    this.drawCourt(bg);

    this.dynamic = this.add.graphics();

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold',
    };
    this.scoreLeft = this.add.text(VIEW_W / 2 - 90, 40, '0', style).setOrigin(0.5, 0);
    this.scoreRight = this.add.text(VIEW_W / 2 + 90, 40, '0', style).setOrigin(0.5, 0);
    this.message = this.add
      .text(VIEW_W / 2, VIEW_H / 2 - 110, '', {
        fontFamily: 'Segoe UI, Arial, sans-serif',
        fontSize: '44px',
        color: '#ffe066',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.subMessage = this.add
      .text(VIEW_W / 2, VIEW_H / 2 - 46, '', {
        fontFamily: 'Segoe UI, Arial, sans-serif',
        fontSize: '24px',
        color: '#d9f2ff',
      })
      .setOrigin(0.5);

    const session = this.cfg.session;
    if (session) {
      session.onMessage = (m) => this.handleNetMessage(m);
      session.onDisconnected = () => this.cfg.onDisconnect('连接已断开');
      session.onError = (message) => this.cfg.onDisconnect(message);
    }

    this.input.keyboard?.on('keydown-R', () => this.requestRematch());

    if (isTouchDevice()) {
      this.input.addPointer(3);
      this.touchControls = new TouchControls(this);
      // the HTML bar overlays the top of the canvas, so drop the score below it
      this.scoreLeft.setY(126);
      this.scoreRight.setY(126);
      this.input.on('pointerdown', () => {
        if (this.touchAsked) return;
        this.touchAsked = true;
        void enterMobileFullscreen();
      });
      this.events.once('shutdown', () => {
        this.touchControls?.destroy();
        this.touchControls = null;
      });
    }
  }

  private handleNetMessage(m: NetMessage): void {
    if (m.t === 'input' && this.cfg.role === 'host') {
      this.remoteInput = m.i;
    } else if (m.t === 'snap' && this.cfg.role === 'guest') {
      applySnapshot(this.target, m.s);
      this.hasSnapshot = true;
    } else if (m.t === 'rematch') {
      this.resetWorld();
    }
  }

  private resetWorld(): void {
    this.world = createWorld();
    this.target = createWorld();
    this.hasSnapshot = false;
    this.racket.reset();
    this.touchControls?.reset();
    this.publishHud(true);
  }

  private requestRematch(): void {
    if (this.world.phase !== 'gameover') return;
    if (this.cfg.role === 'guest') {
      this.cfg.session?.send({ t: 'rematch' });
      return;
    }
    if (this.cfg.role === 'host') this.cfg.session?.send({ t: 'rematch' });
    this.resetWorld();
  }

  private localIndex(): 0 | 1 {
    return this.cfg.role === 'guest' ? 1 : 0;
  }

  private buildLocalInput(dt: number): PlayerInput {
    const p = this.world.players[this.localIndex()];
    const shoulder = shoulderPoint(p);

    let racket;
    let buttons: { left: boolean; right: boolean; jump: boolean };

    if (this.touchControls) {
      const tc = this.touchControls;
      const targetX = shoulder.x + tc.joyX * RACKET_MAX;
      const targetY = shoulder.y + tc.joyY * RACKET_MAX;
      // while the stick is released the racket snaps home -- that return motion
      // must not be read as a swing, so freeze the measured velocity
      racket = this.racket.update(targetX, targetY, shoulder.x, shoulder.y, dt, !tc.joyActive);
      buttons = tc.read();
    } else {
      const pointer = this.input.activePointer;
      this.cameras.main.getWorldPoint(pointer.x, pointer.y, this.tmp);
      racket = this.racket.update(this.tmp.x, this.tmp.y, shoulder.x, shoulder.y, dt);
      buttons = readControls(this.controls);
    }

    return {
      left: buttons.left,
      right: buttons.right,
      jump: buttons.jump,
      rx: racket.rx,
      ry: racket.ry,
      rvx: racket.rvx,
      rvy: racket.rvy,
    };
  }

  update(_time: number, deltaMs: number): void {
    const dt = Math.min(deltaMs / 1000, 0.05);
    const role = this.cfg.role;

    if (role === 'guest') {
      this.updateGuest(dt);
    } else {
      this.updateSimulated(dt, role);
    }

    this.drawDynamic();
    this.touchControls?.draw();
    this.refreshMessages();
    this.publishHud(false);
  }

  private updateSimulated(dt: number, role: MatchRole): void {
    const human = this.buildLocalInput(dt);

    if (role === 'host') {
      this.netAccum += dt;
      const input: [PlayerInput, PlayerInput] = [human, this.remoteInput];
      this.stepFixed(dt, input);
      if (this.netAccum >= 1 / NET_TICK_HZ) {
        this.netAccum = 0;
        this.cfg.session?.send({ t: 'snap', s: serializeWorld(this.world) });
      }
    } else {
      const aiInput = this.ai.update(this.world, 1, dt);
      this.stepFixed(dt, [human, aiInput]);
    }
  }

  private stepFixed(dt: number, input: [PlayerInput, PlayerInput]): void {
    this.accum += dt;
    if (this.accum > MAX_ACCUM) this.accum = MAX_ACCUM;
    while (this.accum >= FIXED_DT) {
      stepWorld(this.world, input, FIXED_DT);
      this.accum -= FIXED_DT;
      this.flushEvents();
    }
  }

  private updateGuest(dt: number): void {
    const input = this.buildLocalInput(dt);
    this.netAccum += dt;
    if (this.netAccum >= 1 / NET_INPUT_HZ) {
      this.netAccum = 0;
      this.cfg.session?.send({ t: 'input', i: input });
    }
    if (!this.hasSnapshot) return;

    const k = 1 - Math.exp(-22 * dt);
    lerpWorld(this.world, this.target, k);

    const me = this.world.players[1];
    const auth = this.target.players[1];
    const kc = 1 - Math.exp(-10 * dt);
    me.x += (auth.x - me.x) * kc;
    me.y += (auth.y - me.y) * kc;
    me.vy = auth.vy;
    me.onGround = auth.onGround;
    me.hitCooldown = auth.hitCooldown;
    stepPlayerLocal(me, 1, input, dt);

    this.flushEvents();
  }

  private flushEvents(): void {
    for (const e of this.world.events) {
      if (e.type === 'hit') {
        const s = this.world.shuttle;
        this.flashes.push({ x: s.x, y: s.y, life: 1 });
      }
      this.cfg.onEvent(e);
    }
    this.world.events.length = 0;
  }

  private publishHud(force: boolean): void {
    const w = this.world;
    const roomCode = this.cfg.session?.roomCode ?? '';
    const opponentConnected = this.cfg.role !== 'single' ? !!this.cfg.session?.connected : true;
    const key = `${w.score[0]}:${w.score[1]}:${w.phase}:${w.winner}:${w.server}:${roomCode}:${opponentConnected}`;
    if (!force && key === this.lastHud) return;
    this.lastHud = key;
    this.cfg.onHud({
      score: [w.score[0], w.score[1]],
      phase: w.phase,
      winner: w.winner,
      localIndex: this.localIndex(),
      roomCode,
      opponentConnected,
      server: w.server,
    });
  }

  private refreshMessages(): void {
    const w = this.world;
    const local = this.localIndex();
    this.scoreLeft.setText(String(w.score[0]));
    this.scoreRight.setText(String(w.score[1]));

    if (w.phase === 'gameover') {
      const won = w.winner === local;
      this.message.setText(won ? '你赢了！' : '你输了');
      this.message.setColor(won ? '#8ef58e' : '#ff8a8a');
      this.subMessage.setText('按 R 再来一局');
    } else if (w.phase === 'serve') {
      this.message.setText('');
      const how = this.touchControls ? '拨动摇杆' : '挥动鼠标';
      this.subMessage.setText(w.server === local ? `你的发球 — 快速${how}` : '等待对方发球…');
    } else {
      this.message.setText('');
      this.subMessage.setText('');
    }
  }

  // ---- rendering ---------------------------------------------------------

  private drawCourt(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0x10233b, 1);
    g.fillRect(0, 0, VIEW_W, VIEW_H);
    g.fillGradientStyle(0x0c1a2c, 0x0c1a2c, 0x1b3b5c, 0x1b3b5c, 1, 1, 1, 1);
    g.fillRect(0, 0, VIEW_W, GROUND_Y);

    g.fillStyle(0x0a1523, 1);
    g.fillRect(0, GROUND_Y - 160, VIEW_W, 160);
    for (let i = 0; i < 150; i++) {
      const x = (i * 137) % VIEW_W;
      const y = GROUND_Y - 152 + ((i * 71) % 140);
      g.fillStyle(i % 4 === 0 ? 0x31506f : 0x1a2b3f, 0.85);
      g.fillCircle(x, y, 4);
    }
    g.fillStyle(0x0a1523, 1);
    g.fillRect(0, GROUND_Y - 6, VIEW_W, 6);

    g.fillStyle(0x1d4e3f, 1);
    g.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
    g.fillStyle(0x2b6b56, 1);
    g.fillRect(COURT_LEFT, GROUND_Y, COURT_RIGHT - COURT_LEFT, 24);
    g.fillStyle(0x143d31, 1);
    g.fillRect(0, VIEW_H - 14, VIEW_W, 14);

    g.lineStyle(4, 0xffffff, 0.9);
    g.lineBetween(COURT_LEFT, GROUND_Y, COURT_LEFT, GROUND_Y - 70);
    g.lineBetween(COURT_RIGHT, GROUND_Y, COURT_RIGHT, GROUND_Y - 70);
    g.lineStyle(3, 0xffffff, 0.75);
    g.lineBetween(COURT_LEFT, GROUND_Y, COURT_RIGHT, GROUND_Y);

    const netTop = GROUND_Y - 108;
    g.fillStyle(0xcfd8e3, 1);
    g.fillRect(NET_X - 9, netTop - 4, 5, GROUND_Y - netTop + 4);
    g.fillRect(NET_X + 4, netTop - 4, 5, GROUND_Y - netTop + 4);
    g.fillStyle(0x0a0a0a, 0.55);
    g.fillRect(NET_X - 6, netTop, 12, GROUND_Y - netTop);
    g.lineStyle(1, 0xffffff, 0.4);
    for (let y = netTop + 6; y < GROUND_Y; y += 9) {
      g.lineBetween(NET_X - 6, y, NET_X + 6, y);
    }
    for (let x = NET_X - 4; x <= NET_X + 4; x += 4) {
      g.lineBetween(x, netTop, x, GROUND_Y);
    }
    g.fillStyle(0xffffff, 0.95);
    g.fillRect(NET_X - 8, netTop - 7, 16, 6);
  }

  private drawDynamic(): void {
    const g = this.dynamic;
    g.clear();

    if (this.cfg.role === 'guest' && !this.hasSnapshot) return;

    this.drawServeHint(g);
    for (let i = 0; i < 2; i++) this.drawPlayer(g, i as 0 | 1);
    this.drawShuttle(g);
    this.drawEffects(g);

    const local = this.localIndex();
    g.lineStyle(3, 0x6ff0ff, 0.5);
    g.lineBetween(
      this.world.players[local].x - 26,
      GROUND_Y + 6,
      this.world.players[local].x + 26,
      GROUND_Y + 6,
    );
  }

  private drawEffects(g: Phaser.GameObjects.Graphics): void {
    const dt = 1 / 60;
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.life -= dt * 3.2;
      if (f.life <= 0) {
        this.flashes.splice(i, 1);
        continue;
      }
      const r = 10 + (1 - f.life) * 34;
      g.lineStyle(3 * f.life + 1, 0xffffff, f.life * 0.8);
      g.strokeCircle(f.x, f.y, r);
    }
  }

  private drawServeHint(g: Phaser.GameObjects.Graphics): void {
    const w = this.world;
    if (w.phase !== 'serve') return;
    const server = w.players[w.server];
    g.lineStyle(3, 0xffe066, 0.5);
    g.strokeCircle(server.x, server.y - PLAYER_H - 30, 12);
    g.lineStyle(3, 0xffe066, 0.9);
    g.lineBetween(server.x - 7, server.y - PLAYER_H - 30, server.x + 7, server.y - PLAYER_H - 30);
  }

  private drawPlayer(g: Phaser.GameObjects.Graphics, i: 0 | 1): void {
    const p = this.world.players[i];
    const color = i === 0 ? 0x4ea3ff : 0xff7a59;
    const topY = p.y - PLAYER_H;

    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(p.x, GROUND_Y + 2, 54, 12);

    g.fillStyle(color, 1);
    g.fillRoundedRect(p.x - 17, topY + 30, 34, PLAYER_H - 34, 12);
    g.fillStyle(0xf2c9a0, 1);
    g.fillCircle(p.x, topY + 18, 15);

    this.drawRacket(g, p, color);
  }

  private drawRacket(g: Phaser.GameObjects.Graphics, p: PlayerState, color: number): void {
    const shoulder = shoulderPoint(p);
    const head = racketHead(p);
    const ang = Math.atan2(head.y - shoulder.y, head.x - shoulder.x);

    const speed = Math.hypot(p.rvx, p.rvy);
    const hot = Math.min(1, speed / 1400);
    if (hot > 0.08 && this.world.shuttle.live) {
      const reach = Math.hypot(head.x - shoulder.x, head.y - shoulder.y);
      g.lineStyle(6 + 10 * hot, color, 0.18 + 0.3 * hot);
      g.beginPath();
      g.arc(shoulder.x, shoulder.y, reach, ang - 0.55, ang, false, 0);
      g.strokePath();
    }

    const hx = head.x - Math.cos(ang) * 14;
    const hy = head.y - Math.sin(ang) * 14;
    g.lineStyle(7, 0xf2c9a0, 1);
    g.lineBetween(shoulder.x, shoulder.y, hx, hy);

    g.save();
    g.translateCanvas(head.x, head.y);
    g.rotateCanvas(ang);
    g.lineStyle(7, 0xd9dde3, 0.95);
    g.lineBetween(-14, 0, -2, 0);
    g.lineStyle(3, 0xffffff, 0.95);
    g.strokeEllipse(11, 0, 40, 32);
    g.restore();

    if (hot > 0.15) {
      g.lineStyle(2, 0xffffff, 0.1 + 0.25 * hot);
      g.strokeCircle(head.x, head.y, CONTACT_R);
    }
  }

  private drawShuttle(g: Phaser.GameObjects.Graphics): void {
    const s = this.world.shuttle;
    const angle = s.live ? Math.atan2(s.vy, s.vx) : Math.PI / 2;

    this.trail.push({ x: s.x, y: s.y });
    if (this.trail.length > 14) this.trail.shift();
    for (let i = 0; i < this.trail.length; i++) {
      const t = i / this.trail.length;
      const p = this.trail[i];
      g.fillStyle(0x9fdcff, t * 0.28);
      g.fillCircle(p.x, p.y, 1 + t * 4);
    }

    const height = Phaser.Math.Clamp((GROUND_Y - s.y) / 420, 0, 1);
    g.fillStyle(0x000000, 0.32 * (1 - height));
    g.fillEllipse(s.x, GROUND_Y - 2, 26 * (1 - height * 0.5), 7 * (1 - height * 0.5));

    g.fillStyle(0xffffff, 0.14);
    g.fillCircle(s.x, s.y, 15);
    g.fillStyle(0xffffff, 0.22);
    g.fillCircle(s.x, s.y, 10);

    g.lineStyle(2, 0xf2f2f2, 0.9);
    for (let k = -1; k <= 1; k++) {
      const a = angle + Math.PI + k * 0.4;
      g.lineBetween(s.x, s.y, s.x + Math.cos(a) * 16, s.y + Math.sin(a) * 16);
    }
    g.fillStyle(0xffffff, 1);
    g.fillCircle(s.x, s.y, 5.5);
  }
}
