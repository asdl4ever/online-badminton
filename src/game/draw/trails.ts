import type Phaser from 'phaser';
import type { TrailId } from '../cosmetics';
import { THEME_TRAILS, drawThemeTrail } from './themeart';

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
 * - 新主题宝箱那批（21 款图案）走 `themeart` 的通用画法 `drawThemeTrail`；
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

  const themeTrail = THEME_TRAILS[style];
  if (themeTrail) {
    drawThemeTrail(g, themeTrail, pts, fade, now, base);
    g.fillStyle(base, 0.45 * fade);
    g.fillCircle(head.x, head.y, 5);
    return;
  }

  for (let i = 1; i < n; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const f = i / (n - 1);
    const wdt = 1 + f * 7;
    const a = (0.04 + f * 0.42) * fade;
    const color = colorAt(i * 0.02);
    switch (style) {
      case 'fire': {
        g.fillStyle(color, a * 1.15);
        g.fillCircle(p1.x + Math.sin(now / 90 + i) * 2, p1.y - f * 3, wdt * 0.7);
        if (i % 3 === 0) {
          g.fillStyle(0xffd07a, a * 0.7);
          g.fillCircle(p1.x, p1.y - 4, wdt * 0.4);
        }
        break;
      }
      case 'ice': {
        g.lineStyle(wdt, color, a);
        g.lineBetween(p0.x, p0.y, p1.x, p1.y);
        if (i % 4 === 0) {
          g.fillStyle(0xffffff, a * 0.8);
          g.fillTriangle(p1.x, p1.y - 4, p1.x - 3, p1.y + 3, p1.x + 3, p1.y + 3);
        }
        break;
      }
      case 'electric': {
        const jx = Math.sin(now / 60 + i * 1.7) * 3;
        const jy = Math.cos(now / 50 + i * 2.1) * 3;
        g.lineStyle(2 + f * 4, color, a * 1.3);
        g.lineBetween(p0.x, p0.y, p1.x + jx, p1.y + jy);
        break;
      }
      case 'leaf': {
        g.fillStyle(color, a * 1.3);
        g.fillEllipse(p1.x, p1.y, wdt * 1.8, wdt * 0.9);
        break;
      }
      case 'void': {
        g.fillStyle(0x120a20, a * 0.9);
        g.fillCircle(p1.x, p1.y, wdt * 0.7);
        g.fillStyle(color, a * 0.7);
        g.fillCircle(p1.x, p1.y, wdt * 0.35);
        break;
      }
      case 'gold': {
        g.fillStyle(color, a * 1.2);
        g.fillCircle(p1.x, p1.y, wdt * 0.55);
        if (i % 5 === 0) {
          g.lineStyle(1.5, 0xffffff, a);
          g.lineBetween(p1.x - 3, p1.y, p1.x + 3, p1.y);
          g.lineBetween(p1.x, p1.y - 3, p1.x, p1.y + 3);
        }
        break;
      }
      case 'stardust': {
        // 星尘拖尾：拖尾上缀着一路碎星，边上泛冷光
        g.lineStyle(2 + f * 5, color, a * 1.15);
        g.lineBetween(p0.x, p0.y, p1.x, p1.y);
        if (i % 2 === 0) {
          g.fillStyle(0xffffff, a * 0.85);
          g.fillCircle(p1.x, p1.y, wdt * 0.28);
          g.fillStyle(0x8fe0ff, a * 0.6);
          g.fillCircle(p1.x + (i % 4 ? 2 : -2), p1.y - 2, wdt * 0.18);
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
        const sq = Math.max(3, wdt * 0.9);
        g.fillStyle(color, a * 1.25);
        g.fillRect(p1.x - sq / 2, p1.y - sq / 2, sq, sq);
        break;
      }
      default: {
        g.fillStyle(color, a);
        g.fillCircle(p1.x, p1.y, wdt * 0.5);
        g.lineStyle(wdt, color, a);
        g.lineBetween(p0.x, p0.y, p1.x, p1.y);
        break;
      }
    }
  }
  g.fillStyle(colorAt(n * 0.02), 0.45 * fade);
  g.fillCircle(head.x, head.y, 5);
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
