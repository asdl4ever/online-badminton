import type { EffectPainter } from './types';

/**
 * 批十六「神话」主题的 5 个**专属命中特效**——每款按名字画那个东西本身，
 * 不是「同一个爆点换个颜色」：
 * - 梵音爆：金色「唵」字 + 一圈圈荡开的梵音声波 + 震散的莲花瓣；
 * - 神乐铃爆：一只能摇响的神乐铃 + 音波弧 + 飞散的神道纸垂；
 * - 符文爆裂：一排欧甘符文被炸开 + 藤蔓从裂缝窜出；
 * - 楔文震爆：楔形文字块崩碎 + 陶片与泥屑飞散；
 * - 疯狂膨胀：命中点炸出一丛扭动触须 + 正中睁开一只巨眼。
 */

const TAUf = Math.PI * 2;

/** 1. 梵音爆：金色「唵」字居中，一圈圈梵音声波荡开，莲瓣四散 */
export const vdaOm: EffectPainter = (g, f, t, a, size) => {
  const gold = 0xffd45c, deep = 0xff9a3a, lotus = 0xffb7d5;
  // 荡开的音波圈（三层，相位错开）
  for (let k = 0; k < 3; k++) {
    const ph = (t + k * 0.24) % 1;
    const r = (8 + ph * 54) * size;
    g.lineStyle((2.6 - k * 0.5) * size, k % 2 ? 0xffffff : gold, a * 0.7 * (1 - ph));
    g.strokeCircle(f.x, f.y, r);
  }
  // 中心的「唵」符（用折线近似：上弧 + 底点 + 右侧尾钩）
  const s = (16 + t * 5) * size * (1 + f.power * 0.3);
  const rot = f.ang * 0.15;
  g.save();
  g.translateCanvas(f.x, f.y);
  g.rotateCanvas(rot);
  g.lineStyle(3.4 * size, deep, a * 0.95);
  g.lineBetween(-s * 0.5, -s * 0.1, -s * 0.9, -s * 0.4);
  g.lineBetween(-s * 0.9, -s * 0.4, -s * 0.4, -s * 0.5);
  g.lineBetween(-s * 0.4, -s * 0.5, -s * 0.2, -s * 0.05);
  g.lineStyle(3.4 * size, gold, a * 0.95);
  g.beginPath();
  g.arc(0, -s * 0.1, s * 0.5, Math.PI * 0.9, Math.PI * 2.3);
  g.strokePath();
  g.beginPath();
  g.arc(s * 0.35, s * 0.35, s * 0.34, 0, TAUf);
  g.strokePath();
  g.fillStyle(0xffffff, a * 0.8 * (1 - t));
  g.fillCircle(-s * 0.45, -s * 0.35, 1.8 * size);
  g.restore();
  // 震散的莲瓣
  for (let k = 0; k < 8; k++) {
    const ang = f.seed + (k / 8) * TAUf + t * 1.6;
    const rr = (10 + t * 46) * size;
    const px = f.x + Math.cos(ang) * rr, py = f.y + Math.sin(ang) * rr;
    g.save();
    g.translateCanvas(px, py);
    g.rotateCanvas(ang + Math.PI / 2);
    g.fillStyle(k % 2 ? lotus : gold, a * 0.85 * (1 - t * 0.6));
    g.fillPoints([
      { x: 0, y: -(3.4 + 2 * (1 - t)) * size },
      { x: 2.4 * size, y: 0 },
      { x: 0, y: (3.4 + 2 * (1 - t)) * size },
      { x: -2.4 * size, y: 0 },
    ] as never, true);
    g.restore();
  }
};

/** 2. 神乐铃爆：一只能摇响的神乐铃，音波弧荡开、纸垂飞出 */
export const takKaguraBell: EffectPainter = (g, f, t, a, size) => {
  const bell = 0xffd45c, handle = 0x8a5a2a, paper = 0xfff6d8, red = 0xc0392b;
  const ring = Math.sin(t * Math.PI) * 0.5 + 0.5;
  // 音波弧（从铃身荡开）
  for (let k = 0; k < 3; k++) {
    const ph = (t + k * 0.28) % 1;
    g.lineStyle((3 - k * 0.6) * size, k % 2 ? paper : bell, a * 0.7 * (1 - ph));
    g.beginPath();
    g.arc(f.x, f.y, (10 + ph * 48) * size, -1.1, 1.1);
    g.strokePath();
    g.beginPath();
    g.arc(f.x, f.y, (10 + ph * 48) * size, Math.PI - 1.1, Math.PI + 1.1);
    g.strokePath();
  }
  // 铃身
  const s = (14 + t * 4) * size;
  const wob = Math.sin(f.seed + t * 24) * 0.12 * ring;
  g.save();
  g.translateCanvas(f.x, f.y);
  g.rotateCanvas(wob);
  g.fillStyle(handle, a);
  g.fillRect(-1.6 * size, -s * 1.1, 3.2 * size, s * 0.5); // 铃柄
  g.fillStyle(red, a); g.fillCircle(0, -s * 1.1, 2.6 * size); // 柄头红珠
  g.fillStyle(bell, a * 0.98);
  g.fillPoints([
    { x: -s * 0.62, y: s * 0.1 },
    { x: -s * 0.5, y: -s * 0.5 },
    { x: 0, y: -s * 0.75 },
    { x: s * 0.5, y: -s * 0.5 },
    { x: s * 0.62, y: s * 0.1 },
  ] as never, true);
  g.fillStyle(0xfff0b0, a * 0.5);
  g.fillRect(-s * 0.5, s * 0.02, s, 0.36 * size);
  g.fillStyle(handle, a);
  g.fillCircle(0, s * 0.24, 2.6 * size); // 铃舌
  g.restore();
  // 飞散的神道纸垂（白纸带红边，Z 字折）
  for (let k = 0; k < 5; k++) {
    const ang = f.seed + (k / 5) * TAUf;
    const rr = (8 + t * 44) * size;
    const px = f.x + Math.cos(ang) * rr, py = f.y + Math.sin(ang) * rr;
    g.save();
    g.translateCanvas(px, py);
    g.rotateCanvas(ang + t * 2);
    g.fillStyle(paper, a * 0.9 * (1 - t * 0.5));
    for (let j = 0; j < 3; j++) {
      const yy = j * 3.2 * size;
      g.fillRect((j % 2 ? 1.4 : -1.4) * size, yy, 1.6 * size, 2.6 * size);
    }
    g.fillStyle(red, a * 0.8 * (1 - t));
    g.fillCircle(0, -2 * size, 1.4 * size);
    g.restore();
  }
};

/** 3. 符文爆裂：一排欧甘符文被炸开，绿色藤蔓从裂缝窜出 */
export const celtRuneBurst: EffectPainter = (g, f, t, a, size) => {
  const green = 0x8fd45a, dark = 0x2f7a4a, bark = 0x6a4a2a, glow = 0xd8ff9a;
  // 中心立石裂开
  const s = (12 + t * 3) * size;
  g.fillStyle(bark, a * 0.9);
  g.fillPoints([
    { x: f.x - s * 0.5, y: f.y + s },
    { x: f.x - s * 0.42, y: f.y - s },
    { x: f.x + s * 0.42, y: f.y - s },
    { x: f.x + s * 0.5, y: f.y + s },
  ] as never, true);
  g.lineStyle(2 * size, dark, a);
  g.lineBetween(f.x, f.y - s, f.x + (t - 0.5) * 4 * size, f.y + s);
  // 石面上的欧甘符文刻痕（竖排一列短横）
  g.lineStyle(2.2 * size, glow, a * 0.9);
  const cols: number[][] = [[-0.3, 0.3], [0.1, -0.4], [-0.5, -0.1], [0.4, 0.5], [-0.2, 0.2]];
  for (let k = 0; k < cols.length; k++) {
    const yy = f.y - s * 0.6 + k * s * 0.3;
    g.lineBetween(f.x - cols[k][0] * s, yy, f.x + cols[k][1] * s, yy);
  }
  // 炸开的符文碎片（飞出的刻痕石块）
  for (let k = 0; k < 6; k++) {
    const ang = f.seed + (k / 6) * TAUf + 0.4;
    const rr = (10 + t * 48) * size;
    const px = f.x + Math.cos(ang) * rr, py = f.y + Math.sin(ang) * rr;
    g.save();
    g.translateCanvas(px, py);
    g.rotateCanvas(ang + t * 3.2);
    g.fillStyle(k % 2 ? bark : dark, a * 0.9 * (1 - t * 0.5));
    g.fillRect(-3.4 * size, -2.6 * size, 6.8 * size, 5.2 * size);
    g.lineStyle(1.4 * size, glow, a * 0.9 * (1 - t * 0.5));
    g.lineBetween(-2.4 * size, -1.2 * size, 2.4 * size, -1.2 * size);
    g.lineBetween(-2.4 * size, 1.2 * size, 2.4 * size, 1.2 * size);
    g.restore();
  }
  // 窜出的藤蔓（从中心往外长）
  for (let k = 0; k < 5; k++) {
    const ang = f.seed * 0.5 + (k / 5) * TAUf;
    g.lineStyle(2.6 * size, green, a * 0.9 * (1 - t * 0.4));
    g.beginPath();
    for (let seg = 0; seg <= 4; seg++) {
      const u = seg / 4;
      const rr = u * (10 + t * 34) * size;
      const wob = Math.sin(u * 6 + k + f.seed) * 2.4 * size;
      const px = f.x + Math.cos(ang) * rr - Math.sin(ang) * wob;
      const py = f.y + Math.sin(ang) * rr + Math.cos(ang) * wob;
      if (seg === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.strokePath();
    g.fillStyle(glow, a * 0.85 * (1 - t));
    const rr2 = (10 + t * 34) * size;
    g.fillCircle(f.x + Math.cos(ang) * rr2, f.y + Math.sin(ang) * rr2, 1.8 * size);
  }
};

/** 4. 楔文震爆：楔形文字块崩碎，陶片与泥屑飞散 */
export const mesoGlyphBurst: EffectPainter = (g, f, t, a, size) => {
  const clay = 0xd8b45a, clayD = 0x8a6a2a, lapis = 0x5a8aff, ink = 0x2a1a0a;
  // 中心泥板方块
  const s = (13 + t * 3) * size;
  g.fillStyle(clayD, a * 0.95);
  g.fillRect(f.x - s, f.y - s, s * 2, s * 2);
  g.fillStyle(clay, a * 0.95);
  g.fillRect(f.x - s * 0.86, f.y - s * 0.86, s * 1.72, s * 1.72);
  // 楔形文字（三角楔 + 竖线）
  g.fillStyle(ink, a * 0.85);
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      const cx = f.x + c * s * 0.5, cy = f.y + r * s * 0.5;
      g.fillTriangle(cx - 3 * size, cy + 2 * size, cx + 3 * size, cy + 2 * size, cx, cy - 3 * size);
      g.fillRect(cx - 0.8 * size, cy - 1 * size, 1.6 * size, 5 * size);
    }
  }
  // 崩碎的陶片
  for (let k = 0; k < 8; k++) {
    const ang = f.seed + (k / 8) * TAUf + t * 1.2;
    const rr = (12 + t * 52) * size;
    const px = f.x + Math.cos(ang) * rr, py = f.y + Math.sin(ang) * rr;
    g.save();
    g.translateCanvas(px, py);
    g.rotateCanvas(ang + t * 4);
    g.fillStyle(k % 3 === 0 ? lapis : clay, a * 0.9 * (1 - t * 0.5));
    g.fillTriangle(0, -4 * size, 4 * size, 3 * size, -3 * size, 3 * size);
    g.fillStyle(clayD, a * 0.5 * (1 - t));
    g.fillTriangle(0, -2 * size, 2 * size, 2 * size, -1.4 * size, 2 * size);
    g.restore();
  }
  // 泥屑尘点
  for (let k = 0; k < 10; k++) {
    const ang = k * 2.399 + f.seed;
    const rr = (8 + t * 40) * size;
    g.fillStyle(clay, a * 0.6 * (1 - t));
    g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 1.4 * size);
  }
};

/** 5. 疯狂膨胀：命中点炸出一丛扭动触须，正中睁开一只巨眼 */
export const cthMadness: EffectPainter = (g, f, t, a, size) => {
  const deep = 0x1e5a4a, deepD = 0x0e2a24, purple = 0x7a4aa8, glow = 0x5fe8c8, sclera = 0xfff0a0;
  // 炸开的触须（从中心向外）
  for (let k = 0; k < 7; k++) {
    const base = f.seed + (k / 7) * TAUf;
    const len = (14 + t * 46) * size;
    g.lineStyle((4.2 - (k % 3) * 0.8) * size, k % 2 ? purple : deep, a * 0.95);
    g.beginPath();
    for (let seg = 0; seg <= 5; seg++) {
      const u = seg / 5;
      const rr = u * len;
      const wob = Math.sin(u * 5 + k * 1.7 + f.seed) * (4 + t * 6) * size;
      const ang = base + Math.sin(u * 3 + k) * 0.3;
      const px = f.x + Math.cos(ang) * rr - Math.sin(ang) * wob;
      const py = f.y + Math.sin(ang) * rr + Math.cos(ang) * wob;
      if (seg === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.strokePath();
    // 吸盘
    g.fillStyle(glow, a * 0.7);
    for (let seg = 2; seg <= 5; seg++) {
      const u = seg / 5;
      g.fillCircle(f.x + Math.cos(base) * u * len, f.y + Math.sin(base) * u * len, 1.2 * size);
    }
  }
  // 正中睁开的巨眼
  const open = Math.min(1, t * 2.4);
  const ey = (12 + t * 4) * size;
  g.fillStyle(deepD, a * 0.95);
  g.fillEllipse(f.x, f.y, ey * 1.9, ey * 1.2);
  g.fillStyle(sclera, a * 0.95);
  g.fillEllipse(f.x, f.y, ey * 1.5 * open, ey * open);
  if (open > 0.25) {
    const px = f.x - (0.3 - t * 0.6) * ey * 0.6;
    g.fillStyle(0x1a0e2e, a);
    g.fillCircle(px, f.y, ey * 0.5 * open);
    g.fillStyle(glow, a * 0.95);
    g.fillCircle(px, f.y, ey * 0.22 * open);
    g.fillStyle(0xffffff, a * 0.9);
    g.fillCircle(px - ey * 0.1, f.y - ey * 0.12, ey * 0.09 * open);
  }
  // 眼球上的血丝
  g.lineStyle(1.2 * size, 0xff5a5a, a * 0.6 * (1 - t));
  for (let k = 0; k < 4; k++) {
    const ang = base2(k) + f.seed;
    g.lineBetween(f.x + Math.cos(ang) * ey * 0.9, f.y + Math.sin(ang) * ey * 0.7, f.x + Math.cos(ang) * ey * 0.4, f.y + Math.sin(ang) * ey * 0.3);
  }
};

function base2(k: number): number {
  return (k / 4) * Math.PI * 2;
}
