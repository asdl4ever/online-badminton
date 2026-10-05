import { apoly, aline, TAU, type AuraArt } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第二批主题光环 → 背景特效（海盗 / 蒸汽 / 太空 / 侏罗纪 / 蘑菇 / 热带 / 墓地 / 节日 / 寿司 / 西部） */
export const AURAS_2: Record<string, AuraArt> = {
  pirateAuraA: { c: 0x5fd0c0, a: 0xffffff, draw: (g, now, c, a) => {
    // 海雾：贴身翻涌的海雾
    for (let k = 0; k < 4; k++) {
      const ph = (now / 1300 + k / 4) % 1;
      g.fillStyle(k % 2 ? c : a, 0.22 * Math.sin(ph * Math.PI));
      g.fillEllipse(-60 + ph * 120, 30 - ph * 100, 90, 20);
    }
  } },
  pirateAuraB: { c: 0xd8c8a0, a: 0xffd45c, draw: (g, now, c, a) => {
    // 藏宝光：背后一束束往上冒的金光
    for (let k = 0; k < 5; k++) {
      const ph = (now / 800 + k / 5) % 1;
      apoly(g, [
        [-50 + k * 25, 100], [-42 + k * 25, 100], [-36 + k * 25 + Math.sin(now / 400 + k) * 6, 100 - ph * 220], [-44 + k * 25, 100 - ph * 220],
      ], a, 0.35 * (1 - ph));
    }
  } },
  steamAuraA: { c: 0xffb03a, a: 0xdfe6f0, draw: (g, now, c, a) => {
    // 蒸汽：背后呲起的白汽
    for (let k = 0; k < 6; k++) {
      const ph = (now / 700 + k / 6) % 1;
      g.fillStyle(a, 0.4 * (1 - ph));
      g.fillCircle(-30 + (k % 3) * 30, 60 - ph * 170, 8 + ph * 14);
    }
    g.fillStyle(c, 0.3); g.fillCircle(0, 40, 40); // 炉火光
  } },
  steamAuraB: { c: 0x8fd8ff, a: 0x9aa7b8, draw: (g, now, c, a) => {
    // 齿轮辉光：背后旋转的巨型齿轮虚影
    g.lineStyle(3, c, 0.4);
    g.beginPath(); g.arc(0, 20, 78, 0, TAU); g.strokePath();
    g.fillStyle(c, 0.5);
    for (let k = 0; k < 10; k++) {
      const ang = (k / 10) * TAU + now / 1500;
      g.fillRect(Math.cos(ang) * 78 - 4, 20 + Math.sin(ang) * 78 - 4, 8, 8);
    }
  } },
  astroAuraA: { c: 0xffb03a, a: 0xffe89a, draw: (g, now, c, a) => {
    // 日冕：背后一圈太阳耀斑
    const r = 90 + Math.sin(now / 400) * 8;
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * TAU;
      g.lineStyle(2.4, k % 2 ? c : a, 0.55);
      g.lineBetween(Math.cos(ang) * 44, -10 + Math.sin(ang) * 44, Math.cos(ang) * (r + 20), -10 + Math.sin(ang) * (r + 20));
    }
    g.fillStyle(a, 0.15); g.fillCircle(0, -10, r);
  } },
  astroAuraB: { c: 0x9fd8ff, a: 0xffffff, draw: (g, now, c, a) => {
    // 星尘：环绕的星尘带
    for (let k = 0; k < 14; k++) {
      const ang = (k / 14) * TAU + now / 900;
      const rx = 84, ry = 40 + (k % 3) * 22;
      g.fillStyle(k % 3 ? c : a, 0.85);
      g.fillCircle(Math.cos(ang) * rx, -10 + Math.sin(ang) * ry, 2.2);
    }
  } },
  juraAuraA: { c: 0x9fe86a, a: 0x5a7a3a, draw: (g, now, c, a) => {
    // 植被：背后探出的蕨影
    for (let k = 0; k < 3; k++) {
      const bx = k ? 60 : -60, dir = k ? -1 : 1;
      g.lineStyle(3.4, a, 0.7);
      g.lineBetween(bx, 100, bx + dir * 24, 20);
      for (let s = 0; s < 4; s++) {
        g.fillStyle(c, 0.7);
        g.fillEllipse(bx + dir * (8 + s * 6), 84 - s * 20, 14, 5);
      }
    }
  } },
  juraAuraB: { c: 0xffb03a, a: 0xffe8b0, draw: (g, now, c, a) => {
    // 琥珀雨：落下的琥珀滴
    for (let k = 0; k < 8; k++) {
      const ph = (now / 1200 + k / 8) % 1;
      g.fillStyle(k % 2 ? c : a, 0.8 * Math.sin(ph * Math.PI));
      g.fillCircle(-76 + (k * 19) % 152, -140 + ph * 260, 3.4);
    }
  } },
  mushAuraA: { c: 0xa8ff7a, a: 0xd8e8b0, draw: (g, now, c, a) => {
    // 孢子：身后上浮的荧光孢子
    for (let k = 0; k < 10; k++) {
      const ph = (now / 1400 + k / 10) % 1;
      g.fillStyle(k % 2 ? c : a, 0.7 * (1 - ph));
      g.fillCircle(-60 + (k * 13) % 120 + Math.sin(now / 500 + k) * 8, 100 - ph * 210, 3 * (1 - ph) + 0.8);
    }
  } },
  mushAuraB: { c: 0xffe89a, a: 0xffc04a, draw: (g, now, c, a) => {
    // 菌光环：伞盖形的辉光罩
    g.fillStyle(c, 0.2); g.fillEllipse(0, -50, 190, 110);
    g.lineStyle(2.4, a, 0.5);
    g.beginPath(); g.arc(0, -30, 84, Math.PI * 1.05, Math.PI * 1.95); g.strokePath();
  } },
  tropicAuraA: { c: 0xbfe8f0, a: 0x3ac8c8, draw: (g, now, c, a) => {
    // 水汽：升腾的水汽帘
    for (let k = 0; k < 5; k++) {
      const ph = (now / 1000 + k / 5) % 1;
      g.fillStyle(k % 2 ? c : a, 0.3 * (1 - ph));
      g.fillEllipse(-48 + k * 24, 90 - ph * 190, 26, 10);
    }
  } },
  tropicAuraB: { c: 0x5fe8d0, a: 0xffffff, draw: (g, now, c, a) => {
    // 泡沫：身后一串上浮的泡泡
    for (let k = 0; k < 9; k++) {
      const ph = (now / 1500 + k / 9) % 1;
      const px = -70 + ((k * 17) % 140) + Math.sin(now / 600 + k) * 6;
      g.lineStyle(1.4, a, 0.7 * (1 - ph));
      g.strokeCircle(px, 100 - ph * 230, 4 + (k % 3) * 2.4);
    }
  } },
  cryptAuraA: { c: 0x9fd8a0, a: 0x6a4a9a, draw: (g, now, c, a) => {
    // 魂火：两簇飘忽的鬼火
    for (const s of [-1, 1]) {
      const fx = s * (46 + Math.sin(now / 600 + s) * 10);
      const fy = -20 + Math.sin(now / 400 + s * 2) * 16;
      g.fillStyle(a, 0.25); g.fillCircle(fx, fy, 18);
      g.fillStyle(c, 0.8); g.fillCircle(fx, fy, 7);
      g.fillStyle(0xffffff, 0.9); g.fillCircle(fx - 2, fy - 2, 2.6);
    }
  } },
  cryptAuraB: { c: 0xffb03a, a: 0x6a6a74, draw: (g, now, c, a) => {
    // 石像阴影：背后一座石翼剪影
    apoly(g, [[-70, 90], [-40, -90], [-6, -30], [0, -70], [6, -30], [40, -90], [70, 90]], a, 0.3);
    g.lineStyle(2, c, 0.4);
    g.strokeRect(-40, -60, 80, 130);
  } },
  festivAuraA: { c: 0xffffff, a: 0x5ac8ff, draw: (g, now, c, a) => {
    // 雪幕：漫天细雪
    for (let k = 0; k < 12; k++) {
      const ph = (now / 1400 + k / 12) % 1;
      g.fillStyle(c, 0.85 * Math.sin(ph * Math.PI));
      g.fillCircle(-80 + (k * 15) % 160 + Math.sin(now / 400 + k) * 10, -140 + ph * 270, 2.2);
    }
  } },
  festivAuraB: { c: 0xffd45c, a: 0x3aa05a, draw: (g, now, c, a) => {
    // 圣诞星：背后一颗大圣诞星
    const pts: Array<[number, number]> = [];
    for (let k = 0; k < 10; k++) {
      const ang = -Math.PI / 2 + (k / 10) * TAU;
      const r = (k % 2 === 0 ? 80 : 34) + Math.sin(now / 400) * 4;
      pts.push([Math.cos(ang) * r * 0.7, -30 + Math.sin(ang) * r]);
    }
    apoly(g, pts, c, 0.35);
    g.fillStyle(a, 0.7); g.fillCircle(0, -30, 10);
  } },
  sushiAuraA: { c: 0xffffff, a: 0xd8e0e8, draw: (g, now, c, a) => {
    // 白雾：暖帘蒸腾的白雾
    for (let k = 0; k < 4; k++) {
      const ph = (now / 1100 + k / 4) % 1;
      g.fillStyle(c, 0.28 * Math.sin(ph * Math.PI));
      g.fillEllipse(-40 + (k % 2) * 80 + Math.sin(now / 500 + k) * 10, 80 - ph * 180, 56, 18);
    }
  } },
  sushiAuraB: { c: 0xffb7d5, a: 0xffffff, draw: (g, now, c, a) => {
    // 樱粉花瓣：旋转飘落的花瓣
    for (let k = 0; k < 8; k++) {
      const ph = (now / 1200 + k / 8) % 1;
      g.fillStyle(k % 2 ? c : a, 0.85 * Math.sin(ph * Math.PI));
      g.save();
      g.translateCanvas(-70 + (k * 19) % 140, -140 + ph * 260);
      g.rotateCanvas(now / 200 + k);
      apoly(g, [[0, -4], [4, 0], [0, 4], [-4, 0]], k % 2 ? c : a, 0.85 * Math.sin(ph * Math.PI));
      g.restore();
    }
  } },
  wildAuraA: { c: 0xffb03a, a: 0xc9803a, draw: (g, now, c, a) => {
    // 热浪：身后扭曲的热气层
    for (let k = 0; k < 3; k++) {
      g.lineStyle(4, k % 2 ? c : a, 0.22);
      g.beginPath();
      for (let s = 0; s <= 10; s++) {
        const u = s / 10;
        const px = -70 + u * 140;
        const py = 40 - k * 22 + Math.sin(u * 6 + now / 300 + k) * 5;
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokePath();
    }
  } },
  wildAuraB: { c: 0xff9a4a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 落日：背后一整轮落日
    g.fillStyle(c, 0.25); g.fillCircle(0, 60, 96);
    g.fillStyle(c, 0.5); g.fillCircle(0, 60, 64);
    g.fillStyle(a, 0.9); g.fillCircle(0, 60, 40);
    g.fillStyle(0xfff0c0, 0.8); g.fillCircle(0, 60, 24);
  } },
};
