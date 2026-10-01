import Phaser from 'phaser';
import {
  AURA_COLORS,
  CAPE_COLORS,
  CAPE_SHAPE,
  HAT_COLORS,
  HAT_KIND,
  PET_COLORS,
  PET_KIND,
  WING_COLORS,
  WING_SHAPE,
  type AuraId,
  type CapeId,
  type Cosmetic,
  type HatId,
  type PetId,
} from '../cosmetics';
import { PLAYER_H } from '../constants';
import { P } from '../theme';

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

export function drawCharacter(
  g: Phaser.GameObjects.Graphics,
  now: number,
  cos: Cosmetic,
  pose: CharacterPose,
  opts: CharacterOpts = {},
): void {
  const topY = pose.feetY - PLAYER_H;

  if (opts.shadow !== false) {
    g.fillStyle(P.shadow, 0.16);
    g.fillEllipse(pose.x, pose.feetY + 2, 46, 10);
  }

  if (cos.aura !== 'none') drawAura(g, now, pose.x, pose.feetY, cos.aura, AURA_COLORS[cos.aura]);
  if (cos.cape !== 'none') drawCape(g, now, pose.x, topY, cos.cape);
  if (cos.wings !== 'none') drawWings(g, now, pose.x, topY, cos);

  if (cos.characterSkin === 'ubear') {
    drawUBear(g, now, pose);
  } else if (cos.characterSkin === 'godzilla') {
    drawGodzilla(g, now, pose);
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

  if (cos.hat !== 'none') drawHat(g, pose.x, topY, cos.hat);
  if (cos.pet !== 'none') {
    drawPet(g, now, pose.x, topY, pose.facing < 0 ? 1 : 0, cos.pet, cos.petStar);
  }
}
