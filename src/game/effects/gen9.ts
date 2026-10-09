import type { EffectPainter } from './types';

/**
 * 第九批（恐龙 / 史前 / 神话 / 恶搞 10 主题）专属命中特效。
 * 每个按名字画爆点本身：中心主形 + 向外运动的碎片 + 一道随 t 变化的次级反应。
 * 颜色以 painter 内写死为主，`f.color` 只当点缀。
 */

const TAUf = Math.PI * 2;

/** 陨石撞击：中心石核 + 放射裂纹 + 溅起岩屑与火星 + 外围火环 */
export const cretImpact: EffectPainter = (g, f, t, a, size) => {
  const rock = 0x6a5a3a, fire = 0xff7a2a, ember = 0xffd45c, s = (10 + t * 14) * size;
  g.fillStyle(rock, a * 0.95); g.fillCircle(f.x, f.y, s);
  g.fillStyle(0x8a7a4a, a); g.fillCircle(f.x, f.y, s * 0.7);
  g.fillStyle(rock, a); g.fillCircle(f.x, f.y, s * 0.5);
  g.lineStyle(2 * size, rock, a * (1 - t));
  for (let k = 0; k < 6; k++) {
    const ang = (k / 6) * TAUf + f.seed;
    const x0 = f.x + Math.cos(ang) * s, y0 = f.y + Math.sin(ang) * s;
    g.lineBetween(f.x, f.y, x0 + Math.cos(ang) * t * 30 * size, y0 + Math.sin(ang) * t * 30 * size);
  }
  for (let k = 0; k < 10; k++) {
    const ang = f.seed + (k / 10) * TAUf, rr = (12 + t * 52) * size;
    g.fillStyle(k % 3 ? rock : ember, a * (1 - t * 0.5));
    g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, (1.6 + (k % 2)) * size);
  }
  for (let k = 0; k < 8; k++) {
    const ang = (k / 8) * TAUf + f.seed;
    g.fillStyle(fire, a * 0.7 * (1 - t));
    g.fillEllipse(f.x + Math.cos(ang) * (14 + t * 38) * size, f.y + Math.sin(ang) * (14 + t * 38) * size, 5 * size, 9 * size);
  }
};

/** 沼气爆：绿沼气泡团炸开 + 泥点飞溅 + 外围沼雾 */
export const swampGasBurst: EffectPainter = (g, f, t, a, size) => {
  const gas = 0x7dff9a, mud = 0x4a3a22, swap = 0x2a5a3a, s = (10 + t * 16) * size;
  g.fillStyle(swap, a * 0.9); g.fillCircle(f.x, f.y, s);
  g.fillStyle(gas, a * 0.7); g.fillCircle(f.x, f.y, s * 0.72);
  g.fillStyle(0xe8ffd0, a * 0.6); g.fillCircle(f.x - s * 0.2, f.y - s * 0.2, s * 0.32);
  for (let k = 0; k < 8; k++) {
    const ang = f.seed + (k / 8) * TAUf + t * 1.4, rr = (10 + t * 46) * size;
    g.fillStyle(k % 2 ? gas : 0xd0ff9a, a * (1 - t * 0.5));
    g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, (1.8 + (k % 3)) * size);
  }
  for (let k = 0; k < 7; k++) {
    const ang = (k / 7) * TAUf + f.seed; g.fillStyle(mud, a * (1 - t));
    g.fillCircle(f.x + Math.cos(ang) * (16 + t * 40) * size, f.y + Math.sin(ang) * (16 + t * 40) * size, 2.4 * size);
  }
  g.fillStyle(gas, a * 0.3 * (1 - t)); g.fillEllipse(f.x, f.y, (30 + t * 60) * size, (30 + t * 60) * size * 0.7);
};

/** 冰爆：冰晶核炸裂 + 放射冰刺 + 寒气外扩 */
export const iceageBurst: EffectPainter = (g, f, t, a, size) => {
  const ice = 0x8fd8ff, core = 0xdff4ff, deep = 0x2f5a78, s = (8 + t * 10) * size;
  g.fillStyle(deep, a * 0.8); g.fillCircle(f.x, f.y, s * 1.4);
  for (let k = 0; k < 9; k++) {
    const ang = (k / 9) * TAUf + f.seed, len = (16 + t * 44) * size;
    g.fillStyle(ice, a * (1 - t * 0.4));
    g.fillPoints([{ x: f.x + Math.cos(ang) * 6 * size, y: f.y + Math.sin(ang) * 6 * size }, { x: f.x + Math.cos(ang + 0.16) * 5 * size, y: f.y + Math.sin(ang + 0.16) * 5 * size }, { x: f.x + Math.cos(ang) * len, y: f.y + Math.sin(ang) * len }] as never, true);
  }
  g.fillStyle(core, a); g.fillCircle(f.x, f.y, s * 0.7);
  g.fillStyle(ice, a * 0.7); g.fillCircle(f.x, f.y, s * 0.45);
  for (let k = 0; k < 7; k++) { const ph = ((f.seed / 6 + k / 7 + t) % 1); g.fillStyle(core, (1 - ph) * a * 0.6); g.fillCircle(f.x + Math.sin(k * 2 + t * 3) * 30 * size, f.y + Math.cos(k * 3) * 30 * size - ph * 20 * size, 1.8 * size); }
};

/** 雷霆爆：雷球膨胀 + 球面电弧 + 放射电弧 */
export const yorThunderBurst: EffectPainter = (g, f, t, a, size) => {
  const bolt = 0xfff080, core = 0xffffff, hot = 0xffd45c, dark = 0x7a3416, s = (9 + t * 12) * size;
  g.fillStyle(dark, a * 0.85); g.fillCircle(f.x, f.y, s * 1.3);
  g.fillStyle(hot, a * 0.9); g.fillCircle(f.x, f.y, s);
  g.fillStyle(core, a); g.fillCircle(f.x, f.y, s * 0.5);
  g.lineStyle(2 * size, bolt, a * (1 - t * 0.4));
  for (let k = 0; k < 8; k++) {
    const ang = (k / 8) * TAUf + f.seed; let px = f.x, py = f.y;
    for (let j = 1; j <= 3; j++) { const rr = (s + t * (10 + j * 16) * size) * (j / 3 * 1.4 + 0.3); const jx = f.x + Math.cos(ang) * rr + Math.sin(k + j * 2 + t * 8) * 5 * size, jy = f.y + Math.sin(ang) * rr + Math.cos(k + j * 3 + t * 8) * 5 * size; g.lineBetween(px, py, jx, jy); px = jx; py = jy; }
  }
  for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAUf + f.seed; g.fillStyle(bolt, a * (1 - t)); g.fillCircle(f.x + Math.cos(ang) * (14 + t * 50) * size, f.y + Math.sin(ang) * (14 + t * 50) * size, 2 * size); }
};

/** 歌潮爆：同心音波圈荡开 + 震散音符 */
export const kalSongBurst: EffectPainter = (g, f, t, a, size) => {
  const wave = 0x9fe8d0, note = 0xd8e8f0, s = (8 + t * 10) * size;
  for (let k = 0; k < 3; k++) { const rr = (12 + ((t + k * 0.22) % 1) * 56) * size; const aa = a * (1 - ((t + k * 0.22) % 1)) * 0.7; g.lineStyle(2.4 * size, wave, aa); g.strokeCircle(f.x, f.y, rr); }
  g.fillStyle(0x2a4a56, a * 0.7); g.fillCircle(f.x, f.y, s * 0.8);
  g.fillStyle(wave, a); g.fillCircle(f.x, f.y, s * 0.5);
  for (let k = 0; k < 6; k++) {
    const ang = f.seed + (k / 6) * TAUf + t * 1.2, rr = (12 + t * 46) * size;
    const nx = f.x + Math.cos(ang) * rr, ny = f.y + Math.sin(ang) * rr;
    g.fillStyle(note, a * (1 - t * 0.4)); g.fillEllipse(nx, ny, 4 * size, 3.2 * size);
    g.fillRect(nx + 1.4 * size, ny - 9 * size, 1.4 * size, 9 * size);
  }
};

/** 蕉皮滑倒爆：蕉皮啪地炸开 + 果肉飞溅 + 果蝇 */
export const banSplat: EffectPainter = (g, f, t, a, size) => {
  const peel = 0xf0d020, peelD = 0x8a8a1a, flesh = 0xfff6c0, s = (10 + t * 15) * size;
  g.fillStyle(peelD, a * 0.9); g.fillCircle(f.x, f.y, s * 0.7);
  g.fillStyle(flesh, a); g.fillCircle(f.x, f.y, s * 0.5);
  for (let k = 0; k < 5; k++) {
    const ang = f.seed + (k / 5) * TAUf + t * 0.6;
    g.save(); g.translateCanvas(f.x + Math.cos(ang) * (10 + t * 40) * size, f.y + Math.sin(ang) * (10 + t * 40) * size); g.rotateCanvas(ang + t * 5);
    g.fillStyle(peel, a * (1 - t * 0.4));
    g.fillPoints([{ x: -8 * size, y: 0 }, { x: 0, y: -6 * size }, { x: 8 * size, y: 0 }, { x: 0, y: 6 * size }] as never, true);
    g.fillStyle(peelD, a * (1 - t * 0.4)); g.fillCircle(0, 0, 2 * size);
    g.restore();
  }
  for (let k = 0; k < 8; k++) { const ang = f.seed + (k / 8) * TAUf, rr = (10 + t * 50) * size; g.fillStyle(flesh, a * (1 - t)); g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 2 * size); }
  for (let k = 0; k < 4; k++) { const ang = f.seed + k * 1.7 + t * 6; g.fillStyle(0x2a2018, a * (1 - t) * 0.9); g.fillCircle(f.x + Math.cos(ang) * 34 * size, f.y + Math.sin(ang) * 26 * size, 1.4 * size); }
};

/** 404 爆：报错窗口弹出 + 像素块飞散 + 像素环绕 */
export const meme404Burst: EffectPainter = (g, f, t, a, size) => {
  const win = 0x2b2b3a, bar = 0xff4a5a, txt = 0xd8d8e8, s = (10 + t * 12) * size;
  const w = s * 3.2, h = s * 2.2, sc = 1 + (1 - t) * 0.4;
  g.fillStyle(bar, a * 0.9); g.fillRect(f.x - w / 2 * sc, f.y - h / 2 * sc, w * sc, 4 * size);
  g.fillStyle(win, a * 0.92); g.fillRoundedRect(f.x - w / 2 * sc, f.y - h / 2 * sc, w * sc, h * sc, 3 * size);
  g.fillStyle(txt, a); g.fillRect(f.x - w / 2 * sc + 5 * size, f.y - h / 2 * sc + 9 * size, w * 0.55 * sc, 3 * size);
  g.fillRect(f.x - w / 2 * sc + 5 * size, f.y - h / 2 * sc + 16 * size, w * 0.4 * sc, 3 * size);
  g.fillStyle(bar, a); g.fillRect(f.x + w / 2 * sc - 12 * size, f.y - h / 2 * sc + 8 * size, 7 * size, 7 * size);
  for (let k = 0; k < 12; k++) {
    const ang = f.seed + (k / 12) * TAUf, rr = (12 + t * 56) * size;
    g.fillStyle(k % 3 === 0 ? bar : k % 3 === 1 ? 0x7dff9a : 0x39ffd0, a * (1 - t * 0.4));
    g.fillRect(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 3 * size, 3 * size);
  }
  g.fillStyle(bar, a * 0.5 * (1 - t)); g.strokeRect(f.x - w / 2 * sc - t * 14 * size, f.y - h / 2 * sc - t * 10 * size, w * sc + t * 28 * size, h * sc + t * 20 * size);
};

/** 摸鱼爆：Z 字气泡团外扩 + 便签飞散 */
export const officeSnooze: EffectPainter = (g, f, t, a, size) => {
  const bubble = 0x9fd8ff, note = 0xffd45c, ink = 0x3a3a44, s = (10 + t * 14) * size;
  g.fillStyle(ink, a * 0.6); g.fillCircle(f.x, f.y, s * 0.9);
  for (let k = 0; k < 3; k++) {
    const rr = (8 + ((t + k * 0.3) % 1) * 50) * size, aa = a * (1 - ((t + k * 0.3) % 1)) * 0.8;
    g.fillStyle(bubble, aa * 0.5); g.fillCircle(f.x, f.y, rr);
  }
  // 手绘 Z（避免依赖文本）：用折线画
  for (let k = 0; k < 3; k++) {
    const rr = (10 + k * 14 + t * 44) * size, zx = f.x + rr * 0.5, zy = f.y - rr * 0.5;
    g.lineStyle(2 * size, 0xffffff, a * (1 - t) * 0.9);
    g.lineBetween(zx - 4 * size, zy - 4 * size, zx + 4 * size, zy - 4 * size);
    g.lineBetween(zx + 4 * size, zy - 4 * size, zx - 4 * size, zy + 4 * size);
    g.lineBetween(zx - 4 * size, zy + 4 * size, zx + 4 * size, zy + 4 * size);
  }
  for (let k = 0; k < 6; k++) {
    const ang = f.seed + (k / 6) * TAUf; g.fillStyle(note, a * (1 - t));
    g.save(); g.translateCanvas(f.x + Math.cos(ang) * (14 + t * 44) * size, f.y + Math.sin(ang) * (14 + t * 44) * size); g.rotateCanvas(ang + t * 3);
    g.fillRect(-3 * size, -3 * size, 6 * size, 6 * size);
    g.restore();
  }
};

/** 花粉爆：金色花粉团炸开 + 花瓣飞散 + 粉雾 */
export const gnomePollen: EffectPainter = (g, f, t, a, size) => {
  const pollen = 0xffd45c, petal = 0xffd0e2, leaf = 0xa8ff7a, s = (10 + t * 14) * size;
  g.fillStyle(0x6a5a20, a * 0.6); g.fillCircle(f.x, f.y, s);
  g.fillStyle(pollen, a * 0.85); g.fillCircle(f.x, f.y, s * 0.75);
  for (let k = 0; k < 14; k++) { const ang = f.seed + (k / 14) * TAUf, rr = (6 + t * 52) * size; g.fillStyle(k % 2 ? pollen : 0xfff0a0, a * (1 - t * 0.4)); g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, (1.4 + (k % 2)) * size); }
  for (let k = 0; k < 7; k++) {
    const ang = f.seed + (k / 7) * TAUf + t, rr = (12 + t * 40) * size;
    g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang + t * 2);
    g.fillStyle(k % 3 === 0 ? leaf : petal, a * (1 - t * 0.4));
    g.fillEllipse(0, 0, 7 * size, 3.4 * size);
    g.restore();
  }
};

/** 垃圾爆：垃圾袋炸开 + 番茄皮香蕉皮飞散 + 碎片环绕 */
export const trashGarbage: EffectPainter = (g, f, t, a, size) => {
  const bag = 0x3a4444, tomato = 0xd84a3a, peel = 0xf0d020, s = (11 + t * 16) * size;
  g.fillStyle(bag, a * 0.9); g.fillEllipse(f.x, f.y, s * 1.6, s * 1.3);
  g.fillStyle(0x556060, a * 0.8); g.fillEllipse(f.x - s * 0.3, f.y - s * 0.3, s * 1.1, s * 0.9);
  for (let k = 0; k < 12; k++) {
    const ang = f.seed + (k / 12) * TAUf, rr = (12 + t * 54) * size;
    const col = k % 3 === 0 ? tomato : k % 3 === 1 ? peel : 0x8fd4a0;
    g.fillStyle(col, a * (1 - t * 0.4));
    g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang + t * 5);
    g.fillRect(-3 * size, -2 * size, 6 * size, 4 * size);
    g.restore();
  }
  for (let k = 0; k < 6; k++) { const ang = f.seed + (k / 6) * TAUf; g.fillStyle(0x2a3030, a * (1 - t)); g.fillCircle(f.x + Math.cos(ang) * 36 * size, f.y + Math.sin(ang) * 30 * size, 1.6 * size); }
};
