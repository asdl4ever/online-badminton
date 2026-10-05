import type Phaser from 'phaser';

/**
 * 主题地环的共享笔刷。
 * 约定：原点 = (x, feetY)，地面基准线画在 feetY − 3，椭圆半径约 24×7；
 * painter 画「脚下那圈」的独立构图——纹理、散点、小场景都行（见物品绘制.md：不限制范式）。
 */

export type G = Phaser.GameObjects.Graphics;
export const TAU = Math.PI * 2;

/** 地面基准椭圆的半长轴 / 半短轴 */
export const R_RX = 24;
export const R_RY = 7;

/** 地面基准椭圆中心 y（相对 feetY 的偏移） */
export const R_DY = -3;

/** 折线描边 */
export function rline(g: G, pts: Array<[number, number]>, w: number, c: number, a = 1): void {
  g.lineStyle(w, c, a);
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.strokePath();
}

/** 多边形填充 */
export function rpoly(g: G, pts: Array<[number, number]>, c: number, a = 1): void {
  g.fillStyle(c, a);
  g.fillPoints(pts.map(([x, y]) => ({ x, y })), true);
}

export interface RingArt {
  /** 主色（不填用 RING_COLORS 的物品色） */
  c?: number;
  a: number;
  draw: (g: G, now: number, x: number, feetY: number, c: number, a: number) => void;
}
