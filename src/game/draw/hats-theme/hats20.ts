import { TAU, hpoly, type HatArt } from './shared';

/** 第六批头饰（斯拉夫 / 波斯 / 印加 / 波利尼西亚 / 澳洲梦幻时代） */

export const HATS_20: Record<string, HatArt> = {
  // ── 斯拉夫 ──
  slavHutCrown: { c: 0x8a5a2a, a: 0x7dff6a, draw: (g, now, x, hy, c, a) => {
    // 鸡爪屋冠：洋葱木屋小冠 + 会伸缩踩踏的鸡爪 + 两盏灯火
    g.fillStyle(0x5a3a1a, 1);
    hpoly(g, [[x - 13, hy], [x - 9, hy - 18], [x, hy - 26], [x + 9, hy - 18], [x + 13, hy]], 0x5a3a1a, 1);
    g.fillStyle(c, 1);
    hpoly(g, [[x - 10, hy - 1], [x - 7, hy - 16], [x, hy - 22], [x + 7, hy - 16], [x + 10, hy - 1]], c, 1);
    g.fillStyle(0x2a1a0a, 1); g.fillRect(x - 3, hy - 12, 6, 8); // 门
    for (const s of [-1, 1]) { g.fillStyle(0xffd45c, 0.9); g.fillRect(x + s * 6 - 1.4, hy - 12, 2.8, 3); } // 窗
    // 屋顶下的鸡爪
    for (const s of [-1, 1]) {
      const step = Math.sin(now / 350 + (s > 0 ? 0 : Math.PI)) * 2;
      g.lineStyle(2.4, 0xd8b45a, 0.95); g.beginPath(); g.moveTo(x + s * 6, hy - 2); g.lineTo(x + s * 6, hy + 6 + step); g.strokePath();
      for (let j = -1; j <= 1; j++) { g.lineStyle(1.6, 0xd8b45a, 0.95); g.beginPath(); g.moveTo(x + s * 6, hy + 6 + step); g.lineTo(x + s * 6 + j * 3, hy + 10 + step); g.strokePath(); }
    }
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(a, gl * 0.6); g.fillCircle(x, hy - 26, 5);
    for (const s of [-1, 1]) { g.fillStyle(0xffd45c, 0.6 + 0.4 * Math.sin(now / 200 + s)); g.fillCircle(x + s * 6, hy - 10, 1.6); }
  } },
  slavBoneWreath: { c: 0xd8e0d0, a: 0x7dff6a, draw: (g, now, x, hy, c, a) => {
    // 骷髅花环：一圈小骷髅，眼窝依次亮起
    g.fillStyle(0x6a5a3a, 1); g.fillRoundedRect(x - 16, hy - 4, 32, 4, 2);
    for (let k = 0; k < 8; k++) {
      const bx = x - 14 + k * 4;
      const lit = 0.3 + 0.7 * Math.max(0, Math.sin(now / 400 - k * 0.8));
      g.fillStyle(c, 1); g.fillCircle(bx, hy - 8, 3.4);
      g.fillStyle(0x1a1a1e, 1); g.fillCircle(bx - 1, hy - 9, 0.9); g.fillCircle(bx + 1, hy - 9, 0.9);
      g.fillStyle(a, lit); g.fillCircle(bx - 1, hy - 9, 0.5); g.fillCircle(bx + 1, hy - 9, 0.5);
    }
    g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 300)); g.fillCircle(x, hy - 8, 2);
  } },
  // ── 波斯 ──
  persFireCrown: { c: 0xffd45c, a: 0xff8a2a, draw: (g, now, x, hy, c, a) => {
    // 圣火冠：镂空金冠 + 冠顶三簇不同频率火焰 + 冠沿火星
    g.fillStyle(0xb87a1a, 1); g.fillRoundedRect(x - 15, hy - 9, 30, 9, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 14, hy - 8, 28, 7, 3);
    g.fillStyle(0x8a5a1a, 1);
    for (let k = 0; k < 5; k++) g.fillRect(x - 12 + k * 6, hy - 8, 2, 6);
    for (let k = 0; k < 3; k++) {
      const fl = 0.5 + 0.5 * Math.sin(now / (200 + k * 90) + k);
      const fx = x - 9 + k * 9;
      g.fillStyle(0xff5a2a, 0.85); g.fillPoints([{ x: fx - 4, y: hy - 9 }, { x: fx + 4, y: hy - 9 }, { x: fx, y: hy - 20 - fl * 6 }] as never, true);
      g.fillStyle(a, 0.95); g.fillEllipse(fx, hy - 14 - fl * 3, 4, 8);
      g.fillStyle(0xfff0b0, 0.9); g.fillEllipse(fx, hy - 13, 2, 5);
    }
    for (let k = 0; k < 3; k++) { const ph = ((now / 600 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(x + (k - 1) * 8, hy - 24 - ph * 8, 1.4); }
  } },
  persRoseTiara: { c: 0xc0394a, a: 0x5fd0ff, draw: (g, now, x, hy, c, a) => {
    // 玫瑰宝冠：玫瑰 + 青金石小冠，花瓣飘落、中央宝石呼吸
    g.fillStyle(0x2a4a8a, 1); g.fillRoundedRect(x - 15, hy - 5, 30, 5, 2.5);
    for (let k = 0; k < 7; k++) { const bx = x - 13 + k * 4.4; g.fillStyle(k % 2 ? c : 0xff8ab0, 0.95); g.fillCircle(bx, hy - 8, 2.6); g.fillStyle(0x8a2a3a, 0.6); g.fillCircle(bx, hy - 8, 1); }
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(a, gl); g.fillCircle(x, hy - 4, 3); g.fillStyle(0xffffff, gl * 0.9); g.fillCircle(x - 0.8, hy - 5, 1.2);
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle(0xffb7d5, (1 - ph) * 0.8); g.fillCircle(x - 10 + k * 10, hy - ph * 14, 1.4); }
  } },
  // ── 印加 ──
  incaSunCrown: { c: 0xffd45c, a: 0xfff0b0, draw: (g, now, x, hy, c, a) => {
    // 太阳金冠：金圈 + 16 道相位错开伸缩的放射光芒 + 冠心金盘呼吸
    g.fillStyle(0xb87a1a, 1); g.fillRoundedRect(x - 15, hy - 7, 30, 7, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(x - 14, hy - 6, 28, 6, 3);
    for (let k = 0; k < 16; k++) {
      const ang = Math.PI + (k / 15) * Math.PI;
      const len = 7 + 4 * (0.5 + 0.5 * Math.sin(now / 260 + k * 0.7));
      g.fillStyle(k % 2 ? c : 0xb87a1a, 0.95);
      g.fillPoints([{ x: x + Math.cos(ang) * 12, y: hy - 3 + Math.sin(ang) * 12 }, { x: x + Math.cos(ang + 0.09) * (12 + len), y: hy - 3 + Math.sin(ang + 0.09) * (12 + len) }, { x: x + Math.cos(ang - 0.09) * (12 + len), y: hy - 3 + Math.sin(ang - 0.09) * (12 + len) }] as never, true);
    }
    const gl = 0.6 + 0.4 * Math.sin(now / 320);
    g.fillStyle(0xff8a2a, gl * 0.7); g.fillCircle(x, hy - 3, 9);
    g.fillStyle(c, 1); g.fillCircle(x, hy - 3, 6);
    g.fillStyle(0x8a5a1a, 1); g.fillCircle(x - 2, hy - 4, 0.9); g.fillCircle(x + 2, hy - 4, 0.9);
    void a;
  } },
  incaCondorHelm: { c: 0x2a2a34, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 神鹰盔：鹰首居中、双翅半张，鹰眼发光
    g.fillStyle(0x14141c, 1); g.fillRoundedRect(x - 14, hy - 6, 28, 6, 3);
    for (const s of [-1, 1]) { g.fillStyle(c, 1); g.fillPoints([{ x, y: hy - 6 }, { x: x + s * 20, y: hy - 18 }, { x: x + s * 22, y: hy - 4 }] as never, true); }
    g.fillStyle(0xd8c8a0, 1); g.fillCircle(x, hy - 10, 7);
    g.fillStyle(0xff8a2a, 1); g.fillTriangle(x - 3, hy - 8, x + 3, hy - 8, x, hy - 2);
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(0xffd45c, gl); g.fillCircle(x - 3, hy - 12, 1.6); g.fillCircle(x + 3, hy - 12, 1.6);
    g.fillStyle(0x1a1a1e, 1); g.fillCircle(x - 3, hy - 12, 0.7); g.fillCircle(x + 3, hy - 12, 0.7);
    g.fillStyle(a, 0.95); g.fillTriangle(x - 2, hy - 18, x + 2, hy - 18, x, hy - 24);
  } },
  // ── 波利尼西亚 ──
  polyTikiMask: { c: 0x8a5a2a, a: 0x5fe8d0, draw: (g, now, x, hy, c, _a) => {
    // 提基面具：螺旋刻纹木面具，两眼透绿光，头顶羽饰
    g.fillStyle(0x5a3a1a, 1); hpoly(g, [[x - 12, hy + 10], [x - 13, hy - 14], [x + 13, hy - 14], [x + 12, hy + 10]], 0x5a3a1a, 1);
    g.fillStyle(c, 1); hpoly(g, [[x - 10, hy + 8], [x - 11, hy - 12], [x + 11, hy - 12], [x + 10, hy + 8]], c, 1);
    g.lineStyle(1.6, 0x2a1a0a, 0.7); g.beginPath(); g.arc(x, hy - 2, 4, 0, TAU); g.strokePath();
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(0x1a1a16, 1); g.fillEllipse(x - 5, hy - 5, 5, 4); g.fillEllipse(x + 5, hy - 5, 5, 4);
    g.fillStyle(0x5fe8d0, gl); g.fillCircle(x - 5, hy - 5, 1.6); g.fillCircle(x + 5, hy - 5, 1.6);
    g.fillStyle(0x1a1a16, 1); g.fillRect(x - 6, hy + 3, 12, 4);
    for (let k = 0; k < 4; k++) { g.fillStyle(0xfff0d0, 0.95); g.fillTriangle(x - 5 + k * 4, hy + 3, x - 3 + k * 4, hy + 3, x - 4 + k * 4, hy + 7); }
    for (let k = 0; k < 3; k++) { g.fillStyle(k % 2 ? 0xff5a3a : 0xffd45c, 0.95); g.fillTriangle(x - 6 + k * 6, hy - 13, x - 3 + k * 6, hy - 13, x - 4.5 + k * 6 + Math.sin(now / 400 + k) * 1.5, hy - 22); }
  } },
  polyFeatherHelm: { c: 0xc0392b, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 羽毛战冠：红黄羽毛编成的战冠，羽片相位错开摆动
    g.fillStyle(0x8a5a2a, 1); g.fillRoundedRect(x - 14, hy - 5, 28, 5, 2.5);
    for (let k = 0; k < 7; k++) {
      const bx = x - 12 + k * 4;
      const sw = Math.sin(now / 320 + k * 0.9) * 3;
      g.lineStyle(2.4, k % 2 ? c : a, 0.95);
      g.beginPath(); g.moveTo(bx, hy - 4); g.lineTo(bx + sw, hy - 20 - (k % 2) * 4); g.strokePath();
      g.fillStyle(k % 2 ? a : c, 0.95); g.fillCircle(bx + sw, hy - 21 - (k % 2) * 4, 2.2);
    }
    g.fillStyle(0xfff0d0, 0.7); g.fillRect(x - 13, hy - 3, 26, 1.4);
  } },
  // ── 澳洲梦幻时代 ──
  auzSerpentCrown: { c: 0x8fd45a, a: 0xff8a5c, draw: (g, now, x, hy, _c, a) => {
    // 虹蛇冠：小虹蛇盘成冠，七色鳞环滚动，蛇信吐收
    const cols = [0xff5a5a, 0xff9a3c, 0xffd45c, 0x8fd45a, 0x5fd0ff, 0x7a6aff, 0xd45aff];
    g.lineStyle(6, 0x1e5a36, 1); g.beginPath(); g.arc(x, hy - 5, 11, Math.PI * 0.15, Math.PI * 0.85); g.strokePath();
    for (let k = 0; k < 12; k++) {
      const t = k / 11, ang = Math.PI * (0.15 + t * 0.7);
      const px = x + Math.cos(ang) * 11, py = hy - 5 + Math.sin(ang) * 11;
      g.fillStyle(cols[(k + Math.floor(now / 200)) % 7], 0.95); g.fillCircle(px, py, 2);
    }
    const hx = x + 11, hyy = hy - 6;
    g.fillStyle(cols[Math.floor(now / 200) % 7], 1); g.fillCircle(hx, hyy, 3.6);
    g.fillStyle(0xfff0a0, 0.95); g.fillCircle(hx + 1, hyy - 1, 1);
    const tongue = Math.sin(now / 150) > 0 ? 1 : 0;
    if (tongue) { g.lineStyle(1.2, 0xff3a5a, 0.9); g.beginPath(); g.moveTo(hx + 3, hyy); g.lineTo(hx + 8, hyy - 1); g.strokePath(); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillCircle(x, hy - 5, 14);
  } },
  auzEmuCrest: { c: 0x9a8a6a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 鸸鹋羽冠：一簇蓬松羽毛冠，羽片相位错开摆动、羽尖泛光
    g.fillStyle(0x6a5a3a, 1); g.fillRoundedRect(x - 12, hy - 4, 24, 4, 2);
    for (let k = 0; k < 9; k++) {
      const bx = x - 11 + k * 2.8, sw = Math.sin(now / 300 + k * 0.8) * 3;
      g.lineStyle(2, k % 2 ? c : 0x7a6a4a, 0.95);
      g.beginPath(); g.moveTo(bx, hy - 3); g.lineTo(bx + sw, hy - 16 - (k % 3) * 4); g.strokePath();
      g.fillStyle(a, 0.5 + 0.5 * Math.sin(now / 300 + k)); g.fillCircle(bx + sw, hy - 17 - (k % 3) * 4, 1.2);
    }
  } },
};
