import { TAU, type G, type SwingArt, type SwingKit } from './shared';

/**
 * 第八批挥拍拖尾（冰海巨兽 / 极夜冰海 / 寒潮海象 / 维度裂隙 / 幽光深渊）——按名字重新构图：
 * 寒潮斩 = 卷起寒潮冰浪；极夜巨口 = 巨口咬合；巨牙碎冰斩 = 巨牙砸碎冰面；
 * 维度坍缩斩 = 维度向内坍缩；深渊巨口斩 = 巨口吞咬 + 幽光。
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

export const SWINGS_20: Record<string, SwingArt> = {
  glacTideSwing: { a: 0x5fd8ff, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const ice = 0xbfe8ff, deep = 0x2a6a8a;
    halo(g, k, 0xbfe8ff, 0.12);
    band(g, k, deep, 0.4);
    // 卷起的寒潮冰浪
    for (let b = 0; b < 3; b++) {
      g.lineStyle(4 - b, b % 2 ? ice : deep, 0.9);
      g.beginPath();
      let started = false;
      for (let i = 1; i < n; i++) { const p = k.pts[i], np = nrm(k, i); const off = Math.sin(now / 300 + b + i * 0.5) * (k.pts[i].w + 3 + b * 3); const x = p.x + np.x * off, y = p.y + np.y * off; if (!started) { g.moveTo(x, y); started = true; } else g.lineTo(x, y); }
      g.strokePath();
    }
    // 末端冰浪爆
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1), burst = (now / 480) % 1;
    for (let j = 0; j < 9; j++) { const ang = (j / 9) * TAU + now / 260; const rr = 8 + burst * 26; g.fillStyle(j % 2 ? ice : 0xffffff, (1 - burst) * (0.6 + 0.4 * hot) * tip.a); g.fillPoints([{ x: tip.x + Math.cos(ang) * rr, y: tip.y + Math.sin(ang) * rr }, { x: tip.x + Math.cos(ang + 0.3) * (rr + 6), y: tip.y + Math.sin(ang + 0.3) * (rr + 6) }, { x: tip.x + Math.cos(ang - 0.3) * (rr + 6), y: tip.y + Math.sin(ang - 0.3) * (rr + 6) }] as never, true); }
    g.fillStyle(0xffffff, (1 - burst) * (0.5 + 0.5 * hot) * tip.a); g.fillCircle(tip.x, tip.y, 4 + burst * 4);
    void dir;
  } },
  fridAnglerChomp: { a: 0x39ffd0, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const glow = 0x39ffd0, dark = 0x0e2830;
    halo(g, k, 0x7dffd0, 0.12);
    band(g, k, dark, 0.45);
    // 诱饵光点沿轨迹
    for (let i = 2; i < n; i += 2) { const p = k.pts[i]; const gl = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + i)); g.fillStyle(glow, p.a * 0.6 * gl); g.fillCircle(p.x, p.y, 2.4); }
    // 末端巨口咬合
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1), ang = Math.atan2(dir.y, dir.x);
    const open = 0.6 + 0.4 * Math.sin(now / 200);
    g.save(); g.translateCanvas(tip.x, tip.y); g.rotateCanvas(ang);
    const s = 20 + hot * 6;
    g.fillStyle(dark, 0.95); g.fillPoints([{ x: -4, y: -s * 0.7 }, { x: s, y: -s * 0.2 * open }, { x: -4, y: s * 0.1 }] as never, true);
    g.fillStyle(dark, 0.95); g.fillPoints([{ x: -4, y: s * 0.7 }, { x: s, y: s * 0.2 * open }, { x: -4, y: -s * 0.1 }] as never, true);
    g.fillStyle(0x06141e, 1); g.fillEllipse(s * 0.4, 0, s * 0.7, s * 0.6 * open);
    g.fillStyle(glow, 0.5 * open); g.fillEllipse(s * 0.4, 0, s * 0.5, s * 0.4 * open);
    for (let j = 0; j < 5; j++) { g.fillStyle(0xe8f4f8, 0.95); g.fillTriangle(s * 0.1 + j * 3, -s * 0.16, s * 0.1 + j * 3 + 2, -s * 0.16, s * 0.1 + j * 3 + 1, 0); }
    g.restore();
    g.fillStyle(0xffffff, (0.5 + 0.5 * hot) * tip.a); g.fillCircle(tip.x, tip.y, 3);
  } },
  walrTuskSmash: { a: 0xe8f4ff, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const tusk = 0xe8f4ff, hide = 0x8a705a, ice = 0x8fd8ff;
    halo(g, k, 0xe8f4ff, 0.12);
    band(g, k, hide, 0.4);
    // 末端两只巨牙砸下
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1), ang = Math.atan2(dir.y, dir.x);
    g.save(); g.translateCanvas(tip.x, tip.y); g.rotateCanvas(ang + Math.PI / 2);
    for (const s of [-1, 1]) { g.fillStyle(hide, 1); g.fillStyle(tusk, 1); g.fillPoints([{ x: s * 6, y: -18 }, { x: s * 12, y: -18 }, { x: s * 10, y: 20 }] as never, true); g.fillStyle(0xffffff, 0.5); g.fillPoints([{ x: s * 7, y: -16 }, { x: s * 9, y: -16 }, { x: s * 8, y: 16 }] as never, true); }
    g.restore();
    // 碎冰
    const burst = (now / 460) % 1;
    for (let j = 0; j < 10; j++) { const a2 = (j / 10) * TAU + now / 240; const rr = 8 + burst * 26; g.save(); g.translateCanvas(tip.x + Math.cos(a2) * rr, tip.y + Math.sin(a2) * rr); g.rotateCanvas(a2 + now / 200); g.fillStyle(j % 2 ? ice : 0xffffff, (1 - burst) * (0.6 + 0.4 * hot) * tip.a); g.fillRect(-3, -3, 6, 6); g.restore(); }
  } },
  dimCollapse: { a: 0xb08aff, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const voidc = 0x05040f, purple = 0xb08aff, glow = 0x7dffd0;
    halo(g, k, 0xb08aff, 0.12);
    band(g, k, purple, 0.35);
    // 沿轨迹向内坍缩的空间带
    for (let i = 1; i < n; i++) { const np = nrm(k, i), q = k.pts[i - 1], p = k.pts[i]; const w = p.w * 0.8 + 3; g.fillStyle(voidc, p.a * 0.8); g.fillPoints([{ x: q.x + nrm(k, i - 1).x * w, y: q.y + nrm(k, i - 1).y * w }, { x: p.x + np.x * w, y: p.y + np.y * w }, { x: p.x - np.x * w, y: p.y - np.y * w }, { x: q.x - nrm(k, i - 1).x * w, y: q.y - nrm(k, i - 1).y * w }] as never, true); }
    // 末端坍缩奇点
    const tip = k.pts[n - 1];
    const pull = (now / 400) % 1;
    for (let j = 0; j < 12; j++) { const ang = (j / 12) * TAU + now / 300; const rr = (26 - pull * 26); g.fillStyle(j % 2 ? purple : glow, (0.8 - pull * 0.4) * tip.a); g.fillRect(tip.x + Math.cos(ang) * rr - 2, tip.y + Math.sin(ang) * rr - 2, 4, 4); }
    g.fillStyle(voidc, 0.9 * tip.a); g.fillCircle(tip.x, tip.y, 8);
    g.fillStyle(0xffffff, (0.5 + 0.5 * hot) * tip.a); g.fillCircle(tip.x, tip.y, 2.4 + (1 - pull) * 2);
  } },
  hadalChomp: { a: 0x39ffd0, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const deep = 0x0e2830, glow = 0x39ffd0, tooth = 0xe8f4f8;
    halo(g, k, 0x39ffd0, 0.12);
    band(g, k, deep, 0.45);
    // 沿轨迹一排牙齿
    for (let i = 2; i < n; i += 2) { const p = k.pts[i], np = nrm(k, i); const off = (i % 4 < 2 ? 1 : -1) * (p.w + 4); g.fillStyle(tooth, p.a * 0.9); g.fillTriangle(p.x + np.x * off - 2, p.y + np.y * off + 3, p.x + np.x * off + 2, p.y + np.y * off + 3, p.x + np.x * off, p.y + np.y * off - 4); }
    // 末端巨口
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1), ang = Math.atan2(dir.y, dir.x);
    const open = 0.6 + 0.4 * Math.sin(now / 220);
    g.save(); g.translateCanvas(tip.x, tip.y); g.rotateCanvas(ang);
    const s = 24 + hot * 8;
    g.fillStyle(deep, 0.95); g.fillPoints([{ x: -6, y: -s * 0.7 }, { x: s, y: 0 }, { x: -6, y: 0 }] as never, true);
    g.fillStyle(deep, 0.95); g.fillPoints([{ x: -6, y: s * 0.7 }, { x: s, y: 0 }, { x: -6, y: 0 }] as never, true);
    g.fillStyle(0x06141e, 1); g.fillEllipse(s * 0.35, 0, s * 0.7, s * 0.5 * open);
    g.fillStyle(glow, 0.5 * open); g.fillEllipse(s * 0.35, 0, s * 0.5, s * 0.35 * open);
    for (let j = 0; j < 6; j++) { g.fillStyle(tooth, 0.95); g.fillTriangle(s * 0.1 + j * 3, -s * 0.14, s * 0.1 + j * 3 + 2, -s * 0.14, s * 0.1 + j * 3 + 1, 0); g.fillTriangle(s * 0.1 + j * 3, s * 0.14, s * 0.1 + j * 3 + 2, s * 0.14, s * 0.1 + j * 3 + 1, 0); }
    g.restore();
  } },
};
