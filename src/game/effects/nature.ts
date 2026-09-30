import type { EffectPainter } from './types';

export const petal: EffectPainter = (g, f, t, a, size) => {
  const n = 13;
  const dist = (10 + t * 52) * size;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2 + t * 1.2;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist;
    g.fillStyle(f.color, a * 0.9);
    g.fillEllipse(px, py, 9 * (1 - t * 0.5), 5 * (1 - t * 0.5));
  }
};

export const feather: EffectPainter = (g, f, t, a, size) => {
  const n = 6;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2 + t * 0.6;
    const dist = (8 + t * 40) * size;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist + t * 18 * size;
    const rot = ang + t * 1.5;
    const L = 12 * (1 - t * 0.4) * size;
    g.fillStyle(f.color, a * 0.85);
    g.fillEllipse(px, py, L * 1.1, L * 0.5);
    g.lineStyle(1.4, 0xffffff, a * 0.5);
    g.lineBetween(px - Math.cos(rot) * L, py - Math.sin(rot) * L, px + Math.cos(rot) * L, py + Math.sin(rot) * L);
  }
};

export const blossom: EffectPainter = (g, f, t, a, size) => {
  const petals = 6;
  const r = (8 + t * 40) * size;
  for (let k = 0; k < petals; k++) {
    const ang = f.seed + (k / petals) * Math.PI * 2 + t * 0.5;
    g.fillStyle(f.color, a * 0.85);
    g.fillEllipse(f.x + Math.cos(ang) * r * 0.6, f.y + Math.sin(ang) * r * 0.6, r * 0.9, r * 0.5);
  }
  g.fillStyle(0xfff0a0, a);
  g.fillCircle(f.x, f.y, 5 * size * a + 1);
};

export const sakura: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 12; k++) {
    const ph = (t + k / 12) % 1;
    const px = f.x + Math.sin(f.seed + k * 1.9) * 40 * size;
    const py = f.y - 30 * size + ph * 70 * size;
    const s = 7 * (1 - ph * 0.4) * size;
    g.fillStyle(f.color, a * 0.9);
    for (let q = 0; q < 5; q++) {
      const ang = (q / 5) * Math.PI * 2;
      g.fillEllipse(px + Math.cos(ang) * s * 0.5, py + Math.sin(ang) * s * 0.5, s * 0.7, s * 0.5);
    }
  }
};

export const leafstorm: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 10; k++) {
    const ang = f.seed + k * 2.399 + t * 2;
    const dist = (8 + t * 44) * size * (0.5 + (k % 5) / 6);
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist + t * 10;
    g.fillStyle(k % 2 ? f.color : 0x8fbf5a, a * 0.9);
    g.fillEllipse(px, py, 10 * (1 - t * 0.3) * size, 5 * (1 - t * 0.3) * size);
  }
};

export const mushroom: EffectPainter = (g, f, t, a, size) => {
  const r = (14 + t * 40) * size;
  g.fillStyle(f.color, a * 0.8);
  g.fillCircle(f.x, f.y - r * 0.3, r);
  g.fillStyle(0xffffff, a * 0.35);
  g.fillRect(f.x - r * 0.4, f.y, r * 0.8, r * 0.9);
  g.lineStyle(2.5 * a + 0.5, f.color, a * 0.7);
  g.strokeCircle(f.x, f.y - r * 0.3, r);
  g.fillStyle(0xffffff, a * 0.5);
  for (let k = 0; k < 4; k++) {
    const ang = f.seed + k * 1.57;
    g.fillCircle(f.x + Math.cos(ang) * r * 0.5, f.y - r * 0.3 + Math.sin(ang) * r * 0.5, 3);
  }
};

export const wind: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 3; k++) {
    const r = (14 + t * 40 + k * 10) * size;
    const a0 = f.seed + k * 1.4 + t * 2;
    g.lineStyle(2.5 * a + 1, f.color, a * (0.8 - k * 0.18));
    g.beginPath();
    g.arc(f.x, f.y, r, a0, a0 + Math.PI * 1.3, false, 0);
    g.strokePath();
  }
};

export const tornado: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 3; k++) {
    g.beginPath();
    for (let s = 0; s <= 18; s++) {
      const u = s / 18;
      const ang = f.seed + u * 3 * Math.PI * 2 + t * 4 + k * 2.1;
      const rr = (6 + u * 24) * (1 - t * 0.4) * size;
      const px = f.x + Math.cos(ang) * rr;
      const py = f.y - 30 * size + u * 60 * size;
      if (s === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.lineStyle(3 * a + 0.5, f.color, a * (0.8 - k * 0.2));
    g.strokePath();
  }
};

export const sand: EffectPainter = (g, f, t, a, size) => {
  const n = 20;
  const dist = (8 + t * 46) * size;
  g.fillStyle(f.color, a * 0.85);
  for (let k = 0; k < n; k++) {
    const ang = f.seed + k * 2.399 + t * 2;
    const rr = dist * (0.4 + (k % 5) / 6);
    g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 2);
  }
};

export const smoke: EffectPainter = (g, f, t, a, size) => {
  const n = 5;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2;
    const dist = (6 + t * 34) * size;
    const px = f.x + Math.cos(ang) * dist;
    const py = f.y + Math.sin(ang) * dist - t * 10 * size;
    const rr = (10 + t * 16) * (1 - t * 0.2) * size;
    g.fillStyle(f.color, a * 0.35);
    g.fillCircle(px, py, rr);
  }
  g.fillStyle(0xffffff, a * 0.2);
  g.fillCircle(f.x, f.y, 6 * size * a);
};

export const tide: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 3; k++) {
    const r = (10 + t * 46 + k * 12) * size;
    g.lineStyle(3 - k * 0.5, f.color, a * (0.8 - k * 0.2));
    g.beginPath();
    for (let s = 0; s <= 16; s++) {
      const ang = f.seed + (s / 16) * Math.PI * 2;
      const rr = r + Math.sin(s * 1.5 + t * 6) * 4 * size;
      const px = f.x + Math.cos(ang) * rr;
      const py = f.y + Math.sin(ang) * rr;
      if (s === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.strokePath();
  }
};

export const tsunami: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 3; k++) {
    g.lineStyle(6 - k * 1.4, k === 1 ? 0xffffff : f.color, a * (0.75 - k * 0.15));
    g.beginPath();
    for (let s = 0; s <= 14; s++) {
      const u = s / 14;
      const px = f.x - 60 * size + u * 120 * size;
      const py = f.y + (k * 12 - 12) * size + Math.sin(u * 6 + t * 6 + k) * 8 * size;
      if (s === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.strokePath();
  }
};

export const foam: EffectPainter = (g, f, t, a, size) => {
  for (let k = 0; k < 9; k++) {
    const ang = f.seed + (k / 9) * Math.PI * 2 + t;
    const dist = (6 + t * 34) * size;
    const rr = (6 + (k % 3) * 3) * (1 - t * 0.3) * size;
    g.fillStyle(0xffffff, a * 0.5);
    g.fillCircle(f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist, rr);
    g.lineStyle(1.5, f.color, a * 0.6);
    g.strokeCircle(f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist, rr);
  }
};

export const acid: EffectPainter = (g, f, t, a, size) => {
  const n = 7;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2;
    const px = f.x + Math.cos(ang) * (8 + t * 30) * size;
    const py = f.y + Math.sin(ang) * (8 + t * 30) * size + t * 30 * size;
    g.fillStyle(f.color, a * 0.85);
    g.fillEllipse(px, py, 5, 9 + t * 6);
  }
};

export const poison: EffectPainter = (g, f, t, a, size) => {
  const n = 8;
  for (let k = 0; k < n; k++) {
    const ang = f.seed + (k / n) * Math.PI * 2 + t;
    const dist = (8 + t * 40) * size;
    g.fillStyle(f.color, a * 0.6);
    g.fillCircle(f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist - t * 12, 7 * (1 - t * 0.4) * size);
  }
};

export const volcano: EffectPainter = (g, f, t, a, size) => {
  const r = (10 + t * 30) * size;
  g.fillStyle(0x2a1408, a * 0.8);
  g.fillTriangle(f.x - r, f.y + r * 0.7, f.x + r, f.y + r * 0.7, f.x, f.y - r * 0.2);
  g.fillStyle(0xffb02a, a * 0.9);
  g.fillTriangle(f.x - r * 0.3, f.y - r * 0.1, f.x + r * 0.3, f.y - r * 0.1, f.x, f.y - r * 0.7 - t * 20);
  for (let k = 0; k < 6; k++) {
    const ang = f.seed + k * 1.05;
    g.fillStyle(k % 2 ? 0xffd07a : f.color, a * 0.8 * (1 - t * 0.4));
    g.fillCircle(f.x + Math.cos(ang) * (12 + t * 40) * size, f.y - 10 * size + Math.sin(ang) * (10 + t * 24) * size, 3.5 * (1 - t * 0.4) * size);
  }
};

export const blizzard: EffectPainter = (g, f, t, a, size) => {
  g.fillStyle(0xffffff, a * 0.9);
  for (let k = 0; k < 18; k++) {
    const ang = f.seed + k * 2.399;
    const dist = (10 + t * 50) * size * (0.5 + (k % 5) / 6);
    g.fillCircle(f.x + Math.cos(ang) * dist, f.y + Math.sin(ang) * dist, 2.5);
  }
  g.lineStyle(2.5 * a + 0.5, f.color, a * 0.7);
  for (let k = 0; k < 6; k++) {
    const ang = f.seed + (k / 6) * Math.PI * 2;
    g.lineBetween(f.x + Math.cos(ang) * 20 * size, f.y + Math.sin(ang) * 20 * size, f.x + Math.cos(ang) * 50 * size, f.y + Math.sin(ang) * 50 * size);
  }
};
