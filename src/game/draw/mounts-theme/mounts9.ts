import { TAU, mpoly, type MountArt } from './shared';

/** 批七主题坐骑（赛博都市 / 东海龙宫 / 时空旅行）。(x, y) = 地面基准，f = 朝向。 */
export const MOUNTS_9: Record<string, MountArt> = {
  cybMount: { c: 0xff3bd4, a: 0x39ffd0, draw: (g, now, x, y, f, c, a) => {
    // 悬浮机车：赛博悬浮摩托——流线车身 + 座舱 + 双悬浮盘 + 霓虹光带
    const hover = Math.sin(now / 340) * 2.4;
    const by = y - 14 + hover;
    g.fillStyle(0x0a0e18, 0.2);
    g.fillEllipse(x, y + 1, 62, 8);
    g.fillStyle(0x39424e, 1); // 车身
    mpoly(g, [
      [x - f * 36, by + 2], [x - f * 24, by - 6], [x - f * 2, by - 10], [x + f * 24, by - 6],
      [x + f * 34, by], [x + f * 22, by + 6], [x - f * 24, by + 7],
    ], 0x39424e, 1);
    g.fillStyle(c, 0.9); // 车侧霓虹条
    g.fillRect(x - f * 30, by - 1, f * 56, 2.4);
    g.fillStyle(0x22303e, 1); // 座舱
    g.fillEllipse(x - f * 4, by - 11, 20, 10);
    g.fillStyle(a, 0.5 + 0.2 * Math.sin(now / 300));
    g.fillEllipse(x - f * 4, by - 12, 13, 5.4);
    // 车头大灯（锥形夜灯）
    g.fillStyle(0xfff6d8, 0.85);
    g.fillCircle(x + f * 33, by - 2, 2.4);
    g.fillStyle(0xfff6d8, 0.12);
    mpoly(g, [[x + f * 34, by - 3], [x + f * 58, by - 9], [x + f * 58, by + 4], [x + f * 34, by - 1]], 0xfff6d8, 0.1);
    // 双悬浮盘（底面发光盘）
    for (const s of [-1, 1]) {
      const px = x + s * 16;
      g.fillStyle(0x22303e, 1);
      g.fillEllipse(px, by + 9, 16, 5);
      const gl = 0.5 + 0.4 * Math.sin(now / 180 + s);
      g.fillStyle(s > 0 ? a : c, gl);
      g.fillEllipse(px, by + 10.4, 10, 2.6);
    }
    // 车尾速度光（拉长的双色尾迹）
    for (let k = 0; k < 2; k++) {
      const ph = (now / 240 + k / 2) % 1;
      g.fillStyle(k ? a : c, 0.5 * (1 - ph));
      g.fillRect(x - f * (36 + ph * 16), by + 1 - k * 2, f * 10, 2 - k * 0.6);
    }
  } },
  dgMount: { c: 0xff8a5c, a: 0x7fd4ff, draw: (g, now, x, y, f, c, a) => {
    // 锦鲤坐骑：驮人的大锦鲤——鱼身 + 大尾摆 + 背鳍鞍 + 水波游动
    const swim = Math.sin(now / 420) * 3;
    const by = y - 20 + swim * 0.4;
    g.fillStyle(0x0a0e18, 0.18);
    g.fillEllipse(x, y + 1, 54, 8);
    // 水波（鱼下游动波纹）
    for (let k = 0; k < 2; k++) {
      const ph = (now / 1000 + k / 2) % 1;
      g.lineStyle(1.4, a, 0.4 * (1 - ph));
      g.strokeEllipse(x, y + 1, 44 + ph * 20, 9 + ph * 3);
    }
    // 大尾摆（左右摆的剪刀尾）
    const tail = Math.sin(now / 260) * 8;
    g.fillStyle(0xe86a3a, 0.95);
    mpoly(g, [
      [x - f * 18, by], [x - f * 34, by - 10 + tail], [x - f * 30, by + tail * 0.4], [x - f * 34, by + 10 + tail], [x - f * 18, by + 4],
    ], 0xe86a3a, 0.95);
    g.fillStyle(0xffb070, 0.7);
    mpoly(g, [
      [x - f * 20, by], [x - f * 32, by - 7 + tail], [x - f * 30, by + 6 + tail],
    ], 0xffb070, 0.6);
    // 鱼身（橙白锦鲤纹）
    g.fillStyle(c, 1);
    g.fillEllipse(x + f * 2, by, 36, 20);
    g.fillStyle(0xfff0e0, 0.9); // 白斑
    g.fillEllipse(x + f * 8, by - 4, 12, 8);
    g.fillEllipse(x - f * 6, by + 3, 9, 6);
    g.fillStyle(0xe86a3a, 0.8); // 鳞纹
    for (let k = 0; k < 3; k++) g.lineBetween(x - f * 8 + k * f * 8, by - 8, x - f * 10 + k * f * 8, by + 8);
    // 头（圆钝鱼头 + 圆眼 + 张嘴须）
    const hx = x + f * 22;
    g.fillStyle(c, 1);
    g.fillEllipse(hx, by - 2, 16, 14);
    g.fillStyle(0x1a0e08, 1);
    g.fillCircle(hx + f * 4, by - 4, 1.6);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(hx + f * 4.4, by - 4.4, 0.6);
    g.lineStyle(1.2, 0xd9b45c, 0.9); // 龙须两根
    g.lineBetween(hx + f * 7, by + 2, hx + f * 12, by + 5 + Math.sin(now / 250) * 2);
    g.lineBetween(hx + f * 6, by + 4, hx + f * 10, by + 8 + Math.sin(now / 250 + 1) * 2);
    // 背鳍鞍（骑乘位 + 金鞍）
    g.fillStyle(0xe86a3a, 0.95);
    g.fillEllipse(x + f * 2, by - 10, 16, 7);
    g.fillStyle(0xffd45c, 0.95);
    g.fillEllipse(x + f * 2, by - 11, 10, 4);
    // 侧鳍（划水）
    for (const s of [-1, 1]) {
      g.fillStyle(0xffb070, 0.9);
      g.fillTriangle(x + f * (4 + s * 2), by + 6, x + f * (10 + s * 2), by + 12 + Math.sin(now / 300 + s) * 2, x + f * (2 + s * 2), by + 10);
    }
  } },
  chronoMount: { c: 0x9b5cff, a: 0xffd45c, draw: (g, now, x, y, f, c, a) => {
    // 时光机车：蒸汽朋克时光机——铜锅炉车 + 大小双轮 + 烟囱时之烟 + 电弧
    const roll = now / 100;
    const shake = Math.sin(now / 90) * 0.8;
    const by = y - 14 + shake;
    g.fillStyle(0x0a0e18, 0.2);
    g.fillEllipse(x, y + 1, 58, 8);
    // 大小双轮（辐条转动）
    for (const [wx, wr] of [[x - f * 16, 11], [x + f * 16, 8]] as Array<[number, number]>) {
      g.fillStyle(0x39424e, 1);
      g.fillCircle(wx, y - wr, wr);
      g.fillStyle(0x22303e, 0.9);
      g.fillCircle(wx, y - wr, wr - 3);
      g.lineStyle(1.2, 0x8a94a2, 0.9);
      for (let k = 0; k < 6; k++) {
        const ang = roll + (k / 6) * TAU;
        g.lineBetween(wx, y - wr, wx + Math.cos(ang) * (wr - 2), y - wr + Math.sin(ang) * (wr - 2));
      }
      g.lineStyle(2, 0xb8943a, 0.9);
      g.strokeCircle(wx, y - wr, wr);
    }
    // 铜锅炉身
    g.fillStyle(c, 1);
    g.fillRoundedRect(x - f * 24, by - 8, f * 44, 16, 6);
    g.fillStyle(0xb8943a, 0.7);
    g.fillRect(x - f * 24, by - 8, f * 44, 4);
    g.fillStyle(0xd9b45c, 0.9); // 铆钉排
    for (let k = 0; k < 5; k++) g.fillCircle(x - f * 20 + k * f * 9, by - 2, 1.1);
    // 驾驶座 + 风镜把手
    g.fillStyle(0x39424e, 1);
    g.fillRoundedRect(x - f * 10, by - 16, f * 12, 9, 3);
    g.fillStyle(a, 0.8);
    g.fillRect(x - f * 9, by - 15, f * 10, 1.6);
    // 烟囱 + 时之烟（烟圈里带齿轮/星）
    const stx = x + f * 20;
    g.fillStyle(0x39424e, 1);
    g.fillRect(stx - 3.4, by - 22, 6.8, 15);
    g.fillStyle(0xb8943a, 0.9);
    g.fillRect(stx - 4.6, by - 24, 9.2, 3);
    for (let k = 0; k < 3; k++) {
      const ph = (now / 1200 + k / 3) % 1;
      const py = by - 26 - ph * 30;
      g.fillStyle(0xd8d0c0, 0.3 * (1 - ph));
      g.fillCircle(stx + Math.sin(ph * 4 + k) * 5, py, 3 + ph * 5);
      if (ph < 0.6) {
        g.fillStyle(0xffd45c, 0.7 * (1 - ph));
        g.fillRect(stx + Math.sin(ph * 4 + k) * 5 - 1.4, py - 1.4, 2.8, 2.8);
      }
    }
    // 车头时锥（穿透时间的锥形光）
    g.fillStyle(a, 0.14);
    mpoly(g, [[x + f * 22, by - 2], [x + f * 52, by - 10], [x + f * 52, by + 6], [x + f * 22, by + 2]], a, 0.13);
    // 车身电弧
    for (let k = 0; k < 2; k++) {
      const px = x - f * 8 + k * f * 14;
      g.lineStyle(1.2, a, 0.7);
      g.lineBetween(px, by - 8, px + Math.sin(now / 40 + k) * 4, by - 13);
    }
  } },
};
