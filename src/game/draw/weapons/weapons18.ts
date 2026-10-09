import { handle, pommel, poly, line, TAU, type WeaponArt } from './shared';

/** 批十五球拍皮肤（基多拉 / 魔斯拉 / 机甲战队 / 火山泰坦 / 深海巨妖） */

export const WEAPONS_18: Record<string, WeaponArt> = {
  ghidRacketA: { c: 0xd9b45c, a: 0xffe15c, draw: (g, now, c, a) => {
    // 龙牙·拍：拍面化作一颗巨龙的獠牙弯刃
    handle(g, -14, -2, 6, 0x6a5418);
    pommel(g, -15, 2.6, a);
    g.fillStyle(c, 1);
    poly(g, [[-1, -8], [10, -16], [26, -8], [30, 2], [24, 12], [8, 12], [-1, 6]], c, 1);
    g.fillStyle(0xb8943a, 0.7);
    poly(g, [[2, -6], [11, -12], [22, -6], [14, -2]], 0xb8943a, 0.6);
    g.lineStyle(2.4, a, 0.9); // 牙尖高光
    line(g, [[10, -16], [26, -8], [30, 2]], 2.4, a, 0.9);
    for (let k = 0; k < 3; k++) { const ph = ((now / 300 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(30 + ph * 4, 2 - k * 4, 1.4); }
  } },
  ghidRacketB: { c: 0xffe15c, a: 0x7fd4ff, draw: (g, now, c, a) => {
    // 雷霆龙首·拍：拍面化作一颗会吐电的龙首
    handle(g, -14, -2, 6, 0x6a5418);
    pommel(g, -15, 2.6, 0xb8943a);
    g.fillStyle(c, 1); g.fillEllipse(12, 0, 30, 22);
    g.fillStyle(0xb8943a, 1); g.fillTriangle(6, -8, 12, -8, 2, -22);
    g.fillStyle(0x6a5418, 1); g.fillRoundedRect(16, 2, 14, 6, 2); // 吻
    for (let k = 0; k < 4; k++) { g.fillStyle(0xf0f4f8, 0.95); g.fillTriangle(16 + k * 3, 6, 18 + k * 3, 6, 17 + k * 3, 10); }
    g.fillStyle(a, 0.9); g.fillCircle(12, -3, 2.6); g.fillStyle(0x1a1a1e, 1); g.fillCircle(12.6, -3, 1);
    const flick = 0.5 + 0.5 * Math.sin(now / 120);
    g.lineStyle(1.8, a, flick); g.beginPath(); g.moveTo(28, 2); g.lineTo(36, -2); g.lineTo(32, 0); g.lineTo(40, -6); g.strokePath();
  } },
  mthrRacketA: { c: 0xffe66a, a: 0xbfe8ff, draw: (g, _now, c, _a) => {
    // 羽蛾·拍：拍面化作一片羽状蛾翅
    handle(g, -14, -2, 6, 0x4a3a2a);
    pommel(g, -15, 2.4, 0x8a6a1a);
    g.fillStyle(c, 1);
    poly(g, [[-1, -4], [10, -16], [26, -12], [31, 0], [26, 12], [10, 16], [-1, 4]], c, 0.95);
    g.fillStyle(0xd8c65a, 0.7);
    for (let k = 0; k < 4; k++) poly(g, [[4, -8 + k * 5], [24, -10 + k * 6], [26, -6 + k * 6], [5, -4 + k * 5]], 0xd8c65a, 0.6);
    g.fillStyle(0x4a3a2a, 0.9); g.fillCircle(12, 0, 5);
    g.fillStyle(0xbfe8ff, 0.9); g.fillCircle(11, -1, 2);
  } },
  mthrRacketB: { c: 0xbfe8ff, a: 0xffe66a, draw: (g, now, c, a) => {
    // 月鳞·拍：拍面化作一枚月牙鳞刃 + 环月辉光
    handle(g, -14, -2, 6, 0x2a3a2a);
    pommel(g, -15, 2.4, 0x8a6a1a);
    g.fillStyle(c, 1);
    poly(g, [[2, -14], [24, -8], [28, 0], [24, 8], [2, 14], [10, 0]], c, 0.95);
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(a, gl); g.fillCircle(16, 0, 5.4);
    g.fillStyle(0x3a4a2a, 1); g.fillCircle(18, -1, 4.4);
    g.lineStyle(1.8, 0xe8f6ff, 0.8); line(g, [[2, -14], [24, -8], [28, 0]], 1.8, 0xe8f6ff, 0.8);
  } },
  tksRacketA: { c: 0x5ac8ff, a: 0xff4a4a, draw: (g, now, c, a) => {
    // 剑刃·拍：拍面化作一把能量剑刃
    handle(g, -14, -2, 6, 0x2a3244);
    pommel(g, -15, 2.6, 0x8a94a2);
    g.fillStyle(0x8a94a2, 1); g.fillPoints([{ x: -1, y: -4 }, { x: 6, y: -6 }, { x: 6, y: 6 }, { x: -1, y: 4 }] as never, true);
    g.fillStyle(c, 1);
    poly(g, [[4, -6], [30, -3], [36, 0], [30, 3], [4, 6], [10, 0]], c, 0.95);
    g.fillStyle(0xd8f2ff, 0.7); poly(g, [[6, -3], [30, -1.6], [33, 0], [6, 1.6]], 0xd8f2ff, 0.6);
    g.lineStyle(2, a, 0.6 + 0.3 * Math.sin(now / 200)); g.lineBetween(4, 0, 34, 0);
    g.fillStyle(a, 0.9); g.fillRect(-1, -2, 4, 4);
  } },
  tksRacketB: { c: 0xff4a4a, a: 0x5ac8ff, draw: (g, now, c, a) => {
    // 合体炮·拍：拍面化作一门机炮，炮口蓄能
    handle(g, -14, -2, 7, 0x2a3244);
    pommel(g, -15, 2.6, 0x8a94a2);
    g.fillStyle(0x3f4a62, 1); poly(g, [[-1, -12], [14, -16], [26, -8], [26, 8], [14, 16], [-1, 12]], 0x3f4a62, 1);
    g.fillStyle(c, 1); g.fillRoundedRect(6, -14, 12, 28, 4);
    for (let k = 0; k < 3; k++) { g.fillStyle(0x8a94a2, 1); g.fillRect(8, -10 + k * 9, 8, 2.4); }
    g.fillStyle(0x1a2436, 1); g.fillRoundedRect(22, -8, 10, 16, 3);
    const charge = 0.6 + 0.4 * Math.sin(now / 220);
    g.fillStyle(a, charge); g.fillCircle(28, 0, 4.4);
    g.fillStyle(0xffffff, charge * 0.9); g.fillCircle(28, 0, 1.8);
    for (let k = 0; k < 3; k++) { g.lineStyle(2 - k * 0.4, a, charge * (0.7 - k * 0.15)); g.beginPath(); g.arc(28, 0, 6 + k * 4, 0, TAU); g.strokePath(); }
  } },
  titanRacketA: { c: 0x6a4a3a, a: 0xff6a2a, draw: (g, now, c, a) => {
    // 岩锤·拍：拍面化作一把火山岩巨锤
    handle(g, -14, -2, 7, 0x3a2418);
    pommel(g, -15, 2.8, 0x8a7a6a);
    g.fillStyle(c, 1); poly(g, [[0, -15], [22, -13], [28, 0], [22, 13], [0, 15]], c, 1);
    g.fillStyle(0x4a3326, 0.8); poly(g, [[4, -10], [20, -8], [22, 0], [6, 0]], 0x4a3326, 0.6);
    g.lineStyle(2, 0x2a1a12, 1);
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(6 + k * 6, -12); g.lineTo(9 + k * 6, 0); g.lineTo(6 + k * 6, 12); g.strokePath(); }
    const heat = 0.55 + 0.45 * Math.sin(now / 280);
    g.lineStyle(1.4, a, heat);
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(6 + k * 6, -12); g.lineTo(9 + k * 6, 0); g.lineTo(6 + k * 6, 12); g.strokePath(); }
    g.fillStyle(a, heat); g.fillCircle(14, 0, 3.4);
    g.fillStyle(0xffffff, heat * 0.8); g.fillCircle(14, 0, 1.4);
  } },
  titanRacketB: { c: 0xff6a2a, a: 0xffd45c, draw: (g, now, _c, a) => {
    // 熔岩爪·拍：拍面化作一只熔岩巨爪，指尖滴熔珠
    handle(g, -14, -2, 7, 0x3a2418);
    pommel(g, -15, 2.8, 0x8a7a6a);
    g.fillStyle(0x3a1c12, 1); g.fillEllipse(6, 0, 18, 22);
    for (let k = 0; k < 4; k++) {
      const ang = -0.9 + k * 0.6;
      g.lineStyle(6, 0x5a2a1a, 1); g.lineBetween(8, -6 + k * 4, 8 + Math.cos(ang) * 22, -6 + k * 4 + Math.sin(ang) * 14);
      g.fillStyle(a, 0.9); g.fillTriangle(8 + Math.cos(ang) * 26, -6 + k * 4 + Math.sin(ang) * 16, 8 + Math.cos(ang) * 26 - 3, -6 + k * 4 + Math.sin(ang) * 16 + 4, 8 + Math.cos(ang) * 26 + 3, -6 + k * 4 + Math.sin(ang) * 16 - 3);
    }
    for (let k = 0; k < 3; k++) { const ph = ((now / 800 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.9); g.fillEllipse(24 + k * 4, 8 + ph * 12, 2, 3.6); }
  } },
  leviRacketA: { c: 0x5fe8d0, a: 0x9b6aff, draw: (g, now, c, a) => {
    // 触手·拍：拍面化作一束扭动的触手 + 吸盘
    handle(g, -14, -2, 6, 0x0e2e2e);
    pommel(g, -15, 2.4, 0x8a6aaa);
    for (let k = 0; k < 5; k++) {
      const ang = -0.9 + k * 0.45;
      g.lineStyle(5 - k * 0.3, c, 0.95);
      g.beginPath(); g.moveTo(0, 0);
      for (let s = 1; s <= 3; s++) { const t = s / 3; g.lineTo(Math.cos(ang) * 30 * t + Math.sin(now / 300 + k + s) * 4, Math.sin(ang) * 20 * t); }
      g.strokePath();
      g.fillStyle(0x1a5a52, 1);
      for (let s = 1; s <= 2; s++) g.fillCircle(Math.cos(ang) * 30 * (s / 3), Math.sin(ang) * 20 * (s / 3), 1.6);
    }
    g.fillStyle(a, 0.9); g.fillCircle(4, 0, 3);
  } },
  leviRacketB: { c: 0x9b6aff, a: 0x5fe8d0, draw: (g, _now, c, a) => {
    // 巨颚·拍：拍面化作一张咬合的深渊巨颚
    handle(g, -14, -2, 6, 0x0e2e3a);
    pommel(g, -15, 2.4, 0x8a6aaa);
    g.fillStyle(c, 1); poly(g, [[-1, 0], [10, -18], [28, -10], [32, -2], [12, -2]], c, 1);
    g.fillStyle(0x5a4a7a, 1); poly(g, [[-1, 0], [10, 18], [28, 10], [32, 2], [12, 2]], 0x5a4a7a, 1);
    for (let k = 0; k < 6; k++) { g.fillStyle(0xe8f6ff, 0.95); g.fillTriangle(10 + k * 3.4, -2, 12 + k * 3.4, -2, 11 + k * 3.4, -7); g.fillTriangle(10 + k * 3.4, 2, 12 + k * 3.4, 2, 11 + k * 3.4, 7); }
    g.fillStyle(a, 0.9); g.fillCircle(8, 0, 3);
    g.fillStyle(0xffffff, 0.5); g.fillCircle(7, -1, 1);
  } },
};
