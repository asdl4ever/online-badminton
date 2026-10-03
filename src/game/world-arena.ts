import {
  ARENA_ROUNDS,
  ARENA_SIZE,
  buildBracket,
  fillNextRound,
  simulateArenaMatch,
  type ArenaBracket,
  type ArenaEntrant,
} from './arena';
import { ensureStats, type AiPlayer } from './players';

/**
 * 🌍 世界赛：名人堂球员**持续打下去**的一届届 16 人单败淘汰赛（观战台的数据源）。
 *
 * 设计要点（都是为了让"看比赛"不需要服务器）：
 *
 * - **届号 = 时间片**：每 `WORLD_PERIOD_MS`（30 分钟）一届，`worldEdition(now)` 直接算出来；
 * - **参赛者与首轮对阵是确定性的**：种子 = `hash(届号)`，所以同一届在任何人机器上算出来
 *   都一样，刷新页面也不会变；
 * - **一场接一场占时间片**：一届 15 场，`WORLD_SLOT_MS` = 30 分钟 ÷ 15 = 2 分钟一场，
 *   `matchStart(届, 轮, 场)` 给出开赛时刻，于是"现在有没有比赛 / 还有多久开下一场"
 *   都是纯计算；一场比赛"正在进行"的窗口是 `WORLD_MATCH_MS`；
 * - **唯一需要持久化的是玩家真看过 / 快进过的那几场**（`overrides`）：没看过的到点用
 *   `simulateArenaMatch` 按五维算结果，看过的那场以**真实对局结果**为准。
 */

/** 一届世界赛的时长 */
export const WORLD_PERIOD_MS = 30 * 60 * 1000;
/** 一场占的时间片（一届 15 场刚好铺满一届） */
export const WORLD_SLOT_MS = Math.round(WORLD_PERIOD_MS / 15);
/** 一场比赛「正在进行」的窗口（真打一局大约这么久） */
export const WORLD_MATCH_MS = 110_000;
/** 观战窗口过后、距离下一场开打还有余量（时间片 - 比赛窗口） */
export const WORLD_ROUNDS = ARENA_ROUNDS.length;

// ---- 确定性小工具 -----------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---- 届号与开赛时间 ---------------------------------------------------------

/** 届号（自 Unix 纪元起的周期数） */
export function worldEdition(now: number = Date.now()): number {
  return Math.floor(now / WORLD_PERIOD_MS);
}

export function worldEditionStart(ed: number): number {
  return ed * WORLD_PERIOD_MS;
}

export function worldEditionEnd(ed: number): number {
  return (ed + 1) * WORLD_PERIOD_MS;
}

/** 第 r 轮第一场的全局序号（16 人：0 / 8 / 12 / 14） */
export function slotBase(round: number): number {
  return ARENA_SIZE - ARENA_SIZE / 2 ** round;
}

/** 第 r 轮第 i 场的全局序号（0..14） */
export function matchSlot(round: number, index: number): number {
  return slotBase(round) + index;
}

/** 这一场的开赛时刻 */
export function matchStart(ed: number, round: number, index: number): number {
  return worldEditionStart(ed) + matchSlot(round, index) * WORLD_SLOT_MS;
}

export type WorldMatchPhase = 'upcoming' | 'live' | 'ended';

/** 这一场现在是"没开始 / 正在进行 / 已结束" */
export function matchPhase(
  ed: number,
  round: number,
  index: number,
  now: number = Date.now(),
): WorldMatchPhase {
  const s = matchStart(ed, round, index);
  if (now < s) return 'upcoming';
  if (now < s + WORLD_MATCH_MS) return 'live';
  return 'ended';
}

export const MATCH_KEY = (round: number, index: number): string => `${round}:${index}`;

/** 世界赛的赛事名（每届换一个，让"参加的是哪一个赛事"有个具体名字） */
const WORLD_CUPS = [
  '世界巡回赛',
  '山海公开赛',
  '云端大师赛',
  '羽林争霸赛',
  '星海杯',
  '传奇邀请赛',
];

export function worldCupName(ed: number): string {
  const n = WORLD_CUPS.length;
  return WORLD_CUPS[((ed % n) + n) % n];
}

/** 第几届（对外显示的编号，从 1 开始，只取后三位免得数字太长） */
export function worldSeasonNo(ed: number): number {
  return (ed % 1000) + 1;
}

// ---- 参赛者与对阵树 ---------------------------------------------------------

/**
 * 这一届的 16 位参赛者：**rating 前 10 名保送** + 其余席位从剩下的人里随机补足
 * （有"黑马"才有看头），再整体洗牌定首轮对阵。已退役的不参加。
 */
export function worldEntrants(roster: readonly AiPlayer[], ed: number): ArenaEntrant[] {
  const pool = roster.filter((p) => !p.retired);
  if (pool.length < 2) return [];
  const rng = mulberry32(hashStr(`world-${ed}`));
  const byRating = [...pool].sort((a, b) => b.rating - a.rating || b.wins - a.wins);
  const lock = Math.min(10, byRating.length);
  const chosen = byRating.slice(0, lock);
  const rest = byRating.slice(lock);
  while (chosen.length < Math.min(ARENA_SIZE, pool.length) && rest.length) {
    chosen.push(rest.splice(Math.floor(rng() * rest.length), 1)[0]);
  }
  // 首轮对阵随机（种子确定）
  for (let i = chosen.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
  }
  return chosen.map((p) => ({
    id: p.id,
    name: p.name,
    isMe: false,
    rating: p.rating,
    style: p.style,
    difficulty: p.difficulty,
    cosmetic: p.cosmetic,
    stats: ensureStats(p),
  }));
}

export interface WorldArenaState {
  edition: number;
  entrants: ArenaEntrant[];
  rounds: ArenaBracket;
  /** 正在进行的那一场（同时最多一场） */
  live: { round: number; index: number } | null;
  /** 已经结束的场次数 / 总场次 */
  done: number;
  total: number;
}

/**
 * 算出这一届到 `now` 为止的对阵树：
 * 到点的场次才有结果（玩家看过的用 `overrides`，其余用五维模拟），没到点的留空，
 * 所以树是"随时间往下长"的，而且**纯函数**——不写任何状态。
 */
export function worldState(
  roster: readonly AiPlayer[],
  ed: number,
  now: number = Date.now(),
  overrides: Record<string, string> = {},
): WorldArenaState {
  const entrants = worldEntrants(roster, ed);
  const byId = new Map(entrants.map((e) => [e.id, e]));
  const rounds = buildBracket(entrants);
  let live: { round: number; index: number } | null = null;
  let done = 0;
  let total = 0;

  for (let r = 0; r < rounds.length; r++) {
    for (let i = 0; i < rounds[r].length; i++) {
      const m = rounds[r][i];
      if (!m.a || !m.b) continue;
      total++;
      const phase = matchPhase(ed, r, i, now);
      if (phase === 'live' && !live) live = { round: r, index: i };
      const ov = overrides[MATCH_KEY(r, i)];
      if (ov === m.a || ov === m.b) {
        m.winner = ov;
        done++;
        continue;
      }
      if (phase === 'ended') {
        const A = byId.get(m.a);
        const B = byId.get(m.b);
        m.winner = A && B ? simulateArenaMatch(A, B, mulberry32(hashStr(`world-${ed}-${r}-${i}`))) : m.a;
        done++;
      }
    }
    fillNextRound(rounds, r);
  }
  if (live) total = Math.max(total, done + 1);
  return { edition: ed, entrants, rounds, live, done, total: Math.max(total, 1) };
}

/** 整届打完时的冠军（没打完给 null） */
export function worldChampion(state: WorldArenaState): string | null {
  const final = state.rounds[state.rounds.length - 1]?.[0];
  return final?.winner ?? null;
}

/** 某位球员在这一届里的近况（观战台的「谁在打哪个赛事」用） */
export interface EntrantStatus {
  round: number;
  index: number;
  opponent?: ArenaEntrant;
  phase: WorldMatchPhase;
  startAt: number;
  /** 已经被淘汰 */
  out: boolean;
}

export function entrantSituation(
  state: WorldArenaState,
  id: string,
  now: number = Date.now(),
): EntrantStatus | null {
  for (let r = 0; r < state.rounds.length; r++) {
    const i = state.rounds[r].findIndex((m) => m.a === id || m.b === id);
    if (i < 0) continue;
    const m = state.rounds[r][i];
    const foeId = m.a === id ? m.b : m.a;
    if (m.winner && m.winner !== id) {
      return { round: r, index: i, phase: 'ended', startAt: matchStart(state.edition, r, i), out: true };
    }
    const phase = m.winner ? 'ended' : matchPhase(state.edition, r, i, now);
    return {
      round: r,
      index: i,
      opponent: state.entrants.find((e) => e.id === foeId),
      phase,
      startAt: matchStart(state.edition, r, i),
      out: false,
    };
  }
  return null;
}
