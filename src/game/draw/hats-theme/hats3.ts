import { hpoly, hline, TAU, type HatArt } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第三批主题头饰（火山 / 深海沟 / 剑道 / 水墨 / 精灵 / 赛车 / 吸血鬼 / 秋日 / 竹林 / 小丑） */
export const HATS_3: Record<string, HatArt> = {
  vulcHelm: { c: 0x3a2a2a, a: 0xff5a1a, draw: (g, now, x, hy, c, a) => {
    // 熔岩头盔：黑盔 + 裂缝透光
    g.fillStyle(c, 1);
    g.beginPath(); g.arc(x, hy + 2, 17, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillRect(x - 17, hy + 2, 34, 5);
    g.lineStyle(2, a, 0.7 + 0.3 * Math.sin(now / 200));
    g.lineBetween(x - 10, hy - 8, x - 4, hy - 1);
    g.lineBetween(x + 4, hy - 10, x + 10, hy - 3);
    g.fillStyle(a, 0.5 + 0.2 * Math.sin(now / 160));
    g.fillCircle(x - 5, hy - 3, 2); g.fillCircle(x + 7, hy - 5, 1.6);
  } },
  vulcCrown: { c: 0xff5a1a, a: 0x3a2a2a, draw: (g, now, x, hy, c, a) => {
    // 火山王冠：黑色锯齿冠 + 岩浆尖
    for (let k = 0; k < 5; k++) {
      const px = x - 14 + k * 7;
      hpoly(g, [[px - 3.4, hy + 2], [px + 3.4, hy + 2], [px, hy - 12 - (k === 2 ? 6 : 0)]], k === 2 ? c : 0x3a2a2a);
    }
    g.fillStyle(0x3a2a2a, 1); g.fillRect(x - 16, hy + 1, 32, 4);
    g.lineStyle(1.6, c, 0.8 + 0.2 * Math.sin(now / 180));
    for (let k = 0; k < 5; k++) {
      const px = x - 14 + k * 7;
      g.lineBetween(px, hy - 4, px, hy - 8 - (k === 2 ? 5 : 0));
    }
  } },
  trenchDiver: { c: 0x8a94a2, a: 0x5ac8ff, draw: (g, now, x, hy, c, a) => {
    // 深潜头盔：黄铜球盔 + 三颗铆钉 + 圆窗
    g.fillStyle(c, 1); g.fillCircle(x, hy - 4, 16);
    g.fillStyle(0x6a7482, 0.9); g.fillRect(x - 16, hy + 4, 32, 5);
    g.fillStyle(0x2a3a4a, 0.9); g.fillCircle(x, hy - 5, 7.4); // 圆窗
    g.fillStyle(a, 0.5 + 0.2 * Math.sin(now / 350));
    g.fillCircle(x - 2, hy - 7, 3);
    g.fillStyle(0xd9b45c, 1);
    g.fillCircle(x - 10, hy + 2, 1.6); g.fillCircle(x + 10, hy + 2, 1.6); g.fillCircle(x, hy - 16, 1.6);
  } },
  trenchCrown: { c: 0x1a2a4a, a: 0x5affd8, draw: (g, now, x, hy, c, a) => {
    // 沟底王冠：深渊色冠 + 发光珊瑚尖
    g.fillStyle(c, 1); g.fillRect(x - 15, hy - 2, 30, 5);
    for (let k = 0; k < 4; k++) {
      const px = x - 12 + k * 8;
      const h = k === 1 || k === 2 ? 15 : 10;
      hpoly(g, [[px - 3, hy - 2], [px + 3, hy - 2], [px, hy - 2 - h]], k % 2 ? 0x24365a : c);
      const gl = 0.5 + 0.5 * Math.sin(now / 300 + k * 2);
      g.fillStyle(a, gl);
      g.fillCircle(px, hy - 3 - h, 2);
      g.fillStyle(c, 1);
    }
  } },
  dojoHachimaki: { c: 0xf0f0e8, a: 0xe8404a, draw: (g, now, x, hy, c, a) => {
    // 修行头带：白头带 + 后飘带 + 日之丸
    g.fillStyle(c, 1); g.fillRect(x - 16, hy - 10, 32, 9);
    const sway = Math.sin(now / 400) * 3;
    hpoly(g, [[x + 14, hy - 9], [x + 30, hy - 6 + sway], [x + 26, hy - 1 + sway], [x + 14, hy - 3]], c); // 飘带
    g.fillStyle(a, 1); g.fillCircle(x, hy - 5.5, 3.4); // 日之丸
  } },
  dojoCrown: { c: 0x2a3a6a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 大师之冠：黑金冠 + 弯月前立
    g.fillStyle(c, 1);
    hpoly(g, [[x - 14, hy + 2], [x - 10, hy - 12], [x + 10, hy - 12], [x + 14, hy + 2]], c);
    g.fillStyle(a, 1);
    g.fillCircle(x, hy - 16, 6);
    g.fillStyle(c, 1); g.fillCircle(x + 2.4, hy - 17.5, 5); // 弯月前立
    g.fillStyle(a, 0.8); g.fillRect(x - 14, hy - 1, 28, 2.4);
  } },
  inkwHat: { c: 0x2a2e36, a: 0x3a8a5a, draw: (g, now, x, hy, c, a) => {
    // 文人方巾：黑色四方巾 + 玉簪
    g.fillStyle(c, 1);
    hpoly(g, [[x - 13, hy + 2], [x + 13, hy + 2], [x + 13, hy - 12], [x - 13, hy - 12]], c);
    hpoly(g, [[x - 16, hy + 2], [x + 16, hy + 2], [x + 16, hy - 3], [x - 16, hy - 3]], 0x3a3e46); // 巾顶
    g.fillStyle(a, 0.9); g.fillRect(x - 16, hy - 4, 32, 2); // 玉色横带
    g.lineStyle(2, 0x8aa84a, 1);
    g.lineBetween(x + 13, hy - 8, x + 22, hy - 12); // 簪
  } },
  inkwCrown: { c: 0x2a2e36, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 状元冠：金翅乌纱
    g.fillStyle(c, 1);
    hpoly(g, [[x - 12, hy + 2], [x + 12, hy + 2], [x + 9, hy - 14], [x - 9, hy - 14]], c);
    g.fillStyle(a, 0.95); // 双翅
    g.fillEllipse(x - 19, hy - 12 + Math.sin(now / 500) * 1.5, 12, 4);
    g.fillEllipse(x + 19, hy - 12 + Math.sin(now / 500 + 1) * 1.5, 12, 4);
    g.fillStyle(a, 1); g.fillCircle(x, hy - 16, 2.6); // 帽顶宝珠
  } },
  fairyHat: { c: 0xffb7d5, a: 0x7ed957, draw: (g, now, x, hy, c, a) => {
    // 花冠：一圈小花
    g.fillStyle(a, 0.8); g.fillRect(x - 15, hy - 4, 30, 3); // 藤环
    for (let k = 0; k < 5; k++) {
      const px = x - 12 + k * 6;
      const ang = (k / 5) * TAU + now / 1200;
      g.fillStyle(k % 2 ? c : 0xffffff, 0.95);
      for (let s = 0; s < 5; s++) {
        g.fillEllipse(px + Math.cos(ang + (s / 5) * TAU) * 3, hy - 8 + Math.sin(ang + (s / 5) * TAU) * 3, 3.4, 2.4);
      }
      g.fillStyle(0xffe89a, 1); g.fillCircle(px, hy - 8, 1.6);
    }
  } },
  fairyCrown: { c: 0x7ed957, a: 0xffb7d5, draw: (g, now, x, hy, c, a) => {
    // 藤蔓王冠：盘绕的藤 + 花 + 蝴蝶
    g.lineStyle(2.6, c, 1);
    g.beginPath();
    for (let s = 0; s <= 10; s++) {
      const u = s / 10;
      const px = x - 15 + u * 30;
      const py = hy - 8 + Math.sin(u * 5 + now / 700) * 3;
      if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.strokePath();
    for (let k = 0; k < 3; k++) {
      g.fillStyle(k % 2 ? a : 0xffffff, 0.95);
      g.fillCircle(x - 9 + k * 9, hy - 10 + Math.sin(k * 2) * 2, 2.8);
    }
    const fl = Math.sin(now / 300) * 2;
    g.fillStyle(a, 0.9);
    g.fillEllipse(x + 16, hy - 16 + fl, 6, 4); g.fillEllipse(x + 16, hy - 20 + fl, 6, 4); // 蝴蝶
  } },
  racerHelm: { c: 0xe83a3a, a: 0x22222a, draw: (g, now, x, hy, c, a) => {
    // 车手头盔：红盔 + 深色面窗 + 白条纹
    g.fillStyle(c, 1);
    g.beginPath(); g.arc(x, hy + 2, 16, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillRect(x - 16, hy + 2, 32, 5);
    g.fillStyle(a, 0.9); g.fillRect(x - 11, hy - 7, 22, 6); // 面窗
    g.fillStyle(0x5ac8ff, 0.6); g.fillRect(x - 9, hy - 5.5, 18, 2);
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(x - 3, hy - 16, 6, 9); g.fillRect(x - 16, hy + 2, 32, 2); // 条纹
  } },
  racerCrown: { c: 0xffd45c, a: 0x5a9a3a, draw: (g, now, x, hy, c, a) => {
    // 冠军桂冠：金香槟 + 月桂环
    g.fillStyle(0x8a6a3a, 0.9); g.fillRect(x - 15, hy - 4, 30, 3);
    for (let k = 0; k < 8; k++) {
      const ang = Math.PI * 1.1 + (k / 8) * Math.PI * 0.8;
      g.fillStyle(k % 2 ? a : 0x7ed957, 0.9);
      g.fillEllipse(x + Math.cos(ang) * 17, hy - 6 + Math.sin(ang) * 12, 6, 3);
    }
    const bub = (now / 700) % 1;
    g.fillStyle(0xfff0c0, 0.8 * (1 - bub));
    g.fillCircle(x, hy - 18 - bub * 8, 2 * (1 - bub) + 0.6); // 香槟泡
  } },
  vampHat: { c: 0x1a1420, a: 0x8a1a2a, draw: (g, now, x, hy, c, a) => {
    // 血族礼帽：高顶礼帽 + 红帽带 + 蝙蝠扣
    g.fillStyle(c, 1);
    g.fillRect(x - 12, hy - 26, 24, 26);
    g.fillEllipse(x, hy, 36, 6); // 帽檐
    g.fillStyle(a, 0.9); g.fillRect(x - 12, hy - 10, 24, 4); // 帽带
    g.fillStyle(a, 1);
    hpoly(g, [[x - 5, hy - 8], [x - 2, hy - 11], [x, hy - 8], [x + 2, hy - 11], [x + 5, hy - 8]], a); // 蝙蝠翼扣
  } },
  vampCrown: { c: 0x1a1420, a: 0xc0203a, draw: (g, now, x, hy, c, a) => {
    // 血月王冠：黑冠尖齿 + 血月
    for (let k = 0; k < 5; k++) {
      const px = x - 14 + k * 7;
      hpoly(g, [[px - 3.4, hy + 2], [px + 3.4, hy + 2], [px, hy - 12 - (k === 2 ? 5 : 0)]], c);
    }
    g.fillStyle(c, 1); g.fillRect(x - 16, hy + 1, 32, 4);
    const gl = 0.6 + 0.3 * Math.sin(now / 300);
    g.fillStyle(a, gl);
    g.fillCircle(x, hy - 16, 6); // 血月
    g.fillStyle(0x8a1428, 0.7); g.fillCircle(x - 2, hy - 18, 1.6);
  } },
  autumnHat: { c: 0xd8b06a, a: 0xc95a2a, draw: (g, now, x, hy, c, a) => {
    // 麦秆帽：草帽 + 麦穗饰带
    g.fillStyle(c, 1);
    g.fillEllipse(x, hy + 2, 42, 8);
    g.beginPath(); g.arc(x, hy + 1, 13, Math.PI, TAU); g.closePath(); g.fillPath();
    g.lineStyle(1.4, 0xb08a4a, 0.8);
    g.lineBetween(x - 10, hy - 6, x + 10, hy - 6);
    g.fillStyle(a, 0.95);
    for (let k = 0; k < 5; k++) {
      const px = x - 8 + k * 4;
      g.fillEllipse(px, hy - 8, 2.4, 5); // 麦穗
    }
  } },
  autumnCrown: { c: 0xc95a2a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 枫叶王冠：一圈枫叶
    for (let k = 0; k < 6; k++) {
      const px = x - 14 + k * 5.6;
      g.save();
      g.translateCanvas(px, hy - 8);
      g.rotateCanvas((k - 2.5) * 0.25);
      for (let s = 0; s < 4; s++) {
        const ang = (s / 4) * TAU;
        hpoly(g, [[0, 0], [Math.cos(ang) * 6 - 1.6, Math.sin(ang) * 6], [Math.cos(ang) * 6 + 1.6, Math.sin(ang) * 6]], k % 2 ? c : a, 0.95);
      }
      g.restore();
    }
    g.fillStyle(0x8a5a2a, 0.9); g.fillRect(x - 16, hy - 2, 32, 3);
  } },
  pandaHat: { c: 0x8fbf5a, a: 0x2a2a2a, draw: (g, now, x, hy, c, a) => {
    // 竹叶帽：竹编帽 + 竹叶
    hpoly(g, [[x - 18, hy + 1], [x - 6, hy - 12], [x + 6, hy - 12], [x + 18, hy + 1]], 0xa8c878);
    g.lineStyle(1.2, 0x6a8a4a, 0.8);
    for (let k = -1; k <= 1; k++) hline(g, [[x + k * 8, hy - 9 + Math.abs(k) * 7], [x + k * 10, hy + 1]], 1.2, 0x6a8a4a, 0.8);
    for (const s of [-1, 1]) {
      g.save();
      g.translateCanvas(x + s * 8, hy - 10);
      g.rotateCanvas(s * 0.8);
      g.fillStyle(c, 0.95);
      g.fillEllipse(s * 6, -3, 10, 3.6);
      g.restore();
    }
    g.fillStyle(a, 0.8); g.fillCircle(x, hy - 11, 2); // 结
  } },
  pandaCrown: { c: 0x4a9a7a, a: 0x8fbf5a, draw: (g, now, x, hy, c, a) => {
    // 竹王冠：竹节排成冠
    for (let k = 0; k < 4; k++) {
      const px = x - 13 + k * 8.6;
      const h = k === 1 || k === 2 ? 16 : 11;
      g.fillStyle(k % 2 ? c : 0x3a7a5a, 0.95);
      g.fillRoundedRect(px - 3.4, hy - h, 6.8, h + 2, 3);
      g.fillStyle(a, 0.7); g.fillRect(px - 3.4, hy - h * 0.5, 6.8, 1.6); // 竹节
      g.fillStyle(0xffffff, 0.3); g.fillRect(px - 3.4, hy - h, 2, h + 2);
    }
  } },
  jokerHat: { c: 0xe83a5a, a: 0xf0f0f0, draw: (g, now, x, hy, c, a) => {
    // 方片帽：歪斜的方片花色帽
    g.save();
    g.translateCanvas(x, hy);
    g.rotateCanvas(-0.12);
    hpoly(g, [[-13, 2], [13, 2], [9, -18], [-9, -18]], c);
    g.fillStyle(a, 0.95);
    hpoly(g, [[0, -14], [4, -10], [0, -6], [-4, -10]], a); // 方片
    g.fillStyle(0xffffff, 0.5); g.fillRect(-9, -18, 18, 2);
    g.restore();
    g.fillStyle(0xffffff, 0.6); g.fillEllipse(x, hy + 2, 32, 4); // 帽檐
  } },
  jokerCrown: { c: 0xffd45c, a: 0xe83a5a, draw: (g, now, x, hy, c, a) => {
    // 国王牌冠：金冠 + 红宝石 + 小丑尖
    hpoly(g, [[x - 15, hy + 2], [x - 10, hy - 13], [x - 4, hy - 5], [x, hy - 18], [x + 4, hy - 5], [x + 10, hy - 13], [x + 15, hy + 2]], c);
    g.fillStyle(a, 1);
    g.fillCircle(x - 10, hy - 13, 2.2); g.fillCircle(x + 10, hy - 13, 2.2); g.fillCircle(x, hy - 18, 2.6); // 尖顶球
    g.fillStyle(0x2a1a44, 1); g.fillCircle(x, hy - 4, 2.8); // 宝石
    g.fillStyle(0xffffff, 0.5); g.fillCircle(x - 1, hy - 5, 1);
  } },
};
