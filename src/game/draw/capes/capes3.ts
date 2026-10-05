import { cpoly, cline, type CapeArt } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第三批主题披风（火山 / 深海沟 / 剑道 / 水墨 / 精灵 / 赛车 / 吸血鬼 / 秋日 / 竹林 / 小丑） */
export const CAPES_3: Record<string, CapeArt> = {
  vulcCloak: { c: 0x3a2a2a, a: 0xff5a1a, draw: (g, now, sway, c, a) => {
    // 岩浆斗篷：黑曜斗篷 + 裂缝透光
    cpoly(g, [[-24, 0], [24, 0], [28 + sway, 80], [-28 + sway, 80]], c, 0.96);
    g.lineStyle(2, a, 0.6 + 0.3 * Math.sin(now / 220));
    cline(g, [[-12, 10], [-2, 34], [-10, 58]], 2, a, 0.7);
    cline(g, [[10, 14], [16, 40], [8, 66]], 2, a, 0.7);
  } },
  trenchCloak: { c: 0x1a2a4a, a: 0x5affd8, draw: (g, now, sway, c, a) => {
    // 海妖斗篷：深渊袍 + 发光吸盘边
    cpoly(g, [[-24, 0], [24, 0], [30 + sway, 80], [-30 + sway, 80]], c, 0.95);
    for (let k = 0; k < 6; k++) {
      const gl = 0.4 + 0.5 * Math.sin(now / 300 + k * 2);
      g.fillStyle(a, gl);
      g.fillCircle(-18 + k * 7.4 + sway * 0.4, 72 - Math.abs(k - 2.5) * 6, 2.4);
    }
  } },
  dojoCloak: { c: 0x2a3a6a, a: 0xffffff, draw: (g, now, sway, c, a) => {
    // 龙旗斗篷：蓝袍 + 白龙纹
    cpoly(g, [[-24, 0], [24, 0], [28 + sway, 80], [-28 + sway, 80]], c, 0.95);
    g.lineStyle(2.4, a, 0.9);
    g.beginPath();
    g.moveTo(-10 + sway * 0.2, 16);
    g.lineTo(2, 30); g.lineTo(-6, 44); g.lineTo(8, 58); g.lineTo(-2, 70);
    g.strokePath();
    g.fillStyle(a, 0.9); g.fillCircle(-10 + sway * 0.2, 14, 2.6); // 龙头
  } },
  inkwCloak: { c: 0xf5f0e4, a: 0x2a2a30, draw: (g, now, sway, c, a) => {
    // 泼墨斗篷：白袍 + 泼溅墨点
    cpoly(g, [[-22, 0], [22, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.96);
    const drops: Array<[number, number, number]> = [[-10, 20, 5], [6, 34, 7], [-2, 52, 4], [12, 64, 6]];
    for (const [dx, dy, r] of drops) {
      g.fillStyle(a, 0.9);
      g.fillCircle(dx + sway * 0.3, dy, r);
      g.fillStyle(a, 0.35);
      g.fillCircle(dx + sway * 0.3 + r * 0.8, dy + r * 0.5, r * 0.5); // 溅沫
    }
  } },
  fairyCloak: { c: 0x7ed957, a: 0xffb7d5, draw: (g, now, sway, c, a) => {
    // 藤蔓斗篷：藤蔓盘绕 + 小花
    cpoly(g, [[-22, 0], [22, 0], [24 + sway, 78], [-24 + sway, 78]], c, 0.85);
    g.lineStyle(2.4, 0x4a8a3a, 0.95);
    g.beginPath();
    for (let s = 0; s <= 12; s++) {
      const u = s / 12;
      const px = Math.sin(u * 5 + now / 900) * 10;
      const py = u * 76;
      if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.strokePath();
    for (let k = 0; k < 3; k++) {
      g.fillStyle(a, 0.95);
      g.fillCircle(Math.sin(k * 2.4) * 10, 16 + k * 24, 3.4);
    }
  } },
  racerCloak: { c: 0x22222a, a: 0xf0f0f0, draw: (g, now, sway, c, a) => {
    // 格子旗斗篷：黑白格
    cpoly(g, [[-24, 0], [24, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.96);
    for (let r = 0; r < 6; r++) for (let k = 0; k < 4; k++) {
      if ((r + k) % 2) continue;
      g.fillStyle(a, 0.92);
      g.fillRect(-20 + k * 11, 6 + r * 11.5, 11, 11.5);
    }
  } },
  vampCloak: { c: 0x1a1420, a: 0x8a1a2a, draw: (g, now, sway, c, a) => {
    // 血雾斗篷：黑袍立领 + 血色内衬
    cpoly(g, [[-26, 0], [26, 0], [34 + sway, 82], [-34 + sway, 82]], c, 0.97);
    cpoly(g, [[-10, 0], [10, 0], [14 + sway * 0.5, 70], [-14 + sway * 0.5, 70]], a, 0.55);
    g.fillStyle(a, 0.8); g.fillRect(-26, -6, 52, 6); // 立领
  } },
  autumnCloak: { c: 0xc95a2a, a: 0xd88a2a, draw: (g, now, sway, c, a) => {
    // 落叶斗篷：橙袍 + 一路落叶
    cpoly(g, [[-22, 0], [22, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.92);
    for (let k = 0; k < 5; k++) {
      const ph = (now / 1200 + k / 5) % 1;
      g.fillStyle(k % 2 ? a : 0xffd45c, 0.9 * Math.sin(ph * Math.PI));
      g.save();
      g.translateCanvas(-16 + k * 8 + sway * 0.4, 12 + ph * 58);
      g.rotateCanvas(Math.sin(now / 500 + k) * 0.8);
      g.fillEllipse(0, 0, 6, 3.4);
      g.restore();
    }
  } },
  pandaCloak: { c: 0x8a9a5a, a: 0x4a6a2a, draw: (g, now, sway, c, a) => {
    // 竹帘斗篷：一根根竹帘条
    for (let k = 0; k < 6; k++) {
      const px = -20 + k * 8;
      g.fillStyle(k % 2 ? c : a, 0.95);
      g.fillRect(px - 2.6, 0, 5.2, 74 + Math.sin(now / 420 + k) * 2 + sway * 0.2);
      g.fillStyle(0x3a5a1a, 0.8);
      g.fillRect(px - 2.6, 2, 5.2, 2); // 穿绳
    }
    g.fillStyle(0x3a5a1a, 0.9); g.fillRect(-22, 0, 44, 3);
  } },
  jokerCloak: { c: 0x8a2ab4, a: 0xffd45c, draw: (g, now, sway, c, a) => {
    // 王牌斗篷：紫袍 + 金星内衬
    cpoly(g, [[-24, 0], [24, 0], [30 + sway, 80], [-30 + sway, 80]], c, 0.95);
    for (let k = 0; k < 5; k++) {
      const px = -12 + (k % 3) * 12, py = 20 + Math.floor(k / 3) * 26;
      g.fillStyle(a, 0.9);
      g.fillRect(px - 2, py - 0.8, 4, 1.6); g.fillRect(px - 0.8, py - 2, 1.6, 4);
    }
    cline(g, [[-24, 0], [-30 + sway, 80]], 2, a, 0.8);
    cline(g, [[24, 0], [30 + sway, 80]], 2, a, 0.8);
  } },
  // ==== 第三批主题的 2★ 披风（逐件按名字独立画） ====
  shanCapeScale: { c: 0x2f8a6a, a: 0xbfe8d8, draw: (g, now, sway, c, a) => {
    // 鳞光披风：青玉鳞排 + 鳞缘泛光
    cpoly(g, [[-24, 0], [24, 0], [28 + sway, 78], [-28 + sway, 78]], c, 0.96);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 6 - r; k++) {
      g.fillStyle(a, 0.35 + (r % 2) * 0.2);
      g.fillEllipse(-15 + k * 11 + (r % 2) * 5 + sway * 0.2, 16 + r * 15, 10, 6);
    }
  } },
  shanCapeMist: { c: 0xbfe8d8, a: 0xffffff, draw: (g, now, sway, c, a) => {
    // 瀛洲雾纱：半透雾纱两层 + 一抹山影
    cpoly(g, [[-26, 0], [26, 0], [32 + sway, 78], [-32 + sway, 78]], c, 0.5);
    cpoly(g, [[-18, 4], [18, 4], [24 + sway * 0.7, 64], [-24 + sway * 0.7, 64]], 0xffffff, 0.35);
    g.fillStyle(0x8ab0a0, 0.4);
    g.fillTriangle(-10 + sway * 0.3, 52, 0 + sway * 0.3, 34, 10 + sway * 0.3, 52);
  } },
  vulcCape: { c: 0x5a3a2a, a: 0xff5a1a, draw: (g, now, sway, c, a) => {
    // 焦土披风：焦黑披风 + 裂缝火光 + 落灰
    cpoly(g, [[-24, 0], [24, 0], [28 + sway, 78], [-28 + sway, 78]], c, 0.96);
    for (let k = 0; k < 3; k++) {
      const px = -12 + k * 12;
      g.lineStyle(2.2, a, 0.55 + 0.35 * Math.sin(now / 300 + k));
      cline(g, [[px + sway * 0.2, 16 + k * 5], [px + 3 + sway * 0.2, 40 + k * 8]], 2.2, a, 0.8);
    }
  } },
  trenchCape: { c: 0x0d4258, a: 0x2a6a7a, draw: (g, now, sway, c, a) => {
    // 水幕披风：深海色水幕 + 一路下落的水线
    cpoly(g, [[-24, 0], [24, 0], [28 + sway, 78], [-28 + sway, 78]], c, 0.92);
    for (let k = 0; k < 5; k++) {
      const px = -16 + k * 8;
      const yy = ((now / 6 + k * 40) % 60) + 12;
      cline(g, [[px + sway * 0.3, yy], [px + sway * 0.3, yy + 7]], 1.6, a, 0.7);
    }
  } },
  dojoCape: { c: 0xf0eee4, a: 0xe8404a, draw: (g, now, sway, c, a) => {
    // 修行披风：白修行衣 + 一道红腰带 + 汗渍淡纹
    cpoly(g, [[-23, 0], [23, 0], [25 + sway, 76], [-25 + sway, 76]], c, 0.97);
    g.fillStyle(a, 0.92);
    g.fillRect(-23, 30, 46, 6);
    g.lineStyle(1.4, 0xb0aca0, 0.5);
    cline(g, [[-14 + sway * 0.2, 46], [-14 + sway * 0.2, 64]], 1.4, 0xb0aca0, 0.4);
  } },
  inkwCape: { c: 0xe8e4d8, a: 0x2a2e36, draw: (g, now, sway, c, a) => {
    // 素衫披风：素白衫 + 一道浓墨自肩而下晕开
    cpoly(g, [[-23, 0], [23, 0], [25 + sway, 76], [-25 + sway, 76]], c, 0.96);
    cpoly(g, [[-3, 6], [3, 6], [7 + sway * 0.4, 54], [-7 + sway * 0.4, 54]], a, 0.75);
    g.fillStyle(a, 0.5);
    g.fillCircle(4 + sway * 0.4, 58, 4.4);
  } },
  fairyCape: { c: 0xffb7d5, a: 0x5aa85a, draw: (g, now, sway, c, a) => {
    // 花瓣披风：层叠花瓣自上而下 + 叶点
    for (let r = 0; r < 4; r++) {
      const w = 20 + r * 2;
      for (let k = 0; k < 3; k++) {
        g.fillStyle(r % 2 ? 0xffc4da : c, 0.9);
        g.fillEllipse(-14 + k * 14 + (r % 2) * 7, 14 + r * 15 + sway * 0.2, 13, 8);
      }
    }
    for (let k = 0; k < 3; k++) {
      g.fillStyle(a, 0.8);
      g.fillEllipse(-10 + k * 10, 8, 5, 3);
    }
  } },
  racerCape: { c: 0xe8404a, a: 0x1e222a, draw: (g, now, sway, c, a) => {
    // 车队披风：红披风 + 黑白条纹肩带 + 号码圆
    cpoly(g, [[-22, 0], [22, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.96);
    for (let k = 0; k < 4; k++) g.fillRect(-22, 6 + k * 6, 44, 2.4);
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(0, 42, 7);
    g.fillStyle(a, 0.95);
    g.fillRect(-3.4, 37, 6.8, 10);
  } },
  vampCape: { c: 0x1a1420, a: 0x4a1a4a, draw: (g, now, sway, c, a) => {
    // 高领披风：立领 + 暗紫内衬 + 下摆尖角
    g.fillStyle(c, 0.97);
    g.fillRect(-8, -12, 16, 12); // 立领
    cpoly(g, [[-24, 0], [24, 0], [26 + sway, 62], [13 + sway, 76], [0 + sway, 60], [-13 + sway, 76], [-26 + sway, 62]], c, 0.97);
    cpoly(g, [[-20, 10], [20, 10], [22 + sway, 56], [-22 + sway, 56]], a, 0.8);
  } },
  autumnCape: { c: 0xd8b070, a: 0xd4622a, draw: (g, now, sway, c, a) => {
    // 麦束披风：麦色披风 + 麦穗纹一束束垂下
    cpoly(g, [[-23, 0], [23, 0], [26 + sway, 76], [-26 + sway, 76]], c, 0.96);
    for (let k = 0; k < 4; k++) {
      const px = -14 + k * 9;
      cline(g, [[px, 18], [px + Math.sin(now / 420 + k) * 3 + sway * 0.3, 58]], 2, a, 0.85);
      for (let s = 0; s < 3; s++) {
        g.fillStyle(a, 0.8);
        g.fillEllipse(px + sway * 0.3, 52 - s * 6, 3, 7);
      }
    }
  } },
  pandaCape: { c: 0x8a6a4a, a: 0x5f8a3a, draw: (g, now, sway, c, a) => {
    // 蓑衣披风：一层层草编披挂 + 草缘
    for (let r = 0; r < 4; r++) {
      cpoly(g, [[-24 + r * 2, 8 + r * 16], [24 - r * 2, 8 + r * 16], [26 - r * 2 + sway * (0.2 + r * 0.15), 22 + r * 16], [-26 + r * 2 + sway * (0.2 + r * 0.15), 22 + r * 16]], r % 2 ? a : c, 0.9);
    }
    cpoly(g, [[-10, -4], [10, -4], [14, 8], [-14, 8]], c, 0.95);
  } },
  jokerCape: { c: 0x8a2a6a, a: 0x4a2a8a, draw: (g, now, sway, c, a) => {
    // 魔术披风：紫披风 + 菱格 + 两个内衬尖角
    cpoly(g, [[-24, 0], [24, 0], [30 + sway, 78], [-30 + sway, 78]], c, 0.96);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) {
      if ((r + k) % 2) continue;
      g.fillStyle(a, 0.55);
      g.fillTriangle(-15 + k * 10 + sway * 0.2, 18 + r * 16, -9 + k * 10 + sway * 0.2, 12 + r * 16, -3 + k * 10 + sway * 0.2, 18 + r * 16);
    }
    for (let k = 0; k < 2; k++) {
      g.fillStyle(0xe8404a, 0.9);
      g.fillTriangle(-12 + k * 24, -2, -8 + k * 24, -2, -10 + k * 24, -10);
    }
  } },
};
