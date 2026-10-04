import type { AiStyle, Difficulty } from './ai';
import type { Cosmetic } from './cosmetics';
import { statPower, type PlayerStats } from './players';

/**
 * 晋级赛（十一档赛事 100~1000 + 总决赛，16 人单败淘汰 vs AI）的经济、赛程与积分配置。
 *
 * 设计原则（数值来自配平表）：
 * - **赛事等级 = 报名费**（100 / 200 / … / 1000，总决赛 🪙2000），与积分门槛逐档对应
 * - 冠军金币 = 报名费 × 5；亚军 60% / 4强 40% / 8强 20% / 16强退一半报名费
 * - 全胜夺冠（4-0）额外 +10% 金币
 * - 积分按名次结算：冠军拿满、亚军 60%、4强 40%、8强 20%、16强 5%
 * - 杯赛按积分逐档解锁：达到该档门槛积分才能报名，低档随时可打
 * - 每届打完后该档赛事冷却 5 分钟（见 ARENA_COOLDOWN_MS）
 */

export interface ArenaTier {
  /** 档位 id（晋级赛 / 世界赛共用；存档与冷却按它记，旧档位 id 在 `arenaByTier` 迁移） */
  tier: string;
  /** 级别名（「100赛」「200赛」…「总决赛」）——普通赛事的级别就是报名费 */
  label: string;
  /** 档位图标 */
  glyph: string;
  /** 档位色（0xRRGGBB） */
  color: number;
  /** 赛事主名（名字池第一个），如「小白赛」 */
  cup: string;
  /** 这一档的赛事名池：每届随机取一个（如 100 赛有 小白赛 / 萌芽杯 / 新星杯…） */
  names: string[];
  /** 报名需要的积分门槛 */
  req: number;
  /** 报名费（金币）＝ 级别（总决赛例外） */
  fee: number;
  /** 夺冠获得的积分（其余名次按比例折算） */
  points: number;
  /** 冠军金币（其余名次按比例折算） */
  championGold: number;
}

/**
 * **十一档赛事：100 / 200 / … / 900 / 1000 赛 + 总决赛**（普通赛事的报名费 = 级别），
 * 晋级赛馆和世界赛用同一套（同步）。每档有自己的赛事名池，每届换着叫；
 * 门槛逐档抬升，冠军金币 = 报名费 × 5（总决赛 ×5 = 🪙10000）。
 */
export const ARENA_TIERS: ArenaTier[] = [
  {
    tier: 'l100', label: '100赛', glyph: '🌱', cup: '小白赛', fee: 100, req: 0,
    color: 0xb0724a,
    names: ['小白赛', '萌芽杯', '新星杯', '社区赛', '校园赛', '新手公开赛'],
    points: 25, championGold: 500,
  },
  {
    tier: 'l200', label: '200赛', glyph: '🎋', cup: '青苗赛', fee: 200, req: 30,
    color: 0x8fae62,
    names: ['青苗赛', '进阶杯', '城市公开赛', '青年赛', '挑战杯', '业余大师赛'],
    points: 50, championGold: 1000,
  },
  {
    tier: 'l300', label: '300赛', glyph: '🌅', cup: '市级赛', fee: 300, req: 80,
    color: 0xd8a534,
    names: ['市级赛', '精英杯', '公开赛', '区域赛', '俱乐部杯', '城市大师赛'],
    points: 75, championGold: 1500,
  },
  {
    tier: 'l400', label: '400赛', glyph: '💨', cup: '大区赛', fee: 400, req: 140,
    color: 0x7fd4c4,
    names: ['大区赛', '职业入门赛', '全国业余赛', '公开赛', '积分赛', '选拔杯'],
    points: 100, championGold: 2000,
  },
  {
    tier: 'l500', label: '500赛', glyph: '🪨', cup: '省级赛', fee: 500, req: 210,
    color: 0x6fe3ff,
    names: ['省级赛', '全国挑战赛', '大师赛', '公开赛', '职业资格赛', '全国杯'],
    points: 125, championGold: 2500,
  },
  {
    tier: 'l600', label: '600赛', glyph: '🔥', cup: '高级公开赛', fee: 600, req: 290,
    color: 0x5aa8ff,
    names: ['高级公开赛', '职业挑战赛', '精英赛', '巡回赛', '邀请赛', '积分大师赛'],
    points: 150, championGold: 3000,
  },
  {
    tier: 'l700', label: '700赛', glyph: '⚡', cup: '全国赛', fee: 700, req: 380,
    color: 0x7c5cff,
    names: ['全国赛', '国际邀请赛', '超级挑战赛', '洲际杯', '职业公开赛', '大师邀请赛'],
    points: 175, championGold: 3500,
  },
  {
    tier: 'l800', label: '800赛', glyph: '🌊', cup: '国际大师赛', fee: 800, req: 480,
    color: 0xb44dff,
    names: ['国际大师赛', '超级公开赛', '洲际挑战赛', '职业巡回赛', '世界杯预选赛', '精英公开赛'],
    points: 200, championGold: 4000,
  },
  {
    tier: 'l900', label: '900赛', glyph: '🌟', cup: '世界挑战赛', fee: 900, req: 600,
    color: 0xff5a8c,
    names: ['世界挑战赛', '国际超级赛', '全球公开赛', '职业大师赛', '世界巡回赛', '冠军邀请赛'],
    points: 225, championGold: 4500,
  },
  {
    tier: 'l1000', label: '1000赛', glyph: '👑', cup: '世界公开赛', fee: 1000, req: 750,
    color: 0xff4d4d,
    names: ['世界公开赛', '国际大师赛', '超级公开赛', '全球挑战赛', '世界杯', '职业巡回赛'],
    points: 250, championGold: 5000,
  },
  {
    tier: 'final', label: '总决赛', glyph: '🏆', cup: '年度总决赛', fee: 2000, req: 920,
    color: 0xffd23e,
    names: ['年度总决赛', '冠军杯', '巅峰赛', '赛季决赛', '世界精英赛'],
    points: 500, championGold: 10000,
  },
];

/** 旧档位 id → 新档位（老存档进行中的一届 / 冷却键还能找到家） */
const LEGACY_TIER: Record<string, string> = {
  bronze: 'l100',
  silver: 'l200',
  gold: 'l300',
  platinum: 'l400',
  diamond: 'l500',
  master: 'l600',
  god: 'l800',
  king: 'l1000',
};

export function arenaByTier(id: string): ArenaTier {
  const key = LEGACY_TIER[id] ?? id;
  return ARENA_TIERS.find((a) => a.tier === key) ?? ARENA_TIERS[0];
}

// ---- 赛制 -------------------------------------------------------------------

/** 参赛人数（16 人单败 = 4 轮） */
export const ARENA_SIZE = 16;
/** 轮次名（下标 = 轮次 0..3） */
export const ARENA_ROUNDS = ['16 强赛', '8 强赛', '4 强赛', '决赛'] as const;
/** 一轮赢下整届需要的胜场数 */
export const ARENA_WINS_NEEDED = ARENA_ROUNDS.length;
/** 一届打完后该杯赛的冷却时间 */
export const ARENA_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * 前几档赛事用「临时弱对手」。
 *
 * 名人堂里最弱的球员 rating 也在 900 上下、还可能穿着传说装饰，对 0 积分的新号
 * 依然太强，所以 100~400 赛这四档直接在报名时**现场生成一批路人**：
 * 四维逐档递进（28→34→40→46），并且只穿普通 / 稀有的低星装备。
 */
export const ROOKIE_TIERS = 4;

/** 各名次的金币比例：冠军 / 亚军 / 4强 / 8强（16强只有半价退款） */
export const PLACE_GOLD = [1, 0.6, 0.4, 0.2] as const;
/** 全胜夺冠满贯加成 */
export const WIN_STREAK_BONUS = 0.1;
/** 首轮出局退一半报名费 */
export const QF_REFUND = 0.5;
/** 各名次的积分比例：冠军 / 亚军 / 4强 / 8强 / 16强 */
export const PLACE_POINTS = [1, 0.6, 0.4, 0.2, 0.05] as const;

export type ArenaPlace = 'champion' | 'runner' | 'third' | 'fourth' | 'qf';

export const PLACE_LABEL: Record<ArenaPlace, string> = {
  champion: '冠军 🏆',
  runner: '亚军 🥈',
  // 赛制里没有三四名决赛：半决赛输的两位并列季军
  third: '季军 🥉',
  fourth: '8 强',
  qf: '16 强',
};

export function goldForPlace(a: ArenaTier, place: ArenaPlace, wins: number): number {
  if (place === 'qf') return Math.round(a.fee * QF_REFUND);
  const share =
    place === 'champion'
      ? PLACE_GOLD[0]
      : place === 'runner'
        ? PLACE_GOLD[1]
        : place === 'third'
          ? PLACE_GOLD[2]
          : PLACE_GOLD[3];
  const bonus = place === 'champion' && wins >= ARENA_WINS_NEEDED ? WIN_STREAK_BONUS : 0;
  return Math.round(a.championGold * share * (1 + bonus));
}

export function pointsForPlace(a: ArenaTier, place: ArenaPlace): number {
  const idx = place === 'champion' ? 0 : place === 'runner' ? 1 : place === 'third' ? 2 : place === 'fourth' ? 3 : 4;
  return Math.round(a.points * PLACE_POINTS[idx]);
}

// ---- 荣誉点 -----------------------------------------------------------------

/** 各名次的荣誉点基数：只有冠亚季军有（8 强 / 16 强为 0） */
export const PLACE_HONOR: Record<ArenaPlace, number> = {
  champion: 40,
  runner: 25,
  third: 15,
  fourth: 0,
  qf: 0,
};

/** 荣誉点的档位倍率：最低档 ×1，最高档 ×3（所以打高级赛事才划算） */
export function honorTierScale(tier: string): number {
  const idx = Math.max(0, ARENA_TIERS.findIndex((t) => t.tier === tier));
  const max = Math.max(1, ARENA_TIERS.length - 1);
  return 1 + (idx * 2) / max;
}

/** 这个赛事里拿到这个名次，能得多少荣誉点 */
export function honorForPlace(tier: string, place: ArenaPlace): number {
  const base = PLACE_HONOR[place];
  return base ? Math.round(base * honorTierScale(tier)) : 0;
}

// ---- 赛事名池 ---------------------------------------------------------------

/** 报名时从该档的名字池里随机取一个（池在 `ARENA_TIERS[i].names`，高级别的名字更响亮） */
export function pickCupName(tier: string, rng: () => number = Math.random): string {
  const a = arenaByTier(tier);
  return a.names[Math.floor(rng() * a.names.length)] ?? a.cup;
}

/** 履历/战报里的一届赛事全名：如「2026-100 小白赛(100赛)」；总决赛没有级别后缀 */
export function cupTitle(year: number, fee: number, cupName: string): string {
  if (fee >= 2000) return `${year}-${fee} ${cupName}`;
  return `${year}-${fee} ${cupName}(${fee}赛)`;
}

// ---- 对阵树 -----------------------------------------------------------------

/** 一位参赛者（玩家或 AI） */
export interface ArenaEntrant {
  id: string;
  name: string;
  isMe: boolean;
  /** 用于模拟 AI 之间胜负的强弱值（玩家无所谓） */
  rating: number;
  /** 对局时对手的战术风格 / 难度 / 外观 */
  style: AiStyle;
  difficulty: Difficulty;
  cosmetic?: Cosmetic;
  /** 四维（点名字看主页时用） */
  stats: PlayerStats;
}

/** 一场比赛；winner 为 null 表示还没打 */
export interface ArenaMatch {
  a: string;
  b: string;
  winner: string | null;
}

/** 整届的对阵树：rounds[轮次][场次] */
export type ArenaBracket = ArenaMatch[][];

/**
 * 由 16 位参赛者生成第 0 轮对阵（相邻配对），其余轮次留空占位。
 * 玩家在 entrants 里的位置决定他落在第几场。
 */
export function buildBracket(entrants: ArenaEntrant[]): ArenaBracket {
  const first: ArenaMatch[] = [];
  for (let i = 0; i + 1 < entrants.length; i += 2) {
    first.push({ a: entrants[i].id, b: entrants[i + 1].id, winner: null });
  }
  const rounds: ArenaBracket = [first];
  for (let r = 1; r < ARENA_ROUNDS.length; r++) {
    const count = first.length >> r;
    rounds.push(Array.from({ length: count }, () => ({ a: '', b: '', winner: null })));
  }
  return rounds;
}

/** 某轮结束后，把胜者填进下一轮的对阵骨架 */
export function fillNextRound(rounds: ArenaBracket, r: number): void {
  const cur = rounds[r];
  const nxt = rounds[r + 1];
  if (!cur || !nxt) return;
  for (let i = 0; i < cur.length; i += 2) {
    const m = nxt[i / 2];
    if (!m) continue;
    m.a = cur[i]?.winner ?? '';
    m.b = cur[i + 1]?.winner ?? '';
  }
}

/** 玩家在第 r 轮所在的场次下标（-1 = 已不在树上） */
export function myMatchIndex(rounds: ArenaBracket, r: number, meId: string): number {
  const list = rounds[r];
  if (!list) return -1;
  return list.findIndex((m) => m.a === meId || m.b === meId);
}

/**
 * 模拟一场 AI 对 AI，返回胜者 id。
 * 强弱看**五维综合分**（不是 rating 战绩）——这样晋级树里谁能赢，和球员主页上
 * 显示的「能力」是一致的；顺带让"越往后轮次越难"自然成立。
 */
export function simulateArenaMatch(
  a: ArenaEntrant,
  b: ArenaEntrant,
  rng: () => number = Math.random,
): string {
  const diff = statPower(b.stats) - statPower(a.stats);
  const pa = 1 / (1 + Math.pow(10, diff / 12));
  return rng() < pa ? a.id : b.id;
}

/** 赛季结算的金币奖励（按赛季内达到过的最高组别，随下标） */
export const SEASON_REWARDS = [100, 200, 400, 700, 1000, 1500, 2500, 4000];
