import { curve, scatter, puffAt, ringAt, alongPath, headCore, polyAt, type TrailArt } from './shared';

/** 第六批击球拖尾（斯拉夫 / 波斯 / 印加 / 波利尼西亚 / 澳洲梦幻时代）——整条轨迹画成整体 */

export const TRAILS_18: Record<string, TrailArt> = {
  slavEmberTrail: { c: 0xff6a2a, a: 0xffb03a, draw: (ctx, c, a) => {
    // 林火拖尾：阴燃炭火痕 + 沿路炭火星 + 末端余烬核
    const { g, pts, fade, now } = ctx;
    curve(ctx, 3, 10, 0.5, 0.14, 0x3a0d08);
    curve(ctx, 1.6, 5, 0.8, 0.28, c);
    for (let k = 0; k < 8; k++) { const ph = ((now / 700 + k / 8) % 1); const i = Math.floor(ph * (pts.length - 1)); g.fillStyle(k % 2 ? a : c, (1 - ph) * 0.8 * fade); g.fillCircle(pts[i].x + Math.sin(k * 2.3) * 6, pts[i].y - ph * 8, 1.6 * (1 - ph) + 0.4); }
    alongPath(ctx, 3, 0, (x, y, _t, f) => { g.fillStyle(f > 0.6 ? a : 0x8a2a0a, (0.5 + f * 0.4) * fade); polyAt(ctx, x, y, 2 + f * 2, 4, now / 300, f > 0.6 ? a : 0x8a2a0a, 0.6); });
    headCore(ctx, a);
  } },
  slavRavenTrail: { c: 0x3a3a4a, a: 0x1a1a24, draw: (ctx, c, a) => {
    // 渡鸦拖尾：沿轨迹逐段显形的渡鸦群 + 黑羽碎屑，末端聚展翅大鸦
    const { g, pts, fade, now } = ctx;
    curve(ctx, 2, 6, 0.25, 0.08, c);
    alongPath(ctx, 3, 2, (x, y, tang, f, i) => {
      const flap = Math.sin(now / 150 + i) * 3;
      g.save(); g.translateCanvas(x, y); g.rotateCanvas(tang);
      g.fillStyle(a, (0.5 + f * 0.4) * fade);
      g.fillEllipse(0, 0, 8, 3);
      g.fillPoints([{ x: -2, y: -1 }, { x: -2, y: -5 - flap }, { x: 3, y: -2 }] as never, true);
      g.fillPoints([{ x: -2, y: 1 }, { x: -2, y: 5 + flap }, { x: 3, y: 2 }] as never, true);
      g.restore();
      scatter(ctx, 1, 1.2, 0x1a1a24, 3, 0, 0.5);
    });
    const head = pts[pts.length - 1];
    g.fillStyle(a, 0.9 * fade);
    g.fillEllipse(head.x, head.y, 14, 6);
    for (const s of [-1, 1]) g.fillPoints([{ x: head.x - 3, y: head.y }, { x: head.x - 12, y: head.y + s * 12 - Math.sin(now / 150) * 3 }, { x: head.x + 4, y: head.y + s * 4 }] as never, true);
    headCore(ctx, 0x8a8aa0);
  } },
  persEmberTrail: { c: 0xffb03a, a: 0xffd45c, draw: (ctx, c, a) => {
    // 圣火拖尾：金色圣火痕 + 成串上升火星 + 末端亮核
    const { g, pts, fade, now } = ctx;
    curve(ctx, 3, 11, 0.45, 0.12, 0x8a3a10);
    curve(ctx, 1.6, 5, 0.85, 0.3, c);
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => { const fl = Math.sin(now / 120 + i) * 3; g.fillStyle(f > 0.5 ? a : c, 0.7 * fade); polyAt(ctx, x, y + fl * 0.2, 3 + f * 3, 3, now / 300 + i, f > 0.5 ? a : c, 0.6); });
    for (let k = 0; k < 8; k++) { const ph = ((now / 600 + k / 8) % 1); const i = Math.floor(ph * (pts.length - 1)); g.fillStyle(k % 2 ? a : c, (1 - ph) * 0.9 * fade); g.fillCircle(pts[i].x + Math.sin(k * 2) * 5, pts[i].y - ph * 14, 1.6 * (1 - ph) + 0.4); }
    headCore(ctx, a);
  } },
  persFeatherTrail: { c: 0xffd45c, a: 0xfff0b0, draw: (ctx, c, a) => {
    // 光羽拖尾：沿轨迹逐片铺开的发光羽片 + 金粉，末端光核
    const { g, fade, now } = ctx;
    curve(ctx, 2, 7, 0.3, 0.1, c);
    alongPath(ctx, 2, 0, (x, y, tang, f, i) => {
      g.save(); g.translateCanvas(x, y); g.rotateCanvas(tang + Math.PI / 2 + Math.sin(now / 400 + i) * 0.4);
      g.fillStyle(i % 2 ? c : a, (0.6 + f * 0.3) * fade);
      g.fillPoints([{ x: 0, y: -7 }, { x: 2, y: 0 }, { x: 0, y: 7 }, { x: -2, y: 0 }] as never, true);
      g.restore();
    });
    scatter(ctx, 8, 1.4, a, 8, 0, 0.7);
    headCore(ctx, a);
  } },
  incaGoldTrail: { c: 0xffd45c, a: 0xfff0b0, draw: (ctx, c, a) => {
    // 金沙拖尾：金色沙尘痕 + 成片金屑 + 末端亮核
    const { pts, fade, now } = ctx;
    curve(ctx, 2.4, 9, 0.35, 0.1, c);
    for (let k = 0; k < 14; k++) { const i = Math.floor(((k + 0.2) / 14) * (pts.length - 1)); const t = k / 14; puffAt(ctx, pts[i].x + Math.sin(now / 500 + k) * 6, pts[i].y + Math.cos(now / 600 + k) * 4, 2.4 + t * 6, c, (0.26 - t * 0.13) * fade); }
    scatter(ctx, 10, 1.5, a, 9, 0, 0.6);
    headCore(ctx, 0xffffff);
  } },
  incaCondorTrail: { c: 0x2a2a34, a: 0xffd45c, draw: (ctx, c, a) => {
    // 神鹰羽拖尾：沿轨迹铺开的黑金鹰羽（错相翻飞）+ 金屑，末端神鹰剪影
    const { g, pts, fade, now } = ctx;
    curve(ctx, 2, 7, 0.25, 0.08, c);
    alongPath(ctx, 2, 3, (x, y, tang, f, i) => {
      const flip = Math.sin(now / 300 + i) * 1.2;
      g.save(); g.translateCanvas(x, y); g.rotateCanvas(tang + flip);
      g.fillStyle(i % 2 ? c : 0x14141c, (0.6 + f * 0.3) * fade);
      g.fillPoints([{ x: 0, y: -8 }, { x: 2.4, y: 0 }, { x: 0, y: 8 }, { x: -2.4, y: 0 }] as never, true);
      g.fillStyle(a, 0.5 * fade); g.fillCircle(0, 0, 1.2);
      g.restore();
    });
    scatter(ctx, 6, 1.3, a, 7, 0, 0.6);
    const head = pts[pts.length - 1];
    g.fillStyle(0x14141c, 0.9 * fade); g.fillEllipse(head.x, head.y, 14, 5);
    for (const s of [-1, 1]) g.fillPoints([{ x: head.x - 2, y: head.y }, { x: head.x - 12, y: head.y + s * 11 }, { x: head.x + 5, y: head.y + s * 3 }] as never, true);
    headCore(ctx, a);
  } },
  polyFoamTrail: { c: 0xdff6ff, a: 0x5fe8d0, draw: (ctx, c, a) => {
    // 浪沫拖尾：白浪沫痕 + 成串泡沫 + 末端浪花核
    const { pts, fade, now } = ctx;
    for (let k = 0; k < 12; k++) { const i = Math.floor(((k + 0.2) / 12) * (pts.length - 1)); const t = k / 12; puffAt(ctx, pts[i].x + Math.sin(now / 600 + k) * 5, pts[i].y + Math.cos(now / 700 + k) * 3, 3 + t * 7, c, (0.4 - t * 0.2) * fade); }
    for (let k = 0; k < 7; k++) { const ph = ((now / 900 + k / 7) % 1); const i = Math.floor(ph * (pts.length - 1)); ringAt(ctx, pts[i].x + Math.sin(k * 3) * 5, pts[i].y + Math.cos(k * 2) * 4, 1.6 + (1 - ph) * 2.4, 1.2, a, 0.55 * (1 - ph) * fade); }
    headCore(ctx, 0xffffff);
  } },
  polyFireKnifeTrail: { c: 0xff7a2a, a: 0xffd45c, draw: (ctx, c, a) => {
    // 火刀拖尾：连成一把燃烧刀痕——亮橙主体 + 沿边火星 + 末端刀尖火核
    const { g, pts, fade, now } = ctx;
    curve(ctx, 3, 13, 0.5, 0.2, c);
    curve(ctx, 1.4, 6, 0.85, 0.4, a);
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => { const fl = Math.sin(now / 90 + i) * 3; g.fillStyle(a, (0.5 + f * 0.4) * fade); polyAt(ctx, x, y + fl * 0.3, 2.6 + f * 3, 3, now / 300 + i, a, 0.6); });
    for (let k = 0; k < 9; k++) { const ph = ((now / 500 + k / 9) % 1); const i = Math.floor(ph * (pts.length - 1)); g.fillStyle(k % 2 ? a : c, (1 - ph) * 0.9 * fade); g.fillCircle(pts[i].x + Math.sin(k * 2.7) * 7, pts[i].y - ph * 6, 1.6 * (1 - ph) + 0.4); }
    const head = pts[pts.length - 1];
    g.fillStyle(0xff5a2a, 0.9 * fade); g.fillPoints([{ x: head.x - 3, y: head.y - 4 }, { x: head.x + 8, y: head.y }, { x: head.x - 3, y: head.y + 4 }] as never, true);
    headCore(ctx, 0xffffff);
  } },
  auzOchreTrail: { c: 0xc0703a, a: 0xffd45c, draw: (ctx, c, a) => {
    // 赭石拖尾：红土尘痕 + 成片土尘点 + 末端亮核
    const { pts, fade, now } = ctx;
    curve(ctx, 2.4, 10, 0.35, 0.1, 0x8a4426);
    curve(ctx, 1.4, 5, 0.6, 0.2, c);
    for (let k = 0; k < 13; k++) { const i = Math.floor(((k + 0.2) / 13) * (pts.length - 1)); const t = k / 13; puffAt(ctx, pts[i].x + Math.sin(now / 500 + k) * 7, pts[i].y + Math.cos(now / 600 + k) * 4, 2.4 + t * 6, c, (0.28 - t * 0.14) * fade); }
    scatter(ctx, 9, 1.5, a, 9, 0, 0.55);
    headCore(ctx, a);
  } },
  auzRainbowTrail: { c: 0xff6a8a, a: 0xffd45c, draw: (ctx, _c, a) => {
    // 虹彩拖尾：七彩鳞带——颜色沿轨迹渐变滚动 + 沿边彩点 + 末端鳞核
    const { g, fade, now } = ctx;
    const cols = [0xff5a5a, 0xff9a3c, 0xffd45c, 0x8fd45a, 0x5fd0ff, 0x7a6aff, 0x8fd45a];
    const off = Math.floor(now / 200) % 7;
    for (let b = 0; b < 5; b++) { const col = cols[(b + off) % 7]; curve(ctx, 1.2, 3, 0.5 - b * 0.08, 0.08, col); }
    alongPath(ctx, 2, 0, (x, y, tang, f, i) => {
      const col = cols[(i + off) % 7];
      g.save(); g.translateCanvas(x, y); g.rotateCanvas(tang);
      g.fillStyle(col, (0.6 + f * 0.35) * fade);
      g.fillEllipse(0, 0, 5, 3);
      g.restore();
    });
    scatter(ctx, 8, 1.4, a, 8, 0, 0.6);
    headCore(ctx, 0xffffff);
  } },
};
