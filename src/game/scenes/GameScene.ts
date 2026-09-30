import Phaser from 'phaser';
import {
  COURT_LEFT,
  COURT_RIGHT,
  GROUND_Y,
  LAG_COMP_MAX_MS,
  NET_TICK_HZ,
  NET_X,
  NET_INPUT_HZ,
  PLAYER_H,
  SHOULDER_DX,
  SHOULDER_DY,
  VIEW_H,
  VIEW_W,
} from '../constants';
import {
  contactRadius,
  emptyPartyState,
  optionLabel,
  PARTY_ROUND_SCORE,
  PARTY_ROUNDS,
  PARTY_VOTE_MS,
  pickCandidates,
  type PartyState,
} from '../config';
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
  setWorldOption,
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
  AURA_COLORS,
  CAPE_COLORS,
  CAPE_SHAPE,
  DEFAULT_COSMETIC,
  HAT_COLORS,
  HAT_KIND,
  PET_COLORS,
  PET_KIND,
  RACKET_SKIN_COLORS,
  sanitizeCosmetic,
  WING_COLORS,
  WING_SHAPE,
  type AuraId,
  type CapeId,
  type Cosmetic,
  type HatId,
  type HitStyle,
  type PetId,
  type RacketSkinId,
  type TrailId,
} from '../cosmetics';
import { isTierId, tierById, type TierId } from '../ranks';
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
  /** the local player's rank tier (visual only) */
  localRank?: TierId;
  /** starting court theme */
  theme?: ThemeId;
  /** rotate the court theme once a match finishes */
  autoCycleTheme?: boolean;
  onThemeChange?: (theme: ThemeId) => void;
  /** run the round-based fun mode (vote → play → scoreboard) */
  party?: boolean;
  /** fun-mode state, mirrored to the Vue overlay */
  onParty?: (state: PartyState) => void;
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

/** lifetime of each hit-effect style, in seconds */
const EFFECT_SPAN: Record<HitStyle, number> = {
  ring: 0.36,
  spark: 0.4,
  slash: 0.22,
  burst: 0.36,
  shock: 0.4,
  frost: 0.36,
  petal: 0.52,
  lightning: 0.28,
  star: 0.42,
  prism: 0.54,
  vortex: 0.54,
  shards: 0.44,
  ripple: 0.56,
  confetti: 0.58,
  cross: 0.3,
  hex: 0.5,
  spiral: 0.5,
  web: 0.46,
  bubble: 0.6,
  feather: 0.62,
  comet: 0.4,
  shatter: 0.36,
  smoke: 0.66,
  sonic: 0.42,
  gear: 0.54,
  nova: 0.5,
  rune: 0.6,
  bomb: 0.44,
  flamenova: 0.48,
  icicle: 0.42,
  sword: 0.26,
  claw: 0.32,
  meteor: 0.5,
  beam: 0.34,
  poison: 0.6,
  note: 0.62,
  heart: 0.66,
  coin: 0.5,
  dice: 0.46,
  arrow: 0.4,
  shield: 0.44,
  chain: 0.52,
  thorn: 0.44,
  blossom: 0.5,
  cube: 0.44,
  pyramid: 0.5,
  aim: 0.4,
  sonar: 0.5,
  wind: 0.46,
  sand: 0.5,
  acid: 0.5,
  sun: 0.46,
  moon: 0.5,
  eye: 0.46,
  portal: 0.52,
  dna: 0.56,
  atom: 0.52,
  sparkle: 0.46,
  ink: 0.44,
  firework: 0.72,
  ringburst: 0.44,
  swordcross: 0.34,
  shuriken: 0.46,
  boulder: 0.5,
  quake: 0.5,
  tornado: 0.6,
  blizzard: 0.56,
  volcano: 0.62,
  tsunami: 0.56,
  aurora: 0.6,
  starlight: 0.52,
  galaxy: 0.62,
  blackhole: 0.6,
  meteorrain: 0.66,
  rainbow: 0.56,
  laser: 0.3,
  plasma: 0.46,
  magnet: 0.5,
  foam: 0.56,
  leafstorm: 0.6,
  sakura: 0.62,
  mushroom: 0.62,
  pixelate: 0.5,
  glitch: 0.4,
  binary: 0.56,
  ringdance: 0.6,
  butterfly: 0.62,
  phantom: 0.54,
  holy: 0.5,
  thorncrown: 0.5,
  tide: 0.5,
  starfall: 0.56,
  prismfan: 0.5,
};
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
  /** rank tiers, shown as the name-plate ring colour */
  private localRank: TierId = 'bronze';
  private remoteRank: TierId = 'bronze';
  /** short "point!" label shown beside the score */
  private pointMsg!: Phaser.GameObjects.Text;
  private plateCy = 72;
  /** guards against a phase-change race emitting gameover twice (guest) */
  private gameoverSeen = false;

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

  /** fun mode: vote → play → scoreboard, repeated PARTY_ROUNDS times */
  private party: PartyState = emptyPartyState();
  private partyRoundScored = false;

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
    this.localRank = isTierId(this.cfg.localRank) ? this.cfg.localRank : 'bronze';
    this.remoteRank = 'bronze';
    this.gameoverSeen = false;
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
        session.send({
          t: 'hello',
          name: this.localName,
          rank: this.localRank,
          cosmetic: this.localCosmetic,
        });
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

    if (this.cfg.party) this.startParty();
  }

  // ---- fun mode -----------------------------------------------------------

  /** called from the Vue overlay to cast this round's vote */
  voteParty(optionId: string): void {
    const st = this.party;
    if (!st.active || st.stage !== 'vote' || !st.options.includes(optionId)) return;
    const me = this.localIndex();
    if (st.votes[me]) return;
    st.votes[me] = optionId;
    if (this.cfg.role === 'single') {
      st.votes[1] = st.options[Math.floor(Math.random() * st.options.length)];
    } else {
      this.cfg.session?.send({ t: 'vote', round: st.round, option: optionId });
    }
    this.maybeResolveVote();
    this.pushParty();
  }

  /** called from the Vue overlay to move past the scoreboard */
  nextPartyRound(): void {
    const st = this.party;
    if (!st.active || st.stage !== 'result' || !st.localCanAdvance) return;
    if (st.round >= st.total) {
      st.stage = 'done';
      this.cfg.session?.send({ t: 'party', round: st.round, kind: 'done', scores: st.scores });
      this.pushParty();
      return;
    }
    this.beginVote();
  }

  private startParty(): void {
    this.party = emptyPartyState(PARTY_ROUNDS);
    this.party.active = true;
    this.partyRoundScored = false;
    if (this.cfg.role === 'host' || this.cfg.role === 'single') this.beginVote();
    else this.pushParty();
  }

  private beginVote(): void {
    const st = this.party;
    st.round += 1;
    st.stage = 'vote';
    st.votes = [null, null];
    st.chosen = null;
    st.options = pickCandidates(3).map((o) => o.id);
    st.voteEndsAt = performance.now() + PARTY_VOTE_MS;
    this.cfg.session?.send({ t: 'party', round: st.round, kind: 'vote', options: st.options });
    this.pushParty();
  }

  /** host / single only: settle the vote once both picks are in (or time is up) */
  private maybeResolveVote(): void {
    const st = this.party;
    if (st.stage !== 'vote' || !st.localCanAdvance) return;
    const [a, b] = st.votes;
    if (!a || !b) {
      if (performance.now() < st.voteEndsAt) return;
      for (let i = 0; i < 2; i++) {
        if (!st.votes[i]) st.votes[i] = st.options[Math.floor(Math.random() * st.options.length)];
      }
    }
    const [va, vb] = st.votes as [string, string];
    const chosen = va === vb ? va : Math.random() < 0.5 ? va : vb;
    this.startRound(chosen);
    this.cfg.session?.send({ t: 'party', round: st.round, kind: 'play', option: chosen });
  }

  private startRound(optionId: string): void {
    const st = this.party;
    st.stage = 'play';
    st.chosen = optionId;
    setWorldOption(this.world, optionId);
    setWorldOption(this.target, optionId);
    // party badminton rounds are short
    if (this.world.mode === 'match') {
      this.world.config.winScore = PARTY_ROUND_SCORE;
      this.target.config.winScore = PARTY_ROUND_SCORE;
    }
    this.hasSnapshot = false;
    this.partyRoundScored = false;
    this.racket.reset();
    this.touchControls?.reset();
    this.pushParty();
  }

  /** host / single only: bank the round once the world hits gameover */
  private checkPartyRoundEnd(): void {
    const st = this.party;
    if (!st.active || st.stage !== 'play' || !st.localCanAdvance) return;
    if (this.partyRoundScored) return;
    const w = this.world;
    if (w.phase !== 'gameover') return;
    this.partyRoundScored = true;

    const winner = w.winner;
    if (winner === 0 || winner === 1) st.scores[winner] += 1;
    const detail =
      w.mode === 'juggle'
        ? `颠球 ${w.juggle.count[0]} : ${w.juggle.count[1]}`
        : `比分 ${w.score[0]} : ${w.score[1]}`;
    st.results.push({
      round: st.round,
      optionId: st.chosen ?? '',
      label: optionLabel(st.chosen ?? ''),
      detail,
      winner,
    });
    st.stage = 'result';
    this.cfg.session?.send({
      t: 'party',
      round: st.round,
      kind: 'result',
      option: st.chosen ?? '',
      scores: st.scores,
      label: optionLabel(st.chosen ?? ''),
      detail,
      winner,
    });
    this.pushParty();
  }

  private pushParty(): void {
    const st = this.party;
    st.localCanAdvance = this.cfg.role !== 'guest';
    // the overlay always treats index 0 as "me", so mirror the host's view
    if (this.cfg.role === 'guest') {
      this.cfg.onParty?.({
        ...st,
        votes: [st.votes[1], st.votes[0]],
        scores: [st.scores[1], st.scores[0]],
        results: st.results.map((r) => ({ ...r, winner: r.winner < 0 ? -1 : 1 - r.winner })),
      });
      return;
    }
    this.cfg.onParty?.(st);
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
      if (isTierId(m.rank)) this.remoteRank = m.rank;
    } else if (m.t === 'emote') {
      // the peer's reaction lands on their own player
      this.spawnEmote(this.cfg.role === 'host' ? 1 : 0, m.id);
    } else if (m.t === 'ping') {
      this.cfg.session?.send({ t: 'pong', ts: m.ts });
    } else if (m.t === 'pong') {
      this.telemetry.onPong(m.ts, performance.now());
    } else if (m.t === 'rematch') {
      this.resetWorld();
    } else if (m.t === 'vote') {
      const st = this.party;
      if (st.active && m.round === st.round && st.stage === 'vote') {
        st.votes[this.cfg.role === 'host' ? 1 : 0] = m.option;
        this.maybeResolveVote();
        this.pushParty();
      }
    } else if (m.t === 'party') {
      this.applyPartyMessage(m);
    }
  }

  /** guest side of the fun-mode handshake */
  private applyPartyMessage(m: Extract<NetMessage, { t: 'party' }>): void {
    const st = this.party;
    st.active = true;
    if (m.kind === 'vote') {
      st.round = m.round;
      st.stage = 'vote';
      st.options = m.options ?? [];
      st.votes = [null, null];
      st.chosen = null;
      st.voteEndsAt = performance.now() + PARTY_VOTE_MS;
    } else if (m.kind === 'play' && m.option) {
      st.chosen = m.option;
      st.stage = 'play';
      if (this.cfg.role === 'guest') {
        setWorldOption(this.world, m.option);
        setWorldOption(this.target, m.option);
        if (this.world.mode === 'match') this.world.config.winScore = PARTY_ROUND_SCORE;
        this.hasSnapshot = false;
        this.racket.reset();
        this.touchControls?.reset();
      }
      this.partyRoundScored = false;
    } else if (m.kind === 'result') {
      st.stage = 'result';
      if (m.scores) st.scores = [m.scores[0], m.scores[1]];
      if (typeof m.winner === 'number') {
        st.results.push({
          round: m.round,
          optionId: m.option ?? '',
          label: m.label ?? optionLabel(m.option ?? ''),
          detail: m.detail ?? '',
          winner: m.winner,
        });
      }
    } else if (m.kind === 'done') {
      st.stage = 'done';
      if (m.scores) st.scores = [m.scores[0], m.scores[1]];
    }
    this.pushParty();
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
    // fun mode drives its own round flow, so a manual reset would desync it
    if (this.party.active && this.party.stage !== 'done') return;
    this.world = createWorld();
    this.target = createWorld();
    this.hasSnapshot = false;
    this.gameoverSeen = false;
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

  /** the shuttle trail; the last hitter's trail style decides how it looks */
  private drawTrail(g: Phaser.GameObjects.Graphics, fade: number): void {
    const n = this.trail.length;
    const head = this.trail[n - 1];
    const lh = this.world.lastHitter;
    const style: TrailId = lh === 0 || lh === 1 ? this.cosmeticFor(lh).trailStyle : 'classic';
    if (style === 'none') return;
    const now = performance.now();
    const base = this.trailColor();
    const colorAt = (f: number): number =>
      style === 'rainbow'
        ? Phaser.Display.Color.HSVToRGB((f + now / 4000) % 1, 0.85, 1).color
        : base;

    for (let i = 1; i < n; i++) {
      const p0 = this.trail[i - 1];
      const p1 = this.trail[i];
      const f = i / (n - 1);
      const wdt = 1 + f * 7;
      const a = (0.04 + f * 0.42) * fade;
      const color = colorAt(i * 0.02);
      switch (style) {
        case 'fire': {
          g.fillStyle(color, a * 1.15);
          g.fillCircle(p1.x + Math.sin(now / 90 + i) * 2, p1.y - f * 3, wdt * 0.7);
          if (i % 3 === 0) {
            g.fillStyle(0xffd07a, a * 0.7);
            g.fillCircle(p1.x, p1.y - 4, wdt * 0.4);
          }
          break;
        }
        case 'ice': {
          g.lineStyle(wdt, color, a);
          g.lineBetween(p0.x, p0.y, p1.x, p1.y);
          if (i % 4 === 0) {
            g.fillStyle(0xffffff, a * 0.8);
            g.fillTriangle(p1.x, p1.y - 4, p1.x - 3, p1.y + 3, p1.x + 3, p1.y + 3);
          }
          break;
        }
        case 'electric': {
          const jx = Math.sin(now / 60 + i * 1.7) * 3;
          const jy = Math.cos(now / 50 + i * 2.1) * 3;
          g.lineStyle(2 + f * 4, color, a * 1.3);
          g.lineBetween(p0.x, p0.y, p1.x + jx, p1.y + jy);
          break;
        }
        case 'leaf': {
          g.fillStyle(color, a * 1.3);
          g.fillEllipse(p1.x, p1.y, wdt * 1.8, wdt * 0.9);
          break;
        }
        case 'void': {
          g.fillStyle(0x120a20, a * 0.9);
          g.fillCircle(p1.x, p1.y, wdt * 0.7);
          g.fillStyle(color, a * 0.7);
          g.fillCircle(p1.x, p1.y, wdt * 0.35);
          break;
        }
        case 'gold': {
          g.fillStyle(color, a * 1.2);
          g.fillCircle(p1.x, p1.y, wdt * 0.55);
          if (i % 5 === 0) {
            g.lineStyle(1.5, 0xffffff, a);
            g.lineBetween(p1.x - 3, p1.y, p1.x + 3, p1.y);
            g.lineBetween(p1.x, p1.y - 3, p1.x, p1.y + 3);
          }
          break;
        }
        case 'pixel': {
          const sq = Math.max(3, wdt * 0.9);
          g.fillStyle(color, a * 1.25);
          g.fillRect(p1.x - sq / 2, p1.y - sq / 2, sq, sq);
          break;
        }
        default: {
          g.fillStyle(color, a);
          g.fillCircle(p1.x, p1.y, wdt * 0.5);
          g.lineStyle(wdt, color, a);
          g.lineBetween(p0.x, p0.y, p1.x, p1.y);
          break;
        }
      }
    }
    g.fillStyle(colorAt(n * 0.02), 0.45 * fade);
    g.fillCircle(head.x, head.y, 5);
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
      const rmax = this.world.config.racketMax;
      const targetX = shoulder.x + tc.joyX * rmax;
      const targetY = shoulder.y + tc.joyY * rmax;
      // while the stick is released the racket snaps home -- that return motion
      // must not be read as a swing, so freeze the measured velocity
      racket = this.racket.update(
        targetX,
        targetY,
        shoulder.x,
        shoulder.y,
        dt,
        !tc.joyActive,
        this.world.config,
      );
      buttons = tc.read();
    } else {
      const pointer = this.input.activePointer;
      this.cameras.main.getWorldPoint(pointer.x, pointer.y, this.tmp);
      racket = this.racket.update(
        this.tmp.x,
        this.tmp.y,
        shoulder.x,
        shoulder.y,
        dt,
        false,
        this.world.config,
      );
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
    const rawDt = Math.min(deltaMs / 1000, 0.05);
    // fun-mode "slow motion" scales the whole simulation; both sides agree on
    // the factor through their config so the steps stay deterministic
    const dt = rawDt * (this.world.config.timeScale || 1);
    this.frameDt = rawDt;
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

    if (this.party.active) {
      if (this.party.stage === 'vote') this.maybeResolveVote();
      else if (this.party.stage === 'play') this.checkPartyRoundEnd();
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
    stepPlayerLocal(
      me,
      1,
      input,
      dt,
      this.world.config,
      this.world.phase === 'serve' && this.world.mode === 'match'
        ? this.world.config.serveNetMargin
        : 0,
    );

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
      integrateShuttle(this.predShuttle, dt, this.world.config);
      const floor = GROUND_Y - this.world.config.shuttleR;
      if (this.predShuttle.y >= floor) {
        this.predShuttle.y = floor;
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
      if (e.type === 'gameover') {
        if (this.gameoverSeen) continue;
        this.gameoverSeen = true;
        this.maybeCycleTheme();
      }
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

    // the keepy-uppy challenge reuses the big score digits for its hit counts
    if (w.mode === 'juggle') {
      this.scoreLeft.setText(String(w.juggle.count[0]));
      this.scoreRight.setText(String(w.juggle.count[1]));
      this.pointMsg.setVisible(false);
      this.setReplayVisible(false);
      this.subMessage.setY(VIEW_H / 2 - 46);
      if (w.phase === 'gameover') {
        const won = w.winner === local;
        this.message.setText(w.winner < 0 ? '平局！' : won ? '你赢了！' : '你输了');
        this.message.setColor(won ? P.msgWin : P.msgLose);
        this.subMessage.setText(`颠球 ${w.juggle.count[0]} : ${w.juggle.count[1]}`);
      } else if (w.phase === 'serve') {
        this.message.setText('');
        this.subMessage.setText(w.juggle.turn === local ? '准备颠球…' : '等待对手…');
      } else {
        this.message.setText('');
        const left = Math.max(0, Math.ceil(w.juggle.timeLeft));
        this.subMessage.setText(
          w.juggle.turn === local ? `轮到你颠球 · 剩 ${left}s` : `对手颠球中 · 剩 ${left}s`,
        );
      }
      return;
    }

    this.scoreLeft.setText(String(w.score[0]));
    this.scoreRight.setText(String(w.score[1]));
    this.pointMsg.setVisible(false);

    // in fun mode the replay button would skip the party flow, so hide it
    if (this.party.active && w.phase === 'gameover') {
      this.message.setText('本轮结束');
      this.message.setColor(P.msgWin);
      this.setReplayVisible(false);
      this.subMessage.setY(VIEW_H / 2 + 30);
      this.subMessage.setText('等待下一轮…');
      return;
    }

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
      const how = this.touchControls ? '向前拨右摇杆' : '向前挥鼠标';
      this.subMessage.setText(w.server === local ? `你的发球 — ${how}（向后收拍不算）` : '等待对方发球…');
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
      const span = EFFECT_SPAN[f.style] ?? 0.4;
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
        case 'shock': {
          const r = (8 + t * 54) * size;
          g.lineStyle(9 * a + 1, f.color, a * 0.9);
          g.strokeCircle(f.x, f.y, r);
          g.lineStyle(3 * a + 1, 0xffffff, a * 0.5);
          g.strokeCircle(f.x, f.y, r * 0.7);
          g.lineStyle(2.5 * a + 1, f.color, a * 0.6);
          g.strokeCircle(f.x, f.y, r * 0.4);
          break;
        }
        case 'petal': {
          const n = 13;
          const dist = (10 + t * 52) * size;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2 + t * 1.2;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist;
            g.fillStyle(f.color, a * 0.9);
            g.fillEllipse(px, py, 9 * (1 - t * 0.5), 5 * (1 - t * 0.5));
          }
          break;
        }
        case 'lightning': {
          const n = 5;
          const len = (16 + t * 42) * size;
          g.lineStyle(3 * a + 1, f.color, a);
          for (let k = 0; k < n; k++) {
            const base = f.seed + (k / n) * Math.PI * 2;
            let px = f.x;
            let py = f.y;
            const segs = 4;
            for (let s = 1; s <= segs; s++) {
              const jitter = Math.sin(f.seed + k * 7 + s * 3) * 0.09 * (1 - t);
              const ang = base + (s / segs) * 0.5 + jitter;
              const nx = f.x + (Math.cos(ang) * len * s) / segs;
              const ny = f.y + (Math.sin(ang) * len * s) / segs;
              g.lineBetween(px, py, nx, ny);
              px = nx;
              py = ny;
            }
          }
          g.fillStyle(0xffffff, a * 0.8);
          g.fillCircle(f.x, f.y, 5 * size * a + 1);
          break;
        }
        case 'frost': {
          const n = 8;
          const dist = (10 + t * 46) * size;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2 + t * 0.8;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist;
            const s = 9 * (1 - t * 0.5) * size;
            g.fillStyle(f.color, a * 0.9);
            g.fillTriangle(px, py - s, px + s * 0.6, py, px, py + s);
            g.fillTriangle(px, py - s, px - s * 0.6, py, px, py + s);
          }
          g.lineStyle(2 * a + 1, f.color, a * 0.5);
          g.strokeCircle(f.x, f.y, (10 + t * 40) * size);
          break;
        }
        case 'star': {
          const rays = 8;
          const len = (14 + t * 62) * size;
          g.lineStyle(4 * a + 1, f.color, a * 0.95);
          for (let k = 0; k < rays; k++) {
            const ang = f.seed + (k / rays) * Math.PI * 2;
            const l = k % 2 === 0 ? len : len * 0.55;
            g.lineBetween(f.x, f.y, f.x + Math.cos(ang) * l, f.y + Math.sin(ang) * l);
          }
          g.fillStyle(0xffffff, a);
          g.fillCircle(f.x, f.y, 5 * size * a + 1);
          break;
        }
        case 'prism': {
          for (let ring = 0; ring < 3; ring++) {
            const h = ((f.seed * 40 + t * 260 + ring * 120) % 360) / 360;
            const col = Phaser.Display.Color.HSVToRGB(h, 1, 1).color;
            const r = (8 + t * 52 + ring * 7) * size;
            g.lineStyle(6 - ring * 1.5, col, a * (0.9 - ring * 0.2));
            g.strokeCircle(f.x, f.y, r);
          }
          break;
        }
        case 'vortex': {
          const arms = 4;
          const steps = 10;
          g.lineStyle(3 * a + 1, f.color, a * 0.9);
          for (let arm = 0; arm < arms; arm++) {
            const a0 = f.seed + (arm / arms) * Math.PI * 2;
            let px = f.x;
            let py = f.y;
            for (let s = 1; s <= steps; s++) {
              const ang = a0 + (s / steps) * 2.6 + t * 1.5;
              const r = (s / steps) * (14 + t * 46) * size;
              const nx = f.x + Math.cos(ang) * r;
              const ny = f.y + Math.sin(ang) * r;
              g.lineBetween(px, py, nx, ny);
              px = nx;
              py = ny;
            }
          }
          g.fillStyle(f.color, a * 0.5);
          g.fillCircle(f.x, f.y, 8 * size);
          break;
        }
        case 'shards': {
          const n = 10;
          const dist = (10 + t * 50) * size;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2 + t * 0.5;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist;
            const s = 10 * (1 - t * 0.6) * size;
            const spin = ang + t * 3;
            g.fillStyle(f.color, a * 0.9);
            g.fillTriangle(
              px + Math.cos(spin) * s,
              py + Math.sin(spin) * s,
              px + Math.cos(spin + 2.2) * s,
              py + Math.sin(spin + 2.2) * s,
              px + Math.cos(spin + 4.4) * s,
              py + Math.sin(spin + 4.4) * s,
            );
          }
          break;
        }
        case 'ripple': {
          for (let k = 0; k < 3; k++) {
            const rt = Math.min(1, t * 1.4 - k * 0.18);
            if (rt <= 0) continue;
            const r = (6 + rt * 52) * size;
            g.lineStyle((3 - k) * a + 0.5, f.color, a * (0.8 - k * 0.2));
            g.strokeCircle(f.x, f.y, r);
          }
          g.fillStyle(0xffffff, a * 0.5);
          g.fillCircle(f.x, f.y, 5 * size * a + 1);
          break;
        }
        case 'confetti': {
          const n = 16;
          const dist = (12 + t * 54) * size;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2 + t * 0.9;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist;
            const h = ((k * 37 + f.seed * 20) % 360) / 360;
            const col = Phaser.Display.Color.HSVToRGB(h, 0.9, 1).color;
            const s = 7 * (1 - t * 0.5) * size;
            g.fillStyle(col, a * 0.95);
            g.fillRect(px - s / 2, py - s / 2, s, s * 0.55);
          }
          break;
        }
        case 'cross': {
          const len = (18 + t * 50) * size;
          const ca = Math.cos(f.ang);
          const sa = Math.sin(f.ang);
          g.lineStyle(6 * a + 1, f.color, a * 0.9);
          g.lineBetween(f.x - ca * len, f.y - sa * len, f.x + ca * len, f.y + sa * len);
          g.lineBetween(f.x + sa * len, f.y - ca * len, f.x - sa * len, f.y + ca * len);
          g.lineStyle(2.5, 0xffffff, a * 0.6);
          g.lineBetween(f.x - ca * len * 0.6, f.y - sa * len * 0.6, f.x + ca * len * 0.6, f.y + sa * len * 0.6);
          g.fillStyle(0xffffff, a);
          g.fillCircle(f.x, f.y, 5 * size * a + 1);
          break;
        }
        case 'hex': {
          const sides = 6;
          const r = (10 + t * 46) * size;
          const rot = f.seed + t * 2.2;
          g.lineStyle(4 * a + 1, f.color, a * 0.9);
          g.beginPath();
          for (let k = 0; k < sides; k++) {
            const ang = rot + (k / sides) * Math.PI * 2;
            const px = f.x + Math.cos(ang) * r;
            const py = f.y + Math.sin(ang) * r;
            if (k === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.closePath();
          g.strokePath();
          const ri = r * 0.55;
          g.lineStyle(2 * a + 1, 0xffffff, a * 0.5);
          g.beginPath();
          for (let k = 0; k < sides; k++) {
            const ang = -rot + (k / sides) * Math.PI * 2;
            const px = f.x + Math.cos(ang) * ri;
            const py = f.y + Math.sin(ang) * ri;
            if (k === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.closePath();
          g.strokePath();
          break;
        }
        case 'spiral': {
          const turns = 3.2;
          const steps = 26;
          g.lineStyle(3 * a + 1, f.color, a * 0.9);
          g.beginPath();
          for (let s = 0; s <= steps; s++) {
            const u = s / steps;
            const ang = f.seed + u * turns * Math.PI * 2 + t * 2;
            const r = u * (12 + t * 46) * size;
            const px = f.x + Math.cos(ang) * r;
            const py = f.y + Math.sin(ang) * r;
            if (s === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.strokePath();
          break;
        }
        case 'web': {
          const spokes = 8;
          const reach = (10 + t * 48) * size;
          g.lineStyle(1.6 * a + 0.4, f.color, a * 0.8);
          for (let k = 0; k < spokes; k++) {
            const ang = f.seed + (k / spokes) * Math.PI * 2;
            g.lineBetween(f.x, f.y, f.x + Math.cos(ang) * reach, f.y + Math.sin(ang) * reach);
          }
          for (let ring = 1; ring <= 3; ring++) {
            const rr = (ring / 3) * reach;
            g.beginPath();
            for (let k = 0; k <= spokes; k++) {
              const ang = f.seed + (k / spokes) * Math.PI * 2;
              const px = f.x + Math.cos(ang) * rr;
              const py = f.y + Math.sin(ang) * rr;
              if (k === 0) g.moveTo(px, py);
              else g.lineTo(px, py);
            }
            g.strokePath();
          }
          break;
        }
        case 'bubble': {
          const n = 7;
          for (let k = 0; k < n; k++) {
            const px = f.x + Math.sin(f.seed + k * 2.3) * (10 + k * 3) * size;
            const py = f.y + 12 * size - t * (40 + k * 6) * size;
            const rr = (4 + (k % 3) * 2) * (1 - t * 0.4) * size;
            g.lineStyle(1.8, f.color, a * 0.8);
            g.strokeCircle(px, py, rr);
            g.fillStyle(0xffffff, a * 0.25);
            g.fillCircle(px - rr * 0.3, py - rr * 0.3, rr * 0.35);
          }
          break;
        }
        case 'feather': {
          const n = 6;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2 + t * 0.6;
            const dist = (8 + t * 40) * size;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist + t * 18 * size;
            const rot = ang + t * 1.5;
            const L = 12 * (1 - t * 0.4) * size;
            g.fillStyle(f.color, a * 0.85);
            g.fillEllipse(px, py, L * 1.1, L * 0.5);
            g.lineStyle(1.4, 0xffffff, a * 0.5);
            g.lineBetween(px - Math.cos(rot) * L, py - Math.sin(rot) * L, px + Math.cos(rot) * L, py + Math.sin(rot) * L);
          }
          break;
        }
        case 'comet': {
          const len = (18 + t * 46) * size;
          const headX = f.x + Math.cos(f.ang) * (t * 30 - 8) * size;
          const headY = f.y + Math.sin(f.ang) * (t * 30 - 8) * size;
          const tailX = headX - Math.cos(f.ang) * len;
          const tailY = headY - Math.sin(f.ang) * len;
          g.lineStyle(8 * a + 1, f.color, a * 0.35);
          g.lineBetween(tailX, tailY, headX, headY);
          g.lineStyle(3.5 * a + 1, f.color, a * 0.9);
          g.lineBetween((tailX + headX) / 2, (tailY + headY) / 2, headX, headY);
          g.fillStyle(0xffffff, a);
          g.fillCircle(headX, headY, 5 * size * a + 1);
          break;
        }
        case 'shatter': {
          const n = 9;
          const reach = (10 + t * 48) * size;
          g.lineStyle(2.4 * a + 0.5, f.color, a * 0.9);
          for (let k = 0; k < n; k++) {
            const base = f.seed + (k / n) * Math.PI * 2;
            let px = f.x;
            let py = f.y;
            const segs = 3;
            for (let s = 1; s <= segs; s++) {
              const jit = Math.sin(f.seed + k * 5 + s * 9) * 0.35;
              const ang = base + jit;
              const nx = f.x + (Math.cos(ang) * reach * s) / segs;
              const ny = f.y + (Math.sin(ang) * reach * s) / segs;
              g.lineBetween(px, py, nx, ny);
              px = nx;
              py = ny;
            }
          }
          g.fillStyle(0xffffff, a * 0.85);
          g.fillCircle(f.x, f.y, 6 * size * a + 1);
          break;
        }
        case 'smoke': {
          const n = 5;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2;
            const dist = (6 + t * 34) * size;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist - t * 10 * size;
            const rr = (10 + t * 16) * (1 - t * 0.2) * size;
            g.fillStyle(f.color, a * 0.35);
            g.fillCircle(px, py, rr);
          }
          g.fillStyle(0xffffff, a * 0.2);
          g.fillCircle(f.x, f.y, 6 * size * a);
          break;
        }
        case 'sonic': {
          for (let k = 0; k < 3; k++) {
            const r = (10 + t * 54 + k * 12) * size;
            const half = 1.0 - k * 0.15;
            g.lineStyle((5 - k * 1.2) * a + 1, f.color, a * (0.9 - k * 0.2));
            g.beginPath();
            g.arc(f.x, f.y, r, f.ang - half, f.ang + half, false, 0);
            g.strokePath();
          }
          g.fillStyle(0xffffff, a * 0.6);
          g.fillCircle(f.x + Math.cos(f.ang) * 6 * size, f.y + Math.sin(f.ang) * 6 * size, 5 * size * a + 1);
          break;
        }
        case 'gear': {
          const teeth = 12;
          const rOuter = (14 + t * 40) * size;
          const rInner = rOuter * 0.72;
          const rot = f.seed + t * 2.4;
          g.lineStyle(3 * a + 1, f.color, a * 0.9);
          g.beginPath();
          for (let k = 0; k < teeth * 2; k++) {
            const ang = rot + (k / (teeth * 2)) * Math.PI * 2;
            const rr = k % 2 === 0 ? rOuter : rInner;
            const px = f.x + Math.cos(ang) * rr;
            const py = f.y + Math.sin(ang) * rr;
            if (k === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.closePath();
          g.strokePath();
          g.lineStyle(2 * a + 1, 0xffffff, a * 0.4);
          g.strokeCircle(f.x, f.y, rInner * 0.5);
          break;
        }
        case 'nova': {
          const rays = 12;
          const len = (16 + t * 60) * size;
          g.lineStyle(2.5 * a + 0.5, f.color, a * 0.6);
          for (let k = 0; k < rays; k++) {
            const ang = f.seed + (k / rays) * Math.PI * 2;
            g.lineBetween(
              f.x + Math.cos(ang) * 8 * size,
              f.y + Math.sin(ang) * 8 * size,
              f.x + Math.cos(ang) * len,
              f.y + Math.sin(ang) * len,
            );
          }
          g.lineStyle(6 * a + 1, f.color, a * 0.9);
          g.strokeCircle(f.x, f.y, (8 + t * 46) * size);
          g.fillStyle(0xffffff, a * 0.9);
          g.fillCircle(f.x, f.y, (10 - t * 8) * size + 1);
          break;
        }
        case 'rune': {
          const sides = 5;
          const r = (12 + t * 44) * size;
          const rot = f.seed + t * 1.6;
          g.lineStyle(3 * a + 1, f.color, a * 0.9);
          for (let star = 0; star < 2; star++) {
            g.beginPath();
            for (let k = 0; k <= sides; k++) {
              const idx = (k * 2) % sides;
              const ang = rot + (idx / sides) * Math.PI * 2 + star * (Math.PI / sides);
              const px = f.x + Math.cos(ang) * r;
              const py = f.y + Math.sin(ang) * r;
              if (k === 0) g.moveTo(px, py);
              else g.lineTo(px, py);
            }
            g.closePath();
            g.strokePath();
          }
          g.fillStyle(0xffffff, a * 0.5);
          g.fillCircle(f.x, f.y, 4 * size * a + 1);
          break;
        }
        case 'bomb': {
          g.fillStyle(0x1b1b22, a * 0.85);
          g.fillCircle(f.x, f.y, Math.max(2, (1 - t) * 14 * size));
          g.lineStyle(4 * a + 1, f.color, a * 0.9);
          g.strokeCircle(f.x, f.y, (10 + t * 46) * size);
          g.lineStyle(2, 0xffffff, a * 0.5);
          g.strokeCircle(f.x, f.y, (10 + t * 46) * size * 0.6);
          break;
        }
        case 'flamenova': {
          const tongues = 9;
          for (let k = 0; k < tongues; k++) {
            const ang = -Math.PI / 2 + (k / (tongues - 1) - 0.5) * 2.6;
            const len = (14 + t * 58) * size;
            g.fillStyle(k % 2 ? 0xffd07a : f.color, a * 0.8);
            g.fillTriangle(
              f.x + Math.cos(ang - 0.12) * 10, f.y + Math.sin(ang - 0.12) * 10,
              f.x + Math.cos(ang + 0.12) * 10, f.y + Math.sin(ang + 0.12) * 10,
              f.x + Math.cos(ang) * len, f.y + Math.sin(ang) * len,
            );
          }
          break;
        }
        case 'icicle': {
          const n = 10;
          const reach = (10 + t * 50) * size;
          g.fillStyle(f.color, a * 0.85);
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2;
            g.fillTriangle(
              f.x + Math.cos(ang - 0.14) * reach * 0.4, f.y + Math.sin(ang - 0.14) * reach * 0.4,
              f.x + Math.cos(ang + 0.14) * reach * 0.4, f.y + Math.sin(ang + 0.14) * reach * 0.4,
              f.x + Math.cos(ang) * reach, f.y + Math.sin(ang) * reach,
            );
          }
          break;
        }
        case 'sword': {
          const len = (30 + t * 60) * size;
          const ca = Math.cos(f.ang);
          const sa = Math.sin(f.ang);
          g.lineStyle(9 * a + 1, f.color, a * 0.35);
          g.lineBetween(f.x - ca * len * 0.5, f.y - sa * len * 0.5, f.x + ca * len * 0.5, f.y + sa * len * 0.5);
          g.lineStyle(3 * a + 1, 0xffffff, a * 0.95);
          g.lineBetween(f.x - ca * len * 0.5, f.y - sa * len * 0.5, f.x + ca * len * 0.5, f.y + sa * len * 0.5);
          break;
        }
        case 'claw': {
          const len = (20 + t * 46) * size;
          const ca = Math.cos(f.ang);
          const sa = Math.sin(f.ang);
          g.lineStyle(3 * a + 1, f.color, a * 0.9);
          for (let k = -1; k <= 1; k++) {
            const px = f.x + sa * k * 7 * size;
            const py = f.y - ca * k * 7 * size;
            g.beginPath();
            g.arc(px, py, len, f.ang - 0.4, f.ang + 0.4, false, 0);
            g.strokePath();
          }
          break;
        }
        case 'meteor': {
          const hx = f.x + Math.cos(f.ang) * (1 - t) * 80 * size;
          const hy = f.y + Math.sin(f.ang) * (1 - t) * 80 * size - (1 - t) * 80;
          const tail = (18 + t * 30) * size;
          g.lineStyle(6 * a + 1, f.color, a * 0.5);
          g.lineBetween(hx - Math.cos(f.ang) * tail, hy - Math.sin(f.ang) * tail, hx, hy);
          g.fillStyle(0xffffff, a);
          g.fillCircle(hx, hy, 5 * size * a + 1);
          g.lineStyle(3 * a + 1, f.color, a * 0.7);
          g.strokeCircle(f.x, f.y, (8 + t * 40) * size);
          break;
        }
        case 'beam': {
          const bw = (14 - t * 8) * size;
          g.fillStyle(f.color, a * 0.4);
          g.fillRect(f.x - bw / 2, f.y - 90 * size, bw, 90 * size);
          g.fillStyle(0xffffff, a * 0.6);
          g.fillRect(f.x - 2, f.y - 90 * size, 4, 90 * size);
          g.lineStyle(3 * a + 1, f.color, a * 0.8);
          g.strokeCircle(f.x, f.y, (10 + t * 30) * size);
          break;
        }
        case 'poison': {
          const n = 8;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2 + t;
            const dist = (8 + t * 40) * size;
            g.fillStyle(f.color, a * 0.6);
            g.fillCircle(f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist - t * 12, 7 * (1 - t * 0.4) * size);
          }
          break;
        }
        case 'note': {
          const n = 6;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2;
            const px = f.x + Math.cos(ang) * (10 + t * 40) * size;
            const py = f.y + Math.sin(ang) * (10 + t * 40) * size - t * 20;
            g.fillStyle(f.color, a * 0.9);
            g.fillCircle(px - 3, py + 4, 4);
            g.fillRect(px - 1, py - 6, 2, 12);
            g.fillRect(px, py - 6, 6, 3);
          }
          break;
        }
        case 'heart': {
          const n = 6;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2;
            const px = f.x + Math.cos(ang) * (8 + t * 34) * size;
            const py = f.y + Math.sin(ang) * (8 + t * 34) * size - t * 26 * size;
            const s = 7 * (1 - t * 0.4) * size;
            g.fillStyle(f.color, a * 0.9);
            g.fillCircle(px - s * 0.5, py - s * 0.3, s * 0.6);
            g.fillCircle(px + s * 0.5, py - s * 0.3, s * 0.6);
            g.fillTriangle(px - s, py - s * 0.1, px + s, py - s * 0.1, px, py + s);
          }
          break;
        }
        case 'coin': {
          const n = 8;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2;
            const dist = (8 + t * 46) * size;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist + t * 14 * size;
            const sq = Math.abs(Math.cos(t * 8 + k)) * 0.6 + 0.4;
            g.fillStyle(0xffd45c, a * 0.95);
            g.fillEllipse(px, py, 12 * sq, 12);
            g.lineStyle(1.5, 0xc99a1a, a * 0.8);
            g.strokeEllipse(px, py, 12 * sq, 12);
          }
          break;
        }
        case 'dice': {
          const n = 5;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2;
            const dist = (8 + t * 40) * size;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist;
            const s = 11 * (1 - t * 0.3) * size;
            g.fillStyle(0xffffff, a * 0.95);
            g.fillRoundedRect(px - s / 2, py - s / 2, s, s, 2);
            g.fillStyle(f.color, a);
            g.fillCircle(px, py, s * 0.14);
          }
          break;
        }
        case 'arrow': {
          const n = 4;
          const dist = (12 + t * 52) * size;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist;
            const ca = Math.cos(ang);
            const sa = Math.sin(ang);
            const L = 14 * size;
            g.lineStyle(3 * a + 1, f.color, a * 0.9);
            g.lineBetween(px - ca * L, py - sa * L, px + ca * L, py + sa * L);
            g.fillStyle(f.color, a * 0.9);
            g.fillTriangle(
              px + ca * L, py + sa * L,
              px + ca * L - ca * 8 - sa * 6, py + sa * L - sa * 8 + ca * 6,
              px + ca * L - ca * 8 + sa * 6, py + sa * L - sa * 8 - ca * 6,
            );
          }
          break;
        }
        case 'shield': {
          const sides = 6;
          const r = (12 + t * 36) * size;
          g.lineStyle(4 * a + 1, f.color, a * 0.85);
          g.beginPath();
          for (let k = 0; k <= sides; k++) {
            const ang = -Math.PI / 2 + (k / sides) * Math.PI * 2;
            const px = f.x + Math.cos(ang) * r;
            const py = f.y + Math.sin(ang) * r;
            if (k === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.strokePath();
          g.fillStyle(f.color, 0.18 * a);
          g.fillCircle(f.x, f.y, r * 0.8);
          g.lineStyle(2, 0xffffff, a * 0.5);
          g.lineBetween(f.x, f.y - r * 0.7, f.x + (1 - t) * r * 0.5, f.y);
          break;
        }
        case 'chain': {
          const n = 7;
          const dist = (10 + t * 44) * size;
          g.lineStyle(3 * a + 1, f.color, a * 0.9);
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist;
            const rot = ang + t * 2;
            g.strokeEllipse(px - Math.cos(rot) * 4, py - Math.sin(rot) * 4, 10, 6);
            g.strokeEllipse(px + Math.cos(rot) * 4, py + Math.sin(rot) * 4, 10, 6);
          }
          break;
        }
        case 'thorn': {
          const n = 12;
          const len = (10 + t * 44) * size;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2;
            const ca = Math.cos(ang);
            const sa = Math.sin(ang);
            g.lineStyle(2.4 * a + 0.5, f.color, a * 0.9);
            g.lineBetween(f.x, f.y, f.x + ca * len, f.y + sa * len);
            g.fillStyle(f.color, a * 0.9);
            g.fillTriangle(
              f.x + ca * len * 0.6 - sa * 4, f.y + sa * len * 0.6 + ca * 4,
              f.x + ca * len * 0.6 + sa * 4, f.y + sa * len * 0.6 - ca * 4,
              f.x + ca * len * 0.6 + ca * 8, f.y + sa * len * 0.6 + sa * 8,
            );
          }
          break;
        }
        case 'blossom': {
          const petals = 6;
          const r = (8 + t * 40) * size;
          for (let k = 0; k < petals; k++) {
            const ang = f.seed + (k / petals) * Math.PI * 2 + t * 0.5;
            g.fillStyle(f.color, a * 0.85);
            g.fillEllipse(f.x + Math.cos(ang) * r * 0.6, f.y + Math.sin(ang) * r * 0.6, r * 0.9, r * 0.5);
          }
          g.fillStyle(0xfff0a0, a);
          g.fillCircle(f.x, f.y, 5 * size * a + 1);
          break;
        }
        case 'cube': {
          const s = (12 + t * 34) * size;
          const off = s * 0.45;
          g.lineStyle(3 * a + 1, f.color, a * 0.9);
          g.strokeRect(f.x - s / 2, f.y - s / 2, s, s);
          g.lineStyle(2 * a + 1, 0xffffff, a * 0.45);
          g.strokeRect(f.x - s / 2 + off, f.y - s / 2 - off, s, s);
          g.lineBetween(f.x - s / 2, f.y - s / 2, f.x - s / 2 + off, f.y - s / 2 - off);
          g.lineBetween(f.x + s / 2, f.y + s / 2, f.x + s / 2 + off, f.y + s / 2 - off);
          break;
        }
        case 'pyramid': {
          const s = (14 + t * 40) * size;
          g.lineStyle(3 * a + 1, f.color, a * 0.9);
          g.strokeTriangle(f.x, f.y - s, f.x - s * 0.9, f.y + s * 0.7, f.x + s * 0.9, f.y + s * 0.7);
          g.lineStyle(2 * a + 1, 0xffffff, a * 0.4);
          g.strokeTriangle(f.x, f.y - s * 0.4, f.x - s * 0.5, f.y + s * 0.7, f.x + s * 0.5, f.y + s * 0.7);
          break;
        }
        case 'aim': {
          const r = (10 + t * 40) * size;
          g.lineStyle(2.5 * a + 1, f.color, a * 0.9);
          g.strokeCircle(f.x, f.y, r);
          g.strokeCircle(f.x, f.y, r * 0.45);
          const gap = r + 6;
          const len = 12 * (1 - t * 0.6) * size;
          g.lineBetween(f.x - gap, f.y, f.x - gap - len, f.y);
          g.lineBetween(f.x + gap, f.y, f.x + gap + len, f.y);
          g.lineBetween(f.x, f.y - gap, f.x, f.y - gap - len);
          g.lineBetween(f.x, f.y + gap, f.x, f.y + gap + len);
          break;
        }
        case 'sonar': {
          for (let k = 0; k < 3; k++) {
            const r = (8 + t * 54 + k * 10) * size;
            g.fillStyle(f.color, a * (0.8 - k * 0.2));
            for (let d = 0; d < 12; d++) {
              const ang = f.seed + (d / 12) * Math.PI * 2;
              g.fillCircle(f.x + Math.cos(ang) * r, f.y + Math.sin(ang) * r, 2.2);
            }
          }
          break;
        }
        case 'wind': {
          for (let k = 0; k < 3; k++) {
            const r = (14 + t * 40 + k * 10) * size;
            const a0 = f.seed + k * 1.4 + t * 2;
            g.lineStyle(2.5 * a + 1, f.color, a * (0.8 - k * 0.18));
            g.beginPath();
            g.arc(f.x, f.y, r, a0, a0 + Math.PI * 1.3, false, 0);
            g.strokePath();
          }
          break;
        }
        case 'sand': {
          const n = 20;
          const dist = (8 + t * 46) * size;
          g.fillStyle(f.color, a * 0.85);
          for (let k = 0; k < n; k++) {
            const ang = f.seed + k * 2.399 + t * 2;
            const rr = dist * (0.4 + (k % 5) / 6);
            g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 2);
          }
          break;
        }
        case 'acid': {
          const n = 7;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2;
            const px = f.x + Math.cos(ang) * (8 + t * 30) * size;
            const py = f.y + Math.sin(ang) * (8 + t * 30) * size + t * 30 * size;
            g.fillStyle(f.color, a * 0.85);
            g.fillEllipse(px, py, 5, 9 + t * 6);
          }
          break;
        }
        case 'sun': {
          const rays = 12;
          const r = (10 + t * 34) * size;
          const rot = f.seed + t * 1.2;
          g.fillStyle(0xfff3b0, a * 0.6);
          g.fillCircle(f.x, f.y, r * 0.5);
          g.lineStyle(3 * a + 1, f.color, a * 0.9);
          for (let k = 0; k < rays; k++) {
            const ang = rot + (k / rays) * Math.PI * 2;
            g.lineBetween(
              f.x + Math.cos(ang) * r * 0.6, f.y + Math.sin(ang) * r * 0.6,
              f.x + Math.cos(ang) * r * 1.3, f.y + Math.sin(ang) * r * 1.3,
            );
          }
          break;
        }
        case 'moon': {
          const r = (14 + t * 36) * size;
          g.fillStyle(f.color, a * 0.9);
          g.fillCircle(f.x, f.y, r);
          g.fillStyle(0xffffff, a * 0.25);
          g.fillCircle(f.x - r * 0.3, f.y - r * 0.25, r * 0.22);
          g.fillCircle(f.x + r * 0.25, f.y + r * 0.15, r * 0.16);
          g.fillCircle(f.x - r * 0.1, f.y + r * 0.35, r * 0.12);
          g.lineStyle(2, 0xffffff, a * 0.3);
          g.strokeCircle(f.x, f.y, r * 1.2);
          break;
        }
        case 'eye': {
          const open = Math.sin(t * Math.PI);
          const w2 = (24 + t * 20) * size;
          const h2 = w2 * 0.5 * open;
          g.lineStyle(3 * a + 1, f.color, a * 0.9);
          g.beginPath();
          g.moveTo(f.x - w2, f.y);
          g.lineTo(f.x, f.y - h2);
          g.lineTo(f.x + w2, f.y);
          g.lineTo(f.x, f.y + h2);
          g.closePath();
          g.strokePath();
          g.fillStyle(f.color, a * 0.9);
          g.fillCircle(f.x, f.y, 6 * size * open + 1);
          break;
        }
        case 'portal': {
          const r = (14 + t * 34) * size;
          for (let k = 0; k < 3; k++) {
            const rr = r * (1 - k * 0.22);
            g.lineStyle(3 - k, k === 1 ? 0xffffff : f.color, a * (0.8 - k * 0.15));
            g.strokeEllipse(f.x, f.y, rr * 1.1, rr * 1.7);
          }
          g.fillStyle(f.color, a * 0.3);
          g.fillEllipse(f.x, f.y, r * 0.5, r * 0.9);
          break;
        }
        case 'dna': {
          const steps = 12;
          const len = (18 + t * 40) * size;
          g.lineStyle(2.5 * a + 1, f.color, a * 0.9);
          for (let s = 0; s <= steps; s++) {
            const y = f.y - len / 2 + (s / steps) * len;
            const dx = Math.sin((s / steps) * Math.PI * 2 + t * 6) * 10 * size;
            if (s < steps) {
              const y2 = f.y - len / 2 + ((s + 1) / steps) * len;
              const dx2 = Math.sin(((s + 1) / steps) * Math.PI * 2 + t * 6) * 10 * size;
              g.lineBetween(f.x + dx, y, f.x + dx2, y2);
              g.lineBetween(f.x - dx, y, f.x - dx2, y2);
            }
            g.fillStyle(0xffffff, a * 0.7);
            g.fillCircle(f.x + dx, y, 2);
            g.fillCircle(f.x - dx, y, 2);
          }
          break;
        }
        case 'atom': {
          const r = (16 + t * 30) * size;
          g.lineStyle(2.5 * a + 1, f.color, a * 0.85);
          for (let k = 0; k < 3; k++) {
            g.save();
            g.translateCanvas(f.x, f.y);
            g.rotateCanvas((k / 3) * Math.PI);
            g.strokeEllipse(0, 0, r * 2, r * 0.8);
            g.restore();
          }
          g.fillStyle(0xffffff, a);
          g.fillCircle(f.x, f.y, 4 * size * a + 1);
          const ea = t * 8;
          g.fillStyle(f.color, a);
          g.fillCircle(f.x + Math.cos(ea) * r, f.y + Math.sin(ea) * r * 0.4, 3);
          break;
        }
        case 'sparkle': {
          const n = 10;
          const dist = (8 + t * 44) * size;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2 + t;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist;
            const s = 7 * (1 - t * 0.5) * size * (0.6 + 0.4 * Math.sin(f.seed + k * 3 + t * 10));
            g.lineStyle(2, f.color, a * 0.9);
            g.lineBetween(px - s, py, px + s, py);
            g.lineBetween(px, py - s, px, py + s);
          }
          break;
        }
        case 'ink': {
          const n = 6;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2;
            const dist = (6 + t * 30) * size;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist;
            g.fillStyle(0x141420, a * 0.75);
            g.fillCircle(px, py, (10 - t * 4) * size);
            g.fillStyle(f.color, a * 0.5);
            g.fillCircle(px, py, (5 - t * 2) * size);
          }
          break;
        }
        case 'firework': {
          const n = 14;
          const dist = Math.min(1, t * 1.6) * 58 * size;
          for (let k = 0; k < n; k++) {
            const ang = f.seed + (k / n) * Math.PI * 2;
            const col = Phaser.Display.Color.HSVToRGB(((k * 41) % 360) / 360, 0.9, 1).color;
            g.fillStyle(col, a * 0.95);
            g.fillCircle(f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist + t * t * 14, 3 * (1 - t * 0.5) * size + 1);
          }
          break;
        }
        case 'ringburst': {
          for (let k = 0; k < 4; k++) {
            const rt = Math.min(1, t * 1.5 - k * 0.12);
            if (rt <= 0) continue;
            g.lineStyle((5 - k) * a + 0.5, f.color, a * (0.85 - k * 0.18));
            g.strokeCircle(f.x, f.y, (6 + rt * 56) * size);
          }
          break;
        }
        case 'swordcross': {
          const len = (24 + t * 50) * size;
          const ca = Math.cos(f.ang);
          const sa = Math.sin(f.ang);
          g.lineStyle(5 * a + 1, f.color, a * 0.9);
          g.lineBetween(f.x - sa * len, f.y + ca * len, f.x + sa * len, f.y - ca * len);
          g.lineStyle(3 * a + 1, 0xffffff, a * 0.9);
          g.lineBetween(f.x - ca * len, f.y - sa * len, f.x + ca * len, f.y + sa * len);
          break;
        }
        case 'shuriken': {
          const r = (14 + t * 44) * size;
          const rot = f.seed + t * 9;
          g.fillStyle(f.color, a * 0.95);
          for (let k = 0; k < 4; k++) {
            const ang = rot + (k / 4) * Math.PI * 2;
            g.fillTriangle(
              f.x, f.y,
              f.x + Math.cos(ang) * r, f.y + Math.sin(ang) * r,
              f.x + Math.cos(ang + 0.5) * r * 0.4, f.y + Math.sin(ang + 0.5) * r * 0.4,
            );
          }
          g.fillStyle(0x1a1a22, a * 0.8);
          g.fillCircle(f.x, f.y, 4 * size);
          break;
        }
        case 'boulder': {
          const r = (10 + t * 26) * size;
          const rot = f.seed + t * 2;
          g.fillStyle(f.color, a * 0.9);
          g.beginPath();
          for (let k = 0; k < 7; k++) {
            const ang = rot + (k / 7) * Math.PI * 2;
            const rr = r * (0.78 + 0.22 * Math.abs(Math.sin(k * 2.7)));
            const px = f.x + Math.cos(ang) * rr;
            const py = f.y + Math.sin(ang) * rr;
            if (k === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.closePath();
          g.fillPath();
          g.lineStyle(2, 0x1a1a22, a * 0.4);
          g.strokePath();
          for (let k = 0; k < 6; k++) {
            const ang = f.seed + k * 1.1 + t * 3;
            g.fillStyle(f.color, a * 0.7);
            g.fillCircle(f.x + Math.cos(ang) * (30 + t * 30) * size, f.y + Math.sin(ang) * (30 + t * 30) * size, 3 * (1 - t) * size + 1);
          }
          break;
        }
        case 'quake': {
          for (let k = 0; k < 3; k++) {
            const rt = Math.min(1, t * 1.6 - k * 0.18);
            if (rt <= 0) continue;
            g.lineStyle(4 - k, f.color, a * (0.8 - k * 0.2));
            g.strokeEllipse(f.x, f.y, (12 + rt * 70) * size, (6 + rt * 26) * size);
          }
          g.lineStyle(2.5 * a + 0.5, 0xffffff, a * 0.5);
          for (let k = -2; k <= 2; k++) {
            g.lineBetween(f.x + k * 8 * size, f.y + 6 * size, f.x + k * 14 * size, f.y + 22 * size);
          }
          break;
        }
        case 'tornado': {
          for (let k = 0; k < 3; k++) {
            g.beginPath();
            for (let s = 0; s <= 18; s++) {
              const u = s / 18;
              const ang = f.seed + u * 3 * Math.PI * 2 + t * 4 + k * 2.1;
              const rr = (6 + u * 24) * (1 - t * 0.4) * size;
              const px = f.x + Math.cos(ang) * rr;
              const py = f.y - 30 * size + u * 60 * size;
              if (s === 0) g.moveTo(px, py);
              else g.lineTo(px, py);
            }
            g.lineStyle(3 * a + 0.5, f.color, a * (0.8 - k * 0.2));
            g.strokePath();
          }
          break;
        }
        case 'blizzard': {
          g.fillStyle(0xffffff, a * 0.9);
          for (let k = 0; k < 18; k++) {
            const ang = f.seed + k * 2.399;
            const dist = (10 + t * 50) * size * (0.5 + (k % 5) / 6);
            g.fillCircle(f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist, 2.5);
          }
          g.lineStyle(2.5 * a + 0.5, f.color, a * 0.7);
          for (let k = 0; k < 6; k++) {
            const ang = f.seed + (k / 6) * Math.PI * 2;
            g.lineBetween(f.x + Math.cos(ang) * 20 * size, f.y + Math.sin(ang) * 20 * size, f.x + Math.cos(ang) * 50 * size, f.y + Math.sin(ang) * 50 * size);
          }
          break;
        }
        case 'volcano': {
          const r = (10 + t * 30) * size;
          g.fillStyle(0x2a1408, a * 0.8);
          g.fillTriangle(f.x - r, f.y + r * 0.7, f.x + r, f.y + r * 0.7, f.x, f.y - r * 0.2);
          g.fillStyle(0xffb02a, a * 0.9);
          g.fillTriangle(f.x - r * 0.3, f.y - r * 0.1, f.x + r * 0.3, f.y - r * 0.1, f.x, f.y - r * 0.7 - t * 20);
          for (let k = 0; k < 6; k++) {
            const ang = f.seed + k * 1.05;
            g.fillStyle(k % 2 ? 0xffd07a : f.color, a * 0.8 * (1 - t * 0.4));
            g.fillCircle(f.x + Math.cos(ang) * (12 + t * 40) * size, f.y - 10 * size + Math.sin(ang) * (10 + t * 24) * size, 3.5 * (1 - t * 0.4) * size);
          }
          break;
        }
        case 'tsunami': {
          for (let k = 0; k < 3; k++) {
            g.lineStyle(6 - k * 1.4, k === 1 ? 0xffffff : f.color, a * (0.75 - k * 0.15));
            g.beginPath();
            for (let s = 0; s <= 14; s++) {
              const u = s / 14;
              const px = f.x - 60 * size + u * 120 * size;
              const py = f.y + (k * 12 - 12) * size + Math.sin(u * 6 + t * 6 + k) * 8 * size;
              if (s === 0) g.moveTo(px, py);
              else g.lineTo(px, py);
            }
            g.strokePath();
          }
          break;
        }
        case 'aurora': {
          for (let k = 0; k < 3; k++) {
            const col = Phaser.Display.Color.HSVToRGB((k / 3 + t * 0.3) % 1, 0.7, 1).color;
            g.lineStyle(5 - k, col, a * 0.6);
            g.beginPath();
            for (let s = 0; s <= 12; s++) {
              const u = s / 12;
              const px = f.x - 55 * size + u * 110 * size;
              const py = f.y + (k - 1) * 14 * size + Math.sin(u * 5 + t * 4 + k) * 10 * size;
              if (s === 0) g.moveTo(px, py);
              else g.lineTo(px, py);
            }
            g.strokePath();
          }
          break;
        }
        case 'starlight': {
          for (let k = 0; k < 8; k++) {
            const ang = f.seed + (k / 8) * Math.PI * 2 + t * 0.6;
            const dist = (8 + t * 46) * size;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist;
            const s = 9 * (1 - t * 0.4) * size;
            g.fillStyle(f.color, a * 0.95);
            g.fillTriangle(px, py - s, px + s * 0.3, py, px, py + s);
            g.fillTriangle(px, py - s, px - s * 0.3, py, px, py + s);
            g.fillTriangle(px - s, py, px, py - s * 0.3, px, py + s * 0.3);
          }
          break;
        }
        case 'galaxy': {
          for (let arm = 0; arm < 2; arm++) {
            g.lineStyle(4 * a + 1, f.color, a * 0.55);
            g.beginPath();
            for (let s = 0; s <= 20; s++) {
              const u = s / 20;
              const ang = (arm / 2) * Math.PI * 2 + u * 3.2 + t * 2;
              const rr = u * (12 + t * 48) * size;
              const px = f.x + Math.cos(ang) * rr;
              const py = f.y + Math.sin(ang) * rr;
              if (s === 0) g.moveTo(px, py);
              else g.lineTo(px, py);
            }
            g.strokePath();
          }
          g.fillStyle(0xffffff, a * 0.9);
          for (let k = 0; k < 12; k++) {
            const ang = f.seed + k * 2.399 + t;
            const rr = (10 + (k % 6) * 8) * size;
            g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 1.6);
          }
          break;
        }
        case 'blackhole': {
          const r = (10 + t * 26) * size;
          g.fillStyle(0x08080f, a * 0.9);
          g.fillCircle(f.x, f.y, r);
          for (let k = 0; k < 3; k++) {
            const rr = r * (1.3 + k * 0.35);
            g.lineStyle(3 - k * 0.6, k === 1 ? 0xffffff : f.color, a * (0.6 - k * 0.15));
            g.strokeEllipse(f.x, f.y, rr * 2, rr * 1.2 + Math.sin(t * 6 + k) * 4);
          }
          break;
        }
        case 'meteorrain': {
          for (let k = 0; k < 6; k++) {
            const ph = Math.min(1, t * 1.5 + k * 0.12);
            const ang = f.seed * 2 + k * 1.05;
            const px = f.x + Math.cos(ang) * (14 + k * 7) * size;
            const py = f.y - 70 * size + ph * 90 * size + Math.sin(ang) * 20 * size;
            g.lineStyle(3, f.color, a * 0.8);
            g.lineBetween(px, py - 18 * size, px, py);
            g.fillStyle(0xffffff, a);
            g.fillCircle(px, py, 3.5 * size);
          }
          break;
        }
        case 'rainbow': {
          for (let k = 0; k < 5; k++) {
            const col = Phaser.Display.Color.HSVToRGB((k / 5 + t * 0.4) % 1, 0.85, 1).color;
            g.lineStyle(6 - k * 0.8, col, a * (0.85 - k * 0.12));
            g.beginPath();
            g.arc(f.x, f.y, (12 + t * 52 - k * 6) * size, Math.PI, Math.PI * 2, false, 0);
            g.strokePath();
          }
          break;
        }
        case 'laser': {
          const len = 90 * size;
          const ca = Math.cos(f.ang);
          const sa = Math.sin(f.ang);
          g.lineStyle(16 * a + 1, f.color, a * 0.25);
          g.lineBetween(f.x - ca * len, f.y - sa * len, f.x + ca * len, f.y + sa * len);
          g.lineStyle(5 * a + 1, f.color, a * 0.9);
          g.lineBetween(f.x - ca * len, f.y - sa * len, f.x + ca * len, f.y + sa * len);
          g.lineStyle(2, 0xffffff, a);
          g.lineBetween(f.x - ca * len, f.y - sa * len, f.x + ca * len, f.y + sa * len);
          break;
        }
        case 'plasma': {
          g.fillStyle(f.color, a * 0.35);
          g.fillCircle(f.x, f.y, (14 + t * 30) * size);
          g.lineStyle(2.5, 0xffffff, a * 0.8);
          for (let k = 0; k < 5; k++) {
            const a0 = f.seed + k * 1.3 + t * 3;
            let px = f.x;
            let py = f.y;
            for (let s = 1; s <= 3; s++) {
              const ang = a0 + Math.sin(t * 8 + s + k) * 0.4;
              const nx = f.x + Math.cos(ang) * (10 + s * 12 + t * 20) * size;
              const ny = f.y + Math.sin(ang) * (10 + s * 12 + t * 20) * size;
              g.lineBetween(px, py, nx, ny);
              px = nx;
              py = ny;
            }
          }
          break;
        }
        case 'magnet': {
          const r = (12 + t * 40) * size;
          g.lineStyle(3 * a + 1, f.color, a * 0.8);
          g.beginPath();
          g.arc(f.x, f.y, r, 0.2 * Math.PI, 0.8 * Math.PI, false, 0);
          g.strokePath();
          g.beginPath();
          g.arc(f.x, f.y, r, 1.2 * Math.PI, 1.8 * Math.PI, false, 0);
          g.strokePath();
          g.fillStyle(0xffffff, a * 0.8);
          for (let k = 0; k < 8; k++) {
            const ang = f.seed + k * 0.79;
            const rr = r * (0.3 + (k % 4) * 0.2);
            g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 2);
          }
          break;
        }
        case 'foam': {
          for (let k = 0; k < 9; k++) {
            const ang = f.seed + (k / 9) * Math.PI * 2 + t;
            const dist = (6 + t * 34) * size;
            const rr = (6 + (k % 3) * 3) * (1 - t * 0.3) * size;
            g.fillStyle(0xffffff, a * 0.5);
            g.fillCircle(f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist, rr);
            g.lineStyle(1.5, f.color, a * 0.6);
            g.strokeCircle(f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist, rr);
          }
          break;
        }
        case 'leafstorm': {
          for (let k = 0; k < 10; k++) {
            const ang = f.seed + k * 2.399 + t * 2;
            const dist = (8 + t * 44) * size * (0.5 + (k % 5) / 6);
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist + t * 10;
            g.fillStyle(k % 2 ? f.color : 0x8fbf5a, a * 0.9);
            g.fillEllipse(px, py, 10 * (1 - t * 0.3) * size, 5 * (1 - t * 0.3) * size);
          }
          break;
        }
        case 'sakura': {
          for (let k = 0; k < 12; k++) {
            const ph = (t + k / 12) % 1;
            const px = f.x + Math.sin(f.seed + k * 1.9) * 40 * size;
            const py = f.y - 30 * size + ph * 70 * size;
            const s = 7 * (1 - ph * 0.4) * size;
            g.fillStyle(f.color, a * 0.9);
            for (let q = 0; q < 5; q++) {
              const ang = (q / 5) * Math.PI * 2;
              g.fillEllipse(px + Math.cos(ang) * s * 0.5, py + Math.sin(ang) * s * 0.5, s * 0.7, s * 0.5);
            }
          }
          break;
        }
        case 'mushroom': {
          const r = (14 + t * 40) * size;
          g.fillStyle(f.color, a * 0.8);
          g.fillCircle(f.x, f.y - r * 0.3, r);
          g.fillStyle(0xffffff, a * 0.35);
          g.fillRect(f.x - r * 0.4, f.y, r * 0.8, r * 0.9);
          g.lineStyle(2.5 * a + 0.5, f.color, a * 0.7);
          g.strokeCircle(f.x, f.y - r * 0.3, r);
          g.fillStyle(0xffffff, a * 0.5);
          for (let k = 0; k < 4; k++) {
            const ang = f.seed + k * 1.57;
            g.fillCircle(f.x + Math.cos(ang) * r * 0.5, f.y - r * 0.3 + Math.sin(ang) * r * 0.5, 3);
          }
          break;
        }
        case 'pixelate': {
          const cell = (6 + t * 5) * size;
          const ph = Math.floor(t * 10);
          for (let r2 = -3; r2 <= 3; r2++) {
            for (let c = -3; c <= 3; c++) {
              if ((r2 + c + ph) % 3 === 0) continue;
              if (Math.abs(r2) + Math.abs(c) > 4) continue;
              g.fillStyle((r2 + c) % 2 === 0 ? f.color : 0xffffff, a * 0.85);
              g.fillRect(f.x + c * cell - cell * 0.4, f.y + r2 * cell - cell * 0.4, cell * 0.8, cell * 0.8);
            }
          }
          break;
        }
        case 'glitch': {
          const off = (q: number) => Math.sin(f.seed + q * 7 + Math.floor(t * 12) * 3) * 6;
          g.fillStyle(0xff2a6a, a * 0.7);
          g.fillRect(f.x - 22 * size + off(1), f.y - 14 * size, 44 * size, 8 * size);
          g.fillStyle(0x2affea, a * 0.7);
          g.fillRect(f.x - 22 * size + off(2), f.y + 6 * size, 44 * size, 8 * size);
          g.fillStyle(0xffffff, a * 0.8);
          g.fillRect(f.x - 16 * size + off(3), f.y - 4 * size, 32 * size, 6 * size);
          break;
        }
        case 'binary': {
          for (let k = 0; k < 10; k++) {
            const ang = f.seed + k * 2.399;
            const dist = (8 + t * 42) * size;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist;
            g.fillStyle(f.color, a * 0.9);
            if (k % 2 === 0) {
              g.fillRect(px - 4, py - 6, 8, 3);
              g.fillRect(px - 4, py + 3, 8, 3);
            } else {
              g.fillRect(px - 2, py - 6, 4, 12);
            }
          }
          break;
        }
        case 'ringdance': {
          for (let k = 0; k < 6; k++) {
            const ang = f.seed + (k / 6) * Math.PI * 2 + t * 3;
            const dist = (16 + Math.sin(t * 6 + k) * 8) * size;
            g.lineStyle(3, f.color, a * 0.85);
            g.strokeCircle(f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist, 8 * (1 - t * 0.4) * size);
          }
          break;
        }
        case 'butterfly': {
          for (let k = 0; k < 5; k++) {
            const ang = f.seed + (k / 5) * Math.PI * 2 + t * 1.5;
            const dist = (10 + t * 40) * size;
            const px = f.x + Math.cos(ang) * dist;
            const py = f.y + Math.sin(ang) * dist - t * 12;
            const flap = Math.abs(Math.sin(t * 10 + k));
            g.fillStyle(f.color, a * 0.9);
            g.fillEllipse(px - 4 * size, py, 9 * size, (10 * flap + 3) * size);
            g.fillEllipse(px + 4 * size, py, 9 * size, (10 * flap + 3) * size);
          }
          break;
        }
        case 'phantom': {
          for (let k = 2; k >= 0; k--) {
            const off = k * 6 * size + t * 14;
            g.fillStyle(f.color, a * (0.15 + (3 - k) * 0.18));
            g.fillCircle(f.x - off, f.y, (10 - k * 2) * size);
            g.fillCircle(f.x + off, f.y, (10 - k * 2) * size);
          }
          g.fillStyle(0xffffff, a * 0.85);
          g.fillCircle(f.x, f.y, 5 * size);
          break;
        }
        case 'holy': {
          const len = (18 + t * 46) * size;
          g.lineStyle(8 * a + 1, 0xfff6c8, a * 0.4);
          g.lineBetween(f.x, f.y - len, f.x, f.y + len);
          g.lineBetween(f.x - len * 0.7, f.y - len * 0.25, f.x + len * 0.7, f.y - len * 0.25);
          g.lineStyle(3 * a + 1, 0xffffff, a * 0.95);
          g.lineBetween(f.x, f.y - len, f.x, f.y + len);
          g.lineBetween(f.x - len * 0.7, f.y - len * 0.25, f.x + len * 0.7, f.y - len * 0.25);
          break;
        }
        case 'thorncrown': {
          const r = (14 + t * 34) * size;
          const rot = f.seed + t * 2;
          for (let k = 0; k < 12; k++) {
            const ang = rot + (k / 12) * Math.PI * 2;
            const px = f.x + Math.cos(ang) * r;
            const py = f.y + Math.sin(ang) * r;
            g.lineStyle(3 * a + 0.5, f.color, a * 0.9);
            g.lineBetween(f.x + Math.cos(ang) * r * 0.6, f.y + Math.sin(ang) * r * 0.6, px, py);
            g.fillStyle(f.color, a * 0.9);
            g.fillTriangle(
              px - Math.sin(ang) * 4, py + Math.cos(ang) * 4,
              px + Math.sin(ang) * 4, py - Math.cos(ang) * 4,
              px + Math.cos(ang) * 9, py + Math.sin(ang) * 9,
            );
          }
          break;
        }
        case 'tide': {
          for (let k = 0; k < 3; k++) {
            const r = (10 + t * 46 + k * 12) * size;
            g.lineStyle(3 - k * 0.5, f.color, a * (0.8 - k * 0.2));
            g.beginPath();
            for (let s = 0; s <= 16; s++) {
              const ang = f.seed + (s / 16) * Math.PI * 2;
              const rr = r + Math.sin(s * 1.5 + t * 6) * 4 * size;
              const px = f.x + Math.cos(ang) * rr;
              const py = f.y + Math.sin(ang) * rr;
              if (s === 0) g.moveTo(px, py);
              else g.lineTo(px, py);
            }
            g.closePath();
            g.strokePath();
          }
          break;
        }
        case 'starfall': {
          for (let k = 0; k < 7; k++) {
            const ph = Math.min(1, t * 1.6 + k * 0.1);
            const px = f.x + Math.sin(f.seed + k * 1.7) * 42 * size;
            const py = f.y - 50 * size + ph * 80 * size;
            g.lineStyle(2, f.color, a * 0.7);
            g.lineBetween(px - 3, py - 12 * size, px, py);
            g.fillStyle(f.color, a);
            g.fillCircle(px, py, 3 * size);
          }
          break;
        }
        case 'prismfan': {
          for (let k = 0; k < 6; k++) {
            const col = Phaser.Display.Color.HSVToRGB((k / 6 + t * 0.3) % 1, 0.8, 1).color;
            const a0 = f.seed + (k / 6) * Math.PI * 2 + t;
            const len = (14 + t * 44) * size;
            g.fillStyle(col, a * 0.8);
            g.fillTriangle(
              f.x, f.y,
              f.x + Math.cos(a0) * len, f.y + Math.sin(a0) * len,
              f.x + Math.cos(a0 + 0.4) * len, f.y + Math.sin(a0 + 0.4) * len,
            );
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

    // the dashed line nobody may cross while a serve is being set up
    if (w.mode !== 'match') return;
    const back = NET_X - 30 - w.config.serveNetMargin;
    const front = NET_X + 30 + w.config.serveNetMargin;
    g.lineStyle(2, P.serveHint, 0.4);
    for (const bx of [back, front]) {
      for (let y = GROUND_Y; y > GROUND_Y - 160; y -= 16) {
        g.lineBetween(bx, y, bx, y - 9);
      }
    }
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
      const tier = tierById(idx === this.localIndex() ? this.localRank : this.remoteRank);

      const nameText = this.nameTexts[idx];
      nameText.setText(name);
      const w = pad + av + 8 + nameText.width + pad;
      const x0 = idx === 0 ? 16 : VIEW_W - 16 - w;
      const y0 = cy - h / 2;

      g.fillStyle(0x000000, 0.3);
      g.fillRoundedRect(x0, y0, w, h, h / 2);
      g.lineStyle(2, tier.color, 0.95);
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

    if (cos.aura !== 'none') this.drawAura(g, pos.x, pos.y, cos.aura, AURA_COLORS[cos.aura]);
    if (cos.cape !== 'none') this.drawCape(g, pos.x, topY, cos.cape);
    if (cos.wings !== 'none') this.drawWings(g, pos.x, topY, cos);

    g.fillStyle(color, 1);
    g.fillRoundedRect(pos.x - 14, topY + 26, 28, PLAYER_H - 26, 10);

    if (cos.emoji) {
      this.faces[i].setText(cos.emoji).setPosition(pos.x, topY + 17).setVisible(true);
    } else {
      g.fillStyle(P.skin, 1);
      g.fillCircle(pos.x, topY + 16, 13);
    }

    if (cos.hat !== 'none') this.drawHat(g, pos.x, topY, cos.hat);
    this.drawRacket(g, p, pos.x, pos.y, cos);
    if (cos.pet !== 'none') this.drawPet(g, pos.x, topY, i, cos.pet, cos.petStar);
  }

  /** a cape streaming down the player's back; shape depends on the kind */
  private drawCape(g: Phaser.GameObjects.Graphics, x: number, topY: number, id: CapeId): void {
    const shape = CAPE_SHAPE[id];
    const color = CAPE_COLORS[id];
    if (!shape || shape.len === 0) return;
    const now = this.time.now;
    const sway = Math.sin(now / 420) * 6;
    const baseY = topY + 30;
    const w = shape.w;
    const len = shape.len;

    switch (shape.kind) {
      case 'cloth': {
        g.fillStyle(color, 0.85);
        g.beginPath();
        g.moveTo(x - w * 0.5, baseY);
        g.lineTo(x + w * 0.5, baseY);
        g.lineTo(x + w * 0.7 + sway, baseY + len);
        g.lineTo(x - w * 0.7 + sway, baseY + len);
        g.closePath();
        g.fillPath();
        break;
      }
      case 'tatter': {
        g.fillStyle(color, 0.85);
        g.beginPath();
        g.moveTo(x - w * 0.5, baseY);
        g.lineTo(x + w * 0.5, baseY);
        const segs = 5;
        for (let k = segs; k >= 0; k--) {
          const px = x - w * 0.7 + (k / segs) * w * 1.4 + sway;
          const py = baseY + len - (k % 2 === 0 ? 0 : 10);
          g.lineTo(px, py);
        }
        g.closePath();
        g.fillPath();
        break;
      }
      case 'flame': {
        g.fillStyle(color, 0.5);
        g.fillRect(x - w * 0.5, baseY, w, len);
        for (let k = 0; k < 4; k++) {
          const ph = (now / 300 + k / 4) % 1;
          g.fillStyle(k % 2 ? 0xffd07a : color, 0.7 * (1 - ph * 0.5));
          g.fillEllipse(x + (k - 1.5) * w * 0.4, baseY + len * 0.5 - ph * 10, w * 0.5, len * 0.7);
        }
        break;
      }
      case 'feather': {
        for (let k = 0; k < 5; k++) {
          const px = x - w * 0.6 + (k / 4) * w * 1.2;
          const ph = (now / 500 + k / 5) % 1;
          g.fillStyle(color, 0.7);
          g.fillEllipse(px, baseY + ph * len, 9, 14);
        }
        break;
      }
      case 'royal': {
        g.fillStyle(color, 0.88);
        g.beginPath();
        g.moveTo(x - w * 0.5, baseY);
        g.lineTo(x + w * 0.5, baseY);
        g.lineTo(x + w * 0.8 + sway, baseY + len);
        g.lineTo(x - w * 0.8 + sway, baseY + len);
        g.closePath();
        g.fillPath();
        g.fillStyle(0xffffff, 0.35);
        for (let k = -1; k <= 1; k++) {
          g.fillRect(x + k * w * 0.5 - 3, baseY + 8, 6, 6);
        }
        g.lineStyle(2, 0xffd45c, 0.8);
        g.lineBetween(x - w * 0.6 + sway, baseY + len, x + w * 0.6 + sway, baseY + len);
        break;
      }
      case 'split': {
        for (const d of [-1, 1]) {
          g.fillStyle(color, 0.88);
          g.beginPath();
          g.moveTo(x, baseY);
          g.lineTo(x + d * w * 0.5, baseY);
          g.lineTo(x + d * w * 0.75 + sway, baseY + len);
          g.lineTo(x + d * w * 0.2 + sway, baseY + len);
          g.closePath();
          g.fillPath();
        }
        g.fillStyle(0xffffff, 0.25);
        g.fillCircle(x, baseY + 10, 4);
        break;
      }
    }
  }

  /** a headpiece drawn just above the player's head */
  private drawHat(g: Phaser.GameObjects.Graphics, x: number, topY: number, id: HatId): void {
    const color = HAT_COLORS[id];
    const hy = topY + 4;
    switch (HAT_KIND[id]) {
      case 'crown': {
        g.fillStyle(color, 1);
        g.fillTriangle(x - 16, hy + 6, x - 10, hy - 8, x - 4, hy + 6);
        g.fillTriangle(x - 6, hy + 6, x, hy - 12, x + 6, hy + 6);
        g.fillTriangle(x + 4, hy + 6, x + 10, hy - 8, x + 16, hy + 6);
        g.fillRect(x - 16, hy + 6, 32, 5);
        break;
      }
      case 'cap': {
        g.fillStyle(color, 1);
        g.fillEllipse(x, hy + 2, 30, 20);
        g.fillRect(x - 16, hy + 2, 32, 5);
        g.fillRect(x + 2, hy + 2, 16, 4);
        break;
      }
      case 'horn': {
        g.fillStyle(color, 1);
        g.fillTriangle(x - 16, hy + 4, x - 22, hy - 12, x - 8, hy - 2);
        g.fillTriangle(x + 16, hy + 4, x + 22, hy - 12, x + 8, hy - 2);
        break;
      }
      case 'halo': {
        g.lineStyle(4, color, 0.95);
        g.strokeEllipse(x, hy - 8, 34, 12);
        break;
      }
      case 'wizard': {
        g.fillStyle(color, 1);
        g.fillTriangle(x, hy - 24, x - 18, hy + 6, x + 18, hy + 6);
        g.fillRect(x - 20, hy + 6, 40, 5);
        break;
      }
      case 'santa': {
        g.fillStyle(color, 1);
        g.fillTriangle(x, hy - 18, x - 16, hy + 4, x + 16, hy + 4);
        g.fillRect(x - 18, hy + 4, 36, 5);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(x, hy - 20, 5);
        break;
      }
      case 'band': {
        g.fillStyle(color, 1);
        g.fillRect(x - 16, hy + 2, 32, 7);
        g.fillStyle(0xd42a3a, 1);
        g.fillRect(x + 8, hy + 3, 5, 5);
        break;
      }
      case 'flower': {
        for (let k = 0; k < 5; k++) {
          const ang = (k / 5) * Math.PI * 2;
          g.fillStyle(color, 0.95);
          g.fillCircle(x + Math.cos(ang) * 9, hy - 2 - Math.sin(ang) * 6, 5);
        }
        g.fillStyle(0xfff0a0, 1);
        g.fillCircle(x, hy - 2, 4);
        break;
      }
      case 'phone': {
        g.lineStyle(5, color, 1);
        g.beginPath();
        g.arc(x - 12, hy, 10, Math.PI, Math.PI * 2, false, 0);
        g.strokePath();
        g.beginPath();
        g.arc(x + 12, hy, 10, Math.PI, Math.PI * 2, false, 0);
        g.strokePath();
        break;
      }
      case 'top': {
        g.fillStyle(color, 1);
        g.fillRect(x - 16, hy + 4, 32, 5);
        g.fillRect(x - 10, hy - 18, 20, 22);
        g.fillStyle(0xd42a3a, 1);
        g.fillRect(x - 10, hy - 2, 20, 5);
        break;
      }
      case 'helm': {
        g.fillStyle(color, 1);
        g.fillEllipse(x, hy + 2, 34, 24);
        g.fillRect(x - 17, hy + 2, 34, 6);
        g.fillStyle(0xffd45c, 1);
        g.fillTriangle(x, hy + 2, x - 6, hy - 6, x + 6, hy - 6);
        break;
      }
      case 'pirate': {
        g.fillStyle(color, 1);
        g.beginPath();
        g.moveTo(x - 24, hy + 6);
        g.lineTo(x - 10, hy - 10);
        g.lineTo(x + 10, hy - 10);
        g.lineTo(x + 24, hy + 6);
        g.closePath();
        g.fillPath();
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(x, hy - 3, 3);
        break;
      }
      case 'chef': {
        g.fillStyle(color, 1);
        g.fillRect(x - 16, hy + 2, 32, 8);
        g.fillCircle(x - 10, hy - 6, 9);
        g.fillCircle(x, hy - 11, 10);
        g.fillCircle(x + 10, hy - 6, 9);
        break;
      }
      case 'astro': {
        g.fillStyle(color, 0.55);
        g.fillCircle(x, hy - 2, 16);
        g.lineStyle(3, color, 1);
        g.strokeCircle(x, hy - 2, 16);
        g.fillStyle(0x39ffd0, 0.8);
        g.fillEllipse(x, hy - 2, 22, 10);
        break;
      }
      case 'mushroom': {
        g.fillStyle(color, 1);
        g.fillEllipse(x, hy + 2, 40, 24);
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(x - 8, hy - 2, 3);
        g.fillCircle(x + 6, hy + 2, 3.5);
        g.fillCircle(x + 12, hy - 5, 2.5);
        g.fillStyle(0xf0e0c0, 1);
        g.fillRect(x - 6, hy + 8, 12, 12);
        break;
      }
      case 'beanie': {
        g.fillStyle(color, 1);
        g.fillEllipse(x, hy, 32, 24);
        g.fillRect(x - 16, hy + 2, 32, 6);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(x, hy - 15, 5);
        break;
      }
      case 'antler': {
        g.lineStyle(3.5, color, 1);
        g.lineBetween(x - 12, hy, x - 14, hy - 16);
        g.lineBetween(x - 14, hy - 16, x - 22, hy - 21);
        g.lineBetween(x - 14, hy - 12, x - 22, hy - 7);
        g.lineBetween(x + 12, hy, x + 14, hy - 16);
        g.lineBetween(x + 14, hy - 16, x + 22, hy - 21);
        g.lineBetween(x + 14, hy - 12, x + 22, hy - 7);
        break;
      }
      case 'jester': {
        for (let k = -1; k <= 1; k++) {
          g.fillStyle(k === 0 ? color : 0xd42a3a, 1);
          g.beginPath();
          g.moveTo(x + k * 12, hy + 6);
          g.lineTo(x + k * 16, hy - 18);
          g.lineTo(x + k * 25, hy + 2);
          g.closePath();
          g.fillPath();
        }
        g.fillStyle(color, 1);
        g.fillRect(x - 16, hy + 4, 32, 6);
        break;
      }
      case 'sombrero': {
        g.fillStyle(color, 1);
        g.fillEllipse(x, hy + 6, 56, 16);
        g.fillEllipse(x, hy - 7, 28, 18);
        g.fillStyle(0xd42a3a, 1);
        g.fillRect(x - 14, hy - 3, 28, 4);
        break;
      }
    }
  }

  /** a small companion bobbing beside the player; star adds flair */
  private drawPet(
    g: Phaser.GameObjects.Graphics,
    x: number,
    topY: number,
    i: 0 | 1,
    id: PetId,
    star: number,
  ): void {
    const color = PET_COLORS[id];
    const dir = i === 0 ? 1 : -1;
    const bob = Math.sin(this.time.now / 380) * 5;
    const px = x + dir * 42;
    const py = topY - 4 + bob;
    switch (PET_KIND[id]) {
      case 'orb': {
        g.fillStyle(color, 0.3);
        g.fillCircle(px, py, 12);
        g.fillStyle(color, 0.95);
        g.fillCircle(px, py, 6);
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(px - 2, py - 2, 2);
        break;
      }
      case 'bird': {
        g.fillStyle(color, 0.75);
        g.fillEllipse(px - dir * 2, py - 3, 12, 6 + Math.abs(Math.sin(this.time.now / 150)) * 6);
        g.fillStyle(color, 1);
        g.fillEllipse(px, py, 16, 12);
        g.fillCircle(px + dir * 7, py - 4, 5);
        g.fillStyle(0xffb020, 1);
        g.fillTriangle(px + dir * 11, py - 6, px + dir * 16, py - 4, px + dir * 11, py - 2);
        break;
      }
      case 'cat': {
        g.fillStyle(color, 1);
        g.fillEllipse(px, py + 4, 18, 12);
        g.fillCircle(px, py - 4, 8);
        g.fillTriangle(px - 8, py - 8, px - 4, py - 16, px - 1, py - 8);
        g.fillTriangle(px + 8, py - 8, px + 4, py - 16, px + 1, py - 8);
        g.fillStyle(0x1a1a22, 1);
        g.fillCircle(px - 3, py - 4, 1.6);
        g.fillCircle(px + 3, py - 4, 1.6);
        break;
      }
      case 'fox': {
        g.fillStyle(color, 1);
        g.fillEllipse(px, py + 4, 18, 12);
        g.fillCircle(px, py - 4, 8);
        g.fillTriangle(px - 7, py - 9, px - 5, py - 18, px - 1, py - 8);
        g.fillTriangle(px + 7, py - 9, px + 5, py - 18, px + 1, py - 8);
        g.fillStyle(0xffffff, 0.9);
        g.fillTriangle(px, py - 2, px - 3, py + 3, px + 3, py + 3);
        g.fillStyle(color, 0.9);
        g.fillEllipse(px - dir * 12, py + 6, 12, 6);
        break;
      }
      case 'dragon': {
        g.fillStyle(color, 0.7);
        g.fillTriangle(px - dir * 2, py - 2, px - dir * 16, py - 12, px - dir * 14, py + 6);
        g.fillStyle(color, 1);
        g.fillEllipse(px, py, 20, 14);
        g.fillCircle(px + dir * 8, py - 5, 6);
        g.fillStyle(0xffd45c, 1);
        g.fillTriangle(px + dir * 10, py - 9, px + dir * 14, py - 14, px + dir * 15, py - 7);
        break;
      }
      case 'fairy': {
        g.fillStyle(color, 0.3);
        g.fillCircle(px, py, 13);
        g.fillStyle(0xffffff, 0.5);
        g.fillEllipse(px - 7, py - 4, 12, 9);
        g.fillEllipse(px + 7, py - 4, 12, 9);
        g.fillStyle(color, 1);
        g.fillCircle(px, py, 5);
        break;
      }
      case 'skull': {
        g.fillStyle(color, 1);
        g.fillCircle(px, py - 2, 9);
        g.fillRect(px - 5, py + 5, 10, 6);
        g.fillStyle(0x1a1020, 1);
        g.fillCircle(px - 3, py - 3, 2.4);
        g.fillCircle(px + 3, py - 3, 2.4);
        break;
      }
      case 'robot': {
        g.fillStyle(color, 1);
        g.fillRoundedRect(px - 8, py - 8, 16, 16, 3);
        g.fillStyle(0x39ffd0, 1);
        g.fillCircle(px - 3, py - 2, 2);
        g.fillCircle(px + 3, py - 2, 2);
        g.lineStyle(2, color, 1);
        g.lineBetween(px, py - 8, px, py - 14);
        g.fillStyle(0xff5a5a, 1);
        g.fillCircle(px, py - 15, 2.5);
        break;
      }
      case 'star': {
        const rot = this.time.now / 900;
        g.fillStyle(color, 0.95);
        for (let k = 0; k < 5; k++) {
          const ang = rot + (k / 5) * Math.PI * 2 - Math.PI / 2;
          g.fillTriangle(
            px + Math.cos(ang) * 11, py + Math.sin(ang) * 11,
            px + Math.cos(ang + 1.2) * 5, py + Math.sin(ang + 1.2) * 5,
            px + Math.cos(ang - 1.2) * 5, py + Math.sin(ang - 1.2) * 5,
          );
        }
        break;
      }
      case 'flame': {
        for (let k = 0; k < 3; k++) {
          const ph = (this.time.now / 300 + k / 3) % 1;
          g.fillStyle(k === 1 ? 0xffd07a : color, 0.85 * (1 - ph * 0.5));
          g.fillEllipse(px, py + 4 - ph * 10, 10 - k * 2, 16 - k * 3);
        }
        break;
      }
      case 'ghost': {
        g.fillStyle(color, 0.85);
        g.fillCircle(px, py - 2, 9);
        const wob = Math.sin(this.time.now / 200) * 2;
        g.fillRect(px - 9, py + 4, 18, 6);
        g.fillCircle(px - 6, py + 10 + wob, 3);
        g.fillCircle(px, py + 11 - wob, 3);
        g.fillCircle(px + 6, py + 10 + wob, 3);
        g.fillStyle(0x1a1a22, 1);
        g.fillCircle(px - 3, py - 3, 1.8);
        g.fillCircle(px + 3, py - 3, 1.8);
        break;
      }
    }

    // hatched quality shows on the field: more stars, more sparkle
    const now = this.time.now;
    if (star >= 2) {
      g.fillStyle(color, 0.16);
      g.fillCircle(px, py, 15 + star);
    }
    if (star >= 3) {
      g.lineStyle(2, color, 0.65);
      g.strokeCircle(px, py, 17);
    }
    if (star >= 4) {
      for (let k = 0; k < 3; k++) {
        const ang = now / 500 + (k / 3) * Math.PI * 2;
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(px + Math.cos(ang) * 20, py + Math.sin(ang) * 20, 2.5);
      }
    }
    if (star >= 5) {
      for (let k = 0; k < 4; k++) {
        const ang = -now / 700 + (k / 4) * Math.PI * 2;
        g.fillStyle(color, 0.9);
        g.fillCircle(px + Math.cos(ang) * 27, py + Math.sin(ang) * 27, 2);
      }
      g.fillStyle(0xffffff, 0.35 + 0.25 * Math.sin(now / 200));
      g.fillCircle(px, py, 20);
    }
  }

  /** aura behind a player; each aura has its own motion, not just a colour */
  private drawAura(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    id: AuraId,
    color: number,
  ): void {
    const cy = y - PLAYER_H * 0.5;
    const now = this.time.now;
    const pulse = 0.5 + 0.5 * Math.sin(now / 480);

    // every aura keeps a soft base glow so it still reads as an aura
    g.fillStyle(color, 0.12);
    g.fillEllipse(x, cy, 98, 152);
    g.lineStyle(2, color, 0.2 + 0.2 * pulse);
    g.strokeEllipse(x, cy, 116 + pulse * 6, 172 + pulse * 10);

    switch (id) {
      case 'flame': {
        for (let k = 0; k < 5; k++) {
          const ph = (now / 260 + k * 0.2) % 1;
          const fx = x + Math.sin(now / 300 + k * 2) * 28;
          const fy = cy + 60 - ph * 130;
          g.fillStyle(k % 2 ? 0xffd07a : color, 0.5 * (1 - ph));
          g.fillEllipse(fx, fy, 18 * (1 - ph) + 5, 30 * (1 - ph) + 8);
        }
        break;
      }
      case 'gold': {
        for (let k = 0; k < 12; k++) {
          const ang = (k / 12) * Math.PI * 2 + now / 1800;
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k));
          g.fillStyle(color, 0.7 * tw);
          g.fillCircle(x + Math.cos(ang) * 52, cy + Math.sin(ang) * 76, 3);
        }
        break;
      }
      case 'electric': {
        g.lineStyle(2, 0xffffff, 0.8);
        for (let k = 0; k < 3; k++) {
          const a0 = now / 140 + k * 2.1;
          const r0 = 44 + k * 12;
          let px = x + Math.cos(a0) * r0;
          let py = cy + Math.sin(a0) * r0 * 1.4;
          for (let s = 1; s <= 5; s++) {
            const ang = a0 + s * 0.3 + Math.sin(now / 60 + s * 3 + k) * 0.25;
            const rr = r0 + s * 3;
            const nx = x + Math.cos(ang) * rr;
            const ny = cy + Math.sin(ang) * rr * 1.4;
            g.lineBetween(px, py, nx, ny);
            px = nx;
            py = ny;
          }
        }
        break;
      }
      case 'snow':
      case 'sakura': {
        for (let k = 0; k < 10; k++) {
          const ph = (now / 1100 + k / 10) % 1;
          const sx = x + Math.sin(now / 700 + k * 1.7) * 34;
          const sy = cy - 60 + ph * 130;
          g.fillStyle(id === 'snow' ? 0xffffff : color, 0.75 * (1 - ph * 0.4));
          if (id === 'snow') g.fillCircle(sx, sy, 2 + (k % 3));
          else g.fillEllipse(sx, sy, 7, 4);
        }
        break;
      }
      case 'bubble':
      case 'toxic': {
        for (let k = 0; k < 8; k++) {
          const ph = (now / 900 + k / 8) % 1;
          const bx = x + Math.sin(k * 3.1) * 30;
          const by = cy + 60 - ph * 130;
          const rr = 4 + (k % 3);
          g.lineStyle(1.8, color, 0.7 * (1 - ph));
          g.strokeCircle(bx, by, rr);
        }
        break;
      }
      case 'orbit':
      case 'violet': {
        const dots = id === 'orbit' ? 4 : 3;
        for (let k = 0; k < dots; k++) {
          const ang = now / 500 + (k / dots) * Math.PI * 2;
          const ox = x + Math.cos(ang) * 52;
          const oy = cy + Math.sin(ang) * 76;
          g.fillStyle(color, 0.9);
          g.fillCircle(ox, oy, 5);
          g.fillStyle(0xffffff, 0.7);
          g.fillCircle(ox, oy, 2);
        }
        break;
      }
      case 'gear':
      case 'pixel': {
        if (id === 'gear') {
          const rot = now / 900;
          const teeth = 10;
          const rOuter = 58;
          g.lineStyle(2.5, color, 0.6);
          g.beginPath();
          for (let k = 0; k < teeth * 2; k++) {
            const ang = rot + (k / (teeth * 2)) * Math.PI * 2;
            const rr = k % 2 === 0 ? rOuter : rOuter * 0.82;
            const px = x + Math.cos(ang) * rr;
            const py = cy + Math.sin(ang) * rr * 1.3;
            if (k === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.closePath();
          g.strokePath();
        } else {
          const phase = Math.floor(now / 130);
          for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 5; c++) {
              if ((r + c + phase) % 3 !== 0) continue;
              const px = x + (c - 2) * 22;
              const py = cy + (r - 3) * 22;
              g.fillStyle(color, 0.7);
              g.fillRect(px - 6, py - 6, 12, 12);
            }
          }
        }
        break;
      }
      case 'holy':
      case 'king': {
        const rays = id === 'holy' ? 8 : 7;
        for (let k = 0; k < rays; k++) {
          const ang = -Math.PI / 2 + (k / rays) * Math.PI * 2;
          g.lineStyle(3, color, 0.3 + 0.3 * pulse);
          g.lineBetween(x, cy, x + Math.cos(ang) * 70, cy + Math.sin(ang) * 92);
        }
        g.fillStyle(color, 0.22);
        g.fillEllipse(x, cy, 72, 112);
        break;
      }
      case 'venom':
      case 'crimson': {
        for (let k = 0; k < 8; k++) {
          const ph = (now / 1200 + k / 8) % 1;
          const vx = x + Math.sin(k * 3.1) * 32;
          const vy = cy - 50 + ph * 120;
          g.fillStyle(color, 0.8 * (1 - ph));
          g.fillEllipse(vx, vy, 5, 9 - ph * 4);
        }
        if (id === 'crimson') {
          g.lineStyle(3, color, 0.3 + 0.4 * pulse);
          g.strokeEllipse(x, cy, 96 + pulse * 10, 150 + pulse * 14);
        }
        break;
      }
      case 'void': {
        const r = 40 + pulse * 8;
        g.fillStyle(0x120a20, 0.55);
        g.fillEllipse(x, cy, r * 1.6, r * 2.2);
        g.lineStyle(2, color, 0.5);
        g.strokeEllipse(x, cy, r * 1.6, r * 2.2);
        for (let k = 0; k < 4; k++) {
          const ang = now / 400 + (k / 4) * Math.PI * 2;
          g.fillStyle(color, 0.6);
          g.fillCircle(x + Math.cos(ang) * r * 1.1, cy + Math.sin(ang) * r * 1.5, 3);
        }
        break;
      }
      case 'storm': {
        g.lineStyle(2, color, 0.4);
        g.strokeEllipse(x, cy - 40, 110, 40);
        for (let k = 0; k < 2; k++) {
          const seed = Math.floor(now / 180) + k * 3;
          const bx = x + Math.sin(seed * 1.7) * 40;
          g.lineStyle(2, 0xffffff, 0.8);
          g.lineBetween(bx, cy - 30, bx + 8, cy + 6);
          g.lineBetween(bx + 8, cy + 6, bx - 4, cy + 4);
          g.lineBetween(bx - 4, cy + 4, bx + 4, cy + 44);
        }
        break;
      }
      case 'rainbow': {
        for (let k = 0; k < 3; k++) {
          const h = (now / 2500 + k * 0.12) % 1;
          const col = Phaser.Display.Color.HSVToRGB(h, 0.85, 1).color;
          g.lineStyle(4 - k, col, 0.5 - k * 0.12);
          g.strokeEllipse(x, cy, 104 + k * 12, 158 + k * 16);
        }
        break;
      }
      case 'frost': {
        for (let k = 0; k < 8; k++) {
          const ang = now / 1200 + (k / 8) * Math.PI * 2;
          const fx = x + Math.cos(ang) * 50;
          const fy = cy + Math.sin(ang) * 72;
          g.lineStyle(1.6, 0xffffff, 0.5);
          for (let s = 0; s < 3; s++) {
            const a2 = (s / 3) * Math.PI;
            g.lineBetween(fx - Math.cos(a2) * 6, fy - Math.sin(a2) * 6, fx + Math.cos(a2) * 6, fy + Math.sin(a2) * 6);
          }
        }
        break;
      }
      case 'emerald':
      case 'rose': {
        for (let k = 0; k < 9; k++) {
          const ph = (now / 1100 + k / 9) % 1;
          const px = x + Math.sin(k * 2.7) * 34;
          const py = cy + 60 - ph * 130;
          g.fillStyle(color, 0.8 * (1 - ph));
          if (id === 'emerald') g.fillCircle(px, py, 3);
          else g.fillEllipse(px, py, 8, 5);
        }
        break;
      }
      case 'aurora': {
        for (let k = 0; k < 3; k++) {
          g.lineStyle(4 - k, k === 1 ? 0x9effd0 : color, 0.4 - k * 0.08);
          g.beginPath();
          for (let s = 0; s <= 10; s++) {
            const u = s / 10;
            const px = x - 60 + u * 120;
            const py = cy - 40 + Math.sin(now / 500 + u * 4 + k) * 14 + k * 16;
            if (s === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.strokePath();
        }
        break;
      }
      case 'lava': {
        g.fillStyle(0x3a1206, 0.4);
        g.fillEllipse(x, cy + 60, 80, 26);
        for (let k = 0; k < 6; k++) {
          const ph = (now / 700 + k / 6) % 1;
          g.fillStyle(k % 2 ? 0xffd06a : color, 0.8 * (1 - ph));
          g.fillCircle(x + (k - 2.5) * 18, cy + 60 - ph * 40, 6 * (1 - ph * 0.5));
        }
        break;
      }
      case 'ghost': {
        for (let k = 0; k < 3; k++) {
          const ph = (now / 1400 + k / 3) % 1;
          const gx = x + Math.sin(now / 600 + k * 2) * 30;
          const gy = cy + 50 - ph * 120;
          g.fillStyle(0xffffff, 0.35 * (1 - ph));
          g.fillCircle(gx, gy, 14);
          g.fillCircle(gx - 8, gy + 4, 8);
          g.fillCircle(gx + 8, gy + 4, 8);
        }
        break;
      }
      case 'neon': {
        g.lineStyle(3, color, 0.5 + 0.4 * pulse);
        g.strokeRect(x - 40, cy - 62, 80, 124);
        g.lineStyle(2, 0xffffff, 0.3 + 0.3 * pulse);
        g.strokeRect(x - 30, cy - 52, 60, 104);
        break;
      }
      case 'prism': {
        for (let k = 0; k < 6; k++) {
          const col = Phaser.Display.Color.HSVToRGB(((k / 6) + now / 4000) % 1, 0.85, 1).color;
          const ang = now / 900 + (k / 6) * Math.PI * 2;
          g.fillStyle(col, 0.7);
          g.fillTriangle(
            x + Math.cos(ang) * 20, cy + Math.sin(ang) * 26,
            x + Math.cos(ang + 0.5) * 60, cy + Math.sin(ang + 0.5) * 80,
            x + Math.cos(ang + 1.0) * 60, cy + Math.sin(ang + 1.0) * 80,
          );
        }
        break;
      }
      case 'thorn': {
        const n = 12;
        const rot = now / 1600;
        for (let k = 0; k < n; k++) {
          const ang = rot + (k / n) * Math.PI * 2;
          const bx = x + Math.cos(ang) * 52;
          const by = cy + Math.sin(ang) * 72;
          g.lineStyle(2.5, color, 0.7);
          g.lineBetween(x + Math.cos(ang) * 40, cy + Math.sin(ang) * 56, bx, by);
          g.fillStyle(color, 0.8);
          g.fillTriangle(
            bx - Math.sin(ang) * 5, by + Math.cos(ang) * 5,
            bx + Math.sin(ang) * 5, by - Math.cos(ang) * 5,
            bx + Math.cos(ang) * 8, by + Math.sin(ang) * 8,
          );
        }
        break;
      }
      case 'chain': {
        const n = 10;
        const rot = now / 2000;
        g.lineStyle(2.5, color, 0.7);
        for (let k = 0; k < n; k++) {
          const ang = rot + (k / n) * Math.PI * 2;
          g.strokeEllipse(x + Math.cos(ang) * 50, cy + Math.sin(ang) * 70, 12, 7);
        }
        break;
      }
      case 'plume': {
        for (let k = 0; k < 6; k++) {
          const ph = (now / 1500 + k / 6) % 1;
          const px = x + Math.sin(now / 900 + k * 2.2) * 36;
          const py = cy - 60 + ph * 130;
          g.fillStyle(color, 0.7 * (1 - ph * 0.4));
          g.fillEllipse(px, py, 16, 6);
        }
        break;
      }
      case 'coin': {
        for (let k = 0; k < 8; k++) {
          const ph = (now / 1000 + k / 8) % 1;
          const px = x + Math.sin(k * 2.6) * 34;
          const py = cy + 60 - ph * 130;
          const sq = Math.abs(Math.cos(now / 200 + k)) * 0.6 + 0.4;
          g.fillStyle(0xffd45c, 0.9 * (1 - ph));
          g.fillEllipse(px, py, 12 * sq, 12);
        }
        break;
      }
      case 'note': {
        for (let k = 0; k < 5; k++) {
          const ph = (now / 1400 + k / 5) % 1;
          const px = x + Math.sin(now / 700 + k * 2) * 32;
          const py = cy + 55 - ph * 125;
          g.fillStyle(color, 0.8 * (1 - ph));
          g.fillCircle(px - 3, py + 3, 4);
          g.fillRect(px - 1, py - 7, 2, 11);
        }
        break;
      }
      case 'heart': {
        for (let k = 0; k < 5; k++) {
          const ph = (now / 1300 + k / 5) % 1;
          const px = x + Math.sin(k * 1.9) * 30;
          const py = cy + 55 - ph * 125;
          const s = 5;
          g.fillStyle(color, 0.8 * (1 - ph));
          g.fillCircle(px - s * 0.5, py - s * 0.3, s * 0.6);
          g.fillCircle(px + s * 0.5, py - s * 0.3, s * 0.6);
          g.fillTriangle(px - s, py, px + s, py, px, py + s);
        }
        break;
      }
      case 'skull': {
        for (let k = 0; k < 3; k++) {
          const ph = (now / 1600 + k / 3) % 1;
          const px = x + (k - 1) * 26;
          const py = cy + 50 - ph * 110;
          g.fillStyle(0xdfe6f0, 0.55 * (1 - ph * 0.6));
          g.fillCircle(px, py, 13);
          g.fillRect(px - 7, py + 6, 14, 7);
          g.fillStyle(0x1a1020, 0.7 * (1 - ph * 0.6));
          g.fillCircle(px - 4, py - 2, 2.4);
          g.fillCircle(px + 4, py - 2, 2.4);
        }
        break;
      }
      case 'sparkle': {
        for (let k = 0; k < 10; k++) {
          const ang = (k / 10) * Math.PI * 2 + now / 2000;
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 260 + k * 1.7));
          const px = x + Math.cos(ang) * 52;
          const py = cy + Math.sin(ang) * 74;
          g.lineStyle(2, color, 0.8 * tw);
          g.lineBetween(px - 5, py, px + 5, py);
          g.lineBetween(px, py - 5, px, py + 5);
        }
        break;
      }
      case 'moon': {
        g.fillStyle(0xe8f0ff, 0.5);
        g.fillCircle(x, cy - 10, 26);
        g.fillStyle(0xffffff, 0.25);
        g.fillCircle(x - 8, cy - 18, 6);
        g.fillCircle(x + 8, cy - 2, 4);
        g.lineStyle(2, color, 0.4);
        g.strokeCircle(x, cy - 10, 34);
        break;
      }
      case 'sun': {
        const rot = now / 2600;
        for (let k = 0; k < 12; k++) {
          const ang = rot + (k / 12) * Math.PI * 2;
          g.lineStyle(3, color, 0.5 + 0.3 * pulse);
          g.lineBetween(x + Math.cos(ang) * 24, cy + Math.sin(ang) * 24, x + Math.cos(ang) * 62, cy + Math.sin(ang) * 62);
        }
        g.fillStyle(0xfff3b0, 0.5);
        g.fillCircle(x, cy, 22);
        break;
      }
      case 'clock': {
        g.lineStyle(2.5, color, 0.7);
        g.strokeCircle(x, cy, 44);
        for (let k = 0; k < 12; k++) {
          const ang = (k / 12) * Math.PI * 2 - Math.PI / 2;
          g.lineBetween(x + Math.cos(ang) * 38, cy + Math.sin(ang) * 38, x + Math.cos(ang) * 44, cy + Math.sin(ang) * 44);
        }
        const ha = now / 1200 - Math.PI / 2;
        g.lineStyle(3, 0xffffff, 0.8);
        g.lineBetween(x, cy, x + Math.cos(ha) * 30, cy + Math.sin(ha) * 30);
        g.lineBetween(x, cy, x + Math.cos(ha * 6) * 20, cy + Math.sin(ha * 6) * 20);
        break;
      }
      case 'ring': {
        for (let k = 0; k < 3; k++) {
          const r = 40 + k * 14 + Math.sin(now / 500 + k) * 4;
          g.lineStyle(3 - k * 0.6, color, 0.5 - k * 0.12);
          g.strokeEllipse(x, cy, r * 2, r * 2.8);
        }
        break;
      }
      case 'wind': {
        for (let k = 0; k < 4; k++) {
          const a0 = now / 300 + (k / 4) * Math.PI * 2;
          g.lineStyle(2, color, 0.6);
          g.beginPath();
          g.arc(x, cy, 30 + k * 12, a0, a0 + Math.PI * 0.8, false, 0);
          g.strokePath();
        }
        break;
      }
      case 'sand': {
        for (let k = 0; k < 18; k++) {
          const ang = k * 2.399 + now / 700;
          const rr = 20 + (k % 6) * 10;
          g.fillStyle(color, 0.6);
          g.fillCircle(x + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 1.3, 2);
        }
        break;
      }
      case 'rune': {
        const rot = now / 1500;
        g.lineStyle(2.5, color, 0.7);
        g.beginPath();
        for (let k = 0; k <= 5; k++) {
          const idx = (k * 2) % 5;
          const ang = rot + (idx / 5) * Math.PI * 2 - Math.PI / 2;
          const px = x + Math.cos(ang) * 50;
          const py = cy + Math.sin(ang) * 70;
          if (k === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.strokePath();
        break;
      }
      case 'hex': {
        const rot = now / 1800;
        g.lineStyle(2.5, color, 0.7);
        g.beginPath();
        for (let k = 0; k < 6; k++) {
          const ang = rot + (k / 6) * Math.PI * 2 - Math.PI / 2;
          const px = x + Math.cos(ang) * 52;
          const py = cy + Math.sin(ang) * 72;
          if (k === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.closePath();
        g.strokePath();
        g.lineStyle(1.5, 0xffffff, 0.3);
        for (let k = 0; k < 6; k++) {
          const ang = rot + (k / 6) * Math.PI * 2 - Math.PI / 2;
          g.lineBetween(x, cy, x + Math.cos(ang) * 52, cy + Math.sin(ang) * 72);
        }
        break;
      }
      case 'radar': {
        g.lineStyle(2, color, 0.5);
        g.strokeCircle(x, cy, 48);
        g.strokeCircle(x, cy, 30);
        g.strokeCircle(x, cy, 12);
        const sweep = now / 400;
        g.fillStyle(color, 0.3);
        g.fillTriangle(
          x, cy,
          x + Math.cos(sweep) * 48, cy + Math.sin(sweep) * 48,
          x + Math.cos(sweep - 0.5) * 48, cy + Math.sin(sweep - 0.5) * 48,
        );
        g.lineStyle(2.5, 0xffffff, 0.8);
        g.lineBetween(x, cy, x + Math.cos(sweep) * 48, cy + Math.sin(sweep) * 48);
        break;
      }
      case 'tide': {
        for (let k = 0; k < 3; k++) {
          g.lineStyle(3 - k * 0.5, color, 0.5 - k * 0.1);
          g.beginPath();
          for (let s = 0; s <= 12; s++) {
            const u = s / 12;
            const px = x - 60 + u * 120;
            const py = cy + 40 + k * 16 + Math.sin(now / 400 + u * 6 + k) * 6;
            if (s === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.strokePath();
        }
        break;
      }
      case 'matrix': {
        for (let c = 0; c < 5; c++) {
          const px = x - 40 + c * 20;
          for (let r = 0; r < 6; r++) {
            const ph = (now / 800 + c * 0.13 + r * 0.16) % 1;
            g.fillStyle(color, 0.7 * (1 - ph));
            g.fillRect(px - 5, cy - 60 + ph * 130 - 5, 10, 10);
          }
        }
        break;
      }
      case 'firefly': {
        for (let k = 0; k < 8; k++) {
          const ph = (now / 1600 + k / 8) % 1;
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k));
          g.fillStyle(color, 0.8 * tw * (1 - ph * 0.5));
          g.fillCircle(x + Math.sin(now / 900 + k * 2.3) * 40, cy + 60 - ph * 130, 3);
        }
        break;
      }
      case 'vortex': {
        for (let arm = 0; arm < 3; arm++) {
          g.lineStyle(2.5, color, 0.5);
          g.beginPath();
          for (let s = 0; s <= 14; s++) {
            const u = s / 14;
            const ang = (arm / 3) * Math.PI * 2 + u * 3 + now / 700;
            const rr = u * 62;
            const px = x + Math.cos(ang) * rr;
            const py = cy + Math.sin(ang) * rr * 1.3;
            if (s === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.strokePath();
        }
        break;
      }
      case 'nebula': {
        for (let k = 0; k < 6; k++) {
          const ang = now / 1400 + k * 1.05;
          const rr = 20 + (k % 3) * 14;
          g.fillStyle(k % 2 ? color : 0xffffff, 0.18);
          g.fillCircle(x + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 1.3, 16);
        }
        break;
      }
      case 'eclipse': {
        g.fillStyle(0x0a0a16, 0.85);
        g.fillCircle(x, cy, 26);
        g.lineStyle(3, color, 0.7 + 0.3 * pulse);
        g.strokeCircle(x, cy, 30);
        for (let k = 0; k < 8; k++) {
          const ang = (k / 8) * Math.PI * 2 + now / 2500;
          g.lineStyle(2, color, 0.35);
          g.lineBetween(x + Math.cos(ang) * 30, cy + Math.sin(ang) * 30, x + Math.cos(ang) * 46, cy + Math.sin(ang) * 46);
        }
        break;
      }
      case 'dawn': {
        g.fillStyle(0xffe0a0, 0.25);
        g.fillEllipse(x, cy, 120, 60);
        for (let k = 0; k < 7; k++) {
          const ang = Math.PI + (k / 7) * Math.PI;
          g.lineStyle(3, color, 0.5);
          g.lineBetween(x, cy + 30, x + Math.cos(ang) * 60, cy + 30 + Math.sin(ang) * 60);
        }
        break;
      }
      case 'dusk': {
        g.fillStyle(0xff6a3c, 0.2);
        g.fillEllipse(x, cy + 20, 120, 70);
        for (let k = 0; k < 3; k++) {
          g.lineStyle(3 - k * 0.6, color, 0.4 - k * 0.1);
          g.strokeCircle(x, cy + 10, 40 + k * 16);
        }
        break;
      }
      case 'mist': {
        for (let k = 0; k < 4; k++) {
          const ph = (now / 2600 + k / 4) % 1;
          g.fillStyle(0xffffff, 0.14 * (1 - Math.abs(ph - 0.5) * 2));
          g.fillEllipse(x + Math.sin(now / 1200 + k) * 20, cy - 40 + ph * 100, 90, 34);
        }
        break;
      }
      case 'thundercloud': {
        g.fillStyle(0x3a4258, 0.5);
        g.fillEllipse(x, cy - 42, 104, 44);
        for (let k = 0; k < 3; k++) {
          g.fillStyle(0x3a4258, 0.4);
          g.fillCircle(x - 30 + k * 30, cy - 40 + (k % 2) * 8, 20);
        }
        if (Math.floor(now / 180) % 3 === 0) {
          const bx = x + Math.sin(now / 90) * 24;
          g.lineStyle(2.5, 0xffffff, 0.9);
          g.lineBetween(bx, cy - 26, bx + 6, cy + 4);
          g.lineBetween(bx + 6, cy + 4, bx - 4, cy + 2);
          g.lineBetween(bx - 4, cy + 2, bx + 2, cy + 40);
        }
        break;
      }
      case 'golddust': {
        for (let k = 0; k < 14; k++) {
          const ang = k * 2.399 + now / 1400;
          const rr = 20 + (k % 6) * 9;
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k));
          g.fillStyle(color, 0.75 * tw);
          g.fillCircle(x + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 1.35, 1.8);
        }
        break;
      }
      case 'frostbite': {
        g.fillStyle(color, 0.15);
        g.fillEllipse(x, cy, 96, 150);
        for (let k = 0; k < 10; k++) {
          const ang = now / 1600 + (k / 10) * Math.PI * 2;
          const fx = x + Math.cos(ang) * 50;
          const fy = cy + Math.sin(ang) * 72;
          g.lineStyle(1.6, 0xffffff, 0.6);
          for (let s = 0; s < 3; s++) {
            const a2 = (s / 3) * Math.PI;
            g.lineBetween(fx - Math.cos(a2) * 7, fy - Math.sin(a2) * 7, fx + Math.cos(a2) * 7, fy + Math.sin(a2) * 7);
          }
        }
        break;
      }
      case 'ember': {
        for (let k = 0; k < 7; k++) {
          const ph = (now / 900 + k / 7) % 1;
          g.fillStyle(k % 2 ? 0xffd07a : color, 0.8 * (1 - ph));
          g.fillCircle(x + Math.sin(k * 2.7 + now / 700) * 34, cy + 60 - ph * 130, 2.5);
        }
        break;
      }
      case 'sparkstorm': {
        for (let k = 0; k < 12; k++) {
          const ang = k * 2.399 + now / 400;
          const rr = 22 + (k % 5) * 10;
          const px = x + Math.cos(ang) * rr;
          const py = cy + Math.sin(ang) * rr * 1.3;
          g.lineStyle(1.6, color, 0.7);
          g.lineBetween(px - 3, py, px + 3, py);
          g.lineBetween(px, py - 3, px, py + 3);
        }
        break;
      }
      case 'leafwind': {
        for (let k = 0; k < 8; k++) {
          const ph = (now / 1800 + k / 8) % 1;
          g.fillStyle(k % 2 ? color : 0x8fbf5a, 0.75 * (1 - ph * 0.4));
          g.fillEllipse(x + Math.sin(now / 800 + k * 1.7) * 42, cy + 60 - ph * 130, 9, 5);
        }
        break;
      }
      case 'petalrain': {
        for (let k = 0; k < 10; k++) {
          const ph = (now / 1700 + k / 10) % 1;
          g.fillStyle(color, 0.75 * (1 - ph * 0.4));
          g.fillEllipse(x + Math.sin(now / 700 + k * 2.1) * 40, cy + 60 - ph * 130, 8, 5);
        }
        break;
      }
      case 'snowstorm': {
        for (let k = 0; k < 16; k++) {
          const ph = (now / 1400 + k / 16) % 1;
          g.fillStyle(0xffffff, 0.8 * (1 - ph * 0.4));
          g.fillCircle(x + Math.sin(now / 500 + k * 1.3) * 46, cy - 60 + ph * 130, 1.8 + (k % 3));
        }
        break;
      }
      case 'runering': {
        const rot = now / 1600;
        g.lineStyle(2, color, 0.6);
        for (let k = 0; k < 8; k++) {
          const ang = rot + (k / 8) * Math.PI * 2;
          g.strokeRect(x + Math.cos(ang) * 50 - 4, cy + Math.sin(ang) * 72 - 4, 8, 8);
        }
        break;
      }
      case 'starfield': {
        for (let k = 0; k < 12; k++) {
          const ang = k * 2.399;
          const rr = 18 + (k % 7) * 8;
          const tw = 0.3 + 0.7 * Math.abs(Math.sin(now / 500 + k * 1.9));
          g.fillStyle(0xfff2c4, 0.8 * tw);
          g.fillCircle(x + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 1.4, 1.8);
        }
        break;
      }
      case 'haloRing': {
        g.lineStyle(4, color, 0.4 + 0.3 * pulse);
        g.strokeEllipse(x, cy - 50, 70, 22);
        g.lineStyle(2, 0xffffff, 0.3);
        g.strokeEllipse(x, cy - 50, 54, 16);
        break;
      }
      case 'hexflame': {
        for (let k = 0; k < 6; k++) {
          const ph = (now / 1000 + k / 6) % 1;
          g.fillStyle(k % 2 ? 0x9cffd0 : color, 0.7 * (1 - ph));
          g.fillEllipse(x + (k - 2.5) * 16, cy + 50 - ph * 110, 9 * (1 - ph) + 3, 14 * (1 - ph) + 5);
        }
        break;
      }
      case 'bubblefield': {
        for (let k = 0; k < 10; k++) {
          const ph = (now / 1300 + k / 10) % 1;
          g.lineStyle(1.6, color, 0.7 * (1 - ph));
          g.strokeCircle(x + Math.sin(k * 2.7) * 36, cy + 60 - ph * 130, 3 + (k % 4));
        }
        break;
      }
      case 'prismatic': {
        for (let k = 0; k < 5; k++) {
          const col = Phaser.Display.Color.HSVToRGB((k / 5 + now / 4000) % 1, 0.8, 1).color;
          g.lineStyle(3, col, 0.35);
          g.strokeEllipse(x, cy, 90 + k * 14, 140 + k * 18);
        }
        break;
      }
      case 'spring': {
        for (let k = 0; k < 9; k++) {
          const ph = (now / 1500 + k / 9) % 1;
          const px = x + Math.sin(k * 2.3 + now / 900) * 36;
          const py = cy + 55 - ph * 125;
          g.fillStyle(color, 0.75 * (1 - ph * 0.4));
          if (k % 2) g.fillEllipse(px, py, 7, 4);
          else g.fillCircle(px, py, 3);
        }
        break;
      }
      case 'autumn': {
        for (let k = 0; k < 9; k++) {
          const ph = (now / 1400 + k / 9) % 1;
          g.fillStyle(k % 2 ? color : 0xc07f00, 0.8 * (1 - ph * 0.4));
          g.fillEllipse(x + Math.sin(now / 700 + k * 1.9) * 40, cy + 60 - ph * 130, 9, 5);
        }
        break;
      }
      case 'voidRift': {
        const r = 34 + pulse * 6;
        g.fillStyle(0x12081f, 0.6);
        g.fillEllipse(x, cy, r * 0.9, r * 2.2);
        g.lineStyle(2.5, color, 0.6);
        g.strokeEllipse(x, cy, r * 0.9, r * 2.2);
        for (let k = 0; k < 5; k++) {
          const ang = now / 500 + (k / 5) * Math.PI * 2;
          g.fillStyle(color, 0.7);
          g.fillCircle(x, cy + Math.sin(ang) * r * 1.1, 2.5);
        }
        break;
      }
      default:
        break;
    }
  }

  /** wings; the silhouette is chosen by the wing's kind, not just its colour */
  private drawWings(g: Phaser.GameObjects.Graphics, x: number, topY: number, cos: Cosmetic): void {
    const shape = WING_SHAPE[cos.wings];
    const color = WING_COLORS[cos.wings];
    if (!shape || shape.feathers === 0) return;
    const now = this.time.now;
    const speed = 90 - shape.feathers * 6;
    const flap = Math.sin(now / speed) * 0.35;
    const baseY = topY + 48;
    const step = shape.len / (shape.feathers + 1);

    if (shape.kind === 'feather') {
      for (const dir of [-1, 1]) {
        for (let k = 0; k < shape.feathers; k++) {
          const len = shape.len - k * step;
          const ang = -Math.PI / 2 + dir * (shape.spread + flap + k * 0.22);
          const tipX = x + Math.cos(ang) * len;
          const tipY = baseY + Math.sin(ang) * len;
          const nx = x + dir * shape.w;
          g.fillStyle(color, 0.92 - k * 0.14);
          g.fillTriangle(nx, baseY - 12, nx, baseY + 12, tipX, tipY);
        }
      }
      return;
    }

    for (const dir of [-1, 1]) {
      switch (shape.kind) {
        case 'membrane': {
          g.fillStyle(color, 0.85);
          g.beginPath();
          g.moveTo(x, baseY - 14);
          for (let k = 0; k < shape.feathers; k++) {
            const len = shape.len - k * step;
            const ang = -Math.PI / 2 + dir * (shape.spread + flap + k * 0.24);
            g.lineTo(x + Math.cos(ang) * len, baseY + Math.sin(ang) * len);
          }
          g.lineTo(x, baseY + 16);
          g.closePath();
          g.fillPath();
          g.lineStyle(2, color, 0.9);
          g.strokePath();
          break;
        }
        case 'butterfly': {
          for (let k = 0; k < shape.feathers; k++) {
            const wobble = Math.sin(now / speed + k) * 0.2;
            g.fillStyle(color, 0.85 - k * 0.2);
            g.fillEllipse(
              x + dir * (shape.w + 12 + k * 12),
              baseY - shape.len * 0.4 + Math.abs(wobble) * 10,
              shape.len * 0.95,
              shape.len * (0.72 - k * 0.15),
            );
          }
          break;
        }
        case 'mech': {
          for (let k = 0; k < shape.feathers; k++) {
            const ang = -Math.PI / 2 + dir * (shape.spread + flap + k * 0.26);
            g.fillStyle(color, 0.9 - k * 0.16);
            g.save();
            g.translateCanvas(x + dir * shape.w, baseY);
            g.rotateCanvas(ang + Math.PI / 2);
            g.fillRect(0, -shape.w / 2, shape.len - k * step, shape.w);
            g.restore();
          }
          break;
        }
        case 'crystal': {
          for (let k = 0; k < shape.feathers; k++) {
            const len = shape.len - k * step;
            const ang = -Math.PI / 2 + dir * (shape.spread + flap + k * 0.24);
            const cx2 = x + Math.cos(ang) * len;
            const cy2 = baseY + Math.sin(ang) * len;
            const s = 12 - k * 2;
            g.fillStyle(color, 0.85 - k * 0.12);
            g.fillTriangle(cx2, cy2 - s, cx2 + s * 0.7, cy2, cx2, cy2 + s);
            g.fillTriangle(cx2, cy2 - s, cx2 - s * 0.7, cy2, cx2, cy2 + s);
          }
          break;
        }
        case 'flame': {
          for (let k = 0; k < shape.feathers; k++) {
            const len = shape.len - k * step;
            const wob = Math.sin(now / 110 + k + dir) * 0.12;
            const ang = -Math.PI / 2 + dir * (shape.spread + flap + k * 0.22 + wob);
            const nx = x + dir * shape.w;
            g.fillStyle(k % 2 ? 0xffd07a : color, 0.9 - k * 0.12);
            g.fillTriangle(nx, baseY - 10, nx, baseY + 12, x + Math.cos(ang) * len, baseY + Math.sin(ang) * len);
          }
          break;
        }
        case 'blade': {
          for (let k = 0; k < shape.feathers; k++) {
            const len = shape.len - k * step;
            const ang = -Math.PI / 2 + dir * (shape.spread + flap + k * 0.24);
            const tipX = x + Math.cos(ang) * len;
            const tipY = baseY + Math.sin(ang) * len;
            const nx = x + dir * shape.w;
            g.fillStyle(color, 0.95 - k * 0.12);
            g.fillTriangle(nx, baseY - 5, nx, baseY + 5, tipX, tipY);
            g.lineStyle(1.5, 0xffffff, 0.5);
            g.lineBetween(nx, baseY, tipX, tipY);
          }
          break;
        }
        case 'leaf': {
          for (let k = 0; k < shape.feathers; k++) {
            const ang = -Math.PI / 2 + dir * (shape.spread + flap + k * 0.22);
            const len = shape.len - k * step;
            g.fillStyle(color, 0.88 - k * 0.12);
            g.save();
            g.translateCanvas(x + Math.cos(ang) * len, baseY + Math.sin(ang) * len);
            g.rotateCanvas(ang + Math.PI / 2);
            g.fillEllipse(0, 0, 26, 10);
            g.restore();
          }
          break;
        }
        case 'fin': {
          g.fillStyle(color, 0.85);
          g.beginPath();
          g.moveTo(x, baseY - 16);
          for (let k = 0; k < shape.feathers; k++) {
            const ang = -Math.PI / 2 + dir * (shape.spread + flap * 0.6 + k * 0.3);
            const len = shape.len - k * step;
            g.lineTo(x + Math.cos(ang) * len, baseY + Math.sin(ang) * len);
            g.lineTo(x + dir * (shape.w + k * 4), baseY + 6 + k * 6);
          }
          g.closePath();
          g.fillPath();
          g.lineStyle(2, 0xffffff, 0.35);
          g.strokePath();
          break;
        }
        case 'ribbon': {
          for (let k = 0; k < shape.feathers; k++) {
            const off = k * step;
            g.lineStyle(5 - k * 0.6, color, 0.7 - k * 0.1);
            g.beginPath();
            for (let s = 0; s <= 8; s++) {
              const u = s / 8;
              const px = x + dir * (shape.w + off) + Math.sin(u * 4 + now / 160 + k) * 6;
              const py = baseY - Math.sin(u * 1.6) * (shape.len + off);
              if (s === 0) g.moveTo(px, py);
              else g.lineTo(px, py);
            }
            g.strokePath();
          }
          break;
        }
        case 'spike': {
          for (let k = 0; k < shape.feathers; k++) {
            const ang = -Math.PI / 2 + dir * (shape.spread + flap * 0.5 + k * 0.24);
            const len = shape.len - k * step;
            const bx = x + dir * shape.w;
            g.fillStyle(color, 0.9 - k * 0.1);
            g.fillTriangle(bx - 3, baseY + 8, bx + 3, baseY + 8, x + Math.cos(ang) * len, baseY + Math.sin(ang) * len);
          }
          break;
        }
        case 'sail': {
          const lift = Math.sin(now / 700) * 4;
          g.fillStyle(color, 0.85);
          g.beginPath();
          g.moveTo(x + dir * shape.w * 0.2, baseY - 40 + lift);
          g.lineTo(x + dir * (shape.w + shape.len * 0.5), baseY - 10 + lift);
          g.lineTo(x + dir * (shape.w + shape.len * 0.3), baseY + 22 + lift);
          g.lineTo(x + dir * shape.w * 0.2, baseY + 10);
          g.closePath();
          g.fillPath();
          g.lineStyle(2, 0xffffff, 0.35);
          g.strokePath();
          break;
        }
        default:
          break;
      }
    }
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

    const skin = cos.racketSkin;
    const frameColor = skin === 'default' ? cos.racket : RACKET_SKIN_COLORS[skin];

    g.save();
    g.translateCanvas(head.x, head.y);
    g.rotateCanvas(ang);
    g.lineStyle(6, P.grip, 0.95);
    g.lineBetween(-12, 0, -2, 0);
    if (skin !== 'default') {
      const glow = skin === 'flame' ? 0.22 + 0.16 * Math.sin(this.time.now / 60) : 0.3;
      g.lineStyle(12, frameColor, glow);
      g.strokeEllipse(9, 0, 34, 28);
    }
    g.lineStyle(3, frameColor, 0.95);
    g.strokeEllipse(9, 0, 34, 28);
    this.drawRacketTrim(g, skin, frameColor);
    g.restore();

    if (hot > 0.15) {
      g.lineStyle(2, frameColor, 0.12 + 0.28 * hot);
      g.strokeCircle(head.x, head.y, contactRadius(this.world.config));
    }
  }

  /** extra ornament per racket skin, drawn in the racket's local space */
  private drawRacketTrim(
    g: Phaser.GameObjects.Graphics,
    skin: RacketSkinId,
    color: number,
  ): void {
    const now = this.time.now;
    switch (skin) {
      case 'circuit': {
        g.lineStyle(1.6, color, 0.9);
        g.lineBetween(-2, 0, 9, 0);
        g.fillStyle(color, 0.95);
        for (let k = 0; k < 5; k++) {
          const ang = (k / 5) * Math.PI * 2;
          g.fillRect(9 + Math.cos(ang) * 17 - 2, Math.sin(ang) * 14 - 2, 4, 4);
        }
        break;
      }
      case 'spike': {
        g.lineStyle(2, color, 0.9);
        for (let k = 0; k < 10; k++) {
          const ang = (k / 10) * Math.PI * 2;
          const ca = Math.cos(ang);
          const sa = Math.sin(ang);
          g.lineBetween(9 + ca * 17, sa * 14, 9 + ca * 24, sa * 20);
        }
        break;
      }
      case 'holy': {
        g.lineStyle(2, 0xfff6c8, 0.5 + 0.3 * Math.sin(now / 200));
        g.strokeEllipse(9, 0, 46, 40);
        g.lineStyle(3, color, 0.85);
        g.lineBetween(9, -22, 9, -12);
        g.lineBetween(3, -17, 15, -17);
        break;
      }
      case 'shadow': {
        for (let k = 0; k < 6; k++) {
          const ang = (k / 6) * Math.PI * 2 + now / 900;
          g.fillStyle(0x2a1a44, 0.55);
          g.fillCircle(9 + Math.cos(ang) * 18, Math.sin(ang) * 15, 6);
        }
        break;
      }
      case 'crystal': {
        g.lineStyle(1.4, 0xffffff, 0.5);
        for (let k = 0; k < 6; k++) {
          const ang = (k / 6) * Math.PI * 2;
          g.lineBetween(9, 0, 9 + Math.cos(ang) * 16, Math.sin(ang) * 13);
        }
        break;
      }
      case 'glitch': {
        const j = Math.sin(now / 70) * 3;
        g.lineStyle(2, 0xff2a6a, 0.7);
        g.strokeEllipse(9 + j, 0, 34, 28);
        g.lineStyle(2, 0x2affea, 0.7);
        g.strokeEllipse(9 - j, 0, 34, 28);
        break;
      }
      case 'bamboo': {
        g.lineStyle(2, 0x3f6f22, 0.9);
        g.lineBetween(-11, -3, -11, 3);
        g.lineBetween(-6, -3, -6, 3);
        break;
      }
      case 'carbon': {
        g.lineStyle(1, 0x8fa0b8, 0.3);
        for (let k = -3; k <= 3; k++) {
          g.lineBetween(k * 4 - 4, -8, k * 4 + 6, 8);
        }
        break;
      }
      case 'plasma': {
        g.lineStyle(2, 0xffffff, 0.5 + 0.4 * Math.sin(now / 90));
        for (let k = 0; k < 4; k++) {
          const ang = now / 200 + (k / 4) * Math.PI * 2;
          g.lineBetween(9 + Math.cos(ang) * 8, Math.sin(ang) * 7, 9 + Math.cos(ang + 0.6) * 22, Math.sin(ang + 0.6) * 18);
        }
        break;
      }
      case 'galaxy': {
        g.fillStyle(0xffffff, 0.9);
        for (let k = 0; k < 7; k++) {
          const ang = k * 2.399;
          g.fillCircle(9 + Math.cos(ang) * 12, Math.sin(ang) * 10, 1.6);
        }
        g.lineStyle(1, color, 0.6);
        g.strokeEllipse(9, 0, 34, 28);
        break;
      }
      case 'lava': {
        for (let k = 0; k < 4; k++) {
          const ph = (now / 600 + k / 4) % 1;
          g.fillStyle(0xffb02a, 0.8 * (1 - ph));
          g.fillCircle(9 + (k - 1.5) * 9, 14 + ph * 10, 3.5 * (1 - ph));
        }
        break;
      }
      case 'frost': {
        g.lineStyle(1.6, 0xffffff, 0.6);
        for (let k = 0; k < 6; k++) {
          const ang = (k / 6) * Math.PI * 2;
          const fx = 9 + Math.cos(ang) * 15;
          const fy = Math.sin(ang) * 12;
          g.lineBetween(fx - 4, fy, fx + 4, fy);
          g.lineBetween(fx, fy - 4, fx, fy + 4);
        }
        break;
      }
      case 'rune': {
        g.lineStyle(1.8, color, 0.9);
        for (let k = 0; k < 4; k++) {
          const ang = now / 1200 + (k / 4) * Math.PI * 2;
          g.strokeRect(9 + Math.cos(ang) * 15 - 3, Math.sin(ang) * 12 - 3, 6, 6);
        }
        break;
      }
      case 'thorn': {
        g.lineStyle(1.8, color, 0.9);
        for (let k = 0; k < 10; k++) {
          const ang = (k / 10) * Math.PI * 2;
          g.lineBetween(9 + Math.cos(ang) * 16, Math.sin(ang) * 13, 9 + Math.cos(ang) * 23, Math.sin(ang) * 19);
        }
        break;
      }
      case 'web': {
        g.lineStyle(1.2, color, 0.6);
        for (let k = 0; k < 8; k++) {
          const ang = (k / 8) * Math.PI * 2;
          g.lineBetween(9, 0, 9 + Math.cos(ang) * 16, Math.sin(ang) * 13);
        }
        g.strokeEllipse(9, 0, 22, 18);
        g.strokeEllipse(9, 0, 32, 26);
        break;
      }
      case 'vine': {
        g.lineStyle(2.5, 0x4f9f4a, 0.9);
        g.beginPath();
        for (let s = 0; s <= 8; s++) {
          const u = s / 8;
          const px = -6 + u * 30;
          const py = Math.sin(u * 6) * 6;
          if (s === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.strokePath();
        g.fillStyle(0x7ed957, 0.9);
        g.fillEllipse(0, -6, 8, 5);
        g.fillEllipse(14, 5, 8, 5);
        break;
      }
      case 'mirror': {
        g.lineStyle(1.5, 0xffffff, 0.5);
        g.lineBetween(-5, -12, 11, 12);
        g.lineBetween(11, -12, 25, 8);
        break;
      }
      case 'matrix': {
        for (let k = 0; k < 6; k++) {
          const ph = (now / 400 + k / 6) % 1;
          g.fillStyle(color, 0.8 * (1 - ph));
          g.fillRect(9 + ((k % 3) - 1) * 10 - 2, -14 + ph * 28 - 3, 4, 6);
        }
        break;
      }
      case 'bone': {
        g.lineStyle(3, 0xe8e0cf, 0.95);
        g.lineBetween(-2, 0, 22, 0);
        g.fillStyle(0xe8e0cf, 0.95);
        g.fillCircle(24, -3, 3);
        g.fillCircle(24, 3, 3);
        break;
      }
      case 'zebra': {
        g.lineStyle(2.5, 0x1c1c24, 0.9);
        for (let k = -2; k <= 2; k++) {
          g.lineBetween(9 + k * 7 - 6, -13, 9 + k * 7 + 6, 13);
        }
        break;
      }
      case 'camo': {
        g.fillStyle(0x3f5a3a, 0.7);
        g.fillEllipse(2, -4, 10, 8);
        g.fillStyle(0x6a5a34, 0.7);
        g.fillEllipse(16, 6, 12, 9);
        g.fillStyle(0x2f3a2a, 0.7);
        g.fillEllipse(8, 8, 8, 6);
        break;
      }
      case 'star': {
        for (let k = 0; k < 4; k++) {
          const ang = now / 900 + (k / 4) * Math.PI * 2;
          const px = 9 + Math.cos(ang) * 13;
          const py = Math.sin(ang) * 11;
          g.lineStyle(1.8, color, 0.9);
          g.lineBetween(px - 4, py, px + 4, py);
          g.lineBetween(px, py - 4, px, py + 4);
        }
        break;
      }
      case 'scale': {
        g.lineStyle(1.4, color, 0.8);
        for (let r = -1; r <= 1; r++) {
          for (let c = -1; c <= 1; c++) {
            g.beginPath();
            g.arc(9 + c * 9, r * 8, 5, Math.PI, 0, false, 0);
            g.strokePath();
          }
        }
        break;
      }
      case 'smoke': {
        for (let k = 0; k < 4; k++) {
          const ph = (now / 900 + k / 4) % 1;
          g.fillStyle(0x9aa7b8, 0.3 * (1 - ph));
          g.fillCircle(9 + Math.sin(ph * 6) * 4, -ph * 20, 6 + ph * 6);
        }
        break;
      }
      case 'aurora': {
        for (let k = 0; k < 3; k++) {
          const col = Phaser.Display.Color.HSVToRGB((k / 3 + now / 3000) % 1, 0.7, 1).color;
          g.lineStyle(2, col, 0.7);
          g.beginPath();
          g.arc(9, 0, 14 + k * 3, Math.PI * 0.2, Math.PI * 1.4, false, 0);
          g.strokePath();
        }
        break;
      }
      case 'nebula': {
        for (let k = 0; k < 8; k++) {
          const ang = k * 2.399;
          g.fillStyle(k % 2 ? color : 0xffffff, 0.8);
          g.fillCircle(9 + Math.cos(ang) * 13, Math.sin(ang) * 11, 1.6);
        }
        break;
      }
      case 'onyx': {
        g.lineStyle(1.5, 0x8f8fa8, 0.6);
        g.strokeEllipse(9, 0, 26, 21);
        g.fillStyle(0xffffff, 0.25);
        g.fillEllipse(3, -6, 9, 4);
        break;
      }
      case 'ivory': {
        g.lineStyle(1.5, 0xffffff, 0.7);
        g.strokeEllipse(9, 0, 30, 24);
        g.strokeEllipse(9, 0, 20, 16);
        break;
      }
      case 'amber': {
        for (let k = 0; k < 3; k++) {
          const ph = (now / 800 + k / 3) % 1;
          g.fillStyle(color, 0.8 * (1 - ph));
          g.fillCircle(9 + (k - 1) * 8, 13 + ph * 10, 3 * (1 - ph));
        }
        break;
      }
      case 'jade': {
        g.lineStyle(1.6, color, 0.8);
        for (let k = -1; k <= 1; k++) {
          g.beginPath();
          g.arc(9 + k * 9, 0, 7, Math.PI * 1.1, Math.PI * 1.9, false, 0);
          g.strokePath();
        }
        break;
      }
      case 'ruby': {
        g.fillStyle(0xffffff, 0.5);
        g.fillTriangle(9, -12, 17, 0, 9, 12);
        g.lineStyle(1.6, color, 0.9);
        g.lineBetween(9, -12, 17, 0);
        g.lineBetween(9, 12, 17, 0);
        g.lineBetween(9, -12, 9, 12);
        break;
      }
      case 'sapphire': {
        g.lineStyle(1.6, color, 0.9);
        g.strokeRect(2, -9, 14, 18);
        g.lineBetween(2, -9, 16, 9);
        g.lineBetween(16, -9, 2, 9);
        break;
      }
      case 'toxic': {
        for (let k = 0; k < 5; k++) {
          const ph = (now / 900 + k / 5) % 1;
          g.lineStyle(1.6, color, 0.8 * (1 - ph));
          g.strokeCircle(4 + (k % 3) * 6, 14 - ph * 28, 2 + (k % 2) * 2);
        }
        break;
      }
      case 'ember': {
        for (let k = 0; k < 6; k++) {
          const ang = now / 500 + k * 1.05;
          g.fillStyle(k % 2 ? 0xffd07a : color, 0.85);
          g.fillCircle(9 + Math.cos(ang) * 15, Math.sin(ang) * 13, 2);
        }
        break;
      }
      default:
        break;
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
      if (fade > 0.01) this.drawTrail(g, fade);
    }

    const height = Phaser.Math.Clamp((GROUND_Y - s.y) / 420, 0, 1);
    g.fillStyle(P.shadow, 0.3 * (1 - height));
    g.fillEllipse(s.x, GROUND_Y - 2, 26 * (1 - height * 0.5), 7 * (1 - height * 0.5));

    // draw size follows the fun-mode config, so "giant shuttle" really looks big
    const dot = Math.max(3, this.world.config.shuttleR * 0.79);
    const feather = dot * 2.9;

    g.fillStyle(P.shuttleHalo, 0.1);
    g.fillCircle(s.x, s.y, dot * 2.7);
    g.fillStyle(P.shuttleHalo, 0.16);
    g.fillCircle(s.x, s.y, dot * 1.8);

    g.lineStyle(Math.max(1.5, dot * 0.36), P.shuttleFeather, 0.95);
    for (let k = -1; k <= 1; k++) {
      const a = angle + Math.PI + k * 0.4;
      g.lineBetween(s.x, s.y, s.x + Math.cos(a) * feather, s.y + Math.sin(a) * feather);
    }
    g.fillStyle(P.shuttle, 1);
    g.fillCircle(s.x, s.y, dot);
    g.lineStyle(2, P.floorEdge, 0.9);
    g.strokeCircle(s.x, s.y, dot);
  }
}
