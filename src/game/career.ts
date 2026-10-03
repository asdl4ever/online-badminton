import type { AiPlayer, PlayerStats } from './players';
import { ARENA_TIERS } from './arena';
import { WORLD_CUPS } from './world-arena';

/**
 * 🏅 球员履历：主页上「冠军×N」那张奖牌点开看到的那份成绩单。
 *
 * 用 **名字 + 战绩 + 积分** 当种子算出来（见 `careerOf`），所以：
 * - 同一个球员每次打开、刷新页面看到的履历**完全一样**，不需要存档；
 * - **实力越强 → 打的杯赛级别越高、名次越好、冠军越多、最高排名越靠前**
 *   （传奇球员皮泽恩就是一堆冠军 + 最高排名第 1）；
 * - 杯名直接用游戏里真实的那两套池子：晋级赛的段位杯（新芽杯…传奇杯）
 *   与世界赛赛事名（世界巡回赛 / 山海公开赛…），所以名字跟别处对得上。
 */
export type Placing = 'champion' | 'runnerUp' | 'top4' | 'top8' | 'top16';

export const PLACING_LABEL: Record<Placing, string> = {
  champion: '冠军',
  runnerUp: '亚军',
  top4: '4 强',
  top8: '8 强',
  top16: '16 强',
};

/** 名次配色：冠军金 / 亚军银 / 4 强铜 / 其余灰 */
export const PLACING_TONE: Record<Placing, string> = {
  champion: '#d8a534',
  runnerUp: '#9fb0c6',
  top4: '#c08050',
  top8: '#8b9bb0',
  top16: '#8b9bb0',
};

/** 名次里的奖牌（4 强及以后没有牌） */
export const PLACING_MEDAL: Record<Placing, string> = {
  champion: '🥇',
  runnerUp: '🥈',
  top4: '🥉',
  top8: '',
  top16: '',
};

/** 打到第几轮（0..3，冠军是最后一轮）；也是「被淘汰在哪一轮」 */
const ROUND_OF: Record<Placing, number> = {
  champion: 3,
  runnerUp: 3,
  top4: 2,
  top8: 1,
  top16: 0,
};

/** 这一届赢下了几个对手（冠军 4 个） */
const BEATEN_OF: Record<Placing, number> = {
  champion: 4,
  runnerUp: 3,
  top4: 2,
  top8: 1,
  top16: 0,
};

export interface CareerEntry {
  ts: number;
  /** 年月：'2026-10' */
  month: string;
  /** 打的哪个杯 */
  cup: string;
  placing: Placing;
  /** 打到第几轮（0=16 强赛 … 3=决赛） */
  round: number;
  /** 被谁淘汰（冠军没有） */
  lostTo?: string;
  /** 这一届赢下几个对手 */
  beaten: number;
}

export interface Career {
  /** 履历里一共几届 */
  plays: number;
  /** 冠军数（主页那张奖牌上的数字） */
  titles: number;
  /** 最高排名（1 最好） */
  bestRank: number;
  /** 从新到旧 */
  entries: CareerEntry[];
}

const DAY = 86_400_000;

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** 年月标签（'2026-10'） */
export function monthOf(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** 能力值：五维平均折成 1.0~5.0（主页那张六边形卡片上的数） */
export function abilityScore(stats: PlayerStats): number {
  const v = [stats.technique, stats.speed, stats.attack, stats.defense, stats.jump];
  const avg = v.reduce((a, b) => a + b, 0) / v.length;
  return Math.round((avg / 20) * 10) / 10;
}

/** 总胜率（0~1）：有真实战绩就用真实的，没有就按积分估一个 */
export function winRateOf(
  wins: number | undefined,
  losses: number | undefined,
  rating: number,
): number {
  if (wins != null) {
    const total = wins + (losses ?? 0);
    if (total > 0) return clamp01(wins / total);
  }
  return 0.35 + 0.45 * clamp01((rating - 900) / 1500);
}

/** 战绩文字：'63%' 那种 */
export function winRateText(wins: number | undefined, losses: number | undefined, rating: number): string {
  return `${Math.round(winRateOf(wins, losses, rating) * 100)}%`;
}

/**
 * 抽一届赛事名：实力越强越可能打世界赛事 / 高级别赛事。
 * 普通赛事按「年份-级别 赛事名(级别)」命名，如「2026-50 新芽杯(50赛)」；
 * 世界赛事没有级别，就是「2026·世界巡回赛」。
 */
function pickCup(rng: () => number, power: number, year: number): string {
  if (rng() < 0.12 + 0.4 * power) {
    return `${year}·${WORLD_CUPS[Math.floor(rng() * WORLD_CUPS.length)]}`;
  }
  const span = ARENA_TIERS.length - 1;
  const tier = Math.max(0, Math.min(span, Math.round(power * span + (rng() - 0.5) * 1.6)));
  const a = ARENA_TIERS[tier];
  const name = a.names[Math.floor(rng() * a.names.length)] ?? a.cup;
  return `${year}-${a.fee} ${name}(${a.fee}赛)`;
}

/** 抽名次：强的人更容易夺冠，弱的多数止步前两轮 */
function rollPlacing(rng: () => number, skill: number): Placing {
  const r = rng();
  const p1 = skill ** 3 * 0.55;
  const p2 = Math.min(0.9, p1 + skill ** 2 * 0.22);
  const p3 = Math.min(0.94, p2 + skill * 0.26);
  const p4 = Math.min(0.99, p3 + skill * 0.34);
  if (r < p1) return 'champion';
  if (r < p2) return 'runnerUp';
  if (r < p3) return 'top4';
  if (r < p4) return 'top8';
  return 'top16';
}

/**
 * 算一位球员的履历。`roster` 只是用来给「被谁淘汰」挑个对手名字（给不出就不写对手）。
 */
export function careerOf(
  p: Pick<AiPlayer, 'name' | 'rating'> & Partial<Pick<AiPlayer, 'wins' | 'losses' | 'id'>>,
  opts: { roster?: readonly string[]; now?: number } = {},
): Career {
  const power = clamp01((p.rating - 900) / 1500);
  const skill = 0.25 + 0.75 * power;
  // 种子只认名字：换个地方算（主页 / 名人堂）结果一致，
  // 也不会因为战绩 +1 就把整份履历洗一遍（实力只影响概率，见 `skill`）
  const rng = mulberry32(hashStr(`career|${p.name}`));
  const others = (opts.roster ?? []).filter((n) => n && n !== p.name);

  const count = 6 + Math.floor(rng() * 11);
  const entries: CareerEntry[] = [];
  // 基准时间对齐到「今天 0 点」：同一天里反复打开，履历连时间戳都一样（列表不会抖）
  const base = Math.floor((opts.now ?? Date.now()) / DAY) * DAY;
  // 最近一届就在近日，然后一路往前推（跨月跨年，年月那列才有看头）
  let ts = base - (2 + rng() * 45) * DAY;

  for (let i = 0; i < count; i++) {
    const placing = rollPlacing(rng, skill);
    const entry: CareerEntry = {
      ts,
      month: monthOf(ts),
      cup: pickCup(rng, power, new Date(ts).getFullYear()),
      placing,
      round: ROUND_OF[placing],
      beaten: BEATEN_OF[placing],
    };
    if (placing !== 'champion' && others.length) {
      entry.lostTo = others[Math.floor(rng() * others.length)];
    }
    entries.push(entry);
    ts -= (20 + rng() * 110) * DAY;
  }

  return {
    plays: entries.length,
    titles: entries.filter((e) => e.placing === 'champion').length,
    bestRank: Math.max(1, Math.min(16, Math.round(1 + Math.pow(1 - power, 1.6) * 15))),
    entries,
  };
}
