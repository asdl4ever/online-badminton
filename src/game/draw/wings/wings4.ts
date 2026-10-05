import { wpoly, wline, TAU, type WingArt } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第四批主题翅膀（衙门 / 风暴 / 月宫 / 维京 / 猎游 / 剧院 / 北境 / 威尼斯 / 奥林匹斯 / 桑巴） */
export const WINGS_4: Record<string, WingArt> = {
  pagodWingA: { c: 0xdfe8f4, a: 0xc9803a, draw: (g, now, flap, c, a) => {
    // 祥云之翼：卷云盘成翼
    const f = flap * 5;
    for (let k = 0; k < 4; k++) {
      const px = 14 + k * 17, py = -14 - k * 12 - f * 0.5;
      g.fillStyle(k % 2 ? c : 0xffffff, 0.95);
      g.fillCircle(px, py, 11 - k);
      g.lineStyle(2, a, 0.55);
      g.beginPath(); g.arc(px + 2, py - 2, 6 - k * 0.6, -2.6, 0.2); g.strokePath(); // 云卷
    }
  } },
  pagodWingB: { c: 0xd9b45c, a: 0x8a2020, draw: (g, now, flap, c, a) => {
    // 金鳞之翼：金鳞叠成的翼
    const f = flap * 6;
    wpoly(g, [[2, 6], [42, -50 - f], [80, -26 - f], [52, 6]], c, 0.95);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 5 - r; k++) {
      g.fillStyle(r % 2 ? 0xc9a040 : 0xf0d080, 0.9);
      g.beginPath();
      g.arc(14 + k * 12 + r * 4, -8 - r * 12 - f * 0.3, 5, Math.PI, TAU, true);
      g.closePath(); g.fillPath();
    }
    wline(g, [[2, 6], [42, -50 - f]], 2, a, 0.8);
  } },
  stormWingA: { c: 0x8aa8c8, a: 0xeaf2fa, draw: (g, now, flap, c, a) => {
    // 疾风之翼：风刀三连
    for (let k = 0; k < 3; k++) {
      wpoly(g, Array.from({ length: 6 }, (_, s) => {
        const u = s / 5;
        return [4 + u * 70, 4 - u * (34 - k * 8) - flap * 5 + Math.sin(u * 4 + now / 250 + k) * 4] as [number, number];
      }).concat([[74 - k * 10, 8], [4, 8]] as Array<[number, number]>), k === 0 ? a : c, 0.6);
    }
  } },
  stormWingB: { c: 0x3a4a6a, a: 0x7ae0ff, draw: (g, now, flap, c, a) => {
    // 雷云之翼：乌云翼 + 云间闪电
    const f = flap * 5;
    for (let k = 0; k < 4; k++) {
      g.fillStyle(k % 2 ? c : 0x2a3a56, 0.95);
      g.fillCircle(14 + k * 18, -14 - k * 10 - f * 0.4, 13 - k);
    }
    g.lineStyle(2.2, a, 0.8 + 0.2 * Math.sin(now / 90));
    wline(g, [[30, -34 - f], [38, -22], [30, -20], [40, -6]], 2.2, a);
  } },
  lunarWingA: { c: 0xe8e8f8, a: 0xb8c4e8, draw: (g, now, flap, c, a) => {
    // 月纱之翼：半透的轻纱翼
    const f = flap * 7;
    wpoly(g, [[2, 4], [40, -52 - f], [80, -30 - f], [50, 6]], c, 0.4);
    wpoly(g, [[2, 4], [40, -52 - f]], a, 0.3);
    for (let k = 0; k < 3; k++) wline(g, [[4, 2], [24 + k * 18, -16 - k * 12 - f * 0.4]], 1.4, a, 0.6);
    g.fillStyle(0xffffff, 0.8); g.fillCircle(30, -34 - f, 2.4); // 纱上星光
  } },
  lunarWingB: { c: 0x8ab8d8, a: 0xffe89a, draw: (g, now, flap, c, a) => {
    // 桂影之翼：桂枝搭架、桂花点点
    const f = flap * 5;
    wline(g, [[2, 4], [36, -44 - f], [74, -26 - f]], 3.4, 0x6a4a2a);
    for (let k = 0; k < 6; k++) {
      const px = 12 + k * 12, py = -16 - k * 5 - f * 0.3;
      g.fillStyle(k % 2 ? c : 0xa8ccdd, 0.85);
      g.fillEllipse(px, py, 9, 4); // 叶
      g.fillStyle(a, 0.9);
      g.fillCircle(px + 3, py - 4, 2); g.fillCircle(px + 6, py - 2.4, 1.6); // 桂花
    }
  } },
  vikingWingA: { c: 0x2a2a32, a: 0x8a8a94, draw: (g, now, flap, c, a) => {
    // 鸦羽之翼：硬直的黑羽
    const f = flap * 6;
    for (let k = 0; k < 6; k++) {
      const ang = -2.05 + k * 0.26;
      g.save();
      g.translateCanvas(4, 2);
      g.rotateCanvas(ang + Math.PI / 2);
      wpoly(g, [[-4, -6], [4, -6], [2.6, -44 + k * 3], [0, -52 + k * 3], [-2.6, -44 + k * 3]], k % 2 ? c : 0x3a3a44, 0.96);
      g.restore();
    }
    g.fillStyle(a, 0.7); g.fillCircle(4, 2, 4); // 羽根
  } },
  vikingWingB: { c: 0xc0392b, a: 0xf0e8d0, draw: (g, now, flap, c, a) => {
    // 战旗之翼：一面战旗作翼
    const f = flap * 6;
    wline(g, [[4, 2], [10, -52 - f]], 3.4, 0x6a4a2a); // 旗杆
    wpoly(g, [[10, -50 - f], [74, -42 - f], [66, -14], [56, -24], [44, -10], [32, -22], [10, -24]], c, 0.95);
    g.fillStyle(a, 0.9);
    wline(g, [[10, -50 - f], [74, -42 - f]], 2, a, 0.7);
    g.lineStyle(2.4, a, 0.9);
    g.lineBetween(42, -40 - f, 42, -16); // 旗上符文
    g.lineBetween(34, -30 - f * 0.7, 50, -30 - f * 0.7);
  } },
  safariWingA: { c: 0x4a3a2e, a: 0xc8b070, draw: (g, now, flap, c, a) => {
    // 秃鹫之翼（猎游）：深色翎羽 + 浅色羽缘
    const f = flap * 6;
    wpoly(g, [[2, 4], [42, -46 - f], [80, -24 - f], [50, 6]], c, 0.96);
    for (let k = 0; k < 5; k++) {
      const u = k / 5;
      g.fillStyle(a, 0.55);
      g.fillRect(8 + u * 56, -8 - u * 24 - f * 0.4, 13, 3);
    }
    wline(g, [[2, 4], [42, -46 - f], [80, -24 - f]], 2.2, 0x2a2018, 0.9);
  } },
  safariWingB: { c: 0xffb347, a: 0xc9572a, draw: (g, now, flap, c, a) => {
    // 夕阳之翼：落日渐变的扇形
    const f = flap * 6;
    wpoly(g, [[2, 6], [40, -52 - f], [78, -28 - f], [50, 6]], 0xff8a5a, 0.9);
    wpoly(g, [[2, 6], [34, -40 - f], [62, -24 - f], [42, 4]], c, 0.9);
    g.fillStyle(a, 0.9); g.fillCircle(20, -8, 9); // 太阳
    g.fillStyle(0xfff0c0, 0.8); g.fillCircle(20, -8, 5);
  } },
  theatWingA: { c: 0xf0e8f4, a: 0xc86ad9, draw: (g, now, flap, c, a) => {
    // 纱袖之翼：垂坠的舞台纱袖
    const f = flap * 6;
    for (let k = 0; k < 3; k++) {
      wpoly(g, Array.from({ length: 7 }, (_, s) => {
        const u = s / 6;
        return [4 + u * (54 - k * 10), 4 - u * (40 - k * 8) - f + Math.sin(u * 3 + k) * 3] as [number, number];
      }).concat([[54 - k * 10, 8], [4, 8]] as Array<[number, number]>), k % 2 ? c : a, 0.55);
    }
  } },
  theatWingB: { c: 0xffd45c, a: 0xffffff, draw: (g, now, flap, c, a) => {
    // 聚光之翼：两道聚光灯
    const f = flap * 5;
    for (let k = 0; k < 2; k++) {
      const ang = -2.1 + k * 0.5;
      wpoly(g, [
        [2, 0],
        [2 + Math.cos(ang - 0.16) * 84, Math.sin(ang - 0.16) * 84 - f * 0.4],
        [2 + Math.cos(ang + 0.16) * 84, Math.sin(ang + 0.16) * 84 - f * 0.4],
      ], c, 0.35 - k * 0.12);
      g.fillStyle(a, 0.9); g.fillCircle(2, 0, 4); // 灯头
    }
  } },
  boreaWingA: { c: 0xdfeefc, a: 0x9ad4ff, draw: (g, now, flap, c, a) => {
    // 冰羽之翼：冰晶羽毛
    const f = flap * 6;
    for (let k = 0; k < 5; k++) {
      const ang = -2.1 + k * 0.28;
      g.save();
      g.translateCanvas(4, 2);
      g.rotateCanvas(ang + Math.PI / 2);
      wpoly(g, [[-3.4, -6], [3.4, -6], [2.4, -40 + k * 3], [0, -48 + k * 3], [-2.4, -40 + k * 3]], k % 2 ? c : a, 0.9);
      g.lineStyle(1, 0xffffff, 0.7);
      for (let s = 1; s < 4; s++) {
        const y = -8 - s * 10;
        g.lineBetween(-2, y, 2, y);
      }
      g.restore();
    }
  } },
  boreaWingB: { c: 0x5affd8, a: 0x9ad4ff, draw: (g, now, flap, c, a) => {
    // 极光之翼：极光帷幕
    const f = flap * 5;
    for (let k = 0; k < 3; k++) {
      wpoly(g, Array.from({ length: 9 }, (_, s) => {
        const u = s / 8;
        return [4 + u * 76, -6 - k * 10 - Math.sin(u * 4 + now / 400 + k) * 8 - f * 0.4] as [number, number];
      }).concat(Array.from({ length: 9 }, (_, s) => {
        const u = 1 - s / 8;
        return [4 + u * 76, 16 - k * 10 - Math.sin(u * 4 + now / 400 + k) * 8 - f * 0.4] as [number, number];
      })), k === 0 ? c : k === 1 ? a : 0xb8a8ff, 0.4);
    }
  } },
  venicWingA: { c: 0xe8e8e0, a: 0x3a8ab0, draw: (g, now, flap, c, a) => {
    // 鸥羽之翼：海鸥的白羽
    const f = flap * 7;
    wpoly(g, [[2, 4], [44, -48 - f], [82, -26 - f], [48, 6]], 0xffffff, 0.95);
    g.fillStyle(c, 0.7);
    g.fillRect(6, -6 - f * 0.3, 58, 3); // 翼尖黑羽
    wline(g, [[2, 4], [44, -48 - f]], 2, a, 0.5);
  } },
  venicWingB: { c: 0x5ab8d8, a: 0xa8d8f0, draw: (g, now, flap, c, a) => {
    // 水纹之翼：水面涟漪层叠
    const f = flap * 5;
    for (let k = 0; k < 4; k++) {
      g.lineStyle(3 - k * 0.4, k % 2 ? c : a, 0.8);
      g.beginPath();
      g.arc(0, 8, 24 + k * 15, -Math.PI * 0.92 - flap * 0.1, -Math.PI * 0.15 - flap * 0.1);
      g.strokePath();
    }
    g.fillStyle(a, 0.7); g.fillCircle(78, -10, 2.2); // 水光点
  } },
  olympWingA: { c: 0xffffff, a: 0xffd45c, draw: (g, now, flap, c, a) => {
    // 白翼：素白的羽翼
    const f = flap * 7;
    for (let k = 0; k < 5; k++) {
      const ang = -2.1 + k * 0.28;
      g.save();
      g.translateCanvas(4, 2);
      g.rotateCanvas(ang + Math.PI / 2);
      wpoly(g, [[-4.4, -6], [4.4, -6], [3, -50 + k * 4], [0, -58 + k * 4], [-3, -50 + k * 4]], c, 0.97);
      g.lineStyle(1, a, 0.35);
      g.lineBetween(0, -10, 0, -52 + k * 4);
      g.restore();
    }
  } },
  olympWingB: { c: 0xffd45c, a: 0xfffbf0, draw: (g, now, flap, c, a) => {
    // 神翼：金光圣翼
    const f = flap * 6;
    for (let k = 0; k < 4; k++) {
      const ang = -2.15 + k * 0.34;
      wpoly(g, [
        [4, 0],
        [4 + Math.cos(ang - 0.1) * (74 - k * 6), Math.sin(ang - 0.1) * (74 - k * 6) - f * 0.4],
        [4 + Math.cos(ang + 0.1) * (74 - k * 6), Math.sin(ang + 0.1) * (74 - k * 6) - f * 0.4],
      ], k % 2 ? c : a, 0.85);
    }
    const gl = 0.4 + 0.3 * Math.sin(now / 300);
    g.fillStyle(0xfffbf0, gl); g.fillCircle(6, -2, 9);
  } },
  sambaWingA: { c: 0x3aa05a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
    // 彩羽之翼：彩色羽毛排成的翼
    const f = flap * 7;
    for (let k = 0; k < 6; k++) {
      const ang = -2.1 + k * 0.27;
      g.save();
      g.translateCanvas(4, 2);
      g.rotateCanvas(ang + Math.PI / 2);
      wpoly(g, [[-4, -6], [4, -6], [3, -38], [0, -46], [-3, -38]], [c, a, 0x4ac8ff, 0xe83a5a, 0x9effd0, 0xffffff][k], 0.95);
      g.fillStyle(0xffffff, 0.5); g.fillCircle(0, -40, 2);
      g.restore();
    }
  } },
  sambaWingB: { c: 0xffd45c, a: 0x4ac8ff, draw: (g, now, flap, c, a) => {
    // 亮片之翼：缀满亮片的翼
    const f = flap * 5;
    wpoly(g, [[2, 6], [42, -50 - f], [80, -26 - f], [52, 6]], c, 0.85);
    for (let k = 0; k < 12; k++) {
      const px = 12 + (k % 5) * 14, py = -10 - Math.floor(k / 5) * 13 - f * 0.3;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 220 + k * 1.3));
      g.fillStyle(k % 3 === 0 ? a : 0xffffff, tw);
      g.fillCircle(px, py, 2.6);
    }
  } },
};
