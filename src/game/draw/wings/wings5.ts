import { wpoly, wline, type WingArt } from './shared';

/**
 * 第五批翅膀——**老款迁移精绘**（原 feather 系换色款逐只重画）：
 * 天使 / 圣羽 / 羽暴 / 凤凰 / 幽翼 / 流萤。只画右翼，左翼由入口镜像。
 */
export const WINGS_5: Record<string, WingArt> = {
  // 天使：三层白羽列（羽根金环），羽尖泛光
  angel: { c: 0xf6f6fa, a: 0xffd45c, draw: (g, now, flap, c, a) => {
    const f = flap * 7;
    for (let row = 0; row < 3; row++) {
      const n = 5 - row, y0 = 6 - row * 8, len = 62 - row * 10;
      for (let k = 0; k < n; k++) {
        const t = k / Math.max(1, n - 1);
        const bx = 4 + row * 6, by = y0 - t * (14 + f * 0.5);
        const ang = -Math.PI / 2.6 + t * 0.95;
        const cos = Math.cos(ang), sin = Math.sin(ang);
        const vs = [];
        for (let s = 0; s <= 4; s++) {
          const u = s / 4;
          vs.push({ x: bx + cos * len * u - sin * 5.4 * Math.sin(u * Math.PI), y: by + sin * len * u + cos * 5.4 * Math.sin(u * Math.PI) });
        }
        for (let s = 4; s >= 0; s--) {
          const u = s / 4;
          vs.push({ x: bx + cos * len * u + sin * 5.4 * Math.sin(u * Math.PI), y: by + sin * len * u - cos * 5.4 * Math.sin(u * Math.PI) });
        }
        g.fillStyle(row === 2 ? 0xe4e4ec : c, 0.98 - row * 0.05);
        g.fillPoints(vs as never, true);
      }
    }
    // 金色羽环 + 光点
    g.lineStyle(2.2, a, 0.9);
    g.strokeCircle(10, -2, 9);
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 300));
    g.fillStyle(a, tw);
    g.fillCircle(58, -52 - f * 0.6, 2.4);
    g.fillCircle(78, -38 - f * 0.6, 1.8);
  } },
  // 圣羽：金边白翼 + 背后一轮光环射线
  holyWing: { c: 0xfff6dc, a: 0xf2c14a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 4], [26, -34 - f], [56, -58 - f], [88, -46 - f], [70, -10], [34, 10]], c);
    wpoly(g, [[8, 2], [30, -30 - f], [58, -50 - f], [80, -42 - f], [62, -8]], a, 0.28);
    // 五根金羽轴
    wline(g, [[4, 2], [30, -30 - f], [54, -50 - f]], 1.6, a, 0.9);
    wline(g, [[6, 4], [36, -22 - f], [66, -34 - f]], 1.4, a, 0.7);
    wline(g, [[6, 6], [40, -12 - f], [72, -18 - f]], 1.4, a, 0.6);
    // 翼尖三粒圣光
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 260));
    g.fillStyle(a, tw);
    g.fillCircle(84, -44 - f, 2.8);
    g.fillCircle(66, -52 - f, 2.2);
    g.fillCircle(46, -54 - f, 1.8);
  } },
  // 羽暴：羽毛被风撕着往外飞（一排离散羽毛，相位乱飞）
  featherStorm: { c: 0xbfe0ff, a: 0x6fa8e8, draw: (g, now, flap, c, a) => {
    const f = flap * 8;
    for (let k = 0; k < 7; k++) {
      const t = k / 6;
      const drift = Math.sin(now / 300 + k * 1.7) * (4 + t * 8);
      const bx = 6 + t * 66, by = 2 - t * (40 + f);
      const ang = -1.15 + t * 0.8 + drift * 0.02;
      const cos = Math.cos(ang), sin = Math.sin(ang);
      const len = 20 + (k % 3) * 8;
      const vs = [
        { x: bx - sin * 4, y: by + cos * 4 },
        { x: bx + cos * len, y: by + sin * len },
        { x: bx + sin * 4, y: by - cos * 4 },
      ];
      g.fillStyle(k % 2 ? a : c, 0.85 - t * 0.25);
      g.fillPoints(vs as never, true);
    }
    // 风痕
    g.lineStyle(1.4, a, 0.4);
    g.lineBetween(10, -18 - f, 34, -34 - f);
    g.lineBetween(18, -4, 48, -16 - f);
  } },
  // 凤凰：焰羽三层（外焰/中焰/焰芯）+ 上飘的火羽
  phoenix: { c: 0xe8562a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
    const f = flap * 7;
    wpoly(g, [[2, 4], [24, -38 - f], [58, -60 - f], [90, -42 - f], [64, -8], [32, 10]], 0xb83a1a, 0.9);
    wpoly(g, [[6, 2], [28, -30 - f], [58, -48 - f], [80, -36 - f], [58, -6]], c, 0.95);
    wpoly(g, [[10, 0], [32, -20 - f], [54, -30 - f], [66, -22 - f], [48, -2]], a, 0.75);
    // 焰羽上飘
    for (let k = 0; k < 5; k++) {
      const ph = (now / 500 + k / 5) % 1;
      g.fillStyle(k % 2 ? a : 0xfff0b0, 0.8 * (1 - ph));
      g.fillCircle(30 + k * 12, -52 - f - ph * 22, 3 * (1 - ph) + 0.8);
    }
    wline(g, [[2, 4], [24, -38 - f], [58, -60 - f], [90, -42 - f]], 2, a, 0.9);
  } },
  // 幽翼：半透明幽膜 + 骨节翼骨 + 消散的幽绿粒子
  ghostWing: { c: 0x8a7ae8, a: 0x9effd0, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 2], [30, -32 - f], [62, -52 - f], [86, -38 - f], [60, -6], [30, 8]], c, 0.42);
    wpoly(g, [[6, 0], [30, -24 - f], [52, -38 - f], [70, -28 - f], [48, -2]], 0xc8bcff, 0.3);
    // 三根翼骨
    wline(g, [[2, 2], [34, -28 - f], [60, -46 - f]], 2.4, 0xe8e0ff, 0.85);
    wline(g, [[4, 4], [40, -16 - f], [68, -24 - f]], 2, 0xe8e0ff, 0.7);
    // 幽绿消散粒子
    for (let k = 0; k < 4; k++) {
      const ph = (now / 700 + k / 4) % 1;
      g.fillStyle(a, 0.7 * (1 - ph));
      g.fillCircle(44 + k * 10, -40 - f - ph * 16, 2.2 * (1 - ph) + 0.6);
    }
  } },
  // 流萤：暗翼 + 翼缘一圈会呼吸的流萤
  fireflyWing: { c: 0x2a3442, a: 0xd8ff6a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 4], [28, -30 - f], [58, -50 - f], [82, -40 - f], [60, -8], [32, 8]], c, 0.95);
    wpoly(g, [[8, 2], [30, -26 - f], [52, -40 - f], [68, -32 - f], [50, -4]], 0x3a4a5c, 0.7);
    wline(g, [[4, 2], [30, -26 - f], [54, -44 - f]], 1.4, 0x55627a, 0.9);
    // 流萤（六点呼吸，各带光晕）
    for (let k = 0; k < 6; k++) {
      const tw = 0.25 + 0.75 * Math.abs(Math.sin(now / 320 + k * 2.1));
      const px = 22 + (k % 3) * 24, py = -30 - f - (k % 2) * 14 + Math.sin(now / 400 + k) * 3;
      g.fillStyle(a, tw * 0.3);
      g.fillCircle(px, py, 5);
      g.fillStyle(a, tw);
      g.fillCircle(px, py, 1.8);
    }
  } },
};
