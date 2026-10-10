import type { WorldConfig, WorldMode } from './config';
import type { CharacterSkin } from './cosmetics';
import type { PlayerAttrs } from './attrs';

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
  /** 体力 0..STAMINA_MAX：跑动/击球消耗，低了跑得慢、击球软、AI 更容易失误 */
  stamina: number;
}

export interface ShuttleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** false while resting / being held for a serve */
  live: boolean;
}

/**
 * 🎯 招式对「这一拍」的**出球改造**：真正改变球路，而不是靠属性倍率。
 *
 * 搓球变成贴网小球、挑高变成高远球、重杀把出球角度压向地面——都在
 * `releaseShuttle()` 里按这份参数算发射速度。
 *
 * ⚠️ **只会在单机 / PvE** 里由 `GameScene.applySkills` 按招式发动窗口写进
 * `world.shot[idx]`；联机从不设置（恒 null），对局公平性不受影响。
 */
export interface ShotStyle {
  /** 强制出球仰角（弧度；仍会过 aim 限位与「必须过网」保障） */
  elevation?: number;
  /** 出球速度倍率（叠在属性倍率之后） */
  speedMul?: number;
  /** 落点上限：从网往对面量、多少像素内必须落地（贴网小球 / 平快扑杀用） */
  landWithin?: number;
}

export type Phase = 'serve' | 'rally' | 'point' | 'gameover';

export type ShotKind = 'lift' | 'drive' | 'clear' | 'smash' | 'serve';

export interface SimEvent {
  type: 'hit' | 'net' | 'land' | 'point' | 'serve' | 'gameover' | 'belly' | 'skill';
  player?: number;
  kind?: ShotKind;
  /** racket swing speed at contact, normalised 0..1 against the speed cap */
  power?: number;
  x?: number;
  scorer?: number;
  /** type === 'skill'：触发的招式 id（单机 / PvE，用来累计熟练度） */
  id?: string;
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
  /**
   * 两名玩家各自的角色形象。U熊的肚皮会把球弹开，属于会影响轨迹的规则，
   * 所以放在世界上而不是只放在渲染层——两边都由「自己 + 对方的装扮」写进来，
   * 预测与权威模拟才不会分叉。
   */
  skins: [CharacterSkin, CharacterSkin];
  /**
   * 两名玩家的属性倍率（速度 / 力量 / 容错 / 体力）。这些会改变移动速度、击球力度与
   * 判定半径，属于会影响轨迹的规则，所以和 `skins` 一样放在世界上，并由
   * 「自己 + 联机对方通过 hello 报来的属性」写进来（见 GameScene.syncSkins）。
   */
  attrs: [PlayerAttrs, PlayerAttrs];
  /**
   * 两名玩家**这一拍各自的出球改造**（见 `ShotStyle`）。和 `skins` / `attrs`
   * 一样放在世界上，因为它影响模拟轨迹：招式的「真球路」就靠它生效。
   * 只在单机 / PvE 由招式写入，联机恒为 null。
   */
  shot: [ShotStyle | null, ShotStyle | null];
  juggle: JuggleState;
  machine: MachineState;
}

/** endless practice against the feeder (only when world.mode === 'machine') */
export interface MachineState {
  /** seconds until the next feed */
  timer: number;
  /** feeds fired this session */
  feeds: number;
  /** consecutive successful returns; a dropped feed resets it */
  streak: number;
  /** best streak of the session */
  best: number;
  /** total returns landed */
  returns: number;
  /** total feeds the player let drop */
  misses: number;
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
