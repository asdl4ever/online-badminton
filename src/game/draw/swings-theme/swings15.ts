import { TAU, type G, type SwingArt, type SwingKit } from './shared';

/**
 * 批十四挥拍拖尾（年兽迎春 / 月夜狼族 / 末日丧尸 / 大便人厕所）——
 * **按名字重新构图**，禁止「同一条带换色」：
 *   爆竹驱年 = 一串炸响的鞭炮在末端轰开
 *   狼牙撕咬 = 末端一张开合咬下的狼口 + 三道爪痕
 *   生化爆裂 = 一条鼓胀毒浆在末端炸开生化爆点
 *   强力冲水 = 一股冲出的水流，末端一记搋子重推
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
  for (let i = 1; i < k.n; i++) {
    g.lineStyle(Math.max(1, k.pts[i].w * 1.7), color, k.pts[i].a * a);
    g.lineBetween(k.pts[i - 1].x, k.pts[i - 1].y, k.pts[i].x, k.pts[i].y);
  }
}

export const SWINGS_15: Record<string, SwingArt> = {
  // ───────────────────────── 爆竹驱年 ─────────────────────────
  nianSwing: { a: 0xff8a3c, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const red = 0xd93a3a, redD = 0xb02a2a, gold = 0xffd45c;
    halo(g, k, 0xff8a3c, 0.13);
    // 鞭炮串：沿轨迹的红鞭炮 + 引线
    for (let i = 1; i < n; i++) {
      const p = k.pts[i], tp = tanOf(k, i);
      g.lineStyle(1.6, 0x8a5a2a, 0.75);
      g.lineBetween(k.pts[i - 1].x, k.pts[i - 1].y, p.x, p.y);
      g.save();
      g.translateCanvas(p.x, p.y);
      g.rotateCanvas(Math.atan2(tp.y, tp.x));
      g.fillStyle(i % 2 ? red : redD, p.a * 0.96);
      g.fillRoundedRect(-6, -3, 12, 6, 2);
      g.fillStyle(gold, 0.9); g.fillRect(-6, -1, 12, 1.5);
      g.restore();
      if (i % 3 === 0) { // 炸开的火花
        const ph = ((now / 260 + i) % 1);
        for (let j = 0; j < 5; j++) {
          const ang = (j / 5) * TAU + i;
          g.fillStyle(gold, (1 - ph) * p.a * 0.9);
          g.fillCircle(p.x + Math.cos(ang) * (4 + ph * 9), p.y + Math.sin(ang) * (4 + ph * 9), 1.4);
        }
      }
    }
    // 末端大爆：放射爆线 + 烟团 + 红纸屑
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const burst = (now / 520) % 1;
    for (let j = 0; j < 10; j++) {
      const ang = (j / 10) * TAU + now / 260;
      g.lineStyle(2.6 - burst * 1.6, j % 2 ? gold : 0xff6a2a, (0.95 - burst) * (0.6 + 0.4 * hot) * tip.a);
      g.lineBetween(tip.x, tip.y, tip.x + Math.cos(ang) * (10 + burst * 22), tip.y + Math.sin(ang) * (10 + burst * 22));
    }
    g.fillStyle(0xfff0b0, (0.9 - burst) * (0.5 + 0.5 * hot) * tip.a);
    g.fillCircle(tip.x, tip.y, 5 + burst * 6);
    for (let j = 0; j < 4; j++) {
      const ph = ((now / 700 + j / 4) % 1);
      g.fillStyle(0x9a9488, 0.24 * (1 - ph) * tip.a);
      g.fillCircle(tip.x + dir.x * (6 + ph * 16) + (j - 1.5) * 6, tip.y + dir.y * (6 + ph * 16) - ph * 8, 3 + ph * 6);
    }
    for (let j = 0; j < 6; j++) { // 红纸屑
      const ang = now / 200 + j * 1.1;
      g.save();
      g.translateCanvas(tip.x + Math.cos(ang) * (14 + j * 3), tip.y + Math.sin(ang) * (14 + j * 3));
      g.rotateCanvas(ang * 2);
      g.fillStyle(j % 2 ? red : gold, 0.9 * tip.a);
      g.fillRect(-3, -1.4, 6, 2.8);
      g.restore();
    }
  } },

  // ───────────────────────── 狼牙撕咬 ─────────────────────────
  wolfSwing: { a: 0xff3a4a, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const fur = 0x3a3a52, furD = 0x23233a, fang = 0xf0f4f8, red = 0xff3a4a, tongue = 0xd05a6a;
    halo(g, k, 0xff3a4a, 0.12);
    // 毛颈：沿轨迹一条深色鬃毛
    for (let i = 1; i < n; i++) {
      const nq = nrm(k, i - 1), np = nrm(k, i);
      const q = k.pts[i - 1], p = k.pts[i];
      const tq = (i - 1) / (n - 1), tp = i / (n - 1);
      const wq = q.w * (0.5 + 0.7 * tq), wp = p.w * (0.5 + 0.7 * tp);
      const al = p.a;
      g.fillStyle(furD, al);
      g.fillPoints([
        { x: q.x + nq.x * wq, y: q.y + nq.y * wq }, { x: p.x + np.x * wp, y: p.y + np.y * wp },
        { x: p.x - np.x * wp, y: p.y - np.y * wp }, { x: q.x - nq.x * wq, y: q.y - nq.y * wq },
      ] as never, true);
      g.fillStyle(fur, al * 0.95);
      g.fillPoints([
        { x: q.x + nq.x * wq * 0.6, y: q.y + nq.y * wq * 0.6 }, { x: p.x + np.x * wp * 0.6, y: p.y + np.y * wp * 0.6 },
        { x: p.x - np.x * wp * 0.6, y: p.y - np.y * wp * 0.6 }, { x: q.x - nq.x * wq * 0.6, y: q.y - nq.y * wq * 0.6 },
      ] as never, true);
    }
    // 鬃毛尖（外侧）
    for (let i = 1; i < n; i++) {
      const p = k.pts[i], np = nrm(k, i), tp = tanOf(k, i);
      const w = p.w * (0.5 + 0.7 * i / (n - 1));
      const len = 4 + 5 * Math.abs(Math.sin(now / 300 + i));
      g.fillStyle(fur, p.a * 0.9);
      g.fillTriangle(
        p.x + np.x * w - tp.x * 2.2, p.y + np.y * w - tp.y * 2.2,
        p.x + np.x * w + tp.x * 2.2, p.y + np.y * w + tp.y * 2.2,
        p.x + np.x * (w + len), p.y + np.y * (w + len),
      );
    }
    // 末端狼口：上下颚 + 獠牙，随 now 咬合
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const hang = Math.atan2(dir.y, dir.x);
    const w = tip.w * 0.6 + 4;
    g.save();
    g.translateCanvas(tip.x + dir.x * w, tip.y + dir.y * w);
    g.rotateCanvas(hang);
    const bite = 0.28 + 0.18 * (0.5 + 0.5 * Math.sin(now / 160)); // 张合
    // 上颚
    g.fillStyle(furD, 1);
    g.fillPoints([{ x: -6, y: -6 }, { x: 20, y: -5 }, { x: 27, y: 0 }, { x: 6, y: 0 }] as never, true);
    g.fillStyle(fur, 1);
    g.fillPoints([{ x: -4, y: -5 }, { x: 18, y: -4 }, { x: 24, y: -1 }, { x: 4, y: -1 }] as never, true);
    for (let j = 0; j < 6; j++) { g.fillStyle(fang, 0.96); g.fillTriangle(3 + j * 3.6, 0, 6 + j * 3.6, 0, 4.5 + j * 3.6, 6); }
    // 下颚（咬合）
    g.save();
    g.translateCanvas(-2, 3);
    g.rotateCanvas(bite);
    g.fillStyle(furD, 1);
    g.fillPoints([{ x: -4, y: 0 }, { x: 20, y: -1 }, { x: 24, y: 5 }, { x: -2, y: 6 }] as never, true);
    for (let j = 0; j < 6; j++) { g.fillStyle(fang, 0.96); g.fillTriangle(3 + j * 3.6, 1, 6 + j * 3.6, 1, 4.5 + j * 3.6, -5); }
    g.fillStyle(tongue, 0.9);
    g.fillEllipse(10, 3, 14, 4);
    g.restore();
    // 眼（红光）
    g.fillStyle(red, 0.9); g.fillCircle(8, -7, 2);
    g.fillStyle(0xffffff, 0.7); g.fillCircle(8.5, -7.5, 0.7);
    g.restore();
    // 三道爪痕
    for (let gi = 0; gi < 3; gi++) {
      const off = 10 + gi * 7;
      g.lineStyle(2.6 - gi * 0.6, red, 0.4 * (0.5 + 0.5 * hot));
      g.beginPath();
      let started = false;
      for (let i = Math.floor(n * 0.34); i < n; i++) {
        const p = k.pts[i], np = nrm(k, Math.max(1, i));
        const x = p.x + np.x * off, y = p.y + np.y * off;
        if (!started) { g.moveTo(x, y); started = true; } else g.lineTo(x, y);
      }
      g.strokePath();
    }
    for (let j = 0; j < 5; j++) { // 血点
      const ph = ((now / 600 + j / 5) % 1);
      g.fillStyle(red, (1 - ph) * 0.8 * tip.a);
      g.fillCircle(tip.x + dir.x * (12 + ph * 14) + Math.sin(j * 2) * 6, tip.y + dir.y * (12 + ph * 14) + Math.cos(j * 2) * 6, 1.6);
    }
  } },

  // ───────────────────────── 生化爆裂 ─────────────────────────
  zombSwing: { a: 0x9cff3a, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const tox = 0x7dff3a, dark = 0x2a3a1a, acid = 0x9cff3a;
    halo(g, k, 0x7dff3a, 0.12);
    // 毒浆：沿轨迹一条鼓胀的绿色黏液（边缘凹凸冒泡）
    for (let i = 1; i < n; i++) {
      const np = nrm(k, i), p = k.pts[i];
      const w = p.w * (0.4 + 0.9 * i / (n - 1));
      const bump = 1 + 0.18 * Math.sin(now / 180 + i * 1.6);
      g.fillStyle(dark, p.a * 0.9);
      g.fillPoints([
        { x: k.pts[i - 1].x + nrm(k, i - 1).x * (k.pts[i - 1].w * (0.4 + 0.9 * (i - 1) / (n - 1)) * bump), y: k.pts[i - 1].y + nrm(k, i - 1).y * (k.pts[i - 1].w * (0.4 + 0.9 * (i - 1) / (n - 1)) * bump) },
        { x: p.x + np.x * w * bump, y: p.y + np.y * w * bump },
        { x: p.x - np.x * w * bump, y: p.y - np.y * w * bump },
        { x: k.pts[i - 1].x - nrm(k, i - 1).x * (k.pts[i - 1].w * (0.4 + 0.9 * (i - 1) / (n - 1)) * bump), y: k.pts[i - 1].y - nrm(k, i - 1).y * (k.pts[i - 1].w * (0.4 + 0.9 * (i - 1) / (n - 1)) * bump) },
      ] as never, true);
      g.fillStyle(tox, p.a * 0.8);
      g.fillPoints([
        { x: k.pts[i - 1].x + nrm(k, i - 1).x * (k.pts[i - 1].w * 0.6), y: k.pts[i - 1].y + nrm(k, i - 1).y * (k.pts[i - 1].w * 0.6) },
        { x: p.x + np.x * w * 0.6, y: p.y + np.y * w * 0.6 },
        { x: p.x - np.x * w * 0.6, y: p.y - np.y * w * 0.6 },
        { x: k.pts[i - 1].x - nrm(k, i - 1).x * (k.pts[i - 1].w * 0.6), y: k.pts[i - 1].y - nrm(k, i - 1).y * (k.pts[i - 1].w * 0.6) },
      ] as never, true);
    }
    // 末端的生化爆点
    const tip = k.pts[n - 1];
    const burst = (now / 480) % 1;
    for (let j = 0; j < 3; j++) {
      const r = 8 + burst * (30 + j * 10);
      g.lineStyle(2.6 - j * 0.6, j === 0 ? 0xffffff : tox, Math.max(0, (0.85 - burst)) * (0.5 + 0.5 * hot) * tip.a);
      g.save(); g.translateCanvas(tip.x, tip.y); g.scaleCanvas(1, 0.8);
      g.beginPath(); g.arc(0, 0, r, 0, TAU); g.strokePath(); g.restore();
    }
    g.fillStyle(tox, 0.9 * tip.a); g.fillCircle(tip.x, tip.y, 6);
    g.fillStyle(0xffffff, (0.6 + 0.4 * hot) * tip.a); g.fillCircle(tip.x, tip.y, 3);
    // 放射毒丝 + 溅落毒滴
    for (let j = 0; j < 8; j++) {
      const ang = (j / 8) * TAU + now / 240;
      g.lineStyle(1.8, acid, (0.8 - burst) * tip.a);
      g.lineBetween(tip.x, tip.y, tip.x + Math.cos(ang) * (10 + burst * 20), tip.y + Math.sin(ang) * (10 + burst * 20) * 0.8);
    }
    for (let j = 0; j < 5; j++) {
      const ph = ((now / 700 + j / 5) % 1);
      g.fillStyle(acid, (1 - ph) * 0.85 * tip.a);
      g.fillEllipse(tip.x + (j - 2) * 7, tip.y + 6 + ph * 16, 2.6, 4.6);
    }
    // 生化三叶徽记
    g.lineStyle(1.6, 0x1a2a0e, 0.8 * tip.a);
    g.beginPath(); g.arc(tip.x, tip.y, 4, 0, TAU); g.strokePath();
    for (let j = 0; j < 3; j++) {
      const ang = -Math.PI / 2 + (j / 3) * TAU;
      g.beginPath(); g.arc(tip.x + Math.cos(ang) * 4.4, tip.y + Math.sin(ang) * 4.4, 3, 0, TAU); g.strokePath();
    }
  } },

  // ───────────────────────── 强力冲水 ─────────────────────────
  toilSwing: { a: 0x8fd8ff, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const water = 0x8fd8ff, foam = 0xffffff, deep = 0x5aa8d8, rubber = 0xc04a2a;
    halo(g, k, 0xbfe8ff, 0.12);
    // 水柱：沿轨迹的蓝白水流带 + 白沫 + 气泡
    for (let i = 1; i < n; i++) {
      const np = nrm(k, i), q = k.pts[i - 1], p = k.pts[i];
      const wp = p.w * (0.55 + 0.7 * i / (n - 1));
      const wq = q.w * (0.55 + 0.7 * (i - 1) / (n - 1));
      const al = p.a;
      g.fillStyle(deep, al * 0.9);
      g.fillPoints([
        { x: q.x + nrm(k, i - 1).x * wq, y: q.y + nrm(k, i - 1).y * wq }, { x: p.x + np.x * wp, y: p.y + np.y * wp },
        { x: p.x - np.x * wp, y: p.y - np.y * wp }, { x: q.x - nrm(k, i - 1).x * wq, y: q.y - nrm(k, i - 1).y * wq },
      ] as never, true);
      g.fillStyle(water, al * 0.85);
      g.fillPoints([
        { x: q.x + nrm(k, i - 1).x * wq * 0.6, y: q.y + nrm(k, i - 1).y * wq * 0.6 }, { x: p.x + np.x * wp * 0.6, y: p.y + np.y * wp * 0.6 },
        { x: p.x - np.x * wp * 0.6, y: p.y - np.y * wp * 0.6 }, { x: q.x - nrm(k, i - 1).x * wq * 0.6, y: q.y - nrm(k, i - 1).y * wq * 0.6 },
      ] as never, true);
      if (i % 2 === 0) { // 白沫
        g.fillStyle(foam, al * 0.7);
        g.fillCircle(p.x + np.x * wp, p.y + np.y * wp, 2 + p.w * 0.1);
      }
    }
    // 末端：一记搋子重推 + 水花 + 漩涡
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const hang = Math.atan2(dir.y, dir.x);
    const w = tip.w * 0.5 + 4;
    g.save();
    g.translateCanvas(tip.x + dir.x * w, tip.y + dir.y * w);
    g.rotateCanvas(hang);
    // 皮碗（橡胶杯，凹面朝前）
    g.fillStyle(rubber, 1);
    g.fillPoints([{ x: -2, y: -13 }, { x: 16, y: -10 }, { x: 16, y: 10 }, { x: -2, y: 13 }] as never, true);
    g.fillStyle(0x8a2a1a, 1);
    g.fillEllipse(14, 0, 6, 22);
    g.fillStyle(0xff6a4a, 0.4);
    g.fillEllipse(10, -5, 8, 8);
    // 木柄
    g.fillStyle(0x8a5a2a, 1);
    g.fillRoundedRect(-16, -2.4, 16, 4.8, 2);
    g.fillStyle(0xa8783a, 0.7); g.fillRect(-16, -2.4, 16, 1.4);
    g.restore();
    // 推击水花（前方放射）
    const burst = (now / 460) % 1;
    for (let j = 0; j < 9; j++) {
      const ang = (j / 9) * TAU + now / 300;
      g.fillStyle(j % 2 ? foam : water, (1 - burst) * (0.6 + 0.4 * hot) * tip.a);
      g.fillCircle(tip.x + dir.x * 14 + Math.cos(ang) * (6 + burst * 20), tip.y + dir.y * 14 + Math.sin(ang) * (6 + burst * 20), 2.4 * (1 - burst) + 0.6);
    }
    // 泡沫圈 + 上升气泡
    for (let j = 0; j < 3; j++) {
      g.lineStyle(2.2 - j * 0.5, foam, (0.5 - j * 0.1) * tip.a);
      g.save(); g.translateCanvas(tip.x, tip.y); g.scaleCanvas(1, 0.7);
      g.beginPath(); g.arc(0, 0, 8 + j * 8 + burst * 10, 0, TAU); g.strokePath(); g.restore();
    }
    for (let j = 0; j < 5; j++) {
      const ph = ((now / 900 + j / 5) % 1);
      g.fillStyle(foam, 0.7 * (1 - ph) * tip.a);
      g.fillCircle(tip.x + (j - 2) * 8, tip.y - 6 - ph * 20, 1.6 * (1 - ph) + 0.5);
    }
  } },
};
