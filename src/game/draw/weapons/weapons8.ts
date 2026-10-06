import { handle, pommel, type WeaponArt } from './shared';

/** 批五主题武器（武侠江湖 / 北欧神域）。局部空间：柄在 x ∈ [-13,-2]，拍框中心 ≈ (9,0)。 */
export const WEAPONS_8: Record<string, WeaponArt> = {
  wxRacketA: { c: 0xdfe8f5, a: 0xe8404a, draw: (g, now, c, a) => {
    // 三尺青锋·拍：拍面是一柄直剑——剑身 + 血槽 + 剑格 + 剑穗摆动
    handle(g, -13, 0, 5, 0x1a1a20);
    pommel(g, -13.4, 2.4, a);
    g.fillStyle(c, 1); // 剑身（修长直刃）
    g.fillPoints([
      { x: -2, y: -3 }, { x: 22, y: -5 }, { x: 34, y: 0 }, { x: 22, y: 5 }, { x: -2, y: 3 },
    ] as never, true);
    g.fillStyle(0xffffff, 0.55); // 剑面受光
    g.fillPoints([
      { x: -2, y: -3 }, { x: 22, y: -5 }, { x: 26, y: -2 }, { x: -2, y: -0.6 },
    ] as never, true);
    g.lineStyle(1, 0x8a94a2, 0.8); // 血槽
    g.lineBetween(-2, 0, 28, 0);
    g.fillStyle(0xd9b45c, 1); // 剑格
    g.fillRect(-4, -5.4, 3.4, 10.8);
    g.fillStyle(0x1a1a20, 1); // 剑柄缠绳
    g.fillRect(-12, -2.4, 8, 4.8);
    g.lineStyle(0.8, 0x3a3a42, 0.9);
    for (let k = 0; k < 3; k++) g.lineBetween(-11.4 + k * 2.6, -2.4, -10.4 + k * 2.6, 2.4);
    // 剑穗（红穗摆动）
    const sway = Math.sin(now / 320) * 2;
    g.lineStyle(1.4, a, 0.95);
    g.lineBetween(-12.6, 2.4, -13.4 + sway, 9);
    g.fillStyle(a, 0.9);
    g.fillCircle(-13.4 + sway, 10, 1.6);
    const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 340)); // 剑尖寒光
    g.fillStyle(0xffffff, gl);
    g.fillRect(33, -1.2, 4, 2.4);
  } },
  wxRacketB: { c: 0x8a6a3a, a: 0xe8404a, draw: (g, now, c, a) => {
    // 判官笔·拍：拍面是一支巨笔——笔杆 + 笔头锋毫 + 金箍 + 滴墨
    handle(g, -13, 0, 4.6, 0x2a2a30);
    pommel(g, -13.4, 2.2, a);
    g.fillStyle(c, 1); // 笔杆
    g.fillRoundedRect(-2, -3.4, 28, 6.8, 3);
    g.fillStyle(0xa07a4a, 0.6);
    g.fillRect(-2, -3.4, 28, 2.2);
    g.fillStyle(0xd9b45c, 0.9); // 笔杆双箍
    g.fillRect(4, -3.8, 2.4, 7.6);
    g.fillRect(18, -3.8, 2.4, 7.6);
    g.fillStyle(0x2a2a30, 1); // 笔头（锥形锋毫）
    g.fillPoints([
      { x: 26, y: -5.4 }, { x: 38, y: -1.6 }, { x: 41, y: 0 }, { x: 38, y: 1.6 }, { x: 26, y: 5.4 },
    ] as never, true);
    g.fillStyle(0x3a3a42, 0.7);
    g.fillPoints([
      { x: 26, y: 1 }, { x: 38, y: 1.2 }, { x: 41, y: 0 }, { x: 38, y: -1.6 }, { x: 26, y: -1 },
    ] as never, true);
    for (let k = 0; k < 2; k++) { // 笔锋滴墨（墨滴周期坠落）
      const ph = (now / 900 + k / 2) % 1;
      g.fillStyle(0x2a2a30, 0.7 * (1 - ph));
      g.fillCircle(40, -2 + ph * 10, 1.4 * (1 - ph) + 0.4);
    }
    g.fillStyle(a, 0.85); // 杆尾红绳
    g.fillRect(-3.4, -1, 1.6, 2);
  } },
  norseRacketA: { c: 0x8a94a2, a: 0x7fd4ff, draw: (g, now, c, a) => {
    // 战锤·拍：拍面是一柄巨锤——方锤头 + 铆钉 + 符文电光 + 短柄
    handle(g, -13, 0, 5, 0x6b4a2f);
    pommel(g, -13.4, 2.4, a);
    g.fillStyle(0x6b4a2f, 1);
    g.fillRect(-4, -2.4, 12, 4.8);
    g.fillStyle(c, 1); // 锤头
    g.fillRoundedRect(8, -12, 26, 24, 3);
    g.fillStyle(0xb8c0cc, 0.5);
    g.fillRect(8, -12, 26, 7);
    g.fillStyle(0x5a6472, 0.9); // 锤头中线凹槽
    g.fillRect(8, -2, 26, 4);
    for (let k = 0; k < 4; k++) { // 铆钉
      g.fillStyle(0xdfe8f5, 0.9);
      g.fillCircle(12 + (k % 2) * 18, -8 + Math.floor(k / 2) * 16, 1.4);
    }
    for (let k = 0; k < 3; k++) { // 符文电光（锤面明灭）
      const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 280 + k));
      g.fillStyle(a, gl);
      g.fillRect(13 + k * 7, -7, 2, 6);
    }
    for (const s of [-1, 1]) { // 锤端电弧
      const j = Math.sin(now / 46 + s) * 3;
      g.lineStyle(1.2, a, 0.7);
      g.lineBetween(s > 0 ? 34 : 8, s * 10, (s > 0 ? 40 : 2) + j, s * 13 + j);
    }
  } },
  norseRacketB: { c: 0xbfe8ff, a: 0xffe15c, draw: (g, now, c, a) => {
    // 永恒之枪·拍：拍面是冈格尼尔之枪——长枪锋 + 枪杆符环 + 枪尾羽饰 + 贯穿光
    handle(g, -13, 0, 4.6, 0x39424e);
    pommel(g, -13.4, 2.2, a);
    g.fillStyle(0x5a6472, 1); // 枪杆
    g.fillRect(-4, -2.2, 34, 4.4);
    g.fillStyle(0x8a94a2, 0.6);
    g.fillRect(-4, -2.2, 34, 1.6);
    for (let k = 0; k < 3; k++) { // 杆上符环（旋转的卢恩环）
      const px = 2 + k * 9;
      g.lineStyle(1.2, k % 2 ? a : c, 0.7 + 0.3 * Math.sin(now / 300 + k));
      g.strokeCircle(px, 0, 3.4);
    }
    g.fillStyle(c, 1); // 枪锋（叶形双刃）
    g.fillPoints([
      { x: 28, y: -7 }, { x: 36, y: -3.4 }, { x: 43, y: 0 }, { x: 36, y: 3.4 }, { x: 28, y: 7 }, { x: 26, y: 0 },
    ] as never, true);
    g.fillStyle(0xffffff, 0.6);
    g.fillPoints([
      { x: 28, y: -7 }, { x: 36, y: -3.4 }, { x: 43, y: 0 }, { x: 33, y: -0.6 },
    ] as never, true);
    g.fillStyle(a, 0.9); // 羽饰（枪尾三根金羽）
    for (let k = -1; k <= 1; k++) {
      g.fillTriangle(-4, k * 2, 2, k * 3 + Math.sin(now / 300 + k) * 1.2, -4, k * 2 + 2.4);
    }
    const gl = 0.5 + 0.5 * Math.sin(now / 260); // 枪锋贯穿光
    g.lineStyle(1.6, 0xffffff, gl);
    g.lineBetween(36, 0, 47, 0);
    g.fillStyle(0xffffff, gl);
    g.fillCircle(45, 0, 1.6);
  } },
};
