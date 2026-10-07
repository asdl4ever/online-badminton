import { bladeWedge, cometBand, sawTeeth, embers, drips, sparks, impact, glowHalo, tipOf, ripples, starRow } from './vocab.js';
/** 批三挥拍拖尾（光之巨人 / 怪兽之王）*/
export const SWINGS_4 = {
    // 光之刃：银白彗尾拖出三重光波，沿途星点，收斩处一轮光印
    otmSwing: { a: 0xff5a6a, draw: (g, now, hot, k, _c, a) => {
            glowHalo(g, k, 0xbfe8ff, 0.2);
            cometBand(g, k, 0xbfe8ff, 0.7, 1.15); // 银白光刃主体
            cometBand(g, k, 0xffffff, 0.9, 0.45); // 白热芯
            starRow(g, k, now, 0xffffff, a, 0.85, 5, 2.4);
            sparks(g, k, now, 0xdff4ff, 0.8, 6, 20);
            const t = tipOf(k);
            ripples(g, t.x, t.y, now, 0xffffff, 0.6 + hot * 0.3, 3, 30 + hot * 12, 100);
            g.fillStyle(a, 0.7 + hot * 0.3); // 胸口计时器那点红
            g.fillCircle(t.x, t.y, 3);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(t.x - 0.8, t.y - 0.8, 1.2);
        } },
    // 原子尾锤：暗绿刃背燃着原子火舌，沿途留下灼热余烬与熔渣
    kjuSwing: { a: 0x9cff3a, draw: (g, now, hot, k, _c, a) => {
            glowHalo(g, k, 0x5aff8a, 0.16);
            bladeWedge(g, k, 0x2a3a20, 0x5a7a4a, 0.95); // 兽甲背 + 暗绿刃
            cometBand(g, k, a, 0.5, 0.55); // 原子绿芯
            sawTeeth(g, k, 0x1a2810, 0.95, 9, 2); // 沿背的脊鳍锯齿
            embers(g, k, now, 0xff8a2a, 0x4a3a2a, 0.9, 8);
            drips(g, k, now, 0xff6a2a, 0xffd45c, 0.8, 3); // 滴落熔渣
            const t = tipOf(k);
            impact(g, t.x, t.y, now, hot, 0x9cff3a, 0xff6a2a);
        } },
};
