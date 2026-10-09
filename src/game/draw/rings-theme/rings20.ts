import { TAU, type RingArt } from './shared';

/** 第八批地环（冰海巨兽 / 极夜冰海 / 寒潮海象 / 维度裂隙 / 幽光深渊）——原点 (x, feetY) */

export const RINGS_20: Record<string, RingArt> = {
  glacIceRing: { c: 0x5fd8ff, a: 0xbfe8ff, draw: (g, now, x, feetY, c, a) => {
    // 冰裂地环：脚下冰面裂开、缝里透蓝光
    const ry = feetY - 3;
    g.fillStyle(0x0e2a3e, 0.5); g.fillEllipse(x, ry + 1, 58, 15);
    g.fillStyle(0xbfe8ff, 0.45); g.fillEllipse(x, ry, 54, 13);
    g.lineStyle(1.8, c, 0.6 + 0.3 * Math.sin(now / 400));
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; const px = x + Math.cos(ang) * 26, py = ry + Math.sin(ang) * 7; g.lineBetween(x, ry, px, py); g.lineBetween(px, py, px + Math.cos(ang + 0.5) * 9, py + Math.sin(ang + 0.5) * 5); }
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 300 + k)); g.fillCircle(x + Math.cos(ang) * 26, ry + Math.sin(ang) * 7, 2); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 260)); g.fillEllipse(x, ry, 12, 4);
  } },
  fridGlowRing: { c: 0x7dffd0, a: 0x39ffd0, draw: (g, now, x, feetY, c, a) => {
    // 幽光地环：脚下一圈幽光点，像深海里的一圈浮游
    const ry = feetY - 3;
    g.fillStyle(0x06141e, 0.55); g.fillEllipse(x, ry + 1, 60, 16);
    for (let k = 0; k < 14; k++) { const ang = (k / 14) * TAU; const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 7; const on = 0.3 + 0.7 * Math.abs(Math.sin(now / 400 + k * 1.3)); g.fillStyle(k % 2 ? c : a, 0.8 * on); g.fillCircle(px, py, 2.4); g.fillStyle(a, 0.3 * on); g.fillCircle(px, py, 5); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, ry, 14, 4);
  } },
  walrShellRing: { c: 0xd8e8f0, a: 0x8fd8ff, draw: (g, now, x, feetY, c, a) => {
    // 贝壳冰环：脚下一圈贝壳与薄冰
    const ry = feetY - 3;
    g.fillStyle(0x8fd8ff, 0.4); g.fillEllipse(x, ry + 1, 60, 16);
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU; const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 7; g.fillStyle(k % 2 ? c : 0xb8c8d0, 0.95); g.fillPoints([{ x: px, y: py - 6 }, { x: px - 5, y: py + 2 }, { x: px + 5, y: py + 2 }] as never, true); g.lineStyle(0.9, 0x8a9aa8, 0.6); g.lineBetween(px, py - 5, px, py + 1); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, ry, 16, 5);
  } },
  dimSigilRing: { c: 0xb08aff, a: 0x7dffd0, draw: (g, now, x, feetY, c, a) => {
    // 维度刻纹地环：脚下一圈几何刻纹，缓慢旋转
    const ry = feetY - 3;
    g.fillStyle(0x0a0618, 0.7); g.fillEllipse(x, ry + 1, 60, 16);
    const rot = now / 2400;
    g.lineStyle(2, c, 0.7); g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.28); g.beginPath(); g.arc(0, 0, 27, 0, TAU); g.strokePath(); g.restore();
    for (let k = 0; k < 8; k++) { const ang = rot + (k / 8) * TAU; const px = x + Math.cos(ang) * 26, py = ry + Math.sin(ang) * 7; g.save(); g.translateCanvas(px, py); g.rotateCanvas(ang); g.fillStyle(a, 0.85); g.fillPoints([{ x: 0, y: -4 }, { x: 4, y: 0 }, { x: 0, y: 4 }, { x: -4, y: 0 }] as never, true); g.restore(); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 260)); g.fillEllipse(x, ry, 8, 3);
  } },
  hadalTeethRing: { c: 0x39ffd0, a: 0x2a6a6a, draw: (g, now, x, feetY, c, a) => {
    // 齿牙地环：脚下一圈尖牙，牙缝透幽光
    const ry = feetY - 3;
    g.fillStyle(0x06141e, 0.6); g.fillEllipse(x, ry + 1, 60, 16);
    g.fillStyle(c, 0.25); g.fillEllipse(x, ry, 46, 11);
    for (let k = 0; k < 14; k++) { const ang = (k / 14) * TAU; const px = x + Math.cos(ang) * 25, py = ry + Math.sin(ang) * 7; g.fillStyle(0xe8f4f8, 0.95); g.fillTriangle(px - 2.4, py + 1, px + 2.4, py + 1, px, py - 6); g.fillStyle(a, 0.5 + 0.5 * Math.abs(Math.sin(now / 400 + k))); g.fillCircle(px, py + 1, 1.2); }
    g.fillStyle(a, 0.45 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, ry, 14, 4);
  } },
};
