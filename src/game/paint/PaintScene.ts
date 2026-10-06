import Phaser from 'phaser';
import type { TrailId } from '../cosmetics';
import { drawShuttleTrail, type TrailPoint } from '../draw/trails';

/** 画板逻辑尺寸（联机双方各自 FIT 缩放，坐标不用换算） */
export const BOARD_W = 900;
export const BOARD_H = 560;

/** 调色板（index 作为选色） */
export const PAINT_COLORS = [0x2a2a33, 0xe8404a, 0x2f7a4a, 0x4a90d9, 0xffb03a, 0xffffff];

export interface PaintSceneData {
  /** 复用「一间房」的联机链路（单机涂鸦时为 null） */
  session: import('../../net/link').NetLink | null;
  /** 我的击球拖尾风格：画笔特效直接复用它（挥拍拖尾那种视觉） */
  trailStyle: TrailId;
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
 * 画家的拖尾风格（火焰 / 电弧 / 彩虹…）直接长在笔迹上，收笔后烘焙进 RenderTexture，
 * 之后每帧只重画"正在画的那几笔"，几十笔也不会卡。
 */
export class PaintScene extends Phaser.Scene {
  private data_: PaintSceneData | null = null;
  private rt!: Phaser.GameObjects.RenderTexture;
  private live!: Phaser.GameObjects.Graphics;
  private strokes: Stroke[] = [];
  private liveIds = new Set<string>();
  /** 收笔笔画的索引（ undo/重烘焙用） */
  private bakedCount = 0;

  /** 现在能不能画（轮到我画 & 词已定） */
  private editable = false;
  private brushColor = PAINT_COLORS[0];
  private current: Stroke | null = null;
  private lastPt: TrailPoint | null = null;
  private seq = 0;
  private flushTimer = 0;

  constructor() {
    super('PaintScene');
  }

  init(data: PaintSceneData): void {
    this.data_ = data;
    this.strokes = [];
    this.liveIds = new Set();
    this.bakedCount = 0;
    this.current = null;
    this.editable = false;
  }

  create(): void {
    const g = this.add.graphics();
    // 白纸底 + 边框
    g.fillStyle(0xf7f3e8, 1);
    g.fillRect(0, 0, BOARD_W, BOARD_H);
    g.lineStyle(3, 0x8a8068, 0.6);
    g.strokeRect(1.5, 1.5, BOARD_W - 3, BOARD_H - 3);
    g.destroy();

    this.rt = this.add.renderTexture(0, 0, BOARD_W, BOARD_H).setOrigin(0, 0);
    this.live = this.add.graphics();

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onDown(p));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.onMove(p));
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.onUp(p));

    this.events.once('shutdown', () => {
      window.clearInterval(this.flushTimer);
    });
    // 收笔笔画的节流转发（60ms 一批，别一 tick 一个包）
    this.flushTimer = window.setInterval(() => this.flush(false), 60);
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
  applyRemote(id: string, style: string, color: number, pts: number[], done: boolean): void {
    let st = this.strokes.find((x) => x.id === id);
    if (!st) {
      st = { id, style: style as TrailId, color, pts: [], done: false };
      this.strokes.push(st);
      this.liveIds.add(id);
    }
    st.style = style as TrailId;
    st.color = color;
    for (let i = 0; i < pts.length; i += 2) st.pts.push({ x: pts[i], y: pts[i + 1] });
    if (done) this.bake(st);
  }

  remoteUndo(): void {
    const last = this.strokes.pop();
    if (last) this.liveIds.delete(last.id);
    this.rebake();
  }

  remoteClear(): void {
    this.strokes = [];
    this.liveIds = new Set();
    this.bakedCount = 0;
    this.current = null;
    this.rebake();
  }

  // ---- 本地输入 ----------------------------------------------------------

  private onDown(p: Phaser.Input.Pointer): void {
    if (!this.editable) return;
    const pt = this.clamp(p);
    this.seq += 1;
    const id = `s${Date.now().toString(36)}${this.seq}`;
    this.current = { id, style: this.data_?.trailStyle ?? 'classic', color: this.brushColor, pts: [pt], done: false };
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
    this.bake(st);
    if (!silent) this.flush(true, st);
  }

  /** 把 buffer 里的点发给页面（页面转发联机） */
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
    return {
      x: Math.max(0, Math.min(BOARD_W, p.worldX)),
      y: Math.max(0, Math.min(BOARD_H, p.worldY)),
    };
  }

  /** 收笔：把整笔画烘焙进 RenderTexture（撤销/清空时全量重烘焙一次） */
  private bake(st: Stroke): void {
    st.done = true;
    const scratch = this.make.graphics({ x: 0, y: 0 }, false);
    drawShuttleTrail(scratch, st.style, st.pts, 1, this.time.now, st.color);
    this.rt.draw(scratch);
    scratch.destroy();
    this.bakedCount += 1;
  }

  /** 全量重烘焙（undo / clear 后） */
  private rebake(): void {
    this.rt.clear();
    this.bakedCount = 0;
    for (const st of this.strokes) {
      st.done = true;
      this.bake(st);
    }
  }

  update(): void {
    this.live.clear();
    for (const id of this.liveIds) {
      const st = this.strokes.find((x) => x.id === id);
      if (!st) {
        this.liveIds.delete(id);
        continue;
      }
      if (st.done) {
        this.liveIds.delete(id);
        continue;
      }
      drawShuttleTrail(this.live, st.style, st.pts, 1, this.time.now, st.color);
    }
  }
}

function flatten(pts: TrailPoint[]): number[] {
  const out: number[] = [];
  for (const p of pts) out.push(Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10);
  return out;
}
