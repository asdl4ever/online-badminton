import { TAU, type AuraArt } from './shared';

/** 第九批光环 / 背景（恐龙 / 史前 / 神话 / 恶搞 10 主题）——成景构图，画在角色身后，(0,0)=躯干中心 */

export const AURAS_25: Record<string, AuraArt> = {
  // ── 白垩纪猎场 ──
  cretMeteor: { c: 0xff6a2a, a: 0xe8d07a, draw: (g, now, c, a) => {
    // 陨石雨：身后斜落的燃烧陨石 + 拖焰
    g.fillStyle(0x2a1810, 0.5); g.fillRect(-100, -110, 200, 150);
    for (let k = 0; k < 5; k++) { const ph = ((now / 1400 + k / 5) % 1); const mx = 60 - ph * 140, my = -80 + ph * 130; g.fillStyle(c, 0.9); g.fillCircle(mx, my, 7); g.fillStyle(0xffd45c, 0.8); g.fillCircle(mx - 3, my - 3, 3); g.fillStyle(a, 0.5 * (1 - ph)); g.fillPoints([{ x: mx + 6, y: my - 2 }, { x: mx + 30, y: my - 14 }, { x: mx + 28, y: my - 8 }] as never, true); }
    g.fillStyle(0x3a200a, 0.4); g.fillEllipse(0, 40, 170, 20);
  } },
  cretFern: { c: 0x6a8a3a, a: 0x9fe86a, draw: (g, now, c, a) => {
    // 蕨林孢子：上古蕨叶剪影 + 上浮孢子
    g.fillStyle(0x1a2a10, 0.55); g.fillRect(-100, -100, 200, 140);
    for (const dir of [-1, 1]) { for (let k = 0; k < 4; k++) { const bx = dir * (30 + k * 12); g.fillStyle(c, 0.5); g.fillPoints([{ x: bx, y: 40 }, { x: bx + dir * 6, y: 10 }, { x: bx + dir * 18, y: -10 }, { x: bx + dir * 8, y: -6 }, { x: bx + dir * 4, y: 40 }] as never, true); } }
    for (let k = 0; k < 10; k++) { const ph = ((now / 1600 + k / 10) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(-70 + (k * 29 % 150), 40 - ph * 120, 1.8); }
  } },
  // ── 史前沼泽 ──
  swampMiasma: { c: 0x2a5a3a, a: 0x7dff9a, draw: (g, now, c, a) => {
    // 沼气环绕：升腾的沼气 + 雾团
    g.fillStyle(0x0f2418, 0.5); g.fillEllipse(0, 10, 180, 140);
    for (let k = 0; k < 5; k++) { const ph = ((now / 1500 + k / 5) % 1); g.fillStyle(c, 0.28 * (1 - ph)); g.fillEllipse(-60 + k * 30, 30 - ph * 100, 50 - k * 4, 34); }
    for (let k = 0; k < 8; k++) { const ph = ((now / 900 + k / 8) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(-70 + (k * 37 % 150), 40 - ph * 110, 2); }
    void a;
  } },
  swampFireflies: { c: 0x7dff9a, a: 0x9fe86a, draw: (g, now, c, a) => {
    // 萤火虫群：环身飞舞的萤火虫，逐个明灭
    g.fillStyle(0x0f2418, 0.4); g.fillEllipse(0, 20, 170, 130);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU + now / 2500; const on = Math.max(0, Math.sin(now / 350 + k * 1.7)); g.fillStyle(a, on * 0.4); g.fillCircle(Math.cos(ang) * 60, -10 + Math.sin(ang) * 42, 4); g.fillStyle(c, 0.9); g.fillCircle(Math.cos(ang) * 60, -10 + Math.sin(ang) * 42, 1.8); }
  } },
  swampDragonfly: { c: 0x7dff9a, a: 0xd0ff9a, draw: (g, now, c, a) => {
    // 蜻蜓群：一群振翅蜻蜓 + 水汽
    g.fillStyle(0x0f2418, 0.4); g.fillEllipse(0, 20, 180, 130);
    for (let k = 0; k < 7; k++) { const ang = (k / 7) * TAU + now / 1800; const dx = Math.cos(ang) * 55, dy = -10 + Math.sin(ang) * 40; const flap = Math.sin(now / 90 + k) * 4; g.fillStyle(a, 0.8); g.fillPoints([{ x: dx, y: dy }, { x: dx - 10, y: dy - flap }, { x: dx - 2, y: dy + 2 }] as never, true); g.fillPoints([{ x: dx, y: dy }, { x: dx + 10, y: dy - flap }, { x: dx + 2, y: dy + 2 }] as never, true); g.fillStyle(c, 1); g.fillEllipse(dx, dy, 14, 3); }
    for (let k = 0; k < 6; k++) { const ph = ((now / 1400 + k / 6) % 1); g.fillStyle(0xd0ff9a, (1 - ph) * 0.4); g.fillCircle(-70 + (k * 29 % 150), 40 - ph * 90, 2); }
  } },
  swampPuddle: { c: 0x3a7a4a, a: 0x7dff9a, draw: (g, now, c, a) => {
    // 沼雾环：一圈沼雾旋转
    g.fillStyle(0x0f2418, 0.35); g.fillEllipse(0, 30, 170, 90);
    for (let k = 0; k < 3; k++) { const ang = now / 2200 + k * 2.09; g.fillStyle(c, 0.22); g.fillEllipse(Math.cos(ang) * 40, 20 + Math.sin(ang) * 20, 60, 22); }
    g.fillStyle(a, 0.35); g.fillEllipse(0, 44, 140, 16);
    for (let k = 0; k < 4; k++) { const ph = ((now / 1000 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.6); g.fillCircle(-40 + k * 26, 40 - ph * 20, 2); }
  } },
  // ── 冰河世纪 ──
  iceageBlizzard: { c: 0x8fd8ff, a: 0xe0f2ff, draw: (g, now, c, a) => {
    // 暴风雪：旋转雪片 + 风纹
    g.fillStyle(0x0e2030, 0.5); g.fillRect(-100, -110, 200, 150);
    for (let k = 0; k < 16; k++) { const ph = ((now / 900 + k / 16) % 1); g.fillStyle(a, (1 - ph) * 0.85); g.fillCircle(-90 + ph * 180, -80 + (k * 23 % 140), 1.6 + (k % 3)); }
    g.lineStyle(2, c, 0.3); for (let k = 0; k < 4; k++) { const yy = -60 + k * 30; g.lineBetween(-90, yy, 90, yy + Math.sin(now / 500 + k) * 8); }
  } },
  iceageAurora: { c: 0x9fe8d0, a: 0x8fd8ff, draw: (g, now, c, a) => {
    // 极光帘：垂落的极光帷幕
    g.fillStyle(0x0e2030, 0.55); g.fillRect(-100, -110, 200, 150);
    for (let b = 0; b < 3; b++) { g.fillStyle(b % 2 ? c : a, 0.22); g.beginPath(); g.moveTo(-100, -70 - b * 10); for (let s = 0; s <= 8; s++) { g.lineTo(-100 + s * 25, -50 - b * 14 + Math.sin(s * 0.8 + now / 1000 + b) * 16); } g.lineTo(100, -70 - b * 10); g.lineTo(100, 30); g.lineTo(-100, 30); g.closePath(); g.fillPath(); }
    for (let k = 0; k < 8; k++) { g.fillStyle(0xffffff, 0.5 + 0.4 * Math.sin(now / 700 + k)); g.fillCircle(-80 + k * 24, -60 + (k * 17 % 50), 1.4); }
  } },
  // ── 非洲雷神 ──
  yorStorm: { c: 0x4a2010, a: 0xffe08a, draw: (g, now, c, a) => {
    // 雷云：翻滚雷云 + 闪雷
    g.fillStyle(0x241008, 0.7); g.fillRect(-100, -110, 200, 120);
    for (let k = 0; k < 5; k++) { g.fillStyle(c, 0.5); g.fillEllipse(-70 + k * 34, -50 + Math.sin(now / 800 + k) * 6, 60, 34); }
    const flash = Math.max(0, Math.sin(now / 130)); if (flash > 0.6) { g.lineStyle(3, a, flash); g.lineBetween(-20, -40, 4, 0); g.lineBetween(4, 0, -6, 10); g.lineBetween(-6, 10, 14, 50); }
    for (let k = 0; k < 6; k++) { const ph = ((now / 700 + k / 6) % 1); g.fillStyle(a, (1 - ph) * 0.5); g.fillCircle(-70 + (k * 41 % 150), -80 + ph * 120, 1.6); }
  } },
  yorFire: { c: 0xff7a2a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 圣火环：环身橙红圣火
    g.fillStyle(0x241008, 0.5); g.fillEllipse(0, 20, 180, 140);
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU; const fx = Math.cos(ang) * 52, fy = -10 + Math.sin(ang) * 40; const fl = Math.sin(now / 120 + k) * 6; g.fillStyle(c, 0.8); g.fillPoints([{ x: fx - 6, y: fy + 8 }, { x: fx + 6, y: fy + 8 }, { x: fx + fl * 0.5, y: fy - 16 - Math.abs(fl) }] as never, true); g.fillStyle(a, 0.8); g.fillPoints([{ x: fx - 3, y: fy + 6 }, { x: fx + 3, y: fy + 6 }, { x: fx + fl * 0.3, y: fy - 8 }] as never, true); }
  } },
  // ── 芬兰史诗 ──
  kalSea: { c: 0x2f5a6a, a: 0x9fe8d0, draw: (g, now, c, a) => {
    // 波罗的海浪：身后翻涌海浪 + 白沫
    g.fillStyle(0x12202a, 0.5); g.fillRect(-100, -110, 200, 150);
    for (let b = 0; b < 3; b++) { g.fillStyle(b % 2 ? c : 0x3a7a8a, 0.5); g.beginPath(); g.moveTo(-100, 20 - b * 20); for (let s = 0; s <= 8; s++) { g.lineTo(-100 + s * 25, 8 - b * 20 + Math.sin(s + now / 500 + b) * 8); } g.lineTo(100, 60); g.lineTo(-100, 60); g.closePath(); g.fillPath(); }
    for (let k = 0; k < 8; k++) { g.fillStyle(a, 0.7); g.fillCircle(-80 + (k * 31 % 170), 30 + (k % 2) * 8, 2); }
  } },
  kalStarDome: { c: 0x24303a, a: 0x9fe8d0, draw: (g, now, c, a) => {
    // 星辰穹顶：头顶半圆星穹
    g.fillStyle(c, 0.6); g.fillRect(-100, -110, 200, 150);
    g.fillStyle(0x0e1820, 0.6); g.fillEllipse(0, -50, 190, 150);
    for (let k = 0; k < 14; k++) { const ang = (k / 14) * Math.PI; const rr = 70; g.fillStyle(a, 0.4 + 0.5 * Math.abs(Math.sin(now / 800 + k))); g.fillCircle(Math.cos(ang) * rr, -50 - Math.sin(ang) * 60, 1.4); }
    for (let k = 0; k < 4; k++) { const ang = now / 2200 + k * 1.57; g.fillStyle(a, 0.3); g.fillEllipse(Math.cos(ang) * 40, -20 + Math.sin(ang) * 16, 40, 14); }
  } },
  // ── 香蕉王国 ──
  banRain: { c: 0xf0d020, a: 0xfff080, draw: (g, now, c, a) => {
    // 香蕉雨：头顶落香蕉
    g.fillStyle(0x4a4a08, 0.4); g.fillRect(-100, -110, 200, 150);
    for (let k = 0; k < 8; k++) { const ph = ((now / 1200 + k / 8) % 1); const bx = -70 + (k * 37 % 150), by = -90 + ph * 140; g.save(); g.translateCanvas(bx, by); g.rotateCanvas(0.5 + ph); g.fillStyle(c, 1); g.fillEllipse(0, 0, 8, 20); g.fillStyle(a, 0.8); g.fillCircle(0, -8, 1.4); g.restore(); }
  } },
  banBubbles: { c: 0xfff080, a: 0xffe040, draw: (g, now, c, a) => {
    // 热带泡泡：上浮的彩色泡泡
    for (let k = 0; k < 10; k++) { const ph = ((now / 1500 + k / 10) % 1); const bx = -70 + (k * 31 % 150), by = 40 - ph * 130; const rr = 3 + (k % 3) * 3; g.fillStyle(c, (1 - ph) * 0.4); g.fillCircle(bx, by, rr); g.lineStyle(1.2, a, (1 - ph) * 0.8); g.strokeCircle(bx, by, rr); g.fillStyle(0xffffff, (1 - ph) * 0.6); g.fillCircle(bx - rr * 0.4, by - rr * 0.4, rr * 0.3); }
  } },
  banSun: { c: 0xf0d020, a: 0xffe040, draw: (g, now, c, a) => {
    // 香蕉太阳：一轮香蕉太阳
    g.fillStyle(0x4a4a08, 0.35); g.fillEllipse(0, -20, 190, 150);
    g.save(); g.translateCanvas(0, -30); g.rotateCanvas(now / 3000);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU; g.fillStyle(c, 0.55); g.fillPoints([{ x: Math.cos(ang) * 30, y: Math.sin(ang) * 30 }, { x: Math.cos(ang) * 62, y: Math.sin(ang) * 62 }, { x: Math.cos(ang + 0.22) * 30, y: Math.sin(ang + 0.22) * 30 }] as never, true); }
    g.restore();
    g.fillStyle(c, 1); g.fillCircle(0, -30, 26); g.fillStyle(a, 0.9); g.fillCircle(0, -30, 18);
  } },
  banConfetti: { c: 0xf0d020, a: 0xff5ec8, draw: (g, now, c, a) => {
    // 彩纸雨：飘落的彩纸 + 彩带
    const cols = [0xff5ec8, 0x7dff9a, 0x39ffd0, 0xffe040];
    for (let k = 0; k < 14; k++) { const ph = ((now / 1700 + k / 14) % 1); const bx = -90 + (k * 29 % 180) + Math.sin(now / 500 + k) * 6, by = -90 + ph * 140; g.save(); g.translateCanvas(bx, by); g.rotateCanvas(ph * 4 + k); g.fillStyle(cols[k % 4], 0.9); g.fillRect(-3, -2, 6, 4); g.restore(); }
    void c; void a;
  } },
  // ── 迷因宇宙 ──
  memeDanmaku: { c: 0x39ffd0, a: 0x7dff9a, draw: (g, now, c, a) => {
    // 弹幕雨：落下的一条条弹幕
    g.fillStyle(0x0e1620, 0.45); g.fillRect(-100, -110, 200, 150);
    for (let k = 0; k < 8; k++) { const ph = ((now / 1300 + k / 8) % 1); const bx = -80 + (k * 41 % 160), by = -80 + ph * 130; g.fillStyle(k % 2 ? c : a, 0.85); g.fillRoundedRect(bx, by, 16 + (k % 3) * 8, 6, 3); }
  } },
  memePixelStorm: { c: 0x7dff9a, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 像素风暴：环绕的方块像素
    g.fillStyle(0x0e1620, 0.4); g.fillEllipse(0, 0, 190, 150);
    for (let k = 0; k < 18; k++) { const ang = (k / 18) * TAU + now / 2000; const rr = 40 + (k % 4) * 16; const on = Math.max(0, Math.sin(now / 250 + k)); g.fillStyle(on > 0.5 ? c : a, 0.85); g.fillRect(Math.cos(ang) * rr - 3, Math.sin(ang) * rr * 0.75 - 3, 6, 6); }
    void a;
  } },
  memeStars: { c: 0xffe040, a: 0x7dff9a, draw: (g, now, c, a) => {
    // 星星环绕：环绕的星星
    for (let k = 0; k < 9; k++) { const ang = (k / 9) * TAU + now / 2200; const sx = Math.cos(ang) * 56, sy = -8 + Math.sin(ang) * 40; const s = 6 + 2 * Math.abs(Math.sin(now / 400 + k)); g.fillStyle(c, 0.9); g.fillPoints([{ x: sx, y: sy - s }, { x: sx + s * 0.4, y: sy - s * 0.3 }, { x: sx + s, y: sy }, { x: sx + s * 0.4, y: sy + s * 0.3 }, { x: sx, y: sy + s }, { x: sx - s * 0.4, y: sy + s * 0.3 }, { x: sx - s, y: sy }, { x: sx - s * 0.4, y: sy - s * 0.3 }] as never, true); g.fillStyle(a, 0.5); g.fillCircle(sx, sy, s * 1.6); }
  } },
  memeGlitch: { c: 0xff5ec8, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 故障光环：故障光栅环
    for (let k = 0; k < 6; k++) { const yy = -60 + k * 22; const off = Math.sin(now / 120 + k) * 8; g.fillStyle(k % 2 ? c : a, 0.28); g.fillRect(-90 + off, yy, 180, 5); }
    g.fillStyle(0x0e1620, 0.3); g.fillEllipse(0, 0, 170, 150);
    for (let k = 0; k < 12; k++) { const ph = (k / 12 + now / 1600) % 1; g.fillStyle(a, (1 - ph) * 0.6); g.fillRect(-80 + ph * 160, -30 + (k * 37 % 80), 4, 4); }
  } },
  // ── 摸鱼办公室 ──
  officeSticky: { c: 0xffd45c, a: 0x9fd8ff, draw: (g, now, _c, _a) => {
    // 便签雨：飘落彩色便签
    const cols = [0xffd45c, 0xff9adf, 0x9fd8ff, 0xa8ff7a];
    for (let k = 0; k < 12; k++) { const ph = ((now / 1700 + k / 12) % 1); const bx = -80 + (k * 29 % 160) + Math.sin(now / 500 + k) * 5, by = -90 + ph * 140; g.save(); g.translateCanvas(bx, by); g.rotateCanvas(Math.sin(now / 600 + k) * 0.3); g.fillStyle(cols[k % 4], 0.9); g.fillRect(-5, -5, 10, 10); g.fillStyle(0x00000022); g.fillRect(-3, -3, 6, 1); g.restore(); }
  } },
  officeSleep: { c: 0x9fd8ff, a: 0xffd45c, draw: (g, now, c, a) => {
    // 摸鱼气泡：环绕的 Z 字睡眠气泡
    g.fillStyle(0x2a2a34, 0.35); g.fillEllipse(0, 0, 160, 140);
    for (let k = 0; k < 4; k++) { const ph = ((now / 1600 + k / 4) % 1); const bx = 30 + Math.sin(k * 2) * 20, by = -10 - ph * 90; const s = 8 + k * 2; g.fillStyle(c, (1 - ph) * 0.5); g.fillCircle(bx, by, s); g.lineStyle(2, a, (1 - ph) * 0.9); g.lineBetween(bx - 4, by - 4, bx + 4, by - 4); g.lineBetween(bx + 4, by - 4, bx - 4, by + 4); g.lineBetween(bx - 4, by + 4, bx + 4, by + 4); }
  } },
  // ── 花园地精 ──
  gnomeFireflies: { c: 0xa8ff7a, a: 0xffd0e2, draw: (g, now, c, a) => {
    // 夜光孢子：上浮的发光孢子
    g.fillStyle(0x1a2c16, 0.4); g.fillEllipse(0, 10, 180, 150);
    for (let k = 0; k < 16; k++) { const ph = ((now / 1500 + k / 16) % 1); const bx = -80 + (k * 31 % 160), by = 40 - ph * 140; const on = 0.4 + 0.6 * Math.abs(Math.sin(now / 400 + k)); g.fillStyle(c, on * 0.5); g.fillCircle(bx, by, 4); g.fillStyle(a, (1 - ph) * 0.9); g.fillCircle(bx, by, 1.8); }
    for (let k = 0; k < 4; k++) { const ang = now / 2400 + k * 1.57; g.fillStyle(a, 0.25); g.fillEllipse(Math.cos(ang) * 44, 20 + Math.sin(ang) * 16, 46, 16); }
  } },
  // ── 垃圾回收站 ──
  trashFlies: { c: 0x7a8a7a, a: 0x8fd4a0, draw: (g, now, c, a) => {
    // 苍蝇环绕：环身打转的苍蝇 + 臭气波纹
    g.fillStyle(0x161a1a, 0.4); g.fillEllipse(0, 10, 180, 140);
    for (let k = 0; k < 3; k++) { g.lineStyle(2, a, 0.18); g.strokeCircle(0, 0, 40 + k * 16 + Math.sin(now / 400 + k) * 4); }
    for (let k = 0; k < 9; k++) { const ang = (k / 9) * TAU + now / 500; const fx = Math.cos(ang) * 54, fy = -6 + Math.sin(ang) * 40; g.fillStyle(c, 1); g.fillCircle(fx, fy, 2.4); g.fillStyle(0x00000066); g.fillPoints([{ x: fx, y: fy }, { x: fx - 5, y: fy - 3 }, { x: fx - 3, y: fy }] as never, true); g.fillPoints([{ x: fx, y: fy }, { x: fx + 5, y: fy - 3 }, { x: fx + 3, y: fy }] as never, true); }
  } },
  trashPaper: { c: 0xd8d0c0, a: 0x8fd4a0, draw: (g, now, c, a) => {
    // 废纸卷：飘卷的废纸
    g.fillStyle(0x161a1a, 0.35); g.fillEllipse(0, 10, 170, 140);
    for (let k = 0; k < 8; k++) { const ph = ((now / 1600 + k / 8) % 1); const bx = -70 + (k * 41 % 150) + Math.sin(now / 600 + k) * 8, by = 40 - ph * 130; g.save(); g.translateCanvas(bx, by); g.rotateCanvas(now / 700 + k); g.fillStyle(c, 0.85); g.fillRect(-5, -6, 10, 12); g.restore(); }
    for (let k = 0; k < 5; k++) { const ph = ((now / 1200 + k / 5) % 1); g.fillStyle(c, (1 - ph) * 0.5); g.fillRect(-60 + (k * 34 % 130), 30 + ph * 10, 4, 4); }
    void a;
  } },
  trashStink: { c: 0x7dff9a, a: 0x8fd4a0, draw: (g, now, c, a) => {
    // 臭气环：上升的臭气波
    g.fillStyle(0x161a1a, 0.4); g.fillEllipse(0, 10, 180, 140);
    for (let b = 0; b < 4; b++) { const ph = ((now / 1400 + b / 4) % 1); g.lineStyle(3, c, (1 - ph) * 0.5); g.beginPath(); g.moveTo(-50, 30 - ph * 90); for (let s = 0; s <= 6; s++) { g.lineTo(-50 + s * 17, 30 - ph * 90 + Math.sin(s * 1.2 + now / 400 + b) * 10); } g.lineTo(50, 30 - ph * 90); g.strokePath(); }
    for (let k = 0; k < 6; k++) { const ph = ((now / 1000 + k / 6) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(-50 + (k * 41 % 110), 40 - ph * 110, 2 + ph * 3); }
  } },
  trashSmoke: { c: 0x6a7a6a, a: 0x8fd4a0, draw: (g, now, c, a) => {
    // 毒烟环：翻滚毒烟 + 余火
    g.fillStyle(0x161a1a, 0.5); g.fillEllipse(0, 0, 190, 150);
    for (let k = 0; k < 5; k++) { const ph = ((now / 1600 + k / 5) % 1); g.fillStyle(c, 0.22 * (1 - ph)); g.fillEllipse(-60 + k * 30 + Math.sin(now / 600 + k) * 8, 20 - ph * 110, 54, 40); }
    for (let k = 0; k < 6; k++) { const ph = ((now / 800 + k / 6) % 1); g.fillStyle(0xff7a2a, (1 - ph) * 0.5); g.fillCircle(-50 + (k * 43 % 110), 30 - ph * 30, 2); }
    g.fillStyle(a, 0.3); g.fillEllipse(0, 40, 150, 16);
  } },
};
