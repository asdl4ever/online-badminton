import type { EffectPainter } from './types';

/**
 * 第六批「民俗神话」主题的 5 个**专属命中特效**——每款按名字画那个东西本身：
 * - 巫咒爆：骷髅头炸裂 + 骨片/木屑 + 绿巫火环 + 两只乌鸦扑出；
 * - 圣火焚爆：圣火球炸开 + 火焰环 + 光羽火星 + 金色符文；
 * - 日冕爆：金轮炸开 + 放射光芒 + 鹰羽屑 + 陶土尘环；
 * - 提基爆：提基面具炸裂 + 浪花环 + 贝壳木屑 + 图腾刻纹；
 * - 虹彩爆：彩鳞团炸开 + 七色环 + 水花土尘 + 点画光点。
 */

const TAUf = Math.PI * 2;

/** 1. 巫咒爆：颅骨炸开 + 乌鸦扑散 + 绿巫火 */
export const slavCurseBurst: EffectPainter = (g, f, t, a, size) => {
  const bone = 0xd8e0d0, dark = 0x2a2018, fire = 0x7dff6a, wood = 0x6a4a2a;
  const s = (12 + t * 3) * size;
  // 中心头骨
  g.fillStyle(dark, a * 0.9); g.fillCircle(f.x, f.y, s * 0.9);
  g.fillStyle(bone, a); g.fillCircle(f.x, f.y, s * 0.7);
  g.fillStyle(dark, a); g.fillCircle(f.x - s * 0.24, f.y - s * 0.08, s * 0.2); g.fillCircle(f.x + s * 0.24, f.y - s * 0.08, s * 0.2);
  g.fillStyle(0x8a6a2a, a); g.fillRect(f.x - s * 0.3, f.y + s * 0.36, s * 0.6, s * 0.2);
  // 骨片 / 木屑飞散
  for (let k = 0; k < 8; k++) {
    const ang = f.seed + (k / 8) * TAUf + t * 1.2;
    const rr = (10 + t * 50) * size;
    g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang + t * 4);
    g.fillStyle(k % 2 ? bone : wood, a * (1 - t * 0.5));
    g.fillRect(-2.6 * size, -1.8 * size, 5.2 * size, 3.6 * size);
    g.restore();
  }
  // 绿巫火环
  for (let k = 0; k < 8; k++) {
    const ang = (k / 8) * TAUf + f.seed;
    const ph = Math.min(1, t * 1.6);
    g.fillStyle(fire, a * 0.7 * (1 - t));
    g.fillEllipse(f.x + Math.cos(ang) * (12 + ph * 40) * size, f.y + Math.sin(ang) * (12 + ph * 40) * size - t * 8, 5 * size, 9 * size);
  }
  // 两只乌鸦从两侧扑出
  for (const dir of [-1, 1]) {
    const rr = (10 + t * 44) * size;
    const cx = f.x + dir * rr, cy = f.y - t * 18 * size;
    g.fillStyle(dark, a * (1 - t * 0.4));
    g.fillEllipse(cx, cy, 10 * size, 4 * size);
    const flap = Math.sin(f.seed + t * 20) * 5 * size;
    g.fillPoints([{ x: cx - 2 * size, y: cy }, { x: cx - 2 * size, y: cy - flap }, { x: cx + 4 * size, y: cy - 2 * size }] as never, true);
    g.fillPoints([{ x: cx - 2 * size, y: cy }, { x: cx - 2 * size, y: cy + flap }, { x: cx + 4 * size, y: cy + 2 * size }] as never, true);
  }
};

/** 2. 圣火焚爆：圣火球炸裂 + 火焰环外扩 + 光羽火星 + 金色符文 */
export const persHolyFire: EffectPainter = (g, f, t, a, size) => {
  const gold = 0xffd45c, deep = 0xff5a2a, cream = 0xfff0b0;
  const s = (14 + t * 4) * size;
  // 火焰环外扩
  for (let k = 0; k < 3; k++) {
    const ph = (t + k * 0.26) % 1;
    g.lineStyle((3 - k * 0.6) * size, k % 2 ? cream : deep, a * 0.7 * (1 - ph));
    g.strokeCircle(f.x, f.y, (8 + ph * 54) * size);
  }
  // 中心圣火球
  g.fillStyle(deep, a * 0.9); g.fillCircle(f.x, f.y, s);
  g.fillStyle(gold, a); g.fillCircle(f.x, f.y, s * 0.7);
  g.fillStyle(cream, a * 0.95); g.fillCircle(f.x, f.y, s * 0.35);
  // 光羽 + 火星
  for (let k = 0; k < 8; k++) {
    const ang = f.seed + (k / 8) * TAUf + t * 1.4;
    const rr = (10 + t * 48) * size;
    const px = f.x + Math.cos(ang) * rr, py = f.y + Math.sin(ang) * rr;
    if (k % 2 === 0) {
      g.save(); g.translateCanvas(px, py); g.rotateCanvas(ang + Math.PI / 2);
      g.fillStyle(gold, a * (1 - t * 0.5));
      g.fillPoints([{ x: 0, y: -5 * size }, { x: 1.6 * size, y: 0 }, { x: 0, y: 5 * size }, { x: -1.6 * size, y: 0 }] as never, true);
      g.restore();
    } else { g.fillStyle(k % 4 === 1 ? cream : deep, a * (1 - t)); g.fillCircle(px, py, 1.6 * size); }
  }
  // 金色符文
  const glyph = 0.5 + 0.5 * Math.sin(f.seed + t * 6);
  g.lineStyle(1.8 * size, gold, a * glyph);
  for (let k = 0; k < 3; k++) { const y = f.y - 26 * size + k * 8 * size; g.lineBetween(f.x - 5 * size, y, f.x + 5 * size, y); }
};

/** 3. 日冕爆：金轮炸开 + 放射光芒 + 鹰羽屑 + 陶土尘环 */
export const incaSolarBurst: EffectPainter = (g, f, t, a, size) => {
  const gold = 0xffd45c, ray = 0xfff0b0, dark = 0x2a2a34, clay = 0xc0703a;
  const s = (13 + t * 4) * size;
  // 放射光芒
  for (let k = 0; k < 16; k++) {
    const ang = f.seed + (k / 16) * TAUf + now0(f, t) * 0;
    const len = (16 + t * 40 + (k % 2) * 6) * size;
    g.fillStyle(k % 2 ? ray : gold, a * (0.6 - t * 0.4));
    g.fillTriangle(f.x + Math.cos(ang) * s * 0.6, f.y + Math.sin(ang) * s * 0.6, f.x + Math.cos(ang + 0.09) * len, f.y + Math.sin(ang + 0.09) * len, f.x + Math.cos(ang - 0.09) * len, f.y + Math.sin(ang - 0.09) * len);
  }
  // 中心金轮
  g.fillStyle(0x8a5a1a, a * 0.9); g.fillCircle(f.x, f.y, s);
  g.fillStyle(gold, a); g.fillCircle(f.x, f.y, s * 0.72);
  g.fillStyle(ray, a * 0.95); g.fillCircle(f.x, f.y, s * 0.3);
  // 鹰羽屑
  for (let k = 0; k < 6; k++) {
    const ang = f.seed + (k / 6) * TAUf + 0.5 + t * 2;
    const rr = (12 + t * 46) * size;
    g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang + t * 3);
    g.fillStyle(k % 2 ? dark : gold, a * (1 - t * 0.5));
    g.fillPoints([{ x: 0, y: -5 * size }, { x: 1.6 * size, y: 0 }, { x: 0, y: 5 * size }, { x: -1.6 * size, y: 0 }] as never, true);
    g.restore();
  }
  // 陶土尘环
  g.lineStyle(2 * size, clay, a * 0.4 * (1 - t));
  g.strokeCircle(f.x, f.y, (14 + t * 40) * size);
};
function now0(_f: unknown, _t: number): number { return 0; }

/** 4. 提基爆：提基面具炸裂 + 浪花环 + 贝壳木屑 + 图腾刻纹 */
export const polyTikiBurst: EffectPainter = (g, f, t, a, size) => {
  const wood = 0x8a5a2a, woodD = 0x5a3a1a, glow = 0x5fe8d0, foam = 0xdff6ff, shell = 0xffe0b0;
  const s = (13 + t * 3) * size;
  // 中心提基面具
  g.fillStyle(woodD, a * 0.95); g.fillRect(f.x - s, f.y - s * 0.9, s * 2, s * 1.8);
  g.fillStyle(wood, a); g.fillRect(f.x - s * 0.85, f.y - s * 0.75, s * 1.7, s * 1.5);
  g.fillStyle(0x1a1a16, a); g.fillEllipse(f.x - s * 0.35, f.y - s * 0.2, s * 0.4, s * 0.3); g.fillEllipse(f.x + s * 0.35, f.y - s * 0.2, s * 0.4, s * 0.3);
  g.fillStyle(glow, a); g.fillCircle(f.x - s * 0.35, f.y - s * 0.2, s * 0.12); g.fillCircle(f.x + s * 0.35, f.y - s * 0.2, s * 0.12);
  g.fillStyle(0x1a1a16, a); g.fillRect(f.x - s * 0.45, f.y + s * 0.35, s * 0.9, s * 0.3);
  // 浪花环
  for (let k = 0; k < 4; k++) { const ph = (t + k * 0.24) % 1; g.lineStyle((2.6 - k * 0.5) * size, foam, a * 0.7 * (1 - ph)); g.strokeCircle(f.x, f.y, (10 + ph * 50) * size); }
  // 贝壳 / 木屑
  for (let k = 0; k < 8; k++) {
    const ang = f.seed + (k / 8) * TAUf + t * 1.3;
    const rr = (10 + t * 48) * size;
    const px = f.x + Math.cos(ang) * rr, py = f.y + Math.sin(ang) * rr;
    if (k % 2 === 0) { g.fillStyle(shell, a * (1 - t * 0.5)); g.fillPoints([{ x: px, y: py - 3 * size }, { x: px - 3 * size, y: py + 2 * size }, { x: px + 3 * size, y: py + 2 * size }] as never, true); }
    else { g.fillStyle(woodD, a * (1 - t * 0.5)); g.fillRect(px - 2 * size, py - 2 * size, 4 * size, 4 * size); }
  }
  // 图腾刻纹
  g.lineStyle(1.6 * size, glow, a * 0.5 * (1 - t));
  for (let k = 0; k < 3; k++) { const yy = f.y - 24 * size + k * 8 * size; g.lineBetween(f.x - 6 * size, yy, f.x + 6 * size, yy); }
};

/** 5. 虹彩爆：彩鳞团炸开 + 七色环 + 水花土尘 + 点画光点 */
export const auzRainbowBurst: EffectPainter = (g, f, t, a, size) => {
  const cols = [0xff5a5a, 0xff9a3c, 0xffd45c, 0x8fd45a, 0x5fd0ff, 0x7a6aff];
  const s = (13 + t * 3) * size;
  // 七色环外扩
  for (let k = 0; k < 6; k++) {
    const ph = (t + k * 0.15) % 1;
    g.lineStyle((2.6 - k * 0.3) * size, cols[k], a * 0.6 * (1 - ph));
    g.strokeCircle(f.x, f.y, (8 + ph * 52) * size);
  }
  // 中心彩鳞团
  for (let k = 0; k < 8; k++) { const ang = f.seed + (k / 8) * TAUf; g.fillStyle(cols[k % 6], a); g.fillEllipse(f.x + Math.cos(ang) * s * 0.4, f.y + Math.sin(ang) * s * 0.4, s * 0.7, s * 0.5); }
  g.fillStyle(0xffffff, a * 0.8); g.fillCircle(f.x, f.y, s * 0.3);
  // 水花 + 土尘
  for (let k = 0; k < 10; k++) {
    const ang = f.seed + (k / 10) * TAUf + t * 1.6;
    const rr = (10 + t * 50) * size;
    g.fillStyle(k % 3 === 0 ? 0xdff6ff : (k % 3 === 1 ? 0xc0703a : cols[k % 6]), a * (1 - t * 0.5));
    g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 1.6 * size);
  }
  // 点画光点
  for (let k = 0; k < 6; k++) { const ang = -Math.PI / 2 + (k / 5) * Math.PI; const rr = (14 + t * 34) * size; g.fillStyle(0xfff0a0, a * 0.8 * (1 - t)); g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 1.4 * size); }
};
