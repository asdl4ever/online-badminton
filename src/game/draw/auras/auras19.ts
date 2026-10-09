import { TAU, apoly, aline, type AuraArt } from './shared';

/** 批十四光环（年兽迎春 / 月夜狼族 / 末日丧尸 / 大便人厕所）——成景构图，画在角色身后 */

export const AURAS_19: Record<string, AuraArt> = {
  // ── 年兽迎春 ──
  nianAuraA: { c: 0xff8a3c, a: 0xffd45c, draw: (g, now, _c, _a) => {
    // 爆竹烟花：夜空里三簇错相炸开的烟花 + 火星 + 挂着的鞭炮串
    for (let b = 0; b < 3; b++) {
      const ph = ((now / 1600 + b / 3) % 1);
      const cx = -60 + b * 60, cy = -70 + (b % 2) * 30;
      if (ph < 0.7) {
        const r = 4 + ph * 46;
        for (let k = 0; k < 10; k++) {
          const ang = (k / 10) * TAU + b;
          g.lineStyle(2 - ph, k % 2 ? 0xff8a3c : 0xffd45c, (0.9 - ph) * 0.9);
          g.lineBetween(cx, cy, cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
          g.fillStyle(0xffffff, (0.8 - ph));
          g.fillCircle(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 1.6);
        }
      }
    }
    // 鞭炮串
    g.fillStyle(0xd93a3a, 0.9);
    g.fillRect(44, -110, 6, 40);
    for (let k = 0; k < 7; k++) g.fillCircle(47, -106 + k * 6, 2.2);
    g.fillStyle(0xffd45c, 0.8);
    for (let k = 0; k < 7; k++) g.fillRect(45, -107 + k * 6, 4, 1);
  } },
  nianAuraB: { c: 0xff4a5a, a: 0xffd45c, draw: (g, now, _c, _a) => {
    // 红包雨：满屏飘落的红包，上下翻飞、带金印
    for (let k = 0; k < 12; k++) {
      const ph = ((now / 2200 + k / 12) % 1);
      const rx = -90 + k * 16 + Math.sin(now / 500 + k) * 8;
      const ry = -130 + ph * 200;
      const ang = Math.sin(now / 400 + k) * 0.4;
      g.save(); g.translateCanvas(rx, ry); g.rotateCanvas(ang);
      g.fillStyle(0xd93a3a, 0.95);
      g.fillRoundedRect(-6, -9, 12, 18, 2);
      g.fillStyle(0xffd45c, 0.95); g.fillCircle(0, -3, 2.2);
      g.fillStyle(0xffe89a, 0.7); g.fillRect(-4, 4, 8, 1.4);
      g.restore();
    }
    g.fillStyle(0xffd45c, 0.14); g.fillEllipse(0, 44, 200, 18);
  } },
  // ── 月夜狼族 ──
  wolfAuraA: { c: 0xff3a4a, a: 0xc0c8d8, draw: (g, now, _c, _a) => {
    // 血月悬空：身后一轮巨大血月 + 飘过的暗云 + 荒树剪影
    g.fillStyle(0x1a1a2e, 0.5); g.fillEllipse(0, -30, 300, 220);
    for (let k = 3; k >= 0; k--) { g.fillStyle(0xff3a4a, 0.05 + k * 0.02); g.fillCircle(0, -40, 40 + k * 12); }
    g.fillStyle(0xd93a4a, 0.85); g.fillCircle(0, -40, 42);
    g.fillStyle(0xb02a3a, 0.9); g.fillEllipse(-10, -46, 26, 18);
    g.fillStyle(0xff8a8a, 0.4); g.fillCircle(14, -30, 8);
    // 暗云
    for (let k = 0; k < 4; k++) {
      const ph = ((now / 3000 + k / 4) % 1);
      g.fillStyle(0x0e0e1c, 0.4); g.fillEllipse(-120 + ph * 240, -80 + (k % 2) * 20, 60, 16);
    }
    // 荒树
    g.fillStyle(0x0e0e1c, 0.6);
    g.fillRect(-70, -10, 5, 60); aline(g, [[-70, 0], [-84, -26]], 3, 0x0e0e1c, 0.6);
    g.fillRect(66, -6, 5, 56); aline(g, [[69, 4], [84, -20]], 3, 0x0e0e1c, 0.6);
  } },
  wolfAuraB: { c: 0xb8c4d8, a: 0xff3a4a, draw: (g, now, _c, _a) => {
    // 狼群嚎月：三个仰头的狼剪影朝月亮嚎叫 + 声波
    g.fillStyle(0x8a94a2, 0.6); g.fillCircle(30, -84, 16);
    for (let k = 0; k < 3; k++) {
      const wx = -70 + k * 46 + Math.sin(now / 900 + k) * 4;
      const sc = k === 1 ? 1.2 : 0.9;
      const wy = 46;
      g.fillStyle(0x0e0e1c, 0.9);
      apoly(g, [[wx - 8 * sc, wy], [wx + 8 * sc, wy], [wx + 6 * sc, wy - 22 * sc], [wx - 6 * sc, wy - 22 * sc]], 0x0e0e1c, 0.9);
      g.fillCircle(wx, wy - 24 * sc, 6 * sc);
      // 仰头吻 + 尖耳
      apoly(g, [[wx, wy - 28 * sc], [wx + 8 * sc, wy - 34 * sc], [wx + 4 * sc, wy - 24 * sc]], 0x0e0e1c, 0.9);
      g.fillTriangle(wx - 5 * sc, wy - 28 * sc, wx - 1 * sc, wy - 28 * sc, wx - 4 * sc, wy - 34 * sc);
      g.fillTriangle(wx + 1 * sc, wy - 28 * sc, wx + 5 * sc, wy - 28 * sc, wx + 4 * sc, wy - 34 * sc);
      const gl = 0.5 + 0.5 * Math.sin(now / 300 + k);
      g.fillStyle(0xff3a4a, gl); g.fillCircle(wx + 2 * sc, wy - 26 * sc, 1 * sc);
    }
  } },
  // ── 末日丧尸 ──
  zombAuraA: { c: 0x9cff3a, a: 0x7dff3a, draw: (g, now, _c, _a) => {
    // 病毒孢子：悬浮的刺球病毒 + 上浮孢子 + 生化霞光
    g.fillStyle(0x28301e, 0.45); g.fillEllipse(0, -20, 260, 180);
    for (let j = 0; j < 3; j++) {
      const cx = -60 + j * 60, cy = -60 + (j % 2) * 40 + Math.sin(now / 700 + j) * 6;
      const r = 12 + j * 3;
      g.fillStyle(0x9cff3a, 0.9); g.fillCircle(cx, cy, r);
      g.fillStyle(0x6aa82a, 0.9); g.fillCircle(cx, cy, r * 0.6);
      for (let s = 0; s < 10; s++) {
        const ang = (s / 10) * TAU + now / 1500;
        g.fillStyle(0x9cff3a, 0.9);
        g.fillCircle(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 2);
      }
    }
    for (let k = 0; k < 10; k++) {
      const ph = ((now / 1800 + k / 10) % 1);
      g.fillStyle(0x7dff3a, 0.5 * (1 - ph));
      g.fillCircle(-90 + k * 20 + Math.sin(now / 400 + k) * 6, 40 - ph * 150, 1.6 * (1 - ph) + 0.5);
    }
  } },
  zombAuraB: { c: 0x7dff3a, a: 0x9cff3a, draw: (g, now, _c, _a) => {
    // 生化毒云：翻滚的绿色毒云 + 滴落的毒液 + 危标
    for (let k = 0; k < 6; k++) {
      const ph = ((now / 1600 + k / 6) % 1);
      g.fillStyle(0x2a3a1a, 0.3); g.fillEllipse(-60 + k * 24 + Math.sin(now / 600 + k) * 8, -30 + ph * 30, 40, 20);
    }
    for (let k = 0; k < 8; k++) {
      const ph = ((now / 1200 + k / 8) % 1);
      g.fillStyle(0x7dff3a, 0.25 * (1 - ph));
      g.fillCircle(-80 + k * 22, -60 + ph * 30, 12 + ph * 10);
    }
    g.fillStyle(0x9cff3a, 0.9);
    g.fillCircle(0, -30, 3);
    for (let s = 0; s < 3; s++) {
      const ang = -Math.PI / 2 + (s - 1) * 2.1;
      g.lineStyle(2, 0x9cff3a, 0.9);
      g.beginPath(); g.arc(0 + Math.cos(ang) * 8, -30 + Math.sin(ang) * 8, 5, 0, TAU); g.strokePath();
    }
    for (let k = 0; k < 4; k++) {
      const ph = ((now / 900 + k / 4) % 1);
      g.fillStyle(0x9cff3a, 0.8 * (1 - ph)); g.fillEllipse(-30 + k * 20, 20 + ph * 30, 3, 5);
    }
  } },
  // ── 大便人厕所 ──
  toilAuraA: { c: 0xbfe8ff, a: 0xffffff, draw: (g, now, _c, _a) => {
    // 泡泡环绕：大小不一的肥皂泡绕身升起，泡里透光
    for (let k = 0; k < 14; k++) {
      const ph = ((now / 2000 + k / 14) % 1);
      const bx = Math.sin(k * 2.3) * 70 + Math.sin(now / 600 + k) * 6;
      const r = 4 + (k % 4) * 3;
      const by = 44 - ph * 190;
      g.fillStyle(0xbfe8ff, 0.22);
      g.fillCircle(bx, by, r);
      g.lineStyle(1.2, 0xffffff, 0.6); g.beginPath(); g.arc(bx, by, r, 0, TAU); g.strokePath();
      g.fillStyle(0xffffff, 0.8); g.fillCircle(bx - r * 0.35, by - r * 0.35, r * 0.28);
    }
  } },
  toilAuraB: { c: 0x8fd8ff, a: 0xffffff, draw: (g, now, _c, _a) => {
    // 冲水漩涡：身后一个旋转的水漩涡 + 向心的水流 + 溅起水花
    g.save(); g.translateCanvas(0, -10); g.scaleCanvas(1, 0.85);
    for (let k = 0; k < 4; k++) {
      const rot = now / (700 + k * 250) * (k % 2 ? -1 : 1);
      g.lineStyle(3 - k * 0.5, k % 2 ? 0xbfe8ff : 0x8fd8ff, 0.5 - k * 0.08);
      g.beginPath(); g.arc(0, 0, 24 + k * 16, rot, rot + Math.PI * 1.4); g.strokePath();
    }
    g.fillStyle(0x6ab8d8, 0.6); g.fillCircle(0, 0, 16);
    g.fillStyle(0x0e3a4a, 0.7); g.fillCircle(0, 0, 7);
    g.restore();
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * TAU + now / 400;
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(Math.cos(ang) * 70, -10 + Math.sin(ang) * 40, 2.4);
    }
  } },
};
