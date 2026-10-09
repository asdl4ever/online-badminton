import type Phaser from 'phaser';
import { TRAILS_1 } from './trails1';
import { TRAILS_2 } from './trails2';
import { TRAILS_3 } from './trails3';
import { TRAILS_4 } from './trails4';
import { TRAILS_5 } from './trails5';
import { TRAILS_6 } from './trails6';
import { TRAILS_7 } from './trails7';
import { TRAILS_8 } from './trails8';
import { TRAILS_9 } from './trails9';
import { TRAILS_10 } from './trails10';
import { TRAILS_11 } from './trails11';
import { TRAILS_12 } from './trails12'
import { TRAILS_13 } from './trails13';
import { TRAILS_14 } from './trails14';
import { TRAILS_15 } from './trails15';
import { TRAILS_16 } from './trails16';
import { TRAILS_17 } from './trails17';
import { TRAILS_18 } from './trails18';
import { TRAILS_19 } from './trails19';
import { TRAILS_20 } from './trails20';
import { TRAILS_21 } from './trails21';
import { TRAILS_22 } from './trails22';

/**
 * 涓婚鍑荤悆鎷栧熬鐨?*鏁存潯杞ㄨ抗**鐢绘硶鎬诲叆鍙ｏ紙鍒嗘枃浠惰 trails1~2.ts锛夈€?
 * 鎷栧熬涓嶅啀銆屾瘡涓偣鐩栦竴涓嵃绔犮€嶏細娌垮畬鏁撮噰鏍风偣鐢讳竴涓繛璐殑褰㈢姸
 * 锛堝厜鏅曞甫 / 涓诲舰 / 椋炴暎绮掑瓙 / 澶撮儴浜牳锛夛紝姣忔鐙珛缁勫悎銆?
 */
type Pt = { x: number; y: number };
type Ctx = { g: Phaser.GameObjects.Graphics; pts: readonly Pt[]; fade: number; now: number };

const TRAILS: Record<string, (typeof TRAILS_1)[string]> = {
  ...TRAILS_1,
  ...TRAILS_2,
  ...TRAILS_3,
  ...TRAILS_4,
  ...TRAILS_5,
  ...TRAILS_6,
  ...TRAILS_7,
  ...TRAILS_8,
  ...TRAILS_9,
  ...TRAILS_10,
  ...TRAILS_11,
  ...TRAILS_12,
  ...TRAILS_13,
  ...TRAILS_14,
  ...TRAILS_15,
  ...TRAILS_16,
  ...TRAILS_17,
  ...TRAILS_18,
  ...TRAILS_19,
  ...TRAILS_20,
  ...TRAILS_21,
  ...TRAILS_22,
};

export function hasCustomTrail(id: string): boolean {
  return !!TRAILS[id];
}

export function drawTrailCustom(
  g: Phaser.GameObjects.Graphics,
  now: number,
  id: string,
  pts: readonly Pt[],
  fade: number,
): boolean {
  const art = TRAILS[id];
  if (!art) return false;
  const ctx: Ctx = { g, pts, fade, now };
  g.save();
  art.draw(ctx, art.c, art.a);
  g.restore();
  return true;
}
