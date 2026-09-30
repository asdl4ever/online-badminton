import Phaser from 'phaser';
import type { EffectPainter } from './types';

export const lightning: EffectPainter = (g, f, t, a, size) => {
  const n = 5;
  const len = (16 + t * 42) * size;
  g.lineStyle(3 * a + 1, f.color, a);
  for (let k = 0; k < n; k++) {
    const base = f.seed + (k / n) * Math.PI * 2;
    let px = f.x;
    let py = f.y;
    const segs = 4;
    for (let s = 1; s <= segs; s++) {
      const jitter = Math.sin(f.seed + k * 7 + s * 3) * 0.09 * (1 - t);
      const ang = base + (s / segs) * 0.5 + jitter;
      const nx = f.x + (Math.cos(ang) * len * s) / segs;
      const ny = f.y + (Math.sin(ang) * len * s) / segs;
      g.lineBetween(px, py, nx, ny);
      px = nx;
      py = ny;
    }
  }
  g.fillStyle(0xffffff, a * 0.8);
  g.fillCircle(f.x, f.y, 5 * size * a + 1);
};

export const beam: EffectPainter = (g, f, t, a, size) => {
  const bw = (14 - t * 8) * size;
  g.fillStyle(f.color, a * 0.4);
  g.fillRect(f.x - bw / 2, f.y - 90 * size, bw, 90 * size);
  g.fillStyle(0xffffff, a * 0.6);
  g.fillRect(f.x - 2, f.y - 90 * size, 4, 90 * size);
  g.lineStyle(3 * a + 1, f.color, a * 0.8);
  g.strokeCircle(f.x, f.y, (10 + t * 30) * size);
};

export const laser: EffectPainter = (g, f, _t, a, size) => {
  const len = 90 * size;
  const ca = Math.cos(f.ang);
  const sa = Math.sin(f.ang);
  g.lineStyle(16 * a + 1, f.color, a * 0.25);
  g.lineBetween(f.x - ca * len, f.y - sa * len, f.x + ca * len, f.y + sa * len);
  g.lineStyle(5 * a + 1, f.color, a * 0.9);
  g.lineBetween(f.x - ca * len, f.y - sa * len, f.x + ca * len, f.y + sa * len);
  g.lineStyle(2, 0xffffff, a);
  g.lineBetween(f.x - ca * len, f.y - sa * len, f.x + ca * len, f.y + sa * len);
};

export const plasma: EffectPainter = (g, f, t, a, size) => {
  g.fillStyle(f.color, a * 0.35);
  g.fillCircle(f.x, f.y, (14 + t * 30) * size);
  g.lineStyle(2.5, 0xffffff, a * 0.8);
  for (let k = 0; k < 5; k++) {
    const a0 = f.seed + k * 1.3 + t * 3;
    let px = f.x;
    let py = f.y;
    for (let s = 1; s <= 3; s++) {
      const ang = a0 + Math.sin(t * 8 + s + k) * 0.4;
      const nx = f.x + Math.cos(ang) * (10 + s * 12 + t * 20) * size;
      const ny = f.y + Math.sin(ang) * (10 + s * 12 + t * 20) * size;
      g.lineBetween(px, py, nx, ny);
      px = nx;
      py = ny;
    }
  }
};

export const magnet: EffectPainter = (g, f, t, a, size) => {
  const r = (12 + t * 40) * size;
  g.lineStyle(3 * a + 1, f.color, a * 0.8);
  g.beginPath();
  g.arc(f.x, f.y, r, 0.2 * Math.PI, 0.8 * Math.PI, false, 0);
  g.strokePath();
  g.beginPath();
  g.arc(f.x, f.y, r, 1.2 * Math.PI, 1.8 * Math.PI, false, 0);
  g.strokePath();
  g.fillStyle(0xffffff, a * 0.8);
  for (let k = 0; k < 8; k++) {
    const ang = f.seed + k * 0.79;
    const rr = r * (0.3 + (k % 4) * 0.2);
    g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 2);
  }
};

export const portal: EffectPainter = (g, f, t, a, size) => {
  const r = (14 + t * 34) * size;
  for (let k = 0; k < 3; k++) {
    const rr = r * (1 - k * 0.22);
    g.lineStyle(3 - k, k === 1 ? 0xffffff : f.color, a * (0.8 - k * 0.15));
    g.strokeEllipse(f.x, f.y, rr * 1.1, rr * 1.7);
  }
  g.fillStyle(f.color, a * 0.3);
  g.fillEllipse(f.x, f.y, r * 0.5, r * 0.9);
};

export const blackhole: EffectPainter = (g, f, t, a, size) => {
  const r = (10 + t * 26) * size;
  g.fillStyle(0x08080f, a * 0.9);
  g.fillCircle(f.x, f.y, r);
  for (let k = 0; k < 3; k++) {
    const rr = r * (1.3 + k * 0.35);
    g.lineStyle(3 - k * 0.6, k === 1 ? 0xffffff : f.color, a * (0.6 - k * 0.15));
    g.strokeEllipse(f.x, f.y, rr * 2, rr * 1.2 + Math.sin(t * 6 + k) * 4);
  }
};

export const galaxy: EffectPainter = (g, f, t, a, size) => {
  for (let arm = 0; arm < 2; arm++) {
    g.lineStyle(4 * a + 1, f.color, a * 0.55);
    g.beginPath();
    for (let s = 0; s <= 20; s++) {
      const u = s / 20;
      const ang = (arm / 2) * Math.PI * 2 + u * 3.2 + t * 2;
      const rr = u * (12 + t * 48) * size;
      const px = f.x + Math.cos(ang) * rr;
      const py = f.y + Math.sin(ang) * rr;
      if (s === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.strokePath();
  }
  g.fillStyle(0xffffff, a * 0.9);
  for (let k = 0; k < 12; k++) {
    const ang = f.seed + k * 2.399 + t;
    const rr = (10 + (k % 6) * 8) * size;
    g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 1.6);
  }
};

export const starlight: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 8; k++) {
    const ang = f.seed + (k / 8) * Math.PI * 2 + t * 0.6;
    const dist = (8 + t * 46) * size;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist;
    const s = 9 * (1 - t * 0.4) * size;
    g.fillStyle(f.color, a * 0.95);
    g.fillTriangle(px, py - s, px + s * 0.3, py, px, py + s);
    g.fillTriangle(px, py - s, px - s * 0.3, py, px, py + s);
    g.fillTriangle(px - s, py, px, py - s * 0.3, px, py + s * 0.3);
  }
};

export const starfall: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 7; k++) {
    const ph = Math.min(1, t * 1.6 + k * 0.1);
    const px = f.x + Math.sin(f.seed + k * 1.7) * 42 * size;
    const py = f.y - 50 * size + ph * 80 * size;
    g.lineStyle(2, f.color, a * 0.7);
    g.lineBetween(px - 3, py - 12 * size, px, py);
    g.fillStyle(f.color, a);
    g.fillCircle(px, py, 3 * size);
  }
};

export const aurora: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 3; k++) {
    const col = Phaser.Display.Color.HSVToRGB((k / 3 + t * 0.3) % 1, 0.7, 1).color;
    g.lineStyle(5 - k, col, a * 0.6);
    g.beginPath();
    for (let s = 0; s <= 12; s++) {
      const u = s / 12;
      const px = f.x - 55 * size + u * 110 * size;
      const py = f.y + (k - 1) * 14 * size + Math.sin(u * 5 + t * 4 + k) * 10 * size;
      if (s === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.strokePath();
  }
};

export const rainbow: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 5; k++) {
    const col = Phaser.Display.Color.HSVToRGB((k / 5 + t * 0.4) % 1, 0.85, 1).color;
    g.lineStyle(6 - k * 0.8, col, a * (0.85 - k * 0.12));
    g.beginPath();
    g.arc(f.x, f.y, (12 + t * 52 - k * 6) * size, Math.PI, Math.PI * 2, false, 0);
    g.strokePath();
  }
};

export const holy: EffectPainter = (g, f, t, a, size) => {
  const len = (18 + t * 46) * size;
  g.lineStyle(8 * a + 1, 0xfff6c8, a * 0.4);
  g.lineBetween(f.x, f.y - len, f.x, f.y + len);
  g.lineBetween(f.x - len * 0.7, f.y - len * 0.25, f.x + len * 0.7, f.y - len * 0.25);
  g.lineStyle(3 * a + 1, 0xffffff, a * 0.95);
  g.lineBetween(f.x, f.y - len, f.x, f.y + len);
  g.lineBetween(f.x - len * 0.7, f.y - len * 0.25, f.x + len * 0.7, f.y - len * 0.25);
};

export const sun: EffectPainter = (g, f, t, a, size) => {
  const rays = 12;
  const r = (10 + t * 34) * size;
  const rot = f.seed + t * 1.2;
  g.fillStyle(0xfff3b0, a * 0.6);
  g.fillCircle(f.x, f.y, r * 0.5);
  g.lineStyle(3 * a + 1, f.color, a * 0.9);
  for (let k = 0; k < rays; k++) {
    const ang = rot + (k / rays) * Math.PI * 2;
    g.lineBetween(
      f.x + Math.cos(ang) * r * 0.6, f.y + Math.sin(ang) * r * 0.6,
      f.x + Math.cos(ang) * r * 1.3, f.y + Math.sin(ang) * r * 1.3,
    );
  }
};

export const moon: EffectPainter = (g, f, t, a, size) => {
  const r = (14 + t * 36) * size;
  g.fillStyle(f.color, a * 0.9);
  g.fillCircle(f.x, f.y, r);
  g.fillStyle(0xffffff, a * 0.25);
  g.fillCircle(f.x - r * 0.3, f.y - r * 0.25, r * 0.22);
  g.fillCircle(f.x + r * 0.25, f.y + r * 0.15, r * 0.16);
  g.fillCircle(f.x - r * 0.1, f.y + r * 0.35, r * 0.12);
  g.lineStyle(2, 0xffffff, a * 0.3);
  g.strokeCircle(f.x, f.y, r * 1.2);
};

export const atom: EffectPainter = (g, f, t, a, size) => {
  const r = (16 + t * 30) * size;
  g.lineStyle(2.5 * a + 1, f.color, a * 0.85);
  for (let k = 0; k < 3; k++) {
    g.save();
    g.translateCanvas(f.x, f.y);
    g.rotateCanvas((k / 3) * Math.PI);
    g.strokeEllipse(0, 0, r * 2, r * 0.8);
    g.restore();
  }
  g.fillStyle(0xffffff, a);
  g.fillCircle(f.x, f.y, 4 * size * a + 1);
  const ea = t * 8;
  g.fillStyle(f.color, a);
  g.fillCircle(f.x + Math.cos(ea) * r, f.y + Math.sin(ea) * r * 0.4, 3);
};

export const dna: EffectPainter = (g, f, t, a, size) => {
  const steps = 12;
  const len = (18 + t * 40) * size;
  g.lineStyle(2.5 * a + 1, f.color, a * 0.9);
  for (let s = 0; s <= steps; s++) {
    const y = f.y - len / 2 + (s / steps) * len;
    const dx = Math.sin((s / steps) * Math.PI * 2 + t * 6) * 10 * size;
    if (s < steps) {
      const y2 = f.y - len / 2 + ((s + 1) / steps) * len;
      const dx2 = Math.sin(((s + 1) / steps) * Math.PI * 2 + t * 6) * 10 * size;
      g.lineBetween(f.x + dx, y, f.x + dx2, y2);
      g.lineBetween(f.x - dx, y, f.x - dx2, y2);
    }
    g.fillStyle(0xffffff, a * 0.7);
    g.fillCircle(f.x + dx, y, 2);
    g.fillCircle(f.x - dx, y, 2);
  }
};

export const sparkle: EffectPainter = (g, f, t, a, size) => {
  const n = 10;
  const dist = (8 + t * 44) * size;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2 + t;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist;
    const s = 7 * (1 - t * 0.5) * size * (0.6 + 0.4 * Math.sin(f.seed + k * 3 + t * 10));
    g.lineStyle(2, f.color, a * 0.9);
    g.lineBetween(px - s, py, px + s, py);
    g.lineBetween(px, py - s, px, py + s);
  }
};
