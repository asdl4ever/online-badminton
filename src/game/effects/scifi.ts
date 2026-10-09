import type { EffectPainter } from './types';

/**
 * 第七批「宇宙科幻」主题的 5 个**专属命中特效**——每款按名字画那个东西本身：
 * - 纳米崩爆：六边纳米格团炸散再重组；
 * - 数据崩坏：白色错误方块 + 乱码 + 加载环；
 * - 跃迁爆：小星门撕开、星轨喷出；
 * - 尘暴爆：红色尘暴 + 碎石；
 * - 遗迹爆：遗迹门展开、符文环炸开。
 */

const TAUf = Math.PI * 2;

/** 1. 纳米崩爆：六边纳米格团炸散再重组 */
export const nanoBurst: EffectPainter = (g, f, t, a, size) => {
  const mint = 0x39ffd0, blue = 0x7fe8ff;
  // 中心六边核
  const s = (12 + t * 3) * size;
  const hex = (cx: number, cy: number, r: number, col: number, al: number): void => {
    g.fillStyle(col, al);
    g.fillPoints([
      { x: cx, y: cy - r }, { x: cx + r * 0.86, y: cy - r * 0.5 }, { x: cx + r * 0.86, y: cy + r * 0.5 },
      { x: cx, y: cy + r }, { x: cx - r * 0.86, y: cy + r * 0.5 }, { x: cx - r * 0.86, y: cy - r * 0.5 },
    ] as never, true);
  };
  hex(f.x, f.y, s, blue, a * 0.85);
  hex(f.x, f.y, s * 0.6, mint, a * 0.95);
  g.fillStyle(0xffffff, a * 0.8); g.fillCircle(f.x, f.y, s * 0.25);
  // 炸散再重组的格子
  for (let k = 0; k < 12; k++) {
    const ang = f.seed + (k / 12) * TAUf;
    const rr = (10 + Math.sin(t * Math.PI) * 46) * size;
    hex(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 3.4 * size, k % 2 ? mint : blue, a * (0.5 + 0.5 * (1 - t)));
  }
};

/** 2. 数据崩坏：白色错误方块 + 乱码 + 加载环 */
export const dataCrash: EffectPainter = (g, f, t, a, size) => {
  const green = 0x4affc4, blue = 0x7fb8ff, err = 0xff3a5a;
  // 旋转加载环
  for (let k = 0; k < 8; k++) { const ang = now2(t, f.seed) + (k / 8) * TAUf; const on = 0.4 + 0.6 * Math.abs(Math.sin(t * 6 + k)); g.fillStyle(k % 2 ? green : blue, a * on); g.fillRect(f.x + Math.cos(ang) * 14 * size - 2 * size, f.y + Math.sin(ang) * 14 * size - 2 * size, 4 * size, 4 * size); }
  // 中心错误方块
  const s = (9 + t * 4) * size;
  g.fillStyle(0xffffff, a * 0.95); g.fillRect(f.x - s, f.y - s, s * 2, s * 2);
  g.fillStyle(err, a); g.fillRect(f.x - s * 0.6, f.y - s * 0.6, s * 1.2, s * 1.2);
  // 乱码条
  for (let k = 0; k < 6; k++) { const ang = f.seed + (k / 6) * TAUf + t * 1.4; const rr = (10 + t * 40) * size; g.fillStyle(k % 3 ? green : err, a * (1 - t * 0.4)); g.fillRect(f.x + Math.cos(ang) * rr - 3 * size, f.y + Math.sin(ang) * rr - 1.4 * size, 6 * size, 2.8 * size); }
  // 错误方块飞散
  for (let k = 0; k < 8; k++) { const ang = f.seed + (k / 8) * TAUf; const rr = (12 + t * 46) * size; g.fillStyle(k % 2 ? 0xffffff : err, a * (1 - t)); g.fillRect(f.x + Math.cos(ang) * rr - 2.4 * size, f.y + Math.sin(ang) * rr - 2.4 * size, 4.8 * size, 4.8 * size); }
};
function now2(_t: number, _seed: number): number { return 0; }

/** 3. 跃迁爆：小星门撕开、星轨喷出 */
export const warpBurst: EffectPainter = (g, f, t, a, size) => {
  const purple = 0xa98cff, star = 0x9fd8ff;
  // 撕开的星门
  const rx = (8 + t * 20) * size, ry = (16 + t * 6) * size;
  g.fillStyle(0x05060f, a * 0.9); g.fillEllipse(f.x, f.y, rx * 2, ry * 2);
  g.lineStyle(2.4 * size, purple, a * 0.9); g.strokeEllipse(f.x, f.y, rx * 2, ry * 2);
  g.lineStyle(1.6 * size, star, a * 0.8); g.strokeEllipse(f.x, f.y, rx * 1.4, ry * 1.4);
  // 喷出的星轨
  for (let k = 0; k < 12; k++) {
    const ang = f.seed + (k / 12) * TAUf;
    const len = (10 + t * 48) * size;
    g.fillStyle(k % 2 ? star : purple, a * (1 - t * 0.4));
    g.fillRect(f.x + Math.cos(ang) * len - 5 * size, f.y + Math.sin(ang) * len - 1.2 * size, 10 * size, 2.4 * size);
  }
  // 漩涡
  for (let arm = 0; arm < 3; arm++) { g.lineStyle(1.6 * size, star, a * 0.5 * (1 - t)); g.beginPath(); for (let s = 0; s <= 6; s++) { const u = s / 6; const ang = (arm / 3) * TAUf + u * 3 + f.seed; const rr = u * 14 * size; const px = f.x + Math.cos(ang) * rr, py = f.y + Math.sin(ang) * rr; if (s === 0) g.moveTo(px, py); else g.lineTo(px, py); } g.strokePath(); }
  g.fillStyle(0xffffff, a * (1 - t * 0.6)); g.fillCircle(f.x, f.y, 3 * size);
};

/** 4. 尘暴爆：红色尘暴 + 碎石 */
export const marsDustBurst: EffectPainter = (g, f, t, a, size) => {
  const dirt = 0xc0462a, dust = 0xff7a4a, stone = 0x9a8a78;
  // 尘暴环外扩
  for (let k = 0; k < 4; k++) { const ph = (t + k * 0.24) % 1; g.lineStyle((3 - k * 0.6) * size, k % 2 ? dust : dirt, a * 0.6 * (1 - ph)); g.strokeCircle(f.x, f.y, (8 + ph * 52) * size); }
  // 尘团
  for (let k = 0; k < 10; k++) { const ang = f.seed + (k / 10) * TAUf + t * 0.8; const rr = (10 + t * 40) * size; g.fillStyle(k % 2 ? dust : dirt, a * 0.5 * (1 - t)); g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, (4 - t * 2) * size); }
  // 碎石
  for (let k = 0; k < 7; k++) { const ang = f.seed + (k / 7) * TAUf + 0.4; const rr = (12 + t * 46) * size; g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang + t * 3); g.fillStyle(stone, a * (1 - t * 0.5)); g.fillRect(-3 * size, -2.4 * size, 6 * size, 4.8 * size); g.restore(); }
  g.fillStyle(0xffffff, a * (1 - t * 0.6)); g.fillCircle(f.x, f.y, 3 * size);
};

/** 5. 遗迹爆：遗迹门展开、符文环炸开 */
export const forerBurst: EffectPainter = (g, f, t, a, size) => {
  const metal = 0x2c3a4a, glow = 0x5ad8ff, bright = 0xa8e0ff;
  // 展开的遗迹门
  const open = Math.min(1, t * 2);
  const hh = (16 + t * 4) * size, ww = (10 + open * 10) * size;
  g.fillStyle(metal, a * 0.95); g.fillRect(f.x - ww - 5 * size, f.y - hh, 8 * size, hh * 2); g.fillRect(f.x + ww - 3 * size, f.y - hh, 8 * size, hh * 2);
  g.fillStyle(bright, a * 0.4 * open); g.fillRect(f.x - ww, f.y - hh * 0.9, ww * 2, hh * 1.8);
  g.fillStyle(0xffffff, a * 0.7 * open); g.fillRect(f.x - ww * 0.6, f.y - hh * 0.6, ww * 1.2, hh * 1.2);
  // 符文环炸开
  for (let k = 0; k < 12; k++) {
    const ang = f.seed + (k / 12) * TAUf;
    const rr = (12 + t * 48) * size;
    g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang + t * 3);
    g.fillStyle(k % 2 ? glow : metal, a * (1 - t * 0.5));
    g.fillRect(-3 * size, -3 * size, 6 * size, 6 * size);
    g.fillStyle(bright, a * (1 - t * 0.5)); g.fillRect(-1.4 * size, -1.4 * size, 2.8 * size, 2.8 * size);
    g.restore();
  }
  // 内环
  g.lineStyle(2 * size, bright, a * 0.6 * (1 - t)); g.strokeCircle(f.x, f.y, (10 + t * 30) * size);
};
