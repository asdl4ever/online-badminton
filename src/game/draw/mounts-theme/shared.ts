import type { CharacterPose } from '../character';

/**
 * 主题坐骑的共享笔刷（逐款独立画，废弃 6-family 模板）。
 * 约定与 mounts.ts 的 drawMount 一致：(x, y) = pose.x / pose.feetY，
 * f = 朝向（1 / -1），坐骑画在脚下、以 y 为地面基准。
 */

export type G = import('phaser').GameObjects.Graphics;
export const TAU = Math.PI * 2;

export interface MountArt {
  /** 主色（不填则用物品自己的 MOUNT_TINT） */
  c?: number;
  a: number;
  draw: (g: G, now: number, x: number, y: number, f: 1 | -1, c: number, a: number, pose: CharacterPose) => void;
  /**
   * **近侧覆盖层**（可选）：坐骑里「该压在角色身上/身前」的那一部分——独木舟近侧船帮、
   * 兽形的前腿与胸口、研钵前缘……只在「身前遍」画。配合主 `draw`（画在身后）构成
   * 「角色骑在坐骑里」的前后遮挡，角色本体与球拍位置完全不动。见 `MOUNT_RIG.split`。
   */
  front?: (g: G, now: number, x: number, y: number, f: 1 | -1, c: number, a: number, pose: CharacterPose) => void;
}

/** 兽类四条腿（多款坐骑共用） */
export function legs(g: G, x: number, y: number, w = 6, h = 20, c = 0x3a2a1c, dxs = [-22, -8, 8, 22]): void {
  g.fillStyle(c, 0.95);
  for (const dx of dxs) g.fillRoundedRect(x + dx - w / 2, y - h + 8, w, h, 2.5);
}

/** 多边形填充 */
export function mpoly(g: G, pts: Array<[number, number]>, c: number, a = 1): void {
  g.fillStyle(c, a);
  g.fillPoints(pts.map(([px, py]) => ({ x: px, y: py })) as never, true);
}

/** 一根羽毛 / 叶片：从 (bx,by) 朝 ang 方向伸出的水滴形（翼、鬃毛共用） */
export function feather(g: G, bx: number, by: number, ang: number, len: number, wid: number, c: number, al = 1): void {
  const cos = Math.cos(ang), sin = Math.sin(ang);
  const pts: Array<{ x: number; y: number }> = [];
  const steps = 4;
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    pts.push({ x: bx + cos * len * t - sin * wid * Math.sin(t * Math.PI), y: by + sin * len * t + cos * wid * Math.sin(t * Math.PI) });
  }
  for (let k = steps; k >= 0; k--) {
    const t = k / steps;
    pts.push({ x: bx + cos * len * t + sin * wid * Math.sin(t * Math.PI), y: by + sin * len * t - cos * wid * Math.sin(t * Math.PI) });
  }
  g.fillStyle(c, al);
  g.fillPoints(pts as never, true);
}

/** 一小团云雾 */
export function mist(g: G, x: number, y: number, r: number, al = 0.5): void {
  g.fillStyle(0xffffff, al * 0.7);
  g.fillCircle(x - r * 0.7, y + r * 0.2, r * 0.6);
  g.fillCircle(x + r * 0.7, y + r * 0.15, r * 0.65);
  g.fillStyle(0xffffff, al);
  g.fillCircle(x, y, r * 0.8);
}
