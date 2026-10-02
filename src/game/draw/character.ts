import Phaser from 'phaser';
import {
  AURA_COLORS,
  CAPE_COLORS,
  CAPE_SHAPE,
  HAT_COLORS,
  HAT_KIND,
  PET_COLORS,
  PET_KIND,
  RING_COLORS,
  WING_COLORS,
  WING_SHAPE,
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
  }
}

/** a headpiece drawn just above the player's head */
export function drawHat(g: Phaser.GameObjects.Graphics, x: number, topY: number, id: HatId): void {
  const color = HAT_COLORS[id];
  const hy = topY + 4;
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
 * The streak-100 Godzilla form: chunky scaled body, dorsal spikes, a tail and
 * a little head with eyes, all drawn in the character's footprint.
 */
function drawGodzilla(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const bob = Math.sin(now / 400) * 1.5;
  const body = 0x3a7d44;
  const dark = 0x2c5f34;
  const belly = 0x9cc48e;

  // tail sweeping behind
  const tailDir = -pose.facing;
  g.fillStyle(body, 1);
  g.fillEllipse(pose.x + tailDir * 26, pose.feetY - 8 + bob, 40, 14);
  g.fillEllipse(pose.x + tailDir * 46, pose.feetY - 12 + bob, 26, 9);

  // dorsal spikes down the back
  g.fillStyle(0xf2e7c9, 1);
  for (let i = 0; i < 4; i++) {
    const sx = pose.x + tailDir * (8 + i * 12);
    const sy = topY + 34 + i * 6 + bob;
    g.fillTriangle(sx, sy - 9, sx - 4, sy + 3, sx + 4, sy + 3);
  }

  // body
  g.fillStyle(body, 1);
  g.fillRoundedRect(pose.x - 16, topY + 24, 32, PLAYER_H - 24, 9);
  g.fillStyle(belly, 1);
  g.fillRoundedRect(pose.x - 8, topY + 40, 16, PLAYER_H - 46, 6);

  // head
  g.fillStyle(body, 1);
  g.fillRoundedRect(pose.x - 15, topY + 2, 30, 26, 8);
  g.fillStyle(dark, 1);
  g.fillEllipse(pose.x - pose.facing * 4, topY + 20, 22, 9); // jaw
  g.fillStyle(0xffe27a, 1);
  g.fillCircle(pose.x + pose.facing * 6, topY + 12, 3); // eyes
  g.fillCircle(pose.x + pose.facing * 12, topY + 11, 3);
  g.fillStyle(0x1c2a1c, 1);
  g.fillCircle(pose.x + pose.facing * 6, topY + 12, 1.4);
  g.fillCircle(pose.x + pose.facing * 12, topY + 11, 1.4);
}

/**
 * 小黄龙（联名形象）：黄色圆滚滚的小恐龙——大头、呆萌圆眼、浅色圆肚、小短手短腿，
 * 头顶两个小圆角，身后一条粗尾巴，脸颊带腮红。
 */
function drawNailong(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const bob = Math.sin(now / 520) * 1.4;
  const body = 0xffd93d;
  const bodyDark = 0xefb81e;
  const belly = 0xfff3bd;
  const ink = 0x3a2a06;
  const bodyCy = topY + PLAYER_H - 26 + bob;

  // 粗尾巴
  g.fillStyle(bodyDark, 1);
  g.fillEllipse(x - f * 32, bodyCy + 12, 36, 18);
  g.fillStyle(body, 1);
  g.fillEllipse(x - f * 28, bodyCy + 10, 26, 13);

  // 两条小短腿
  g.fillStyle(bodyDark, 1);
  g.fillRoundedRect(x - 18, pose.feetY - 24, 16, 24, 8);
  g.fillRoundedRect(x + 2, pose.feetY - 24, 16, 24, 8);

  // 圆胖身体 + 浅色圆肚
  g.fillStyle(body, 1);
  g.fillEllipse(x, bodyCy, 64, 62);
  g.fillStyle(belly, 1);
  g.fillEllipse(x, bodyCy + 6, 42, 44);

  // 小短手
  g.fillStyle(body, 1);
  g.fillEllipse(x - f * 28, bodyCy - 8, 18, 15);
  g.fillEllipse(x + f * 28, bodyCy - 8, 18, 15);
  g.fillStyle(bodyDark, 1);
  g.fillCircle(x - f * 33, bodyCy - 5, 5);
  g.fillCircle(x + f * 33, bodyCy - 5, 5);

  // 大头 + 头顶两个小圆角
  const headCy = topY + 32 + bob;
  g.fillStyle(body, 1);
  g.fillCircle(x, headCy, 30);
  g.fillStyle(bodyDark, 1);
  g.fillCircle(x - 15, headCy - 26, 7.5);
  g.fillCircle(x + 15, headCy - 26, 7.5);

  // 浅色口鼻
  g.fillStyle(belly, 1);
  g.fillEllipse(x + f * 7, headCy + 11, 36, 25);

  // 呆萌圆眼
  g.fillStyle(ink, 1);
  g.fillCircle(x + f * 1, headCy - 6, 5);
  g.fillCircle(x + f * 17, headCy - 6, 5);
  g.fillStyle(0xffffff, 0.95);
  g.fillCircle(x + f * 2.6, headCy - 7.6, 1.8);
  g.fillCircle(x + f * 18.6, headCy - 7.6, 1.8);

  // 腮红
  g.fillStyle(0xffa8a8, 0.5);
  g.fillEllipse(x - f * 13, headCy + 8, 13, 8);
  g.fillEllipse(x + f * 27, headCy + 8, 13, 8);

  // 张嘴笑
  g.fillStyle(0x8a3a2a, 1);
  g.fillEllipse(x + f * 8, headCy + 18, 13, 9);
  g.fillStyle(0xff8a8a, 1);
  g.fillEllipse(x + f * 8, headCy + 20, 8, 4.5);
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
 * U熊：敦实的熊，胸口有肌肉、肚子很大。肚子被打中时会像果冻一样变宽变扁
 * （`pose.belly`），和模拟层那块「把球弹开」的肚皮圆（见 simulation.ts 的
 * `BELLY_R / BELLY_CY`）位置一致，所以看起来就是那里把球弹走的。
 */
function drawUBear(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const b = pose.belly ?? 0;
  const breathe = Math.sin(now / 620) * 1.2;
  const fur = 0x8b5a2b;
  const furDark = 0x6f4620;
  const furLight = 0xa9703a;
  const belly = 0xf0cf9e;
  const bellyLight = 0xffe6c2;

  // 尾巴
  g.fillStyle(furDark, 1);
  g.fillEllipse(x - f * 24, pose.feetY - 44, 24, 18);

  // 腿
  g.fillStyle(furDark, 1);
  g.fillRoundedRect(x - 16, pose.feetY - 30, 14, 30, 7);
  g.fillRoundedRect(x + 2, pose.feetY - 30, 14, 30, 7);

  // 后侧手臂（压在身体后面）
  g.fillStyle(furDark, 1);
  g.fillRoundedRect(x - f * 30 - 8, topY + 46, 16, 46, 8);

  // 躯干
  g.fillStyle(fur, 1);
  g.fillRoundedRect(x - 26, topY + 34, 52, PLAYER_H - 60, 16);

  // 胸肌
  g.fillStyle(furLight, 1);
  g.fillEllipse(x - f * 11, topY + 44, 24, 16);
  g.fillEllipse(x + f * 11, topY + 44, 24, 16);

  // 大肚皮：果冻形变 = 变宽 + 变扁，回弹时反过来
  const rx = 26 * (1 + 0.42 * b) + breathe;
  const ry = 27 * (1 - 0.34 * b);
  g.fillStyle(belly, 1);
  g.fillEllipse(x, topY + 66, rx * 2, ry * 2);
  g.fillStyle(bellyLight, 1);
  g.fillEllipse(x, topY + 66, rx * 1.34, ry * 1.18);
  // 肚皮上的 U
  g.lineStyle(4, 0xffffff, 0.85);
  g.beginPath();
  g.arc(x, topY + 62, 9, 0, Math.PI, false, 0);
  g.strokePath();
  g.lineBetween(x - 9, topY + 62, x - 9, topY + 48);
  g.lineBetween(x + 9, topY + 62, x + 9, topY + 48);

  // 前侧手臂 + 二头肌 + 拳头
  g.fillStyle(fur, 1);
  g.fillRoundedRect(x + f * 22 - 9, topY + 46, 18, 48, 9);
  g.fillStyle(furLight, 1);
  g.fillEllipse(x + f * 22, topY + 56, 20, 16);
  g.fillStyle(fur, 1);
  g.fillCircle(x + f * 22, topY + 94, 11);

  // 头
  g.fillStyle(fur, 1);
  g.fillCircle(x, topY + 18, 17);
  // 耳朵
  g.fillCircle(x - 13, topY + 4, 7);
  g.fillCircle(x + 13, topY + 4, 7);
  g.fillStyle(furLight, 1);
  g.fillCircle(x - 13, topY + 4, 3.6);
  g.fillCircle(x + 13, topY + 4, 3.6);
  // 口鼻 + 鼻子
  g.fillStyle(belly, 1);
  g.fillEllipse(x + f * 6, topY + 25, 20, 14);
  g.fillStyle(0x3a2a1c, 1);
  g.fillEllipse(x + f * 10, topY + 21, 8, 6);
  // 眼睛
  g.fillStyle(0x2a1c12, 1);
  g.fillCircle(x + f * 3, topY + 14, 2.6);
  g.fillCircle(x + f * 12, topY + 13, 2.6);
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(x + f * 3.8, topY + 13.2, 0.9);
  g.fillCircle(x + f * 12.8, topY + 12.2, 0.9);
}

/** 老皮：皮衣小人，hip 高度左右各挂一坨钢铁屁股——球弹上去是钢板反弹 */
function drawLaopi(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const topY = pose.feetY - PLAYER_H;
  const x = pose.x;
  const f = pose.facing;
  const leather = 0x8b5a2b;
  const leatherDark = 0x6f4620;
  const leatherLight = 0xa9703a;
  const steel = 0xaab4c2;
  const steelDark = 0x5a6472;
  const steelLight = 0xe8f0f8;

  // 两条短腿（藏在屁股后面）
  g.fillStyle(leatherDark, 1);
  g.fillRoundedRect(x - 13, pose.feetY - 16, 10, 16, 4);
  g.fillRoundedRect(x + 3, pose.feetY - 16, 10, 16, 4);

  // 两坨钢铁屁股：铆钉钢板圆，先画（在身体后面，左右各露出一半）
  for (const off of [-17, 17]) {
    const bx = x + off;
    const by = pose.feetY - 26;
    g.fillStyle(steelDark, 1);
    g.fillCircle(bx, by, 18);
    g.fillStyle(steel, 1);
    g.fillCircle(bx, by, 15.5);
    // 钢板斜高光
    g.fillStyle(steelLight, 0.85);
    g.fillEllipse(bx - 4, by - 5, 12, 6);
    // 四颗铆钉
    g.fillStyle(steelDark, 1);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      g.fillCircle(bx + Math.cos(a) * 11, by + Math.sin(a) * 11, 1.6);
    }
    // 中心螺栓
    g.fillStyle(steelDark, 1);
    g.fillCircle(bx, by, 3);
    g.fillStyle(steelLight, 0.7);
    g.fillCircle(bx - 1, by - 1, 1.2);
  }

  // 躯干：皮衣（缝线 + 拉链）
  g.fillStyle(leather, 1);
  g.fillRoundedRect(x - 19, topY + 40, 38, PLAYER_H - 74, 10);
  g.lineStyle(2, leatherDark, 0.9);
  g.strokeRoundedRect(x - 19, topY + 40, 38, PLAYER_H - 74, 10);
  g.lineStyle(1.5, leatherLight, 0.8);
  g.lineBetween(x, topY + 44, x, pose.feetY - 42);
  for (let k = 0; k < 4; k++) {
    g.lineBetween(x - 15, topY + 50 + k * 9, x - 8, topY + 52 + k * 9);
    g.lineBetween(x + 8, topY + 52 + k * 9, x + 15, topY + 50 + k * 9);
  }
  // 腰带扣住屁股上方
  g.fillStyle(0x3a2a1c, 1);
  g.fillRect(x - 19, pose.feetY - 38, 38, 8);
  g.fillStyle(0xffd45c, 1);
  g.fillRect(x - 4, pose.feetY - 39, 8, 10);

  // 手臂
  g.fillStyle(leather, 1);
  g.fillRoundedRect(x - f * 28 - 7, topY + 46, 14, 42, 7);
  g.fillStyle(leatherDark, 1);
  g.fillCircle(x - f * 28, topY + 88, 8);
  g.fillStyle(leather, 1);
  g.fillRoundedRect(x + f * 24 - 7, topY + 46, 14, 42, 7);
  g.fillStyle(leatherDark, 1);
  g.fillCircle(x + f * 24, topY + 88, 8);

  // 头：皮帽子 + 眯眯眼 + 缝嘴
  g.fillStyle(leather, 1);
  g.fillCircle(x, topY + 18, 16);
  g.fillStyle(leatherDark, 1);
  g.fillRoundedRect(x - 16, topY + 6, 32, 8, 4);
  g.fillStyle(0x2a1c12, 1);
  g.fillCircle(x + f * 4, topY + 17, 2.2);
  g.fillCircle(x + f * 13, topY + 17, 2.2);
  g.lineStyle(1.8, 0x2a1c12, 0.9);
  g.beginPath();
  g.arc(x + f * 8, topY + 25, 4, 0.15 * Math.PI, 0.85 * Math.PI, false, 0);
  g.strokePath();
  // 帽子随呼吸微微起伏
  const bob = Math.sin(now / 620) * 0.8;
  g.fillStyle(leatherLight, 1);
  g.fillCircle(x, topY + 4 + bob, 4);
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
  switch (id) {
    case 'sprout': {
      // 新芽：绿环 + 两片嫩叶
      g.lineStyle(3, color, 0.85);
      g.strokeEllipse(x, y, 44, 14);
      g.fillStyle(color, 0.9);
      g.fillEllipse(x - 10, y - 8, 9, 5);
      g.fillEllipse(x + 10, y - 8, 9, 5);
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

export function drawCharacter(
  g: Phaser.GameObjects.Graphics,
  now: number,
  cos: Cosmetic,
  pose: CharacterPose,
  opts: CharacterOpts = {},
): void {
  const topY = pose.feetY - PLAYER_H;

  if (opts.shadow !== false) {
    if (cos.ring !== 'none') drawRing(g, now, pose.x, pose.feetY, cos.ring);
    g.fillStyle(P.shadow, 0.16);
    g.fillEllipse(pose.x, pose.feetY + 2, 46, 10);
  }

  // 坐骑：压在最底层（光环之下），跟着角色跑跳，纯装饰
  if (cos.mount !== 'none') drawMount(g, now, cos.mount, pose);

  if (cos.aura !== 'none') drawAura(g, now, pose.x, pose.feetY, cos.aura, AURA_COLORS[cos.aura]);
  if (cos.cape !== 'none') drawCape(g, now, pose.x, topY, cos.cape);
  if (cos.wings !== 'none') drawWings(g, now, pose.x, topY, cos);

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
  } else {
    g.fillStyle(pose.color, 1);
    g.fillRoundedRect(pose.x - 14, topY + 26, 28, PLAYER_H - 26, 10);
  }

  if (cos.characterSkin !== 'none') {
    // 整只角色都换掉了，emoji 头就不画了
    opts.face?.setVisible(false);
  } else if (cos.emoji && opts.face) {
    const face = opts.face;
    face.setText(cos.emoji);
    face.setPosition(pose.x, topY + 17);
    face.setVisible(true);
  } else {
    g.fillStyle(P.skin, 1);
    g.fillCircle(pose.x, topY + 16, 13);
  }

  // 帽子 / 宠物画在「头之上」的层（overG），没给就退回单层渲染
  const over = opts.overG ?? g;
  if (cos.hat !== 'none') drawHat(over, pose.x, topY, cos.hat);
  if (cos.pet !== 'none') {
    drawPet(over, now, pose.x, topY, pose.facing < 0 ? 1 : 0, cos.pet, cos.petStar);
  }
}
