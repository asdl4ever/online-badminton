import { TAU, hpoly, type HatArt } from './shared';

/** 批十六头饰（天竺神话 / 高天原 / 凯尔特 / 美索不达米亚 / 克苏鲁） */

export const HATS_19: Record<string, HatArt> = {
  vdaCrown: { c: 0xffd45c, a: 0xff7a2a, draw: (g, now, x, hy, c, a) => {
    // 梵天宝冠：金色高冠，冠身镶宝石、顶出光焰
    g.fillStyle(c, 1); g.fillRoundedRect(x - 15, hy - 8, 30, 9, 3);
    g.fillStyle(0xb87a1a, 1);
    hpoly(g, [[x - 12, hy - 8], [x - 8, hy - 26], [x + 8, hy - 26], [x + 12, hy - 8]], 0xb87a1a, 1);
    g.fillStyle(c, 1);
    hpoly(g, [[x - 10, hy - 9], [x - 7, hy - 24], [x + 7, hy - 24], [x + 10, hy - 9]], c, 1);
    for (let k = -1; k <= 1; k += 2) { g.fillStyle(a, 0.95); g.fillTriangle(x + k * 11, hy - 8, x + k * 16, hy - 20, x + k * 8, hy - 18); }
    for (let k = -1; k <= 1; k++) { g.fillStyle(k === 0 ? 0xff5a5a : 0x5fd0ff, 0.95); g.fillCircle(x + k * 6, hy - 15, 2.2); }
    const gl = 0.6 + 0.4 * Math.sin(now / 260);
    g.fillStyle(a, gl); g.fillCircle(x, hy - 28, 4);
    g.fillStyle(0xfff0b0, gl); g.fillCircle(x, hy - 28, 2);
    for (let k = 0; k < 3; k++) { const ph = ((now / 600 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.85); g.fillCircle(x + (k - 1) * 5, hy - 32 - ph * 8, 1.4); }
  } },
  vdaThirdEye: { c: 0xffd45c, a: 0xff3a5a, draw: (g, now, x, hy, c, a) => {
    // 湿婆天眼冠：灰发冠 + 冠额一只竖眼，眼缝透光
    g.fillStyle(0xc0c8d0, 1);
    hpoly(g, [[x - 14, hy], [x - 10, hy - 18], [x + 10, hy - 18], [x + 14, hy]], 0xc0c8d0, 1);
    g.fillStyle(0xe8eef2, 0.8); g.fillEllipse(x - 4, hy - 12, 12, 6);
    g.lineStyle(2, c, 0.9); g.lineBetween(x - 14, hy - 2, x + 14, hy - 2);
    const open = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(0x1a1a1e, 1); g.fillEllipse(x, hy - 10, 9, 6 * open + 1.4);
    g.fillStyle(a, 0.95); g.fillCircle(x, hy - 10, 2.6 * (0.5 + 0.5 * open));
    g.fillStyle(0xffffff, open * 0.9); g.fillCircle(x - 0.8, hy - 10.6, 1);
    g.fillStyle(c, 0.9); g.fillCircle(x, hy - 22, 2.6);
    const gl = 0.5 + 0.5 * Math.sin(now / 220);
    g.fillStyle(a, gl * 0.5); g.fillCircle(x, hy - 10, 7);
  } },
  takTenkan: { c: 0xffe8b0, a: 0xc0392b, draw: (g, _now, x, hy, c, a) => {
    // 天冠：神道金冠，两侧垂玉串
    g.fillStyle(a, 1); g.fillRoundedRect(x - 15, hy - 7, 30, 6, 3);
    g.fillStyle(c, 1); g.beginPath(); g.arc(x, hy - 2, 13, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(0xfff6d8, 0.7); g.fillEllipse(x - 4, hy - 8, 10, 5);
    g.fillStyle(0xffd45c, 0.95); g.fillCircle(x, hy - 16, 5);
    g.fillStyle(a, 0.95); g.fillCircle(x, hy - 16, 2);
    for (const k of [-1, 1]) {
      for (let j = 0; j < 4; j++) { g.fillStyle(j % 2 ? 0x5fd0ff : 0xfff6d8, 0.95); g.fillCircle(x + k * 13, hy - 4 + j * 5, 1.8); }
      g.lineStyle(1.2, 0xffd45c, 0.8); g.lineBetween(x + k * 13, hy - 6, x + k * 13, hy + 14);
    }
  } },
  takOniMask: { c: 0xd83a2a, a: 0xfff0d8, draw: (g, now, x, hy, c, a) => {
    // 鬼面：红面獠牙鬼面具（整颗头），额生双角、怒目
    g.fillStyle(c, 1);
    hpoly(g, [[x - 13, hy - 2], [x - 11, hy - 14], [x + 11, hy - 14], [x + 13, hy - 2], [x + 8, hy + 10], [x, hy + 13], [x - 8, hy + 10]], c, 1);
    g.fillStyle(0xb02a1a, 0.6); g.fillEllipse(x - 5, hy - 8, 8, 4);
    for (const k of [-1, 1]) { g.fillStyle(0xffd45c, 0.95); g.fillTriangle(x + k * 6, hy - 13, x + k * 9, hy - 13, x + k * 11, hy - 24); }
    g.fillStyle(0x1a1a1e, 1); g.fillEllipse(x - 5, hy - 4, 5, 3.4); g.fillEllipse(x + 5, hy - 4, 5, 3.4);
    g.fillStyle(a, 0.95); g.fillCircle(x - 5, hy - 4, 1.4); g.fillCircle(x + 5, hy - 4, 1.4);
    g.fillStyle(0x1a1a1e, 1); g.fillEllipse(x, hy + 5, 9, 5); // 张口
    g.fillStyle(0xfff6d8, 0.95);
    for (let k = 0; k < 4; k++) { g.fillTriangle(x - 6 + k * 4, hy + 3, x - 4 + k * 4, hy + 3, x - 5 + k * 4, hy + 7); g.fillTriangle(x - 6 + k * 4, hy + 8, x - 4 + k * 4, hy + 8, x - 5 + k * 4, hy + 5); }
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(0xff5a3a, gl * 0.4); g.fillEllipse(x, hy - 8, 20, 12);
  } },
  celtAntler: { c: 0x6a4a2a, a: 0x8fd45a, draw: (g, now, x, hy, c, a) => {
    // 鹿角冠：树枝状鹿角，枝尖发绿光
    g.fillStyle(0x4a3420, 1); g.fillRoundedRect(x - 10, hy - 6, 20, 6, 3);
    for (const k of [-1, 1]) {
      g.lineStyle(3, c, 1);
      g.beginPath(); g.moveTo(x + k * 5, hy - 4); g.lineTo(x + k * 10, hy - 16); g.lineTo(x + k * 16, hy - 24); g.strokePath();
      g.lineStyle(2.2, c, 1);
      g.beginPath(); g.moveTo(x + k * 9, hy - 13); g.lineTo(x + k * 16, hy - 14); g.strokePath();
      g.beginPath(); g.moveTo(x + k * 13, hy - 20); g.lineTo(x + k * 19, hy - 22); g.strokePath();
      g.fillStyle(a, 0.85); g.fillCircle(x + k * 16, hy - 25 + Math.sin(now / 400 + k) * 1.4, 2.2);
      g.fillStyle(a, 0.6); g.fillCircle(x + k * 19, hy - 22, 1.4);
    }
    g.fillStyle(a, 0.9); g.fillCircle(x, hy - 6, 2.4);
  } },
  celtMistletoe: { c: 0x2f7a4a, a: 0xfff6d8, draw: (g, now, x, hy, c, a) => {
    // 槲寄生花冠：绿叶编环 + 白果
    g.fillStyle(c, 1); g.fillRoundedRect(x - 15, hy - 6, 30, 5, 2.5);
    for (let k = 0; k < 7; k++) {
      const bx = x - 13 + k * 4.4;
      g.fillStyle(k % 2 ? 0x3f9a5a : c, 0.95);
      g.fillEllipse(bx, hy - 10 + Math.sin(k) * 2, 6, 4);
    }
    for (let k = 0; k < 4; k++) {
      const bx = x - 9 + k * 6;
      const gl = 0.6 + 0.4 * Math.sin(now / 400 + k);
      g.fillStyle(a, gl); g.fillCircle(bx, hy - 7, 2.4);
      g.fillStyle(0xffffff, gl * 0.8); g.fillCircle(bx - 0.6, hy - 7.6, 1);
    }
  } },
  mesoHornedCrown: { c: 0xd8b45a, a: 0x5a8aff, draw: (g, _now, x, hy, c, a) => {
    // 角神冠：多层牛角神冠，冠带镶青金石
    g.fillStyle(0x8a6a2a, 1); g.fillRoundedRect(x - 15, hy - 10, 30, 10, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 14, hy - 9, 28, 8, 3);
    for (let k = -1; k <= 1; k++) {
      g.fillStyle(0xffd45c, 1);
      hpoly(g, [[x + k * 8, hy - 8], [x + k * 10, hy - 20], [x + k * 13, hy - 8]], 0xffd45c, 1);
      g.fillStyle(0xe8c860, 0.9); hpoly(g, [[x + k * 8, hy - 8], [x + k * 14, hy - 15], [x + k * 15, hy - 9]], 0xe8c860, 0.9);
    }
    for (let k = -1; k <= 1; k++) { g.fillStyle(a, 0.95); g.fillRect(x + k * 5 - 1.4, hy - 8, 2.8, 6); }
    g.fillStyle(0xffffff, 0.5); g.fillRect(x - 12, hy - 7, 24, 1.4);
  } },
  mesoLapisTiara: { c: 0x2a4a8a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 青金石冠：蓝冠镶金与宝石，中央宝石呼吸发光
    g.fillStyle(a, 1); g.fillRoundedRect(x - 15, hy - 7, 30, 6, 3);
    g.fillStyle(c, 1); g.beginPath(); g.arc(x, hy - 2, 13, Math.PI, TAU); g.closePath(); g.fillPath();
    for (let k = 0; k < 5; k++) { g.fillStyle(a, 0.95); g.fillTriangle(x - 12 + k * 6, hy - 9, x - 9 + k * 6, hy - 9, x - 10.5 + k * 6, hy - 17); }
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(0x5fd0ff, gl); g.fillCircle(x, hy - 6, 3.4);
    g.fillStyle(0xffffff, gl * 0.9); g.fillCircle(x - 0.8, hy - 7, 1.4);
    g.fillStyle(0xff5a8a, 0.95); g.fillCircle(x - 8, hy - 8, 1.6); g.fillCircle(x + 8, hy - 8, 1.6);
  } },
  cthDeepCrown: { c: 0x2a5a44, a: 0x5fe8c8, draw: (g, now, x, hy, c, a) => {
    // 深渊王冠：骨质尖冠，镶一只会转的独眼
    g.fillStyle(0x1a3a2e, 1); g.fillRoundedRect(x - 15, hy - 8, 30, 9, 3);
    g.fillStyle(0xd8e8d8, 0.95);
    for (let k = 0; k < 5; k++) { g.fillTriangle(x - 14 + k * 7, hy - 8, x - 9 + k * 7, hy - 8, x - 11.5 + k * 7, hy - 22 - (k % 2) * 4); }
    g.fillStyle(c, 0.9); g.fillRect(x - 15, hy - 1, 30, 3);
    const look = Math.sin(now / 500) * 3;
    g.fillStyle(0x0e2a1e, 1); g.fillEllipse(x, hy - 5, 11, 8);
    g.fillStyle(0xfff0a0, 0.95); g.fillCircle(x + look * 0.4, hy - 5, 4);
    g.fillStyle(0x1a0e2e, 1); g.fillCircle(x + look, hy - 5, 2);
    g.fillStyle(a, 0.9); g.fillCircle(x + look, hy - 5, 0.9);
  } },
  cthEyeCrown: { c: 0x1e4a3a, a: 0x7a4aa8, draw: (g, now, x, hy, c, a) => {
    // 独眼冠：暗绿冠圈，冠心一只会眨的巨眼
    g.fillStyle(0x0e2a1e, 1); g.fillRoundedRect(x - 15, hy - 7, 30, 8, 3);
    g.fillStyle(c, 0.95); g.fillRoundedRect(x - 13, hy - 6, 26, 6, 2.5);
    const blink = Math.abs(Math.sin(now / 900)) > 0.08 ? 1 : 0.15;
    g.fillStyle(0xfff0a0, 0.95); g.fillEllipse(x, hy - 3, 16, 11 * blink);
    g.fillStyle(0x1a0e2e, 1); g.fillCircle(x + Math.sin(now / 700) * 2, hy - 3, 4 * blink);
    g.fillStyle(a, 0.9); g.fillCircle(x + Math.sin(now / 700) * 2, hy - 3, 1.8 * blink);
    g.fillStyle(0xffffff, 0.8); g.fillCircle(x - 2, hy - 5, 1.4 * blink);
    for (let k = 0; k < 6; k++) { const ang = -0.9 + k * 0.36; g.lineStyle(1.2, 0x2a0e2e, 0.7); g.lineBetween(x, hy - 3, x + Math.cos(ang) * 8, hy - 3 + Math.sin(ang) * 5); }
  } },
};
