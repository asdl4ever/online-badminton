import { type CapeArt } from './shared';

/**
 * 第七批背部装饰（纳米矩阵 / 数据洪流 / 曲速跃迁 / 火星殖民 / 先行者遗迹）——披风包里的
 * **背挂物件**（`single: true`）：不套披风变换，只画一次，挂垂坠高度锚点 topY+30。
 */

export const CAPES_13: Record<string, CapeArt> = {
  // 纳米
  nanoCanister: { c: 0x4affd0, a: 0x7fe8ff, single: true, draw: (g, now, _sway, c, a) => {
    // 纳米罐：罐内粒子翻涌
    g.fillStyle(0x0e2a30, 1); g.fillRoundedRect(-11, -2, 22, 28, 5);
    g.fillStyle(c, 1); g.fillRoundedRect(-9, 0, 18, 24, 4);
    g.fillStyle(0x0a1e22, 0.5); g.fillEllipse(0, 12, 16, 18);
    for (let k = 0; k < 8; k++) { const ph = ((now / 700 + k / 8) % 1); g.fillStyle(a, 0.8 * (1 - ph)); g.fillCircle(-7 + (k * 5 % 14), 22 - ph * 20, 1.4); }
    g.fillStyle(0x8a9298, 1); g.fillRect(-4, -6, 8, 5);
  } },
  // 数据
  dataCableCoil: { c: 0x4affc4, a: 0x7fb8ff, single: true, draw: (g, now, _sway, c, a) => {
    // 数据线圈：一卷光纤线圈，光点沿缆流动
    g.fillStyle(0x14262a, 1); g.fillCircle(0, 0, 20);
    g.fillStyle(c, 1); g.fillCircle(0, 0, 17);
    g.fillStyle(0x0a1a1e, 1); g.fillCircle(0, 0, 6);
    for (let k = 0; k < 3; k++) { g.lineStyle(2, 0x0a1a1e, 0.7); g.beginPath(); g.arc(0, 0, 9 + k * 4, 0, Math.PI * 2); g.strokePath(); }
    g.fillStyle(a, 0.7); for (let k = 0; k < 3; k++) { const ang = now / 400 + k * 2.1; g.fillCircle(Math.cos(ang) * 13, Math.sin(ang) * 13, 1.8); }
    g.fillStyle(0x1a2a2e, 1); g.fillRect(-6, 16, 12, 10);
    g.fillStyle(c, 0.9); g.fillRect(-3, 26, 6, 8);
  } },
  // 曲速
  warpTank: { c: 0x5a7aff, a: 0xa98cff, single: true, draw: (g, now, _sway, c, a) => {
    // 曲速燃料罐：罐内星云翻涌
    g.fillStyle(0x141a3a, 1); g.fillRoundedRect(-12, -4, 24, 32, 6);
    g.fillStyle(c, 0.9); g.fillRoundedRect(-10, -2, 20, 28, 5);
    for (let k = 0; k < 5; k++) { const ph = ((now / 900 + k / 5) % 1); g.fillStyle(k % 2 ? a : 0x9fd8ff, 0.5 * (1 - ph)); g.fillCircle(-6 + (k * 6 % 12), 22 - ph * 26, 4 - ph * 2); }
    g.fillStyle(0x8a9ab0, 1); g.fillRect(-4, -8, 8, 5);
    g.fillStyle(a, 0.7); g.fillCircle(0, 12, 2);
  } },
  // 火星
  marsFlag: { c: 0xc0462a, a: 0xff7a4a, single: true, draw: (g, now, _sway, c, a) => {
    // 火星旗背架：一面插在支架上的火星旗，旗面飘
    g.fillStyle(0x8a9298, 1); g.fillRect(-2, -18, 4, 46);
    const fl = Math.sin(now / 400) * 3;
    g.fillStyle(c, 1); g.fillPoints([{ x: 2, y: -18 }, { x: 24, y: -16 + fl }, { x: 22, y: -2 + fl }, { x: 2, y: -2 }] as never, true);
    g.fillStyle(0x3a1a12, 0.6); g.fillEllipse(11, -9, 8, 8);
    g.fillStyle(a, 0.9); g.fillCircle(11, -9, 3.4);
    g.fillStyle(0xffe0b0, 0.9); g.fillCircle(17, -13, 1.6);
    g.fillStyle(0x8a9298, 1); g.fillRect(-8, 26, 16, 4);
  } },
  // 先行者
  forerCell: { c: 0x5ad8ff, a: 0xa8e0ff, single: true, draw: (g, now, _sway, c, a) => {
    // 能量电池：内部能量液翻涌
    g.fillStyle(0x16242e, 1); g.fillRoundedRect(-11, -22, 22, 44, 8);
    g.fillStyle(0x0a141c, 1); g.fillRoundedRect(-8, -20, 16, 40, 6);
    const lvl = 0.5 + 0.5 * Math.sin(now / 500);
    g.fillStyle(c, 0.7); g.fillRoundedRect(-8, 20 - lvl * 40, 16, lvl * 40, 6);
    g.fillStyle(a, 0.9); g.fillEllipse(0, 20 - lvl * 40, 14, 5);
    for (let k = 0; k < 4; k++) { const ph = ((now / 800 + k / 4) % 1); g.fillStyle(a, 0.7 * (1 - ph)); g.fillCircle(-4 + k * 3, 14 - ph * 30, 1.3); }
    g.fillStyle(0x8a9298, 1); g.fillRect(-4, -26, 8, 6);
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillCircle(0, 0, 12);
  } },
};
