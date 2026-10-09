import { type HatArt } from './shared';

/** 第十批头饰（梦境 / 微观 / 炼金 / 毛线 / 画中世界）——帽沿线 (x, hy)，往上 -34、左右 ±20 */

export const HATS_24: Record<string, HatArt> = {
  // ── 梦境回廊 ──
  dreamNightcap: { c: 0x9f8aff, a: 0xfff4d8, draw: (g, now, x, hy, c, a) => {
    // 睡帽：垂坠帽尖 + 铃铛
    const tip = Math.sin(now / 500) * 5;
    g.fillStyle(0x6a5a9a, 1); g.fillPoints([{ x: x - 16, y: hy - 2 }, { x: x + 16, y: hy - 2 }, { x: x + 14 + tip, y: hy - 26 + tip * 0.4 }] as never, true);
    g.fillStyle(c, 1); g.fillPoints([{ x: x - 15, y: hy - 3 }, { x: x + 15, y: hy - 3 }, { x: x + 13 + tip, y: hy - 25 + tip * 0.4 }] as never, true);
    g.fillStyle(a, 1); g.fillRoundedRect(x - 16, hy - 4, 32, 5, 2);
    g.lineStyle(2, c, 1); g.lineBetween(x + 13 + tip, hy - 25 + tip * 0.4, x + 16 + tip * 1.4, hy - 30 + tip * 0.6);
    g.fillStyle(a, 1); g.fillCircle(x + 16 + tip * 1.4, hy - 30 + tip * 0.6, 2.6);
  } },
  dreamSheepHood: { c: 0xf0f0e8, a: 0xffd8e8, draw: (g, now, x, hy, c, a) => {
    // 绵羊头套：卷毛 + 垂耳
    const blink = Math.sin(now / 1300) > 0.92 ? 0.2 : 1;
    g.fillStyle(0xd8d8d0, 1); g.fillCircle(x, hy - 10, 17);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * Math.PI * 2; g.fillStyle(c, 1); g.fillCircle(x + Math.cos(ang) * 13, hy - 10 + Math.sin(ang) * 12, 6); }
    g.fillStyle(0x3a3a3a, 1); g.fillEllipse(x - 5, hy - 10, 3, 3 * blink); g.fillEllipse(x + 5, hy - 10, 3, 3 * blink);
    for (const s of [-1, 1]) { const sw = Math.sin(now / 400 + s) * 2; g.fillStyle(0xd8d8d0, 1); g.fillEllipse(x + s * 15, hy - 6 + sw, 7, 12); }
    g.fillStyle(a, 0.5); g.fillCircle(x - 6, hy - 16, 2); g.fillCircle(x + 7, hy - 17, 1.6);
  } },
  dreamStairCrown: { c: 0xc9b8ff, a: 0xffe08a, draw: (g, now, x, hy, c, a) => {
    // 旋转楼梯冠：盘旋向上的台阶 + 流光
    const rot = now / 1400;
    for (let k = 0; k < 10; k++) { const ang = k * 0.62 + rot; const yy = hy - 4 - k * 3; const xx = x + Math.cos(ang) * (5 + k * 0.6); g.fillStyle(k % 2 ? c : 0x8a78c8, 1); g.fillRect(xx - 4, yy, 9, 3); }
    g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 300)); g.fillCircle(x, hy - 34, 3);
    for (let k = 0; k < 4; k++) { const ph = ((now / 1200 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(x - 8 + k * 6, hy - ph * 34, 1.4); }
  } },
  // ── 微观世界 ──
  microVirusCrown: { c: 0x5fe8d0, a: 0x39ffd0, draw: (g, now, x, hy, c, a) => {
    // 病毒冠：二十面体 + 刺突
    g.fillStyle(0x2a7a8a, 1); g.fillCircle(x, hy - 12, 14); g.fillStyle(c, 1); g.fillCircle(x, hy - 12, 11);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * Math.PI * 2; const px = x + Math.cos(ang) * 15, py = hy - 12 + Math.sin(ang) * 13; g.fillStyle(a, 0.9); g.fillCircle(px, py, 2.4); g.lineStyle(1.6, c, 0.9); g.lineBetween(x + Math.cos(ang) * 10, hy - 12 + Math.sin(ang) * 9, px, py); }
    g.fillStyle(0xffffff, 0.5); g.fillCircle(x - 4, hy - 16, 3);
    void now;
  } },
  microGoggles: { c: 0xd8d8e0, a: 0x39ffd0, draw: (g, now, x, hy, c, a) => {
    // 显微镜目镜：镜筒 + 镜片光扫
    g.fillStyle(0x5a6270, 1); g.fillRoundedRect(x - 10, hy - 34, 20, 22, 4); g.fillStyle(c, 1); g.fillRoundedRect(x - 8, hy - 32, 16, 19, 3);
    g.fillStyle(0x2a3038, 1); g.fillCircle(x, hy - 32, 7); g.fillStyle(a, 0.8); g.fillCircle(x, hy - 32, 5);
    const sw = ((now / 900) % 1) * 2 - 1; g.fillStyle(0xffffff, 0.7); g.fillCircle(x + sw * 3, hy - 32, 1.6);
    g.fillStyle(0x3a3a44, 1); g.fillRect(x - 12, hy - 14, 24, 5);
  } },
  microSpikeHelm: { c: 0x5fe8d0, a: 0x39ffd0, draw: (g, now, x, hy, c, a) => {
    // 刺突头盔：球面带刺
    g.fillStyle(0x2a7a8a, 1); g.fillEllipse(x, hy - 12, 32, 26);
    g.fillStyle(c, 1); g.fillEllipse(x, hy - 12, 28, 22);
    for (let k = 0; k < 6; k++) { const ang = Math.PI + (k / 5) * Math.PI; const px = x + Math.cos(ang) * 14, py = hy - 12 + Math.sin(ang) * 11; g.fillStyle(a, 0.9); g.fillTriangle(px - 3, py, px + 3, py, px + Math.sin(now / 300 + k) * 1.5, py - 9); }
    g.fillStyle(0xffffff, 0.45); g.fillEllipse(x - 5, hy - 18, 8, 5);
  } },
  microDish: { c: 0x5fe8d0, a: 0xff8ad4, draw: (g, now, x, hy, c, a) => {
    // 培养皿帽：皿中菌落
    g.fillStyle(0x2a7a8a, 1); g.fillEllipse(x, hy - 6, 38, 12);
    g.fillStyle(0xc8f0e0, 0.85); g.fillEllipse(x, hy - 8, 34, 10);
    for (let k = 0; k < 6; k++) { const px = x - 13 + k * 5.2, py = hy - 8; const on = 0.4 + 0.5 * Math.abs(Math.sin(now / 500 + k)); g.fillStyle(k % 2 ? c : a, on); g.fillCircle(px, py, 2.4); }
    g.fillStyle(0x2a7a8a, 1); g.fillRoundedRect(x - 19, hy - 6, 38, 4, 2);
  } },
  // ── 炼金工坊 ──
  alchGoggles: { c: 0x8a6a2a, a: 0x7dff6a, draw: (g, now, x, hy, c, a) => {
    // 炼金护目镜：铜框多镜片 + 齿轮
    g.fillStyle(0x5a4228, 1); g.fillRoundedRect(x - 19, hy - 16, 38, 14, 6);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 18, hy - 15, 36, 12, 5);
    for (let k = 0; k < 3; k++) { const px = x - 11 + k * 11; g.fillStyle(0x2a3a2a, 1); g.fillCircle(px, hy - 9, 5.4); g.fillStyle(a, 0.8); g.fillCircle(px, hy - 9, 4); const sw = ((now / 700 + k / 3) % 1) * 2 - 1; g.fillStyle(0xffffff, 0.7); g.fillCircle(px + sw * 2, hy - 9, 1.2); }
    g.save(); g.translateCanvas(x + 16, hy - 13); g.rotateCanvas(now / 700); g.fillStyle(0xd8a24a, 1); g.fillCircle(0, 0, 4); g.fillStyle(0x5a4228, 1); g.fillCircle(0, 0, 1.6); g.fillRect(-0.8, -4, 1.6, 8); g.fillRect(-4, -0.8, 8, 1.6); g.restore();
  } },
  alchHood: { c: 0x3a5a2a, a: 0x7dff6a, draw: (g, now, x, hy, c, _a) => {
    // 术士兜帽：尖兜帽 + 药气
    const bend = Math.sin(now / 600) * 5;
    g.fillStyle(0x243a1e, 1); g.fillPoints([{ x: x - 18, y: hy + 2 }, { x: x + 18, y: hy + 2 }, { x: x + 6, y: hy - 22 }, { x: x + bend, y: hy - 34 }] as never, true);
    g.fillStyle(c, 1); g.fillPoints([{ x: x - 16, y: hy + 1 }, { x: x - 8, y: hy - 18 }, { x: x + 2 + bend * 0.6, y: hy - 30 }, { x: x + 12, y: hy - 16 }, { x: x + 16, y: hy + 1 }] as never, true);
    g.fillStyle(0x18280f, 0.9); g.fillEllipse(x, hy - 4, 22, 10);
  } },
  // ── 毛线世界 ──
  yarnBeanie: { c: 0xffb7d5, a: 0xffd8e8, draw: (g, now, x, hy, c, a) => {
    // 毛线帽：绒球 + 针织纹
    const bob = Math.sin(now / 300) * 2;
    g.fillStyle(0xa86a8a, 1); g.fillRoundedRect(x - 16, hy - 16, 32, 16, 8);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 15, hy - 15, 30, 14, 7);
    for (let k = 0; k < 4; k++) { g.lineStyle(1.4, a, 0.8); g.lineBetween(x - 13 + k * 8, hy - 14, x - 13 + k * 8, hy - 2); }
    g.fillStyle(0xa86a8a, 0.9); g.fillRect(x - 15, hy - 4, 30, 4);
    g.fillStyle(a, 1); g.fillCircle(x, hy - 18 + bob, 5);
    void a;
  } },
  yarnButtonBand: { c: 0xffb7d5, a: 0xffd8e8, draw: (g, now, x, hy, c, a) => {
    // 纽扣发带：发带 + 纽扣
    const sway = Math.sin(now / 500) * 4;
    g.fillStyle(c, 1); g.fillRoundedRect(x - 17, hy - 8, 34, 7, 3);
    for (let k = 0; k < 3; k++) { const px = x - 11 + k * 11; g.fillStyle(a, 1); g.fillCircle(px, hy - 5, 4); g.fillStyle(0x6a4a5a, 1); g.fillCircle(px - 1.3, hy - 5, 0.8); g.fillCircle(px + 1.3, hy - 5, 0.8); }
    g.lineStyle(2, c, 1); g.lineBetween(x + 16, hy - 8, x + 22 + sway, hy - 16);
    g.fillStyle(0xffe040, 1); g.fillCircle(x + 22 + sway, hy - 17, 2);
  } },
  yarnBobbleHat: { c: 0xffb7d5, a: 0xffd8e8, draw: (g, now, x, hy, c, a) => {
    // 绒球帽：多绒球
    const bob = Math.sin(now / 320) * 2;
    g.fillStyle(0xa86a8a, 1); g.fillRoundedRect(x - 17, hy - 14, 34, 14, 7);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 16, hy - 13, 32, 12, 6);
    for (let k = 0; k < 3; k++) { g.fillStyle(a, 1); g.fillCircle(x - 9 + k * 9, hy - 16 + Math.sin(now / 300 + k) * 1.5, 5); }
    void bob;
  } },
  // ── 画中世界 ──
  paintBeret: { c: 0x3a3a52, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 画家贝雷帽：歪戴 + 帽穗
    const tilt = Math.sin(now / 700) * 0.05;
    g.save(); g.translateCanvas(x, hy - 8); g.rotateCanvas(-0.15 + tilt);
    g.fillStyle(0x2a2a3e, 1); g.fillEllipse(2, 0, 40, 22);
    g.fillStyle(c, 1); g.fillEllipse(0, -1, 36, 18);
    g.fillStyle(0x2a2a3e, 1); g.fillRect(-16, 4, 32, 4);
    g.restore();
    g.fillStyle(a, 1); g.fillCircle(x + 2, hy - 26, 3);
  } },
  paintFrameHat: { c: 0xa8763a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 画框头饰：额头一副空画框
    g.fillStyle(c, 1); g.fillRect(x - 18, hy - 26, 36, 24);
    g.fillStyle(0x2a1c10, 1); g.fillRect(x - 14, hy - 22, 28, 16);
    const sw = ((now / 800) % 1) * 2 - 1; g.fillStyle(a, 0.3 + 0.3 * Math.abs(sw)); g.fillRect(x - 14, hy - 22, 28, 16);
    g.fillStyle(0xffffff, 0.6); g.fillRect(x - 14 + (sw * 0.5 + 0.5) * 28 - 1, hy - 22, 2, 16);
    g.fillStyle(a, 1); g.fillCircle(x - 14, hy - 26, 1.6); g.fillCircle(x + 14, hy - 26, 1.6); g.fillCircle(x - 14, hy - 2, 1.6); g.fillCircle(x + 14, hy - 2, 1.6);
  } },
  paintPaletteCrown: { c: 0xcea070, a: 0xffd45c, draw: (g, now, x, hy, c, _a) => {
    // 调色盘冠：颜料格 + 颜料滴
    const cols = [0xff4a4a, 0xffd45c, 0x7dff9a, 0x5ac8ff, 0xff8ad4];
    g.fillStyle(0x8a6a3a, 1); g.fillRoundedRect(x - 20, hy - 14, 40, 14, 6);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 19, hy - 13, 38, 12, 5);
    for (let k = 0; k < 5; k++) { g.fillStyle(cols[k], 1); g.fillCircle(x - 13 + k * 6.5, hy - 8, 2.6); }
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle(cols[k], (1 - ph) * 0.9); g.fillEllipse(x - 8 + k * 8, hy - 3 + ph * 6, 2, 3); }
    g.lineStyle(2, 0x8a6a3a, 1); g.lineBetween(x + 16, hy - 12, x + 20, hy - 22);
    g.fillStyle(0x6a4a2a, 1); g.fillEllipse(x + 22, hy - 26, 4, 8);
  } },
  paintBrushHat: { c: 0x8a6a3a, a: 0xff8ad4, draw: (g, now, x, hy, c, a) => {
    // 画笔头饰：头顶一支画笔
    const tilt = Math.sin(now / 500) * 0.08;
    g.save(); g.translateCanvas(x, hy - 6); g.rotateCanvas(-0.2 + tilt);
    g.fillStyle(0x9a9aa8, 1); g.fillRoundedRect(-3, -30, 6, 24, 2);
    g.fillStyle(c, 1); g.fillRect(-4, -6, 8, 6);
    g.fillStyle(0x8a6a2a, 1); g.fillPoints([{ x: -3, y: -30 }, { x: 3, y: -30 }, { x: 1, y: -42 }, { x: -1, y: -42 }] as never, true);
    g.fillStyle(a, 1); g.fillCircle(0, -43, 3);
    g.restore();
    for (let k = 0; k < 3; k++) { g.fillStyle(a, 0.7); g.fillCircle(x + 4 + k * 3, hy - 8 - k * 3, 1.4); }
  } },
};
