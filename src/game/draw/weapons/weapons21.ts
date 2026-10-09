import { handle, pommel, poly, TAU, type WeaponArt } from './shared';

/** 第七批球拍皮肤（纳米矩阵 / 数据洪流 / 曲速跃迁 / 火星殖民 / 先行者遗迹） */

export const WEAPONS_21: Record<string, WeaponArt> = {
  nanoRacket: { c: 0x7fe8ff, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 纳米拍：拍框由纳米格拼成，格子沿框流动
    handle(g, -14, -2, 6, 0x2a3a4a);
    pommel(g, -15, 2.6, a);
    const R = 15, seg = 12;
    for (let k = 0; k < seg; k++) { const ang = (k / seg) * TAU + now / 2500; const px = 16 + Math.cos(ang) * R, py = Math.sin(ang) * R; const on = 0.4 + 0.6 * Math.max(0, Math.sin(now / 300 - k)); g.fillStyle(k % 2 ? c : a, 0.6 + 0.4 * on); g.fillRect(px - 2.6, py - 2.6, 5.2, 5.2); }
    g.fillStyle(a, 0.3); g.fillCircle(16, 0, 6);
    g.fillStyle(0xffffff, 0.7); g.fillCircle(16, 0, 2.4);
  } },
  nanoCoreRacket: { c: 0x39ffd0, a: 0x7fe8ff, draw: (g, now, c, a) => {
    // 纳米核·拍：拍心一颗纳米核，粒子沿拍框循环
    handle(g, -14, -2, 6, 0x2a3a4a);
    pommel(g, -15, 2.6, c);
    g.fillStyle(0x0e2a30, 1); g.fillCircle(16, 0, 16);
    g.fillStyle(c, 0.5); g.fillCircle(16, 0, 14);
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU + now / 1200; g.fillStyle(k % 2 ? c : a, 0.95); g.fillCircle(16 + Math.cos(ang) * 14, Math.sin(ang) * 14, 1.8); }
    const pulse = 0.5 + 0.5 * Math.sin(now / 280);
    g.fillStyle(a, 0.4 * pulse); g.fillCircle(16, 0, 11);
    g.fillStyle(c, 1); g.fillCircle(16, 0, 8);
    g.fillStyle(0xffffff, 0.7 + 0.3 * pulse); g.fillCircle(16, 0, 3.4);
  } },
  dataRacket: { c: 0x4affc4, a: 0x7fb8ff, draw: (g, now, c, a) => {
    // 数据拍：拍框由数据块拼成，块循环亮
    handle(g, -14, -2, 6, 0x1a2a2e);
    pommel(g, -15, 2.6, a);
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU; const px = 16 + Math.cos(ang) * 15, py = Math.sin(ang) * 15; const lit = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k)); g.fillStyle(c, 0.5); g.fillRect(px - 3, py - 3, 6, 6); g.fillStyle(a, lit); g.fillRect(px - 2, py - 2, 4, 4); }
    g.fillStyle(0x0a1a1e, 0.92); g.fillCircle(16, 0, 13);
    const scroll = (now / 400) % 1;
    for (let k = 0; k < 4; k++) { g.fillStyle(a, 0.6); g.fillRect(11, -10 + ((k * 6 + scroll * 24) % 22), 10, 1.6); }
    g.fillStyle(c, 0.9); g.fillCircle(16, 0, 3);
  } },
  dataPrismRacket: { c: 0x7fb8ff, a: 0x4affc4, draw: (g, now, c, a) => {
    // 棱镜·拍：拍心一块棱镜，折射数据光
    handle(g, -14, -2, 6, 0x1a2a2e);
    pommel(g, -15, 2.6, a);
    g.fillStyle(0x10202a, 1); g.fillCircle(16, 0, 16);
    g.fillStyle(c, 0.85); poly(g, [[16, -14], [27, 0], [16, 14], [5, 0]], c, 0.85);
    g.fillStyle(0xdff0ff, 0.6); poly(g, [[16, -14], [16, 14], [5, 0]], 0xdff0ff, 0.6);
    g.lineStyle(1.6, a, 0.5 + 0.3 * Math.sin(now / 300)); g.lineBetween(16, -14, 27, 0); g.lineBetween(16, -14, 5, 0);
    const gl = 0.5 + 0.5 * Math.sin(now / 260); g.fillStyle(0xffffff, gl); g.fillCircle(16, 0, 3);
  } },
  warpRacket: { c: 0x9fd8ff, a: 0xa98cff, draw: (g, now, c, a) => {
    // 星轨拍：拍框是一道星轨环，星光沿框流动
    handle(g, -14, -2, 6, 0x1a2450);
    pommel(g, -15, 2.6, a);
    g.lineStyle(5, c, 0.9); g.strokeCircle(16, 0, 15);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU + now / 1400; g.fillStyle(k % 2 ? a : 0xffffff, 0.85); g.fillCircle(16 + Math.cos(ang) * 15, Math.sin(ang) * 15, 1.6); }
    g.fillStyle(0x0a1024, 0.85); g.fillCircle(16, 0, 12);
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 260)); g.fillCircle(16, 0, 6);
    g.fillStyle(0xffffff, 0.8); g.fillCircle(16, 0, 2.4);
  } },
  warpGateRacket: { c: 0xa98cff, a: 0x9fd8ff, draw: (g, now, c, a) => {
    // 星门·拍：拍心一扇小星门，内部漩涡旋转
    handle(g, -14, -2, 6, 0x1a2450);
    pommel(g, -15, 2.6, c);
    g.lineStyle(4, c, 0.9); g.strokeCircle(16, 0, 15);
    g.fillStyle(0x05060f, 0.95); g.fillCircle(16, 0, 13);
    for (let arm = 0; arm < 3; arm++) { const off = now / 300 + arm * 2.1; g.lineStyle(2, a, 0.6); g.beginPath(); for (let s = 0; s <= 8; s++) { const u = s / 8; const ang = off + u * 3; const rr = u * 12; const px = 16 + Math.cos(ang) * rr, py = Math.sin(ang) * rr; if (s === 0) g.moveTo(px, py); else g.lineTo(px, py); } g.strokePath(); }
    g.fillStyle(0xffffff, 0.8); g.fillCircle(16, 0, 2);
  } },
  marsRacket: { c: 0xff7a4a, a: 0xffb08a, draw: (g, now, c, a) => {
    // 探测杖·拍：拍柄是探测杖，杖头灯闪、读数滚
    handle(g, -14, -2, 7, 0x6a3a1a);
    pommel(g, -15, 2.8, 0x8a9298);
    g.fillStyle(0x8a9298, 1); g.fillRoundedRect(2, -4, 16, 8, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(4, -3, 12, 6, 2.5);
    const blink = Math.sin(now / 160) > 0 ? 1 : 0.3;
    g.fillStyle(0xffe0b0, blink); g.fillCircle(10, 0, 4);
    g.fillStyle(c, 0.5 + 0.3 * Math.sin(now / 300)); g.fillCircle(10, 0, 8);
    for (let k = 0; k < 4; k++) { g.fillStyle(a, 0.8); g.fillRect(24, -6 + k * 4, 6, 2); }
    g.fillStyle(0x3a2410, 1); g.fillRect(22, -8, 3, 16);
  } },
  marsDrillRacket: { c: 0xb0562a, a: 0xff7a4a, draw: (g, now, c, a) => {
    // 钻探·拍：拍框是旋转钻头环
    handle(g, -14, -2, 7, 0x6a3a1a);
    pommel(g, -15, 2.6, 0xd8d0c0);
    g.fillStyle(0x6a7278, 1); g.fillCircle(16, 0, 16);
    const spin = now / 60;
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU + spin; g.fillStyle(k % 2 ? 0xd8d0c0 : c, 0.95); g.fillTriangle(16 + Math.cos(ang) * 15, Math.sin(ang) * 15, 16 + Math.cos(ang + 0.2) * 8, Math.sin(ang + 0.2) * 8, 16 + Math.cos(ang - 0.2) * 8, Math.sin(ang - 0.2) * 8); }
    g.fillStyle(0x3a2410, 1); g.fillCircle(16, 0, 5);
    for (let k = 0; k < 4; k++) { const ph = ((now / 500 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(16 + Math.cos(k * 1.6) * 20, Math.sin(k * 1.6) * 20, 1.6); }
  } },
  forerRacket: { c: 0xa8e0ff, a: 0x5ad8ff, draw: (g, now, c, a) => {
    // 遗迹·拍：合金环 + 符文循环亮
    handle(g, -14, -2, 6, 0x2c3a4a);
    pommel(g, -15, 2.6, a);
    g.lineStyle(5, c, 0.95); g.strokeCircle(16, 0, 15);
    const flow = (now / 1000) % 1;
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU; const lit = Math.max(0, 1 - Math.abs((((k / 8) - flow + 1) % 1) - 0.5) * 2); g.fillStyle(a, 0.4 + 0.6 * lit); g.fillRect(16 + Math.cos(ang) * 15 - 2, Math.sin(ang) * 15 - 2, 4, 4); }
    g.fillStyle(0x0e1620, 0.85); g.fillCircle(16, 0, 12);
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillCircle(16, 0, 5);
    g.fillStyle(0xffffff, 0.7); g.fillCircle(16, 0, 2);
  } },
  forerStaff: { c: 0x5ad8ff, a: 0xa8e0ff, draw: (g, now, c, a) => {
    // 遗迹杖·拍：拍心一颗悬浮能量核，光条连向拍框
    handle(g, -14, -2, 7, 0x2c3a4a);
    pommel(g, -15, 2.8, c);
    g.lineStyle(4, c, 0.9); g.strokeCircle(16, 0, 15);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU + now / 2200; g.lineStyle(1.6, a, 0.6); g.lineBetween(16, 0, 16 + Math.cos(ang) * 15, Math.sin(ang) * 15); }
    const pulse = 0.5 + 0.5 * Math.sin(now / 260);
    g.fillStyle(a, 0.4 * pulse); g.fillCircle(16, 0, 9);
    g.fillStyle(c, 1); g.fillCircle(16, 0, 6);
    g.fillStyle(0xffffff, 0.7 + 0.3 * pulse); g.fillCircle(16, 0, 2.6);
  } },
};
