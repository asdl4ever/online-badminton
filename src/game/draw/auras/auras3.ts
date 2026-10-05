import { apoly, aline, TAU, type AuraArt } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第三批主题光环 → 背景特效（火山 / 深海沟 / 剑道 / 水墨 / 精灵 / 赛车 / 吸血鬼 / 秋日 / 竹林 / 小丑） */
export const AURAS_3: Record<string, AuraArt> = {
  vulcAuraA: { c: 0xff5a1a, a: 0xffb02a, draw: (g, now, c, a) => {
    // 熔岩辉：身后一炉熔火
    g.fillStyle(c, 0.2); g.fillCircle(0, 30, 100);
    g.fillStyle(a, 0.35); g.fillCircle(0, 50, 66);
    for (let k = 0; k < 4; k++) {
      const ph = (now / 500 + k / 4) % 1;
      g.fillStyle(a, 0.8 * (1 - ph));
      g.fillCircle(-30 + k * 20, 40 - ph * 60, 3.4 * (1 - ph) + 0.8);
    }
  } },
  vulcAuraB: { c: 0xffb347, a: 0xff5a1a, draw: (g, now, c, a) => {
    // 火星旋：环绕上旋的火星
    for (let k = 0; k < 12; k++) {
      const ph = (now / 900 + k / 12) % 1;
      const ang = k * 2.4 + now / 250;
      g.fillStyle(k % 2 ? c : a, (1 - ph) * 0.9);
      g.fillCircle(Math.cos(ang) * (26 + ph * 60), 60 - ph * 170, 2.8 * (1 - ph) + 0.7);
    }
  } },
  trenchAuraA: { c: 0x5fd0c0, a: 0x1a2a4a, draw: (g, now, c, a) => {
    // 洋流幕：身后竖直的洋流帘
    for (let k = 0; k < 5; k++) {
      g.lineStyle(4, k % 2 ? c : a, 0.3);
      g.beginPath();
      for (let s = 0; s <= 8; s++) {
        const u = s / 8;
        const px = -60 + k * 30;
        const py = -130 + u * 250;
        const cx = px + Math.sin(u * 4 + now / 400 + k) * 7;
        if (s === 0) g.moveTo(cx, py); else g.lineTo(cx, py);
      }
      g.strokePath();
    }
  } },
  trenchAuraB: { c: 0x9ffcf0, a: 0x5affd8, draw: (g, now, c, a) => {
    // 生物光：深海的荧光团
    for (let k = 0; k < 7; k++) {
      const gl = 0.3 + 0.5 * Math.abs(Math.sin(now / 350 + k * 2.2));
      const px = Math.sin(k * 12.9) * 80, py = -110 + (k * 41) % 220;
      g.fillStyle(k % 2 ? c : a, gl * 0.5); g.fillCircle(px, py, 9);
      g.fillStyle(c, gl); g.fillCircle(px, py, 3.4);
    }
  } },
  dojoAuraA: { c: 0xbfe8f0, a: 0x5a8a3a, draw: (g, now, c, a) => {
    // 竹叶：背后飘落的竹叶
    for (let k = 0; k < 7; k++) {
      const ph = (now / 1200 + k / 7) % 1;
      g.fillStyle(k % 2 ? a : c, 0.8 * Math.sin(ph * Math.PI));
      g.save();
      g.translateCanvas(-70 + (k * 21) % 140, -130 + ph * 250);
      g.rotateCanvas(Math.sin(now / 450 + k) * 0.9 - 0.5);
      g.fillEllipse(0, 0, 10, 3.6);
      g.restore();
    }
  } },
  dojoAuraB: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 龙威：背后一圈威压光环
    const r = 80 + Math.sin(now / 500) * 8;
    g.lineStyle(5, c, 0.5); g.strokeCircle(0, 0, r);
    g.lineStyle(2, a, 0.7); g.strokeCircle(0, 0, r - 14);
    for (let k = 0; k < 4; k++) {
      const ang = (k / 4) * TAU + now / 1000;
      g.fillStyle(a, 0.9);
      g.fillCircle(Math.cos(ang) * r, Math.sin(ang) * r, 3.4);
    }
  } },
  inkwAuraA: { c: 0x2a2e36, a: 0xbfe8e0, draw: (g, now, c, a) => {
    // 墨滴：晕开的墨团
    for (let k = 0; k < 3; k++) {
      const ph = (now / 1600 + k / 3) % 1;
      g.fillStyle(c, 0.3 * (1 - ph));
      g.fillCircle(Math.sin(k * 5) * 50, -20 - k * 20, 10 + ph * 34);
    }
  } },
  inkwAuraB: { c: 0xbfe8e0, a: 0x2a2e36, draw: (g, now, c, a) => {
    // 山水卷：背后一幅水墨远山
    for (let k = 0; k < 3; k++) {
      apoly(g, Array.from({ length: 7 }, (_, s) => {
        const u = s / 6;
        return [-100 + u * 200, 90 - Math.abs(Math.sin(u * 3.1 + k * 1.7)) * (50 + k * 22)] as [number, number];
      }).concat([[100, 100], [-100, 100]] as Array<[number, number]>), a, 0.22 - k * 0.05);
    }
  } },
  fairyAuraA: { c: 0xffb7d5, a: 0xffffff, draw: (g, now, c, a) => {
    // 花瓣：背后一圈花环光
    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * TAU + now / 2000;
      g.fillStyle(k % 2 ? c : a, 0.7);
      g.fillEllipse(Math.cos(ang) * 76, Math.sin(ang) * 46 - 10, 10, 6);
    }
    g.fillStyle(c, 0.15); g.fillCircle(0, -10, 70);
  } },
  fairyAuraB: { c: 0xfff2b0, a: 0xffe89a, draw: (g, now, c, a) => {
    // 光尘：贴身旋转的光尘
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * TAU + now / 700;
      const r = 34 + (k % 4) * 16 + Math.sin(now / 400 + k) * 6;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k));
      g.fillStyle(k % 3 ? c : a, tw);
      g.fillCircle(Math.cos(ang) * r, -10 + Math.sin(ang) * r * 0.7, 2.4);
    }
  } },
  racerAuraA: { c: 0xff8a4a, a: 0x22222a, draw: (g, now, c, a) => {
    // 车灯：背后扫过的车灯双束
    const sw = Math.sin(now / 700) * 16;
    apoly(g, [[-60 + sw, -130], [-30 + sw, -130], [20, 90], [-30, 90]], c, 0.22);
    apoly(g, [[30 + sw, -130], [60 + sw, -130], [30, 90], [-20, 90]], c, 0.16);
  } },
  racerAuraB: { c: 0xffd45c, a: 0xe83a3a, draw: (g, now, c, a) => {
    // 极速线：横向飞逝的速度线
    for (let k = 0; k < 8; k++) {
      const ph = (now / 350 + k / 8) % 1;
      g.lineStyle(3, k % 2 ? c : a, (1 - ph) * 0.7);
      g.lineBetween(-110 + ph * 220, -110 + (k * 29) % 200, -60 + ph * 220, -110 + (k * 29) % 200);
    }
  } },
  vampAuraA: { c: 0x4a2a6a, a: 0xc8ccd8, draw: (g, now, c, a) => {
    // 暗影触手：身后蠕动的暗影
    for (let k = 0; k < 4; k++) {
      const ang = -2.4 + k * 0.5 + Math.sin(now / 500 + k) * 0.15;
      aline(g, Array.from({ length: 7 }, (_, s) => {
        const u = s / 6;
        return [Math.cos(ang) * u * 84, -10 + Math.sin(ang) * u * 84 + Math.sin(u * 5 + now / 250 + k) * 6] as [number, number];
      }), 8 - k, c, 0.5);
    }
  } },
  vampAuraB: { c: 0xc0203a, a: 0x1a1420, draw: (g, now, c, a) => {
    // 血月：背后一轮血月
    g.fillStyle(a, 0.35); g.fillCircle(0, -60, 96);
    g.fillStyle(c, 0.75); g.fillCircle(0, -60, 62);
    g.fillStyle(0x8a1428, 0.6);
    g.fillCircle(-16, -72, 10); g.fillCircle(14, -50, 7); g.fillCircle(4, -84, 5); // 月面
  } },
  autumnAuraA: { c: 0xd4622a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 红叶：漫天枫叶
    for (let k = 0; k < 9; k++) {
      const ph = (now / 1200 + k / 9) % 1;
      g.fillStyle(k % 2 ? c : a, 0.85 * Math.sin(ph * Math.PI));
      g.save();
      g.translateCanvas(-76 + (k * 19) % 152, -140 + ph * 260);
      g.rotateCanvas(Math.sin(now / 380 + k) * 1.2);
      for (let s = 0; s < 4; s++) {
        const ang = (s / 4) * TAU;
        apoly(g, [[0, 0], [Math.cos(ang) * 7 - 2, Math.sin(ang) * 7], [Math.cos(ang) * 7 + 2, Math.sin(ang) * 7]], k % 2 ? c : a, 0.85 * Math.sin(ph * Math.PI));
      }
      g.restore();
    }
  } },
  autumnAuraB: { c: 0xffd45c, a: 0xd88a2a, draw: (g, now, c, a) => {
    // 麦浪：身后起伏的麦浪层
    for (let k = 0; k < 3; k++) {
      apoly(g, Array.from({ length: 9 }, (_, s) => {
        const u = s / 8;
        return [-100 + u * 200, 70 - k * 18 + Math.sin(u * 5 + now / 350 + k) * 6] as [number, number];
      }).concat([[100, 110], [-100, 110]] as Array<[number, number]>), k % 2 ? c : a, 0.3);
    }
  } },
  pandaAuraA: { c: 0x8fbf5a, a: 0x4a6a2a, draw: (g, now, c, a) => {
    // 竹影：身后几根摇曳的竹影
    for (let k = 0; k < 3; k++) {
      const bx = -56 + k * 48;
      const sway = Math.sin(now / 700 + k) * 6;
      g.lineStyle(5, k % 2 ? a : c, 0.4);
      g.lineBetween(bx, 110, bx + sway, -130);
      g.fillStyle(k % 2 ? c : a, 0.4);
      g.fillEllipse(bx + sway + 8, -100 + k * 14, 16, 5);
      g.fillEllipse(bx + sway - 8, -80 + k * 10, 16, 5);
    }
  } },
  pandaAuraB: { c: 0xdcefff, a: 0xffffff, draw: (g, now, c, a) => {
    // 云雾：山间云雾缭绕
    for (let k = 0; k < 4; k++) {
      const ph = (now / 1600 + k / 4) % 1;
      g.fillStyle(k % 2 ? c : a, 0.3 * Math.sin(ph * Math.PI));
      g.fillEllipse(-70 + ph * 140, 60 - ph * 150, 90, 22);
    }
  } },
  jokerAuraA: { c: 0xff8ad4, a: 0xffd45c, draw: (g, now, c, a) => {
    // 纸牌环绕：绕身的扑克牌
    for (let k = 0; k < 5; k++) {
      const ang = (k / 5) * TAU + now / 1100;
      g.save();
      g.translateCanvas(Math.cos(ang) * 74, -10 + Math.sin(ang) * 40);
      g.rotateCanvas(now / 500 + k);
      g.fillStyle(0xf0f0f0, 0.9);
      g.fillRect(-6, -9, 12, 18);
      g.fillStyle(k % 2 ? c : a, 0.9);
      g.fillCircle(0, 0, 3);
      g.restore();
    }
  } },
  jokerAuraB: { c: 0xffd45c, a: 0xffffff, draw: (g, now, c, a) => {
    // 星屑：背后炸开的星屑云
    for (let k = 0; k < 14; k++) {
      const ph = (now / 1000 + k / 14) % 1;
      const ang = k * 2.4;
      g.fillStyle(k % 2 ? c : a, (1 - ph) * 0.9);
      g.fillCircle(Math.cos(ang) * (16 + ph * 84), -10 + Math.sin(ang) * (16 + ph * 70), 3 * (1 - ph) + 0.8);
    }
  } },
};
