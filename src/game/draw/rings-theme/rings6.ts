import { TAU, type RingArt } from './shared';

/** 批五主题地环（武侠江湖 / 北欧神域）。(x, feetY) 原点，地面基准 y = feetY - 3。 */
export const RINGS_6: Record<string, RingArt> = {
  wxRing: { c: 0xd9a84a, a: 0xff9a3c, draw: (g, now, x, feetY, c, _a) => {
    // 落叶地环：脚下秋叶旋涡——叶环 + 三片打转的落叶 + 叶脉尘
    const ry = feetY - 3;
    g.fillStyle(0xc07830, 0.24);
    g.fillEllipse(x, ry, 54, 16);
    g.lineStyle(2, c, 0.7);
    g.strokeEllipse(x, ry, 48, 14);
    for (let k = 0; k < 7; k++) { // 环上贴地的叶子（叶形 + 叶脉）
      const ang = (k / 7) * TAU + now / 2600;
      const px = x + Math.cos(ang) * 23, py = ry + Math.sin(ang) * 5.2;
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas(ang * 2 + k);
      g.fillStyle(k % 2 ? 0xd98a3a : 0xc05a2a, 0.9);
      g.fillEllipse(0, 0, 5.4, 2.6);
      g.lineStyle(0.7, 0x8a4a1a, 0.8);
      g.lineBetween(-2.4, 0, 2.4, 0);
      g.restore();
    }
    for (let k = 0; k < 3; k++) { // 打转上升的落叶
      const ph = (now / 1400 + k / 3) % 1;
      const ang = ph * 6 + k * 2;
      g.fillStyle(0xff9a3c, 0.75 * Math.sin(ph * Math.PI));
      g.save();
      g.translateCanvas(x + Math.cos(ang) * (8 + ph * 14), ry - ph * 26);
      g.rotateCanvas(ang * 2);
      g.fillEllipse(0, 0, 4.4, 2);
      g.restore();
    }
    for (let k = 0; k < 4; k++) { // 叶脉尘（贴地飘）
      const ph = (now / 900 + k / 4) % 1;
      g.fillStyle(0xd9a84a, 0.4 * (1 - ph));
      g.fillEllipse(x - 20 + ph * 40, ry + 3, 4, 1.4);
    }
  } },
  norseRing: { c: 0x7fd4ff, a: 0xdff2ff, draw: (g, now, x, feetY, c, a) => {
    // 符文地环：脚下冰面符文阵——冰环 + 六枚旋转符文 + 冰晶凸起 + 寒霜呼吸
    const ry = feetY - 3;
    const p1 = 0.5 + 0.5 * Math.sin(now / 500);
    g.fillStyle(c, 0.14 + p1 * 0.05);
    g.fillEllipse(x, ry, 56, 17);
    g.lineStyle(2.2, c, 0.75);
    g.strokeEllipse(x, ry, 50, 15);
    g.lineStyle(1, a, 0.5);
    g.strokeEllipse(x, ry, 30, 9);
    for (let k = 0; k < 6; k++) { // 旋转符文（几何符形）
      const ang = now / 2000 + (k / 6) * TAU;
      const px = x + Math.cos(ang) * 25, py = ry + Math.sin(ang) * 6.6;
      const gl = 0.5 + 0.5 * Math.abs(Math.sin(now / 360 + k * 1.4));
      g.lineStyle(1.4, k % 2 ? a : c, gl);
      g.beginPath();
      g.moveTo(px - 2, py + 1.6); g.lineTo(px, py - 2); g.lineTo(px + 2, py + 1.6);
      g.strokePath();
    }
    for (let k = 0; k < 5; k++) { // 环内冰晶凸起（尖晶，明灭）
      const px = x - 16 + k * 8;
      const gl = 0.35 + 0.35 * Math.sin(now / 420 + k * 1.7);
      g.fillStyle(a, gl + 0.2);
      g.fillTriangle(px - 2, ry + 2, px + 2, ry + 2, px, ry - 4 - (k % 2) * 2);
      g.fillStyle(0xffffff, gl * 0.7);
      g.fillTriangle(px - 1, ry + 2, px, ry + 2, px, ry - 2);
    }
    for (let k = 0; k < 3; k++) { // 寒霜上浮
      const ph = (now / 1100 + k / 3) % 1;
      g.fillStyle(0xffffff, 0.5 * (1 - ph));
      g.fillCircle(x - 12 + k * 12 + Math.sin(ph * 4 + k) * 3, ry - ph * 22, 1.3 * (1 - ph) + 0.4);
    }
  } },
};
