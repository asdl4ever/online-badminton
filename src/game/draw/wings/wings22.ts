import { type WingArt } from './shared';

/**
 * 批十五背部装饰（基多拉 / 魔斯拉 / 机甲战队 / 火山泰坦 / 深海巨妖）——**自由槽，全是背挂物件**（`single: true`）：
 * 雷云发生罐 / 龙颅战鼓 / 花粉采集罐 / 银丝茧囊 / 机体背包 / 炮台挂架 / 熔炉背罐 / 岩锤挂架 / 蚌壳背包 / 鱼骨图腾。
 * 只画一次、不镜像，动效全在自己体内。挂肩高度 topY+48。
 */

export const WINGS_22: Record<string, WingArt> = {
  // ── 基多拉 ──
  ghidWingA: { c: 0x8a94a2, a: 0xffe15c, single: true, draw: (g, now, _flap, c, a) => {
    // 雷云发生罐：金属罐 + 观察窗里的旋转雷云 + 电极
    g.fillStyle(0x3a3a4a, 1); g.fillRoundedRect(-13, -18, 26, 36, 6);
    g.fillStyle(c, 1); g.fillRoundedRect(-12, -17, 24, 33, 5);
    g.fillStyle(0x1a1e2a, 1); g.fillEllipse(0, -4, 16, 18); // 观察窗
    const rot = now / 400;
    for (let k = 0; k < 3; k++) { g.fillStyle(0x2a2a3a, 0.6); g.fillCircle(Math.cos(rot + k * 2.1) * 4, -4 + Math.sin(rot + k * 2.1) * 5, 4); }
    g.lineStyle(1.6, a, 0.8 + 0.2 * Math.sin(now / 100)); g.beginPath(); g.moveTo(-4, -12); g.lineTo(1, -5); g.lineTo(-2, -2); g.lineTo(4, 4); g.strokePath();
    for (const s of [-1, 1]) { g.fillStyle(0x8a94a2, 1); g.fillRoundedRect(s * 13 - 3, -20, 6, 6, 2); g.fillStyle(a, 0.9); g.fillCircle(s * 13, -17, 1.6); }
  } },
  ghidWingB: { c: 0x8a6a1a, a: 0xffe15c, single: true, draw: (g, now, _flap, c, a) => {
    // 龙颅战鼓：鼓面嵌一颗龙颅，鼓槌敲击
    g.fillStyle(0x5a4410, 1); g.fillCircle(0, 0, 20);
    g.fillStyle(c, 1); g.fillCircle(0, 0, 16);
    g.fillStyle(0xd9b45c, 1); g.fillEllipse(0, -1, 16, 18);
    g.fillStyle(0x3a2a06, 1); g.fillTriangle(-6, -2, -1, -2, -4, -12); g.fillTriangle(1, -2, 6, -2, 4, -12);
    g.fillStyle(0x1a1a1e, 1); g.fillCircle(-3, -2, 2); g.fillCircle(3, -2, 2);
    g.fillStyle(a, 0.9); g.fillCircle(-3, -2, 0.8); g.fillCircle(3, -2, 0.8);
    g.fillStyle(0xd9b45c, 1); g.fillRoundedRect(-4, 4, 8, 8, 2);
    const s = Math.sin(now / 200) * 2;
    g.lineStyle(3, 0x6a4a10, 1); g.lineBetween(-16, -16 + s, -4, -4); g.lineBetween(16, -16 - s, 4, -4);
    g.fillStyle(0xd8d4c8, 1); g.fillCircle(-16, -16 + s, 2.6); g.fillCircle(16, -16 - s, 2.6);
  } },
  // ── 魔斯拉 ──
  mthrWingA: { c: 0xd8c65a, a: 0xbfe8ff, single: true, draw: (g, now, _flap, c, a) => {
    // 花粉采集罐：玻璃罐 + 发光花粉 + 提绳
    g.fillStyle(0x8a94a2, 1); g.fillRoundedRect(-12, -18, 24, 36, 6);
    g.fillStyle(c, 0.85); g.fillRoundedRect(-10, -16, 20, 30, 5);
    g.fillStyle(0x6a7482, 1); g.fillRoundedRect(-8, -22, 16, 6, 2);
    for (let k = 0; k < 8; k++) { const ph = ((now / 1400 + k / 8) % 1); g.fillStyle(k % 2 ? a : 0xffe66a, 0.8 * (1 - ph * 0.4)); g.fillCircle(-6 + (k % 4) * 4, 12 - ph * 26, 1.4); }
    g.lineStyle(2, 0x6a7482, 0.9); g.lineBetween(-9, -18, -14, -26); g.lineBetween(9, -18, 14, -26);
  } },
  mthrWingB: { c: 0xbfe8ff, a: 0xffe66a, single: true, draw: (g, _now, _flap, c, a) => {
    // 银丝茧囊：一个丝质茧，缠着发光的丝
    g.fillStyle(0x8aa4b8, 0.95); g.fillEllipse(0, 0, 26, 40);
    g.fillStyle(c, 0.95); g.fillEllipse(0, -1, 22, 34);
    g.lineStyle(1.6, 0xe8f6ff, 0.7); for (let k = 0; k < 5; k++) g.lineBetween(-9, -14 + k * 7, 9, -10 + k * 7);
    g.lineStyle(1.4, a, 0.8); g.beginPath(); g.arc(0, 0, 12, 0.6, 2.4); g.strokePath();
    g.fillStyle(a, 0.9); g.fillCircle(0, -20, 3);
  } },
  // ── 机甲战队 ──
  tksWingA: { c: 0x3f4a62, a: 0x5ac8ff, single: true, draw: (g, _now, _flap, c, a) => {
    // 机体背包：机械背包 + 顶部散热口 + 侧灯
    g.fillStyle(0x2a3244, 1); g.fillRoundedRect(-16, -16, 32, 32, 6);
    g.fillStyle(c, 1); g.fillRoundedRect(-15, -15, 30, 30, 5);
    g.fillStyle(0x8a94a2, 1); for (let k = 0; k < 3; k++) g.fillRect(-12 + k * 9, -12, 6, 4);
    g.fillStyle(0x1a2436, 1); g.fillRoundedRect(-6, -4, 12, 16, 3);
    g.fillStyle(a, 0.9); g.fillCircle(0, 2, 2.4);
    for (const s of [-1, 1]) { g.fillStyle(a, 0.8); g.fillCircle(s * 15, -12, 1.8); g.fillStyle(0x8a94a2, 1); g.fillRect(s * 15 - 1, 8, 2, 6); }
    g.fillStyle(a, 0.6); g.fillRect(-1, -22, 2, 6);
  } },
  tksWingB: { c: 0x8a94a2, a: 0xff4a4a, single: true, draw: (g, now, _flap, c, a) => {
    // 炮台挂架：一副肩后炮台——支架 + 双联炮 + 弹药链
    g.fillStyle(0x2a3244, 1); g.fillRoundedRect(-16, 0, 32, 12, 4);
    for (const s of [-1, 1]) {
      g.fillStyle(c, 1); g.fillRoundedRect(s * 8 - 5, -20, 10, 24, 3);
      g.fillStyle(0x1a2436, 1); g.fillRoundedRect(s * 8 - 4, -22, 8, 6, 2);
      const gl = 0.4 + 0.4 * Math.sin(now / 200 + s);
      g.fillStyle(a, gl); g.fillCircle(s * 8, -20, 2.4);
    }
    g.fillStyle(a, 0.8); for (let k = 0; k < 4; k++) g.fillCircle(-9 + k * 6, 6, 1.6);
  } },
  // ── 火山泰坦 ──
  titanWingA: { c: 0x4a3326, a: 0xff6a2a, single: true, draw: (g, now, _flap, c, a) => {
    // 熔炉背罐：背上一只熔炉罐，口冒火、罐身透光
    g.fillStyle(0x321f14, 1); g.fillRoundedRect(-14, -16, 28, 34, 8);
    g.fillStyle(c, 1); g.fillRoundedRect(-13, -15, 26, 32, 7);
    const heat = 0.6 + 0.4 * Math.sin(now / 300);
    g.fillStyle(a, heat * 0.7); g.fillEllipse(0, 0, 16, 22);
    g.lineStyle(2, 0x140a06, 1); for (let k = 0; k < 3; k++) g.lineBetween(-10 + k * 10, -12, -8 + k * 10, 14);
    g.lineStyle(1.2, a, heat); for (let k = 0; k < 3; k++) g.lineBetween(-10 + k * 10, -12, -8 + k * 10, 14);
    g.fillStyle(0x1a0f08, 1); g.fillRoundedRect(-6, -22, 12, 7, 2);
    for (let k = 0; k < 3; k++) { const ph = ((now / 600 + k / 3) % 1); g.fillStyle(k % 2 ? a : 0xffd45c, (1 - ph) * 0.9); g.fillCircle((k - 1) * 4, -24 - ph * 14, 2.2 * (1 - ph) + 0.5); }
  } },
  titanWingB: { c: 0x5a4436, a: 0xff6a2a, single: true, draw: (g, _now, _flap, c, a) => {
    // 岩锤挂架：背上的岩锤挂架 + 一把熔岩巨锤
    g.fillStyle(0x32251a, 1); g.fillRoundedRect(-16, -6, 32, 16, 4);
    g.fillStyle(0x8a7a6a, 0.8); for (let k = -1; k <= 1; k++) g.fillCircle(k * 10, 2, 2);
    g.lineStyle(5, 0x3a2418, 1); g.lineBetween(0, 2, 0, -22); // 锤柄
    g.fillStyle(c, 1); g.fillPoints([{ x: -12, y: -20 }, { x: 12, y: -20 }, { x: 14, y: -34 }, { x: -14, y: -34 }] as never, true);
    g.fillStyle(0x4a3326, 0.8); g.fillRect(-12, -30, 24, 4);
    g.fillStyle(a, 0.7 + 0.3 * Math.sin(1)); g.fillCircle(0, -27, 3);
    g.fillStyle(0xffd45c, 0.9); g.fillCircle(0, -27, 1.4);
  } },
  // ── 深海巨妖 ──
  leviWingA: { c: 0x8aa6b8, a: 0x5fe8d0, single: true, draw: (g, now, _flap, c, a) => {
    // 蚌壳背包：背上一只张开的蚌壳，含一颗发光珍珠
    g.fillStyle(0x6a8494, 1); g.fillEllipse(0, 0, 40, 32);
    g.fillStyle(c, 1); g.fillEllipse(0, 0, 34, 26);
    g.lineStyle(1.6, 0x4a6474, 0.8); for (let k = 0; k < 5; k++) g.lineBetween(0, 12, Math.cos(-1 + k * 0.5) * 22, 12 + Math.sin(-1 + k * 0.5) * -20);
    g.fillStyle(0x2a4a58, 1); g.fillEllipse(0, 4, 42, 8); // 壳缝
    const gl = 0.6 + 0.4 * Math.sin(now / 400);
    g.fillStyle(a, 0.5 * gl); g.fillCircle(0, -2, 8);
    g.fillStyle(0xe8f6ff, gl); g.fillCircle(0, -2, 4.4);
    g.fillStyle(0xffffff, gl * 0.9); g.fillCircle(-1, -3, 1.6);
  } },
  leviWingB: { c: 0xd8e0e8, a: 0x9b6aff, single: true, draw: (g, now, _flap, c, _a) => {
    // 鱼骨图腾：背上一串鱼骨图腾，顶端挂发光核
    g.fillStyle(c, 1); g.fillRect(-2, -24, 4, 46); // 脊骨
    for (let k = 0; k < 5; k++) { // 鱼刺
      const y = -18 + k * 9;
      g.lineStyle(2.4, c, 0.95);
      g.lineBetween(0, y, -12 - k * 0.6, y + 5); g.lineBetween(0, y, 12 + k * 0.6, y + 5);
    }
    g.fillStyle(0x6a7482, 1); g.fillEllipse(0, -26, 14, 10);
    g.fillStyle(0x1a0e2e, 1); g.fillCircle(-3, -26, 1.6);
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(0x9b6aff, 0.5 * gl); g.fillCircle(0, -34, 7);
    g.fillStyle(0x5fe8d0, gl); g.fillCircle(0, -34, 3.4);
  } },
};
