import { type WingArt } from './shared';

/**
 * 批十六背部装饰（天竺神话 / 高天原 / 凯尔特 / 美索不达米亚 / 克苏鲁）——自由槽混合：
 * 每主题 1 件成对翼 + 1 件背挂物件（`single: true`，只画一次、不镜像）。
 * 挂肩高度 topY+48。
 */

export const WINGS_23: Record<string, WingArt> = {
  // ── 天竺神话 ──
  vdaWing: { c: 0xffc04a, a: 0xff7a2a, draw: (g, now, flap, c, a) => {
    // 迦楼罗金翼：金羽层层叠压，翼尖上翘，随呼吸漏金光
    const lift = flap * 8 + Math.sin(now / 500) * 3;
    g.fillStyle(0xb87a1a, 0.95);
    g.fillPoints([{ x: 0, y: 0 }, { x: 30, y: -22 + lift }, { x: 56, y: -30 + lift }, { x: 44, y: 6 }, { x: 16, y: 12 }] as never, true);
    g.fillStyle(c, 1);
    g.fillPoints([{ x: 2, y: -2 }, { x: 28, y: -18 + lift }, { x: 52, y: -25 + lift }, { x: 40, y: 3 }, { x: 14, y: 8 }] as never, true);
    for (let k = 0; k < 5; k++) {
      const bx = 6 + k * 9, by = -6 - k * 3 + lift * 0.6;
      g.fillStyle(k % 2 ? a : 0xffd45c, 0.95);
      g.fillPoints([{ x: bx, y: by }, { x: bx + 6, y: by - 16 - k * 2 }, { x: bx + 12, y: by - 2 }] as never, true);
      g.lineStyle(1.4, 0x8a5a1a, 0.6);
      g.lineBetween(bx, by, bx + 6, by - 16 - k * 2);
    }
    g.fillStyle(0xfff0b0, 0.9); g.fillCircle(3, -3, 3);
    g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 260)); g.fillCircle(4, -3, 5);
  } },
  vdaChakra: { c: 0xffd45c, a: 0x7fd4ff, single: true, draw: (g, now, _flap, c, a) => {
    // 妙见法轮：身后一轮带锯齿的旋转法轮，辐条发光
    const rot = now / 320;
    g.fillStyle(0x8a5a1a, 1); g.fillCircle(0, 0, 24);
    g.fillStyle(a, 0.25); g.fillCircle(0, 0, 20);
    for (let k = 0; k < 16; k++) { // 锯齿外缘
      const ang = rot + (k / 16) * Math.PI * 2;
      g.fillStyle(k % 2 ? c : 0xfff0b0, 0.95);
      g.fillPoints([
        { x: Math.cos(ang) * 22, y: Math.sin(ang) * 22 },
        { x: Math.cos(ang + 0.12) * 30, y: Math.sin(ang + 0.12) * 30 },
        { x: Math.cos(ang + 0.24) * 22, y: Math.sin(ang + 0.24) * 22 },
      ] as never, true);
    }
    for (let k = 0; k < 8; k++) { // 辐条
      const ang = rot * 1.5 + (k / 8) * Math.PI * 2;
      g.lineStyle(2.4, 0xfff0b0, 0.95);
      g.lineBetween(0, 0, Math.cos(ang) * 18, Math.sin(ang) * 18);
    }
    g.fillStyle(c, 1); g.fillCircle(0, 0, 7);
    g.fillStyle(0x8a5a1a, 1); g.fillCircle(0, 0, 3.4);
    const gl = 0.5 + 0.5 * Math.sin(now / 240);
    g.fillStyle(0xffffff, gl); g.fillCircle(0, 0, 2);
  } },
  // ── 高天原 ──
  takFeatherMantle: { c: 0xfff0d8, a: 0xc0392b, draw: (g, now, flap, c, a) => {
    // 神乐羽衣：白羽层叠的翼衣，边缘垂红绳、随挥动摆
    const lift = flap * 7 + Math.sin(now / 560) * 3;
    g.fillStyle(0xe8d8b8, 0.95);
    g.fillPoints([{ x: 0, y: 0 }, { x: 26, y: -20 + lift }, { x: 54, y: -22 + lift }, { x: 40, y: 10 }, { x: 12, y: 14 }] as never, true);
    g.fillStyle(c, 1);
    g.fillPoints([{ x: 2, y: -2 }, { x: 24, y: -16 + lift }, { x: 50, y: -18 + lift }, { x: 36, y: 7 }, { x: 10, y: 10 }] as never, true);
    for (let k = 0; k < 4; k++) {
      const y = -4 + k * 6;
      g.fillStyle(0xffffff, 0.5);
      g.fillPoints([{ x: 6, y: y }, { x: 34 - k * 4, y: y - 6 + lift * 0.5 }, { x: 30 - k * 4, y: y + 2 }] as never, true);
    }
    for (let k = 0; k < 6; k++) { // 垂下的红绳
      const bx = 6 + k * 8;
      g.lineStyle(1.6, a, 0.9);
      g.beginPath(); g.moveTo(bx, 8); g.lineTo(bx + Math.sin(now / 400 + k) * 2, 20 + k); g.strokePath();
    }
    g.fillStyle(a, 0.9); g.fillCircle(3, -2, 3);
  } },
  takMirror: { c: 0xffe8b0, a: 0xc0392b, single: true, draw: (g, now, _flap, c, a) => {
    // 八咫镜：身后悬一面圆镜，镜面反光、红框垂绳
    const sw = Math.sin(now / 700) * 3;
    g.save(); g.translateCanvas(sw, 0);
    g.fillStyle(a, 1); g.fillCircle(0, 0, 26);
    g.fillStyle(0x8a1a1a, 1); g.fillCircle(0, 0, 23);
    g.fillStyle(c, 1); g.fillCircle(0, 0, 20);
    const gl = 0.4 + 0.4 * Math.sin(now / 300);
    g.fillStyle(0xffffff, gl * 0.6);
    g.fillPoints([{ x: -14, y: -4 }, { x: -2, y: -14 }, { x: 2, y: 6 }, { x: -8, y: 10 }] as never, true);
    g.fillStyle(0xd8f0ff, 0.35); g.fillCircle(6, 4, 10);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * Math.PI * 2; g.fillStyle(0xffd45c, 0.9); g.fillCircle(Math.cos(ang) * 23, Math.sin(ang) * 23, 2); }
    g.lineStyle(2, 0xffd45c, 0.9);
    for (let k = 0; k < 3; k++) g.lineBetween(-6 + k * 6, 24, -6 + k * 6 + sw, 34);
    g.restore();
  } },
  // ── 凯尔特 ──
  celtRavenWing: { c: 0x2a2a3a, a: 0x6a5ac0, draw: (g, now, flap, c, a) => {
    // 渡鸦之翼：黑羽大翼，羽尖泛紫光
    const lift = flap * 8 + Math.sin(now / 480) * 3;
    g.fillStyle(0x14141e, 1);
    g.fillPoints([{ x: 0, y: 0 }, { x: 28, y: -26 + lift }, { x: 58, y: -34 + lift }, { x: 46, y: 4 }, { x: 14, y: 12 }] as never, true);
    g.fillStyle(c, 1);
    g.fillPoints([{ x: 2, y: -2 }, { x: 26, y: -22 + lift }, { x: 54, y: -30 + lift }, { x: 42, y: 1 }, { x: 12, y: 8 }] as never, true);
    for (let k = 0; k < 6; k++) {
      const bx = 6 + k * 8;
      g.lineStyle(1.6, 0x0a0a12, 0.8);
      g.lineBetween(bx, 2, bx + 8, -20 - k * 2 + lift);
    }
    g.fillStyle(a, 0.7);
    for (let k = 0; k < 4; k++) g.fillCircle(20 + k * 9, -18 - k * 3 + lift, 1.6);
    g.fillStyle(a, 0.5) ; g.fillCircle(3, -3, 4);
  } },
  celtHarp: { c: 0xd8b45a, a: 0x8fd45a, single: true, draw: (g, now, _flap, c, a) => {
    // 魔琴：背上一把凯尔特竖琴，琴弦微颤发光
    g.fillStyle(0x6a4a2a, 1);
    g.fillPoints([{ x: -16, y: 22 }, { x: -14, y: -22 }, { x: -4, y: -24 }, { x: -6, y: 22 }] as never, true);
    g.fillStyle(c, 1);
    g.fillPoints([{ x: -6, y: 20 }, { x: -4, y: -20 }, { x: 16, y: -14 }, { x: 10, y: 16 }] as never, true);
    g.fillStyle(0x8a6a3a, 1);
    g.fillPoints([{ x: -16, y: 20 }, { x: 12, y: 16 }, { x: 14, y: 22 }, { x: -16, y: 26 }] as never, true);
    const vib = Math.sin(now / 90);
    for (let k = 0; k < 6; k++) {
      const t = k / 5;
      g.lineStyle(0.9, 0xe8f6ff, 0.7 + 0.3 * Math.abs(vib));
      g.lineBetween(-3 + t * 4, -20 + t * 34, 4 + t * 8 + vib * 0.5, -18 + t * 30);
    }
    g.fillStyle(a, 0.6 + 0.4 * Math.abs(vib)); g.fillCircle(-12, -24, 2.4);
  } },
  // ── 美索不达米亚 ──
  mesoStormWing: { c: 0x2a4a8a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
    // 风之翼：深蓝风暴之翼，边缘锯齿，翼面游电
    const lift = flap * 8 + Math.sin(now / 460) * 3;
    g.fillStyle(0x16305a, 1);
    g.fillPoints([{ x: 0, y: 0 }, { x: 30, y: -24 + lift }, { x: 58, y: -28 + lift }, { x: 44, y: 4 }, { x: 14, y: 12 }] as never, true);
    g.fillStyle(c, 1);
    g.fillPoints([{ x: 2, y: -2 }, { x: 28, y: -20 + lift }, { x: 54, y: -24 + lift }, { x: 40, y: 1 }, { x: 12, y: 8 }] as never, true);
    for (let k = 0; k < 5; k++) { g.fillStyle(0x7fa8ff, 0.5); g.fillPoints([{ x: 6 + k * 9, y: -4 }, { x: 14 + k * 9, y: -18 + lift }, { x: 20 + k * 9, y: -3 }] as never, true); }
    g.lineStyle(1.8, a, 0.7 + 0.3 * Math.sin(now / 110));
    g.beginPath(); g.moveTo(8, -4); g.lineTo(20, -16 + lift); g.lineTo(16, -14 + lift); g.lineTo(34, -24 + lift); g.strokePath();
    g.fillStyle(a, 0.8); g.fillCircle(3, -3, 3);
  } },
  mesoTablet: { c: 0xd8b45a, a: 0x5a8aff, single: true, draw: (g, now, _flap, c, a) => {
    // 泥板经卷：背上一块写满楔形文字的泥板，凿痕偶尔亮起
    g.fillStyle(0x8a6a2a, 1); g.fillRoundedRect(-15, -20, 30, 40, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(-13, -18, 26, 36, 3);
    for (let r = 0; r < 5; r++) {
      const yy = -14 + r * 7;
      for (let cI = 0; cI < 3; cI++) {
        const xx = -9 + cI * 7;
        const lit = 0.4 + 0.6 * Math.abs(Math.sin(now / 500 + r + cI));
        g.fillStyle(0x2a1a0a, 0.85);
        g.fillTriangle(xx - 2, yy + 2, xx + 2, yy + 2, xx, yy - 2);
        g.fillStyle(a, lit * 0.5); g.fillCircle(xx, yy, 1.2);
      }
    }
    g.fillStyle(0x3a2a1a, 0.8); g.fillRect(-13, -20, 26, 3);
  } },
  // ── 克苏鲁 ──
  cthOldWing: { c: 0x1e5a4a, a: 0x7a4aa8, draw: (g, now, flap, c, a) => {
    // 旧日之翼：蝙蝠状膜翼，骨刺分明，边缘滴黏液
    const lift = flap * 9 + Math.sin(now / 520) * 3;
    g.fillStyle(0x0e2a24, 1);
    g.fillPoints([{ x: 0, y: 0 }, { x: 22, y: -28 + lift }, { x: 52, y: -30 + lift }, { x: 40, y: 8 }, { x: 12, y: 14 }] as never, true);
    g.fillStyle(c, 0.95);
    g.fillPoints([{ x: 2, y: -2 }, { x: 20, y: -22 + lift }, { x: 48, y: -25 + lift }, { x: 36, y: 5 }, { x: 10, y: 10 }] as never, true);
    g.lineStyle(2.4, 0x0a1e1a, 1);
    g.lineBetween(0, 0, 22, -28 + lift); g.lineBetween(0, 0, 52, -30 + lift); g.lineBetween(0, 0, 40, 8);
    g.lineStyle(1.6, a, 0.6);
    for (let k = 0; k < 4; k++) g.lineBetween(6 + k * 3, -2 - k, 40 - k * 6, -20 + lift);
    g.fillStyle(a, 0.7);
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillCircle(20 + k * 8, -14 + ph * 20, 1.4 * (1 - ph) + 0.5); }
  } },
  cthNecronomicon: { c: 0x1a3a2a, a: 0x5fe8c8, single: true, draw: (g, now, _flap, c, a) => {
    // 死灵之书：背上一本翻开的邪书，书页间探出触须、黄印发光
    const flip = Math.sin(now / 500) * 2;
    g.fillStyle(0x0e1e18, 1); g.fillRoundedRect(-16, -14, 32, 28, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-14, -12, 28, 24, 2);
    g.fillStyle(0xd8c8a0, 1);
    g.fillPoints([{ x: -14, y: -10 }, { x: 0, y: -12 + flip }, { x: 14, y: -10 }, { x: 14, y: 10 }, { x: 0, y: 12 - flip }, { x: -14, y: 10 }] as never, true);
    for (let k = 0; k < 4; k++) { g.lineStyle(0.9, 0x8a7a5a, 0.7); g.lineBetween(-11 + k * 7, -9, -11 + k * 7, 9); }
    const gl = 0.5 + 0.5 * Math.sin(now / 260);
    g.fillStyle(a, gl * 0.9); g.fillCircle(0, 0, 5);
    g.fillStyle(0x2a0e2e, 1); g.fillCircle(1, -1, 3.4);
    g.fillStyle(0xffffff, gl * 0.8); g.fillCircle(0, -2, 1);
    // 探出的触须
    for (let k = 0; k < 3; k++) {
      g.lineStyle(2.4, a, 0.85);
      g.beginPath();
      g.moveTo(-6 + k * 6, -12);
      g.lineTo(-6 + k * 6 + Math.sin(now / 300 + k) * 4, -20 - k * 2);
      g.strokePath();
      g.fillStyle(a, 0.85); g.fillCircle(-6 + k * 6 + Math.sin(now / 300 + k) * 4, -20 - k * 2, 1.4);
    }
  } },
};
