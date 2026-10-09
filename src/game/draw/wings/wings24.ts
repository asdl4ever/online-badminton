import { type WingArt } from './shared';

/**
 * 第六批背部装饰（斯拉夫 / 波斯 / 印加 / 波利尼西亚 / 澳洲梦幻时代）——全部是
 * **背挂物件**（`single: true`，只画一次、不镜像、不挥动），不做翅膀。
 * 挂肩高度锚点 topY+48；身前/身后层与横移由 `game/backTune.ts` 逐件调参。
 */

export const WINGS_24: Record<string, WingArt> = {
  // ── 斯拉夫密林 ──
  slavPestle: { c: 0x6a4a2a, a: 0xc8b89a, single: true, draw: (g, now, _flap, c, a) => {
    // 臼杵背架：一根开裂巨木臼杵斜插背上，金属箍、布条与木屑
    const sway = Math.sin(now / 300) * 2;
    g.save(); g.rotateCanvas(-0.5 + sway * 0.01);
    g.fillStyle(0x4a3420, 1); g.fillRoundedRect(-6, -30, 12, 62, 5);
    g.fillStyle(c, 1); g.fillRoundedRect(-4, -28, 8, 58, 4);
    g.fillStyle(a, 0.85); g.fillRect(-6, -8, 12, 3); g.fillRect(-6, 14, 12, 3);
    g.lineStyle(1.4, 0x2e2014, 0.6);
    g.lineBetween(-1, -24, 1, 22);
    // 缠布条（末端摆动）
    const cloth = Math.sin(now / 260) * 3;
    g.fillStyle(0x8a2a2a, 0.9); g.fillRect(-5, 30, 10, 4);
    g.fillPoints([{ x: -4, y: 34 }, { x: 4, y: 34 }, { x: 2 + cloth, y: 46 }, { x: -6 + cloth, y: 44 }] as never, true);
    g.restore();
    for (let k = 0; k < 4; k++) { const ph = ((now / 700 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.6); g.fillCircle(-10 + k * 6, 18 - ph * 30, 1.4); }
  } },
  slavSkullFence: { c: 0xd8e0d0, a: 0x8a6a3a, single: true, draw: (g, now, _flap, c, _a) => {
    // 骷髅篱笆：一排原木篱笆，桩顶串 3 个会点头的骷髅
    g.fillStyle(0x6a4a2a, 1); g.fillRect(-22, -4, 44, 5); g.fillRect(-22, 12, 44, 5);
    for (const bx of [-20, -8, 4, 16]) { g.fillStyle(0x5a3e22, 1); g.fillRect(bx, -24, 5, 42); }
    for (let k = 0; k < 3; k++) {
      const sx = -14 + k * 14, nod = Math.sin(now / 420 + k * 1.4) * 2;
      g.save(); g.translateCanvas(sx, -22);
      g.fillStyle(c, 1); g.fillCircle(0, nod, 6);
      g.fillStyle(0x1a1a1e, 1); g.fillCircle(-2.2, nod - 1, 1.4); g.fillCircle(2.2, nod - 1, 1.4);
      g.fillStyle(0xff5a3a, 0.7); g.fillCircle(-2.2, nod - 1, 0.7); g.fillCircle(2.2, nod - 1, 0.7);
      g.fillStyle(c, 0.95); g.fillRect(-3, nod + 5, 6, 3);
      g.restore();
    }
    g.fillStyle(0x8a2a2a, 0.85); g.fillPoints([{ x: -20, y: 17 }, { x: -12, y: 17 }, { x: -16, y: 30 }] as never, true);
  } },
  // ── 波斯圣火 ──
  persFireAltar: { c: 0x8a6a2a, a: 0xff8a2a, single: true, draw: (g, now, _flap, c, a) => {
    // 拜火祭坛：石座 + 阶梯 + 坛顶长明圣火 + 升腾烟缕
    g.fillStyle(0x5a4a2a, 1); g.fillRoundedRect(-16, 12, 32, 8, 2);
    g.fillStyle(c, 1); g.fillRoundedRect(-13, 2, 26, 12, 2);
    g.fillStyle(0x3a3020, 1); g.fillRect(-9, -6, 18, 10);
    const fire = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(0xff5a2a, 0.85); g.fillPoints([{ x: -7, y: -6 }, { x: 7, y: -6 }, { x: 4, y: -22 - fire * 4 }, { x: 0, y: -28 - fire * 5 }, { x: -4, y: -22 - fire * 4 }] as never, true);
    g.fillStyle(a, 0.95); g.fillEllipse(0, -12 - fire * 3, 6, 12);
    g.fillStyle(0xfff0b0, 0.9); g.fillEllipse(0, -12, 3, 7);
    for (let k = 0; k < 3; k++) { const ph = ((now / 700 + k / 3) % 1); g.fillStyle(0xbfc4cc, 0.5 * (1 - ph)); g.fillCircle((k - 1) * 5 + Math.sin(now / 400 + k) * 3, -30 - ph * 24, 1.6); }
  } },
  persDivHorn: { c: 0x6a2a4a, a: 0xb46cff, single: true, draw: (g, now, _flap, c, a) => {
    // 迪夫魔角：一对弯曲巨角，角尖燃幽紫魔焰
    for (const s of [-1, 1]) {
      g.lineStyle(7, 0x3a1a2a, 1); g.beginPath(); g.moveTo(s * 4, 14); g.lineTo(s * 16, -4); g.lineTo(s * 20, -22); g.strokePath();
      g.lineStyle(4.5, c, 1); g.beginPath(); g.moveTo(s * 4, 14); g.lineTo(s * 16, -4); g.lineTo(s * 20, -22); g.strokePath();
      const fl = 0.5 + 0.5 * Math.sin(now / 260 + s);
      g.fillStyle(a, 0.6 * fl); g.fillEllipse(s * 20, -24, 8, 12);
    }
    g.fillStyle(0x8a6a2a, 0.9); g.fillRect(-9, 12, 18, 5);
    g.lineStyle(1.2, 0xd8b45a, 0.8);
    for (let k = 0; k < 3; k++) g.lineBetween(-6 + k * 6, 17, -6 + k * 6, 23);
  } },
  // ── 印加太阳 ──
  incaChacana: { c: 0xd8b45a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 阶梯十字：查凯阶梯十字，刻线内金光循环、四角金钉
    const flow = (now / 1400) % 1;
    g.fillStyle(0x6a5a3a, 1); g.fillRect(-16, -16, 32, 32);
    g.fillStyle(c, 1);
    g.fillRect(-12, -12, 24, 24);
    g.fillStyle(0x4a3a1a, 1);
    const arms = [[-12, -4, 24, 8], [-4, -12, 8, 24]];
    for (const [ax, ay, aw, ah] of arms) g.fillRect(ax, ay, aw, ah);
    g.fillStyle(c, 1);
    for (let k = 0; k < 4; k++) { g.fillRect(-12 + k * 8, -12, 4, -0); }
    g.lineStyle(2, a, 0.6 + 0.4 * Math.sin(now / 300 * 0 + flow * 6));
    g.strokeRect(-10, -10, 20, 20);
    for (let k = 0; k < 4; k++) { const ang = Math.PI / 4 + k * Math.PI / 2; g.fillStyle(a, 0.9); g.fillCircle(Math.cos(ang) * 13, Math.sin(ang) * 13, 2); }
    for (let k = 0; k < 4; k++) { const ph = ((now / 900 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.6); g.fillCircle(0, 0, 6 + ph * 14); }
  } },
  incaGoldenDisk: { c: 0xffd45c, a: 0xfff0b0, single: true, draw: (g, now, _flap, c, a) => {
    // 黄金日盘：刻面金盘 + 放射光芒 + 盘心人面浮雕呼吸
    const pulse = 0.5 + 0.5 * Math.sin(now / 320);
    for (let k = 0; k < 16; k++) { const ang = (k / 16) * Math.PI * 2; const len = 24 + pulse * 5 + (k % 2) * 4; g.fillStyle(a, 0.35); g.fillTriangle(Math.cos(ang) * 22, Math.sin(ang) * 22, Math.cos(ang + 0.12) * len, Math.sin(ang + 0.12) * len, Math.cos(ang - 0.12) * len, Math.sin(ang - 0.12) * len); }
    g.fillStyle(0xb87a1a, 1); g.fillCircle(0, 0, 21);
    g.fillStyle(c, 1); g.fillCircle(0, 0, 18);
    g.fillStyle(0x8a5a1a, 1); g.fillCircle(0, -3, 9);
    g.fillStyle(c, 0.95); g.fillEllipse(0, -2, 16, 12);
    g.fillStyle(0x8a5a1a, 1); g.fillCircle(-4, -4, 1.6); g.fillCircle(4, -4, 1.6);
    g.fillStyle(0xb87a1a, 1); g.fillEllipse(0, 1, 4, 3);
    g.fillStyle(a, 0.4 * pulse); g.fillCircle(0, 0, 22);
  } },
  // ── 波利尼西亚 ──
  polyFishhook: { c: 0xd8e0cc, a: 0x5fe8d0, single: true, draw: (g, now, _flap, c, a) => {
    // 神钩背架：毛伊神钩，钩身刻纹透光、钩尖挂贝壳
    const sway = Math.sin(now / 500) * 0.05;
    g.save(); g.rotateCanvas(0.25 + sway);
    g.lineStyle(8, 0x9a8a6a, 1); g.beginPath(); g.moveTo(0, -22); g.lineTo(0, 8); g.arc(-1, 8, 10, 0, Math.PI * 0.9); g.strokePath();
    g.lineStyle(4, c, 1); g.beginPath(); g.moveTo(0, -22); g.lineTo(0, 8); g.arc(-1, 8, 10, 0, Math.PI * 0.9); g.strokePath();
    for (let k = 0; k < 5; k++) { const lit = 0.4 + 0.6 * Math.abs(Math.sin(now / 400 + k)); g.fillStyle(a, lit); g.fillCircle(-1 + Math.sin(k) * 2, -18 + k * 5, 1.2); }
    g.restore();
    for (let k = 0; k < 3; k++) { g.fillStyle(0xffe0b0, 0.95); g.fillCircle(-9 + k * 3, 22 + Math.sin(now / 400 + k) * 1.5, 2.4); }
  } },
  polyMoai: { c: 0x8a8a7a, a: 0x5fe8d0, single: true, draw: (g, now, _flap, c, a) => {
    // 摩艾石像：长耳石像，眼窝透光、底座草木
    g.fillStyle(0x6a6a5a, 1); g.fillRoundedRect(-14, -24, 28, 44, 6);
    g.fillStyle(c, 1); g.fillRoundedRect(-12, -22, 24, 40, 5);
    g.fillStyle(0x5a5a4a, 1); g.fillRoundedRect(-6, -18, 12, 14, 3); // 鼻
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(0x1a1a16, 1); g.fillEllipse(-5, -8, 5, 4); g.fillEllipse(5, -8, 5, 4);
    g.fillStyle(a, gl); g.fillCircle(-5, -8, 1.6); g.fillCircle(5, -8, 1.6);
    g.fillStyle(0x5a5a4a, 1); g.fillRoundedRect(-9, -2, 18, 4, 2);
    g.fillStyle(0x3f8a4a, 0.8); for (let k = 0; k < 4; k++) g.fillTriangle(-12 + k * 8, 20, -8 + k * 8, 20, -10 + k * 8, 14);
  } },
  // ── 澳洲梦幻时代 ──
  auzDidgeridoo: { c: 0x8a4a2a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 迪吉里杜管：彩绘点画低音管，管口循环喷音波圈
    g.save(); g.rotateCanvas(-0.35);
    g.fillStyle(0x6a3418, 1); g.fillRoundedRect(-6, -34, 12, 66, 5);
    g.fillStyle(c, 1); g.fillRoundedRect(-5, -33, 10, 64, 4);
    g.fillStyle(0xfff0d0, 0.85);
    for (let k = 0; k < 6; k++) { g.fillCircle(0, -28 + k * 10, 1.4); }
    g.fillStyle(0x2a2a2a, 0.9); g.fillEllipse(0, 30, 7, 3);
    g.restore();
    for (let k = 0; k < 3; k++) { const ph = ((now / 700 + k / 3) % 1); g.lineStyle(2 - k * 0.4, a, (1 - ph) * 0.7); g.strokeCircle(10, 18, 4 + ph * 14); }
  } },
  auzBoomerang: { c: 0xc0703a, a: 0xfff0d0, single: true, draw: (g, now, _flap, c, a) => {
    // 回力镖背架：一对点画回力镖并行自转
    for (const [s, ph] of [[0, 0], [1, Math.PI]] as Array<[number, number]>) {
      g.save(); g.translateCanvas(s * 6 - 3, 0); g.rotateCanvas(Math.sin(now / 500 + ph) * 0.3);
      const pts: Array<[number, number]> = [[-14, -8], [0, -2], [14, -8], [11, -1], [0, 4], [-11, -1]];
      g.fillStyle(0x8a4a26, 1); g.fillPoints(pts.map(([x, y]) => ({ x, y })) as never, true);
      g.fillStyle(c, 1); g.fillPoints(pts.map(([x, y]) => ({ x: x * 0.9, y: y * 0.9 })) as never, true);
      for (let k = 0; k < 3; k++) { g.fillStyle(a, 0.9); g.fillCircle(-8 + k * 8, -3 + (k % 2) * 2, 1.2); }
      g.restore();
    }
    g.fillStyle(0x3a2414, 1); g.fillRect(-10, 8, 20, 3);
  } },
};
