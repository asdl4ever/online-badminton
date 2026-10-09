import { TAU, type RingArt } from './shared';

/** 第十批地环（梦境 / 微观 / 炼金 / 毛线 / 画中世界）——原点 (x, feetY)，地面基准 feetY-3 */

export const RINGS_22: Record<string, RingArt> = {
  dreamRing: { c: 0x9f8aff, a: 0xffe08a, draw: (g, now, x, feetY, c, a) => {
    // 梦涡地环：脚下一圈旋转梦涡
    const ry = feetY - 3;
    g.fillStyle(0x1a1440, 0.45); g.fillEllipse(x, ry + 1, 58, 15);
    const rot = now / 900;
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU + rot; g.fillStyle(k % 2 ? c : 0x7a6ab0, 0.75); g.fillCircle(x + Math.cos(ang) * 24, ry + Math.sin(ang) * 7, 2 + (k % 2)); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, ry, 13, 4);
    for (let k = 0; k < 3; k++) { const ph = ((now / 1000 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(x + Math.sin(k * 2) * 10, ry - ph * 22, 1.6); }
  } },
  microDishRing: { c: 0x5fe8d0, a: 0x39ffd0, draw: (g, now, x, feetY, c, a) => {
    // 培养皿地环：脚下一圈培养皿 + 菌落
    const ry = feetY - 3;
    g.fillStyle(0x06141e, 0.5); g.fillEllipse(x, ry + 1, 60, 16);
    g.fillStyle(0x2a7a8a, 0.5); g.fillEllipse(x, ry, 54, 13);
    g.fillStyle(0xc8f0e0, 0.3); g.fillEllipse(x, ry, 46, 10);
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU; const px = x + Math.cos(ang) * 22, py = ry + Math.sin(ang) * 6; const on = 0.4 + 0.5 * Math.abs(Math.sin(now / 500 + k)); g.fillStyle(k % 2 ? a : c, on); g.fillCircle(px, py, 2.2); }
    g.lineStyle(2, a, 0.6); g.strokeEllipse(x, ry, 52, 12);
  } },
  alchCircle: { c: 0x7dff6a, a: 0xffd45c, draw: (g, now, x, feetY, c, a) => {
    // 炼成阵地环：脚下缓转的炼成阵
    const ry = feetY - 3;
    g.fillStyle(0x12200c, 0.5); g.fillEllipse(x, ry + 1, 58, 15);
    g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.28); g.rotateCanvas(now / 1400);
    g.lineStyle(2.4, c, 0.7); g.strokeCircle(0, 0, 46); g.strokeCircle(0, 0, 34);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; g.lineStyle(1.6, a, 0.7); g.lineBetween(Math.cos(ang) * 34, Math.sin(ang) * 34, Math.cos(ang + 2.09) * 34, Math.sin(ang + 2.09) * 34); }
    g.restore();
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, ry, 12, 4);
    for (let k = 0; k < 4; k++) { const ph = ((now / 1100 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(x + Math.cos(k * 1.7) * 26, ry - ph * 24, 1.6); }
  } },
  yarnThreadRing: { c: 0xffb7d5, a: 0xffd8e8, draw: (g, now, x, feetY, c, a) => {
    // 线头地环：脚下一圈线头
    const ry = feetY - 3;
    g.fillStyle(0x3a1e30, 0.4); g.fillEllipse(x, ry + 1, 58, 15);
    g.lineStyle(2.4, c, 0.8); g.beginPath();
    for (let k = 0; k <= 32; k++) { const ang = (k / 32) * TAU; const rr = 24 + Math.sin(k * 0.9 + now / 400) * 3; g.lineTo(x + Math.cos(ang) * rr, ry + Math.sin(ang) * rr * 0.28); }
    g.strokePath();
    for (let k = 0; k < 5; k++) { const ang = (k / 5) * TAU; const px = x + Math.cos(ang) * 26, py = ry + Math.sin(ang) * 7; g.fillStyle(a, 1); g.fillCircle(px, py, 2.4); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, ry, 12, 4);
  } },
  paintSplatterRing: { c: 0xff8ad4, a: 0xffd45c, draw: (g, now, x, feetY, c, a) => {
    // 泼彩地环：脚下一摊蔓延的颜料 + 飞溅
    const ry = feetY - 3;
    const cols = [0xff4a4a, 0xffd45c, 0x7dff9a, 0x5ac8ff, 0xff8ad4];
    for (let k = 0; k < 5; k++) { const ang = (k / 5) * TAU + now / 3000; const rr = 20 + Math.sin(now / 500 + k) * 6; g.fillStyle(cols[k], 0.7); g.fillEllipse(x + Math.cos(ang) * rr * 0.9, ry + Math.sin(ang) * rr * 0.3, 12, 6); }
    g.fillStyle(c, 0.5); g.fillEllipse(x, ry, 44, 12);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU + 0.5; g.fillStyle(cols[k % 5], 0.85); g.fillCircle(x + Math.cos(ang) * 28, ry + Math.sin(ang) * 7, 2.4); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, ry, 12, 4);
    void a;
  } },
};
