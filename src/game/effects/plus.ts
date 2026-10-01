import Phaser from 'phaser';
import type { EffectPainter } from './types';
import type { PlusEffectId } from '../cosmetics';

/**
 * 100 generated hit effects: 14 motion archetypes × 12 palettes × assorted
 * particle shapes / densities. Each spec produces a bespoke painter so every
 * id looks distinct while sharing the same tiny drawing kernels.
 */

// ---- palettes ---------------------------------------------------------------
interface Palette {
  cn: string;
  c1: number;
  c2: number;
}
const PALETTES: Palette[] = [
  { cn: '赤焰', c1: 0xe83a5a, c2: 0xffb02a },
  { cn: '琥珀', c1: 0xff9a3c, c2: 0xffe9b0 },
  { cn: '鎏金', c1: 0xffd45c, c2: 0xfff6d0 },
  { cn: '翠玉', c1: 0x35d6a4, c2: 0xd2ffe9 },
  { cn: '碧波', c1: 0x39ffd0, c2: 0xeafffd },
  { cn: '苍蓝', c1: 0x3a6ae8, c2: 0xa9c8ff },
  { cn: '紫电', c1: 0x9b5cff, c2: 0xe2c4ff },
  { cn: '樱粉', c1: 0xff5ad4, c2: 0xffd3ef },
  { cn: '月白', c1: 0xf8f4ea, c2: 0xc8d4e8 },
  { cn: '荧绿', c1: 0x9cff3a, c2: 0xe8ffd0 },
  { cn: '霜蓝', c1: 0x9fd8ff, c2: 0xffffff },
  { cn: '虚空', c1: 0x2a2a34, c2: 0x7dffc4 },
];

// ---- archetypes -------------------------------------------------------------
type Arch =
  | 'burst' // 放射绽放
  | 'rings' // 层层涟漪
  | 'spiral' // 螺旋卷
  | 'rain' // 坠落
  | 'orbit' // 环绕
  | 'cross' // 十字光束
  | 'shards' // 碎裂飞旋
  | 'petals' // 飘落
  | 'bolts' // 雷网
  | 'squares' // 方阵
  | 'rise' // 冲天
  | 'converge' // 汇聚
  | 'waves' // 波纹
  | 'spinStar'; // 星旋

const ARCH_CN: Record<Arch, string> = {
  burst: '绽放',
  rings: '涟漪',
  spiral: '螺旋',
  rain: '坠星',
  orbit: '环绕',
  cross: '十字',
  shards: '碎裂',
  petals: '飘落',
  bolts: '雷网',
  squares: '方阵',
  rise: '冲天',
  converge: '汇聚',
  waves: '波纹',
  spinStar: '星旋',
};

type Shape = 0 | 1 | 2 | 3 | 4 | 5 | 6; // circle square triangle diamond bar plus star

interface Spec {
  arch: Arch;
  pal: number;
  count: number;
  twist: number;
  shape: Shape;
  span: number;
}

// 100 specs: archetype cycling through the palettes with varied parameters
const RAW: Array<[Arch, number, number, number, Shape]> = [
  ['burst', 0, 10, 0.6, 0], ['burst', 1, 12, 1.1, 2], ['burst', 2, 8, 0.3, 6], ['burst', 3, 14, 0.9, 1],
  ['burst', 4, 11, 1.4, 5], ['burst', 5, 9, 0.5, 3], ['burst', 6, 13, 1.2, 2], ['burst', 7, 10, 0.7, 0],
  ['rings', 0, 3, 0, 6], ['rings', 2, 4, 0, 6], ['rings', 5, 3, 0, 6], ['rings', 7, 4, 0, 6],
  ['rings', 8, 3, 0, 6], ['rings', 10, 5, 0, 6], ['rings', 11, 4, 0, 6], ['rings', 3, 3, 0, 6],
  ['spiral', 1, 10, 2.2, 0], ['spiral', 3, 12, 3.4, 4], ['spiral', 4, 9, 1.8, 0], ['spiral', 6, 14, 2.8, 6],
  ['spiral', 8, 11, 2.0, 3], ['spiral', 9, 13, 3.0, 1], ['spiral', 11, 10, 2.5, 0], ['spiral', 0, 12, 2.4, 5],
  ['rain', 2, 12, 1.0, 0], ['rain', 4, 14, 1.6, 2], ['rain', 6, 10, 0.8, 4], ['rain', 8, 16, 1.2, 1],
  ['rain', 9, 12, 1.4, 3], ['rain', 11, 14, 1.0, 0], ['rain', 0, 10, 1.8, 5], ['rain', 5, 13, 1.1, 2],
  ['orbit', 0, 8, 3.0, 0], ['orbit', 2, 10, 4.2, 6], ['orbit', 4, 7, 2.4, 0], ['orbit', 6, 9, 3.6, 1],
  ['orbit', 7, 8, 2.8, 5], ['orbit', 9, 10, 3.2, 0], ['orbit', 11, 9, 4.0, 6], ['orbit', 3, 8, 3.4, 0],
  ['cross', 0, 4, 0, 4], ['cross', 1, 8, 0, 4], ['cross', 5, 4, 0, 4], ['cross', 6, 8, 0.4, 4],
  ['cross', 10, 4, 0, 4], ['cross', 11, 8, 0.8, 4], ['cross', 2, 8, 0, 4], ['cross', 8, 4, 0, 4],
  ['shards', 0, 8, 2.0, 2], ['shards', 2, 10, 3.0, 2], ['shards', 5, 9, 2.4, 2], ['shards', 8, 7, 1.8, 2],
  ['shards', 9, 11, 3.4, 2], ['shards', 10, 8, 2.6, 2], ['shards', 11, 9, 2.2, 2], ['shards', 3, 10, 2.8, 2],
  ['petals', 1, 10, 1.2, 2], ['petals', 3, 12, 1.6, 0], ['petals', 4, 8, 1.0, 6], ['petals', 7, 14, 1.8, 2],
  ['petals', 8, 10, 1.4, 3], ['petals', 9, 12, 1.5, 1], ['petals', 2, 9, 1.3, 0], ['petals', 5, 11, 1.7, 4],
  ['bolts', 0, 5, 1.4, 4], ['bolts', 4, 6, 1.8, 4], ['bolts', 6, 5, 2.2, 4], ['bolts', 9, 7, 1.2, 4],
  ['bolts', 11, 6, 2.0, 4], ['bolts', 10, 5, 1.6, 4], ['bolts', 5, 6, 1.5, 4], ['bolts', 2, 7, 1.9, 4],
  ['squares', 0, 3, 0.8, 1], ['squares', 2, 4, 1.2, 1], ['squares', 5, 3, 0.6, 1], ['squares', 6, 4, 1.6, 1],
  ['squares', 8, 3, 0.4, 1], ['squares', 11, 4, 1.0, 1], ['squares', 9, 3, 1.4, 1], ['squares', 3, 4, 0.9, 1],
  ['rise', 1, 12, 1.0, 0], ['rise', 4, 14, 1.5, 6], ['rise', 6, 10, 1.2, 5], ['rise', 8, 13, 0.8, 3],
  ['rise', 9, 11, 1.4, 0], ['rise', 0, 12, 1.1, 1], ['rise', 10, 10, 0.9, 0], ['rise', 2, 14, 1.3, 2],
  ['converge', 0, 10, 2.0, 0], ['converge', 2, 12, 2.6, 6], ['converge', 5, 9, 1.8, 1], ['converge', 7, 11, 2.2, 0],
  ['converge', 10, 10, 2.4, 5], ['converge', 11, 8, 1.6, 0], ['converge', 1, 12, 2.1, 4], ['converge', 4, 9, 1.9, 0],
  ['waves', 3, 4, 1.0, 4], ['waves', 4, 5, 1.4, 4], ['waves', 6, 4, 0.8, 4], ['waves', 8, 5, 1.2, 4],
  ['spinStar', 0, 5, 3.0, 6], ['spinStar', 2, 6, 4.0, 6], ['spinStar', 5, 5, 2.6, 6], ['spinStar', 7, 6, 3.4, 6],
];

const BASE_SPAN: Record<Arch, number> = {
  burst: 0.44, rings: 0.5, spiral: 0.55, rain: 0.6, orbit: 0.55, cross: 0.34,
  shards: 0.48, petals: 0.62, bolts: 0.36, squares: 0.46, rise: 0.6,
  converge: 0.5, waves: 0.54, spinStar: 0.56,
};

const SPECS: Spec[] = RAW.map(([arch, pal, count, twist, shape], i) => ({
  arch,
  pal,
  count,
  twist,
  shape,
  span: BASE_SPAN[arch] * (0.9 + ((i % 5) * 0.05)),
}));

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
          particle(g, shape, f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist, (4.5 * (1 - t) + 1.5) * size, k % 2 ? pal.c1 : pal.c2, a * 0.9);
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
          particle(g, shape, f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist, (3.6 * (1 - t) + 1.2) * size, k % 3 ? pal.c1 : pal.c2, a * 0.9);
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
          const px = f.x + Math.cos(ang) * spread + Math.sin(t * twist * 5 + k) * 6 * size;
          const py = f.y + Math.sin(ang) * spread * 0.3 - lift;
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
const SUFFIX = ['', '·贰', '·叁', '·肆', '·伍', '·陆'];

export const PLUS_PAINTERS: Record<PlusEffectId, EffectPainter> = {};
export const PLUS_SPAN: Record<PlusEffectId, number> = {};
export const PLUS_META: { id: PlusEffectId; label: string }[] = [];
const usedLabels = new Map<string, number>();

SPECS.forEach((spec, i) => {
  const id = `p${i + 1}` as PlusEffectId;
  PLUS_PAINTERS[id] = makePainter(spec);
  PLUS_SPAN[id] = spec.span;

  const base = `${PALETTES[spec.pal].cn}${ARCH_CN[spec.arch]}`;
  const n = usedLabels.get(base) ?? 0;
  usedLabels.set(base, n + 1);
  PLUS_META.push({ id, label: n < SUFFIX.length ? `${base}${SUFFIX[n]}` : `${base}·${n + 1}` });
});
