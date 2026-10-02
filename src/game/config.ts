/**
 * Runtime-tunable physics / rule values.
 *
 * `constants.ts` still owns the field geometry (court, net, view) and the
 * *default* values; this module turns the physics half into a plain object that
 * lives on the world, so a "fun mode" can swap gravity, racket length, shuttle
 * size and so on without touching the simulation code.
 *
 * Both clients derive the same config from the same option id, and the host
 * stamps the id into every snapshot, so the authoritative sim and the guest's
 * dead reckoning can never disagree.
 */
import {
  AIM_HARD_MAX,
  AIM_HARD_MIN,
  COURT_RIGHT,
  GROUND_Y,
  PLAYER_ACCEL,
  PLAYER_GRAVITY,
  PLAYER_JUMP_V,
  PLAYER_SPEED,
  POINT_PAUSE,
  RACKET_HEAD_R,
  RACKET_MAX,
  RACKET_SMOOTH,
  RACKET_SPEED_CAP,
  RACKET_TELEPORT,
  SERVE_ARM_DELAY,
  SERVE_FORWARD_MIN,
  SERVE_NET_MARGIN,
  SERVE_PAUSE,
  SERVE_SPEED_MIN,
  SHOT_LAND_SLACK,
  SHOT_SPEED_GAIN,
  SHOT_SPEED_MAX,
  SHOT_SPEED_MIN,
  SHUTTLE_DRAG,
  SHUTTLE_GRAVITY,
  SHUTTLE_MAX_SPEED,
  SHUTTLE_R,
  HIT_COOLDOWN,
  WIN_SCORE,
} from './constants';
import type { PlayerAttrs } from './attrs';

export interface WorldConfig {
  // --- player ---
  playerSpeed: number;
  playerAccel: number;
  playerJumpV: number;
  playerGravity: number;
  // --- shuttle ---
  shuttleR: number;
  shuttleGravity: number;
  shuttleDrag: number;
  shuttleMaxSpeed: number;
  // --- racket ---
  racketMax: number;
  racketHeadR: number;
  racketTeleport: number;
  racketSmooth: number;
  racketSpeedCap: number;
  // --- shot ---
  shotSpeedGain: number;
  shotSpeedMin: number;
  shotSpeedMax: number;
  hitCooldown: number;
  shotLandSlack: number;
  aimMin: number;
  aimMax: number;
  // --- serve ---
  serveSpeedMin: number;
  serveArmDelay: number;
  serveForwardMin: number;
  serveNetMargin: number;
  servePause: number;
  // --- match ---
  winScore: number;
  pointPause: number;
  // --- ball machine (offline practice only) ---
  /** seconds between feeds */
  machineInterval: number;
  /** launch speed out of the machine, used when machineAimAt is off */
  machineSpeed: number;
  /** launch elevation, radians above horizontal */
  machineAngle: number;
  /** how far the aim target wanders, in px */
  machineSpread: number;
  /** solve the launch speed so the feed lands near the player */
  machineAimAt: boolean;
  // --- world ---
  /** false = the shuttle passes straight through the net */
  netEnabled: boolean;
  /** < 1 slows the whole simulation down (both clients must agree) */
  timeScale: number;
}

export const DEFAULT_CONFIG: WorldConfig = {
  playerSpeed: PLAYER_SPEED,
  playerAccel: PLAYER_ACCEL,
  playerJumpV: PLAYER_JUMP_V,
  playerGravity: PLAYER_GRAVITY,
  shuttleR: SHUTTLE_R,
  shuttleGravity: SHUTTLE_GRAVITY,
  shuttleDrag: SHUTTLE_DRAG,
  shuttleMaxSpeed: SHUTTLE_MAX_SPEED,
  racketMax: RACKET_MAX,
  racketHeadR: RACKET_HEAD_R,
  racketTeleport: RACKET_TELEPORT,
  racketSmooth: RACKET_SMOOTH,
  racketSpeedCap: RACKET_SPEED_CAP,
  shotSpeedGain: SHOT_SPEED_GAIN,
  shotSpeedMin: SHOT_SPEED_MIN,
  shotSpeedMax: SHOT_SPEED_MAX,
  hitCooldown: HIT_COOLDOWN,
  shotLandSlack: SHOT_LAND_SLACK,
  aimMin: AIM_HARD_MIN,
  aimMax: AIM_HARD_MAX,
  serveSpeedMin: SERVE_SPEED_MIN,
  serveArmDelay: SERVE_ARM_DELAY,
  serveForwardMin: SERVE_FORWARD_MIN,
  serveNetMargin: SERVE_NET_MARGIN,
  servePause: SERVE_PAUSE,
  winScore: WIN_SCORE,
  pointPause: POINT_PAUSE,
  machineInterval: 1.1,
  machineSpeed: 1500,
  machineAngle: 0.22,
  machineSpread: 190,
  machineAimAt: true,
  netEnabled: true,
  timeScale: 1,
};

/** the racket head + shuttle touching distance, derived from the config */
export function contactRadius(cfg: WorldConfig): number {
  return cfg.racketHeadR + cfg.shuttleR;
}

/** 按玩家属性缩放后的判定半径（「容错」点把拍头判定半径放大） */
export function contactRadiusFor(cfg: WorldConfig, attrs: PlayerAttrs): number {
  return cfg.racketHeadR * attrs.reach + cfg.shuttleR;
}

// ---- party mode ----------------------------------------------------------

export type WorldMode = 'match' | 'juggle' | 'machine';

/** where the ball machine stands, and how high it fires from */
export const MACHINE_X = COURT_RIGHT - 220;
export const MACHINE_Y = GROUND_Y - 250;

/** how many rounds a party session runs for */
export const PARTY_ROUNDS = 3;
/** a badminton round inside party mode is short: first to this many points */
export const PARTY_ROUND_SCORE = 5;
/** seconds each player gets while juggling */
export const JUGGLE_TURN_TIME = 30;
/** how long the mid-round vote stays open */
export const PARTY_VOTE_MS = 11000;

export interface PartyOption {
  id: string;
  label: string;
  desc: string;
  mode: WorldMode;
  patch?: Partial<WorldConfig>;
}

/** everything that can come up in a party vote */
export const PARTY_OPTIONS: PartyOption[] = [
  { id: 'classic', label: '经典', desc: '标准规则', mode: 'match' },
  {
    id: 'heavy',
    label: '重力加倍',
    desc: '球落得更快，跳得更高',
    mode: 'match',
    patch: { shuttleGravity: 2700, playerGravity: 3400, playerJumpV: -920 },
  },
  {
    id: 'moon',
    label: '月球重力',
    desc: '球飘得很远，慢慢落',
    mode: 'match',
    patch: { shuttleGravity: 480, playerGravity: 900, playerJumpV: -520 },
  },
  {
    id: 'bigRacket',
    label: '超长球拍',
    desc: '够得着、好接',
    mode: 'match',
    patch: { racketMax: 190, racketHeadR: 44 },
  },
  {
    id: 'bigBall',
    label: '巨球',
    desc: '羽毛球变得巨大',
    mode: 'match',
    patch: { shuttleR: 21 },
  },
  {
    id: 'slowmo',
    label: '慢动作',
    desc: '全场时间变慢',
    mode: 'match',
    patch: { timeScale: 0.55 },
  },
  {
    id: 'turbo',
    label: '疾风',
    desc: '球速暴涨，暴力对攻',
    mode: 'match',
    patch: { shotSpeedGain: 1.45, shotSpeedMax: 3300, shuttleMaxSpeed: 3300 },
  },
  {
    id: 'noNet',
    label: '无网',
    desc: '球可以随便穿过中间',
    mode: 'match',
    patch: { netEnabled: false },
  },
  { id: 'juggle', label: '颠球挑战', desc: '轮流颠球，比谁颠得多', mode: 'juggle' },
];

export const JUGGLE_OPTION_ID = 'juggle';

/**
 * Solo practice presets. These are *not* in PARTY_OPTIONS: a party round ends
 * when someone reaches winScore, and the machine mode has no score at all, so
 * it would never terminate a round.
 */
export const PRACTICE_OPTIONS: PartyOption[] = [
  {
    id: 'machineEasy',
    label: '发球机 · 简单',
    desc: '喂球慢，落点规矩',
    mode: 'machine',
    patch: { machineInterval: 1.7, machineSpeed: 1150, machineSpread: 110 },
  },
  {
    id: 'machine',
    label: '发球机 · 普通',
    desc: '节奏适中，会追着你喂',
    mode: 'machine',
    patch: { machineInterval: 1.1, machineSpeed: 1450, machineSpread: 190 },
  },
  {
    id: 'machineHard',
    label: '发球机 · 困难',
    desc: '又快又刁，落点到处跑',
    mode: 'machine',
    patch: { machineInterval: 0.7, machineSpeed: 1750, machineSpread: 290, machineAngle: 0.16 },
  },
];

const ALL_OPTIONS: PartyOption[] = [...PARTY_OPTIONS, ...PRACTICE_OPTIONS];

export function optionById(id: string): PartyOption | undefined {
  return ALL_OPTIONS.find((o) => o.id === id);
}

export function optionLabel(id: string): string {
  return optionById(id)?.label ?? id;
}

/** build the runtime config for a party option id ('' / unknown = default) */
export function configFor(id: string): WorldConfig {
  const opt = optionById(id);
  const cfg: WorldConfig = { ...DEFAULT_CONFIG };
  if (opt?.patch) Object.assign(cfg, opt.patch);
  return cfg;
}

export function modeFor(id: string): WorldMode {
  return optionById(id)?.mode ?? 'match';
}

/** the option id a snapshot should carry when the world is on defaults */
export const DEFAULT_OPTION_ID = 'classic';

// ---- party session state (shared with the Vue overlay) -------------------

export interface PartyRoundResult {
  round: number;
  optionId: string;
  label: string;
  detail: string;
  /** 0 | 1 | -1 (draw) */
  winner: number;
}

export interface PartyState {
  active: boolean;
  round: number;
  total: number;
  stage: 'vote' | 'play' | 'result' | 'done';
  /** candidate option ids this round */
  options: string[];
  /** each side's pick; -1 = local, 1 = remote */
  votes: [string | null, string | null];
  chosen: string | null;
  scores: [number, number];
  results: PartyRoundResult[];
  /** ms timestamp the vote closes at (0 when not voting) */
  voteEndsAt: number;
  /** this client is allowed to push the session forward (host / single) */
  localCanAdvance: boolean;
}

export function emptyPartyState(total = PARTY_ROUNDS): PartyState {
  return {
    active: false,
    round: 0,
    total,
    stage: 'vote',
    options: [],
    votes: [null, null],
    chosen: null,
    scores: [0, 0],
    results: [],
    voteEndsAt: 0,
    localCanAdvance: true,
  };
}

/** pick `n` distinct options for a vote, at random */
export function pickCandidates(n: number): PartyOption[] {
  const pool = [...PARTY_OPTIONS];
  const out: PartyOption[] = [];
  while (out.length < n && pool.length) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}
