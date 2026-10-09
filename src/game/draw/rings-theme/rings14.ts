import { TAU, rpoly, type RingArt } from './shared';

/** 批十三地环（尼斯湖水怪 / 熊出没 / 雪山谜踪）——原点 (x, feetY) */

export const RINGS_14: Record<string, RingArt> = {
  lochRing: { c: 0x35d8a8, a: 0x8fe8c8, draw: (g, now, x, feetY, c, a) => {
    // 湖波地环：脚下湿漉漉的一小片湖水，三圈涟漪错相外扩，溅着水花
    const ry = feetY - 3;
    g.fillStyle(0x0e3a3a, 0.55);
    g.fillEllipse(x, ry + 1, 56, 14);
    g.fillStyle(0x1c5a4e, 0.6);
    g.fillEllipse(x, ry, 46, 10);
    // 错相外扩的涟漪
    for (let k = 0; k < 3; k++) {
      const ph = ((now / 900 + k / 3) % 1);
      const rr = 8 + ph * 24;
      g.lineStyle(1.6 - ph, a, 0.6 * (1 - ph));
      g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26);
      g.beginPath(); g.arc(0, 0, rr, 0, TAU); g.strokePath(); g.restore();
    }
    // 溅起的水花
    for (let k = 0; k < 4; k++) {
      const ph = ((now / 600 + k / 4) % 1);
      g.fillStyle(0xdff6ee, 0.8 * (1 - ph));
      g.fillCircle(x - 20 + k * 13, ry - 2 - ph * 12, 1.6 * (1 - ph) + 0.4);
    }
    g.lineStyle(1.4, c, 0.35);
    g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26);
    g.beginPath(); g.arc(0, 0, 32, 0, TAU); g.strokePath(); g.restore();
  } },
  boonRing: { c: 0x8a5a3a, a: 0x8fe06a, draw: (g, _now, x, feetY, _c, a) => {
    // 树桩地环：脚下一截锯断的树桩年轮，四周散着锯末与落叶
    const ry = feetY - 3;
    g.fillStyle(0x2e4a2a, 0.6); // 草地底
    g.fillEllipse(x, ry + 1, 58, 15);
    g.fillStyle(0x3f6136, 0.7);
    g.fillEllipse(x, ry, 48, 11);
    // 树桩断面
    g.fillStyle(0x6a4a2a, 1);
    g.fillEllipse(x, ry, 40, 13);
    g.fillStyle(0x8a6a42, 1);
    g.fillEllipse(x, ry, 34, 10.5);
    g.lineStyle(1.4, 0x5a3c22, 0.8); // 年轮
    for (let r = 5; r <= 15; r += 5) {
      g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.28);
      g.beginPath(); g.arc(0, 0, r, 0, TAU); g.strokePath(); g.restore();
    }
    g.fillStyle(0x4a3018, 1); // 树心
    g.fillCircle(x, ry, 2.4);
    // 树皮外圈
    g.lineStyle(2.4, 0x4a3018, 1);
    g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.28);
    g.beginPath(); g.arc(0, 0, 20, 0, TAU); g.strokePath(); g.restore();
    // 锯末 + 落叶
    for (let k = 0; k < 6; k++) {
      const ang = k * 1.1;
      g.fillStyle(0xd8b884, 0.8);
      g.fillRect(x + Math.cos(ang) * 26 - 1.5, ry + Math.sin(ang) * 6 - 1, 4, 2.4);
    }
    for (let k = 0; k < 4; k++) {
      const ang = k * 1.7 + 0.5;
      const lx = x + Math.cos(ang) * 30, ly = ry + Math.sin(ang) * 8;
      g.fillStyle(k % 2 ? a : 0xd4622a, 0.9);
      g.fillPoints([{ x: lx - 4, y: ly }, { x: lx, y: ly - 3 }, { x: lx + 4, y: ly }, { x: lx, y: ly + 3 }] as never, true);
    }
  } },
  bigfRing: { c: 0xbfe8ff, a: 0xe0f2ff, draw: (g, _now, x, feetY, c, _a) => {
    // 巨型脚印地环：雪地上深深踩出的一只大脚印，边缘积雪翻起，旁有碎冰
    const ry = feetY - 3;
    g.fillStyle(0xe0f2ff, 0.5); // 雪地
    g.fillEllipse(x, ry + 1, 62, 16);
    g.fillStyle(0xbcd8ee, 0.8);
    g.fillEllipse(x, ry, 50, 12);
    // 脚印（脚掌 + 五趾）
    g.fillStyle(0x6a8aa8, 0.85);
    g.fillEllipse(x, ry + 1, 26, 9);
    for (let k = 0; k < 5; k++) {
      const tx = x - 12 + k * 6;
      const ty = ry - 6 + Math.abs(k - 2) * 1.2;
      g.fillCircle(tx, ty, 2.4 - Math.abs(k - 2) * 0.4);
    }
    // 脚掌内阴影 + 高光
    g.fillStyle(0x4a6a88, 0.6);
    g.fillEllipse(x, ry + 1.6, 18, 6);
    g.fillStyle(0xffffff, 0.35);
    g.fillEllipse(x - 4, ry - 0.4, 8, 2.4);
    // 翻起的积雪
    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * TAU;
      g.fillStyle(0xffffff, 0.85);
      g.fillEllipse(x + Math.cos(ang) * 30, ry + Math.sin(ang) * 8 - 1, 6, 3);
    }
    // 雪堆 / 碎冰
    rpoly(g, [[x - 34, ry + 3], [x - 28, ry - 3], [x - 22, ry + 4]], 0xffffff, 0.7);
    rpoly(g, [[x + 22, ry + 4], [x + 30, ry - 2], [x + 36, ry + 4]], 0xffffff, 0.7);
    g.lineStyle(1.4, c, 0.4);
    g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26);
    g.beginPath(); g.arc(0, 0, 34, 0, TAU); g.strokePath(); g.restore();
  } },
};
