import Phaser from 'phaser';
import type { TrailId } from '../cosmetics';
import { drawShuttleTrail, type TrailPoint } from '../draw/trails';

/** 画板逻辑尺寸（联机双方坐标都是这套，不用换算） */
export const BOARD_W = 900;
export const BOARD_H = 560;

/** 调色板 */
export const PAINT_COLORS = [0x2a2a33, 0xe8404a, 0x2f7a4a, 0x4a90d9, 0xffb03a, 0xffffff];

export interface PaintSceneData {
  /** 复用「一间房」的联机链路（单机涂鸦时为 null） */
  session: import('../../net/link').NetLink | null;
  /** 我的击球拖尾风格：画笔特效直接复用它（挥拍拖尾那种视觉） */
  trailStyle: TrailId;
  /** 开局就放开画笔（单机自由涂鸦；联机时由回合流程控制） */
  editable: boolean;
  /** 本地画出新的一小段轨迹 → 页面转发给对方 */
  onChunk: (id: string, s: string, c: number, pts: number[], done: boolean) => void;
  /** 本地撤销了一笔 → 页面转发 */
  onUndo: () => void;
  /** 本地清空画板 → 页面转发 */
  onClear: () => void;
}

interface Stroke {
  id: string;
  style: TrailId;
  color: number;
  pts: TrailPoint[];
  done: boolean;
}

/**
 * 你画我猜的画板场景。
 *
 * 笔画视觉**完全复用击球拖尾**（`draw/drawShuttleTrail`）：每一笔就是一条采样点链，
 * 画家的拖尾风格（火焰 / 电弧 / 彩虹…）直接长在笔迹上。
 *
 * 渲染分两层 Graphics：
 * - `doneG` 收笔的笔画，只在「脏了」（新增收笔 / 撤销 / 清空）时整体重画一次；
 * - `liveG` 正在画的那几笔，绘制中每帧重画（拖尾有动画）。
 * （Phaser 4 的 RenderTexture.draw 烘焙 Graphics 会静默不出图，所以不用 RT。）
 */
export class PaintScene extends Phaser.Scene {
  private data_: PaintSceneData | null = null;
  private bg!: Phaser.GameObjects.Graphics;
  private doneG!: Phaser.GameObjects.Graphics;
  private liveG!: Phaser.GameObjects.Graphics;
  private strokes: Stroke[] = [];
  private liveIds = new Set<string>();
  /** doneG 需要整体重画 */
  private dirty = true;

  /** 我装备的拖尾风格（'none' 已回退成 classic） */
  private myStyle: TrailId = 'classic';
  /** 现在能不能画（轮到我画 & 词已定） */
  private editable = false;
  private brushColor = PAINT_COLORS[0];
  private current: Stroke | null = null;
  private lastPt: TrailPoint | null = null;
  private seq = 0;
  private flushTimer = 0;
  /** 画板在画布里的偏移（layout() 里算） */
  private offX = 0;
  private offY = 0;

  constructor() {
    super('PaintScene');
  }

  init(data: PaintSceneData): void {
    this.data_ = data;
    this.strokes = [];
    this.liveIds = new Set();
    this.current = null;
    this.dirty = true;
    // 'none' 在 drawShuttleTrail 里会被直接跳过 → 笔迹消失，回退成经典彗尾
    this.myStyle = data.trailStyle === 'none' ? 'classic' : data.trailStyle;
    this.editable = data.editable;
  }

  create(): void {
    // 白纸底 + 边框（保留在显示列表里，别 destroy——destroy 了画板就隐形了）
    this.bg = this.add.graphics();
    this.bg.fillStyle(0xf7f3e8, 1);
    this.bg.fillRect(0, 0, BOARD_W, BOARD_H);
    this.bg.lineStyle(3, 0x8a8068, 0.6);
    this.bg.strokeRect(1.5, 1.5, BOARD_W - 3, BOARD_H - 3);

    this.doneG = this.add.graphics();
    this.liveG = this.add.graphics();

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onDown(p));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.onMove(p));
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.onUp(p));
    // 手指拖出画布 / 被系统手势打断（pointercancel）时也要收笔
    this.input.on('pointerupoutside', (p: Phaser.Input.Pointer) => this.onUp(p));

    // 画布尺寸是跟随容器的（zoom.ts 的 bindCanvasSize 会重设 gameSize），
    // 画板 900×560 在其中居中；尺寸变化时重算。
    this.layout();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    this.events.once('shutdown', () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
      window.clearInterval(this.flushTimer);
    });
    // 未收笔笔画的节流转发（60ms 一批，别一 tick 一个包）
    this.flushTimer = window.setInterval(() => this.flush(false), 60);
  }

  /** 画板在画布（容器尺寸）里居中 */
  private layout(): void {
    const cam = this.cameras.main;
    this.offX = Math.max(0, Math.round((cam.width - BOARD_W) / 2));
    this.offY = Math.max(0, Math.round((cam.height - BOARD_H) / 2));
    this.bg.setPosition(this.offX, this.offY);
    this.doneG.setPosition(this.offX, this.offY);
    this.liveG.setPosition(this.offX, this.offY);
    this.dirty = true;
  }

  /** 页面控制：轮到我画才放开画笔 */
  setEditable(on: boolean): void {
    this.editable = on;
    if (!on) this.endStroke(true);
  }

  setBrush(color: number): void {
    this.brushColor = color;
  }

  /** 对方的轨迹增量（id 相同就接着追加） */
  applyRemote(id: string, styleRaw: string, color: number, pts: number[], done: boolean): void {
    let st = this.strokes.find((x) => x.id === id);
    const style = (styleRaw === 'none' ? 'classic' : styleRaw) as TrailId;
    if (!st) {
      st = { id, style, color, pts: [], done: false };
      this.strokes.push(st);
      this.liveIds.add(id);
    }
    st.style = style;
    st.color = color;
    for (let i = 0; i < pts.length; i += 2) st.pts.push({ x: pts[i], y: pts[i + 1] });
    if (done) this.finish(st);
  }

  remoteUndo(): void {
    const last = this.strokes.pop();
    if (last) this.liveIds.delete(last.id);
    this.dirty = true;
  }

  remoteClear(): void {
    this.strokes = [];
    this.liveIds = new Set();
    this.current = null;
    this.dirty = true;
  }

  // ---- 本地输入 ----------------------------------------------------------

  private onDown(p: Phaser.Input.Pointer): void {
    if (!this.editable) return;
    const pt = this.clamp(p);
    this.seq += 1;
    const id = `s${Date.now().toString(36)}${this.seq}`;
    this.current = { id, style: this.myStyle, color: this.brushColor, pts: [pt], done: false };
    this.strokes.push(this.current);
    this.liveIds.add(id);
    this.lastPt = pt;
  }

  private onMove(p: Phaser.Input.Pointer): void {
    if (!this.current || !this.editable) return;
    if (!p.isDown) return;
    const pt = this.clamp(p);
    const lp = this.lastPt;
    if (lp && Math.abs(pt.x - lp.x) + Math.abs(pt.y - lp.y) < 4) return;
    this.current.pts.push(pt);
    this.lastPt = pt;
  }

  private onUp(_p: Phaser.Input.Pointer): void {
    this.endStroke(false);
  }

  private endStroke(silent: boolean): void {
    const st = this.current;
    this.current = null;
    if (!st) return;
    if (st.pts.length < 2) {
      // 点一下也算个点：补一个近点让它至少能画出拍头光点
      const p0 = st.pts[0] ?? { x: -10, y: -10 };
      st.pts.push({ x: p0.x + 1, y: p0.y + 1 });
    }
    this.finish(st);
    if (!silent) this.flush(true, st);
  }

  /** 把未收笔的增量发给页面（页面转发联机） */
  private flush(force: boolean, only?: Stroke): void {
    const d = this.data_;
    if (!d) return;
    const targets = only ? [only] : this.strokes.filter((s) => !s.done && this.liveIds.has(s.id));
    for (const st of targets) {
      const sent = (st as Stroke & { sent?: number }).sent ?? 0;
      if (st.done || force) {
        const pts = flatten(st.pts.slice(sent));
        if (pts.length) d.onChunk(st.id, st.style, st.color, pts, true);
        (st as Stroke & { sent?: number }).sent = st.pts.length;
      } else if (st.pts.length - sent >= 2) {
        const pts = flatten(st.pts.slice(sent));
        d.onChunk(st.id, st.style, st.color, pts, false);
        (st as Stroke & { sent?: number }).sent = st.pts.length;
      }
    }
  }

  private clamp(p: Phaser.Input.Pointer): TrailPoint {
    // 世界坐标 → 画板本地坐标（画板在画布里居中有偏移）
    return {
      x: Math.max(0, Math.min(BOARD_W, p.worldX - this.offX)),
      y: Math.max(0, Math.min(BOARD_H, p.worldY - this.offY)),
    };
  }

  /** 收笔：转为「已收笔」，doneG 标脏（下一帧整体重画一次） */
  private finish(st: Stroke): void {
    st.done = true;
    this.liveIds.delete(st.id);
    this.dirty = true;
  }

  update(): void {
    // 收笔层：只在脏了的时候整体重画（平时不动，几乎零开销）
    if (this.dirty) {
      this.dirty = false;
      this.doneG.clear();
      const now = this.time.now;
      for (const st of this.strokes) {
        if (st.done) drawShuttleTrail(this.doneG, st.style, st.pts, 1, now, st.color);
      }
    }
    // 正在画的层：绘制中每帧重画（拖尾有动画感）
    this.liveG.clear();
    for (const id of this.liveIds) {
      const st = this.strokes.find((x) => x.id === id);
      if (st && !st.done) drawShuttleTrail(this.liveG, st.style, st.pts, 1, this.time.now, st.color);
    }
  }
}

function flatten(pts: TrailPoint[]): number[] {
  const out: number[] = [];
  for (const p of pts) out.push(Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10);
  return out;
}
