import Phaser from 'phaser';
import type { EffectPainter } from './types';
import type { PlusEffectId } from '../cosmetics';
import { PALETTES, SPECS, type Shape, type Spec } from './plusMeta';

/**
 * 100 个生成式击球特效的**绘制**部分（数据表与显示名见 `plusMeta.ts`）。
 * 这里必须留在 Phaser 侧 —— **不要再让数据层（比如 `items.ts`）直接引它**，
 * 否则 Phaser 又会被整包拖进入口 chunk。
 */

export { PLUS_META } from './plusMeta';

// ---- particle drawing kernel ------------------------------------------------
function particle(g: Phaser.GameObjects.Graphics, shape: Shape, x: number, y: number, s: number, color: number, a: number): void {
  g.fillStyle(color, a);
  switch (shape) {
    case 0:
      g.fillCircle(x, y, s);
      break;
    case 1:
      g.fillRect(x - s, y - s, s * 2, s * 2);
      break;
    case 2:
      g.fillTriangle(x, y - s * 1.2, x + s, y + s * 0.8, x - s, y + s * 0.8);
      break;
    case 3:
      g.fillTriangle(x, y - s, x + s * 0.8, y, x, y + s);
      g.fillTriangle(x, y - s, x - s * 0.8, y, x, y + s);
      break;
    case 4:
      g.fillRect(x - s * 1.4, y - s * 0.4, s * 2.8, s * 0.8);
      break;
    case 5:
      g.fillRect(x - s * 1.3, y - s * 0.3, s * 2.6, s * 0.6);
      g.fillRect(x - s * 0.3, y - s * 1.3, s * 0.6, s * 2.6);
      break;
    default:
      g.fillPoints(
        Array.from({ length: 10 }, (_, i) => {
          const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
          const rr = i % 2 === 0 ? s : s * 0.45;
          return new Phaser.Math.Vector2(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
        }),
        true,
      );
  }
}

// ---- layered extras ---------------------------------------------------------
// 100 个特效不再是「圆点对称炸开」：在原型之上按 arch 叠加
// 方向偏置（朝挥拍方向飞得更远）+ 斩击弧 / 冲击核 / 延迟余烬的二段结构。

/** 方向偏置：位于挥拍方向 ±100° 扇面内的粒子被拉长 1.4 倍 */
function dirBias(f: { ang: number }, ang: number, t: number, size: number): { dx: number; dy: number } {
  let d = ang - f.ang;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  const bias = Math.abs(d) < 1.75 ? (1.75 - Math.abs(d)) * 0.26 * t * size : 0;
  return { dx: Math.cos(f.ang) * bias * 40, dy: Math.sin(f.ang) * bias * 40 };
}

/** 方向斩击弧：沿挥拍方向甩出的一道新月弧 */
function slashLayer(g: Phaser.GameObjects.Graphics, f: { x: number; y: number; ang: number }, t: number, a: number, size: number, c1: number, c2: number): void {
  const reach = (18 + t * 62) * size;
  g.save();
  g.translateCanvas(f.x, f.y);
  g.rotateCanvas(f.ang);
  g.lineStyle((5 * (1 - t) + 1) * size, c1, a * 0.9);
  g.beginPath();
  g.arc(-reach * 0.25, 0, reach * 0.85, -1.05, 1.05);
  g.strokePath();
  g.lineStyle((2.2 * (1 - t) + 0.5) * size, c2, a * 0.8);
  g.beginPath();
  g.arc(-reach * 0.25, 0, reach * 0.6, -0.9, 0.9);
  g.strokePath();
  g.restore();
}

/** 白闪冲击核：命中瞬间的一点白 + 快速消散的光斑 */
function impactLayer(g: Phaser.GameObjects.Graphics, f: { x: number; y: number }, t: number, a: number, size: number, c2: number): void {
  const flash = Math.max(0, 1 - t * 2.4);
  if (flash <= 0) return;
  g.fillStyle(0xffffff, a * flash);
  g.fillCircle(f.x, f.y, (9 * flash + 2) * size);
  g.fillStyle(c2, a * flash * 0.7);
  g.fillCircle(f.x, f.y, (15 * flash + 3) * size);
}

/** 延迟余烬二段：后半程才出现、往挥拍方向坠的小火星 */
function emberLayer(g: Phaser.GameObjects.Graphics, f: { x: number; y: number; ang: number; seed: number }, t: number, a: number, size: number, c2: number): void {
  if (t < 0.35) return;
  const tt = (t - 0.35) / 0.65;
  for (let k = 0; k < 6; k++) {
    const sp = 0.5 + ((f.seed * 13 + k * 7) % 10) / 10;
    const d = tt * 60 * sp * size;
    const spread = Math.sin(k * 2.7 + f.seed) * 16 * size;
    g.fillStyle(k % 2 ? c2 : 0xffffff, a * 0.75 * (1 - tt));
    g.fillCircle(f.x + Math.cos(f.ang) * d - Math.sin(f.ang) * spread, f.y + Math.sin(f.ang) * d + Math.cos(f.ang) * spread + tt * 18 * size, (2.2 * (1 - tt) + 0.6) * size);
  }
}

// ---- archetype painters -----------------------------------------------------
function makePainter(spec: Spec): EffectPainter {
  const pal = PALETTES[spec.pal];
  const { count, twist, shape } = spec;

  switch (spec.arch) {
    case 'burst':
      return (g, f, t, a, size) => {
        const dist = (10 + t * 52) * size;
        for (let k = 0; k < count; k++) {
          const ang = f.seed + (k / count) * Math.PI * 2 + t * twist;
          const bias = dirBias(f, ang, t, size);
          particle(g, shape, f.x + Math.cos(ang) * dist + bias.dx, f.y + Math.sin(ang) * dist + bias.dy, (4.5 * (1 - t) + 1.5) * size, k % 2 ? pal.c1 : pal.c2, a * 0.9);
        }
        g.fillStyle(pal.c2, a);
        g.fillCircle(f.x, f.y, 4 * size * a + 1);
      };
    case 'rings':
      return (g, f, t, a, size) => {
        for (let k = 0; k < count; k++) {
          const tt = Math.max(0, t - k * (0.8 / count));
          if (tt <= 0) continue;
          const r = (6 + tt * 60) * size;
          g.lineStyle((3.5 * (1 - tt) + 0.5) * a + 0.5, k % 2 ? pal.c1 : pal.c2, a * (0.9 - tt * 0.5));
          g.strokeCircle(f.x, f.y, r);
        }
      };
    case 'spiral':
      return (g, f, t, a, size) => {
        const dist = (8 + t * 58) * size;
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let k = 0; k < count; k++) {
          const ang = f.seed + k * golden + t * twist * 2.4;
          const bias = dirBias(f, ang, t, size);
          particle(g, shape, f.x + Math.cos(ang) * dist + bias.dx, f.y + Math.sin(ang) * dist + bias.dy, (3.6 * (1 - t) + 1.2) * size, k % 3 ? pal.c1 : pal.c2, a * 0.9);
        }
      };
    case 'rain':
      return (g, f, t, a, size) => {
        const fall = t * t * 90 * size;
        for (let k = 0; k < count; k++) {
          const ang = f.seed + (k / count) * Math.PI * 2;
          const spread = (10 + t * 44) * size;
          const px = f.x + Math.cos(ang) * spread;
          const py = f.y + Math.sin(ang) * spread * 0.4 + fall;
          particle(g, shape, px, py, (3.6 * (1 - t) + 1) * size, k % 2 ? pal.c1 : pal.c2, a * 0.85);
        }
      };
    case 'orbit':
      return (g, f, t, a, size) => {
        const r = (30 - t * 10) * size;
        for (let k = 0; k < count; k++) {
          const ang = f.seed + (k / count) * Math.PI * 2 + t * twist * 2.2;
          particle(g, shape, f.x + Math.cos(ang) * r, f.y + Math.sin(ang) * r * 0.7, (3 + (k % 2)) * size, k % 2 ? pal.c1 : pal.c2, a * 0.9);
        }
        g.fillStyle(pal.c2, a);
        g.fillCircle(f.x, f.y, 5 * size * a + 1);
      };
    case 'cross':
      return (g, f, t, a, size) => {
        const len = (14 + t * 64) * size;
        const w = (3.5 * (1 - t) + 0.8) * size;
        const dirs = count <= 4 ? 4 : 8;
        for (let k = 0; k < dirs; k++) {
          const ang = f.seed + (k / dirs) * Math.PI * 2 + t * twist;
          const c = Math.cos(ang);
          const s = Math.sin(ang);
          g.lineStyle(w, k % 2 ? pal.c1 : pal.c2, a * 0.9);
          g.lineBetween(f.x + c * 6, f.y + s * 6, f.x + c * len, f.y + s * len);
        }
        g.fillStyle(0xffffff, a * 0.8);
        g.fillCircle(f.x, f.y, 3.5 * size * a + 1);
      };
    case 'shards':
      return (g, f, t, a, size) => {
        const dist = (8 + t * 54) * size;
        for (let k = 0; k < count; k++) {
          const ang = f.seed + (k / count) * Math.PI * 2 + t * twist * 0.6;
          const px = f.x + Math.cos(ang) * dist;
          const py = f.y + Math.sin(ang) * dist;
          g.save();
          g.translateCanvas(px, py);
          g.rotateCanvas(ang + t * twist * 3);
          g.fillStyle(k % 2 ? pal.c1 : pal.c2, a * 0.9);
          g.fillTriangle(-5 * size, -3 * size, 6 * size, 0, -5 * size, 3 * size);
          g.restore();
        }
      };
    case 'petals':
      return (g, f, t, a, size) => {
        const fall = t * t * 70 * size;
        for (let k = 0; k < count; k++) {
          const ang = f.seed + (k / count) * Math.PI * 2;
          const sway = Math.sin(t * twist * 5 + k) * 10 * size;
          const px = f.x + Math.cos(ang) * (14 + t * 30) * size + sway;
          const py = f.y + Math.sin(ang) * 8 * size + fall;
          particle(g, shape, px, py, (3.5 * (1 - t * 0.6) + 1) * size, k % 2 ? pal.c1 : pal.c2, a * 0.85);
        }
      };
    case 'bolts': {
      return (g, f, t, a, size) => {
        const len = (16 + t * 66) * size;
        for (let k = 0; k < count; k++) {
          const ang = f.seed + (k / count) * Math.PI * 2 + Math.sin(t * 9 + k) * 0.15;
          let px = f.x;
          let py = f.y;
          g.lineStyle(2.5 * a + 0.5, k % 2 ? pal.c1 : pal.c2, a * 0.9);
          g.beginPath();
          g.moveTo(px, py);
          const segs = 4;
          for (let s2 = 1; s2 <= segs; s2++) {
            const d = (len / segs) * s2;
            const off = Math.sin(s2 * 2.4 + f.seed + t * twist * 4) * 9 * size;
            px = f.x + Math.cos(ang) * d - Math.sin(ang) * off;
            py = f.y + Math.sin(ang) * d + Math.cos(ang) * off;
            g.lineTo(px, py);
          }
          g.strokePath();
        }
        g.fillStyle(pal.c2, a);
        g.fillCircle(f.x, f.y, 4 * size * a + 1);
      };
    }
    case 'squares':
      return (g, f, t, a, size) => {
        for (let k = 0; k < count; k++) {
          const tt = Math.max(0, t - k * (0.7 / count));
          if (tt <= 0) continue;
          const r = (8 + tt * 52) * size;
          g.save();
          g.translateCanvas(f.x, f.y);
          g.rotateCanvas(f.seed + tt * twist * 2);
          g.lineStyle(2.5 * a + 0.5, k % 2 ? pal.c1 : pal.c2, a * (0.9 - tt * 0.4));
          g.strokeRect(-r, -r, r * 2, r * 2);
          g.restore();
        }
      };
    case 'rise':
      return (g, f, t, a, size) => {
        const lift = t * t * 96 * size;
        for (let k = 0; k < count; k++) {
          const ang = f.seed + (k / count) * Math.PI * 2;
          const spread = (8 + t * 34) * size;
          const bias = dirBias(f, ang, t, size);
          const px = f.x + Math.cos(ang) * spread + Math.sin(t * twist * 5 + k) * 6 * size + bias.dx;
          const py = f.y + Math.sin(ang) * spread * 0.3 - lift + bias.dy;
          particle(g, shape, px, py, (3.4 * (1 - t) + 1) * size, k % 2 ? pal.c1 : pal.c2, a * 0.85);
        }
      };
    case 'converge':
      return (g, f, t, a, size) => {
        const dist = (1 - t) * (10 + 58 * size);
        for (let k = 0; k < count; k++) {
          const ang = f.seed + (k / count) * Math.PI * 2 + t * twist;
          particle(g, shape, f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist, (2.6 + t * 3) * size, k % 2 ? pal.c1 : pal.c2, a * 0.9);
        }
        if (t > 0.75) {
          g.fillStyle(0xffffff, a);
          g.fillCircle(f.x, f.y, 7 * size * (t - 0.75) * 4 + 1);
        }
      };
    case 'waves':
      return (g, f, t, a, size) => {
        for (let k = 0; k < count; k++) {
          const rr = (10 + t * 54 + k * 9) * size;
          g.lineStyle(2 * a + 0.5, k % 2 ? pal.c1 : pal.c2, a * (0.85 - k * 0.12));
          g.beginPath();
          for (let s2 = 0; s2 <= 24; s2++) {
            const ang = (s2 / 24) * Math.PI * 2;
            const wob = Math.sin(ang * 5 + t * twist * 6) * 5 * size;
            const px = f.x + Math.cos(ang) * (rr + wob);
            const py = f.y + Math.sin(ang) * (rr + wob);
            if (s2 === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.strokePath();
        }
      };
    default: // spinStar
      return (g, f, t, a, size) => {
        const r = (10 + t * 56) * size;
        const points = 5;
        g.save();
        g.translateCanvas(f.x, f.y);
        g.rotateCanvas(f.seed + t * twist * 2.4);
        g.lineStyle(3 * a + 0.5, pal.c1, a * 0.9);
        g.beginPath();
        for (let s2 = 0; s2 <= points * 2; s2++) {
          const ang = (s2 / (points * 2)) * Math.PI * 2 - Math.PI / 2;
          const rr = s2 % 2 === 0 ? r : r * 0.42;
          const px = Math.cos(ang) * rr;
          const py = Math.sin(ang) * rr;
          if (s2 === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.strokePath();
        g.lineStyle(1.5, pal.c2, a * 0.6);
        g.strokeCircle(0, 0, r * 0.24);
        g.restore();
      };
  }
}


// ---- exports ----------------------------------------------------------------
export const PLUS_PAINTERS: Record<PlusEffectId, EffectPainter> = {};
export const PLUS_SPAN: Record<PlusEffectId, number> = {};

/** 每个原型叠加哪几层复合结构：impact = 白闪冲击核，slash = 方向斩击弧，ember = 延迟余烬二段 */
const LAYER_MODE: Partial<Record<string, string>> = {
  burst: 'impact+ember', shards: 'impact+ember', converge: 'impact',
  cross: 'slash', bolts: 'slash', spinStar: 'slash',
  rain: 'ember', rise: 'ember', orbit: 'ember', spiral: 'ember',
};

SPECS.forEach((spec, i) => {
  const id = `p${i + 1}` as PlusEffectId;
  const base = makePainter(spec);
  const mode = LAYER_MODE[spec.arch] ?? '';
  if (!mode) {
    PLUS_PAINTERS[id] = base;
  } else {
    const pal = PALETTES[spec.pal];
    PLUS_PAINTERS[id] = (g, f, t, a, size) => {
      if (mode.includes('impact')) impactLayer(g, f, t, a, size, pal.c2);
      base(g, f, t, a, size);
      if (mode.includes('slash')) slashLayer(g, f, t, a, size, pal.c1, pal.c2);
      if (mode.includes('ember')) emberLayer(g, f, t, a, size, pal.c2);
    };
  }
  PLUS_SPAN[id] = spec.span;
});
