import type Phaser from 'phaser';
import { WEAPONS_1 } from './weapons1';
import { WEAPONS_2 } from './weapons2';
import { WEAPONS_3 } from './weapons3';
import { WEAPONS_4 } from './weapons4';

/**
 * 主题球拍的**武器化**总入口（分文件分包见同目录 weapons1~4.ts）。
 *
 * 局部空间与 `drawRacketHead` 完全一致：握柄画在 x ∈ [-12, -2]（手在那里），
 * 武器的「打击部 / 甜区」围绕 (9, 0)，前后总跨度 ≈ 42，与常规拍框同量级。
 * 命中表就画武器并返回 true；没命中的皮肤返回 false，调用方退回拍框画法。
 * 只影响画面，判定（拍长与甜区）由 `constants.ts` 决定，不随皮肤变。
 */
const WEAPONS: Record<string, (typeof WEAPONS_1)[string]> = {
  ...WEAPONS_1,
  ...WEAPONS_2,
  ...WEAPONS_3,
  ...WEAPONS_4,
};

export function drawWeapon(
  g: Phaser.GameObjects.Graphics,
  now: number,
  skin: string,
): boolean {
  const art = WEAPONS[skin];
  if (!art) return false;
  // 4★/5★ 武器多一层背光，让武器在球场上读得出来
  if (art.c) {
    const glowSkin = WEAPONS_4[skin] ? 0.16 : 0.12;
    g.lineStyle(11, art.c, glowSkin);
    g.strokeEllipse(9, 0, 44, 34);
  }
  art.draw(g, now, art.c, art.a);
  return true;
}
