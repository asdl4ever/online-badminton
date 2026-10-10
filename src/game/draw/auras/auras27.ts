import { TAU, type AuraArt } from './shared';

/** 第十一批光环 / 背景（SCP / 恐怖 / 灾难 / 变异 / 北海巨兽）——成景构图，画在角色身后 */

export const AURAS_27: Record<string, AuraArt> = {
  // ── 收容设施 ──
  scpAlarm: { c: 0x8a9a8a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 警报红光：头顶旋转警报灯 + 扩散红光圈
    g.fillStyle(0xff3a3a, 0.12 + 0.06 * Math.sin(now / 200)); g.fillEllipse(0, -20, 150, 200);
    g.save(); g.translateCanvas(0, -70); g.rotateCanvas(now / 250);
    g.fillStyle(a, 0.8); g.fillCircle(0, 0, 9); g.fillStyle(c, 0.9); g.fillRect(-12, -3, 24, 6);
    g.restore();
    for (let k = 0; k < 3; k++) { const ph = ((now / 1200 + k / 3) % 1); g.lineStyle(3, 0xff3a3a, (1 - ph) * 0.7); g.strokeCircle(0, -70, 14 + ph * 70); }
  } },
  scpContainField: { c: 0x8a9a8a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 收容力场：网格力场罩 + 扫描线
    for (let k = 1; k <= 5; k++) { g.lineStyle(1.2, c, 0.3); g.strokeEllipse(0, 0, 86, k * 26); }
    for (let k = 1; k <= 4; k++) { g.lineStyle(1.2, c, 0.25); g.strokeEllipse(0, 0, k * 20, 130); }
    const sy = -140 + ((now / 1400) % 1) * 280; g.lineStyle(2.4, a, 0.8); g.lineBetween(-86, sy, 86, sy);
    g.fillStyle(a, 0.6); g.fillCircle(-86, sy, 2); g.fillCircle(86, sy, 2);
  } },
  // ── 血肉收容 ──
  keterPulse: { c: 0xa03030, a: 0xff5a5a, draw: (g, now, c, a) => {
    // 血肉脉动：身后肉壁脉动 + 血管
    const br = Math.sin(now / 500) * 8;
    g.fillStyle(c, 0.5); g.fillEllipse(0, 0, 180 + br, 240 + br);
    g.fillStyle(0x701818, 0.7); g.fillEllipse(-40, -20, 70, 120); g.fillEllipse(50, 30, 60, 100);
    for (let k = 0; k < 4; k++) { const off = k * 2; g.lineStyle(3, a, 0.5 + 0.3 * Math.sin(now / 400 + k)); g.beginPath(); for (let i = 0; i <= 8; i++) { const t = i / 8; g.lineTo(-70 + t * 140, -80 + off * 40 + Math.sin(t * 6 + now / 500 + k) * 10); } g.strokePath(); }
  } },
  keterFeast: { c: 0xa03030, a: 0xff5a5a, draw: (g, now, c, a) => {
    // 噬食环绕：环绕的利齿巨口与血雾
    g.fillStyle(c, 0.25); g.fillEllipse(0, 0, 190, 200);
    for (let k = 0; k < 4; k++) { const ang = (k / 4) * TAU + now / 1600; const px = Math.cos(ang) * 60, py = Math.sin(ang) * 55 - 10; g.save(); g.translateCanvas(px, py); g.rotateCanvas(ang); g.fillStyle(0x400000, 0.9); g.fillEllipse(0, 0, 34, 20); g.fillStyle(0xffffff, 0.9); for (let j = 0; j < 5; j++) g.fillTriangle(-15 + j * 6, -7, -9 + j * 6, 0, -11 + j * 6, -7); g.restore(); }
    for (let k = 0; k < 4; k++) { const ph = ((now / 1000 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.5); g.fillCircle(-60 + k * 40 + Math.sin(now / 500 + k) * 8, -10 + Math.sin(k * 1.6) * 20, 8 + ph * 10); }
  } },
  // ── 沉默惊惧 ──
  shyRage: { c: 0xe8e8e0, a: 0x6a7a8a, draw: (g, now, c, a) => {
    // 暴走冲击环 + 怒气线
    const w = 1 + 0.6 * Math.sin(now / 120);
    g.lineStyle(5, 0xff4a4a, 0.7 * w); g.strokeCircle(0, 0, 60 + Math.sin(now / 300) * 6);
    g.lineStyle(3, a, 0.6); g.strokeEllipse(0, 0, 110, 150);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU + now / 900; g.lineStyle(2.4, 0xff4a4a, 0.7); g.lineBetween(Math.cos(ang) * 70, Math.sin(ang) * 70, Math.cos(ang) * 88, Math.sin(ang) * 88); }
    for (let k = 0; k < 6; k++) { const ph = ((now / 900 + k / 6) % 1); g.fillStyle(c, (1 - ph) * 0.7); g.fillCircle(Math.cos(k * 1.2) * 40, Math.sin(k * 1.2) * 40, 2 + ph * 3); }
  } },
  shyCalm: { c: 0xe8e8e0, a: 0x6a7a8a, draw: (g, now, c, a) => {
    // 静默光环：惨白雪花点 + 静默光圈
    const rr = 60 + Math.sin(now / 800) * 5;
    g.lineStyle(4, a, 0.5); g.strokeCircle(0, 0, rr); g.lineStyle(2, c, 0.7); g.strokeCircle(0, 0, rr - 8);
    for (let k = 0; k < 12; k++) { const ph = ((now / 2000 + k / 12) % 1); const ang = k * 2.1; const rad = rr + 20 + ph * 30; g.fillStyle(c, (1 - ph) * 0.8); g.fillCircle(Math.cos(ang) * rad * 0.9, Math.sin(ang) * rad * 0.9, 1.6 + (k % 3) * 0.6); }
  } },
  // ── 夜色窥视 ──
  rakeNight: { c: 0x8a8070, a: 0xd8d0c0, draw: (g, now, _c, _a) => {
    // 夜行暗影：漆黑树影 + 红眼
    g.fillStyle(0x000000, 0.75); g.fillRect(-100, -110, 200, 150);
    g.fillStyle(0x000000, 0.9); g.fillRect(-16, -60, 32, 100); g.fillRect(-60, -60, 26, 100); g.fillRect(34, -60, 26, 100);
    for (let k = 0; k < 5; k++) { const px = -70 + k * 35; g.fillTriangle(px - 18, -60, px + 18, -60, px, -110); }
    for (let k = 0; k < 2; k++) { const blink = Math.max(0, Math.sin(now / 300 + k)); g.fillStyle(0xff2a2a, 0.6 + 0.4 * blink); g.fillCircle(-70 + k * 140, -20, 4); }
  } },
  rakeEye: { c: 0x8a8070, a: 0xd8d0c0, draw: (g, now, _c, _a) => {
    // 暗中窥视：黑暗中若干窥视眼睛
    g.fillStyle(0x000000, 0.78); g.fillRect(-100, -110, 200, 150);
    for (let k = 0; k < 5; k++) { const px = -70 + k * 35, py = -70 + (k * 41 % 100); const bl = 0.4 + 0.6 * Math.abs(Math.sin(now / 500 + k * 1.3)); g.fillStyle(0xffffff, bl * 0.9); g.fillEllipse(px, py, 13, 6); g.fillStyle(0xff2a2a, bl); g.fillCircle(px + Math.sin(now / 700 + k) * 2, py, 2.4); }
  } },
  // ── 寒潮饥荒 ──
  wendiBlizzard: { c: 0x9a8060, a: 0xd8e8f0, draw: (g, now, _c, a) => {
    // 风雪旋涡 + 冰晶
    for (let k = 0; k < 16; k++) { const ph = ((now / 1500 + k / 16) % 1); const ang = k * 0.6 + now / 700; const rr = 20 + ph * 70; g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(Math.cos(ang) * rr, -10 + Math.sin(ang) * rr * 0.8, 1.6 + (k % 3)); }
    for (let k = 0; k < 3; k++) { const px = -50 + k * 50, py = -30 - k * 20; g.fillStyle(a, 0.9); g.save(); g.translateCanvas(px, py); g.rotateCanvas(now / 1200 + k); g.fillRect(-6, -1, 12, 2); g.fillRect(-1, -6, 2, 12); g.restore(); }
  } },
  wendiHunger: { c: 0x9a8060, a: 0xd8e8f0, draw: (g, now, c, _a) => {
    // 饥饿寒光：惨绿寒气 + 饥饿骨影
    g.fillStyle(0x1a3a2a, 0.35); g.fillEllipse(0, 0, 180, 200);
    for (let k = 0; k < 4; k++) { const ph = ((now / 1600 + k / 4) % 1); g.fillStyle(0x8affb0, 0.18 * (1 - ph)); g.fillEllipse(-60 + k * 40 + Math.sin(now / 600 + k) * 8, 30 - ph * 130, 50, 40); }
    g.fillStyle(c, 0.85); g.fillCircle(0, -60, 12); g.fillRect(-3, -50, 6, 26); g.fillRect(-22, -20, 44, 6); g.fillRect(-18, -4, 36, 6); g.fillRect(-2, -14, 4, 40);
  } },
  // ── 蛾群灾兆 ──
  mothmSwarm: { c: 0x7a5a3a, a: 0xff3a3a, draw: (g, now, c, a) => {
    // 飞蛾环绕：飞蛾群环绕
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU + now / 1400; const rr = 50 + (k % 3) * 14; const px = Math.cos(ang) * rr, py = -10 + Math.sin(ang) * rr * 0.7; const flap = Math.sin(now / 90 + k) * 5; g.fillStyle(c, 0.9); g.fillTriangle(px, py, px - 7, py - 4 + flap, px - 6, py + 3); g.fillTriangle(px, py, px + 7, py - 4 - flap, px + 6, py + 3); g.fillStyle(a, 0.8); g.fillCircle(px, py, 1.6); }
  } },
  mothmPortent: { c: 0x7a5a3a, a: 0xff3a3a, draw: (g, now, _c, a) => {
    // 灾兆光环：血红灾兆光环 + 蛾影
    const rr = 70 + Math.sin(now / 600) * 6;
    g.lineStyle(6, 0xff0030, 0.3); g.strokeCircle(0, 0, rr);
    g.lineStyle(2.4, a, 0.7); g.strokeCircle(0, 0, rr - 6);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU + now / 1800; const px = Math.cos(ang) * rr, py = Math.sin(ang) * rr; g.fillStyle(0x2a1018, 0.9); g.fillTriangle(px, py, px - 6, py - 8, px + 4, py + 2); }
  } },
  // ── 巨兽怒潮 ──
  gbeastRage: { c: 0x8a5a3a, a: 0xffb347, draw: (g, now, _c, a) => {
    // 怒火环：怒气冲击环 + 火星
    const r0 = 40 + ((now / 700) % 1) * 60; g.lineStyle(4, 0xff6a1a, 0.7 * (1 - (r0 - 40) / 60)); g.strokeCircle(0, 0, r0);
    g.lineStyle(3, a, 0.6); g.strokeEllipse(0, 0, 100, 130);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU; g.lineStyle(2, 0xff6a1a, 0.7); g.lineBetween(Math.cos(ang) * 50, Math.sin(ang) * 50, Math.cos(ang) * 70, Math.sin(ang) * 70); }
    for (let k = 0; k < 6; k++) { const ph = ((now / 800 + k / 6) % 1); g.fillStyle(a, (1 - ph) * 0.9); g.fillCircle(-60 + (k * 41 % 120), 40 - ph * 120, 1.5 + ph * 2); }
  } },
  gbeastStorm: { c: 0x8a5a3a, a: 0xffb347, draw: (g, now, c, a) => {
    // 巨兽风暴：风暴云 + 闪电
    g.fillStyle(0x2a2a3a, 0.7); g.fillEllipse(0, -70, 180, 80);
    for (let k = 0; k < 5; k++) { const ph = ((now / 1800 + k / 5) % 1); g.fillStyle(k % 2 ? c : 0x3a3a50, 0.4); g.fillEllipse(-70 + ph * 20 + k * 30, -70 + Math.sin(now / 600 + k) * 8, 60, 36); }
    if (Math.sin(now / 300) > 0.6) { g.lineStyle(3, a, 0.95); g.beginPath(); g.moveTo(-10, -50); g.lineTo(6, -20); g.lineTo(-4, -18); g.lineTo(12, 30); g.strokePath(); }
    for (let k = 0; k < 4; k++) { const tw = Math.max(0, Math.sin(now / 400 + k)); g.fillStyle(a, tw); g.fillCircle(-60 + k * 40, 30, 1.6); }
  } },
  // ── 毒沼地鸣 ──
  crawToxic: { c: 0xc8a86a, a: 0x4a2a1a, draw: (g, now, c, a) => {
    // 毒雾环：绿色毒雾 + 气泡
    g.fillStyle(0x2a4a20, 0.35); g.fillEllipse(0, 10, 190, 190);
    for (let k = 0; k < 5; k++) { const ph = ((now / 1700 + k / 5) % 1); g.fillStyle(0x6aff3a, 0.22 * (1 - ph)); g.fillEllipse(-70 + k * 34 + Math.sin(now / 700 + k) * 8, 30 - ph * 130, 54, 40); }
    for (let k = 0; k < 7; k++) { const ph = ((now / 900 + k / 7) % 1); g.fillStyle(c, (1 - ph) * 0.7); g.fillCircle(-70 + (k * 37 % 140), 40 - ph * 130, 2 + ph * 2.5); g.lineStyle(1, a, (1 - ph) * 0.6); g.strokeCircle(-70 + (k * 37 % 140), 40 - ph * 130, 2 + ph * 2.5); }
  } },
  crawRumble: { c: 0xc8a86a, a: 0x4a2a1a, draw: (g, now, c, a) => {
    // 地鸣光环：震波环 + 地裂纹
    const rr = 30 + ((now / 900) % 1) * 80; g.lineStyle(4, c, 0.8 * (1 - (rr - 30) / 80)); g.strokeEllipse(0, 40, rr, rr * 0.3);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; g.lineStyle(2.4, a, 0.8); g.beginPath(); g.moveTo(Math.cos(ang) * 20, 40 + Math.sin(ang) * 6); g.lineTo(Math.cos(ang) * 50 + 8, 40 + Math.sin(ang) * 16); g.lineTo(Math.cos(ang) * 76, 40 + Math.sin(ang) * 24); g.strokePath(); }
  } },
  // ── 辐射变异 ──
  mutoFallout: { c: 0x5a6a3a, a: 0x7dff5a, draw: (g, now, _c, a) => {
    // 辐射环：辐射三叶符 + 尘埃
    g.save(); g.translateCanvas(0, -20); g.rotateCanvas(now / 2500);
    g.fillStyle(a, 0.85);
    for (let k = 0; k < 3; k++) { const ang = (k / 3) * TAU; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 40, ang + 0.35, ang + 1.7, false); g.closePath(); g.fillPath(); }
    g.fillStyle(0x000000, 0.6); g.fillCircle(0, 0, 10); g.fillStyle(a, 0.9); g.fillCircle(0, 0, 5);
    g.restore();
    for (let k = 0; k < 10; k++) { const ph = ((now / 1400 + k / 10) % 1); g.fillStyle(a, (1 - ph) * 0.6); g.fillCircle(-80 + (k * 47 % 160), 50 - ph * 140, 1.4 + (k % 2)); }
  } },
  mutoGlow: { c: 0x5a6a3a, a: 0x7dff5a, draw: (g, now, c, a) => {
    // 幽绿辉光 + 辐射尘
    const br = Math.sin(now / 700) * 6; g.fillStyle(c, 0.3); g.fillCircle(0, 0, 70 + br); g.fillStyle(a, 0.25); g.fillCircle(0, 0, 50 + br);
    g.lineStyle(2, a, 0.5); g.strokeEllipse(0, 0, 130, 170);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU + now / 1600; const rr = 40 + (k % 4) * 18; g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 500 + k)); g.fillCircle(Math.cos(ang) * rr, Math.sin(ang) * rr * 0.9, 1.6); }
  } },
  // ── 北海巨兽 ──
  beheDust: { c: 0x5a4030, a: 0x8a6a4a, draw: (g, now, c, a) => {
    // 沙尘环：沙尘旋绕
    g.fillStyle(c, 0.25); g.fillEllipse(0, 20, 190, 60);
    for (let k = 0; k < 18; k++) { const ph = ((now / 1600 + k / 18) % 1); const ang = k * 0.78 + now / 800; const rr = 15 + ph * 85; g.fillStyle(k % 3 ? a : c, (1 - ph) * 0.75); g.fillCircle(Math.cos(ang) * rr, -10 + Math.sin(ang) * rr * 0.85, 1.6 + (k % 3)); }
  } },
  beheMagma: { c: 0x5a4030, a: 0x8a6a4a, draw: (g, now, c, _a) => {
    // 熔岩之心：身后熔岩喷口 + 火星
    g.fillStyle(0x2a1a12, 0.85); g.fillTriangle(-40, 60, 40, 60, 0, -20);
    g.fillStyle(0xff4a1a, 0.8); g.fillTriangle(-24, 55, 24, 55, 0, 0);
    g.fillStyle(0xffd45c, 0.7); g.fillEllipse(0, -20, 70, 26);
    for (let k = 0; k < 9; k++) { const ph = ((now / 1000 + k / 9) % 1); g.fillStyle(k % 2 ? 0xffb347 : c, (1 - ph) * 0.9); g.fillCircle(-30 + (k * 37 % 60), 40 - ph * 130, 1.6 + ph * 2.4); }
  } },
};
