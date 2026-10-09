import { TAU, hpoly, type HatArt } from './shared';

/** 批十五头饰（基多拉 / 魔斯拉 / 机甲战队 / 火山泰坦 / 深海巨妖） */

export const HATS_18: Record<string, HatArt> = {
  ghidHatA: { c: 0xd9b45c, a: 0xffe15c, draw: (g, _now, x, hy, c, a) => {
    // 龙角盔：金盔 + 两侧外弯龙角 + 额心电纹
    g.fillStyle(c, 1); g.beginPath(); g.arc(x, hy + 1, 14, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(0x8a6a1a, 0.7); g.fillEllipse(x - 4, hy - 6, 12, 5);
    for (const s of [-1, 1]) {
      g.fillStyle(a, 1);
      hpoly(g, [[x + s * 9, hy - 6], [x + s * 20, hy - 17], [x + s * 24, hy - 10], [x + s * 12, hy - 2]], a, 1);
      g.fillStyle(0xb8943a, 0.6);
      hpoly(g, [[x + s * 12, hy - 6], [x + s * 19, hy - 14], [x + s * 20, hy - 11], [x + s * 13, hy - 4]], 0xb8943a, 0.6);
    }
    g.lineStyle(1.6, 0x7fd4ff, 0.9);
    g.beginPath(); g.moveTo(x, hy - 12); g.lineTo(x + 3, hy - 7); g.lineTo(x - 2, hy - 5); g.strokePath();
  } },
  ghidHatB: { c: 0xffe15c, a: 0x7fd4ff, draw: (g, now, x, hy, c, a) => {
    // 三首王冠：三个小龙首并排（会轻晃），中央吐电
    g.fillStyle(c, 1); g.fillRoundedRect(x - 16, hy - 6, 32, 7, 3);
    for (const s of [-1, 0, 1]) {
      const jig = Math.sin(now / 400 + s) * 1.2;
      const nx = x + s * 11, ny = hy - 14 + jig;
      g.fillStyle(0xb8943a, 1); g.fillCircle(nx, ny, 5.4);
      g.fillStyle(c, 1); g.fillTriangle(nx - 4, ny - 1, nx + 4, ny - 1, nx + s * 8, ny - 10);
      g.fillStyle(a, 0.9); g.fillCircle(nx + 1.5 * s, ny - 1, 1.4);
    }
    for (let k = 0; k < 3; k++) { const ph = ((now / 300 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.9); g.fillCircle(x + (k - 1) * 11, hy - 22 - ph * 8, 1.4); }
  } },
  mthrHatA: { c: 0xffe66a, a: 0xbfe8ff, draw: (g, now, x, hy, c, a) => {
    // 触角发箍：金箍 + 两根羽状触角（随风摆）
    g.fillStyle(c, 1); g.fillRoundedRect(x - 15, hy - 5, 30, 5, 2.5);
    for (const s of [-1, 1]) {
      const sw = Math.sin(now / 300 + s) * 3;
      g.lineStyle(2, 0x8a6a1a, 1);
      g.beginPath(); g.moveTo(x + s * 9, hy - 5); g.lineTo(x + s * 14 + sw, hy - 16); g.lineTo(x + s * 18 + sw * 1.5, hy - 24); g.strokePath();
      g.fillStyle(a, 0.9);
      for (let k = 0; k < 3; k++) g.fillCircle(x + s * (15 + k * 2) + sw * (0.6 + k * 0.3), hy - (17 + k * 4), 2.2 - k * 0.4);
    }
  } },
  mthrHatB: { c: 0xbfe8ff, a: 0xffe66a, draw: (g, now, x, hy, c, a) => {
    // 月蛾冠：月牙 + 两片小蛾翅 + 触角
    g.fillStyle(c, 1); g.fillRoundedRect(x - 13, hy - 5, 26, 6, 3);
    for (const s of [-1, 1]) { g.fillStyle(0xe8f6ff, 0.9); hpoly(g, [[x + s * 6, hy - 5], [x + s * 20, hy - 14], [x + s * 22, hy - 2], [x + s * 8, hy + 1]], 0xe8f6ff, 0.9); }
    g.fillStyle(a, 1); g.fillCircle(x, hy - 12, 6);
    g.fillStyle(0x3a4a2a, 1); g.fillCircle(x + 2, hy - 13, 5);
    const tw = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(0xffffff, tw * 0.9); g.fillCircle(x - 2, hy - 14, 1.2);
  } },
  tksHatA: { c: 0x2a3244, a: 0x5ac8ff, draw: (g, now, x, hy, c, a) => {
    // 全息头盔：暗盔 + 蓝屏面罩 + 横扫脉冲
    g.fillStyle(c, 1); g.beginPath(); g.arc(x, hy + 1, 14, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(0x0a1018, 1); g.fillRoundedRect(x - 12, hy - 7, 24, 11, 4);
    const scan = (now / 900) % 1, sx = x - 10 + scan * 20;
    g.fillStyle(a, 0.4); g.fillRect(sx - 3, hy - 7, 6, 11);
    g.fillStyle(0xffffff, 0.6); g.fillRect(sx - 0.8, hy - 7, 1.6, 11);
    for (let k = 0; k < 6; k++) { g.fillStyle(k / 6 < scan ? a : 0x243a4a, 0.9); g.fillRect(x - 11 + k * 4, hy + 2, 2, 3); }
    g.lineStyle(1.4, a, 0.7); g.beginPath(); g.arc(x, hy + 1, 14, Math.PI, TAU); g.strokePath();
  } },
  tksHatB: { c: 0xff4a4a, a: 0x5ac8ff, draw: (g, _now, x, hy, c, a) => {
    // 队长头盔：红盔 + V 字冠饰 + 双镜
    g.fillStyle(c, 1); g.beginPath(); g.arc(x, hy + 1, 14, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(0x8a1a1a, 0.7); g.fillEllipse(x - 4, hy - 6, 12, 5);
    g.fillStyle(a, 1); hpoly(g, [[x - 12, hy - 8], [x, hy - 22], [x + 12, hy - 8], [x, hy - 13]], a, 1);
    for (const s of [-1, 1]) { g.fillStyle(0xffffff, 0.95); g.fillEllipse(x + s * 6, hy - 2, 6, 4); g.fillStyle(0x1a2436, 1); g.fillCircle(x + s * 6, hy - 2, 1.6); }
    g.fillStyle(0xffffff, 0.8); g.fillRect(x - 1.4, hy - 18, 2.8, 6);
  } },
  titanHatA: { c: 0x6a4a3a, a: 0xff6a2a, draw: (g, _now, x, hy, c, a) => {
    // 岩壳头盔：龟裂的岩盔，缝里透熔光
    g.fillStyle(c, 1); g.beginPath(); g.arc(x, hy + 1, 15, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(0x4a3326, 0.8); g.fillEllipse(x - 4, hy - 7, 13, 6);
    g.lineStyle(2, 0x2a1a12, 1);
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x - 12 + k * 7, hy - 10); g.lineTo(x - 9 + k * 7, hy); g.strokePath(); }
    g.lineStyle(1.2, a, 0.75);
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x - 12 + k * 7, hy - 10); g.lineTo(x - 9 + k * 7, hy); g.strokePath(); }
  } },
  titanHatB: { c: 0xff6a2a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 火山王冠：火山口造型，口上喷火冒烟
    g.fillStyle(0x4a3326, 1); hpoly(g, [[x - 16, hy], [x - 9, hy - 16], [x + 9, hy - 16], [x + 16, hy]], 0x4a3326, 1);
    const heat = 0.6 + 0.4 * Math.sin(now / 260);
    g.fillStyle(a, heat); hpoly(g, [[x - 8, hy - 12], [x + 8, hy - 12], [x + 10, hy - 15], [x - 10, hy - 15]], a, heat);
    g.fillStyle(0xffd45c, heat); g.fillEllipse(x, hy - 14, 16, 5);
    for (let k = 0; k < 3; k++) { const ph = ((now / 600 + k / 3) % 1); g.fillStyle(0x7a6a5a, 0.3 * (1 - ph)); g.fillCircle(x + (k - 1) * 6, hy - 18 - ph * 12, 3 + ph * 5); }
    g.fillStyle(c, 0.9); g.fillRect(x - 15, hy - 2, 30, 3);
  } },
  leviHatA: { c: 0x5fe8d0, a: 0x9b6aff, draw: (g, now, x, hy, c, a) => {
    // 触手帽：圆帽 + 一圈垂下的触手（各摆）
    g.fillStyle(0x0e2e2e, 1); g.beginPath(); g.arc(x, hy + 1, 14, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(c, 1); g.beginPath(); g.arc(x, hy + 1, 12.6, Math.PI, TAU); g.closePath(); g.fillPath();
    for (let k = 0; k < 7; k++) {
      const bx = x - 12 + k * 4;
      const sw = Math.sin(now / 400 + k) * 3;
      g.lineStyle(2.2, c, 0.95);
      g.beginPath(); g.moveTo(bx, hy + 1); g.lineTo(bx + sw, hy + 8); g.lineTo(bx + sw * 1.5, hy + 15); g.strokePath();
      g.fillStyle(a, 0.95); g.fillCircle(bx + sw * 1.5, hy + 15, 1.4);
    }
  } },
  leviHatB: { c: 0x9b6aff, a: 0x5fe8d0, draw: (g, now, x, hy, c, a) => {
    // 海妖冠：幽光冠圈 + 一圈巨眼 + 悬浮气泡
    g.fillStyle(0x0e1e2e, 1); g.fillRoundedRect(x - 15, hy - 6, 30, 8, 3);
    g.fillStyle(c, 0.95); g.fillRoundedRect(x - 13, hy - 5, 26, 6, 2.5);
    for (let k = 0; k < 5; k++) {
      const ex = x - 12 + k * 6;
      const gl = 0.5 + 0.5 * Math.sin(now / 300 + k);
      g.fillStyle(0x1a0e2e, 1); g.fillCircle(ex, hy - 12, 3.4);
      g.fillStyle(a, gl); g.fillCircle(ex, hy - 12, 1.8);
    }
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle(0xbfe8ff, 0.6 * (1 - ph)); g.fillCircle(x - 8 + k * 8, hy - 20 - ph * 10, 1.4); }
  } },
};
