import type Phaser from 'phaser';
import { getBackTune } from '../../backTune';
import { CAPES_1 } from './capes1';
import { CAPES_2 } from './capes2';
import { CAPES_3 } from './capes3';
import { CAPES_4 } from './capes4';
import { CAPES_5 } from './capes5';
import { CAPES_6 } from './capes6';
import { CAPES_7 } from './capes7';
import { CAPES_8 } from './capes8';
import { CAPES_9 } from './capes9';
import { CAPES_10 } from './capes10';
import { CAPES_11 } from './capes11';
import { CAPES_12 } from './capes12';
import { CAPES_13 } from './capes13';
import { CAPES_14 } from './capes14';

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
  ...CAPES_8,
  ...CAPES_9,
  ...CAPES_10,
  ...CAPES_11,
  ...CAPES_12,
  ...CAPES_13,
  ...CAPES_14,
};

export function hasCustomCape(id: string): boolean {
  return !!CAPES[id];
}

/** 这件背部装饰是不是披风包里的**背挂物件**（非披风：背包 / 招牌 / 盾牌…） */
export function isSingleCape(id: string): boolean {
  return !!CAPES[id]?.single;
}

/**
 * 画一件主题披风 / 背挂物件；(x, baseY) = 锚点。
 * - 披风款：入口做呼吸摆 + 跑动后仰，只在身后层（`pass` 必须是 'back'）；
 * - 背挂物件（`single: true`）：不套披风变换，只画一次、按 `getBackTune` 定位与分层。
 */
export function drawCapeCustom(
  g: Phaser.GameObjects.Graphics,
  now: number,
  id: string,
  x: number,
  baseY: number,
  move = 0,
  facing: 1 | -1 = 1,
  pass: 'back' | 'front' = 'back',
): boolean {
  const art = CAPES[id];
  if (!art) return false;
  // 背挂物件：和翅膀包的 single 同一套——不镜像、不后仰，分层 + ox 由逐件调参决定
  if (art.single) {
    const tune = getBackTune(id);
    if ((tune.front ? 'front' : 'back') !== pass) return false;
    g.save();
    g.translateCanvas(x + tune.ox, baseY);
    art.draw(g, now, 0, art.c, art.a);
    g.restore();
    return true;
  }
  // 披风款只在身后层画
  if (pass !== 'back') return false;
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
