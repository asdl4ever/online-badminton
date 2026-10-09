import { TAU, type G, type SwingArt, type SwingKit } from './shared';

/**
 * 第七批挥拍拖尾（纳米矩阵 / 数据洪流 / 曲速跃迁 / 火星殖民 / 先行者遗迹）——按名字重新构图：
 * 纳米崩解斩 = 纳米巨刃拆解沿途物质；数据过载斩 = 数据光刃刷出代码与 ERROR；
 * 曲速跃迁斩 = 撕开曲速裂隙喷星轨；火星地裂斩 = 犁出红色裂谷；先行者觉醒斩 = 能量长刃 + 符文碑。
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

export const SWINGS_19: Record<string, SwingArt> = {
  nanoDeconstruct: { a: 0x4affd0, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const nano = 0x4affd0, bright = 0x7fe8ff;
    halo(g, k, 0x4affd0, 0.12);
    band(g, k, nano, 0.3);
    // 沿轨迹物质被拆成微粒
    for (let i = 2; i < n; i += 2) { const p = k.pts[i], np = nrm(k, i); const off = Math.sin(now / 260 + i) * (p.w + 4); for (let j = 0; j < 2; j++) { g.fillStyle(j % 2 ? bright : nano, p.a * 0.6); g.fillRect(p.x + np.x * off + j * 4 - 2, p.y + np.y * off - 2, 4, 4); } }
    // 末端纳米巨刃
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const ang = Math.atan2(dir.y, dir.x);
    g.save(); g.translateCanvas(tip.x, tip.y); g.rotateCanvas(ang);
    const len = 30 + hot * 10;
    g.fillStyle(nano, 0.9); g.fillPoints([{ x: -12, y: 3 }, { x: len, y: 0 }, { x: -12, y: -3 }] as never, true);
    g.fillStyle(bright, 0.9); g.fillPoints([{ x: -8, y: 1.6 }, { x: len - 4, y: 0 }, { x: -8, y: -1.6 }] as never, true);
    for (let j = 0; j < 6; j++) { const a2 = (j / 6) * TAU + now / 250; g.fillStyle(j % 2 ? bright : nano, (0.7 - hot * 0.4)); g.fillRect(tip.x + Math.cos(a2) * (10 + hot * 16) - 2, tip.y + Math.sin(a2) * (10 + hot * 16) - 2, 4, 4); }
    g.restore();
  } },
  dataOverload: { a: 0x4affc4, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const green = 0x4affc4, blue = 0x7fb8ff;
    halo(g, k, 0x4affc4, 0.12);
    // 数据光刃
    for (let i = 1; i < n; i++) { const np = nrm(k, i), q = k.pts[i - 1], p = k.pts[i]; const w = p.w * (0.5 + 0.6 * i / (n - 1)); g.fillStyle(green, p.a * 0.5); g.fillPoints([{ x: q.x + nrm(k, i - 1).x * w, y: q.y + nrm(k, i - 1).y * w }, { x: p.x + np.x * w, y: p.y + np.y * w }, { x: p.x - np.x * w, y: p.y - np.y * w }, { x: q.x - nrm(k, i - 1).x * w, y: q.y - nrm(k, i - 1).y * w }] as never, true); }
    // 沿轨迹刷出的代码块
    for (let i = 2; i < n; i += 2) { const p = k.pts[i]; g.fillStyle(i % 2 ? blue : green, p.a * 0.7); g.fillRect(p.x - 4, p.y - 4 + Math.sin(now / 200 + i) * 5, 8, 3); }
    // 末端 ERROR 爆
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const burst = (now / 460) % 1;
    g.save(); g.translateCanvas(tip.x, tip.y); g.rotateCanvas(Math.atan2(dir.y, dir.x));
    g.fillStyle(0xff3a5a, (1 - burst) * (0.7 + 0.3 * hot) * tip.a);
    for (let j = 0; j < 5; j++) { g.fillRect(-16 + j * 7, -4, 5, 8); }
    g.restore();
    for (let j = 0; j < 8; j++) { const a2 = (j / 8) * TAU + now / 240; g.fillStyle(j % 2 ? 0xffffff : green, (1 - burst) * tip.a); g.fillRect(tip.x + Math.cos(a2) * (8 + burst * 26) - 2, tip.y + Math.sin(a2) * (8 + burst * 26) - 2, 4, 4); }
  } },
  warpJump: { a: 0xa98cff, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const warp = 0xa98cff, star = 0x9fd8ff;
    halo(g, k, 0x9fd8ff, 0.12);
    band(g, k, warp, 0.35);
    // 撕开的曲速裂隙
    for (let i = 1; i < n; i++) { const np = nrm(k, i), q = k.pts[i - 1], p = k.pts[i]; const w = p.w * 0.7 + 3; g.fillStyle(0x05060f, p.a * 0.8); g.fillPoints([{ x: q.x + nrm(k, i - 1).x * w, y: q.y + nrm(k, i - 1).y * w }, { x: p.x + np.x * w, y: p.y + np.y * w }, { x: p.x - np.x * w, y: p.y - np.y * w }, { x: q.x - nrm(k, i - 1).x * w, y: q.y - nrm(k, i - 1).y * w }] as never, true); }
    // 裂隙喷星轨
    for (let i = 2; i < n; i += 2) { const p = k.pts[i], np = nrm(k, i); const off = (i % 4 < 2 ? 1 : -1) * (p.w + 4); g.fillStyle(i % 2 ? star : warp, p.a * 0.6); g.fillRect(p.x + np.x * off - 6, p.y + np.y * off - 1, 12, 2); }
    // 末端星门
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    g.save(); g.translateCanvas(tip.x, tip.y); g.rotateCanvas(Math.atan2(dir.y, dir.x));
    g.fillStyle(warp, 0.9); g.fillCircle(0, 0, 10 + hot * 4);
    g.fillStyle(0x05060f, 1); g.fillCircle(0, 0, 8 + hot * 3);
    for (let arm = 0; arm < 3; arm++) { const off = now / 250 + arm * 2.1; g.lineStyle(2, star, 0.7); g.beginPath(); for (let s = 0; s <= 6; s++) { const u = s / 6; const a2 = off + u * 3; const rr = u * (6 + hot * 3); const px = Math.cos(a2) * rr, py = Math.sin(a2) * rr; if (s === 0) g.moveTo(px, py); else g.lineTo(px, py); } g.strokePath(); }
    g.restore();
  } },
  marsQuake: { a: 0xff7a4a, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const dirt = 0xc0462a, dust = 0xff7a4a, stone = 0x9a8a78;
    halo(g, k, 0xff7a4a, 0.12);
    band(g, k, dirt, 0.4);
    // 地面犁出的红色裂谷
    const tip = k.pts[n - 1];
    for (let i = 2; i < n; i += 2) { const p = k.pts[i]; g.fillStyle(0x5a2418, 0.8); g.fillRect(p.x - 5, p.y + 6, 10, 5); g.fillStyle(dirt, 0.7); g.fillRect(p.x - 4, p.y + 7, 8, 3); }
    // 烙石与尘暴
    for (let i = 2; i < n; i += 2) { const p = k.pts[i], np = nrm(k, i); const off = (i % 4 < 2 ? 1 : -1) * (p.w + 5); g.fillStyle(i % 3 ? stone : dust, p.a * 0.7); g.fillRect(p.x + np.x * off - 3, p.y + np.y * off - 3, 6, 6); }
    // 末端尘云
    const burst = (now / 500) % 1;
    for (let j = 0; j < 9; j++) { const a2 = (j / 9) * TAU + now / 260; const rr = (8 + burst * 28); g.fillStyle(j % 2 ? dust : dirt, (1 - burst) * (0.7 + 0.3 * hot) * tip.a); g.fillCircle(tip.x + Math.cos(a2) * rr, tip.y + Math.sin(a2) * rr, 3 - burst * 1.4); }
    g.fillStyle(0xffffff, (1 - burst) * (0.5 + 0.5 * hot) * tip.a); g.fillCircle(tip.x, tip.y, 4);
  } },
  forerAwaken: { a: 0x5ad8ff, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const metal = 0x2c3a4a, glow = 0x5ad8ff, bright = 0xa8e0ff;
    halo(g, k, 0x5ad8ff, 0.12);
    band(g, k, glow, 0.35);
    // 能量长刃
    for (let i = 1; i < n; i++) { const np = nrm(k, i), q = k.pts[i - 1], p = k.pts[i]; const w = p.w * (0.4 + 0.6 * i / (n - 1)); g.fillStyle(bright, p.a * 0.4); g.fillPoints([{ x: q.x + nrm(k, i - 1).x * w, y: q.y + nrm(k, i - 1).y * w }, { x: p.x + np.x * w, y: p.y + np.y * w }, { x: p.x - np.x * w, y: p.y - np.y * w }, { x: q.x - nrm(k, i - 1).x * w, y: q.y - nrm(k, i - 1).y * w }] as never, true); }
    // 沿途浮出的符文碑
    for (let i = 2; i < n; i += 3) { const p = k.pts[i], np = nrm(k, i); const off = (i % 6 < 3 ? 1 : -1) * (p.w + 6); const bx = p.x + np.x * off, by = p.y + np.y * off; g.fillStyle(metal, 0.9); g.fillRect(bx - 5, by - 11, 10, 22); g.fillStyle(glow, 0.9); g.fillRect(bx - 3, by - 9, 6, 18); for (let r = 0; r < 3; r++) { g.lineStyle(1.4, bright, 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + i + r))); g.lineBetween(bx - 3, by - 6 + r * 6, bx + 3, by - 6 + r * 6); } }
    // 末端遗迹门开合爆光
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const ang = Math.atan2(dir.y, dir.x);
    const open = 0.6 + 0.4 * Math.sin(now / 200);
    g.save(); g.translateCanvas(tip.x, tip.y); g.rotateCanvas(ang);
    g.fillStyle(metal, 0.95); g.fillRect(-24, -12 * open, 8, 24 * open); g.fillRect(16, -12 * open, 8, 24 * open);
    g.fillStyle(bright, 0.4 * open); g.fillRect(-16, -12 * open, 32, 24 * open);
    g.fillStyle(0xffffff, (0.6 + 0.4 * hot) * open); g.fillRect(-14, -10 * open, 28, 20 * open);
    g.restore();
  } },
};
