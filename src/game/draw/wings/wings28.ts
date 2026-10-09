import { TAU, type WingArt } from './shared';

/**
 * 第十批背部装饰（梦境 / 微观 / 炼金 / 毛线 / 画中世界）——全部 `single: true` 背挂物件。
 * 局部原点 = 肩锚，画一次、不镜像。
 */

export const WINGS_28: Record<string, WingArt> = {
  // ── 梦境回廊 ──
  dreamPillowPack: { c: 0xb8a8e8, a: 0xfff4d8, single: true, draw: (g, now, _flap, c, a) => {
    // 枕头背包：软枕 + 飘羽毛
    const sq = 1 - 0.05 * Math.abs(Math.sin(now / 500));
    g.fillStyle(0x6a5a9a, 1); g.fillRoundedRect(-18, -6, 36, 34, 12);
    g.fillStyle(c, 1); g.fillRoundedRect(-17, -5, 34, 30 * sq, 11);
    g.fillStyle(a, 0.5); g.fillEllipse(0, 2, 22, 10);
    g.fillStyle(0x8a78c8, 1); g.fillRoundedRect(-17, 20, 34, 7, 3);
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillEllipse(-10 + k * 9, 6 - ph * 20, 5, 2); }
  } },
  dreamLadder: { c: 0xc9b8ff, a: 0x9f8aff, single: true, draw: (g, now, _flap, c, a) => {
    // 云梯背架：云上木梯
    const sway = Math.sin(now / 700) * 1.5;
    g.fillStyle(0x8a78c8, 1); g.fillRect(-10 + sway, -34, 4, 64); g.fillRect(6 + sway, -34, 4, 64);
    for (let k = 0; k < 5; k++) { g.fillStyle(c, 1); g.fillRoundedRect(-10 + sway, -30 + k * 14, 20, 5, 2); }
    g.fillStyle(0xffffff, 0.5); g.fillEllipse(-8 + sway, -36, 12, 6); g.fillEllipse(6 + sway, -36, 12, 6); g.fillEllipse(0 + sway, -38, 10, 5);
    void a;
  } },
  dreamLantern: { c: 0xc9b8ff, a: 0xffe08a, single: true, draw: (g, now, _flap, c, a) => {
    // 梦灯：一盏晃动的灯笼
    const sw = Math.sin(now / 500) * 4;
    g.lineStyle(2, 0x8a78c8, 1); g.lineBetween(0, -30, sw, -14);
    g.fillStyle(0x8a78c8, 1); g.fillRoundedRect(sw - 11, -14, 22, 28, 5);
    g.fillStyle(c, 0.85); g.fillRoundedRect(sw - 9, -12, 18, 24, 4);
    g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 300)); g.fillEllipse(sw, 0, 12, 18);
    g.fillStyle(a, 0.85); g.fillCircle(sw, 0, 3);
    g.fillStyle(0x8a78c8, 1); g.fillRect(sw - 6, 14, 12, 4);
  } },
  dreamAlarmClock: { c: 0xd8d8e0, a: 0xffe08a, single: true, draw: (g, now, _flap, c, a) => {
    // 闹钟背包：指针转 + 铃晃
    g.fillStyle(0x8a8a92, 1); g.fillCircle(0, 8, 20); g.fillStyle(c, 1); g.fillCircle(0, 8, 17);
    g.fillStyle(0xfff4d8, 1); g.fillCircle(0, 8, 13);
    g.lineStyle(1.6, 0x3a3a44, 0.8); for (let k = 0; k < 12; k++) { const ang = (k / 12) * TAU; g.lineBetween(Math.cos(ang) * 10, 8 + Math.sin(ang) * 10, Math.cos(ang) * 12.4, 8 + Math.sin(ang) * 12.4); }
    const t = now / 900; g.lineStyle(2, 0x2a2a34, 1); g.lineBetween(0, 8, Math.cos(t) * 9, 8 + Math.sin(t) * 9); g.lineBetween(0, 8, Math.cos(t * 12) * 11, 8 + Math.sin(t * 12) * 11);
    for (const s of [-1, 1]) { g.fillStyle(0x8a8a92, 1); g.fillCircle(s * 16, -10 + Math.sin(now / 150) * 1.5, 5); }
    g.fillStyle(0x8a8a92, 1); g.fillRect(-16, 26, 12, 4); g.fillRect(4, 26, 12, 4);
    void a;
  } },
  dreamBalloonPack: { c: 0xff8ad4, a: 0x9f8aff, single: true, draw: (g, now, _flap, c, a) => {
    // 气球背束：一束飘动气球
    g.fillStyle(0x8a78c8, 1); g.fillRoundedRect(-12, 16, 24, 16, 5);
    const cols = [0xff8ad4, 0x9f8aff, 0x7dffd0, 0xffe040];
    for (let k = 0; k < 4; k++) { const bx = -12 + k * 8 + Math.sin(now / 600 + k) * 3, by = -18 - (k % 2) * 6 + Math.cos(now / 700 + k) * 3; g.lineStyle(1, 0xffffff, 0.6); g.lineBetween(0, 14, bx, by + 9); g.fillStyle(cols[k], 1); g.fillEllipse(bx, by, 12, 15); g.fillStyle(0xffffff, 0.5); g.fillEllipse(bx - 3, by - 4, 4, 6); }
    void a; void c;
  } },
  dreamDoorway: { c: 0x7a6ab0, a: 0x9f8aff, single: true, draw: (g, now, _flap, _c, a) => {
    // 任意门：立起的门，门缝漏光
    g.fillStyle(0x4a3a78, 1); g.fillRoundedRect(-16, -34, 32, 66, 4);
    g.fillStyle(0x6a5a9a, 1); g.fillRoundedRect(-13, -31, 26, 60, 3);
    const open = 0.5 + 0.5 * Math.sin(now / 900);
    g.fillStyle(a, 0.3 + 0.5 * open); g.fillRect(-10, -28, 20, 54);
    g.fillStyle(0xffffff, 0.6 + 0.3 * open); g.fillRect(-2 - open * 2, -28, 2 + open * 3, 54);
    g.fillStyle(0xffe08a, 1); g.fillCircle(9, 0, 2);
    for (let k = 0; k < 4; k++) { const ph = ((now / 1100 + k / 4) % 1); g.fillStyle(0xffe08a, (1 - ph) * 0.8); g.fillCircle(-6 + k * 5, 24 - ph * 50, 1.4); }
  } },
  // ── 微观世界 ──
  microDnaPack: { c: 0x5fe8d0, a: 0x39ffd0, single: true, draw: (g, now, _flap, c, a) => {
    // DNA 背架：双螺旋旋转 + 碱基闪
    const rot = now / 800;
    for (const side of [-1, 1]) { g.lineStyle(3, c, 0.9); g.beginPath(); for (let k = 0; k <= 20; k++) { const yy = -32 + k * 3.2; const xx = Math.sin(k * 0.5 + rot + (side > 0 ? 0 : Math.PI)) * 9; if (k === 0) g.moveTo(xx, yy); else g.lineTo(xx, yy); } g.strokePath(); }
    for (let k = 0; k < 8; k++) { const yy = -30 + k * 8; const p = Math.sin(k * 0.5 + rot); g.fillStyle(k % 2 ? a : 0xff8ad4, 0.5 + 0.5 * Math.abs(p)); g.fillCircle(p * 9, yy, 1.8); g.lineStyle(1, 0x2a7a8a, 0.5); g.lineBetween(p * 9, yy, -p * 9, yy); }
  } },
  microMitochondria: { c: 0x5fe8d0, a: 0xff8ad4, single: true, draw: (g, now, _flap, c, a) => {
    // 线粒体背包：膜呼吸 + 嵴摆动
    const breathe = Math.sin(now / 500) * 1.2;
    g.fillStyle(0x2a7a8a, 1); g.fillEllipse(0, 0, 38 + breathe, 56);
    g.fillStyle(c, 0.85); g.fillEllipse(0, 0, 34 + breathe, 50);
    for (let k = 0; k < 5; k++) { const sw = Math.sin(now / 400 + k) * 2; g.lineStyle(2, 0x2a7a8a, 0.8); g.lineBetween(-12 + sw, -20 + k * 10, 12 + sw, -14 + k * 10); }
    for (let k = 0; k < 3; k++) { g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 300 + k)); g.fillCircle(-10 + k * 10, 12, 1.6); }
  } },
  microProtein: { c: 0x39ffd0, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 蛋白折叠包：自行折叠重组
    const pts: Array<[number, number]> = [];
    for (let k = 0; k <= 14; k++) { const ang = k * 0.9 + now / 700; const rr = 6 + k * 2.2; pts.push([Math.cos(ang) * rr, -30 + k * 4.2]); }
    g.lineStyle(4, c, 0.95); g.beginPath(); pts.forEach((p, i) => { if (i === 0) g.moveTo(p[0], p[1]); else g.lineTo(p[0], p[1]); }); g.strokePath();
    for (let k = 0; k < pts.length; k += 2) { g.fillStyle(k % 4 ? 0x5fe8d0 : a, 0.9); g.fillCircle(pts[k][0], pts[k][1], 2); }
    for (let k = 0; k < 4; k++) { const ph = ((now / 1200 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(-14 + k * 9, -40 - ph * 10, 1.4); }
  } },
  microFlagellum: { c: 0x5fe8d0, a: 0x39ffd0, single: true, draw: (g, now, _flap, c, a) => {
    // 鞭毛背束：波摆
    g.fillStyle(0x2a7a8a, 1); g.fillRoundedRect(-8, 6, 16, 20, 4);
    for (let s = 0; s < 5; s++) { g.lineStyle(2.4, s % 2 ? c : a, 0.9); g.beginPath(); for (let k = 0; k <= 10; k++) { const yy = 6 - k * 5; const xx = 10 + Math.sin(k * 0.6 + now / 300 + s) * 10 + s * 5; if (k === 0) g.moveTo(8, yy); else g.lineTo(xx, yy); } g.strokePath(); }
  } },
  microRibosome: { c: 0x5fe8d0, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 核糖体背篓：两亚基开合
    const gap = 2 + Math.abs(Math.sin(now / 500)) * 4;
    g.fillStyle(0x2a7a8a, 1); g.fillCircle(0, -8 - gap, 16); g.fillStyle(c, 1); g.fillCircle(0, -8 - gap, 13);
    g.fillStyle(0x2a7a8a, 1); g.fillCircle(0, 12 + gap, 13); g.fillStyle(c, 0.9); g.fillCircle(0, 12 + gap, 10);
    for (let k = 0; k < 3; k++) { g.fillStyle(a, 0.8); g.fillCircle(-6 + k * 6, -26, 1.6); }
    g.fillStyle(0x2a7a8a, 1); g.fillRoundedRect(-16, 18, 32, 8, 3);
  } },
  // ── 炼金工坊 ──
  alchPhilosopher: { c: 0xb02a2a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 点金石背匣：悬浮红石 + 点金粒
    g.fillStyle(0x3a2a14, 1); g.fillRoundedRect(-20, -6, 40, 40, 5);
    g.fillStyle(0x6a4a24, 1); g.fillRoundedRect(-18, -4, 36, 36, 4);
    g.lineStyle(1.4, a, 0.6); for (let k = 0; k < 3; k++) { g.strokeRect(-14 + k * 10, -1, 6, 6); }
    const bob = Math.sin(now / 500) * 2;
    g.fillStyle(c, 0.4 + 0.4 * Math.abs(Math.sin(now / 300))); g.fillCircle(0, 8 + bob, 14);
    g.fillStyle(c, 1); g.fillPoints([{ x: 0, y: 8 + bob - 10 }, { x: 7, y: 8 + bob }, { x: 0, y: 8 + bob + 10 }, { x: -7, y: 8 + bob }] as never, true);
    g.fillStyle(0xffe08a, 0.9); g.fillTriangle(0, 8 + bob - 10, 0, 8 + bob, 7, 8 + bob);
    for (let k = 0; k < 4; k++) { const ph = ((now / 1000 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(-10 + k * 7, 34 - ph * 40, 1.6); }
  } },
  alchFlask: { c: 0x7dff6a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 药剂背架：几支药剂瓶
    for (let k = 0; k < 3; k++) { const bx = -12 + k * 12; g.fillStyle(0x9fd8ff, 0.5); g.fillRoundedRect(bx - 5, -14 - k, 10, 22 + k, 4); g.fillStyle(0xffffff, 0.5); g.fillRect(bx - 3, -12 - k, 2, 16); }
    g.fillStyle(c, 0.85); g.fillRoundedRect(-17, 2, 10, 22, 4); g.fillStyle(0xff8ad4, 0.85); g.fillRoundedRect(-5, 2, 10, 24, 4); g.fillStyle(a, 0.85); g.fillRoundedRect(7, 2, 10, 20, 4);
    for (let k = 0; k < 2; k++) { const ph = ((now / 900 + k / 2) % 1); g.fillStyle(0xd0ffd0, (1 - ph) * 0.6); g.fillCircle(-12 + k * 12, 20 - ph * 10, 1.4); }
  } },
  // ── 毛线世界 ──
  yarnBallPack: { c: 0xffb7d5, a: 0xffd8e8, single: true, draw: (g, now, _flap, c, a) => {
    // 毛线球背篓：球缓转 + 线头
    g.fillStyle(0x8a5a7a, 1); g.fillRoundedRect(-16, -2, 32, 34, 5);
    g.fillStyle(0xa86a8a, 1); g.fillRoundedRect(-14, 0, 28, 30, 4);
    g.save(); g.translateCanvas(0, 12); g.rotateCanvas(now / 1200);
    g.fillStyle(c, 1); g.fillCircle(0, 0, 14);
    g.lineStyle(1.4, a, 0.9); for (let k = 0; k < 4; k++) { const ang = (k / 4) * TAU; g.lineBetween(Math.cos(ang) * 13, Math.sin(ang) * 13, Math.cos(ang + 2) * 13, Math.sin(ang + 2) * 13); }
    g.restore();
    g.lineStyle(1.4, a, 0.8); g.beginPath(); g.moveTo(8, 16); g.lineTo(20, 24 + Math.sin(now / 500) * 3); g.strokePath();
  } },
  yarnNeedles: { c: 0xd8d8e0, a: 0xffb7d5, single: true, draw: (g, now, _flap, c, a) => {
    // 织针背架：交叉织针
    const sw = Math.sin(now / 600) * 2;
    for (const s of [-1, 1]) { g.save(); g.rotateCanvas(s * 0.5 + s * sw * 0.02); g.fillStyle(c, 1); g.fillRoundedRect(-2, -34, 4, 62, 2); g.fillStyle(0x9a9aa8, 1); g.fillCircle(0, -34, 3); g.restore(); }
    g.lineStyle(3, a, 0.9); g.beginPath(); for (let k = 0; k <= 8; k++) { const ang = k * 0.9 + now / 500; g.lineTo(Math.cos(ang) * 8, 6 + Math.sin(ang) * 12); } g.strokePath();
  } },
  yarnSweaterRoll: { c: 0xffb7d5, a: 0xffd8e8, single: true, draw: (g, now, _flap, c, a) => {
    // 毛衣卷：一卷毛衣
    const sway = Math.sin(now / 800) * 1;
    g.fillStyle(0x8a5a7a, 1); g.fillRoundedRect(-18, -10, 36, 40, 8);
    g.fillStyle(c, 1); g.fillRoundedRect(-16, -8, 32, 36, 7);
    for (let k = 0; k < 4; k++) { g.lineStyle(1.4, a, 0.8); g.lineBetween(-14, -4 + k * 9, 14, -2 + k * 9); }
    g.fillStyle(0xd8d8e0, 1); g.fillCircle(0, -2, 2); g.fillCircle(0, 12, 2);
    g.lineStyle(2, a, 0.9); g.beginPath(); g.moveTo(14, 22); g.lineTo(22 + sway, 30); g.strokePath();
  } },
  yarnButtonChest: { c: 0xffb7d5, a: 0xffd8e8, single: true, draw: (g, now, _flap, _c, a) => {
    // 纽扣箱：一箱纽扣
    g.fillStyle(0x8a5a7a, 1); g.fillRoundedRect(-16, -6, 32, 36, 4);
    g.fillStyle(0xa86a8a, 1); g.fillRoundedRect(-14, -4, 28, 32, 3);
    const cols = [0xffb7d5, 0x9fd8ff, 0xffe040, 0xa8ff7a];
    for (let k = 0; k < 5; k++) { const bx = -9 + (k % 3) * 9, by = 0 + Math.floor(k / 3) * 10 + Math.sin(now / 600 + k) * 1; g.fillStyle(cols[k % 4], 1); g.fillCircle(bx, by, 4.4); g.fillStyle(0x6a4a5a, 1); g.fillCircle(bx - 1.4, by, 0.8); g.fillCircle(bx + 1.4, by, 0.8); }
    void a;
  } },
  yarnSpoolCrate: { c: 0x8a6a3a, a: 0xffb7d5, single: true, draw: (g, now, _flap, c, a) => {
    // 线轴背箱：木箱里的线轴
    g.fillStyle(0x5a4228, 1); g.fillRoundedRect(-16, -6, 32, 38, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-14, -4, 28, 34, 3);
    g.lineStyle(1.6, 0x3a2a14, 0.6); g.lineBetween(-14, -4, 14, 30); g.lineBetween(14, -4, -14, 30);
    for (let k = 0; k < 3; k++) { const sx = -10 + k * 10, rot = now / 900 + k; g.save(); g.translateCanvas(sx, 8); g.rotateCanvas(rot); g.fillStyle(a, 1); g.fillRect(-3, -8, 6, 16); g.fillStyle(0x6a4a26, 1); g.fillCircle(0, -8, 3.4); g.fillCircle(0, 8, 3.4); g.restore(); }
  } },
  yarnKnitBanner: { c: 0xffb7d5, a: 0xffd8e8, single: true, draw: (g, now, _flap, c, a) => {
    // 针织旗：飘动的针织旗
    const sway = Math.sin(now / 600) * 4;
    g.fillStyle(0x8a5a7a, 1); g.fillRect(-2, -30, 4, 62);
    g.fillStyle(c, 1); g.beginPath(); g.moveTo(2, -28); g.lineTo(26, -26 + sway); g.lineTo(22, -8 + sway); g.lineTo(26, 6 + sway); g.lineTo(2, 4); g.closePath(); g.fillPath();
    g.lineStyle(1.2, a, 0.8); for (let k = 0; k < 3; k++) { g.lineBetween(2, -22 + k * 10, 24, -20 + k * 10 + sway); }
    g.fillStyle(0xffe040, 1); g.fillCircle(12, -12 + sway, 3);
  } },
  // ── 画中世界 ──
  paintEasel: { c: 0xa8763a, a: 0xffffff, single: true, draw: (g, now, _flap, c, a) => {
    // 画架背架：一小副画架
    const sway = Math.sin(now / 800) * 1;
    g.lineStyle(4, c, 1); g.lineBetween(-14, 34, 0, -30); g.lineBetween(14, 34, 0, -30); g.lineBetween(-14, 34, 14, 34);
    g.lineStyle(3, c, 1); g.lineBetween(0, 34, 0, 44 + sway);
    g.fillStyle(0xf0ead8, 1); g.fillRect(-16, -26, 32, 26);
    g.fillStyle(0x9fd8ff, 0.8); g.fillRect(-14, -24, 28, 12); g.fillStyle(0x8fd45a, 0.8); g.fillRect(-14, -12, 28, 10);
    g.fillStyle(a, 0.5); g.fillCircle(-6, -18, 3); void now;
  } },
  paintPalette: { c: 0xcea070, a: 0xffffff, single: true, draw: (g, now, _flap, c, _a) => {
    // 调色盘背板：一格一格颜料
    g.fillStyle(0x8a6a3a, 1); g.fillEllipse(0, 8, 40, 32);
    g.fillStyle(c, 1); g.fillEllipse(0, 8, 36, 28);
    g.fillStyle(0x6a4a2a, 1); g.fillEllipse(9, 12, 9, 8);
    const cols = [0xff4a4a, 0xffd45c, 0x7dff9a, 0x5ac8ff, 0xff8ad4, 0xffffff];
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; const px = Math.cos(ang) * 13, py = 8 + Math.sin(ang) * 10; g.fillStyle(cols[k], 1); g.fillCircle(px, py, 3.6); g.fillStyle(0xffffff, 0.5); g.fillCircle(px - 1, py - 1, 1); }
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle(cols[k], (1 - ph) * 0.8); g.fillCircle(-10 + k * 10, 22 - ph * 8, 1.4); }
  } },
  paintMasterpiece: { c: 0xffd45c, a: 0xff8ad4, single: true, draw: (g, now, _flap, c, a) => {
    // 名画背框：会变的名画 + 金框
    g.fillStyle(c, 1); g.fillRoundedRect(-22, -30, 44, 62, 3);
    g.fillStyle(0xd8a020, 1); g.fillRoundedRect(-19, -27, 38, 56, 2);
    // 画中场景轮换
    const scene = Math.floor(now / 1600) % 3;
    g.fillStyle([0x9fd8ff, 0xffb070, 0x6a5a9a][scene], 1); g.fillRect(-16, -24, 32, 50);
    if (scene === 0) { g.fillStyle(0x6a8a3a, 1); g.fillEllipse(-4, 10, 26, 18); g.fillStyle(0xffe040, 1); g.fillCircle(8, -14, 5); }
    else if (scene === 1) { g.fillStyle(0xd85a2a, 1); g.fillRect(-16, 6, 32, 20); g.fillStyle(0xffe08a, 1); g.fillTriangle(-2, 6, 10, 6, 4, -8); }
    else { g.fillStyle(0x2a2450, 1); g.fillRect(-16, -24, 32, 50); for (let k = 0; k < 6; k++) { g.fillStyle(0xffffff, 0.5 + 0.5 * Math.sin(now / 400 + k)); g.fillCircle(-12 + k * 5, -16 + (k % 3) * 14, 1.4); } }
    g.fillStyle(0xffffff, 0.5); g.fillEllipse(-8, -18, 8, 4);
    // 飞出的笔触 + 飘金
    for (let k = 0; k < 3; k++) { const ph = ((now / 1200 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.save(); g.translateCanvas(24 + ph * 14, -10 + k * 12); g.rotateCanvas(k); g.fillEllipse(0, 0, 8, 3); g.restore(); }
  } },
  paintTubePack: { c: 0xd8d8e0, a: 0xff4a4a, single: true, draw: (g, now, _flap, c, _a) => {
    // 颜料管背袋：一袋颜料管
    g.fillStyle(0x6a5a9a, 1); g.fillRoundedRect(-16, 4, 32, 30, 5);
    const cols = [0xff4a4a, 0xffd45c, 0x7dff9a, 0x5ac8ff];
    for (let k = 0; k < 4; k++) { const bx = -11 + k * 7.5; g.fillStyle(c, 1); g.fillRoundedRect(bx - 3, -14, 6, 22, 2); g.fillStyle(cols[k], 1); g.fillRect(bx - 2.4, -12, 4.8, 14); g.fillStyle(0x9a9aa8, 1); g.fillCircle(bx, -14, 2.2); }
    void now;
  } },
  paintRoller: { c: 0xd8d8e0, a: 0x8fd45a, single: true, draw: (g, now, _flap, c, _a) => {
    // 滚刷背架：刷筒转 + 甩颜料
    g.lineStyle(4, 0x8a6a3a, 1); g.lineBetween(0, 30, 0, 6); g.lineBetween(0, 6, 0, -14);
    g.save(); g.translateCanvas(0, -18); g.rotateCanvas(now / 500);
    g.fillStyle(c, 1); g.fillRoundedRect(-16, -8, 32, 16, 6);
    g.fillStyle(0x8fd45a, 1); g.fillRoundedRect(-15, -7, 30, 14, 5);
    for (let k = 0; k < 5; k++) { g.fillStyle(0x6a9a3a, 0.8); g.fillCircle(-12 + k * 6, 0, 1.6); }
    g.restore();
    for (let k = 0; k < 4; k++) { const ph = ((now / 800 + k / 4) % 1); g.fillStyle(0x8fd45a, (1 - ph) * 0.8); g.fillCircle(-8 + k * 6, -6 + ph * 24, 1.6); }
  } },
};
