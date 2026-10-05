import type Phaser from 'phaser';
import { CAPES_1 } from './capes1';
import { CAPES_2 } from './capes2';
import { CAPES_3 } from './capes3';
import { CAPES_4 } from './capes4';

/**
 * 主题披风的**独立剪影**总入口（分文件见 capes1~4.ts）。
 * painter 画一件从 (0,0)（肩部锚点）垂到 y≈80 的披风，sway = 摆动量。
 */
const CAPES: Record<string, (typeof CAPES_1)[string]> = {
  ...CAPES_1,
  ...CAPES_2,
  ...CAPES_3,
  ...CAPES_4,
};

export function hasCustomCape(id: string): boolean {
  return !!CAPES[id];
}

/** 画一件主题披风；(x, baseY) = 肩部锚点 */
export function drawCapeCustom(
  g: Phaser.GameObjects.Graphics,
  now: number,
  id: string,
  x: number,
  baseY: number,
): boolean {
  const art = CAPES[id];
  if (!art) return false;
  const sway = Math.sin(now / 420) * 6;
  g.save();
  g.translateCanvas(x, baseY);
  art.draw(g, now, sway, art.c, art.a);
  g.restore();
  return true;
}
