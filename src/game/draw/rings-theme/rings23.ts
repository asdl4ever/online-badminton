import { TAU, type RingArt } from './shared';

/** 第十一批地环（SCP / 恐怖 / 灾难 / 变异 / 北海巨兽）——原点 (x, feetY)，地面基准 feetY-3 */

export const RINGS_23: Record<string, RingArt> = {
  // ── 收容设施 ──
  scpHazardRing: { c: 0x8a9a8a, a: 0xffd45c, draw: (g, now, x, feetY, _c, a) => {
    // 警戒地环：黄黑警戒纹地环
    const ry = feetY - 3;
    g.fillStyle(0x1a1a1a, 0.8); g.fillEllipse(x, ry, 52, 14);
    g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.28);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU; g.fillStyle(k % 2 ? a : 0x1a1a1a, 0.95); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 50, ang, ang + 0.28, false); g.closePath(); g.fillPath(); }
    g.restore();
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, ry, 12, 4);
  } },
  // ── 血肉增殖 ──
  keterFleshRing: { c: 0xa03030, a: 0xff5a5a, draw: (g, now, x, feetY, c, a) => {
    // 增殖地环：肉瘤球地环
    const ry = feetY - 3;
    g.fillStyle(0x601818, 0.7); g.fillEllipse(x, ry, 54, 15);
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU; const rr = 24 + Math.sin(now / 500 + k) * 3; const px = x + Math.cos(ang) * rr, py = ry + Math.sin(ang) * rr * 0.3; const pr = 4 + (k % 3); g.fillStyle(k % 2 ? c : 0x701818, 0.9); g.fillCircle(px, py, pr); g.fillStyle(a, 0.7); g.fillCircle(px, py, pr * 0.4); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 400)); g.fillEllipse(x, ry, 14, 5);
  } },
  // ── 沉默惊惧 ──
  shyTearRing: { c: 0xe8e8e0, a: 0x6a7a8a, draw: (g, now, x, feetY, c, a) => {
    // 泪痕地环：泪滴/眼形地环
    const ry = feetY - 3;
    g.fillStyle(0x2a3a44, 0.5); g.fillEllipse(x, ry, 52, 14);
    g.lineStyle(2.4, a, 0.7); g.strokeEllipse(x, ry, 44, 12);
    for (let k = 0; k < 5; k++) { const ang = (k / 5) * TAU + now / 1500; const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 6; const dr = 3 + Math.abs(Math.sin(now / 600 + k)) * 2; g.fillStyle(c, 0.9); g.fillCircle(px, py, dr); g.fillStyle(a, 0.7); g.fillTriangle(px, py - dr - 5, px - dr * 0.5, py - dr, px + dr * 0.5, py - dr); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, ry, 12, 4);
  } },
  // ── 夜色窥视 ──
  rakeClawRing: { c: 0x8a8070, a: 0xd8d0c0, draw: (g, now, x, feetY, c, a) => {
    // 爪痕地环：四道爪痕
    const ry = feetY - 3;
    g.fillStyle(0x1a1610, 0.5); g.fillEllipse(x, ry, 54, 15);
    for (let k = 0; k < 4; k++) { const ox = x - 18 + k * 12; g.lineStyle(3, a, 0.9); g.beginPath(); g.moveTo(ox - 6, ry + 6); g.lineTo(ox, ry - 6); g.lineTo(ox + 6, ry + 6); g.strokePath(); g.fillStyle(c, 0.4); g.fillEllipse(ox, ry, 4, 2); }
    g.fillStyle(a, 0.3 + 0.25 * Math.sin(now / 400)); g.fillEllipse(x, ry, 12, 4);
  } },
  // ── 寒潮饥荒 ──
  wendiSnowRing: { c: 0x9a8060, a: 0xd8e8f0, draw: (g, now, x, feetY, c, a) => {
    // 雪痕地环：雪印脚印环
    const ry = feetY - 3;
    g.fillStyle(0xbfd8e8, 0.4); g.fillEllipse(x, ry, 56, 15);
    for (let k = 0; k < 5; k++) { const ang = (k / 5) * TAU + now / 2000; const px = x + Math.cos(ang) * 26, py = ry + Math.sin(ang) * 7; g.fillStyle(c, 0.85); g.fillEllipse(px, py, 8, 12); g.fillStyle(a, 0.9); for (let j = 0; j < 3; j++) g.fillCircle(px - 3 + j * 3, py - 9, 1.4); }
    g.fillStyle(a, 0.5); g.fillEllipse(x, ry, 12, 4);
  } },
  // ── 蛾群灾兆 ──
  mothmDustRing: { c: 0x7a5a3a, a: 0xff3a3a, draw: (g, now, x, feetY, c, a) => {
    // 鳞粉地环：散落鳞粉
    const ry = feetY - 3;
    g.fillStyle(0x3a2a1a, 0.4); g.fillEllipse(x, ry, 54, 14);
    for (let k = 0; k < 16; k++) { const ang = (k / 16) * TAU; const rr = 10 + ((k * 37) % 40); const px = x + Math.cos(ang) * rr, py = ry + Math.sin(ang) * rr * 0.28; const tw = 0.4 + 0.5 * Math.abs(Math.sin(now / 400 + k)); g.fillStyle(k % 3 === 0 ? a : c, tw); g.fillCircle(px, py, 1.4 + (k % 3) * 0.8); }
    g.fillStyle(a, 0.35 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, ry, 10, 3);
  } },
  // ── 巨兽怒潮 ──
  gbeastQuakeRing: { c: 0x8a5a3a, a: 0xffb347, draw: (g, now, x, feetY, c, a) => {
    // 震地地环：震裂纹 + 碎石
    const ry = feetY - 3;
    g.fillStyle(0x2a1c12, 0.5); g.fillEllipse(x, ry, 56, 15);
    const rr = 20 + ((now / 800) % 1) * 26; g.lineStyle(2.4, a, 0.6 * (1 - (rr - 20) / 26)); g.strokeEllipse(x, ry, rr, rr * 0.28);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; g.lineStyle(2, c, 0.9); g.beginPath(); g.moveTo(x, ry); g.lineTo(x + Math.cos(ang) * 26, ry + Math.sin(ang) * 8); g.strokePath(); }
    for (let k = 0; k < 5; k++) { const ang = (k / 5) * TAU + 0.6; g.fillStyle(c, 0.9); g.fillTriangle(x + Math.cos(ang) * 24 - 3, ry + Math.sin(ang) * 7, x + Math.cos(ang) * 24 + 3, ry + Math.sin(ang) * 7, x + Math.cos(ang) * 24, ry + Math.sin(ang) * 7 - 5); }
  } },
  // ── 毒沼地鸣 ──
  crawTrackRing: { c: 0xc8a86a, a: 0x4a2a1a, draw: (g, _now, x, feetY, c, a) => {
    // 爪印地环：爪印 + 裂蛋壳
    const ry = feetY - 3;
    g.fillStyle(0x2a1a0e, 0.45); g.fillEllipse(x, ry, 56, 15);
    g.fillStyle(a, 0.85); g.fillEllipse(x - 10, ry + 1, 14, 11); g.fillEllipse(x + 12, ry - 1, 14, 11);
    for (let k = 0; k < 3; k++) { g.fillStyle(a, 0.85); g.fillCircle(x - 10 + (k - 1) * 5, ry - 6, 1.8); g.fillCircle(x + 12 + (k - 1) * 5, ry - 8, 1.8); }
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; g.fillStyle(c, 0.8); g.fillTriangle(x + Math.cos(ang) * 22, ry + Math.sin(ang) * 6, x + Math.cos(ang) * 22 + 5, ry + Math.sin(ang) * 6, x + Math.cos(ang) * 22 + 2, ry + Math.sin(ang) * 6 - 6); }
  } },
  // ── 辐射变异 ──
  mutoCrackRing: { c: 0x5a6a3a, a: 0x7dff5a, draw: (g, now, x, feetY, c, a) => {
    // 辐射裂纹：发光辐射裂纹
    const ry = feetY - 3;
    g.fillStyle(0x1a2410, 0.55); g.fillEllipse(x, ry, 56, 15);
    for (let k = 0; k < 7; k++) { const ang = (k / 7) * TAU + 0.3; g.lineStyle(2.4, a, 0.5 + 0.4 * Math.sin(now / 400 + k)); g.beginPath(); g.moveTo(x, ry); g.lineTo(x + Math.cos(ang) * 16, ry + Math.sin(ang) * 5); g.lineTo(x + Math.cos(ang) * 28, ry + Math.sin(ang) * 9); g.strokePath(); }
    g.fillStyle(c, 0.4 + 0.3 * Math.sin(now / 500)); g.fillEllipse(x, ry, 14, 5);
  } },
  // ── 北海巨兽 ──
  beheFootRing: { c: 0x5a4030, a: 0x8a6a4a, draw: (g, now, x, feetY, c, _a) => {
    // 巨足地环：巨足印地环
    const ry = feetY - 3;
    g.fillStyle(0x2a1c12, 0.6); g.fillEllipse(x, ry, 60, 16);
    g.fillStyle(c, 0.95); g.fillEllipse(x, ry, 26, 12);
    for (let k = 0; k < 4; k++) { const ang = -0.9 - k * 0.5; g.fillCircle(x + Math.cos(ang) * 22, ry + Math.sin(ang) * 10 - 4, 4); }
    g.fillStyle(0x8a6a4a, 0.5 + 0.3 * Math.sin(now / 400)); g.fillEllipse(x, ry - 2, 16, 6);
  } },
};
