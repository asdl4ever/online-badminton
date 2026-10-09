import { TAU, hpoly, type HatArt } from './shared';

/** 第七批头饰（纳米矩阵 / 数据洪流 / 曲速跃迁 / 火星殖民 / 先行者遗迹） */

export const HATS_21: Record<string, HatArt> = {
  // ── 纳米矩阵 ──
  nanoCrown: { c: 0x7fe8ff, a: 0x39ffd0, draw: (g, now, x, hy, c, a) => {
    // 纳米棱冠：悬浮立方体组成冠，立方体自行拼合/散开
    g.fillStyle(0x0e2a30, 1); g.fillRoundedRect(x - 13, hy - 6, 26, 7, 3);
    for (let k = 0; k < 5; k++) {
      const spread = Math.sin(now / 400 + k) * 3;
      const bx = x - 10 + k * 5, by = hy - 14 - Math.abs(k - 2) * -1 + spread;
      g.fillStyle(k % 2 ? c : a, 0.95); g.fillRect(bx - 2.4, by - 2.4, 4.8, 4.8);
      g.fillStyle(0xffffff, 0.5); g.fillRect(bx - 2.4, by - 2.4, 4.8, 1.4);
    }
    const lit = 0.5 + 0.5 * Math.sin(now / 260);
    g.fillStyle(a, lit); g.fillCircle(x, hy - 24, 3.4);
    g.fillStyle(0xffffff, lit); g.fillCircle(x, hy - 24, 1.4);
  } },
  nanoVisor: { c: 0x39ffd0, a: 0x7fe8ff, draw: (g, now, x, hy, c, a) => {
    // 纳米目镜：半透明数据目镜，滚动绿色数据条
    g.fillStyle(0x0e2a30, 0.9); g.fillRoundedRect(x - 15, hy - 8, 30, 7, 3);
    g.fillStyle(c, 0.7); g.fillRoundedRect(x - 14, hy - 7, 28, 5, 2.5);
    const scroll = (now / 400) % 1;
    for (let k = 0; k < 7; k++) { const bx = x - 13 + ((k + scroll * 7) % 7) * 3.7; const h = 1 + (k % 3); g.fillStyle(a, 0.5 + 0.5 * Math.abs(Math.sin(now / 200 + k))); g.fillRect(bx, hy - 6, 2, h); }
    g.fillStyle(a, 0.8); g.fillCircle(x + 13, hy - 4.5, 1.4);
  } },
  // ── 数据洪流 ──
  dataCrown: { c: 0x4affc4, a: 0x7fb8ff, draw: (g, now, x, hy, c, a) => {
    // 棱镜数据冠：悬浮棱镜冠，冠面滚动代码
    g.fillStyle(0x10202a, 1); g.fillRoundedRect(x - 13, hy - 5, 26, 6, 3);
    g.fillStyle(c, 1); hpoly(g, [[x - 11, hy - 5], [x, hy - 24], [x + 11, hy - 5]], c, 1);
    g.fillStyle(0x9fe8d8, 0.6); hpoly(g, [[x - 11, hy - 5], [x - 3, hy - 20], [x - 6, hy - 5]], 0x9fe8d8, 0.6);
    const scroll = (now / 500) % 1;
    for (let k = 0; k < 5; k++) { const t = ((k / 5) + scroll) % 1; g.fillStyle(a, 0.7 * (1 - Math.abs(t - 0.5) * 1.6)); g.fillRect(x - 7, hy - 22 + t * 16, 14, 1.4); }
    g.fillStyle(0xffffff, 0.7); g.fillCircle(x, hy - 22, 1.8);
  } },
  dataAntenna: { c: 0x7fb8ff, a: 0x4affc4, draw: (g, now, x, hy, c, a) => {
    // 数据天线：一根天线，顶圈圈数据波射出
    g.fillStyle(0x10202a, 1); g.fillRoundedRect(x - 8, hy - 5, 16, 6, 3);
    g.fillStyle(0x3a4a5a, 1); g.fillRect(x - 1.6, hy - 22, 3.2, 18);
    g.fillStyle(c, 1); g.fillCircle(x, hy - 23, 3);
    for (let k = 0; k < 3; k++) { const ph = ((now / 700 + k / 3) % 1); g.lineStyle(1.6 - k * 0.4, a, (1 - ph) * 0.8); g.beginPath(); g.arc(x, hy - 23, 3 + ph * 12, -1.1, 1.1); g.strokePath(); }
  } },
  // ── 曲速跃迁 ──
  warpHelm: { c: 0x9fd8ff, a: 0xa98cff, draw: (g, now, x, hy, c, a) => {
    // 跃迁头盔：领航员头盔，面罩内星空流动
    g.fillStyle(0x2a3550, 1); g.fillCircle(x, hy - 6, 14);
    g.fillStyle(c, 1); g.fillCircle(x, hy - 6, 13);
    g.fillStyle(0x0a1024, 1); g.fillEllipse(x, hy - 5, 20, 14);
    for (let k = 0; k < 6; k++) { const ang = now / 400 + k * 1.2, rr = 3 + (k % 3) * 4; g.fillStyle(0xffffff, 0.5 + 0.5 * Math.sin(now / 200 + k)); g.fillCircle(x + Math.cos(ang) * rr, hy - 5 + Math.sin(ang) * rr * 0.6, 1.2); }
    g.fillStyle(a, 0.6); g.fillEllipse(x, hy - 5, 14, 7);
    g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 300)); g.fillRect(x - 14, hy - 6, 3, 4); g.fillRect(x + 11, hy - 6, 3, 4);
  } },
  warpVisor: { c: 0xa98cff, a: 0x9fd8ff, draw: (g, now, x, hy, c, a) => {
    // 星轨目镜：镜面映出拉伸星轨
    g.fillStyle(0x141a3a, 0.95); g.fillRoundedRect(x - 16, hy - 8, 32, 8, 4);
    g.fillStyle(c, 0.8); g.fillRoundedRect(x - 15, hy - 7, 30, 6, 3);
    for (let k = 0; k < 6; k++) { const bx = x - 14 + ((k * 5 + now / 80) % 30); g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 150 + k)); g.fillRect(bx, hy - 6, 5, 1.4); }
    g.fillStyle(0xffffff, 0.7); g.fillCircle(x - 13, hy - 4, 1.4); g.fillCircle(x + 13, hy - 4, 1.4);
  } },
  // ── 火星殖民 ──
  marsDome: { c: 0xff7a4a, a: 0x8fd45a, draw: (g, now, x, hy, c, a) => {
    // 穹顶头盔：透明穹顶，罩内有小生态
    g.fillStyle(0x8a4a2a, 1); g.fillRoundedRect(x - 14, hy - 6, 28, 7, 3);
    g.fillStyle(0xb8d8e8, 0.4); g.beginPath(); g.arc(x, hy - 6, 14, Math.PI, TAU); g.closePath(); g.fillPath();
    g.lineStyle(1.6, c, 0.9); g.beginPath(); g.arc(x, hy - 6, 14, Math.PI, TAU); g.strokePath();
    g.fillStyle(0x8a4a2a, 1); g.fillRect(x - 12, hy - 6, 24, 3);
    for (let k = 0; k < 3; k++) { g.fillStyle(a, 0.9); g.fillTriangle(x - 7 + k * 6, hy - 6, x - 4 + k * 6, hy - 6, x - 5.5 + k * 6, hy - 14 - (k % 2) * 3); }
    g.fillStyle(0xdff0ff, 0.5); g.fillEllipse(x + 4, hy - 4, 8, 3);
    g.fillStyle(0xffffff, 0.4 + 0.3 * Math.sin(now / 400)); g.fillCircle(x - 6, hy - 12, 2);
  } },
  marsAntenna: { c: 0xd8e0e8, a: 0xff7a4a, draw: (g, now, x, hy, c, a) => {
    // 通讯天线帽：帽顶天线，信号圈循环
    g.fillStyle(0x4a5258, 1); g.fillRoundedRect(x - 12, hy - 5, 24, 6, 3);
    g.fillStyle(c, 0.9); g.fillRoundedRect(x - 11, hy - 4, 22, 4, 2);
    g.fillStyle(0x6a7278, 1); g.fillRect(x - 1.4, hy - 22, 2.8, 18);
    g.fillStyle(a, 0.95); g.fillCircle(x, hy - 23, 2.6);
    for (let k = 0; k < 3; k++) { const ph = ((now / 800 + k / 3) % 1); g.lineStyle(1.4, a, (1 - ph) * 0.7); g.strokeCircle(x, hy - 23, 3 + ph * 11); }
  } },
  // ── 先行者遗迹 ──
  forerHalo: { c: 0xa8e0ff, a: 0x5ad8ff, draw: (g, now, x, hy, c, a) => {
    // 先行者光冠：一圈旋转合金光冠，符文循环亮
    g.fillStyle(0x16242e, 1); g.fillRoundedRect(x - 12, hy - 6, 24, 6, 3);
    g.save(); g.translateCanvas(x, hy - 14); g.scaleCanvas(1, 0.42);
    for (let k = 0; k < 10; k++) { const ang = now / 900 + (k / 10) * TAU; g.fillStyle(k % 2 ? c : a, 0.85); g.fillRect(Math.cos(ang) * 15 - 2, Math.sin(ang) * 15 - 2, 4, 4); }
    g.lineStyle(2, a, 0.5); g.beginPath(); g.arc(0, 0, 15, 0, TAU); g.strokePath();
    g.restore();
    g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 300)); g.fillCircle(x, hy - 14, 4);
  } },
  forerMask: { c: 0x8a9aa8, a: 0x5ad8ff, draw: (g, now, x, hy, c, _a) => {
    // 先行者面具：无面合金面具，眼部光缝左右扫
    g.fillStyle(c, 1); hpoly(g, [[x - 13, hy + 10], [x - 14, hy - 12], [x + 14, hy - 12], [x + 13, hy + 10]], c, 1);
    g.fillStyle(0x5a6a78, 0.7); hpoly(g, [[x - 11, hy + 8], [x - 12, hy - 10], [x + 12, hy - 10], [x + 11, hy + 8]], 0x5a6a78, 0.7);
    g.fillStyle(0x0e1620, 1); g.fillRect(x - 11, hy - 6, 22, 4);
    const scan = Math.sin(now / 600) * 8;
    g.fillStyle(0x5ad8ff, 0.9); g.fillRect(x + scan - 3, hy - 6, 6, 4);
    g.fillStyle(0xffffff, 0.8); g.fillRect(x + scan - 1.4, hy - 5.6, 2.8, 1.6);
    g.fillStyle(0x4a5a68, 0.8); g.fillRect(x - 3, hy + 1, 6, 5);
  } },
};
