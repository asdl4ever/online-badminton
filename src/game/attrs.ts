/**
 * 玩家属性点：速度 / 力量 / 容错（判定半径）/ 弹跳。
 *
 * 规则：每达到一个新组别（段位）得 1 点，**随当前积分实时增减**（掉段会丢点、
 * 升段自动拿回）。点数先折算成五维（见 players.playerStats），再由五维派生出
 * 物理参数倍率（见 players.attrsFromStats），写进世界（`World.attrs`）并随联机
 * `hello` 同步——两边用同一套属性，权威模拟与客户端预测才不会分叉。
 */
import { GROUPS, groupForPoints } from './ranks';

export type AttrKey = 'speed' | 'power' | 'reach' | 'jump';

/** 玩家自己分配的点数（意图；实际生效可能被当前额度裁剪） */
export interface AttrAlloc {
  speed: number;
  power: number;
  reach: number;
  jump: number;
}

/** 每点的加成幅度 */
export const ATTR_PER_POINT = 0.06;

/** 物理参数倍率（1 = 无加成） */
export interface PlayerAttrs {
  speed: number;
  power: number;
  reach: number;
  jump: number;
  /** 出球容错（技术）：抬高击球力度的下限 */
  skill: number;
}

export const NEUTRAL_ATTRS: PlayerAttrs = { speed: 1, power: 1, reach: 1, jump: 1, skill: 1 };

export const ATTR_KEYS: AttrKey[] = ['speed', 'power', 'reach', 'jump'];

export const ATTR_META: Record<AttrKey, { label: string; desc: string; color: string }> = {
  speed: { label: '速度', desc: '移动更快', color: '#39d0a0' },
  power: { label: '力量', desc: '击球更重', color: '#ff5a4d' },
  reach: { label: '容错', desc: '判定半径更大，更好碰到球', color: '#3d8bfd' },
  jump: { label: '弹跳', desc: '跳得更高', color: '#ffd45c' },
};

export function emptyAlloc(): AttrAlloc {
  return { speed: 0, power: 0, reach: 0, jump: 0 };
}

/**
 * 当前积分能拿到的总点数：初始（新芽组）1 点，之后每晋升一个组别再 +1，
 * 所以 8 个组别满级是 8 点（单项全堆满 = +48%）。
 */
export function totalAttrPoints(points: number): number {
  return GROUPS.findIndex((g) => g.id === groupForPoints(points).id) + 1;
}

/** 已分配的点数合计 */
export function spentPoints(alloc: AttrAlloc): number {
  return ATTR_KEYS.reduce((sum, k) => sum + (alloc[k] || 0), 0);
}

/** 原始分配超出当前额度时，按 速度→力量→容错 的顺序裁剪出「实际生效」的部分 */
export function effectiveAlloc(alloc: AttrAlloc, budget: number): AttrAlloc {
  const out = emptyAlloc();
  let left = Math.max(0, budget);
  for (const k of ATTR_KEYS) {
    const take = Math.max(0, Math.min(alloc[k] ?? 0, left));
    out[k] = take;
    left -= take;
  }
  return out;
}

/** 归一化一份来自网络的属性（拒绝 NaN / 离谱值） */
export function sanitizeAttrs(input: unknown): PlayerAttrs {
  const pick = (v: unknown): number =>
    typeof v === 'number' && Number.isFinite(v) ? Math.min(2.2, Math.max(0.5, v)) : 1;
  const o = (input ?? {}) as Record<string, unknown>;
  return {
    speed: pick(o.speed),
    power: pick(o.power),
    reach: pick(o.reach),
    jump: pick(o.jump),
    skill: pick(o.skill),
  };
}
