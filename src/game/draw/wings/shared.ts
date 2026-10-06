import type Phaser from 'phaser';

/**
 * 主题翅膀的共享笔刷。
 * 约定：painter 只画**右翼**（+x 方向），原点 = 肩部锚点（drawWings 的 baseY）；
 * 左翼由入口 scale(-1,1) 镜像。翼展横向约 45~95、纵向约 -95~+25。
 */

export type G = Phaser.GameObjects.Graphics;
export const TAU = Math.PI * 2;

/** 折线描边 */
export function wline(g: G, pts: Array<[number, number]>, w: number, c: number, a = 1): void {
  g.lineStyle(w, c, a);
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.strokePath();
}

/** 多边形填充 */
export function wpoly(g: G, pts: Array<[number, number]>, c: number, a = 1): void {
  g.fillStyle(c, a);
  g.fillPoints(pts.map(([x, y]) => ({ x, y })), true);
}

export interface WingArt {
  c: number;
  a: number;
  draw: (g: G, now: number, flap: number, c: number, a: number) => void;
  /**
   * **不对称背挂物件**（蝠鲼 / 蜻蜓 / 钟盘这类「不是一双翼」的东西）：
   * 为 true 时入口只画一次、不做镜像也不做挥动旋转（动效全在 painter 里）。
   */
  single?: boolean;
}
