import { TAU, type AuraArt } from './shared';

/** 第十批光环 / 背景（梦境 / 微观 / 炼金 / 毛线 / 画中世界）——成景构图，画在角色身后 */

export const AURAS_26: Record<string, AuraArt> = {
  // ── 梦境回廊 ──
  dreamBubbles: { c: 0x9f8aff, a: 0xfff4d8, draw: (g, now, c, a) => {
    // 梦泡环绕：上浮明灭的梦泡
    for (let k = 0; k < 10; k++) { const ph = ((now / 1500 + k / 10) % 1); const bx = -70 + (k * 31 % 150), by = 40 - ph * 130; const rr = 3 + (k % 3) * 3; g.fillStyle(c, (1 - ph) * 0.35); g.fillCircle(bx, by, rr); g.lineStyle(1.2, a, (1 - ph) * 0.8); g.strokeCircle(bx, by, rr); g.fillStyle(0xffffff, (1 - ph) * 0.6); g.fillCircle(bx - rr * 0.4, by - rr * 0.4, rr * 0.3); }
  } },
  dreamStarscape: { c: 0x2a2450, a: 0xffe08a, draw: (g, now, _c, a) => {
    // 星梦：身后星空 + 缓移星点
    g.fillStyle(0x1a1440, 0.7); g.fillRect(-100, -110, 200, 150);
    for (let k = 0; k < 22; k++) { const tw = 0.4 + 0.5 * Math.abs(Math.sin(now / 700 + k)); g.fillStyle(a, tw); g.fillCircle(-92 + (k * 37 % 184), -100 + (k * 53 % 140), 1 + (k % 3) * 0.6); }
    g.fillStyle(0xffd45c, 0.9); g.fillCircle(-30, -60, 14); g.fillStyle(0x9f8aff, 0.6); g.fillEllipse(-34, -62, 10, 12);
    for (let k = 0; k < 5; k++) { const ph = ((now / 1600 + k / 5) % 1); g.fillStyle(0xffffff, (1 - ph) * 0.8); g.save(); g.translateCanvas(30 + ph * 50, -70 + ph * 60); g.rotateCanvas(0.6); g.fillEllipse(0, 0, 12, 3); g.restore(); }
  } },
  dreamClouds: { c: 0x9f8aff, a: 0xd8d0ff, draw: (g, now, c, a) => {
    // 云海：身后翻滚的云
    g.fillStyle(0x2a2450, 0.6); g.fillRect(-100, -110, 200, 150);
    for (let k = 0; k < 5; k++) { const ph = ((now / 2000 + k / 5) % 1); g.fillStyle(k % 2 ? c : a, 0.25); g.fillEllipse(-80 + ph * 20 + k * 30, 20 + Math.sin(now / 700 + k) * 6, 60, 30); }
    for (let k = 0; k < 4; k++) { g.fillStyle(0xffffff, 0.35); g.fillCircle(-60 + k * 34, 30 + Math.sin(now / 600 + k) * 4, 18); }
    for (let k = 0; k < 6; k++) { const tw = 0.4 + 0.5 * Math.abs(Math.sin(now / 800 + k)); g.fillStyle(0xffe08a, tw); g.fillCircle(-70 + (k * 41 % 150), -60 + (k * 23 % 60), 1.4); }
  } },
  dreamSpiral: { c: 0x9f8aff, a: 0xffe08a, draw: (g, now, c, a) => {
    // 螺旋回廊：盘旋向内的台阶
    g.fillStyle(0x1a1440, 0.55); g.fillRect(-100, -110, 200, 150);
    const rot = now / 1600;
    for (let k = 0; k < 22; k++) { const ang = k * 0.5 + rot; const rr = 70 - k * 2.6; const px = Math.cos(ang) * rr, py = -20 + Math.sin(ang) * rr * 0.7; g.fillStyle(k % 2 ? c : 0x7a6ab0, 0.6); g.fillRect(px - 4, py, 10, 3); }
    for (let k = 0; k < 5; k++) { const ph = ((now / 1500 + k / 5) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(-40 + k * 20, -20 - ph * 70, 1.6); }
  } },
  // ── 微观世界 ──
  microPetri: { c: 0x5fe8d0, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 培养皿光环：身后培养皿 + 蔓延菌落
    g.fillStyle(0x06141e, 0.5); g.fillEllipse(0, 10, 180, 130);
    g.fillStyle(0x2a7a8a, 0.4); g.fillEllipse(0, 20, 150, 50); g.fillStyle(0x5fe8d0, 0.2); g.fillEllipse(0, 20, 130, 42);
    for (let k = 0; k < 14; k++) { const ang = (k / 14) * TAU; const rr = 20 + ((now / 1600 + k / 14) % 1) * 45; g.fillStyle(k % 2 ? c : a, 0.7 * (1 - rr / 70)); g.fillCircle(Math.cos(ang) * rr, 20 + Math.sin(ang) * rr * 0.35, 2.4); }
    void a;
  } },
  microSwarm: { c: 0x5fe8d0, a: 0xff8ad4, draw: (g, now, c, a) => {
    // 菌群环绕：游动的菌群 + 分裂
    g.fillStyle(0x06141e, 0.45); g.fillEllipse(0, 10, 180, 140);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU + now / 2200; const split = Math.sin(now / 600 + k) > 0.6; const rr = 46; const px = Math.cos(ang) * rr, py = -8 + Math.sin(ang) * 38; g.fillStyle(k % 2 ? c : a, 0.85); g.fillEllipse(px, py, 14, 8); g.fillStyle(0x2a7a8a, 0.8); g.fillCircle(px, py, 2); if (split) { g.fillStyle(c, 0.6); g.fillEllipse(px + 10, py, 9, 6); } }
  } },
  microNucleus: { c: 0x5fe8d0, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 细胞核辉光：核膜呼吸
    const br = Math.sin(now / 600) * 4;
    g.fillStyle(0x06141e, 0.5); g.fillRect(-100, -110, 200, 150);
    g.fillStyle(c, 0.3); g.fillCircle(0, 0, 60 + br);
    g.lineStyle(3, a, 0.6); g.strokeCircle(0, 0, 54 + br);
    g.fillStyle(c, 0.5); g.fillCircle(0, 0, 44 + br);
    const nr = Math.sin(now / 400) * 3; g.fillStyle(a, 0.85); g.fillCircle(8, -6, 16 + nr); g.fillStyle(0xffffff, 0.5); g.fillCircle(4, -10, 6);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU + now / 1800; g.fillStyle(0xffffff, 0.4 + 0.4 * Math.sin(now / 500 + k)); g.fillCircle(Math.cos(ang) * 46, Math.sin(ang) * 46, 1.6); }
  } },
  // ── 炼金工坊 ──
  alchSigil: { c: 0x7dff6a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 炼金符文阵：缓转的炼成阵
    g.fillStyle(0x12200c, 0.55); g.fillEllipse(0, 0, 190, 150);
    const rot = now / 2200;
    g.save(); g.translateCanvas(0, 0); g.rotateCanvas(rot);
    g.lineStyle(2.4, c, 0.7); g.strokeCircle(0, 0, 54); g.strokeCircle(0, 0, 44);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; g.lineStyle(1.8, a, 0.7); g.lineBetween(Math.cos(ang) * 44, Math.sin(ang) * 44, Math.cos(ang + 2.09) * 44, Math.sin(ang + 2.09) * 44); g.fillStyle(a, 0.9); g.fillCircle(Math.cos(ang) * 54, Math.sin(ang) * 54, 3); }
    g.restore();
    for (let k = 0; k < 5; k++) { const ph = ((now / 1400 + k / 5) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(Math.cos(k * 1.7) * 40, Math.sin(k * 1.7) * 40 - ph * 20, 1.6); }
  } },
  alchVapor: { c: 0x7dff6a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 药气环绕：升腾的药气 + 气泡
    g.fillStyle(0x12200c, 0.4); g.fillEllipse(0, 10, 180, 140);
    for (let k = 0; k < 5; k++) { const ph = ((now / 1600 + k / 5) % 1); g.fillStyle(c, 0.22 * (1 - ph)); g.fillEllipse(-60 + k * 30 + Math.sin(now / 600 + k) * 8, 30 - ph * 120, 50, 34); }
    for (let k = 0; k < 7; k++) { const ph = ((now / 900 + k / 7) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(-60 + (k * 37 % 120), 40 - ph * 120, 2 + ph * 1.5); }
  } },
  // ── 毛线世界 ──
  yarnThreads: { c: 0xffb7d5, a: 0xffd8e8, draw: (g, now, c, a) => {
    // 丝线环绕：缠绕飘动的丝线
    for (let k = 0; k < 3; k++) { g.lineStyle(2.4, k % 2 ? c : a, 0.7); g.beginPath(); for (let i = 0; i <= 20; i++) { const t = i / 20; const ang = t * TAU * 1.5 + now / 1200 + k * 2.09; const rr = 20 + k * 14 + Math.sin(t * 6 + now / 500) * 6; g.lineTo(Math.cos(ang) * rr, -10 + Math.sin(ang) * rr * 0.8); } g.strokePath(); }
  } },
  yarnLint: { c: 0xffd8e8, a: 0xffb7d5, draw: (g, now, c, a) => {
    // 飞絮：升腾的绒毛
    for (let k = 0; k < 16; k++) { const ph = ((now / 1600 + k / 16) % 1); const bx = -80 + (k * 31 % 160) + Math.sin(now / 500 + k) * 6, by = 40 - ph * 140; g.fillStyle(k % 2 ? c : a, (1 - ph) * 0.7); g.fillCircle(bx, by, 1.6 + (k % 2)); }
  } },
  yarnSparkle: { c: 0xffe040, a: 0xffb7d5, draw: (g, now, c, a) => {
    // 亮片：旋绕闪光的亮片
    g.fillStyle(0x3a1e30, 0.35); g.fillEllipse(0, 0, 180, 150);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU + now / 1800; const rr = 50; const on = Math.max(0, Math.sin(now / 350 + k)); g.fillStyle(k % 2 ? c : a, on * 0.9); g.save(); g.translateCanvas(Math.cos(ang) * rr, Math.sin(ang) * rr * 0.75); g.rotateCanvas(ang); g.fillRect(-3, -2, 6, 4); g.restore(); }
  } },
  yarnUnravel: { c: 0xffb7d5, a: 0xffd8e8, draw: (g, now, c, a) => {
    // 拆线漩涡：线股卷入漩涡
    for (let k = 0; k < 22; k++) { const ph = ((now / 1600 + k / 22) % 1); const ang = k * 0.7 + now / 900; const rr = 70 * (1 - ph) + 6; g.fillStyle(k % 2 ? c : a, 0.8 * (1 - Math.abs(ph - 0.5) * 1.2)); g.fillCircle(Math.cos(ang) * rr, -10 + Math.sin(ang) * rr * 0.7, 1.6); }
  } },
  // ── 画中世界 ──
  paintSwirls: { c: 0xff8ad4, a: 0xffd45c, draw: (g, now, c, a) => {
    // 颜料漩涡：旋转的颜料
    const cols = [0xff4a4a, 0xffd45c, 0x7dff9a, 0x5ac8ff, 0xff8ad4];
    for (let k = 0; k < 3; k++) { const ang0 = now / 1500 + k * 2.09; g.fillStyle(cols[k], 0.35); g.beginPath(); for (let i = 0; i <= 18; i++) { const t = i / 18; const ang = ang0 + t * TAU * 1.4; const rr = 12 + t * 50; g.lineTo(Math.cos(ang) * rr, -10 + Math.sin(ang) * rr * 0.8); } g.strokePath(); }
    void c; void a;
  } },
  paintDrips: { c: 0xff8ad4, a: 0xffd45c, draw: (g, now, c, a) => {
    // 滴彩：身后滴落的颜料
    const cols = [0xff4a4a, 0xffd45c, 0x5ac8ff, 0xff8ad4];
    for (let k = 0; k < 10; k++) { const ph = ((now / 1400 + k / 10) % 1); const bx = -80 + (k * 37 % 160); g.fillStyle(cols[k % 4], 0.85); g.fillEllipse(bx, 40 + ph * 50, 5, 8); g.fillRect(bx - 2, 40, 4, ph * 50); }
    void c; void a;
  } },
  paintFrames: { c: 0xffd45c, a: 0xff8ad4, draw: (g, now, c, a) => {
    // 画框环绕：环绕轮转的空画框
    for (let k = 0; k < 5; k++) { const ang = (k / 5) * TAU + now / 1600; const px = Math.cos(ang) * 58, py = -8 + Math.sin(ang) * 40; g.fillStyle(0x5a3f6a, 0.9); g.fillRect(px - 11, py - 9, 22, 18); g.fillStyle(c, 1); g.fillRect(px - 13, py - 11, 26, 4); g.fillRect(px - 13, py + 7, 26, 4); g.fillRect(px - 13, py - 11, 4, 22); g.fillRect(px + 9, py - 11, 4, 22); g.fillStyle(a, 0.4 + 0.4 * Math.abs(Math.sin(now / 500 + k))); g.fillRect(px - 8, py - 6, 16, 12); }
  } },
  paintGallery: { c: 0x5a3f6a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 画廊光环：一整面画廊墙 + 射灯
    g.fillStyle(0x2a1c3a, 0.8); g.fillRect(-100, -110, 200, 150);
    const cols = [0xff8ad4, 0x5ac8ff, 0x7dff9a, 0xffd45c, 0xff4a4a, 0x9f8aff];
    for (let r = 0; r < 2; r++) { for (let k = 0; k < 3; k++) { const px = -70 + k * 60, py = -70 + r * 55; const scene = (Math.floor(now / 1500) + r * 3 + k) % 6; g.fillStyle(c, 1); g.fillRect(px - 20, py - 18, 40, 36); g.fillStyle(cols[scene], 0.9); g.fillRect(px - 16, py - 14, 32, 28); g.fillStyle(0xffffff, 0.3); g.fillTriangle(px - 16, py + 14, px + 16, py + 14, px + 2, py - 14); } }
    g.fillStyle(a, 0.25); for (let k = 0; k < 3; k++) { g.fillTriangle(-70 + k * 60 - 16, -100, -70 + k * 60 + 16, -100, -70 + k * 60, -70); }
    for (let k = 0; k < 5; k++) { const tw = 0.4 + 0.5 * Math.abs(Math.sin(now / 500 + k)); g.fillStyle(a, tw); g.fillCircle(-70 + k * 30, 40, 1.6); }
  } },
};
