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
import { WINGS_12 } from './wings12';
import { WINGS_13 } from './wings13';
import { WINGS_14 } from './wings14';
import { WINGS_15 } from './wings15';
import { WINGS_16 } from './wings16';
import { WINGS_17 } from './wings17';
import { WINGS_18 } from './wings18'
import { WINGS_19 } from './wings19';
import { WINGS_20 } from './wings20';
import { WINGS_21 } from './wings21';
import { WINGS_22 } from './wings22';
import { WINGS_23 } from './wings23';
import { WINGS_24 } from './wings24';
import { WINGS_25 } from './wings25';
import { WINGS_26 } from './wings26';
import { WINGS_27 } from './wings27';
import { WINGS_28 } from './wings28';
import { WINGS_29 } from './wings29';
import { getBackTune } from '../../backTune';
import { isSingleCape } from '../capes';

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
  ...WINGS_12,
  ...WINGS_13,
  ...WINGS_14,
  ...WINGS_15,
  ...WINGS_16,
  ...WINGS_17,
  ...WINGS_18,
  ...WINGS_19,
  ...WINGS_20,
  ...WINGS_21,
  ...WINGS_22,
  ...WINGS_23,
  ...WINGS_24,
  ...WINGS_25,
  ...WINGS_26,
  ...WINGS_27,
  ...WINGS_29,
  ...WINGS_28,
};

export function hasCustomWings(id: string): boolean {
  return !!WINGS[id];
}

/** 这件背部装饰是不是「背挂物件」（翅膀包或披风包里的 `single`）——给调参 UI 判断用 */
export function isSingleBack(id: string): boolean {
  return !!WINGS[id]?.single || isSingleCape(id);
}

/**
 * 画一对主题翅膀 / 一件背挂物件；(x, baseY) = 肩部锚点，flap = 扇动量。
 *
 * `pass`：双层绘制——背挂物件按逐件调参画在「身前」或「身后」：
 * - `'back'`（默认）：画身体之前调用，成对翅膀与身后型背挂在这里画；
 * - `'front'`：画身体之后调用，身前型背挂（`bmt-back-tune` 里 front = true）在这里画。
 * 两遍都会调用，painter 只在属于自己的那遍真正下笔。
 */
export function drawWingsCustom(
  g: Phaser.GameObjects.Graphics,
  now: number,
  id: string,
  x: number,
  baseY: number,
  flap: number,
  pass: 'back' | 'front' = 'back',
): boolean {
  const art = WINGS[id];
  if (!art) return false;
  // 不对称背挂物件：只画一次，不镜像、不随扇动旋转（动效自己画）。
  // 默认居中挂在肩锚；画层（身前/身后）与水平位置由逐件调参（bmt-back-tune）决定。
  if (art.single) {
    const tune = getBackTune(id);
    if ((tune.front ? 'front' : 'back') !== pass) return false;
    g.save();
    g.translateCanvas(x + tune.ox, baseY);
    art.draw(g, now, flap, art.c, art.a);
    g.restore();
    return true;
  }
  // 成对翅膀永远画在身后层
  if (pass !== 'back') return false;
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
