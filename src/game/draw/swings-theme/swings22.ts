import { TAU, type SwingArt, type SwingKit } from './shared';

/** 第十批挥拍拖尾（梦境 / 微观 / 炼金 / 毛线 / 画中世界）——按名字沿真实拍头轨迹构图 */

function tang(k: SwingKit, i: number): number {
  const a = k.pts[Math.max(0, i - 1)], b = k.pts[Math.min(k.n - 1, i + 1)];
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export const SWINGS_22: Record<string, SwingArt> = {
  dreamSpiralSwing: { a: 0xffe08a, draw: (g, now, hot, kit, c, a) => {
    // 螺旋回廊斩：台阶沿轨迹盘升
    kit.ribbon(6, 0x6a5a9a, 0.4); kit.core(3, 0.7);
    for (let i = 2; i < kit.n - 1; i += 2) { const p = kit.at(i); const step = Math.floor(i / 2) % 2; g.fillStyle(step ? c : 0x8a78c8, kit.pts[i].a * 0.85); g.fillRect(p.x - 6, p.y - 3, 12 + kit.pts[i].w, 4); }
    const e = kit.at(kit.n - 1); for (let k = 0; k < 6; k++) { const ang = k / 6 * TAU + now / 120; g.fillStyle(a, 0.8); g.fillCircle(e.x + Math.cos(ang) * 30 * hot, e.y + Math.sin(ang) * 30 * hot, 2); }
  } },
  microDivision: { a: 0x39ffd0, draw: (g, now, hot, kit, c, a) => {
    // 细胞分裂斩：一分为二的细胞沿轨迹裂开
    kit.ribbon(6, 0x2a7a8a, 0.4); kit.core(3, 0.7);
    for (let i = 2; i < kit.n - 1; i += 2) { const p = kit.at(i); const t = tang(kit, i); g.save(); g.translateCanvas(p.x, p.y); g.rotateCanvas(t + 1.57); const gap = kit.pts[i].w * 0.6 + 2; g.fillStyle(c, kit.pts[i].a * 0.85); g.fillEllipse(-gap, 0, 12, 9); g.fillEllipse(gap, 0, 12, 9); g.fillStyle(0x39ffd0, kit.pts[i].a * 0.7); g.fillCircle(-gap, 0, 3); g.fillCircle(gap, 0, 3); g.restore(); }
    const e = kit.at(kit.n - 1); for (let k = 0; k < 8; k++) { const ang = k / 8 * TAU + now / 140; g.fillStyle(a, 0.85); g.fillCircle(e.x + Math.cos(ang) * 28 * hot, e.y + Math.sin(ang) * 28 * hot, 2.2); }
  } },
  alchTransmute: { a: 0xffd45c, draw: (g, now, hot, kit, c, a) => {
    // 转化斩：沿轨迹的炼成光阵
    kit.ribbon(6, 0x2a4a1a, 0.4); kit.core(3, 0.7);
    for (let i = 3; i < kit.n - 1; i += 4) { const p = kit.at(i); g.save(); g.translateCanvas(p.x, p.y); g.rotateCanvas(now / 300 + i); g.lineStyle(1.8, c, kit.pts[i].a * 0.8); g.strokeCircle(0, 0, 9); for (let k = 0; k < 4; k++) { const ang = (k / 4) * TAU; g.lineBetween(Math.cos(ang) * 6, Math.sin(ang) * 6, Math.cos(ang) * 9, Math.sin(ang) * 9); } g.restore(); }
    const e = kit.at(kit.n - 1); for (let k = 0; k < 9; k++) { const ang = k / 9 * TAU + now / 130; g.fillStyle(k % 2 ? a : 0x7dff6a, 0.85); g.fillCircle(e.x + Math.cos(ang) * 30 * hot, e.y + Math.sin(ang) * 30 * hot, 2.2); }
  } },
  yarnUnravelSwing: { a: 0xffd8e8, draw: (g, now, hot, kit, c, a) => {
    // 拆线斩：被拆开的线股散开回卷
    kit.ribbon(5, 0xa86a8a, 0.4);
    for (let i = 2; i < kit.n - 1; i += 2) { const p = kit.at(i); const t = tang(kit, i); g.save(); g.translateCanvas(p.x, p.y); g.rotateCanvas(t); for (let k = -1; k <= 1; k++) { g.lineStyle(2, k === 0 ? c : a, kit.pts[i].a * 0.8); g.beginPath(); g.moveTo(-6, k * 4); g.lineTo(0, k * 4 + Math.sin(now / 300 + i) * 3); g.lineTo(6, k * 4); g.strokePath(); } g.restore(); }
    const e = kit.at(kit.n - 1); for (let k = 0; k < 6; k++) { const ang = k / 6 * TAU + now / 150; g.fillStyle(a, 0.8); g.fillCircle(e.x + Math.cos(ang) * 26 * hot, e.y + Math.sin(ang) * 26 * hot, 1.8); }
  } },
  paintSplash: { a: 0xffd45c, draw: (g, now, hot, kit, c, a) => {
    // 泼彩斩：挥出一大片泼彩 + 飞白
    kit.ribbon(10, c, 0.6); kit.core(4, 0.8);
    const cols = [0xff4a4a, 0xffd45c, 0x7dff9a, 0x5ac8ff, 0xff8ad4];
    for (let i = 2; i < kit.n - 1; i += 2) { const p = kit.at(i); g.fillStyle(cols[(i / 2) % 5], kit.pts[i].a * 0.5); g.fillEllipse(p.x, p.y, 14 + kit.pts[i].w, 6); }
    const e = kit.at(kit.n - 1); for (let k = 0; k < 12; k++) { const ang = k / 12 * TAU + now / 120; g.fillStyle(cols[k % 5], 0.85); g.fillCircle(e.x + Math.cos(ang) * 34 * hot, e.y + Math.sin(ang) * 34 * hot, 2.6); }
    void a;
  } },
};
