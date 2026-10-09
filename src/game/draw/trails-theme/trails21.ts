import { curve, scatter, puffAt, ringAt, sparkAt, petalAt, polyAt, alongPath, headCore, type TrailArt } from './shared';

/** 第九批击球拖尾（恐龙 / 史前 / 神话 / 恶搞 10 主题）——整条轨迹画成整体，按名字构图 */

export const TRAILS_21: Record<string, TrailArt> = {
  // ── 白垩纪猎场 ──
  cretAsh: { c: 0x5a4a3a, a: 0xff6a2a, draw: (ctx, c, a) => {
    // 火山灰拖尾：灰烬带 + 余烬 + 上浮余烟
    const { now } = ctx;
    curve(ctx, 2, 9, 0.35, 0.12, c);
    scatter(ctx, 9, 2, a, 6, 6, 0.8);
    alongPath(ctx, 3, 0, (x, y, _t, f) => { puffAt(ctx, x + Math.sin(now / 500 + f * 6) * 4, y - f * 8, 2 + f * 4, 0x3a3028, 0.3 * (1 - f)); });
    headCore(ctx, 0xffd45c);
  } },
  cretAmberTrail: { c: 0xd89a3a, a: 0xffd45c, draw: (ctx, c, a) => {
    // 琥珀拖尾：黏稠琥珀痕 + 内含小虫剪影 + 拉丝
    const { now } = ctx;
    curve(ctx, 3, 10, 0.5, 0.2, c);
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => { polyAt(ctx, x, y, 2.6 + f * 2, 6, now / 800 + i, a, 0.5); if (i % 5 === 0) { ctx.g.fillStyle(0x3a2a12, 1); ctx.g.fillEllipse(x, y, 4, 2.4); } });
    scatter(ctx, 6, 2, 0xffe08a, 5, 0, 0.7);
    headCore(ctx, 0xffe08a);
  } },
  cretClawTrail: { c: 0x8a5a2a, a: 0xe8d07a, draw: (ctx, c, a) => {
    // 爪痕拖尾：三道平行爪痕
    const { g, now } = ctx;
    for (let k = 0; k < 3; k++) { curve(ctx, 1.2, 2.4, 0.3, 0.1, 0x4a3a22 + k * 0x101010); }
    alongPath(ctx, 4, 0, (x, y, t, f) => { for (let k = -1; k <= 1; k++) { g.fillStyle(c, (0.6 - f * 0.3)); g.fillEllipse(x + Math.sin(t) * 6, y + k * 5, 4, 2); } });
    scatter(ctx, 5, 1.6, a, 6, 0, 0.6);
    void now;
  } },
  // ── 史前沼泽 ──
  swampSludge: { c: 0x4a3a22, a: 0x7dff9a, draw: (ctx, c, a) => {
    // 泥浆拖尾：拉丝泥浆 + 气泡
    const { now } = ctx;
    curve(ctx, 3, 11, 0.5, 0.2, c);
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => { if (i % 4 === 0) ringAt(ctx, x, y, (2 + f * 3) * (0.6 + 0.4 * Math.sin(now / 300 + i)), 1.2, a, 0.5); });
    scatter(ctx, 6, 2.2, 0x3a2a12, 6, -2, 0.6);
    headCore(ctx, 0x6a5a3a);
  } },
  swampMosquito: { c: 0x6a7a4a, a: 0x7dff9a, draw: (ctx, c, a) => {
    // 蚊虫拖尾：一团嗡嗡飞舞的蚊虫 + 涟漪
    const { g, now } = ctx;
    curve(ctx, 1.4, 4, 0.25, 0.08, 0x3a4a2a);
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => { for (let k = 0; k < 3; k++) { const ang = now / 200 + k * 2.1 + i; g.fillStyle(c, 0.8 * (1 - f * 0.4)); g.fillCircle(x + Math.cos(ang) * 8, y + Math.sin(ang) * 6, 1.4); g.fillStyle(a, 0.6); g.fillCircle(x + Math.cos(ang) * 8 - 2, y + Math.sin(ang) * 6 - 1, 0.7); } });
    headCore(ctx, 0x7dff9a);
  } },
  swampAlgae: { c: 0x3a7a4a, a: 0x7dff9a, draw: (ctx, c, a) => {
    // 水藻拖尾：藻叶 + 水泡
    const { now } = ctx;
    curve(ctx, 2, 7, 0.35, 0.12, c);
    alongPath(ctx, 3, 0, (x, y, t, f, i) => { petalAt(ctx, x, y, t + 1.57, 8 * (0.4 + f), 3, i % 2 ? c : 0x5a9a5a, 0.7); });
    alongPath(ctx, 5, 0, (x, y, _t, f) => ringAt(ctx, x, y - f * 4, 2 + f * 2, 1.1, a, 0.4));
    headCore(ctx, 0x9fe86a);
    void now;
  } },
  swampBubble: { c: 0x2a5a3a, a: 0x7dff9a, draw: (ctx, c, a) => {
    // 沼泡拖尾：一串上浮的沼泡 + 沼气
    const { now } = ctx;
    curve(ctx, 1.6, 5, 0.3, 0.1, 0x2f5a3a);
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => { const ph = ((now / 900 + i / 6) % 1); ringAt(ctx, x, y - ph * 8, (2 + f * 4) * (0.5 + ph * 0.5), 1.3, a, (1 - ph) * 0.6); });
    scatter(ctx, 5, 2, c, 5, 4, 0.4);
    headCore(ctx, 0xd0ff9a);
  } },
  // ── 冰河世纪 ──
  iceageShard: { c: 0x8fd8ff, a: 0xe0f2ff, draw: (ctx, c, a) => {
    // 冰棱拖尾：一路冰棱 + 冷雾
    const { now } = ctx;
    curve(ctx, 2.2, 7, 0.35, 0.12, c);
    alongPath(ctx, 2, 0, (x, y, t, f, i) => { const s = 3 + f * 4; polyAt(ctx, x, y, s, 3, t + now / 500 + i, a, 0.8); });
    scatter(ctx, 7, 1.8, 0xdff4ff, 6, 0, 0.6);
    headCore(ctx, 0xffffff);
  } },
  iceageFrostDust: { c: 0xbfe8ff, a: 0xe0f2ff, draw: (ctx, c, a) => {
    // 霜尘拖尾：细碎霜尘 + 冷雾
    const { now } = ctx;
    curve(ctx, 1.6, 6, 0.3, 0.1, c);
    scatter(ctx, 12, 1.5, a, 8, -1, 0.85);
    alongPath(ctx, 4, 0, (x, y, _t, f) => puffAt(ctx, x, y, 2 + f * 3, 0xdff4ff, 0.25));
    headCore(ctx, 0xffffff);
    void now;
  } },
  // ── 非洲雷神 ──
  yorBolt: { c: 0xffb03a, a: 0xffe08a, draw: (ctx, c, a) => {
    // 电光拖尾：折线电弧 + 分叉 + 电花
    const { g, now } = ctx;
    curve(ctx, 1.6, 5, 0.3, 0.1, 0x7a3416);
    g.lineStyle(2, c, 0.6);
    // 主弧
    alongPath(ctx, 1, 0, (x, y) => { g.fillStyle(c, 0.7); g.fillCircle(x, y, 1.6); });
    alongPath(ctx, 5, 1, (x, y, t, f) => { if (f > 0.2) { g.lineStyle(1.6, a, 0.6 * (1 - f)); g.lineBetween(x, y, x + Math.cos(t + now / 90) * 12 * f, y + Math.sin(t + now / 90) * 12 * f); } });
    sparkAt(ctx, ctx.pts[ctx.pts.length - 1].x, ctx.pts[ctx.pts.length - 1].y, 8, now / 200, a, 0.6);
    headCore(ctx, 0xfff080);
  } },
  yorClay: { c: 0x8a3a14, a: 0xffb03a, draw: (ctx, c, _a) => {
    // 红土拖尾：红土尘 + 草屑
    curve(ctx, 2.4, 8, 0.4, 0.14, c);
    scatter(ctx, 10, 2.2, c, 7, 0, 0.75);
    scatter(ctx, 4, 1.6, 0xd8c07a, 6, -1, 0.6);
    headCore(ctx, 0xffd45c);
  } },
  // ── 芬兰史诗 ──
  kalSong: { c: 0x9fe8d0, a: 0xd8e8f0, draw: (ctx, c, a) => {
    // 符文歌谣拖尾：飘飞音符 + 卢恩符文 + 音波弧
    const { g } = ctx;
    curve(ctx, 1.8, 5, 0.3, 0.1, c);
    alongPath(ctx, 3, 0, (x, y, _t, _f, i) => { g.fillStyle(a, 0.85); g.fillEllipse(x, y, 5, 4); g.fillRect(x + 1.4, y - 8, 1.4, 8); if (i % 2) { g.lineStyle(1.2, c, 0.6); g.lineBetween(x - 3, y - 12, x + 3, y - 12); } });
    alongPath(ctx, 6, 0, (x, y, _t, f) => ringAt(ctx, x, y, 3 + f * 5, 1.2, a, 0.3));
    headCore(ctx, 0xd8e8f0);
  } },
  kalPine: { c: 0xc8a04a, a: 0x9fe8d0, draw: (ctx, c, _a) => {
    // 松脂拖尾：琥珀松脂 + 松针
    const { g, now } = ctx;
    curve(ctx, 2.6, 9, 0.5, 0.2, c);
    alongPath(ctx, 3, 0, (x, y, _t, _f, i) => { if (i % 2) { g.fillStyle(0x3a6a3a, 0.7); g.fillEllipse(x, y, 1.4, 6); } });
    scatter(ctx, 6, 2, 0xffe08a, 5, 0, 0.7);
    headCore(ctx, 0xffe08a);
    void now;
  } },
  // ── 香蕉王国 ──
  banPeelTrail: { c: 0xf0d020, a: 0x8a8a1a, draw: (ctx, c, _a) => {
    // 蕉皮拖尾：一路翻滚的蕉皮 + 打滑水痕
    const { g, now } = ctx;
    curve(ctx, 1.6, 5, 0.3, 0.1, 0x8a8a1a);
    alongPath(ctx, 4, 0, (x, y, _t, _f, i) => { g.save(); g.translateCanvas(x, y); g.rotateCanvas(now / 300 + i); g.fillStyle(c, 0.95); g.fillPoints([{ x: -7, y: 0 }, { x: 0, y: -5 }, { x: 7, y: 0 }, { x: 0, y: 4 }] as never, true); g.restore(); });
    alongPath(ctx, 2, 0, (x, y, _t, f) => { g.fillStyle(0xdff4ff, 0.25 * (1 - f)); g.fillEllipse(x, y + 8, 8, 3); });
    headCore(ctx, 0xfff6c0);
  } },
  banSmoothie: { c: 0xe8c020, a: 0xfff080, draw: (ctx, c, _a) => {
    // 果泥拖尾：黄果泥痕 + 果粒
    const { g } = ctx;
    curve(ctx, 3, 10, 0.5, 0.2, c);
    alongPath(ctx, 3, 0, (x, y, _t, f) => { g.fillStyle(0xffe040, 0.7 * (1 - f * 0.3)); g.fillCircle(x, y, 2 + f * 2); });
    scatter(ctx, 7, 1.8, 0xfff6c0, 6, 0, 0.7);
    headCore(ctx, 0xfff6c0);
  } },
  banJuiceTrail: { c: 0xffe040, a: 0xfff080, draw: (ctx, c, _a) => {
    // 果汁拖尾：液流 + 果汁泡
    const { now } = ctx;
    curve(ctx, 2.2, 8, 0.45, 0.18, c);
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => { const ph = ((now / 700 + i / 5) % 1); ringAt(ctx, x, y - ph * 6, 2 + f * 3, 1.1, c, (1 - ph) * 0.5); });
    headCore(ctx, 0xfff6c0);
  } },
  // ── 迷因宇宙 ──
  memeRainbow: { c: 0xff5ec8, a: 0x39ffd0, draw: (ctx, _c, _a) => {
    // 彩虹像素拖尾：方块像素组成的彩虹带
    const { g } = ctx;
    const cols = [0xff5ec8, 0xff9a3c, 0xffe040, 0x7dff9a, 0x39ffd0, 0x5a8aff];
    curve(ctx, 2, 6, 0.4, 0.15, 0x2a2a3a);
    alongPath(ctx, 1, 0, (x, y, _t, _f, i) => { g.fillStyle(cols[i % cols.length], 0.9); g.fillRect(x - 3, y - 3, 6, 6); });
    scatter(ctx, 5, 2, 0xffffff, 6, 0, 0.5);
    headCore(ctx, 0xffffff);
  } },
  memeChatTrail: { c: 0x2f4058, a: 0x7dff9a, draw: (ctx, c, a) => {
    // 弹幕拖尾：一路滚过的弹幕字条
    const { g, now } = ctx;
    curve(ctx, 1.4, 4, 0.25, 0.08, c);
    alongPath(ctx, 5, 0, (x, y, _t, f, i) => { g.fillStyle(i % 2 ? a : 0x39ffd0, 0.85 * (1 - f * 0.3)); g.fillRoundedRect(x - 8, y - 3 + Math.sin(now / 300 + i) * 2, 16, 6, 3); });
    headCore(ctx, 0x7dff9a);
  } },
  memeGlitchTrail: { c: 0xff5ec8, a: 0x39ffd0, draw: (ctx, c, a) => {
    // 故障拖尾：故障色块 + 扫描线 + 像素残影
    const { g, now } = ctx;
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => { const off = Math.sin(now / 120 + i) * 6; g.fillStyle(i % 2 ? c : a, 0.4 * (1 - f * 0.3)); g.fillRect(x - 10 + off, y - 4, 20, 8); });
    alongPath(ctx, 2, 0, (x, y, _t, _f) => { g.fillStyle(0x0e1620, 0.4); g.fillRect(x - 8, y - 1, 16, 2); });
    headCore(ctx, 0xffffff);
  } },
  memeCookieTrail: { c: 0xc89a4a, a: 0x6a4a2a, draw: (ctx, c, a) => {
    // 饼干拖尾：掉落的饼干 + 碎屑
    const { g, now } = ctx;
    curve(ctx, 1.6, 5, 0.3, 0.1, 0xc89a4a);
    alongPath(ctx, 4, 0, (x, y, _t, _f, i) => { g.save(); g.translateCanvas(x, y); g.rotateCanvas(now / 400 + i); g.fillStyle(c, 1); g.fillCircle(0, 0, 6); g.fillStyle(a, 0.9); g.fillCircle(-2, -1, 1.2); g.fillCircle(2, 2, 0.9); g.restore(); });
    scatter(ctx, 5, 1.4, 0x6a4a2a, 6, 2, 0.6);
    headCore(ctx, 0xf0d0a0);
  } },
  // ── 摸鱼办公室 ──
  officeCoffeeTrail: { c: 0x6a4a2a, a: 0xd8c0a0, draw: (ctx, c, a) => {
    // 咖啡拖尾：咖啡痕 + 拉花
    const { now } = ctx;
    curve(ctx, 3, 9, 0.5, 0.2, c);
    alongPath(ctx, 4, 0, (x, y, _t, f, i) => { ringAt(ctx, x, y, 3 + f * 3, 1.4, a, 0.5); if (i % 6 === 0) { ctx.g.fillStyle(a, 0.7); ctx.g.fillEllipse(x, y, 5, 2); } });
    scatter(ctx, 5, 1.6, c, 5, 0, 0.5);
    headCore(ctx, 0xd8c0a0);
    void now;
  } },
  officePaperTrail: { c: 0xf0ead8, a: 0x9fd8ff, draw: (ctx, c, a) => {
    // 打印纸拖尾：一路吐出的打印纸 + 纸屑
    const { g } = ctx;
    alongPath(ctx, 3, 0, (x, y, t, _f) => { g.save(); g.translateCanvas(x, y); g.rotateCanvas(t); g.fillStyle(c, 0.95); g.fillRect(-6, -5, 12, 10); g.fillStyle(0xb0b0b0, 0.8); g.fillRect(-4, -3, 8, 1.4); g.fillRect(-4, 1, 6, 1.4); g.restore(); });
    scatter(ctx, 5, 1.4, 0xffffff, 6, 0, 0.5);
    headCore(ctx, 0x9fd8ff);
    void a;
  } },
  // ── 花园地精 ──
  gnomePetalTrail: { c: 0x7aae4a, a: 0xffd0e2, draw: (ctx, c, a) => {
    // 藤叶拖尾：藤叶 + 细花瓣
    const { now } = ctx;
    curve(ctx, 2, 7, 0.4, 0.14, c);
    alongPath(ctx, 3, 0, (x, y, t, f, i) => { petalAt(ctx, x, y, t + 1.57 + Math.sin(now / 500 + i), 8 * (0.4 + f), 3.4, c, 0.75); });
    scatter(ctx, 5, 1.6, a, 6, 0, 0.6);
    headCore(ctx, 0xa8ff7a);
  } },
  gnomeDew: { c: 0xbfe8ff, a: 0xa8ff7a, draw: (ctx, c, _a) => {
    // 露珠拖尾：一颗颗露珠 + 叶片
    const { g, now } = ctx;
    curve(ctx, 1.4, 4, 0.25, 0.08, 0x7aae4a);
    alongPath(ctx, 4, 0, (x, y, _t, f, i) => { const s = 2.5 + f * 3; g.fillStyle(0x3a6a2a, 0.7); g.fillEllipse(x, y + 1, s * 2.2, s * 1.2); g.fillStyle(c, 0.85); g.fillCircle(x, y - s * 0.4, s); g.fillStyle(0xffffff, 0.8 * (0.5 + 0.5 * Math.sin(now / 300 + i))); g.fillCircle(x - s * 0.3, y - s * 0.7, s * 0.3); });
    headCore(ctx, 0xdff4ff);
  } },
  // ── 垃圾回收站 ──
  trashFoam: { c: 0xdff4ff, a: 0x8fd4a0, draw: (ctx, c, _a) => {
    // 泡沫拖尾：泡沫带 + 汽水泡
    const { now } = ctx;
    curve(ctx, 2, 7, 0.35, 0.12, c);
    alongPath(ctx, 2, 0, (x, y, _t, f, i) => { const ph = ((now / 800 + i / 5) % 1); puffAt(ctx, x, y - ph * 6, 2 + f * 3, c, (1 - ph) * 0.5); });
    scatter(ctx, 8, 1.6, 0xffffff, 7, 1, 0.6);
    headCore(ctx, 0x8fd4a0);
  } },
  trashFlyTrail: { c: 0x3a4444, a: 0x8fd4a0, draw: (ctx, c, a) => {
    // 苍蝇拖尾：一团追你的苍蝇 + 臭味线
    const { g, now } = ctx;
    curve(ctx, 1.6, 4, 0.25, 0.08, 0x5a6a5a);
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => { for (let k = 0; k < 3; k++) { const ang = now / 180 + k * 2.1 + i; const fx = x + Math.cos(ang) * 8, fy = y + Math.sin(ang) * 6; g.fillStyle(c, 0.9 * (1 - f * 0.3)); g.fillCircle(fx, fy, 1.6); g.fillStyle(0x00000066); g.fillPoints([{ x: fx, y: fy }, { x: fx - 4, y: fy - 2 }, { x: fx - 2, y: fy }] as never, true); } });
    scatter(ctx, 4, 1.6, a, 5, -3, 0.4);
    headCore(ctx, 0x8fd4a0);
  } },
  trashOil: { c: 0x2a2a2a, a: 0x7dff9a, draw: (ctx, c, a) => {
    // 油污拖尾：油膜彩虹纹 + 油滴
    const { g } = ctx;
    const cols = [0x7dff9a, 0x39ffd0, 0xff5ec8, 0xffe040];
    alongPath(ctx, 1, 0, (x, y, _t, f, i) => { g.fillStyle(cols[i % 4], 0.35 * (1 - f * 0.3)); g.fillCircle(x, y, 3 + f * 3); });
    curve(ctx, 2, 6, 0.4, 0.15, c);
    scatter(ctx, 4, 1.8, c, 5, 0, 0.6);
    headCore(ctx, 0x7dff9a);
    void a;
  } },
  trashSludge: { c: 0x4a4a3a, a: 0x8fd4a0, draw: (ctx, c, a) => {
    // 淤泥拖尾：泥纹拉丝 + 气泡
    const { now } = ctx;
    curve(ctx, 3, 10, 0.5, 0.2, c);
    alongPath(ctx, 3, 0, (x, y, _t, f, i) => { if (i % 3 === 0) { const pb = Math.max(0, Math.sin(now / 300 + i)); ringAt(ctx, x, y, 2 + f * 3, 1.1, a, 0.5 * pb); } });
    scatter(ctx, 5, 2, 0x3a3a2a, 6, -1, 0.5);
    headCore(ctx, 0x6a6a5a);
  } },
};
