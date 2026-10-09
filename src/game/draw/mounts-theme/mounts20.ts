import { mpoly, TAU, type MountArt } from './shared';

/** 第七批坐骑（纳米矩阵 / 数据洪流 / 曲速跃迁 / 火星殖民 / 先行者遗迹）——(x, y) = 地面基准，f = 朝向；造型放大 */

export const MOUNTS_20: Record<string, MountArt> = {
  nanoSwarmBoard: { c: 0x7fe8ff, a: 0x39ffd0, draw: (g, now, x, y, _f, c, a) => {
    // 纳米浮板：巨大的纳米粒聚合悬浮板，边缘粒子离散/聚合
    const bob = Math.sin(now / 320) * 3;
    const by = y - 10 + bob;
    g.fillStyle(a, 0.12); g.fillEllipse(x, by, 132, 26);
    g.fillStyle(0x0e2a30, 1); mpoly(g, [[x - 62, by - 6], [x + 62, by - 6], [x + 54, by + 12], [x - 54, by + 12]], 0x0e2a30, 1);
    g.fillStyle(c, 0.9); mpoly(g, [[x - 58, by - 4], [x + 58, by - 4], [x + 50, by + 10], [x - 50, by + 10]], c, 0.9);
    for (let k = 0; k < 9; k++) { const px = x - 50 + k * 12.5; const off = Math.sin(now / 260 + k) * 5; g.fillStyle(k % 2 ? a : c, 0.95); g.fillRect(px - 3, by - 14 + off, 6, 6); }
    g.fillStyle(0xffffff, 0.35); g.fillRect(x - 50, by - 2, 100, 2);
    for (let k = 0; k < 8; k++) { const ph = ((now / 700 + k / 8) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(x - 56 + (k * 15 % 112), by + 12 + ph * 14, 1.6); }
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 4, 120, 12);
  } },
  dataHoverPod: { c: 0x2a3a52, a: 0x4affc4, draw: (g, now, x, y, _f, c, a) => {
    // 数据悬浮舱：大悬浮舱，舱壁滚动数据、底部喷数据流柱
    const bob = Math.sin(now / 340) * 4;
    const by = y - 16 + bob;
    g.fillStyle(a, 0.14); g.fillEllipse(x, y - 4, 120, 22);
    g.fillStyle(0x101a28, 1); mpoly(g, [[x - 54, by - 16], [x + 54, by - 16], [x + 46, by + 16], [x - 46, by + 16]], 0x101a28, 1);
    g.fillStyle(c, 1); mpoly(g, [[x - 50, by - 13], [x + 50, by - 13], [x + 43, by + 13], [x - 43, by + 13]], c, 1);
    const scroll = (now / 500) % 1;
    for (let r = 0; r < 4; r++) { g.fillStyle(a, 0.5 + 0.5 * Math.abs(Math.sin(now / 300 + r))); g.fillRect(x - 40, by - 10 + r * 6, 80, 1.6); }
    for (let k = 0; k < 8; k++) { const px = x - 36 + ((k * 11 + scroll * 88) % 88); g.fillStyle(a, 0.8); g.fillRect(px, by - 12, 2.6, 4); }
    g.fillStyle(0x0a1620, 0.9); g.fillEllipse(x, by - 16, 60, 10);
    for (let k = 0; k < 4; k++) { const ph = ((now / 500 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillRect(x - 30 + k * 20, by + 16 + ph * 14, 4, 8 * (1 - ph)); }
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 4, 110, 12);
  } },
  warpSled: { c: 0x5a7aff, a: 0x9fd8ff, draw: (g, now, x, y, _f, c, a) => {
    // 曲速滑梭：流线型巨大跃迁滑梭，尾部喷星轨
    const bob = Math.sin(now / 300) * 3;
    const by = y - 14 + bob;
    g.fillStyle(0x0a0e24, 0.2); g.fillEllipse(x, y - 2, 150, 24);
    g.fillStyle(0x1a2450, 1); mpoly(g, [[x - 70, by - 12], [x + 30, by - 20], [x + 66, by - 4], [x + 30, by + 14], [x - 70, by + 12]], 0x1a2450, 1);
    g.fillStyle(c, 1); mpoly(g, [[x - 62, by - 8], [x + 26, by - 16], [x + 56, by - 3], [x + 26, by + 10], [x - 62, by + 8]], c, 1);
    g.fillStyle(0x9fd8ff, 0.6); mpoly(g, [[x - 20, by - 12], [x + 24, by - 14], [x + 32, by - 4], [x - 18, by - 5]], 0x9fd8ff, 0.6);
    g.fillStyle(a, 0.6 + 0.3 * Math.sin(now / 260)); g.fillCircle(x + 34, by - 2, 4);
    for (let k = 0; k < 6; k++) { const ph = ((now / 500 + k / 6) % 1); g.fillStyle(k % 2 ? a : 0xffffff, (1 - ph) * 0.8); g.fillRect(x - 70 - ph * 46, by - 6 + k % 3 * 4, 22, 2); }
    g.fillStyle(0x9fd8ff, 0.5); g.fillRect(x - 60, by + 6, 90, 2);
    g.fillStyle(0x000000, 0.13); g.fillEllipse(x, y + 4, 140, 12);
  } },
  marsRover: { c: 0xc0462a, a: 0xff7a4a, draw: (g, now, x, y, _f, c, a) => {
    // 火星探测车：六轮巨大探测车，太阳能板展开、天线转
    const by = y - 18;
    for (const wx of [-44, -26, 26, 44]) { g.fillStyle(0x3a2418, 1); g.fillCircle(x + wx, y - 4, 10); g.fillStyle(0x6a4a2a, 1); g.fillCircle(x + wx, y - 4, 6); g.fillStyle(0x2a1a10, 1); g.fillCircle(x + wx, y - 4, 2); }
    g.fillStyle(0x8a4a2a, 1); g.fillRoundedRect(x - 52, by - 12, 104, 26, 6);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 49, by - 10, 98, 22, 5);
    g.fillStyle(0x5a2418, 0.6); g.fillRect(x - 49, by + 4, 98, 4);
    // 太阳能板
    for (const s of [-1, 1]) { g.fillStyle(0x2a3a5a, 1); g.fillRect(x + s * 30 - 12, by - 34, 34, 12); g.fillStyle(0x4a6a9a, 1); for (let k = 0; k < 3; k++) g.fillRect(x + s * 30 - 12 + k * 12, by - 34, 9, 12); }
    g.lineStyle(3, 0x8a9298, 1); g.beginPath(); g.moveTo(x, by - 12); g.lineTo(x, by - 28); g.strokePath();
    const spin = now / 300; g.fillStyle(0xd8d0c0, 1); g.save(); g.translateCanvas(x, by - 30); g.rotateCanvas(spin); g.fillRect(-6, -1.4, 12, 2.8); g.restore();
    g.fillStyle(a, 0.9); g.fillCircle(x, by - 30, 2.6);
    for (let k = 0; k < 4; k++) { const ph = ((now / 700 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.6); g.fillCircle(x - 40 + k * 26, y - ph * 20, 1.6); }
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 2, 110, 12);
  } },
  forerDisc: { c: 0xa8e0ff, a: 0x5ad8ff, draw: (g, now, x, y, _f, c, a) => {
    // 先行者浮盘：反重力巨大浮盘，边缘符文循环、底部光柱
    const bob = Math.sin(now / 420) * 3;
    const by = y - 12 + bob;
    g.fillStyle(a, 0.12); g.fillEllipse(x, y - 2, 130, 24);
    g.fillStyle(0x16242e, 1); g.fillEllipse(x, by, 116, 30);
    g.fillStyle(c, 1); g.fillEllipse(x, by - 3, 106, 24);
    g.fillStyle(0x1a2836, 1); g.fillEllipse(x, by - 3, 40, 12);
    g.fillStyle(a, 0.6 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, by - 3, 26, 8);
    for (let k = 0; k < 14; k++) { const ang = (k / 14) * TAU + now / 2000; const px = x + Math.cos(ang) * 50, py = by + Math.sin(ang) * 12; g.fillStyle(k % 2 ? a : 0x2c3a4a, 0.95); g.fillRect(px - 2.6, py - 2.6, 5.2, 5.2); }
    for (let k = 0; k < 3; k++) { const ph = ((now / 600 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.5); g.fillEllipse(x, by + 14 + ph * 16, 60 - ph * 30, 6); }
    g.fillStyle(0x000000, 0.12); g.fillEllipse(x, y + 4, 120, 12);
  } },
};
