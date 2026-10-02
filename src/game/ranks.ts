/**
 * 积分组别与杯赛分级（「段位系统」已移除，只剩积分）：
 * 积分是唯一进度；8 个组别只是杯赛的分级和积分区间的称谓——
 * 每个组别对应一场杯赛（新芽杯…传奇杯），达到门槛积分即可报名。
 *
 * There is no server validation and no cross-device sync — points live in
 * localStorage, so this is a "for fun" ladder, not a competitive one.
 */

export type GroupId =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'king'
  | 'god';

/** 兼容旧存档与调用方的别名 */
export type TierId = GroupId;

export interface Group {
  id: GroupId;
  /** 组别名（积分区间的称谓） */
  label: string;
  /** 对应的杯赛名 */
  cup: string;
  /** 杯赛报名需要的积分门槛 */
  points: number;
  color: number;
  /** roman numeral shown on the badge */
  glyph: string;
  /** 达到门槛积分后可领取的荣誉奖励（在个人主页领） */
  reward: string;
}

export const GROUPS: Group[] = [
  { id: 'bronze', label: '新芽组', cup: '新芽杯', points: 0, color: 0xb0724a, glyph: 'I', reward: '初始外观' },
  {
    id: 'silver',
    label: '青竹组',
    cup: '青竹杯',
    points: 80,
    color: 0xa9b4c2,
    glyph: 'II',
    reward: '头饰「鸭舌帽」',
  },
  {
    id: 'gold',
    label: '曙光组',
    cup: '曙光杯',
    points: 160,
    color: 0xd8a534,
    glyph: 'III',
    reward: '球拍皮肤「鎏金」',
  },
  {
    id: 'platinum',
    label: '疾风组',
    cup: '疾风杯',
    points: 280,
    color: 0x7fd4c4,
    glyph: 'IV',
    reward: '头饰「水母冠」',
  },
  {
    id: 'diamond',
    label: '磐石组',
    cup: '磐石杯',
    points: 440,
    color: 0x6fe3ff,
    glyph: 'V',
    reward: '球拍皮肤「蓝宝石」',
  },
  {
    id: 'master',
    label: '烈焰组',
    cup: '烈焰杯',
    points: 640,
    color: 0x7c5cff,
    glyph: 'VI',
    reward: '球拍皮肤「烈焰」',
  },
  {
    id: 'king',
    label: '苍穹组',
    cup: '苍穹杯',
    points: 960,
    color: 0xffb020,
    glyph: 'VII',
    reward: '光环「王者」+ 披风「王袍」',
  },
  {
    id: 'god',
    label: '传奇组',
    cup: '传奇杯',
    points: 1440,
    color: 0xff5a5a,
    glyph: 'VIII',
    reward: '翅膀「圣光」+ 头饰「天使光环」',
  },
];

/** 兼容旧名：段位表 → 组别表 */
export const TIERS = GROUPS;
export type Tier = Group;

/** how many points a finished match is worth */
export const POINT_RULES = {
  online: { win: 30, lose: 8 },
  single: { win: 10, lose: 2 },
} as const;

export type PlayMode = keyof typeof POINT_RULES;

export function groupForPoints(points: number): Group {
  let current = GROUPS[0];
  for (const t of GROUPS) if (points >= t.points) current = t;
  return current;
}

/** 兼容旧名 */
export const tierForPoints = groupForPoints;

export function nextGroup(points: number): Group | null {
  for (const t of GROUPS) if (points < t.points) return t;
  return null;
}

/** 兼容旧名 */
export const nextTier = nextGroup;

/** 0..1 progress from the current group toward the next (1 at the top) */
export function groupProgress(points: number): number {
  const cur = groupForPoints(points);
  const next = nextGroup(points);
  if (!next) return 1;
  const span = next.points - cur.points;
  return span <= 0 ? 1 : (points - cur.points) / span;
}

/** 兼容旧名 */
export const tierProgress = groupProgress;

export function groupById(id: GroupId): Group {
  return GROUPS.find((t) => t.id === id) ?? GROUPS[0];
}

/** 兼容旧名 */
export const tierById = groupById;

export function isGroupId(v: unknown): v is GroupId {
  return typeof v === 'string' && GROUPS.some((t) => t.id === v);
}

/** 兼容旧名 */
export const isTierId = isGroupId;

/** 积分称号：与组别无关的纯积分阶梯（小白一路到超神） */
export const TITLES: { points: number; label: string }[] = [
  { points: 0, label: '小白' },
  { points: 30, label: '萌新' },
  { points: 80, label: '新秀' },
  { points: 150, label: '好手' },
  { points: 250, label: '强手' },
  { points: 400, label: '高手' },
  { points: 600, label: '名人' },
  { points: 850, label: '名家' },
  { points: 1100, label: '大师' },
  { points: 1500, label: '球王' },
  { points: 2000, label: '超神' },
];

export function titleForPoints(points: number): string {
  let title = TITLES[0].label;
  for (const t of TITLES) if (points >= t.points) title = t.label;
  return title;
}
