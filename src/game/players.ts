/**
 * AI 球员名录：单机、晋级赛与「名人堂」排行榜共用的一批虚拟选手。
 *
 * **四维（技术 / 速度 / 进攻 / 防守）是唯一的数据源**——战术风格、难度档、
 * 命中精度与物理加成全部由它派生（见 ai.ts 的 styleFromStats / tierFromStats /
 * behaviorFromStats）。名录只在第一次进入游戏时随机生成一次，之后存进
 * progress（`bmt-ai-players`），战绩由玩家每次和他们交手后写回，排行榜按 rating 排序。
 */
import { STAT_KEYS, styleFromStats, tierFromStats, type AiStyle, type Difficulty } from './ai';
import { ITEMS, type ItemSlot } from './items';
import { DEFAULT_COSMETIC, type Cosmetic } from './cosmetics';
import type { AttrAlloc, PlayerAttrs } from './attrs';
import { GROUPS, groupForPoints } from './ranks';

/** 球员主页五维图：技术 / 速度 / 进攻 / 防守 / 弹跳（0–100） */
export interface PlayerStats {
  technique: number;
  speed: number;
  attack: number;
  defense: number;
  jump: number;
}

export interface AiPlayer {
  id: string;
  name: string;
  style: AiStyle;
  difficulty: Difficulty;
  wins: number;
  losses: number;
  /** 排行榜排序用的积分（交手后加减） */
  rating: number;
  /** 四维能力（生成时定死，不随战绩变化） */
  stats: PlayerStats;
  cosmetic: Cosmetic;
}

/** 名录里的名字池（首次生成时随机不重复取） */
const NAME_POOL = [
  '疾风侠', '扣杀王', '老张', '小球童', '夜羽', '铁拍子', '云中鹤', '大力妹', '零式', '翻盘手',
  '闪电手', '不动明王', '断线风筝', '一羽惊鸿', '白露', '疾光', '冷月', '烈风', '青隼', '玄铁',
  '长空', '飞星', '雨燕', '孤影', '斜风', '轻尘', '风暴眼', '铁壁', '碎星', '落霞',
  '独酌', '踏雪', '流云', '花间', '重炮', '碎羽', '弹指', '游龙', '雷霆', '磐石',
];

const EMOJIS = ['😎', '🐯', '🦊', '🐼', '🦅', '🐉', '👾', '🤠', '🐺', '🦁', '🐧', '🦈', '🐸', '🤖', '🐻', '🦉'];

const COLORS = [0xff5a4d, 0x3d8bfd, 0x39d0a0, 0xffd45c, 0x9b59d0, 0xff8a5c, 0x6f9fce, 0xff6f91];

function clampStat(n: number): number {
  return Math.max(20, Math.min(99, Math.round(n)));
}

/** 确定性小伪随机（同一个种子永远同一串） */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
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

/**
 * 直接掷四维：整体水平随 rating 抬高，并给大多数球员随机突出一个「特长维」。
 * 风格不再是输入——它是四维掷完之后的**结果**（见 styleFromStats）。
 */
function rollStats(rating: number, rng: () => number): PlayerStats {
  const base = 45 + ((rating - 900) / 900) * 38; // 45..83
  const jit = (): number => (rng() * 2 - 1) * 13;
  const s: PlayerStats = {
    technique: base + jit(),
    speed: base + jit(),
    attack: base + jit(),
    defense: base + jit(),
    jump: base + jit(),
  };
  if (rng() < 0.85) {
    const keys: (keyof PlayerStats)[] = ['technique', 'speed', 'attack', 'defense', 'jump'];
    s[keys[Math.floor(rng() * keys.length)]] += 14 + rng() * 10;
  }
  return {
    technique: clampStat(s.technique),
    speed: clampStat(s.speed),
    attack: clampStat(s.attack),
    defense: clampStat(s.defense),
    jump: clampStat(s.jump),
  };
}

/**
 * 老存档兼容：缺 stats（或维度不全，比如没有后加的「弹跳」）时，
 * 按 id/name 确定性重掷一份（同一位球员每次都一样）。
 */
export function ensureStats(p: AiPlayer): PlayerStats {
  const s = p.stats;
  if (s && STAT_KEYS.every((k) => typeof s[k] === 'number')) return s;
  return rollStats(p.rating, mulberry32(hashStr(`${p.id}:${p.name}`)));
}

/** 校准派生字段：让 style / difficulty 始终跟四维一致 */
export function syncDerived(p: AiPlayer): AiPlayer {
  const stats = ensureStats(p);
  return { ...p, stats, style: styleFromStats(stats), difficulty: tierFromStats(stats) };
}

/**
 * 四维（0–100，50 为基准）→ 物理倍率。这是**唯一的加成来源**：
 * 玩家和 AI 都走这一条，四维图看到的就是对局里真正生效的东西。
 * - 速度 → 移动速度
 * - 进攻 → 击球力度
 * - 防守 → 击球判定半径（够得到球）
 * - 技术 → 出球容错（挥拍不到位时球质也不崩，见 simulation 的 shotSpeedMin）
 * - 弹跳 → 起跳高度
 */
export function attrsFromStats(s: PlayerStats): PlayerAttrs {
  const mul = (v: number): number => 1 + ((v - 50) / 50) * 0.4;
  return {
    speed: mul(s.speed),
    power: mul(s.attack),
    // 判定半径归「防守」：防守高 = 够得到球
    reach: mul(s.defense),
    // 起跳高度归「弹跳」
    jump: mul(s.jump),
    // 技术高 → 出球下限更高（挥得轻也不会打太软）
    skill: mul(s.technique),
  };
}

/** 单维分对应的加成比例（用于四维图上标「+12%」这种） */
export function statBonus(v: number): number {
  return ((v - 50) / 50) * 0.4;
}

/**
 * 玩家自己的四维。属性点与四维的对应关系要跟 `attrsFromStats` 一致：
 * 速度点 → 速度，力量点 → 进攻，**容错点 → 防守**（判定半径由防守决定）。
 * 技术维对玩家只是「手感」展示（玩家自己控制出球，不走 AI 的出球质量）。
 */
export function playerStats(points: number, alloc: AttrAlloc): PlayerStats {
  const base = 52 + Math.min(30, points / 50);
  const per = 8;
  return {
    speed: clampStat(base + (alloc.speed ?? 0) * per),
    attack: clampStat(base + (alloc.power ?? 0) * per),
    defense: clampStat(base + (alloc.reach ?? 0) * per),
    jump: clampStat(base + (alloc.jump ?? 0) * per),
    technique: clampStat(base + Math.min(14, points / 130)),
  };
}

/** 「进行中的比赛」每片持续这么久，到点自动换人 */
export const LIVE_WINDOW_MS = 45_000;

export interface LiveMatch {
  a: AiPlayer;
  b: AiPlayer;
}

/**
 * 按当前时间片确定性生成「正在进行的比赛」：同 45 秒内每次算出来都一样，
 * 跨刷新也一致（不需要存 localStorage）。名人堂里只有这些球员能观战。
 */
export function liveMatches(roster: readonly AiPlayer[], now = Date.now(), count = 3): LiveMatch[] {
  if (roster.length < 2) return [];
  const rng = mulberry32(Math.floor(now / LIVE_WINDOW_MS) * 2654435761 + 7);
  const pool = [...roster];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const out: LiveMatch[] = [];
  for (let k = 0; k + 1 < pool.length && out.length < count; k += 2) {
    out.push({ a: pool[k], b: pool[k + 1] });
  }
  return out;
}

function pickRef(slot: ItemSlot, rng: () => number): string {
  const pool = ITEMS.filter((i) => i.slot === slot && i.ref !== 'none' && i.ref !== 'default');
  if (!pool.length) return 'none';
  return pool[Math.floor(rng() * pool.length)].ref;
}

function randomCosmetic(rng: () => number): Cosmetic {
  const c = { ...DEFAULT_COSMETIC };
  c.emoji = EMOJIS[Math.floor(rng() * EMOJIS.length)];
  c.hat = pickRef('hat', rng) as Cosmetic['hat'];
  c.wings = pickRef('wings', rng) as Cosmetic['wings'];
  c.cape = pickRef('cape', rng) as Cosmetic['cape'];
  c.aura = pickRef('aura', rng) as Cosmetic['aura'];
  c.racketSkin = pickRef('racketSkin', rng) as Cosmetic['racketSkin'];
  c.trailStyle = pickRef('trail', rng) as Cosmetic['trailStyle'];
  c.swingTrail = pickRef('swingTrail', rng) as Cosmetic['swingTrail'];
  c.pet = 'none';
  c.racket = COLORS[Math.floor(rng() * COLORS.length)];
  c.trail = COLORS[Math.floor(rng() * COLORS.length)];
  return c;
}

/** 随机生成一整份名录（首次进入游戏时调用一次） */
export function generatePlayers(count = 20, rng: () => number = Math.random): AiPlayer[] {
  const names = [...NAME_POOL];
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  const n = Math.min(count, names.length);
  const out: AiPlayer[] = [];
  for (let i = 0; i < n; i++) {
    const rating = Math.round(900 + rng() * 900);
    const stats = rollStats(rating, rng);
    out.push({
      id: `ai-${i + 1}`,
      name: names[i],
      // 风格与难度都是四维的结果，不再独立随机
      style: styleFromStats(stats),
      difficulty: tierFromStats(stats),
      wins: Math.floor(rng() * 30),
      losses: Math.floor(rng() * 30),
      rating,
      stats,
      cosmetic: randomCosmetic(rng),
    });
  }
  return out;
}

// ---- 传奇球员：皮泽恩 -------------------------------------------------------

/** 传奇球员「皮泽恩」的固定 id：他永远在名录里，也永远在榜首 */
export const LEGEND_ID = 'legend-peisien';

/**
 * 游戏里最强的 AI —— 皮泽恩。
 *
 * 五维全线 95+，于是（见 ai.ts 的 behaviorFromStats）：
 * - `defense` 拉满 → `loft` 1.4：出球又高又深，**高远球压底线**
 * - `attack` 拉满 → `aggression` 1.7：球一旦偏高就压网起跳**扣杀**
 * - `technique` 拉满 → 出球误差与失误率都压到最低
 * 风格由五维派生为 `legend`。外观是他标志性的大肚子熊皮（U熊，球撞肚皮会被弹开）。
 */
export function makeLegend(): AiPlayer {
  const stats: PlayerStats = {
    technique: 99,
    speed: 96,
    attack: 99,
    defense: 98,
    jump: 95,
  };
  return {
    id: LEGEND_ID,
    name: '皮泽恩',
    style: styleFromStats(stats),
    difficulty: tierFromStats(stats),
    wins: 486,
    losses: 12,
    rating: 2400,
    stats,
    cosmetic: {
      ...DEFAULT_COSMETIC,
      characterSkin: 'ubear',
      emoji: '🐻',
      racket: 0xffb03a,
      trail: 0xffd45c,
      trailStyle: 'gold',
      swingTrail: 'blaze',
      aura: 'king',
      racketSkin: 'gold',
    },
  };
}

/** 把皮泽恩补进名录（老存档里没有他时也要有），并且恒定排在最前 */
export function withLegend(roster: readonly AiPlayer[]): AiPlayer[] {
  return [makeLegend(), ...roster.filter((p) => p.id !== LEGEND_ID)];
}

/** 排行榜排序：rating 从高到低 */
export function rankedPlayers(roster: readonly AiPlayer[]): AiPlayer[] {
  return [...roster].sort((a, b) => b.rating - a.rating || b.wins - a.wins);
}

export function playerById(roster: readonly AiPlayer[], id: string): AiPlayer | undefined {
  return roster.find((p) => p.id === id);
}

/**
 * 玩家当前段位对应的对手 rating 区间：组别越高，抽到的对手越强。
 * （新芽组约 760–1040，传奇组约 1530–1810）
 */
export function opponentRatingRange(points: number): [number, number] {
  const idx = GROUPS.findIndex((g) => g.id === groupForPoints(points).id);
  const center = 900 + idx * 110;
  return [center - 140, center + 140];
}

/**
 * 抽一位对手：传了 points 就**按玩家段位匹配**（只从对应的 rating 区间里抽），
 * 区间里没人时取最接近的几个兜底；排除正在打的那位，避免连续遇到同一个。
 */
export function pickOpponent(
  roster: readonly AiPlayer[],
  opts: { points?: number; excludeId?: string } = {},
  rng: () => number = Math.random,
): AiPlayer | undefined {
  if (!roster.length) return undefined;
  let pool = [...roster];
  if (opts.excludeId && pool.length > 1) pool = pool.filter((p) => p.id !== opts.excludeId);

  if (opts.points != null) {
    const [lo, hi] = opponentRatingRange(opts.points);
    const inRange = pool.filter((p) => p.rating >= lo && p.rating <= hi);
    if (inRange.length) {
      pool = inRange;
    } else {
      const center = (lo + hi) / 2;
      pool = [...pool]
        .sort((a, b) => Math.abs(a.rating - center) - Math.abs(b.rating - center))
        .slice(0, 3);
    }
  }
  return pool[Math.floor(rng() * pool.length)];
}

/** 五维综合分（判定 AI 之间谁更强，见 arena.simulateArenaMatch） */
export function statPower(s: PlayerStats): number {
  return (s.technique + s.speed + s.attack + s.defense + s.jump) / 5;
}

/** 玩家和某位 AI 打完一场：从 AI 视角记胜负并调整 rating */
export function applyMatchResult(p: AiPlayer, playerWon: boolean): AiPlayer {
  const stats = ensureStats(p);
  const rating = Math.max(400, p.rating + (playerWon ? -38 : 42));
  return {
    ...p,
    stats,
    // rating 会变，但风格与难度看的是四维，所以这里保持一致
    style: styleFromStats(stats),
    difficulty: tierFromStats(stats),
    wins: p.wins + (playerWon ? 0 : 1),
    losses: p.losses + (playerWon ? 1 : 0),
    rating,
  };
}
