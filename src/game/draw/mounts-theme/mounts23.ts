import { type G, type MountArt } from './shared';

/** 第十批坐骑（梦境 / 微观 / 炼金 / 毛线 / 画中世界）——本地坐标 +x=朝右，f<0 镜像。逐款精绘。 */

function faces(g: G, x: number, y: number, f: 1 | -1, fn: () => void): void {
  g.save(); g.translateCanvas(x, y); if (f < 0) g.scaleCanvas(-1, 1); fn(); g.restore();
}

export const MOUNTS_23: Record<string, MountArt> = {
  // ── 梦境回廊 ──
  dreamCloud: { c: 0xb8a8e8, a: 0xfff4d8, draw: (g, now, x, y, f, _c, a) => {
    // 梦云：软云座，托着角色上下浮
    const bob = Math.sin(now / 500) * 4;
    g.fillStyle(0x1a1440, 0.25); g.fillEllipse(x, y + 6, 150, 16);
    faces(g, x, y, f, () => {
      const by = -22 + bob;
      for (let k = 0; k < 4; k++) { g.fillStyle(0x8a78c8, 1); g.fillCircle(-40 + k * 28, by + 6, 20); }
      for (let k = 0; k < 4; k++) { g.fillStyle(0xb8a8e8, 1); g.fillCircle(-40 + k * 28, by + 3, 18); }
      g.fillStyle(0xd8d0ff, 1); g.fillEllipse(0, by - 6, 96, 20);
      g.fillStyle(a, 0.5); g.fillEllipse(-6, by - 10, 60, 10);
      for (let k = 0; k < 4; k++) { const ph = ((now / 1100 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(-40 + k * 26, by - 16 - ph * 14, 1.6); }
    });
  } },
  dreamBed: { c: 0x9f8aff, a: 0xfff4d8, draw: (g, now, x, y, f, c, a) => {
    // 飞毯床：会飞的床 + 流苏
    const bob = Math.sin(now / 460) * 4;
    g.fillStyle(0x1a1440, 0.25); g.fillEllipse(x, y + 6, 150, 14);
    faces(g, x, y, f, () => {
      const by = -14 + bob;
      // 床垫
      g.fillStyle(0x6a5a9a, 1); g.fillRoundedRect(-58, by, 116, 20, 6);
      g.fillStyle(c, 1); g.fillRoundedRect(-56, by + 2, 112, 16, 5);
      g.fillStyle(0xfff4d8, 1); g.fillRoundedRect(-56, by - 6, 40, 12, 5); // 枕
      // 被子
      g.fillStyle(0xff8ad4, 1); g.fillRoundedRect(-14, by - 2, 68, 20, 6);
      g.fillStyle(0xffb7d5, 1); g.fillRoundedRect(-12, by - 2, 30, 18, 5);
      // 流苏
      for (let k = 0; k < 5; k++) { g.fillStyle(a, 0.9); g.fillRect(-56 + k * 28, by + 19, 3, 6 + Math.sin(now / 300 + k) * 2); }
      g.lineStyle(2, c, 0.8); g.strokeRect(-56, by + 2, 112, 16);
    });
  } },
  // ── 微观世界 ──
  microCilia: { c: 0x5fe8d0, a: 0x39ffd0, draw: (g, now, x, y, f, _c, a) => {
    // 纤毛坐骑：鞋形纤毛虫，周身纤毛摆动
    g.fillStyle(0x06141e, 0.3); g.fillEllipse(x, y + 5, 150, 16);
    faces(g, x, y, f, () => {
      g.fillStyle(0x2a7a8a, 1); g.beginPath(); g.moveTo(-52, -6); g.lineTo(46, -12); g.lineTo(56, -4); g.lineTo(44, 8); g.lineTo(-46, 12); g.closePath(); g.fillPath();
      g.fillStyle(0x5fe8d0, 1); g.beginPath(); g.moveTo(-48, -6); g.lineTo(44, -11); g.lineTo(52, -4); g.lineTo(42, 6); g.lineTo(-42, 10); g.closePath(); g.fillPath();
      g.fillStyle(a, 0.4); g.fillEllipse(-4, -2, 60, 8);
      for (let k = 0; k < 12; k++) { const bx = -50 + k * 9; const ph = Math.sin(now / 200 + k * 0.8); g.lineStyle(1.6, k % 2 ? a : 0x5fe8d0, 0.9); g.lineBetween(bx, -10, bx + ph * 3, -18); g.lineBetween(bx, 9, bx - ph * 3, 17); }
      g.fillStyle(0xffffff, 0.6); g.fillEllipse(30, -6, 10, 5);
    });
  } },
  microCell: { c: 0x5fe8d0, a: 0xff8ad4, draw: (g, now, x, y, f, _c, a) => {
    // 细胞核座驾：巨大细胞舱，核仁缓跳
    const br = Math.sin(now / 600) * 3;
    g.fillStyle(0x06141e, 0.35); g.fillEllipse(x, y + 5, 160, 18);
    faces(g, x, y, f, () => {
      g.fillStyle(0x2a7a8a, 1); g.fillEllipse(0, -16, 130, 56);
      g.fillStyle(0x5fe8d0, 0.9); g.fillEllipse(0, -17, 122, 50);
      g.fillStyle(0x39ffd0, 0.4); g.fillEllipse(0, -22, 96, 30);
      // 核仁
      const nx = -14, ny = -18 + br; g.fillStyle(0xff8ad4, 0.9); g.fillCircle(nx, ny, 20); g.fillStyle(0xffffff, 0.4); g.fillCircle(nx - 6, ny - 6, 6);
      // 细胞器
      for (let k = 0; k < 5; k++) { const ang = (k / 5) * 6.28 + now / 1500; g.fillStyle(k % 2 ? a : 0x39ffd0, 0.8); g.fillEllipse(20 + Math.cos(ang) * 26, -18 + Math.sin(ang) * 12, 12, 7); }
      g.lineStyle(2, a, 0.5); g.strokeEllipse(0, -17, 122, 50);
      for (let k = 0; k < 4; k++) { const ph = ((now / 1000 + k / 4) % 1); g.fillStyle(0x39ffd0, (1 - ph) * 0.7); g.fillCircle(-40 + k * 24, -40 - ph * 20, 1.8); }
    });
  } },
  // ── 炼金工坊 ──
  alchCrucible: { c: 0x8a6a2a, a: 0x7dff6a, draw: (g, now, x, y, f, _c, a) => {
    // 坩埚坐骑：三脚坩埚，药液沸腾
    g.fillStyle(0x12200c, 0.35); g.fillEllipse(x, y + 5, 130, 16);
    faces(g, x, y, f, () => {
      // 三脚
      g.lineStyle(5, 0x3a2a14, 1); for (const dx of [-30, 0, 30]) g.lineBetween(dx, -14, dx * 1.2, 8);
      // 锅体
      g.fillStyle(0x5a4228, 1); g.beginPath(); g.moveTo(-40, -30); g.lineTo(40, -30); g.lineTo(32, -4); g.lineTo(-32, -4); g.closePath(); g.fillPath();
      g.fillStyle(0x8a6a2a, 1); g.beginPath(); g.moveTo(-37, -29); g.lineTo(37, -29); g.lineTo(30, -6); g.lineTo(-30, -6); g.closePath(); g.fillPath();
      g.fillStyle(0xd8b45a, 1); g.fillRect(-40, -33, 80, 5); // 锅沿
      // 药液
      const b = Math.abs(Math.sin(now / 260));
      g.fillStyle(a, 0.85); g.fillEllipse(0, -30 - b * 2, 70, 10);
      g.fillStyle(0xd0ffb0, 0.9); g.fillEllipse(-10, -31 - b * 2, 30, 5);
      for (let k = 0; k < 5; k++) { const ph = ((now / 700 + k / 5) % 1); g.fillStyle(0xbaffa0, (1 - ph) * 0.9); g.fillCircle(-24 + k * 12, -34 - ph * 20, 2 + ph * 2); }
      g.fillStyle(0x3a2a14, 1); g.fillRect(-46, -20, 8, 6); g.fillRect(38, -20, 8, 6);
    });
  } },
  // ── 毛线世界 ──
  yarnCat: { c: 0xffb7d5, a: 0xffd8e8, draw: (g, now, x, y, f, _c, a) => {
    // 毛线猫：毛线球小猫，尾巴线头
    g.fillStyle(0x3a1e30, 0.3); g.fillEllipse(x, y + 5, 140, 16);
    faces(g, x, y, f, () => {
      // 球身
      g.fillStyle(0xa86a8a, 1); g.fillCircle(-4, -18, 30);
      g.fillStyle(0xffb7d5, 1); g.fillCircle(-4, -18, 27);
      g.lineStyle(1.4, a, 0.8); for (let k = 0; k < 5; k++) { const ang = (k / 5) * 6.28; g.lineBetween(-4 + Math.cos(ang) * 24, -18 + Math.sin(ang) * 24, -4 + Math.cos(ang + 2.2) * 24, -18 + Math.sin(ang + 2.2) * 24); }
      // 头 + 耳
      g.fillStyle(0xffb7d5, 1); g.fillCircle(28, -26, 18);
      g.fillStyle(0xa86a8a, 1); g.fillTriangle(20, -42, 26, -50, 32, -40); g.fillTriangle(30, -42, 38, -50, 42, -40);
      g.fillStyle(0x2a1a24, 1); g.fillEllipse(24, -28, 3, 4); g.fillEllipse(34, -28, 3, 4);
      g.fillStyle(0xff8ad4, 1); g.fillEllipse(29, -22, 5, 4);
      // 尾巴
      g.lineStyle(4, 0xffb7d5, 1); g.beginPath(); g.moveTo(-32, -14); g.lineTo(-50, -22 + Math.sin(now / 400) * 6); g.lineTo(-56, -34 + Math.sin(now / 400) * 8); g.strokePath();
      // 腿
      for (const lx of [-18, 8]) { g.fillStyle(0xa86a8a, 1); g.fillEllipse(lx, -2, 14, 8); }
      void a;
    });
  } },
  yarnHorse: { c: 0xffb7d5, a: 0xffd8e8, draw: (g, now, x, y, f, _c, a) => {
    // 毛线木马：针织摇摇马，前后摇
    const rock = Math.sin(now / 400) * 0.12;
    g.fillStyle(0x3a1e30, 0.3); g.fillEllipse(x, y + 5, 160, 16);
    faces(g, x, y, f, () => {
      g.save(); g.rotateCanvas(rock);
      // 摇杆
      g.lineStyle(5, 0x5a4228, 1); g.beginPath(); g.moveTo(-56, 6); g.lineTo(0, 0); g.lineTo(56, 6); g.strokePath();
      // 腿
      for (const lx of [-26, 24]) { g.fillStyle(0xa86a8a, 1); g.fillRoundedRect(lx - 4, -26, 8, 30, 3); }
      // 躯干
      g.fillStyle(0xa86a8a, 1); g.fillEllipse(-2, -28, 76, 42);
      g.fillStyle(0xffb7d5, 1); g.fillEllipse(-2, -30, 70, 37);
      for (let k = 0; k < 4; k++) { g.lineStyle(1.4, a, 0.8); g.lineBetween(-30, -42 + k * 8, 26, -40 + k * 8); }
      // 头颈
      g.fillStyle(0xffb7d5, 1); g.beginPath(); g.moveTo(20, -40); g.lineTo(44, -60); g.lineTo(58, -56); g.lineTo(52, -40); g.lineTo(30, -30); g.closePath(); g.fillPath();
      g.fillStyle(0xffb7d5, 1); g.fillEllipse(56, -54, 24, 18);
      g.fillStyle(0x2a1a24, 1); g.fillCircle(62, -58, 3);
      // 针织鬃毛
      for (let k = 0; k < 5; k++) { g.fillStyle(a, 1); g.fillCircle(30 + k * 5, -56 - k * 2 + Math.sin(now / 300 + k) * 2, 3.4); }
      // 马鞍
      g.fillStyle(0xff8ad4, 1); g.fillRoundedRect(-14, -44, 26, 10, 4);
      g.restore();
    });
  } },
  // ── 画中世界 ──
  paintHorse: { c: 0xa8763a, a: 0xff8ad4, draw: (g, now, x, y, f, _c, a) => {
    // 画中骏马：跃出画布的骏马
    const bob = Math.sin(now / 300) * 3;
    g.fillStyle(0x20162e, 0.3); g.fillEllipse(x, y + 5, 160, 16);
    faces(g, x, y, f, () => {
      // 腿
      for (const lx of [-24, 6]) { g.fillStyle(0x8a5a3a, 1); g.fillRoundedRect(lx - 3, -24, 6, 28 + (lx < 0 ? bob : -bob), 3); }
      // 躯干
      g.fillStyle(0x8a5a3a, 1); g.fillEllipse(-4, -28, 90, 40);
      g.fillStyle(0xa8763a, 1); g.fillEllipse(-4, -30, 84, 35);
      // 笔触鬃毛
      for (let k = 0; k < 6; k++) { g.fillStyle(k % 2 ? a : 0x8a5a3a, 0.9); g.save(); g.translateCanvas(6 + k * 4, -46 - k * 2 + Math.sin(now / 320 + k) * 2); g.rotateCanvas(-0.5 + k * 0.1); g.fillEllipse(0, 0, 12, 4); g.restore(); }
      // 头颈
      g.fillStyle(0xa8763a, 1); g.beginPath(); g.moveTo(18, -42); g.lineTo(40, -62); g.lineTo(58, -58); g.lineTo(54, -42); g.lineTo(30, -32); g.closePath(); g.fillPath();
      g.fillStyle(0xa8763a, 1); g.fillEllipse(58, -54, 26, 18);
      g.fillStyle(0x2a1c10, 1); g.fillEllipse(66, -56, 4, 3); g.fillCircle(60, -60, 2.6);
      // 尾巴
      g.fillStyle(0x8a5a3a, 1); g.fillPoints([{ x: -48, y: -36 }, { x: -70, y: -30 + Math.sin(now / 320) * 6 }, { x: -66, y: -18 }, { x: -46, y: -26 }] as never, true);
      // 颜料滴
      for (let k = 0; k < 4; k++) { const ph = ((now / 1300 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(-30 + k * 20, 6 + ph * 12, 1.8); }
    });
  } },
};
