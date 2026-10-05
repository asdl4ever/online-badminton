import { cpoly, cline, type CapeArt } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第二批主题披风（海盗 / 蒸汽 / 太空 / 侏罗纪 / 蘑菇 / 热带 / 墓地 / 节日 / 寿司 / 西部） */
export const CAPES_2: Record<string, CapeArt> = {
  pirateCloak: { c: 0xb08a5a, a: 0x2a3a5a, draw: (g, now, sway, c, a) => {
    // 藏宝图斗篷：羊皮地图披风 + 航线
    cpoly(g, [[-22, 0], [22, 0], [24 + sway, 78], [-24 + sway, 78]], 0xd8c09a, 0.95);
    cpoly(g, [[-22, 0], [22, 0], [24 + sway, 78], [-24 + sway, 78]], c, 0.25);
    g.lineStyle(1.6, a, 0.85);
    g.beginPath();
    g.moveTo(-12, 14);
    g.lineTo(2, 30); g.lineTo(-4, 44); g.lineTo(10, 62);
    g.strokePath();
    g.fillStyle(a, 0.9);
    g.fillRect(9, 60, 6, 1.6); g.fillRect(12, 56, 1.6, 6); // 终点 X
    g.fillStyle(0xc0392b, 0.9); g.fillCircle(-12, 14, 2.4);
  } },
  steamCloak: { c: 0x6a4a2a, a: 0x9aa7b8, draw: (g, now, sway, c, a) => {
    // 铆钉斗篷：皮革斗篷 + 一排铆钉
    cpoly(g, [[-24, 0], [24, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.95);
    cline(g, [[0, 4], [0 + sway * 0.8, 74]], 2.4, 0x4a3218, 0.8); // 中缝
    for (let k = 0; k < 5; k++) {
      g.fillStyle(a, 0.95);
      g.fillCircle(-8, 14 + k * 13, 2);
      g.fillCircle(8, 14 + k * 13, 2);
    }
  } },
  astroCloak: { c: 0x2a3a6a, a: 0xffd45c, draw: (g, now, sway, c, a) => {
    // 星图斗篷：深蓝袍 + 星座连线
    cpoly(g, [[-22, 0], [22, 0], [28 + sway, 80], [-28 + sway, 80]], c, 0.95);
    const stars: Array<[number, number]> = [[-12, 18], [4, 26], [-4, 44], [12, 52], [-8, 64]];
    g.lineStyle(1.2, a, 0.6);
    g.beginPath();
    g.moveTo(stars[0][0] + sway * 0.2, stars[0][1]);
    for (let k = 1; k < stars.length; k++) g.lineTo(stars[k][0] + sway * 0.2, stars[k][1]);
    g.strokePath();
    stars.forEach(([px, py]) => {
      g.fillStyle(a, 0.9);
      g.fillCircle(px + sway * 0.2, py, 1.8);
    });
  } },
  juraCloak: { c: 0x5a7a3a, a: 0x8aa84a, draw: (g, now, sway, c, a) => {
    // 蕨叶斗篷：层层蕨叶垂下来
    for (let k = 0; k < 5; k++) {
      const px = -16 + k * 8;
      cline(g, [[px, 2], [px + sway * (0.3 + k * 0.08), 74]], 2.4, 0x4a6a2a, 0.9);
      for (let s = 0; s < 4; s++) {
        const py = 12 + s * 15;
        g.fillStyle(s % 2 ? c : a, 0.9);
        g.fillEllipse(px - 4 + sway * 0.2, py, 8, 3.4);
        g.fillEllipse(px + 4 + sway * 0.2, py + 6, 8, 3.4);
      }
    }
  } },
  mushCloak: { c: 0x8a9a6a, a: 0xd95a4a, draw: (g, now, sway, c, a) => {
    // 菌丝斗篷：苔绿斗篷 + 伞盖镶边
    cpoly(g, [[-22, 0], [22, 0], [26 + sway, 76], [-26 + sway, 76]], c, 0.95);
    g.fillStyle(a, 0.85);
    for (let k = 0; k < 4; k++) {
      g.fillEllipse(-14 + k * 9 + sway * 0.3, 66, 10, 5); // 下摆的小菌盖
    }
    g.fillStyle(0xf0e0c0, 0.8);
    g.fillCircle(-6, 30, 2); g.fillCircle(8, 44, 2.4); // 斑点
  } },
  tropicCloak: { c: 0x3ac8c8, a: 0xffffff, draw: (g, now, sway, c, a) => {
    // 泡沫斗篷：海水绿披风 + 上浮的泡沫
    cpoly(g, [[-22, 0], [22, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.8);
    for (let k = 0; k < 6; k++) {
      const ph = (now / 900 + k / 6) % 1;
      g.fillStyle(a, 0.8 * (1 - ph));
      g.fillCircle(-14 + (k % 3) * 14, 70 - ph * 56, 3.4 * (1 - ph) + 1);
    }
  } },
  cryptCloak: { c: 0x3a3a42, a: 0x8a92a2, draw: (g, now, sway, c, a) => {
    // 锁链斗篷：黑袍 + 垂链
    cpoly(g, [[-22, 0], [22, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.96);
    for (let k = 0; k < 2; k++) {
      const px = -8 + k * 16;
      g.lineStyle(2.4, a, 0.9);
      for (let s = 0; s < 4; s++) {
        g.strokeCircle(px + Math.sin(now / 400 + s + k) * 1.4, 16 + s * 14, 3.4);
      }
    }
  } },
  festivCloak: { c: 0xe84a5a, a: 0x3aa05a, draw: (g, now, sway, c, a) => {
    // 礼物斗篷：红袍 + 礼物丝带十字
    cpoly(g, [[-22, 0], [22, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.95);
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(-3, 6, 6, 66);
    g.save();
    g.translateCanvas(0, 6);
    g.rotateCanvas(0.5);
    g.fillRect(-3, 0, 6, 60);
    g.restore();
    g.fillStyle(a, 0.9); g.fillCircle(0, 20, 4); // 蝴蝶结
  } },
  sushiCloak: { c: 0x2a3a6a, a: 0xffffff, draw: (g, now, sway, c, a) => {
    // 条纹斗篷：暖帘条纹
    cpoly(g, [[-22, 0], [22, 0], [24 + sway, 76], [-24 + sway, 76]], c, 0.95);
    for (let k = 0; k < 4; k++) {
      g.fillStyle(a, 0.85);
      g.fillRect(-18 + k * 10, 4, 4.4, 68 + sway * 0.2);
    }
    g.fillStyle(0xc03a3a, 0.9); g.fillCircle(0, 14, 3); // 家纹
  } },
  wildCloak: { c: 0x8a5a2a, a: 0xd9c08a, draw: (g, now, sway, c, a) => {
    // 马刺斗篷：牛仔披肩 + 流苏
    cpoly(g, [[-24, 0], [24, 0], [20 + sway, 60], [-20 + sway, 60]], c, 0.95);
    g.fillStyle(a, 0.8); g.fillRect(-22, 2, 44, 4); // 肩章条
    for (let k = 0; k < 6; k++) {
      const px = -20 + k * 8;
      cline(g, [[px + sway * 0.5, 60], [px + sway * 0.7, 72 + Math.sin(now / 350 + k) * 2]], 2, a, 0.9); // 流苏
    }
  } },
  // ==== 第二批主题的 2★ 披风（逐件按名字独立画） ====
  pirateCape: { c: 0x8a3a2a, a: 0x2a3a5a, draw: (g, now, sway, c, a) => {
    // 海风披风：暗红披风 + 藏青横条 + 船锚缝纹
    cpoly(g, [[-22, 0], [22, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.96);
    for (let k = 0; k < 3; k++) g.fillRect(-22, 18 + k * 18, 44, 5);
    g.lineStyle(2, 0xd8c8a0, 0.7);
    g.arc(0, 30, 5, Math.PI, Math.PI * 2); g.strokePath(); // 锚环
    cline(g, [[0, 30], [0, 44 + sway * 0.3]], 2, 0xd8c8a0, 0.7);
  } },
  steamCape: { c: 0x6a5236, a: 0x8a6a3a, draw: (g, now, sway, c, a) => {
    // 工装披风：帆布工装 + 三颗铜扣 + 一只扳手侧袋
    cpoly(g, [[-22, 0], [22, 0], [25 + sway, 78], [-25 + sway, 78]], c, 0.96);
    for (let k = 0; k < 3; k++) {
      g.fillStyle(0xd9b45c, 0.95);
      g.fillCircle(0, 18 + k * 16, 3);
    }
    g.fillStyle(a, 0.9);
    g.fillRoundedRect(-16 + sway * 0.2, 24, 12, 18, 3);
    cline(g, [[10 + sway * 0.4, 30], [10 + sway * 0.4, 52]], 2.4, 0xd9b45c, 0.8); // 扳手柄
  } },
  astroCape: { c: 0xd8e8ff, a: 0x2f4570, draw: (g, now, sway, c, a) => {
    // 宇航服披风：太空服面料 + 缝线格 + 任务徽章
    cpoly(g, [[-22, 0], [22, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.97);
    for (let k = 0; k < 4; k++) cline(g, [[-20, 16 + k * 16], [20, 16 + k * 16]], 1.4, a, 0.4);
    g.fillStyle(a, 0.9);
    g.fillRoundedRect(-8 + sway * 0.2, 22, 16, 10, 2);
    g.fillStyle(0xff5a2a, 0.9);
    g.fillCircle(0 + sway * 0.2, 27, 2.6);
  } },
  juraCape: { c: 0x7a6440, a: 0x395f2a, draw: (g, now, sway, c, a) => {
    // 侏罗兽皮披风：锯齿兽皮 + 爪痕纹 + 骨饰
    cpoly(g, [[-24, 0], [24, 0], [22 + sway, 66], [26 + sway, 74], [-26 + sway, 78], [-28 + sway, 64]], c, 0.96);
    g.lineStyle(1.8, a, 0.8);
    for (let k = 0; k < 3; k++) {
      cline(g, [[-14 + k * 12 + sway * 0.3, 20 + k * 4], [-8 + k * 12 + sway * 0.3, 34 + k * 4]], 1.8, a, 0.8);
    }
    g.fillStyle(0xf0ead8, 0.9);
    for (let k = 0; k < 3; k++) g.fillTriangle(-8 + k * 8, 8, -4 + k * 8, 8, -6 + k * 8, 2);
  } },
  mushCape: { c: 0x5a7a3a, a: 0x8a5a8a, draw: (g, now, sway, c, a) => {
    // 苔藓披风：苔绿披风 + 一丛小蘑菇点缀
    cpoly(g, [[-23, 0], [23, 0], [27 + sway, 78], [-27 + sway, 78]], c, 0.95);
    for (let k = 0; k < 4; k++) {
      const px = -14 + k * 9 + (k % 2) * 3, py = 20 + (k % 3) * 18 + sway * 0.2;
      g.fillStyle(0xe8d8c0, 0.95);
      g.fillRect(px - 1.4, py, 2.8, 5);
      g.fillStyle(a, 0.95);
      g.fillEllipse(px, py - 1, 8, 4.4);
    }
  } },
  tropicCape: { c: 0x2f9a8a, a: 0xbfe8f0, draw: (g, now, sway, c, a) => {
    // 海藻披风：一束条带海藻各自摆动
    for (let k = 0; k < 5; k++) {
      const px = -18 + k * 9;
      const w = 4.5;
      cpoly(g, [
        [px - w, 0], [px + w, 0],
        [px + w + Math.sin(now / 380 + k) * 5 + sway * 0.4, 66 + (k % 2) * 8],
        [px - w + Math.sin(now / 380 + k) * 5 + sway * 0.4, 66 + (k % 2) * 8],
      ], k % 2 ? c : a, 0.85);
    }
  } },
  cryptCape: { c: 0x4a4a44, a: 0x6a6a72, draw: (g, now, sway, c, a) => {
    // 破布披风：撕裂底边 + 补丁 + 掉线头
    cpoly(g, [[-24, 0], [24, 0], [26 + sway, 62], [18 + sway, 70], [8 + sway, 58], [-4 + sway, 72], [-14 + sway, 60], [-26 + sway, 74]], c, 0.96);
    g.fillStyle(a, 0.7);
    g.fillRoundedRect(-10 + sway * 0.2, 26, 12, 10, 2);
    cline(g, [[10 + sway * 0.4, 30], [14 + sway * 0.4, 40]], 1.4, a, 0.6);
  } },
  festivCape: { c: 0xd23b3b, a: 0x2c6a44, draw: (g, now, sway, c, a) => {
    // 红绒披风：红绒 + 绿宽滚边 + 三颗白绒球
    cpoly(g, [[-23, 0], [23, 0], [27 + sway, 78], [-27 + sway, 78]], c, 0.97);
    cline(g, [[-23, 0], [-27 + sway, 78]], 4, a, 0.95);
    cline(g, [[23, 0], [27 + sway, 78]], 4, a, 0.95);
    for (let k = 0; k < 3; k++) {
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(0, 20 + k * 18, 3);
    }
  } },
  sushiCape: { c: 0x2a3a5a, a: 0xd8c8a0, draw: (g, now, sway, c, a) => {
    // 暖帘披风：三片暖帘分割 + 家纹圆
    cpoly(g, [[-24, 0], [24, 0], [26 + sway, 76], [-26 + sway, 76]], c, 0.96);
    cline(g, [[-8, 0], [-8 + sway * 0.2, 76]], 1.8, 0xffffff, 0.35);
    cline(g, [[8, 0], [8 + sway * 0.2, 76]], 1.8, 0xffffff, 0.35);
    g.fillStyle(a, 0.9);
    g.fillCircle(0, 20, 6);
    g.fillStyle(c, 0.95);
    g.fillCircle(0, 20, 3);
  } },
  wildCape: { c: 0x8a6a3a, a: 0x6a4a2a, draw: (g, now, sway, c, a) => {
    // 牛仔披风：牛皮斗篷 + 底缘一圈流苏 + 铆钉
    cpoly(g, [[-23, 0], [23, 0], [26 + sway, 72], [-26 + sway, 72]], c, 0.96);
    for (let k = 0; k < 7; k++) {
      const px = -21 + k * 7;
      cline(g, [[px + sway * 0.6, 72], [px + sway * 0.8, 84 + (k % 2) * 3]], 2, a, 0.9);
    }
    for (let k = 0; k < 3; k++) {
      g.fillStyle(0xd9b45c, 0.95);
      g.fillCircle(0, 14 + k * 14, 2.4);
    }
  } },
};
