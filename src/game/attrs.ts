/**
 * 对局里真正生效的**物理倍率**（由五维派生，见 players.attrsFromStats）。
 *
 * 这是玩家与 AI 共用的唯一加成来源：写进世界（`World.attrs`）并随联机 `hello`
 * 同步——两边用同一套属性，权威模拟与客户端预测才不会分叉。
 *
 * 注意：属性点（现在是「锻炼等级」，见 training.ts）本身不在这里，它先折算成
 * 五维（players.playerStats），再由五维派生出这份倍率。
 */

/** 物理参数倍率（1 = 无加成） */
export interface PlayerAttrs {
  /** 移动速度 */
  speed: number;
  /** 击球力度 */
  power: number;
  /** 击球判定半径（够得到球） */
  reach: number;
  /** 出球容错（技术）：抬高击球力度的下限 */
  skill: number;
  /** 体力：上限更高、跑动挥拍消耗更慢 */
  stamina: number;
}

export const NEUTRAL_ATTRS: PlayerAttrs = {
  speed: 1,
  power: 1,
  reach: 1,
  skill: 1,
  stamina: 1,
};

/** 归一化一份来自网络的属性（拒绝 NaN / 离谱值） */
export function sanitizeAttrs(input: unknown): PlayerAttrs {
  const pick = (v: unknown): number =>
    typeof v === 'number' && Number.isFinite(v) ? Math.min(2.2, Math.max(0.5, v)) : 1;
  const o = (input ?? {}) as Record<string, unknown>;
  return {
    speed: pick(o.speed),
    power: pick(o.power),
    reach: pick(o.reach),
    skill: pick(o.skill),
    stamina: pick(o.stamina),
  };
}
