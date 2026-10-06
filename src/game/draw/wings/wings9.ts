import { wpoly, wline, type WingArt } from './shared';

/** 新批次主题翅膀（上古神话 / 重装机甲）。只画右翼，左翼由入口镜像。 */
export const WINGS_9: Record<string, WingArt> = {
  shnWingA: { c: 0xffd0e8, a: 0xffd45c, draw: (g, now, flap, c, a) => {
    // 霓裳羽翼：仙气霓裳羽（层叠羽片 + 流光 + 羽尖金饰），随挥动飘
    const f = flap * 6;
    wpoly(g, [[2, 4], [26, -36 - f], [56, -54 - f], [82, -44 - f], [60, -6], [32, 8]], c, 0.55);
    wpoly(g, [[8, 2], [30, -28 - f], [56, -44 - f], [72, -34 - f], [52, 0]], 0xffffff, 0.45);
    for (let k = 0; k < 5; k++) { // 羽片
      const t0 = 0.15 + k * 0.17;
      const bx = 8 + t0 * 60, by = -8 - t0 * (40 + f);
      g.fillStyle(k % 2 ? 0xffe4f0 : c, 0.85);
      g.fillEllipse(bx, by, 16, 6);
    }
    const tw = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(a, tw * 0.8); // 羽尖金饰
    g.fillCircle(80, -40 - f, 2.4);
    g.fillCircle(64, -50 - f, 2);
    wline(g, [[2, 4], [26, -36 - f], [56, -54 - f], [82, -44 - f]], 1.6, a, 0.8);
  } },
  shnWingB: { c: 0xd8384a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
    // 混天绫翼：一条翻卷的红绫成翼形，绸面波动 + 金纹
    const f = flap * 7;
    g.fillStyle(c, 0.85);
    g.beginPath();
    g.moveTo(4, 10);
    for (let s = 1; s <= 10; s++) {
      const u = s / 10;
      g.lineTo(4 + u * 76, 8 - u * (54 + f) - Math.sin(u * 6 + now / 300) * 7);
    }
    for (let s = 10; s >= 0; s--) {
      const u = s / 10;
      g.lineTo(4 + u * 76, 16 - u * (48 + f) - Math.sin(u * 6 + now / 300 + 1.2) * 7);
    }
    g.closePath(); g.fillPath();
    g.fillStyle(0xff6a7a, 0.5);
    g.beginPath();
    for (let s = 0; s <= 10; s++) {
      const u = s / 10;
      const px = 4 + u * 76;
      const py = 8 - u * (54 + f) - Math.sin(u * 6 + now / 300) * 7;
      if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    for (let s = 10; s >= 0; s--) {
      const u = s / 10;
      g.lineTo(4 + u * 76, 12 - u * (50 + f) - Math.sin(u * 6 + now / 300 + 0.6) * 7);
    }
    g.closePath(); g.fillPath();
    g.lineStyle(1.4, a, 0.7); // 金纹
    g.beginPath();
    for (let s = 0; s <= 10; s++) {
      const u = s / 10;
      const px = 8 + u * 68;
      const py = 10 - u * (46 + f) - Math.sin(u * 6 + now / 300 + 0.6) * 7;
      if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.strokePath();
    const tw = 0.5 + 0.5 * Math.sin(now / 260);
    g.fillStyle(a, tw * 0.9);
    g.fillCircle(78, -40 - f * 0.8, 2.2);
  } },
  mcaWingA: { c: 0x5ac8ff, a: 0xffe15c, draw: (g, now, flap, c, a) => {
    // 矢量喷射翼：硬边矢量喷翼（喷口 + 尾焰 + 编队灯）
    const f = flap * 3;
    wpoly(g, [[2, 6], [10, -18], [46, -40 - f], [82, -36 - f], [58, -6], [26, 10]], 0x3a4f62, 0.95);
    wpoly(g, [[8, 4], [16, -14], [44, -32 - f], [68, -30 - f], [50, -4]], c, 0.5);
    g.fillStyle(0x22303e, 1); // 喷口
    g.fillEllipse(30, -22 - f * 0.5, 8, 5);
    g.fillEllipse(58, -30 - f * 0.6, 8, 5);
    for (let k = 0; k < 2; k++) { // 尾焰
      const jet = 10 + Math.abs(Math.sin(now / 70 + k * 2)) * 8;
      const px = [30, 58][k], py = [-22, -30][k] - f * (0.5 + k * 0.1);
      g.fillStyle(0xff8a3a, 0.8);
      g.fillTriangle(px - 3, py + 2, px + 3, py + 2, px, py + 2 + jet);
      g.fillStyle(0xffe15c, 0.9);
      g.fillTriangle(px - 1.6, py + 2, px + 1.6, py + 2, px, py + 2 + jet * 0.55);
    }
    for (let k = 0; k < 3; k++) { // 编队灯
      const bl = Math.abs(Math.sin(now / 200 + k * 2));
      g.fillStyle(k % 2 ? 0xff5a5a : a, bl);
      g.fillCircle(16 + k * 22, -14 - k * 8 - f * 0.3, 1.6);
    }
  } },
  mcaWingB: { c: 0x9aa7b8, a: 0xff3bd4, draw: (g, now, flap, _c, a) => {
    // 纳米刃翼：三片纳米刃瓣展开 + 发光刃缘 + 粒子渗漏
    const f = flap * 4;
    for (let k = 0; k < 3; k++) {
      const ang = -1.35 + k * 0.38 + Math.sin(now / 400 + k) * 0.05;
      g.save();
      g.translateCanvas(4, 2);
      g.rotateCanvas(ang + Math.PI / 2);
      wpoly(g, [[-4, -10], [4, -10], [3, -44 - f * 0.2 - k * 4], [0, -52 - f * 0.2 - k * 4], [-3, -44 - f * 0.2 - k * 4]], 0x5a6472, 0.95);
      g.lineStyle(1.6, a, 0.75 + 0.25 * Math.sin(now / 180 + k));
      g.lineBetween(0, -12, 0, -50 - f * 0.2 - k * 4); // 刃缘发光
      g.restore();
    }
    for (let k = 0; k < 4; k++) {
      const ph = (now / 500 + k / 4) % 1;
      g.fillStyle(a, 0.7 * (1 - ph));
      g.fillCircle(14 + k * 14 + Math.sin(ph * 4 + k) * 3, -30 - f * 0.4 - ph * 16, 1.6 * (1 - ph) + 0.4);
    }
  } },
};
