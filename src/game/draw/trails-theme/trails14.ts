import { curve, scatter, puffAt, ringAt, starAt, sparkAt, alongPath, headCore, type TrailArt } from './shared';

/** 批十三拖尾（尼斯湖水怪 / 熊出没 / 雪山谜踪）——整条轨迹画成整体 */

export const TRAILS_14: Record<string, TrailArt> = {
  // ── 尼斯湖水怪 ──
  lochTrailA: { c: 0x8fe8ff, a: 0x35d8a8, draw: (ctx, c, a) => {
    // 水花拖尾：一条水色光带，沿路甩起一串水珠，球头炸开一张水花
    const { g, pts, fade, now } = ctx;
    curve(ctx, 3, 13, 0.35, 0.08, a);
    curve(ctx, 1.6, 5, 0.7, 0.3, c);
    scatter(ctx, 12, 2.2, c, 6, 0, 0.85);
    scatter(ctx, 7, 1.6, 0xffffff, 9, 0, 0.6);
    const head = pts[pts.length - 1];
    for (let k = 0; k < 5; k++) { // 球头水花
      const ang = (k / 5) * Math.PI * 2 + now / 300;
      g.fillStyle(0xdff6ee, 0.75 * fade);
      g.fillCircle(head.x + Math.cos(ang) * 9, head.y + Math.sin(ang) * 9, 2);
    }
    headCore(ctx, c);
  } },
  lochTrailB: { c: 0xe8f8ff, a: 0x8fe8c8, draw: (ctx, c, a) => {
    // 泡沫拖尾：一串大小不一的泡沫团，泡里透光，末端冒小泡
    const { pts, fade, now } = ctx;
    ringAt(ctx, pts[Math.floor(pts.length / 2)].x, pts[Math.floor(pts.length / 2)].y, 10, 2, a, 0.25 * fade);
    for (let k = 0; k < 10; k++) {
      const t = (k + 0.3) / 10;
      const i = Math.floor(t * (pts.length - 1));
      const p = pts[i];
      puffAt(ctx, p.x + Math.sin(k * 2.3) * 4, p.y + Math.cos(k * 1.7) * 3, 3.4 + t * 3, c, (0.3 + t * 0.4) * fade);
    }
    for (let k = 0; k < 6; k++) { // 空心泡泡
      const t = ((k * 0.618) % 1 + now / 1800) % 1;
      const i = Math.floor(t * (pts.length - 1));
      const p = pts[i];
      ringAt(ctx, p.x + Math.sin(k * 3) * 6, p.y + Math.cos(k * 2) * 4, 2 + t * 3, 1.2, 0xffffff, 0.5 * (1 - t) * fade);
    }
    headCore(ctx, 0xffffff);
  } },
  // ── 熊出没 ──
  boonTrailA: { c: 0xb8945a, a: 0x6a4a2a, draw: (ctx, c, a) => {
    // 木屑拖尾：一股锯木屑光带，沿途崩飞旋转的碎木片与锯末
    const { g, fade, now } = ctx;
    curve(ctx, 2.6, 10, 0.4, 0.12, a);
    curve(ctx, 1.4, 4, 0.7, 0.3, c);
    alongPath(ctx, 2, 1, (x, y, tang, t) => { // 碎木片
      g.fillStyle(t * 0.7 > 0.4 ? c : a, 0.85 * fade);
      const s = 3 + t * 3;
      g.save(); g.translateCanvas(x + Math.sin(t * 20) * 3, y + Math.cos(t * 15) * 3); g.rotateCanvas(tang * 3 + t * 6 + now / 300);
      g.fillRect(-s / 2, -s / 5, s, s * 0.4);
      g.fillStyle(0xd8b884, 0.5 * fade);
      g.fillRect(-s / 2, -s / 5, s * 0.4, s * 0.4);
      g.restore();
    });
    scatter(ctx, 10, 1.6, 0xd8b884, 7, 0, 0.7);
    headCore(ctx, c);
  } },
  boonTrailB: { c: 0xffb03a, a: 0xffcf5c, draw: (ctx, c, a) => {
    // 蜂蜜拖尾：黏稠的金色蜜流，沿着轨迹垂着往下淌，末端挂着蜜珠
    const { g, pts, fade, now } = ctx;
    curve(ctx, 4, 12, 0.6, 0.25, a);
    curve(ctx, 2, 6, 0.9, 0.4, c);
    // 垂挂的蜜滴
    for (let k = 0; k < 7; k++) {
      const t = (k + 0.3) / 7;
      const i = Math.floor(t * (pts.length - 1));
      const p = pts[i];
      const sag = 4 + Math.sin(now / 500 + k) * 2 + t * 6;
      g.fillStyle(a, (0.5 + t * 0.4) * fade);
      g.fillEllipse(p.x, p.y + sag, 3 + t * 2.4, 4 + t * 3.4);
      g.fillStyle(0xffffff, 0.5 * fade);
      g.fillCircle(p.x - 0.8, p.y + sag - 1.4, 1);
    }
    headCore(ctx, 0xffd45c);
  } },
  // ── 雪山谜踪 ──
  bigfTrailA: { c: 0xe0f2ff, a: 0x8fd8ff, draw: (ctx, c, a) => {
    // 雪粉拖尾：翻滚的雪雾团，越往后越大越散，掺着细小冰星
    const { pts, fade, now } = ctx;
    for (let k = 0; k < 12; k++) {
      const t = (k + 0.2) / 12;
      const i = Math.floor(t * (pts.length - 1));
      const p = pts[i];
      puffAt(ctx, p.x + Math.sin(k * 1.7 + now / 700) * 4, p.y + Math.cos(k * 2.1) * 3, 3 + t * 8, c, (0.28 - t * 0.12) * fade);
    }
    scatter(ctx, 10, 1.8, 0xffffff, 8, 0, 0.7);
    sparkAt(ctx, pts[pts.length - 1].x, pts[pts.length - 1].y, 7, now / 400, a, 0.6 * fade);
    headCore(ctx, 0xffffff);
  } },
  bigfTrailB: { c: 0xbfe8ff, a: 0xffffff, draw: (ctx, c, a) => {
    // 冰晶拖尾：一条冷蓝光带，沿途结出会转的六角冰晶，晶面反光
    const { g, pts, fade, now } = ctx;
    curve(ctx, 2.4, 9, 0.45, 0.15, c);
    curve(ctx, 1.2, 3.6, 0.8, 0.35, a);
    alongPath(ctx, 2, 1, (x, y, _tang, t, i) => {
      starAt(ctx, x, y, 3 + t * 4, now / 900 + i, c, 0.75 * fade, 6);
      g.fillStyle(0xffffff, 0.7 * fade);
      g.fillCircle(x, y, 1 + t);
    });
    sparkAt(ctx, pts[pts.length - 1].x, pts[pts.length - 1].y, 9, now / 300, a, 0.7 * fade);
    headCore(ctx, c);
  } },
};
