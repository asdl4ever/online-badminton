import { TAU, type RingArt } from './shared';

/** 批九主题地环（童话王国 / 深夜食堂 / 猫咖物语）。(x, feetY) 原点，地面基准 y = feetY - 3。 */
export const RINGS_10: Record<string, RingArt> = {
  taleRing: { c: 0xff9adf, a: 0xffd45c, draw: (g, now, x, feetY, c, _a) => {
    // 糖果地环：脚下糖果圈——马卡龙环 + 棒棒糖 + 撒糖粒 + 冰淇淋
    const ry = feetY - 3;
    g.fillStyle(0xffd0e0, 0.3);
    g.fillEllipse(x, ry, 56, 17);
    g.lineStyle(2.4, c, 0.8);
    g.strokeEllipse(x, ry, 50, 15);
    for (let k = 0; k < 6; k++) { // 环上马卡龙（双色小圆饼）
      const ang = (k / 6) * TAU + now / 2400;
      const px = x + Math.cos(ang) * 23, py = ry + Math.sin(ang) * 6.2;
      g.fillStyle(k % 2 ? 0xffb0c8 : 0xbfe8d0, 0.95);
      g.fillEllipse(px, py - 1, 7, 3);
      g.fillStyle(0xfff0d8, 0.9); // 夹心
      g.fillEllipse(px, py, 6.4, 2);
      g.fillStyle(k % 2 ? 0xffb0c8 : 0xbfe8d0, 0.95);
      g.fillEllipse(px, py + 1, 7, 3);
    }
    for (let k = 0; k < 2; k++) { // 棒棒糖（插在环上，糖面螺旋）
      const lx = x - 14 + k * 28;
      g.lineStyle(1.4, 0xffffff, 0.9);
      g.lineBetween(lx, ry - 2, lx, ry - 12);
      g.fillStyle(k ? 0x5ac8ff : c, 0.95);
      g.fillCircle(lx, ry - 15, 4.4);
      g.lineStyle(1.2, 0xffffff, 0.8);
      g.beginPath();
      g.arc(lx, ry - 15, 2.8, now / 300 + k, now / 300 + k + 4);
      g.strokePath();
    }
    for (let k = 0; k < 8; k++) { // 撒糖粒（彩色小糖针）
      const px = x - 20 + (k * 7.4) % 40, py = ry + 2 + (k % 3) * 2 - 1;
      const cols = [0xffd45c, 0xff9adf, 0x7dffc4, 0x7ac8ff];
      g.fillStyle(cols[k % 4], 0.9);
      g.fillRect(px - 1.4, py - 0.5, 2.8, 1);
    }
    for (let k = 0; k < 3; k++) { // 冰淇淋甜筒（环上小甜筒）
      const px = x - 8 + k * 8;
      g.fillStyle(0xd9a05c, 0.9);
      g.fillTriangle(px - 2.4, ry - 1, px + 2.4, ry - 1, px, ry + 4);
      g.fillStyle(0xfff0d8, 0.95);
      g.fillCircle(px, ry - 2, 2);
    }
  } },
  dinRing: { c: 0xf0ead8, a: 0xffb84a, draw: (g, now, x, feetY, c, a) => {
    // 碗碟地环：脚下堆叠的碗碟环——碟环 + 碗 + 筷架 + 蒸汽
    const ry = feetY - 3;
    g.fillStyle(0xd8d0c0, 0.3);
    g.fillEllipse(x, ry, 56, 17);
    g.lineStyle(2.2, c, 0.8);
    g.strokeEllipse(x, ry, 50, 15);
    g.lineStyle(1.2, a, 0.5);
    g.strokeEllipse(x, ry, 34, 10);
    for (let k = 0; k < 6; k++) { // 环上小碟（叠两片的碟子）
      const ang = (k / 6) * TAU + now / 2600;
      const px = x + Math.cos(ang) * 23, py = ry + Math.sin(ang) * 6.2;
      g.fillStyle(0xe8e0d0, 0.95);
      g.fillEllipse(px, py, 8, 3);
      g.fillStyle(0xf0ead8, 0.9);
      g.fillEllipse(px, py - 1.4, 7, 2.6);
      g.fillStyle(0x39424e, 0.6); // 碟心纹
      g.fillCircle(px, py - 0.4, 1);
    }
    // 环后一碗汤（大碗 + 汤面 + 筷子）
    g.fillStyle(0xe8e0d0, 0.95);
    g.fillEllipse(x + 16, ry - 2, 14, 6);
    g.fillStyle(0xd88a3a, 0.95);
    g.fillEllipse(x + 16, ry - 4, 10, 3.4);
    g.fillStyle(0xffe0b0, 0.7);
    g.fillCircle(x + 14, ry - 4.4, 1.2);
    g.lineStyle(1.2, 0xc08a3a, 0.9); // 斜插筷子
    g.lineBetween(x + 14, ry - 2, x + 18, ry - 12);
    g.lineBetween(x + 15, ry - 2, x + 19, ry - 11);
    for (let k = 0; k < 4; k++) { // 蒸汽
      const ph = (now / 1000 + k / 4) % 1;
      g.fillStyle(0xf0ead8, 0.3 * (1 - ph));
      g.fillCircle(x + 14 + Math.sin(ph * 4 + k) * 3, ry - 8 - ph * 18, 1.4 * (1 - ph) + 0.5);
    }
    for (let k = 0; k < 4; k++) { // 撒落的葱花（绿色小点）
      g.fillStyle(0x7dffc4, 0.8);
      g.fillCircle(x - 18 + k * 12, ry + 2 + (k % 2), 0.9);
    }
  } },
  catRing: { c: 0xffb0c8, a: 0xffd8a8, draw: (g, now, x, feetY, c, a) => {
    // 猫爪地环：脚下猫爪印环——爪印环 + 大肉球 + 毛线绕环 + 尾巴扫痕
    const ry = feetY - 3;
    g.fillStyle(c, 0.24);
    g.fillEllipse(x, ry, 56, 17);
    g.lineStyle(2.2, c, 0.8);
    g.strokeEllipse(x, ry, 50, 15);
    for (let k = 0; k < 6; k++) { // 环上猫爪印（一大肉球 + 三趾）
      const ang = (k / 6) * TAU + now / 2400;
      const px = x + Math.cos(ang) * 23, py = ry + Math.sin(ang) * 6.2;
      g.fillStyle(k % 2 ? a : 0xffffff, 0.9);
      g.fillEllipse(px, py, 4, 2.6);
      for (let s = 0; s < 3; s++) g.fillCircle(px - 2 + s * 2, py - 2.4, 0.9);
    }
    // 环心大肉球（粉软肉球，Q 弹缩放）
    const squish = 1 + Math.sin(now / 350) * 0.08;
    g.fillStyle(0xff9adf, 0.95);
    g.fillEllipse(x, ry, 12 * squish, 8 / squish);
    g.fillStyle(0xffffff, 0.5);
    g.fillEllipse(x - 2, ry - 1.4, 4, 2);
    // 毛线绕环（一段彩线贴环走）
    g.lineStyle(1.4, 0x7ac8ff, 0.7);
    g.beginPath();
    for (let s = 0; s <= 10; s++) {
      const u = s / 10;
      const ang = u * 3.4 + now / 1600;
      g.lineTo(x + Math.cos(ang) * 26, ry + Math.sin(ang) * 6.6);
    }
    g.strokePath();
    for (let k = 0; k < 4; k++) { // 尾巴扫痕（弧形扫痕）
      const ph = (now / 1300 + k / 4) % 1;
      g.lineStyle(1.2, c, 0.3 * Math.sin(ph * Math.PI));
      g.beginPath();
      g.arc(x, ry, 16 + ph * 12, 0.4 + k, 1.6 + k);
      g.strokePath();
    }
  } },
};
