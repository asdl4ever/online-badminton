import Phaser from 'phaser';
import type { EffectPainter } from './types';

export const spark: EffectPainter = (g, f, t, a, size) => {
  const r0 = 6 * size;
  const len = (10 + t * 52) * size;
  g.lineStyle(2.5 * a + 0.5, f.color, a * 0.9);
  for (let k = 0; k < 9; k++) {
    const ang = f.seed + (k / 9) * Math.PI * 2;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    g.lineBetween(f.x + ca * r0, f.y + sa * r0, f.x + ca * len, f.y + sa * len);
  }
  g.fillStyle(f.color, a);
  g.fillCircle(f.x, f.y, 4 * size * a + 1);
};

export const slash: EffectPainter = (g, f, t, a, size) => {
  const reach = (34 + t * 30) * size;
  const half = 0.9 * (1 - t) + 0.25;
  g.lineStyle(7 * a + 1, f.color, a * 0.85);
  g.beginPath();
  g.arc(f.x, f.y, reach, f.ang - half, f.ang + half, false, 0);
  g.strokePath();
  g.lineStyle(2.5, 0xffffff, a * 0.5);
  g.beginPath();
  g.arc(f.x, f.y, reach, f.ang - half, f.ang + half, false, 0);
  g.strokePath();
};

export const burst: EffectPainter = (g, f, t, a, size) => {
  const n = 12;
  const dist = (12 + t * 46) * size;
  g.fillStyle(f.color, a * 0.85);
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2 + t * 0.6;
    const rr = (4 + (k % 3)) * (1 - t) * size + 1.5;
    g.fillCircle(f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist, rr);
  }
};

export const shock: EffectPainter = (g, f, t, a, size) => {
  const r = (8 + t * 54) * size;
  g.lineStyle(9 * a + 1, f.color, a * 0.9);
  g.strokeCircle(f.x, f.y, r);
  g.lineStyle(3 * a + 1, 0xffffff, a * 0.5);
  g.strokeCircle(f.x, f.y, r * 0.7);
  g.lineStyle(2.5 * a + 1, f.color, a * 0.6);
  g.strokeCircle(f.x, f.y, r * 0.4);
};

export const frost: EffectPainter = (g, f, t, a, size) => {
  const n = 8;
  const dist = (10 + t * 46) * size;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2 + t * 0.8;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist;
    const s = 9 * (1 - t * 0.5) * size;
    g.fillStyle(f.color, a * 0.9);
    g.fillTriangle(px, py - s, px + s * 0.6, py, px, py + s);
    g.fillTriangle(px, py - s, px - s * 0.6, py, px, py + s);
  }
  g.lineStyle(2 * a + 1, f.color, a * 0.5);
  g.strokeCircle(f.x, f.y, (10 + t * 40) * size);
};

export const star: EffectPainter = (g, f, t, a, size) => {
  const rays = 8;
  const len = (14 + t * 62) * size;
  g.lineStyle(4 * a + 1, f.color, a * 0.95);
  for (let k = 0; k < rays; k++) {
    const ang = f.seed + (k / rays) * Math.PI * 2;
    const l = k % 2 === 0 ? len : len * 0.55;
    g.lineBetween(f.x, f.y, f.x + Math.cos(ang) * l, f.y + Math.sin(ang) * l);
  }
  g.fillStyle(0xffffff, a);
  g.fillCircle(f.x, f.y, 5 * size * a + 1);
};

export const prism: EffectPainter = (g, f, t, a, size) => {
  for (let ring = 0; ring < 3; ring++) {
    const h = ((f.seed * 40 + t * 260 + ring * 120) % 360) / 360;
    const col = Phaser.Display.Color.HSVToRGB(h, 1, 1).color;
    const r = (8 + t * 52 + ring * 7) * size;
    g.lineStyle(6 - ring * 1.5, col, a * (0.9 - ring * 0.2));
    g.strokeCircle(f.x, f.y, r);
  }
};

export const vortex: EffectPainter = (g, f, t, a, size) => {
  const arms = 4;
  const steps = 10;
  g.lineStyle(3 * a + 1, f.color, a * 0.9);
  for (let arm = 0; arm < arms; arm++) {
    const a0 = f.seed + (arm / arms) * Math.PI * 2;
    let px = f.x;
    let py = f.y;
    for (let s = 1; s <= steps; s++) {
      const ang = a0 + (s / steps) * 2.6 + t * 1.5;
      const r = (s / steps) * (14 + t * 46) * size;
      const nx = f.x + Math.cos(ang) * r;
      const ny = f.y + Math.sin(ang) * r;
      g.lineBetween(px, py, nx, ny);
      px = nx;
      py = ny;
    }
  }
  g.fillStyle(f.color, a * 0.5);
  g.fillCircle(f.x, f.y, 8 * size);
};

export const ripple: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 3; k++) {
    const rt = Math.min(1, t * 1.4 - k * 0.18);
    if (rt <= 0) continue;
    const r = (6 + rt * 52) * size;
    g.lineStyle((3 - k) * a + 0.5, f.color, a * (0.8 - k * 0.2));
    g.strokeCircle(f.x, f.y, r);
  }
  g.fillStyle(0xffffff, a * 0.5);
  g.fillCircle(f.x, f.y, 5 * size * a + 1);
};

export const hex: EffectPainter = (g, f, t, a, size) => {
  const sides = 6;
  const r = (10 + t * 46) * size;
  const rot = f.seed + t * 2.2;
  g.lineStyle(4 * a + 1, f.color, a * 0.9);
  g.beginPath();
  for (let k = 0; k < sides; k++) {
    const ang = rot + (k / sides) * Math.PI * 2;
    const px = f.x + Math.cos(ang) * r;
    const py = f.y + Math.sin(ang) * r;
    if (k === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.strokePath();
  const ri = r * 0.55;
  g.lineStyle(2 * a + 1, 0xffffff, a * 0.5);
  g.beginPath();
  for (let k = 0; k < sides; k++) {
    const ang = -rot + (k / sides) * Math.PI * 2;
    const px = f.x + Math.cos(ang) * ri;
    const py = f.y + Math.sin(ang) * ri;
    if (k === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.strokePath();
};

export const spiral: EffectPainter = (g, f, t, a, size) => {
  const turns = 3.2;
  const steps = 26;
  g.lineStyle(3 * a + 1, f.color, a * 0.9);
  g.beginPath();
  for (let s = 0; s <= steps; s++) {
    const u = s / steps;
    const ang = f.seed + u * turns * Math.PI * 2 + t * 2;
    const r = u * (12 + t * 46) * size;
    const px = f.x + Math.cos(ang) * r;
    const py = f.y + Math.sin(ang) * r;
    if (s === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.strokePath();
};

export const shatter: EffectPainter = (g, f, t, a, size) => {
  const n = 9;
  const reach = (10 + t * 48) * size;
  g.lineStyle(2.4 * a + 0.5, f.color, a * 0.9);
  for (let k = 0; k < n; k++) {
    const base = f.seed + (k / n) * Math.PI * 2;
    let px = f.x;
    let py = f.y;
    const segs = 3;
    for (let s = 1; s <= segs; s++) {
      const jit = Math.sin(f.seed + k * 5 + s * 9) * 0.35;
      const ang = base + jit;
      const nx = f.x + (Math.cos(ang) * reach * s) / segs;
      const ny = f.y + (Math.sin(ang) * reach * s) / segs;
      g.lineBetween(px, py, nx, ny);
      px = nx;
      py = ny;
    }
  }
  g.fillStyle(0xffffff, a * 0.85);
  g.fillCircle(f.x, f.y, 6 * size * a + 1);
};

export const nova: EffectPainter = (g, f, t, a, size) => {
  const rays = 12;
  const len = (16 + t * 60) * size;
  g.lineStyle(2.5 * a + 0.5, f.color, a * 0.6);
  for (let k = 0; k < rays; k++) {
    const ang = f.seed + (k / rays) * Math.PI * 2;
    g.lineBetween(
      f.x + Math.cos(ang) * 8 * size,
      f.y + Math.sin(ang) * 8 * size,
      f.x + Math.cos(ang) * len,
      f.y + Math.sin(ang) * len,
    );
  }
  g.lineStyle(6 * a + 1, f.color, a * 0.9);
  g.strokeCircle(f.x, f.y, (8 + t * 46) * size);
  g.fillStyle(0xffffff, a * 0.9);
  g.fillCircle(f.x, f.y, (10 - t * 8) * size + 1);
};

export const rune: EffectPainter = (g, f, t, a, size) => {
  const sides = 5;
  const r = (12 + t * 44) * size;
  const rot = f.seed + t * 1.6;
  g.lineStyle(3 * a + 1, f.color, a * 0.9);
  for (let star = 0; star < 2; star++) {
    g.beginPath();
    for (let k = 0; k <= sides; k++) {
      const idx = (k * 2) % sides;
      const ang = rot + (idx / sides) * Math.PI * 2 + star * (Math.PI / sides);
      const px = f.x + Math.cos(ang) * r;
      const py = f.y + Math.sin(ang) * r;
      if (k === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.strokePath();
  }
  g.fillStyle(0xffffff, a * 0.5);
  g.fillCircle(f.x, f.y, 4 * size * a + 1);
};

export const ringburst: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 4; k++) {
    const rt = Math.min(1, t * 1.5 - k * 0.12);
    if (rt <= 0) continue;
    g.lineStyle((5 - k) * a + 0.5, f.color, a * (0.85 - k * 0.18));
    g.strokeCircle(f.x, f.y, (6 + rt * 56) * size);
  }
};

export const ringdance: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 6; k++) {
    const ang = f.seed + (k / 6) * Math.PI * 2 + t * 3;
    const dist = (16 + Math.sin(t * 6 + k) * 8) * size;
    g.lineStyle(3, f.color, a * 0.85);
    g.strokeCircle(f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist, 8 * (1 - t * 0.4) * size);
  }
};

export const prismfan: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 6; k++) {
    const col = Phaser.Display.Color.HSVToRGB((k / 6 + t * 0.3) % 1, 0.8, 1).color;
    const a0 = f.seed + (k / 6) * Math.PI * 2 + t;
    const len = (14 + t * 44) * size;
    g.fillStyle(col, a * 0.8);
    g.fillTriangle(
      f.x, f.y,
      f.x + Math.cos(a0) * len, f.y + Math.sin(a0) * len,
      f.x + Math.cos(a0 + 0.4) * len, f.y + Math.sin(a0 + 0.4) * len,
    );
  }
};
/** fallback for any style without a bespoke painter (including `ring`) */
export const paintDefault: EffectPainter = (g, f, t, a, size) => {
  const r = (10 + t * 44) * size;
  g.lineStyle(3.5 * a + 1, f.color, a * 0.85);
  g.strokeCircle(f.x, f.y, r);
  g.lineStyle(2, 0xffffff, a * 0.4);
  g.strokeCircle(f.x, f.y, r * 0.62);
};
