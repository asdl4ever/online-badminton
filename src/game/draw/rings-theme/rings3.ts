import { rpoly, TAU, type RingArt } from './shared';

/** 新批次主题地环（上古神话 / 重装机甲）。(x, feetY) 原点，地面基准 y = feetY - 3。 */
export const RINGS_3: Record<string, RingArt> = {
  shnRing: { c: 0xffd45c, a: 0xd9b45c, draw: (g, now, x, feetY, c, a) => {
    // 山河社稷环：脚下微缩山河——环内山影 / 水波 / 双鱼游动
    const ry = feetY - 3;
    g.fillStyle(c, 0.28);
    g.fillEllipse(x, ry, 52, 15);
    g.lineStyle(2, a, 0.7);
    g.strokeEllipse(x, ry, 48, 13);
    g.fillStyle(0x2a4a6a, 0.75); // 环内山影
    rpoly(g, [[x - 16, ry - 1], [x - 8, ry - 9], [x - 1, ry - 1]], 0x2a4a6a, 0.8);
    rpoly(g, [[x - 4, ry - 1], [x + 6, ry - 11], [x + 15, ry - 1]], 0x2a4a6a, 0.8);
    g.fillStyle(0x5a9ad4, 0.5); // 水波
    for (let k = 0; k < 3; k++) {
      const wx = x - 14 + ((now / 30 + k * 12) % 30);
      g.fillEllipse(wx, ry + 3 - (k % 2), 7, 1.6);
    }
    for (const s of [-1, 1]) { // 双鱼游动（绕环）
      const ang = now / 900 * s + (s > 0 ? 0 : Math.PI);
      const px = x + Math.cos(ang) * 22, py = ry + Math.sin(ang) * 4.4;
      g.fillStyle(s > 0 ? 0xd93a5a : 0x1a1a22, 0.95);
      g.fillEllipse(px, py, 6, 3);
      g.fillStyle(0xffffff, 0.7);
      g.fillCircle(px + s * 1.6, py - 0.6, 0.5);
    }
    for (let k = 0; k < 4; k++) { // 环上灵珠
      const ang = now / 700 + (k / 4) * TAU;
      g.fillStyle(0xfff0b0, 0.9);
      g.fillCircle(x + Math.cos(ang) * 24, ry + Math.sin(ang) * 5, 1.8);
    }
  } },
  mcaRing: { c: 0x5ac8ff, a: 0xffe15c, draw: (g, now, x, feetY, c, a) => {
    // 着陆光圈：科幻着陆垫——同心环 + 刻度 + 悬浮尘埃上浮 + 警示灯
    const ry = feetY - 3;
    const p1 = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(c, 0.14 + p1 * 0.06);
    g.fillEllipse(x, ry, 56, 17);
    g.lineStyle(2.4, c, 0.7);
    g.strokeEllipse(x, ry, 50, 15);
    g.lineStyle(1.2, a, 0.5);
    g.strokeEllipse(x, ry, 34, 10);
    for (let k = 0; k < 8; k++) { // 环上刻度
      const ang = (k / 8) * TAU + now / 1500;
      const px = x + Math.cos(ang) * 25, py = ry + Math.sin(ang) * 6.4;
      g.fillStyle(k % 2 ? a : c, 0.8);
      g.fillRect(px - 1.4, py - 0.5, 2.8, 1);
    }
    for (let k = 0; k < 4; k++) { // 悬浮尘埃（反重力上浮）
      const ph = (now / 900 + k / 4) % 1;
      g.fillStyle(0xffffff, 0.6 * (1 - ph));
      g.fillCircle(x - 16 + k * 11 + Math.sin(ph * 4 + k) * 3, ry - ph * 30, 1.4 * (1 - ph) + 0.4);
    }
    for (const s of [-1, 1]) { // 警示灯交替
      const bl = Math.abs(Math.sin(now / 300 + (s > 0 ? 0 : Math.PI / 2)));
      g.fillStyle(s > 0 ? 0xff5a5a : a, bl);
      g.fillCircle(x + s * 22, ry - 1, 1.8);
    }
  } },
};
