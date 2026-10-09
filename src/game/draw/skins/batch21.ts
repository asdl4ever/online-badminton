import { groundShadow, type SkinPainter } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第十批主题形象（梦境 / 微观 / 炼金 / 毛线 / 画中世界）——整体重绘、多层 + 多组动效 */

function blinkOf(now: number, phase = 0): number {
  return Math.sin(now / 1400 + phase) > 0.92 ? 0.18 : 1;
}

/** 梦貘：食梦的貘形人，鼻管甩动、梦泡上浮 */
export const dreamTapir: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f } = pose;
  const body = 0x5a4a8a, dark = 0x3a2f66, belly = 0xb8a8e8, spot = 0x9f8aff;
  groundShadow(g, pose, 60);
  const topY = feetY - 104, breathe = Math.sin(now / 440) * 2.4;
  for (let k = 0; k < 2; k++) { const ph = ((now / 1300 + k / 2) % 1); g.lineStyle(2.4, 0x9f8aff, (1 - ph) * 0.5); g.strokeEllipse(x, feetY - 2, 24 + ph * 40, 8 + ph * 12); }
  g.fillStyle(dark, 1); g.fillRoundedRect(x - 24, topY + 40 + breathe, 48, 56, 13);
  g.fillStyle(body, 1); g.fillRoundedRect(x - 21, topY + 42 + breathe, 42, 52, 12);
  g.fillStyle(belly, 1); g.fillEllipse(x, topY + 72 + breathe, 24, 36);
  g.fillStyle(spot, 0.5); for (let k = 0; k < 5; k++) g.fillCircle(x - 14 + k * 7, topY + 56 + breathe, 2);
  const armSw = Math.sin(now / 300) * 3;
  g.lineStyle(8, dark, 1); g.lineBetween(x - 18, topY + 56 + breathe, x - 26, topY + 84 - armSw); g.lineBetween(x + 18, topY + 56 + breathe, x + 26, topY + 82 + armSw);
  const hy = topY + 22 + breathe;
  g.fillStyle(dark, 1); g.fillEllipse(x, hy, 32, 28);
  g.fillStyle(body, 1); g.fillEllipse(x, hy - 1, 28, 24);
  g.fillStyle(0xf0e8d8, 1); g.fillEllipse(x + f * 6, hy + 6, 16, 12);
  // 鼻管（甩动）
  const trunk = Math.sin(now / 350) * 5;
  g.lineStyle(6, body, 1); g.beginPath(); g.moveTo(x + f * 8, hy + 4); g.lineTo(x + f * 20, hy + 10); g.lineTo(x + f * 22, hy + 20 + trunk); g.strokePath();
  g.fillStyle(0xf0e8d8, 1);
  for (const s of [-1, 1]) g.fillEllipse(x + s * 14, hy - 12, 7, 12); // 耳
  const eyeH = 3 * blinkOf(now);
  g.fillStyle(0x1a1208, 1); g.fillEllipse(x + f * 4, hy - 4, 3, eyeH); g.fillEllipse(x - f * 6, hy - 4, 3, eyeH);
  g.fillStyle(spot, 0.6); g.fillCircle(x + f * 4, hy - 4, 1.4);
  for (let k = 0; k < 5; k++) { const ph = ((now / 1500 + k / 5) % 1); g.fillStyle(spot, (1 - ph) * 0.4); g.fillCircle(x - 30 + (k * 23 % 60), topY + 10 - ph * 30, 2); }
};

/** 变形虫：伪足伸缩、细胞质颗粒流动 */
export const microAmeba: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const body = 0x5fe8d0, dark = 0x2a7a8a, hi = 0xbafff0, gran = 0x39ffd0;
  groundShadow(g, pose, 56);
  const topY = feetY - 100, breathe = Math.sin(now / 460) * 3;
  // 伪足（脚下与两侧伸缩）
  const blob = (cx: number, cy: number, rr: number) => { g.fillStyle(dark, 1); g.fillCircle(cx, cy, rr + 3); g.fillStyle(body, 0.9); g.fillCircle(cx, cy, rr); };
  g.fillStyle(dark, 1); g.fillEllipse(x, topY + 60 + breathe, 66, 74); g.fillStyle(body, 0.9); g.fillEllipse(x, topY + 60 + breathe, 60, 68);
  for (let k = 0; k < 2; k++) { const ph = ((now / 1600 + k / 2) % 1); g.fillStyle(body, 0.85); g.fillEllipse(x + (k ? 1 : -1) * (30 + ph * 14), topY + 70 + breathe, 20 * (1 - ph * 0.4), 16); }
  blob(x - 20, topY + 40 + breathe, 18); blob(x + 18, topY + 44 + breathe, 16);
  g.fillStyle(hi, 0.5); g.fillEllipse(x - 8, topY + 44 + breathe, 20, 22);
  // 细胞质颗粒流动
  for (let k = 0; k < 6; k++) { const ph = ((now / 1200 + k / 6) % 1); g.fillStyle(gran, 0.7); g.fillCircle(x - 26 + ph * 52, topY + 56 + Math.sin(k * 2) * 10 + breathe, 2.2); }
  // 核
  g.fillStyle(gran, 0.9); g.fillEllipse(x + 4, topY + 52 + breathe, 16, 14); g.fillStyle(0xffffff, 0.5); g.fillCircle(x, topY + 48 + breathe, 4);
  const eyeH = 2.6 * blinkOf(now, 1);
  g.fillStyle(0x0a2a26, 1); g.fillEllipse(x - 6, topY + 40 + breathe, 3, eyeH); g.fillEllipse(x + 8, topY + 40 + breathe, 3, eyeH);
};

/** 炼金大师：坩埚术士，药气升腾、符文环、点金粒 */
export const alchMaster: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const robe = 0x3a5a2a, robeD = 0x243a1e, apron = 0x6a4a24, skin = 0xd8b48a, gold = 0xffd45c, vapor = 0x7dff6a;
  groundShadow(g, pose, 60);
  const topY = feetY - 108, breathe = Math.sin(now / 440) * 2.4, sway = Math.sin(now / 520) * 2;
  // 身后符文环
  g.save(); g.translateCanvas(x, topY + 50); g.rotateCanvas(now / 2200);
  g.lineStyle(2, gold, 0.5); g.strokeCircle(0, 0, 52); for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2; g.fillStyle(gold, 0.6); g.fillCircle(Math.cos(ang) * 52, Math.sin(ang) * 52, 2.2); }
  g.restore();
  // 长袍
  g.fillStyle(robeD, 1); g.beginPath(); g.moveTo(x - 22, topY + 44 + breathe); g.lineTo(x + 22, topY + 44 + breathe); g.lineTo(x + 28 + sway, feetY - 4); g.lineTo(x - 28 + sway, feetY - 4); g.closePath(); g.fillPath();
  g.fillStyle(robe, 1); g.beginPath(); g.moveTo(x - 19, topY + 46 + breathe); g.lineTo(x + 19, topY + 46 + breathe); g.lineTo(x + 24 + sway, feetY - 6); g.lineTo(x - 24 + sway, feetY - 6); g.closePath(); g.fillPath();
  g.fillStyle(apron, 1); g.fillRoundedRect(x - 14, topY + 52 + breathe, 28, 34, 4);
  g.lineStyle(1.4, 0x3a2a14, 0.6); g.lineBetween(x - 14, topY + 62 + breathe, x + 14, topY + 60 + breathe);
  const armSw = Math.sin(now / 300) * 3;
  g.lineStyle(8, robeD, 1); g.lineBetween(x - 18, topY + 54 + breathe, x - 30, topY + 78 - armSw); g.lineBetween(x + 18, topY + 54 + breathe, x + 30, topY + 74 + armSw);
  // 护目镜推在额头
  g.fillStyle(0x8a6a2a, 1); g.fillRoundedRect(x - 13, topY + 18 + breathe, 26, 8, 4); g.fillStyle(0x2a3a2a, 1); g.fillCircle(x - 5, topY + 22 + breathe, 3.4); g.fillCircle(x + 5, topY + 22 + breathe, 3.4); g.fillStyle(vapor, 0.8); g.fillCircle(x - 5, topY + 22 + breathe, 2.2); g.fillCircle(x + 5, topY + 22 + breathe, 2.2);
  const hy = topY + 30 + breathe;
  g.fillStyle(skin, 1); g.fillCircle(x, hy, 12);
  g.fillStyle(0xe8e0d0, 1); g.fillPoints([{ x: x - 8, y: hy + 6 }, { x: x + 8, y: hy + 6 }, { x: x, y: hy + 20 }] as never, true); // 山羊胡
  const eyeH = 3 * blinkOf(now, 2);
  g.fillStyle(0x1a1208, 1); g.fillEllipse(x - 4, hy - 2, 3, eyeH); g.fillEllipse(x + 4, hy - 2, 3, eyeH);
  g.fillStyle(0x243a1e, 1); g.fillPoints([{ x: x - 16, y: hy - 8 }, { x: x + 16, y: hy - 8 }, { x: x + Math.sin(now / 600) * 4, y: hy - 34 }] as never, true);
  // 坩埚 + 药气
  g.fillStyle(0x5a4228, 1); g.fillRoundedRect(x - 20, feetY - 22, 40, 20, 4); g.fillStyle(0x8a6a2a, 1); g.fillRoundedRect(x - 18, feetY - 20, 36, 16, 4);
  g.fillStyle(vapor, 0.7); g.fillEllipse(x, feetY - 20, 32, 6);
  for (let k = 0; k < 4; k++) { const ph = ((now / 900 + k / 4) % 1); g.fillStyle(vapor, (1 - ph) * 0.7); g.fillCircle(x - 12 + k * 8, feetY - 22 - ph * 30, 2.4 + ph * 2); }
  for (let k = 0; k < 3; k++) { const ph = ((now / 1200 + k / 3) % 1); g.fillStyle(gold, (1 - ph) * 0.8); g.fillCircle(x - 24 + k * 22, topY + 60 - ph * 40, 1.8); }
};

/** 毛线人：针织身躯，线头飘、飞絮 */
export const yarnGolem: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, move } = pose;
  const yarn = 0xffb7d5, yarnD = 0xa86a8a, yarnHi = 0xffd8e8, button = 0xffe040;
  groundShadow(g, pose, 58);
  const topY = feetY - 104, breathe = Math.sin(now / 440) * 2.4, sway = Math.sin(now / 520) * 2 + (move ?? 0) * 2;
  g.fillStyle(yarnD, 1); g.fillRoundedRect(x - 24, topY + 40 + breathe, 48, 56, 14);
  g.fillStyle(yarn, 1); g.fillRoundedRect(x - 21, topY + 42 + breathe, 42, 52, 13);
  // 针织纹
  for (let r = 0; r < 6; r++) { g.lineStyle(1.4, yarnHi, 0.8); g.lineBetween(x - 19, topY + 48 + r * 8 + breathe, x + 19, topY + 46 + r * 8 + breathe); }
  for (let cc = 0; cc < 5; cc++) { g.lineStyle(1.4, yarnD, 0.6); g.lineBetween(x - 15 + cc * 8, topY + 44 + breathe, x - 15 + cc * 8, topY + 90 + breathe); }
  // 纽扣
  g.fillStyle(button, 1); g.fillCircle(x, topY + 58 + breathe, 3.4); g.fillCircle(x, topY + 72 + breathe, 3.4); g.fillStyle(yarnD, 1); g.fillCircle(x - 1, topY + 58 + breathe, 0.8); g.fillCircle(x + 1, topY + 58 + breathe, 0.8); g.fillCircle(x - 1, topY + 72 + breathe, 0.8); g.fillCircle(x + 1, topY + 72 + breathe, 0.8);
  const armSw = Math.sin(now / 300) * 3;
  g.lineStyle(9, yarnD, 1); g.lineBetween(x - 18, topY + 54 + breathe, x - 28, topY + 82 - armSw); g.lineBetween(x + 18, topY + 54 + breathe, x + 28, topY + 80 + armSw);
  const hy = topY + 24 + breathe;
  g.fillStyle(yarn, 1); g.fillCircle(x, hy, 14);
  for (let k = 0; k < 5; k++) { g.lineStyle(1.4, yarnHi, 0.7); g.lineBetween(x - 12 + k * 6, hy - 12, x - 12 + k * 6, hy + 12); }
  const eyeH = 3 * blinkOf(now, 3);
  g.fillStyle(0x3a2230, 1); g.fillEllipse(x - 4, hy - 2, 2.8, eyeH); g.fillEllipse(x + 4, hy - 2, 2.8, eyeH);
  g.fillStyle(yarnD, 1); g.lineStyle(2, yarnD, 1); g.beginPath(); g.moveTo(x - 4, hy + 6); g.lineTo(x, hy + 9); g.lineTo(x + 4, hy + 6); g.strokePath();
  // 线头 + 飞絮
  g.lineStyle(2, yarn, 1); g.beginPath(); g.moveTo(x + 22, topY + 80); g.lineTo(x + 32 + sway, topY + 96); g.strokePath();
  for (let k = 0; k < 5; k++) { const ph = ((now / 1500 + k / 5) % 1); g.fillStyle(yarnHi, (1 - ph) * 0.8); g.fillCircle(x - 30 + (k * 23 % 60), topY + 20 - ph * 40, 1.6); }
};

/** 画中缪斯：走出画布的缪斯，颜料裙摆飘、笔触环绕 */
export const paintMuse: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, move } = pose;
  const robe = 0xff8ad4, robeD = 0xc05a9a, skin = 0xf0d8c0, gold = 0xffd45c, canvas = 0xf0ead8;
  groundShadow(g, pose, 58);
  const topY = feetY - 108, breathe = Math.sin(now / 440) * 2.4, sway = Math.sin(now / 500) * 3 + (move ?? 0) * 2;
  // 画布底纹
  g.fillStyle(canvas, 0.2); g.fillRect(x - 34, topY + 24, 68, 82);
  g.lineStyle(2, 0x8a6a3a, 0.5); g.strokeRect(x - 34, topY + 24, 68, 82);
  // 颜料裙摆（笔触）
  const cols = [0xff4a4a, 0xffd45c, 0x7dff9a, 0x5ac8ff, 0xff8ad4];
  for (let k = 0; k < 6; k++) { const ph = k / 6; g.fillStyle(cols[k % 5], 0.9); g.beginPath(); g.moveTo(x - 20 + ph * 40, topY + 50 + breathe); g.lineTo(x - 26 + ph * 40 + sway, feetY - 4); g.lineTo(x - 14 + ph * 40 + sway, feetY - 4); g.closePath(); g.fillPath(); }
  g.fillStyle(robeD, 1); g.beginPath(); g.moveTo(x - 18, topY + 44 + breathe); g.lineTo(x + 18, topY + 44 + breathe); g.lineTo(x + 18 + sway, feetY - 10); g.lineTo(x - 18 + sway, feetY - 10); g.closePath(); g.fillPath();
  const armSw = Math.sin(now / 300) * 3;
  g.lineStyle(7, skin, 1); g.lineBetween(x - 16, topY + 54 + breathe, x - 28, topY + 82 - armSw); g.lineBetween(x + 16, topY + 54 + breathe, x + 28, topY + 78 + armSw);
  g.fillStyle(robe, 1); g.fillEllipse(x, topY + 48 + breathe, 30, 12);
  const hy = topY + 26 + breathe;
  g.fillStyle(skin, 1); g.fillCircle(x, hy, 12);
  g.fillStyle(robeD, 1); g.fillEllipse(x, hy - 8, 26, 14); g.fillStyle(robe, 1); g.fillEllipse(x, hy - 10, 22, 10);
  const eyeH = 3 * blinkOf(now, 4);
  g.fillStyle(0x1a1208, 1); g.fillEllipse(x - 4, hy - 1, 2.8, eyeH); g.fillEllipse(x + 4, hy - 1, 2.8, eyeH);
  g.fillStyle(0xd85a9a, 1); g.fillEllipse(x, hy + 5, 4, 2);
  // 环绕笔触 + 飘金
  for (let k = 0; k < 5; k++) { const ang = (k / 5) * Math.PI * 2 + now / 1400; g.save(); g.translateCanvas(x + Math.cos(ang) * 44, topY + 50 + Math.sin(ang) * 34); g.rotateCanvas(ang); g.fillStyle(cols[k % 5], 0.8); g.fillEllipse(0, 0, 14, 5); g.restore(); }
  for (let k = 0; k < 6; k++) { const ph = ((now / 1600 + k / 6) % 1); g.fillStyle(gold, (1 - ph) * 0.9); g.fillCircle(x - 30 + (k * 19 % 60), topY + 10 - ph * 40, 1.6); }
};
