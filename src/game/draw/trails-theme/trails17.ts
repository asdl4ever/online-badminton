import { curve, scatter, puffAt, ringAt, boltLine, alongPath, headCore, polyAt, type TrailArt } from './shared';

/** 批十六拖尾（天竺神话 / 高天原 / 凯尔特 / 美索不达米亚 / 克苏鲁）——整条轨迹画成整体 */

export const TRAILS_17: Record<string, TrailArt> = {
  vdaGanga: { c: 0x7fd4ff, a: 0xdff0ff, draw: (ctx, c, a) => {
    // 恒河拖尾：一条流下的圣河水带 + 水花 + 下游泛金光
    const { g, pts, fade, now } = ctx;
    curve(ctx, 3, 11, 0.45, 0.12, c);
    curve(ctx, 1.6, 5, 0.85, 0.3, a);
    for (let k = 0; k < pts.length - 1; k += 1) {
      const p0 = pts[k], p1 = pts[k + 1];
      const off = Math.sin(k * 0.9 + now / 260) * 2.4;
      g.lineStyle(1.4 * fade, a, 0.5 * fade);
      g.beginPath(); g.moveTo(p0.x + off, p0.y); g.lineTo(p1.x - off, p1.y); g.strokePath();
    }
    for (let k = 0; k < 6; k++) { const ph = ((now / 500 + k / 6) % 1); const i = Math.floor(ph * (pts.length - 1)); g.fillStyle(a, (1 - ph) * 0.8 * fade); g.fillCircle(pts[i].x, pts[i].y - ph * 8, 1.6 * (1 - ph) + 0.4); }
    headCore(ctx, 0xffffff);
  } },
  vdaEmber: { c: 0xff7a2a, a: 0xffd45c, draw: (ctx, c, a) => {
    // 祭火拖尾：一路祭祀圣火，火舌跳动 + 飘火星
    const { g, pts, fade, now } = ctx;
    for (let k = 0; k < pts.length - 1; k++) {
      const p0 = pts[k], p1 = pts[k + 1];
      const age = k / (pts.length - 1);
      g.lineStyle((3 + age * 9) * fade, 0x8a2a0a, (0.5 - age * 0.2) * fade);
      g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.strokePath();
      g.lineStyle((2 + age * 5) * fade, c, (0.75 - age * 0.3) * fade);
      g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.strokePath();
    }
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => {
      const flick = Math.sin(now / 90 + i) * 3;
      g.fillStyle(f > 0.5 ? a : c, 0.7 * fade);
      polyAt(ctx, x, y + flick * 0.3, 3 + f * 3, 3, now / 300 + i, f > 0.5 ? a : c, 0.6);
    });
    for (let k = 0; k < 7; k++) { const ph = ((now / 500 + k / 7) % 1); const i = Math.floor(ph * (pts.length - 1)); g.fillStyle(k % 2 ? a : c, (1 - ph) * 0.9 * fade); g.fillCircle(pts[i].x + Math.sin(k * 2) * 5, pts[i].y - ph * 12, 1.6 * (1 - ph) + 0.4); }
    headCore(ctx, a);
  } },
  takKamikaze: { c: 0xbfe8ff, a: 0xffd45c, draw: (ctx, c, a) => {
    // 神风拖尾：一路旋风气流 + 卷起的落叶
    const { g, pts, fade, now } = ctx;
    curve(ctx, 2, 8, 0.3, 0.08, c);
    for (let k = 1; k < pts.length; k++) {
      const p = pts[k];
      for (let r = 0; r < 2; r++) {
        const ph = now / 200 + k * 0.5 + r * Math.PI;
        g.lineStyle(1.2 * fade, c, 0.35 * fade);
        g.lineBetween(p.x + Math.cos(ph) * 8, p.y + Math.sin(ph) * 6, p.x + Math.cos(ph + 1) * 10, p.y + Math.sin(ph + 1) * 8);
      }
    }
    alongPath(ctx, 3, 0, (x, y, tang, f, i) => {
      g.save(); g.translateCanvas(x, y); g.rotateCanvas(tang + now / 300 + i);
      g.fillStyle(i % 2 ? a : 0xffb347, 0.7 * fade);
      g.fillPoints([{ x: -3, y: 0 }, { x: 0, y: -2 }, { x: 3, y: 0 }, { x: 0, y: 2 }] as never, true);
      g.restore();
      void f;
    });
    headCore(ctx, 0xffffff);
  } },
  takRaiko: { c: 0x7fd4ff, a: 0xffe15c, draw: (ctx, c, a) => {
    // 雷光拖尾：一条折线电弧沿轨迹窜 + 分叉
    const { fade } = ctx;
    boltLine(ctx, 10, 6, 3.4, a, 0.9);
    boltLine(ctx, 8, 4, 1.4, 0xffffff, 0.9);
    curve(ctx, 1.6, 4, 0.3, 0.1, c);
    scatter(ctx, 8, 1.6, a, 7, 0, 0.7 * fade);
    headCore(ctx, 0xffffff);
  } },
  celtMist: { c: 0x9fd8c8, a: 0xb8e8d0, draw: (ctx, _c, a) => {
    // 迷雾拖尾：一路灰绿雾气 + 飘落孢子
    const { pts, fade, now } = ctx;
    for (let k = 0; k < 12; k++) { const i = Math.floor(((k + 0.2) / 12) * (pts.length - 1)); const t = k / 12; puffAt(ctx, pts[i].x + Math.sin(now / 700 + k) * 6, pts[i].y + Math.cos(now / 800 + k) * 4, 3 + t * 8, 0xbfe8d8, (0.32 - t * 0.16) * fade); }
    scatter(ctx, 7, 1.4, a, 8, 0, 0.6 * fade);
    headCore(ctx, 0xffffff);
  } },
  celtLeaf: { c: 0x8fd45a, a: 0xfff6d8, draw: (ctx, c, a) => {
    // 槲叶拖尾：一路飘落的槲寄生叶 + 白果
    const { g, fade, now } = ctx;
    curve(ctx, 2, 7, 0.3, 0.1, c);
    alongPath(ctx, 2, 0, (x, y, tang, f, i) => {
      g.save(); g.translateCanvas(x, y); g.rotateCanvas(tang + now / 400 + i * 0.7);
      g.fillStyle(i % 2 ? c : 0x3f9a5a, 0.8 * fade);
      g.fillPoints([{ x: 0, y: -4 }, { x: 2.6, y: 0 }, { x: 0, y: 4 }, { x: -2.6, y: 0 }] as never, true);
      g.fillStyle(a, 0.9 * fade); g.fillCircle(0, 0, 1.2);
      g.restore();
      void f;
    });
    headCore(ctx, a);
  } },
  mesoDust: { c: 0xd8b45a, a: 0x8a6a2a, draw: (ctx, c, a) => {
    // 沙尘拖尾：一路黄沙扬尘 + 飞旋沙粒
    const { pts, fade, now } = ctx;
    curve(ctx, 2.4, 10, 0.3, 0.08, c);
    for (let k = 0; k < 14; k++) { const i = Math.floor(((k + 0.2) / 14) * (pts.length - 1)); const t = k / 14; puffAt(ctx, pts[i].x + Math.sin(now / 500 + k) * 7, pts[i].y + Math.cos(now / 600 + k) * 4, 2.6 + t * 7, c, (0.28 - t * 0.14) * fade); }
    scatter(ctx, 10, 1.6, a, 9, 0, 0.6 * fade);
    headCore(ctx, 0xffe8b0);
  } },
  mesoLapis: { c: 0x5a8aff, a: 0xffd45c, draw: (ctx, c, a) => {
    // 青金拖尾：蓝金双色流光 + 楔文方块
    const { g, pts, fade, now } = ctx;
    curve(ctx, 2.4, 9, 0.4, 0.14, c);
    g.lineStyle(1.6 * fade, a, 0.7 * fade);
    g.beginPath();
    for (let i = 0; i < pts.length; i++) { const off = Math.sin(now / 300 + i * 0.4) * 2; if (i === 0) g.moveTo(pts[i].x, pts[i].y + off); else g.lineTo(pts[i].x, pts[i].y + off); }
    g.strokePath();
    for (let k = 0; k < 7; k++) {
      const ph = ((now / 500 + k / 7) % 1); const i = Math.floor(ph * (pts.length - 1)); const s = 2 + (k % 3) * 1.4;
      g.fillStyle(k % 2 ? a : c, 0.7 * fade);
      g.fillTriangle(pts[i].x - s, pts[i].y + 1, pts[i].x + s, pts[i].y + 1, pts[i].x, pts[i].y - s);
    }
    headCore(ctx, 0xffffff);
  } },
  cthSlime: { c: 0x1e5a4a, a: 0x5fe8c8, draw: (ctx, c, a) => {
    // 黏液拖尾：一路粘稠黏液 + 气泡 + 拉丝
    const { pts, fade, now } = ctx;
    for (let k = 0; k < 13; k++) { const i = Math.floor(((k + 0.2) / 13) * (pts.length - 1)); const t = k / 13; puffAt(ctx, pts[i].x + Math.sin(now / 600 + k) * 4, pts[i].y + Math.cos(now / 700 + k) * 3, 3 + t * 8, c, (0.45 - t * 0.22) * fade); }
    for (let k = 0; k < 6; k++) { const ph = ((now / 900 + k / 6) % 1); const i = Math.floor(ph * (pts.length - 1)); ringAt(ctx, pts[i].x + Math.sin(k * 3) * 5, pts[i].y + Math.cos(k * 2) * 4, 1.6 + (1 - ph) * 2, 1.2, a, 0.5 * (1 - ph) * fade); }
    scatter(ctx, 6, 1.6, a, 7, 0, 0.6 * fade);
    headCore(ctx, a);
  } },
  cthVoidTrail: { c: 0x2a1a4a, a: 0x7a4aa8, draw: (ctx, _c, a) => {
    // 虚空拖尾：一路吞噬光线的虚空痕 + 边缘触须
    const { g, pts, fade, now } = ctx;
    for (let k = 0; k < pts.length - 1; k++) {
      const p0 = pts[k], p1 = pts[k + 1]; const age = k / (pts.length - 1);
      g.lineStyle((4 + age * 10) * fade, 0x05080f, (0.55 - age * 0.2) * fade);
      g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.strokePath();
      g.lineStyle((1.6 + age * 3) * fade, a, (0.6 - age * 0.2) * fade);
      g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.strokePath();
    }
    for (let k = 1; k < pts.length; k += 2) {
      const p = pts[k]; const sw = Math.sin(now / 300 + k) * 8;
      g.lineStyle(1.4 * fade, a, 0.5 * fade);
      g.lineBetween(p.x, p.y, p.x + sw, p.y - 8);
    }
    for (let k = 0; k < 6; k++) { const ph = ((now / 700 + k / 6) % 1); const i = Math.floor(ph * (pts.length - 1)); g.fillStyle(a, (1 - ph) * 0.8 * fade); g.fillCircle(pts[i].x + Math.sin(k * 2) * 6, pts[i].y - 3, 1.4); }
    headCore(ctx, 0xffffff);
  } },
};
