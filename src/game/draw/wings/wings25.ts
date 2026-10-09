import { type WingArt } from './shared';

/**
 * 第七批背部装饰（纳米矩阵 / 数据洪流 / 曲速跃迁 / 火星殖民 / 先行者遗迹）——全部是
 * **背挂物件**（`single: true`，只画一次、不镜像、不挥动），不做翅膀。挂肩高度锚点 topY+48。
 */

export const WINGS_25: Record<string, WingArt> = {
  // ── 纳米矩阵 ──
  nanoCore: { c: 0x7fe8ff, a: 0x39ffd0, single: true, draw: (g, now, _flap, c, a) => {
    // 纳米母核背架：一颗脉动母核，表面格子流动、微粒绕行
    const pulse = 0.5 + 0.5 * Math.sin(now / 320);
    g.fillStyle(a, 0.2 * pulse); g.fillCircle(0, 0, 26);
    for (let k = 0; k < 12; k++) { const ang = now / 2600 + (k / 12) * Math.PI * 2; g.fillStyle(c, 0.85); g.fillCircle(Math.cos(ang) * 18, Math.sin(ang) * 18, 2.6); }
    g.fillStyle(0x123048, 1); g.fillCircle(0, 0, 14);
    g.fillStyle(c, 1); g.fillCircle(0, 0, 11);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2; g.lineStyle(1.2, 0xffffff, 0.5); g.lineBetween(0, 0, Math.cos(ang) * 10, Math.sin(ang) * 10); }
    g.fillStyle(0xffffff, 0.7 + 0.3 * pulse); g.fillCircle(0, 0, 3.4);
    for (let k = 0; k < 4; k++) { const ph = ((now / 700 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(Math.sin(k * 2) * 14, -ph * 24, 1.3); }
  } },
  nanoSpirePack: { c: 0x4affd0, a: 0x7fe8ff, single: true, draw: (g, now, _flap, c, a) => {
    // 纳米尖塔背架：一根尖塔，塔身方块逐层亮起
    const lit = (now / 500) % 6;
    g.fillStyle(0x0e2a30, 1); g.fillPoints([{ x: -10, y: 24 }, { x: 10, y: 24 }, { x: 0, y: -30 }] as never, true);
    for (let k = 0; k < 6; k++) { const yy = 18 - k * 8; const w = 9 - k * 1.3; const on = Math.max(0, 1 - Math.abs(lit - k)); g.fillStyle(c, 0.4 + 0.6 * on); g.fillRect(-w, yy - 4, w * 2, 6); g.fillStyle(0xffffff, 0.3 * on); g.fillRect(-w, yy - 4, w * 2, 1.6); }
    g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 300)); g.fillCircle(0, -30, 2.6);
  } },
  // ── 数据洪流 ──
  dataServer: { c: 0x2a3a52, a: 0x4affc4, single: true, draw: (g, now, _flap, c, a) => {
    // 数据服务器：一组机架，指示灯循环闪、排风扇转
    g.fillStyle(0x141e2c, 1); g.fillRoundedRect(-16, -24, 32, 48, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-14, -22, 28, 44, 2);
    for (let r = 0; r < 5; r++) {
      const yy = -18 + r * 9;
      g.fillStyle(0x0c1420, 1); g.fillRect(-12, yy, 24, 6);
      g.fillStyle(a, 0.3); g.fillRect(-12, yy, 24, 1.4);
      const blink = Math.sin(now / 200 + r * 1.3) > 0 ? 1 : 0.3;
      g.fillStyle(a, blink); g.fillCircle(-8, yy + 3, 1.4);
      g.fillStyle(0xff5a5a, blink > 0.5 ? 1 : 0.3); g.fillCircle(8, yy + 3, 1.4);
      const fan = now / 90 + r;
      g.lineStyle(1, 0x8fb0c8, 0.6); g.lineBetween(0, yy + 3, Math.cos(fan) * 4, yy + 3 + Math.sin(fan) * 4);
    }
    for (let k = 0; k < 4; k++) { const ph = ((now / 600 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.6); g.fillCircle(18, 24 - ph * 30, 1.4); }
  } },
  dataDisk: { c: 0x4affc4, a: 0x7fb8ff, single: true, draw: (g, now, _flap, c, _a) => {
    // 数据磁盘：一块巨盘，读写光点扫过盘面
    g.fillStyle(0x14262a, 1); g.fillRect(-22, -20, 44, 40);
    g.fillStyle(c, 1); g.fillRect(-20, -18, 40, 36);
    for (let k = 0; k < 5; k++) { g.fillStyle(0x0a1a1e, 0.6); g.fillRect(-20, -16 + k * 7, 40, 1.6); }
    const scan = ((now / 900) % 1) * 2 - 1;
    g.fillStyle(0xffffff, 0.55); g.fillRect(-20, scan * 18, 40, 2.4);
    for (let k = 0; k < 6; k++) { g.fillStyle(0x4affc4, 0.9); g.fillCircle(-16 + k * 6.4, -14 + (k * 5 % 30), 1.4); }
    g.fillStyle(0x1a2a2e, 1); g.fillCircle(0, 0, 4);
  } },
  // ── 曲速跃迁 ──
  warpGate: { c: 0x9fd8ff, a: 0xa98cff, single: true, draw: (g, now, _flap, c, a) => {
    // 星门碎片背架：一块悬浮星门碎片，边缘发光、内部星空漩涡
    g.fillStyle(0x1a2450, 1); g.fillCircle(0, 0, 22);
    g.fillStyle(c, 0.9); g.beginPath(); g.arc(0, 0, 21, 0, Math.PI * 2); g.strokePath();
    g.lineStyle(3, a, 0.7 + 0.3 * Math.sin(now / 300)); g.strokeCircle(0, 0, 21);
    g.fillStyle(0x05060f, 0.95); g.fillCircle(0, 0, 16);
    for (let arm = 0; arm < 3; arm++) { const off = now / 300 + arm * 2.1; g.lineStyle(2, a, 0.6); g.beginPath(); for (let s = 0; s <= 8; s++) { const u = s / 8; const ang = off + u * 3; const rr = u * 15; const px = Math.cos(ang) * rr, py = Math.sin(ang) * rr; if (s === 0) g.moveTo(px, py); else g.lineTo(px, py); } g.strokePath(); }
    g.fillStyle(0xffffff, 0.8); g.fillCircle(0, 0, 2.4);
    for (let k = 0; k < 5; k++) { const ang = (k / 5) * Math.PI * 2 + now / 1400; g.fillStyle(c, 0.8); g.fillCircle(Math.cos(ang) * 21, Math.sin(ang) * 21, 2); }
  } },
  warpDrive: { c: 0x5a7aff, a: 0xa98cff, single: true, draw: (g, now, _flap, c, a) => {
    // 曲速引擎背架：两只引擎，尾焰错相脉动
    for (const s of [-1, 1]) {
      g.fillStyle(0x1a2450, 1); g.fillRoundedRect(s * 10 - 6, -18, 12, 32, 4);
      g.fillStyle(c, 1); g.fillRoundedRect(s * 10 - 5, -17, 10, 28, 3);
      g.fillStyle(0x9fd8ff, 0.6); g.fillRect(s * 10 - 5, -10, 10, 2);
      const fl = 0.5 + 0.5 * Math.sin(now / 200 + (s > 0 ? 0 : Math.PI));
      g.fillStyle(0xff7a2a, 0.85); g.fillTriangle(s * 10 - 5, 15, s * 10 + 5, 15, s * 10, 15 + 12 + fl * 8);
      g.fillStyle(0xfff0b0, 0.9); g.fillTriangle(s * 10 - 3, 15, s * 10 + 3, 15, s * 10, 15 + 8 + fl * 5);
    }
    g.fillStyle(0x0e1428, 1); g.fillRect(-8, -4, 16, 8);
    g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 300)); g.fillCircle(0, 0, 3);
  } },
  // ── 火星殖民 ──
  marsDrill: { c: 0xb0562a, a: 0xff7a4a, single: true, draw: (g, now, _flap, c, a) => {
    // 钻探背架：一台钻机，钻头旋转、火星尘飞
    g.fillStyle(0x6a3a1a, 1); g.fillRoundedRect(-14, -20, 28, 22, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(-12, -18, 24, 18, 3);
    g.fillStyle(0x3a2410, 1); g.fillRect(-9, -14, 18, 4);
    // 钻头
    const spin = now / 60;
    g.fillStyle(0xd8d0c0, 1);
    for (let k = 0; k < 5; k++) { const w = 9 - k * 1.6; const yy = 2 + k * 4; g.save(); g.translateCanvas(0, yy); g.rotateCanvas(spin * (k % 2 ? 1 : -1)); g.fillPoints([{ x: -w, y: 2 }, { x: w, y: 2 }, { x: w * 0.5, y: -2 }, { x: -w * 0.5, y: -2 }] as never, true); g.restore(); }
    g.fillStyle(0x9a9078, 1); g.fillTriangle(-3, 22, 3, 22, 0, 28);
    for (let k = 0; k < 4; k++) { const ph = ((now / 700 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(-10 + k * 7, 26 - ph * 22, 1.6); }
  } },
  marsTank: { c: 0xd8e0e8, a: 0xff7a4a, single: true, draw: (g, now, _flap, c, a) => {
    // 氧气背罐：两只罐，阀门循环冒白汽
    for (const s of [-1, 1]) {
      g.fillStyle(0x9aa4ac, 1); g.fillRoundedRect(s * 8 - 6, -18, 12, 34, 6);
      g.fillStyle(c, 1); g.fillRoundedRect(s * 8 - 5, -17, 10, 32, 5);
      g.fillStyle(0xff5a2a, 0.9); g.fillRect(s * 8 - 5, -6, 10, 4);
      g.fillStyle(0x8a9298, 1); g.fillRect(s * 8 - 2, -22, 4, 6);
    }
    g.fillStyle(0x5a626a, 1); g.fillRect(-6, -4, 12, 4);
    for (let k = 0; k < 3; k++) { const ph = ((now / 800 + k / 3) % 1); g.fillStyle(0xffffff, 0.6 * (1 - ph)); g.fillCircle(-6 + k * 6 + Math.sin(now / 500 + k) * 3, -24 - ph * 16, 2 - ph * 1.4); }
    void a;
  } },
  // ── 先行者遗迹 ──
  forerMonolith: { c: 0xa8e0ff, a: 0x5ad8ff, single: true, draw: (g, now, _flap, c, a) => {
    // 符文碑背架：一块悬浮符文碑，符文竖直滚动、碑体微浮
    const float = Math.sin(now / 500) * 2;
    g.save(); g.translateCanvas(0, float);
    g.fillStyle(0x1a2836, 1); g.fillRoundedRect(-13, -30, 26, 60, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(-11, -28, 22, 56, 3);
    g.fillStyle(0x0e1a24, 0.8); g.fillRect(-11, -28, 22, 3); g.fillRect(-11, 25, 22, 3);
    const scroll = (now / 500) % 1;
    for (let k = 0; k < 6; k++) { const t = ((k / 6) + scroll) % 1; const lit = 0.4 + 0.6 * Math.max(0, 1 - Math.abs(t - 0.5) * 2); g.lineStyle(1.8, a, lit); g.lineBetween(-7, -24 + t * 48, 7, -24 + t * 48); g.lineBetween(-2, -27 + t * 48, -2, -21 + t * 48); }
    g.restore();
    g.fillStyle(a, 0.3); g.fillEllipse(0, 32, 26, 6);
  } },
  forerSentinel: { c: 0x5ad8ff, a: 0xa8e0ff, single: true, draw: (g, now, _flap, c, a) => {
    // 哨戒模块：一个哨戒模块，环形扫描 + 指示灯循环
    g.fillStyle(0x16242e, 1); g.fillCircle(0, 0, 15);
    g.fillStyle(c, 1); g.fillCircle(0, 0, 12);
    g.fillStyle(0x0a141c, 1); g.fillCircle(0, 0, 7);
    const scan = now / 500;
    g.lineStyle(2, a, 0.8); g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(scan) * 13, Math.sin(scan) * 13); g.strokePath();
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * Math.PI * 2; g.fillStyle(a, 0.5 + 0.5 * Math.abs(Math.sin(now / 300 + k))); g.fillCircle(Math.cos(ang) * 13, Math.sin(ang) * 13, 1.4); }
    g.fillStyle(0xffffff, 0.8); g.fillCircle(0, 0, 2.2);
  } },
};
