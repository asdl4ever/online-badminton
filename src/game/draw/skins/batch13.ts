import { groundShadow, type SkinPainter } from './shared';
import { PLAYER_H } from '../../constants';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 批十三 5★ 皮肤：尼斯湖水怪 / 熊大 / 大脚怪 */

/** 尼斯湖水怪：从湖里探出的长颈水怪——圆厚身躯、蛇形长颈、小三角头、四只鳍足，四周荡开涟漪 */
export const lochSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f, move } = pose;
  const bob = Math.sin(now / 620) * 2.6;
  const neckBaseY = feetY - 34;
  const headX = x + f * 12 + Math.sin(now / 900) * 4;
  const headY = feetY - 112 + bob;
  const teal = 0x35d8a8, deep = 0x1c5a4e, dark = 0x0e3a3a, belly = 0x8fe8c8;
  groundShadow(g, pose, 84);

  // 湖面（身下荡开的涟漪）
  g.fillStyle(dark, 0.55);
  g.fillEllipse(x, feetY + 1, 96, 22);
  g.fillStyle(deep, 0.6);
  g.fillEllipse(x, feetY - 1, 80, 16);
  for (let k = 0; k < 2; k++) {
    const ph = ((now / 1400 + k / 2) % 1);
    g.lineStyle(1.8 - ph, 0x8fe8c8, 0.45 * (1 - ph));
    g.save(); g.translateCanvas(x, feetY); g.scaleCanvas(1, 0.24);
    g.beginPath(); g.arc(0, 0, 20 + ph * 46, 0, Math.PI * 2); g.strokePath();
    g.restore();
  }

  // 四只鳍足
  for (const [lx, ph] of [[-30, 0], [-14, Math.PI], [12, Math.PI], [28, 0]] as Array<[number, number]>) {
    const sw = Math.sin(now / 340 + ph) * 4 * (0.5 + (move ?? 0));
    g.fillStyle(deep, 0.95);
    g.fillEllipse(x + lx * f + sw, feetY - 6, 22, 12);
    g.fillStyle(belly, 0.4);
    g.fillEllipse(x + lx * f + sw, feetY - 6, 14, 6);
  }

  // 身躯（水下圆厚的一截）
  g.fillStyle(dark, 0.95);
  g.fillEllipse(x, feetY - 22 + bob * 0.3, 88, 44);
  g.fillStyle(teal, 1);
  g.fillEllipse(x, feetY - 24 + bob * 0.3, 78, 38);
  g.fillStyle(belly, 0.35); // 腹部浅色
  g.fillEllipse(x, feetY - 14 + bob * 0.3, 60, 16);
  // 背脊小鳍
  for (let k = -3; k <= 3; k++) {
    g.fillStyle(deep, 1);
    g.fillTriangle(x + k * 9, feetY - 40 + bob * 0.3, x + k * 9 + 4, feetY - 40 + bob * 0.3, x + k * 9 + 2, feetY - 50 + bob * 0.3);
  }

  // 长颈（从身躯到头部）
  g.lineStyle(16, dark, 0.95);
  g.beginPath();
  g.moveTo(x - f * 4, neckBaseY);
  g.lineTo(x + f * 6 + Math.sin(now / 900) * 2, feetY - 74 + bob);
  g.lineTo(headX, headY + 6);
  g.strokePath();
  g.lineStyle(12, teal, 1);
  g.beginPath();
  g.moveTo(x - f * 4, neckBaseY);
  g.lineTo(x + f * 6 + Math.sin(now / 900) * 2, feetY - 74 + bob);
  g.lineTo(headX, headY + 6);
  g.strokePath();
  g.lineStyle(4, belly, 0.4); // 颈部浅纹
  g.beginPath();
  g.moveTo(x - f * 2, neckBaseY - 2);
  g.lineTo(x + f * 8 + Math.sin(now / 900) * 2, feetY - 74 + bob);
  g.strokePath();

  // 头（小三角）
  g.fillStyle(teal, 1);
  g.fillEllipse(headX, headY, 26, 15);
  g.fillStyle(belly, 0.45);
  g.fillTriangle(headX - 6 * f, headY - 7, headX + 6 * f, headY - 7, headX, headY - 18); // 头冠
  // 吻部
  g.fillStyle(deep, 1);
  g.fillRoundedRect(headX + (f > 0 ? 6 : -14), headY + 1, 8, 4, 2);
  // 眼睛
  g.fillStyle(0x06201e, 1);
  g.fillCircle(headX + 4 * f, headY - 3, 2.4);
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(headX + 4.6 * f, headY - 3.6, 0.9);
  // 头顶挂着的水珠
  for (let k = 0; k < 2; k++) {
    const ph = ((now / 900 + k / 2) % 1);
    g.fillStyle(belly, 0.7 * (1 - ph));
    g.fillCircle(headX - 4 + k * 8, headY - 8 - ph * 8, 1.4 * (1 - ph) + 0.4);
  }
};

/** 熊大：直立的大棕熊——圆胖身躯、浅色圆肚、短腿大脚、圆耳口鼻，手里拎着一截木头 */
export const boonSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f, move } = pose;
  const topY = feetY - PLAYER_H;
  const brown = 0x8a5a3a, brownD = 0x5a3820, belly = 0xd8a878, snout = 0xf0d8b8;
  groundShadow(g, pose, 56);
  const step = Math.sin(now / 300) * (move ?? 0);
  const breathe = Math.sin(now / 520) * 1.4;

  // 短腿 + 大脚掌
  for (const s of [-1, 1]) {
    const sw = step * s * 3;
    g.fillStyle(brownD, 1);
    g.fillRoundedRect(x + s * 10 + sw * 0.4 - 7, topY + 70, 14, feetY - topY - 74, 6);
    g.fillStyle(brown, 1);
    g.fillRoundedRect(x + s * 10 + sw - 9, feetY - 10, 18, 10, 4); // 脚掌
    g.fillStyle(0x3a2418, 0.9); // 脚趾
    for (let k = -1; k <= 1; k++) g.fillCircle(x + s * 10 + sw + k * 5, feetY - 10, 1.8);
  }

  // 身躯（圆胖）
  g.fillStyle(brownD, 0.95);
  g.fillRoundedRect(x - 24, topY + 30 + breathe, 48, 46, 16);
  g.fillStyle(brown, 1);
  g.fillRoundedRect(x - 22, topY + 32 + breathe, 44, 42, 15);
  // 浅色圆肚
  g.fillStyle(belly, 0.9);
  g.fillEllipse(x, topY + 56 + breathe, 30, 26);
  g.fillStyle(0xc89a68, 0.5);
  g.fillEllipse(x, topY + 60 + breathe, 20, 16);

  // 手臂（前伸拎木头的这只 + 自然下垂的）
  for (const s of [-1, 1]) {
    const sw = Math.sin(now / 340 + (s > 0 ? 0 : 0.8)) * (2 + (move ?? 0) * 3);
    g.fillStyle(brownD, 1);
    g.lineStyle(12, brownD, 1);
    g.lineBetween(x + s * 22, topY + 38 + breathe, x + s * 27 + sw, topY + 60);
    g.lineStyle(6, brown, 1);
    g.lineBetween(x + s * 22, topY + 38 + breathe, x + s * 27 + sw, topY + 60);
    g.fillStyle(brown, 1); // 熊掌
    g.fillCircle(x + s * 27 + sw, topY + 62, 7);
    g.fillStyle(0x3a2418, 0.9);
    for (let k = -1; k <= 1; k++) g.fillCircle(x + s * 27 + sw + k * 3.4, topY + 66, 1.6);
  }

  // 头（圆 + 圆耳 + 口鼻）
  const hy = topY + 18 + breathe;
  g.fillStyle(brownD, 0.95);
  g.fillCircle(x, hy, 17);
  g.fillStyle(brown, 1);
  g.fillCircle(x, hy, 15.5);
  for (const s of [-1, 1]) { // 圆耳
    g.fillStyle(brown, 1);
    g.fillCircle(x + s * 12, hy - 12, 6.4);
    g.fillStyle(brownD, 0.9);
    g.fillCircle(x + s * 12, hy - 12, 3.4);
  }
  // 口鼻
  g.fillStyle(snout, 1);
  g.fillEllipse(x + f * 3, hy + 6, 16, 11);
  g.fillStyle(0x3a2418, 1); // 鼻
  g.fillEllipse(x + f * 5, hy + 3, 5, 3.4);
  // 眼睛
  for (const s of [-1, 1]) {
    g.fillStyle(0x2a1a0e, 1);
    g.fillCircle(x + s * 6, hy - 3, 2.2);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(x + s * 6 + 0.6, hy - 3.6, 0.8);
  }
  // 头顶小呆毛
  g.lineStyle(2, brownD, 1);
  g.lineBetween(x, hy - 15, x + f * 3, hy - 21);

  // 空手侧拎着一小段木头（呼应光头强）
  g.save();
  g.translateCanvas(x - f * 30, topY + 64);
  g.rotateCanvas(f * (0.3 + Math.sin(now / 700) * 0.05));
  g.fillStyle(0x6a4a2a, 1);
  g.fillRoundedRect(-3, -14, 6, 28, 3);
  g.fillStyle(0xb8945a, 0.8);
  g.fillEllipse(0, -14, 6, 4);
  g.lineStyle(1.4, 0x4a3018, 0.8);
  g.lineBetween(0, -14, 0, -8);
  g.restore();
};

/** 大脚怪：高壮的雪山野人——浓毛覆盖的躯干、驼背长臂、眉骨粗重的锥形头、巨大毛脚 */
export const bigfSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f, move } = pose;
  const topY = feetY - PLAYER_H;
  const fur = 0x6a5540, furD = 0x4a3828, furL = 0x8a7458, skin = 0x9a7a5a;
  groundShadow(g, pose, 62);
  const step = Math.sin(now / 340) * (move ?? 0);
  const breathe = Math.sin(now / 560) * 1.6;
  const hy = topY + 14 + breathe;

  // 长毛腿 + 巨大的毛脚
  for (const s of [-1, 1]) {
    const sw = step * s * 3;
    g.fillStyle(furD, 1);
    g.fillRoundedRect(x + s * 11 + sw * 0.4 - 8, topY + 74, 16, feetY - topY - 80, 7);
    g.fillStyle(fur, 1);
    g.fillRoundedRect(x + s * 11 + sw - 12, feetY - 10, 24, 10, 5); // 大脚
    g.fillStyle(furL, 0.6);
    for (let k = 0; k < 5; k++) g.fillCircle(x + s * 11 + sw - 10 + k * 5, feetY - 12 + Math.abs(k - 2), 1.6);
  }

  // 躯干（前倾驼背的毛团）
  g.fillStyle(furD, 0.95);
  g.beginPath();
  g.moveTo(x - 22, topY + 34 + breathe);
  g.lineTo(x + 20, topY + 30 + breathe);
  g.lineTo(x + 26, topY + 66 + breathe);
  g.lineTo(x - 24, topY + 70 + breathe);
  g.closePath(); g.fillPath();
  g.fillStyle(fur, 1);
  g.beginPath();
  g.moveTo(x - 19, topY + 36 + breathe);
  g.lineTo(x + 17, topY + 33 + breathe);
  g.lineTo(x + 22, topY + 64 + breathe);
  g.lineTo(x - 20, topY + 67 + breathe);
  g.closePath(); g.fillPath();
  // 毛皮纹理
  g.lineStyle(1.6, furL, 0.5);
  for (let k = 0; k < 6; k++) {
    const mx = x - 16 + k * 6;
    g.beginPath(); g.moveTo(mx, topY + 38 + breathe); g.lineTo(mx + 2, topY + 64 + breathe); g.strokePath();
  }

  // 长臂（垂到膝下）
  for (const s of [-1, 1]) {
    const sw = Math.sin(now / 380 + (s > 0 ? 0 : 0.7)) * (2 + (move ?? 0) * 3);
    g.lineStyle(13, furD, 1);
    g.lineBetween(x + s * 20, topY + 40 + breathe, x + s * 26 + sw, topY + 64);
    g.lineBetween(x + s * 26 + sw, topY + 64, x + s * 24 + sw, topY + 84);
    g.lineStyle(8, fur, 1);
    g.lineBetween(x + s * 20, topY + 40 + breathe, x + s * 26 + sw, topY + 64);
    g.lineBetween(x + s * 26 + sw, topY + 64, x + s * 24 + sw, topY + 84);
    g.fillStyle(skin, 1); // 大手掌
    g.fillCircle(x + s * 24 + sw, topY + 88, 6);
  }

  // 头（眉骨粗重的锥形头）
  g.fillStyle(fur, 1);
  g.beginPath();
  g.moveTo(x - 13, hy + 8);
  g.lineTo(x - 10, hy - 10);
  g.lineTo(x, hy - 20);
  g.lineTo(x + 10, hy - 10);
  g.lineTo(x + 13, hy + 8);
  g.closePath(); g.fillPath();
  // 面部
  g.fillStyle(skin, 1);
  g.fillEllipse(x + f * 2, hy + 1, 20, 18);
  // 眉骨
  g.fillStyle(furD, 1);
  g.fillRoundedRect(x - 10, hy - 6, 20, 5, 2.5);
  // 眼睛（深陷发光）
  for (const s of [-1, 1]) {
    g.fillStyle(0x1a1208, 1);
    g.fillEllipse(x + s * 6, hy - 1, 5, 4);
    g.fillStyle(0xffd45c, 0.85);
    g.fillCircle(x + s * 6 + f, hy - 1, 1.4);
  }
  // 宽鼻 + 嘴
  g.fillStyle(0x3a2a18, 1);
  g.fillEllipse(x + f * 2, hy + 6, 7, 4);
  g.lineStyle(1.6, 0x3a2a18, 0.9);
  g.lineBetween(x - 4, hy + 10, x + 4, hy + 10);
  // 头顶乱毛
  g.lineStyle(2, furL, 0.9);
  for (let k = -2; k <= 2; k++) g.lineBetween(x + k * 4, hy - 14, x + k * 5, hy - 22 - Math.abs(k));

  // 呼吸白雾（雪山寒气）
  for (let k = 0; k < 2; k++) {
    const ph = ((now / 1400 + k / 2) % 1);
    g.fillStyle(0xffffff, 0.3 * (1 - ph));
    g.fillCircle(x + f * (10 + ph * 14), hy + 6 - ph * 6, 2 + ph * 3);
  }
};

/** 熊二：比熊大更圆胖、毛色更浅的棕熊——矮一截、睡眼惺忪，怀里抱着一个蜜罐 */
export const boonTwo: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f, move } = pose;
  const topY = feetY - 104;
  const brown = 0xa9764c, brownD = 0x7a5230, belly = 0xe8c49a, snout = 0xf5e0c4;
  groundShadow(g, pose, 54);
  const step = Math.sin(now / 320) * (move ?? 0);
  const breathe = Math.sin(now / 560) * 1.6;

  // 短腿 + 大脚掌
  for (const s of [-1, 1]) {
    const sw = step * s * 3;
    g.fillStyle(brownD, 1);
    g.fillRoundedRect(x + s * 10 + sw * 0.4 - 7, topY + 68, 14, feetY - topY - 72, 6);
    g.fillStyle(brown, 1);
    g.fillRoundedRect(x + s * 10 + sw - 9, feetY - 9, 18, 9, 4);
    g.fillStyle(0x3a2418, 0.9);
    for (let k = -1; k <= 1; k++) g.fillCircle(x + s * 10 + sw + k * 5, feetY - 9, 1.7);
  }

  // 圆胖身躯
  g.fillStyle(brownD, 0.95);
  g.fillRoundedRect(x - 25, topY + 28 + breathe, 50, 46, 18);
  g.fillStyle(brown, 1);
  g.fillRoundedRect(x - 23, topY + 30 + breathe, 46, 42, 17);
  g.fillStyle(belly, 0.9);
  g.fillEllipse(x, topY + 54 + breathe, 32, 27);
  g.fillStyle(0xd8b088, 0.5);
  g.fillEllipse(x, topY + 58 + breathe, 20, 16);

  // 双臂抱着蜜罐
  for (const s of [-1, 1]) {
    const sw = Math.sin(now / 360 + (s > 0 ? 0 : 0.7)) * (1.5 + (move ?? 0) * 2);
    g.lineStyle(11, brownD, 1);
    g.lineBetween(x + s * 22, topY + 38 + breathe, x + s * 14 + sw, topY + 58);
    g.lineStyle(6, brown, 1);
    g.lineBetween(x + s * 22, topY + 38 + breathe, x + s * 14 + sw, topY + 58);
    g.fillStyle(brown, 1);
    g.fillCircle(x + s * 14 + sw, topY + 60, 6.4);
  }

  // 头（圆 + 圆耳 + 口鼻 + 睡眼）
  const hy = topY + 17 + breathe;
  g.fillStyle(brownD, 0.95);
  g.fillCircle(x, hy, 16.5);
  g.fillStyle(brown, 1);
  g.fillCircle(x, hy, 15);
  for (const s of [-1, 1]) {
    g.fillStyle(brown, 1);
    g.fillCircle(x + s * 12, hy - 12, 6);
    g.fillStyle(brownD, 0.9);
    g.fillCircle(x + s * 12, hy - 12, 3.2);
  }
  // 口鼻
  g.fillStyle(snout, 1);
  g.fillEllipse(x + f * 3, hy + 6, 15, 10);
  g.fillStyle(0x3a2418, 1);
  g.fillEllipse(x + f * 4, hy + 3, 4.6, 3.2);
  // 睡眼（半眯：上眼睑压下来）
  for (const s of [-1, 1]) {
    g.fillStyle(0x2a1a0e, 1);
    g.fillEllipse(x + s * 6, hy - 2, 5, 3);
    g.fillStyle(brown, 1); // 上睑
    g.fillEllipse(x + s * 6, hy - 3.6, 5.4, 2.6);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(x + s * 6 - 0.8, hy - 1.4, 0.7);
  }
  // 头顶呆毛
  g.lineStyle(2, brownD, 1);
  g.lineBetween(x, hy - 14, x - f * 3, hy - 20);

  // 怀里的蜜罐
  const jx = x, jy = topY + 62 + breathe;
  g.fillStyle(0xd9a63c, 1);
  g.fillRoundedRect(jx - 10, jy - 6, 20, 18, 5);
  g.fillStyle(0x8a5a1a, 1);
  g.fillRoundedRect(jx - 12, jy - 9, 24, 5, 2.4); // 罐盖
  g.fillStyle(0xffcf5c, 0.85);
  g.fillRect(jx - 8, jy - 2, 16, 3); // 蜜面
  g.fillStyle(0xffe89a, 0.9);
  g.fillCircle(jx, jy - 1, 1.4);
  for (let k = 0; k < 2; k++) { // 溢出的蜜
    const ph = ((now / 900 + k / 2) % 1);
    g.fillStyle(0xffcf5c, 0.8 * (1 - ph));
    g.fillEllipse(jx - 4 + k * 8, jy + 12 + ph * 6, 2.2, 3.6);
  }
};

/** 光头强：矮墩墩的伐木工——光头大鼻、八字胡，黄衬衫配绿马甲、蓝工装裤，手里拎着小电锯 */
export const boonQiang: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f, move } = pose;
  const topY = feetY - 96;
  const skin = 0xf0c49a, skinD = 0xd8a878, vest = 0x3f6136, shirt = 0xf0c040;
  const pants = 0x2a4a6a, boot = 0x3a2a18;
  groundShadow(g, pose, 48);
  const step = Math.sin(now / 320) * (move ?? 0);
  const breathe = Math.sin(now / 600) * 1.2;

  // 腿（蓝工装裤 + 棕靴）
  for (const s of [-1, 1]) {
    const sw = step * s * 3;
    g.fillStyle(pants, 1);
    g.fillRoundedRect(x + s * 7 + sw * 0.4 - 5.5, topY + 66, 11, feetY - topY - 70, 3.4);
    g.fillStyle(boot, 1);
    g.fillRoundedRect(x + s * 7 + sw - 7, feetY - 8, 14, 8, 3);
    g.fillStyle(0x5a4634, 0.9);
    g.fillRect(x + s * 7 + sw - 7, feetY - 8, 14, 2);
  }

  // 躯干（黄衬衫 + 绿马甲 + 腰带）
  g.fillStyle(shirt, 1);
  g.fillRoundedRect(x - 15, topY + 28 + breathe, 30, 40, 7);
  g.fillStyle(vest, 1);
  g.fillRoundedRect(x - 16, topY + 30 + breathe, 13, 38, 5);
  g.fillRoundedRect(x + 3, topY + 30 + breathe, 13, 38, 5);
  g.fillStyle(0x2f4a2a, 0.85);
  g.fillRect(x - 15, topY + 46 + breathe, 30, 2);
  g.fillStyle(0x8a5a2a, 1);
  g.fillRect(x - 3, topY + 44 + breathe, 6, 6);

  // 手臂
  for (const s of [-1, 1]) {
    const sw = Math.sin(now / 360 + (s > 0 ? 0 : 0.8)) * (2 + (move ?? 0) * 2.5);
    g.lineStyle(9, shirt, 1);
    g.lineBetween(x + s * 14, topY + 34 + breathe, x + s * 18 + sw, topY + 50);
    g.lineStyle(7, vest, 1);
    g.lineBetween(x + s * 14, topY + 34 + breathe, x + s * 17, topY + 40 + breathe);
    g.fillStyle(skin, 1); // 手
    g.fillCircle(x + s * 18 + sw, topY + 52, 4);
  }

  // 头（光头 + 大鼻 + 八字胡 + 粗眉）
  const hy = topY + 15 + breathe;
  g.fillStyle(skinD, 1);
  g.fillCircle(x, hy + 0.5, 12.6);
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 12);
  g.fillStyle(0xffe0c0, 0.6); // 光头高光
  g.fillEllipse(x - 4, hy - 6, 8, 4);
  g.fillStyle(0x2a2018, 1); // 两侧残发
  g.fillEllipse(x - 11, hy + 3, 3, 5);
  g.fillEllipse(x + 11, hy + 3, 3, 5);
  // 粗眉
  g.fillStyle(0x2a2018, 1);
  g.fillRoundedRect(x - 8, hy - 4, 6.4, 2.6, 1.2);
  g.fillRoundedRect(x + 2, hy - 4, 6.4, 2.6, 1.2);
  // 小眼睛
  for (const s of [-1, 1]) {
    g.fillStyle(0x1a1208, 1);
    g.fillCircle(x + s * 4.4, hy, 1.8);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(x + s * 4.4 - 0.6, hy - 0.6, 0.6);
  }
  // 大鼻子
  g.fillStyle(skinD, 1);
  g.fillEllipse(x, hy + 3.5, 5.4, 4.4);
  g.fillStyle(0xe0705a, 0.5);
  g.fillEllipse(x, hy + 4, 3, 2.4);
  // 八字胡
  g.fillStyle(0x2a2018, 1);
  g.fillTriangle(x - 1, hy + 6, x - 8, hy + 8, x - 1, hy + 9);
  g.fillTriangle(x + 1, hy + 6, x + 8, hy + 8, x + 1, hy + 9);
  // 嘴
  g.lineStyle(1.2, 0x8a4a3a, 0.8);
  g.lineBetween(x - 2, hy + 10, x + 2, hy + 10);

  // 手里拎着的小电锯
  g.save();
  g.translateCanvas(x + f * 22, topY + 52);
  g.rotateCanvas(f * (0.4 + Math.sin(now / 500) * 0.06));
  g.fillStyle(0xc04a2a, 1); // 机身
  g.fillRoundedRect(-6, -5, 12, 10, 3);
  g.fillStyle(0x8a94a2, 1); // 导板
  g.fillRect(f > 0 ? 4 : -16, -2.4, 12, 4.8);
  g.fillStyle(0xd8d4c8, 0.9); // 链齿
  for (let k = 0; k < 5; k++) {
    const bx = (f > 0 ? 6 : -14) + k * 2.6;
    g.fillTriangle(bx, -2.8, bx + 1.6, -2.8, bx + 0.8, -4.6);
  }
  g.fillStyle(0x3a3a42, 1); // 提手
  g.fillRect(-3, -8, 5, 4);
  g.restore();
};
