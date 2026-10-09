import { groundShadow, type SkinPainter } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第六批 5★ 民俗神话皮肤：芭芭雅嘎 / 西摩格神鸟 / 太阳神因蒂 / 半神毛伊 / 虹蛇 */

/** 芭芭雅嘎：骑飞天木研钵的鸡爪屋女巫，蓬发长鼻、骷髅篱笆环绕、周身绿巫火 */
export const slavBaba: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, move } = pose;
  const robe = 0x4a3a2a, robeD = 0x2a2018, skin = 0xc8b89a, hair = 0x8a8a8a, fire = 0x7dff6a, wood = 0x6a4a2a;
  groundShadow(g, pose, 70);
  const topY = feetY - 112;
  const breathe = Math.sin(now / 460) * 2;
  // 悬浮木研钵
  g.fillStyle(0x3a2814, 1); g.fillPoints([{ x: x - 34, y: feetY - 10 }, { x: x + 34, y: feetY - 10 }, { x: x + 24, y: feetY + 12 }, { x: x - 24, y: feetY + 12 }] as never, true);
  g.fillStyle(wood, 1); g.fillPoints([{ x: x - 30, y: feetY - 8 }, { x: x + 30, y: feetY - 8 }, { x: x + 21, y: feetY + 9 }, { x: x - 21, y: feetY + 9 }] as never, true);
  g.fillStyle(fire, 0.4); g.fillEllipse(x, feetY + 2, 44, 8);
  // 臼杵
  for (const s of [-1, 1]) { const sw = Math.sin(now / 360 + (s > 0 ? 0 : Math.PI)); g.lineStyle(6, wood, 1); g.beginPath(); g.moveTo(x + s * 16, feetY - 8); g.lineTo(x + s * (30 + sw * 10), topY + 40); g.strokePath(); }
  // 长袍躯干
  g.fillStyle(robeD, 1); g.beginPath(); g.moveTo(x - 20, topY + 44 + breathe); g.lineTo(x + 20, topY + 44 + breathe); g.lineTo(x + 26, feetY - 6); g.lineTo(x - 26, feetY - 6); g.closePath(); g.fillPath();
  g.fillStyle(robe, 1); g.beginPath(); g.moveTo(x - 17, topY + 46 + breathe); g.lineTo(x + 17, topY + 46 + breathe); g.lineTo(x + 22, feetY - 8); g.lineTo(x - 22, feetY - 8); g.closePath(); g.fillPath();
  for (let k = 0; k < 4; k++) { g.fillStyle(0x1a1410, 0.5); g.fillRect(x - 16 + k * 9, topY + 60 + breathe, 3, 30); }
  // 手臂
  g.lineStyle(8, robeD, 1); g.lineBetween(x - 16, topY + 52 + breathe, x - 30 + Math.sin(now / 400) * 3, topY + 84);
  g.lineStyle(8, robeD, 1); g.lineBetween(x + 16, topY + 52 + breathe, x + 28, topY + 88);
  // 头：鹰钩长鼻 + 蓬发
  const hy = topY + 26 + breathe;
  for (let k = 0; k < 6; k++) { const hsw = Math.sin(now / 300 + k * 0.9) * 3; g.fillStyle(hair, 0.95); g.fillTriangle(x - 12 + k * 4, hy - 4, x - 9 + k * 4, hy - 22, x - 6 + k * 4 + hsw, hy - 12); }
  g.fillStyle(skin, 1); g.fillCircle(x, hy, 11);
  g.fillStyle(skin, 1); g.fillPoints([{ x: x + 2, y: hy - 2 }, { x: x + 16, y: hy + 2 }, { x: x + 2, y: hy + 5 }] as never, true); // 鹰钩鼻
  g.fillStyle(0x1a1a1e, 1); g.fillEllipse(x - 4, hy - 3, 3.4, 2.4); g.fillEllipse(x + 4, hy - 3, 3.4, 2.4);
  g.fillStyle(fire, 0.8 + 0.2 * Math.sin(now / 300)); g.fillCircle(x - 4, hy - 3, 1.2); g.fillCircle(x + 4, hy - 3, 1.2);
  g.fillStyle(0x8a2a2a, 1); g.fillEllipse(x + 1, hy + 5, 5, 2.4);
  g.fillStyle(0x3a3a3a, 1); g.fillPoints([{ x: x - 10, y: hy - 12 }, { x: x + 10, y: hy - 12 }, { x: x, y: hy - 26 }] as never, true);
  // 骷髅篱笆环
  for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2 + now / 3000; const px = x + Math.cos(ang) * 54, py = topY + 52 + Math.sin(ang) * 34; g.fillStyle(0xd8e0d0, 0.7); g.fillCircle(px, py, 5); g.fillStyle(0x1a1a1e, 0.7); g.fillCircle(px - 1.6, py - 1, 1.4); g.fillCircle(px + 1.6, py - 1, 1.4); }
  // 巫火
  const pulse = 0.5 + 0.5 * Math.sin(now / 400);
  for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2 + now / 1600; const px = x + Math.cos(ang) * 60, py = topY + 46 + Math.sin(ang) * 60; const fl = 0.5 + 0.5 * Math.sin(now / 260 + k); g.fillStyle(fire, 0.5 * fl); g.fillEllipse(px, py, 6, 12); g.fillStyle(0xd8ff9a, 0.7 * fl); g.fillEllipse(px, py + 1, 3, 8); }
  void move; void pulse;
};

/** 西摩格神鸟：丹红金身孔雀式神鸟，三根长尾羽错相摆、火焰光羽上升、足踏金轮 */
export const persSimurgh: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f } = pose;
  const gold = 0xffb03a, red = 0xc0392b, cream = 0xfff0d0, flame = 0xff5a2a;
  groundShadow(g, pose, 62);
  const by = feetY - 74 + Math.sin(now / 420) * 4;
  const flap = Math.sin(now / 260);
  // 双翼（动作画法）
  for (const s of [-1, 1]) {
    g.fillStyle(red, 0.95); g.fillPoints([{ x, y: by - 6 }, { x: x + s * 40, y: by - 40 - flap * 10 }, { x: x + s * 70, y: by + 4 }, { x: x + s * 22, y: by + 14 }] as never, true);
    g.fillStyle(gold, 1); g.fillPoints([{ x, y: by - 6 }, { x: x + s * 34, y: by - 34 - flap * 10 }, { x: x + s * 60, y: by + 2 }, { x: x + s * 20, y: by + 10 }] as never, true);
  }
  // 身体
  g.fillStyle(red, 1); g.fillEllipse(x, by, 30, 22);
  g.fillStyle(gold, 1); g.fillEllipse(x, by - 2, 24, 17);
  g.fillStyle(cream, 0.5); g.fillEllipse(x, by + 6, 16, 6);
  // 三根长尾羽
  for (let k = 0; k < 3; k++) {
    const sw = Math.sin(now / 380 + k * 1.8) * 5;
    g.fillStyle(k === 1 ? cream : gold, 0.95);
    g.fillPoints([{ x: x - 8 * f, y: by }, { x: x - (40 + k * 8) * f + sw, y: by + 22 + k * 6 }, { x: x - (34 + k * 8) * f + sw, y: by + 4 }] as never, true);
    g.fillStyle(0x2a4a8a, 0.9); g.fillEllipse(x - (38 + k * 8) * f + sw, by + 14 + k * 4, 6, 9);
  }
  // 头 + 冠羽
  const hy = by - 26;
  const hx = x + 22 * f;
  g.fillStyle(gold, 1); g.fillCircle(hx, hy, 10);
  g.fillStyle(red, 1); g.fillTriangle(hx + 8 * f, hy - 1, hx + 18 * f, hy + 2, hx + 8 * f, hy + 5);
  for (let k = 0; k < 3; k++) { g.fillStyle(k % 2 ? gold : red, 0.95); g.fillTriangle(hx - 4 + k * 4, hy - 8, hx - 2 + k * 4 + Math.sin(now / 400 + k) * 2, hy - 22 - k * 3, hx + 2 + k * 4, hy - 8); }
  g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx + 3 * f, hy - 2, 1.8);
  g.fillStyle(0xffffff, 0.9); g.fillCircle(hx + 4 * f, hy - 3, 0.7);
  // 足踏金轮
  g.lineStyle(5, gold, 0.9); g.save(); g.translateCanvas(x, feetY - 6 + Math.sin(now / 380) * 2); g.scaleCanvas(1, 0.3); g.beginPath(); g.arc(0, 0, 26, 0, Math.PI * 2); g.strokePath(); g.restore();
  // 火焰光羽
  for (let k = 0; k < 8; k++) { const ph = ((now / 1300 + k / 8) % 1); g.fillStyle(k % 2 ? flame : gold, (1 - ph) * 0.7); g.fillCircle(x + Math.sin(k * 2.3) * 40, by + 10 - ph * 80, 1.8); }
};

/** 太阳神因蒂：黄金太阳脸 + 放射光芒 + 三色羽冠 + 美洲狮毛领 + 胸前金盘 */
export const incaInti: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const gold = 0xffd45c, goldD = 0xb87a1a, skin = 0xe8c88a, red = 0xc0392b;
  groundShadow(g, pose, 66);
  const topY = feetY - 114;
  const breathe = Math.sin(now / 540) * 2;
  // 放射面盘
  const rot = now / 2600;
  for (let k = 0; k < 20; k++) {
    const ang = rot + (k / 20) * Math.PI * 2;
    const len = 22 + 8 * (0.5 + 0.5 * Math.sin(now / 260 + k));
    g.fillStyle(k % 2 ? gold : goldD, 0.75);
    g.fillTriangle(x + Math.cos(ang) * 30, topY + 34 + Math.sin(ang) * 30, x + Math.cos(ang + 0.1) * (30 + len), topY + 34 + Math.sin(ang + 0.1) * (30 + len), x + Math.cos(ang - 0.1) * (30 + len), topY + 34 + Math.sin(ang - 0.1) * (30 + len));
  }
  // 躯体
  g.fillStyle(goldD, 1); g.beginPath(); g.moveTo(x - 24, topY + 60 + breathe); g.lineTo(x + 24, topY + 60 + breathe); g.lineTo(x + 28, feetY - 20); g.lineTo(x - 28, feetY - 20); g.closePath(); g.fillPath();
  g.fillStyle(gold, 1); g.beginPath(); g.moveTo(x - 21, topY + 62 + breathe); g.lineTo(x + 21, topY + 62 + breathe); g.lineTo(x + 24, feetY - 22); g.lineTo(x - 24, feetY - 22); g.closePath(); g.fillPath();
  // 美洲狮毛领
  for (let k = 0; k < 9; k++) { g.fillStyle(k % 2 ? 0xd8a86a : 0xc09050, 0.9); g.fillCircle(x - 24 + k * 6, topY + 58 + breathe, 5); }
  // 胸前金盘
  const gl = 0.6 + 0.4 * Math.sin(now / 320);
  g.fillStyle(goldD, 1); g.fillCircle(x, topY + 90 + breathe, 10);
  g.fillStyle(gold, 1); g.fillCircle(x, topY + 90 + breathe, 7.5);
  g.fillStyle(0xffffff, gl * 0.8); g.fillCircle(x - 2, topY + 88 + breathe, 2);
  // 太阳脸
  const hy = topY + 34;
  g.fillStyle(gold, 1); g.fillCircle(x, hy, 18);
  g.fillStyle(skin, 1); g.fillCircle(x, hy, 14);
  const eye = Math.sin(now / 700) > -0.9 ? 1 : 0.15;
  g.fillStyle(0x1a1a1e, 1); g.fillEllipse(x - 5, hy - 2, 4, 2.6 * eye); g.fillEllipse(x + 5, hy - 2, 4, 2.6 * eye);
  g.fillStyle(0x8a5a1a, 1); g.fillEllipse(x, hy + 6, 6, 3);
  // 三色羽冠
  for (let k = 0; k < 5; k++) { const sw = Math.sin(now / 360 + k * 0.8) * 3; g.fillStyle([red, gold, 0x5a8aff, gold, red][k], 0.95); g.fillTriangle(x - 10 + k * 5, hy - 14, x - 7 + k * 5 + sw, hy - 34, x - 2 + k * 5, hy - 14); }
};

/** 半神毛伊：满身波浪刺青的半神，手持神钩、腰间太阳之索旋转、脚下浪花 */
export const polyMaui: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f, move } = pose;
  const skin = 0x9a6a44, skinD = 0x6a4630, tattoo = 0x1a3a4a, hook = 0xd8e0cc, rope = 0xd8c8a0, foam = 0xdff6ff;
  groundShadow(g, pose, 60);
  const topY = feetY - 108;
  const breathe = Math.sin(now / 500) * 2;
  const step = Math.sin(now / 300) * (move ?? 0);
  // 脚下浪花
  for (let k = 0; k < 5; k++) { const ph = ((now / 700 + k / 5) % 1); g.fillStyle(foam, (1 - ph) * 0.6); g.fillEllipse(x - 24 + k * 12 + Math.sin(now / 400 + k) * 3, feetY - ph * 6, 12, 5); }
  // 腿 + 身躯
  g.fillStyle(skinD, 1); g.fillRoundedRect(x - 18 + step, feetY - 34, 15, 34, 6); g.fillRoundedRect(x + 3 + step, feetY - 34, 15, 34, 6);
  g.fillStyle(skin, 1); g.fillRoundedRect(x - 20, topY + 46 + breathe, 40, 30, 10);
  g.fillStyle(skin, 1); g.fillCircle(x, topY + 30 + breathe, 15);
  g.fillRect(x - 14, topY + 30 + breathe, 28, 26);
  // 波浪刺青（沿身流动）
  for (let k = 0; k < 5; k++) { const yy = topY + 46 + k * 6 + breathe; g.lineStyle(1.4, tattoo, 0.7); g.beginPath(); for (let s = 0; s <= 5; s++) { const px = x - 14 + s * 5.6; const py = yy + Math.sin(s * 1.4 + now / 400 + k) * 2; if (s === 0) g.moveTo(px, py); else g.lineTo(px, py); } g.strokePath(); }
  // 手臂
  g.lineStyle(7, skin, 1); g.lineBetween(x - 16, topY + 50 + breathe, x - 28, topY + 74);
  g.lineStyle(7, skin, 1); g.lineBetween(x + 16, topY + 50 + breathe, x + 30 * f, topY + 40);
  // 神钩
  const hx = x + 32 * f, hy = topY + 38;
  g.lineStyle(4, 0x9a8a6a, 1); g.beginPath(); g.moveTo(hx, hy - 14); g.lineTo(hx, hy + 4); g.arc(hx - 2, hy + 4, 6, 0, Math.PI); g.strokePath();
  g.lineStyle(2, hook, 1); g.beginPath(); g.moveTo(hx, hy - 14); g.lineTo(hx, hy + 4); g.arc(hx - 2, hy + 4, 6, 0, Math.PI); g.strokePath();
  g.fillStyle(0x5fe8d0, 0.6 + 0.4 * Math.sin(now / 300)); g.fillCircle(hx - 1, hy - 14, 1.8);
  // 太阳之索（腰间旋转）
  for (let k = 0; k < 3; k++) { g.lineStyle(3, rope, 0.8); g.save(); g.translateCanvas(x, topY + 62 + breathe); g.scaleCanvas(1, 0.4); g.beginPath(); g.arc(0, 0, 22 + k * 5, now / 400 + k, now / 400 + k + Math.PI * 1.6); g.strokePath(); g.restore(); }
  // 头
  g.fillStyle(skin, 1); g.fillCircle(x, topY + 12 + breathe, 11);
  g.fillStyle(0x1a1a1e, 1); g.fillCircle(x - 4, topY + 10 + breathe, 1.8); g.fillCircle(x + 4, topY + 10 + breathe, 1.8);
  g.fillStyle(0x3a2418, 1); g.fillEllipse(x, topY + 2 + breathe, 22, 9);
  for (let k = 0; k < 6; k++) { g.fillStyle(k % 2 ? 0xffd45c : 0xc0392b, 0.95); g.fillTriangle(x - 12 + k * 4, topY + 8 + breathe, x - 9 + k * 4 + Math.sin(now / 400 + k) * 2, topY - 8 + breathe, x - 6 + k * 4, topY + 8 + breathe); }
};

/** 虹蛇：七彩鳞环的创世巨蛇，蛇身盘绕、鳞色流动、身下水潭 */
export const auzRainbowSerpent: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const cols = [0xff5a5a, 0xff9a3c, 0xffd45c, 0x8fd45a, 0x5fd0ff, 0x7a6aff, 0xd45aff];
  groundShadow(g, pose, 74);
  const topY = feetY - 116;
  const bob = Math.sin(now / 440) * 3;
  // 水潭波纹
  for (let k = 0; k < 4; k++) { g.lineStyle(2, 0x5fd0ff, 0.25 * (1 - k / 4)); g.save(); g.translateCanvas(x, feetY + 2); g.scaleCanvas(1, 0.28); g.beginPath(); g.arc(0, 0, 24 + k * 14 + ((now / 400 + k) % 1) * 6, 0, Math.PI * 2); g.strokePath(); g.restore(); }
  // 盘绕蛇身（每节相位错开蠕动）
  const seg = 16;
  for (let k = 0; k < seg; k++) {
    const t = k / (seg - 1);
    const ang = t * Math.PI * 3.2 + now / 900;
    const rr = 44 - t * 12;
    const px = x + Math.cos(ang) * rr;
    const py = feetY - 16 - t * 82 + bob + Math.sin(now / 300 + k * 0.7) * 3;
    const rad = 11 - t * 4;
    g.fillStyle(0x1e5a36, 0.4); g.fillCircle(px, py + 2, rad + 1.5);
    g.fillStyle(cols[(k + Math.floor(now / 200)) % 7], 1); g.fillCircle(px, py, rad);
    g.fillStyle(0xffffff, 0.3); g.fillCircle(px - rad * 0.3, py - rad * 0.3, rad * 0.35);
  }
  // 蛇头
  const hx = x + Math.cos(now / 900 + seg * 0.18) * 34;
  const hy = feetY - 16 - 82 + bob + Math.sin(now / 300 + seg * 0.7) * 3;
  g.fillStyle(cols[Math.floor(now / 200) % 7], 1); g.fillEllipse(hx, hy, 24, 16);
  g.fillStyle(0x1a1a16, 1); g.fillEllipse(hx + 2, hy - 4, 3, 3);
  g.fillStyle(0xfff0a0, 0.95); g.fillCircle(hx + 2, hy - 4, 1.2);
  const tongue = Math.sin(now / 150) > 0 ? 1 : 0;
  if (tongue) { g.lineStyle(1.4, 0xff3a5a, 0.9); g.beginPath(); g.moveTo(hx + 11, hy + 1); g.lineTo(hx + 20, hy - 1); g.strokePath(); g.beginPath(); g.moveTo(hx + 20, hy - 1); g.lineTo(hx + 24, hy - 3); g.strokePath(); }
  // 头顶光点圈
  for (let k = 0; k < 6; k++) { const ang = -Math.PI / 2 + (k / 5) * Math.PI; g.fillStyle(0xfff0a0, 0.8); g.fillCircle(hx + Math.cos(ang) * 14, hy + Math.sin(ang) * 14, 1.6); }
  void topY;
};
