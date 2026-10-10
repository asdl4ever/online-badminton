import { curve, scatter, puffAt, ringAt, sparkAt, polyAt, alongPath, headCore, type TrailArt } from './shared';

/** 第十一批击球拖尾（SCP 收容 / 恐怖 10 主题）——整条轨迹画成整体，按名字构图 */

export const TRAILS_23: Record<string, TrailArt> = {
  // ── SCP 收容 ──
  scpStaticTrail: { c: 0x8a9a8a, a: 0xffd45c, draw: (ctx, c, a) => {
    // 雪花屏拖尾：一路跳动的像素扫描线
    const { g, now } = ctx;
    curve(ctx, 3, 9, 0.3, 0.14, 0x2a2f2a);
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => {
      const flick = 0.4 + 0.6 * Math.abs(Math.sin(now / 90 + i * 1.7));
      g.fillStyle(i % 2 ? c : a, 0.55 * flick * (1 - f * 0.4));
      g.fillRect(x - 6, y - 5, 12, 3);
      g.fillRect(x - 6, y + 2, 12, 3);
    });
    scatter(ctx, 8, 1.4, a, 6, 0, 0.7);
    headCore(ctx, 0xfff0b0);
  } },
  scpBioTrail: { c: 0x8a9a8a, a: 0xffd45c, draw: (ctx, c, a) => {
    // 生物质拖尾：一路鼓胀的血肉泡团
    const { g, now } = ctx;
    curve(ctx, 2.6, 10, 0.4, 0.15, 0x4a5a3a);
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => {
      const r = 3 + f * 5 + Math.sin(now / 250 + i) * 1.5;
      g.fillStyle(0x6a7a4a, 0.7 * (1 - f * 0.3));
      g.fillCircle(x + Math.sin(i * 2.3) * 3, y - f * 3, r);
      g.fillStyle(c, 0.6);
      g.fillCircle(x + Math.sin(i * 2.3) * 3, y - f * 3, r * 0.5);
    });
    scatter(ctx, 7, 1.8, a, 7, 1, 0.6);
    headCore(ctx, 0xd8e8c0);
  } },
  // ── 血腥异变 ──
  keterBloodTrail: { c: 0xa03030, a: 0xff5a5a, draw: (ctx, c, a) => {
    // 血痕拖尾：一道深色血带，沿路滴落成串
    const { g, now } = ctx;
    curve(ctx, 3, 11, 0.55, 0.25, c);
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => {
      const d = 4 + f * 5 + Math.sin(now / 400 + i) * 2;
      g.fillStyle(0x5a1414, 0.8);
      g.fillEllipse(x, y + d, 3, 6 + f * 4);
      g.fillStyle(a, 0.6);
      g.fillEllipse(x, y + d - 3, 1.5, 3);
    });
    scatter(ctx, 6, 2, 0x7a2020, 5, 3, 0.7);
    headCore(ctx, 0xff8080);
  } },
  keterGrowthTrail: { c: 0xa03030, a: 0xff5a5a, draw: (ctx, c, a) => {
    // 增殖拖尾：一路长出的肿瘤分节，两侧不断冒芽
    const { g, now } = ctx;
    curve(ctx, 2.4, 9, 0.4, 0.15, 0x6a2020);
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => {
      g.fillStyle(c, 0.8 * (1 - f * 0.3));
      g.fillEllipse(x, y, 7 + f * 3, 6 + f * 2);
      const bud = 2 + Math.sin(now / 300 + i) * 1.5;
      g.fillStyle(a, 0.85);
      g.fillCircle(x + 5, y - 4, bud);
      g.fillCircle(x - 5, y + 3, bud * 0.8);
    });
    scatter(ctx, 6, 1.6, a, 6, 0, 0.7);
    headCore(ctx, 0xff8080);
  } },
  // ── 惊惧之影 ──
  shyFearTrail: { c: 0xe8e8e0, a: 0x6a7a8a, draw: (ctx, c, a) => {
    // 惊惧拖尾：一条不住抖动的尖刺连缀
    const { g, now } = ctx;
    curve(ctx, 1.6, 5, 0.3, 0.1, 0x8a94a2);
    alongPath(ctx, 3, 0, (x, y, t, f, i) => {
      for (let k = -1; k <= 1; k++) {
        const ang = t + k * 1.1 + Math.sin(now / 120 + i) * 0.3;
        g.lineStyle(1.4, a, 0.7 * (1 - f * 0.4));
        g.lineBetween(x, y, x + Math.cos(ang) * (5 + f * 4), y + Math.sin(ang) * (5 + f * 4));
      }
    });
    scatter(ctx, 5, 1.2, c, 5, 0, 0.5);
    headCore(ctx, 0xffffff);
  } },
  shyPaleTrail: { c: 0xe8e8e0, a: 0x6a7a8a, draw: (ctx, c, a) => {
    // 惨白拖尾：一道几乎没有边界的苍白晕带
    curve(ctx, 4, 12, 0.25, 0.1, 0xd8d8d0);
    alongPath(ctx, 3, 0, (x, y, _t, f) => puffAt(ctx, x, y, 4 + f * 5, c, 0.22 * (1 - f * 0.3)));
    scatter(ctx, 5, 1.6, a, 6, 0, 0.4);
    headCore(ctx, 0xf4f4f0);
  } },
  // ── 耙爪怪 ──
  rakeScratchTrail: { c: 0x8a8070, a: 0xd8d0c0, draw: (ctx, c, a) => {
    // 抓痕拖尾：四道平行抓痕
    const { g } = ctx;
    curve(ctx, 1.6, 5, 0.25, 0.08, 0x4a4038);
    alongPath(ctx, 3, 0, (x, y, t, f) => {
      const nx = Math.cos(t + 1.5708), ny = Math.sin(t + 1.5708);
      for (let k = 0; k < 4; k++) {
        const o = (k - 1.5) * 3.2;
        g.lineStyle(1.4, k % 2 ? a : c, 0.75 * (1 - f * 0.35));
        g.lineBetween(x + nx * o, y + ny * o, x + nx * o + Math.cos(t) * 6, y + ny * o + Math.sin(t) * 6);
      }
    });
    scatter(ctx, 5, 1.4, a, 5, 0, 0.5);
    headCore(ctx, 0xf0e8d8);
  } },
  rakeShadowTrail: { c: 0x8a8070, a: 0xd8d0c0, draw: (ctx, c, _a) => {
    // 暗影拖尾：一道模糊扩散的暗色涂抹
    curve(ctx, 4, 13, 0.35, 0.12, 0x2a2620);
    alongPath(ctx, 2, 0, (x, y, _t, f) => puffAt(ctx, x, y, 5 + f * 6, 0x1a1814, 0.28 * (1 - f * 0.3)));
    scatter(ctx, 4, 1.4, c, 6, 0, 0.5);
    headCore(ctx, 0x8a8070);
  } },
  // ── 雪原温迪戈 ──
  wendiFrostTrail: { c: 0x9a8060, a: 0xd8e8f0, draw: (ctx, c, a) => {
    // 霜雪拖尾：一路冷霜结晶
    const { now } = ctx;
    curve(ctx, 1.8, 6, 0.35, 0.12, c);
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => {
      sparkAt(ctx, x, y, 3 + f * 3, now / 400 + i, a, 0.8);
      polyAt(ctx, x, y, 2 + f * 2, 6, now / 500 + i, 0xffffff, 0.5);
    });
    scatter(ctx, 8, 1.4, a, 7, -1, 0.7);
    headCore(ctx, 0xffffff);
  } },
  wendiBloodTrail: { c: 0x9a8060, a: 0xd8e8f0, draw: (ctx, _c, a) => {
    // 血雪拖尾：冻血滴串间杂白霜点
    const { g, now } = ctx;
    curve(ctx, 2.6, 9, 0.5, 0.2, 0x7a2828);
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => {
      g.fillStyle(0x8a2828, 0.8);
      g.fillEllipse(x, y + 3 + f * 6, 2.4, 5);
      g.fillStyle(a, 0.6 * (0.6 + 0.4 * Math.sin(now / 250 + i)));
      g.fillCircle(x - 4, y - 3, 1.6);
    });
    scatter(ctx, 7, 1.6, 0xd8e8f0, 7, 0, 0.6);
    headCore(ctx, 0xe8f4ff);
  } },
  // ── 巨蛾人 ──
  mothmScaleTrail: { c: 0x7a5a3a, a: 0xff3a3a, draw: (ctx, c, a) => {
    // 鳞粉拖尾：一路层叠的翅鳞片
    const { g } = ctx;
    curve(ctx, 2, 7, 0.4, 0.14, 0x3a2a1a);
    alongPath(ctx, 2, 0, (x, y, t, f, i) => {
      g.save(); g.translateCanvas(x, y); g.rotateCanvas(t);
      g.fillStyle(i % 2 ? c : a, 0.8 * (1 - f * 0.3));
      g.fillEllipse(0, 0, 8 + f * 3, 5);
      g.fillStyle(0xffd0a0, 0.5);
      g.fillEllipse(-2, 0, 4, 2);
      g.restore();
    });
    scatter(ctx, 6, 1.6, a, 6, 0, 0.6);
    headCore(ctx, 0xffe0c0);
  } },
  mothmDustTrail: { c: 0x7a5a3a, a: 0xff3a3a, draw: (ctx, c, a) => {
    // 尘蛾拖尾：一路扑下的蛾粉雾团
    const { g } = ctx;
    curve(ctx, 2.2, 8, 0.3, 0.1, 0x6a5a4a);
    alongPath(ctx, 3, 0, (x, y, _t, f) => puffAt(ctx, x, y - f * 4, 3 + f * 4, 0x9a8a6a, 0.25));
    alongPath(ctx, 4, 0, (x, y, _t, f) => { g.fillStyle(a, 0.6 * (1 - f * 0.3)); g.fillEllipse(x, y, 7 + f * 3, 3); });
    scatter(ctx, 8, 1.5, c, 7, 2, 0.6);
    headCore(ctx, 0xd8c8a8);
  } },
  // ── 巨猿 ──
  gbeastDustTrail: { c: 0x8a5a3a, a: 0xffb347, draw: (ctx, c, a) => {
    // 尘土拖尾：一路扬起的土黄尘雾 + 碎石
    curve(ctx, 3, 11, 0.35, 0.12, 0x5a4028);
    alongPath(ctx, 2, 0, (x, y, _t, f) => puffAt(ctx, x, y + f * 3, 4 + f * 6, 0x9a7a5a, 0.3 * (1 - f * 0.3)));
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => polyAt(ctx, x, y, 1.8 + f * 2, 5, i, a, 0.5));
    scatter(ctx, 9, 2, c, 8, 1, 0.6);
    headCore(ctx, 0xd8a86a);
  } },
  gbeastLavaTrail: { c: 0x8a5a3a, a: 0xffb347, draw: (ctx, _c, a) => {
    // 熔岩拖尾：一道炽亮熔流，沿途鼓动
    const { g, now } = ctx;
    curve(ctx, 3, 12, 0.6, 0.3, 0xff5a1a);
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => {
      const r = 3 + f * 5 + Math.sin(now / 200 + i) * 1.5;
      g.fillStyle(0x6a2a10, 0.8);
      g.fillCircle(x, y, r);
      g.fillStyle(a, 0.8);
      g.fillCircle(x, y, r * 0.5);
    });
    scatter(ctx, 8, 1.8, 0xffd45c, 7, -2, 0.8);
    headCore(ctx, 0xfff0a0);
  } },
  // ── 骨爬者 ──
  crawSlimeTrail: { c: 0xc8a86a, a: 0x4a2a1a, draw: (ctx, c, a) => {
    // 黏液拖尾：一路黏稠胶泡
    const { g, now } = ctx;
    curve(ctx, 3, 11, 0.45, 0.18, 0x6a5a3a);
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => {
      const r = 3 + f * 4 + Math.sin(now / 300 + i) * 1.2;
      g.fillStyle(a, 0.6);
      g.fillCircle(x, y + f * 2, r + 1);
      g.fillStyle(c, 0.75);
      g.fillCircle(x, y + f * 2, r);
      g.fillStyle(0xf4ecd8, 0.6);
      g.fillCircle(x - r * 0.3, y - r * 0.3 + f * 2, r * 0.3);
    });
    scatter(ctx, 6, 1.6, a, 6, 2, 0.6);
    headCore(ctx, 0xf0e4c8);
  } },
  crawBoneTrail: { c: 0xc8a86a, a: 0x4a2a1a, draw: (ctx, c, a) => {
    // 碎骨拖尾：一路翻滚的小骨头
    const { g } = ctx;
    curve(ctx, 1.8, 6, 0.3, 0.1, 0x6a5a3a);
    alongPath(ctx, 2, 0, (x, y, t, f, i) => {
      g.save(); g.translateCanvas(x, y); g.rotateCanvas(t + i);
      g.fillStyle(c, 0.9 * (1 - f * 0.3));
      g.fillRoundedRect(-6, -1.6, 12, 3.2, 1.4);
      g.fillCircle(-6, 0, 2.2); g.fillCircle(6, 0, 2.2);
      g.restore();
    });
    scatter(ctx, 6, 1.5, a, 5, 0, 0.6);
    headCore(ctx, 0xf0e4c8);
  } },
  // ── 变异体 ──
  mutoToxicTrail: { c: 0x5a6a3a, a: 0x7dff5a, draw: (ctx, _c, a) => {
    // 毒液拖尾：一路滴挂的荧光毒液
    const { g, now } = ctx;
    curve(ctx, 2.8, 10, 0.5, 0.2, 0x3a4a2a);
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => {
      const d = 3 + f * 5;
      g.fillStyle(0x4a6a2a, 0.7);
      g.fillEllipse(x, y + d + Math.sin(now / 350 + i) * 2, 3, 6);
      ringAt(ctx, x, y, 2 + f * 2, 1, a, 0.5);
    });
    scatter(ctx, 8, 1.8, a, 7, 2, 0.7);
    headCore(ctx, 0xaaff8a);
  } },
  mutoRadTrail: { c: 0x5a6a3a, a: 0x7dff5a, draw: (ctx, _c, a) => {
    // 辐射拖尾：一路旋转的三叶辐射标
    const { g, now } = ctx;
    curve(ctx, 2.4, 9, 0.4, 0.15, 0x2a3a1a);
    alongPath(ctx, 4, 0, (x, y, _t, f, i) => {
      g.save(); g.translateCanvas(x, y); g.rotateCanvas(now / 500 + i);
      g.fillStyle(a, 0.85 * (1 - f * 0.3));
      for (let k = 0; k < 3; k++) {
        const ang = (k / 3) * 6.2832;
        g.fillTriangle(0, 0, Math.cos(ang - 0.4) * 7, Math.sin(ang - 0.4) * 7, Math.cos(ang + 0.4) * 7, Math.sin(ang + 0.4) * 7);
      }
      g.fillStyle(0x1a2a10, 0.9);
      g.fillCircle(0, 0, 2);
      g.restore();
    });
    scatter(ctx, 10, 1.6, a, 8, 0, 0.8);
    headCore(ctx, 0xccff9a);
  } },
  // ── 巨兽 ──
  beheDustTrail: { c: 0x5a4030, a: 0x8a6a4a, draw: (ctx, c, a) => {
    // 岩尘拖尾：一路崩落的岩屑尘雾
    curve(ctx, 3, 11, 0.35, 0.12, 0x3a2a1a);
    alongPath(ctx, 2, 0, (x, y, _t, f) => puffAt(ctx, x, y, 4 + f * 5, 0x6a5a4a, 0.3 * (1 - f * 0.3)));
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => polyAt(ctx, x, y, 2 + f * 2, 5, i, a, 0.7));
    scatter(ctx, 7, 1.8, c, 7, 0, 0.6);
    headCore(ctx, 0x9a8a7a);
  } },
  beheMagmaTrail: { c: 0x5a4030, a: 0x8a6a4a, draw: (ctx, _c, a) => {
    // 熔岩拖尾：一路明灭的暗色熔核
    const { g, now } = ctx;
    curve(ctx, 3, 12, 0.55, 0.25, 0xff6a1a);
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => {
      g.fillStyle(0x3a2414, 0.8);
      g.fillCircle(x, y, 3 + f * 5);
      g.fillStyle(0xff8a2a, 0.8 * Math.abs(Math.sin(now / 250 + i)));
      g.fillCircle(x, y, 1.5 + f * 2.5);
    });
    scatter(ctx, 8, 2, a, 7, -1, 0.7);
    headCore(ctx, 0xffb347);
  } },
};
