import Phaser from 'phaser';
import type { EffectPainter } from './types';

export const bubble: EffectPainter = (g, f, t, a, size) => {
  const n = 7;
  for (let k = 0; k < n; k++) {
    const px = f.x + Math.sin(f.seed + k * 2.3) * (10 + k * 3) * size;
    const py = f.y + 12 * size - t * (40 + k * 6) * size;
    const rr = (4 + (k % 3) * 2) * (1 - t * 0.4) * size;
    g.lineStyle(1.8, f.color, a * 0.8);
    g.strokeCircle(px, py, rr);
    g.fillStyle(0xffffff, a * 0.25);
    g.fillCircle(px - rr * 0.3, py - rr * 0.3, rr * 0.35);
  }
};

export const note: EffectPainter = (g, f, t, a, size) => {
  const n = 6;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2;
    const px = f.x + Math.cos(ang) * (10 + t * 40) * size;
    const py = f.y + Math.sin(ang) * (10 + t * 40) * size - t * 20;
    g.fillStyle(f.color, a * 0.9);
    g.fillCircle(px - 3, py + 4, 4);
    g.fillRect(px - 1, py - 6, 2, 12);
    g.fillRect(px, py - 6, 6, 3);
  }
};

export const heart: EffectPainter = (g, f, t, a, size) => {
  const n = 6;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2;
    const px = f.x + Math.cos(ang) * (8 + t * 34) * size;
    const py = f.y + Math.sin(ang) * (8 + t * 34) * size - t * 26 * size;
    const s = 7 * (1 - t * 0.4) * size;
    g.fillStyle(f.color, a * 0.9);
    g.fillCircle(px - s * 0.5, py - s * 0.3, s * 0.6);
    g.fillCircle(px + s * 0.5, py - s * 0.3, s * 0.6);
    g.fillTriangle(px - s, py - s * 0.1, px + s, py - s * 0.1, px, py + s);
  }
};

export const coin: EffectPainter = (g, f, t, a, size) => {
  const n = 8;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2;
    const dist = (8 + t * 46) * size;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist + t * 14 * size;
    const sq = Math.abs(Math.cos(t * 8 + k)) * 0.6 + 0.4;
    g.fillStyle(0xffd45c, a * 0.95);
    g.fillEllipse(px, py, 12 * sq, 12);
    g.lineStyle(1.5, 0xc99a1a, a * 0.8);
    g.strokeEllipse(px, py, 12 * sq, 12);
  }
};

export const dice: EffectPainter = (g, f, t, a, size) => {
  const n = 5;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2;
    const dist = (8 + t * 40) * size;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist;
    const s = 11 * (1 - t * 0.3) * size;
    g.fillStyle(0xffffff, a * 0.95);
    g.fillRoundedRect(px - s / 2, py - s / 2, s, s, 2);
    g.fillStyle(f.color, a);
    g.fillCircle(px, py, s * 0.14);
  }
};

export const cube: EffectPainter = (g, f, t, a, size) => {
  const s = (12 + t * 34) * size;
  const off = s * 0.45;
  g.lineStyle(3 * a + 1, f.color, a * 0.9);
  g.strokeRect(f.x - s / 2, f.y - s / 2, s, s);
  g.lineStyle(2 * a + 1, 0xffffff, a * 0.45);
  g.strokeRect(f.x - s / 2 + off, f.y - s / 2 - off, s, s);
  g.lineBetween(f.x - s / 2, f.y - s / 2, f.x - s / 2 + off, f.y - s / 2 - off);
  g.lineBetween(f.x + s / 2, f.y + s / 2, f.x + s / 2 + off, f.y + s / 2 - off);
};

export const pyramid: EffectPainter = (g, f, t, a, size) => {
  const s = (14 + t * 40) * size;
  g.lineStyle(3 * a + 1, f.color, a * 0.9);
  g.strokeTriangle(f.x, f.y - s, f.x - s * 0.9, f.y + s * 0.7, f.x + s * 0.9, f.y + s * 0.7);
  g.lineStyle(2 * a + 1, 0xffffff, a * 0.4);
  g.strokeTriangle(f.x, f.y - s * 0.4, f.x - s * 0.5, f.y + s * 0.7, f.x + s * 0.5, f.y + s * 0.7);
};

export const gear: EffectPainter = (g, f, t, a, size) => {
  const teeth = 12;
  const rOuter = (14 + t * 40) * size;
  const rInner = rOuter * 0.72;
  const rot = f.seed + t * 2.4;
  g.lineStyle(3 * a + 1, f.color, a * 0.9);
  g.beginPath();
  for (let k = 0; k < teeth * 2; k++) {
    const ang = rot + (k / (teeth * 2)) * Math.PI * 2;
    const rr = k % 2 === 0 ? rOuter : rInner;
    const px = f.x + Math.cos(ang) * rr;
    const py = f.y + Math.sin(ang) * rr;
    if (k === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.strokePath();
  g.lineStyle(2 * a + 1, 0xffffff, a * 0.4);
  g.strokeCircle(f.x, f.y, rInner * 0.5);
};

export const sonic: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 3; k++) {
    const r = (10 + t * 54 + k * 12) * size;
    const half = 1.0 - k * 0.15;
    g.lineStyle((5 - k * 1.2) * a + 1, f.color, a * (0.9 - k * 0.2));
    g.beginPath();
    g.arc(f.x, f.y, r, f.ang - half, f.ang + half, false, 0);
    g.strokePath();
  }
  g.fillStyle(0xffffff, a * 0.6);
  g.fillCircle(f.x + Math.cos(f.ang) * 6 * size, f.y + Math.sin(f.ang) * 6 * size, 5 * size * a + 1);
};

export const sonar: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 3; k++) {
    const r = (8 + t * 54 + k * 10) * size;
    g.fillStyle(f.color, a * (0.8 - k * 0.2));
    for (let d = 0; d < 12; d++) {
      const ang = f.seed + (d / 12) * Math.PI * 2;
      g.fillCircle(f.x + Math.cos(ang) * r, f.y + Math.sin(ang) * r, 2.2);
    }
  }
};

export const web: EffectPainter = (g, f, t, a, size) => {
  const spokes = 8;
  const reach = (10 + t * 48) * size;
  g.lineStyle(1.6 * a + 0.4, f.color, a * 0.8);
  for (let k = 0; k < spokes; k++) {
    const ang = f.seed + (k / spokes) * Math.PI * 2;
    g.lineBetween(f.x, f.y, f.x + Math.cos(ang) * reach, f.y + Math.sin(ang) * reach);
  }
  for (let ring = 1; ring <= 3; ring++) {
    const rr = (ring / 3) * reach;
    g.beginPath();
    for (let k = 0; k <= spokes; k++) {
      const ang = f.seed + (k / spokes) * Math.PI * 2;
      const px = f.x + Math.cos(ang) * rr;
      const py = f.y + Math.sin(ang) * rr;
      if (k === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.strokePath();
  }
};

export const confetti: EffectPainter = (g, f, t, a, size) => {
  const n = 16;
  const dist = (12 + t * 54) * size;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2 + t * 0.9;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist;
    const h = ((k * 37 + f.seed * 20) % 360) / 360;
    const col = Phaser.Display.Color.HSVToRGB(h, 0.9, 1).color;
    const s = 7 * (1 - t * 0.5) * size;
    g.fillStyle(col, a * 0.95);
    g.fillRect(px - s / 2, py - s / 2, s, s * 0.55);
  }
};

export const comet: EffectPainter = (g, f, t, a, size) => {
  const len = (18 + t * 46) * size;
  const headX = f.x + Math.cos(f.ang) * (t * 30 - 8) * size;
  const headY = f.y + Math.sin(f.ang) * (t * 30 - 8) * size;
  const tailX = headX - Math.cos(f.ang) * len;
  const tailY = headY - Math.sin(f.ang) * len;
  g.lineStyle(8 * a + 1, f.color, a * 0.35);
  g.lineBetween(tailX, tailY, headX, headY);
  g.lineStyle(3.5 * a + 1, f.color, a * 0.9);
  g.lineBetween((tailX + headX) / 2, (tailY + headY) / 2, headX, headY);
  g.fillStyle(0xffffff, a);
  g.fillCircle(headX, headY, 5 * size * a + 1);
};

export const bomb: EffectPainter = (g, f, t, a, size) => {
  g.fillStyle(0x1b1b22, a * 0.85);
  g.fillCircle(f.x, f.y, Math.max(2, (1 - t) * 14 * size));
  g.lineStyle(4 * a + 1, f.color, a * 0.9);
  g.strokeCircle(f.x, f.y, (10 + t * 46) * size);
  g.lineStyle(2, 0xffffff, a * 0.5);
  g.strokeCircle(f.x, f.y, (10 + t * 46) * size * 0.6);
};

export const firework: EffectPainter = (g, f, t, a, size) => {
  const n = 14;
  const dist = Math.min(1, t * 1.6) * 58 * size;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2;
    const col = Phaser.Display.Color.HSVToRGB(((k * 41) % 360) / 360, 0.9, 1).color;
    g.fillStyle(col, a * 0.95);
    g.fillCircle(f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist + t * t * 14, 3 * (1 - t * 0.5) * size + 1);
  }
};

export const flamenova: EffectPainter = (g, f, t, a, size) => {
  const tongues = 9;
  for (let k = 0; k < tongues; k++) {
    const ang = -Math.PI / 2 + (k / (tongues - 1) - 0.5) * 2.6;
    const len = (14 + t * 58) * size;
    g.fillStyle(k % 2 ? 0xffd07a : f.color, a * 0.8);
    g.fillTriangle(
      f.x + Math.cos(ang - 0.12) * 10, f.y + Math.sin(ang - 0.12) * 10,
      f.x + Math.cos(ang + 0.12) * 10, f.y + Math.sin(ang + 0.12) * 10,
      f.x + Math.cos(ang) * len, f.y + Math.sin(ang) * len,
    );
  }
};
