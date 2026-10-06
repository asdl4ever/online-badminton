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

/**
 * 主题地环的**逐款独立画**总入口（分文件见 rings1~2.ts）。
 * 每个地环按名字独立构图——商队脚印 / 法阵符文 / 菌圈蘑菇 / 岩浆裂缝……
 * 命中即整环交给 painter 画，不再走 themeart 的通用模板。
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
