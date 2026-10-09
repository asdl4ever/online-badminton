import { curve, scatter, puffAt, ringAt, sparkAt, polyAt, alongPath, headCore, type TrailArt } from './shared';

/** 第十批击球拖尾（梦境 / 微观 / 炼金 / 毛线 / 画中世界）——整条轨迹画成整体，按名字构图 */

export const TRAILS_22: Record<string, TrailArt> = {
  // ── 梦境回廊 ──
  dreamBubbleTrail: { c: 0x9f8aff, a: 0xfff4d8, draw: (ctx, c, a) => {
    // 梦泡拖尾：一路明灭上浮的梦泡
    const { now } = ctx;
    curve(ctx, 1.8, 6, 0.35, 0.12, c);
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => { const ph = ((now / 900 + i / 5) % 1); ringAt(ctx, x, y - ph * 8, (2 + f * 4) * (0.6 + 0.4 * Math.sin(now / 300 + i)), 1.2, a, (1 - ph) * 0.6); });
    scatter(ctx, 6, 2, a, 6, 2, 0.5);
    headCore(ctx, 0xfff4d8);
  } },
  dreamSandTrail: { c: 0xd8b45a, a: 0xffe08a, draw: (ctx, c, a) => {
    // 眠沙拖尾：金色眠沙 + 沙尘
    const { now } = ctx;
    curve(ctx, 2.4, 8, 0.4, 0.14, c);
    alongPath(ctx, 3, 0, (x, y, _t, f) => { polyAt(ctx, x, y, 2 + f * 2, 4, now / 600 + f * 6, a, 0.6); });
    scatter(ctx, 10, 1.6, a, 7, 0, 0.7);
    headCore(ctx, 0xfff0c0);
  } },
  dreamStarTrail: { c: 0xffe08a, a: 0x9f8aff, draw: (ctx, c, a) => {
    // 星屑拖尾：一道星屑
    curve(ctx, 1.6, 5, 0.3, 0.1, 0x6a5a9a);
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => sparkAt(ctx, x, y, 2 + f * 3, ctx.now / 300 + i, c, 0.85));
    scatter(ctx, 5, 1.6, a, 5, 0, 0.6);
    headCore(ctx, 0xfff4d8);
  } },
  dreamFeatherTrail: { c: 0xf0e8d8, a: 0x9f8aff, draw: (ctx, c, a) => {
    // 羽绒拖尾：一路轻飘的绒羽
    const { pts } = ctx;
    curve(ctx, 1.4, 4, 0.25, 0.08, 0x8a78c8);
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => { if (i % 2) { ctx.g.fillStyle(c, 0.85 * (1 - f * 0.3)); ctx.g.fillEllipse(x, y, 5, 2.4); } });
    for (let k = 0; k < 5; k++) { const i = Math.floor(((k + 0.3) / 5) * (pts.length - 1)); puffAt(ctx, pts[i].x + Math.sin(k * 3) * 4, pts[i].y - 6, 2, c, 0.5); }
    headCore(ctx, 0xffffff);
    void a;
  } },
  // ── 微观世界 ──
  microCiliaTrail: { c: 0x5fe8d0, a: 0x39ffd0, draw: (ctx, c, a) => {
    // 纤毛拖尾：一排摆动的纤毛 + 细胞质颗粒
    const { g, now } = ctx;
    curve(ctx, 2, 7, 0.35, 0.12, 0x2a7a8a);
    alongPath(ctx, 1, 0, (x, y, t, f, i) => { g.lineStyle(1.4, i % 2 ? a : c, 0.8 * (1 - f * 0.3)); g.lineBetween(x, y, x + Math.cos(t) * 8, y + Math.sin(t) * 8 + Math.sin(now / 200 + i) * 3); });
    scatter(ctx, 7, 1.6, a, 6, 0, 0.6);
    headCore(ctx, 0xbafff0);
  } },
  microIodineTrail: { c: 0x8a5a2a, a: 0x5fe8d0, draw: (ctx, c, a) => {
    // 碘液拖尾：一路碘液 + 液滴
    const { now } = ctx;
    curve(ctx, 2.2, 8, 0.45, 0.18, c);
    alongPath(ctx, 4, 0, (x, y, _t, f) => { polyAt(ctx, x, y, 2 + f * 2, 6, now / 700, 0xc89050, 0.6); });
    scatter(ctx, 5, 1.6, a, 5, 0, 0.5);
    headCore(ctx, 0xd8a060);
  } },
  // ── 炼金工坊 ──
  alchGoldTrail: { c: 0xffd45c, a: 0x7dff6a, draw: (ctx, c, a) => {
    // 点金拖尾：金液痕 + 金粒
    const { now } = ctx;
    curve(ctx, 2.6, 9, 0.5, 0.2, c);
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => sparkAt(ctx, x, y, 2 + f * 2, now / 400 + i, 0xffe08a, 0.8));
    scatter(ctx, 6, 1.6, 0xffe08a, 6, 0, 0.7);
    headCore(ctx, 0xfff0b0);
    void a;
  } },
  alchSmokeTrail: { c: 0x7dff6a, a: 0xffd45c, draw: (ctx, c, a) => {
    // 药烟拖尾：绿色药烟 + 药泡
    const { now } = ctx;
    curve(ctx, 2, 7, 0.35, 0.12, 0x2a4a1a);
    for (let k = 0; k < 9; k++) { const ph = ((now / 1000 + k / 9) % 1); const i = Math.floor(ph * (ctx.pts.length - 1)); puffAt(ctx, ctx.pts[i].x + Math.sin(k * 3) * 5, ctx.pts[i].y - 6 - ph * 6, 3 + ph * 5, c, (1 - ph) * 0.5); }
    scatter(ctx, 5, 1.6, a, 6, 2, 0.6);
    headCore(ctx, 0xbaffa0);
  } },
  // ── 毛线世界 ──
  yarnThreadTrail: { c: 0xffb7d5, a: 0xffd8e8, draw: (ctx, c, a) => {
    // 丝线拖尾：一线缠摆的丝线
    const { g, now } = ctx;
    curve(ctx, 1.8, 5, 0.3, 0.1, 0xa86a8a);
    alongPath(ctx, 1, 0, (x, y, _t, f, i) => { g.lineStyle(2, i % 2 ? c : a, 0.8 * (1 - f * 0.3)); g.fillCircle(x + Math.sin(now / 400 + i) * 2, y + Math.cos(now / 400 + i) * 2, 1.4); });
    scatter(ctx, 5, 1.6, a, 6, 0, 0.6);
    headCore(ctx, 0xffd8e8);
  } },
  yarnLintTrail: { c: 0xffd8e8, a: 0xffb7d5, draw: (ctx, c, a) => {
    // 绒絮拖尾：飞絮
    curve(ctx, 1.4, 5, 0.28, 0.1, 0xa86a8a);
    for (let k = 0; k < 14; k++) { const ph = ((ctx.now / 1200 + k / 14) % 1); const i = Math.floor(ph * (ctx.pts.length - 1)); puffAt(ctx, ctx.pts[i].x + Math.sin(k * 4) * 5, ctx.pts[i].y - 4, 1.6 + (k % 2), k % 2 ? c : a, 0.6); }
    headCore(ctx, 0xffffff);
  } },
  yarnGoldTrail: { c: 0xffe040, a: 0xffffff, draw: (ctx, c, a) => {
    // 金线拖尾：一道金线 + 金点
    const { g } = ctx;
    g.lineStyle(2.4, c, 0.9); curve(ctx, 1.6, 2, 0.6, 0.3, c);
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => sparkAt(ctx, x, y, 1.6 + f * 2, i, 0xffffff, 0.7));
    scatter(ctx, 4, 1.4, 0xffffff, 5, 0, 0.6);
    headCore(ctx, 0xfff8c0);
    void a;
  } },
  // ── 画中世界 ──
  paintStroke: { c: 0xff8ad4, a: 0xffd45c, draw: (ctx, c, a) => {
    // 笔触拖尾：一笔浓墨重彩，飞白 + 色点
    const { g } = ctx;
    curve(ctx, 4, 12, 0.6, 0.25, c);
    const cols = [0xff4a4a, 0xffd45c, 0x7dff9a, 0x5ac8ff];
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => { if (i % 3 === 0) { g.fillStyle(cols[(i / 3) % 4], 0.9); g.fillEllipse(x, y, 8 * (1 - f * 0.4), 3); } });
    scatter(ctx, 8, 2, a, 8, 0, 0.6);
    headCore(ctx, 0xfff0f0);
  } },
  paintDripTrail: { c: 0xff8ad4, a: 0x5ac8ff, draw: (ctx, c, a) => {
    // 滴彩拖尾：一路滴落的颜料
    const { g, now } = ctx;
    const cols = [0xff4a4a, 0xffd45c, 0x7dff9a, 0x5ac8ff];
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => { g.fillStyle(cols[i % 4], 0.85); g.fillCircle(x, y, 3 + f * 3); });
    for (let k = 0; k < 6; k++) { const ph = ((now / 1000 + k / 6) % 1); const i = Math.floor(ph * (ctx.pts.length - 1)); g.fillStyle(cols[k % 4], (1 - ph) * 0.8); g.fillEllipse(ctx.pts[i].x, ctx.pts[i].y + 8 + ph * 12, 2.4, 4); }
    headCore(ctx, 0xfff0f0);
    void c; void a;
  } },
  paintGoldTrail: { c: 0xffd45c, a: 0xffffff, draw: (ctx, c, a) => {
    // 描金拖尾：一道描金细线
    curve(ctx, 1.8, 5, 0.5, 0.2, c);
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => sparkAt(ctx, x, y, 1.6 + f * 2, i, 0xfff0b0, 0.7));
    scatter(ctx, 4, 1.4, 0xffffff, 5, 0, 0.6);
    headCore(ctx, 0xfff8c0);
    void a;
  } },
};
