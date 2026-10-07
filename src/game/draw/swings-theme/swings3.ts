import type { SwingArt } from './shared';
import { bladeWedge, plates, sawTeeth, bolts, shards, sparks, impact, glowHalo, tipOf, ripples } from './vocab';

/** 批二挥拍拖尾（上古神话 / 重装机甲）——各款独立剪影 + 专属材质与动效 */

export const SWINGS_3: Record<string, SwingArt> = {
  // 造化斩：玉色玄刃劈过，刃上悬着旋转的卦纹玉牌，收斩处炸开灵光
  shnSwing: { a: 0xffd45c, draw: (g, now, hot, k, c, a) => {
    glowHalo(g, k, 0x9fe8c0, 0.14);
    bladeWedge(g, k, 0x2f6a5a, 0x9fe8c0, 0.95); // 玉背 + 青玉刃
    bladeWedge(g, k, c, 0xfff4d0, 0.55); // 金纹叠刃
    plates(g, k, now, a, 0.9, 5, 5.4); // 悬转的卦纹玉牌
    sparks(g, k, now, 0xd0ffe0, 0.8, 7, 18);
    const t = tipOf(k);
    ripples(g, t.x, t.y, now, a, 0.55 + hot * 0.3, 3, 26 + hot * 10, 120);
    impact(g, t.x, t.y, now, hot, 0x9fe8c0, a);
  } },

  // 机甲斩：装甲刃切开，齿口崩出钢板碎块，电流沿刃乱窜
  mcaSwing: { a: 0xff8a2a, draw: (g, now, hot, k, _c, a) => {
    glowHalo(g, k, 0x5ac8ff, 0.16);
    bladeWedge(g, k, 0x2a3a4a, 0x8a94a2, 0.95); // 冷钢刃
    sawTeeth(g, k, 0x9aa4b2, 0.9, 7, 2); // 齿口
    bolts(g, k, now, a, 0xffffff, 0.85, 4); // 电弧
    shards(g, k, now, 0x8a8a92, 0.85, 6, 9, 1.4); // 崩飞的装甲碎片
    plates(g, k, now, 0x32465c, 0.7, 4, 4.6);
    const t = tipOf(k);
    impact(g, t.x, t.y, now, hot, 0xffd45c, 0x8a94a2);
  } },
};
