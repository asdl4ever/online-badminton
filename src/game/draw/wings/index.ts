import type Phaser from 'phaser';
import { WINGS_1 } from './wings1';
import { WINGS_2 } from './wings2';
import { WINGS_3 } from './wings3';
import { WINGS_4 } from './wings4';
import { WINGS_5 } from './wings5';
import { WINGS_6 } from './wings6';
import { WINGS_7 } from './wings7';
import { WINGS_8 } from './wings8';
import { WINGS_9 } from './wings9';
import { WINGS_10 } from './wings10';
import { WINGS_11 } from './wings11';

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
  ...WINGS_6,
  ...WINGS_7,
  ...WINGS_8,
  ...WINGS_9,
  ...WINGS_10,
  ...WINGS_11,
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
  // 不对称背挂物件：只画一次，不镜像、不随扇动旋转（动效自己画）
  if (art.single) {
    g.save();
    g.translateCanvas(x, baseY);
    art.draw(g, now, flap, art.c, art.a);
    g.restore();
    return true;
  }
  for (const dir of [-1, 1]) {
    g.save();
    g.translateCanvas(x, baseY);
    g.scaleCanvas(dir, 1);
    // 整片翼绕肩轴**刚体旋转**实现上下挥动（镜像后方向自动正确）；
    // 传给 painter 的 flap 缩小成余量，只保留一点柔性形变
    g.rotateCanvas(flap * 0.6);
    art.draw(g, now, flap * 0.2, art.c, art.a);
    g.restore();
  }
  return true;
}
