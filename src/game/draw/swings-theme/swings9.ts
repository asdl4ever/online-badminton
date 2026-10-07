import type { SwingArt } from './shared';
import {
  cometBand, coilBand, feathers, petals, scales, flameTongues, starRow, ripples, sparks, embers,
  glowHalo, tipOf, impact,
} from './vocab';

/** 批八挥拍拖尾（敦煌飞天 / 羽蛇神殿 / 圣辉天界）*/

export const SWINGS_9: Record<string, SwingArt> = {
  // 飞天绫：两条飘带反向缠绕 + 一路花瓣与金粉
  dunSwing: { a: 0xffd45c, draw: (g, now, hot, k, c, a) => {
    glowHalo(g, k, 0xffb0d8, 0.12);
    coilBand(g, k, c, 0.8, 3, 2.2); // 主飘带
    coilBand(g, k, 0x9fe8ff, 0.55, -3, 2); // 副飘带
    cometBand(g, k, 0xffe89a, 0.5, 0.4); // 金线
    petals(g, k, now, 0xffb0d8, 0.7, 7, 4.4);
    sparks(g, k, now, 0xffe08a, 0.85, 8, 20);
    const t = tipOf(k);
    ripples(g, t.x, t.y, now, a, 0.45 + hot * 0.3, 2, 24, 120);
  } },

  // 羽刃：一排展开的羽片 + 蛇鳞背 + 吐息火舌
  aztSwing: { a: 0x7dff5a, draw: (g, now, hot, k, _c, a) => {
    glowHalo(g, k, 0x3a9a6a, 0.14);
    scales(g, k, 0x2a6a4a, 0.9, 3.6, 2); // 蛇鳞背
    feathers(g, k, now, 0x4ac88a, 0.85, 8, 11); // 展开的羽片
    feathers(g, k, now, 0xd0ffe0, 0.5, 5, 7);
    flameTongues(g, k, now, 0xff8a3c, 0xffe89a, 0.75, 5); // 吐息
    embers(g, k, now, 0xffd45c, 0x4a3a2a, 0.7, 5);
    const t = tipOf(k);
    impact(g, t.x, t.y, now, hot, a, 0x2a6a4a);
  } },

  // 圣光裁决：纯白彗光 + 两翼圣羽 + 环形圣印
  angSwing: { a: 0xfff0b0, draw: (g, now, hot, k, c, a) => {
    glowHalo(g, k, 0xfff6d8, 0.2);
    cometBand(g, k, 0xf0e8d0, 0.6, 1.2);
    cometBand(g, k, 0xffffff, 0.95, 0.5);
    feathers(g, k, now, 0xfff4d0, 0.6, 7, 10);
    starRow(g, k, now, 0xfff0b0, 0xffffff, 0.9, 5, 2.6);
    const t = tipOf(k);
    ripples(g, t.x, t.y, now, 0xfff0b0, 0.6 + hot * 0.3, 3, 32 + hot * 12, 95);
    ripples(g, t.x, t.y, now + 200, c, 0.35, 2, 40, 130);
    impact(g, t.x, t.y, now, hot, 0xffffff, a);
  } },
};
