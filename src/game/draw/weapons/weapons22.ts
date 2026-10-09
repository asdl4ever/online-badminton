import { handle, pommel, poly, TAU, type WeaponArt } from './shared';

/** 第八批球拍皮肤（冰海巨兽 / 极夜冰海 / 寒潮海象 / 维度裂隙 / 幽光深渊） */

export const WEAPONS_22: Record<string, WeaponArt> = {
  glacHarpoonRacket: { c: 0xbfe8ff, a: 0x5fd8ff, draw: (g, now, c, a) => {
    // 冰叉·拍：拍框是一枚冰制鱼叉头
    handle(g, -14, -2, 6, 0x8a9aa8);
    pommel(g, -15, 2.6, c);
    g.fillStyle(0x8fd8ff, 0.9); poly(g, [[4, -14], [26, -8], [30, 0], [26, 8], [4, 14]], 0x8fd8ff, 0.9);
    g.fillStyle(c, 1); poly(g, [[7, -11], [24, -6], [27, 0], [24, 6], [7, 11]], c, 1);
    g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 300)); poly(g, [[10, -8], [22, -4], [24, 0], [10, 0]], a, 0.5);
    g.fillStyle(0xffffff, 0.5); g.fillTriangle(10, -8, 20, -2, 12, 0);
    for (let k = 0; k < 3; k++) { g.fillStyle(0xdff4ff, 0.9); g.fillPoints([{ x: 30, y: -6 + k * 6 }, { x: 36, y: -3 + k * 6 }, { x: 30, y: 0 + k * 6 }] as never, true); }
  } },
  glacLeviathanRacket: { c: 0x5fd8ff, a: 0xbfe8ff, draw: (g, now, c, a) => {
    // 利维坦·拍：拍心一颗冰海利维坦之眼，周围浮冰环绕
    handle(g, -14, -2, 6, 0x2a6a8a);
    pommel(g, -15, 2.6, a);
    g.fillStyle(0x0e2a3e, 1); g.fillCircle(16, 0, 16);
    g.fillStyle(c, 0.5); g.fillCircle(16, 0, 14);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU + now / 1200; g.fillStyle(k % 2 ? c : 0xdff4ff, 0.9); g.fillPoints([{ x: 16 + Math.cos(ang) * 14, y: Math.sin(ang) * 14 }, { x: 16 + Math.cos(ang + 0.3) * 19, y: Math.sin(ang + 0.3) * 19 }, { x: 16 + Math.cos(ang + 0.6) * 14, y: Math.sin(ang + 0.6) * 14 }] as never, true); }
    const blink = Math.abs(Math.sin(now / 800)) > 0.1 ? 1 : 0.2;
    g.fillStyle(0xfff0a0, 0.95); g.fillEllipse(16, 0, 18, 12 * blink);
    g.fillStyle(0x1a0e2e, 1); g.fillCircle(16, 0, 4 * blink);
    g.fillStyle(c, 0.9); g.fillCircle(16, 0, 1.8 * blink);
    g.fillStyle(0xffffff, 0.8); g.fillCircle(14.4, -1.4, 1 * blink);
  } },
  fridBarbRacket: { c: 0x7dffd0, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 鮟鱇钓竿·拍：拍柄是一根钓竿，拍端吊着一颗诱饵灯
    handle(g, -14, -2, 5, 0x2a3a44);
    pommel(g, -15, 2.4, a);
    g.lineStyle(3, 0x2a4a4a, 1); g.beginPath(); g.moveTo(2, 0); g.lineTo(20, -2); g.lineTo(24, -14); g.strokePath();
    g.lineStyle(2, c, 0.9); g.beginPath(); g.moveTo(2, 0); g.lineTo(20, -2); g.lineTo(24, -14); g.strokePath();
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(a, 0.35 * gl); g.fillCircle(24, -16, 13);
    g.fillStyle(c, gl); g.fillCircle(24, -16, 5);
    g.fillStyle(0xffffff, 0.9 * gl); g.fillCircle(24, -16, 2);
    g.fillStyle(0x1a3a3a, 0.9); g.fillEllipse(10, 4, 16, 8);
    g.fillStyle(0xe8f4f8, 0.9); for (let k = 0; k < 4; k++) g.fillTriangle(6 + k * 3, 1, 9 + k * 3, 1, 7.5 + k * 3, 5);
  } },
  fridGlowRacket: { c: 0x7dffd0, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 幽光·拍：拍框一圈幽光点，拍心一团深海幽光
    handle(g, -14, -2, 6, 0x1a3a44);
    pommel(g, -15, 2.6, c);
    g.lineStyle(5, c, 0.9); g.strokeCircle(16, 0, 15);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU + now / 1600; g.fillStyle(k % 2 ? a : 0xffffff, 0.5 + 0.5 * Math.abs(Math.sin(now / 300 + k))); g.fillCircle(16 + Math.cos(ang) * 15, Math.sin(ang) * 15, 1.6); }
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(a, 0.4 * gl); g.fillCircle(16, 0, 12);
    g.fillStyle(c, gl); g.fillCircle(16, 0, 6);
    g.fillStyle(0xffffff, 0.8 * gl); g.fillCircle(16, 0, 2.4);
  } },
  walrTuskRacket: { c: 0xe8e0d0, a: 0xd8e8f0, draw: (g, now, c, a) => {
    // 巨牙·拍：拍框是一对交叉的大海象牙
    handle(g, -14, -2, 6, 0x6a5442);
    pommel(g, -15, 2.6, 0x8a705a);
    for (const s of [-1, 1]) { g.fillStyle(c, 1); poly(g, [[6, s * 8], [30, s * 14], [32, s * 2], [10, s * 1]], c, 1); g.fillStyle(a, 0.5); poly(g, [[8, s * 7], [28, s * 11], [29, s * 4], [11, s * 3]], a, 0.5); }
    g.fillStyle(0x6a5442, 1); g.fillRoundedRect(0, -5, 8, 10, 3);
    const gl = 0.5 + 0.5 * Math.sin(now / 300); g.fillStyle(a, 0.3 * gl); g.fillCircle(18, 0, 16);
  } },
  walrHarpoonRacket: { c: 0x8a9aa8, a: 0x8fd8ff, draw: (g, now, _c, a) => {
    // 鱼叉·拍：拍框是一枚三叉鱼叉头
    handle(g, -14, -2, 7, 0x6a4a2a);
    pommel(g, -15, 2.6, 0x8a9aa8);
    g.fillStyle(0x6a7278, 1); g.fillRect(4, -2, 10, 4);
    g.fillStyle(0xd8e0e8, 1); poly(g, [[14, -3], [32, 0], [14, 3]], 0xd8e0e8, 1);
    g.fillStyle(0xd8e0e8, 1); poly(g, [[14, -10], [28, -12], [16, -4]], 0xd8e0e8, 1); poly(g, [[14, 10], [28, 12], [16, 4]], 0xd8e0e8, 1);
    g.fillStyle(0x8fb0c8, 0.6); poly(g, [[16, -2], [30, 0], [16, 2]], 0x8fb0c8, 0.6);
    for (let k = 0; k < 3; k++) { g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 300 + k)); g.fillCircle(32, -6 + k * 6, 1.6); }
  } },
  dimBladeRacket: { c: 0xb08aff, a: 0x7dffd0, draw: (g, now, c, a) => {
    // 维度刃·拍：拍框是一枚撕开空间的维度刃
    handle(g, -14, -2, 6, 0x160e2e);
    pommel(g, -15, 2.6, a);
    g.fillStyle(0x05040f, 1); poly(g, [[4, -16], [30, -10], [34, 0], [30, 10], [4, 16]], 0x05040f, 1);
    g.fillStyle(c, 1); poly(g, [[6, -13], [28, -8], [31, 0], [28, 8], [6, 13]], c, 1);
    for (let arm = 0; arm < 2; arm++) { const off = now / 300 + arm * Math.PI; g.lineStyle(2, a, 0.7); g.beginPath(); for (let s = 0; s <= 6; s++) { const u = s / 6; const ang = off + u * 3; const rr = u * 12; g.lineTo(18 + Math.cos(ang) * rr, Math.sin(ang) * rr); } g.strokePath(); }
    g.fillStyle(0xffffff, 0.8); g.fillCircle(18, 0, 2.4);
  } },
  dimRiftRacket: { c: 0x7dffd0, a: 0xb08aff, draw: (g, now, c, a) => {
    // 裂隙·拍：拍框一圈裂隙环，内部高维星空
    handle(g, -14, -2, 6, 0x160e2e);
    pommel(g, -15, 2.6, c);
    g.lineStyle(4, c, 0.9); g.strokeEllipse(16, 0, 30, 34);
    g.fillStyle(0x05040f, 0.95); g.fillEllipse(16, 0, 24, 28);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU + now / 1400; g.fillStyle(a, 0.8); g.fillRect(16 + Math.cos(ang) * 12 - 2, Math.sin(ang) * 13 - 2, 4, 4); }
    g.fillStyle(0xffffff, 0.7 + 0.3 * Math.sin(now / 300)); g.fillCircle(16, 0, 2.4);
  } },
  hadalJawRacket: { c: 0x2a6a6a, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 巨口·拍：拍框是一张张开的巨口，齿间透幽光
    handle(g, -14, -2, 6, 0x143038);
    pommel(g, -15, 2.6, c);
    const open = 0.5 + 0.5 * Math.sin(now / 500);
    g.fillStyle(c, 1); poly(g, [[4, -16], [30, -4], [30, 4], [4, 16]], c, 1);
    g.fillStyle(0x06141e, 1); g.fillEllipse(16, 0, 24, 8 + open * 8);
    g.fillStyle(a, 0.5 * open); g.fillEllipse(16, 0, 18, 5 + open * 6);
    for (let k = 0; k < 5; k++) { g.fillStyle(0xe8f4f8, 0.95); g.fillTriangle(6 + k * 3, -3, 9 + k * 3, -3, 7.5 + k * 3, 3); g.fillTriangle(6 + k * 3, 3, 9 + k * 3, 3, 7.5 + k * 3, -3); }
    for (let k = 0; k < 3; k++) { g.fillStyle(0x1a3a3a, 0.9); g.fillCircle(28, -6 + k * 6, 2); }
  } },
  hadalAbyssRacket: { c: 0x39ffd0, a: 0x2a6a6a, draw: (g, now, c, a) => {
    // 虚空之口·拍：拍心一颗幽光诱饵核，四周触须环
    handle(g, -14, -2, 6, 0x143038);
    pommel(g, -15, 2.6, a);
    g.fillStyle(0x06141e, 1); g.fillCircle(16, 0, 16);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU + now / 900; const sw = Math.sin(now / 300 + k) * 3; g.lineStyle(3, c, 0.85); g.beginPath(); g.moveTo(16, 0); g.lineTo(16 + Math.cos(ang) * 10, Math.sin(ang) * 10); g.lineTo(16 + Math.cos(ang) * 16 + sw, Math.sin(ang) * 16); g.strokePath(); }
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(c, 0.5 * gl); g.fillCircle(16, 0, 8);
    g.fillStyle(c, gl); g.fillCircle(16, 0, 5);
    g.fillStyle(0xffffff, 0.9 * gl); g.fillCircle(16, 0, 2);
  } },
};
