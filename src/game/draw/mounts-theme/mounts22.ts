import { type G, type MountArt } from './shared';

/**
 * 第九批坐骑（恐龙 / 史前 / 神话 / 恶搞 10 主题）——**逐款精绘**，不套模板。
 *
 * 朝向约定：painter 在**本地坐标**里画，`(0,0)` = 脚下地面基准，**+x = 前进方向（朝右）**；
 * 通过 `scaleCanvas(f,1)` 镜像，所以 f=1 时坐骑一律**朝右**、f=-1 时朝左。
 * 兽形 / 载具都遵循同一朝向。
 */

/** 进入「本地朝右、以 (x,y) 为脚下点」的坐标系；f<0 时整体水平镜像 */
function faces(g: G, x: number, y: number, f: 1 | -1, fn: () => void): void {
  g.save();
  g.translateCanvas(x, y);
  if (f < 0) g.scaleCanvas(-1, 1);
  fn();
  g.restore();
}

/** 一条腿（圆角梯形，带脚掌） */
function leg(g: G, lx: number, top: number, bottom: number, w: number, c: number, hoof?: number): void {
  g.fillStyle(c, 1);
  g.fillRoundedRect(lx - w / 2, top, w, bottom - top, w * 0.4);
  if (hoof !== undefined) { g.fillStyle(hoof, 1); g.fillRoundedRect(lx - w / 2 - 0.6, bottom - 4, w + 1.2, 5, 2); }
}

export const MOUNTS_22: Record<string, MountArt> = {
  // ══ 白垩纪猎场 ══════════════════════════════════════════
  cretTrike: {
    c: 0x6f9a44, a: 0xe8d07a,
    draw: (g, now, x, y, f, _c, a) => {
      const body = 0x6f9a44, dark = 0x4e6f2e, belly = 0x9dbe66, horn = 0xefe7d2, beak = 0x3a4a22;
      const tip = Math.sin(now / 300) * 6;
      g.fillStyle(0x000000, 0.16); g.fillEllipse(x, y + 5, 168, 15);
      faces(g, x, y, f, () => {
        // 尾巴：向后甩、逐渐收细
        g.fillStyle(dark, 1);
        g.fillPoints([{ x: -26, y: -30 }, { x: -60, y: -22 + tip * 0.4 }, { x: -84, y: -12 + tip }, { x: -82, y: -6 + tip }, { x: -56, y: -14 + tip * 0.4 }, { x: -24, y: -18 }] as never, true);
        g.fillStyle(body, 1);
        g.fillPoints([{ x: -26, y: -30 }, { x: -58, y: -24 + tip * 0.4 }, { x: -80, y: -15 + tip }, { x: -78, y: -10 + tip }, { x: -54, y: -17 + tip * 0.4 }, { x: -24, y: -21 }] as never, true);
        // 远侧两条腿
        leg(g, -22, -22, 2, 9, dark); leg(g, -8, -22, 2, 9, dark);
        // 躯干（后臀 + 前胸）
        g.fillStyle(dark, 1); g.fillEllipse(-16, -24, 62, 44);
        g.fillStyle(body, 1); g.fillEllipse(-16, -25, 58, 40);
        g.fillStyle(dark, 1); g.fillEllipse(16, -26, 54, 42);
        g.fillStyle(body, 1); g.fillEllipse(16, -27, 50, 38);
        // 肚皮高光
        g.fillStyle(belly, 1); g.fillEllipse(2, -12, 82, 16);
        // 背脊
        g.fillStyle(dark, 0.5); g.fillEllipse(-2, -40, 74, 8);
        // 颈盾（大扇形，扇缘锯齿）
        for (let k = 0; k < 9; k++) { const ang = -1.5 + k * 0.38; g.fillStyle(k % 2 ? a : 0xd8b84a, 1); g.fillCircle(30 + Math.cos(ang) * 20, -46 + Math.sin(ang) * 20, 6); }
        g.fillStyle(a, 1); g.fillEllipse(30, -46, 40, 40);
        g.fillStyle(0xc8a838, 1); g.fillEllipse(30, -46, 32, 32);
        // 头骨 + 喙
        g.fillStyle(dark, 1); g.fillEllipse(52, -44, 40, 30);
        g.fillStyle(body, 1); g.fillEllipse(52, -45, 36, 26);
        g.fillStyle(beak, 1); g.fillPoints([{ x: 66, y: -50 }, { x: 80, y: -45 }, { x: 72, y: -40 }, { x: 66, y: -42 }] as never, true);
        // 三只角
        g.fillStyle(horn, 1);
        g.fillPoints([{ x: 58, y: -52 }, { x: 74, y: -47 }, { x: 60, y: -45 }] as never, true); // 鼻角
        g.fillPoints([{ x: 44, y: -54 }, { x: 48, y: -74 }, { x: 56, y: -56 }] as never, true); // 眉角1
        g.fillPoints([{ x: 52, y: -56 }, { x: 58, y: -74 }, { x: 62, y: -55 }] as never, true); // 眉角2
        // 眼
        g.fillStyle(0x1a1208, 1); g.fillCircle(56, -50, 2.6); g.fillStyle(0xffffff, 0.8); g.fillCircle(56.8, -50.8, 0.9);
      });
    },
    front: (g, now, x, y, f, _c, _a) => {
      const body = 0x6f9a44, dark = 0x4e6f2e; const st = Math.sin(now / 220) * 3;
      faces(g, x, y, f, () => {
        leg(g, -14, -22, 2 + st, 10, body, 0x3a4a22);
        leg(g, 6, -22, 2 - st, 10, body, 0x3a4a22);
        g.fillStyle(dark, 0.35); g.fillEllipse(0, -12, 70, 10);
      });
    },
  },
  // ══ 史前沼泽 ══════════════════════════════════════════
  swampDeino: {
    c: 0x3f7a4a, a: 0x7dff9a,
    draw: (g, now, x, y, f, _c, _a) => {
      const body = 0x3f7a4a, dark = 0x2a5a36, belly = 0x8fc06a, teeth = 0xf0ece0;
      const tip = Math.sin(now / 380) * 14, st = Math.sin(now / 260) * 2;
      g.fillStyle(0x000000, 0.18); g.fillEllipse(x, y + 5, 182, 14);
      faces(g, x, y, f, () => {
        // 长尾（扁、带背脊）
        g.fillStyle(dark, 1);
        g.fillPoints([{ x: -30, y: -22 }, { x: -70, y: -16 + tip * 0.5 }, { x: -104, y: -4 + tip }, { x: -100, y: 2 + tip }, { x: -66, y: -6 + tip * 0.5 }, { x: -28, y: -12 }] as never, true);
        g.fillStyle(body, 1);
        g.fillPoints([{ x: -30, y: -24 }, { x: -68, y: -19 + tip * 0.5 }, { x: -100, y: -8 + tip }, { x: -96, y: -3 + tip }, { x: -64, y: -10 + tip * 0.5 }, { x: -28, y: -15 }] as never, true);
        // 腿上（细）
        leg(g, -24, -18, 0, 7, dark); leg(g, -6, -18, 0, 7, dark);
        // 低矮躯干
        g.fillStyle(dark, 1); g.fillEllipse(-10, -15, 90, 30);
        g.fillStyle(body, 1); g.fillEllipse(-10, -16, 84, 26);
        g.fillStyle(belly, 0.9); g.fillEllipse(-6, -7, 80, 12);
        // 背甲棘
        for (let k = 0; k < 6; k++) { g.fillStyle(dark, 1); g.fillTriangle(-44 + k * 15, -22, -38 + k * 15, -22, -41 + k * 15, -34); }
        // 长吻（上下颌）
        g.fillStyle(dark, 1); g.fillPoints([{ x: 30, y: -22 }, { x: 72, y: -16 }, { x: 72, y: -8 }, { x: 30, y: -10 }] as never, true);
        g.fillStyle(body, 1); g.fillPoints([{ x: 30, y: -23 }, { x: 70, y: -18 }, { x: 70, y: -13 }, { x: 30, y: -14 }] as never, true);
        g.fillStyle(body, 1); g.fillPoints([{ x: 30, y: -8 }, { x: 74, y: -6 }, { x: 74, y: 0 }, { x: 30, y: -1 }] as never, true);
        g.fillStyle(teeth, 1); for (let k = 0; k < 5; k++) { const tx = 40 + k * 7; g.fillTriangle(tx, -6, tx + 3.4, -6, tx + 1.7, -2); g.fillTriangle(tx, -14, tx + 3.4, -14, tx + 1.7, -18); }
        // 头 + 眼
        g.fillStyle(dark, 1); g.fillEllipse(30, -18, 40, 32);
        g.fillStyle(body, 1); g.fillEllipse(30, -19, 36, 28);
        g.fillStyle(0xffd45c, 1); g.fillEllipse(34, -26, 8, 9); g.fillStyle(0x1a1208, 1); g.fillEllipse(34, -26, 2.4, 7);
        g.fillStyle(dark, 0.5); g.fillCircle(22, -22, 2); g.fillCircle(16, -16, 2);
        void st;
      });
    },
    front: (g, now, x, y, f, _c, _a) => {
      const body = 0x3f7a4a; const st = Math.sin(now / 260) * 2;
      faces(g, x, y, f, () => {
        leg(g, -14, -18, 0 + st, 8, body); leg(g, 8, -18, -st, 8, body);
        g.fillStyle(body, 1); g.fillEllipse(-6, -5, 78, 9);
      });
    },
  },
  swampSerpent: {
    c: 0x2f6a3a, a: 0x7dff9a,
    draw: (g, now, x, y, f, _c, _a) => {
      const body = 0x2f6a3a, dark = 0x1f4a28, belly = 0x9fd06a, tongue = 0xff5a5a;
      g.fillStyle(0x000000, 0.18); g.fillEllipse(x, y + 5, 150, 16);
      faces(g, x, y, f, () => {
        // 盘绕的蛇身：一串由大到小的椭圆，相位错开蠕动
        const coils: Array<[number, number, number, number]> = [[-34, -6, 34, 18], [-8, -8, 36, 20], [16, -10, 32, 18], [36, -14, 26, 15], [50, -22, 20, 13]];
        for (let k = coils.length - 1; k >= 0; k--) {
          const [cx, cy, rx, ry] = coils[k]; const wob = Math.sin(now / 320 + k * 0.9) * 2;
          g.fillStyle(k % 2 ? dark : body, 1); g.fillEllipse(cx, cy + wob, rx, ry);
          g.fillStyle(body, 0.9); g.fillEllipse(cx, cy - 1 + wob, rx - 4, ry - 4);
          g.fillStyle(belly, 0.5); g.fillEllipse(cx, cy - 2 + wob, rx - 8, ry - 7);
        }
        // 抬头 + 头
        g.fillStyle(body, 1); g.fillEllipse(58, -38, 26, 28);
        g.fillStyle(body, 1); g.fillEllipse(62, -46, 30, 22);
        g.fillStyle(dark, 0.4); g.fillEllipse(58, -34, 22, 20);
        // 分叉信子
        const flick = Math.sin(now / 140) * 3;
        g.lineStyle(2, tongue, 1); g.beginPath(); g.moveTo(74, -44); g.lineTo(88, -44 + flick * 0.3); g.strokePath();
        g.lineBetween(88, -44 + flick * 0.3, 94, -47 + flick); g.lineBetween(88, -44 + flick * 0.3, 94, -41 + flick);
        // 眼
        g.fillStyle(0xffd45c, 1); g.fillCircle(66, -50, 2.8); g.fillStyle(0x1a1208, 1); g.fillEllipse(66, -50, 1.2, 2.6);
      });
    },
  },
  // ══ 冰河世纪 ══════════════════════════════════════════
  iceageMammoth: {
    c: 0x8a6a4a, a: 0xd8c8b0,
    draw: (g, now, x, y, f, _c, _a) => {
      const fur = 0x8a6a4a, dark = 0x5f4630, under = 0xb8977a, ivory = 0xf2ead6;
      const st = Math.sin(now / 300) * 2, trunk = Math.sin(now / 400) * 5;
      g.fillStyle(0x000000, 0.18); g.fillEllipse(x, y + 5, 186, 16);
      faces(g, x, y, f, () => {
        // 远侧腿
        leg(g, -30, -18, 2, 13, dark, 0x3a2a1a); leg(g, -6, -18, 2, 13, dark, 0x3a2a1a);
        // 圆厚躯干
        g.fillStyle(dark, 1); g.fillEllipse(-8, -26, 108, 60);
        g.fillStyle(fur, 1); g.fillEllipse(-8, -28, 102, 55);
        // 长毛（底缘一排鬃毛）
        for (let k = 0; k < 12; k++) { const bx = -54 + k * 9.5; const len = 12 + (k % 3) * 4; g.fillStyle(dark, 0.85); g.fillPoints([{ x: bx - 3, y: -6 }, { x: bx + 3, y: -6 }, { x: bx + Math.sin(now / 500 + k) * 1.5, y: -6 + len }] as never, true); }
        g.fillStyle(under, 0.9); g.fillEllipse(-6, -12, 84, 16);
        // 背脊长毛
        for (let k = 0; k < 6; k++) { g.fillStyle(0x4a3626, 0.7); g.fillPoints([{ x: -40 + k * 15, y: -50 }, { x: -34 + k * 15, y: -50 }, { x: -37 + k * 15, y: -58 }] as never, true); }
        // 头 + 大耳
        g.fillStyle(dark, 1); g.fillEllipse(40, -40, 46, 40);
        g.fillStyle(fur, 1); g.fillEllipse(40, -42, 42, 36);
        g.fillStyle(dark, 1); g.fillEllipse(20, -44, 18, 26); // 耳
        g.fillStyle(under, 0.6); g.fillEllipse(22, -44, 10, 16);
        // 象鼻（软管，向下甩）
        g.lineStyle(9, fur, 1); g.beginPath(); g.moveTo(58, -34); g.lineTo(70, -26); g.lineTo(72, -12 + trunk); g.lineTo(66, -2 + trunk); g.strokePath();
        g.lineStyle(5, under, 0.6); g.beginPath(); g.moveTo(60, -36); g.lineTo(70, -28); g.lineTo(71, -14 + trunk); g.strokePath();
        // 象牙
        g.fillStyle(ivory, 1);
        g.fillPoints([{ x: 56, y: -30 }, { x: 84, y: -18 }, { x: 80, y: -10 }, { x: 52, y: -22 }] as never, true);
        // 眼
        g.fillStyle(0x1a1208, 1); g.fillCircle(48, -48, 3); g.fillStyle(0xffffff, 0.8); g.fillCircle(48.8, -48.8, 1);
        void st;
      });
    },
    front: (g, now, x, y, f, _c, _a) => {
      const fur = 0x8a6a4a, dark = 0x5f4630; const st = Math.sin(now / 300) * 2;
      faces(g, x, y, f, () => {
        leg(g, -16, -18, 2 + st, 14, fur, 0x3a2a1a); leg(g, 6, -18, 2 - st, 14, fur, 0x3a2a1a);
        // 近侧长毛
        for (let k = 0; k < 9; k++) { g.fillStyle(dark, 0.85); const bx = -40 + k * 10; g.fillPoints([{ x: bx - 3, y: -10 }, { x: bx + 3, y: -10 }, { x: bx, y: -10 + 13 }] as never, true); }
      });
    },
  },
  // ══ 非洲雷神 ══════════════════════════════════════════
  yorPanther: {
    c: 0x2a2a34, a: 0xffe08a,
    draw: (g, now, x, y, f, _c, a) => {
      const body = 0x2a2a34, dark = 0x14141c, hi = 0x3f3f4e, eye = 0xffd45c;
      const tail = Math.sin(now / 300) * 10;
      g.fillStyle(0x000000, 0.2); g.fillEllipse(x, y + 5, 160, 14);
      faces(g, x, y, f, () => {
        // 长尾（上翘）
        g.lineStyle(6, dark, 1); g.beginPath(); g.moveTo(-40, -28); g.lineTo(-64, -34 + tail * 0.4); g.lineTo(-78, -44 + tail); g.strokePath();
        g.fillStyle(a, 0.9); g.fillCircle(-78, -44 + tail, 3);
        // 远侧腿
        leg(g, -22, -18, 1, 7, dark); leg(g, 8, -18, 1, 7, dark);
        // 流线躯干
        g.fillStyle(dark, 1); g.fillEllipse(-8, -24, 104, 38);
        g.fillStyle(body, 1); g.fillEllipse(-8, -25, 98, 34);
        g.fillStyle(hi, 0.5); g.fillEllipse(-4, -36, 84, 10);
        // 爬动的雷纹
        const trot = (now / 200) % 1;
        for (let k = 0; k < 4; k++) { const off = ((k / 4 + trot) % 1); const bx = -42 + off * 80; g.lineStyle(1.8, a, 0.5 + 0.4 * Math.sin(off * 6.28)); g.lineBetween(bx, -40, bx + 5, -30); g.lineBetween(bx + 5, -30, bx + 1, -22); }
        // 头（楔形）+ 耳
        g.fillStyle(dark, 1); g.fillEllipse(44, -40, 42, 34);
        g.fillStyle(body, 1); g.fillEllipse(44, -41, 38, 30);
        g.fillStyle(dark, 1); g.fillTriangle(34, -54, 40, -58, 44, -50); g.fillTriangle(46, -54, 52, -58, 56, -50);
        g.fillStyle(0x1a1a22, 1); g.fillEllipse(34, -36, 16, 12); // 吻
        g.fillStyle(eye, 1); g.fillEllipse(48, -44, 8, 8); g.fillStyle(0x1a1208, 1); g.fillEllipse(48, -44, 2.2, 6.4);
        g.fillStyle(0x1a1208, 1); g.fillEllipse(28, -33, 5, 3);
      });
    },
    front: (g, now, x, y, f, _c, _a) => {
      const body = 0x2a2a34, dark = 0x14141c; const st = Math.sin(now / 230) * 2.4;
      faces(g, x, y, f, () => {
        leg(g, -14, -18, 1 + st, 8, body); leg(g, 14, -18, 1 - st, 8, body);
        g.fillStyle(dark, 0.4); g.fillEllipse(-2, -12, 80, 8);
      });
    },
  },
  // ══ 芬兰史诗 ══════════════════════════════════════════
  kalBear: {
    c: 0x4a3828, a: 0x9fe8d0,
    draw: (g, now, x, y, f, _c, a) => {
      const fur = 0x4a3828, dark = 0x30241a, snout = 0xc8a878;
      g.fillStyle(0x000000, 0.2); g.fillEllipse(x, y + 5, 176, 16);
      faces(g, x, y, f, () => {
        // 远侧腿
        leg(g, -26, -16, 2, 12, dark, 0x241a12); leg(g, 0, -16, 2, 12, dark, 0x241a12);
        // 厚实躯干
        g.fillStyle(dark, 1); g.fillEllipse(-6, -26, 104, 52);
        g.fillStyle(fur, 1); g.fillEllipse(-6, -28, 98, 47);
        // 腹 + 胸口浅色
        g.fillStyle(0x6a5038, 1); g.fillEllipse(-4, -14, 76, 20);
        g.fillStyle(0x6a5038, 0.8); g.fillEllipse(30, -28, 26, 34);
        // 蓬松毛边
        for (let k = 0; k < 10; k++) { const bx = -50 + k * 10; g.fillStyle(dark, 0.7); g.fillCircle(bx, -6 + Math.sin(k) * 2, 5); }
        // 头 + 圆耳 + 口鼻
        g.fillStyle(dark, 1); g.fillEllipse(44, -42, 44, 40);
        g.fillStyle(fur, 1); g.fillEllipse(44, -44, 40, 36);
        g.fillStyle(dark, 1); g.fillCircle(34, -60, 9); g.fillCircle(54, -60, 9);
        g.fillStyle(0x2a1e14, 1); g.fillCircle(34, -60, 4); g.fillCircle(54, -60, 4);
        g.fillStyle(snout, 1); g.fillEllipse(58, -36, 20, 16);
        g.fillStyle(0x1a1208, 1); g.fillEllipse(66, -36, 4, 3);
        g.fillStyle(0x1a1208, 1); g.fillCircle(44, -46, 3); g.fillCircle(52, -46, 3);
        // 森林光点
        for (let k = 0; k < 2; k++) { g.fillStyle(a, 0.4 * (1 - k / 2)); g.fillCircle(-20 + Math.sin(now / 700 + k) * 24, -54 - k * 6, 2.4); }
      });
    },
    front: (g, now, x, y, f, _c, _a) => {
      const fur = 0x4a3828, dark = 0x30241a; const st = Math.sin(now / 300) * 2.4;
      faces(g, x, y, f, () => {
        leg(g, -16, -16, 2 + st, 13, fur, 0x241a12); leg(g, 12, -16, 2 - st, 13, fur, 0x241a12);
        g.fillStyle(dark, 0.35); g.fillEllipse(-2, -10, 70, 8);
      });
    },
  },
  // ══ 香蕉王国 ══════════════════════════════════════════
  banBoat: {
    c: 0xf0d020, a: 0x8a8a1a,
    draw: (g, now, x, y, _f, c, a) => {
      const bob = Math.sin(now / 420) * 3;
      g.fillStyle(0x000000, 0.16); g.fillEllipse(x, y + 6, 176, 16);
      g.save(); g.translateCanvas(x, y + bob);
      // 船体外皮（香蕉皮弯月）
      g.fillStyle(a, 1); g.beginPath(); g.moveTo(-72, -4); g.lineTo(72, -4); g.lineTo(58, 22); g.lineTo(-58, 22); g.closePath(); g.fillPath();
      g.fillStyle(c, 1); g.beginPath(); g.moveTo(-68, -2); g.lineTo(68, -2); g.lineTo(54, 19); g.lineTo(-54, 19); g.closePath(); g.fillPath();
      // 皮筋（纵向纹）
      g.lineStyle(2, 0x8a8a1a, 0.5); for (let k = 0; k < 5; k++) { const bx = -46 + k * 23; g.lineBetween(bx, -2, bx * 0.78, 19); }
      // 内里果肉
      g.fillStyle(0xfff6c0, 1); g.fillEllipse(0, -3, 118, 12);
      // 船头翘起的皮尖
      g.fillStyle(c, 1); g.fillPoints([{ x: 68, y: -2 }, { x: 84, y: -14 }, { x: 70, y: 2 }] as never, true);
      g.fillStyle(a, 1); g.fillPoints([{ x: -68, y: -2 }, { x: -84, y: -12 }, { x: -70, y: 2 }] as never, true);
      // 桨（摇）
      const px = Math.sin(now / 300) * 18; g.lineStyle(4, 0x8a6a3a, 1); g.lineBetween(-30 + px, -34, -44 + px * 0.5, 8);
      g.fillStyle(0xd8d0c0, 1); g.fillEllipse(-30 + px, -38, 7, 11);
      // 水花
      for (let k = 0; k < 4; k++) { g.fillStyle(0xdff4ff, 0.55); g.fillEllipse(-60 + k * 40, 20, 16, 4); }
      g.restore();
    },
    front: (g, now, x, y, _f, c, a) => {
      const bob = Math.sin(now / 420) * 3;
      g.save(); g.translateCanvas(x, y + bob);
      // 近侧船帮（压在角色前）
      g.fillStyle(a, 1); g.beginPath(); g.moveTo(-62, 8); g.lineTo(62, 8); g.lineTo(52, 22); g.lineTo(-52, 22); g.closePath(); g.fillPath();
      g.fillStyle(c, 1); g.beginPath(); g.moveTo(-58, 10); g.lineTo(58, 10); g.lineTo(49, 19); g.lineTo(-49, 19); g.closePath(); g.fillPath();
      g.lineStyle(2, 0x8a8a1a, 0.5); for (let k = 0; k < 5; k++) { const bx = -44 + k * 22; g.lineBetween(bx, 10, bx * 0.8, 19); }
      g.restore();
    },
  },
  banCart: {
    c: 0xc0c020, a: 0xf0d020,
    draw: (g, now, x, y, f, c, a) => {
      g.fillStyle(0x000000, 0.18); g.fillEllipse(x, y + 5, 160, 14);
      faces(g, x, y, f, () => {
        // 车斗（香蕉皮做箱壁）
        g.fillStyle(0x8a8a1a, 1); g.fillRoundedRect(-50, -26, 96, 30, 5);
        g.fillStyle(c, 1); g.fillRoundedRect(-48, -25, 92, 27, 5);
        g.fillStyle(a, 1); g.fillRoundedRect(-44, -22, 30, 22, 4); g.fillRoundedRect(2, -22, 30, 22, 4);
        // 车斗里的香蕉
        for (let k = 0; k < 3; k++) { g.save(); g.translateCanvas(-22 + k * 20, -30); g.rotateCanvas(-0.3 + k * 0.25); g.fillStyle(0xf0d020, 1); g.fillEllipse(0, 0, 12, 22); g.fillStyle(0x8a8a1a, 0.7); g.fillCircle(0, -9, 1.4); g.restore(); }
        // 车把（朝前）
        g.lineStyle(4, 0x8a6a3a, 1); g.beginPath(); g.moveTo(46, -20); g.lineTo(64, -30); g.strokePath();
        // 轮
        for (const wx of [-32, 26]) {
          g.fillStyle(0x2a2a10, 1); g.fillCircle(wx, 2, 13);
          g.fillStyle(0x6a6a2a, 1); g.fillCircle(wx, 2, 10);
          g.save(); g.translateCanvas(wx, 2); g.rotateCanvas(now / 180); g.fillStyle(a, 0.9); g.fillRect(-9, -1.6, 18, 3.2); g.fillRect(-9, -1.6, 18, 3.2); g.rotateCanvas(1.57); g.fillRect(-9, -1.6, 18, 3.2); g.restore();
          g.fillStyle(0x1a1a0a, 1); g.fillCircle(wx, 2, 2.4);
        }
      });
    },
    front: (g, _now, x, y, f, c, _a) => {
      faces(g, x, y, f, () => {
        // 近侧箱壁下缘
        g.fillStyle(0x8a8a1a, 1); g.fillRoundedRect(-46, -6, 88, 12, 4);
        g.fillStyle(c, 1); g.fillRoundedRect(-44, -5, 84, 9, 3);
      });
    },
  },
  // ══ 迷因宇宙 ══════════════════════════════════════════
  memeDoge: {
    c: 0xc8a85a, a: 0x7dff9a,
    draw: (g, now, x, y, f, _c, _a) => {
      const fur = 0xd8b86a, dark = 0xa8863a, cream = 0xe8dcc0, ear = 0xb8964a;
      const tw = Math.sin(now / 180) * 3;
      g.fillStyle(0x000000, 0.18); g.fillEllipse(x, y + 5, 158, 14);
      faces(g, x, y, f, () => {
        // 卷尾        g.lineStyle(6, dark, 1); g.beginPath(); g.moveTo(-42, -30); g.lineTo(-62, -34); g.lineTo(-66, -46); g.strokePath();
        // 远侧腿
        leg(g, -22, -16, 2, 8, dark); leg(g, 8, -16, 2, 8, dark);
        // 躯干
        g.fillStyle(dark, 1); g.fillEllipse(-8, -24, 100, 40);
        g.fillStyle(fur, 1); g.fillEllipse(-8, -25, 94, 35);
        g.fillStyle(cream, 1); g.fillEllipse(-2, -10, 78, 14);
        // 头 + 口鼻
        g.fillStyle(dark, 1); g.fillCircle(44, -42, 22);
        g.fillStyle(fur, 1); g.fillCircle(44, -43, 20);
        g.fillStyle(cream, 1); g.fillEllipse(52, -34, 24, 18);
        // 三角耳
        g.fillStyle(ear, 1); g.fillTriangle(34, -58, 40, -66 - tw, 46, -58); g.fillTriangle(46, -58, 54, -66 + tw, 60, -56);
        // 眼 + 鼻 + 嘴
        g.fillStyle(0x1a1208, 1); g.fillCircle(40, -46, 3); g.fillCircle(52, -46, 3);
        g.fillStyle(0xffffff, 0.85); g.fillCircle(41, -47, 1); g.fillCircle(53, -47, 1);
        g.fillStyle(0x1a1208, 1); g.fillEllipse(60, -35, 6, 4.4);
        g.lineStyle(1.6, 0x1a1208, 1); g.beginPath(); g.moveTo(48, -30); g.lineTo(53, -27); g.lineTo(58, -30); g.strokePath();
        // 得意的腮红
        g.fillStyle(0xff9a9a, 0.4); g.fillCircle(34, -36, 4);
      });
    },
    front: (g, now, x, y, f, _c, _a) => {
      const fur = 0xd8b86a, dark = 0xa8863a; const st = Math.sin(now / 220) * 2.4;
      faces(g, x, y, f, () => {
        leg(g, -14, -16, 2 + st, 9, fur); leg(g, 14, -16, 2 - st, 9, fur);
        g.fillStyle(dark, 0.35); g.fillEllipse(-2, -10, 74, 8);
      });
    },
  },
  memeRocket: {
    c: 0xd8d8e0, a: 0xff5ec8,
    draw: (g, now, x, y, _f, c, a) => {
      const bob = Math.sin(now / 500) * 3;
      g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 8, 96, 14);
      g.save(); g.translateCanvas(x, y + bob);
      // 尾焰
      for (let k = 0; k < 5; k++) { const ph = ((now / 260 + k / 5) % 1); g.fillStyle(k % 2 ? 0xff9a3c : a, (1 - ph) * 0.85); g.fillPoints([{ x: -10, y: 4 }, { x: 10, y: 4 }, { x: Math.sin(k) * 4 + (k - 2) * 3, y: 10 + ph * 30 }] as never, true); }
      // 机身
      g.fillStyle(0x9a9aa8, 1); g.beginPath(); g.moveTo(0, -60); g.lineTo(18, -20); g.lineTo(18, 6); g.lineTo(-18, 6); g.lineTo(-18, -20); g.closePath(); g.fillPath();
      g.fillStyle(c, 1); g.beginPath(); g.moveTo(0, -56); g.lineTo(15, -20); g.lineTo(15, 4); g.lineTo(-15, 4); g.lineTo(-15, -20); g.closePath(); g.fillPath();
      // 高光
      g.fillStyle(0xffffff, 0.5); g.beginPath(); g.moveTo(-6, -50); g.lineTo(-10, -20); g.lineTo(-10, 0); g.lineTo(-6, 0); g.lineTo(-6, -50); g.closePath(); g.fillPath();
      // 舷窗
      g.fillStyle(a, 1); g.fillCircle(0, -30, 8); g.fillStyle(0x7dff9a, 1); g.fillCircle(0, -30, 5.5);
      g.fillStyle(0x39ffd0, 0.7); g.fillCircle(-2, -32, 2);
      // 尾翼
      g.fillStyle(0xff4a5a, 1); g.fillTriangle(-18, -8, -32, 8, -12, 2); g.fillTriangle(18, -8, 32, 8, 12, 2); g.fillTriangle(-6, 4, 6, 4, 0, 18);
      g.restore();
    },
  },
  // ══ 摸鱼办公室 ══════════════════════════════════════════
  officeChair: {
    c: 0x3a3a44, a: 0x9fd8ff,
    draw: (g, now, x, y, f, c, a) => {
      const rock = Math.sin(now / 420) * 2;
      g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 5, 96, 14);
      faces(g, x, y, f, () => {
        // 五爪底座 + 滚轮
        g.fillStyle(0x2a2a34, 1); for (let k = 0; k < 5; k++) { const ang = -0.3 + (k - 2) * 0.5; g.lineStyle(4, 0x2a2a34, 1); g.lineBetween(0, 0, Math.cos(ang) * 26, Math.sin(ang) * 6 + 2); }
        for (const wx of [-24, -12, 0, 12, 24]) { g.fillStyle(0x1a1a22, 1); g.fillCircle(wx, 4, 4); g.save(); g.translateCanvas(wx, 4); g.rotateCanvas(now / 150 + wx); g.fillStyle(a, 0.7); g.fillRect(-3.4, -1.2, 6.8, 2.4); g.restore(); }
        // 立柱
        g.fillStyle(0x55555f, 1); g.fillRect(-3, -18, 6, 20);
        // 坐垫
        g.fillStyle(c, 1); g.fillRoundedRect(-24, -26 + rock, 48, 12, 5);
        g.fillStyle(0x4a4a58, 1); g.fillRoundedRect(-24, -26 + rock, 48, 5, 3);
        // 靠背
        g.fillStyle(c, 1); g.fillRoundedRect(-28, -62 + rock, 18, 40, 7);
        g.fillStyle(0x4a4a58, 1); g.fillRoundedRect(-26, -58 + rock, 14, 32, 6);
        for (let k = 0; k < 3; k++) { g.lineStyle(1.4, 0x2a2a34, 0.6); g.lineBetween(-25, -52 + k * 9 + rock, -12, -50 + k * 9 + rock); }
        // 扶手
        g.fillStyle(0x2a2a34, 1); g.fillRoundedRect(-6, -34 + rock, 26, 5, 2.5); g.fillRoundedRect(16, -34 + rock, 5, 10, 2);
      });
    },
    front: (g, now, x, y, f, c, _a) => {
      const rock = Math.sin(now / 420) * 2;
      faces(g, x, y, f, () => {
        // 近侧扶手压前
        g.fillStyle(c, 1); g.fillRoundedRect(-22, -34 + rock, 26, 5, 2.5);
        g.fillStyle(0x2a2a34, 1); g.fillRoundedRect(-24, -34 + rock, 5, 10, 2);
      });
    },
  },
  // ══ 花园地精 ══════════════════════════════════════════
  gnomeSnail: {
    c: 0xa8763a, a: 0xa8ff7a,
    draw: (g, now, x, y, f, c, a) => {
      const foot = 0xe8dcc0, footD = 0xcbbd9c, shell = c, shellD = 0x7a5226;
      g.fillStyle(0x000000, 0.16); g.fillEllipse(x, y + 5, 130, 14);
      faces(g, x, y, f, () => {
        // 腹足
        g.fillStyle(footD, 1); g.fillPoints([{ x: -48, y: 0 }, { x: 52, y: 0 }, { x: 60, y: 6 }, { x: -44, y: 6 }] as never, true);
        g.fillStyle(foot, 1); g.fillPoints([{ x: -46, y: -2 }, { x: 50, y: -2 }, { x: 56, y: 4 }, { x: -42, y: 4 }] as never, true);
        g.fillStyle(footD, 0.5); for (let k = 0; k < 6; k++) { g.fillEllipse(-36 + k * 16, 3, 10, 3); }
        // 螺壳（同心螺旋）
        g.fillStyle(shellD, 1); g.fillCircle(-2, -26, 30);
        g.fillStyle(shell, 1); g.fillCircle(-2, -26, 26);
        for (let k = 0; k < 3; k++) { g.lineStyle(3, shellD, 0.7); g.strokeCircle(-2, -26, 22 - k * 7); }
        g.save(); g.translateCanvas(-2, -26); g.rotateCanvas(now / 1600); g.fillStyle(a, 0.5); g.fillRect(-18, -1.4, 36, 2.8); g.restore();
        // 头（朝前）+ 触角
        g.fillStyle(foot, 1); g.fillEllipse(48, -10, 22, 16);
        for (const s of [-1, 1]) { g.lineStyle(2.2, foot, 1); const wig = Math.sin(now / 380 + s) * 2; g.lineBetween(52, -14, 60, -30 + wig); g.fillStyle(0x1a1208, 1); g.fillCircle(60, -30 + wig, 2.2); }
        g.fillStyle(0x1a1208, 1); g.fillCircle(50, -12, 1.8);
      });
    },
  },
  // ══ 垃圾回收站 ══════════════════════════════════════════
  trashCart: {
    c: 0x4a5a4a, a: 0x8fd4a0,
    draw: (g, now, x, y, f, c, a) => {
      g.fillStyle(0x000000, 0.16); g.fillEllipse(x, y + 5, 150, 14);
      faces(g, x, y, f, () => {
        // 车斗
        g.fillStyle(0x2f3a2f, 1); g.fillRoundedRect(-52, -30, 96, 34, 4);
        g.fillStyle(c, 1); g.fillRoundedRect(-50, -29, 92, 31, 4);
        // 分色板 + 标
        g.fillStyle(0x6a7a6a, 1); g.fillRect(-50, -18, 92, 3);
        g.fillStyle(a, 1); g.fillCircle(6, -22, 6); g.fillStyle(c, 1); g.fillCircle(6, -22, 3.4);
        // 溢出的垃圾
        for (let k = 0; k < 4; k++) { g.fillStyle([0xb84a3a, 0xf0d020, 0x8fd4a0, 0x8a8a92][k], 1); g.save(); g.translateCanvas(-40 + k * 18, -34); g.rotateCanvas(k * 0.7 + now / 900); g.fillRect(-5, -4, 10, 8); g.restore(); }
        // 车把
        g.lineStyle(4, 0x3a4a3a, 1); g.beginPath(); g.moveTo(44, -24); g.lineTo(62, -32); g.strokePath();
        // 轮
        for (const wx of [-30, 24]) { g.fillStyle(0x1a1a1a, 1); g.fillCircle(wx, 2, 12); g.fillStyle(0x555a55, 1); g.fillCircle(wx, 2, 8.5); g.save(); g.translateCanvas(wx, 2); g.rotateCanvas(now / 170); g.fillStyle(a, 0.85); g.fillRect(-8, -1.4, 16, 2.8); g.restore(); g.fillStyle(0x111, 1); g.fillCircle(wx, 2, 2); }
      });
    },
    front: (g, _now, x, y, f, c, _a) => {
      faces(g, x, y, f, () => {
        g.fillStyle(0x2f3a2f, 1); g.fillRoundedRect(-48, -6, 88, 12, 4);
        g.fillStyle(c, 1); g.fillRoundedRect(-46, -5, 84, 9, 3);
      });
    },
  },
  trashTruck: {
    c: 0x3a4a3a, a: 0x8fd4a0,
    draw: (g, now, x, y, f, c, a) => {
      g.fillStyle(0x000000, 0.2); g.fillEllipse(x, y + 5, 186, 16);
      faces(g, x, y, f, () => {
        // 后斗（连盖）
        g.fillStyle(0x243024, 1); g.fillRoundedRect(-64, -46, 76, 50, 5);
        g.fillStyle(c, 1); g.fillRoundedRect(-62, -44, 72, 46, 5);
        g.lineStyle(2, 0x1a201a, 0.6); for (let k = 0; k < 4; k++) { g.lineBetween(-60 + k * 18, -44, -60 + k * 18, 0); }
        // 压缩板（上下开合）
        const press = Math.abs(Math.sin(now / 700)); g.fillStyle(a, 0.6); g.fillRect(-54, -40 + press * 12, 56, 5);
        // 驾驶室
        g.fillStyle(0x2a3a2a, 1); g.fillRoundedRect(14, -40, 46, 44, 5);
        g.fillStyle(c, 1); g.fillRoundedRect(16, -38, 42, 40, 4);
        g.fillStyle(0x8fa0a8, 1); g.fillRoundedRect(24, -34, 30, 18, 3); // 车窗
        g.fillStyle(0x6a7a7a, 0.6); g.fillRect(24, -34, 30, 6);
        // 烟囱
        g.fillStyle(0x1a201a, 1); g.fillRect(60, -44, 6, 12);
        // 保险杠
        g.fillStyle(0x6a7a6a, 1); g.fillRoundedRect(58, -8, 8, 8, 2);
        // 轮
        for (const wx of [-42, 34]) { g.fillStyle(0x151515, 1); g.fillCircle(wx, 2, 14); g.fillStyle(0x555a55, 1); g.fillCircle(wx, 2, 9.5); g.save(); g.translateCanvas(wx, 2); g.rotateCanvas(now / 150); g.fillStyle(a, 0.7); g.fillRect(-9, -1.6, 18, 3.2); g.restore(); g.fillStyle(0x111, 1); g.fillCircle(wx, 2, 2.6); }
        // 尾气
        for (let k = 0; k < 4; k++) { const ph = ((now / 900 + k / 4) % 1); g.fillStyle(0x6a7a6a, (1 - ph) * 0.5); g.fillCircle(63 + Math.sin(k * 2) * 4, -46 - ph * 18, 3 + ph * 3); }
      });
    },
    front: (g, _now, x, y, f, c, _a) => {
      faces(g, x, y, f, () => {
        // 近侧车门下沿 + 踏板
        g.fillStyle(0x243024, 1); g.fillRoundedRect(-60, -8, 120, 13, 4);
        g.fillStyle(c, 1); g.fillRoundedRect(-58, -7, 116, 10, 3);
        g.fillStyle(0x6a7a6a, 1); g.fillRect(6, -4, 44, 4);
      });
    },
  },
};
