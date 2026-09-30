import type { EffectPainter } from './types';

export const eye: EffectPainter = (g, f, t, a, size) => {
  const open = Math.sin(t * Math.PI);
  const w2 = (24 + t * 20) * size;
  const h2 = w2 * 0.5 * open;
  g.lineStyle(3 * a + 1, f.color, a * 0.9);
  g.beginPath();
  g.moveTo(f.x - w2, f.y);
  g.lineTo(f.x, f.y - h2);
  g.lineTo(f.x + w2, f.y);
  g.lineTo(f.x, f.y + h2);
  g.closePath();
  g.strokePath();
  g.fillStyle(f.color, a * 0.9);
  g.fillCircle(f.x, f.y, 6 * size * open + 1);
};

export const ink: EffectPainter = (g, f, t, a, size) => {
  const n = 6;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2;
    const dist = (6 + t * 30) * size;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist;
    g.fillStyle(0x141420, a * 0.75);
    g.fillCircle(px, py, (10 - t * 4) * size);
    g.fillStyle(f.color, a * 0.5);
    g.fillCircle(px, py, (5 - t * 2) * size);
  }
};

export const pixelate: EffectPainter = (g, f, t, a, size) => {
  const cell = (6 + t * 5) * size;
  const ph = Math.floor(t * 10);
  for (let r2 = -3; r2 <= 3; r2++) {
    for (let c = -3; c <= 3; c++) {
      if ((r2 + c + ph) % 3 === 0) continue;
      if (Math.abs(r2) + Math.abs(c) > 4) continue;
      g.fillStyle((r2 + c) % 2 === 0 ? f.color : 0xffffff, a * 0.85);
      g.fillRect(f.x + c * cell - cell * 0.4, f.y + r2 * cell - cell * 0.4, cell * 0.8, cell * 0.8);
    }
  }
};

export const glitch: EffectPainter = (g, f, t, a, size) => {
  const off = (q: number) => Math.sin(f.seed + q * 7 + Math.floor(t * 12) * 3) * 6;
  g.fillStyle(0xff2a6a, a * 0.7);
  g.fillRect(f.x - 22 * size + off(1), f.y - 14 * size, 44 * size, 8 * size);
  g.fillStyle(0x2affea, a * 0.7);
  g.fillRect(f.x - 22 * size + off(2), f.y + 6 * size, 44 * size, 8 * size);
  g.fillStyle(0xffffff, a * 0.8);
  g.fillRect(f.x - 16 * size + off(3), f.y - 4 * size, 32 * size, 6 * size);
};

export const binary: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 10; k++) {
    const ang = f.seed + k * 2.399;
    const dist = (8 + t * 42) * size;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist;
    g.fillStyle(f.color, a * 0.9);
    if (k % 2 === 0) {
      g.fillRect(px - 4, py - 6, 8, 3);
      g.fillRect(px - 4, py + 3, 8, 3);
    } else {
      g.fillRect(px - 2, py - 6, 4, 12);
    }
  }
};

export const butterfly: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 5; k++) {
    const ang = f.seed + (k / 5) * Math.PI * 2 + t * 1.5;
    const dist = (10 + t * 40) * size;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist - t * 12;
    const flap = Math.abs(Math.sin(t * 10 + k));
    g.fillStyle(f.color, a * 0.9);
    g.fillEllipse(px - 4 * size, py, 9 * size, (10 * flap + 3) * size);
    g.fillEllipse(px + 4 * size, py, 9 * size, (10 * flap + 3) * size);
  }
};

export const phantom: EffectPainter = (g, f, t, a, size) => {
  for (let k = 2; k >= 0; k--) {
    const off = k * 6 * size + t * 14;
    g.fillStyle(f.color, a * (0.15 + (3 - k) * 0.18));
    g.fillCircle(f.x - off, f.y, (10 - k * 2) * size);
    g.fillCircle(f.x + off, f.y, (10 - k * 2) * size);
  }
  g.fillStyle(0xffffff, a * 0.85);
  g.fillCircle(f.x, f.y, 5 * size);
};
