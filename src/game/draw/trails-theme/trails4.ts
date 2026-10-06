import { curve, ribbon, type TrailArt } from './shared';

/** 批三主题拖尾（光之巨人 / 怪兽之王）。ctx: g/pts/fade/now，pts[0] 最旧、末位是球头。 */
export const TRAILS_4: Record<string, TrailArt> = {
  otmTrailA: { c: 0x9fd8ff, a: 0xffffff, draw: (ctx, c, a) => {
    // 光束拖尾：一道笔直的高能光束——白芯 + 蓝晕 + 光子流
    const { g, pts, fade, now } = ctx;
    curve(ctx, 8, 2.6, 0.15, 0.45, c);
    curve(ctx, 3, 1, 0.3, 0.9, 0xffffff);
    for (let k = 0; k < 6; k++) { // 光子流（沿束流动的亮点）
      const i = Math.floor(((k + (now / 150) % 1) / 6) * (pts.length - 1));
      const p = pts[i];
      g.fillStyle(a, 0.85 * fade);
      g.fillCircle(p.x, p.y, 1.6);
      g.fillStyle(c, 0.3 * fade);
      g.fillCircle(p.x, p.y, 3.2);
    }
    const head = pts[pts.length - 1];
    const gl = 0.6 + 0.4 * Math.sin(now / 200);
    g.fillStyle(c, gl * 0.5 * fade); // 球头出射辉光
    g.fillCircle(head.x, head.y, 6);
    g.fillStyle(0xffffff, fade);
    g.fillCircle(head.x, head.y, 2.4);
  } },
  otmTrailB: { c: 0xffe89a, a: 0xff4a5c, draw: (ctx, c, a) => {
    // 三重光痕：三道平行光线错层推进——金主束 + 侧束 + 交汇闪点
    const { g, pts, fade, now } = ctx;
    curve(ctx, 10, 2, 0.15, 0.5, c);
    curve(ctx, 4, 1.2, 0.3, 0.85, 0xffffff);
    for (let k = 0; k < 2; k++) { // 两条侧束（沿轨迹法向偏移的光点链）
      const off = k ? 6 : -6;
      for (let s = 0; s < pts.length; s += 3) {
        const p = pts[s];
        const nx = -(pts[Math.min(s + 1, pts.length - 1)].y - p.y);
        const ny = pts[Math.min(s + 1, pts.length - 1)].x - p.x;
        const l = Math.hypot(nx, ny) || 1;
        const gl = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + s * 0.4 + k));
        g.fillStyle(k ? a : c, gl * fade);
        g.fillCircle(p.x + (nx / l) * off, p.y + (ny / l) * off, 1.6);
      }
    }
    for (let k = 0; k < 5; k++) { // 交汇闪点
      const i = Math.floor(((k + 0.4) / 5) * (pts.length - 1));
      const p = pts[i];
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 200 + k * 1.6));
      g.fillStyle(0xffffff, tw * fade);
      g.fillRect(p.x - 2.6, p.y - 0.5, 5.2, 1); g.fillRect(p.x - 0.5, p.y - 2.6, 1, 5.2);
    }
    const head = pts[pts.length - 1];
    g.fillStyle(a, 0.6 * fade);
    g.fillCircle(head.x, head.y, 4);
    g.fillStyle(0xffffff, fade);
    g.fillCircle(head.x, head.y, 1.8);
  } },
  kjuTrailA: { c: 0xff9a3c, a: 0xff5a1a, draw: (ctx, c, a) => {
    // 灼热线拖尾：兽王踏过的灼热焦痕——焦土带 + 余烬 + 热浪扭曲
    const { g, pts, fade, now } = ctx;
    curve(ctx, 12, 2.4, 0.12, 0.3, 0x3a2a1a);
    curve(ctx, 8, 2, 0.2, 0.5, a);
    curve(ctx, 3.4, 1, 0.35, 0.9, c);
    for (let k = 0; k < 8; k++) { // 余烬（明灭飘散）
      const i = Math.floor(((k + 0.2) / 8) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 400 + k / 8) % 1;
      const gl = 0.4 + 0.6 * Math.abs(Math.sin(now / 180 + k * 2.1));
      g.fillStyle(k % 2 ? c : a, gl * (1 - ph) * fade);
      g.fillCircle(p.x + Math.sin(ph * 5 + k) * 5, p.y - ph * 9, (1.8 * (1 - ph) + 0.4) * gl);
    }
    for (let k = 0; k < 3; k++) { // 热浪（半透明上升气团）
      const i = Math.floor(((k + 0.5) / 3) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 900 + k / 3) % 1;
      g.fillStyle(0xffd0a0, 0.1 * Math.sin(ph * Math.PI) * fade);
      g.fillEllipse(p.x, p.y - ph * 18, 16, 8);
    }
    const head = pts[pts.length - 1];
    g.fillStyle(0xffe0a0, 0.85 * fade);
    g.fillCircle(head.x, head.y, 2.6);
    g.fillStyle(0xffffff, fade);
    g.fillCircle(head.x, head.y, 1.2);
  } },
  kjuTrailB: { c: 0x5ac8ff, a: 0xdff2ff, draw: (ctx, c, a) => {
    // 原子蓝波：轨迹化作原子能脉冲——蓝白波带 + 沿途环形脉冲 + 电离尘
    const { g, pts, fade, now } = ctx;
    ribbon(ctx, 10, 1.6, now / 350, 6, c, 0.35 * fade);
    curve(ctx, 6, 1.6, 0.2, 0.6, c);
    curve(ctx, 2.4, 0.8, 0.35, 0.9, 0xffffff);
    for (let k = 0; k < 5; k++) { // 环形脉冲（外扩的原子环）
      const i = Math.floor(((k + 0.5) / 5) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 450 + k / 5) % 1;
      g.lineStyle(1.8, c, (0.7 * (1 - ph)) * fade);
      g.strokeCircle(p.x, p.y, 3 + ph * 10);
      g.lineStyle(1, a, (0.4 * (1 - ph)) * fade);
      g.strokeCircle(p.x, p.y, (3 + ph * 10) * 0.6);
    }
    for (let k = 0; k < 5; k++) { // 电离尘
      const i = Math.floor(((k + 0.3) / 5) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 500 + k / 5) % 1;
      g.fillStyle(a, 0.7 * (1 - ph) * fade);
      g.fillCircle(p.x + Math.sin(ph * 4 + k) * 6, p.y - ph * 8, 1.4 * (1 - ph) + 0.4);
    }
    const head = pts[pts.length - 1];
    g.fillStyle(0xffffff, fade);
    g.fillCircle(head.x, head.y, 2.4);
    g.lineStyle(1.4, c, 0.7 * fade);
    g.strokeCircle(head.x, head.y, 5);
  } },
};
