import { TAU, apoly, aline, type AuraArt } from './shared';

/** 批十五光环（基多拉 / 魔斯拉 / 机甲战队 / 火山泰坦 / 深海巨妖）——成景构图，画在角色身后 */

export const AURAS_20: Record<string, AuraArt> = {
  ghidAuraA: { c: 0x7fd4ff, a: 0xffe15c, draw: (g, now, _c, a) => {
    // 雷暴云团：身后翻滚的雷云 + 云间闪电 + 落下雨丝
    for (let k = 0; k < 7; k++) { g.fillStyle(0x2a2a3a, 0.4); g.fillCircle(-90 + k * 30 + Math.sin(now / 900 + k) * 8, -70 + (k % 3) * 22, 24); }
    const flick = Math.sin(now / 110) > 0.5 ? 1 : 0.3;
    g.lineStyle(2.4, a, flick);
    g.beginPath(); g.moveTo(-30, -80); g.lineTo(-14, -40); g.lineTo(-22, -34); g.lineTo(-2, 4); g.strokePath();
    for (let k = 0; k < 8; k++) { const ph = ((now / 500 + k / 8) % 1); aline(g, [[-80 + k * 22, -30], [-84 + k * 22, -30 + ph * 70]], 1.4, 0x7fd4ff, 0.4); }
  } },
  ghidAuraB: { c: 0xffe15c, a: 0x7fd4ff, draw: (g, now, _c, a) => {
    // 三首龙威：身后三支龙颈剪影 + 张开巨翼 + 电弧
    for (const s of [-1, 0, 1]) {
      g.fillStyle(0x4a3a10, 0.6);
      apoly(g, [[-8 + s * 30, 40], [8 + s * 30, 40], [12 + s * 34, -50 + Math.sin(now / 700 + s) * 6], [-4 + s * 34, -60]], 0x4a3a10, 0.6);
      g.fillStyle(0x6a5418, 0.8); g.fillCircle(4 + s * 34, -64 + Math.sin(now / 700 + s) * 6, 9);
      g.fillStyle(a, 0.8); g.fillCircle(6 + s * 34, -66, 2.2);
    }
    for (const s of [-1, 1]) { g.fillStyle(0x4a3a10, 0.35); apoly(g, [[0, 0], [s * 100, -60], [s * 70, 30]], 0x4a3a10, 0.35); }
    g.fillStyle(a, 0.14); g.fillEllipse(0, 46, 220, 16);
  } },
  mthrAuraA: { c: 0xffe66a, a: 0xbfe8ff, draw: (g, now, c, a) => {
    // 鳞粉飞舞：满屏飘散的发光鳞粉
    for (let k = 0; k < 22; k++) {
      const ph = ((now / 2200 + k / 22) % 1);
      const px = -100 + (k * 37 % 200) + Math.sin(now / 600 + k) * 10;
      const py = -120 + ph * 200;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k));
      g.fillStyle(k % 3 === 0 ? a : c, tw * 0.8);
      g.save(); g.translateCanvas(px, py); g.rotateCanvas(now / 700 + k);
      g.fillPoints([{ x: -3, y: 0 }, { x: 0, y: -2.4 }, { x: 3, y: 0 }, { x: 0, y: 2.4 }] as never, true);
      g.restore();
    }
  } },
  mthrAuraB: { c: 0xbfe8ff, a: 0xffe66a, draw: (g, now, _c, a) => {
    // 月光蛾幕：身后月光 + 两片巨蛾翅影 + 鳞粉
    g.fillStyle(0xbfe8ff, 0.14); g.fillCircle(0, -60, 40);
    g.fillStyle(a, 0.85); g.fillCircle(0, -60, 22);
    for (const s of [-1, 1]) { g.fillStyle(0xbfe8ff, 0.18); apoly(g, [[0, 0], [s * 120, -70], [s * 90, 40]], 0xbfe8ff, 0.18); }
    for (let k = 0; k < 10; k++) { const ph = ((now / 1600 + k / 10) % 1); g.fillStyle(0xffffff, 0.6 * (1 - ph)); g.fillCircle(-80 + k * 18, 20 - ph * 160, 1.4); }
  } },
  tksAuraA: { c: 0x5ac8ff, a: 0x8a94a2, draw: (g, now, _c, a) => {
    // 全息扫描：身后同心扫描环 + 网格 + 数据点
    g.lineStyle(1, 0x5ac8ff, 0.14);
    for (let k = -3; k <= 3; k++) g.lineBetween(k * 30, -120, k * 30, 60);
    for (let k = -3; k <= 3; k++) g.lineBetween(-100, k * 30, 100, k * 30);
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.lineStyle(2 - ph, a, 0.5 * (1 - ph)); g.save(); g.translateCanvas(0, -20); g.scaleCanvas(1, 0.7); g.beginPath(); g.arc(0, 0, 20 + ph * 80, 0, TAU); g.strokePath(); g.restore(); }
    for (let k = 0; k < 6; k++) { const tw = Math.abs(Math.sin(now / 400 + k)); g.fillStyle(a, tw * 0.7); g.fillCircle(-80 + k * 30, -60 + (k % 3) * 30, 1.6); }
  } },
  tksAuraB: { c: 0xff4a4a, a: 0x5ac8ff, draw: (g, now, _c, a) => {
    // 合体阵：五块机体碎片绕中心汇聚又散开
    for (let k = 0; k < 5; k++) {
      const ang = (k / 5) * TAU + now / 1600;
      const rr = 40 + Math.sin(now / 700 + k) * 20;
      const px = Math.cos(ang) * rr, py = -20 + Math.sin(ang) * rr * 0.7;
      g.save(); g.translateCanvas(px, py); g.rotateCanvas(now / 900 + k);
      g.fillStyle(k % 2 ? a : 0x8a94a2, 0.8);
      g.fillRect(-8, -6, 16, 12);
      g.fillStyle(0x2a3244, 0.9); g.fillRect(-5, -3, 10, 6);
      g.restore();
    }
    g.fillStyle(a, 0.15); g.fillCircle(0, -20, 40);
    g.lineStyle(1.6, 0xff4a4a, 0.4 + 0.3 * Math.sin(now / 300)); g.beginPath(); g.arc(0, -20, 26, 0, TAU); g.strokePath();
  } },
  titanAuraA: { c: 0x8a7a6a, a: 0xff6a2a, draw: (g, now, _c, a) => {
    // 火山灰云：身后滚滚火山灰 + 飘落的余烬
    for (let k = 0; k < 8; k++) { g.fillStyle(0x3a342c, 0.4); g.fillEllipse(-90 + k * 26 + Math.sin(now / 1100 + k) * 10, -70 + (k % 3) * 20, 40, 24); }
    for (let k = 0; k < 14; k++) { const ph = ((now / 1800 + k / 14) % 1); g.fillStyle(a, (1 - ph) * 0.85); g.fillCircle(-100 + (k * 41 % 200), -120 + ph * 190, 1.6 * (1 - ph) + 0.4); }
  } },
  titanAuraB: { c: 0xff6a2a, a: 0xffd45c, draw: (g, now, _c, a) => {
    // 岩浆喷发：身后火山口喷发火柱 + 岩浆弹
    g.fillStyle(0x2a1a12, 0.6); apoly(g, [[-70, 50], [0, -70], [70, 50]], 0x2a1a12, 0.5);
    g.fillStyle(0xffd45c, 0.5); apoly(g, [[-16, -46], [16, -46], [10, -64], [-10, -64]], 0xffd45c, 0.5);
    for (let k = 0; k < 10; k++) { const ph = ((now / 1000 + k / 10) % 1); g.fillStyle(k % 2 ? a : 0xffd45c, (1 - ph) * 0.9); g.fillCircle(Math.sin(k * 2) * 30, -60 - ph * 60, 3 * (1 - ph) + 0.6); }
    g.fillStyle(a, 0.5); g.fillEllipse(0, 46, 140, 14);
  } },
  leviAuraA: { c: 0x5fe8d0, a: 0xbfe8ff, draw: (g, now, _c, a) => {
    // 上浮气泡：满屏上升的气泡，泡内反光
    for (let k = 0; k < 18; k++) {
      const ph = ((now / 2000 + k / 18) % 1);
      const bx = -100 + (k * 37 % 200) + Math.sin(now / 500 + k) * 8;
      const r = 3 + (k % 4) * 3;
      g.fillStyle(0x5fe8d0, 0.2);
      g.fillCircle(bx, 50 - ph * 190, r);
      g.lineStyle(1.2, a, 0.5); g.beginPath(); g.arc(bx, 50 - ph * 190, r, 0, TAU); g.strokePath();
      g.fillStyle(0xffffff, 0.6); g.fillCircle(bx - r * 0.35, 50 - ph * 190 - r * 0.35, r * 0.28);
    }
  } },
  leviAuraB: { c: 0x9b6aff, a: 0x5fe8d0, draw: (g, now, _c, a) => {
    // 深渊巨口：身后一张巨大的幽光巨口（一圈獠牙）+ 触手
    g.fillStyle(0x070f16, 0.7); g.fillEllipse(0, -20, 160, 120);
    for (let k = 0; k < 12; k++) {
      const ang = Math.PI * 0.15 + (k / 11) * Math.PI * 0.7;
      const ex = Math.cos(ang) * 70, ey = -20 + Math.sin(ang) * 55;
      g.fillStyle(0xe8f6ff, 0.85);
      g.fillTriangle(ex - 6, ey - 4, ex + 6, ey - 4, ex, ey + 14);
    }
    const pulse = 0.5 + 0.5 * Math.sin(now / 500);
    g.fillStyle(a, 0.4 * pulse); g.fillEllipse(0, -20, 90, 60);
    for (let k = 0; k < 4; k++) {
      const ang = (k / 4) * TAU + now / 900;
      aline(g, [[Math.cos(ang) * 40, -20 + Math.sin(ang) * 30], [Math.cos(ang) * 110, -20 + Math.sin(ang) * 80]], 4, a, 0.4);
    }
  } },
};
