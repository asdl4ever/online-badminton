import { curve, scatter, puffAt, ringAt, starAt, alongPath, headCore, type TrailArt } from './shared';

/** 批十五拖尾（基多拉 / 魔斯拉 / 机甲战队 / 火山泰坦 / 深海巨妖）——整条轨迹画成整体 */

export const TRAILS_16: Record<string, TrailArt> = {
  ghidTrailA: { c: 0x7fd4ff, a: 0xffe15c, draw: (ctx, c, a) => {
    // 电弧拖尾：一条折线电弧沿轨迹窜，末端亮核
    const { g, pts, fade, now } = ctx;
    g.lineStyle(3 * fade, a, 0.5 * fade);
    g.beginPath();
    for (let i = 0; i < pts.length; i++) { const j = i % 2 ? Math.sin(now / 70 + i) * 4 : 0; if (i === 0) g.moveTo(pts[i].x, pts[i].y + j); else g.lineTo(pts[i].x, pts[i].y + j); }
    g.strokePath();
    g.lineStyle(1.4 * fade, 0xffffff, 0.8 * fade);
    g.beginPath();
    for (let i = 0; i < pts.length; i++) { const j = i % 2 ? Math.sin(now / 70 + i) * 4 : 0; if (i === 0) g.moveTo(pts[i].x, pts[i].y + j); else g.lineTo(pts[i].x, pts[i].y + j); }
    g.strokePath();
    for (let k = 0; k < 5; k++) { const ph = ((now / 400 + k / 5) % 1); const i = Math.floor(ph * (pts.length - 1)); g.fillStyle(c, (1 - ph) * 0.9 * fade); g.fillCircle(pts[i].x, pts[i].y, 1.6); }
    headCore(ctx, c);
  } },
  ghidTrailB: { c: 0xffe15c, a: 0x7fd4ff, draw: (ctx, c, a) => {
    // 雷暴拖尾：金色光带 + 翻滚乌云 + 分叉雷
    const { g, pts, fade, now } = ctx;
    curve(ctx, 2.6, 11, 0.4, 0.12, a);
    curve(ctx, 1.4, 5, 0.85, 0.35, c);
    for (let k = 0; k < 4; k++) { const i = Math.floor(((k + 0.5) / 4) * (pts.length - 1)); puffAt(ctx, pts[i].x, pts[i].y - 4, 7, 0x2a2a3a, 0.4 * fade); }
    g.lineStyle(2, 0xffffff, (0.5 + 0.5 * Math.sin(now / 120)) * fade);
    g.beginPath(); g.moveTo(pts[1].x, pts[1].y); g.lineTo(pts[Math.floor(pts.length / 2)].x, pts[Math.floor(pts.length / 2)].y - 8); g.lineTo(pts[pts.length - 2].x, pts[pts.length - 2].y); g.strokePath();
    headCore(ctx, 0xffe15c);
  } },
  mthrTrailA: { c: 0xffe66a, a: 0xbfe8ff, draw: (ctx, c, a) => {
    // 鳞粉拖尾：金色鳞粉沿轨迹飘散
    const { fade, now } = ctx;
    curve(ctx, 2.2, 8, 0.35, 0.1, c);
    alongPath(ctx, 1, 0, (x, y, _t, t, i) => {
      const ph = ((now / 600 + i * 0.2) % 1);
      starAt(ctx, x + Math.sin(i * 2) * 5, y + Math.cos(i * 1.7) * 4, 2 + t * 3, now / 400 + i, c, (0.4 + t * 0.5) * (1 - ph * 0.4) * fade);
    });
    scatter(ctx, 10, 1.6, a, 8, 0, 0.7);
    headCore(ctx, 0xffffff);
  } },
  mthrTrailB: { c: 0xbfe8ff, a: 0xffffff, draw: (ctx, c, a) => {
    // 银辉拖尾：银白光带 + 亮星
    const { fade, now } = ctx;
    curve(ctx, 2.8, 10, 0.4, 0.1, c);
    curve(ctx, 1.4, 4, 0.85, 0.35, a);
    alongPath(ctx, 2, 1, (x, y, _t, t, i) => { starAt(ctx, x, y, 3 + t * 3, now / 500 + i, 0xffffff, 0.7 * fade, 6); });
    headCore(ctx, c);
  } },
  tksTrailA: { c: 0x5ac8ff, a: 0xffffff, draw: (ctx, c, a) => {
    // 推进拖尾：喷口焰锥 + 马赫环 + 白热内芯
    const { g, pts, fade, now } = ctx;
    for (let k = 0; k < pts.length - 1; k++) { const p0 = pts[k], p1 = pts[k + 1]; const age = k / (pts.length - 1); g.lineStyle((3 + age * 10) * fade, c, (0.2 + age * 0.3) * fade); g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.strokePath(); }
    for (let k = 0; k < pts.length - 1; k++) { const p0 = pts[k], p1 = pts[k + 1]; g.lineStyle(2 * fade, 0xfff0b0, 0.75 * fade); g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.strokePath(); }
    const flow = (now / 260) % 1;
    for (let k = 0; k < 5; k++) { const t2 = (k + flow) / 5; const i = Math.min(pts.length - 1, Math.floor(t2 * (pts.length - 1))); const age = i / (pts.length - 1); g.fillStyle(k % 2 ? 0xffffff : a, 0.5 * fade); g.save(); g.translateCanvas(pts[i].x, pts[i].y); g.scaleCanvas(1, 0.6); g.beginPath(); g.arc(0, 0, (3 + age * 7) * fade, 0, Math.PI * 2); g.strokePath(); g.restore(); }
    headCore(ctx, 0xffffff);
  } },
  tksTrailB: { c: 0xff4a4a, a: 0x5ac8ff, draw: (ctx, c, a) => {
    // 能量拖尾：红蓝双色光带 + 数据方块
    const { g, pts, fade, now } = ctx;
    curve(ctx, 2.4, 9, 0.4, 0.15, c);
    g.lineStyle(1.6 * fade, a, 0.7 * fade);
    g.beginPath();
    for (let i = 0; i < pts.length; i++) { if (i === 0) g.moveTo(pts[i].x + 2, pts[i].y - 2); else g.lineTo(pts[i].x + 2, pts[i].y - 2); }
    g.strokePath();
    for (let k = 0; k < 7; k++) { const ph = ((now / 400 + k / 7) % 1); const i = Math.floor(ph * (pts.length - 1)); const s = 2 + (k % 3) * 1.4; g.fillStyle(c, 0.6 * fade); g.fillRect(pts[i].x - s / 2, pts[i].y - s / 2, s, s * 0.7); }
    headCore(ctx, a);
  } },
  titanTrailA: { c: 0xff6a2a, a: 0xffd45c, draw: (ctx, c, a) => {
    // 火雨拖尾：橙色光带 + 向后撒的火星雨
    const { g, pts, fade, now } = ctx;
    curve(ctx, 3, 12, 0.4, 0.12, c);
    curve(ctx, 1.4, 5, 0.8, 0.3, a);
    for (let k = 0; k < 10; k++) { const ph = ((now / 600 + k / 10) % 1); const i = Math.floor(ph * (pts.length - 1)); g.fillStyle(k % 2 ? a : c, (1 - ph) * 0.85 * fade); g.fillCircle(pts[i].x + Math.sin(k * 2) * 6, pts[i].y - ph * 12, 1.6 * (1 - ph) + 0.4); }
    headCore(ctx, a);
  } },
  titanTrailB: { c: 0xffd45c, a: 0xff3a1a, draw: (ctx, c, a) => {
    // 熔流拖尾：熔融铁水痕 + 滴落熔珠
    const { g, pts, fade, now } = ctx;
    for (let k = 0; k < pts.length - 1; k++) { const p0 = pts[k], p1 = pts[k + 1]; const age = k / (pts.length - 1); g.lineStyle((3 + age * 9) * fade, 0x3a2a22, (0.5 - age * 0.2) * fade); g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.strokePath(); g.lineStyle((2 + age * 5) * fade, a, (0.7 - age * 0.3) * fade); g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.strokePath(); }
    for (let k = 0; k < pts.length - 1; k += 2) { const p0 = pts[k], p1 = pts[k + 1]; g.lineStyle(1.6 * fade, c, 0.6 * fade); g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.strokePath(); }
    for (let k = 0; k < 5; k++) { const i = Math.floor(((k + 0.3) / 5) * (pts.length - 1)); const ph = ((now / 700 + k / 5) % 1); g.fillStyle(c, (1 - ph) * 0.9 * fade); g.fillEllipse(pts[i].x, pts[i].y + 4 + ph * 12, 2.6, 4.4); }
    headCore(ctx, c);
  } },
  leviTrailA: { c: 0x16303f, a: 0x5fe8d0, draw: (ctx, c, a) => {
    // 墨汁拖尾：翻涌的黑墨团 + 散开的墨点
    const { pts, fade, now } = ctx;
    for (let k = 0; k < 12; k++) { const i = Math.floor(((k + 0.2) / 12) * (pts.length - 1)); const t = k / 12; puffAt(ctx, pts[i].x + Math.sin(now / 500 + k) * 5, pts[i].y + Math.cos(now / 600 + k) * 3, 3 + t * 9, c, (0.4 - t * 0.2) * fade); }
    scatter(ctx, 8, 2, a, 8, 0, 0.6);
    headCore(ctx, a);
  } },
  leviTrailB: { c: 0x9b6aff, a: 0x5fe8d0, draw: (ctx, c, a) => {
    // 幽光拖尾：深紫光带 + 幽蓝气泡 + 游动光点
    const { pts, fade, now } = ctx;
    curve(ctx, 2.4, 9, 0.4, 0.15, c);
    for (let k = 0; k < 7; k++) { const t = ((k * 0.618) % 1 + now / 2000) % 1; const i = Math.floor(t * (pts.length - 1)); ringAt(ctx, pts[i].x + Math.sin(k * 3) * 6, pts[i].y + Math.cos(k * 2) * 4, 2 + t * 3, 1.2, a, 0.5 * (1 - t) * fade); }
    scatter(ctx, 8, 1.6, a, 7, 0, 0.7);
    headCore(ctx, 0xffffff);
  } },
};
