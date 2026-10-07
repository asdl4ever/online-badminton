import { bladeWedge, cometBand, coilBand, sparks, impact, glowHalo, tipOf, ripples } from './vocab.js';
/** 批四挥拍拖尾（西游降魔 / 三国烽火）*/
export const SWINGS_5 = {
    // 金箍棒横扫：金色棒影 + 如意云纹缠绕 + 一路金星
    xySwing: { a: 0xffd45c, draw: (g, now, hot, k, _c, a) => {
            glowHalo(g, k, 0xffe08a, 0.16);
            cometBand(g, k, 0xd8a02a, 0.8, 0.95); // 棒影
            cometBand(g, k, 0xfff0b0, 0.85, 0.4); // 白热棒芯
            coilBand(g, k, 0xffe89a, 0.6, 4, 1.6); // 云纹（正缠）
            coilBand(g, k, 0xff8a3c, 0.45, -4, 1.6); // 云纹（反缠）
            sparks(g, k, now, 0xffe08a, 0.9, 8, 20);
            const t = tipOf(k);
            ripples(g, t.x, t.y, now, a, 0.5 + hot * 0.3, 2, 26, 130);
        } },
    // 青龙偃月刀：青钢刃背卧龙脊，刃口起龙须，刀风带鳞光
    sgmSwing: { a: 0xc8d8e0, draw: (g, now, hot, k, _c, _a) => {
            glowHalo(g, k, 0x8ad4b0, 0.14);
            bladeWedge(g, k, 0x1a3a3a, 0x8ae8c0, 0.95); // 青钢背 + 亮刃
            for (let i = 1; i < k.n - 1; i += 2) { // 刀背龙脊鳞
                const p = k.pts[i];
                g.fillStyle(0x2a6a4a, k.pts[i].a * 0.9);
                g.fillCircle(p.x, p.y - k.pts[i].w * 0.42, 1.6 + k.pts[i].w * 0.14);
            }
            for (let i = 1; i < k.n - 1; i++) { // 刃口龙须
                const p = k.pts[i];
                const flap = Math.sin(now / 240 + i * 1.2) * 3;
                g.lineStyle(1.2, 0xd0ffe0, k.pts[i].a * 0.7);
                g.lineBetween(p.x, p.y, p.x - 6, p.y + 4 + flap);
            }
            sparks(g, k, now, 0xdfffe8, 0.7, 5, 14);
            const t = tipOf(k);
            impact(g, t.x, t.y, now, hot, 0x8ae8c0, 0x2a6a4a);
        } },
};
