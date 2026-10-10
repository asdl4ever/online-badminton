import { type HatArt } from './shared';

/** 第十一批头饰（收容失效 / 凯特尔 / 羞怯者 / 夜行怪 / 温迪戈 / 巨蛾人 / 巨兽之王 / 骨爬巨龙 / 辐射巨虫 / 贝希摩斯）——帽沿线 (x, hy)，往上 -34、左右 ±20 */

export const HATS_25: Record<string, HatArt> = {
  // ── scp 收容失效 ──
  scpGasMask: { c: 0x8a9a8a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 防毒面具：双圆滤毒罐 + 镜片 + 呼吸管
    g.fillStyle(0x6a7a6a, 1); g.fillRoundedRect(x - 15, hy - 22, 30, 22, 8);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 13, hy - 20, 26, 19, 7);
    g.fillStyle(0x3a4a3a, 1); g.fillCircle(x - 7, hy - 12, 4.5); g.fillCircle(x + 7, hy - 12, 4.5);
    g.fillStyle(a, 0.4 + 0.2 * Math.sin(now / 400)); g.fillCircle(x - 7, hy - 12, 3); g.fillCircle(x + 7, hy - 12, 3);
    g.fillStyle(0x556655, 1); g.fillCircle(x - 11, hy - 4, 4.5); g.fillCircle(x + 11, hy - 4, 4.5);
    g.fillStyle(0x2a3a2a, 1); g.fillCircle(x - 11, hy - 4, 2); g.fillCircle(x + 11, hy - 4, 2);
    g.lineStyle(2.4, 0x556655, 1); g.lineBetween(x + 12, hy - 6, x + 18, hy + 1);
  } },
  scpHazmat: { c: 0x8a9a8a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 防化头罩：黄色罩体 + 观察窗
    g.fillStyle(0xe0cc3a, 1); g.fillEllipse(x, hy - 16, 36, 32);
    g.fillStyle(0xf0dc48, 1); g.fillEllipse(x, hy - 15, 32, 28);
    g.fillStyle(0x2a2a18, 1); g.fillRoundedRect(x - 11, hy - 25, 22, 15, 5);
    g.fillStyle(a, 0.45 + 0.25 * Math.sin(now / 600)); g.fillRoundedRect(x - 9, hy - 23, 18, 11, 4);
    g.fillStyle(0xe0cc3a, 1); g.fillRect(x - 20, hy - 10, 4, 13); g.fillRect(x + 16, hy - 10, 4, 13);
    g.lineStyle(2, 0xb0a020, 1); g.lineBetween(x - 16, hy - 6, x + 16, hy - 6);
    void c;
  } },
  // ── keter 凯特尔级 ──
  keterEye: { c: 0xa03030, a: 0xff5a5a, draw: (g, now, x, hy, c, a) => {
    // 千眼冠：镶满会眨的眼睛的肉冠
    g.fillStyle(0x6a1a1a, 1); g.fillEllipse(x, hy - 16, 34, 26);
    g.fillStyle(c, 1); g.fillEllipse(x, hy - 15, 30, 22);
    for (let k = 0; k < 7; k++) { const ang = -Math.PI + (k / 6) * Math.PI; const px = x + Math.cos(ang) * 12, py = hy - 14 + Math.sin(ang) * 8; const bl = Math.sin(now / 600 + k * 1.3) > 0.85 ? 0.25 : 1; g.fillStyle(0xf0f0e8, 0.95); g.fillEllipse(px, py, 5, 5 * bl); g.fillStyle(0x2a6a2a, 1); g.fillCircle(px, py, 2 * bl); }
    g.fillStyle(a, 0.35 + 0.3 * Math.sin(now / 400)); g.fillCircle(x, hy - 14, 6);
  } },
  keterMaw: { c: 0xa03030, a: 0xff5a5a, draw: (g, now, x, hy, c, a) => {
    // 裂口头罩：裂开利齿大口、内侧泛红
    g.fillStyle(0x3a1010, 1); g.fillEllipse(x, hy - 14, 34, 26);
    g.fillStyle(c, 1); g.fillEllipse(x, hy - 14, 30, 22);
    g.fillStyle(0xff3a3a, 0.35 + 0.2 * Math.sin(now / 400)); g.fillEllipse(x, hy - 14, 22, 16);
    g.fillStyle(0x140404, 1); g.fillPoints([{ x: x - 14, y: hy - 12 }, { x: x + 14, y: hy - 12 }, { x: x + 9, y: hy - 20 }, { x: x - 9, y: hy - 20 }] as never, true);
    for (let k = 0; k < 6; k++) { const px = x - 12 + k * 4.8; g.fillStyle(0xf0f0e0, 1); g.fillTriangle(px - 2, hy - 12, px + 2, hy - 12, px, hy - 7); g.fillTriangle(px - 2, hy - 20, px + 2, hy - 20, px, hy - 25); }
    void a;
  } },
  // ── shy 羞怯者 ──
  shyPale: { c: 0xe8e8e0, a: 0x6a7a8a, draw: (g, now, x, hy, c, _a) => {
    // 惨白面罩：光滑无特征、两眼黑洞
    g.fillStyle(0xc8c8c0, 1); g.fillEllipse(x, hy - 16, 30, 30);
    g.fillStyle(c, 1); g.fillEllipse(x, hy - 15, 27, 26);
    g.fillStyle(0x0a0a0a, 1); g.fillEllipse(x - 6, hy - 18, 5, 7); g.fillEllipse(x + 6, hy - 18, 5, 7);
    const d = (Math.sin(now / 900) + 1) * 0.5; g.fillStyle(0x8a8a86, 0.2 * d); g.fillEllipse(x, hy - 6, 20, 8);
  } },
  shyMuzzle: { c: 0xe8e8e0, a: 0x6a7a8a, draw: (g, now, x, hy, c, _a) => {
    // 束口头笼：铁笼 + 皮带束住口鼻
    g.fillStyle(0x8a8a90, 1); g.fillRoundedRect(x - 14, hy - 15, 28, 15, 4);
    for (let k = 0; k < 4; k++) { g.lineStyle(1.6, 0xd0d0d8, 0.9); g.lineBetween(x - 12 + k * 8, hy - 14, x - 12 + k * 8, hy - 1); }
    g.lineStyle(1.6, 0xd0d0d8, 0.9); g.lineBetween(x - 14, hy - 8, x + 14, hy - 8);
    g.fillStyle(c, 1); g.fillRect(x - 17, hy - 5, 4, 9); g.fillRect(x + 13, hy - 5, 4, 9);
    g.lineStyle(2, c, 0.85); g.lineBetween(x - 14, hy - 6, x - 20, hy - 18); g.lineBetween(x + 14, hy - 6, x + 20, hy - 18);
    void now;
  } },
  // ── rake 夜行怪 ──
  rakeSkull: { c: 0x8a8070, a: 0xd8d0c0, draw: (g, _now, x, hy, c, a) => {
    // 白骨面甲：拉长面甲 + 利齿
    g.fillStyle(0xe8e4d8, 1); g.fillPoints([{ x: x - 9, y: hy - 26 }, { x: x + 9, y: hy - 26 }, { x: x + 11, y: hy - 8 }, { x: x, y: hy - 1 }, { x: x - 11, y: hy - 8 }] as never, true);
    g.fillStyle(0x101010, 1); g.fillEllipse(x - 4, hy - 18, 4, 5); g.fillEllipse(x + 4, hy - 18, 4, 5);
    for (let k = 0; k < 4; k++) { const px = x - 7 + k * 4.6; g.fillStyle(c, 1); g.fillTriangle(px - 2, hy - 9, px + 2, hy - 9, px, hy - 2); }
    g.fillStyle(0x8a8070, 1); g.fillEllipse(x, hy - 28, 20, 6);
    void a;
  } },
  rakeClaw: { c: 0x8a8070, a: 0xd8d0c0, draw: (g, _now, x, hy, c, a) => {
    // 爪齿发箍：兽爪利齿环绕
    g.fillStyle(0x5a5248, 1); g.fillRoundedRect(x - 18, hy - 8, 36, 7, 3);
    for (let k = 0; k < 5; k++) { const px = x - 14 + k * 7; g.fillStyle(c, 1); g.fillPoints([{ x: px - 4, y: hy - 8 }, { x: px + 4, y: hy - 8 }, { x: px + 1, y: hy - 19 }, { x: px - 1, y: hy - 19 }] as never, true); g.fillStyle(a, 0.8); g.fillCircle(px, hy - 5, 1.4); }
  } },
  // ── wendi 温迪戈 ──
  wendiAntler: { c: 0x9a8060, a: 0xd8e8f0, draw: (g, now, x, hy, c, a) => {
    // 枯鹿角冠：干枯分叉 + 寒气
    g.fillStyle(0x6a5638, 1); g.fillRoundedRect(x - 16, hy - 8, 32, 7, 3);
    for (const s of [-1, 1]) { g.lineStyle(4, c, 1); g.lineBetween(x + s * 6, hy - 8, x + s * 10, hy - 24); g.lineStyle(3, c, 1); g.lineBetween(x + s * 10, hy - 24, x + s * 16, hy - 30); g.lineBetween(x + s * 7, hy - 16, x + s * 14, hy - 22); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 500)); g.fillCircle(x, hy - 32, 2.4);
  } },
  wendiSkullHead: { c: 0x9a8060, a: 0xd8e8f0, draw: (g, now, x, hy, c, _a) => {
    // 鹿颅头罩：整颗鹿颅骨
    g.fillStyle(0xd8d0c0, 1); g.fillEllipse(x, hy - 14, 26, 22);
    g.fillStyle(c, 1); g.fillPoints([{ x: x - 6, y: hy - 26 }, { x: x + 6, y: hy - 26 }, { x: x + 4, y: hy - 6 }, { x: x - 4, y: hy - 6 }] as never, true);
    g.fillStyle(0x101010, 1); g.fillEllipse(x - 8, hy - 16, 5, 6); g.fillEllipse(x + 8, hy - 16, 5, 6);
    g.lineStyle(2.4, 0xd8d0c0, 1); g.lineBetween(x - 5, hy - 26, x - 12, hy - 33); g.lineBetween(x + 5, hy - 26, x + 12, hy - 33);
    void now;
  } },
  // ── mothm 巨蛾人 ──
  mothmAntenna: { c: 0x7a5a3a, a: 0xff3a3a, draw: (g, now, x, hy, c, a) => {
    // 蛾须发冠：羽状大蛾须 + 绒毛
    g.fillStyle(0x4a3620, 1); g.fillRoundedRect(x - 14, hy - 8, 28, 7, 3);
    g.fillStyle(c, 0.8); g.fillCircle(x - 6, hy - 6, 5); g.fillCircle(x + 6, hy - 6, 5);
    for (const s of [-1, 1]) { const sw = Math.sin(now / 500 + s) * 3; g.lineStyle(3, c, 1); g.lineBetween(x + s * 6, hy - 8, x + s * 10 + sw * 0.4, hy - 24); for (let k = 0; k < 5; k++) { g.lineStyle(1.4, a, 0.85); g.lineBetween(x + s * 10 + sw * 0.4, hy - 24, x + s * (8 + k * 2) + sw, hy - 30 + k); } }
  } },
  mothmEye: { c: 0x7a5a3a, a: 0xff3a3a, draw: (g, now, x, hy, c, a) => {
    // 赤目面罩：一对巨大红色复眼
    g.fillStyle(0x3a2a1a, 1); g.fillRoundedRect(x - 19, hy - 18, 38, 16, 6);
    for (const s of [-1, 1]) { g.fillStyle(c, 1); g.fillEllipse(x + s * 9, hy - 10, 15, 13); g.fillStyle(a, 0.75 + 0.2 * Math.sin(now / 400)); g.fillEllipse(x + s * 9, hy - 10, 11, 9); g.fillStyle(0xffc0c0, 0.6); g.fillCircle(x + s * 9 - 1, hy - 12, 2); }
  } },
  // ── gbeast 巨兽之王 ──
  gbeastSkull: { c: 0x8a5a3a, a: 0xffb347, draw: (g, now, x, hy, _c, a) => {
    // 巨兽骷髅冠：巨大兽颅 + 弯角
    g.fillStyle(0xe8dcc0, 1); g.fillEllipse(x, hy - 14, 36, 28);
    g.fillStyle(0xb09468, 1); g.fillPoints([{ x: x - 10, y: hy - 24 }, { x: x + 10, y: hy - 24 }, { x: x + 7, y: hy - 4 }, { x: x - 7, y: hy - 4 }] as never, true);
    g.fillStyle(0x101010, 1); g.fillEllipse(x - 11, hy - 14, 6, 7); g.fillEllipse(x + 11, hy - 14, 6, 7);
    for (const s of [-1, 1]) { g.fillStyle(0xd8c8a0, 1); g.fillPoints([{ x: x + s * 14, y: hy - 24 }, { x: x + s * 22, y: hy - 31 }, { x: x + s * 19, y: hy - 20 }] as never, true); g.fillStyle(a, 0.5); g.fillCircle(x + s * 19, hy - 29, 1.6); }
    void now;
  } },
  gbeastTusk: { c: 0x8a5a3a, a: 0xffb347, draw: (g, now, x, hy, c, a) => {
    // 獠牙头饰：一对上翘巨大獠牙
    g.fillStyle(0x6a4a2a, 1); g.fillRoundedRect(x - 16, hy - 8, 32, 7, 3);
    for (const s of [-1, 1]) { g.fillStyle(c, 1); g.fillPoints([{ x: x + s * 14, y: hy - 3 }, { x: x + s * 20, y: hy - 5 }, { x: x + s * 14, y: hy - 27 }, { x: x + s * 9, y: hy - 25 }] as never, true); g.fillStyle(a, 0.55); g.fillCircle(x + s * 14, hy - 25, 2); }
    g.fillStyle(c, 1); g.fillCircle(x - 6, hy - 6, 4); g.fillCircle(x + 6, hy - 6, 4);
    void now;
  } },
  // ── craw 骨爬巨龙 ──
  crawSkull: { c: 0xc8a86a, a: 0x4a2a1a, draw: (g, now, x, hy, c, a) => {
    // 骷髅头冠：长吻恐龙头骨
    g.fillStyle(0xd8c090, 1); g.fillEllipse(x, hy - 16, 26, 20);
    g.fillStyle(c, 1); g.fillPoints([{ x: x - 6, y: hy - 14 }, { x: x + 6, y: hy - 14 }, { x: x + 3, y: hy - 1 }, { x: x - 3, y: hy - 1 }] as never, true);
    g.fillStyle(0x1a1208, 1); g.fillEllipse(x - 8, hy - 20, 4, 5); g.fillEllipse(x + 8, hy - 20, 4, 5);
    for (let k = 0; k < 4; k++) { g.fillStyle(0xf0e8d0, 1); g.fillTriangle(x - 5 + k * 3.4, hy - 8, x - 2 + k * 3.4, hy - 8, x - 3.5 + k * 3.4, hy - 3); }
    g.fillStyle(a, 1); g.fillEllipse(x, hy - 28, 18, 5);
    void now;
  } },
  crawJaw: { c: 0xc8a86a, a: 0x4a2a1a, draw: (g, now, x, hy, c, a) => {
    // 巨颌头饰：张开的下颌巨口
    const jaw = Math.sin(now / 600) * 2;
    g.fillStyle(0x6a4526, 1); g.fillPoints([{ x: x - 20, y: hy - 14 }, { x: x + 20, y: hy - 14 }, { x: x + 14, y: hy - 3 }, { x: x - 14, y: hy - 3 }] as never, true);
    g.fillStyle(0x1a0808, 1); g.fillPoints([{ x: x - 16, y: hy - 12 }, { x: x + 16, y: hy - 12 }, { x: x + 12, y: hy - 6 }, { x: x - 12, y: hy - 6 }] as never, true);
    for (let k = 0; k < 7; k++) { const px = x - 15 + k * 5; g.fillStyle(c, 1); g.fillTriangle(px - 2, hy - 12, px + 2, hy - 12, px, hy - 6); }
    g.fillStyle(0x6a4526, 1); g.fillRect(x - 18, hy - 1 + jaw, 36, 5);
    g.fillStyle(a, 0.5); g.fillCircle(x, hy - 9, 4);
  } },
  // ── muto 辐射巨虫 ──
  mutoShell: { c: 0x5a6a3a, a: 0x7dff5a, draw: (g, now, x, hy, c, a) => {
    // 甲壳头冠：分节甲壳 + 尖角
    for (let k = 0; k < 4; k++) { g.fillStyle(k % 2 ? c : 0x46522e, 1); g.fillRoundedRect(x - 16, hy - 6 - k * 7, 32, 8, 3); }
    g.fillStyle(c, 1); g.fillTriangle(x - 14, hy - 28, x - 6, hy - 28, x - 10, hy - 37); g.fillTriangle(x + 6, hy - 28, x + 14, hy - 28, x + 10, hy - 37);
    g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 400)); g.fillTriangle(x - 4, hy - 30, x + 4, hy - 30, x, hy - 39);
  } },
  mutoAntenna: { c: 0x5a6a3a, a: 0x7dff5a, draw: (g, now, x, hy, c, a) => {
    // 辐射触须：两根发光触须
    g.fillStyle(0x3a4a2a, 1); g.fillRoundedRect(x - 12, hy - 8, 24, 7, 3);
    for (const s of [-1, 1]) { const sw = Math.sin(now / 400 + s * 1.5) * 4; g.lineStyle(3, c, 1); g.lineBetween(x + s * 6, hy - 8, x + s * 12 + sw, hy - 20); g.lineBetween(x + s * 12 + sw, hy - 20, x + s * 10 + sw * 1.6, hy - 32); g.fillStyle(a, 0.45 + 0.4 * Math.sin(now / 300 + s)); g.fillCircle(x + s * 10 + sw * 1.6, hy - 33, 3); }
  } },
  // ── behe 贝希摩斯 ──
  beheHorn: { c: 0x5a4030, a: 0x8a6a4a, draw: (g, now, x, hy, c, a) => {
    // 巨角头冠：巨大鼻角 + 尖角冠
    g.fillStyle(0x4a3428, 1); g.fillRoundedRect(x - 16, hy - 10, 32, 9, 4);
    g.fillStyle(c, 1); g.fillPoints([{ x: x - 5, y: hy - 10 }, { x: x + 5, y: hy - 10 }, { x: x + 2, y: hy - 35 }, { x: x - 2, y: hy - 35 }] as never, true);
    for (const s of [-1, 1]) { g.fillStyle(a, 1); g.fillPoints([{ x: x + s * 12, y: hy - 10 }, { x: x + s * 17, y: hy - 12 }, { x: x + s * 15, y: hy - 24 }, { x: x + s * 11, y: hy - 22 }] as never, true); }
    g.fillStyle(0xf0e8d0, 0.45); g.fillCircle(x, hy - 33, 2);
    void now;
  } },
  beheSkull: { c: 0x5a4030, a: 0x8a6a4a, draw: (g, now, x, hy, c, a) => {
    // 兽颅头罩：厚重兽颅 + 角
    g.fillStyle(0x4a3428, 1); g.fillEllipse(x, hy - 16, 34, 30);
    g.fillStyle(c, 1); g.fillEllipse(x, hy - 15, 30, 26);
    g.fillStyle(0xe0d4b8, 1); g.fillPoints([{ x: x - 9, y: hy - 25 }, { x: x + 9, y: hy - 25 }, { x: x + 6, y: hy - 4 }, { x: x - 6, y: hy - 4 }] as never, true);
    g.fillStyle(0x101010, 1); g.fillEllipse(x - 10, hy - 16, 5, 6); g.fillEllipse(x + 10, hy - 16, 5, 6);
    for (const s of [-1, 1]) { g.fillStyle(a, 1); g.fillPoints([{ x: x + s * 13, y: hy - 22 }, { x: x + s * 21, y: hy - 28 }, { x: x + s * 18, y: hy - 16 }] as never, true); }
    void now;
  } },
};
