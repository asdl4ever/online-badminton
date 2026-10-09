import { TAU, type G, type SwingArt, type SwingKit } from './shared';

/**
 * 批十六挥拍拖尾（天竺神话 / 高天原 / 凯尔特 / 美索不达米亚 / 克苏鲁）——按名字重新构图：
 * 金刚降魔斩 = 一柄金刚杵砸下；须佐斩蛇 = 一剑斩过八岐大蛇；荆棘藤蔓斩 = 抽出的荆棘藤鞭；
 * 提亚马特裂空斩 = 一斩劈开原初龙躯；旧日苏醒 = 撕开空间拽出触须。
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

export const SWINGS_17: Record<string, SwingArt> = {
  vdaVajraSwing: { a: 0x7fd4ff, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const gold = 0xffd45c, bolt = 0x7fd4ff;
    halo(g, k, 0xffd45c, 0.12);
    // 金色梵文能量带沿轨迹
    for (let i = 1; i < n; i++) {
      const np = nrm(k, i), q = k.pts[i - 1], p = k.pts[i];
      const w = p.w * (0.5 + 0.6 * i / (n - 1));
      g.fillStyle(gold, p.a * 0.55);
      g.fillPoints([{ x: q.x + nrm(k, i - 1).x * w, y: q.y + nrm(k, i - 1).y * w }, { x: p.x + np.x * w, y: p.y + np.y * w }, { x: p.x - np.x * w, y: p.y - np.y * w }, { x: q.x - nrm(k, i - 1).x * w, y: q.y - nrm(k, i - 1).y * w }] as never, true);
    }
    // 末端金刚杵砸下：一根带双向尖刃的杵 + 电光
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const ang = Math.atan2(dir.y, dir.x);
    g.save();
    g.translateCanvas(tip.x, tip.y);
    g.rotateCanvas(ang + Math.PI / 2);
    const s = (16 + hot * 6);
    g.fillStyle(0xb87a1a, 1); g.fillRoundedRect(-3, -s * 0.5, 6, s, 2);
    g.fillStyle(gold, 1);
    g.fillPoints([{ x: -3, y: -s * 0.5 }, { x: 3, y: -s * 0.5 }, { x: 0, y: -s * 1.05 }] as never, true);
    g.fillPoints([{ x: -3, y: s * 0.5 }, { x: 3, y: s * 0.5 }, { x: 0, y: s * 1.05 }] as never, true);
    g.fillStyle(0xff7a2a, 0.95); g.fillCircle(0, 0, 4);
    g.fillStyle(0xffffff, 0.8 + 0.2 * hot); g.fillCircle(0, 0, 1.8);
    g.restore();
    // 砸下的电光
    for (let j = 0; j < 6; j++) {
      const ang2 = (j / 6) * TAU + now / 200;
      g.lineStyle(2 - hot * 1.2, j % 2 ? bolt : gold, (0.8 - hot * 0.6) * tip.a);
      g.lineBetween(tip.x, tip.y, tip.x + Math.cos(ang2) * (10 + hot * 20), tip.y + Math.sin(ang2) * (10 + hot * 20));
    }
  } },

  takSusanoo: { a: 0x7fd4ff, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const blade = 0xdff0ff, red = 0xc0392b, scale = 0x2f7a4a;
    halo(g, k, 0xdff0ff, 0.12);
    // 白色剑气
    for (let i = 1; i < n; i++) {
      const np = nrm(k, i), q = k.pts[i - 1], p = k.pts[i];
      const w = p.w * (0.4 + 0.6 * i / (n - 1));
      g.fillStyle(blade, p.a * 0.5);
      g.fillPoints([{ x: q.x + nrm(k, i - 1).x * w, y: q.y + nrm(k, i - 1).y * w }, { x: p.x + np.x * w, y: p.y + np.y * w }, { x: p.x - np.x * w, y: p.y - np.y * w }, { x: q.x - nrm(k, i - 1).x * w, y: q.y - nrm(k, i - 1).y * w }] as never, true);
    }
    // 被斩的八岐大蛇：沿轨迹盘着的蛇身 + 飞散的蛇首
    for (let b = 0; b < 8; b++) {
      const t = ((b + (now / 500) % 1) / 8) % 1;
      const i = Math.min(n - 1, Math.floor(t * (n - 1)));
      const p = k.pts[i], np = nrm(k, i);
      const off = (b % 2 ? 1 : -1) * (k.pts[i].w + 6 + b * 1.5);
      const hx = p.x + np.x * off, hy = p.y + np.y * off;
      g.lineStyle(4, scale, 0.85);
      g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(hx, hy); g.strokePath();
      g.fillStyle(scale, 0.95); g.fillEllipse(hx, hy, 12, 8);
      g.fillStyle(red, 0.9); g.fillCircle(hx + 3, hy - 2, 2.2); // 蛇眼
      g.fillStyle(0xf0f4f8, 0.9); g.fillTriangle(hx + 5, hy + 2, hx + 8, hy + 5, hx + 5, hy + 6);
      g.lineStyle(1.4, red, 0.8); g.lineBetween(hx + 6, hy + 4, hx + 12, hy + 3); g.lineBetween(hx + 6, hy + 5, hx + 12, hy + 8);
    }
    // 剑锋撞击爆点
    const tip = k.pts[n - 1], burst = (now / 460) % 1;
    for (let j = 0; j < 9; j++) { const ang = (j / 9) * TAU + now / 240; g.lineStyle(2.4 - burst * 1.4, j % 2 ? blade : red, (0.9 - burst) * tip.a); g.lineBetween(tip.x, tip.y, tip.x + Math.cos(ang) * (8 + burst * 22), tip.y + Math.sin(ang) * (8 + burst * 22)); }
    g.fillStyle(0xffffff, (1 - burst) * (0.6 + 0.4 * hot) * tip.a); g.fillCircle(tip.x, tip.y, 5 + burst * 5);
  } },

  celtBramble: { a: 0x8fd45a, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const green = 0x8fd45a, dark = 0x2f7a4a, glow = 0xd8ff9a;
    halo(g, k, 0x8fd45a, 0.12);
    // 抽出的荆棘藤鞭：沿轨迹的多股藤条 + 尖刺
    for (let b = 0; b < 3; b++) {
      g.lineStyle(4 - b, b % 2 ? dark : green, 0.9);
      g.beginPath();
      let started = false;
      for (let i = 1; i < n; i++) {
        const p = k.pts[i], np = nrm(k, i);
        const off = Math.sin(now / 300 + b + i * 0.5) * (k.pts[i].w + 2 + b * 3);
        const x = p.x + np.x * off, y = p.y + np.y * off;
        if (!started) { g.moveTo(x, y); started = true; } else g.lineTo(x, y);
      }
      g.strokePath();
    }
    // 藤上的尖刺
    for (let i = 2; i < n; i += 2) {
      const p = k.pts[i], np = nrm(k, i);
      const dir = Math.sin(now / 400 + i) > 0 ? 1 : -1;
      g.fillStyle(dark, 0.95);
      g.fillTriangle(p.x, p.y, p.x + np.x * 10 * dir, p.y + np.y * 10 * dir, p.x + np.x * 10 * dir - np.x * 4, p.y + np.y * 10 * dir - np.y * 4);
    }
    // 末端绽开的藤花
    const tip = k.pts[n - 1], burst = (now / 480) % 1;
    for (let j = 0; j < 8; j++) {
      const ang = (j / 8) * TAU + now / 260;
      g.fillStyle(j % 2 ? green : glow, (1 - burst) * (0.6 + 0.4 * hot) * tip.a);
      g.fillCircle(tip.x + Math.cos(ang) * (8 + burst * 22), tip.y + Math.sin(ang) * (8 + burst * 22), 2.2 - burst * 0.8);
    }
    g.fillStyle(0xffffff, (1 - burst) * (0.5 + 0.5 * hot) * tip.a); g.fillCircle(tip.x, tip.y, 4);
  } },

  mesoTiamatCleave: { a: 0xd8b45a, draw: (g, now, hot, k, _c, _a) => {
    const n = k.n;
    const clay = 0xd8b45a, lapis = 0x5a8aff, flood = 0x8fd4ff;
    halo(g, k, 0xd8b45a, 0.12);
    // 金色楔文剑光
    for (let i = 1; i < n; i++) {
      const np = nrm(k, i), q = k.pts[i - 1], p = k.pts[i];
      const w = p.w * (0.4 + 0.6 * i / (n - 1));
      g.fillStyle(clay, p.a * 0.5);
      g.fillPoints([{ x: q.x + nrm(k, i - 1).x * w, y: q.y + nrm(k, i - 1).y * w }, { x: p.x + np.x * w, y: p.y + np.y * w }, { x: p.x - np.x * w, y: p.y - np.y * w }, { x: q.x - nrm(k, i - 1).x * w, y: q.y - nrm(k, i - 1).y * w }] as never, true);
    }
    // 被劈开的原初龙躯（沿轨迹裂成两半的鳞身）
    for (let i = 2; i < n; i += 2) {
      const p = k.pts[i], np = nrm(k, i);
      const gap = k.pts[i].w + 6 + Math.sin(now / 300 + i) * 2;
      g.fillStyle(0x2f7a4a, 0.85);
      g.fillPoints([{ x: p.x + np.x * gap, y: p.y + np.y * gap }, { x: p.x + np.x * (gap + 14), y: p.y + np.y * (gap + 14) }, { x: p.x + np.x * (gap + 14) + np.y * 6, y: p.y + np.y * (gap + 14) - np.x * 6 }] as never, true);
      g.fillStyle(0x2f7a4a, 0.85);
      g.fillPoints([{ x: p.x - np.x * gap, y: p.y - np.y * gap }, { x: p.x - np.x * (gap + 14), y: p.y - np.y * (gap + 14) }, { x: p.x - np.x * (gap + 14) - np.y * 6, y: p.y - np.y * (gap + 14) + np.x * 6 }] as never, true);
      g.fillStyle(lapis, 0.5); g.fillCircle(p.x, p.y, 3);
    }
    // 末端洪水喷涌
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    for (let j = 0; j < 8; j++) {
      const spread = (j - 3.5) * 0.2;
      const ang = Math.atan2(dir.y, dir.x) + spread;
      const len = 14 + ((now / 300 + j * 0.3) % 1) * 34;
      g.lineStyle(3, flood, (0.7 - j * 0.05) * tip.a);
      g.beginPath(); g.moveTo(tip.x, tip.y); g.lineTo(tip.x + Math.cos(ang) * len, tip.y + Math.sin(ang) * len); g.strokePath();
      g.fillStyle(flood, 0.8 * tip.a); g.fillCircle(tip.x + Math.cos(ang) * len, tip.y + Math.sin(ang) * len, 1.8);
    }
    g.fillStyle(0xffffff, (0.6 + 0.4 * hot) * tip.a); g.fillCircle(tip.x, tip.y, 4.4);
  } },

  cthAwakening: { a: 0x7a4aa8, draw: (g, now, _hot, k, _c, _a) => {
    const n = k.n;
    const deep = 0x123040, purple = 0x7a4aa8, glow = 0x5fe8c8;
    halo(g, k, 0x7a4aa8, 0.12);
    // 撕开的空间裂痕
    for (let i = 1; i < n; i++) {
      const np = nrm(k, i), q = k.pts[i - 1], p = k.pts[i];
      const w = p.w * 0.7 + 3;
      g.fillStyle(0x05080f, p.a * 0.8);
      g.fillPoints([{ x: q.x + nrm(k, i - 1).x * w, y: q.y + nrm(k, i - 1).y * w }, { x: p.x + np.x * w, y: p.y + np.y * w }, { x: p.x - np.x * w, y: p.y - np.y * w }, { x: q.x - nrm(k, i - 1).x * w, y: q.y - nrm(k, i - 1).y * w }] as never, true);
    }
    // 从裂痕里拽出的触须
    for (let b = 0; b < 4; b++) {
      g.lineStyle(5 - b * 0.6, b % 2 ? deep : purple, 0.9);
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
    // 末端睁开的巨眼
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const ang = Math.atan2(dir.y, dir.x);
    const open = 0.6 + 0.4 * Math.sin(now / 200);
    g.save();
    g.translateCanvas(tip.x + dir.x * 6, tip.y + dir.y * 6);
    g.rotateCanvas(ang);
    g.fillStyle(0x1a0e2e, 0.95); g.fillEllipse(0, 0, 26 * open, 20 * open);
    g.fillStyle(0xfff0a0, 0.95); g.fillEllipse(0, 0, 20 * open, 14 * open);
    g.fillStyle(0x1a0e2e, 1); g.fillCircle(0, 0, 5 * open);
    g.fillStyle(glow, 0.95); g.fillCircle(0, 0, 2.4 * open);
    g.fillStyle(0xffffff, 0.8); g.fillCircle(-1.5, -1.5, 1.2 * open);
    g.restore();
    for (let j = 0; j < 5; j++) { const ph = ((now / 700 + j / 5) % 1); g.fillStyle(glow, (1 - ph) * 0.8 * tip.a); g.fillCircle(tip.x + dir.x * (14 + ph * 14) + Math.sin(j * 2) * 6, tip.y + dir.y * (14 + ph * 14) + Math.cos(j * 2) * 6, 1.6); }
  } },
};
