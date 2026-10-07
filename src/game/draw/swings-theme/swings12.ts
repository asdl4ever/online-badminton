import type { SwingArt } from './shared';
import {
  cometBand, beads, drips, ghostEcho, sawTeeth, shards, cracks, embers, sparks,
  glowHalo, tipOf, impact,
} from './vocab';

/** 批十一挥拍拖尾（软泥秘境 / 妖猫夜行 / 甲虫王朝）*/

export const SWINGS_12: Record<string, SwingArt> = {
  // 果冻重压：一整团Q弹果冻压过去，内部游泡、落地溅黏、尾部拖着黏液
  slimeSwing: { a: 0xd0ff9a, draw: (g, now, hot, k, c, a) => {
    glowHalo(g, k, c, 0.18);
    cometBand(g, k, c, 0.75, 1.35); // 胖乎乎的果冻团
    cometBand(g, k, 0xffffff, 0.5, 0.5); // 内部高光
    beads(g, k, now, 0xffffff, 0.55, 2.2, 2, 3.5); // 晃动的气泡
    drips(g, k, now, c, a, 0.8, 4); // 滴落黏液
    const t = tipOf(k);
    // 拍地：Q弹的扁平冲击 + 溅起黏液
    g.fillStyle(c, 0.45 * (0.6 + hot * 0.4));
    g.save();
    g.translateCanvas(t.x, t.y + 6);
    g.scaleCanvas(1, 0.42);
    g.beginPath();
    g.arc(0, 0, 16 + hot * 10, 0, Math.PI * 2);
    g.fillPath();
    g.restore();
    impact(g, t.x, t.y, now, hot, a, c);
  } },

  // 三尾连击：三重错位爪影 + 三道撕裂爪痕 + 尾尖妖火
  nekSwing: { a: 0xffd45c, draw: (g, now, hot, k, _c, a) => {
    glowHalo(g, k, 0xb08aff, 0.16);
    ghostEcho(g, k, 0x8a6aff, 0.7, 3, 7); // 三重残影
    sawTeeth(g, k, 0xd0b0ff, 0.9, 8, 2); // 沿弧的爪痕锯齿
    for (let i = 1; i < k.n - 1; i += 2) { // 三道并排的爪风
      const p = k.pts[i];
      g.lineStyle(1.4, 0xffffff, k.pts[i].a * 0.6);
      for (const off of [-5, 0, 5]) {
        g.lineBetween(p.x + off, p.y - 6, p.x + off + 2, p.y + 6);
      }
    }
    sparks(g, k, now, a, 0.85, 7, 18); // 妖火
    const t = tipOf(k);
    impact(g, t.x, t.y, now, hot, 0xffd45c, 0xb08aff);
  } },

  // 角突冲撞：甲齿犁地 + 金甲碎屑 + 梨沟裂纹 + 甲光
  btlSwing: { a: 0xc8a832, draw: (g, now, hot, k, _c, a) => {
    glowHalo(g, k, 0xc8a832, 0.16);
    cometBand(g, k, 0x3a5a2a, 0.85, 1.05); // 甲壳冲撞主体
    cometBand(g, k, a, 0.6, 0.5); // 金甲亮面
    sawTeeth(g, k, 0xd8d4c8, 0.95, 9, 2); // 甲齿
    shards(g, k, now, 0xc8a832, 0.8, 6, 9, 1.4); // 崩飞的甲片
    embers(g, k, now, 0xffd45c, 0x3a2a10, 0.75, 6);
    // 轨迹下缘的犁沟
    for (let i = 2; i < k.n - 1; i += 3) {
      cracks(g, k.pts[i].x, k.pts[i].y + 9, now, 0x2a1c0a, 0.55, 3, 11);
    }
    const t = tipOf(k);
    impact(g, t.x, t.y, now, hot, a, 0x3a5a2a);
  } },
};
