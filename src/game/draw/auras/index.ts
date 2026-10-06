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

/**
 * 主题光环的**背景特效化**总入口（分文件见 auras1~4.ts）。
 *
 * 光环不再是「环」：每款是一幅画在角色**身后的背景特效**——光柱 / 魔阵 / 帷幕 /
 * 落日 / 极光 / 银河…以 (0, 0) = 角色躯干为中心、纵跨约 ±150。
 * `drawCharacter` 本来就在画身体之前调 `drawAura`，所以这里天然在身后。
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
};

export function hasCustomAura(id: string): boolean {
  return !!AURAS[id];
}

/** 画一件主题光环背景特效；(x, cy) = 角色躯干中心，color = 物品主色 */
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
