import { mpoly, type MountArt } from './shared';

/** 批十三坐骑（尼斯湖水怪 / 熊出没 / 雪山谜踪）——(x, y) = 地面基准，f = 朝向 */

export const MOUNTS_15: Record<string, MountArt> = {
  lochMount: { c: 0x35d8a8, a: 0x8fe8c8, draw: (g, now, x, y, f, c, a) => {
    // 湖怪幼崽：一只长颈小水怪，四只鳍足划水，尾巴摆动，背上挂水珠
    const bob = Math.sin(now / 480) * 1.8;
    const bodyY = y - 16 + bob * 0.4;
    // 四只鳍足
    for (const [lx, ph] of [[-22, 0], [-8, Math.PI], [10, Math.PI], [24, 0]] as Array<[number, number]>) {
      const sw = Math.sin(now / 300 + ph) * 3;
      g.fillStyle(0x1c5a4e, 0.95);
      g.fillEllipse(x + lx * f + sw, y - 5, 14, 8);
      g.fillStyle(a, 0.35);
      g.fillEllipse(x + lx * f + sw, y - 5, 9, 4.5);
    }
    // 躯干
    g.fillStyle(0x0e3a3a, 0.9);
    g.fillEllipse(x, bodyY, 62, 30);
    g.fillStyle(c, 1);
    g.fillEllipse(x, bodyY - 1, 56, 25);
    g.fillStyle(a, 0.35); // 腹部浅色
    g.fillEllipse(x, bodyY + 7, 44, 10);
    // 背脊小鳍
    for (let k = -2; k <= 2; k++) {
      g.fillStyle(0x1c5a4e, 1);
      g.fillTriangle(x + k * 8, bodyY - 10, x + k * 8 + 3, bodyY - 10, x + k * 8 + 1.5, bodyY - 20);
    }
    // 长颈 + 头（朝向 f）
    const neckX = x + 26 * f;
    g.lineStyle(9, c, 1);
    g.beginPath();
    g.moveTo(neckX - 4 * f, bodyY - 6);
    g.lineTo(neckX + 6 * f, bodyY - 26 + bob);
    g.lineTo(neckX + 14 * f, bodyY - 40 + bob);
    g.strokePath();
    g.lineStyle(5, a, 0.4);
    g.beginPath();
    g.moveTo(neckX - 4 * f, bodyY - 6);
    g.lineTo(neckX + 6 * f, bodyY - 26 + bob);
    g.lineTo(neckX + 14 * f, bodyY - 40 + bob);
    g.strokePath();
    const hx = neckX + 14 * f, hy = bodyY - 40 + bob;
    g.fillStyle(c, 1);
    g.fillEllipse(hx, hy, 18, 11);
    g.fillStyle(a, 0.5);
    g.fillTriangle(hx - 6 * f, hy - 6, hx + 6 * f, hy - 6, hx, hy - 14); // 头冠
    g.fillStyle(0x0e3a3a, 1); // 眼
    g.fillCircle(hx + 4 * f, hy - 2, 1.8);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(hx + 4.5 * f, hy - 2.5, 0.7);
    g.fillStyle(0x1c5a4e, 1); // 嘴
    g.fillRoundedRect(hx + (f > 0 ? 6 : -14), hy + 1, 8, 2.6, 1);
    // 尾巴
    const tw = Math.sin(now / 380);
    g.lineStyle(6, c, 1);
    g.beginPath();
    g.moveTo(x - 28 * f, bodyY);
    g.lineTo(x - 40 * f, bodyY - 4 + tw * 5);
    g.lineTo(x - 50 * f, bodyY - 10 + tw * 9);
    g.strokePath();
    // 背上水珠
    for (let k = 0; k < 3; k++) {
      const ph = ((now / 800 + k / 3) % 1);
      g.fillStyle(0xdff6ee, 0.7 * (1 - ph));
      g.fillCircle(x - 10 + k * 12, bodyY - 12 - ph * 10, 1.5 * (1 - ph) + 0.5);
    }
    g.fillStyle(0x000000, 0.14);
    g.fillEllipse(x, y + 2, 66, 10);
  } },
  boonMount: { c: 0xd9a63c, a: 0x8a5a3a, draw: (g, now, x, y, f, c, a) => {
    // 光头强的伐木车：一辆小卡车，货斗里码着圆木，驾驶舱亮灯，排气冒烟
    const by = y - 16;
    // 底盘
    g.fillStyle(0x3a2a18, 1);
    mpoly(g, [[x - 44 * f, by + 6], [x + 44 * f, by + 6], [x + 40 * f, by - 2], [x - 40 * f, by - 2]], 0x3a2a18, 1);
    // 货斗 + 圆木
    g.fillStyle(0x4a3420, 1);
    g.fillRoundedRect(x - 8 * f - (f > 0 ? 30 : 0), by - 12, 46, 14, 3);
    for (let k = 0; k < 3; k++) {
      const ly = by - 18 + k * 6;
      g.fillStyle(k % 2 ? 0x8a5a3a : 0x6a4a2a, 1);
      g.fillRoundedRect(x - 34 * f, ly, 44, 6, 3);
      g.fillStyle(0xb8945a, 0.5);
      g.fillEllipse(x - 34 * f + (f > 0 ? 44 : 0), ly + 3, 6, 6);
    }
    g.lineStyle(2, 0x2a1e12, 0.9); // 捆绳
    g.lineBetween(x - 30 * f, by - 20, x - 30 * f, by + 2);
    g.lineBetween(x - 6 * f, by - 20, x - 6 * f, by + 2);
    // 驾驶舱（朝 f）
    g.fillStyle(c, 1);
    g.fillRoundedRect(x + (f > 0 ? 16 : -38), by - 16, 22, 20, 4);
    g.fillStyle(0x8fd8ff, 0.8); // 挡风窗
    g.fillRoundedRect(x + (f > 0 ? 18 : -34), by - 14, 18, 9, 2);
    g.fillStyle(0xfff0b0, 0.9); // 车灯
    g.fillCircle(x + (f > 0 ? 39 : -39), by - 2, 2.4);
    // 车轮（滚动）
    const roll = now / 200;
    for (const [wx, ph] of [[-30, 0], [-12, 1], [18, 0], [34, 1]] as Array<[number, number]>) {
      g.fillStyle(0x141008, 1);
      g.fillCircle(x + wx * f, y - 6, 8);
      g.fillStyle(0x3a2a18, 1);
      g.fillCircle(x + wx * f, y - 6, 4.6);
      g.lineStyle(1.4, 0x141008, 0.9);
      for (let k = 0; k < 3; k++) {
        const ang = roll + ph + (k / 3) * Math.PI * 2;
        g.lineBetween(x + wx * f, y - 6, x + wx * f + Math.cos(ang) * 4.6, y - 6 + Math.sin(ang) * 4.6);
      }
    }
    // 排气烟
    for (let k = 0; k < 3; k++) {
      const ph = ((now / 900 + k / 3) % 1);
      g.fillStyle(0x9a9488, 0.28 * (1 - ph));
      g.fillCircle(x + (-42 + k * 3) * f, by - 16 - ph * 20, 3 + ph * 6);
    }
    // 木屑掉地
    for (let k = 0; k < 3; k++) {
      g.fillStyle(a, 0.8);
      g.fillRect(x - 20 + k * 16, y - 3 + (k % 2) * 2, 4, 2);
    }
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(x, y + 2, 72, 10);
  } },
  bigfMount: { c: 0x8a705a, a: 0xd8c8a0, draw: (g, now, x, y, f, c, a) => {
    // 雪原猛犸：披着长毛的猛犸，粗腿踩雪，长鼻甩动，弯牙外伸，背上积雪
    const walk = Math.sin(now / 320);
    const bodyY = y - 30;
    // 四条粗腿
    for (const [lx, ph] of [[-24, 0], [-10, Math.PI], [12, Math.PI], [24, 0]] as Array<[number, number]>) {
      const step = Math.sin(now / 300 + ph) * 3;
      g.fillStyle(0x5a4634, 1);
      g.fillRoundedRect(x + lx * f - 6 + step, bodyY + 6, 12, y - bodyY - 10, 4);
      g.fillStyle(0x6a5644, 1);
      g.fillRoundedRect(x + lx * f - 7 + step, y - 7, 14, 7, 3); // 脚
      g.lineStyle(1, 0xc9b490, 0.6); // 脚趾甲
      for (let k = -1; k <= 1; k++) g.lineBetween(x + lx * f + step + k * 4, y - 6, x + lx * f + step + k * 4, y - 2);
    }
    // 躯干（长毛）
    g.fillStyle(0x4a3828, 0.95);
    g.fillRoundedRect(x - 36, bodyY - 22, 72, 36, 16);
    g.fillStyle(c, 1);
    g.fillRoundedRect(x - 34, bodyY - 20, 68, 32, 15);
    // 长毛纹理
    g.lineStyle(2, a, 0.45);
    for (let k = 0; k < 8; k++) {
      const mx = x - 30 + k * 9;
      g.beginPath();
      g.moveTo(mx, bodyY - 18);
      g.lineTo(mx + 2, bodyY + 8);
      g.strokePath();
    }
    // 背部积雪
    g.fillStyle(0xffffff, 0.85);
    g.fillRoundedRect(x - 26, bodyY - 24, 52, 8, 4);
    // 头（朝 f）+ 长鼻 + 象牙
    const hx = x + 34 * f, hy = bodyY - 12;
    g.fillStyle(c, 1);
    g.fillRoundedRect(hx - 12, hy - 12, 24, 24, 8);
    g.fillStyle(0x5a4634, 0.7);
    g.fillEllipse(hx, hy - 4, 18, 12);
    // 大耳
    g.fillStyle(0x6a5644, 1);
    g.fillEllipse(hx - 12 * f, hy - 2, 12, 16);
    // 眼睛
    g.fillStyle(0x1a140e, 1);
    g.fillCircle(hx + 4 * f, hy - 4, 2);
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(hx + 4.6 * f, hy - 4.6, 0.8);
    // 长鼻（甩动）
    const trunk = Math.sin(now / 420) * 8;
    g.lineStyle(9, c, 1);
    g.beginPath();
    g.moveTo(hx + 6 * f, hy + 8);
    g.lineTo(hx + 10 * f, hy + 22);
    g.lineTo(hx + 4 * f + trunk * 0.5, hy + 32);
    g.strokePath();
    g.lineStyle(4, 0xd8b490, 0.5);
    g.beginPath();
    g.moveTo(hx + 6 * f, hy + 10);
    g.lineTo(hx + 9 * f, hy + 22);
    g.strokePath();
    // 弯牙
    for (const s of [1, 0]) {
      const t0 = hy + 8 + s * 3;
      g.lineStyle(4.4, 0xf0e8d0, 1);
      g.beginPath();
      g.moveTo(hx + (f > 0 ? 4 : -4), t0);
      g.lineTo(hx + (f > 0 ? 16 : -16), t0 + 6);
      g.lineTo(hx + (f > 0 ? 22 : -22), t0 - 4);
      g.strokePath();
    }
    // 尾巴
    const tw = Math.sin(now / 400);
    g.lineStyle(4, c, 1);
    g.beginPath();
    g.moveTo(x - 34 * f, bodyY - 12);
    g.lineTo(x - 42 * f, bodyY - 6 + tw * 4);
    g.strokePath();
    // 走过的脚印 + 飘雪
    for (let k = 0; k < 3; k++) {
      const ph = ((now / 1400 + k / 3) % 1);
      g.fillStyle(0xffffff, 0.55 * (1 - ph));
      g.fillCircle(x - 30 + k * 24 + walk * 2, y - 2 - ph * 8, 2 + (k % 2) * 1);
    }
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(x, y + 2, 80, 12);
  } },
};
