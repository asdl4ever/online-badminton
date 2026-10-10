import { handle, pommel, TAU, type WeaponArt } from './shared';

/** 第十一批球拍皮肤（SCP 收容 / 巨兽荒原）——柄在 x∈[-13,-2]，拍框中心 ≈(9,0) */

export const WEAPONS_25: Record<string, WeaponArt> = {
  // ── SCP 收容 ──
  scpTaser: { c: 0x8a9a8a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 电击棒·拍：棒身前端迸发电弧
    handle(g, -14, -2, 6, 0x3a4a3a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillRoundedRect(-4, -5, 30, 10, 5);
    g.fillStyle(0x3a4a3a, 1); g.fillRect(-4, -6, 10, 12);
    g.fillStyle(0xd8e0d8, 1); g.fillRect(18, -3, 6, 6);
    for (let k = 0; k < 3; k++) { const q = ((now / 120 + k / 3) % 1); g.lineStyle(1.6, a, (1 - q) * 0.9); g.beginPath(); g.moveTo(24, -6); g.lineTo(30 + Math.sin(now / 40 + k) * 3, -1); g.lineTo(26, 5); g.strokePath(); }
  } },
  scpClipboard: { c: 0xb8b090, a: 0xffd45c, draw: (g, now, c, a) => {
    // 记录板·拍：夹着密档的记录板
    handle(g, -14, -2, 6, 0x3a4a3a); pommel(g, -15, 2.6, c);
    g.fillStyle(0x6a5a3a, 1); g.fillRoundedRect(-4, -18, 30, 36, 3);
    g.fillStyle(0xf0ead8, 1); g.fillRect(-1, -15, 24, 30);
    g.lineStyle(1.2, 0x8a8060, 0.8); for (let k = 0; k < 5; k++) g.lineBetween(2, -11 + k * 5, 20, -11 + k * 5);
    g.fillStyle(0x9a9a9a, 1); g.fillRoundedRect(7, -21, 10, 7, 2);
    g.fillStyle(a, 0.9); g.fillCircle(20, 12, 4);
    for (let k = 0; k < 2; k++) { const q = ((now / 900 + k / 2) % 1); g.fillStyle(a, (1 - q) * 0.7); g.fillCircle(16 - k * 6, 18 + q * 8, 2); }
  } },
  keterClaw: { c: 0xa03030, a: 0xff5a5a, draw: (g, now, c, a) => {
    // 骨爪·拍：血肉身接一排骨爪
    handle(g, -14, -2, 6, 0x5a1a1a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillEllipse(-2, 0, 18, 16);
    for (let k = 0; k < 4; k++) { const ang = -0.9 + k * 0.6; const tx = 4 + 34 * Math.cos(ang), ty = 34 * Math.sin(ang); g.fillStyle(0xe8e0d0, 1); g.fillTriangle(0, -3 + k * 2, 6, 3 + k * 2, tx, ty); }
    g.fillStyle(a, 0.7); g.fillCircle(0, 0, 4);
    for (let k = 0; k < 2; k++) { const q = ((now / 900 + k / 2) % 1); g.fillStyle(a, (1 - q) * 0.7); g.fillCircle(28, -8 + k * 16, 1.6); }
  } },
  keterRibs: { c: 0xa03030, a: 0xff5a5a, draw: (g, now, c, a) => {
    // 肋骨·拍：一扇外翻的肋骨
    handle(g, -14, -2, 6, 0x5a1a1a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.beginPath(); g.moveTo(-2, -18); g.lineTo(8, -20); g.lineTo(10, 18); g.lineTo(-2, 16); g.closePath(); g.fillPath();
    for (let k = 0; k < 5; k++) { const yy = -16 + k * 8; g.lineStyle(3, 0xe8e0d0, 1); g.beginPath(); g.moveTo(2, 0); g.lineTo(8, yy - 6); g.lineTo(32, yy); g.strokePath(); }
    g.fillStyle(a, 0.7); g.fillEllipse(4, 0, 8, 6);
    for (let k = 0; k < 3; k++) { const q = ((now / 800 + k / 3) % 1); g.fillStyle(a, (1 - q) * 0.7); g.fillCircle(32, -16 + k * 16, 2); }
  } },
  // ── 巨兽荒原 ──
  shyArm: { c: 0xe8e8e0, a: 0x6a7a8a, draw: (g, now, c, a) => {
    // 长臂·拍：超长手臂五指张开
    handle(g, -14, -2, 6, 0x8a9aa8); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillRoundedRect(-4, -6, 30, 12, 6);
    g.fillStyle(0xd0d0c8, 1); g.fillCircle(28, 0, 8);
    for (let k = 0; k < 4; k++) { const yy = -10 + k * 7; g.lineStyle(2.4, 0xd0d0c8, 1); g.beginPath(); g.moveTo(30, 0); g.lineTo(36 + Math.sin(now / 300 + k) * 2, yy); g.lineTo(42, yy); g.strokePath(); }
    g.fillStyle(a, 0.6); g.fillCircle(24, -4, 3);
  } },
  shyTooth: { c: 0xe8e8e0, a: 0x6a7a8a, draw: (g, now, c, a) => {
    // 利齿·拍：一圈外翻利齿
    handle(g, -14, -2, 6, 0x8a9aa8); pommel(g, -15, 2.6, c);
    g.fillStyle(0x3a2a2a, 1); g.fillCircle(9, 0, 15);
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU + now / 2000; const px = 9 + Math.cos(ang) * 13, py = Math.sin(ang) * 13; g.fillStyle(c, 1); g.fillTriangle(px - 3, py, px + 3, py, px + Math.cos(ang) * 6, py + Math.sin(ang) * 6); }
    g.fillStyle(a, 0.5); g.fillCircle(9, 0, 4);
  } },
  rakeBone: { c: 0x8a8070, a: 0xd8d0c0, draw: (g, now, c, a) => {
    // 骨刃·拍：打磨光滑的骨刃
    handle(g, -14, -2, 6, 0x5a5248); pommel(g, -15, 2.6, c);
    g.fillStyle(0xb8b0a0, 1); g.fillPoints([{ x: -4, y: -8 }, { x: 20, y: -14 }, { x: 38, y: -2 }, { x: 20, y: 12 }, { x: -4, y: 8 }] as never, true);
    g.fillStyle(c, 1); g.fillPoints([{ x: -2, y: -5 }, { x: 20, y: -10 }, { x: 34, y: -1 }, { x: 20, y: 8 }, { x: -2, y: 5 }] as never, true);
    g.lineStyle(1.6, a, 0.8); g.beginPath(); g.moveTo(0, -5); g.lineTo(20, -10); g.lineTo(34, -1); g.strokePath();
    for (let k = 0; k < 2; k++) { const q = ((now / 900 + k / 2) % 1); g.fillStyle(a, (1 - q) * 0.6); g.fillCircle(16 + k * 12, -14 - q * 8, 2); }
  } },
  rakeFang: { c: 0x8a8070, a: 0xd8d0c0, draw: (g, now, c, a) => {
    // 獠牙·拍：一枚巨大獠牙
    handle(g, -14, -2, 6, 0x5a5248); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.beginPath(); g.moveTo(-4, -12); g.lineTo(30, -6); g.lineTo(40, 2); g.lineTo(-4, 10); g.closePath(); g.fillPath();
    g.fillStyle(0xe8e0d0, 1); g.fillPoints([{ x: 6, y: -8 }, { x: 34, y: -2 }, { x: 40, y: 2 }, { x: 6, y: 6 }] as never, true);
    g.fillStyle(0xf0ead8, 1); g.fillTriangle(30, -6, 44, 0, 32, 8);
    g.lineStyle(1.4, a, 0.7); g.beginPath(); g.moveTo(4, -6); g.lineTo(36, -1); g.strokePath();
    for (let k = 0; k < 2; k++) { const q = ((now / 1000 + k / 2) % 1); g.fillStyle(a, (1 - q) * 0.6); g.fillCircle(42, 2, 2 + q * 2); }
  } },
  wendiBoneAxe: { c: 0x9a8060, a: 0xd8e8f0, draw: (g, now, c, a) => {
    // 骨斧·拍：绑在柄上的骨斧
    handle(g, -14, -2, 6, 0x5a4a2a); pommel(g, -15, 2.6, c);
    g.fillStyle(0x6a5a3a, 1); g.fillRoundedRect(-4, -2, 28, 5, 2);
    g.fillStyle(0xd8d0c0, 1); g.fillPoints([{ x: 10, y: -20 }, { x: 34, y: -22 }, { x: 40, y: 0 }, { x: 34, y: 22 }, { x: 10, y: 20 }] as never, true);
    g.fillStyle(c, 1); g.fillPoints([{ x: 13, y: -16 }, { x: 32, y: -18 }, { x: 36, y: 0 }, { x: 32, y: 18 }, { x: 13, y: 16 }] as never, true);
    g.lineStyle(1.6, a, 0.8); g.beginPath(); g.moveTo(24, -18); g.lineTo(24, 18); g.strokePath();
    for (let k = 0; k < 2; k++) { const q = ((now / 900 + k / 2) % 1); g.fillStyle(a, (1 - q) * 0.6); g.fillCircle(38, -14 + k * 28, 2); }
  } },
  wendiClaw: { c: 0x9a8060, a: 0xd8e8f0, draw: (g, now, c, a) => {
    // 冻爪·拍：结霜的弯曲利爪
    handle(g, -14, -2, 6, 0x5a4a2a); pommel(g, -15, 2.6, c);
    for (let k = 0; k < 3; k++) { g.fillStyle(0xd8e8f0, 1); g.fillTriangle(k * 4, -10 + k * 3, k * 4 + 6, -4 + k * 3, 34 + k * 3, 4 + k * 2); }
    g.fillStyle(c, 1); g.fillCircle(2, 0, 8);
    g.fillStyle(a, 0.35); g.fillCircle(-4, -4, 10);
    for (let k = 0; k < 3; k++) { const q = ((now / 1100 + k / 3) % 1); g.fillStyle(a, (1 - q) * 0.7); g.fillCircle(30 + k, 2 - q * 8, 1.6); }
  } },
  mothmClaw: { c: 0x7a5a3a, a: 0xff3a3a, draw: (g, now, c, a) => {
    // 蛾爪·拍：绒足末端的三钩爪
    handle(g, -14, -2, 6, 0x4a3520); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillRoundedRect(-4, -6, 16, 12, 5);
    for (let k = 0; k < 3; k++) { g.fillStyle(0xd8c8a8, 1); g.fillTriangle(10, -8 + k * 8, 16, -2 + k * 8, 38 + k * 2, -4 + k * 8 + Math.sin(now / 300 + k) * 2); }
    g.fillStyle(a, 0.6); g.fillCircle(12, 0, 4);
    for (let k = 0; k < 3; k++) { const q = ((now / 1000 + k / 3) % 1); g.fillStyle(a, (1 - q) * 0.7); g.fillCircle(30 + k * 4, -8 + q * 10, 1.6); }
  } },
  mothmEyeRacket: { c: 0x7a5a3a, a: 0xff3a3a, draw: (g, now, c, a) => {
    // 巨眼·拍：巨大复眼，小眼反光
    handle(g, -14, -2, 6, 0x4a3520); pommel(g, -15, 2.6, c);
    g.fillStyle(0x2a1c10, 1); g.fillEllipse(9, 0, 34, 30);
    g.fillStyle(c, 1); g.fillEllipse(9, 0, 30, 26);
    for (let r = 0; r < 5; r++) for (let col = 0; col < 4; col++) { const px = 1 + col * 6, py = -10 + r * 5; g.fillStyle((r + col) % 2 ? a : 0xffb0b0, 0.8 + 0.2 * Math.sin(now / 300 + r + col)); g.fillCircle(px, py, 2.2); }
    g.fillStyle(0xffffff, 0.4); g.fillEllipse(4, -8, 6, 4);
  } },
  gbeastFur: { c: 0x8a5a3a, a: 0xffb347, draw: (g, now, c, a) => {
    // 兽皮·拍：整张兽皮裹成的拍框
    handle(g, -14, -2, 6, 0x5a3a24); pommel(g, -15, 2.6, c);
    g.fillStyle(0x5a3a24, 1); g.fillEllipse(9, 0, 34, 30);
    g.fillStyle(c, 1); g.fillEllipse(9, 0, 30, 26);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU + now / 1500; g.fillStyle(0x6a4428, 1); g.fillEllipse(9 + Math.cos(ang) * 15, Math.sin(ang) * 14, 7, 4); }
    g.fillStyle(a, 0.5); g.fillEllipse(4, -6, 10, 6);
    for (let k = 0; k < 3; k++) { const q = ((now / 900 + k / 3) % 1); g.fillStyle(a, (1 - q) * 0.6); g.fillCircle(-6 + k * 12, -18 - q * 8, 1.6); }
  } },
  gbeastBoneClub: { c: 0x8a5a3a, a: 0xffb347, draw: (g, now, c, a) => {
    // 骨棒·拍：兽骨大棒，两端骨节
    handle(g, -14, -2, 6, 0x5a3a24); pommel(g, -15, 2.6, c);
    g.fillStyle(0xd8d0c0, 1); g.fillRoundedRect(-4, -2, 30, 6, 3);
    g.fillStyle(0xe8e0d0, 1); g.fillCircle(30, 0, 12);
    g.fillStyle(0xd0c8b8, 1); g.fillCircle(26, -8, 7); g.fillCircle(34, 6, 7);
    for (let k = 0; k < 4; k++) { const ang = (k / 4) * TAU; g.fillStyle(0xf0ead8, 1); g.fillCircle(30 + Math.cos(ang) * 11, Math.sin(ang) * 11, 3); }
    g.lineStyle(1.6, a, 0.7); g.beginPath(); g.moveTo(2, -2); g.lineTo(22, -2); g.strokePath();
    for (let k = 0; k < 2; k++) { const q = ((now / 800 + k / 2) % 1); g.fillStyle(a, (1 - q) * 0.6); g.fillCircle(30, 18 + q * 8, 2); }
  } },
  crawFang: { c: 0xc8a86a, a: 0x4a2a1a, draw: (g, now, c, a) => {
    // 龙牙·拍：巨大龙牙
    handle(g, -14, -2, 6, 0xb09870); pommel(g, -15, 2.6, c);
    g.fillStyle(0xe8e0d0, 1); g.beginPath(); g.moveTo(-4, -14); g.lineTo(26, -8); g.lineTo(42, 0); g.lineTo(26, 8); g.lineTo(-4, 14); g.closePath(); g.fillPath();
    g.fillStyle(c, 1); g.fillPoints([{ x: 0, y: -8 }, { x: 26, y: -4 }, { x: 38, y: 0 }, { x: 26, y: 4 }, { x: 0, y: 8 }] as never, true);
    g.lineStyle(1.4, a, 0.7); g.beginPath(); g.moveTo(0, -6); g.lineTo(30, -2); g.strokePath();
    for (let k = 0; k < 2; k++) { const q = ((now / 1000 + k / 2) % 1); g.fillStyle(a, (1 - q) * 0.5); g.fillCircle(40, 0, 2 + q * 2); }
  } },
  crawClaw: { c: 0xc8a86a, a: 0x4a2a1a, draw: (g, now, c, a) => {
    // 骨爪·拍：三趾骨爪
    handle(g, -14, -2, 6, 0xb09870); pommel(g, -15, 2.6, c);
    g.fillStyle(0xe0d0b0, 1); g.fillEllipse(-2, 0, 18, 16);
    g.fillStyle(c, 1); g.fillEllipse(-2, 0, 14, 12);
    for (let k = 0; k < 3; k++) { const ang = -0.8 + k * 0.8; const tx = 4 + 34 * Math.cos(ang), ty = 34 * Math.sin(ang); g.fillStyle(0xe8e0d0, 1); g.fillTriangle(2, -3 + k * 3, 8, 3 + k * 3, tx, ty); }
    g.fillStyle(a, 0.6); g.fillCircle(0, 0, 4);
    for (let k = 0; k < 3; k++) { const q = ((now / 900 + k / 3) % 1); g.fillStyle(a, (1 - q) * 0.5); g.fillCircle(34, -12 + k * 12, 1.6); }
  } },
  mutoClawRacket: { c: 0x5a6a3a, a: 0x7dff5a, draw: (g, now, c, a) => {
    // 虫爪·拍：昆虫节肢末端三钩
    handle(g, -14, -2, 6, 0x3a4a24); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillRoundedRect(-4, -5, 18, 10, 5);
    for (let k = 0; k < 3; k++) { const ang = -0.7 + k * 0.7; const tx = 12 + 30 * Math.cos(ang), ty = 30 * Math.sin(ang); g.lineStyle(4, 0x4a5a2a, 1); g.beginPath(); g.moveTo(12, 0); g.lineTo(tx, ty); g.strokePath(); g.fillStyle(a, 0.9); g.fillCircle(tx, ty, 3); }
    g.fillStyle(a, 0.5); g.fillCircle(14, 0, 4);
    for (let k = 0; k < 3; k++) { const q = ((now / 700 + k / 3) % 1); g.fillStyle(a, (1 - q) * 0.7); g.fillCircle(40, -10 + k * 10, 1.6); }
  } },
  mutoSpike: { c: 0x5a6a3a, a: 0x7dff5a, draw: (g, now, c, a) => {
    // 尖刺·拍：辐射状尖刺拍眶
    handle(g, -14, -2, 6, 0x3a4a24); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillCircle(9, 0, 13);
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU + Math.sin(now / 400 + k) * 0.05; g.fillStyle(k % 2 ? a : 0x8aff6a, 0.9); g.fillTriangle(9 + Math.cos(ang) * 12, Math.sin(ang) * 12, 9 + Math.cos(ang + 0.25) * 12, Math.sin(ang + 0.25) * 12, 9 + Math.cos(ang + 0.12) * 22, Math.sin(ang + 0.12) * 22); }
    g.fillStyle(0x2a3418, 1); g.fillCircle(9, 0, 5);
    g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 250)); g.fillCircle(9, 0, 3);
  } },
  beheHornRacket: { c: 0x5a4030, a: 0x8a6a4a, draw: (g, now, c, a) => {
    // 巨角·拍：粗壮巨角
    handle(g, -14, -2, 6, 0x3a2818); pommel(g, -15, 2.6, c);
    g.fillStyle(0xd8c8b0, 1); g.beginPath(); g.moveTo(-4, 10); g.lineTo(30, 6); g.lineTo(44, -6); g.lineTo(34, -2); g.lineTo(6, -8); g.closePath(); g.fillPath();
    g.fillStyle(c, 1); g.beginPath(); g.moveTo(-2, 8); g.lineTo(28, 4); g.lineTo(38, -4); g.lineTo(32, -1); g.lineTo(6, -6); g.closePath(); g.fillPath();
    g.lineStyle(1.6, a, 0.7); g.beginPath(); g.moveTo(0, 6); g.lineTo(34, -4); g.strokePath();
    g.fillStyle(0x3a2818, 1); g.fillEllipse(0, 8, 14, 10);
    for (let k = 0; k < 3; k++) { const q = ((now / 900 + k / 3) % 1); g.fillStyle(a, (1 - q) * 0.6); g.fillCircle(40 - k * 2, -6 - q * 8, 2); }
  } },
  beheHide: { c: 0x5a4030, a: 0x8a6a4a, draw: (g, now, c, a) => {
    // 兽皮·拍：厚重兽皮拍框
    handle(g, -14, -2, 6, 0x3a2818); pommel(g, -15, 2.6, c);
    g.fillStyle(0x2a1c10, 1); g.fillRoundedRect(-4, -16, 34, 32, 10);
    g.fillStyle(c, 1); g.fillRoundedRect(-2, -14, 30, 28, 9);
    g.fillStyle(0x8a6a4a, 1); g.fillRoundedRect(0, -12, 22, 24, 8);
    for (let k = 0; k < 3; k++) { g.fillStyle(0x2a1c10, 1); g.fillCircle(8 + (k % 3) * 5, -6 + k * 6, 2.4); }
    g.lineStyle(1.6, a, 0.6); g.strokeRect(-2, -14, 30, 28);
    for (let k = 0; k < 2; k++) { const q = ((now / 900 + k / 2) % 1); g.fillStyle(a, (1 - q) * 0.6); g.fillCircle(6 + k * 14, 16 + q * 6, 2); }
  } },
};
