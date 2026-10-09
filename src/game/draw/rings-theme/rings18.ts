import { TAU, type RingArt } from './shared';

/** 第六批地环（斯拉夫 / 波斯 / 印加 / 波利尼西亚 / 澳洲梦幻时代）——原点 (x, feetY) */

export const RINGS_18: Record<string, RingArt> = {
  slavMossRing: { c: 0x5a8a3a, a: 0x8fd45a, draw: (g, now, x, feetY, c, a) => {
    // 苔藓地环：脚下湿地苔藓 + 落叶，两点蘑菇
    const ry = feetY - 3;
    g.fillStyle(0x2e4a24, 0.55); g.fillEllipse(x, ry + 1, 58, 15);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU; const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 7; g.fillStyle(k % 2 ? c : 0x3a6a2a, 0.8); g.fillEllipse(px, py, 6, 3); }
    for (let k = 0; k < 4; k++) { g.fillStyle(0x8a4a2a, 0.9); g.fillEllipse(x - 12 + k * 8, ry - 2 + Math.sin(now / 500 + k) * 1.5, 5, 2.4); }
    for (const mx of [-8, 9]) { g.fillStyle(0xe8e0cc, 0.95); g.fillRect(x + mx - 1, ry - 6, 2, 6); g.fillStyle(0xff8a6a, 0.95); g.fillEllipse(x + mx, ry - 7, 7, 5); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 400)); g.fillEllipse(x, ry, 20, 6);
  } },
  persAshRing: { c: 0xd8c8a0, a: 0xff8a2a, draw: (g, now, x, feetY, c, a) => {
    // 圣灰地环：脚下香灰 + 数点不灭火星
    const ry = feetY - 3;
    g.fillStyle(0x6a6050, 0.5); g.fillEllipse(x, ry + 1, 60, 16);
    g.fillStyle(c, 0.9); g.fillEllipse(x, ry, 52, 13);
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU; const px = x + Math.cos(ang) * 22, py = ry + Math.sin(ang) * 6; g.fillStyle(0x8a7a5a, 0.6); g.fillEllipse(px, py, 5, 2.4); }
    for (let k = 0; k < 6; k++) { const lit = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k * 1.3)); g.fillStyle(k % 2 ? a : 0xffd45c, lit); g.fillCircle(x - 16 + k * 6, ry - 1, 1.4); }
    g.fillStyle(0xfff0b0, 0.3 + 0.3 * Math.sin(now / 260)); g.fillEllipse(x, ry, 12, 4);
  } },
  incaCornRing: { c: 0xffd45c, a: 0x8fd45a, draw: (g, now, x, feetY, c, a) => {
    // 玉米地环：脚下玉米穗 + 陶土块，穗叶随风摆
    const ry = feetY - 3;
    g.fillStyle(0x6a4a2a, 0.5); g.fillEllipse(x, ry + 1, 58, 15);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU; const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 7;
      g.fillStyle(k % 2 ? c : 0xe8c750, 0.95); g.fillEllipse(px, py - 7, 5, 12);
      g.fillStyle(0x8fd45a, 0.9); g.fillPoints([{ x: px - 4, y: py - 4 }, { x: px - 7, y: py - 12 + Math.sin(now / 400 + k) * 1.5 }, { x: px - 2, y: py - 6 }] as never, true);
      g.fillStyle(0x8fd45a, 0.9); g.fillPoints([{ x: px + 4, y: py - 4 }, { x: px + 7, y: py - 12 - Math.sin(now / 400 + k) * 1.5 }, { x: px + 2, y: py - 6 }] as never, true);
    }
    for (let k = 0; k < 5; k++) { g.fillStyle(0x9a6a3a, 0.8); g.fillEllipse(x - 14 + k * 7, ry + 5, 5, 3); }
    g.fillStyle(a, 0.4); g.fillEllipse(x, ry, 18, 6);
  } },
  polyShellRing: { c: 0xffe0c0, a: 0x5fe8d0, draw: (g, now, x, feetY, c, a) => {
    // 贝壳地环：脚下沙圈 + 半圈贝壳，细沙轻扬
    const ry = feetY - 3;
    g.fillStyle(0xd8c8a0, 0.5); g.fillEllipse(x, ry + 1, 60, 16);
    g.fillStyle(c, 0.85); g.fillEllipse(x, ry, 50, 13);
    for (let k = 0; k < 7; k++) { const ang = Math.PI * 0.1 + (k / 6) * Math.PI * 0.8; const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 7; g.fillStyle(k % 2 ? 0xffb7a0 : 0xffe8d0, 0.95); g.fillPoints([{ x: px, y: py - 6 }, { x: px - 5, y: py + 2 }, { x: px + 5, y: py + 2 }] as never, true); g.lineStyle(0.9, 0xb89070, 0.7); g.lineBetween(px, py - 5, px, py + 1); }
    for (let k = 0; k < 5; k++) { const ph = ((now / 900 + k / 5) % 1); g.fillStyle(a, (1 - ph) * 0.6); g.fillCircle(x - 14 + k * 7, ry - ph * 12, 1.4); }
    g.fillStyle(0xffffff, 0.25); g.fillEllipse(x, ry, 40, 10);
  } },
  auzOchreRing: { c: 0xc0703a, a: 0xffd45c, draw: (g, now, x, feetY, c, a) => {
    // 赭石地环：脚下掌印点画圈（红土色），微尘轻扬
    const ry = feetY - 3;
    g.fillStyle(0x8a4426, 0.5); g.fillEllipse(x, ry + 1, 60, 16);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU; const px = x + Math.cos(ang) * 25, py = ry + Math.sin(ang) * 7;
      g.fillStyle(k % 2 ? c : 0xa8542e, 0.85); g.fillEllipse(px, py, 5, 2.6);
      g.fillStyle(0x6a3018, 0.7); g.fillCircle(px, py, 1.4);
    }
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU + now / 2600; const px = x + Math.cos(ang) * 14, py = ry + Math.sin(ang) * 4; g.fillStyle(k % 2 ? a : 0xffe0a0, 0.8); g.fillCircle(px, py, 1.4); }
    for (let k = 0; k < 4; k++) { const ph = ((now / 1100 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.5); g.fillCircle(x - 12 + k * 8, ry - ph * 10, 1.2); }
  } },
};
