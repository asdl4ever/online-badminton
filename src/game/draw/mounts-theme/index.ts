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


/**
 * 主题坐骑的**逐款独立画**总入口（分文件见 mounts1~3.ts）。
 * 6-family 通用模板已废弃：每款按名字画成独立的坐骑（骆驼 / 骸骨战马 /
 * 魔鬼鱼 / 卡丁车 / 贡多拉 / 战车…）。
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
};

export function hasCustomMount(id: string): boolean {
  return !!MOUNTS[id];
}

export function drawMountCustom(
  g: Phaser.GameObjects.Graphics,
  now: number,
  id: string,
  pose: CharacterPose,
): boolean {
  const art = MOUNTS[id];
  if (!art) return false;
  const c = art.c ?? 0xffd45c;
  g.save();
  art.draw(g, now, pose.x, pose.feetY, pose.facing, c, art.a, pose);
  g.restore();
  return true;
}
