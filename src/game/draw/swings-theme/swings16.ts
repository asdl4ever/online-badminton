import { TAU, type G, type SwingArt, type SwingKit } from './shared';

/**
 * 批十五挥拍拖尾（基多拉 / 魔斯拉 / 机甲战队 / 火山泰坦 / 深海巨妖）——按名字重新构图：
 * 三重雷击 = 三道落雷；鳞粉风暴 = 发光鳞粉旋涡；五机合击 = 五块机体汇聚成一道炮；
 * 大地震怒 = 地面撕裂喷发；深渊吞噬 = 巨口触手吞咬。
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

export const SWINGS_16: Record<string, SwingArt> = {
  ghidSwing: { a: 0x7fd4ff, draw: (g, now, hot, k, _c, a) => {
    const n = k.n;
    const gold = 0xffe15c;
    halo(g, k, 0x7fd4ff, 0.12);
    // 乌云底
    for (let i = 1; i < n; i++) { const p = k.pts[i]; g.fillStyle(0x2a2a3a, 0.3 * p.a); g.fillCircle(p.x, p.y - 6, k.pts[i].w * 0.9 + 4); }
    // 三道并行落雷
    for (let b = -1; b <= 1; b++) {
      const off = b * 8;
      g.lineStyle(3.4 - Math.abs(b) * 0.8, b === 0 ? 0xffffff : gold, 0.9 * (0.5 + 0.5 * hot));
      g.beginPath();
      for (let i = 0; i < n; i++) {
        const np = nrm(k, i), p = k.pts[i];
        const x = p.x + np.x * off, y = p.y + np.y * off;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x + Math.sin(now / 60 + i + b) * (i % 2 ? 4 : 0), y);
      }
      g.strokePath();
    }
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const burst = (now / 460) % 1;
    for (let j = 0; j < 9; j++) { const ang = (j / 9) * TAU + now / 260; g.lineStyle(2.4 - burst * 1.5, j % 2 ? gold : a, (0.9 - burst) * tip.a); g.lineBetween(tip.x, tip.y, tip.x + Math.cos(ang) * (10 + burst * 22), tip.y + Math.sin(ang) * (10 + burst * 22)); }
    g.fillStyle(0xffffff, (1 - burst) * (0.6 + 0.4 * hot) * tip.a); g.fillCircle(tip.x, tip.y, 5 + burst * 6);
    void dir;
  } },

  mthrSwing: { a: 0xffe66a, draw: (g, now, hot, k, c, a) => {
    const n = k.n;
    halo(g, k, 0xffe66a, 0.12);
    // 发光鳞粉旋涡：沿轨迹一群绕转的小翅片
    for (let i = 1; i < n; i++) {
      const p = k.pts[i], np = nrm(k, i);
      for (let r = 0; r < 6; r++) {
        const ph = now / 300 + i * 0.5 + r * 1.2;
        const rad = k.pts[i].w * 0.9 + 4;
        const x = p.x + np.x * Math.sin(ph) * rad, y = p.y + np.y * Math.sin(ph) * rad + Math.cos(ph) * 3;
        g.fillStyle(r % 2 ? c : a, 0.75 * p.a);
        g.save(); g.translateCanvas(x, y); g.rotateCanvas(ph);
        g.fillPoints([{ x: -3, y: 0 }, { x: 0, y: -2.4 }, { x: 3, y: 0 }, { x: 0, y: 2.4 }] as never, true);
        g.restore();
      }
    }
    const tip = k.pts[n - 1];
    const burst = (now / 500) % 1;
    for (let j = 0; j < 12; j++) { const ang = (j / 12) * TAU + now / 220; g.fillStyle(j % 2 ? c : 0xffffff, (1 - burst) * (0.5 + 0.5 * hot) * tip.a); g.fillCircle(tip.x + Math.cos(ang) * (6 + burst * 26), tip.y + Math.sin(ang) * (6 + burst * 26), 2.2 - burst); }
    g.fillStyle(0xffffff, (0.6 + 0.4 * hot) * tip.a); g.fillCircle(tip.x, tip.y, 4);
  } },

  tksSwing: { a: 0xff4a4a, draw: (g, now, hot, k, _c, a) => {
    const n = k.n;
    halo(g, k, 0x5ac8ff, 0.12);
    // 五块机体沿轨迹飞向末端
    for (let b = 0; b < 5; b++) {
      const t = ((b + (now / 400) % 1) / 5) % 1;
      const i = Math.min(n - 1, Math.floor(t * (n - 1)));
      const p = k.pts[i], np = nrm(k, i);
      const off = ((b % 2) ? 1 : -1) * (k.pts[i].w + 8);
      g.save();
      g.translateCanvas(p.x + np.x * off, p.y + np.y * off);
      g.rotateCanvas(now / 300 + b);
      g.fillStyle(b === 4 ? a : 0x8a94a2, (0.5 + t * 0.5) * p.a);
      g.fillRect(-6, -5, 12, 10);
      g.fillStyle(0x2a3244, 0.9); g.fillRect(-3.4, -3, 6.8, 6);
      g.restore();
    }
    // 末端合体炮
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const charge = 0.6 + 0.4 * Math.sin(now / 200);
    for (let j = 3; j >= 0; j--) { g.fillStyle(j === 0 ? 0xffffff : a, 0.2 * charge * (1 - j * 0.22) * (0.6 + 0.4 * hot) * tip.a); g.fillCircle(tip.x, tip.y, 6 + j * 6); }
    for (let j = 0; j < 5; j++) { g.lineStyle(2.4 - j * 0.3, 0x5ac8ff, (0.8 - j * 0.12) * tip.a); g.lineBetween(tip.x - dir.x * (6 + j * 5), tip.y - dir.y * (6 + j * 5), tip.x + dir.x * (14 + j * 6), tip.y + dir.y * (14 + j * 6)); }
    g.fillStyle(0xffffff, charge * tip.a); g.fillCircle(tip.x, tip.y, 3.4);
  } },

  titanSwing: { a: 0xff6a2a, draw: (g, now, hot, k, _c, a) => {
    const n = k.n;
    halo(g, k, 0xff6a2a, 0.12);
    // 沉重熔岩带
    for (let i = 1; i < n; i++) { const np = nrm(k, i), q = k.pts[i - 1], p = k.pts[i]; const w = p.w * (0.5 + 0.7 * i / (n - 1)); g.fillStyle(0x3a1c12, p.a * 0.95); g.fillPoints([{ x: q.x + nrm(k, i - 1).x * w, y: q.y + nrm(k, i - 1).y * w }, { x: p.x + np.x * w, y: p.y + np.y * w }, { x: p.x - np.x * w, y: p.y - np.y * w }, { x: q.x - nrm(k, i - 1).x * w, y: q.y - nrm(k, i - 1).y * w }] as never, true); g.fillStyle(a, p.a * 0.5); g.fillPoints([{ x: q.x + nrm(k, i - 1).x * w * 0.5, y: q.y + nrm(k, i - 1).y * w * 0.5 }, { x: p.x + np.x * w * 0.5, y: p.y + np.y * w * 0.5 }, { x: p.x - np.x * w * 0.5, y: p.y - np.y * w * 0.5 }, { x: q.x - nrm(k, i - 1).x * w * 0.5, y: q.y - nrm(k, i - 1).y * w * 0.5 }] as never, true); }
    // 沿轨迹的地面裂缝 + 喷发
    for (let i = 1; i < n; i += 3) {
      const p = k.pts[i];
      g.lineStyle(2.4, 0x140a06, 0.85 * p.a);
      for (let j = 0; j < 3; j++) { const ang = -Math.PI / 2 + (j - 1) * 0.5; g.beginPath(); g.moveTo(p.x, p.y + 12); g.lineTo(p.x + Math.cos(ang) * 14, p.y + 12 + Math.sin(ang) * 10); g.strokePath(); }
      for (let j = 0; j < 3; j++) { const ph = ((now / 500 + j / 3 + i / 5) % 1); g.fillStyle(j % 2 ? a : 0xffd45c, (1 - ph) * 0.8 * p.a); g.fillCircle(p.x + (j - 1) * 7, p.y + 8 - ph * 20, 2.4 * (1 - ph) + 0.5); }
    }
    const tip = k.pts[n - 1];
    const burst = (now / 480) % 1;
    for (let j = 0; j < 10; j++) { const ang = (j / 10) * TAU + now / 260; g.fillStyle(j % 2 ? a : 0xffd45c, (1 - burst) * (0.6 + 0.4 * hot) * tip.a); g.fillCircle(tip.x + Math.cos(ang) * (10 + burst * 24), tip.y + Math.sin(ang) * (10 + burst * 24) * 0.8, 2.6 - burst * 1.6); }
    g.fillStyle(0xffffff, (1 - burst) * (0.5 + 0.5 * hot) * tip.a); g.fillCircle(tip.x, tip.y, 5);
  } },

  leviSwing: { a: 0x9b6aff, draw: (g, now, _hot, k, _c, _a) => {
    const n = k.n;
    const deep = 0x16303f, glow = 0x5fe8d0;
    halo(g, k, 0x9b6aff, 0.12);
    // 触手沿轨迹伸出
    for (let b = 0; b < 4; b++) {
      g.lineStyle(6 - b * 0.6, deep, 0.9);
      g.beginPath();
      let started = false;
      for (let i = 1; i < n; i++) {
        const p = k.pts[i], np = nrm(k, i);
        const off = Math.sin(now / 260 + b + i * 0.4) * (k.pts[i].w + 4);
        const x = p.x + np.x * off, y = p.y + np.y * off;
        if (!started) { g.moveTo(x, y); started = true; } else g.lineTo(x, y);
      }
      g.strokePath();
    }
    // 末端深渊巨口 + 獠牙
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const hang = Math.atan2(dir.y, dir.x);
    const w = tip.w * 0.7 + 6;
    g.save();
    g.translateCanvas(tip.x + dir.x * w, tip.y + dir.y * w);
    g.rotateCanvas(hang);
    g.fillStyle(0x070f16, 0.95); g.fillEllipse(0, 0, 34, 30);
    g.fillStyle(glow, 0.25); g.fillEllipse(2, 0, 22, 18);
    for (let j = 0; j < 7; j++) { const ang = -1.2 + (j / 6) * 2.4; g.fillStyle(0xe8f6ff, 0.9); g.fillTriangle(Math.cos(ang) * 15 - 3, Math.sin(ang) * 12 - 3, Math.cos(ang) * 15 + 3, Math.sin(ang) * 12 + 3, Math.cos(ang) * 5, Math.sin(ang) * 4); }
    g.fillStyle(glow, 0.8); g.fillCircle(6, 0, 3.4);
    g.restore();
    for (let j = 0; j < 5; j++) { const ph = ((now / 700 + j / 5) % 1); g.fillStyle(glow, (1 - ph) * 0.8 * tip.a); g.fillCircle(tip.x + dir.x * (16 + ph * 14) + Math.sin(j * 2) * 6, tip.y + dir.y * (16 + ph * 14) + Math.cos(j * 2) * 6, 1.8); }
  } },
};
