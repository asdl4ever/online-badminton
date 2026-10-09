import { handle, pommel, poly, line, type WeaponArt } from './shared';

/** 批十四球拍皮肤（年兽迎春 / 月夜狼族 / 末日丧尸 / 大便人厕所） */

export const WEAPONS_17: Record<string, WeaponArt> = {
  // ── 年兽迎春 ──
  nianRacketA: { c: 0xd93a3a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 醒狮球拍：拍面化作一颗醒狮头——金鬃圈 + 红狮脸 + 独角 + 大眼獠牙
    handle(g, -14, -2, 6, 0x6a1a1a);
    pommel(g, -15, 2.6, a);
    for (let k = 0; k < 10; k++) { // 金鬃
      const ang = (k / 10) * Math.PI * 2;
      g.fillStyle(a, 0.95);
      g.fillCircle(12 + Math.cos(ang) * 15, Math.sin(ang) * 15, 5);
    }
    g.fillStyle(c, 1);
    g.fillCircle(12, 0, 14);
    g.fillStyle(0xffd45c, 1); // 吻
    g.fillEllipse(20, 5, 11, 8);
    g.fillStyle(a, 1); // 独角
    g.fillTriangle(8, -12, 14, -12, 6, -25);
    for (const s of [-1, 1]) { // 大眼
      g.fillStyle(0x1a1a1e, 1); g.fillCircle(12 + s * 4, -3, 3.6);
      g.fillStyle(0xffffff, 0.9); g.fillCircle(12 + s * 4 - 1, -4, 1.2);
    }
    g.fillStyle(0x8a1a1a, 1); g.fillEllipse(20, 8, 9, 5); // 口
    for (let k = 0; k < 4; k++) { g.fillStyle(0xf0f4f8, 0.95); g.fillTriangle(16 + k * 3, 6, 18 + k * 3, 6, 17 + k * 3, 10); }
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(0xfff0b0, gl); g.fillCircle(12, 0, 3);
  } },
  nianRacketB: { c: 0xffd45c, a: 0xd93a3a, draw: (g, now, c, a) => {
    // 如意金箍·拍：一根两头如意云头、缠着金箍的黄金棒
    handle(g, -14, -2, 7, 0x8a5a1a);
    pommel(g, -15, 3, a);
    g.fillStyle(c, 1);
    g.fillRoundedRect(-2, -5, 32, 10, 4); // 棒身
    g.fillStyle(0xfff0b0, 0.6); g.fillRect(-2, -4, 32, 2.4);
    for (const bx of [1, 20]) { // 金箍
      g.fillStyle(a, 1); g.fillRoundedRect(bx, -6, 5, 12, 2);
      g.fillStyle(0xfff0b0, 0.7); g.fillRect(bx, -5, 5, 1.6);
    }
    // 两头如意云头
    for (const [ex, s] of [[0, -1], [28, 1]] as Array<[number, number]>) {
      g.fillStyle(c, 1);
      g.fillCircle(ex, -6, 4.4); g.fillCircle(ex, 6, 4.4);
      g.fillCircle(ex + s * 4, 0, 5);
      g.fillStyle(a, 0.4); g.fillCircle(ex + s * 4, 0, 2);
    }
    const gl = 0.6 + 0.4 * Math.sin(now / 300);
    g.fillStyle(0xffffff, gl * 0.5); g.fillCircle(30, 0, 2.4);
  } },
  // ── 月夜狼族 ──
  wolfRacketA: { c: 0x8a94a2, a: 0xc0c8d8, draw: (g, _now, c, a) => {
    // 狼牙棒·拍：拍面化作一根狼牙棒——铁球头 + 一圈尖齿 + 缠柄
    handle(g, -15, -2, 7, 0x3a3a52);
    pommel(g, -16, 2.8, a);
    g.fillStyle(c, 1);
    g.fillRoundedRect(-2, -4, 12, 8, 3);
    g.fillStyle(0x6a7482, 1); g.fillCircle(14, 0, 13); // 铁球头
    g.fillStyle(c, 1); g.fillCircle(14, 0, 11);
    for (let k = 0; k < 10; k++) { // 尖齿
      const ang = (k / 10) * Math.PI * 2;
      g.fillStyle(a, 1);
      g.fillTriangle(
        14 + Math.cos(ang - 0.14) * 10, Math.sin(ang - 0.14) * 10,
        14 + Math.cos(ang + 0.14) * 10, Math.sin(ang + 0.14) * 10,
        14 + Math.cos(ang) * 19, Math.sin(ang) * 19,
      );
    }
    g.fillStyle(0x3a3a52, 0.8); g.fillCircle(14, 0, 4);
  } },
  wolfRacketB: { c: 0xc0c8d8, a: 0xff3a4a, draw: (g, now, c, a) => {
    // 月牙刃·拍：拍面化作一弯双月牙刃，刃口泛冷光
    handle(g, -15, -2, 6, 0x2a2a44);
    pommel(g, -16, 2.6, a);
    g.fillStyle(c, 1);
    poly(g, [[-1, -16], [16, -20], [30, -6], [26, 0], [10, -8], [-1, -4]], c, 0.98);
    poly(g, [[-1, 16], [16, 20], [30, 6], [26, 0], [10, 8], [-1, 4]], c, 0.98);
    g.fillStyle(0x8a94a2, 0.7);
    poly(g, [[2, -14], [15, -17], [24, -8], [16, -10]], 0x8a94a2, 0.6);
    g.lineStyle(2.4, 0xe8f0ff, 0.9); // 刃口冷光
    line(g, [[-1, -16], [16, -20], [30, -6]], 2.4, 0xe8f0ff, 0.9);
    line(g, [[-1, 16], [16, 20], [30, 6]], 2.4, 0xe8f0ff, 0.9);
    // 中心血月
    const gl = 0.6 + 0.4 * Math.sin(now / 320);
    g.fillStyle(0x8a1a2a, 0.9); g.fillCircle(8, 0, 5);
    g.fillStyle(a, gl); g.fillCircle(8, 0, 3);
  } },
  // ── 末日丧尸 ──
  zombRacketA: { c: 0x8a94a2, a: 0x9cff3a, draw: (g, now, c, a) => {
    // 断管·拍：拍面化作一根折断的水管，接口生锈、断口滴毒
    handle(g, -15, -2, 6.4, 0x4a5a3a);
    pommel(g, -16, 2.6, c);
    g.fillStyle(c, 1);
    g.fillRoundedRect(-2, -4, 20, 8, 3); // 管身
    g.fillStyle(0x6a7482, 0.8); g.fillRect(-2, -3, 20, 2);
    // 折角
    g.save(); g.translateCanvas(18, 0); g.rotateCanvas(-0.5);
    g.fillStyle(c, 1); g.fillRoundedRect(0, -4, 16, 8, 3);
    g.fillStyle(0x6a7482, 0.8); g.fillRect(0, -3, 16, 2);
    g.restore();
    g.fillStyle(0x5a4a2a, 0.9); g.fillCircle(18, 0, 5.4); // 锈接口
    g.fillStyle(0x3a3018, 0.9); g.fillCircle(18, 0, 3);
    // 断口
    g.fillStyle(0x3a4048, 1);
    poly(g, [[30, -8], [36, -6], [34, -1], [37, 3], [30, 6]], 0x3a4048, 1);
    for (let k = 0; k < 2; k++) { const ph = ((now / 700 + k / 2) % 1); g.fillStyle(a, (1 - ph) * 0.9); g.fillEllipse(33, 6 + ph * 12, 2, 3.6); }
  } },
  zombRacketB: { c: 0xb02020, a: 0x8a94a2, draw: (g, _now, c, a) => {
    // 消防斧·拍：拍面化作一柄消防斧，红漆柄 + 钢斧头（前尖后铲）+ 破拆刻字
    handle(g, -16, -2, 7, c);
    pommel(g, -17, 2.8, a);
    // 斧头
    g.fillStyle(a, 1);
    poly(g, [[-1, -10], [10, -15], [24, -6], [26, 0], [24, 6], [10, 15], [-1, 10]], a, 0.98);
    g.fillStyle(0x6a7482, 0.9);
    poly(g, [[2, -6], [12, -11], [18, -3], [12, 2]], 0x6a7482, 0.85);
    // 弧刃
    g.lineStyle(4.4, 0x59616b, 1);
    g.beginPath(); g.moveTo(10, -15); g.lineTo(24, -6); g.lineTo(26, 0); g.lineTo(24, 6); g.lineTo(10, 15); g.strokePath();
    g.lineStyle(2.2, 0xe0e8f0, 0.9);
    g.beginPath(); g.moveTo(10, -15); g.lineTo(24, -6); g.lineTo(26, 0); g.lineTo(24, 6); g.lineTo(10, 15); g.strokePath();
    // 后铲/尖啄
    g.fillStyle(0x59616b, 1); g.fillTriangle(-6, -6, 2, -8, 0, 0);
    g.fillStyle(0x59616b, 1); g.fillTriangle(-6, 6, 2, 8, 0, 0);
    g.fillStyle(0xd8d4c8, 0.8); g.fillRect(4, -1, 16, 2); // 血槽
    g.fillStyle(c, 0.9); g.fillCircle(6, 0, 2.4);
  } },
  // ── 大便人厕所 ──
  toilRacketA: { c: 0xd86a2a, a: 0x8a5a2a, draw: (g, _now, c, a) => {
    // 马桶搋·拍：拍面化作一只橡胶搋子——皮碗 + 木柄 + 边缘褶皱
    handle(g, -15, -6, 6.4, a);
    pommel(g, -16, 2.6, a);
    g.fillStyle(a, 1); g.fillRoundedRect(-8, -2.4, 10, 4.8, 2); // 木柄延伸
    // 皮碗
    g.fillStyle(c, 1);
    poly(g, [[0, -3], [16, -15], [24, -8], [24, 8], [16, 15], [0, 3]], c, 0.98);
    g.fillStyle(0x8a3a1a, 1); g.fillEllipse(22, 0, 8, 26);
    g.fillStyle(0xff9a5a, 0.4); g.fillEllipse(14, -6, 10, 10);
    for (let k = -3; k <= 3; k++) { g.fillStyle(0x8a2a1a, 0.6); g.fillCircle(5, k * 4.4, 1.8); } // 褶皱
  } },
  toilRacketB: { c: 0x8a5a3a, a: 0x8fd8ff, draw: (g, now, c, a) => {
    // 拖把·拍：拍面化作一把拖把——一圈布条 + 金属箍 + 木柄，滴着水
    handle(g, -15, -2, 6.4, c);
    pommel(g, -16, 2.6, 0x6a4228);
    g.fillStyle(0x9aa4b2, 1); g.fillRoundedRect(-2, -4, 10, 8, 2); // 金属箍
    g.fillStyle(0x6a7482, 1); g.fillRect(-1, -3, 8, 1.4);
    for (let k = 0; k < 11; k++) { // 布条
      const sw = Math.sin(now / 500 + k) * 3;
      g.fillStyle(k % 2 ? 0xe8e2d4 : 0xf0eadc, 0.95);
      poly(g, [[8, -12 + k * 2.4], [30 + sw, -14 + k * 2.8], [32 + sw, -8 + k * 2.8], [12, -8 + k * 2.2]], k % 2 ? 0xe8e2d4 : 0xf0eadc, 0.95);
    }
    for (let k = 0; k < 3; k++) { const ph = ((now / 800 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillEllipse(20 + k * 6, 8 + ph * 10, 1.8, 3.2); }
  } },
};
