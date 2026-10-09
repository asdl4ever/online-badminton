import { cpoly, cline, type CapeArt } from './shared';

/**
 * 批十三背部装饰（尼斯湖水怪 / 熊出没 / 雪山谜踪）——**自由槽**：
 * 三件披风（湖雨蓑衣 / 护林员披风 / 兽皮大氅）+ 三件背挂物件（`single: true`）：
 * 船锚 / 木工工具箱 / 冻原路标。
 */

export const CAPES_8: Record<string, CapeArt> = {
  // ── 尼斯湖水怪 ──
  lochCape: { c: 0x4a6a5a, a: 0xd8c8a0, draw: (g, now, sway, c, a) => {
    // 湖雨蓑衣：草秆编的雨披，雨水顺草尖滴落
    cpoly(g, [[-16, 0], [16, 0], [22 + sway, 54], [12 + sway * 1.2, 80], [-9 + sway, 76], [-20 + sway * 0.7, 48]], c, 0.92);
    for (let k = 0; k < 7; k++) { const x0 = -14 + k * 4.6, x1 = -18 + k * 6 + sway; cline(g, [[x0, 4], [x1, 78]], 1.8, k % 2 ? a : 0x3a5a48, 0.55); }
    g.fillStyle(0x3a5a48, 0.95); g.fillRoundedRect(-9, -1, 18, 5, 2.5);
    for (let k = 0; k < 4; k++) { const ph = ((now / 700 + k / 4) % 1); g.fillStyle(0xd8f8ff, 0.7 * (1 - ph)); g.fillCircle(-14 + k * 10 + sway * (0.6 + k * 0.1), 76 + ph * 8, 1.5 * (1 - ph) + 0.5); }
  } },
  lochCloak: { c: 0x6a7482, a: 0x8a9aa8, single: true, draw: (g, now, _sway, c, a) => {
    // 船锚：背上一只生锈的船锚 + 挂的水草
    g.fillStyle(c, 1); g.fillRect(-2.4, -22, 4.8, 30); // 锚杆
    g.fillStyle(a, 0.95); g.fillCircle(0, -24, 5); g.fillRect(-7, -25, 14, 3); // 锚环
    g.fillStyle(c, 1); g.fillRect(-12, 4, 24, 4); // 横杆
    g.lineStyle(5, c, 1); g.beginPath(); g.moveTo(-18, 6); g.lineTo(-18, 16); g.lineTo(-8, 22); g.strokePath();
    g.beginPath(); g.moveTo(18, 6); g.lineTo(18, 16); g.lineTo(8, 22); g.strokePath();
    g.fillStyle(0x8a5a2a, 0.6); g.fillCircle(-3, -14, 3); g.fillCircle(2, 10, 2.4); // 锈
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle(0x8fe8c8, 0.6 * (1 - ph)); g.fillCircle(-14 + k * 14, 20 + ph * 6, 1.6); }
  } },
  // ── 熊出没 ──
  boonCape: { c: 0x3f6136, a: 0x8fe06a, draw: (g, _now, sway, c, a) => {
    // 护林员披风：森林绿斗篷 + 皮草领 + 松树徽
    cpoly(g, [[-16, 0], [16, 0], [22 + sway, 56], [12 + sway * 1.2, 80], [-9 + sway, 76], [-20 + sway * 0.7, 48]], c, 0.96);
    cpoly(g, [[-11, 2], [11, 2], [14 + sway, 52], [5 + sway, 72], [-11 + sway * 0.8, 50]], 0x4f7544, 0.6);
    g.fillStyle(0x8a6a4a, 1); for (let k = 0; k < 9; k++) g.fillCircle(-15 + k * 3.8, 1, 2.6);
    for (let k = 0; k < 5; k++) { const bx = -14 + k * 7 + sway * 0.9; g.fillStyle(k % 2 ? a : 0x2f7a4a, 0.9); g.fillPoints([{ x: bx, y: 74 }, { x: bx + 4, y: 68 }, { x: bx + 8, y: 74 }, { x: bx + 4, y: 78 }] as never, true); }
    g.fillStyle(a, 0.95); g.fillPoints([{ x: 0, y: 12 }, { x: -6, y: 28 }, { x: 6, y: 28 }] as never, true); g.fillPoints([{ x: 0, y: 20 }, { x: -7, y: 36 }, { x: 7, y: 36 }] as never, true);
    g.fillStyle(0x6a4a2a, 1); g.fillRect(-2, 36, 4, 6);
  } },
  boonCloak: { c: 0x8a5a3a, a: 0x8a94a2, single: true, draw: (g, _now, _sway, c, a) => {
    // 木工工具箱：背上一只木工具箱，锯子和斧子露出来
    g.fillStyle(0x6a4a2a, 1); g.fillRoundedRect(-16, -8, 32, 26, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(-15, -7, 30, 24, 3);
    g.fillStyle(0x4a3018, 1); g.fillRect(-16, -2, 32, 2);
    g.fillStyle(a, 1); g.fillRoundedRect(-5, -12, 10, 5, 2); // 提手
    // 斧柄 + 锯片
    g.lineStyle(3, 0x8a5a2a, 1); g.lineBetween(-10, -6, -16, -22);
    g.fillStyle(0xd8d4c8, 0.95); g.fillPoints([{ x: 4, y: -8 }, { x: 14, y: -20 }, { x: 17, y: -16 }, { x: 7, y: -6 }] as never, true);
    g.fillStyle(a, 0.9); g.fillRect(-13, 2, 26, 2);
  } },
  // ── 雪山谜踪 ──
  bigfCape: { c: 0x8a705a, a: 0xb89478, draw: (g, _now, sway, c, a) => {
    // 兽皮大氅：厚毛兽皮披风，参差毛齿下沿
    cpoly(g, [[-17, 0], [17, 0], [23 + sway, 56], [14 + sway * 1.2, 82], [-10 + sway, 80], [-21 + sway * 0.7, 48]], 0x5a4634, 0.95);
    cpoly(g, [[-15, 2], [15, 2], [21 + sway, 54], [12 + sway * 1.2, 78], [-9 + sway, 76], [-19 + sway * 0.7, 46]], c, 0.95);
    g.lineStyle(1.2, a, 0.5); for (let k = 0; k < 6; k++) cline(g, [[-12 + k * 5, 6], [-14 + k * 6 + sway, 74]], 1.2, a, 0.45);
    for (let k = 0; k < 8; k++) { const bx = -16 + k * 5 + sway; g.fillStyle(k % 2 ? c : a, 0.95); g.fillTriangle(bx - 3, 76, bx + 3, 76, bx + (k % 2 ? 1 : -1), 86); }
    for (let k = 0; k < 7; k++) { g.fillStyle(a, 0.7); g.fillCircle(-16 + k * 5.4, 1, 3); }
  } },
  bigfCloak: { c: 0x8a6a42, a: 0xe0f2ff, single: true, draw: (g, _now, _sway, c, a) => {
    // 冻原路标：背上一块木牌路标 + 积雪
    g.fillStyle(0x5a3c22, 1); g.fillRect(-2.4, 0, 4.8, 22); // 木桩
    g.fillStyle(c, 1); g.fillPoints([{ x: -18, y: -20 }, { x: 18, y: -18 }, { x: 22, y: -6 }, { x: -18, y: -6 }] as never, true);
    g.fillStyle(0x3a2412, 0.9); g.fillRect(-14, -16, 24, 2); g.fillRect(-14, -11, 18, 2); // 刻痕
    g.fillStyle(a, 0.9); g.fillPoints([{ x: -18, y: -20 }, { x: 18, y: -18 }, { x: 15, y: -14 }, { x: -18, y: -16 }] as never, true); // 积雪
    g.fillStyle(0xffffff, 0.8); g.fillCircle(-10, 20, 4); g.fillCircle(6, 21, 5);
  } },
};
