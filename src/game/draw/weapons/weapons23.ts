import { handle, pommel, TAU, type WeaponArt } from './shared';

/** 第九批球拍皮肤（恐龙 / 史前 / 神话 / 恶搞 10 主题）——柄在 x∈[-13,-2]，拍框中心 ≈(9,0) */

export const WEAPONS_23: Record<string, WeaponArt> = {
  // ── 白垩纪猎场 ──
  cretBone: { c: 0xd8d0c0, a: 0xe8d07a, draw: (g, now, c, a) => {
    // 骨刺·拍：拍框嵌骨刺
    handle(g, -14, -2, 6, 0x8a6a3a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.strokeCircle(9, 0, 13);
    g.lineStyle(2.4, c, 1); g.strokeEllipse(9, 0, 26, 26);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; g.fillStyle(k % 2 ? c : 0xf0e8d0, 1); g.fillPoints([{ x: 9 + Math.cos(ang) * 13, y: Math.sin(ang) * 13 }, { x: 9 + Math.cos(ang) * 24, y: Math.sin(ang) * 24 }, { x: 9 + Math.cos(ang + 0.35) * 13, y: Math.sin(ang + 0.35) * 13 }] as never, true); }
    g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 300)); g.fillCircle(9 - 6, -6, 1.4);
  } },
  cretJaw: { c: 0x6a8a3a, a: 0xff5a3a, draw: (g, now, c, a) => {
    // 巨颚·拍：一张会开合的巨颚
    handle(g, -14, -2, 6, 0x4a3a22); pommel(g, -15, 2.6, 0xa03a2a);
    const open = 0.12 * Math.sin(now / 400);
    g.save(); g.translateCanvas(9, 0); g.rotateCanvas(-open);
    g.fillStyle(c, 1); g.fillPoints([{ x: -12, y: 0 }, { x: 14, y: -2 }, { x: 16, y: -14 }, { x: -10, y: -10 }] as never, true);
    g.fillStyle(0xf0e8d0, 1); for (let k = 0; k < 4; k++) { g.fillTriangle(-8 + k * 7, -2, -5 + k * 7, -2, -6 + k * 7, 4); }
    g.restore();
    g.save(); g.translateCanvas(9, 0); g.rotateCanvas(open);
    g.fillStyle(c, 1); g.fillPoints([{ x: -12, y: 0 }, { x: 14, y: -2 }, { x: 16, y: 14 }, { x: -10, y: 10 }] as never, true);
    g.fillStyle(0xf0e8d0, 1); for (let k = 0; k < 4; k++) { g.fillTriangle(-8 + k * 7, 2, -5 + k * 7, 2, -6 + k * 7, -4); }
    g.restore();
    g.fillStyle(a, 0.4 + 0.4 * Math.sin(now / 200)); g.fillCircle(9, 0, 4);
  } },
  // ── 史前沼泽 ──
  swampSpear: { c: 0x6a8a4a, a: 0xd8d0c0, draw: (g, _now, c, a) => {
    // 骨矛·拍
    handle(g, -14, -2, 6, 0x4a3a22); pommel(g, -15, 2.6, a);
    g.fillStyle(a, 1); g.fillPoints([{ x: 0, y: -8 }, { x: 22, y: -4 }, { x: 30, y: 0 }, { x: 22, y: 4 }, { x: 0, y: 8 }] as never, true);
    g.fillStyle(c, 1); g.fillPoints([{ x: 4, y: -5 }, { x: 20, y: -2 }, { x: 26, y: 0 }, { x: 20, y: 2 }, { x: 4, y: 5 }] as never, true);
  } },
  swampLily: { c: 0x2f7a4a, a: 0xffd0e2, draw: (g, now, c, a) => {
    // 睡莲·拍：睡莲花心微光
    handle(g, -14, -2, 6, 0x3a4a2a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillEllipse(9, 0, 30, 26);
    g.fillStyle(0x1f5a34, 1); g.fillEllipse(9, 0, 24, 20);
    g.fillStyle(0x8fd45a, 0.8); for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; g.fillPoints([{ x: 9, y: 0 }, { x: 9 + Math.cos(ang) * 13, y: Math.sin(ang) * 13 }, { x: 9 + Math.cos(ang + 0.4) * 13, y: Math.sin(ang + 0.4) * 13 }] as never, true); }
    g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 300)); g.fillCircle(9, 0, 4);
  } },
  swampFang: { c: 0xd8d0c0, a: 0xff5a4a, draw: (g, now, c, a) => {
    // 獠牙·拍
    handle(g, -14, -2, 6, 0x3a4a2a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillPoints([{ x: 0, y: -14 }, { x: 20, y: -6 }, { x: 26, y: 0 }, { x: 20, y: 6 }, { x: 0, y: 14 }] as never, true);
    g.fillStyle(0xf0f0e0, 1); g.fillPoints([{ x: 4, y: -9 }, { x: 20, y: -3 }, { x: 24, y: 0 }, { x: 20, y: 3 }, { x: 4, y: 9 }] as never, true);
    g.lineStyle(1.4, a, 0.5 + 0.4 * Math.sin(now / 250)); g.lineBetween(6, -6, 18, -2); g.lineBetween(6, 6, 18, 2);
  } },
  swampBamboo: { c: 0x8fae4a, a: 0x7dff9a, draw: (g, _now, c, a) => {
    // 芦竿·拍
    handle(g, -14, -2, 6, c); pommel(g, -15, 2.6, 0x6a8a3a);
    g.fillStyle(0x6a8a3a, 1); g.strokeCircle(9, 0, 13);
    for (let k = 0; k < 4; k++) { g.fillStyle(c, 1); g.fillRoundedRect(1, -14, 8, 7, 2); g.fillRoundedRect(1, 7, 8, 7, 2); }
    g.fillStyle(a, 0.6); g.fillCircle(9, 0, 3);
  } },
  // ── 冰河世纪 ──
  iceageTusk: { c: 0xf0e8d0, a: 0x8fd8ff, draw: (g, _now, c, a) => {
    // 象牙·拍
    handle(g, -14, -2, 6, 0x8a6a4a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillPoints([{ x: -2, y: -8 }, { x: 16, y: -4 }, { x: 28, y: 0 }, { x: 16, y: 4 }, { x: -2, y: 8 }] as never, true);
    g.fillStyle(0xd8c8a0, 1); g.fillPoints([{ x: 2, y: -5 }, { x: 16, y: -2 }, { x: 24, y: 0 }, { x: 16, y: 2 }, { x: 2, y: 5 }] as never, true);
    g.fillStyle(a, 0.5); g.fillCircle(6, 0, 3);
  } },
  iceageFrozenBone: { c: 0xd8e8f0, a: 0x8fd8ff, draw: (g, now, c, a) => {
    // 冻骨·拍：霜花生长
    handle(g, -14, -2, 6, 0x5a7a8a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.strokeCircle(9, 0, 13);
    g.fillStyle(0xd8d0c0, 1); g.fillRoundedRect(6, -14, 6, 28, 3); g.fillRoundedRect(6, -16, 6, 6, 3); g.fillRoundedRect(6, 10, 6, 6, 3);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 300 + k)); g.fillCircle(9 + Math.cos(ang) * 11, Math.sin(ang) * 11, 1.6); }
  } },
  // ── 非洲雷神 ──
  yorAxeRacket: { c: 0xd8c0a0, a: 0xffe08a, draw: (g, now, c, a) => {
    // 雷斧·拍：双刃斧拍框，缝里游电
    handle(g, -14, -2, 6, 0x6a4a2a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillPoints([{ x: 2, y: 0 }, { x: 12, y: -16 }, { x: 18, y: 0 }, { x: 12, y: 16 }] as never, true);
    g.fillStyle(0xb8a080, 1); g.fillPoints([{ x: 6, y: 0 }, { x: 13, y: -11 }, { x: 16, y: 0 }, { x: 13, y: 11 }] as never, true);
    g.lineStyle(1.6, a, 0.5 + 0.5 * Math.abs(Math.sin(now / 160))); g.lineBetween(8, -6, 14, 0); g.lineBetween(14, 0, 8, 6);
  } },
  yorDrumRacket: { c: 0x8a4a2a, a: 0xffe08a, draw: (g, now, c, a) => {
    // 鼓棒·拍：鼓面框
    handle(g, -14, -2, 6, 0x6a4a2a); pommel(g, -15, 2.6, a);
    g.fillStyle(c, 1); g.fillEllipse(9, 0, 28, 26);
    g.fillStyle(0xd8b088, 1); g.fillEllipse(9, 0, 22, 20);
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(9, 0, 16, 14);
    for (let k = 0; k < 4; k++) { g.fillStyle(0x5a3020, 1); g.fillCircle(9 + (k % 2 ? 8 : -8), k < 2 ? -8 : 8, 1.6); }
  } },
  // ── 芬兰史诗 ──
  kalHarp: { c: 0xa8763a, a: 0xd8e8f0, draw: (g, now, c, a) => {
    // 竖琴·拍：竖琴弦拍框
    handle(g, -14, -2, 6, 0x6a4a26); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.strokeCircle(9, 0, 13);
    for (let k = 0; k < 4; k++) { const vib = Math.sin(now / 200 + k) * 0.6; g.lineStyle(1, a, 0.85); g.lineBetween(3, -12 + k * 8, 15 + vib, -12 + k * 8); }
    g.fillStyle(a, 0.5); g.fillCircle(9, -13, 2);
  } },
  kalSampoRacket: { c: 0x9fe8d0, a: 0xd8e8f0, draw: (g, now, c, a) => {
    // 三宝磨·拍：三瓣转盘拍框，缓慢自转
    handle(g, -14, -2, 6, 0x3a5a5a); pommel(g, -15, 2.6, c);
    g.save(); g.translateCanvas(9, 0); g.rotateCanvas(now / 1400);
    g.fillStyle(c, 1); g.fillPoints([{ x: 0, y: -14 }, { x: 13, y: 9 }, { x: -13, y: 9 }] as never, true);
    g.fillStyle(0x3a5a5a, 1); g.fillPoints([{ x: 0, y: -9 }, { x: 9, y: 6 }, { x: -9, y: 6 }] as never, true);
    g.fillStyle(a, 0.8); g.fillCircle(0, -2, 3);
    g.restore();
  } },
  kalBirchRacket: { c: 0xe8e0d0, a: 0xd8e8f0, draw: (g, _now, c, a) => {
    // 桦木·拍
    handle(g, -14, -2, 6, 0x8a6a3a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.strokeCircle(9, 0, 13);
    g.fillStyle(0x3a3a3a, 0.3); g.fillRect(1, -12, 16, 2); g.fillRect(1, 2, 16, 2);
    g.fillStyle(a, 0.5); g.fillCircle(9, 0, 2);
  } },
  // ── 香蕉王国 ──
  banRacket: { c: 0xf0d020, a: 0x8a8a1a, draw: (g, _now, c, a) => {
    // 香蕉·拍
    handle(g, -14, -2, 6, 0xc0c020); pommel(g, -15, 2.6, a);
    g.save(); g.rotateCanvas(-0.3); g.fillStyle(a, 1); g.fillEllipse(10, 0, 30, 12); g.fillStyle(c, 1); g.fillEllipse(10, 0, 26, 9); g.fillStyle(0x8a8a1a, 0.8); g.fillCircle(-2, 0, 2); g.fillCircle(22, 0, 2); g.restore();
  } },
  banLeaf: { c: 0x2f9a4a, a: 0x8a8a1a, draw: (g, now, c, a) => {
    // 蕉叶·拍
    handle(g, -14, -2, 6, 0xf0d020); pommel(g, -15, 2.6, a);
    g.fillStyle(c, 1); g.fillEllipse(9, 0, 28, 26);
    g.fillStyle(0x1f7a34, 0.8); g.fillPoints([{ x: -3, y: 0 }, { x: 20, y: -12 }, { x: 20, y: 12 }] as never, true);
    g.lineStyle(1.4, a, 0.7); g.lineBetween(-3, 0, 20, 0); for (let k = 0; k < 4; k++) { g.lineBetween(-1 + k * 5, 0, 2 + k * 6, -9 + k * 2); g.lineBetween(-1 + k * 5, 0, 2 + k * 6, 9 - k * 2); }
    void now;
  } },
  banPeelRacket: { c: 0xf0d020, a: 0xfff080, draw: (g, now, c, a) => {
    // 蕉皮·拍
    handle(g, -14, -2, 6, 0xc0c020); pommel(g, -15, 2.6, a);
    g.fillStyle(c, 1); g.strokeCircle(9, 0, 13);
    for (let k = 0; k < 3; k++) { const ang = (k / 3) * TAU + now / 2000; g.fillStyle(c, 1); g.fillPoints([{ x: 9, y: 0 }, { x: 9 + Math.cos(ang) * 13, y: Math.sin(ang) * 13 }, { x: 9 + Math.cos(ang + 0.5) * 13, y: Math.sin(ang + 0.5) * 13 }] as never, true); }
    g.fillStyle(a, 0.8); g.fillCircle(9, 0, 3);
  } },
  banSpoon: { c: 0xc8ccd0, a: 0xf0d020, draw: (g, _now, c, a) => {
    // 叉勺·拍
    handle(g, -14, -2, 6, 0xc8ccd0); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillEllipse(9, 0, 22, 28);
    g.fillStyle(0xe8ecf0, 1); g.fillEllipse(9, 0, 16, 22);
    g.fillStyle(a, 0.7); g.fillCircle(9, 4, 4);
    for (let k = 0; k < 3; k++) { g.fillStyle(c, 1); g.fillRect(3 + k * 6, -14, 3, 8); }
  } },
  // ── 迷因宇宙 ──
  memePixelBlade: { c: 0x7dff9a, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 像素剑·拍
    handle(g, -14, -2, 6, 0x4a5a6a); pommel(g, -15, 2.6, c);
    const cells = [[0,-12],[4,-8],[8,-4],[12,0],[8,4],[4,8],[0,12]];
    for (let k = 0; k < cells.length; k++) { const on = Math.max(0, Math.sin(now / 200 + k)); g.fillStyle(on > 0.5 ? c : 0x2a4a3a, 1); g.fillRect(9 + cells[k][0] - 2, cells[k][1] - 2, 4, 4); }
    g.fillStyle(a, 0.6); g.fillCircle(9, 0, 2);
  } },
  memeEnter: { c: 0x3a3a44, a: 0x7dff9a, draw: (g, now, c, a) => {
    // 回车键·拍
    handle(g, -14, -2, 6, 0x2a2a34); pommel(g, -15, 2.6, a);
    g.fillStyle(c, 1); g.fillRoundedRect(-2, -13, 24, 26, 3);
    g.fillStyle(0x55556a, 1); g.fillRoundedRect(0, -11, 20, 22, 2);
    const press = 0.5 + 0.5 * Math.sin(now / 250); g.fillStyle(a, 0.5 + 0.4 * press); g.lineStyle(2, a, 0.8 * press); g.lineBetween(4, -4, 15, -4); g.lineBetween(15, -4, 11, 2); g.lineBetween(15, -4, 11, -9);
  } },
  memeCursor: { c: 0xd8d8e0, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 光标·拍
    handle(g, -14, -2, 6, 0x2a2a34); pommel(g, -15, 2.6, a);
    g.fillStyle(c, 1); g.fillPoints([{ x: 2, y: -4 }, { x: 2, y: 12 }, { x: 7, y: 7 }, { x: 12, y: 16 }, { x: 15, y: 13 }, { x: 10, y: 5 }, { x: 18, y: 2 }] as never, true);
    const flash = Math.max(0, Math.sin(now / 200)); g.fillStyle(a, 0.3 + 0.4 * flash); g.fillEllipse(2, -4, 16, 16);
  } },
  memeUsb: { c: 0x8a92a0, a: 0x39ffd0, draw: (g, now, c, a) => {
    // USB·拍
    handle(g, -14, -2, 6, 0x4a5260); pommel(g, -15, 2.6, a);
    g.fillStyle(c, 1); g.fillRoundedRect(-2, -12, 22, 24, 3);
    g.fillStyle(0xd8d8e0, 1); g.fillRoundedRect(1, -9, 16, 18, 2);
    const flow = 0.4 + 0.5 * Math.abs(Math.sin(now / 220)); for (let k = 0; k < 3; k++) { g.fillStyle(a, flow); g.fillRect(4, -6 + k * 6, 10, 2); }
    g.fillStyle(0x2a2a30, 1); g.fillRect(-3, -4, 4, 8);
  } },
  // ── 摸鱼办公室 ──
  officeKeyboardRacket: { c: 0x3a3a44, a: 0x9fd8ff, draw: (g, now, c, a) => {
    // 键盘·拍
    handle(g, -14, -2, 6, 0x2a2a34); pommel(g, -15, 2.6, a);
    g.fillStyle(c, 1); g.fillRoundedRect(-4, -14, 28, 28, 3);
    for (let r = 0; r < 3; r++) { for (let cc = 0; cc < 4; cc++) { const on = Math.max(0, Math.sin(now / 200 + r * 1.3 + cc * 0.9)); g.fillStyle(on > 0.6 ? a : 0x55556a, 0.95); g.fillRect(-2 + cc * 6, -11 + r * 8, 5, 6); } }
  } },
  officeMug: { c: 0xc8ccd0, a: 0x9fd8ff, draw: (g, now, c, a) => {
    // 马克杯·拍
    handle(g, -14, -2, 6, 0xc8ccd0); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillRoundedRect(-1, -14, 22, 28, 4);
    g.fillStyle(0xe8ecf0, 1); g.fillRoundedRect(1, -12, 18, 24, 3);
    g.fillStyle(0x8a5a2a, 1); g.fillEllipse(10, -10, 16, 5);
    g.lineStyle(3, c, 1); g.beginPath(); g.arc(21, 0, 7, -1.2, 1.2); g.strokePath();
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.6); g.fillCircle(8 + k * 3, -14 - ph * 12, 1.8); }
  } },
  // ── 花园地精 ──
  gnomeTrowelRacket: { c: 0xb8b8b8, a: 0x8a6a3a, draw: (g, _now, c, a) => {
    // 园艺铲·拍
    handle(g, -14, -2, 6, 0x8a6a3a); pommel(g, -15, 2.6, a);
    g.fillStyle(c, 1); g.fillPoints([{ x: 0, y: -12 }, { x: 20, y: -6 }, { x: 24, y: 0 }, { x: 20, y: 6 }, { x: 0, y: 12 }] as never, true);
    g.fillStyle(0xd8d8d8, 1); g.fillPoints([{ x: 4, y: -8 }, { x: 20, y: -3 }, { x: 22, y: 0 }, { x: 20, y: 3 }, { x: 4, y: 8 }] as never, true);
    g.fillStyle(a, 0.7); g.fillCircle(8, 4, 2.4);
  } },
  gnomeSunflower: { c: 0xffd020, a: 0x6a4a2a, draw: (g, now, c, a) => {
    // 向日葵·拍
    handle(g, -14, -2, 6, 0x3a6a2a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU + Math.sin(now / 700) * 0.05; g.fillPoints([{ x: 9 + Math.cos(ang) * 10, y: Math.sin(ang) * 10 }, { x: 9 + Math.cos(ang) * 20, y: Math.sin(ang) * 20 }, { x: 9 + Math.cos(ang + 0.32) * 10, y: Math.sin(ang + 0.32) * 10 }] as never, true); }
    g.fillStyle(a, 1); g.fillCircle(9, 0, 10); g.fillStyle(0x8a6a3a, 0.7); for (let k = 0; k < 5; k++) { g.fillCircle(9 + (k % 2 ? 3 : -3), -4 + k * 2, 1); }
  } },
  // ── 垃圾回收站 ──
  trashPlunger: { c: 0x8a4a2a, a: 0x8fd4a0, draw: (g, _now, c, a) => {
    // 马桶搋子·拍
    handle(g, -14, -2, 6, 0xa8763a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillEllipse(9, 0, 26, 24);
    g.fillStyle(0x6a3a20, 1); g.fillEllipse(9, 4, 22, 16);
    g.fillStyle(0x4a2a14, 1); g.fillEllipse(9, 8, 14, 6);
    g.fillStyle(a, 0.6); g.fillCircle(9, -4, 3);
  } },
  trashCan: { c: 0xb84a3a, a: 0x8fd4a0, draw: (g, now, c, a) => {
    // 易拉罐·拍：压扁易拉罐
    handle(g, -14, -2, 6, 0x8a8a92); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillEllipse(9, 0, 24, 28);
    g.fillStyle(0xd8d8d8, 1); g.fillEllipse(9, 0, 18, 22);
    g.fillStyle(0xd8d8d8, 1); g.fillEllipse(9, -14, 22, 8); g.fillEllipse(9, 14, 22, 8);
    g.fillStyle(0xc8a832, 1); g.fillRect(-3, -6, 24, 4);
    const shine = 0.4 + 0.5 * Math.abs(Math.sin(now / 400)); g.fillStyle(a, shine); g.fillRect(2, -8, 3, 16);
  } },
  trashBottle: { c: 0x8fd4a0, a: 0x7dff9a, draw: (g, now, c, _a) => {
    // 玻璃瓶·拍
    handle(g, -14, -2, 6, 0x3a6a4a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 0.8); g.fillEllipse(9, 0, 22, 28);
    g.fillStyle(0xd0ffe0, 0.5); g.fillEllipse(9, -4, 14, 18);
    g.fillStyle(0x2f8a4a, 1); g.fillRect(6, -20, 6, 10);
    g.fillStyle(0xc8a832, 1); g.fillRect(2, -4, 20, 5);
    const ref = 0.3 + 0.4 * Math.abs(Math.sin(now / 350)); g.fillStyle(0xffffff, ref); g.fillRect(4, -8, 2, 14);
  } },
  trashCrowbar: { c: 0xb84a2a, a: 0x8fd4a0, draw: (g, _now, c, a) => {
    // 撬棍·拍
    handle(g, -14, -2, 6, 0x8a5a2a); pommel(g, -15, 2.6, c);
    g.fillStyle(c, 1); g.fillRoundedRect(0, -5, 20, 10, 3);
    g.fillStyle(0xd8d8d8, 1); g.fillRoundedRect(2, -3, 16, 6, 2);
    g.fillStyle(c, 1); g.fillPoints([{ x: 18, y: -5 }, { x: 26, y: -12 }, { x: 24, y: -2 }, { x: 18, y: 0 }] as never, true); g.fillPoints([{ x: 18, y: 5 }, { x: 26, y: 12 }, { x: 24, y: 2 }, { x: 18, y: 0 }] as never, true);
    g.fillStyle(a, 0.6); g.fillCircle(4, 0, 2);
  } },
};
