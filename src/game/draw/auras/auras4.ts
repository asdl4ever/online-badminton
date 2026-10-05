import { apoly, aline, TAU, type AuraArt } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第四批主题光环 → 背景特效（衙门 / 风暴 / 月宫 / 维京 / 猎游 / 剧院 / 北境 / 威尼斯 / 奥林匹斯 / 桑巴） */
export const AURAS_4: Record<string, AuraArt> = {
  pagodAuraA: { c: 0xffb03a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 祥云：身后盘绕的祥云
    for (let k = 0; k < 4; k++) {
      const ph = (now / 1500 + k / 4) % 1;
      g.fillStyle(k % 2 ? c : a, 0.22 * Math.sin(ph * Math.PI));
      g.fillEllipse(-60 + ph * 120, 40 - ph * 160, 80, 20);
      g.lineStyle(1.6, a, 0.4);
      g.beginPath(); g.arc(-60 + ph * 120, 40 - ph * 160, 14, Math.PI * 0.9, Math.PI * 1.7); g.strokePath();
    }
  } },
  pagodAuraB: { c: 0xffd45c, a: 0xfff0c0, draw: (g, now, c, a) => {
    // 金光：背后一道佛光
    const r = 86 + Math.sin(now / 600) * 6;
    g.fillStyle(c, 0.18); g.fillCircle(0, -20, r);
    g.lineStyle(4, c, 0.5); g.beginPath(); g.arc(0, -20, r, Math.PI * 0.85, Math.PI * 2.15); g.strokePath();
    g.lineStyle(2, a, 0.7); g.beginPath(); g.arc(0, -20, r - 16, Math.PI * 0.9, Math.PI * 2.1); g.strokePath();
  } },
  stormAuraA: { c: 0x9fd8ff, a: 0xeaf2fa, draw: (g, now, c, a) => {
    // 风幕：横向掠过的风刀
    for (let k = 0; k < 6; k++) {
      const ph = (now / 450 + k / 6) % 1;
      g.lineStyle(3, k % 2 ? c : a, (1 - ph) * 0.6);
      g.lineBetween(-110 + ph * 220, -100 + (k * 33) % 190, -70 + ph * 220, -100 + (k * 33) % 190);
    }
  } },
  stormAuraB: { c: 0xffffff, a: 0x7ae0ff, draw: (g, now, c, a) => {
    // 雷幕：身后劈下的闪电
    for (let k = 0; k < 2; k++) {
      const bx = k ? 34 : -30;
      const j = Math.sin(now / 70 + k * 5) * 8;
      aline(g, [[bx, -150], [bx + 10 + j, -100], [bx - 6 - j, -56], [bx + 8, -10]], 2.4, a, 0.6 + 0.4 * Math.abs(Math.sin(now / 90)));
    }
    g.fillStyle(c, 0.12); g.fillCircle(0, -20, 84);
  } },
  lunarAuraA: { c: 0xe8f0ff, a: 0xb8c4e8, draw: (g, now, c, a) => {
    // 月晕：背后一轮月晕
    g.fillStyle(c, 0.14); g.fillCircle(0, -60, 96);
    g.lineStyle(3, a, 0.4); g.strokeCircle(0, -60, 82);
    g.fillStyle(c, 0.75); g.fillCircle(0, -60, 40);
  } },
  lunarAuraB: { c: 0xffe89a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 桂雨：落下的金色桂雨
    for (let k = 0; k < 10; k++) {
      const ph = (now / 1100 + k / 10) % 1;
      g.fillStyle(k % 2 ? c : a, 0.85 * Math.sin(ph * Math.PI));
      g.fillCircle(-76 + (k * 17) % 152 + Math.sin(now / 400 + k) * 6, -140 + ph * 260, 2.4);
    }
  } },
  vikingAuraA: { c: 0xffb03a, a: 0x8a6a4a, draw: (g, now, c, a) => {
    // 战吼：身后升腾的战火与符文
    for (let k = 0; k < 3; k++) {
      const ph = (now / 600 + k / 3) % 1;
      apoly(g, [
        [-40 + k * 34, 100], [-26 + k * 34, 100], [-32 + k * 34 + Math.sin(now / 300 + k) * 5, 100 - ph * 170], [-38 + k * 34, 100 - ph * 170],
      ], k % 2 ? c : a, 0.4 * (1 - ph));
    }
  } },
  vikingAuraB: { c: 0x8fb4de, a: 0xffffff, draw: (g, now, c, a) => {
    // 极光弦月：背后的极光带
    for (let k = 0; k < 3; k++) {
      apoly(g, Array.from({ length: 9 }, (_, s) => {
        const u = s / 8;
        return [-96 + u * 192, -110 + k * 16 + Math.sin(u * 4 + now / 500 + k) * 12] as [number, number];
      }).concat(Array.from({ length: 9 }, (_, s) => {
        const u = 1 - s / 8;
        return [-96 + u * 192, -140 + k * 16 + Math.sin(u * 4 + now / 500 + k) * 12] as [number, number];
      })), k === 0 ? c : k === 1 ? a : 0x7dffc4, 0.35);
    }
  } },
  safariAuraA: { c: 0xd8c8a0, a: 0xc9803a, draw: (g, now, c, a) => {
    // 热气：草原热浪
    for (let k = 0; k < 3; k++) {
      g.lineStyle(4, k % 2 ? c : a, 0.25);
      g.beginPath();
      for (let s = 0; s <= 10; s++) {
        const u = s / 10;
        const px = -80 + u * 160;
        const py = 50 - k * 24 + Math.sin(u * 5 + now / 280 + k) * 6;
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokePath();
    }
  } },
  safariAuraB: { c: 0xff9a4a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 夕阳：背后斜射的夕阳光束
    for (let k = 0; k < 3; k++) {
      apoly(g, [
        [-30 + k * 34, -150], [-16 + k * 34, -150], [40 + k * 10, 110], [16 + k * 10, 110],
      ], k % 2 ? c : a, 0.2);
    }
  } },
  theatAuraA: { c: 0xffd45c, a: 0xfff0c0, draw: (g, now, c, a) => {
    // 舞台灯：三道追光
    for (let k = 0; k < 3; k++) {
      const sw = Math.sin(now / 800 + k * 2) * 18;
      apoly(g, [
        [-60 + k * 60, -160], [-40 + k * 60, -160], [10 + k * 24 + sw, 110], [-10 + k * 24 + sw, 110],
      ], k % 2 ? c : a, 0.2);
    }
  } },
  theatAuraB: { c: 0xfff0c0, a: 0xc86ad9, draw: (g, now, c, a) => {
    // 纱幕：垂落的半透纱幕
    g.fillStyle(c, 0.14);
    g.fillRect(-88, -150, 176, 260);
    for (let k = 0; k < 6; k++) {
      g.lineStyle(2, a, 0.35);
      g.lineBetween(-76 + k * 30, -150, -76 + k * 30 + Math.sin(now / 500 + k) * 5, 110);
    }
  } },
  boreaAuraA: { c: 0xffffff, a: 0x9ad4ff, draw: (g, now, c, a) => {
    // 雪幕：纷扬的雪
    for (let k = 0; k < 11; k++) {
      const ph = (now / 1300 + k / 11) % 1;
      g.fillStyle(c, 0.8 * Math.sin(ph * Math.PI));
      g.fillCircle(-80 + (k * 16) % 160 + Math.sin(now / 380 + k) * 9, -140 + ph * 270, 2.4);
    }
  } },
  boreaAuraB: { c: 0x7dffc4, a: 0x9ad4ff, draw: (g, now, c, a) => {
    // 极光：身后大面积极光帷幕
    for (let k = 0; k < 3; k++) {
      apoly(g, Array.from({ length: 11 }, (_, s) => {
        const u = s / 10;
        return [-96 + u * 192, -130 + k * 20 + Math.sin(u * 5 + now / 420 + k) * 14] as [number, number];
      }).concat(Array.from({ length: 11 }, (_, s) => {
        const u = 1 - s / 10;
        return [-96 + u * 192, -60 + k * 20 + Math.sin(u * 5 + now / 420 + k) * 14] as [number, number];
      })), k === 0 ? c : k === 1 ? a : 0xb8a8ff, 0.3);
    }
  } },
  venicAuraA: { c: 0xbfe8f0, a: 0x3a8ab0, draw: (g, now, c, a) => {
    // 水光：身后荡开的水波
    for (let k = 0; k < 4; k++) {
      g.lineStyle(2.4, k % 2 ? c : a, 0.35);
      g.beginPath();
      g.arc(0, 70, 40 + k * 22, Math.PI * 1.1, Math.PI * 1.9);
      g.strokePath();
    }
  } },
  venicAuraB: { c: 0xffd8a0, a: 0xff9a4a, draw: (g, now, c, a) => {
    // 落日金：运河上的金色反光
    g.fillStyle(c, 0.16); g.fillCircle(0, 20, 90);
    for (let k = 0; k < 6; k++) {
      const ph = (now / 900 + k / 6) % 1;
      g.fillStyle(a, 0.6 * Math.sin(ph * Math.PI));
      g.fillRect(-60 + (k * 21) % 120, -120 + ph * 220, 5, 14);
    }
  } },
  olympAuraA: { c: 0xffd45c, a: 0x5a9a3a, draw: (g, now, c, a) => {
    // 橄榄枝环：背后的月桂环
    g.lineStyle(4, a, 0.6);
    g.beginPath(); g.arc(0, -10, 84, Math.PI * 0.75, Math.PI * 2.25); g.strokePath();
    for (let k = 0; k < 10; k++) {
      const ang = Math.PI * 0.8 + (k / 10) * Math.PI * 1.4;
      g.fillStyle(k % 2 ? a : 0x7ed957, 0.7);
      g.fillEllipse(Math.cos(ang) * 84, -10 + Math.sin(ang) * 84, 12, 5);
    }
  } },
  olympAuraB: { c: 0xfff0b0, a: 0xffd45c, draw: (g, now, c, a) => {
    // 神光柱：天降神光
    apoly(g, [[-34, -160], [34, -160], [76, 110], [-76, 110]], c, 0.22);
    apoly(g, [[-16, -160], [16, -160], [36, 110], [-36, 110]], a, 0.3);
  } },
  sambaAuraA: { c: 0xff8ad4, a: 0x4ac8ff, draw: (g, now, c, a) => {
    // 彩带雨：漫天彩带
    for (let k = 0; k < 10; k++) {
      const ph = (now / 900 + k / 10) % 1;
      g.fillStyle([c, a, 0xffd45c, 0x3aa05a][k % 4], 0.85 * Math.sin(ph * Math.PI));
      g.save();
      g.translateCanvas(-80 + (k * 17) % 160, -140 + ph * 270);
      g.rotateCanvas(Math.sin(now / 260 + k) * 1.4);
      g.fillRect(-2.4, -6, 4.8, 12);
      g.restore();
    }
  } },
  sambaAuraB: { c: 0xffd45c, a: 0xffffff, draw: (g, now, c, a) => {
    // 舞台爆闪：随节奏爆闪的舞台光
    const beat = Math.abs(Math.sin(now / 300));
    g.fillStyle(c, 0.1 + beat * 0.16);
    g.fillCircle(0, -10, 100);
    g.fillStyle(a, 0.1 + beat * 0.2);
    apoly(g, [[0, -150], [60, -60], [26, -60], [40, 30], [8, -30], [-24, 40], [-14, -60], [-52, -50]], a, 0.25 + beat * 0.3);
  } },
};
