import { TAU, hpoly, type HatArt } from './shared';

/** 批十四头饰（年兽迎春 / 月夜狼族 / 末日丧尸 / 大便人厕所） */

export const HATS_17: Record<string, HatArt> = {
  // ── 年兽迎春 ──
  nianHatA: { c: 0xb02a2a, a: 0xffd45c, draw: (g, _now, x, hy, c, a) => {
    // 瓜皮帽：红缎圆帽 + 金线暗格 + 顶部金顶珠
    g.fillStyle(0x8a1a1a, 1);
    g.fillRoundedRect(x - 14, hy - 3, 28, 5, 2.4);
    g.fillStyle(c, 1);
    g.beginPath(); g.arc(x, hy + 1, 14, Math.PI, TAU); g.closePath(); g.fillPath();
    g.lineStyle(1, a, 0.6);
    for (let k = -2; k <= 2; k++) g.lineBetween(x + k * 5, hy - 12, x + k * 4, hy - 3);
    g.lineBetween(x - 11, hy - 8, x + 11, hy - 8);
    g.fillStyle(a, 1);
    g.fillCircle(x, hy - 13, 3.4);
    g.fillStyle(0xfff0b0, 0.8);
    g.fillCircle(x - 1, hy - 14, 1.2);
  } },
  nianHatB: { c: 0xffd45c, a: 0xd93a3a, draw: (g, now, x, hy, c, a) => {
    // 龙头魁冠：金冠 + 两侧龙角 + 中央宝珠 + 龙须
    g.fillStyle(c, 1);
    g.fillRoundedRect(x - 15, hy - 6, 30, 7, 3);
    for (const s of [-1, 1]) {
      g.fillStyle(0xd9b45c, 1);
      hpoly(g, [[x + s * 10, hy - 6], [x + s * 18, hy - 16], [x + s * 21, hy - 10], [x + s * 13, hy - 4]], 0xd9b45c, 1);
      g.fillStyle(0xfff0b0, 0.7);
      hpoly(g, [[x + s * 12, hy - 7], [x + s * 17, hy - 14], [x + s * 18, hy - 11], [x + s * 13, hy - 6]], 0xfff0b0, 0.7);
    }
    const gl = 0.7 + 0.3 * Math.sin(now / 300);
    g.fillStyle(a, 0.95);
    g.fillCircle(x, hy - 9, 4.4);
    g.fillStyle(0xff6a6a, gl);
    g.fillCircle(x - 1, hy - 10, 1.6);
    g.lineStyle(1.4, 0xfff0b0, 0.8);
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(x + s * 13, hy - 2);
      g.lineTo(x + s * 17, hy + 3);
      g.lineTo(x + s * 15 + Math.sin(now / 300) * 2, hy + 7);
      g.strokePath();
    }
  } },
  // ── 月夜狼族 ──
  wolfHatA: { c: 0x3a3a52, a: 0xc0c8d8, draw: (g, now, x, hy, c, a) => {
    // 狼耳兜帽：兜帽 + 两只尖狼耳 + 边缘毛，帽下露出红光眼
    g.fillStyle(c, 1);
    g.beginPath(); g.arc(x, hy + 1, 15, Math.PI, TAU); g.closePath(); g.fillPath();
    for (const s of [-1, 1]) {
      g.fillStyle(c, 1);
      hpoly(g, [[x + s * 6, hy - 9], [x + s * 10, hy - 24], [x + s * 14, hy - 8]], c, 1);
      g.fillStyle(0x8a94a2, 0.9);
      hpoly(g, [[x + s * 8, hy - 10], [x + s * 10, hy - 19], [x + s * 12, hy - 9]], 0x8a94a2, 0.9);
    }
    for (let k = 0; k < 9; k++) { g.fillStyle(a, 0.75); g.fillCircle(x - 14 + k * 3.5, hy - 1, 1.8); }
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    for (const s of [-1, 1]) { g.fillStyle(0xff3a4a, gl); g.fillCircle(x + s * 5, hy + 2, 1.4); }
  } },
  wolfHatB: { c: 0xc0c8d8, a: 0xff3a4a, draw: (g, now, x, hy, c, a) => {
    // 啸月狼盔：银盔 + 前突狼吻 + 顶部血月徽 + 獠牙
    g.fillStyle(c, 1);
    g.beginPath(); g.arc(x, hy + 1, 14, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(0x9aa4b2, 0.7);
    g.fillEllipse(x - 3, hy - 7, 11, 6);
    g.fillStyle(c, 1);
    hpoly(g, [[x - 6, hy - 2], [x + 6, hy - 2], [x + 3, hy + 5], [x - 3, hy + 5]], c, 1);
    g.fillStyle(a, 0.9);
    g.fillEllipse(x, hy + 5, 4, 2.4);
    const gl = 0.6 + 0.4 * Math.sin(now / 320);
    g.fillStyle(0x8a1a2a, 0.9);
    g.fillCircle(x, hy - 12, 5);
    g.fillStyle(a, gl);
    g.fillCircle(x, hy - 12, 3);
    for (const s of [-1, 1]) { g.fillStyle(0xf0f4f8, 0.95); g.fillTriangle(x + s * 4, hy + 1, x + s * 6, hy + 1, x + s * 5, hy + 5); }
    g.lineStyle(1.2, 0x6a7482, 0.8);
    g.beginPath(); g.arc(x, hy + 1, 14, Math.PI, TAU); g.strokePath();
  } },
  // ── 末日丧尸 ──
  zombHatA: { c: 0x4a5a3a, a: 0x9cff3a, draw: (g, now, x, hy, c, a) => {
    // 生化面罩：面罩体 + 双圆镜 + 滤毒罐 + 排气阀 + 危标
    g.fillStyle(c, 1);
    g.fillRoundedRect(x - 14, hy - 8, 28, 12, 4);
    for (const s of [-1, 1]) {
      g.fillStyle(0x1a2016, 1); g.fillCircle(x + s * 6, hy - 2, 5);
      g.fillStyle(a, 0.5); g.fillCircle(x + s * 6, hy - 2, 3.6);
      g.fillStyle(0xd8ffd8, 0.7); g.fillCircle(x + s * 6 - 1, hy - 3.4, 1.2);
    }
    g.fillStyle(0x3a4430, 1); g.fillRoundedRect(x - 4, hy + 2, 8, 8, 2);
    g.fillStyle(0x6a7a5a, 1); g.fillEllipse(x, hy + 3, 8, 3);
    const br = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(0x8a9a6a, 0.5 + 0.3 * br); g.fillCircle(x + 11, hy - 2, 2.2);
    g.lineStyle(1.2, a, 0.9);
    g.beginPath(); g.arc(x, hy - 5, 3.4, 0, TAU); g.strokePath();
    g.fillStyle(a, 0.9); g.fillCircle(x, hy - 5, 1.2);
  } },
  zombHatB: { c: 0x6a6a5a, a: 0x9cff3a, draw: (g, _now, x, hy, c, a) => {
    // 破损钢盔：旧钢盔 + 弹孔 + 破口 + 污渍 + 系带
    g.fillStyle(c, 1);
    g.beginPath(); g.arc(x, hy + 1, 15, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(0x50504a, 0.7); g.fillEllipse(x - 4, hy - 7, 12, 6);
    g.fillRoundedRect(x - 16, hy - 2, 32, 5, 2.4);
    g.fillStyle(0x1a1a16, 1); g.fillCircle(x + 7, hy - 6, 2.2);
    g.fillStyle(0x0a0a08, 1); g.fillCircle(x + 7, hy - 6, 1);
    hpoly(g, [[x - 12, hy - 8], [x - 9, hy - 12], [x - 7, hy - 8], [x - 5, hy - 11], [x - 3, hy - 8]], 0x1a1a16, 1);
    g.fillStyle(0x8a1a1a, 0.4); g.fillEllipse(x - 5, hy - 4, 7, 4);
    g.fillStyle(a, 0.85); g.fillCircle(x - 6, hy - 2, 1.6);
    g.lineStyle(1.4, 0x3a3a30, 0.9);
    g.lineBetween(x - 13, hy - 1, x - 15, hy + 8);
    g.lineBetween(x + 13, hy - 1, x + 15, hy + 8);
  } },
  // ── 大便人厕所 ──
  toilHatA: { c: 0xf0e8d8, a: 0x8fd8ff, draw: (g, now, x, hy, c, a) => {
    // 卷纸帽：头顶一卷卫生纸 + 垂下一段纸，纸角随风飘
    g.fillStyle(0xe0d8c8, 1); g.fillRoundedRect(x - 11, hy - 14, 22, 16, 3);
    g.fillStyle(c, 1); g.fillEllipse(x, hy - 13, 22, 7);
    g.fillStyle(0xcfc6b4, 1); g.fillEllipse(x, hy - 13, 12, 4);
    g.fillStyle(0xffffff, 0.9); g.fillEllipse(x, hy - 13, 6, 2.4);
    const sw = Math.sin(now / 500) * 3;
    g.fillStyle(0xffffff, 0.96);
    hpoly(g, [[x + 4, hy - 8], [x + 13, hy - 6], [x + 15 + sw, hy + 4], [x + 6 + sw, hy + 6]], 0xffffff, 0.96);
    g.fillStyle(0xd8d0c0, 0.5);
    hpoly(g, [[x + 4, hy - 8], [x + 9, hy - 7], [x + 10 + sw, hy + 3], [x + 6 + sw, hy + 6]], 0xd8d0c0, 0.5);
    g.lineStyle(1, 0xbfb6a4, 0.8);
    for (let k = 0; k < 5; k++) g.lineBetween(x + 5 + k * 2, hy - 6, x + 6 + k * 2, hy + 5);
    void a;
  } },
  toilHatB: { c: 0xc04a2a, a: 0xd86a2a, draw: (g, now, x, hy, c, a) => {
    // 搋子头盔：倒扣的橡胶皮碗 + 顶上一根木柄
    const bob = Math.sin(now / 700) * 1.5;
    g.fillStyle(c, 1);
    g.fillEllipse(x, hy - 4 + bob, 30, 16);
    g.fillStyle(0x8a2a1a, 0.7); g.fillEllipse(x, hy - 8 + bob, 20, 8);
    for (let k = -3; k <= 3; k++) { g.fillStyle(0x8a2a1a, 0.5); g.fillCircle(x + k * 4.4, hy + 2 + bob, 1.6); }
    g.fillStyle(0x8a5a2a, 1); g.fillRoundedRect(x - 2, hy - 24 + bob, 4, 18, 2);
    g.fillStyle(0xa8783a, 0.7); g.fillRect(x - 2, hy - 24 + bob, 1.4, 18);
    g.fillStyle(a, 0.3 + 0.2 * Math.sin(now / 400)); g.fillEllipse(x, hy - 4 + bob, 24, 9);
  } },
};
