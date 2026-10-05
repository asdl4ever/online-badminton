import type Phaser from 'phaser';
import { WINGS_1 } from './wings1';
import { WINGS_2 } from './wings2';
import { WINGS_3 } from './wings3';
import { WINGS_4 } from './wings4';
import { WINGS_5 } from './wings5';

/**
 * 主题翅膀的**独立剪影**总入口（分文件见 wings1~4.ts）。
 *
 * 每款翅膀是一对**按名字画的独立剪影**（破帆 / 触手 / 太阳能板 / 蕨叶 / 水母伞…），
 * 不再复用 character.ts 的 6 种通用 kind。painter 只画右翼（+x），这里负责
 * 镜像出左翼并施加扇动。
 */
const WINGS: Record<string, (typeof WINGS_1)[string]> = {
  ...WINGS_1,
  ...WINGS_2,
  ...WINGS_3,
  ...WINGS_4,
  ...WINGS_5,
};

export function hasCustomWings(id: string): boolean {
  return !!WINGS[id];
}

/** 画一对主题翅膀；(x, baseY) = 肩部锚点，flap = 扇动量（与通用画法同源） */
export function drawWingsCustom(
  g: Phaser.GameObjects.Graphics,
  now: number,
  id: string,
  x: number,
  baseY: number,
  flap: number,
): boolean {
  const art = WINGS[id];
  if (!art) return false;
  for (const dir of [-1, 1]) {
    g.save();
    g.translateCanvas(x, baseY);
    g.scaleCanvas(dir, 1);
    art.draw(g, now, flap, art.c, art.a);
    g.restore();
  }
  return true;
}
