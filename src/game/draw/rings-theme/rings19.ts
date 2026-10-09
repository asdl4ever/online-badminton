import { TAU, type RingArt } from './shared';

/** 第七批地环（纳米矩阵 / 数据洪流 / 曲速跃迁 / 火星殖民 / 先行者遗迹）——原点 (x, feetY) */

export const RINGS_19: Record<string, RingArt> = {
  nanoRing: { c: 0x39ffd0, a: 0x7fe8ff, draw: (g, now, x, feetY, c, a) => {
    // 纳米地环：脚下六边格地纹，格子循环亮
    const ry = feetY - 3;
    g.fillStyle(0x0a2026, 0.5); g.fillEllipse(x, ry + 1, 58, 15);
    const R = 8;
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * TAU;
      const cx = x + Math.cos(ang) * 24, cy = ry + Math.sin(ang) * 7;
      const on = 0.3 + 0.7 * Math.max(0, Math.sin(now / 500 - k * 0.6));
      g.fillStyle(c, 0.15 + 0.2 * on);
      g.fillPoints([{ x: cx, y: cy - R * 0.9 }, { x: cx + R * 0.8, y: cy }, { x: cx, y: cy + R * 0.9 }, { x: cx - R * 0.8, y: cy }] as never, true);
      g.lineStyle(1, a, 0.25 + 0.4 * on); g.strokeCircle(cx, cy, R * 0.7);
    }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, ry, 12, 4);
  } },
  dataRing: { c: 0x4affc4, a: 0x7fb8ff, draw: (g, now, x, feetY, c, a) => {
    // 数据地环：一圈数据格，格内读数循环
    const ry = feetY - 3;
    g.fillStyle(0x0a1a1e, 0.6); g.fillEllipse(x, ry + 1, 60, 16);
    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * TAU;
      const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 7;
      const h = 0.4 + 0.6 * Math.abs(Math.sin(now / 400 + k));
      g.fillStyle(c, 0.8); g.fillRect(px - 4, py - 2, 8, 4);
      g.fillStyle(a, h); g.fillRect(px - 3, py - 1.4, 6 * h, 2.8);
      g.fillStyle(k % 2 ? a : c, 0.9); g.fillCircle(px, py - 6, 1.4);
    }
    g.fillStyle(a, 0.3); g.fillEllipse(x, ry, 18, 6);
  } },
  warpRing: { c: 0xa98cff, a: 0x9fd8ff, draw: (g, now, x, feetY, c, a) => {
    // 星轨地环：一圈拉伸的星轨环
    const ry = feetY - 3;
    g.fillStyle(0x0a0e24, 0.55); g.fillEllipse(x, ry + 1, 60, 16);
    for (let k = 0; k < 16; k++) { const ang = (k / 16) * TAU + now / 2600; const rr = 24 + Math.sin(now / 400 + k) * 4; g.fillStyle(k % 2 ? c : a, 0.7); g.fillRect(x + Math.cos(ang) * rr - 4, ry + Math.sin(ang) * rr * 0.28 - 1, 8, 2); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillCircle(x, ry, 3);
    g.fillStyle(0xffffff, 0.6); g.fillCircle(x, ry, 1.2);
  } },
  marsRing: { c: 0xc0462a, a: 0xff7a4a, draw: (g, now, x, feetY, c, a) => {
    // 红土地环：脚下红土与碎石
    const ry = feetY - 3;
    g.fillStyle(0x5a2418, 0.6); g.fillEllipse(x, ry + 1, 60, 16);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU; const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 7; g.fillStyle(k % 2 ? c : 0x8a4a2a, 0.85); g.fillEllipse(px, py, 6, 3); }
    for (let k = 0; k < 5; k++) { const ang = (k / 5) * TAU + now / 2600; g.fillStyle(0x9a8a78, 0.9); g.fillRect(x + Math.cos(ang) * 16 - 2, ry + Math.sin(ang) * 5 - 2, 4, 4); }
    g.fillStyle(a, 0.35); g.fillEllipse(x, ry, 18, 6);
  } },
  forerRing2: { c: 0x5ad8ff, a: 0xa8e0ff, draw: (g, now, x, feetY, c, a) => {
    // 遗迹地环：一圈刻纹地环，光沿纹路走
    const ry = feetY - 3;
    g.fillStyle(0x0e1620, 0.6); g.fillEllipse(x, ry + 1, 60, 16);
    g.lineStyle(5, c, 0.9); g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.28); g.beginPath(); g.arc(0, 0, 26, 0, TAU); g.strokePath(); g.restore();
    const flow = (now / 1200) % 1;
    for (let k = 0; k < 10; k++) {
      const ang = (k / 10) * TAU;
      const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 7;
      const lit = Math.max(0, 1 - Math.abs((((k / 10) - flow + 1) % 1) - 0.5) * 2);
      g.lineStyle(1.6, a, 0.3 + 0.6 * lit);
      g.lineBetween(px, py - 3, px, py + 3); g.lineBetween(px - 3, py, px + 3, py);
    }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, ry, 12, 4);
  } },
};
