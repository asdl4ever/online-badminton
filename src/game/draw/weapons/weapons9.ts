import { handle, pommel, TAU, type WeaponArt } from './shared';

/** 批六主题武器（法老秘葬 / 暗部忍道）。局部空间：柄在 x ∈ [-13,-2]，拍框中心 ≈ (9,0)。 */
export const WEAPONS_9: Record<string, WeaponArt> = {
  egRacketA: { c: 0xd9b45c, a: 0x3a5a8a, draw: (g, now, c, a) => {
    // 权杖·拍：法老弯钩权杖——金杖身 + 弯钩拍头 + 圣书刻纹 + 蓝宝石镶嵌
    handle(g, -13, 0, 5, 0x8a6a2a);
    pommel(g, -13.4, 2.4, a);
    g.fillStyle(c, 1); // 杖身
    g.fillRect(-4, -3, 30, 6);
    g.fillStyle(0xfff0b0, 0.5);
    g.fillRect(-4, -3, 30, 2);
    for (let k = 0; k < 4; k++) { // 杖身刻纹
      g.fillStyle(a, 0.7);
      g.fillRect(2 + k * 7, -2.2, 2.4, 4.4);
    }
    g.fillStyle(c, 1); // 弯钩拍头（横置的钩）
    g.fillPoints([
      { x: 24, y: -6 }, { x: 32, y: -11 }, { x: 39, y: -6 }, { x: 36, y: -1 }, { x: 30, y: -2 }, { x: 24, y: 6 },
    ] as never, true);
    g.fillStyle(0xfff0b0, 0.5);
    g.fillPoints([
      { x: 32, y: -11 }, { x: 39, y: -6 }, { x: 36, y: -1 }, { x: 33, y: -6 },
    ] as never, true);
    g.fillStyle(a, 0.95); // 蓝宝石镶嵌（杖头眼）
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillCircle(30, -6, 2.6);
    g.fillStyle(0xdff2ff, gl);
    g.fillCircle(29.4, -6.6, 0.9);
    g.fillStyle(0xd9b45c, 0.9); // 杖底金球
    g.fillCircle(26, 3, 2.4);
  } },
  egRacketB: { c: 0x8a94a2, a: 0x3a5a8a, draw: (g, now, c, a) => {
    // 冥界之刃·拍：阿努比斯式弯刃——青铜弯刃 + 豺首柄首 + 冥界绿火
    handle(g, -13, 0, 4.6, 0x2a2010);
    pommel(g, -13.4, 2.2, 0xd9b45c);
    g.fillStyle(0x6b4a2f, 1); // 刃柄
    g.fillRect(-4, -2.4, 16, 4.8);
    g.fillStyle(c, 1); // 青铜弯刃（内弧弯刀）
    g.fillPoints([
      { x: 12, y: -4 }, { x: 26, y: -12 }, { x: 38, y: -8 }, { x: 40, y: 0 }, { x: 32, y: 2 }, { x: 24, y: 0 }, { x: 12, y: 4 },
    ] as never, true);
    g.fillStyle(0xc0c8d0, 0.5); // 刃口
    g.fillPoints([
      { x: 26, y: -12 }, { x: 38, y: -8 }, { x: 40, y: 0 }, { x: 35, y: -4 },
    ] as never, true);
    g.fillStyle(0xd9b45c, 0.9); // 刃根圣甲虫雕
    g.fillEllipse(16, 0, 6, 4);
    g.fillStyle(a, 0.6);
    g.lineStyle(1, a, 0.7); // 刃身刻纹
    g.lineBetween(20, -2, 33, -5);
    // 冥界绿火（刃尖游动的绿焰）
    for (let k = 0; k < 2; k++) {
      const ph = (now / 400 + k / 2) % 1;
      const fx = 40 + k * 2;
      g.fillStyle(0x5aff9a, 0.7 * Math.sin(ph * Math.PI));
      g.fillTriangle(fx - 2, 0, fx + 2, 0, fx + Math.sin(now / 90 + k) * 1.6, -5 - ph * 6);
    }
    // 豺首柄首（刃根上的豺耳剪影）
    g.fillStyle(0x1a1408, 1);
    g.fillTriangle(10, -4, 13, -9, 15, -3);
  } },
  njaRacketA: { c: 0x8a94a2, a: 0xc0392b, draw: (g, now, c, a) => {
    // 苦无·拍：拍面是一支巨型苦无——菱形锋 + 环尾 + 柄缠带 + 甩出的刀布
    handle(g, -13, 0, 4.4, 0x1a1a22);
    pommel(g, -13.4, 2.2, a);
    g.fillStyle(0x1a1a22, 1); // 柄
    g.fillRect(-4, -2.2, 18, 4.4);
    g.lineStyle(0.9, 0x3a3a44, 0.95); // 缠带
    for (let k = 0; k < 5; k++) g.lineBetween(-3.4 + k * 3.4, -2.2, -2.4 + k * 3.4, 2.2);
    g.fillStyle(c, 1); // 菱形锋
    g.fillPoints([
      { x: 14, y: -5.4 }, { x: 34, y: -2 }, { x: 42, y: 0 }, { x: 34, y: 2 }, { x: 14, y: 5.4 },
    ] as never, true);
    g.fillStyle(0xdfe8f5, 0.55);
    g.fillPoints([
      { x: 14, y: -5.4 }, { x: 34, y: -2 }, { x: 38, y: -0.6 }, { x: 14, y: -1 },
    ] as never, true);
    g.fillStyle(a, 0.9); // 环尾（柄尾钢环）
    g.lineStyle(2, a, 0.95);
    g.strokeCircle(-15, 0, 3.2);
    // 刀布（环上系的重布条，甩动）
    const sway = Math.sin(now / 260) * 3;
    g.fillStyle(0x8a2a30, 0.9);
    g.fillPoints([
      { x: -15, y: 3 }, { x: -12 + sway, y: 12 }, { x: -16 + sway, y: 14 },
    ] as never, true);
    const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 300)); // 锋尖寒光
    g.fillStyle(0xffffff, gl);
    g.fillRect(40, -1, 3.4, 2);
  } },
  njaRacketB: { c: 0x6a4a2a, a: 0xb08ad0, draw: (g, now, c, a) => {
    // 锁镰·拍：拍面是锁镰——镰刃 + 长链 + 链端铁锤 + 链环甩动
    handle(g, -13, 0, 4.4, 0x1a1a22);
    pommel(g, -13.4, 2.2, a);
    g.fillStyle(c, 1); // 镰柄
    g.fillRect(-2, -2.4, 22, 4.8);
    g.fillStyle(0x8a6a3a, 0.5);
    g.fillRect(-2, -2.4, 22, 1.6);
    g.fillStyle(0xb8c0cc, 1); // 镰刃（上弯月刃）
    g.fillPoints([
      { x: 18, y: -4 }, { x: 28, y: -12 }, { x: 37, y: -13 }, { x: 30, y: -8 }, { x: 21, y: -2 },
    ] as never, true);
    g.fillStyle(0xdfe8f5, 0.5);
    g.fillPoints([
      { x: 28, y: -12 }, { x: 37, y: -13 }, { x: 30, y: -8 },
    ] as never, true);
    // 长链（从柄尾垂出再甩向前，链环逐节）
    const chain: Array<[number, number]> = [];
    for (let k = 0; k <= 8; k++) {
      const u = k / 8;
      chain.push([2 + u * 26, 10 + Math.sin(u * 4 + now / 300) * 4 * u + u * 4]);
    }
    for (let k = 0; k < chain.length; k++) {
      const [px, py] = chain[k];
      g.lineStyle(1.2, 0x8a94a2, 0.95);
      g.strokeCircle(px, py, 1.8);
    }
    const [ex, ey] = chain[chain.length - 1]; // 链端铁锤
    g.fillStyle(0x5a6472, 1);
    g.fillCircle(ex + 3, ey, 4);
    g.fillStyle(0xb8c0cc, 0.6);
    g.fillCircle(ex + 2, ey - 1.4, 1.6);
    for (let k = 0; k < 4; k++) { // 锤上尖刺
      const ang = (k / 4) * TAU + now / 500;
      g.fillStyle(0x8a94a2, 1);
      g.fillTriangle(
        ex + 3 + Math.cos(ang) * 3, ey + Math.sin(ang) * 3,
        ex + 3 + Math.cos(ang + 0.5) * 3, ey + Math.sin(ang + 0.5) * 3,
        ex + 3 + Math.cos(ang + 0.25) * 6, ey + Math.sin(ang + 0.25) * 6,
      );
    }
    g.fillStyle(a, 0.6 + 0.3 * Math.sin(now / 350)); // 镰刃符光
    g.lineStyle(1, a, 0.6);
    g.lineBetween(24, -6, 33, -9);
  } },
};
