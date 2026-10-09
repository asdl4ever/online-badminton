import { mpoly, TAU, type MountArt } from './shared';

/** 第八批坐骑（冰海巨兽 / 极夜冰海 / 寒潮海象 / 维度裂隙 / 幽光深渊）——(x, y) = 地面基准，f = 朝向；造型放大 */

export const MOUNTS_21: Record<string, MountArt> = {
  glacWhale: { c: 0x5fd8ff, a: 0xbfe8ff, draw: (g, now, x, y, f, c, a) => {
    // 冰海鲸神：一头巨大冰鲸浮出海面，背脊驮着角色，喷出冰雾
    const bob = Math.sin(now / 460) * 3;
    const by = y - 6 + bob;
    g.fillStyle(0x0e2a3e, 0.3); g.fillEllipse(x, y + 4, 200, 26);
    g.fillStyle(0x2a6a8a, 1); mpoly(g, [[x - 78, by], [x + 40, by - 10], [x + 74, by + 26], [x + 20, by + 40], [x - 64, by + 26]], 0x2a6a8a, 1);
    g.fillStyle(c, 1); mpoly(g, [[x - 72, by + 2], [x + 36, by - 6], [x + 66, by + 24], [x + 18, by + 34], [x - 60, by + 24]], c, 1);
    g.fillStyle(0x8fd8ff, 0.6); mpoly(g, [[x - 60, by + 4], [x + 20, by + 2], [x + 14, by + 16], [x - 52, by + 18]], 0x8fd8ff, 0.6);
    // 腹褶
    for (let k = 0; k < 5; k++) { g.lineStyle(1.6, 0x8fd8ff, 0.5); g.lineBetween(x - 60 + k * 8, by + 20, x - 56 + k * 8, by + 30); }
    // 尾鳍
    const tw = Math.sin(now / 400) * 8;
    g.fillStyle(c, 1); mpoly(g, [[x + 70, by + 22], [x + 92 + tw, by + 2], [x + 96 + tw, by + 40], [x + 74, by + 34]], c, 1);
    // 头 + 眼 + 喷水
    const hx = x - 76 * f;
    g.fillStyle(c, 1); g.fillEllipse(hx, by + 12, 30, 22);
    g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx - 8 * f, by + 8, 2.4);
    for (let k = 0; k < 4; k++) { const ph = ((now / 900 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.6); g.fillCircle(x - 40 + Math.sin(k * 2) * 8, by - 12 - ph * 30, 2); }
    g.fillStyle(0xffffff, 0.5 + 0.3 * Math.sin(now / 400)); g.fillCircle(x - 40, by - 12, 3);
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 4, 190, 14);
  } },
  fridIceBoat: { c: 0x3a5a6a, a: 0x7dffd0, draw: (g, now, x, y, _f, c, a) => {
    // 破冰船：一艘巨大破冰船，探照灯扫、船身结冰
    const bob = Math.sin(now / 420) * 3;
    const by = y - 12 + bob;
    g.fillStyle(0x0a1c2e, 0.3); g.fillEllipse(x, y + 4, 210, 26);
    g.fillStyle(0x1a2a38, 1); mpoly(g, [[x - 84, by], [x + 70, by], [x + 84, by + 20], [x - 70, by + 20]], 0x1a2a38, 1);
    g.fillStyle(c, 1); mpoly(g, [[x - 80, by + 2], [x + 66, by + 2], [x + 78, by + 18], [x - 66, by + 18]], c, 1);
    g.fillStyle(0x8fb0c0, 0.5); g.fillRect(x - 80, by + 14, 152, 2);
    for (let k = 0; k < 8; k++) { g.fillStyle(k % 2 ? 0xbfe8ff : 0xe8f4ff, 0.85); g.fillEllipse(x - 66 + k * 18, by + 18, 12, 4); }
    // 船舱
    g.fillStyle(0x2a3a48, 1); g.fillRoundedRect(x - 20, by - 26, 50, 28, 3);
    g.fillStyle(0x4a5a68, 1); g.fillRoundedRect(x - 16, by - 22, 42, 22, 2);
    for (let k = 0; k < 4; k++) { const lit = 0.5 + 0.5 * Math.sin(now / 400 + k); g.fillStyle(a, lit); g.fillRect(x - 12 + k * 10, by - 18, 6, 6); }
    // 探照灯
    const sweep = Math.sin(now / 700) * 0.5;
    g.fillStyle(0xfff0b0, 0.7); g.fillRect(x - 22, by - 32, 6, 8);
    g.save(); g.translateCanvas(x - 19, by - 30); g.rotateCanvas(sweep); g.fillStyle(0xfff0b0, 0.12); g.fillPoints([{ x: 0, y: 0 }, { x: -50, y: -18 }, { x: -50, y: 18 }] as never, true); g.restore();
    g.fillStyle(0x6a7a88, 1); g.fillRect(x - 2, by - 46, 4, 22);
    g.fillStyle(0x000000, 0.13); g.fillEllipse(x, y + 4, 200, 14);
  } },
  walrWalrus: { c: 0x8a705a, a: 0xd8e8f0, draw: (g, now, x, y, f, c, a) => {
    // 海象坐骑：一头巨大海象，长牙、胡须、拍鳍
    const by = y - 24;
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 3, 90, 12);
    for (const [lx, ph] of [[-30, 0], [-10, Math.PI], [12, Math.PI], [32, 0]] as Array<[number, number]>) { const stp = Math.sin(now / 320 + ph) * 3; g.fillStyle(0x6a5442, 1); g.fillRoundedRect(x + lx - 5 + stp, by + 16, 10, y - by - 20, 4); }
    g.fillStyle(0x6a5442, 1); mpoly(g, [[x - 40, by + 12], [x + 38, by + 12], [x + 34, by - 16], [x - 36, by - 16]], 0x6a5442, 1);
    g.fillStyle(c, 1); mpoly(g, [[x - 36, by + 9], [x + 34, by + 9], [x + 30, by - 13], [x - 32, by - 13]], c, 1);
    for (let k = 0; k < 8; k++) { g.fillStyle(k % 2 ? 0x5a4436 : 0x7a6450, 0.7); g.fillEllipse(x - 30 + (k * 17 % 60), by - 4 + Math.floor(k / 4) * 12, 4, 3); }
    // 头 + 长牙 + 胡须
    const hx = x + 34 * f, hy = by - 12;
    g.fillStyle(c, 1); g.fillEllipse(hx, hy, 22, 18);
    g.fillStyle(0xd8e8f0, 1); g.fillPoints([{ x: hx + 4 * f, y: hy + 6 }, { x: hx + 6 * f, y: hy + 6 }, { x: hx + 10 * f, y: hy + 26 }] as never, true);
    g.fillPoints([{ x: hx - 2 * f, y: hy + 6 }, { x: hx + 0 * f, y: hy + 6 }, { x: hx + 3 * f, y: hy + 24 }] as never, true);
    for (let k = 0; k < 5; k++) { g.lineStyle(1, 0xe8e0d0, 0.8); g.lineBetween(hx + 6 * f, hy + 4, hx + 14 * f, hy + 2 + k * 2); g.lineBetween(hx + 6 * f, hy + 5, hx + 14 * f, hy + 7 + k * 2); }
    g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx + 4 * f, hy - 4, 2);
    const fl = Math.sin(now / 500) * 3; g.fillStyle(c, 1); g.fillPoints([{ x: x + 20 * f, y: by + 8 }, { x: x + 44 * f, y: by + 20 + fl }, { x: x + 22 * f, y: by + 26 }] as never, true);
    void a;
  } },
  dimRift: { c: 0xb08aff, a: 0x7dffd0, draw: (g, now, x, y, _f, c, a) => {
    // 维度裂隙：脚下撕开一道悬浮的维度裂隙，角色踏在裂隙边缘
    const bob = Math.sin(now / 400) * 3;
    const by = y - 8 + bob;
    g.fillStyle(a, 0.16); g.fillEllipse(x, y + 4, 200, 28);
    g.fillStyle(0x05040f, 0.9); mpoly(g, [[x - 84, by], [x + 84, by], [x + 64, by + 20], [x - 64, by + 20]], 0x05040f, 0.9);
    for (let k = 0; k < 3; k++) { const off = now / 400 + k * 2.1; g.lineStyle(2, c, 0.6); g.beginPath(); for (let s = 0; s <= 10; s++) { const u = s / 10; const ang = off + u * 4; const rr = u * 70; g.lineTo(x + Math.cos(ang) * rr, by + 10 + Math.sin(ang) * rr * 0.2); } g.strokePath(); }
    g.lineStyle(3, c, 0.7 + 0.3 * Math.sin(now / 300)); g.lineBetween(x - 84, by, x - 64, by + 20); g.lineBetween(x + 84, by, x + 64, by + 20);
    for (let k = 0; k < 10; k++) { const px = x - 80 + k * 17; const on = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k)); g.fillStyle(k % 2 ? a : c, on); g.fillRect(px - 3, by - 2, 6, 4); }
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU + now / 1600; g.fillStyle(a, 0.8); g.fillRect(x + Math.cos(ang) * 60 - 2, by - 10 + Math.sin(ang) * 20 - 2, 4, 4); }
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 4, 190, 14);
  } },
  hadalAngler: { c: 0x2a6a6a, a: 0x39ffd0, draw: (g, now, x, y, f, c, a) => {
    // 巨口鮟鱇坐骑：一头巨大鮟鱇，头顶挑灯、巨口大张
    const bob = Math.sin(now / 440) * 3;
    const by = y - 22 + bob;
    g.fillStyle(0x06141e, 0.35); g.fillEllipse(x, y + 4, 190, 26);
    g.fillStyle(0x0e2830, 1); mpoly(g, [[x - 66, by + 6], [x + 44, by - 4], [x + 66, by + 22], [x - 40, by + 34]], 0x0e2830, 1);
    g.fillStyle(c, 1); mpoly(g, [[x - 60, by + 8], [x + 40, by - 1], [x + 58, by + 20], [x - 36, by + 30]], c, 1);
    g.fillStyle(0x1a3a3a, 0.6); for (let k = 0; k < 6; k++) { g.fillCircle(x - 40 + (k * 13 % 50), by + 8 + Math.floor(k / 4) * 10, 2.4); }
    // 巨口
    const open = 0.5 + 0.5 * Math.sin(now / 500);
    const hx = x + 46 * f;
    g.fillStyle(0x0e2830, 1); g.fillPoints([{ x: hx - 8 * f, y: by - 6 }, { x: hx + 12 * f, y: by - 4 - open * 6 }, { x: hx + 10 * f, y: by + 6 }] as never, true);
    g.fillStyle(0x0e2830, 1); g.fillPoints([{ x: hx - 8 * f, y: by + 16 }, { x: hx + 12 * f, y: by + 14 + open * 6 }, { x: hx + 10 * f, y: by + 6 }] as never, true);
    g.fillStyle(0x06141e, 1); g.fillEllipse(hx + 2 * f, by + 6, 18, 8 + open * 8);
    for (let k = 0; k < 5; k++) { g.fillStyle(0xe8f4f8, 0.95); g.fillTriangle(hx - 6 * f + k * 3 * f, by + 2, hx + 2 * f + k * 3 * f, by + 2, hx - 2 * f + k * 3 * f, by + 8); }
    g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx - 6 * f, by - 8, 2.4);
    // 头顶挑灯
    g.lineStyle(3, c, 1); g.beginPath(); g.moveTo(x - 4, by - 6); g.lineTo(x + 6, by - 34); g.strokePath();
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(a, 0.35 * gl); g.fillCircle(x + 6, by - 36, 14);
    g.fillStyle(a, gl); g.fillCircle(x + 6, by - 36, 5.4);
    g.fillStyle(0xffffff, 0.9 * gl); g.fillCircle(x + 6, by - 36, 2);
    // 尾鳍
    const tw = Math.sin(now / 400) * 8;
    g.fillStyle(c, 1); mpoly(g, [[x - 62, by + 6], [x - 84 + tw, by - 6], [x - 86 + tw, by + 24], [x - 66, by + 24]], c, 1);
    void f;
  } },
};
