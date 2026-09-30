/**
 * Local, anonymous rank progression. Everything here is a pure function of a
 * points total, so it can be shared by the store, the UI and the game canvas.
 *
 * There is no server validation and no cross-device sync — points live in
 * localStorage, so this is a "for fun" ladder, not a competitive one.
 */

export type TierId = 'bronze' | 'silver' | 'gold' | 'master' | 'king' | 'god';

export interface Tier {
  id: TierId;
  label: string;
  /** cumulative points required to reach this tier */
  points: number;
  color: number;
  /** roman numeral shown on the badge */
  glyph: string;
  /** what claiming this tier unlocks (shown in the reward list) */
  reward: string;
}

export const TIERS: Tier[] = [
  { id: 'bronze', label: '青铜', points: 0, color: 0xb0724a, glyph: 'I', reward: '初始外观' },
  {
    id: 'silver',
    label: '白银',
    points: 80,
    color: 0xa9b4c2,
    glyph: 'II',
    reward: '头饰「鸭舌帽」',
  },
  {
    id: 'gold',
    label: '黄金',
    points: 240,
    color: 0xd8a534,
    glyph: 'III',
    reward: '球拍皮肤「鎏金」',
  },
  {
    id: 'master',
    label: '大师',
    points: 560,
    color: 0x7c5cff,
    glyph: 'IV',
    reward: '球拍皮肤「烈焰」',
  },
  {
    id: 'king',
    label: '王者',
    points: 1100,
    color: 0xffb020,
    glyph: 'V',
    reward: '光环「王者」+ 披风「王袍」',
  },
  {
    id: 'god',
    label: '超神',
    points: 2000,
    color: 0xff5a5a,
    glyph: 'VI',
    reward: '翅膀「圣光」+ 头饰「天使光环」',
  },
];

/** how many points a finished match is worth */
export const POINT_RULES = {
  online: { win: 30, lose: 8 },
  single: { win: 10, lose: 2 },
} as const;

export type PlayMode = keyof typeof POINT_RULES;

export function tierForPoints(points: number): Tier {
  let current = TIERS[0];
  for (const t of TIERS) if (points >= t.points) current = t;
  return current;
}

export function nextTier(points: number): Tier | null {
  for (const t of TIERS) if (points < t.points) return t;
  return null;
}

/** 0..1 progress from the current tier toward the next (1 at the top tier) */
export function tierProgress(points: number): number {
  const cur = tierForPoints(points);
  const next = nextTier(points);
  if (!next) return 1;
  const span = next.points - cur.points;
  return span <= 0 ? 1 : (points - cur.points) / span;
}

export function tierById(id: TierId): Tier {
  return TIERS.find((t) => t.id === id) ?? TIERS[0];
}

export function isTierId(v: unknown): v is TierId {
  return typeof v === 'string' && TIERS.some((t) => t.id === v);
}
