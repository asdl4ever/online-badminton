import Phaser from 'phaser';
import type { Cosmetic, TrailId } from '../cosmetics';
import { P } from '../theme';
import { createPlayerRig, type PlayerRig } from '../draw/rig';
import type { TrailPoint } from '../draw/trails';
import { drawTrailCustom } from '../draw/trails-theme';
import {
  brushById,
  drawBrushBody,
  drawPaintTrail,
  eraserRadius,
  SIZE_DEFAULT,
  type BrushId,
} from './brushes';

/** 画板逻辑尺寸（联机双方坐标都是这套，不用换算） */
export const BOARD_W = 900;
export const BOARD_H = 560;

/** 调色板 */
export const PAINT_COLORS = [0x2a2a33, 0xe8404a, 0x2f7a4a, 0x4a90d9, 0xffb03a, 0xffffff];

export interface PaintSceneData {
  /** 复用「一间房」的联机链路（单机涂鸦时为 null） */
  session: import('../../net/link').NetLink | null;
  /** 我的装扮：画笔的挥拍拖尾+画板旁站着的那只角色都用它 */
  cosmetic: Cosmetic;
  /** 开局就放开画笔（单机自由涂鸦；联机时由回合流程控制） */
  editable: boolean;
  /** 开局用的笔型、颜色与粗细（页面切房重建场景时保持玩家当前的选择） */
  brush: BrushId;
  color: number;
  /** 粗细倍率（大小滑条 / 100） */
  size: number;
  /** 本地画出新的一小段轨迹 → 页面转发给对方 */
  onChunk: (
    id: string,
    b: string,
    s: string,
    c: number,
    w: number,
    pts: number[],
    done: boolean,
  ) => void;
  /**
   * 本地擦掉了笔迹 → 页面转发。
   * `ids` 是被擦掉的原笔画，`parts` 是擦剩的段（作为新笔画发出去）。
   */
  onErase: (
    ids: string[],
    parts: { id: string; b: string; s: string; c: number; w: number; pts: number[] }[],
  ) => void;
  /** 本地撤销了一笔 → 页面转发 */
  onUndo: () => void;
}

interface Stroke {
  id: string;
  brush: BrushId;
  style: TrailId;
  color: number;
  /** 粗细倍率（大小滑条） */
  size: number;
  pts: TrailPoint[];
  done: boolean;
  /**
   * 收笔时算好的包围盒：橡皮命中判定先拿它剔除（不做这个的话，
   * 每拖一下都要遍历所有笔画的全部采样点，笔数一多就明显掉帧）。
   */
  box?: { x0: number; y0: number; x1: number; y1: number };
}

/**
 * 你画我猜的画板场景。
 *
 * - 笔画视觉**复用击球拖尾**（`draw/drawShuttleTrail`）：每一笔都是采样点链，
 *   画家的拖尾风格直接长在笔迹上；笔型（马克笔 / 铅笔 / 荧光 / 喷雾 / 毛笔）
 *   只决定实体笔迹（见 `brushes.ts`）。
 * - 画板旁边站着**画家的角色**（复用 `createPlayerRig`，带装备与挥拍拖尾动画）。
 * - 收笔的笔画**烘焙成一张离屏贴图**（`rt`）：静态画面只花一个四边形的代价，
 *   而不是每帧重画几千条绘制指令——这是「离屏静态底片」的用法，帧率提升最大；
 * - `liveG` 只画**正在画的那一两笔**（拖尾有动画，必须每帧重画）。
 * ⚠️ Phaser 4 的 `RenderTexture.draw()` 只是把命令入队，**必须再调
 *   `rt.texture.render()`** 才会真正刷进贴图（不调就“静默不出图”）。
 */
export class PaintScene extends Phaser.Scene {
  private data_: PaintSceneData | null = null;
  private bg!: Phaser.GameObjects.Graphics;
  /** 收笔笔画的离屏底片（静态，平时一帧只画它一次） */
  private rt!: Phaser.GameObjects.RenderTexture;
  private liveG!: Phaser.GameObjects.Graphics;
  private charBox!: Phaser.GameObjects.Container;
  private charG!: Phaser.GameObjects.Graphics;
  private charOver!: Phaser.GameObjects.Graphics;
  private rig!: PlayerRig;
  private eraser!: Phaser.GameObjects.Graphics;

  private strokes: Stroke[] = [];
  private liveIds = new Set<string>();
  /** 底片需要整体重建（撤销 / 橡皮 / 清空 / 尺寸变化才用） */
  private rebuild = true;
  /** 刚收笔、还等着烘进底片的笔画（只画这一笔，不用重建整张底片） */
  private queue: Stroke[] = [];
  /** 角色动画降帧计数（手机上每帧重画整只角色太贵） */
  private frame = 0;

  /** 我装备的拖尾风格（'none' 已回退成 classic） */
  private myStyle: TrailId = 'classic';
  /** 现在能不能画（轮到我画 & 词已定） */
  private editable = false;
  private brush: BrushId = 'marker';
  private color = PAINT_COLORS[0];
  /** 粗细倍率（画板坐标下的 1 = 标准） */
  private size = SIZE_DEFAULT / 100;
  private current: Stroke | null = null;
  private lastPt: TrailPoint | null = null;
  private seq = 0;
  private flushTimer = 0;
  /** 橡皮攒批：待广播的「被擦掉的笔画」与「擦剩的新段」 */
  private wiped: string[] = [];
  private wipedNew: Stroke[] = [];

  /** 画板在画布里的偏移 / 缩放（layout() 里算） */
  private offX = 0;
  private offY = 0;
  private boardScale = 1;
  /** 角色放在画板右侧（宽屏）还是画板内的右下角（窄屏） */
  private sideChar = true;

  constructor() {
    super('PaintScene');
  }

  init(data: PaintSceneData): void {
    this.data_ = data;
    this.strokes = [];
    this.liveIds = new Set();
    this.current = null;
    this.rebuild = true;
    this.queue = [];
    // 'none' 在 drawShuttleTrail 里会被直接跳过 → 笔迹消失，回退成经典彗尾
    this.myStyle = data.cosmetic.trailStyle === 'none' ? 'classic' : data.cosmetic.trailStyle;
    this.editable = data.editable;
    this.brush = data.brush;
    this.color = data.color;
    this.size = data.size;
  }

  create(): void {
    // 白纸底 + 边框（保留在显示列表里，别 destroy——destroy 了画板就隐形了）
    this.bg = this.add.graphics();
    this.bg.fillStyle(0xf7f3e8, 1);
    this.bg.fillRect(0, 0, BOARD_W, BOARD_H);
    this.bg.lineStyle(3, 0x8a8068, 0.6);
    this.bg.strokeRect(1.5, 1.5, BOARD_W - 3, BOARD_H - 3);

    this.rt = this.add.renderTexture(0, 0, BOARD_W, BOARD_H).setOrigin(0, 0);
    this.liveG = this.add.graphics();
    this.eraser = this.add.graphics();

    // 画板旁的画家角色（容器：整只角色一起缩放，含 emoji 脸的 Text）
    this.charG = this.add.graphics();
    this.charOver = this.add.graphics();
    this.rig = createPlayerRig(this);
    this.charBox = this.add.container(0, 0, [this.charG, this.charOver, this.rig.face]);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onDown(p));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.onMove(p));
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.onUp(p));
    // 手指拖出画布 / 被系统手势打断（pointercancel）时也要收笔
    this.input.on('pointerupoutside', (p: Phaser.Input.Pointer) => this.onUp(p));

    // 画布尺寸跟随容器（zoom.ts 的 bindCanvasSize 会重设 gameSize）：
    // 画板按可用空间等比缩放并居中，尺寸变化时重算。
    this.layout();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    this.events.once('shutdown', () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
      window.clearInterval(this.flushTimer);
    });
    // 未收笔笔画的节流转发（60ms 一批，别一 tick 一个包）
    this.flushTimer = window.setInterval(() => this.flush(false), 60);
  }

  /**
   * 画板等比缩放并**在画布里真居中**。
   *
   * 上下各留一条：上面给顶栏（退出 / 状态条），下面给画笔工具条——手机竖屏时
   * 也不会被这两条压住。角色贴画板右下角：右侧有空间就站到画板外，没有（手机）
   * 就缩小躲进画板右下角的角上。
   */
  private layout(): void {
    const cam = this.cameras.main;
    // 窄屏（手机）：工具条折成两行、顶上还有状态条 —— 上下预留都要更多
    const narrow = cam.width < 640;
    const pad = narrow ? 8 : 10;
    const topBar = narrow ? 40 : 46;
    const bottomBar = narrow ? 96 : 62;
    const availW = Math.max(80, cam.width - pad * 2);
    const availH = Math.max(80, cam.height - topBar - bottomBar);
    const s = Math.min(1, availW / BOARD_W, availH / BOARD_H);
    this.boardScale = s;
    const bw = BOARD_W * s;
    const bh = BOARD_H * s;
    // 居中：水平按整宽居中，垂直居中在「顶栏之下、工具条之上」那一条里
    this.offX = Math.round((cam.width - bw) / 2);
    this.offY = Math.round(topBar + (availH - bh) / 2);

    for (const o of [this.bg, this.rt, this.liveG]) {
      o.setScale(s);
      o.setPosition(this.offX, this.offY);
    }
    // 角色：右侧够宽就站画板外，否则缩小贴进画板右下角
    this.sideChar = cam.width - (this.offX + bw) >= 78;
    const k = this.sideChar ? 0.88 : Math.min(0.52, s * 1.3);
    const cx = this.sideChar ? this.offX + bw + 36 : this.offX + bw - Math.round(40 * k);
    const cy = this.offY + bh - 4;
    this.charBox.setPosition(cx, cy).setScale(k);
    this.rebuild = true;
  }

  /** 页面控制：轮到我画才放开画笔 */
  setEditable(on: boolean): void {
    this.editable = on;
    if (!on) this.endStroke(true);
  }

  setBrush(brush: BrushId, color: number, size: number): void {
    this.brush = brush;
    this.color = color;
    this.size = size;
  }

  /** 对方的轨迹增量（id 相同就接着追加） */
  applyRemote(
    id: string,
    brushRaw: string,
    styleRaw: string,
    color: number,
    size: number,
    pts: number[],
    done: boolean,
  ): void {
    let st = this.strokes.find((x) => x.id === id);
    const style = (styleRaw === 'none' ? 'classic' : styleRaw) as TrailId;
    if (!st) {
      st = {
        id,
        brush: brushById(brushRaw).id,
        style,
        color,
        size: size || 1,
        pts: [],
        done: false,
      };
      this.strokes.push(st);
      this.liveIds.add(id);
    }
    st.style = style;
    st.color = color;
    st.size = size || 1;
    for (let i = 0; i < pts.length; i += 2) st.pts.push({ x: pts[i], y: pts[i + 1] });
    if (done) this.finish(st);
  }

  /** 对面擦了笔 */
  remoteErase(ids: string[]): void {
    const set = new Set(ids);
    this.strokes = this.strokes.filter((s) => !set.has(s.id));
    for (const id of set) this.liveIds.delete(id);
    this.rebuild = true;
  }

  remoteUndo(): void {
    const last = this.strokes.pop();
    if (last) this.liveIds.delete(last.id);
    this.rebuild = true;
  }

  remoteClear(): void {
    this.strokes = [];
    this.liveIds = new Set();
    this.queue = [];
    this.wiped = [];
    this.wipedNew = [];
    this.current = null;
    this.rebuild = true;
  }

  // ---- 本地输入 ----------------------------------------------------------

  private onDown(p: Phaser.Input.Pointer): void {
    if (!this.editable) return;
    // 点在画板外就不落笔（免得贴着边框画出一条边线）
    if (!this.inside(p)) return;
    const pt = this.clamp(p);
    if (this.brush === 'eraser') {
      this.eraseAt(pt);
      return;
    }
    this.seq += 1;
    const id = `s${Date.now().toString(36)}${this.seq}`;
    this.current = {
      id,
      brush: this.brush,
      style: this.myStyle,
      color: this.color,
      size: this.size,
      pts: [pt],
      done: false,
    };
    this.strokes.push(this.current);
    this.liveIds.add(id);
    this.lastPt = pt;
  }

  private onMove(p: Phaser.Input.Pointer): void {
    if (!this.editable || !p.isDown) return;
    const pt = this.clamp(p);
    if (this.brush === 'eraser') {
      this.eraseAt(pt);
      return;
    }
    const st = this.current;
    if (!st) return;
    const lp = this.lastPt;
    if (lp && Math.abs(pt.x - lp.x) + Math.abs(pt.y - lp.y) < 4) return;
    st.pts.push(pt);
    this.lastPt = pt;
  }

  private onUp(_p: Phaser.Input.Pointer): void {
    this.endStroke(false);
  }

  /**
   * 橡皮：**只擦掉范围内的那一段笔迹**（不是整笔删除）。
   *
   * 做法是把被擦到的笔画按「连续没被擦到的点」切成几段，原笔画删掉、剩下的段
   * 作为新笔画留着；擦掉的部分连同新段一起广播给对方，两边结果一致。
   */
  private eraseAt(pt: TrailPoint): void {
    const r = eraserRadius(this.size);
    const inside = (q: TrailPoint): boolean =>
      Math.abs(q.x - pt.x) < r && Math.abs(q.y - pt.y) < r;

    const removed: string[] = [];
    const added: Stroke[] = [];
    const kept: Stroke[] = [];
    for (const st of this.strokes) {
      // 先拿包围盒剔除：绝大多数笔画跟橡皮圈根本不重叠，直接跳过逐点判定
      const box = st.box;
      const near =
        !box ||
        (pt.x + r >= box.x0 && pt.x - r <= box.x1 && pt.y + r >= box.y0 && pt.y - r <= box.y1);
      if (st.id === this.current?.id || !near || !st.pts.some(inside)) {
        kept.push(st);
        continue;
      }
      removed.push(st.id);
      // 把没被擦到的点按连续段切出来，每段作为一笔留下
      let run: TrailPoint[] = [];
      const flush = (): void => {
        if (run.length >= 2) {
          this.seq += 1;
          added.push({
            id: `k${Date.now().toString(36)}${this.seq}`,
            brush: st.brush,
            style: st.style,
            color: st.color,
            size: st.size,
            pts: run,
            done: true,
            box: boundsOf(run),
          });
        }
        run = [];
      };
      for (const q of st.pts) {
        if (inside(q)) flush();
        else run.push(q);
      }
      flush();
    }
    if (!removed.length) return;
    this.strokes = [...kept, ...added];
    for (const id of removed) this.liveIds.delete(id);
    this.rebuild = true;

    // 攒一小会儿再广播（橡皮拖动时别一个点一个包）
    this.wiped.push(...removed);
    this.wipedNew.push(...added);
    window.clearTimeout(this.wipeTimer);
    this.wipeTimer = window.setTimeout(() => {
      const ids = this.wiped;
      const news = this.wipedNew;
      this.wiped = [];
      this.wipedNew = [];
      if (ids.length) {
        this.data_?.onErase(
          ids,
          news.map((st) => ({
            id: st.id,
            b: st.brush,
            s: st.style,
            c: st.color,
            w: st.size,
            pts: flatten(st.pts),
          })),
        );
      }
    }, 80);
  }

  private wipeTimer = 0;

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
        if (pts.length) d.onChunk(st.id, st.brush, st.style, st.color, st.size, pts, true);
        (st as Stroke & { sent?: number }).sent = st.pts.length;
      } else if (st.pts.length - sent >= 2) {
        const pts = flatten(st.pts.slice(sent));
        d.onChunk(st.id, st.brush, st.style, st.color, st.size, pts, false);
        (st as Stroke & { sent?: number }).sent = st.pts.length;
      }
    }
  }

  /** 指针是不是落在画板上 */
  private inside(p: Phaser.Input.Pointer): boolean {
    const s = this.boardScale;
    return (
      p.worldX >= this.offX &&
      p.worldY >= this.offY &&
      p.worldX <= this.offX + BOARD_W * s &&
      p.worldY <= this.offY + BOARD_H * s
    );
  }

  private clamp(p: Phaser.Input.Pointer): TrailPoint {
    // 世界坐标 → 画板本地坐标（画板缩放过、且居中有偏移）
    const s = this.boardScale;
    return {
      x: Math.max(0, Math.min(BOARD_W, (p.worldX - this.offX) / s)),
      y: Math.max(0, Math.min(BOARD_H, (p.worldY - this.offY) / s)),
    };
  }

  /** 收笔：抽稀采样点 + 算包围盒 → 排队烘进底片（只画这一笔，不用重建整张） */
  private finish(st: Stroke): void {
    st.done = true;
    st.pts = simplify(st.pts, FINISH_MIN_GAP);
    st.box = boundsOf(st.pts);
    this.liveIds.delete(st.id);
    this.queue.push(st);
  }

  update(): void {
    const now = this.time.now;
    // 底片层：撤销 / 橡皮 / 清空 / 尺寸变化才整体重建；平时只把新收的笔画烘进去。
    // 烘完就是一张贴图，之后每帧只贴一次——静态笔迹的帧成本直接归零。
    if (this.rebuild) {
      this.rebuild = false;
      this.queue = [];
      const all = this.strokes.filter((st) => st.done);
      this.bake(all, true);
    } else if (this.queue.length) {
      const add = this.queue;
      this.queue = [];
      this.bake(add, false);
    }
    // 正在画的层：绘制中每帧重画（拖尾有动画感）
    this.liveG.clear();
    for (const id of this.liveIds) {
      const st = this.strokes.find((x) => x.id === id);
      if (st && !st.done) this.paintStroke(this.liveG, st, now);
    }
    // 角色动画降到 ~20fps：整只角色（身体 + 装备 + 宠物）每帧重画太贵
    this.frame = (this.frame + 1) % 3;
    if (this.frame === 0) this.drawCharacter(now);
    this.drawEraserCursor();
  }

  /**
   * 把若干「已收笔」的笔画烘进离屏底片。
   *
   * `clearFirst` = 重建整张底片（撤销 / 橡皮 / 清空后）。一次烘多笔时共用一个
   * scratch Graphics（`draw()` 入队的是对象引用，渲染时必须保持原样），最后一次
   * `texture.render()` 刷进贴图。
   */
  private bake(list: readonly Stroke[], clearFirst: boolean): void {
    const scratch = this.make.graphics({ x: 0, y: 0 }, false);
    const now = this.time.now;
    for (const st of list) this.paintStroke(scratch, st, now);
    if (clearFirst) this.rt.clear();
    if (list.length) this.rt.draw(scratch);
    // ⚠️ 必须显式 render：draw() 只是把命令入队，不 render 就不出图
    //（Phaser 4 运行时是 DynamicTexture；官方类型没把 render() 暴露出来，这里转一下）
    (this.rt.texture as unknown as { render(): void }).render();
    scratch.destroy();
  }

  /**
   * 一笔 = 实体笔迹（笔型）+ 挥拍拖尾特效。
   *
   * 拖尾**不用对局的逐点盖章画法**（那会把笔迹变成一串圆圈）：主题拖尾本来就是
   * 沿整条轨迹成形的，直接沿用；老款（经典 / 火焰 / 彩虹…）走平滑光带。
   */
  private paintStroke(g: Phaser.GameObjects.Graphics, st: Stroke, now: number): void {
    drawBrushBody(g, st.brush, st.color, st.pts, now, st.size);
    const def = brushById(st.brush);
    if (def.trail <= 0) return;
    if (drawTrailCustom(g, now, st.style, st.pts, def.trail)) return;
    // 老款拖尾：光带用笔画自己的颜色（同色晕开），不引入突兀的异色光晕
    drawPaintTrail(g, st.pts, st.color, def.trail, now);
  }

  /** 画板旁的画家角色：拿着拍一直在「画」（挥拍拖尾在场边闪） */
  private drawCharacter(now: number): void {
    const cos = this.data_?.cosmetic;
    if (!cos) return;
    // 光环 / 地环不画：它们是一圈圈绕在角色身上的椭圆环（光环 'ring' 是三圈），
    // 在画室里既挡视线、又容易被当成笔迹上的「圆点」——画室只要角色本体 + 装备。
    const plain: Cosmetic = { ...cos, aura: 'none', ring: 'none' };
    const t = now / 1000;
    const ang = -0.45 + Math.sin(t * 2.1) * 0.85;
    const reach = 52;
    const rx = Math.cos(ang) * reach;
    const ry = Math.sin(ang) * reach * 0.8;
    const speed = 500 + 900 * Math.abs(Math.cos(t * 2.1));
    this.charG.clear();
    this.charOver.clear();
    this.rig.draw(
      this.charG,
      now,
      plain,
      { x: 0, feetY: 0, facing: -1, color: P.player1 },
      rx,
      ry,
      speed,
      0,
      this.charOver,
    );
  }

  /** 橡皮：光标圈（在画板上时） */
  private drawEraserCursor(): void {
    this.eraser.clear();
    if (this.brush !== 'eraser' || !this.editable) return;
    const p = this.input.activePointer;
    const s = this.boardScale;
    const x = p.worldX;
    const y = p.worldY;
    if (x < this.offX || y < this.offY || x > this.offX + BOARD_W * s || y > this.offY + BOARD_H * s) {
      return;
    }
    // 光标圈就是实际擦除范围（跟着大小滑条走）
    this.eraser.lineStyle(2, 0x8a8068, 0.75);
    this.eraser.strokeCircle(x, y, eraserRadius(this.size) * s);
    this.eraser.fillStyle(0x8a8068, 0.1);
    this.eraser.fillCircle(x, y, eraserRadius(this.size) * s);
  }
}

function flatten(pts: TrailPoint[]): number[] {
  const out: number[] = [];
  for (const p of pts) out.push(Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10);
  return out;
}

/** 收笔时抽稀的间距（画板坐标）：5 在 900 宽的画板上肉眼看不出差别，顶点数砍一半以上 */
const FINISH_MIN_GAP = 5;

/** 一笔的包围盒（橡皮命中判定的粗筛） */
function boundsOf(pts: readonly TrailPoint[]): { x0: number; y0: number; x1: number; y1: number } {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const p of pts) {
    if (p.x < x0) x0 = p.x;
    if (p.y < y0) y0 = p.y;
    if (p.x > x1) x1 = p.x;
    if (p.y > y1) y1 = p.y;
  }
  return { x0, y0, x1, y1 };
}

/**
 * 采样点抽稀：丢掉离上一个保留点太近的点（首尾一定保留）。
 * 联机两端用同一个规则，所以双方看到的笔迹一致。
 */
function simplify(pts: TrailPoint[], min: number): TrailPoint[] {
  if (pts.length < 4) return pts;
  const out: TrailPoint[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const last = out[out.length - 1];
    if (Math.abs(pts[i].x - last.x) + Math.abs(pts[i].y - last.y) >= min) out.push(pts[i]);
  }
  out.push(pts[pts.length - 1]);
  return out;
}
