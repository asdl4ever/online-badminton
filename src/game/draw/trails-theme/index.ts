import type Phaser from 'phaser';
import { TRAILS_1 } from './trails1';
import { TRAILS_2 } from './trails2';
import { TRAILS_3 } from './trails3';
import { TRAILS_4 } from './trails4';
import { TRAILS_5 } from './trails5';

/**
 * 主题击球拖尾的**整条轨迹**画法总入口（分文件见 trails1~2.ts）。
 * 拖尾不再「每个点盖一个印章」：沿完整采样点画一个连贯的形状
 * （光晕带 / 主形 / 飞散粒子 / 头部亮核），每款独立组合。
 */
type Pt = { x: number; y: number };
type Ctx = { g: Phaser.GameObjects.Graphics; pts: readonly Pt[]; fade: number; now: number };

const TRAILS: Record<string, (typeof TRAILS_1)[string]> = {
  ...TRAILS_1,
  ...TRAILS_2,
  ...TRAILS_3,
  ...TRAILS_4,
  ...TRAILS_5,
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
