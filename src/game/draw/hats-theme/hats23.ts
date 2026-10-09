import { hpoly, type HatArt } from './shared';

/** 第九批头饰（恐龙 / 史前 / 神话 / 恶搞 10 主题）——帽沿线 (x, hy)，往上 -34、左右 ±20 */

export const HATS_23: Record<string, HatArt> = {
  // ── 白垩纪猎场 ──
  cretSkullCrown: { c: 0xd8d0c0, a: 0x8a5a3a, draw: (g, now, x, hy, c, a) => {
    // 三角龙颅盔：头骨 + 颈盾 + 眼窝透光
    g.fillStyle(0x8a8478, 1); g.fillPoints([{ x: x - 18, y: hy - 4 }, { x: x + 18, y: hy - 4 }, { x: x + 14, y: hy - 26 }, { x: x - 14, y: hy - 26 }] as never, true);
    g.fillStyle(c, 1); hpoly(g, [[x - 15, hy - 3], [x + 15, hy - 3], [x + 12, hy - 23], [x - 12, hy - 23]], c, 1);
    g.fillStyle(a, 0.9); g.fillTriangle(x - 8, hy - 24, x - 4, hy - 24, x - 6, hy - 34); g.fillTriangle(x + 8, hy - 24, x + 4, hy - 24, x + 6, hy - 34);
    g.fillStyle(0x2a241c, 0.9); g.fillEllipse(x - 6, hy - 15, 5, 6); g.fillEllipse(x + 6, hy - 15, 5, 6);
    g.fillStyle(a, 0.4 + 0.4 * Math.sin(now / 300)); g.fillEllipse(x - 6, hy - 15, 3, 4); g.fillEllipse(x + 6, hy - 15, 3, 4);
    g.fillStyle(0x8a8478, 1); g.fillRect(x - 3, hy - 4, 6, 5);
  } },
  cretRaptorCrest: { c: 0x6a8a3a, a: 0xe8d07a, draw: (g, now, x, hy, c, a) => {
    // 驰龙羽冠：一排羽毛
    g.fillStyle(0x4a3a22, 1); g.fillRoundedRect(x - 12, hy - 8, 24, 6, 3);
    for (let k = 0; k < 5; k++) { const fx = x - 10 + k * 5, sway = Math.sin(now / 400 + k) * 1.5; g.fillStyle(k % 2 ? c : 0x8a9a4a, 1); g.fillPoints([{ x: fx - 2, y: hy - 8 }, { x: fx + 2, y: hy - 8 }, { x: fx + sway, y: hy - 30 - (k % 2) * 4 }] as never, true); g.fillStyle(a, 0.7); g.fillCircle(fx + sway * 0.6, hy - 24, 1.2); }
  } },
  // ── 史前沼泽 ──
  swampCrocHat: { c: 0x3a7a4a, a: 0x7dff9a, draw: (g, now, x, hy, c, a) => {
    // 鳄嘴斗笠：斗笠上扣一张张开的鳄嘴
    g.fillStyle(0x6a5a3a, 1); g.fillPoints([{ x: x - 20, y: hy }, { x: x + 20, y: hy }, { x: x, y: hy - 16 }] as never, true);
    const open = 0.5 + 0.5 * Math.sin(now / 500);
    g.fillStyle(c, 1); g.fillPoints([{ x: x - 12, y: hy - 10 }, { x: x + 14, y: hy - 12 }, { x: x + 16, y: hy - 18 - open * 4 }, { x: x - 8, y: hy - 18 }] as never, true);
    g.fillStyle(0xd8d0c0, 1); for (let k = 0; k < 5; k++) { g.fillTriangle(x - 8 + k * 5, hy - 12, x - 6 + k * 5, hy - 12, x - 7 + k * 5, hy - 17 - open * 3); }
    g.fillStyle(a, 0.8); g.fillCircle(x - 6, hy - 20, 2);
  } },
  swampBoneHorn: { c: 0xd8d0c0, a: 0x7dff9a, draw: (g, _now, x, hy, c, _a) => {
    // 龙骨角：一对兽骨角
    g.fillStyle(0x5a4a30, 1); g.fillRoundedRect(x - 10, hy - 8, 20, 8, 4);
    for (const dir of [-1, 1]) { g.fillStyle(c, 1); g.fillPoints([{ x: x + dir * 6, y: hy - 6 }, { x: x + dir * 14, y: hy - 10 }, { x: x + dir * 18, y: hy - 24 }, { x: x + dir * 12, y: hy - 26 }, { x: x + dir * 10, y: hy - 12 }] as never, true); g.fillStyle(0x8a8478, 0.6); g.fillCircle(x + dir * 14, hy - 18, 1.4); }
  } },
  swampMushHat: { c: 0xc0392b, a: 0x7dff9a, draw: (g, now, x, hy, c, a) => {
    // 沼菇帽：红伞白点蘑菇帽
    const squash = 1 - 0.06 * Math.abs(Math.sin(now / 400));
    g.fillStyle(0xe8e0d0, 1); g.fillRoundedRect(x - 7, hy - 12, 14, 12, 3);
    g.fillStyle(c, 1); g.fillEllipse(x, hy - 12, 34, 16 * squash);
    g.fillStyle(0xe8e0d0, 1); for (let k = 0; k < 4; k++) { g.fillCircle(x - 12 + k * 8, hy - 14 - (k % 2) * 3, 2.4); }
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(x - 8 + k * 8, hy - 18 - ph * 12, 1.4); }
  } },
  // ── 冰河世纪 ──
  iceageMammothHelm: { c: 0xd8d0c0, a: 0x8fd8ff, draw: (g, now, x, hy, c, a) => {
    // 猛犸颅盔：头骨 + 弯牙
    g.fillStyle(0x8a8478, 1); g.fillEllipse(x, hy - 14, 26, 22);
    g.fillStyle(c, 1); g.fillEllipse(x, hy - 12, 22, 18);
    g.fillStyle(0x2a241c, 0.9); g.fillEllipse(x - 5, hy - 14, 4, 5); g.fillEllipse(x + 5, hy - 14, 4, 5);
    g.fillStyle(a, 0.4 + 0.4 * Math.sin(now / 350)); g.fillEllipse(x - 5, hy - 14, 2.4, 3); g.fillEllipse(x + 5, hy - 14, 2.4, 3);
    g.fillStyle(0xf0f0e0, 1); g.fillPoints([{ x: x - 10, y: hy - 6 }, { x: x - 18, y: hy - 2 }, { x: x - 20, y: hy - 20 }, { x: x - 14, y: hy - 18 }] as never, true); g.fillPoints([{ x: x + 10, y: hy - 6 }, { x: x + 18, y: hy - 2 }, { x: x + 20, y: hy - 20 }, { x: x + 14, y: hy - 18 }] as never, true);
  } },
  iceageAntler: { c: 0x8fd8ff, a: 0xdff4ff, draw: (g, now, x, hy, c, a) => {
    // 冰晶鹿角：透明冰鹿角
    g.fillStyle(0x5a8ab0, 1); g.fillRoundedRect(x - 8, hy - 8, 16, 8, 4);
    for (const dir of [-1, 1]) { g.fillStyle(c, 0.85); g.fillPoints([{ x: x + dir * 4, y: hy - 6 }, { x: x + dir * 8, y: hy - 6 }, { x: x + dir * 12, y: hy - 30 }, { x: x + dir * 8, y: hy - 30 }] as never, true); g.fillPoints([{ x: x + dir * 9, y: hy - 20 }, { x: x + dir * 16, y: hy - 26 }, { x: x + dir * 15, y: hy - 30 }, { x: x + dir * 8, y: hy - 24 }] as never, true); }
    g.fillStyle(a, 0.4 + 0.4 * Math.sin(now / 400)); g.fillCircle(x - 10, hy - 28, 1.6); g.fillCircle(x + 10, hy - 28, 1.6);
  } },
  iceageFurHood: { c: 0x8a6a4a, a: 0xd8c8b0, draw: (g, now, x, hy, c, a) => {
    // 兽皮兜帽：厚毛兜帽
    g.fillStyle(0x6a5038, 1); g.fillRoundedRect(x - 18, hy - 30, 36, 30, 12);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 16, hy - 28, 32, 27, 11);
    for (let k = 0; k < 9; k++) { g.fillStyle(a, 0.85); g.fillPoints([{ x: x - 16 + k * 4, y: hy - 26 }, { x: x - 14 + k * 4, y: hy - 26 }, { x: x - 15 + k * 4 + Math.sin(k + now / 600) * 1.5, y: hy - 34 }] as never, true); }
  } },
  // ── 非洲雷神 ──
  yorCrown: { c: 0xd8b45a, a: 0xffe08a, draw: (g, now, x, hy, c, a) => {
    // 雷神王冠：珠串王冠 + 顶端小闪电
    g.fillStyle(0x8a2a1a, 1); g.fillRoundedRect(x - 15, hy - 12, 30, 12, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 14, hy - 11, 28, 10, 3);
    for (let k = 0; k < 5; k++) { g.fillStyle(k % 2 ? 0xd8b45a : 0xc0392b, 1); g.fillCircle(x - 12 + k * 6, hy - 12, 2.6); }
    const fl = Math.sin(now / 150);
    g.lineStyle(2, a, 0.6 + 0.4 * Math.abs(fl)); g.lineBetween(x, hy - 12, x + 2, hy - 22); g.lineBetween(x + 2, hy - 22, x - 2, hy - 26); g.lineBetween(x - 2, hy - 26, x + 1, hy - 34);
    g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 300)); g.fillCircle(x, hy - 12, 2);
  } },
  yorBead: { c: 0xc0392b, a: 0xffe08a, draw: (g, now, x, hy, _c, a) => {
    // 彩珠冠：多层彩珠
    for (let r = 0; r < 3; r++) { for (let k = 0; k < 7 - r; k++) { const bx = x - (7 - r) * 3 + k * 6, by = hy - 6 - r * 6; g.fillStyle([0xc0392b, 0xd8b45a, 0x2a6a4a][r], 1); g.fillCircle(bx, by, 2.4); g.fillStyle(a, 0.7); g.fillCircle(bx - 0.8, by - 0.8, 0.8); } }
    g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 350)); g.fillCircle(x, hy - 18, 2);
  } },
  // ── 芬兰史诗 ──
  kalStar: { c: 0x9fe8d0, a: 0xd8e8f0, draw: (g, now, x, hy, c, a) => {
    // 星辰纺冠：三宝磨碎片冠，碎面缓转
    g.fillStyle(0x3a5a6a, 1); g.fillRoundedRect(x - 14, hy - 10, 28, 10, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 13, hy - 9, 26, 8, 3);
    const rot = now / 1500;
    for (let k = 0; k < 3; k++) { const ang = rot + k * 2.09; g.fillStyle(a, 0.9); g.fillPoints([{ x: x + Math.cos(ang) * 6, y: hy - 14 + Math.sin(ang) * 4 }, { x: x + Math.cos(ang) * 6 - 3, y: hy - 20 + Math.sin(ang) * 5 }, { x: x + Math.cos(ang) * 6 + 3, y: hy - 20 + Math.sin(ang) * 5 }] as never, true); }
    g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 300)); g.fillCircle(x, hy - 16, 2);
  } },
  kalBirch: { c: 0xe8e0d0, a: 0xd8e8f0, draw: (g, now, x, hy, c, a) => {
    // 桦皮帽：桦树皮帽，边角翘
    g.fillStyle(c, 1); g.fillRoundedRect(x - 15, hy - 14, 30, 14, 3);
    g.fillStyle(0x3a3a3a, 0.35); g.fillRect(x - 13, hy - 12, 26, 2); g.fillRect(x - 11, hy - 6, 20, 2);
    const tilt = Math.sin(now / 700) * 0.05;
    g.fillStyle(c, 1); g.fillTriangle(x + 15, hy - 12, x + 15, hy - 2, x + 22 + tilt * 40, hy - 8);
    g.fillStyle(0x8a6a3a, 1); g.fillRoundedRect(x - 15, hy - 3, 30, 3, 1);
    void a;
  } },
  // ── 香蕉王国 ──
  banPeel: { c: 0xf0d020, a: 0xfff080, draw: (g, now, x, hy, c, a) => {
    // 蕉皮王冠：蕉皮翻边王冠 + 樱桃
    g.fillStyle(0xc0c020, 1); g.fillPoints([{ x: x - 16, y: hy }, { x: x + 16, y: hy }, { x: x + 12, y: hy - 12 }, { x: x - 12, y: hy - 12 }] as never, true);
    for (let k = 0; k < 4; k++) { const px = x - 12 + k * 8; g.fillStyle(c, 1); g.fillPoints([{ x: px, y: hy - 11 }, { x: px + 7, y: hy - 11 }, { x: px + 5 + Math.sin(now / 600 + k) * 1.5, y: hy - 22 }] as never, true); }
    g.fillStyle(0xd83a3a, 1); g.fillCircle(x, hy - 16, 4); g.fillStyle(0x3a7a3a, 1); g.fillRect(x - 1, hy - 22, 2, 4);
    g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 300)); g.fillCircle(x - 2, hy - 17, 1.2);
  } },
  banMonkeyHood: { c: 0x8a6a4a, a: 0xfff080, draw: (g, now, x, hy, c, a) => {
    // 猴子头套：会翻眼皮的猴头
    g.fillStyle(c, 1); g.fillCircle(x, hy - 14, 18);
    g.fillStyle(0xd8b48a, 1); g.fillEllipse(x, hy - 10, 22, 16);
    g.fillStyle(0x3a2a1a, 1); g.fillCircle(x - 8, hy - 14, 6); g.fillCircle(x + 8, hy - 14, 6);
    g.fillStyle(0xf0f0e0, 1); g.fillCircle(x - 8, hy - 14, 4.4); g.fillCircle(x + 8, hy - 14, 4.4);
    const blink = Math.sin(now / 900) > 0.85 ? 0.2 : 1; g.fillStyle(0x1a1208, 1); g.fillEllipse(x - 8, hy - 13, 2.4, 3 * blink); g.fillEllipse(x + 8, hy - 13, 2.4, 3 * blink);
    g.fillStyle(0x3a2a1a, 1); g.fillEllipse(x, hy - 5, 10, 5);
    g.fillStyle(a, 0.9); g.fillCircle(x - 8, hy - 14, 1.2); g.fillCircle(x + 8, hy - 14, 1.2);
  } },
  banTopHat: { c: 0xf0d020, a: 0x8a8a1a, draw: (g, now, x, hy, c, a) => {
    // 蕉叶高帽：蕉叶卷成的高帽
    g.fillStyle(0x8a8a1a, 1); g.fillEllipse(x, hy - 2, 34, 8);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 12, hy - 30, 24, 28, 4);
    g.lineStyle(1.4, a, 0.6); for (let k = 0; k < 3; k++) { g.lineBetween(x - 12, hy - 26 + k * 8, x + 12, hy - 24 + k * 8); }
    g.fillStyle(a, 0.9); g.fillEllipse(x, hy - 30, 24, 6);
    g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 400)); g.fillCircle(x + 6, hy - 30, 2);
  } },
  // ── 迷因宇宙 ──
  memePixelCrown: { c: 0x7dff9a, a: 0x39ffd0, draw: (g, now, x, hy, c, a) => {
    // 像素皇冠：8-bit，逐格闪
    g.fillStyle(0x2a3a2a, 1); g.fillRect(x - 14, hy - 10, 28, 10);
    const cells = [[-14,-10],[-8,-10],[-2,-10],[4,-10],[10,-10],[-14,-16],[-2,-22],[10,-16]];
    for (let k = 0; k < cells.length; k++) { const on = Math.max(0, Math.sin(now / 200 + k)); g.fillStyle(on > 0.5 ? c : 0x2a4a3a, 1); g.fillRect(x + cells[k][0], hy + cells[k][1], 6, 6); }
    g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 250)); g.fillRect(x - 2, hy - 28, 4, 4);
  } },
  memeMask: { c: 0xffd45c, a: 0xff5ec8, draw: (g, now, x, hy, c, a) => {
    // 表情包面具：夸张表情会切换
    const mode = Math.floor(now / 1400) % 2;
    g.fillStyle(0xf0e8d8, 1); g.fillEllipse(x, hy - 12, 34, 26);
    g.fillStyle(c, 1); g.fillEllipse(x, hy - 12, 30, 22);
    g.fillStyle(0x1a1208, 1);
    if (mode === 0) { g.fillCircle(x - 7, hy - 14, 3.4); g.fillCircle(x + 7, hy - 14, 3.4); g.fillEllipse(x, hy - 5, 12, 5); }
    else { g.fillEllipse(x - 7, hy - 14, 8, 4); g.fillEllipse(x + 7, hy - 14, 8, 4); g.fillCircle(x, hy - 5, 5); }
    g.fillStyle(a, 0.8); g.fillCircle(x - 13, hy - 8, 2); // 汗滴
    void a;
  } },
  memeAntenna: { c: 0x7dff9a, a: 0xff5ec8, draw: (g, now, x, hy, c, a) => {
    // 呆毛天线：一根会晃的天线
    const sway = Math.sin(now / 300) * 5;
    g.lineStyle(2.4, 0x8a8a92, 1); g.lineBetween(x, hy - 4, x + sway, hy - 28);
    g.fillStyle(c, 1); g.fillCircle(x + sway, hy - 30, 4);
    g.fillStyle(a, 0.4 + 0.5 * Math.abs(Math.sin(now / 200))); g.fillCircle(x + sway, hy - 30, 6);
    for (let k = 0; k < 2; k++) { g.fillStyle(a, 0.8); g.fillCircle(x + sway + (k ? 5 : -5), hy - 26 - k * 3, 1.4); }
  } },
  memeHeadset: { c: 0x3a3a44, a: 0x7dff9a, draw: (g, now, x, hy, c, a) => {
    // 耳机：头戴耳机 + 音波
    g.lineStyle(4, c, 1); g.beginPath(); g.arc(x, hy - 10, 16, Math.PI, 0); g.strokePath();
    g.fillStyle(0x2a2a34, 1); g.fillRoundedRect(x - 20, hy - 14, 10, 16, 4); g.fillRoundedRect(x + 10, hy - 14, 10, 16, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 18, hy - 12, 6, 12, 3); g.fillRoundedRect(x + 12, hy - 12, 6, 12, 3);
    const on = 0.4 + 0.5 * Math.abs(Math.sin(now / 250)); g.fillStyle(a, on); g.fillEllipse(x - 15, hy - 6, 3, 5); g.fillEllipse(x + 15, hy - 6, 3, 5);
  } },
  // ── 摸鱼办公室 ──
  officeBox: { c: 0xb8916a, a: 0x9fd8ff, draw: (g, now, x, hy, c, a) => {
    // 纸箱头套：快递箱挖两个眼洞
    g.fillStyle(0x8a6a4a, 1); g.fillRoundedRect(x - 19, hy - 30, 38, 30, 2);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 17, hy - 28, 34, 27, 2);
    g.fillStyle(0x8a6a4a, 1); g.fillRect(x - 19, hy - 30, 38, 4); g.fillRect(x - 2, hy - 30, 4, 30);
    g.fillStyle(0x1a1208, 0.9); g.fillEllipse(x - 7, hy - 14, 7, 8); g.fillEllipse(x + 7, hy - 14, 7, 8);
    const on = 0.5 + 0.4 * Math.sin(now / 300); g.fillStyle(a, on); g.fillCircle(x - 7, hy - 14, 2); g.fillCircle(x + 7, hy - 14, 2);
  } },
  // ── 花园地精 ──
  gnomeHat: { c: 0xc0392b, a: 0xa8ff7a, draw: (g, now, x, hy, c, a) => {
    // 尖顶地精帽：高尖帽，帽尖自己弯
    const bend = Math.sin(now / 500) * 6;
    g.fillStyle(0xa02a20, 1); g.fillEllipse(x, hy - 2, 36, 9);
    g.fillStyle(c, 1); g.fillPoints([{ x: x - 16, y: hy - 2 }, { x: x + 16, y: hy - 2 }, { x: x + bend, y: hy - 34 }] as never, true);
    g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 300)); g.fillCircle(x + bend, hy - 34, 2.4);
    g.fillStyle(0x8a2018, 1); g.fillRoundedRect(x - 16, hy - 5, 32, 4, 2);
  } },
  gnomeMush: { c: 0xc0392b, a: 0xa8ff7a, draw: (g, now, x, hy, c, a) => {
    // 蘑菇帽
    const squash = 1 - 0.06 * Math.abs(Math.sin(now / 450));
    g.fillStyle(0xe8e0d0, 1); g.fillRoundedRect(x - 7, hy - 11, 14, 11, 3);
    g.fillStyle(c, 1); g.fillEllipse(x, hy - 11, 36, 17 * squash);
    g.fillStyle(0xf0f0e0, 1); for (let k = 0; k < 5; k++) { g.fillCircle(x - 14 + k * 7, hy - 14 - (k % 2) * 3, 2.6); }
    void a;
  } },
  // ── 垃圾回收站 ──
  trashCanCrown: { c: 0x8a9a8a, a: 0x8fd4a0, draw: (g, now, x, hy, c, a) => {
    // 铁罐皇冠：易拉罐拼的王冠
    g.fillStyle(0x5a6a5a, 1); g.fillRoundedRect(x - 15, hy - 12, 30, 12, 3);
    for (let k = 0; k < 5; k++) { const cx = x - 12 + k * 6; g.fillStyle(k % 2 ? c : 0xb84a3a, 1); g.fillRoundedRect(cx - 2.5, hy - 24 - (k % 2) * 4, 5, 14, 2); g.fillStyle(0xe0e0d0, 0.6); g.fillRect(cx - 2, hy - 18, 4, 2); }
    g.fillStyle(a, 0.4 + 0.5 * Math.abs(Math.sin(now / 300))); g.fillCircle(x - 4, hy - 20, 1.4); g.fillCircle(x + 6, hy - 16, 1.4);
  } },
  trashNet: { c: 0x8a9a8a, a: 0x8fd4a0, draw: (g, now, x, hy, c, a) => {
    // 破渔网头罩：破洞渔网
    g.fillStyle(0x3a4a3a, 0.35); g.fillEllipse(x, hy - 16, 34, 30);
    g.lineStyle(1.4, c, 0.9);
    for (let k = -2; k <= 2; k++) { g.lineBetween(x + k * 7, hy - 30, x + k * 8, hy - 2); }
    for (let k = 0; k < 4; k++) { g.lineBetween(x - 16, hy - 26 + k * 7, x + 16, hy - 24 + k * 7); }
    g.fillStyle(0x1a1a12, 0.9); g.fillEllipse(x - 7, hy - 16, 6, 7); g.fillEllipse(x + 7, hy - 16, 6, 7);
    const on = 0.4 + 0.4 * Math.sin(now / 300); g.fillStyle(a, on); g.fillCircle(x - 7, hy - 16, 1.6); g.fillCircle(x + 7, hy - 16, 1.6);
  } },
  trashLidHat: { c: 0x6a7a6a, a: 0x8fd4a0, draw: (g, now, x, hy, c, a) => {
    // 桶盖帽：垃圾桶盖当帽
    g.fillStyle(0x4a5a4a, 1); g.fillRoundedRect(x - 18, hy - 8, 36, 8, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 16, hy - 7, 32, 6, 3);
    g.fillStyle(0x3a4a3a, 1); g.fillRoundedRect(x - 6, hy - 14, 12, 7, 3);
    g.fillStyle(a, 0.4 + 0.5 * Math.abs(Math.sin(now / 400))); g.fillCircle(x, hy - 11, 1.6);
  } },
};
