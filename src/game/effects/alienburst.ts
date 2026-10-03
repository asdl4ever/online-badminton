import type { EffectPainter } from './types';

/**
 * 陨石爆（「外星人降临」活动限定命中特效）：石头被拍碎的那一刻——
 * 岩块四散、中心炸开白热，外面套一圈外星科技的幽绿余波。
 */
export const meteorBurst: EffectPainter = (g, f, t, a, size) => {
  // 四散的岩块：越飞越远、越小、越淡
  for (let k = 0; k < 8; k++) {
    const ang = f.seed + (k / 8) * Math.PI * 2;
    const rr = (8 + t * 46) * size;
    const px = f.x + Math.cos(ang) * rr;
    const py = f.y + Math.sin(ang) * rr * 0.85;
    const s = (5 - t * 3) * size;
    g.fillStyle(0x6a6f7a, a * 0.9);
    g.fillTriangle(px - s, py + s * 0.6, px + s, py, px, py - s);
    g.fillStyle(0x3a3f48, a * 0.75);
    g.fillCircle(px, py, s * 0.42);
  }
  // 白热核心
  g.fillStyle(0xffd07a, a * 0.9 * (1 - t));
  g.fillCircle(f.x, f.y, (12 - t * 8) * size);
  g.fillStyle(0xffffff, a * 0.8 * (1 - t));
  g.fillCircle(f.x, f.y, (6 - t * 4) * size);
  // 幽绿余波
  g.lineStyle((3 - t * 2) * a + 0.6, 0x6fe09a, a * 0.75);
  g.strokeCircle(f.x, f.y, (14 + t * 40) * size);
  g.lineStyle(1.5, 0xbff5d0, a * 0.4);
  g.strokeCircle(f.x, f.y, (20 + t * 54) * size);
};
