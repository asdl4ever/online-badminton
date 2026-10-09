import { curve, scatter, puffAt, ringAt, alongPath, headCore, type TrailArt } from './shared';

/** 第八批击球拖尾（冰海巨兽 / 极夜冰海 / 寒潮海象 / 维度裂隙 / 幽光深渊）——整条轨迹画成整体 */

export const TRAILS_20: Record<string, TrailArt> = {
  glacFrostTrail: { c: 0xbfe8ff, a: 0x5fd8ff, draw: (ctx, c, a) => {
    // 冰霜拖尾：一路冰晶霜花
    const { pts, fade, now } = ctx;
    curve(ctx, 2.4, 8, 0.35, 0.1, c);
    alongPath(ctx, 2, 0, (x, y, tang, _f, i) => { const on = 0.5 + 0.5 * Math.abs(Math.sin(now / 300 + i)); g0(ctx, x, y, 2.4 * on, i % 2 ? a : 0xffffff, (0.6 - i / pts.length * 0.3) * fade); void tang; });
    scatter(ctx, 7, 1.5, a, 8, 0, 0.6);
    headCore(ctx, 0xffffff);
  } },
  glacBubbleTrail: { c: 0x5fd8ff, a: 0xbfe8ff, draw: (ctx, c, a) => {
    // 冰泡拖尾：一路上升的冰泡 + 水花
    const { pts, fade, now } = ctx;
    for (let k = 0; k < 12; k++) { const i = Math.floor(((k + 0.2) / 12) * (pts.length - 1)); const t = k / 12; puffAt(ctx, pts[i].x + Math.sin(now / 600 + k) * 5, pts[i].y + Math.cos(now / 700 + k) * 3, 3 + t * 7, c, (0.4 - t * 0.2) * fade); }
    for (let k = 0; k < 7; k++) { const ph = ((now / 900 + k / 7) % 1); const i = Math.floor(ph * (pts.length - 1)); ringAt(ctx, pts[i].x + Math.sin(k * 3) * 5, pts[i].y + Math.cos(k * 2) * 4 - ph * 6, 1.6 + (1 - ph) * 2.4, 1.2, a, 0.55 * (1 - ph) * fade); }
    headCore(ctx, 0xffffff);
  } },
  fridPlanktonTrail: { c: 0x7dffd0, a: 0x39ffd0, draw: (ctx, c, a) => {
    // 浮游拖尾：一路明灭的发光浮游
    const { pts, fade, now } = ctx;
    curve(ctx, 1.6, 5, 0.3, 0.08, c);
    for (let k = 0; k < 14; k++) { const i = Math.floor(((k + 0.2) / 14) * (pts.length - 1)); const on = 0.4 + 0.6 * Math.abs(Math.sin(now / 400 + k * 1.3)); g0(ctx, pts[i].x + Math.sin(k * 2.1) * 6, pts[i].y + Math.cos(k * 1.7) * 6, 1.6 * on + 0.8, k % 2 ? c : a, 0.8 * on * fade); }
    headCore(ctx, a);
  } },
  fridLureTrail: { c: 0xffd45c, a: 0x7dffd0, draw: (ctx, c, a) => {
    // 诱饵拖尾：球身后拖着一串诱饵灯
    const { g, pts, fade, now } = ctx;
    curve(ctx, 2, 7, 0.3, 0.1, a);
    for (let k = 0; k < 8; k++) { const ph = ((now / 1100 + k / 8) % 1); const i = Math.floor(ph * (pts.length - 1)); const gl = 0.5 + 0.5 * Math.sin(now / 250 + k); g.fillStyle(c, 0.4 * gl * fade); g.fillCircle(pts[i].x, pts[i].y, 5 + (1 - ph) * 3); g.fillStyle(0xffffff, 0.8 * gl * fade); g.fillCircle(pts[i].x, pts[i].y, 1.8); }
    for (let k = 0; k < 6; k++) { const ph = ((now / 700 + k / 6) % 1); const i = Math.floor(ph * (pts.length - 1)); g.fillStyle(a, (1 - ph) * 0.6 * fade); g.fillCircle(pts[i].x + Math.sin(k * 2) * 5, pts[i].y - ph * 8, 1.4); }
    headCore(ctx, 0xffffff);
  } },
  walrSnowTrail: { c: 0xe8f4ff, a: 0x8fd8ff, draw: (ctx, c, a) => {
    // 雪尘拖尾：一路卷起的雪尘
    const { pts, fade, now } = ctx;
    curve(ctx, 2.4, 9, 0.3, 0.08, c);
    for (let k = 0; k < 14; k++) { const i = Math.floor(((k + 0.2) / 14) * (pts.length - 1)); const t = k / 14; puffAt(ctx, pts[i].x + Math.sin(now / 500 + k) * 7, pts[i].y + Math.cos(now / 600 + k) * 4, 2.6 + t * 7, c, (0.3 - t * 0.15) * fade); }
    scatter(ctx, 10, 1.5, a, 9, 0, 0.6);
    headCore(ctx, 0xffffff);
  } },
  walrSprayTrail: { c: 0x8fd8ff, a: 0xdff4ff, draw: (ctx, c, a) => {
    // 冰水拖尾：一路溅起的冰水花
    const { g, pts, fade, now } = ctx;
    curve(ctx, 2.4, 8, 0.4, 0.12, c);
    for (let k = 0; k < 10; k++) { const i = Math.floor(((k + 0.2) / 10) * (pts.length - 1)); const t = k / 10; puffAt(ctx, pts[i].x + Math.sin(now / 500 + k) * 8, pts[i].y + Math.cos(now / 600 + k) * 5 + t * 4, 2.4 + t * 6, 0xdff4ff, (0.5 - t * 0.25) * fade); }
    for (let k = 0; k < 8; k++) { const ph = ((now / 500 + k / 8) % 1); const i = Math.floor(ph * (pts.length - 1)); g.fillStyle(k % 2 ? a : c, (1 - ph) * 0.9 * fade); g.fillCircle(pts[i].x + Math.sin(k * 2.7) * 6, pts[i].y - ph * 10, 1.6 * (1 - ph) + 0.4); }
    headCore(ctx, 0xffffff);
  } },
  dimRiftTrail: { c: 0xb08aff, a: 0x7dffd0, draw: (ctx, c, a) => {
    // 维度拖尾：球身后撕开一道细长裂隙，内部星光流动
    const { g, pts, fade, now } = ctx;
    for (let k = 1; k < pts.length; k++) { const t = k / (pts.length - 1); g.lineStyle(5 - t * 2, 0x05040f, 0.7 * fade); g.lineBetween(pts[k - 1].x, pts[k - 1].y, pts[k].x, pts[k].y); }
    for (let k = 1; k < pts.length; k++) { const t = k / (pts.length - 1); g.lineStyle(2, c, 0.6 * t * fade); g.lineBetween(pts[k - 1].x, pts[k - 1].y - Math.sin(now / 300 + k) * 2, pts[k].x, pts[k].y); }
    for (let k = 0; k < 8; k++) { const ph = ((now / 700 + k / 8) % 1); const i = Math.floor(ph * (pts.length - 1)); g.fillStyle(k % 2 ? a : 0xffffff, (1 - ph) * 0.8 * fade); g.fillCircle(pts[i].x + Math.sin(k * 2) * 5, pts[i].y - 4 - ph * 8, 1.4); }
    headCore(ctx, 0xffffff);
  } },
  dimFractureTrail: { c: 0x7dffd0, a: 0xb08aff, draw: (ctx, c, a) => {
    // 碎裂拖尾：轨迹沿路碎裂成悬浮碎块
    const { g, pts, fade, now } = ctx;
    curve(ctx, 2, 7, 0.35, 0.1, c);
    for (let i = 2; i < pts.length; i += 2) { const p = pts[i]; const ang = (i * 1.3 + now / 900) % (Math.PI * 2); g.save(); g.translateCanvas(p.x + Math.sin(now / 500 + i) * 5, p.y); g.rotateCanvas(ang); g.fillStyle(i % 4 < 2 ? a : c, 0.8 * fade); g.fillPoints([{ x: 0, y: -6 }, { x: 5, y: 0 }, { x: 0, y: 6 }, { x: -5, y: 0 }] as never, true); g.restore(); }
    scatter(ctx, 6, 1.4, a, 7, 0, 0.6);
    headCore(ctx, 0xffffff);
  } },
  hadalInkTrail: { c: 0x1a3a3a, a: 0x39ffd0, draw: (ctx, c, a) => {
    // 墨汁拖尾：一路喷出的黑色墨汁 + 幽光点
    const { pts, fade, now } = ctx;
    for (let k = 0; k < 12; k++) { const i = Math.floor(((k + 0.2) / 12) * (pts.length - 1)); const t = k / 12; puffAt(ctx, pts[i].x + Math.sin(now / 700 + k) * 5, pts[i].y + Math.cos(now / 800 + k) * 3, 4 + t * 8, c, (0.6 - t * 0.3) * fade); }
    for (let k = 0; k < 6; k++) { const ph = ((now / 1000 + k / 6) % 1); const i = Math.floor(ph * (pts.length - 1)); g0(ctx, pts[i].x + Math.sin(k * 3) * 6, pts[i].y + Math.cos(k * 2) * 4, 1.6, a, 0.6 * (1 - ph) * fade); }
    headCore(ctx, a);
  } },
  hadalGlowTrail: { c: 0x39ffd0, a: 0x2a6a6a, draw: (ctx, c, a) => {
    // 幽光拖尾：一路漂着的发光小鱼群
    const { g, pts, fade, now } = ctx;
    curve(ctx, 1.6, 5, 0.3, 0.08, a);
    alongPath(ctx, 3, 0, (x, y, tang, _f, i) => { g.save(); g.translateCanvas(x, y); g.rotateCanvas(tang); g.fillStyle(c, 0.8 * fade); g.fillEllipse(0, 0, 6, 3); g.fillTriangle(-3, 0, -7, -2, -7, 2); g.fillStyle(0xffffff, 0.8 * fade); g.fillCircle(2, 0, 1); g.restore(); void i; });
    for (let k = 0; k < 6; k++) { const ph = ((now / 800 + k / 6) % 1); const i = Math.floor(ph * (pts.length - 1)); g.fillStyle(a, (1 - ph) * 0.6 * fade); g.fillCircle(pts[i].x, pts[i].y - ph * 8, 1.4); }
    headCore(ctx, 0xffffff);
  } },
};

function g0(ctx: { g: import('phaser').GameObjects.Graphics; fade: number }, x: number, y: number, r: number, color: number, alpha: number): void {
  ctx.g.fillStyle(color, alpha);
  ctx.g.fillCircle(x, y, r);
}
