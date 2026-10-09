import { TAU, apoly, type AuraArt } from './shared';

/** 第六批光环 / 背景（斯拉夫 / 波斯 / 印加 / 波利尼西亚 / 澳洲梦幻时代）——成景构图，画在角色身后 */

export const AURAS_22: Record<string, AuraArt> = {
  // ── 斯拉夫 ──
  slavHutAura: { c: 0x8a5a2a, a: 0x7dff6a, draw: (g, now, c, a) => {
    // 鸡爪小屋：身后一座踩鸡爪的小木屋，窗透暖光、烟囱冒烟
    const float = Math.sin(now / 480) * 4;
    g.fillStyle(0x5a3a1a, 1); apoly(g, [[-34, 40 + float], [34, 40 + float], [30, -6 + float], [-30, -6 + float]], 0x5a3a1a, 1);
    g.fillStyle(c, 1); apoly(g, [[-30, 36 + float], [30, 36 + float], [26, -2 + float], [-26, -2 + float]], c, 1);
    g.fillStyle(0x3a2410, 1); apoly(g, [[-36, -4 + float], [36, -4 + float], [0, -42 + float]], 0x3a2410, 1);
    g.fillStyle(0x6a4a24, 1); apoly(g, [[-24, -2 + float], [24, -2 + float], [0, -34 + float]], 0x6a4a24, 1);
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(0xffd45c, 0.85 * gl); g.fillRoundedRect(-7, 8 + float, 14, 12, 3);
    g.fillStyle(0xfff0b0, gl); g.fillCircle(0, 14 + float, 3);
    for (let k = 0; k < 4; k++) { const ph = ((now / 900 + k / 4) % 1); g.fillStyle(0xbfc4cc, 0.4 * (1 - ph)); g.fillCircle(16 + Math.sin(now / 500 + k) * 4, -40 + float - ph * 30, 3); }
    // 鸡爪
    for (const s of [-1, 1]) { g.lineStyle(4, 0xb89050, 0.95); g.fillStyle(0xb89050, 0.95); const step = Math.sin(now / 350 + (s > 0 ? 0 : Math.PI)) * 3; g.fillRoundedRect(s * 18 - 3, 40 + float + step, 6, 22, 2.5); g.fillCircle(s * 18, 62 + float + step, 4); }
    g.fillStyle(a, 0.15); g.fillEllipse(0, 66, 96, 16);
  } },
  slavWitchFire: { c: 0x7dff6a, a: 0x2a5a2a, draw: (g, now, c, _a) => {
    // 巫火环绕：身后 7 簇绿巫火绕身公转、错相明灭
    for (let k = 0; k < 7; k++) {
      const ang = (k / 7) * TAU + now / 1600;
      const px = Math.cos(ang) * 62, py = -20 + Math.sin(ang) * 34;
      const fl = 0.5 + 0.5 * Math.sin(now / 260 + k);
      g.fillStyle(0x1a3a1a, 0.4); g.fillCircle(px, py, 10);
      g.fillStyle(c, 0.5 * fl); g.fillEllipse(px, py, 6, 12);
      g.fillStyle(0xd8ff9a, 0.7 * fl); g.fillEllipse(px, py + 1, 3, 8);
    }
    for (let k = 0; k < 5; k++) { const ph = ((now / 1000 + k / 5) % 1); g.fillStyle(c, (1 - ph) * 0.7); g.fillCircle(-50 + k * 25, 30 - ph * 70, 1.6); }
  } },
  // ── 波斯 ──
  persRoseGarden: { c: 0xff6f91, a: 0x5a8a3a, draw: (g, now, _c, a) => {
    // 空中花园：两层花坛台地 + 中央喷泉 + 玫瑰藤垂落 + 花瓣飘落
    for (let k = 2; k >= 0; k--) { const w = 40 + k * 26, y = 40 - k * 22; g.fillStyle(k % 2 ? 0x6a5a3a : 0x8a7448, 0.9); apoly(g, [[-w, y], [w, y], [w - 8, y - 18], [-w + 8, y - 18]], k % 2 ? 0x6a5a3a : 0x8a7448, 0.9); }
    for (let k = 0; k < 12; k++) { g.fillStyle(k % 2 ? 0x4a8a3a : 0x6aaa4a, 0.75); g.fillCircle(-48 + (k * 31 % 96), 26 - (k % 2) * 18, 5); }
    const jet = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(0x9fd8ff, 0.7); g.fillEllipse(0, -4, 6, 20 + jet * 6);
    g.fillStyle(0xffffff, 0.7); g.fillCircle(0, -20 - jet * 6, 3);
    for (const s of [-1, 1]) { g.lineStyle(3, 0x3a7a3a, 0.9); g.beginPath(); g.moveTo(s * 24, 6); g.lineTo(s * 30, 40); g.strokePath(); }
    for (let k = 0; k < 8; k++) { const ph = ((now / 1000 + k / 8) % 1); g.fillStyle(k % 2 ? 0xff8ab0 : 0xffb7d5, (1 - ph) * 0.85); g.fillCircle(-60 + (k * 47 % 120), -30 + ph * 80, 2); }
    void a;
  } },
  persMithraHalo: { c: 0xffd45c, a: 0xff8a2a, draw: (g, now, c, a) => {
    // 密特拉光轮：带放射芒的金环，光芒相位错开伸缩
    g.fillStyle(c, 0.15); g.fillCircle(0, -34, 58);
    for (let k = 0; k < 16; k++) {
      const ang = (k / 16) * TAU + now / 3200;
      const len = 20 + 8 * (0.5 + 0.5 * Math.sin(now / 280 + k * 0.6));
      g.fillStyle(k % 2 ? c : a, 0.45);
      g.fillTriangle(Math.cos(ang) * 42, -34 + Math.sin(ang) * 42, Math.cos(ang + 0.1) * (42 + len), -34 + Math.sin(ang + 0.1) * (42 + len), Math.cos(ang - 0.1) * (42 + len), -34 + Math.sin(ang - 0.1) * (42 + len));
    }
    g.lineStyle(2.4, c, 0.6); g.strokeCircle(0, -34, 42);
    for (let k = 0; k < 10; k++) { const ang = now / 1800 + (k / 10) * TAU; g.fillStyle(0xfff0b0, 0.6); g.fillCircle(Math.cos(ang) * 42, -34 + Math.sin(ang) * 42, 1.4); }
  } },
  // ── 印加 ──
  incaSacredCity: { c: 0xd8b45a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 山巅圣城：三层梯田台地 + 顶小神殿 + 云带缓移 + 飞鸟
    for (let k = 3; k >= 0; k--) { const w = 34 + k * 22, y = 44 - k * 20; g.fillStyle(k % 2 ? 0x8a7448 : 0xa88a52, 0.9); apoly(g, [[-w, y], [w, y], [w - 6, y - 16], [-w + 6, y - 16]], k % 2 ? 0x8a7448 : 0xa88a52, 0.9); }
    const gl = 0.5 + 0.5 * Math.sin(now / 420);
    g.fillStyle(c, 1); g.fillRect(-10, -34, 20, 12);
    g.fillStyle(0xb87a1a, 1); apoly(g, [[-12, -34], [12, -34], [0, -46]], 0xb87a1a, 1);
    g.fillStyle(a, 0.7 * gl); g.fillRect(-3, -32, 6, 8);
    for (let k = 0; k < 3; k++) { const cx = -70 + ((k * 53 + now / 90) % 140); g.fillStyle(0xffffff, 0.35); g.fillEllipse(cx, -20 + k * 26, 60, 12); }
    for (let k = 0; k < 4; k++) { g.fillStyle(0x3a2a1a, 0.6); const bx = -40 + k * 26, by = -54 + Math.sin(now / 700 + k) * 12; g.fillTriangle(bx, by, bx + 5, by, bx + 2, by - 2); }
  } },
  incaSunHalo: { c: 0xffd45c, a: 0xb87a1a, draw: (g, now, c, a) => {
    // 日冕光环：内环 + 放射光芒缓转 + 环外金屑
    g.fillStyle(c, 0.12); g.fillCircle(0, -32, 56);
    g.lineStyle(3, c, 0.6); g.strokeCircle(0, -32, 40);
    g.lineStyle(1.6, a, 0.5); g.strokeCircle(0, -32, 30);
    for (let k = 0; k < 12; k++) { const ang = now / 2600 + (k / 12) * TAU; g.fillStyle(a, 0.7); g.fillTriangle(Math.cos(ang) * 40, -32 + Math.sin(ang) * 40, Math.cos(ang + 0.12) * 54, -32 + Math.sin(ang + 0.12) * 54, Math.cos(ang - 0.12) * 54, -32 + Math.sin(ang - 0.12) * 54); }
    for (let k = 0; k < 12; k++) { const ph = ((now / 1400 + k / 12) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(Math.cos(k * 0.7) * (40 + ph * 40), -32 + Math.sin(k * 0.7) * (40 + ph * 40), 1.4); }
  } },
  // ── 波利尼西亚 ──
  polyPeleFire: { c: 0xff6a2a, a: 0x5a2410, draw: (g, now, c, a) => {
    // 火山怒火：身后喷发火山，口喷熔岩烟柱、山腰熔岩缓下、火山灰
    g.fillStyle(0x2a1810, 0.9); apoly(g, [[-52, 54], [52, 54], [16, -20], [-16, -20]], 0x2a1810, 0.9);
    g.fillStyle(0x3a2418, 1); apoly(g, [[-46, 52], [46, 52], [14, -16], [-14, -16]], 0x3a2418, 1);
    const jet = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(c, 0.9); apoly(g, [[-12, -16], [12, -16], [8, -40 - jet * 8], [-8, -40 - jet * 8]], c, 0.85);
    g.fillStyle(0xffd45c, 0.9); g.fillEllipse(0, -34 - jet * 6, 14, 10);
    for (let k = 0; k < 4; k++) { g.fillStyle(0x2a2018, 0.5); const ph = ((now / 1000 + k / 4) % 1); g.fillCircle(Math.sin(k * 2) * 14, -46 - ph * 50, 6 + ph * 8); }
    for (const s of [-1, 1]) { g.fillStyle(a, 0.8); g.fillPoints([{ x: s * 20, y: -10 }, { x: s * 34, y: 30 }, { x: s * 16, y: 46 }, { x: s * 12, y: 4 }] as never, true); }
    for (let k = 0; k < 6; k++) { const ph = ((now / 900 + k / 6) % 1); g.fillStyle(k % 2 ? c : 0xffd45c, (1 - ph) * 0.8); g.fillCircle(-20 + (k * 23 % 40), -30 - ph * 44, 1.6); }
  } },
  polyWaveHalo: { c: 0x5fe8d0, a: 0x2a7a8a, draw: (g, now, c, a) => {
    // 潮汐光环：身后翻卷浪花环，浪头相位滚动、溅白沫
    for (let k = 0; k < 3; k++) {
      g.lineStyle(6 - k, k % 2 ? c : 0xdff6ff, 0.4); g.save(); g.translateCanvas(0, -18 - k * 14); g.scaleCanvas(1, 0.55); g.beginPath();
      for (let s = 0; s <= 14; s++) { const ang = (s / 14) * TAU; const rr = 62 - k * 6 + Math.sin(ang * 5 + now / 300 + k) * 6; const px = Math.cos(ang) * rr, py = Math.sin(ang) * rr; if (s === 0) g.moveTo(px, py); else g.lineTo(px, py); }
      g.strokePath(); g.restore();
    }
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU + now / 1400; g.fillStyle(0xffffff, 0.7); g.fillCircle(Math.cos(ang) * 62, -18 + Math.sin(ang) * 34, 2); }
    g.fillStyle(a, 0.2); g.fillEllipse(0, 42, 140, 20);
  } },
  // ── 澳洲梦幻时代 ──
  auzUluru: { c: 0xc0462a, a: 0xff8a5c, draw: (g, now, _c, a) => {
    // 乌鲁鲁圣岩：红岩主体 + 日落光带沿岩面扫过变色 + 岩顶浮尘
    g.fillStyle(0x8a2e1a, 1); apoly(g, [[-54, 52], [54, 52], [40, -30], [0, -50], [-40, -30]], 0x8a2e1a, 1);
    g.fillStyle(0xb0462a, 1); apoly(g, [[-46, 48], [46, 48], [34, -26], [0, -44], [-34, -26]], 0xb0462a, 1);
    const band = (now / 1600) % 1;
    for (let k = 0; k < 5; k++) { const yy = -40 + k * 18; const lit = Math.max(0, 1 - Math.abs(((band * 5) % 5) - k)); g.fillStyle(a, 0.4 * lit); apoly(g, [[-44, yy], [44, yy], [38, yy - 8], [-38, yy - 8]], a, 0.4 * lit); }
    g.lineStyle(1.6, 0x5a1a0e, 0.6); for (let k = 0; k < 4; k++) g.lineBetween(-30 + k * 18, -30, -24 + k * 18, 46);
    for (let k = 0; k < 6; k++) { const ph = ((now / 1400 + k / 6) % 1); g.fillStyle(a, (1 - ph) * 0.6); g.fillCircle(-30 + (k * 31 % 60), -40 - ph * 30, 1.4); }
  } },
  auzDotHalo: { c: 0xff8a5c, a: 0xffd45c, draw: (g, now, c, a) => {
    // 点画光环：一圈点画符号环，点与图腾纹循环亮起、缓转
    const rot = now / 2600;
    g.lineStyle(2, c, 0.5); g.save(); g.translateCanvas(0, -30); g.scaleCanvas(1, 0.6); g.beginPath(); g.arc(0, 0, 66, 0, TAU); g.strokePath(); g.restore();
    for (let k = 0; k < 14; k++) {
      const ang = rot + (k / 14) * TAU, px = Math.cos(ang) * 62, py = -30 + Math.sin(ang) * 37;
      const lit = 0.4 + 0.6 * Math.abs(Math.sin(now / 350 + k));
      g.fillStyle(k % 2 ? a : c, lit); g.fillCircle(px, py, 3);
      g.fillStyle(0x3a1a0e, 0.8); g.fillCircle(px, py, 1.2);
    }
    for (let k = 0; k < 5; k++) { g.fillStyle(a, 0.6); g.fillTriangle(-18 + k * 9, -74, -12 + k * 9, -74, -15 + k * 9, -84); }
  } },
};
