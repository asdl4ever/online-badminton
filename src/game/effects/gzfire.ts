import type { EffectPainter } from './types';

/**
 * 原子烈焰（「哥斯拉来袭」活动限定命中特效）：原子蓝的火舌向上翻卷，
 * 混着白热的芯，命中点像被哥斯拉吐息燎过。
 */
export const gzfire: EffectPainter = (g, f, t, a, size) => {
  const n = 7;
  for (let k = 0; k < n; k++) {
    const sway = Math.sin(f.seed + k * 2.1 + t * 6) * 6 * size;
    const px = f.x + sway + (k - n / 2) * 6 * size;
    const rise = (6 + t * 60 + (k % 3) * 8) * size;
    const h = (16 - t * 8) * size * (0.7 + (k % 3) * 0.2);
    // 外焰（原子蓝）
    g.fillStyle(0x8fe0ff, a * 0.85);
    g.fillTriangle(
      px - 5 * size,
      f.y - rise * 0.4,
      px + 5 * size,
      f.y - rise * 0.4,
      px + sway * 0.5,
      f.y - rise - h,
    );
    // 白热内芯
    g.fillStyle(0xffffff, a * 0.7);
    g.fillTriangle(
      px - 2 * size,
      f.y - rise * 0.5,
      px + 2 * size,
      f.y - rise * 0.5,
      px + sway * 0.3,
      f.y - rise - h * 0.5,
    );
  }
  // 灼烧底圈
  const r = (10 + t * 30) * size;
  g.lineStyle(2.5 * a + 0.5, 0x8fe0ff, a * 0.6);
  g.strokeCircle(f.x, f.y, r);
};
