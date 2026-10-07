import type { SwingArt } from './shared';
import {
  ghostEcho, dashLine, plates, shards, cometBand, coilBand, beads, ripples, drips, prismSplit,
  sparks, glowHalo, tipOf, impact,
} from './vocab';

/** 批七挥拍拖尾（赛博都市 / 东海龙宫 / 时空旅行）*/

export const SWINGS_8: Record<string, SwingArt> = {
  // 数据斩：断裂的相位脉冲 + 六边数据板 + 崩出的缓存碎片
  cybSwing: { a: 0xff2e88, draw: (g, now, hot, k, c, a) => {
    glowHalo(g, k, c, 0.16);
    dashLine(g, k, now, c, 1, 5, 0.24); // 主脉冲（断续）
    dashLine(g, k, now, a, 0.7, 3, 0.12);
    ghostEcho(g, k, 0x5ac8ff, 0.45, 2, 5); // 数据重影
    plates(g, k, now, 0x1a2a3a, 0.85, 6, 5.6); // 六边数据板
    shards(g, k, now, 0x8ae0ff, 0.8, 6, 9, 2); // 崩出的数据碎片
    const t = tipOf(k);
    impact(g, t.x, t.y, now, hot, a, c);
  } },

  // 潮汐斩：水龙缠绕的刃 + 一路水珠与浪环
  dgSwing: { a: 0x8ae8ff, draw: (g, now, hot, k, c, a) => {
    glowHalo(g, k, 0x3a9ac8, 0.16);
    cometBand(g, k, 0x1a4a6a, 0.75, 0.9); // 深水刃body
    coilBand(g, k, c, 0.7, 3, 1.8); // 缠绕的水龙
    coilBand(g, k, 0xffffff, 0.45, -3, 1.2);
    beads(g, k, now, a, 0.8, 2.6, 2, 3); // 串串水珠（会晃）
    drips(g, k, now, 0x8ae8ff, 0xffffff, 0.7, 4); // 滴落水
    const t = tipOf(k);
    ripples(g, t.x, t.y, now, 0xffffff, 0.5 + hot * 0.35, 3, 30 + hot * 12, 110);
    impact(g, t.x, t.y, now, hot, a, 0x1a4a6a);
  } },

  // 时空折叠斩：整条轨迹重复三遍错位（时间残像）+ 分光边缘
  chronoSwing: { a: 0xc8a8ff, draw: (g, now, hot, k, _c, a) => {
    glowHalo(g, k, 0xc8a8ff, 0.18);
    ghostEcho(g, k, 0x8a7aff, 0.75, 4, 9); // 四个时间残像
    prismSplit(g, k, 0.55, 5); // 时空分光
    cometBand(g, k, 0xffffff, 0.85, 0.42); // 当下的那一道
    sparks(g, k, now, 0xd8c8ff, 0.8, 7, 22);
    const t = tipOf(k);
    // 折叠点：一个小漩涡
    for (let s = 0; s < 3; s++) {
      const r = 6 + s * 5;
      g.lineStyle(1.6, s % 2 ? a : 0xffffff, 0.5 - s * 0.1);
      g.save();
      g.translateCanvas(t.x, t.y);
      g.rotateCanvas(now / 300 + s);
      g.beginPath();
      g.arc(0, 0, r, 0, Math.PI * 1.5);
      g.strokePath();
      g.restore();
    }
    impact(g, t.x, t.y, now, hot, 0xffffff, 0x8a7aff);
  } },
};
