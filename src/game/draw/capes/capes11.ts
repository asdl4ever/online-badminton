import { cpoly, cline, type CapeArt } from './shared';

/**
 * 批十六背部装饰（天竺神话 / 高天原 / 凯尔特 / 美索不达米亚 / 克苏鲁）——自由槽混合：
 * 每主题 1 件披风（从 (0,0) 肩锚垂到 y≈80）+ 1 件背挂物件（`single: true`）。
 * 背挂物件挂垂坠高度锚点 topY+30、只画一次、不镜像。
 */

export const CAPES_11: Record<string, CapeArt> = {
  // ── 天竺神话 ──
  vdaShawl: { c: 0xe8902a, a: 0xffd45c, draw: (g, now, sway, c, a) => {
    // 苦行僧披巾：橙黄粗布披巾，纵向织纹、下摆流苏
    cpoly(g, [[-16, 0], [16, 0], [22 + sway, 54], [12 + sway * 1.2, 80], [-9 + sway, 76], [-20 + sway * 0.7, 48]], c, 0.95);
    g.lineStyle(1.4, 0xb86a1a, 0.6);
    for (let k = 0; k < 5; k++) cline(g, [[-13 + k * 6, 4], [-16 + k * 8 + sway, 74]], 1.4, 0xb86a1a, 0.5);
    for (let k = 0; k < 7; k++) { const bx = -16 + k * 5 + sway; g.fillStyle(k % 2 ? a : 0xffb04a, 0.95); g.fillRect(bx - 1, 76, 2, 8); }
    g.fillStyle(a, 0.9); g.fillCircle(0, 6, 2.4);
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle(0xfff0b0, 0.6 * (1 - ph)); g.fillCircle(-12 + k * 12 + sway * 0.6, 70 - ph * 30, 1.4); }
  } },
  vdaKumbha: { c: 0xffd45c, a: 0x7fd4ff, single: true, draw: (g, now, _sway, c, a) => {
    // 甘露宝瓶：背上一只盛甘露的水瓶，瓶口溢光、滴甘露
    g.fillStyle(0xb87a1a, 1); g.fillRoundedRect(-11, -6, 22, 24, 6);
    g.fillStyle(c, 1); g.fillRoundedRect(-10, -5, 20, 22, 5);
    g.fillStyle(0xb87a1a, 1); g.fillRoundedRect(-6, -14, 12, 8, 3);
    g.fillStyle(0xfff0b0, 1); g.fillEllipse(0, -15, 10, 4);
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(a, 0.4 * gl); g.fillEllipse(0, -16, 12, 6);
    for (let k = 0; k < 3; k++) { const ph = ((now / 700 + k / 3) % 1); g.fillStyle(0xffffff, (1 - ph) * 0.85); g.fillCircle(-5 + k * 5, -18 - ph * 12, 1.4 * (1 - ph) + 0.4); }
    g.fillStyle(a, 0.9); g.fillCircle(0, 2, 3);
    g.fillStyle(0xffffff, 0.6); g.fillCircle(-1, 1, 1.2);
    g.lineStyle(2, 0xb87a1a, 0.9); g.lineBetween(-8, -4, -14, 6); g.lineBetween(8, -4, 14, 6);
  } },
  // ── 高天原 ──
  takCloudCape: { c: 0xfff0d8, a: 0xc0392b, draw: (g, _now, sway, c, a) => {
    // 天照云肩：云纹白披肩，边缘红绳、下摆波浪
    cpoly(g, [[-16, 0], [16, 0], [22 + sway, 52], [12 + sway * 1.2, 78], [-9 + sway, 76], [-20 + sway * 0.7, 48]], c, 0.95);
    for (let k = 0; k < 4; k++) { g.fillStyle(0xe8dcc0, 0.7); g.fillEllipse(-10 + k * 8 + sway * 0.5, 26 + k * 14, 14, 8); }
    g.lineStyle(1.6, a, 0.7); cline(g, [[-20 + sway * 0.7, 48], [-9 + sway, 76]], 1.6, a, 0.7); cline(g, [[22 + sway, 52], [12 + sway * 1.2, 78]], 1.6, a, 0.7);
    g.fillStyle(a, 0.9); g.fillRect(-16, 2, 32, 3);
    g.fillStyle(0xffd45c, 0.9); g.fillCircle(0, 10, 3);
  } },
  takKusanagi: { c: 0xd8e8f0, a: 0xffd45c, single: true, draw: (g, now, _sway, c, a) => {
    // 草薙神剑：背上斜挂一柄神剑，剑气微光、随呼吸泛光
    const glow = 0.4 + 0.4 * Math.sin(now / 320);
    g.fillStyle(0x8a1a1a, 1); g.fillRoundedRect(-3, 12, 6, 14, 2); // 柄
    g.fillStyle(a, 1); g.fillRect(-8, 8, 16, 4); // 护手
    g.fillStyle(c, 1); g.fillPoints([{ x: -4, y: 8 }, { x: 4, y: 8 }, { x: 4, y: -30 }, { x: 0, y: -40 }, { x: -4, y: -30 }] as never, true);
    g.fillStyle(0xffffff, 0.5); g.fillRect(-1.4, -30, 2.8, 36);
    g.lineStyle(1.6, a, glow); g.beginPath(); g.moveTo(-3, 6); g.lineTo(-3, -30); g.strokePath(); g.beginPath(); g.moveTo(3, 6); g.lineTo(3, -30); g.strokePath();
    for (let k = 0; k < 3; k++) { const ph = ((now / 600 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.85); g.fillCircle(-6 + k * 6, 10 - ph * 30, 1.4); }
  } },
  // ── 凯尔特 ──
  celtMossCape: { c: 0x2f7a4a, a: 0x8fd45a, draw: (g, now, sway, c, a) => {
    // 苔纹披风：长满苔藓的绿披风，下摆飘落孢子
    cpoly(g, [[-17, 0], [17, 0], [23 + sway, 56], [14 + sway * 1.2, 82], [-10 + sway, 80], [-21 + sway * 0.7, 48]], 0x1e5a36, 0.95);
    cpoly(g, [[-15, 2], [15, 2], [21 + sway, 54], [12 + sway * 1.2, 78], [-9 + sway, 76], [-19 + sway * 0.7, 46]], c, 0.95);
    for (let k = 0; k < 9; k++) { g.fillStyle(k % 2 ? a : 0x4a9a5a, 0.8); g.fillCircle(-15 + (k * 7 % 30), 8 + Math.floor(k / 4) * 20 + Math.sin(now / 700 + k) * 2, 3); }
    for (let k = 0; k < 4; k++) { const ph = ((now / 1000 + k / 4) % 1); g.fillStyle(a, 0.7 * (1 - ph)); g.fillCircle(-12 + k * 8 + sway * 0.6, 76 + ph * 8, 1.4); }
    g.fillStyle(0x6a4a2a, 1); g.fillRoundedRect(-9, -1, 18, 5, 2.5);
  } },
  celtOgham: { c: 0x9a9a8a, a: 0x8fd45a, single: true, draw: (g, now, _sway, c, a) => {
    // 欧甘立石：背上一块刻符文石碑，符文依次亮起
    g.fillStyle(0x6a6a5a, 1); g.fillRoundedRect(-11, -26, 22, 52, 5);
    g.fillStyle(c, 1); g.fillRoundedRect(-9, -24, 18, 48, 4);
    g.fillStyle(0x4a4a3a, 0.6);
    for (let k = 0; k < 5; k++) g.fillRect(-9, -20 + k * 9, 18, 2);
    for (let k = 0; k < 5; k++) {
      const lit = 0.3 + 0.7 * Math.max(0, Math.sin(now / 400 - k * 0.7));
      g.lineStyle(2, a, lit);
      g.lineBetween(-6, -18 + k * 9, 6, -18 + k * 9);
      g.lineBetween(-2, -21 + k * 9, -2, -15 + k * 9);
    }
    const gl = 0.5 + 0.5 * Math.sin(now / 260);
    g.fillStyle(a, gl * 0.5); g.fillEllipse(0, 26, 16, 5);
  } },
  // ── 美索不达米亚 ──
  mesoTabletCape: { c: 0x3a5a9a, a: 0xd8b45a, draw: (g, _now, sway, c, a) => {
    // 楔文披风：青金石蓝披风，镶金字泥板纹
    cpoly(g, [[-16, 0], [16, 0], [22 + sway, 54], [13 + sway * 1.2, 80], [-10 + sway, 78], [-20 + sway * 0.7, 48]], c, 0.95);
    g.fillStyle(0x24407a, 0.7); cpoly(g, [[-11, 4], [11, 4], [14 + sway, 52], [5 + sway, 74], [-11 + sway * 0.8, 50]], 0x24407a, 0.7);
    g.fillStyle(a, 0.95);
    for (let r = 0; r < 3; r++) for (let col = 0; col < 3; col++) {
      const cx = -8 + col * 8, cy = 22 + r * 16;
      g.fillTriangle(cx - 2, cy + 1, cx + 2, cy + 1, cx, cy - 3);
      g.fillRect(cx - 0.6, cy - 2, 1.2, 5);
    }
    g.fillStyle(a, 0.9); g.fillRect(-16, 2, 32, 3);
    g.fillStyle(0xffd45c, 0.9); g.fillCircle(0, 8, 2.4);
  } },
  mesoTiamatHead: { c: 0x3a8a6a, a: 0xffd45c, single: true, draw: (g, now, _sway, c, a) => {
    // 提亚马特龙首：背上探出一只原初龙首，口吐洪水
    const sway2 = Math.sin(now / 600) * 3;
    g.fillStyle(0x1e5a44, 1); g.fillRoundedRect(-5, 4, 10, 20, 3);
    g.fillStyle(c, 1); g.fillEllipse(sway2, -4, 30, 18);
    g.fillStyle(0x1e5a44, 1);
    g.fillTriangle(sway2 - 8, -10, sway2 - 2, -10, sway2 - 6, -22);
    g.fillTriangle(sway2 + 2, -10, sway2 + 8, -10, sway2 + 6, -22);
    g.fillStyle(a, 0.95); g.fillCircle(sway2 + 6, -5, 2.4);
    g.fillStyle(0x1a1a1e, 1); g.fillCircle(sway2 + 6.4, -5, 1);
    g.fillStyle(0x1e5a44, 1); g.fillRoundedRect(sway2 + 8, 2, 14, 7, 2); // 吻
    for (let k = 0; k < 5; k++) { g.fillStyle(0xf0f4f8, 0.95); g.fillTriangle(sway2 + 9 + k * 3, 4, sway2 + 11 + k * 3, 4, sway2 + 10 + k * 3, 9); }
    for (let k = 0; k < 3; k++) { const ph = ((now / 700 + k / 3) % 1); g.fillStyle(0x8fd4ff, 0.7 * (1 - ph)); g.fillCircle(sway2 + 20 + k * 3, 8 + ph * 18, 2 * (1 - ph) + 0.5); }
  } },
  // ── 克苏鲁 ──
  cthTentacleCape: { c: 0x123a30, a: 0x5fe8c8, draw: (g, now, sway, c, a) => {
    // 深渊触须披风：由垂下的多根触须组成，须尖各自蠕动
    cpoly(g, [[-16, 0], [16, 0], [20 + sway, 40], [10 + sway, 64], [-10 + sway, 64], [-20 + sway * 0.7, 40]], c, 0.95);
    for (let k = 0; k < 7; k++) {
      const bx = -15 + k * 5;
      const sw = Math.sin(now / 400 + k) * 4;
      g.lineStyle(3.4 - (k % 2), 0x0e2a24, 0.95);
      g.beginPath(); g.moveTo(bx, 4); g.lineTo(bx + sw * 0.5, 34); g.lineTo(bx + sw, 62 + (k % 3) * 4); g.strokePath();
      g.fillStyle(a, 0.85); g.fillCircle(bx + sw, 62 + (k % 3) * 4, 1.6);
    }
    for (let k = 0; k < 4; k++) { g.fillStyle(a, 0.5 * (0.5 + 0.5 * Math.sin(now / 300 + k))); g.fillCircle(-11 + k * 7 + sway * 0.5, 30, 1.6); }
    g.fillStyle(0xe8f6ff, 0.9); g.fillCircle(0, 6, 2.6);
  } },
  cthElderSign: { c: 0x2a5a44, a: 0x5fe8c8, single: true, draw: (g, now, _sway, c, a) => {
    // 黄印：背上一枚发光的黄印符（五芒星 + 一只眼）
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(0x0e2a1e, 1); g.fillCircle(0, 0, 20);
    g.fillStyle(c, 1); g.fillCircle(0, 0, 17);
    g.fillStyle(a, 0.25 * gl); g.fillCircle(0, 0, 17);
    g.lineStyle(2.4, a, 0.95);
    g.beginPath();
    for (let k = 0; k <= 5; k++) {
      const ang = -Math.PI / 2 + (k * 2 * Math.PI * 2) / 5;
      const px = Math.cos(ang) * 13, py = Math.sin(ang) * 13;
      if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath(); g.strokePath();
    const open = 0.5 + 0.5 * Math.sin(now / 500);
    g.fillStyle(0xfff0a0, 0.9); g.fillEllipse(0, 0, 12, 6 * open + 1);
    g.fillStyle(0x1a0e2e, 1); g.fillCircle(0, 0, 2.6);
    g.fillStyle(a, gl); g.fillCircle(0, 0, 1.2);
  } },
};
