import { TAU, type RingArt } from './shared';

/** 批十四地环（年兽迎春 / 月夜狼族 / 末日丧尸 / 大便人厕所）——原点 (x, feetY) */

export const RINGS_15: Record<string, RingArt> = {
  nianRing: { c: 0xd93a3a, a: 0xffd45c, draw: (g, now, x, feetY, c, a) => {
    // 鞭炮地环：脚下一圈铺开的红鞭炮，末梢一颗在炸火星
    const ry = feetY - 3;
    g.fillStyle(0x3a0a0a, 0.5);
    g.fillEllipse(x, ry + 1, 60, 15);
    for (let k = 0; k < 16; k++) {
      const ang = (k / 16) * TAU;
      const px = x + Math.cos(ang) * 26, py = ry + Math.sin(ang) * 6.5;
      g.fillStyle(k % 2 ? c : 0xb02a2a, 0.95);
      g.save(); g.translateCanvas(px, py); g.rotateCanvas(ang);
      g.fillRoundedRect(-5, -2, 10, 4, 1.6);
      g.fillStyle(a, 0.9); g.fillRect(-5, -0.6, 10, 1);
      g.restore();
    }
    const ph = (now / 500) % 1;
    const bx = x + 26, by = ry;
    g.lineStyle(2 - ph, a, (1 - ph) * 0.9);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; g.lineBetween(bx, by, bx + Math.cos(ang) * (6 + ph * 10), by + Math.sin(ang) * (6 + ph * 10)); }
  } },
  wolfRing: { c: 0xff3a4a, a: 0xc0c8d8, draw: (g, _now, x, feetY, c, a) => {
    // 爪痕地环：泥地上被撕开的三道爪痕 + 边缘土屑
    const ry = feetY - 3;
    g.fillStyle(0x2a2418, 0.6);
    g.fillEllipse(x, ry + 1, 60, 15);
    g.fillStyle(0x3a3222, 0.7);
    g.fillEllipse(x, ry, 48, 11);
    for (let j = 0; j < 3; j++) {
      const oy = (j - 1) * 4;
      g.lineStyle(3, c, 0.9);
      g.beginPath();
      g.moveTo(x - 24, ry + oy + 1);
      g.lineTo(x, ry + oy - 1);
      g.lineTo(x + 24, ry + oy + 1);
      g.strokePath();
      g.lineStyle(1.4, a, 0.6);
      g.lineBetween(x - 24, ry + oy + 1, x + 24, ry + oy + 1);
    }
    for (let k = 0; k < 6; k++) { // 土屑
      const ang = k * 1.1;
      g.fillStyle(0x6a5a3a, 0.8);
      g.fillRect(x + Math.cos(ang) * 30 - 1.5, ry + Math.sin(ang) * 8 - 1, 4, 2.4);
    }
  } },
  zombRing: { c: 0xd8b12a, a: 0x1a1a16, draw: (g, _now, x, feetY, c, a) => {
    // 警戒地环：地面一圈黄黑警示带 + 裂缝 + 溅污
    const ry = feetY - 3;
    g.fillStyle(0x1a1a16, 0.6);
    g.fillEllipse(x, ry + 1, 62, 16);
    g.lineStyle(8, c, 0.95);
    g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26);
    g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.strokePath(); g.restore();
    // 黑色斜纹
    for (let k = 0; k < 14; k++) {
      const ang = (k / 14) * TAU;
      g.lineStyle(5, a, 0.9);
      g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26);
      g.beginPath(); g.arc(0, 0, 30, ang, ang + 0.09); g.strokePath(); g.restore();
    }
    g.lineStyle(1.6, 0x0a0a08, 1);
    for (let k = 0; k < 5; k++) { const ang = (k / 5) * TAU; g.lineBetween(x, ry, x + Math.cos(ang) * 26, ry + Math.sin(ang) * 7); }
    g.fillStyle(0x8a1a1a, 0.5); g.fillEllipse(x - 10, ry + 2, 8, 3);
  } },
  toilRing: { c: 0xe8eef2, a: 0x8fd8ff, draw: (g, now, x, feetY, _c, a) => {
    // 瓷砖地环：脚下一圈白瓷砖 + 缝线 + 中央地漏
    const ry = feetY - 3;
    g.fillStyle(0xbfc8d0, 0.6);
    g.fillEllipse(x, ry + 1, 62, 16);
    g.fillStyle(0xe8eef2, 1);
    g.fillEllipse(x, ry, 54, 13);
    // 砖缝
    g.lineStyle(1.4, 0xb0b8c0, 0.9);
    for (const ang of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
      g.lineBetween(x + Math.cos(ang) * 26, ry + Math.sin(ang) * 6.5, x - Math.cos(ang) * 26, ry - Math.sin(ang) * 6.5);
    }
    g.lineStyle(1.2, 0xb0b8c0, 0.7);
    g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26);
    g.beginPath(); g.arc(0, 0, 15, 0, TAU); g.strokePath(); g.restore();
    // 中央地漏
    g.fillStyle(0x9aa4b2, 1); g.fillEllipse(x, ry, 16, 4.4);
    g.fillStyle(0x5a626c, 1); g.fillEllipse(x, ry, 10, 2.6);
    for (let k = -1; k <= 1; k++) { g.fillStyle(0x3a4048, 1); g.fillRect(x + k * 3 - 0.8, ry - 2, 1.6, 4); }
    // 反光
    const gl = 0.3 + 0.2 * Math.sin(now / 400);
    g.fillStyle(a, gl); g.fillEllipse(x - 14, ry - 2, 10, 3);
  } },
};
