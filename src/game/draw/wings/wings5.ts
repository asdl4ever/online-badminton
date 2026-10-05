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
  // 蛾翼：毛茸双叶翼 + 眼斑 + 鳞粉
  moth: { c: 0xc8a87a, a: 0x8a6242, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    wpoly(g, [[2, 0], [20, -34 - f], [48, -44 - f], [56, -24 - f], [34, -2]], c, 0.95);
    wpoly(g, [[2, 2], [16, -12 - f * 0.6], [36, -18 - f * 0.6], [40, -4 - f * 0.6], [22, 8]], a, 0.85);
    // 眼斑（外环内珠）
    g.fillStyle(0x3a2a1c, 0.9);
    g.fillCircle(34, -28 - f, 5.4);
    g.fillStyle(0xfff0c0, 0.95);
    g.fillCircle(34, -28 - f, 2.6);
    g.fillStyle(0x3a2a1c, 0.6);
    g.fillCircle(24, -8 - f * 0.6, 2.4);
    // 鳞粉
    for (let k = 0; k < 4; k++) {
      const ph = (now / 900 + k / 4) % 1;
      g.fillStyle(0xfff0c0, 0.6 * (1 - ph));
      g.fillCircle(30 + ph * 16, -40 - f - ph * 12, 1.2);
    }
  } },
  // 夜鹰：镰刀状疾翼 + 白翼杠 + 残影
  nightjar: { c: 0x2a3442, a: 0xe8ecf4, draw: (g, now, flap, c, a) => {
    const f = flap * 8;
    wpoly(g, [[2, 0], [40, -40 - f], [88, -50 - f], [58, -14 - f], [24, 6]], c, 0.96);
    wline(g, [[2, 0], [40, -40 - f], [86, -48 - f]], 2, a, 0.9);
    // 白翼杠两道
    g.lineStyle(2.6, a, 0.85);
    g.lineBetween(30, -24 - f, 58, -32 - f);
    g.lineBetween(24, -14 - f, 50, -20 - f);
    // 疾飞残影
    g.lineStyle(1.6, a, 0.3);
    g.lineBetween(4, 2, 20, -14 - f + 6);
    g.lineBetween(6, 4, 24, -8 - f + 8);
  } },
  // 玫瑰：层叠花瓣翼 + 藤蔓 + 飘落花瓣
  rosewing: { c: 0xe86a8a, a: 0x4fae4a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    for (let k = 0; k < 4; k++) {
      const t = k / 3;
      g.save();
      g.translateCanvas(4 + t * 34, 2 - t * (26 + f));
      g.rotateCanvas(-0.5 + t * 0.5);
      g.fillStyle(k % 2 ? 0xd8587a : c, 0.95);
      g.fillEllipse(0, 0, 30 - k * 3, 16 - k * 2);
      g.fillStyle(0xffffff, 0.3);
      g.fillEllipse(-4, -2, 10, 4);
      g.restore();
    }
    // 藤蔓卷须
    g.lineStyle(2, a, 0.9);
    g.beginPath();
    g.arc(52, -44 - f, 6, now / 500, now / 500 + 4);
    g.strokePath();
    // 飘落花瓣
    for (let k = 0; k < 3; k++) {
      const ph = (now / 1100 + k / 3) % 1;
      g.fillStyle(0xffb0c0, 0.8 * (1 - ph));
      g.fillEllipse(40 + k * 12, -30 - f + ph * 26, 5, 3);
    }
  } },
  // 等离子：无膜能量翼（双弧光束 + 核心线 + 电弧抖动）
  plasmaWing: { c: 0x5ac8ff, a: 0xb46cff, draw: (g, now, flap, c, a) => {
    const f = flap * 7;
    for (let k = 0; k < 3; k++) {
      const r = 30 + k * 18;
      const flick = 0.7 + 0.3 * Math.sin(now / 90 + k * 2);
      g.lineStyle(3 - k * 0.6, k % 2 ? a : c, flick * (0.9 - k * 0.15));
      g.beginPath();
      g.arc(0, 4, r, -Math.PI * 0.92 + flap * 0.1, -Math.PI * 0.14 + flap * 0.1);
      g.strokePath();
    }
    // 核心连线 + 沿途亮珠
    wline(g, [[2, 4], [40, -26 - f], [76, -34 - f]], 1.6, 0xffffff, 0.8);
    for (let k = 0; k < 3; k++) {
      const ph = (now / 240 + k / 3) % 1;
      g.fillStyle(0xffffff, 0.9 * (1 - ph));
      g.fillCircle(20 + ph * 56, -14 - ph * (18 + f), 2);
    }
  } },
  // 剧毒：滴液毒膜翼 + 气泡
  toxicWing: { c: 0x8fd44a, a: 0x3a9a5a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 2], [28, -30 - f], [60, -48 - f], [84, -36 - f], [58, -6], [30, 8]], c, 0.85);
    wpoly(g, [[8, 0], [30, -24 - f], [54, -38 - f], [70, -28 - f], [48, -2]], 0xb8e87a, 0.45);
    wline(g, [[4, 0], [32, -26 - f], [56, -42 - f]], 1.6, a, 0.85);
    // 翼缘毒滴（三滴下坠）
    for (let k = 0; k < 3; k++) {
      const ph = (now / 800 + k / 3) % 1;
      g.fillStyle(0xb8e87a, 0.85 * (1 - ph));
      g.fillCircle(20 + k * 20, -6 - f * 0.4 + ph * 16, 2.2 * (1 - ph) + 1);
    }
    // 气泡
    g.fillStyle(0xd8ffb0, 0.5);
    g.fillCircle(40, -26 - f, 2.4);
    g.fillCircle(58, -34 - f, 1.8);
  } },
  // 机甲：三段装甲板翼 + 铆钉 + 尾喷口
  mechWing: { c: 0x8a94a2, a: 0x5ac8ff, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    for (let k = 0; k < 3; k++) {
      const bx = 4 + k * 22, by = 2 - k * (12 + f * 0.5);
      g.save();
      g.translateCanvas(bx, by);
      g.rotateCanvas(-0.35 - k * 0.18);
      g.fillStyle(k % 2 ? 0x98a2b2 : c, 0.98);
      g.fillRoundedRect(0, -8, 30 - k * 4, 14 - k * 2, 3);
      g.fillStyle(0x5a6472, 0.9);
      g.fillRoundedRect(0, -8, 30 - k * 4, 4, 2);
      g.fillStyle(a, 0.9);
      g.fillCircle(4, 0, 1.4);
      g.fillCircle(12, 0, 1.4);
      g.restore();
    }
    // 尾喷口蓝焰
    const th = 0.6 + 0.4 * Math.sin(now / 70);
    g.fillStyle(a, th);
    g.fillCircle(2, 6, 4);
    g.fillStyle(0xffffff, th * 0.8);
    g.fillCircle(2, 6, 1.8);
  } },
  // 藤叶：叶脉大叶两片 + 卷须藤蔓
  leafyWing: { c: 0x8fbf5a, a: 0x4a7a3a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 2], [26, -34 - f], [54, -50 - f], [46, -12 - f], [24, 8]], c, 0.97);
    wpoly(g, [[8, 4], [30, -18 - f], [52, -26 - f], [40, 4]], 0xa8d87a, 0.9);
    // 叶脉（主脉 + 侧脉）
    wline(g, [[4, 2], [30, -30 - f], [50, -44 - f]], 2, a, 0.9);
    for (let k = 0; k < 4; k++) {
      const t = 0.25 + k * 0.18;
      wline(g, [[4 + 26 * t, 2 - 32 * t - f * t], [4 + 26 * t + 10, 2 - 32 * t - f * t - 6]], 1.2, a, 0.6);
    }
    // 卷须
    g.lineStyle(1.8, a, 0.85);
    g.beginPath();
    g.arc(58, -40 - f, 5, now / 600, now / 600 + 4.4);
    g.strokePath();
  } },
  // 余烬：焦炭翼 + 翼缘裂纹火光 + 升腾火星
  emberWing: { c: 0x3a2a2a, a: 0xff7a2a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 4], [26, -32 - f], [56, -50 - f], [82, -38 - f], [58, -6], [30, 8]], c, 0.98);
    // 裂纹火光（脉冲）
    const pulse = 0.5 + 0.5 * Math.sin(now / 240);
    g.lineStyle(2, a, 0.35 + pulse * 0.45);
    g.lineBetween(14, -10, 28, -26 - f);
    g.lineBetween(28, -26 - f, 24, -36 - f);
    g.lineBetween(40, -30 - f, 56, -42 - f);
    g.lineBetween(56, -42 - f, 54, -48 - f);
    g.lineBetween(30, 2, 44, -12 - f);
    // 火星升腾
    for (let k = 0; k < 4; k++) {
      const ph = (now / 600 + k / 4) % 1;
      g.fillStyle(k % 2 ? a : 0xffd45c, 0.8 * (1 - ph));
      g.fillCircle(30 + k * 13, -44 - f - ph * 18, 1.8 * (1 - ph) + 0.6);
    }
  } },
};
