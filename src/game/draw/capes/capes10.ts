import { cpoly, cline, type CapeArt } from './shared';

/**
 * 批十五背部装饰（基多拉 / 魔斯拉 / 机甲战队 / 火山泰坦 / 深海巨妖）——**自由槽**：
 * 五件披风（金鳞 / 鳞粉 / 战队 / 焦岩 / 海带）+ 五件背挂物件（`single: true`）：
 * 避雷针背架 / 花冠背篓 / 能量电池组 / 岩盾背甲 / 水母灯。
 */

export const CAPES_10: Record<string, CapeArt> = {
  // ── 基多拉 ──
  ghidCape: { c: 0x8a6a1a, a: 0xffe15c, draw: (g, _now, sway, c, a) => {
    // 金鳞披风：一片压一片的金色龙鳞
    cpoly(g, [[-16, 0], [16, 0], [22 + sway, 54], [12 + sway * 1.2, 80], [-9 + sway, 76], [-20 + sway * 0.7, 48]], 0x5a4410, 0.95);
    for (let r = 0; r < 4; r++) for (let cix = 0; cix < 5; cix++) { const px = -14 + cix * 7 + (r % 2 ? 3.5 : 0) + sway * (0.3 + r * 0.1), py = 8 + r * 17; g.fillStyle(cix % 2 ? c : 0xa8842a, 0.95); g.fillCircle(px, py, 4.4); g.fillStyle(a, 0.5); g.fillCircle(px - 1, py - 1, 1.6); }
  } },
  ghidCloak: { c: 0x8a94a2, a: 0x7fd4ff, single: true, draw: (g, now, _sway, c, a) => {
    // 避雷针背架：背上一根尖端避雷针 + 底座导线 + 尖端放电
    g.fillStyle(0x3a3a4a, 1); g.fillRoundedRect(-6, 6, 12, 16, 3);
    g.fillStyle(c, 1); g.fillRect(-2, -22, 4, 30);
    g.fillStyle(a, 0.95); g.fillTriangle(-5, -22, 5, -22, 0, -34);
    g.lineStyle(1.8, 0x3a3a4a, 1); g.lineBetween(0, 6, -16, 14); g.lineBetween(0, 6, 16, 14);
    const flick = Math.sin(now / 100) > 0.4 ? 1 : 0.2;
    for (let k = 0; k < 4; k++) { const ang = -Math.PI / 2 + (k - 1.5) * 0.5; g.lineStyle(1.6, a, flick); g.lineBetween(0, -34, Math.cos(ang) * 12, -34 + Math.sin(ang) * 12); }
    g.fillStyle(a, 0.5); g.fillCircle(0, -34, 3);
  } },
  // ── 魔斯拉 ──
  mthrCape: { c: 0xffe66a, a: 0xbfe8ff, draw: (g, now, sway, c, a) => {
    // 鳞粉披风：绒毛披风 + 飘落的鳞粉
    cpoly(g, [[-16, 0], [16, 0], [22 + sway, 54], [12 + sway * 1.2, 80], [-9 + sway, 76], [-20 + sway * 0.7, 48]], c, 0.9);
    for (let k = 0; k < 10; k++) { g.fillStyle(0xd8c65a, 0.5); g.fillCircle(-14 + (k % 5) * 7 + sway * (0.3 + (k % 5) * 0.08), 10 + Math.floor(k / 5) * 30, 3.4); }
    for (let k = 0; k < 6; k++) { const ph = ((now / 900 + k / 6) % 1); g.fillStyle(a, 0.8 * (1 - ph)); g.fillCircle(-14 + k * 6 + sway, -6 + ph * 80, 1.4); }
  } },
  mthrCloak: { c: 0x6a7a3a, a: 0xffe66a, single: true, draw: (g, now, _sway, _c, _a) => {
    // 花冠背篓：一只装满花的小背篓 + 停在花上的光点
    g.fillStyle(0x6a4a2a, 1); g.fillPoints([{ x: -15, y: -2 }, { x: 15, y: -2 }, { x: 11, y: 18 }, { x: -11, y: 18 }] as never, true);
    g.fillStyle(0x8a6a3a, 0.95); g.fillPoints([{ x: -13, y: 0 }, { x: 13, y: 0 }, { x: 10, y: 16 }, { x: -10, y: 16 }] as never, true);
    for (let k = 0; k < 5; k++) { const bx = -12 + k * 6, by = -6 + (k % 2) * 3; g.fillStyle(k % 3 === 0 ? 0xff8ad4 : k % 3 === 1 ? 0xffe66a : 0xbfe8ff, 0.95); g.fillCircle(bx, by, 4); g.fillStyle(0xffffff, 0.6); g.fillCircle(bx, by, 1.6); }
    g.lineStyle(2.4, 0x6a4a2a, 0.9); g.lineBetween(-11, -2, -16, -12); g.lineBetween(11, -2, 16, -12);
    for (let k = 0; k < 3; k++) { const ph = ((now / 1200 + k / 3) % 1); g.fillStyle(0xbfe8ff, 0.8 * (1 - ph)); g.fillCircle(-8 + k * 8, -14 - ph * 10, 1.4); }
  } },
  // ── 机甲战队 ──
  tksCape: { c: 0x3f4a62, a: 0xff4a4a, draw: (g, _now, sway, c, a) => {
    // 战队披风：机械感布料 + 红白条纹 + 战队徽
    cpoly(g, [[-16, 0], [16, 0], [22 + sway, 54], [12 + sway * 1.2, 80], [-9 + sway, 76], [-20 + sway * 0.7, 48]], c, 0.95);
    g.fillStyle(0xd8e0e8, 0.9); cpoly(g, [[-4, 2], [4, 2], [1 + sway * 1.1, 76], [-3 + sway * 1.1, 76]], 0xd8e0e8, 0.9);
    g.fillStyle(a, 0.95); g.fillCircle(0, 10, 6);
    g.fillStyle(0xffffff, 0.9); g.fillTriangle(0, 5, -4, 11, 4, 11);
    cline(g, [[-16, 4], [-19 + sway * 0.7, 44]], 2, 0x2a3244, 0.8);
    cline(g, [[16, 4], [20 + sway, 50]], 2, 0x2a3244, 0.8);
  } },
  tksCloak: { c: 0x2a3244, a: 0x5ac8ff, single: true, draw: (g, now, _sway, c, a) => {
    // 能量电池组：背上一组电池，电量格闪烁
    g.fillStyle(c, 1); g.fillRoundedRect(-16, -14, 32, 30, 5);
    g.fillStyle(0x3f4a62, 1); g.fillRoundedRect(-14, -12, 28, 26, 4);
    for (let k = 0; k < 3; k++) {
      const on = Math.sin(now / 260 + k * 1.3) > 0;
      g.fillStyle(on ? a : 0x243a4a, on ? 0.95 : 0.5);
      g.fillRect(-11 + k * 8, -8, 6, 18);
    }
    g.fillStyle(0x8a94a2, 1); g.fillRoundedRect(-6, -18, 12, 6, 2);
    g.lineStyle(2, 0x8a94a2, 1); g.beginPath(); g.moveTo(-4, -18); g.lineTo(-4, -22); g.lineTo(4, -22); g.lineTo(4, -18); g.strokePath();
    g.fillStyle(a, 0.5); g.fillCircle(0, 8, 3);
  } },
  // ── 火山泰坦 ──
  titanCape: { c: 0x3a2a1a, a: 0xff6a2a, draw: (g, _now, sway, c, a) => {
    // 焦岩披风：龟裂岩板拼成，缝里透熔光
    cpoly(g, [[-17, 0], [17, 0], [23 + sway, 54], [13 + sway * 1.2, 80], [-10 + sway, 78], [-21 + sway * 0.7, 48]], c, 0.95);
    g.lineStyle(2, 0x1a0f08, 1); for (let k = 0; k < 5; k++) cline(g, [[-13 + k * 6, 6], [-15 + k * 7 + sway, 74]], 2, 0x1a0f08, 0.9);
    g.lineStyle(1.2, a, 0.7); for (let k = 0; k < 5; k++) cline(g, [[-13 + k * 6, 6], [-15 + k * 7 + sway, 74]], 1.2, a, 0.6);
    for (let k = 0; k < 3; k++) { g.fillStyle(a, 0.5); g.fillCircle(-8 + k * 8 + sway * 0.6, 50, 3); }
  } },
  titanCloak: { c: 0x5a4436, a: 0xff6a2a, single: true, draw: (g, _now, _sway, c, a) => {
    // 岩盾背甲：背上一面龟裂的岩盾 + 铆钉
    g.fillStyle(0x32251a, 1); g.fillPoints([{ x: -18, y: -16 }, { x: 18, y: -16 }, { x: 18, y: 4 }, { x: 0, y: 22 }, { x: -18, y: 4 }] as never, true);
    g.fillStyle(c, 1); g.fillPoints([{ x: -15, y: -13 }, { x: 15, y: -13 }, { x: 15, y: 3 }, { x: 0, y: 18 }, { x: -15, y: 3 }] as never, true);
    g.lineStyle(2, 0x1a0f08, 1); g.beginPath(); g.moveTo(-8, -8); g.lineTo(-2, 0); g.lineTo(-6, 8); g.strokePath(); g.beginPath(); g.moveTo(8, -10); g.lineTo(3, -2); g.lineTo(9, 4); g.strokePath();
    g.lineStyle(1.2, a, 0.6); g.beginPath(); g.moveTo(-8, -8); g.lineTo(-2, 0); g.lineTo(-6, 8); g.strokePath(); g.beginPath(); g.moveTo(8, -10); g.lineTo(3, -2); g.lineTo(9, 4); g.strokePath();
    g.fillStyle(0x8a7a6a, 0.9); for (const [rx, ry] of [[-11, -9], [11, -9], [0, 12]] as Array<[number, number]>) g.fillCircle(rx, ry, 1.8);
  } },
  // ── 深海巨妖 ──
  leviCape: { c: 0x1e4a3a, a: 0x5fe8d0, draw: (g, now, sway, c, a) => {
    // 海带披风：一绺绺海带随水摆动
    for (let k = 0; k < 7; k++) { const bx = -15 + k * 5; const wv = Math.sin(now / 500 + k) * 4; g.fillStyle(k % 2 ? c : 0x2a5a48, 0.95); cpoly(g, [[bx, 2], [bx + 4, 2], [bx + 3 + wv + sway, 76], [bx - 1 + wv + sway, 78]], k % 2 ? c : 0x2a5a48, 0.95); g.fillStyle(a, 0.4); g.fillCircle(bx + 2 + wv + sway, 60, 1.4); }
  } },
  leviCloak: { c: 0x5fe8d0, a: 0x9b6aff, single: true, draw: (g, now, _sway, c, a) => {
    // 水母灯：背上一只发光水母灯——伞盖 + 触手
    const bob = Math.sin(now / 500) * 1.5;
    g.fillStyle(0x1a3a44, 1); g.fillEllipse(0, -8 + bob, 30, 20);
    g.fillStyle(c, 0.9); g.fillEllipse(0, -9 + bob, 26, 16);
    g.fillStyle(a, 0.4 + 0.2 * Math.sin(now / 300)); g.fillEllipse(0, -6 + bob, 16, 8);
    g.fillStyle(0xffffff, 0.7); g.fillCircle(-6, -12 + bob, 2.4);
    for (let k = 0; k < 6; k++) { const bx = -11 + k * 4.4; const sw = Math.sin(now / 350 + k) * 3; g.lineStyle(1.8, c, 0.8); g.beginPath(); g.moveTo(bx, 0 + bob); g.lineTo(bx + sw, 14 + bob); g.lineTo(bx + sw * 1.4, 24 + bob); g.strokePath(); }
    g.fillStyle(a, 0.6); g.fillCircle(0, -8 + bob, 3);
  } },
};
