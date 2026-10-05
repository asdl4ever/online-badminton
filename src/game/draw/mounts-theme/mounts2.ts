import { mpoly, feather, TAU, type MountArt } from './shared';

/**
 * 第二批主题坐骑——**逐款精绘**：分层形体 + 明暗 + 贴名细节 + 动画。
 * （海盗小艇 / 蒸汽小车 / 火箭 / 三角龙 / 蘑菇虫 / 海龟 / 石像鬼 / 雪橇 / 寿司船 / 牧场马）
 */
export const MOUNTS_2: Record<string, MountArt> = {
  // ── 海盗小艇：船板叠压 + 破黑帆骷髅旗 + 船首像 + 划桨 + 水花 ──
  pirateMount: { c: 0x6a4a2a, a: 0xe8c86a, draw: (g, now, x, y, f, c, _a) => {
    const rock = Math.sin(now / 600) * 2;
    // 水面（先垫底）
    g.fillStyle(0x4a7a9a, 0.4);
    g.fillEllipse(x, y + 7, 108, 10);
    g.save();
    g.translateCanvas(x, y - 10 + rock);
    g.rotateCanvas(Math.sin(now / 600) * 0.03);
    // 船体（弯月形）+ 板缝
    mpoly(g, [[-48, -4], [48, -4], [36, 12], [-36, 12]], c);
    g.lineStyle(1.6, 0x4a3218, 0.9);
    g.lineBetween(-48, -4, 48, -4);
    g.lineBetween(-44, 3, 44, 3);
    // 船首上翘 + 首像
    mpoly(g, [[f * 44, -4], [f * 54, -18], [f * 48, -2], [f * 40, 6]], 0x8a6a3a, 1);
    g.fillStyle(0xffd45c, 0.9);
    g.fillCircle(f * 50, -14, 2.4);
    // 桅杆 + 破黑帆（撕口）+ 骷髅标
    g.fillStyle(0x4a3218, 1);
    g.fillRect(-2.5, -48, 5, 44);
    mpoly(g, [[3, -44], [30, -36], [26, -26], [32, -20], [3, -12]], 0x1a1a22, 0.95);
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(15, -30, 4.4);
    g.fillRect(11.4, -27.5, 7.2, 1.6);
    g.fillRect(13.4, -27.5, 1.6, 3);
    // 桅顶骷髅旗（飘动）
    const flag = Math.sin(now / 200) * 3;
    g.fillStyle(0x1a1a22, 1);
    mpoly(g, [[0, -56], [14, -53 + flag], [0, -49]], 0x1a1a22, 1);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(5, -52.6 + flag * 0.3, 1.6);
    // 两支船桨（交替划）
    g.lineStyle(3.4, 0x8a6a3a, 0.95);
    for (const s of [-1, 1]) {
      const oar = Math.sin(now / 400 + (s > 0 ? 0 : Math.PI)) * 0.35;
      g.save();
      g.translateCanvas(s * 42, 0);
      g.rotateCanvas(s * (0.75 + oar));
      g.lineBetween(0, 0, 0, 17);
      g.fillStyle(0xa8845a, 1);
      g.fillEllipse(0, 18, 6, 10);
      g.restore();
    }
    g.restore();
  } },
  // ── 蒸汽小车：铜锅炉 + 铆钉 + 压力表 + 咕咕冒烟 + 连杆车轮 ──
  steamMount: { c: 0xb06a2a, a: 0x9aa7b8, draw: (g, now, x, y, f, c, a) => {
    const spin = now / 90;
    // 车轮（辐条转 + 轮缘）
    for (const [wx, wr] of [[x - 24, 10], [x + 20, 10], [x + 36, 7]] as Array<[number, number]>) {
      g.fillStyle(0x2b2b33, 1);
      g.fillCircle(wx, y + 2, wr);
      g.lineStyle(2, a, 0.95);
      for (let k = 0; k < 6; k++) {
        const ang = spin + (k / 6) * TAU;
        g.lineBetween(wx, y + 2, wx + Math.cos(ang) * (wr - 2), y + 2 + Math.sin(ang) * (wr - 2));
      }
      g.fillStyle(0xd0d8e2, 0.9);
      g.fillCircle(wx, y + 2, 2.4);
    }
    // 连杆
    g.lineStyle(2, 0x6a4a2a, 0.95);
    g.lineBetween(x - 24 + Math.cos(spin) * 6, y + 2 + Math.sin(spin) * 6,
      x + 20 + Math.cos(spin) * 6, y + 2 + Math.sin(spin) * 6);
    // 铜锅炉（卧式圆筒）
    g.fillStyle(c, 1);
    g.fillRoundedRect(x - 34, y - 28, 66, 28, 12);
    g.fillStyle(0xc9834a, 0.85);
    g.fillRoundedRect(x - 34, y - 28, 66, 12, { tl: 12, tr: 12, bl: 0, br: 0 });
    g.lineStyle(1.4, 0x8a4a1a, 0.8);
    for (let k = 0; k < 3; k++) g.lineBetween(x - 24 + k * 18, y - 28, x - 24 + k * 18, y);
    // 铆钉两排
    g.fillStyle(0xffd45c, 0.85);
    for (let k = 0; k < 5; k++) {
      g.fillCircle(x - 27 + k * 13, y - 24, 1.4);
      g.fillCircle(x - 27 + k * 13, y - 4, 1.4);
    }
    // 驾驶室 + 烟囱 + 汽笛
    g.fillStyle(0x8a4a1a, 1);
    g.fillRoundedRect(x - 38, y - 40, 16, 16, 3);
    g.fillStyle(0x6a4a2a, 1);
    g.fillRect(x + f * 30, y - 44, 9, 18);
    g.fillStyle(a, 1);
    g.fillRect(x + f * 30 - 2, y - 47, 13, 4);
    // 咕咕冒烟（三团滚动）
    for (let k = 0; k < 3; k++) {
      const ph = (now / 500 + k / 3) % 1;
      g.fillStyle(0xdfe6f0, 0.5 * (1 - ph));
      g.fillCircle(x + f * 34 + f * ph * 12, y - 50 - ph * 18, 4 + ph * 7);
    }
    // 压力表（指针抖动）
    g.fillStyle(0xf0e8d0, 1);
    g.fillCircle(x - 22, y - 18, 5.5);
    g.lineStyle(1.4, 0x2b2b33, 0.9);
    g.strokeCircle(x - 22, y - 18, 5.5);
    const nd = -0.8 + Math.sin(now / 350) * 0.5;
    g.lineBetween(x - 22, y - 18, x - 22 + Math.cos(nd) * 4.4, y - 18 + Math.sin(nd) * 4.4);
    // 车头灯
    g.fillStyle(0xffd45c, 0.9 + 0.1 * Math.sin(now / 150));
    g.fillCircle(x + f * 36, y - 12, 3.6);
  } },
  // ── 火箭飞船：银白箭体 + 双层喷焰 + 舷窗 + 星屑尾迹 ──
  astroMount: { c: 0xe8f0ff, a: 0xff8a3a, draw: (g, now, x, y, f, c, a) => {
    const fl = y - 24 + Math.sin(now / 420) * 5;
    // 喷焰（外橙内黄白，抖动）
    const wob = Math.sin(now / 50) * 3;
    g.fillStyle(0xff8a3a, 0.75);
    mpoly(g, [[x - f * 40, fl - 6], [x - f * (62 + wob), fl], [x - f * 40, fl + 6]], 0xff8a3a, 0.7);
    g.fillStyle(0xffd45c, 0.9);
    mpoly(g, [[x - f * 40, fl - 3.4], [x - f * (54 + wob * 0.6), fl], [x - f * 40, fl + 3.4]], 0xffd45c, 0.95);
    // 尾翼（上下）
    g.fillStyle(0xe8404a, 1);
    mpoly(g, [[x - f * 22, fl - 6], [x - f * 42, fl - 18], [x - f * 24, fl + 2]], 0xe8404a);
    mpoly(g, [[x - f * 22, fl + 6], [x - f * 42, fl + 18], [x - f * 24, fl - 2]], 0xd23838);
    // 箭体（弹头形）
    g.fillStyle(c, 1);
    mpoly(g, [
      [x - f * 30, fl - 9], [x + f * 22, fl - 9], [x + f * 40, fl - 2],
      [x + f * 46, fl], [x + f * 40, fl + 2], [x + f * 22, fl + 9], [x - f * 30, fl + 9],
    ], c, 1);
    // 鼻锥
    g.fillStyle(0xe8404a, 1);
    mpoly(g, [[x + f * 36, fl - 4.4], [x + f * 52, fl], [x + f * 36, fl + 4.4]], 0xe8404a);
    // 条环 + 舷窗
    g.fillStyle(0xe8404a, 0.9);
    g.fillRect(x - f * 8 - 2, fl - 9, 4, 18);
    g.fillStyle(0x5ac8ff, 1);
    g.fillCircle(x + f * 10, fl, 8);
    g.fillStyle(0xbfe8ff, 0.9);
    g.fillCircle(x + f * 8, fl - 2.6, 3);
    g.lineStyle(2, 0x9aa7b8, 0.95);
    g.strokeCircle(x + f * 10, fl, 8);
    // 顶部高光
    g.fillStyle(0xffffff, 0.55);
    g.fillEllipse(x + f * 14, fl - 6, 26, 4);
    // 星屑尾迹
    for (let k = 0; k < 4; k++) {
      const ph = (now / 300 + k * 0.27) % 1;
      g.fillStyle(0xffffff, 0.8 * (1 - ph));
      g.fillCircle(x - f * (48 + ph * 26), fl + (k - 1.5) * 5, 1.6 * (1 - ph) + 0.5);
    }
    // 悬浮光晕
    g.fillStyle(a, 0.18);
    g.fillEllipse(x, y + 4, 54, 8);
  } },
  // ── 三角龙：颈盾 + 三角 + 喙 + 背脊褶皱 ──
  juraMount: { c: 0x7ed957, a: 0x5a7a3a, draw: (g, now, x, y, f, c, _a) => {
    const gait = Math.sin(now / 380);
    // 四条粗腿（带脚趾）
    g.lineStyle(10, 0x4a8a3a, 1);
    for (const [dx, ph] of [[-28, 0], [-14, Math.PI], [16, Math.PI], [30, 0]] as Array<[number, number]>) {
      const sw = Math.sin(now / 380 + ph) * 4;
      g.lineBetween(x + dx, y - 24, x + dx + sw, y);
      g.fillStyle(0x3a6a2a, 1);
      g.fillEllipse(x + dx + sw, y + 1, 10, 5);
    }
    // 尾巴（后摆）
    mpoly(g, [[x - f * 36, y - 30], [x - f * 64, y - 22 + gait * 3], [x - f * 38, y - 18]], 0x6ac24a, 0.95);
    // 躯体
    g.fillStyle(c, 1);
    g.fillEllipse(x, y - 28, 86, 38);
    g.fillStyle(0x9fe87a, 0.5);
    g.fillEllipse(x - 4, y - 36, 56, 12); // 背部高光
    // 颈盾（骨色半环 + 边缘结节）
    g.fillStyle(0xf0e8d0, 1);
    g.fillCircle(x + f * 38, y - 48, 20);
    g.fillStyle(c, 1);
    g.fillCircle(x + f * 40, y - 46, 15);
    g.fillStyle(0xf0e8d0, 1);
    for (let k = 0; k < 5; k++) {
      const ang = -Math.PI + k * (Math.PI / 4);
      g.fillCircle(x + f * 38 + Math.cos(ang) * 19, y - 48 + Math.sin(ang) * 19, 2.6);
    }
    // 头 + 喙
    g.fillStyle(c, 1);
    g.fillEllipse(x + f * 50, y - 42, 30, 20);
    g.fillStyle(0xd8c8a0, 0.95);
    g.fillEllipse(x + f * 62, y - 38, 12, 9); // 喙
    // 三只角（米色，带环纹）
    g.fillStyle(0xf0e8d0, 1);
    for (const [hx, hy, hr] of [[44, -64, 4], [54, -66, 4.6], [66, -38, 3.6]] as Array<[number, number, number]>) {
      mpoly(g, [[x + f * hx, y + hy + hr], [x + f * (hx + 5), y + hy - hr * 2.4], [x + f * (hx + 9), y + hy + hr]], 0xf0e8d0, 1);
    }
    // 眼 + 鼻孔
    g.fillStyle(0x1a1a22, 1);
    g.fillCircle(x + f * 52, y - 48, 2.4);
    g.fillStyle(0x2a4a1a, 0.9);
    g.fillCircle(x + f * 62, y - 42, 1.4);
    // 背脊褶皱
    g.lineStyle(2, 0x5a7a3a, 0.6);
    for (let k = 0; k < 3; k++) g.lineBetween(x - 24 + k * 14, y - 42, x - 18 + k * 14, y - 20);
  } },
  // ── 蘑菇虫：分节爬虫 + 大菌盖（斑点 + 菌褶）+ 触角 ──
  mushMount: { c: 0xd95a4a, a: 0xf0e0c0, draw: (g, now, x, y, _f, c, a) => {
    // 分节身体（三节，波浪爬行）
    for (let k = 0; k < 3; k++) {
      const cx = x - 22 + k * 20;
      const cy = y - 10 + Math.sin(now / 300 + k * 1.2) * 2;
      g.fillStyle(k % 2 ? 0xc94a3a : c, 1);
      g.fillEllipse(cx, cy, 26, 18);
      g.fillStyle(0xf0e0c0, 0.35);
      g.fillEllipse(cx, cy + 4, 18, 7);
    }
    // 小脚（每节两对，交替）
    g.fillStyle(0x8a3a2a, 1);
    for (let k = 0; k < 3; k++) {
      const cx = x - 22 + k * 20;
      for (const s of [-1, 1]) {
        const lw = Math.sin(now / 300 + k * 1.2 + (s > 0 ? 0 : 1.4)) * 1.5;
        g.fillEllipse(cx + s * 6 + lw, y - 1, 4.6, 4);
      }
    }
    // 菌柄
    g.fillStyle(a, 1);
    g.fillRoundedRect(x - 7, y - 34, 14, 20, 6);
    // 大菌盖（半圆 + 斑点 + 菌褶线）
    g.fillStyle(c, 1);
    g.beginPath(); g.arc(x, y - 34, 34, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(0xb03a2a, 0.5);
    g.beginPath(); g.arc(x, y - 32, 34, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(c, 1);
    g.beginPath(); g.arc(x, y - 34, 34, Math.PI + 0.3, TAU - 0.3); g.closePath(); g.fillPath();
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(x - 14, y - 44, 5);
    g.fillCircle(x + 6, y - 52, 6.4);
    g.fillCircle(x + 22, y - 42, 4.4);
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(x - 2, y - 38, 2.6);
    g.lineStyle(1.2, 0xb03a2a, 0.7);
    for (let k = 0; k < 4; k++) g.lineBetween(x - 26 + k * 17, y - 33, x - 26 + k * 17, y - 30);
    // 菌盖下眼睛（在柄两侧）
    g.fillStyle(0x1a1a22, 0.95);
    g.fillCircle(x - 4, y - 26, 2.4);
    g.fillCircle(x + 8, y - 26, 2.4);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(x - 4.8, y - 26.8, 0.8);
    g.fillCircle(x + 7.2, y - 26.8, 0.8);
    // 孢子（从盖缘飘落）
    for (let k = 0; k < 3; k++) {
      const ph = (now / 900 + k / 3) % 1;
      g.fillStyle(0xf0e0c0, 0.7 * (1 - ph));
      g.fillCircle(x + 30 - ph * 10 + Math.sin(ph * 8) * 4, y - 40 + ph * 26, 1.6);
    }
  } },
  // ── 大海龟：六角龟甲 + 划水鳍肢 + 水泡 ──
  tropicMount: { c: 0x4aa88a, a: 0x8a6a4a, draw: (g, now, x, y, f, c, _a) => {
    // 鳍肢（前后各一，划水）
    g.fillStyle(0x3a8872, 1);
    for (const [dx, ph] of [[-22, 0], [18, Math.PI]] as Array<[number, number]>) {
      const sw = Math.sin(now / 500 + ph) * 5;
      g.save();
      g.translateCanvas(x + dx, y - 6);
      g.rotateCanvas(sw * 0.04);
      g.fillEllipse(0, 0, 16, 24);
      g.restore();
    }
    // 头（伸向前方，缓慢摆动）
    const hw = Math.sin(now / 700) * 2;
    g.fillStyle(0x3a8872, 1);
    g.fillEllipse(x + f * 42, y - 12 + hw, 24, 15);
    g.fillStyle(0x1a1a22, 1);
    g.fillCircle(x + f * 48, y - 15 + hw, 2.2);
    g.lineStyle(1.4, 0x2a6a5a, 0.9);
    g.lineBetween(x + f * 50, y - 9 + hw, x + f * 54, y - 10 + hw); // 嘴缝
    // 龟壳（主椭圆 + 中央六角盾片 + 边缘盾片）
    g.fillStyle(c, 1);
    g.fillEllipse(x, y - 22, 80, 36);
    g.fillStyle(0x3a8872, 0.95);
    for (let k = 0; k < 3; k++) {
      const hx = x - 20 + k * 20;
      const vs = [];
      for (let p = 0; p < 6; p++) {
        const ang = (p / 6) * TAU + Math.PI / 6;
        vs.push({ x: hx + Math.cos(ang) * 9, y: y - 22 + Math.sin(ang) * 12 });
      }
      g.fillPoints(vs as never, true);
    }
    g.fillStyle(0x2a6a58, 0.8);
    for (let k = 0; k < 6; k++) {
      g.fillCircle(x - 34 + k * 14, y - 22 + (k % 2 ? 13 : -13), 3.4);
    }
    // 壳面高光 + 水珠
    g.fillStyle(0xffffff, 0.28);
    g.fillEllipse(x - 12, y - 34, 34, 7);
    for (let k = 0; k < 3; k++) {
      const ph = (now / 800 + k / 3) % 1;
      g.fillStyle(0xbfe8ff, 0.7 * (1 - ph));
      g.fillCircle(x + f * 30 + ph * 8, y - 30 - ph * 12, 1.8);
    }
  } },
  // ── 石像鬼：蹲伏石兽 + 折叠石翼 + 裂纹青苔 + 火眼 ──
  cryptMount: { c: 0xd8c8a0, a: 0x6a4a9a, draw: (g, now, x, y, f, _c, a) => {
    // 底座石台
    g.fillStyle(0x2a2a32, 0.95);
    g.fillEllipse(x, y, 66, 10);
    g.fillStyle(0x6a6a74, 1);
    g.fillRoundedRect(x - 26, y - 8, 52, 8, 3);
    // 折叠石翼（两层羽列，石灰色）
    for (let k = 0; k < 4; k++) {
      feather(g, x - f * 14, y - 34, Math.PI - f * 0.5 + f * k * 0.16, 40 - k * 5, 7, k % 2 ? 0x7a7a86 : 0x8a8a94, 0.95);
    }
    // 蹲伏躯体（前倾）
    g.fillStyle(0x8a8a94, 1);
    g.fillEllipse(x - 2, y - 24, 58, 30);
    g.fillStyle(0x7a7a86, 0.8);
    g.fillEllipse(x + 4, y - 18, 44, 14); // 腹部阴影
    // 前爪搭在台边
    g.fillStyle(0x8a8a94, 1);
    g.fillRoundedRect(x + f * 16 - 5, y - 16, 12, 10, 4);
    g.fillRoundedRect(x + f * 28 - 5, y - 14, 12, 9, 4);
    // 头（狰狞）+ 双角 + 颌
    g.fillStyle(0x8a8a94, 1);
    g.fillCircle(x + f * 28, y - 38, 14);
    g.fillStyle(0x6a6a74, 0.9);
    g.fillEllipse(x + f * 36, y - 32, 12, 7); // 吻
    mpoly(g, [[x + f * 20, y - 48], [x + f * 14, y - 62], [x + f * 26, y - 50]], 0xa8a8b4, 1);
    mpoly(g, [[x + f * 32, y - 50], [x + f * 36, y - 64], [x + f * 42, y - 48]], 0xa8a8b4, 1);
    // 獠牙
    g.fillStyle(0xf0e8d0, 0.9);
    mpoly(g, [[x + f * 34, y - 29], [x + f * 36, y - 24], [x + f * 38, y - 29]], 0xf0e8d0, 0.9);
    // 石裂纹
    g.lineStyle(1.2, 0x5a5a64, 0.8);
    g.lineBetween(x - 14, y - 36, x - 8, y - 28);
    g.lineBetween(x - 8, y - 28, x - 12, y - 20);
    // 青苔斑
    g.fillStyle(0x4a7a4a, 0.55);
    g.fillCircle(x - 20, y - 16, 4.4);
    g.fillCircle(x + 10, y - 34, 3);
    // 双眼燃紫火
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(a, gl);
    g.fillCircle(x + f * 24, y - 40, 2.6);
    g.fillCircle(x + f * 33, y - 40, 2.6);
    g.fillStyle(a, gl * 0.4);
    g.fillCircle(x + f * 24, y - 40, 5);
    g.fillCircle(x + f * 33, y - 40, 5);
  } },
  // ── 圣诞雪橇：红金橇身 + 礼物堆 + 铃铛 + 雪痕 ──
  festivMount: { c: 0xe84a5a, a: 0xffd45c, draw: (g, now, x, y, _f, c, a) => {
    // 雪痕
    g.fillStyle(0xd8ecf8, 0.8);
    g.fillEllipse(x, y + 6, 96, 8);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(x - 30, y + 4, 3);
    g.fillCircle(x + 26, y + 5, 2.6);
    // 滑刃（前缘卷曲）
    g.lineStyle(4.4, a, 1);
    g.beginPath();
    g.moveTo(x - 44, y + 2);
    g.lineTo(x + 44, y + 2);
    g.lineTo(x + 52, y - 8);
    g.strokePath();
    g.beginPath(); g.arc(x + 52, y - 8, 4.5, -0.6, Math.PI * 0.9); g.strokePath();
    // 支柱
    g.lineStyle(3.4, a, 0.95);
    for (const dx of [-34, -10, 14, 34]) g.lineBetween(x + dx, y + 2, x + dx, y - 10);
    // 橇身（红，翘头，金镶边）
    g.fillStyle(c, 1);
    mpoly(g, [[-42, y - 10], [36, y - 10], [44, y - 34], [50, y - 30], [42, y - 4], [-42, y - 4]], c, 1);
    g.fillStyle(0xc23848, 0.6);
    g.fillRect(x - 42, y - 10, 84, 3);
    g.lineStyle(2, a, 0.95);
    g.lineBetween(x - 42, y - 12, x + 40, y - 12);
    g.lineBetween(x - 42, y - 4, x + 42, y - 4);
    // 缠绕金丝带
    g.lineStyle(1.6, a, 0.8);
    g.lineBetween(x - 30, y - 26, x + 30, y - 14);
    g.lineBetween(x + 30, y - 26, x - 30, y - 14);
    // 礼物堆（三盒，丝带十字）
    const gifts: Array<[number, number, number, number]> = [
      [x - 18, y - 26, 16, 12, ], [x + 2, y - 30, 14, 14], [x + 18, y - 24, 12, 10],
    ] as never;
    for (const [gx, gy, gw, gh] of gifts) {
      g.fillStyle(0x3aa05a, 1);
      g.fillRoundedRect(gx - gw / 2, gy - gh / 2, gw, gh, 2);
      g.fillStyle(0xffd45c, 1);
      g.fillRect(gx - 1.4, gy - gh / 2, 2.8, gh);
      g.fillRect(gx - gw / 2, gy - 1.4, gw, 2.8);
    }
    // 礼物顶蝴蝶结
    g.fillStyle(0xffd45c, 1);
    g.fillCircle(x + 2, y - 38, 2.6);
    // 铃铛（挂橇头，晃动）
    const bell = Math.sin(now / 350) * 2;
    g.fillStyle(0xffd45c, 1);
    g.fillCircle(x + 44, y - 36 + bell, 3.2);
    g.fillStyle(0x8a6a1a, 1);
    g.fillRect(x + 43, y - 33 + bell, 2, 2);
    // 雪花飘落
    for (let k = 0; k < 3; k++) {
      const ph = (now / 1100 + k / 3) % 1;
      g.fillStyle(0xffffff, 0.85 * (1 - ph));
      g.fillCircle(x - 20 + k * 20, y - 44 + ph * 20, 1.6);
    }
  } },
  // ── 寿司船：木舟 + 大号握寿司 + 山葵姜片 + 筷架 ──
  sushiMount: { c: 0xf5f0e0, a: 0x2a3a2a, draw: (g, now, x, y, f, c, a) => {
    const rock = Math.sin(now / 600) * 2;
    // 水痕
    g.fillStyle(0x4a7a9a, 0.35);
    g.fillEllipse(x, y + 7, 102, 9);
    g.save();
    g.translateCanvas(x, y - 8 + rock);
    g.rotateCanvas(Math.sin(now / 600) * 0.025);
    // 木舟（寿司台形状）+ 板纹
    mpoly(g, [[-46, -4], [46, -4], [34, 10], [-34, 10]], 0x6a4a2a);
    g.lineStyle(1.4, 0x4a3218, 0.9);
    g.lineBetween(-46, -4, 46, -4);
    for (let k = 0; k < 5; k++) g.lineBetween(-36 + k * 18, -4, -32 + k * 18, 10);
    // 饭团（白色，带米粒纹）
    g.fillStyle(c, 1);
    g.fillRoundedRect(-26, -26, 52, 20, 8);
    g.fillStyle(0xd8d0c0, 0.5);
    g.fillRoundedRect(-26, -12, 52, 6, 3);
    g.fillStyle(0xffffff, 0.9);
    for (let k = 0; k < 6; k++) g.fillCircle(-18 + (k % 3) * 14, -22 + Math.floor(k / 3) * 8, 1.1);
    // 三文鱼（橙红 + 白色油花纹）
    g.fillStyle(0xff8a5a, 1);
    g.fillRoundedRect(-27, -38, 54, 13, 6);
    g.lineStyle(1.4, 0xffffff, 0.75);
    for (let k = 0; k < 4; k++) {
      g.lineBetween(-20 + k * 12, -37, -14 + k * 12, -26);
    }
    // 海苔束腰
    g.fillStyle(a, 0.96);
    g.fillRect(-6, -26, 12, 16);
    g.lineStyle(1, 0x1a2a1a, 0.6);
    g.lineBetween(-6, -18, 6, -18);
    // 山葵 + 姜片（船头装饰）
    g.fillStyle(0x7ac85a, 1);
    g.fillEllipse(-f * 36, -8, 9, 6);
    g.fillStyle(0xffb0b0, 0.95);
    g.fillEllipse(-f * 36, -14, 8, 5);
    g.lineStyle(1, 0xff8a8a, 0.8);
    g.lineBetween(-f * 39, -14, -f * 33, -14);
    // 酱油碟（船尾）
    g.fillStyle(0xe8e2d0, 1);
    g.fillEllipse(f * 38, -6, 11, 6);
    g.fillStyle(0x4a2a1a, 0.9);
    g.fillEllipse(f * 38, -7, 7, 3.4);
    g.restore();
  } },
  // ── 牧场马：棕马 + 飘鬃马尾 + 皮鞍缰绳 + 白星额 ──
  wildMount: { c: 0x8a5a2a, a: 0xd9c08a, draw: (g, now, x, y, f, c, _a) => {
    // 四腿（奔跑步态）
    g.lineStyle(7, 0x6a4a2a, 1);
    for (const [dx, ph] of [[-26, 0], [-14, Math.PI], [14, Math.PI * 0.8], [28, Math.PI * 0.2]] as Array<[number, number]>) {
      const sw = Math.sin(now / 220 + ph) * 6;
      g.lineBetween(x + dx, y - 24, x + dx + sw, y + 2);
      g.fillStyle(0x3a2a1a, 1);
      g.fillCircle(x + dx + sw, y + 1, 3);
    }
    // 躯干 + 腹部阴影
    g.fillStyle(c, 1);
    g.fillEllipse(x, y - 24, 82, 36);
    g.fillStyle(0x6a4218, 0.45);
    g.fillEllipse(x - 4, y - 12, 60, 12);
    // 脖子 + 头
    g.fillStyle(c, 1);
    g.fillRoundedRect(x + f * 30 - 8, y - 50, 16, 32, 7);
    g.fillEllipse(x + f * 42, y - 54, 28, 17);
    g.fillStyle(0x6a4218, 0.7);
    g.fillEllipse(x + f * 50, y - 50, 10, 8); // 吻
    // 白星额（一道白斑）
    g.fillStyle(0xf0ead8, 0.9);
    g.fillEllipse(x + f * 44, y - 57, 4, 7);
    // 眼
    g.fillStyle(0x1a1a22, 1);
    g.fillCircle(x + f * 46, y - 57, 2.4);
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(x + f * 45.2, y - 57.8, 0.8);
    // 鬃毛（羽列，随风飘）
    for (let k = 0; k < 5; k++) {
      feather(g, x + f * (26 - k * 6), y - 52 + k * 3,
        f === 1 ? -2.2 + k * 0.1 : -0.94 - k * 0.1, 16 - k, 4.5, k % 2 ? 0x3a2a1a : 0x5a3a1a, 0.95);
    }
    // 流动的尾
    for (let k = 0; k < 4; k++) {
      feather(g, x - f * 38, y - 32, Math.PI - f * 0.4 + f * k * 0.14 + Math.sin(now / 300 + k) * 0.06,
        26 - k * 3, 5, 0x3a2a1a, 0.92);
    }
    // 皮鞍 + 鞍垫
    g.fillStyle(0xa8324a, 0.9);
    g.fillRoundedRect(x - 14, y - 38, 28, 10, 3);
    g.fillStyle(0x6a4218, 1);
    g.fillRoundedRect(x - 10, y - 42, 20, 8, 3);
    g.fillStyle(0xffd45c, 0.8);
    g.fillCircle(x - 6, y - 38, 1.4);
    g.fillCircle(x + 6, y - 38, 1.4);
    // 缰绳（从鞍到辔）
    g.lineStyle(1.6, 0x4a3218, 0.9);
    g.lineBetween(x + f * 10, y - 38, x + f * 36, y - 46);
    g.lineBetween(x + f * 36, y - 46, x + f * 44, y - 50);
  } },
};
