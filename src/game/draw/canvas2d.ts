import type Phaser from 'phaser';
import { PLAYER_H } from '../constants';
import { FONT_EMOJI, P } from '../theme';
import type { Cosmetic } from '../cosmetics';
import type { FaceSink } from './character';
import { drawRigGraphics } from './rig';

/**
 * 把 `draw/rig.ts` 的角色画到一个普通 `<canvas>` 上（DOM 界面用，比如大地图）。
 *
 * 为什么不重写一份画法：装扮（哥斯拉、光环、翅膀、披风、头饰、宠物、球拍皮肤…）
 * 全部只在 `drawCharacter` 里实现一次，游戏场景与网页界面共用同一份代码，才不会
 * 出现「背包里是这个样子、地图上是另一个样子」。
 *
 * 做法是给 Phaser.GameObjects.Graphics 写一个 Canvas2D 适配层：绘制代码只用到
 * 十几个指令，逐条映射即可；遇到没用到的指令一律忽略（Proxy 兜底），以后给角色
 * 加新的绘制调用也不会在这里崩掉。
 */

const TAU = Math.PI * 2;

/** 角色包围盒（角色坐标系，脚为原点上方 PLAYER_H）：给翅膀 / 尾巴 / 光环 / 举起的球拍留余量 */
const PAD_X = 88;
const PAD_TOP = 74;
const PAD_BOTTOM = 10;
/** 地图上的持拍姿势：球拍斜举在身前（rx 随朝向翻转） */
const REST_RACKET = { rx: 44, ry: -58 };

/** 头像盒子的 CSS 尺寸（角色高 PLAYER_H 乘 scale） */
export function avatarBoxSize(scale = 1): { w: number; h: number } {
  return {
    w: Math.round((PAD_X * 2) * scale),
    h: Math.round((PLAYER_H + PAD_TOP + PAD_BOTTOM) * scale),
  };
}

/** 脚在盒子底部往上 PAD_BOTTOM 的位置，用它把盒子的锚点对齐到角色脚下 */
export const AVATAR_FEET_PAD = PAD_BOTTOM;

function rgba(color: number, alpha: number): string {
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** character.ts 用到的 Graphics 子集，落到 CanvasRenderingContext2D 上 */
class Graphics2D {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  // --- 状态 ---------------------------------------------------------------
  fillStyle(color: number, alpha = 1): void {
    this.ctx.fillStyle = rgba(color, alpha);
  }

  lineStyle(width: number, color: number, alpha = 1): void {
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = rgba(color, alpha);
  }

  save(): void {
    this.ctx.save();
  }

  restore(): void {
    this.ctx.restore();
  }

  translateCanvas(x: number, y: number): void {
    this.ctx.translate(x, y);
  }

  rotateCanvas(rad: number): void {
    this.ctx.rotate(rad);
  }

  // --- 实心形状 -----------------------------------------------------------
  fillRect(x: number, y: number, w: number, h: number): void {
    this.ctx.fillRect(x, y, w, h);
  }

  fillRoundedRect(x: number, y: number, w: number, h: number, r = 0): void {
    const ctx = this.ctx;
    const rad = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.arcTo(x + w, y, x + w, y + rad, rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.arcTo(x + w, y + h, x + w - rad, y + h, rad);
    ctx.lineTo(x + rad, y + h);
    ctx.arcTo(x, y + h, x, y + h - rad, rad);
    ctx.lineTo(x, y + rad);
    ctx.arcTo(x, y, x + rad, y, rad);
    ctx.closePath();
    ctx.fill();
  }

  fillCircle(x: number, y: number, r: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0, r), 0, TAU);
    ctx.fill();
  }

  fillEllipse(x: number, y: number, w: number, h: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0, w / 2), Math.max(0, h / 2), 0, 0, TAU);
    ctx.fill();
  }

  fillTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
  }

  fillPoints(points: Array<{ x: number; y: number }>, close = false): void {
    if (!points.length) return;
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    if (close) ctx.closePath();
    ctx.fill();
  }

  // --- 路径 ---------------------------------------------------------------
  beginPath(): void {
    this.ctx.beginPath();
  }

  moveTo(x: number, y: number): void {
    this.ctx.moveTo(x, y);
  }

  lineTo(x: number, y: number): void {
    this.ctx.lineTo(x, y);
  }

  closePath(): void {
    this.ctx.closePath();
  }

  fillPath(): void {
    this.ctx.fill();
  }

  strokePath(): void {
    this.ctx.stroke();
  }

  arc(x: number, y: number, r: number, start: number, end: number): void {
    this.ctx.arc(x, y, Math.max(0, r), start, end);
  }

  // --- 描边形状 -----------------------------------------------------------
  lineBetween(x1: number, y1: number, x2: number, y2: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  strokeRect(x: number, y: number, w: number, h: number): void {
    this.ctx.strokeRect(x, y, w, h);
  }

  strokeCircle(x: number, y: number, r: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0, r), 0, TAU);
    ctx.stroke();
  }

  strokeEllipse(x: number, y: number, w: number, h: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0, w / 2), Math.max(0, h / 2), 0, 0, TAU);
    ctx.stroke();
  }
}

/** 未实现的 Graphics 方法一律变成空操作，避免以后加绘制指令时直接抛错 */
export function asGraphics(ctx: CanvasRenderingContext2D): Phaser.GameObjects.Graphics {
  const impl = new Graphics2D(ctx);
  return new Proxy(impl, {
    get(target, prop) {
      const v = (target as unknown as Record<string, unknown>)[prop as string];
      if (typeof v === 'function') {
        return (v as (...args: unknown[]) => unknown).bind(target);
      }
      if (v !== undefined) return v;
      return () => undefined;
    },
  }) as unknown as Phaser.GameObjects.Graphics;
}

/** 记录表情文字要去哪儿画（drawCharacter 通过这个接口驱动「头」） */
class CanvasFace implements FaceSink {
  text = '';
  x = 0;
  y = 0;
  visible = false;

  setText(value: string): void {
    this.text = value;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  setVisible(value: boolean): void {
    this.visible = value;
  }
}

export interface AvatarPaintOptions {
  /** 1 = 与游戏里一样大（PLAYER_H 像素高） */
  scale?: number;
  facing?: 1 | -1;
  /** 身体颜色，默认和游戏里的 1 号位一样 */
  color?: number;
}

/**
 * 把一个角色（含全部装扮）画进这张 canvas。
 *
 * 每帧调用即可：光环 / 披风 / 翅膀 / 宠物 都靠 `now` 驱动摆动，所以在地图上
 * 也是活的。`now` 用 `performance.now()` 之类的毫秒时间戳。
 */
export function paintAvatar(
  canvas: HTMLCanvasElement,
  cos: Cosmetic,
  now: number,
  opts: AvatarPaintOptions = {},
): void {
  const scale = opts.scale ?? 1;
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const box = avatarBoxSize(scale);
  const bw = Math.round(box.w * dpr);
  const bh = Math.round(box.h * dpr);
  // 尺寸没变就不重设（重设会清空并让浏览器重建缓冲）
  if (canvas.width !== bw) canvas.width = bw;
  if (canvas.height !== bh) canvas.height = bh;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const s = scale * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, bw, bh);
  // 之后所有坐标都用「角色单位」：脚在 (PAD_X, PLAYER_H + PAD_TOP)
  ctx.setTransform(s, 0, 0, s, 0, 0);

  const facing = opts.facing ?? 1;
  const face = new CanvasFace();
  drawRigGraphics(
    asGraphics(ctx),
    now,
    cos,
    { x: PAD_X, feetY: PLAYER_H + PAD_TOP, facing, color: opts.color ?? P.player0 },
    REST_RACKET.rx * facing,
    REST_RACKET.ry,
    0,
    0,
    face,
  );

  // 表情头和游戏里一样：34px 的 emoji，居中对齐在头上
  if (face.visible && face.text) {
    ctx.font = `34px ${FONT_EMOJI}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(face.text, face.x, face.y);
  }
}
