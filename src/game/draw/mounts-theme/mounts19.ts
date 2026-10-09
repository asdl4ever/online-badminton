import { mpoly, type MountArt } from './shared';

/** 第六批坐骑（斯拉夫 / 波斯 / 印加 / 波利尼西亚 / 澳洲梦幻时代）——(x, y) = 地面基准，f = 朝向 */

export const MOUNTS_19: Record<string, MountArt> = {
  slavMortar: { c: 0x6a4a2a, a: 0x7dff6a, draw: (g, now, x, y, _f, c, a) => {
    // 飞天研钵：会飞的巨木研钵，臼杵作桨、绿烟轨
    const bob = Math.sin(now / 360) * 3;
    const by = y - 22 + bob;
    g.fillStyle(0x3a2814, 1); mpoly(g, [[x - 30, by - 14], [x + 30, by - 14], [x + 22, by + 18], [x - 22, by + 18]], 0x3a2814, 1);
    g.fillStyle(c, 1); mpoly(g, [[x - 27, by - 12], [x + 27, by - 12], [x + 20, by + 15], [x - 20, by + 15]], c, 1);
    g.fillStyle(0x1a3a1a, 0.5); g.fillEllipse(x, by - 10, 44, 8);
    g.fillStyle(a, 0.3); g.fillEllipse(x, by - 10, 40, 6);
    for (const s of [-1, 1]) { const sw = Math.sin(now / 360 + (s > 0 ? 0 : Math.PI)); g.lineStyle(6, c, 1); g.beginPath(); g.moveTo(x + s * 18, by - 14); g.lineTo(x + s * (34 + sw * 10), by - 30); g.strokePath(); g.fillStyle(0x8a6a3a, 1); g.fillCircle(x + s * (34 + sw * 10), by - 32, 5); }
    for (let k = 0; k < 5; k++) { const ph = ((now / 700 + k / 5) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(x - 24 + (k * 17 % 48), by + 18 - ph * 20, 1.6); }
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 2, 62, 10);
  },
    front: (g, now, x, y, _f, c, a) => {
      // 近侧钵口内壁 + 前缘：压住腿脚，读作「人坐在研钵里」
      const bob = Math.sin(now / 360) * 3;
      const by = y - 22 + bob;
      g.fillStyle(0x3a2814, 1); mpoly(g, [[x - 22, by + 2], [x + 22, by + 2], [x + 18, by + 18], [x - 18, by + 18]], 0x3a2814, 1);
      g.fillStyle(c, 1); mpoly(g, [[x - 20, by + 3], [x + 20, by + 3], [x + 16, by + 16], [x - 16, by + 16]], c, 1);
      g.fillStyle(a, 0.28); g.fillEllipse(x, by + 3, 34, 6);
    } },
  persCarpet: { c: 0x8a2a3a, a: 0xffd45c, draw: (g, now, x, y, _f, c, a) => {
    // 飞天魔毯：四角卷起的波斯纹飞毯，毯纹滚动、毯下星屑
    const bob = Math.sin(now / 320) * 3;
    const by = y - 16 + bob;
    g.fillStyle(0x5a1a24, 1); mpoly(g, [[x - 44, by], [x + 44, by], [x + 36, by + 12], [x - 36, by + 12]], 0x5a1a24, 1);
    g.fillStyle(c, 1); mpoly(g, [[x - 40, by + 1], [x + 40, by + 1], [x + 33, by + 10], [x - 33, by + 10]], c, 1);
    const roll = (now / 1200) % 1;
    for (let k = 0; k < 4; k++) { const px = x - 30 + ((k + roll) % 4) * 20; g.fillStyle(a, 0.9); g.fillRect(px, by + 2, 4, 7); }
    for (const s of [-1, 1]) { const cw = Math.sin(now / 300 + (s > 0 ? 0 : Math.PI)) * 4; g.fillStyle(0xfff0d0, 0.7); mpoly(g, [[x + s * 40, by], [x + s * 46, by - 6 + cw], [x + s * 44, by + 10]], 0xfff0d0, 0.7); }
    g.fillStyle(0xfff0d0, 0.8); for (let k = 0; k < 5; k++) { g.fillRect(x - 40 + k * 8, by + 10, 4, 4); }
    for (let k = 0; k < 6; k++) { const ph = ((now / 800 + k / 6) % 1); g.fillStyle(k % 2 ? a : 0xffffff, (1 - ph) * 0.7); g.fillCircle(x - 34 + (k * 13 % 68), by + 14 + ph * 14, 1.4); }
    g.fillStyle(0x000000, 0.13); g.fillEllipse(x, y + 2, 70, 10);
  } },
  incaAlpaca: { c: 0xffd45c, a: 0xc0392b, draw: (g, now, x, y, f, c, a) => {
    // 黄金羊驼：披彩织毯的羊驼，四蹄踏金环、驼铃晃
    const by = y - 30;
    for (const [lx, ph] of [[-22, 0], [-8, Math.PI], [8, Math.PI], [22, 0]] as Array<[number, number]>) {
      const stp = Math.sin(now / 300 + ph) * 3;
      g.fillStyle(0xc8a850, 1); g.fillRoundedRect(x + lx - 3 + stp, by + 10, 6, y - by - 14, 2.5);
      g.fillStyle(0xffd45c, 0.5); g.fillEllipse(x + lx + stp, y - 3, 10, 4);
    }
    g.fillStyle(0xd8b45a, 1); mpoly(g, [[x - 26, by + 8], [x + 24, by + 8], [x + 20, by - 14], [x - 22, by - 14]], 0xd8b45a, 1);
    g.fillStyle(c, 1); mpoly(g, [[x - 23, by + 5], [x + 21, by + 5], [x + 17, by - 11], [x - 19, by - 11]], c, 1);
    // 彩织毯
    for (let k = 0; k < 4; k++) { g.fillStyle(k % 2 ? a : 0x5a8aff, 0.85); g.fillRect(x - 20 + k * 10, by - 6, 6, 9); }
    g.fillStyle(a, 0.9); g.fillRect(x - 20, by - 1, 40, 3);
    const hx = x + 26 * f, hy = by - 18;
    g.fillStyle(c, 1); g.fillEllipse(hx, hy, 13, 16);
    g.fillStyle(c, 1); g.fillTriangle(hx - 4, hy - 8, hx + 1, hy - 16, hx + 4, hy - 8);
    g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx + 3 * f, hy - 1, 1.6);
    g.lineStyle(2, a, 0.9); g.beginPath(); g.moveTo(hx - 2, hy + 6); g.lineTo(hx - 4 + Math.sin(now / 300) * 2, hy + 12); g.strokePath();
    g.fillStyle(a, 0.95); g.fillCircle(hx - 4, hy + 13, 2.4);
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 2, 66, 10);
  },
    front: (g, now, x, y, _f, _c, a) => {
      // 近侧前腿 + 前胸下沿：压住腿，读作「骑在羊驼上」
      const by = y - 30;
      for (const [lx, ph] of [[-8, Math.PI], [8, Math.PI]] as Array<[number, number]>) {
        const stp = Math.sin(now / 300 + ph) * 3;
        g.fillStyle(0xc8a850, 1); g.fillRoundedRect(x + lx - 3 + stp, by + 10, 6, y - by - 14, 2.5);
      }
      g.fillStyle(0xd8b45a, 1); mpoly(g, [[x - 20, by - 2], [x + 20, by - 2], [x + 16, by + 12], [x - 16, by + 12]], 0xd8b45a, 1);
      g.fillStyle(a, 0.9); g.fillRect(x - 20, by + 1, 40, 3);
    } },
  polyCanoe: { c: 0x8a5a2a, a: 0xffe0b0, draw: (g, now, x, y, f, c, a) => {
    // 远洋独木舟：雕纹舟破浪，船首提基图腾、两侧船桨翻浪
    const bob = Math.sin(now / 300) * 3;
    const by = y - 12 + bob;
    g.fillStyle(0x5a3a1a, 1); mpoly(g, [[x - 48, by], [x + 48, by], [x + 38, by + 16], [x - 38, by + 16]], 0x5a3a1a, 1);
    g.fillStyle(c, 1); mpoly(g, [[x - 44, by + 2], [x + 44, by + 2], [x + 34, by + 14], [x - 34, by + 14]], c, 1);
    for (let k = 0; k < 6; k++) { g.fillStyle(0xfff0d0, 0.7); g.fillCircle(x - 30 + k * 12, by + 8, 1.6); }
    // 船首提基
    const tx = x + 46 * f;
    g.fillStyle(0x6a4a24, 1); g.fillRoundedRect(tx - 5, by - 14, 10, 16, 3);
    g.fillStyle(a, 0.95); g.fillCircle(tx - 2, by - 8, 1.4); g.fillCircle(tx + 2, by - 8, 1.4);
    g.fillStyle(0x2a1a0a, 1); g.fillRect(tx - 3, by - 3, 6, 3);
    for (const s of [-1, 1]) { const sw = Math.sin(now / 280 + (s > 0 ? 0 : Math.PI)); g.lineStyle(4, 0x8a6a3a, 1); g.beginPath(); g.moveTo(x + s * 20, by); g.lineTo(x + s * (30 + sw * 14), by + 20); g.strokePath(); }
    for (const s of [-1, 1]) { g.fillStyle(0xdff6ff, 0.6); g.fillEllipse(x + s * 40, by + 16, 14, 6); }
    g.fillStyle(0x000000, 0.13); g.fillEllipse(x, y + 2, 78, 10);
  },
    front: (g, now, x, y, _f, c, _a) => {
      // 近侧船帮 + 近侧船桨：压住腿，读作「人坐在独木舟里」
      const bob = Math.sin(now / 300) * 3;
      const by = y - 12 + bob;
      g.fillStyle(0x5a3a1a, 1); g.fillRoundedRect(x - 40, by + 6, 80, 8, 3);
      g.fillStyle(c, 1); g.fillRoundedRect(x - 38, by + 7, 76, 6, 3);
      const sw = Math.sin(now / 280 + Math.PI);
      g.lineStyle(4, 0x8a6a3a, 1); g.beginPath(); g.moveTo(x + 18, by); g.lineTo(x + 30 + sw * 14, by + 22); g.strokePath();
      g.fillStyle(0xfff0d0, 0.7); for (let k = 0; k < 6; k++) g.fillCircle(x - 30 + k * 12, by + 9, 1.4);
    } },
  auzKangaroo: { c: 0xc0703a, a: 0xffd45c, draw: (g, now, x, y, _f, c, a) => {
    // 图腾袋鼠：满身点画的巨型袋鼠，长尾随跳摆、育儿袋透光
    const hop = Math.abs(Math.sin(now / 340)) * 6;
    const by = y - 34 - hop;
    const tw = Math.sin(now / 320) * 5;
    g.lineStyle(7, 0x8a4a26, 1); g.beginPath(); g.moveTo(x - 16, by + 14); g.lineTo(x - 40, by + 30 + tw); g.strokePath();
    g.fillStyle(c, 1); g.fillEllipse(x, by, 32, 26);
    g.fillStyle(0x8a4a26, 1); g.fillEllipse(x - 2, by + 12, 22, 16);
    for (let k = 0; k < 8; k++) { g.fillStyle(a, 0.7); g.fillCircle(x - 12 + (k * 11 % 24), by - 8 + Math.floor(k / 3) * 10, 1.6); }
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(a, 0.5 * gl); g.fillEllipse(x - 4, by + 8, 10, 8);
    const hx = x + 12, hy = by - 22;
    g.fillStyle(c, 1); g.fillEllipse(hx, hy, 12, 18);
    g.fillStyle(c, 1); g.fillEllipse(hx + 4, hy - 12, 9, 8);
    g.fillStyle(0x1a1a16, 1); g.fillCircle(hx + 6, hy - 13, 1.4);
    g.fillStyle(c, 1); g.fillTriangle(hx + 2, hy - 18, hx + 10, hy - 20, hx + 4, hy - 24);
    g.fillTriangle(hx - 4, hy - 18, hx - 10, hy - 22, hx - 4, hy - 24);
    for (const s of [-1, 1]) { g.fillStyle(0x8a4a26, 1); g.fillRoundedRect(x + s * 6 - 3, by + 18, 6, y - by - 22, 2.5); }
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 2, 60, 10);
  },
    front: (g, now, x, y, _f, _c, a) => {
      // 近侧前腿 + 腹部点画：压住腿，读作「骑在图腾袋鼠上」
      const hop = Math.abs(Math.sin(now / 340)) * 6;
      const by = y - 34 - hop;
      for (const s of [-1, 1]) { g.fillStyle(0x8a4a26, 1); g.fillRoundedRect(x + s * 6 - 3, by + 16, 6, y - by - 20, 2.5); }
      g.fillStyle(0x8a4a26, 1); g.fillEllipse(x - 2, by + 12, 22, 14);
      for (let k = 0; k < 5; k++) { g.fillStyle(a, 0.6); g.fillCircle(x - 10 + (k * 9 % 20), by + 8 + (k % 2) * 8, 1.4); }
    } },
};
