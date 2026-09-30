import type { WorldConfig, WorldMode } from './config';

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

/** keepy-uppy challenge state (only meaningful when world.mode === 'juggle') */
export interface JuggleState {
  /** successful hits per player */
  count: [number, number];
  /** whose turn it is */
  turn: 0 | 1;
  /** seconds left in the current turn */
  timeLeft: number;
  /** which players have finished their run */
  done: [boolean, boolean];
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
  /** runtime-tunable physics / rules (see config.ts) */
  config: WorldConfig;
  /** id of the party option the config came from */
  configId: string;
  mode: WorldMode;
  juggle: JuggleState;
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
  /** party option id the host is simulating with */
  cfg: string;
  /** world mode */
  md: WorldMode;
  /** [count0, count1, turn, timeLeft, done0, done1] */
  jg: [number, number, number, number, number, number];
  /** this tick's sim events, so the guest can play hit sounds too */
  ev?: SimEvent[];
}

export type MatchRole = 'single' | 'host' | 'guest';
