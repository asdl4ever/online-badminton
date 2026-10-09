import { TAU, type RingArt } from './shared';

/** 批十五地环（基多拉 / 魔斯拉 / 机甲战队 / 火山泰坦 / 深海巨妖）——原点 (x, feetY) */

export const RINGS_16: Record<string, RingArt> = {
  ghidRing: { c: 0xffe15c, a: 0x7fd4ff, draw: (g, now, x, feetY, c, a) => {
    // 雷痕地环：地面被雷劈出的焦痕 + 沿痕游走的电弧
    const ry = feetY - 3;
    g.fillStyle(0x2a2410, 0.7); g.fillEllipse(x, ry + 1, 60, 15);
    g.lineStyle(2.4, 0x1a1408, 1);
    for (let k = 0; k < 5; k++) { const ang = (k / 5) * TAU + 0.3; g.beginPath(); g.moveTo(x, ry); g.lineTo(x + Math.cos(ang) * 26, ry + Math.sin(ang) * 7); g.strokePath(); }
    g.lineStyle(1.6, c, 0.6 + 0.4 * Math.abs(Math.sin(now / 200)));
    for (let k = 0; k < 5; k++) { const ang = (k / 5) * TAU + 0.3; g.beginPath(); g.moveTo(x, ry); g.lineTo(x + Math.cos(ang) * 26, ry + Math.sin(ang) * 7); g.strokePath(); }
    g.fillStyle(a, 0.5); g.fillEllipse(x, ry, 12, 4);
  } },
  mthrRing: { c: 0xffe66a, a: 0xbfe8ff, draw: (g, now, x, feetY, _c, _a) => {
    // 鳞粉地环：脚下一圈金色鳞粉，缓缓旋转上扬
    const ry = feetY - 3;
    g.fillStyle(0x3a4a2a, 0.5); g.fillEllipse(x, ry + 1, 58, 15);
    for (let k = 0; k < 14; k++) {
      const ang = (k / 14) * TAU + now / 3000;
      const rr = 20 + (k % 3) * 8;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 400 + k));
      g.fillStyle(k % 2 ? 0xffe66a : 0xbfe8ff, tw * 0.85);
      g.fillCircle(x + Math.cos(ang) * rr, ry + Math.sin(ang) * rr * 0.26, 1.6);
    }
  } },
  tksRing: { c: 0x5ac8ff, a: 0x8a94a2, draw: (g, now, x, feetY, c, _a) => {
    // 履带地环：一圈滚动的履带 + 负重轮
    const ry = feetY - 3;
    g.fillStyle(0x1a2430, 0.7); g.fillEllipse(x, ry + 1, 62, 16);
    g.lineStyle(8, 0x2a3244, 1);
    g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26); g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.strokePath(); g.restore();
    const roll = now / 240;
    for (let k = 0; k < 22; k++) {
      const ang = roll + (k / 22) * TAU;
      g.lineStyle(3, 0x141c26, 1);
      g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26);
      g.beginPath(); g.moveTo(Math.cos(ang) * 26, Math.sin(ang) * 26); g.lineTo(Math.cos(ang) * 34, Math.sin(ang) * 34); g.strokePath(); g.restore();
    }
    for (const gx of [-18, 0, 18]) { g.fillStyle(0x3f4a62, 1); g.fillCircle(x + gx, ry, 4.4); g.fillStyle(c, 0.8); g.fillCircle(x + gx, ry, 1.8); }
    g.lineStyle(1.4, c, 0.4); g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26); g.beginPath(); g.arc(0, 0, 36, 0, TAU); g.strokePath(); g.restore();
  } },
  titanRing: { c: 0xff6a2a, a: 0xffd45c, draw: (g, now, x, feetY, c, a) => {
    // 岩浆裂地：碎裂大地 + 缝里透熔岩 + 冒火星
    const ry = feetY - 3;
    g.fillStyle(0x2a1a12, 0.9); g.fillEllipse(x, ry, 62, 16);
    g.fillStyle(0x3a2a1a, 0.9); g.fillEllipse(x, ry - 1, 52, 12);
    g.lineStyle(2, 0x140a06, 1);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU + 0.3; g.beginPath(); g.moveTo(x, ry); g.lineTo(x + Math.cos(ang) * 30, ry + Math.sin(ang) * 8); g.strokePath(); }
    for (let k = 0; k < 4; k++) { const heat = 0.4 + 0.4 * Math.sin(now / 400 + k * 1.5); g.lineStyle(2, c, heat); g.beginPath(); g.moveTo(x - 24 + k * 16, ry + 3); g.lineTo(x - 18 + k * 16, ry - 2); g.lineTo(x - 22 + k * 16, ry - 6); g.strokePath(); g.fillStyle(a, heat * 0.35); g.fillEllipse(x - 22 + k * 16, ry + 2, 10, 4); }
    for (let k = 0; k < 4; k++) { const ph = ((now / 600 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.85); g.fillCircle(x - 30 + k * 20, ry - 2 - ph * 12, 1.6 * (1 - ph) + 0.4); }
  } },
  leviRing: { c: 0x5fe8d0, a: 0x9b6aff, draw: (g, now, x, feetY, c, a) => {
    // 触须地环：脚下盘着的触须 + 幽光 + 水波
    const ry = feetY - 3;
    g.fillStyle(0x0e1e2e, 0.7); g.fillEllipse(x, ry + 1, 60, 15);
    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * TAU + now / 2600;
      let px = x, py = ry;
      g.lineStyle(4, k % 2 ? c : 0x2a5a48, 0.9);
      g.beginPath(); g.moveTo(px, py);
      for (let s = 1; s <= 3; s++) {
        const t = s / 3;
        px = x + Math.cos(ang) * 30 * t + Math.sin(now / 300 + k + s) * 3;
        py = ry + Math.sin(ang) * 30 * t * 0.26;
        g.lineTo(px, py);
      }
      g.strokePath();
      g.fillStyle(a, 0.8); g.fillCircle(px, py, 1.6);
    }
    g.lineStyle(1.4, c, 0.35); g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26); g.beginPath(); g.arc(0, 0, 34, 0, TAU); g.strokePath(); g.restore();
  } },
};
