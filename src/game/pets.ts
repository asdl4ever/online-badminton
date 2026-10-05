import type { PetId } from './cosmetics';

/**
 * 🐾 宠物的**加成策略**：每只宠物都有自己的取向——有的偏金币、有的偏经验、有的各来一点，
 * 稀有度越高总量越大（见 `PET_BONUS`）。星级只是在这份「各自的基础值」上做放大
 * （`PET_STAR_MUL`），所以同一只宠物越练越强，不同宠物之间又各有取舍。
 *
 * ⚠️ 只算**当前装备的那一只**（见 `customize.ts` 里那段 watch），不做「收藏越多越强」，
 * 否则后期数值会滚雪球。
 */
export interface PetBonus {
  /** 金币加成，百分比（只对「赚到的」金币生效，退款/重复折算不算） */
  coin: number;
  /** 对局 / 健身房 / 操场 / 发球机的五维经验加成，百分比 */
  xp: number;
}

/**
 * 星级放大系数（1★..5★）：**1★ 就是表里的原值**，之后每星再加原值的 25%~50%。
 * 例：`cat` 基础 6% → 1★ 6% / 3★ 9% / 5★ 13.2%。
 */
const PET_STAR_MUL = [1, 1.25, 1.5, 1.85, 2.2];

/**
 * 每只宠物的加成（数值是 **1★ 时的基准百分比**）。
 * 稀有度参考：rare 总量 5~6、epic 6~7、legendary 7~8，联名限定的小黄龙宝宝最强。
 */
export const PET_BONUS: Record<PetId, PetBonus> = {
  none: { coin: 0, xp: 0 },
  // --- rare ---
  orb: { coin: 2, xp: 5 }, // 光球：照着你练球，偏经验
  bird: { coin: 3, xp: 3 }, // 雏鸟：帮你捡球也帮你捡钱，均衡
  cat: { coin: 6, xp: 0 }, // 小猫：招财，纯金币
  fox: { coin: 4, xp: 2 }, // 狐狸：机灵，偏金币
  // --- epic ---
  fairy: { coin: 1, xp: 6 }, // 小精灵：点石成金不成，点悟性成，纯经验
  robot: { coin: 3, xp: 2 }, // 小机器人：算钱比算球快
  star: { coin: 2, xp: 4 }, // 星星：许愿型，偏经验
  // --- legendary ---
  skull: { coin: 5, xp: 1 }, // 骷髅：捡漏，偏金币
  flame: { coin: 5, xp: 2 }, // 火苗：越打越旺，偏金币
  ghost: { coin: 0, xp: 6 }, // 幽灵：陪你过夜，纯经验
  dragon: { coin: 4, xp: 4 }, // 幼龙：全能
  // --- 小黄龙联名（转盘限定）---
  nailong: { coin: 5, xp: 5 }, // 小黄龙宝宝：联名最强，两项都顶格
};

const round1 = (v: number): number => Math.round(v * 10) / 10;
/** 0.5 显示成 `0.5`、6.0 显示成 `6` */
const fmt = (v: number): string => `${round1(v)}`;

/**
 * 某只宠物在**某个星级**下的实际加成一（已经乘过星级放大）。
 * `star` 传 0（没孵化过）按 1★ 算；`pet` 是 `'none'` 就是全 0。
 */
export function petBonusOf(pet: PetId | 'none', star: number): PetBonus {
  const base = PET_BONUS[pet] ?? PET_BONUS.none;
  const s = Math.max(1, Math.min(PET_STAR_MUL.length, Math.round(star) || 1));
  const mul = PET_STAR_MUL[s - 1] ?? 1;
  return { coin: round1(base.coin * mul), xp: round1(base.xp * mul) };
}

/** 有没有加成（全 0 就没有，UI 据此不写那行） */
export function hasPetBonus(b: PetBonus): boolean {
  return b.coin > 0 || b.xp > 0;
}

/** 完整文案：「🪙 金币 +6% · 🎓 经验 +3%」 */
export function petBonusText(b: PetBonus): string {
  const parts: string[] = [];
  if (b.coin > 0) parts.push(`🪙 金币 +${fmt(b.coin)}%`);
  if (b.xp > 0) parts.push(`🎓 经验 +${fmt(b.xp)}%`);
  return parts.join(' · ');
}

/** 卡片上的短文案：「🪙+6% 🎓+3%」（太长就只留数字，靠图标区分） */
export function petBonusShort(b: PetBonus): string {
  const parts: string[] = [];
  if (b.coin > 0) parts.push(`🪙+${fmt(b.coin)}%`);
  if (b.xp > 0) parts.push(`🎓+${fmt(b.xp)}%`);
  return parts.join(' ');
}
