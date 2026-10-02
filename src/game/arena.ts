import { TIERS, type GroupId } from './ranks';
import type { AiStyle, Difficulty } from './ai';
import type { Cosmetic } from './cosmetics';
import { statPower, type PlayerStats } from './players';

/**
 * 晋级赛（8 个杯赛，16 人单败淘汰 vs AI）的经济、赛程与积分配置。
 *
 * 设计原则（数值来自配平表）：
 * - 报名费 ≈ 冠军积分 × 0.5
 * - 冠军金币 = 冠军积分 × 10；亚军 60% / 4强 40% / 8强 20% / 16强退一半报名费
 * - 全胜夺冠（4-0）额外 +10% 金币
 * - 积分按名次结算：冠军拿满、亚军 60%、4强 40%、8强 20%、16强 5%
 * - 杯赛按积分逐档解锁：达到该杯门槛积分才能报名，低杯赛随时可打
 * - 每届打完后该杯赛冷却 5 分钟（见 ARENA_COOLDOWN_MS）
 */

export interface ArenaTier {
  /** 组别 id（杯赛归组） */
  tier: GroupId;
  /** 杯赛名，如「新芽杯」 */
  cup: string;
  label: string;
  /** 报名需要的积分门槛 */
  req: number;
  /** 报名费（金币） */
  fee: number;
  /** 夺冠获得的积分（其余名次按比例折算） */
  points: number;
  /** 冠军金币（其余名次按比例折算） */
  championGold: number;
}

export const ARENA_TIERS: ArenaTier[] = TIERS.map((g, i) => {
  const points = [20, 40, 70, 110, 160, 240, 360, 500][i];
  return {
    tier: g.id,
    cup: g.cup,
    label: g.label,
    req: g.points,
    fee: Math.round(points * 0.5),
    points,
    championGold: points * 10,
  };
});

export function arenaByTier(id: GroupId): ArenaTier {
  return ARENA_TIERS.find((a) => a.tier === id) ?? ARENA_TIERS[0];
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
  third: '4 强',
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

// ---- 赛事名池 ---------------------------------------------------------------

/** 每个组别一套赛事名变体，报名时随机取一个（高段位的名字更响亮） */
export const CUP_NAME_POOLS: Record<GroupId, string[]> = {
  bronze: ['新芽杯', '新芽春苗杯', '新芽初鸣杯'],
  silver: ['青竹杯', '青竹清风杯', '青竹节节杯'],
  gold: ['曙光杯', '曙光破晓杯', '曙光初照杯'],
  platinum: ['疾风杯', '疾风逐影杯', '疾风迅雷杯'],
  diamond: ['磐石杯', '磐石不移杯', '磐石镇岳杯'],
  master: ['烈焰杯', '烈焰焚天杯', '烈焰燎原杯'],
  king: ['苍穹杯', '苍穹极境杯', '苍穹霸主杯'],
  god: ['传奇杯', '传奇封神杯', '传奇无双杯'],
};

export function pickCupName(tier: GroupId, rng: () => number = Math.random): string {
  const pool = CUP_NAME_POOLS[tier] ?? [arenaByTier(tier).cup];
  return pool[Math.floor(rng() * pool.length)] ?? pool[0];
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
