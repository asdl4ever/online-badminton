import { AIController } from './ai';
import { ensureStats, makeRandomPlayer, type AiPlayer } from './players';
import { createWorld, stepWorld } from './simulation';
import type { World } from './types';

/** 物理固定步长（秒）——与 `GameScene` 用的同一个值（那里是本模块私有的常量） */
const FIXED_DT = 1 / 60;

/**
 * 大熊球馆里「普通场地」的后台对局：**一张场地一个无头比赛**。
 *
 * 和正式对局走的是同一套内核——`createWorld()` + 两个 `AIController` +
 * `stepWorld()` 固定步进，只是**不建 Phaser 场景**：调用方（球馆页面）在房间的
 * rAF 里每帧调一次 `step(dt)`，然后自己画比分与角色。
 *
 * 几个刻意的取舍（6 张场地同时跑，手机上要省）：
 * - **AI 每帧最多算一次**（和 `GameScene` 一样），不是每个子步都算；默认再加一层
 *   降频（`aiHz`，30Hz），因为 AI 的开销大头是「击球瞬间的弹道规划」，
 *   20~30Hz 已经完全看不出差别；
 * - 物理仍是**满 60Hz 固定步进**（比分、球的轨迹都是真的）；
 * - 一局（默认 11 分）打完后摆 `HANDOVER_S` 秒展示比分，再换下一对选手重开。
 */
const HANDOVER_S = 1.8;
/** 一帧最多追几个物理子步（掉帧时不至于雪崩） */
const MAX_SUBSTEPS = 6;

export interface MiniScore {
  score: [number, number];
  over: boolean;
  /** 打完时的胜者（0 / 1），没打完是 -1 */
  winner: number;
}

export class MiniMatch {
  /** 当前这一局的世界（调用方只读它的 players / shuttle / score） */
  world: World;
  /** 这一局的两边（渲染层要用它们的 cosmetic 画角色） */
  sides: [AiPlayer, AiPlayer];

  private ai: [AIController, AIController];
  private roster: readonly AiPlayer[];
  private rng: () => number;
  /** AI 的更新间隔（秒）：默认 1/30 */
  private aiStep: number;
  private aiClock = 0;
  private inputs: [ReturnType<AIController['update']>, ReturnType<AIController['update']>];
  private accum = 0;
  private overFor = 0;
  /** 这一局是否已经打完（打完就只等换人，不再步进） */
  private done = false;

  constructor(roster: readonly AiPlayer[], opts: { aiHz?: number; rng?: () => number } = {}) {
    this.roster = roster;
    this.rng = opts.rng ?? Math.random;
    this.aiStep = 1 / Math.max(1, opts.aiHz ?? 30);
    this.sides = this.pickPair();
    this.ai = [
      new AIController(ensureStats(this.sides[0]), 0),
      new AIController(ensureStats(this.sides[1]), 1),
    ];
    this.world = this.makeWorld();
    this.inputs = [
      this.ai[0].update(this.world, 0, this.aiStep),
      this.ai[1].update(this.world, 1, this.aiStep),
    ];
  }

  get score(): MiniScore {
    return {
      score: [this.world.score[0], this.world.score[1]],
      over: this.done,
      winner: this.done ? this.world.winner : -1,
    };
  }

  /** 每帧调一次（dt 秒）。跑满 60Hz 固定步进，AI 按 `aiHz` 降频。 */
  step(dt: number): void {
    if (this.done) {
      this.overFor += dt;
      if (this.overFor >= HANDOVER_S) this.restart();
      return;
    }

    this.aiClock += dt;
    if (this.aiClock >= this.aiStep) {
      const step = this.aiClock;
      this.aiClock = 0;
      this.inputs = [
        this.ai[0].update(this.world, 0, step),
        this.ai[1].update(this.world, 1, step),
      ];
    }

    this.accum = Math.min(this.accum + dt, FIXED_DT * MAX_SUBSTEPS);
    for (let i = 0; i < MAX_SUBSTEPS && this.accum >= FIXED_DT; i++) {
      this.accum -= FIXED_DT;
      stepWorld(this.world, [this.inputs[0], this.inputs[1]], FIXED_DT);
      if (this.world.phase === 'gameover') {
        this.done = true;
        break;
      }
    }
  }

  /** 换一对选手、从 0:0 重开 */
  restart(): void {
    this.sides = this.pickPair();
    this.ai = [
      new AIController(ensureStats(this.sides[0]), 0),
      new AIController(ensureStats(this.sides[1]), 1),
    ];
    this.world = this.makeWorld();
    this.inputs = [
      this.ai[0].update(this.world, 0, this.aiStep),
      this.ai[1].update(this.world, 1, this.aiStep),
    ];
    this.accum = 0;
    this.overFor = 0;
    this.aiClock = 0;
    this.done = false;
  }

  /** 新建世界并把两位选手的形象写进去（U熊的肚皮 / 老皮的屁股是**判定**的一部分） */
  private makeWorld(): World {
    const w = createWorld();
    w.skins = [this.sides[0].cosmetic.characterSkin, this.sides[1].cosmetic.characterSkin];
    return w;
  }

  /** 从名人堂名录里抽两位不同的人；名单不够就现造两位路人 */
  private pickPair(): [AiPlayer, AiPlayer] {
    const pool = this.roster;
    if (pool.length >= 2) {
      const ia = Math.floor(this.rng() * pool.length);
      let ib = Math.floor(this.rng() * (pool.length - 1));
      if (ib >= ia) ib += 1;
      return [pool[ia], pool[ib]];
    }
    return [makeRandomPlayer(pool, this.rng), makeRandomPlayer(pool, this.rng)];
  }
}
