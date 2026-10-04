import { ARENA_TIERS, arenaByTier } from './arena';

/**
 * 晋级赛的「开赛时刻表」——**纯时间推导，不读也不写任何存储**。
 *
 * 同一档里的 6 场赛事不再随时可打，而是各有各的开赛时刻：第 i 个赛事的开赛时刻 =
 * `floor(now / cycle) * cycle + i * stagger`（对齐 Unix epoch）。所以
 * **任何人在任何机器上算出来都一样、刷新不变、不需要服务器**——和 `chest.ts`
 * 的 `chestPeriod()`（期号 = 小时数）、`world-arena.ts` 的届号是同一个范式。
 *
 * 档位越高越稀有（低档密集、高档要等）：
 *
 * | 层级 | 档位 | 一轮 | 同档相邻两场 | 报名窗口 |
 * |---|---|---|---|---|
 * | 新芽 | 100 / 200 / 300 / 400 赛 | 30 分钟 | 5 分钟 | 18 分钟 |
 * | 进阶 | 500 / 600 / 700 赛 | 90 分钟 | 15 分钟 | 40 分钟 |
 * | 精英 | 800 / 900 / 1000 赛 / 总决赛 | 180 分钟 | 30 分钟 | 70 分钟 |
 *
 * 「错开 + 窗口」的组合让低档几乎随时都有场在报名，而高档要等——但**永远不会出现
 * 所有场次同时关闭**：窗口（18 分钟）> 相邻两场的间隔（5 分钟）。
 */

export type EventPhase = 'upcoming' | 'open' | 'closed';

export interface TierSchedule {
  /** 一轮时长（同一档的所有赛事共享一个周期） */
  cycle: number;
  /** 同档相邻两场的间隔 */
  stagger: number;
  /** 报名窗口时长 */
  window: number;
  /** 该档一共有几个赛事（= 名字池长度，总决赛是 5） */
  slots: number;
}

export interface EventSlot {
  /** 本档内的赛事下标（0 起） */
  index: number;
  /** 本场开赛时刻（毫秒时间戳） */
  startAt: number;
  /** 本场报名截止（= 开赛 + 窗口） */
  closesAt: number;
  /** 下一场同一赛事的开赛时刻 */
  nextStartAt: number;
}

const MIN = 60_000;

/** 三档节奏：低档密集 / 中档常规 / 高档稀有 */
const LAYERS = {
  sprout: { cycle: 30 * MIN, window: 18 * MIN, upTo: 4 },
  mid: { cycle: 90 * MIN, window: 40 * MIN, upTo: 7 },
  elite: { cycle: 180 * MIN, window: 70 * MIN, upTo: Number.POSITIVE_INFINITY },
} as const;

/** 某一档属于哪一层（按 `ARENA_TIERS` 的下标，低档在前） */
function layerOf(tier: string): (typeof LAYERS)[keyof typeof LAYERS] {
  const i = ARENA_TIERS.findIndex((t) => t.tier === tier);
  const idx = i < 0 ? 0 : i;
  if (idx < LAYERS.sprout.upTo) return LAYERS.sprout;
  if (idx < LAYERS.mid.upTo) return LAYERS.mid;
  return LAYERS.elite;
}

/** 该档的开赛节奏（周期 / 间隔 / 窗口 / 场次数） */
export function scheduleTier(tier: string): TierSchedule {
  const layer = layerOf(tier);
  const slots = Math.max(1, arenaByTier(tier).names.length);
  return {
    cycle: layer.cycle,
    stagger: Math.round(layer.cycle / slots),
    window: layer.window,
    slots,
  };
}

/** 第 `index` 个赛事在 `now` 这一刻所处的场次 */
export function slotOf(tier: string, index: number, now: number = Date.now()): EventSlot {
  const s = scheduleTier(tier);
  const i = ((index % s.slots) + s.slots) % s.slots;
  const startAt = Math.floor(now / s.cycle) * s.cycle + i * s.stagger;
  return { index: i, startAt, closesAt: startAt + s.window, nextStartAt: startAt + s.cycle };
}

/** 本场现在是「未开赛 / 报名中 / 已结束」 */
export function phaseOf(slot: EventSlot, now: number = Date.now()): EventPhase {
  if (now < slot.startAt) return 'upcoming';
  if (now < slot.closesAt) return 'open';
  return 'closed';
}

/** 该档全部赛事的场次（档位卡上的「现在有没有场可打」用它算） */
export function tierSlots(tier: string, now: number = Date.now()): EventSlot[] {
  const s = scheduleTier(tier);
  return Array.from({ length: s.slots }, (_, i) => slotOf(tier, i, now));
}

/** 该档此刻是否至少有一场在报名窗口内 */
export function anyOpenNow(tier: string, now: number = Date.now()): boolean {
  return tierSlots(tier, now).some((s) => phaseOf(s, now) === 'open');
}

/** 该档距「下一场开赛」还有多少毫秒（所有场次都已结束 / 未开赛时用） */
export function nextStartIn(tier: string, now: number = Date.now()): number {
  const starts = tierSlots(tier, now)
    .map((s) => s.startAt)
    .filter((t) => t > now)
    .sort((a, b) => a - b);
  const next = starts[0] ?? slotOf(tier, 0, now).nextStartAt;
  return Math.max(0, next - now);
}

const pad = (n: number): string => String(n).padStart(2, '0');

/** 倒计时 → `mm:ss`（超过一小时变成 `h:mm:ss`） */
export function fmtClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** 倒计时 → 口语（「20 分 30 秒」/「2 小时 15 分」），时刻行用 */
export function fmtDelay(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  if (total >= 3600) {
    const h = Math.floor(total / 3600);
    const m = Math.round((total % 3600) / 60);
    return `${h} 小时${m ? ` ${m} 分` : ''}`;
  }
  if (total >= 60) {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m} 分${s ? ` ${s} 秒` : ''}`;
  }
  return `${total} 秒`;
}
