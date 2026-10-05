import type Phaser from 'phaser';

/**
 * 主题光环的共享笔刷——**背景特效化**。
 * 约定：painter 以 (0, 0) = 角色躯干为中心，画在角色**身后**，
 * 纵跨约 ±150、横跨约 ±100（不再是环）。粒子数保持克制（每件 ≤16 个图元）。
 */

export type G = Phaser.GameObjects.Graphics;
export const TAU = Math.PI * 2;

/** 折线描边 */
export function aline(g: G, pts: Array<[number, number]>, w: number, c: number, a = 1): void {
  g.lineStyle(w, c, a);
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.strokePath();
}

/** 多边形填充 */
export function apoly(g: G, pts: Array<[number, number]>, c: number, a = 1): void {
  g.fillStyle(c, a);
  g.fillPoints(pts.map(([x, y]) => ({ x, y })), true);
}

export interface AuraArt {
  /** 主色（不填则用物品自己的颜色） */
  c?: number;
  a: number;
  draw: (g: G, now: number, c: number, a: number) => void;
}
