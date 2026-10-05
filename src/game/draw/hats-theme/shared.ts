import type Phaser from 'phaser';

/**
 * 主题头饰的共享笔刷（逐顶独立画）。
 * 约定与 character.ts 的 drawHat 一致：(x, hy) = 帽沿线（hy = topY + 4），
 * 帽子往上长（y 负方向），横跨约 x±20、往上约 -34。
 */

export type G = Phaser.GameObjects.Graphics;
export const TAU = Math.PI * 2;

/** 折线描边 */
export function hline(g: G, pts: Array<[number, number]>, w: number, c: number, a = 1): void {
  g.lineStyle(w, c, a);
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.strokePath();
}

/** 多边形填充 */
export function hpoly(g: G, pts: Array<[number, number]>, c: number, a = 1): void {
  g.fillStyle(c, a);
  g.fillPoints(pts.map(([px, py]) => ({ x: px, y: py })), true);
}

export interface HatArt {
  /** 主色（不填用 HAT_COLORS 的物品色） */
  c?: number;
  a: number;
  draw: (g: G, now: number, x: number, hy: number, c: number, a: number) => void;
}
