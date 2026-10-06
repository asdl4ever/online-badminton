import { TAU, type MountArt } from './shared';

/** 批六主题坐骑（法老秘葬 / 暗部忍道）。(x, y) = 地面基准，f = 朝向。 */
export const MOUNTS_8: Record<string, MountArt> = {
  egMount: { c: 0x3a5a8a, a: 0xffd45c, draw: (g, now, x, y, f, c, a) => {
    // 圣甲金车：巨型圣甲虫拉的金车——圣甲虫 + 金车 + 车上金日 + 沙尘
    const by = y - 16;
    g.fillStyle(0x2a2010, 0.25);
    g.fillEllipse(x, y + 1, 60, 9);
    // 六足圣甲虫（前面拉车）
    const bx = x + f * 22;
    for (let k = 0; k < 6; k++) {
      const front = k < 3;
      const lx = bx + f * (front ? 8 - (k % 3) * 6 : -8 - (k % 3) * 6);
      const sw = Math.sin(now / 260 + (k % 3) * 2) * 3;
      g.lineStyle(2.4, 0x2a3a5a, 1);
      g.lineBetween(lx, by + 2, lx + sw, y - 2);
    }
    g.fillStyle(c, 1); // 虫身
    g.fillEllipse(bx, by, 24, 18);
    g.fillStyle(0x2a3a5a, 0.8); // 鞘翅缝
    g.lineBetween(bx, by - 8, bx, by + 8);
    g.fillStyle(a, 0.95); // 头 + 角
    g.fillCircle(bx + f * 11, by - 2, 6);
    g.fillTriangle(bx + f * 12, by - 6, bx + f * 20, by - 10, bx + f * 13, by - 2);
    g.fillStyle(0x5ac8ff, 0.8 + 0.2 * Math.sin(now / 300)); // 复眼
    g.fillCircle(bx + f * 12, by - 4, 1.6);
    // 金车（虫后拖的車）
    const cx = x - f * 16;
    g.fillStyle(0xd9b45c, 1); // 车厢
    g.fillRoundedRect(cx - f * 12, by - 6, f * 24, 14, 3);
    g.fillStyle(0xfff0b0, 0.6);
    g.fillRect(cx - f * 12, by - 6, f * 24, 3);
    g.fillStyle(0x8a6a2a, 0.9); // 车轮（两只石轮）
    for (const s of [-1, 1]) {
      g.fillCircle(cx + s * f * 8, by + 9, 5);
      g.fillStyle(0x5a4218, 0.8);
      g.fillCircle(cx + s * f * 8, by + 9, 2);
      g.fillStyle(0x8a6a2a, 0.9);
    }
    g.lineStyle(2.4, 0x8a6a2a, 1); // 挽绳
    g.lineBetween(bx - f * 10, by, cx + f * 12, by - 2);
    // 车上金日圆盘（缓转 + 光芒）
    g.fillStyle(a, 0.95);
    g.fillCircle(cx, by - 14, 7);
    g.fillStyle(0xfff6d8, 0.8);
    g.fillCircle(cx, by - 14, 3.4);
    for (let k = 0; k < 6; k++) {
      const ang2 = now / 800 + (k / 6) * TAU;
      g.lineStyle(1.4, a, 0.8);
      g.lineBetween(cx + Math.cos(ang2) * 8, by - 14 + Math.sin(ang2) * 8, cx + Math.cos(ang2) * 11, by - 14 + Math.sin(ang2) * 11);
    }
    // 沙尘（虫足扬起）
    for (let k = 0; k < 3; k++) {
      const ph = (now / 500 + k / 3) % 1;
      g.fillStyle(0xe8c88a, 0.5 * (1 - ph));
      g.fillCircle(bx - f * (8 + ph * 14), y - 2 - ph * 5, 2.4 * (1 - ph) + 0.6);
    }
  } },
  njaMount: { c: 0x8a7a5a, a: 0xb08ad0, draw: (g, now, x, y, f, c, a) => {
    // 忍犬疾风：披甲忍犬——犬身奔跑 + 护甲 + 额护 + 奔跑尘土
    const by = y - 18;
    g.fillStyle(0x0c0c12, 0.25);
    g.fillEllipse(x, y + 1, 52, 8);
    // 四足奔跑
    for (let k = 0; k < 4; k++) {
      const front = k < 2;
      const lx = x + f * (front ? 14 - (k % 2) * 7 : -12 - (k % 2) * 7);
      const sw = Math.sin(now / 180 + (k % 2) * Math.PI + (front ? 0 : 1.3)) * 5;
      g.fillStyle(0x6a5a3e, 1);
      g.fillRect(lx - 2, by + 6, 4, 13 - Math.abs(sw));
      g.fillStyle(0x2a2014, 1);
      g.fillRect(lx - 2.4 + sw * 0.4, y - 3, 4.8, 3.4);
    }
    g.fillStyle(c, 1); // 躯干
    g.fillEllipse(x, by, 34, 16);
    g.fillStyle(0x9a8a68, 0.6);
    g.fillEllipse(x - f * 2, by - 4, 24, 7);
    // 护甲（背上深色甲片）
    g.fillStyle(0x2a2a34, 1);
    g.fillRoundedRect(x - f * 10, by - 8, f * 18, 9, 3);
    g.fillStyle(0xb08ad0, 0.8); // 甲上忍纹
    g.fillCircle(x - f * 4, by - 3.4, 2);
    // 头（竖耳 + 咧嘴 + 额护）
    const hx = x + f * 20, hy = by - 8;
    g.fillStyle(c, 1);
    g.fillEllipse(hx, hy, 15, 12);
    g.fillStyle(0x6a5a3e, 1); // 吻
    g.fillEllipse(hx + f * 6, hy + 2, 8, 6);
    g.fillStyle(0x2a2014, 1); // 鼻
    g.fillCircle(hx + f * 9.4, hy + 1, 1.2);
    g.fillStyle(0xffffff, 0.9); // 獠牙
    g.fillTriangle(hx + f * 7, hy + 4, hx + f * 8.4, hy + 4, hx + f * 7.7, hy + 6.4);
    for (const s of [-1, 1]) { // 竖耳
      g.fillStyle(0x6a5a3e, 1);
      g.fillTriangle(hx + f * (s > 0 ? 2 : -4), hy - 5, hx + f * (s > 0 ? 5 : -1), hy - 4, hx + f * (s > 0 ? 3.4 : -2.4), hy - 10);
    }
    g.fillStyle(0x2a2a34, 0.95); // 额护
    g.fillRect(hx - f * 2, hy - 6, f * 8, 3.4);
    g.fillStyle(a, 0.9);
    g.fillCircle(hx + f * 2, hy - 4.4, 1);
    g.fillStyle(0x1a0e08, 1); // 眼
    g.fillCircle(hx + f * 3, hy - 1, 1.2);
    g.fillStyle(0xff5a5c, 0.7 + 0.3 * Math.sin(now / 240)); // 忍犬红眼
    g.fillCircle(hx + f * 3.2, hy - 1, 0.6);
    // 尾（卷尾摇动）
    const tail = Math.sin(now / 200) * 3;
    g.fillStyle(0x6a5a3e, 1);
    g.fillCircle(x - f * 18, by - 6 + tail, 4);
    g.fillCircle(x - f * 20, by - 9 + tail, 3);
    // 奔跑尘土
    for (let k = 0; k < 3; k++) {
      const ph = (now / 320 + k / 3) % 1;
      g.fillStyle(0xd0c4ac, 0.4 * (1 - ph));
      g.fillCircle(x - f * (16 + ph * 12), y - 2 - ph * 3, 2.2 * (1 - ph) + 0.5);
    }
  } },
};
