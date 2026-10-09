import { handle, pommel, poly, line, type WeaponArt } from './shared';

/** 批十三球拍皮肤（尼斯湖水怪 / 熊出没 / 雪山谜踪） */

export const WEAPONS_16: Record<string, WeaponArt> = {
  // ── 尼斯湖水怪 ──
  lochRacketA: { c: 0x6a4a2f, a: 0x8fe8c8, draw: (g, now, c, a) => {
    // 船桨·拍：拍面化作一支木船桨的桨叶，桨面木纹、边上挂着湖水
    handle(g, -14, -2, 6, 0x4a3018);
    pommel(g, -15, 2.4, 0x8a6a42);
    g.fillStyle(0x5a3a22, 1); // 桨杆
    g.fillRect(-3, -2, 6, 4);
    // 桨叶（水滴形）
    poly(g, [[-1, -5], [6, -17], [23, -14], [29, 0], [23, 14], [6, 17], [-1, 5]], c, 0.98);
    g.fillStyle(0x8a6a42, 0.7); // 叶面高光
    poly(g, [[2, -8], [10, -14], [20, -10], [16, -3], [6, -4]], 0x8a6a42, 0.55);
    g.lineStyle(1.4, 0x3a2414, 0.7); // 木纹
    for (let k = 0; k < 3; k++) line(g, [[4, -8 + k * 8], [26, -6 + k * 7]], 1.4, 0x3a2414, 0.6);
    // 桨缘水线
    g.lineStyle(2, a, 0.7);
    line(g, [[6, -17], [23, -14], [29, 0], [23, 14], [6, 17]], 2, a, 0.65);
    // 挂着的水滴
    for (let k = 0; k < 3; k++) {
      const ph = ((now / 800 + k / 3) % 1);
      g.fillStyle(a, 0.8 * (1 - ph));
      g.fillEllipse(10 + k * 6, 18 + ph * 10, 1.8, 3.4);
    }
  } },
  lochRacketB: { c: 0x2f5a6a, a: 0x8fe8c8, draw: (g, now, _c, a) => {
    // 三叉戟·拍：拍面化作一柄海神三叉戟，三根叉齿、中央嵌水纹宝石
    handle(g, -14, -2, 6, 0x1c3a4a);
    pommel(g, -15, 2.6, 0xd9c8a0);
    g.fillStyle(0xd9c8a0, 1); // 戟首横档
    g.fillRect(0, -1.4, 8, 2.8);
    // 三根叉齿
    for (const dy of [-11, 0, 11]) {
      line(g, [[6, dy * 0.5], [26, dy]], 5, 0x8a9aa8, 1);
      line(g, [[6, dy * 0.5], [26, dy]], 3, 0xd9e4ea, 0.9);
      g.fillStyle(0xd9e4ea, 1); // 齿尖
      g.fillTriangle(25, dy - 3, 25, dy + 3, 33, dy);
    }
    // 中央杆
    line(g, [[4, 0], [30, 0]], 3.4, 0xd9e4ea, 0.9);
    // 水纹宝石
    const gl = 0.6 + 0.4 * Math.sin(now / 320);
    for (let k = 2; k >= 0; k--) {
      g.fillStyle(a, 0.18 * gl * (1 - k * 0.3));
      g.fillCircle(16, 0, 4 + k * 3);
    }
    g.fillStyle(a, 0.95);
    g.fillCircle(16, 0, 3.4);
    g.fillStyle(0xffffff, gl);
    g.fillCircle(16, 0, 1.4);
    // 横向水波装饰
    g.lineStyle(1.6, a, 0.6);
    for (let k = 0; k < 2; k++) {
      g.beginPath();
      g.moveTo(7, -4 + k * 8);
      g.lineTo(11, -2 + k * 8);
      g.lineTo(15, -4 + k * 8);
      g.lineTo(19, -2 + k * 8);
      g.strokePath();
    }
  } },
  // ── 熊出没 ──
  boonRacketA: { c: 0xd8d4c8, a: 0xff5a1a, draw: (g, now, c, a) => {
    // 电锯·拍：拍面化作电锯导板，链齿滚动，机身后坐、排气冒烟
    handle(g, -14, -2, 7, 0x3a3a42);
    pommel(g, -15, 2.6, 0x8a94a2);
    // 机身
    g.fillStyle(0xc04a2a, 1);
    g.fillRoundedRect(-2, -9, 14, 18, 4);
    g.fillStyle(0x8a3a1e, 0.8);
    g.fillRoundedRect(0, -7, 8, 6, 2);
    // 导板（长条）
    g.fillStyle(c, 1);
    g.fillPoints([{ x: 10, y: -6 }, { x: 32, y: -4 }, { x: 34, y: 0 }, { x: 32, y: 4 }, { x: 10, y: 6 }] as never, true);
    g.fillStyle(0x9a9a92, 0.6);
    g.fillRect(12, -1, 20, 2);
    // 滚动的链齿
    const roll = now / 90;
    for (let k = 0; k < 8; k++) {
      const t = ((k / 8) + (roll % 1) / 8) % 1;
      const px = 11 + t * 22;
      const top = k % 2 === 0;
      g.fillStyle(0xb0b0a8, 1);
      g.fillRect(px, top ? -7.5 : 5.5, 2.2, 3);
    }
    g.fillStyle(0xd8d4c8, 0.9); // 齿尖
    for (let k = 0; k < 7; k++) g.fillTriangle(12 + k * 3, -6.5, 14 + k * 3, -6.5, 13 + k * 3, -8.5);
    // 排气烟
    for (let k = 0; k < 3; k++) {
      const ph = ((now / 700 + k / 3) % 1);
      g.fillStyle(0x9a9488, 0.3 * (1 - ph));
      g.fillCircle(2 + ph * 4, -10 - ph * 12, 2.4 + ph * 4);
    }
    // 油门火星
    g.fillStyle(a, 0.7 + 0.3 * Math.sin(now / 150));
    g.fillCircle(34, 0, 1.8);
  } },
  boonRacketB: { c: 0x8a94a2, a: 0xb8945a, draw: (g, _now, c, a) => {
    // 伐木斧·拍：拍面化作一柄伐木斧的斧头，弧刃锋利、木柄带斧眼铆钉
    handle(g, -15, -2, 7, 0x6a4a2a);
    pommel(g, -16, 2.6, 0x4a3018);
    // 斧头
    g.fillStyle(c, 1);
    poly(g, [[-1, -10], [12, -16], [26, -8], [30, 0], [26, 8], [12, 16], [-1, 10]], c, 0.98);
    g.fillStyle(0x6a7482, 0.9); // 斧面分块
    poly(g, [[2, -6], [12, -11], [20, -4], [14, 2]], 0x6a7482, 0.85);
    // 弧刃
    g.lineStyle(4.4, 0x59657a, 1);
    g.beginPath();
    g.moveTo(12, -16);
    g.lineTo(26, -8);
    g.lineTo(30, 0);
    g.lineTo(26, 8);
    g.lineTo(12, 16);
    g.strokePath();
    g.lineStyle(2.4, 0xe0e8f0, 0.9); // 刃口高光
    g.beginPath();
    g.moveTo(12, -16);
    g.lineTo(26, -8);
    g.lineTo(30, 0);
    g.lineTo(26, 8);
    g.lineTo(12, 16);
    g.strokePath();
    // 斧眼铆钉
    g.fillStyle(a, 0.9);
    g.fillCircle(4, 0, 2.4);
    g.fillStyle(0x3a2a18, 1);
    g.fillCircle(4, 0, 1);
  } },
  // ── 雪山谜踪 ──
  bigfRacketA: { c: 0x9fd8e8, a: 0xe0f2ff, draw: (g, now, c, a) => {
    // 冰镐·拍：拍面化作一把冰镐，前端尖啄、后端平铲，镐身结着冰霜
    handle(g, -14, -2, 6, 0x3a4a58);
    pommel(g, -15, 2.4, 0x8a9aa8);
    g.fillStyle(0x5a6a78, 1); // 镐杆
    g.fillRect(-2, -2, 10, 4);
    // 前尖啄
    g.fillStyle(c, 1);
    poly(g, [[6, -5], [28, -2], [34, 0], [28, 2], [6, 5]], c, 0.98);
    g.fillStyle(0xd8f2ff, 0.55);
    poly(g, [[7, -2], [26, -1], [30, 0], [26, 1], [7, 2]], 0xd8f2ff, 0.5);
    // 后端平铲
    g.fillStyle(0x8a9aa8, 1);
    poly(g, [[2, -7], [10, -9], [14, -3], [10, 6], [2, 4]], 0x8a9aa8, 1);
    g.fillStyle(0xd8f2ff, 0.5);
    poly(g, [[4, -6], [9, -7], [11, -3], [8, 3], [4, 2]], 0xd8f2ff, 0.45);
    // 结霜
    for (let k = 0; k < 4; k++) {
      const ph = ((now / 1000 + k / 4) % 1);
      g.fillStyle(0xffffff, 0.6 * (1 - ph));
      g.fillCircle(10 + k * 6, -6 - ph * 8, 1.4 * (1 - ph) + 0.4);
    }
    g.lineStyle(1.4, a, 0.7); // 镐尖微光
    g.lineBetween(30, -3, 34, 0);
    g.lineBetween(30, 3, 34, 0);
  } },
  bigfRacketB: { c: 0xd8c8a0, a: 0xffffff, draw: (g, now, c, a) => {
    // 骨棒·拍：拍面化作一根大骨棒，两端骨节膨大、敲击端有裂纹
    handle(g, -14, -2, 6.4, 0x7a6440);
    pommel(g, -15, 3, 0xd8c8a0);
    // 骨杆
    g.fillStyle(c, 1);
    poly(g, [[0, -4], [22, -5], [22, 5], [0, 4]], c, 0.98);
    g.fillStyle(0xbfae86, 0.7); // 骨面高光
    poly(g, [[1, -3], [20, -3.6], [20, -0.5], [1, -1]], 0xbfae86, 0.6);
    // 两端骨节（四球）
    for (const ex of [1, 24]) {
      for (const ey of [-5, 5]) {
        g.fillStyle(c, 1);
        g.fillCircle(ex, ey, 5.4);
        g.fillStyle(a, 0.35);
        g.fillCircle(ex - 1, ey - 1, 2.2);
      }
    }
    // 敲击端裂纹 + 血痕
    g.lineStyle(1.4, 0x8a705a, 0.8);
    for (let k = 0; k < 3; k++) {
      g.beginPath();
      g.moveTo(26 + k, -4 + k * 3);
      g.lineTo(30, -2 + k * 3);
      g.strokePath();
    }
    // 敲击时的碎屑
    for (let k = 0; k < 3; k++) {
      const ph = ((now / 700 + k / 3) % 1);
      g.fillStyle(0xe0d8c0, 0.7 * (1 - ph));
      g.fillCircle(30 + ph * 6, -4 + k * 5, 1.4 * (1 - ph) + 0.4);
    }
  } },
};
