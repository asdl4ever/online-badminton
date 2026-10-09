import { groundShadow, type SkinPainter } from './shared';
import { PLAYER_H } from '../../constants';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 批十四 5★ 皮肤：年兽 / 月夜狼王 / 丧尸王 / 大便人 */

/** 年兽：金鬃红身、独角獠牙的四足瑞兽，鬃毛抖动、口中喷火星 */
export const nianSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f, move } = pose;
  const red = 0xd93a3a, redD = 0x8a1a1a, gold = 0xffd45c;
  groundShadow(g, pose, 68);
  const bob = Math.abs(Math.sin(now / 320)) * ((move ?? 0) * 2 + 1.4);
  const by = feetY - 36 - bob * 0.6;

  // 四腿
  for (const [lx, ph] of [[-22, 0], [-8, Math.PI], [12, Math.PI], [26, 0]] as Array<[number, number]>) {
    const stp = Math.sin(now / 260 + ph) * ((move ?? 0) * 3 + 1);
    g.fillStyle(redD, 1);
    g.fillRoundedRect(x + lx * f - 5 + stp, by + 8, 10, feetY - by - 12, 3.6);
    g.fillStyle(gold, 0.85); // 金蹄
    g.fillRoundedRect(x + lx * f - 6 + stp, feetY - 6, 12, 6, 2.4);
  }
  // 躯干
  g.fillStyle(redD, 0.95);
  g.fillRoundedRect(x - 32, by - 14, 64, 30, 14);
  g.fillStyle(red, 1);
  g.fillRoundedRect(x - 30, by - 12, 60, 26, 12);
  g.fillStyle(gold, 0.5);
  g.fillEllipse(x, by + 6, 44, 12);
  // 金鬃（沿背）
  for (let k = 0; k < 9; k++) {
    const sx = x - 28 + k * 8;
    const jig = Math.sin(now / 220 + k) * 2;
    g.fillStyle(gold, 0.95);
    g.fillCircle(sx, by - 16 + jig, 5.4);
    g.fillStyle(0xfff0b0, 0.7);
    g.fillCircle(sx - 1, by - 17 + jig, 2);
  }
  // 尾
  const tw = Math.sin(now / 360) * 6;
  g.fillStyle(red, 1);
  g.fillPoints([{ x: x - 30 * f, y: by - 4 }, { x: x - 44 * f, y: by - 10 + tw }, { x: x - 50 * f, y: by + 2 + tw }, { x: x - 34 * f, y: by + 4 }] as never, true);
  g.fillStyle(gold, 0.9); g.fillCircle(x - 48 * f, by - 4 + tw, 4);
  // 头
  const hx = x + 30 * f, hy = by - 16 - bob * 0.3;
  g.fillStyle(red, 1);
  g.fillCircle(hx, hy, 14);
  g.fillStyle(gold, 1);
  g.fillEllipse(hx + 8 * f, hy + 5, 13, 9); // 金吻
  g.fillTriangle(hx - 2, hy - 12, hx + 6, hy - 12, hx - 8 - f * 8, hy - 26); // 独角
  g.fillStyle(0xfff0b0, 0.6); g.fillTriangle(hx, hy - 12, hx + 5, hy - 12, hx - 3 - f * 5, hy - 22);
  for (const s of [-1, 1]) { g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx + s * 5, hy - 3, 3.6); g.fillStyle(0xfff0b0, 0.9); g.fillCircle(hx + s * 5 - 1, hy - 4, 1.2); }
  // 张口 + 獠牙 + 喷火
  g.fillStyle(0x5a0a0a, 1); g.fillEllipse(hx + 10 * f, hy + 8, 11, 6);
  for (let k = 0; k < 4; k++) { g.fillStyle(0xf0f4f8, 0.96); g.fillTriangle(hx + (5 + k * 3) * f, hy + 5, hx + (7 + k * 3) * f, hy + 5, hx + (6 + k * 3) * f, hy + 9); }
  for (let k = 0; k < 3; k++) { const ph = ((now / 400 + k / 3) % 1); g.fillStyle(k % 2 ? gold : 0xff8a3c, (1 - ph) * 0.8); g.fillCircle(hx + (16 + ph * 10) * f, hy + 8, 2 * (1 - ph) + 0.5); }
};

/** 月夜狼王：直立狼人——灰毛厚背、长臂利爪、狼首尖耳、血月光环与尾巴 */
export const wolfSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f, move } = pose;
  const topY = feetY - PLAYER_H;
  const fur = 0x5a6474, furD = 0x3a4048, red = 0xff3a4a;
  groundShadow(g, pose, 60);
  const step = Math.sin(now / 300) * (move ?? 0);
  const breathe = Math.sin(now / 520) * 1.6;

  // 血月光环（身后）
  for (let k = 2; k >= 0; k--) { g.fillStyle(red, 0.06 + k * 0.04); g.fillCircle(x, topY + 14, 22 + k * 6); }
  // 腿
  for (const s of [-1, 1]) {
    const sw = step * s * 3;
    g.fillStyle(furD, 1);
    g.fillRoundedRect(x + s * 9 + sw * 0.4 - 7, topY + 66, 14, feetY - topY - 72, 5);
    g.fillStyle(fur, 1);
    g.fillRoundedRect(x + s * 9 + sw - 9, feetY - 9, 18, 9, 4);
    g.fillStyle(0x3a4048, 1);
    for (let k = -1; k <= 1; k++) g.fillTriangle(x + s * 9 + sw + k * 5 - 2, feetY - 8, x + s * 9 + sw + k * 5 + 2, feetY - 8, x + s * 9 + sw + k * 5, feetY - 3);
  }
  // 躯干
  g.fillStyle(furD, 0.95);
  g.fillRoundedRect(x - 20, topY + 30 + breathe, 40, 44, 12);
  g.fillStyle(fur, 1);
  g.fillRoundedRect(x - 18, topY + 32 + breathe, 36, 40, 11);
  g.fillStyle(0x9aa4b2, 0.4); // 胸毛
  g.fillEllipse(x, topY + 48 + breathe, 22, 18);
  // 长臂 + 利爪
  for (const s of [-1, 1]) {
    const sw = Math.sin(now / 340 + (s > 0 ? 0 : 0.8)) * (2 + (move ?? 0) * 3);
    g.lineStyle(11, furD, 1);
    g.lineBetween(x + s * 18, topY + 36 + breathe, x + s * 24 + sw, topY + 60);
    g.lineStyle(7, fur, 1);
    g.lineBetween(x + s * 18, topY + 36 + breathe, x + s * 24 + sw, topY + 60);
    g.fillStyle(fur, 1); g.fillCircle(x + s * 24 + sw, topY + 62, 5.4);
    g.fillStyle(0xf0f4f8, 0.95);
    for (let k = 0; k < 3; k++) g.fillTriangle(x + s * 24 + sw + k * 3 - 3, topY + 66, x + s * 24 + sw + k * 3, topY + 66, x + s * 24 + sw + k * 3 - 1.5, topY + 72);
  }
  // 尾巴
  const tw = Math.sin(now / 400) * 8;
  g.lineStyle(7, fur, 1);
  g.beginPath(); g.moveTo(x - 16 * f, topY + 62 + breathe); g.lineTo(x - 28 * f, topY + 70 + tw); g.lineTo(x - 40 * f, topY + 60 + tw * 1.4); g.strokePath();
  g.fillStyle(0x9aa4b2, 0.9); g.fillCircle(x - 40 * f, topY + 60 + tw * 1.4, 4);
  // 狼首
  const hy = topY + 16 + breathe;
  g.fillStyle(fur, 1); g.fillCircle(x, hy, 14);
  g.fillTriangle(x - 8, hy - 8, x - 2, hy - 8, x - 7, hy - 20);
  g.fillTriangle(x + 2, hy - 8, x + 8, hy - 8, x + 7, hy - 20);
  g.fillStyle(0xf0d0c0, 1); g.fillEllipse(x + 5 * f, hy + 6, 12, 8); // 吻
  g.fillStyle(0x2a2a30, 1); g.fillEllipse(x + 7 * f, hy + 4, 4, 3);
  for (const s of [-1, 1]) { g.fillStyle(0x1a1a1e, 1); g.fillCircle(x + s * 5, hy - 2, 3); g.fillStyle(red, 0.9); g.fillCircle(x + s * 5, hy - 2, 1.4); }
  // 獠牙
  g.fillStyle(0xf0f4f8, 0.96);
  g.fillTriangle(x + 3 * f, hy + 8, x + 6 * f, hy + 8, x + 4.5 * f, hy + 12);
  g.fillTriangle(x + 9 * f, hy + 8, x + 12 * f, hy + 8, x + 10.5 * f, hy + 12);
};

/** 丧尸王：驼背的巨型肌肉丧尸——畸形巨肩、暴突肌腱、垂地长臂利爪、缩在肩窝里的烂脸与歪王冠 */
export const zombSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f, move } = pose;
  const topY = feetY - 116; // 比默认更高大
  const skin = 0x7a9a4a, skinD = 0x556e30, skinL = 0x9ab86a, rot = 0x3f3a2e, red = 0x8a1a1a, bone = 0xe0dcc8;
  groundShadow(g, pose, 80);
  const step = Math.sin(now / 300) * (move ?? 0);
  const breathe = Math.sin(now / 520) * 2.2;
  const lean = f * 11; // 越往上去越往前倾（驼背的关键）

  // 粗壮双腿 + 巨足
  for (const s of [-1, 1]) {
    const sw = step * s * 3;
    g.fillStyle(skinD, 1);
    g.fillRoundedRect(x + s * 15 + sw * 0.4 - 10, topY + 74, 20, feetY - topY - 80, 7);
    g.fillStyle(skin, 1);
    g.fillRect(x + s * 15 + sw * 0.4 - 10, topY + 84, 20, 9); // 露出的皮
    g.fillStyle(0x1e1a12, 1);
    g.fillRoundedRect(x + s * 15 + sw - 13, feetY - 9, 26, 9, 4);
    for (let k = -1; k <= 1; k++) { g.fillStyle(bone, 0.75); g.fillTriangle(x + s * 15 + sw + k * 7 - 2, feetY - 9, x + s * 15 + sw + k * 7 + 2, feetY - 9, x + s * 15 + sw + k * 7, feetY - 4); }
  }
  // 骨盆 / 腰
  g.fillStyle(skinD, 0.95);
  g.fillRoundedRect(x - 25, topY + 74, 50, 24, 11);

  // 驼峰 + 厚背上躯干（梯形，上宽下窄，向前倾）
  g.fillStyle(skinD, 0.95);
  g.fillEllipse(x + lean * 0.4 - f * 13, topY + 32, 42, 32);
  g.fillStyle(skin, 1);
  g.fillPoints([
    { x: x - 23 + lean * 0.6, y: topY + 42 + breathe },
    { x: x + 23 + lean * 0.6, y: topY + 42 + breathe },
    { x: x + 17, y: topY + 78 },
    { x: x - 17, y: topY + 78 },
  ] as never, true);
  // 暴突胸肌 / 腹肌
  g.fillStyle(skinL, 0.42);
  g.fillEllipse(x + lean * 0.6 - 10, topY + 52 + breathe, 17, 13);
  g.fillEllipse(x + lean * 0.6 + 10, topY + 52 + breathe, 17, 13);
  g.fillStyle(skinD, 0.35);
  g.fillEllipse(x, topY + 64 + breathe, 13, 11);
  // 破衬衫残片（斜挂）
  g.fillStyle(rot, 0.92);
  g.fillPoints([
    { x: x - 23 + lean * 0.6, y: topY + 44 + breathe },
    { x: x - 3 + lean * 0.6, y: topY + 46 + breathe },
    { x: x - 8, y: topY + 74 },
    { x: x - 20, y: topY + 72 },
  ] as never, true);
  // 裸露的肋骨
  g.lineStyle(2, bone, 0.7);
  for (let k = 0; k < 3; k++) {
    g.beginPath();
    g.moveTo(x + lean * 0.6 + 3, topY + 50 + k * 6);
    g.lineTo(x + lean * 0.6 + 19, topY + 48 + k * 6);
    g.strokePath();
  }
  // 缝合伤口 + 血渍
  g.lineStyle(1.6, 0x2a2418, 0.9);
  g.lineBetween(x - 7, topY + 58, x + 7, topY + 58);
  for (let k = 0; k < 4; k++) g.lineBetween(x - 5 + k * 3.4, topY + 55, x - 5 + k * 3.4, topY + 61);
  g.fillStyle(red, 0.5); g.fillEllipse(x - 3, topY + 64, 11, 5);

  // 畸形巨肩（两个大肌肉球，前倾）
  for (const s of [-1, 1]) {
    const shx = x + s * 27 + lean * 0.5, shy = topY + 36 + breathe * 0.5;
    g.fillStyle(skinD, 0.95); g.fillCircle(shx, shy, 18);
    g.fillStyle(skin, 1); g.fillCircle(shx, shy, 15.6);
    g.fillStyle(skinL, 0.45); g.fillEllipse(shx - 3, shy - 4, 15, 9);
    g.lineStyle(1.4, skinD, 0.55); g.lineBetween(shx - 9, shy + 5, shx + 9, shy - 4);
  }

  // 垂地长臂 + 巨爪（比腿还长，勾在身前）
  for (const s of [-1, 1]) {
    const sw = Math.sin(now / 420 + (s > 0 ? 0 : 0.8)) * (2 + (move ?? 0) * 3);
    const ax = x + s * 27 + lean * 0.5, ay = topY + 40 + breathe * 0.5;
    const ex = x + s * 32 + sw, ey = topY + 72;
    const hx = x + s * 26 + f * 12 + sw, hy2 = topY + 100;
    g.lineStyle(16, skinD, 1);
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(ex, ey); g.lineTo(hx, hy2); g.strokePath();
    g.lineStyle(10, skin, 1);
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(ex, ey); g.lineTo(hx, hy2); g.strokePath();
    g.lineStyle(3, skinL, 0.4);
    g.beginPath(); g.moveTo(ax + s * 2, ay + 5); g.lineTo(ex, ey - 2); g.strokePath();
    // 巨爪
    g.fillStyle(skin, 1); g.fillCircle(hx, hy2, 6.6);
    g.fillStyle(bone, 0.95);
    for (let k = 0; k < 3; k++) g.fillTriangle(hx + (k - 1) * 5 - 2, hy2 + 6, hx + (k - 1) * 5 + 2, hy2 + 6, hx + (k - 1) * 5, hy2 + 15);
  }

  // 头颅（缩在肩窝里）+ 歪王冠
  const hx0 = x + lean * 0.9, hy = topY + 32 + breathe * 0.6;
  g.fillStyle(skinD, 0.95); g.fillCircle(hx0, hy, 13);
  g.fillStyle(skin, 1); g.fillCircle(hx0, hy, 12);
  g.fillStyle(skinD, 0.6); g.fillEllipse(hx0 - 3, hy - 5, 8, 4);
  // 歪王冠（绕头心旋转，正确 pivot）
  g.save();
  g.translateCanvas(hx0, hy);
  g.rotateCanvas(f * 0.22);
  g.fillStyle(0xffd45c, 1);
  g.fillPoints([{ x: -11, y: -9 }, { x: 11, y: -9 }, { x: 10, y: -20 }, { x: 4, y: -14 }, { x: 0, y: -22 }, { x: -4, y: -14 }, { x: -10, y: -20 }] as never, true);
  g.fillStyle(0xfff0b0, 0.7);
  for (let k = -1; k <= 1; k++) g.fillCircle(k * 6, -11, 1.4);
  g.restore();
  // 暴突单眼（发绿光）+ 缝合的另一只
  const glow = 0.6 + 0.4 * Math.sin(now / 260);
  g.fillStyle(0xffffff, 0.95); g.fillCircle(hx0 + 5 * f, hy - 1, 4.4);
  g.fillStyle(0x1a1a0e, 1); g.fillCircle(hx0 + 5 * f, hy - 1, 2);
  g.fillStyle(0x9cff3a, glow); g.fillCircle(hx0 + 5 * f, hy - 1, 1);
  g.lineStyle(1.4, 0x2a2418, 0.9);
  g.lineBetween(hx0 - 9 * f, hy - 2, hx0 - 1 * f, hy - 2);
  g.lineBetween(hx0 - 6 * f, hy - 5, hx0 - 4 * f, hy + 1);
  // 烂嘴獠牙
  g.fillStyle(0x3a1a1a, 1); g.fillEllipse(hx0 + 2 * f, hy + 7, 13, 5);
  for (let k = 0; k < 4; k++) { g.fillStyle(bone, 0.9); g.fillRect(hx0 - 4 * f + k * 3.4 * f, hy + 5, 2, 4.4); }
  // 苍蝇
  for (let k = 0; k < 2; k++) { const ang = now / 300 + k * 3; g.fillStyle(0x1a1a1a, 0.8); g.fillCircle(hx0 + 14 + Math.cos(ang) * 6, hy - 10 + Math.sin(ang) * 5, 1.4); }
};

/** 大便人：螺旋状的棕色便便人——层叠身体、圆眼笑脸、小短手，头顶一只小苍蝇 */
export const toilSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, move } = pose;
  const brown = 0x8a5a2a, brownL = 0xa9763a, brownD = 0x5a3a18;
  groundShadow(g, pose, 52);
  const bob = Math.abs(Math.sin(now / 320)) * ((move ?? 0) * 2 + 1.2);
  const baseY = feetY - bob * 0.5;

  // 三层螺旋身体（下大上小）
  g.fillStyle(brownD, 0.95);
  g.fillEllipse(x, baseY - 12, 62, 26);
  g.fillStyle(brownL, 1);
  g.fillEllipse(x, baseY - 13, 58, 23);
  g.fillStyle(brown);
  g.fillEllipse(x, baseY - 34, 46, 22);
  g.fillStyle(brownL, 1);
  g.fillEllipse(x, baseY - 35, 42, 19);
  g.fillStyle(brown);
  g.fillEllipse(x, baseY - 52, 30, 17);
  g.fillStyle(brownL, 0.9);
  g.fillEllipse(x - 3, baseY - 54, 20, 12);
  // 螺旋顶
  g.fillStyle(brown);
  g.beginPath();
  g.moveTo(x - 8, baseY - 60);
  g.lineTo(x + 8, baseY - 62);
  g.lineTo(x + 3, baseY - 74);
  g.lineTo(x - 4, baseY - 68);
  g.closePath(); g.fillPath();
  g.fillStyle(brownD, 0.5);
  g.fillEllipse(x + 2, baseY - 66, 6, 4);
  // 短手
  for (const s of [-1, 1]) {
    const sw = Math.sin(now / 360 + (s > 0 ? 0 : 0.8)) * 3;
    g.fillStyle(brownD, 1);
    g.lineStyle(8, brownD, 1);
    g.lineBetween(x + s * 24, baseY - 34, x + s * 33 + sw, baseY - 24);
    g.lineStyle(5, brownL, 1);
    g.lineBetween(x + s * 24, baseY - 34, x + s * 33 + sw, baseY - 24);
    g.fillStyle(brownL, 1); g.fillCircle(x + s * 33 + sw, baseY - 24, 4.4);
  }
  // 大眼 + 笑脸
  for (const s of [-1, 1]) {
    g.fillStyle(0xffffff, 1); g.fillCircle(x + s * 8, baseY - 42, 6);
    g.fillStyle(0x2a1a0e, 1); g.fillCircle(x + s * 8, baseY - 41, 3);
    g.fillStyle(0xffffff, 0.9); g.fillCircle(x + s * 8 - 1, baseY - 42.5, 1.2);
  }
  g.lineStyle(2, 0x2a1a0e, 0.9);
  g.beginPath(); g.arc(x, baseY - 32, 7, 0.15 * Math.PI, 0.85 * Math.PI); g.strokePath();
  // 腮红
  g.fillStyle(0xd98a6a, 0.5); g.fillCircle(x - 15, baseY - 36, 3.4); g.fillCircle(x + 15, baseY - 36, 3.4);
  // 头顶小苍蝇
  const ang = now / 260;
  g.fillStyle(0x1a1a1a, 0.85); g.fillCircle(x + Math.cos(ang) * 8, baseY - 80 + Math.sin(ang) * 3, 1.6);
  g.fillStyle(0x9aa4b2, 0.6); g.fillEllipse(x + Math.cos(ang) * 8 - 2, baseY - 82 + Math.sin(ang) * 3, 4, 2);
};
