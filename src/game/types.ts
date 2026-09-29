export interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  swing: boolean;
  /** held to aim a shot short (drop shot) */
  down: boolean;
}

export const EMPTY_INPUT: PlayerInput = {
  left: false,
  right: false,
  jump: false,
  swing: false,
  down: false,
};

export function cloneInput(i: PlayerInput): PlayerInput {
  return { left: i.left, right: i.right, jump: i.jump, swing: i.swing, down: i.down };
}

export interface PlayerState {
  x: number;
  y: number; // feet
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1; // towards the opponent
  swingTimer: number; // counts down while swinging
  swingCooldown: number;
  hitUsed: boolean;
}

export interface ShuttleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** false while resting / being held for a serve */
  live: boolean;
}

export type Phase = 'serve' | 'rally' | 'point' | 'gameover';

export type ShotKind = 'lift' | 'drive' | 'clear' | 'smash' | 'serve';

export interface SimEvent {
  type: 'hit' | 'net' | 'land' | 'point' | 'serve' | 'gameover';
  player?: number;
  kind?: ShotKind;
  x?: number;
  scorer?: number;
}

export interface World {
  shuttle: ShuttleState;
  players: [PlayerState, PlayerState];
  score: [number, number];
  server: 0 | 1;
  phase: Phase;
  phaseTimer: number;
  lastHitter: number;
  winner: number;
  time: number;
  rallyHits: number;
  events: SimEvent[];
}

/** serialised world sent over the wire */
export interface WorldSnapshot {
  s: [number, number, number, number, boolean];
  p: [number[], number[]];
  sc: [number, number];
  sv: number;
  ph: Phase;
  pt: number;
  lh: number;
  w: number;
  t: number;
  rh: number;
}

export type MatchRole = 'single' | 'host' | 'guest';
