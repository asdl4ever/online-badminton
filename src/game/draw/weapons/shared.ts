import type Phaser from 'phaser';

/**
 * 武器绘制的共享笔刷：所有 part*.ts 共用。
 * 局部空间约定见 weapons/index.ts 顶部注释。
 */

export type G = Phaser.GameObjects.Graphics;
export const TAU = Math.PI * 2;

/** 木质握柄（几乎所有武器共用，个别武器自己画特殊柄） */
export function handle(g: G, x0 = -13, x1 = -2, w = 6, c = 0x6b4a2f): void {
  g.lineStyle(w, c, 0.95);
  g.lineBetween(x0, 0, x1, 0);
}

/** 柄尾配重 + 高光 */
export function pommel(g: G, x: number, r: number, c: number): void {
  g.fillStyle(c, 1);
  g.fillCircle(x, 0, r);
  g.fillStyle(0xffffff, 0.35);
  g.fillCircle(x - r * 0.3, -r * 0.3, r * 0.35);
}

/** 多边形填充 */
export function poly(g: G, pts: Array<[number, number]>, c: number, a = 1): void {
  g.fillStyle(c, a);
  g.fillPoints(pts.map(([x, y]) => ({ x, y })), true);
}

/** 折线描边 */
export function line(g: G, pts: Array<[number, number]>, w: number, c: number, a = 1): void {
  g.lineStyle(w, c, a);
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.strokePath();
}

/** 武器条目：c = 主色，a = 点缀色，draw 画整件武器 */
export interface WeaponArt {
  c: number;
  a: number;
  draw: (g: G, now: number, c: number, a: number) => void;
}
