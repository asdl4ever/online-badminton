import { groundShadow, type SkinPainter } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/**
 * 第九批主题形象（恐龙 / 史前 / 神话 / 恶搞 10 主题）——整体重绘、多层堆料 + 多组动效。
 * pose = { x, feetY, facing, move, color }。
 * 每款均含：身形底衬 → 本体 → 明暗 → 五官/配件 → ≥2 组循环动效（呼吸 / 眨眼 / 摆动 / 粒子…）。
 */

/** 眨眼系数：多数时间 1，周期性压成细缝 */
function blinkOf(now: number, phase = 0): number {
  return Math.sin(now / 1400 + phase) > 0.92 ? 0.18 : 1;
}

/** 脚下能量环 */
function energyRing(g: G, x: number, feetY: number, r: number, color: number, now: number, phase = 0): void {
  for (let k = 0; k < 2; k++) {
    const ph = ((now / 1300 + k / 2 + phase) % 1);
    g.lineStyle(2.4, color, (1 - ph) * 0.55);
    g.strokeEllipse(x, feetY - 2, (r + ph * 46) * 2 * 0.5, (r + ph * 46) * 2 * 0.16);
  }
}

// ══ 白垩纪猎场：暴君龙 ══════════════════════════════════════
export const cretTyrant: SkinPainter = (g, now, pose) => {
  const { x, feetY, facing: f } = pose;
  const body = 0x6a8a3a, hi = 0x8fb35a, dark = 0x3a5a1a, belly = 0xa8c46a, spike = 0x2f4a14, tooth = 0xf0e8d0, claw = 0x2a2010;
  groundShadow(g, pose, 62);
  energyRing(g, x, feetY, 20, 0x9fe86a, now);
  const topY = feetY - 104, breathe = Math.sin(now / 420) * 2.4, bob = Math.sin(now / 420 + 0.6) * 2;
  const tail = Math.sin(now / 300) * 12;
  // 尾巴：分三节摆动 + 背棘
  for (let s = 0; s < 3; s++) {
    const seg = (base: number, h: number) => ({ x: x - f * base, y: feetY - h + tail * ((base - 12) / 60) });
    const a0 = seg(12, 34), a1 = seg(40, 26), a2 = seg(68, 36);
    g.fillStyle(dark, 1); g.fillPoints([{ x: a0.x, y: a0.y - 8 }, { x: a1.x, y: a1.y - 10 }, { x: a2.x, y: a2.y - 6 }, { x: a2.x, y: a2.y + 6 }, { x: a1.x, y: a1.y + 10 }, { x: a0.x, y: a0.y + 8 }] as never, true);
    g.fillStyle(body, 1); g.fillPoints([{ x: a0.x, y: a0.y - 6 }, { x: a1.x, y: a1.y - 8 }, { x: a2.x, y: a2.y - 4 }, { x: a2.x, y: a2.y + 4 }, { x: a1.x, y: a1.y + 8 }, { x: a0.x, y: a0.y + 6 }] as never, true);
  }
  for (let k = 0; k < 5; k++) { const bx = x - f * (16 + k * 13), by = feetY - 40 + tail * ((16 + k * 13 - 12) / 60); g.fillStyle(spike, 1); g.fillTriangle(bx - 5, by, bx + 5, by, bx - f * 2, by - 12); }
  // 腿（粗后腿 + 三趾）
  for (const lx of [-16, 12]) { g.fillStyle(dark, 1); g.fillRoundedRect(x + lx - 8, feetY - 34, 16, 34, 6); g.fillStyle(body, 1); g.fillRoundedRect(x + lx - 6, feetY - 32, 12, 30, 5); g.fillStyle(claw, 1); for (let t = -1; t <= 1; t++) g.fillTriangle(x + lx + t * 5 - 2, feetY - 1, x + lx + t * 5 + 2, feetY - 1, x + lx + t * 5, feetY + 4); }
  // 躯干
  g.fillStyle(dark, 1); g.fillRoundedRect(x - 24, topY + 40 + breathe, 48, 56, 13);
  g.fillStyle(body, 1); g.fillRoundedRect(x - 21, topY + 42 + breathe, 42, 52, 12);
  g.fillStyle(belly, 1); g.fillEllipse(x, topY + 70 + breathe, 26, 40);
  for (let k = 0; k < 5; k++) { g.fillStyle(spike, 1); g.fillTriangle(x - 18 + k * 9, topY + 44 + breathe, x - 12 + k * 9, topY + 44 + breathe, x - 15 + k * 9, topY + 32 + breathe); }
  // 小爪手（前后摆）
  const armSw = Math.sin(now / 300) * 3;
  for (let side = -1; side <= 1; side += 2) { const px = x + side * 20, py = topY + 58 + breathe; g.lineStyle(7, dark, 1); g.lineBetween(px, py, px + side * 8 + armSw * 0.3, py + 20); g.fillStyle(claw, 1); g.fillTriangle(px + side * 8 - 2, py + 20, px + side * 8 + 3, py + 20, px + side * 8, py + 25); }
  // 头 + 眼（眨眼）
  const hx = x + f * 2, hy = topY + 22 + breathe + bob * 0.5;
  g.fillStyle(dark, 1); g.fillEllipse(hx, hy, 38, 30);
  g.fillStyle(body, 1); g.fillEllipse(hx, hy - 1, 34, 26);
  g.fillStyle(hi, 0.6); g.fillEllipse(hx - f * 8, hy - 8, 14, 8);
  const open = 0.14 + 0.14 * Math.sin(now / 200);
  const jaw = (rot: number, upper: boolean) => { g.save(); g.translateCanvas(hx + f * 6, hy + 4); g.rotateCanvas(rot); g.fillStyle(upper ? body : dark, 1); g.fillPoints([{ x: 0, y: -6 }, { x: f * 26, y: -8 }, { x: f * 28, y: -2 }, { x: 0, y: 0 }] as never, true); g.fillStyle(tooth, 1); for (let k = 0; k < 5; k++) g.fillTriangle(f * (6 + k * 4.6), -7, f * (8.8 + k * 4.6), -7, f * (7.4 + k * 4.6), -2); g.restore(); };
  jaw(-open, false);
  g.save(); g.translateCanvas(hx + f * 6, hy + 4); g.rotateCanvas(open); g.fillStyle(dark, 1); g.fillPoints([{ x: 0, y: -4 }, { x: f * 26, y: -6 }, { x: f * 26, y: 0 }, { x: 0, y: 2 }] as never, true); g.restore();
  const eyeH = 3 * blinkOf(now);
  g.fillStyle(0xffe08a, 0.9); g.fillEllipse(hx + f * 8, hy - 8, 8, 7);
  g.fillStyle(0x1a1208, 1); g.fillEllipse(hx + f * 8, hy - 8, 2.6, eyeH);
  for (let k = 0; k < 3; k++) { g.fillStyle(dark, 1); g.fillTriangle(hx - f * 6 + k * f * 7, hy - 14, hx + k * f * 7, hy - 14, hx - f * 3 + k * f * 7, hy - 23); }
  // 上扬尘粒子
  for (let k = 0; k < 6; k++) { const ph = ((now / 1100 + k / 6) % 1); g.fillStyle(0x9fe86a, (1 - ph) * 0.5); g.fillCircle(x - f * 30 + (k * 17 % 60), feetY - ph * 60, 1.8); }
};

// ══ 史前沼泽：沼鳄萨满 ══════════════════════════════════════
export const swampCroc: SkinPainter = (g, now, pose) => {
  const { x, feetY, facing: f } = pose;
  const body = 0x3a7a4a, hi = 0x5aa86a, dark = 0x244a30, plate = 0x1c3a24, eye = 0xffd45c, bone = 0xe8e0d0;
  groundShadow(g, pose, 60);
  // 泥沼涟漪
  for (let k = 0; k < 3; k++) { const ph = ((now / 1500 + k / 3) % 1); g.lineStyle(2, 0x7dff9a, (1 - ph) * 0.4); g.strokeEllipse(x, feetY + 1, 20 + ph * 40, 6 + ph * 12); }
  const topY = feetY - 102, breathe = Math.sin(now / 460) * 2.4;
  const tail = Math.sin(now / 340) * 12;
  // 粗尾 + 背甲
  g.fillStyle(dark, 1); g.fillPoints([{ x: x - f * 8, y: feetY - 34 }, { x: x - f * 46, y: feetY - 20 + tail }, { x: x - f * 78, y: feetY - 32 + tail }, { x: x - f * 28, y: feetY - 44 }] as never, true);
  g.fillStyle(body, 1); g.fillPoints([{ x: x - f * 8, y: feetY - 36 }, { x: x - f * 44, y: feetY - 25 + tail }, { x: x - f * 72, y: feetY - 36 + tail }, { x: x - f * 26, y: feetY - 46 }] as never, true);
  for (let k = 0; k < 5; k++) { const bx = x - f * (16 + k * 12), by = feetY - 40 + tail * ((16 + k * 12 - 12) / 60); g.fillStyle(hi, 1); g.fillTriangle(bx - 5, by, bx + 5, by, bx - f * 1, by - 10); }
  // 腿
  for (const lx of [-14, 12]) { g.fillStyle(dark, 1); g.fillRoundedRect(x + lx - 7, feetY - 30, 14, 30, 5); g.fillStyle(body, 1); g.fillRoundedRect(x + lx - 5, feetY - 28, 10, 26, 4); }
  // 躯干 + 背甲板
  g.fillStyle(dark, 1); g.fillRoundedRect(x - 24, topY + 40 + breathe, 48, 56, 12);
  g.fillStyle(body, 1); g.fillRoundedRect(x - 21, topY + 42 + breathe, 42, 52, 11);
  g.fillStyle(hi, 0.5); g.fillEllipse(x - 6, topY + 62 + breathe, 22, 34);
  for (let k = 0; k < 4; k++) { g.fillStyle(plate, 1); g.fillRoundedRect(x - 20 + k * 11, topY + 44 + breathe, 9, 8, 2); g.fillStyle(hi, 0.6); g.fillCircle(x - 15.5 + k * 11, topY + 46 + breathe, 1.4); }
  // 手臂（持骨杖）
  const armSw = Math.sin(now / 320) * 2.5;
  g.lineStyle(7, dark, 1); g.lineBetween(x - 18, topY + 56 + breathe, x - 26, topY + 82 + armSw);
  g.lineStyle(7, dark, 1); g.lineBetween(x + 18, topY + 56 + breathe, x + 26, topY + 80 - armSw);
  g.lineStyle(4, bone, 1); g.lineBetween(x + 26, topY + 80, x + 30, topY + 40); g.fillStyle(bone, 1); g.fillCircle(x + 30, topY + 38, 4);
  // 头 + 长吻
  const hy = topY + 24 + breathe;
  g.fillStyle(dark, 1); g.fillEllipse(x, hy, 30, 26);
  g.fillStyle(body, 1); g.fillEllipse(x, hy - 1, 26, 22);
  g.fillStyle(dark, 1); g.fillPoints([{ x: x + f * 6, y: hy - 8 }, { x: x + f * 40, y: hy - 4 }, { x: x + f * 40, y: hy + 2 }, { x: x + f * 6, y: hy + 4 }] as never, true);
  g.fillStyle(body, 1); g.fillPoints([{ x: x + f * 6, y: hy - 6 }, { x: x + f * 38, y: hy - 3 }, { x: x + f * 38, y: hy + 1 }, { x: x + f * 6, y: hy + 2 }] as never, true);
  g.fillStyle(body, 1); g.fillPoints([{ x: x + f * 6, y: hy + 3 }, { x: x + f * 40, y: hy + 4 }, { x: x + f * 40, y: hy + 7 }, { x: x + f * 6, y: hy + 6 }] as never, true);
  g.fillStyle(bone, 1); for (let k = 0; k < 6; k++) { g.fillTriangle(x + f * (10 + k * 5), hy + 3, x + f * (12.4 + k * 5), hy + 3, x + f * (11 + k * 5), hy + 7); }
  const eyeH = 3 * blinkOf(now, 1);
  g.fillStyle(eye, 0.95); g.fillEllipse(x + f * 6, hy - 6, 7, 7); g.fillStyle(0x1a1208, 1); g.fillEllipse(x + f * 6, hy - 6, 1.8, eyeH);
  // 沼气泡 + 蚊虫
  for (let k = 0; k < 5; k++) { const ph = ((now / 900 + k / 5) % 1); g.fillStyle(0x7dff9a, (1 - ph) * 0.7); g.fillCircle(x + f * (24 + k * 6) + Math.sin(k * 2) * 5, hy - 6 - ph * 30, 2 + ph * 1.5); }
  for (let k = 0; k < 3; k++) { const ang = now / 220 + k * 2.1; g.fillStyle(0x2a3a2a, 0.8); g.fillCircle(x + Math.cos(ang) * 44, topY + 30 + Math.sin(ang) * 20, 1.4); }
};

// ══ 冰河世纪：剑齿虎王 ══════════════════════════════════════
export const iceageSaber: SkinPainter = (g, now, pose) => {
  const { x, feetY, facing: f } = pose;
  const fur = 0xd8a85a, hi = 0xefcf8a, dark = 0xa87830, mane = 0xf0d6a0, cream = 0xf2ead2, tusk = 0xf4f0e6;
  groundShadow(g, pose, 58);
  // 脚下积雪
  g.fillStyle(0xeaf6ff, 0.35); g.fillEllipse(x, feetY + 2, 66, 12);
  const topY = feetY - 104, breathe = Math.sin(now / 420) * 2.4;
  const tail = Math.sin(now / 320) * 10;
  g.fillStyle(dark, 1); g.beginPath(); g.moveTo(x - f * 8, feetY - 36); g.lineTo(x - f * 42, feetY - 26 + tail); g.lineTo(x - f * 48, feetY - 42 + tail); g.lineTo(x - f * 6, feetY - 46); g.closePath(); g.fillPath();
  g.fillStyle(fur, 1); g.beginPath(); g.moveTo(x - f * 8, feetY - 38); g.lineTo(x - f * 40, feetY - 29 + tail); g.lineTo(x - f * 45, feetY - 41 + tail); g.lineTo(x - f * 6, feetY - 44); g.closePath(); g.fillPath();
  g.fillStyle(cream, 1); g.fillTriangle(x - f * 44, feetY - 42 + tail, x - f * 48, feetY - 42 + tail, x - f * 46, feetY - 50 + tail);
  // 腿
  for (const lx of [-15, 12]) { g.fillStyle(dark, 1); g.fillRoundedRect(x + lx - 7, feetY - 30, 14, 30, 5); g.fillStyle(fur, 1); g.fillRoundedRect(x + lx - 5, feetY - 28, 10, 26, 4); }
  // 躯干 + 鬃毛
  g.fillStyle(dark, 1); g.fillRoundedRect(x - 22, topY + 42 + breathe, 44, 52, 12);
  g.fillStyle(fur, 1); g.fillRoundedRect(x - 19, topY + 44 + breathe, 38, 48, 11);
  g.fillStyle(hi, 0.5); g.fillEllipse(x - 6, topY + 62 + breathe, 18, 32);
  // 鬃毛（相位错开的毛簇）
  for (let k = 0; k < 9; k++) { const ang = Math.PI + (k / 8) * Math.PI; const fl = Math.sin(now / 260 + k) * 2; g.fillStyle(mane, 1); g.fillTriangle(x + Math.cos(ang) * 16, topY + 44 + breathe + Math.sin(ang) * 14, x + Math.cos(ang) * 16 + 4, topY + 44 + breathe + Math.sin(ang) * 14, x + Math.cos(ang) * 26, topY + 44 + breathe + Math.sin(ang) * 24 + fl); }
  // 手臂
  const armSw = Math.sin(now / 300) * 2.5;
  g.lineStyle(7, dark, 1); g.lineBetween(x - 16, topY + 56 + breathe, x - 24, topY + 82 + armSw);
  g.lineStyle(7, dark, 1); g.lineBetween(x + 16, topY + 56 + breathe, x + 22, topY + 80 - armSw);
  // 头 + 耳
  const hy = topY + 22 + breathe;
  g.fillStyle(dark, 1); g.fillCircle(x, hy, 17); g.fillStyle(fur, 1); g.fillCircle(x, hy - 1, 15);
  g.fillStyle(cream, 1); g.fillEllipse(x + f * 5, hy + 3, 15, 12);
  g.fillStyle(dark, 1); g.fillTriangle(x - f * 4, hy - 14, x - f * 12, hy - 20, x - f * 14, hy - 8); g.fillTriangle(x + f * 8, hy - 14, x + f * 16, hy - 20, x + f * 18, hy - 8);
  // 剑齿
  g.fillStyle(tusk, 1); g.fillTriangle(x + f * 5, hy + 5, x + f * 10, hy + 5, x + f * 8, hy + 22); g.fillTriangle(x + f * 11, hy + 5, x + f * 15, hy + 5, x + f * 15, hy + 20);
  const eyeH = 2.6 * blinkOf(now, 2);
  g.fillStyle(0x1a1208, 1); g.fillEllipse(x + f * 4, hy - 3, 3.2, eyeH); g.fillEllipse(x - f * 5, hy - 3, 3.2, eyeH);
  g.fillStyle(0xffe08a, 0.9); g.fillCircle(x + f * 4, hy - 3, 1); g.fillCircle(x - f * 5, hy - 3, 1);
  // 呼气白汽 + 落雪
  for (let k = 0; k < 3; k++) { const ph = ((now / 1200 + k / 3) % 1); g.fillStyle(0xdff4ff, (1 - ph) * 0.5); g.fillCircle(x + f * (14 + ph * 14), hy + 5 - ph * 6, 3 + ph * 3); }
  for (let k = 0; k < 5; k++) { const ph = ((now / 1900 + k / 5) % 1); g.fillStyle(0xffffff, (1 - ph) * 0.6); g.fillCircle(x - 30 + (k * 19 % 60), topY + 10 + ph * 100, 1.4); }
};

// ══ 非洲雷神：尚戈 ══════════════════════════════════════
export const yorShango: SkinPainter = (g, now, pose) => {
  const { x, feetY, move } = pose;
  const robe = 0xc0392b, robeD = 0x8a2418, white = 0xf0e8d8, skin = 0x8a5a3a, gold = 0xffb03a, bolt = 0xfff080;
  groundShadow(g, pose, 58);
  energyRing(g, x, feetY, 18, 0xffe08a, now, 0.2);
  const topY = feetY - 108, breathe = Math.sin(now / 440) * 2.4, sway = Math.sin(now / 420) * 3 + (move ?? 0) * 2;
  // 身后雷云
  for (let k = 0; k < 3; k++) { g.fillStyle(0x3a2018, 0.5); g.fillEllipse(x - 34 + k * 30 + sway, topY + 12 + Math.sin(now / 700 + k) * 4, 40, 22); }
  // 战袍 + 红白条纹 + 下摆飘动
  g.fillStyle(robeD, 1); g.beginPath(); g.moveTo(x - 22, topY + 44 + breathe); g.lineTo(x + 22, topY + 44 + breathe); g.lineTo(x + 28 + sway, feetY - 4); g.lineTo(x - 28 + sway, feetY - 4); g.closePath(); g.fillPath();
  g.fillStyle(robe, 1); g.beginPath(); g.moveTo(x - 19, topY + 46 + breathe); g.lineTo(x + 19, topY + 46 + breathe); g.lineTo(x + 24 + sway, feetY - 6); g.lineTo(x - 24 + sway, feetY - 6); g.closePath(); g.fillPath();
  for (let k = 0; k < 4; k++) { g.fillStyle(white, 1); g.fillPoints([{ x: x - 16 + k * 10, y: topY + 50 + breathe }, { x: x - 8 + k * 10, y: topY + 50 + breathe }, { x: x - 10 + k * 10 + sway, y: feetY - 8 }, { x: x - 18 + k * 10 + sway, y: feetY - 8 }] as never, true); }
  // 手臂
  g.lineStyle(8, robeD, 1); g.lineBetween(x - 18, topY + 54 + breathe, x - 28, topY + 86); g.lineBetween(x + 18, topY + 54 + breathe, x + 30, topY + 78);
  // 双刃斧（刃上游电）
  g.lineStyle(5, 0x6a4a2a, 1); g.lineBetween(x + 28, topY + 80, x + 36, topY + 26);
  g.fillStyle(gold, 1); g.fillPoints([{ x: x + 32, y: topY + 32 }, { x: x + 50, y: topY + 24 }, { x: x + 32, y: topY + 12 }] as never, true); g.fillPoints([{ x: x + 32, y: topY + 32 }, { x: x + 14, y: topY + 24 }, { x: x + 32, y: topY + 12 }] as never, true);
  g.fillStyle(0xffe08a, 0.5 + 0.5 * Math.abs(Math.sin(now / 150))); g.fillPoints([{ x: x + 33, y: topY + 26 }, { x: x + 42, y: topY + 22 }, { x: x + 33, y: topY + 18 }] as never, true);
  g.lineStyle(1.6, bolt, 0.6 + 0.4 * Math.abs(Math.sin(now / 110))); g.lineBetween(x + 40, topY + 30, x + 46, topY + 20); g.lineBetween(x + 46, topY + 20, x + 42, topY + 12);
  // 头 + 眼
  const hy = topY + 24 + breathe;
  g.fillStyle(skin, 1); g.fillCircle(x, hy, 12);
  const eyeH = 3 * blinkOf(now, 3);
  g.fillStyle(0x1a1208, 1); g.fillEllipse(x - 4, hy - 2, 3, eyeH); g.fillEllipse(x + 4, hy - 2, 3, eyeH);
  g.fillStyle(bolt, 0.8 + 0.2 * Math.sin(now / 200)); g.fillCircle(x - 4, hy - 2, 1.4); g.fillCircle(x + 4, hy - 2, 1.4);
  g.fillStyle(0x8a2a2a, 1); g.fillEllipse(x, hy + 5, 5, 2.4);
  // 头顶雷光
  g.lineStyle(2.4, bolt, 0.6 + 0.4 * Math.abs(Math.sin(now / 120))); g.beginPath(); g.moveTo(x - 2, hy - 12); g.lineTo(x + 3, hy - 20); g.lineTo(x - 2, hy - 24); g.lineTo(x + 4, hy - 34); g.strokePath();
  // 环绕电蛇（相位错开）
  for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2 + now / 900; const px = x + Math.cos(ang) * 42, py = topY + 48 + Math.sin(ang) * 36; g.lineStyle(2, bolt, 0.45 + 0.4 * Math.abs(Math.sin(now / 100 + k))); g.lineBetween(px, py, px + Math.cos(ang + 1.1) * 10, py + Math.sin(ang + 1.1) * 10); g.lineBetween(px + Math.cos(ang + 1.1) * 10, py + Math.sin(ang + 1.1) * 10, px + Math.cos(ang + 1.6) * 14, py + Math.sin(ang + 1.6) * 14); }
};

// ══ 芬兰史诗：巫歌智者 ══════════════════════════════════════
export const kalVain: SkinPainter = (g, now, pose) => {
  const { x, feetY, move } = pose;
  const robe = 0x3a5a6a, hi = 0x5a7f92, robeD = 0x24303a, skin = 0xd8c0a0, beard = 0xeef0ee, wood = 0xa8763a, wave = 0x9fe8d0;
  groundShadow(g, pose, 58);
  // 脚下浪涌
  for (let k = 0; k < 3; k++) { g.fillStyle(wave, 0.22 * (1 - k / 3)); g.fillEllipse(x + Math.sin(now / 600 + k) * 3, feetY + 2, 54 + k * 12, 10 + k * 4); }
  const topY = feetY - 106, breathe = Math.sin(now / 460) * 2.4, sway = Math.sin(now / 500) * 2 + (move ?? 0) * 2;
  // 长袍 + 下摆波纹
  g.fillStyle(robeD, 1); g.beginPath(); g.moveTo(x - 22, topY + 44 + breathe); g.lineTo(x + 22, topY + 44 + breathe); g.lineTo(x + 28 + sway, feetY - 4); g.lineTo(x - 28 + sway, feetY - 4); g.closePath(); g.fillPath();
  g.fillStyle(robe, 1); g.beginPath(); g.moveTo(x - 19, topY + 46 + breathe); g.lineTo(x + 19, topY + 46 + breathe); g.lineTo(x + 24 + sway, feetY - 6); g.lineTo(x - 24 + sway, feetY - 6); g.closePath(); g.fillPath();
  g.fillStyle(hi, 0.4); for (let k = 0; k < 3; k++) { g.fillTriangle(x - 14 + k * 12 + sway, feetY - 6, x - 6 + k * 12 + sway, feetY - 6, x - 10 + k * 12 + sway * 1.4, feetY - 22); }
  // 手臂抚琴
  const pluck = Math.sin(now / 180) * 2;
  g.lineStyle(8, robeD, 1); g.lineBetween(x - 20, topY + 54 + breathe, x - 30, topY + 74 + pluck); g.lineBetween(x + 18, topY + 54 + breathe, x + 6, topY + 70);
  // 康特勒琴（弦自颤）
  g.fillStyle(wood, 1); g.fillRoundedRect(x - 32, topY + 62, 26, 34, 6); g.fillStyle(0x7a5226, 1); g.fillRoundedRect(x - 30, topY + 64, 22, 30, 5);
  for (let k = 0; k < 4; k++) { const vib = Math.sin(now / 140 + k) * 1.2; g.lineStyle(1.2, wave, 0.9); g.lineBetween(x - 27 + vib, topY + 67 + k * 7, x - 11 + vib, topY + 67 + k * 7); }
  // 头 + 长须 + 长发
  const hy = topY + 24 + breathe;
  g.fillStyle(skin, 1); g.fillCircle(x, hy, 12);
  const bs = Math.sin(now / 700) * 1.5; g.fillStyle(beard, 1); g.fillPoints([{ x: x - 10, y: hy + 4 }, { x: x + 10, y: hy + 4 }, { x: x + 3 + bs, y: hy + 20 }, { x: x, y: hy + 34 }, { x: x - 3 + bs, y: hy + 20 }] as never, true);
  g.fillStyle(0xcfd6d6, 0.9); for (let k = 0; k < 4; k++) g.fillTriangle(x - 12 + k * 8, hy - 8, x - 9 + k * 8, hy - 8, x - 11 + k * 8, hy - 16);
  const eyeH = 2.6 * blinkOf(now, 4);
  g.fillStyle(0x1a1208, 1); g.fillEllipse(x - 4, hy - 2, 2.8, eyeH); g.fillEllipse(x + 4, hy - 2, 2.8, eyeH);
  // 音波圈（同心，循环外扩）
  for (let k = 0; k < 3; k++) { const ph = ((now / 1400 + k / 3) % 1); g.lineStyle(2, wave, (1 - ph) * 0.5); g.strokeCircle(x + 6, topY + 48, 12 + ph * 46); }
  // 飘飞音符
  for (let k = 0; k < 4; k++) { const ph = ((now / 1500 + k / 4) % 1); const nx = x + 30 + Math.sin(k * 2 + now / 500) * 8, ny = topY + 30 - ph * 30; g.fillStyle(wave, (1 - ph) * 0.9); g.fillEllipse(nx, ny, 5, 4); g.fillRect(nx + 1.4, ny - 8, 1.4, 8); }
};

// ══ 香蕉王国：香蕉大王 ══════════════════════════════════════
export const banKing: SkinPainter = (g, now, pose) => {
  const { x, feetY } = pose;
  const peel = 0xf0d020, peelD = 0xc0c020, flesh = 0xfff6c0, crown = 0xffd45c, spot = 0x8a8a1a, crownD = 0xd8a020;
  groundShadow(g, pose, 56);
  const topY = feetY - 102, breathe = Math.sin(now / 440) * 2.4, sway = Math.sin(now / 520) * 3;
  // 蕉皮袍 + 翻边
  g.fillStyle(peelD, 1); g.beginPath(); g.moveTo(x - 22, topY + 44 + breathe); g.lineTo(x + 22, topY + 44 + breathe); g.lineTo(x + 26 + sway, feetY - 4); g.lineTo(x - 26 + sway, feetY - 4); g.closePath(); g.fillPath();
  g.fillStyle(peel, 1); g.beginPath(); g.moveTo(x - 19, topY + 46 + breathe); g.lineTo(x + 19, topY + 46 + breathe); g.lineTo(x + 22 + sway, feetY - 6); g.lineTo(x - 22 + sway, feetY - 6); g.closePath(); g.fillPath();
  for (let k = 0; k < 4; k++) { g.fillStyle(spot, 0.6); g.fillCircle(x - 12 + k * 8, topY + 62 + breathe, 1.4); }
  // 剥开的皮翻边（摆动）
  g.fillStyle(flesh, 1); g.fillEllipse(x, topY + 46 + breathe, 24, 9);
  for (const s of [-1, 1]) { g.fillStyle(peel, 1); g.fillPoints([{ x: x + s * 12, y: topY + 48 + breathe }, { x: x + s * 24, y: topY + 60 + breathe }, { x: x + s * 20 + sway * 0.5, y: topY + 88 }] as never, true); }
  // 手臂
  const armSw = Math.sin(now / 300) * 3;
  g.lineStyle(8, peel, 1); g.lineBetween(x - 16, topY + 56 + breathe, x - 26, topY + 84 - armSw); g.lineBetween(x + 16, topY + 56 + breathe, x + 26, topY + 82 + armSw);
  // 香蕉头
  const hy = topY + 24 + breathe;
  g.fillStyle(peelD, 1); g.fillEllipse(x, hy, 24, 32);
  g.fillStyle(peel, 1); g.fillEllipse(x, hy - 1, 21, 29);
  g.fillStyle(0xfff6c0, 0.5); g.fillEllipse(x - 5, hy - 6, 8, 16);
  for (let k = 0; k < 3; k++) { g.fillStyle(spot, 0.6); g.fillCircle(x + 4, hy + 6 + k * 4, 1.3); }
  const eyeH = 3 * blinkOf(now, 5);
  g.fillStyle(0x1a1208, 1); g.fillEllipse(x - 5, hy - 4, 3, eyeH); g.fillEllipse(x + 5, hy - 4, 3, eyeH);
  g.fillStyle(0x8a2a2a, 1); g.fillEllipse(x, hy + 8, 6, 2.6);
  // 金冠（闪光）
  for (let k = 0; k < 5; k++) { g.fillStyle(crown, 1); g.fillTriangle(x - 14 + k * 7, hy - 12, x - 8 + k * 7, hy - 12, x - 11 + k * 7, hy - 26); }
  g.fillStyle(crownD, 1); g.fillRect(x - 15, hy - 13, 30, 5);
  g.fillStyle(0xffffff, 0.5 + 0.5 * Math.abs(Math.sin(now / 300))); g.fillCircle(x, hy - 22, 2);
  // 环绕跳跃的群蕉
  for (let k = 0; k < 5; k++) { const ang = (k / 5) * Math.PI * 2 + now / 1200; const px = x + Math.cos(ang) * 46, py = topY + 48 + Math.sin(ang) * 32 - Math.abs(Math.sin(now / 200 + k)) * 5; g.save(); g.translateCanvas(px, py); g.rotateCanvas(ang + Math.sin(now / 300 + k) * 0.2); g.fillStyle(peel, 1); g.fillEllipse(0, 0, 7, 16); g.fillStyle(spot, 0.8); g.fillCircle(0, -5, 1); g.fillStyle(peelD, 1); g.fillCircle(0, 7, 1.4); g.restore(); }
  // 落彩纸
  for (let k = 0; k < 6; k++) { const ph = ((now / 1600 + k / 6) % 1); const cols = [0xff5ec8, 0x7dff9a, 0x39ffd0, 0xffe040]; g.save(); g.translateCanvas(x - 34 + (k * 23 % 68), topY - 6 + ph * 110); g.rotateCanvas(ph * 5); g.fillStyle(cols[k % 4], 0.9); g.fillRect(-3, -2, 6, 4); g.restore(); }
};

// ══ 迷因宇宙：迷因蛙神 ══════════════════════════════════════
export const memeFrog: SkinPainter = (g, now, pose) => {
  const { x, feetY } = pose;
  const frog = 0x7fb84a, frogD = 0x5a8a34, belly = 0xd8e8b0, eyeW = 0xf0f0e0, ink = 0x1a1208;
  groundShadow(g, pose, 56);
  // 彩虹底光
  for (let k = 0; k < 3; k++) { const ph = ((now / 1600 + k / 3) % 1); g.lineStyle(3, [0xff5ec8, 0x39ffd0, 0xffe040][k], (1 - ph) * 0.4); g.strokeEllipse(x, feetY - 2, 30 + ph * 40, 8 + ph * 12); }
  const topY = feetY - 102, breathe = Math.sin(now / 420) * 2.4;
  // 身体
  g.fillStyle(frogD, 1); g.fillRoundedRect(x - 23, topY + 42 + breathe, 46, 56, 13);
  g.fillStyle(frog, 1); g.fillRoundedRect(x - 20, topY + 44 + breathe, 40, 52, 12);
  g.fillStyle(belly, 1); g.fillEllipse(x, topY + 72 + breathe, 22, 34);
  for (let k = 0; k < 3; k++) { g.fillStyle(frogD, 0.6); g.fillCircle(x - 6 + k * 6, topY + 60 + breathe, 2); }
  // 手臂
  const armSw = Math.sin(now / 280) * 3;
  g.lineStyle(8, frogD, 1); g.lineBetween(x - 18, topY + 56 + breathe, x - 26, topY + 84 - armSw); g.lineBetween(x + 18, topY + 56 + breathe, x + 26, topY + 82 + armSw);
  // 头 + 一只气球 + 眼
  const hy = topY + 22 + breathe;
  g.fillStyle(frog, 1); g.fillEllipse(x, hy + 4, 44, 30);
  g.fillStyle(belly, 0.7); g.fillEllipse(x, hy + 10, 24, 12);
  for (const s of [-1, 1]) { g.fillStyle(frog, 1); g.fillCircle(x + s * 13, hy - 9, 11); g.fillStyle(eyeW, 1); g.fillCircle(x + s * 13, hy - 9, 8); }
  const look = Math.sin(now / 600) * 2, lookY = Math.cos(now / 800) * 1.5;
  const eyeH = 7 * blinkOf(now, 6);
  g.fillStyle(ink, 1); g.fillEllipse(x - 13 + look, hy - 9 + lookY, 3.4, eyeH); g.fillEllipse(x + 13 + look, hy - 9 + lookY, 3.4, eyeH);
  g.fillStyle(ink, 1); g.beginPath(); g.arc(x, hy + 12, 12, 0.15, Math.PI - 0.15); g.strokePath();
  // 弹幕（滚动，两行）
  for (let k = 0; k < 4; k++) { const bx = ((now / 3 + k * 70) % 180) - 90; g.fillStyle(k % 2 ? 0x7dff9a : 0x39ffd0, 0.85); g.fillRoundedRect(x + bx, hy - 30 - (k % 2) * 8, 24, 5, 2); }
  // 像素闪光
  for (let k = 0; k < 5; k++) { const ph = ((now / 700 + k / 5) % 1); const px = x - 40 + (k * 21 % 80), py = topY + 20 - ph * 30; g.fillStyle([0xffe040, 0xffffff, 0xff5ec8][k % 3], (1 - ph) * 0.9); g.fillRect(px, py, 3, 3); }
};

// ══ 摸鱼办公室：摸鱼打工人 ══════════════════════════════════════
export const officeSlacker: SkinPainter = (g, now, pose) => {
  const { x, feetY } = pose;
  const suit = 0x3a4a6a, suitD = 0x2a3450, skin = 0xd8b48a, cup = 0xf0f0e8, coffee = 0x6a4a2a;
  groundShadow(g, pose, 56);
  // 工位灯光
  g.fillStyle(0x9fd8ff, 0.15); g.fillEllipse(x, feetY - 4, 90, 40);
  const topY = feetY - 104, breathe = Math.sin(now / 440) * 2.4, sway = Math.sin(now / 600) * 2;
  // 西装 + 领带
  g.fillStyle(suitD, 1); g.beginPath(); g.moveTo(x - 22, topY + 44 + breathe); g.lineTo(x + 22, topY + 44 + breathe); g.lineTo(x + 26 + sway, feetY - 4); g.lineTo(x - 26 + sway, feetY - 4); g.closePath(); g.fillPath();
  g.fillStyle(suit, 1); g.beginPath(); g.moveTo(x - 19, topY + 46 + breathe); g.lineTo(x + 19, topY + 46 + breathe); g.lineTo(x + 22 + sway, feetY - 6); g.lineTo(x - 22 + sway, feetY - 6); g.closePath(); g.fillPath();
  g.fillStyle(0x2a3450, 1); g.beginPath(); g.moveTo(x - 8, topY + 46 + breathe); g.lineTo(x - 2, topY + 70); g.lineTo(x - 14, topY + 70); g.closePath(); g.fillPath();
  g.fillStyle(0xf0f0e8, 1); g.fillPoints([{ x: x - 6, y: topY + 48 + breathe }, { x: x + 6, y: topY + 48 + breathe }, { x: x + 4, y: topY + 76 }, { x: x - 4, y: topY + 76 }] as never, true);
  g.fillStyle(0xc0392b, 1); g.fillPoints([{ x: x - 4, y: topY + 50 + breathe }, { x: x + 4, y: topY + 50 + breathe }, { x: x, y: topY + 72 }] as never, true);
  for (let k = 0; k < 3; k++) { g.fillStyle(0x1f2a44, 0.6); g.fillCircle(x - 2, topY + 72 + k * 8, 1.6); }
  // 手臂（一只举咖啡）
  g.lineStyle(7, suitD, 1); g.lineBetween(x - 17, topY + 54 + breathe, x - 25, topY + 84); g.lineBetween(x + 17, topY + 54 + breathe, x + 24, topY + 74);
  // 头 + 眼（下垂打盹）
  const hy = topY + 24 + breathe;
  g.fillStyle(skin, 1); g.fillCircle(x, hy, 12);
  g.fillStyle(0x3a2a1a, 1); g.beginPath(); g.arc(x, hy - 2, 12, Math.PI, 0); g.fillPath();
  const droop = Math.max(0, Math.sin(now / 1100)) * 3;
  g.fillStyle(0x1a1208, 1); g.fillEllipse(x - 4, hy - 1 + droop, 3, 2.4); g.fillEllipse(x + 4, hy - 1 + droop, 3, 2.4);
  // 咖啡杯 + 热气
  g.fillStyle(cup, 1); g.fillRoundedRect(x + 20, hy - 2, 11, 12, 2); g.fillStyle(coffee, 1); g.fillRect(x + 21, hy - 1, 9, 4);
  for (let k = 0; k < 3; k++) { const ph = ((now / 1400 + k / 3) % 1); g.fillStyle(0xffffff, (1 - ph) * 0.5); g.fillCircle(x + 25 + Math.sin(k * 2 + now / 500) * 3, hy - 4 - ph * 14, 2 + ph * 2); }
  // Z 字气泡
  for (let k = 0; k < 3; k++) { const ph = ((now / 1700 + k / 3) % 1); const zx = x + 16 + Math.sin(k) * 4, zy = hy - 18 - ph * 28; g.lineStyle(2, 0x9fd8ff, (1 - ph) * 0.9); g.lineBetween(zx - 4, zy - 4, zx + 4, zy - 4); g.lineBetween(zx + 4, zy - 4, zx - 4, zy + 4); g.lineBetween(zx - 4, zy + 4, zx + 4, zy + 4); }
  // 飘落便签
  for (let k = 0; k < 5; k++) { const ph = ((now / 1800 + k / 5) % 1); const cols = [0xffd45c, 0xff9adf, 0x9fd8ff, 0xa8ff7a, 0xff9a6a]; const px = x - 34 + (k * 19 % 68); g.save(); g.translateCanvas(px + Math.sin(ph * 6 + k) * 5, topY + 6 + ph * 108); g.rotateCanvas(Math.sin(now / 600 + k) * 0.4); g.fillStyle(cols[k % 5], 0.9); g.fillRect(-5, -5, 10, 10); g.restore(); }
};

// ══ 花园地精：地精长老 ══════════════════════════════════════
export const gnomeElder: SkinPainter = (g, now, pose) => {
  const { x, feetY, move } = pose;
  const robe = 0x436b3a, robeD = 0x2f4a2a, skin = 0xe0b890, beard = 0xf0f0e8, sack = 0xa89060, mush = 0xc0392b, mushS = 0xf0f0e8, leaf = 0xa8ff7a;
  groundShadow(g, pose, 58);
  // 脚下蘑菇圈
  for (let k = 0; k < 5; k++) { const ang = (k / 5) * Math.PI * 2; const px = x + Math.cos(ang) * 30, py = feetY - Math.max(0, Math.sin(ang)) * 16; g.fillStyle(0xe8e0d0, 1); g.fillRect(px - 1.4, py - 3, 2.8, 5); g.fillStyle(mush, 1); g.fillEllipse(px, py - 4, 8, 5); g.fillStyle(mushS, 1); g.fillCircle(px - 1.5, py - 5, 1); }
  const topY = feetY - 104, breathe = Math.sin(now / 460) * 2.4, sway = Math.sin(now / 520) * 2 + (move ?? 0) * 2;
  // 袍 + 下摆
  g.fillStyle(robeD, 1); g.beginPath(); g.moveTo(x - 24, topY + 44 + breathe); g.lineTo(x + 24, topY + 44 + breathe); g.lineTo(x + 30 + sway, feetY - 4); g.lineTo(x - 30 + sway, feetY - 4); g.closePath(); g.fillPath();
  g.fillStyle(robe, 1); g.beginPath(); g.moveTo(x - 21, topY + 46 + breathe); g.lineTo(x + 21, topY + 46 + breathe); g.lineTo(x + 26 + sway, feetY - 6); g.lineTo(x - 26 + sway, feetY - 6); g.closePath(); g.fillPath();
  for (let k = 0; k < 3; k++) { g.fillStyle(0x2f4a2a, 0.5); g.fillRect(x - 16 + k * 14 + sway, topY + 62 + breathe, 3, 20); }
  // 手臂
  const armSw = Math.sin(now / 300) * 3;
  g.lineStyle(7, robeD, 1); g.lineBetween(x - 20, topY + 54 + breathe, x - 28, topY + 82 - armSw); g.lineBetween(x + 20, topY + 54 + breathe, x + 28, topY + 80 + armSw);
  // 麻袋
  g.fillStyle(0x8a7448, 1); g.fillRoundedRect(x - 34, topY + 54, 16, 26, 7);
  g.fillStyle(sack, 1); g.fillRoundedRect(x - 32, topY + 56, 12, 22, 6);
  // 头 + 大白胡子
  const hy = topY + 24 + breathe;
  g.fillStyle(skin, 1); g.fillCircle(x, hy, 11);
  const bs = Math.sin(now / 700) * 1.5; g.fillStyle(beard, 1); g.fillPoints([{ x: x - 10, y: hy + 3 }, { x: x + 10, y: hy + 3 }, { x: x + 2 + bs, y: hy + 22 }, { x: x, y: hy + 34 }, { x: x - 2 + bs, y: hy + 22 }] as never, true);
  const eyeH = 2.6 * blinkOf(now, 7);
  g.fillStyle(0x1a1208, 1); g.fillEllipse(x - 4, hy - 2, 2.8, eyeH); g.fillEllipse(x + 4, hy - 2, 2.8, eyeH);
  // 尖帽（自我弯折）
  const bend = Math.sin(now / 500) * 6;
  g.fillStyle(0xa02a20, 1); g.fillPoints([{ x: x - 17, y: hy - 8 }, { x: x + 17, y: hy - 8 }, { x: x + bend * 0.6, y: hy - 42 }] as never, true);
  g.fillStyle(0xc0392b, 1); g.fillPoints([{ x: x - 16, y: hy - 9 }, { x: x + 16, y: hy - 9 }, { x: x + bend * 0.6, y: hy - 40 }] as never, true);
  g.fillStyle(0x8a2018, 1); g.fillRoundedRect(x - 17, hy - 12, 34, 4, 2);
  // 帽里蘑菇（微晃）
  const mw = Math.sin(now / 400) * 1; g.fillStyle(mush, 1); g.fillEllipse(x - 6, hy - 22 + mw, 13, 8); g.fillStyle(mushS, 1); g.fillCircle(x - 9, hy - 23 + mw, 1.6); g.fillCircle(x - 3, hy - 24 + mw, 1.3); g.fillStyle(0xe8e0d0, 1); g.fillRect(x - 7, hy - 19 + mw, 2.6, 5);
  // 飘花瓣 + 孢子
  for (let k = 0; k < 5; k++) { const ph = ((now / 1600 + k / 5) % 1); g.fillStyle(0xffd0e2, (1 - ph) * 0.8); g.save(); g.translateCanvas(x - 34 + (k * 21 % 68) + Math.sin(ph * 6 + k) * 6, topY + 4 + ph * 104); g.rotateCanvas(ph * 4); g.fillEllipse(0, 0, 6, 3); g.restore(); }
  for (let k = 0; k < 4; k++) { const ph = ((now / 1200 + k / 4) % 1); g.fillStyle(leaf, (1 - ph) * 0.7); g.fillCircle(x - 20 + (k * 17 % 44), feetY - ph * 70, 1.6); }
};

// ══ 垃圾回收站：回收王 ══════════════════════════════════════
export const trashKing: SkinPainter = (g, now, pose) => {
  const { x, feetY } = pose;
  const can = 0x5a6a5a, canHi = 0x7a8a7a, canD = 0x3a4a3a, bag = 0x3a4444, rust = 0x8a5a2a, eye = 0xffd45c;
  groundShadow(g, pose, 58);
  // 臭气波纹
  for (let k = 0; k < 3; k++) { const ph = ((now / 1500 + k / 3) % 1); g.lineStyle(2.4, 0x7dff9a, (1 - ph) * 0.35); g.strokeEllipse(x, feetY + 1, 24 + ph * 46, 7 + ph * 12); }
  const topY = feetY - 100, breathe = Math.sin(now / 460) * 2.4, sway = Math.sin(now / 540) * 2;
  // 垃圾袋袍 + 破口
  g.fillStyle(bag, 1); g.beginPath(); g.moveTo(x - 24, topY + 44 + breathe); g.lineTo(x + 24, topY + 44 + breathe); g.lineTo(x + 30 + sway, feetY - 4); g.lineTo(x - 30 + sway, feetY - 4); g.closePath(); g.fillPath();
  g.fillStyle(0x2a3030, 0.7); for (let k = 0; k < 5; k++) { g.fillTriangle(x - 22 + k * 11 + sway, feetY - 4, x - 8 + k * 11 + sway, feetY - 4, x - 15 + k * 11 + sway, feetY + 5); }
  // 桶身 + 锈迹 + 拉手
  g.fillStyle(canD, 1); g.fillRoundedRect(x - 22, topY + 42 + breathe, 44, 58, 7);
  g.fillStyle(can, 1); g.fillRoundedRect(x - 19, topY + 44 + breathe, 38, 54, 6);
  g.fillStyle(canHi, 0.5); g.fillRect(x - 16, topY + 46 + breathe, 5, 50);
  g.fillStyle(rust, 0.55); g.fillEllipse(x - 6, topY + 68 + breathe, 9, 6); g.fillEllipse(x + 9, topY + 80 + breathe, 7, 5); g.fillEllipse(x - 10, topY + 86 + breathe, 6, 4);
  g.lineStyle(3, rust, 0.5); g.strokeCircle(x + 7, topY + 62 + breathe, 5);
  // 手臂
  const armSw = Math.sin(now / 300) * 2.5;
  g.lineStyle(8, canD, 1); g.lineBetween(x - 18, topY + 56 + breathe, x - 26, topY + 84 - armSw); g.lineBetween(x + 18, topY + 56 + breathe, x + 26, topY + 82 + armSw);
  // 头（桶盖） + 眼
  const hy = topY + 26 + breathe;
  g.fillStyle(canD, 1); g.fillRoundedRect(x - 16, hy - 13, 32, 26, 6);
  g.fillStyle(can, 1); g.fillRoundedRect(x - 14, hy - 11, 28, 22, 5);
  g.fillStyle(canHi, 0.4); g.fillRoundedRect(x - 12, hy - 9, 8, 18, 4);
  const eyeH = 3 * blinkOf(now, 8);
  g.fillStyle(eye, 0.95); g.fillEllipse(x - 5, hy - 2, 7, 7); g.fillStyle(0x1a1208, 1); g.fillEllipse(x - 5, hy - 2, 1.8, eyeH);
  g.fillStyle(0x1a1208, 1); g.fillEllipse(x + 5, hy - 2, 2.4, eyeH); g.fillEllipse(x, hy + 7, 6, 2);
  // 铁罐冠（反光 + 一闪）
  for (let k = 0; k < 5; k++) { g.fillStyle(k % 2 ? rust : 0xb84a3a, 1); g.fillRoundedRect(x - 14 + k * 6, hy - 24 - (k % 2) * 4, 5, 12, 2); g.fillStyle(0xe0e0d0, 0.5); g.fillRect(x - 13 + k * 6, hy - 20 - (k % 2) * 4, 3, 2); }
  g.fillStyle(0xffffff, 0.4 + 0.5 * Math.abs(Math.sin(now / 320))); g.fillCircle(x + (Math.floor(now / 320) % 2 ? -8 : 8), hy - 22, 1.6);
  // 绕飞苍蝇
  for (let k = 0; k < 5; k++) { const ang = (k / 5) * Math.PI * 2 + now / 380; const px = x + Math.cos(ang) * 42, py = topY + 42 + Math.sin(ang) * 32; g.fillStyle(0x2a2a2a, 1); g.fillCircle(px, py, 1.8); g.fillStyle(0x00000077); g.fillPoints([{ x: px, y: py }, { x: px - 4, y: py - 2 }, { x: px - 2, y: py }] as never, true); g.fillPoints([{ x: px, y: py }, { x: px + 4, y: py - 2 }, { x: px + 2, y: py }] as never, true); }
};
