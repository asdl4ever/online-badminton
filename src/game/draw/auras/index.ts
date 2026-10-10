import type Phaser from 'phaser';
import { AURAS_1 } from './auras1';
import { AURAS_2 } from './auras2';
import { AURAS_3 } from './auras3';
import { AURAS_4 } from './auras4';
import { AURAS_5 } from './auras5';
import { AURAS_6 } from './auras6';
import { AURAS_7 } from './auras7';
import { AURAS_8 } from './auras8';
import { AURAS_9 } from './auras9';
import { AURAS_10 } from './auras10';
import { AURAS_11 } from './auras11';
import { AURAS_12 } from './auras12';
import { AURAS_13 } from './auras13';
import { AURAS_14 } from './auras14';
import { AURAS_15 } from './auras15';
import { AURAS_16 } from './auras16'
import { AURAS_17 } from './auras17';
import { AURAS_18 } from './auras18';
import { AURAS_19 } from './auras19';
import { AURAS_20 } from './auras20';
import { AURAS_21 } from './auras21';
import { AURAS_22 } from './auras22';
import { AURAS_23 } from './auras23';
import { AURAS_24 } from './auras24';
import { AURAS_25 } from './auras25';
import { AURAS_26 } from './auras26';
import { AURAS_27 } from './auras27';

/**
 * 涓婚鍏夌幆鐨?*鑳屾櫙鐗规晥鍖?*鎬诲叆鍙ｏ紙鍒嗘枃浠惰 auras1~4.ts锛夈€?
 *
 * 鍏夌幆涓嶅啀鏄€岀幆銆嶏細姣忔鏄竴骞呯敾鍦ㄨ鑹?*韬悗鐨勮儗鏅壒鏁?*鈥斺€斿厜鏌?/ 榄旈樀 / 甯峰箷 /
 * 钀芥棩 / 鏋佸厜 / 閾舵渤鈥︿互 (0, 0) = 瑙掕壊韬共涓轰腑蹇冦€佺旱璺ㄧ害 卤150銆?
 * `drawCharacter` 鏈潵灏卞湪鐢昏韩浣撲箣鍓嶈皟 `drawAura`锛屾墍浠ヨ繖閲屽ぉ鐒跺湪韬悗銆?
 */
const AURAS: Record<string, (typeof AURAS_1)[string]> = {
  ...AURAS_1,
  ...AURAS_2,
  ...AURAS_3,
  ...AURAS_4,
  ...AURAS_5,
  ...AURAS_6,
  ...AURAS_7,
  ...AURAS_8,
  ...AURAS_9,
  ...AURAS_10,
  ...AURAS_11,
  ...AURAS_12,
  ...AURAS_13,
  ...AURAS_14,
  ...AURAS_15,
  ...AURAS_16,
  ...AURAS_17,
  ...AURAS_18,
  ...AURAS_19,
  ...AURAS_20,
  ...AURAS_21,
  ...AURAS_22,
  ...AURAS_23,
  ...AURAS_24,
  ...AURAS_25,
  ...AURAS_27,
  ...AURAS_26,
};

export function hasCustomAura(id: string): boolean {
  return !!AURAS[id];
}

/** 鐢讳竴浠朵富棰樺厜鐜儗鏅壒鏁堬紱(x, cy) = 瑙掕壊韬共涓績锛宑olor = 鐗╁搧涓昏壊 */
export function drawAuraCustom(
  g: Phaser.GameObjects.Graphics,
  now: number,
  id: string,
  x: number,
  cy: number,
  color: number,
): boolean {
  const art = AURAS[id];
  if (!art) return false;
  g.save();
  g.translateCanvas(x, cy);
  art.draw(g, now, art.c ?? color, art.a);
  g.restore();
  return true;
}
