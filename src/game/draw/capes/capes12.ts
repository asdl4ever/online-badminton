import { type CapeArt } from './shared';

/**
 * 第六批背部装饰（斯拉夫 / 波斯 / 印加 / 波利尼西亚 / 澳洲梦幻时代）——披风包里的
 * **背挂物件**（`single: true`）：不套披风变换，只画一次，挂垂坠高度锚点 topY+30。
 */

export const CAPES_12: Record<string, CapeArt> = {
  // 斯拉夫
  slavSamovar: { c: 0xb8722a, a: 0xd8c8a0, single: true, draw: (g, now, _sway, c, a) => {
    // 茶炊背箱：一只铜制俄式茶炊，顶上小壶循环冒白汽
    g.fillStyle(0x8a4a1a, 1); g.fillRoundedRect(-12, -4, 24, 26, 6);
    g.fillStyle(c, 1); g.fillRoundedRect(-11, -3, 22, 24, 5);
    g.fillStyle(a, 0.6); g.fillRect(-11, 4, 22, 2);
    g.fillStyle(0x8a4a1a, 1); g.fillRoundedRect(-6, -14, 12, 11, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-5, -13, 10, 9, 3);
    g.fillStyle(0x3a2414, 1); g.fillRect(-3, -19, 6, 6);
    for (let k = 0; k < 3; k++) { const ph = ((now / 800 + k / 3) % 1); g.fillStyle(0xffffff, 0.7 * (1 - ph)); g.fillCircle(-3 + k * 3 + Math.sin(now / 500 + k) * 3, -20 - ph * 16, 2 - ph * 1.4); }
    g.fillStyle(0x3a2414, 1); g.fillRect(-9, 20, 4, 4); g.fillRect(5, 20, 4, 4);
  } },
  // 波斯
  persCarpetRoll: { c: 0x8a2a3a, a: 0xffd45c, single: true, draw: (g, now, _sway, c, a) => {
    // 卷毯背架：一卷波斯地毯斜挎，纹样沿毯卷缓慢滚动
    g.save(); g.rotateCanvas(0.35);
    g.fillStyle(0x5a1a24, 1); g.fillRoundedRect(-7, -28, 14, 56, 6);
    g.fillStyle(c, 1); g.fillRoundedRect(-6, -27, 12, 54, 5);
    const roll = (now / 1400) % 1;
    for (let k = 0; k < 5; k++) { const yy = -24 + ((k + roll) % 5) * 10; g.fillStyle(a, 0.9); g.fillRect(-6, yy, 12, 2); }
    g.fillStyle(0xfff0d0, 0.7); g.fillCircle(0, -24, 4);
    g.restore();
    for (let k = 0; k < 4; k++) { g.fillStyle(k % 2 ? a : 0xff8a6a, 0.9); g.fillRect(-4 + k * 3, 24 + Math.sin(now / 400 + k) * 1.5, 2, 6); }
  } },
  // 印加
  incaQuipu: { c: 0xd8b45a, a: 0xffd45c, single: true, draw: (g, now, _sway, _c, _a) => {
    // 奇普绳结：一束垂下的彩绳，绳结以相位依次亮起
    g.fillStyle(0x8a6a2a, 1); g.fillRoundedRect(-12, -16, 24, 5, 2);
    const cols = [0xd8b45a, 0xe8404a, 0x5a8aff, 0x8fd45a, 0xff8a5c];
    for (let k = 0; k < 5; k++) {
      const bx = -10 + k * 5, len = 24 + (k % 3) * 8;
      g.lineStyle(1.6, cols[k], 0.95); g.beginPath(); g.moveTo(bx, -11); g.lineTo(bx + Math.sin(now / 500 + k) * 2, -11 + len); g.strokePath();
      for (let j = 0; j < 3; j++) {
        const lit = Math.max(0, Math.sin(now / 400 - k - j));
        g.fillStyle(cols[(k + j) % 5], 0.5 + 0.5 * lit); g.fillCircle(bx, -4 + j * (len / 3), 1.6);
      }
    }
  } },
  // 波利尼西亚
  polyConch: { c: 0xffe0b0, a: 0x5fe8d0, single: true, draw: (g, now, _sway, c, a) => {
    // 海螺号角：螺口循环吐气泡，螺身纹反光
    g.fillStyle(0xc8a880, 1); g.fillEllipse(0, 0, 26, 20);
    g.fillStyle(c, 1); g.fillEllipse(-1, -1, 22, 16);
    g.fillStyle(0xc8a880, 1); g.fillEllipse(7, 3, 12, 9);
    g.lineStyle(1.6, 0xb89070, 0.7); for (let k = 0; k < 3; k++) g.arc(0, 0, 6 + k * 4, 0.6, 2.4);
    g.fillStyle(a, 0.8); g.fillCircle(-8, -3, 2);
    for (let k = 0; k < 4; k++) { const ph = ((now / 700 + k / 4) % 1); g.lineStyle(1.4, 0xffffff, 0.6 * (1 - ph)); g.strokeCircle(9, 3, 3 + ph * 12); }
  } },
  // 澳洲梦幻时代
  auzCoolamon: { c: 0x8a4a26, a: 0xff8a4a, single: true, draw: (g, now, _sway, c, a) => {
    // 圣火木盘：木雕摇篮盘盛发光余烬，火星循环上飘
    g.fillStyle(0x5a3018, 1); g.fillEllipse(0, 4, 30, 14);
    g.fillStyle(c, 1); g.fillEllipse(0, 3, 26, 11);
    g.fillStyle(0x3a2010, 1); g.fillEllipse(0, 4, 20, 7);
    g.fillStyle(0xff6a2a, 0.9); g.fillEllipse(0, 4, 16, 5);
    g.fillStyle(0xffd45c, 0.95); g.fillEllipse(0, 4, 10, 3);
    for (let k = 0; k < 4; k++) { const ph = ((now / 800 + k / 4) % 1); g.fillStyle(k % 2 ? a : 0xffd45c, (1 - ph) * 0.9); g.fillCircle(-6 + k * 4 + Math.sin(now / 400 + k) * 2, 2 - ph * 18, 1.4); }
    g.fillStyle(0xfff0d0, 0.6); for (let k = 0; k < 3; k++) g.fillCircle(-10 + k * 10, -1, 1.2);
  } },
};
