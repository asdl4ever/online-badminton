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
import type { SwingKit } from './shared';

/**
 * 主题挥拍拖尾的**逐款独立构图**总入口（分文件见 swings1~2.ts）。
 * painter 拿到 rig.ts 传来的真实拍头轨迹工具包（ribbon / core / dot / wobble…），
 * 每款用自己的层数 / 波形 / 粒子节奏构图；主色 c 由物品配色给出。
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
