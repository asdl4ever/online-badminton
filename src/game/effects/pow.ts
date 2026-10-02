import type { EffectPainter } from './types';

/**
 * 「砰！」漫画贴纸：命中点炸开一圈星形爆框 + 逐字弹出的感叹号，
 * 发球机活动的专属命中特效（配套「复古训练房」套装）。
 */
export const pow: EffectPainter = (g, f, t, a, size) => {
  const r = (10 + t * 26) * size * (1 + f.power * 0.4);
  const rot = f.seed + f.ang * 0.2;

  // 星形爆框（漫画音效框）
  const spikes = 10;
  g.lineStyle(3 * a + 1, f.color, a * 0.95);
  g.beginPath();
  for (let k = 0; k < spikes * 2; k++) {
    const ang = rot + (k / (spikes * 2)) * Math.PI * 2;
    const rr = k % 2 === 0 ? r : r * 0.62;
    const px = f.x + Math.cos(ang) * rr;
    const py = f.y + Math.sin(ang) * rr;
    if (k === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fillStyle(0xfff2c4, a * 0.55);
  g.fillPath();
  g.lineStyle(2 * a + 1, 0xffffff, a * 0.6);
  g.strokePath();

  // 向外飞的感叹号碎片
  for (let k = 0; k < 4; k++) {
    const ang = f.seed + k * 1.7;
    const dist = (8 + t * 44) * size;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist - t * 10;
    const s = 5 * (1 - t * 0.5) * size;
    g.fillStyle(0xffffff, a * 0.85);
    g.fillRect(px - s * 0.15, py - s, s * 0.3, s * 1.4);
    g.fillCircle(px, py + s * 0.9, s * 0.18);
  }
};
