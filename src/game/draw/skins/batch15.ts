import { groundShadow, type SkinPainter } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 批十五 5★ 巨兽皮肤：三头龙·基多拉 / 巨蛾·魔斯拉 / 合体机甲 / 火山泰坦 / 深海巨妖 */

/** 三头龙·基多拉：金色巨龙——三支长颈各自咆哮、庞大双翼遮天、尾带电弧 */
export const ghidSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f, move } = pose;
  const gold = 0xd9b45c, goldD = 0x8a6a1a, goldL = 0xffe15c, bolt = 0x7fd4ff;
  groundShadow(g, pose, 84);
  const bob = Math.sin(now / 380) * 2.4;
  const bodyY = feetY - 40 - bob * 0.4;
  // 双腿
  for (const s of [-1, 1]) {
    const stp = Math.sin(now / 260 + (s > 0 ? 0 : Math.PI)) * ((move ?? 0) * 3 + 1);
    g.fillStyle(goldD, 1); g.fillRoundedRect(x + s * 16 - 7 + stp, bodyY + 12, 14, feetY - bodyY - 16, 5);
    g.fillStyle(gold, 1); g.fillRoundedRect(x + s * 16 - 9 + stp, feetY - 8, 18, 8, 3);
  }
  // 躯干
  g.fillStyle(goldD, 0.95); g.fillRoundedRect(x - 30, bodyY - 14, 60, 32, 14);
  g.fillStyle(gold, 1); g.fillRoundedRect(x - 27, bodyY - 12, 54, 28, 12);
  g.fillStyle(goldL, 0.4); g.fillEllipse(x, bodyY + 6, 40, 12);
  // 双翼（巨大，会扇）
  const flap = Math.abs(Math.sin(now / 320));
  for (const s of [-1, 1]) {
    g.fillStyle(goldD, 0.95);
    g.fillPoints([{ x: x + s * 6, y: bodyY - 10 }, { x: x + s * 72, y: bodyY - 84 - flap * 14 }, { x: x + s * 96, y: bodyY - 20 }, { x: x + s * 40, y: bodyY + 4 }] as never, true);
    g.fillStyle(gold, 0.85);
    g.fillPoints([{ x: x + s * 8, y: bodyY - 10 }, { x: x + s * 66, y: bodyY - 78 - flap * 14 }, { x: x + s * 86, y: bodyY - 22 }, { x: x + s * 38, y: bodyY + 2 }] as never, true);
    for (let k = 0; k < 3; k++) { g.lineStyle(2, goldD, 0.6); g.lineBetween(x + s * 10, bodyY - 10, x + s * (56 - k * 12), bodyY - (14 + k * 22) - flap * 10); }
  }
  // 尾（带电弧）
  const tw = Math.sin(now / 420) * 10;
  g.lineStyle(9, gold, 1);
  g.beginPath(); g.moveTo(x - 26 * f, bodyY - 2); g.lineTo(x - 48 * f, bodyY - 8 + tw); g.lineTo(x - 66 * f, bodyY + 4 + tw * 1.4); g.strokePath();
  g.lineStyle(2, bolt, 0.8 + 0.2 * Math.sin(now / 100)); g.beginPath(); g.moveTo(x - 40 * f, bodyY - 10); g.lineTo(x - 50 * f, bodyY - 22); g.lineTo(x - 58 * f, bodyY - 6); g.strokePath();
  // 三支长颈 + 三个头
  const necks: Array<[number, number]> = [[-0.5, -1], [0.05, 0], [0.6, 1]];
  necks.forEach(([lean, s], idx) => {
    const nbx = x + lean * 24, nby = bodyY - 12;
    const hx = x + lean * 40 + Math.sin(now / 700 + idx) * 4, hy = bodyY - 78 + bob;
    g.lineStyle(11, goldD, 0.95); g.beginPath(); g.moveTo(nbx, nby); g.lineTo((nbx + hx) / 2, bodyY - 50); g.lineTo(hx, hy); g.strokePath();
    g.lineStyle(7, gold, 1); g.beginPath(); g.moveTo(nbx, nby); g.lineTo((nbx + hx) / 2, bodyY - 50); g.lineTo(hx, hy); g.strokePath();
    // 龙首
    g.fillStyle(gold, 1); g.fillEllipse(hx, hy, 22, 13);
    g.fillStyle(goldD, 1); g.fillTriangle(hx - 7, hy - 6, hx - 1, hy - 6, hx - 6, hy - 20 + s * 2);
    g.fillStyle(goldD, 1); g.fillTriangle(hx + 2, hy - 6, hx + 8, hy - 6, hx + 7, hy - 20 - s * 2);
    g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx + 5, hy - 3, 2.6);
    g.fillStyle(bolt, 0.9); g.fillCircle(hx + 5, hy - 3, 1.2);
    g.fillStyle(goldD, 1); g.fillRoundedRect(hx + 7, hy + 4, 12, 4, 2);
    for (let k = 0; k < 4; k++) { g.fillStyle(0xf0f4f8, 0.95); g.fillTriangle(hx + (8 + k * 3), hy + 6, hx + (10 + k * 3), hy + 6, hx + (9 + k * 3), hy + 10); }
    if (idx === 1) { // 中间头吐电
      g.lineStyle(2, bolt, 0.7 + 0.3 * Math.sin(now / 80)); g.beginPath(); g.moveTo(hx + 18, hy + 2); g.lineTo(hx + 30, hy - 2); g.lineTo(hx + 26, hy + 2); g.lineTo(hx + 38, hy - 4); g.strokePath();
    }
  });
};

/** 巨蛾·魔斯拉：遮天巨蛾——庞大双翼带眼斑、绒毛身躯、触角与鳞粉 */
export const mthrSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const fur = 0x6a7a5a, furD = 0x4a5a3a, wing = 0xffe66a, wingD = 0xbfa83a, spot = 0x4a3a2a, glow = 0xbfe8ff;
  groundShadow(g, pose, 76);
  const bob = Math.sin(now / 420) * 3;
  const bodyY = feetY - 42 - bob * 0.5;
  const flap = Math.abs(Math.sin(now / 300));
  // 巨大双翼
  for (const s of [-1, 1]) {
    g.fillStyle(wingD, 0.95);
    g.fillPoints([{ x: x + s * 5, y: bodyY - 14 }, { x: x + s * 60, y: bodyY - 96 - flap * 16 }, { x: x + s * 100, y: bodyY - 30 }, { x: x + s * 66, y: bodyY + 14 }] as never, true);
    g.fillStyle(wing, 0.95);
    g.fillPoints([{ x: x + s * 6, y: bodyY - 14 }, { x: x + s * 56, y: bodyY - 88 - flap * 16 }, { x: x + s * 92, y: bodyY - 30 }, { x: x + s * 62, y: bodyY + 10 }] as never, true);
    g.fillStyle(spot, 0.9); g.fillCircle(x + s * 46, bodyY - 44, 11);
    g.fillStyle(0xbfe8ff, 0.9); g.fillCircle(x + s * 46, bodyY - 44, 6);
    g.fillStyle(0xffffff, 0.8); g.fillCircle(x + s * 44, bodyY - 47, 2.4);
    g.lineStyle(2, wingD, 0.6); g.lineBetween(x + s * 8, bodyY - 14, x + s * 54, bodyY - 86 - flap * 16);
  }
  // 绒毛身躯
  g.fillStyle(furD, 0.95); g.fillRoundedRect(x - 16, bodyY - 18, 32, 46, 14);
  g.fillStyle(fur, 1); g.fillRoundedRect(x - 14, bodyY - 16, 28, 42, 12);
  for (let k = 0; k < 8; k++) { g.fillStyle(0x8aa47a, 0.6); g.fillCircle(x - 12 + (k % 4) * 8, bodyY - 10 + Math.floor(k / 4) * 24, 3); }
  // 触角
  for (const s of [-1, 1]) { const sw = Math.sin(now / 300 + s) * 3; g.lineStyle(2.2, fur, 1); g.beginPath(); g.moveTo(x + s * 6, bodyY - 16); g.lineTo(x + s * 16 + sw, bodyY - 40); g.lineTo(x + s * 22 + sw * 1.5, bodyY - 54); g.strokePath(); g.fillStyle(glow, 0.9); g.fillCircle(x + s * 22 + sw * 1.5, bodyY - 54, 2.4); }
  // 头 + 发光眼
  const hy = bodyY - 22;
  g.fillStyle(fur, 1); g.fillCircle(x, hy, 12);
  for (const s of [-1, 1]) { g.fillStyle(0x1a1a1e, 1); g.fillEllipse(x + s * 5, hy - 1, 7, 10); g.fillStyle(glow, 0.9); g.fillCircle(x + s * 5, hy - 2, 2.6); g.fillStyle(0xffffff, 0.8); g.fillCircle(x + s * 4, hy - 3, 1); }
  // 鳞粉飘散
  for (let k = 0; k < 8; k++) { const ph = ((now / 1200 + k / 8) % 1); g.fillStyle(k % 2 ? glow : wing, 0.7 * (1 - ph)); g.fillCircle(x + Math.sin(k * 2.3) * 50, bodyY - 20 - ph * 60, 1.6); }
};

/** 合体机甲：巨大的合体机器人——V字头冠、胸口聚变核、重甲肩、背后推进器 */
export const tksSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, move } = pose;
  const topY = feetY - 118;
  const steel = 0x8a94a2, steelD = 0x3f4a62, red = 0xff4a4a, cyan = 0x5ac8ff, ink = 0x1a2436;
  groundShadow(g, pose, 68);
  const step = Math.sin(now / 300) * (move ?? 0);
  const breathe = Math.sin(now / 520) * 1.6;
  // 双腿
  for (const s of [-1, 1]) {
    const sw = step * s * 3;
    g.fillStyle(steelD, 1); g.fillRoundedRect(x + s * 12 + sw * 0.4 - 9, topY + 74, 18, feetY - topY - 78, 6);
    g.fillStyle(steel, 1); g.fillRoundedRect(x + s * 12 + sw - 11, feetY - 10, 22, 10, 4);
    g.fillStyle(cyan, 0.7); g.fillRect(x + s * 12 + sw - 8, topY + 84, 16, 3);
  }
  // 躯干 + 胸口聚变核
  g.fillStyle(steelD, 0.95); g.fillRoundedRect(x - 22, topY + 40 + breathe, 44, 40, 12);
  g.fillStyle(steel, 1); g.fillRoundedRect(x - 20, topY + 42 + breathe, 40, 36, 11);
  const pulse = 0.6 + 0.4 * Math.sin(now / 320);
  for (let k = 2; k >= 0; k--) { g.fillStyle(cyan, 0.18 * pulse * (1 - k * 0.3)); g.fillCircle(x, topY + 58 + breathe, 7 + k * 5); }
  g.fillStyle(ink, 1); g.fillRoundedRect(x - 8, topY + 52 + breathe, 16, 14, 4);
  g.fillStyle(cyan, pulse); g.fillRoundedRect(x - 6, topY + 54 + breathe, 12, 10, 3);
  g.fillStyle(0xffffff, pulse * 0.9); g.fillCircle(x, topY + 59 + breathe, 2.6);
  // 肩甲（大块）
  for (const s of [-1, 1]) {
    g.fillStyle(steelD, 1); g.fillRoundedRect(x + s * 24 - 10, topY + 40 + breathe, 20, 18, 5);
    g.fillStyle(steel, 1); g.fillRoundedRect(x + s * 24 - 9, topY + 41 + breathe, 18, 16, 4);
    g.fillStyle(red, 0.9); g.fillRect(x + s * 24 - 9, topY + 44 + breathe, 18, 4);
  }
  // 双臂
  for (const s of [-1, 1]) {
    const sw = Math.sin(now / 340 + (s > 0 ? 0 : 0.8)) * (2 + (move ?? 0) * 3);
    g.lineStyle(12, steelD, 1); g.lineBetween(x + s * 30, topY + 52 + breathe, x + s * 34 + sw, topY + 74);
    g.lineStyle(8, steel, 1); g.lineBetween(x + s * 30, topY + 52 + breathe, x + s * 34 + sw, topY + 74);
    g.fillStyle(steel, 1); g.fillCircle(x + s * 34 + sw, topY + 76, 7);
    g.fillStyle(cyan, 0.8); g.fillCircle(x + s * 34 + sw, topY + 76, 3);
  }
  // 背后推进器
  for (const s of [-1, 1]) { g.fillStyle(steelD, 1); g.fillRoundedRect(x + s * 14 - 5, topY + 44 + breathe, 10, 20, 3); const fl = 0.7 + 0.3 * Math.sin(now / 110 + s); for (let k = 0; k < 3; k++) { g.fillStyle(k === 0 ? 0xffffff : cyan, (0.75 - k * 0.2) * fl); g.fillEllipse(x + s * 14, topY + 66 + k * 4, 6 - k, 4 - k); } }
  // 头 + V 冠
  const hy = topY + 24 + breathe;
  g.fillStyle(steelD, 1); g.fillCircle(x, hy, 14); g.fillStyle(steel, 1); g.fillCircle(x, hy, 12.6);
  g.fillStyle(cyan, 0.95); g.fillPoints([{ x: x - 12, y: hy - 6 }, { x, y: hy - 22 }, { x: x + 12, y: hy - 6 }, { x, y: hy - 11 }] as never, true);
  for (const s of [-1, 1]) { g.fillStyle(ink, 1); g.fillEllipse(x + s * 5, hy - 2, 7, 5); g.fillStyle(cyan, 0.9); g.fillCircle(x + s * 5, hy - 2, 2); }
  g.fillStyle(red, 0.9); g.fillCircle(x, hy + 8, 2.4);
};

/** 火山泰坦：巍峨的熔岩巨人——巨肩厚甲、裂开漏熔光的胸膛、背后火山、巨拳 */
export const titanSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, move } = pose;
  const topY = feetY - 122;
  const rock = 0x5a4436, rockD = 0x32251a, lava = 0xff6a2a, ember = 0xffd45c;
  groundShadow(g, pose, 84);
  const step = Math.sin(now / 320) * (move ?? 0);
  const breathe = Math.sin(now / 560) * 2;
  // 双腿（巨柱）
  for (const s of [-1, 1]) {
    const sw = step * s * 3;
    g.fillStyle(rockD, 1); g.fillRoundedRect(x + s * 16 + sw * 0.4 - 12, topY + 78, 24, feetY - topY - 82, 8);
    g.fillStyle(rock, 1); g.fillRoundedRect(x + s * 16 + sw * 0.4 - 11, topY + 80, 22, feetY - topY - 86, 7);
    g.lineStyle(2, lava, 0.2 + 0.15 * Math.sin(now / 400 + s)); g.beginPath(); g.moveTo(x + s * 16 + sw, topY + 84); g.lineTo(x + s * 20 + sw, feetY - 12); g.strokePath();
    g.fillStyle(rockD, 1); g.fillRoundedRect(x + s * 16 + sw - 14, feetY - 10, 28, 10, 4);
  }
  // 躯干（巍峨）
  g.fillStyle(rockD, 0.95); g.beginPath(); g.moveTo(x - 30, topY + 44 + breathe); g.lineTo(x + 30, topY + 44 + breathe); g.lineTo(x + 24, topY + 82); g.lineTo(x - 24, topY + 82); g.closePath(); g.fillPath();
  g.fillStyle(rock, 1); g.beginPath(); g.moveTo(x - 27, topY + 46 + breathe); g.lineTo(x + 27, topY + 46 + breathe); g.lineTo(x + 22, topY + 80); g.lineTo(x - 22, topY + 80); g.closePath(); g.fillPath();
  // 胸膛裂缝漏熔光
  const heat = 0.6 + 0.4 * Math.sin(now / 340);
  g.fillStyle(lava, heat * 0.5); g.fillEllipse(x, topY + 60 + breathe, 30, 22);
  g.lineStyle(2.2, rockD, 1);
  for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x - 18 + k * 12, topY + 48 + breathe); g.lineTo(x - 14 + k * 12, topY + 56 + breathe); g.lineTo(x - 18 + k * 12, topY + 74); g.strokePath(); }
  g.lineStyle(1.2, lava, heat);
  for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x - 18 + k * 12, topY + 48 + breathe); g.lineTo(x - 14 + k * 12, topY + 56 + breathe); g.lineTo(x - 18 + k * 12, topY + 74); g.strokePath(); }
  // 背后火山
  g.fillStyle(rockD, 0.9); g.fillPoints([{ x: x - 20, y: topY + 30 + breathe }, { x, y: topY - 6 }, { x: x + 20, y: topY + 30 + breathe }] as never, true);
  g.fillStyle(ember, 0.6); g.fillEllipse(x, topY - 2, 12, 4);
  for (let k = 0; k < 4; k++) { const ph = ((now / 700 + k / 4) % 1); g.fillStyle(k % 2 ? lava : ember, (1 - ph) * 0.85); g.fillCircle(x + Math.sin(k * 2) * 8, topY - 6 - ph * 24, 2.4 * (1 - ph) + 0.6); }
  // 巨肩
  for (const s of [-1, 1]) { g.fillStyle(rockD, 1); g.fillCircle(x + s * 30, topY + 48 + breathe, 18); g.fillStyle(rock, 1); g.fillCircle(x + s * 30, topY + 48 + breathe, 15.6); g.fillStyle(lava, 0.25 + 0.15 * Math.sin(now / 300 + s)); g.fillCircle(x + s * 30, topY + 48 + breathe, 7); }
  // 巨臂 + 巨拳
  for (const s of [-1, 1]) {
    const sw = Math.sin(now / 420 + (s > 0 ? 0 : 0.8)) * (2 + (move ?? 0) * 3);
    g.lineStyle(20, rockD, 1); g.beginPath(); g.moveTo(x + s * 30, topY + 52 + breathe); g.lineTo(x + s * 40 + sw, topY + 78); g.lineTo(x + s * 36 + sw, topY + 100); g.strokePath();
    g.lineStyle(13, rock, 1); g.beginPath(); g.moveTo(x + s * 30, topY + 52 + breathe); g.lineTo(x + s * 40 + sw, topY + 78); g.lineTo(x + s * 36 + sw, topY + 100); g.strokePath();
    g.fillStyle(rock, 1); g.fillCircle(x + s * 36 + sw, topY + 102, 9);
    g.fillStyle(lava, 0.4 + 0.2 * Math.sin(now / 300 + s)); g.fillCircle(x + s * 36 + sw, topY + 102, 4);
  }
  // 头（缩在肩窝）
  const hy = topY + 40 + breathe;
  g.fillStyle(rock, 1); g.fillRoundedRect(x - 12, hy - 10, 24, 18, 5);
  g.fillStyle(lava, 0.6 + 0.3 * Math.sin(now / 260)); g.fillRoundedRect(x - 8, hy - 4, 16, 4, 2);
  g.fillStyle(0x1a1a1e, 1); g.fillEllipse(x, hy - 1, 16, 6);
  for (const s of [-1, 1]) { g.fillStyle(lava, 0.7 + 0.3 * Math.sin(now / 240 + s)); g.fillEllipse(x + s * 5, hy - 1, 4, 2.6); }
};

/** 深海巨妖：深渊巨型触手怪——庞大身躯、张开的大口、众多发光触手与幽光眼 */
export const leviSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const deep = 0x123040, deepD = 0x0a1e2a, glow = 0x5fe8d0, purple = 0x9b6aff, tooth = 0xe8f6ff;
  groundShadow(g, pose, 92);
  const bob = Math.sin(now / 460) * 3;
  const bodyY = feetY - 44 - bob * 0.5;
  // 众多触手（从身下伸出，各相位摆动）
  for (let k = 0; k < 9; k++) {
    const base = (k / 8 - 0.5) * 70;
    let px = x + base, py = bodyY + 14;
    g.lineStyle(9 - (k % 3) * 1.6, k % 2 ? deep : purple, 0.95);
    g.beginPath(); g.moveTo(px, py);
    for (let s = 1; s <= 4; s++) {
      const t = s / 4;
      const nx = x + base + Math.sin(now / 300 + k + s) * 12 * t;
      const ny = bodyY + 14 + t * (feetY - bodyY - 4) + Math.cos(now / 260 + k) * 4 * t;
      g.lineTo(nx, ny); px = nx; py = ny;
    }
    g.strokePath();
    g.fillStyle(glow, 0.7);
    for (let s = 2; s <= 4; s++) g.fillCircle(x + base + Math.sin(now / 300 + k + s) * 12 * (s / 4), bodyY + 14 + (s / 4) * (feetY - bodyY - 4), 1.6);
  }
  // 庞大身躯
  g.fillStyle(deepD, 0.95); g.fillEllipse(x, bodyY, 76, 54);
  g.fillStyle(deep, 1); g.fillEllipse(x, bodyY - 2, 68, 46);
  g.fillStyle(glow, 0.2); g.fillEllipse(x, bodyY + 13, 50, 12);
  // 背鳍
  for (let k = -2; k <= 2; k++) { g.fillStyle(purple, 0.8); g.fillTriangle(x + k * 16, bodyY - 24, x + k * 16 + 6, bodyY - 24, x + k * 16 + 3, bodyY - 40); }
  // 大口（深渊巨口）
  const hy = bodyY - 6;
  g.fillStyle(0x050b12, 1); g.fillEllipse(x, hy, 50, 30);
  g.fillStyle(purple, 0.25); g.fillEllipse(x, hy, 34, 20);
  for (let k = 0; k < 11; k++) {
    const ang = -1.25 + (k / 10) * 2.5;
    g.fillStyle(tooth, 0.95);
    g.fillTriangle(x + Math.cos(ang) * 24 - 3, hy + Math.sin(ang) * 15 - 3, x + Math.cos(ang) * 24 + 3, hy + Math.sin(ang) * 15 + 3, x + Math.cos(ang) * 8, hy + Math.sin(ang) * 5);
  }
  // 三只幽光眼
  for (let k = -1; k <= 1; k++) {
    const ex = x + k * 15, ey = hy - 12 - Math.abs(k) * 4;
    const gl = 0.5 + 0.5 * Math.sin(now / 300 + k * 1.5);
    g.fillStyle(0x1a0e2e, 1); g.fillEllipse(ex, ey, 10, 8);
    g.fillStyle(glow, gl); g.fillCircle(ex, ey, 3.4);
    g.fillStyle(0xffffff, gl * 0.8); g.fillCircle(ex - 1, ey - 1, 1.2);
  }
  // 上浮气泡 + 诱饵光点
  for (let k = 0; k < 6; k++) { const ph = ((now / 1400 + k / 6) % 1); g.fillStyle(glow, 0.5 * (1 - ph)); g.fillCircle(x + Math.sin(k * 2.3) * 44, bodyY - 20 - ph * 70, 1.6); }
};
