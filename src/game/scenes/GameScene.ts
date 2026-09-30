import Phaser from 'phaser';
import {
  CONTACT_R,
  COURT_LEFT,
  COURT_RIGHT,
  GROUND_Y,
  LAG_COMP_MAX_MS,
  NET_TICK_HZ,
  NET_X,
  NET_INPUT_HZ,
  PLAYER_H,
  RACKET_MAX,
  SHUTTLE_R,
  SHOULDER_DX,
  SHOULDER_DY,
  VIEW_H,
  VIEW_W,
} from '../constants';
import type { ShotKind, SimEvent } from '../types';
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
  integrateShuttle,
  lerpWorld,
  serializeWorld,
  shoulderPoint,
  stepPlayerLocal,
  stepWorld,
} from '../simulation';
import { AIController, type Difficulty } from '../ai';
import { createControls, readControls, type ControlKeys } from '../input';
import { RacketTracker } from '../racket';
import { TouchControls, isTouchDevice } from '../touch';
import { debugOverlayEnabled } from '../device';
import {
  applyTheme,
  FONT_EMOJI,
  FONT_NUM,
  FONT_UI,
  P,
  THEME_IDS,
  type ThemeId,
} from '../theme';
import {
  AI_COSMETIC,
  DEFAULT_COSMETIC,
  sanitizeCosmetic,
  type Cosmetic,
  type HitStyle,
} from '../cosmetics';
import { EMOTE_BY_ID, EMOTE_COOLDOWN_MS, EMOTE_LIFE_S } from '../emotes';
import { Telemetry, type NetMetrics } from '../telemetry';
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
  /** throttled netcode telemetry, for the debug panel and the Pinia store */
  onMetrics?: (metrics: NetMetrics) => void;
  /** true while the touch-layout editor is open */
  onEditMode?: (editing: boolean) => void;
  /** the local player's look (purely visual) */
  cosmetic?: Cosmetic;
  /** the local player's display name */
  localName?: string;
  /** starting court theme */
  theme?: ThemeId;
  /** rotate the court theme once a match finishes */
  autoCycleTheme?: boolean;
  onThemeChange?: (theme: ThemeId) => void;
}

/** a transient hit effect, drawn with the hitter's chosen style/colour */
interface Flash {
  x: number;
  y: number;
  life: number;
  ang: number;
  style: HitStyle;
  color: number;
  power: number;
  seed: number;
}

const FIXED_DT = 1 / 60;
/** how much history the shuttle trail covers, in ms (frame-rate independent) */
const TRAIL_MS = 190;
const PING_INTERVAL = 0.5;
const METRICS_INTERVAL = 0.5;
const MAX_ACCUM = 0.25;

export class GameScene extends Phaser.Scene {
  private cfg!: MatchConfig;
  private world!: World;
  private target!: World;
  private controls!: ControlKeys;
  private ai!: AIController;
  private racket!: RacketTracker;
  private touchControls: TouchControls | null = null;
  private editShown = false;
  private telemetry = new Telemetry();
  private pingAccum = 0;
  private metricsAccum = 0;
  private debugText: Phaser.GameObjects.Text | null = null;

  private accum = 0;
  private netAccum = 0;
  private remoteInput: PlayerInput = { ...EMPTY_INPUT };
  private hasSnapshot = false;
  private lastHud = '';
  private trail: { x: number; y: number; t: number }[] = [];
  private flashes: Flash[] = [];
  private tmp = new Phaser.Math.Vector2();

  /** cosmetics: ours (local) and the peer's, received via the hello message */
  private localCosmetic: Cosmetic = { ...DEFAULT_COSMETIC };
  private remoteCosmetic: Cosmetic = { ...DEFAULT_COSMETIC };
  private currentTheme: ThemeId = 'day';
  private bg!: Phaser.GameObjects.Graphics;
  /** emoji faces drawn above each player's body */
  private faces: Phaser.GameObjects.Text[] = [];
  /** side name plates */
  private localName = '你';
  private remoteName = '对手';
  private nameTexts: Phaser.GameObjects.Text[] = [];
  private avatarTexts: Phaser.GameObjects.Text[] = [];
  /** short "point!" label shown beside the score */
  private pointMsg!: Phaser.GameObjects.Text;
  private plateCy = 72;

  /** sim events produced since the last snapshot went out */
  private netEvents: SimEvent[] = [];
  /** render interpolation: pose before this frame's fixed steps + blend factor */
  private prevShuttle = { x: 0, y: 0 };
  private prevPlayers = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];
  private alpha = 0;
  /** guest-side dead reckoning for the shuttle */
  private predShuttle = { x: 0, y: 0, vx: 0, vy: 0, live: false };
  /** guest-side dead reckoning for the opponent */
  private predOpp = { x: 0, y: 0, vx: 0, vy: 0 };
  /** host-side shuttle history, for lag-compensated contact tests */
  private shuttleHistory: { x: number; y: number; t: number }[] = [];
  /** reaction bubbles currently on screen */
  private emotes: {
    player: 0 | 1;
    life: number;
    text: Phaser.GameObjects.Text;
  }[] = [];
  private lastEmoteAt = 0;
  /** real frame delta — effect lifetimes must not assume 60fps */
  private frameDt = 1 / 60;

  private dynamic!: Phaser.GameObjects.Graphics;
  private scoreLeft!: Phaser.GameObjects.Text;
  private scoreRight!: Phaser.GameObjects.Text;
  private message!: Phaser.GameObjects.Text;
  private subMessage!: Phaser.GameObjects.Text;
  private replayBg!: Phaser.GameObjects.Graphics;
  private replayLabel!: Phaser.GameObjects.Text;
  private replayZone!: Phaser.GameObjects.Zone;
  private replayShown = false;
  private readonly replayY = 390;
  private readonly replayW = 280;
  private readonly replayH = 78;

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
    this.netEvents = [];
    this.shuttleHistory = [];
    this.alpha = 0;
    this.predShuttle.live = false;
    this.telemetry.reset();
    this.telemetry.role =
      this.cfg.role === 'single' ? '单机' : this.cfg.role === 'host' ? '房主(本地权威)' : '访客';
    this.telemetry.transport = this.cfg.session?.kind ?? '';
    this.pingAccum = 0;
    this.metricsAccum = 0;
    this.localCosmetic = this.cfg.cosmetic
      ? sanitizeCosmetic(this.cfg.cosmetic)
      : { ...DEFAULT_COSMETIC };
    this.remoteCosmetic =
      this.cfg.role === 'single' ? { ...AI_COSMETIC } : { ...DEFAULT_COSMETIC };
    this.localName = this.cfg.localName?.trim() || '你';
    this.remoteName = this.cfg.role === 'single' ? '电脑' : '对手';
    this.currentTheme = this.cfg.theme ?? 'day';
  }

  create(): void {
    // palette must be applied before anything reads P
    applyTheme(this.currentTheme);

    this.controls = createControls(this);
    this.ai = new AIController(this.cfg.difficulty, 1);
    this.racket = new RacketTracker();
    this.input.keyboard?.addCapture('UP,DOWN,LEFT,RIGHT,W,A,S,D');
    this.input.mouse?.disableContextMenu();

    this.bg = this.add.graphics();
    this.drawCourt(this.bg);

    if (debugOverlayEnabled()) {
      this.debugText = this.add
        .text(14, 14, '', {
          fontFamily: FONT_NUM,
          fontSize: '16px',
          color: P.debugText,
          backgroundColor: P.debugBg,
          padding: { x: 12, y: 10 },
          lineSpacing: 5,
        })
        .setDepth(30);
    }

    this.dynamic = this.add.graphics();

    this.faces = [0, 1].map(() =>
      this.add
        .text(0, 0, '', { fontFamily: FONT_EMOJI, fontSize: '34px' })
        .setOrigin(0.5)
        .setDepth(6)
        .setVisible(false),
    );

    this.nameTexts = [0, 1].map(() =>
      this.add
        .text(0, 0, '', { fontFamily: FONT_UI, fontSize: '15px', color: '#ffffff' })
        .setOrigin(0, 0.5)
        .setDepth(8),
    );
    this.avatarTexts = [0, 1].map(() =>
      this.add
        .text(0, 0, '', { fontFamily: FONT_EMOJI, fontSize: '22px' })
        .setOrigin(0.5)
        .setDepth(8),
    );
    this.pointMsg = this.add
      .text(0, 0, '得分！', { fontFamily: FONT_UI, fontSize: '26px', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setDepth(9)
      .setVisible(false);

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: FONT_UI,
      fontSize: '64px',
      color: P.score,
      fontStyle: 'bold',
    };
    this.scoreLeft = this.add.text(VIEW_W / 2 - 90, 40, '0', style).setOrigin(0.5, 0);
    this.scoreRight = this.add.text(VIEW_W / 2 + 90, 40, '0', style).setOrigin(0.5, 0);
    this.message = this.add
      .text(VIEW_W / 2, VIEW_H / 2 - 110, '', {
        fontFamily: FONT_UI,
        fontSize: '44px',
        color: P.msgWin,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.subMessage = this.add
      .text(VIEW_W / 2, VIEW_H / 2 - 46, '', {
        fontFamily: FONT_UI,
        fontSize: '24px',
        color: P.sub,
      })
      .setOrigin(0.5);

    this.buildReplayButton();

    const session = this.cfg.session;
    if (session) {
      session.onMessage = (m) => this.handleNetMessage(m);
      session.onDisconnected = () => this.cfg.onDisconnect('连接已断开');
      session.onError = (message) => this.cfg.onDisconnect(message);
      // announce our look so the peer can draw us the same way (visual only).
      // repeated a couple of times because the first can race the peer's own
      // scene setup and be dropped before it installs onMessage.
      const announce = () =>
        session.send({ t: 'hello', name: this.localName, cosmetic: this.localCosmetic });
      announce();
      for (const ms of [300, 900]) this.time.delayedCall(ms, announce);
    }

    this.input.keyboard?.on('keydown-R', () => this.requestRematch());

    if (isTouchDevice()) {
      this.input.addPointer(3);
      this.touchControls = new TouchControls(this);
      // the HTML bar overlays the top of the canvas, so drop the score below it
      this.scoreLeft.setY(126);
      this.scoreRight.setY(126);
      this.debugText?.setY(132);
      this.plateCy = 158;
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
      this.adoptSnapshot();
      this.hasSnapshot = true;
      this.telemetry.onSnapshot(performance.now());
      // replay the host's sim events so the guest hears hits and net taps too
      if (m.s.ev) for (const e of m.s.ev) this.world.events.push(e);
    } else if (m.t === 'hello') {
      this.remoteCosmetic = sanitizeCosmetic(m.cosmetic);
      const name = typeof m.name === 'string' ? m.name.trim() : '';
      if (name) this.remoteName = name.slice(0, 16);
    } else if (m.t === 'emote') {
      // the peer's reaction lands on their own player
      this.spawnEmote(this.cfg.role === 'host' ? 1 : 0, m.id);
    } else if (m.t === 'ping') {
      this.cfg.session?.send({ t: 'pong', ts: m.ts });
    } else if (m.t === 'pong') {
      this.telemetry.onPong(m.ts, performance.now());
    } else if (m.t === 'rematch') {
      this.resetWorld();
    }
  }

  private buildReplayButton(): void {
    const bx = VIEW_W / 2;
    const by = this.replayY;
    const w = this.replayW;
    const h = this.replayH;

    this.replayBg = this.add.graphics().setDepth(15);
    this.replayBg.fillStyle(P.replayFill, 1);
    this.replayBg.fillRoundedRect(bx - w / 2, by - h / 2, w, h, 18);
    this.replayBg.lineStyle(3, P.replayBorder, 0.9);
    this.replayBg.strokeRoundedRect(bx - w / 2, by - h / 2, w, h, 18);

    this.replayLabel = this.add
      .text(bx, by, '再来一局', {
        fontFamily: FONT_UI,
        fontSize: '34px',
        color: P.replayText,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(16);

    this.replayZone = this.add.zone(bx, by, w, h);
    this.replayZone.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, w, h),
      Phaser.Geom.Rectangle.Contains,
    );
    this.replayZone.on('pointerdown', () => {
      if (this.world.phase === 'gameover') this.requestRematch();
    });
    this.replayZone.on('pointerover', () => this.replayLabel.setColor(P.replayTextHover));
    this.replayZone.on('pointerout', () => this.replayLabel.setColor(P.replayText));

    // hide explicitly: the toggle below short-circuits on an unchanged flag
    this.replayBg.setVisible(false);
    this.replayLabel.setVisible(false);
    this.replayZone.setVisible(false);
    if (this.replayZone.input) this.replayZone.input.enabled = false;
    this.replayShown = false;
  }

  private setReplayVisible(on: boolean): void {
    if (this.replayShown === on) return;
    this.replayShown = on;
    this.replayBg.setVisible(on);
    this.replayLabel.setVisible(on);
    this.replayZone.setVisible(on);
    if (this.replayZone.input) this.replayZone.input.enabled = on;
    // while the button is up, taps must not also swing the racket
    if (this.touchControls) {
      this.touchControls.enabled = !on;
      if (on) this.touchControls.reset();
    }
  }

  private resetWorld(): void {
    this.world = createWorld();
    this.target = createWorld();
    this.hasSnapshot = false;
    this.racket.reset();
    this.touchControls?.reset();
    for (const e of this.emotes) e.text.destroy();
    this.emotes = [];
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

  private cosmeticFor(i: 0 | 1): Cosmetic {
    return i === this.localIndex() ? this.localCosmetic : this.remoteCosmetic;
  }

  /** the shuttle trail takes the colour of whoever hit it last */
  private trailColor(): number {
    const lh = this.world.lastHitter;
    return lh === 0 || lh === 1 ? this.cosmeticFor(lh).trail : P.trail;
  }

  /** open/close the on-screen stick layout editor (touch devices only) */
  setEditMode(on: boolean): void {
    if (!this.touchControls) return;
    this.touchControls.setEditing(on);
    if (on) this.racket.reset();
  }

  toggleEditMode(): void {
    this.setEditMode(!(this.touchControls?.editing ?? false));
  }

  /**
   * React with an emote. Shown locally straight away (no round trip) and sent
   * to the opponent as a side channel — it never touches the simulation.
   */
  sendEmote(id: string): void {
    if (!EMOTE_BY_ID[id]) return;
    const now = performance.now();
    if (now - this.lastEmoteAt < EMOTE_COOLDOWN_MS) return;
    this.lastEmoteAt = now;
    this.spawnEmote(this.localIndex(), id);
    this.cfg.session?.send({ t: 'emote', id, ts: Date.now() });
  }

  private spawnEmote(player: 0 | 1, id: string): void {
    const def = EMOTE_BY_ID[id];
    if (!def) return;
    const text = this.add
      .text(0, 0, def.char, { fontFamily: FONT_UI, fontSize: '34px' })
      .setOrigin(0.5)
      .setDepth(12);
    this.emotes.push({ player, life: 1, text });
    // keep the pool small so a spamming peer cannot fill the screen
    while (this.emotes.length > 5) this.emotes.shift()?.text.destroy();
  }

  private drawEmotes(g: Phaser.GameObjects.Graphics): void {
    const dt = this.frameDt;
    for (let i = this.emotes.length - 1; i >= 0; i--) {
      const e = this.emotes[i];
      e.life -= dt / EMOTE_LIFE_S;
      if (e.life <= 0) {
        e.text.destroy();
        this.emotes.splice(i, 1);
        continue;
      }
      const p = this.renderPlayerPos(e.player);
      const rise = (1 - e.life) * 46;
      const x = p.x;
      const y = p.y - PLAYER_H - 36 - rise;
      const alpha = Math.min(1, e.life * 2.2);

      const w = 66;
      const h = 50;
      g.fillStyle(0xffffff, 0.95 * alpha);
      g.lineStyle(2, P.line, 0.45 * alpha);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 14);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 14);
      g.fillStyle(0xffffff, 0.95 * alpha);
      g.fillTriangle(x - 8, y + h / 2 - 2, x + 8, y + h / 2 - 2, x, y + h / 2 + 11);

      e.text.setPosition(x, y).setAlpha(alpha);
    }
  }

  private buildLocalInput(dt: number): PlayerInput {
    // while the player is arranging the sticks, everyone stands still
    if (this.touchControls?.editing) return { ...EMPTY_INPUT };

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
    this.frameDt = dt;
    const role = this.cfg.role;
    const editing = this.touchControls?.editing ?? false;

    if (editing && role === 'single') {
      // freeze the rally while the layout editor is open; online we keep the
      // sim running so the opponent is not held hostage
    } else if (role === 'guest') {
      this.updateGuest(dt);
    } else {
      this.updateSimulated(dt, role);
    }

    // how far we are into the next fixed step — used to interpolate rendering
    // so a 165Hz display does not show the 60Hz sim as stepped
    this.alpha = Math.min(1, Math.max(0, this.accum / FIXED_DT));

    if (this.touchControls && editing !== this.editShown) {
      this.editShown = editing;
      this.cfg.onEditMode?.(editing);
    }

    if (role !== 'single') {
      this.pingAccum += dt;
      if (this.pingAccum >= PING_INTERVAL) {
        this.pingAccum = 0;
        this.cfg.session?.send({ t: 'ping', ts: performance.now() });
      }
      if (role === 'guest') this.telemetry.sampleShuttle(this.renderShuttle(), this.target.shuttle);
      else this.telemetry.sampleShuttle(this.world.shuttle, this.world.shuttle);
    }

    this.drawDynamic();
    this.touchControls?.draw();
    this.refreshMessages();
    this.publishHud(false);
    this.publishMetrics(dt);
  }

  private publishMetrics(dt: number): void {
    this.metricsAccum += dt;
    if (this.metricsAccum < METRICS_INTERVAL) return;
    this.metricsAccum = 0;

    this.telemetry.fps = this.game.loop.actualFps;
    const m = this.telemetry.read();
    this.cfg.onMetrics?.(m);
    if (this.debugText) this.debugText.setText(this.formatMetrics(m));
  }

  private formatMetrics(m: NetMetrics): string {
    if (m.role === '单机') return '单机模式';
    const transport = this.cfg.session?.kind ?? '—';
    const head = `${m.role} · ${transport} · ${m.fps.toFixed(0)}fps`;
    if (m.role !== '访客') return `${head}\nRTT ${m.rttMs.toFixed(0)}ms ±${m.jitterMs.toFixed(0)}`;

    const net = m.rttMs / 2;
    const lead = m.ballRenderLagMs;
    const dir = lead < 0 ? '领先' : '落后';
    return [
      head,
      `RTT   ${m.rttMs.toFixed(0)}ms  ±${m.jitterMs.toFixed(0)}`,
      `快照  ${m.snapIntervalMs.toFixed(0)}ms (${m.snapHz.toFixed(0)}Hz)`,
      `球    ${dir}快照 ${Math.abs(lead).toFixed(0)}ms  净滞后 ${m.ballTotalLagMs.toFixed(0)}ms`,
      `      网络 ${net.toFixed(0)} · ${m.ballSpeed.toFixed(0)}px/s`,
    ].join('\n');
  }

  private updateSimulated(dt: number, role: MatchRole): void {
    const human = this.buildLocalInput(dt);

    if (role === 'host') {
      this.netAccum += dt;
      const input: [PlayerInput, PlayerInput] = [human, this.remoteInput];
      this.stepFixed(dt, input, this.lagCompSamples());
      while (this.netAccum >= 1 / NET_TICK_HZ) {
        this.netAccum -= 1 / NET_TICK_HZ;
        this.cfg.session?.send({
          t: 'snap',
          s: serializeWorld(this.world, this.netEvents),
        });
        this.netEvents.length = 0;
      }
    } else {
      const aiInput = this.ai.update(this.world, 1, dt);
      this.stepFixed(dt, [human, aiInput]);
    }
  }

  /** pose before this frame's fixed steps, for render interpolation */
  private capturePose(): void {
    this.prevShuttle.x = this.world.shuttle.x;
    this.prevShuttle.y = this.world.shuttle.y;
    for (let i = 0; i < 2; i++) {
      this.prevPlayers[i].x = this.world.players[i].x;
      this.prevPlayers[i].y = this.world.players[i].y;
    }
  }

  /**
   * Host-side lag compensation: the guest's racket input is RTT/2 old, so
   * compare it against where the shuttle actually was at that moment. The
   * launch still happens from the shuttle's live position, so nothing
   * teleports — only the contact test is rewound.
   */
  private lagCompSamples(): [{ x: number; y: number } | null, { x: number; y: number } | null] {
    const halfMs = Math.min(this.telemetry.rttMs / 2, LAG_COMP_MAX_MS);
    if (halfMs <= 8) return [null, null];
    const want = performance.now() - halfMs;
    let best: { x: number; y: number } | null = null;
    let bestDt = Infinity;
    for (const h of this.shuttleHistory) {
      const d = Math.abs(h.t - want);
      if (d < bestDt) {
        bestDt = d;
        best = h;
      }
    }
    return [null, best];
  }

  private stepFixed(
    dt: number,
    input: [PlayerInput, PlayerInput],
    hitSamples?: [{ x: number; y: number } | null, { x: number; y: number } | null],
  ): void {
    this.accum += dt;
    if (this.accum > MAX_ACCUM) this.accum = MAX_ACCUM;
    while (this.accum >= FIXED_DT) {
      // snapshot the pose *before* each step so rendering can blend between
      // the last two physics states (Gaffer's "Fix Your Timestep")
      this.capturePose();
      stepWorld(this.world, input, FIXED_DT, hitSamples);
      this.accum -= FIXED_DT;
      this.recordShuttle();
      this.flushEvents();
    }
  }

  private recordShuttle(): void {
    if (this.world.phase !== 'rally') return;
    const s = this.world.shuttle;
    this.shuttleHistory.push({ x: s.x, y: s.y, t: performance.now() });
    // ~300ms of history at 60Hz
    while (this.shuttleHistory.length > 24) this.shuttleHistory.shift();
  }

  private updateGuest(dt: number): void {
    const input = this.buildLocalInput(dt);
    this.netAccum += dt;
    while (this.netAccum >= 1 / NET_INPUT_HZ) {
      this.netAccum -= 1 / NET_INPUT_HZ;
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

    this.stepPrediction(dt);
    this.flushEvents();
  }

  /**
   * Dead reckoning.
   *
   * The authoritative physics is deterministic and the snapshot carries the
   * exact velocity, so re-simulating forward from each snapshot reproduces the
   * trajectory instead of low-pass filtering a stale position. That removes
   * the ~40ms the exponential filter used to add, leaving only the RTT/2 that
   * no client can avoid.
   */
  private stepPrediction(dt: number): void {
    if (this.predShuttle.live) {
      integrateShuttle(this.predShuttle, dt);
      if (this.predShuttle.y >= GROUND_Y - SHUTTLE_R) {
        this.predShuttle.y = GROUND_Y - SHUTTLE_R;
        this.predShuttle.vx = 0;
        this.predShuttle.vy = 0;
        this.predShuttle.live = false;
      }
    }
    this.predOpp.x += this.predOpp.vx * dt;
    this.predOpp.y += this.predOpp.vy * dt;
    if (this.predOpp.y >= GROUND_Y) this.predOpp.y = GROUND_Y;
  }

  /** hard-reset the predictions onto a fresh snapshot */
  private adoptSnapshot(): void {
    const s = this.target.shuttle;
    this.predShuttle.x = s.x;
    this.predShuttle.y = s.y;
    this.predShuttle.vx = s.vx;
    this.predShuttle.vy = s.vy;
    this.predShuttle.live = s.live;
    const o = this.target.players[0];
    this.predOpp.x = o.x;
    this.predOpp.y = o.y;
    this.predOpp.vx = o.vx;
    this.predOpp.vy = o.vy;
  }

  private flushEvents(): void {
    for (const e of this.world.events) {
      if (e.type === 'hit') this.spawnHitEffect(e.player === 1 ? 1 : 0, e.kind);
      if (e.type === 'gameover') this.maybeCycleTheme();
      if (this.cfg.role === 'host' && this.netEvents.length < 16) this.netEvents.push(e);
      this.cfg.onEvent(e);
    }
    this.world.events.length = 0;
  }

  private spawnHitEffect(player: 0 | 1, kind?: ShotKind): void {
    const s = this.world.shuttle;
    const cos = this.cosmeticFor(player);
    this.flashes.push({
      x: s.x,
      y: s.y,
      life: 1,
      ang: Math.atan2(s.vy, s.vx),
      style: cos.effect,
      color: cos.trail,
      power: kind === 'smash' ? 1.6 : 1,
      seed: Math.random() * Math.PI * 2,
    });
  }

  /** after a match, roll to the next court theme (a purely local setting) */
  private maybeCycleTheme(): void {
    if (!this.cfg.autoCycleTheme) return;
    const i = THEME_IDS.indexOf(this.currentTheme);
    this.currentTheme = THEME_IDS[(i + 1) % THEME_IDS.length];
    this.applyCurrentTheme();
    this.cfg.onThemeChange?.(this.currentTheme);
  }

  private applyCurrentTheme(): void {
    applyTheme(this.currentTheme);
    this.bg.clear();
    this.drawCourt(this.bg);
    this.scoreLeft.setColor(P.score);
    this.scoreRight.setColor(P.score);
    this.subMessage.setColor(P.sub);
    this.debugText?.setColor(P.debugText);
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
    this.pointMsg.setVisible(false);

    if (w.phase === 'gameover') {
      const won = w.winner === local;
      this.message.setText(won ? '你赢了！' : '你输了');
      this.message.setColor(won ? P.msgWin : P.msgLose);
      this.subMessage.setText(this.touchControls ? '' : '也可以按 R 键');
      this.subMessage.setY(this.replayY + this.replayH / 2 + 34);
      this.setReplayVisible(true);
    } else if (w.phase === 'serve') {
      this.setReplayVisible(false);
      this.subMessage.setY(VIEW_H / 2 - 46);
      this.message.setText('');
      const how = this.touchControls ? '拨动摇杆' : '挥动鼠标';
      this.subMessage.setText(w.server === local ? `你的发球 — 快速${how}` : '等待对方发球…');
    } else {
      this.setReplayVisible(false);
      this.subMessage.setY(VIEW_H / 2 - 46);
      this.message.setText('');
      this.subMessage.setText('');
      if (w.phase === 'point') this.showPointMessage(w.server);
    }
  }

  /** the "point!" label, parked beside the scorer's score */
  private showPointMessage(scorer: number): void {
    const left = scorer === 0;
    const accent = left ? P.player0 : P.player1;
    this.pointMsg
      .setText('得分！')
      .setColor(`#${(accent & 0xffffff).toString(16).padStart(6, '0')}`)
      .setPosition(left ? VIEW_W / 2 - 180 : VIEW_W / 2 + 180, this.scoreLeft.y + 34)
      .setVisible(true);
  }

  // ---- rendering ---------------------------------------------------------

  private drawCourt(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(P.skyTop, 1);
    g.fillRect(0, 0, VIEW_W, VIEW_H);
    g.fillGradientStyle(P.skyTop, P.skyTop, P.skyBottom, P.skyBottom, 1, 1, 1, 1);
    g.fillRect(0, 0, VIEW_W, GROUND_Y);

    g.fillStyle(P.stands, 1);
    g.fillRect(0, GROUND_Y - 160, VIEW_W, 160);
    for (let i = 0; i < 150; i++) {
      const x = (i * 137) % VIEW_W;
      const y = GROUND_Y - 152 + ((i * 71) % 140);
      g.fillStyle(i % 4 === 0 ? P.crowdA : P.crowdB, 0.9);
      g.fillCircle(x, y, 4);
    }
    g.fillStyle(P.apron, 1);
    g.fillRect(0, GROUND_Y - 6, VIEW_W, 6);

    g.fillStyle(P.floor, 1);
    g.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
    g.fillStyle(P.floorStrip, 1);
    g.fillRect(COURT_LEFT, GROUND_Y, COURT_RIGHT - COURT_LEFT, 24);
    g.fillStyle(P.floorEdge, 1);
    g.fillRect(0, VIEW_H - 14, VIEW_W, 14);

    g.lineStyle(4, P.line, 0.9);
    g.lineBetween(COURT_LEFT, GROUND_Y, COURT_LEFT, GROUND_Y - 70);
    g.lineBetween(COURT_RIGHT, GROUND_Y, COURT_RIGHT, GROUND_Y - 70);
    g.lineStyle(3, P.line, 0.85);
    g.lineBetween(COURT_LEFT, GROUND_Y, COURT_RIGHT, GROUND_Y);

    const netTop = GROUND_Y - 108;
    // net: the mesh is drawn a touch wider than its collision (NET_HALF_W) so
    // it stays legible against both the sky and the floor
    g.fillStyle(P.post, 1);
    g.fillRect(NET_X - 12, netTop - 5, 6, GROUND_Y - netTop + 5);
    g.fillRect(NET_X + 6, netTop - 5, 6, GROUND_Y - netTop + 5);
    g.fillStyle(P.netMesh, 0.5);
    g.fillRect(NET_X - 8, netTop, 16, GROUND_Y - netTop);
    g.lineStyle(1, P.netMesh, 0.95);
    for (let y = netTop + 5; y < GROUND_Y; y += 8) {
      g.lineBetween(NET_X - 8, y, NET_X + 8, y);
    }
    for (let x = NET_X - 8; x <= NET_X + 8; x += 4) {
      g.lineBetween(x, netTop, x, GROUND_Y);
    }
    g.fillStyle(P.netTape, 1);
    g.fillRect(NET_X - 11, netTop - 8, 22, 7);
  }

  /** where the shuttle should be drawn this frame */
  private renderShuttle(): { x: number; y: number; vx: number; vy: number; live: boolean } {
    if (this.cfg.role === 'guest') return this.predShuttle;
    const a = this.alpha;
    return {
      x: this.prevShuttle.x + (this.world.shuttle.x - this.prevShuttle.x) * a,
      y: this.prevShuttle.y + (this.world.shuttle.y - this.prevShuttle.y) * a,
      vx: this.world.shuttle.vx,
      vy: this.world.shuttle.vy,
      live: this.world.shuttle.live,
    };
  }

  /**
   * Render positions. The local player is deliberately NOT interpolated: it is
   * the one entity where an extra tick of smoothing would be felt as input lag.
   */
  private renderPlayerPos(i: 0 | 1): { x: number; y: number } {
    if (this.cfg.role === 'guest') {
      return i === 1 ? this.world.players[1] : this.predOpp;
    }
    if (i === this.localIndex()) return this.world.players[i];
    const a = this.alpha;
    return {
      x: this.prevPlayers[i].x + (this.world.players[i].x - this.prevPlayers[i].x) * a,
      y: this.prevPlayers[i].y + (this.world.players[i].y - this.prevPlayers[i].y) * a,
    };
  }

  private drawDynamic(): void {
    const g = this.dynamic;
    g.clear();
    for (const f of this.faces) f.setVisible(false);

    this.drawNamePlates(g);

    if (this.cfg.role === 'guest' && !this.hasSnapshot) return;

    this.drawServeHint(g);
    for (let i = 0; i < 2; i++) this.drawPlayer(g, i as 0 | 1);
    this.drawShuttle(g);
    this.drawEmotes(g);
    this.drawEffects(g);

    const local = this.localIndex();
    const lp = this.renderPlayerPos(local);
    g.lineStyle(3, P.localMark, 0.6);
    g.lineBetween(lp.x - 26, GROUND_Y + 6, lp.x + 26, GROUND_Y + 6);
  }

  private drawEffects(g: Phaser.GameObjects.Graphics): void {
    const dt = this.frameDt;
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      const span = f.style === 'slash' ? 0.22 : f.style === 'spark' ? 0.4 : 0.36;
      f.life -= dt / span;
      if (f.life <= 0) {
        this.flashes.splice(i, 1);
        continue;
      }
      const t = 1 - f.life;
      const a = f.life;
      const size = f.power;
      switch (f.style) {
        case 'spark': {
          const r0 = 6 * size;
          const len = (10 + t * 52) * size;
          g.lineStyle(2.5 * a + 0.5, f.color, a * 0.9);
          for (let k = 0; k < 9; k++) {
            const ang = f.seed + (k / 9) * Math.PI * 2;
            const ca = Math.cos(ang);
            const sa = Math.sin(ang);
            g.lineBetween(f.x + ca * r0, f.y + sa * r0, f.x + ca * len, f.y + sa * len);
          }
          g.fillStyle(f.color, a);
          g.fillCircle(f.x, f.y, 4 * size * a + 1);
          break;
        }
        case 'slash': {
          const reach = (34 + t * 30) * size;
          const half = 0.9 * (1 - t) + 0.25;
          g.lineStyle(7 * a + 1, f.color, a * 0.85);
          g.beginPath();
          g.arc(f.x, f.y, reach, f.ang - half, f.ang + half, false, 0);
          g.strokePath();
          g.lineStyle(2.5, 0xffffff, a * 0.5);
          g.beginPath();
          g.arc(f.x, f.y, reach, f.ang - half, f.ang + half, false, 0);
          g.strokePath();
          break;
        }
        case 'burst': {
          const n = 12;
          const dist = (12 + t * 46) * size;
          g.fillStyle(f.color, a * 0.85);
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2 + t * 0.6;
            const rr = (4 + (k % 3)) * (1 - t) * size + 1.5;
            g.fillCircle(f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist, rr);
          }
          break;
        }
        default: {
          const r = (10 + t * 44) * size;
          g.lineStyle(3.5 * a + 1, f.color, a * 0.85);
          g.strokeCircle(f.x, f.y, r);
          g.lineStyle(2, 0xffffff, a * 0.4);
          g.strokeCircle(f.x, f.y, r * 0.62);
          break;
        }
      }
    }
  }

  private drawServeHint(g: Phaser.GameObjects.Graphics): void {
    const w = this.world;
    if (w.phase !== 'serve') return;
    const s = this.renderPlayerPos(w.server);
    g.lineStyle(3, P.serveHint, 0.45);
    g.strokeCircle(s.x, s.y - PLAYER_H - 26, 10);
    g.lineStyle(3, P.serveHint, 0.95);
    g.lineBetween(s.x - 6, s.y - PLAYER_H - 26, s.x + 6, s.y - PLAYER_H - 26);
  }

  private drawNamePlates(g: Phaser.GameObjects.Graphics): void {
    const cy = this.plateCy;
    const pad = 12;
    const av = 28;
    const h = 42;
    for (let i = 0; i < 2; i++) {
      const idx = i as 0 | 1;
      const cos = this.cosmeticFor(idx);
      const name = idx === this.localIndex() ? this.localName : this.remoteName;
      const accent = idx === 0 ? P.player0 : P.player1;

      const nameText = this.nameTexts[idx];
      nameText.setText(name);
      const w = pad + av + 8 + nameText.width + pad;
      const x0 = idx === 0 ? 16 : VIEW_W - 16 - w;
      const y0 = cy - h / 2;

      g.fillStyle(0x000000, 0.3);
      g.fillRoundedRect(x0, y0, w, h, h / 2);
      g.lineStyle(2, accent, 0.95);
      g.strokeRoundedRect(x0, y0, w, h, h / 2);

      const cx = x0 + pad + av / 2;
      g.fillStyle(accent, 0.9);
      g.fillCircle(cx, cy, av / 2 + 2);

      this.avatarTexts[idx].setText(cos.emoji || '●').setPosition(cx, cy + 1);
      nameText.setPosition(cx + av / 2 + 8, cy).setColor('#ffffff');
    }
  }

  private drawPlayer(g: Phaser.GameObjects.Graphics, i: 0 | 1): void {
    const p = this.world.players[i];
    const pos = this.renderPlayerPos(i);
    const cos = this.cosmeticFor(i);
    const color = i === 0 ? P.player0 : P.player1;
    const topY = pos.y - PLAYER_H;

    g.fillStyle(P.shadow, 0.16);
    g.fillEllipse(pos.x, GROUND_Y + 2, 46, 10);

    g.fillStyle(color, 1);
    g.fillRoundedRect(pos.x - 14, topY + 26, 28, PLAYER_H - 26, 10);

    if (cos.emoji) {
      this.faces[i].setText(cos.emoji).setPosition(pos.x, topY + 17).setVisible(true);
    } else {
      g.fillStyle(P.skin, 1);
      g.fillCircle(pos.x, topY + 16, 13);
    }

    this.drawRacket(g, p, pos.x, pos.y, cos);
  }

  private drawRacket(
    g: Phaser.GameObjects.Graphics,
    p: PlayerState,
    x: number,
    y: number,
    cos: Cosmetic,
  ): void {
    const shoulder = {
      x: x + p.facing * SHOULDER_DX,
      y: y - PLAYER_H * SHOULDER_DY,
    };
    const head = { x: shoulder.x + p.rx, y: shoulder.y + p.ry };
    const ang = Math.atan2(head.y - shoulder.y, head.x - shoulder.x);

    const speed = Math.hypot(p.rvx, p.rvy);
    const hot = Math.min(1, speed / 1400);
    if (hot > 0.08 && this.world.shuttle.live) {
      const reach = Math.hypot(head.x - shoulder.x, head.y - shoulder.y);
      g.lineStyle(6 + 10 * hot, cos.trail, 0.18 + 0.3 * hot);
      g.beginPath();
      g.arc(shoulder.x, shoulder.y, reach, ang - 0.55, ang, false, 0);
      g.strokePath();
    }

    const hx = head.x - Math.cos(ang) * 12;
    const hy = head.y - Math.sin(ang) * 12;
    g.lineStyle(6, P.skin, 1);
    g.lineBetween(shoulder.x, shoulder.y, hx, hy);

    g.save();
    g.translateCanvas(head.x, head.y);
    g.rotateCanvas(ang);
    g.lineStyle(6, P.grip, 0.95);
    g.lineBetween(-12, 0, -2, 0);
    g.lineStyle(3, cos.racket, 0.95);
    g.strokeEllipse(9, 0, 34, 28);
    g.restore();

    if (hot > 0.15) {
      g.lineStyle(2, cos.racket, 0.12 + 0.28 * hot);
      g.strokeCircle(head.x, head.y, CONTACT_R);
    }
  }

  private drawShuttle(g: Phaser.GameObjects.Graphics): void {
    const s = this.renderShuttle();
    const angle = s.live ? Math.atan2(s.vy, s.vx) : Math.PI / 2;

    // speed trail: sampled by distance and aged out by time, so it reads the
    // same at 60Hz and 165Hz. Tapered and brighter toward the shuttle, and
    // tinted with whoever struck it last.
    const now = performance.now();
    const last = this.trail[this.trail.length - 1];
    if (s.live && (!last || Math.hypot(s.x - last.x, s.y - last.y) > 1.5)) {
      this.trail.push({ x: s.x, y: s.y, t: now });
    }
    const cutoff = now - TRAIL_MS;
    while (this.trail.length && this.trail[0].t < cutoff) this.trail.shift();
    while (this.trail.length > 80) this.trail.shift();

    const n = this.trail.length;
    if (n >= 2) {
      const head = this.trail[n - 1];
      const fade = s.live ? 1 : Math.max(0, 1 - (now - head.t) / 140);
      if (fade > 0.01) {
        const color = this.trailColor();
        for (let i = 1; i < n; i++) {
          const p0 = this.trail[i - 1];
          const p1 = this.trail[i];
          const f = i / (n - 1);
          const wdt = 1 + f * 7;
          const a = (0.04 + f * 0.42) * fade;
          g.fillStyle(color, a);
          g.fillCircle(p1.x, p1.y, wdt * 0.5);
          g.lineStyle(wdt, color, a);
          g.lineBetween(p0.x, p0.y, p1.x, p1.y);
        }
        g.fillStyle(color, 0.45 * fade);
        g.fillCircle(head.x, head.y, 5);
      }
    }

    const height = Phaser.Math.Clamp((GROUND_Y - s.y) / 420, 0, 1);
    g.fillStyle(P.shadow, 0.3 * (1 - height));
    g.fillEllipse(s.x, GROUND_Y - 2, 26 * (1 - height * 0.5), 7 * (1 - height * 0.5));

    g.fillStyle(P.shuttleHalo, 0.1);
    g.fillCircle(s.x, s.y, 15);
    g.fillStyle(P.shuttleHalo, 0.16);
    g.fillCircle(s.x, s.y, 10);

    g.lineStyle(2, P.shuttleFeather, 0.95);
    for (let k = -1; k <= 1; k++) {
      const a = angle + Math.PI + k * 0.4;
      g.lineBetween(s.x, s.y, s.x + Math.cos(a) * 16, s.y + Math.sin(a) * 16);
    }
    g.fillStyle(P.shuttle, 1);
    g.fillCircle(s.x, s.y, 5.5);
    g.lineStyle(2, P.floorEdge, 0.9);
    g.strokeCircle(s.x, s.y, 5.5);
  }
}
