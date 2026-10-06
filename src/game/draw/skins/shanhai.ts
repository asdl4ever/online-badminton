import { groundShadow, type SkinPainter } from './shared';
import { PLAYER_H } from '../../constants';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/**
 * 🗺️ 山海十怪重绘批（全部 5★，最难的一批先来）。
 * 每只都按神话意象放大：多层躯体、发光部件、丰富的 now 驱动动画。
 * 坐标：x = 角色中线，feetY = 脚底，facing = 朝向；身高 PLAYER_H。
 */

/** 烛龙：人面蛇身，盘绕赤红；睁眼为昼 / 闭眼为夜，背上火鬃随呼吸跳动 */
export const zhuLong: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const red = 0xd42a2a, dark = 0x7a0f1c, scale = 0xf06a4a;
  groundShadow(g, pose, 56);
  // 蛇身：双层盘绕（后层暗前层亮），鳞片高光
  for (let k = 9; k >= 0; k--) {
    const t = k / 9;
    const bx = x + Math.sin(now / 620 + k * 0.5) * (10 + t * 16) - f * t * 20;
    const by = feetY - 6 - t * (PLAYER_H - 24);
    const r = 16 - t * 9;
    g.fillStyle(dark, 1);
    g.fillCircle(bx + 1.6, by + 1.6, r);
    g.fillStyle(k % 2 ? red : dark, 1);
    g.fillCircle(bx, by, r);
    if (k % 2 === 0) {
      g.fillStyle(scale, 0.55);
      g.fillCircle(bx - r * 0.3, by - r * 0.3, r * 0.42);
    }
    g.fillStyle(0xffd0a0, 0.25);
    g.fillCircle(bx - r * 0.4, by - r * 0.45, r * 0.2);
  }
  // 背上火鬃：两层焰舌 + 崩出的火星
  for (let k = 0; k < 6; k++) {
    const by = feetY - 20 - k * 13;
    const fl = 8 + 6 * Math.sin(now / 85 + k * 1.4);
    g.fillStyle(0xff8a3c, 0.9);
    g.fillTriangle(x + 8, by, x + 17, by, x + 12 - f * 6 + Math.sin(now / 120 + k) * 2, by - fl);
    g.fillStyle(0xffe89a, 0.9);
    g.fillTriangle(x + 10, by, x + 15, by, x + 12 - f * 3, by - fl * 0.55);
  }
  for (let k = 0; k < 3; k++) {
    const ph = (now / 500 + k / 3) % 1;
    g.fillStyle(0xffd45c, 0.8 * (1 - ph));
    g.fillCircle(x + 10 + Math.sin(ph * 5 + k) * 6, feetY - 40 - k * 16 - ph * 18, 1.8 * (1 - ph) + 0.4);
  }
  // 昼夜呼吸：睁眼泛白昼光幕，闭眼夜色下沉
  const cyc = now % 3400;
  const open = cyc < 1600 ? Math.min(1, cyc / 260) : cyc < 2600 ? 1 - Math.min(1, (cyc - 1600) / 260) : 0;
  if (open > 0.02) {
    g.fillStyle(0xfff0b0, 0.08 + 0.2 * open);
    g.fillCircle(x, topY + 14, 50 + 16 * open);
    g.lineStyle(2, 0xfff6d8, 0.3 * open);
    g.strokeCircle(x, topY + 14, 36 + 20 * open);
  } else {
    g.fillStyle(0x0a0a1e, 0.16);
    g.fillCircle(x, topY + 20, 40);
  }
  // 人面：金冠脸 + 睁闭双眼
  const hy = topY + 14;
  g.fillStyle(0xe8b48a, 1);
  g.fillCircle(x, hy, 15);
  g.fillStyle(dark, 1);
  g.fillRect(x - 15, hy - 18, 30, 7);
  g.fillTriangle(x - 15, hy - 15, x - 6, hy - 16, x - 14, hy - 32);
  g.fillTriangle(x + 15, hy - 15, x + 6, hy - 16, x + 14, hy - 32);
  g.fillStyle(0xfff6e0, 1);
  g.fillEllipse(x - 6, hy - 1, 9, 11 * (0.12 + 0.88 * open));
  g.fillEllipse(x + 6, hy - 1, 9, 11 * (0.12 + 0.88 * open));
  if (open > 0.45) {
    g.fillStyle(0xffc24a, 1);
    g.fillCircle(x - 6, hy - 1, 3.6);
    g.fillCircle(x + 6, hy - 1, 3.6);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(x - 6.8, hy - 1.8, 1.1); g.fillCircle(x + 5.2, hy - 1.8, 1.1);
  } else {
    g.fillStyle(dark, 1);
    g.fillRect(x - 11, hy - 1, 9, 2.6);
    g.fillRect(x + 2, hy - 1, 9, 2.6);
  }
};

/** 相柳：蛇身九首扇形排开，各自相位摆动，嘴里滴毒成沼 */
export const xiangLiu: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const body = 0x3a6a4a, dark = 0x27492f, skin = 0xa8d8b0, ink = 0x14301e;
  groundShadow(g, pose, 60);
  for (let k = 6; k >= 0; k--) {
    const t = k / 6;
    const bx = x + Math.sin(now / 700 + k * 0.6) * (14 * (1 - t)) - f * t * 6;
    const by = feetY - 4 - t * 26;
    g.fillStyle(dark, 1);
    g.fillCircle(bx + 1.4, by + 1.4, 15 - t * 5);
    g.fillStyle(k % 2 ? body : dark, 1);
    g.fillCircle(bx, by, 14 - t * 5);
    g.fillStyle(0x5a8a6a, 0.4);
    g.fillEllipse(bx, by + (14 - t * 5) * 0.5, (14 - t * 5) * 1.2, 3);
  }
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.3 + Math.sin(now / 640 + i * 0.8) * 0.04;
    const len = 48 + Math.sin(now / 640 + i * 0.8) * 6;
    const hx = x + Math.cos(a) * len * 0.9 - f * 4;
    const hy = topY + 24 + Math.sin(a) * 34;
    g.lineStyle(Math.max(2.5, 7 - Math.abs(i - 4) * 0.5), i % 2 ? body : dark, 1);
    g.lineBetween(x, feetY - 24, hx, hy);
    g.fillStyle(skin, 1);
    g.fillCircle(hx, hy, 8);
    g.fillStyle(0x8ac8a0, 0.6);
    g.fillCircle(hx - 2, hy - 2, 3);
    g.fillStyle(ink, 1);
    const blink = Math.sin(now / 700 + i * 1.3) > 0.92;
    if (blink) {
      g.fillRect(hx - 4.4, hy - 2, 3.6, 1); g.fillRect(hx + 0.8, hy - 2, 3.6, 1);
    } else {
      g.fillCircle(hx - 2.6, hy - 1.8, 1.7); g.fillCircle(hx + 2.6, hy - 1.8, 1.7);
    }
    if (i % 2 === 0) {
      const drop = (now / 600 + i / 3) % 1;
      g.fillStyle(0x9cff3a, 0.85 * (1 - drop));
      g.fillCircle(hx + Math.sin(i) * 2, hy + 8 + drop * 14, 1.8 * (1 - drop) + 0.4);
    }
  }
  for (let k = 0; k < 5; k++) {
    const ph = (now / 900 + k / 5) % 1;
    g.fillStyle(0x9cff3a, 0.35 * (1 - ph));
    g.fillCircle(x - 30 + k * 15 + Math.sin(ph * 4 + k) * 4, feetY - 2 - ph * 8, 3 * (1 - ph) + 1);
  }
};

/** 穷奇：虎身 + 会立起的猬毛 + 扇动双翼 + 獠牙，电光绕身 */
export const qiongQi: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const fur = 0xd8a84a, dark = 0x8a6a2a, cream = 0xf0e0c0;
  groundShadow(g, pose, 58);
  for (const s of [-1, 1]) {
    const flap = Math.sin(now / 300) * 0.25;
    g.save();
    g.translateCanvas(x + s * 20, topY + 34);
    g.rotateCanvas(s * (0.5 + flap));
    g.fillStyle(0x6a5230, 0.9);
    g.fillEllipse(s * 34, -6, 64, 20);
    g.fillStyle(fur, 0.85);
    g.fillEllipse(s * 30, -2, 54, 14);
    g.lineStyle(1.4, dark, 0.7);
    g.lineBetween(s * 6, 0, s * 58, -10);
    g.restore();
  }
  const bob = Math.abs(Math.sin(now / 300)) * (pose.move ?? 0) * 3;
  g.fillStyle(fur, 1);
  g.fillEllipse(x, topY + 58 - bob, 40, 34);
  for (const s of [-1, 1]) {
    const step = Math.sin(now / 200 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 4;
    g.fillStyle(dark, 1);
    g.fillRect(x + s * 12 - 4, topY + 72 - bob + Math.max(0, step), 8, feetY - topY - 72 + bob - Math.max(0, step) + 4);
    g.fillStyle(cream, 1);
    g.fillRect(x + s * 12 - 4, feetY - 6 + Math.max(0, step), 8, 4);
  }
  g.fillStyle(dark, 0.8);
  for (let k = 0; k < 4; k++) g.fillRect(x - 16 + k * 9, topY + 46 - bob, 3.4, 22 - (k % 2) * 6);
  for (let k = 0; k < 7; k++) {
    const px = x - 20 + k * 6.6;
    const up = 6 + 5 * Math.max(0, Math.sin(now / 450 + k * 1.2));
    g.fillStyle(0x4a3820, 0.95);
    g.fillTriangle(px - 2.4, topY + 42 - bob, px + 2.4, topY + 42 - bob, px, topY + 42 - bob - up);
  }
  const hx = x + f * 14, hy2 = topY + 34 - bob;
  g.fillStyle(fur, 1);
  g.fillCircle(hx, hy2, 14);
  g.fillStyle(cream, 1);
  g.fillEllipse(hx + f * 4, hy2 + 6, 16, 9);
  g.fillStyle(0xffffff, 1);
  g.fillTriangle(hx + f * 2, hy2 + 7, hx + f * 6, hy2 + 7, hx + f * 4, hy2 + 15);
  g.fillStyle(0x1a1a22, 1);
  g.fillCircle(hx + f * 5, hy2 - 3, 2.6);
  g.fillStyle(0xffd45c, 0.9);
  g.fillCircle(hx + f * 5.6, hy2 - 3.6, 1);
  g.lineStyle(1.2, dark, 0.8);
  for (let k = -1; k <= 1; k++) g.lineBetween(hx + f * 10, hy2 + 3 + k * 3, hx + f * 18, hy2 + 1 + k * 5);
  for (let k = 0; k < 2; k++) {
    const a0 = now / 120 + k * 2.4;
    let px = x + Math.cos(a0) * 34, py = topY + 40 + Math.sin(a0) * 34;
    for (let s2 = 1; s2 <= 3; s2++) {
      const ang = a0 + s2 * 1.1 + Math.sin(now / 60 + s2 + k) * 0.4;
      const nx = x + Math.cos(ang) * (38 + s2 * 8), ny = topY + 40 + Math.sin(ang) * (34 + s2 * 8);
      g.lineStyle(1.6, s2 > 2 ? 0xffffff : 0x9fd8ff, 0.7);
      g.lineBetween(px, py, nx, ny);
      px = nx; py = ny;
    }
  }
};

/** 饕餮：羊身人面，巨口咀嚼开合，腋下发光眼，人爪按地 */
export const taoTie: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const wool = 0xc9b890, dark = 0x8a7a56, horn = 0x6a5232;
  groundShadow(g, pose, 58);
  const chew = Math.abs(Math.sin(now / 260));
  for (let k = 0; k < 6; k++) {
    const px = x - 18 + k * 7.4, py = topY + 56 + Math.sin(k * 2.1) * 4;
    g.fillStyle(k % 2 ? wool : dark, 1);
    g.fillCircle(px, py, 12 - (k % 2) * 2);
  }
  g.fillStyle(0xb8a878, 0.6);
  g.fillEllipse(x, topY + 62, 44, 18);
  for (const s of [-1, 1]) {
    const step = Math.sin(now / 240 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 4;
    g.fillStyle(dark, 1);
    g.fillRect(x + s * 13 - 3.4, topY + 70 + Math.max(0, -step), 6.8, feetY - topY - 70 + Math.max(0, step));
    g.fillStyle(0xe8d8b8, 1);
    g.fillRect(x + s * 13 - 4.4, feetY - 5, 8.8, 5);
  }
  for (const s of [-1, 1]) {
    const gl = 0.5 + 0.5 * Math.sin(now / 260 + s);
    g.fillStyle(0xffd45c, gl * 0.3);
    g.fillCircle(x + s * 20, topY + 44, 7);
    g.fillStyle(0xffe89a, gl);
    g.fillCircle(x + s * 20, topY + 44, 3.4);
    g.fillStyle(0x1a0a00, 0.9);
    g.fillCircle(x + s * 20, topY + 44, 1.4);
  }
  const hy2 = topY + 22, mh = 4 + chew * 5;
  g.fillStyle(0xe8c8a0, 1);
  g.fillCircle(x + f * 6, hy2, 15);
  g.fillStyle(horn, 1);
  for (const s of [-1, 1]) {
    g.fillPoints([
      { x: x + f * 6 + s * 12, y: hy2 - 8 }, { x: x + f * 6 + s * 20, y: hy2 - 22 }, { x: x + f * 6 + s * 13, y: hy2 - 12 },
    ] as never, true);
  }
  g.fillStyle(0x1a0a08, 1);
  g.fillEllipse(x + f * 6, hy2 + 8, 24, mh * 2);
  g.fillStyle(0xffffff, 1);
  for (let k = -3; k <= 3; k++) {
    g.fillTriangle(x + f * 6 + k * 3.4 - 1.6, hy2 + 8 - mh, x + f * 6 + k * 3.4 + 1.6, hy2 + 8 - mh, x + f * 6 + k * 3.4, hy2 + 8 - mh + 3.4);
    g.fillTriangle(x + f * 6 + k * 3.4 - 1.6, hy2 + 8 + mh, x + f * 6 + k * 3.4 + 1.6, hy2 + 8 + mh, x + f * 6 + k * 3.4, hy2 + 8 + mh - 3.4);
  }
  g.fillStyle(0x1a1a22, 1);
  g.fillEllipse(x + f * 1, hy2 - 4, 5, 4);
  g.fillEllipse(x + f * 11, hy2 - 4, 5, 4);
  g.fillStyle(0xff5a2a, 0.9);
  g.fillCircle(x + f * 1, hy2 - 4, 1.4); g.fillCircle(x + f * 11, hy2 - 4, 1.4);
  if (chew > 0.7) {
    g.fillStyle(0xe8d8b8, 0.8);
    g.fillCircle(x + f * 8 + Math.sin(now / 100) * 4, hy2 + 12 + Math.sin(now / 90) * 3, 1.4);
  }
};

/** 梼杌：人面猪口獠牙，一丈八尺长尾沿长弧甩动，犬毛领 */
export const taoWu: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const hide = 0x8a6a4a, dark = 0x5a4028, bristle = 0x3a2a1a;
  groundShadow(g, pose, 56);
  const wag = Math.sin(now / 420);
  const tail: Array<[number, number]> = [];
  for (let s = 0; s <= 10; s++) {
    const u = s / 10;
    tail.push([
      x - f * (16 + u * 84),
      topY + 40 - Math.sin(u * Math.PI) * (26 + wag * 10 * u) + u * 18,
    ]);
  }
  for (let s = 1; s < tail.length; s++) {
    const [x0, y0] = tail[s - 1];
    const [x1, y1] = tail[s];
    g.lineStyle(8 - s * 0.5, s % 2 ? hide : dark, 1);
    g.lineBetween(x0, y0, x1, y1);
  }
  const [tx, ty] = tail[tail.length - 1];
  for (let k = 0; k < 5; k++) {
    const ang = -0.8 + k * 0.4 + wag * 0.3;
    g.fillStyle(bristle, 0.95);
    g.fillTriangle(tx - 3, ty, tx + 3, ty, tx + Math.cos(ang) * 10, ty + Math.sin(ang) * 10 - 4);
  }
  g.fillStyle(hide, 1);
  g.fillEllipse(x, topY + 54, 42, 36);
  g.fillStyle(bristle, 0.9);
  for (let k = 0; k < 9; k++) {
    const ang = Math.PI * 0.9 + (k / 9) * Math.PI * 1.2;
    g.fillTriangle(
      x + Math.cos(ang) * 20, topY + 50 + Math.sin(ang) * 16,
      x + Math.cos(ang + 0.2) * 20, topY + 50 + Math.sin(ang + 0.2) * 16,
      x + Math.cos(ang + 0.1) * 27, topY + 50 + Math.sin(ang + 0.1) * 21,
    );
  }
  for (const s of [-1, 1]) {
    const step = Math.sin(now / 220 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 4;
    g.fillStyle(dark, 1);
    g.fillRect(x + s * 12 - 4, topY + 72 + Math.max(0, -step), 8, feetY - topY - 72 + Math.max(0, step));
    g.fillStyle(0x4a3828, 1);
    g.fillEllipse(x + s * 12, feetY - 2 + Math.max(0, -step), 10, 4);
  }
  const hy2 = topY + 20, snort = Math.abs(Math.sin(now / 500));
  g.fillStyle(0xd8b090, 1);
  g.fillCircle(x + f * 8, hy2, 14);
  g.fillStyle(0xe8a0a0, 0.9);
  g.fillEllipse(x + f * 16, hy2 + 5, 9, 7);
  g.fillStyle(0x5a2a20, 1);
  g.fillCircle(x + f * 14.4, hy2 + 5, 1.1); g.fillCircle(x + f * 17.6, hy2 + 5, 1.1);
  g.fillStyle(0xffffff, 1);
  g.fillTriangle(x + f * 10, hy2 + 10, x + f * 15, hy2 + 10, x + f * 12, hy2 + 17);
  g.fillTriangle(x + f * 4, hy2 + 11, x + f * 8, hy2 + 11, x + f * 6, hy2 + 17);
  g.fillStyle(0x1a1a22, 1);
  g.fillEllipse(x + f * 4, hy2 - 4, 4.4, 3.6);
  g.fillEllipse(x + f * 12, hy2 - 4, 4.4, 3.6);
  g.fillStyle(0xff3a3a, 0.7 + 0.3 * snort);
  g.fillCircle(x + f * 4, hy2 - 4, 1.2); g.fillCircle(x + f * 12, hy2 - 4, 1.2);
  for (let k = 0; k < 2; k++) {
    const ph = (now / 900 + k / 2) % 1;
    g.fillStyle(0xd8c8b0, 0.2 * (1 - ph) * snort);
    g.fillCircle(x + f * (20 + ph * 16), hy2 + 4 - ph * 6, 3 + ph * 5);
  }
};

/** 混沌：无面目的黄囊，四翼各自相位扇动，六足碎步，赤如丹火的光 */
export const hunDun: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const sack = 0xe0c060, dark = 0xa8883a, glow = 0xff5a2a;
  groundShadow(g, pose, 54);
  const wob = Math.sin(now / 350);
  g.fillStyle(glow, 0.12 + 0.08 * Math.sin(now / 300));
  g.fillCircle(x, topY + 40, 44);
  g.fillStyle(dark, 1);
  g.fillEllipse(x + 2, topY + 42 + wob, 42, 46 - wob * 3);
  g.fillStyle(sack, 1);
  g.fillEllipse(x, topY + 40 + wob, 40, 44 - wob * 3);
  g.fillStyle(0xf0dc90, 0.6);
  g.fillEllipse(x - 8, topY + 30 + wob, 16, 20);
  g.lineStyle(1.4, dark, 0.5);
  for (let k = -1; k <= 1; k++) {
    g.beginPath();
    g.arc(x + k * 10, topY + 40 + wob, 10, -0.6, 0.6);
    g.strokePath();
  }
  for (let k = 0; k < 4; k++) {
    const s = k < 2 ? -1 : 1;
    const row = k % 2;
    const ph = Math.sin(now / 240 + k * 1.7);
    g.save();
    g.translateCanvas(x + s * 18, topY + 30 + row * 14 + wob);
    g.rotateCanvas(s * (0.5 + ph * 0.5) + (row ? 0.35 : 0));
    g.fillStyle(row ? dark : sack, 0.9);
    g.fillEllipse(s * 26, 0, 46, 12);
    g.lineStyle(1.2, dark, 0.6);
    g.lineBetween(0, 0, s * 48, -2);
    g.restore();
  }
  for (let k = 0; k < 6; k++) {
    const s = k % 2 === 0 ? -1 : 1;
    const step = Math.sin(now / 160 + k * 1.05) * (pose.move ?? 0.25) * 4;
    g.lineStyle(2.6, dark, 1);
    g.lineBetween(x + s * 12, topY + 62 + wob, x + s * (16 + (k > 3 ? 6 : 0)) + step, feetY - 2);
    g.fillStyle(dark, 1);
    g.fillCircle(x + s * (16 + (k > 3 ? 6 : 0)) + step, feetY - 2, 2);
  }
  const pulse = 0.5 + 0.5 * Math.sin(now / 260);
  g.fillStyle(glow, 0.35 + pulse * 0.25);
  g.fillCircle(x, topY + 38 + wob, 9 + pulse * 3);
  g.fillStyle(0xffd45c, pulse * 0.8);
  g.fillCircle(x, topY + 38 + wob, 4);
};

/** 九尾狐：九尾扇形展开逐尾摆动，白尾尖，狐火环绕 */
export const jiuweiHu: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const fur = 0xf0ece4, shade = 0xd8d0c0, tip = 0xffffff;
  groundShadow(g, pose, 50);
  for (let k = 0; k < 9; k++) {
    const base = Math.PI * 0.75 + (k / 8) * Math.PI * 0.5;
    const sway = Math.sin(now / 380 + k * 0.55) * 0.12;
    const ang = f > 0 ? Math.PI - (base + sway) : base + sway;
    const len = 52 + (k % 3) * 8;
    const mx = x + Math.cos(ang) * len * 0.55;
    const my = topY + 30 + Math.sin(ang) * len * 0.55;
    const ex = x + Math.cos(ang) * len;
    const ey = topY + 30 + Math.sin(ang) * len;
    g.lineStyle(9 - Math.abs(k - 4), k % 2 ? fur : shade, 1);
    g.lineBetween(x, topY + 30, mx, my);
    g.lineStyle(5, tip, 0.95);
    g.lineBetween(mx, my, ex, ey);
    g.fillStyle(tip, 0.9);
    g.fillCircle(ex, ey, 3.4);
  }
  const bob = Math.abs(Math.sin(now / 260)) * (pose.move ?? 0) * 2.4;
  g.fillStyle(fur, 1);
  g.fillEllipse(x, topY + 50 - bob, 34, 26);
  g.fillStyle(shade, 0.6);
  g.fillEllipse(x - f * 6, topY + 56 - bob, 22, 12);
  for (const s of [-1, 1]) {
    const step = Math.sin(now / 220 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
    g.lineStyle(3.4, fur, 1);
    g.lineBetween(x + s * 9, topY + 60 - bob, x + s * 10 + step, feetY - 2);
    g.fillStyle(shade, 1);
    g.fillCircle(x + s * 10 + step, feetY - 2, 2.2);
  }
  const hx = x + f * 12, hy2 = topY + 22 - bob;
  g.fillStyle(fur, 1);
  g.fillCircle(hx, hy2, 11);
  for (const s of [-1, 1]) {
    g.fillStyle(fur, 1);
    g.fillTriangle(hx + s * 8, hy2 - 6, hx + s * 12, hy2 - 18, hx + s * 3, hy2 - 10);
    g.fillStyle(0x3a2a3a, 0.8);
    g.fillTriangle(hx + s * 8.4, hy2 - 8, hx + s * 10.6, hy2 - 15, hx + s * 5.4, hy2 - 9.6);
  }
  g.fillStyle(0xffe89a, 1);
  g.fillCircle(hx + f * 4, hy2 - 1, 2.6);
  g.fillStyle(0x1a0a14, 1);
  g.fillEllipse(hx + f * 4.4, hy2 - 1, 1, 2.4);
  g.fillStyle(fur, 1);
  g.fillTriangle(hx + f * 8, hy2 + 2, hx + f * 15, hy2 + 4, hx + f * 8, hy2 + 6);
  g.fillStyle(0x1a0a14, 0.9);
  g.fillCircle(hx + f * 14.4, hy2 + 4, 0.9);
  for (let k = 0; k < 4; k++) {
    const a = now / 800 + (k / 4) * Math.PI * 2;
    const gl = 0.5 + 0.5 * Math.sin(now / 240 + k * 1.9);
    const px = x + Math.cos(a) * 30, py = topY + 20 + Math.sin(a) * 22;
    g.fillStyle(0x9fe8ff, gl * 0.3);
    g.fillCircle(px, py, 5);
    g.fillStyle(0xffffff, gl);
    g.fillCircle(px, py, 1.8);
  }
};

/** 巴蛇：青赤黑巨蛇，肚里吞象呼吸鼓动，分叉信子吞吐 */
export const baShe: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const green = 0x2f6a4a, red = 0xa83232, ink = 0x142018;
  groundShadow(g, pose, 60);
  for (let k = 9; k >= 0; k--) {
    const t = k / 9;
    const bx = x + Math.sin(now / 700 + k * 0.55) * (12 + t * 8) - f * t * 14;
    const by = feetY - 6 - t * (PLAYER_H - 30);
    const r = 16 - t * 8;
    g.fillStyle(ink, 1);
    g.fillCircle(bx + 1.4, by + 1.4, r);
    const band = k % 3;
    g.fillStyle(band === 0 ? green : band === 1 ? red : ink, 1);
    g.fillCircle(bx, by, r);
    if (band === 0) {
      g.fillStyle(0x5a9a7a, 0.5);
      g.fillCircle(bx - r * 0.3, by - r * 0.3, r * 0.4);
    }
  }
  const bellyX = x - f * 8, bellyY = feetY - 34;
  const br = 5 + Math.sin(now / 500) * 2.4;
  g.fillStyle(0xd8c8a0, 0.95);
  g.fillEllipse(bellyX, bellyY, 22 + br, 18 + br * 0.8);
  g.lineStyle(1.2, ink, 0.5);
  g.strokeEllipse(bellyX, bellyY, 14 + br, 11 + br * 0.6);
  g.fillStyle(ink, 0.7);
  g.fillCircle(bellyX + f * 4, bellyY - 2, 1.6);
  const hx = x + f * 14, hy2 = topY + 20;
  const flick = Math.sin(now / 300);
  g.fillStyle(green, 1);
  g.fillEllipse(hx, hy2, 22, 15);
  g.fillStyle(0x8ac8a0, 0.6);
  g.fillEllipse(hx - f * 2, hy2 - 4, 12, 6);
  g.fillStyle(0xffe89a, 1);
  g.fillCircle(hx + f * 5, hy2 - 4, 2.6);
  g.fillStyle(0x1a1a14, 1);
  g.fillEllipse(hx + f * 5.6, hy2 - 4, 1, 2.6);
  if (flick > 0) {
    g.lineStyle(1.6, 0xff5a5a, 0.9);
    const tl = flick * 10;
    g.lineBetween(hx + f * 10, hy2 + 4, hx + f * (10 + tl), hy2 + 4 + flick * 2);
    g.lineBetween(hx + f * (10 + tl), hy2 + 4 + flick * 2, hx + f * (10 + tl + 4), hy2 + 2);
    g.lineBetween(hx + f * (10 + tl), hy2 + 4 + flick * 2, hx + f * (10 + tl + 4), hy2 + 6);
  }
  g.fillStyle(0xffffff, 0.9);
  g.fillTriangle(hx + f * 6, hy2 + 6, hx + f * 9, hy2 + 6, hx + f * 7.4, hy2 + 11);
  g.fillStyle(0x0a1410, 0.2);
  g.fillEllipse(x, feetY + 1, 54, 8);
};

/** 蛊雕：有角的雕，慢扇双翼 + 冠羽摆动 + 钩喙利爪 */
export const guDiao: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const feather = 0x8a7a5a, dark = 0x5a4a32, cream = 0xe8dcc0, gold = 0xd9b45c;
  groundShadow(g, pose, 46);
  const flap = Math.sin(now / 500) * 0.3;
  for (const s of [-1, 1]) {
    g.save();
    g.translateCanvas(x + s * 14, topY + 36);
    g.rotateCanvas(s * (0.35 + flap));
    g.fillStyle(dark, 0.95);
    g.fillEllipse(s * 34, -4, 70, 22);
    g.fillStyle(feather, 0.95);
    g.fillEllipse(s * 30, -2, 60, 16);
    for (let k = 0; k < 4; k++) {
      g.lineStyle(1.6, dark, 0.7);
      g.lineBetween(s * 8, 0, s * (52 - k * 2), -10 + k * 6);
    }
    g.restore();
  }
  g.fillStyle(feather, 1);
  g.fillEllipse(x, topY + 50, 30, 30);
  g.fillStyle(cream, 0.8);
  g.fillEllipse(x - f * 2, topY + 58, 20, 14);
  g.fillStyle(dark, 0.95);
  g.fillEllipse(x - f * 20, topY + 54, 22, 8);
  for (const s of [-1, 1]) {
    g.lineStyle(2.6, gold, 1);
    g.lineBetween(x + s * 8, topY + 64, x + s * 9, feetY - 4);
    g.fillStyle(gold, 1);
    g.fillCircle(x + s * 9, feetY - 4, 2.4);
    g.fillTriangle(x + s * 9 - 2.4, feetY - 4, x + s * 9 + 2.4, feetY - 4, x + s * 9 + s * 1, feetY + 1);
  }
  const hx = x + f * 10, hy2 = topY + 24;
  g.fillStyle(feather, 1);
  g.fillCircle(hx, hy2, 11);
  g.fillStyle(cream, 1);
  g.fillEllipse(hx - f * 2, hy2 + 3, 12, 8);
  g.fillStyle(gold, 1);
  for (const s of [-1, 1]) {
    g.fillPoints([
      { x: hx + s * 7, y: hy2 - 7 }, { x: hx + s * 13, y: hy2 - 18 }, { x: hx + s * 8, y: hy2 - 10 },
    ] as never, true);
  }
  for (let k = 0; k < 3; k++) {
    g.fillStyle(k % 2 ? cream : feather, 0.95);
    g.fillEllipse(hx - f * 6 + k * f * 2, hy2 - 12 - k * 3 + Math.sin(now / 240 + k) * 2, 3, 9);
  }
  g.fillStyle(gold, 1);
  g.fillPoints([
    { x: hx + f * 8, y: hy2 - 2 }, { x: hx + f * 17, y: hy2 + 2 }, { x: hx + f * 15, y: hy2 + 6 }, { x: hx + f * 8, y: hy2 + 4 },
  ] as never, true);
  g.fillStyle(0x1a1a22, 1);
  g.fillCircle(hx + f * 5, hy2 - 2, 2.2);
  g.fillStyle(0xffffff, 0.8);
  g.fillCircle(hx + f * 5.6, hy2 - 2.6, 0.8);
  g.fillStyle(0xff5a2a, 0.4 + 0.3 * Math.sin(now / 350));
  g.fillCircle(hx + f * 5, hy2 - 2, 1);
};

/** 猰貐：赤身牛躯 + 人面 + 马足交替踏步 + 獠牙 + 赤色凶气 */
export const yuYu: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const hide = 0xb05a3a, dark = 0x7a3620, cream = 0xe8c8a8;
  groundShadow(g, pose, 58);
  const gallop = Math.abs(Math.sin(now / 240)) * (pose.move ?? 0) * 3;
  g.fillStyle(dark, 1);
  g.fillEllipse(x + 1.6, topY + 56 + 1.6, 46, 34);
  g.fillStyle(hide, 1);
  g.fillEllipse(x, topY + 55 - gallop * 0.4, 44, 32);
  g.fillStyle(0xc96a44, 0.5);
  g.fillEllipse(x - f * 6, topY + 46 - gallop * 0.4, 26, 14);
  g.lineStyle(1.6, dark, 0.6);
  g.lineBetween(x - f * 16, topY + 42 - gallop * 0.4, x + f * 14, topY + 42 - gallop * 0.4);
  for (const s of [-1, 1]) {
    for (let p = 0; p < 2; p++) {
      const ph = now / 190 + (s > 0 ? 0 : Math.PI) + p * 1.4;
      const step = Math.sin(ph) * (pose.move ?? 0.2) * 6;
      g.lineStyle(5, s * p > 0 ? dark : hide, 1);
      g.lineBetween(x + s * (12 + p * 6), topY + 66 - gallop * 0.4, x + s * (12 + p * 6) + step, feetY - 3);
      g.fillStyle(0x2a1a12, 1);
      g.fillEllipse(x + s * (12 + p * 6) + step, feetY - 2, 8, 4);
    }
  }
  const wag = Math.sin(now / 380);
  g.lineStyle(2.4, dark, 1);
  g.lineBetween(x - f * 20, topY + 44, x - f * (28 + wag * 4), topY + 58);
  g.fillStyle(0x3a2a1a, 0.9);
  g.fillCircle(x - f * (28 + wag * 4), topY + 58, 3);
  const hx = x + f * 16, hy2 = topY + 22 - gallop * 0.4;
  g.fillStyle(cream, 1);
  g.fillCircle(hx, hy2, 13);
  g.fillStyle(dark, 1);
  g.fillEllipse(hx - f * 2, hy2 - 10, 24, 10);
  for (let k = -2; k <= 2; k++) {
    g.fillTriangle(hx + k * 5 - 2, hy2 - 8, hx + k * 5 + 2, hy2 - 8, hx + k * 5 + wag * 1.5, hy2 - 16);
  }
  g.fillStyle(0xff3a3a, 0.85 + 0.15 * Math.sin(now / 240));
  g.fillEllipse(hx - f * 5, hy2 - 2, 4.4, 3.4);
  g.fillEllipse(hx + f * 5, hy2 - 2, 4.4, 3.4);
  g.fillStyle(0x1a0a08, 0.9);
  g.fillCircle(hx - f * 5, hy2 - 2, 1.2); g.fillCircle(hx + f * 5, hy2 - 2, 1.2);
  g.fillStyle(0xffffff, 1);
  g.fillTriangle(hx - f * 7, hy2 + 7, hx - f * 3, hy2 + 7, hx - f * 6, hy2 + 15);
  g.fillTriangle(hx + f * 3, hy2 + 7, hx + f * 7, hy2 + 7, hx + f * 6, hy2 + 15);
  for (let k = 0; k < 4; k++) {
    const ph = (now / 700 + k / 4) % 1;
    g.fillStyle(0xff3a2a, 0.16 * (1 - ph));
    g.fillCircle(x + Math.sin(k * 2.4) * 26 + Math.sin(ph * 4 + k) * 5, topY + 50 - ph * 70, 3.4 * (1 - ph) + 1);
  }
  g.fillStyle(0xff3a2a, 0.08 + 0.05 * Math.sin(now / 300));
  g.fillEllipse(x, topY + 40, 90, 90);
};
