import Phaser from 'phaser';
import { PLAYER_H } from '../constants';
import type { CharacterPose } from './character';

/**
 * 主题宝箱的**共享绘制工具箱**。
 *
 * 10 个新主题各有 16 件定制装扮（形象 / 坐骑 / 头饰 / 翅膀 / 披风 / 光环 /
 * 地环 / 球拍皮肤 / 拖尾），加起来一百多件。与其给每件写真函数，不如把「造型」
 * 拆成**可复用的图案 + 配色**：
 *
 * - 一件物品 = 一条 spec（图案 + 主色 + 点缀色），spec 表在本文件底部；
 * - 各部位的绘制函数（`drawHat` / `drawAura` / `drawRing` / `drawMount` /
 *   `drawRacketTrim` / `drawTrail` / `drawSwingTrail` / `drawCharacter`）
 *   在最前面查一次自己的 spec 表，命中就走这里的通用画法。
 *
 * 所以加一件新装扮通常只改 `cosmetics.ts` 的表 + `items.ts` 一行 + 这里的 spec。
 */

// ---- 图案（ornament）：一个可复用的小图标，到处都是它 --------------------
export type Ornament =
  | 'orb' | 'star' | 'petal' | 'leaf' | 'flame' | 'snow' | 'bolt' | 'gear'
  | 'gem' | 'crescent' | 'sun' | 'skull' | 'wing' | 'crown' | 'block'
  | 'horn' | 'bone' | 'shell' | 'cloud' | 'bubble' | 'eye' | 'clover'
  | 'mushroom' | 'balloon' | 'bell' | 'lantern' | 'fan' | 'sword' | 'shield'
  | 'book' | 'flask' | 'puzzle' | 'heart' | 'note' | 'coin' | 'anchor'
  | 'feather' | 'drop' | 'wheel' | 'kite' | 'banner' | 'candy' | 'top';

const TAU = Math.PI * 2;

/** 画一个图案，中心在 (x, y)，`s` 是半径尺度 */
export function drawOrnament(
  g: Phaser.GameObjects.Graphics,
  o: Ornament,
  x: number,
  y: number,
  s: number,
  color: number,
  accent: number,
  now = 0,
): void {
  const spin = now / 900;
  switch (o) {
    case 'orb': {
      g.fillStyle(color, 1);
      g.fillCircle(x, y, s);
      g.fillStyle(0xffffff, 0.5);
      g.fillCircle(x - s * 0.3, y - s * 0.3, s * 0.35);
      break;
    }
    case 'star': {
      g.fillStyle(color, 1);
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i / 5) * TAU + spin * 0.2;
        const a2 = a + Math.PI / 5;
        g.fillTriangle(
          x, y,
          x + Math.cos(a) * s, y + Math.sin(a) * s,
          x + Math.cos(a2) * s * 0.42, y + Math.sin(a2) * s * 0.42,
        );
        g.fillTriangle(
          x, y,
          x + Math.cos(a2) * s * 0.42, y + Math.sin(a2) * s * 0.42,
          x + Math.cos(a + TAU / 5) * s, y + Math.sin(a + TAU / 5) * s,
        );
      }
      break;
    }
    case 'petal': {
      g.fillStyle(color, 1);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + spin * 0.3;
        g.fillEllipse(x + Math.cos(a) * s * 0.55, y + Math.sin(a) * s * 0.55, s, s * 0.7);
      }
      g.fillStyle(accent, 1);
      g.fillCircle(x, y, s * 0.4);
      break;
    }
    case 'leaf': {
      g.fillStyle(color, 1);
      g.fillEllipse(x, y, s * 1.5, s * 0.8);
      g.lineStyle(1.4, accent, 0.8);
      g.lineBetween(x - s * 0.7, y, x + s * 0.7, y);
      break;
    }
    case 'flame': {
      const w = 1 + 0.12 * Math.sin(now / 120);
      g.fillStyle(accent, 1);
      g.fillTriangle(x - s * 0.7, y + s * 0.8, x, y - s * 1.4 * w, x + s * 0.7, y + s * 0.8);
      g.fillStyle(color, 1);
      g.fillTriangle(x - s * 0.42, y + s * 0.7, x, y - s * 0.6 * w, x + s * 0.42, y + s * 0.7);
      break;
    }
    case 'snow': {
      g.lineStyle(1.8, color, 0.95);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI + spin * 0.25;
        g.lineBetween(x - Math.cos(a) * s, y - Math.sin(a) * s, x + Math.cos(a) * s, y + Math.sin(a) * s);
      }
      break;
    }
    case 'bolt': {
      g.fillStyle(color, 1);
      g.fillTriangle(x - s * 0.4, y - s, x + s * 0.3, y - s * 0.1, x - s * 0.1, y - s * 0.1);
      g.fillTriangle(x + s * 0.1, y + s * 0.1, x - s * 0.3, y + s, x + s * 0.45, y + s * 0.1);
      break;
    }
    case 'gear': {
      g.fillStyle(color, 1);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + spin * 0.5;
        g.fillRect(x + Math.cos(a) * s - 1.6, y + Math.sin(a) * s - 1.6, 3.2, 3.2);
      }
      g.fillCircle(x, y, s * 0.72);
      g.fillStyle(accent, 1);
      g.fillCircle(x, y, s * 0.3);
      break;
    }
    case 'gem': {
      g.fillStyle(color, 0.95);
      g.fillTriangle(x, y - s, x + s * 0.8, y, x, y + s);
      g.fillTriangle(x, y - s, x - s * 0.8, y, x, y + s);
      g.fillStyle(0xffffff, 0.35);
      g.fillTriangle(x, y - s, x - s * 0.4, y - s * 0.1, x, y);
      break;
    }
    case 'crescent': {
      // 一轮月：主色圆 + 偏上的点缀色圆，读起来像月亮/行星
      g.fillStyle(color, 1);
      g.fillCircle(x, y, s);
      g.fillStyle(accent, 1);
      g.fillCircle(x + s * 0.42, y - s * 0.2, s * 0.78);
      break;
    }
    case 'sun': {
      g.fillStyle(accent, 1);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + spin * 0.2;
        g.fillTriangle(
          x + Math.cos(a + 0.16) * s * 0.7, y + Math.sin(a + 0.16) * s * 0.7,
          x + Math.cos(a) * s * 1.4, y + Math.sin(a) * s * 1.4,
          x + Math.cos(a - 0.16) * s * 0.7, y + Math.sin(a - 0.16) * s * 0.7,
        );
      }
      g.fillStyle(color, 1);
      g.fillCircle(x, y, s * 0.7);
      break;
    }
    case 'skull': {
      g.fillStyle(color, 1);
      g.fillCircle(x, y - s * 0.15, s);
      g.fillRect(x - s * 0.5, y + s * 0.4, s, s * 0.5);
      g.fillStyle(accent, 1);
      g.fillCircle(x - s * 0.38, y - s * 0.15, s * 0.28);
      g.fillCircle(x + s * 0.38, y - s * 0.15, s * 0.28);
      break;
    }
    case 'wing': {
      const f = Math.sin(now / 300) * 0.25;
      g.fillStyle(color, 1);
      for (const d of [-1, 1]) {
        g.save();
        g.translateCanvas(x, y);
        g.rotateCanvas(d * (0.35 + f));
        g.fillEllipse(d * s * 0.9, 0, s * 1.4, s * 0.6);
        g.restore();
      }
      break;
    }
    case 'crown': {
      g.fillStyle(color, 1);
      g.fillTriangle(x - s * 0.8, y + s * 0.4, x - s * 0.5, y - s * 0.8, x - s * 0.2, y + s * 0.4);
      g.fillTriangle(x - s * 0.25, y + s * 0.4, x, y - s * 1, x + s * 0.25, y + s * 0.4);
      g.fillTriangle(x + s * 0.2, y + s * 0.4, x + s * 0.5, y - s * 0.8, x + s * 0.8, y + s * 0.4);
      g.fillRect(x - s * 0.85, y + s * 0.4, s * 1.7, s * 0.35);
      break;
    }
    case 'block': {
      // 积木：一块方砖 + 一圈内衬（Canvas2D 适配层没有 strokeRoundedRect，用叠一层代替）
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - s, y - s, s * 2, s * 2, s * 0.25);
      g.fillStyle(accent, 0.85);
      g.fillRoundedRect(x - s * 0.62, y - s * 0.62, s * 1.24, s * 1.24, s * 0.18);
      break;
    }
    case 'horn': {
      g.fillStyle(color, 1);
      g.fillTriangle(x - s, y + s, x + s, y + s, x + s * 0.4, y - s * 1.2);
      break;
    }
    case 'bone': {
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - s * 0.15, y - s * 0.7, s * 0.3, s * 1.4, s * 0.15);
      g.fillCircle(x, y - s * 0.7, s * 0.4);
      g.fillCircle(x, y + s * 0.7, s * 0.4);
      break;
    }
    case 'shell': {
      g.fillStyle(color, 0.95);
      g.fillEllipse(x, y, s * 2, s * 1.6);
      g.lineStyle(1.4, accent, 0.85);
      for (let i = -2; i <= 2; i++) {
        g.lineBetween(x, y + s * 0.7, x + i * s * 0.35, y - s * 0.7);
      }
      break;
    }
    case 'cloud': {
      g.fillStyle(color, 1);
      g.fillCircle(x - s * 0.6, y + s * 0.2, s * 0.55);
      g.fillCircle(x, y - s * 0.2, s * 0.75);
      g.fillCircle(x + s * 0.6, y + s * 0.2, s * 0.55);
      break;
    }
    case 'bubble': {
      g.lineStyle(1.8, color, 0.95);
      g.strokeCircle(x, y, s);
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(x - s * 0.3, y - s * 0.35, s * 0.25);
      break;
    }
    case 'eye': {
      g.fillStyle(color, 1);
      g.fillEllipse(x, y, s * 2, s * 1.1);
      g.fillStyle(accent, 1);
      g.fillCircle(x, y, s * 0.45);
      break;
    }
    case 'clover': {
      g.fillStyle(color, 1);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU;
        g.fillCircle(x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.5, s * 0.5);
      }
      break;
    }
    case 'mushroom': {
      g.fillStyle(color, 1);
      g.fillEllipse(x, y - s * 0.2, s * 2, s * 1.1);
      g.fillStyle(accent, 1);
      g.fillRoundedRect(x - s * 0.35, y - s * 0.1, s * 0.7, s * 1.1, s * 0.2);
      break;
    }
    case 'balloon': {
      const b = Math.sin(now / 400) * s * 0.12;
      g.fillStyle(color, 1);
      g.fillEllipse(x, y - b, s * 1.3, s * 1.6);
      g.lineStyle(1.2, accent, 0.8);
      g.lineBetween(x, y + s * 0.8 - b, x, y + s * 1.5);
      break;
    }
    case 'bell': {
      const sw = Math.sin(now / 500) * 0.2;
      g.save();
      g.translateCanvas(x, y);
      g.rotateCanvas(sw);
      g.fillStyle(color, 1);
      g.fillTriangle(-s * 0.7, s * 0.9, s * 0.7, s * 0.9, 0, -s * 0.7);
      g.fillRoundedRect(-s * 0.7, s * 0.4, s * 1.4, s * 0.5, s * 0.15);
      g.restore();
      g.fillStyle(accent, 1);
      g.fillCircle(x, y + s * 1.15, s * 0.22);
      break;
    }
    case 'lantern': {
      g.fillStyle(color, 1);
      g.fillEllipse(x, y, s * 1.5, s * 1.9);
      g.fillStyle(accent, 0.9);
      g.fillRect(x - s * 0.7, y - s * 1.05, s * 1.4, s * 0.25);
      g.fillRect(x - s * 0.7, y + s * 0.8, s * 1.4, s * 0.25);
      g.lineStyle(1.2, accent, 0.7);
      g.lineBetween(x, y + s * 1.05, x, y + s * 1.5);
      break;
    }
    case 'fan': {
      const fold = 0.6 + 0.2 * Math.sin(now / 350);
      g.fillStyle(color, 1);
      for (let i = 0; i < 7; i++) {
        const a = -fold + (i / 6) * fold * 2 - Math.PI / 2;
        g.fillTriangle(x, y, x + Math.cos(a) * s * 1.5, y + Math.sin(a) * s * 1.5, x + Math.cos(a + 0.12) * s * 1.5, y + Math.sin(a + 0.12) * s * 1.5);
      }
      break;
    }
    case 'sword': {
      g.fillStyle(color, 1);
      g.fillRect(x - s * 0.18, y - s * 1.2, s * 0.36, s * 1.9);
      g.fillStyle(accent, 1);
      g.fillRect(x - s * 0.7, y + s * 0.5, s * 1.4, s * 0.3);
      g.fillRect(x - s * 0.15, y + s * 0.8, s * 0.3, s * 0.7);
      break;
    }
    case 'shield': {
      g.fillStyle(color, 1);
      g.fillTriangle(x - s, y - s * 0.8, x + s, y - s * 0.8, x, y + s);
      g.fillRect(x - s, y - s * 1.1, s * 2, s * 0.5);
      g.lineStyle(1.6, accent, 0.9);
      g.lineBetween(x, y - s * 0.9, x, y + s * 0.7);
      break;
    }
    case 'book': {
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - s, y - s * 0.8, s * 1.9, s * 1.6, s * 0.15);
      g.fillStyle(accent, 1);
      g.fillRect(x - s * 0.15, y - s * 0.8, s * 0.3, s * 1.6);
      break;
    }
    case 'flask': {
      g.fillStyle(color, 0.95);
      g.fillRect(x - s * 0.18, y - s * 1.1, s * 0.36, s * 0.5);
      g.fillTriangle(x - s * 0.8, y + s, x + s * 0.8, y + s, x, y - s * 0.5);
      g.fillStyle(accent, 1);
      g.fillCircle(x, y + s * 0.5, s * 0.28);
      break;
    }
    case 'puzzle': {
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - s, y - s, s * 2, s * 2, s * 0.2);
      g.fillStyle(accent, 1);
      g.fillCircle(x, y - s, s * 0.35);
      g.fillCircle(x + s, y, s * 0.35);
      break;
    }
    case 'heart': {
      const b = 1 + 0.1 * Math.sin(now / 260);
      g.fillStyle(color, 1);
      g.fillCircle(x - s * 0.45 * b, y - s * 0.3, s * 0.5 * b);
      g.fillCircle(x + s * 0.45 * b, y - s * 0.3, s * 0.5 * b);
      g.fillTriangle(x - s * 0.9 * b, y - s * 0.05, x + s * 0.9 * b, y - s * 0.05, x, y + s * b);
      break;
    }
    case 'note': {
      g.fillStyle(color, 1);
      g.fillEllipse(x - s * 0.35, y + s * 0.6, s * 0.9, s * 0.7);
      g.fillRect(x - s * 0.05, y - s, s * 0.16, s * 1.7);
      g.fillRect(x - s * 0.05, y - s, s * 0.7, s * 0.3);
      break;
    }
    case 'coin': {
      g.fillStyle(color, 1);
      g.fillCircle(x, y, s);
      g.fillStyle(accent, 1);
      g.fillCircle(x, y, s * 0.62);
      g.fillStyle(color, 1);
      g.fillCircle(x, y, s * 0.4);
      break;
    }
    case 'anchor': {
      g.lineStyle(2.2, color, 1);
      g.lineBetween(x, y - s, x, y + s * 0.6);
      g.lineBetween(x - s * 0.7, y - s * 0.5, x + s * 0.7, y - s * 0.5);
      g.strokeCircle(x, y - s * 1.05, s * 0.3);
      g.lineBetween(x - s * 0.7, y + s * 0.3, x - s * 0.7, y + s * 0.9);
      g.lineBetween(x + s * 0.7, y + s * 0.3, x + s * 0.7, y + s * 0.9);
      break;
    }
    case 'feather': {
      g.fillStyle(color, 1);
      g.fillEllipse(x, y, s * 0.8, s * 1.8);
      g.lineStyle(1.2, accent, 0.85);
      g.lineBetween(x, y - s, x, y + s);
      break;
    }
    case 'drop': {
      g.fillStyle(color, 1);
      g.fillCircle(x, y + s * 0.35, s * 0.65);
      g.fillTriangle(x - s * 0.6, y + s * 0.3, x + s * 0.6, y + s * 0.3, x, y - s);
      break;
    }
    case 'wheel': {
      g.lineStyle(2, color, 1);
      g.strokeCircle(x, y, s);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + spin;
        g.lineBetween(x, y, x + Math.cos(a) * s, y + Math.sin(a) * s);
      }
      break;
    }
    case 'kite': {
      const b = Math.sin(now / 300) * 0.2;
      g.save();
      g.translateCanvas(x, y);
      g.rotateCanvas(b);
      g.fillStyle(color, 1);
      g.fillTriangle(0, -s, s * 0.7, 0, 0, s);
      g.fillTriangle(0, -s, -s * 0.7, 0, 0, s);
      g.restore();
      break;
    }
    case 'banner': {
      const w = Math.sin(now / 250) * s * 0.18;
      g.fillStyle(color, 1);
      g.fillRect(x - s * 0.5, y - s, s * 1, s * 2);
      g.fillStyle(accent, 1);
      g.fillTriangle(x - s * 0.5, y + s, x + s * 0.5, y + s, x + w, y + s * 1.4);
      break;
    }
    case 'candy': {
      g.fillStyle(color, 1);
      g.fillCircle(x, y, s);
      g.lineStyle(2, accent, 0.9);
      for (let i = -1; i <= 1; i++) {
        g.lineBetween(x + i * s * 0.5, y - s * 0.7, x + i * s * 0.5 + s * 0.4, y + s * 0.7);
      }
      break;
    }
    case 'top': {
      // 陀螺：左右摇晃的倒三角 + 顶上的小轴
      const tilt = Math.sin(now / 200) * 0.25;
      g.save();
      g.translateCanvas(x, y + s * 0.5);
      g.rotateCanvas(tilt);
      g.fillStyle(color, 1);
      g.fillTriangle(-s, 0, s, 0, 0, -s * 1.5);
      g.fillStyle(accent, 1);
      g.fillRect(-s * 0.12, -s * 1.5, s * 0.24, s * 0.5);
      g.restore();
      break;
    }
    default:
      break;
  }
}

// ---- 角色形象（skin）--------------------------------------------------------
// 10 个主题各有一只**独立造型**的「神怪」形象：不一样的剪影 + 自己的动态。
// 全部围着 x / feetY / topY 画，`now` 驱动摆动 / 呼吸 / 闪烁 / 旋转。
// `drawCharacter` 在 else-if 链最后查 `THEME_SKIN_ART`。

/** 眨眼开合（1 睁 / 0 闭） */
function blinkAt(now: number, period = 3400, dur = 170): number {
  const t = now % period;
  if (t < period - dur) return 1;
  return Math.abs(1 - ((t - (period - dur)) / dur) * 2);
}

/** 一对圆眼（会眨 + 高光） */
function eyes(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  off: number,
  r: number,
  open: number,
  ink: number,
): void {
  const rh = Math.max(1.1, r * open);
  g.fillStyle(ink, 1);
  g.fillEllipse(cx - off, cy, r * 1.7, rh * 1.7);
  g.fillEllipse(cx + off, cy, r * 1.7, rh * 1.7);
  if (open > 0.5) {
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(cx - off + r * 0.5, cy - r * 0.5, r * 0.4);
    g.fillCircle(cx + off + r * 0.5, cy - r * 0.5, r * 0.4);
  }
}

/** 🏜️ 沙灯神：浮在半空的灯神——下半身是一缕摇摆的烟尾，上身抱臂、头顶一簇火苗 */
function drawDesJinn(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const bob = Math.sin(now / 520) * 3.5;
  const baseY = feetY - 4 + bob;
  const teal = 0x2fb0a8;
  const tealDark = 0x1f7a76;
  const gold = 0xffc24a;
  const skin = 0xf0c9a0;
  const ink = 0x143a38;

  g.fillStyle(0x000000, 0.12);
  g.fillEllipse(x, feetY + 2, 40, 9);
  // 烟尾：三段，越往下越细、摆得越开
  for (let k = 2; k >= 0; k--) {
    const ph = now / 620 + k * 1.1;
    g.fillStyle(tealDark, 0.55 - k * 0.12);
    g.fillEllipse(x + Math.sin(ph) * (6 + k * 4), baseY - 2 + k * 13, 30 - k * 7, 22 - k * 4);
  }
  // 上身 + 金腰带 + 抱臂
  g.fillStyle(teal, 1);
  g.fillRoundedRect(x - 16, baseY - 62, 32, 46, 13);
  g.fillStyle(gold, 1);
  g.fillRect(x - 16, baseY - 30, 32, 6);
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x - 23, baseY - 48, 22, 10, 5);
  g.fillRoundedRect(x + 1, baseY - 53, 22, 10, 5);
  g.fillStyle(gold, 1);
  g.fillCircle(x - 21, baseY - 43, 4);
  g.fillCircle(x + 21, baseY - 48, 4);
  // 头 + 金耳环 + 火苗
  const hy = baseY - 78;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 15);
  g.fillStyle(gold, 1);
  g.fillCircle(x - 14, hy + 3, 3.2);
  g.fillCircle(x + 14, hy + 3, 3.2);
  eyes(g, x + f * 2, hy - 2, 5.5, 3.4, blinkAt(now), ink);
  const flick = 0.7 + 0.3 * Math.sin(now / 90);
  g.fillStyle(0xffd45c, 0.9);
  g.fillTriangle(x - 5, hy - 14, x + 5, hy - 14, x, hy - 14 - 15 * flick);
  g.fillStyle(0xfff0b0, 1);
  g.fillCircle(x, hy - 14, 2.4);
}

/** ☁️ 云风伯：一朵会飘的云，肚里闪着雷、两边卷着风 */
function drawNimbLord(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const drift = Math.sin(now / 900) * 3;
  const cy = feetY - 46 + Math.sin(now / 600) * 2;
  const white = 0xf2f8ff;
  const blue = 0xa8d4f5;
  const ink = 0x2a4a6a;

  g.fillStyle(0x000000, 0.1);
  g.fillEllipse(x, feetY + 2, 46, 9);
  // 底部一朵朵翻滚的云（各自相位）
  g.fillStyle(blue, 1);
  for (let k = -2; k <= 2; k++) {
    const ph = now / 520 + k;
    g.fillCircle(x + k * 13 + Math.sin(ph) * 2, cy + 16 + Math.cos(ph) * 2, 13 - Math.abs(k) * 1.6);
  }
  // 上面的大云团
  g.fillStyle(white, 1);
  g.fillCircle(x - 10, cy - 2, 16);
  g.fillCircle(x + 6, cy - 6, 18);
  g.fillCircle(x + 20, cy + 3, 14);
  g.fillCircle(x - 22, cy + 7, 12);
  eyes(g, x + f * 3, cy - 4, 5.5, 3.6, blinkAt(now), ink);
  // 云里闪的雷（闪烁）
  if (Math.sin(now / 130) > 0.5) {
    g.fillStyle(0xffe08a, 1);
    g.fillTriangle(x - 4, cy - 42, x + 7, cy - 42, x - 3, cy - 28);
    g.fillTriangle(x - 3, cy - 31, x + 8, cy - 31, x + 1, cy - 17);
  }
  // 两侧的旋风弧
  g.lineStyle(2.4, white, 0.7);
  g.beginPath();
  g.arc(x - 30 - drift, cy + 6, 10, -1.2, 1.2, false, 0);
  g.strokePath();
  g.beginPath();
  g.arc(x + 30 + drift, cy + 6, 10, Math.PI - 1.2, Math.PI + 1.2, false, 0);
  g.strokePath();
}

/** 🧁 糖霜魔女：糖果条纹的尖帽 + 波浪裙摆 + 一根棒棒糖法杖 */
function drawConfWitch(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const sway = Math.sin(now / 700);
  const pink = 0xff9ec4;
  const cream = 0xfff0f4;
  const candy = 0xff5a9e;
  const ink = 0x7a3550;

  g.fillStyle(0x000000, 0.1);
  g.fillEllipse(x, feetY + 2, 44, 9);
  // 裙摆
  g.fillStyle(pink, 1);
  g.fillTriangle(x - 26, feetY - 4, x + 26, feetY - 4, x + 14, feetY - 52);
  g.fillTriangle(x - 26, feetY - 4, x - 14, feetY - 52, x + 14, feetY - 52);
  g.fillStyle(candy, 1);
  for (let k = -2; k <= 2; k++) g.fillCircle(x + k * 11 + sway * 2, feetY - 4, 6);
  // 上身 + 围裙
  g.fillStyle(cream, 1);
  g.fillRoundedRect(x - 12, feetY - 78, 24, 30, 9);
  g.fillStyle(0xffffff, 0.7);
  g.fillRoundedRect(x - 8, feetY - 62, 16, 30, 4);
  // 头
  const hy = feetY - 90;
  g.fillStyle(0xffe0c8, 1);
  g.fillCircle(x, hy, 14);
  eyes(g, x + f * 2, hy - 1, 5, 3.4, blinkAt(now), ink);
  g.fillStyle(0xffb7d5, 0.7);
  g.fillCircle(x - 11, hy + 4, 3);
  g.fillCircle(x + 11, hy + 4, 3);
  // 尖帽 + 沿帽向上转的糖霜螺旋
  g.fillStyle(cream, 1);
  g.fillTriangle(x - 20, hy - 12, x + 20, hy - 12, x + 6 + sway * 6, hy - 48);
  g.fillStyle(candy, 1);
  for (let k = 0; k < 6; k++) {
    const t = (k / 6 + (now / 1600) % 1) % 1;
    g.fillCircle(x + 6 + sway * 6 - 8 + t * 14, hy - 14 - t * 32, 2.6 - t * 1.3);
  }
  // 棒棒糖法杖
  g.fillStyle(0xffffff, 1);
  g.fillRect(x + 20, feetY - 50, 3, 44);
  g.fillStyle(0xff7ab0, 1);
  g.fillCircle(x + 21, feetY - 52, 9);
  g.lineStyle(2, 0xffffff, 0.9);
  g.beginPath();
  g.arc(x + 21, feetY - 52, 5, -0.4, 3.6, false, 0);
  g.strokePath();
}

/** 🎪 幻术师：斜条纹礼服 + 领结 + 高礼帽，两张扑克牌绕着飘 */
function drawBigtMagician(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const purple = 0x4a1a4a;
  const cream = 0xf2ede0;
  const red = 0xc0392b;
  const gold = 0xffd45c;
  const ink = 0x2a0a2a;

  g.fillStyle(0x000000, 0.12);
  g.fillEllipse(x, feetY + 2, 44, 9);
  // 上半身 + 斜条纹
  g.fillStyle(cream, 1);
  g.fillRoundedRect(x - 16, feetY - 72, 32, 44, 12);
  for (let k = -2; k <= 2; k++) {
    g.save();
    g.translateCanvas(x, feetY - 50);
    g.rotateCanvas(-0.5);
    g.fillStyle(red, 1);
    g.fillRect(-20, k * 12 - 3, 40, 6);
    g.restore();
  }
  // 燕尾
  g.fillStyle(purple, 1);
  g.fillTriangle(x - 16, feetY - 32, x + 16, feetY - 32, x - 22, feetY - 2);
  g.fillTriangle(x - 16, feetY - 32, x + 16, feetY - 32, x + 22, feetY - 2);
  // 领结 + 头
  g.fillStyle(red, 1);
  g.fillTriangle(x - 8, feetY - 76, x, feetY - 71, x - 8, feetY - 66);
  g.fillTriangle(x + 8, feetY - 76, x, feetY - 71, x + 8, feetY - 66);
  const hy = feetY - 88;
  g.fillStyle(0xffe0c8, 1);
  g.fillCircle(x, hy, 14);
  eyes(g, x + f * 2, hy - 1, 5, 3.4, blinkAt(now), ink);
  // 高礼帽
  g.fillStyle(purple, 1);
  g.fillRoundedRect(x - 17, hy - 16, 34, 6, 2);
  g.fillRoundedRect(x - 12, hy - 32, 24, 18, 3);
  g.fillStyle(gold, 1);
  g.fillRect(x - 12, hy - 18, 24, 4);
  // 两张绕圈的牌
  for (let k = 0; k < 2; k++) {
    const a = now / 700 + k * Math.PI;
    const cx = x + Math.cos(a) * 30;
    const cy = feetY - 60 + Math.sin(a) * 10;
    g.save();
    g.translateCanvas(cx, cy);
    g.rotateCanvas(a * 0.6);
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(-6, -9, 12, 18, 2);
    g.fillStyle(k === 0 ? red : ink, 1);
    g.fillCircle(0, 0, 3);
    g.restore();
  }
}

/** 🛡️ 圣盾神：全身重甲、正面一面带十字的大盾、盔上插着金羽 */
function drawAegisGod(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const steel = 0xaab4c2;
  const dark = 0x5a6a80;
  const gold = 0xffd45c;
  const glow = 0.5 + 0.5 * Math.sin(now / 500);

  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(x, feetY + 2, 48, 10);
  // 身后光晕
  g.fillStyle(0x8fb4de, 0.16 + 0.12 * glow);
  g.fillEllipse(x, feetY - 52, 80, 112);
  // 腿甲
  g.fillStyle(dark, 1);
  g.fillRoundedRect(x - 16, feetY - 30, 13, 30, 4);
  g.fillRoundedRect(x + 3, feetY - 30, 13, 30, 4);
  // 胸甲 + 肩甲
  g.fillStyle(steel, 1);
  g.fillRoundedRect(x - 20, feetY - 74, 40, 48, 10);
  g.fillStyle(dark, 1);
  g.fillRect(x - 20, feetY - 40, 40, 6);
  g.fillStyle(steel, 1);
  g.fillCircle(x - 22, feetY - 70, 10);
  g.fillCircle(x + 22, feetY - 70, 10);
  // 大盾
  g.fillStyle(dark, 1);
  g.fillEllipse(x + f * 4, feetY - 50, 36, 46);
  g.fillStyle(steel, 1);
  g.fillEllipse(x + f * 4, feetY - 50, 29, 39);
  g.fillStyle(gold, 1);
  g.fillRect(x + f * 4 - 2, feetY - 66, 4, 32);
  g.fillRect(x + f * 4 - 12, feetY - 53, 24, 4);
  // 头盔 + 面罩缝 + 金羽
  const hy = feetY - 90;
  g.fillStyle(dark, 1);
  g.fillCircle(x, hy, 15);
  g.fillStyle(0x2a3446, 1);
  g.fillRoundedRect(x - 13, hy - 4, 26, 9, 3);
  g.fillStyle(0x9fd8ff, 0.85);
  g.fillRect(x - 12, hy - 2, 24, 4);
  g.fillStyle(gold, 1);
  for (let k = 0; k < 5; k++) {
    g.fillTriangle(x - 10 + k * 5, hy - 13, x - 6 + k * 5, hy - 13, x - 8 + k * 5, hy - 24);
  }
}

/** 🍵 茶仙：斗笠 + 宽袍 + 一杯冒热气的茶 */
function drawChanImmortal(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const sway = Math.sin(now / 800);
  const jade = 0x3f8a5a;
  const jadeDark = 0x2a5f3a;
  const gold = 0xd8c07a;
  const skin = 0xf2d8b8;
  const ink = 0x1e3a2a;

  g.fillStyle(0x000000, 0.1);
  g.fillEllipse(x, feetY + 2, 46, 9);
  // 道袍
  g.fillStyle(jade, 1);
  g.fillTriangle(x - 28, feetY - 2, x + 28, feetY - 2, x + 12, feetY - 54);
  g.fillTriangle(x - 28, feetY - 2, x - 12, feetY - 54, x + 12, feetY - 54);
  g.fillStyle(gold, 1);
  g.fillRect(x - 28, feetY - 8, 56, 5);
  // 腰带 + 上身
  g.fillStyle(jadeDark, 1);
  g.fillRoundedRect(x - 14, feetY - 64, 28, 28, 8);
  g.fillStyle(gold, 1);
  g.fillRect(x - 16, feetY - 48, 32, 5);
  // 头
  const hy = feetY - 78;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 13);
  eyes(g, x + f * 2, hy - 1, 5, 3.2, blinkAt(now), ink);
  // 斗笠
  g.fillStyle(gold, 1);
  g.beginPath();
  g.arc(x + sway * 2, hy - 6, 26, Math.PI, Math.PI * 2, false, 0);
  g.closePath();
  g.fillPath();
  g.fillStyle(jadeDark, 1);
  g.fillCircle(x + sway * 2, hy - 6, 3.4);
  // 茶 + 热气
  g.fillStyle(0xffffff, 1);
  g.fillRoundedRect(x + 18, feetY - 40, 14, 10, 3);
  g.fillStyle(0x6a8a3a, 1);
  g.fillEllipse(x + 25, feetY - 40, 10, 3);
  for (let k = 0; k < 3; k++) {
    const t = (now / 2200 + k / 3) % 1;
    g.fillStyle(0xffffff, 0.5 * (1 - t));
    g.fillCircle(x + 25 + Math.sin(t * 6 + k) * 3, feetY - 42 - t * 30, 3 - t * 1.6);
  }
}

/** 🔮 星界魔导：长袍 + 星月尖帽，三颗符文绕着身体转 */
function drawArcanMage(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const robe = 0x5540a0;
  const robeDark = 0x3a2a70;
  const gold = 0xffd45c;
  const star = 0xb46cff;
  const ink = 0x1e1440;

  g.fillStyle(0x000000, 0.12);
  g.fillEllipse(x, feetY + 2, 46, 9);
  g.fillStyle(star, 0.14 + 0.08 * Math.sin(now / 500));
  g.fillEllipse(x, feetY - 54, 72, 104);
  // 长袍 + 金边
  g.fillStyle(robe, 1);
  g.fillTriangle(x - 26, feetY - 2, x + 26, feetY - 2, x + 14, feetY - 56);
  g.fillTriangle(x - 26, feetY - 2, x - 14, feetY - 56, x + 14, feetY - 56);
  g.fillStyle(gold, 1);
  g.fillRect(x - 27, feetY - 7, 54, 5);
  // 上身 + 手臂
  g.fillStyle(robe, 1);
  g.fillRoundedRect(x - 15, feetY - 76, 30, 42, 10);
  g.fillStyle(robeDark, 1);
  g.fillRoundedRect(x + 12, feetY - 68, 11, 28, 5);
  // 头 + 白胡子
  const hy = feetY - 90;
  g.fillStyle(0xf0d8c0, 1);
  g.fillCircle(x, hy, 13);
  eyes(g, x + f * 2, hy - 1, 5, 3.2, blinkAt(now), ink);
  g.fillStyle(0xffffff, 0.92);
  g.fillTriangle(x - 9, hy + 8, x + 9, hy + 8, x, hy + 22);
  // 尖帽 + 闪光星
  g.fillStyle(robe, 1);
  g.fillTriangle(x - 20, hy - 8, x + 20, hy - 8, x + 8, hy - 48);
  g.fillStyle(gold, 1);
  g.fillRect(x - 20, hy - 11, 40, 5);
  const tw = 0.5 + 0.5 * Math.sin(now / 300);
  drawOrnament(g, 'star', x + 8, hy - 44, 5 + tw * 2, gold, star, now);
  // 环绕的符文
  for (let k = 0; k < 3; k++) {
    const a = now / 800 + (k / 3) * TAU;
    g.fillStyle(star, 0.92);
    g.fillCircle(x + Math.cos(a) * 34, feetY - 58 + Math.sin(a) * 12, 3.4);
  }
}

/** 🦴 白骨祭司：骷髅头配琥珀眼窝、呼吸的肋骨、破袍 + 琥珀法杖 */
function drawRelicPriest(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const feetY = pose.feetY;
  const breathe = Math.sin(now / 700);
  const glow = 0.6 + 0.4 * Math.sin(now / 420);
  const bone = 0xd8c8a0;
  const boneDark = 0xa89070;
  const amber = 0xffb02a;
  const robe = 0x4a3a24;
  const ink = 0x2e2414;

  g.fillStyle(0x000000, 0.12);
  g.fillEllipse(x, feetY + 2, 46, 9);
  // 破袍
  g.fillStyle(robe, 1);
  g.fillTriangle(x - 24, feetY - 2, x + 24, feetY - 2, x + 12, feetY - 54);
  g.fillTriangle(x - 24, feetY - 2, x - 12, feetY - 54, x + 12, feetY - 54);
  // 呼吸中的肋骨
  g.fillStyle(bone, 1);
  for (let k = 0; k < 4; k++) {
    const inset = Math.abs(k - 1.5) * 1.6;
    g.fillRoundedRect(x - 13 + inset, feetY - 52 + k * 9 + breathe, 26 - inset * 2, 5, 2.5);
  }
  g.fillStyle(boneDark, 1);
  g.fillRoundedRect(x - 2, feetY - 34, 4, 30, 2);
  // 骷髅头
  const hy = feetY - 74;
  g.fillStyle(bone, 1);
  g.fillCircle(x, hy, 14);
  g.fillRoundedRect(x - 8, hy + 8, 16, 9, 4);
  g.fillStyle(ink, 1);
  g.fillEllipse(x - 5, hy - 1, 8, 9);
  g.fillEllipse(x + 5, hy - 1, 8, 9);
  g.fillStyle(amber, glow);
  g.fillCircle(x - 5, hy - 1, 3);
  g.fillCircle(x + 5, hy - 1, 3);
  g.fillStyle(ink, 1);
  g.fillRect(x - 6, hy + 11, 2, 5);
  g.fillRect(x, hy + 11, 2, 5);
  g.fillRect(x + 4, hy + 11, 2, 5);
  // 法杖 + 发光琥珀
  g.fillStyle(0x6a5a3a, 1);
  g.fillRect(x + 24, feetY - 78, 4, 76);
  g.fillStyle(amber, 0.3 + 0.4 * glow);
  g.fillCircle(x + 26, feetY - 82, 9);
  g.fillStyle(amber, 0.92);
  g.fillCircle(x + 26, feetY - 82, 5);
}

/** 🧸 发条神：方头木偶，胸口齿轮与背后发条钥匙一起转，两条胳膊交替摆 */
function drawPlayClockwork(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const turn = now / 300;
  const wood = 0xc98a4a;
  const woodDark = 0x9a6330;
  const red = 0xe8402a;
  const blue = 0x4a90d9;
  const ink = 0x2a1a0a;

  g.fillStyle(0x000000, 0.12);
  g.fillEllipse(x, feetY + 2, 44, 9);
  // 腿
  g.fillStyle(woodDark, 1);
  g.fillRoundedRect(x - 15, feetY - 24, 12, 24, 3);
  g.fillRoundedRect(x + 3, feetY - 24, 12, 24, 3);
  // 身体 + 腰带
  g.fillStyle(wood, 1);
  g.fillRoundedRect(x - 20, feetY - 68, 40, 46, 6);
  g.fillStyle(red, 1);
  g.fillRect(x - 20, feetY - 52, 40, 4);
  // 胸口齿轮（转）
  g.save();
  g.translateCanvas(x, feetY - 40);
  g.rotateCanvas(turn);
  g.fillStyle(blue, 1);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * TAU;
    g.fillRect(Math.cos(a) * 9 - 3, Math.sin(a) * 9 - 3, 6, 6);
  }
  g.fillCircle(0, 0, 7);
  g.restore();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(x, feetY - 40, 3);
  // 交替摆的胳膊
  const sw = Math.sin(now / 400) * 6;
  g.fillStyle(woodDark, 1);
  g.fillRoundedRect(x - 31, feetY - 64 + sw, 12, 8, 4);
  g.fillRoundedRect(x + 19, feetY - 64 - sw, 12, 8, 4);
  // 方头 + 灯眼
  const hy = feetY - 82;
  g.fillStyle(wood, 1);
  g.fillRoundedRect(x - 16, hy - 14, 32, 30, 5);
  g.fillStyle(ink, 1);
  g.fillCircle(x - 6, hy, 3.4);
  g.fillCircle(x + 6, hy, 3.4);
  g.fillStyle(0xffe08a, 1);
  g.fillCircle(x - 6, hy, 1.4);
  g.fillCircle(x + 6, hy, 1.4);
  g.fillStyle(red, 1);
  g.fillRect(x - 8, hy + 8, 16, 3);
  // 背后转动的发条钥匙
  g.save();
  g.translateCanvas(x - f * 20, hy - 2);
  g.rotateCanvas(turn * 1.4);
  g.fillStyle(0xd8b060, 1);
  g.fillRect(-2, -12, 4, 24);
  g.fillCircle(0, -12, 6);
  g.fillCircle(0, 12, 6);
  g.restore();
}

/** 🏮 灯神元夕：红袍 + 手提一盏随风摆的灯笼，头上顶着一盏、四周绕着焰火 */
function drawYuanLantern(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const sway = Math.sin(now / 700);
  const glow = 0.5 + 0.5 * Math.sin(now / 480);
  const red = 0xd42a2a;
  const gold = 0xffd45c;
  const warm = 0xffb060;
  const ink = 0x4a0f18;

  g.fillStyle(0x000000, 0.12);
  g.fillEllipse(x, feetY + 2, 46, 9);
  g.fillStyle(warm, 0.13 + 0.1 * glow);
  g.fillEllipse(x, feetY - 54, 82, 112);
  // 红袍 + 金边 + 上身
  g.fillStyle(red, 1);
  g.fillTriangle(x - 24, feetY - 2, x + 24, feetY - 2, x + 12, feetY - 54);
  g.fillTriangle(x - 24, feetY - 2, x - 12, feetY - 54, x + 12, feetY - 54);
  g.fillStyle(gold, 1);
  g.fillRect(x - 24, feetY - 7, 48, 5);
  g.fillStyle(red, 1);
  g.fillRoundedRect(x - 14, feetY - 72, 28, 36, 9);
  g.fillStyle(gold, 1);
  g.fillRect(x - 14, feetY - 60, 28, 4);
  // 头
  const hy = feetY - 84;
  g.fillStyle(0xf2d8b8, 1);
  g.fillCircle(x, hy, 13);
  eyes(g, x + f * 2, hy - 1, 5, 3.2, blinkAt(now), ink);
  // 头顶灯笼
  g.fillStyle(red, 1);
  g.fillEllipse(x, hy - 24 + sway * 2, 24, 28);
  g.fillStyle(gold, 1);
  g.fillRect(x - 12, hy - 24 + sway * 2, 24, 3);
  g.fillStyle(0xfff0b0, 0.7 + 0.3 * glow);
  g.fillEllipse(x, hy - 24 + sway * 2, 11, 14);
  // 手提灯笼（发光 + 摆）
  const lx = x + 22;
  const ly = feetY - 44 + sway * 2;
  g.fillStyle(0xd8a24a, 1);
  g.fillRect(lx - 1, ly - 24, 2, 10);
  g.fillStyle(0xff5a4a, 1);
  g.fillEllipse(lx, ly, 22, 26);
  g.fillStyle(gold, 1);
  g.fillRect(lx - 11, ly - 3, 22, 4);
  g.fillRect(lx - 9, ly - 14, 18, 3);
  g.fillRect(lx - 9, ly + 8, 18, 3);
  g.fillStyle(0xfff0b0, 0.7 + 0.3 * glow);
  g.fillEllipse(lx, ly, 10, 13);
  // 环绕的焰火
  for (let k = 0; k < 4; k++) {
    const a = now / 900 + (k / 4) * TAU;
    g.fillStyle(warm, 0.85);
    g.fillCircle(x + Math.cos(a) * 32, feetY - 58 + Math.sin(a) * 14, 2.8);
  }
}

// ---- 🗺️ 山海宝箱：10 只《山海经》怪物皮肤 ----------------------------------
// 都是宝箱专属的 5★，抽中率极低（见 `Item.pullWeight`）。剪影比普通形象夸张得多，
// 每只都带自己的动态：摆尾 / 扇翼 / 吐毒 / 睁闭眼 / 呼吸 / 踏步…

/** 🐉 烛龙：人面蛇身，通体赤红；睁眼为昼、闭眼为夜 */
function drawZhuLong(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const red = 0xd42a2a;
  const redDark = 0x8a1220;
  const scale = 0xf06a4a;

  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(x, feetY + 2, 52, 10);
  // 蛇身：沿一条正弦往下盘，越往下越细，尾尖甩到身后
  for (let k = 0; k <= 9; k++) {
    const t = k / 9;
    const bx = x + Math.sin(now / 620 + k * 0.5) * (10 + t * 14) - f * t * 18;
    const by = feetY - 6 - t * (PLAYER_H - 26);
    const r = 15 - t * 9;
    g.fillStyle(k % 2 ? red : redDark, 1);
    g.fillCircle(bx, by, r);
    if (k % 3 === 0) {
      g.fillStyle(scale, 0.7);
      g.fillCircle(bx, by, r * 0.5);
    }
  }
  // 背上的火鬃
  for (let k = 0; k < 5; k++) {
    const by = feetY - 22 - k * 14;
    const fl = 7 + 5 * Math.sin(now / 90 + k);
    g.fillStyle(0xff8a3c, 0.85);
    g.fillTriangle(x + 9, by, x + 16, by, x + 12 - f * 5, by - fl);
  }
  // 昼夜：眼睛慢慢睁 / 闭（睁时四周泛白昼之光）
  const cyc = now % 3000;
  const open = cyc < 1500 ? Math.min(1, cyc / 260) : cyc < 2400 ? 1 - Math.min(1, (cyc - 1500) / 260) : 0;
  if (open > 0.02) {
    g.fillStyle(0xfff0b0, 0.1 + 0.16 * open);
    g.fillCircle(x, topY + 16, 44 + 12 * open);
  }
  // 人面
  const hy = topY + 16;
  g.fillStyle(0xe8b48a, 1);
  g.fillCircle(x, hy, 15);
  g.fillStyle(redDark, 1);
  g.fillRect(x - 15, hy - 17, 30, 7);
  g.fillStyle(redDark, 1);
  g.fillTriangle(x - 15, hy - 14, x - 6, hy - 15, x - 13, hy - 30);
  g.fillTriangle(x + 15, hy - 14, x + 6, hy - 15, x + 13, hy - 30);
  g.fillStyle(0xfff6e0, 1);
  g.fillEllipse(x - 6, hy - 1, 9, 11 * (0.14 + 0.86 * open));
  g.fillEllipse(x + 6, hy - 1, 9, 11 * (0.14 + 0.86 * open));
  if (open > 0.45) {
    g.fillStyle(0xffc24a, 1);
    g.fillCircle(x - 6, hy - 1, 3.4);
    g.fillCircle(x + 6, hy - 1, 3.4);
  } else {
    g.fillStyle(redDark, 1);
    g.fillRect(x - 11, hy - 1, 9, 2.4);
    g.fillRect(x + 2, hy - 1, 9, 2.4);
  }
}

/** 🐍 相柳：蛇身九头，九首皆人面，所到之处喷毒为沼 */
function drawXiangLiu(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const body = 0x3a6a4a;
  const bodyDark = 0x27492f;
  const skin = 0xa8d8b0;
  const ink = 0x14301e;

  // 盘在下方的蛇身
  for (let k = 0; k <= 6; k++) {
    const t = k / 6;
    g.fillStyle(k % 2 ? body : bodyDark, 1);
    g.fillCircle(x + Math.sin(now / 700 + k * 0.6) * (14 * (1 - t)), feetY - 4 - t * 26, 14 - t * 5);
  }
  // 九个脖子 + 人面，扇形排开
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.3;
    const len = 46 + Math.sin(now / 640 + i * 0.8) * 5;
    const hx = x + Math.cos(a) * len;
    const hy = topY + 26 + Math.sin(a) * 30;
    g.lineStyle(Math.max(2.5, 6 - Math.abs(i - 4) * 0.5), i % 2 ? body : bodyDark, 1);
    g.lineBetween(x, feetY - 26, hx, hy);
    g.fillStyle(skin, 1);
    g.fillCircle(hx, hy, 7.5);
    g.fillStyle(ink, 1);
    g.fillCircle(hx - 2.5, hy - 1.5, 1.7);
    g.fillCircle(hx + 2.5, hy - 1.5, 1.7);
    // 嘴里往下滴的毒
    const dt = (now / 1400 + i / 9) % 1;
    g.fillStyle(0x9fe86a, 0.75 * (1 - dt));
    g.fillCircle(hx, hy + 6 + dt * 24, 2.4 - dt * 1.4);
  }
  // 脚下毒沼
  g.fillStyle(0x6a8a2a, 0.45);
  g.fillEllipse(x, feetY + 2, 66 + 4 * Math.sin(now / 500), 12);
  g.fillStyle(0x9fe86a, 0.35);
  g.fillEllipse(x, feetY + 1, 40, 8);
}

/** 🐯 穷奇：状如虎，身披猬毛，有翼，食人 */
function drawQiongQi(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const fur = 0x5a4a3a;
  const furLight = 0x7a6a52;
  const quill = 0xe8e0d0;
  const wing = 0x2f2a3a;
  const fang = 0xfff4e0;
  const flap = Math.sin(now / 300);
  const bristle = 7 + 4 * Math.sin(now / 500);

  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(x, feetY + 2, 68, 11);
  // 翅膀（背后扇动）
  g.fillStyle(wing, 0.95);
  g.fillTriangle(x - 6, topY + 52, x - 54, topY + 28 - flap * 12, x - 20, topY + 76);
  g.fillTriangle(x + 6, topY + 52, x + 54, topY + 28 - flap * 12, x + 20, topY + 76);
  // 四足
  g.fillStyle(fur, 1);
  for (let k = 0; k < 4; k++) g.fillRoundedRect(x + (k - 1.5) * 16 - 4, feetY - 26, 8, 26, 3);
  // 身躯
  g.fillStyle(fur, 1);
  g.fillEllipse(x, feetY - 44, 68, 46);
  g.fillStyle(furLight, 1);
  g.fillEllipse(x, feetY - 34, 52, 26);
  // 背上的猬毛（会立起来）
  g.fillStyle(quill, 1);
  for (let k = -3; k <= 3; k++) {
    const sx = x + k * 9;
    const h = bristle + Math.abs(k) * 2;
    g.fillTriangle(sx - 3, topY + 50, sx + 3, topY + 50, sx, topY + 50 - h);
  }
  // 虎头 + 獠牙 + 角
  const hy = topY + 34;
  g.fillStyle(fur, 1);
  g.fillCircle(x + f * 4, hy, 17);
  g.fillStyle(furLight, 1);
  g.fillEllipse(x + f * 4, hy + 8, 22, 12);
  g.fillStyle(0xffe08a, 1);
  g.fillTriangle(x + f * 4 - 12, hy - 14, x + f * 4 - 5, hy - 14, x + f * 4 - 10, hy - 28);
  g.fillTriangle(x + f * 4 + 12, hy - 14, x + f * 4 + 5, hy - 14, x + f * 4 + 10, hy - 28);
  g.fillStyle(0xff3a3a, 1);
  g.fillCircle(x + f * 4 - 6, hy - 2, 3.2);
  g.fillCircle(x + f * 4 + 6, hy - 2, 3.2);
  g.fillStyle(fang, 1);
  g.fillTriangle(x + f * 4 - 7, hy + 10, x + f * 4 - 3, hy + 10, x + f * 4 - 5, hy + 18);
  g.fillTriangle(x + f * 4 + 7, hy + 10, x + f * 4 + 3, hy + 10, x + f * 4 + 5, hy + 18);
}

/** 👹 饕餮：羊身人面、目在腋下、虎齿人爪 */
function drawTaoTie(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const bronze = 0x7a8a4a;
  const bronzeDark = 0x4a5a30;
  const gold = 0xffd45c;
  const tooth = 0xfff6e0;
  const ink = 0x2a3018;
  const chomp = (Math.sin(now / 420) + 1) / 2; // 0 闭 1 开

  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(x, feetY + 2, 60, 11);
  // 羊身
  g.fillStyle(bronze, 1);
  g.fillEllipse(x, feetY - 40, 58, 64);
  // 人爪（左右各一）
  g.fillStyle(0xe8b48a, 1);
  g.fillCircle(x - 30, feetY - 52, 8);
  g.fillCircle(x + 30, feetY - 52, 8);
  g.fillStyle(ink, 1);
  for (let k = -1; k <= 1; k++) {
    g.fillTriangle(x - 30 + k * 5, feetY - 46, x - 28 + k * 5, feetY - 46, x - 29 + k * 5, feetY - 38);
    g.fillTriangle(x + 30 + k * 5, feetY - 46, x + 32 + k * 5, feetY - 46, x + 31 + k * 5, feetY - 38);
  }
  // 巨口（下颚随咀嚼张开）+ 虎齿
  const my = feetY - 54;
  g.fillStyle(0xd42a3a, 1);
  g.fillEllipse(x, my + 4 + chomp * 6, 40, 8 + chomp * 8);
  g.fillStyle(bronzeDark, 1);
  g.fillRoundedRect(x - 26, my - 16, 52, 16, 5);
  g.fillRoundedRect(x - 26, my + 8 + chomp * 14, 52, 16, 5);
  g.fillStyle(tooth, 1);
  for (let k = -3; k <= 3; k++) {
    g.fillTriangle(x + k * 7 - 2.6, my, x + k * 7 + 2.6, my, x + k * 7, my + 10);
    g.fillTriangle(
      x + k * 7 - 2.6, my + 8 + chomp * 14,
      x + k * 7 + 2.6, my + 8 + chomp * 14,
      x + k * 7, my - 2 + chomp * 14,
    );
  }
  // 目在腋下：长在身体两侧下方、会发光
  const eg = 0.6 + 0.4 * Math.sin(now / 380);
  g.fillStyle(0xffe08a, eg);
  g.fillEllipse(x - 23, feetY - 24, 13, 9);
  g.fillEllipse(x + 23, feetY - 24, 13, 9);
  g.fillStyle(ink, 1);
  g.fillCircle(x - 23, feetY - 24, 3);
  g.fillCircle(x + 23, feetY - 24, 3);
  // 人面（无眼，只有嘴）+ 羊角
  const fy = topY + 24;
  g.fillStyle(0xe8b48a, 1);
  g.fillCircle(x, fy, 13);
  g.fillStyle(ink, 1);
  g.fillEllipse(x, fy + 5, 10, 4);
  g.fillStyle(gold, 1);
  g.fillTriangle(x - 20, fy - 4, x - 8, fy - 4, x - 27, fy - 26);
  g.fillTriangle(x + 20, fy - 4, x + 8, fy - 4, x + 27, fy - 26);
}

/** 🐗 梼杌：状如虎，人面虎足猪口牙，尾长一丈八尺 */
function drawTaoWu(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const fur = 0x8a6a3a;
  const stripe = 0xd8a24a;
  const furDark = 0x5a4426;
  const tusk = 0xfff4e0;

  g.fillStyle(0x000000, 0.13);
  g.fillEllipse(x, feetY + 2, 62, 11);
  // 长尾：一串圆沿长弧甩出去，越远越细
  for (let k = 0; k <= 11; k++) {
    const t = k / 11;
    const tx = x - f * (14 + t * 76);
    const ty = feetY - 40 - t * 30 + Math.sin(now / 420 - t * 4) * (6 + t * 16);
    g.fillStyle(k % 2 ? stripe : fur, 1);
    g.fillCircle(tx, ty, 8 - t * 4.5);
  }
  // 四足（虎足）
  for (let k = 0; k < 4; k++) {
    const lx = x + (k - 1.5) * 16;
    g.fillStyle(fur, 1);
    g.fillRoundedRect(lx - 4.5, feetY - 28, 9, 28, 3);
    g.fillStyle(0x2a2218, 1);
    g.fillRect(lx - 5, feetY - 5, 10, 5);
  }
  // 身躯 + 虎纹
  g.fillStyle(fur, 1);
  g.fillEllipse(x, feetY - 46, 62, 46);
  g.fillStyle(stripe, 0.85);
  for (let k = -2; k <= 2; k++) g.fillRect(x + k * 11 - 2, feetY - 62, 4, 30);
  // 犬毛领
  g.fillStyle(furDark, 1);
  for (let k = -4; k <= 4; k++) {
    g.fillTriangle(x + k * 7 - 3, topY + 52, x + k * 7 + 3, topY + 52, x + k * 7, topY + 40);
  }
  // 人面 + 猪口牙
  const hy = topY + 30;
  g.fillStyle(0xe8b48a, 1);
  g.fillCircle(x, hy, 14);
  g.fillStyle(0x3a2a18, 1);
  g.fillRect(x - 14, hy - 17, 28, 6);
  eyes(g, x + f * 2, hy - 2, 5, 3.2, blinkAt(now), 0x2a2218);
  g.fillStyle(0xd8a0a8, 1);
  g.fillEllipse(x, hy + 7, 12, 8);
  g.fillStyle(0x2a2218, 1);
  g.fillCircle(x - 3, hy + 7, 1.6);
  g.fillCircle(x + 3, hy + 7, 1.6);
  g.fillStyle(tusk, 1);
  g.fillTriangle(x - 9, hy + 10, x - 5, hy + 10, x - 8, hy + 19);
  g.fillTriangle(x + 9, hy + 10, x + 5, hy + 10, x + 8, hy + 19);
}

/** 🟡 混沌：状如黄囊，赤如丹火，六足四翼，浑敦无面目 */
function drawHunDun(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const feetY = pose.feetY;
  const skin = 0xe8c04a;
  const skinDark = 0xc09a30;
  const ink = 0x8a5a10;
  const puff = 1 + 0.05 * Math.sin(now / 300);

  // 四翼（各自相位扇动）
  for (let k = 0; k < 4; k++) {
    const side = k < 2 ? -1 : 1;
    const up = k % 2 === 0;
    const flap = Math.sin(now / 260 + k * 1.6) * 0.35;
    g.save();
    g.translateCanvas(x + side * 24, feetY - (up ? 64 : 46));
    g.rotateCanvas(side * (0.5 + flap) * (up ? 1 : -1));
    g.fillStyle(0xff8a3c, 0.92);
    g.fillEllipse(side * 18, 0, 34, 12);
    g.restore();
  }
  // 六足（小碎步）
  g.fillStyle(0x9a7a20, 1);
  for (let k = 0; k < 6; k++) {
    const lx = x + (k - 2.5) * 10;
    const step = Math.sin(now / 260 + k * 1.3) * 3;
    g.fillRoundedRect(lx - 3, feetY - 18 + step, 6, 18, 3);
  }
  // 赤如丹火的光
  g.fillStyle(0xff5a2a, 0.2 + 0.12 * Math.sin(now / 320));
  g.fillCircle(x, feetY - 52, 48 * puff);
  // 无面目的黄囊（呼吸）
  g.fillStyle(skin, 1);
  g.fillEllipse(x, feetY - 52, 68 * puff, 78 * puff);
  g.fillStyle(skinDark, 0.5);
  g.fillEllipse(x, feetY - 40, 40, 32);
  // 混沌气旋
  g.lineStyle(2, ink, 0.55);
  for (let k = 0; k < 3; k++) {
    const a = now / 500 + (k / 3) * TAU;
    g.beginPath();
    g.arc(x + Math.cos(a) * 30, feetY - 52 + Math.sin(a) * 22, 9, a, a + 2.2, false, 0);
    g.strokePath();
  }
}

/** 🦊 九尾狐：状如狐而九尾，音如婴儿 */
function drawJiuweiHu(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const fur = 0xffb060;
  const furLight = 0xffe0c0;
  const tailTip = 0xffffff;
  const ink = 0x6a3a10;
  const bx = x - f * 12;
  const by = feetY - 34;

  // 九尾：扇形展开，各尾不同相位摆动
  for (let k = 0; k < 9; k++) {
    const a = Math.PI * 0.55 + (k - 4) * 0.3;
    const wag = Math.sin(now / 380 + k * 0.7);
    const len = 52 + wag * 8;
    const tx = bx - f * Math.cos(a) * len;
    const ty = by - Math.sin(a) * len + wag * 4;
    const col = k % 2 ? fur : furLight;
    g.lineStyle(8, col, 1);
    g.lineBetween(bx, by, tx, ty);
    g.fillStyle(tailTip, 1);
    g.fillCircle(tx, ty, 6);
  }
  // 身体 + 四足
  g.fillStyle(fur, 1);
  g.fillEllipse(x, feetY - 34, 40, 36);
  for (let k = 0; k < 4; k++) g.fillRoundedRect(x + (k - 1.5) * 11 - 3, feetY - 20, 6, 20, 3);
  // 头 + 尖耳 + 眼
  const hy = topY + 30;
  g.fillStyle(fur, 1);
  g.fillCircle(x + f * 4, hy, 15);
  g.fillStyle(furLight, 1);
  g.fillTriangle(x + f * 4 - 13, hy - 7, x + f * 4 - 4, hy - 10, x + f * 4 - 11, hy - 27);
  g.fillTriangle(x + f * 4 + 13, hy - 7, x + f * 4 + 4, hy - 10, x + f * 4 + 11, hy - 27);
  g.fillStyle(ink, 1);
  g.fillEllipse(x + f * 4 - 5, hy - 1, 4, 6);
  g.fillEllipse(x + f * 4 + 5, hy - 1, 4, 6);
  g.fillTriangle(x + f * 13, hy + 6, x + f * 20, hy + 4, x + f * 14, hy + 11);
}

/** 🐍 巴蛇：巨蛇，青赤黑杂色，能吞象 */
function drawBaShe(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const c1 = 0x2a6a5a;
  const c2 = 0x8a3a2a;
  const c3 = 0x2a2a3a;
  const belly = 0xd8c890;

  // 蛇身：叠圆往上，中段鼓一个大包（吞下的象）
  for (let k = 0; k <= 10; k++) {
    const t = k / 10;
    const bx = x + Math.sin(now / 700 + k * 0.45) * (12 * (1 - t * 0.4));
    const by = feetY - 4 - t * (PLAYER_H - 20);
    const bulge = 1 + 0.55 * Math.exp(-Math.pow((t - 0.42) * 5, 2)) * (1 + 0.1 * Math.sin(now / 300));
    const r = (12 - t * 3) * bulge;
    g.fillStyle(k % 3 === 0 ? c2 : k % 3 === 1 ? c1 : c3, 1);
    g.fillCircle(bx, by, r);
    g.fillStyle(belly, 0.3);
    g.fillEllipse(bx, by + r * 0.3, r * 0.9, r * 0.6);
  }
  // 鼓包里的象腿剪影
  const ey = feetY - 4 - 0.42 * (PLAYER_H - 20);
  g.fillStyle(0x1a1a22, 0.55);
  g.fillRect(x - 8, ey + 6, 3, 9);
  g.fillRect(x + 5, ey + 6, 3, 9);
  // 蛇头 + 竖瞳 + 吐信
  const hy = topY + 22;
  g.fillStyle(c1, 1);
  g.fillEllipse(x, hy, 32, 21);
  g.fillStyle(0xffe08a, 1);
  g.fillEllipse(x - 7, hy - 3, 7, 8);
  g.fillEllipse(x + 7, hy - 3, 7, 8);
  g.fillStyle(0x1a1a22, 1);
  g.fillEllipse(x - 7, hy - 3, 2.4, 5);
  g.fillEllipse(x + 7, hy - 3, 2.4, 5);
  const flick = Math.sin(now / 160) * 4;
  g.lineStyle(2, 0xd42a3a, 1);
  g.lineBetween(x, hy + 9, x + f * 3, hy + 16);
  g.lineBetween(x + f * 3, hy + 16, x + f * (3 + flick), hy + 22);
}

/** 🦅 蛊雕：状如雕而有角，音如婴儿，食人 */
function drawGuDiao(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const plumage = 0x4a3a5a;
  const plumageLight = 0x7a6a8a;
  const beak = 0xe8a83a;
  const horn = 0xd8e0ff;
  const flap = Math.sin(now / 340);

  g.fillStyle(0x000000, 0.12);
  g.fillEllipse(x, feetY + 2, 54, 10);
  // 双翼（慢扇）
  g.fillStyle(plumage, 1);
  g.fillTriangle(x - 4, topY + 46, x - 66, topY + 24 - flap * 16, x - 30, topY + 78);
  g.fillTriangle(x + 4, topY + 46, x + 66, topY + 24 - flap * 16, x + 30, topY + 78);
  g.fillStyle(plumageLight, 0.8);
  g.fillTriangle(x - 24, topY + 52, x - 58, topY + 34 - flap * 12, x - 34, topY + 70);
  g.fillTriangle(x + 24, topY + 52, x + 58, topY + 34 - flap * 12, x + 34, topY + 70);
  // 身躯
  g.fillStyle(plumage, 1);
  g.fillEllipse(x, feetY - 44, 40, 56);
  g.fillStyle(plumageLight, 1);
  g.fillEllipse(x, feetY - 34, 26, 36);
  // 爪
  g.fillStyle(0xffd45c, 1);
  for (let s = -1; s <= 1; s += 2) {
    g.fillRoundedRect(x + s * 9 - 3, feetY - 14, 6, 14, 3);
    for (let j = -1; j <= 1; j++) {
      const cx = x + s * 9 + j * 4;
      g.fillTriangle(cx, feetY - 2, cx + 3, feetY - 2, cx + 1.5, feetY + 4);
    }
  }
  // 头 + 角 + 钩喙
  const hy = topY + 26;
  g.fillStyle(plumage, 1);
  g.fillCircle(x + f * 3, hy, 14);
  g.fillStyle(horn, 1);
  g.fillTriangle(x + f * 3 - 10, hy - 10, x + f * 3 - 4, hy - 12, x + f * 3 - 10, hy - 27);
  g.fillTriangle(x + f * 3 + 10, hy - 10, x + f * 3 + 4, hy - 12, x + f * 3 + 10, hy - 27);
  g.fillStyle(beak, 1);
  g.fillTriangle(x + f * 3, hy + 2, x + f * 20, hy + 6, x + f * 4, hy + 12);
  g.fillStyle(0xff3a3a, 1);
  g.fillCircle(x + f * 5 - 3, hy - 3, 3);
  g.fillCircle(x + f * 5 + 3, hy - 3, 3);
  // 冠羽（摆动）
  g.fillStyle(plumageLight, 1);
  for (let k = -1; k <= 1; k++) {
    g.fillTriangle(
      x + k * 6, hy - 14,
      x + k * 6 + 3, hy - 14,
      x + k * 6 + 1 + Math.sin(now / 300 + k) * 3, hy - 27,
    );
  }
}

/** 🐴 猰貐：状如牛，赤身人面马足，食人 */
function drawYuYu(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const red = 0xc0392b;
  const redDark = 0x8a2018;
  const skin = 0xf0c9a0;
  const hoof = 0x3a2a1a;
  const fang = 0xfff4e0;

  // 赤色凶气
  g.fillStyle(red, 0.14 + 0.1 * Math.sin(now / 380));
  g.fillEllipse(x, feetY - 44, 88, 98);
  // 四马足（交替踏步）
  for (let k = 0; k < 4; k++) {
    const step = Math.sin(now / 240 + k * 1.6) * 3;
    const lx = x + (k - 1.5) * 16;
    g.fillStyle(redDark, 1);
    g.fillRoundedRect(lx - 4, feetY - 30 + step, 8, 22, 3);
    g.fillStyle(hoof, 1);
    g.fillRoundedRect(lx - 5, feetY - 10 + step, 10, 10, 3);
  }
  // 牛身
  g.fillStyle(red, 1);
  g.fillEllipse(x, feetY - 48, 62, 50);
  g.fillStyle(redDark, 1);
  g.fillEllipse(x, feetY - 36, 44, 26);
  // 牛角 + 人面
  const hy = topY + 28;
  g.fillStyle(0xe8d0a0, 1);
  g.fillTriangle(x - 20, hy + 2, x - 8, hy + 2, x - 31, hy - 24);
  g.fillTriangle(x + 20, hy + 2, x + 8, hy + 2, x + 31, hy - 24);
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 13);
  g.fillStyle(0x8a2018, 1);
  g.fillRect(x - 13, hy - 16, 26, 6);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(x - 5, hy - 1, 4.4);
  g.fillCircle(x + 5, hy - 1, 4.4);
  g.fillStyle(0x6a1010, 1);
  g.fillCircle(x - 5, hy - 1, 2.3);
  g.fillCircle(x + 5, hy - 1, 2.3);
  g.fillStyle(0x6a1010, 1);
  g.fillRoundedRect(x - 7, hy + 7, 14, 5, 2);
  g.fillStyle(fang, 1);
  g.fillTriangle(x - 5, hy + 7, x - 2, hy + 7, x - 3.5, hy + 13);
  g.fillTriangle(x + 5, hy + 7, x + 2, hy + 7, x + 3.5, hy + 13);
}

/**
 * 形象 ref → 专属画法。10 个主题各一只 + 山海宝箱的 10 只怪物，
 * 剪影与动态都不一样。`drawCharacter` 的 else-if 链最后查它。
 */
export const THEME_SKIN_ART: Record<
  string,
  (g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose) => void
> = {
  desSpirit: drawDesJinn,
  nimbSpirit: drawNimbLord,
  confSpirit: drawConfWitch,
  bigtSpirit: drawBigtMagician,
  aegisSpirit: drawAegisGod,
  chanSpirit: drawChanImmortal,
  arcanSpirit: drawArcanMage,
  relicSpirit: drawRelicPriest,
  playSpirit: drawPlayClockwork,
  yuanSpirit: drawYuanLantern,
  // 🗺️ 山海宝箱的 10 只怪物
  zhuLong: drawZhuLong,
  xiangLiu: drawXiangLiu,
  qiongQi: drawQiongQi,
  taoTie: drawTaoTie,
  taoWu: drawTaoWu,
  hunDun: drawHunDun,
  jiuweiHu: drawJiuweiHu,
  baShe: drawBaShe,
  guDiao: drawGuDiao,
  yuYu: drawYuYu,
};

// ---- 头饰（hat）------------------------------------------------------------
export interface ThemeHatArt {
  ornament: Ornament;
  accent: number;
  /** 底座样式：小圆帽 / 头带 / 头巾 */
  base: 'topper' | 'band' | 'wrap';
}

export const THEME_HATS: Record<string, ThemeHatArt> = {
  desTurban: { ornament: 'crescent', accent: 0xc9803a, base: 'wrap' },
  desScarab: { ornament: 'shell', accent: 0xffd45c, base: 'band' },
  nimbHalo: { ornament: 'cloud', accent: 0xffffff, base: 'topper' },
  nimbCrown: { ornament: 'feather', accent: 0xffe89a, base: 'topper' },
  confCake: { ornament: 'candy', accent: 0xff869c, base: 'topper' },
  confCrown: { ornament: 'heart', accent: 0xffd45c, base: 'topper' },
  bigtClown: { ornament: 'balloon', accent: 0x4a90d9, base: 'topper' },
  bigtRing: { ornament: 'star', accent: 0xffd45c, base: 'band' },
  aegisHelm: { ornament: 'sword', accent: 0xffd45c, base: 'band' },
  aegisCrest: { ornament: 'crown', accent: 0xc0392b, base: 'topper' },
  chanHat: { ornament: 'fan', accent: 0xc9803a, base: 'wrap' },
  chanLantern: { ornament: 'bell', accent: 0xffd45c, base: 'topper' },
  arcanCap: { ornament: 'star', accent: 0xffd45c, base: 'topper' },
  arcanCrown: { ornament: 'crescent', accent: 0xb46cff, base: 'band' },
  relicBone: { ornament: 'bone', accent: 0x8a6a3a, base: 'band' },
  relicAmber: { ornament: 'gem', accent: 0xffb02a, base: 'topper' },
  playBlock: { ornament: 'block', accent: 0x4a90d9, base: 'topper' },
  playTop: { ornament: 'top', accent: 0xe8404a, base: 'topper' },
  yuanLamp: { ornament: 'lantern', accent: 0xffd45c, base: 'topper' },
  yuanMask: { ornament: 'eye', accent: 0xffd45c, base: 'band' },
  // 🗺️ 山海宝箱的普通货
  shanHatFeather: { ornament: 'feather', accent: 0xd8e8ff, base: 'band' },
  shanHatDragon: { ornament: 'horn', accent: 0xffd45c, base: 'topper' },
};

export function drawThemeHat(
  g: Phaser.GameObjects.Graphics,
  x: number,
  topY: number,
  color: number,
  art: ThemeHatArt,
  now = 0,
): void {
  const hy = topY + 2;
  if (art.base === 'wrap') {
    g.fillStyle(color, 1);
    g.fillEllipse(x, hy + 4, 36, 22);
    g.fillStyle(art.accent, 0.8);
    g.fillEllipse(x, hy + 8, 34, 8);
  } else if (art.base === 'band') {
    g.fillStyle(color, 1);
    g.fillRect(x - 18, hy - 2, 36, 9);
    g.fillStyle(art.accent, 0.85);
    g.fillRect(x - 18, hy - 2, 36, 3);
  } else {
    g.fillStyle(color, 1);
    g.fillEllipse(x, hy + 2, 28, 18);
    g.fillStyle(art.accent, 0.5);
    g.fillEllipse(x, hy + 6, 28, 6);
  }
  drawOrnament(g, art.ornament, x, hy - 12, 11, color, art.accent, now);
}

// ---- 光环（aura）------------------------------------------------------------
export type AuraMotion = 'orbit' | 'rise' | 'pulse' | 'sparkle' | 'drift' | 'fall' | 'swirl' | 'ring';
export interface ThemeAuraArt { motion: AuraMotion; accent: number; }

export const THEME_AURAS: Record<string, ThemeAuraArt> = {
  desSandAura: { motion: 'drift', accent: 0xc9803a },
  desSunAura: { motion: 'pulse', accent: 0xffd45c },
  nimbWindAura: { motion: 'swirl', accent: 0xffffff },
  nimbStarAura: { motion: 'sparkle', accent: 0xffe89a },
  confSugarAura: { motion: 'fall', accent: 0xff869c },
  confHeartAura: { motion: 'orbit', accent: 0xffb7d5 },
  bigtConfetti: { motion: 'fall', accent: 0xffd45c },
  bigtSpotAura: { motion: 'ring', accent: 0xff869c },
  aegisBanner: { motion: 'rise', accent: 0xc0392b },
  aegisSteel: { motion: 'ring', accent: 0xc0ccda },
  chanInkAura: { motion: 'swirl', accent: 0x2f7a4a },
  chanPetalAura: { motion: 'fall', accent: 0xffb7d5 },
  arcanRuneAura: { motion: 'orbit', accent: 0xffd45c },
  arcanStarAura: { motion: 'sparkle', accent: 0xb46cff },
  relicDustAura: { motion: 'rise', accent: 0xd8c8a0 },
  relicAmberAura: { motion: 'pulse', accent: 0xffb02a },
  playBallAura: { motion: 'orbit', accent: 0x4a90d9 },
  playSparkAura: { motion: 'sparkle', accent: 0xffc04a },
  yuanFireAura: { motion: 'rise', accent: 0xffd45c },
  yuanLanternAura: { motion: 'drift', accent: 0xff869c },
  shanAuraSpirit: { motion: 'swirl', accent: 0x9fe8c0 },
  shanAuraStar: { motion: 'sparkle', accent: 0xffe89a },
};

export function drawThemeAura(
  g: Phaser.GameObjects.Graphics,
  now: number,
  x: number,
  cy: number,
  color: number,
  art: ThemeAuraArt,
): void {
  const pulse = 0.5 + 0.5 * Math.sin(now / 420);
  switch (art.motion) {
    case 'orbit': {
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU + now / 900;
        const rx = Math.cos(a) * 34;
        const ry = Math.sin(a) * 20;
        g.fillStyle(k % 2 ? art.accent : color, 0.85);
        g.fillCircle(x + rx, cy + ry, 5);
      }
      break;
    }
    case 'rise': {
      for (let k = 0; k < 5; k++) {
        const ph = (now / 900 + k * 0.2) % 1;
        g.fillStyle(k % 2 ? art.accent : color, 0.55 * (1 - ph));
        g.fillCircle(x + Math.sin(now / 400 + k) * 26, cy + 70 - ph * 150, 5 * (1 - ph) + 2);
      }
      break;
    }
    case 'pulse': {
      g.fillStyle(art.accent, 0.3 * pulse);
      g.fillCircle(x, cy, 40 + pulse * 14);
      g.lineStyle(2.4, color, 0.7);
      g.strokeEllipse(x, cy, 92 + pulse * 10, 150 + pulse * 12);
      break;
    }
    case 'sparkle': {
      for (let k = 0; k < 10; k++) {
        const ph = (now / 700 + k * 0.13) % 1;
        const px = x + Math.sin(k * 2.3) * 40;
        const py = cy + Math.cos(k * 1.7) * 70;
        g.fillStyle(k % 2 ? 0xffffff : art.accent, (1 - ph) * 0.85);
        const r = 2 + (1 - ph) * 3;
        g.fillTriangle(px, py - r, px + r * 0.7, py, px, py + r);
        g.fillTriangle(px, py - r, px - r * 0.7, py, px, py + r);
      }
      break;
    }
    case 'drift': {
      for (let k = 0; k < 8; k++) {
        const ph = (now / 1400 + k * 0.125) % 1;
        const px = x - 60 + ph * 120;
        const py = cy + Math.sin(k * 3) * 60;
        g.fillStyle(color, 0.4 * (1 - Math.abs(ph - 0.5) * 2) + 0.1);
        g.fillCircle(px, py, 4);
      }
      break;
    }
    case 'fall': {
      for (let k = 0; k < 7; k++) {
        const ph = (now / 1100 + k * 0.16) % 1;
        g.fillStyle(k % 2 ? art.accent : color, 0.75 * (1 - ph * 0.6));
        g.fillEllipse(x + Math.sin(now / 500 + k) * 34, cy - 80 + ph * 170, 9, 6);
      }
      break;
    }
    case 'swirl': {
      g.lineStyle(2, color, 0.6);
      for (let k = 0; k < 3; k++) {
        const a0 = now / 600 + (k / 3) * TAU;
        let px = x;
        let py = cy;
        for (let t = 0; t < 14; t++) {
          const a = a0 + t * 0.32;
          const r = 6 + t * 3.4;
          const nx = x + Math.cos(a) * r;
          const ny = cy + Math.sin(a) * r * 0.72;
          g.lineStyle(2, k % 2 ? art.accent : color, 0.5 - t * 0.03);
          g.lineBetween(px, py, nx, ny);
          px = nx;
          py = ny;
        }
      }
      break;
    }
    case 'ring': {
      g.lineStyle(3, art.accent, 0.7);
      g.strokeEllipse(x, cy, 84, 132);
      g.lineStyle(1.6, color, 0.5);
      g.strokeEllipse(x, cy, 104 + pulse * 8, 158 + pulse * 8);
      break;
    }
    default:
      break;
  }
}

// ---- 地环（ring）------------------------------------------------------------
export type RingPattern = 'orbs' | 'petals' | 'runes' | 'spikes' | 'arcs';
export interface ThemeRingArt { pattern: RingPattern; accent: number; }

export const THEME_RINGS: Record<string, ThemeRingArt> = {
  desRing: { pattern: 'orbs', accent: 0xffd45c },
  nimbRing: { pattern: 'arcs', accent: 0xffffff },
  confRing: { pattern: 'petals', accent: 0xff869c },
  bigtRing: { pattern: 'spikes', accent: 0xffd45c },
  aegisRing: { pattern: 'runes', accent: 0xc0392b },
  chanRing: { pattern: 'petals', accent: 0x2f7a4a },
  arcanRing: { pattern: 'runes', accent: 0xffd45c },
  relicRing: { pattern: 'orbs', accent: 0x8a6a3a },
  playRing: { pattern: 'spikes', accent: 0x4a90d9 },
  yuanRing: { pattern: 'arcs', accent: 0xffd45c },
  shanRing: { pattern: 'runes', accent: 0x9fe8c0 },
};

export function drawThemeRing(
  g: Phaser.GameObjects.Graphics,
  now: number,
  x: number,
  feetY: number,
  color: number,
  art: ThemeRingArt,
): void {
  const y = feetY - 3;
  const a0 = now / 1600;
  g.lineStyle(2, color, 0.45);
  g.strokeEllipse(x, y, 48, 14);
  switch (art.pattern) {
    case 'orbs':
      for (let k = 0; k < 8; k++) {
        const a = a0 + (k / 8) * TAU;
        g.fillStyle(k % 2 ? art.accent : color, 0.9);
        g.fillCircle(x + Math.cos(a) * 24, y + Math.sin(a) * 7, 3.2);
      }
      break;
    case 'petals':
      for (let k = 0; k < 7; k++) {
        const a = a0 * 0.7 + (k / 7) * TAU;
        g.fillStyle(k % 2 ? art.accent : color, 0.85);
        g.fillEllipse(x + Math.cos(a) * 24, y + Math.sin(a) * 7, 7, 4);
      }
      break;
    case 'runes':
      for (let k = 0; k < 6; k++) {
        const a = a0 + (k / 6) * TAU;
        const px = x + Math.cos(a) * 24;
        const py = y + Math.sin(a) * 7;
        g.fillStyle(color, 0.85);
        g.fillRect(px - 1.6, py - 5, 3.2, 10);
        g.fillStyle(art.accent, 0.8);
        g.fillRect(px - 4, py - 1.6, 8, 3.2);
      }
      break;
    case 'spikes':
      for (let k = 0; k < 10; k++) {
        const a = a0 + (k / 10) * TAU;
        const px = x + Math.cos(a) * 24;
        const py = y + Math.sin(a) * 7;
        g.fillStyle(k % 2 ? color : art.accent, 0.9);
        g.fillTriangle(px, py - 7, px + 3, py + 2, px - 3, py + 2);
      }
      break;
    case 'arcs':
      for (let k = 0; k < 3; k++) {
        g.lineStyle(2, k % 2 ? art.accent : color, 0.7 - k * 0.15);
        g.strokeEllipse(x, y - k * 2, 34 + k * 10, 10 + k * 3);
      }
      break;
    default:
      break;
  }
}

// ---- 坐骑（mount）----------------------------------------------------------
export type MountFamily = 'beast' | 'glider' | 'wheeled' | 'creature' | 'float' | 'crest';
export interface ThemeMountArt { family: MountFamily; accent: number; }

export const THEME_MOUNTS: Record<string, ThemeMountArt> = {
  desCamel: { family: 'beast', accent: 0xc9803a },
  nimbCloud: { family: 'glider', accent: 0x9fd8ff },
  confCake: { family: 'creature', accent: 0xff869c },
  bigtBall: { family: 'float', accent: 0xe8404a },
  aegisSteed: { family: 'beast', accent: 0xc0392b },
  chanBoat: { family: 'glider', accent: 0x2f7a4a },
  arcanOrb: { family: 'float', accent: 0xb46cff },
  relicBone: { family: 'beast', accent: 0x8a6a3a },
  playHorse: { family: 'wheeled', accent: 0xe8404a },
  yuanBoat: { family: 'glider', accent: 0xffd45c },
  // 🗺️ 山海宝箱：鲲鹏（同样是滑翔类，蓝色）
  shanMountKun: { family: 'glider', accent: 0x4aa8d8 },
};

export function drawThemeMount(
  g: Phaser.GameObjects.Graphics,
  now: number,
  id: string,
  pose: CharacterPose,
): void {
  const art = THEME_MOUNTS[id];
  if (!art) return;
  const color = MOUNT_TINT[id] ?? 0xffd45c;
  const x = pose.x;
  const y = pose.feetY;
  const f = pose.facing;
  const bob = Math.sin(now / 420) * 3;
  switch (art.family) {
    case 'beast': {
      const by = y - 10;
      g.fillStyle(0x3a2a1c, 0.9);
      for (const dx of [-20, -6, 8, 22]) g.fillRoundedRect(x + dx - 3, by + 12, 6, 22, 3);
      g.fillStyle(color, 1);
      g.fillEllipse(x, by + 4, 74, 32);
      g.fillRoundedRect(x + f * 24 - 7, by - 20, 14, 28, 6);
      g.fillEllipse(x + f * 38, by - 22, 24, 16);
      g.fillStyle(art.accent, 1);
      g.fillCircle(x + f * 42, by - 24, 3.4);
      g.fillRoundedRect(x + f * 26, by - 30, 12, 10, 4);
      g.fillStyle(color, 1);
      g.fillTriangle(x - 34, by + 2, x - 34, by - 12, x - 46, by + 2);
      break;
    }
    case 'glider': {
      const gy = y + 4 + bob;
      g.fillStyle(art.accent, 0.4);
      g.fillEllipse(x, gy, 96, 24);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 42, gy - 8, 84, 14, 7);
      g.fillStyle(art.accent, 0.85);
      g.fillRoundedRect(x - 42, gy - 8, 84, 5, 3);
      g.fillStyle(color, 0.9);
      g.fillTriangle(x - 40, gy - 6, x - 52, gy + 6, x - 34, gy + 2);
      g.fillTriangle(x + 40, gy - 6, x + 52, gy + 6, x + 34, gy + 2);
      break;
    }
    case 'wheeled': {
      const spin = now / 120;
      g.fillStyle(0x2b2b33, 1);
      g.fillCircle(x - 20, y + 6, 9);
      g.fillCircle(x + 20, y + 6, 9);
      g.lineStyle(2, art.accent, 0.9);
      for (const cx of [x - 20, x + 20]) {
        for (let k = 0; k < 4; k++) {
          const a = spin + (k / 4) * TAU;
          g.lineBetween(cx, y + 6, cx + Math.cos(a) * 7, y + 6 + Math.sin(a) * 7);
        }
      }
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 30, y - 16, 60, 16, 6);
      g.fillStyle(art.accent, 1);
      g.fillRoundedRect(x - 26, y - 14, 52, 4, 2);
      break;
    }
    case 'creature': {
      const by = y - 8 + bob * 0.4;
      g.fillStyle(color, 1);
      g.fillEllipse(x, by + 6, 66, 38);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x - 14, by, 5);
      g.fillCircle(x + 14, by, 5);
      g.fillStyle(0x22242c, 1);
      g.fillCircle(x - 14, by, 2.4);
      g.fillCircle(x + 14, by, 2.4);
      g.fillStyle(art.accent, 1);
      g.fillEllipse(x, by + 16, 30, 12);
      break;
    }
    case 'float': {
      const fy = y - 6 + bob;
      g.fillStyle(art.accent, 0.35);
      g.fillEllipse(x, fy + 18, 70, 16);
      g.fillStyle(color, 1);
      g.fillEllipse(x, fy, 72, 30);
      g.fillStyle(art.accent, 0.9);
      g.fillEllipse(x - 12, fy - 8, 20, 10);
      for (let k = -2; k <= 2; k++) {
        g.fillStyle(0xffffff, 0.6);
        g.fillCircle(x + k * 14, fy + 6, 2.4);
      }
      break;
    }
    case 'crest': {
      const cy = y + 2 + bob * 0.5;
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 36, cy - 6, 72, 12, 6);
      g.fillStyle(art.accent, 1);
      for (let k = -2; k <= 2; k++) {
        g.fillTriangle(x + k * 14, cy - 6, x + k * 14 + 7, cy - 22, x + k * 14 + 14, cy - 6);
      }
      break;
    }
    default:
      break;
  }
}

/** 坐骑主色（避免和 cosmetics 的 MOUNT_COLORS 互相 import，这里放一份镜像） */
const MOUNT_TINT: Record<string, number> = {
  desCamel: 0xd8a24a, nimbCloud: 0xeaf6ff, confCake: 0xffd0e0, bigtBall: 0xe8404a,
  aegisSteed: 0xaab4c2, chanBoat: 0x3a8a5a, arcanOrb: 0x9a86e8, relicBone: 0xd8c8a0,
  playHorse: 0xffc04a, yuanBoat: 0xe8404a,
};

// ---- 球拍皮肤（racketSkin）--------------------------------------------------
export type RacketPattern = 'gem' | 'rope' | 'rune' | 'spike' | 'ribbon' | 'gear';
/**
 * 球拍的**外形**（不只是拍框上的花纹）：换一款皮肤就能把整只拍子的轮廓换掉——
 * 扇面 / 水滴 / 盾牌 / 月牙 / 葫芦 / 灯笼 / 帐篷 / 爪 / 螺旋…
 * 只影响画面，判定（拍长与甜区）由 `constants.ts` 决定，不随皮肤变。
 */
export type RacketFrame =
  | 'fan' | 'teardrop' | 'shield' | 'blade' | 'hex' | 'star' | 'heart' | 'crescent'
  | 'gourd' | 'gate' | 'lantern' | 'tent' | 'claw' | 'coil' | 'leaf' | 'bone'
  | 'kite' | 'web' | 'flame' | 'circle' | 'scroll' | 'ring';

export interface ThemeRacketArt {
  pattern: RacketPattern;
  accent: number;
  /** 换掉拍框外形（不填 = 常规椭圆拍框） */
  frame?: RacketFrame;
}

export const THEME_RACKETS: Record<string, ThemeRacketArt> = {
  // 每个主题两只拍子都换掉外形（20 种轮廓，尽量用满）
  desRacketA: { pattern: 'rope', accent: 0xffd45c, frame: 'circle' },
  desRacketB: { pattern: 'rune', accent: 0xc9803a, frame: 'teardrop' },
  nimbRacketA: { pattern: 'ribbon', accent: 0xffffff, frame: 'coil' },
  nimbRacketB: { pattern: 'gem', accent: 0xffe89a, frame: 'star' },
  confRacketA: { pattern: 'gem', accent: 0xff869c, frame: 'heart' },
  confRacketB: { pattern: 'ribbon', accent: 0xffd45c, frame: 'gourd' },
  bigtRacketA: { pattern: 'spike', accent: 0xffd45c, frame: 'fan' },
  bigtRacketB: { pattern: 'rune', accent: 0xe8404a, frame: 'hex' },
  aegisRacketA: { pattern: 'gear', accent: 0xc0ccda, frame: 'shield' },
  aegisRacketB: { pattern: 'spike', accent: 0xc0392b, frame: 'blade' },
  chanRacketA: { pattern: 'ribbon', accent: 0x2f7a4a, frame: 'leaf' },
  chanRacketB: { pattern: 'rune', accent: 0xc9803a, frame: 'web' },
  arcanRacketA: { pattern: 'gem', accent: 0xffd45c, frame: 'crescent' },
  arcanRacketB: { pattern: 'rune', accent: 0xb46cff, frame: 'gate' },
  relicRacketA: { pattern: 'rope', accent: 0xd8c8a0, frame: 'bone' },
  relicRacketB: { pattern: 'gear', accent: 0x8a6a3a, frame: 'kite' },
  playRacketA: { pattern: 'gem', accent: 0x4a90d9, frame: 'tent' },
  playRacketB: { pattern: 'ribbon', accent: 0xe8404a, frame: 'lantern' },
  yuanRacketA: { pattern: 'ribbon', accent: 0xffd45c, frame: 'flame' },
  yuanRacketB: { pattern: 'rune', accent: 0xe8404a, frame: 'claw' },
  shanRacketA: { pattern: 'rope', accent: 0xd8e8ff, frame: 'scroll' },
  shanRacketB: { pattern: 'gem', accent: 0xd42a2a, frame: 'ring' },
};

/**
 * **老球拍皮肤**（开服那批 + 活动 / 里程 / 外星人）也各自换上一个专属外形——
 * 它们的花纹仍由 `racket.ts` 里那个大 switch 画，这里只负责把拍框轮廓换掉。
 * 同一个宝箱主题里出现的几把拍子尽量不撞外形（见各主题的候选池）。
 */
export const RACKET_FRAMES: Record<string, RacketFrame> = {
  // 深海遗珍
  tsunami: 'crescent', coralrim: 'claw',
  // 幽夜万圣
  web: 'web', bone: 'bone',
  // 锈色机械
  circuit: 'hex', sunsteel: 'star', holo: 'gate',
  // 皇家典藏
  ruby: 'heart', sapphire: 'kite', goldthread: 'coil',
  // 樱吹雪
  blossom: 'heart',
  // 星海漫游
  star: 'star', galaxy: 'ring', void: 'gate', aurora: 'fan',
  nebula: 'teardrop', quantum: 'coil', moonlace: 'crescent', starpiercer: 'blade',
  // 烈焰熔炉
  lava: 'flame', ember: 'gourd', magma: 'teardrop', sonic: 'fan',
  // 冰川秘境
  ice: 'hex', frost: 'circle', crystal: 'kite', iceberg: 'blade',
  // 丛林图腾
  bamboo: 'leaf', vine: 'coil',
  // 霓虹街头
  thunder: 'blade', neon: 'scroll', camo: 'circle', rainbow: 'fan',
  // 宇宙龙域
  scale: 'web', dragonbone: 'bone',
  // 普通 / 高级宝箱里的老皮肤
  carbon: 'hex', rune: 'scroll', zebra: 'tent', holy: 'shield', shadow: 'crescent',
  spike: 'star', plasma: 'coil', thorn: 'blade', mirror: 'kite', matrix: 'gate',
  glitch: 'web', smoke: 'gourd', onyx: 'teardrop', ivory: 'circle', amber: 'lantern',
  jade: 'ring', toxic: 'tent', obsidian: 'blade', rosebranch: 'heart', stormline: 'claw',
  phoenixF: 'fan', chrono: 'circle', gravity: 'teardrop', willow: 'leaf', wood: 'circle',
  gold: 'ring', flame: 'flame', meteorite: 'hex',
};

export function drawThemeRacketTrim(
  g: Phaser.GameObjects.Graphics,
  now: number,
  skin: string,
  color: number,
): boolean {
  const art = THEME_RACKETS[skin];
  if (!art) return false;
  const spin = now / 700;
  switch (art.pattern) {
    case 'gem':
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * TAU + Math.PI / 4;
        g.fillStyle(k % 2 ? art.accent : color, 0.9);
        g.fillCircle(9 + Math.cos(a) * 17, Math.sin(a) * 14, 2.6);
      }
      break;
    case 'rope':
      g.lineStyle(2, art.accent, 0.85);
      g.strokeEllipse(9, 0, 28, 22);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        g.fillStyle(color, 0.9);
        g.fillCircle(9 + Math.cos(a) * 14, Math.sin(a) * 11, 1.8);
      }
      break;
    case 'rune':
      for (let k = 0; k < 3; k++) {
        const a = spin + (k / 3) * TAU;
        g.fillStyle(art.accent, 0.9);
        g.fillRect(9 + Math.cos(a) * 17 - 1.6, Math.sin(a) * 14 - 4, 3.2, 8);
      }
      break;
    case 'spike':
      g.lineStyle(2, color, 0.9);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        g.lineBetween(9 + Math.cos(a) * 17, Math.sin(a) * 14, 9 + Math.cos(a) * 23, Math.sin(a) * 19);
      }
      break;
    case 'ribbon':
      g.lineStyle(2, art.accent, 0.8);
      for (const off of [-3, 0, 3]) {
        g.lineBetween(9 - 16, off, 9 + 16, off + Math.sin(now / 300 + off) * 3);
      }
      break;
    case 'gear':
      g.fillStyle(color, 0.9);
      for (let k = 0; k < 6; k++) {
        const a = spin * 0.6 + (k / 6) * TAU;
        g.fillRect(9 + Math.cos(a) * 18 - 2, Math.sin(a) * 15 - 2, 4, 4);
      }
      break;
    default:
      break;
  }
  return true;
}

// ---- 球拍外形（frame）-------------------------------------------------------
/** 把一串点连成折线并描边（Canvas2D 适配层支持 beginPath/moveTo/lineTo/…/strokePath） */
function strokePts(
  g: Phaser.GameObjects.Graphics,
  pts: { x: number; y: number }[],
  width: number,
  color: number,
  alpha = 1,
  close = true,
): void {
  if (pts.length < 2) return;
  g.lineStyle(width, color, alpha);
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  if (close) g.closePath();
  g.strokePath();
}

/** 以 (cx,cy) 为心、rx/ry 为半径的椭圆采样点（自己算点，Canvas2D 的 arc 只支持单段） */
function ellipsePts(cx: number, cy: number, rx: number, ry: number, from: number, to: number, steps: number) {
  const out: { x: number; y: number }[] = [];
  for (let s = 0; s <= steps; s++) {
    const a = from + ((to - from) * s) / steps;
    out.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
  }
  return out;
}

/**
 * 主题球拍的**外形**：命中就画这个轮廓并返回 true；没这个皮肤 / 没指定 frame 就返回 false
 * （调用方退回常规椭圆拍框）。局部空间与 `drawRacketHead` 一致：拍框中心约 (9, 0)。
 */
export function drawThemeRacketFrame(
  g: Phaser.GameObjects.Graphics,
  now: number,
  skin: string,
  color: number,
): boolean {
  const art = THEME_RACKETS[skin];
  const f = art?.frame ?? RACKET_FRAMES[skin];
  if (!f) return false;
  const ac = art?.accent ?? color;
  const spin = now / 800;

  switch (f) {
    case 'circle':
      g.lineStyle(3, color, 0.95);
      g.strokeCircle(9, 0, 16);
      break;
    case 'ring':
      g.lineStyle(3, color, 0.95);
      g.strokeCircle(9, 0, 17);
      g.lineStyle(1.4, ac, 0.75);
      g.strokeCircle(9, 0, 10);
      break;
    case 'scroll':
      // 简牍 / 画卷：一面竖向长方板 + 上下两道穿绳
      g.lineStyle(3, color, 0.95);
      g.strokeRect(-7, -16, 32, 32);
      g.lineStyle(1.6, ac, 0.8);
      g.lineBetween(-7, -7, 25, -7);
      g.lineBetween(-7, 6, 25, 6);
      g.lineStyle(2, ac, 0.9);
      g.lineBetween(-9, -16, -9, 16);
      break;
    case 'hex':
      strokePts(g, ellipsePts(9, 0, 17, 15, -Math.PI / 2, Math.PI * 1.5, 6), 3, color);
      break;
    case 'star': {
      const pts: { x: number; y: number }[] = [];
      for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + (k / 10) * TAU;
        const r = k % 2 === 0 ? 18 : 7.5;
        pts.push({ x: 9 + Math.cos(a) * r, y: Math.sin(a) * r * 0.9 });
      }
      strokePts(g, pts, 2.6, color);
      break;
    }
    case 'kite':
      strokePts(g, [{ x: 9, y: -18 }, { x: 24, y: 0 }, { x: 9, y: 18 }, { x: -6, y: 0 }], 3, color);
      strokePts(g, [{ x: 9, y: -18 }, { x: 9, y: 18 }], 1.4, color, 0.6, false);
      strokePts(g, [{ x: -6, y: 0 }, { x: 24, y: 0 }], 1.4, color, 0.6, false);
      break;
    case 'teardrop':
      strokePts(g, [
        { x: 9, y: -18 }, { x: 13, y: -8 }, { x: 20, y: 4 }, { x: 24, y: 10 },
        { x: 17, y: 15 }, { x: 9, y: 17 }, { x: 1, y: 15 }, { x: -6, y: 10 },
        { x: -2, y: 4 }, { x: 5, y: -8 },
      ], 3, color);
      break;
    case 'shield':
      strokePts(g, [
        { x: -6, y: -13 }, { x: 9, y: -17 }, { x: 24, y: -13 },
        { x: 24, y: 3 }, { x: 9, y: 17 }, { x: -6, y: 3 },
      ], 3, color);
      strokePts(g, [{ x: 9, y: -15 }, { x: 9, y: 14 }], 1.4, ac, 0.8, false);
      break;
    case 'blade':
      strokePts(g, [{ x: 9, y: -19 }, { x: 19, y: 0 }, { x: 9, y: 19 }, { x: -1, y: 0 }], 2.8, color);
      strokePts(g, [{ x: 9, y: -19 }, { x: 9, y: 19 }], 1.4, ac, 0.8, false);
      break;
    case 'fan':
      g.lineStyle(3, color, 0.95);
      g.beginPath();
      g.arc(9, 9, 17, Math.PI, TAU, false, 0);
      g.closePath();
      g.strokePath();
      for (let k = 0; k <= 4; k++) {
        const a = Math.PI + (k / 4) * Math.PI;
        g.lineStyle(1.2, ac, 0.7);
        g.lineBetween(9, 9, 9 + Math.cos(a) * 16, 9 + Math.sin(a) * 16);
      }
      break;
    case 'crescent': {
      const outer = ellipsePts(9, 0, 17, 16, Math.PI * 0.42, Math.PI * 1.58, 16);
      const inner = ellipsePts(15, 0, 15, 14, Math.PI * 1.58, Math.PI * 0.42, 16);
      strokePts(g, [...outer, ...inner], 3, color);
      break;
    }
    case 'gourd':
      g.lineStyle(3, color, 0.95);
      g.strokeCircle(9, -8, 9);
      g.strokeCircle(9, 7, 13);
      g.lineStyle(1.4, ac, 0.8);
      g.lineBetween(-3, -3, 21, -3);
      break;
    case 'gate': {
      const arch = ellipsePts(9, 8, 17, 15, Math.PI, TAU, 12);
      strokePts(g, [...arch, { x: 26, y: 18 }, { x: -8, y: 18 }], 3, color);
      g.lineStyle(1.4, ac, 0.8);
      g.lineBetween(-8, -6, 26, -6);
      break;
    }
    case 'lantern':
      g.lineStyle(3, color, 0.95);
      g.strokeEllipse(9, 0, 30, 26);
      g.strokeRect(1, -16, 16, 4);
      g.strokeRect(1, 12, 16, 4);
      g.lineStyle(1.2, ac, 0.7);
      for (let k = -1; k <= 1; k++) g.lineBetween(9 + k * 8, -12, 9 + k * 8, 12);
      break;
    case 'tent':
      strokePts(g, [{ x: 9, y: -18 }, { x: 26, y: 16 }, { x: -8, y: 16 }], 3, color);
      strokePts(g, [{ x: 9, y: -18 }, { x: 9, y: 16 }], 1.3, ac, 0.75, false);
      break;
    case 'claw': {
      for (let k = -1; k <= 1; k++) {
        const pts: { x: number; y: number }[] = [];
        for (let s = 0; s <= 6; s++) {
          const u = s / 6;
          pts.push({ x: 9 + k * 11 + Math.sin(u * 2.2 + k) * 4, y: -16 + u * 32 });
        }
        strokePts(g, pts, 2.4, color, 1, false);
      }
      break;
    }
    case 'coil': {
      const pts: { x: number; y: number }[] = [];
      for (let s = 0; s <= 26; s++) {
        const u = s / 26;
        const a = u * Math.PI * 4 + spin;
        const r = 3 + u * 14;
        pts.push({ x: 9 + Math.cos(a) * r, y: Math.sin(a) * r * 0.85 });
      }
      strokePts(g, pts, 2.4, color, 1, false);
      break;
    }
    case 'leaf':
      strokePts(g, [...ellipsePts(9, 0, 8, 18, -Math.PI / 2, Math.PI / 2, 10), ...ellipsePts(9, 0, 8, 18, Math.PI / 2, Math.PI * 1.5, 10)], 3, color);
      strokePts(g, [{ x: 9, y: -18 }, { x: 9, y: 18 }], 1.2, ac, 0.7, false);
      break;
    case 'bone':
      g.lineStyle(5, color, 0.95);
      g.lineBetween(-1, -6, 19, 6);
      g.lineBetween(-1, 6, 19, -6);
      g.lineStyle(3, color, 0.95);
      g.strokeCircle(-3, -8, 5);
      g.strokeCircle(-3, 8, 5);
      g.strokeCircle(21, -8, 5);
      g.strokeCircle(21, 8, 5);
      break;
    case 'web': {
      const outer = ellipsePts(9, 0, 17, 15, -Math.PI / 2, Math.PI * 1.5, 6);
      strokePts(g, outer, 2.6, color);
      g.lineStyle(1.2, ac, 0.7);
      for (const p of outer) g.lineBetween(9, 0, p.x, p.y);
      strokePts(g, ellipsePts(9, 0, 9, 8, -Math.PI / 2, Math.PI * 1.5, 6), 1.2, ac, 0.7);
      break;
    }
    case 'flame': {
      const pts: { x: number; y: number }[] = [{ x: 9, y: -21 }];
      for (let k = 0; k < 8; k++) {
        const t = k / 8;
        const side = t < 0.5 ? 1 : -1;
        const u = t < 0.5 ? t * 2 : (1 - t) * 2;
        pts.push({ x: 9 + side * (6 + u * 20 + Math.sin(now / 140 + k) * 2), y: -8 + u * 26 });
      }
      strokePts(g, pts, 3, color);
      break;
    }
    default:
      g.lineStyle(3, color, 0.95);
      g.strokeEllipse(9, 0, 34, 28);
      break;
  }
  return true;
}

// ---- 击球拖尾（trail）-------------------------------------------------------
export type TrailPattern =
  | 'sand' | 'petal' | 'bubble' | 'star' | 'spark' | 'flake' | 'ink' | 'ribbon'
  // 后加：每个主题各挑两种，尽量不重样（见文件底部的 THEME_TRAILS）
  | 'smoke' | 'bolt' | 'chain' | 'rune' | 'gear' | 'candy' | 'feather' | 'lantern'
  | 'water' | 'ember' | 'shell' | 'bamboo' | 'bone' | 'silk' | 'snow' | 'confetti'
  | 'clock' | 'talon' | 'swirl' | 'thorn' | 'comet' | 'flame' | 'scale';
export interface ThemeTrailArt { pattern: TrailPattern; accent: number; }
export interface TrailPoint { x: number; y: number; }

export const THEME_TRAILS: Record<string, ThemeTrailArt> = {
  // 每个主题两条拖尾，图案尽量不重样（21 种图案）
  desTrailA: { pattern: 'sand', accent: 0xffd45c },
  desTrailB: { pattern: 'comet', accent: 0xffd45c },
  nimbTrailA: { pattern: 'silk', accent: 0xffffff },
  nimbTrailB: { pattern: 'star', accent: 0xffe89a },
  confTrailA: { pattern: 'petal', accent: 0xff869c },
  confTrailB: { pattern: 'candy', accent: 0xffd45c },
  bigtTrailA: { pattern: 'confetti', accent: 0xffd45c },
  bigtTrailB: { pattern: 'ribbon', accent: 0xe8404a },
  aegisTrailA: { pattern: 'spark', accent: 0xc0ccda },
  aegisTrailB: { pattern: 'bolt', accent: 0xc0392b },
  chanTrailA: { pattern: 'ink', accent: 0x2f7a4a },
  chanTrailB: { pattern: 'bamboo', accent: 0x8fd45a },
  arcanTrailA: { pattern: 'rune', accent: 0xffd45c },
  arcanTrailB: { pattern: 'swirl', accent: 0xb46cff },
  relicTrailA: { pattern: 'bone', accent: 0xd8c8a0 },
  relicTrailB: { pattern: 'ember', accent: 0xffb02a },
  playTrailA: { pattern: 'bubble', accent: 0x4a90d9 },
  playTrailB: { pattern: 'gear', accent: 0xffc04a },
  yuanTrailA: { pattern: 'flame', accent: 0xffd45c },
  yuanTrailB: { pattern: 'lantern', accent: 0xff869c },
  shanTrail: { pattern: 'scale', accent: 0x9fe8c0 },
};

export function drawThemeTrail(
  g: Phaser.GameObjects.Graphics,
  art: ThemeTrailArt,
  pts: readonly TrailPoint[],
  fade: number,
  now: number,
  base: number,
): void {
  const n = pts.length;
  for (let i = 1; i < n; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const f = i / (n - 1);
    const w = 1 + f * 7;
    const a = (0.04 + f * 0.42) * fade;
    const color = base;
    switch (art.pattern) {
      case 'sand':
        g.fillStyle(color, a * 1.2);
        g.fillCircle(p1.x + Math.sin(now / 80 + i) * 2, p1.y + f * 3, w * 0.6);
        if (i % 3 === 0) {
          g.fillStyle(art.accent, a * 0.8);
          g.fillCircle(p1.x + 3, p1.y - 2, w * 0.3);
        }
        break;
      case 'petal':
        g.fillStyle(color, a * 1.3);
        g.fillEllipse(p1.x, p1.y, w * 1.8, w * 0.9);
        if (i % 4 === 0) {
          g.fillStyle(art.accent, a);
          g.fillCircle(p1.x, p1.y, w * 0.3);
        }
        break;
      case 'bubble':
        g.lineStyle(Math.max(1, w * 0.6), color, a * 1.1);
        g.strokeCircle(p1.x, p1.y, w * 0.7);
        break;
      case 'star':
        g.fillStyle(color, a * 1.25);
        g.fillCircle(p1.x, p1.y, w * 0.5);
        if (i % 3 === 0) {
          g.fillStyle(art.accent, a);
          const r = w * 0.7;
          g.fillTriangle(p1.x, p1.y - r, p1.x + r * 0.5, p1.y, p1.x, p1.y + r);
          g.fillTriangle(p1.x, p1.y - r, p1.x - r * 0.5, p1.y, p1.x, p1.y + r);
        }
        break;
      case 'spark':
        g.lineStyle(2 + f * 5, color, a * 1.2);
        g.lineBetween(p0.x, p0.y, p1.x, p1.y);
        if (i % 2 === 0) {
          g.fillStyle(art.accent, a * 0.9);
          g.fillCircle(p1.x, p1.y, w * 0.28);
        }
        break;
      case 'flake':
        g.lineStyle(1.6, color, a * 1.15);
        for (let k = 0; k < 3; k++) {
          const ang = (k / 3) * Math.PI;
          g.lineBetween(
            p1.x - Math.cos(ang) * w * 0.6, p1.y - Math.sin(ang) * w * 0.6,
            p1.x + Math.cos(ang) * w * 0.6, p1.y + Math.sin(ang) * w * 0.6,
          );
        }
        break;
      case 'ink':
        g.fillStyle(color, a * 0.95);
        g.fillCircle(p1.x, p1.y, w * 0.8);
        if (i % 5 === 0) {
          g.fillCircle(p1.x + Math.sin(i) * 3, p1.y - 3, w * 0.25);
        }
        break;
      case 'ribbon':
        g.lineStyle(Math.max(1, w * 0.5), color, a * 1.1);
        g.lineBetween(
          p0.x + Math.sin(now / 120 + i) * 3, p0.y,
          p1.x + Math.sin(now / 120 + i + 1) * 3, p1.y - f * 3,
        );
        break;
      case 'smoke': {
        const ph = (now / 900 + i / n) % 1;
        g.fillStyle(color, a * 0.8 * (1 - ph));
        g.fillCircle(p1.x + Math.sin(now / 200 + i) * 4, p1.y - ph * 10, w * (0.7 + ph * 0.6));
        break;
      }
      case 'bolt':
        if (i % 2 === 0) {
          g.lineStyle(2, color, a * 1.3);
          g.lineBetween(p0.x, p0.y, p1.x + Math.sin(i) * 5, p1.y - 4);
          g.lineBetween(p1.x + Math.sin(i) * 5, p1.y - 4, p0.x + 4, p0.y + 3);
        }
        break;
      case 'chain':
        if (i % 2 === 0) {
          g.lineStyle(2.2, color, a * 1.2);
          g.strokeEllipse(p1.x, p1.y, w * 0.9, w * 1.4);
          g.lineStyle(1, art.accent, a * 0.8);
          g.lineBetween(p1.x - w, p1.y, p1.x + w, p1.y);
        }
        break;
      case 'rune':
        if (i % 3 === 0) {
          g.lineStyle(2, art.accent, a * 1.2);
          g.strokeRect(p1.x - w * 0.6, p1.y - w * 0.8, w * 1.2, w * 1.6);
          g.lineBetween(p1.x - w * 0.6, p1.y, p1.x + w * 0.6, p1.y);
        } else {
          g.fillStyle(color, a * 0.7);
          g.fillCircle(p1.x, p1.y, w * 0.35);
        }
        break;
      case 'gear':
        if (i % 2 === 0) {
          g.fillStyle(color, a * 1.1);
          for (let k = 0; k < 6; k++) {
            const ga = (k / 6) * TAU + now / 300;
            g.fillRect(p1.x + Math.cos(ga) * w * 0.8 - 1, p1.y + Math.sin(ga) * w * 0.8 - 1, 2.4, 2.4);
          }
          g.fillStyle(art.accent, a * 0.9);
          g.fillCircle(p1.x, p1.y, w * 0.34);
        }
        break;
      case 'candy':
        g.fillStyle(i % 2 ? color : art.accent, a * 1.2);
        g.fillEllipse(p1.x, p1.y, w * 1.4, w * 0.8);
        g.lineStyle(1.2, 0xffffff, a * 0.7);
        g.lineBetween(p1.x - w * 0.5, p1.y, p1.x + w * 0.5, p1.y);
        break;
      case 'feather':
        if (i % 2 === 0) {
          g.fillStyle(color, a * 1.15);
          g.fillEllipse(p1.x, p1.y - 2, w * 0.7, w * 1.8);
          g.lineStyle(1, art.accent, a * 0.8);
          g.lineBetween(p1.x, p1.y - w, p1.x, p1.y + w);
        }
        break;
      case 'lantern':
        if (i % 3 === 0) {
          g.fillStyle(color, a * 1.1);
          g.fillEllipse(p1.x, p1.y, w * 1.4, w * 1.8);
          g.fillStyle(art.accent, a * 1.3);
          g.fillCircle(p1.x, p1.y, w * 0.45);
        }
        break;
      case 'water':
        g.lineStyle(Math.max(1, w * 0.5), color, a * 1.05);
        g.beginPath();
        g.arc(p1.x, p1.y, w * 1.1, Math.PI * 0.15, Math.PI * 0.85, false, 0);
        g.strokePath();
        if (i % 3 === 0) {
          g.fillStyle(art.accent, a);
          g.fillCircle(p1.x, p1.y - w, w * 0.3);
        }
        break;
      case 'ember':
        g.fillStyle(i % 2 ? color : 0xffd07a, a * 1.2);
        g.fillCircle(p1.x + Math.sin(i * 1.7) * 3, p1.y, w * 0.4);
        break;
      case 'shell':
        if (i % 2 === 0) {
          g.lineStyle(1.6, color, a * 1.1);
          for (let k = 0; k < 3; k++) {
            g.beginPath();
            g.arc(p1.x, p1.y + w * 0.6, w * (0.4 + k * 0.35), Math.PI * 1.15, Math.PI * 1.85, false, 0);
            g.strokePath();
          }
        }
        break;
      case 'bamboo':
        if (i % 2 === 0) {
          g.fillStyle(color, a * 1.15);
          g.fillEllipse(p1.x, p1.y, w * 0.6, w * 1.9);
          g.fillStyle(art.accent, a * 0.9);
          g.fillEllipse(p1.x, p1.y - w * 0.6, w * 0.3, w * 0.9);
        }
        break;
      case 'bone':
        if (i % 2 === 0) {
          g.lineStyle(2.4, color, a * 1.1);
          g.lineBetween(p1.x - w * 0.8, p1.y, p1.x + w * 0.8, p1.y);
          g.fillStyle(color, a * 1.1);
          g.fillCircle(p1.x - w * 0.8, p1.y - 1.6, w * 0.34);
          g.fillCircle(p1.x + w * 0.8, p1.y + 1.6, w * 0.34);
        }
        break;
      case 'silk':
        g.lineStyle(Math.max(1, w * 0.35), art.accent, a * 1.05);
        g.lineBetween(p0.x, p0.y + Math.sin(now / 150 + i) * 4, p1.x, p1.y);
        g.fillStyle(color, a * 0.8);
        g.fillCircle(p1.x, p1.y, w * 0.5);
        break;
      case 'snow':
        g.lineStyle(1.4, color, a * 1.1);
        for (let k = 0; k < 3; k++) {
          const sa = (k / 3) * Math.PI + now / 900;
          g.lineBetween(p1.x - Math.cos(sa) * w, p1.y - Math.sin(sa) * w, p1.x + Math.cos(sa) * w, p1.y + Math.sin(sa) * w);
        }
        break;
      case 'confetti':
        g.fillStyle(i % 2 ? color : art.accent, a * 1.25);
        g.fillRect(p1.x - w * 0.3, p1.y - w * 0.5, w * 0.6, w * 1.0);
        break;
      case 'clock':
        if (i % 3 === 0) {
          g.lineStyle(1.6, color, a * 1.1);
          g.strokeCircle(p1.x, p1.y, w * 0.9);
          g.lineBetween(p1.x, p1.y, p1.x + Math.cos(now / 200 + i) * w * 0.7, p1.y + Math.sin(now / 200 + i) * w * 0.7);
        }
        break;
      case 'talon':
        if (i % 2 === 0) {
          g.lineStyle(2.2, color, a * 1.2);
          for (let k = -1; k <= 1; k++) {
            g.lineBetween(p1.x + k * w * 0.5, p1.y - w, p1.x + k * w * 0.9, p1.y + w);
          }
        }
        break;
      case 'swirl':
        g.lineStyle(Math.max(1, w * 0.4), color, a * 1.05);
        g.beginPath();
        for (let s = 0; s <= 5; s++) {
          const u = s / 5;
          const sa = now / 200 + i + u * 3;
          const rr = w * (0.3 + u * 0.9);
          const px = p1.x + Math.cos(sa) * rr;
          const py = p1.y + Math.sin(sa) * rr;
          if (s === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.strokePath();
        break;
      case 'thorn':
        g.lineStyle(Math.max(1, w * 0.45), color, a * 1.05);
        g.lineBetween(p0.x, p0.y, p1.x, p1.y);
        if (i % 2 === 0) {
          g.fillStyle(art.accent, a);
          g.fillTriangle(p1.x, p1.y - w * 0.8, p1.x + w * 0.6, p1.y, p1.x - w * 0.6, p1.y);
        }
        break;
      case 'comet':
        g.fillStyle(color, a * 0.35);
        g.fillEllipse(p1.x, p1.y, w * 1.2, w * 2.4);
        g.fillStyle(art.accent, a * 1.2);
        g.fillCircle(p1.x, p1.y, w * 0.5);
        break;
      case 'flame':
        g.fillStyle(i % 2 ? 0xffd07a : color, a * 1.15);
        g.fillTriangle(p1.x - w * 0.6, p1.y + w, p1.x + w * 0.6, p1.y + w, p1.x, p1.y - w * 1.3);
        break;
      case 'scale':
        if (i % 2 === 0) {
          g.fillStyle(color, a * 1.1);
          g.beginPath();
          g.arc(p1.x, p1.y, w * 0.9, Math.PI, 0, false, 0);
          g.fillPath();
          g.lineStyle(1, art.accent, a * 0.9);
          g.beginPath();
          g.arc(p1.x, p1.y, w * 0.9, Math.PI, 0, false, 0);
          g.strokePath();
        }
        break;
      default:
        g.fillStyle(color, a);
        g.fillCircle(p1.x, p1.y, w * 0.5);
        break;
    }
  }
}

// ---- 挥拍拖尾（swingTrail）--------------------------------------------------
export type SwingPattern =
  | 'slash' | 'bolt' | 'ribbon' | 'sand' | 'star' | 'flame'
  // 后加：每个主题一种专属「斩」
  | 'crescent' | 'spiral' | 'inkwash' | 'chain' | 'gear' | 'runic'
  | 'feather' | 'candy' | 'water' | 'cross' | 'talon' | 'petal' | 'smoke' | 'scale' | 'bone';
export interface ThemeSwingArt { pattern: SwingPattern; accent: number; }

export const THEME_SWINGS: Record<string, ThemeSwingArt> = {
  // 每个主题一种专属「斩」，不重样
  desSwing: { pattern: 'crescent', accent: 0xffd45c },
  nimbSwing: { pattern: 'spiral', accent: 0xffffff },
  confSwing: { pattern: 'candy', accent: 0xff869c },
  bigtSwing: { pattern: 'smoke', accent: 0xffd45c },
  aegisSwing: { pattern: 'bolt', accent: 0xc0392b },
  chanSwing: { pattern: 'inkwash', accent: 0x2f7a4a },
  arcanSwing: { pattern: 'runic', accent: 0xb46cff },
  relicSwing: { pattern: 'bone', accent: 0xd8c8a0 },
  playSwing: { pattern: 'gear', accent: 0x4a90d9 },
  yuanSwing: { pattern: 'flame', accent: 0xffd45c },
  shanSwing: { pattern: 'scale', accent: 0xff8a3c },
};

/** 挥拍拖尾需要的路径工具（rig.ts 里现成的闭包，包一层传进来） */
export interface SwingPaint {
  g: Phaser.GameObjects.Graphics;
  color: number;
  n: number;
  ribbon: (wm: number, color: number, am: number, off?: number) => void;
  core: (wm: number, am: number) => void;
  at: (i: number, off?: number) => { x: number; y: number };
  dot: (i: number, r: number, color: number, am?: number) => void;
  wobble: (amp: (i: number) => number, wm: number, color: number, am: number) => void;
}

export function drawThemeSwing(art: ThemeSwingArt, p: SwingPaint): void {
  const { g, color, n } = p;
  switch (art.pattern) {
    case 'slash':
      p.ribbon(1.6, color, 1);
      p.core(0.4, 1.2);
      for (let i = 2; i < n; i += 4) p.dot(i, 2.4, art.accent, 0.8);
      break;
    case 'bolt':
      p.wobble((i) => Math.sin(i * 1.9) * 5, 0.8, color, 1.2);
      p.core(0.3, 0.9);
      break;
    case 'ribbon':
      p.ribbon(1, color, 0.9, 4);
      p.ribbon(1, art.accent, 0.7, -4);
      p.core(0.25, 0.8);
      break;
    case 'sand':
      p.ribbon(1.2, color, 0.9);
      for (let i = 1; i < n; i += 3) {
        const q = p.at(i);
        g.fillStyle(art.accent, 0.7);
        g.fillCircle(q.x + Math.sin(i) * 4, q.y + 3, 2.4);
      }
      break;
    case 'star':
      p.ribbon(0.9, color, 0.85);
      for (let i = 1; i < n; i += 3) {
        const q = p.at(i);
        const r = 4;
        g.fillStyle(art.accent, 0.9);
        g.fillTriangle(q.x, q.y - r, q.x + r * 0.6, q.y, q.x, q.y + r);
        g.fillTriangle(q.x, q.y - r, q.x - r * 0.6, q.y, q.x, q.y + r);
      }
      break;
    case 'flame':
      p.ribbon(1.8, color, 1);
      p.ribbon(1, 0xffd07a, 0.8);
      p.core(0.3, 1);
      break;
    case 'crescent':
      // 弯月斩：主弧 + 外侧一道细弧，收尾处一点寒光
      p.ribbon(1.5, color, 1);
      p.ribbon(0.5, art.accent, 0.8, 7);
      p.core(0.28, 1.1);
      for (let i = 2; i < n; i += 4) p.dot(i, 1.8, art.accent, 0.7);
      break;
    case 'spiral':
      // 旋风斩：整条弧左右拧着走
      p.wobble((i) => Math.sin(i * 0.8 + 0.2) * 7, 0.7, color, 1.1);
      p.core(0.25, 0.8);
      for (let i = 1; i < n; i += 3) p.dot(i, 2, art.accent, 0.7);
      break;
    case 'inkwash':
      // 水墨：一道浓笔 + 一大片淡墨晕开
      p.ribbon(2.2, color, 0.8);
      p.ribbon(3.6, color, 0.2);
      p.core(0.3, 0.9);
      break;
    case 'chain':
      // 锁链：沿弧一节节套环
      p.ribbon(0.5, color, 0.8);
      for (let i = 1; i < n; i += 2) {
        const q = p.at(i);
        g.lineStyle(1.8, color, 0.9);
        g.strokeEllipse(q.x, q.y, 7, 10);
      }
      break;
    case 'gear':
      // 机锯：弧上排一圈转动的齿
      p.ribbon(1.1, color, 0.85);
      for (let i = 1; i < n; i += 3) {
        const q = p.at(i);
        g.fillStyle(art.accent, 0.9);
        for (let k = 0; k < 6; k++) {
          const ga = (k / 6) * TAU;
          g.fillRect(q.x + Math.cos(ga) * 5 - 1.2, q.y + Math.sin(ga) * 5 - 1.2, 2.4, 2.4);
        }
        g.fillStyle(color, 0.95);
        g.fillCircle(q.x, q.y, 2.2);
      }
      break;
    case 'runic':
      // 符文：弧上浮出一个个卦象方块
      p.ribbon(0.7, color, 0.9);
      for (let i = 1; i < n; i += 3) {
        const q = p.at(i);
        g.lineStyle(1.6, art.accent, 0.95);
        g.strokeRect(q.x - 4, q.y - 5, 8, 10);
        g.lineBetween(q.x - 4, q.y - 1, q.x + 4, q.y - 1);
        g.lineBetween(q.x - 4, q.y + 3, q.x + 4, q.y + 3);
      }
      break;
    case 'feather':
      // 羽斩：弧上落满羽毛
      p.ribbon(0.8, color, 0.8);
      for (let i = 1; i < n; i += 2) {
        const q = p.at(i);
        g.fillStyle(i % 4 ? color : art.accent, 0.85);
        g.fillEllipse(q.x, q.y, 5, 12);
        g.lineStyle(1, 0xffffff, 0.5);
        g.lineBetween(q.x, q.y - 6, q.x, q.y + 6);
      }
      break;
    case 'candy':
      // 糖霜：两股颜色拧在一起的软糖弧
      p.ribbon(0.9, color, 0.95, 3);
      p.ribbon(0.9, art.accent, 0.9, -3);
      for (let i = 1; i < n; i += 3) p.dot(i, 2.4, 0xffffff, 0.75);
      break;
    case 'water':
      // 水斩：波纹荡开的弧
      p.wobble((i) => Math.sin(i * 0.6) * 4, 1.1, color, 1);
      for (let i = 1; i < n; i += 3) p.dot(i, 2.2, art.accent, 0.7);
      break;
    case 'cross':
      // 十字：弧上钉着一排小十字
      p.ribbon(0.9, color, 0.9);
      for (let i = 1; i < n; i += 3) {
        const q = p.at(i);
        g.lineStyle(1.8, art.accent, 0.95);
        g.lineBetween(q.x - 4, q.y, q.x + 4, q.y);
        g.lineBetween(q.x, q.y - 4, q.x, q.y + 4);
      }
      break;
    case 'talon':
      // 爪斩：三道并排的爪痕
      p.ribbon(0.8, color, 0.95, -5);
      p.ribbon(0.9, color, 1);
      p.ribbon(0.8, color, 0.95, 5);
      for (let i = 1; i < n; i += 4) p.dot(i, 2, art.accent, 0.8);
      break;
    case 'petal':
      // 花斩：弧边散着花瓣
      p.ribbon(0.8, color, 0.85);
      for (let i = 1; i < n; i += 2) {
        const q = p.at(i);
        g.fillStyle(i % 4 ? color : art.accent, 0.85);
        g.fillEllipse(q.x + Math.sin(i) * 5, q.y, 7, 4);
      }
      break;
    case 'smoke':
      // 烟斩：一团散开的烟
      p.ribbon(2.8, color, 0.28);
      p.core(0.2, 0.6);
      for (let i = 1; i < n; i += 2) {
        const q = p.at(i);
        g.fillStyle(color, 0.22);
        g.fillCircle(q.x, q.y, 6);
      }
      break;
    case 'scale':
      // 龙鳞斩：弧上一层叠瓦鳞
      p.ribbon(1.1, color, 0.9);
      for (let i = 1; i < n; i += 2) {
        const q = p.at(i);
        g.fillStyle(art.accent, 0.55);
        g.beginPath();
        g.arc(q.x, q.y, 5, Math.PI, 0, false, 0);
        g.fillPath();
      }
      break;
    case 'bone':
      // 骨节斩：弧上串着一节节骨
      p.ribbon(0.7, color, 0.85);
      for (let i = 1; i < n; i += 2) {
        const q = p.at(i);
        g.lineStyle(2.2, art.accent, 0.9);
        g.lineBetween(q.x - 6, q.y, q.x + 6, q.y);
        g.fillStyle(color, 0.95);
        g.fillCircle(q.x - 6, q.y, 2.6);
        g.fillCircle(q.x + 6, q.y, 2.6);
      }
      break;
    default:
      p.ribbon(1.2, color, 1);
      break;
  }
}
