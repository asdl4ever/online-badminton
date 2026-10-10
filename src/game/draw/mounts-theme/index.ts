import type Phaser from 'phaser';
import type { CharacterPose } from '../character';
import { MOUNTS_1 } from './mounts1';
import { MOUNTS_2 } from './mounts2';
import { MOUNTS_3 } from './mounts3';
import { MOUNTS_4 } from './mounts4';
import { MOUNTS_5 } from './mounts5';
import { MOUNTS_6 } from './mounts6';
import { MOUNTS_7 } from './mounts7';
import { MOUNTS_8 } from './mounts8';
import { MOUNTS_9 } from './mounts9';
import { MOUNTS_10 } from './mounts10';
import { MOUNTS_11 } from './mounts11';
import { MOUNTS_12 } from './mounts12';
import { MOUNTS_13 } from './mounts13'
import { MOUNTS_14 } from './mounts14';
import { MOUNTS_15 } from './mounts15';
import { MOUNTS_16 } from './mounts16';
import { MOUNTS_17 } from './mounts17';
import { MOUNTS_18 } from './mounts18';
import { MOUNTS_19 } from './mounts19';
import { MOUNTS_20 } from './mounts20';
import { MOUNTS_21 } from './mounts21';
import { MOUNTS_22 } from './mounts22';
import { MOUNTS_23 } from './mounts23';
import { MOUNTS_24 } from './mounts24';


/** 涓婚鍧愰獞鏁翠綋鏀惧ぇ鍊嶇巼锛堢粫鑴氬簳閿氱偣缂╂斁锛岃鑹叉湰浣撲笌鐞冩媿涓嶅彈褰卞搷锛?*/
const MOUNT_SCALE = 1.15;

/**
 * 涓婚鍧愰獞鐨?*閫愭鐙珛鐢?*鎬诲叆鍙ｏ紙鍒嗘枃浠惰 mounts1~3.ts锛夈€? * 6-family 閫氱敤妯℃澘宸插簾寮冿細姣忔鎸夊悕瀛楃敾鎴愮嫭绔嬬殑鍧愰獞锛堥獑椹?/ 楠搁鎴橀┈ /
 * 榄旈楸?/ 鍗′竵杞?/ 璐″鎷?/ 鎴樿溅鈥︼級銆?
 */
const MOUNTS: Record<string, (typeof MOUNTS_1)[string]> = {
  ...MOUNTS_1,
  ...MOUNTS_2,
  ...MOUNTS_3,
  ...MOUNTS_4,
  ...MOUNTS_5,
  ...MOUNTS_6,
  ...MOUNTS_7,
  ...MOUNTS_8,
  ...MOUNTS_9,
  ...MOUNTS_10,
  ...MOUNTS_11,
  ...MOUNTS_12,
  ...MOUNTS_13,
  ...MOUNTS_14,
  ...MOUNTS_15,
  ...MOUNTS_16,
  ...MOUNTS_17,
  ...MOUNTS_18,
  ...MOUNTS_19,
  ...MOUNTS_20,
  ...MOUNTS_21,
  ...MOUNTS_22,
  ...MOUNTS_24,
  ...MOUNTS_23,
};

export function hasCustomMount(id: string): boolean {
  return !!MOUNTS[id];
}

export function drawMountCustom(
  g: Phaser.GameObjects.Graphics,
  now: number,
  id: string,
  pose: CharacterPose,
  part: 'main' | 'overlay' = 'main',
): boolean {
  const art = MOUNTS[id];
  if (!art) return false;
  const c = art.c ?? 0xffd45c;
  // 鍧愰獞鏁翠綋鏀惧ぇ锛堢粫鑴氬簳閿氱偣缂╂斁锛屼笉褰卞搷瑙掕壊鏈綋涓庣悆鎷嶄綅缃級
  const wrap = (draw: () => void): void => {
    g.save();
    g.translateCanvas(pose.x, pose.feetY);
    g.scaleCanvas(MOUNT_SCALE, MOUNT_SCALE);
    g.translateCanvas(-pose.x, -pose.feetY);
    draw();
    g.restore();
  };
  if (part === 'overlay') {
    // 杩戜晶瑕嗙洊灞傦細鍙湁澹版槑浜?`front` 鐨勫潗楠戝湪杩欎竴閬嶄笅绗?
    if (!art.front) return true;
    wrap(() => art.front!(g, now, pose.x, pose.feetY, pose.facing, c, art.a, pose));
    return true;
  }
  wrap(() => art.draw(g, now, pose.x, pose.feetY, pose.facing, c, art.a, pose));
  return true;
}
