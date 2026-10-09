import { TAU, apoly, aline, type AuraArt } from './shared';

/** 批十三光环（尼斯湖水怪 / 熊出没 / 雪山谜踪）——成景构图，画在角色身后 */

export const AURAS_18: Record<string, AuraArt> = {
  // ── 尼斯湖水怪 ──
  lochAuraA: { c: 0x8fe8c8, a: 0x35d8a8, draw: (g, now, c, _a) => {
    // 湖面涟漪：身后一片湖水，同心涟漪一圈圈外扩，飘着薄雾与水草
    g.fillStyle(0x0e3a3a, 0.4); // 湖水底
    g.fillEllipse(0, 30, 180, 34);
    g.fillStyle(0x1c5a4e, 0.35);
    g.fillEllipse(0, 26, 150, 24);
    // 外扩涟漪
    for (let k = 0; k < 4; k++) {
      const ph = ((now / 1400 + k / 4) % 1);
      const rw = 20 + ph * 80;
      g.lineStyle(1.6, c, 0.5 * (1 - ph));
      g.save(); g.translateCanvas(0, 26); g.scaleCanvas(1, 0.24);
      g.beginPath(); g.arc(0, 0, rw, 0, TAU); g.strokePath(); g.restore();
    }
    // 薄雾
    for (let k = 0; k < 5; k++) {
      const ph = ((now / 2600 + k / 5) % 1);
      g.fillStyle(0xdff6ee, 0.14 * (1 - ph));
      g.fillEllipse(-70 + k * 34 + Math.sin(now / 900 + k) * 6, -30 + ph * 90, 40 + k * 3, 14);
    }
    // 水草
    for (let k = 0; k < 4; k++) {
      const wx = -54 + k * 36;
      aline(g, [[wx, 34], [wx + Math.sin(now / 600 + k) * 5, 8], [wx + Math.sin(now / 500 + k) * 7, -12]], 3, 0x2f7a4a, 0.4);
    }
  } },
  lochAuraB: { c: 0x1c5a4e, a: 0x35d8a8, draw: (g, now, _c, a) => {
    // 深湖漩涡：身后一个旋转的深水漩涡，几束幽光从水面斜射下来，气泡上升
    // 漩涡
    g.save(); g.translateCanvas(0, -6); g.scaleCanvas(1, 0.8);
    for (let k = 0; k < 4; k++) {
      const r = 30 + k * 20;
      const rot = now / (900 + k * 300);
      g.lineStyle(2.2 - k * 0.4, k % 2 ? a : 0x2f8a7a, 0.4 - k * 0.06);
      g.beginPath(); g.arc(0, 0, r, rot, rot + Math.PI * 1.5); g.strokePath();
    }
    g.restore();
    // 幽光斜射
    for (let k = 0; k < 4; k++) {
      const lx = -60 + k * 40;
      g.fillStyle(0x8fe8c8, 0.08 + 0.04 * Math.sin(now / 800 + k));
      apoly(g, [[lx - 6, -120], [lx + 6, -120], [lx + 20, 40], [lx + 6, 40]], a, 0.1);
    }
    // 上升气泡
    for (let k = 0; k < 8; k++) {
      const ph = ((now / 1600 + k / 8) % 1);
      const bx = Math.sin(k * 2.3) * 60;
      g.fillStyle(0xdff6ee, 0.5 * (1 - ph));
      g.fillCircle(bx, 40 - ph * 140, 1.6 * (1 - ph) + 0.6);
    }
    // 漩涡中心
    g.fillStyle(0x06201e, 0.6);
    g.fillEllipse(0, -6, 34, 26);
  } },
  // ── 熊出没 ──
  boonAuraA: { c: 0x3f6136, a: 0x8fe06a, draw: (g, now, _c, _a) => {
    // 森林落叶：身后几棵松树剪影，阳光洒落，落叶纷纷
    // 松树剪影
    for (const [tx, sc] of [[-58, 1], [50, 1.2], [-14, 0.8]] as Array<[number, number]>) {
      g.fillStyle(0x1e3a1a, 0.55);
      for (let k = 0; k < 3; k++) {
        const y0 = -40 + k * 34 * sc;
        apoly(g, [[tx - (30 - k * 8) * sc, y0 + 30 * sc], [tx, y0 - 10 * sc], [tx + (30 - k * 8) * sc, y0 + 30 * sc]], 0x1e3a1a, 0.55);
      }
      g.fillStyle(0x3a2a18, 0.6);
      g.fillRect(tx - 4 * sc, 50 * sc, 8 * sc, 24);
    }
    // 阳光斑
    for (let k = 0; k < 4; k++) {
      g.fillStyle(0xffe89a, 0.08);
      apoly(g, [[-40 + k * 30, -120], [-24 + k * 30, -120], [0 + k * 30, 60], [-16 + k * 30, 60]], 0xffe89a, 0.08);
    }
    // 落叶
    for (let k = 0; k < 9; k++) {
      const ph = ((now / 2400 + k / 9) % 1);
      const lx = -80 + k * 18 + Math.sin(now / 700 + k) * 10;
      const ly = -120 + ph * 190;
      g.fillStyle(k % 3 === 0 ? 0xd4622a : k % 3 === 1 ? 0xffd45c : 0x8fe06a, 0.75);
      g.save(); g.translateCanvas(lx, ly); g.rotateCanvas(now / 500 + k);
      g.fillPoints([{ x: -4, y: 0 }, { x: 0, y: -3 }, { x: 4, y: 0 }, { x: 0, y: 3 }] as never, true);
      g.restore();
    }
  } },
  boonAuraB: { c: 0xffcf5c, a: 0xffb03a, draw: (g, now, c, a) => {
    // 蜂蜜光晕：身后暖金光晕 + 悬浮的六边蜜巢格，几只蜜蜂绕飞、蜜丝垂挂
    // 暖金光晕
    for (let k = 4; k >= 0; k--) {
      g.fillStyle(c, 0.06 * (1 - k * 0.15));
      g.fillCircle(0, -20, 40 + k * 22);
    }
    // 蜜巢格
    for (let r = 0; r < 3; r++) {
      for (let cix = -1; cix <= 1; cix++) {
        const hx = cix * 30 + (r % 2 ? 15 : 0);
        const hy = -70 + r * 44;
        const puls = 0.5 + 0.5 * Math.sin(now / 900 + r + cix);
        g.lineStyle(2, a, 0.4 + puls * 0.35);
        g.beginPath();
        for (let k2 = 0; k2 <= 6; k2++) {
          const ang = (k2 / 6) * TAU - Math.PI / 6;
          const px = hx + Math.cos(ang) * 15, py = hy + Math.sin(ang) * 15;
          if (k2 === 0) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.closePath(); g.strokePath();
      }
    }
    // 蜜蜂绕飞
    for (let k = 0; k < 3; k++) {
      const ang = now / 700 + k * 2.1;
      const bx = Math.cos(ang) * 60, by = -20 + Math.sin(ang * 1.6) * 30;
      g.fillStyle(0xffd45c, 0.95);
      g.fillEllipse(bx, by, 7, 5);
      g.fillStyle(0x2a2418, 0.9);
      g.fillRect(bx - 1, by - 2.6, 2, 5.2);
      g.fillStyle(0xffffff, 0.5);
      g.fillEllipse(bx - 3, by - 3, 5, 3);
    }
    // 垂挂蜜丝
    for (let k = 0; k < 3; k++) {
      const ph = ((now / 1300 + k / 3) % 1);
      aline(g, [[-40 + k * 40, -90], [-40 + k * 40, -50 + ph * 20]], 2, a, 0.5 * (1 - ph));
    }
  } },
  // ── 雪山谜踪 ──
  bigfAuraA: { c: 0xe0f2ff, a: 0x8fd8ff, draw: (g, now, _c, _a) => {
    // 风雪呼啸：身后雪山起伏，横向风纹掠过，雪花斜飘
    // 雪山
    g.fillStyle(0x7a90a8, 0.5);
    apoly(g, [[-110, 50], [-40, -40], [10, 40]], 0x7a90a8, 0.5);
    apoly(g, [[-20, 50], [40, -60], [110, 50]], 0x8aa0b8, 0.5);
    g.fillStyle(0xffffff, 0.7); // 雪顶
    apoly(g, [[-40, -40], [-24, -12], [-56, -12]], 0xffffff, 0.7);
    apoly(g, [[40, -60], [58, -28], [22, -28]], 0xffffff, 0.7);
    // 风纹
    for (let k = 0; k < 6; k++) {
      const ph = ((now / 1400 + k / 6) % 1);
      const y = -100 + ph * 150;
      const w = 40 + Math.sin(k * 2) * 20;
      aline(g, [[-90 + k * 12, y], [-90 + k * 12 + w, y - 6]], 1.6, 0xffffff, 0.28 * (1 - ph));
    }
    // 斜飘的雪
    for (let k = 0; k < 10; k++) {
      const ph = ((now / 1800 + k / 10) % 1);
      g.fillStyle(0xffffff, 0.7 * (1 - ph));
      g.fillCircle(-100 + k * 22 + Math.sin(now / 500 + k) * 4, -130 + ph * 200, 1.4 + (k % 3) * 0.5);
    }
  } },
  bigfAuraB: { c: 0x8fd8ff, a: 0x7dffc4, draw: (g, now, _c, a) => {
    // 极光雪幕：夜空群星 + 三层律动的极光帘幕 + 下方雪原
    g.fillStyle(0x0e1a2e, 0.5); // 夜空
    g.fillEllipse(0, -70, 260, 180);
    // 星星
    for (let k = 0; k < 12; k++) {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 600 + k * 1.7));
      g.fillStyle(0xffffff, tw * 0.8);
      g.fillCircle(-100 + k * 18 + Math.sin(k * 3) * 6, -120 + (k % 5) * 26, 1.1);
    }
    // 极光帘幕
    for (let layer = 0; layer < 3; layer++) {
      const col = layer === 0 ? a : layer === 1 ? 0x6ad0ff : 0xbfa0ff;
      g.fillStyle(col, 0.14 - layer * 0.02);
      g.beginPath();
      g.moveTo(-110, -60 + layer * 10);
      for (let k = 0; k <= 10; k++) {
        const x = -110 + (k / 10) * 220;
        const y = -110 + layer * 18 + Math.sin(now / 900 + k * 0.8 + layer) * 16;
        g.lineTo(x, y);
      }
      g.lineTo(110, -20 + layer * 10);
      g.closePath();
      g.fillPath();
    }
    // 雪原
    g.fillStyle(0xe0f2ff, 0.35);
    g.fillEllipse(0, 44, 240, 30);
    // 飘雪
    for (let k = 0; k < 8; k++) {
      const ph = ((now / 2000 + k / 8) % 1);
      g.fillStyle(0xffffff, 0.6 * (1 - ph));
      g.fillCircle(-90 + k * 24 + Math.sin(now / 600 + k) * 5, -120 + ph * 180, 1.4);
    }
  } },
};
