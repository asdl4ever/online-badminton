import { handle, pommel, poly, line, TAU, type WeaponArt } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第三批主题球拍的武器化 */
export const WEAPONS_3: Record<string, WeaponArt> = {
  vulcRacketA: { c: 0x3a2a2a, a: 0xff5a1a, draw: (g, now, c, a) => {
    // 火山锤：玄武岩锤头 + 裂缝里透出岩浆光
    handle(g, -13, 2, 6, 0x2a1e1e);
    g.fillStyle(c, 1); g.fillRoundedRect(-1, -10, 24, 20, 4);
    g.lineStyle(1.8, a, 0.7 + 0.3 * Math.sin(now / 220));
    g.lineBetween(4, -8, 9, -1); g.lineBetween(9, -1, 16, -5); g.lineBetween(9, -1, 11, 7);
    g.fillStyle(a, 0.5 + 0.2 * Math.sin(now / 180));
    g.fillTriangle(8, -2, 12, -4, 10, 2);
  } },
  vulcRacketB: { c: 0x2a1e1e, a: 0xffb02a, draw: (g, now, c, a) => {
    // 熔核斧：黑曜斧身 + 淌下的岩浆
    handle(g, -13, 4, 6, 0x2a1e1e);
    g.fillStyle(a, 1); g.fillCircle(4, 0, 3.5);
    poly(g, [[4, -4], [22, -12], [27, 2], [14, 8], [4, 4]], 0x4a4048);
    poly(g, [[20, -10], [27, 2], [22, 1]], c);
    g.lineStyle(1.8, a, 0.8 + 0.2 * Math.sin(now / 160));
    g.lineBetween(6, -2, 14, -6); g.lineBetween(14, -6, 20, -4);
    for (let k = 0; k < 3; k++) {
      const ph = (now / 700 + k / 3) % 1;
      g.fillStyle(a, 0.85 * (1 - ph));
      g.fillCircle(8 + k * 6, 6 + ph * 8, 2 * (1 - ph) + 0.8);
    }
  } },
  trenchRacketA: { c: 0x8a94a2, a: 0xd8e0e8, draw: (g, now, c, a) => {
    // 鱼叉：三叉倒刺
    handle(g, -13, 8, 5, 0x4a5462);
    g.lineStyle(4, c, 1); g.lineBetween(8, 0, 20, 0);
    line(g, [[20, 0], [28, 0]], 3, a);
    for (const s of [-1, 1]) line(g, [[20, 0], [24, s * 8], [28, s * 6]], 3, a);
    g.fillStyle(a, 1); g.fillTriangle(28, -1.6, 28, 1.6, 31, 0);
    g.lineStyle(1.4, 0x5ac8ff, 0.4 + 0.2 * Math.sin(now / 300));
    g.strokeCircle(14, 0, 9);
  } },
  trenchRacketB: { c: 0x1a2a4a, a: 0xf0eaf8, draw: (g, now, c, a) => {
    // 深渊珍珠杖：黑杖顶一颗发光珍珠，触须缠绕
    handle(g, -13, 3, 5, 0x0e1828);
    g.lineStyle(2, 0x2a3a5a, 0.9);
    for (let k = 0; k < 3; k++) {
      const ang = now / 800 + k * 2.1;
      g.beginPath();
      g.arc(9, 0, 5 + k * 2, ang, ang + 2.4);
      g.strokePath();
    }
    const gl = 0.6 + 0.35 * Math.sin(now / 350);
    g.fillStyle(a, 0.25 * gl); g.fillCircle(9, 0, 13);
    g.fillStyle(a, 0.95); g.fillCircle(9, 0, 7);
    g.fillStyle(0xffffff, 0.9); g.fillCircle(7, -2.4, 2.2);
  } },
  dojoRacketA: { c: 0xd9c89a, a: 0x2a2a2a, draw: (g, now, c, a) => {
    // 竹剑：细长竹条 + 皮革柄
    handle(g, -13, -4, 5, 0x6a4a2a);
    g.fillStyle(a, 1); g.fillRect(-5, -3.4, 3, 6.8);
    poly(g, [[-2, -2.6], [26, -1.6], [30, 0], [26, 1.6], [-2, 2.6]], c);
    g.lineStyle(1, a, 0.6);
    for (let k = 0; k < 4; k++) g.lineBetween(4 + k * 6, -2.2, 4 + k * 6, 2.2);
  } },
  dojoRacketB: { c: 0xdfe6f0, a: 0x2a2a2a, draw: (g, now, c, a) => {
    // 武士刀：刀镡 + 波纹刃
    handle(g, -13, -4, 5, 0x2a3a6a);
    g.fillStyle(0xd9b45c, 1); g.fillRect(-4, -3, 3, 6);
    g.fillStyle(a, 1); g.fillEllipse(-2.5, 0, 4, 15);
    poly(g, [[-1, -3], [20, -2.2], [28, 0], [20, 2.2], [-1, 3]], c);
    line(g, [[2, 1], [24, 1]], 1.2, a, 0.8);
    g.lineStyle(1.2, 0xffffff, 0.7); g.lineBetween(1, -2, 22, -1.4);
  } },
  inkwRacketA: { c: 0x2a2a30, a: 0xf5f0e4, draw: (g, now, c, a) => {
    // 毛笔：竹笔杆 + 蘸墨笔锋，锋尖悬一滴墨
    handle(g, -13, 6, 4.5, 0xb08a4a);
    g.fillStyle(a, 1); g.fillCircle(7, 0, 3.2);
    g.fillStyle(c, 1);
    poly(g, [[6, -3], [12, -2], [22, 0], [12, 2], [6, 3]], c);
    g.fillTriangle(18, -2, 18, 2, 27, 0);
    const ph = (now / 900) % 1;
    g.fillStyle(c, 0.8 * (1 - ph));
    g.fillCircle(28 + ph * 2, ph * 5, 2 * (1 - ph) + 0.6);
  } },
  inkwRacketB: { c: 0x2a2a30, a: 0x8a8a92, draw: (g, now, c, a) => {
    // 山水折扇：展开的扇面晕染远山
    handle(g, -13, 0, 4.5, 0x6a4a2a);
    g.fillStyle(a, 0.9);
    g.beginPath(); g.arc(2, 2, 19, -Math.PI * 0.5, -Math.PI * 0.1); g.closePath(); g.fillPath();
    g.fillStyle(c, 0.85);
    g.beginPath(); g.arc(2, 2, 19, -Math.PI * 0.34, -Math.PI * 0.12); g.closePath(); g.fillPath();
    poly(g, [[6, -9], [11, -13], [15, -9]], 0xf5f0e4);
    poly(g, [[13, -8], [17, -11], [20, -8]], 0xf5f0e4);
    g.fillStyle(c, 1); g.fillCircle(2, 2, 2.4);
  } },
  fairyRacketA: { c: 0x7ed957, a: 0xffb7d5, draw: (g, now, c, a) => {
    // 花茎杖：弯茎顶一朵五瓣花，花心发光
    handle(g, -13, 5, 4.5, c);
    line(g, [[5, 0], [9, -6], [7, -12]], 3.5, c);
    for (let k = 0; k < 5; k++) {
      const ang = -Math.PI / 2 + (k / 5) * TAU + now / 1500;
      g.fillStyle(a, 0.95);
      g.fillEllipse(8 + Math.cos(ang) * 6, -13 + Math.sin(ang) * 6, 7, 4.5);
    }
    const gl = 0.6 + 0.4 * Math.sin(now / 300);
    g.fillStyle(0xffe89a, gl); g.fillCircle(8, -13, 3);
  } },
  fairyRacketB: { c: 0xd9a44a, a: 0xffb7d5, draw: (g, now, c, a) => {
    // 蜜露搅棒：蜜糖搅拌棒，蜜滴挂壁
    handle(g, -13, 6, 4.5, c);
    g.fillStyle(c, 1); g.fillRoundedRect(5, -7, 9, 14, 4);
    g.fillStyle(0xb08030, 0.7);
    for (let k = 0; k < 3; k++) g.fillEllipse(9.5, -5 + k * 5, 7, 2.4);
    const ph = (now / 800) % 1;
    g.fillStyle(0xffd87a, 0.85 * (1 - ph));
    g.fillCircle(12, 9 + ph * 7, 2.2 * (1 - ph) + 0.7);
    g.fillStyle(a, 0.7); g.fillCircle(5, -9, 2);
  } },
  racerRacketA: { c: 0x22222a, a: 0xe83a3a, draw: (g, now, c, a) => {
    // 方程式指挥旗：旗杆 + 黑白格旗，旗面波动
    handle(g, -13, 10, 4, 0xdfe6f0);
    const t = now / 280;
    const rows = 3, cols = 5, cell = 4.2;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const wob = Math.sin(t + k * 0.8) * 1.6;
      g.fillStyle((r + k) % 2 ? 0xf0f0f0 : c, 0.95);
      g.fillRect(12 + k * cell, -9 + r * cell + wob, cell, cell);
    }
    g.fillStyle(a, 1); g.fillCircle(11, 0, 2.6);
  } },
  racerRacketB: { c: 0xe83a3a, a: 0xdfe6f0, draw: (g, now, c, a) => {
    // 涡轮喷枪：枪身 + 高速旋转的涡轮 + 尾焰
    handle(g, -13, 0, 5.5, 0x22222a);
    g.fillStyle(c, 1); g.fillRoundedRect(-1, -7, 20, 14, 4);
    g.fillStyle(0x22222a, 1); g.fillCircle(14, 0, 6.5);
    g.lineStyle(2, a, 1);
    for (let k = 0; k < 5; k++) {
      const ang = now / 90 + (k / 5) * TAU;
      g.lineBetween(14 + Math.cos(ang) * 2, Math.sin(ang) * 2, 14 + Math.cos(ang + 0.9) * 5.5, Math.sin(ang + 0.9) * 5.5);
    }
    g.fillStyle(0xffd45c, 0.7 + 0.3 * Math.sin(now / 70));
    g.fillCircle(20, 0, 2.4);
  } },
  vampRacketA: { c: 0x1a1420, a: 0x8a1a2a, draw: (g, now, c, a) => {
    // 棺木锤：一口小棺材当锤头，缠红绸
    handle(g, -13, 0, 5.5, 0x3a2a1a);
    poly(g, [[0, -9], [10, -11], [20, -9], [24, 0], [20, 9], [10, 11], [0, 9]], 0x3a2a1a);
    g.lineStyle(2, a, 0.9);
    g.strokeRect(8, -7, 8, 14);
    g.fillStyle(a, 0.85); g.fillRect(0, -1.4, 20, 2.8);
    g.fillStyle(0xc8ccd8, 0.7); g.fillCircle(22, 0, 1.6);
  } },
  vampRacketB: { c: 0xc8ccd8, a: 0x8a1a2a, draw: (g, now, c, a) => {
    // 獠牙刃：两根交错獠牙咬合成刃
    handle(g, -13, -2, 5, 0x1a1420);
    g.fillStyle(a, 1); g.fillCircle(-2, 0, 4.5);
    poly(g, [[0, -3], [18, -7], [28, -1], [10, 1]], 0xe8e4dc);
    poly(g, [[0, 3], [18, 7], [28, 1], [10, -1]], 0xd8d0c4);
    g.fillStyle(a, 0.75 + 0.25 * Math.sin(now / 240));
    g.fillCircle(26, 0, 2.2);
  } },
  autumnRacketA: { c: 0x8a5a2a, a: 0xd88a2a, draw: (g, now, c, a) => {
    // 秋枝杖：一根弯枝挂着两片摇摇欲坠的叶
    handle(g, -13, 6, 4.5, c);
    line(g, [[6, 0], [10, -5], [8, -10], [12, -14]], 4, c);
    for (const [lx, ly, ph] of [[14, -13, 0], [9, -8, 1.3]] as Array<[number, number, number]>) {
      g.save();
      g.translateCanvas(lx, ly);
      g.rotateCanvas(Math.sin(now / 500 + ph) * 0.3);
      g.fillStyle(a, 0.95);
      g.fillEllipse(4, 0, 9, 5);
      g.lineStyle(1, 0x8a5a2a, 0.8); g.lineBetween(0, 0, 8, 0);
      g.restore();
    }
  } },
  autumnRacketB: { c: 0xd88a2a, a: 0xc95a2a, draw: (g, now, c, a) => {
    // 琥珀秋杖：杖顶一颗琥珀球，落叶绕着飘
    handle(g, -13, 2, 5, 0x6a4a2a);
    g.fillStyle(c, 0.4); g.fillCircle(9, 0, 10);
    g.fillStyle(c, 0.9); g.fillCircle(9, 0, 7);
    g.fillStyle(0xffe0b0, 0.7); g.fillCircle(6.5, -2.5, 2.2);
    for (let k = 0; k < 3; k++) {
      const ph = (now / 1200 + k / 3) % 1;
      const ang = ph * TAU + k * 2;
      g.fillStyle(k % 2 ? a : 0xffd45c, 0.9 * Math.sin(ph * Math.PI));
      g.fillEllipse(9 + Math.cos(ang) * 13, Math.sin(ang) * 9 - 6 + ph * 8, 4.4, 2.6);
    }
  } },
  pandaRacketA: { c: 0x7aa84a, a: 0x2a2a2a, draw: (g, now, c) => {
    // 竹枝：一段带叶的青竹
    handle(g, -13, 12, 5, c);
    g.lineStyle(1.4, 0x4a6a2a, 0.8);
    g.lineBetween(2, -2.4, 2, 2.4); g.lineBetween(-4, -2.4, -4, 2.4);
    line(g, [[12, 0], [16, -4], [21, -6]], 3, c);
    for (const [lx, ly, rot] of [[20, -7, -0.7], [23, -4, -0.2]] as Array<[number, number, number]>) {
      g.save();
      g.translateCanvas(lx, ly);
      g.rotateCanvas(rot + Math.sin(now / 600 + rot * 5) * 0.08);
      g.fillStyle(0x5a8a3a, 0.95);
      g.fillEllipse(6, 0, 13, 4.4);
      g.restore();
    }
  } },
  pandaRacketB: { c: 0x4a9a7a, a: 0x2a2a2a, draw: (g, now, c, a) => {
    // 玉竹笛：竹笛 + 吹孔 + 黑漆节
    handle(g, -13, 16, 5, c);
    g.fillStyle(a, 1);
    g.fillEllipse(-6, 0, 2.4, 5.4); g.fillEllipse(6, 0, 2.4, 5.4); g.fillEllipse(16, 0, 2.4, 5.4);
    g.fillStyle(0x2a4a3a, 0.9);
    g.fillCircle(10, -1.8, 1.6); g.fillCircle(13, 1.6, 1.4); g.fillCircle(8, 1.8, 1.2);
    g.fillStyle(0xffffff, 0.4); g.fillEllipse(0, -1.8, 16, 1.6);
  } },
  jokerRacketA: { c: 0xf0f0f0, a: 0xe83a5a, draw: (g, now, c, a) => {
    // 纸牌杖：杖顶扇形甩开三张牌
    handle(g, -13, 4, 4.5, 0x22222a);
    const cards: Array<[number, number, number, number]> = [
      [9, 0, -0.5, a], [10, -1, 0, 0x22222a], [11, -2, 0.5, a],
    ];
    for (const [cx, cy, rot, col] of cards) {
      g.save();
      g.translateCanvas(cx, cy);
      g.rotateCanvas(rot);
      g.fillStyle(c, 1);
      g.fillRoundedRect(-4, -7, 8, 14, 1.5);
      g.lineStyle(1, 0x8a8a92, 0.7); g.strokeRect(-4, -7, 8, 14);
      g.fillStyle(col, 0.9); g.fillCircle(0, 0, 2.2);
      g.restore();
    }
    const fl = 0.4 + 0.3 * Math.sin(now / 300);
    g.fillStyle(0xffd45c, fl); g.fillCircle(13, -10, 1.8);
  } },
  jokerRacketB: { c: 0xe83a5a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 弄臣权杖：螺旋杖身顶一对双头铃铛
    handle(g, -13, 4, 5, a);
    line(g, [[4, 0], [8, -3], [5, -7], [9, -10]], 4, c);
    g.fillStyle(c, 1); g.fillCircle(8, -15, 3); g.fillCircle(14, -13, 3);
    g.fillStyle(0x22222a, 0.9); g.fillCircle(8, -15, 1.2); g.fillCircle(14, -13, 1.2);
    for (let k = 0; k < 3; k++) {
      const ang = now / 400 + k * 2.1;
      g.fillStyle(a, 0.8);
      g.fillCircle(11 + Math.cos(ang) * 9, -14 + Math.sin(ang) * 7, 1.4);
    }
  } },
};
