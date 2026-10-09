import { handle, pommel, poly, TAU, type WeaponArt } from './shared';

/** 第六批球拍皮肤（斯拉夫 / 波斯 / 印加 / 波利尼西亚 / 澳洲梦幻时代） */

export const WEAPONS_20: Record<string, WeaponArt> = {
  slavBirchBroom: { c: 0x8a6a3a, a: 0x7dff6a, draw: (g, now, c, a) => {
    // 桦木扫帚·拍：桦木帚柄，末端散开帚枝、飘细叶
    handle(g, -14, -2, 6, 0x5a4028);
    pommel(g, -15, 2.6, 0xc8b89a);
    g.fillStyle(0x6a4a2a, 1); g.fillRect(0, -3, 8, 6);
    for (let k = 0; k < 7; k++) { const ang = -0.7 + k * 0.24; g.lineStyle(2.4, k % 2 ? c : 0x9a7a4a, 0.95); g.beginPath(); g.moveTo(8, ang * 4); g.lineTo(8 + Math.cos(ang) * 28, Math.sin(ang) * 20); g.strokePath(); }
    for (let k = 0; k < 3; k++) { const ph = ((now / 700 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(30 + k * 3, -10 + k * 10 - ph * 8, 1.4); }
  } },
  slavMortarRacket: { c: 0x6a4a2a, a: 0x7dff6a, draw: (g, now, c, a) => {
    // 研钵·拍：拍框是一具小研钵，钵内药汤波动、裂缝漏绿光
    handle(g, -14, -2, 6, 0x4a3420);
    pommel(g, -15, 2.4, 0x3a2814);
    g.fillStyle(0x3a2814, 1); poly(g, [[2, -14], [30, -12], [32, 12], [4, 14]], 0x3a2814, 1);
    g.fillStyle(c, 1); poly(g, [[5, -12], [28, -10], [30, 10], [7, 12]], c, 1);
    g.fillStyle(0x1a3a1a, 0.6);
    const surf = Math.sin(now / 300) * 2;
    g.fillEllipse(17, -2 + surf, 20, 12);
    g.fillStyle(a, 0.85); g.fillEllipse(17, -2 + surf, 18, 10);
    g.fillStyle(0xd8ff9a, 0.8); g.fillEllipse(15, -3 + surf, 6, 4);
    g.lineStyle(1.4, a, 0.7); g.lineBetween(9, -8, 12, 8);
    for (let k = 0; k < 3; k++) { const ph = ((now / 600 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(17 + (k - 1) * 6, -14 - ph * 8, 1.4); }
  } },
  persRoseRacket: { c: 0xc0394a, a: 0x2f7a4a, draw: (g, now, _c, a) => {
    // 玫瑰·拍：拍框缠满玫瑰的圆环，花瓣沿框飘落
    handle(g, -14, -2, 6, 0x2f5a3a);
    pommel(g, -15, 2.4, a);
    g.lineStyle(5, 0x3a7a3a, 0.95); g.strokeCircle(17, 0, 14);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU + now / 2000; const px = 17 + Math.cos(ang) * 14, py = Math.sin(ang) * 14; g.fillStyle(k % 2 ? 0xc0394a : 0xff5a7a, 0.95); g.fillCircle(px, py, 3.4); g.fillStyle(0x8a2a3a, 0.6); g.fillCircle(px, py, 1.2); }
    g.fillStyle(0x2f7a4a, 0.9); for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU + 0.4; g.fillEllipse(17 + Math.cos(ang) * 14, -Math.sin(ang) * 14, 5, 2.6); }
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle(0xff8ab0, (1 - ph) * 0.85); g.fillCircle(17 + k * 4, 18 + (k % 2) * 20, 1.8); }
  } },
  persFeatherRacket: { c: 0xffd45c, a: 0xff5a2a, draw: (g, now, c, a) => {
    // 神鸟羽·拍：拍面是一根巨大神鸟尾羽，羽片眼纹层叠、羽端火焰
    handle(g, -14, -2, 6, 0x8a5a2a);
    pommel(g, -15, 2.6, 0xff5a5a);
    g.fillStyle(0xb87a1a, 1); g.fillRect(2, -2, 26, 4);
    for (let k = 0; k < 4; k++) { g.fillStyle(k % 2 ? c : a, 0.9); g.fillEllipse(18, -8 + k * 5, 24 - k * 2, 5); }
    g.fillStyle(0x2a4a8a, 0.9); g.fillEllipse(18, 0, 8, 12); g.fillStyle(0xffd45c, 0.95); g.fillEllipse(18, 0, 4, 7);
    g.fillStyle(0xfff0b0, 0.6 + 0.4 * Math.sin(now / 200)); g.fillEllipse(30, 0, 8, 18);
    for (let k = 0; k < 3; k++) { const ph = ((now / 700 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.9); g.fillCircle(30, -10 + k * 10 - ph * 6, 1.6); }
  } },
  incaSunRacket: { c: 0xffd45c, a: 0xfff0b0, draw: (g, now, c, a) => {
    // 日轮·拍：拍框是放射金轮，光芒随挥拍伸缩
    handle(g, -14, -2, 6, 0x8a5a2a);
    pommel(g, -15, 2.4, 0xb87a1a);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU; const len = 16 + (0.5 + 0.5 * Math.sin(now / 240 + k)) * 6; g.fillStyle(a, 0.8); g.fillTriangle(17 + Math.cos(ang) * 12, Math.sin(ang) * 12, 17 + Math.cos(ang + 0.1) * len, Math.sin(ang + 0.1) * len, 17 + Math.cos(ang - 0.1) * len, Math.sin(ang - 0.1) * len); }
    g.fillStyle(0x8a5a1a, 1); g.fillCircle(17, 0, 14);
    g.fillStyle(c, 1); g.fillCircle(17, 0, 11);
    g.fillStyle(0x8a5a1a, 1); g.fillCircle(15, -2, 1.4); g.fillCircle(19, -2, 1.4);
    g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 300)); g.fillCircle(17, 0, 16);
  } },
  incaGoldStaff: { c: 0xffc04a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 金杖·拍：黄金权杖，杖身游走金光、杖顶人面
    handle(g, -14, -2, 7, 0xb87a1a);
    pommel(g, -15, 2.8, 0xffd45c);
    g.fillStyle(c, 1); g.fillRoundedRect(2, -3, 26, 6, 3);
    g.fillStyle(0x8a5a1a, 1); g.fillCircle(17, 0, 9);
    g.fillStyle(c, 1); g.fillCircle(17, 0, 7);
    g.fillStyle(0x8a5a1a, 1); g.fillCircle(15, -2, 1.2); g.fillCircle(19, -2, 1.2);
    g.fillStyle(0x8a5a1a, 1); g.fillEllipse(17, 2, 3, 2);
    const flow = (now / 900) % 1;
    g.fillStyle(0xffffff, 0.6); g.fillCircle(3 + flow * 24, 0, 1.6);
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillCircle(17, 0, 12);
  } },
  polySharkTooth: { c: 0xd8e0cc, a: 0xffe0b0, draw: (g, now, _c, a) => {
    // 鲨齿·拍：镶鲨齿的木棍拍框，齿尖寒光、拖浪沫
    handle(g, -14, -2, 7, 0x6a4a2a);
    pommel(g, -15, 2.6, 0x8a6a3a);
    g.fillStyle(0x8a5a2a, 1); g.fillRoundedRect(2, -2, 28, 5, 2);
    for (let k = 0; k < 7; k++) {
      for (const s of [-1, 1]) { g.fillStyle(k % 2 ? 0xd8e0cc : 0xe8eef8, 0.95); g.fillTriangle(6 + k * 3.4, s * 3, 8.4 + k * 3.4, s * 3, 7.2 + k * 3.4, s * 10); }
    }
    for (let k = 0; k < 3; k++) { const ph = ((now / 800 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(28, -6 + k * 7, 1.4); }
  } },
  polyHookRacket: { c: 0xd8c8a0, a: 0x5fe8d0, draw: (g, now, c, a) => {
    // 神钩·拍：拍框是弯钩，钩尖贝壳坠、钩脊透光
    handle(g, -14, -2, 7, 0x6a4a2a);
    pommel(g, -15, 2.6, 0x8a6a3a);
    g.lineStyle(7, 0x9a8a6a, 1); g.beginPath(); g.moveTo(4, 0); g.lineTo(20, 0); g.arc(20, 8, 8, -Math.PI / 2, Math.PI * 0.7); g.strokePath();
    g.lineStyle(3.4, c, 1); g.beginPath(); g.moveTo(4, 0); g.lineTo(20, 0); g.arc(20, 8, 8, -Math.PI / 2, Math.PI * 0.7); g.strokePath();
    g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 300)); g.fillCircle(26, 6, 2.4);
    g.fillStyle(0xffe0b0, 0.95); g.fillCircle(6, 8, 2.4); g.fillCircle(6, 14, 2);
  } },
  auzBoomerangRacket: { c: 0xc0703a, a: 0xfff0d0, draw: (g, now, c, a) => {
    // 回力镖·拍：回力镖形拍框，镖身点画纹、拖红土光尘
    handle(g, -14, -2, 6, 0x6a3418);
    pommel(g, -15, 2.4, 0x8a4a26);
    const rot = Math.sin(now / 500) * 0.2;
    g.save(); g.translateCanvas(16, 0); g.rotateCanvas(rot);
    const pts: Array<[number, number]> = [[-14, -14], [2, -6], [16, -14], [12, -6], [0, 1], [-12, -7]];
    g.fillStyle(0x8a4a26, 1); poly(g, pts, 0x8a4a26, 1);
    g.fillStyle(c, 1); poly(g, pts.map(([x, y]) => [x * 0.86, y * 0.86]) as Array<[number, number]>, c, 1);
    for (let k = 0; k < 4; k++) { g.fillStyle(a, 0.9); g.fillCircle(-10 + k * 7, -8 + (k % 2) * 3, 1.2); }
    g.restore();
    for (let k = 0; k < 3; k++) { const ph = ((now / 800 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(28 - k * 2, -4 + k * 6, 1.4); }
  } },
  auzSerpentStaff: { c: 0x8fd45a, a: 0xff8a5c, draw: (g, now, _c, a) => {
    // 虹蛇杖·拍：拍柄盘虹蛇，七彩鳞流动、蛇头吐信
    const cols = [0xff5a5a, 0xff9a3c, 0xffd45c, 0x8fd45a, 0x5fd0ff, 0x7a6aff];
    handle(g, -14, -2, 5, 0x5a3a1a);
    pommel(g, -15, 2.4, 0x8fd45a);
    g.lineStyle(5, 0x1e5a36, 1); g.beginPath(); g.moveTo(0, 6); g.lineTo(14, 4); g.lineTo(24, -4); g.strokePath();
    for (let k = 0; k < 7; k++) { const t = k / 6; g.fillStyle(cols[(k + Math.floor(now / 200)) % 6], 0.95); g.fillCircle(t * 24, 6 - t * 10, 2.2); }
    const hx = 25, hy = -5;
    g.fillStyle(cols[Math.floor(now / 200) % 6], 1); g.fillCircle(hx, hy, 4);
    g.fillStyle(0xfff0a0, 0.95); g.fillCircle(hx + 1, hy - 1, 1.2);
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 280)); g.fillCircle(hx, hy, 8);
    for (let k = 0; k < 3; k++) { const ph = ((now / 700 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(14, 12 - ph * 10, 1.4); }
  } },
};
