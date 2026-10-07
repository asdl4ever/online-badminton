import type { SwingArt } from './shared';
import {
  plates, shards, bolts, prismSplit, cometBand, cracks, puffs, drips, ripples, embers, hairLine,
  webNet, sawTeeth, glowHalo, tipOf, impact,
} from './vocab';

/** 批十二挥拍拖尾（变形机甲 / 蛛网游侠 / 钢铁巨兽）*/

export const SWINGS_13: Record<string, SwingArt> = {
  // 变形重击：装甲板沿轨迹翻转 + 齿轮碎块崩飞 + 电弧 + 相位分光
  tfSwing: { a: 0x5ac8ff, draw: (g, now, hot, k, _c, a) => {
    glowHalo(g, k, a, 0.16);
    prismSplit(g, k, 0.4, 3); // 相位分光（红蓝绿错位）
    plates(g, k, now, 0x2a3a4a, 0.95, 7, 7.4); // 沿轨迹翻转的装甲板
    plates(g, k, now, 0x32465c, 0.7, 5, 4.6);
    shards(g, k, now, 0x8a94a2, 0.9, 7, 11, 1.6); // 齿轮/装甲碎块
    bolts(g, k, now, a, 0xffffff, 0.8, 4);
    const t = tipOf(k);
    impact(g, t.x, t.y, now, hot, 0xff8a2a, a);
  } },

  // 蛛网猛击：拳风细线 + 冲击点张开的蛛网 + 蛛感波纹
  spdSwing: { a: 0xff4a5a, draw: (g, now, hot, k, _c, a) => {
    glowHalo(g, k, 0xff4a5a, 0.14);
    hairLine(g, k, 0xf0f4f8, 0.8, 0.1); // 拳风细线
    // 沿拳风拉出的蛛丝（会飘）
    for (let i = 1; i < k.n - 1; i += 2) {
      const p = k.pts[i];
      const wob = Math.sin(now / 300 + i) * 4;
      g.lineStyle(1, 0xffffff, k.pts[i].a * 0.5);
      g.lineBetween(p.x, p.y, p.x + 9, p.y + wob);
    }
    const t = tipOf(k);
    webNet(g, t.x, t.y, now, 0xf0f4f8, 0.85, 20 + hot * 12, 8); // 冲击点张开的网
    ripples(g, t.x, t.y, now, a, 0.5 + hot * 0.35, 3, 26 + hot * 12, 100); // 蛛感波纹
    impact(g, t.x, t.y, now, hot, 0xffffff, a);
  } },

  // 巨兽践踏：砸出地面放射裂缝 + 三重冲击波 + 熔铁滴落 + 黑烟
  bstSwing: { a: 0xff6a2a, draw: (g, now, hot, k, _c, a) => {
    glowHalo(g, k, 0x4a4a52, 0.14);
    cometBand(g, k, 0x3a3a42, 0.9, 1.25); // 沉重的铁背
    cometBand(g, k, a, 0.55, 0.5); // 熔炉亮面
    sawTeeth(g, k, 0xd8d4c8, 0.9, 8, 2); // 钢牙
    puffs(g, k, now, 0x2a2a30, 0.85, 9, 14); // 黑烟
    for (let i = 2; i < k.n - 1; i += 3) { // 沿轨迹的碎裂地面
      cracks(g, k.pts[i].x, k.pts[i].y + 10, now, 0x14141a, 0.6, 4, 13);
    }
    drips(g, k, now, a, 0xffd45c, 0.85, 4); // 滴落熔铁
    embers(g, k, now, a, 0x4a3a2a, 0.8, 7);
    const t = tipOf(k);
    impact(g, t.x, t.y, now, hot, 0xffd45c, 0x4a4a52);
  } },
};
