import Phaser from 'phaser';
import { RACKET_SKIN_COLORS, type RacketSkinId } from '../cosmetics';
import { P } from '../theme';

/** the skin's own colour, falling back to the player's racket tint */
export function racketFrameColor(skin: RacketSkinId, tint: number): number {
  return skin === 'default' ? tint : RACKET_SKIN_COLORS[skin];
}

/**
 * The racket head, drawn in its own local space: the frame is centred on
 * (9, 0) and the grip runs back along -x, so callers only have to translate and
 * rotate to wherever the racket happens to be.
 *
 * Shared by the match scene (which poses it from the aim offset) and the climb
 * scene (which poses it from a rigid body's angle).
 */
export function drawRacketHead(
  g: Phaser.GameObjects.Graphics,
  now: number,
  skin: RacketSkinId,
  frameColor: number,
): void {
  g.lineStyle(6, P.grip, 0.95);
  g.lineBetween(-12, 0, -2, 0);
  if (skin !== 'default') {
    const glow = skin === 'flame' ? 0.22 + 0.16 * Math.sin(now / 60) : 0.3;
    g.lineStyle(12, frameColor, glow);
    g.strokeEllipse(9, 0, 34, 28);
  }
  g.lineStyle(3, frameColor, 0.95);
  g.strokeEllipse(9, 0, 34, 28);
  drawRacketTrim(g, now, skin, frameColor);
}

/** extra ornament per racket skin, drawn in the racket's local space */
export function drawRacketTrim(
  g: Phaser.GameObjects.Graphics, now: number,
  skin: RacketSkinId,
  color: number,
): void {
  switch (skin) {
    case 'circuit': {
      g.lineStyle(1.6, color, 0.9);
      g.lineBetween(-2, 0, 9, 0);
      g.fillStyle(color, 0.95);
      for (let k = 0; k < 5; k++) {
        const ang = (k / 5) * Math.PI * 2;
        g.fillRect(9 + Math.cos(ang) * 17 - 2, Math.sin(ang) * 14 - 2, 4, 4);
      }
      break;
    }
    case 'spike': {
      g.lineStyle(2, color, 0.9);
      for (let k = 0; k < 10; k++) {
        const ang = (k / 10) * Math.PI * 2;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        g.lineBetween(9 + ca * 17, sa * 14, 9 + ca * 24, sa * 20);
      }
      break;
    }
    case 'holy': {
      g.lineStyle(2, 0xfff6c8, 0.5 + 0.3 * Math.sin(now / 200));
      g.strokeEllipse(9, 0, 46, 40);
      g.lineStyle(3, color, 0.85);
      g.lineBetween(9, -22, 9, -12);
      g.lineBetween(3, -17, 15, -17);
      break;
    }
    case 'shadow': {
      for (let k = 0; k < 6; k++) {
        const ang = (k / 6) * Math.PI * 2 + now / 900;
        g.fillStyle(0x2a1a44, 0.55);
        g.fillCircle(9 + Math.cos(ang) * 18, Math.sin(ang) * 15, 6);
      }
      break;
    }
    case 'crystal': {
      g.lineStyle(1.4, 0xffffff, 0.5);
      for (let k = 0; k < 6; k++) {
        const ang = (k / 6) * Math.PI * 2;
        g.lineBetween(9, 0, 9 + Math.cos(ang) * 16, Math.sin(ang) * 13);
      }
      break;
    }
    case 'glitch': {
      const j = Math.sin(now / 70) * 3;
      g.lineStyle(2, 0xff2a6a, 0.7);
      g.strokeEllipse(9 + j, 0, 34, 28);
      g.lineStyle(2, 0x2affea, 0.7);
      g.strokeEllipse(9 - j, 0, 34, 28);
      break;
    }
    case 'bamboo': {
      g.lineStyle(2, 0x3f6f22, 0.9);
      g.lineBetween(-11, -3, -11, 3);
      g.lineBetween(-6, -3, -6, 3);
      break;
    }
    case 'carbon': {
      g.lineStyle(1, 0x8fa0b8, 0.3);
      for (let k = -3; k <= 3; k++) {
        g.lineBetween(k * 4 - 4, -8, k * 4 + 6, 8);
      }
      break;
    }
    case 'plasma': {
      g.lineStyle(2, 0xffffff, 0.5 + 0.4 * Math.sin(now / 90));
      for (let k = 0; k < 4; k++) {
        const ang = now / 200 + (k / 4) * Math.PI * 2;
        g.lineBetween(9 + Math.cos(ang) * 8, Math.sin(ang) * 7, 9 + Math.cos(ang + 0.6) * 22, Math.sin(ang + 0.6) * 18);
      }
      break;
    }
    case 'galaxy': {
      g.fillStyle(0xffffff, 0.9);
      for (let k = 0; k < 7; k++) {
        const ang = k * 2.399;
        g.fillCircle(9 + Math.cos(ang) * 12, Math.sin(ang) * 10, 1.6);
      }
      g.lineStyle(1, color, 0.6);
      g.strokeEllipse(9, 0, 34, 28);
      break;
    }
    case 'lava': {
      for (let k = 0; k < 4; k++) {
        const ph = (now / 600 + k / 4) % 1;
        g.fillStyle(0xffb02a, 0.8 * (1 - ph));
        g.fillCircle(9 + (k - 1.5) * 9, 14 + ph * 10, 3.5 * (1 - ph));
      }
      break;
    }
    case 'frost': {
      g.lineStyle(1.6, 0xffffff, 0.6);
      for (let k = 0; k < 6; k++) {
        const ang = (k / 6) * Math.PI * 2;
        const fx = 9 + Math.cos(ang) * 15;
        const fy = Math.sin(ang) * 12;
        g.lineBetween(fx - 4, fy, fx + 4, fy);
        g.lineBetween(fx, fy - 4, fx, fy + 4);
      }
      break;
    }
    case 'rune': {
      g.lineStyle(1.8, color, 0.9);
      for (let k = 0; k < 4; k++) {
        const ang = now / 1200 + (k / 4) * Math.PI * 2;
        g.strokeRect(9 + Math.cos(ang) * 15 - 3, Math.sin(ang) * 12 - 3, 6, 6);
      }
      break;
    }
    case 'thorn': {
      g.lineStyle(1.8, color, 0.9);
      for (let k = 0; k < 10; k++) {
        const ang = (k / 10) * Math.PI * 2;
        g.lineBetween(9 + Math.cos(ang) * 16, Math.sin(ang) * 13, 9 + Math.cos(ang) * 23, Math.sin(ang) * 19);
      }
      break;
    }
    case 'web': {
      g.lineStyle(1.2, color, 0.6);
      for (let k = 0; k < 8; k++) {
        const ang = (k / 8) * Math.PI * 2;
        g.lineBetween(9, 0, 9 + Math.cos(ang) * 16, Math.sin(ang) * 13);
      }
      g.strokeEllipse(9, 0, 22, 18);
      g.strokeEllipse(9, 0, 32, 26);
      break;
    }
    case 'vine': {
      g.lineStyle(2.5, 0x4f9f4a, 0.9);
      g.beginPath();
      for (let s = 0; s <= 8; s++) {
        const u = s / 8;
        const px = -6 + u * 30;
        const py = Math.sin(u * 6) * 6;
        if (s === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.strokePath();
      g.fillStyle(0x7ed957, 0.9);
      g.fillEllipse(0, -6, 8, 5);
      g.fillEllipse(14, 5, 8, 5);
      break;
    }
    case 'mirror': {
      g.lineStyle(1.5, 0xffffff, 0.5);
      g.lineBetween(-5, -12, 11, 12);
      g.lineBetween(11, -12, 25, 8);
      break;
    }
    case 'matrix': {
      for (let k = 0; k < 6; k++) {
        const ph = (now / 400 + k / 6) % 1;
        g.fillStyle(color, 0.8 * (1 - ph));
        g.fillRect(9 + ((k % 3) - 1) * 10 - 2, -14 + ph * 28 - 3, 4, 6);
      }
      break;
    }
    case 'bone': {
      g.lineStyle(3, 0xe8e0cf, 0.95);
      g.lineBetween(-2, 0, 22, 0);
      g.fillStyle(0xe8e0cf, 0.95);
      g.fillCircle(24, -3, 3);
      g.fillCircle(24, 3, 3);
      break;
    }
    case 'zebra': {
      g.lineStyle(2.5, 0x1c1c24, 0.9);
      for (let k = -2; k <= 2; k++) {
        g.lineBetween(9 + k * 7 - 6, -13, 9 + k * 7 + 6, 13);
      }
      break;
    }
    case 'camo': {
      g.fillStyle(0x3f5a3a, 0.7);
      g.fillEllipse(2, -4, 10, 8);
      g.fillStyle(0x6a5a34, 0.7);
      g.fillEllipse(16, 6, 12, 9);
      g.fillStyle(0x2f3a2a, 0.7);
      g.fillEllipse(8, 8, 8, 6);
      break;
    }
    case 'star': {
      for (let k = 0; k < 4; k++) {
        const ang = now / 900 + (k / 4) * Math.PI * 2;
        const px = 9 + Math.cos(ang) * 13;
        const py = Math.sin(ang) * 11;
        g.lineStyle(1.8, color, 0.9);
        g.lineBetween(px - 4, py, px + 4, py);
        g.lineBetween(px, py - 4, px, py + 4);
      }
      break;
    }
    case 'scale': {
      g.lineStyle(1.4, color, 0.8);
      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          g.beginPath();
          g.arc(9 + c * 9, r * 8, 5, Math.PI, 0, false, 0);
          g.strokePath();
        }
      }
      break;
    }
    case 'smoke': {
      for (let k = 0; k < 4; k++) {
        const ph = (now / 900 + k / 4) % 1;
        g.fillStyle(0x9aa7b8, 0.3 * (1 - ph));
        g.fillCircle(9 + Math.sin(ph * 6) * 4, -ph * 20, 6 + ph * 6);
      }
      break;
    }
    case 'aurora': {
      for (let k = 0; k < 3; k++) {
        const col = Phaser.Display.Color.HSVToRGB((k / 3 + now / 3000) % 1, 0.7, 1).color;
        g.lineStyle(2, col, 0.7);
        g.beginPath();
        g.arc(9, 0, 14 + k * 3, Math.PI * 0.2, Math.PI * 1.4, false, 0);
        g.strokePath();
      }
      break;
    }
    case 'nebula': {
      for (let k = 0; k < 8; k++) {
        const ang = k * 2.399;
        g.fillStyle(k % 2 ? color : 0xffffff, 0.8);
        g.fillCircle(9 + Math.cos(ang) * 13, Math.sin(ang) * 11, 1.6);
      }
      break;
    }
    case 'onyx': {
      g.lineStyle(1.5, 0x8f8fa8, 0.6);
      g.strokeEllipse(9, 0, 26, 21);
      g.fillStyle(0xffffff, 0.25);
      g.fillEllipse(3, -6, 9, 4);
      break;
    }
    case 'ivory': {
      g.lineStyle(1.5, 0xffffff, 0.7);
      g.strokeEllipse(9, 0, 30, 24);
      g.strokeEllipse(9, 0, 20, 16);
      break;
    }
    case 'amber': {
      for (let k = 0; k < 3; k++) {
        const ph = (now / 800 + k / 3) % 1;
        g.fillStyle(color, 0.8 * (1 - ph));
        g.fillCircle(9 + (k - 1) * 8, 13 + ph * 10, 3 * (1 - ph));
      }
      break;
    }
    case 'jade': {
      g.lineStyle(1.6, color, 0.8);
      for (let k = -1; k <= 1; k++) {
        g.beginPath();
        g.arc(9 + k * 9, 0, 7, Math.PI * 1.1, Math.PI * 1.9, false, 0);
        g.strokePath();
      }
      break;
    }
    case 'ruby': {
      g.fillStyle(0xffffff, 0.5);
      g.fillTriangle(9, -12, 17, 0, 9, 12);
      g.lineStyle(1.6, color, 0.9);
      g.lineBetween(9, -12, 17, 0);
      g.lineBetween(9, 12, 17, 0);
      g.lineBetween(9, -12, 9, 12);
      break;
    }
    case 'sapphire': {
      g.lineStyle(1.6, color, 0.9);
      g.strokeRect(2, -9, 14, 18);
      g.lineBetween(2, -9, 16, 9);
      g.lineBetween(16, -9, 2, 9);
      break;
    }
    case 'toxic': {
      for (let k = 0; k < 5; k++) {
        const ph = (now / 900 + k / 5) % 1;
        g.lineStyle(1.6, color, 0.8 * (1 - ph));
        g.strokeCircle(4 + (k % 3) * 6, 14 - ph * 28, 2 + (k % 2) * 2);
      }
      break;
    }
    case 'ember': {
      for (let k = 0; k < 6; k++) {
        const ang = now / 500 + k * 1.05;
        g.fillStyle(k % 2 ? 0xffd07a : color, 0.85);
        g.fillCircle(9 + Math.cos(ang) * 15, Math.sin(ang) * 13, 2);
      }
      break;
    }
    default:
      break;
  }
}
