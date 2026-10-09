import { TAU, hpoly, type HatArt } from './shared';

/** 批十三头饰（尼斯湖水怪 / 熊出没 / 雪山谜踪）——(x, hy) = 帽沿，往上长、横跨约 ±20 */

export const HATS_16: Record<string, HatArt> = {
  // ── 尼斯湖水怪 ──
  lochHatA: { c: 0x2f5a3a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 苏格兰方格帽：圆扁绒帽 + 方格呢纹 + 顶上一颗绒球，帽沿随呼吸轻晃
    const bob = Math.sin(now / 700) * 1.2;
    g.fillStyle(0x243f2a, 1); // 帽沿
    g.fillRoundedRect(x - 17, hy - 5, 34, 6, 3);
    g.fillStyle(c, 1); // 圆扁帽体
    g.fillEllipse(x, hy - 9 + bob, 33, 18);
    // 方格呢纹（纵横两组）
    g.lineStyle(1, 0x8fe8c8, 0.45);
    for (let k = -2; k <= 2; k++) g.lineBetween(x - 13, hy - 13 + k * 4 + bob, x + 13, hy - 13 + k * 4 + bob);
    for (let k = -2; k <= 2; k++) g.lineBetween(x + k * 6, hy - 18 + bob, x + k * 6, hy - 3 + bob);
    g.lineStyle(1, 0xffd45c, 0.35); // 亮格线
    g.lineBetween(x - 13, hy - 9 + bob, x + 13, hy - 9 + bob);
    g.lineBetween(x, hy - 18 + bob, x, hy - 2 + bob);
    // 顶部绒球
    g.fillStyle(a, 0.95);
    g.fillCircle(x, hy - 20 + bob, 4.6);
    g.fillStyle(0xfff0b0, 0.7);
    g.fillCircle(x - 1.2, hy - 21 + bob, 1.6);
  } },
  lochHatB: { c: 0x35d8a8, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 湖心王冠：波浪状冠圈 + 三叶浪尖 + 中央水泡宝石，四周冒泡上升
    g.fillStyle(c, 0.95); // 冠圈
    g.fillRoundedRect(x - 15, hy - 8, 30, 8, 3);
    g.fillStyle(0x0e3a3a, 0.6);
    g.fillRect(x - 15, hy - 4, 30, 1.6);
    for (const k of [-1, 0, 1]) { // 三片浪尖
      const px = x + k * 11;
      const hgt = k === 0 ? 21 : 15;
      const sway = Math.sin(now / 420 + k) * 0.8;
      hpoly(g, [[px - 5.4, hy - 8], [px + sway, hy - 8 - hgt], [px + 5.4, hy - 8]], c, 0.98);
      g.fillStyle(0x8fe8c8, 0.55); // 浪尖卷光
      g.fillCircle(px + sway, hy - 8 - hgt * 0.7, 2.4);
      g.fillStyle(a, 0.9); // 浪尖金珠
      g.fillCircle(px + sway, hy - 8 - hgt, 2.2);
    }
    // 中央水泡宝石
    g.fillStyle(0x8fe8c8, 0.95);
    g.fillCircle(x, hy - 3, 3.6);
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(x - 1.2, hy - 4.2, 1.3);
    // 上升的水泡
    for (let k = 0; k < 4; k++) {
      const ph = ((now / 900 + k / 4) % 1);
      g.fillStyle(0x8fe8c8, 0.5 * (1 - ph));
      g.fillCircle(x - 9 + k * 6 + Math.sin(now / 300 + k) * 1.5, hy - 12 - ph * 16, 1.6 * (1 - ph) + 0.5);
    }
  } },
  // ── 熊出没 ──
  boonHatA: { c: 0xffcf5c, a: 0xf0b83a, draw: (g, now, x, hy, c, _a) => {
    // 光头强安全帽：黄盔 + 前檐 + 顶脊加强筋 + 头灯，灯一闪一闪
    g.fillStyle(c, 1); // 半球盔体
    g.beginPath(); g.arc(x, hy + 1, 14, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(0xf0b83a, 1); // 前檐
    g.fillRoundedRect(x - 17, hy - 2, 34, 5, 2.4);
    g.fillStyle(0xe0a82a, 0.9); // 顶部加强筋
    g.fillRect(x - 1.5, hy - 15, 3, 14);
    g.fillStyle(0xd89a24, 0.85); // 两侧盔棱
    for (const s of [-1, 1]) g.fillRect(x + s * 8 - 1, hy - 11, 2, 10);
    g.fillStyle(0x3a3a42, 1); // 头灯座
    g.fillRoundedRect(x - 4.4, hy - 11, 8.8, 5.4, 2);
    const on = 0.5 + 0.5 * Math.sin(now / 220);
    g.fillStyle(0xfff0b0, 0.55 + on * 0.45); // 头灯
    g.fillCircle(x, hy - 8.4, 2.2 + on * 0.8);
    g.fillStyle(0xffffff, on * 0.8);
    g.fillCircle(x, hy - 8.4, 1);
    // 帽侧小扳手贴纸
    g.fillStyle(0x8a94a2, 0.9);
    g.fillRect(x + 9, hy - 7, 5, 1.8);
    g.fillCircle(x + 9, hy - 6.1, 1.6);
    g.fillCircle(x + 14, hy - 6.1, 1.6);
  } },
  boonHatB: { c: 0x8a5a3a, a: 0xffcf5c, draw: (g, _now, x, hy, c, a) => {
    // 熊二棉帽：针织圆帽 + 翻边 + 两只圆熊耳 + 顶部绒球
    g.fillStyle(c, 1); // 帽体
    g.beginPath(); g.arc(x, hy + 1, 14, Math.PI, TAU); g.closePath(); g.fillPath();
    g.lineStyle(1, 0x6a3f28, 0.55); // 竖罗纹
    for (let k = -3; k <= 3; k++) g.lineBetween(x + k * 4, hy - 12, x + k * 4, hy + 1);
    g.fillStyle(0x6a3f28, 1); // 翻边
    g.fillRoundedRect(x - 15, hy - 4, 30, 6, 3);
    for (let k = 0; k < 9; k++) { // 翻边毛线疙瘩
      g.fillStyle(0x5a3220, 0.9);
      g.fillCircle(x - 14 + k * 3.5, hy - 1, 1.1);
    }
    for (const s of [-1, 1]) { // 两只圆熊耳
      g.fillStyle(c, 1);
      g.fillCircle(x + s * 11, hy - 12, 6);
      g.fillStyle(0xffc4a0, 0.9); // 耳窝
      g.fillCircle(x + s * 11, hy - 12, 3);
    }
    g.fillStyle(a, 1); // 顶部绒球
    g.fillCircle(x, hy - 16, 4.2);
    g.fillStyle(0xfff0b0, 0.6);
    g.fillCircle(x - 1, hy - 17, 1.4);
  } },
  // ── 雪山谜踪 ──
  bigfHatA: { c: 0x7a6440, a: 0xd8c8a0, draw: (g, _now, x, hy, c, a) => {
    // 探险毛帽：厚毛皮圆帽 + 蓬松毛边 + 两侧护耳 + 顶上一枚雪花徽
    g.fillStyle(c, 1);
    g.beginPath(); g.arc(x, hy + 1, 14, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(0x8a7450, 0.6); // 顶部高光
    g.fillEllipse(x - 4, hy - 9, 12, 6);
    // 蓬松毛边
    g.fillStyle(a, 0.95);
    g.fillRoundedRect(x - 15, hy - 4, 30, 5, 2.5);
    for (let k = 0; k < 9; k++) g.fillCircle(x - 14 + k * 3.5, hy - 3, 2.1);
    // 两侧护耳
    for (const s of [-1, 1]) {
      g.fillStyle(c, 1);
      g.fillRoundedRect(x + s * 13 - 4, hy - 2, 8, 12, 3);
      g.fillStyle(a, 0.9);
      g.fillRoundedRect(x + s * 13 - 4, hy + 8, 8, 3, 1.5);
    }
    // 雪花徽
    const sn = x, sy = hy - 8;
    g.lineStyle(1.2, 0xd8f2ff, 0.95);
    for (let k = 0; k < 3; k++) {
      const ang = (k / 3) * Math.PI;
      g.lineBetween(sn - Math.cos(ang) * 5, sy - Math.sin(ang) * 5, sn + Math.cos(ang) * 5, sy + Math.sin(ang) * 5);
    }
  } },
  bigfHatB: { c: 0xbfe8ff, a: 0xffffff, draw: (g, now, x, hy, c, a) => {
    // 雪山冰冠：冰质冠圈 + 一排高低冰锥 + 中央大冰晶，晶面反光闪烁
    g.fillStyle(0x8fd8ff, 0.95); // 冰冠圈
    g.fillRoundedRect(x - 15, hy - 6, 30, 7, 3);
    g.fillStyle(0x5ab8e0, 0.5);
    g.fillRect(x - 15, hy - 2, 30, 1.6);
    const hs = [13, 19, 16, 22, 14]; // 冰锥高度
    for (let k = 0; k < 5; k++) {
      const px = x - 12 + k * 6;
      hpoly(g, [[px - 3, hy - 6], [px, hy - 6 - hs[k]], [px + 3, hy - 6]], c, 0.96);
      g.fillStyle(0xffffff, 0.55); // 锥面反光
      hpoly(g, [[px - 2.4, hy - 6], [px - 0.4, hy - 6 - hs[k] * 0.85], [px - 0.4, hy - 6]], 0xffffff, 0.5);
    }
    // 中央大冰晶
    const cx = x, cy = hy - 12;
    g.fillStyle(a, 0.92);
    g.fillPoints([
      { x: cx, y: cy - 9 }, { x: cx + 4, y: cy }, { x: cx, y: cy + 6 }, { x: cx - 4, y: cy },
    ] as never, true);
    g.fillStyle(0x8fd8ff, 0.8);
    g.fillPoints([{ x: cx, y: cy - 5 }, { x: cx + 2, y: cy }, { x: cx, y: cy + 3 }, { x: cx - 2, y: cy }] as never, true);
    // 晶面闪烁
    const tw = Math.abs(Math.sin(now / 500));
    g.fillStyle(0xffffff, tw * 0.9);
    g.fillCircle(cx - 1, cy - 2, 1.2);
    for (let k = 0; k < 3; k++) {
      const ph = ((now / 1100 + k / 3) % 1);
      g.fillStyle(0xffffff, 0.6 * (1 - ph));
      g.fillCircle(x - 10 + k * 10, hy - 4 - ph * 10, 1.2 * (1 - ph) + 0.4);
    }
  } },
};
