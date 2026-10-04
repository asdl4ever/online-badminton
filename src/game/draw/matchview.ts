import { COURT_LEFT, COURT_RIGHT, GROUND_Y, NET_TOP, VIEW_H, VIEW_W } from '../constants';
import { FONT_EMOJI, P } from '../theme';
import type { Cosmetic } from '../cosmetics';
import type { World } from '../types';
import type { FaceSink } from './character';
import { asGraphics } from './canvas2d';
import { drawRigGraphics } from './rig';

/**
 * **正式对局那块画面**的渲染器（不依赖 Phaser）。
 *
 * 大熊球馆里的每一张场地都直接调它，所以那些场地和真正开一局时长得**一模一样**：
 * 天空 / 看台（含一颗颗观众）/ 木地板 / 底线 / 球网 / 两个完整装扮的角色 / 羽毛球 /
 * 画面里的大比分与名字牌。做法和大地图上的角色同一套——`asGraphics()` 把
 * `Phaser.GameObjects.Graphics` 的绘制指令映射到普通 `CanvasRenderingContext2D`，
 * 于是 `draw/rig.ts` 那份角色画法可以原样复用。
 *
 * 只画「对局画面本身」：比分、名字牌在里面；发球机 HUD、体力条、提示语、
 * 「再来一局」按钮这些属于页面外壳，不在其中。
 */
const SCORE_FONT = '800 52px "Chakra Petch", "Segoe UI", sans-serif';
const NAME_FONT = '700 20px "Chakra Petch", "Segoe UI", sans-serif';
const FACE_FONT = `34px ${FONT_EMOJI}`;

/**
 * 名字牌 / 比分 / 「XX 获胜」所在那条带子的上沿（地面往上 300）。
 * 画面上半部分就是天空，比分与名字牌落在这里，所以有没有背景都看得见。
 */
export const MATCH_VIEW_TOP = GROUND_Y - 300;
export const MATCH_VIEW_H = 380;
/** 比分 / 名字 / 结束语的纵向位置（世界坐标） */
const SCORE_Y = GROUND_Y - 292;
const NAME_Y = GROUND_Y - 262;
const OVER_Y = GROUND_Y - 196;

export interface MatchViewOptions {
  /**
   * 是否画背景（天空 / 看台 / 观众 / 木地板）。
   * 球馆里**不画**——场地直接摆在球馆地板上，只留人物 + 线 + 网，不然会突兀；
   * 真要一个「整块画面」（比如赛事中心那种）时传 `true`。
   */
  background?: boolean;
  /**
   * 只画**场地本身**（地面线 / 底线 / 球网）——球馆里的**空场地**用：
   * 人、球、比分都不画，但线网和正式对局是同一份画法（就是「原来那套去掉背景与人」）。
   */
  courtOnly?: boolean;
}

export interface MatchViewSide {
  name: string;
  cosmetic: Cosmetic;
}

/** 表情（emoji 头）的 Canvas 版绘制器：`drawRigGraphics` 在身体与帽子之间调它 */
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
      ctx.font = FACE_FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(this.text, this.x, this.y);
    }
  }
}

/**
 * 把一块对局画面画进 `ctx`（坐标系是 1280×720 的设计空间，调用方自己缩放）。
 * `world` 传 `null`（或 `opts.courtOnly`）时＝只画场地本身，不画人 / 球 / 比分。
 */
export function drawMatchView(
  ctx: CanvasRenderingContext2D,
  world: World | null,
  sides: [MatchViewSide, MatchViewSide],
  now: number,
  opts: MatchViewOptions = {},
): void {
  const g = asGraphics(ctx);
  const bg = opts.background ?? false;

  // ---- 背景（天空 / 看台 / 观众 / 木地板）：球馆里不画 --------------------
  if (bg) {
    g.fillStyle(P.skyTop, 1);
    g.fillRect(0, 0, VIEW_W, VIEW_H);
    g.fillGradientStyle(P.skyTop, P.skyTop, P.skyBottom, P.skyBottom, 1, 1, 1, 1);
    g.fillRect(0, 0, VIEW_W, GROUND_Y);

    g.fillStyle(P.stands, 1);
    g.fillRect(0, GROUND_Y - 160, VIEW_W, 160);
    for (let i = 0; i < 150; i++) {
      const x = (i * 137) % VIEW_W;
      const y = GROUND_Y - 152 + ((i * 71) % 140);
      g.fillStyle(i % 4 === 0 ? P.crowdA : P.crowdB, 0.9);
      g.fillCircle(x, y, 4);
    }
    g.fillStyle(P.apron, 1);
    g.fillRect(0, GROUND_Y - 6, VIEW_W, 6);

    g.fillStyle(P.floor, 1);
    g.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
    g.fillStyle(P.floorStrip, 1);
    g.fillRect(COURT_LEFT, GROUND_Y, COURT_RIGHT - COURT_LEFT, 24);
    g.fillStyle(P.floorEdge, 1);
    g.fillRect(0, VIEW_H - 14, VIEW_W, 14);
  }

  // ---- 线 + 网（有没有背景都画） -----------------------------------------
  // 没有背景时用一条深色地面线代替木地板，让脚下有个着落
  g.lineStyle(bg ? 3 : 4, bg ? P.line : 0x1c3326, bg ? 0.85 : 0.6);
  g.lineBetween(COURT_LEFT, GROUND_Y, COURT_RIGHT, GROUND_Y);
  g.lineStyle(4, bg ? P.line : 0x2b4a35, bg ? 0.9 : 0.85);
  g.lineBetween(COURT_LEFT, GROUND_Y, COURT_LEFT, GROUND_Y - 70);
  g.lineBetween(COURT_RIGHT, GROUND_Y, COURT_RIGHT, GROUND_Y - 70);

  // 球网
  const nx = VIEW_W / 2;
  g.fillStyle(0xdfe6ec, 1);
  g.fillRect(nx - 5, NET_TOP, 10, GROUND_Y - NET_TOP);
  g.fillRect(nx - 34, NET_TOP, 68, 7);

  // ---- 空场地：线 + 网就是「一块场地」的全部，到这儿就停 -------------------
  if (opts.courtOnly || !world) return;

  // ---- 两个角色（完整装扮 + 表情） ---------------------------------------
  for (let i = 0; i < 2; i++) {
    const p = world.players[i];
    drawRigGraphics(
      g,
      now,
      sides[i].cosmetic,
      { x: p.x, feetY: p.y, facing: p.facing, color: i === 0 ? P.player0 : P.player1 },
      p.rx,
      p.ry,
      0,
      0,
      new CanvasFace(ctx),
      null,
    );
  }

  // ---- 羽毛球 --------------------------------------------------------------
  const s = world.shuttle;
  g.fillStyle(0xffffff, 1);
  g.fillCircle(s.x, s.y, 7);
  g.fillStyle(0xf2f6ff, 0.9);
  g.fillCircle(s.x, s.y - 9, 5);

  // ---- 比分 + 名字牌（就画在画面里，和正式对局一样） ----------------------
  const score = world.score;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';

  ctx.font = SCORE_FONT;
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(8, 16, 26, 0.75)';
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 2; i++) {
    const x = VIEW_W / 2 + (i === 0 ? -70 : 70);
    ctx.strokeText(String(score[i]), x, SCORE_Y);
    ctx.fillText(String(score[i]), x, SCORE_Y);
  }

  ctx.font = NAME_FONT;
  ctx.lineWidth = 5;
  for (let i = 0; i < 2; i++) {
    const x = VIEW_W / 2 + (i === 0 ? -230 : 230);
    const col = i === 0 ? '#8fd0ff' : '#ffb08f';
    ctx.strokeStyle = 'rgba(8, 16, 26, 0.7)';
    ctx.fillStyle = col;
    ctx.strokeText(sides[i].name, x, NAME_Y);
    ctx.fillText(sides[i].name, x, NAME_Y);
  }

  // 打完在画面中间写一句（正式对局也是把结果写在画面里）
  if (world.phase === 'gameover') {
    const win = sides[world.winner as 0 | 1];
    const text = `${win ? win.name : ''} 获胜`;
    ctx.font = '800 44px "Chakra Petch", "Segoe UI", sans-serif';
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(8, 16, 26, 0.8)';
    ctx.fillStyle = '#ffd45c';
    ctx.strokeText(text, VIEW_W / 2, OVER_Y);
    ctx.fillText(text, VIEW_W / 2, OVER_Y);
  }
  ctx.restore();
}
