import { type WingArt } from './shared';

/**
 * 批十三背部装饰（尼斯湖水怪 / 熊出没 / 雪山谜踪）——**自由槽，全是背挂物件**（`single: true`）：
 * 潜水气瓶 / 渔获背篓 / 木柴背捆 / 蜂箱背包 / 登山背包 / 雪橇背板。
 * 不是翅膀——只画一次、不镜像，动效全在自己体内。挂肩高度 topY+48。
 */

export const WINGS_20: Record<string, WingArt> = {
  // ── 尼斯湖水怪 ──
  lochWingA: { c: 0x9fd8e8, a: 0x35d8a8, single: true, draw: (g, now, _flap, c, a) => {
    // 潜水气瓶：一只挂在背上的氧气瓶 + 阀头 + 冒的水泡
    g.fillStyle(0x2a4a58, 1); g.fillRoundedRect(-10, -18, 20, 36, 7);
    g.fillStyle(c, 1); g.fillRoundedRect(-9, -17, 18, 32, 6);
    g.fillStyle(0x8a94a2, 1); g.fillRoundedRect(-6, -24, 12, 7, 2); // 阀头
    g.fillStyle(a, 0.9); g.fillCircle(0, -23, 2.6);
    g.fillStyle(0xdff6ee, 0.5); g.fillRect(-9, -6, 18, 2);
    for (let k = 0; k < 4; k++) { const ph = ((now / 900 + k / 4) % 1); g.fillStyle(0xdff6ee, 0.6 * (1 - ph)); g.fillCircle(6 + k * 3, -26 - ph * 14, 1.6 * (1 - ph) + 0.5); }
    g.lineStyle(2.4, 0x2a4a58, 0.9); g.lineBetween(-8, -14, -14, -22); g.lineBetween(8, -14, 14, -22);
  } },
  lochWingB: { c: 0x8a6a3a, a: 0x8fe8c8, single: true, draw: (g, now, _flap, _c, _a) => {
    // 渔获背篓：竹编背篓 + 几条鱼尾翘出来 + 挂的水草
    g.fillStyle(0x6a4a2a, 1); g.fillPoints([{ x: -17, y: -4 }, { x: 17, y: -4 }, { x: 13, y: 18 }, { x: -13, y: 18 }] as never, true);
    g.fillStyle(0xa88a52, 0.95); g.fillPoints([{ x: -15, y: -2 }, { x: 15, y: -2 }, { x: 12, y: 16 }, { x: -12, y: 16 }] as never, true);
    g.lineStyle(1.2, 0x6a4a2a, 0.7); for (let k = -2; k <= 2; k++) g.lineBetween(k * 6, -4, k * 5, 18);
    g.lineBetween(-15, 0, 15, 0); g.lineBetween(-13, 8, 13, 8);
    for (let k = 0; k < 3; k++) { // 翘出的鱼尾
      const sw = Math.sin(now / 500 + k) * 3;
      g.fillStyle(k % 2 ? 0x6ab8c8 : 0x8ad0c0, 0.95);
      g.fillPoints([{ x: -10 + k * 9, y: -4 }, { x: -6 + k * 9, y: -20 }, { x: -1 + k * 9, y: -4 }] as never, true);
      g.fillStyle(0xdff6ee, 0.6); g.fillPoints([{ x: -9 + k * 9, y: -6 }, { x: -6 + k * 9, y: -17 + sw }, { x: -4 + k * 9, y: -6 }] as never, true);
    }
    g.fillStyle(0x8fe8c8, 0.9); g.fillRect(-12, 14, 24, 3); // 水草
  } },
  // ── 熊出没 ──
  boonWingA: { c: 0x8a6a42, a: 0xb8945a, single: true, draw: (g, _now, _flap, _c, a) => {
    // 木柴背捆：一捆圆木 + 两道捆绳
    for (let k = 0; k < 4; k++) { g.fillStyle(k % 2 ? 0x8a5a3a : 0x6a4a2a, 1); g.fillRoundedRect(-16, -14 + k * 8, 32, 7, 3); g.fillStyle(0xb8945a, 0.5); g.fillEllipse(k < 2 ? -16 : 16, -10.5 + k * 8, 5, 6); }
    g.lineStyle(3, a, 0.95); g.lineBetween(-6, -16, -6, 20); g.lineBetween(6, -16, 6, 20);
  } },
  boonWingB: { c: 0xd9a63c, a: 0x3a2a18, single: true, draw: (g, now, _flap, c, a) => {
    // 蜂箱背包：木蜂箱 + 出蜂口 + 绕飞的小蜜蜂
    g.fillStyle(0x6a4a2a, 1); g.fillRoundedRect(-15, -14, 30, 30, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(-14, -13, 28, 28, 3);
    g.fillStyle(0x8a5a1a, 0.8); for (let k = 0; k < 3; k++) g.fillRect(-14, -8 + k * 9, 28, 2);
    g.fillStyle(a, 1); g.fillRoundedRect(-5, 14, 10, 5, 2);
    for (let k = 0; k < 3; k++) { const ang = now / 500 + k * 2.1; const bx = Math.cos(ang) * 24, by = -4 + Math.sin(ang * 1.6) * 12; g.fillStyle(0xffd45c, 0.95); g.fillEllipse(bx, by, 5, 4); g.fillStyle(0x2a2418, 0.9); g.fillRect(bx - 1, by - 2, 2, 4); }
  } },
  // ── 雪山谜踪 ──
  bigfWingA: { c: 0x8a705a, a: 0xbfe8ff, single: true, draw: (g, _now, _flap, c, a) => {
    // 登山背包：厚背包 + 顶盖 + 侧袋 + 绑着的登山绳
    g.fillStyle(0x5a4634, 1); g.fillRoundedRect(-16, -16, 32, 34, 8);
    g.fillStyle(c, 1); g.fillRoundedRect(-15, -15, 30, 32, 7);
    g.fillStyle(0x6a5644, 1); g.fillRoundedRect(-15, -17, 30, 8, 4); // 顶盖
    g.fillStyle(0x5a4634, 1); g.fillRoundedRect(-19, -6, 6, 14, 2); g.fillRoundedRect(13, -6, 6, 14, 2);
    g.lineStyle(2, a, 0.8); g.lineBetween(-12, -12, 12, 8); g.lineBetween(12, -12, -12, 8);
    g.fillStyle(a, 0.9); g.fillCircle(0, -18, 2);
  } },
  bigfWingB: { c: 0x9a6b3a, a: 0xbfe8ff, single: true, draw: (g, _now, _flap, c, a) => {
    // 雪橇背板：立着背在身后的一副木雪橇 + 滑刃
    g.fillStyle(0x5a3c20, 1); g.fillRoundedRect(-14, -20, 28, 40, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(-12, -18, 24, 36, 3);
    for (let k = 0; k < 5; k++) { g.fillStyle(0x3a2412, 0.8); g.fillRect(-12, -14 + k * 8, 24, 2); }
    g.lineStyle(3, a, 0.9); g.beginPath(); g.moveTo(-16, 18); g.lineTo(-16, 22); g.lineTo(0, 24); g.lineTo(16, 22); g.lineTo(16, 18); g.strokePath();
    g.fillStyle(0xffffff, 0.8); g.fillEllipse(-10, -16, 6, 3); g.fillEllipse(8, 12, 5, 3);
  } },
};
