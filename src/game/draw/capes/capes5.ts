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
  // 鳞甲披风：金属叠鳞（鳞片高光 + 铆钉边）
  scalecape: { c: 0x8a94a2, a: 0xffd45c, draw: (g, _now, sway, c, a) => {
    cpoly(g, [[0, 0], [15, 8], [19, 42 + sway * 0.3], [10, 76], [-13, 74], [-19, 40], [-14, 8]], c, 1);
    for (let r = 0; r < 4; r++) {
      const yy = 18 + r * 15;
      for (let k = -2; k <= 2; k++) {
        g.fillStyle(r % 2 ? 0x98a2b2 : 0x7a8492, 0.95);
        g.beginPath();
        g.arc(k * 8, yy + sway * 0.15 * r, 6, Math.PI * 0.1, Math.PI * 0.9, false, 0);
        g.closePath(); g.fillPath();
        g.fillStyle(0xffffff, 0.3);
        g.fillCircle(k * 8 - 2, yy - 2 + sway * 0.15 * r, 1.2);
      }
    }
    g.fillStyle(a, 0.85);
    for (let k = 0; k < 3; k++) g.fillCircle(-10 + k * 10, 10, 1.4);
  } },
  // 铁甲披风：甲片拼板（板缝 + 铆钉）
  ironclad: { c: 0x6a7482, a: 0xffd45c, draw: (g, _now, sway, c, a) => {
    cpoly(g, [[0, 0], [15, 8], [19, 42 + sway * 0.3], [10, 76], [-13, 74], [-19, 40], [-14, 8]], c, 1);
    for (let r = 0; r < 4; r++) {
      g.fillStyle(0x5a6472, 0.9);
      g.fillRect(-17 + r % 2, 14 + r * 15, 34 - Math.abs(r - 1.5) * 3, 12);
      g.lineStyle(1.4, 0x4a5462, 0.9);
      g.strokeRect(-17 + r % 2, 14 + r * 15, 34 - Math.abs(r - 1.5) * 3, 12);
    }
    g.fillStyle(a, 0.9);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) {
      g.fillCircle(-12 + k * 11, 20 + r * 15, 1.3);
    }
  } },
  // 翡翠长袍：玉色长袍（玉纹 + 流光 + 坠玉）
  jadeRobe: { c: 0x3f8a6a, a: 0xd9b45c, draw: (g, _now, sway, c, a) => {
    cpoly(g, [[0, 0], [16, 8], [20, 46 + sway * 0.3], [10, 80], [-13, 78], [-20, 42], [-14, 8]], c, 1);
    cpoly(g, [[0, 2], [9, 10], [12, 44 + sway * 0.3], [3, 70], [-11, 68], [-14, 38]], 0x5fae82, 0.6);
    cline(g, [[0, 2], [10, 12], [14, 46 + sway * 0.3]], 1.8, a, 0.8);
    g.lineStyle(1.2, a, 0.5);
    g.lineBetween(-8, 24, 8, 30);
    g.lineBetween(-7, 40, 7, 46);
    g.fillStyle(a, 0.95);
    g.fillCircle(0, 3, 3);
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(-1, 2.2, 1.2);
  } },
  // 龙翼披风：鳞翼披（翼骨收拢 + 膜）
  drakewing: { c: 0x2f6a3f, a: 0xd9b45c, draw: (g, now, sway, c, a) => {
    cpoly(g, [[0, 0], [15, 8], [20, 42 + sway * 0.3], [10, 76], [-13, 74], [-19, 40], [-14, 8]], c, 1);
    // 折拢的翼骨
    cline(g, [[0, 4], [14, 20], [10, 40]], 3.4, 0x24523a, 1);
    cline(g, [[2, 4], [18, 16], [16, 36]], 2.6, 0x24523a, 0.9);
    g.lineStyle(1.4, a, 0.6);
    g.lineBetween(0, 4, 14, 20);
    // 膜上鳞光
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300));
    g.fillCircle(8, 30, 2);
  } },
  // 王袍：紫金王袍（毛边领 + 金纹十字 + 垂坠）
  royal: { c: 0x5a2a8a, a: 0xffd45c, draw: (g, _now, sway, c, a) => {
    cpoly(g, [[0, 0], [17, 8], [21, 46 + sway * 0.3], [11, 80], [-14, 78], [-21, 44], [-15, 8]], c, 1);
    // 毛边领
    g.fillStyle(0xffd45c, 0.95);
    g.fillEllipse(-14, 8, 8, 14);
    g.fillEllipse(14, 8, 8, 14);
    g.fillStyle(0xf2ead8, 0.85);
    g.fillEllipse(-14, 8, 4, 9);
    g.fillEllipse(14, 8, 4, 9);
    // 金纹
    cline(g, [[0, 4], [0, 70 + sway * 0.3]], 1.6, a, 0.7);
    g.lineStyle(1.2, a, 0.5);
    g.lineBetween(-10, 28, 10, 34);
    g.lineBetween(-9, 44, 9, 50);
  } },
  // 法袍：法师星纹袍（符文点缀）
  mage: { c: 0x2a3a7a, a: 0xb46cff, draw: (g, now, sway, c, a) => {
    cpoly(g, [[0, 0], [16, 8], [20, 46 + sway * 0.3], [10, 80], [-13, 78], [-20, 44], [-14, 8]], c, 1);
    cline(g, [[0, 2], [0, 72 + sway * 0.3]], 1.4, a, 0.5);
    for (let k = 0; k < 4; k++) {
      const yy = 18 + k * 15, xx = k % 2 ? 6 : -6;
      g.fillStyle(a, 0.5 + 0.5 * Math.sin(now / 300 + k));
      g.fillRect(xx - 2, yy - 4, 4, 8);
      g.fillRect(xx - 4, yy - 2, 8, 4);
    }
    g.fillStyle(a, 0.9);
    g.fillCircle(0, 3, 2.6);
  } },
  // 冰侯披风：霜纹王袍（毛领结霜 + 冰纹）
  frostlord: { c: 0x8ab4d8, a: 0xffffff, draw: (g, now, sway, c, a) => {
    cpoly(g, [[0, 0], [17, 8], [21, 46 + sway * 0.3], [11, 80], [-14, 78], [-21, 44], [-15, 8]], c, 1);
    g.fillStyle(0xe8f4ff, 0.9);
    g.fillEllipse(-14, 8, 8, 13);
    g.fillEllipse(14, 8, 8, 13);
    // 冰纹（三道枝状）
    g.lineStyle(1.4, a, 0.7);
    for (let k = 0; k < 3; k++) {
      const bx = -8 + k * 8;
      cline(g, [[bx, 20 + k * 4], [bx + 3, 34 + k * 4], [bx - 2, 48 + k * 4]], 1.4, a, 0.7);
    }
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 320));
    g.fillStyle(a, tw * 0.7);
    g.fillCircle(6, 18, 1.6);
    g.fillCircle(-9, 52, 1.4);
  } },
  // 雷君披风：星毛披（黑毛底 + 金星芒 + 电花）
  stormlord: { c: 0x2a2a34, a: 0xffd45c, draw: (g, now, sway, c, a) => {
    cpoly(g, [[0, 0], [16, 8], [21, 46 + sway * 0.3], [11, 78], [-14, 76], [-21, 44], [-15, 8]], c, 1);
    // 星毛（金色星斑散布）
    for (let k = 0; k < 6; k++) {
      const sx = -12 + k * 5, sy = 20 + (k % 3) * 16;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 280 + k * 1.9));
      g.fillStyle(a, tw);
      g.fillRect(sx - 2, sy - 0.7, 4, 1.4);
      g.fillRect(sx - 0.7, sy - 2, 1.4, 4);
    }
    // 电花
    if (Math.sin(now / 160) > 0.3) {
      cline(g, [[-8, 40], [0, 30], [8, 44]], 1.6, a, 0.9);
    }
  } },
  // 绯红王袍：红灯笼穗王袍（灯笼列 + 金缘）
  crimsonlord: { c: 0xa8324a, a: 0xffd45c, draw: (g, now, sway, c, a) => {
    cpoly(g, [[0, 0], [17, 8], [21, 46 + sway * 0.3], [11, 80], [-14, 78], [-21, 44], [-15, 8]], c, 1);
    cline(g, [[0, 2], [0, 74 + sway * 0.3]], 1.6, a, 0.75);
    // 灯笼穗（三列小灯笼）
    for (let k = 0; k < 3; k++) {
      const lx = -10 + k * 10, ly = 30 + (k % 2) * 14 + Math.sin(now / 300 + k) * 2;
      g.lineStyle(1, a, 0.7);
      g.lineBetween(lx, ly - 8, lx, ly - 4);
      g.fillStyle(k % 2 ? 0xe84848 : c, 1);
      g.fillEllipse(lx, ly, 7, 9);
      g.fillStyle(0xffe89a, 0.8);
      g.fillEllipse(lx, ly, 2.6, 5);
    }
  } },
  // 战神披风：兽皮战披（毛边 + 缝线 + 战痕）
  warlord: { c: 0x6a4a2a, a: 0xd8c8a0, draw: (g, _now, sway, c, a) => {
    cpoly(g, [[0, 0], [15, 8], [20, 44 + sway * 0.3], [10, 76], [-13, 74], [-19, 42], [-14, 8]], c, 1);
    // 毛边（下缘锯齿）
    for (let k = 0; k < 6; k++) {
      const bx = -16 + k * 5.4;
      cpoly(g, [[bx - 2.4, 72 + sway * 0.4], [bx, 78 + sway * 0.4], [bx + 2.4, 72 + sway * 0.4]], c, 1);
    }
    // 缝线
    g.lineStyle(1.2, a, 0.6);
    g.lineBetween(-12, 24, 12, 30);
    g.lineBetween(-11, 48, 11, 54);
    // 战痕
    g.lineStyle(2, 0x3a2410, 0.8);
    g.lineBetween(-4, 38, 4, 46);
    g.fillStyle(a, 0.5);
    g.fillCircle(-8, 58, 2);
  } },
  // 冬雪披风：雪白毛披（绒毛边 + 雪花）
  winter: { c: 0xeaf2fa, a: 0x9ac8ee, draw: (g, now, sway, c, a) => {
    cpoly(g, [[0, 0], [15, 8], [20, 44 + sway * 0.3], [10, 76], [-13, 74], [-19, 42], [-14, 8]], c, 1);
    // 绒毛边
    g.fillStyle(0xffffff, 0.95);
    for (let k = 0; k < 6; k++) g.fillCircle(-15 + k * 6, 72 + sway * 0.4, 3);
    g.fillStyle(0xd0e4f2, 0.6);
    g.fillEllipse(-6, 30, 12, 20);
    for (let k = 0; k < 4; k++) {
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(now / 320 + k * 2));
      g.fillStyle(a, tw);
      g.fillRect(-10 + k * 7, 24 + (k % 2) * 18, 4.8, 1.4);
      g.fillRect(-8.2 + k * 7, 22.2 + (k % 2) * 18, 1.4, 4.8);
    }
  } },
};
