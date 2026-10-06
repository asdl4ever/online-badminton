import { groundShadow, type SkinPainter } from './shared';
import { PLAYER_H } from '../../constants';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 批五主题 5★ 皮肤（武侠江湖 / 北欧神域） */

/** 白衣剑客：素衣斗笠的江湖剑客——衣袂翻飞、背负长剑、脚下的落叶都听他的 */
export const wxSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const robe = 0xe8e4d8, sash = 0x8a2a2a, bamboo = 0xcfc4a0;
  groundShadow(g, pose, 50);
  const sway = Math.sin(now / 480) * 1.6; // 衣袂风摆
  // 双腿（白袍下摆 + 布靴）
  for (const s of [-1, 1]) {
    const step = Math.sin(now / 260 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
    g.fillStyle(robe, 1);
    g.fillRoundedRect(x + s * 7 - 4.4, topY + 56, 9, 22, 3);
    g.fillStyle(0x3a3a42, 1);
    g.fillRoundedRect(x + s * 7 - 5 + step, feetY - 5, 10, 5, 2);
  }
  // 衣摆（身后翻飞的袍角）
  g.fillStyle(robe, 0.85);
  g.fillPoints([
    { x: x - f * 8, y: topY + 50 }, { x: x - f * 24 - sway * 2, y: topY + 62 }, { x: x - f * 20 - sway, y: topY + 72 }, { x: x - f * 6, y: topY + 66 },
  ] as never, true);
  // 躯干（素白交领袍 + 深红腰带）
  g.fillStyle(robe, 1);
  g.fillRoundedRect(x - 13, topY + 28 + sway * 0.3, 26, 30, 6);
  g.fillStyle(0xd8d4c4, 0.6);
  g.fillRoundedRect(x - 10, topY + 30 + sway * 0.3, 9, 24, 4);
  g.lineStyle(1.6, 0x8a94a2, 0.8); // 交领右衽
  g.lineBetween(x - 6, topY + 28 + sway * 0.3, x + 8, topY + 44 + sway * 0.3);
  g.fillStyle(sash, 1); // 腰带 + 带结
  g.fillRect(x - 13, topY + 52 + sway * 0.3, 26, 5);
  g.fillCircle(x + f * 6, topY + 54.4 + sway * 0.3, 2.6);
  // 双臂（广袖）
  for (const s of [-1, 1]) {
    g.fillStyle(robe, 1);
    g.save();
    g.translateCanvas(x + s * 13, topY + 32 + sway * 0.3);
    g.rotateCanvas(s * 0.5 + Math.sin(now / 500 + s) * 0.06);
    g.fillRoundedRect(-4, 0, 8, 20, 4); // 广袖
    g.fillStyle(0xe8c090, 1); // 手
    g.fillCircle(0, 20, 3);
    g.restore();
  }
  // 背负长剑（剑柄露在肩后）
  g.save();
  g.translateCanvas(x - f * 10, topY + 34);
  g.rotateCanvas(-0.5);
  g.fillStyle(0x2a2a30, 1);
  g.fillRect(-2.4, -6, 4.8, 30);
  g.fillStyle(0xd9b45c, 1);
  g.fillRect(-3.4, -8, 6.8, 2.6);
  g.fillStyle(0xe8404a, 0.9); // 剑穗
  g.fillCircle(0, -11, 2);
  g.restore();
  // 头（斗笠压得低 + 半露的下颌）
  const hy = topY + 12 + sway * 0.4;
  g.fillStyle(0xe8c090, 1);
  g.fillCircle(x, hy + 3, 9);
  g.fillStyle(bamboo, 1); // 斗笠（宽檐斜压）
  g.save();
  g.translateCanvas(x, hy - 4);
  g.rotateCanvas(f * 0.08);
  g.fillEllipse(0, 0, 32, 10);
  g.fillStyle(0xdfd4b0, 0.8);
  g.fillEllipse(-f * 2, -2, 22, 7);
  g.lineStyle(0.8, 0x8a7a54, 0.7);
  for (let k = -3; k <= 3; k++) g.lineBetween(0, -4, k * 4.4, 4);
  g.restore();
  g.fillStyle(0x1a1a20, 0.85); // 笠下阴影里的眼（一点锐光）
  g.fillCircle(x + f * 3, hy + 1, 1.1);
  g.fillStyle(0xffe15c, 0.6 + 0.4 * Math.sin(now / 400));
  g.fillCircle(x + f * 3.4, hy + 1, 0.5);
  // 环身飘叶
  for (let k = 0; k < 5; k++) {
    const ph = (now / 1600 + k / 5) % 1;
    g.fillStyle(0xd9a84a, 0.6 * Math.sin(ph * Math.PI));
    g.save();
    g.translateCanvas(x + Math.sin(k * 2.6) * 26 + Math.sin(ph * 4 + k) * 6, topY + 70 - ph * 90);
    g.rotateCanvas(ph * 7 + k);
    g.fillEllipse(0, 0, 4.4, 2);
    g.restore();
  }
};

/** 雷霆之神：披甲持锤的北欧雷神——翼盔红披风、锤上雷光、脚下雷纹 */
export const norseSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const armor = 0x8a94a2, dark = 0x5a6472, red = 0xc0392b, skinT = 0xe8c090;
  groundShadow(g, pose, 56);
  const breathe = Math.sin(now / 460) * 1.4;
  // 红披风（身后翻卷）
  g.fillStyle(red, 0.9);
  g.fillPoints([
    { x: x - f * 8, y: topY + 26 }, { x: x - f * 28 - Math.sin(now / 420) * 4, y: topY + 44 },
    { x: x - f * 32, y: topY + 70 }, { x: x - f * 14, y: topY + 66 },
  ] as never, true);
  g.fillStyle(0x9a2a20, 0.6);
  g.fillPoints([
    { x: x - f * 12, y: topY + 32 }, { x: x - f * 25, y: topY + 48 }, { x: x - f * 26, y: topY + 64 }, { x: x - f * 16, y: topY + 60 },
  ] as never, true);
  // 双腿（甲靴）
  for (const s of [-1, 1]) {
    const step = Math.sin(now / 250 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
    g.fillStyle(dark, 1);
    g.fillRoundedRect(x + s * 8 - 5, topY + 58, 10, 24, 3);
    g.fillStyle(armor, 0.9);
    g.fillRoundedRect(x + s * 8 - 5 + step * 0.4, topY + 66, 10, 9, 2);
    g.fillStyle(0x1a1410, 1);
    g.fillRoundedRect(x + s * 8 - 6 + step, feetY - 5, 12, 5, 2);
  }
  // 躯干（胸甲 + 腰带 + 圆扣）
  g.fillStyle(armor, 1);
  g.fillRoundedRect(x - 14, topY + 28 + breathe, 28, 32, 6);
  g.fillStyle(0xb8c0cc, 0.6);
  g.fillRoundedRect(x - 11, topY + 30 + breathe, 10, 26, 4);
  g.lineStyle(1.2, dark, 0.9); // 甲片缝
  for (let k = 0; k < 3; k++) g.lineBetween(x - 13, topY + 36 + k * 7 + breathe, x + 13, topY + 36 + k * 7 + breathe);
  g.fillStyle(0x2a2420, 1);
  g.fillRect(x - 14, topY + 54 + breathe, 28, 5);
  g.fillStyle(0xffd45c, 0.95);
  g.fillCircle(x, topY + 56.4 + breathe, 2.6);
  // 双肩甲（层叠钢片）
  for (const s of [-1, 1]) {
    g.fillStyle(0xb8c0cc, 1);
    g.fillEllipse(x + s * 16, topY + 30 + breathe, 13, 9);
    g.fillStyle(dark, 0.8);
    g.fillEllipse(x + s * 16, topY + 32 + breathe, 9, 5);
  }
  // 手持雷锤（锤头电弧）
  const hx = x + f * 22, hy2 = topY + 50 + breathe;
  g.lineStyle(4, 0x6b4a2f, 1);
  g.lineBetween(x + f * 16, topY + 38 + breathe, hx, hy2);
  g.fillStyle(armor, 1);
  g.fillRoundedRect(hx - 9, hy2 - 14, 18, 14, 2);
  g.fillStyle(0xb8c0cc, 0.5);
  g.fillRect(hx - 9, hy2 - 14, 18, 4);
  for (let k = 0; k < 2; k++) {
    const gl = 0.5 + 0.5 * Math.abs(Math.sin(now / 220 + k));
    g.fillStyle(0x7fd4ff, gl);
    g.fillRect(hx - 5 + k * 7, hy2 - 9, 2, 6);
    g.lineStyle(1.2, 0x7fd4ff, gl * 0.8);
    g.lineBetween(hx + (k ? 9 : -9), hy2 - 8, hx + (k ? 13 : -13) + Math.sin(now / 50 + k) * 2, hy2 - 13);
  }
  // 头（翼盔 + 金髯）
  const hy = topY + 13 + breathe;
  g.fillStyle(skinT, 1);
  g.fillCircle(x, hy, 11);
  g.fillStyle(armor, 1);
  g.beginPath(); g.arc(x, hy - 1, 11, Math.PI, 0); g.closePath(); g.fillPath();
  g.fillStyle(0xb8c0cc, 0.6);
  g.fillEllipse(x - 3, hy - 6, 8, 5);
  g.lineStyle(1.2, dark, 0.9);
  g.lineBetween(x, hy - 12, x, hy - 2);
  for (const s of [-1, 1]) { // 盔翼
    const flap = Math.sin(now / 320 + s) * 1.2;
    g.fillStyle(0xb8c0cc, 0.95);
    g.fillPoints([
      { x: x + s * 7, y: hy - 4 }, { x: x + s * 16, y: hy - 11 + flap }, { x: x + s * 18, y: hy - 5 + flap }, { x: x + s * 11, y: hy },
    ] as never, true);
  }
  g.fillStyle(0xd9b45c, 0.95); // 金色大髯（编辫）
  g.fillPoints([
    { x: x - 4, y: hy + 8 }, { x: x + 4, y: hy + 8 }, { x: x + 3 + f, y: hy + 22 }, { x: x - 3 + f, y: hy + 22 },
  ] as never, true);
  g.fillStyle(0xb8943a, 0.7);
  g.fillRect(x - 2, hy + 14, 4, 1.6);
  for (const s of [-1, 1]) { // 亮眼
    g.fillStyle(0x7fd4ff, 0.85);
    g.fillCircle(x + s * 4.2, hy - 1, 1.3);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(x + s * 4.2 + f * 0.5, hy - 1.3, 0.5);
  }
  // 环身雷纹（脚下周期性炸开的小电环）
  const strike = (now / 1300) % 1;
  if (strike < 0.3) {
    const sw = 1 - strike / 0.3;
    g.lineStyle(2 * sw + 0.5, 0x7fd4ff, sw * 0.7);
    g.strokeEllipse(x, feetY, 30 + strike * 60, 8 + strike * 14);
  }
};
