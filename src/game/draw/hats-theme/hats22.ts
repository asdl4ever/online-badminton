import { TAU, hpoly, type HatArt } from './shared';

/** 第八批头饰（冰海巨兽 / 极夜冰海 / 寒潮海象 / 维度裂隙 / 幽光深渊） */

export const HATS_22: Record<string, HatArt> = {
  // ── 冰海巨兽 ──
  glacIceCrown: { c: 0xbfe8ff, a: 0x5fd8ff, draw: (g, now, x, hy, c, a) => {
    // 冰冠：一顶尖冰晶王冠，冰尖反光
    g.fillStyle(0x8fd8ff, 1); g.fillRoundedRect(x - 15, hy - 7, 30, 8, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 14, hy - 6, 28, 6, 3);
    for (let k = 0; k < 5; k++) {
      const hx = x - 12 + k * 6, hh = 10 + (k % 2 === 0 ? 8 : 3);
      g.fillStyle(c, 0.9); g.fillPoints([{ x: hx - 4, y: hy - 6 }, { x: hx + 4, y: hy - 6 }, { x: hx, y: hy - 6 - hh }] as never, true);
      g.fillStyle(0xffffff, 0.5); g.fillTriangle(hx - 4, hy - 6, hx, hy - 6, hx - 1, hy - 6 - hh);
      g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 300 + k)); g.fillCircle(hx, hy - 6 - hh, 1.4);
    }
    g.fillStyle(0xffffff, 0.4 + 0.3 * Math.sin(now / 400)); g.fillEllipse(x, hy - 4, 24, 3);
  } },
  glacBarnacle: { c: 0xd8c8a0, a: 0x8a9aa8, draw: (g, _now, x, hy, c, _a) => {
    // 藤壶帽：钉满藤壶的小帽
    g.fillStyle(0x8a9aa8, 1); g.fillRoundedRect(x - 15, hy - 9, 30, 10, 5);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 14, hy - 8, 28, 8, 4);
    for (let k = 0; k < 7; k++) { const bx = x - 12 + (k * 11 % 24), by = hy - 10 - (k % 2) * 4; g.fillStyle(k % 2 ? 0xb8a878 : c, 0.95); g.fillCircle(bx, by, 3); g.fillStyle(0x6a5a3a, 1); g.fillCircle(bx, by, 1.2); }
  } },
  // ── 极夜冰海 ──
  fridLure: { c: 0x7dffd0, a: 0x39ffd0, draw: (g, now, x, hy, c, a) => {
    // 诱饵灯帽：帽顶伸出一根触须挑灯，灯一呼一吸
    g.fillStyle(0x2a3a44, 1); g.fillRoundedRect(x - 14, hy - 7, 28, 8, 4);
    g.fillStyle(0x3a5a5a, 1); g.fillRect(x - 1.6, hy - 24, 3.2, 18);
    g.fillStyle(0x2a4a4a, 1); g.beginPath(); g.moveTo(x, hy - 24); g.lineTo(x + 8, hy - 32); g.strokePath();
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(a, 0.4 * gl); g.fillCircle(x + 8, hy - 33, 12);
    g.fillStyle(c, gl); g.fillCircle(x + 8, hy - 33, 5);
    g.fillStyle(0xffffff, 0.9 * gl); g.fillCircle(x + 8, hy - 33, 2);
    for (let k = 0; k < 4; k++) { g.fillStyle(0x2a4a4a, 0.9); g.fillTriangle(x - 12 + k * 4, hy - 7, x - 9 + k * 4, hy - 7, x - 10.5 + k * 4, hy - 1); }
  } },
  fridHood: { c: 0x2a3a4a, a: 0x7dffd0, draw: (g, now, x, hy, c, a) => {
    // 极夜兜帽：深色兜帽，边缘一圈幽光
    g.fillStyle(c, 1); hpoly(g, [[x - 16, hy + 10], [x - 14, hy - 12], [x, hy - 22], [x + 14, hy - 12], [x + 16, hy + 10]], c, 1);
    g.fillStyle(0x16222c, 1); g.fillEllipse(x, hy + 2, 24, 18);
    g.lineStyle(1.6, a, 0.5 + 0.3 * Math.sin(now / 400)); g.beginPath(); g.arc(x, hy - 8, 14, Math.PI * 1.1, Math.PI * 1.9); g.strokePath();
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(a, gl); g.fillCircle(x - 4, hy + 2, 1.8); g.fillCircle(x + 4, hy + 2, 1.8);
  } },
  // ── 寒潮海象 ──
  walrTuskCrown: { c: 0xe8e0d0, a: 0xd8e8f0, draw: (g, _now, x, hy, c, _a) => {
    // 巨牙冠：一圈短海象牙拼成的冠
    g.fillStyle(0x8a705a, 1); g.fillRoundedRect(x - 15, hy - 6, 30, 7, 3);
    for (let k = 0; k < 7; k++) { const bx = x - 12 + k * 4; g.fillStyle(c, 0.95); g.fillPoints([{ x: bx - 2, y: hy - 5 }, { x: bx + 2, y: hy - 5 }, { x: bx + 0.6, y: hy - 18 - (k % 2) * 4 }, { x: bx - 1, y: hy - 18 - (k % 2) * 4 }] as never, true); }
    g.fillStyle(0x6a5a48, 0.6); g.fillRect(x - 12, hy - 2, 24, 2);
  } },
  walrMusselCap: { c: 0x8a6a3a, a: 0x6a8a9a, draw: (g, _now, x, hy, c, _a) => {
    // 贻贝帽：一顶像贻贝壳的帽子，蓝黑条纹
    g.fillStyle(0x5a4a2a, 1); g.beginPath(); g.arc(x, hy - 2, 15, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(c, 1); g.beginPath(); g.arc(x, hy - 2, 13, Math.PI, TAU); g.closePath(); g.fillPath();
    for (let k = 0; k < 5; k++) { const a2 = Math.PI + (k + 1) / 6 * Math.PI; g.lineStyle(1.6, 0x2a3a44, 0.6); g.lineBetween(x, hy - 2, x + Math.cos(a2) * 13, hy - 2 + Math.sin(a2) * 13); }
    g.fillStyle(0x9ab8c8, 0.5); g.fillTriangle(x - 8, hy - 6, x - 2, hy - 12, x, hy - 6);
    g.fillStyle(0x6a8a9a, 0.9); g.fillRect(x - 15, hy - 3, 30, 4);
  } },
  // ── 维度裂隙 ──
  dimEyeCrown: { c: 0xb08aff, a: 0x7dffd0, draw: (g, now, x, hy, c, a) => {
    // 万象之眼冠：冠心一只会眨、会转视线的巨眼，周围悬浮碎片
    g.fillStyle(0x160e2e, 1); g.fillRoundedRect(x - 15, hy - 6, 30, 7, 3);
    const blink = Math.abs(Math.sin(now / 1000)) > 0.06 ? 1 : 0.15;
    const look = Math.sin(now / 700) * 3;
    g.fillStyle(0xfff0a0, 0.95); g.fillEllipse(x, hy - 4, 18, 12 * blink);
    g.fillStyle(0x1a0e2e, 1); g.fillCircle(x + look, hy - 4, 4.4 * blink);
    g.fillStyle(c, 0.9); g.fillCircle(x + look, hy - 4, 2 * blink);
    g.fillStyle(0xffffff, 0.9); g.fillCircle(x + look - 1.4, hy - 5.4, 1.2 * blink);
    for (let k = 0; k < 8; k++) { const ang = -0.9 + k * 0.26; g.lineStyle(1.2, 0x2a0e2e, 0.6); g.lineBetween(x, hy - 4, x + Math.cos(ang) * 9, hy - 4 + Math.sin(ang) * 6); }
    for (let k = 0; k < 4; k++) { const ang = (k / 4) * TAU + now / 1400; g.fillStyle(a, 0.8); g.fillRect(x + Math.cos(ang) * 17 - 2, hy - 4 + Math.sin(ang) * 17 - 2, 4, 4); }
  } },
  dimSpike: { c: 0x7dffd0, a: 0xb08aff, draw: (g, now, x, hy, c, a) => {
    // 维度棘刺冠：一圈悬浮的尖刺碎片
    g.fillStyle(0x160e2e, 1); g.fillRoundedRect(x - 14, hy - 6, 28, 7, 3);
    for (let k = 0; k < 7; k++) {
      const bx = x - 12 + k * 4, off = Math.sin(now / 450 + k) * 2;
      g.fillStyle(k % 2 ? c : a, 0.95); g.fillPoints([{ x: bx - 2, y: hy - 6 }, { x: bx + 2, y: hy - 6 }, { x: bx, y: hy - 6 - 12 - (k % 2) * 5 + off }] as never, true);
    }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, hy - 7, 22, 3);
  } },
  // ── 幽光深渊 ──
  hadalLure: { c: 0x39ffd0, a: 0x2a6a6a, draw: (g, now, x, hy, c, a) => {
    // 灯笼触须帽：几根触须从帽上垂下，末端挂着小灯
    g.fillStyle(0x143038, 1); g.fillRoundedRect(x - 14, hy - 6, 28, 7, 4);
    for (let k = -2; k <= 2; k++) {
      const bx = x + k * 6, sw = Math.sin(now / 400 + k) * 3;
      g.lineStyle(2, a, 0.95); g.beginPath(); g.moveTo(bx, hy - 4); g.lineTo(bx + sw * 0.5, hy - 16); g.lineTo(bx + sw, hy - 26); g.strokePath();
      const gl = 0.5 + 0.5 * Math.sin(now / 300 + k);
      g.fillStyle(c, 0.4 * gl); g.fillCircle(bx + sw, hy - 28, 6);
      g.fillStyle(c, gl); g.fillCircle(bx + sw, hy - 28, 2.6);
    }
    g.fillStyle(0x6a8a7a, 0.7); g.fillRect(x - 12, hy - 2, 24, 2);
  } },
  hadalFin: { c: 0x3a6a6a, a: 0x39ffd0, draw: (g, now, x, hy, c, a) => {
    // 背鳍帽：一顶像鱼背鳍的帽子，鳍骨透幽光
    g.fillStyle(c, 1); hpoly(g, [[x - 15, hy + 6], [x - 12, hy - 6], [x, hy - 20], [x + 12, hy - 6], [x + 15, hy + 6]], c, 1);
    for (let k = 0; k < 4; k++) { g.lineStyle(1.6, 0x1a3a3a, 0.7); g.lineBetween(x, hy - 18, x - 10 + k * 7, hy + 4); }
    g.lineStyle(1.6, a, 0.5 + 0.3 * Math.sin(now / 400)); g.beginPath(); g.moveTo(x - 12, hy - 6); g.lineTo(x, hy - 20); g.lineTo(x + 12, hy - 6); g.strokePath();
    g.fillStyle(a, 0.5); g.fillCircle(x, hy - 20, 2);
  } },
};
