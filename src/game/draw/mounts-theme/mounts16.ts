import { mpoly, type MountArt } from './shared';

/** 批十四坐骑（年兽迎春 / 月夜狼族 / 末日丧尸 / 大便人厕所）——(x, y) = 地面基准，f = 朝向 */

export const MOUNTS_16: Record<string, MountArt> = {
  nianMount: { c: 0xd93a3a, a: 0xffd45c, draw: (g, now, x, y, f, c, a) => {
    // 舞狮：踩高桩的醒狮——大狮头 + 金鬃 + 彩布身 + 甩动的尾
    const bob = Math.abs(Math.sin(now / 300)) * 3;
    const by = y - 22 - bob * 0.4;
    // 四条腿
    for (const [lx, ph] of [[-26, 0], [-12, Math.PI], [14, Math.PI], [28, 0]] as Array<[number, number]>) {
      const stp = Math.sin(now / 260 + ph) * 3;
      g.fillStyle(0x8a1a1a, 1);
      g.fillRoundedRect(x + lx * f - 4.4 + stp, by + 6, 8.8, y - by - 8, 3);
      g.fillStyle(a, 0.8);
      g.fillRect(x + lx * f - 4.4 + stp, by + 8, 8.8, 2);
    }
    // 彩布身
    g.fillStyle(c, 1);
    mpoly(g, [[x - 28 * f, by + 6], [x + 24 * f, by + 6], [x + 20 * f, by - 16 - bob * 0.3], [x - 24 * f, by - 16 - bob * 0.3]], c, 1);
    g.fillStyle(a, 0.7);
    for (let k = 0; k < 4; k++) g.fillCircle(x + (-18 + k * 12) * f, by - 4, 2.4);
    // 尾
    const tw = Math.sin(now / 380) * 6;
    g.lineStyle(5, c, 1);
    g.beginPath(); g.moveTo(x - 26 * f, by - 2); g.lineTo(x - 40 * f, by + 4 + tw); g.lineTo(x - 50 * f, by - 8 + tw * 1.4); g.strokePath();
    // 狮头
    const hx = x + 30 * f, hy = by - 14 - bob;
    for (let k = 0; k < 9; k++) { g.fillStyle(a, 0.95); g.fillCircle(hx - 10 + (k % 3) * 8, hy - 10 + Math.floor(k / 3) * 6, 5); }
    g.fillStyle(c, 1); g.fillCircle(hx, hy, 13);
    g.fillStyle(0xffd45c, 1); g.fillEllipse(hx + 8 * f, hy + 4, 12, 9); // 吻
    // 独角
    g.fillStyle(a, 1); g.fillTriangle(hx - 4 + 0, hy - 12, hx + 4, hy - 12, hx - 6 - f * 6, hy - 26);
    // 大眼
    for (const s of [-1, 1]) { g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx + s * 5, hy - 3, 4); g.fillStyle(0xffffff, 0.9); g.fillCircle(hx + s * 5 - 1, hy - 4, 1.4); }
    // 张口
    g.fillStyle(0x8a1a1a, 1); g.fillEllipse(hx + 9 * f, hy + 8, 10, 6);
    for (let k = 0; k < 4; k++) { g.fillStyle(0xf0f4f8, 0.95); g.fillTriangle(hx + (5 + k * 3) * f, hy + 5, hx + (7 + k * 3) * f, hy + 5, hx + (6 + k * 3) * f, hy + 9); }
    g.fillStyle(0x000000, 0.15); g.fillEllipse(x, y + 2, 72, 10);
  } },
  wolfMount: { c: 0x8a94a2, a: 0xb8c4d8, draw: (g, now, x, y, f, c, a) => {
    // 银月狼骑：一头银灰巨狼，背上一副月牙鞍
    const by = y - 26;
    for (const [lx, ph] of [[-24, 0], [-10, Math.PI], [12, Math.PI], [26, 0]] as Array<[number, number]>) {
      const stp = Math.sin(now / 260 + ph) * 3;
      g.fillStyle(0x5a6474, 1);
      g.fillRoundedRect(x + lx * f - 4.6 + stp, by + 8, 9.2, y - by - 12, 3.4);
      g.fillStyle(0x3a4048, 1);
      g.fillRoundedRect(x + lx * f - 5.6 + stp, y - 5, 11, 5, 2);
    }
    // 躯干
    g.fillStyle(0x6a7484, 1);
    mpoly(g, [[x - 28 * f, by + 8], [x + 26 * f, by + 8], [x + 22 * f, by - 12], [x - 24 * f, by - 12]], 0x6a7484, 1);
    g.fillStyle(c, 1);
    mpoly(g, [[x - 24 * f, by + 5], [x + 22 * f, by + 5], [x + 18 * f, by - 10], [x - 20 * f, by - 10]], c, 1);
    g.fillStyle(0x8a94a2, 0.6);
    for (let k = 0; k < 5; k++) g.fillCircle(x + (-18 + k * 9) * f, by - 6, 2);
    // 长尾
    const tw = Math.sin(now / 420) * 6;
    g.lineStyle(6, c, 1);
    g.beginPath(); g.moveTo(x - 26 * f, by - 8); g.lineTo(x - 38 * f, by - 16 + tw); g.lineTo(x - 46 * f, by - 26 + tw * 1.5); g.strokePath();
    g.fillStyle(a, 0.9); g.fillCircle(x - 46 * f, by - 26 + tw * 1.5, 3.4);
    // 头 + 尖耳
    const hx = x + 28 * f, hy = by - 14;
    g.fillStyle(c, 1); g.fillEllipse(hx, hy, 20, 13);
    g.fillTriangle(hx - 7, hy - 5, hx - 2, hy - 5, hx - 6, hy - 16);
    g.fillTriangle(hx + 2, hy - 5, hx + 7, hy - 5, hx + 6, hy - 16);
    g.fillStyle(0x3a4048, 1); g.fillTriangle(hx - 2, hy + 2, hx + 4, hy + 4, hx + 1, hy + 8);
    const gl = 0.6 + 0.4 * Math.sin(now / 300);
    g.fillStyle(0xff3a4a, gl); g.fillCircle(hx + 5 * f, hy - 2, 1.8);
    // 月牙鞍
    g.fillStyle(0xffd45c, 1); g.fillRoundedRect(x - 6, by - 18, 16, 8, 3);
    g.fillStyle(0x8a94a2, 1); g.fillCircle(x + 2, by - 16, 3.4);
    g.fillStyle(0xffd45c, 0.95); g.fillCircle(x + 2, by - 16, 5); g.fillStyle(c, 1); g.fillCircle(x + 4, by - 17, 4);
  } },
  zombMount: { c: 0x3a4a5a, a: 0xd93a3a, draw: (g, now, x, y, f, c, a) => {
    // 报废警车：车身报废、车门凹陷、警灯忽明忽暗、车窗裂、轮胎爆
    const by = y - 18;
    g.fillStyle(0x2a2a30, 1);
    mpoly(g, [[x - 46 * f, by + 6], [x + 46 * f, by + 6], [x + 42 * f, by - 6], [x - 42 * f, by - 6]], 0x2a2a30, 1);
    // 车身
    g.fillStyle(c, 1);
    mpoly(g, [[x - 40 * f, by - 4], [x + 40 * f, by - 4], [x + 34 * f, by - 14], [x - 34 * f, by - 14]], c, 1);
    // 车顶 + 裂窗
    g.fillStyle(0x2f3f52, 1);
    mpoly(g, [[x - 20 * f, by - 14], [x + 22 * f, by - 14], [x + 16 * f, by - 26], [x - 14 * f, by - 26]], 0x2f3f52, 1);
    g.fillStyle(0x14202e, 0.9);
    mpoly(g, [[x - 14 * f, by - 15], [x + 16 * f, by - 15], [x + 11 * f, by - 24], [x - 9 * f, by - 24]], 0x14202e, 0.9);
    g.lineStyle(1, 0x9fd8ff, 0.5);
    g.lineBetween(x - 2 * f, by - 15, x + 2 * f, by - 24);
    // 警灯（忽明忽暗）
    const on = Math.sin(now / 200) > 0;
    g.fillStyle(on ? 0xff3a4a : 0x3a1a1e, 0.95); g.fillRoundedRect(x - 8, by - 30, 7, 4, 2);
    g.fillStyle(on ? 0x2a1a3a : 0x3a5aff, on ? 0.4 : 0.95); g.fillRoundedRect(x + 1, by - 30, 7, 4, 2);
    // 弹孔 + 凹痕
    g.fillStyle(0x14141a, 1);
    for (const [dx, dy] of [[-20, -8], [18, -6], [-6, -2]] as Array<[number, number]>) g.fillCircle(x + dx * f, by + dy, 1.8);
    g.fillStyle(0x8a1a1a, 0.5); g.fillEllipse(x + 24 * f, by - 2, 8, 4);
    // 车轮
    const roll = now / 200;
    for (const wx of [-28, 28]) {
      g.fillStyle(0x141418, 1); g.fillCircle(x + wx * f, y - 6, 8);
      g.fillStyle(0x3a3a42, 1); g.fillCircle(x + wx * f, y - 6, 4.4);
      g.lineStyle(1.4, 0x141418, 0.9);
      for (let k = 0; k < 3; k++) { const ang = roll + (k / 3) * Math.PI * 2; g.lineBetween(x + wx * f, y - 6, x + wx * f + Math.cos(ang) * 4.4, y - 6 + Math.sin(ang) * 4.4); }
    }
    g.fillStyle(0x000000, 0.15); g.fillEllipse(x, y + 2, 76, 10);
    void a;
  } },
  toilMount: { c: 0xf0f6f8, a: 0x8fd8ff, draw: (g, now, x, y, f, c, a) => {
    // 马桶飞车：一台装在小车底盘上的抽水马桶，冲水打转、水箱冒泡
    const by = y - 20;
    // 底盘
    g.fillStyle(0x3a3a42, 1);
    mpoly(g, [[x - 30 * f, by + 6], [x + 30 * f, by + 6], [x + 26 * f, by - 2], [x - 26 * f, by - 2]], 0x3a3a42, 1);
    // 车轮
    const roll = now / 180;
    for (const wx of [-20, 20]) {
      g.fillStyle(0x141418, 1); g.fillCircle(x + wx * f, y - 7, 9);
      g.fillStyle(c, 1); g.fillCircle(x + wx * f, y - 7, 5);
      g.lineStyle(1.6, 0x141418, 0.9);
      for (let k = 0; k < 4; k++) { const ang = roll + (k / 4) * Math.PI * 2; g.lineBetween(x + wx * f, y - 7, x + wx * f + Math.cos(ang) * 5, y - 7 + Math.sin(ang) * 5); }
    }
    // 马桶底座 + 坐圈
    g.fillStyle(c, 1);
    mpoly(g, [[x - 14 * f, by - 2], [x + 20 * f, by - 2], [x + 16 * f, by - 16], [x - 10 * f, by - 16]], c, 1);
    g.fillStyle(0xd8e0e4, 1); g.fillEllipse(x + 3 * f, by - 15, 26, 9);
    g.fillStyle(0xffffff, 1); g.fillEllipse(x + 3 * f, by - 15, 20, 6);
    g.fillStyle(0x2a3a44, 1); g.fillEllipse(x + 3 * f, by - 15, 12, 3.4);
    // 冲水漩涡
    const rot = now / 300;
    g.lineStyle(1.6, a, 0.7);
    g.save(); g.translateCanvas(x + 3 * f, by - 15); g.scaleCanvas(1, 0.32);
    g.beginPath(); g.arc(0, 0, 7, rot, rot + Math.PI * 1.4); g.strokePath(); g.restore();
    // 水箱
    g.fillStyle(c, 1); g.fillRoundedRect(x - 14 * f - (f > 0 ? 0 : 8), by - 30, 16, 16, 3);
    g.fillStyle(0xd8e0e4, 1); g.fillRoundedRect(x - 14 * f - (f > 0 ? 0 : 8), by - 30, 16, 5, 2);
    g.fillStyle(0x8a94a2, 1); g.fillRect(x + (f > 0 ? -2 : 2), by - 22, 4, 2); // 冲水扳手
    // 溅水
    for (let k = 0; k < 4; k++) { const ph = ((now / 700 + k / 4) % 1); g.fillStyle(a, 0.7 * (1 - ph)); g.fillCircle(x + (6 + k * 4) * f, by - 18 - ph * 12, 1.6 * (1 - ph) + 0.5); }
    g.fillStyle(0x000000, 0.15); g.fillEllipse(x, y + 2, 64, 9);
  } },
};
