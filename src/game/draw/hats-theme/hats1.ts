import { hpoly, hline, TAU, type HatArt } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第一批主题头饰（沙漠 / 云端 / 甜点 / 马戏 / 骑士 / 茶馆 / 魔法 / 化石 / 玩具 / 元宵 / 山海） */
export const HATS_1: Record<string, HatArt> = {
  desTurban: { c: 0xf0e0c0, a: 0xc9803a, draw: (g, now, x, hy, c, a) => {
    // 商队头巾：缠出的头巾 + 额前宝石
    g.fillStyle(c, 1);
    g.fillEllipse(x, hy - 6, 34, 22);
    g.lineStyle(3, 0xc8b088, 0.9);
    g.beginPath(); g.arc(x, hy - 4, 14, -2.9, -0.3); g.strokePath();
    g.beginPath(); g.arc(x, hy - 8, 11, -2.7, -0.5); g.strokePath();
    g.fillStyle(a, 1); g.fillCircle(x, hy - 12, 4); // 额饰
    g.fillStyle(0xffffff, 0.5); g.fillCircle(x - 1.4, hy - 13.4, 1.4);
  } },
  desScarab: { c: 0x2f8a6a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 圣甲虫帽：金环上一只张翅圣甲虫
    g.fillStyle(a, 1); g.fillRect(x - 16, hy - 2, 32, 5); // 金环
    const wing = Math.sin(now / 400) * 2;
    g.fillStyle(0x8fd4c0, 0.9);
    g.fillEllipse(x - 8, hy - 10 - wing, 10, 5);
    g.fillEllipse(x + 8, hy - 10 - wing, 10, 5);
    g.fillStyle(c, 1); g.fillEllipse(x, hy - 10, 14, 12); // 虫身
    g.lineStyle(1.4, a, 0.9); g.lineBetween(x, hy - 16, x, hy - 5);
    g.fillStyle(a, 1); g.fillCircle(x, hy - 18, 2.6); // 头
  } },
  nimbHalo: { c: 0xeaf6ff, a: 0x9ad4ff, draw: (g, now, x, hy, c, a) => {
    // 云光环：悬在头顶上方的一圈云
    const fl = Math.sin(now / 500) * 2;
    for (let k = 0; k < 7; k++) {
      const ang = (k / 7) * TAU + now / 3000;
      g.fillStyle(k % 2 ? c : 0xffffff, 0.95);
      g.fillCircle(x + Math.cos(ang) * 20, hy - 24 + Math.sin(ang) * 7 + fl, 7 - k % 3);
    }
    g.fillStyle(a, 0.35);
    g.fillCircle(x, hy - 24 + fl, 22);
  } },
  nimbCrown: { c: 0xffffff, a: 0x9ad4ff, draw: (g, now, x, hy, c, a) => {
    // 云冠：一排云朵排成冠
    for (let k = 0; k < 5; k++) {
      const px = x - 16 + k * 8;
      const h = k === 2 ? 18 : 12;
      g.fillStyle(k % 2 ? c : 0xf0f8ff, 0.97);
      g.fillCircle(px, hy - h, 7);
      g.fillStyle(a, 0.35); g.fillCircle(px + 2, hy - h - 2, 3.4);
    }
    g.fillStyle(c, 1); g.fillRect(x - 18, hy - 2, 36, 5);
  } },
  confCake: { c: 0xfff0e0, a: 0xff869c, draw: (g, now, x, hy, c, a) => {
    // 蛋糕帽：双层小蛋糕 + 顶樱桃
    g.fillStyle(a, 1); g.fillRoundedRect(x - 15, hy - 12, 30, 10, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 18, hy - 22, 36, 11, 4);
    g.fillStyle(0xffffff, 0.8); g.fillEllipse(x, hy - 22, 36, 5); // 奶油
    g.fillStyle(0xd93a5a, 1); g.fillCircle(x, hy - 28, 3.4); // 樱桃
    g.lineStyle(1.4, 0x5a8a3a, 0.9); g.lineBetween(x, hy - 31, x + 3, hy - 34);
  } },
  confCrown: { c: 0xffb7d5, a: 0xfff0e0, draw: (g, now, x, hy, c, a) => {
    // 糖霜冠：挤出来的糖霜尖 + 淌下的糖
    g.fillStyle(c, 1);
    for (let k = 0; k < 4; k++) {
      const px = x - 14 + k * 9.4;
      hpoly(g, [[px - 5, hy + 2], [px + 5, hy + 2], [px, hy - 16 - (k === 1 || k === 2 ? 5 : 0)]], c);
    }
    g.fillStyle(a, 0.95);
    for (let k = 0; k < 4; k++) {
      const px = x - 14 + k * 9.4;
      const drop = 4 + Math.abs(Math.sin(now / 500 + k)) * 3;
      g.fillCircle(px, hy + 2 + drop * 0.5, 2.6);
    }
    g.fillStyle(a, 1); g.fillRect(x - 17, hy + 1, 34, 4);
  } },
  bigtClown: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 小丑帽：三根歪斜的尖角各带铃铛
    for (let k = -1; k <= 1; k++) {
      const tipX = x + k * 14, tipY = hy - 26 - Math.abs(k) * -4;
      const sway = Math.sin(now / 300 + k) * 2;
      hpoly(g, [[x + k * 9 - 4, hy + 2], [x + k * 9 + 4, hy + 2], [tipX + sway, tipY]], k === 0 ? a : c);
      g.fillStyle(0xffffff, 1); g.fillCircle(tipX + sway, tipY - 2, 2.8);
    }
    g.fillStyle(a, 1); g.fillRect(x - 14, hy + 1, 28, 4);
  } },
  bigtRing: { c: 0xffd45c, a: 0xe8404a, draw: (g, now, x, hy, c, a) => {
    // 彩环头饰：头顶旋转的彩环
    const fl = Math.sin(now / 400) * 2;
    g.lineStyle(5, c, 0.9);
    g.beginPath(); g.ellipse ? g.arc(x, hy - 24 + fl, 20, 0, TAU) : g.arc(x, hy - 24 + fl, 20, 0, TAU); g.strokePath();
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * TAU + now / 600;
      g.fillStyle(k % 2 ? a : 0x4ac8ff, 0.95);
      g.fillCircle(x + Math.cos(ang) * 20, hy - 24 + fl + Math.sin(ang) * 7, 2.6);
    }
  } },
  aegisHelm: { c: 0xc0ccda, a: 0x8a94a2, draw: (g, now, x, hy, c, a) => {
    // 骑士盔：钢盔 + 面甲缝
    g.fillStyle(c, 1);
    g.beginPath(); g.arc(x, hy, 17, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillRect(x - 17, hy, 34, 8);
    g.fillStyle(0x2a2a32, 1);
    g.fillRect(x - 12, hy - 4, 24, 3); // 观察缝
    g.fillRect(x - 2, hy + 2, 4, 6); // 呼吸缝
    g.lineStyle(1.6, a, 0.8);
    g.beginPath(); g.arc(x, hy, 17, Math.PI, TAU); g.strokePath();
    g.fillStyle(0xdfe6f0, 0.7); g.fillEllipse(x - 6, hy - 10, 10, 4); // 高光
  } },
  aegisCrest: { c: 0xc0ccda, a: 0xc0392b, draw: (g, now, x, hy, c, a) => {
    // 骑士冠：钢盔 + 红缨冠羽
    g.fillStyle(c, 1);
    g.beginPath(); g.arc(x, hy, 16, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillRect(x - 16, hy, 32, 7);
    g.fillStyle(0x2a2a32, 1); g.fillRect(x - 11, hy - 4, 22, 3);
    g.fillStyle(a, 1);
    for (let k = 0; k < 4; k++) {
      const sway = Math.sin(now / 350 + k) * 2;
      g.fillEllipse(x + k * 5 - 8, hy - 20 - (k === 1 || k === 2 ? 4 : 0) + sway, 7, 14);
    }
    g.fillStyle(0xffd45c, 1); g.fillRect(x - 3, hy - 14, 6, 4); // 冠座
  } },
  chanHat: { c: 0x2f7a4a, a: 0xf0e0c0, draw: (g, now, x, hy, c, a) => {
    // 茶笠：宽大的斗笠 + 系带
    hpoly(g, [[x - 24, hy], [x - 8, hy - 16], [x + 8, hy - 16], [x + 24, hy]], c);
    g.fillStyle(0x3a8a5a, 0.9);
    hpoly(g, [[x - 8, hy - 16], [x + 8, hy - 16], [x, hy - 20]], 0x3a8a5a);
    g.lineStyle(1.6, a, 0.7);
    for (let k = -1; k <= 1; k++) g.lineBetween(x + k * 8, hy - 14 + Math.abs(k) * 6, x + k * 8, hy - 2 + Math.abs(k) * 1);
    g.fillStyle(a, 0.9); g.fillCircle(x, hy - 17, 2.6); // 笠顶
  } },
  chanLantern: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 灯笼头饰：细杆挑一盏小灯
    g.lineStyle(2.4, 0x8a5a2a, 1); g.lineBetween(x - 10, hy + 2, x - 10, hy - 18);
    g.lineBetween(x - 10, hy - 18, x + 8, hy - 18);
    const sway = Math.sin(now / 500) * 2;
    g.fillStyle(c, 0.95); g.fillEllipse(x + 8 + sway, hy - 11, 12, 14);
    g.fillStyle(a, 0.6 + 0.3 * Math.sin(now / 260));
    g.fillEllipse(x + 8 + sway, hy - 11, 5, 9);
    g.fillStyle(a, 1);
    g.fillRect(x + 3 + sway, hy - 18, 10, 2); g.fillRect(x + 3 + sway, hy - 5, 10, 2);
  } },
  arcanCap: { c: 0x4a2a8a, a: 0xb46cff, draw: (g, now, x, hy, c, a) => {
    // 魔法帽：弯尖尖帽 + 星屑
    hpoly(g, [[x - 15, hy + 2], [x + 15, hy + 2], [x + 4 + Math.sin(now / 700) * 3, hy - 32]], c);
    g.fillStyle(c, 1); g.fillRect(x - 20, hy + 2, 40, 5); // 帽檐
    g.lineStyle(1.6, a, 0.8);
    g.beginPath(); g.arc(x, hy - 2, 14, -2.7, -0.5); g.strokePath(); // 帽带
    g.fillStyle(a, 1); g.fillCircle(x + 3, hy - 16, 2.4); // 星
    g.fillStyle(0xffffff, 0.7 * Math.abs(Math.sin(now / 300)));
    g.fillCircle(x + 10, hy - 22, 1.4);
  } },
  arcanCrown: { c: 0xb46cff, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 星月冠：冠座 + 弯月 + 星星
    g.fillStyle(c, 1); g.fillRect(x - 15, hy - 4, 30, 6);
    hpoly(g, [[x - 15, hy - 4], [x - 10, hy - 16], [x - 5, hy - 4]], c);
    hpoly(g, [[x + 5, hy - 4], [x + 10, hy - 16], [x + 15, hy - 4]], c);
    // 弯月
    g.fillStyle(a, 1);
    g.fillCircle(x, hy - 15, 6);
    g.fillStyle(c, 1); g.fillCircle(x + 2.6, hy - 16.5, 5);
    const tw = 0.5 + 0.5 * Math.sin(now / 250);
    g.fillStyle(a, tw);
    g.fillRect(x + 10, hy - 24 - 1, 2, 4); g.fillRect(x + 9, hy - 23, 4, 2);
  } },
  relicBone: { c: 0xd8c8a0, a: 0x8a6a3a, draw: (g, now, x, hy, c, a) => {
    // 骨头帽：交叉的两根骨头
    g.fillStyle(c, 1);
    for (const rot of [-0.5, 0.5]) {
      g.save();
      g.translateCanvas(x, hy - 8);
      g.rotateCanvas(rot);
      g.fillRoundedRect(-13, -2.4, 26, 4.8, 2.4);
      g.fillCircle(-13, -2.6, 3); g.fillCircle(-13, 2.6, 3);
      g.fillCircle(13, -2.6, 3); g.fillCircle(13, 2.6, 3);
      g.restore();
    }
    g.fillStyle(a, 0.9); g.fillCircle(x, hy - 8, 3); // 缚结
  } },
  relicAmber: { c: 0xd8902a, a: 0xffe8b0, draw: (g, now, x, hy, c, a) => {
    // 琥珀冠：金环 + 三颗琥珀
    g.fillStyle(a, 1); g.fillRect(x - 15, hy - 2, 30, 4);
    for (let k = -1; k <= 1; k++) {
      const px = x + k * 10;
      const s = k === 0 ? 6 : 4.4;
      g.fillStyle(c, 0.85);
      g.fillCircle(px, hy - 6 - s * 0.4, s);
      g.fillStyle(0xffe8b0, 0.7); g.fillCircle(px - s * 0.3, hy - 8 - s * 0.4, s * 0.3);
    }
    g.fillStyle(0x2a2a2a, 0.7); g.fillEllipse(x - 3, hy - 8, 3, 1.6); // 琥珀里的虫
  } },
  playBlock: { c: 0xe8404a, a: 0x4a90d9, draw: (g, now, x, hy, c, a) => {
    // 积木头饰：三块积木叠罗汉
    g.fillStyle(c, 1); g.fillRect(x - 15, hy - 8, 30, 9);
    g.fillStyle(a, 1); g.fillRect(x - 8, hy - 17, 16, 9);
    g.fillStyle(0xffd45c, 1); g.fillRect(x - 4, hy - 25, 8, 8);
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(x - 15, hy - 8, 30, 2); g.fillRect(x - 8, hy - 17, 16, 2);
    g.fillStyle(0x000000, 0.15);
    g.fillRect(x - 4, hy - 19, 8, 2);
  } },
  playTop: { c: 0x4a90d9, a: 0xe8404a, draw: (g, now, x, hy, c, a) => {
    // 陀螺头饰：会转的陀螺
    const rot = now / 300;
    g.save();
    g.translateCanvas(x, hy - 10);
    g.rotateCanvas(Math.sin(rot) * 0.15);
    hpoly(g, [[-10, -4], [10, -4], [3, 8], [-3, 8]], c);
    g.fillStyle(a, 1); g.fillRect(-10, -6, 20, 3);
    g.lineStyle(2, 0xffd45c, 0.9); g.lineBetween(0, 8, 0, 12);
    g.restore();
    for (let k = 0; k < 3; k++) {
      const ang = rot * 2 + (k / 3) * TAU;
      g.fillStyle(a, 0.5);
      g.fillCircle(x + Math.cos(ang) * 14, hy - 12 + Math.sin(ang) * 5, 1.4); // 转出的残影
    }
  } },
  yuanLamp: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 花灯头饰：头顶一盏小花灯 + 垂穗
    const sway = Math.sin(now / 500) * 2;
    g.fillStyle(c, 0.95); g.fillEllipse(x + sway, hy - 12, 20, 24);
    g.fillStyle(a, 0.85);
    g.fillRect(x - 9 + sway, hy - 22, 18, 3); g.fillRect(x - 9 + sway, hy - 4, 18, 3);
    g.lineStyle(1.2, a, 0.8);
    g.lineBetween(x + sway, hy - 12, x + sway, hy - 22); g.lineBetween(x + sway, hy - 12, x + sway, hy - 4);
    g.fillStyle(a, 0.9);
    g.fillRect(x - 1 + sway, hy + 1, 2, 6 + Math.sin(now / 350) * 2); // 垂穗
    g.fillStyle(0xfff0c0, 0.6 + 0.3 * Math.sin(now / 300));
    g.fillEllipse(x + sway, hy - 12, 7, 12);
  } },
  yuanMask: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 面具头饰：斜插的opera面具
    g.save();
    g.translateCanvas(x + 8, hy - 8);
    g.rotateCanvas(0.35);
    g.fillStyle(c, 0.95);
    hpoly(g, [[-12, -4], [12, -4], [10, 6], [0, 10], [-10, 6]], c);
    g.fillStyle(a, 0.95);
    g.fillEllipse(-5, 0, 5, 3); g.fillEllipse(5, 0, 5, 3); // 眼孔
    g.fillStyle(0xffd45c, 1); g.fillRect(-2, 4, 4, 2); // 额饰
    g.restore();
  } },
  shanHatFeather: { c: 0xd8e8ff, a: 0x3a9a7a, draw: (g, now, x, hy, c, a) => {
    // 鹤羽笠：小斗笠 + 两根白鹤羽
    hpoly(g, [[x - 18, hy], [x, hy - 12], [x + 18, hy]], 0x8a9a6a);
    g.lineStyle(1.4, 0xffffff, 0.5); g.lineBetween(x - 10, hy - 3, x + 10, hy - 3);
    for (const s of [-1, 1]) {
      const sway = Math.sin(now / 600 + s) * 2;
      g.save();
      g.translateCanvas(x + s * 6, hy - 10);
      g.rotateCanvas(s * 0.7);
      g.fillStyle(c, 0.95);
      g.fillEllipse(s * 5 + sway, -6, 6, 16);
      g.restore();
    }
    g.fillStyle(a, 1); g.fillCircle(x, hy - 12, 2.4);
  } },
  shanHatDragon: { c: 0x3a9a7a, a: 0xd42a2a, draw: (g, now, x, hy, c, a) => {
    // 螭龙角：一对后掠的玉角
    for (const s of [-1, 1]) {
      hpoly(g, [
        [x + s * 6, hy + 2], [x + s * 12, hy - 10], [x + s * 20, hy - 22], [x + s * 22, hy - 26],
        [x + s * 14, hy - 20], [x + s * 8, hy - 8],
      ], c);
      g.fillStyle(0xffffff, 0.35);
      g.fillEllipse(x + s * 13, hy - 12, 4, 10); // 玉的光
    }
    g.fillStyle(a, 0.9); g.fillRect(x - 12, hy + 1, 24, 3); // 赤色箍
  } },
};
