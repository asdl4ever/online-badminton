import type Phaser from 'phaser';

/**
 * 击球拖尾的共享原语——**整条轨迹**画法。
 * 所有 painter 拿到完整采样点序列，把拖尾画成一个连贯的整体形状。
 * pts[0] 最旧、pts[n-1] 是球头；fade 是整条拖尾的浓淡。
 *
 * 除基础曲线工具外，这里还提供一组「贴名」形状原语：
 * 星 / 多边形 / 花瓣 / 空心环 / 云团泡 / 十字芒 / 叶子——
 * painter 把它们沿轨迹摆出来，构成名字里的那个东西。
 */

export type G = Phaser.GameObjects.Graphics;
export const TAU = Math.PI * 2;
export type Pt = { x: number; y: number };
export type Ctx = { g: G; pts: readonly Pt[]; fade: number; now: number };

/** 年龄 0(旧)~1(球头) */
export const ageOf = (n: number, i: number): number => i / (n - 1);

/** 第 i 点的切线方向（单位向量，指向球头） */
export function dirAt(pts: readonly Pt[], i: number): Pt {
  const a = pts[Math.max(0, i - 1)];
  const b = pts[Math.min(pts.length - 1, i + 1)];
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

/** 沿整条轨迹描一条宽度/透明度随年龄变化的曲线 */
export function curve(
  ctx: Ctx, w0: number, w1: number, a0: number, a1: number, color: number,
): void {
  const { g, pts, fade } = ctx;
  for (let i = 1; i < pts.length; i++) {
    const f = ageOf(pts.length, i);
    g.lineStyle(w0 + (w1 - w0) * f, color, (a0 + (a1 - a0) * f) * fade);
    g.lineBetween(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
  }
}

/** 一条波浪 ribbon：曲线上的每一个点垂直偏移出正弦边 */
export function ribbon(
  ctx: Ctx, amp: number, freq: number, speed: number, w: number, color: number, alpha = 0.8,
): void {
  const { g, pts, fade, now } = ctx;
  const n = pts.length;
  for (let i = 1; i < n; i++) {
    const f = ageOf(n, i);
    const p0 = pts[i - 1], p1 = pts[i];
    const dx = p1.x - p0.x, dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const o0 = Math.sin(f * freq * TAU + now / speed) * amp * (0.3 + f * 0.7);
    const o1 = Math.sin((f + 1 / n) * freq * TAU + now / speed) * amp * (0.3 + (f + 1 / n) * 0.7);
    g.lineStyle(w, color, alpha * (0.15 + f * 0.75) * fade);
    g.lineBetween(p0.x + nx * o0, p0.y + ny * o0, p1.x + nx * o1, p1.y + ny * o1);
  }
}

/** 沿轨迹撒粒子（offset 由 seed 决定，稳定不抖） */
export function scatter(
  ctx: Ctx, count: number, size: number, color: number, spread: number, rise = 0, alpha = 0.8,
): void {
  const { g, pts, fade, now } = ctx;
  const n = pts.length;
  for (let k = 0; k < count; k++) {
    const f = ((k * 0.618) % 1 + now / 1600) % 1;
    const i = Math.min(n - 1, Math.floor(f * (n - 1)));
    const p = pts[i];
    const j = Math.sin(k * 12.9) * spread;
    const jy = Math.cos(k * 7.3) * spread - rise * (now / 900 + k * 0.37) % 30;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 260 + k * 1.9));
    g.fillStyle(color, alpha * tw * (0.25 + f * 0.75) * fade);
    g.fillCircle(p.x + j, p.y + jy, size * (0.5 + f * 0.5));
  }
}

/** 折线闪电：沿轨迹的锯齿主干 */
export function boltLine(ctx: Ctx, segs: number, jag: number, w: number, color: number, alpha = 0.9): void {
  const { g, pts, fade, now } = ctx;
  const n = pts.length;
  const head = pts[n - 1];
  g.lineStyle(w, color, alpha * fade);
  g.beginPath();
  g.moveTo(head.x, head.y);
  for (let s = 1; s <= segs; s++) {
    const f = 1 - s / segs;
    const i = Math.max(0, Math.floor(f * (n - 1)));
    const p = pts[i];
    const jx = Math.sin(s * 5.7 + now / 90) * jag * (0.4 + (1 - f));
    const jy = Math.cos(s * 4.3 + now / 70) * jag * 0.6;
    g.lineTo(p.x + jx, p.y + jy);
  }
  g.strokePath();
}

/** 头部亮核：外光晕 + 主色 + 白芯 */
export function headCore(ctx: Ctx, color: number): void {
  const { g, pts, fade } = ctx;
  const head = pts[pts.length - 1];
  g.fillStyle(color, 0.22 * fade);
  g.fillCircle(head.x, head.y, 11);
  g.fillStyle(color, 0.6 * fade);
  g.fillCircle(head.x, head.y, 5.5);
  g.fillStyle(0xffffff, 0.7 * fade);
  g.fillCircle(head.x, head.y, 2.4);
}

// ---------------------------------------------------------------- 形状原语

/** 实心多边形（sides 边，rot 弧度，sy 是纵向压扁比例） */
export function polyAt(
  ctx: Ctx, x: number, y: number, r: number, sides: number, rot: number,
  color: number, alpha: number, sy = 1,
): void {
  const vs: Pt[] = [];
  for (let k = 0; k < sides; k++) {
    const ang = rot + (k / sides) * TAU;
    vs.push({ x: x + Math.cos(ang) * r, y: y + Math.sin(ang) * r * sy });
  }
  ctx.g.fillStyle(color, alpha * ctx.fade);
  ctx.g.fillPoints(vs as never, true, true);
}

/** 五角（或 n 角）星 */
export function starAt(
  ctx: Ctx, x: number, y: number, r: number, rot: number, color: number, alpha: number, points = 5,
): void {
  const vs: Pt[] = [];
  for (let k = 0; k < points * 2; k++) {
    const ang = rot + (k / (points * 2)) * TAU;
    const rr = k % 2 === 0 ? r : r * 0.42;
    vs.push({ x: x + Math.cos(ang) * rr, y: y + Math.sin(ang) * rr });
  }
  ctx.g.fillStyle(color, alpha * ctx.fade);
  ctx.g.fillPoints(vs as never, true, true);
}

/** 一片花瓣 / 叶子：从 (x,y) 朝 ang 方向伸出 len 长、wid 宽的水滴形 */
export function petalAt(
  ctx: Ctx, x: number, y: number, ang: number, len: number, wid: number,
  color: number, alpha: number,
): void {
  const cos = Math.cos(ang), sin = Math.sin(ang);
  const px = (u: number, v: number) => ({ x: x + cos * u - sin * v, y: y + sin * u + cos * v });
  const vs: Pt[] = [];
  const steps = 5;
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    vs.push(px(len * t, -wid * Math.sin(t * Math.PI)));
  }
  for (let k = steps; k >= 0; k--) {
    const t = k / steps;
    vs.push(px(len * t, wid * Math.sin(t * Math.PI)));
  }
  ctx.g.fillStyle(color, alpha * ctx.fade);
  ctx.g.fillPoints(vs as never, true, true);
}

/** 空心圆环（泡泡 / 光环 / 涟漪） */
export function ringAt(
  ctx: Ctx, x: number, y: number, r: number, w: number, color: number, alpha: number,
): void {
  ctx.g.lineStyle(w, color, alpha * ctx.fade);
  ctx.g.strokeCircle(x, y, r);
}

/** 云团 / 雾团：三个叠在一起的圆 */
export function puffAt(
  ctx: Ctx, x: number, y: number, r: number, color: number, alpha: number,
): void {
  const { g, fade } = ctx;
  g.fillStyle(color, alpha * 0.8 * fade);
  g.fillCircle(x - r * 0.6, y + r * 0.2, r * 0.6);
  g.fillCircle(x + r * 0.6, y + r * 0.15, r * 0.65);
  g.fillStyle(color, alpha * fade);
  g.fillCircle(x, y - r * 0.15, r * 0.8);
}

/** 十字光芒（火花 / 星芒）：两条交叉的细梭形 */
export function sparkAt(
  ctx: Ctx, x: number, y: number, r: number, rot: number, color: number, alpha: number,
): void {
  const { g, fade } = ctx;
  const w = Math.max(0.9, r * 0.22);
  g.fillStyle(color, alpha * fade);
  for (let k = 0; k < 2; k++) {
    const ang = rot + (k * Math.PI) / 2;
    const vs = [
      { x: x + Math.cos(ang) * r, y: y + Math.sin(ang) * r },
      { x: x + Math.cos(ang + Math.PI / 2) * w, y: y + Math.sin(ang + Math.PI / 2) * w },
      { x: x - Math.cos(ang) * r, y: y - Math.sin(ang) * r },
      { x: x + Math.cos(ang - Math.PI / 2) * w, y: y + Math.sin(ang - Math.PI / 2) * w },
    ];
    g.fillPoints(vs as never, true, true);
  }
}

/** 沿轨迹每隔 step 个点摆一个由 fn 生成的形状（fn 拿到点索引 / 年龄 / 切线角） */
export function alongPath(
  ctx: Ctx, step: number, skipHead: number,
  fn: (x: number, y: number, tang: number, f: number, i: number) => void,
): void {
  const { pts } = ctx;
  const n = pts.length;
  for (let i = 1; i < n - skipHead; i += step) {
    const d = dirAt(pts, i);
    fn(pts[i].x, pts[i].y, Math.atan2(d.y, d.x), ageOf(n, i), i);
  }
}

export interface TrailArt {
  c: number;
  a: number;
  draw: (ctx: Ctx, c: number, a: number) => void;
}
