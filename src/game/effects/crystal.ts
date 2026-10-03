import type { EffectPainter } from './types';

/**
 * 碎晶绽放（🧩 碎片兑换专属命中特效）：一圈碎晶向外炸开、旋转着坠落，
 * 中心留一朵收拢的晶花。
 */
export const shardpop: EffectPainter = (g, f, t, a, size) => {
  const n = 8;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2;
    const r = (14 + t * 54) * size * (0.75 + (k % 3) * 0.18);
    const x = f.x + Math.cos(ang) * r;
    const y = f.y + Math.sin(ang) * r + t * t * 30 * size;
    const s = (5 - t * 3.2) * size * (0.8 + (k % 2) * 0.35);
    g.save();
    g.translateCanvas(x, y);
    g.rotateCanvas(ang + Math.PI / 2 + t * 3);
    // 外层晶片
    g.fillStyle(0xbfe8ff, a * (1 - t) * 0.95);
    g.fillTriangle(0, -s, s * 0.6, s * 0.7, -s * 0.6, s * 0.7);
    // 内芯高光
    g.fillStyle(0xffffff, a * (1 - t) * 0.6);
    g.fillTriangle(0, -s * 0.5, s * 0.3, s * 0.35, -s * 0.3, s * 0.35);
    g.restore();
  }
  // 中心晶花
  g.fillStyle(0xe8fbff, a * (1 - t) * 0.7);
  g.fillCircle(f.x, f.y, (10 - t * 7) * size);
};

/**
 * 龙星爆（宇宙龙域限定命中特效）：一颗旋转的五芒星炸开，
 * 五个角上拖着金色星子，外圈是龙息般的紫环。
 */
export const drastar: EffectPainter = (g, f, t, a, size) => {
  const r = (12 + t * 36) * size;
  g.save();
  g.translateCanvas(f.x, f.y);
  g.rotateCanvas(f.seed + t * 4);
  for (let k = 0; k < 5; k++) {
    const ang = (k / 5) * Math.PI * 2;
    // 星芒
    g.fillStyle(0x9f7bff, a * (1 - t * 0.7));
    g.fillTriangle(
      Math.cos(ang) * r,
      Math.sin(ang) * r,
      Math.cos(ang + 0.5) * r * 0.4,
      Math.sin(ang + 0.5) * r * 0.4,
      Math.cos(ang - 0.5) * r * 0.4,
      Math.sin(ang - 0.5) * r * 0.4,
    );
    // 角尖的星子
    g.fillStyle(0xffd45c, a * (1 - t) * 0.9);
    g.fillCircle(Math.cos(ang) * r, Math.sin(ang) * r, 2.6 * size);
  }
  g.restore();
  // 龙息外环
  g.lineStyle(3 * size, 0x8f6ad8, a * (1 - t) * 0.8);
  g.strokeCircle(f.x, f.y, r * 1.15);
  // 中心白热
  g.fillStyle(0xffffff, a * (1 - t) * 0.8);
  g.fillCircle(f.x, f.y, 4 * size);
};
