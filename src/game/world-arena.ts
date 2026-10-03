import {
  ARENA_ROUNDS,
  ARENA_TIERS,
  fillNextRound,
  simulateArenaMatch,
  type ArenaBracket,
  type ArenaEntrant,
  type ArenaMatch,
} from './arena';
import { ensureStats, type AiPlayer } from './players';

/**
 * 🌍 世界赛：名人堂球员**一直在打**的那些 16 人单败淘汰赛（观战台的数据源）。
 *
 * 现在同时有 **4 个杯**在跑（`CUP_COUNT`），而且**同一轮的所有比赛是同时进行的**：
 *
 * - **杯 × 轮次 = 时间片**：每个杯 `CUP_MS`（4 轮 × `CUP_ROUND_MS`）一届，
 *   4 个杯错开 `CUP_STAGGER_MS`（= 一届 ÷ 4）起步 —— 所以任何时刻都有一两个杯在打，
 *   一轮里 8 场 / 4 场 / 2 场 / 1 场**同时开打**（比如 16 强赛就是 8 场一起进行）；
 * - **一场比赛的直播窗口**是每轮的 `CUP_MATCH_MS`（110 秒，真打一局大约这么久），
 *   窗口结束后到下一轮开始之间是**轮次间隙**（这段时间没有直播）；
 * - **参赛者与对阵是确定性的**：种子 = `hash(杯 + 届)`，所以同一个杯的同一届在任何人
 *   机器上算出来都一样、刷新也不变，**不需要服务器**；
 * - **唯一持久化的是玩家真看过 / 快进过的场次**（`overrides`，键 = `cupMatchKey()`）：
 *   没看过的到点用 `simulateArenaMatch` 按五维算结果，看过的那场以**真实对局结果**为准。
 */

/** 同时进行的杯数 = 赛事档数（50赛 → 1000赛） */
export const CUP_COUNT = ARENA_TIERS.length;
/** 一轮占多久（同一轮的比赛同时开打、同时进行） */
export const CUP_ROUND_MS = 150_000;
/** 一场比赛「正在进行」的窗口（真打一局大约这么久；剩下的是轮次间隙） */
export const CUP_MATCH_MS = 110_000;
/** 一届的时长按最大杯型（4 轮）算；小杯型打完会留一段「本届已结束」的尾巴再翻篇 */
export const CUP_MS = CUP_ROUND_MS * ARENA_ROUNDS.length;
/** 冠军产生的时刻（16 强杯型）——「本届已结束」用这个 */
export const CUP_SETTLE_MS = (ARENA_ROUNDS.length - 1) * CUP_ROUND_MS + CUP_MATCH_MS;
/** 几个杯错开起步（一届 ÷ 杯数）：保证「总有杯在打、而且常常好几场同时打」 */
export const CUP_STAGGER_MS = Math.round(CUP_MS / CUP_COUNT);
/** 一共几轮（最大杯型） */
export const WORLD_ROUNDS = ARENA_ROUNDS.length;

/**
 * 世界赛七档：与晋级赛馆**同一套档位**（50 / 100 / 200 / 400 / 600 / 800 / 1000 赛）。
 * 按名人堂排名把球员切成七档，每人只属于一档 → **绝不会同时打两个杯**；
 * rating 涨了升档、掉了降档。每届的杯名从该档**名字池**里确定性地换（同名同届永远同名）。
 */
export interface CupTier {
  /** 组别 id（与晋级赛共用） */
  id: string;
  /** 级别名：50赛 / 100赛… */
  tag: string;
  fee: number;
  glyph: string;
  color: string;
}

const hexColor = (n: number): string => `#${n.toString(16).padStart(6, '0')}`;

export const CUP_TIERS: CupTier[] = ARENA_TIERS.map((t) => ({
  id: t.tier,
  tag: t.label,
  fee: t.fee,
  glyph: t.glyph,
  color: hexColor(t.color ?? 0xb0724a),
}));

export const cupTier = (cup: number): CupTier =>
  CUP_TIERS[((cup % CUP_TIERS.length) + CUP_TIERS.length) % CUP_TIERS.length];

/** 某档、某届的杯名：从名字池里确定性轮换（种子 = 杯+届） */
export function worldCupName(cup: number, season: number): string {
  const a = ARENA_TIERS[((cup % ARENA_TIERS.length) + ARENA_TIERS.length) % ARENA_TIERS.length];
  const pool = a.names;
  const pick = pool[hashStr(`cupname-c${cup}-s${season}`) % pool.length] ?? a.cup;
  return pick;
}

/** 杯型（一轮几场）→ 轮次名：从 `ARENA_ROUNDS` 尾部截取（8 强杯 = 8 强/4 强/决赛） */
export function roundNames(rounds: number): readonly string[] {
  return ARENA_ROUNDS.slice(Math.max(0, ARENA_ROUNDS.length - rounds));
}

/** 参赛人数 → 杯型大小（2 的幂）：4 人打 4 强、5~8 人打 8 强、再多打 16 强 */
export function bracketSizeOf(count: number): number {
  if (count <= 4) return 4;
  if (count <= 8) return 8;
  return 16;
}

/**
 * 给定人数的对阵树：不够的位置留**轮空**（空的一侧会在结算时自动晋级）。
 * 与 `buildBracket` 的区别：杯型大小可变（4 / 8 / 16），轮空不会把选手挤掉。
 */
export function buildTierBracket(entrants: ArenaEntrant[], size: number): ArenaBracket {
  const first: ArenaMatch[] = Array.from({ length: size / 2 }, () => ({ a: '', b: '', winner: null }));
  entrants.forEach((e, i) => {
    const m = first[Math.floor(i / 2)];
    if (!m) return;
    if (i % 2 === 0) m.a = e.id;
    else m.b = e.id;
  });
  const rounds: ArenaBracket = [first];
  for (let r = 1; r < Math.round(Math.log2(size)); r++) {
    rounds.push(Array.from({ length: first.length >> r }, () => ({ a: '', b: '', winner: null })));
  }
  return rounds;
}

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

// ---- 杯名 -------------------------------------------------------------------

/** 世界赛的赛事名（球员履历里用：早期/低段位打过的那些公开赛） */
export const WORLD_CUPS = [
  '世界巡回赛',
  '山海公开赛',
  '云端大师赛',
  '羽林争霸赛',
  '星海杯',
  '传奇邀请赛',
];

// ---- 杯的时间轴 -------------------------------------------------------------

/** 第 `cup` 个杯、第 `season` 届的开赛时刻 */
export function cupStart(cup: number, season: number): number {
  return season * CUP_MS + cup * CUP_STAGGER_MS;
}

/** 这个杯现在跑到第几届 */
export function cupSeason(cup: number, now: number = Date.now()): number {
  return Math.floor((now - cup * CUP_STAGGER_MS) / CUP_MS);
}

/** 第 r 轮的直播窗口（开打 → 结果出来） */
export function roundWindow(cup: number, season: number, round: number): { from: number; to: number } {
  const from = cupStart(cup, season) + round * CUP_ROUND_MS;
  return { from, to: from + CUP_MATCH_MS };
}

/** 持久化用的场次键（杯 / 届 / 轮 / 第几场都在里面，不同杯不会串） */
export function cupMatchKey(cup: number, season: number, round: number, index: number): string {
  return `c${cup}s${season}r${round}i${index}`;
}

/** 树状图里一行的键（只管杯内） */
export const MATCH_KEY = (round: number, index: number): string => `${round}:${index}`;

// ---- 参赛者与对阵树 ---------------------------------------------------------

/**
 * 某个段位杯这一届的参赛者：**按名人堂排名切档**（排名前 1/4 打超神杯……最后 1/4 打青铜杯），
 * 档内整体洗牌定首轮对阵，人数凑不满杯型就留轮空。已退役的不参加。
 * 因为各档**互不重叠**，所以一位选手同一时刻只会出现在一个杯里。
 */
export function worldEntrants(roster: readonly AiPlayer[], cup: number, season: number): ArenaEntrant[] {
  const pool = roster.filter((p) => !p.retired);
  if (pool.length < 2) return [];
  const byRating = [...pool].sort((a, b) => b.rating - a.rating || b.wins - a.wins);
  const total = byRating.length;
  const tierPlayers = byRating.filter((_, i) => Math.floor((i / total) * CUP_COUNT) === cup);
  const size = bracketSizeOf(tierPlayers.length);
  const rng = mulberry32(hashStr(`world-c${cup}-s${season}`));
  const arr = [...tierPlayers];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, size).map((p) => ({
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

export type WorldMatchPhase = 'upcoming' | 'live' | 'ended';

/** 一个杯当前的状态 */
export interface CupState {
  id: number;
  /** 档位（级别标签 / 图标 / 颜色，与晋级赛同源） */
  tier: CupTier;
  /** 这一届的杯名（从该档名字池轮换，如「小白公开赛(50赛)」） */
  name: string;
  /** 杯型对应的轮次名（8 强杯 = ['8 强赛','4 强赛','决赛']） */
  roundNames: readonly string[];
  season: number;
  /** 这一届的开赛时刻 */
  startAt: number;
  /** 现在打到第几轮（0..3）；= 4 表示这一届打完了 */
  round: number;
  /** 正在直播的这轮的窗口（没有直播时 from/to 指向下一轮） */
  liveFrom: number;
  liveTo: number;
  /** 现在有没有直播（轮次间隙里是 false） */
  live: boolean;
  entrants: ArenaEntrant[];
  rounds: ArenaBracket;
  /** 这一届已经打了几场 / 一共几场 */
  done: number;
  total: number;
  champion: string | null;
  /** 这一届结束的时刻 / 下一届开赛时刻 */
  endAt: number;
  nextAt: number;
}

/** 一场正在直播的比赛（可能同时有好几场） */
export interface LiveRef {
  cup: number;
  round: number;
  index: number;
}

export interface WorldArenaState {
  cups: CupState[];
  /** 现在所有正在直播的比赛（跨杯，可能同时十几场） */
  liveMatches: LiveRef[];
  /** 有几个杯正在直播 */
  liveCups: number;
  /** 跨杯合计：已经打完 / 一共 */
  done: number;
  total: number;
}

/**
 * 算出到 `now` 为止，4 个杯各自的对阵树。
 * 到点的场次才有结果（玩家看过的用 `overrides`，其余用五维模拟），没到点的留空，
 * 所以树是"随时间往下长"的，而且**纯函数**——不写任何状态。
 */
export function worldState(
  roster: readonly AiPlayer[],
  now: number = Date.now(),
  overrides: Record<string, string> = {},
): WorldArenaState {
  const cups: CupState[] = [];
  const liveMatches: LiveRef[] = [];
  let doneAll = 0;
  let totalAll = 0;

  for (let c = 0; c < CUP_COUNT; c++) {
    const season = cupSeason(c, now);
    const key = `c${c}-s${season}`;
    const startAt = cupStart(c, season);
    const entrants = worldEntrants(roster, c, season);
    const byId = new Map(entrants.map((e) => [e.id, e]));
    const rounds = buildTierBracket(entrants, bracketSizeOf(entrants.length));
    // 第一个「还没打完」的轮就是当前轮；全打完了 round = 轮数
    let round = rounds.length;
    let done = 0;
    let total = 0;
    let liveFrom = startAt + CUP_MS;
    let liveTo = liveFrom;
    let live = false;

    for (let r = 0; r < rounds.length; r++) {
      const win = roundWindow(c, season, r);
      const settled = now >= win.to;

      for (let i = 0; i < rounds[r].length; i++) {
        const m = rounds[r][i];
        // 轮空：只有一边有人 → 直接晋级（这一场不算进 total / done）
        if (m.a && !m.b) {
          m.winner = m.a;
          continue;
        }
        if (!m.a && m.b) {
          m.winner = m.b;
          continue;
        }
        if (!m.a || !m.b) continue;
        total++;
        const ov = overrides[cupMatchKey(c, season, r, i)];
        if (ov === m.a || ov === m.b) {
          m.winner = ov;
          done++;
          continue;
        }
        if (settled) {
          const A = byId.get(m.a);
          const B = byId.get(m.b);
          m.winner = A && B
            ? simulateArenaMatch(A, B, mulberry32(hashStr(`sim-${key}-${r}-${i}`)))
            : m.a;
          done++;
        }
      }

      if (!settled && round === rounds.length) {
        round = r;
        live = now >= win.from;
        liveFrom = win.from;
        liveTo = win.to;
        if (live) {
          // 这一轮正在直播：场上还没结果的那几场**都在同一刻进行**
          for (let i = 0; i < rounds[r].length; i++) {
            const m = rounds[r][i];
            if (m.a && m.b && !m.winner) liveMatches.push({ cup: c, round: r, index: i });
          }
        }
      }

      fillNextRound(rounds, r);
    }

    const final = rounds[rounds.length - 1]?.[0];
    cups.push({
      id: c,
      tier: cupTier(c),
      name: worldCupName(c, season),
      roundNames: roundNames(rounds.length),
      season,
      startAt,
      round,
      liveFrom,
      liveTo,
      live,
      entrants,
      rounds,
      done,
      total: Math.max(total, 1),
      champion: final && final.a && final.b ? final.winner ?? null : null,
      endAt: startAt + (rounds.length - 1) * CUP_ROUND_MS + CUP_MATCH_MS,
      nextAt: startAt + CUP_MS,
    });
    doneAll += done;
    totalAll += Math.max(total, 1);
  }

  return {
    cups,
    liveMatches,
    liveCups: cups.filter((c) => c.live).length,
    done: doneAll,
    total: totalAll,
  };
}

/** 某个杯整届打完时的冠军（没打完给 null） */
export function cupChampion(cup: CupState): string | null {
  return cup.champion;
}

/** 一整个杯赛还剩多久打完 */
export function cupLeft(cup: CupState, now: number = Date.now()): number {
  return Math.max(0, cup.endAt - now);
}

/** 某位球员在某一个杯里的近况（观战台的「谁在打哪个赛事」用） */
export interface EntrantStatus {
  round: number;
  index: number;
  opponent?: ArenaEntrant;
  phase: WorldMatchPhase;
  /** 这一轮的直播窗口 */
  from: number;
  to: number;
  /** 已经被淘汰 */
  out: boolean;
}

export function entrantSituation(
  cup: CupState,
  id: string,
  now: number = Date.now(),
): EntrantStatus | null {
  for (let r = 0; r < cup.rounds.length; r++) {
    const i = cup.rounds[r].findIndex((m) => m.a === id || m.b === id);
    if (i < 0) continue;
    const m = cup.rounds[r][i];
    const foeId = m.a === id ? m.b : m.a;
    const win = roundWindow(cup.id, cup.season, r);
    const liveNow = cup.live && cup.round === r && now >= win.from && now < win.to;
    if (m.winner && m.winner !== id) {
      return { round: r, index: i, phase: 'ended', from: win.from, to: win.to, out: true };
    }
    const phase: WorldMatchPhase = m.winner
      ? 'ended'
      : liveNow
        ? 'live'
        : now < win.from
          ? 'upcoming'
          : 'ended';
    return {
      round: r,
      index: i,
      opponent: cup.entrants.find((e) => e.id === foeId),
      phase,
      from: win.from,
      to: win.to,
      out: false,
    };
  }
  return null;
}

/** 名单里有没有这个人正在打（名人堂给他一个「观战」入口） */
export function liveMatchOfId(
  state: WorldArenaState,
  id: string,
): LiveRef | null {
  for (const l of state.liveMatches) {
    const m = state.cups[l.cup]?.rounds[l.round]?.[l.index];
    if (m && (m.a === id || m.b === id)) return l;
  }
  return null;
}
