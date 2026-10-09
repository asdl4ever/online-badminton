import { TAU, type G, type SwingArt, type SwingKit } from './shared';

/**
 * 第六批挥拍拖尾（斯拉夫 / 波斯 / 印加 / 波利尼西亚 / 澳洲梦幻时代）——按名字重新构图：
 * 巫婆研钵斩 = 巨型研钵抡出 + 巫火 + 碎骨；神鸟焚空 = 神鸟俯冲 + 火焰飞羽；
 * 烈日斩 = 日轮劈出 + 金芒 + 鹰羽；缚日之斩 = 神钩索住太阳；虹蛇创世斩 = 虹蛇窜出 + 七色鳞浪。
 */

type Pt = { x: number; y: number };
function nrm(k: SwingKit, i: number): Pt {
  const a = k.pts[Math.max(0, i - 1)], b = k.pts[Math.min(k.n - 1, i + 1)];
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
  return { x: -dy / l, y: dx / l };
}
function tanOf(k: SwingKit, i: number): Pt {
  const a = k.pts[Math.max(0, i - 1)], b = k.pts[Math.min(k.n - 1, i + 1)];
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
  return { x: dx / l, y: dy / l };
}
function halo(g: G, k: SwingKit, color: number, a: number): void {
  for (let i = 1; i < k.n; i++) { g.lineStyle(Math.max(1, k.pts[i].w * 1.7), color, k.pts[i].a * a); g.lineBetween(k.pts[i - 1].x, k.pts[i - 1].y, k.pts[i].x, k.pts[i].y); }
}
function band(g: G, k: SwingKit, color: number, al: number): void {
  for (let i = 1; i < k.n; i++) {
    const np = nrm(k, i), q = k.pts[i - 1], p = k.pts[i];
    const w = p.w * (0.4 + 0.6 * i / (k.n - 1));
    g.fillStyle(color, p.a * al);
    g.fillPoints([{ x: q.x + nrm(k, i - 1).x * w, y: q.y + nrm(k, i - 1).y * w }, { x: p.x + np.x * w, y: p.y + np.y * w }, { x: p.x - np.x * w, y: p.y - np.y * w }, { x: q.x - nrm(k, i - 1).x * w, y: q.y - nrm(k, i - 1).y * w }] as never, true);
  }
}

export const SWINGS_18: Record<string, SwingArt> = {
  slavBabaSwing: { a: 0x8fd45a, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const wood = 0x6a4a2a, fire = 0x7dff6a;
    halo(g, k, 0x8fd45a, 0.12);
    band(g, k, fire, 0.35);
    // 末端抡出的巨型木研钵
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const ang = Math.atan2(dir.y, dir.x);
    g.save(); g.translateCanvas(tip.x + dir.x * 10, tip.y + dir.y * 10); g.rotateCanvas(ang + Math.PI / 2);
    const s = 20 + hot * 6;
    g.fillStyle(0x3a2814, 1); g.fillPoints([{ x: -s, y: -s * 0.6 }, { x: s, y: -s * 0.6 }, { x: s * 0.7, y: s }] as never, true);
    g.fillStyle(wood, 1); g.fillPoints([{ x: -s * 0.85, y: -s * 0.5 }, { x: s * 0.85, y: -s * 0.5 }, { x: s * 0.6, y: s * 0.85 }] as never, true);
    g.fillStyle(fire, 0.7); g.fillEllipse(0, -s * 0.5, s * 1.4, s * 0.5);
    g.fillStyle(0xd8ff9a, 0.8 + 0.2 * hot); g.fillEllipse(0, -s * 0.5, s * 0.6, s * 0.3);
    g.restore();
    // 巫火扇形
    for (let j = 0; j < 7; j++) { const a2 = Math.atan2(dir.y, dir.x) + (j - 3) * 0.32; g.fillStyle(j % 2 ? fire : 0x2a7a2a, (0.6 - hot * 0.3) * tip.a); g.fillPoints([{ x: tip.x, y: tip.y }, { x: tip.x + Math.cos(a2 - 0.1) * 26, y: tip.y + Math.sin(a2 - 0.1) * 26 }, { x: tip.x + Math.cos(a2) * 34, y: tip.y + Math.sin(a2) * 34 }, { x: tip.x + Math.cos(a2 + 0.1) * 26, y: tip.y + Math.sin(a2 + 0.1) * 26 }] as never, true); }
    // 碎骨
    for (let j = 0; j < 6; j++) { const a2 = (j / 6) * TAU + now / 260; const rr = 8 + hot * 20; g.fillStyle(0xd8e0d0, 0.8 * tip.a); g.fillRect(tip.x + Math.cos(a2) * rr - 1.5, tip.y + Math.sin(a2) * rr - 1.5, 3, 3); }
    // 末端乌鸦
    g.fillStyle(0x1a1a24, 0.8 * tip.a); g.fillEllipse(tip.x - dir.x * 20, tip.y - dir.y * 20, 10, 4);
  } },
  persSimurghSweep: { a: 0xff9a3c, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const flame = 0xff5a2a, gold = 0xffd45c, feather = 0xffb04a;
    halo(g, k, 0xffd45c, 0.12);
    band(g, k, flame, 0.4);
    // 沿轨迹铺开的火焰飞羽带
    for (let i = 2; i < n; i += 2) {
      const p = k.pts[i], np = nrm(k, i);
      const off = Math.sin(now / 300 + i) * (p.w + 4);
      g.fillStyle(i % 2 ? gold : feather, p.a * 0.6);
      g.fillPoints([{ x: p.x + np.x * off, y: p.y + np.y * off }, { x: p.x + np.x * (off + 16) + np.y * 4, y: p.y + np.y * (off + 16) - np.x * 4 }, { x: p.x + np.x * off + np.y * 7, y: p.y + np.y * off - np.x * 7 }] as never, true);
    }
    // 末端神鸟俯冲
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const ang = Math.atan2(dir.y, dir.x);
    g.save(); g.translateCanvas(tip.x, tip.y); g.rotateCanvas(ang);
    g.fillStyle(flame, 0.95); g.fillTriangle(-4, 0, -22, -12, -8, 0);
    g.fillStyle(gold, 1); g.fillEllipse(0, 0, 18, 9);
    for (const s of [-1, 1]) { g.fillStyle(feather, 0.9); g.fillTriangle(0, 0, -10, s * 20, 8, s * 4); }
    g.fillStyle(0xff5a2a, 1); g.fillTriangle(8, 0, 20, 3, 8, 5);
    g.fillStyle(0xffffff, 0.9); g.fillCircle(6, -1, 1.6);
    g.restore();
    // 末端金轮
    const burst = (now / 460) % 1;
    for (let j = 0; j < 9; j++) { const a2 = (j / 9) * TAU + now / 240; g.lineStyle(2.4 - burst * 1.4, j % 2 ? gold : flame, (0.9 - burst) * tip.a); g.lineBetween(tip.x, tip.y, tip.x + Math.cos(a2) * (10 + burst * 26), tip.y + Math.sin(a2) * (10 + burst * 26)); }
    g.fillStyle(0xffffff, (1 - burst) * (0.6 + 0.4 * hot) * tip.a); g.fillCircle(tip.x, tip.y, 4 + burst * 5);
  } },
  incaSunBlade: { a: 0xffd45c, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const gold = 0xffd45c, ray = 0xfff0b0, dark = 0x2a2a34;
    halo(g, k, 0xffd45c, 0.12);
    band(g, k, gold, 0.45);
    // 黑金鹰羽迸飞
    for (let i = 2; i < n; i += 2) {
      const p = k.pts[i], np = nrm(k, i);
      const off = (i % 4 < 2 ? 1 : -1) * (p.w + 6);
      g.fillStyle(i % 3 ? dark : gold, p.a * 0.6);
      g.fillPoints([{ x: p.x + np.x * off, y: p.y + np.y * off }, { x: p.x + np.x * (off + 14) + np.y * 4, y: p.y + np.y * (off + 14) - np.x * 4 }, { x: p.x + np.x * off + np.y * 6, y: p.y + np.y * off - np.x * 6 }] as never, true);
    }
    // 末端旋转日轮
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const ang = Math.atan2(dir.y, dir.x);
    g.save(); g.translateCanvas(tip.x, tip.y); g.rotateCanvas(ang + now / 500);
    const s = 16 + hot * 6;
    for (let j = 0; j < 12; j++) { const a2 = (j / 12) * TAU; g.fillStyle(ray, 0.85); g.fillTriangle(Math.cos(a2) * s * 0.7, Math.sin(a2) * s * 0.7, Math.cos(a2 + 0.12) * s, Math.sin(a2 + 0.12) * s, Math.cos(a2 - 0.12) * s, Math.sin(a2 - 0.12) * s); }
    g.fillStyle(0x8a5a1a, 1); g.fillCircle(0, 0, s * 0.6);
    g.fillStyle(gold, 1); g.fillCircle(0, 0, s * 0.5);
    g.fillStyle(0xffffff, 0.9); g.fillCircle(0, 0, s * 0.2);
    g.restore();
    const burst = (now / 480) % 1;
    for (let j = 0; j < 8; j++) { const a2 = (j / 8) * TAU + now / 260; g.fillStyle(j % 2 ? ray : gold, (1 - burst) * (0.6 + 0.4 * hot) * tip.a); g.fillCircle(tip.x + Math.cos(a2) * (10 + burst * 24), tip.y + Math.sin(a2) * (10 + burst * 24), 2 - burst); }
  } },
  polyMauiSnare: { a: 0xffd8a0, draw: (g, now, _hot, k, _c, _a) => {
    const n = k.n;
    const rope = 0xd8c8a0, hook = 0xffe0b0, sun = 0xffd45c, foam = 0xdff6ff;
    halo(g, k, 0x5fe8d0, 0.12);
    band(g, k, rope, 0.4);
    // 钩绳螺旋沿轨迹展开
    for (let i = 2; i < n; i += 1) {
      const p = k.pts[i], np = nrm(k, i);
      const off = Math.sin(i * 0.8 + now / 200) * (p.w + 5);
      g.fillStyle(rope, p.a * 0.55);
      g.fillCircle(p.x + np.x * off, p.y + np.y * off, 1.8);
    }
    // 末端神钩
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const ang = Math.atan2(dir.y, dir.x);
    g.save(); g.translateCanvas(tip.x, tip.y); g.rotateCanvas(ang);
    g.lineStyle(6, 0x9a8a6a, 1); g.beginPath(); g.moveTo(-14, 0); g.lineTo(2, 0); g.arc(2, 8, 8, -Math.PI / 2, Math.PI * 0.7); g.strokePath();
    g.lineStyle(3, hook, 1); g.beginPath(); g.moveTo(-14, 0); g.lineTo(2, 0); g.arc(2, 8, 8, -Math.PI / 2, Math.PI * 0.7); g.strokePath();
    // 索住的太阳
    const sw = 0.6 + 0.4 * Math.sin(now / 200);
    for (let j = 0; j < 10; j++) { const a2 = (j / 10) * TAU + now / 300; g.fillStyle(0xfff0b0, 0.8); g.fillTriangle(Math.cos(a2) * 8, Math.sin(a2) * 8, Math.cos(a2 + 0.14) * (8 + 10 * sw), Math.sin(a2 + 0.14) * (8 + 10 * sw), Math.cos(a2 - 0.14) * (8 + 10 * sw), Math.sin(a2 - 0.14) * (8 + 10 * sw)); }
    g.fillStyle(sun, 1); g.fillCircle(0, 0, 8); g.fillStyle(0xffffff, 0.9); g.fillCircle(0, 0, 3);
    g.restore();
    // 浪花
    for (let j = 0; j < 6; j++) { const ph = ((now / 500 + j / 6) % 1); g.fillStyle(foam, (1 - ph) * 0.7 * tip.a); g.fillCircle(tip.x + Math.sin(j * 2) * 14, tip.y + Math.cos(j * 3) * 14, 1.6); }
  } },
  auzRainbowStrike: { a: 0xff8a5c, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const cols = [0xff5a5a, 0xff9a3c, 0xffd45c, 0x8fd45a, 0x5fd0ff, 0x7a6aff];
    const off = Math.floor(now / 200) % 6;
    halo(g, k, 0xff8a5c, 0.12);
    // 七色鳞浪沿轨迹铺开
    for (let b = 0; b < 6; b++) {
      const col = cols[(b + off) % 6];
      for (let i = 1; i < n; i++) {
        const np = nrm(k, i), q = k.pts[i - 1], p = k.pts[i];
        const w = p.w * (0.5 + 0.5 * i / (n - 1)) * (0.5 + b * 0.12);
        g.fillStyle(col, p.a * (0.3 - b * 0.03));
        g.fillPoints([{ x: q.x + nrm(k, i - 1).x * w, y: q.y + nrm(k, i - 1).y * w }, { x: p.x + np.x * w, y: p.y + np.y * w }, { x: p.x - np.x * w, y: p.y - np.y * w }, { x: q.x - nrm(k, i - 1).x * w, y: q.y - nrm(k, i - 1).y * w }] as never, true);
      }
    }
    // 末端窜出的虹蛇张口
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const ang = Math.atan2(dir.y, dir.x);
    g.save(); g.translateCanvas(tip.x, tip.y); g.rotateCanvas(ang);
    for (let b = 0; b < 7; b++) { g.fillStyle(cols[(b + off) % 6], 0.95); g.fillCircle(-b * 4, Math.sin(now / 300 + b) * 2, 4 - b * 0.3); }
    g.fillStyle(cols[(7 + off) % 6], 1); g.fillEllipse(-30, -3, 10, 8);
    g.fillStyle(0x1a1a16, 1); g.fillTriangle(-34, -3, -42, -6, -34, -1);
    g.fillStyle(0xfff0a0, 0.95); g.fillCircle(-28, -5, 1.6);
    g.restore();
    // 水花 + 点画光点
    const burst = (now / 500) % 1;
    for (let j = 0; j < 10; j++) { const a2 = (j / 10) * TAU + now / 280; g.fillStyle(j % 2 ? cols[j % 6] : 0xdff6ff, (1 - burst) * (0.6 + 0.4 * hot) * tip.a); g.fillCircle(tip.x + Math.cos(a2) * (10 + burst * 26), tip.y + Math.sin(a2) * (10 + burst * 26), 2 - burst); }
  } },
};
