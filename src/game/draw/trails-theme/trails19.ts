import { curve, scatter, puffAt, alongPath, headCore, polyAt, type TrailArt } from './shared';

/** 第七批击球拖尾（纳米矩阵 / 数据洪流 / 曲速跃迁 / 火星殖民 / 先行者遗迹）——整条轨迹画成整体 */

export const TRAILS_19: Record<string, TrailArt> = {
  nanoTrail: { c: 0x4affd0, a: 0x7fe8ff, draw: (ctx, c, a) => {
    // 纳米拖尾：粒子组成的轨迹，粒子沿路重组/消散
    const { pts, fade, now } = ctx;
    curve(ctx, 1.6, 5, 0.4, 0.12, c);
    for (let k = 0; k < 16; k++) { const i = Math.floor(((k + 0.2) / 16) * (pts.length - 1)); const t = k / 16; const jx = Math.sin(now / 300 + k * 1.7) * 7, jy = Math.cos(now / 350 + k * 1.3) * 7; g0(ctx, pts[i].x + jx, pts[i].y + jy, 1.6 + (1 - t) * 1.6, k % 2 ? c : a, (0.6 - t * 0.3) * fade); }
    scatter(ctx, 6, 1.4, a, 8, 0, 0.6);
    headCore(ctx, 0xffffff);
  } },
  nanoDeconTrail: { c: 0x7fe8ff, a: 0x39ffd0, draw: (ctx, c, a) => {
    // 崩解拖尾：球身后物质一路崩解成微粒
    const { pts, fade, now } = ctx;
    curve(ctx, 3, 9, 0.4, 0.1, 0x0e2a30);
    curve(ctx, 1.6, 5, 0.7, 0.2, c);
    for (let k = 1; k < pts.length; k += 1) { const t = k / (pts.length - 1); const p = pts[k]; for (let j = 0; j < 3; j++) { const ph = ((now / 400 + k * 0.2 + j / 3) % 1); g0(ctx, p.x + Math.sin(k * 3 + j) * (6 + ph * 8), p.y + Math.cos(k * 2 + j) * (4 + ph * 8), 1.4 * (1 - ph), j % 2 ? a : c, (1 - t) * (1 - ph) * 0.8 * fade); } }
    headCore(ctx, a);
  } },
  dataTrail: { c: 0x4affc4, a: 0x7fb8ff, draw: (ctx, c, a) => {
    // 数据拖尾：0/1 字符与数据块沿轨迹滚动
    const { g, pts, fade, now } = ctx;
    curve(ctx, 2, 7, 0.35, 0.1, c);
    alongPath(ctx, 2, 0, (x, y, tang, _f, i) => {
      g.save(); g.translateCanvas(x, y); g.rotateCanvas(tang);
      g.fillStyle(i % 2 ? c : a, 0.8 * fade);
      g.fillRect(-2, -3, 4, 6);
      g.fillStyle(a, 0.7 * fade); g.fillRect(-2 + (i % 4), -3, 1.4, 6);
      g.restore();
    });
    for (let k = 0; k < 7; k++) { const ph = ((now / 500 + k / 7) % 1); const i = Math.floor(ph * (pts.length - 1)); g.fillStyle(k % 2 ? a : 0xffffff, (1 - ph) * 0.8 * fade); g.fillCircle(pts[i].x, pts[i].y - 4 - ph * 10, 1.4); }
    headCore(ctx, a);
  } },
  dataGlitchTrail: { c: 0x7fb8ff, a: 0x4affc4, draw: (ctx, c, _a) => {
    // 故障拖尾：轨迹沿路错位/丢帧、RGB 色差分离
    const { g, pts, fade, now } = ctx;
    for (const [off, col] of [[-3, 0xff3a5a], [3, 0x3a9fff], [0, 0xffffff]] as Array<[number, number]>) { for (let k = 1; k < pts.length; k++) { if (k % 3 === 0 && (now / 120 + k) % 3 < 1) continue; g.lineStyle(2.4, col, (0.4 + 0.4 * (k / pts.length)) * fade); g.lineBetween(pts[k - 1].x + off, pts[k - 1].y, pts[k].x + off, pts[k].y); } }
    for (let k = 0; k < 6; k++) { const i = Math.floor(((k + 0.3) / 6) * (pts.length - 1)); const p = pts[i]; g.fillStyle(k % 2 ? c : 0xff3a5a, 0.7 * fade); g.fillRect(p.x + Math.sin(now / 200 + k) * 6, p.y - 4, 8, 3); }
    headCore(ctx, 0xffffff);
  } },
  warpTrail: { c: 0x9fd8ff, a: 0xa98cff, draw: (ctx, c, a) => {
    // 星轨拖尾：一路拉伸的蓝色星轨线
    const { g, pts, fade } = ctx;
    curve(ctx, 2, 6, 0.3, 0.1, c);
    for (let k = 1; k < pts.length; k++) { const t = k / (pts.length - 1); g.fillStyle(k % 2 ? a : 0xffffff, 0.7 * t * fade); g.fillRect(pts[k].x - 6 * t, pts[k].y - 1, 12 * t, 2); }
    scatter(ctx, 8, 1.3, a, 6, 0, 0.7);
    headCore(ctx, 0xffffff);
  } },
  warpStreakTrail: { c: 0xa98cff, a: 0x9fd8ff, draw: (ctx, _c, a) => {
    // 光速拖尾：星光被拉成条带、频闪
    const { g, pts, fade, now } = ctx;
    const flick = Math.sin(now / 60) > 0 ? 1 : 0.5;
    for (let k = 1; k < pts.length; k++) { const t = k / (pts.length - 1); g.lineStyle(3 + t * 4, k % 2 ? a : 0xffffff, 0.4 * t * fade * flick); g.lineBetween(pts[k - 1].x, pts[k - 1].y, pts[k].x, pts[k].y); }
    for (let k = 0; k < 10; k++) { const i = Math.floor(((k + 0.2) / 10) * (pts.length - 1)); const t = k / 10; g.fillStyle(0xffffff, 0.6 * t * fade); g.fillRect(pts[i].x - 10 * t, pts[i].y - 0.8, 20 * t, 1.6); }
    headCore(ctx, a);
  } },
  marsDustTrail: { c: 0xc0462a, a: 0xff7a4a, draw: (ctx, c, a) => {
    // 红土拖尾：一路红土尘
    const { pts, fade, now } = ctx;
    curve(ctx, 2.4, 9, 0.35, 0.1, 0x5a2418);
    curve(ctx, 1.4, 5, 0.6, 0.2, c);
    for (let k = 0; k < 13; k++) { const i = Math.floor(((k + 0.2) / 13) * (pts.length - 1)); const t = k / 13; puffAt(ctx, pts[i].x + Math.sin(now / 500 + k) * 7, pts[i].y + Math.cos(now / 600 + k) * 4, 2.6 + t * 6, c, (0.28 - t * 0.14) * fade); }
    scatter(ctx, 8, 1.5, a, 9, 0, 0.55);
    headCore(ctx, a);
  } },
  marsPlasmaTrail: { c: 0x7fb8ff, a: 0xff7a4a, draw: (ctx, c, a) => {
    // 等离子拖尾：蓝色等离子焰混红尘，焰舌跳动
    const { g, pts, fade, now } = ctx;
    curve(ctx, 3, 10, 0.5, 0.12, a);
    curve(ctx, 1.6, 5, 0.85, 0.3, c);
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => { const fl = Math.sin(now / 90 + i) * 4; g.fillStyle(f > 0.5 ? 0xffffff : c, (0.5 + f * 0.4) * fade); polyAt(ctx, x, y + fl * 0.3, 3 + f * 3, 3, now / 300 + i, f > 0.5 ? 0xffffff : c, 0.6); });
    for (let k = 0; k < 8; k++) { const ph = ((now / 500 + k / 8) % 1); const i = Math.floor(ph * (pts.length - 1)); g.fillStyle(k % 2 ? a : c, (1 - ph) * 0.8 * fade); g.fillCircle(pts[i].x + Math.sin(k * 2) * 6, pts[i].y - ph * 10, 1.6); }
    headCore(ctx, 0xffffff);
  } },
  forerTrail: { c: 0xa8e0ff, a: 0x5ad8ff, draw: (ctx, c, a) => {
    // 符文拖尾：一路悬浮的符文与光条
    const { g, fade, now } = ctx;
    curve(ctx, 2, 6, 0.3, 0.1, c);
    alongPath(ctx, 2, 0, (x, y, tang, f, i) => {
      g.save(); g.translateCanvas(x, y); g.rotateCanvas(tang);
      const on = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + i));
      g.fillStyle(a, on * (0.6 + f * 0.3) * fade);
      g.fillRect(-2, -4, 4, 8); g.fillRect(-5, -1.4, 10, 2.8);
      g.restore();
    });
    scatter(ctx, 6, 1.3, a, 7, 0, 0.6);
    headCore(ctx, 0xffffff);
  } },
  forerBeamTrail: { c: 0x5ad8ff, a: 0xa8e0ff, draw: (ctx, c, a) => {
    // 光碑拖尾：球身后留下一道合金光碑痕，符文滚动
    const { g, pts, fade, now } = ctx;
    curve(ctx, 3, 11, 0.4, 0.12, 0x1a2836);
    curve(ctx, 1.8, 6, 0.8, 0.25, c);
    const scroll = (now / 700) % 1;
    for (let k = 0; k < 6; k++) { const i = Math.floor(((k / 6 + scroll) % 1) * (pts.length - 1)); g.fillStyle(a, 0.6 * fade); g.fillRect(pts[i].x - 3, pts[i].y - 5, 6, 10); g.fillStyle(0x0e1620, 0.8); g.fillRect(pts[i].x - 2, pts[i].y - 3, 4, 6); }
    scatter(ctx, 7, 1.4, a, 8, 0, 0.6);
    headCore(ctx, a);
  } },
};

function g0(ctx: { g: import('phaser').GameObjects.Graphics; fade: number }, x: number, y: number, r: number, color: number, alpha: number): void {
  ctx.g.fillStyle(color, alpha);
  ctx.g.fillCircle(x, y, r);
}
