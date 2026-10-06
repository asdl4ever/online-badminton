import { apoly, aline, TAU, type AuraArt } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/**
 * 第二批主题光环 → 背景特效（海盗 / 蒸汽 / 星际 / 侏罗 / 蘑菇 / 热带 / 地穴 / 圣诞 / 寿司 / 荒野）。
 * 每款按名字手工构图，画在角色身后；(0,0) = 角色躯干中心。
 */
export const AURAS_2: Record<string, AuraArt> = {
  pirateAuraA: { c: 0x5fd0c0, a: 0xffffff, draw: (g, now, c, a) => {
    // 潮鸣环绕：身后两道环身的浪墙 + 浪花泡沫 + 海鸣光环
    for (let k = 0; k < 2; k++) {
      const lift = Math.sin(now / 700 + k * 2.4) * 8;
      g.fillStyle(k ? a : c, 0.22);
      g.beginPath();
      g.moveTo(-100, 90);
      g.lineTo(-100, -30 + lift + k * 24);
      for (let s = 0; s <= 8; s++) {
        const u = s / 8;
        g.lineTo(-100 + u * 200, -30 + lift + k * 24 - Math.sin(u * Math.PI) * 34 - Math.sin(u * 9 + now / 260 + k) * 6);
      }
      g.lineTo(100, 90);
      g.closePath(); g.fillPath();
      g.lineStyle(2.4, k ? a : c, 0.7);
      g.beginPath();
      for (let s = 0; s <= 8; s++) {
        const u = s / 8;
        const px = -100 + u * 200;
        const py = -30 + lift + k * 24 - Math.sin(u * Math.PI) * 34 - Math.sin(u * 9 + now / 260 + k) * 6;
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokePath();
    }
    for (let k = 0; k < 6; k++) {
      const ph = (now / 800 + k / 6) % 1;
      g.lineStyle(1.4, a, 0.7 * (1 - ph));
      g.strokeCircle(Math.sin(k * 2.3) * 50, 20 - ph * 110, 2.4 * (1 - ph) + 0.6);
    }
  } },
  pirateAuraB: { c: 0xd8c8a0, a: 0xffd45c, draw: (g, now, c, a) => {
    // 骷髅旗环绕：两杆飘摆的骷髅黑旗 + 旗面骷髅纹 + 环绕的幽灵火
    for (const s of [-1, 1]) {
      const sway = Math.sin(now / 480 + s) * 6;
      aline(g, [[s * 66, -140], [s * 66, 96]], 3.2, 0x4a3826, 0.9);
      apoly(g, [
        [s * 66, -132], [s * (112 + sway), -120], [s * (100 + sway * 0.6), 48], [s * 66, 34],
      ], 0x1c1c24, 0.9);
      g.fillStyle(a, 0.9);
      const fx = s * 86 + sway * 0.4;
      g.fillCircle(fx, -92, 8);
      g.fillRect(fx - 4, -84, 8, 4);
      g.fillStyle(0x1c1c24, 0.9);
      g.fillCircle(fx - 3, -93, 1.8); g.fillCircle(fx + 3, -93, 1.8);
    }
    for (let k = 0; k < 4; k++) {
      const ph = now / 1000 + k * 1.6;
      const gx = Math.sin(ph) * 54, gy = -30 + Math.sin(ph * 1.4) * 50;
      const gl = 0.5 + 0.5 * Math.sin(now / 220 + k * 2.2);
      g.fillStyle(0x9fe8c0, gl * 0.35);
      g.fillEllipse(gx, gy, 12, 17);
      g.fillStyle(0xffffff, gl * 0.8);
      g.fillCircle(gx, gy + 3, 2);
    }
  } },
  steamAuraA: { c: 0xffb03a, a: 0xdfe6f0, draw: (g, now, c, a) => {
    // 蒸汽环流：环身升腾的蒸汽团 + 白雾漫散 + 汽笛光
    for (let k = 0; k < 5; k++) {
      const ph = (now / 1600 + k / 5) % 1;
      const sx = Math.sin(k * 2.5) * 36 + Math.sin(ph * 4 + k) * 10;
      const sy = 70 - ph * 190;
      const grow = 10 + ph * 26;
      g.fillStyle(k % 2 ? a : 0xffffff, 0.28 * Math.sin(ph * Math.PI));
      g.fillCircle(sx, sy, grow);
      g.fillStyle(0xffffff, 0.18 * Math.sin(ph * Math.PI));
      g.fillCircle(sx - grow * 0.3, sy - grow * 0.3, grow * 0.5);
    }
    for (let k = 0; k < 3; k++) {
      const ph = (now / 900 + k / 3) % 1;
      g.fillStyle(c, 0.4 * (1 - ph));
      g.fillCircle(Math.sin(k * 2.2) * 46, 50 - ph * 150, 2 * (1 - ph) + 0.5);
    }
  } },
  steamAuraB: { c: 0x8fd8ff, a: 0x9aa7b8, draw: (g, now, c, a) => {
    // 齿轮光环：背后三枚咬合旋转的铜齿轮 + 蒸汽喷流
    const gear = (cx: number, cy: number, r: number, teeth: number, rot: number, alpha: number) => {
      g.fillStyle(c, alpha);
      g.beginPath();
      for (let k = 0; k < teeth * 2; k++) {
        const ang = rot + (k / (teeth * 2)) * TAU;
        const rr = k % 2 === 0 ? r : r * 0.8;
        const px = cx + Math.cos(ang) * rr, py = cy + Math.sin(ang) * rr;
        if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.closePath(); g.fillPath();
      g.fillStyle(a, alpha);
      g.fillCircle(cx, cy, r * 0.34);
      g.fillStyle(0x5a6472, alpha);
      g.fillCircle(cx, cy, r * 0.12);
    };
    gear(0, -14, 58, 10, now / 2000, 0.55);
    gear(56, -58, 30, 7, -now / 1400, 0.6);
    gear(-52, 44, 24, 6, now / 1100, 0.55);
    for (let k = 0; k < 3; k++) {
      const ph = (now / 500 + k / 3) % 1;
      g.fillStyle(0xffffff, 0.5 * (1 - ph));
      g.fillCircle(66, -70 - ph * 40, 3 * (1 - ph) + 1);
    }
  } },
  astroAuraA: { c: 0xffb03a, a: 0xffe89a, draw: (g, now, c, a) => {
    // 轨道光环：两条交叉的环绕轨道 + 卫星 + 远处的行星
    g.fillStyle(0xc9803a, 0.5);
    g.fillCircle(74, -96, 13);
    g.lineStyle(1.4, a, 0.5);
    g.lineBetween(64, -102, 84, -90);
    [[76, 30, 0.5], [52, 44, -1.1]].forEach(([rx, ry, tilt], k) => {
      g.save();
      g.translateCanvas(0, -8);
      g.rotateCanvas(tilt);
      g.lineStyle(1.6, k ? a : c, 0.45);
      g.beginPath();
      for (let s = 0; s <= 26; s++) {
        const ang = (s / 26) * TAU;
        const px = Math.cos(ang) * rx, py = Math.sin(ang) * ry;
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.closePath(); g.strokePath();
      const ang = now / 700 + k * 2.4;
      g.fillStyle(k ? a : c, 0.95);
      g.fillCircle(Math.cos(ang) * rx, Math.sin(ang) * ry, 4.6);
      g.fillStyle(0xffffff, 0.7);
      g.fillCircle(Math.cos(ang) * rx - 1.4, Math.sin(ang) * ry - 1.4, 1.6);
      g.restore();
    });
    for (let k = 0; k < 5; k++) {
      const tw = Math.abs(Math.sin(now / 300 + k * 1.8));
      g.fillStyle(a, tw);
      g.fillRect(-70 + (k * 31) % 140, -110 + (k * 43) % 90, 1.6, 1.6);
    }
  } },
  astroAuraB: { c: 0x9fd8ff, a: 0xffffff, draw: (g, now, c, a) => {
    // 星云环绕：深空底 + 三团彩色星云 + 环绕的流星
    g.fillStyle(0x141433, 0.4);
    g.fillCircle(0, -20, 100);
    g.fillStyle(0x8f7bff, 0.22); g.fillEllipse(-34, -52, 100, 66);
    g.fillStyle(0x5ac8ff, 0.2); g.fillEllipse(40, 8, 86, 58);
    g.fillStyle(c, 0.2); g.fillEllipse(-6, 40, 70, 44);
    for (let k = 0; k < 9; k++) {
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(now / 240 + k * 1.9));
      g.fillStyle(k % 3 ? a : c, tw);
      g.fillRect(-88 + (k * 39) % 176, -110 + (k * 57) % 200, 1.8, 1.8);
    }
    for (let k = 0; k < 2; k++) {
      const ph = (now / 1100 + k / 2) % 1;
      const sx = -90 + ph * 180, sy = -110 + ph * 140 + k * 40;
      aline(g, [[sx, sy], [sx - 16, sy - 11]], 2, a, 0.9 * (1 - ph));
      g.fillStyle(0xffffff, 1 - ph);
      g.fillCircle(sx, sy, 2);
    }
  } },
  juraAuraA: { c: 0x9fe86a, a: 0x5a7a3a, draw: (g, now, c, a) => {
    // 孢子环绕：环身上浮的绿色孢子 + 孢子伞盖影 + 落下的腐叶
    for (let k = 0; k < 8; k++) {
      const ph = (now / 1300 + k / 8) % 1;
      const sx = Math.sin(k * 2.6) * 54 + Math.sin(ph * 5 + k) * 10;
      const sy = 70 - ph * 210;
      g.fillStyle(k % 2 ? c : a, 0.7 * Math.sin(ph * Math.PI));
      g.fillCircle(sx, sy, 2.4 + (k % 3) * 1.4);
      g.fillStyle(0xffffff, 0.3 * Math.sin(ph * Math.PI));
      g.fillCircle(sx - 1, sy - 1, 1);
    }
    for (let k = 0; k < 3; k++) {
      const ph = (now / 1800 + k / 3) % 1;
      g.save();
      g.translateCanvas(-60 + (k * 60), -110 + ph * 200);
      g.rotateCanvas(Math.sin(now / 500 + k) * 1);
      apoly(g, [[0, -5], [6, 0], [0, 5], [-5, 0]], a, 0.5 * Math.sin(ph * Math.PI));
      g.restore();
    }
  } },
  juraAuraB: { c: 0xffb03a, a: 0xffe8b0, draw: (g, now, c, a) => {
    // 余烬环绕：脚下火山余烬堆 + 冲天的火星柱 + 暗红热浪
    g.fillStyle(0x5a2a1a, 0.5);
    g.fillEllipse(0, 82, 110, 20);
    for (let k = 0; k < 4; k++) g.fillStyle(k % 2 ? c : a, 0.8), g.fillCircle(-30 + k * 20, 78 + (k % 2) * 3, 3.4);
    for (let k = 0; k < 7; k++) {
      const ph = (now / 600 + k / 7) % 1;
      const gl = 0.5 + 0.5 * Math.sin(now / 160 + k * 2.3);
      g.fillStyle(k % 2 ? c : a, gl * (1 - ph));
      g.fillCircle(Math.sin(k * 2.8) * 34 + Math.sin(ph * 6 + k) * 8, 76 - ph * 210, (1.8 + gl) * (1 - ph) + 0.4);
    }
    for (let k = 0; k < 2; k++) {
      const ph = (now / 1000 + k / 2) % 1;
      g.fillStyle(0x8a3a1a, 0.18 * Math.sin(ph * Math.PI));
      g.fillEllipse(0, 50 - ph * 60, 100, 50);
    }
  } },
  mushAuraA: { c: 0xa8ff7a, a: 0xd8e8b0, draw: (g, now, c, a) => {
    // 孢子环绕：脚下蘑菇丛剪影 + 上升的荧光孢子
    g.fillStyle(a, 0.45);
    g.fillEllipse(-46, 78, 30, 12); g.fillEllipse(50, 80, 26, 10);
    g.fillStyle(0x6a8a4a, 0.6);
    g.fillRect(-50, 62, 7, 18); g.fillRect(46, 66, 6, 16);
    g.fillStyle(c, 0.5);
    g.fillEllipse(-46, 60, 20, 10); g.fillEllipse(49, 64, 17, 9);
    for (let k = 0; k < 9; k++) {
      const ph = (now / 1400 + k / 9) % 1;
      const sx = Math.sin(k * 2.9) * 56 + Math.sin(ph * 4 + k) * 10;
      const sy = 66 - ph * 220;
      g.fillStyle(k % 2 ? c : a, 0.75 * Math.sin(ph * Math.PI));
      g.fillCircle(sx, sy, 1.8 + (k % 3));
    }
  } },
  mushAuraB: { c: 0xffe89a, a: 0xffc04a, draw: (g, now, c, a) => {
    // 萤光光环：环身明灭的萤光菇光点 + 一顶大荧光伞盖浮影
    g.fillStyle(c, 0.14);
    g.fillEllipse(0, -60, 110, 56);
    g.lineStyle(1.6, a, 0.4);
    g.beginPath(); g.arc(0, -60, 44, Math.PI, TAU); g.closePath(); g.strokePath();
    g.lineStyle(1.2, a, 0.4);
    g.lineBetween(-30, -60, -24, -10); g.lineBetween(0, -62, 0, -6); g.lineBetween(30, -60, 24, -10);
    for (let k = 0; k < 8; k++) {
      const gl = Math.max(0, Math.sin(now / 700 + k * 1.9));
      const px = Math.sin(k * 2.4) * 56 + Math.sin(now / 900 + k) * 8;
      const py = -20 + Math.sin(k * 1.7) * 60;
      g.fillStyle(a, gl * 0.3);
      g.fillCircle(px, py, 5);
      g.fillStyle(k % 2 ? c : a, gl);
      g.fillCircle(px, py, 1.8);
    }
  } },
  tropicAuraA: { c: 0xbfe8f0, a: 0x3ac8c8, draw: (g, now, c, a) => {
    // 气泡环绕：环身上浮的大小气泡 + 阳光折射光斑
    for (let k = 0; k < 10; k++) {
      const ph = (now / 1500 + k / 10) % 1;
      const bx = Math.sin(k * 2.7) * 58 + Math.sin(now / 600 + k * 2) * 8;
      const by = 84 - ph * 240;
      const r = 3 + (k % 4) * 2.6 + ph * 2;
      g.lineStyle(1.6, k % 3 ? c : a, 0.65 * (1 - ph * 0.4));
      g.strokeCircle(bx, by, r);
      g.fillStyle(0xffffff, 0.65 * (1 - ph * 0.4));
      g.fillCircle(bx - r * 0.35, by - r * 0.35, r * 0.22);
    }
    for (let k = 0; k < 3; k++) {
      g.fillStyle(0xffffff, 0.12 + 0.06 * Math.sin(now / 500 + k * 2));
      apoly(g, [[-60 + k * 50, -130], [-46 + k * 50, -130], [-30 + k * 50, -60], [-44 + k * 50, -60]], 0xffffff, 0.1 + 0.05 * Math.sin(now / 500 + k * 2));
    }
  } },
  tropicAuraB: { c: 0x5fe8d0, a: 0xffffff, draw: (g, now, c, a) => {
    // 洋流环绕：环身流动的洋流带 + 顺流的小鱼影 + 海草摆动
    for (let k = 0; k < 3; k++) {
      const pts: Array<[number, number]> = [];
      for (let s = 0; s <= 12; s++) {
        const u = s / 12;
        pts.push([-100 + ((u + now / 2600 + k / 3) % 1) * 200, -60 + k * 44 + Math.sin(u * 7 + now / 400 + k) * 9]);
      }
      aline(g, pts, 4 - k, k % 2 ? c : a, 0.4);
    }
    for (let k = 0; k < 2; k++) {
      const ph = (now / 900 + k / 2) % 1;
      const fx = -90 + ph * 180;
      const fy = -20 + k * 50 + Math.sin(ph * 8 + k) * 8;
      g.fillStyle(k ? a : c, 0.7 * (1 - ph * 0.3));
      g.fillEllipse(fx, fy, 13, 6);
      apoly(g, [[fx + 6, fy], [fx + 12, fy - 3.4], [fx + 12, fy + 3.4]], k ? a : c, 0.7);
    }
    for (let k = 0; k < 3; k++) {
      const hx = -50 + k * 50;
      g.lineStyle(2.4, 0x2a8a6a, 0.5);
      for (let s = 0; s <= 4; s++) {
        const u = s / 4;
        const px = hx + Math.sin(u * 3 + now / 500 + k) * 7 * u;
        if (s === 0) { g.beginPath(); g.moveTo(hx, 88); } else g.lineTo(px, 88 - u * 50);
      }
      g.strokePath();
    }
  } },
  cryptAuraA: { c: 0x9fd8a0, a: 0x6a4a9a, draw: (g, now, c, a) => {
    // 幽绿环绕：环身渗出的幽绿鬼雾 + 石棺缝光 + 上飘的灵火
    for (let k = 0; k < 4; k++) {
      const ph = (now / 2000 + k / 4) % 1;
      const mx = Math.sin(ph * TAU + k * 1.6) * 44;
      g.fillStyle(k % 2 ? c : 0x6a9a7a, 0.16 * Math.sin(ph * Math.PI));
      g.fillEllipse(mx, 40 - ph * 90, 60, 30);
    }
    g.fillStyle(a, 0.2);
    g.fillRect(-14, 30, 28, 56);
    g.lineStyle(1.6, c, 0.5 + 0.3 * Math.sin(now / 300));
    g.lineBetween(0, 30, 0, 86);
    for (let k = 0; k < 4; k++) {
      const ph = now / 900 + k * 1.5;
      const gl = 0.5 + 0.5 * Math.sin(now / 240 + k * 2);
      g.fillStyle(0xd0ffe0, gl * (0.4 + 0.4 * Math.sin(ph)));
      g.fillEllipse(Math.sin(ph) * 40, -30 + Math.cos(ph * 1.3) * 46, 9, 14);
    }
  } },
  cryptAuraB: { c: 0xffb03a, a: 0x6a6a74, draw: (g, now, c, a) => {
    // 烛火环绕：环身悬浮的蜡烛 + 明灭的烛焰 + 融蜡滴落
    for (let k = 0; k < 3; k++) {
      const cx = -44 + k * 44;
      const cy = 20 + (k % 2) * 34;
      const gl = 0.75 + 0.25 * Math.sin(now / 200 + k * 2.6);
      g.fillStyle(0xfff0d0, 0.9);
      g.fillRect(cx - 4, cy, 8, 22);
      g.fillStyle(a, 0.8);
      g.fillEllipse(cx, cy + 24, 8, 3.4);
      g.fillStyle(c, gl);
      g.fillEllipse(cx, cy - 4, 5, 10);
      g.fillStyle(0xfff6d0, gl);
      g.fillCircle(cx, cy - 2, 2);
      g.fillStyle(0x1a1a1a, 0.1 * gl);
      g.fillCircle(cx, cy - 4, 14);
    }
    for (let k = 0; k < 2; k++) {
      const ph = (now / 900 + k / 2) % 1;
      g.fillStyle(0xfff0d0, 0.6 * (1 - ph));
      g.fillCircle(Math.sin(k * 2.2) * 34, -30 + ph * 60, 1.8 * (1 - ph) + 0.5);
    }
  } },
  festivAuraA: { c: 0xffffff, a: 0x5ac8ff, draw: (g, now, c, a) => {
    // 落雪环绕：斜飘的密雪 + 底部积雪 + 一枚冰晶
    for (let k = 0; k < 12; k++) {
      const ph = (now / 1200 + k / 12) % 1;
      const sx = -95 + (k * 31) % 190 + Math.sin(ph * 6 + k) * 12;
      const sy = -140 + ph * 250;
      g.fillStyle(k % 3 ? c : a, 0.85 * Math.sin(ph * Math.PI));
      g.fillCircle(sx, sy, 1.6 + (k % 3));
    }
    g.fillStyle(c, 0.4);
    g.beginPath();
    g.moveTo(-95, 88);
    g.lineTo(-70, 68); g.lineTo(-40, 84); g.lineTo(-6, 64); g.lineTo(28, 82); g.lineTo(62, 66); g.lineTo(95, 88);
    g.closePath(); g.fillPath();
    const cx = 8, cy2 = -70 + Math.sin(now / 700) * 5;
    g.lineStyle(1.4, a, 0.7);
    for (let s = 0; s < 3; s++) {
      const ang = (s / 3) * Math.PI;
      g.lineBetween(cx - Math.cos(ang) * 10, cy2 - Math.sin(ang) * 10, cx + Math.cos(ang) * 10, cy2 + Math.sin(ang) * 10);
    }
    g.fillStyle(c, 0.8);
    g.fillCircle(cx, cy2, 2);
  } },
  festivAuraB: { c: 0xffd45c, a: 0x3aa05a, draw: (g, now, c, a) => {
    // 铃铛环绕：环身摇晃的金铃铛 + 叮当声波 + 冬青叶
    for (let k = 0; k < 3; k++) {
      const bx = -46 + k * 46;
      const tilt = Math.sin(now / 420 + k * 1.7) * 0.24;
      g.save();
      g.translateCanvas(bx, -60 + (k % 2) * 40);
      g.rotateCanvas(tilt);
      g.fillStyle(c, 0.92);
      g.beginPath(); g.arc(0, 4, 8, Math.PI, TAU); g.closePath(); g.fillPath();
      g.fillRect(-8, 4, 16, 4);
      g.fillStyle(0x8a6a1a, 0.9);
      g.fillCircle(0, 10, 2.4);
      g.fillStyle(0xffffff, 0.5);
      g.fillCircle(-3, 0, 2.2);
      g.restore();
      const ring = Math.abs(Math.sin(now / 420 + k * 1.7));
      if (ring > 0.7) {
        g.lineStyle(1.4, a, (ring - 0.7) * 2.4);
        g.beginPath(); g.arc(bx, -60 + (k % 2) * 40, 14 + (1 - ring) * 10, 0, TAU); g.strokePath();
      }
    }
    for (let k = 0; k < 3; k++) {
      g.fillStyle(0x2a6a3a, 0.6);
      g.fillEllipse(-56 + k * 56, 76 + (k % 2) * 6, 14, 6);
      g.fillStyle(0xd83a3a, 0.8);
      g.fillCircle(-50 + k * 56, 72 + (k % 2) * 6, 3);
    }
  } },
  sushiAuraA: { c: 0xffffff, a: 0xd8e0e8, draw: (g, now, c, a) => {
    // 蒸汽环绕：竹屉上升腾的白汽 + 环绕的热气雾
    g.fillStyle(0xc9a86a, 0.3);
    g.fillEllipse(0, 84, 120, 16);
    g.lineStyle(1.6, 0xc9a86a, 0.5);
    g.strokeEllipse(0, 84, 120, 16);
    for (let k = 0; k < 6; k++) {
      const ph = (now / 1400 + k / 6) % 1;
      const sx = Math.sin(k * 2.3) * 40 + Math.sin(ph * 4 + k) * 12;
      const sy = 76 - ph * 210;
      g.fillStyle(k % 2 ? 0xffffff : c, 0.3 * Math.sin(ph * Math.PI));
      g.fillCircle(sx, sy, 8 + ph * 20);
    }
    g.lineStyle(1.2, a, 0.4);
    g.beginPath(); g.arc(0, 30, 70, now / 1100, now / 1100 + 1.6); g.strokePath();
    g.beginPath(); g.arc(0, 30, 70, now / 1100 + Math.PI, now / 1100 + Math.PI + 1.6); g.strokePath();
  } },
  sushiAuraB: { c: 0xffb7d5, a: 0xffffff, draw: (g, now, c, a) => {
    // 樱花环绕：环身旋落的樱花 + 一枝横斜的樱枝
    g.lineStyle(2.6, 0x6a4a3a, 0.6);
    g.lineBetween(80, -120, 30, -70);
    g.lineBetween(30, -70, -10, -96);
    for (let k = 0; k < 4; k++) {
      const px = [80, 55, 30, -10][k] - 6, py = [-120, -95, -70, -96][k] + 5;
      for (let p = 0; p < 5; p++) {
        const ang = (p / 5) * TAU + now / 1500 + k;
        g.fillStyle(k % 2 ? c : a, 0.8);
        g.fillEllipse(px + Math.cos(ang) * 5, py + Math.sin(ang) * 5, 7, 4);
      }
    }
    for (let k = 0; k < 7; k++) {
      const ph = (now / 1300 + k / 7) % 1;
      const px = Math.sin(k * 2.5) * 58 + Math.sin(ph * 5 + k) * 14;
      const py = -130 + ph * 260;
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas(now / 500 + k);
      g.fillStyle(k % 2 ? c : a, 0.85 * Math.sin(ph * Math.PI));
      g.fillEllipse(0, 0, 8, 4.4);
      g.restore();
    }
  } },
  wildAuraA: { c: 0xffb03a, a: 0xc9803a, draw: (g, now, c, a) => {
    // 尘土环绕：马蹄扬起的尘圈 + 荒野枯草 + 掠过的风沙
    for (let k = 0; k < 3; k++) {
      const ph = (now / 1500 + k / 3) % 1;
      g.fillStyle(k % 2 ? c : a, 0.2 * Math.sin(ph * Math.PI));
      g.fillEllipse(Math.sin(ph * TAU + k) * 30, 60 - ph * 30, 90, 26);
    }
    g.lineStyle(1.8, 0x8a6a3a, 0.55);
    for (let k = 0; k < 4; k++) {
      const gx = -60 + k * 40;
      const sway = Math.sin(now / 400 + k) * 4;
      g.lineBetween(gx, 88, gx + sway, 70);
      g.lineBetween(gx + sway, 70, gx + sway + 6, 64);
    }
    for (let k = 0; k < 6; k++) {
      const ph = (now / 400 + k / 6) % 1;
      g.fillStyle(c, 0.55 * (1 - ph));
      g.fillRect(-100 + ph * 200, -70 + (k * 23) % 130, 5, 1.6);
    }
  } },
  wildAuraB: { c: 0xff9a4a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 落日环绕：身后半沉的巨落日 + 三层余晖横带 + 飞鸟剪影
    g.fillStyle(c, 0.75);
    g.beginPath();
    g.arc(0, 62, 66, Math.PI, TAU);
    g.closePath(); g.fillPath();
    g.fillStyle(a, 0.3);
    g.beginPath();
    g.arc(0, 62, 88, Math.PI, TAU);
    g.closePath(); g.fillPath();
    for (let k = 0; k < 3; k++) {
      g.fillStyle(k % 2 ? a : 0xffb070, 0.16);
      g.fillEllipse(0, 8 + k * 20, 190 - k * 24, 11);
    }
    for (let k = 0; k < 3; k++) {
      const ph = (now / 2400 + k / 3) % 1;
      const bx = -80 + ph * 160, by = -70 - k * 18 + Math.sin(now / 300 + k) * 3;
      g.lineStyle(1.8, 0x4a2a1a, 0.6);
      g.lineBetween(bx - 5, by, bx, by - 3); g.lineBetween(bx, by - 3, bx + 5, by);
    }
  } },
};
