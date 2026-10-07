import { TAU, type RingArt } from './shared';

/** 批十一主题地环（软泥秘境 / 妖猫夜行 / 甲虫王朝）——原点 (x, feetY) */

export const RINGS_12: Record<string, RingArt> = {
  slimeRing: { c: 0x7de87d, a: 0xd0ff9a, draw: (g, now, x, feetY, c, a) => {
    // 黏液坑地环：一滩晃动的绿黏液 + 内圈气泡 + 溅落滴
    const ry = feetY - 3;
    g.fillStyle(c, 0.4); // 外洼
    g.fillEllipse(x, ry, 52, 15);
    g.fillStyle(a, 0.45); // 内洼亮面
    g.fillEllipse(x, ry - 1, 38, 10);
    for (let k = 0; k < 4; k++) { // 液面气泡（鼓起-破裂循环）
      const ph = (now / 1100 + k * 0.26) % 1;
      const bx = x - 14 + k * 9, by = ry - 1 + Math.sin(k * 2.4) * 2.6;
      const br = ph < 0.8 ? ph * 3.4 : (1 - ph) * 10;
      g.fillStyle(0xffffff, 0.4 * (1 - ph));
      g.fillEllipse(bx, by - br * 0.4, br * 2, br * 1.2);
    }
    for (let k = 0; k < 3; k++) { // 空中坠落滴
      const ph = (now / 900 + k * 0.33) % 1;
      g.fillStyle(a, 0.6 * (1 - ph));
      g.fillEllipse(x - 16 + k * 16, ry - 22 + ph * 18, 2.6, 5);
    }
    g.lineStyle(1.4, a, 0.5); // 洼沿描边
    g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 7.4 / 26);
    g.beginPath(); g.arc(0, 0, 26, 0, TAU); g.strokePath(); g.restore();
  } },
  nekRing: { c: 0xb08aff, a: 0xffd45c, draw: (g, now, x, feetY, c, a) => {
    // 猫足迹环：一圈梅花猫爪印绕足旋转 + 中央妖火
    const ry = feetY - 3;
    g.fillStyle(c, 0.16); // 底晕
    g.fillEllipse(x, ry, 50, 14);
    for (let k = 0; k < 8; k++) { // 旋转爪印
      const ph = now / 2600 + (k / 8) * TAU;
      const px = x + Math.cos(ph) * 22;
      const py = ry + Math.sin(ph) * 6;
      const depth = 0.35 + 0.4 * (Math.sin(ph) * 0.5 + 0.5);
      g.fillStyle(c, depth); // 掌垫
      g.fillEllipse(px, py + 1.4, 4, 3);
      for (let t = 0; t < 4; t++) { // 四趾
        g.fillStyle(c, depth);
        g.fillEllipse(px - 2.4 + t * 1.6, py - 1.8 + Math.abs(t - 1.5) * 0.6, 1.3, 1.7);
      }
    }
    const flick = 0.7 + 0.3 * Math.sin(now / 140); // 中央妖火
    g.fillStyle(c, 0.5 * flick);
    g.fillCircle(x, ry - 4, 4.4);
    g.fillStyle(a, flick);
    g.fillCircle(x, ry - 4, 2.2);
    g.fillStyle(0xffffff, flick * 0.8);
    g.fillCircle(x, ry - 4.6, 0.9);
  } },
  btlRing: { c: 0xc8a832, a: 0x7dff5a, draw: (g, now, x, feetY, c, a) => {
    // 虫洞地环：地面裂开的六边形虫巢入口 + 内部幽光涌动
    const ry = feetY - 3;
    g.fillStyle(0x1a1408, 0.85); // 巢口深底
    g.fillEllipse(x, ry, 50, 14);
    const glow = 0.35 + 0.2 * Math.sin(now / 350); // 巢内幽光
    g.fillStyle(c, glow);
    g.fillEllipse(x, ry + 1, 38, 10);
    g.fillStyle(a, glow * 0.7); // 幽光核
    g.fillEllipse(x, ry + 1, 22, 6);
    // 巢口六边形沿边（分裂的石壳）
    g.fillStyle(0x3a2a10, 0.95);
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * TAU + Math.sin(now / 800 + k) * 0.04;
      const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 7;
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas(ang);
      g.fillRect(-4.6, -2.2, 9.2, 4.4);
      g.restore();
    }
    for (let k = 0; k < 3; k++) { // 巢内爬出的微光幼虫剪影
      const ph = (now / 2200 + k * 0.34) % 1;
      const wx = x - 14 + ph * 28, wy = ry - 1 + Math.sin(ph * 9 + k) * 1.6;
      g.fillStyle(a, 0.7 * Math.sin(ph * Math.PI));
      g.fillEllipse(wx, wy, 5, 2.2);
      g.fillStyle(0x1a1408, 0.6 * Math.sin(ph * Math.PI));
      g.fillCircle(wx + 2.6, wy - 0.6, 1.1);
    }
  } },
};
