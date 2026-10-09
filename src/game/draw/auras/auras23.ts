import { TAU, apoly, type AuraArt } from './shared';

/** 第七批光环 / 背景（纳米矩阵 / 数据洪流 / 曲速跃迁 / 火星殖民 / 先行者遗迹）——成景构图，画在角色身后 */

export const AURAS_23: Record<string, AuraArt> = {
  // ── 纳米矩阵 ──
  nanoHive: { c: 0x39ffd0, a: 0x7fe8ff, draw: (g, now, c, a) => {
    // 纳米蜂巢：六边蜂巢矩阵，格子逐个亮/灭、粒子沿格流动
    const R = 13;
    for (let row = -3; row <= 3; row++) {
      for (let col = -3; col <= 3; col++) {
        const cx = 0 + col * R * 1.72 + (row % 2 ? R * 0.86 : 0);
        const cy = -20 + row * R * 1.5;
        if (Math.abs(cx) > 84 || cy > 54 || cy < -110) continue;
        const on = 0.3 + 0.7 * Math.max(0, Math.sin(now / 500 - (row + col) * 0.6));
        g.fillStyle(c, 0.12 + 0.2 * on);
        apoly(g, [[cx, cy - R * 0.9], [cx + R * 0.86, cy - R * 0.45], [cx + R * 0.86, cy + R * 0.45], [cx, cy + R * 0.9], [cx - R * 0.86, cy + R * 0.45], [cx - R * 0.86, cy - R * 0.45]], c, 0.14 + 0.22 * on);
        g.lineStyle(1.2, a, 0.2 + 0.4 * on);
        g.beginPath(); g.moveTo(cx, cy - R * 0.9); g.lineTo(cx + R * 0.86, cy - R * 0.45); g.lineTo(cx + R * 0.86, cy + R * 0.45); g.lineTo(cx, cy + R * 0.9); g.lineTo(cx - R * 0.86, cy + R * 0.45); g.lineTo(cx - R * 0.86, cy - R * 0.45); g.closePath(); g.strokePath();
      }
    }
    for (let k = 0; k < 10; k++) { const ph = ((now / 1300 + k / 10) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(-70 + (k * 29 % 140), 50 - ph * 160, 1.4); }
  } },
  nanoField: { c: 0x7fe8ff, a: 0x39ffd0, draw: (g, now, c, a) => {
    // 纳米场：一圈旋转的纳米粒子场
    for (let k = 0; k < 14; k++) { const ang = (k / 14) * TAU + now / 1800; const rr = 50 + Math.sin(now / 600 + k) * 12; const on = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k)); g.fillStyle(c, 0.6 * on); g.fillCircle(Math.cos(ang) * rr, -24 + Math.sin(ang) * rr * 0.6, 2.2); }
    g.lineStyle(1.6, a, 0.25); g.save(); g.translateCanvas(0, -24); g.scaleCanvas(1, 0.6); g.beginPath(); g.arc(0, 0, 58, 0, TAU); g.strokePath(); g.restore();
    g.fillStyle(a, 0.3); g.fillEllipse(0, 40, 130, 18);
  } },
  // ── 数据洪流 ──
  dataStream: { c: 0x4affc4, a: 0x7fb8ff, draw: (g, now, c, a) => {
    // 数据洪流：数据瀑布下垂、代码块循环下落
    for (let col = 0; col < 7; col++) {
      const bx = -72 + col * 24;
      for (let k = 0; k < 5; k++) { const ph = ((now / 1100 + k / 5 + col * 0.13) % 1); const yy = -110 + ph * 170; g.fillStyle(k % 2 ? c : a, 0.5 * (1 - ph)); g.fillRect(bx, yy, 3, 10 + (k % 3) * 6); }
      g.fillStyle(c, 0.12); g.fillRect(bx - 1, -110, 5, 170);
    }
    g.fillStyle(a, 0.15); g.fillEllipse(0, 52, 180, 18);
  } },
  dataGrid: { c: 0x7fb8ff, a: 0x4affc4, draw: (g, now, c, a) => {
    // 数据网格：透视数据网格，节点错相闪
    const hy = -18;
    for (let k = 0; k <= 6; k++) { const t = k / 6; const y = hy - 70 + t * 130; g.lineStyle(1, c, 0.18 + 0.1 * t); g.lineBetween(-90 * (0.4 + t * 0.9), y, 90 * (0.4 + t * 0.9), y); }
    for (let k = -4; k <= 4; k++) { g.lineStyle(1, c, 0.2); g.lineBetween(k * 4, hy - 70, k * 16, hy + 60); }
    for (let k = 0; k < 8; k++) { const gx = ((k * 37) % 160) - 80, gy = hy - 60 + (k * 19 % 120); g.fillStyle(a, 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k))); g.fillCircle(gx, gy, 1.6); }
  } },
  // ── 曲速跃迁 ──
  warpTunnel: { c: 0xa98cff, a: 0x9fd8ff, draw: (g, now, c, a) => {
    // 曲速隧道：深空曲速隧道，星轨向中心拉伸、环状光带滚动
    g.fillStyle(0x080a24, 0.85); g.fillCircle(0, -28, 66);
    const cx = 0, cy = -28;
    for (let k = 0; k < 20; k++) { const ang = (k / 20) * TAU + now / 3000; const rr = 12 + ((k * 7 + now / 40) % 60); g.lineStyle(1.4, k % 2 ? a : c, 0.5 * (1 - (rr - 12) / 60)); g.lineBetween(cx + Math.cos(ang) * rr * 0.5, cy + Math.sin(ang) * rr * 0.5, cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr); }
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.lineStyle(2.4 - k * 0.5, a, (1 - ph) * 0.6); g.strokeCircle(cx, cy, 10 + ph * 54); }
    g.fillStyle(0xffffff, 0.7 + 0.3 * Math.sin(now / 400)); g.fillCircle(cx, cy, 3.4);
    g.fillStyle(c, 0.12); g.fillEllipse(0, 46, 150, 20);
  } },
  warpField: { c: 0x9fd8ff, a: 0xa98cff, draw: (g, now, c, a) => {
    // 引力场：一圈引力透镜光环，星光被弯折
    g.save(); g.translateCanvas(0, -28); g.scaleCanvas(1, 0.62);
    for (let k = 0; k < 3; k++) { g.lineStyle(2.4 - k * 0.5, k % 2 ? a : c, 0.4 - k * 0.08); g.beginPath(); g.arc(0, 0, 44 + k * 8, 0, TAU); g.strokePath(); }
    g.restore();
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU + now / 2200; g.fillStyle(0xffffff, 0.5 + 0.4 * Math.sin(now / 300 + k)); g.fillCircle(Math.cos(ang) * 52, -28 + Math.sin(ang) * 32, 1.4); }
    g.fillStyle(c, 0.1); g.fillCircle(0, -28, 60);
  } },
  // ── 火星殖民 ──
  marsColony: { c: 0xff7a4a, a: 0xffb08a, draw: (g, now, c, a) => {
    // 火星基地：穹顶殖民基地群，灯窗循环闪、尘暴飘过
    g.fillStyle(0x5a2418, 0.55); g.fillEllipse(0, 46, 200, 26);
    for (const [bx, r] of [[-46, 20], [-14, 26], [22, 22], [50, 16]] as Array<[number, number]>) {
      g.fillStyle(0x8a4a2a, 1); g.beginPath(); g.arc(bx, 40, r, Math.PI, TAU); g.closePath(); g.fillPath();
      g.fillStyle(0xc0703a, 1); g.beginPath(); g.arc(bx, 40, r - 3, Math.PI, TAU); g.closePath(); g.fillPath();
      for (let k = 0; k < 3; k++) { const lit = 0.4 + 0.6 * Math.abs(Math.sin(now / 500 + bx + k)); g.fillStyle(a, lit); g.fillRect(bx - r + 5 + k * (r * 0.7), 28, 3, 4); }
      g.fillStyle(0x3a1a12, 1); g.fillRect(bx - 3, 40 - r - 12, 6, 12);
      g.fillStyle(c, 0.5 + 0.3 * Math.sin(now / 300 + bx)); g.fillCircle(bx, 40 - r - 13, 2);
    }
    for (let k = 0; k < 6; k++) { const ph = ((now / 1400 + k / 6) % 1); g.fillStyle(c, 0.4 * (1 - ph)); g.fillEllipse(-90 + ph * 180, 10, 40, 12); }
  } },
  marsDust: { c: 0xc0462a, a: 0xff7a4a, draw: (g, now, c, a) => {
    // 火星尘暴：身后卷起红色尘暴环
    for (let k = 0; k < 16; k++) { const ang = (k / 16) * TAU + now / 500; const rr = 44 + Math.sin(now / 400 + k) * 16; g.fillStyle(k % 2 ? c : a, 0.2 + 0.15 * Math.abs(Math.sin(now / 300 + k))); g.fillCircle(Math.cos(ang) * rr, -22 + Math.sin(ang) * rr * 0.55, 10); }
    for (let k = 0; k < 12; k++) { const ph = ((now / 1100 + k / 12) % 1); g.fillStyle(a, (1 - ph) * 0.5); g.fillCircle(-80 + (k * 27 % 160), 40 - ph * 90, 1.6); }
    g.fillStyle(c, 0.12); g.fillEllipse(0, 44, 160, 20);
  } },
  // ── 先行者遗迹 ──
  forerRuins: { c: 0x5ad8ff, a: 0xa8e0ff, draw: (g, now, _c, a) => {
    // 先行者遗迹：悬浮遗迹门廊，光纹循环走、碎石悬空
    g.fillStyle(0x1a2836, 0.9); g.fillRect(-44, -80, 14, 120); g.fillRect(30, -80, 14, 120);
    g.fillStyle(0x2c3a4a, 1); g.fillRect(-42, -78, 10, 116); g.fillRect(32, -78, 10, 116);
    apoly(g, [[-52, -80], [52, -80], [44, -96], [-44, -96]], 0x2c3a4a, 1);
    const flow = (now / 1400) % 1;
    for (let k = 0; k < 4; k++) { const yy = -74 + ((k + flow * 4) % 4) * 30; g.fillStyle(a, 0.5 * (1 - Math.abs((k / 4) - 0.5) * 1.2)); g.fillRect(-42, yy, 10, 2); g.fillRect(32, yy, 10, 2); }
    g.fillStyle(0x080e16, 0.6); apoly(g, [[-30, -78], [30, -78], [24, 40], [-24, 40]], 0x080e16, 0.55);
    const pulse = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(a, 0.12 + 0.16 * pulse); g.fillEllipse(0, -20, 42, 90);
    for (let k = 0; k < 6; k++) { const ang = now / 1600 + k * 1.1, rr = 40 + (k % 3) * 14; g.fillStyle(0x6a7a8a, 0.7); g.fillRect(Math.cos(ang) * rr - 3, -50 + Math.sin(ang) * rr * 0.5, 6, 6); }
    g.fillStyle(a, 0.3); g.fillEllipse(0, 46, 150, 16);
  } },
  forerRing: { c: 0xa8e0ff, a: 0x5ad8ff, draw: (g, now, c, a) => {
    // 遗迹环：一圈旋转遗迹环，断口间窜电弧
    g.save(); g.translateCanvas(0, -26); g.scaleCanvas(1, 0.55);
    for (let k = 0; k < 3; k++) { g.lineStyle(5 - k, k % 2 ? c : 0x2c3a4a, 0.8); g.beginPath(); g.arc(0, 0, 46 + k * 6, now / 1200 + k, now / 1200 + k + Math.PI * 1.7); g.strokePath(); }
    for (let k = 0; k < 6; k++) { const ang = now / 1200 + (k / 6) * TAU; g.fillStyle(a, 0.9); g.fillRect(Math.cos(ang) * 46 - 3, Math.sin(ang) * 46 - 3, 6, 6); }
    g.restore();
    const flick = Math.sin(now / 90) > 0.3 ? 1 : 0.3;
    g.lineStyle(2, a, flick); g.beginPath(); g.moveTo(-40, -26); g.lineTo(-20, -34); g.lineTo(-26, -20); g.lineTo(-4, -30); g.strokePath();
    g.lineStyle(2, a, flick); g.beginPath(); g.moveTo(40, -20); g.lineTo(22, -30); g.lineTo(28, -16); g.lineTo(8, -26); g.strokePath();
  } },
};
