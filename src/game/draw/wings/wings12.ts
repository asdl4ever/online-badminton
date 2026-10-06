import { wpoly, TAU, type WingArt } from './shared';

/**
 * 批五主题背挂物件（武侠江湖 / 北欧神域）。
 * 全部 `single: true`：只画一次、不镜像、不随扇动旋转，动效在 painter 体内。
 */
export const WINGS_12: Record<string, WingArt> = {
  // ---- 武侠江湖 ----
  wxBackA: { c: 0xd8d8e0, a: 0x8a94a2, single: true, draw: (g, now, _flap, c, _a) => {
    // 背负长剑：斜负的剑鞘长剑——鞘身 + 剑柄缠绳 + 剑首坠穗 + 出鞘微光
    g.save();
    g.translateCanvas(-4, -6);
    g.rotateCanvas(-0.36 + Math.sin(now / 850) * 0.02);
    g.fillStyle(0x2a2a30, 1); // 剑鞘
    g.fillRect(-3, -20, 6, 56);
    g.fillStyle(0x3a3a42, 0.8);
    g.fillRect(-3, -20, 2.4, 56);
    for (let k = 0; k < 2; k++) { // 鞘箍
      g.fillStyle(0x8a94a2, 1);
      g.fillRect(-3.8, k === 0 ? -16 : 24, 7.6, 3);
    }
    g.fillStyle(0x1a1a20, 1); // 剑柄
    g.fillRect(-2, -34, 4, 14);
    g.lineStyle(1.2, c, 0.8); // 柄上缠绳
    for (let k = 0; k < 4; k++) g.lineBetween(-2, -33 + k * 3.4, 2, -31.6 + k * 3.4);
    g.fillStyle(c, 1); // 剑格
    g.fillRect(-4.4, -22, 8.8, 2.6);
    // 剑首坠穗（飘动的红穗）
    const sway = Math.sin(now / 380) * 2.4;
    g.lineStyle(1.6, 0xe8404a, 0.95);
    g.lineBetween(0, -34, sway, -42);
    g.fillStyle(0xe8404a, 0.9);
    g.fillCircle(sway, -43, 1.8);
    // 剑鞘口出鞘微光（一线寒光呼吸）
    const gl = 0.3 + 0.4 * Math.abs(Math.sin(now / 460));
    g.fillStyle(0xffffff, gl);
    g.fillRect(-3, -20, 6, 1.6);
    g.restore();
  } },
  wxBackB: { c: 0x8a5a2a, a: 0xd9b45c, single: true, draw: (g, now, _flap, c, _a) => {
    // 酒葫芦：腰间移到背后的酒葫芦——束腰葫芦 + 红绸封口 + 酒香醉雾
    const bob = Math.sin(now / 720) * 2.6;
    g.save();
    g.translateCanvas(-12, -4 + bob);
    g.rotateCanvas(Math.sin(now / 800) * 0.08);
    g.fillStyle(c, 1);
    g.fillEllipse(0, 7, 15, 18);
    g.fillEllipse(0, -7, 11, 12);
    g.fillStyle(0xa06a3a, 0.55);
    g.fillEllipse(-3, 4, 5, 10);
    g.fillEllipse(-2.4, -8, 3.4, 6);
    g.lineStyle(1.4, 0x6a4220, 0.9); // 腰箍
    g.strokeEllipse(0, 0, 12.4, 4);
    g.fillStyle(0xe8404a, 1); // 红绸封口
    g.fillEllipse(0, -13.4, 6, 3);
    const flap = Math.sin(now / 300) * 1.4;
    g.fillStyle(0xe8404a, 0.85);
    g.fillTriangle(-2, -14, 2.4, -14, flap, -19);
    g.restore();
    for (let k = 0; k < 3; k++) { // 酒香醉雾（歪歪扭扭上飘）
      const ph = (now / 1500 + k / 3) % 1;
      g.fillStyle(0xfff0d0, 0.35 * Math.sin(ph * Math.PI));
      g.fillCircle(-12 + Math.sin(ph * 7 + k * 2) * 6, -18 + bob - ph * 22, 1.8 * (1 - ph) + 0.5);
    }
  } },
  wxBackC: { c: 0xa06a3a, a: 0xd9b45c, single: true, draw: (g, now, _flap, c, a) => {
    // 焦尾古琴：背后横负的古琴——琴身 + 七弦 + 琴徽十三点 + 弦音涟漪
    const bob = Math.sin(now / 900) * 1.6;
    g.save();
    g.translateCanvas(-2, 0 + bob);
    g.rotateCanvas(-0.12);
    g.fillStyle(c, 1); // 琴身（长条微收）
    wpoly(g, [[-20, -5], [20, -4], [24, 5], [-16, 6]], c, 1);
    g.fillStyle(0x7a4a24, 0.6); // 琴面暗部
    wpoly(g, [[-16, 2], [20, 1], [22, 4], [-14, 5]], 0x7a4a24, 0.6);
    g.lineStyle(0.8, 0x3a2a18, 0.9); // 七弦
    for (let k = 0; k < 7; k++) g.lineBetween(-18, -2 + k * 1.2, 21, -2.6 + k * 1.2);
    for (let k = 0; k < 5; k++) { // 琴徽（发光的定位点）
      const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 500 + k));
      g.fillStyle(a, gl);
      g.fillCircle(-14 + k * 8, 0, 1);
    }
    g.restore();
    for (let k = 0; k < 2; k++) { // 弦音涟漪（周期扩散的细环）
      const ph = (now / 1600 + k / 2) % 1;
      g.lineStyle(1, a, 0.4 * (1 - ph));
      g.strokeCircle(-2, bob, 14 + ph * 22);
    }
  } },
  wxBackD: { c: 0x4a4a52, a: 0xe8b84a, single: true, draw: (g, now, _flap, c, _a) => {
    // 暗器囊：背后的暗器皮囊——囊体 + 束口 + 探出的镖刃 + 随手抛出的飞镖
    const bob = Math.sin(now / 640) * 1.8;
    g.save();
    g.translateCanvas(-10, 2 + bob);
    g.fillStyle(c, 1); // 囊体
    g.fillEllipse(0, 4, 16, 20);
    g.fillStyle(0x3a3a42, 0.7);
    g.fillEllipse(-3, 2, 6, 12);
    g.fillStyle(0x6a4a2a, 1); // 束口绳
    g.fillRect(-5, -6, 10, 2.4);
    for (let k = 0; k < 3; k++) { // 探出的镖刃（菱形镖）
      const px = -4 + k * 4;
      g.fillStyle(0xb8c0cc, 0.95);
      wpoly(g, [[px, -8], [px + 1.4, -12], [px + 2.8, -8], [px + 1.4, -5]], 0xb8c0cc, 0.95);
    }
    g.restore();
    for (let k = 0; k < 2; k++) { // 抛出的飞镖（绕体飞一圈）
      const ang = now / 700 + k * Math.PI;
      const px = Math.cos(ang) * 30, py = -6 + Math.sin(ang) * 18;
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas(ang * 2);
      g.fillStyle(0xb8c0cc, 0.9);
      wpoly(g, [[0, -4], [1.4, 0], [0, 4], [-1.4, 0]], 0xb8c0cc, 0.9);
      g.restore();
      g.lineStyle(1, 0xb8c0cc, 0.25); // 镖尾轨迹
      g.strokeCircle(0, -6 + bob, 30);
    }
  } },
  // ---- 北欧神域 ----
  norseBackA: { c: 0x8a94a2, a: 0xffe15c, single: true, draw: (g, now, _flap, c, a) => {
    // 背负雷锤：斜负的巨锤——短柄 + 方锤头 + 符文刻痕 + 锤头电弧
    g.save();
    g.translateCanvas(-6, -4);
    g.rotateCanvas(-0.3);
    g.fillStyle(0x6b4a2f, 1); // 短柄
    g.fillRect(-2.4, -14, 4.8, 40);
    g.fillStyle(0x8a6a3a, 0.6);
    g.fillRect(-2.4, -14, 1.8, 40);
    g.fillStyle(c, 1); // 方锤头
    g.fillRoundedRect(-14, -34, 28, 20, 3);
    g.fillStyle(0xb8c0cc, 0.5); // 锤面受光
    g.fillRect(-14, -34, 28, 6);
    for (let k = 0; k < 3; k++) { // 符文刻痕（电光明灭）
      const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 300 + k));
      g.fillStyle(a, gl);
      g.fillRect(-9 + k * 7, -28, 2, 9);
    }
    for (const s of [-1, 1]) { // 锤头电弧
      const j = Math.sin(now / 50 + s) * 3;
      g.lineStyle(1.2, a, 0.7);
      g.lineBetween(s * 14, -24, s * 20 + j, -30 + j);
    }
    g.restore();
  } },
  norseBackB: { c: 0x7de87d, a: 0xdff2ff, single: true, draw: (g, now, _flap, c, a) => {
    // 世界树枝：背后斜伸的一截神树枝桠——枝干 + 发光叶芽 + 坠落的露珠
    g.save();
    g.translateCanvas(-6, 0);
    g.rotateCanvas(-0.24 + Math.sin(now / 900) * 0.03);
    g.fillStyle(0x5a6a3a, 1); // 主枝
    wpoly(g, [[-3, 24], [-2, -20], [-8, -40], [-3, -38], [3, -16], [3, 24]], 0x5a6a3a, 1);
    g.fillStyle(0x7a8a4a, 0.7);
    wpoly(g, [[-3, 24], [-2, -20], [-8, -40], [-5, -38], [0, -16], [0, 24]], 0x7a8a4a, 0.6);
    // 分杈
    g.lineStyle(2.6, 0x5a6a3a, 1);
    g.lineBetween(-4, -18, -14, -30);
    g.lineBetween(-3, -28, 6, -38);
    for (const [bx, by] of [[-14, -30], [6, -38], [-7, -42]]) { // 枝端发光叶芽
      const gl = 0.5 + 0.4 * Math.sin(now / 380 + bx);
      g.fillStyle(c, gl);
      g.fillEllipse(bx, by, 7, 4);
      g.fillStyle(0xffffff, gl * 0.6);
      g.fillCircle(bx, by - 1, 1.2);
    }
    g.restore();
    for (let k = 0; k < 3; k++) { // 神树露珠（缓慢坠落）
      const ph = (now / 1800 + k / 3) % 1;
      g.fillStyle(a, 0.7 * Math.sin(ph * Math.PI));
      g.fillCircle(-12 + k * 10, -30 + ph * 44, 1.4);
    }
  } },
  norseBackC: { c: 0xb08a5a, a: 0x5ac8ff, single: true, draw: (g, now, _flap, c, a) => {
    // 纹章圆盾：背负的木纹圆盾——盾体 + 金属箍 + 中心纹章 + 盾缘战痕
    const bob = Math.sin(now / 780) * 1.6;
    g.save();
    g.translateCanvas(-8, -2 + bob);
    g.fillStyle(c, 0.95); // 盾体
    g.fillCircle(0, 0, 20);
    g.fillStyle(0x8a6a3a, 0.7); // 木纹（放射条纹）
    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * TAU + now / 4000;
      g.save();
      g.rotateCanvas(ang);
      g.fillRect(3, -1.4, 15, 2.8);
      g.restore();
    }
    g.lineStyle(2.4, 0x8a94a2, 1); // 金属箍
    g.strokeCircle(0, 0, 19);
    g.strokeCircle(0, 0, 10);
    g.fillStyle(0x8a94a2, 1); // 中心纹章（圆心铆钉 + 十字）
    g.fillCircle(0, 0, 5);
    g.fillStyle(a, 0.85);
    g.fillRect(-1.4, -8.4, 2.8, 16.8);
    g.fillRect(-8.4, -1.4, 16.8, 2.8);
    g.lineStyle(1.4, 0x4a3420, 0.8); // 战痕
    g.lineBetween(6, -14, 11, -10);
    g.lineBetween(-12, 8, -7, 12);
    g.restore();
  } },
  norseBackD: { c: 0x9fd8ff, a: 0xdff2ff, single: true, draw: (g, now, _flap, c, a) => {
    // 狼魂：绕体游弋的半透明狼影——狼形剪影 + 魂火眼 + 拖曳魂雾
    for (let k = 0; k < 2; k++) { // 两只狼魂错相绕行
      const ang = now / 1500 + k * Math.PI;
      const px = Math.cos(ang) * 34, py = -12 + Math.sin(ang) * 24;
      const dir = Math.cos(ang + Math.PI / 2) > 0 ? 1 : -1;
      g.save();
      g.translateCanvas(px, py);
      g.scaleCanvas(dir, 1);
      g.fillStyle(c, 0.4); // 狼身（奔跑剪影）
      wpoly(g, [[-10, 4], [-6, -2], [-2, -6], [4, -7], [9, -4], [12, -6], [10, -1], [12, 4], [7, 2], [3, 6], [-2, 6], [-7, 6]], c, 0.4);
      // 四条奔腿
      g.lineStyle(1.6, c, 0.4);
      for (let s = 0; s < 4; s++) {
        const lxp = -8 + s * 6;
        g.lineBetween(lxp, 4, lxp + Math.sin(now / 200 + s * 2) * 3, 9);
      }
      g.fillStyle(a, 0.9); // 魂火眼
      g.fillCircle(7, -5, 1.2);
      g.restore();
      // 拖曳魂雾
      for (let s = 1; s <= 3; s++) {
        const ta = ang - s * 0.14;
        g.fillStyle(c, 0.18 * (1 - s / 4));
        g.fillCircle(Math.cos(ta) * 34, -12 + Math.sin(ta) * 24, 4 * (1 - s / 4) + 1);
      }
    }
  } },
};
