import { wpoly, wline, type WingArt } from './shared';

/**
 * 批十四背部装饰（年兽迎春 / 月夜狼族 / 末日丧尸 / 大便人厕所）——**自由槽**：
 * 只保留一对真翅膀（狼影之翼），其余全是**背挂物件**（`single: true`）：
 * 爆竹背篓 / 舞狮战鼓 / 号月战旗 / 锈蚀路牌 / 铁丝围栏 / 卷纸背架 / 水桶扁担。
 * 挂肩高度锚点 topY+48；`single` 只画一次、不镜像，动效全在自己体内。
 */

export const WINGS_21: Record<string, WingArt> = {
  // ── 年兽迎春 ──
  nianWingA: { c: 0xd93a3a, a: 0xff8a3c, single: true, draw: (g, now, _flap, c, _a) => {
    // 爆竹背篓：竹编背篓 + 冒出来的一捆红鞭炮 + 引线火星
    g.fillStyle(0x6a4a2a, 1);
    g.fillPoints([{ x: -17, y: -6 }, { x: 17, y: -6 }, { x: 13, y: 14 }, { x: -13, y: 14 }] as never, true);
    g.fillStyle(0xb08a52, 0.95);
    g.fillPoints([{ x: -15, y: -4 }, { x: 15, y: -4 }, { x: 12, y: 12 }, { x: -12, y: 12 }] as never, true);
    g.lineStyle(1.2, 0x6a4a2a, 0.7);
    for (let k = -2; k <= 2; k++) g.lineBetween(k * 6, -6, k * 5, 14);
    g.lineBetween(-16, -1, 16, -1); g.lineBetween(-14, 6, 14, 6);
    g.fillStyle(0x6a4a2a, 1); g.fillEllipse(0, -6, 36, 7);
    for (let k = 0; k < 6; k++) { g.fillStyle(k % 2 ? c : 0xb02a2a, 1); g.fillRoundedRect(-14 + k * 5, -16, 4, 12, 1.5); }
    g.fillStyle(0xffd45c, 0.9);
    for (let k = 0; k < 6; k++) g.fillRect(-14 + k * 5, -11, 4, 1.4);
    g.lineStyle(1.4, 0x3a2a18, 0.9); g.beginPath(); g.moveTo(0, -16); g.lineTo(5, -25); g.strokePath();
    const ph = (now / 300) % 1;
    g.fillStyle(0xfff0b0, 1 - ph); g.fillCircle(5 + ph * 4, -25 - ph * 4, 1.6 * (1 - ph) + 0.5);
    g.lineStyle(2.4, 0x6a4a2a, 0.9); g.lineBetween(-13, -4, -18, -14); g.lineBetween(13, -4, 18, -14);
  } },
  nianWingB: { c: 0xd93a3a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 舞狮战鼓：挂在背上的红皮战鼓，鼓面狮头纹 + 交叉鼓槌
    g.fillStyle(0x8a1a1a, 1); g.fillCircle(0, 0, 21);
    g.fillStyle(c, 1); g.fillCircle(0, 0, 18);
    g.fillStyle(a, 1); g.fillCircle(0, 0, 12);
    g.fillStyle(0x8a1a1a, 1); g.fillCircle(0, 0, 9);
    for (let k = 0; k < 12; k++) { const ang = (k / 12) * Math.PI * 2; g.fillStyle(0xfff0b0, 0.95); g.fillCircle(Math.cos(ang) * 18, Math.sin(ang) * 18, 1.6); }
    g.fillStyle(0xffd45c, 1); g.fillCircle(0, -1, 5);
    g.fillStyle(0x8a1a1a, 1); g.fillCircle(-2, -2, 1.4); g.fillCircle(2, -2, 1.4);
    const s = Math.sin(now / 200) * 1.5;
    g.lineStyle(3, 0x8a5a2a, 1);
    g.lineBetween(-16, -16 + s, -2, -2); g.lineBetween(16, -16 - s, 2, -2);
    g.fillStyle(0xd8d4c8, 1); g.fillCircle(-16, -16 + s, 2.4); g.fillCircle(16, -16 - s, 2.4);
    g.lineStyle(2.4, 0x6a4a2a, 0.9); g.lineBetween(-16, -10, -20, -18); g.lineBetween(16, -10, 20, -18);
  } },
  // ── 月夜狼族 ──
  wolfWingA: { c: 0x8fa0c0, a: 0xc0c8d8, draw: (g, now, _flap, c, a) => {
    // 狼影之翼：蓬乱的狼毛翼，外缘一排竖起的毛尖（唯一保留的真翅膀）
    g.fillStyle(0x5a6a86, 0.95);
    wpoly(g, [[0, -4], [28, -20], [56, -6], [50, 16], [18, 18], [2, 8]], 0x5a6a86, 0.95);
    g.fillStyle(c, 0.96);
    wpoly(g, [[2, -2], [28, -17], [53, -5], [47, 13], [18, 15], [4, 7]], c, 0.96);
    for (let k = 0; k < 7; k++) {
      const t = k / 6;
      const len = 6 + 5 * Math.abs(Math.sin(now / 300 + k));
      wline(g, [[6 + t * 46, -14 + t * 26], [6 + t * 46 + 6, -20 + t * 26 - len]], 2, a, 0.8);
    }
  } },
  wolfWingB: { c: 0x6a5ac0, a: 0xc0c8d8, single: true, draw: (g, now, _flap, c, a) => {
    // 号月战旗：挂在背上的破战旗，旗面飘动、中心一枚血月
    g.fillStyle(0x3a3a52, 1); g.fillRect(10, -26, 3.4, 46);
    g.fillStyle(0x8a94a2, 1); g.fillCircle(11.7, -26, 2.4);
    const wave = Math.sin(now / 500) * 3;
    g.fillStyle(c, 0.95);
    g.fillPoints([
      { x: 10, y: -22 }, { x: -26, y: -18 + wave }, { x: -30, y: -2 + wave },
      { x: -18, y: 2 }, { x: -24, y: 12 + wave }, { x: -4, y: 4 }, { x: 10, y: -2 },
    ] as never, true);
    g.fillStyle(0x2a2a3c, 1);
    g.fillTriangle(-26, -14 + wave, -20, -16 + wave, -24, -8 + wave);
    g.fillTriangle(-16, 0, -10, 2, -14, 8);
    g.fillStyle(0xff3a4a, 0.9); g.fillCircle(-8, -10 + wave, 5);
    g.fillStyle(c, 1); g.fillCircle(-6, -11 + wave, 4);
    g.fillStyle(a, 0.8); g.fillCircle(2, -14 + wave, 1); g.fillCircle(-16, -2 + wave, 1);
  } },
  // ── 末日丧尸 ──
  zombWingA: { c: 0x9aa49a, a: 0xd8b12a, single: true, draw: (g, now, _flap, c, a) => {
    // 锈蚀路牌：挂在背上一块歪晃的箭头路牌，锈斑 + 弹孔
    g.fillStyle(0x5a5a52, 1); g.fillRect(-2, -6, 4, 30);
    const swing = Math.sin(now / 600) * 1.2;
    g.save();
    g.translateCanvas(0, -8);
    g.rotateCanvas(swing);
    g.fillStyle(0x6a7a6a, 1); g.fillPoints([{ x: -17, y: -11 }, { x: 15, y: -11 }, { x: 15, y: 7 }, { x: -17, y: 7 }] as never, true);
    g.fillStyle(c, 1); g.fillPoints([{ x: -15, y: -9 }, { x: 13, y: -9 }, { x: 13, y: 5 }, { x: -15, y: 5 }] as never, true);
    g.fillStyle(a, 0.95); g.fillPoints([{ x: -11, y: -6 }, { x: 3, y: -6 }, { x: 3, y: -9 }, { x: 11, y: -2 }, { x: 3, y: 5 }, { x: 3, y: 2 }, { x: -11, y: 2 }] as never, true);
    g.fillStyle(0x7a4a2a, 0.7); g.fillCircle(-10, 2, 3); g.fillCircle(8, -6, 2.2);
    g.fillStyle(0x1a1a16, 1); g.fillCircle(6, 1, 1.6);
    g.restore();
  } },
  zombWingB: { c: 0x8a94a2, a: 0x6a6a5a, single: true, draw: (g, _now, _flap, c, a) => {
    // 铁丝围栏：一段菱形网眼铁丝网 + 顶部倒刺 + 挂着的一缕破布
    g.lineStyle(2.4, c, 1); g.strokeRect(-20, -16, 40, 34);
    g.lineStyle(1.2, a, 0.8);
    for (let k = -4; k <= 4; k++) g.lineBetween(-20 + k * 7 - 6, -16, -20 + k * 7 + 6, 18);
    for (let k = -4; k <= 4; k++) g.lineBetween(-20 + k * 7 - 6, 18, -20 + k * 7 + 6, -16);
    g.lineStyle(2, c, 1);
    for (let k = 0; k < 7; k++) g.lineBetween(-18 + k * 6, -16, -18 + k * 6, -21);
    g.fillStyle(0x4a4438, 0.95);
    g.fillPoints([{ x: 4, y: 18 }, { x: 12, y: 18 }, { x: 10, y: 30 }, { x: 5, y: 27 }] as never, true);
    g.fillStyle(0x8a1a1a, 0.5); g.fillCircle(-8, 4, 3);
  } },
  // ── 大便人厕所 ──
  toilWingA: { c: 0xf0e8d8, a: 0x8fd8ff, single: true, draw: (g, now, _flap, _c, _a) => {
    // 卷纸背架：金属架 + 两卷卫生纸 + 抽出来飘的纸
    g.fillStyle(0x9aa4b2, 1);
    g.fillRect(-16, -14, 3, 30); g.fillRect(13, -14, 3, 30); g.fillRect(-16, -14, 32, 3);
    for (const cx of [-7, 7]) {
      g.fillStyle(0xe0d8c8, 1); g.fillRoundedRect(cx - 7, -8, 14, 18, 4);
      g.fillStyle(0xffffff, 1); g.fillEllipse(cx, -8, 14, 5);
      g.fillStyle(0xcfc6b4, 1); g.fillEllipse(cx, -8, 7, 2.4);
    }
    const sw = Math.sin(now / 500) * 3;
    g.fillStyle(0xffffff, 0.96);
    g.fillPoints([{ x: 6, y: 10 }, { x: 14, y: 12 }, { x: 16 + sw, y: 27 }, { x: 8 + sw, y: 25 }] as never, true);
    g.lineStyle(2.4, 0x6a7482, 0.9); g.lineBetween(-13, -12, -18, -20); g.lineBetween(13, -12, 18, -20);
  } },
  toilWingB: { c: 0xbfe0e8, a: 0x8fd8ff, single: true, draw: (g, now, _flap, c, a) => {
    // 水桶扁担：一根横扁担 + 两头挑着水桶，桶里水在晃
    g.lineStyle(3.4, 0x8a5a2a, 1); g.lineBetween(-31, -18, 31, -18);
    for (const [bx, ph] of [[-24, 0], [24, Math.PI]] as Array<[number, number]>) {
      const by = -12 + Math.sin(now / 400 + ph) * 2;
      g.lineStyle(1.4, 0xd8d4c8, 0.9); g.lineBetween(bx, -18, bx, by - 8);
      g.fillStyle(0x9aa4b2, 1); g.fillEllipse(bx, by - 6, 16, 4);
      g.fillStyle(c, 1); g.fillPoints([{ x: bx - 8, y: by - 6 }, { x: bx + 8, y: by - 6 }, { x: bx + 6, y: by + 8 }, { x: bx - 6, y: by + 8 }] as never, true);
      g.fillStyle(a, 0.6); g.fillEllipse(bx, by - 5, 13, 3.4);
    }
  } },
};
