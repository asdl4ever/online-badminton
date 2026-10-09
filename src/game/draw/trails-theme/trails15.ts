import { curve, scatter, puffAt, ringAt, starAt, sparkAt, alongPath, headCore, type TrailArt } from './shared';

/** 批十四拖尾（年兽迎春 / 月夜狼族 / 末日丧尸 / 大便人厕所）——整条轨迹画成整体 */

export const TRAILS_15: Record<string, TrailArt> = {
  // ── 年兽迎春 ──
  nianTrailA: { c: 0xff8a3c, a: 0xffd45c, draw: (ctx, _c, a) => {
    // 鞭炮拖尾：一整串鞭炮沿轨迹铺开，一路炸出火花
    const { g, pts, fade, now } = ctx;
    alongPath(ctx, 1, 1, (x, y, tang, t, i) => {
      g.save(); g.translateCanvas(x, y); g.rotateCanvas(tang);
      g.fillStyle(i % 2 ? 0xd93a3a : 0xb02a2a, (0.5 + t * 0.45) * fade);
      g.fillRoundedRect(-5, -2, 10, 4, 1.6);
      g.fillStyle(a, 0.9 * fade); g.fillRect(-5, -0.6, 10, 1);
      g.restore();
      if (i % 3 === 0) {
        const ph = ((now / 300 + i) % 1);
        g.fillStyle(0xfff0b0, (1 - ph) * fade);
        for (let k = 0; k < 4; k++) { const ang = (k / 4) * 6.283 + i; g.fillCircle(x + Math.cos(ang) * (4 + ph * 8), y + Math.sin(ang) * (4 + ph * 8), 1.4); }
      }
    });
    sparkAt(ctx, pts[pts.length - 1].x, pts[pts.length - 1].y, 9, now / 300, 0xfff0b0, 0.8 * fade);
    headCore(ctx, a);
  } },
  nianTrailB: { c: 0xffd45c, a: 0xff8a3c, draw: (ctx, c, a) => {
    // 金粉拖尾：金色光带 + 沿路洒落的金粉与金粒
    const { fade, now } = ctx;
    curve(ctx, 2.6, 11, 0.4, 0.12, a);
    curve(ctx, 1.4, 5, 0.85, 0.35, c);
    alongPath(ctx, 1, 0, (x, y, _tang, t, i) => {
      const ph = ((now / 500 + i * 0.2) % 1);
      starAt(ctx, x + Math.sin(i * 2) * 5, y + Math.cos(i * 1.7) * 4, 2 + t * 3, now / 400 + i, c, (0.4 + t * 0.5) * (1 - ph * 0.5) * fade);
    });
    scatter(ctx, 10, 1.6, 0xfff0b0, 8, 0, 0.8);
    headCore(ctx, 0xfff0b0);
  } },
  // ── 月夜狼族 ──
  wolfTrailA: { c: 0xc0c8d8, a: 0x8a94a2, draw: (ctx, c, a) => {
    // 银月尘拖尾：银灰光带 + 一路飘散的月尘与碎月牙
    const { g, fade, now } = ctx;
    curve(ctx, 2.4, 10, 0.4, 0.1, a);
    curve(ctx, 1.2, 4, 0.85, 0.35, c);
    alongPath(ctx, 1, 0, (x, y, _tang, t, i) => {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + i));
      g.fillStyle(c, (0.5 + t * 0.4) * tw * fade);
      g.fillCircle(x + Math.sin(i * 1.7) * 5, y + Math.cos(i * 2.1) * 4, 1 + t * 1.6);
    });
    scatter(ctx, 9, 1.5, 0xffffff, 7, 0, 0.7);
    headCore(ctx, c);
  } },
  wolfTrailB: { c: 0xff3a4a, a: 0xc0c8d8, draw: (ctx, c, _a) => {
    // 赤痕拖尾：三道并行红爪痕 + 沿痕的血雾
    const { g, pts, fade } = ctx;
    for (let j = -1; j <= 1; j++) {
      const off = j * 6;
      g.lineStyle(2.6 - Math.abs(j) * 0.7, c, (0.55 + 0.35 * (1 - Math.abs(j))) * fade);
      g.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const nb = pts[Math.max(0, i - 1)], nf = pts[Math.min(pts.length - 1, i + 1)];
        const dx = nf.x - nb.x, dy = nf.y - nb.y, l = Math.hypot(dx, dy) || 1;
        const x = p.x + (-dy / l) * off, y = p.y + (dx / l) * off;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.strokePath();
    }
    scatter(ctx, 8, 1.8, 0xc0c8d8, 8, 0, 0.5);
    headCore(ctx, c);
  } },
  // ── 末日丧尸 ──
  zombTrailA: { c: 0x9cff3a, a: 0x7dff3a, draw: (ctx, c, a) => {
    // 毒液拖尾：绿色黏液带 + 向下滴的毒液 + 冒的毒泡
    const { g, pts, fade, now } = ctx;
    curve(ctx, 3.4, 11, 0.55, 0.2, a);
    curve(ctx, 1.8, 5.5, 0.85, 0.4, c);
    for (let k = 0; k < 6; k++) {
      const i = Math.floor(((k + 0.3) / 6) * (pts.length - 1));
      const p = pts[i];
      const ph = ((now / 800 + k / 6) % 1);
      g.fillStyle(c, (1 - ph) * 0.9 * fade);
      g.fillEllipse(p.x, p.y + 4 + ph * 12, 2.4, 4.6);
    }
    scatter(ctx, 7, 1.8, 0x7dff3a, 7, 0, 0.6);
    headCore(ctx, 0x9cff3a);
  } },
  zombTrailB: { c: 0x8a1a1a, a: 0xd93a3a, draw: (ctx, c, a) => {
    // 血雾拖尾：翻滚的红色血雾团 + 夹带血点
    const { pts, fade, now } = ctx;
    for (let k = 0; k < 12; k++) {
      const i = Math.floor(((k + 0.2) / 12) * (pts.length - 1));
      const p = pts[i];
      const t = k / 12;
      puffAt(ctx, p.x + Math.sin(now / 400 + k) * 5, p.y + Math.cos(now / 500 + k) * 3, 3 + t * 8, c, (0.3 - t * 0.14) * fade);
    }
    scatter(ctx, 9, 2, a, 8, 0, 0.7);
    headCore(ctx, a);
  } },
  // ── 大便人厕所 ──
  toilTrailA: { c: 0xe8f6ff, a: 0x8fd8ff, draw: (ctx, c, _a) => {
    // 皂泡拖尾：一串大小不一的肥皂泡，泡里透光
    const { pts, fade, now } = ctx;
    for (let k = 0; k < 11; k++) {
      const t = (k + 0.3) / 11;
      const i = Math.floor(t * (pts.length - 1));
      const p = pts[i];
      puffAt(ctx, p.x + Math.sin(now / 500 + k) * 4, p.y + Math.cos(now / 400 + k) * 3, 3 + t * 3, c, (0.28 + t * 0.3) * fade);
    }
    for (let k = 0; k < 6; k++) {
      const t = ((k * 0.618) % 1 + now / 1800) % 1;
      const i = Math.floor(t * (pts.length - 1));
      const p = pts[i];
      ringAt(ctx, p.x + Math.sin(k * 3) * 6, p.y + Math.cos(k * 2) * 4, 2 + t * 3, 1.2, 0xffffff, 0.5 * (1 - t) * fade);
    }
    headCore(ctx, 0xffffff);
  } },
  toilTrailB: { c: 0x8fd8ff, a: 0xffffff, draw: (ctx, c, a) => {
    // 冲水拖尾：一股蓝白水流沿轨迹冲过 + 飞溅水珠 + 白沫
    const { g, pts, fade, now } = ctx;
    curve(ctx, 3, 12, 0.5, 0.15, c);
    curve(ctx, 1.4, 5, 0.85, 0.35, a);
    for (let k = 0; k < 10; k++) {
      const i = Math.floor(((k + 0.3) / 10) * (pts.length - 1));
      const p = pts[i];
      const ph = ((now / 500 + k / 10) % 1);
      g.fillStyle(a, (1 - ph) * 0.8 * fade);
      g.fillCircle(p.x + Math.sin(k * 2) * 5, p.y - ph * 9, 1.6 * (1 - ph) + 0.5);
    }
    scatter(ctx, 8, 1.6, 0xffffff, 7, 0, 0.7);
    headCore(ctx, c);
  } },
};
