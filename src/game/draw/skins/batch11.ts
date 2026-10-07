import { groundShadow, type SkinPainter } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 批十一非人形皮肤：史莱姆巨灵 / 三尾妖猫 / 独角仙甲王 */

/** 史莱姆巨灵：一整团Q弹果冻，没有腿——波动爬行、体内有游鱼般的泡与核心 */
export const slimeSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY, move } = pose;
  const h = 72;
  groundShadow(g, pose, 50);
  const squish = Math.sin(now / 320) * 3 + (move ?? 0) * Math.sin(now / 160) * 2;
  const bodyH = h - 10 + squish * 0.4;
  const bodyW = 44 - squish * 0.8;
  const cy = feetY - bodyH / 2 - 2;
  // 果冻身体（半透明双层）
  g.fillStyle(0x7de87d, 0.85);
  g.fillEllipse(x, cy + 3, bodyW, bodyH);
  g.fillStyle(0x9aff7a, 0.55); // 内层亮冻
  g.fillEllipse(x, cy + 1, bodyW - 10, bodyH - 10);
  // 顶部收圆（水滴头）
  g.fillStyle(0x7de87d, 0.85);
  g.fillCircle(x + f * 2, cy - bodyH / 2 + 6, 10);
  // 底部摊开的裙边
  g.fillStyle(0x5ac87d, 0.7);
  g.fillEllipse(x, feetY - 3, bodyW + 6, 9);
  // 高光
  g.fillStyle(0xffffff, 0.5);
  g.fillEllipse(x - f * 8, cy - bodyH / 4, 9, 14);
  g.fillStyle(0xffffff, 0.35);
  g.fillCircle(x + f * 6, cy - bodyH / 2 + 4, 3);
  // 体内游走气泡
  for (let k = 0; k < 5; k++) {
    const ph = now / 900 + k * 1.9;
    g.fillStyle(0xd0ff9a, 0.5);
    g.fillCircle(x + Math.cos(ph) * 12, cy + Math.sin(ph * 1.4) * 10, 1.8 + (k % 2));
  }
  // 体内发光核心（心脏）
  const pulse = 0.6 + 0.4 * Math.sin(now / 300);
  g.fillStyle(0xffd45c, 0.35 * pulse);
  g.fillCircle(x, cy + 2, 8);
  g.fillStyle(0xfff0b0, 0.9);
  g.fillCircle(x, cy + 2, 4);
  // 眼睛（两只果冻豆豆眼 + 高光）
  const blink = Math.sin(now / 2100) > 0.96 ? 0.15 : 1;
  for (const s of [-1, 1]) {
    g.fillStyle(0x1a2818, blink);
    g.fillEllipse(x + s * 8 + f * 2, cy - 6, 5, 6 * blink + 0.6);
    g.fillStyle(0xffffff, 0.85 * blink);
    g.fillCircle(x + s * 8 + f * 2 - 1, cy - 7.6, 1.3);
  }
  // 嘴（波浪小口）
  g.lineStyle(1.6, 0x1a2818, 0.8);
  g.beginPath();
  g.moveTo(x - 4 + f * 2, cy + 4);
  g.lineTo(x - 1 + f * 2, cy + 5.4);
  g.lineTo(x + 2 + f * 2, cy + 4);
  g.lineTo(x + 5 + f * 2, cy + 5.4);
  g.strokePath();
  // 头顶呆泡（一颤一颤的小凸起）
  const tipBob = Math.sin(now / 220) * 1.6;
  g.fillStyle(0x9aff7a, 0.9);
  g.fillCircle(x + f * 3, cy - bodyH / 2 - 2 + tipBob, 3.4);
  g.fillStyle(0xffffff, 0.5);
  g.fillCircle(x + f * 2.4, cy - bodyH / 2 - 3 + tipBob, 1.1);
  // 地面黏液痕
  g.fillStyle(0x7de87d, 0.25);
  g.fillEllipse(x - f * (16 + (move ?? 0) * 4), feetY - 1, 14, 4);
};

/** 三尾妖猫：四足伏行的妖猫——三重尾巴、狐火眉心、爪足踏行 */
export const nekSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY, move } = pose;
  const h = 86;
  const topY = feetY - h;
  groundShadow(g, pose, 56);
  const breathe = Math.sin(now / 420) * 1.6;
  const bodyY = feetY - 30 + breathe * 0.4;
  // 三重尾巴（最后画在身后，从粗到细三层摆动）
  for (let k = 0; k < 3; k++) {
    const sway = Math.sin(now / 380 + k * 2.1) * 9;
    const lift = 14 + k * 12;
    g.lineStyle(7 - k * 1.6, k === 1 ? 0x9a7aff : 0x8a6aff, 0.95);
    g.beginPath();
    g.moveTo(x - f * 18, bodyY - 2);
    g.lineTo(x - f * (32 + k * 2), bodyY - lift + sway * 0.4);
    g.lineTo(x - f * (44 + k * 3), bodyY - lift * 1.35 + sway);
    g.strokePath();
    // 尾尖妖火
    const tipX = x - f * (44 + k * 3), tipY = bodyY - lift * 1.35 + sway;
    const fl = 0.6 + 0.4 * Math.sin(now / 150 + k * 2);
    g.fillStyle(0xb08aff, 0.4 * fl);
    g.fillCircle(tipX - f * 3, tipY - 2, 4.4);
    g.fillStyle(0xffd45c, fl);
    g.fillCircle(tipX - f * 3, tipY - 2, 2);
  }
  // 四足（前后腿交替迈步）
  for (const [lx, phase] of [[16, 0], [22, Math.PI], [-14, Math.PI], [-20, 0]] as Array<[number, number]>) {
    const step = Math.sin(now / 220 + phase) * (move ?? 0) * 3;
    g.fillStyle(0x6a5a9a, 1);
    g.fillRoundedRect(x + f * lx - 3.4 + step * 0.3, bodyY + 6, 7, feetY - bodyY - 8, 3);
    g.fillStyle(0x4a3a6a, 1); // 爪
    g.fillRoundedRect(x + f * lx - 4 + step, feetY - 5, 9, 5, 2.4);
  }
  // 躯干（伏行的修长身体）
  g.fillStyle(0x8a6aff, 1);
  g.fillEllipse(x - f * 2, bodyY, 42, 22);
  g.fillStyle(0x9a7aff, 0.6); // 背部高光
  g.fillEllipse(x - f * 6, bodyY - 6, 26, 9);
  // 颈 + 头
  const headX = x + f * 20, headY = topY + 24 + breathe;
  g.fillStyle(0x8a6aff, 1);
  g.fillCircle(headX, headY, 13);
  // 双耳（内耳粉）
  for (const s of [-1, 1]) {
    const earTw = Math.sin(now / 500 + (s > 0 ? 0 : 1)) * 1.2;
    g.fillStyle(0x7a5aff, 1);
    g.fillPoints([
      { x: headX + s * 9, y: headY - 6 }, { x: headX + s * 13 + earTw, y: headY - 19 }, { x: headX + s * 2, y: headY - 11 },
    ] as never, true);
    g.fillStyle(0xffb0d8, 0.8);
    g.fillPoints([
      { x: headX + s * 8.4, y: headY - 8 }, { x: headX + s * 11 + earTw, y: headY - 16 }, { x: headX + s * 4, y: headY - 10 },
    ] as never, true);
  }
  // 妖纹（额头三道灵纹 + 眉心狐火）
  g.lineStyle(1.4, 0xd0b0ff, 0.8);
  for (let k = 0; k < 3; k++) {
    g.beginPath();
    g.moveTo(headX - 3 + k * 3, headY - 12);
    g.lineTo(headX - 1 + k * 3, headY - 8);
    g.strokePath();
  }
  const fl = 0.65 + 0.35 * Math.sin(now / 140);
  g.fillStyle(0xffd45c, fl);
  g.fillCircle(headX + f * 1, headY - 5, 3);
  g.fillStyle(0xffffff, fl);
  g.fillCircle(headX + f * 1, headY - 5.4, 1.2);
  // 竖瞳妖眼（发光 + 眨眼）
  const blink = Math.sin(now / 2300) > 0.95 ? 0.2 : 1;
  for (const s of [-1, 1]) {
    g.fillStyle(0xffd45c, 1);
    g.fillEllipse(headX + s * 5.4 + f * 2, headY + 1, 4.6, 4 * blink + 0.4);
    g.fillStyle(0x2a1c0a, blink);
    g.fillEllipse(headX + s * 5.4 + f * 2, headY + 1, 1.6, 3.4 * blink + 0.3);
  }
  // 鼻嘴 + 须
  g.fillStyle(0xff8ad4, 0.9);
  g.fillCircle(headX + f * 3, headY + 6, 1.6);
  g.lineStyle(1.2, 0xd0b0ff, 0.7); // 三根须
  for (let k = 0; k < 3; k++) {
    g.beginPath();
    g.moveTo(headX + f * 10, headY + 4 + k * 2.6);
    g.lineTo(headX + f * 18, headY + 2 + k * 3.6);
    g.strokePath();
  }
  // 胸前绒毛
  g.fillStyle(0xc8b0ff, 0.7);
  g.fillEllipse(headX - f * 6, bodyY - 4, 12, 16);
  // 地面妖光
  g.fillStyle(0xb08aff, 0.2 + 0.1 * Math.sin(now / 300));
  g.fillEllipse(x, feetY - 1, 54, 7);
};

/** 独角仙甲王：六足甲虫——金鞘翅、巨独角、触角、开翅蓄能 */
export const btlSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  groundShadow(g, pose, 54);
  const walk = Math.sin(now / 260);
  const breathe = Math.sin(now / 500) * 1.2;
  const bodyY = feetY - 26 + breathe * 0.4;
  const charge = (Math.sin(now / 800) * 0.5 + 0.5); // 蓄能相位
  // 六足（三对交替）
  g.lineStyle(3.6, 0x2a1c0a, 1);
  for (let k = 0; k < 3; k++) {
    for (const side of [0, 1]) {
      const ph = walk + k * 2 + side * Math.PI;
      const lx = (k - 1) * 13 + (side ? 3 : -3);
      g.beginPath();
      g.moveTo(x + f * lx, bodyY + 6);
      g.lineTo(x + f * lx + Math.sin(ph) * 4 * f, bodyY + 13);
      g.lineTo(x + f * lx + Math.sin(ph) * 7 * f, feetY - 1);
      g.strokePath();
    }
  }
  // 腹部
  g.fillStyle(0x3a5a2a, 1);
  g.fillEllipse(x - f * 4, bodyY + 5, 40, 18);
  g.fillStyle(0x2a3a1a, 0.8); // 腹节纹
  for (let k = 0; k < 3; k++) {
    g.fillRect(x - f * (16 + k * 8) - 2, bodyY + 2, 4, 12);
  }
  // 胸盾
  g.fillStyle(0x2a3a1a, 1);
  g.fillCircle(x + f * 14, bodyY - 2, 10);
  const open = charge * 7; // 鞘翅开合（蓄能时张开）
  for (const s of [-1, 1]) { // 金鞘翅（两片，蓄能微张）
    g.fillStyle(0xc8a832, 0.95);
    g.fillPoints([
      { x: x + f * 2, y: bodyY - 6 },
      { x: x + f * (-16 - s * 2), y: bodyY - 12 - open * (s < 0 ? 1 : 0.4) },
      { x: x + f * (-30), y: bodyY + 2 + open * (s < 0 ? 1 : 0.4) },
      { x: x + f * (-4), y: bodyY + 8 },
    ] as never, true);
    g.lineStyle(1.2, 0x8a6a2a, 0.8); // 翅脉
    g.beginPath();
    g.moveTo(x + f * 0, bodyY - 2);
    g.lineTo(x + f * (-20), bodyY - 4 - open * (s < 0 ? 0.6 : 0.2));
    g.strokePath();
    // 翅面扫光
    const glint = Math.abs(Math.sin(now / 560 + (s > 0 ? 1.2 : 0)));
    g.fillStyle(0xffffff, glint * 0.4);
    g.fillEllipse(x + f * (-12), bodyY - 2 - open * (s < 0 ? 0.5 : 0.2), 10, 5);
  }
  // 蓄能光（张翅时从缝里透出）
  g.fillStyle(0x7dff5a, 0.35 * charge);
  g.fillEllipse(x - f * 12, bodyY - 2, 20, 6);
  // 头部
  g.fillStyle(0x2a1c0a, 1);
  g.fillCircle(x + f * 22, bodyY - 4, 9);
  // 巨独角（前扬，蓄能时发亮）
  g.fillStyle(0xc8a832, 1);
  g.fillPoints([
    { x: x + f * 24, y: bodyY - 10 }, { x: x + f * 46, y: bodyY - 20 - charge * 2 }, { x: x + f * 44, y: bodyY - 12 }, { x: x + f * 27, y: bodyY - 5 },
  ] as never, true);
  g.fillStyle(0xe8cc5a, 0.5 * charge); // 角尖蓄能光
  g.fillCircle(x + f * 44, bodyY - 17 - charge * 1.6, 3.4 * charge + 1);
  // 头角分叉
  g.fillStyle(0xc8a832, 0.9);
  g.fillPoints([
    { x: x + f * 30, y: bodyY - 10 }, { x: x + f * 38, y: bodyY - 6 }, { x: x + f * 32, y: bodyY - 5 },
  ] as never, true);
  // 触角（梢球轻颤）
  for (const s of [-1, 1]) {
    const ant = Math.sin(now / 240 + (s > 0 ? 0 : 1.4)) * 2.4;
    g.lineStyle(2, 0x2a1c0a, 1);
    g.beginPath();
    g.moveTo(x + f * 22, bodyY - 10);
    g.lineTo(x + f * 26 + ant * 0.5, bodyY - 18);
    g.lineTo(x + f * 22 + ant, bodyY - 24);
    g.strokePath();
    g.fillStyle(0x7dff5a, 0.9);
    g.fillCircle(x + f * 22 + ant, bodyY - 25, 2.2);
  }
  // 眼（金瞳）
  g.fillStyle(0xffd45c, 1);
  g.fillCircle(x + f * 25, bodyY - 5, 2.4);
  g.fillStyle(0x1a1408, 1);
  g.fillCircle(x + f * 25.6, bodyY - 5, 1);
  // 背部王纹（鞘翅中央的金徽）
  g.fillStyle(0xffd45c, 0.8);
  g.fillCircle(x - f * 6, bodyY - 2, 2.6);
  g.lineStyle(1, 0xffd45c, 0.5);
  g.beginPath(); g.arc(x - f * 6, bodyY - 2, 5 + charge, 0, Math.PI * 2); g.strokePath();
  // 地面甲光
  g.fillStyle(0xc8a832, 0.18 + 0.1 * charge);
  g.fillEllipse(x, feetY - 1, 52, 7);
};
