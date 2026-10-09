import { type CapeArt } from './shared';

/**
 * 第八批背部装饰（冰海巨兽 / 极夜冰海 / 寒潮海象 / 维度裂隙 / 幽光深渊）——披风包里的
 * **背挂物件**（`single: true`），挂垂坠高度锚点 topY+30。
 */

export const CAPES_14: Record<string, CapeArt> = {
  // 冰海巨兽
  glacIceBlock: { c: 0xbfe8ff, a: 0x5fd8ff, single: true, draw: (g, now, _sway, c, a) => {
    // 浮冰背箱：背一块浮冰，冰面反光、滴水
    g.fillStyle(0x8fd8ff, 0.55); g.fillPoints([{ x: -16, y: 16 }, { x: -14, y: -10 }, { x: 4, y: -18 }, { x: 16, y: -4 }, { x: 12, y: 16 }] as never, true);
    g.fillStyle(c, 0.9); g.fillPoints([{ x: -13, y: 13 }, { x: -11, y: -8 }, { x: 3, y: -14 }, { x: 13, y: -3 }, { x: 9, y: 13 }] as never, true);
    g.fillStyle(0xffffff, 0.6); g.fillPoints([{ x: -11, y: -8 }, { x: 3, y: -14 }, { x: 1, y: -6 }] as never, true);
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillEllipse(-8 + k * 8, 16 + ph * 12, 1.6, 3); }
  } },
  // 极夜冰海
  fridLamp: { c: 0x7dffd0, a: 0x39ffd0, single: true, draw: (g, now, _sway, c, a) => {
    // 深海灯背箱：背一个小灯箱，灯光一明一暗照着周围
    g.fillStyle(0x2a3a44, 1); g.fillRoundedRect(-11, -4, 22, 26, 4);
    g.fillStyle(0x1a2a32, 1); g.fillRoundedRect(-8, 0, 16, 16, 3);
    const gl = 0.5 + 0.5 * Math.sin(now / 500);
    g.fillStyle(c, 0.4 * gl); g.fillCircle(0, 8, 16);
    g.fillStyle(a, gl); g.fillCircle(0, 8, 6);
    g.fillStyle(0xffffff, 0.9 * gl); g.fillCircle(0, 8, 2.4);
    g.fillStyle(0x6a7a82, 1); g.fillRect(-4, -10, 8, 7);
    for (let k = 0; k < 4; k++) { const ph = ((now / 1000 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.6); g.fillCircle(-6 + k * 4, 14 - ph * 12, 1.3); }
  } },
  // 寒潮海象
  walrCrate: { c: 0x8a6a3a, a: 0xd8e8f0, single: true, draw: (g, now, _sway, c, a) => {
    // 渔获木箱：背一只装满渔获的木箱，鱼尾翘出、霜花
    g.fillStyle(0x5a4224, 1); g.fillRoundedRect(-13, -6, 26, 24, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-12, -5, 24, 22, 2);
    g.lineStyle(1.4, 0x4a3420, 0.8); g.lineBetween(-12, 3, 12, 3); g.lineBetween(-12, 11, 12, 11);
    g.fillStyle(0x8fd8ff, 0.9); g.fillPoints([{ x: -3, y: -6 }, { x: 3, y: -6 }, { x: 6, y: -16 }, { x: -6, y: -16 }] as never, true);
    g.fillStyle(0x5a8a9a, 0.9); g.fillTriangle(0, -6, 10, -14, 2, -6);
    g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 400)); g.fillEllipse(0, 10, 22, 4);
  } },
  // 维度裂隙
  dimCore: { c: 0xb08aff, a: 0x7dffd0, single: true, draw: (g, now, _sway, c, a) => {
    // 维度核心：背一颗悬浮的维度核心，格子壳旋转、内部塌陷
    const rot = now / 1400;
    g.fillStyle(0x0a0618, 1); g.fillCircle(0, 0, 16);
    g.fillStyle(c, 0.9); g.fillCircle(0, 0, 13);
    g.fillStyle(0x0a0618, 1); g.fillCircle(0, 0, 9);
    for (let k = 0; k < 8; k++) { const ang = rot + (k / 8) * Math.PI * 2; g.fillStyle(a, 0.8); g.fillRect(Math.cos(ang) * 11 - 2, Math.sin(ang) * 11 - 2, 4, 4); }
    const pulse = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(a, 0.5 * pulse); g.fillCircle(0, 0, 7);
    g.fillStyle(0xffffff, 0.7); g.fillCircle(0, 0, 2.4);
  } },
  // 幽光深渊
  hadalLureBox: { c: 0x39ffd0, a: 0x2a6a6a, single: true, draw: (g, now, _sway, c, a) => {
    // 诱饵箱：背一只幽光诱饵箱，前方挑出一颗脉动的诱饵灯
    g.fillStyle(0x143038, 1); g.fillRoundedRect(-11, -2, 22, 24, 4);
    g.fillStyle(a, 1); g.fillRoundedRect(-9, 0, 18, 20, 3);
    g.lineStyle(4, a, 1); g.beginPath(); g.moveTo(0, -2); g.lineTo(6, -16); g.strokePath();
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(c, 0.4 * gl); g.fillCircle(6, -18, 12);
    g.fillStyle(c, gl); g.fillCircle(6, -18, 5);
    g.fillStyle(0xffffff, 0.9 * gl); g.fillCircle(6, -18, 2);
    for (let k = 0; k < 3; k++) { g.fillStyle(0x6a8a7a, 0.8); g.fillCircle(-5 + k * 5, 8, 1.6); }
  } },
};
