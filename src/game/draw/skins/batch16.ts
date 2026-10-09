import { groundShadow, type SkinPainter } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 批十六 5★ 神话皮肤：三相神·梵天 / 天照大御神 / 大德鲁伊 / 马尔杜克 / 克苏鲁 */

/** 三相神·梵天：四面四臂的金色神祇，额生第三眼、身周金莲光环 */
export const vdaDeity: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, move } = pose;
  const gold = 0xffc04a, goldD = 0xb87a1a, robe = 0xe8902a, glow = 0xfff0b0, teal = 0x2fa8a0;
  groundShadow(g, pose, 66);
  const topY = feetY - 112;
  const breathe = Math.sin(now / 520) * 2;
  const step = Math.sin(now / 300) * (move ?? 0);
  // 莲座
  for (let k = 0; k < 9; k++) { const ang = Math.PI * 0.1 + (k / 8) * Math.PI * 0.8; g.fillStyle(k % 2 ? 0xffb7d5 : 0xff8ab0, 0.9); g.fillEllipse(x + Math.cos(ang) * 34, feetY - 2 + Math.sin(ang) * 6, 14, 7); }
  // 双腿（盘坐感）
  g.fillStyle(goldD, 1); g.fillRoundedRect(x - 22 + step, feetY - 30, 44, 26, 10);
  g.fillStyle(robe, 1); g.fillRoundedRect(x - 20 + step, feetY - 28, 40, 22, 9);
  // 长袍躯干
  g.fillStyle(goldD, 0.95); g.beginPath(); g.moveTo(x - 24, topY + 46 + breathe); g.lineTo(x + 24, topY + 46 + breathe); g.lineTo(x + 28, feetY - 24); g.lineTo(x - 28, feetY - 24); g.closePath(); g.fillPath();
  g.fillStyle(robe, 1); g.beginPath(); g.moveTo(x - 21, topY + 48 + breathe); g.lineTo(x + 21, topY + 48 + breathe); g.lineTo(x + 24, feetY - 26); g.lineTo(x - 24, feetY - 26); g.closePath(); g.fillPath();
  g.fillStyle(0xffd45c, 0.5); g.fillRect(x - 3, topY + 50 + breathe, 6, feetY - topY - 78);
  // 四臂（两条向上持法轮/莲花，两条合十）
  for (const s of [-1, 1]) {
    const sw = Math.sin(now / 340 + (s > 0 ? 0 : 0.8)) * (2 + (move ?? 0) * 3);
    // 上臂
    g.lineStyle(9, goldD, 1); g.lineBetween(x + s * 22, topY + 50 + breathe, x + s * 40, topY + 22 + breathe);
    g.lineStyle(6, gold, 1); g.lineBetween(x + s * 22, topY + 50 + breathe, x + s * 40, topY + 22 + breathe);
    g.fillStyle(gold, 1); g.fillCircle(x + s * 40, topY + 20 + breathe, 5);
    g.fillStyle(teal, 0.9); g.fillCircle(x + s * 40, topY + 20 + breathe, 2.4);
    // 下臂
    g.lineStyle(9, goldD, 1); g.lineBetween(x + s * 22, topY + 52 + breathe, x + s * 32 + sw, topY + 76);
    g.lineStyle(6, gold, 1); g.lineBetween(x + s * 22, topY + 52 + breathe, x + s * 32 + sw, topY + 76);
    g.fillStyle(gold, 1); g.fillCircle(x + s * 32 + sw, topY + 78, 4.4);
  }
  // 四张脸（正面一张 + 两侧各一 + 后脑一张暗示），第三眼
  const hy = topY + 30 + breathe;
  for (const [dx, fa] of [[0, 1], [-13, 0.6], [13, 0.6], [0, 0.35]] as Array<[number, number]>) {
    g.fillStyle(gold, 1); g.fillCircle(x + dx, hy, 11 * (0.6 + fa * 0.4));
    g.fillStyle(goldD, 1); g.fillEllipse(x + dx, hy - 8, 20, 7); // 发髻
    if (fa > 0.5) { g.fillStyle(0x1a1a1e, 1); g.fillCircle(x + dx - 3, hy - 1, 1.6); g.fillCircle(x + dx + 3, hy - 1, 1.6); }
  }
  const gl = 0.6 + 0.4 * Math.sin(now / 300);
  g.fillStyle(teal, gl); g.fillEllipse(x, hy - 6, 8, 5);
  g.fillStyle(0xffffff, gl * 0.9); g.fillCircle(x, hy - 6, 1.6);
  // 金冠
  g.fillStyle(gold, 1); g.fillPoints([{ x: x - 14, y: hy - 12 }, { x: x, y: hy - 30 }, { x: x + 14, y: hy - 12 }] as never, true);
  g.fillStyle(0xffffff, 0.6); g.fillCircle(x, hy - 22, 2.4);
  // 身周光轮
  for (let k = 3; k >= 0; k--) { g.fillStyle(k % 2 ? gold : glow, 0.08 * (1 - k * 0.18)); g.fillCircle(x, topY + 40, 40 + k * 16); }
  const pulse = 0.5 + 0.5 * Math.sin(now / 400);
  for (let k = 0; k < 10; k++) { const ang = (k / 10) * Math.PI * 2 + now / 1800; g.fillStyle(glow, 0.6 * pulse); g.fillCircle(x + Math.cos(ang) * 58, topY + 40 + Math.sin(ang) * 58, 1.6); }
};

/** 天照大御神：日神女神，身后八咫镜放光、长发与长袖飘曳、周身日芒 */
export const takAmaterasu: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f, move } = pose;
  const robe = 0xfff0d8, accent = 0xc0392b, gold = 0xffd45c;
  groundShadow(g, pose, 60);
  const topY = feetY - 110;
  const breathe = Math.sin(now / 560) * 2;
  const step = Math.sin(now / 320) * (move ?? 0);
  // 身后八咫镜 + 日芒
  const mx = x - 30 * f, my = topY + 26;
  for (let k = 0; k < 16; k++) { const ang = (k / 16) * Math.PI * 2 + now / 3000; const len = 20 + (k % 2) * 10; g.fillStyle(gold, 0.18); g.beginPath(); g.moveTo(mx + Math.cos(ang) * 12, my + Math.sin(ang) * 12); g.lineTo(mx + Math.cos(ang + 0.1) * (12 + len), my + Math.sin(ang + 0.1) * (12 + len)); g.lineTo(mx + Math.cos(ang - 0.1) * (12 + len), my + Math.sin(ang - 0.1) * (12 + len)); g.closePath(); g.fillPath(); }
  g.fillStyle(accent, 1); g.fillCircle(mx, my, 18);
  g.fillStyle(gold, 1); g.fillCircle(mx, my, 15);
  g.fillStyle(0xffe8b0, 1); g.fillCircle(mx, my, 12);
  g.fillStyle(0xffffff, 0.4 + 0.3 * Math.sin(now / 400)); g.fillCircle(mx - 3, my - 3, 5);
  // 长袍
  g.fillStyle(accent, 1); g.beginPath(); g.moveTo(x - 18, topY + 40 + breathe); g.lineTo(x + 18, topY + 40 + breathe); g.lineTo(x + 26, feetY - 18); g.lineTo(x - 26, feetY - 18); g.closePath(); g.fillPath();
  g.fillStyle(robe, 1); g.beginPath(); g.moveTo(x - 15, topY + 42 + breathe); g.lineTo(x + 15, topY + 42 + breathe); g.lineTo(x + 22, feetY - 20); g.lineTo(x - 22, feetY - 20); g.closePath(); g.fillPath();
  g.fillStyle(accent, 0.5); g.fillRect(x - 3, topY + 44 + breathe, 6, feetY - topY - 66);
  // 长袖（飘曳）
  for (const s of [-1, 1]) {
    const sw = Math.sin(now / 420 + s) * 5 + (move ?? 0) * 6 * s;
    g.fillStyle(robe, 0.95); g.fillPoints([{ x: x + s * 16, y: topY + 50 + breathe }, { x: x + s * 34 + sw, y: topY + 60 }, { x: x + s * 30 + sw * 1.4, y: topY + 92 }, { x: x + s * 14, y: topY + 82 }] as never, true);
  }
  // 长发
  const hs = Math.sin(now / 300) * 3;
  g.fillStyle(0x1a1a24, 0.95); g.fillPoints([{ x: x - 12, y: topY + 20 }, { x: x + 12, y: topY + 20 }, { x: x + 16 + hs, y: feetY - 40 }, { x: x - 16 + hs, y: feetY - 44 }] as never, true);
  // 头 + 天冠
  const hy = topY + 18 + breathe;
  g.fillStyle(0xffe0c0, 1); g.fillCircle(x, hy, 11);
  g.fillStyle(0x1a1a24, 1); g.fillEllipse(x, hy - 9, 22, 9);
  g.fillStyle(gold, 1); g.fillRoundedRect(x - 13, hy - 12, 26, 5, 2);
  g.fillStyle(accent, 1); g.fillCircle(x, hy - 16, 3);
  g.fillStyle(0x1a1a1e, 1); g.fillCircle(x - 4, hy + 1, 1.6); g.fillCircle(x + 4, hy + 1, 1.6);
  g.fillStyle(0xffb088, 1); g.fillEllipse(x, hy + 5, 5, 2.4);
  void step;
};

/** 大德鲁伊：鹿角兜帽长袍，手杖浮符文、脚下生草丛 */
export const celtDruid: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, move } = pose;
  const robe = 0x2f7a4a, robeD = 0x1e5a36, bark = 0x6a4a2a, glow = 0xd8ff9a, gold = 0xd8b45a;
  groundShadow(g, pose, 62);
  const topY = feetY - 108;
  const breathe = Math.sin(now / 600) * 2;
  // 脚下草丛
  for (let k = 0; k < 7; k++) { const bx = x - 26 + k * 9; g.fillStyle(k % 2 ? robe : glow, 0.8); g.beginPath(); g.moveTo(bx, feetY - 2); g.lineTo(bx - 2 + Math.sin(now / 500 + k) * 2, feetY - 12 - (k % 3) * 3); g.lineTo(bx + 3, feetY - 2); g.closePath(); g.fillPath(); }
  // 袍
  g.fillStyle(robeD, 1); g.beginPath(); g.moveTo(x - 20, topY + 46 + breathe); g.lineTo(x + 20, topY + 46 + breathe); g.lineTo(x + 28, feetY - 16); g.lineTo(x - 28, feetY - 16); g.closePath(); g.fillPath();
  g.fillStyle(robe, 1); g.beginPath(); g.moveTo(x - 17, topY + 48 + breathe); g.lineTo(x + 17, topY + 48 + breathe); g.lineTo(x + 24, feetY - 18); g.lineTo(x - 24, feetY - 18); g.closePath(); g.fillPath();
  // 槲寄生花环 + 符文绣纹
  g.fillStyle(gold, 0.9); g.fillRect(x - 20, topY + 60 + breathe, 40, 3);
  for (let k = 0; k < 3; k++) { const lit = 0.4 + 0.6 * Math.max(0, Math.sin(now / 400 - k)); g.lineStyle(2, glow, lit); g.lineBetween(x - 6 + k * 6, topY + 72 + breathe, x - 6 + k * 6, topY + 84 + breathe); }
  // 法杖（带浮符文）
  const sx = x - 34, sw = Math.sin(now / 500) * 2;
  g.lineStyle(4, bark, 1); g.lineBetween(sx + sw, topY + 30, sx, feetY - 4);
  g.fillStyle(glow, 0.9); g.fillCircle(sx + sw, topY + 26, 5);
  for (let k = 0; k < 4; k++) { const ang = now / 900 + k * 1.5; g.fillStyle(gold, 0.8); g.fillCircle(sx + Math.cos(ang) * 16, topY + 26 + Math.sin(ang) * 12, 1.8); }
  // 手臂
  g.lineStyle(7, robeD, 1); g.lineBetween(x - 14, topY + 54 + breathe, sx + 4, topY + 40);
  g.lineStyle(7, robeD, 1); g.lineBetween(x + 14, topY + 54 + breathe, x + 26, topY + 74);
  // 兜帽 + 鹿角
  const hy = topY + 22 + breathe;
  g.fillStyle(robeD, 1); g.fillPoints([{ x: x - 16, y: hy + 12 }, { x: x, y: hy - 16 }, { x: x + 16, y: hy + 12 }] as never, true);
  g.fillStyle(0x12321f, 1); g.fillEllipse(x, hy + 2, 22, 20);
  g.fillStyle(glow, 0.9); g.fillCircle(x - 4, hy + 2, 2); g.fillCircle(x + 4, hy + 2, 2);
  for (const s of [-1, 1]) {
    g.lineStyle(3, bark, 1);
    g.beginPath(); g.moveTo(x + s * 8, hy - 8); g.lineTo(x + s * 14, hy - 24); g.lineTo(x + s * 20, hy - 34); g.strokePath();
    g.beginPath(); g.moveTo(x + s * 13, hy - 20); g.lineTo(x + s * 20, hy - 20); g.strokePath();
    g.fillStyle(glow, 0.8); g.fillCircle(x + s * 20, hy - 35 + Math.sin(now / 400 + s) * 1.4, 2);
  }
  void move;
};

/** 马尔杜克：角冠神祇，手持权杖与环、暴风绕体、脚踏原初龙 */
export const mesoMarduk: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f, move } = pose;
  const robe = 0x2a4a8a, robeD = 0x16305a, gold = 0xd8b45a, glow = 0x7fa8ff, clay = 0xe8c88a;
  groundShadow(g, pose, 66);
  const topY = feetY - 114;
  const breathe = Math.sin(now / 540) * 2;
  // 脚下原初龙（提亚马特残躯）
  g.fillStyle(0x1e5a44, 1); g.fillEllipse(x, feetY - 4, 64, 16);
  g.fillStyle(0x2f7a4a, 1); for (let k = 0; k < 5; k++) g.fillTriangle(x - 24 + k * 12, feetY - 8, x - 20 + k * 12, feetY - 8, x - 22 + k * 12, feetY - 18);
  // 长袍
  g.fillStyle(robeD, 1); g.beginPath(); g.moveTo(x - 22, topY + 46 + breathe); g.lineTo(x + 22, topY + 46 + breathe); g.lineTo(x + 28, feetY - 14); g.lineTo(x - 28, feetY - 14); g.closePath(); g.fillPath();
  g.fillStyle(robe, 1); g.beginPath(); g.moveTo(x - 19, topY + 48 + breathe); g.lineTo(x + 19, topY + 48 + breathe); g.lineTo(x + 24, feetY - 16); g.lineTo(x - 24, feetY - 16); g.closePath(); g.fillPath();
  // 泥板纹腰带 + 楔文
  g.fillStyle(clay, 0.95); g.fillRect(x - 20, topY + 68 + breathe, 40, 6);
  g.fillStyle(0x2a1a0a, 0.85); for (let k = 0; k < 5; k++) { g.fillTriangle(x - 16 + k * 8 - 2, topY + 73 + breathe, x - 16 + k * 8 + 2, topY + 73 + breathe, x - 16 + k * 8, topY + 69 + breathe); }
  // 权杖与环
  const rx = x + 34 * f;
  g.lineStyle(4, clay, 1); g.lineBetween(rx, topY + 26, rx, feetY - 10);
  g.lineStyle(3, gold, 0.95); g.beginPath(); g.arc(rx, topY + 20, 8, 0, Math.PI * 2); g.strokePath();
  g.fillStyle(gold, 1); g.fillCircle(rx, topY + 20, 3);
  g.lineStyle(7, robeD, 1); g.lineBetween(x + 16 * f, topY + 54 + breathe, rx, topY + 34);
  // 风暴绕体
  for (let k = 0; k < 3; k++) { g.lineStyle(2, glow, 0.3); g.beginPath(); for (let s = 0; s <= 10; s++) { const u = s / 10; const ang = (k / 3) * Math.PI * 2 + u * 5 + now / 500; const rr = u * 56; const px = x + Math.cos(ang) * rr, py = topY + 60 + Math.sin(ang) * rr * 0.5; if (s === 0) g.moveTo(px, py); else g.lineTo(px, py); } g.strokePath(); }
  // 头 + 角冠
  const hy = topY + 22 + breathe;
  g.fillStyle(clay, 1); g.fillCircle(x, hy, 11);
  g.fillStyle(0x2a1a0a, 1); g.fillEllipse(x, hy + 2, 6, 3); // 胡须
  for (let k = 0; k < 5; k++) g.fillCircle(x - 6 + k * 3, hy + 7, 2.4);
  g.fillStyle(0x1a1a1e, 1); g.fillCircle(x - 4, hy - 2, 1.6); g.fillCircle(x + 4, hy - 2, 1.6);
  for (let k = -1; k <= 1; k++) { g.fillStyle(gold, 1); g.fillTriangle(x + k * 7, hy - 8, x + k * 5, hy - 20, x + k * 9, hy - 20); }
  g.fillStyle(gold, 1); g.fillRoundedRect(x - 13, hy - 10, 26, 5, 2);
  g.fillStyle(0x5a8aff, 0.9); g.fillCircle(x, hy - 7, 3);
  // 日/星背景
  const gl = 0.5 + 0.5 * Math.sin(now / 400);
  g.fillStyle(glow, 0.12 * gl); g.fillCircle(x, topY + 30, 60);
  void move;
};

/** 克苏鲁：章鱼脸蝠翼睡神，触须蠕动、巨大膜翼半展、身周幽光 */
export const cthCthulhu: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const body = 0x1e5a4a, bodyD = 0x0e2a24, wing = 0x123a30, glow = 0x5fe8c8, purple = 0x7a4aa8;
  groundShadow(g, pose, 84);
  const bob = Math.sin(now / 460) * 3;
  const bodyY = feetY - 50 - bob * 0.5;
  const flap = Math.abs(Math.sin(now / 340));
  // 巨大膜翼
  for (const s of [-1, 1]) {
    g.fillStyle(bodyD, 0.95);
    g.fillPoints([{ x: x + s * 6, y: bodyY - 16 }, { x: x + s * 84, y: bodyY - 92 - flap * 14 }, { x: x + s * 108, y: bodyY - 20 }, { x: x + s * 44, y: bodyY + 10 }] as never, true);
    g.fillStyle(wing, 0.95);
    g.fillPoints([{ x: x + s * 8, y: bodyY - 16 }, { x: x + s * 78, y: bodyY - 86 - flap * 14 }, { x: x + s * 98, y: bodyY - 22 }, { x: x + s * 40, y: bodyY + 8 }] as never, true);
    g.lineStyle(2.4, bodyD, 1);
    g.lineBetween(x + s * 6, bodyY - 16, x + s * 84, bodyY - 92 - flap * 14);
    g.lineBetween(x + s * 6, bodyY - 10, x + s * 108, bodyY - 20);
    g.lineBetween(x + s * 6, bodyY - 4, x + s * 44, bodyY + 10);
  }
  // 庞大身躯
  g.fillStyle(bodyD, 0.95); g.fillEllipse(x, bodyY, 56, 66);
  g.fillStyle(body, 1); g.fillEllipse(x, bodyY - 2, 48, 58);
  g.fillStyle(glow, 0.15); g.fillEllipse(x, bodyY + 16, 34, 12);
  // 爪
  for (const s of [-1, 1]) { g.lineStyle(8, bodyD, 1); g.lineBetween(x + s * 20, bodyY + 20, x + s * 34, bodyY + 44); g.fillStyle(body, 1); g.fillCircle(x + s * 34, bodyY + 46, 6); }
  // 章鱼脸：一丛触须
  const hy = bodyY - 30;
  g.fillStyle(body, 1); g.fillCircle(x, hy, 20);
  for (let k = 0; k < 9; k++) {
    const bx = x - 20 + k * 5;
    const sw = Math.sin(now / 300 + k) * 5;
    g.lineStyle(4 - (k % 3) * 0.5, body, 0.95);
    g.beginPath(); g.moveTo(bx, hy + 6); g.lineTo(bx + sw, hy + 22); g.lineTo(bx + sw * 1.5, hy + 36); g.strokePath();
    g.fillStyle(glow, 0.6);
    g.fillCircle(bx + sw * 1.5, hy + 36, 1.4);
  }
  // 三只幽光眼
  for (let k = -1; k <= 1; k++) {
    const ex = x + k * 12, ey = hy - 2 - Math.abs(k) * 3;
    const gl = 0.5 + 0.5 * Math.sin(now / 300 + k * 1.6);
    g.fillStyle(0x1a0e2e, 1); g.fillEllipse(ex, ey, 9, 7);
    g.fillStyle(glow, gl); g.fillCircle(ex, ey, 3.2);
    g.fillStyle(0xffffff, gl * 0.8); g.fillCircle(ex - 1, ey - 1, 1.1);
  }
  // 幽光与上浮泡
  for (let k = 0; k < 8; k++) { const ph = ((now / 1600 + k / 8) % 1); g.fillStyle(k % 2 ? glow : purple, 0.5 * (1 - ph)); g.fillCircle(x + Math.sin(k * 2.3) * 54, bodyY - 20 - ph * 70, 1.6); }
};
