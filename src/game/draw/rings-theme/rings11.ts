import { TAU, type RingArt } from './shared';

/** 批十主题地环（电竞赛场 / 末日废土 / 星光偶像）。(x, feetY) 原点，地面基准 y = feetY - 3。 */
export const RINGS_11: Record<string, RingArt> = {
  esportRing: { c: 0x00e5ff, a: 0xff2e88, draw: (g, now, x, feetY, c, a) => {
    // 战场光圈：电竞场的对战光圈——双环 + 四方扫描线 + 中心准星 + 计分灯
    const ry = feetY - 3;
    const p1 = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(c, 0.14 + p1 * 0.05);
    g.fillEllipse(x, ry, 56, 17);
    g.lineStyle(2.6, c, 0.85);
    g.strokeEllipse(x, ry, 50, 15);
    g.lineStyle(1.2, a, 0.55);
    g.strokeEllipse(x, ry, 30, 9);
    for (let k = 0; k < 4; k++) { // 四方扫描线（向外的扫描角）
      const ang = (k / 4) * TAU + now / 1200;
      g.lineStyle(1.6, k % 2 ? a : c, 0.7);
      g.lineBetween(x + Math.cos(ang) * 14, ry + Math.sin(ang) * 4.2, x + Math.cos(ang) * 26, ry + Math.sin(ang) * 7.6);
    }
    // 中心准星（游走的锁定点）
    const lx = Math.cos(now / 600) * 8, ly = Math.sin(now / 600) * 2.4;
    g.lineStyle(1.4, 0xff5a5c, 0.9);
    g.lineBetween(x + lx - 3, ry + ly, x + lx + 3, ry + ly);
    g.lineBetween(x + lx, ry + ly - 1.6, x + lx, ry + ly + 1.6);
    for (let k = 0; k < 6; k++) { // 计分灯（环上红蓝交替计分点）
      const ang = (k / 6) * TAU + now / 1500;
      const bl = Math.abs(Math.sin(now / 240 + k));
      g.fillStyle(k % 2 ? a : c, bl);
      g.fillCircle(x + Math.cos(ang) * 25, ry + Math.sin(ang) * 6.6, 1.4);
    }
  } },
  wasteRing: { c: 0x8a7a5a, a: 0xff8a3c, draw: (g, now, x, feetY, _c, a) => {
    // 车辙地环：废土车辙环——双车辙线 + 碎石 + 辐射草 + 翻滚沙
    const ry = feetY - 3;
    g.fillStyle(0x6a5a3a, 0.35);
    g.fillEllipse(x, ry, 58, 18);
    // 双车辙线（两条平行弧）
    for (const off of [-5, 5]) {
      g.lineStyle(3, 0x4a4030, 0.85);
      g.strokeEllipse(x, ry + off * 0.4, 52, 14);
    }
    for (let k = 0; k < 6; k++) { // 碎石
      g.fillStyle(k % 2 ? 0x5a5040 : 0x7a6a4a, 0.9);
      g.fillCircle(x - 18 + k * 7 + (k % 2) * 2, ry + 3 - (k % 2) * 2, 1.6 - (k % 2) * 0.5);
    }
    for (let k = 0; k < 4; k++) { // 辐射草（枯黄小草摇曳）
      const gx = x - 15 + k * 10;
      const sway = Math.sin(now / 300 + k) * 1.4;
      g.lineStyle(1.2, 0x9a8a4a, 0.9);
      g.lineBetween(gx, ry + 2, gx + sway, ry - 5);
      g.lineBetween(gx + 1.4, ry + 2, gx + 1.4 + sway, ry - 4);
    }
    for (let k = 0; k < 3; k++) { // 翻滚沙
      const ph = (now / 600 + k / 3) % 1;
      g.fillStyle(0xc9a84a, 0.35 * (1 - ph));
      g.fillCircle(x - 24 + ph * 48, ry + 1 - ph * 5, 2.4 * (1 - ph) + 0.8);
    }
    const warn = Math.abs(Math.sin(now / 280)); // 辐射警示灯
    g.fillStyle(a, warn);
    g.fillCircle(x + 20, ry - 2, 1.4);
  } },
  idolRing: { c: 0x7ac8ff, a: 0xff9adf, draw: (g, now, x, feetY, c, a) => {
    // 荧光海地环：脚下荧光海应援环——荧光浪环 + 光棒阵 + 灯牌 + 星屑
    const ry = feetY - 3;
    g.fillStyle(c, 0.2);
    g.fillEllipse(x, ry, 56, 17);
    g.lineStyle(2.2, c, 0.8);
    g.strokeEllipse(x, ry, 50, 15);
    for (let k = 0; k < 6; k++) { // 环上荧光棒（摇动的小光棒）
      const ang = (k / 6) * TAU + now / 2000;
      const px = x + Math.cos(ang) * 23, py = ry + Math.sin(ang) * 6.2;
      const sway = Math.sin(now / 240 + k) * 0.3;
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas(ang + Math.PI / 2 + sway);
      g.fillStyle(k % 2 ? a : c, 0.9);
      g.fillRoundedRect(-1.2, -6, 2.4, 12, 1.2);
      g.fillStyle(0xffffff, 0.4);
      g.fillRect(-0.4, -4.4, 0.8, 7);
      g.restore();
      g.fillStyle(k % 2 ? a : c, 0.2);
      g.fillCircle(px, py, 4);
    }
    // 环心小灯牌（翻字灯牌）
    const on = Math.sin(now / 300) > -0.3 ? 1 : 0.35;
    g.fillStyle(0x1a1222, 0.9);
    g.fillRoundedRect(x - 7, ry - 3, 14, 7, 1.6);
    g.fillStyle(0xff5a8a, on * 0.9);
    g.fillRect(x - 5, ry - 1.4, 10, 3.4);
    g.fillStyle(0xffffff, on * 0.7);
    g.fillRect(x - 3, ry - 0.6, 6, 1.8);
    for (let k = 0; k < 5; k++) { // 星屑
      const ph = (now / 900 + k / 5) % 1;
      const tw = Math.abs(Math.sin(now / 220 + k * 1.8));
      g.fillStyle(0xffffff, tw * (1 - ph));
      g.fillCircle(x - 18 + (k * 9) % 36, ry - 4 - ph * 14, 1.1 * (1 - ph) + 0.4);
    }
  } },
};
