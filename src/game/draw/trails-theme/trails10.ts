import { TAU, curve, ribbon, type TrailArt } from './shared';

/** 批九主题拖尾（童话王国 / 深夜食堂 / 猫咖物语）。ctx: g/pts/fade/now，pts[0] 最旧、末位是球头。 */
export const TRAILS_10: Record<string, TrailArt> = {
  taleTrailA: { c: 0xffd45c, a: 0x9b5cff, draw: (ctx, c, a) => {
    // 星星拖尾：一串小星星——五角星带 + 拖尾光 + 闪光尘
    const { g, pts, fade, now } = ctx;
    ribbon(ctx, 7, 1, now / 400, 5, c, 0.3 * fade);
    curve(ctx, 3, 1, 0.3, 0.8, 0xfff0b0);
    for (let k = 0; k < 5; k++) { // 五角星（旋转的小星）
      const i = Math.floor(((k + 0.4) / 5) * (pts.length - 1));
      const p = pts[i];
      g.save();
      g.translateCanvas(p.x + Math.sin(k * 2.2) * 5, p.y + Math.cos(k * 2) * 4);
      g.rotateCanvas(now / 400 + k);
      const r = 3 + (k % 2);
      g.fillStyle(k % 2 ? a : c, 0.9 * fade);
      g.fillPoints((() => {
        const vs = [];
        for (let s = 0; s < 10; s++) {
          const ang = (s / 10) * TAU - Math.PI / 2;
          const rr = s % 2 ? r * 0.45 : r;
          vs.push({ x: Math.cos(ang) * rr, y: Math.sin(ang) * rr });
        }
        return vs;
      })() as never, true);
      g.restore();
    }
    for (let k = 0; k < 6; k++) { // 闪光尘
      const i = Math.floor(((k + 0.25) / 6) * (pts.length - 1));
      const p = pts[i];
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 230 + k * 1.8));
      g.fillStyle(0xffffff, tw * fade);
      g.fillRect(p.x - 2, p.y - 0.5, 4, 1); g.fillRect(p.x - 0.5, p.y - 2, 1, 4);
    }
    const head = pts[pts.length - 1];
    g.fillStyle(0xffffff, fade);
    g.fillCircle(head.x, head.y, 2.2);
    g.fillStyle(a, 0.4 * fade);
    g.fillCircle(head.x, head.y, 4.6);
  } },
  taleTrailB: { c: 0xff9adf, a: 0x5ac8ff, draw: (ctx, _c, _a) => {
    // 彩虹拖尾：七色彩虹桥——七条平行色带 + 虹端云朵 + 闪粉
    const { g, pts, fade, now } = ctx;
    const cols = [0xff5a5c, 0xff9a3c, 0xffd45c, 0x7dffc4, 0x5ac8ff, 0x9b5cff, 0xff9adf];
    for (let k = 0; k < 7; k++) {
      g.lineStyle(2, cols[k], 0.55 * fade);
      g.beginPath();
      for (let s = 0; s < pts.length; s++) {
        const p = pts[s];
        if (s === 0) g.moveTo(p.x, p.y - 7 + k * 2.4);
        else g.lineTo(p.x, p.y - 7 + k * 2.4 + Math.sin(s * 0.5 + now / 300 + k) * 0.8);
      }
      g.strokePath();
    }
    for (let k = 0; k < 2; k++) { // 虹端云朵
      const i = k ? pts.length - 1 : 0;
      const p = pts[i];
      g.fillStyle(0xffffff, 0.75 * fade);
      g.fillCircle(p.x - 3, p.y - 6, 4.4);
      g.fillCircle(p.x + 3, p.y - 5, 3.4);
      g.fillCircle(p.x, p.y - 3, 4);
    }
    for (let k = 0; k < 5; k++) { // 闪粉
      const i = Math.floor(((k + 0.3) / 5) * (pts.length - 1));
      const p = pts[i];
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 200 + k * 1.6));
      g.fillStyle(0xffffff, tw * fade);
      g.fillCircle(p.x + Math.sin(k * 2.4) * 6, p.y + 6 + Math.cos(k * 2) * 3, 1.1);
    }
  } },
  dinTrailA: { c: 0xffe0b0, a: 0xff9a3c, draw: (ctx, c, a) => {
    // 热汤拖尾：泼洒的热汤——汤带 + 汤滴溅 + 葱花 + 蒸汽
    const { g, pts, fade, now } = ctx;
    ribbon(ctx, 10, 1.4, now / 320, 6, c, 0.45 * fade);
    curve(ctx, 6, 1.4, 0.2, 0.6, 0xd88a3a);
    for (let k = 0; k < 5; k++) { // 汤滴溅（抛物线汤滴）
      const i = Math.floor(((k + 0.3) / 5) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 400 + k / 5) % 1;
      g.fillStyle(k % 2 ? a : 0xd88a3a, 0.8 * (1 - ph) * fade);
      g.fillCircle(p.x + Math.sin(k * 2.4) * 5, p.y - Math.sin(ph * Math.PI) * 10, 1.6 * (1 - ph) + 0.5);
    }
    for (let k = 0; k < 5; k++) { // 葱花
      const i = Math.floor(((k + 0.4) / 5) * (pts.length - 1));
      const p = pts[i];
      g.fillStyle(0x7dffc4, 0.85 * fade);
      g.fillRect(p.x - 1, p.y - 0.6, 2, 1.2);
    }
    for (let k = 0; k < 3; k++) { // 蒸汽
      const i = Math.floor(((k + 0.5) / 3) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 900 + k / 3) % 1;
      g.fillStyle(0xf0ead8, 0.3 * Math.sin(ph * Math.PI) * fade);
      g.fillCircle(p.x + Math.sin(ph * 4 + k) * 4, p.y - ph * 14, 2 + ph * 4);
    }
    const head = pts[pts.length - 1];
    g.fillStyle(0xffe0b0, fade);
    g.fillCircle(head.x, head.y, 2.4);
    g.fillStyle(0xffffff, 0.5 * fade);
    g.fillCircle(head.x, head.y, 1);
  } },
  dinTrailB: { c: 0xff9a3c, a: 0xfff0d8, draw: (ctx, c, a) => {
    // 香气拖尾：飘散的香气线——香气波带 + 袅袅香线 + 香气符号
    const { g, pts, fade, now } = ctx;
    ribbon(ctx, 8, 1.6, now / 520, 7, c, 0.2 * fade);
    for (let k = 0; k < 4; k++) { // 袅袅香线（三条错相波浪上升线）
      const i0 = Math.floor(((k + 0.3) / 4) * (pts.length - 1));
      g.lineStyle(1.4, k % 2 ? a : c, 0.5 * fade);
      g.beginPath();
      const p0 = pts[i0];
      g.moveTo(p0.x, p0.y);
      for (let s = 1; s <= 6; s++) {
        g.lineTo(p0.x + Math.sin(s * 1.4 + now / 280 + k * 2) * 4, p0.y - s * 5);
      }
      g.strokePath();
    }
    for (let k = 0; k < 4; k++) { // 香气符号（飘散的小圆圈）
      const i = Math.floor(((k + 0.4) / 4) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 1000 + k / 4) % 1;
      g.lineStyle(1.2, a, 0.5 * (1 - ph) * fade);
      g.strokeCircle(p.x + Math.sin(ph * 4 + k) * 5, p.y - ph * 16, 1.6 + ph * 2.4);
    }
    const head = pts[pts.length - 1];
    g.fillStyle(0xfff0d8, fade);
    g.fillCircle(head.x, head.y, 2);
    g.fillStyle(c, 0.3 * fade);
    g.fillCircle(head.x, head.y, 4.2);
  } },
  catTrailA: { c: 0xffb0c8, a: 0xffd8a8, draw: (ctx, c, a) => {
    // 猫爪印拖尾：一串猫爪印——爪印带 + 交替爪 + 蹦跳弧 + 肉球闪
    const { g, pts, fade, now } = ctx;
    curve(ctx, 1.6, 0.8, 0.15, 0.4, c);
    for (let k = 0; k < 7; k++) { // 交替猫爪印（左右爪交错 + 渐隐）
      const i = Math.floor(((k + 0.35) / 7) * (pts.length - 1));
      const p = pts[i];
      const side = k % 2 ? 1 : -1;
      const px = p.x + side * 4, py = p.y + (k % 2) * 3;
      g.fillStyle(k % 2 ? a : c, 0.8 * fade);
      g.fillEllipse(px, py, 3.4, 2.4);
      for (let s = 0; s < 3; s++) g.fillCircle(px - 2 + s * 2, py - 2.4, 0.8);
    }
    for (let k = 0; k < 3; k++) { // 蹦跳弧（爪印间的虚线跳跃弧）
      const i = Math.floor(((k + 0.5) / 3) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 800 + k / 3) % 1;
      g.lineStyle(1, a, 0.4 * Math.sin(ph * Math.PI) * fade);
      g.beginPath();
      g.arc(p.x, p.y + 4, 5 + ph * 3, Math.PI, Math.PI * 2);
      g.strokePath();
    }
    const head = pts[pts.length - 1];
    g.fillStyle(a, fade); // 球头大肉球
    g.fillEllipse(head.x, head.y, 4.4, 3);
    for (let s = 0; s < 3; s++) g.fillCircle(head.x - 2 + s * 2, head.y - 2.4, 1);
  } },
  catTrailB: { c: 0xffb070, a: 0xffd8a8, draw: (ctx, c, a) => {
    // 毛球拖尾：滚动的毛线球——毛球带 + 弹跳毛球 + 散落线头 + 绒毛
    const { g, pts, fade, now } = ctx;
    ribbon(ctx, 9, 1.4, now / 380, 6, c, 0.35 * fade);
    curve(ctx, 5, 1.2, 0.2, 0.55, 0xffb0c8);
    for (let k = 0; k < 4; k++) { // 弹跳毛球（大小不一的毛线球弹跳）
      const i = Math.floor(((k + 0.4) / 4) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 450 + k / 4) % 1;
      const r = 3.4 + (k % 2);
      g.fillStyle(k % 2 ? c : a, 0.9 * fade);
      g.fillCircle(p.x, p.y - Math.abs(Math.sin(ph * Math.PI)) * 8, r);
      g.lineStyle(0.8, 0x1a1410, 0.3 * fade);
      g.beginPath();
      g.arc(p.x, p.y - Math.abs(Math.sin(ph * Math.PI)) * 8, r - 1, now / 200 + k, now / 200 + k + 3.4);
      g.strokePath();
    }
    for (let k = 0; k < 5; k++) { // 散落线头
      const i = Math.floor(((k + 0.25) / 5) * (pts.length - 1));
      const p = pts[i];
      g.lineStyle(1, k % 2 ? a : 0xffb0c8, 0.6 * fade);
      g.beginPath();
      g.moveTo(p.x - 2, p.y);
      g.lineTo(p.x + Math.sin(now / 200 + k) * 3, p.y - 2);
      g.lineTo(p.x + 4, p.y + 1);
      g.strokePath();
    }
    for (let k = 0; k < 4; k++) { // 绒毛
      const i = Math.floor(((k + 0.5) / 4) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 1100 + k / 4) % 1;
      g.fillStyle(0xffffff, 0.5 * (1 - ph) * fade);
      g.fillCircle(p.x + Math.sin(ph * 4 + k) * 4, p.y - ph * 12, 1.2 * (1 - ph) + 0.4);
    }
    const head = pts[pts.length - 1];
    g.fillStyle(c, fade);
    g.fillCircle(head.x, head.y, 2.4);
  } },
};
