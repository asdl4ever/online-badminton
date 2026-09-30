import type { EffectPainter } from './types';

export const shards: EffectPainter = (g, f, t, a, size) => {
  const n = 10;
  const dist = (10 + t * 50) * size;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2 + t * 0.5;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist;
    const s = 10 * (1 - t * 0.6) * size;
    const spin = ang + t * 3;
    g.fillStyle(f.color, a * 0.9);
    g.fillTriangle(
      px + Math.cos(spin) * s,
      py + Math.sin(spin) * s,
      px + Math.cos(spin + 2.2) * s,
      py + Math.sin(spin + 2.2) * s,
      px + Math.cos(spin + 4.4) * s,
      py + Math.sin(spin + 4.4) * s,
    );
  }
};

export const cross: EffectPainter = (g, f, t, a, size) => {
  const len = (18 + t * 50) * size;
  const ca = Math.cos(f.ang);
  const sa = Math.sin(f.ang);
  g.lineStyle(6 * a + 1, f.color, a * 0.9);
  g.lineBetween(f.x - ca * len, f.y - sa * len, f.x + ca * len, f.y + sa * len);
  g.lineBetween(f.x + sa * len, f.y - ca * len, f.x - sa * len, f.y + ca * len);
  g.lineStyle(2.5, 0xffffff, a * 0.6);
  g.lineBetween(f.x - ca * len * 0.6, f.y - sa * len * 0.6, f.x + ca * len * 0.6, f.y + sa * len * 0.6);
  g.fillStyle(0xffffff, a);
  g.fillCircle(f.x, f.y, 5 * size * a + 1);
};

export const sword: EffectPainter = (g, f, t, a, size) => {
  const len = (30 + t * 60) * size;
  const ca = Math.cos(f.ang);
  const sa = Math.sin(f.ang);
  g.lineStyle(9 * a + 1, f.color, a * 0.35);
  g.lineBetween(f.x - ca * len * 0.5, f.y - sa * len * 0.5, f.x + ca * len * 0.5, f.y + sa * len * 0.5);
  g.lineStyle(3 * a + 1, 0xffffff, a * 0.95);
  g.lineBetween(f.x - ca * len * 0.5, f.y - sa * len * 0.5, f.x + ca * len * 0.5, f.y + sa * len * 0.5);
};

export const swordcross: EffectPainter = (g, f, t, a, size) => {
  const len = (24 + t * 50) * size;
  const ca = Math.cos(f.ang);
  const sa = Math.sin(f.ang);
  g.lineStyle(5 * a + 1, f.color, a * 0.9);
  g.lineBetween(f.x - sa * len, f.y + ca * len, f.x + sa * len, f.y - ca * len);
  g.lineStyle(3 * a + 1, 0xffffff, a * 0.9);
  g.lineBetween(f.x - ca * len, f.y - sa * len, f.x + ca * len, f.y + sa * len);
};

export const shuriken: EffectPainter = (g, f, t, a, size) => {
  const r = (14 + t * 44) * size;
  const rot = f.seed + t * 9;
  g.fillStyle(f.color, a * 0.95);
  for (let k = 0; k < 4; k++) {
    const ang = rot + (k / 4) * Math.PI * 2;
    g.fillTriangle(
      f.x, f.y,
      f.x + Math.cos(ang) * r, f.y + Math.sin(ang) * r,
      f.x + Math.cos(ang + 0.5) * r * 0.4, f.y + Math.sin(ang + 0.5) * r * 0.4,
    );
  }
  g.fillStyle(0x1a1a22, a * 0.8);
  g.fillCircle(f.x, f.y, 4 * size);
};

export const claw: EffectPainter = (g, f, t, a, size) => {
  const len = (20 + t * 46) * size;
  const ca = Math.cos(f.ang);
  const sa = Math.sin(f.ang);
  g.lineStyle(3 * a + 1, f.color, a * 0.9);
  for (let k = -1; k <= 1; k++) {
    const px = f.x + sa * k * 7 * size;
    const py = f.y - ca * k * 7 * size;
    g.beginPath();
    g.arc(px, py, len, f.ang - 0.4, f.ang + 0.4, false, 0);
    g.strokePath();
  }
};

export const icicle: EffectPainter = (g, f, t, a, size) => {
  const n = 10;
  const reach = (10 + t * 50) * size;
  g.fillStyle(f.color, a * 0.85);
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2;
    g.fillTriangle(
      f.x + Math.cos(ang - 0.14) * reach * 0.4, f.y + Math.sin(ang - 0.14) * reach * 0.4,
      f.x + Math.cos(ang + 0.14) * reach * 0.4, f.y + Math.sin(ang + 0.14) * reach * 0.4,
      f.x + Math.cos(ang) * reach, f.y + Math.sin(ang) * reach,
    );
  }
};

export const boulder: EffectPainter = (g, f, t, a, size) => {
  const r = (10 + t * 26) * size;
  const rot = f.seed + t * 2;
  g.fillStyle(f.color, a * 0.9);
  g.beginPath();
  for (let k = 0; k < 7; k++) {
    const ang = rot + (k / 7) * Math.PI * 2;
    const rr = r * (0.78 + 0.22 * Math.abs(Math.sin(k * 2.7)));
    const px = f.x + Math.cos(ang) * rr;
    const py = f.y + Math.sin(ang) * rr;
    if (k === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fillPath();
  g.lineStyle(2, 0x1a1a22, a * 0.4);
  g.strokePath();
  for (let k = 0; k < 6; k++) {
    const ang = f.seed + k * 1.1 + t * 3;
    g.fillStyle(f.color, a * 0.7);
    g.fillCircle(f.x + Math.cos(ang) * (30 + t * 30) * size, f.y + Math.sin(ang) * (30 + t * 30) * size, 3 * (1 - t) * size + 1);
  }
};

export const quake: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 3; k++) {
    const rt = Math.min(1, t * 1.6 - k * 0.18);
    if (rt <= 0) continue;
    g.lineStyle(4 - k, f.color, a * (0.8 - k * 0.2));
    g.strokeEllipse(f.x, f.y, (12 + rt * 70) * size, (6 + rt * 26) * size);
  }
  g.lineStyle(2.5 * a + 0.5, 0xffffff, a * 0.5);
  for (let k = -2; k <= 2; k++) {
    g.lineBetween(f.x + k * 8 * size, f.y + 6 * size, f.x + k * 14 * size, f.y + 22 * size);
  }
};

export const meteor: EffectPainter = (g, f, t, a, size) => {
  const hx = f.x + Math.cos(f.ang) * (1 - t) * 80 * size;
  const hy = f.y + Math.sin(f.ang) * (1 - t) * 80 * size - (1 - t) * 80;
  const tail = (18 + t * 30) * size;
  g.lineStyle(6 * a + 1, f.color, a * 0.5);
  g.lineBetween(hx - Math.cos(f.ang) * tail, hy - Math.sin(f.ang) * tail, hx, hy);
  g.fillStyle(0xffffff, a);
  g.fillCircle(hx, hy, 5 * size * a + 1);
  g.lineStyle(3 * a + 1, f.color, a * 0.7);
  g.strokeCircle(f.x, f.y, (8 + t * 40) * size);
};

export const meteorrain: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 6; k++) {
    const ph = Math.min(1, t * 1.5 + k * 0.12);
    const ang = f.seed * 2 + k * 1.05;
    const px = f.x + Math.cos(ang) * (14 + k * 7) * size;
    const py = f.y - 70 * size + ph * 90 * size + Math.sin(ang) * 20 * size;
    g.lineStyle(3, f.color, a * 0.8);
    g.lineBetween(px, py - 18 * size, px, py);
    g.fillStyle(0xffffff, a);
    g.fillCircle(px, py, 3.5 * size);
  }
};

export const arrow: EffectPainter = (g, f, t, a, size) => {
  const n = 4;
  const dist = (12 + t * 52) * size;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    const L = 14 * size;
    g.lineStyle(3 * a + 1, f.color, a * 0.9);
    g.lineBetween(px - ca * L, py - sa * L, px + ca * L, py + sa * L);
    g.fillStyle(f.color, a * 0.9);
    g.fillTriangle(
      px + ca * L, py + sa * L,
      px + ca * L - ca * 8 - sa * 6, py + sa * L - sa * 8 + ca * 6,
      px + ca * L - ca * 8 + sa * 6, py + sa * L - sa * 8 - ca * 6,
    );
  }
};

export const aim: EffectPainter = (g, f, t, a, size) => {
  const r = (10 + t * 40) * size;
  g.lineStyle(2.5 * a + 1, f.color, a * 0.9);
  g.strokeCircle(f.x, f.y, r);
  g.strokeCircle(f.x, f.y, r * 0.45);
  const gap = r + 6;
  const len = 12 * (1 - t * 0.6) * size;
  g.lineBetween(f.x - gap, f.y, f.x - gap - len, f.y);
  g.lineBetween(f.x + gap, f.y, f.x + gap + len, f.y);
  g.lineBetween(f.x, f.y - gap, f.x, f.y - gap - len);
  g.lineBetween(f.x, f.y + gap, f.x, f.y + gap + len);
};

export const shield: EffectPainter = (g, f, t, a, size) => {
  const sides = 6;
  const r = (12 + t * 36) * size;
  g.lineStyle(4 * a + 1, f.color, a * 0.85);
  g.beginPath();
  for (let k = 0; k <= sides; k++) {
    const ang = -Math.PI / 2 + (k / sides) * Math.PI * 2;
    const px = f.x + Math.cos(ang) * r;
    const py = f.y + Math.sin(ang) * r;
    if (k === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.strokePath();
  g.fillStyle(f.color, 0.18 * a);
  g.fillCircle(f.x, f.y, r * 0.8);
  g.lineStyle(2, 0xffffff, a * 0.5);
  g.lineBetween(f.x, f.y - r * 0.7, f.x + (1 - t) * r * 0.5, f.y);
};

export const chain: EffectPainter = (g, f, t, a, size) => {
  const n = 7;
  const dist = (10 + t * 44) * size;
  g.lineStyle(3 * a + 1, f.color, a * 0.9);
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist;
    const rot = ang + t * 2;
    g.strokeEllipse(px - Math.cos(rot) * 4, py - Math.sin(rot) * 4, 10, 6);
    g.strokeEllipse(px + Math.cos(rot) * 4, py + Math.sin(rot) * 4, 10, 6);
  }
};

export const thorn: EffectPainter = (g, f, t, a, size) => {
  const n = 12;
  const len = (10 + t * 44) * size;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    g.lineStyle(2.4 * a + 0.5, f.color, a * 0.9);
    g.lineBetween(f.x, f.y, f.x + ca * len, f.y + sa * len);
    g.fillStyle(f.color, a * 0.9);
    g.fillTriangle(
      f.x + ca * len * 0.6 - sa * 4, f.y + sa * len * 0.6 + ca * 4,
      f.x + ca * len * 0.6 + sa * 4, f.y + sa * len * 0.6 - ca * 4,
      f.x + ca * len * 0.6 + ca * 8, f.y + sa * len * 0.6 + sa * 8,
    );
  }
};

export const thorncrown: EffectPainter = (g, f, t, a, size) => {
  const r = (14 + t * 34) * size;
  const rot = f.seed + t * 2;
  for (let k = 0; k < 12; k++) {
    const ang = rot + (k / 12) * Math.PI * 2;
    const px = f.x + Math.cos(ang) * r;
    const py = f.y + Math.sin(ang) * r;
    g.lineStyle(3 * a + 0.5, f.color, a * 0.9);
    g.lineBetween(f.x + Math.cos(ang) * r * 0.6, f.y + Math.sin(ang) * r * 0.6, px, py);
    g.fillStyle(f.color, a * 0.9);
    g.fillTriangle(
      px - Math.sin(ang) * 4, py + Math.cos(ang) * 4,
      px + Math.sin(ang) * 4, py - Math.cos(ang) * 4,
      px + Math.cos(ang) * 9, py + Math.sin(ang) * 9,
    );
  }
};
