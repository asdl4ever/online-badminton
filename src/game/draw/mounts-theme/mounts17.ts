import { mpoly, type MountArt } from './shared';

/** 批十五坐骑（基多拉 / 魔斯拉 / 机甲战队 / 火山泰坦 / 深海巨妖）——(x, y) = 地面基准，f = 朝向 */

export const MOUNTS_17: Record<string, MountArt> = {
  ghidMount: { c: 0xffe15c, a: 0x7fd4ff, draw: (g, now, x, y, f, c, a) => {
    // 雷云飞龙驹：一头小飞龙，龙首高昂、展翅、尾巴带电弧
    const bob = Math.abs(Math.sin(now / 320)) * 3;
    const by = y - 30 - bob * 0.4;
    for (const [lx, ph] of [[-22, 0], [-8, Math.PI], [12, Math.PI], [24, 0]] as Array<[number, number]>) {
      const stp = Math.sin(now / 260 + ph) * 3;
      g.fillStyle(0x6a5418, 1);
      g.fillRoundedRect(x + lx * f - 4 + stp, by + 8, 8, y - by - 12, 3);
    }
    g.fillStyle(0x8a6a1a, 1);
    mpoly(g, [[x - 26 * f, by + 6], [x + 24 * f, by + 6], [x + 20 * f, by - 14], [x - 22 * f, by - 14]], 0x8a6a1a, 1);
    g.fillStyle(c, 1);
    mpoly(g, [[x - 22 * f, by + 4], [x + 20 * f, by + 4], [x + 16 * f, by - 11], [x - 18 * f, by - 11]], c, 1);
    for (const s of [-1, 1]) { // 展翼
      g.fillStyle(0x6a5418, 0.9);
      mpoly(g, [[x - 4 * f, by - 10], [x + s * 22, by - 34 - bob], [x + s * 40, by - 16], [x + s * 10, by - 6]], 0x6a5418, 0.9);
      g.fillStyle(c, 0.8);
      mpoly(g, [[x - 2 * f, by - 10], [x + s * 22, by - 30 - bob], [x + s * 34, by - 16], [x + s * 8, by - 8]], c, 0.8);
    }
    const tw = Math.sin(now / 400) * 6; // 尾 + 电弧
    g.lineStyle(5, c, 1);
    g.beginPath(); g.moveTo(x - 24 * f, by - 6); g.lineTo(x - 40 * f, by - 12 + tw); g.lineTo(x - 50 * f, by - 4 + tw * 1.4); g.strokePath();
    g.lineStyle(1.6, a, 0.9); g.beginPath(); g.moveTo(x - 30 * f, by - 8); g.lineTo(x - 38 * f, by - 18); g.lineTo(x - 44 * f, by - 8); g.strokePath();
    const hx = x + 28 * f, hy = by - 18 - bob; // 龙首
    g.fillStyle(c, 1); g.fillEllipse(hx, hy, 20, 12);
    g.fillStyle(0x6a5418, 1); g.fillTriangle(hx - 6, hy - 6, hx - 1, hy - 6, hx - 4, hy - 18);
    g.fillStyle(a, 0.9); g.fillCircle(hx + 5 * f, hy - 2, 2);
    g.fillStyle(0x6a5418, 1); g.fillRoundedRect(hx + 6 * f, hy + 4, 12, 4, 2);
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 2, 68, 10);
  } },
  mthrMount: { c: 0xbfe8ff, a: 0xffe66a, draw: (g, now, x, y, f, c, a) => {
    // 鳞粉飞蛾：一头巨大飞蛾坐骑，翅上带眼斑、会扇
    const bob = Math.abs(Math.sin(now / 400)) * 4;
    const by = y - 26 - bob * 0.5;
    g.fillStyle(0x6a7a5a, 1); g.fillEllipse(x, by, 40, 22); // 绒毛身体
    g.fillStyle(c, 1); g.fillEllipse(x, by - 2, 34, 17);
    g.lineStyle(5, 0x6a7a5a, 1); g.lineBetween(x - 18 * f, by, x - 40 * f, by - 6 + Math.sin(now / 400) * 4);
    const flap = Math.abs(Math.sin(now / 300));
    for (const s of [-1, 1]) {
      g.fillStyle(c, 0.9);
      mpoly(g, [[x, by - 8], [x + s * 30, by - 40 - flap * 8], [x + s * 46, by - 6], [x + s * 20, by + 8]], c, 0.9);
      g.fillStyle(a, 0.9); g.fillCircle(x + s * 30, by - 16, 6);
      g.fillStyle(0x4a3a2a, 0.9); g.fillCircle(x + s * 30, by - 16, 3);
    }
    const hx = x + 20 * f, hy = by - 12; // 头 + 触角
    g.fillStyle(0x6a7a5a, 1); g.fillCircle(hx, hy, 8);
    for (const s of [-1, 1]) { g.lineStyle(1.6, 0x6a7a5a, 1); g.beginPath(); g.moveTo(hx, hy - 6); g.lineTo(hx + s * 8 + Math.sin(now / 400 + s) * 2, hy - 20); g.strokePath(); g.fillStyle(a, 0.9); g.fillCircle(hx + s * 8, hy - 20, 1.8); }
    g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx + 3 * f, hy - 1, 1.6);
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 2, 60, 10);
  } },
  tksMount: { c: 0x5ac8ff, a: 0xff4a4a, draw: (g, now, x, y, f, c, a) => {
    // 战机摩托：一台机甲摩托，前轮大、车头尖、尾喷焰
    const by = y - 14;
    g.fillStyle(0x2a3244, 1);
    mpoly(g, [[x - 34 * f, by + 6], [x + 30 * f, by + 6], [x + 36 * f, by - 6], [x - 28 * f, by - 6]], 0x2a3244, 1);
    g.fillStyle(0x3f4a62, 1);
    mpoly(g, [[x - 28 * f, by + 2], [x + 26 * f, by + 2], [x + 30 * f, by - 5], [x - 24 * f, by - 5]], 0x3f4a62, 1);
    // 车头
    g.fillStyle(a, 1); mpoly(g, [[x + 20 * f, by - 4], [x + 40 * f, by - 2], [x + 34 * f, by + 6], [x + 20 * f, by + 6]], a, 1);
    g.fillStyle(0xffffff, 0.9); g.fillEllipse(x + 30 * f, by - 1, 10, 4);
    const roll = now / 160;
    for (const [wx, r] of [[-22, 12], [24, 10]] as Array<[number, number]>) {
      g.fillStyle(0x141418, 1); g.fillCircle(x + wx * f, y - r * 0.5, r);
      g.fillStyle(0x3f4a62, 1); g.fillCircle(x + wx * f, y - r * 0.5, r * 0.6);
      g.lineStyle(1.6, 0x141418, 0.9);
      for (let k = 0; k < 4; k++) { const ang = roll + (k / 4) * Math.PI * 2; g.lineBetween(x + wx * f, y - r * 0.5, x + wx * f + Math.cos(ang) * r * 0.6, y - r * 0.5 + Math.sin(ang) * r * 0.6); }
    }
    for (let k = 0; k < 3; k++) { const ph = ((now / 300 + k / 3) % 1); g.fillStyle(k === 0 ? 0xffffff : c, (0.8 - k * 0.22) * (1 - ph)); g.fillEllipse(x - 36 * f, by, 8 * (1 - ph) + 2, 5); }
    g.fillStyle(0x000000, 0.15); g.fillEllipse(x, y + 2, 72, 10);
  } },
  titanMount: { c: 0xff6a2a, a: 0xffd45c, draw: (g, now, x, y, f, c, a) => {
    // 岩浆巨蜥：一头四足熔岩巨蜥，背脊喷火、脚踩裂地
    const by = y - 26;
    for (const [lx, ph] of [[-24, 0], [-10, Math.PI], [12, Math.PI], [26, 0]] as Array<[number, number]>) {
      const stp = Math.sin(now / 280 + ph) * 3;
      g.fillStyle(0x3a1c12, 1); g.fillRoundedRect(x + lx * f - 5 + stp, by + 6, 10, y - by - 10, 3.6);
      g.fillStyle(0xff6a2a, 0.5); g.fillRect(x + lx * f - 5 + stp, by + 10, 10, 2);
    }
    g.fillStyle(0x3a1c12, 1);
    mpoly(g, [[x - 30 * f, by + 8], [x + 28 * f, by + 8], [x + 24 * f, by - 12], [x - 26 * f, by - 12]], 0x3a1c12, 1);
    g.fillStyle(0x5a2a1a, 1);
    mpoly(g, [[x - 26 * f, by + 5], [x + 24 * f, by + 5], [x + 20 * f, by - 9], [x - 22 * f, by - 9]], 0x5a2a1a, 1);
    for (let k = 0; k < 5; k++) { // 背脊火刺
      const heat = 0.6 + 0.4 * Math.sin(now / 260 + k);
      g.fillStyle(c, heat); g.fillTriangle(x + (-18 + k * 8) * f, by - 9, x + (-14 + k * 8) * f, by - 9, x + (-16 + k * 8) * f, by - 22);
    }
    const hx = x + 30 * f, hy = by - 12;
    g.fillStyle(0x5a2a1a, 1); g.fillEllipse(hx, hy, 20, 12);
    g.fillStyle(0x3a1c12, 1); g.fillRoundedRect(hx + 6 * f, hy + 2, 14, 6, 2);
    g.fillStyle(a, 0.9); g.fillCircle(hx + 4 * f, hy - 3, 2);
    g.fillStyle(0x000000, 0.16); g.fillEllipse(x, y + 2, 72, 11);
  } },
  leviMount: { c: 0x5fe8d0, a: 0x9b6aff, draw: (g, now, x, y, f, c, a) => {
    // 鮟鱇巨鱼：一条大嘴鮟鱇鱼，头顶发光诱饵、嘴边獠牙
    const bob = Math.sin(now / 500) * 2;
    const by = y - 22 + bob;
    g.fillStyle(0x0e2e3a, 1); g.fillEllipse(x, by, 60, 30); // 身体
    g.fillStyle(0x14424a, 1); g.fillEllipse(x, by - 2, 54, 26);
    g.fillStyle(c, 0.35); g.fillEllipse(x, by + 6, 40, 10);
    for (const s of [-1, 1]) { // 侧鳍
      g.fillStyle(0x14424a, 1); g.fillEllipse(x - 4 * f, by + s * 12, 16, 7);
    }
    const tw = Math.sin(now / 320) * 6; // 尾
    g.fillStyle(0x0e2e3a, 1); g.fillTriangle(x - 28 * f, by, x - 48 * f, by - 12 + tw, x - 48 * f, by + 12 + tw);
    for (let k = 0; k < 4; k++) { g.fillStyle(0xffd45c, 0.9); g.fillCircle(x + (16 + k * 7) * f, by + 6, 1); }
    const hx = x + 26 * f, hy = by - 2; // 头 + 大口
    g.fillStyle(0x14424a, 1); g.fillCircle(hx, hy, 14);
    g.fillStyle(0x2a0e14, 1); g.fillEllipse(hx + 4 * f, hy + 6, 24, 10); // 大嘴
    for (let k = 0; k < 6; k++) { g.fillStyle(0xe8f6ff, 0.95); g.fillTriangle(hx + (-6 + k * 4) * f, hy + 2, hx + (-4 + k * 4) * f, hy + 2, hx + (-5 + k * 4) * f, hy + 7); }
    g.fillStyle(a, 0.9); g.fillCircle(hx - 4 * f, hy - 4, 2.4);
    g.fillStyle(0x0e1e2e, 1); g.fillCircle(hx - 4 * f, hy - 4, 1.2);
    const gl = 0.5 + 0.5 * Math.sin(now / 400); // 诱饵
    g.lineStyle(2, 0x14424a, 1); g.beginPath(); g.moveTo(hx, hy - 12); g.lineTo(hx + 4 * f, hy - 26); g.strokePath();
    g.fillStyle(a, gl); g.fillCircle(hx + 4 * f, hy - 26, 4.4);
    g.fillStyle(0xffffff, gl * 0.8); g.fillCircle(hx + 3 * f, hy - 27, 1.6);
    g.fillStyle(0x000000, 0.14); g.fillEllipse(x, y + 2, 68, 10);
  } },
};
