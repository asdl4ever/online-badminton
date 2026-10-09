import type { EffectPainter } from './types';

/** 第十批专主题命中特效（梦境 / 微观 / 炼金 / 毛线 / 画中世界）。按名字画爆点本身。 */

const TAUf = Math.PI * 2;

/** 梦境崩塌：破碎的镜面梦壁 + 梦泡星屑 */
export const dreamBurst: EffectPainter = (g, f, t, a, size) => {
  const glass = 0xc9b8ff, edge = 0xfff4d8, s = (10 + t * 14) * size;
  g.fillStyle(0x241d45, a * 0.8); g.fillCircle(f.x, f.y, s);
  for (let k = 0; k < 8; k++) {
    const ang = f.seed + (k / 8) * TAUf, rr = (10 + t * 46) * size;
    g.fillStyle(k % 2 ? glass : 0x9f8aff, a * (1 - t * 0.4));
    g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang + t * 3);
    g.fillPoints([{ x: -5 * size, y: -4 * size }, { x: 5 * size, y: -6 * size }, { x: 6 * size, y: 5 * size }, { x: -4 * size, y: 4 * size }] as never, true);
    g.restore();
  }
  for (let k = 0; k < 8; k++) { const ang = f.seed + (k / 8) * TAUf; const rr = (8 + t * 40) * size; g.fillStyle(edge, a * (1 - t)); g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 2 * size); }
  g.fillStyle(edge, a * (0.5 + 0.5 * Math.sin(t * 20))); g.fillCircle(f.x, f.y, s * 0.4);
};

/** 分裂爆裂：中心细胞爆裂 + 胞质飞溅 */
export const microSplit: EffectPainter = (g, f, t, a, size) => {
  const memb = 0x5fe8d0, core = 0x39ffd0, cyto = 0xbafff0, s = (9 + t * 12) * size;
  const gap = t * 22 * size;
  for (const side of [-1, 1]) {
    g.fillStyle(memb, a * (1 - t * 0.3));
    g.fillEllipse(f.x + side * gap, f.y, (14 - t * 4) * size, (18 - t * 6) * size);
    g.fillStyle(core, a * (1 - t * 0.3)); g.fillCircle(f.x + side * gap, f.y, (5 - t * 1.5) * size);
  }
  for (let k = 0; k < 10; k++) { const ang = f.seed + (k / 10) * TAUf + t * 1.5; const rr = (10 + t * 52) * size; g.fillStyle(k % 2 ? cyto : core, a * (1 - t * 0.4)); g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 2 * size); }
  g.lineStyle(2 * size, core, a * (1 - t)); g.strokeCircle(f.x, f.y, s * 1.5);
};

/** 炼金爆炸：炸开的坩埚药团 + 药滴 + 药气 */
export const alchExplosion: EffectPainter = (g, f, t, a, size) => {
  const brew = 0x7dff6a, core = 0xbaffa0, gold = 0xffd45c, s = (10 + t * 15) * size;
  g.fillStyle(0x3a2a14, a * 0.85); g.fillCircle(f.x, f.y, s * 0.9);
  g.fillStyle(brew, a * 0.85); g.fillCircle(f.x, f.y, s * 1.1);
  for (let k = 0; k < 8; k++) { const ang = f.seed + (k / 8) * TAUf; const rr = (10 + t * 48) * size; g.fillStyle(k % 2 ? brew : core, a * (1 - t * 0.4)); g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, (2 + (k % 2)) * size); }
  for (let k = 0; k < 5; k++) { const ph = ((f.seed / 6 + k / 5 + t) % 1); g.fillStyle(brew, (1 - ph) * a * 0.5); g.fillCircle(f.x + Math.sin(k * 2) * 20 * size, f.y - ph * 40 * size, 3 * size); }
  g.fillStyle(gold, a * (1 - t)); g.fillCircle(f.x, f.y, s * 0.5);
  for (let k = 0; k < 4; k++) { const ang = f.seed + k * 1.6; g.fillStyle(gold, a * (1 - t)); g.fillCircle(f.x + Math.cos(ang) * 34 * size, f.y + Math.sin(ang) * 34 * size, 1.6 * size); }
};

/** 缠线爆：炸开的线结 + 线头飞散 */
export const yarnTangle: EffectPainter = (g, f, t, a, size) => {
  const yarn = 0xffb7d5, dark = 0xa86a8a, hi = 0xffd8e8, s = (9 + t * 12) * size;
  g.fillStyle(dark, a * 0.85); g.fillCircle(f.x, f.y, s * 0.8);
  for (let k = 0; k < 8; k++) { const ang = f.seed + (k / 8) * TAUf + t * 2; const rr = (8 + t * 50) * size; g.lineStyle(2.4 * size, k % 2 ? yarn : dark, a * (1 - t * 0.4)); g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(f.x + Math.cos(ang) * rr * 0.6, f.y + Math.sin(ang) * rr * 0.6 + Math.sin(ang * 3) * 8 * size); g.lineTo(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.strokePath(); }
  for (let k = 0; k < 6; k++) { const ang = f.seed + (k / 6) * TAUf; g.fillStyle(hi, a * (1 - t)); g.fillCircle(f.x + Math.cos(ang) * (14 + t * 40) * size, f.y + Math.sin(ang) * (14 + t * 40) * size, 2 * size); }
  g.fillStyle(hi, a * (0.4 + 0.4 * Math.sin(t * 24))); g.fillCircle(f.x, f.y, s * 0.4);
};

/** 泼墨爆：炸开的一团泼墨 + 色滴飞溅 */
export const paintSplashBurst: EffectPainter = (g, f, t, a, size) => {
  const cols = [0xff4a4a, 0xffd45c, 0x7dff9a, 0x5ac8ff, 0xff8ad4];
  const s = (10 + t * 16) * size;
  g.fillStyle(0x20162e, a * 0.8); g.fillCircle(f.x, f.y, s * 0.9);
  for (let k = 0; k < 5; k++) { const ang = f.seed + (k / 5) * TAUf; g.fillStyle(cols[k], a * (1 - t * 0.4)); g.fillEllipse(f.x + Math.cos(ang) * (10 + t * 30) * size, f.y + Math.sin(ang) * (10 + t * 30) * size, (12 - t * 4) * size, (10 - t * 3) * size); }
  for (let k = 0; k < 14; k++) { const ang = f.seed + (k / 14) * TAUf + t * 1.2; const rr = (12 + t * 54) * size; g.fillStyle(cols[k % 5], a * (1 - t * 0.4)); g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 2.4 * size); }
  g.fillStyle(0xfff0f0, a * (1 - t)); g.fillCircle(f.x, f.y, s * 0.4);
};
