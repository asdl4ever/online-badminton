import type { PlusEffectId } from '../cosmetics';

/**
 * 100 个生成式击球特效的**纯数据**部分：调色板、动作原型、参数表与显示名。
 *
 * 为什么单独一个文件：`items.ts` 要靠 `PLUS_META` 生成这 100 件「+」特效的登记项，
 * 而 `plus.ts` 顶部是**运行时** `import Phaser from 'phaser'`。只要数据层直接引
 * `plus.ts`，整个 Phaser（约 1.9MB）就会被拖进入口 chunk —— 连首屏都得先下完它。
 * 绘制部分留在 `plus.ts`，那边不会再被数据层引用。
 */

export const PLUS_META: { id: PlusEffectId; label: string }[] = [];

/**
 * 100 generated hit effects: 14 motion archetypes × 12 palettes × assorted
 * particle shapes / densities. Each spec produces a bespoke painter so every
 * id looks distinct while sharing the same tiny drawing kernels.
 */

// ---- palettes ---------------------------------------------------------------
export interface Palette {
  cn: string;
  c1: number;
  c2: number;
}
export const PALETTES: Palette[] = [
  { cn: '赤焰', c1: 0xe83a5a, c2: 0xffb02a },
  { cn: '琥珀', c1: 0xff9a3c, c2: 0xffe9b0 },
  { cn: '鎏金', c1: 0xffd45c, c2: 0xfff6d0 },
  { cn: '翠玉', c1: 0x35d6a4, c2: 0xd2ffe9 },
  { cn: '碧波', c1: 0x39ffd0, c2: 0xeafffd },
  { cn: '苍蓝', c1: 0x3a6ae8, c2: 0xa9c8ff },
  { cn: '紫电', c1: 0x9b5cff, c2: 0xe2c4ff },
  { cn: '樱粉', c1: 0xff5ad4, c2: 0xffd3ef },
  { cn: '月白', c1: 0xf8f4ea, c2: 0xc8d4e8 },
  { cn: '荧绿', c1: 0x9cff3a, c2: 0xe8ffd0 },
  { cn: '霜蓝', c1: 0x9fd8ff, c2: 0xffffff },
  { cn: '虚空', c1: 0x2a2a34, c2: 0x7dffc4 },
];

// ---- archetypes -------------------------------------------------------------
export type Arch =
  | 'burst' // 放射绽放
  | 'rings' // 层层涟漪
  | 'spiral' // 螺旋卷
  | 'rain' // 坠落
  | 'orbit' // 环绕
  | 'cross' // 十字光束
  | 'shards' // 碎裂飞旋
  | 'petals' // 飘落
  | 'bolts' // 雷网
  | 'squares' // 方阵
  | 'rise' // 冲天
  | 'converge' // 汇聚
  | 'waves' // 波纹
  | 'spinStar'; // 星旋

export const ARCH_CN: Record<Arch, string> = {
  burst: '绽放',
  rings: '涟漪',
  spiral: '螺旋',
  rain: '坠星',
  orbit: '环绕',
  cross: '十字',
  shards: '碎裂',
  petals: '飘落',
  bolts: '雷网',
  squares: '方阵',
  rise: '冲天',
  converge: '汇聚',
  waves: '波纹',
  spinStar: '星旋',
};

export type Shape = 0 | 1 | 2 | 3 | 4 | 5 | 6; // circle square triangle diamond bar plus star

export interface Spec {
  arch: Arch;
  pal: number;
  count: number;
  twist: number;
  shape: Shape;
  span: number;
}

// 100 specs: archetype cycling through the palettes with varied parameters
export const RAW: Array<[Arch, number, number, number, Shape]> = [
  ['burst', 0, 10, 0.6, 0], ['burst', 1, 12, 1.1, 2], ['burst', 2, 8, 0.3, 6], ['burst', 3, 14, 0.9, 1],
  ['burst', 4, 11, 1.4, 5], ['burst', 5, 9, 0.5, 3], ['burst', 6, 13, 1.2, 2], ['burst', 7, 10, 0.7, 0],
  ['rings', 0, 3, 0, 6], ['rings', 2, 4, 0, 6], ['rings', 5, 3, 0, 6], ['rings', 7, 4, 0, 6],
  ['rings', 8, 3, 0, 6], ['rings', 10, 5, 0, 6], ['rings', 11, 4, 0, 6], ['rings', 3, 3, 0, 6],
  ['spiral', 1, 10, 2.2, 0], ['spiral', 3, 12, 3.4, 4], ['spiral', 4, 9, 1.8, 0], ['spiral', 6, 14, 2.8, 6],
  ['spiral', 8, 11, 2.0, 3], ['spiral', 9, 13, 3.0, 1], ['spiral', 11, 10, 2.5, 0], ['spiral', 0, 12, 2.4, 5],
  ['rain', 2, 12, 1.0, 0], ['rain', 4, 14, 1.6, 2], ['rain', 6, 10, 0.8, 4], ['rain', 8, 16, 1.2, 1],
  ['rain', 9, 12, 1.4, 3], ['rain', 11, 14, 1.0, 0], ['rain', 0, 10, 1.8, 5], ['rain', 5, 13, 1.1, 2],
  ['orbit', 0, 8, 3.0, 0], ['orbit', 2, 10, 4.2, 6], ['orbit', 4, 7, 2.4, 0], ['orbit', 6, 9, 3.6, 1],
  ['orbit', 7, 8, 2.8, 5], ['orbit', 9, 10, 3.2, 0], ['orbit', 11, 9, 4.0, 6], ['orbit', 3, 8, 3.4, 0],
  ['cross', 0, 4, 0, 4], ['cross', 1, 8, 0, 4], ['cross', 5, 4, 0, 4], ['cross', 6, 8, 0.4, 4],
  ['cross', 10, 4, 0, 4], ['cross', 11, 8, 0.8, 4], ['cross', 2, 8, 0, 4], ['cross', 8, 4, 0, 4],
  ['shards', 0, 8, 2.0, 2], ['shards', 2, 10, 3.0, 2], ['shards', 5, 9, 2.4, 2], ['shards', 8, 7, 1.8, 2],
  ['shards', 9, 11, 3.4, 2], ['shards', 10, 8, 2.6, 2], ['shards', 11, 9, 2.2, 2], ['shards', 3, 10, 2.8, 2],
  ['petals', 1, 10, 1.2, 2], ['petals', 3, 12, 1.6, 0], ['petals', 4, 8, 1.0, 6], ['petals', 7, 14, 1.8, 2],
  ['petals', 8, 10, 1.4, 3], ['petals', 9, 12, 1.5, 1], ['petals', 2, 9, 1.3, 0], ['petals', 5, 11, 1.7, 4],
  ['bolts', 0, 5, 1.4, 4], ['bolts', 4, 6, 1.8, 4], ['bolts', 6, 5, 2.2, 4], ['bolts', 9, 7, 1.2, 4],
  ['bolts', 11, 6, 2.0, 4], ['bolts', 10, 5, 1.6, 4], ['bolts', 5, 6, 1.5, 4], ['bolts', 2, 7, 1.9, 4],
  ['squares', 0, 3, 0.8, 1], ['squares', 2, 4, 1.2, 1], ['squares', 5, 3, 0.6, 1], ['squares', 6, 4, 1.6, 1],
  ['squares', 8, 3, 0.4, 1], ['squares', 11, 4, 1.0, 1], ['squares', 9, 3, 1.4, 1], ['squares', 3, 4, 0.9, 1],
  ['rise', 1, 12, 1.0, 0], ['rise', 4, 14, 1.5, 6], ['rise', 6, 10, 1.2, 5], ['rise', 8, 13, 0.8, 3],
  ['rise', 9, 11, 1.4, 0], ['rise', 0, 12, 1.1, 1], ['rise', 10, 10, 0.9, 0], ['rise', 2, 14, 1.3, 2],
  ['converge', 0, 10, 2.0, 0], ['converge', 2, 12, 2.6, 6], ['converge', 5, 9, 1.8, 1], ['converge', 7, 11, 2.2, 0],
  ['converge', 10, 10, 2.4, 5], ['converge', 11, 8, 1.6, 0], ['converge', 1, 12, 2.1, 4], ['converge', 4, 9, 1.9, 0],
  ['waves', 3, 4, 1.0, 4], ['waves', 4, 5, 1.4, 4], ['waves', 6, 4, 0.8, 4], ['waves', 8, 5, 1.2, 4],
  ['spinStar', 0, 5, 3.0, 6], ['spinStar', 2, 6, 4.0, 6], ['spinStar', 5, 5, 2.6, 6], ['spinStar', 7, 6, 3.4, 6],
];

export const BASE_SPAN: Record<Arch, number> = {
  burst: 0.44, rings: 0.5, spiral: 0.55, rain: 0.6, orbit: 0.55, cross: 0.34,
  shards: 0.48, petals: 0.62, bolts: 0.36, squares: 0.46, rise: 0.6,
  converge: 0.5, waves: 0.54, spinStar: 0.56,
};

export const SPECS: Spec[] = RAW.map(([arch, pal, count, twist, shape], i) => ({
  arch,
  pal,
  count,
  twist,
  shape,
  span: BASE_SPAN[arch] * (0.9 + ((i % 5) * 0.05)),
}));


// ---- 显示名：同名的按 贰/叁/肆… 顺序编号 ------------------------------------
const SUFFIX = ['', '·贰', '·叁', '·肆', '·伍', '·陆'];
const usedLabels = new Map<string, number>();

SPECS.forEach((spec, i) => {
  const id = `p${i + 1}` as PlusEffectId;
  const base = `${PALETTES[spec.pal].cn}${ARCH_CN[spec.arch]}`;
  const n = usedLabels.get(base) ?? 0;
  usedLabels.set(base, n + 1);
  PLUS_META.push({ id, label: n < SUFFIX.length ? `${base}${SUFFIX[n]}` : `${base}·${n + 1}` });
});
