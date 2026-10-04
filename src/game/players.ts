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
import type { PlayerAttrs } from './attrs';
import { TRAIN_PER_LEVEL, type TrainKey, type TrainLevels } from './training';
import { GROUPS, groupForPoints } from './ranks';

/** 球员主页五维图：技术 / 速度 / 进攻 / 防守 / 体力（0–100） */
export interface PlayerStats {
  technique: number;
  speed: number;
  attack: number;
  defense: number;
  stamina: number;
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
  /**
   * **已退役**：人还留在名录里（战绩 / 履历都保留），但不再上排行榜、也不参加赛事。
   * 可以在名人堂里点「复出」把他请回来。
   */
  retired?: boolean;
  /** 玩家自己在名人堂里新增的球员（可以「除名」） */
  custom?: boolean;
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
    stamina: base + jit(),
  };
  if (rng() < 0.85) {
    const keys: (keyof PlayerStats)[] = ['technique', 'speed', 'attack', 'defense', 'stamina'];
    s[keys[Math.floor(rng() * keys.length)]] += 14 + rng() * 10;
  }
  return {
    technique: clampStat(s.technique),
    speed: clampStat(s.speed),
    attack: clampStat(s.attack),
    defense: clampStat(s.defense),
    stamina: clampStat(s.stamina),
  };
}

/**
 * 老存档兼容：缺 stats（或维度不全，比如老存档里还是「弹跳」而不是「体力」）时，
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
 * - 体力 → 体力上限更高、跑动挥拍消耗更慢
 */
export function attrsFromStats(s: PlayerStats): PlayerAttrs {
  const mul = (v: number): number => 1 + ((v - 50) / 50) * 0.4;
  return {
    speed: mul(s.speed),
    power: mul(s.attack),
    // 判定半径归「防守」：防守高 = 够得到球
    reach: mul(s.defense),
    // 技术高 → 出球下限更高（挥得轻也不会打太软）
    skill: mul(s.technique),
    // 体力高 → 同样的跑动挥拍更省体力（体力条更长、掉得更慢）
    stamina: mul(s.stamina),
  };
}

/** 单维分对应的加成比例（用于四维图上标「+12%」这种） */
export function statBonus(v: number): number {
  return ((v - 50) / 50) * 0.4;
}

/**
 * 玩家自己的五维：**基础分只看积分**（打得多了底子好一点），
 * 在此之上叠加「锻炼等级」——练哪一维就长哪一维（见 training.ts）。
 *
 * 体力那一维的基础分故意比别的维低 16，所以角色**一上来体力比较弱**
 * （跑动挥拍掉得快），得去操场跑到练满才追平。练出来的东西和 AI 走同一条
 * attrsFromStats 换算。
 */
export function playerStats(points: number, levels: TrainLevels): PlayerStats {
  // 积分只给一点点「打得多、底子好」的加成（最多 +20），成长的大头在锻炼等级
  const base = 52 + Math.min(20, points / 90);
  const lv = (k: TrainKey): number => (levels?.[k] ?? 0) * TRAIN_PER_LEVEL;
  return {
    speed: clampStat(base + lv('speed')),
    attack: clampStat(base + lv('attack')),
    defense: clampStat(base + lv('defense')),
    stamina: clampStat(base - 16 + lv('stamina')),
    technique: clampStat(base + lv('technique') + Math.min(12, points / 150)),
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
    stamina: 95,
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
  return (s.technique + s.speed + s.attack + s.defense + s.stamina) / 5;
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

// ---- 名人堂的增删改（新增 / 退役 / 编辑）与「世界赛」的战绩 -------------------

/**
 * 由五维综合分反推一个**相称的 rating**（编辑球员后用来把榜单分数拉回与能力匹配的量级）。
 * 与生成时的刻度对齐：综合分 45 ≈ 900、97 ≈ 2400。
 */
export function ratingFromStats(s: PlayerStats): number {
  const v = 900 + ((statPower(s) - 45) / 52) * 1500;
  return Math.round(Math.max(400, Math.min(2800, v)));
}

/** 随机造一位新球员（名人堂的「新增球员」用）：名字优先从还没被占用的池子里挑 */
export function makeRandomPlayer(
  roster: readonly AiPlayer[],
  rng: () => number = Math.random,
): AiPlayer {
  const used = new Set(roster.map((p) => p.name));
  const free = NAME_POOL.filter((n) => !used.has(n));
  const name = free.length ? free[Math.floor(rng() * free.length)] : `新人 ${roster.length + 1}`;
  const rating = Math.round(900 + rng() * 900);
  const stats = rollStats(rating, rng);
  return {
    id: `custom-${Date.now().toString(36)}-${Math.floor(rng() * 46656).toString(36)}`,
    name,
    style: styleFromStats(stats),
    difficulty: tierFromStats(stats),
    wins: 0,
    losses: 0,
    rating,
    stats,
    cosmetic: randomCosmetic(rng),
    custom: true,
  };
}

/** 换一身随机装扮（编辑面板的「随机换装」） */
export function rerollCosmetic(rng: () => number = Math.random): Cosmetic {
  return randomCosmetic(rng);
}

/**
 * **AI 对 AI** 打完一场（世界赛那种）：胜者记一胜、负者记一负，rating 互有升降。
 * 这样"看比赛"也是真的在改变名次——每届世界赛打完，榜单都会挪一挪。
 */
export function applyAiResult(
  winner: AiPlayer,
  loser: AiPlayer,
  bump = 20,
): { winner: AiPlayer; loser: AiPlayer } {
  return {
    winner: { ...winner, wins: winner.wins + 1, rating: Math.min(2800, winner.rating + bump) },
    loser: { ...loser, losses: loser.losses + 1, rating: Math.max(400, loser.rating - bump) },
  };
}
