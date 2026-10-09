import { handle, pommel, TAU, type WeaponArt } from './shared';

/** 第十批球拍皮肤（梦境 / 微观 / 炼金 / 毛线 / 画中世界）——柄在 x∈[-13,-2]，拍框中心 ≈(9,0) */

export const WEAPONS_24: Record<string, WeaponArt> = {
  // ── 梦境回廊 ──
  dreamPillow: { c: 0xb8a8e8, a: 0xfff4d8, draw: (g, now, c, a) => {
    // 枕头·拍
    handle(g, -14, -2, 6, 0x8a78c8); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillRoundedRect(-6, -14, 30, 28, 10);
    g.fillStyle(a, 0.5); g.fillRoundedRect(-4, -10, 26, 20, 8);
    g.lineStyle(1.4, 0x8a78c8, 0.7); g.beginPath(); for (let k = 0; k < 4; k++) g.lineBetween(-2 + k * 6, -12, -2 + k * 6, 12); g.strokePath();
    for (let k = 0; k < 2; k++) { const ph = ((now / 1000 + k / 2) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillEllipse(6 + k * 8, -16 - ph * 12, 4, 2); }
  } },
  dreamSpiralRacket: { c: 0x9f8aff, a: 0xffe08a, draw: (g, now, c, a) => {
    // 螺旋·拍
    handle(g, -14, -2, 6, 0x6a5a9a); pommel(g, -15, 2.6, c);
    const rot = now / 1200;
    for (let k = 0; k < 9; k++) { const ang = k * 0.7 + rot; const rr = 3 + k; g.fillStyle(k % 2 ? c : 0x7a6ab0, 1); g.fillRect(9 + Math.cos(ang) * rr - 3, Math.sin(ang) * rr - 1.5, 8, 3); }
    g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 300)); g.fillCircle(9, 0, 3);
  } },
  dreamSheepRacket: { c: 0xf0f0e8, a: 0xffd8e8, draw: (g, now, c, a) => {
    // 绵羊·拍
    handle(g, -14, -2, 6, 0x8a78c8); pommel(g, -15, 2.6, c);
    g.fillStyle(0xd8d8d0, 1); g.fillCircle(9, 0, 15);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU; g.fillStyle(c, 1); g.fillCircle(9 + Math.cos(ang) * 12, Math.sin(ang) * 12, 5.4); }
    const blink = Math.sin(now / 1300) > 0.92 ? 0.2 : 1; g.fillStyle(0x3a3a3a, 1); g.fillEllipse(5, -1, 2.4, 2.4 * blink); g.fillEllipse(13, -1, 2.4, 2.4 * blink);
    g.fillStyle(a, 0.5); g.fillCircle(9, -6, 2);
  } },
  dreamBubbleRacket: { c: 0x9f8aff, a: 0xfff4d8, draw: (g, now, c, a) => {
    // 泡泡·拍
    handle(g, -14, -2, 6, 0x8a78c8); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 0.25); g.fillCircle(9, 0, 15);
    g.lineStyle(2, c, 0.8); g.strokeCircle(9, 0, 14);
    g.fillStyle(0xffffff, 0.6); g.fillEllipse(4, -5, 5, 3);
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.lineStyle(1.2, a, (1 - ph) * 0.8); g.strokeCircle(9, 0, 14 + ph * 8); }
  } },
  // ── 微观世界 ──
  microDnaRacket: { c: 0x5fe8d0, a: 0x39ffd0, draw: (g, now, c, a) => {
    // DNA·拍：双螺旋缠绕拍框
    handle(g, -14, -2, 6, 0x2a7a8a); pommel(g, -15, 2.6, c);
    const rot = now / 700;
    for (const side of [0, Math.PI]) { g.lineStyle(3, c, 0.95); g.beginPath(); for (let k = 0; k <= 20; k++) { const yy = -14 + k * 1.4; const xx = 9 + Math.sin(k * 0.6 + rot + side) * 13; if (k === 0) g.moveTo(xx, yy); else g.lineTo(xx, yy); } g.strokePath(); }
    for (let k = 0; k < 6; k++) { const yy = -12 + k * 5; const p = Math.sin(k * 0.6 + rot); g.fillStyle(k % 2 ? a : 0xff8ad4, 0.7 + 0.3 * Math.abs(p)); g.fillCircle(9 + p * 13, yy, 1.6); }
  } },
  microCellRacket: { c: 0x5fe8d0, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 细胞·拍
    handle(g, -14, -2, 6, 0x2a7a8a); pommel(g, -15, 2.6, c);
    const br = Math.sin(now / 500) * 1.5;
    g.fillStyle(0x2a7a8a, 1); g.fillEllipse(9, 0, 30 + br, 28 + br);
    g.fillStyle(c, 0.85); g.fillEllipse(9, 0, 26 + br, 24 + br);
    g.fillStyle(a, 0.8); g.fillCircle(6, -2, 5);
    for (let k = 0; k < 4; k++) { const ang = (k / 4) * TAU + now / 1500; g.fillStyle(0xffffff, 0.6); g.fillCircle(9 + Math.cos(ang) * 9, Math.sin(ang) * 8, 1.6); }
  } },
  microSpikeRacket: { c: 0x5fe8d0, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 刺突·拍
    handle(g, -14, -2, 6, 0x2a7a8a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillCircle(9, 0, 13);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU; const px = 9 + Math.cos(ang) * 14, py = Math.sin(ang) * 14; g.fillStyle(a, 0.9); g.fillTriangle(px - 3, py, px + 3, py, px + Math.sin(now / 250 + k) * 1.5, py - 8); }
    void a;
  } },
  // ── 炼金工坊 ──
  alchStir: { c: 0xd8d8e0, a: 0x7dff6a, draw: (g, now, c, a) => {
    // 搅拌棒·拍
    handle(g, -14, -2, 6, 0x8a6a2a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 0.85); g.fillRoundedRect(-4, -3, 30, 6, 3);
    g.fillStyle(0xffffff, 0.5); g.fillRect(-2, -2, 26, 1.6);
    g.fillStyle(a, 0.7); g.fillEllipse(26, 0, 8, 10);
    for (let k = 0; k < 3; k++) { const ph = ((now / 800 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(22 + k * 3, 4 + ph * 10, 1.4); }
  } },
  alchFlaskRacket: { c: 0x9fd8ff, a: 0x7dff6a, draw: (g, now, c, a) => {
    // 烧瓶·拍
    handle(g, -14, -2, 6, 0x8a6a2a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 0.5); g.beginPath(); g.moveTo(2, -8); g.lineTo(6, -18); g.lineTo(12, -18); g.lineTo(16, -8); g.lineTo(20, 8); g.lineTo(-2, 8); g.lineTo(2, -8); g.closePath(); g.fillPath();
    g.fillStyle(0xffffff, 0.5); g.fillRect(7, -16, 4, 10);
    const b = Math.abs(Math.sin(now / 300)); g.fillStyle(a, 0.85); g.fillEllipse(9, 4, 20, 8 + b * 2);
    for (let k = 0; k < 3; k++) { const ph = ((now / 700 + k / 3) % 1); g.fillStyle(0xbaffa0, (1 - ph) * 0.9); g.fillCircle(3 + k * 6, 0 - ph * 14, 1.6); }
  } },
  // ── 毛线世界 ──
  yarnNeedleRacket: { c: 0xd8d8e0, a: 0xffb7d5, draw: (g, now, c, a) => {
    // 织针·拍
    handle(g, -14, -2, 6, 0xffb7d5); pommel(g, -15, 2.6, c);
    for (const s of [-1, 1]) { g.fillStyle(c, 1); g.fillRoundedRect(9 + s * 8 - 1.6, -16, 3.2, 32, 1.6); g.fillStyle(0x9a9aa8, 1); g.fillCircle(9 + s * 8, -16, 2.4); }
    g.lineStyle(2.4, a, 0.9); g.beginPath(); for (let k = 0; k <= 10; k++) { const ang = k * 0.7 + now / 500; g.lineTo(9 + Math.cos(ang) * 8, Math.sin(ang) * 14); } g.strokePath();
  } },
  yarnCrochet: { c: 0xd8d8e0, a: 0xffb7d5, draw: (g, now, c, a) => {
    // 钩针·拍
    handle(g, -14, -2, 6, 0xffb7d5); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillRoundedRect(-4, -2, 26, 4, 2);
    g.fillStyle(a, 0.9); g.fillCircle(22, 0, 4); g.fillRect(20, -5, 4, 5);
    g.lineStyle(2, a, 0.9); g.beginPath(); for (let k = 0; k <= 8; k++) { const ang = k * 0.9 + now / 400; g.lineTo(24 + Math.cos(ang) * 6, 6 + Math.sin(ang) * 10); } g.strokePath();
  } },
  yarnBallRacket: { c: 0xffb7d5, a: 0xffd8e8, draw: (g, now, c, a) => {
    // 毛线球·拍
    handle(g, -14, -2, 6, 0xa86a8a); pommel(g, -15, 2.6, c);
    g.save(); g.translateCanvas(9, 0); g.rotateCanvas(now / 1400);
    g.fillStyle(c, 1); g.fillCircle(0, 0, 15);
    g.lineStyle(1.4, a, 0.9); for (let k = 0; k < 4; k++) { const ang = (k / 4) * TAU; g.lineBetween(Math.cos(ang) * 14, Math.sin(ang) * 14, Math.cos(ang + 2) * 14, Math.sin(ang + 2) * 14); }
    g.restore();
    g.lineStyle(1.4, a, 0.8); g.beginPath(); g.moveTo(18, 8); g.lineTo(28, 14 + Math.sin(now / 500) * 3); g.strokePath();
  } },
  yarnSweaterRacket: { c: 0xffb7d5, a: 0xffd8e8, draw: (g, _now, c, a) => {
    // 毛衣·拍
    handle(g, -14, -2, 6, 0xa86a8a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillRoundedRect(-6, -15, 30, 30, 8);
    g.lineStyle(1.4, a, 0.9); for (let r = 0; r < 4; r++) g.lineBetween(-4, -11 + r * 7, 22, -10 + r * 7);
    g.lineStyle(1.4, a, 0.9); for (let cc = 0; cc < 4; cc++) g.lineBetween(-3 + cc * 7, -13, -3 + cc * 7, 13);
    g.fillStyle(0xffe040, 1); g.fillCircle(9, 0, 3);
  } },
  // ── 画中世界 ──
  paintBrushRacket: { c: 0x8a6a3a, a: 0xff8ad4, draw: (g, now, c, _a) => {
    // 画笔·拍
    handle(g, -14, -2, 6, 0x9a9aa8); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillRoundedRect(-2, -10, 16, 20, 4);
    g.fillStyle(0x9a9aa8, 1); g.fillRect(14, -7, 6, 14);
    g.fillStyle(0xff4a4a, 1); g.fillPoints([{ x: 20, y: -7 }, { x: 20, y: 7 }, { x: 30, y: 0 }] as never, true);
    g.fillStyle(0xffd45c, 1); g.fillPoints([{ x: 20, y: -4 }, { x: 20, y: 4 }, { x: 27, y: 0 }] as never, true);
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle([0xff4a4a, 0x5ac8ff, 0x7dff9a][k], (1 - ph) * 0.8); g.fillCircle(28, -6 + k * 6 + ph * 8, 1.6); }
  } },
  paintCanvas: { c: 0xf0ead8, a: 0xffd45c, draw: (g, now, c, a) => {
    // 画布·拍
    handle(g, -14, -2, 6, 0xa8763a); pommel(g, -15, 2.6, c);
    g.fillStyle(0x8a6a3a, 1); g.fillRect(-4, -14, 26, 28);
    g.fillStyle(c, 1); g.fillRect(-2, -12, 22, 24);
    const scene = Math.floor(now / 1400) % 3;
    g.fillStyle([0x9fd8ff, 0x8fd45a, 0x2a2450][scene], 0.9); g.fillRect(0, -10, 18, 20);
    g.fillStyle(0xffe040, 0.9); g.fillCircle(6, -4, 3);
    void a;
  } },
  paintPaletteRacket: { c: 0xcea070, a: 0xffd45c, draw: (g, now, c, _a) => {
    // 调色盘·拍
    handle(g, -14, -2, 6, 0xa8763a); pommel(g, -15, 2.6, c);
    g.fillStyle(0x8a6a3a, 1); g.fillEllipse(9, 0, 32, 28);
    g.fillStyle(c, 1); g.fillEllipse(9, 0, 28, 24);
    g.fillStyle(0x6a4a2a, 1); g.fillEllipse(14, 3, 7, 6);
    const cols = [0xff4a4a, 0xffd45c, 0x7dff9a, 0x5ac8ff, 0xff8ad4];
    for (let k = 0; k < 5; k++) { const ang = (k / 5) * TAU; g.fillStyle(cols[k], 1); g.fillCircle(9 + Math.cos(ang) * 9, Math.sin(ang) * 8, 3); }
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle(cols[k], (1 - ph) * 0.9); g.fillCircle(6 + k * 6, 14 + ph * 8, 1.6); }
  } },
  paintTubeRacket: { c: 0xd8d8e0, a: 0xff4a4a, draw: (g, now, c, a) => {
    // 颜料管·拍
    handle(g, -14, -2, 6, 0x9a9aa8); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillRoundedRect(-6, -12, 24, 24, 5);
    g.fillStyle(a, 1); g.fillRect(-3, -8, 18, 8);
    g.fillStyle(0x9a9aa8, 1); g.fillCircle(18, -12, 5);
    for (let k = 0; k < 3; k++) { const ph = ((now / 800 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.9); g.fillEllipse(9, 14 + ph * 8, 3, 4); }
  } },
};
