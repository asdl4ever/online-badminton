import type Phaser from 'phaser';
import { HATS_1 } from './hats1';
import { HATS_2 } from './hats2';
import { HATS_3 } from './hats3';
import { HATS_4 } from './hats4';
import { HATS_5 } from './hats5';
import { HATS_6 } from './hats6';
import { HATS_7 } from './hats7';
import { HATS_8 } from './hats8';
import { HATS_9 } from './hats9';
import { HATS_10 } from './hats10';
import { HATS_11 } from './hats11';
import { HATS_12 } from './hats12';
import { HATS_13 } from './hats13';
import { HATS_14 } from './hats14'
import { HATS_15 } from './hats15';
import { HATS_16 } from './hats16';
import { HATS_17 } from './hats17';
import { HATS_18 } from './hats18';
import { HATS_19 } from './hats19';
import { HATS_20 } from './hats20';
import { HATS_21 } from './hats21';
import { HATS_22 } from './hats22';
import { HATS_23 } from './hats23';
import { HATS_24 } from './hats24';

/**
 * 涓婚澶撮グ鐨?*閫愰《鐙珛鐢?*鎬诲叆鍙ｏ紙鍒嗘枃浠惰 hats1~4.ts锛夈€?
 * 绾﹀畾涓?character.ts 鐨?drawHat 涓€鑷达細(x, hy) = 甯芥部绾匡紙hy = topY + 4锛夛紝
 * 甯藉瓙寰€涓婇暱锛坹 璐熸柟鍚戯級銆佹í璺ㄧ害 x卤20銆?
 */
const HATS: Record<string, (typeof HATS_1)[string]> = {
  ...HATS_1,
  ...HATS_2,
  ...HATS_3,
  ...HATS_4,
  ...HATS_5,
  ...HATS_6,
  ...HATS_7,
  ...HATS_8,
  ...HATS_9,
  ...HATS_10,
  ...HATS_11,
  ...HATS_12,
  ...HATS_13,
  ...HATS_14,
  ...HATS_15,
  ...HATS_16,
  ...HATS_17,
  ...HATS_18,
  ...HATS_19,
  ...HATS_20,
  ...HATS_21,
  ...HATS_22,
  ...HATS_23,
  ...HATS_24,
};

export function hasCustomHat(id: string): boolean {
  return !!HATS[id];
}

export function drawHatCustom(
  g: Phaser.GameObjects.Graphics,
  now: number,
  id: string,
  x: number,
  hy: number,
): boolean {
  const art = HATS[id];
  if (!art) return false;
  const c = art.c ?? 0xffd45c;
  g.save();
  art.draw(g, now, x, hy, c, art.a);
  g.restore();
  return true;
}
