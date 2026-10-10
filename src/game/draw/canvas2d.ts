import type Phaser from 'phaser';
import { PLAYER_H, SHOULDER_DX, SHOULDER_DY } from '../constants';
import { FONT_EMOJI, P } from '../theme';
import { TRAIL_COLORS, type Cosmetic, type TrailId } from '../cosmetics';
import { EFFECT_PAINTERS, paintDefault, type HitFlash } from '../effects';
import type { FaceSink } from './character';
import type { ItemSlot } from '../items';
import type { SwingSample } from '../racket';
import { drawRigGraphics } from './rig';
import { drawShuttleTrail } from './trails';

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
export const REST_RACKET = { rx: 44, ry: -58 };

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

  /** 主题翅膀的镜像（scale(-1,1)）依赖它——之前 DOM 适配层忽略它导致图标里只剩一只右翼 */
  scaleCanvas(sx: number, sy: number): void {
    this.ctx.scale(sx, sy);
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

/**
 * 表情文字的 Canvas 版 FaceSink：drawCharacter 在「身体之后、帽子之前」调用
 * `setVisible(true)`，我们就在那一刻把 emoji 直接画上去——绘制顺序与 Phaser
 * 场景的「身体(2) → 头(3) → 帽子/宠物(4)」完全一致，不再有头压住帽子的差异。
 */
class CanvasFace implements FaceSink {
  text = '';
  x = 0;
  y = 0;
  visible = false;

  private readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setText(value: string): void {
    this.text = value;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  setVisible(value: boolean): void {
    this.visible = value;
    if (value && this.text) {
      const ctx = this.ctx;
      ctx.font = `34px ${FONT_EMOJI}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(this.text, this.x, this.y);
    }
  }
}

export interface AvatarPaintOptions {
  /** 1 = 与游戏里一样大（PLAYER_H 像素高） */
  scale?: number;
  facing?: 1 | -1;
  /** 身体颜色，默认和游戏里的 1 号位一样 */
  color?: number;
  /**
   * 拍头相对肩膀的偏移（「朝右」坐标系，内部按 facing 翻转）。
   * 不传就是地图上的默认姿势 `REST_RACKET`；大世界的右摇杆就在动它。
   */
  racket?: { rx: number; ry: number };
  /** 不画球拍（健身房这类「手上不拿拍」的场合），手臂姿势仍由 `racket` 决定 */
  noRacket?: boolean;
  /** 在手上画一副哑铃（举重） */
  dumbbell?: boolean;
  /** 挥拍速度（比赛同款量纲，`RacketTracker` 的 rvx/rvy 合成）——>0 时沿轨迹画挥拍拖尾 */
  swingSpeed?: number;
  /** 拍头最近的真实轨迹（`RacketTracker.path.pts`，肩部相对坐标） */
  swingPath?: readonly SwingSample[];
}

/** 哑铃：一根横杆 + 两端配重片（举重时画在手上） */
function drawDumbbell(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#3a4048';
  ctx.fillRect(-17, -3, 34, 6);
  for (const dx of [-20, 12]) {
    ctx.fillStyle = '#e0a13a';
    ctx.fillRect(dx, -11, 8, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(dx + 1, -9, 2, 18);
  }
  ctx.restore();
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
  const face = new CanvasFace(ctx);
  const racket = opts.racket ?? REST_RACKET;
  const hand = drawRigGraphics(
    asGraphics(ctx),
    now,
    cos,
    { x: PAD_X, feetY: PLAYER_H + PAD_TOP, facing, color: opts.color ?? P.player0 },
    racket.rx * facing,
    racket.ry,
    opts.swingSpeed ?? 0,
    0,
    face,
    null,
    opts.swingPath,
    opts.noRacket,
  );
  // 举重：哑铃画在刚才那只手的位置上
  if (opts.dumbbell) drawDumbbell(ctx, hand.head.x, hand.head.y);
}

/* ============================================================================
 * 试穿预览的「小舞台」：让角色挥拍 + 羽毛球飞过，
 * 用来演示那些**只在动作里才看得见**的部位（击球拖尾 / 挥拍拖尾 / 命中特效）。
 * 用的都是球场上的同一份画法（`drawRigGraphics` 的挥拍轨迹、`trails.ts` 的拖尾、
 * `effects/` 的命中特效），所以预览里看到的就是游戏里的样子。
 * ==========================================================================*/

/** 舞台的逻辑尺寸（1 单位 = 游戏里的 1px；角色高 PLAYER_H = 108） */
const DEMO_W = 260;
const DEMO_H = 200;
/** 一整段演示的时长（毫秒）：球飞进来 → 挥拍命中 → 球被打回去 */
const DEMO_MS = 1100;
/** 命中的时刻（占一整段的比例）：球与拍头在这里相遇，特效也在这儿炸 */
const DEMO_HIT_U = 0.5;
/** 角色站的位置（脚底）与肩部（拍头的原点，和 `rig.ts` 里那套一致） */
const DEMO_FEET_X = 200;
const DEMO_FEET_Y = 190;
const DEMO_SHOULDER = {
  x: DEMO_FEET_X - SHOULDER_DX,
  y: DEMO_FEET_Y - PLAYER_H * SHOULDER_DY,
};

/**
 * 挥拍：**一圈一圈地抡**，不是抡一下就停——挥拍拖尾只认
 * `TRAIL_MIN_SPEED` 以上的采样点、而且只留最近 0.32 秒（见 `rig.ts`），
 * 慢慢摆一下根本看不见形状。这一圈的线速度约 430px/s，能一直挂着拖尾。
 * 椭圆中心在身前（负 rx 一侧），所以这一圈整个都在角色面前抡。
 */
const DEMO_ANG0 = 0.6;
/** 一段演示里抡几圈（球一轮、拍一圈半，拖尾才够快够亮） */
const DEMO_TURNS = 1.5;
function demoRacket(u: number): { rx: number; ry: number } {
  const ang = DEMO_ANG0 + u * Math.PI * 2 * DEMO_TURNS;
  return { rx: -70 + Math.cos(ang) * 52, ry: -25 + Math.sin(ang) * 64 };
}

/** 命中点 = 命中那一刻拍头所在的位置（球就往这儿飞） */
const DEMO_HIT_OFF = demoRacket(DEMO_HIT_U);
const DEMO_HIT = {
  x: DEMO_SHOULDER.x + DEMO_HIT_OFF.rx,
  y: DEMO_SHOULDER.y + DEMO_HIT_OFF.ry,
};

/** 这一刻球在哪（不在场上就返回 null）：从左边飞进来，被拍中后飞回左上 */
function demoShuttle(u: number): { x: number; y: number } | null {
  if (u <= DEMO_HIT_U) {
    // 飞进来：带一点弧线
    const k = u / DEMO_HIT_U;
    const x = -24 + (DEMO_HIT.x + 24) * k;
    const y = 34 + (DEMO_HIT.y - 34) * k - Math.sin(k * Math.PI) * 24;
    return { x, y };
  }
  if (u <= 0.82) {
    // 被打回去：飞向左上、越飞越快
    const k = (u - DEMO_HIT_U) / (0.82 - DEMO_HIT_U);
    const x = DEMO_HIT.x + (-40 - DEMO_HIT.x) * k * k;
    const y = DEMO_HIT.y + (0 - DEMO_HIT.y) * k * (0.4 + 0.6 * k);
    return { x, y };
  }
  return null;
}

/** 舞台上的羽毛球（球头在前、羽毛在后） */
function drawDemoShuttle(g: Phaser.GameObjects.Graphics, x: number, y: number, vx: number, vy: number): void {
  const ang = Math.atan2(vy, vx) || 0;
  const nx = -Math.sin(ang);
  const ny = Math.cos(ang);
  const bx = x - Math.cos(ang) * 15;
  const by = y - Math.sin(ang) * 15;
  // 光圈
  g.fillStyle(0xffffff, 0.45);
  g.fillCircle(x, y, 9);
  // 裙羽
  g.fillStyle(0xf2f5fa, 0.95);
  g.fillTriangle(x, y, bx + nx * 10, by + ny * 10, bx - nx * 10, by - ny * 10);
  g.fillStyle(0xdfe6f0, 0.9);
  g.fillTriangle(x, y, bx + nx * 8, by + ny * 8, bx, by + 4);
  // 球头
  g.fillStyle(0xfdfaf2, 1);
  g.fillCircle(x, y, 4.2);
  g.fillStyle(0xffffff, 0.8);
  g.fillCircle(x - 1, y - 1, 1.6);
}

/**
 * 试穿预览的小舞台：**角色挥着拍、一颗羽毛球从面前飞过**，
 * 于是「挥拍拖尾」（拍头真实轨迹）、「击球拖尾」（球身后的那一路）与
 * 「命中特效」（拍球那一瞬间）都看得见。
 *
 * `focus` 决定演哪一出：
 * - `swingTrail`：只演挥拍（不加球，免得抢戏）；
 * - `trail`：演球飞过 + 身后拖尾；
 * - `effect`：命中那一刻再加爆一下特效。
 */
export function paintActionPreview(
  canvas: HTMLCanvasElement,
  cos: Cosmetic,
  now: number,
  focus: ItemSlot = 'effect',
): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const bw = Math.round(DEMO_W * dpr);
  const bh = Math.round(DEMO_H * dpr);
  if (canvas.width !== bw) canvas.width = bw;
  if (canvas.height !== bh) canvas.height = bh;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, DEMO_W, DEMO_H);
  const g = asGraphics(ctx);

  // ---- 背景：一块浅色地面 + 天光，让拖尾与特效看得清 ----
  ctx.fillStyle = '#f7f9fd';
  ctx.fillRect(0, 0, DEMO_W, DEMO_H);
  ctx.fillStyle = '#e9eef7';
  ctx.fillRect(0, DEMO_FEET_Y - 6, DEMO_W, DEMO_H - DEMO_FEET_Y + 6);
  ctx.fillStyle = 'rgba(120, 140, 170, 0.18)';
  ctx.fillRect(0, DEMO_FEET_Y - 6, DEMO_W, 2);

  // ---- 这一段的进度（0~1，循环）----
  const cycle = (now % DEMO_MS + DEMO_MS) % DEMO_MS;
  const u = cycle / DEMO_MS;

  // ---- 拍头轨迹：把最近 0.3 秒的拍头位置采样出来（和游戏里 SwingPath 一个口径）----
  const path: SwingSample[] = [];
  let prev: { rx: number; ry: number } | null = null;
  for (let back = 0.3; back >= -1e-6; back -= 0.02) {
    const tSec = now / 1000 - back;
    const uu = ((tSec * 1000) % DEMO_MS + DEMO_MS) % DEMO_MS / DEMO_MS;
    const r = demoRacket(uu);
    const s = prev ? Math.hypot(r.rx - prev.rx, r.ry - prev.ry) / 0.02 : 0;
    path.push({ rx: r.rx, ry: r.ry, s, t: tSec });
    prev = r;
  }
  const cur = path[path.length - 1];
  const speed = cur.s;

  // ---- 球身后的拖尾（先用它，再画球，最后画角色）----
  const showShuttle = focus !== 'swingTrail';
  const trailPts: { x: number; y: number }[] = [];
  if (showShuttle) {
    for (let back = 0.3; back >= 0; back -= 0.02) {
      const uu = ((now - back * 1000) % DEMO_MS + DEMO_MS) % DEMO_MS / DEMO_MS;
      const s = demoShuttle(uu);
      if (s) trailPts.push(s);
    }
  }
  if (trailPts.length >= 2) {
    const style = cos.trailStyle as TrailId;
    const base = TRAIL_COLORS[style] ?? cos.trail;
    drawShuttleTrail(g, style, trailPts, 1, now, base);
  }

  // ---- 角色（面朝左边，正对着飞来的球）----
  const face = new CanvasFace(ctx);
  drawRigGraphics(
    g,
    now,
    cos,
    { x: DEMO_FEET_X, feetY: DEMO_FEET_Y, facing: -1, color: P.player0 },
    cur.rx,
    cur.ry,
    speed,
    0,
    face,
    null,
    path,
    false,
  );

  // ---- 球 ----
  const shuttle = showShuttle ? demoShuttle(u) : null;
  if (shuttle) {
    const ahead = demoShuttle(Math.min(0.999, u + 0.01));
    drawDemoShuttle(
      g,
      shuttle.x,
      shuttle.y,
      (ahead?.x ?? shuttle.x) - shuttle.x,
      (ahead?.y ?? shuttle.y) - shuttle.y,
    );
  }

  // ---- 命中特效：拍中后的一小段里炸一下 ----
  if (focus === 'effect' && u > DEMO_HIT_U) {
    const t = Math.min(1, (u - DEMO_HIT_U) / 0.3);
    const flash: HitFlash = {
      x: DEMO_HIT.x,
      y: DEMO_HIT.y,
      life: t,
      ang: -0.7,
      style: cos.effect,
      color: 0xffd45c,
      power: 1,
      seed: 11,
    };
    // size 放大一点：这是给人「看清楚」用的演示，不是对局里的那一颗球
    (EFFECT_PAINTERS[flash.style] ?? paintDefault)(g, flash, t, 1 - t, 1.6);
  }
}
