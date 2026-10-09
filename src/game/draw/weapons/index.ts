import type Phaser from 'phaser';
import { WEAPONS_1 } from './weapons1';
import { WEAPONS_2 } from './weapons2';
import { WEAPONS_3 } from './weapons3';
import { WEAPONS_4 } from './weapons4';
import { WEAPONS_5 } from './weapons5';
import { WEAPONS_6 } from './weapons6';
import { WEAPONS_7 } from './weapons7';
import { WEAPONS_8 } from './weapons8';
import { WEAPONS_9 } from './weapons9';
import { WEAPONS_10 } from './weapons10';
import { WEAPONS_11 } from './weapons11';
import { WEAPONS_12 } from './weapons12';
import { WEAPONS_13 } from './weapons13';
import { WEAPONS_14 } from './weapons14'
import { WEAPONS_15 } from './weapons15';
import { WEAPONS_16 } from './weapons16';
import { WEAPONS_17 } from './weapons17';
import { WEAPONS_18 } from './weapons18';
import { WEAPONS_19 } from './weapons19';
import { WEAPONS_20 } from './weapons20';
import { WEAPONS_21 } from './weapons21';
import { WEAPONS_22 } from './weapons22';
import { WEAPONS_23 } from './weapons23';
import { WEAPONS_24 } from './weapons24';


/**
 * 涓婚鐞冩媿鐨?*姝﹀櫒鍖?*鎬诲叆鍙ｏ紙鍒嗘枃浠跺垎鍖呰鍚岀洰褰?weapons1~4.ts锛夈€?
 *
 * 灞€閮ㄧ┖闂翠笌 `drawRacketHead` 瀹屽叏涓€鑷达細鎻℃焺鐢诲湪 x 鈭?[-12, -2]锛堟墜鍦ㄩ偅閲岋級锛?
 * 姝﹀櫒鐨勩€屾墦鍑婚儴 / 鐢滃尯銆嶅洿缁?(9, 0)锛屽墠鍚庢€昏法搴?鈮?42锛屼笌甯歌鎷嶆鍚岄噺绾с€?
 * 鍛戒腑琛ㄥ氨鐢绘鍣ㄥ苟杩斿洖 true锛涙病鍛戒腑鐨勭毊鑲よ繑鍥?false锛岃皟鐢ㄦ柟閫€鍥炴媿妗嗙敾娉曘€?
 * 鍙奖鍝嶇敾闈紝鍒ゅ畾锛堟媿闀夸笌鐢滃尯锛夌敱 `constants.ts` 鍐冲畾锛屼笉闅忕毊鑲ゅ彉銆?
 */
const WEAPONS: Record<string, (typeof WEAPONS_1)[string]> = {
  ...WEAPONS_1,
  ...WEAPONS_2,
  ...WEAPONS_3,
  ...WEAPONS_4,
  ...WEAPONS_5,
  ...WEAPONS_6,
  ...WEAPONS_7,
  ...WEAPONS_8,
  ...WEAPONS_9,
  ...WEAPONS_10,
  ...WEAPONS_11,
  ...WEAPONS_12,
  ...WEAPONS_13,
  ...WEAPONS_14,
  ...WEAPONS_15,
  ...WEAPONS_16,
  ...WEAPONS_17,
  ...WEAPONS_18,
  ...WEAPONS_19,
  ...WEAPONS_20,
  ...WEAPONS_21,
  ...WEAPONS_22,
  ...WEAPONS_23,
  ...WEAPONS_24,
};

export function drawWeapon(
  g: Phaser.GameObjects.Graphics,
  now: number,
  skin: string,
): boolean {
  const art = WEAPONS[skin];
  if (!art) return false;
  // 4鈽?5鈽?姝﹀櫒澶氫竴灞傝儗鍏夛紝璁╂鍣ㄥ湪鐞冨満涓婅寰楀嚭鏉?
  if (art.c) {
    const glowSkin = WEAPONS_4[skin] ? 0.16 : 0.12;
    g.lineStyle(11, art.c, glowSkin);
    g.strokeEllipse(9, 0, 44, 34);
  }
  art.draw(g, now, art.c, art.a);
  return true;
}
