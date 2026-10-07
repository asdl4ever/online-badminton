import type Phaser from 'phaser';
import type { TrailPoint } from '../draw/trails';

/**
 * 画笔类型。每支笔的「实体笔迹」不同，**挥拍拖尾特效都照常叠在上面**
 * （拖尾来自玩家装备的 `trailStyle`，见 `draw/drawShuttleTrail`）。
 */
export type BrushId = 'marker' | 'pencil' | 'highlighter' | 'spray' | 'brush' | 'eraser';

export interface BrushDef {
  id: BrushId;
  /** 工具条上的名字 */
  label: string;
  icon: string;
  /** 拖尾特效的浓淡（橡皮不画） */
  trail: number;
}

export const BRUSHES: BrushDef[] = [
  { id: 'marker', label: '马克笔', icon: '🖊', trail: 1 },
  { id: 'pencil', label: '铅笔', icon: '✏️', trail: 0.7 },
  { id: 'highlighter', label: '荧光笔', icon: '🖍', trail: 0.75 },
  { id: 'spray', label: '喷雾', icon: '💨', trail: 0.6 },
  { id: 'brush', label: '毛笔', icon: '🖌', trail: 1 },
  { id: 'eraser', label: '橡皮', icon: '🧽', trail: 0 },
];

/** 可以画的笔（橡皮不在其中：它是独立工具，见 `ERASER_R` 与画布上的橡皮逻辑） */
export const PAINT_BRUSHES: BrushDef[] = BRUSHES.filter((b) => b.id !== 'eraser');

export function brushById(id: string): BrushDef {
  return BRUSHES.find((b) => b.id === id) ?? BRUSHES[0];
}

/** 大小滑条的取值范围（百分比，100 = 标准粗细） */
export const SIZE_MIN = 40;
export const SIZE_MAX = 300;
export const SIZE_DEFAULT = 100;

/** 橡皮基准半径（画板坐标），实际半径 = 它 × 大小倍率 */
export const ERASER_R = 26;

/** 橡皮实际半径 */
export function eraserRadius(size: number): number {
  return Math.max(6, ERASER_R * size);
}

/**
 * 画一笔的「实体笔迹」（不含拖尾特效）。`pts` 是画板坐标的采样点链，
 * `size` 是大小滑条的倍率（1 = 标准）。
 */
export function drawBrushBody(
  g: Phaser.GameObjects.Graphics,
  brush: BrushId,
  color: number,
  pts: readonly TrailPoint[],
  now: number,
  size = 1,
): void {
  const n = pts.length;
  if (n < 2) return;
  switch (brush) {
    case 'marker':
      band(g, pts, Math.max(2, 10 * size), color, 1);
      break;
    case 'pencil':
      band(g, pts, Math.max(1.2, 2.6 * size), color, 0.85);
      break;
    case 'highlighter':
      // 半透明笔：单次填充，叠色才均匀
      band(g, pts, Math.max(3, 16 * size), color, 0.3);
      break;
    case 'brush':
      taper(g, pts, color, size);
      break;
    case 'spray':
      spray(g, pts, color, now, size);
      break;
    default:
      // 橡皮：不画东西（擦除逻辑在 PaintScene 里）
      break;
  }
}

/**
 * 等宽实心带：沿轨迹两侧按法线偏移出一个**整条多边形**一次填满，
 * 再接首尾圆头。
 *
 * 逐段 `lineBetween` 拼出来的粗线在每个采样点都会留下接缝（画出来是一串圆弧/珠链），
 * 所以这里改成单次填充——半透明笔也不会因为叠画而深一块浅一块。
 */
function band(
  g: Phaser.GameObjects.Graphics,
  pts: readonly TrailPoint[],
  w: number,
  color: number,
  alpha: number,
): void {
  const n = pts.length;
  const half = w / 2;
  const left: { x: number; y: number }[] = [];
  const right: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    left.push({ x: p.x + nx * half, y: p.y + ny * half });
    right.push({ x: p.x - nx * half, y: p.y - ny * half });
  }
  g.fillStyle(color, alpha);
  // 一个封闭多边形：左岸去 + 右岸回（Phaser 的 fillPoints 要 as never）
  g.fillPoints([...left, ...right.reverse()] as never, true);
  // 首尾圆头（各处只叠一次，不会形成串珠）
  g.fillCircle(pts[0].x, pts[0].y, half);
  g.fillCircle(pts[n - 1].x, pts[n - 1].y, half);
}

/** 毛笔：按采样点间距（≈落笔速度）变粗细——画得快就细，顿住就粗 */
function taper(
  g: Phaser.GameObjects.Graphics,
  pts: readonly TrailPoint[],
  color: number,
  size: number,
): void {
  const max = Math.max(4, 17 * size);
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const d = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const w = Math.max(Math.max(1.6, 3.4 * size), Math.min(max, (17 - d * 1.15) * size));
    g.lineStyle(w, color, 0.95);
    g.lineBetween(p0.x, p0.y, p1.x, p1.y);
    g.fillStyle(color, 0.95);
    g.fillCircle(p1.x, p1.y, w / 2);
  }
}

/** 喷雾：沿轨迹撒点（用坐标做伪随机，重画时不会闪）；大小 = 喷幅与雾点大小 */
function spray(
  g: Phaser.GameObjects.Graphics,
  pts: readonly TrailPoint[],
  color: number,
  now: number,
  size: number,
): void {
  const spread = 3 + 15 * size;
  const count = Math.round(7 * Math.min(2, Math.max(0.6, size)));
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    for (let k = 0; k < count; k++) {
      const a = rnd(i * 31 + k * 17) * Math.PI * 2;
      const r = (0.2 + rnd(i * 13 + k * 7)) * spread;
      const rr = (0.9 + rnd(i * 5 + k * 3) * 1.5) * Math.max(0.7, Math.min(2, size));
      g.fillStyle(color, 0.28 + 0.35 * rnd(i + k * 11));
      g.fillCircle(p.x + Math.cos(a + now / 9000) * r, p.y + Math.sin(a) * r, rr);
      void now;
    }
  }
}

/** 0~1 的伪随机（同一个种子永远同一个值） */
function rnd(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * 画板用的「挥拍拖尾」：沿笔迹铺一条**平滑光带**（尾细头粗、尾淡头亮）+ 笔尖一个亮核。
 *
 * 对局里的击球拖尾是**逐点盖章**（每个采样点画一个圆），在球场上看不出来，
 * 但拿来当笔迹就是一串圆圈——所以画板不用它：
 * 整条轨迹画法的主题拖尾（`drawTrailCustom`）本来就是沿路径成形的，直接沿用；
 * 老款逐点画法换成这里的光带，既保留拖尾的观感，笔迹又是干净的一笔。
 */
export function drawPaintTrail(
  g: Phaser.GameObjects.Graphics,
  pts: readonly TrailPoint[],
  color: number,
  weight: number,
  now: number,
): void {
  const n = pts.length;
  if (n < 2 || weight <= 0) return;
  // 外光带
  for (let i = 1; i < n; i++) {
    const f = i / (n - 1);
    g.lineStyle(2 + f * 7 * weight, color, (0.09 + f * 0.3) * weight);
    g.lineBetween(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
  }
  // 内白芯（靠笔尖那一段才亮）
  for (let i = 1; i < n; i++) {
    const f = i / (n - 1);
    if (f < 0.35) continue;
    g.lineStyle(0.8 + f * 1.6, 0xffffff, (f - 0.35) * 0.55 * weight);
    g.lineBetween(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
  }
  // 笔尖亮核：整笔只有这一处是圆的（画的时候就是跟着手走的光点）
  const head = pts[n - 1];
  const pulse = 0.85 + 0.15 * Math.sin(now / 220);
  g.fillStyle(color, 0.22 * weight);
  g.fillCircle(head.x, head.y, 9 * pulse);
  g.fillStyle(color, 0.5 * weight);
  g.fillCircle(head.x, head.y, 4.2);
  g.fillStyle(0xffffff, 0.7 * weight);
  g.fillCircle(head.x, head.y, 1.9);
}
