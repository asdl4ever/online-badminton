import { cpoly, cline, type CapeArt } from './shared';

/**
 * 批十四背部装饰（年兽迎春 / 月夜狼族 / 末日丧尸 / 大便人厕所）——**自由槽**：
 * 四件仍是披风（红绸 / 狼皮 / 破烂大衣 / 浴帘），四件改成**背挂物件**（`single: true`）：
 * 春联卷轴 / 噬月图腾 / 警示油桶 / 马桶刷筒。
 * 披风从 (0,0) 肩锚垂到 y≈80；背挂物件挂垂坠高度锚点 topY+30、只画一次。
 */

export const CAPES_9: Record<string, CapeArt> = {
  // ── 年兽迎春 ──
  nianCape: { c: 0xb02a2a, a: 0xffd45c, draw: (g, _now, sway, c, a) => {
    // 红绸披风：红绸面料 + 纵向褶纹 + 金色滚边
    cpoly(g, [[-16, 0], [16, 0], [22 + sway, 54], [12 + sway * 1.2, 80], [-9 + sway, 76], [-20 + sway * 0.7, 48]], c, 0.95);
    g.lineStyle(1.4, 0x8a1a1a, 0.6);
    for (let k = 0; k < 5; k++) cline(g, [[-13 + k * 6, 4], [-16 + k * 8 + sway, 74]], 1.4, 0x8a1a1a, 0.5);
    cline(g, [[-20 + sway * 0.7, 48], [-9 + sway, 76]], 2.2, a, 0.8);
    cline(g, [[22 + sway, 54], [12 + sway * 1.2, 80]], 2.2, a, 0.8);
    g.fillStyle(a, 0.9); g.fillCircle(0, 6, 2.4);
  } },
  nianCloak: { c: 0xd93a3a, a: 0xffd45c, single: true, draw: (g, now, _sway, c, a) => {
    // 春联卷轴：挂在背上的一副竖卷轴，红底金字、上下木轴
    const sw = Math.sin(now / 600) * 2;
    g.fillStyle(0x8a5a2a, 1); g.fillRoundedRect(-13, -30, 26, 6, 3); g.fillRoundedRect(-13, 24, 26, 6, 3);
    g.fillStyle(0xffd45c, 0.9); g.fillRoundedRect(-13, -30, 26, 2.4, 1); g.fillRoundedRect(-13, 26, 26, 2.4, 1);
    g.fillStyle(c, 1); g.fillRect(-11, -25, 22, 49);
    g.fillStyle(0x8a1a1a, 0.5); g.fillRect(-11, -25, 3, 49);
    g.fillStyle(a, 0.95);
    for (let k = 0; k < 4; k++) g.fillRect(-6, -18 + k * 12 + sw * 0.2, 12, 7);
    g.fillStyle(c, 0.85);
    g.fillPoints([{ x: -11, y: -25 }, { x: -3, y: -27 + sw }, { x: -6, y: -35 + sw }, { x: -12, y: -31 }] as never, true);
  } },
  // ── 月夜狼族 ──
  wolfCape: { c: 0x4a3a5a, a: 0x8a94a2, draw: (g, _now, sway, c, a) => {
    // 狼皮披风：厚狼皮 + 参差毛沿 + 尾巴拖在侧后
    cpoly(g, [[-17, 0], [17, 0], [23 + sway, 56], [14 + sway * 1.2, 82], [-10 + sway, 80], [-21 + sway * 0.7, 48]], 0x3a2a4a, 0.95);
    cpoly(g, [[-15, 2], [15, 2], [21 + sway, 54], [12 + sway * 1.2, 78], [-9 + sway, 76], [-19 + sway * 0.7, 46]], c, 0.95);
    g.lineStyle(1.4, a, 0.5);
    for (let k = 0; k < 6; k++) cline(g, [[-12 + k * 5, 6], [-14 + k * 6 + sway, 74]], 1.4, a, 0.45);
    for (let k = 0; k < 8; k++) {
      const bx = -16 + k * 5 + sway;
      g.fillStyle(k % 2 ? c : a, 0.95);
      g.fillTriangle(bx - 3, 76, bx + 3, 76, bx + (k % 2 ? 1 : -1), 86);
    }
    g.fillStyle(c, 1);
    cpoly(g, [[18 + sway * 1.1, 60], [26 + sway * 1.3, 66], [31 + sway * 1.4, 56], [28 + sway * 1.2, 48]], c, 0.95);
  } },
  wolfCloak: { c: 0x4a3a5a, a: 0xff3a4a, single: true, draw: (g, _now, _sway, c, a) => {
    // 噬月图腾：背着一根木雕图腾柱，顶端狼头、柱身血月纹
    g.fillStyle(0x6a4a2a, 1); g.fillRoundedRect(-9, -22, 18, 52, 4);
    g.fillStyle(0x4a3018, 0.6); g.fillRect(-9, -22, 4, 52);
    g.fillStyle(c, 1); g.fillCircle(0, -26, 9);
    g.fillTriangle(-7, -32, -2, -32, -5, -41); g.fillTriangle(2, -32, 7, -32, 5, -41);
    g.fillStyle(a, 0.9); g.fillCircle(-3, -26, 1.8); g.fillCircle(3, -26, 1.8);
    g.fillStyle(0x3a2a1a, 1); g.fillEllipse(0, -21, 7, 3.4);
    g.fillStyle(a, 0.85); g.fillCircle(0, -6, 6);
    g.fillStyle(0x2a1a2a, 1); g.fillCircle(2.4, -7, 5);
    g.lineStyle(1.4, 0x3a2a1a, 0.75);
    for (let k = 0; k < 3; k++) g.lineBetween(-6, 4 + k * 8, 6, 4 + k * 8);
    g.fillStyle(a, 0.8); g.fillTriangle(-6, -34, -2, -34, -4, -42); g.fillTriangle(2, -34, 6, -34, 4, -42);
  } },
  // ── 末日丧尸 ──
  zombCape: { c: 0x4a4438, a: 0x9cff3a, draw: (g, _now, sway, c, a) => {
    // 破烂大衣：破布大衣，边缘撕成锯齿，破洞露出里面
    cpoly(g, [[-16, 0], [16, 0], [22 + sway, 56], [12 + sway * 1.2, 80], [-9 + sway, 76], [-20 + sway * 0.7, 48]], c, 0.96);
    for (let k = 0; k < 7; k++) {
      const bx = -16 + k * 5 + sway;
      g.fillStyle(0x2e2a22, 1);
      g.fillTriangle(bx - 3, 74, bx + 3, 74, bx, 86 - (k % 3) * 4);
    }
    g.fillStyle(0x2e2a22, 0.9);
    g.fillCircle(-4 + sway * 0.5, 34, 5);
    g.fillCircle(8 + sway * 0.7, 52, 4);
    g.fillStyle(a, 0.7); g.fillCircle(-4 + sway * 0.5, 34, 1.4);
    cline(g, [[-16, 4], [-13, 40]], 1.4, 0x2e2a22, 0.7);
    cline(g, [[16, 6], [13, 44]], 1.4, 0x2e2a22, 0.7);
  } },
  zombCloak: { c: 0xd8b12a, a: 0x1a1a16, single: true, draw: (g, _now, _sway, c, a) => {
    // 警示油桶：背上一只生化油桶，桶身黄黑箍 + 三叶生化标 + 溅出的毒液
    g.fillStyle(0x5a5a4a, 1); g.fillRoundedRect(-16, -26, 32, 52, 5);
    g.fillStyle(c, 1); g.fillRoundedRect(-15, -25, 30, 50, 4);
    g.fillStyle(0x3a3a30, 1);
    g.fillRect(-16, -25, 32, 3); g.fillRect(-16, -18, 32, 3); g.fillRect(-16, 16, 32, 3); g.fillRect(-16, 22, 32, 3);
    for (let k = 0; k < 3; k++) {
      const ang = -Math.PI / 2 + (k / 3) * Math.PI * 2;
      g.fillStyle(a, 0.9); g.fillCircle(Math.cos(ang) * 5.4, Math.sin(ang) * 5.4, 3.6);
    }
    g.fillStyle(a, 0.9); g.fillCircle(0, 0, 4.6);
    g.fillStyle(c, 1); g.fillCircle(0, 0, 2);
    g.fillStyle(0x9cff3a, 0.85); g.fillCircle(-13, 26, 2.6); g.fillCircle(10, 26, 2);
  } },
  // ── 大便人厕所 ──
  toilCape: { c: 0xbfe0e8, a: 0xf0e8d8, draw: (g, now, sway, c, a) => {
    // 浴帘披风：半透浴帘 + 顶部挂环 + 水珠
    cpoly(g, [[-16, 0], [16, 0], [21 + sway, 56], [12 + sway * 1.2, 80], [-9 + sway, 78], [-19 + sway * 0.7, 46]], c, 0.5);
    for (let k = 0; k < 9; k++) {
      g.lineStyle(1.4, 0x9aa4b2, 0.9);
      g.beginPath(); g.arc(-14 + k * 3.5, 0, 1.6, 0, 6.283); g.strokePath();
    }
    g.fillStyle(a, 0.4);
    cpoly(g, [[-10, 4], [10, 4], [13 + sway, 50], [4 + sway, 72], [-10 + sway * 0.8, 50]], a, 0.4);
    for (let k = 0; k < 4; k++) {
      const ph = ((now / 900 + k / 4) % 1);
      g.fillStyle(0xffffff, 0.6 * (1 - ph));
      g.fillCircle(-12 + k * 8 + sway * 0.6, 12 + ph * 60, 1.4);
    }
  } },
  toilCloak: { c: 0xbfe0e8, a: 0xd86a2a, single: true, draw: (g, now, _sway, c, _a) => {
    // 马桶刷筒：背上一只刷筒，插着刷子、刷头微晃
    g.fillStyle(0x9aa4b2, 1); g.fillRoundedRect(-11, 2, 22, 22, 5);
    g.fillStyle(c, 1); g.fillRoundedRect(-10, 3, 20, 20, 4);
    g.fillStyle(0xd8e0e4, 0.8); g.fillEllipse(0, 3, 22, 5);
    g.fillStyle(0x8a5a2a, 1); g.fillRoundedRect(-2.4, -24, 4.8, 28, 2);
    const bob = Math.sin(now / 500) * 1.5;
    g.fillStyle(0xd86a2a, 1); g.fillCircle(0, -26 + bob, 8.4);
    g.fillStyle(0xff9a5a, 0.5); g.fillCircle(-2, -28 + bob, 3);
    g.fillStyle(0xe8e8e8, 0.85);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * Math.PI * 2; g.fillCircle(Math.cos(ang) * 7, -26 + bob + Math.sin(ang) * 7, 1.4); }
    g.lineStyle(1.6, 0xd8d4c8, 0.8); g.lineBetween(-8, 2, -12, -8); g.lineBetween(8, 2, 12, -8);
  } },
};
