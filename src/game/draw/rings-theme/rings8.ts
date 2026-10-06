import { TAU, type RingArt } from './shared';

/** 批七主题地环（赛博都市 / 东海龙宫 / 时空旅行）。(x, feetY) 原点，地面基准 y = feetY - 3。 */
export const RINGS_8: Record<string, RingArt> = {
  cybRing: { c: 0x39ffd0, a: 0xff3bd4, draw: (g, now, x, feetY, c, a) => {
    // 光缆地环：脚下发光光缆环——双缆环 + 流动脉冲 + 接口盒 + 故障闪
    const ry = feetY - 3;
    const p1 = 0.5 + 0.5 * Math.sin(now / 350);
    g.fillStyle(c, 0.12 + p1 * 0.05);
    g.fillEllipse(x, ry, 56, 17);
    g.lineStyle(2.6, c, 0.8);
    g.strokeEllipse(x, ry, 50, 15);
    g.lineStyle(1.4, a, 0.6);
    g.strokeEllipse(x, ry, 34, 10);
    for (let k = 0; k < 6; k++) { // 沿缆跑的双色脉冲
      const ang = now / 600 + (k / 6) * TAU;
      const px = x + Math.cos(ang) * 25, py = ry + Math.sin(ang) * 6.4;
      g.fillStyle(k % 2 ? a : c, 0.9);
      g.fillCircle(px, py, 1.8);
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(px, py, 0.8);
    }
    g.fillStyle(0x39424e, 1); // 环前接口盒
    g.fillRect(x - 8, ry - 2, 16, 6);
    g.fillStyle(0xff5a5c, Math.abs(Math.sin(now / 200))); // 盒上告警灯
    g.fillCircle(x - 3, ry + 1, 1);
    g.fillStyle(a, Math.abs(Math.cos(now / 200)));
    g.fillCircle(x + 3, ry + 1, 1);
    if (Math.sin(now / 170) > 0.92) { // 偶发故障闪
      g.fillStyle(0xffffff, 0.5);
      g.fillRect(x - 24, ry - 1, 48, 2.4);
    }
  } },
  dgRing: { c: 0x7fd4ff, a: 0x5affd0, draw: (g, now, x, feetY, c, _a) => {
    // 泡泡地环：脚下水晶宫泡泡环——水环 + 泡泡链 + 游鱼掠过 + 波光
    const ry = feetY - 3;
    g.fillStyle(c, 0.2);
    g.fillEllipse(x, ry, 54, 16);
    g.lineStyle(2.2, c, 0.75);
    g.strokeEllipse(x, ry, 48, 14);
    g.lineStyle(1, 0xffffff, 0.5);
    g.strokeEllipse(x, ry, 30, 9);
    for (let k = 0; k < 6; k++) { // 环上泡泡链（成串小泡上升）
      const ang = (k / 6) * TAU + now / 2400;
      const bx = x + Math.cos(ang) * 23, by = ry + Math.sin(ang) * 5;
      for (let s = 0; s < 3; s++) {
        const ph = (now / 800 + s / 3) % 1;
        g.lineStyle(1, 0xffffff, 0.5 * (1 - ph));
        g.strokeCircle(bx + Math.sin(ph * 4 + k) * 2, by - ph * 16, 1.2 + ph + (s % 2) * 0.6);
      }
    }
    for (let k = 0; k < 2; k++) { // 掠过的小鱼
      const ph = (now / 2200 + k / 2) % 1;
      const fx = x - 24 + ph * 48, fy = ry + Math.sin(ph * 6 + k * 3) * 3;
      g.fillStyle(k ? 0xff8a5c : 0xffd45c, 0.8);
      g.fillEllipse(fx, fy, 6, 2.6);
      g.fillTriangle(fx - 3, fy, fx - 5.4, fy - 2, fx - 5.4, fy + 2);
    }
    for (let k = 0; k < 4; k++) { // 环面波光（流动亮斑）
      const ph = (now / 900 + k / 4) % 1;
      g.fillStyle(0xffffff, 0.4 * Math.sin(ph * Math.PI));
      g.fillEllipse(x - 20 + ph * 40, ry + 3, 6, 1.8);
    }
  } },
  chronoRing: { c: 0xffd45c, a: 0x9b5cff, draw: (g, now, x, feetY, c, a) => {
    // 轮回地环：脚下巨大的钟面轮回——钟盘 + 反转指针 + 十二时标 + 时隙涟漪
    const ry = feetY - 3;
    g.fillStyle(c, 0.18);
    g.fillEllipse(x, ry, 58, 18);
    g.lineStyle(2.6, c, 0.8);
    g.strokeEllipse(x, ry, 52, 16);
    g.lineStyle(1.2, a, 0.6);
    g.strokeEllipse(x, ry, 34, 10.4);
    for (let k = 0; k < 12; k++) { // 十二时标（沿环， roman 意象刻度）
      const ang = (k / 12) * TAU;
      const px = x + Math.cos(ang) * 26, py = ry + Math.sin(ang) * 7;
      g.fillStyle(k % 3 === 0 ? a : 0xfff0b0, 0.85);
      g.fillRect(px - 1, py - 1, 2, 2);
    }
    for (let k = 0; k < 2; k++) { // 反转双指针（时针分针逆转）
      const ang = -now / (k ? 900 : 4500);
      const len = k ? 12 : 7;
      g.lineStyle(1.8, k ? a : 0xfff0b0, 0.9);
      g.lineBetween(x, ry, x + Math.cos(ang) * len, ry + Math.sin(ang) * len * 0.36);
    }
    g.fillStyle(0xffffff, 0.85); // 轴心
    g.fillCircle(x, ry, 1.6);
    const ripple = (now / 1400) % 1; // 时隙涟漪（周期荡开的紫色环）
    g.lineStyle(1.6 * (1 - ripple) + 0.4, a, 0.5 * (1 - ripple));
    g.strokeEllipse(x, ry, 20 + ripple * 44, 6 + ripple * 13);
  } },
};
