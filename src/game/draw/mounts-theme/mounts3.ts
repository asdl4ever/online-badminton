import { mpoly, feather, mist, TAU, type MountArt } from './shared';

/**
 * 第三、四批主题坐骑——**逐款精绘**：分层形体 + 明暗 + 贴名细节 + 动画。
 */
export const MOUNTS_3: Record<string, MountArt> = {
  // ── 地狱犬：黑曜犬身 + 奔流的岩浆纹 + 火鬃 + 硝烟 ──
  vulcHound: { c: 0x3a2a2a, a: 0xff5a1a, draw: (g, now, x, y, f, c, a) => {
    const pulse = 0.6 + 0.4 * Math.sin(now / 200);
    // 四腿（奔跑）
    g.lineStyle(7, 0x241a1a, 1);
    for (const [dx, ph] of [[-28, 0], [-14, Math.PI], [14, Math.PI], [28, Math.PI * 0.4]] as Array<[number, number]>) {
      const sw = Math.sin(now / 260 + ph) * 5;
      g.lineBetween(x + dx, y - 22, x + dx + sw, y + 2);
      g.fillStyle(0x1a1010, 1);
      g.fillCircle(x + dx + sw, y + 1, 3);
    }
    // 躯干 + 胸
    g.fillStyle(c, 1);
    g.fillEllipse(x, y - 24, 78, 34);
    g.fillRoundedRect(x + f * 32 - 9, y - 42, 18, 24, 7);
    g.fillEllipse(x + f * 42, y - 46, 26, 16);
    // 岩浆纹（脉冲发光的裂缝）
    g.lineStyle(2.4, a, 0.5 + pulse * 0.4);
    g.lineBetween(x - 18, y - 34, x - 6, y - 20);
    g.lineBetween(x - 6, y - 20, x - 12, y - 12);
    g.lineBetween(x + 6, y - 32, x + 16, y - 18);
    g.lineBetween(x + 16, y - 18, x + 8, y - 12);
    g.lineBetween(x + f * 30, y - 40, x + f * 36, y - 28);
    g.fillStyle(a, pulse * 0.5);
    g.fillCircle(x - 6, y - 20, 2.2);
    g.fillCircle(x + 16, y - 18, 2.2);
    // 火鬃（背上一排火苗）
    for (let k = 0; k < 5; k++) {
      const flick = Math.sin(now / 90 + k * 2.2) * 2.5;
      const bx = x - 22 + k * 11;
      g.fillStyle(k % 2 ? a : 0xffd45c, 0.85);
      mpoly(g, [[bx - 3.5, y - 38], [bx, y - 50 - flick], [bx + 3.5, y - 38]], k % 2 ? a : 0xffd45c, 0.85);
    }
    // 耳 + 火眼 + 嘴里的火光
    mpoly(g, [[x + f * 30, y - 44], [x + f * 36, y - 54], [x + f * 40, y - 44]], 0x241a1a, 1);
    g.fillStyle(a, pulse);
    g.fillCircle(x + f * 47, y - 49, 3.2);
    g.fillStyle(a, pulse * 0.35);
    g.fillCircle(x + f * 47, y - 49, 6.4);
    g.fillStyle(0xffd45c, pulse * 0.8);
    g.fillEllipse(x + f * 52, y - 41, 6, 4);
    // 火尾 + 硝烟
    mpoly(g, [[x - f * 34, y - 30], [x - f * 52, y - 44 + Math.sin(now / 300) * 4], [x - f * 40, y - 24]], a, 0.8);
    for (let k = 0; k < 2; k++) {
      const ph = (now / 700 + k * 0.5) % 1;
      g.fillStyle(0x55555f, 0.3 * (1 - ph));
      g.fillCircle(x - f * 46 - ph * 12, y - 50 - ph * 14, 3 + ph * 5);
    }
  } },
  // ── 魔鬼鱼：滑翔蝠鲼 + 头鳍 + 发光鳃裂 + 气泡 ──
  trenchRay: { c: 0x5fd0c0, a: 0x1a2a4a, draw: (g, now, x, y, f, c, a) => {
    const glide = Math.sin(now / 500) * 5;
    const fl = y - 26 + glide;
    const wing = Math.sin(now / 500) * 12;
    // 长尾（后掠，S 摆）
    g.lineStyle(3.4, 0x3a8878, 0.95);
    for (let k = 0; k < 3; k++) {
      const t0 = k / 3, t1 = (k + 1) / 3;
      const seg = (t: number) => ({
        x: x + f * (44 + t * 26), y: fl + Math.sin(now / 400 + t * 3) * 4 + t * 3,
      });
      const p0 = seg(t0), p1 = seg(t1);
      g.lineBetween(p0.x, p0.y, p1.x, p1.y);
    }
    // 主体菱形（翼尖扑动）+ 腹面
    g.fillStyle(c, 1);
    mpoly(g, [
      [x - 54, fl - 6 + wing], [x - 18, fl - 20], [x + 8, fl - 24],
      [x + 34, fl - 16 - wing * 0.4], [x + 54, fl - 4 - wing],
      [x + 30, fl + 9], [x - 30, fl + 9],
    ], c, 1);
    g.fillStyle(0x3a8878, 0.85);
    g.fillEllipse(x + f * 6, fl + 5, 52, 9);
    // 头鳍两只（卷水流）
    for (const s of [-1, 1]) {
      const curl = Math.sin(now / 350 + s) * 3;
      mpoly(g, [
        [x + f * 24, fl - 16 + s * 5],
        [x + f * 34, fl - 22 + s * 7 + curl], [x + f * 38, fl - 16 + s * 8 + curl],
        [x + f * 28, fl - 12 + s * 5],
      ], 0x3a8878, 0.95);
    }
    // 眼
    g.fillStyle(0x1a2a3a, 1);
    g.fillCircle(x + f * 26, fl - 6, 2.6);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(x + f * 25.2, fl - 6.8, 0.9);
    // 发光鳃裂五道
    for (let k = 0; k < 5; k++) {
      const gl = 0.35 + 0.45 * Math.sin(now / 300 + k * 1.4);
      g.lineStyle(2, 0x9ffcf0, gl);
      g.lineBetween(x - 10 + k * 8, fl - 8, x - 12 + k * 8, fl + 2);
    }
    // 背部斑纹
    g.fillStyle(a, 0.35);
    g.fillCircle(x - 22, fl - 12, 4.4);
    g.fillCircle(x + 4, fl - 16, 3.2);
    // 气泡尾迹
    for (let k = 0; k < 3; k++) {
      const ph = (now / 600 + k / 3) % 1;
      g.fillStyle(0xbfe8ff, 0.6 * (1 - ph));
      g.fillCircle(x - f * (30 + ph * 24), fl + 4 + Math.sin(ph * 7) * 3, 1.8 * (1 - ph) + 0.6);
    }
  } },
  // ── 武馆战鼓：太鼓 + 鼓钉 + 巴纹鼓面 + 流苏穗 ──
  dojoCrest: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, x, y, _f, c, a) => {
    const beat = Math.abs(Math.sin(now / 350));
    // 木架（榫卯结构）
    g.fillStyle(0x6a4218, 1);
    g.fillRect(x - 32, y - 8, 64, 8);
    g.fillStyle(0x8a5a2a, 1);
    g.fillRect(x - 28, y - 44, 7, 38);
    g.fillRect(x + 21, y - 44, 7, 38);
    g.lineStyle(2, 0x6a4218, 0.9);
    g.lineBetween(x - 28, y - 40, x + 28, y - 40);
    // 鼓身（红漆 + 鼓钉两排）
    g.fillStyle(c, 1);
    g.fillRoundedRect(x - 28, y - 42, 56, 32, 9);
    g.fillStyle(0xc23848, 0.7);
    g.fillRoundedRect(x - 28, y - 26, 56, 16, 6);
    g.fillStyle(a, 0.95);
    for (let k = 0; k < 6; k++) {
      g.fillCircle(x - 22 + k * 8.8, y - 38, 1.6);
      g.fillCircle(x - 22 + k * 8.8, y - 14, 1.6);
    }
    // 鼓面（米白 + 巴纹随敲击缩放）
    const fr = 5.5 + beat * 1.5;
    g.fillStyle(0xf0e8d0, 1);
    g.fillEllipse(x, y - 42, 50, 12);
    g.fillStyle(0xc23848, 0.9);
    g.fillCircle(x, y - 42, fr);
    g.fillStyle(0xf0e8d0, 1);
    for (let k = 0; k < 2; k++) {
      g.fillCircle(x - 2.4 + k * 4.8, y - 42, fr * 0.42);
    }
    // 金环鼓耳 + 流苏（晃动）
    g.lineStyle(2.2, a, 1);
    g.strokeCircle(x - 30, y - 34, 4);
    g.strokeCircle(x + 30, y - 34, 4);
    for (const s of [-1, 1]) {
      const sway = Math.sin(now / 300 + s) * 2.4;
      g.fillStyle(0xffd45c, 0.9);
      g.fillRect(x + s * 30 - 1.4, y - 30, 2.8, 7);
      g.fillStyle(0xc23848, 0.95);
      g.fillCircle(x + s * 30 + sway * 0.3, y - 20, 2.6);
    }
    // 交叉鼓棒（敲击回弹）
    g.save();
    g.translateCanvas(x, y - 46 - beat * 3);
    g.rotateCanvas(-0.4);
    g.lineStyle(3.4, 0xb8873a, 1);
    g.lineBetween(-9, 0, 9, 0);
    g.fillStyle(0xf0e8d0, 1);
    g.fillCircle(9, 0, 2.8);
    g.restore();
  } },
  // ── 墨舟：一笔浓墨成舟 + 墨晕水面 + 篙 + 墨滴 ──
  inkwBoat: { c: 0x8a9aa8, a: 0x2a2e36, draw: (g, now, x, y, f, c, a) => {
    const rock = Math.sin(now / 600) * 2;
    // 墨晕水面（三层淡墨椭圆）
    g.fillStyle(a, 0.12);
    g.fillEllipse(x, y + 4 + rock * 0.4, 100, 12);
    g.fillStyle(a, 0.08);
    g.fillEllipse(x, y + 8 + rock * 0.4, 130, 14);
    g.save();
    g.translateCanvas(x, y - 8 + rock);
    g.rotateCanvas(Math.sin(now / 600) * 0.03);
    // 舟底：一笔浓墨（前细后粗的梭形）
    g.fillStyle(a, 0.95);
    mpoly(g, [[-46, -6], [-20, 2], [14, 4], [34, 0], [44, -8], [30, -8], [-30, -8]], a, 0.95);
    g.fillStyle(c, 0.35);
    g.fillEllipse(-6, -2, 56, 5); // 舱面积墨反光
    // 一叶墨帆（枯笔扫出）
    g.lineStyle(3.4, a, 0.85);
    g.lineBetween(-2, -8, -2, -34);
    g.fillStyle(a, 0.7);
    mpoly(g, [[1, -32], [22, -24], [18, -18], [1, -14]], a, 0.7);
    // 竹篙（斜插 + 尖端墨滴将落）
    g.lineStyle(2.4, a, 0.9);
    g.lineBetween(f * 20, 4, f * 8, -40);
    const drip = (now / 1200) % 1;
    g.fillStyle(a, 0.9 * (1 - drip));
    g.fillCircle(f * 10 + drip * 2, -36 + drip * 10, 2 - drip);
    g.restore();
  } },
  // ── 精灵蜗牛：彩带螺旋壳 + 伸头探脑 + 星光黏痕 ──
  fairySnail: { c: 0xffb7d5, a: 0x9effd0, draw: (g, now, x, y, f, c, a) => {
    const crawl = Math.sin(now / 400) * 2;
    // 身体（前伸的头颈 + 尾部渐细）
    g.fillStyle(0xe8d8b0, 1);
    mpoly(g, [
      [x - 34, y - 4], [x - 30, y - 12 + crawl * 0.3], [x - 6, y - 16 + crawl * 0.3],
      [x + f * 30, y - 14 + crawl * 0.3], [x + f * 38, y - 10 + crawl * 0.3], [x + f * 32, y - 2],
    ], 0xe8d8b0, 1);
    g.fillStyle(0xd8c8a0, 0.6);
    g.fillEllipse(x - 8, y - 5 + crawl * 0.2, 48, 6);
    // 头 + 眼柄（试探摆动）
    const sway = Math.sin(now / 450) * 2;
    g.fillStyle(0xe8d8b0, 1);
    g.fillEllipse(x + f * 36, y - 14 + crawl * 0.3, 14, 12);
    g.lineStyle(2.4, 0xe8d8b0, 1);
    g.lineBetween(x + f * 36, y - 20 + crawl * 0.3, x + f * 33 + sway, y - 30);
    g.lineBetween(x + f * 40, y - 20 + crawl * 0.3, x + f * 42 + sway, y - 29);
    g.fillStyle(0x1a1a22, 0.95);
    g.fillCircle(x + f * 33 + sway, y - 31, 2.2);
    g.fillCircle(x + f * 42 + sway, y - 30, 2.2);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(x + f * 32.4 + sway, y - 31.8, 0.8);
    g.fillCircle(x + f * 41.4 + sway, y - 30.8, 0.8);
    // 嘴笑
    g.lineStyle(1.2, 0xc9a86a, 0.9);
    g.lineBetween(x + f * 40, y - 10 + crawl * 0.3, x + f * 43, y - 9 + crawl * 0.3);
    // 螺旋壳（粉绿双色带 + 高光）
    g.fillStyle(c, 1);
    g.fillCircle(x - 8, y - 26 + crawl * 0.3, 22);
    g.fillStyle(0xff869c, 0.5);
    g.fillCircle(x - 14, y - 32 + crawl * 0.3, 15);
    g.lineStyle(2.6, 0xffffff, 0.8);
    g.beginPath();
    for (let s = 0; s <= 26; s++) {
      const u = s / 26;
      const ang = u * TAU * 2.4 + now / 4000;
      const r = u * 19;
      const px = x - 8 + Math.cos(ang) * r, py = y - 26 + crawl * 0.3 + Math.sin(ang) * r;
      if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.strokePath();
    g.fillStyle(0xffffff, 0.75);
    g.fillCircle(x - 16, y - 34 + crawl * 0.3, 4.4);
    g.lineStyle(1.6, a, 0.85);
    g.strokeCircle(x - 8, y - 26 + crawl * 0.3, 22);
    // 星光黏痕（身后一路亮）
    for (let k = 0; k < 4; k++) {
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(now / 300 + k * 2.1));
      const sx = x - 30 - k * 12;
      g.fillStyle(a, tw * 0.8);
      g.fillRect(sx - 2, y - 3, 4, 1.3);
      g.fillRect(sx - 0.65, y - 4.35, 1.3, 4);
    }
  } },
  // ── 卡丁车：座舱 + 尾翼 + 棋盘格车头 + 排气烟 + 速度线 ──
  racerKart: { c: 0xe8404a, a: 0x22222a, draw: (g, now, x, y, f, c, a) => {
    const spin = now / 80;
    // 车轮（宽胎 + 白色轮毂辐条）
    for (const [wx] of [[x - 26, 10], [x + 26, 10]] as Array<[number, number]>) {
      g.fillStyle(0x2b2b33, 1);
      g.fillRoundedRect(wx - 9, y - 8, 18, 12, 4);
      g.fillStyle(0xd0d8e2, 1);
      g.fillCircle(wx, y - 2, 5);
      g.lineStyle(1.6, 0x5a6272, 0.95);
      for (let k = 0; k < 4; k++) {
        const ang = spin + (k / 4) * TAU;
        g.lineBetween(wx, y - 2, wx + Math.cos(ang) * 4.4, y - 2 + Math.sin(ang) * 4.4);
      }
    }
    // 车架（低伏）
    g.fillStyle(c, 1);
    g.fillRoundedRect(x - 32, y - 18, 64, 14, 5);
    g.fillStyle(0xc23848, 0.7);
    g.fillRoundedRect(x - 32, y - 18, 64, 5, { tl: 5, tr: 5, bl: 0, br: 0 });
    // 车头棋盘格
    g.fillStyle(0xffffff, 0.92);
    for (let k = 0; k < 3; k++) {
      for (let p = 0; p < 2; p++) {
        if ((k + p) % 2 === 0) g.fillRect(x + f * 26 + p * 4 - 2, y - 16 + k * 4, 4, 4);
      }
    }
    // 座椅 + 方向盘
    g.fillStyle(a, 0.95);
    g.fillRoundedRect(x - f * 22 - 7, y - 34, 14, 20, 4);
    g.lineStyle(2.6, 0x2b2b33, 1);
    g.strokeCircle(x + f * 12, y - 24, 5);
    g.lineBetween(x + f * 12, y - 19, x + f * 12, y - 12);
    // 尾翼 + 尾灯（闪）
    g.fillStyle(a, 0.95);
    g.fillRect(x + f * 34 - 3, y - 26, 6, 10);
    g.fillRect(x + f * 30 - 8, y - 28, 16, 3.4);
    g.fillStyle(0xffd45c, 0.5 + 0.5 * Math.sin(now / 110));
    g.fillRect(x + f * 36 - 2, y - 14, 4, 3);
    // 排气烟 + 速度线
    for (let k = 0; k < 3; k++) {
      const ph = (now / 300 + k / 3) % 1;
      g.fillStyle(0xb8c0cc, 0.4 * (1 - ph));
      g.fillCircle(x - f * (38 + ph * 16), y - 10 + (k - 1) * 3, 2 + ph * 4);
    }
    g.lineStyle(1.4, 0xffffff, 0.4);
    for (let k = 0; k < 3; k++) {
      const ph = (now / 240 + k / 3) % 1;
      g.lineBetween(x - f * (46 + ph * 14), y - 20 + k * 6, x - f * (60 + ph * 14), y - 20 + k * 6);
    }
  } },
  // ── 暗夜黑马：黑骏马 + 血色羽鬃马尾 + 蝠影 + 蹄下雾 ──
  vampStallion: { c: 0x2a2a3a, a: 0xc0203a, draw: (g, now, x, y, f, c, a) => {
    // 蹄下血雾
    mist(g, x - 18, y + 2, 9, 0.28);
    mist(g, x + 16, y + 2, 8, 0.24);
    // 四腿（高抬奔跑）
    g.lineStyle(7, 0x1a1420, 1);
    for (const [dx, ph] of [[-26, 0], [-14, Math.PI], [14, Math.PI], [28, 0]] as Array<[number, number]>) {
      const sw = Math.sin(now / 220 + ph) * 7;
      g.lineBetween(x + dx, y - 24, x + dx + sw, y);
      g.fillStyle(0x100c14, 1);
      g.fillCircle(x + dx + sw, y + 1, 3);
    }
    // 躯干（黑曜 + 幽蓝高光）
    g.fillStyle(c, 1);
    g.fillEllipse(x, y - 24, 82, 36);
    g.fillStyle(0x3a3a50, 0.55);
    g.fillEllipse(x - 4, y - 36, 54, 12);
    // 脖子 + 头（凶相）
    g.fillStyle(c, 1);
    g.fillRoundedRect(x + f * 30 - 8, y - 50, 16, 32, 7);
    g.fillEllipse(x + f * 42, y - 54, 28, 17);
    g.fillStyle(0x100c14, 0.8);
    g.fillEllipse(x + f * 50, y - 50, 11, 8);
    g.lineStyle(1.4, 0x100c14, 1);
    g.lineBetween(x + f * 46, y - 58, x + f * 49, y - 63); // 竖耳
    // 血色羽鬃（五根向后飘）
    for (let k = 0; k < 5; k++) {
      feather(g, x + f * (28 - k * 6), y - 52 + k * 3.4,
        f === 1 ? -2.1 + k * 0.12 + Math.sin(now / 300 + k) * 0.05 : -1.04 - k * 0.12, 20 - k, 5,
        k % 2 ? a : 0x8a1428, 0.95);
    }
    // 血色马尾（四根流动）
    for (let k = 0; k < 4; k++) {
      feather(g, x - f * 38, y - 32, Math.PI - f * 0.35 + f * k * 0.15 + Math.sin(now / 280 + k) * 0.07,
        30 - k * 3.4, 5.5, k % 2 ? a : 0x8a1428, 0.92);
    }
    // 血色眼（发光）
    const gl = 0.6 + 0.4 * Math.sin(now / 240);
    g.fillStyle(a, gl);
    g.fillCircle(x + f * 46, y - 56, 2.8);
    g.fillStyle(a, gl * 0.35);
    g.fillCircle(x + f * 46, y - 56, 5.6);
    // 蝙蝠翼影（身侧半透明展开）
    const flap = Math.sin(now / 340) * 5;
    g.fillStyle(0x100c14, 0.4);
    mpoly(g, [
      [x - f * 10, y - 34], [x - f * 40, y - 56 - flap], [x - f * 52, y - 44 - flap],
      [x - f * 36, y - 40], [x - f * 44, y - 32], [x - f * 26, y - 30],
    ], 0x100c14, 0.4);
  } },
  // ── 秋野猪：拱嘴獠牙 + 背鬃 + 落枫环绕 ──
  autumnBoar: { c: 0x8a5a2a, a: 0xd88a2a, draw: (g, now, x, y, f, c, a) => {
    // 四腿（拱地小碎步）
    g.lineStyle(7, 0x6a4a2a, 1);
    for (const [dx, ph] of [[-24, 0], [-12, Math.PI], [12, Math.PI], [24, 0]] as Array<[number, number]>) {
      const sw = Math.sin(now / 280 + ph) * 3.4;
      g.lineBetween(x + dx, y - 20, x + dx + sw, y + 1);
      g.fillStyle(0x3a2a1a, 1);
      g.fillCircle(x + dx + sw, y, 2.8);
    }
    // 躯体（壮硕 + 鬃脊）
    g.fillStyle(c, 1);
    g.fillEllipse(x, y - 22, 76, 36);
    g.fillStyle(0x6a4218, 0.5);
    g.fillEllipse(x - 4, y - 10, 56, 11);
    // 背鬃（锯齿脊）
    g.fillStyle(a, 0.9);
    for (let k = 0; k < 5; k++) {
      mpoly(g, [[x - 24 + k * 11, y - 36], [x - 18 + k * 11, y - 47 - (k % 2) * 3], [x - 12 + k * 11, y - 36]], a, 0.9);
    }
    // 头 + 拱嘴 + 獠牙
    g.fillStyle(c, 1);
    g.fillEllipse(x + f * 36, y - 26, 30, 25);
    g.fillStyle(0x6a4218, 0.8);
    g.fillEllipse(x + f * 48, y - 22, 12, 9); // 拱鼻
    g.fillStyle(0x1a1a22, 0.9);
    g.fillCircle(x + f * 50, y - 24, 1.4); // 鼻孔
    g.fillStyle(0xf0e8d0, 1);
    mpoly(g, [[x + f * 44, y - 20], [x + f * 56, y - 12], [x + f * 44, y - 15]], 0xf0e8d0, 1);
    mpoly(g, [[x + f * 42, y - 34], [x + f * 50, y - 42], [x + f * 48, y - 32]], 0xf0e8d0, 0.9);
    // 小眼 + 内耳
    g.fillStyle(0x1a1a22, 1);
    g.fillCircle(x + f * 38, y - 32, 2.2);
    g.fillStyle(0x6a4218, 1);
    g.fillEllipse(x + f * 30, y - 38, 6, 4);
    // 卷尾
    g.lineStyle(2.6, 0x6a4a2a, 1);
    g.beginPath();
    g.arc(x - f * 38, y - 32, 5, now / 500, now / 500 + 4);
    g.strokePath();
    // 落枫环绕（三片旋转的枫叶）
    for (let k = 0; k < 3; k++) {
      const ph = (now / 1000 + k / 3) % 1;
      const lx = x - 30 + k * 26, ly = y - 46 - Math.sin(ph * Math.PI) * 14;
      g.save();
      g.translateCanvas(lx, ly);
      g.rotateCanvas(now / 400 + k * 2);
      g.fillStyle(k % 2 ? 0xd4622a : a, 0.85);
      mpoly(g, [[0, -5], [4, 0], [0, 5], [-4, 0]], k % 2 ? 0xd4622a : a, 0.85);
      g.restore();
    }
  } },
  // ── 竹雪橇：竹排雪橇 + 绳捆 + 竹叶 + 积雪 ──
  pandaSled: { c: 0x8fbf5a, a: 0xdcefff, draw: (g, now, x, y, _f, c, _a) => {
    const rock = Math.sin(now / 500) * 0.04;
    g.save();
    g.translateCanvas(x, y - 8);
    g.rotateCanvas(rock);
    // 滑刃（前缘翘起）+ 支柱
    g.lineStyle(4.4, 0xa08050, 1);
    g.beginPath();
    g.moveTo(-42, 10); g.lineTo(40, 10); g.lineTo(47, 0);
    g.strokePath();
    g.lineStyle(3, 0x8a6a3a, 1);
    for (const dx of [-30, -8, 16, 34]) g.lineBetween(dx, 10, dx, 0);
    // 竹排桥面（三根竹竿并排 + 节）
    for (let k = 0; k < 3; k++) {
      g.fillStyle(0x8a6a3a, 1);
      g.fillRoundedRect(-36, -6 + k * 5, 72, 5.4, 2.6);
      g.fillStyle(0x6a4a2a, 0.7);
      for (let p = 0; p < 3; p++) g.fillRect(-24 + p * 22, -6 + k * 5, 2, 5.4);
    }
    // 竹节护栏（绿竹 + 节环 + 顶孔）
    g.fillStyle(c, 1);
    for (let k = 0; k < 3; k++) {
      const bx = -26 + k * 24;
      g.fillRoundedRect(bx - 6, -26, 12, 21, 5);
      g.lineStyle(1.4, 0x4a6a2a, 0.9);
      g.lineBetween(bx - 6, -18, bx + 6, -18);
      g.lineBetween(bx - 6, -11, bx + 6, -11);
      g.fillStyle(0x4a6a2a, 0.8);
      g.fillCircle(bx, -26, 3);
      g.fillStyle(c, 1);
    }
    // 横向扶手
    g.fillStyle(0x8a6a3a, 1);
    g.fillRoundedRect(-30, -30, 60, 5, 2.5);
    // 绳捆十字
    g.lineStyle(1.6, 0xd9c08a, 0.95);
    for (let k = 0; k < 2; k++) {
      const bx = -18 + k * 36;
      g.lineBetween(bx - 4, -30, bx + 4, -22);
      g.lineBetween(bx + 4, -30, bx - 4, -22);
    }
    // 积雪 + 粘住的竹叶
    g.fillStyle(0xffffff, 0.9);
    g.fillEllipse(10, -31, 26, 7);
    g.fillStyle(0xe8f4ff, 0.7);
    g.fillEllipse(6, -33, 14, 4);
    g.fillStyle(0x6a8a3a, 0.95);
    mpoly(g, [[-8, -31], [-14, -37], [-10, -30]], 0x6a8a3a, 0.95);
    mpoly(g, [[26, -31], [32, -37], [28, -30]], 0x6a8a3a, 0.95);
    g.restore();
  } },
  // ── 小丑马车：彩条篷车 + 风车 + 彩旗 + 撒彩屑 ──
  jokerCarriage: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, x, y, f, c, a) => {
    const spin = now / 110;
    // 车轮（辐条 + 彩色轮盘）
    for (const cx of [x - 26, x + 26]) {
      g.fillStyle(0x2b2b33, 1);
      g.fillCircle(cx, y + 2, 12);
      for (let k = 0; k < 6; k++) {
        const ang = spin + (k / 6) * TAU;
        g.fillStyle([0xffd45c, 0x4ac8ff, 0x9effd0, 0xffffff, 0xff8ad4, 0xe8404a][k], 0.85);
        mpoly(g, [
          [cx, y + 2],
          [cx + Math.cos(ang) * 10, y + 2 + Math.sin(ang) * 10],
          [cx + Math.cos(ang + 0.5) * 10, y + 2 + Math.sin(ang + 0.5) * 10],
        ], [0xffd45c, 0x4ac8ff, 0x9effd0, 0xffffff, 0xff8ad4, 0xe8404a][k], 0.85);
      }
      g.fillStyle(0xd0d8e2, 1);
      g.fillCircle(cx, y + 2, 3);
    }
    // 车厢（梯形）+ 金滚边
    g.fillStyle(c, 1);
    mpoly(g, [[x - 34, y - 16], [x + 34, y - 16], [x + 26, y - 44], [x - 26, y - 44]], c, 1);
    g.lineStyle(2, a, 0.95);
    g.lineBetween(x - 34, y - 16, x + 34, y - 16);
    g.lineBetween(x - 26, y - 44, x + 26, y - 44);
    // 篷顶彩条（垂直条纹）
    const cols = [0xffd45c, 0x4ac8ff, 0x9effd0, 0xffffff];
    for (let k = 0; k < 4; k++) {
      g.fillStyle(cols[k], 0.92);
      g.fillRect(x - 22 + k * 11, y - 42, 9, 22);
    }
    g.fillStyle(a, 0.9);
    g.fillRect(x - 24, y - 46, 48, 4);
    // 车顶两颗风车（旋转）
    for (const px of [x - 18, x + 18]) {
      g.lineStyle(2, 0x8a5a2a, 1);
      g.lineBetween(px, y - 46, px, y - 56);
      g.save();
      g.translateCanvas(px, y - 58);
      g.rotateCanvas(spin);
      for (let k = 0; k < 4; k++) {
        const ang = (k / 4) * TAU;
        mpoly(g, [[0, 0], [Math.cos(ang) * 8, Math.sin(ang) * 8], [Math.cos(ang + 0.7) * 6, Math.sin(ang + 0.7) * 6]],
          cols[k], 0.95);
      }
      g.restore();
      g.fillStyle(0xffd45c, 1);
      g.fillCircle(px, y - 58, 1.8);
    }
    // 侧挂彩旗绳（下垂弧）
    g.lineStyle(1.2, 0xffffff, 0.7);
    g.lineBetween(x - 34, y - 14, x - 40, y - 24);
    for (let k = 0; k < 3; k++) {
      mpoly(g, [[x - 40 + k * 8, y - 24 + k * 3], [x - 36 + k * 8, y - 24 + k * 3], [x - 38 + k * 8, y - 18 + k * 3]],
        cols[k], 0.95);
    }
    // 撒出的彩屑
    for (let k = 0; k < 5; k++) {
      const ph = (now / 800 + k * 0.2) % 1;
      g.fillStyle(cols[k % 4], 0.85 * (1 - ph));
      g.fillRect(x + f * (30 + ph * 18), y - 44 - k * 5 + ph * 26, 3, 2);
    }
  } },
  // ── 红轿金顶：轿身金顶 + 垂帘流苏 + 抬杠 ──
  pagodPalanquin: { c: 0xc0392b, a: 0xd9b45c, draw: (g, now, x, y, _f, c, a) => {
    const sway = Math.sin(now / 500) * 0.03;
    g.save();
    g.translateCanvas(x, y - 10);
    g.rotateCanvas(sway);
    // 底杠 + 抬杠（两端超出）
    g.fillStyle(0x8a5a2a, 1);
    g.fillRoundedRect(-38, 0, 76, 6, 3);
    g.fillStyle(0x6a4218, 1);
    g.fillRect(-52, 2, 18, 4);
    g.fillRect(34, 2, 18, 4);
    g.fillStyle(0xd9b45c, 0.8);
    g.fillCircle(-50, 4, 3.4);
    g.fillCircle(50, 4, 3.4);
    // 轿身（红漆 + 金边框 + 格纹）
    g.fillStyle(c, 1);
    g.fillRoundedRect(-26, -28, 52, 28, 5);
    g.lineStyle(2, a, 0.95);
    g.strokeRoundedRect(-26, -28, 52, 28, 5);
    g.lineStyle(1.2, a, 0.6);
    for (let k = 0; k < 3; k++) g.lineBetween(-16 + k * 16, -28, -16 + k * 16, 0);
    // 轿窗（糊纸透暖光）
    g.fillStyle(0xffe89a, 0.55 + 0.2 * Math.sin(now / 300));
    g.fillRoundedRect(-9, -22, 18, 16, 3);
    g.lineStyle(1.6, a, 0.9);
    g.strokeRoundedRect(-9, -22, 18, 16, 3);
    g.lineBetween(0, -22, 0, -6);
    g.lineBetween(-9, -14, 9, -14);
    // 金顶（飞檐翘角 + 顶珠）
    mpoly(g, [[-32, -28], [-34, -34], [0, -48], [34, -34], [32, -28]], a, 1);
    g.fillStyle(0x8a5a2a, 0.8);
    mpoly(g, [[-30, -29], [0, -42], [30, -29]], 0x8a5a2a, 0.6);
    g.fillStyle(0xffd45c, 1);
    g.fillCircle(0, -48, 3.4);
    g.fillStyle(0xffe89a, 0.8);
    g.fillCircle(0, -48, 1.6);
    // 四角流苏（随抬晃动）
    for (const s of [-1, 1]) {
      const sw = Math.sin(now / 350 + s) * 2.6;
      g.lineStyle(1.4, a, 0.9);
      g.lineBetween(s * 32, -32, s * 32 + sw * 0.4, -20);
      g.fillStyle(0xc0392b, 0.95);
      g.fillEllipse(s * 32 + sw * 0.5, -17, 4, 8);
    }
    // 帘底坠饰
    g.fillStyle(a, 0.7);
    for (let k = 0; k < 5; k++) g.fillCircle(-20 + k * 10, 1, 1.6);
    g.restore();
  } },
  // ── 风暴滑翔翼：条纹伞翼 + 操纵索 + 翼尖雷光 + 风痕 ──
  stormGlider: { c: 0x7fd4ff, a: 0x2a3a5a, draw: (g, now, x, y, f, c, a) => {
    const sway = Math.sin(now / 500) * 5;
    const tip = y - 52 + sway;
    // 伞翼（条纹三角翼）
    const stripes = [c, 0xbfe8ff, c, 0xbfe8ff, c];
    for (let k = 0; k < 5; k++) {
      const t0 = -1 + (k / 5) * 2, t1 = -1 + ((k + 1) / 5) * 2;
      mpoly(g, [
        [x + t0 * 52, y - 18 + sway + Math.abs(t0) * 8],
        [x + t1 * 52, y - 18 + sway + Math.abs(t1) * 8],
        [x, tip],
      ], stripes[k], 0.92);
    }
    g.lineStyle(1.6, a, 0.8);
    g.lineBetween(x - 52, y - 18 + sway + 8, x, tip);
    g.lineBetween(x + 52, y - 18 + sway + 8, x, tip);
    // 中脊线
    g.lineStyle(2, a, 0.9);
    g.lineBetween(x, tip, x, y - 18 + sway);
    // 操纵索（两根斜拉）
    g.lineStyle(1.4, a, 0.75);
    g.lineBetween(x - 46, y - 17 + sway, x - f * 8, y - 8 + sway);
    g.lineBetween(x + 46, y - 17 + sway, x - f * 8, y - 8 + sway);
    // 悬挂吊带
    g.fillStyle(a, 0.9);
    g.fillRoundedRect(x - f * 12 - 4, y - 10 + sway * 0.4, 8, 12, 3);
    // 翼尖雷光（两端跳电）
    for (const s of [-1, 1]) {
      if (Math.sin(now / 170 + s) > 0.2) {
        const tx = x + s * 50, ty = y - 16 + sway + Math.abs(s) * 8;
        g.lineStyle(1.8, 0xffe89a, 0.95);
        g.lineBetween(tx, ty, tx + s * 6, ty - 5 + Math.sin(now / 60) * 3);
        g.lineBetween(tx + s * 6, ty - 5, tx + s * 3, ty - 11);
      }
    }
    // 风痕（身后两道掠过）
    g.lineStyle(1.6, 0xbfe8ff, 0.5);
    for (let k = 0; k < 2; k++) {
      const ph = (now / 400 + k * 0.5) % 1;
      g.lineBetween(x - f * (58 + ph * 22), y - 30 + k * 12 - sway * 0.4, x - f * (76 + ph * 22), y - 34 + k * 12 - sway * 0.4);
    }
  } },
  // ── 月云：托月祥云 + 弦月嵌芯 + 坠落月尘 ──
  lunarCloud: { c: 0xe8f0ff, a: 0xffe89a, draw: (g, now, x, y, _f, c, a) => {
    const br = Math.sin(now / 500) * 3;
    // 底层暗面
    g.fillStyle(0xc8d8ee, 0.85);
    g.fillEllipse(x, y - 4, 66, 14);
    g.fillCircle(x - 28, y - 8, 13);
    g.fillCircle(x + 26, y - 9, 14);
    // 云团主体
    g.fillStyle(c, 1);
    g.fillCircle(x - 30, y - 14, 16);
    g.fillCircle(x - 2, y - 24 - br, 22);
    g.fillCircle(x + 26, y - 14, 17);
    // 弦月嵌在云芯（金色月牙 + 光晕）
    g.fillStyle(a, 0.3);
    g.fillCircle(x + 2, y - 26 - br, 14);
    g.fillStyle(a, 0.95);
    g.fillCircle(x + 2, y - 26 - br, 9);
    g.fillStyle(c, 1);
    g.fillCircle(x + 6, y - 29 - br, 8);
    // 云顶高光
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(x - 10, y - 30 - br, 6);
    g.fillCircle(x + 18, y - 20, 4.6);
    // 坠落月尘（四点，错落下坠）
    for (let k = 0; k < 4; k++) {
      const ph = (now / 900 + k / 4) % 1;
      g.fillStyle(a, 0.6 * (1 - ph));
      g.fillCircle(x - 44 - ph * 30 + Math.sin(k * 5) * 6, y - 18 + ph * 20, 2.2 * (1 - ph) + 0.6);
    }
  } },
  // ── 龙头船：维京长船 + 圆盾舷 + 条纹帆 + 龙首 ──
  vikingDrakkar: { c: 0x8fb4de, a: 0x8a5a2a, draw: (g, now, x, y, f, _c, a) => {
    const rock = Math.sin(now / 600) * 2;
    // 浪沫
    g.fillStyle(0xd8ecf8, 0.6);
    g.fillEllipse(x, y + 7, 108, 9);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(x - 40, y + 5, 3);
    g.fillCircle(x + 36, y + 6, 2.6);
    g.save();
    g.translateCanvas(x, y - 8 + rock);
    g.rotateCanvas(Math.sin(now / 600) * 0.03);
    // 船体（翘首翘尾）+ 板缝
    mpoly(g, [[-50, -2], [50, -2], [40, 10], [-40, 10]], 0x6a4a2a, 1);
    mpoly(g, [[-50, -2], [-44, -12], [-38, -2]], 0x6a4a2a, 1);
    g.lineStyle(1.4, 0x4a3218, 0.9);
    g.lineBetween(-48, -2, 48, -2);
    g.lineBetween(-42, 4, 42, 4);
    // 舷排圆盾（红蓝相间 + 盏心钉）
    for (let k = 0; k < 5; k++) {
      const sx = -32 + k * 16;
      g.fillStyle(k % 2 ? 0xc0392b : 0x3a6a9a, 1);
      g.fillCircle(sx, -1, 5.4);
      g.fillStyle(0xffd45c, 0.9);
      g.fillCircle(sx, -1, 1.6);
    }
    // 桅杆 + 条纹帆（红白横条 + 帆鼓）
    g.fillStyle(0x4a3218, 1);
    g.fillRect(-2.5, -52, 5, 48);
    for (let k = 0; k < 4; k++) {
      g.fillStyle(k % 2 ? 0xd8d0c0 : 0xc0392b, 0.95);
      g.fillRect(-26, -48 + k * 8, 52, 8);
    }
    g.lineStyle(1.2, 0x4a3218, 0.6);
    g.lineBetween(0, -52, 0, -18);
    // 桅顶旗
    mpoly(g, [[3, -50], [14, -47], [3, -44]], 0xc0392b, 1);
    // 龙首（船头，金眼红鬃）
    mpoly(g, [[f * 46, -4], [f * 58, -14], [f * 66, -22], [f * 58, -24], [f * 50, -16], [f * 44, -8]], a, 1);
    g.fillStyle(0xffd45c, 1);
    g.fillCircle(f * 58, -19, 1.8);
    g.lineStyle(2, 0xc0392b, 0.9);
    g.lineBetween(f * 60, -24, f * 66, -30);
    g.lineBetween(f * 56, -25, f * 60, -32);
    // 尾舵卷纹
    g.lineStyle(2.4, a, 0.9);
    g.beginPath();
    g.arc(-f * 46, -12, 6, -1.2, 2.6);
    g.strokePath();
    g.restore();
  } },
  // ── 大象：扇耳卷鼻 + 白象牙 + 驮毯 ──
  safariElephant: { c: 0x9aa7b8, a: 0x8a6a4a, draw: (g, now, x, y, f, c, _a) => {
    // 四条粗腿（慢步 + 脚趾甲）
    g.lineStyle(11, 0x8a96a6, 1);
    for (const [dx, ph] of [[-28, 0], [-13, Math.PI], [15, Math.PI], [30, 0]] as Array<[number, number]>) {
      const sw = Math.sin(now / 460 + ph) * 3;
      g.lineBetween(x + dx, y - 24, x + dx + sw, y);
      g.fillStyle(0xf0e8d0, 0.9);
      for (let t = 0; t < 2; t++) g.fillCircle(x + dx + sw - 2 + t * 4, y, 1.8);
    }
    // 躯体 + 背部起伏
    g.fillStyle(c, 1);
    g.fillEllipse(x, y - 28, 86, 42);
    g.fillCircle(x - 14, y - 40, 12);
    g.fillCircle(x + 8, y - 42, 13);
    g.fillStyle(0x8a96a6, 0.6);
    g.fillEllipse(x - 4, y - 16, 58, 12);
    // 头 + 大耳（扇动）
    const flap = Math.sin(now / 420) * 5;
    g.fillStyle(c, 1);
    g.fillCircle(x + f * 40, y - 36, 21);
    g.fillStyle(0x8a96a6, 1);
    g.fillEllipse(x + f * 28, y - 38, 16, 22 + flap);
    g.fillStyle(0x6a7686, 0.6);
    g.fillEllipse(x + f * 29, y - 38, 8, 14 + flap * 0.6);
    // 鼻（卷起摆动，两节 + 鼻尖卷）
    const trunk = Math.sin(now / 400) * 4;
    g.lineStyle(8, 0x8a96a6, 1);
    g.lineBetween(x + f * 50, y - 34, x + f * 54, y - 20 + trunk * 0.4);
    g.lineBetween(x + f * 54, y - 20 + trunk * 0.4, x + f * 50 + trunk, y - 8);
    g.lineStyle(6, 0x8a96a6, 1);
    g.beginPath();
    g.arc(x + f * 46 + trunk, y - 8, 5, -0.5, 2.6);
    g.strokePath();
    g.lineStyle(1.2, 0x6a7686, 0.6);
    for (let k = 0; k < 3; k++) g.lineBetween(x + f * (47 + k * 2.4), y - 30 + k * 7, x + f * (52 + k * 1.6), y - 29 + k * 7);
    // 象牙
    g.fillStyle(0xf0e8d0, 1);
    mpoly(g, [[x + f * 46, y - 26], [x + f * 56, y - 14], [x + f * 46, y - 20]], 0xf0e8d0, 1);
    // 眼 + 驮毯
    g.fillStyle(0x1a1a22, 1);
    g.fillCircle(x + f * 44, y - 42, 2.4);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(x + f * 43.2, y - 42.8, 0.8);
    g.fillStyle(0xa8324a, 1);
    g.fillRoundedRect(x - 18, y - 46, 36, 12, 4);
    g.fillStyle(0xffd45c, 0.85);
    g.fillRect(x - 18, y - 42, 36, 2.4);
    for (let k = 0; k < 3; k++) g.fillCircle(x - 10 + k * 10, y - 46, 1.6);
  } },
  // ── 聚光灯台：转向灯体 + 灰尘光柱 + 台阶底座 ──
  theatSpotlight: { c: 0xfff0c0, a: 0xffd45c, draw: (g, now, x, y, _f, c, a) => {
    const ang = -1.15 + Math.sin(now / 900) * 0.4;
    // 光柱（灰尘颗粒在其中漂浮）
    const dx = Math.cos(ang), dy = Math.sin(ang);
    g.fillStyle(c, 0.16);
    g.fillPoints([
      { x: x - dy * 9, y: y - 26 + dx * 9 },
      { x: x + dy * 9, y: y - 26 - dx * 9 },
      { x: x + dx * 96 + dy * 30, y: y - 26 + dy * 96 - dx * 30 },
      { x: x + dx * 96 - dy * 30, y: y - 26 + dy * 96 + dx * 30 },
    ] as never, true);
    g.fillStyle(c, 0.1);
    g.fillEllipse(x + dx * 96, y - 26 + dy * 96, 66, 18);
    for (let k = 0; k < 5; k++) {
      const ph = (now / 1400 + k / 5) % 1;
      g.fillStyle(0xffffff, 0.5 * (1 - ph) * 0.8);
      g.fillCircle(x + dx * (14 + ph * 70) + dy * (k - 2) * 5, y - 26 + dy * (14 + ph * 70) - dx * (k - 2) * 5, 1.4);
    }
    // 底座（三层台阶）
    g.fillStyle(0x3a3a44, 1);
    g.fillEllipse(x, y, 46, 10);
    g.fillStyle(0x2b2b33, 1);
    g.fillEllipse(x, y - 4, 34, 8);
    g.fillRect(x - 4, y - 26, 8, 22);
    // 灯体（转向 + 散热纹）
    g.save();
    g.translateCanvas(x, y - 28);
    g.rotateCanvas(ang + Math.PI / 2);
    g.fillStyle(a, 0.95);
    g.fillRoundedRect(-10, -20, 20, 24, 5);
    g.lineStyle(1.2, 0x8a6a1a, 0.7);
    for (let k = 0; k < 3; k++) g.lineBetween(-7, -14 + k * 5, 7, -14 + k * 5);
    g.fillStyle(0x2b2b33, 1);
    g.fillRoundedRect(-12, -24, 24, 6, 2.4); // 遮光顶
    g.fillStyle(c, 0.75 + 0.25 * Math.sin(now / 150));
    g.fillEllipse(0, 4, 17, 6); // 灯口
    g.fillStyle(0xffffff, 0.9);
    g.fillEllipse(0, 4, 9, 3.2);
    g.restore();
    // 侧边小星（灯亮时的闪点）
    g.fillStyle(a, 0.5 + 0.5 * Math.sin(now / 200));
    g.fillCircle(x + dx * 20 - dy * 14, y - 28 + dy * 20 + dx * 14, 1.6);
  } },
  // ── 冰鹿：蓝白冰鹿 + 发光枝角 + 霜气蹄雾 ──
  boreaStag: { c: 0xdfeefc, a: 0x7dffc4, draw: (g, now, x, y, f, c, a) => {
    const gl = 0.55 + 0.45 * Math.sin(now / 240);
    // 蹄下霜雾
    mist(g, x - 20, y + 2, 9, 0.4);
    mist(g, x + 18, y + 2, 8, 0.35);
    // 四条冰腿（带关节亮斑）
    g.lineStyle(6.4, 0xb8c8d8, 1);
    for (const [dx, ph] of [[-26, 0], [-13, Math.PI], [15, Math.PI], [28, 0]] as Array<[number, number]>) {
      const sw = Math.sin(now / 380 + ph) * 4;
      g.lineBetween(x + dx, y - 26, x + dx + sw, y + 1);
      g.fillStyle(a, 0.5);
      g.fillCircle(x + dx, y - 16, 2);
    }
    // 躯干（冰蓝渐层 + 霜纹高光）
    g.fillStyle(c, 1);
    g.fillEllipse(x, y - 30, 76, 32);
    g.fillStyle(0xffffff, 0.55);
    g.fillEllipse(x - 6, y - 40, 50, 10);
    g.lineStyle(1.2, 0xa8cce8, 0.7);
    g.lineBetween(x - 20, y - 34, x - 8, y - 24);
    g.lineBetween(x + 8, y - 36, x + 18, y - 26);
    // 颈 + 头（昂首）
    g.fillStyle(c, 1);
    g.fillRoundedRect(x + f * 30 - 7, y - 54, 14, 30, 6);
    g.fillEllipse(x + f * 40, y - 58, 24, 14);
    g.fillStyle(0xb8c8d8, 0.8);
    g.fillEllipse(x + f * 48, y - 55, 9, 6); // 鼻
    // 发光枝角（主枝 + 分杈，节点发光）
    g.lineStyle(3, a, 0.6 + gl * 0.4);
    g.lineBetween(x + f * 34, y - 64, x + f * 28, y - 84);
    g.lineBetween(x + f * 31, y - 72, x + f * 21, y - 80);
    g.lineBetween(x + f * 40, y - 64, x + f * 48, y - 84);
    g.lineBetween(x + f * 45, y - 72, x + f * 55, y - 80);
    g.fillStyle(a, gl);
    for (const [ax, ay] of [[28, -84], [21, -80], [48, -84], [55, -80]] as Array<[number, number]>) {
      g.fillCircle(x + f * ax, y + ay, 2.6);
      g.fillStyle(a, gl * 0.3);
      g.fillCircle(x + f * ax, y + ay, 5.2);
      g.fillStyle(a, gl);
    }
    // 冰晶眼 + 呼出的白气
    g.fillStyle(0x2a4a5a, 0.9);
    g.fillCircle(x + f * 43, y - 60, 2.4);
    g.fillStyle(a, gl * 0.8);
    g.fillCircle(x + f * 43, y - 60, 4.4);
    for (let k = 0; k < 2; k++) {
      const ph = (now / 800 + k * 0.5) % 1;
      g.fillStyle(0xffffff, 0.4 * (1 - ph));
      g.fillCircle(x + f * (52 + ph * 10), y - 55 + ph * 4, 2 + ph * 4);
    }
    // 尾一小撮
    g.fillStyle(0xb8c8d8, 0.9);
    g.fillCircle(x - f * 36, y - 36, 3.4);
  } },
  // ── 贡多拉：黑舟金饰 + 船头梳齿 + 舱灯 + 摇桨 ──
  venicGondola: { c: 0x8a5a2a, a: 0xd9b45c, draw: (g, now, x, y, f, _c, a) => {
    const rock = Math.sin(now / 600) * 2;
    // 运河水痕 + 灯影
    g.fillStyle(0x4a6a8a, 0.4);
    g.fillEllipse(x, y + 8, 116, 10);
    g.fillStyle(0xffe89a, 0.3);
    g.fillEllipse(x + f * 16, y + 8, 10, 4);
    g.save();
    g.translateCanvas(x, y - 8 + rock);
    g.rotateCanvas(Math.sin(now / 600) * 0.025);
    // 黑色舟体（两端尖翘）+ 金线
    g.fillStyle(0x2a2a32, 1);
    mpoly(g, [[-52, -2], [40, -4], [56, -14], [44, 0], [36, 10], [-38, 10], [-50, 0]], 0x2a2a32, 1);
    g.lineStyle(1.6, a, 0.95);
    g.lineBetween(-50, 0, 44, -2);
    g.lineBetween(-46, 6, 38, 6);
    g.fillStyle(0x3a3a44, 0.8);
    g.fillEllipse(0, -1, 66, 5); // 舱面
    // 船头铁饰（梳齿 ferro + 金球）
    for (let k = 0; k < 3; k++) {
      g.lineStyle(2.4, a, 0.95);
      g.lineBetween(f * 50, -2, f * (58 + k * 4), -12 - k * 5);
    }
    g.fillStyle(a, 1);
    g.fillCircle(f * 60, -14, 3);
    // 座舱 + 暖灯
    g.fillStyle(0x8a2a2a, 0.95);
    g.fillRoundedRect(-14, -22, 30, 12, 5);
    g.lineStyle(1.4, a, 0.8);
    g.strokeRoundedRect(-14, -22, 30, 12, 5);
    g.fillStyle(0xffe89a, 0.75 + 0.25 * Math.sin(now / 260));
    g.fillCircle(f * 18, -26, 3.2);
    g.fillStyle(0xffd45c, 0.4);
    g.fillCircle(f * 18, -26, 6);
    // 船夫的桨（划水回摆 + 桨叶水花）
    g.lineStyle(3, 0x6a4a2a, 0.95);
    g.save();
    g.translateCanvas(-f * 32, -12);
    g.rotateCanvas(f * (0.55 + Math.sin(now / 500) * 0.28));
    g.lineBetween(0, 0, 0, 28);
    g.fillStyle(0x8a6a3a, 1);
    g.fillEllipse(0, 29, 5, 9);
    g.restore();
    const splash = Math.abs(Math.sin(now / 500));
    g.fillStyle(0xbfe8ff, 0.6 * splash);
    g.fillCircle(-f * (40 + splash * 6), 2 + splash * 3, 2 + splash * 2);
    g.restore();
  } },
  // ── 罗马战车：辐条轮 + 曲车身 + 月桂枝 + 尘土 ──
  olympChariot: { c: 0xf0ead8, a: 0xffd45c, draw: (g, now, x, y, f, c, a) => {
    const spin = now / 90;
    // 车轮（六辐 + 金毂 + 滚动）
    g.fillStyle(0x6a4a2a, 1);
    g.fillCircle(x - 24, y + 2, 13);
    g.fillStyle(0xd8c8a0, 0.5);
    g.fillCircle(x - 24, y + 2, 9);
    g.lineStyle(2.2, a, 0.95);
    for (let k = 0; k < 6; k++) {
      const ang = spin + (k / 6) * TAU;
      g.lineBetween(x - 24, y + 2, x - 24 + Math.cos(ang) * 11, y + 2 + Math.sin(ang) * 11);
    }
    g.fillStyle(a, 1);
    g.fillCircle(x - 24, y + 2, 3);
    // 尘土（轮后扬起）
    for (let k = 0; k < 3; k++) {
      const ph = (now / 350 + k / 3) % 1;
      g.fillStyle(0xd8c8a0, 0.4 * (1 - ph));
      g.fillCircle(x - f * (36 + ph * 16), y + 2 - ph * 8, 3 + ph * 5);
    }
    // 车厢（曲面板 + 皮革包边）
    g.fillStyle(c, 1);
    mpoly(g, [[x - 8, y - 30], [x + 30, y - 30], [x + 40, y - 22], [x + 40, y - 4], [x - 8, y - 4]], c, 1);
    g.fillStyle(0xd8c8a0, 0.7);
    g.fillRoundedRect(x - 6, y - 28, 44, 5, 2);
    g.lineStyle(2, 0x6a4a2a, 0.9);
    g.lineBetween(x - 8, y - 4, x + 40, y - 4);
    // 月桂金饰（车厢沿一排叶 + 中央鹰徽点）
    g.fillStyle(0x8aa860, 0.95);
    for (let k = 0; k < 4; k++) {
      mpoly(g, [
        [x - 2 + k * 10, y - 26], [x + 2 + k * 10, y - 31], [x + 6 + k * 10, y - 26],
      ], 0x8aa860, 0.95);
    }
    g.fillStyle(a, 0.9);
    g.fillCircle(x + 18, y - 20, 2.6);
    g.lineStyle(1.4, a, 0.8);
    g.strokeCircle(x + 18, y - 20, 4.6);
    // 辕木（斜向前）+ 辕头金饰
    g.lineStyle(4, 0x6a4a2a, 1);
    g.lineBetween(x - 4, y - 12, x + f * 46, y - 16);
    g.fillStyle(a, 0.9);
    g.fillCircle(x + f * 46, y - 16, 3);
  } },
  // ── 桑巴花车：彩灯车厢 + 巨羽扇 + 彩球 + 亮片 ──
  sambaFloat: { c: 0xffd45c, a: 0x3aa05a, draw: (g, now, x, y, _f, c, _a) => {
    // 车轮
    for (const cx of [x - 26, x + 26]) {
      g.fillStyle(0x2b2b33, 1);
      g.fillCircle(cx, y + 2, 9);
      g.fillStyle(0xffd45c, 0.9);
      g.fillCircle(cx, y + 2, 3.4);
      g.lineStyle(1.4, 0x55555f, 0.8);
      g.strokeCircle(cx, y + 2, 9);
    }
    // 车厢（金底 + 彩条侧裙）
    g.fillStyle(c, 1);
    g.fillRoundedRect(x - 36, y - 22, 72, 20, 7);
    const skirt = [0xe83a5a, 0x4ac8ff, 0x9effd0, 0xff8ad4];
    for (let k = 0; k < 5; k++) {
      g.fillStyle(skirt[k], 0.9);
      g.fillRect(x - 32 + k * 15, y - 10, 8, 8);
    }
    g.lineStyle(2, 0xff8ad4, 0.9);
    g.lineBetween(x - 36, y - 22, x + 36, y - 22);
    // 车顶巨羽扇（五根彩羽摆动 + 羽轴）
    for (let k = 0; k < 5; k++) {
      const sway = Math.sin(now / 350 + k * 0.9) * 5;
      const bx = x - 24 + k * 12;
      feather(g, bx, y - 30, -Math.PI / 2 + (k - 2) * 0.22 + sway * 0.02, 24 + Math.abs(k - 2) * -3, 6,
        skirt[k], 0.95);
      g.lineStyle(1, 0xffffff, 0.5);
      g.lineBetween(bx, y - 30, bx + sway * 0.4, y - 52);
    }
    // 两侧彩球串（随车晃）
    for (const s of [-1, 1]) {
      for (let k = 0; k < 2; k++) {
        g.fillStyle(skirt[(k + (s > 0 ? 2 : 0)) % 4], 0.95);
        g.fillCircle(x + s * (40 + k * 7), y - 14 - k * 6, 3.4);
        g.lineStyle(1, 0xffffff, 0.6);
        g.lineBetween(x + s * 36, y - 12, x + s * (40 + k * 7), y - 14 - k * 6);
      }
    }
    // 彩灯泡（沿车厢边闪）
    for (let k = 0; k < 6; k++) {
      const bl = 0.4 + 0.6 * Math.abs(Math.sin(now / 200 + k * 1.3));
      g.fillStyle(k % 2 ? 0xffe89a : 0x9effd0, bl);
      g.fillCircle(x - 30 + k * 12, y - 2, 1.8);
    }
    // 撒亮片
    for (let k = 0; k < 6; k++) {
      const ph = (now / 700 + k * 0.17) % 1;
      g.fillStyle(skirt[k % 4], 0.8 * (1 - ph));
      g.fillRect(x - 30 + k * 12 + Math.sin(ph * 6) * 5, y - 52 + ph * 34, 2.4, 1.6);
    }
  } },
};
