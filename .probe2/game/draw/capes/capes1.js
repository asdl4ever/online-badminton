import { cpoly, cline } from './shared.js';
/** 第一批主题披风（3★：按名字独立画） */
export const CAPES_1 = {
    desOasis: { c: 0x3a9a6a, a: 0xf0d8a0, draw: (g, now, sway, c, a) => {
            // 绿洲纱帐：青绿纱帐 + 沙色垂穗
            cpoly(g, [[-22, 0], [22, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.75);
            cpoly(g, [[-14, 6], [14, 6], [18 + sway * 0.8, 70], [-18 + sway * 0.8, 70]], 0x8ac8a8, 0.5);
            for (let k = 0; k < 5; k++) {
                const px = -18 + k * 9;
                g.fillStyle(a, 0.9);
                g.fillRect(px - 1.2, 74, 2.4, 8 + Math.sin(now / 400 + k) * 2);
            }
        } },
    nimbSail: { c: 0xffffff, a: 0x6fb7ff, draw: (g, now, sway, c, a) => {
            // 云帆披风：一面鼓起来的小白帆
            const bulge = Math.sin(now / 600) * 4;
            cpoly(g, [[-20, 0], [20, 0], [30 + sway + bulge, 40], [10 + sway, 76], [-18 + sway, 74]], c, 0.95);
            cline(g, [[-12, 4], [16 + sway, 70]], 1.6, a, 0.6);
            cline(g, [[0, 2], [24 + sway, 46]], 1.6, a, 0.6);
            g.fillStyle(a, 0.7);
            g.fillCircle(6, 20, 3); // 帆徽
        } },
    confRibbonCape: { c: 0xff869c, a: 0x9effd0, draw: (g, now, sway, c, a) => {
            // 缎带披风：几条缎带编成的披风
            const t = now / 320;
            for (let k = 0; k < 5; k++) {
                const col = [c, a, 0xffd45c, 0xffffff, c][k];
                cline(g, Array.from({ length: 8 }, (_, s) => {
                    const u = s / 7;
                    return [-16 + k * 8 + Math.sin(u * 3 + t + k) * 3, u * 76];
                }), 4.4, col, 0.92);
            }
        } },
    bigtCurtain: { c: 0xa02838, a: 0xffd45c, draw: (g, now, sway, c, a) => {
            // 帷幕披风：剧院帷幕的垂褶
            for (let k = 0; k < 4; k++) {
                const px = -20 + k * 12;
                cpoly(g, [[px, 0], [px + 14, 0], [px + 10 + sway * 0.6, 78], [px - 2 + sway * 0.6, 78]], k % 2 ? 0xb83244 : c, 0.95);
            }
            g.fillStyle(a, 0.9);
            g.fillRect(-22, 0, 44, 4); // 金色帷幔头
        } },
    aegisRoyal: { c: 0x8a2020, a: 0xd9b45c, draw: (g, now, sway, c, a) => {
            // 王袍披风：红袍 + 金纹滚边
            cpoly(g, [[-24, 0], [24, 0], [28 + sway, 80], [-28 + sway, 80]], c, 0.92);
            cline(g, [[-24, 0], [-28 + sway, 80]], 2.4, a);
            cline(g, [[24, 0], [28 + sway, 80]], 2.4, a);
            for (let k = 0; k < 3; k++) {
                g.fillStyle(a, 0.9);
                g.fillRect(-6, 16 + k * 22, 12, 3);
                g.fillRect(-1.6, 12 + k * 22, 3.2, 11);
            }
        } },
    chanInkCape: { c: 0xf5f0e4, a: 0x2a2a30, draw: (g, now, sway, c, a) => {
            // 水墨披风：白袍上晕开一道浓墨
            cpoly(g, [[-22, 0], [22, 0], [24 + sway, 78], [-24 + sway, 78]], c, 0.95);
            cpoly(g, [[-10 + sway * 0.3, 18], [8 + sway * 0.3, 24], [18 + sway * 0.5, 66], [-2 + sway * 0.5, 74]], a, 0.85);
            g.fillStyle(a, 0.3);
            g.fillCircle(12 + sway * 0.4, 40, 8); // 淡墨晕
        } },
    arcanMantle: { c: 0x4a2a8a, a: 0xb46cff, draw: (g, now, sway, c, a) => {
            // 星辉披风：深紫袍 + 星星缀满
            cpoly(g, [[-22, 0], [22, 0], [30 + sway, 80], [-30 + sway, 80]], c, 0.92);
            for (let k = 0; k < 8; k++) {
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k * 1.7));
                const px = -18 + (k % 4) * 12, py = 14 + Math.floor(k / 4) * 26;
                g.fillStyle(k % 2 ? a : 0xffe89a, tw);
                g.fillRect(px - 2, py - 0.7, 4, 1.4);
                g.fillRect(px - 0.7, py - 2, 1.4, 4);
            }
            cline(g, [[-22, 0], [-30 + sway, 80]], 1.8, a, 0.7);
            cline(g, [[22, 0], [30 + sway, 80]], 1.8, a, 0.7);
        } },
    relicDustCape: { c: 0xb8a880, a: 0xd8c8a0, draw: (g, now, sway, c, a) => {
            // 尘土披风：粗麻披风 + 一路掉沙
            cpoly(g, [[-22, 0], [22, 0], [26 + sway, 74], [-26 + sway, 74]], c, 0.95);
            cline(g, [[-22, 12], [22, 12]], 2, a, 0.5); // 补丁线
            for (let k = 0; k < 5; k++) {
                const ph = (now / 800 + k / 5) % 1;
                g.fillStyle(a, 0.7 * (1 - ph));
                g.fillCircle(-16 + k * 8 + sway * 0.5, 70 + ph * 12, 1.8 * (1 - ph) + 0.5);
            }
        } },
    playRibbonCape: { c: 0x4a90d9, a: 0xe8404a, draw: (g, now, sway, c, a) => {
            // 彩带披风：蓝底 + 斜贴的彩条
            cpoly(g, [[-22, 0], [22, 0], [24 + sway, 76], [-24 + sway, 76]], c, 0.95);
            for (let k = 0; k < 3; k++) {
                g.save();
                g.translateCanvas(-14 + k * 13, 8);
                g.rotateCanvas(0.5);
                g.fillStyle([a, 0xffd45c, 0x9effd0][k], 0.9);
                g.fillRect(0, 0, 5, 58);
                g.restore();
            }
        } },
    yuanLanternCape: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, sway, c, a) => {
            // 灯彩披风：红袍 + 垂挂的小灯笼
            cpoly(g, [[-22, 0], [22, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.92);
            cline(g, [[-22, 8], [22, 8]], 2, a, 0.8);
            for (let k = 0; k < 3; k++) {
                const px = -12 + k * 12;
                const py = 30 + k * 14 + Math.sin(now / 500 + k) * 2;
                g.fillStyle(a, 0.95);
                g.fillEllipse(px + sway * 0.4, py, 9, 11);
                g.fillStyle(0xffe89a, 0.7);
                g.fillEllipse(px + sway * 0.4, py, 4, 6);
            }
        } },
    // ==== 第一批主题的 2★ 披风（逐件按名字独立画） ====
    desCloak: { c: 0xc9803a, a: 0xe0b56a, draw: (g, now, sway, c, a) => {
            // 旅人斗篷：沙色粗斗篷 + 风帽尖 + 一行驼队脚印缝线
            cpoly(g, [[-22, 0], [22, 0], [25 + sway, 76], [-25 + sway, 76]], c, 0.95);
            cpoly(g, [[0, -6], [9, 2], [-9, 2]], c, 0.95); // 风帽尖
            cline(g, [[-16, 14], [16, 14]], 1.6, a, 0.8);
            for (let k = 0; k < 4; k++)
                g.fillCircle(-12 + k * 8 + (k % 2) * 3, 26 + k * 13 + sway * 0.3, 1.8);
            cline(g, [[-20 + sway * 0.8, 66], [20 + sway * 0.8, 66]], 2.2, a, 0.7);
        } },
    nimbVeil: { c: 0xdcefff, a: 0xffffff, draw: (g, now, sway, c, a) => {
            // 云纱披风：半透云纱两层 + 卷云纹
            cpoly(g, [[-24, 0], [24, 0], [30 + sway, 78], [-30 + sway, 78]], c, 0.55);
            cpoly(g, [[-16, 4], [16, 4], [22 + sway * 0.7, 62], [-22 + sway * 0.7, 62]], 0xffffff, 0.4);
            for (let k = 0; k < 3; k++) {
                g.lineStyle(2, 0xffffff, 0.7);
                g.beginPath();
                const yy = 20 + k * 20;
                g.arc(-8 + (k % 2) * 12 + sway * 0.4, yy, 5, Math.PI * 0.1, Math.PI * 1.6);
                g.strokePath();
            }
        } },
    confApron: { c: 0xffd0e0, a: 0xe86a8a, draw: (g, now, sway, c, a) => {
            // 围裙披风：围裙形 + 胸前口袋 + 系带蝴蝶结
            cpoly(g, [[-14, 0], [14, 0], [22 + sway, 78], [-22 + sway, 78]], c, 0.96);
            cline(g, [[-14, 2], [-4, -4]], 2.4, a, 0.9);
            cline(g, [[14, 2], [4, -4]], 2.4, a, 0.9);
            g.fillStyle(a, 0.9);
            g.fillRoundedRect(-8 + sway * 0.2, 16, 16, 12, 3); // 口袋
            g.fillCircle(0, -5, 2.6);
        } },
    bigtCape: { c: 0xc0392b, a: 0xffd45c, draw: (g, now, sway, c, a) => {
            // 马戏披风：大红披风 + 金滚边 + 双排波点
            cpoly(g, [[-23, 0], [23, 0], [28 + sway, 78], [-28 + sway, 78]], c, 0.97);
            cline(g, [[-23, 0], [-28 + sway, 78]], 2.6, a, 0.9);
            cline(g, [[23, 0], [28 + sway, 78]], 2.6, a, 0.9);
            for (let k = 0; k < 6; k++)
                g.fillCircle((k % 2 ? -10 : 10), 18 + k * 10, 2.4);
        } },
    aegisBanner: { c: 0x8fb4de, a: 0xffffff, draw: (g, now, sway, c, a) => {
            // 旗帜披风：一面展开的战旗 + 白十字徽 + 旗杆滚边
            cpoly(g, [[-20, 0], [24, 0], [22 + sway, 74], [-16 + sway, 78]], c, 0.96);
            g.fillStyle(a, 0.95);
            g.fillRect(-2 + sway * 0.3, 16, 5, 30);
            g.fillRect(-10 + sway * 0.3, 27, 21, 5);
            cline(g, [[24, 0], [22 + sway, 74]], 2.4, 0x4a5a78, 0.9);
        } },
    chanRobe: { c: 0x2f7a4a, a: 0xd8c8a0, draw: (g, now, sway, c, a) => {
            // 茶袍披风：茶绿宽袍 + 交领 + 飘起的一缕茶烟纹
            cpoly(g, [[-24, 0], [24, 0], [26 + sway, 80], [-26 + sway, 80]], c, 0.95);
            cline(g, [[0, 2], [-9 + sway * 0.2, 34]], 2.4, a, 0.9); // 交领
            cline(g, [[-24, 44], [24, 44]], 1.8, a, 0.7);
            g.lineStyle(1.8, a, 0.55);
            g.beginPath();
            for (let s = 0; s <= 5; s++) {
                const py = 52 - s * 8;
                const px = 10 + Math.sin(s * 1.6 + now / 500) * 3 + sway * 0.3;
                if (s === 0)
                    g.moveTo(px, py);
                else
                    g.lineTo(px, py);
            }
            g.strokePath();
        } },
    arcanCloak: { c: 0x5540a0, a: 0xbfe8ff, draw: (g, now, sway, c, a) => {
            // 法师斗篷：深紫斗篷 + 银符文星纹 + 月牙扣
            cpoly(g, [[-24, 0], [24, 0], [30 + sway, 80], [-30 + sway, 80]], c, 0.96);
            g.fillStyle(a, 0.85);
            for (let k = 0; k < 5; k++) {
                const px = -12 + k * 6 + (k % 2) * 4, py = 16 + k * 12;
                g.fillTriangle(px, py - 3.4, px + 3, py + 2.4, px - 3, py + 2.4);
            }
            g.lineStyle(2, a, 0.9);
            g.arc(0, 6, 4.4, Math.PI * 0.2, Math.PI * 1.6); // 月牙扣
            g.strokePath();
        } },
    relicHide: { c: 0x7a6440, a: 0xd8c8a0, draw: (g, now, sway, c, a) => {
            // 兽皮披风：毛边兽皮 + 两块补皮 + 骨扣
            cpoly(g, [[-24, 0], [24, 0], [27 + sway, 78], [-27 + sway, 78]], c, 0.96);
            for (let k = 0; k < 7; k++) {
                const px = -21 + k * 7;
                g.fillTriangle(px, 0, px + 4, 0, px + 2, -5 - (k % 3) * 2); // 毛边
            }
            g.fillStyle(a, 0.55);
            g.fillRoundedRect(-16 + sway * 0.2, 22, 12, 14, 3);
            g.fillRoundedRect(6 + sway * 0.3, 40, 10, 12, 3);
            g.fillStyle(0xf0ead8, 0.95);
            g.fillCircle(0, 8, 3.4);
            g.fillRect(-1.2, 2, 2.4, 4);
        } },
    playCape: { c: 0x4a90d9, a: 0xffd45c, draw: (g, now, sway, c, a) => {
            // 玩具披风：蓝披风 + 两块积木色块 + 一颗大红纽扣
            cpoly(g, [[-22, 0], [22, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.95);
            g.fillStyle(a, 0.95);
            g.fillRoundedRect(-14 + sway * 0.2, 20, 10, 10, 2);
            g.fillStyle(0xe8404a, 0.95);
            g.fillRoundedRect(4 + sway * 0.3, 36, 10, 10, 2);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(0, 10, 3.6);
        } },
    yuanSilk: { c: 0xffd45c, a: 0xc0392b, draw: (g, now, sway, c, a) => {
            // 绸缎披风：金绸 + 红色宽滚边 + 一枚盘 lantern 结
            cpoly(g, [[-23, 0], [23, 0], [27 + sway, 78], [-27 + sway, 78]], c, 0.96);
            cpoly(g, [[-23, 0], [23, 0], [25 + sway, 14], [-25 + sway, 14]], a, 0.8);
            g.fillStyle(a, 0.95);
            g.fillCircle(0, 22, 4.2);
            g.lineStyle(2.2, a, 0.9);
            g.strokeEllipse(0, 22, 13, 6);
        } },
};
