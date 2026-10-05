import type Phaser from 'phaser';
import { PLAYER_H, SHOULDER_DX, SHOULDER_DY } from '../constants';
import { SWING_TRAIL_COLORS, type Cosmetic, type SwingTrailId } from '../cosmetics';
import type { SwingSample } from '../racket';
import { FONT_EMOJI, P } from '../theme';
import { drawCharacter, type FaceSink } from './character';
import { drawRacketHead, racketFrameColor, RACKET_HEAD_CX } from './racket';
import { drawSwingCustom } from './swings-theme';

/**
 * The shared player rig: emoji face + body + arm + racket, drawn exactly the
 * way the match scene draws them, so every mode's character looks identical.
 *
 * One rig per character per scene (the face is a Text object driven from
 * outside, so it cannot live inside a Graphics command buffer).
 */
export interface RigPose {
  x: number;
  feetY: number;
  facing: 1 | -1;
  /** body colour */
  color: number;
  /** U熊肚皮的果冻形变（0 = 静止），见 `CharacterPose.belly` */
  belly?: number;
  /** 横向移动强度（0~1），给 U熊 / 老皮 走路时的抖动用，见 `CharacterPose.move` */
  move?: number;
}

export interface PlayerRig {
  /** the emoji face; hide it manually for characters with no emoji */
  face: Phaser.GameObjects.Text;
  /**
   * Draw the whole character. rx/ry is the racket-head offset from the
   * shoulder (same values the RacketTracker produces), swingSpeed drives the
   * swing trail arc, contactR optionally draws the sweet-spot ring.
   *
   * `path` 是拍头最近的真实轨迹（`RacketTracker.path.pts`，肩部相对坐标）——
   * 挥拍拖尾沿它画；不传（背包 / 商店的静态预览）就不画拖尾。
   */
  draw(
    g: Phaser.GameObjects.Graphics,
    now: number,
    cos: Cosmetic,
    pose: RigPose,
    rx: number,
    ry: number,
    swingSpeed?: number,
    contactR?: number,
    /** 帽子 / 宠物专用高层：emoji 头（depth 3）之上 */
    over?: Phaser.GameObjects.Graphics | null,
    /** 挥拍轨迹采样（`SwingPath.pts`） */
    path?: readonly SwingSample[],
    /** 不画球拍（举重这类「手上拿别的东西」的场合，改成画哑铃） */
    noRacket?: boolean,
  ): { shoulder: { x: number; y: number }; head: { x: number; y: number }; ang: number };
}

export function createPlayerRig(scene: Phaser.Scene): PlayerRig {
  // identical to the match scene's face: centred origin, emoji font.
  // depth 3 = 在角色身体层（场景里 charG 通常是 depth 2）**之上**：
  // 头永远露在身体上面，不会被身体/装备盖住。
  const face = scene.add
    .text(0, 0, '', { fontFamily: FONT_EMOJI, fontSize: '34px' })
    .setOrigin(0.5)
    .setDepth(3)
    .setVisible(false);

  return {
    face,
    draw: (g, now, cos, pose, rx, ry, swingSpeed = 0, contactR = 0, over = null, path, noRacket) =>
      drawRigGraphics(g, now, cos, pose, rx, ry, swingSpeed, contactR, face, over, path, noRacket),
  };
}

/**
 * The rig's graphics only — no Phaser scene needed, so non-Phaser renderers
 * (e.g. the world map's plain `<canvas>`, see `canvas2d.ts`) can reuse the exact
 * same arm/racket/character drawing. `face` is the object that receives the
 * emoji text; pass `null` to let the body's own face circle show instead.
 */
export function drawRigGraphics(
  g: Phaser.GameObjects.Graphics,
  now: number,
  cos: Cosmetic,
  pose: RigPose,
  rx: number,
  ry: number,
  swingSpeed = 0,
  contactR = 0,
  face: FaceSink | null = null,
  over: Phaser.GameObjects.Graphics | null = null,
  path?: readonly SwingSample[],
  noRacket = false,
): { shoulder: { x: number; y: number }; head: { x: number; y: number }; ang: number } {
  const shoulder = {
    x: pose.x + pose.facing * SHOULDER_DX,
    y: pose.feetY - PLAYER_H * SHOULDER_DY,
  };
  const head = { x: shoulder.x + rx, y: shoulder.y + ry };
  const ang = Math.atan2(head.y - shoulder.y, head.x - shoulder.x);

  // 挥拍拖尾：沿拍头最近的真实轨迹画（没有轨迹数据的场合不画）
  const hot = Math.min(1, swingSpeed / 1400);
  drawSwingTrail(g, now, cos, shoulder.x, shoulder.y, head.x, head.y, ang, hot, path);

  drawCharacter(g, now, cos, {
    x: pose.x,
    feetY: pose.feetY,
    facing: pose.facing,
    color: pose.color,
    belly: pose.belly,
    move: pose.move,
  }, { face, overG: over });

  // arm from shoulder to just behind the racket head
  const hx = head.x - Math.cos(ang) * 12;
  const hy = head.y - Math.sin(ang) * 12;
  g.lineStyle(6, P.skin, 1);
  g.lineBetween(shoulder.x, shoulder.y, hx, hy);

  const skin = cos.racketSkin;
  const frameColor = racketFrameColor(skin, cos.racket);
  // noRacket：手上拿的是别的东西（健身房的哑铃），球拍交给调用方换成别的画法
  if (!noRacket) {
    g.save();
    g.translateCanvas(head.x, head.y);
    g.rotateCanvas(ang);
    // drawRacketHead 把拍框中心画在局部 (RACKET_HEAD_CX, 0)——往回挪它，
    // 让「看得见的拍面中心」正好落在模拟层的拍头点上（球在这里被判定击中）。
    g.translateCanvas(-RACKET_HEAD_CX, 0);
    drawRacketHead(g, now, skin, frameColor);
    g.restore();
  }

  if (contactR > 0 && hot > 0.15) {
    g.lineStyle(2, frameColor, 0.12 + 0.28 * hot);
    g.strokeCircle(head.x, head.y, contactR);
  }

  return { shoulder, head, ang };
}

// ---- 挥拍拖尾 ---------------------------------------------------------------

/** 拖尾寿命（秒）：挥过去这么久之后就完全淡掉 */
const TRAIL_LIFE = 0.46;
/** 慢于这个速度的采样不算挥拍（举着拍走 / 慢慢挪不拖尾巴） */
const TRAIL_MIN_SPEED = 150;

/** 5★ 挥拍拖尾：在全局增强（底光 + 更粗更亮）之上再叠一层星点 / 光环 */
const FIVE_STAR_SWINGS = new Set<string>([
  'atomic', 'drabreath', 'orbit', 'prism', 'voidcut',
  'desSwing', 'nimbSwing', 'confSwing', 'bigtSwing', 'aegisSwing',
  'chanSwing', 'arcanSwing', 'relicSwing', 'playSwing', 'yuanSwing',
  // 第三批新主题的挥拍拖尾（5★）
  'pirateSwing', 'steamSwing', 'astroSwing', 'juraSwing', 'mushSwing',
  'tropicSwing', 'cryptSwing', 'festivSwing', 'sushiSwing', 'wildSwing',
  // 第四批新主题的挥拍拖尾（5★）
  'vulcSwing', 'trenchSwing', 'dojoSwing', 'inkwSwing', 'fairySwing',
  'racerSwing', 'vampSwing', 'autumnSwing', 'pandaSwing', 'jokerSwing',
  'pagodSwing', 'stormSwing', 'lunarSwing', 'vikingSwing', 'safariSwing',
  'theatSwing', 'boreaSwing', 'venicSwing', 'olympSwing', 'sambaSwing',
]);

interface PathPt {
  x: number;
  y: number;
  /** 透明度：越旧越淡 × 越快越亮 */
  a: number;
  /** 这一点的带宽（拍头端最粗） */
  w: number;
}

/**
 * 挥拍拖尾：**沿拍头最近的真实轨迹画**（`path` = `RacketTracker.path.pts`）。
 *
 * 旧版是「以肩膀为圆心、当前拍角往回扫 0.55 弧度」的一段固定弧——不管你怎么挥
 * 都是同一形状，所以显得死板。现在每帧采样拍头位置，拖尾就是真实走过的那条线：
 * 上撩是上弧、下压是下劈、绕圈就是圈，带一点残影淡出。
 *
 * 每种风格都是**同一条轨迹 + 不同的画法**（带宽 / 分层 / 抖动 / 沿路粒子），
 * 所以 16 种风格共用一套路径逻辑（`SWING_TRAIL_COLORS` 不变，数据层零改动）。
 */
export function drawSwingTrail(
  g: Phaser.GameObjects.Graphics,
  now: number,
  cos: Cosmetic,
  sx: number,
  sy: number,
  _hx: number,
  _hy: number,
  _ang: number,
  hot: number,
  path?: readonly SwingSample[],
): void {
  const style: SwingTrailId = cos.swingTrail ?? 'none';
  if (!path || path.length < 3) return;

  // ---- ① 采样 → 世界坐标路径：慢速段丢掉、越旧越淡、拍头端最粗最亮 ----------
  const pts: PathPt[] = [];
  const tNow = path[path.length - 1].t;
  for (const s of path) {
    const age = tNow - s.t;
    if (age > TRAIL_LIFE || s.s < TRAIL_MIN_SPEED) continue;
    const fade = 1 - age / TRAIL_LIFE;
    const spd = Math.min(1, s.s / 1400);
    pts.push({ x: sx + s.rx, y: sy + s.ry, a: fade * (0.32 + 0.68 * spd), w: 0 });
  }
  if (pts.length < 2) return;
  const base = 7 + 13 * hot;
  for (let i = 0; i < pts.length; i++) {
    pts[i].w = base * (0.3 + 0.7 * (i / (pts.length - 1)));
  }

  // ---- ② 沿路径的小工具 ----------------------------------------------------
  /** 第 i 段的法线（i 从 1 开始） */
  const perp = (i: number): { x: number; y: number } => {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: -dy / len, y: dx / len };
  };
  /** 沿路径铺一条从细到粗、从淡到亮的带子（off = 朝法线方向整体挪多少） */
  const ribbon = (wm: number, color: number, am: number, off = 0): void => {
    for (let i = 1; i < pts.length; i++) {
      const p = perp(i);
      g.lineStyle(Math.max(1, pts[i].w * wm), color, Math.min(1, pts[i].a * am));
      g.lineBetween(
        pts[i - 1].x + p.x * off,
        pts[i - 1].y + p.y * off,
        pts[i].x + p.x * off,
        pts[i].y + p.y * off,
      );
    }
  };
  /** 白芯 */
  const core = (wm: number, am: number): void => ribbon(wm, 0xffffff, am);
  /** 路径上第 i 个点（可带法向偏移） */
  const at = (i: number, off = 0): { x: number; y: number } => {
    const p = perp(Math.max(1, i));
    return { x: pts[i].x + p.x * off, y: pts[i].y + p.y * off };
  };
  const dot = (i: number, r: number, color: number, am = 1): void => {
    const p = at(i);
    g.fillStyle(color, Math.min(1, pts[i].a * am));
    g.fillCircle(p.x, p.y, r);
  };
  /** 抖动带：每个点朝法线方向按 wave 偏移 */
  const wobble = (
    amp: (i: number) => number,
    wm: number,
    color: number,
    am: number,
  ): void => {
    for (let i = 1; i < pts.length; i++) {
      const p = perp(i);
      const o = amp(i);
      g.lineStyle(Math.max(1, pts[i].w * wm), color, Math.min(1, pts[i].a * am));
      g.lineBetween(
        pts[i - 1].x + p.x * amp(i - 1),
        pts[i - 1].y + p.y * amp(i - 1),
        pts[i].x + p.x * o,
        pts[i].y + p.y * o,
      );
    }
  };

  const color = SWING_TRAIL_COLORS[style] ?? cos.trail;
  const n = pts.length;

  if (style === 'none') {
    ribbon(1, cos.trail, 0.6);
    return;
  }

  // 全局底光：所有风格都先垫两层又宽又淡的光晕，挥拍轨迹在任何球场上都读得出来
  ribbon(3.2, color, 0.14);
  ribbon(2.0, color, 0.22);

  // 主题挥拍拖尾：逐款独立构图（draw/swings-theme/），复用同一条真实轨迹
  if (drawSwingCustom(g, now, hot, style, { pts, n, ribbon, core, at, dot, wobble }, color)) {
    if (FIVE_STAR_SWINGS.has(style)) starSwingExtras();
    return;
  }

  /** 5★ 专属华彩：沿轨迹撒星点 + 拍头脉冲光环 + 外扩余波 */
  function starSwingExtras(): void {
    const h = pts[n - 1];
    for (let i = 2; i < n; i += 2) {
      const p = at(i);
      const tw = 0.5 + 0.5 * Math.sin(now / 110 - i * 0.9);
      g.fillStyle(0xffffff, Math.min(1, pts[i].a * (0.5 + 0.5 * tw)));
      g.fillCircle(p.x, p.y, 1.4 + pts[i].w * 0.28);
    }
    g.lineStyle(2, color, Math.min(1, h.a * 0.9));
    g.strokeCircle(h.x, h.y, 12 + 8 * hot + Math.sin(now / 150) * 2.5);
    g.fillStyle(0xffffff, Math.min(1, 0.4 + 0.5 * hot));
    g.fillCircle(h.x, h.y, 4 + 4 * hot);
  }

  switch (style) {
    case 'slash': {
      // 斩击：宽刃带 + 白芯 + 拍头处一道大月牙斩弧
      ribbon(1.7, color, 1);
      ribbon(1.1, color, 0.55, 8);
      core(0.4, 1.2);
      const h1 = pts[n - 1];
      const a1 = Math.atan2(h1.y - pts[n - 3].y, h1.x - pts[n - 3].x);
      g.lineStyle(5 + 4 * hot, color, Math.min(1, h1.a * 1.2));
      g.beginPath();
      g.arc(h1.x, h1.y, 26 + 14 * hot, a1 - 1.15, a1 + 0.75);
      g.strokePath();
      g.lineStyle(2, 0xffffff, Math.min(1, h1.a * 1.1));
      g.beginPath();
      g.arc(h1.x, h1.y, 26 + 14 * hot, a1 - 0.9, a1 + 0.4);
      g.strokePath();
      break;
    }
    case 'atomic':
      // 原子吐息：深色底 + 三层电蓝 + 白芯 + 环绕电子
      ribbon(2.3, 0x123a4a, 0.85);
      ribbon(1.3, color, 1);
      ribbon(0.6, color, 0.85);
      core(0.3, 1);
      for (let k = 0; k < 3; k++) {
        const i = (Math.floor(now / 130) + k * 3) % n;
        const p = at(i);
        g.lineStyle(1.6, 0x9fe8ff, Math.min(1, pts[i].a));
        g.strokeCircle(p.x, p.y, 6 + 4 * hot);
      }
      break;
    case 'tempo':
      // 节拍器：细弧 + 交替长短刻度（节拍感）+ 拍头音符点
      ribbon(1, color, 1);
      for (let i = 2; i < n; i += 3) {
        const p = perp(i);
        const long = (i / 3) % 2 === 0;
        const len = long ? 10 + 9 * hot : 5;
        g.lineStyle(long ? 2.6 : 1.6, long ? 0xffffff : color, Math.min(1, pts[i].a * 1.3));
        g.lineBetween(
          pts[i].x - p.x * 4,
          pts[i].y - p.y * 4,
          pts[i].x + p.x * (4 + len),
          pts[i].y + p.y * (4 + len),
        );
      }
      break;
    case 'shock':
      // 冲击：三条错开的余波 + 拍头三重扩散环
      ribbon(1.1, color, 1);
      ribbon(0.7, color, 0.7, 6);
      ribbon(0.5, color, 0.45, -6);
      for (let k = 0; k < 3; k++) {
        const rr = 8 + k * 9 + 16 * hot + Math.sin(now / 130 - k) * 3;
        g.lineStyle(2.4 - k * 0.7, k === 0 ? 0xffffff : color, Math.min(1, pts[n - 1].a * (1.2 - k * 0.3)));
        g.strokeCircle(pts[n - 1].x, pts[n - 1].y, rr);
      }
      break;
    case 'cyclone': {
      // 旋风：轨迹上叠两道反向驻波 + 卷起的螺旋点
      wobble((i) => Math.sin((i / n) * Math.PI * 5) * 9, 0.9, color, 1.1);
      wobble((i) => -Math.sin((i / n) * Math.PI * 5 + 1.2) * 13, 0.5, color, 0.8);
      core(0.25, 1);
      for (let k = 0; k < 4; k++) {
        const i = (Math.floor(now / 110) + k * 4) % n;
        const q = at(i, Math.sin(i * 0.8 + now / 160) * 12);
        g.fillStyle(color, Math.min(1, pts[i].a));
        g.fillCircle(q.x, q.y, 2 + (k % 2) * 1.4);
      }
      break;
    }
    case 'afterimage':
      // 残像：同一条轨迹往法线方向再描两道 + 各带一颗残影点
      for (let k = 0; k < 3; k++) ribbon(1.15 - k * 0.28, color, 1 - k * 0.3, k * 5);
      for (let k = 1; k < 3; k++) {
        const i = Math.max(1, n - 1 - k * 4);
        const p = at(i, k * 5);
        g.fillStyle(0xffffff, Math.min(1, pts[i].a * (0.8 - k * 0.2)));
        g.fillCircle(p.x, p.y, 3.4 - k);
      }
      break;
    case 'bolt':
      // 落雷：锯齿
      wobble((i) => (i % 2 === 0 ? 7 : -7) * (0.4 + hot), 0.8, color, 1.2);
      core(0.3, 1.3);
      break;
    case 'blaze':
      // 烈焰：橙带 + 沿路的火苗
      ribbon(1.5, 0xff7a2a, 1);
      ribbon(0.7, 0xffe08a, 1);
      for (let i = 2; i < n; i += 2) {
        const p = perp(i);
        const q = at(i);
        const len = 10 + 12 * hot;
        g.fillStyle(0xff9a3c, Math.min(1, pts[i].a * 1.2));
        g.fillTriangle(q.x, q.y, q.x + p.x * len, q.y + p.y * len, q.x - p.y * 3, q.y + p.x * 3);
      }
      break;
    case 'frostbite': {
      // 冰痕：白芯 + 沿路六角冰晶（旋转）
      ribbon(0.9, color, 1);
      core(0.4, 1.2);
      for (let i = 1; i < n; i += 2) {
        const q = at(i);
        const r = 2.4 + 2.6 * hot;
        g.save();
        g.translateCanvas(q.x, q.y);
        g.rotateCanvas(now / 400 + i);
        g.lineStyle(1.4, 0xdcf4ff, Math.min(1, pts[i].a * 1.5));
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * Math.PI;
          g.lineBetween(-Math.cos(a) * r, -Math.sin(a) * r, Math.cos(a) * r, Math.sin(a) * r);
        }
        g.restore();
      }
      break;
    }
    case 'orbit': {
      // 星轨：细弧 + 几个沿路径跑的光点（带拖尾）
      ribbon(0.55, color, 1);
      const head0 = Math.floor(now / 90) % n;
      for (let k = 0; k < 5; k++) {
        const i = (head0 + k * 3) % n;
        dot(i, 2 + 2.5 * hot, 0xfff2b0, 1.6);
        if (i > 1) {
          const q0 = at(i);
          const q1 = at(i - 1);
          g.lineStyle(1.6, 0xfff2b0, Math.min(1, pts[i].a * 0.9));
          g.lineBetween(q1.x, q1.y, q0.x, q0.y);
        }
      }
      break;
    }
    case 'wave': {
      // 波浪：两条反向起伏的带子交织
      wobble((i) => Math.sin(i * 0.9 + now / 90) * 8, 0.8, color, 1.2);
      wobble((i) => -Math.sin(i * 0.9 + now / 90) * 8, 0.55, 0xffffff, 0.9);
      core(0.2, 1);
      break;
    }
    case 'thorn':
      // 荆棘：带子 + 垂直尖刺
      ribbon(0.8, color, 1);
      for (let i = 1; i < n; i += 2) {
        const p = perp(i);
        const len = 8 + 9 * hot;
        g.lineStyle(2, color, Math.min(1, pts[i].a * 1.3));
        g.lineBetween(pts[i].x, pts[i].y, pts[i].x + p.x * len, pts[i].y + p.y * len);
      }
      break;
    case 'prism':
      // 棱镜：轨迹按四色分段
      {
        const segs = [0xff8ad4, 0xffd45c, 0x8fe0ff, 0x9fe8b0];
        const q = Math.ceil(n / segs.length);
        for (let k = 0; k < segs.length; k++) {
          const from = k * q;
          const to = Math.min(n, from + q + 1);
          for (let i = Math.max(1, from); i < to; i++) {
            g.lineStyle(Math.max(1, pts[i].w * 1.4), segs[k], Math.min(1, pts[i].a * 1.2));
            g.lineBetween(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
          }
        }
      }
      break;
    case 'beam':
      // 激光切片：深底 + 亮芯 + 白边 + 星点
      ribbon(2.6, 0x0d3a2c, 0.85);
      ribbon(1.2, color, 1);
      core(0.3, 1.2);
      for (let i = 2; i < n; i += 3) dot(i, 2 + 2 * hot, 0xd8fff0, 1.4);
      break;
    case 'shardedge':
      // 碎晶刃：冰蓝带 + 白芯，沿路撒旋转的晶片
      ribbon(1.4, color, 1);
      core(0.45, 1.3);
      for (let i = 1; i < n; i += 2) {
        const q = at(i);
        g.save();
        g.translateCanvas(q.x, q.y);
        g.rotateCanvas(now / 200 + i);
        g.fillStyle(0xe8fbff, Math.min(1, pts[i].a * 1.3));
        g.fillTriangle(0, -4, 2.6, 2.6, -2.6, 2.6);
        g.restore();
      }
      break;
    case 'drabreath': {
      // 龙息：紫金双层 + 沿路星子，拍头处一团龙炎
      ribbon(2.2, 0x241d45, 0.85);
      ribbon(1.2, color, 1);
      ribbon(0.5, 0xffd45c, 1);
      for (let i = 2; i < n; i += 2) dot(i, 2 + 2 * hot, 0xfff2b0, 1.6);
      const h = pts[n - 1];
      g.fillStyle(0x9f7bff, Math.min(1, h.a * 1.4));
      g.fillCircle(h.x, h.y, 6 + 8 * hot);
      g.fillStyle(0xffd45c, Math.min(1, h.a * 1.2));
      g.fillCircle(h.x, h.y, 3 + 4 * hot);
      break;
    }
    case 'voidcut': {
      // 虚空斩：深紫底 + 亮刃口白线 + 沿路被吸进去的暗影点
      ribbon(2.3, 0x1a0b2e, 0.85);
      ribbon(0.8, color, 1);
      ribbon(0.35, 0xffffff, 1, -3);
      core(0.3, 1.1);
      for (let k = 0; k < 4; k++) {
        const i = (Math.floor(now / 100) + k * 3) % n;
        const q = at(i, Math.sin(i * 0.7 + now / 130) * 8);
        g.fillStyle(0x1a0b2e, Math.min(1, pts[i].a * 0.9));
        g.fillCircle(q.x, q.y, 2.4);
      }
      break;
    }
  }

  if (FIVE_STAR_SWINGS.has(style)) starSwingExtras();

  // 拍头那一点始终最亮：这是「正在挥拍」的视觉锚点
  g.fillStyle(0xffffff, Math.min(1, 0.25 + 0.55 * hot));
  g.fillCircle(pts[n - 1].x, pts[n - 1].y, 3 + 4.5 * hot);
}
