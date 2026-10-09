import type Phaser from 'phaser';
import { RINGS_1 } from './rings1';
import { RINGS_2 } from './rings2';
import { RINGS_3 } from './rings3';
import { RINGS_4 } from './rings4';
import { RINGS_5 } from './rings5';
import { RINGS_6 } from './rings6';
import { RINGS_7 } from './rings7';
import { RINGS_8 } from './rings8';
import { RINGS_9 } from './rings9';
import { RINGS_10 } from './rings10';
import { RINGS_11 } from './rings11';
import { RINGS_12 } from './rings12'
import { RINGS_13 } from './rings13';
import { RINGS_14 } from './rings14';
import { RINGS_15 } from './rings15';
import { RINGS_16 } from './rings16';
import { RINGS_17 } from './rings17';
import { RINGS_18 } from './rings18';
import { RINGS_19 } from './rings19';
import { RINGS_20 } from './rings20';
import { RINGS_21 } from './rings21';
import { RINGS_22 } from './rings22';


/**
 * 涓婚鍦扮幆鐨?*閫愭鐙珛鐢?*鎬诲叆鍙ｏ紙鍒嗘枃浠惰 rings1~2.ts锛夈€?
 * 姣忎釜鍦扮幆鎸夊悕瀛楃嫭绔嬫瀯鍥锯€斺€斿晢闃熻剼鍗?/ 娉曢樀绗︽枃 / 鑿屽湀铇戣弴 / 宀╂祮瑁傜紳鈥︹€?
 * 鍛戒腑鍗虫暣鐜氦缁?painter 鐢伙紝涓嶅啀璧?themeart 鐨勯€氱敤妯℃澘銆?
 */
const RINGS: Record<string, (typeof RINGS_1)[string]> = {
  ...RINGS_1,
  ...RINGS_2,
  ...RINGS_3,
  ...RINGS_4,
  ...RINGS_5,
  ...RINGS_6,
  ...RINGS_7,
  ...RINGS_8,
  ...RINGS_9,
  ...RINGS_10,
  ...RINGS_11,
  ...RINGS_12,
  ...RINGS_13,
  ...RINGS_14,
  ...RINGS_15,
  ...RINGS_16,
  ...RINGS_17,
  ...RINGS_18,
  ...RINGS_19,
  ...RINGS_20,
  ...RINGS_21,
  ...RINGS_22,
};

export function hasCustomRing(id: string): boolean {
  return !!RINGS[id];
}

export function drawRingCustom(
  g: Phaser.GameObjects.Graphics,
  now: number,
  x: number,
  feetY: number,
  id: string,
  color: number,
): boolean {
  const art = RINGS[id];
  if (!art) return false;
  const c = art.c ?? color;
  art.draw(g, now, x, feetY, c, art.a);
  return true;
}
