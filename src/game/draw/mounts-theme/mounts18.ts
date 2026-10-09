import { mpoly, type MountArt } from './shared';

/** 批十六坐骑（天竺神话 / 高天原 / 凯尔特 / 美索不达米亚 / 克苏鲁）——(x, y) = 地面基准，f = 朝向 */

export const MOUNTS_18: Record<string, MountArt> = {
  vdaGaruda: { c: 0xffc04a, a: 0xff5a2a, draw: (g, now, x, y, f, c, a) => {
    // 金翅大鹏·迦楼罗：金色神鸟坐骑，双翼渐次展开、头戴宝冠
    const bob = Math.abs(Math.sin(now / 320)) * 3;
    const by = y - 30 - bob;
    const flap = Math.sin(now / 260);
    for (const s of [-1, 1]) {
      g.fillStyle(0xb87a1a, 0.95);
      mpoly(g, [[x, by - 8], [x + s * 34, by - 34 - flap * 8], [x + s * 58, by - 12], [x + s * 22, by + 6]], 0xb87a1a, 0.95);
      g.fillStyle(c, 1);
      mpoly(g, [[x, by - 8], [x + s * 30, by - 30 - flap * 8], [x + s * 52, by - 12], [x + s * 20, by + 4]], c, 1);
      for (let k = 0; k < 3; k++) { g.fillStyle(a, 0.7); mpoly(g, [[x + s * 12, by - 8], [x + s * (26 + k * 8), by - 20 - flap * 6], [x + s * (34 + k * 8), by - 8]], a, 0.6); }
    }
    g.fillStyle(0xd8a03a, 1); g.fillEllipse(x, by, 34, 22);
    g.fillStyle(c, 1); g.fillEllipse(x, by - 2, 28, 18);
    g.fillStyle(a, 0.5); g.fillEllipse(x, by + 6, 22, 8);
    const hx = x + 26 * f, hy = by - 18; // 头
    g.fillStyle(c, 1); g.fillCircle(hx, hy, 11);
    g.fillStyle(0xff5a2a, 1); g.fillTriangle(hx + 8 * f, hy - 2, hx + 18 * f, hy + 2, hx + 8 * f, hy + 5); // 喙
    g.fillStyle(0xffd45c, 0.95); mpoly(g, [[hx - 6, hy - 10], [hx, hy - 22], [hx + 6, hy - 10]], 0xffd45c, 0.95);
    g.fillStyle(a, 0.95); g.fillCircle(hx + 3 * f, hy - 3, 2.4); g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx + 3.6 * f, hy - 3, 1);
    const tw = Math.sin(now / 400) * 8; // 尾羽
    g.fillStyle(c, 1); mpoly(g, [[x - 26 * f, by - 4], [x - 48 * f, by - 16 + tw], [x - 52 * f, by + 4 + tw], [x - 30 * f, by + 8]], c, 1);
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 2, 66, 10);
  } },
  takYatagarasu: { c: 0x2a2a34, a: 0xffd45c, draw: (g, now, x, y, f, c, a) => {
    // 八咫乌：三足金乌坐骑，扑翼带日芒
    const bob = Math.abs(Math.sin(now / 280)) * 4;
    const by = y - 28 - bob;
    const flap = Math.sin(now / 220);
    for (const s of [-1, 1]) {
      g.fillStyle(0x14141c, 1);
      mpoly(g, [[x, by - 6], [x + s * 36, by - 30 - flap * 8], [x + s * 54, by - 6], [x + s * 18, by + 8]], 0x14141c, 1);
      g.fillStyle(c, 1);
      mpoly(g, [[x, by - 6], [x + s * 32, by - 26 - flap * 8], [x + s * 48, by - 6], [x + s * 16, by + 6]], c, 1);
      g.fillStyle(a, 0.6); for (let k = 0; k < 3; k++) g.fillCircle(x + s * (24 + k * 8), by - 12 - k * 4 - flap * 6, 1.6);
    }
    g.fillStyle(c, 1); g.fillEllipse(x, by, 30, 20);
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(a, 0.5 * gl); g.fillCircle(x, by, 20);
    const hx = x + 24 * f, hy = by - 14;
    g.fillStyle(c, 1); g.fillCircle(hx, hy, 10);
    g.fillStyle(a, 0.95); g.fillTriangle(hx + 7 * f, hy - 1, hx + 17 * f, hy + 2, hx + 7 * f, hy + 4);
    g.fillStyle(0xffe8b0, 0.95); g.fillCircle(hx + 3 * f, hy - 3, 2.6); g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx + 3.6 * f, hy - 3, 1.1);
    g.fillStyle(a, 0.95); mpoly(g, [[hx - 1, hy - 9], [hx + 2 * f, hy - 18], [hx + 3 * f, hy - 9]], a, 0.95);
    // 三足
    g.fillStyle(0xd8a03a, 1);
    for (const lx of [-8, 0, 8]) { g.fillRect(x + lx - 1.2, by + 12, 2.4, y - by - 12); g.fillRect(x + lx - 3, y - 3, 6, 3); }
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 2, 62, 10);
  } },
  celtStag: { c: 0xe8e0d0, a: 0xd8b45a, draw: (g, now, x, y, f, c, a) => {
    // 白角神鹿：白色大角鹿，蹄下生花
    const by = y - 30;
    for (const [lx, ph] of [[-24, 0], [-9, Math.PI], [11, Math.PI], [26, 0]] as Array<[number, number]>) {
      const stp = Math.sin(now / 300 + ph) * 3;
      g.fillStyle(0xc8beac, 1); g.fillRoundedRect(x + lx * f / Math.abs(f || 1) - 3 + stp, by + 10, 6, y - by - 14, 2.5);
    }
    g.fillStyle(0xd8cec0, 1); mpoly(g, [[x - 30, by + 8], [x + 28, by + 8], [x + 24, by - 14], [x - 26, by - 14]], 0xd8cec0, 1);
    g.fillStyle(c, 1); mpoly(g, [[x - 26, by + 5], [x + 24, by + 5], [x + 20, by - 11], [x - 22, by - 11]], c, 1);
    g.fillStyle(a, 0.4); g.fillEllipse(x, by + 2, 40, 8);
    const hx = x + 30 * f, hy = by - 16;
    g.fillStyle(c, 1); g.fillEllipse(hx, hy, 16, 12);
    g.fillStyle(0xc8beac, 1); g.fillRoundedRect(hx + 6 * f, hy + 2, 12, 5, 2);
    g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx + 3 * f, hy - 2, 1.6);
    for (const s of [-1, 1]) { // 鹿角
      g.lineStyle(2.4, 0xd8b45a, 1);
      g.beginPath(); g.moveTo(hx - 2 * f, hy - 8); g.lineTo(hx + s * 6, hy - 22); g.lineTo(hx + s * 14, hy - 30); g.strokePath();
      g.beginPath(); g.moveTo(hx + s * 8, hy - 24); g.lineTo(hx + s * 16, hy - 24); g.strokePath();
      g.fillStyle(a, 0.8); g.fillCircle(hx + s * 14, hy - 31, 1.8);
    }
    for (let k = 0; k < 4; k++) { const ph = ((now / 1200 + k / 4) % 1); g.fillStyle(0xffb7d5, 0.7 * (1 - ph)); g.fillCircle(x - 20 + k * 14, y - ph * 30, 1.6); }
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 2, 66, 10);
  } },
  mesoLamassu: { c: 0xd8b45a, a: 0x5a8aff, draw: (g, now, x, y, f, c, a) => {
    // 拉玛苏：人首翼牛坐骑，翼上刻纹、胡须飘
    const by = y - 34;
    for (const [lx, ph] of [[-22, 0], [-8, Math.PI], [10, Math.PI], [24, 0]] as Array<[number, number]>) {
      const stp = Math.sin(now / 320 + ph) * 2.5;
      g.fillStyle(0x8a6a2a, 1); g.fillRoundedRect(x + lx * (f >= 0 ? 1 : -1) - 4 + stp, by + 12, 8, y - by - 16, 3);
    }
    g.fillStyle(0x9a7a3a, 1); mpoly(g, [[x - 32, by + 10], [x + 30, by + 10], [x + 26, by - 16], [x - 28, by - 16]], 0x9a7a3a, 1);
    g.fillStyle(c, 1); mpoly(g, [[x - 28, by + 7], [x + 26, by + 7], [x + 22, by - 13], [x - 24, by - 13]], c, 1);
    for (let k = 0; k < 5; k++) { g.fillStyle(0x7a5a22, 0.5); g.fillCircle(x - 18 + (k * 11 % 36), by - 6 + Math.floor(k / 3) * 10, 2.4); }
    const flap = Math.sin(now / 360);
    for (const s of [-1, 1]) { // 翼
      g.fillStyle(a, 0.9); mpoly(g, [[x, by - 12], [x + s * 30, by - 36 - flap * 6], [x + s * 48, by - 12], [x + s * 16, by - 2]], a, 0.85);
      g.fillStyle(0x3a5a9a, 0.5); for (let k = 0; k < 3; k++) g.fillCircle(x + s * (22 + k * 8), by - 16 - k * 5 - flap * 5, 1.6);
    }
    const hx = x + 30 * f, hy = by - 22; // 人首
    g.fillStyle(0xe8c88a, 1); g.fillCircle(hx, hy, 11);
    g.fillStyle(0x8a6a2a, 1);
    for (let k = 0; k < 5; k++) { g.fillCircle(hx + Math.cos(Math.PI + (k / 4) * Math.PI) * 10, hy + Math.sin(Math.PI + (k / 4) * Math.PI) * 10, 3); } // 胡须
    g.fillStyle(0x5a3a1a, 1); g.fillEllipse(hx, hy - 10, 22, 10); // 发/帽
    g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx + 3 * f, hy - 2, 1.6);
    g.fillStyle(a, 0.95); mpoly(g, [[hx - 8, hy - 12], [hx - 12, hy - 22], [hx - 4, hy - 14]], a, 0.9);
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 2, 72, 10);
  } },
  cthShoggoth: { c: 0x1e5a4a, a: 0x7a4aa8, draw: (g, now, x, y, _f, c, a) => {
    // 修格斯：一坨软体坐骑，满身眼睛与触须
    const squish = 1 + Math.sin(now / 300) * 0.06;
    const by = y - 20;
    g.fillStyle(0x0e2a24, 0.95); g.fillEllipse(x, by, 76, 42 * squish);
    g.fillStyle(c, 0.95); g.fillEllipse(x, by - 2, 68, 36 * squish);
    g.fillStyle(a, 0.25); g.fillEllipse(x, by + 10, 50, 10);
    for (let k = 0; k < 7; k++) { // 触须
      const sx = x - 30 + k * 10;
      const sw = Math.sin(now / 400 + k) * 5;
      g.lineStyle(3.4 - (k % 2), 0x0e2a24, 0.95);
      g.beginPath(); g.moveTo(sx, by - 12); g.lineTo(sx + sw, by - 26); g.lineTo(sx + sw * 1.6, by - 36); g.strokePath();
      g.fillStyle(a, 0.85); g.fillCircle(sx + sw * 1.6, by - 36, 1.6);
    }
    for (let k = 0; k < 5; k++) { // 眼睛
      const ex = x - 22 + k * 11, ey = by - 4 + Math.sin(k * 2) * 5;
      const gl = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k));
      g.fillStyle(0xfff0a0, 0.95); g.fillEllipse(ex, ey, 7, 5);
      g.fillStyle(0x1a0e2e, 1); g.fillCircle(ex + Math.sin(now / 600 + k) * 1.5, ey, 2);
      g.fillStyle(a, gl); g.fillCircle(ex, ey, 1);
    }
    g.fillStyle(0x000000, 0.16); g.fillEllipse(x, y + 2, 80, 12);
  } },
};
