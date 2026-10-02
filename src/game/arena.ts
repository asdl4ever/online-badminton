import { TIERS, type TierId } from './ranks';

/**
 * 晋级赛（8 人单败淘汰 vs AI）的经济与积分配置。
 *
 * 设计原则（数值来自配平表）：
 * - 报名费 ≈ 冠军积分 × 0.5
 * - 冠军金币 = 冠军积分 × 10；亚军 60% / 季军 40% / 4强 10%
 * - 冠军 3 连胜（单败赛制下夺冠必然 3-0）额外 +10% 金币
 * - 首轮出局（8强）退 50% 报名费
 * - 积分按名次结算：冠军拿满、亚军 60%、季军 40%、4强 10%、8强 0
 */

export interface ArenaTier {
  tier: TierId;
  label: string;
  /** 报名费（金币） */
  fee: number;
  /** 夺冠获得的积分（亚军 60% / 季军 40% / 4强 10% / 8强 0） */
  points: number;
  /** 冠军金币（其余名次按比例折算） */
  championGold: number;
}

export const ARENA_TIERS: ArenaTier[] = TIERS.map((t, i) => {
  const points = [20, 40, 70, 110, 160, 240, 360, 500][i];
  return {
    tier: t.id,
    label: t.label,
    fee: Math.round(points * 0.5),
    points,
    championGold: points * 10,
  };
});

export function arenaByTier(id: TierId): ArenaTier {
  return ARENA_TIERS.find((a) => a.tier === id) ?? ARENA_TIERS[0];
}

/** 各名次的金币比例：冠军 / 亚军 / 季军 / 4强（8强只有半价退款） */
export const PLACE_GOLD = [1, 0.6, 0.4, 0.1] as const;
/** 冠军 3 连胜满贯加成 */
export const WIN_STREAK_BONUS = 0.1;
/** 首轮出局退一半报名费 */
export const QF_REFUND = 0.5;
/** 各名次的积分比例：冠军 / 亚军 / 季军 / 4强 / 8强 */
export const PLACE_POINTS = [1, 0.6, 0.4, 0.1, 0] as const;

export type ArenaPlace = 'champion' | 'runner' | 'third' | 'fourth' | 'qf';

export const PLACE_LABEL: Record<ArenaPlace, string> = {
  champion: '冠军 🏆',
  runner: '亚军 🥈',
  third: '季军 🥉',
  fourth: '4 强',
  qf: '8 强',
};

export function goldForPlace(a: ArenaTier, place: ArenaPlace, wins: number): number {
  if (place === 'qf') return Math.round(a.fee * QF_REFUND);
  const share = place === 'champion' ? PLACE_GOLD[0] : place === 'runner' ? PLACE_GOLD[1] : place === 'third' ? PLACE_GOLD[2] : PLACE_GOLD[3];
  const bonus = place === 'champion' && wins >= 3 ? WIN_STREAK_BONUS : 0;
  return Math.round(a.championGold * share * (1 + bonus));
}

export function pointsForPlace(a: ArenaTier, place: ArenaPlace): number {
  const idx = place === 'champion' ? 0 : place === 'runner' ? 1 : place === 'third' ? 2 : place === 'fourth' ? 3 : 4;
  return Math.round(a.points * PLACE_POINTS[idx]);
}

/** 赛程轮次：0 = 8强赛（ quarterfinal ），1 = 4强赛，2 = 决赛或季军赛 */
export const ARENA_ROUNDS = ['8 强赛', '4 强赛', '决赛'] as const;

/** 对手 AI 名字（杯赛氛围用，每届随机取 7 个） */
export const ARENA_BOTS = [
  '疾风侠', '扣杀王', '老张', '小球童', '夜羽', '铁拍子', '云中鹤',
  '大力妹', '零式', '翻盘手', '闪电手', '不动明王',
];

/** 各轮 AI 难度随段位与轮次爬升（0 easy / 1 normal / 2 hard） */
export function arenaDifficulty(tierIdx: number, round: number): 0 | 1 | 2 {
  const base = Math.floor(tierIdx / 2) + round;
  return Math.max(0, Math.min(2, base - 1)) as 0 | 1 | 2;
}

/** 赛季结算的金币奖励（按赛季内达到过的最高段位，随段位下标） */
export const SEASON_REWARDS = [100, 200, 400, 700, 1000, 1500, 2500, 4000];
