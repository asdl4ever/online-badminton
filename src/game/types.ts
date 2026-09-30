export interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  /** racket head position relative to the shoulder (world axes) */
  rx: number;
  ry: number;
  /** racket head velocity in px/s (world axes) */
  rvx: number;
  rvy: number;
}

export const EMPTY_INPUT: PlayerInput = {
  left: false,
  right: false,
  jump: false,
  rx: 60,
  ry: -60,
  rvx: 0,
  rvy: 0,
};

export function cloneInput(i: PlayerInput): PlayerInput {
  return {
    left: i.left,
    right: i.right,
    jump: i.jump,
    rx: i.rx,
    ry: i.ry,
    rvx: i.rvx,
    rvy: i.rvy,
  };
}

export interface PlayerState {
  x: number;
  y: number; // feet
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1; // towards the opponent
  hitCooldown: number;
  /** racket head offset from the shoulder */
  rx: number;
  ry: number;
  /** racket head velocity */
  rvx: number;
  rvy: number;
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
  /** this tick's sim events, so the guest can play hit sounds too */
  ev?: SimEvent[];
}

export type MatchRole = 'single' | 'host' | 'guest';
