import { TAU, type WingArt } from './shared';

/**
 * 第九批背部装饰（恐龙 / 史前 / 神话 / 恶搞 10 主题）——全部是**背挂物件**（`single: true`），
 * 不做翅膀。挂肩高度锚点 topY+48。逐件独立造型。
 */

export const WINGS_27: Record<string, WingArt> = {
  // ── 白垩纪猎场 ──
  cretAmber: { c: 0xd89a3a, a: 0x8a5a20, single: true, draw: (g, now, _flap, c, a) => {
    // 琥珀背匣：背匣里一块大琥珀，内封小虫
    g.fillStyle(0x5a4228, 1); g.fillRoundedRect(-16, -6, 32, 40, 4);
    g.fillStyle(0x6a4e2e, 1); g.fillRoundedRect(-14, -4, 28, 36, 3);
    g.fillStyle(c, 0.85); g.fillEllipse(0, 12, 22, 28);
    g.fillStyle(0xffe08a, 0.5); g.fillEllipse(-3, 8, 12, 16);
    g.fillStyle(0x3a2a12, 0.9); g.fillEllipse(2 + Math.sin(now / 600) * 1.5, 14, 5, 3); g.lineStyle(1, 0x3a2a12, 0.8); g.lineBetween(-2, 12, 6, 16); g.lineBetween(-2, 16, 6, 12);
    g.fillStyle(a, 0.6); g.fillRect(-16, 26, 32, 3);
  } },
  cretPtero: { c: 0x6a8a3a, a: 0xe8d07a, single: true, draw: (g, now, _flap, c, a) => {
    // 翼膜背帆：翼龙骨 + 皮质膜
    const sway = Math.sin(now / 500) * 3;
    g.fillStyle(0x4a3a22, 1); g.fillRect(-2, -30, 4, 60);
    g.fillStyle(c, 0.9);
    g.fillPoints([{ x: -2, y: -28 }, { x: -34, y: -6 + sway }, { x: -26, y: 20 + sway }, { x: -2, y: 6 }] as never, true);
    g.fillPoints([{ x: 2, y: -28 }, { x: 34, y: -6 + sway }, { x: 26, y: 20 + sway }, { x: 2, y: 6 }] as never, true);
    g.lineStyle(1.4, a, 0.7); g.lineBetween(-2, -28, -30, -2 + sway); g.lineBetween(-2, -28, -24, 16 + sway); g.lineBetween(2, -28, 30, -2 + sway); g.lineBetween(2, -28, 24, 16 + sway);
    g.fillStyle(0x4a3a22, 1); g.fillRect(-3, -30, 6, 4);
  } },
  cretEggs: { c: 0xe8d0a0, a: 0x8a5a20, single: true, draw: (g, now, _flap, c, a) => {
    // 恐龙蛋背篓：一篓带斑纹的蛋
    const bob = Math.sin(now / 600) * 1.4;
    g.fillStyle(0x6a4e2e, 1); g.fillRoundedRect(-15, -4, 30, 34, 4);
    g.fillStyle(0x8a6a3a, 1); g.fillRoundedRect(-13, -2, 26, 30, 3);
    for (let k = 0; k < 3; k++) { const ex = -8 + k * 8, ey = 8 + (k % 2) * 6 + bob; g.fillStyle(c, 1); g.fillEllipse(ex, ey, 12, 15); g.fillStyle(a, 0.7); g.fillCircle(ex - 2, ey - 3, 1.5); g.fillCircle(ex + 3, ey + 2, 1.2); }
    g.fillStyle(0x5a4228, 1); g.fillRect(-16, 24, 32, 4);
  } },
  cretSpineRack: { c: 0xd8d0c0, a: 0x8a8478, single: true, draw: (g, _now, _flap, c, a) => {
    // 龙脊背架：一串龙脊椎骨
    g.fillStyle(0x3a3028, 1); g.fillRect(-2, -32, 4, 64);
    for (let k = 0; k < 6; k++) { const yy = -28 + k * 11; g.fillStyle(c, 1); g.fillPoints([{ x: -2, y: yy }, { x: -14, y: yy - 5 }, { x: -12, y: yy + 4 }, { x: -2, y: yy + 7 }] as never, true); g.fillPoints([{ x: 2, y: yy }, { x: 14, y: yy - 5 }, { x: 12, y: yy + 4 }, { x: 2, y: yy + 7 }] as never, true); }
    g.fillStyle(a, 0.8); g.fillCircle(0, -32, 3);
  } },
  cretFossilPack: { c: 0x8a7a5a, a: 0xd8d0c0, single: true, draw: (g, _now, _flap, c, a) => {
    // 化石背包：背包外露出一截骨化石
    g.fillStyle(0x4a3a22, 1); g.fillRoundedRect(-14, -2, 28, 36, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(-12, 0, 24, 32, 3);
    g.lineStyle(1.2, 0x2a2014, 0.5); g.lineBetween(-12, 10, 12, 12); g.lineBetween(-12, 20, 12, 22);
    g.fillStyle(a, 1); g.fillEllipse(0, 12, 8, 16); g.fillCircle(0, 4, 5); g.fillCircle(0, 20, 5);
  } },
  // ── 史前沼泽 ──
  swampVine: { c: 0x3a7a4a, a: 0x7dff9a, single: true, draw: (g, now, _flap, c, a) => {
    // 藤木背篓：湿藤编篓 + 垂藤
    g.fillStyle(0x2a4a2a, 1); g.fillRoundedRect(-15, -2, 30, 34, 5);
    g.fillStyle(c, 1); g.fillRoundedRect(-13, 0, 26, 30, 4);
    for (let k = 0; k < 4; k++) { g.lineStyle(2, 0x2a4a2a, 0.6); g.lineBetween(-13, 4 + k * 8, 13, 6 + k * 8); }
    for (let k = 0; k < 4; k++) { const vx = -12 + k * 8; g.fillStyle(c, 0.9); g.fillPoints([{ x: vx, y: 30 }, { x: vx + 4, y: 30 }, { x: vx + 3 + Math.sin(now / 500 + k) * 2, y: 42 }, { x: vx + Math.sin(now / 500 + k) * 2, y: 42 }] as never, true); }
    g.fillStyle(a, 0.7); g.fillCircle(6, 34 + Math.sin(now / 700) * 2, 2);
  } },
  swampGas: { c: 0x6a7a4a, a: 0x7dff9a, single: true, draw: (g, now, _flap, c, a) => {
    // 沼气陶罐：背上陶罐冒沼气泡
    g.fillStyle(0x4a3a2a, 1); g.fillEllipse(0, 14, 30, 34);
    g.fillStyle(c, 1); g.fillEllipse(0, 12, 26, 30);
    g.fillStyle(0x4a3a2a, 1); g.fillRect(-9, -6, 18, 8); g.fillRect(-6, -12, 12, 6);
    g.fillStyle(0x2a2014, 0.5); g.fillEllipse(0, 12, 18, 22);
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(-4 + k * 4, -12 - ph * 20, 2 + (1 - ph) * 2); }
  } },
  swampTotem: { c: 0x6a5a3a, a: 0x7dff9a, single: true, draw: (g, now, _flap, c, a) => {
    // 藤蔓图腾：缠藤木图腾，眼窝发光
    g.fillStyle(0x3a3020, 1); g.fillRoundedRect(-9, -34, 18, 66, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-7, -32, 14, 62, 3);
    g.lineStyle(1.4, 0x2a4a20, 0.8); for (let k = 0; k < 4; k++) { g.lineBetween(-9, -26 + k * 16, 9, -22 + k * 16); }
    g.fillStyle(a, 0.5 + 0.5 * Math.sin(now / 300)); g.fillCircle(-3, -20, 2.4); g.fillCircle(3, -20, 2.4);
    g.fillStyle(0x2a4a20, 1); g.fillRect(-9, -6, 18, 3);
  } },
  swampReed: { c: 0x8fae4a, a: 0x7dff9a, single: true, draw: (g, now, _flap, c, a) => {
    // 芦苇背架：一束芦苇
    g.fillStyle(0x4a5a2a, 1); g.fillRoundedRect(-12, 6, 24, 22, 3);
    for (let k = 0; k < 5; k++) { const rx = -10 + k * 5, sway = Math.sin(now / 600 + k) * 3; g.lineStyle(2, c, 1); g.lineBetween(rx, 8, rx + sway, -30 - k * 2); g.fillStyle(a, 0.9); g.fillEllipse(rx + sway, -32 - k * 2, 3.4, 8); }
  } },
  swampCage: { c: 0x6a5a3a, a: 0x7dff9a, single: true, draw: (g, now, _flap, c, a) => {
    // 藤笼：背上的藤笼，里关着萤火虫
    const sway = Math.sin(now / 700) * 2;
    g.fillStyle(c, 1); g.fillRoundedRect(-13, -6, 26, 40, 6);
    g.lineStyle(1.6, 0x3a3020, 0.9); for (let k = 0; k < 4; k++) { g.lineBetween(-13, 0 + k * 10, 13, 0 + k * 10); } for (let k = 0; k < 3; k++) { g.lineBetween(-9 + k * 9, -6, -9 + k * 9, 34); }
    g.fillStyle(0x2a2014, 1); g.fillRect(-14, 32, 28, 4);
    for (let k = 0; k < 3; k++) { const on = 0.4 + 0.6 * Math.abs(Math.sin(now / 400 + k * 2)); g.fillStyle(a, on); g.fillCircle(-5 + k * 5 + sway, 8 + k * 4, 2); }
  } },
  swampMudPack: { c: 0x5a4a32, a: 0x7dff9a, single: true, draw: (g, now, _flap, c, a) => {
    // 泥板背包：一块裂开的泥板
    g.fillStyle(0x3a3020, 1); g.fillRoundedRect(-14, -8, 28, 42, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-12, -6, 24, 38, 2);
    g.lineStyle(1.2, 0x2a2014, 0.8); g.lineBetween(-12, 4, 12, 6); g.lineBetween(-12, 16, 12, 14); g.lineBetween(-2, -6, -4, 8); g.lineBetween(4, -6, 6, 14);
    for (let k = 0; k < 3; k++) { const ph = ((now / 1000 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.6); g.fillCircle(-8 + k * 8, 30 + ph * 12, 1.6); }
  } },
  // ── 冰河世纪 ──
  iceageFire: { c: 0xff9a3c, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 火种背篓：篓里护着一簇火
    g.fillStyle(0x4a3a22, 1); g.fillRoundedRect(-13, 2, 26, 32, 4);
    g.fillStyle(0x6a5236, 1); g.fillRoundedRect(-11, 4, 22, 28, 3);
    const fl = Math.sin(now / 120) * 1.6;
    g.fillStyle(0xff5a1a, 0.9); g.fillPoints([{ x: -7, y: 4 }, { x: 7, y: 4 }, { x: 2 + fl, y: -16 }] as never, true);
    g.fillStyle(c, 0.95); g.fillPoints([{ x: -5, y: 4 }, { x: 5, y: 4 }, { x: fl, y: -10 - fl }] as never, true);
    g.fillStyle(a, 0.9); g.fillPoints([{ x: -2, y: 4 }, { x: 2, y: 4 }, { x: fl, y: -4 }] as never, true);
    for (let k = 0; k < 4; k++) { const ph = ((now / 700 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(-6 + k * 4, -16 - ph * 20, 1.6); }
  } },
  iceagePelt: { c: 0x8a6a4a, a: 0xd8c8b0, single: true, draw: (g, now, _flap, c, a) => {
    // 兽皮卷轴：卷起的厚兽皮
    g.fillStyle(0x3a2a1a, 1); g.fillRoundedRect(-16, 2, 32, 26, 6);
    g.fillStyle(c, 1); g.fillRoundedRect(-15, 3, 30, 24, 6);
    g.fillStyle(a, 0.8); g.fillEllipse(-15, 15, 6, 24); g.fillEllipse(15, 15, 6, 24);
    g.lineStyle(1.2, 0x5a4228, 0.6); g.lineBetween(-12, 9, 12, 11); g.lineBetween(-12, 20, 12, 18);
    const tilt = Math.sin(now / 800) * 1;
    g.fillStyle(0x8a6a4a, 1); g.fillTriangle(15, 6, 15, 24, 24 + tilt, 15);
  } },
  iceageTotem: { c: 0x8fd8ff, a: 0xdff4ff, single: true, draw: (g, now, _flap, c, a) => {
    // 冰锥图腾：一串冰锥
    g.fillStyle(0x2f5a78, 1); g.fillRect(-2, -28, 4, 56);
    for (let k = 0; k < 4; k++) { const yy = -24 + k * 16; g.fillStyle(c, 0.85); g.fillPoints([{ x: -3, y: yy }, { x: 14, y: yy + 4 }, { x: -3, y: yy + 10 }] as never, true); g.fillStyle(a, 0.7); g.fillPoints([{ x: -3, y: yy + 1 }, { x: 8, y: yy + 4 }, { x: -3, y: yy + 6 }] as never, true); }
    g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 400)); g.fillCircle(0, -30, 3);
  } },
  // ── 非洲雷神 ──
  yorAxe: { c: 0xd8c0a0, a: 0xffe08a, single: true, draw: (g, now, _flap, c, a) => {
    // 雷刃双斧：交叉双刃斧，刃上游电
    g.save(); g.rotateCanvas(-0.5);
    g.fillStyle(0x6a4a2a, 1); g.fillRect(-2, -34, 4, 68);
    g.fillStyle(c, 1); g.fillPoints([{ x: -2, y: -30 }, { x: -16, y: -22 }, { x: -2, y: -6 }] as never, true); g.fillPoints([{ x: 2, y: -30 }, { x: 16, y: -22 }, { x: 2, y: -6 }] as never, true);
    g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 150)); g.fillPoints([{ x: -2, y: -28 }, { x: -12, y: -22 }, { x: -2, y: -10 }] as never, true); g.fillPoints([{ x: 2, y: -28 }, { x: 12, y: -22 }, { x: 2, y: -10 }] as never, true);
    g.restore();
    g.lineStyle(1.6, a, 0.7); g.lineBetween(-10, -18, -4, -12); g.lineBetween(4, -18, 10, -12);
  } },
  yorDrum: { c: 0x8a4a2a, a: 0xffe08a, single: true, draw: (g, now, _flap, c, a) => {
    // 图腾战鼓：背鼓
    const hit = Math.abs(Math.sin(now / 300)) * 1.5;
    g.fillStyle(0x5a3020, 1); g.fillEllipse(0, 12, 34, 40);
    g.fillStyle(c, 1); g.fillEllipse(0, 10, 30, 36);
    g.fillStyle(0xd8b088, 1); g.fillEllipse(0, 4, 30, 12); g.fillEllipse(0, 26, 30, 12);
    g.lineStyle(2, 0x3a2014, 0.7); g.lineBetween(-15, 4, -15 + 30, 26); g.lineBetween(-15, 26, 15, 4);
    g.fillStyle(a, 0.6); g.fillEllipse(0, 4, 30 - hit * 2, 12 - hit);
    for (let k = 0; k < 3; k++) { g.fillStyle(a, 0.5 * (1 - k / 3)); g.fillEllipse(0, 14, 30 + k * 10, 40 + k * 10); }
  } },
  // ── 芬兰史诗 ──
  kalKantele: { c: 0xa8763a, a: 0xd8e8f0, single: true, draw: (g, now, _flap, c, a) => {
    // 康特勒琴：五弦竖琴
    g.fillStyle(0x6a4a26, 1); g.fillRoundedRect(-14, -26, 28, 52, 6);
    g.fillStyle(c, 1); g.fillRoundedRect(-12, -24, 24, 48, 5);
    g.fillStyle(0x3a2a14, 1); g.fillEllipse(0, -24, 20, 8);
    for (let k = 0; k < 5; k++) { const sx = -8 + k * 4, vib = Math.sin(now / 200 + k) * 0.6; g.lineStyle(1, a, 0.85); g.lineBetween(sx + vib, -20, sx + vib, 24); }
    g.fillStyle(a, 0.6); g.fillCircle(0, -24, 2);
  } },
  kalSampo: { c: 0x9fe8d0, a: 0xd8e8f0, single: true, draw: (g, now, _flap, c, a) => {
    // 三宝磨：三角转盘磨
    const rot = now / 1200;
    g.save(); g.translateCanvas(0, 10); g.rotateCanvas(rot);
    g.fillStyle(0x3a5a5a, 1); g.fillPoints([{ x: 0, y: -16 }, { x: 15, y: 10 }, { x: -15, y: 10 }] as never, true);
    g.fillStyle(c, 1); g.fillPoints([{ x: 0, y: -12 }, { x: 12, y: 8 }, { x: -12, y: 8 }] as never, true);
    g.fillStyle(a, 0.8); g.fillCircle(0, -2, 3);
    g.restore();
    for (let k = 0; k < 3; k++) { const ang = rot + k * 2.09; g.fillStyle(a, 0.8); g.fillCircle(Math.cos(ang) * 20, 10 + Math.sin(ang) * 20, 2); }
  } },
  kalBoat: { c: 0xa8763a, a: 0xd8e8f0, single: true, draw: (g, now, _flap, c, a) => {
    // 桦木舟：背一艘桦木小舟
    const rock = Math.sin(now / 800) * 2;
    g.save(); g.translateCanvas(0, 12 + rock); g.rotateCanvas(0.15);
    g.fillStyle(c, 1); g.fillPoints([{ x: -20, y: -6 }, { x: 20, y: -6 }, { x: 12, y: 10 }, { x: -12, y: 10 }] as never, true);
    g.fillStyle(0x6a4a26, 1); g.fillPoints([{ x: -18, y: -4 }, { x: 18, y: -4 }, { x: 11, y: 8 }, { x: -11, y: 8 }] as never, true);
    g.fillStyle(a, 0.6); g.fillRect(-14, -4, 28, 3);
    g.restore();
    for (let k = 0; k < 3; k++) { g.fillStyle(a, 0.4); g.fillEllipse(-14 + k * 14, 26, 10, 3); }
  } },
  // ── 香蕉王国 ──
  banBunch: { c: 0xf0d020, a: 0x8a8a1a, single: true, draw: (g, now, _flap, c, a) => {
    // 背篓香蕉：一挂黄香蕉
    const sway = Math.sin(now / 700) * 2;
    g.fillStyle(0x6a4e2e, 1); g.fillRoundedRect(-14, 2, 28, 30, 4);
    g.fillStyle(0x8a6a3a, 1); g.fillRoundedRect(-12, 4, 24, 26, 3);
    for (let k = 0; k < 4; k++) { g.save(); g.translateCanvas(-7 + k * 5, 6); g.rotateCanvas(-0.4 + k * 0.25 + sway * 0.02); g.fillStyle(c, 1); g.fillEllipse(0, -14, 8, 22); g.fillStyle(0x8a8a1a, 0.6); g.fillCircle(0, -22, 1.4); g.restore(); }
    g.fillStyle(a, 0.8); g.fillCircle(0, 34, 2);
  } },
  banJuice: { c: 0xc0c020, a: 0xfff080, single: true, draw: (g, now, _flap, c, a) => {
    // 果汁售卖机：小售卖机吐果汁
    g.fillStyle(0x5a5a2a, 1); g.fillRoundedRect(-14, -20, 28, 54, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-12, -18, 24, 50, 3);
    g.fillStyle(0x2a2a10, 1); g.fillRect(-8, -14, 16, 12);
    g.fillStyle(a, 0.5 + 0.5 * Math.sin(now / 300)); g.fillRect(-7, -13, 14, 10);
    g.fillStyle(0x2a2a10, 1); g.fillRect(-8, 8, 16, 12);
    const ph = (now / 1200) % 1; g.fillStyle(0xffe040, 1 - ph); g.fillRect(-5, 10 + ph * 2, 10, 8);
    for (let k = 0; k < 4; k++) { const p = ((now / 900 + k / 4) % 1); g.fillStyle(a, (1 - p) * 0.7); g.fillCircle(-8 + k * 5, -22 - p * 12, 1.6); }
  } },
  banBigPeel: { c: 0xf0d020, a: 0x8a8a1a, single: true, draw: (g, now, _flap, c, a) => {
    // 巨型蕉皮：一大片蕉皮
    g.save(); g.rotateCanvas(0.25 + Math.sin(now / 900) * 0.05);
    for (let k = 0; k < 4; k++) { const ang = -0.9 + k * 0.6; g.save(); g.rotateCanvas(ang); g.fillStyle(c, 1); g.fillPoints([{ x: 0, y: 0 }, { x: -8, y: -30 }, { x: 2, y: -34 }, { x: 8, y: -8 }] as never, true); g.fillStyle(a, 0.7); g.fillCircle(-2, -24, 1.6); g.restore(); }
    g.fillStyle(0xfff6c0, 1); g.fillEllipse(0, 2, 14, 8);
    g.restore();
  } },
  banBarrel: { c: 0xa8763a, a: 0xf0d020, single: true, draw: (g, now, _flap, c, a) => {
    // 木桶蕉：木桶装满香蕉
    g.fillStyle(0x5a4228, 1); g.fillRoundedRect(-14, -4, 28, 38, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(-12, -2, 24, 34, 3);
    g.fillStyle(0x3a2a14, 0.8); g.fillRect(-13, 6, 26, 3); g.fillRect(-13, 20, 26, 3);
    for (let k = 0; k < 3; k++) { g.fillStyle(a, 1); g.fillEllipse(-7 + k * 7, -6, 8, 6); }
    const ph = (now / 1000) % 1; g.fillStyle(a, 1 - ph); g.fillEllipse(6, 34 + ph * 10, 6, 4);
  } },
  banHammock: { c: 0x8fae4a, a: 0xf0d020, single: true, draw: (g, now, _flap, c, a) => {
    // 蕉吊床：背后的蕉叶吊床
    const sway = Math.sin(now / 700) * 3;
    g.lineStyle(2, 0x6a4e2e, 0.9); g.lineBetween(-16, -20, 0, -6 + sway); g.lineBetween(16, -20, 0, -6 + sway);
    g.fillStyle(c, 1); g.fillPoints([{ x: -14, y: -4 + sway }, { x: 14, y: -4 + sway }, { x: 8, y: 12 + sway }, { x: -8, y: 12 + sway }] as never, true);
    g.lineStyle(1.2, 0x3a5a20, 0.6); for (let k = 0; k < 3; k++) { g.lineBetween(-12 + k * 4, 0 + sway, -12 + k * 4, 22 + sway); } for (let k = 0; k < 3; k++) { g.lineBetween(-14 + k * 6, 6 + sway, -8 + k * 6, 6 + sway); }
    g.fillStyle(a, 0.9); g.fillEllipse(0, 20 + sway, 6, 4);
  } },
  banCrate: { c: 0xa8763a, a: 0xf0d020, single: true, draw: (g, _now, _flap, c, a) => {
    // 蕉箱：一木箱香蕉
    g.fillStyle(0x5a4228, 1); g.fillRoundedRect(-15, -8, 30, 44, 2);
    g.fillStyle(c, 1); g.fillRoundedRect(-13, -6, 26, 40, 2);
    g.lineStyle(2, 0x3a2a14, 0.7); g.lineBetween(-13, -6, 13, 34); g.lineBetween(13, -6, -13, 34);
    for (let k = 0; k < 3; k++) { g.fillStyle(a, 1); g.fillEllipse(-7 + k * 7, -10, 7, 6); }
  } },
  // ── 迷因宇宙 ──
  memeChat: { c: 0x2f4058, a: 0x7dff9a, single: true, draw: (g, now, _flap, c, a) => {
    // 弹幕背板：滚动的弹幕板
    g.fillStyle(0x1a2230, 1); g.fillRoundedRect(-18, -22, 36, 46, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(-16, -20, 32, 42, 3);
    for (let k = 0; k < 5; k++) { const yy = ((now / 900 + k / 5) % 1) * 42 - 20; g.fillStyle(k % 2 ? a : 0x39ffd0, 0.9); g.fillRoundedRect(-14, yy, 12 + (k % 3) * 6, 4, 2); }
    g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 300)); g.fillRect(-16, -20, 32, 3);
  } },
  memeLike: { c: 0x3a5a3a, a: 0xff5ec8, single: true, draw: (g, now, _flap, c, a) => {
    // 点赞背包：背包冒爱心/拇指
    g.fillStyle(0x2a3a2a, 1); g.fillRoundedRect(-13, -2, 26, 34, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(-11, 0, 22, 30, 3);
    for (let k = 0; k < 3; k++) { const ph = ((now / 800 + k / 3) % 1); const hx = 0, hy = -6 - ph * 22; const aa = 1 - ph; g.fillStyle(a, aa); g.fillCircle(hx - 4, hy, 4); g.fillCircle(hx + 4, hy, 4); g.fillPoints([{ x: hx - 8, y: hy + 1 }, { x: hx + 8, y: hy + 1 }, { x: hx, y: hy + 12 }] as never, true); }
  } },
  memeRam: { c: 0x2a4a2a, a: 0x7dff9a, single: true, draw: (g, now, _flap, c, a) => {
    // 内存条背包：两根发光内存条
    for (const dx of [-8, 8]) { g.save(); g.translateCanvas(dx, 10); g.fillStyle(c, 1); g.fillRoundedRect(-4, -24, 8, 48, 2); g.fillStyle(a, 0.5 + 0.5 * Math.sin(now / 200 + dx)); g.fillRect(-3, -20, 6, 40); for (let k = 0; k < 5; k++) { g.fillStyle(0x0a1a0a, 1); g.fillRect(-3, -16 + k * 8, 6, 3); } g.restore(); }
    g.fillStyle(a, 0.6); g.fillRect(-11, 32, 22, 3);
  } },
  memeServer: { c: 0x2a3444, a: 0x39ffd0, single: true, draw: (g, now, _flap, c, a) => {
    // 服务器背包：指示灯矩阵
    g.fillStyle(0x1a2430, 1); g.fillRoundedRect(-13, -24, 26, 58, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-11, -22, 22, 54, 2);
    for (let r = 0; r < 5; r++) { for (let cc = 0; cc < 2; cc++) { const on = Math.max(0, Math.sin(now / 250 + r * 1.3 + cc * 0.7)); g.fillStyle(on > 0.5 ? a : 0x1a6a5a, 0.9); g.fillRect(-8 + cc * 10, -18 + r * 9, 5, 5); } }
    for (let k = 0; k < 3; k++) { const ph = ((now / 1000 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.5); g.fillCircle(-6 + k * 6, 36 - ph * 10, 1.6); }
  } },
  memeHdd: { c: 0x8a92a0, a: 0x39ffd0, single: true, draw: (g, now, _flap, c, a) => {
    // 硬盘背包：机械硬盘，磁盘旋转
    g.fillStyle(0x5a6270, 1); g.fillRoundedRect(-15, -12, 30, 44, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-13, -10, 26, 40, 2);
    g.fillStyle(0x2a2e36, 1); g.fillCircle(0, 8, 12);
    g.save(); g.translateCanvas(0, 8); g.rotateCanvas(now / 200);
    g.fillStyle(0x555c68, 1); g.fillCircle(0, 0, 11); g.fillStyle(c, 0.8); g.fillRect(-11, -1, 11, 2);
    g.restore();
    const on = 0.4 + 0.6 * Math.abs(Math.sin(now / 300)); g.fillStyle(a, on); g.fillCircle(-8, -12, 2);
  } },
  memeRouter: { c: 0x3a4a3a, a: 0x7dff9a, single: true, draw: (g, now, _flap, c, a) => {
    // 路由器背包：天线 + 信号波
    g.fillStyle(0x2a342a, 1); g.fillRoundedRect(-14, -2, 28, 18, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-12, 0, 24, 14, 2);
    for (let k = 0; k < 2; k++) { g.save(); g.translateCanvas(-8 + k * 16, -2); g.rotateCanvas((k ? 0.3 : -0.3) + Math.sin(now / 600 + k) * 0.1); g.fillStyle(0x1a241a, 1); g.fillRect(-1.5, -22, 3, 22); g.restore(); }
    for (let k = 0; k < 3; k++) { const ph = ((now / 700 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.lineStyle(1.6, a, (1 - ph) * 0.7); g.strokeCircle(0, 8, 6 + ph * 22); }
    g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 250)); g.fillCircle(0, 7, 2);
  } },
  // ── 摸鱼办公室 ──
  officePaper: { c: 0xf0ead8, a: 0x9fd8ff, single: true, draw: (g, now, _flap, c, _a) => {
    // 文件山背篓：一堆文件
    for (let k = 0; k < 6; k++) { const jx = -12 + (k % 3) * 10, jy = 18 - Math.floor(k / 3) * 12 + Math.sin(now / 700 + k) * 1.2; g.save(); g.translateCanvas(jx, jy); g.rotateCanvas((k - 3) * 0.08); g.fillStyle(c, 1); g.fillRect(-8, -6, 16, 11); g.fillStyle(0xb8b0a0, 1); g.fillRect(-6, -4, 12, 3); g.restore(); }
    const ph = (now / 1100) % 1; g.fillStyle(c, 1 - ph); g.save(); g.translateCanvas(0, -24 + ph * 30); g.rotateCanvas(ph * 2); g.fillRect(-7, -5, 14, 10); g.restore();
  } },
  officeKeyboard: { c: 0x3a3a44, a: 0x9fd8ff, single: true, draw: (g, now, _flap, c, a) => {
    // 键盘背包：按键逐格闪
    g.fillStyle(0x2a2a34, 1); g.fillRoundedRect(-18, -12, 36, 26, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-16, -10, 32, 22, 2);
    for (let r = 0; r < 2; r++) { for (let cc = 0; cc < 5; cc++) { const on = Math.max(0, Math.sin(now / 200 + r * 1.7 + cc * 0.9)); g.fillStyle(on > 0.6 ? a : 0x55556a, 0.95); g.fillRect(-14 + cc * 6, -7 + r * 10, 5, 8); } }
  } },
  officeLamp: { c: 0xffd45c, a: 0x9fd8ff, single: true, draw: (g, now, _flap, c, _a) => {
    // 加班台灯：昏黄光锥
    g.fillStyle(0x3a3a44, 1); g.fillRect(-2, -8, 4, 30); g.fillRect(-10, 22, 20, 4);
    g.fillStyle(0x55556a, 1); g.fillPoints([{ x: -12, y: -10 }, { x: 12, y: -10 }, { x: 8, y: -22 }, { x: -8, y: -22 }] as never, true);
    const glow = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(c, 0.3 * glow + 0.15); g.fillPoints([{ x: -8, y: -10 }, { x: 8, y: -10 }, { x: 16, y: 26 }, { x: -16, y: 26 }] as never, true);
    g.fillStyle(0xfff0b0, 0.9); g.fillEllipse(0, -12, 14, 4);
    for (let k = 0; k < 3; k++) { const ang = now / 700 + k * 2.1; g.fillStyle(0x2a2a2a, 0.7); g.fillCircle(Math.cos(ang) * 16, -6 + Math.sin(ang) * 10, 1.4); }
  } },
  // ── 花园地精 ──
  gnomeSeed: { c: 0xa89060, a: 0xa8ff7a, single: true, draw: (g, now, _flap, c, a) => {
    // 种子麻袋
    g.fillStyle(0x7a6240, 1); g.fillRoundedRect(-15, -4, 30, 38, 10);
    g.fillStyle(c, 1); g.fillRoundedRect(-13, -2, 26, 34, 9);
    g.fillStyle(0x5a4a30, 1); g.fillRect(-8, -10, 16, 10);
    g.lineStyle(1.2, 0x5a4a30, 0.6); for (let k = 0; k < 3; k++) { g.lineBetween(-12, 6 + k * 8, 12, 8 + k * 8); }
    const ph = (now / 900) % 1; g.fillStyle(a, 1 - ph); g.fillCircle(10, 34 + ph * 10, 2);
  } },
  gnomeTrowel: { c: 0xb8b8b8, a: 0x8a6a3a, single: true, draw: (g, now, _flap, c, a) => {
    // 花铲背架
    g.save(); g.rotateCanvas(0.4 + Math.sin(now / 800) * 0.04);
    g.fillStyle(a, 1); g.fillRoundedRect(-3, -30, 6, 50, 3);
    g.fillStyle(c, 1); g.fillPoints([{ x: -9, y: -30 }, { x: 9, y: -30 }, { x: 6, y: -46 }, { x: -6, y: -46 }] as never, true);
    g.fillStyle(0x8a8a8a, 1); g.fillPoints([{ x: -7, y: -32 }, { x: 7, y: -32 }, { x: 5, y: -44 }, { x: -5, y: -44 }] as never, true);
    g.restore();
    g.fillStyle(0x5a4a30, 0.9); g.fillCircle(-6, -18, 1.6); g.fillCircle(6, -10, 1.4);
  } },
  gnomeWatering: { c: 0x5f9a5a, a: 0xa8ff7a, single: true, draw: (g, now, _flap, c, a) => {
    // 迷你洒水壶
    g.fillStyle(0x3a6a3a, 1); g.fillRoundedRect(-12, -6, 24, 30, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(-10, -4, 20, 26, 3);
    g.fillStyle(0x3a6a3a, 1); g.fillRect(2, -4, 14, 5); g.fillPoints([{ x: 14, y: -6 }, { x: 22, y: -2 }, { x: 22, y: 4 }, { x: 14, y: 2 }] as never, true);
    g.fillStyle(0x2a4a2a, 1); g.fillRect(-2, -14, 10, 10);
    for (let k = 0; k < 3; k++) { const ph = ((now / 700 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.9); g.fillCircle(20 + k * 2, 6 + ph * 16, 1.6); }
  } },
  // ── 垃圾回收站 ──
  trashBin: { c: 0x4a7a5a, a: 0x8fd4a0, single: true, draw: (g, now, _flap, c, a) => {
    // 再生背篓：分类垃圾桶
    g.fillStyle(0x3a5a44, 1); g.fillRoundedRect(-13, -2, 26, 38, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-11, 0, 22, 34, 2);
    g.fillStyle(0x2a3a2a, 1); g.fillRect(-14, -6, 28, 5);
    g.fillStyle(0x2a2a2a, 1); g.fillRect(-4, -4, 8, 4);
    for (let k = 0; k < 4; k++) { const ph = ((now / 1000 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(-8 + k * 6, 6 + ph * 8, 2); }
    g.fillStyle(a, 0.9); g.fillCircle(0, 16, 3);
  } },
  trashTire: { c: 0x2a2a2e, a: 0x8fd4a0, single: true, draw: (g, now, _flap, c, _a) => {
    // 废轮胎
    const rock = Math.sin(now / 700) * 2;
    g.save(); g.translateCanvas(2, 12 + rock); g.rotateCanvas(0.2);
    g.fillStyle(c, 1); g.fillCircle(0, 0, 20);
    g.fillStyle(0x1a1a1e, 1); g.fillCircle(0, 0, 12);
    g.fillStyle(0x55555a, 1); g.fillCircle(0, 0, 8);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU; g.lineStyle(1.4, 0x15151a, 0.8); g.lineBetween(Math.cos(ang) * 13, Math.sin(ang) * 13, Math.cos(ang) * 19, Math.sin(ang) * 19); }
    g.restore();
  } },
  trashPC: { c: 0x8a8a92, a: 0x7dff9a, single: true, draw: (g, now, _flap, c, a) => {
    // 旧电脑：旧显示器冒烟
    g.fillStyle(0x4a4a52, 1); g.fillRoundedRect(-15, -18, 30, 34, 2);
    g.fillStyle(c, 1); g.fillRoundedRect(-13, -16, 26, 28, 2);
    g.fillStyle(0x2a3a2a, 1); g.fillRect(-10, -13, 20, 22);
    g.fillStyle(a, 0.5 + 0.5 * Math.sin(now / 300)); g.fillRect(-9, -12, 18, 20);
    g.fillStyle(0x3a3a42, 1); g.fillRect(-4, 16, 8, 6); g.fillRect(-12, 22, 24, 4);
    for (let k = 0; k < 3; k++) { const ph = ((now / 800 + k / 3) % 1); g.fillStyle(0x888888, (1 - ph) * 0.5); g.fillCircle(-8 + k * 6, -18 - ph * 20, 2 + ph * 3); }
  } },
};
