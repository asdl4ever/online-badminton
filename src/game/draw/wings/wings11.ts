import { wpoly, TAU, type WingArt } from './shared';

/**
 * 批四主题背挂物件（西游降魔 / 三国烽火）。
 * 全部 `single: true`：只画一次、不镜像、不随扇动旋转，动效在 painter 体内。
 * 锚点 (0,0) = 肩部展开锚。
 */
export const WINGS_11: Record<string, WingArt> = {
  // ---- 西游降魔 ----
  xyBackA: { c: 0xd9b45c, a: 0xff9a3c, single: true, draw: (g, now, _flap, c, a) => {
    // 如意金箍棒：斜负在背后的一根金箍棒——棒身 + 两端金箍 + 微微起伏的金纹流
    g.save();
    g.translateCanvas(-4, -8);
    g.rotateCanvas(-0.32 + Math.sin(now / 900) * 0.03);
    g.fillStyle(0xb8943a, 1); // 棒身
    g.fillRect(-3.4, -62, 6.8, 92);
    g.fillStyle(0xd9b45c, 0.8); // 受光棱
    g.fillRect(-3.4, -62, 2.2, 92);
    for (const s of [-1, 1]) { // 两端金箍
      g.fillStyle(c, 1);
      g.fillRect(-4.6, s > 0 ? 22 : -62, 9.2, 7);
      g.fillStyle(0xfff0b0, 0.7);
      g.fillRect(-4.6, s > 0 ? 23 : -61, 9.2, 1.6);
    }
    for (let k = 0; k < 3; k++) { // 流动的符光（沿棒身上升）
      const ph = (now / 1100 + k / 3) % 1;
      g.fillStyle(a, 0.7 * Math.sin(ph * Math.PI));
      g.fillRect(-1.2, 28 - ph * 86, 2.4, 3);
    }
    g.restore();
  } },
  xyBackB: { c: 0x8ac85a, a: 0x2f6a3a, single: true, draw: (g, now, _flap, c, a) => {
    // 芭蕉扇：背负的巨大芭蕉扇——扇面叶脉 + 摇动生风 + 风线
    const sway = Math.sin(now / 700) * 0.08;
    g.save();
    g.translateCanvas(-8, 0);
    g.rotateCanvas(0.3 + sway);
    g.fillStyle(0x6a4a2a, 1); // 扇柄
    g.fillRect(-2.4, 8, 4.8, 30);
    g.fillStyle(c, 0.9); // 扇面（上宽下收的蕉叶形）
    wpoly(g, [[-3, 10], [-16, -26], [-10, -52], [0, -60], [10, -52], [16, -26], [3, 10]], c, 0.92);
    g.fillStyle(0xa8e07a, 0.5); // 受光半边
    wpoly(g, [[-3, 10], [-16, -26], [-10, -52], [0, -60], [0, 8]], 0xa8e07a, 0.4);
    g.lineStyle(1.2, a, 0.7); // 叶脉
    for (let k = -2; k <= 2; k++) {
      g.beginPath(); g.moveTo(0, 8); g.lineTo(k * 6.4, -52 + Math.abs(k) * 6); g.strokePath();
    }
    g.restore();
    for (let k = 0; k < 3; k++) { // 扇底生风（飘出的风线）
      const ph = (now / 800 + k / 3) % 1;
      g.lineStyle(1.4, 0xdff2d0, (0.6 * (1 - ph)) * Math.sin(ph * Math.PI));
      g.beginPath();
      g.moveTo(-20 - ph * 8, 4 + k * 6);
      g.lineTo(-34 - ph * 16, 2 + k * 6 + Math.sin(now / 300 + k) * 2);
      g.lineTo(-46 - ph * 22, 6 + k * 6);
      g.strokePath();
    }
  } },
  xyBackC: { c: 0x9a6a3a, a: 0xb08ad0, single: true, draw: (g, now, _flap, c, a) => {
    // 紫金葫芦：悬浮在身侧的宝葫芦——束腰葫芦体 + 紫光封口 + 吸魂雾
    const bob = Math.sin(now / 750) * 3;
    g.save();
    g.translateCanvas(-12, -6 + bob);
    g.rotateCanvas(Math.sin(now / 900) * 0.1);
    g.fillStyle(c, 1); // 下腹
    g.fillEllipse(0, 8, 16, 20);
    g.fillStyle(c, 1); // 上腹
    g.fillEllipse(0, -8, 12, 14);
    g.fillStyle(0xb8875a, 0.5); // 受光
    g.fillEllipse(-3, -10, 4, 8);
    g.fillEllipse(-4, 6, 5, 11);
    g.lineStyle(1.6, a, 0.85); // 束腰紫金箍
    g.strokeEllipse(0, -1, 13, 5);
    g.fillStyle(0xd9b45c, 1); // 葫芦嘴塞
    g.fillRect(-2.6, -18, 5.2, 5);
    const gl = 0.4 + 0.4 * Math.sin(now / 300); // 封口紫光
    g.fillStyle(a, gl);
    g.fillCircle(0, -19.4, 2.4);
    g.restore();
    for (let k = 0; k < 4; k++) { // 吸魂雾（被吸进壶口的螺旋雾点）
      const ph = (now / 1300 + k / 4) % 1;
      const ang = ph * 5 + k * 1.7;
      const r = 26 * (1 - ph);
      g.fillStyle(0xb08ad0, 0.6 * Math.sin(ph * Math.PI));
      g.fillCircle(-12 + Math.cos(ang) * r, -24 + bob + Math.sin(ang) * r * 0.6 - ph * 8, 2 * (1 - ph) + 0.5);
    }
  } },
  xyBackD: { c: 0xffd45c, a: 0xfff0b0, single: true, draw: (g, now, _flap, c, a) => {
    // 功德金轮：身后缓转的大金轮——轮辋 + 十二辐条 + 外圈佛光
    const cy = -18 + Math.sin(now / 800) * 2;
    const rot = now / 1400;
    g.fillStyle(c, 0.12);
    g.fillCircle(0, cy, 48);
    g.fillStyle(c, 0.2);
    g.fillCircle(0, cy, 38);
    g.lineStyle(3, c, 0.85); // 轮辋
    g.strokeCircle(0, cy, 34);
    g.lineStyle(1.6, 0xd9b45c, 0.8); // 内辋
    g.strokeCircle(0, cy, 26);
    for (let k = 0; k < 12; k++) { // 辐条
      const ang = rot + (k / 12) * TAU;
      g.lineStyle(2, k % 2 ? c : a, 0.85);
      g.lineBetween(Math.cos(ang) * 8, cy + Math.sin(ang) * 8, Math.cos(ang) * 32, cy + Math.sin(ang) * 32);
    }
    g.fillStyle(0xfff0b0, 0.9); // 轮心
    g.fillCircle(0, cy, 6);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(-1.6, cy - 1.6, 2);
    for (let k = 0; k < 6; k++) { // 轮缘佛光珠
      const ang = rot * 1.4 + (k / 6) * TAU;
      g.fillStyle(a, 0.7 + 0.3 * Math.sin(now / 240 + k));
      g.fillCircle(Math.cos(ang) * 40, cy + Math.sin(ang) * 40, 2);
    }
  } },
  // ---- 三国烽火 ----
  sgmBackA: { c: 0x6ad0a0, a: 0x2f6a5a, single: true, draw: (g, now, _flap, c, a) => {
    // 青龙偃月刀：斜负的青龙大刀——长杆 + 偃月刃 + 背铁钩 + 刃上龙纹微光
    g.save();
    g.translateCanvas(-4, -6);
    g.rotateCanvas(-0.3 + Math.sin(now / 800) * 0.02);
    g.fillStyle(0x6b4a2f, 1); // 长杆
    g.fillRect(-2.4, -30, 4.8, 66);
    g.fillStyle(0x8a6a3a, 0.6);
    g.fillRect(-2.4, -30, 1.8, 66);
    // 偃月刃（大弯月）
    g.fillStyle(c, 1);
    wpoly(g, [
      [2, -30], [10, -46], [24, -54], [36, -50], [26, -44], [16, -40], [10, -30], [2, -24],
    ], c, 1);
    g.fillStyle(0xa8f0d0, 0.5); // 刃口受光
    wpoly(g, [[24, -54], [36, -50], [26, -44], [18, -47]], 0xa8f0d0, 0.55);
    g.fillStyle(0xd9b45c, 1); // 刀背铁钩
    g.fillRect(2, -34, 8, 3);
    g.lineStyle(1.4, a, 0.5 + 0.3 * Math.sin(now / 350)); // 龙纹微光
    g.beginPath();
    g.moveTo(8, -32); g.lineTo(16, -42); g.lineTo(28, -47);
    g.strokePath();
    g.restore();
  } },
  sgmBackB: { c: 0xe8404a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 八卦阵旗：背负的军旗——旗杆 + 猎猎红旗 + 八卦徽 + 旗角破损
    const sway = Math.sin(now / 500) * 3;
    g.save();
    g.translateCanvas(-10, 4);
    g.rotateCanvas(0.06);
    g.lineStyle(2.6, 0x6b4a2f, 1); // 旗杆
    g.lineBetween(0, 26, 0, -66);
    g.fillStyle(0xd9b45c, 1); // 杆顶
    g.fillCircle(0, -67, 2.6);
    g.fillStyle(c, 0.92); // 旗面（右飘 + 波动）
    g.beginPath();
    g.moveTo(1, -62);
    for (let s = 1; s <= 6; s++) g.lineTo(1 + s * 7, -60 - s * 1.4 - Math.sin(s * 1.2 + now / 300) * sway * (s / 6));
    for (let s = 6; s >= 1; s--) g.lineTo(1 + s * 7, -36 + s * 0.8 - Math.sin(s * 1.2 + now / 300 + 1) * sway * (s / 6));
    g.closePath(); g.fillPath();
    g.fillStyle(0xb83038, 0.5); // 旗面暗部
    g.beginPath();
    g.moveTo(1, -36);
    for (let s = 1; s <= 6; s++) g.lineTo(1 + s * 7, -36 + s * 0.8 - Math.sin(s * 1.2 + now / 300 + 1) * sway * (s / 6));
    g.lineTo(30, -40); g.closePath(); g.fillPath();
    // 八卦徽（旗心阴阳圈 + 八刻）
    const ex = 14, ey = -48;
    g.fillStyle(0xfff0b0, 0.9);
    g.fillCircle(ex, ey, 5);
    g.fillStyle(c, 0.9);
    g.fillPoints((() => {
      const vs = [];
      for (let k = 0; k <= 8; k++) {
        const ang = now / 700 + Math.PI / 2 - (k / 8) * Math.PI;
        vs.push({ x: ex + Math.cos(ang) * 4.6, y: ey + Math.sin(ang) * 4.6 });
      }
      return vs;
    })() as never, true);
    for (let k = 0; k < 8; k++) {
      const ang = now / 700 + (k / 8) * TAU;
      g.fillStyle(a, 0.8);
      g.fillRect(ex + Math.cos(ang) * 7 - 0.6, ey + Math.sin(ang) * 7 - 0.6, 1.2, 1.2);
    }
    g.restore();
  } },
  sgmBackC: { c: 0x8a6a3a, a: 0xcfc4a0, single: true, draw: (g, now, _flap, c, a) => {
    // 连弩匣：背负的木匣连弩——匣体 + 箭槽露出的箭羽 + 悬值守弦
    const bob = Math.sin(now / 620) * 1.6;
    g.save();
    g.translateCanvas(-12, 2 + bob);
    g.fillStyle(0x6b4a2f, 1); // 匣体
    g.fillRoundedRect(-8, -20, 16, 40, 3);
    g.fillStyle(c, 0.9);
    g.fillRect(-6, -18, 12, 34);
    g.lineStyle(1.2, 0x4a3420, 0.8); // 木纹
    for (let k = 0; k < 3; k++) g.lineBetween(-6, -10 + k * 10, 6, -10 + k * 10);
    for (let k = 0; k < 4; k++) { // 箭槽里的弩箭（箭羽错落颤动）
      const jig = Math.sin(now / 400 + k) * 0.8;
      g.fillStyle(0x8a6a3a, 1);
      g.fillRect(-1.2 + (k % 2 ? 3 : -3), -26 - k * 2 + jig, 2.4, 12);
      g.fillStyle(a, 0.95); // 箭羽
      g.fillTriangle(-3.4 + (k % 2 ? 3 : -3), -26 + jig, 1.4 + (k % 2 ? 3 : -3), -26 + jig, -1 + (k % 2 ? 3 : -3), -21 + jig);
    }
    g.lineStyle(1.4, a, 0.9); // 垂下的弦钩
    g.lineBetween(6, 8, 9, 16 + Math.sin(now / 300) * 1.4);
    g.restore();
  } },
  sgmBackD: { c: 0xd8d0c0, a: 0xff9a3c, single: true, draw: (g, now, _flap, c, a) => {
    // 烽火狼烟：背负的烽火罐——铜罐 + 罐口火星 + 滚滚狼烟柱
    const bob = Math.sin(now / 700) * 1.6;
    g.save();
    g.translateCanvas(-10, 6 + bob);
    g.fillStyle(0x8a6a3a, 1); // 铜罐
    g.fillEllipse(0, 12, 16, 12);
    g.fillStyle(0x6a4a2a, 0.8);
    g.fillEllipse(0, 9, 12, 5);
    g.fillStyle(0xd9b45c, 0.6); // 罐箍
    g.fillRect(-8, 8, 16, 2);
    const fire = 0.6 + 0.4 * Math.sin(now / 160); // 罐口火光
    g.fillStyle(a, 0.85 * fire);
    g.fillEllipse(0, 7, 8, 4);
    g.fillStyle(0xffe15c, fire);
    g.fillEllipse(0, 7, 4.4, 2.2);
    g.restore();
    for (let k = 0; k < 5; k++) { // 狼烟柱（螺旋上升的烟团，越升越散）
      const ph = (now / 2200 + k / 5) % 1;
      const px = -10 + Math.sin(ph * 6 + k) * (4 + ph * 14);
      const py = 0 - ph * 80;
      g.fillStyle(k % 2 ? c : 0xc0b8a8, 0.4 * Math.sin(ph * Math.PI));
      g.fillCircle(px, py, 3 + ph * 7);
    }
    for (let k = 0; k < 3; k++) { // 逃逸火星
      const ph = (now / 700 + k / 3) % 1;
      g.fillStyle(a, 0.8 * (1 - ph));
      g.fillCircle(-10 + Math.sin(ph * 6 + k * 2) * 6, 4 - ph * 30, 1.4 * (1 - ph) + 0.4);
    }
  } },
};
