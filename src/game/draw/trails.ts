import type Phaser from 'phaser';
import type { TrailId } from '../cosmetics';
import { drawTrailCustom } from './trails-theme';

/** 拖尾采样点：羽毛球飞过时留下的位置（游戏里是实时的点，试穿预览里是合成的轨迹） */
export interface TrailPoint {
  x: number;
  y: number;
}

/**
 * 击球拖尾：沿着一串采样点画，**画成什么样由「最后击球者」的拖尾风格决定**。
 *
 * 羽球对局（`GameScene.drawTrail`）与试穿预览（`canvas2d.paintActionPreview`）共用这一份，
 * 所以预览里看到的就是球场上看到的：
 * - 主题宝箱那批走 `trails-theme` 的逐款独立画法 `drawTrailCustom`；
 * - 老 12 款（火焰 / 电弧 / 冰痕 / 像素 / 彩虹 / 虚空 / 金 / 星尘 / 荧光 / 叶…）是下面这个 switch。
 */
export function drawShuttleTrail(
  g: Phaser.GameObjects.Graphics,
  style: TrailId,
  pts: readonly TrailPoint[],
  /** 0~1：整条拖尾的浓淡（球落地后会淡出） */
  fade: number,
  now: number,
  /** 拖尾主色（击球者的拖尾配色） */
  base: number,
): void {
  const n = pts.length;
  if (style === 'none' || n < 2) return;

  const head = pts[n - 1];
  const colorAt = (f: number): number =>
    style === 'rainbow' ? hsv((f + now / 4000) % 1, 0.85, 1) : base;

  // 主题拖尾（整条轨迹画法）：命中就不再走「点印章」
  if (drawTrailCustom(g, now, style, pts, fade)) {
    // 拍头亮核：外光晕 + 主色 + 白芯，让「球在哪」一眼看得到
    g.fillStyle(base, 0.22 * fade);
    g.fillCircle(head.x, head.y, 10);
    g.fillStyle(base, 0.6 * fade);
    g.fillCircle(head.x, head.y, 5.5);
    g.fillStyle(0xffffff, 0.7 * fade);
    g.fillCircle(head.x, head.y, 2.4);
    return;
  }

  // ① 底光：所有拖尾先铺一层更宽、更淡的光晕（垫在花纹下面），
  //    让线条在任何球场底色上都读得出来——「拖尾不明显」的第一处修正。
  for (let i = 1; i < n; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const f = i / (n - 1);
    g.lineStyle(6 + f * 14, colorAt(i * 0.02), (0.05 + f * 0.16) * fade);
    g.lineBetween(p0.x, p0.y, p1.x, p1.y);
  }

  for (let i = 1; i < n; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const f = i / (n - 1);
    const wdt = 2 + f * 10;
    const a = (0.10 + f * 0.55) * fade;
    const color = colorAt(i * 0.02);
    /** 段方向角（形状都朝飞行方向摆正） */
    const segAng = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    switch (style) {
      case 'fire': {
        // 火焰：主焰舌（后掠三角，随时间舔动）+ 内焰 + 上飘火星
        const flick = Math.sin(now / 80 + i * 1.3) * 0.35;
        const len = wdt * (1.7 + flick);
        g.fillStyle(color, a * 1.1);
        g.fillTriangle(
          p0.x, p0.y,
          p1.x + Math.cos(segAng + Math.PI / 2 + flick) * wdt * 0.55, p1.y + Math.sin(segAng + Math.PI / 2 + flick) * wdt * 0.55,
          p1.x + Math.cos(segAng) * len, p1.y + Math.sin(segAng) * len,
        );
        g.fillStyle(0xffd07a, a * 0.85);
        g.fillTriangle(
          p0.x, p0.y,
          p1.x, p1.y,
          p1.x + Math.cos(segAng) * len * 0.55, p1.y + Math.sin(segAng) * len * 0.55,
        );
        if (i % 3 === 0) {
          g.fillStyle(0xfff2c4, a * 0.7);
          g.fillCircle(p1.x - Math.cos(segAng) * 2, p1.y - 5 - (i % 2) * 3, wdt * 0.22);
        }
        break;
      }
      case 'ice': {
        // 冰痕：棱线带 + 沿路雪花晶（六向短枝）
        g.lineStyle(wdt, color, a);
        g.lineBetween(p0.x, p0.y, p1.x, p1.y);
        g.lineStyle(wdt * 0.4, 0xffffff, a * 0.8);
        g.lineBetween(p0.x, p0.y - 1, p1.x, p1.y - 1);
        if (i % 3 === 0) {
          const r = wdt * 0.75;
          g.save();
          g.translateCanvas(p1.x, p1.y);
          g.rotateCanvas(segAng + now / 500);
          g.lineStyle(1.5, 0xdcf4ff, a * 1.3);
          for (let k = 0; k < 3; k++) {
            const aa = (k / 3) * Math.PI;
            g.lineBetween(-Math.cos(aa) * r, -Math.sin(aa) * r, Math.cos(aa) * r, Math.sin(aa) * r);
          }
          g.restore();
        }
        break;
      }
      case 'electric': {
        // 电弧：主干锯齿 + 随机分叉支流 + 亮白芯
        const jx = Math.sin(now / 60 + i * 1.7) * 4;
        const jy = Math.cos(now / 50 + i * 2.1) * 4;
        g.lineStyle(2.4 + f * 5, color, a * 1.3);
        g.lineBetween(p0.x, p0.y, p1.x + jx, p1.y + jy);
        g.lineStyle(1.2, 0xffffff, a * 1.1);
        g.lineBetween(p0.x, p0.y - 1, p1.x + jx * 0.5, p1.y + jy * 0.5);
        if (i % 4 === 0) {
          const bx = jx > 0 ? 6 : -6;
          g.lineStyle(1.4, color, a);
          g.lineBetween(p1.x, p1.y, p1.x + bx, p1.y + 8);
          g.lineBetween(p1.x + bx, p1.y + 8, p1.x + bx - 3, p1.y + 14);
        }
        break;
      }
      case 'leaf': {
        // 落叶：一片片转着的叶子（两弧合抱 + 叶脉）沿轨迹翻飞
        g.save();
        g.translateCanvas(p1.x, p1.y);
        g.rotateCanvas(segAng + Math.sin(now / 300 + i) * 0.8);
        g.fillStyle(color, a * 1.25);
        g.fillPoints([
          { x: -wdt * 0.8, y: 0 }, { x: 0, y: -wdt * 0.55 }, { x: wdt * 0.8, y: 0 },
          { x: 0, y: wdt * 0.55 },
        ] as never, true);
        g.lineStyle(1, 0x2a4a1a, a * 0.8);
        g.lineBetween(-wdt * 0.7, 0, wdt * 0.7, 0);
        g.restore();
        break;
      }
      case 'void': {
        // 虚空：暗涡环（一圈圈收进去）+ 紫边 + 被吸入的光点
        const rr = wdt * (0.9 - (i % 3) * 0.18);
        g.lineStyle(1.8, color, a * 0.9);
        g.strokeCircle(p1.x, p1.y, rr);
        g.fillStyle(0x120a20, a * 0.95);
        g.fillCircle(p1.x, p1.y, rr * 0.62);
        g.fillStyle(color, a * 0.85);
        g.fillCircle(p1.x, p1.y, rr * 0.3);
        if (i % 2 === 0) {
          const sa = now / 200 + i;
          g.fillStyle(0xffffff, a * 0.6);
          g.fillCircle(p1.x + Math.cos(sa) * rr * 0.9, p1.y + Math.sin(sa) * rr * 0.9, 1.3);
        }
        break;
      }
      case 'gold': {
        // 金辉：金带 + 一路旋转的菱形金片（闪面）
        g.lineStyle(wdt * 0.6, color, a);
        g.lineBetween(p0.x, p0.y, p1.x, p1.y);
        if (i % 2 === 0) {
          const r = wdt * 0.6;
          g.save();
          g.translateCanvas(p1.x, p1.y);
          g.rotateCanvas(segAng + now / 350 + i);
          g.fillStyle(color, a * 1.2);
          g.fillPoints([
            { x: 0, y: -r }, { x: r * 0.6, y: 0 }, { x: 0, y: r }, { x: -r * 0.6, y: 0 },
          ] as never, true);
          g.fillStyle(0xffffff, a * 0.8);
          g.fillTriangle(0, -r * 0.5, r * 0.3, 0, 0, r * 0.2);
          g.restore();
        }
        break;
      }
      case 'stardust': {
        // 星尘：彗尾带 + 一路四芒小星（闪烁）
        g.lineStyle(2 + f * 5, color, a * 1.15);
        g.lineBetween(p0.x, p0.y, p1.x, p1.y);
        if (i % 2 === 0) {
          const r = wdt * 0.4 * (0.7 + 0.3 * Math.sin(now / 200 + i));
          g.fillStyle(0xffffff, a * 0.95);
          g.fillPoints([
            { x: p1.x, y: p1.y - r }, { x: p1.x + r * 0.32, y: p1.y - r * 0.32 },
            { x: p1.x + r, y: p1.y }, { x: p1.x + r * 0.32, y: p1.y + r * 0.32 },
            { x: p1.x, y: p1.y + r }, { x: p1.x - r * 0.32, y: p1.y + r * 0.32 },
            { x: p1.x - r, y: p1.y }, { x: p1.x - r * 0.32, y: p1.y - r * 0.32 },
          ] as never, true);
          g.fillStyle(0x8fe0ff, a * 0.6);
          g.fillCircle(p1.x + (i % 4 ? 3 : -3), p1.y - 2, wdt * 0.16);
        }
        break;
      }
      case 'neon': {
        // 荧光训练球：亮绿彗尾 + 间隔的白色闪点，像训练房的荧光标记
        g.lineStyle(2 + f * 5, color, a * 1.35);
        g.lineBetween(p0.x, p0.y, p1.x, p1.y);
        if (i % 3 === 0) {
          g.fillStyle(0xf4ffb0, a);
          g.fillCircle(p1.x, p1.y, wdt * 0.32);
        }
        break;
      }
      case 'pixel': {
        // 像素：路径量化成台阶方块（双色交替 + 描边）
        const sq = Math.max(4, wdt * 0.85);
        const qx = Math.round(p1.x / sq) * sq;
        const qy = Math.round(p1.y / sq) * sq;
        g.fillStyle(color, a * 1.25);
        g.fillRect(qx - sq / 2, qy - sq / 2, sq, sq);
        g.fillStyle(0xffffff, a * 0.35);
        g.fillRect(qx - sq / 2, qy - sq / 2, sq, sq * 0.3);
        break;
      }
      case 'rainbow': {
        // 彩虹：双色带绞成螺旋（色相沿程流动）
        const c2 = hsv((i * 0.05 + now / 4000 + 0.5) % 1, 0.85, 1);
        g.lineStyle(wdt * 0.75, color, a);
        g.lineBetween(p0.x, p0.y, p1.x, p1.y);
        const off = Math.sin(i * 0.9 + now / 200) * wdt * 0.5;
        g.lineStyle(wdt * 0.4, c2, a * 0.9);
        g.lineBetween(
          p0.x - Math.cos(segAng + Math.PI / 2) * off, p0.y - Math.sin(segAng + Math.PI / 2) * off,
          p1.x - Math.cos(segAng + Math.PI / 2) * off, p1.y - Math.sin(segAng + Math.PI / 2) * off,
        );
        break;
      }
      default: {
        // 经典：彗尾带 + 内白芯 + 头部双光点
        g.fillStyle(color, a * 0.9);
        g.fillCircle(p1.x, p1.y, wdt * 0.55);
        g.lineStyle(wdt * 0.6, color, a);
        g.lineBetween(p0.x, p0.y, p1.x, p1.y);
        g.lineStyle(wdt * 0.22, 0xffffff, a * 0.85);
        g.lineBetween(p0.x, p0.y - 1, p1.x, p1.y - 1);
        break;
      }
    }
  }
  // ② 高星拖尾（5★：彩虹 / 虚空）在全局增强之上再缀一圈沿路的星点 + 拍头脉冲光环
  if (style === 'rainbow' || style === 'void') {
    for (let i = 2; i < n; i += 2) {
      const p = pts[i];
      const f = i / (n - 1);
      const tw = 0.5 + 0.5 * Math.sin(now / 120 - i * 0.9);
      g.fillStyle(0xffffff, (0.35 + 0.5 * tw) * f * fade);
      g.fillCircle(p.x, p.y, 1.4 + 2.2 * f);
    }
    g.fillStyle(colorAt(n * 0.02), 0.28 * fade);
    g.fillCircle(head.x, head.y, 13);
    g.fillStyle(0xffffff, 0.85 * fade);
    g.fillCircle(head.x, head.y, 3.4);
    g.lineStyle(2, colorAt(n * 0.02), 0.6 * fade);
    g.strokeCircle(head.x, head.y, 9 + Math.sin(now / 160) * 2.5);
    // 5★ 专属：拍头外圈三颗绕转的光珠（慢速旋转，一眼认出的「满级排面」）
    for (let k = 0; k < 3; k++) {
      const a = now / 380 + (k / 3) * Math.PI * 2;
      g.fillStyle(k % 2 ? 0xffffff : colorAt(n * 0.02), 0.75 * fade);
      g.fillCircle(head.x + Math.cos(a) * 15, head.y + Math.sin(a) * 15, 2.6);
    }
    return;
  }

  // ③ 4★ 拖尾（老款式）：微星轨增强
  if (RICH_TRAILS.has(style)) richTrailExtras(g, pts, fade, now, colorAt(n * 0.02));

  // 拍头亮核（其余星级）
  g.fillStyle(colorAt(n * 0.02), 0.28 * fade);
  g.fillCircle(head.x, head.y, 9);
  g.fillStyle(colorAt(n * 0.02), 0.6 * fade);
  g.fillCircle(head.x, head.y, 5);
  g.fillStyle(0xffffff, 0.7 * fade);
  g.fillCircle(head.x, head.y, 2.4);
}

/**
 * **4★ 击球拖尾**：在各自拍法之上再叠一层「微星轨」——
 * 沿路洒白色小星点 + 拍头一圈细光环。比 1~3★ 明显更亮，
 * 又压得住 5★ 那套全场华彩（下面的 rainbow / void）。
 */
const RICH_TRAILS = new Set<string>([
  'stardust',
  // 第二、三批主题宝箱的 4★ 拖尾（各主题的 TrailB）
  'desTrailB', 'nimbTrailB', 'confTrailB', 'bigtTrailB', 'aegisTrailB',
  'chanTrailB', 'arcanTrailB', 'relicTrailB', 'playTrailB', 'yuanTrailB',
  'pirateTrailB', 'steamTrailB', 'astroTrailB', 'juraTrailB', 'mushTrailB',
  'tropicTrailB', 'cryptTrailB', 'festivTrailB', 'sushiTrailB', 'wildTrailB',
  // 第四批主题宝箱的 4★ 拖尾
  'vulcTrailB', 'trenchTrailB', 'dojoTrailB', 'inkwTrailB', 'fairyTrailB',
  'racerTrailB', 'vampTrailB', 'autumnTrailB', 'pandaTrailB', 'jokerTrailB',
  'pagodTrailB', 'stormTrailB', 'lunarTrailB', 'vikingTrailB', 'safariTrailB',
  'theatTrailB', 'boreaTrailB', 'venicTrailB', 'olympTrailB', 'sambaTrailB',
  // 🏟 操场跑量里程碑
  'runTrail',
]);

/** 沿路微星轨 + 拍头细光环（4★ 档的共用增强） */
function richTrailExtras(
  g: Phaser.GameObjects.Graphics,
  pts: readonly TrailPoint[],
  fade: number,
  now: number,
  color: number,
): void {
  const n = pts.length;
  for (let i = 2; i < n; i += 4) {
    const p = pts[i];
    const f = i / (n - 1);
    const tw = 0.5 + 0.5 * Math.sin(now / 150 - i);
    g.fillStyle(0xffffff, (0.25 + 0.4 * tw) * f * fade);
    g.fillCircle(p.x, p.y, 1 + 1.6 * f);
  }
  const head = pts[n - 1];
  g.lineStyle(1.6, color, 0.5 * fade);
  g.strokeCircle(head.x, head.y, 8 + Math.sin(now / 200) * 1.5);
}

/**
 * 彩虹拖尾用的色相换算（和原先 `Phaser.Display.Color.HSVToRGB(h, 0.85, 1)` 同值）。
 * 这里**故意不引 Phaser 的 `Display.Color`**——本模块会被 DOM 层的试穿预览
 * （`canvas2d`）拉进来，引 Phaser 的运行时就不干净了。
 */
function hsv(h: number, s: number, v: number): number {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const [r, g, b] =
    i % 6 === 0 ? [v, t, p]
    : i % 6 === 1 ? [q, v, p]
    : i % 6 === 2 ? [p, v, t]
    : i % 6 === 3 ? [p, q, v]
    : i % 6 === 4 ? [t, p, v]
    : [v, p, q];
  return (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255);
}
