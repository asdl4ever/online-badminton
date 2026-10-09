import { handle, pommel, poly, line, TAU, type WeaponArt } from './shared';

/** 批十六球拍皮肤（天竺神话 / 高天原 / 凯尔特 / 美索不达米亚 / 克苏鲁） */

export const WEAPONS_19: Record<string, WeaponArt> = {
  vdaVajra: { c: 0xffd45c, a: 0x7fd4ff, draw: (g, now, c, a) => {
    // 金刚杵·拍：拍面化作一柄金刚杵，两端尖刃、杵身带电光
    handle(g, -14, -2, 6, 0x8a5a1a);
    pommel(g, -15, 2.6, 0xff7a2a);
    g.fillStyle(c, 1); g.fillRoundedRect(0, -6, 14, 12, 3);
    for (const s of [-1, 1]) {
      g.fillStyle(c, 1);
      poly(g, [[10, s * 5], [24, s * 13], [32, s * 4], [22, s * 1]], c, 1);
      g.fillStyle(0xb87a1a, 0.7); poly(g, [[12, s * 5], [22, s * 11], [26, s * 6], [18, s * 3]], 0xb87a1a, 0.6);
      g.lineStyle(1.8, a, 0.6 + 0.3 * Math.sin(now / 180 + s)); line(g, [[24, s * 13], [32, s * 4]], 1.8, a, 0.8);
    }
    g.fillStyle(0xff5a2a, 0.9); g.fillCircle(16, 0, 3);
    g.fillStyle(0xffffff, 0.7 + 0.3 * Math.sin(now / 150)); g.fillCircle(16, 0, 1.4);
  } },
  vdaLotusRacket: { c: 0xffb7d5, a: 0xffd45c, draw: (g, now, c, a) => {
    // 莲花·拍：拍面化作一朵盛开的莲花
    handle(g, -14, -2, 6, 0x2f7a4a);
    pommel(g, -15, 2.4, a);
    g.fillStyle(0x3f9a5a, 0.95); poly(g, [[0, 0], [10, -12], [16, 0], [10, 12]], 0x3f9a5a, 0.95);
    for (let k = 0; k < 6; k++) {
      const ang = -Math.PI / 2 + (k / 5) * Math.PI;
      const px = 16 + Math.cos(ang) * 12, py = Math.sin(ang) * 13;
      g.fillStyle(k % 2 ? c : 0xff8ab0, 0.95);
      poly(g, [[16, 0], [px - 5, py - 3], [px, py], [px + 5, py - 3]], k % 2 ? c : 0xff8ab0, 0.95);
    }
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(a, gl); g.fillCircle(16, 0, 4);
    g.fillStyle(0xffffff, gl * 0.9); g.fillCircle(15, -1, 1.8);
  } },
  takKagura: { c: 0xffd45c, a: 0xc0392b, draw: (g, now, c, a) => {
    // 神乐铃·拍：拍面化作一只神乐铃
    handle(g, -14, -2, 6, 0x8a5a2a);
    pommel(g, -15, 2.4, 0xff5a5a);
    g.fillStyle(0x8a5a2a, 1); g.fillRect(2, -2, 8, 4);
    g.fillStyle(c, 1);
    poly(g, [[8, -14], [24, -12], [28, 0], [24, 12], [8, 14]], c, 1);
    g.fillStyle(0xfff6d8, 0.6); g.fillRect(10, 4, 16, 3);
    g.fillStyle(a, 1); g.fillCircle(18, 0, 3);
    const ring = 0.5 + 0.5 * Math.sin(now / 200);
    g.lineStyle(1.4, a, ring * 0.6); g.beginPath(); g.arc(18, 0, 12, -1.1, 1.1); g.strokePath();
    g.lineStyle(1.4, a, ring * 0.6); g.beginPath(); g.arc(18, 0, 12, Math.PI - 1.1, Math.PI + 1.1); g.strokePath();
    for (let k = 0; k < 3; k++) { g.fillStyle(0xfff6d8, 0.9); g.fillRect(30 + k * 2, -6 + k * 5, 2, 3); }
  } },
  takThunderRacket: { c: 0xc0392b, a: 0xffd45c, draw: (g, now, c, a) => {
    // 雷鼓·拍：拍面化作一面雷神太鼓，鼓面游电
    handle(g, -14, -2, 6, 0x8a5a2a);
    pommel(g, -15, 2.6, a);
    g.fillStyle(0x6a3a1a, 1); g.fillEllipse(18, 0, 26, 30);
    g.fillStyle(c, 1); g.fillEllipse(18, 0, 21, 25);
    g.lineStyle(2, a, 0.9); g.fillStyle(0xfff0b0, 1); g.fillCircle(18, 0, 4);
    for (let k = 0; k < 6; k++) { g.lineStyle(1.4, a, 0.7); const ang = (k / 6) * TAU; g.lineBetween(18 + Math.cos(ang) * 4, Math.sin(ang) * 4, 18 + Math.cos(ang) * 19, Math.sin(ang) * 23); }
    const flick = 0.4 + 0.6 * Math.abs(Math.sin(now / 130));
    g.lineStyle(2, a, flick); g.beginPath(); g.moveTo(6, -14); g.lineTo(14, -6); g.lineTo(10, -2); g.lineTo(22, 8); g.strokePath();
    g.fillStyle(0x3a2412, 1); g.fillRect(3, -2, 6, 4);
  } },
  celtOakStaff: { c: 0x6a4a2a, a: 0x8fd45a, draw: (g, now, c, a) => {
    // 橡木法杖·拍：拍面化作扭结的橡木杖头，缠藤发绿光
    handle(g, -14, -2, 6, 0x4a3420);
    pommel(g, -15, 2.4, 0x8a6a3a);
    g.fillStyle(c, 1); g.fillRoundedRect(2, -4, 10, 8, 3);
    g.fillStyle(c, 1);
    poly(g, [[10, -12], [26, -10], [32, -2], [28, 8], [14, 12], [8, 2]], c, 1);
    g.fillStyle(0x4a3420, 0.7); g.fillEllipse(20, -2, 6, 10);
    g.lineStyle(1.8, a, 0.7 + 0.3 * Math.sin(now / 300));
    g.beginPath(); g.moveTo(6, -8); g.lineTo(14, 0); g.lineTo(10, 6); g.lineTo(22, 8); g.strokePath();
    for (let k = 0; k < 3; k++) {
      g.fillStyle(0x3f9a5a, 0.9);
      g.fillEllipse(24 + k * 3, -10 + k * 6, 8, 4);
    }
    g.fillStyle(a, 0.8); g.fillCircle(12, -2, 2.4);
  } },
  celtRunestone: { c: 0x9a9a8a, a: 0x8fd45a, draw: (g, now, c, a) => {
    // 符文石·拍：拍面化作一块刻符立石
    handle(g, -14, -2, 6, 0x4a3420);
    pommel(g, -15, 2.4, 0x8a6a3a);
    g.fillStyle(0x6a6a5a, 1); poly(g, [[2, -16], [24, -14], [32, 0], [24, 14], [2, 16]], 0x6a6a5a, 1);
    g.fillStyle(c, 1); poly(g, [[5, -13], [22, -11], [28, 0], [22, 11], [5, 13]], c, 1);
    for (let k = 0; k < 4; k++) {
      const lit = 0.3 + 0.7 * Math.max(0, Math.sin(now / 400 - k * 0.6));
      g.lineStyle(1.8, a, lit);
      g.lineBetween(9, -7 + k * 5, 22, -7 + k * 5);
      g.lineBetween(13, -9 + k * 5, 13, -5 + k * 5);
    }
    g.fillStyle(a, 0.4); g.fillEllipse(16, 14, 22, 5);
  } },
  mesoTreeLife: { c: 0xd8b45a, a: 0x5a8aff, draw: (g, now, c, a) => {
    // 生命树·拍：拍面化作一棵对称的生命树
    handle(g, -14, -2, 6, 0x6a4a2a);
    pommel(g, -15, 2.4, 0x5a8aff);
    g.fillStyle(c, 1); g.fillRect(15, 2, 4, 12);
    for (let k = 0; k < 3; k++) {
      const yy = -12 + k * 7;
      const w = 10 - k * 2;
      g.fillStyle(k % 2 ? c : 0xffd45c, 0.95);
      poly(g, [[18, yy - 8], [18 + w, yy], [18, yy + 4], [18 - w, yy]], k % 2 ? c : 0xffd45c, 0.95);
    }
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(a, gl); g.fillCircle(18, -14, 3);
    g.fillStyle(0xffffff, gl * 0.8); g.fillCircle(17.5, -14.5, 1.2);
    g.fillStyle(0x5a8aff, 0.7); g.fillEllipse(16, 14, 20, 5);
  } },
  mesoWarAxe: { c: 0x5a8aff, a: 0xd8b45a, draw: (g, now, c, a) => {
    // 战斧·拍：拍面化作月牙战斧，刃口反光
    handle(g, -14, -2, 7, 0x4a3420);
    pommel(g, -15, 2.6, 0xd8b45a);
    g.fillStyle(0x8a6a2a, 1); g.fillRect(4, -3, 6, 6);
    g.fillStyle(c, 1);
    poly(g, [[10, -18], [28, -10], [34, 0], [28, 10], [10, 18], [16, 0]], c, 0.95);
    g.fillStyle(0x8fb4ff, 0.6); poly(g, [[14, -14], [28, -8], [32, 0], [26, -2]], 0x8fb4ff, 0.6);
    g.lineStyle(2, a, 0.8 + 0.2 * Math.sin(now / 200)); line(g, [[10, -18], [34, 0], [10, 18]], 2, a, 0.85);
    g.fillStyle(a, 0.9); g.fillCircle(10, 0, 3);
  } },
  cthTentacleRacket: { c: 0x1e5a4a, a: 0x5fe8c8, draw: (g, now, c, a) => {
    // 触须·拍：拍面化作一束扭动的触手 + 吸盘
    handle(g, -14, -2, 6, 0x0e2a24);
    pommel(g, -15, 2.4, 0x7a4aa8);
    for (let k = 0; k < 5; k++) {
      const ang = -0.9 + k * 0.45;
      g.lineStyle(5 - k * 0.3, c, 0.95);
      g.beginPath(); g.moveTo(0, 0);
      for (let s = 1; s <= 3; s++) { const t = s / 3; g.lineTo(6 + Math.cos(ang) * 30 * t + Math.sin(now / 300 + k + s) * 4, Math.sin(ang) * 20 * t); }
      g.strokePath();
      g.fillStyle(0x0e2a24, 0.9);
      for (let s = 1; s <= 2; s++) g.fillCircle(6 + Math.cos(ang) * 30 * (s / 3), Math.sin(ang) * 20 * (s / 3), 1.6);
    }
    g.fillStyle(a, 0.9); g.fillCircle(4, 0, 3);
  } },
  cthBoneStaff: { c: 0xd8e0d0, a: 0x7a4aa8, draw: (g, now, c, a) => {
    // 旧日骨杖·拍：拍面化作一柄骨杖，顶端簇生利齿
    handle(g, -14, -2, 6, 0x2a2a24);
    pommel(g, -15, 2.4, 0x7a4aa8);
    g.fillStyle(c, 1); g.fillRoundedRect(2, -3, 26, 6, 3);
    g.fillStyle(c, 1); g.fillEllipse(12, 0, 16, 14);
    for (let k = 0; k < 6; k++) {
      const ang = -Math.PI / 2 + (k / 5) * Math.PI;
      g.fillStyle(0xf0f4f8, 0.95);
      g.fillTriangle(12 + Math.cos(ang) * 8, Math.sin(ang) * 7, 12 + Math.cos(ang) * 12, Math.sin(ang) * 11, 12 + Math.cos(ang) * 8 - 2, Math.sin(ang) * 7 - 2);
    }
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(a, gl); g.fillCircle(12, 0, 3.4);
    g.fillStyle(0xffffff, gl * 0.8); g.fillCircle(11, -1, 1.2);
    g.fillStyle(0x1a0e2e, 1); g.fillCircle(12, 0, 1.4);
  } },
};
