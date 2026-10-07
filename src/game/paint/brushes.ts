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
 * 变宽容带：沿轨迹两侧按法线偏移出**一个多边形**一次填满（宽度逐点给），再接首尾圆头。
 *
 * 逐段 `lineBetween` 拼出来的粗线在每个采样点都会留下接缝（画出来是一串圆弧/珠链），
 * 而且每段都是一条独立绘制指令——几十笔之后手机上就拖不动了。单次填充既没有接缝，
 * 又只是一次填充调用（顶点数远小于逐段）。
 */
function varBand(
  g: Phaser.GameObjects.Graphics,
  pts: readonly TrailPoint[],
  wAt: (i: number) => number,
  color: number,
  alpha: number,
): void {
  const n = pts.length;
  if (n < 2) return;

  // 每个采样点的法线（用前后两点求切向）
  const nxs = new Array<number>(n);
  const nys = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    nxs[i] = -dy / len;
    nys[i] = dx / len;
  }

  /**
   * 该不该在这里**把笔画切成两段**（只有这两种情况多边形才会自交、糊成一大块）：
   * - 回勾 / 掉头（转角 > ~110°）：左右岸会交叉；
   * - 宽笔在小半径上打圈（点的间距远小于笔宽，且本身在转弯）。
   * 普通笔画（哪怕笔很粗、点很密）都不切，否则会画成一串珠子。
   */
  const split = new Array<boolean>(n).fill(false);
  for (let i = 1; i < n - 1; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const d1x = p1.x - p0.x;
    const d1y = p1.y - p0.y;
    const d2x = p2.x - p1.x;
    const d2y = p2.y - p1.y;
    const l1 = Math.hypot(d1x, d1y) || 1;
    const l2 = Math.hypot(d2x, d2y) || 1;
    const cos = (d1x * d2x + d1y * d2y) / (l1 * l2);
    split[i] = cos < -0.3 || (cos < 0.5 && Math.min(l1, l2) < wAt(i) * 0.4);
  }

  const fillRun = (a: number, b: number): void => {
    if (b <= a) return;
    const left: TrailPoint[] = [];
    const right: TrailPoint[] = [];
    for (let i = a; i <= b; i++) {
      const h = wAt(i) / 2;
      left.push({ x: pts[i].x + nxs[i] * h, y: pts[i].y + nys[i] * h });
      right.push({ x: pts[i].x - nxs[i] * h, y: pts[i].y - nys[i] * h });
    }
    g.fillStyle(color, alpha);
    // 一段一个封闭多边形：左岸去 + 右岸回（Phaser 的 fillPoints 要 as never）
    g.fillPoints([...left, ...right.reverse()] as never, true);
    // 两端的圆头（断点处相当于圆角接头，不会有尖角）
    g.fillCircle(pts[a].x, pts[a].y, Math.max(0.8, wAt(a) / 2));
    g.fillCircle(pts[b].x, pts[b].y, Math.max(0.8, wAt(b) / 2));
  };

  let start = 0;
  for (let i = 1; i < n; i++) {
    if (!split[i] && i !== n - 1) continue;
    fillRun(start, i);
    if (split[i]) {
      g.fillStyle(color, alpha);
      g.fillCircle(pts[i].x, pts[i].y, Math.max(0.8, wAt(i) / 2));
    }
    start = i;
  }
}

/** 等宽带（band 的常见情形） */
function band(
  g: Phaser.GameObjects.Graphics,
  pts: readonly TrailPoint[],
  w: number,
  color: number,
  alpha: number,
): void {
  varBand(g, pts, () => w, color, alpha);
}

/** 毛笔：按采样点间距（≈落笔速度）变粗细——画得快就细，顿住就粗（单次填充） */
function taper(
  g: Phaser.GameObjects.Graphics,
  pts: readonly TrailPoint[],
  color: number,
  size: number,
): void {
  const max = Math.max(4, 17 * size);
  const min = Math.max(1.6, 3.4 * size);
  const wAt = (i: number): number => {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const d = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    return Math.max(min, Math.min(max, (17 - d * 1.15) * size));
  };
  varBand(g, pts, wAt, color, 0.95);
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
  // 雾点别太密：手机上每笔几百个圆点是实打实的开销
  const count = Math.round(4 * Math.min(1.8, Math.max(0.6, size)));
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
  // 外光带：由细到粗的一整条（单次填充，不是逐段画线）
  varBand(g, pts, (i) => 2 + (i / (n - 1)) * 7 * weight, color, 0.16 * weight);
  // 内白芯：只铺靠笔尖那一段，细一点、亮一点
  const from = Math.floor(n * 0.35);
  if (n - from >= 2) {
    const tail = pts.slice(from);
    const m = tail.length;
    varBand(g, tail, (i) => 0.8 + (i / (m - 1)) * 1.8, 0xffffff, 0.3 * weight);
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
