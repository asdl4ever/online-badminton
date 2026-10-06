import { TAU, type RingArt } from './shared';

/** 批六主题地环（法老秘葬 / 暗部忍道）。(x, feetY) 原点，地面基准 y = feetY - 3。 */
export const RINGS_7: Record<string, RingArt> = {
  egRing: { c: 0x3a5a8a, a: 0xffd45c, draw: (g, now, x, feetY, c, a) => {
    // 圣甲地环：脚下墓道石环——石砖环 + 圣甲虫滚球绕行 + 沙漏光 + 圣书刻纹
    const ry = feetY - 3;
    g.fillStyle(0x8a7430, 0.3);
    g.fillEllipse(x, ry, 56, 17);
    g.lineStyle(2.4, c, 0.75);
    g.strokeEllipse(x, ry, 50, 15);
    g.lineStyle(1, a, 0.5);
    g.strokeEllipse(x, ry, 34, 10);
    for (let k = 0; k < 8; k++) { // 石砖缝刻纹
      const ang = (k / 8) * TAU;
      const px = x + Math.cos(ang) * 25, py = ry + Math.sin(ang) * 6.6;
      g.fillStyle(a, 0.6);
      g.fillRect(px - 1.2, py - 0.5, 2.4, 1);
    }
    const ang = now / 1100; // 圣甲虫滚着日轮绕环
    const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 5.6;
    g.fillStyle(0x3a5a8a, 0.95);
    g.fillEllipse(px - 3, py - 1, 6, 4);
    g.fillStyle(0xffd45c, 0.95);
    g.fillCircle(px + 3, py - 1, 2.6);
    g.fillStyle(0xfff6d8, 0.7);
    g.fillCircle(px + 3, py - 1, 1.2);
    for (let k = 0; k < 4; k++) { // 沙漏光（细沙从环上漏下）
      const ph = (now / 1000 + k / 4) % 1;
      g.fillStyle(0xe8c88a, 0.6 * (1 - ph));
      g.fillCircle(x - 14 + k * 10 + Math.sin(ph * 4 + k) * 2, ry - ph * 14, 1 * (1 - ph) + 0.3);
    }
    const gl = 0.4 + 0.3 * Math.sin(now / 400); // 环心符文呼吸
    g.fillStyle(a, gl);
    g.fillEllipse(x, ry, 10, 3.4);
  } },
  njaRing: { c: 0xb08ad0, a: 0xdfe8f5, draw: (g, now, x, feetY, c, a) => {
    // 结印地环：脚下忍术结印阵——紫印阵 + 五枚旋转手印符 + 灼烧痕 + 查克拉斯火
    const ry = feetY - 3;
    const p1 = 0.5 + 0.5 * Math.sin(now / 380);
    g.fillStyle(c, 0.14 + p1 * 0.06);
    g.fillEllipse(x, ry, 54, 16);
    g.lineStyle(2.2, c, 0.8);
    g.strokeEllipse(x, ry, 48, 14);
    g.lineStyle(1, a, 0.5);
    g.strokeEllipse(x, ry, 26, 8);
    for (let k = 0; k < 5; k++) { // 五枚手印符（旋转的指痕符号）
      const ang = now / 1600 + (k / 5) * TAU;
      const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 5.8;
      const gl = 0.5 + 0.5 * Math.abs(Math.sin(now / 320 + k));
      g.lineStyle(1.4, k % 2 ? a : c, gl);
      g.beginPath();
      g.moveTo(px - 2.4, py + 1.6); g.lineTo(px, py - 2.2); g.lineTo(px + 2.4, py + 1.6);
      g.moveTo(px, py - 2.2); g.lineTo(px, py + 1.6);
      g.strokePath();
    }
    for (let k = 0; k < 3; k++) { // 灼烧痕（阵上焦痕随阵光呼吸）
      const px = x - 14 + k * 14;
      g.fillStyle(0x0c0c12, 0.3 + p1 * 0.15);
      g.fillEllipse(px, ry + 2, 8, 2.6);
    }
    for (let k = 0; k < 4; k++) { // 查克拉斯火（紫焰从阵上升起）
      const ph = (now / 700 + k / 4) % 1;
      const fx = x - 15 + k * 10;
      g.fillStyle(k % 2 ? c : 0xd8b0ff, 0.7 * Math.sin(ph * Math.PI));
      g.fillTriangle(fx - 2.4, ry + 1, fx + 2.4, ry + 1, fx + Math.sin(now / 90 + k) * 1.4, ry + 1 - ph * 14);
    }
    for (let k = 0; k < 3; k++) { // 阵上烟丝
      const ph = (now / 1200 + k / 3) % 1;
      g.fillStyle(a, 0.4 * (1 - ph));
      g.fillCircle(x - 10 + k * 10, ry - ph * 20, 1.3 * (1 - ph) + 0.4);
    }
  } },
};
