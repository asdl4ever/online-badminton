import { type WingArt } from './shared';

/**
 * 第八批背部装饰（冰海巨兽 / 极夜冰海 / 寒潮海象 / 维度裂隙 / 幽光深渊）——全部是
 * **背挂物件**（`single: true`），不做翅膀。挂肩高度锚点 topY+48。
 */

export const WINGS_26: Record<string, WingArt> = {
  // ── 冰海巨兽 ──
  glacHarpoon: { c: 0xbfe8ff, a: 0x5fd8ff, single: true, draw: (g, now, _flap, c, a) => {
    // 破冰鱼叉背架：一根冻着冰的巨鱼叉斜插背上
    g.save(); g.rotateCanvas(-0.4);
    g.fillStyle(0x8a9aa8, 1); g.fillRoundedRect(-3, -30, 6, 60, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-2, -28, 4, 56, 2);
    g.fillStyle(c, 1); g.fillPoints([{ x: -5, y: -30 }, { x: 5, y: -30 }, { x: 0, y: -42 }] as never, true);
    g.fillStyle(a, 0.7 + 0.3 * Math.sin(now / 300)); g.fillPoints([{ x: -4, y: -28 }, { x: 4, y: -28 }, { x: 0, y: -38 }] as never, true);
    g.fillStyle(0xbfe8ff, 0.8); g.fillRect(-6, -6, 12, 3); g.fillRect(-6, 14, 12, 3);
    g.restore();
    for (let k = 0; k < 4; k++) { const ph = ((now / 700 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(-8 + k * 5, -20 + k * 12, 1.4); }
  } },
  glacAnchor: { c: 0xd8e0e8, a: 0x8a9aa8, single: true, draw: (g, now, _flap, c, a) => {
    // 巨骨锚背架：一副缠着海草的巨锚
    g.save(); g.rotateCanvas(0.3);
    g.fillStyle(c, 1); g.fillRect(-3, -26, 6, 44);
    g.fillRect(-14, -26, 28, 6);
    g.lineStyle(5, c, 1); g.beginPath(); g.arc(-14, 6, 10, -0.4, Math.PI + 0.4); g.strokePath();
    g.lineStyle(5, c, 1); g.beginPath(); g.arc(14, 6, 10, -0.4, Math.PI + 0.4); g.strokePath();
    g.fillStyle(c, 1); g.fillCircle(0, -30, 5);
    g.restore();
    for (let k = 0; k < 4; k++) { const sw = Math.sin(now / 500 + k) * 2; g.fillStyle(0x3f9a5a, 0.85); g.fillTriangle(-16 + k * 10, 12, -12 + k * 10 + sw, 24, -8 + k * 10, 12); }
    g.fillStyle(a, 0.7); g.fillCircle(0, 18, 3);
  } },
  // ── 极夜冰海 ──
  fridAbyssLure: { c: 0x7dffd0, a: 0x39ffd0, single: true, draw: (g, now, _flap, c, a) => {
    // 深渊诱饵背架：一根弯折的触须顶端挑着一颗幽光诱饵
    const sw = Math.sin(now / 700) * 4;
    g.lineStyle(5, 0x2a4a4a, 1); g.beginPath(); g.moveTo(0, 24); g.lineTo(6, 0); g.lineTo(-4 + sw, -22); g.strokePath();
    g.lineStyle(3, c, 0.9); g.beginPath(); g.moveTo(0, 24); g.lineTo(6, 0); g.lineTo(-4 + sw, -22); g.strokePath();
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(a, 0.3 * gl); g.fillCircle(-4 + sw, -24, 14);
    g.fillStyle(c, 0.9); g.fillCircle(-4 + sw, -24, 6);
    g.fillStyle(0xffffff, 0.8 * gl); g.fillCircle(-4 + sw, -24, 2.4);
    for (let k = 0; k < 4; k++) { const ph = ((now / 900 + k / 4) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(-4 + sw + Math.sin(k * 2) * 8, -24 + Math.cos(k * 2) * 8, 1.4); }
  } },
  fridNet: { c: 0x8a9aa8, a: 0x7dffd0, single: true, draw: (g, now, _flap, c, a) => {
    // 渔网背架：背着一张渔网，网眼边缘挂几颗幽光水珠
    g.fillStyle(0x4a5a62, 0.7); g.fillEllipse(0, 0, 44, 40);
    g.lineStyle(1.2, c, 0.85);
    for (let k = -4; k <= 4; k++) { g.lineBetween(k * 5, -20, k * 5 + 8, 20); g.lineBetween(k * 5, 20, k * 5 + 8, -20); }
    g.lineStyle(2.4, 0x6a7a82, 0.9); g.beginPath(); g.arc(0, 0, 21, Math.PI, Math.PI * 2); g.strokePath();
    for (let k = 0; k < 5; k++) { const on = 0.5 + 0.5 * Math.sin(now / 400 + k); g.fillStyle(a, 0.6 * on); g.fillCircle(-16 + k * 8, 18, 2); }
  } },
  // ── 寒潮海象 ──
  walrTuskPack: { c: 0xd8e8f0, a: 0x8a705a, single: true, draw: (g, _now, _flap, c, a) => {
    // 巨牙背架：一对巨大海象牙交叉背在背上
    for (const s of [-1, 1]) {
      g.save(); g.rotateCanvas(s * 0.35);
      g.fillStyle(a, 1); g.fillPoints([{ x: -4, y: 22 }, { x: 4, y: 22 }, { x: 2, y: -20 }, { x: 0, y: -28 }, { x: -2, y: -20 }] as never, true);
      g.fillStyle(c, 1); g.fillPoints([{ x: -3, y: 20 }, { x: 3, y: 20 }, { x: 1.4, y: -18 }, { x: 0, y: -25 }, { x: -1.4, y: -18 }] as never, true);
      g.restore();
    }
    g.fillStyle(0x5a4a28, 1); g.fillRoundedRect(-10, 18, 20, 8, 3);
    g.fillStyle(a, 0.7); g.fillCircle(0, 22, 2.4);
  } },
  walrHarpoon: { c: 0x8a9aa8, a: 0x8fd8ff, single: true, draw: (g, now, _flap, c, a) => {
    // 鱼叉背架：一把带绳的鱼叉
    g.save(); g.rotateCanvas(0.4);
    g.lineStyle(6, 0x6a4a2a, 1); g.lineBetween(0, 20, 0, -20);
    g.fillStyle(c, 1); g.fillPoints([{ x: -5, y: -18 }, { x: 5, y: -18 }, { x: 0, y: -30 }] as never, true);
    g.fillStyle(c, 1); g.fillPoints([{ x: -7, y: -12 }, { x: -3, y: -12 }, { x: -5, y: -20 }] as never, true);
    g.fillStyle(c, 1); g.fillPoints([{ x: 3, y: -12 }, { x: 7, y: -12 }, { x: 5, y: -20 }] as never, true);
    g.restore();
    g.lineStyle(1.6, 0xd8c8a0, 0.8); g.beginPath(); g.moveTo(0, 20); g.lineTo(Math.sin(now / 500) * 6, 30); g.strokePath();
    g.fillStyle(a, 0.7); g.fillCircle(0, -26, 2);
  } },
  // ── 维度裂隙 ──
  dimGate: { c: 0xb08aff, a: 0x7dffd0, single: true, draw: (g, now, _flap, c, a) => {
    // 维度之门背架：一圈悬浮的裂隙环，内部旋转的高维星空
    g.lineStyle(5, c, 0.95); g.strokeEllipse(0, 0, 40, 54);
    g.fillStyle(0x0a0618, 0.95); g.fillEllipse(0, 0, 34, 48);
    for (let k = 0; k < 3; k++) { const off = now / 400 + k * 2.1; g.lineStyle(2, a, 0.6); g.beginPath(); for (let s = 0; s <= 8; s++) { const u = s / 8; const ang = off + u * 3; const rr = u * 20; const px = Math.cos(ang) * rr, py = Math.sin(ang) * rr * 1.3; if (s === 0) g.moveTo(px, py); else g.lineTo(px, py); } g.strokePath(); }
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2 + now / 1600; g.fillStyle(a, 0.8); g.fillCircle(Math.cos(ang) * 20, Math.sin(ang) * 27, 1.8); }
    g.fillStyle(0xffffff, 0.85); g.fillCircle(0, 0, 2.4);
  } },
  dimShard: { c: 0x7dffd0, a: 0xb08aff, single: true, draw: (g, now, _flap, c, a) => {
    // 维度碎片背架：几块悬浮的锋利空间碎片
    for (let k = 0; k < 4; k++) { const ang = (k / 4) * Math.PI * 2 + now / 1400; const px = Math.cos(ang) * 16, py = Math.sin(ang) * 16 - 4; g.save(); g.translateCanvas(px, py); g.rotateCanvas(ang + now / 900); g.fillStyle(k % 2 ? c : a, 0.9); g.fillPoints([{ x: 0, y: -12 }, { x: 6, y: 0 }, { x: 0, y: 12 }, { x: -6, y: 0 }] as never, true); g.fillStyle(0xffffff, 0.5); g.fillTriangle(0, -12, 6, 0, 0, 0); g.restore(); }
    g.fillStyle(0x0a0618, 0.8); g.fillCircle(0, -4, 8);
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillCircle(0, -4, 8);
    g.fillStyle(0xffffff, 0.8); g.fillCircle(0, -4, 2);
  } },
  // ── 幽光深渊 ──
  hadalJaw: { c: 0x2a4a52, a: 0x39ffd0, single: true, draw: (g, now, _flap, c, a) => {
    // 巨口背架：一张半张的巨口，齿间透幽光
    const open = 0.5 + 0.5 * Math.sin(now / 500);
    g.fillStyle(c, 1); g.fillPoints([{ x: -20, y: -4 }, { x: 20, y: -4 }, { x: 0, y: -26 - open * 6 }] as never, true);
    g.fillStyle(c, 1); g.fillPoints([{ x: -20, y: 4 }, { x: 20, y: 4 }, { x: 0, y: 22 + open * 6 }] as never, true);
    g.fillStyle(0x0a1a1e, 1); g.fillEllipse(0, 0, 36, 10 + open * 8);
    g.fillStyle(a, 0.5 * open); g.fillEllipse(0, 0, 30, 7 + open * 6);
    for (let k = 0; k < 6; k++) { g.fillStyle(0xe8f4f8, 0.95); g.fillTriangle(-14 + k * 5.6, -3, -11 + k * 5.6, -3, -12.5 + k * 5.6, 4); }
    for (let k = 0; k < 6; k++) { g.fillStyle(0xe8f4f8, 0.95); g.fillTriangle(-14 + k * 5.6, 3, -11 + k * 5.6, 3, -12.5 + k * 5.6, -4); }
  } },
  hadalFinPack: { c: 0x3a6a6a, a: 0x39ffd0, single: true, draw: (g, now, _flap, c, a) => {
    // 鳍骨背架：一排背鳍骨刺，尖端幽光
    for (let k = 0; k < 5; k++) {
      const bx = -16 + k * 8, on = 0.4 + 0.6 * Math.abs(Math.sin(now / 400 + k));
      g.fillStyle(c, 1); g.fillPoints([{ x: bx - 5, y: 16 }, { x: bx + 5, y: 16 }, { x: bx, y: -14 - (k % 2) * 8 }] as never, true);
      g.fillStyle(0x2a4a4a, 0.5); g.fillPoints([{ x: bx - 2, y: 16 }, { x: bx + 2, y: 16 }, { x: bx, y: -10 }] as never, true);
      g.fillStyle(a, on); g.fillCircle(bx, -14 - (k % 2) * 8, 1.8);
    }
    g.fillStyle(a, 0.3); g.fillEllipse(0, 18, 40, 6);
  } },
};
