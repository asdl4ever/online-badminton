import { TAU, apoly, type AuraArt } from './shared';

/** 第八批光环 / 背景（冰海巨兽 / 极夜冰海 / 寒潮海象 / 维度裂隙 / 幽光深渊）——成景构图，画在角色身后 */

export const AURAS_24: Record<string, AuraArt> = {
  // ── 冰海巨兽 ──
  glacAurora: { c: 0x5fd8ff, a: 0x7dffd0, draw: (g, now, c, a) => {
    // 极光海：身后夜空极光带 + 浮冰海面
    g.fillStyle(0x071a28, 0.7); g.fillRect(-100, -110, 200, 150);
    for (let b = 0; b < 3; b++) { g.fillStyle(b % 2 ? c : a, 0.22); g.beginPath(); g.moveTo(-100, -40 - b * 8); for (let s = 0; s <= 8; s++) { const px = -100 + s * 25; const py = -60 - b * 12 + Math.sin(s * 0.9 + now / 900 + b) * 14; g.lineTo(px, py); } g.lineTo(100, -40 - b * 8); g.lineTo(100, 20); g.lineTo(-100, 20); g.closePath(); g.fillPath(); }
    for (let k = 0; k < 7; k++) { g.fillStyle(0xdff4ff, 0.85); g.fillEllipse(-80 + k * 26 + Math.sin(now / 1200 + k) * 4, 30, 22, 8); }
    g.fillStyle(0x2a6a8a, 0.3); g.fillEllipse(0, 40, 200, 22);
  } },
  glacFloe: { c: 0xbfe8ff, a: 0x5fd8ff, draw: (g, now, _c, a) => {
    // 浮冰环：身后一圈漂浮的碎冰，随波起伏
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU + now / 3000; const px = Math.cos(ang) * 62, py = -18 + Math.sin(ang) * 34; g.fillStyle(0x8fd8ff, 0.55); g.fillPoints([{ x: px - 8, y: py + 5 }, { x: px - 6, y: py - 5 }, { x: px + 6, y: py - 7 }, { x: px + 9, y: py + 4 }] as never, true); g.fillStyle(0xdff4ff, 0.85); g.fillPoints([{ x: px - 6, y: py + 3 }, { x: px - 4, y: py - 4 }, { x: px + 4, y: py - 5 }, { x: px + 7, y: py + 3 }] as never, true); }
    g.fillStyle(a, 0.15); g.fillEllipse(0, 40, 150, 18);
  } },
  // ── 极夜冰海 ──
  fridDarkSea: { c: 0x1a3a4a, a: 0x7dffd0, draw: (g, now, c, a) => {
    // 黑潮：身后漆黑的深海，只有点点幽光
    g.fillStyle(0x050f18, 0.8); g.fillEllipse(0, -20, 190, 150);
    for (let k = 0; k < 12; k++) { const ph = ((now / 1400 + k / 12) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(-80 + (k * 31 % 160), 40 - ph * 130, 1.6); }
    const wave: Array<[number, number]> = [[-90, 44]];
    for (let s = 1; s <= 10; s++) { const px = -90 + s * 18; const py = 44 - Math.sin((s / 10) * Math.PI) * (34 + Math.sin(now / 700) * 6); wave.push([px, py]); }
    wave.push([90, 44]);
    g.fillStyle(c, 0.5); apoly(g, wave, c, 0.5);
    for (let k = 0; k < 5; k++) { g.fillStyle(a, 0.2); g.fillEllipse(-70 + k * 35, -20 + Math.sin(now / 900 + k) * 10, 24, 40); }
  } },
  fridPlankton: { c: 0x7dffd0, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 幽光浮游：身后一群发光浮游生物，明灭漂移
    for (let k = 0; k < 14; k++) { const ang = (k / 14) * TAU + now / 2600; const rr = 50 + Math.sin(now / 700 + k) * 14; const on = 0.3 + 0.7 * Math.abs(Math.sin(now / 400 + k * 1.3)); g.fillStyle(k % 2 ? c : a, 0.7 * on); g.fillCircle(Math.cos(ang) * rr, -22 + Math.sin(ang) * rr * 0.6, 2); }
    g.fillStyle(a, 0.12); g.fillEllipse(0, 40, 140, 18);
  } },
  // ── 寒潮海象 ──
  walrIcePack: { c: 0xd8e8f0, a: 0x8fd8ff, draw: (g, now, c, _a) => {
    // 浮冰群：身后一大片浮冰山，缓慢起伏
    for (const [bx, r] of [[-46, 30], [-12, 40], [28, 34], [58, 22]] as Array<[number, number]>) { const bob = Math.sin(now / 900 + bx) * 2; g.fillStyle(0x8fd8ff, 0.5); g.fillEllipse(bx, 30 + bob, r * 2, r * 0.7); g.fillStyle(c, 0.85); g.fillEllipse(bx, 26 + bob, r * 1.7, r * 0.6); g.fillStyle(0xffffff, 0.5); g.fillEllipse(bx - r * 0.3, 20 + bob, r * 0.5, r * 0.3); }
    g.fillStyle(0x2a5a7a, 0.3); g.fillEllipse(0, 44, 200, 22);
  } },
  walrBlizzard: { c: 0x8fd8ff, a: 0xe8f4ff, draw: (g, now, c, a) => {
    // 寒潮暴雪：身后呼啸的暴风雪
    g.fillStyle(0x2a4a5a, 0.4); g.fillEllipse(0, -10, 200, 170);
    for (let k = 0; k < 20; k++) { const ph = ((now / 800 + k / 20) % 1); g.fillStyle(k % 2 ? a : c, (1 - ph) * 0.8); g.fillCircle(-90 + (k * 19 % 180), 50 - ph * 150, 1.6); }
    g.lineStyle(2, a, 0.25); for (let k = 0; k < 4; k++) g.lineBetween(-70 + k * 40, -60, -30 + k * 40, 30);
    g.fillStyle(0xffffff, 0.12); g.fillEllipse(0, 44, 180, 20);
  } },
  // ── 维度裂隙 ──
  dimRiftAura: { c: 0xb08aff, a: 0x7dffd0, draw: (g, now, c, a) => {
    // 维度裂隙：身后空中撕开一道裂缝，内部高维星空旋转
    const wide = 16 + Math.sin(now / 700) * 5;
    g.fillStyle(0x05040f, 0.9); apoly(g, [[-wide, -120], [wide, -100], [wide * 1.3, 0], [wide, 90], [-wide, 80], [-wide * 0.9, -20]], 0x05040f, 0.9);
    for (let k = 0; k < 3; k++) { const off = now / 400 + k * 2.1; g.lineStyle(2, a, 0.6); g.beginPath(); for (let s = 0; s <= 8; s++) { const u = s / 8; const ang = off + u * 3; const rr = u * 30; g.lineTo(Math.cos(ang) * rr, -20 + Math.sin(ang) * rr * 1.2); } g.strokePath(); }
    g.lineStyle(2.4, c, 0.5 + 0.3 * Math.sin(now / 300)); g.beginPath(); g.moveTo(-wide, -120); g.lineTo(-wide * 0.9, -20); g.lineTo(-wide, 80); g.strokePath(); g.beginPath(); g.moveTo(wide, -100); g.lineTo(wide * 1.3, 0); g.lineTo(wide, 90); g.strokePath();
    for (let k = 0; k < 8; k++) { const ph = ((now / 900 + k / 8) % 1); g.fillStyle(k % 2 ? a : c, (1 - ph) * 0.8); g.fillCircle((k % 2 ? 1 : -1) * wide * 0.6, -100 + ph * 180, 1.6); }
  } },
  dimCosmos: { c: 0x7dffd0, a: 0xb08aff, draw: (g, now, c, a) => {
    // 高维星空：身后一片扭曲的高维星海，星点沿高维流形流动
    g.fillStyle(0x0a0618, 0.8); g.fillCircle(0, -24, 66);
    for (let arm = 0; arm < 4; arm++) { g.lineStyle(1.6, arm % 2 ? a : c, 0.4); g.beginPath(); for (let s = 0; s <= 12; s++) { const u = s / 12; const ang = (arm / 4) * TAU + u * 5 + now / 1600; const rr = u * 60; g.lineTo(Math.cos(ang) * rr, -24 + Math.sin(ang) * rr * 0.9); } g.strokePath(); }
    for (let k = 0; k < 18; k++) { const ang = (k / 18) * TAU + now / 2200; const rr = 20 + (k % 5) * 9; g.fillStyle(0xffffff, 0.4 + 0.5 * Math.abs(Math.sin(now / 300 + k))); g.fillCircle(Math.cos(ang) * rr, -24 + Math.sin(ang) * rr, 1.4); }
    g.fillStyle(0xffffff, 0.6 + 0.3 * Math.sin(now / 400)); g.fillCircle(0, -24, 2.6);
  } },
  // ── 幽光深渊 ──
  hadalVent: { c: 0x2a6a5a, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 深海热泉：身后一座喷着黑烟与幽光的深海热泉
    g.fillStyle(0x0a2028, 0.9); apoly(g, [[-40, 54], [40, 54], [22, -10], [14, -34], [-14, -34], [-22, -10]], 0x0a2028, 0.9);
    g.fillStyle(0x143038, 1); apoly(g, [[-34, 50], [34, 50], [18, -8], [11, -30], [-11, -30], [-18, -8]], 0x143038, 1);
    for (let k = 0; k < 5; k++) { const ph = ((now / 1000 + k / 5) % 1); g.fillStyle(0x0a1418, 0.7 * (1 - ph)); g.fillCircle(Math.sin(k * 2) * 12, -34 - ph * 56, 6 + ph * 10); }
    for (let k = 0; k < 6; k++) { const ph = ((now / 700 + k / 6) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(-14 + (k * 13 % 28), -30 - ph * 50, 1.6); }
    g.fillStyle(c, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(0, -30, 20, 8);
    g.fillStyle(a, 0.12); g.fillEllipse(0, 50, 150, 18);
  } },
  hadalGlow: { c: 0x39ffd0, a: 0x2a6a6a, draw: (g, now, _c, a) => {
    // 幽光群：身后一群游动的小鱼，各自亮着幽光
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU + now / 1800; const rr = 54 + Math.sin(now / 600 + k * 1.5) * 12; const px = Math.cos(ang) * rr, py = -22 + Math.sin(ang) * rr * 0.55; g.fillStyle(a, 0.6 + 0.4 * Math.abs(Math.sin(now / 300 + k))); g.fillEllipse(px, py, 5, 2.6); g.fillTriangle(px - 5, py, px - 9, py - 2, px - 9, py + 2); g.fillStyle(0xffffff, 0.7); g.fillCircle(px + 1.6, py, 1); }
    g.fillStyle(a, 0.12); g.fillEllipse(0, 40, 140, 18);
  } },
};
