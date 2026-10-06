import type Phaser from 'phaser';
import { CAPES_1 } from './capes1';
import { CAPES_2 } from './capes2';
import { CAPES_3 } from './capes3';
import { CAPES_4 } from './capes4';
import { CAPES_5 } from './capes5';
import { CAPES_6 } from './capes6';
import { CAPES_7 } from './capes7';

/**
 * 主题披风的**独立剪影**总入口（分文件见 capes1~4.ts）。
 * painter 画一件从 (0,0)（肩部锚点）垂到 y≈80 的披风，sway = 摆动量。
 */
const CAPES: Record<string, (typeof CAPES_1)[string]> = {
  ...CAPES_1,
  ...CAPES_2,
  ...CAPES_3,
  ...CAPES_4,
  ...CAPES_5,
  ...CAPES_6,
  ...CAPES_7,
};

export function hasCustomCape(id: string): boolean {
  return !!CAPES[id];
}

/** 画一件主题披风；(x, baseY) = 肩部锚点；move = 移动强度，facing = 朝向（物理摆动用） */
export function drawCapeCustom(
  g: Phaser.GameObjects.Graphics,
  now: number,
  id: string,
  x: number,
  baseY: number,
  move = 0,
  facing: 1 | -1 = 1,
): boolean {
  const art = CAPES[id];
  if (!art) return false;
  // 呼吸摆 + 跑动时的高频抖摆；整体加大 28%×6% 让下摆从身体两侧露出来；
  // 跑动时整件向后仰（绕肩轴转一个随速度增大的角）
  const sway = Math.sin(now / 420) * 6 + Math.sin(now / 90) * move * 6;
  g.save();
  g.translateCanvas(x, baseY);
  g.scaleCanvas(1.28, 1.06);
  g.rotateCanvas(-facing * move * 0.14);
  art.draw(g, now, sway, art.c, art.a);
  g.restore();
  return true;
}
