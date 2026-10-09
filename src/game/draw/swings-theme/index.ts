import type Phaser from 'phaser';
import { SWINGS_1 } from './swings1';
import { SWINGS_2 } from './swings2';
import { SWINGS_3 } from './swings3';
import { SWINGS_4 } from './swings4';
import { SWINGS_5 } from './swings5';
import { SWINGS_6 } from './swings6';
import { SWINGS_7 } from './swings7';
import { SWINGS_8 } from './swings8';
import { SWINGS_9 } from './swings9';
import { SWINGS_10 } from './swings10';
import { SWINGS_11 } from './swings11';
import { SWINGS_12 } from './swings12'
import { SWINGS_13 } from './swings13';
import { SWINGS_14 } from './swings14';
import { SWINGS_15 } from './swings15';
import { SWINGS_16 } from './swings16';
import { SWINGS_17 } from './swings17';
import { SWINGS_18 } from './swings18';
import { SWINGS_19 } from './swings19';
import { SWINGS_20 } from './swings20';
import { SWINGS_21 } from './swings21';
import { SWINGS_22 } from './swings22';
import type { SwingKit } from './shared';

/**
 * 涓婚鎸ユ媿鎷栧熬鐨?*閫愭鐙珛鏋勫浘**鎬诲叆鍙ｏ紙鍒嗘枃浠惰 swings1~2.ts锛夈€?
 * painter 鎷垮埌 rig.ts 浼犳潵鐨勭湡瀹炴媿澶磋建杩瑰伐鍏峰寘锛坮ibbon / core / dot / wobble鈥︼級锛?
 * 姣忔鐢ㄨ嚜宸辩殑灞傛暟 / 娉㈠舰 / 绮掑瓙鑺傚鏋勫浘锛涗富鑹?c 鐢辩墿鍝侀厤鑹茬粰鍑恒€?
 */
const SWINGS: Record<string, (typeof SWINGS_1)[string]> = {
  ...SWINGS_1,
  ...SWINGS_2,
  ...SWINGS_3,
  ...SWINGS_4,
  ...SWINGS_5,
  ...SWINGS_6,
  ...SWINGS_7,
  ...SWINGS_8,
  ...SWINGS_9,
  ...SWINGS_10,
  ...SWINGS_11,
  ...SWINGS_12,
  ...SWINGS_13,
  ...SWINGS_14,
  ...SWINGS_15,
  ...SWINGS_16,
  ...SWINGS_17,
  ...SWINGS_18,
  ...SWINGS_19,
  ...SWINGS_20,
  ...SWINGS_21,
  ...SWINGS_22,
};

export function drawSwingCustom(
  g: Phaser.GameObjects.Graphics,
  now: number,
  hot: number,
  style: string,
  kit: SwingKit,
  color: number,
): boolean {
  const art = SWINGS[style];
  if (!art) return false;
  art.draw(g, now, hot, kit, color, art.a);
  return true;
}
