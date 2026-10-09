import type { EffectPainter } from './types';

/**
 * 第八批「海洋怪兽」主题的 5 个**专属命中特效**：
 * - 深海咆哮：冰海巨兽张口咆哮 + 冰声波 + 碎冰；
 * - 幽光爆：诱饵灯炸开 + 幽光波纹 + 小光点；
 * - 碎冰爆：冰面炸裂 + 冰锥飞散；
 * - 维度折叠爆：空间对折成几何、符文炸开；
 * - 虚空吞噬爆：巨口吞咬 + 幽光触须。
 */

const TAUf = Math.PI * 2;

/** 1. 深海咆哮：巨兽张口咆哮 + 冰声波 + 碎冰 */
export const glacDeepRoar: EffectPainter = (g, f, t, a, size) => {
  const ice = 0xbfe8ff, blue = 0x5fd8ff, mouth = 0x0e2a3e;
  // 中心巨口
  const s = (12 + t * 4) * size;
  g.fillStyle(mouth, a * 0.95); g.fillEllipse(f.x, f.y, s * 2.2, s * (0.6 + t * 0.6));
  g.fillStyle(ice, a * 0.9); g.fillEllipse(f.x, f.y - s * 0.5, s * 2.2, s * 0.5);
  g.fillStyle(ice, a * 0.9); g.fillEllipse(f.x, f.y + s * 0.5, s * 2.2, s * 0.5);
  for (let k = 0; k < 8; k++) { g.fillStyle(0xe8f4f8, a); g.fillTriangle(f.x - s * 0.9 + k * s * 0.25, f.y - s * 0.1, f.x - s * 0.9 + k * s * 0.25 + s * 0.16, f.y - s * 0.1, f.x - s * 0.9 + k * s * 0.25 + s * 0.08, f.y - s * 0.5); }
  // 冰声波
  for (let k = 0; k < 3; k++) { const ph = (t + k * 0.26) % 1; g.lineStyle((2.6 - k * 0.5) * size, k % 2 ? ice : blue, a * 0.7 * (1 - ph)); g.strokeCircle(f.x, f.y, (10 + ph * 52) * size); }
  // 碎冰
  for (let k = 0; k < 8; k++) { const ang = f.seed + (k / 8) * TAUf + t * 1.4; const rr = (12 + t * 46) * size; g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang + t * 3); g.fillStyle(k % 2 ? ice : 0xffffff, a * (1 - t * 0.5)); g.fillPoints([{ x: 0, y: -4 * size }, { x: 3 * size, y: 0 }, { x: 0, y: 4 * size }, { x: -3 * size, y: 0 }] as never, true); g.restore(); }
};

/** 2. 幽光爆：诱饵灯炸开 + 幽光波纹 + 小光点 */
export const fridLureBurst: EffectPainter = (g, f, t, a, size) => {
  const glow = 0x39ffd0, mint = 0x7dffd0, dark = 0x0e2830;
  // 幽光波纹
  for (let k = 0; k < 3; k++) { const ph = (t + k * 0.28) % 1; g.lineStyle((3 - k * 0.6) * size, k % 2 ? mint : glow, a * 0.7 * (1 - ph)); g.strokeCircle(f.x, f.y, (10 + ph * 50) * size); }
  // 中心诱饵灯
  const s = (10 + t * 3) * size;
  g.fillStyle(dark, a * 0.8); g.fillCircle(f.x, f.y, s);
  g.fillStyle(glow, a * 0.5); g.fillCircle(f.x, f.y, s);
  g.fillStyle(mint, a); g.fillCircle(f.x, f.y, s * 0.6);
  g.fillStyle(0xffffff, a * 0.95); g.fillCircle(f.x, f.y, s * 0.3);
  // 小光点
  for (let k = 0; k < 10; k++) { const ang = f.seed + (k / 10) * TAUf + t * 1.6; const rr = (10 + t * 48) * size; g.fillStyle(k % 2 ? mint : glow, a * (1 - t * 0.5)); g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 1.6 * size); }
};

/** 3. 碎冰爆：冰面炸裂 + 冰锥飞散 */
export const walrSmash: EffectPainter = (g, f, t, a, size) => {
  const ice = 0x8fd8ff, bright = 0xe8f4ff, snow = 0xffffff;
  // 炸裂的冰面
  const s = (12 + t * 3) * size;
  g.fillStyle(ice, a * 0.6); g.fillEllipse(f.x, f.y, s * 3, s * 1.4);
  g.lineStyle(2 * size, bright, a * (1 - t * 0.4));
  for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAUf + f.seed; g.lineBetween(f.x, f.y, f.x + Math.cos(ang) * s * 1.6, f.y + Math.sin(ang) * s * 0.8); }
  // 冰锥
  for (let k = 0; k < 9; k++) { const ang = f.seed + (k / 9) * TAUf + t * 1.2; const rr = (10 + t * 48) * size; g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang + t * 3); g.fillStyle(k % 2 ? bright : ice, a * (1 - t * 0.5)); g.fillTriangle(0, -7 * size, 3 * size, 5 * size, -3 * size, 5 * size); g.restore(); }
  // 雪尘
  for (let k = 0; k < 12; k++) { const ang = k * 2.399 + f.seed; const rr = (8 + t * 40) * size; g.fillStyle(snow, a * 0.6 * (1 - t)); g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 1.4 * size); }
};

/** 4. 维度折叠爆：空间对折成几何、符文炸开 */
export const dimFold: EffectPainter = (g, f, t, a, size) => {
  const purple = 0xb08aff, glow = 0x7dffd0, voidc = 0x05040f;
  // 中心对折的几何
  const s = (12 + t * 4) * size;
  g.save(); g.translateCanvas(f.x, f.y); g.rotateCanvas(f.seed + t * 2);
  g.fillStyle(voidc, a * 0.9); g.fillRect(-s, -s, s * 2, s * 2);
  g.fillStyle(purple, a * 0.6); g.fillRect(-s, -s, s * 2, s * 2);
  g.fillStyle(voidc, a); g.fillPoints([{ x: -s, y: -s }, { x: s, y: -s }, { x: 0, y: 0 }] as never, true);
  g.fillStyle(voidc, a); g.fillPoints([{ x: s, y: s }, { x: -s, y: s }, { x: 0, y: 0 }] as never, true);
  g.fillStyle(0xffffff, a * (0.6 + 0.4 * (1 - t))); g.fillCircle(0, 0, s * 0.3);
  g.restore();
  // 符文碎片
  for (let k = 0; k < 10; k++) { const ang = f.seed + (k / 10) * TAUf + t * 1.4; const rr = (12 + t * 50) * size; g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang + t * 3); g.fillStyle(k % 2 ? purple : glow, a * (1 - t * 0.5)); g.fillRect(-2.4 * size, -2.4 * size, 4.8 * size, 4.8 * size); g.restore(); }
  for (let k = 0; k < 3; k++) { const ph = (t + k * 0.3) % 1; g.lineStyle(2 * size, glow, a * 0.5 * (1 - ph)); g.strokeRect(f.x - (10 + ph * 34) * size, f.y - (10 + ph * 34) * size, (20 + ph * 68) * size, (20 + ph * 68) * size); }
};

/** 5. 虚空吞噬爆：巨口吞咬 + 幽光触须 */
export const hadalVoid: EffectPainter = (g, f, t, a, size) => {
  const deep = 0x0e2830, glow = 0x39ffd0, tooth = 0xe8f4f8;
  // 触须从中心向外
  for (let k = 0; k < 7; k++) {
    const base = f.seed + (k / 7) * TAUf;
    const len = (14 + t * 46) * size;
    g.lineStyle((4 - (k % 3) * 0.7) * size, k % 2 ? deep : glow, a * 0.9);
    g.beginPath();
    for (let seg = 0; seg <= 5; seg++) { const u = seg / 5; const rr = u * len; const wob = Math.sin(u * 5 + k * 1.7 + f.seed) * (4 + t * 6) * size; const ang = base + Math.sin(u * 3 + k) * 0.3; g.lineTo(f.x + Math.cos(ang) * rr - Math.sin(ang) * wob, f.y + Math.sin(ang) * rr + Math.cos(ang) * wob); }
    g.strokePath();
  }
  // 中心巨口（上下颚咬合）
  const clamp = Math.max(0.2, 1 - t * 1.6);
  const s = (14 + t * 4) * size;
  g.fillStyle(deep, a * 0.95); g.fillPoints([{ x: f.x - s * 1.4, y: f.y - s * 0.4 }, { x: f.x + s * 1.4, y: f.y - s * 0.1 }, { x: f.x - s * 1.4, y: f.y + s * 0.1 }] as never, true);
  g.fillStyle(deep, a * 0.95); g.fillPoints([{ x: f.x - s * 1.4, y: f.y + s * 0.4 }, { x: f.x + s * 1.4, y: f.y + s * 0.1 }, { x: f.x - s * 1.4, y: f.y - s * 0.1 }] as never, true);
  g.fillStyle(0x02080a, a); g.fillEllipse(f.x, f.y, s * 1.6, s * 0.7 * clamp);
  for (let k = 0; k < 7; k++) { g.fillStyle(tooth, a); g.fillTriangle(f.x - s * 1.1 + k * s * 0.35, f.y - s * 0.12, f.x - s * 1.1 + k * s * 0.35 + s * 0.2, f.y - s * 0.12, f.x - s * 1.1 + k * s * 0.35 + s * 0.1, f.y - s * 0.4); }
  g.fillStyle(glow, a * (0.4 + 0.4 * (1 - t))); g.fillCircle(f.x, f.y, s * 0.25);
};
