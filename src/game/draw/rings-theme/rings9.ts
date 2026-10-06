import { TAU, type RingArt } from './shared';

/** 批八主题地环（敦煌飞天 / 羽蛇神殿 / 圣辉天界）。(x, feetY) 原点，地面基准 y = feetY - 3。 */
export const RINGS_9: Record<string, RingArt> = {
  dunRing: { c: 0xff9adf, a: 0xffd45c, draw: (g, now, x, feetY, c, a) => {
    // 莲花地环：脚下盛开的莲花座——莲瓣环 + 花心 + 花瓣开合呼吸 + 落瓣
    const ry = feetY - 3;
    const bloom = 0.85 + 0.15 * Math.sin(now / 700); // 花瓣开合呼吸
    g.fillStyle(c, 0.22);
    g.fillEllipse(x, ry, 56 * bloom, 17 * bloom);
    for (let k = 0; k < 8; k++) { // 外层莲瓣（放射椭圆瓣）
      const ang = (k / 8) * TAU + now / 3000;
      const px = x + Math.cos(ang) * 22 * bloom, py = ry + Math.sin(ang) * 6.4 * bloom;
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas(ang + Math.PI / 2);
      g.fillStyle(k % 2 ? c : 0xffb0c8, 0.85);
      g.fillEllipse(0, 0, 9, 4);
      g.fillStyle(0xffffff, 0.4);
      g.fillEllipse(0, -0.8, 5, 1.6);
      g.restore();
    }
    for (let k = 0; k < 5; k++) { // 内层莲瓣（反向）
      const ang = (k / 5) * TAU + Math.PI / 5 - now / 2400;
      const px = x + Math.cos(ang) * 12, py = ry + Math.sin(ang) * 3.6;
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas(ang + Math.PI / 2);
      g.fillStyle(0xfff0d8, 0.9);
      g.fillEllipse(0, 0, 7, 3);
      g.restore();
    }
    g.fillStyle(a, 0.9); // 花心
    g.fillEllipse(x, ry, 7, 2.6);
    g.fillStyle(0xffffff, 0.7);
    g.fillEllipse(x - 1.4, ry - 0.6, 2.8, 1);
    for (let k = 0; k < 4; k++) { // 落瓣（飘起又落下）
      const ph = (now / 1600 + k / 4) % 1;
      g.save();
      g.translateCanvas(x + Math.sin(ph * 4 + k) * 14, ry - 4 - (1 - ph) * 20);
      g.rotateCanvas(ph * 5 + k);
      g.fillStyle(k % 2 ? a : 0xffb0c8, 0.6 * Math.sin(ph * Math.PI));
      g.fillEllipse(0, 0, 3.4, 1.6);
      g.restore();
    }
  } },
  aztRing: { c: 0x3ad49a, a: 0xffd45c, draw: (g, now, x, feetY, c, a) => {
    // 阶梯地环：脚下金字塔阶梯环——石阶环 + 阶梯纹 + 蛇影绕行 + 苔藓斑
    const ry = feetY - 3;
    g.fillStyle(0x8a7a5a, 0.35);
    g.fillEllipse(x, ry, 58, 18);
    g.lineStyle(2.6, c, 0.8);
    g.strokeEllipse(x, ry, 52, 16);
    g.lineStyle(1.2, 0x6a5a3a, 0.7);
    g.strokeEllipse(x, ry, 36, 11);
    for (let k = 0; k < 8; k++) { // 阶梯纹（放射短阶线）
      const ang = (k / 8) * TAU;
      g.lineStyle(2.2, 0x6a5a3a, 0.7);
      g.lineBetween(x + Math.cos(ang) * 18, ry + Math.sin(ang) * 5.4, x + Math.cos(ang) * 26, ry + Math.sin(ang) * 7.8);
    }
    // 羽蛇影（沿环绕行的蛇身虚影）
    const ang = now / 1300;
    const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 6.2;
    g.fillStyle(0x2a9a6e, 0.75);
    g.fillEllipse(px, py, 9, 4.4);
    g.fillStyle(0xffd45c, 0.95); // 蛇眼
    g.fillCircle(px + Math.cos(ang + Math.PI / 2) * 3, py + Math.sin(ang + Math.PI / 2) * 1, 1.2);
    g.fillStyle(0x2a9a6e, 0.4); // 蛇尾渐隐
    for (let s = 1; s <= 3; s++) {
      g.fillEllipse(x + Math.cos(ang - s * 0.24) * 24, ry + Math.sin(ang - s * 0.24) * 6.2, 6 - s * 1.4, 3 - s * 0.6);
    }
    for (let k = 0; k < 5; k++) { // 苔藓斑
      g.fillStyle(0x4a8a5a, 0.4);
      g.fillEllipse(x - 18 + k * 9, ry + 3 + (k % 2) * 2, 4, 1.8);
    }
    for (let k = 0; k < 4; k++) { // 石缝金尘（宝藏微光）
      const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 340 + k * 1.6));
      g.fillStyle(a, gl);
      g.fillCircle(x - 16 + k * 11, ry - 1 - (k % 2) * 2, 1);
    }
  } },
  angRing: { c: 0xfff6d8, a: 0xffd45c, draw: (g, now, x, feetY, c, a) => {
    // 圣云地环：脚下圣云环——云朵环 + 云隙圣光 + 光尘 + 小天使云卷
    const ry = feetY - 3;
    const p1 = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(c, 0.16 + p1 * 0.05);
    g.fillEllipse(x, ry, 58, 18);
    g.lineStyle(2.2, c, 0.7);
    g.strokeEllipse(x, ry, 52, 16);
    for (let k = 0; k < 7; k++) { // 环上云朵（蓬松云团，两色叠加）
      const ang = (k / 7) * TAU + now / 2800;
      const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 6.4;
      g.fillStyle(0xf0ead8, 0.9);
      g.fillCircle(px, py, 4.4);
      g.fillCircle(px + 3.4, py - 1, 3);
      g.fillCircle(px - 3.4, py - 0.6, 2.6);
      g.fillStyle(0xffffff, 0.7);
      g.fillCircle(px - 1, py - 1.4, 2);
    }
    for (let k = 0; k < 4; k++) { // 云隙圣光（从云缝漏下的光柱）
      const ph = (now / 900 + k / 4) % 1;
      const lx = x - 18 + k * 12;
      g.fillStyle(a, 0.25 * Math.sin(ph * Math.PI));
      g.fillPoints([
        { x: lx - 2.4, y: ry - 1 }, { x: lx + 2.4, y: ry - 1 }, { x: lx + 4, y: ry + 7 }, { x: lx - 4, y: ry + 7 },
      ] as never, true);
    }
    for (let k = 0; k < 5; k++) { // 上浮光尘
      const ph = (now / 1000 + k / 5) % 1;
      g.fillStyle(0xffffff, 0.6 * (1 - ph));
      g.fillCircle(x - 16 + k * 8 + Math.sin(ph * 4 + k) * 3, ry - 2 - ph * 18, 1.2 * (1 - ph) + 0.4);
    }
  } },
};
