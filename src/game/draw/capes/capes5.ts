import { cpoly, cline, type CapeArt } from './shared';

/**
 * 第五批披风——老款迁移精绘（flame / cloth / antigrav / towel 系）。
 * 从 (0,0) 肩锚垂到 y≈80，左右 ±24；sway = 底部摆动量。
 */
export const CAPES_5: Record<string, CapeArt> = {
  // 龙炎披风：焦鳞底 + 岩浆裂缝脉冲
  dragonfire: { c: 0x4a2018, a: 0xff5a1a, draw: (g, now, sway, c, a) => {
    cpoly(g, [[0, 0], [14, 8], [20, 40 + sway * 0.4], [12, 78], [-14, 76], [-20, 38], [-12, 6]], c, 1);
    const p = 0.5 + 0.5 * Math.sin(now / 240);
    cline(g, [[4, 6], [12, 30], [6, 52], [14, 74 + sway * 0.4]], 1.8, a, 0.3 + p * 0.4);
    cline(g, [[-6, 8], [-12, 34], [-6, 56]], 1.4, a, 0.25 + p * 0.35);
    g.fillStyle(a, p * 0.5);
    g.fillCircle(10, 30, 1.8);
    g.fillCircle(-10, 44, 1.4);
  } },
  // 烈焰披风：焰缘下摆（火舌跳）+ 内焰
  emberCape: { c: 0xe8562a, a: 0xffd45c, draw: (g, now, sway, c, a) => {
    cpoly(g, [[0, 0], [16, 10], [22, 44 + sway * 0.3], [10, 74], [-12, 72], [-20, 40], [-14, 8]], c, 0.95);
    cpoly(g, [[0, 4], [10, 14], [14, 42 + sway * 0.3], [4, 66], [-10, 62], [-14, 36]], 0xff8a3c, 0.7);
    for (let k = 0; k < 4; k++) {
      const fl = Math.sin(now / 120 + k * 2) * 3;
      cpoly(g, [[6 + k * 5, 66 + sway * 0.3], [8.5 + k * 5, 74 + fl + sway * 0.5], [11 + k * 5, 66 + sway * 0.3]], k % 2 ? a : 0xfff0b0, 0.8);
    }
  } },
  // 金焰披风：金焰边（沿摆缘一排跳金舌）
  goldenflame: { c: 0x8a5a1a, a: 0xffd45c, draw: (g, now, sway, c, a) => {
    cpoly(g, [[0, 0], [15, 8], [21, 42 + sway * 0.3], [11, 76], [-13, 74], [-21, 40], [-13, 8]], c, 1);
    for (let k = 0; k < 5; k++) {
      const fl = Math.sin(now / 130 + k * 1.8) * 4;
      const bx = -18 + k * 9;
      const by = 72 - Math.abs(bx) * 0.15;
      cpoly(g, [[bx - 4, by], [bx, by - 14 + fl], [bx + 4, by]], k % 2 ? a : 0xfff0b0, 0.85);
    }
    cline(g, [[0, 0], [15, 8], [21, 42 + sway * 0.3]], 1.6, a, 0.7);
  } },
  // 凤凰披风：羽尾（三列羽 + 金羽梢）
  phoenixCape: { c: 0xe8562a, a: 0xffd45c, draw: (g, now, sway, c, a) => {
    cpoly(g, [[0, 0], [15, 8], [18, 44 + sway * 0.3], [8, 76], [-12, 74], [-18, 40], [-13, 8]], c, 0.95);
    for (let k = 0; k < 3; k++) {
      const bx = -8 + k * 8;
      cpoly(g, [[bx - 4, 34 + sway * 0.2], [bx, 72 + sway * 0.4], [bx + 4, 34 + sway * 0.2]], k % 2 ? 0xd8482a : c, 0.9);
      g.fillStyle(a, 0.9);
      g.fillCircle(bx, 70 + sway * 0.4, 2.2);
    }
    // 上飘火羽
    for (let k = 0; k < 3; k++) {
      const ph = (now / 600 + k / 3) % 1;
      g.fillStyle(a, 0.6 * (1 - ph));
      g.fillCircle(6 + k * 6, 20 - ph * 14, 1.6 * (1 - ph) + 0.6);
    }
  } },
  // 龙鳞披风：叠鳞排（三层弧鳞 + 鳞尖描边）
  dragonCape: { c: 0x3f6a3f, a: 0xd9b45c, draw: (g, _now, sway, c, a) => {
    cpoly(g, [[0, 0], [15, 8], [19, 42 + sway * 0.3], [10, 76], [-13, 74], [-19, 40], [-13, 8]], c, 1);
    for (let r = 0; r < 3; r++) {
      const yy = 22 + r * 18;
      g.lineStyle(1.6, a, 0.55);
      for (let k = -2; k <= 2; k++) {
        g.beginPath();
        g.arc(k * 8, yy + Math.abs(k) * 2, 6.4, Math.PI * 0.15, Math.PI * 0.85, false, 0);
        g.strokePath();
      }
    }
    cline(g, [[0, 0], [15, 8], [19, 42 + sway * 0.3], [10, 76]], 1.6, a, 0.6);
  } },
  // 冰晶披风：冰蓝披 + 下缘冰凌（挂霜闪光）
  frostCape: { c: 0x9ad4ee, a: 0xffffff, draw: (g, now, sway, c, a) => {
    cpoly(g, [[0, 0], [15, 8], [20, 42 + sway * 0.3], [10, 72], [-12, 70], [-19, 40], [-13, 8]], c, 0.9);
    cpoly(g, [[0, 4], [9, 12], [13, 40 + sway * 0.3], [4, 62], [-10, 60], [-13, 36]], 0xe0f2ff, 0.45);
    for (let k = 0; k < 5; k++) {
      const bx = -14 + k * 7;
      const icy = 68 - Math.abs(bx) * 0.2 + sway * 0.3;
      cpoly(g, [[bx - 2.4, icy], [bx, icy + 9 + (k % 2) * 3], [bx + 2.4, icy]], 0xe8f6ff, 0.9);
    }
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 350));
    g.fillStyle(a, tw * 0.8);
    g.fillCircle(8, 20, 1.6);
    g.fillCircle(-9, 34, 1.4);
  } },
  // 英雄披风：经典红披（金扣 + 摆缘描边 + 高光）
  hero: { c: 0xc0392b, a: 0xffd45c, draw: (g, _now, sway, c, a) => {
    cpoly(g, [[0, 0], [16, 8], [22, 44 + sway * 0.3], [12, 78], [-14, 76], [-22, 42], [-16, 8]], c, 1);
    cpoly(g, [[0, 2], [10, 10], [13, 42 + sway * 0.3], [4, 68], [-11, 66], [-15, 38]], 0xd8584a, 0.55);
    cline(g, [[0, 0], [16, 8], [22, 44 + sway * 0.3], [12, 78]], 2, a, 0.85);
    g.fillStyle(a, 1);
    g.fillCircle(0, 3, 3.4);
    g.fillStyle(0xffffff, 0.35);
    g.fillCircle(-1, 2, 1.4);
  } },
  // 海涛披风：浪纹披（三道浪层 + 浪花点）
  ocean: { c: 0x2a7ab4, a: 0x9ffcf0, draw: (g, now, sway, c, a) => {
    cpoly(g, [[0, 0], [15, 8], [20, 42 + sway * 0.3], [11, 76], [-13, 74], [-20, 40], [-14, 8]], c, 0.95);
    for (let k = 0; k < 3; k++) {
      g.lineStyle(2.4, k % 2 ? a : 0xffffff, 0.6 - k * 0.1);
      g.beginPath();
      for (let s = 0; s <= 5; s++) {
        const u = s / 5;
        const px = -16 + u * 32;
        const py = 24 + k * 16 + Math.sin(u * 6 + now / 300 + k) * 3 + sway * 0.2 * u;
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokePath();
    }
    for (let k = 0; k < 3; k++) {
      const ph = (now / 500 + k / 3) % 1;
      g.fillStyle(0xffffff, 0.5 * (1 - ph));
      g.fillCircle(-8 + k * 8, 60 - ph * 10, 1.4);
    }
  } },
  // 反重力披风：下摆上飘（披风倒着扬 + 粒子上吸）
  antigrav: { c: 0x8a5aff, a: 0xd8c8ff, draw: (g, now, sway, c, a) => {
    cpoly(g, [[0, 30], [16, 16], [22, -14 + sway * 0.3], [10, -52], [-13, -48], [-21, -12], [-15, 18]], c, 0.95);
    cpoly(g, [[0, 26], [10, 14], [14, -12 + sway * 0.3], [4, -42], [-11, -38], [-15, -10]], a, 0.35);
    for (let k = 0; k < 4; k++) {
      const ph = (now / 600 + k / 4) % 1;
      g.fillStyle(a, 0.6 * (1 - ph));
      g.fillCircle(-10 + k * 7, 20 - ph * 46, 1.8 * (1 - ph) + 0.6);
    }
  } },
  // 迅雷披风：雷纹披（电弧走线 + 闪光）
  thunderCape: { c: 0x3a4a5c, a: 0xffe89a, draw: (g, now, sway, c, a) => {
    cpoly(g, [[0, 0], [15, 8], [20, 42 + sway * 0.3], [10, 76], [-13, 74], [-20, 40], [-14, 8]], c, 0.97);
    for (let k = 0; k < 2; k++) {
      if (Math.sin(now / 150 + k * 2.4) > -0.2) {
        cline(g, [[-6 + k * 12, 12], [2 + k * 10, 32], [-4 + k * 12, 50], [6 + k * 10, 70 + sway * 0.3]], 1.8, a, 0.9);
      }
    }
    g.fillStyle(0xffffff, 0.4 + 0.4 * Math.sin(now / 150));
    g.fillCircle(4, 32, 2);
  } },
  // 冠军毛巾：毛巾披（织纹条纹 + 汗珠 + 流苏）
  towel: { c: 0xf2ead8, a: 0xc0392b, draw: (g, _now, sway, c, a) => {
    cpoly(g, [[0, 0], [14, 6], [18, 42 + sway * 0.3], [9, 74], [-12, 72], [-18, 40], [-13, 6]], c, 1);
    for (let k = 0; k < 3; k++) g.fillRect(-17, 26 + k * 14, 34, 4);
    g.fillStyle(a, 0.95);
    g.fillRect(-17, 26, 34, 4);
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(-15, 8, 6, 60);
    // 流苏
    g.lineStyle(1.4, a, 0.9);
    for (let k = 0; k < 6; k++) g.lineBetween(-14 + k * 5.6, 74 + sway * 0.4, -14 + k * 5.6, 80 + sway * 0.4);
    // 汗珠
    g.fillStyle(0x9fd8ff, 0.8);
    g.fillCircle(10, 40, 1.6);
    g.fillCircle(8, 52, 1.2);
  } },
};
