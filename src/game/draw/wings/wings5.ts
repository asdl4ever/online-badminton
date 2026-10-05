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
  nightjar: { c: 0x2a3442, a: 0xe8ecf4, draw: (g, _now, flap, c, a) => {
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
  // 光羽：五根发光羽轴（轴心白热、外晕呼吸）
  light: { c: 0xfff6d8, a: 0xffe08a, draw: (g, _now, flap, _c, a) => {
    const f = flap * 6;
    for (let k = 0; k < 5; k++) {
      const t = k / 4;
      const bx = 4 + t * 10, by = 4 - t * (12 + f);
      const ang = -1.35 + t * 0.75;
      const len = 46 + (k % 2) * 14;
      g.lineStyle(5, a, 0.22);
      g.lineBetween(bx, by, bx + Math.cos(ang) * len, by + Math.sin(ang) * len);
      g.lineStyle(2.2, 0xffffff, 0.85);
      g.lineBetween(bx, by, bx + Math.cos(ang) * len, by + Math.sin(ang) * len);
      g.fillStyle(0xffffff, 0.7);
      g.fillCircle(bx + Math.cos(ang) * len, by + Math.sin(ang) * len, 2.2);
    }
  } },
  // 圣光：垂直光刃翼（四道光柱 + 顶部光冠）
  shine: { c: 0xfff8e0, a: 0xf2c14a, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    for (let k = 0; k < 4; k++) {
      const bx = 8 + k * 17;
      const h = 40 - Math.abs(k - 1.5) * 10 + f;
      g.fillStyle(c, 0.22);
      g.fillRect(bx - 5, -h - 8, 10, h + 8);
      g.fillStyle(0xffffff, 0.85);
      g.fillRect(bx - 1.6, -h - 6, 3.2, h + 6);
      g.fillStyle(a, 0.7);
      g.fillCircle(bx, -h - 8, 2.6);
    }
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 280));
    g.fillStyle(a, tw);
    g.fillCircle(34, -58 - f, 3);
  } },
  // 星辰：星座翼（星点连线成翼形）
  star: { c: 0x2a2a44, a: 0xfff0b0, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    const pts: Array<[number, number]> = [[4, 4], [20, -18 - f], [40, -36 - f], [62, -46 - f], [84, -40 - f], [66, -18 - f], [44, -6 - f], [24, 4]];
    wline(g, pts, 1.2, a, 0.55);
    for (let k = 0; k < pts.length; k++) {
      const [px, py] = pts[k];
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(now / 300 + k * 1.7));
      g.fillStyle(a, tw);
      g.fillRect(px - 2.4, py - 0.8, 4.8, 1.6);
      g.fillRect(px - 0.8, py - 2.4, 1.6, 4.8);
    }
    g.fillStyle(c, 0.5);
    g.fillCircle(44, -22 - f, 8);
  } },
  // 虹翼：七色叠弧（波纹流动）
  rainbow: { c: 0xffffff, a: 0xff8ad4, draw: (g, now, flap, _c, _a) => {
    const cols = [0xe8404a, 0xff8a3c, 0xffd45c, 0x8fd45a, 0x4ac8ff, 0x5a6ae8, 0xa86ae8];
    for (let k = 0; k < 7; k++) {
      const r = 26 + k * 8;
      const ph = now / 300 + k * 0.14;
      g.lineStyle(4.4, cols[k], 0.85 - k * 0.04);
      g.beginPath();
      g.arc(0, 4, r, -Math.PI * 0.95 + ph * 0.05 + flap * 0.08, -Math.PI * 0.1 + ph * 0.05 + flap * 0.08);
      g.strokePath();
    }
  } },
  // 星河：紫罗兰星云翼 + 旋臂星尘
  galaxy: { c: 0x6a4ae8, a: 0xd8c8ff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 2], [28, -30 - f], [58, -52 - f], [86, -40 - f], [60, -6], [30, 8]], c, 0.55);
    wpoly(g, [[8, 0], [30, -24 - f], [52, -40 - f], [70, -30 - f], [48, -2]], 0x9a7aff, 0.4);
    // 旋臂星尘
    for (let k = 0; k < 10; k++) {
      const t = k / 9;
      const ang = -1.2 + t * 1.9 + now / 2400;
      const r = 14 + t * 60;
      const px = 8 + Math.cos(ang) * r, py = -6 + Math.sin(ang) * r * 0.62;
      g.fillStyle(k % 3 ? a : 0xffffff, 0.35 + 0.55 * Math.abs(Math.sin(now / 320 + k * 2)));
      g.fillCircle(px, py, 1.6 - t);
    }
  } },
  // 棱光：折射棱镜翼（三棱镜 + 七彩分光束）
  prism: { c: 0xe8f0ff, a: 0x8ad8ff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[6, 6], [26, -14 - f], [46, 6]], c, 0.5);
    g.lineStyle(1.6, a, 0.9);
    g.strokeTriangle(6, 6, 26, -14 - f, 46, 6);
    const cols = [0xe8404a, 0xff8a3c, 0xffd45c, 0x8fd45a, 0x4ac8ff, 0xa86ae8];
    for (let k = 0; k < 6; k++) {
      const ang = -0.42 - k * 0.12;
      const len = 30 + k * 8 + Math.sin(now / 300 + k) * 3;
      g.lineStyle(2, cols[k], 0.8);
      g.lineBetween(30, -8 - f, 30 + Math.cos(ang) * len, -8 - f + Math.sin(ang) * len);
    }
  } },
  // 云羽：卷云羽片（丝缕状，缓慢流动）
  cirrus: { c: 0xeaf2fb, a: 0x9ac8ee, draw: (g, now, flap, c, _a) => {
    const f = flap * 5;
    for (let k = 0; k < 5; k++) {
      const t = k / 4;
      const bx = 4 + t * 14, by = 2 - t * (16 + f);
      const len = 44 - k * 4;
      g.lineStyle(7 - k, k % 2 ? c : 0xffffff, 0.75 - t * 0.15);
      g.beginPath();
      for (let s = 0; s <= 5; s++) {
        const u = s / 5;
        const px = bx + u * len;
        const py = by + Math.sin(u * 4 + now / 500 + k) * 3.4 - u * 6;
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokePath();
    }
  } },
  // 烈阳：日轮翼（放射光芒 + 日冕环）
  solaris: { c: 0xffb03a, a: 0xfff0b0, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    const cx = 34, cy = -26 - f;
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * Math.PI * 2 + now / 1800;
      const r1 = 20, r2 = 34 + (k % 2) * 8;
      wpoly(g, [
        [cx + Math.cos(ang - 0.05) * r1, cy + Math.sin(ang - 0.05) * r1],
        [cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2],
        [cx + Math.cos(ang + 0.05) * r1, cy + Math.sin(ang + 0.05) * r1],
      ], k % 2 ? c : a, 0.8);
    }
    g.fillStyle(c, 0.95);
    g.fillCircle(cx, cy, 15);
    g.fillStyle(0xfff6d8, 0.9);
    g.fillCircle(cx, cy, 10);
    g.lineStyle(1.6, a, 0.6);
    g.strokeCircle(cx, cy, 20 + Math.sin(now / 300) * 1.6);
  } },
  // 刃翼：三片利刃（寒光扫过）
  blade: { c: 0xc0ccda, a: 0xffffff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    for (let k = 0; k < 3; k++) {
      const bx = 4 + k * 18, by = 2 - k * (10 + f * 0.5);
      const len = 52 - k * 8;
      g.save();
      g.translateCanvas(bx, by);
      g.rotateCanvas(-0.4 - k * 0.15);
      wpoly(g, [[0, -3], [len, 0], [0, 3]], k % 2 ? a : c, 0.96);
      g.fillStyle(0xffffff, 0.5);
      g.fillRect(len * 0.2, -1.2, len * 0.5, 1);
      g.restore();
    }
    const gl = Math.abs(Math.sin(now / 200));
    g.lineStyle(1.4, a, gl * 0.8);
    g.lineBetween(6, -14 - f, 66, -40 - f);
  } },
  // 蜻蜓：四片透明复翼（脉纹 + 高速颤动）
  dragonfly: { c: 0xbfe8f4, a: 0x5a8ab4, draw: (g, now, _flap, c, a) => {
    const tr = Math.sin(now / 60) * 3;
    for (const [dx, dy] of [[10, -22], [16, -4], [26, -30], [32, -12]] as const) {
      g.fillStyle(c, 0.45);
      g.fillEllipse(dx, dy + tr * (dx > 20 ? 1 : -1), 34, 9);
      g.lineStyle(1, a, 0.6);
      g.lineBetween(dx - 12, dy + tr * (dx > 20 ? 1 : -1), dx + 20, dy + tr * (dx > 20 ? 1 : -1));
    }
    g.fillStyle(0x5a8ab4, 0.8);
    g.fillCircle(6, -14, 3);
  } },
  // 霓虹：霓虹灯管翼（描边发光 + 闪烁）
  neon: { c: 0xff4ac8, a: 0x4affff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    const flick = Math.sin(now / 120) > -0.7 ? 1 : 0.3;
    g.lineStyle(3.4, c, 0.9 * flick);
    g.beginPath();
    g.moveTo(2, 6); g.lineTo(28, -34 - f); g.lineTo(58, -52 - f); g.lineTo(84, -40 - f);
    g.strokePath();
    g.lineStyle(1.2, a, 0.8 * flick);
    g.lineBetween(8, 2, 32, -30 - f);
    g.lineBetween(12, 4, 56, -46 - f);
    g.fillStyle(a, 0.85 * flick);
    g.fillCircle(84, -40 - f, 3);
  } },
  // 雷霆：雷能翼（雷弧骨架 + 放电）
  thunder: { c: 0x9fd8ff, a: 0xffe89a, draw: (g, now, flap, c, a) => {
    const f = flap * 7;
    wline(g, [[2, 4], [30, -30 - f], [60, -48 - f], [84, -38 - f]], 2.6, c, 0.9);
    for (let k = 0; k < 3; k++) {
      if (Math.sin(now / 140 + k * 2) > 0) {
        g.lineStyle(1.6, a, 0.95);
        g.lineBetween(30 + k * 18, -24 - k * 10 - f, 40 + k * 18, -36 - k * 8 - f + Math.sin(now / 60 + k) * 5);
      }
    }
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(84, -38 - f, 2.4);
  } },
  // 水晶：棱柱晶簇翼（折射面 + 闪光）
  crystal: { c: 0x9ad4ff, a: 0xe0f2ff, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    for (let k = 0; k < 4; k++) {
      const bx = 6 + k * 17, hh = 30 - k * 3;
      wpoly(g, [[bx, 4], [bx + 8, 4 - hh - f * 0.6], [bx + 14, 4]], k % 2 ? c : a, 0.85);
      g.fillStyle(0xffffff, 0.5);
      wpoly(g, [[bx + 2, 2], [bx + 8, 2 - (hh - 8) - f * 0.6], [bx + 10, 2]], 0xffffff, 0.4);
    }
    const tw = Math.abs(Math.sin(now / 350));
    g.fillStyle(0xffffff, tw);
    g.fillCircle(24, -22 - f * 0.6, 2);
  } },
  // 碎晶：悬浮碎晶（多面小块绕转）
  crystalShard: { c: 0xb46cff, a: 0xe8d8ff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[4, 8], [16, -14 - f], [10, -30 - f], [26, -34 - f], [40, -12 - f], [30, 8]], c, 0.5);
    for (let k = 0; k < 5; k++) {
      const t = k / 4;
      const px = 10 + t * 58, py = -6 - t * (26 + f) + Math.sin(now / 300 + k * 2) * 4;
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas(now / 400 + k);
      wpoly(g, [[0, -6], [5, 0], [0, 6], [-5, 0]], k % 2 ? a : c, 0.9);
      g.restore();
    }
  } },
  // 冰晶：霜花六棱翼（生长呼吸）
  frost: { c: 0xbfe8ff, a: 0xffffff, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    const cx = 34, cy = -24 - f;
    const grow = 0.85 + 0.15 * Math.sin(now / 500);
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * Math.PI * 2 + now / 2600;
      g.lineStyle(2.2, c, 0.9);
      g.lineBetween(cx, cy, cx + Math.cos(ang) * 30 * grow, cy + Math.sin(ang) * 30 * grow);
      for (const b of [0.55, 0.8]) {
        g.lineBetween(
          cx + Math.cos(ang) * 30 * grow * b, cy + Math.sin(ang) * 30 * grow * b,
          cx + Math.cos(ang + 0.4) * 30 * grow * (b - 0.15), cy + Math.sin(ang + 0.4) * 30 * grow * (b - 0.15));
      }
    }
    g.fillStyle(a, 0.9);
    g.fillCircle(cx, cy, 5);
  } },
  // 冰河：冰川裂谷翼（蓝白断层 + 寒气）
  glacier: { c: 0x9ad4ee, a: 0xeaf6ff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 6], [20, -22 - f], [44, -40 - f], [70, -46 - f], [86, -30 - f], [60, -2], [28, 8]], c, 0.95);
    wpoly(g, [[26, -20 - f], [44, -38 - f], [70, -44 - f], [84, -30 - f], [56, -4]], a, 0.4);
    // 断层裂纹
    g.lineStyle(1.6, 0x4a8ab4, 0.8);
    g.lineBetween(30, -18 - f, 40, -30 - f);
    g.lineBetween(48, -34 - f, 58, -40 - f);
    g.lineBetween(22, 0, 34, -10 - f);
    for (let k = 0; k < 3; k++) {
      const ph = (now / 800 + k / 3) % 1;
      g.fillStyle(a, 0.5 * (1 - ph));
      g.fillCircle(30 + k * 18, -46 - f - ph * 10, 1.6);
    }
  } },
};
