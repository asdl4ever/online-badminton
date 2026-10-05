import { apoly, aline, TAU, type AuraArt } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第一批主题光环 → 背景特效（沙漠 / 云端 / 甜点 / 马戏 / 骑士 / 茶馆 / 魔法 / 化石 / 玩具 / 元宵 / 山海 / 操场） */
export const AURAS_1: Record<string, AuraArt> = {
  runAura: { a: 0x39d0a0, draw: (g, now, c, a) => {
    // 跑量里程碑：身后一排向上的速度线
    for (let k = 0; k < 6; k++) {
      const ph = (now / 500 + k / 6) % 1;
      const px = -56 + k * 22;
      g.lineStyle(3, k % 2 ? a : c, (1 - ph) * 0.7);
      g.lineBetween(px, 60 - ph * 190, px, 110 - ph * 190);
    }
  } },
  desSandAura: { c: 0xc9803a, a: 0xf0d8a0, draw: (g, now, c, a) => {
    // 流沙：身后一道斜掠的沙暴帷幕
    for (let k = 0; k < 3; k++) {
      apoly(g, [
        [-90, -110 + k * 20], [90, -150 + k * 20], [70, -70 + k * 24], [-70, -30 + k * 24],
      ], k % 2 ? c : a, 0.22);
    }
    for (let k = 0; k < 6; k++) {
      const ph = (now / 700 + k / 6) % 1;
      g.fillStyle(a, 0.8 * (1 - ph));
      g.fillCircle(-80 + ph * 160, -40 + Math.sin(k * 2) * 60 - ph * 40, 3 * (1 - ph) + 0.8);
    }
  } },
  desSunAura: { c: 0xffd45c, a: 0xff9a4a, draw: (g, now, c, a) => {
    // 烈日：身后一圈放射的日芒
    const r = 90 + Math.sin(now / 500) * 6;
    for (let k = 0; k < 10; k++) {
      const ang = (k / 10) * TAU + now / 3000;
      g.fillStyle(k % 2 ? c : a, 0.5);
      apoly(g, [
        [Math.cos(ang - 0.06) * 30, Math.sin(ang - 0.06) * 30],
        [Math.cos(ang - 0.02) * r, Math.sin(ang - 0.02) * r],
        [Math.cos(ang + 0.02) * r, Math.sin(ang + 0.02) * r],
        [Math.cos(ang + 0.06) * 30, Math.sin(ang + 0.06) * 30],
      ], k % 2 ? c : a, 0.4);
    }
    g.fillStyle(c, 0.15); g.fillCircle(0, -10, 70);
  } },
  nimbWindAura: { c: 0xffffff, a: 0x9ad4ff, draw: (g, now, c, a) => {
    // 风：身后数道盘旋的风弧
    for (let k = 0; k < 4; k++) {
      g.lineStyle(3 - k * 0.4, k % 2 ? a : c, 0.55);
      g.beginPath();
      const r = 46 + k * 22;
      g.arc(0, 0, r, now / 1200 + k * 1.5, now / 1200 + k * 1.5 + 2.2);
      g.strokePath();
    }
  } },
  nimbStarAura: { c: 0xffe89a, a: 0xffffff, draw: (g, now, c, a) => {
    // 星辉：身后一片闪烁的星野
    for (let k = 0; k < 12; k++) {
      const px = Math.sin(k * 12.9) * 92, py = -130 + (k * 37) % 240;
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(now / 300 + k * 2.1));
      g.fillStyle(k % 3 ? a : c, tw);
      g.fillRect(px - 2.4, py - 0.7, 4.8, 1.4); g.fillRect(px - 0.7, py - 2.4, 1.4, 4.8);
    }
  } },
  confSugarAura: { c: 0xff869c, a: 0xfff0e0, draw: (g, now, c, a) => {
    // 糖霜：一整条落糖帘
    for (let k = 0; k < 9; k++) {
      const ph = (now / 1000 + k / 9) % 1;
      g.fillStyle(k % 2 ? a : c, 0.8 * Math.sin(ph * Math.PI));
      g.fillEllipse(-70 + (k * 17) % 140, -140 + ph * 260, 7, 4);
    }
  } },
  confHeartAura: { c: 0xffb7d5, a: 0xffffff, draw: (g, now, c, a) => {
    // 爱心：身后上浮的爱心
    for (let k = 0; k < 6; k++) {
      const ph = (now / 1100 + k / 6) % 1;
      const px = -60 + ((k * 23) % 120), py = 90 - ph * 200;
      const s = 5 + (k % 3) * 2;
      g.fillStyle(k % 2 ? c : a, 0.85 * (1 - ph * 0.6));
      g.fillCircle(px - s * 0.5, py - s * 0.3, s * 0.55);
      g.fillCircle(px + s * 0.5, py - s * 0.3, s * 0.55);
      apoly(g, [[px - s, py - s * 0.1], [px + s, py - s * 0.1], [px, py + s]], k % 2 ? c : a, 0.85 * (1 - ph * 0.6));
    }
  } },
  bigtConfetti: { c: 0xffd45c, a: 0xe8404a, draw: (g, now, c, a) => {
    // 彩带雨：漫天飘落的纸屑
    for (let k = 0; k < 10; k++) {
      const ph = (now / 1100 + k / 10) % 1;
      g.fillStyle([c, a, 0x4ac8ff, 0x9effd0][k % 4], 0.9 * Math.sin(ph * Math.PI));
      g.save();
      g.translateCanvas(-80 + (k * 17) % 160, -140 + ph * 270);
      g.rotateCanvas(Math.sin(now / 300 + k) * 1.2);
      g.fillRect(-3, -2, 6, 4);
      g.restore();
    }
  } },
  bigtSpotAura: { c: 0xff869c, a: 0xfff0c0, draw: (g, now, c, a) => {
    // 聚光灯：两道从天而降的光柱
    const sw = Math.sin(now / 900) * 14;
    apoly(g, [[-40 + sw, -160], [-14 + sw, -160], [30, 120], [-16, 120]], a, 0.2);
    apoly(g, [[14 - sw, -160], [40 - sw, -160], [16, 120], [-30, 120]], c, 0.16);
  } },
  aegisBanner: { c: 0xc0392b, a: 0xd9b45c, draw: (g, now, c, a) => {
    // 战旗：身后两杆垂旗
    for (const s of [-1, 1]) {
      const sway = Math.sin(now / 500 + s) * 4;
      apoly(g, [[s * 62, -130], [s * 92, -130], [s * (88 + sway * 0.4), 110], [s * (58 + sway * 0.4), 110]], c, 0.75);
      g.fillStyle(a, 0.9);
      g.fillRect(s * 70, -122, s * 14, 4);
    }
  } },
  aegisSteel: { c: 0xc0ccda, a: 0x8a94a2, draw: (g, now, c, a) => {
    // 钢铁意志：背后的钢板辉光
    const gl = 0.25 + 0.15 * Math.sin(now / 600);
    apoly(g, [[-60, -120], [60, -120], [80, 110], [-80, 110]], c, gl);
    g.lineStyle(3, a, 0.7);
    g.strokeRect(-52, -112, 104, 214);
  } },
  chanInkAura: { c: 0x2f7a4a, a: 0x8ac8a8, draw: (g, now, c, a) => {
    // 茶墨：晕开的水色涡
    for (let k = 0; k < 3; k++) {
      g.fillStyle(k === 0 ? c : a, 0.16 - k * 0.04);
      g.fillCircle(0, 0, 110 - k * 28 + Math.sin(now / 700 + k) * 6);
    }
    g.lineStyle(2, a, 0.4);
    g.beginPath(); g.arc(0, 0, 60, now / 900, now / 900 + 2); g.strokePath();
  } },
  chanPetalAura: { c: 0xffb7d5, a: 0xffffff, draw: (g, now, c, a) => {
    // 花瓣：漫天落樱
    for (let k = 0; k < 10; k++) {
      const ph = (now / 1300 + k / 10) % 1;
      g.fillStyle(k % 3 ? c : a, 0.85 * Math.sin(ph * Math.PI));
      g.save();
      g.translateCanvas(-80 + (k * 19) % 160, -140 + ph * 270);
      g.rotateCanvas(Math.sin(now / 400 + k) * 1.4);
      g.fillEllipse(0, 0, 8, 5);
      g.restore();
    }
  } },
  arcanRuneAura: { c: 0xb46cff, a: 0xffd45c, draw: (g, now, c, a) => {
    // 魔阵：脚下大魔法阵（画在身后就是身后的法阵）
    g.lineStyle(3, c, 0.6);
    g.strokeCircle(0, 80, 90);
    g.lineStyle(1.6, a, 0.8);
    g.strokeCircle(0, 80, 70);
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * TAU + now / 2000;
      const gl = 0.5 + 0.5 * Math.sin(now / 250 + k);
      g.fillStyle(a, gl);
      g.fillRect(Math.cos(ang) * 70 - 2, 80 + Math.sin(ang) * 26 - 4, 4, 8);
    }
  } },
  arcanStarAura: { c: 0xb46cff, a: 0xffe89a, draw: (g, now, c, a) => {
    // 星辉：背后一轮星芒
    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * TAU + Math.PI / 8;
      const len = 70 + (k % 2) * 36 + Math.sin(now / 350 + k) * 8;
      apoly(g, [
        [Math.cos(ang - 0.05) * 24, Math.sin(ang - 0.05) * 24],
        [Math.cos(ang) * len, Math.sin(ang) * len],
        [Math.cos(ang + 0.05) * 24, Math.sin(ang + 0.05) * 24],
      ], a, 0.4);
    }
    g.fillStyle(c, 0.2); g.fillCircle(0, -10, 44);
  } },
  relicDustAura: { c: 0xd8c8a0, a: 0xb8a880, draw: (g, now, c, a) => {
    // 尘土：出土瞬间扬起的尘幕
    for (let k = 0; k < 10; k++) {
      const ph = (now / 1000 + k / 10) % 1;
      g.fillStyle(k % 2 ? c : a, 0.5 * (1 - ph));
      g.fillCircle(-70 + ph * 140, 100 - ph * 200 - (k % 3) * 30, 6 * (1 - ph) + 2);
    }
  } },
  relicAmberAura: { c: 0xffb02a, a: 0xffe8b0, draw: (g, now, c, a) => {
    // 琥珀：身后一团温润的琥珀光
    const gl = 0.2 + 0.12 * Math.sin(now / 500);
    g.fillStyle(c, gl); g.fillCircle(0, -10, 96);
    g.fillStyle(a, gl + 0.1); g.fillCircle(0, -10, 60);
    g.fillStyle(0xffffff, 0.25); g.fillCircle(-22, -36, 14);
  } },
  playBallAura: { c: 0x4a90d9, a: 0xe8404a, draw: (g, now, c, a) => {
    // 皮球：背后环绕弹跳的三颗球
    for (let k = 0; k < 3; k++) {
      const ang = now / 800 + (k / 3) * TAU;
      const px = Math.cos(ang) * 74;
      const py = Math.abs(Math.sin(now / 300 + k * 2)) * -60 + 40;
      g.fillStyle(k % 2 ? a : c, 0.9);
      g.fillCircle(px, py, 8);
      g.fillStyle(0xffffff, 0.5); g.fillCircle(px - 2.4, py - 2.4, 2.4);
    }
  } },
  playSparkAura: { c: 0xffc04a, a: 0xffffff, draw: (g, now, c, a) => {
    // 火花：背后手持烟花棒般的喷射
    for (let k = 0; k < 12; k++) {
      const ph = (now / 600 + k / 12) % 1;
      const ang = k * 2.4 + now / 200;
      g.fillStyle(k % 2 ? a : c, (1 - ph) * 0.9);
      g.fillCircle(Math.cos(ang) * (20 + ph * 80), Math.sin(ang) * (20 + ph * 80) - 20, 2.4 * (1 - ph) + 0.6);
    }
  } },
  yuanFireAura: { c: 0xffd45c, a: 0xe8404a, draw: (g, now, c, a) => {
    // 焰火：身后两朵绽放的烟花
    for (let k = 0; k < 2; k++) {
      const cx = k ? 56 : -56, cy = k ? -70 : -100;
      const ph = (now / 1400 + k * 0.5) % 1;
      for (let s = 0; s < 10; s++) {
        const ang = (s / 10) * TAU + k;
        const r = ph * (34 + (s % 3) * 10);
        g.fillStyle(s % 2 ? a : c, (1 - ph) * 0.9);
        g.fillCircle(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 2.6 * (1 - ph) + 0.6);
      }
    }
  } },
  yuanLanternAura: { c: 0xff869c, a: 0xffd45c, draw: (g, now, c, a) => {
    // 灯影：身后渐次升起的花灯
    for (let k = 0; k < 5; k++) {
      const ph = (now / 1600 + k / 5) % 1;
      const px = -70 + (k * 33) % 140 + Math.sin(now / 600 + k) * 6;
      const py = 110 - ph * 240;
      g.fillStyle(k % 2 ? c : a, 0.85 * Math.sin(ph * Math.PI));
      g.fillEllipse(px, py, 12, 15);
      g.fillStyle(0xfff0c0, 0.7 * Math.sin(ph * Math.PI));
      g.fillEllipse(px, py, 5, 8);
    }
  } },
  shanAuraSpirit: { c: 0x9fe8c0, a: 0xffffff, draw: (g, now, c, a) => {
    // 灵气：身后游走的山岚
    for (let k = 0; k < 4; k++) {
      const ph = (now / 1500 + k / 4) % 1;
      g.fillStyle(k % 2 ? c : a, 0.3 * Math.sin(ph * Math.PI));
      g.fillEllipse(-50 + ph * 100 + (k - 1.5) * 12, 40 - ph * 120, 60 - ph * 20, 16);
    }
  } },
  shanAuraStar: { c: 0xffe89a, a: 0xd8e8ff, draw: (g, now, c, a) => {
    // 星汉：身后斜贯的银河
    apoly(g, [[-100, -140], [100, -40], [100, 30], [-100, -70]], a, 0.16);
    for (let k = 0; k < 9; k++) {
      const u = k / 9;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 350 + k * 1.9));
      g.fillStyle(k % 3 ? c : a, tw);
      g.fillCircle(-90 + u * 180, -120 + u * 70 + Math.sin(k * 5) * 8, 1.8);
    }
  } },
};
