import { apoly, aline, TAU, type AuraArt } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/**
 * 第四批主题光环 → 背景特效（宝塔 / 风暴 / 月宫 / 维京 / 猎游 / 剧院 / 北境 / 威尼斯 / 奥林匹斯 / 桑巴）。
 * 每款按名字手工构图，画在角色身后；(0,0) = 角色躯干中心。
 */
export const AURAS_4: Record<string, AuraArt> = {
  pagodAuraA: { c: 0xffb03a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 香火环绕：环身升腾的香烟 + 底部的香炉火点 + 飘散的纸钱
    g.fillStyle(0x6a4a3a, 0.4);
    g.fillEllipse(0, 84, 70, 14);
    for (let k = 0; k < 3; k++) {
      const cx = -16 + k * 16;
      g.fillStyle(0xe8404a, 0.7 + 0.3 * Math.sin(now / 200 + k));
      g.fillCircle(cx, 76, 2.2);
    }
    for (let k = 0; k < 5; k++) {
      const ph = (now / 1800 + k / 5) % 1;
      const sx = Math.sin(k * 2.2) * 20 + Math.sin(ph * 6 + k) * 16 * ph;
      const sy = 70 - ph * 210;
      g.fillStyle(k % 2 ? c : 0xd8c8b0, 0.24 * Math.sin(ph * Math.PI));
      g.fillCircle(sx, sy, 8 + ph * 18);
    }
    for (let k = 0; k < 3; k++) {
      const ph = (now / 1300 + k / 3) % 1;
      g.fillStyle(0xd8c8b0, 0.5 * Math.sin(ph * Math.PI));
      g.save();
      g.translateCanvas(Math.sin(k * 2.6) * 46 + Math.sin(ph * 4 + k) * 10, 30 - ph * 130);
      g.rotateCanvas(Math.sin(now / 400 + k) * 0.8);
      g.fillRect(-3.4, -2.4, 6.8, 4.8);
      g.restore();
    }
  } },
  pagodAuraB: { c: 0xffd45c, a: 0xfff0c0, draw: (g, now, c, a) => {
    // 龙气光环：背后盘绕升起的金龙气 + 龙珠光 + 云雾
    const segs: Array<[number, number]> = [];
    for (let s = 0; s <= 14; s++) {
      const u = s / 14;
      const ang = u * 4.8 + now / 1800;
      segs.push([Math.cos(ang) * (16 + u * 50), 40 - u * 160 + Math.sin(ang) * 12]);
    }
    for (let s = 1; s < segs.length; s++) {
      const [x1, y1] = segs[s];
      const r = 3 + (s / segs.length) * 8;
      g.fillStyle(s % 2 ? c : a, 0.35);
      g.fillCircle(x1, y1, r);
    }
    const [hx, hy] = segs[segs.length - 1];
    g.fillStyle(c, 0.3);
    g.fillCircle(hx, hy, 15);
    g.fillStyle(0xe8404a, 0.85);
    g.fillCircle(hx, hy, 5.4);
    for (let k = 0; k < 3; k++) {
      const ph = (now / 2200 + k / 3) % 1;
      g.fillStyle(0xffffff, 0.2 * Math.sin(ph * Math.PI));
      g.fillEllipse(-80 + ph * 160, -60 + (k % 2) * 70, 70, 18);
    }
    for (let k = 0; k < 5; k++) {
      const tw = Math.abs(Math.sin(now / 300 + k * 1.7));
      g.fillStyle(a, tw * 0.6);
      g.fillCircle(-70 + (k * 34) % 140, -100 + (k * 47) % 160, 1.4);
    }
  } },
  stormAuraA: { c: 0x9fd8ff, a: 0xeaf2fa, draw: (g, now, c, a) => {
    // 风尘环绕：环身横掠的风刀 + 卷起的尘叶 + 风眼
    for (let k = 0; k < 6; k++) {
      const ph = (now / 380 + k / 6) % 1;
      const wy = -90 + (k * 33) % 190;
      g.lineStyle(3, k % 2 ? c : a, (1 - ph) * 0.6);
      g.lineBetween(-110 + ph * 220, wy, -66 + ph * 220, wy + 6);
      g.lineBetween(-50 + ph * 220, wy + 8, -40 + ph * 220, wy + 9);
    }
    for (let k = 0; k < 4; k++) {
      const ph = (now / 500 + k / 4) % 1;
      const px = -100 + ph * 200;
      const py = -60 + (k * 37) % 130 + Math.sin(ph * 7 + k) * 9;
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas(now / 300 + k);
      apoly(g, [[0, -4], [6, 0], [0, 4]], k % 2 ? c : a, 0.6 * (1 - ph));
      g.restore();
    }
    const p1 = 0.5 + 0.5 * Math.sin(now / 500);
    g.fillStyle(a, 0.1 + p1 * 0.06);
    g.fillCircle(0, -10, 50);
  } },
  stormAuraB: { c: 0xffffff, a: 0x7ae0ff, draw: (g, now, c, a) => {
    // 雷环光环：环身旋转的雷环 + 劈下的闪电 + 电离光核
    const p1 = 0.5 + 0.5 * Math.sin(now / 240);
    g.lineStyle(3, c, 0.4 + p1 * 0.3);
    g.beginPath();
    for (let s = 0; s <= 22; s++) {
      const u = s / 22;
      const ang = u * TAU + now / 600;
      const rr = 64 + Math.sin(u * 9 + now / 150) * 7;
      const px = Math.cos(ang) * rr, py = -10 + Math.sin(ang) * rr * 1.3;
      if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath(); g.strokePath();
    for (let k = 0; k < 2; k++) {
      const bx = k ? 28 : -32;
      const j = Math.sin(now / 70 + k * 5) * 9;
      const gl = 0.5 + 0.5 * Math.abs(Math.sin(now / 90 + k * 2));
      aline(g, [[bx, -150], [bx + 10 + j, -100], [bx - 6 - j, -56], [bx + 8, -8]], 2.6, k % 2 ? c : a, gl);
      aline(g, [[bx, -150], [bx + 10 + j, -100], [bx - 6 - j, -56], [bx + 8, -8]], 5, a, gl * 0.25);
    }
    g.fillStyle(c, 0.15 + p1 * 0.1);
    g.fillCircle(0, -10, 30);
  } },
  lunarAuraA: { c: 0xe8f0ff, a: 0xb8c4e8, draw: (g, now, c, a) => {
    // 月尘环绕：身后月轮 + 环月浮尘 + 月面暗海
    g.fillStyle(c, 0.15); g.fillCircle(0, -60, 96);
    g.fillStyle(c, 0.8); g.fillCircle(0, -60, 50);
    g.fillStyle(a, 0.5);
    g.fillCircle(-14, -72, 11); g.fillCircle(16, -50, 8); g.fillCircle(6, -76, 5);
    for (let k = 0; k < 8; k++) {
      const ph = (now / 2600 + k / 8) % 1;
      const ang = ph * TAU + k * 0.8;
      const rr = 60 + (k % 3) * 12;
      g.fillStyle(0xffffff, 0.6 * Math.sin(ph * Math.PI));
      g.fillCircle(Math.cos(ang) * rr, -60 + Math.sin(ang) * rr * 0.7, 1.4);
    }
  } },
  lunarAuraB: { c: 0xffe89a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 桂花光环：一枝桂树影 + 缤纷落桂 + 捣药杵光影
    g.lineStyle(3, 0x6a5232, 0.6);
    g.lineBetween(64, 90, 44, -10);
    g.lineBetween(44, -10, 20, -70);
    for (let k = 0; k < 5; k++) {
      const px = [64, 54, 44, 30, 20][k], py = [90, 40, -10, -40, -70][k];
      g.fillStyle(0x8fbf5a, 0.5);
      g.fillEllipse(px - 4, py - 4, 16, 8);
      g.fillStyle(c, 0.8);
      g.fillCircle(px + 4, py - 8, 2.6);
    }
    for (let k = 0; k < 8; k++) {
      const ph = (now / 1400 + k / 8) % 1;
      const px = Math.sin(k * 2.6) * 60 + Math.sin(ph * 5 + k) * 12;
      const py = -120 + ph * 250;
      g.fillStyle(k % 2 ? c : a, 0.85 * Math.sin(ph * Math.PI));
      g.fillCircle(px, py, 2 + (k % 3));
    }
  } },
  vikingAuraA: { c: 0xffb03a, a: 0x8a6a4a, draw: (g, now, c, a) => {
    // 炉火环绕：两侧的篝火 + 飞溅的火星 + 暖光
    for (const s of [-1, 1]) {
      g.fillStyle(a, 0.6);
      g.lineBetween(s * 58, 88, s * 58, 56);
      g.lineBetween(s * 52, 88, s * 64, 60);
      for (let k = 0; k < 3; k++) {
        const ph = (now / 400 + k / 3 + s) % 1;
        const fx = s * 58 + Math.sin(now / 250 + k + s) * 6 * ph;
        g.fillStyle(k % 2 ? c : 0xff5a1a, 0.55 * (1 - ph));
        apoly(g, [
          [fx - 8 + ph * 3, 60], [fx - 3, 60 - 26 * (1 - ph)], [fx + Math.sin(now / 200 + k) * 3, 60 - 34 * (1 - ph)],
          [fx + 3, 60 - 24 * (1 - ph)], [fx + 8 - ph * 3, 60],
        ], k % 2 ? c : 0xff5a1a, 0.55 * (1 - ph));
      }
    }
    for (let k = 0; k < 5; k++) {
      const ph = (now / 600 + k / 5) % 1;
      g.fillStyle(c, 0.8 * (1 - ph));
      g.fillCircle(Math.sin(k * 2.6) * 44, 50 - ph * 150, 1.8 * (1 - ph) + 0.4);
    }
    g.fillStyle(c, 0.1 + 0.05 * Math.sin(now / 300));
    g.fillCircle(0, 0, 80);
  } },
  vikingAuraB: { c: 0x8fb4de, a: 0xffffff, draw: (g, now, c, a) => {
    // 战吼光环：环身升腾的战吼声浪 + 北境符文 + 雪尘
    for (let k = 0; k < 3; k++) {
      const ph = (now / 900 + k / 3) % 1;
      g.lineStyle(3 - k, a, (1 - ph) * 0.6);
      g.beginPath();
      g.arc(0, 40, 30 + ph * 90 + k * 14, -Math.PI * 0.85, -Math.PI * 0.15);
      g.strokePath();
    }
    for (let k = 0; k < 4; k++) {
      const ang = (k / 4) * TAU + now / 2400;
      const px = Math.cos(ang) * 70, py = -10 + Math.sin(ang) * 84;
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas(ang + Math.PI / 2);
      g.lineStyle(2, k % 2 ? c : a, 0.6 + 0.3 * Math.sin(now / 260 + k * 2));
      g.lineBetween(-3, -6, 3, 6); g.lineBetween(3, -6, -3, 0);
      g.restore();
    }
    for (let k = 0; k < 6; k++) {
      const ph = (now / 500 + k / 6) % 1;
      g.fillStyle(0xffffff, 0.6 * (1 - ph));
      g.fillCircle(-90 + ph * 180, -80 + (k * 29) % 150, 1.6);
    }
  } },
  safariAuraA: { c: 0xd8c8a0, a: 0xc9803a, draw: (g, now, c, a) => {
    // 尘土环绕：草原热浪 + 蹄下扬尘 + 金合欢树影
    for (let k = 0; k < 3; k++) {
      const ph = (now / 800 + k / 3) % 1;
      g.lineStyle(3.4, k % 2 ? c : a, 0.2 * Math.sin(ph * Math.PI));
      g.lineBetween(-95 + ph * 190, -50 + k * 44, -45 + ph * 190, -54 + k * 44);
    }
    g.fillStyle(a, 0.3);
    g.fillEllipse(0, 84, 120, 16);
    g.lineStyle(2.4, 0x6a4a2a, 0.5);
    g.lineBetween(52, 88, 58, 40);
    g.lineBetween(58, 40, 46, 34);
    g.fillStyle(0x7a8a3a, 0.3);
    g.fillEllipse(52, 30, 34, 10);
    for (let k = 0; k < 4; k++) {
      const ph = (now / 350 + k / 4) % 1;
      g.fillStyle(c, 0.5 * (1 - ph));
      g.fillCircle(-80 + ph * 160, 60 + (k % 2) * 14, 2.4 * (1 - ph) + 0.4);
    }
  } },
  safariAuraB: { c: 0xff9a4a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 热浪光环：环身扭曲上升的热浪 + 烈日余温 + 蒸腾的地气
    for (let k = 0; k < 4; k++) {
      const ph = (now / 1100 + k / 4) % 1;
      const hx = Math.sin(k * 2.4) * 44;
      const pts: Array<[number, number]> = [];
      for (let s = 0; s <= 8; s++) {
        const u = s / 8;
        pts.push([hx + Math.sin(u * 6 + now / 300 + k) * (5 + u * 9), 70 - ph * 40 - u * 100]);
      }
      aline(g, pts, 4 - k, k % 2 ? c : a, 0.25 * Math.sin(ph * Math.PI));
    }
    const p1 = 0.5 + 0.5 * Math.sin(now / 500);
    g.fillStyle(c, 0.14 + p1 * 0.06);
    g.fillCircle(0, -40, 70);
    g.fillStyle(a, 0.2);
    g.fillEllipse(0, 82, 150, 18);
    for (let k = 0; k < 4; k++) {
      const ph = (now / 700 + k / 4) % 1;
      g.fillStyle(0xffffff, 0.3 * (1 - ph));
      g.fillEllipse(Math.sin(k * 2.5) * 40, 70 - ph * 110, 18, 6);
    }
  } },
  theatAuraA: { c: 0xffd45c, a: 0xfff0c0, draw: (g, now, c, a) => {
    // 掌声环绕：环身炸开的掌声星光 + 剧场红幕缘 + 飞舞的花束
    g.fillStyle(0x8a1a2a, 0.4);
    g.fillRect(-100, -150, 24, 240);
    g.fillRect(76, -150, 24, 240);
    for (let k = 0; k < 8; k++) {
      const ph = (now / 500 + k / 8) % 1;
      const ang = k * 0.79 + 0.4;
      const dist = 24 + ph * 70;
      const px = Math.cos(ang) * dist, py = -10 + Math.sin(ang) * dist * 1.1;
      const tw = Math.abs(Math.sin(now / 150 + k * 2.2));
      g.fillStyle(k % 2 ? c : a, (1 - ph) * tw);
      g.fillRect(px - 2, py - 0.6, 4, 1.2); g.fillRect(px - 0.6, py - 2, 1.2, 4);
    }
    for (let k = 0; k < 2; k++) {
      const ph = (now / 1200 + k / 2) % 1;
      g.save();
      g.translateCanvas(Math.sin(k * 2.4) * 40 + Math.sin(ph * 4) * 10, 60 - ph * 160);
      g.rotateCanvas(Math.sin(now / 300 + k) * 1);
      g.fillStyle(0xffb7d5, 0.7 * (1 - ph));
      g.fillCircle(-3, 0, 3); g.fillCircle(3, 0, 3); g.fillCircle(0, -3, 3);
      g.restore();
    }
  } },
  theatAuraB: { c: 0xfff0c0, a: 0xc86ad9, draw: (g, now, c, a) => {
    // 追光光环：头顶的追光灯 + 舞台光斑 + 环绕的光尘
    const sw = Math.sin(now / 1100) * 10;
    g.fillStyle(c, 0.22);
    apoly(g, [[-18 + sw, -160], [18 + sw, -160], [58, 88], [-58, 88]], c, 0.22);
    g.fillStyle(0xffffff, 0.16);
    apoly(g, [[-9 + sw, -160], [9 + sw, -160], [34, 88], [-34, 88]], 0xffffff, 0.16);
    g.fillStyle(c, 0.3);
    g.fillEllipse(sw * 0.7, 86, 110, 18);
    g.fillStyle(a, 0.35);
    g.fillEllipse(sw * 0.7, 86, 70, 12);
    for (let k = 0; k < 6; k++) {
      const ph = (now / 1100 + k / 6) % 1;
      g.fillStyle(0xffffff, 0.7 * (1 - ph));
      g.fillCircle(sw + Math.sin(k * 2.4) * 24, 60 - ph * 190, 1.6 * (1 - ph) + 0.4);
    }
  } },
  boreaAuraA: { c: 0xffffff, a: 0x9ad4ff, draw: (g, now, c, a) => {
    // 雪尘环绕：环身吹卷的雪尘 + 冰晶闪 + 脚下积雪
    for (let k = 0; k < 10; k++) {
      const ph = (now / 500 + k / 10) % 1;
      const sx = -100 + ((ph + k / 10) % 1) * 200;
      const sy = -110 + (k * 47) % 200 + Math.sin(ph * 8 + k) * 9;
      g.fillStyle(k % 3 ? c : a, 0.7 * (1 - ph));
      g.fillCircle(sx, sy, 1.4 + (k % 3));
    }
    for (let k = 0; k < 3; k++) {
      const tw = Math.abs(Math.sin(now / 220 + k * 2.1));
      g.fillStyle(a, tw);
      const px = -50 + k * 44, py = -80 + (k % 2) * 60;
      g.fillRect(px - 3.4, py - 0.8, 6.8, 1.6); g.fillRect(px - 0.8, py - 3.4, 1.6, 6.8);
      g.fillRect(px - 2, py - 2, 4, 4);
    }
    g.fillStyle(c, 0.35);
    g.beginPath();
    g.moveTo(-95, 88);
    g.lineTo(-60, 70); g.lineTo(-20, 84); g.lineTo(20, 68); g.lineTo(60, 84); g.lineTo(95, 88);
    g.closePath(); g.fillPath();
  } },
  boreaAuraB: { c: 0x7dffc4, a: 0x9ad4ff, draw: (g, now, c, a) => {
    // 极光光环：身后三道大幅波动的极光 + 雪地反光 + 星点
    for (let k = 0; k < 3; k++) {
      const col = [c, a, 0xc86ad9][k];
      apoly(g, Array.from({ length: 11 }, (_, s) => {
        const u = s / 10;
        return [-105 + u * 210, -100 + k * 20 + Math.sin(u * 4.2 + now / 480 + k * 1.5) * 18] as [number, number];
      }).concat(Array.from({ length: 11 }, (_, s) => {
        const u = 1 - s / 10;
        return [-105 + u * 210, -142 + k * 20 + Math.sin(u * 4.2 + now / 480 + k * 1.5) * 18] as [number, number];
      })), col, 0.3);
    }
    g.fillStyle(a, 0.14);
    g.fillEllipse(0, 84, 160, 16);
    for (let k = 0; k < 5; k++) {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 280 + k * 1.7));
      g.fillStyle(0xffffff, tw);
      g.fillCircle(-80 + (k * 39) % 160, -120 + (k * 43) % 90, 1.4);
    }
  } },
  venicAuraA: { c: 0xbfe8f0, a: 0x3a8ab0, draw: (g, now, c, a) => {
    // 水花环绕：脚下溅起的水花 + 环身的水珠 + 贡多拉船影
    for (let k = 0; k < 7; k++) {
      const ph = (now / 700 + k / 7) % 1;
      const ang = Math.PI + (k / 7) * Math.PI;
      const dist = ph * 44;
      g.fillStyle(k % 2 ? c : a, 0.7 * (1 - ph));
      g.fillCircle(Math.cos(ang) * dist * 1.6, 84 - Math.abs(Math.sin(ang)) * dist * 1.4, 2.2 * (1 - ph) + 0.5);
    }
    g.fillStyle(a, 0.3);
    g.fillEllipse(0, 86, 130, 14);
    g.fillStyle(0x2a3a5a, 0.35);
    apoly(g, [[-64, 70], [64, 70], [52, 82], [-52, 82]], 0x2a3a5a, 0.3);
    for (let k = 0; k < 4; k++) {
      const ph = (now / 900 + k / 4) % 1;
      g.lineStyle(1.4, c, 0.6 * (1 - ph));
      g.strokeCircle(Math.sin(k * 2.4) * 48, 30 - ph * 120, 2.2 * (1 - ph) + 0.5);
    }
  } },
  venicAuraB: { c: 0xffd8a0, a: 0xff9a4a, draw: (g, now, c, a) => {
    // 琴音光环：环身飘出的琴音波纹 + 一张竖琴光影 + 音符
    g.fillStyle(a, 0.3);
    apoly(g, [[40, -100], [40, 20], [64, 40], [78, 10], [70, -100]], a, 0.25);
    g.lineStyle(1.4, c, 0.7);
    for (let k = 0; k < 5; k++) g.lineBetween(46 + k * 6, -94 + k * 22, 74, -96 + k * 26);
    for (let k = 0; k < 4; k++) {
      const ph = (now / 800 + k / 4) % 1;
      g.lineStyle(2, k % 2 ? c : a, 0.5 * (1 - ph));
      g.beginPath();
      g.arc(-20, -10, 16 + ph * 60, -0.6 + k * 0.3, 0.9 + k * 0.3);
      g.strokePath();
    }
    for (let k = 0; k < 3; k++) {
      const ph = (now / 1100 + k / 3) % 1;
      const nx = Math.sin(k * 2.2) * 44 + Math.sin(ph * 4 + k) * 8;
      const ny = 40 - ph * 150;
      g.fillStyle(k % 2 ? c : a, 0.8 * Math.sin(ph * Math.PI));
      g.fillEllipse(nx, ny + 4, 6, 4.4);
      aline(g, [[nx + 2.6, ny + 3], [nx + 2.6, ny - 9]], 1.6, k % 2 ? c : a, 0.8 * Math.sin(ph * Math.PI));
    }
  } },
  olympAuraA: { c: 0xffd45c, a: 0x5a9a3a, draw: (g, now, c, a) => {
    // 橄榄环绕：环身一圈旋转的橄榄枝叶 + 橄榄果实 + 竞技场尘光
    for (let k = 0; k < 10; k++) {
      const ang = now / 2600 + (k / 10) * TAU;
      const px = Math.cos(ang) * 66, py = -10 + Math.sin(ang) * 84;
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas(ang + Math.PI / 2);
      g.fillStyle(k % 2 ? a : 0x7abf5a, 0.75);
      g.fillEllipse(6, 0, 14, 5.4);
      g.restore();
      if (k % 3 === 0) {
        g.fillStyle(0x2a5a2a, 0.8);
        g.fillCircle(px + Math.cos(ang) * 8, py + Math.sin(ang) * 8, 2.4);
      }
    }
    g.fillStyle(c, 0.1);
    g.fillEllipse(0, -10, 150, 190);
  } },
  olympAuraB: { c: 0xfff0b0, a: 0xffd45c, draw: (g, now, c, a) => {
    // 神火光环：头顶的奥林匹克圣火 + 火炬光柱 + 飞扬的金屑
    g.fillStyle(a, 0.2);
    apoly(g, [[-10, -150], [10, -150], [40, 60], [-40, 60]], a, 0.2);
    for (let k = 0; k < 3; k++) {
      const ph = (now / 300 + k / 3) % 1;
      const fx = Math.sin(now / 220 + k * 2.1) * 6 * ph;
      g.fillStyle(k % 2 ? c : 0xff8a3a, 0.6 * (1 - ph));
      apoly(g, [
        [-9 + fx * 0.6, -108], [-4, -128 - 16 * (1 - ph)], [fx, -140 - 20 * (1 - ph)],
        [4, -126 - 16 * (1 - ph)], [9 + fx * 0.6, -108],
      ], k % 2 ? c : 0xff8a3a, 0.6 * (1 - ph));
    }
    g.fillStyle(0xfff6d0, 0.9);
    g.fillCircle(0, -112, 4);
    g.lineStyle(3, 0x8a6a3a, 0.7);
    g.lineBetween(0, -108, 0, -60);
    for (let k = 0; k < 6; k++) {
      const ph = (now / 700 + k / 6) % 1;
      g.fillStyle(c, 0.7 * (1 - ph));
      g.fillCircle(Math.sin(k * 2.6) * 30 + Math.sin(ph * 5 + k) * 6, -110 - ph * 50, 1.6 * (1 - ph) + 0.4);
    }
  } },
  sambaAuraA: { c: 0xff8ad4, a: 0x4ac8ff, draw: (g, now, c, a) => {
    // 彩带环绕：环身飞舞的桑巴彩带 + 羽毛饰 + 节奏光点
    const cols = [c, a, 0xffd45c, 0x7dffc4];
    for (let k = 0; k < 5; k++) {
      const pts: Array<[number, number]> = [];
      for (let s = 0; s <= 10; s++) {
        const u = s / 10;
        pts.push([
          Math.cos(u * 4 + now / 400 + k * 1.3) * (30 + u * 44),
          -10 + Math.sin(u * 5 + now / 340 + k) * 40 - u * 30,
        ]);
      }
      aline(g, pts, 3, cols[k % 4], 0.7);
    }
    for (let k = 0; k < 4; k++) {
      const ph = (now / 400 + k / 4) % 1;
      const gl = Math.abs(Math.sin(now / 200 + k * 1.6));
      g.fillStyle(cols[k % 4], gl * (1 - ph));
      g.fillCircle(Math.cos(ph * 6 + k) * 60, -10 + Math.sin(ph * 6 + k) * 74, 2.4);
    }
    for (let k = 0; k < 3; k++) {
      const ph = (now / 600 + k / 3) % 1;
      g.save();
      g.translateCanvas(Math.sin(k * 2.5) * 40, -90 + Math.sin(now / 300 + k) * 8);
      g.rotateCanvas(Math.sin(now / 250 + k) * 0.5);
      g.lineStyle(2, cols[k % 4], 0.7 * (1 - ph * 0.3));
      g.lineBetween(0, 0, 0, 18);
      g.fillStyle(cols[k % 4], 0.8);
      g.fillCircle(0, -2, 3.4);
      g.restore();
    }
  } },
  sambaAuraB: { c: 0xffd45c, a: 0xffffff, draw: (g, now, c, a) => {
    // 节拍光环：环身节拍脉冲环 + 鼓面光影 + 跳动的音量条
    const beat = Math.abs(Math.sin(now / 300));
    for (let k = 0; k < 2; k++) {
      const ph = (now / 600 + k / 2) % 1;
      g.lineStyle(3 * (1 - ph) + 0.5, k % 2 ? c : a, 0.6 * (1 - ph));
      g.strokeEllipse(0, -10, 40 + ph * 130, 60 + ph * 120);
    }
    g.fillStyle(c, 0.2 + beat * 0.15);
    g.fillCircle(0, -10, 24);
    for (let k = 0; k < 6; k++) {
      const h = (6 + Math.abs(Math.sin(now / 180 + k * 1.05)) * 26) * (0.6 + beat * 0.4);
      g.fillStyle(k % 2 ? c : a, 0.8);
      g.fillRect(-62 + k * 21, 90 - h, 13, h);
    }
    for (let k = 0; k < 4; k++) {
      const ph = (now / 500 + k / 4) % 1;
      g.fillStyle(0xffffff, 0.7 * (1 - ph));
      g.fillCircle(Math.cos(ph * 5 + k * 1.6) * 62, -10 + Math.sin(ph * 5 + k * 1.6) * 76, 1.8);
    }
  } },
};
