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

/** 画板底色：半透明笔靠「预混纸色」来表现，而不是靠 alpha */
const PAPER = 0xf7f3e8;

/**
 * 把颜色按透明度**预混到纸色**上：得到「看着半透明、画起来是实色」的颜色。
 *
 * 为什么不直接用 alpha：同一笔要逐段描边（每段一次绘制），半透明会每段各混合一次，
 * 密集涂鸦里就叠出一张"线框网"、断点上还会冒出一串圆点。预混成实色后，
 * 重叠部分颜色完全一致，永远不会叠深、也不会串珠。
 */
function blend(color: number, a: number): number {
  const t = Math.max(0, Math.min(1, a));
  const ch = (shift: number): number =>
    Math.round((((PAPER >> shift) & 255) * (1 - t) + ((color >> shift) & 255) * t) * 1);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

/**
 * **沿手指轨迹描一条带子**：逐段画粗线（宽度逐点给）+ 每个采样点补一个圆头当圆角接头。
 *
 * 全程 alpha = 1，所以：不会叠深、不会串珠、更不会有自交面片——
 * 画出来就是你手指滑过的那条路径，宽一点而已。
 */
function trace(
  g: Phaser.GameObjects.Graphics,
  pts: readonly TrailPoint[],
  wAt: (i: number) => number,
  color: number,
): void {
  const n = pts.length;
  if (n < 2) return;
  for (let i = 1; i < n; i++) {
    const w = Math.max(0.6, (wAt(i - 1) + wAt(i)) / 2);
    g.lineStyle(w, color, 1);
    g.lineBetween(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
  }
  g.fillStyle(color, 1);
  for (let i = 0; i < n; i++) g.fillCircle(pts[i].x, pts[i].y, Math.max(0.3, wAt(i) / 2));
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
      trace(g, pts, () => Math.max(2, 10 * size), color);
      break;
    case 'pencil':
      trace(g, pts, () => Math.max(1.2, 2.6 * size), color);
      break;
    case 'highlighter':
      // 半透明观感 → 用预混色画实心（逐段描边不会叠深）
      trace(g, pts, () => Math.max(3, 16 * size), blend(color, 0.32));
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

/** 毛笔：按采样点间距（≈落笔速度）变粗细——画得快就细，顿住就粗 */
function taper(
  g: Phaser.GameObjects.Graphics,
  pts: readonly TrailPoint[],
  color: number,
  size: number,
): void {
  const max = Math.max(4, 17 * size);
  const min = Math.max(1.6, 3.4 * size);
  trace(
    g,
    pts,
    (i) => {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const d = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      return Math.max(min, Math.min(max, (17 - d * 1.15) * size));
    },
    color,
  );
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
      // 雾点也用预混实色：重叠的雾点不会越叠越黑
      g.fillStyle(blend(color, 0.45 + 0.4 * rnd(i + k * 11)), 1);
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
 * 画板用的「挥拍拖尾」——**贴着笔画的一圈光晕**（垫在笔迹下面）。
 *
 * 同样是沿轨迹描边（不是飘带、不是面片）：两圈预混实色的宽带叠出柔和边缘，
 * 重叠处颜色一致，所以随便怎么乱画都只是"笔画边缘发光"，不会糊成线框。
 */
export function drawPaintGlow(
  g: Phaser.GameObjects.Graphics,
  pts: readonly TrailPoint[],
  color: number,
  /** 笔画本体宽度（光晕比它宽一圈） */
  bodyW: number,
  weight: number,
): void {
  if (pts.length < 2 || weight <= 0 || bodyW <= 0) return;
  // 外圈更淡更宽、内圈稍浓 → 一圈柔和的发光边
  trace(g, pts, () => bodyW * 1.75 + 5, blend(color, 0.1 * weight));
  trace(g, pts, () => bodyW * 1.3 + 2.5, blend(color, 0.18 * weight));
}

/** 笔尖亮核（画的时候跟着手走的光点） */
export function drawPaintTip(
  g: Phaser.GameObjects.Graphics,
  pts: readonly TrailPoint[],
  color: number,
  weight: number,
  now: number,
): void {
  const n = pts.length;
  if (n < 2 || weight <= 0) return;
  const head = pts[n - 1];
  const pulse = 0.85 + 0.15 * Math.sin(now / 220);
  g.fillStyle(blend(color, 0.3 * weight), 1);
  g.fillCircle(head.x, head.y, 9 * pulse);
  g.fillStyle(blend(color, 0.65 * weight), 1);
  g.fillCircle(head.x, head.y, 4.2);
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(head.x, head.y, 1.9);
}

/** 笔画的**本体宽度**（光晕按它算；喷雾没有实体带 → 0） */
export function bodyWidth(brush: BrushId, size: number): number {
  switch (brush) {
    case 'marker':
      return Math.max(2, 10 * size);
    case 'pencil':
      return Math.max(1.2, 2.6 * size);
    case 'highlighter':
      return Math.max(3, 16 * size);
    case 'brush':
      return Math.max(4, 17 * size);
    default:
      return 0;
  }
}
