import { TAU, type SwingArt, type SwingKit } from './shared';

/** 第十一批挥拍拖尾（SCP 收容 / 恐怖 10 主题）——按名字沿真实拍头轨迹构图 */

function tang(k: SwingKit, i: number): number {
  const a = k.pts[Math.max(0, i - 1)], b = k.pts[Math.min(k.n - 1, i + 1)];
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export const SWINGS_23: Record<string, SwingArt> = {
  scpContainSwing: { a: 0xffd45c, draw: (g, now, hot, kit, c, a) => {
    // 收容突袭斩：沿途落下一圈圈收容封印环
    kit.ribbon(6, 0x4a5a4a, 0.4); kit.core(3, 0.7);
    for (let i = 2; i < kit.n - 1; i += 3) {
      const p = kit.at(i); const t = tang(kit, i);
      g.save(); g.translateCanvas(p.x, p.y); g.rotateCanvas(t);
      g.lineStyle(1.6, c, kit.pts[i].a * 0.8); g.strokeCircle(0, 0, 8);
      g.lineStyle(1.2, a, kit.pts[i].a * 0.7); g.lineBetween(0, -8, 0, 8);
      g.restore();
    }
    const e = kit.at(kit.n - 1);
    g.lineStyle(2, c, 0.8 * hot); g.strokeCircle(e.x, e.y, 22 * hot + 4);
    for (let k = 0; k < 9; k++) { const ang = (k / 9) * TAU + now / 120; g.fillStyle(a, 0.85); g.fillCircle(e.x + Math.cos(ang) * 30 * hot, e.y + Math.sin(ang) * 30 * hot, 2.2); }
  } },
  keterDevour: { a: 0xff5a5a, draw: (g, now, hot, kit, c, a) => {
    // 吞噬斩：沿轨迹的张合血口与利齿
    kit.ribbon(8, 0x5a1414, 0.5); kit.core(4, 0.8);
    for (let i = 2; i < kit.n - 1; i += 2) {
      const p = kit.at(i); const t = tang(kit, i);
      g.save(); g.translateCanvas(p.x, p.y); g.rotateCanvas(t);
      g.fillStyle(0x3a0a0a, kit.pts[i].a * 0.8); g.fillEllipse(0, 0, 12, 8);
      g.fillStyle(c, kit.pts[i].a * 0.9);
      for (let k = -1; k <= 1; k++) g.fillTriangle(k * 4, 0, k * 4 - 2, -6, k * 4 + 2, -6);
      g.restore();
    }
    const e = kit.at(kit.n - 1);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU + now / 110; const r = (16 + (k % 3) * 8) * hot; g.fillStyle(a, 0.85); g.fillTriangle(e.x + Math.cos(ang) * r, e.y + Math.sin(ang) * r, e.x + Math.cos(ang + 0.3) * (r - 6), e.y + Math.sin(ang + 0.3) * (r - 6), e.x + Math.cos(ang - 0.3) * (r - 6), e.y + Math.sin(ang - 0.3) * (r - 6)); }
  } },
  shyLunge: { a: 0x6a7a8a, draw: (g, now, hot, kit, c, a) => {
    // 暴走扑杀斩：一条剧烈颤抖的尖刺轨迹
    kit.ribbon(6, 0x8a94a2, 0.4); kit.core(3, 0.7);
    for (let i = 2; i < kit.n - 1; i += 2) {
      const p = kit.at(i); const t = tang(kit, i) + Math.sin(now / 100 + i) * 0.25;
      g.lineStyle(1.6, a, kit.pts[i].a * 0.8); g.lineBetween(p.x, p.y, p.x + Math.cos(t + 1.1) * 10, p.y + Math.sin(t + 1.1) * 10);
      g.lineStyle(1.6, c, kit.pts[i].a * 0.7); g.lineBetween(p.x, p.y, p.x + Math.cos(t - 1.1) * 10, p.y + Math.sin(t - 1.1) * 10);
    }
    const e = kit.at(kit.n - 1);
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU + now / 80; g.fillStyle(a, 0.8); g.fillCircle(e.x + Math.cos(ang) * 26 * hot, e.y + Math.sin(ang) * 26 * hot, 1.8); }
  } },
  rakeRend: { a: 0xd8d0c0, draw: (g, now, hot, kit, c, a) => {
    // 撕咬斩：沿轨迹划出四道平行爪痕
    kit.ribbon(6, 0x4a4038, 0.4); kit.core(3, 0.7);
    for (let i = 2; i < kit.n - 1; i += 2) {
      const p = kit.at(i); const t = tang(kit, i);
      const nx = Math.cos(t + 1.5708), ny = Math.sin(t + 1.5708);
      for (let k = 0; k < 4; k++) {
        const o = (k - 1.5) * 3.4;
        g.lineStyle(1.6, k % 2 ? a : c, kit.pts[i].a * 0.8);
        g.lineBetween(p.x + nx * o, p.y + ny * o, p.x + nx * o + Math.cos(t) * 8, p.y + ny * o + Math.sin(t) * 8);
      }
    }
    const e = kit.at(kit.n - 1);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU + now / 130; g.lineStyle(1.6, a, 0.8); g.lineBetween(e.x, e.y, e.x + Math.cos(ang) * 30 * hot, e.y + Math.sin(ang) * 30 * hot); }
  } },
  wendiGore: { a: 0xd8e8f0, draw: (g, now, hot, kit, c, a) => {
    // 鹿角冲锋斩：沿轨迹伸出分叉鹿角
    kit.ribbon(7, 0x6a5840, 0.4); kit.core(3, 0.7);
    for (let i = 2; i < kit.n - 1; i += 4) {
      const p = kit.at(i); const t = tang(kit, i);
      const nx = Math.cos(t + 1.5708), ny = Math.sin(t + 1.5708);
      g.lineStyle(2, c, kit.pts[i].a * 0.9);
      g.lineBetween(p.x, p.y, p.x + nx * 10, p.y + ny * 10);
      g.lineBetween(p.x + nx * 10, p.y + ny * 10, p.x + nx * 16, p.y + ny * 16);
      g.lineBetween(p.x, p.y, p.x - nx * 10, p.y - ny * 10);
    }
    const e = kit.at(kit.n - 1);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU + now / 140; const r = 30 * hot; g.lineStyle(2, a, 0.85); g.lineBetween(e.x, e.y, e.x + Math.cos(ang) * r, e.y + Math.sin(ang) * r); g.fillStyle(a, 0.9); g.fillCircle(e.x + Math.cos(ang) * r, e.y + Math.sin(ang) * r, 2); }
  } },
  mothmDive: { a: 0xff3a3a, draw: (g, now, hot, kit, c, a) => {
    // 巨蛾俯冲斩：沿轨迹展开一对蛾翅
    kit.ribbon(8, 0x4a3420, 0.5); kit.core(4, 0.8);
    for (let i = 2; i < kit.n - 1; i += 3) {
      const p = kit.at(i); const t = tang(kit, i);
      g.save(); g.translateCanvas(p.x, p.y); g.rotateCanvas(t);
      const w = 10 + kit.pts[i].w;
      g.fillStyle(a, kit.pts[i].a * 0.7); g.fillEllipse(0, -w * 0.6, w * 1.6, w);
      g.fillStyle(c, kit.pts[i].a * 0.8); g.fillEllipse(0, w * 0.6, w * 1.6, w);
      g.restore();
    }
    const e = kit.at(kit.n - 1);
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU + now / 120; g.fillStyle(a, 0.8); g.fillEllipse(e.x + Math.cos(ang) * 30 * hot, e.y + Math.sin(ang) * 30 * hot, 4, 2.4); }
  } },
  gbeastSmash: { a: 0xffb347, draw: (g, now, hot, kit, c, a) => {
    // 巨猿横扫斩：沿轨迹砸出的巨拳与冲击环
    kit.ribbon(9, 0x5a4028, 0.5); kit.core(5, 0.85);
    for (let i = 3; i < kit.n - 1; i += 4) {
      const p = kit.at(i);
      g.fillStyle(c, kit.pts[i].a * 0.9); g.fillCircle(p.x, p.y, 7 + kit.pts[i].w * 0.4);
      g.fillStyle(0x3a2818, kit.pts[i].a * 0.8); g.fillRoundedRect(p.x - 5, p.y - 4, 10, 8, 3);
    }
    const e = kit.at(kit.n - 1);
    g.lineStyle(3, a, 0.85 * hot); g.strokeCircle(e.x, e.y, 30 * hot + 4);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU + now / 90; g.fillStyle(a, 0.85); g.fillTriangle(e.x + Math.cos(ang) * 34 * hot, e.y + Math.sin(ang) * 34 * hot, e.x + Math.cos(ang + 0.3) * 24 * hot, e.y + Math.sin(ang + 0.3) * 24 * hot, e.x + Math.cos(ang - 0.3) * 24 * hot, e.y + Math.sin(ang - 0.3) * 24 * hot); }
  } },
  crawBite: { a: 0x4a2a1a, draw: (g, now, hot, kit, c, a) => {
    // 骨爬撕咬斩：沿轨迹一张一合的骨颚
    kit.ribbon(7, 0x6a5a3a, 0.4); kit.core(3, 0.7);
    for (let i = 2; i < kit.n - 1; i += 2) {
      const p = kit.at(i); const t = tang(kit, i);
      g.save(); g.translateCanvas(p.x, p.y); g.rotateCanvas(t);
      g.fillStyle(c, kit.pts[i].a * 0.9);
      g.fillTriangle(-2, -7, 2, -7, 0, 2);
      g.fillTriangle(-2, 7, 2, 7, 0, -2);
      g.fillStyle(0x4a2a1a, kit.pts[i].a * 0.9); g.fillCircle(0, 0, 3);
      g.restore();
    }
    const e = kit.at(kit.n - 1);
    for (let k = 0; k < 9; k++) { const ang = (k / 9) * TAU + now / 120; g.fillStyle(k % 2 ? a : c, 0.85); g.fillTriangle(e.x + Math.cos(ang) * 28 * hot, e.y + Math.sin(ang) * 28 * hot, e.x + Math.cos(ang + 0.2) * 18, e.y + Math.sin(ang + 0.2) * 18, e.x + Math.cos(ang - 0.2) * 18, e.y + Math.sin(ang - 0.2) * 18); }
  } },
  mutoSting: { a: 0x7dff5a, draw: (g, now, hot, kit, c, a) => {
    // 巨虫穿刺斩：沿轨迹甩出的长针刺
    kit.ribbon(6, 0x3a4a2a, 0.4); kit.core(3, 0.7);
    for (let i = 2; i < kit.n - 1; i += 3) {
      const p = kit.at(i); const t = tang(kit, i);
      const tip = 12 + kit.pts[i].w;
      g.lineStyle(2, c, kit.pts[i].a * 0.85);
      g.lineBetween(p.x, p.y, p.x + Math.cos(t) * tip, p.y + Math.sin(t) * tip);
      g.fillStyle(a, kit.pts[i].a * 0.9);
      g.fillCircle(p.x + Math.cos(t) * tip, p.y + Math.sin(t) * tip, 2.4);
    }
    const e = kit.at(kit.n - 1);
    g.fillStyle(a, 0.9); g.fillTriangle(e.x + Math.cos(now / 90) * 34 * hot, e.y + Math.sin(now / 90) * 34 * hot, e.x + 6, e.y + 6, e.x - 6, e.y - 6);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU + now / 140; g.fillStyle(c, 0.7); g.fillCircle(e.x + Math.cos(ang) * 22 * hot, e.y + Math.sin(ang) * 22 * hot, 1.8); }
  } },
  behemothCharge: { a: 0x8a6a4a, draw: (g, now, hot, kit, c, a) => {
    // 巨兽冲撞斩：一道厚重躯体碾过的冲击
    kit.ribbon(11, 0x3a2a1a, 0.55); kit.core(6, 0.9);
    for (let i = 2; i < kit.n - 1; i += 3) {
      const p = kit.at(i);
      g.fillStyle(0x6a5a4a, kit.pts[i].a * 0.6); g.fillCircle(p.x, p.y, 6 + kit.pts[i].w * 0.5);
      g.fillStyle(c, kit.pts[i].a * 0.8); g.fillEllipse(p.x, p.y, 10, 6);
    }
    const e = kit.at(kit.n - 1);
    g.lineStyle(4, a, 0.8 * hot); g.strokeCircle(e.x, e.y, 36 * hot + 4);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU + now / 100; const r = (20 + (k % 4) * 8) * hot; g.fillStyle(k % 2 ? a : c, 0.8); g.fillCircle(e.x + Math.cos(ang) * r, e.y + Math.sin(ang) * r, 2.4); }
  } },
};
