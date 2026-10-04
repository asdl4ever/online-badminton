import Phaser from 'phaser';
import {
  AURA_COLORS,
  CAPE_COLORS,
  CAPE_SHAPE,
  HAT_COLORS,
  HAT_KIND,
  PET_COLORS,
  FULL_HEAD_DY,
  PET_KIND,
  RING_COLORS,
  WING_COLORS,
  WING_SHAPE,
  replacesHead,
  skinHeadH,
  type AuraId,
  type CapeId,
  type Cosmetic,
  type HatId,
  type PetId,
  type RingId,
} from '../cosmetics';
import { PLAYER_H } from '../constants';
import { P } from '../theme';
import { drawMount } from './mounts';
import {
  THEME_AURAS,
  THEME_HATS,
  THEME_RINGS,
  THEME_SKIN_ART,
  drawThemeAura,
  drawThemeHat,
  drawThemeRing,
} from './themeart';

/**
 * Draws a player character and every cosmetic slot it can wear.
 *
 * Shared by the match scene and the climb scene, so an outfit picked in the
 * backpack looks the same wherever the character shows up. Everything is
 * immediate-mode Graphics: the caller owns the `Graphics` object and this file
 * only emits draw commands into it.
 *
 * `now` is passed in rather than read from a scene clock, so the animation
 * phase stays under the caller's control.
 */


/** a cape streaming down the player's back; shape depends on the kind */
export function drawCape(g: Phaser.GameObjects.Graphics, now: number, x: number, topY: number, id: CapeId): void {
  const shape = CAPE_SHAPE[id];
  const color = CAPE_COLORS[id];
  if (!shape || shape.len === 0) return;
  const sway = Math.sin(now / 420) * 6;
  const baseY = topY + 30;
  const w = shape.w;
  const len = shape.len;

  switch (shape.kind) {
    case 'cloth': {
      g.fillStyle(color, 0.85);
      g.beginPath();
      g.moveTo(x - w * 0.5, baseY);
      g.lineTo(x + w * 0.5, baseY);
      g.lineTo(x + w * 0.7 + sway, baseY + len);
      g.lineTo(x - w * 0.7 + sway, baseY + len);
      g.closePath();
      g.fillPath();
      break;
    }
    case 'tatter': {
      g.fillStyle(color, 0.85);
      g.beginPath();
      g.moveTo(x - w * 0.5, baseY);
      g.lineTo(x + w * 0.5, baseY);
      const segs = 5;
      for (let k = segs; k >= 0; k--) {
        const px = x - w * 0.7 + (k / segs) * w * 1.4 + sway;
        const py = baseY + len - (k % 2 === 0 ? 0 : 10);
        g.lineTo(px, py);
      }
      g.closePath();
      g.fillPath();
      break;
    }
    case 'flame': {
      g.fillStyle(color, 0.5);
      g.fillRect(x - w * 0.5, baseY, w, len);
      for (let k = 0; k < 4; k++) {
        const ph = (now / 300 + k / 4) % 1;
        g.fillStyle(k % 2 ? 0xffd07a : color, 0.7 * (1 - ph * 0.5));
        g.fillEllipse(x + (k - 1.5) * w * 0.4, baseY + len * 0.5 - ph * 10, w * 0.5, len * 0.7);
      }
      break;
    }
    case 'feather': {
      for (let k = 0; k < 5; k++) {
        const px = x - w * 0.6 + (k / 4) * w * 1.2;
        const ph = (now / 500 + k / 5) % 1;
        g.fillStyle(color, 0.7);
        g.fillEllipse(px, baseY + ph * len, 9, 14);
      }
      break;
    }
    case 'royal': {
      g.fillStyle(color, 0.88);
      g.beginPath();
      g.moveTo(x - w * 0.5, baseY);
      g.lineTo(x + w * 0.5, baseY);
      g.lineTo(x + w * 0.8 + sway, baseY + len);
      g.lineTo(x - w * 0.8 + sway, baseY + len);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xffffff, 0.35);
      for (let k = -1; k <= 1; k++) {
        g.fillRect(x + k * w * 0.5 - 3, baseY + 8, 6, 6);
      }
      g.lineStyle(2, 0xffd45c, 0.8);
      g.lineBetween(x - w * 0.6 + sway, baseY + len, x + w * 0.6 + sway, baseY + len);
      break;
    }
    case 'split': {
      for (const d of [-1, 1]) {
        g.fillStyle(color, 0.88);
        g.beginPath();
        g.moveTo(x, baseY);
        g.lineTo(x + d * w * 0.5, baseY);
        g.lineTo(x + d * w * 0.75 + sway, baseY + len);
        g.lineTo(x + d * w * 0.2 + sway, baseY + len);
        g.closePath();
        g.fillPath();
      }
      g.fillStyle(0xffffff, 0.25);
      g.fillCircle(x, baseY + 10, 4);
      break;
    }
    case 'scales': {
      // 龙甲披风：一行行叠瓦，随 sway 错动
      g.fillStyle(color, 0.9);
      g.beginPath();
      g.moveTo(x - w * 0.5, baseY);
      g.lineTo(x + w * 0.5, baseY);
      g.lineTo(x + w * 0.6 + sway, baseY + len);
      g.lineTo(x - w * 0.6 + sway, baseY + len);
      g.closePath();
      g.fillPath();
      const rows = Math.max(3, Math.round(len / 14));
      for (let r = 0; r < rows; r++) {
        const ry = baseY + 8 + (r / rows) * (len - 10);
        const shrink = 1 - r / (rows * 1.6);
        for (let k = -2; k <= 2; k++) {
          g.fillStyle(0xffffff, 0.18);
          g.beginPath();
          g.arc(x + k * w * 0.24 * shrink + sway * (r / rows), ry, w * 0.13 * shrink, 0, Math.PI, false, 0);
          g.fillPath();
        }
      }
      g.lineStyle(2, 0xffffff, 0.3);
      g.lineBetween(x - w * 0.6 + sway, baseY + len, x + w * 0.6 + sway, baseY + len);
      break;
    }
    case 'streak': {
      // 彗尾披风：数条向后拉长的光迹
      for (let k = 0; k < 5; k++) {
        const off = (k - 2) * w * 0.22;
        g.lineStyle(4 - Math.abs(k - 2) * 0.6, color, 0.75 - Math.abs(k - 2) * 0.12);
        g.beginPath();
        for (let s = 0; s <= 6; s++) {
          const u = s / 6;
          const px = x + off + sway * 1.5 * u;
          const py = baseY + u * (len + k * 3);
          if (s === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.strokePath();
      }
      g.fillStyle(0xffffff, 0.5);
      g.fillCircle(x, baseY + 4, 4);
      break;
    }
    case 'antigrav': {
      // 反重力披风：下摆不落地、往上飘，几道光带沿布面向上游走
      const lift = 10 + Math.sin(now / 420) * 4;
      g.fillStyle(color, 0.34);
      g.beginPath();
      g.moveTo(x - w * 0.5, baseY);
      g.lineTo(x + w * 0.5, baseY);
      g.lineTo(x + w * 0.34 + sway, baseY + len - lift);
      g.lineTo(x - w * 0.34 + sway, baseY + len - lift);
      g.closePath();
      g.fillPath();
      g.lineStyle(2, color, 0.75);
      g.beginPath();
      g.moveTo(x - w * 0.5, baseY);
      g.lineTo(x - w * 0.34 + sway, baseY + len - lift);
      g.moveTo(x + w * 0.5, baseY);
      g.lineTo(x + w * 0.34 + sway, baseY + len - lift);
      g.strokePath();
      for (let k = 0; k < 3; k++) {
        const ph = (now / 1100 + k / 3) % 1;
        const px = x - w * 0.3 + k * w * 0.3;
        const py = baseY + len * (1 - ph) + sway * 0.6;
        g.lineStyle(2.2, 0xd8fff0, 0.65 * (1 - ph));
        g.lineBetween(px, py, px, py - 12);
      }
      g.fillStyle(0xffffff, 0.5);
      g.fillEllipse(x + sway * 0.4, baseY + 3, w * 0.86, 6);
      break;
    }
    case 'towel': {
      // 冠军毛巾：肩上一条白毛巾，红条纹，尾端随 sway 轻摆
      g.fillStyle(color, 0.96);
      g.fillRect(x - w * 0.5, baseY, w, len);
      g.fillStyle(0xd42a3a, 0.9);
      g.fillRect(x - w * 0.5, baseY + len - 10, w, 4);
      g.fillRect(x - w * 0.5, baseY + len - 20, w, 3);
      g.fillStyle(0xffffff, 0.35);
      g.fillRect(x - w * 0.5, baseY + 4, w, 3);
      break;
    }
    case 'candywrap': {
      // 糖霜卷帘：斜条纹的糖果布，底端收成一段卷
      g.fillStyle(color, 0.94);
      g.fillRect(x - w * 0.5, baseY, w, len);
      g.fillStyle(0xffffff, 0.85);
      for (let k = -2; k <= 3; k++) {
        const cy = baseY + k * 12;
        g.beginPath();
        g.moveTo(x - w * 0.5, cy);
        g.lineTo(x - w * 0.5, cy + 6);
        g.lineTo(x + w * 0.5, cy + 6 - 10);
        g.lineTo(x + w * 0.5, cy - 4 - 10);
        g.closePath();
        g.fillPath();
      }
      g.fillStyle(art0(color), 0.9);
      g.fillCircle(x + sway * 0.6, baseY + len + 4, w * 0.26);
      break;
    }
    case 'tentflap': {
      // 帐篷幕布：顶杆 + 两片下垂的条纹幔，底边打波浪
      g.fillStyle(0x8a7248, 1);
      g.fillRect(x - w * 0.62, baseY - 2, w * 1.24, 4);
      for (const d of [-1, 1]) {
        g.fillStyle(d < 0 ? color : 0xd42a3a, 0.92);
        g.beginPath();
        g.moveTo(x, baseY);
        g.lineTo(x + d * w * 0.6, baseY);
        for (let k = 4; k >= 0; k--) {
          const px = x + d * w * (0.2 + (k / 4) * 0.4) + sway;
          g.lineTo(px, baseY + len - (k % 2 === 0 ? 0 : 11));
        }
        g.closePath();
        g.fillPath();
      }
      break;
    }
    case 'flag': {
      // 战旗：一根旗杆挂着一面飘动的方旗 + 中央纹章
      g.fillStyle(0xc0ccda, 1);
      g.fillRect(x - 1.5, baseY - 6, 3, len + 10);
      g.fillStyle(color, 0.94);
      g.beginPath();
      g.moveTo(x + 1.5, baseY - 4);
      g.lineTo(x + 1.5 + w * 0.8 + sway, baseY + 6);
      g.lineTo(x + 1.5 + w * 0.8 + sway, baseY + len * 0.7);
      g.lineTo(x + 1.5, baseY + len * 0.8);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xffd45c, 0.95);
      g.fillCircle(x + w * 0.42 + sway * 0.5, baseY + len * 0.38, w * 0.16);
      break;
    }
    case 'leafcloak': {
      // 叶披风：三片大叶子交叠，各自轻摆
      for (let k = 0; k < 3; k++) {
        const ox = (k - 1) * w * 0.34;
        const sw = sway * (0.4 + k * 0.35);
        g.fillStyle(k % 2 ? color : art0(color), 0.92);
        g.beginPath();
        g.moveTo(x + ox - w * 0.2, baseY);
        g.lineTo(x + ox + w * 0.2, baseY);
        g.lineTo(x + ox + sw, baseY + len - k * 4);
        g.closePath();
        g.fillPath();
        g.lineStyle(1.2, 0xffffff, 0.45);
        g.lineBetween(x + ox, baseY + 4, x + ox + sw, baseY + len - 6 - k * 4);
      }
      break;
    }
    case 'pelt': {
      // 兽皮：一块带毛边的皮子，边缘一撮撮毛、中央一块斑纹
      g.fillStyle(color, 0.95);
      g.beginPath();
      g.moveTo(x - w * 0.5, baseY);
      g.lineTo(x + w * 0.5, baseY);
      g.lineTo(x + w * 0.56 + sway, baseY + len);
      g.lineTo(x - w * 0.56 + sway, baseY + len);
      g.closePath();
      g.fillPath();
      g.fillStyle(color, 1);
      for (let k = -3; k <= 3; k++) {
        const px = x + k * w * 0.16 + sway;
        g.fillTriangle(px - 3, baseY + len, px + 3, baseY + len, px, baseY + len + 6);
      }
      g.fillStyle(0x1a1a22, 0.4);
      g.fillEllipse(x + sway * 0.5, baseY + len * 0.45, w * 0.5, len * 0.3);
      break;
    }
    case 'lanternrow': {
      // 灯帘：一根横杆下挂三盏晃动的灯笼
      g.fillStyle(0x8a5a2a, 1);
      g.fillRect(x - w * 0.55 + sway * 0.4, baseY - 2, w * 1.1, 3);
      for (let k = -1; k <= 1; k++) {
        const ph = Math.sin(now / 400 + k * 1.2) * 3;
        const lx = x + k * w * 0.36 + ph;
        const ly = baseY + 6 + len * (0.3 + (k + 1) * 0.14);
        g.lineStyle(1.4, 0x8a5a2a, 0.9);
        g.lineBetween(x + k * w * 0.36 + sway * 0.4, baseY, lx, ly - 7);
        g.fillStyle(k % 2 ? color : 0xffd45c, 0.95);
        g.fillEllipse(lx, ly, w * 0.24, len * 0.16);
        g.fillStyle(0xfff0b0, 0.7);
        g.fillCircle(lx, ly, w * 0.08);
      }
      break;
    }
    case 'talon': {
      // 白骨爪：三根骨爪垂下来，关节处一个圆
      for (let k = -1; k <= 1; k++) {
        const bx = x + k * w * 0.34;
        g.lineStyle(4, 0xe8e0cf, 0.95);
        g.lineBetween(bx, baseY, bx + sway * 0.5, baseY + len);
        g.fillStyle(0xe8e0cf, 1);
        g.fillCircle(bx + sway * 0.2, baseY + len * 0.5, 3.2);
        g.fillCircle(bx + sway * 0.5, baseY + len, 2.6);
      }
      break;
    }
    case 'shellfan': {
      // 贝扇：一把扇贝壳，放射纹 + 底端同心弧
      g.fillStyle(color, 0.92);
      g.beginPath();
      g.arc(x, baseY + len * 0.9, len * 0.75 + sway * 0.4, Math.PI * 1.08, Math.PI * 1.92, false, 0);
      g.closePath();
      g.fillPath();
      g.lineStyle(1.4, 0xffffff, 0.6);
      for (let k = 0; k <= 6; k++) {
        const a = Math.PI * (1.06 + (k / 6) * 0.88);
        g.lineBetween(x, baseY + len * 0.9, x + Math.cos(a) * len * 0.72, baseY + len * 0.9 + Math.sin(a) * len * 0.72);
      }
      g.lineStyle(1.4, 0xffffff, 0.5);
      g.beginPath();
      g.arc(x, baseY + len * 0.9, len * 0.42, Math.PI * 1.1, Math.PI * 1.9, false, 0);
      g.strokePath();
      break;
    }
    case 'ribboncurl': {
      // 卷曲缎带：一条 S 形飘带，末端打卷
      g.lineStyle(7, color, 0.95);
      g.beginPath();
      for (let s = 0; s <= 8; s++) {
        const u = s / 8;
        const px = x + Math.sin(u * 4 + now / 500) * w * 0.4 + sway * u;
        const py = baseY + u * len;
        if (s === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.strokePath();
      g.lineStyle(4, 0xffffff, 0.4);
      g.beginPath();
      for (let s = 0; s <= 8; s++) {
        const u = s / 8;
        const px = x + Math.sin(u * 4 + now / 500) * w * 0.4 + sway * u;
        const py = baseY + u * len;
        if (s === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.strokePath();
      break;
    }
    case 'puffcloud': {
      // 云披：几团云叠着往下堆，各自缓缓起伏
      for (let k = 0; k < 4; k++) {
        const ph = Math.sin(now / 500 + k);
        g.fillStyle(k % 2 ? 0xffffff : color, 0.85);
        g.fillCircle(x + (k - 1.5) * w * 0.26 + ph * 2, baseY + 10 + k * (len / 4.4), w * (0.42 - k * 0.04));
      }
      break;
    }
    case 'inkflow': {
      // 水墨披：上方一块浓墨，下方拖出一串墨滴
      g.fillStyle(color, 0.9);
      g.beginPath();
      g.moveTo(x - w * 0.5, baseY);
      g.lineTo(x + w * 0.5, baseY);
      g.lineTo(x + w * 0.4 + sway, baseY + len * 0.6);
      g.lineTo(x - w * 0.4 + sway, baseY + len * 0.6);
      g.closePath();
      g.fillPath();
      for (let k = 0; k < 4; k++) {
        const ph = (now / 900 + k / 4) % 1;
        g.fillStyle(color, 0.5 * (1 - ph));
        g.fillCircle(x + (k - 1.5) * w * 0.24 + sway * 0.5, baseY + len * 0.6 + ph * len * 0.5, 3 * (1 - ph) + 1);
      }
      break;
    }
    case 'gearhang': {
      // 齿轮帘：横杆下挂三个转动的齿轮
      g.fillStyle(0x5a6472, 1);
      g.fillRect(x - w * 0.55 + sway * 0.4, baseY - 2, w * 1.1, 3);
      for (let k = -1; k <= 1; k++) {
        const gx = x + k * w * 0.34 + sway * 0.4;
        const gy = baseY + 12 + len * (0.28 + (k + 1) * 0.12);
        g.lineStyle(1.6, 0x8fa0b8, 0.8);
        g.lineBetween(gx, baseY, gx, gy - 6);
        g.fillStyle(k % 2 ? color : 0x8fa0b8, 0.95);
        for (let j = 0; j < 6; j++) {
          const ga = (j / 6) * Math.PI * 2 + now / 300 * (k % 2 ? -1 : 1);
          g.fillRect(gx + Math.cos(ga) * 7 - 2, gy + Math.sin(ga) * 7 - 2, 4, 4);
        }
        g.fillCircle(gx, gy, 4);
      }
      break;
    }
    case 'petalrain': {
      // 花雨披：花瓣自上而下loop飘落
      for (let k = 0; k < 6; k++) {
        const ph = (now / 1600 + k / 6) % 1;
        g.fillStyle(k % 2 ? color : 0xffffff, 0.85 * Math.sin(ph * Math.PI));
        g.fillEllipse(
          x + Math.sin(k * 2.1 + now / 600) * w * 0.5 + sway * 0.4,
          baseY + ph * len,
          7, 4,
        );
      }
      break;
    }
    case 'silkveil': {
      // 丝绸：半透明帘 + 两道流动的高光
      g.fillStyle(color, 0.55);
      g.beginPath();
      g.moveTo(x - w * 0.5, baseY);
      g.lineTo(x + w * 0.5, baseY);
      g.lineTo(x + w * 0.6 + sway, baseY + len);
      g.lineTo(x - w * 0.6 + sway, baseY + len);
      g.closePath();
      g.fillPath();
      for (const d of [-0.25, 0.25]) {
        g.lineStyle(2.4, 0xffffff, 0.45);
        g.beginPath();
        for (let s = 0; s <= 6; s++) {
          const u = s / 6;
          const px = x + d * w + Math.sin(u * 4 + now / 400) * w * 0.16 + sway * u;
          const py = baseY + u * len;
          if (s === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.strokePath();
      }
      break;
    }
    case 'frostveil': {
      // 冰晶帘：一排长短不一的冰锥，尖端微微闪光
      for (let k = -3; k <= 3; k++) {
        const px = x + k * w * 0.16 + sway * 0.4;
        const hh = len * (0.6 + ((k + 3) % 3) * 0.2);
        g.fillStyle(color, 0.82);
        g.fillTriangle(px - 4, baseY, px + 4, baseY, px, baseY + hh);
        g.fillStyle(0xffffff, 0.7);
        g.fillCircle(px, baseY + hh - 2, 1.6);
      }
      break;
    }
    case 'starpelt': {
      // 星幕：深色幕布上星点明灭
      g.fillStyle(color, 0.92);
      g.beginPath();
      g.moveTo(x - w * 0.5, baseY);
      g.lineTo(x + w * 0.5, baseY);
      g.lineTo(x + w * 0.6 + sway, baseY + len);
      g.lineTo(x - w * 0.6 + sway, baseY + len);
      g.closePath();
      g.fillPath();
      for (let k = 0; k < 10; k++) {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 500 + k * 1.7));
        g.fillStyle(0xffffff, 0.85 * tw);
        const rx = x + Math.sin(k * 2.3) * w * 0.45 + sway * 0.5;
        const ry = baseY + 6 + ((k * 37) % Math.max(8, len - 12));
        g.fillCircle(rx, ry, k % 4 === 0 ? 2.2 : 1.3);
      }
      break;
    }
  }
}

/** 取一个比主色更亮的近似色（同色系高光），给披风当条纹/第二层用 */
function art0(c: number): number {
  const r = Math.min(255, ((c >> 16) & 255) + 60);
  const gg = Math.min(255, ((c >> 8) & 255) + 60);
  const b = Math.min(255, (c & 255) + 60);
  return (r << 16) | (gg << 8) | b;
}

/**
 * a headpiece drawn just above the player's head
 *
 * `now` 是毫秒时间戳，只给**新那批会动的头饰**用（风车在转、蜜蜂在绕、灯泡在闪…）。
 * 默认 0，所以图标那种静态场合不用传。
 */
export function drawHat(
  g: Phaser.GameObjects.Graphics,
  x: number,
  topY: number,
  id: HatId,
  now = 0,
): void {
  const color = HAT_COLORS[id];
  const hy = topY + 4;
  // 新主题宝箱的头饰：统一走 themeart 的通用画法
  const themeHat = THEME_HATS[id];
  if (themeHat) {
    drawThemeHat(g, x, topY, color, themeHat, now);
    return;
  }
  switch (HAT_KIND[id]) {
    case 'crown': {
      g.fillStyle(color, 1);
      g.fillTriangle(x - 16, hy + 6, x - 10, hy - 8, x - 4, hy + 6);
      g.fillTriangle(x - 6, hy + 6, x, hy - 12, x + 6, hy + 6);
      g.fillTriangle(x + 4, hy + 6, x + 10, hy - 8, x + 16, hy + 6);
      g.fillRect(x - 16, hy + 6, 32, 5);
      break;
    }
    case 'cap': {
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 2, 30, 20);
      g.fillRect(x - 16, hy + 2, 32, 5);
      g.fillRect(x + 2, hy + 2, 16, 4);
      break;
    }
    case 'ufoHelm': {
      // 飞碟头盔：半透明玻璃罩 + 罩里的绿色小外星人 + 罩底金属颈环 + 顶上天线
      g.fillStyle(color, 0.3);
      g.fillCircle(x, hy - 6, 17);
      g.lineStyle(2, color, 0.9);
      g.strokeCircle(x, hy - 6, 17);
      g.fillStyle(0x6fe09a, 1);
      g.fillEllipse(x, hy - 3, 18, 22);
      g.fillStyle(0x0e1a14, 1);
      g.fillEllipse(x - 4.5, hy - 7, 6, 8);
      g.fillEllipse(x + 4.5, hy - 7, 6, 8);
      g.fillStyle(0xd8e2ea, 1);
      g.fillRect(x - 18, hy + 9, 36, 5);
      g.lineStyle(2, 0xd8e2ea, 1);
      g.lineBetween(x, hy - 23, x, hy - 29);
      g.fillStyle(0xff6a6a, 1);
      g.fillCircle(x, hy - 31, 3);
      break;
    }
    case 'coachcap': {
      // 教练帽：绿呢帽身 + 前伸帽檐 + 侧面小旗徽
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 2, 30, 20);
      g.fillRect(x - 16, hy + 2, 32, 5);
      g.fillStyle(0x24482c, 1);
      g.fillRect(x - 16, hy + 4, 32, 3);
      g.fillStyle(0xd8cba0, 1);
      g.fillRect(x + 2, hy + 2, 18, 4); // 帽檐
      g.fillStyle(0xe8a33d, 1); // 旗徽
      g.fillTriangle(x - 10, hy - 4, x - 10, hy + 4, x - 2, hy);
      break;
    }
    case 'horn': {
      g.fillStyle(color, 1);
      g.fillTriangle(x - 16, hy + 4, x - 22, hy - 12, x - 8, hy - 2);
      g.fillTriangle(x + 16, hy + 4, x + 22, hy - 12, x + 8, hy - 2);
      break;
    }
    case 'halo': {
      g.lineStyle(4, color, 0.95);
      g.strokeEllipse(x, hy - 8, 34, 12);
      break;
    }
    case 'wizard': {
      g.fillStyle(color, 1);
      g.fillTriangle(x, hy - 24, x - 18, hy + 6, x + 18, hy + 6);
      g.fillRect(x - 20, hy + 6, 40, 5);
      break;
    }
    case 'santa': {
      g.fillStyle(color, 1);
      g.fillTriangle(x, hy - 18, x - 16, hy + 4, x + 16, hy + 4);
      g.fillRect(x - 18, hy + 4, 36, 5);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x, hy - 20, 5);
      break;
    }
    case 'band': {
      g.fillStyle(color, 1);
      g.fillRect(x - 16, hy + 2, 32, 7);
      g.fillStyle(0xd42a3a, 1);
      g.fillRect(x + 8, hy + 3, 5, 5);
      break;
    }
    case 'flower': {
      for (let k = 0; k < 5; k++) {
        const ang = (k / 5) * Math.PI * 2;
        g.fillStyle(color, 0.95);
        g.fillCircle(x + Math.cos(ang) * 9, hy - 2 - Math.sin(ang) * 6, 5);
      }
      g.fillStyle(0xfff0a0, 1);
      g.fillCircle(x, hy - 2, 4);
      break;
    }
    case 'phone': {
      g.lineStyle(5, color, 1);
      g.beginPath();
      g.arc(x - 12, hy, 10, Math.PI, Math.PI * 2, false, 0);
      g.strokePath();
      g.beginPath();
      g.arc(x + 12, hy, 10, Math.PI, Math.PI * 2, false, 0);
      g.strokePath();
      break;
    }
    case 'top': {
      g.fillStyle(color, 1);
      g.fillRect(x - 16, hy + 4, 32, 5);
      g.fillRect(x - 10, hy - 18, 20, 22);
      g.fillStyle(0xd42a3a, 1);
      g.fillRect(x - 10, hy - 2, 20, 5);
      break;
    }
    case 'helm': {
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 2, 34, 24);
      g.fillRect(x - 17, hy + 2, 34, 6);
      g.fillStyle(0xffd45c, 1);
      g.fillTriangle(x, hy + 2, x - 6, hy - 6, x + 6, hy - 6);
      break;
    }
    case 'pirate': {
      g.fillStyle(color, 1);
      g.beginPath();
      g.moveTo(x - 24, hy + 6);
      g.lineTo(x - 10, hy - 10);
      g.lineTo(x + 10, hy - 10);
      g.lineTo(x + 24, hy + 6);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(x, hy - 3, 3);
      break;
    }
    case 'chef': {
      g.fillStyle(color, 1);
      g.fillRect(x - 16, hy + 2, 32, 8);
      g.fillCircle(x - 10, hy - 6, 9);
      g.fillCircle(x, hy - 11, 10);
      g.fillCircle(x + 10, hy - 6, 9);
      break;
    }
    case 'astro': {
      g.fillStyle(color, 0.55);
      g.fillCircle(x, hy - 2, 16);
      g.lineStyle(3, color, 1);
      g.strokeCircle(x, hy - 2, 16);
      g.fillStyle(0x39ffd0, 0.8);
      g.fillEllipse(x, hy - 2, 22, 10);
      break;
    }
    case 'mushroom': {
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 2, 40, 24);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(x - 8, hy - 2, 3);
      g.fillCircle(x + 6, hy + 2, 3.5);
      g.fillCircle(x + 12, hy - 5, 2.5);
      g.fillStyle(0xf0e0c0, 1);
      g.fillRect(x - 6, hy + 8, 12, 12);
      break;
    }
    case 'beanie': {
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy, 32, 24);
      g.fillRect(x - 16, hy + 2, 32, 6);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x, hy - 15, 5);
      break;
    }
    case 'antler': {
      g.lineStyle(3.5, color, 1);
      g.lineBetween(x - 12, hy, x - 14, hy - 16);
      g.lineBetween(x - 14, hy - 16, x - 22, hy - 21);
      g.lineBetween(x - 14, hy - 12, x - 22, hy - 7);
      g.lineBetween(x + 12, hy, x + 14, hy - 16);
      g.lineBetween(x + 14, hy - 16, x + 22, hy - 21);
      g.lineBetween(x + 14, hy - 12, x + 22, hy - 7);
      break;
    }
    case 'jester': {
      for (let k = -1; k <= 1; k++) {
        g.fillStyle(k === 0 ? color : 0xd42a3a, 1);
        g.beginPath();
        g.moveTo(x + k * 12, hy + 6);
        g.lineTo(x + k * 16, hy - 18);
        g.lineTo(x + k * 25, hy + 2);
        g.closePath();
        g.fillPath();
      }
      g.fillStyle(color, 1);
      g.fillRect(x - 16, hy + 4, 32, 6);
      break;
    }
    case 'sombrero': {
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 6, 56, 16);
      g.fillEllipse(x, hy - 7, 28, 18);
      g.fillStyle(0xd42a3a, 1);
      g.fillRect(x - 14, hy - 3, 28, 4);
      break;
    }
    case 'samurai': {
      // 甲胄盔：漆黑盔体 + 前立月牙 + 护颈
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 2, 34, 22);
      g.fillRect(x - 18, hy + 2, 36, 6);
      g.fillStyle(0xffd45c, 1);
      g.beginPath();
      g.arc(x, hy - 10, 9, Math.PI * 0.15, Math.PI * 0.85, false, 0);
      g.strokePath();
      g.lineStyle(3.5, 0xffd45c, 1);
      g.beginPath();
      g.arc(x, hy - 16, 10, Math.PI * 0.2, Math.PI * 0.8, false, 0);
      g.strokePath();
      g.fillStyle(0xffd45c, 0.9);
      g.fillCircle(x, hy - 4, 3);
      break;
    }
    case 'foxMask': {
      // 狐狸面具：斜戴的狐面 + 耳朵 + 红纹
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 2, 30, 22);
      g.fillTriangle(x - 14, hy - 6, x - 8, hy - 20, x - 2, hy - 6);
      g.fillTriangle(x + 14, hy - 6, x + 8, hy - 20, x + 2, hy - 6);
      g.fillStyle(0xffffff, 0.9);
      g.fillEllipse(x, hy + 4, 20, 12);
      g.fillStyle(0xd42a3a, 1);
      g.fillTriangle(x - 5, hy + 2, x - 2, hy + 6, x - 8, hy + 6);
      g.fillTriangle(x + 5, hy + 2, x + 8, hy + 6, x + 2, hy + 6);
      g.fillStyle(0x1a1a22, 1);
      g.fillCircle(x - 6, hy - 1, 1.6);
      g.fillCircle(x + 6, hy - 1, 1.6);
      break;
    }
    case 'frostCrown': {
      // 冰晶王冠：三根参差冰棱 + 霜环
      g.lineStyle(2, color, 0.5);
      g.strokeEllipse(x, hy + 6, 34, 8);
      g.fillStyle(color, 0.9);
      g.fillTriangle(x - 14, hy + 6, x - 11, hy - 14, x - 6, hy + 6);
      g.fillTriangle(x - 5, hy + 6, x, hy - 20, x + 4, hy + 6);
      g.fillTriangle(x + 6, hy + 6, x + 11, hy - 12, x + 15, hy + 6);
      g.fillStyle(0xffffff, 0.7);
      g.fillCircle(x, hy - 20, 2.5);
      break;
    }
    case 'flameCrown': {
      // 焰冠：跳动的火苗王冠
      g.fillStyle(color, 0.95);
      g.fillRect(x - 15, hy + 4, 30, 5);
      for (let k = -2; k <= 2; k++) {
        const h = 12 + (k % 2 ? 8 : 0) - Math.abs(k) * 2;
        g.fillStyle(k % 2 ? 0xffd07a : color, 1);
        g.fillTriangle(x + k * 7 - 4, hy + 4, x + k * 7 + 4, hy + 4, x + k * 7, hy + 4 - h);
      }
      break;
    }
    case 'witch': {
      // 女巫尖帽：弯曲帽尖 + 帽扣
      g.fillStyle(color, 1);
      g.fillTriangle(x - 2, hy - 26, x - 18, hy + 6, x + 18, hy + 6);
      g.beginPath();
      g.moveTo(x - 2, hy - 26);
      g.lineTo(x + 10, hy - 34);
      g.lineTo(x + 12, hy - 28);
      g.closePath();
      g.fillPath();
      g.fillRect(x - 20, hy + 6, 40, 5);
      g.fillStyle(0xffd45c, 1);
      g.fillRect(x - 4, hy - 4, 8, 6);
      break;
    }
    case 'beret': {
      // 贝雷帽：软塌斜戴 + 小揪
      g.fillStyle(color, 1);
      g.fillEllipse(x + 3, hy - 2, 34, 16);
      g.fillRect(x - 14, hy + 3, 32, 4);
      g.fillStyle(0x1a1a22, 1);
      g.fillCircle(x + 3, hy - 11, 3);
      break;
    }
    case 'vr': {
      // VR 头显：黑色面罩 + 流动青光
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 17, hy - 6, 34, 16, 6);
      g.fillStyle(0x39ffd0, 0.75);
      g.fillRoundedRect(x - 13, hy - 2, 26, 7, 3);
      g.fillStyle(0x39ffd0, 0.35);
      g.fillRoundedRect(x - 13, hy - 2, 12, 7, 3);
      g.lineStyle(2, 0x39ffd0, 0.8);
      g.lineBetween(x - 17, hy + 10, x - 22, hy + 16);
      g.lineBetween(x + 17, hy + 10, x + 22, hy + 16);
      break;
    }
    case 'sunCrown': {
      // 太阳冠：金色日盘 + 放射尖刺
      g.fillStyle(color, 1);
      g.fillCircle(x, hy - 2, 10);
      for (let k = 0; k < 8; k++) {
        const ang = (k / 8) * Math.PI * 2;
        const cx2 = x + Math.cos(ang) * 14;
        const cy2 = hy - 2 + Math.sin(ang) * 14;
        g.fillTriangle(
          x + Math.cos(ang - 0.18) * 10, hy - 2 + Math.sin(ang - 0.18) * 10,
          x + Math.cos(ang + 0.18) * 10, hy - 2 + Math.sin(ang + 0.18) * 10,
          cx2, cy2,
        );
      }
      g.fillStyle(0xfff2c4, 1);
      g.fillCircle(x, hy - 2, 5);
      break;
    }
    case 'plague': {
      // 瘟疫医生：宽檐帽 + 长喙面具
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 6, 46, 10);
      g.fillRect(x - 10, hy - 8, 20, 12);
      g.fillStyle(0x3a3a4a, 1);
      g.fillTriangle(x - 8, hy + 4, x + 8, hy + 4, x + 22, hy + 10);
      g.fillStyle(0xffffff, 0.85);
      g.fillCircle(x - 5, hy - 4, 2.5);
      g.fillCircle(x + 5, hy - 4, 2.5);
      break;
    }
    case 'graduation': {
      // 学士帽：方帽 + 坠穗
      g.fillStyle(color, 1);
      g.fillRect(x - 9, hy - 4, 18, 6);
      g.save();
      g.translateCanvas(x, hy - 4);
      g.rotateCanvas(0.18);
      g.fillRect(-15, -4, 30, 4);
      g.restore();
      g.lineStyle(2, 0xffd45c, 1);
      g.lineBetween(x + 12, hy - 6, x + 15, hy + 6);
      g.fillStyle(0xffd45c, 1);
      g.fillCircle(x + 15, hy + 8, 2.5);
      break;
    }
    case 'propeller': {
      // 竹蜻蜓帽：帽体 + 双叶螺旋桨
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy, 30, 18);
      g.fillRect(x - 15, hy + 2, 30, 5);
      g.fillStyle(0x9aa7b8, 1);
      g.fillRect(x - 1.5, hy - 10, 3, 8);
      g.fillStyle(0xff5a2a, 1);
      g.fillEllipse(x - 8, hy - 12, 14, 5);
      g.fillStyle(0x7fd4ff, 1);
      g.fillEllipse(x + 8, hy - 12, 14, 5);
      break;
    }
    case 'jelly': {
      // 水母冠：半透明伞盖 + 垂须
      g.fillStyle(color, 0.55);
      g.fillEllipse(x, hy - 2, 34, 22);
      g.lineStyle(2, color, 0.8);
      g.strokeEllipse(x, hy - 2, 34, 22);
      g.lineStyle(1.6, color, 0.6);
      for (let k = -2; k <= 2; k++) {
        g.beginPath();
        g.moveTo(x + k * 6, hy + 8);
        g.lineTo(x + k * 6 + 2, hy + 14);
        g.lineTo(x + k * 6 - 1, hy + 20);
        g.strokePath();
      }
      break;
    }
    case 'oni': {
      // 鬼面：红色半面 + 金色双角
      g.fillStyle(0xffd45c, 1);
      g.fillTriangle(x - 10, hy - 2, x - 16, hy - 18, x - 4, hy - 8);
      g.fillTriangle(x + 10, hy - 2, x + 16, hy - 18, x + 4, hy - 8);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 14, hy - 4, 28, 14, 5);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x - 6, hy + 2, 2.5);
      g.fillCircle(x + 6, hy + 2, 2.5);
      g.fillStyle(0x1a1a22, 1);
      g.fillTriangle(x - 8, hy + 8, x - 3, hy + 8, x - 5, hy + 5);
      g.fillTriangle(x + 8, hy + 8, x + 3, hy + 8, x + 5, hy + 5);
      break;
    }
    case 'snorkel': {
      // 潜水镜：玻璃面罩 + 呼吸管
      g.fillStyle(0x3aa0a0, 1);
      g.fillRoundedRect(x - 16, hy - 6, 32, 14, 6);
      g.fillStyle(0x9be8ff, 0.75);
      g.fillRoundedRect(x - 12, hy - 3, 11, 8, 3);
      g.fillRoundedRect(x + 1, hy - 3, 11, 8, 3);
      g.lineStyle(3.5, 0xff5a2a, 1);
      g.lineBetween(x + 16, hy + 6, x + 22, hy - 6);
      g.fillStyle(0xff5a2a, 1);
      g.fillCircle(x + 22, hy - 8, 3);
      break;
    }
    case 'thornCrown': {
      // 荆棘冠：缠绕的两圈棘刺
      g.lineStyle(3, color, 1);
      g.beginPath();
      g.arc(x, hy + 2, 15, Math.PI * 0.1, Math.PI * 0.9, false, 0);
      g.strokePath();
      for (let k = -2; k <= 2; k++) {
        g.lineStyle(2.4, color, 0.95);
        g.lineBetween(x + k * 7, hy + 4, x + k * 7 + 3, hy - 8 - (k % 2 ? 5 : 0));
      }
      break;
    }
    case 'raincloud': {
      // 雨云帽：小乌云 + 雨丝
      g.fillStyle(color, 1);
      g.fillCircle(x - 8, hy - 4, 8);
      g.fillCircle(x + 4, hy - 7, 9);
      g.fillCircle(x + 11, hy - 3, 6);
      g.fillRect(x - 14, hy - 2, 28, 5);
      g.lineStyle(1.6, 0x7fd4ff, 0.8);
      for (let k = -2; k <= 2; k++) {
        g.lineBetween(x + k * 6, hy + 5, x + k * 6 - 2, hy + 12);
      }
      break;
    }
    case 'featherCrest': {
      // 羽冠：一排竖起的羽毛
      for (let k = -2; k <= 2; k++) {
        const h = 16 + (2 - Math.abs(k)) * 5;
        g.fillStyle(k % 2 ? 0xffd45c : color, 0.95);
        g.fillEllipse(x + k * 6, hy - h * 0.5, 6, h);
      }
      g.fillStyle(0x3a2a1a, 1);
      g.fillRect(x - 14, hy + 2, 28, 5);
      break;
    }
    case 'captain': {
      // 船长帽：白色帽体 + 黑色帽檐金徽
      g.fillStyle(0xf2f2f2, 1);
      g.fillEllipse(x, hy, 34, 18);
      g.fillStyle(0x1b1b22, 1);
      g.fillRect(x - 18, hy + 2, 36, 6);
      g.fillStyle(0xffd45c, 1);
      g.fillCircle(x, hy - 2, 3.5);
      break;
    }
    case 'catEars': {
      // 猫耳：三角耳 + 内耳粉色
      g.fillStyle(color, 1);
      g.fillTriangle(x - 14, hy + 4, x - 16, hy - 14, x - 2, hy - 4);
      g.fillTriangle(x + 14, hy + 4, x + 16, hy - 14, x + 2, hy - 4);
      g.fillStyle(0xffb7d5, 1);
      g.fillTriangle(x - 12, hy, x - 13, hy - 9, x - 5, hy - 3);
      g.fillTriangle(x + 12, hy, x + 13, hy - 9, x + 5, hy - 3);
      break;
    }
    case 'dragonHelm': {
      // 龙角盔：绿盔 + 后掠龙角 + 鳞纹
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 2, 34, 22);
      g.fillStyle(0x2a7a4a, 0.6);
      for (let k = -1; k <= 1; k++) g.fillEllipse(x + k * 8, hy + 6, 6, 8);
      g.fillStyle(0xffd45c, 1);
      g.fillTriangle(x - 12, hy - 4, x - 24, hy - 14, x - 10, hy - 12);
      g.fillTriangle(x + 12, hy - 4, x + 24, hy - 14, x + 10, hy - 12);
      g.fillStyle(0xff5a2a, 0.9);
      g.fillCircle(x, hy - 2, 2.5);
      break;
    }
    // ==================== 后加的 50 款：每款一个独立造型 ====================
    case 'rabbitEars': {
      // 兔耳：两只长耳，内侧粉色
      for (const s of [-1, 1] as const) {
        g.fillStyle(color, 1);
        g.fillEllipse(x + s * 9, hy - 20, 9, 30);
        g.fillStyle(0xffb7d5, 1);
        g.fillEllipse(x + s * 9, hy - 20, 4.5, 22);
      }
      break;
    }
    case 'bearEars': {
      // 熊耳：两只圆耳 + 浅色内耳
      for (const s of [-1, 1] as const) {
        g.fillStyle(color, 1);
        g.fillCircle(x + s * 13, hy - 8, 9);
        g.fillStyle(0xf0cf9e, 1);
        g.fillCircle(x + s * 13, hy - 8, 4.5);
      }
      break;
    }
    case 'mouseEars': {
      // 鼠耳：两只大圆盘
      for (const s of [-1, 1] as const) {
        g.fillStyle(color, 1);
        g.fillCircle(x + s * 16, hy - 10, 11);
        g.fillStyle(0xffb7d5, 1);
        g.fillCircle(x + s * 16, hy - 10, 6.5);
      }
      break;
    }
    case 'sharkFin': {
      // 鲨鱼鳍：头顶背鳍 + 两侧胸鳍
      g.fillStyle(color, 1);
      g.fillTriangle(x, hy - 26, x - 9, hy + 4, x + 9, hy + 4);
      g.fillStyle(0xdfe6f0, 0.9);
      g.fillTriangle(x, hy - 20, x - 4, hy - 2, x + 4, hy - 2);
      g.fillStyle(color, 0.9);
      g.fillTriangle(x - 24, hy - 2, x - 30, hy + 8, x - 16, hy + 6);
      g.fillTriangle(x + 24, hy - 2, x + 30, hy + 8, x + 16, hy + 6);
      break;
    }
    case 'dinoHorns': {
      // 恐龙角：两根短粗后掠角
      g.fillStyle(color, 1);
      g.fillTriangle(x - 14, hy - 4, x - 26, hy - 20, x - 5, hy - 10);
      g.fillTriangle(x + 14, hy - 4, x + 26, hy - 20, x + 5, hy - 10);
      g.fillStyle(0xffffff, 0.25);
      g.fillCircle(x - 16, hy - 12, 3);
      g.fillCircle(x + 16, hy - 12, 3);
      break;
    }
    case 'unicornHorn': {
      // 独角：一根螺旋尖角
      g.fillStyle(color, 1);
      g.fillTriangle(x, hy - 34, x - 8, hy + 2, x + 8, hy + 2);
      g.lineStyle(1.6, 0xffffff, 0.7);
      for (let k = 0; k < 4; k++) {
        const yy = hy - 4 - k * 7;
        g.lineBetween(x - 5 + k, yy, x + 5 - k, yy - 3);
      }
      break;
    }
    case 'afro': {
      // 爆炸头：一坨蓬松的圆
      g.fillStyle(color, 1);
      const puffs: [number, number, number][] = [
        [0, -16, 13], [-14, -9, 10], [14, -9, 10], [-8, -22, 9], [8, -22, 9], [0, -4, 14],
      ];
      for (const [dx, dy, r] of puffs) g.fillCircle(x + dx, hy + dy, r);
      break;
    }
    case 'mohawk': {
      // 莫西干：中间一排竖刺
      for (let k = -2; k <= 2; k++) {
        const h = 22 - Math.abs(k) * 4;
        g.fillStyle(k % 2 ? 0xffd45c : color, 1);
        g.fillTriangle(x + k * 6 - 4, hy + 2, x + k * 6 + 4, hy + 2, x + k * 6, hy + 2 - h);
      }
      break;
    }
    case 'ponytail': {
      // 马尾：后脑一束 + 金色发圈
      g.fillStyle(color, 1);
      g.fillEllipse(x - 16, hy - 8, 26, 16);
      g.fillEllipse(x - 26, hy + 2, 16, 22);
      g.fillStyle(0xffd45c, 1);
      g.fillCircle(x - 18, hy - 2, 4);
      break;
    }
    case 'bun': {
      // 丸子头：顶上一个丸子 + 发圈
      g.fillStyle(color, 1);
      g.fillCircle(x, hy - 16, 12);
      g.fillStyle(0xffd45c, 1);
      g.fillEllipse(x, hy - 6, 20, 5);
      break;
    }
    case 'pigtails': {
      // 双马尾：两侧翘起的辫子
      for (const s of [-1, 1] as const) {
        g.fillStyle(color, 1);
        g.fillEllipse(x + s * 20, hy - 6, 14, 18);
        g.fillEllipse(x + s * 26, hy - 20, 10, 14);
        g.fillStyle(0xffd45c, 1);
        g.fillCircle(x + s * 17, hy - 2, 3.5);
      }
      break;
    }
    case 'braids': {
      // 麻花辫：两条三节辫子垂在肩前
      for (const s of [-1, 1] as const) {
        for (let k = 0; k < 3; k++) {
          g.fillStyle(color, 1);
          g.fillCircle(x + s * 15, hy + 6 + k * 9, 7 - k);
        }
        g.fillStyle(0xff5a4d, 1);
        g.fillCircle(x + s * 15, hy + 32, 2.5);
      }
      break;
    }
    case 'spikyHair': {
      // 刺猬头：一圈外放的尖刺
      for (let k = -3; k <= 3; k++) {
        g.fillStyle(color, 1);
        g.fillTriangle(
          x + k * 6 - 4, hy + 2,
          x + k * 6 + 4, hy + 2,
          x + k * 7, hy - 22 + Math.abs(k) * 4,
        );
      }
      break;
    }
    case 'longHair': {
      // 长发：两侧披到肩下
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 20, hy - 10, 40, 22, 10);
      g.fillRoundedRect(x - 26, hy - 4, 14, 44, 7);
      g.fillRoundedRect(x + 12, hy - 4, 14, 44, 7);
      break;
    }
    case 'curlyHair': {
      // 卷发：一圈小卷
      g.fillStyle(color, 1);
      for (let k = 0; k < 7; k++) {
        const a = Math.PI + (k / 6) * Math.PI;
        g.fillCircle(x + Math.cos(a) * 17, hy - 4 + Math.sin(a) * 12, 7.5);
      }
      break;
    }
    case 'bobHair': {
      // 波波头：齐耳短发
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 20, hy - 12, 40, 30, 12);
      g.fillStyle(0xffffff, 0.16);
      g.fillEllipse(x, hy - 8, 30, 10);
      break;
    }
    case 'buzzCut': {
      // 平头：贴头皮的极短一层
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy - 3, 36, 16);
      g.fillRect(x - 18, hy - 4, 36, 8);
      break;
    }
    case 'antenna': {
      // 外星天线：两根细杆 + 顶球
      g.lineStyle(2.5, color, 1);
      g.lineBetween(x - 8, hy, x - 13, hy - 20);
      g.lineBetween(x + 8, hy, x + 13, hy - 20);
      g.fillStyle(0xff5a4d, 1);
      g.fillCircle(x - 13, hy - 22, 4);
      g.fillStyle(0x7fd4ff, 1);
      g.fillCircle(x + 13, hy - 22, 4);
      break;
    }
    case 'cowboy': {
      // 牛仔帽：上翘宽檐 + 高帽筒 + 帽带
      g.fillStyle(color, 1);
      g.beginPath();
      g.moveTo(x - 30, hy + 6);
      g.lineTo(x - 22, hy - 2);
      g.lineTo(x + 22, hy - 2);
      g.lineTo(x + 30, hy + 6);
      g.lineTo(x + 18, hy + 4);
      g.lineTo(x - 18, hy + 4);
      g.closePath();
      g.fillPath();
      g.fillRoundedRect(x - 13, hy - 18, 26, 18, 5);
      g.fillStyle(0x6f4620, 1);
      g.fillRect(x - 14, hy - 4, 28, 4);
      g.fillStyle(0xffd45c, 1);
      g.fillCircle(x, hy - 4, 2.5);
      break;
    }
    case 'bowler': {
      // 圆顶硬礼帽：小圆顶 + 卷边 + 缎带
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 4, 40, 10);
      g.fillEllipse(x, hy - 8, 26, 20);
      g.fillStyle(0xd42a3a, 1);
      g.fillRect(x - 13, hy - 6, 26, 4);
      break;
    }
    case 'newsboy': {
      // 报童帽：八角帽 + 短檐 + 顶扣
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy - 4, 34, 20);
      g.fillEllipse(x + 2, hy + 2, 36, 10);
      g.fillTriangle(x + 14, hy - 2, x + 24, hy + 4, x + 10, hy + 4);
      g.fillStyle(0x1a1a22, 1);
      g.fillCircle(x, hy - 14, 3);
      break;
    }
    case 'turban': {
      // 头巾：缠绕的布条 + 宝石
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy - 6, 38, 24);
      g.lineStyle(2, 0xb8a88a, 0.9);
      for (let k = -1; k <= 1; k++) {
        g.beginPath();
        g.arc(x, hy - 6 + k * 6, 17 - Math.abs(k) * 2, Math.PI * 1.1, Math.PI * 1.9, false, 0);
        g.strokePath();
      }
      g.fillStyle(0xff5a4d, 1);
      g.fillCircle(x, hy - 14, 4);
      break;
    }
    case 'wreath': {
      // 花环：一圈绿叶 + 三朵小花
      g.fillStyle(color, 1);
      for (let k = 0; k < 9; k++) {
        const a = Math.PI + (k / 8) * Math.PI;
        g.fillEllipse(x + Math.cos(a) * 18, hy - 3 + Math.sin(a) * 12, 9, 6);
      }
      for (const dx of [-14, 0, 14]) {
        g.fillStyle(0xffb7d5, 1);
        g.fillCircle(x + dx, hy - 12 + Math.abs(dx) * 0.2, 4.5);
        g.fillStyle(0xfff0a0, 1);
        g.fillCircle(x + dx, hy - 12 + Math.abs(dx) * 0.2, 2);
      }
      break;
    }
    case 'bamboo': {
      // 竹笠：锥形 + 编织段
      g.fillStyle(color, 1);
      g.beginPath();
      g.moveTo(x, hy - 22);
      g.lineTo(x - 30, hy + 6);
      g.lineTo(x + 30, hy + 6);
      g.closePath();
      g.fillPath();
      g.lineStyle(1.5, 0x8a6a3a, 0.7);
      for (let k = 1; k <= 3; k++) {
        const w = 30 * (k / 4);
        const yy = hy + 6 - 22 * (1 - k / 4);
        g.lineBetween(x - w, yy, x + w, yy);
      }
      break;
    }
    case 'conical': {
      // 斗笠：宽大斗笠 + 系带
      g.fillStyle(color, 1);
      g.fillTriangle(x, hy - 18, x - 34, hy + 8, x + 34, hy + 8);
      g.fillStyle(0xb09868, 1);
      g.fillTriangle(x, hy - 18, x - 34, hy + 8, x - 10, hy + 8);
      g.lineStyle(1.5, 0x8a6a3a, 0.6);
      g.lineBetween(x - 20, hy - 2, x + 20, hy - 2);
      break;
    }
    case 'veil': {
      // 面纱：半透明垂纱遮住下半脸
      g.fillStyle(color, 0.6);
      g.fillRoundedRect(x - 18, hy - 8, 36, 22, 8);
      g.lineStyle(1.5, 0xffffff, 0.5);
      for (let k = -2; k <= 2; k++) g.lineBetween(x + k * 7, hy + 2, x + k * 7, hy + 12);
      break;
    }
    case 'brideVeil': {
      // 婚纱头纱：脑后的长纱 + 花饰
      g.fillStyle(color, 0.75);
      g.beginPath();
      g.moveTo(x - 18, hy - 6);
      g.lineTo(x - 26, hy + 34);
      g.lineTo(x + 26, hy + 34);
      g.lineTo(x + 18, hy - 6);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xffb7d5, 1);
      g.fillCircle(x, hy - 10, 4);
      g.fillCircle(x - 8, hy - 7, 3);
      g.fillCircle(x + 8, hy - 7, 3);
      break;
    }
    case 'headband': {
      // 运动发带：额前一圈 + 侧边飘带
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 17, hy - 2, 34, 8, 3);
      g.fillStyle(0xffffff, 0.85);
      g.fillRect(x - 17, hy, 34, 2);
      g.fillStyle(color, 1);
      g.fillTriangle(x - 16, hy, x - 30, hy + 12, x - 14, hy + 8);
      break;
    }
    case 'hood': {
      // 兜帽：罩住头顶的尖帽 + 内里阴影
      g.fillStyle(color, 1);
      g.beginPath();
      g.arc(x, hy + 4, 20, Math.PI, Math.PI * 2, false, 0);
      g.lineTo(x + 20, hy + 12);
      g.lineTo(x - 20, hy + 12);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x2a3442, 0.5);
      g.fillEllipse(x, hy + 2, 26, 14);
      break;
    }
    case 'knightHelm': {
      // 骑士盔：全罩盔 + 面甲缝 + 红缨
      g.fillStyle(color, 1);
      g.fillCircle(x, hy + 2, 18);
      g.fillStyle(0x7a8698, 1);
      g.fillRoundedRect(x - 15, hy - 2, 30, 10, 3);
      g.fillStyle(0x1a1a22, 1);
      g.fillRect(x - 12, hy + 1, 24, 3);
      g.fillStyle(0xff5a4d, 1);
      g.fillEllipse(x, hy - 16, 7, 14);
      break;
    }
    case 'armyHelm': {
      // 军盔：锅盖盔 + 伪装带 + 护耳
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 2, 38, 22);
      g.fillRect(x - 19, hy + 2, 38, 5);
      g.fillStyle(0x4a5a2a, 0.8);
      g.fillRect(x - 19, hy - 2, 38, 3);
      g.fillStyle(color, 1);
      g.fillTriangle(x - 19, hy + 6, x - 26, hy + 12, x - 14, hy + 8);
      g.fillTriangle(x + 19, hy + 6, x + 26, hy + 12, x + 14, hy + 8);
      break;
    }
    case 'fireHelm': {
      // 消防盔：红盔 + 前檐 + 金色徽章
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy, 34, 20);
      g.fillRect(x - 17, hy + 2, 34, 5);
      g.fillStyle(0xffd45c, 1);
      g.fillEllipse(x, hy - 4, 12, 8);
      g.fillStyle(0xd42a3a, 1);
      g.fillCircle(x, hy - 4, 2.5);
      break;
    }
    case 'kabukiMask': {
      // 歌舞伎面具：白面 + 红纹 + 黑眉
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 4, 32, 26);
      g.fillStyle(0xd42a3a, 1);
      g.fillTriangle(x - 14, hy + 2, x - 6, hy - 2, x - 6, hy + 8);
      g.fillTriangle(x + 14, hy + 2, x + 6, hy - 2, x + 6, hy + 8);
      g.fillStyle(0x1a1a22, 1);
      g.fillRect(x - 11, hy - 3, 8, 2.5);
      g.fillRect(x + 3, hy - 3, 8, 2.5);
      g.fillEllipse(x - 7, hy + 4, 4, 3);
      g.fillEllipse(x + 7, hy + 4, 4, 3);
      break;
    }
    case 'eyepatch': {
      // 眼罩：斜跨的皮眼罩 + 绑带
      g.lineStyle(2.5, color, 0.9);
      g.lineBetween(x - 20, hy - 6, x + 20, hy - 2);
      g.fillStyle(color, 1);
      g.fillEllipse(x - 7, hy - 3, 15, 12);
      break;
    }
    case 'monocle': {
      // 单片眼镜：一只圆镜片 + 垂链
      g.fillStyle(0x9be8ff, 0.3);
      g.fillCircle(x + 8, hy - 2, 7);
      g.lineStyle(2.5, color, 1);
      g.strokeCircle(x + 8, hy - 2, 8);
      g.lineStyle(1.5, color, 0.8);
      g.lineBetween(x + 14, hy + 4, x + 18, hy + 18);
      break;
    }
    case 'sailorHat': {
      // 水手帽：白色圆帽 + 蓝帽檐 + 蓝绒球
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy - 2, 32, 18);
      g.fillStyle(0x2a5fbf, 1);
      g.fillRect(x - 16, hy + 2, 32, 5);
      g.fillCircle(x, hy - 12, 4);
      break;
    }
    case 'gasMask': {
      // 防毒面具：面罩 + 双滤罐
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 16, hy - 6, 32, 18, 7);
      g.fillStyle(0x8a9a8a, 1);
      g.fillCircle(x - 11, hy + 10, 5.5);
      g.fillCircle(x + 11, hy + 10, 5.5);
      g.fillStyle(0x1a2a1a, 0.8);
      g.fillRoundedRect(x - 13, hy - 3, 11, 6, 3);
      g.fillRoundedRect(x + 2, hy - 3, 11, 6, 3);
      break;
    }
    case 'skullMask': {
      // 骷髅面：白头骨 + 黑眼窝 + 牙
      g.fillStyle(color, 1);
      g.fillCircle(x, hy + 4, 16);
      g.fillRect(x - 11, hy + 10, 22, 10);
      g.fillStyle(0x1a1a22, 1);
      g.fillEllipse(x - 6, hy + 1, 8, 9);
      g.fillEllipse(x + 6, hy + 1, 8, 9);
      g.fillTriangle(x, hy + 8, x - 3, hy + 12, x + 3, hy + 12);
      g.fillRect(x - 4, hy + 14, 2, 6);
      g.fillRect(x + 2, hy + 14, 2, 6);
      break;
    }
    case 'ghostHat': {
      // 幽灵帽：半透明飘浮的幽灵头
      g.fillStyle(color, 0.72);
      g.fillCircle(x, hy - 2, 17);
      g.fillRect(x - 17, hy - 2, 34, 14);
      for (let k = 0; k < 4; k++) {
        g.fillTriangle(
          x - 17 + k * 9, hy + 12,
          x - 8 + k * 9, hy + 12,
          x - 12.5 + k * 9, hy + 20,
        );
      }
      g.fillStyle(0x2a3442, 0.75);
      g.fillCircle(x - 6, hy - 4, 3);
      g.fillCircle(x + 6, hy - 4, 3);
      break;
    }
    case 'pumpkin': {
      // 南瓜头：橙色南瓜 + 瓜瓣 + 绿蒂 + 鬼脸
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy - 2, 40, 30);
      g.fillStyle(0xd96a10, 1);
      for (let k = -1; k <= 1; k++) g.fillEllipse(x + k * 11, hy - 2, 6, 28);
      g.fillStyle(0x2f7a3a, 1);
      g.fillRect(x - 2, hy - 20, 4, 8);
      g.fillStyle(0x1a0a00, 1);
      g.fillTriangle(x - 10, hy - 6, x - 4, hy - 6, x - 7, hy - 1);
      g.fillTriangle(x + 10, hy - 6, x + 4, hy - 6, x + 7, hy - 1);
      g.fillTriangle(x - 8, hy + 6, x + 8, hy + 6, x, hy + 1);
      break;
    }
    case 'iceCream': {
      // 冰淇淋：蛋筒 + 双球 + 樱桃
      g.fillStyle(0xd9a05a, 1);
      g.fillTriangle(x - 12, hy + 12, x + 12, hy + 12, x, hy - 2);
      g.fillStyle(color, 1);
      g.fillCircle(x, hy - 6, 9);
      g.fillStyle(0xf0e0c0, 1);
      g.fillCircle(x, hy - 15, 8.5);
      g.fillStyle(0xd42a3a, 1);
      g.fillCircle(x, hy - 24, 3);
      break;
    }
    case 'cupcake': {
      // 纸杯蛋糕：纸杯 + 两团奶油 + 樱桃
      g.fillStyle(0xd9a05a, 1);
      g.fillTriangle(x - 14, hy + 12, x + 14, hy + 12, x + 9, hy - 2);
      g.fillTriangle(x - 14, hy + 12, x - 9, hy - 2, x + 9, hy - 2);
      g.fillStyle(color, 1);
      g.fillEllipse(x - 7, hy - 6, 14, 12);
      g.fillEllipse(x + 7, hy - 6, 14, 12);
      g.fillEllipse(x, hy - 12, 16, 12);
      g.fillStyle(0xd42a3a, 1);
      g.fillCircle(x, hy - 20, 3);
      break;
    }
    case 'burger': {
      // 汉堡帽：面包 + 生菜 + 肉饼 + 芝麻
      g.fillStyle(0xe0a860, 1);
      g.fillEllipse(x, hy - 10, 38, 20);
      g.fillStyle(0x7ed957, 1);
      g.fillEllipse(x, hy - 1, 42, 8);
      g.fillStyle(0x8b4a2a, 1);
      g.fillRoundedRect(x - 19, hy + 1, 38, 8, 3);
      g.fillStyle(0xe0a860, 1);
      g.fillRoundedRect(x - 20, hy + 8, 40, 7, 3);
      g.fillStyle(0xfff4dc, 1);
      for (const dx of [-9, 0, 9]) g.fillCircle(x + dx, hy - 14, 2);
      break;
    }
    case 'watermelon': {
      // 西瓜帽：绿皮 + 白瓤 + 红瓤 + 籽
      g.fillStyle(color, 1);
      g.beginPath();
      g.arc(x, hy + 6, 24, Math.PI, Math.PI * 2, false, 0);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xf2f6fa, 1);
      g.beginPath();
      g.arc(x, hy + 6, 20, Math.PI, Math.PI * 2, false, 0);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xff5a6a, 1);
      g.beginPath();
      g.arc(x, hy + 6, 16, Math.PI, Math.PI * 2, false, 0);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x1a1a22, 1);
      for (const [dx, dy] of [[-7, -6], [5, -9], [2, -2], [10, -3], [-3, -12]] as const) {
        g.fillEllipse(x + dx, hy + 6 + dy, 2.4, 3.4);
      }
      break;
    }
    case 'screw': {
      // 螺丝钉：六角螺帽 + 螺纹
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 16, hy - 4, 32, 14, 4);
      g.lineStyle(2, 0x5a6472, 0.9);
      for (let k = 0; k < 3; k++) g.lineBetween(x - 14, hy + k * 4, x + 14, hy - 1 + k * 4);
      g.fillStyle(0x5a6472, 1);
      g.fillCircle(x, hy - 10, 9);
      g.fillStyle(0xdfe6f0, 1);
      g.fillCircle(x, hy - 10, 4);
      break;
    }
    case 'gear': {
      // 齿轮：八轮齿 + 轴心
      g.fillStyle(color, 1);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        g.fillRect(x + Math.cos(a) * 16 - 4, hy - 2 + Math.sin(a) * 16 - 4, 8, 8);
      }
      g.fillCircle(x, hy - 2, 15);
      g.fillStyle(0x5a4a2a, 1);
      g.fillCircle(x, hy - 2, 6);
      break;
    }
    case 'minerLamp': {
      // 矿工灯：黄色安全帽 + 前灯
      g.fillStyle(0xffb03a, 1);
      g.fillEllipse(x, hy + 2, 34, 20);
      g.fillStyle(0xd98a20, 1);
      g.fillRect(x - 17, hy + 2, 34, 5);
      g.fillStyle(0xfff0b0, 1);
      g.fillCircle(x, hy - 4, 6);
      g.fillStyle(0x6a5a3a, 1);
      g.fillRect(x - 3, hy - 2, 6, 4);
      break;
    }
    case 'candle': {
      // 蜡烛：白蜡烛 + 跳动的火苗
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 7, hy - 10, 14, 18, 4);
      g.fillStyle(0x9aa7b8, 1);
      g.fillRect(x - 1.5, hy - 14, 3, 5);
      g.fillStyle(0xffb03a, 0.95);
      g.fillEllipse(x, hy - 20, 9, 14);
      g.fillStyle(0xfff0b0, 1);
      g.fillEllipse(x, hy - 20, 4.5, 8);
      break;
    }
    case 'starCrown': {
      // 星星冠：三颗五角星串成的冠
      const star = (cx: number, cy: number, r: number): void => {
        g.fillStyle(color, 1);
        for (let k = 0; k < 5; k++) {
          const a = -Math.PI / 2 + (k / 5) * Math.PI * 2;
          g.fillTriangle(
            cx + Math.cos(a - 0.35) * r * 0.5, cy + Math.sin(a - 0.35) * r * 0.5,
            cx + Math.cos(a + 0.35) * r * 0.5, cy + Math.sin(a + 0.35) * r * 0.5,
            cx + Math.cos(a) * r, cy + Math.sin(a) * r,
          );
        }
        g.fillCircle(cx, cy, r * 0.45);
      };
      star(x, hy - 16, 13);
      star(x - 15, hy - 7, 8);
      star(x + 15, hy - 7, 8);
      break;
    }
    case 'moonCrown': {
      // 月牙冠：一道粗弯月 + 两颗小星
      g.lineStyle(8, color, 1);
      g.beginPath();
      g.arc(x, hy - 8, 13, Math.PI * 0.35, Math.PI * 1.15, false, 0);
      g.strokePath();
      g.fillStyle(0xfff0b0, 1);
      g.fillCircle(x + 14, hy - 20, 2.5);
      g.fillCircle(x - 12, hy - 22, 2);
      break;
    }
    // ==== 第三批 50 款：每款独立造型，多数带一个 `now` 驱动的小动态 ==============
    // 坐标约定：`x` 是角色中心，`hy` 是帽子锚点（头顶再往上一点）。

    // ---- 吃喝 ----
    case 'teapot': {
      // 茶壶帽：壶身 + 壶嘴 + 提手，壶嘴一直在冒热气
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 16, hy - 12, 32, 22, 7);
      g.fillRoundedRect(x - 9, hy - 18, 18, 8, 3);
      g.fillCircle(x, hy - 19, 4);
      g.fillTriangle(x - 16, hy - 8, x - 30, hy - 15, x - 16, hy + 2);
      g.lineStyle(3, color, 1);
      g.beginPath();
      g.arc(x + 22, hy - 2, 8, Math.PI * 0.7, Math.PI * 1.6, false, 0);
      g.strokePath();
      const steam = (now / 900) % 1;
      for (let k = 0; k < 3; k++) {
        const t = (steam + k / 3) % 1;
        g.fillStyle(0xffffff, 0.5 * (1 - t));
        g.fillCircle(x - 24 - t * 6, hy - 14 - t * 20, 3.4 - t * 1.6);
      }
      break;
    }
    case 'ramen': {
      // 拉面碗：碗里两根会起伏的面 + 斜插的筷子 + 热气
      g.fillStyle(0xe8e0d0, 1);
      g.fillRoundedRect(x - 22, hy - 6, 44, 20, 8);
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy - 6, 44, 12);
      g.fillStyle(0xfff0c0, 1);
      g.fillEllipse(x, hy - 8, 34, 8);
      g.lineStyle(2.4, 0xf2d48a, 1);
      for (let k = 0; k < 2; k++) {
        const yy = hy - 12 - k * 4;
        g.beginPath();
        for (let s = 0; s <= 4; s++) {
          const px = x - 14 + s * 7;
          const py = yy + Math.sin(now / 260 + s) * 2;
          if (s === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.strokePath();
      }
      g.lineStyle(2.6, 0x8a6238, 1);
      g.lineBetween(x + 6, hy - 4, x + 20, hy - 30);
      g.lineBetween(x + 11, hy - 4, x + 25, hy - 30);
      const t = (now / 900) % 1;
      g.fillStyle(0xffffff, 0.5 * (1 - t));
      g.fillCircle(x - 4 + Math.sin(now / 400) * 4, hy - 14 - t * 20, 4 - t * 2);
      break;
    }
    case 'teacup': {
      // 茶杯帽：碟子 + 杯子 + 一缕热气
      g.fillStyle(0xf2f2f2, 1);
      g.fillEllipse(x, hy + 10, 44, 10);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 15, hy - 10, 30, 20, 5);
      g.fillStyle(0xfff0d0, 1);
      g.fillEllipse(x, hy - 9, 28, 7);
      g.lineStyle(3, color, 1);
      g.beginPath();
      g.arc(x + 19, hy - 2, 6, Math.PI * 0.7, Math.PI * 1.6, false, 0);
      g.strokePath();
      const t = (now / 1100) % 1;
      g.fillStyle(0xffffff, 0.55 * (1 - t));
      g.fillCircle(x + Math.sin(now / 380) * 5, hy - 14 - t * 18, 3.6 - t * 1.8);
      break;
    }
    case 'boba': {
      // 珍珠奶茶：杯 + 吸管，杯底的珍珠跟着晃
      const wob = Math.sin(now / 220) * 1.6;
      g.fillStyle(0xd8c8b0, 0.9);
      g.fillRoundedRect(x - 15, hy - 16, 30, 34, 6);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 12, hy - 6, 24, 22, 5);
      g.fillStyle(0xf2ead8, 1);
      g.fillRoundedRect(x - 16, hy - 20, 32, 6, 3);
      g.fillStyle(0xff8ad4, 1);
      g.fillRoundedRect(x + 4, hy - 34, 6, 18, 3);
      g.fillStyle(0x3a2a1c, 1);
      for (let k = 0; k < 3; k++) g.fillCircle(x - 6 + k * 6 + wob * (k - 1), hy + 11, 3);
      break;
    }
    case 'popcorn': {
      // 爆米花桶：红白条桶，顶上偶尔蹦起一颗玉米花
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 17, hy - 6, 34, 26, 4);
      g.fillStyle(0xe8404a, 0.85);
      for (let k = -1; k <= 1; k++) g.fillRect(x + k * 11 - 2, hy - 6, 4, 26);
      g.fillStyle(0xfff6e0, 1);
      g.fillCircle(x - 10, hy - 10, 6);
      g.fillCircle(x, hy - 14, 7);
      g.fillCircle(x + 10, hy - 10, 6);
      const t = (now / 700) % 1;
      if (t < 0.6) {
        g.fillCircle(x + 4, hy - 20 - Math.sin((t / 0.6) * Math.PI) * 14, 5.4);
      }
      break;
    }
    case 'pizza': {
      // 披萨帽：一片三角披萨，尖端那坨芝士往下拉丝
      g.fillStyle(color, 1);
      g.fillTriangle(x - 20, hy - 6, x + 20, hy - 6, x, hy + 18);
      g.fillStyle(0xf2c85c, 1);
      g.fillTriangle(x - 15, hy - 4, x + 15, hy - 4, x, hy + 13);
      g.fillStyle(0xd8382a, 1);
      g.fillCircle(x - 7, hy, 4);
      g.fillCircle(x + 8, hy + 1, 3.6);
      g.fillCircle(x, hy + 8, 3.2);
      g.fillStyle(0xfff0c0, 0.95);
      const drip = 6 + Math.sin(now / 500) * 4;
      g.fillTriangle(x - 3, hy + 12, x + 3, hy + 12, x, hy + 12 + drip);
      break;
    }
    case 'donut': {
      // 甜甜圈：糖霜 + 一圈慢慢游走的彩针
      g.fillStyle(0xd8a36a, 1);
      g.fillCircle(x, hy, 20);
      g.fillStyle(color, 1);
      g.fillCircle(x, hy, 17);
      g.fillStyle(0xf2b8c8, 1);
      g.fillCircle(x, hy - 1, 15);
      g.fillStyle(0xf2ead8, 1);
      g.fillCircle(x, hy, 6);
      const w = now / 700;
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + w;
        g.fillStyle(k % 2 ? 0x6fe3ff : 0xfff06a, 1);
        g.fillRect(x + Math.cos(a) * 11 - 2, hy + Math.sin(a) * 11, 4, 2.4);
      }
      break;
    }
    case 'sushi': {
      // 寿司帽：饭团 + 三文鱼片 + 海苔带，整体轻轻上下
      const bob = Math.sin(now / 400) * 1.2;
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 19, hy - 8 + bob, 38, 20, 6);
      g.fillStyle(0xe8703a, 1);
      g.fillRoundedRect(x - 21, hy - 12 + bob, 42, 8, 4);
      g.fillStyle(0xf2f0e0, 0.9);
      for (let k = -1; k <= 1; k++) g.fillRect(x + k * 11 - 1, hy - 12 + bob, 3, 8);
      g.fillStyle(0x2f4a2a, 1);
      g.fillRect(x - 6, hy - 10 + bob, 12, 22);
      break;
    }
    case 'taco': {
      // 墨西哥卷：外壳小幅开合，露出里面的生菜与番茄
      const open = 0.5 + Math.sin(now / 600) * 0.5;
      g.fillStyle(0xf2c85c, 1);
      g.fillEllipse(x, hy + 4, 44, 26);
      g.save();
      g.translateCanvas(x, hy + 12);
      g.rotateCanvas(-0.16 - open * 0.14);
      g.fillStyle(color, 1);
      g.fillEllipse(0, 0, 46, 18);
      g.restore();
      g.fillStyle(0x4fae4a, 1);
      g.fillCircle(x - 8, hy - 2, 5);
      g.fillCircle(x + 6, hy - 4, 4.4);
      g.fillStyle(0xd8382a, 1);
      g.fillCircle(x, hy - 1, 3.6);
      g.fillStyle(0xf2c85c, 1);
      g.fillCircle(x + 13, hy + 1, 3.4);
      break;
    }
    case 'cake': {
      // 蛋糕帽：两层奶油蛋糕，蜡烛的火苗左右摇
      g.fillStyle(0xf2d8b0, 1);
      g.fillRoundedRect(x - 22, hy - 2, 44, 16, 4);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 18, hy - 12, 36, 12, 4);
      g.fillStyle(0xfff6e0, 1);
      g.fillRoundedRect(x - 18, hy - 6, 36, 3, 1.5);
      g.fillStyle(0x6fe3ff, 1);
      g.fillRect(x - 2.5, hy - 24, 5, 13);
      const fl = Math.sin(now / 140) * 2;
      g.fillStyle(0xffd45c, 1);
      g.fillEllipse(x + fl, hy - 28, 6, 9);
      g.fillStyle(0xff8a3c, 1);
      g.fillEllipse(x + fl, hy - 27, 3, 5);
      break;
    }
    case 'lollipop': {
      // 棒棒糖：糖球上的螺旋一直在转
      g.fillStyle(0xd8c8b0, 1);
      g.fillRect(x - 2.5, hy - 2, 5, 22);
      g.fillStyle(0xfff6e0, 1);
      g.fillCircle(x, hy - 12, 17);
      g.lineStyle(4, color, 1);
      g.beginPath();
      for (let s = 0; s <= 26; s++) {
        const u = s / 26;
        const a = now / 420 + u * Math.PI * 3.4;
        const r = 2 + u * 13;
        const px = x + Math.cos(a) * r;
        const py = hy - 12 + Math.sin(a) * r;
        if (s === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.strokePath();
      break;
    }
    case 'candyCane': {
      // 拐杖糖：白拐杖，红条纹一圈圈往上走
      g.lineStyle(9, 0xfff6e8, 1);
      g.beginPath();
      g.moveTo(x, hy + 18);
      g.lineTo(x, hy - 10);
      g.arc(x + 9, hy - 10, 9, Math.PI, Math.PI * 1.85, false, 0);
      g.strokePath();
      g.lineStyle(4, color, 0.95);
      const off = (now / 90) % 12;
      for (let k = 0; k < 4; k++) {
        const yy = hy + 16 - k * 12 - off;
        if (yy > hy - 12) g.lineBetween(x - 4.5, yy, x + 4.5, yy - 3);
      }
      g.beginPath();
      g.arc(x + 9, hy - 10, 9, Math.PI * 1.05, Math.PI * 1.42, false, 0);
      g.strokePath();
      break;
    }

    // ---- 花草果蔬 ----
    case 'sunflower': {
      // 向日葵：一圈花瓣慢慢转，中间的花心带点籽
      const a0 = now / 1700;
      for (let k = 0; k < 10; k++) {
        const a = a0 + (k / 10) * Math.PI * 2;
        g.fillStyle(k % 2 ? color : 0xffc02a, 1);
        g.fillCircle(x + Math.cos(a) * 16, hy - 6 + Math.sin(a) * 16, 6);
      }
      g.fillStyle(0x6b4a26, 1);
      g.fillCircle(x, hy - 6, 11);
      g.fillStyle(0x4a3218, 0.6);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        g.fillCircle(x + Math.cos(a) * 5, hy - 6 + Math.sin(a) * 5, 1.8);
      }
      break;
    }
    case 'lotus': {
      // 莲花：花瓣一开一合，中间一颗金蕊
      const open = 0.5 + Math.sin(now / 900) * 0.5;
      for (let k = -2; k <= 2; k++) {
        g.save();
        g.translateCanvas(x, hy + 8);
        g.rotateCanvas(k * 0.42 * (0.6 + open * 0.7));
        g.fillStyle(k === 0 ? 0xffffff : color, 0.95);
        g.fillEllipse(0, -16, 11, 22);
        g.restore();
      }
      g.fillStyle(0xffe08a, 1);
      g.fillCircle(x, hy + 2, 5);
      break;
    }
    case 'leafCrown': {
      // 树叶冠：藤圈上一排叶子，按顺序轻轻摇
      g.lineStyle(4, 0x6b4a26, 1);
      g.beginPath();
      g.arc(x, hy + 2, 17, Math.PI * 1.08, Math.PI * 1.92, false, 0);
      g.strokePath();
      for (let k = 0; k < 6; k++) {
        const a = Math.PI * 1.08 + (k / 5) * Math.PI * 0.84;
        g.save();
        g.translateCanvas(x + Math.cos(a) * 17, hy + 2 + Math.sin(a) * 17);
        g.rotateCanvas(a + Math.PI / 2 + Math.sin(now / 300 + k) * 0.16);
        g.fillStyle(k % 2 ? color : 0x4fa860, 1);
        g.fillEllipse(0, -9, 9, 17);
        g.restore();
      }
      break;
    }
    case 'clover': {
      // 四叶草：四片心形叶，整株会晃
      g.save();
      g.translateCanvas(x, hy - 2);
      g.rotateCanvas(Math.sin(now / 520) * 0.12);
      g.lineStyle(3, 0x3a7a3a, 1);
      g.lineBetween(0, 6, 0, 20);
      g.fillStyle(color, 1);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        g.fillCircle(Math.cos(a) * 8, Math.sin(a) * 8 - 2, 8);
      }
      g.restore();
      break;
    }
    case 'sprout': {
      // 嫩芽帽：两片叶子一开一合地长
      const grow = 0.6 + Math.sin(now / 800) * 0.4;
      g.lineStyle(4, 0x6fae4f, 1);
      g.lineBetween(x, hy + 16, x, hy - 2 - grow * 4);
      for (const s of [-1, 1]) {
        g.save();
        g.translateCanvas(x, hy - 2 - grow * 4);
        g.rotateCanvas(s * (0.5 + grow * 0.45));
        g.fillStyle(s > 0 ? color : 0x4fae4a, 1);
        g.fillEllipse(s * 7, -4, 16, 9);
        g.restore();
      }
      break;
    }
    case 'cactusHat': {
      // 仙人掌帽：小柱 + 两只手臂，整体左右轻摆
      const wob = Math.sin(now / 700) * 1.6;
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 11 + wob, hy - 16, 22, 32, 9);
      g.fillRoundedRect(x - 22 + wob, hy - 8, 12, 8, 4);
      g.fillRoundedRect(x - 22 + wob, hy - 16, 8, 14, 4);
      g.fillRoundedRect(x + 10 + wob, hy - 2, 12, 8, 4);
      g.fillRoundedRect(x + 14 + wob, hy - 12, 8, 14, 4);
      g.fillStyle(0xff8ac0, 1);
      g.fillCircle(x + wob, hy - 20, 5.4);
      break;
    }
    case 'acorn': {
      // 橡果帽：果壳 + 会点头的柄
      g.save();
      g.translateCanvas(x, hy + 2);
      g.rotateCanvas(Math.sin(now / 600) * 0.14);
      g.fillStyle(0xe8c48a, 1);
      g.fillCircle(0, 6, 16);
      g.fillStyle(color, 1);
      g.fillRoundedRect(-17, -10, 34, 14, 6);
      g.fillStyle(0x8a6238, 1);
      g.fillRoundedRect(-2, -18, 4, 10, 2);
      g.restore();
      break;
    }
    case 'strawberry': {
      // 草莓帽：果身 + 一排排籽 + 顶上的萼叶
      g.fillStyle(color, 1);
      g.beginPath();
      g.moveTo(x - 17, hy - 8);
      g.lineTo(x + 17, hy - 8);
      g.lineTo(x, hy + 20);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xfff0c0, 1);
      for (let r = 0; r < 3; r++) {
        for (let k = -1; k <= 1; k++) {
          g.fillEllipse(x + k * 9 - r * 1.5, hy - 2 + r * 8, 3, 4.4);
        }
      }
      g.fillStyle(0x4fae4a, 1);
      for (let k = -1; k <= 1; k++) g.fillEllipse(x + k * 9, hy - 12, 10, 7);
      break;
    }
    case 'cherry': {
      // 樱桃枝：两颗樱桃吊在柄上，像钟摆一样荡
      g.save();
      g.translateCanvas(x, hy - 14);
      g.rotateCanvas(Math.sin(now / 620) * 0.22);
      g.lineStyle(3, 0x4f8a3a, 1);
      g.lineBetween(0, 0, -10, 14);
      g.lineBetween(0, 0, 10, 16);
      g.fillStyle(color, 1);
      g.fillCircle(-11, 17, 7.4);
      g.fillCircle(11, 19, 7.4);
      g.fillStyle(0xffffff, 0.5);
      g.fillCircle(-13, 15, 2.2);
      g.fillCircle(9, 17, 2.2);
      g.fillStyle(0x4fae4a, 1);
      g.fillEllipse(0, -3, 14, 6);
      g.restore();
      break;
    }
    case 'pineapple': {
      // 菠萝头：菱格果身 + 一撮会摇的叶冠
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 2, 34, 40);
      g.lineStyle(1.6, 0xb08a2a, 0.75);
      for (let k = -2; k <= 2; k++) {
        g.lineBetween(x + k * 7, hy - 16, x + k * 7 + 10, hy + 18);
        g.lineBetween(x + k * 7, hy - 16, x + k * 7 - 10, hy + 18);
      }
      g.save();
      g.translateCanvas(x, hy - 16);
      g.rotateCanvas(Math.sin(now / 560) * 0.1);
      for (let k = -2; k <= 2; k++) {
        g.save();
        g.rotateCanvas(k * 0.34);
        g.fillStyle(k % 2 ? 0x4fae4a : 0x3f8a3a, 1);
        g.fillTriangle(-4, 0, 4, 0, 0, -17);
        g.restore();
      }
      g.restore();
      break;
    }

    // ---- 小动物 ----
    case 'bee': {
      // 小蜜蜂：沿着椭圆轨道绕头飞，翅膀一直在抖
      const a = now / 420;
      const bx = x + Math.cos(a) * 26;
      const by = hy - 16 + Math.sin(a) * 9;
      g.fillStyle(0xfff6c0, 0.3);
      g.fillCircle(bx, by, 5 + Math.sin(now / 60) * 1);
      g.fillStyle(color, 1);
      g.fillEllipse(bx, by, 13, 10);
      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(bx - 4, by - 5, 3, 10);
      g.fillRect(bx + 1, by - 5, 3, 10);
      g.fillStyle(0xffffff, 0.75);
      g.fillEllipse(bx - 1, by - 7 - Math.abs(Math.sin(now / 50)) * 3, 9, 5);
      break;
    }
    case 'butterfly': {
      // 蝴蝶：停在头顶，翅膀一开一合（靠椭圆的宽度变化，不用 scale）
      const flap = Math.abs(Math.sin(now / 200));
      for (const s of [-1, 1]) {
        g.fillStyle(s > 0 ? color : 0xffb8e0, 1);
        g.fillEllipse(x + s * (7 + flap * 6), hy - 10, 10 + flap * 12, 16);
        g.fillEllipse(x + s * (6 + flap * 5), hy + 1, 8 + flap * 9, 11);
      }
      g.fillStyle(0x3a2a3a, 1);
      g.fillEllipse(x, hy - 8, 4, 18);
      g.lineStyle(1.6, 0x3a2a3a, 1);
      g.lineBetween(x - 1, hy - 17, x - 6 + Math.sin(now / 260) * 2, hy - 23);
      g.lineBetween(x + 1, hy - 17, x + 6 + Math.sin(now / 260) * 2, hy - 23);
      break;
    }
    case 'chick': {
      // 小鸡：坐在头顶，脑袋一点一点地啄
      const peck = Math.max(0, Math.sin(now / 500));
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 2, 26, 20);
      g.lineStyle(2.4, 0xffa63c, 1);
      g.lineBetween(x - 8, hy + 11, x - 8, hy + 16);
      g.lineBetween(x + 8, hy + 11, x + 8, hy + 16);
      g.save();
      g.translateCanvas(x + 4, hy - 2);
      g.rotateCanvas(peck * 0.5);
      g.fillStyle(0xfff0b0, 1);
      g.fillCircle(0, -2, 11);
      g.fillStyle(0xffa63c, 1);
      g.fillTriangle(8, -2, 17, 1, 8, 4);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(4, -5, 1.8);
      g.restore();
      break;
    }
    case 'crab': {
      // 螃蟹帽：两只大夹子一开一合，眼睛竖在壳上
      const open = Math.abs(Math.sin(now / 380));
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 2, 40, 24);
      for (const s of [-1, 1]) {
        g.fillStyle(0xd8382a, 1);
        g.fillEllipse(x + s * 22, hy - 2, 14, 10);
        g.lineStyle(2.4, 0xd8382a, 1);
        g.lineBetween(x + s * 28, hy - 2, x + s * (28 + open * 9), hy - 9);
        g.fillCircle(x + s * 28, hy - 3, 4);
      }
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x - 8, hy - 10, 5);
      g.fillCircle(x + 8, hy - 10, 5);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(x - 8, hy - 10, 2.4);
      g.fillCircle(x + 8, hy - 10, 2.4);
      break;
    }
    case 'frogHat': {
      // 青蛙帽：趴着的小青蛙，腮帮一鼓一鼓
      const br = Math.sin(now / 600);
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 4, 44, 30);
      g.fillStyle(0xd8e8a0, 1);
      g.fillEllipse(x, hy + 10 + br * 2, 30, 12 + br * 4);
      g.fillStyle(color, 1);
      g.fillCircle(x - 12, hy - 12, 9);
      g.fillCircle(x + 12, hy - 12, 9);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x - 12, hy - 12, 6);
      g.fillCircle(x + 12, hy - 12, 6);
      g.fillStyle(0x1c3a12, 1);
      g.fillCircle(x - 12, hy - 11, 2.6);
      g.fillCircle(x + 12, hy - 11, 2.6);
      break;
    }
    case 'snailHat': {
      // 蜗牛帽：壳 + 两根会晃的触角
      const sw = Math.sin(now / 520);
      g.fillStyle(color, 1);
      g.fillEllipse(x - 6, hy + 10, 40, 14);
      g.fillStyle(0x8a6238, 1);
      g.fillCircle(x + 8, hy - 2, 14);
      g.lineStyle(2.4, 0xb08a4a, 1);
      g.beginPath();
      g.arc(x + 8, hy - 2, 8, 0, Math.PI * 1.6, false, 0);
      g.strokePath();
      g.lineStyle(2, color, 1);
      g.lineBetween(x - 24, hy + 8, x - 30 + sw * 3, hy - 6);
      g.lineBetween(x - 20, hy + 8, x - 24 + sw * 2, hy - 4);
      g.fillStyle(color, 1);
      g.fillCircle(x - 30 + sw * 3, hy - 7, 2.4);
      g.fillCircle(x - 24 + sw * 2, hy - 5, 2.4);
      break;
    }
    case 'fishBowl': {
      // 鱼缸帽：玻璃碗里一条小鱼绕圈游
      g.fillStyle(color, 0.35);
      g.fillCircle(x, hy + 2, 22);
      const a = now / 600;
      const fx = x + Math.cos(a) * 11;
      const fy = hy + 2 + Math.sin(a) * 7;
      g.fillStyle(0xff8a3c, 1);
      g.fillEllipse(fx, fy, 13, 8);
      g.fillTriangle(
        fx - 6 * Math.cos(a),
        fy - 3,
        fx - 6 * Math.cos(a),
        fy + 3,
        fx - 11 * Math.cos(a),
        fy,
      );
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(fx + Math.cos(a) * 4, fy - 1, 1.4);
      g.fillStyle(0xffffff, 0.5);
      g.fillEllipse(x - 8, hy - 12, 8, 5);
      g.lineStyle(2, 0xffffff, 0.7);
      g.strokeCircle(x, hy + 2, 22);
      break;
    }
    case 'birdCage': {
      // 鸟笼帽：笼子里的小鸟来回跳
      const hop = Math.abs(Math.sin(now / 300)) * 5;
      const bx = x + Math.sin(now / 700) * 6;
      g.fillStyle(0xf2ead8, 1);
      g.fillCircle(bx, hy + 4 - hop, 6);
      g.fillStyle(0xffa63c, 1);
      g.fillTriangle(bx + 5, hy + 3 - hop, bx + 11, hy + 5 - hop, bx + 5, hy + 7 - hop);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(bx + 2, hy + 2 - hop, 1.4);
      g.lineStyle(2, color, 1);
      g.beginPath();
      g.arc(x, hy + 2, 22, Math.PI, Math.PI * 2, false, 0);
      g.strokePath();
      for (let k = -2; k <= 2; k++) g.lineBetween(x + k * 9, hy - 18, x + k * 9, hy + 14);
      g.lineBetween(x - 22, hy + 14, x + 22, hy + 14);
      g.fillStyle(color, 1);
      g.fillCircle(x, hy - 20, 3.4);
      break;
    }
    case 'beehive': {
      // 蜂巢帽：一层层巢 + 绕飞的蜜蜂 + 底下滴的蜂蜜
      const a = now / 380;
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy + 6, 42, 18);
      g.fillEllipse(x, hy - 4, 36, 16);
      g.fillEllipse(x, hy - 14, 28, 14);
      g.fillEllipse(x, hy - 22, 18, 10);
      g.lineStyle(1.6, 0x8a6238, 0.7);
      g.lineBetween(x - 21, hy + 6, x + 21, hy + 6);
      g.lineBetween(x - 18, hy - 4, x + 18, hy - 4);
      g.fillStyle(0xffd45c, 1);
      g.fillCircle(x + Math.cos(a) * 30, hy - 16 + Math.sin(a) * 10, 4);
      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(x + Math.cos(a) * 30 - 1.4, hy - 20 + Math.sin(a) * 10, 2, 8);
      const drip = (now / 900) % 1;
      g.fillStyle(0xffb03a, 0.9);
      g.fillEllipse(x + 14, hy + 14 + drip * 12, 4, 6 + drip * 4);
      break;
    }
    case 'hedgehog': {
      // 小刺猬：一身尖刺 + 鼻子一嗅一嗅
      const sniff = Math.sin(now / 260) * 1.6;
      g.fillStyle(0x2a2a2a, 1);
      for (let k = -3; k <= 3; k++) {
        g.fillTriangle(x + k * 6 - 3, hy - 14, x + k * 6 + 3, hy - 14, x + k * 6, hy - 27);
      }
      g.fillStyle(color, 1);
      g.fillEllipse(x, hy - 2, 48, 28);
      g.fillStyle(0xf2d8b0, 1);
      g.fillEllipse(x + 3, hy + 6, 26, 18);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(x + 15 + sniff * 0.5, hy + 10, 3);
      g.fillCircle(x + 2, hy - 4, 2);
      g.fillCircle(x - 6, hy - 5, 2);
      break;
    }

    // ---- 杂物与机械 ----
    case 'pinwheel': {
      // 小风车：四片叶子转得飞快
      g.fillStyle(0xd8c8b0, 1);
      g.fillRect(x - 2, hy - 2, 4, 24);
      const a0 = now / 140;
      const blades = [0xff8a4a, 0x6fe3ff, 0xffd45c, 0xff8ad4];
      for (let k = 0; k < 4; k++) {
        g.save();
        g.translateCanvas(x, hy - 6);
        g.rotateCanvas(a0 + (k / 4) * Math.PI * 2);
        g.fillStyle(blades[k], 1);
        g.fillTriangle(0, 0, 18, -7, 18, 0);
        g.restore();
      }
      g.fillStyle(0x4a5460, 1);
      g.fillCircle(x, hy - 6, 3);
      break;
    }
    case 'trafficCone': {
      // 交通锥：两道反光带，整体轻轻晃
      g.save();
      g.translateCanvas(x, hy + 16);
      g.rotateCanvas(Math.sin(now / 700) * 0.06);
      g.fillStyle(color, 1);
      g.fillTriangle(-20, 0, 20, 0, 0, -34);
      g.fillStyle(0xf2f2f2, 1);
      g.fillRect(-13, -12, 26, 5);
      g.fillRect(-9, -21, 18, 4);
      g.fillRoundedRect(-22, -2, 44, 6, 2);
      g.restore();
      break;
    }
    case 'lantern': {
      // 纸灯笼帽：吊着晃，里面透出暖光
      g.lineStyle(2, 0x8a6238, 1);
      g.lineBetween(x, hy - 24, x, hy - 14);
      g.save();
      g.translateCanvas(x, hy - 14);
      g.rotateCanvas(Math.sin(now / 620) * 0.12);
      g.fillStyle(color, 0.95);
      g.fillEllipse(0, 8, 34, 30);
      g.fillStyle(0xfff0b0, 0.35 + 0.15 * Math.sin(now / 300));
      g.fillEllipse(0, 8, 24, 22);
      g.fillStyle(0x8a6238, 1);
      g.fillRect(-8, -6, 16, 5);
      g.fillRect(-8, 20, 16, 5);
      g.restore();
      break;
    }
    case 'umbrella': {
      // 雨伞帽：伞骨在转，四周掉雨点
      g.fillStyle(color, 1);
      g.beginPath();
      g.arc(x, hy + 2, 30, Math.PI, Math.PI * 2, false, 0);
      g.fillPath();
      const a0 = now / 700;
      g.lineStyle(2, 0xffffff, 0.5);
      for (let k = 0; k < 4; k++) {
        const a = a0 + (k / 4) * Math.PI * 2;
        g.lineBetween(x, hy + 2, x + Math.cos(a) * 30, hy + 2 - Math.abs(Math.sin(a)) * 30);
      }
      g.lineStyle(2.6, 0xd8c8b0, 1);
      g.lineBetween(x, hy + 2, x, hy - 22);
      g.beginPath();
      g.arc(x + 5, hy - 22, 5, Math.PI, Math.PI * 1.6, false, 0);
      g.strokePath();
      for (let k = 0; k < 4; k++) {
        const t = (now / 700 + k / 4) % 1;
        g.fillStyle(0x9fe8ff, 0.7 * (1 - t));
        g.fillEllipse(x - 26 + k * 17, hy + 6 + t * 20, 3, 6);
      }
      break;
    }
    case 'alarmClock': {
      // 闹钟帽：指针在转，两边铃铛不停抖
      g.fillStyle(color, 1);
      g.fillCircle(x, hy + 2, 20);
      g.fillStyle(0xfff6e0, 1);
      g.fillCircle(x, hy + 2, 16);
      const a = now / 400;
      g.lineStyle(2.4, 0x2a2a2a, 1);
      g.lineBetween(x, hy + 2, x + Math.cos(a) * 11, hy + 2 + Math.sin(a) * 11);
      g.lineBetween(x, hy + 2, x + Math.cos(a * 3.2) * 7, hy + 2 + Math.sin(a * 3.2) * 7);
      const shake = Math.abs(Math.sin(now / 120)) * 2;
      for (const s of [-1, 1]) {
        g.fillStyle(color, 1);
        g.fillEllipse(x + s * 15, hy - 16 + s * shake, 9, 8);
        g.lineBetween(x + s * 12, hy - 8, x + s * 22, hy - 3);
      }
      break;
    }
    case 'trafficLight': {
      // 红绿灯帽：三盏灯按时间轮着亮
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 11, hy - 26, 22, 46, 5);
      const on = Math.floor(now / 900) % 3;
      const lamp = [0xff3a3a, 0xffd45c, 0x4fe07a];
      for (let k = 0; k < 3; k++) {
        const lit = k === on;
        if (lit) {
          g.fillStyle(lamp[k], 0.2 + 0.12 * Math.sin(now / 160));
          g.fillCircle(x, hy - 16 + k * 15, 12);
        }
        g.fillStyle(lit ? lamp[k] : 0x2a3038, 1);
        g.fillCircle(x, hy - 16 + k * 15, 7);
      }
      break;
    }
    case 'satellite': {
      // 卫星帽：两块太阳能板轮流倾 + 天线上的灯在闪
      const tilt = Math.sin(now / 700) * 0.2;
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 9, hy - 12, 18, 24, 4);
      for (const s of [-1, 1]) {
        g.save();
        g.translateCanvas(x + s * 10, hy);
        g.rotateCanvas(s * tilt);
        g.fillStyle(0x2a4a8a, 1);
        g.fillRoundedRect(s > 0 ? 0 : -26, -10, 26, 20, 3);
        g.lineStyle(1.4, 0x9fe8ff, 0.8);
        g.lineBetween(s * 9, -10, s * 9, 10);
        g.restore();
      }
      g.lineStyle(2, 0xd8e6f0, 1);
      g.lineBetween(x, hy - 12, x, hy - 24);
      g.fillStyle(Math.sin(now / 260) > 0 ? 0xff5a5a : 0x6a4a4a, 1);
      g.fillCircle(x, hy - 26, 3.4);
      break;
    }
    case 'planet': {
      // 行星帽：本体 + 一圈环（前半环画在身上）+ 一颗绕行的小卫星
      g.fillStyle(color, 1);
      g.fillCircle(x, hy, 16);
      g.fillStyle(0xffffff, 0.18);
      g.fillEllipse(x - 5, hy - 6, 10, 7);
      g.lineStyle(4, 0xffd45c, 0.85);
      g.beginPath();
      g.arc(x, hy + 4, 25, Math.PI * 0.05, Math.PI * 0.95, false, 0);
      g.strokePath();
      const a = now / 500;
      g.fillStyle(0xfff0b0, 1);
      g.fillCircle(x + Math.cos(a) * 27, hy + 1 - Math.abs(Math.sin(a)) * 9, 3);
      break;
    }
    case 'bulb': {
      // 灯泡帽：一亮一暗，亮的时候往四周冒光
      const on = 0.55 + 0.45 * Math.sin(now / 320);
      g.fillStyle(0xd8c8b0, 1);
      g.fillRoundedRect(x - 7, hy + 6, 14, 10, 2);
      g.fillStyle(color, 1);
      g.fillCircle(x, hy - 4, 15);
      g.fillStyle(0xfff0b0, on * 0.9);
      g.fillCircle(x, hy - 4, 10);
      g.lineStyle(2, 0xfff0b0, on * 0.7);
      for (let k = 0; k < 4; k++) {
        const a = -Math.PI * 0.8 + (k / 3) * Math.PI * 0.6;
        g.lineBetween(
          x + Math.cos(a) * 19,
          hy - 4 + Math.sin(a) * 19,
          x + Math.cos(a) * 25,
          hy - 4 + Math.sin(a) * 25,
        );
      }
      break;
    }
    case 'battery': {
      // 电池帽：电量条一格一格涨上去
      const lv = Math.ceil((now / 700) % 4.0001);
      g.fillStyle(0xd8c8b0, 1);
      g.fillRoundedRect(x - 9, hy - 26, 18, 6, 2);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 16, hy - 20, 32, 34, 4);
      g.lineStyle(1.6, 0x1f3a1f, 0.6);
      g.strokeRoundedRect(x - 16, hy - 20, 32, 34, 4);
      for (let k = 0; k < 4; k++) {
        if (k + 1 > lv) continue;
        g.fillStyle(k < 2 ? 0x8fe06a : k === 2 ? 0xffd45c : 0xff6b5a, 1);
        g.fillRect(x - 12, hy + 8 - k * 7, 24, 5);
      }
      break;
    }
    case 'magnet': {
      // 磁铁帽：马蹄形磁铁，两端时不时迸火花
      g.lineStyle(11, color, 1);
      g.beginPath();
      g.arc(x, hy - 2, 15, Math.PI, Math.PI * 2, false, 0);
      g.strokePath();
      g.fillStyle(0xd8d8d8, 1);
      g.fillRect(x - 20.5, hy - 2, 11, 12);
      g.fillRect(x + 9.5, hy - 2, 11, 12);
      const spark = Math.abs(Math.sin(now / 240));
      if (spark > 0.6) {
        g.fillStyle(0x9fe8ff, (spark - 0.6) * 2);
        g.fillCircle(x - 15, hy + 13, 3.4);
        g.fillCircle(x + 15, hy + 13, 3.4);
      }
      break;
    }
    case 'weldingMask': {
      // 焊接面罩（整头替换）：方罩 + 长条护目镜，镜里电弧一直闪
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 19, hy - 18, 38, 40, 7);
      g.fillStyle(0x2a3038, 1);
      g.fillRoundedRect(x - 15, hy - 10, 30, 11, 3);
      const arc = Math.abs(Math.sin(now / 90));
      g.fillStyle(0x8fd8ff, 0.35 + 0.4 * arc);
      g.fillCircle(x + 4, hy - 4, 5);
      g.fillStyle(0xffffff, arc * 0.85);
      g.fillRect(x - 13, hy - 8, 26 * arc, 7);
      g.fillStyle(0x3a444e, 1);
      g.fillCircle(x - 17, hy + 9, 4);
      g.fillCircle(x + 17, hy + 9, 4);
      g.lineStyle(1.6, 0x9aa7b8, 0.6);
      g.strokeRoundedRect(x - 19, hy - 18, 38, 40, 7);
      break;
    }

    // ---- 玩具 ----
    case 'tvHead': {
      // 电视头（整头替换）：老电视外壳 + 雪花屏 + 两根天线
      g.fillStyle(0xc9b89a, 1);
      g.fillRoundedRect(x - 21, hy - 16, 42, 40, 6);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 17, hy - 12, 34, 26, 4);
      g.fillStyle(0xd8f0ff, 0.85);
      for (let k = 0; k < 4; k++) {
        const t = (now / 300 + k / 4) % 1;
        g.fillRect(x - 16, hy - 11 + t * 24, 32, 2 + (k % 2) * 2);
      }
      g.fillStyle(0xffffff, 0.3);
      g.fillRect(x - 16, hy - 11 + ((now / 90) % 1) * 22, 32, 3);
      g.fillStyle(0x8a7a5a, 1);
      g.fillCircle(x + 14, hy + 18, 3);
      g.lineStyle(1.8, 0xd8e6f0, 1);
      g.lineBetween(x - 8, hy - 16, x - 18, hy - 30);
      g.lineBetween(x + 8, hy - 16, x + 18, hy - 30);
      break;
    }
    case 'snowGlobe': {
      // 水晶球：底座上飘着永远不停的雪
      g.fillStyle(color, 0.5);
      g.fillCircle(x, hy - 2, 22);
      g.fillStyle(0xf2f8ff, 0.85);
      g.fillEllipse(x, hy + 13, 30, 9);
      for (let k = 0; k < 6; k++) {
        const t = (now / 1400 + k / 6) % 1;
        g.fillStyle(0xffffff, 0.9 * (1 - t * 0.4));
        g.fillCircle(x - 16 + (k % 3) * 15 + Math.sin(now / 400 + k) * 3, hy - 20 + t * 30, 2.2);
      }
      g.lineStyle(2, 0xffffff, 0.75);
      g.strokeCircle(x, hy - 2, 22);
      break;
    }
    case 'paperBoat': {
      // 纸船帽：骑在两波小浪上，浪花一直在动
      g.save();
      g.translateCanvas(x, hy + 6);
      g.rotateCanvas(Math.sin(now / 500) * 0.09);
      g.fillStyle(color, 1);
      g.fillTriangle(-22, 4, 22, 4, 0, 18);
      g.fillTriangle(-18, 3, 0, 3, 0, -16);
      g.fillTriangle(18, 3, 0, 3, 0, -16);
      g.fillStyle(0xd8d4c8, 1);
      g.fillTriangle(-16, 0, 0, 0, 0, -13);
      g.restore();
      g.lineStyle(2.4, 0x8fd8ff, 0.85);
      for (let k = 0; k < 3; k++) {
        g.beginPath();
        for (let s = 0; s <= 4; s++) {
          const px = x - 26 + s * 13;
          const py = hy + 18 + k * 3 + Math.sin(now / 300 + s + k) * 2;
          if (s === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.strokePath();
      }
      break;
    }
    case 'dice': {
      // 骰子帽：点数每隔一会儿换一次
      const face = Math.floor(now / 700) % 6;
      const dots: number[][][] = [
        [[17, 17]],
        [
          [8, 8],
          [26, 26],
        ],
        [
          [8, 8],
          [17, 17],
          [26, 26],
        ],
        [
          [8, 8],
          [8, 26],
          [26, 8],
          [26, 26],
        ],
        [
          [8, 8],
          [8, 26],
          [17, 17],
          [26, 8],
          [26, 26],
        ],
        [
          [8, 8],
          [8, 17],
          [8, 26],
          [26, 8],
          [26, 17],
          [26, 26],
        ],
      ];
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 17, hy - 16, 34, 34, 7);
      g.fillStyle(0xffffff, 0.5);
      g.fillRoundedRect(x - 17, hy - 16, 34, 9, 7);
      g.fillStyle(0x3a3a44, 1);
      for (const d of dots[face]) g.fillCircle(x - 17 + d[0], hy - 16 + d[1], 3.2);
      break;
    }
    case 'book': {
      // 书本帽：摊开的一本书，书页自己翻
      const t = (now / 1200) % 1;
      const flip = Math.sin(t * Math.PI);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 24, hy - 2, 48, 8, 2);
      g.fillStyle(0xf8f8f2, 1);
      g.fillTriangle(x - 23, hy - 2, x - 2, hy - 2, x - 13, hy - 18);
      g.fillTriangle(x + 23, hy - 2, x + 2, hy - 2, x + 13, hy - 18);
      if (t < 0.5) {
        g.fillStyle(0xffffff, 0.95);
        g.fillTriangle(x - 2, hy - 2, x - 2 + flip * 20, hy - 2 - flip * 14, x - 2, hy - 18);
      }
      break;
    }
    case 'pencil': {
      // 铅笔帽：立着的铅笔 + 旁边一卷木屑，整体轻轻抖
      const jig = Math.sin(now / 300) * 1.4;
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 7 + jig, hy - 6, 14, 28, 2);
      g.fillStyle(0xe8a04a, 1);
      g.fillTriangle(x - 7 + jig, hy - 6, x + 7 + jig, hy - 6, x + jig, hy - 20);
      g.fillStyle(0x3a3a44, 1);
      g.fillTriangle(x - 3 + jig, hy - 14, x + 3 + jig, hy - 14, x + jig, hy - 21);
      g.fillStyle(0xe86a8a, 1);
      g.fillRoundedRect(x - 7 + jig, hy + 18, 14, 6, 2);
      g.lineStyle(2, 0xd8c8b0, 1);
      g.beginPath();
      g.arc(x + 12 + jig, hy + 2, 6, Math.PI * 0.2, Math.PI * 1.5, false, 0);
      g.strokePath();
      break;
    }
    // ==== 🧩 碎片兑换专属 / 宇宙龙域 ==========================================
    case 'shardCrown': {
      // 碎晶冠：一圈悬浮晶片绕头缓转，中间立一道主晶柱
      const a0 = now / 900;
      for (let k = 0; k < 6; k++) {
        const a = a0 + (k / 6) * Math.PI * 2;
        const px = x + Math.cos(a) * 17;
        const py = hy - 10 + Math.sin(a) * 5;
        const s = 4 + Math.sin(a) * 1.5;
        g.fillStyle(k % 2 ? 0xbfe8ff : 0xe8fbff, 0.9);
        g.fillTriangle(px, py - s, px + s * 0.6, py + s * 0.7, px - s * 0.6, py + s * 0.7);
      }
      g.fillStyle(0xdff4ff, 0.95);
      g.fillTriangle(x, hy - 26, x + 5, hy - 8, x - 5, hy - 8);
      g.fillStyle(0xffffff, 0.7);
      g.fillTriangle(x, hy - 22, x + 2.4, hy - 10, x - 2.4, hy - 10);
      break;
    }
    case 'drakecrown': {
      // 龙冕：三根后掠的龙角，角尖一点金色星焰
      for (const s of [-1, 0, 1]) {
        const w = s === 0 ? 1 : 0.7;
        const sway = Math.sin(now / 500 + s) * 1.5;
        g.fillStyle(color, 0.95);
        g.fillTriangle(x + s * 9, hy - 6, x + s * 15 * w, hy - 4, x + s * 12 + sway, hy - 26);
        g.fillStyle(0xfff2b0, 0.85);
        g.fillCircle(x + s * 12 + sway, hy - 26, 2.2);
      }
      g.lineStyle(3, color, 0.9);
      g.beginPath();
      g.arc(x, hy - 4, 12, Math.PI * 1.05, Math.PI * 1.95, false, 0);
      g.strokePath();
      break;
    }
    case 'nailongHood': {
      // 小黄龙头套：黄色恐龙兜帽，包住整个头 + 呆萌大眼 + 小圆角
      g.fillStyle(color, 1);
      g.fillCircle(x, hy - 2, 22);
      g.fillStyle(0xefb81e, 1);
      g.fillCircle(x - 11, hy - 22, 5.5);
      g.fillCircle(x + 11, hy - 22, 5.5);
      // 浅色口鼻
      g.fillStyle(0xfff3bd, 1);
      g.fillEllipse(x, hy + 8, 26, 16);
      // 大眼
      g.fillStyle(0x3a2a06, 1);
      g.fillCircle(x - 7, hy - 4, 4);
      g.fillCircle(x + 7, hy - 4, 4);
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(x - 6, hy - 5.2, 1.4);
      g.fillCircle(x + 8, hy - 5.2, 1.4);
      // 腮红 + 嘴
      g.fillStyle(0xffa8a8, 0.55);
      g.fillEllipse(x - 14, hy + 4, 8, 5);
      g.fillEllipse(x + 14, hy + 4, 8, 5);
      g.fillStyle(0x8a3a2a, 1);
      g.fillEllipse(x, hy + 9, 9, 6);
      break;
    }
  }
}

/** a small companion bobbing beside the player; star adds flair */
export function drawPet(
  g: Phaser.GameObjects.Graphics, now: number,
  x: number,
  topY: number,
  i: 0 | 1,
  id: PetId,
  star: number,
): void {
  const color = PET_COLORS[id];
  const dir = i === 0 ? 1 : -1;
  const bob = Math.sin(now / 380) * 5;
  const px = x + dir * 42;
  const py = topY - 4 + bob;
  switch (PET_KIND[id]) {
    case 'orb': {
      g.fillStyle(color, 0.3);
      g.fillCircle(px, py, 12);
      g.fillStyle(color, 0.95);
      g.fillCircle(px, py, 6);
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(px - 2, py - 2, 2);
      break;
    }
    case 'bird': {
      g.fillStyle(color, 0.75);
      g.fillEllipse(px - dir * 2, py - 3, 12, 6 + Math.abs(Math.sin(now / 150)) * 6);
      g.fillStyle(color, 1);
      g.fillEllipse(px, py, 16, 12);
      g.fillCircle(px + dir * 7, py - 4, 5);
      g.fillStyle(0xffb020, 1);
      g.fillTriangle(px + dir * 11, py - 6, px + dir * 16, py - 4, px + dir * 11, py - 2);
      break;
    }
    case 'cat': {
      g.fillStyle(color, 1);
      g.fillEllipse(px, py + 4, 18, 12);
      g.fillCircle(px, py - 4, 8);
      g.fillTriangle(px - 8, py - 8, px - 4, py - 16, px - 1, py - 8);
      g.fillTriangle(px + 8, py - 8, px + 4, py - 16, px + 1, py - 8);
      g.fillStyle(0x1a1a22, 1);
      g.fillCircle(px - 3, py - 4, 1.6);
      g.fillCircle(px + 3, py - 4, 1.6);
      break;
    }
    case 'fox': {
      g.fillStyle(color, 1);
      g.fillEllipse(px, py + 4, 18, 12);
      g.fillCircle(px, py - 4, 8);
      g.fillTriangle(px - 7, py - 9, px - 5, py - 18, px - 1, py - 8);
      g.fillTriangle(px + 7, py - 9, px + 5, py - 18, px + 1, py - 8);
      g.fillStyle(0xffffff, 0.9);
      g.fillTriangle(px, py - 2, px - 3, py + 3, px + 3, py + 3);
      g.fillStyle(color, 0.9);
      g.fillEllipse(px - dir * 12, py + 6, 12, 6);
      break;
    }
    case 'dragon': {
      g.fillStyle(color, 0.7);
      g.fillTriangle(px - dir * 2, py - 2, px - dir * 16, py - 12, px - dir * 14, py + 6);
      g.fillStyle(color, 1);
      g.fillEllipse(px, py, 20, 14);
      g.fillCircle(px + dir * 8, py - 5, 6);
      g.fillStyle(0xffd45c, 1);
      g.fillTriangle(px + dir * 10, py - 9, px + dir * 14, py - 14, px + dir * 15, py - 7);
      break;
    }
    case 'fairy': {
      g.fillStyle(color, 0.3);
      g.fillCircle(px, py, 13);
      g.fillStyle(0xffffff, 0.5);
      g.fillEllipse(px - 7, py - 4, 12, 9);
      g.fillEllipse(px + 7, py - 4, 12, 9);
      g.fillStyle(color, 1);
      g.fillCircle(px, py, 5);
      break;
    }
    case 'skull': {
      g.fillStyle(color, 1);
      g.fillCircle(px, py - 2, 9);
      g.fillRect(px - 5, py + 5, 10, 6);
      g.fillStyle(0x1a1020, 1);
      g.fillCircle(px - 3, py - 3, 2.4);
      g.fillCircle(px + 3, py - 3, 2.4);
      break;
    }
    case 'robot': {
      g.fillStyle(color, 1);
      g.fillRoundedRect(px - 8, py - 8, 16, 16, 3);
      g.fillStyle(0x39ffd0, 1);
      g.fillCircle(px - 3, py - 2, 2);
      g.fillCircle(px + 3, py - 2, 2);
      g.lineStyle(2, color, 1);
      g.lineBetween(px, py - 8, px, py - 14);
      g.fillStyle(0xff5a5a, 1);
      g.fillCircle(px, py - 15, 2.5);
      break;
    }
    case 'star': {
      const rot = now / 900;
      g.fillStyle(color, 0.95);
      for (let k = 0; k < 5; k++) {
        const ang = rot + (k / 5) * Math.PI * 2 - Math.PI / 2;
        g.fillTriangle(
          px + Math.cos(ang) * 11, py + Math.sin(ang) * 11,
          px + Math.cos(ang + 1.2) * 5, py + Math.sin(ang + 1.2) * 5,
          px + Math.cos(ang - 1.2) * 5, py + Math.sin(ang - 1.2) * 5,
        );
      }
      break;
    }
    case 'flame': {
      for (let k = 0; k < 3; k++) {
        const ph = (now / 300 + k / 3) % 1;
        g.fillStyle(k === 1 ? 0xffd07a : color, 0.85 * (1 - ph * 0.5));
        g.fillEllipse(px, py + 4 - ph * 10, 10 - k * 2, 16 - k * 3);
      }
      break;
    }
    case 'ghost': {
      g.fillStyle(color, 0.85);
      g.fillCircle(px, py - 2, 9);
      const wob = Math.sin(now / 200) * 2;
      g.fillRect(px - 9, py + 4, 18, 6);
      g.fillCircle(px - 6, py + 10 + wob, 3);
      g.fillCircle(px, py + 11 - wob, 3);
      g.fillCircle(px + 6, py + 10 + wob, 3);
      g.fillStyle(0x1a1a22, 1);
      g.fillCircle(px - 3, py - 3, 1.8);
      g.fillCircle(px + 3, py - 3, 1.8);
      break;
    }
    case 'nailong': {
      // 小黄龙宝宝：黄色圆滚滚，小短手短腿 + 头顶小圆角 + 腮红
      g.fillStyle(0xefb81e, 1);
      g.fillEllipse(px - dir * 9, py + 5, 20, 10);
      g.fillStyle(color, 1);
      g.fillCircle(px, py + 3, 11);
      g.fillStyle(0xfff3bd, 1);
      g.fillEllipse(px, py + 5, 13, 11);
      g.fillStyle(color, 1);
      g.fillCircle(px, py - 8, 10);
      g.fillStyle(0xefb81e, 1);
      g.fillCircle(px - 5, py - 16, 3);
      g.fillCircle(px + 5, py - 16, 3);
      g.fillStyle(0x3a2a06, 1);
      g.fillCircle(px - 3.5, py - 9, 1.8);
      g.fillCircle(px + 3.5, py - 9, 1.8);
      g.fillStyle(0xffa8a8, 0.6);
      g.fillCircle(px - 8, py - 5, 2);
      g.fillCircle(px + 8, py - 5, 2);
      g.fillStyle(0x8a3a2a, 1);
      g.fillEllipse(px, py - 4, 5, 3);
      break;
    }
  }

  // hatched quality shows on the field: more stars, more sparkle
  if (star >= 2) {
    g.fillStyle(color, 0.16);
    g.fillCircle(px, py, 15 + star);
  }
  if (star >= 3) {
    g.lineStyle(2, color, 0.65);
    g.strokeCircle(px, py, 17);
  }
  if (star >= 4) {
    for (let k = 0; k < 3; k++) {
      const ang = now / 500 + (k / 3) * Math.PI * 2;
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(px + Math.cos(ang) * 20, py + Math.sin(ang) * 20, 2.5);
    }
  }
  if (star >= 5) {
    for (let k = 0; k < 4; k++) {
      const ang = -now / 700 + (k / 4) * Math.PI * 2;
      g.fillStyle(color, 0.9);
      g.fillCircle(px + Math.cos(ang) * 27, py + Math.sin(ang) * 27, 2);
    }
    g.fillStyle(0xffffff, 0.35 + 0.25 * Math.sin(now / 200));
    g.fillCircle(px, py, 20);
  }
}

/** aura behind a player; each aura has its own motion, not just a colour */
export function drawAura(
  g: Phaser.GameObjects.Graphics, now: number,
  x: number,
  y: number,
  id: AuraId,
  color: number,
): void {
  const cy = y - PLAYER_H * 0.5;
  const pulse = 0.5 + 0.5 * Math.sin(now / 480);

  // every aura keeps a soft base glow so it still reads as an aura
  g.fillStyle(color, 0.12);
  g.fillEllipse(x, cy, 98, 152);
  g.lineStyle(2, color, 0.2 + 0.2 * pulse);
  g.strokeEllipse(x, cy, 116 + pulse * 6, 172 + pulse * 10);

  // 新主题宝箱的光环：底光保留，图案走 themeart 的通用画法
  const themeAura = THEME_AURAS[id];
  if (themeAura) {
    drawThemeAura(g, now, x, cy, color, themeAura);
    return;
  }

  switch (id) {
    case 'flame': {
      for (let k = 0; k < 5; k++) {
        const ph = (now / 260 + k * 0.2) % 1;
        const fx = x + Math.sin(now / 300 + k * 2) * 28;
        const fy = cy + 60 - ph * 130;
        g.fillStyle(k % 2 ? 0xffd07a : color, 0.5 * (1 - ph));
        g.fillEllipse(fx, fy, 18 * (1 - ph) + 5, 30 * (1 - ph) + 8);
      }
      break;
    }
    case 'gold': {
      for (let k = 0; k < 12; k++) {
        const ang = (k / 12) * Math.PI * 2 + now / 1800;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k));
        g.fillStyle(color, 0.7 * tw);
        g.fillCircle(x + Math.cos(ang) * 52, cy + Math.sin(ang) * 76, 3);
      }
      break;
    }
    case 'electric': {
      g.lineStyle(2, 0xffffff, 0.8);
      for (let k = 0; k < 3; k++) {
        const a0 = now / 140 + k * 2.1;
        const r0 = 44 + k * 12;
        let px = x + Math.cos(a0) * r0;
        let py = cy + Math.sin(a0) * r0 * 1.4;
        for (let s = 1; s <= 5; s++) {
          const ang = a0 + s * 0.3 + Math.sin(now / 60 + s * 3 + k) * 0.25;
          const rr = r0 + s * 3;
          const nx = x + Math.cos(ang) * rr;
          const ny = cy + Math.sin(ang) * rr * 1.4;
          g.lineBetween(px, py, nx, ny);
          px = nx;
          py = ny;
        }
      }
      break;
    }
    case 'snow':
    case 'sakura': {
      for (let k = 0; k < 10; k++) {
        const ph = (now / 1100 + k / 10) % 1;
        const sx = x + Math.sin(now / 700 + k * 1.7) * 34;
        const sy = cy - 60 + ph * 130;
        g.fillStyle(id === 'snow' ? 0xffffff : color, 0.75 * (1 - ph * 0.4));
        if (id === 'snow') g.fillCircle(sx, sy, 2 + (k % 3));
        else g.fillEllipse(sx, sy, 7, 4);
      }
      break;
    }
    case 'bubble':
    case 'toxic': {
      for (let k = 0; k < 8; k++) {
        const ph = (now / 900 + k / 8) % 1;
        const bx = x + Math.sin(k * 3.1) * 30;
        const by = cy + 60 - ph * 130;
        const rr = 4 + (k % 3);
        g.lineStyle(1.8, color, 0.7 * (1 - ph));
        g.strokeCircle(bx, by, rr);
      }
      break;
    }
    case 'orbit':
    case 'violet': {
      const dots = id === 'orbit' ? 4 : 3;
      for (let k = 0; k < dots; k++) {
        const ang = now / 500 + (k / dots) * Math.PI * 2;
        const ox = x + Math.cos(ang) * 52;
        const oy = cy + Math.sin(ang) * 76;
        g.fillStyle(color, 0.9);
        g.fillCircle(ox, oy, 5);
        g.fillStyle(0xffffff, 0.7);
        g.fillCircle(ox, oy, 2);
      }
      break;
    }
    case 'gear':
    case 'pixel': {
      if (id === 'gear') {
        const rot = now / 900;
        const teeth = 10;
        const rOuter = 58;
        g.lineStyle(2.5, color, 0.6);
        g.beginPath();
        for (let k = 0; k < teeth * 2; k++) {
          const ang = rot + (k / (teeth * 2)) * Math.PI * 2;
          const rr = k % 2 === 0 ? rOuter : rOuter * 0.82;
          const px = x + Math.cos(ang) * rr;
          const py = cy + Math.sin(ang) * rr * 1.3;
          if (k === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.closePath();
        g.strokePath();
      } else {
        const phase = Math.floor(now / 130);
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 5; c++) {
            if ((r + c + phase) % 3 !== 0) continue;
            const px = x + (c - 2) * 22;
            const py = cy + (r - 3) * 22;
            g.fillStyle(color, 0.7);
            g.fillRect(px - 6, py - 6, 12, 12);
          }
        }
      }
      break;
    }
    case 'holy':
    case 'king': {
      const rays = id === 'holy' ? 8 : 7;
      for (let k = 0; k < rays; k++) {
        const ang = -Math.PI / 2 + (k / rays) * Math.PI * 2;
        g.lineStyle(3, color, 0.3 + 0.3 * pulse);
        g.lineBetween(x, cy, x + Math.cos(ang) * 70, cy + Math.sin(ang) * 92);
      }
      g.fillStyle(color, 0.22);
      g.fillEllipse(x, cy, 72, 112);
      break;
    }
    case 'venom':
    case 'crimson': {
      for (let k = 0; k < 8; k++) {
        const ph = (now / 1200 + k / 8) % 1;
        const vx = x + Math.sin(k * 3.1) * 32;
        const vy = cy - 50 + ph * 120;
        g.fillStyle(color, 0.8 * (1 - ph));
        g.fillEllipse(vx, vy, 5, 9 - ph * 4);
      }
      if (id === 'crimson') {
        g.lineStyle(3, color, 0.3 + 0.4 * pulse);
        g.strokeEllipse(x, cy, 96 + pulse * 10, 150 + pulse * 14);
      }
      break;
    }
    case 'void': {
      const r = 40 + pulse * 8;
      g.fillStyle(0x120a20, 0.55);
      g.fillEllipse(x, cy, r * 1.6, r * 2.2);
      g.lineStyle(2, color, 0.5);
      g.strokeEllipse(x, cy, r * 1.6, r * 2.2);
      for (let k = 0; k < 4; k++) {
        const ang = now / 400 + (k / 4) * Math.PI * 2;
        g.fillStyle(color, 0.6);
        g.fillCircle(x + Math.cos(ang) * r * 1.1, cy + Math.sin(ang) * r * 1.5, 3);
      }
      break;
    }
    case 'storm': {
      g.lineStyle(2, color, 0.4);
      g.strokeEllipse(x, cy - 40, 110, 40);
      for (let k = 0; k < 2; k++) {
        const seed = Math.floor(now / 180) + k * 3;
        const bx = x + Math.sin(seed * 1.7) * 40;
        g.lineStyle(2, 0xffffff, 0.8);
        g.lineBetween(bx, cy - 30, bx + 8, cy + 6);
        g.lineBetween(bx + 8, cy + 6, bx - 4, cy + 4);
        g.lineBetween(bx - 4, cy + 4, bx + 4, cy + 44);
      }
      break;
    }
    case 'rainbow': {
      for (let k = 0; k < 3; k++) {
        const h = (now / 2500 + k * 0.12) % 1;
        const col = Phaser.Display.Color.HSVToRGB(h, 0.85, 1).color;
        g.lineStyle(4 - k, col, 0.5 - k * 0.12);
        g.strokeEllipse(x, cy, 104 + k * 12, 158 + k * 16);
      }
      break;
    }
    case 'frost': {
      for (let k = 0; k < 8; k++) {
        const ang = now / 1200 + (k / 8) * Math.PI * 2;
        const fx = x + Math.cos(ang) * 50;
        const fy = cy + Math.sin(ang) * 72;
        g.lineStyle(1.6, 0xffffff, 0.5);
        for (let s = 0; s < 3; s++) {
          const a2 = (s / 3) * Math.PI;
          g.lineBetween(fx - Math.cos(a2) * 6, fy - Math.sin(a2) * 6, fx + Math.cos(a2) * 6, fy + Math.sin(a2) * 6);
        }
      }
      break;
    }
    case 'emerald':
    case 'rose': {
      for (let k = 0; k < 9; k++) {
        const ph = (now / 1100 + k / 9) % 1;
        const px = x + Math.sin(k * 2.7) * 34;
        const py = cy + 60 - ph * 130;
        g.fillStyle(color, 0.8 * (1 - ph));
        if (id === 'emerald') g.fillCircle(px, py, 3);
        else g.fillEllipse(px, py, 8, 5);
      }
      break;
    }
    case 'aurora': {
      for (let k = 0; k < 3; k++) {
        g.lineStyle(4 - k, k === 1 ? 0x9effd0 : color, 0.4 - k * 0.08);
        g.beginPath();
        for (let s = 0; s <= 10; s++) {
          const u = s / 10;
          const px = x - 60 + u * 120;
          const py = cy - 40 + Math.sin(now / 500 + u * 4 + k) * 14 + k * 16;
          if (s === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.strokePath();
      }
      break;
    }
    case 'lava': {
      g.fillStyle(0x3a1206, 0.4);
      g.fillEllipse(x, cy + 60, 80, 26);
      for (let k = 0; k < 6; k++) {
        const ph = (now / 700 + k / 6) % 1;
        g.fillStyle(k % 2 ? 0xffd06a : color, 0.8 * (1 - ph));
        g.fillCircle(x + (k - 2.5) * 18, cy + 60 - ph * 40, 6 * (1 - ph * 0.5));
      }
      break;
    }
    case 'ghost': {
      for (let k = 0; k < 3; k++) {
        const ph = (now / 1400 + k / 3) % 1;
        const gx = x + Math.sin(now / 600 + k * 2) * 30;
        const gy = cy + 50 - ph * 120;
        g.fillStyle(0xffffff, 0.35 * (1 - ph));
        g.fillCircle(gx, gy, 14);
        g.fillCircle(gx - 8, gy + 4, 8);
        g.fillCircle(gx + 8, gy + 4, 8);
      }
      break;
    }
    case 'neon': {
      g.lineStyle(3, color, 0.5 + 0.4 * pulse);
      g.strokeRect(x - 40, cy - 62, 80, 124);
      g.lineStyle(2, 0xffffff, 0.3 + 0.3 * pulse);
      g.strokeRect(x - 30, cy - 52, 60, 104);
      break;
    }
    case 'prism': {
      for (let k = 0; k < 6; k++) {
        const col = Phaser.Display.Color.HSVToRGB(((k / 6) + now / 4000) % 1, 0.85, 1).color;
        const ang = now / 900 + (k / 6) * Math.PI * 2;
        g.fillStyle(col, 0.7);
        g.fillTriangle(
          x + Math.cos(ang) * 20, cy + Math.sin(ang) * 26,
          x + Math.cos(ang + 0.5) * 60, cy + Math.sin(ang + 0.5) * 80,
          x + Math.cos(ang + 1.0) * 60, cy + Math.sin(ang + 1.0) * 80,
        );
      }
      break;
    }
    case 'thorn': {
      const n = 12;
      const rot = now / 1600;
      for (let k = 0; k < n; k++) {
        const ang = rot + (k / n) * Math.PI * 2;
        const bx = x + Math.cos(ang) * 52;
        const by = cy + Math.sin(ang) * 72;
        g.lineStyle(2.5, color, 0.7);
        g.lineBetween(x + Math.cos(ang) * 40, cy + Math.sin(ang) * 56, bx, by);
        g.fillStyle(color, 0.8);
        g.fillTriangle(
          bx - Math.sin(ang) * 5, by + Math.cos(ang) * 5,
          bx + Math.sin(ang) * 5, by - Math.cos(ang) * 5,
          bx + Math.cos(ang) * 8, by + Math.sin(ang) * 8,
        );
      }
      break;
    }
    case 'chain': {
      const n = 10;
      const rot = now / 2000;
      g.lineStyle(2.5, color, 0.7);
      for (let k = 0; k < n; k++) {
        const ang = rot + (k / n) * Math.PI * 2;
        g.strokeEllipse(x + Math.cos(ang) * 50, cy + Math.sin(ang) * 70, 12, 7);
      }
      break;
    }
    case 'plume': {
      for (let k = 0; k < 6; k++) {
        const ph = (now / 1500 + k / 6) % 1;
        const px = x + Math.sin(now / 900 + k * 2.2) * 36;
        const py = cy - 60 + ph * 130;
        g.fillStyle(color, 0.7 * (1 - ph * 0.4));
        g.fillEllipse(px, py, 16, 6);
      }
      break;
    }
    case 'coin': {
      for (let k = 0; k < 8; k++) {
        const ph = (now / 1000 + k / 8) % 1;
        const px = x + Math.sin(k * 2.6) * 34;
        const py = cy + 60 - ph * 130;
        const sq = Math.abs(Math.cos(now / 200 + k)) * 0.6 + 0.4;
        g.fillStyle(0xffd45c, 0.9 * (1 - ph));
        g.fillEllipse(px, py, 12 * sq, 12);
      }
      break;
    }
    case 'note': {
      for (let k = 0; k < 5; k++) {
        const ph = (now / 1400 + k / 5) % 1;
        const px = x + Math.sin(now / 700 + k * 2) * 32;
        const py = cy + 55 - ph * 125;
        g.fillStyle(color, 0.8 * (1 - ph));
        g.fillCircle(px - 3, py + 3, 4);
        g.fillRect(px - 1, py - 7, 2, 11);
      }
      break;
    }
    case 'heart': {
      for (let k = 0; k < 5; k++) {
        const ph = (now / 1300 + k / 5) % 1;
        const px = x + Math.sin(k * 1.9) * 30;
        const py = cy + 55 - ph * 125;
        const s = 5;
        g.fillStyle(color, 0.8 * (1 - ph));
        g.fillCircle(px - s * 0.5, py - s * 0.3, s * 0.6);
        g.fillCircle(px + s * 0.5, py - s * 0.3, s * 0.6);
        g.fillTriangle(px - s, py, px + s, py, px, py + s);
      }
      break;
    }
    case 'skull': {
      for (let k = 0; k < 3; k++) {
        const ph = (now / 1600 + k / 3) % 1;
        const px = x + (k - 1) * 26;
        const py = cy + 50 - ph * 110;
        g.fillStyle(0xdfe6f0, 0.55 * (1 - ph * 0.6));
        g.fillCircle(px, py, 13);
        g.fillRect(px - 7, py + 6, 14, 7);
        g.fillStyle(0x1a1020, 0.7 * (1 - ph * 0.6));
        g.fillCircle(px - 4, py - 2, 2.4);
        g.fillCircle(px + 4, py - 2, 2.4);
      }
      break;
    }
    case 'sparkle': {
      for (let k = 0; k < 10; k++) {
        const ang = (k / 10) * Math.PI * 2 + now / 2000;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 260 + k * 1.7));
        const px = x + Math.cos(ang) * 52;
        const py = cy + Math.sin(ang) * 74;
        g.lineStyle(2, color, 0.8 * tw);
        g.lineBetween(px - 5, py, px + 5, py);
        g.lineBetween(px, py - 5, px, py + 5);
      }
      break;
    }
    case 'moon': {
      g.fillStyle(0xe8f0ff, 0.5);
      g.fillCircle(x, cy - 10, 26);
      g.fillStyle(0xffffff, 0.25);
      g.fillCircle(x - 8, cy - 18, 6);
      g.fillCircle(x + 8, cy - 2, 4);
      g.lineStyle(2, color, 0.4);
      g.strokeCircle(x, cy - 10, 34);
      break;
    }
    case 'sun': {
      const rot = now / 2600;
      for (let k = 0; k < 12; k++) {
        const ang = rot + (k / 12) * Math.PI * 2;
        g.lineStyle(3, color, 0.5 + 0.3 * pulse);
        g.lineBetween(x + Math.cos(ang) * 24, cy + Math.sin(ang) * 24, x + Math.cos(ang) * 62, cy + Math.sin(ang) * 62);
      }
      g.fillStyle(0xfff3b0, 0.5);
      g.fillCircle(x, cy, 22);
      break;
    }
    case 'clock': {
      g.lineStyle(2.5, color, 0.7);
      g.strokeCircle(x, cy, 44);
      for (let k = 0; k < 12; k++) {
        const ang = (k / 12) * Math.PI * 2 - Math.PI / 2;
        g.lineBetween(x + Math.cos(ang) * 38, cy + Math.sin(ang) * 38, x + Math.cos(ang) * 44, cy + Math.sin(ang) * 44);
      }
      const ha = now / 1200 - Math.PI / 2;
      g.lineStyle(3, 0xffffff, 0.8);
      g.lineBetween(x, cy, x + Math.cos(ha) * 30, cy + Math.sin(ha) * 30);
      g.lineBetween(x, cy, x + Math.cos(ha * 6) * 20, cy + Math.sin(ha * 6) * 20);
      break;
    }
    case 'ring': {
      for (let k = 0; k < 3; k++) {
        const r = 40 + k * 14 + Math.sin(now / 500 + k) * 4;
        g.lineStyle(3 - k * 0.6, color, 0.5 - k * 0.12);
        g.strokeEllipse(x, cy, r * 2, r * 2.8);
      }
      break;
    }
    case 'wind': {
      for (let k = 0; k < 4; k++) {
        const a0 = now / 300 + (k / 4) * Math.PI * 2;
        g.lineStyle(2, color, 0.6);
        g.beginPath();
        g.arc(x, cy, 30 + k * 12, a0, a0 + Math.PI * 0.8, false, 0);
        g.strokePath();
      }
      break;
    }
    case 'sand': {
      for (let k = 0; k < 18; k++) {
        const ang = k * 2.399 + now / 700;
        const rr = 20 + (k % 6) * 10;
        g.fillStyle(color, 0.6);
        g.fillCircle(x + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 1.3, 2);
      }
      break;
    }
    case 'rune': {
      const rot = now / 1500;
      g.lineStyle(2.5, color, 0.7);
      g.beginPath();
      for (let k = 0; k <= 5; k++) {
        const idx = (k * 2) % 5;
        const ang = rot + (idx / 5) * Math.PI * 2 - Math.PI / 2;
        const px = x + Math.cos(ang) * 50;
        const py = cy + Math.sin(ang) * 70;
        if (k === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.strokePath();
      break;
    }
    case 'hex': {
      const rot = now / 1800;
      g.lineStyle(2.5, color, 0.7);
      g.beginPath();
      for (let k = 0; k < 6; k++) {
        const ang = rot + (k / 6) * Math.PI * 2 - Math.PI / 2;
        const px = x + Math.cos(ang) * 52;
        const py = cy + Math.sin(ang) * 72;
        if (k === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.strokePath();
      g.lineStyle(1.5, 0xffffff, 0.3);
      for (let k = 0; k < 6; k++) {
        const ang = rot + (k / 6) * Math.PI * 2 - Math.PI / 2;
        g.lineBetween(x, cy, x + Math.cos(ang) * 52, cy + Math.sin(ang) * 72);
      }
      break;
    }
    case 'radar': {
      g.lineStyle(2, color, 0.5);
      g.strokeCircle(x, cy, 48);
      g.strokeCircle(x, cy, 30);
      g.strokeCircle(x, cy, 12);
      const sweep = now / 400;
      g.fillStyle(color, 0.3);
      g.fillTriangle(
        x, cy,
        x + Math.cos(sweep) * 48, cy + Math.sin(sweep) * 48,
        x + Math.cos(sweep - 0.5) * 48, cy + Math.sin(sweep - 0.5) * 48,
      );
      g.lineStyle(2.5, 0xffffff, 0.8);
      g.lineBetween(x, cy, x + Math.cos(sweep) * 48, cy + Math.sin(sweep) * 48);
      break;
    }
    case 'tide': {
      for (let k = 0; k < 3; k++) {
        g.lineStyle(3 - k * 0.5, color, 0.5 - k * 0.1);
        g.beginPath();
        for (let s = 0; s <= 12; s++) {
          const u = s / 12;
          const px = x - 60 + u * 120;
          const py = cy + 40 + k * 16 + Math.sin(now / 400 + u * 6 + k) * 6;
          if (s === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.strokePath();
      }
      break;
    }
    case 'matrix': {
      for (let c = 0; c < 5; c++) {
        const px = x - 40 + c * 20;
        for (let r = 0; r < 6; r++) {
          const ph = (now / 800 + c * 0.13 + r * 0.16) % 1;
          g.fillStyle(color, 0.7 * (1 - ph));
          g.fillRect(px - 5, cy - 60 + ph * 130 - 5, 10, 10);
        }
      }
      break;
    }
    case 'firefly': {
      for (let k = 0; k < 8; k++) {
        const ph = (now / 1600 + k / 8) % 1;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k));
        g.fillStyle(color, 0.8 * tw * (1 - ph * 0.5));
        g.fillCircle(x + Math.sin(now / 900 + k * 2.3) * 40, cy + 60 - ph * 130, 3);
      }
      break;
    }
    case 'vortex': {
      for (let arm = 0; arm < 3; arm++) {
        g.lineStyle(2.5, color, 0.5);
        g.beginPath();
        for (let s = 0; s <= 14; s++) {
          const u = s / 14;
          const ang = (arm / 3) * Math.PI * 2 + u * 3 + now / 700;
          const rr = u * 62;
          const px = x + Math.cos(ang) * rr;
          const py = cy + Math.sin(ang) * rr * 1.3;
          if (s === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.strokePath();
      }
      break;
    }
    case 'nebula': {
      for (let k = 0; k < 6; k++) {
        const ang = now / 1400 + k * 1.05;
        const rr = 20 + (k % 3) * 14;
        g.fillStyle(k % 2 ? color : 0xffffff, 0.18);
        g.fillCircle(x + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 1.3, 16);
      }
      break;
    }
    case 'eclipse': {
      g.fillStyle(0x0a0a16, 0.85);
      g.fillCircle(x, cy, 26);
      g.lineStyle(3, color, 0.7 + 0.3 * pulse);
      g.strokeCircle(x, cy, 30);
      for (let k = 0; k < 8; k++) {
        const ang = (k / 8) * Math.PI * 2 + now / 2500;
        g.lineStyle(2, color, 0.35);
        g.lineBetween(x + Math.cos(ang) * 30, cy + Math.sin(ang) * 30, x + Math.cos(ang) * 46, cy + Math.sin(ang) * 46);
      }
      break;
    }
    case 'dawn': {
      g.fillStyle(0xffe0a0, 0.25);
      g.fillEllipse(x, cy, 120, 60);
      for (let k = 0; k < 7; k++) {
        const ang = Math.PI + (k / 7) * Math.PI;
        g.lineStyle(3, color, 0.5);
        g.lineBetween(x, cy + 30, x + Math.cos(ang) * 60, cy + 30 + Math.sin(ang) * 60);
      }
      break;
    }
    case 'dusk': {
      g.fillStyle(0xff6a3c, 0.2);
      g.fillEllipse(x, cy + 20, 120, 70);
      for (let k = 0; k < 3; k++) {
        g.lineStyle(3 - k * 0.6, color, 0.4 - k * 0.1);
        g.strokeCircle(x, cy + 10, 40 + k * 16);
      }
      break;
    }
    case 'mist': {
      for (let k = 0; k < 4; k++) {
        const ph = (now / 2600 + k / 4) % 1;
        g.fillStyle(0xffffff, 0.14 * (1 - Math.abs(ph - 0.5) * 2));
        g.fillEllipse(x + Math.sin(now / 1200 + k) * 20, cy - 40 + ph * 100, 90, 34);
      }
      break;
    }
    case 'thundercloud': {
      g.fillStyle(0x3a4258, 0.5);
      g.fillEllipse(x, cy - 42, 104, 44);
      for (let k = 0; k < 3; k++) {
        g.fillStyle(0x3a4258, 0.4);
        g.fillCircle(x - 30 + k * 30, cy - 40 + (k % 2) * 8, 20);
      }
      if (Math.floor(now / 180) % 3 === 0) {
        const bx = x + Math.sin(now / 90) * 24;
        g.lineStyle(2.5, 0xffffff, 0.9);
        g.lineBetween(bx, cy - 26, bx + 6, cy + 4);
        g.lineBetween(bx + 6, cy + 4, bx - 4, cy + 2);
        g.lineBetween(bx - 4, cy + 2, bx + 2, cy + 40);
      }
      break;
    }
    case 'golddust': {
      for (let k = 0; k < 14; k++) {
        const ang = k * 2.399 + now / 1400;
        const rr = 20 + (k % 6) * 9;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k));
        g.fillStyle(color, 0.75 * tw);
        g.fillCircle(x + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 1.35, 1.8);
      }
      break;
    }
    case 'frostbite': {
      g.fillStyle(color, 0.15);
      g.fillEllipse(x, cy, 96, 150);
      for (let k = 0; k < 10; k++) {
        const ang = now / 1600 + (k / 10) * Math.PI * 2;
        const fx = x + Math.cos(ang) * 50;
        const fy = cy + Math.sin(ang) * 72;
        g.lineStyle(1.6, 0xffffff, 0.6);
        for (let s = 0; s < 3; s++) {
          const a2 = (s / 3) * Math.PI;
          g.lineBetween(fx - Math.cos(a2) * 7, fy - Math.sin(a2) * 7, fx + Math.cos(a2) * 7, fy + Math.sin(a2) * 7);
        }
      }
      break;
    }
    case 'ember': {
      for (let k = 0; k < 7; k++) {
        const ph = (now / 900 + k / 7) % 1;
        g.fillStyle(k % 2 ? 0xffd07a : color, 0.8 * (1 - ph));
        g.fillCircle(x + Math.sin(k * 2.7 + now / 700) * 34, cy + 60 - ph * 130, 2.5);
      }
      break;
    }
    case 'sparkstorm': {
      for (let k = 0; k < 12; k++) {
        const ang = k * 2.399 + now / 400;
        const rr = 22 + (k % 5) * 10;
        const px = x + Math.cos(ang) * rr;
        const py = cy + Math.sin(ang) * rr * 1.3;
        g.lineStyle(1.6, color, 0.7);
        g.lineBetween(px - 3, py, px + 3, py);
        g.lineBetween(px, py - 3, px, py + 3);
      }
      break;
    }
    case 'leafwind': {
      for (let k = 0; k < 8; k++) {
        const ph = (now / 1800 + k / 8) % 1;
        g.fillStyle(k % 2 ? color : 0x8fbf5a, 0.75 * (1 - ph * 0.4));
        g.fillEllipse(x + Math.sin(now / 800 + k * 1.7) * 42, cy + 60 - ph * 130, 9, 5);
      }
      break;
    }
    case 'petalrain': {
      for (let k = 0; k < 10; k++) {
        const ph = (now / 1700 + k / 10) % 1;
        g.fillStyle(color, 0.75 * (1 - ph * 0.4));
        g.fillEllipse(x + Math.sin(now / 700 + k * 2.1) * 40, cy + 60 - ph * 130, 8, 5);
      }
      break;
    }
    case 'snowstorm': {
      for (let k = 0; k < 16; k++) {
        const ph = (now / 1400 + k / 16) % 1;
        g.fillStyle(0xffffff, 0.8 * (1 - ph * 0.4));
        g.fillCircle(x + Math.sin(now / 500 + k * 1.3) * 46, cy - 60 + ph * 130, 1.8 + (k % 3));
      }
      break;
    }
    case 'runering': {
      const rot = now / 1600;
      g.lineStyle(2, color, 0.6);
      for (let k = 0; k < 8; k++) {
        const ang = rot + (k / 8) * Math.PI * 2;
        g.strokeRect(x + Math.cos(ang) * 50 - 4, cy + Math.sin(ang) * 72 - 4, 8, 8);
      }
      break;
    }
    case 'starfield': {
      for (let k = 0; k < 12; k++) {
        const ang = k * 2.399;
        const rr = 18 + (k % 7) * 8;
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(now / 500 + k * 1.9));
        g.fillStyle(0xfff2c4, 0.8 * tw);
        g.fillCircle(x + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 1.4, 1.8);
      }
      break;
    }
    case 'haloRing': {
      g.lineStyle(4, color, 0.4 + 0.3 * pulse);
      g.strokeEllipse(x, cy - 50, 70, 22);
      g.lineStyle(2, 0xffffff, 0.3);
      g.strokeEllipse(x, cy - 50, 54, 16);
      break;
    }
    case 'hexflame': {
      for (let k = 0; k < 6; k++) {
        const ph = (now / 1000 + k / 6) % 1;
        g.fillStyle(k % 2 ? 0x9cffd0 : color, 0.7 * (1 - ph));
        g.fillEllipse(x + (k - 2.5) * 16, cy + 50 - ph * 110, 9 * (1 - ph) + 3, 14 * (1 - ph) + 5);
      }
      break;
    }
    case 'bubblefield': {
      for (let k = 0; k < 10; k++) {
        const ph = (now / 1300 + k / 10) % 1;
        g.lineStyle(1.6, color, 0.7 * (1 - ph));
        g.strokeCircle(x + Math.sin(k * 2.7) * 36, cy + 60 - ph * 130, 3 + (k % 4));
      }
      break;
    }
    case 'prismatic': {
      for (let k = 0; k < 5; k++) {
        const col = Phaser.Display.Color.HSVToRGB((k / 5 + now / 4000) % 1, 0.8, 1).color;
        g.lineStyle(3, col, 0.35);
        g.strokeEllipse(x, cy, 90 + k * 14, 140 + k * 18);
      }
      break;
    }
    case 'spring': {
      for (let k = 0; k < 9; k++) {
        const ph = (now / 1500 + k / 9) % 1;
        const px = x + Math.sin(k * 2.3 + now / 900) * 36;
        const py = cy + 55 - ph * 125;
        g.fillStyle(color, 0.75 * (1 - ph * 0.4));
        if (k % 2) g.fillEllipse(px, py, 7, 4);
        else g.fillCircle(px, py, 3);
      }
      break;
    }
    case 'autumn': {
      for (let k = 0; k < 9; k++) {
        const ph = (now / 1400 + k / 9) % 1;
        g.fillStyle(k % 2 ? color : 0xc07f00, 0.8 * (1 - ph * 0.4));
        g.fillEllipse(x + Math.sin(now / 700 + k * 1.9) * 40, cy + 60 - ph * 130, 9, 5);
      }
      break;
    }
    case 'voidRift': {
      const r = 34 + pulse * 6;
      g.fillStyle(0x12081f, 0.6);
      g.fillEllipse(x, cy, r * 0.9, r * 2.2);
      g.lineStyle(2.5, color, 0.6);
      g.strokeEllipse(x, cy, r * 0.9, r * 2.2);
      for (let k = 0; k < 5; k++) {
        const ang = now / 500 + (k / 5) * Math.PI * 2;
        g.fillStyle(color, 0.7);
        g.fillCircle(x, cy + Math.sin(ang) * r * 1.1, 2.5);
      }
      break;
    }
    case 'blackhole': {
      // 黑洞：暗核 + 被吸入的光尘螺旋
      const r = 16 + pulse * 3;
      g.fillStyle(0x0a0614, 0.85);
      g.fillCircle(x, cy, r);
      g.lineStyle(2.5, color, 0.9);
      g.strokeCircle(x, cy, r);
      for (let k = 0; k < 10; k++) {
        const ph = (now / 1200 + k / 10) % 1;
        const ang = k * 2.399 + ph * 5;
        const rr = r + (1 - ph) * 52;
        g.fillStyle(color, 0.8 * ph);
        g.fillCircle(x + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 0.8, 1.8 + ph * 1.4);
      }
      break;
    }
    case 'supernova': {
      // 超新星：周期爆发的射线星
      const ph = (now / 1600) % 1;
      const boom = 1 - Math.pow(1 - ph, 3);
      for (let k = 0; k < 10; k++) {
        const ang = (k / 10) * Math.PI * 2;
        const rr = 10 + boom * (56 + (k % 3) * 10);
        g.lineStyle(2.5, color, (1 - ph) * 0.9);
        g.lineBetween(x + Math.cos(ang) * 8, cy + Math.sin(ang) * 8 * 1.3, x + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 1.3);
      }
      g.fillStyle(0xffffff, 0.9 * (1 - ph));
      g.fillCircle(x, cy, 7 - ph * 4);
      break;
    }
    case 'quantum': {
      // 量子：两团概率云相位对转
      for (let s = 0; s < 2; s++) {
        const ang = now / (s ? -620 : 620);
        const px = x + Math.cos(ang) * 40;
        const py = cy + Math.sin(ang * 1.3) * 56;
        g.fillStyle(color, 0.16);
        g.fillCircle(px, py, 14);
        g.fillStyle(color, 0.85);
        g.fillCircle(px, py, 4);
      }
      break;
    }
    case 'laserscan': {
      // 激光：竖直扫描线来回横扫
      const sx = x + Math.sin(now / 700) * 44;
      g.lineStyle(2.5, color, 0.85);
      g.lineBetween(sx, cy - 70, sx, cy + 70);
      g.fillStyle(color, 0.22);
      g.fillRect(sx - 5, cy - 70, 10, 140);
      g.lineStyle(1.2, color, 0.25);
      g.strokeRect(x - 46, cy - 70, 92, 140);
      break;
    }
    case 'holo': {
      // 全息：闪烁的扫描框 + 角标
      const flick = 0.5 + 0.5 * Math.sin(now / 90);
      g.lineStyle(1.6, color, 0.4 + flick * 0.3);
      g.strokeRect(x - 34, cy - 62, 68, 124);
      g.fillStyle(color, 0.8);
      for (const [cx2, cy2] of [[-34, -62], [34, -62], [-34, 62], [34, 62]] as const) {
        g.fillRect(x + cx2 - 3, cy + cy2 - 3, 6, 6);
      }
      g.fillStyle(color, 0.25);
      g.fillRect(x - 34, cy + 58 - ((now / 8) % 120), 68, 4);
      break;
    }
    case 'crystalline': {
      // 结晶：从脚下缓缓长出的晶簇
      for (let k = 0; k < 7; k++) {
        const ph = (now / 2400 + k / 7) % 1;
        const px = x + (k - 3) * 12;
        const h = 14 + (k % 3) * 10;
        const grow = Math.min(1, ph * 2);
        g.fillStyle(color, 0.55 + 0.3 * (1 - ph));
        g.fillTriangle(px - 4, cy + 62, px + 4, cy + 62, px, cy + 62 - h * grow);
      }
      break;
    }
    case 'wisteria': {
      // 紫藤：垂下的花串轻摆
      for (let k = 0; k < 6; k++) {
        const px = x + (k - 2.5) * 14;
        const swayW = Math.sin(now / 650 + k) * 4;
        const lenW = 26 + (k % 3) * 12;
        g.lineStyle(2, color, 0.35);
        g.lineBetween(px, cy - 40, px + swayW, cy - 40 + lenW);
        for (let s = 1; s <= 3; s++) {
          g.fillStyle(s % 2 ? color : 0xe8d8ff, 0.75 - s * 0.12);
          g.fillEllipse(px + (swayW * s) / 3, cy - 40 + (lenW * s) / 3, 6, 4);
        }
      }
      break;
    }
    case 'coral': {
      // 珊瑚：分叉的珊瑚枝 + 冒出的气泡
      g.lineStyle(3, color, 0.85);
      g.lineBetween(x, cy + 60, x, cy + 30);
      g.lineBetween(x, cy + 42, x - 14, cy + 22);
      g.lineBetween(x, cy + 36, x + 16, cy + 14);
      g.lineBetween(x - 14, cy + 22, x - 18, cy + 8);
      g.lineBetween(x + 16, cy + 14, x + 20, cy + 2);
      for (let k = 0; k < 4; k++) {
        const ph = (now / 1100 + k / 4) % 1;
        g.fillStyle(0xbfe8ff, 0.6 * (1 - ph));
        g.fillCircle(x + Math.sin(k * 2.1) * 18, cy + 10 - ph * 50, 2 + ph * 2);
      }
      break;
    }
    case 'beacon': {
      // 信标：旋转的灯塔光束
      const ang = now / 1400;
      for (const off of [0, Math.PI]) {
        g.fillStyle(color, 0.22);
        g.beginPath();
        g.moveTo(x, cy);
        g.lineTo(x + Math.cos(ang + off - 0.2) * 70, cy + Math.sin(ang + off - 0.2) * 40);
        g.lineTo(x + Math.cos(ang + off + 0.2) * 70, cy + Math.sin(ang + off + 0.2) * 40);
        g.closePath();
        g.fillPath();
      }
      g.fillStyle(color, 0.95);
      g.fillCircle(x, cy, 4.5);
      break;
    }
    case 'spiral': {
      // 螺旋星系：旋臂上的星点缓慢旋转
      for (let k = 0; k < 16; k++) {
        const arm = k % 2;
        const t = Math.floor(k / 2) / 8;
        const ang = t * 5 + now / 2400 + arm * Math.PI;
        const rr = 8 + t * 46;
        g.fillStyle(t % 2 ? color : 0xffffff, 0.8 - t * 0.4);
        g.fillCircle(x + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 0.55, 2 - t);
      }
      g.fillStyle(0xfff2c4, 0.9);
      g.fillCircle(x, cy, 4);
      break;
    }
    case 'phantom': {
      // 幻影：重影忽隐忽现
      const ph = (now / 1800) % 1;
      const alpha = Math.sin(ph * Math.PI) * 0.3;
      g.fillStyle(color, alpha);
      g.fillEllipse(x - 16, cy, 26, 74);
      g.fillStyle(color, alpha * 0.7);
      g.fillEllipse(x + 18, cy + 6, 22, 66);
      g.lineStyle(1.5, color, alpha * 2);
      g.strokeEllipse(x - 16, cy, 26, 74);
      break;
    }
    case 'miasma': {
      // 瘴气：贴地翻涌的毒雾团
      for (let k = 0; k < 7; k++) {
        const ph = (now / 1700 + k / 7) % 1;
        const px = x + Math.sin(ph * 6 + k) * 38;
        const py = cy + 66 - ph * 14 - Math.abs(Math.sin(k * 1.3)) * 18;
        g.fillStyle(color, 0.22 * (1 - ph));
        g.fillCircle(px, py, 12 + ph * 10);
      }
      break;
    }
    case 'laurel': {
      // 桂冠：环绕的双排叶环
      g.lineStyle(2.5, color, 0.7);
      g.strokeEllipse(x, cy, 58, 130);
      for (let k = 0; k < 12; k++) {
        const ang = (k / 12) * Math.PI * 2 + now / 3600;
        const px = x + Math.cos(ang) * 29;
        const py = cy + Math.sin(ang) * 65;
        g.save();
        g.translateCanvas(px, py);
        g.rotateCanvas(ang + Math.PI / 2);
        g.fillStyle(color, 0.9);
        g.fillEllipse(0, 0, 9, 4.5);
        g.restore();
      }
      break;
    }
    case 'emberfall': {
      // 落烬：熄灭前明灭的余烬坠落
      for (let k = 0; k < 9; k++) {
        const ph = (now / 1500 + k / 9) % 1;
        const tw = 0.5 + 0.5 * Math.sin(now / 120 + k * 2.4);
        g.fillStyle(k % 2 ? color : 0xffd07a, (1 - ph) * 0.8 * tw);
        g.fillCircle(x + Math.sin(k * 2.7 + now / 400) * 34, cy - 60 + ph * 130, 2.2);
      }
      break;
    }
    case 'static': {
      // 静电：随机闪现的噪声短线
      for (let k = 0; k < 8; k++) {
        const seed = Math.sin(now / 47 + k * 7.3);
        if (seed > 0.2) {
          const px = x + Math.sin(k * 12.9 + Math.floor(now / 47)) * 36;
          const py = cy + ((k * 53) % 120) - 60;
          g.lineStyle(1.6, color, 0.8);
          g.lineBetween(px, py, px + Math.sign(seed) * 8, py + seed * 6);
        }
      }
      break;
    }
    case 'tidalwave': {
      // 怒涛：环绕的浪头卷起
      for (let k = 0; k < 3; k++) {
        const ph = (now / 1900 + k / 3) % 1;
        const wx = x + Math.cos(ph * Math.PI * 2) * 42;
        const wy = cy + Math.sin(ph * Math.PI * 2) * 24;
        g.fillStyle(color, 0.7 - k * 0.15);
        g.beginPath();
        g.moveTo(wx - 12, wy + 8);
        g.lineTo(wx, wy - 14 - k * 3);
        g.lineTo(wx + 12, wy + 8);
        g.closePath();
        g.fillPath();
      }
      g.lineStyle(1.6, 0xffffff, 0.3);
      g.strokeEllipse(x, cy + 18, 84, 20);
      break;
    }
    case 'sandstorm': {
      // 沙暴：横掠的沙流
      for (let k = 0; k < 10; k++) {
        const ph = (now / 900 + k / 10) % 1;
        const px = x - 44 + ph * 88;
        const py = cy - 50 + ((k * 37) % 110) + Math.sin(now / 200 + k) * 4;
        g.fillStyle(k % 3 ? color : 0xc09040, 0.5 * Math.sin(ph * Math.PI));
        g.fillEllipse(px, py, 8, 2.5);
      }
      break;
    }
    case 'auroraring': {
      // 极光环：竖直光幕绕体旋转
      for (let k = 0; k < 6; k++) {
        const ang = now / 1600 + (k / 6) * Math.PI * 2;
        const px = x + Math.cos(ang) * 36;
        const sx = 1 - Math.abs(px - x) / 36;
        g.fillStyle(k % 2 ? color : 0x9ad4ff, 0.12 + 0.3 * sx);
        g.fillRect(px - 4, cy - 62, 8, 124);
      }
      break;
    }
    case 'singularity': {
      // 奇点：压缩后弹开的脉冲环
      const ph = (now / 1300) % 1;
      const rr = 6 + ph * 60;
      g.fillStyle(0x0a0614, 0.8);
      g.fillCircle(x, cy, 6);
      g.lineStyle(2.5, color, (1 - ph) * 0.9);
      g.strokeEllipse(x, cy, rr, rr * 1.5);
      g.lineStyle(1.2, color, (1 - ph) * 0.4);
      g.strokeEllipse(x, cy, rr * 0.7, rr * 1.1);
      break;
    }
    case 'rebirth': {
      // 涅槃：升腾的火鸟虚影
      const ph = (now / 2000) % 1;
      const rise = ph * 90;
      g.fillStyle(color, 0.5 * (1 - ph));
      g.beginPath();
      g.moveTo(x, cy + 40 - rise);
      g.lineTo(x - 20, cy + 55 - rise + Math.sin(now / 120) * 5);
      g.lineTo(x - 6, cy + 52 - rise);
      g.lineTo(x + 20, cy + 58 - rise - Math.sin(now / 120) * 5);
      g.lineTo(x, cy + 50 - rise);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xffd45c, 0.6 * (1 - ph));
      g.fillCircle(x, cy + 46 - rise, 4);
      break;
    }
    case 'spotlight': {
      // 训练聚光灯：一束从头顶打下来的暖光，微微摆动
      const swayA = Math.sin(now / 900) * 0.08;
      const topX = x + Math.sin(now / 900) * 20;
      for (let k = 0; k < 2; k++) {
        const spread = 34 + k * 16;
        g.fillStyle(0xfff0c0, 0.1 - k * 0.03);
        g.beginPath();
        g.moveTo(topX - 10, cy - 90);
        g.lineTo(topX + 10, cy - 90);
        g.lineTo(x + spread + swayA * 40, cy + 70);
        g.lineTo(x - spread + swayA * 40, cy + 70);
        g.closePath();
        g.fillPath();
      }
      g.fillStyle(0xfff6d8, 0.5 + 0.2 * pulse);
      g.fillCircle(topX, cy - 90, 6);
      break;
    }
    case 'shardglow': {
      // 碎晶光环：一圈碎晶绕身缓转，中间一层淡光
      const a0 = now / 1600;
      g.fillStyle(color, 0.1 + 0.08 * pulse);
      g.fillEllipse(x, cy, 58, 74);
      for (let k = 0; k < 7; k++) {
        const a = a0 + (k / 7) * Math.PI * 2;
        const px = x + Math.cos(a) * 30;
        const py = cy + Math.sin(a) * 42;
        const s = 3.4 + Math.sin(a) * 1.4;
        g.save();
        g.translateCanvas(px, py);
        g.rotateCanvas(a + Math.PI / 2);
        g.fillStyle(k % 2 ? color : 0xffffff, 0.9);
        g.fillTriangle(0, -s, s * 0.6, s * 0.7, -s * 0.6, s * 0.7);
        g.restore();
      }
      break;
    }
    case 'dranebula': {
      // 龙星云气：身周一团紫金色的星云，几颗星子在云里游
      for (let k = 0; k < 4; k++) {
        const a = now / 1900 + (k / 4) * Math.PI * 2;
        g.fillStyle(k % 2 ? color : 0xffd45c, 0.1);
        g.fillEllipse(x + Math.cos(a) * 20, cy + Math.sin(a) * 26, 40, 30);
      }
      g.lineStyle(2, color, 0.35 + 0.2 * pulse);
      g.strokeEllipse(x, cy, 62, 78);
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 2 + now / 1500;
        g.fillStyle(0xfff2b0, 0.5 + 0.4 * Math.sin(now / 240 + k));
        g.fillCircle(x + Math.cos(a) * (24 + (k % 3) * 7), cy + Math.sin(a) * (32 + (k % 2) * 8), 1.6 + (k % 2));
      }
      break;
    }
    case 'warp': {
      // 曲速信标：三圈由下往上收束的幽绿光波 + 中心一盏信标灯
      for (let k = 0; k < 3; k++) {
        const ph = (now / 1400 + k / 3) % 1;
        g.lineStyle(3 - k * 0.6, color, (1 - ph) * 0.75);
        g.strokeEllipse(x, cy + 62 - ph * 150, 60 + k * 14, 20 + k * 5);
      }
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + now / 2000;
        g.fillStyle(color, 0.5 + 0.4 * Math.sin(now / 260 + k));
        g.fillCircle(x + Math.cos(a) * 34, cy + Math.sin(a) * 46, 1.8);
      }
      g.fillStyle(0xffffff, 0.5 + 0.35 * pulse);
      g.fillCircle(x, cy, 5);
      break;
    }
    case 'dorsal': {
      // 背鳍光焰：绕身一周的哥式背鳍，尖端窜着原子蓝的火苗
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + now / 1400;
        const px = x + Math.cos(a) * 30;
        const py = cy + Math.sin(a) * 40;
        const tipX = px + Math.cos(a) * 13;
        const tipY = py + Math.sin(a) * 15 - 4;
        g.fillStyle(0x2c5f68, 0.95);
        g.fillTriangle(px - 5, py, px + 5, py, tipX, tipY);
        g.fillStyle(0x8fe0ff, 0.5 + 0.35 * Math.sin(now / 180 + k));
        g.fillTriangle(px - 2.4, py - 2, px + 2.4, py - 2, tipX, tipY);
      }
      break;
    }
    default:
      break;
  }
}

/** wings; the silhouette is chosen by the wing's kind, not just its colour */
export function drawWings(g: Phaser.GameObjects.Graphics, now: number, x: number, topY: number, cos: Cosmetic): void {
  const shape = WING_SHAPE[cos.wings];
  const color = WING_COLORS[cos.wings];
  if (!shape || shape.feathers === 0) return;
  const speed = 90 - shape.feathers * 6;
  const flap = Math.sin(now / speed) * 0.35;
  const baseY = topY + 48;
  const step = shape.len / (shape.feathers + 1);

  if (shape.kind === 'feather') {
    for (const dir of [-1, 1]) {
      for (let k = 0; k < shape.feathers; k++) {
        const len = shape.len - k * step;
        const ang = -Math.PI / 2 + dir * (shape.spread + flap + k * 0.22);
        const tipX = x + Math.cos(ang) * len;
        const tipY = baseY + Math.sin(ang) * len;
        const nx = x + dir * shape.w;
        g.fillStyle(color, 0.92 - k * 0.14);
        g.fillTriangle(nx, baseY - 12, nx, baseY + 12, tipX, tipY);
      }
    }
    return;
  }

  for (const dir of [-1, 1]) {
    switch (shape.kind) {
      case 'turbo': {
        // 涡轮双翼：金属机翼 + 一圈旋转的涡轮叶片
        const ang = -Math.PI / 2 + dir * (0.35 + flap * 0.4);
        const tipX = x + Math.cos(ang) * shape.len;
        const tipY = baseY + Math.sin(ang) * shape.len;
        g.fillStyle(color, 0.9);
        g.fillTriangle(x + dir * 6, baseY - 14, x + dir * 6, baseY + 12, tipX, tipY);
        g.fillStyle(0xdfe8ff, 0.9);
        g.fillTriangle(x + dir * 6, baseY - 14, x + dir * 6, baseY - 2, tipX, tipY);
        // 涡轮：绕翼根转的小叶片
        for (let k = 0; k < 3; k++) {
          const a = now / 120 + (k / 3) * Math.PI * 2;
          g.fillStyle(0xffb03a, 0.85);
          g.fillCircle(x + dir * 10 + Math.cos(a) * 7, baseY - 4 + Math.sin(a) * 4, 2.2);
        }
        break;
      }
      case 'membrane': {
        g.fillStyle(color, 0.85);
        g.beginPath();
        g.moveTo(x, baseY - 14);
        for (let k = 0; k < shape.feathers; k++) {
          const len = shape.len - k * step;
          const ang = -Math.PI / 2 + dir * (shape.spread + flap + k * 0.24);
          g.lineTo(x + Math.cos(ang) * len, baseY + Math.sin(ang) * len);
        }
        g.lineTo(x, baseY + 16);
        g.closePath();
        g.fillPath();
        g.lineStyle(2, color, 0.9);
        g.strokePath();
        break;
      }
      case 'butterfly': {
        for (let k = 0; k < shape.feathers; k++) {
          const wobble = Math.sin(now / speed + k) * 0.2;
          g.fillStyle(color, 0.85 - k * 0.2);
          g.fillEllipse(
            x + dir * (shape.w + 12 + k * 12),
            baseY - shape.len * 0.4 + Math.abs(wobble) * 10,
            shape.len * 0.95,
            shape.len * (0.72 - k * 0.15),
          );
        }
        break;
      }
      case 'mech': {
        for (let k = 0; k < shape.feathers; k++) {
          const ang = -Math.PI / 2 + dir * (shape.spread + flap + k * 0.26);
          g.fillStyle(color, 0.9 - k * 0.16);
          g.save();
          g.translateCanvas(x + dir * shape.w, baseY);
          g.rotateCanvas(ang + Math.PI / 2);
          g.fillRect(0, -shape.w / 2, shape.len - k * step, shape.w);
          g.restore();
        }
        break;
      }
      case 'crystal': {
        for (let k = 0; k < shape.feathers; k++) {
          const len = shape.len - k * step;
          const ang = -Math.PI / 2 + dir * (shape.spread + flap + k * 0.24);
          const cx2 = x + Math.cos(ang) * len;
          const cy2 = baseY + Math.sin(ang) * len;
          const s = 12 - k * 2;
          g.fillStyle(color, 0.85 - k * 0.12);
          g.fillTriangle(cx2, cy2 - s, cx2 + s * 0.7, cy2, cx2, cy2 + s);
          g.fillTriangle(cx2, cy2 - s, cx2 - s * 0.7, cy2, cx2, cy2 + s);
        }
        break;
      }
      case 'flame': {
        for (let k = 0; k < shape.feathers; k++) {
          const len = shape.len - k * step;
          const wob = Math.sin(now / 110 + k + dir) * 0.12;
          const ang = -Math.PI / 2 + dir * (shape.spread + flap + k * 0.22 + wob);
          const nx = x + dir * shape.w;
          g.fillStyle(k % 2 ? 0xffd07a : color, 0.9 - k * 0.12);
          g.fillTriangle(nx, baseY - 10, nx, baseY + 12, x + Math.cos(ang) * len, baseY + Math.sin(ang) * len);
        }
        break;
      }
      case 'blade': {
        for (let k = 0; k < shape.feathers; k++) {
          const len = shape.len - k * step;
          const ang = -Math.PI / 2 + dir * (shape.spread + flap + k * 0.24);
          const tipX = x + Math.cos(ang) * len;
          const tipY = baseY + Math.sin(ang) * len;
          const nx = x + dir * shape.w;
          g.fillStyle(color, 0.95 - k * 0.12);
          g.fillTriangle(nx, baseY - 5, nx, baseY + 5, tipX, tipY);
          g.lineStyle(1.5, 0xffffff, 0.5);
          g.lineBetween(nx, baseY, tipX, tipY);
        }
        break;
      }
      case 'leaf': {
        for (let k = 0; k < shape.feathers; k++) {
          const ang = -Math.PI / 2 + dir * (shape.spread + flap + k * 0.22);
          const len = shape.len - k * step;
          g.fillStyle(color, 0.88 - k * 0.12);
          g.save();
          g.translateCanvas(x + Math.cos(ang) * len, baseY + Math.sin(ang) * len);
          g.rotateCanvas(ang + Math.PI / 2);
          g.fillEllipse(0, 0, 26, 10);
          g.restore();
        }
        break;
      }
      case 'fin': {
        g.fillStyle(color, 0.85);
        g.beginPath();
        g.moveTo(x, baseY - 16);
        for (let k = 0; k < shape.feathers; k++) {
          const ang = -Math.PI / 2 + dir * (shape.spread + flap * 0.6 + k * 0.3);
          const len = shape.len - k * step;
          g.lineTo(x + Math.cos(ang) * len, baseY + Math.sin(ang) * len);
          g.lineTo(x + dir * (shape.w + k * 4), baseY + 6 + k * 6);
        }
        g.closePath();
        g.fillPath();
        g.lineStyle(2, 0xffffff, 0.35);
        g.strokePath();
        break;
      }
      case 'ribbon': {
        for (let k = 0; k < shape.feathers; k++) {
          const off = k * step;
          g.lineStyle(5 - k * 0.6, color, 0.7 - k * 0.1);
          g.beginPath();
          for (let s = 0; s <= 8; s++) {
            const u = s / 8;
            const px = x + dir * (shape.w + off) + Math.sin(u * 4 + now / 160 + k) * 6;
            const py = baseY - Math.sin(u * 1.6) * (shape.len + off);
            if (s === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.strokePath();
        }
        break;
      }
      case 'spike': {
        for (let k = 0; k < shape.feathers; k++) {
          const ang = -Math.PI / 2 + dir * (shape.spread + flap * 0.5 + k * 0.24);
          const len = shape.len - k * step;
          const bx = x + dir * shape.w;
          g.fillStyle(color, 0.9 - k * 0.1);
          g.fillTriangle(bx - 3, baseY + 8, bx + 3, baseY + 8, x + Math.cos(ang) * len, baseY + Math.sin(ang) * len);
        }
        break;
      }
      case 'sail': {
        const lift = Math.sin(now / 700) * 4;
        g.fillStyle(color, 0.85);
        g.beginPath();
        g.moveTo(x + dir * shape.w * 0.2, baseY - 40 + lift);
        g.lineTo(x + dir * (shape.w + shape.len * 0.5), baseY - 10 + lift);
        g.lineTo(x + dir * (shape.w + shape.len * 0.3), baseY + 22 + lift);
        g.lineTo(x + dir * shape.w * 0.2, baseY + 10);
        g.closePath();
        g.fillPath();
        g.lineStyle(2, 0xffffff, 0.35);
        g.strokePath();
        break;
      }
      case 'ghost': {
        // 幽翼：半透明波边灵体，缓缓呼吸
        const breathe = Math.sin(now / 500) * 0.08;
        g.fillStyle(color, 0.4);
        g.beginPath();
        g.moveTo(x, baseY - 16);
        for (let s = 0; s <= 6; s++) {
          const u = s / 6;
          const ang = -Math.PI / 2 + dir * (shape.spread + u * 1.4 + breathe);
          const len = shape.len * (1 - u * 0.25);
          g.lineTo(x + Math.cos(ang) * len, baseY + Math.sin(ang) * len);
        }
        g.lineTo(x, baseY + 18);
        g.closePath();
        g.fillPath();
        g.lineStyle(1.6, color, 0.55);
        g.strokePath();
        break;
      }
      case 'circuit': {
        // 电路翼：直角走线 + 节点光点
        for (let k = 0; k < shape.feathers; k++) {
          const len = shape.len - k * step;
          const seg = len / 3;
          const bx = x + dir * shape.w;
          const by = baseY - 6 + k * 7;
          g.lineStyle(2, color, 0.9 - k * 0.15);
          g.lineBetween(bx, by, bx + dir * seg, by);
          g.lineBetween(bx + dir * seg, by, bx + dir * seg, by - seg);
          g.lineBetween(bx + dir * seg, by - seg, bx + dir * seg * 2, by - seg);
          g.lineBetween(bx + dir * seg * 2, by - seg, bx + dir * seg * 2, by - len * 0.6);
          const glow = 0.5 + 0.5 * Math.sin(now / 300 + k * 1.7 + dir);
          g.fillStyle(color, glow);
          g.fillCircle(bx + dir * seg * 2, by - len * 0.6, 2.6);
        }
        break;
      }
      default:
        break;
    }
  }
}

/** anything that can show the character's emoji face (a Phaser Text, usually) */
export interface FaceSink {
  setText(value: string): void;
  setPosition(x: number, y: number): void;
  setVisible(value: boolean): void;
}

export interface CharacterPose {
  /** horizontal centre */
  x: number;
  /** the feet — everything else is measured up from here */
  feetY: number;
  /** which way the character looks */
  facing: 1 | -1;
  /** body colour */
  color: number;
  /**
   * 仅 U熊：肚皮的果冻形变，0 = 静止，正数 = 被砸扁、负数 = 回弹鼓出。
   * 由场景的阻尼弹簧驱动（见 `GameScene.stepBelly`）。
   */
  belly?: number;
  /**
   * **横向移动强度**（0 = 站定，1 = 全速）。给「肉会动」的形象用：
   * U熊的肚子、老皮的钢铁屁股都靠它做「走路时一颤一颤地跳」。
   * `GameScene.drawPlayer` 按 `|vx| / PLAYER_SPEED` 算好传进来；不传 = 0。
   */
  move?: number;
}

export interface CharacterOpts {
  /** the soft ellipse on the floor; off while the character is airborne */
  shadow?: boolean;
  /** the emoji face is a Text object, so it has to be driven from outside */
  face?: FaceSink | null;
  /**
   * 帽子 / 宠物专用的高层画布：emoji 头是独立 Text（depth 高于身体 Graphics），
   * 帽子必须画在比它更高的层上才能压住头。不传就画回 g 里（单层渲染的场景）。
   */
  overG?: Phaser.GameObjects.Graphics | null;
}

/**
 * One character, painted back to front: shadow, aura, cape, wings, body, face,
 * headwear, pet.
 *
 * The racket is deliberately NOT drawn here: the match scene poses it from the
 * aim offset and the climb scene from a rigid-body angle, so each caller draws
 * its own.
 */
/**
 * 哥斯拉（「哥斯拉来袭」首杀奖励）：侧视的厚皮巨兽——三爪大脚与粗腿、甩到身后的
 * 带鳍长尾、一排从脖子排到屁股的锯齿背鳍、浅色腹甲、短胳膊，以及突出的吻部、
 * 上排牙与琥珀色竖瞳。配色与场景里那只 Boss（`GodzillaScene.drawGz`）同源，
 * 所以「自己变的」和「打的那只」看着是一族的。
 *
 * 全部围着 `x / feetY / topY` 画，尾巴与头跟着 `now` 轻轻摆/呼吸。
 */
function drawGodzilla(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const breathe = Math.sin(now / 520) * 1.2;
  const sway = Math.sin(now / 430);
  /** 背鳍的呼吸式发光（和场景里那只 Boss 一样泛原子蓝） */
  const glow = 0.25 + (Math.sin(now / 520) * 0.5 + 0.5) * 0.45;

  // 配色与 Boss（`GodzillaScene.drawGz`）同一族：背深腹浅的橄榄绿巨兽
  const body = 0x416f55;
  const dark = 0x2c4d3c;
  const deep = 0x1b3024;
  const belly = 0xa9cf95;
  const bellyDark = 0x83a874;
  const claw = 0xe8e4d0;
  const eye = 0xffc24a;

  /**
   * 枫叶状背鳍：根部压一层暗色、中间一片泛蓝、尖端亮白——
   * 三片叠起来才有「从背上长出来又发着光」的样子。
   */
  const spike = (sx: number, sy: number, s: number): void => {
    g.fillStyle(deep, 1);
    g.fillTriangle(sx - s * 0.72, sy + s * 0.34, sx + s * 0.72, sy + s * 0.34, sx + s * 0.05, sy - s * 0.92);
    g.fillStyle(0x7fc8f0, 0.2 + glow * 0.4);
    g.fillTriangle(sx - s * 0.5, sy + s * 0.26, sx + s * 0.5, sy + s * 0.26, sx + s * 0.05, sy - s * 0.74);
    g.fillStyle(0xeaf8ff, 0.18 + glow * 0.5);
    g.fillTriangle(sx - s * 0.2, sy + s * 0.12, sx + s * 0.22, sy + s * 0.12, sx + s * 0.05, sy - s * 0.5);
  };

  // ---- 尾巴：从屁股甩出去，越往后越细，贴地但尾尖微微抬起 ----
  const tailN = 8;
  for (let i = tailN; i >= 1; i--) {
    const t = i / tailN;
    const tx = x - f * (10 + 58 * t) + sway * 5 * t;
    const ty = feetY - 30 + 27 * t * t + sway * 2 * t;
    g.fillStyle(t > 0.5 ? dark : body, 1);
    g.fillCircle(tx, ty, 12.5 - 9.2 * t);
  }
  // 尾巴上的那几片鳍（越往尾尖越小）
  for (let k = 0; k < 3; k++) {
    const t = 0.26 + k * 0.24;
    spike(x - f * (10 + 58 * t) + sway * 5 * t, feetY - 30 + 27 * t * t - (10 - 6 * t), 8 - k * 1.4);
  }

  // ---- 远侧的手臂与腿（压深一档、往后错开，拉出前后关系；爪子被近侧挡住就不画）----
  g.fillStyle(deep, 1);
  g.fillRoundedRect(x - f * 32 - 7, feetY - 86, 14, 23, 6);
  g.fillEllipse(x - f * 36, feetY - 62, 20, 10);
  g.fillRoundedRect(x - f * 14 - 9, feetY - 40, 18, 38, 8);
  g.fillEllipse(x - f * 16, feetY - 4, 27, 9);

  // ---- 躯干：后侧深、前侧浅，胸口一排腹甲 ----
  g.fillStyle(deep, 1);
  g.fillEllipse(x - f * 6, feetY - 64 + breathe, 50, 86);
  g.fillStyle(body, 1);
  g.fillEllipse(x + f * 4, feetY - 66 + breathe, 46, 80);
  g.fillStyle(belly, 1);
  g.fillEllipse(x + f * 12, feetY - 62 + breathe, 26, 60);
  g.fillStyle(bellyDark, 0.9);
  for (let k = 0; k < 6; k++) {
    const bx = f > 0 ? x + 1 : x - 16;
    g.fillRoundedRect(bx, feetY - 92 + k * 11 + breathe, 14, 2.4, 1);
  }
  // 肩背的鳞纹
  g.fillStyle(deep, 0.4);
  for (let k = 0; k < 12; k++) {
    g.fillCircle(x - f * (6 + (k % 3) * 8), feetY - 98 + Math.floor(k / 3) * 10 + breathe, 1.7);
  }

  // ---- 背鳍：从脖子一路排到屁股 ----
  for (let k = 0; k < 6; k++) {
    spike(x - f * (13 + k * 1.6), feetY - 98 + k * 14 + breathe, 12.5 - k * 0.7);
  }

  // ---- 近侧的腿 + 三爪大脚 ----
  g.fillStyle(body, 1);
  g.fillRoundedRect(x + f * 3 - 10, feetY - 44, 21, 42, 9);
  g.fillEllipse(x + f * 5, feetY - 4, 30, 10);
  g.fillStyle(claw, 1);
  for (let k = 0; k < 3; k++) {
    const cx = x + f * 12 + f * k * 6;
    g.fillTriangle(cx, feetY - 9, cx + f * 10, feetY - 4, cx, feetY + 2);
  }

  // ---- 脖子 + 头（吻部朝前，一排牙）----
  g.fillStyle(dark, 1);
  g.fillRoundedRect(x + f * 2 - 9, feetY - 106, 18, 24, 7);
  g.fillStyle(body, 1);
  g.fillEllipse(x + f * 6, feetY - 96 + breathe, 34, 30);
  g.fillEllipse(x + f * 20, feetY - 92 + breathe, 30, 20);
  // 头后的小角（两只，错开一点）
  g.fillStyle(dark, 1);
  g.fillTriangle(x - f * 7, feetY - 104, x - f * 16, feetY - 114, x - f * 3, feetY - 101);
  g.fillTriangle(x - f * 2, feetY - 108, x - f * 8, feetY - 118, x + f * 3, feetY - 105);
  // 眉骨：压在眼睛上的暗色
  g.fillStyle(dark, 1);
  g.fillTriangle(
    x + f * 2,
    feetY - 107 + breathe,
    x + f * 20,
    feetY - 102 + breathe,
    x + f * 4,
    feetY - 96 + breathe,
  );
  // 嘴缝 + 上下两排牙 + 下巴
  g.fillStyle(deep, 1);
  g.fillEllipse(x + f * 17, feetY - 85 + breathe, 27, 6);
  g.fillStyle(0xfff6e0, 1);
  for (let k = 0; k < 4; k++) {
    const tx = x + f * 9 + f * k * 6;
    g.fillTriangle(tx, feetY - 88 + breathe, tx + f * 3.6, feetY - 88 + breathe, tx + f * 1.8, feetY - 80 + breathe);
    g.fillTriangle(tx + f * 2, feetY - 80 + breathe, tx + f * 5.6, feetY - 80 + breathe, tx + f * 3.8, feetY - 87 + breathe);
  }
  g.fillStyle(dark, 1);
  g.fillEllipse(x + f * 14, feetY - 77 + breathe, 21, 9);
  // 琥珀色竖瞳 + 高光 + 鼻孔
  g.fillStyle(eye, 1);
  g.fillEllipse(x + f * 12, feetY - 97 + breathe, 8, 10);
  g.fillStyle(deep, 1);
  g.fillRect(x + f * 12 - 1, feetY - 102 + breathe, 2, 10);
  g.fillStyle(0xffffff, 0.85);
  g.fillCircle(x + f * 10.4, feetY - 99.4 + breathe, 1.2);
  g.fillCircle(x + f * 31, feetY - 93 + breathe, 1.4);

  // ---- 近侧的短胳膊 + 三爪 ----
  g.fillStyle(body, 1);
  g.fillRoundedRect(x + f * 11 - 7, feetY - 92, 15, 23, 6);
  g.fillRoundedRect(x + f * 23 - 10, feetY - 80, 21, 13, 6);
  g.fillStyle(claw, 1);
  for (let k = 0; k < 3; k++) {
    const cx = x + f * 33 + f * k * 5;
    g.fillTriangle(cx, feetY - 78, cx + f * 8, feetY - 74, cx, feetY - 69);
  }
}

/**
 * 小黄龙（联名形象）：黄色圆滚滚的小恐龙——大头、呆萌圆眼、浅色圆肚、小短手短腿，
 * 头顶两个小圆角，身后一条粗尾巴，脸颊带腮红。
 */
function drawNailong(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const body = 0xffd93d;
  const bodyDark = 0xefb81e;
  const bodyDeep = 0xdda50f;
  const belly = 0xfff3bd;
  const ink = 0x3a2a06;

  // ---- 动态：一呼一吸 + 身体上下（越往下压得越扁，像一颗弹起来的团子）----
  const br = Math.sin(now / 520); // -1..1
  const bob = br * 1.8;
  const bodyCy = topY + 84 + bob;
  const bodyRx = 32 + br * 1.4;
  const bodyRy = 30 - br * 1.4;
  const headCy = topY + 36 + bob * 1.3;

  // ---- 尾巴：一串越甩越细的球，尾尖跟着时间左右摆 ----
  for (let i = 6; i >= 1; i--) {
    const t = i / 6;
    const tx = x - f * (16 + 30 * t);
    const ty = bodyCy + 10 + 8 * t + Math.sin(now / 430 - t * 3.4) * 7 * t;
    g.fillStyle(t > 0.45 ? bodyDeep : bodyDark, 1);
    g.fillCircle(tx, ty, 10.5 - 5.6 * t);
  }
  // 尾尖上一小块浅色
  g.fillStyle(belly, 0.9);
  g.fillCircle(x - f * 46, bodyCy + 18 + Math.sin(now / 430 - 3.4) * 7, 3);

  // ---- 远侧的手脚（压深一档，先画）----
  g.fillStyle(bodyDeep, 1);
  g.fillEllipse(x - f * 32, bodyCy + 2, 17, 14);
  g.fillRoundedRect(x - f * 11 - 8, pose.feetY - 26, 16, 26, 8);
  g.fillEllipse(x - f * 11, pose.feetY - 3, 23, 9);

  // ---- 圆胖身体 + 浅色圆肚 + 背上三颗小圆刺 ----
  g.fillStyle(body, 1);
  g.fillEllipse(x, bodyCy, bodyRx * 2, bodyRy * 2);
  g.fillStyle(belly, 1);
  g.fillEllipse(x, bodyCy + 6, 40, 43);
  g.fillStyle(bodyDark, 1);
  for (let k = 0; k < 3; k++) {
    const t = k / 2;
    const sx = x - f * (10 + t * 16);
    const sy = bodyCy - 24 + t * 14;
    g.fillTriangle(sx - 5, sy, sx + 5, sy, sx, sy - 10 + t * 2);
  }

  // ---- 近侧的腿：一脚一脚轻轻抬（跳跳的）----
  const lift = Math.max(0, Math.sin(now / 400)) * 3;
  g.fillStyle(body, 1);
  g.fillRoundedRect(x + f * 3 - 8, pose.feetY - 26 - lift, 16, 26 + lift, 8);
  g.fillEllipse(x + f * 5, pose.feetY - 3 - lift, 25, 10);
  g.fillStyle(bodyDark, 0.55);
  g.fillEllipse(x + f * 5, pose.feetY - 1 - lift, 15, 4);

  // ---- 近侧的小短手：跟着呼吸前后晃 ----
  const swing = Math.sin(now / 520 + 0.9) * 4;
  g.fillStyle(body, 1);
  g.fillEllipse(x + f * 29, bodyCy - 8 + swing, 18, 15);
  g.fillStyle(bodyDark, 1);
  g.fillCircle(x + f * 34, bodyCy - 5 + swing, 5.5);

  // ---- 大头（比身体还大的那种）----
  g.fillStyle(body, 1);
  g.fillCircle(x, headCy, 30);

  // ---- 头顶两只小耳朵：一前一后，跟着节奏一翘一翘 ----
  const flap = Math.sin(now / 380) * 0.16;
  const ear = (ex: number, ey: number, rot: number, dark: boolean): void => {
    g.save();
    g.translateCanvas(ex, ey);
    g.rotateCanvas(rot);
    g.fillStyle(dark ? bodyDark : body, 1);
    g.fillRoundedRect(-7, -9, 14, 18, 7);
    g.fillStyle(belly, dark ? 0.35 : 0.85);
    g.fillRoundedRect(-3.6, -5.6, 7.2, 11, 3.6);
    g.restore();
  };
  ear(x - f * 18, headCy - 30, -f * 0.34 - flap, true);
  ear(x + f * 16, headCy - 32, f * 0.2 + flap, false);

  // ---- 浅色口鼻 + 小鼻子 ----
  g.fillStyle(belly, 1);
  g.fillEllipse(x + f * 5, headCy + 15, 36, 23);
  g.fillStyle(ink, 0.85);
  g.fillEllipse(x + f * 14, headCy + 6, 9, 6);

  // ---- 呆萌大眼：两层高光 ----
  const eye = (ex: number): void => {
    g.fillStyle(ink, 1);
    g.fillCircle(ex, headCy - 7, 6.2);
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(ex + f * 1.8, headCy - 9.4, 2.5);
    g.fillCircle(ex - f * 1.5, headCy - 4.6, 1.2);
  };
  eye(x + f * 1);
  eye(x + f * 18);

  // ---- 腮红 ----
  g.fillStyle(0xffa8a8, 0.5);
  g.fillEllipse(x - f * 15, headCy + 9, 14, 9);
  g.fillEllipse(x + f * 28, headCy + 9, 14, 9);

  // ---- 张嘴笑 + 小舌头 ----
  g.fillStyle(0x8a3a2a, 1);
  g.fillEllipse(x + f * 5, headCy + 19, 16, 10);
  g.fillStyle(0xff8a8a, 1);
  g.fillEllipse(x + f * 5, headCy + 22, 10, 5);
}

/**
 * 冠军铠甲（荣誉商店 800）：金甲骑士——全罩头盔 + 红缨 + 桂冠，胸口一枚小奖杯纹章。
 */
function drawChampion(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const glow = 0.6 + 0.4 * Math.sin(now / 420);
  const gold = 0xffd45c;
  const goldDark = 0xc99a2e;
  const goldLight = 0xfff0b8;
  const steel = 0xcfd8e3;

  // 腿甲 + 靴
  g.fillStyle(goldDark, 1);
  g.fillRoundedRect(x - 15, pose.feetY - 34, 13, 34, 5);
  g.fillRoundedRect(x + 2, pose.feetY - 34, 13, 34, 5);
  g.fillStyle(gold, 1);
  g.fillEllipse(x - 8, pose.feetY - 2, 20, 9);
  g.fillEllipse(x + 8, pose.feetY - 2, 20, 9);

  // 胸甲
  g.fillStyle(gold, 1);
  g.fillRoundedRect(x - 24, topY + 34, 48, PLAYER_H - 58, 12);
  g.fillStyle(goldLight, 1);
  g.fillRoundedRect(x - 18, topY + 40, 36, 26, 8);
  // 奖杯纹章
  g.fillStyle(0xfff6d8, 1);
  g.fillRect(x - 9, topY + 44, 18, 4);
  g.fillRoundedRect(x - 7, topY + 48, 14, 9, 3);
  g.fillStyle(goldDark, 1);
  g.fillRect(x - 3, topY + 57, 6, 5);

  // 肩甲
  g.fillStyle(goldDark, 1);
  g.fillEllipse(x - f * 26, topY + 41, 26, 18);
  g.fillEllipse(x + f * 26, topY + 41, 26, 18);
  g.fillStyle(gold, 1);
  g.fillEllipse(x - f * 26, topY + 38, 20, 13);
  g.fillEllipse(x + f * 26, topY + 38, 20, 13);

  // 手臂 + 护手
  g.fillStyle(gold, 1);
  g.fillRoundedRect(x + f * 20 - 8, topY + 46, 16, 42, 8);
  g.fillStyle(steel, 1);
  g.fillCircle(x + f * 20, topY + 90, 10);

  // 头盔
  g.fillStyle(steel, 1);
  g.fillCircle(x, topY + 18, 17);
  g.fillStyle(0x8b98a8, 1);
  g.fillRoundedRect(x - 15, topY + 14, 30, 9, 3);
  g.fillStyle(0x2a3442, 1);
  g.fillRect(x - 11, topY + 17, 22, 3);
  // 红缨 + 桂冠
  g.fillStyle(0xd23b3b, 1);
  g.fillEllipse(x, topY + 2, 8, 13);
  g.fillStyle(gold, 1);
  g.fillEllipse(x - 15, topY + 8, 12, 7);
  g.fillEllipse(x + 15, topY + 8, 12, 7);
  // 金光
  g.lineStyle(2, gold, 0.35 * glow);
  g.strokeCircle(x, topY + 20, 24);
}

/**
 * 不灭凤凰（荣誉商店 1200）：浑身火羽的人形，背后一对燃翼，头顶三根冠羽，脚边火星飞舞。
 */
function drawPhoenix(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const flick = Math.sin(now / 130);
  const flame = 0xff6b2c;
  const flameLight = 0xffb03a;
  const core = 0xffe08a;

  // 燃翼
  g.fillStyle(flame, 0.85);
  g.fillTriangle(x - 6, topY + 40, x - f * 46, topY + 6 + flick * 4, x - f * 18, topY + 62);
  g.fillTriangle(x + 6, topY + 40, x + f * 46, topY + 6 - flick * 4, x + f * 18, topY + 62);
  g.fillStyle(flameLight, 0.8);
  g.fillTriangle(x - 4, topY + 44, x - f * 34, topY + 20 + flick * 3, x - f * 14, topY + 58);
  g.fillTriangle(x + 4, topY + 44, x + f * 34, topY + 20 - flick * 3, x + f * 14, topY + 58);

  // 腿
  g.fillStyle(flame, 1);
  g.fillRoundedRect(x - 14, pose.feetY - 32, 12, 32, 6);
  g.fillRoundedRect(x + 2, pose.feetY - 32, 12, 32, 6);

  // 躯干
  g.fillStyle(flame, 1);
  g.fillRoundedRect(x - 20, topY + 34, 40, PLAYER_H - 58, 12);
  g.fillStyle(flameLight, 1);
  g.fillRoundedRect(x - 12, topY + 42, 24, 30, 8);

  // 手臂
  g.fillStyle(flameLight, 1);
  g.fillRoundedRect(x + f * 18 - 8, topY + 46, 16, 42, 8);

  // 头 + 冠羽
  g.fillStyle(flame, 1);
  g.fillCircle(x, topY + 18, 15);
  g.fillStyle(core, 1);
  g.fillCircle(x, topY + 18, 9);
  for (let i = -1; i <= 1; i++) {
    g.fillStyle(i === 0 ? core : flameLight, 1);
    g.fillTriangle(
      x + i * 8,
      topY + 4,
      x + i * 13,
      topY - 16 + flick * 2,
      x + i * 4,
      topY + 2,
    );
  }
  g.fillStyle(0xfff2b0, 1);
  g.fillCircle(x + f * 7, topY + 17, 3);

  // 脚边火星
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + now / 600;
    g.fillStyle(flameLight, 0.35 + 0.4 * Math.sin(now / 200 + i));
    g.fillCircle(x + Math.cos(a) * 22, pose.feetY + Math.sin(a) * 4, 2.5);
  }
}

/**
 * 龙王（荣誉商店 1600）：青鳞龙人——金色龙角、身后甩动的龙尾，胸口一道金鳞纹。
 */
function drawDragonlord(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const scale = 0x2f9a78;
  const scaleDark = 0x1f6e56;
  const scaleLight = 0x7fe0c0;
  const gold = 0xffd45c;

  // 龙尾
  g.fillStyle(scaleDark, 1);
  g.fillEllipse(x - f * 40, pose.feetY - 26 + Math.sin(now / 340) * 3, 34, 16);
  g.fillStyle(gold, 1);
  g.fillTriangle(x - f * 56, pose.feetY - 32, x - f * 64, pose.feetY - 46, x - f * 48, pose.feetY - 30);

  // 腿
  g.fillStyle(scaleDark, 1);
  g.fillRoundedRect(x - 15, pose.feetY - 34, 13, 34, 5);
  g.fillRoundedRect(x + 2, pose.feetY - 34, 13, 34, 5);

  // 躯干 + 金鳞
  g.fillStyle(scale, 1);
  g.fillRoundedRect(x - 22, topY + 34, 44, PLAYER_H - 58, 12);
  g.fillStyle(scaleLight, 1);
  g.fillRoundedRect(x - 13, topY + 42, 26, 28, 8);
  g.fillStyle(gold, 0.9);
  for (let i = 0; i < 3; i++) g.fillCircle(x, topY + 52 + i * 12, 2.5);

  // 手臂 + 爪
  g.fillStyle(scale, 1);
  g.fillRoundedRect(x + f * 20 - 8, topY + 46, 16, 42, 8);
  g.fillStyle(0xd8e8e0, 1);
  g.fillCircle(x + f * 20, topY + 90, 9);

  // 头 + 吻部
  g.fillStyle(scale, 1);
  g.fillCircle(x, topY + 18, 16);
  g.fillStyle(scaleLight, 1);
  g.fillEllipse(x + f * 10, topY + 24, 20, 12);
  // 龙角
  g.fillStyle(gold, 1);
  g.fillTriangle(x - 12, topY + 6, x - 23, topY - 15, x - 4, topY + 2);
  g.fillTriangle(x + 12, topY + 6, x + 23, topY - 15, x + 4, topY + 2);
  // 鬃毛
  g.fillStyle(0xd23b3b, 1);
  g.fillEllipse(x - f * 14, topY + 12 + Math.sin(now / 260) * 2, 12, 18);
  // 眼
  g.fillStyle(gold, 1);
  g.fillCircle(x + f * 6, topY + 15, 3);
  g.fillStyle(0x1c1410, 1);
  g.fillCircle(x + f * 6.8, topY + 15, 1.4);

  // 龙气
  g.fillStyle(scaleLight, 0.14 + 0.08 * Math.sin(now / 500));
  g.fillCircle(x, topY + 30, 30);
}

/**
 * 发球机教练（发球机活动专属）：运动服 + 哨子 + 腕带，肚兜式上衣配条纹，
 * 手里那股「来，再练一筐球」的劲头全靠胸前的哨子表达。
 */
function drawCoach(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const shirt = 0x356a45;
  const shirtLight = 0x4f8a5f;
  const skin = 0xf0c9a0;
  const whistle = Math.sin(now / 300) > 0.86;

  // 腿 + 运动鞋
  g.fillStyle(0x2a3442, 1);
  g.fillRoundedRect(x - 14, pose.feetY - 32, 12, 32, 5);
  g.fillRoundedRect(x + 2, pose.feetY - 32, 12, 32, 5);
  g.fillStyle(0xf2f6ff, 1);
  g.fillEllipse(x - 8, pose.feetY - 2, 18, 8);
  g.fillEllipse(x + 8, pose.feetY - 2, 18, 8);
  // 条纹袜
  g.fillStyle(0xd42a3a, 1);
  g.fillRect(x - 14, pose.feetY - 18, 12, 3);
  g.fillRect(x + 2, pose.feetY - 18, 12, 3);

  // 运动服躯干 + 白条纹
  g.fillStyle(shirt, 1);
  g.fillRoundedRect(x - 22, topY + 34, 44, PLAYER_H - 58, 12);
  g.fillStyle(shirtLight, 1);
  g.fillRoundedRect(x - 13, topY + 40, 26, 30, 8);
  g.fillStyle(0xffffff, 0.85);
  g.fillRect(x - 22, topY + 40, 44, 3);
  g.fillRect(x - 22, topY + 46, 44, 2);

  // 手臂 + 腕带
  g.fillStyle(shirt, 1);
  g.fillRoundedRect(x + f * 20 - 8, topY + 46, 16, 40, 8);
  g.fillStyle(skin, 1);
  g.fillCircle(x + f * 20, topY + 90, 8);
  g.fillStyle(0xe8a33d, 1);
  g.fillRect(x + f * 20 - 6, topY + 78, 12, 4);

  // 头 + 鸭舌帽（同 coachcap 配色）
  g.fillStyle(skin, 1);
  g.fillCircle(x, topY + 18, 15);
  g.fillStyle(0x2f5d3a, 1);
  g.fillEllipse(x, topY + 6, 32, 14);
  g.fillStyle(0xd8cba0, 1);
  g.fillRect(x + f * 2, topY + 6, 16, 3);
  g.fillStyle(0x1c2430, 1);
  g.fillCircle(x + f * 6, topY + 20, 2.2);

  // 胸前哨子：吹的瞬间亮一下
  g.fillStyle(0xe8a33d, whistle ? 1 : 0.85);
  g.fillRoundedRect(x - 4, topY + 52, 9, 6, 2);
  g.fillStyle(0x8b5a2b, 1);
  g.fillRect(x - 3, topY + 44, 2, 8);
  if (whistle) {
    g.lineStyle(2, 0xffffff, 0.5);
    g.strokeCircle(x, topY + 55, 9 + Math.sin(now / 90) * 2);
  }
}

/**
 * U熊：敦实的熊，胸口有肌肉、肚子很大。
 *
 * 肚子的两套形变：
 * - **被打中**：`pose.belly` 那块阻尼弹簧（见 `GameScene.stepBelly`）让它变宽变扁、回弹再反过来，
 *   位置与模拟层「把球弹开」的肚皮圆（simulation.ts 的 `BELLY_R / BELLY_CY`）一致；
 * - **走路**：`pose.move` 越大，肚子抖得越厉害——两条腿一步一拍，全身小颠、肚子跟着颤，
 *   停下后只剩呼吸的起伏。
 */
function drawUBear(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const b = pose.belly ?? 0;
  const jog = pose.move ?? 0;
  const breathe = Math.sin(now / 620) * 1.2;
  // 走路：两步一拍（150ms）的上下颠 + 肚子独立颤抖
  const step = Math.abs(Math.sin(now / 150));
  const bounce = step * jog * 3;
  const wob = Math.sin(now / 130) * 3.6 * jog;
  const fy = (v: number): number => v - bounce;
  const fur = 0x8b5a2b;
  const furDark = 0x6f4620;
  const furLight = 0xa9703a;
  const belly = 0xf0cf9e;
  const bellyLight = 0xffe6c2;

  // 尾巴（左右摆，走动时摆得更急）
  const wag = Math.sin(now / 260) * 4 + Math.sin(now / 150) * 6 * jog;
  g.fillStyle(furDark, 1);
  g.fillEllipse(x - f * 24 - wag * 0.35, fy(pose.feetY - 44), 24, 18);

  // 腿（交替抬起）
  const lift = (k: number): number => Math.max(0, Math.sin(now / 150 + k * Math.PI)) * jog * 5;
  g.fillStyle(furDark, 1);
  g.fillRoundedRect(x - 16, fy(pose.feetY - 30) - lift(0), 14, 30, 7);
  g.fillRoundedRect(x + 2, fy(pose.feetY - 30) - lift(1), 14, 30, 7);

  // 后侧手臂（压在身体后面）
  g.fillStyle(furDark, 1);
  g.fillRoundedRect(x - f * 30 - 8, fy(topY + 46), 16, 46, 8);

  // 躯干
  g.fillStyle(fur, 1);
  g.fillRoundedRect(x - 26, fy(topY + 34), 52, PLAYER_H - 60, 16);

  // 胸肌（跟着颤）
  g.fillStyle(furLight, 1);
  g.fillEllipse(x - f * 11, fy(topY + 44) + wob * 0.15, 24, 16);
  g.fillEllipse(x + f * 11, fy(topY + 44) + wob * 0.15, 24, 16);

  // 大肚皮：被打的果冻形变（宽扁 ⇄ 窄高）+ 走路时的抖颤
  const rx = 26 * (1 + 0.42 * b) + breathe + wob * 0.7;
  const ry = 27 * (1 - 0.34 * b) - wob * 0.6;
  const cy = fy(topY + 66) + wob * 0.5;
  g.fillStyle(belly, 1);
  g.fillEllipse(x, cy, rx * 2, ry * 2);
  g.fillStyle(bellyLight, 1);
  g.fillEllipse(x, cy, rx * 1.34, ry * 1.18);
  // 肚皮上的 U（跟着肚皮一起抖）
  g.lineStyle(4, 0xffffff, 0.85);
  g.beginPath();
  g.arc(x, cy - 4, 9, 0, Math.PI, false, 0);
  g.strokePath();
  g.lineBetween(x - 9, cy - 4, x - 9, cy - 18);
  g.lineBetween(x + 9, cy - 4, x + 9, cy - 18);

  // 前侧手臂 + 二头肌 + 拳头
  g.fillStyle(fur, 1);
  g.fillRoundedRect(x + f * 22 - 9, fy(topY + 46), 18, 48, 9);
  g.fillStyle(furLight, 1);
  g.fillEllipse(x + f * 22, fy(topY + 56), 20, 16);
  g.fillStyle(fur, 1);
  g.fillCircle(x + f * 22, fy(topY + 94), 11);

  // 头
  g.fillStyle(fur, 1);
  g.fillCircle(x, fy(topY + 18), 17);
  // 耳朵
  g.fillCircle(x - 13, fy(topY + 4), 7);
  g.fillCircle(x + 13, fy(topY + 4), 7);
  g.fillStyle(furLight, 1);
  g.fillCircle(x - 13, fy(topY + 4), 3.6);
  g.fillCircle(x + 13, fy(topY + 4), 3.6);
  // 口鼻 + 鼻子
  g.fillStyle(belly, 1);
  g.fillEllipse(x + f * 6, fy(topY + 25), 20, 14);
  g.fillStyle(0x3a2a1c, 1);
  g.fillEllipse(x + f * 10, fy(topY + 21), 8, 6);
  // 眼睛
  g.fillStyle(0x2a1c12, 1);
  g.fillCircle(x + f * 3, fy(topY + 14), 2.6);
  g.fillCircle(x + f * 12, fy(topY + 13), 2.6);
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(x + f * 3.8, fy(topY + 13.2), 0.9);
  g.fillCircle(x + f * 12.8, fy(topY + 12.2), 0.9);
}

/**
 * 老皮：皮衣小人，hip 高度左右各挂一坨钢铁屁股（球弹上去是钢板反弹）。
 *
 * 两坨屁股**会跳**：静止时一上一下轻轻颠，走起来（`pose.move`）跳得又高又频，
 * 落地那下钢板还会被压扁一点——像俩铁球在腰上弹；帽顶那颗小铆钉球跟着一起颠。
 */
function drawLaopi(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const jog = pose.move ?? 0;
  const leather = 0x8b5a2b;
  const leatherDark = 0x6f4620;
  const leatherLight = 0xa9703a;
  const steel = 0xaab4c2;
  const steelDark = 0x5a6472;
  const steelLight = 0xe8f0f8;

  // 走动时全身跟着一颠一颠
  const bounce = Math.abs(Math.sin(now / 160)) * jog * 3;
  const fy = (v: number): number => v - bounce;

  // 两条短腿（藏在屁股后面）
  g.fillStyle(leatherDark, 1);
  g.fillRoundedRect(x - 13, fy(pose.feetY - 16), 10, 16, 4);
  g.fillRoundedRect(x + 3, fy(pose.feetY - 16), 10, 16, 4);

  // 两坨钢铁屁股：各自相位弹跳（走路时跳得更高更快、落地时压扁）
  for (const off of [-17, 17]) {
    const side = off < 0 ? 0 : 1;
    const period = jog > 0.12 ? 130 : 320; // 站着慢慢颠、走起来快节奏
    const jig = Math.max(0, Math.sin(now / period + side * Math.PI));
    const bx = x + off;
    const by = fy(pose.feetY - 26) - jig * (2 + 9 * jog);
    // 跳起来时鼓一点、落地时压扁
    const r = 18 + (jig - 0.5) * (1.4 + 3.4 * jog);
    g.fillStyle(steelDark, 1);
    g.fillCircle(bx, by, r);
    g.fillStyle(steel, 1);
    g.fillCircle(bx, by, r - 2.5);
    // 钢板斜高光
    g.fillStyle(steelLight, 0.85);
    g.fillEllipse(bx - 4, by - r * 0.28, r * 0.66, r * 0.33);
    // 四颗铆钉（跳起来时拧一点）
    g.fillStyle(steelDark, 1);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4 + jig * 0.5;
      g.fillCircle(bx + Math.cos(a) * r * 0.61, by + Math.sin(a) * r * 0.61, 1.6);
    }
    // 中心螺栓
    g.fillStyle(steelDark, 1);
    g.fillCircle(bx, by, 3);
    g.fillStyle(steelLight, 0.7);
    g.fillCircle(bx - 1, by - 1, 1.2);
  }

  // 躯干：皮衣（外深内亮两层当描边——Canvas2D 适配层没有 strokeRoundedRect）
  g.fillStyle(leatherDark, 1);
  g.fillRoundedRect(x - 20, fy(topY + 39), 40, PLAYER_H - 72, 11);
  g.fillStyle(leather, 1);
  g.fillRoundedRect(x - 19, fy(topY + 40), 38, PLAYER_H - 74, 10);
  // 缝线 + 拉链
  g.lineStyle(1.5, leatherLight, 0.8);
  g.lineBetween(x, fy(topY + 44), x, fy(pose.feetY - 42));
  for (let k = 0; k < 4; k++) {
    g.lineBetween(x - 15, fy(topY + 50 + k * 9), x - 8, fy(topY + 52 + k * 9));
    g.lineBetween(x + 8, fy(topY + 52 + k * 9), x + 15, fy(topY + 50 + k * 9));
  }
  // 腰带 + 金扣（压住屁股上方，跟着颠）
  g.fillStyle(0x3a2a1c, 1);
  g.fillRect(x - 19, fy(pose.feetY - 38), 38, 8);
  g.fillStyle(0xffd45c, 1);
  g.fillRect(x - 4, fy(pose.feetY - 39), 8, 10);

  // 手臂（走动时前后摆）
  const swing = Math.sin(now / 160) * 4 * jog;
  g.fillStyle(leather, 1);
  g.fillRoundedRect(x - f * 28 - 7, fy(topY + 46) + swing, 14, 42, 7);
  g.fillStyle(leatherDark, 1);
  g.fillCircle(x - f * 28, fy(topY + 88) + swing, 8);
  g.fillStyle(leather, 1);
  g.fillRoundedRect(x + f * 24 - 7, fy(topY + 46) - swing, 14, 42, 7);
  g.fillStyle(leatherDark, 1);
  g.fillCircle(x + f * 24, fy(topY + 88) - swing, 8);

  // 头：皮帽子 + 眯眯眼 + 缝嘴
  g.fillStyle(leather, 1);
  g.fillCircle(x, fy(topY + 18), 16);
  g.fillStyle(leatherDark, 1);
  g.fillRoundedRect(x - 16, fy(topY + 6), 32, 8, 4);
  g.fillStyle(0x2a1c12, 1);
  g.fillCircle(x + f * 4, fy(topY + 17), 2.2);
  g.fillCircle(x + f * 13, fy(topY + 17), 2.2);
  g.lineStyle(1.8, 0x2a1c12, 0.9);
  g.beginPath();
  g.arc(x + f * 8, fy(topY + 25), 4, 0.15 * Math.PI, 0.85 * Math.PI, false, 0);
  g.strokePath();
  // 帽顶的小铆钉球：呼吸 + 走路时颠得更高
  const bob = Math.sin(now / 620) * 0.8 + Math.abs(Math.sin(now / 160)) * jog * 2.5;
  g.fillStyle(leatherLight, 1);
  g.fillCircle(x, fy(topY + 4) - bob, 4);
}

/** 地环：角色脚下的装饰环（积分荣誉奖励），每个组别一种样式 */
export function drawRing(
  g: Phaser.GameObjects.Graphics,
  now: number,
  x: number,
  feetY: number,
  id: RingId,
): void {
  const color = RING_COLORS[id];
  if (id === 'none') return;
  const y = feetY - 3;
  // 新主题宝箱的地环：走 themeart 的通用画法
  const themeRing = THEME_RINGS[id];
  if (themeRing) {
    drawThemeRing(g, now, x, feetY, color, themeRing);
    return;
  }
  switch (id) {
    case 'shardring': {
      // 碎晶地环：碎晶围成的环，晶片慢慢转
      const a0 = now / 2200;
      g.lineStyle(2, color, 0.4);
      g.strokeEllipse(x, y, 48, 14);
      for (let k = 0; k < 8; k++) {
        const a = a0 + (k / 8) * Math.PI * 2;
        const px = x + Math.cos(a) * 24;
        const py = y + Math.sin(a) * 7;
        const s = 3 + Math.sin(a) * 1.2;
        g.fillStyle(k % 2 ? color : 0xffffff, 0.85);
        g.fillTriangle(px, py - s, px + s * 0.6, py + s * 0.7, px - s * 0.6, py + s * 0.7);
      }
      break;
    }
    case 'draring': {
      // 星渊地环：双环 + 一颗绕行的星渊龙珠
      const a = now / 800;
      g.lineStyle(2.5, color, 0.8);
      g.strokeEllipse(x, y, 56, 17);
      g.lineStyle(1.2, 0xffd45c, 0.5);
      g.strokeEllipse(x, y, 42, 12);
      g.fillStyle(0xffd45c, 0.95);
      g.fillCircle(x + Math.cos(a) * 28, y + Math.sin(a) * 8, 3.2);
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(x + Math.cos(a) * 28, y + Math.sin(a) * 8, 1.4);
      break;
    }
    case 'sprout': {
      // 新芽：绿环 + 两片嫩叶
      g.lineStyle(3, color, 0.85);
      g.strokeEllipse(x, y, 44, 14);
      g.fillStyle(color, 0.9);
      g.fillEllipse(x - 10, y - 8, 9, 5);
      g.fillEllipse(x + 10, y - 8, 9, 5);
      break;
    }
    case 'orbit': {
      // 轨道地环：一圈细轨 + 两颗绕地卫星，轨道面还在慢慢倾斜
      const tilt = Math.sin(now / 900) * 0.35;
      g.lineStyle(2.5, color, 0.8);
      g.strokeEllipse(x, y, 54, 16);
      g.lineStyle(1.2, 0xffffff, 0.45);
      g.strokeEllipse(x, y, 40, 11);
      for (let k = 0; k < 2; k++) {
        const a = now / 700 + k * Math.PI;
        const px = x + Math.cos(a) * 27;
        const py = y + Math.sin(a) * 8 + Math.sin(a + tilt) * 4;
        g.fillStyle(k % 2 ? 0xd8fff0 : color, 0.95);
        g.fillCircle(px, py, 2.6);
        g.fillStyle(color, 0.35);
        g.fillCircle(px, py, 5);
      }
      break;
    }
    case 'courtline': {
      // 场地标线：脚下画一圈球场边线 + 中线角标
      g.lineStyle(3, color, 0.85);
      g.strokeEllipse(x, y, 52, 16);
      g.lineStyle(2, color, 0.6);
      g.lineBetween(x, y - 8, x, y + 8);
      g.fillStyle(color, 0.5 + 0.2 * Math.sin(now / 500));
      g.fillEllipse(x - 26, y, 3, 10);
      g.fillEllipse(x + 26, y, 3, 10);
      break;
    }
    case 'bamboo': {
      // 青竹：竹节虚线环
      g.lineStyle(3, color, 0.8);
      for (let k = 0; k < 6; k++) {
        const a0 = (k / 6) * Math.PI * 2;
        g.beginPath();
        g.arc(x, y, 23, a0, a0 + 0.7, false, 0);
        g.strokePath();
      }
      break;
    }
    case 'dawn': {
      // 曙光：双层日环
      g.lineStyle(3.5, color, 0.9);
      g.strokeEllipse(x, y, 46, 15);
      g.lineStyle(1.6, 0xfff2c4, 0.7);
      g.strokeEllipse(x, y, 34, 10);
      break;
    }
    case 'gale': {
      // 疾风：三道旋转风弧（椭圆弧用路径点逼近）
      for (let k = 0; k < 3; k++) {
        const a0 = (k / 3) * Math.PI * 2 + now / 700;
        g.lineStyle(3, color, 0.85);
        g.beginPath();
        for (let s = 0; s <= 10; s++) {
          const a = a0 + (s / 10) * 1.4;
          const px = x + Math.cos(a) * 24;
          const py = y + Math.sin(a) * 8;
          if (s === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.strokePath();
      }
      break;
    }
    case 'rock': {
      // 磐石：六枚冰晶绕环
      g.lineStyle(2.5, color, 0.6);
      g.strokeEllipse(x, y, 46, 15);
      g.fillStyle(color, 0.95);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const px = x + Math.cos(a) * 23;
        const py = y + Math.sin(a) * 7.5;
        g.fillTriangle(px, py - 4, px + 3, py, px - 3, py);
      }
      break;
    }
    case 'blaze': {
      // 烈焰：紫环 + 跳动的火苗点
      g.lineStyle(3.5, color, 0.9);
      g.strokeEllipse(x, y, 46, 15);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + now / 500;
        const h = 3 + Math.abs(Math.sin(now / 160 + k)) * 4;
        g.fillStyle(0xc9a0ff, 0.9);
        g.fillEllipse(x + Math.cos(a) * 23, y + Math.sin(a) * 7.5 - h, 3, h);
      }
      break;
    }
    case 'sky': {
      // 苍穹：金辉双环 + 流转光点
      g.lineStyle(4, color, 0.95);
      g.strokeEllipse(x, y, 48, 16);
      g.lineStyle(1.6, 0xffffff, 0.6);
      g.strokeEllipse(x, y, 36, 11);
      for (let k = 0; k < 3; k++) {
        const a = now / 400 + (k / 3) * Math.PI * 2;
        g.fillStyle(0xfff2c4, 0.9);
        g.fillCircle(x + Math.cos(a) * 24, y + Math.sin(a) * 8, 1.8);
      }
      break;
    }
    case 'legend': {
      // 传奇：赤金三重环
      g.lineStyle(3.5, color, 0.95);
      g.strokeEllipse(x, y, 50, 17);
      g.lineStyle(2.5, 0xffd45c, 0.8);
      g.strokeEllipse(x, y, 38, 12);
      g.lineStyle(1.2, 0xffffff, 0.5);
      g.strokeEllipse(x, y, 28, 8);
      g.fillStyle(0xffd45c, 0.5 + 0.5 * Math.sin(now / 300));
      g.fillCircle(x, y, 2.5);
      break;
    }
  }
}

/**
 * 外星人（「外星人降临」活动专属）：细长的绿色躯体、两只吊梢大黑眼、头顶两根触角，
 * 脚下一圈反重力微光——和活动里那些从陨石里掉出来的同一族。
 */
/**
 * 星渊龙（宇宙龙域限定角色形象）：深紫色的龙身缀着星子，
 * 背后一对会扇的星翼，尾巴尖一点金光，眼睛是星云色的发光眼。
 */
export function drawCosmoDra(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const body = 0x3a2f6b;
  const belly = 0x8f7bff;
  const gold = 0xffd45c;
  const bob = Math.sin(now / 460) * 1.5;
  const flap = Math.sin(now / 180);

  // 后腿 + 龙爪
  g.fillStyle(body, 1);
  g.fillRoundedRect(x - 13, pose.feetY - 32, 10, 32, 4);
  g.fillRoundedRect(x + 3, pose.feetY - 32, 10, 32, 4);
  g.fillStyle(0x2a224e, 1);
  for (const s of [-1, 1]) {
    g.fillTriangle(x + s * 8 - 5, pose.feetY, x + s * 8 + 6, pose.feetY, x + s * 8 + 1, pose.feetY - 6);
  }

  // 尾巴：从身后甩出去，尾尖一点金光
  const wag = Math.sin(now / 300) * 6;
  g.fillStyle(body, 1);
  g.fillTriangle(x - f * 16, topY + 52, x - f * 16, topY + 78, x - f * 40 + wag, topY + 66);
  g.fillStyle(gold, 0.9);
  g.fillCircle(x - f * 40 + wag, topY + 66, 3.2);

  // 躯干 + 浅色腹甲（三道腹纹）
  g.fillStyle(body, 1);
  g.fillRoundedRect(x - 18, topY + 34, 36, PLAYER_H - 60, 12);
  g.fillStyle(belly, 1);
  g.fillRoundedRect(x - 10, topY + 44, 20, 30, 9);
  g.fillStyle(0x5a4a9a, 0.6);
  for (let k = 0; k < 3; k++) g.fillRect(x - 10, topY + 52 + k * 9, 20, 1.6);

  // 身上的星子
  for (let k = 0; k < 6; k++) {
    g.fillStyle(0xffffff, 0.4 + 0.4 * Math.sin(now / 300 + k));
    g.fillCircle(x - 14 + ((k * 53) % 28), topY + 38 + ((k * 37) % 44), 1.2);
  }

  // 星翼：背后一对，随呼吸扇
  for (const s of [-1, 1]) {
    g.save();
    g.translateCanvas(x + s * 14, topY + 40);
    g.rotateCanvas(s * (0.5 + flap * 0.25));
    g.fillStyle(0x5a4a9a, 0.95);
    g.fillTriangle(0, 0, s * 26, -18, s * 30, 4);
    g.fillStyle(0x8f7bff, 0.8);
    g.fillTriangle(0, 0, s * 24, -10, s * 26, 4);
    g.restore();
  }

  // 背鳍一排
  for (let k = 0; k < 4; k++) {
    g.fillStyle(0x5a4a9a, 1);
    g.fillTriangle(x - 10 + k * 7, topY + 36, x - 5 + k * 7, topY + 36, x - 8 + k * 7 + f * 2, topY + 26 - k);
  }

  // 龙头：吻部 + 金角 + 星云色的发光眼
  g.fillStyle(body, 1);
  g.fillEllipse(x + f * 2, topY + 16 + bob, 36, 32);
  g.fillStyle(belly, 1);
  g.fillEllipse(x + f * 8, topY + 22 + bob, 14, 10);
  for (const s of [-1, 1]) {
    g.fillStyle(gold, 1);
    g.fillTriangle(x + s * 7, topY + 2 + bob, x + s * 13, topY + 4 + bob, x + s * 12, topY - 10 + bob);
  }
  g.fillStyle(0x9fe8ff, 1);
  g.fillEllipse(x + f * 2 - 7, topY + 12 + bob, 7, 9);
  g.fillEllipse(x + f * 2 + 7, topY + 12 + bob, 7, 9);
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(x + f * 2 - 6, topY + 10 + bob, 1.6);
  g.fillCircle(x + f * 2 + 8, topY + 10 + bob, 1.6);
  g.fillStyle(0x241d45, 1);
  g.fillCircle(x + f * 12, topY + 20 + bob, 1.2);
}

export function drawAlien(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const skin = 0x6fe09a;
  const light = 0x9ceeb8;
  const bob = Math.sin(now / 480) * 1.5;

  // 细腿 + 分叉的脚
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x - 12, pose.feetY - 34, 9, 34, 4);
  g.fillRoundedRect(x + 3, pose.feetY - 34, 9, 34, 4);
  g.fillStyle(light, 1);
  g.fillEllipse(x - 8, pose.feetY - 1, 16, 6);
  g.fillEllipse(x + 8, pose.feetY - 1, 16, 6);

  // 躯干 + 胸口那盏呼吸的灯
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x - 18, topY + 36, 36, PLAYER_H - 62, 12);
  g.fillStyle(light, 1);
  g.fillRoundedRect(x - 10, topY + 44, 20, 26, 9);
  g.fillStyle(0xd8fff0, 0.5 + 0.35 * Math.sin(now / 420));
  g.fillCircle(x, topY + 56, 5);

  // 手臂 + 三根细指
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x + f * 16 - 7, topY + 44, 14, 40, 7);
  g.fillStyle(light, 1);
  g.fillCircle(x + f * 16, topY + 86, 7);
  g.fillStyle(skin, 1);
  for (let k = -1; k <= 1; k++) {
    g.fillRoundedRect(x + f * 16 + k * 4 - 1.5, topY + 90, 3, 9, 1.5);
  }

  // 大头 + 两只吊梢黑眼 + 一道小嘴
  g.fillStyle(skin, 1);
  g.fillEllipse(x, topY + 16 + bob, 38, 44);
  g.fillStyle(light, 1);
  g.fillEllipse(x - f * 5, topY + 24 + bob, 20, 22);
  g.fillStyle(0x0e1a14, 1);
  g.fillEllipse(x - 8, topY + 14 + bob, 13, 18);
  g.fillEllipse(x + 8, topY + 14 + bob, 13, 18);
  g.fillStyle(0xffffff, 0.85);
  g.fillCircle(x - 10, topY + 9 + bob, 2.4);
  g.fillCircle(x + 6, topY + 9 + bob, 2.4);
  g.fillStyle(0x2f6a4a, 1);
  g.fillRect(x - 4, topY + 30 + bob, 8, 2);

  // 两根触角，顶端一点幽光
  g.lineStyle(2, skin, 1);
  g.lineBetween(x - 8, topY - 4 + bob, x - 14, topY - 18 + bob);
  g.lineBetween(x + 8, topY - 4 + bob, x + 14, topY - 18 + bob);
  g.fillStyle(0xd8fff0, 0.9);
  g.fillCircle(x - 14, topY - 19 + bob, 3);
  g.fillCircle(x + 14, topY - 19 + bob, 3);

  // 脚下的反重力微光
  g.fillStyle(skin, 0.16 + 0.08 * Math.sin(now / 300));
  g.fillEllipse(x, pose.feetY + 2, 54, 12);
}

// ---- 金币商店那批低星形象（1~3★）------------------------------------------------
//
// 都是「看一眼就知道是什么」的简单剪影，靠三个小工具把动态做出来：
// 呼吸 / 摇摆都走 `pulse`，眨眼走 `blinkOpen`，眼睛走 `cuteEyes`——
// 所以它们不靠帧动画，也不需要贴图，跟其它形象一样只是一段绘制。

/** 周期脉冲：-1~1，用来做呼吸 / 摆动 / 弹跳的相位（`phase` 传 0~1 表示错开） */
function pulse(now: number, period: number, phase = 0): number {
  return Math.sin(((now % period) / period) * Math.PI * 2 + phase * Math.PI * 2);
}

/** 眨眼：1 = 睁着，中间的 0 = 闭上（每隔 `period` 眨一次，闭眼过程 `dur` 毫秒） */
function blinkOpen(now: number, period = 3400, dur = 170): number {
  const t = now % period;
  if (t < period - dur) return 1;
  return Math.abs(1 - ((t - (period - dur)) / dur) * 2);
}

/** 一对呆萌圆眼（左右对称 + 高光），`open` 用 `blinkOpen()` 传进来就是会眨的眼睛 */
function cuteEyes(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  offset: number,
  r: number,
  open: number,
  ink: number,
): void {
  for (const s of [-1, 1]) {
    const ex = cx + s * offset;
    if (open <= 0.12) {
      g.lineStyle(2.2, ink, 0.9);
      g.lineBetween(ex - r, cy, ex + r, cy);
      continue;
    }
    g.fillStyle(ink, 1);
    g.fillEllipse(ex, cy, r * 2, r * 2 * open);
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(ex + r * 0.34, cy - r * 0.4, r * 0.34);
  }
}

/** 果冻史莱姆（1★）：一坨会弹跳的青色果冻，落地压扁、弹起拉长 */
function drawSlime(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const t = pulse(now, 880); // 一上一下算一拍
  const land = Math.max(0, -t); // 触底的那半边
  const h = 96 * (1 - 0.16 * land);
  const w = 64 * (1 + 0.12 * land);
  const body = 0x63e0c4;
  const ink = 0x123a34;

  // 触地的一圈水痕
  g.fillStyle(body, 0.3);
  g.fillEllipse(x, feetY + 1, w * (1.02 + 0.06 * land), 9);

  // 果冻本体 + 左上高光 + 身体里那颗核
  g.fillStyle(body, 0.88);
  g.fillEllipse(x, feetY - h * 0.42, w, h * 0.86);
  g.fillStyle(0xffffff, 0.3);
  g.fillEllipse(x - f * 14, feetY - h * 0.62, 17, 11);
  g.fillStyle(0x2fae94, 0.5);
  g.fillEllipse(x + f * 3, feetY - h * 0.3, 19, 15);

  // 眼 + 笑 + 腮红
  cuteEyes(g, x, feetY - h * 0.56, 12, 4.6, blinkOpen(now), ink);
  g.lineStyle(2.4, ink, 0.8);
  g.beginPath();
  g.arc(x, feetY - h * 0.5, 7, Math.PI * 0.22, Math.PI * 0.78, false, 0);
  g.strokePath();
  g.fillStyle(0xff9db0, 0.45);
  g.fillEllipse(x - 21, feetY - h * 0.48, 10, 6);
  g.fillEllipse(x + 21, feetY - h * 0.48, 10, 6);
}

/** 仙人掌宝宝（1★）：花盆里的仙人掌，两条胳膊一上一下地摆，头顶小花跟着晃 */
function drawCactus(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const wob = pulse(now, 1500) * 1.8;
  const sway = pulse(now, 1200);
  const green = 0x4fa860;
  const greenDark = 0x3b8249;
  const ink = 0x1f3a24;

  // 花盆（土 + 盆身 + 盆沿）
  g.fillStyle(0xb9793f, 1);
  g.fillRoundedRect(x - 21, feetY - 26, 42, 26, 6);
  g.fillStyle(0x9a6330, 1);
  g.fillRect(x - 24, feetY - 31, 48, 8);
  g.fillStyle(0x6b4a26, 1);
  g.fillEllipse(x, feetY - 29, 40, 8);

  // 柱身 + 两条胳膊（一高一低、反向摆）
  g.fillStyle(green, 1);
  g.fillRoundedRect(x - 15 + wob, topY + 20, 30, PLAYER_H - 48, 14);
  g.fillStyle(greenDark, 1);
  g.fillRoundedRect(x - 33 + wob, topY + 36 + sway * 3, 14, 26, 7);
  g.fillRoundedRect(x - 33 + wob, topY + 52 + sway * 3, 22, 13, 6);
  g.fillStyle(green, 1);
  g.fillRoundedRect(x + 19 + wob, topY + 48 - sway * 3, 14, 26, 7);
  g.fillRoundedRect(x + 11 + wob, topY + 64 - sway * 3, 22, 13, 6);

  // 小刺
  g.lineStyle(1.4, 0xdcecc4, 0.85);
  for (let k = 0; k < 6; k++) {
    const yy = topY + 32 + k * 9;
    g.lineBetween(x - 15 + wob, yy, x - 22 + wob, yy - 3);
    g.lineBetween(x + 15 + wob, yy, x + 22 + wob, yy - 3);
  }

  // 头顶小花 + 脸
  g.fillStyle(0xff8ac0, 1);
  g.fillCircle(x + wob, topY + 13, 8.5);
  g.fillStyle(0xffe08a, 1);
  g.fillCircle(x + wob, topY + 13, 3.6);
  cuteEyes(g, x + wob, topY + 54, 9, 4.4, blinkOpen(now, 4000), ink);
  g.fillStyle(ink, 0.85);
  g.fillEllipse(x + wob, topY + 67, 12, 6);
  g.fillStyle(green, 0.55);
  g.fillEllipse(x + wob, topY + 62, 18, 3);
}

/** 蘑菇人（1★）：红伞白点 + 米色菌柄，伞盖一压一弹，孢子慢慢往上飘 */
function drawMushroom(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const br = pulse(now, 1100);
  const capY = topY + 40 + br * 2;
  const red = 0xe0503c;
  const redDark = 0xc43f2e;
  const stem = 0xf2e2c4;
  const ink = 0x4a3220;

  // 三个往上飘的孢子（不同高度、循环）
  for (let k = 0; k < 3; k++) {
    const t = ((now / 2600 + k / 3) % 1);
    const px = x + f * (k === 1 ? -26 : k === 2 ? 24 : -6);
    g.fillStyle(0xfff0c0, 0.55 * (1 - t));
    g.fillCircle(px, capY - 14 - t * 42, 3.2 - t * 1.4);
  }

  // 菌柄身体 + 两条小短腿
  g.fillStyle(0xdcc9a4, 1);
  g.fillRoundedRect(x - 12, feetY - 20, 10, 20, 5);
  g.fillRoundedRect(x + 2, feetY - 20, 10, 20, 5);
  g.fillStyle(stem, 1);
  g.fillRoundedRect(x - 21, topY + 44, 42, PLAYER_H - 62, 13);

  // 伞盖 + 白点
  g.fillStyle(redDark, 1);
  g.fillEllipse(x, capY + 8, 78, 26);
  g.fillStyle(red, 1);
  g.fillEllipse(x, capY, 78, 44);
  g.fillStyle(0xfff6e4, 0.95);
  g.fillCircle(x - 20, capY - 4, 7);
  g.fillCircle(x + 12, capY - 12, 8.4);
  g.fillCircle(x + 26, capY + 6, 5.4);
  g.fillCircle(x - 4, capY + 10, 4.4);

  // 脸
  cuteEyes(g, x, topY + 68, 9.4, 4.4, blinkOpen(now, 3000), ink);
  g.fillStyle(ink, 0.8);
  g.fillEllipse(x, topY + 80, 12, 6);
  g.fillStyle(0xffa8a8, 0.5);
  g.fillEllipse(x - 17, topY + 74, 10, 6);
  g.fillEllipse(x + 17, topY + 74, 10, 6);
}

/** 胖企鹅（2★）：黑白企鹅，一摇一摆地走，翅膀一开一合 */
function drawPenguin(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const feetY = pose.feetY;
  const f = pose.facing;
  const waddle = pulse(now, 780);
  const flap = pulse(now, 900);
  const ink = 0x28303c;
  const white = 0xf6f8fb;
  const beak = 0xffa63c;

  // 整个人（含脚）绕着脚底左右晃：走路的一摇一摆
  g.save();
  g.translateCanvas(pose.x, feetY);
  g.rotateCanvas(waddle * 0.055);

  // 蹼足
  g.fillStyle(beak, 1);
  g.fillEllipse(-8, -4, 22, 9);
  g.fillEllipse(9, -4, 22, 9);

  // 身体 + 白肚 + 尾巴
  g.fillStyle(ink, 1);
  g.fillEllipse(-f * 12, -38, 22, 26);
  g.fillEllipse(0, -46, 58, 78);
  g.fillStyle(white, 1);
  g.fillEllipse(0, -40, 38, 56);

  // 翅膀：一开一合（前翅往外张，后翅小一点）
  g.fillStyle(ink, 1);
  g.save();
  g.translateCanvas(-13, -56);
  g.rotateCanvas(-0.25 - flap * 0.35);
  g.fillEllipse(0, 12, 14, 34);
  g.restore();
  g.save();
  g.translateCanvas(13, -56);
  g.rotateCanvas(f * (0.25 + flap * 0.35));
  g.fillEllipse(0, 12, 14, 34);
  g.restore();

  // 头 + 喙 + 眼（企鹅的眼睛本来就小，不用眨眼工具）
  g.fillStyle(ink, 1);
  g.fillEllipse(-f * 3, -86, 50, 46);
  g.fillStyle(white, 1);
  g.fillEllipse(-f * 12, -84, 26, 24);
  g.fillStyle(beak, 1);
  g.fillTriangle(-f * 24, -86, -f * 34, -82, -f * 24, -76);
  g.fillStyle(0x28303c, 1);
  g.fillCircle(-f * 12, -94, 3.4);
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(-f * 13, -95, 1.2);

  g.restore();
}

/** 呱呱蛙（2★）：蹲着的绿青蛙，腮帮一鼓一鼓，两只眼睛在头顶转 */
function drawFrog(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const br = pulse(now, 900);
  const look = pulse(now, 2600);
  const green = 0x5cbf4a;
  const greenDark = 0x429138;
  const ink = 0x1c3a12;

  // 后腿（蹲姿：大腿 + 大脚蹼）
  g.fillStyle(greenDark, 1);
  g.fillEllipse(x - 22, feetY - 22, 26, 22);
  g.fillEllipse(x + 22, feetY - 22, 26, 22);
  g.fillStyle(green, 1);
  g.fillEllipse(x - 20, feetY - 4, 24, 9);
  g.fillEllipse(x + 20, feetY - 4, 24, 9);

  // 身体 + 白肚 + 鼓起来的腮
  g.fillStyle(green, 1);
  g.fillEllipse(x, topY + 74 + br * 1.2, 62, 62);
  g.fillStyle(0xf2f7d8, 1);
  g.fillEllipse(x, topY + 80, 40, 42);
  g.fillStyle(0xd8e8a0, 1);
  g.fillEllipse(x, topY + 62 + br * 3, 34, 16 + br * 4);

  // 前爪
  g.fillStyle(greenDark, 1);
  g.fillEllipse(x - f * 26, topY + 84, 12, 20);
  g.fillEllipse(x + f * 26, topY + 84, 12, 20);

  // 头顶两只鼓眼：眼珠会左右转
  g.fillStyle(green, 1);
  g.fillCircle(x - 15, topY + 30, 14);
  g.fillCircle(x + 15, topY + 30, 14);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(x - 15, topY + 30, 10);
  g.fillCircle(x + 15, topY + 30, 10);
  g.fillStyle(ink, 1);
  g.fillCircle(x - 15 + look * 3, topY + 31, 4.6);
  g.fillCircle(x + 15 + look * 3, topY + 31, 4.6);

  // 大嘴 + 腮红
  g.lineStyle(2.4, ink, 0.8);
  g.beginPath();
  g.arc(x, topY + 46, 16, Math.PI * 0.15, Math.PI * 0.85, false, 0);
  g.strokePath();
  g.fillStyle(0xff9db0, 0.42);
  g.fillEllipse(x - 24, topY + 50, 12, 7);
  g.fillEllipse(x + 24, topY + 50, 12, 7);
}

/** 小雪人（2★）：两个雪球 + 胡萝卜鼻，树枝手上下挥，身边飘着雪 */
function drawSnowman(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const wave = pulse(now, 1300);
  const snow = 0xffffff;
  const snowShade = 0xd7e4ef;
  const ink = 0x2a3442;
  const twig = 0x8a6238;

  // 飘雪：四颗不同高度的雪花循环往下落
  for (let k = 0; k < 4; k++) {
    const t = (now / 3000 + k / 4) % 1;
    const sx = x + (k % 2 ? 34 : -34) - (k % 3) * 8;
    g.fillStyle(snow, 0.75 * (1 - t * 0.7));
    g.fillCircle(sx, topY + 6 + t * 100, 2.6);
  }

  // 雪球身体（下大上小）+ 阴影侧
  g.fillStyle(snowShade, 1);
  g.fillEllipse(x, feetY - 28, 72, 60);
  g.fillStyle(snow, 1);
  g.fillEllipse(x, feetY - 31, 68, 56);
  g.fillStyle(snowShade, 1);
  g.fillEllipse(x + 6, topY + 62, 52, 46);
  g.fillStyle(snow, 1);
  g.fillEllipse(x, topY + 60, 48, 42);
  g.fillStyle(snow, 1);
  g.fillEllipse(x, topY + 26, 42, 38);

  // 树枝手 + 三根手指（跟着 `wave` 上下挥）
  for (const s of [-1, 1]) {
    const ay = topY + 58 - s * wave * 5;
    g.lineStyle(3.4, twig, 1);
    g.lineBetween(x + s * 20, topY + 62, x + s * 40, ay - 8);
    g.lineBetween(x + s * 40, ay - 8, x + s * 50, ay - 14);
    g.lineBetween(x + s * 40, ay - 8, x + s * 49, ay - 2);
    g.lineBetween(x + s * 40, ay - 8, x + s * 44, ay - 18);
  }

  // 纽扣 + 胡萝卜鼻 + 黑礼帽
  g.fillStyle(ink, 0.75);
  g.fillCircle(x, topY + 52, 2.6);
  g.fillCircle(x, topY + 66, 2.6);
  g.fillStyle(0xff8a3c, 1);
  g.fillTriangle(x - 2, topY + 26, x + 2, topY + 26, x, topY + 34);
  g.fillStyle(ink, 1);
  g.fillRect(x - 17, topY + 4, 34, 5);
  g.fillRoundedRect(x - 11, topY - 9, 22, 14, 3);

  // 眼 + 笑
  cuteEyes(g, x, topY + 22, 7.4, 3.4, blinkOpen(now, 4600), ink);
  g.fillStyle(ink, 0.8);
  for (let k = 0; k < 4; k++) g.fillCircle(x - 6 + k * 4, topY + 33, 1.6);
}

/** 小幽灵（2★）：半透明的布飘在半空，下摆一波一波，眼睛跟着心形腮红 */
function drawGhost(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const float = pulse(now, 1900);
  const ink = 0x2c3040;
  const cloth = 0xf2f6ff;
  const cy = topY + 52 + float * 3.4;

  // 身后的光晕
  g.fillStyle(0xbfd8ff, 0.16);
  g.fillEllipse(x, cy + 6, 76, 96);

  // 身体（上圆下摆）：下摆用一串三角做波浪，相位跟时间走
  g.fillStyle(cloth, 0.92);
  g.fillCircle(x, cy, 34);
  g.fillRect(x - 34, cy, 68, 34);
  for (let k = 0; k < 5; k++) {
    const bx = x - 34 + k * 17;
    const wave = Math.sin(now / 260 + k * 1.3) * 4;
    g.fillTriangle(bx, cy + 32, bx + 17, cy + 32, bx + 8.5, cy + 46 + wave);
  }

  // 两只飘起来的小手
  for (const s of [-1, 1]) {
    g.fillStyle(cloth, 0.85);
    g.fillEllipse(x + s * 36, cy + 6 + pulse(now, 1400, s > 0 ? 0.3 : 0.8) * 5, 15, 12);
  }

  // 眼（会眨）+ 心形腮红 + 小嘴
  cuteEyes(g, x, cy - 6, 12, 4.8, blinkOpen(now, 2900), ink);
  g.fillStyle(0xffa8c0, 0.5);
  g.fillCircle(x - 21, cy + 8, 5);
  g.fillCircle(x + 21, cy + 8, 5);
  g.fillStyle(ink, 0.7);
  g.fillEllipse(x, cy + 12, 9, 7);
  // 左下角那点「尾巴」的不透明感，让它不飘得没边
  g.fillStyle(cloth, 0.5);
  g.fillEllipse(x - f * 26, cy + 36 + Math.sin(now / 300) * 3, 22, 12);
}

/** 小机器人（3★）：方头方身，天线与胸口灯会闪，两只机械臂一前一后摆 */
function drawRobot(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const swing = pulse(now, 1100);
  const blink = 0.5 + 0.5 * Math.sin(now / 160); // 灯闪得快一点
  const metal = 0xb8c4d4;
  const metalDark = 0x8494a8;
  const ink = 0x25303e;
  const led = blink > 0.6 ? 0x6cf0c0 : 0x2f6f5a;

  // 悬浮微光（它没有脚，靠这个站住）
  g.fillStyle(0x6cf0c0, 0.12 + 0.08 * blink);
  g.fillEllipse(x, feetY - 2, 58, 14);

  // 两条小履带腿
  g.fillStyle(metalDark, 1);
  g.fillRoundedRect(x - 20, feetY - 24, 16, 24, 8);
  g.fillRoundedRect(x + 4, feetY - 24, 16, 24, 8);
  g.fillStyle(metal, 1);
  g.fillRoundedRect(x - 19, feetY - 22, 14, 20, 7);
  g.fillRoundedRect(x + 5, feetY - 22, 14, 20, 7);

  // 机械臂（两段式，一前一后）
  for (const s of [-1, 1]) {
    const a = swing * (s > 0 ? 1 : -1);
    g.fillStyle(metalDark, 1);
    g.fillRoundedRect(x + s * 24 - 5, topY + 52 + a * 3, 10, 26, 5);
    g.fillStyle(metal, 1);
    g.fillCircle(x + s * 24, topY + 80 + a * 4, 6.5);
  }

  // 躯干 + 胸口灯 + 指示灯排
  g.fillStyle(metalDark, 1);
  g.fillRoundedRect(x - 24, topY + 46, 48, PLAYER_H - 68, 9);
  g.fillStyle(metal, 1);
  g.fillRoundedRect(x - 21, topY + 49, 42, PLAYER_H - 74, 7);
  g.fillStyle(led, 0.95);
  g.fillCircle(x, topY + 62, 6);
  g.fillStyle(0x6cf0c0, 0.7);
  for (let k = 0; k < 3; k++) g.fillRect(x - 14 + k * 11, topY + 76, 7, 4);

  // 方脑袋 + 屏幕脸 + 天线
  g.fillStyle(metalDark, 1);
  g.fillRoundedRect(x - 23, topY + 6, 46, 40, 8);
  g.fillStyle(metal, 1);
  g.fillRoundedRect(x - 20, topY + 9, 40, 34, 6);
  g.fillStyle(ink, 0.92);
  g.fillRoundedRect(x - 16, topY + 14, 32, 24, 5);
  g.fillStyle(0x6cf0c0, 0.95);
  const eo = blinkOpen(now, 2200) > 0.5 ? 1 : 0.18;
  g.fillRect(x - 12, topY + 22, 8, 8 * eo);
  g.fillRect(x + 4, topY + 22, 8, 8 * eo);
  g.lineStyle(2.4, metalDark, 1);
  g.lineBetween(x, topY + 6, x, topY - 6);
  g.fillStyle(led, 1);
  g.fillCircle(x, topY - 8, 4);
  // 侧面的小耳朵（朝向那侧亮一点）
  g.fillStyle(metalDark, 1);
  g.fillRect(x + f * 22, topY + 20, 6, 12);
}

/** 小章鱼（3★）：紫粉色的圆头 + 八条（画五条）各自扭动的触手 */
function drawOctopus(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const z = pulse(now, 1600);
  const body = 0xc07ad8;
  const bodyDark = 0x9a55b8;
  const ink = 0x2e1638;
  const cy = topY + 46 + z * 2.6;

  // 触手：五条，各自不同相位地扭（上下两段弯）
  for (let k = 0; k < 5; k++) {
    const t = k / 4 - 0.5;
    const bx = x + t * 40;
    const ph = Math.sin(now / 300 + k * 1.1) * 9;
    g.fillStyle(k % 2 ? body : bodyDark, 1);
    g.fillRoundedRect(bx - 6, cy + 20, 12, 34, 6);
    g.fillCircle(bx + ph * 0.6, cy + 58, 7.5);
    // 触手内侧的吸盘
    g.fillStyle(0xffd6ee, 0.75);
    g.fillCircle(bx + ph * 0.18, cy + 34, 2.2);
    g.fillCircle(bx + ph * 0.42, cy + 48, 2.2);
  }

  // 头部（大圆 + 高光）
  g.fillStyle(body, 1);
  g.fillEllipse(x, cy, 74, 68);
  g.fillStyle(0xffffff, 0.22);
  g.fillEllipse(x - 18, cy - 16, 22, 14);

  // 大眼（眨眼比别的慢，显得慵懒）+ 腮红 + 小嘴
  cuteEyes(g, x, cy - 6, 15, 7.4, blinkOpen(now, 5200), ink);
  g.fillStyle(0xff9db0, 0.45);
  g.fillEllipse(x - 30, cy + 12, 12, 7);
  g.fillEllipse(x + 30, cy + 12, 12, 7);
  g.fillStyle(ink, 0.75);
  g.fillEllipse(x, cy + 16, 11, 7);
}

/** 团子熊猫（3★）：圆滚滚的黑白熊猫，抱着会摆的竹子 */
function drawPanda(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const topY = feetY - PLAYER_H;
  const br = pulse(now, 1400);
  const white = 0xf8f8f4;
  const ink = 0x2b2b33;
  const leaf = 0x6fbf5a;
  const cy = topY + 72 + br * 1.4;

  // 竹子（先画，抱在身上）：竹竿 + 两片会摆的叶
  const sway = pulse(now, 1800);
  g.lineStyle(6, 0x8fbf4a, 1);
  g.lineBetween(x + f * 20, feetY - 6, x + f * 34, topY + 34 + sway * 3);
  g.fillStyle(leaf, 1);
  g.fillEllipse(x + f * 44, topY + 34 + sway * 3, 22, 9);
  g.fillEllipse(x + f * 30, topY + 20 + sway * 3, 18, 8);

  // 后腿 + 身体
  g.fillStyle(ink, 1);
  g.fillEllipse(x - 16, feetY - 18, 26, 22);
  g.fillEllipse(x + 16, feetY - 18, 26, 22);
  g.fillStyle(white, 1);
  g.fillEllipse(x, cy, 62, 66);
  g.fillStyle(0xe8e8e0, 1);
  g.fillEllipse(x + f * 8, cy + 4, 40, 46);

  // 黑肩带 + 抱竹子的两只前爪
  g.fillStyle(ink, 1);
  g.fillEllipse(x - 28, cy - 4, 22, 18);
  g.fillEllipse(x + 28, cy - 4, 22, 18);
  g.fillCircle(x + f * 22, cy + 4, 8);

  // 头：白脸 + 两只黑耳 + 黑眼圈
  g.fillStyle(ink, 1);
  g.fillCircle(x - 19, topY + 24, 10.5);
  g.fillCircle(x + 19, topY + 24, 10.5);
  g.fillStyle(white, 1);
  g.fillEllipse(x, topY + 40, 60, 54);
  g.fillStyle(ink, 1);
  g.save();
  g.translateCanvas(x - 13, topY + 36);
  g.rotateCanvas(-0.3);
  g.fillEllipse(0, 0, 20, 15);
  g.restore();
  g.save();
  g.translateCanvas(x + 13, topY + 36);
  g.rotateCanvas(0.3);
  g.fillEllipse(0, 0, 20, 15);
  g.restore();

  // 眼圈里的眼睛（会眨）+ 鼻子 + 嘴
  cuteEyes(g, x, topY + 37, 13, 4, blinkOpen(now, 3600), white);
  g.fillStyle(ink, 1);
  g.fillEllipse(x, topY + 50, 11, 7);
  g.fillStyle(0xffffff, 0.85);
  g.fillEllipse(x, topY + 48.4, 5, 3);
}

// ======================= 主题宝箱专属形象（每个主题一款，见 game/chest.ts） =======================

/** 灯笼鱼（深海遗珍）：深海底的圆身子小鱼，头顶一根会晃的发光小灯笼 */
function drawAngler(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const body = 0x27455c;
  const fin = 0x3a6a88;
  const bob = Math.sin(now / 420) * 2;
  const glow = 0.7 + 0.3 * Math.sin(now / 240);
  // 尾鳍
  g.fillStyle(fin, 1);
  g.fillTriangle(x - f * 16, topY + 62, x - f * 34, topY + 48, x - f * 30, topY + 76);
  // 圆身子
  g.fillStyle(body, 1);
  g.fillEllipse(x, topY + 48 + bob, 54, 62);
  g.fillStyle(fin, 1);
  g.fillEllipse(x + f * 2, topY + 64 + bob, 26, 22);
  // 头顶的灯笼：一根杆 + 发光的球
  g.lineStyle(3, fin, 1);
  g.lineBetween(x + f * 4, topY + 22 + bob, x + f * 16, topY - 2 + bob);
  g.fillStyle(0xfff2a0, glow);
  g.fillCircle(x + f * 17, topY - 5 + bob, 6);
  g.fillStyle(0xffffff, glow);
  g.fillCircle(x + f * 17, topY - 5 + bob, 2.4);
  // 大嘴一排小尖牙 + 眼睛
  g.fillStyle(0x142a3a, 1);
  g.fillEllipse(x + f * 12, topY + 52 + bob, 18, 10);
  g.fillStyle(0xffffff, 1);
  for (let k = 0; k < 3; k++) g.fillCircle(x + f * 7 + k * 5, topY + 50 + bob, 1.6);
  g.fillStyle(0xd8f0ff, 1);
  g.fillCircle(x + f * 2, topY + 36 + bob, 4.6);
  g.fillStyle(0x10202c, 1);
  g.fillCircle(x + f * 3, topY + 36 + bob, 2.2);
}

/** 小木乃伊（幽夜万圣）：缠满绷带的小家伙，走起来绷带尾巴一飘一飘 */
function drawMummy(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const band = 0xe8e0cc;
  const shade = 0xcfc4a8;
  const bob = Math.sin(now / 520) * 1.6;
  // 腿（绷带缠的短腿）
  g.fillStyle(band, 1);
  g.fillRoundedRect(x - 12, pose.feetY - 26, 9, 26, 4);
  g.fillRoundedRect(x + 3, pose.feetY - 26, 9, 26, 4);
  // 身体 + 一道道缠痕
  g.fillStyle(band, 1);
  g.fillRoundedRect(x - 16, topY + 34, 32, PLAYER_H - 58, 10);
  g.fillStyle(shade, 1);
  for (let k = 0; k < 4; k++) g.fillRect(x - 16, topY + 42 + k * 11, 32, 2.4);
  // 飘出来的绷带尾巴
  const wag = Math.sin(now / 260) * 4;
  g.lineStyle(3, band, 0.95);
  g.lineBetween(x - f * 14, topY + 44, x - f * 30 + wag, topY + 30);
  // 圆头 + 两颗黑眼窝（一点幽光）
  g.fillStyle(band, 1);
  g.fillCircle(x, topY + 16 + bob, 17);
  g.fillStyle(shade, 1);
  g.fillRect(x - 17, topY + 12 + bob, 34, 2.2);
  g.fillStyle(0x1c1c24, 1);
  g.fillEllipse(x - 6, topY + 14 + bob, 7, 8);
  g.fillEllipse(x + 6, topY + 14 + bob, 7, 8);
  g.fillStyle(0x9fe8ff, 0.5 + 0.4 * Math.sin(now / 300));
  g.fillCircle(x - 6, topY + 14 + bob, 1.6);
  g.fillCircle(x + 6, topY + 14 + bob, 1.6);
}

/** 发条木偶（锈色机械）：背后一把会转的发条钥匙，眼睛是两颗灯珠 */
function drawWindup(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const body = 0xc9a05a;
  const joint = 0x8a6a3a;
  const tilt = Math.sin(now / 600) * 0.06;
  // 背后的发条钥匙（会转）
  g.save();
  g.translateCanvas(x - f * 20, topY + 44);
  g.rotateCanvas(now / 500);
  g.lineStyle(4, joint, 1);
  g.lineBetween(-8, 0, 8, 0);
  g.lineBetween(0, -8, 0, 8);
  g.lineBetween(-10, -6, -10, 6);
  g.restore();
  g.lineStyle(3, joint, 1);
  g.lineBetween(x - f * 14, topY + 44, x - f * 20, topY + 44);
  // 方木身子（微微左右晃）
  g.save();
  g.translateCanvas(x, topY + 56);
  g.rotateCanvas(tilt);
  g.fillStyle(body, 1);
  g.fillRoundedRect(-15, -22, 30, 44, 6);
  g.fillStyle(joint, 1);
  g.fillRect(-15, -2, 30, 3);
  g.restore();
  // 关节腿 + 圆头
  g.fillStyle(joint, 1);
  g.fillCircle(x - 8, pose.feetY - 14, 5);
  g.fillCircle(x + 8, pose.feetY - 14, 5);
  g.fillRect(x - 10, pose.feetY - 14, 4, 14);
  g.fillRect(x + 6, pose.feetY - 14, 4, 14);
  g.fillStyle(body, 1);
  g.fillCircle(x, topY + 14 + tilt * 40, 16);
  // 侧发的螺栓 + 灯珠眼睛（交替闪）
  g.fillStyle(joint, 1);
  g.fillCircle(x - 14, topY + 6, 3);
  g.fillCircle(x + 14, topY + 6, 3);
  const blink = Math.sin(now / 350) > 0;
  g.fillStyle(blink ? 0xfff2a0 : 0x6a4a2a, 1);
  g.fillCircle(x - 6, topY + 12, 3);
  g.fillStyle(blink ? 0x6a4a2a : 0xfff2a0, 1);
  g.fillCircle(x + 6, topY + 12, 3);
}

/** 皇家卫兵（皇家典藏）：红袍黑高帽，站得笔直，胸口一枚金扣 */
function drawGuard(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const coat = 0xc22a3a;
  const dark = 0x8a1a28;
  const bob = Math.sin(now / 700) * 0.8;
  // 黑裤黑鞋
  g.fillStyle(0x2a2a34, 1);
  g.fillRoundedRect(x - 12, pose.feetY - 26, 9, 26, 4);
  g.fillRoundedRect(x + 3, pose.feetY - 26, 9, 26, 4);
  // 红袍身子 + 金扣一排
  g.fillStyle(coat, 1);
  g.fillRoundedRect(x - 15, topY + 30, 30, PLAYER_H - 52, 8);
  g.fillStyle(0xffd45c, 1);
  for (let k = 0; k < 3; k++) g.fillCircle(x + f * 4, topY + 40 + k * 11, 2);
  g.fillStyle(dark, 1);
  g.fillRoundedRect(x + f * 8, topY + 30, 7, PLAYER_H - 52, 3);
  // 下巴一撮白胡子边（衣领）+ 黑高帽
  g.fillStyle(0xf3ede0, 1);
  g.fillRoundedRect(x - 10, topY + 28, 20, 5, 2);
  g.fillStyle(0x1c1c24, 1);
  g.fillRoundedRect(x - 12, topY - 12 + bob, 24, 22, 5);
  g.fillStyle(0x3a3a44, 1);
  g.fillRect(x - 12, topY + 4 + bob, 24, 5);
  // 一本正经的眼睛
  g.fillStyle(0x1c1c24, 1);
  g.fillCircle(x - 5, topY + 16 + bob, 1.8);
  g.fillCircle(x + 5, topY + 16 + bob, 1.8);
  g.fillStyle(0xc22a3a, 1);
  g.fillEllipse(x, topY + 22 + bob, 6, 3);
}

/** 樱团兔（樱吹雪）：粉白团子兔，耳朵随呼吸一颤一颤 */
function drawSakuraBun(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const body = 0xfdf0f4;
  const blush = 0xffb7d5;
  const br = pulse(now, 1300);
  const twitch = Math.sin(now / 300) * 0.08;
  // 两只长耳（会颤）
  for (const s of [-1, 1]) {
    g.save();
    g.translateCanvas(x + s * 10, topY + 8);
    g.rotateCanvas(s * (0.16 + twitch));
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(0, -14, 10, 34);
    g.fillStyle(blush, 1);
    g.fillEllipse(0, -14, 5, 24);
    g.restore();
  }
  // 团子身子
  g.fillStyle(body, 1);
  g.fillEllipse(x, topY + 46 + br * 1.2, 50, 56);
  g.fillCircle(x, topY + 16 + br * 1.2, 18);
  // 眼睛（会眨）+ 腮红 + 小嘴
  const open = blinkOpen(now, 3400);
  cuteEyes(g, x, topY + 14 + br * 1.2, 14, 3, open, 0x2b2b33);
  g.fillStyle(blush, 0.8);
  g.fillEllipse(x - 11, topY + 22 + br * 1.2, 8, 5);
  g.fillEllipse(x + 11, topY + 22 + br * 1.2, 8, 5);
  // 头顶一朵小樱花
  g.fillStyle(blush, 1);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + 0.3;
    g.fillCircle(x + Math.cos(a) * 5, topY - 4 + Math.sin(a) * 5, 3);
  }
  g.fillStyle(0xffd45c, 1);
  g.fillCircle(x, topY - 4, 2);
}

/** 小星灵（星海漫游）：一颗会飘的星星成了精，脚下没有腿、绕着两粒小星 */
function drawStarlet(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const glow = 0xffe9a8;
  const float = Math.sin(now / 460) * 3;
  const cy = topY + 44 + float;
  // 身体：五角星星（发光描边）
  g.fillStyle(glow, 0.25);
  g.fillCircle(x, cy, 30);
  g.fillStyle(glow, 1);
  for (let k = 0; k < 5; k++) {
    const a = -Math.PI / 2 + (k / 5) * Math.PI * 2;
    const a2 = a + Math.PI / 5;
    g.fillTriangle(
      x + Math.cos(a) * 20, cy + Math.sin(a) * 20,
      x + Math.cos(a + Math.PI / 5) * 8, cy + Math.sin(a + Math.PI / 5) * 8,
      x + Math.cos(a2) * 8, cy + Math.sin(a2) * 8,
    );
    g.fillTriangle(
      x + Math.cos(a) * 20, cy + Math.sin(a) * 20,
      x + Math.cos(a - Math.PI / 5) * 8, cy + Math.sin(a - Math.PI / 5) * 8,
      x + Math.cos(a - Math.PI / 10) * 8, cy + Math.sin(a - Math.PI / 10) * 8,
    );
  }
  // 眯眯眼 + 绕圈的两粒小星
  g.fillStyle(0x4a3a10, 1);
  g.fillCircle(x - 6, cy - 2, 2);
  g.fillCircle(x + 6, cy - 2, 2);
  for (const s of [0, Math.PI]) {
    const a = now / 400 + s;
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(x + Math.cos(a) * 34, cy + Math.sin(a) * 22, 2.2);
  }
}

/** 熔火精灵（烈焰熔炉）：一团小火焰成了精，头顶火苗呼呼蹿 */
function drawEmberling(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const body = 0xff7a2a;
  const core = 0xffd45c;
  const br = pulse(now, 900);
  const cy = topY + 44;
  // 火苗身体（两层：外焰内焰）
  g.fillStyle(body, 1);
  g.fillEllipse(x, cy, 46, 56 + br * 6);
  g.fillTriangle(x - 14, cy - 20, x + 14, cy - 20, x + Math.sin(now / 200) * 6, cy - 44 - br * 8);
  g.fillStyle(core, 1);
  g.fillEllipse(x, cy + 6, 26, 34);
  // 黑豆眼 + 得意的小嘴
  g.fillStyle(0x3a1408, 1);
  g.fillCircle(x - 7, cy - 4, 2.6);
  g.fillCircle(x + 7, cy - 4, 2.6);
  g.lineStyle(2, 0x3a1408, 1);
  g.strokeCircle(x, cy + 4, 4);
  // 脚下两撮小火星（跟着跳）
  g.fillStyle(core, 0.8);
  g.fillCircle(x - 12, pose.feetY - 4 - br * 3, 2.6);
  g.fillCircle(x + 13, pose.feetY - 6 - br * 2, 2.2);
}

/** 冰晶精灵（冰川秘境）：半透明的小雪精，头顶一根冰锥，身周飘雪 */
function drawIceSprite(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const body = 0xcfeaff;
  const ice = 0x8fd8ff;
  const float = Math.sin(now / 480) * 3;
  const cy = topY + 44 + float;
  // 身体（水滴形）+ 头顶冰锥
  g.fillStyle(body, 0.92);
  g.fillEllipse(x, cy, 40, 52);
  g.fillStyle(ice, 1);
  g.fillTriangle(x - 6, cy - 24, x + 6, cy - 24, x, cy - 44);
  // 眯眯眼 + 小圆腮
  g.fillStyle(0x2a4a5a, 1);
  g.fillEllipse(x - 7, cy - 4, 6, 3);
  g.fillEllipse(x + 7, cy - 4, 6, 3);
  g.fillStyle(ice, 0.7);
  g.fillCircle(x - 12, cy + 2, 3);
  g.fillCircle(x + 12, cy + 2, 3);
  // 绕身飘的四片雪花
  g.fillStyle(0xffffff, 0.95);
  for (let k = 0; k < 4; k++) {
    const a = now / 600 + (k / 4) * Math.PI * 2;
    g.fillCircle(x + Math.cos(a) * 26, cy + Math.sin(a) * 16, 2);
  }
}

/** 小猴子（丛林图腾）：棕毛小猴，尾巴卷成一个圈还会晃 */
function drawMonkey(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const fur = 0x8a5a34;
  const face = 0xe8c49a;
  const bob = Math.sin(now / 420) * 1.6;
  // 腿 + 身体
  g.fillStyle(fur, 1);
  g.fillRoundedRect(x - 11, pose.feetY - 24, 8, 24, 4);
  g.fillRoundedRect(x + 3, pose.feetY - 24, 8, 24, 4);
  g.fillRoundedRect(x - 15, topY + 34, 30, PLAYER_H - 58, 12);
  // 卷尾巴（末端画个圈，轻轻晃）
  const wag = Math.sin(now / 320) * 3;
  g.lineStyle(5, fur, 1);
  g.beginPath();
  g.moveTo(x - f * 14, topY + 44);
  g.lineTo(x - f * 28, topY + 30 + wag);
  g.strokePath();
  g.lineStyle(4, fur, 1);
  g.strokeCircle(x - f * 30, topY + 24 + wag, 6);
  // 浅色脸盘 + 两只圆耳
  g.fillStyle(fur, 1);
  g.fillCircle(x - 15, topY + 14 + bob, 6);
  g.fillCircle(x + 15, topY + 14 + bob, 6);
  g.fillCircle(x, topY + 16 + bob, 16);
  g.fillStyle(face, 1);
  g.fillEllipse(x, topY + 20 + bob, 22, 18);
  // 眼睛 + 咧嘴
  g.fillStyle(0x2b2b33, 1);
  g.fillCircle(x - 5, topY + 14 + bob, 2);
  g.fillCircle(x + 5, topY + 14 + bob, 2);
  g.lineStyle(2, 0x2b2b33, 1);
  g.strokeCircle(x, topY + 21 + bob, 4);
}

/** 霓虹猫（霓虹街头）：黑猫一身，戴着发光的霓虹项圈和条纹 */
function drawNeonCat(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const fur = 0x24242e;
  const neon = 0x39ffd0;
  const bob = Math.sin(now / 380) * 1.6;
  const glow = 0.6 + 0.4 * Math.sin(now / 260);
  // 猫尾巴（S 形甩）+ 腿
  g.lineStyle(6, fur, 1);
  g.beginPath();
  g.moveTo(x - f * 12, pose.feetY - 16);
  g.lineTo(x - f * 26, pose.feetY - 10);
  g.lineTo(x - f * 30, pose.feetY - 24 + Math.sin(now / 240) * 4);
  g.strokePath();
  g.fillStyle(fur, 1);
  g.fillRoundedRect(x - 11, pose.feetY - 20, 8, 20, 4);
  g.fillRoundedRect(x + 3, pose.feetY - 20, 8, 20, 4);
  g.fillRoundedRect(x - 14, topY + 36, 28, PLAYER_H - 60, 11);
  // 头 + 两只三角耳
  g.fillStyle(fur, 1);
  g.fillCircle(x, topY + 16 + bob, 16);
  g.fillTriangle(x - 14, topY + 8 + bob, x - 4, topY + 6 + bob, x - 12, topY - 6 + bob);
  g.fillTriangle(x + 14, topY + 8 + bob, x + 4, topY + 6 + bob, x + 12, topY - 6 + bob);
  // 霓虹条纹（额头）+ 项圈
  g.fillStyle(neon, glow);
  g.fillRect(x - 2, topY + 4 + bob, 4, 8);
  g.fillStyle(neon, 1);
  g.fillRoundedRect(x - 12, topY + 28 + bob, 24, 4, 2);
  // 眯眼 + 胡须
  g.fillStyle(neon, glow);
  g.fillEllipse(x - 6, topY + 16 + bob, 7, 4);
  g.fillEllipse(x + 6, topY + 16 + bob, 7, 4);
  g.lineStyle(1.5, 0xffffff, 0.7);
  g.lineBetween(x + f * 10, topY + 20 + bob, x + f * 20, topY + 18 + bob);
  g.lineBetween(x + f * 10, topY + 22 + bob, x + f * 20, topY + 24 + bob);
}

export function drawCharacter(
  g: Phaser.GameObjects.Graphics,
  now: number,
  cos: Cosmetic,
  pose: CharacterPose,
  opts: CharacterOpts = {},
): void {
  /** 默认小人的头顶（也是身体绘制的基准） */
  const topY = pose.feetY - PLAYER_H;
  /**
   * **装扮层**（帽子 / 翅膀 / 披风 / 宠物 / emoji 头）的基准高度。
   * 它按这只角色**真实的头顶**算（`SKIN_HEAD_H`），不是默认小人的 108——
   * 否则矮个子角色（史莱姆 / 蘑菇 / 小章鱼…）的帽子会飘在头顶上方、翅膀悬在半空。
   * 默认小人（`'none'`）与表里没写的形象仍然是 108，老装扮的落点完全不变。
   */
  const accTopY = pose.feetY - skinHeadH(cos.characterSkin);

  if (opts.shadow !== false) {
    if (cos.ring !== 'none') drawRing(g, now, pose.x, pose.feetY, cos.ring);
    g.fillStyle(P.shadow, 0.16);
    g.fillEllipse(pose.x, pose.feetY + 2, 46, 10);
  }

  if (cos.aura !== 'none') drawAura(g, now, pose.x, pose.feetY, cos.aura, AURA_COLORS[cos.aura]);
  if (cos.cape !== 'none') drawCape(g, now, pose.x, accTopY, cos.cape);
  if (cos.wings !== 'none') drawWings(g, now, pose.x, accTopY, cos);

  if (cos.characterSkin === 'ubear') {
    drawUBear(g, now, pose);
  } else if (cos.characterSkin === 'godzilla') {
    drawGodzilla(g, now, pose);
  } else if (cos.characterSkin === 'laopi') {
    drawLaopi(g, now, pose);
  } else if (cos.characterSkin === 'champion') {
    drawChampion(g, now, pose);
  } else if (cos.characterSkin === 'phoenix') {
    drawPhoenix(g, now, pose);
  } else if (cos.characterSkin === 'dragonlord') {
    drawDragonlord(g, now, pose);
  } else if (cos.characterSkin === 'nailong') {
    drawNailong(g, now, pose);
  } else if (cos.characterSkin === 'coach') {
    drawCoach(g, now, pose);
  } else if (cos.characterSkin === 'alien') {
    drawAlien(g, now, pose);
  } else if (cos.characterSkin === 'cosmodra') {
    drawCosmoDra(g, now, pose);
  } else if (cos.characterSkin === 'slime') {
    drawSlime(g, now, pose);
  } else if (cos.characterSkin === 'cactus') {
    drawCactus(g, now, pose);
  } else if (cos.characterSkin === 'mushroom') {
    drawMushroom(g, now, pose);
  } else if (cos.characterSkin === 'penguin') {
    drawPenguin(g, now, pose);
  } else if (cos.characterSkin === 'frog') {
    drawFrog(g, now, pose);
  } else if (cos.characterSkin === 'snowman') {
    drawSnowman(g, now, pose);
  } else if (cos.characterSkin === 'ghost') {
    drawGhost(g, now, pose);
  } else if (cos.characterSkin === 'robot') {
    drawRobot(g, now, pose);
  } else if (cos.characterSkin === 'octopus') {
    drawOctopus(g, now, pose);
  } else if (cos.characterSkin === 'panda') {
    drawPanda(g, now, pose);
  } else if (cos.characterSkin === 'angler') {
    drawAngler(g, now, pose);
  } else if (cos.characterSkin === 'mummy') {
    drawMummy(g, now, pose);
  } else if (cos.characterSkin === 'windup') {
    drawWindup(g, now, pose);
  } else if (cos.characterSkin === 'guard') {
    drawGuard(g, now, pose);
  } else if (cos.characterSkin === 'sakurabun') {
    drawSakuraBun(g, now, pose);
  } else if (cos.characterSkin === 'starlet') {
    drawStarlet(g, now, pose);
  } else if (cos.characterSkin === 'emberling') {
    drawEmberling(g, now, pose);
  } else if (cos.characterSkin === 'icesprite') {
    drawIceSprite(g, now, pose);
  } else if (cos.characterSkin === 'monkey') {
    drawMonkey(g, now, pose);
  } else if (cos.characterSkin === 'neoncat') {
    drawNeonCat(g, now, pose);
  } else {
    // 新主题宝箱的专属形象：10 个主题各一只独立造型的神怪（见 themeart.ts）
    const themeSkin = THEME_SKIN_ART[cos.characterSkin];
    if (themeSkin) {
      themeSkin(g, now, pose);
    } else {
      g.fillStyle(pose.color, 1);
      g.fillRoundedRect(pose.x - 14, topY + 26, 28, PLAYER_H - 26, 10);
    }
  }

  // 坐骑：画在身体**之上**（坐上 / 钻进坐骑里时，坐骑会压住腿脚才对），
  // 跟着角色跑跳，纯装饰——只有帽子与宠物（overG，depth 4）还在它上面。
  if (cos.mount !== 'none') drawMount(g, now, cos.mount, pose);

  // 整头替换的头饰（飞碟头盔 / 各种面具）：头盔自己就是头，emoji 脸不画
  const headOff = replacesHead(cos.hat) ? FULL_HEAD_DY : 0;

  if (cos.characterSkin !== 'none') {
    // 整只角色都换掉了，emoji 头就不画了
    opts.face?.setVisible(false);
  } else if (headOff) {
    opts.face?.setVisible(false);
  } else if (cos.emoji && opts.face) {
    const face = opts.face;
    face.setText(cos.emoji);
    face.setPosition(pose.x, accTopY + 17);
    face.setVisible(true);
  } else {
    g.fillStyle(P.skin, 1);
    g.fillCircle(pose.x, accTopY + 16, 13);
  }

  // 帽子 / 宠物画在「头之上」的层（overG），没给就退回单层渲染
  const over = opts.overG ?? g;
  // headOff > 0 时把头饰往下挪到原来那颗头的位置（见 FULL_HEAD_DY）；
  // `now` 传下去，新增那批会动的头饰（风车 / 蜜蜂 / 灯泡…）才动得起来
  if (cos.hat !== 'none') drawHat(over, pose.x, accTopY + headOff, cos.hat, now);
  if (cos.pet !== 'none') {
    drawPet(over, now, pose.x, accTopY, pose.facing < 0 ? 1 : 0, cos.pet, cos.petStar);
  }
}
