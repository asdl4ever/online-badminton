import type Phaser from 'phaser';

/**
 * 主题披风的共享笔刷。
 * 约定：painter 画一件**从 (0,0)（肩部锚点）垂到 y≈80** 的披风，
 * 左右各约 ±24，sway = 摆动量（入口已算好，底部摆幅最大）。
 */

export type G = Phaser.GameObjects.Graphics;
export const TAU = Math.PI * 2;

/** 折线描边 */
export function cline(g: G, pts: Array<[number, number]>, w: number, c: number, a = 1): void {
  g.lineStyle(w, c, a);
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.strokePath();
}

/** 多边形填充 */
export function cpoly(g: G, pts: Array<[number, number]>, c: number, a = 1): void {
  g.fillStyle(c, a);
  g.fillPoints(pts.map(([x, y]) => ({ x, y })), true);
}

export interface CapeArt {
  c: number;
  a: number;
  draw: (g: G, now: number, sway: number, c: number, a: number) => void;
}
