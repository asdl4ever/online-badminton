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
    case 'quantum': {
      // 量子：概率云在拍面上闪现
      for (let k = 0; k < 3; k++) {
        const ang = now / (k % 2 ? -420 : 420) + k * 2.1;
        g.fillStyle(color, 0.2);
        g.fillCircle(9 + Math.cos(ang) * 9, Math.sin(ang) * 7, 8);
        g.fillStyle(color, 0.9);
        g.fillCircle(9 + Math.cos(ang) * 9, Math.sin(ang) * 7, 2);
      }
      break;
    }
    case 'obsidian': {
      // 黑曜：黑曜石棱面 + 冷光边缘
      g.fillStyle(0x1a1a22, 0.85);
      g.fillTriangle(2, -10, 16, -6, 9, 10);
      g.lineStyle(1.2, color, 0.7);
      g.lineBetween(2, -10, 9, 10);
      g.lineBetween(16, -6, 9, 10);
      g.lineStyle(1.6, 0xa8e8ff, 0.5 + 0.3 * Math.sin(now / 300));
      g.lineBetween(2, -10, 16, -6);
      break;
    }
    case 'sunsteel': {
      // 太阳钢：辐条 + 中央日核
      g.lineStyle(2, color, 0.9);
      for (let k = 0; k < 8; k++) {
        const ang = (k / 8) * Math.PI * 2;
        g.lineBetween(9, 0, 9 + Math.cos(ang) * 14, Math.sin(ang) * 12);
      }
      g.fillStyle(0xfff2c4, 0.9);
      g.fillCircle(9, 0, 4);
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(9, 0, 2);
      break;
    }
    case 'moonlace': {
      // 月纹：蕾丝弧边 + 月牙
      g.lineStyle(1.4, color, 0.7);
      for (let k = 0; k < 4; k++) {
        g.beginPath();
        g.arc(9 + Math.cos(k * 1.57) * 11, Math.sin(k * 1.57) * 9, 5, 0, Math.PI, false, 0);
        g.strokePath();
      }
      g.fillStyle(color, 0.95);
      g.fillCircle(9, 0, 5);
      g.fillStyle(0x2a3a5a, 1);
      g.fillCircle(11, -1, 4.2);
      break;
    }
    case 'rosebranch': {
      // 玫瑰：花枝爬上拍框 + 一朵玫瑰
      g.lineStyle(2, 0x4f9f4a, 0.9);
      g.beginPath();
      g.moveTo(-6, 12);
      g.lineTo(0, 4);
      g.lineTo(2, -6);
      g.strokePath();
      for (let k = 0; k < 5; k++) {
        const ang = (k / 5) * Math.PI * 2 + now / 2000;
        g.fillStyle(0x4f9f4a, 0.8);
        g.fillEllipse(2 + Math.cos(ang) * 4, -6 + Math.sin(ang) * 4, 5, 3);
      }
      g.fillStyle(color, 0.95);
      for (let s = 0; s < 3; s++) g.fillCircle(2 + s, -6 - s, 4 - s);
      break;
    }
    case 'starpiercer': {
      // 穿星：蓄力后射出的星芒
      const charge = 0.5 + 0.5 * Math.sin(now / 400);
      g.lineStyle(2.5, color, 0.7 + charge * 0.3);
      for (let k = 0; k < 4; k++) {
        const ang = (k / 4) * Math.PI * 2 + Math.PI / 4;
        g.lineBetween(9 + Math.cos(ang) * 6, Math.sin(ang) * 5, 9 + Math.cos(ang) * (12 + charge * 10), Math.sin(ang) * (10 + charge * 8));
      }
      g.fillStyle(color, 0.95);
      g.fillCircle(9, 0, 3.5);
      break;
    }
    case 'tsunami': {
      // 海啸：拍面下缘卷浪
      g.lineStyle(2.5, color, 0.85);
      g.beginPath();
      for (let s = 0; s <= 8; s++) {
        const u = s / 8;
        const px = -4 + u * 26;
        const py = 8 - Math.sin(u * 6 + now / 300) * 4;
        if (s === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.strokePath();
      g.fillStyle(0xbfe8ff, 0.5);
      for (let k = 0; k < 3; k++) g.fillCircle(-2 + k * 11, 4 + Math.sin(now / 300 + k) * 2, 1.8);
      break;
    }
    case 'magma': {
      // 熔核：龟裂亮纹 + 呼吸热光
      const heat = 0.5 + 0.5 * Math.sin(now / 260);
      g.lineStyle(2.2, 0xffd45c, 0.4 + heat * 0.5);
      g.lineBetween(1, -9, 6, -1);
      g.lineBetween(6, -1, 14, -4);
      g.lineBetween(6, -1, 9, 9);
      g.fillStyle(0xff5a1a, 0.3 + heat * 0.25);
      g.fillEllipse(9, 0, 30, 24);
      break;
    }
    case 'stormline': {
      // 风暴线：环拍狂奔的电蛇
      for (let k = 0; k < 2; k++) {
        const ang = now / 130 + k * Math.PI;
        const px = 9 + Math.cos(ang) * 15;
        const py = Math.sin(ang) * 12;
        g.lineStyle(2, color, 0.9);
        g.lineBetween(px, py, px + Math.cos(ang + 1) * 6, py + Math.sin(ang + 1) * 5);
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(px, py, 1.8);
      }
      break;
    }
    case 'phoenixF': {
      // 凤羽：拍框上的尾羽拖曳
      for (let k = 0; k < 4; k++) {
        const ph = (now / 500 + k / 4) % 1;
        g.fillStyle(k % 2 ? color : 0xffd07a, 0.85 * (1 - ph));
        g.fillEllipse(9 + Math.cos(now / 700 + k) * 10 - ph * 16, Math.sin(now / 700 + k) * 8 + ph * 12, 9 * (1 - ph) + 3, 4);
      }
      break;
    }
    case 'dragonbone': {
      // 龙骨：骨节棘刺沿框排布
      g.fillStyle(color, 0.95);
      for (let k = 0; k < 6; k++) {
        const ang = (k / 6) * Math.PI * 2;
        const px = 9 + Math.cos(ang) * 15;
        const py = Math.sin(ang) * 12;
        g.fillTriangle(px, py, px + Math.cos(ang) * 6, py + Math.sin(ang) * 5, px + Math.cos(ang + 0.7) * 6, py + Math.sin(ang + 0.7) * 5);
      }
      g.fillStyle(0x2a3a5a, 0.8);
      g.fillCircle(9, 0, 3);
      break;
    }
    case 'iceberg': {
      // 冰山：浮冰碎块贴着拍面漂
      for (let k = 0; k < 4; k++) {
        const drift = Math.sin(now / 800 + k * 1.9) * 3;
        g.fillStyle(0xdfefff, 0.85);
        g.fillTriangle(
          9 + Math.cos(k * 1.57) * 12 + drift, Math.sin(k * 1.57) * 10 + drift,
          9 + Math.cos(k * 1.57 + 0.7) * 12 + drift, Math.sin(k * 1.57 + 0.7) * 10 + drift,
          9 + Math.cos(k * 1.57 + 0.35) * 6 + drift, Math.sin(k * 1.57 + 0.35) * 6 + drift,
        );
      }
      break;
    }
    case 'goldthread': {
      // 金线：缠丝螺旋绕框
      g.lineStyle(1.6, color, 0.9);
      g.beginPath();
      for (let s = 0; s <= 14; s++) {
        const u = s / 14;
        const ang = u * Math.PI * 4 + now / 900;
        const px = 9 + Math.cos(ang) * (4 + u * 12);
        const py = Math.sin(ang) * (3 + u * 10);
        if (s === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.strokePath();
      break;
    }
    case 'coralrim': {
      // 珊瑚缘：扇形珊瑚贴边生长
      g.lineStyle(2, color, 0.9);
      for (let k = 0; k < 5; k++) {
        const ang = Math.PI * (0.25 + k * 0.125);
        g.lineBetween(9, 0, 9 + Math.cos(ang) * 14, Math.sin(ang) * 12);
        g.fillStyle(color, 0.9);
        g.fillCircle(9 + Math.cos(ang) * 14, Math.sin(ang) * 12, 2.4);
      }
      break;
    }
    case 'chrono': {
      // 时环：拍心时钟指针倒转
      g.lineStyle(1.6, color, 0.8);
      g.strokeCircle(9, 0, 9);
      const h = now / 700;
      g.lineStyle(2, color, 1);
      g.lineBetween(9, 0, 9 + Math.cos(-h) * 7, Math.sin(-h) * 6);
      g.lineBetween(9, 0, 9 + Math.cos(-h * 12) * 4, Math.sin(-h * 12) * 3.5);
      g.fillStyle(color, 0.9);
      g.fillCircle(9, 0, 1.5);
      break;
    }
    case 'holo': {
      // 全息：半透明全息矩形闪烁
      const flick = 0.3 + 0.3 * Math.abs(Math.sin(now / 130));
      g.fillStyle(color, 0.2 + flick * 0.2);
      g.fillRect(1, -10, 16, 20);
      g.lineStyle(1.4, color, 0.7 + flick);
      g.strokeRect(1, -10, 16, 20);
      g.fillStyle(color, 0.9);
      g.fillRect(1, -10 + ((now / 12) % 20), 16, 2);
      break;
    }
    case 'gravity': {
      // 引力：星球被拉向拍心扭曲
      for (let k = 0; k < 3; k++) {
        const ph = (now / 1100 + k / 3) % 1;
        const rr = (1 - ph) * 18 + 2;
        const ang = k * 2.1 + now / 1000;
        g.fillStyle(color, 0.9 * ph);
        g.fillCircle(9 + Math.cos(ang) * rr, Math.sin(ang) * rr * 0.8, 2.5);
      }
      g.fillStyle(0x1a1a22, 0.9);
      g.fillCircle(9, 0, 4);
      g.lineStyle(1.2, color, 0.5);
      g.strokeCircle(9, 0, 4);
      break;
    }
    case 'sonic': {
      // 音爆：一圈圈声波往外扩
      for (let k = 0; k < 3; k++) {
        const ph = (now / 600 + k / 3) % 1;
        g.lineStyle(2, color, (1 - ph) * 0.8);
        g.strokeEllipse(9, 0, 10 + ph * 30, 8 + ph * 24);
      }
      break;
    }
    case 'willow': {
      // 柳影：垂柳丝随拍摆动
      g.lineStyle(1.6, color, 0.7);
      for (let k = 0; k < 4; k++) {
        const bx = 1 + k * 5;
        g.beginPath();
        for (let s = 0; s <= 5; s++) {
          const u = s / 5;
          const px = bx + Math.sin(u * 3 + now / 350 + k) * 2.5;
          const py = -10 + u * 22;
          if (s === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.strokePath();
      }
      break;
    }
    case 'blossom': {
      // 花见：花瓣绕框飘落
      for (let k = 0; k < 5; k++) {
        const ph = (now / 1400 + k / 5) % 1;
        const px = 9 + Math.sin(k * 2.2 + now / 500) * 13;
        const py = -12 + ph * 24;
        g.fillStyle(k % 2 ? color : 0xffffff, 0.85 * Math.sin(ph * Math.PI));
        g.fillEllipse(px, py, 4, 2.5);
      }
      g.fillStyle(color, 0.9);
      g.fillCircle(9, 0, 2.5);
      break;
    }
    default:
      break;
  }
}
