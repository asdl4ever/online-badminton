import { TAU, type RingArt } from './shared';

/** 批十六地环（天竺神话 / 高天原 / 凯尔特 / 美索不达米亚 / 克苏鲁）——原点 (x, feetY) */

export const RINGS_17: Record<string, RingArt> = {
  vdaLotusRing: { c: 0xffb7d5, a: 0xffd45c, draw: (g, now, x, feetY, c, a) => {
    // 莲华地环：脚下一圈莲花瓣，缓缓呼吸
    const ry = feetY - 3;
    g.fillStyle(0x8a2a4a, 0.4); g.fillEllipse(x, ry + 1, 58, 15);
    const pulse = 0.6 + 0.4 * Math.sin(now / 500);
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * TAU + now / 4000;
      const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 7;
      g.fillStyle(k % 2 ? c : 0xff8ab0, 0.9);
      g.fillEllipse(px, py, 7 * pulse + 2, 4);
      g.fillStyle(a, 0.7); g.fillEllipse(px, py - 1, 3, 2);
    }
    g.fillStyle(a, 0.8 * pulse); g.fillEllipse(x, ry, 10, 4);
    g.fillStyle(0xffffff, 0.6 * pulse); g.fillEllipse(x, ry - 1, 4, 2);
  } },
  takShide: { c: 0xfff6d8, a: 0xc0392b, draw: (g, _now, x, feetY, c, a) => {
    // 纸垂地环：脚下一圈神道纸垂（Z 字白纸）+ 注连绳
    const ry = feetY - 3;
    g.fillStyle(0x8a6a3a, 0.4); g.fillEllipse(x, ry + 1, 58, 15);
    g.lineStyle(5, 0xd8c8a0, 0.95); g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26); g.beginPath(); g.arc(0, 0, 28, 0, TAU); g.strokePath(); g.restore();
    g.lineStyle(1.4, 0x8a6a3a, 0.6); g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26); g.beginPath(); g.arc(0, 0, 24, 0, TAU); g.strokePath(); g.restore();
    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * TAU;
      const px = x + Math.cos(ang) * 27, py = ry + Math.sin(ang) * 7;
      g.fillStyle(c, 0.95);
      for (let j = 0; j < 3; j++) g.fillRect(px + (j % 2 ? 1.4 : -1.4), py + j * 3, 1.8, 2.6);
    }
    g.fillStyle(a, 0.9); g.fillCircle(x, ry, 3);
  } },
  celtFairyRing: { c: 0x8fd45a, a: 0xfff6d8, draw: (g, now, x, feetY, c, _a) => {
    // 蘑菇仙环：脚下一圈小蘑菇，菌盖依次呼吸发光
    const ry = feetY - 3;
    g.fillStyle(0x2e4a24, 0.5); g.fillEllipse(x, ry + 1, 58, 15);
    for (let k = 0; k < 9; k++) {
      const ang = (k / 9) * TAU + now / 5000;
      const px = x + Math.cos(ang) * 25, py = ry + Math.sin(ang) * 7;
      const glow = 0.5 + 0.5 * Math.sin(now / 400 + k);
      g.fillStyle(0xe8e0cc, 0.95); g.fillRect(px - 1.2, py - 6, 2.4, 6);
      g.fillStyle(k % 2 ? c : 0xffb7d5, 0.95); g.fillEllipse(px, py - 7, 8, 6);
      g.fillStyle(0xffffff, 0.6); g.fillCircle(px - 2, py - 9, 1.2);
      g.fillStyle(0xd8ff9a, glow * 0.5); g.fillCircle(px, py - 7, 5);
    }
    g.fillStyle(0xffffff, 0.4 + 0.3 * Math.sin(now / 400)); g.fillEllipse(x, ry, 8, 3);
  } },
  mesoCuneiform: { c: 0xd8b45a, a: 0x5a8aff, draw: (g, now, x, feetY, c, a) => {
    // 楔文地环：脚下一圈陶土板，刻楔形文字、蓝光沿文游走
    const ry = feetY - 3;
    g.fillStyle(0x6a4a1a, 0.7); g.fillEllipse(x, ry + 1, 60, 16);
    g.fillStyle(c, 0.9); g.fillEllipse(x, ry, 54, 13);
    const flow = (now / 1400) % 1;
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * TAU;
      const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 6;
      const lit = ((k / 12) - flow + 1) % 1;
      g.fillStyle(0x2a1a0a, 0.85); g.fillTriangle(px - 2, py + 1, px + 2, py + 1, px, py - 3);
      g.fillStyle(a, 0.7 * (1 - lit)); g.fillCircle(px, py - 1, 1.4);
    }
    g.lineStyle(1.4, a, 0.4); g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26); g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.strokePath(); g.restore();
  } },
  cthSigilRing: { c: 0x1e5a4a, a: 0x5fe8c8, draw: (g, now, x, feetY, c, a) => {
    // 黄印地环：脚下一圈黄印符号，符号缓慢转动、幽光呼吸
    const ry = feetY - 3;
    g.fillStyle(0x0a1e18, 0.7); g.fillEllipse(x, ry + 1, 60, 16);
    const rot = now / 3000;
    for (let k = 0; k < 6; k++) {
      const ang = rot + (k / 6) * TAU;
      const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 7;
      g.lineStyle(2, a, 0.8);
      g.beginPath();
      for (let s = 0; s <= 5; s++) {
        const sa = -Math.PI / 2 + (s * 4 * Math.PI) / 5;
        const sx = px + Math.cos(sa) * 6, sy = py + Math.sin(sa) * 4;
        if (s === 0) g.moveTo(sx, sy); else g.lineTo(sx, sy);
      }
      g.closePath(); g.strokePath();
      g.fillStyle(c, 0.9); g.fillCircle(px, py, 1.6);
    }
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(0xfff0a0, 0.5 * gl); g.fillEllipse(x, ry, 10, 4);
    g.fillStyle(0x1a0e2e, 0.9); g.fillCircle(x, ry, 2.4);
  } },
};
