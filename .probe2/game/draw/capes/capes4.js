import { cpoly, cline, TAU } from './shared.js';
/** 第四批主题披风（衙门 / 风暴 / 月宫 / 维京 / 猎游 / 剧院 / 北境 / 威尼斯 / 奥林匹斯 / 桑巴） */
export const CAPES_4 = {
    pagodCloak: { c: 0x4a9a7a, a: 0xd9b45c, draw: (g, now, sway, c, a) => {
            // 金鳞斗篷：玉青袍 + 金鳞排
            cpoly(g, [[-24, 0], [24, 0], [28 + sway, 80], [-28 + sway, 80]], c, 0.95);
            for (let r = 0; r < 4; r++)
                for (let k = 0; k < 5 - r; k++) {
                    g.fillStyle(a, 0.85);
                    g.beginPath();
                    g.arc(-14 + k * 12 + (r % 2) * 5, 16 + r * 15, 4.4, Math.PI, TAU, true);
                    g.closePath();
                    g.fillPath();
                }
        } },
    stormCloak: { c: 0x3a4a6a, a: 0x7ae0ff, draw: (g, now, sway, c, a) => {
            // 雷暴斗篷：乌云袍 + 云隙闪电
            cpoly(g, [[-24, 0], [24, 0], [30 + sway, 80], [-30 + sway, 80]], c, 0.96);
            g.lineStyle(2, a, 0.7 + 0.3 * Math.sin(now / 90));
            cline(g, [[-6, 18], [2, 32], [-4, 46], [4, 62]], 2, a, 0.85);
            for (let k = 0; k < 4; k++) {
                g.fillStyle(0x5a6a8a, 0.8);
                g.fillCircle(-14 + k * 9, 10, 5); // 云团
            }
        } },
    lunarCloak: { c: 0xe8e8f8, a: 0xd9b45c, draw: (g, now, sway, c, a) => {
            // 桂香斗篷：月白纱袍 + 桂枝缀金
            cpoly(g, [[-22, 0], [22, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.85);
            cline(g, [[-10, 8], [-2, 40], [6, 70]], 2, 0x6a4a2a, 0.8);
            for (let k = 0; k < 5; k++) {
                g.fillStyle(a, 0.9);
                g.fillCircle(-8 + k * 4 + sway * 0.3, 18 + k * 12, 2);
            }
        } },
    vikingCloak: { c: 0x8a6a4a, a: 0xc0392b, draw: (g, now, sway, c, a) => {
            // 战旗斗篷：粗呢披风 + 红十字旗徽
            cpoly(g, [[-26, 0], [26, 0], [24 + sway, 74], [-24 + sway, 74]], c, 0.96);
            g.fillStyle(a, 0.9);
            g.fillRect(-4, 14, 8, 44);
            g.fillRect(-16, 30, 32, 8);
            g.fillStyle(0xa89878, 0.6);
            g.fillRect(-24, 0, 48, 4); // 毛边
        } },
    safariCloak: { c: 0xc8b070, a: 0x8a6a3a, draw: (g, now, sway, c, a) => {
            // 猎装斗篷：卡其帆布 + 口袋与皮带
            cpoly(g, [[-24, 0], [24, 0], [22 + sway, 72], [-22 + sway, 72]], c, 0.96);
            g.fillStyle(a, 0.85);
            g.fillRect(-18, 26, 12, 14);
            g.fillRect(6, 26, 12, 14); // 口袋
            g.fillStyle(0x6a4a2a, 0.95);
            g.fillRect(-22, 18, 44, 5); // 皮带
            g.fillStyle(0xd9b45c, 0.9);
            g.fillRect(-3, 17, 6, 7); // 扣
        } },
    theatCloak: { c: 0x8a2020, a: 0xffd45c, draw: (g, now, sway, c, a) => {
            // 谢幕斗篷：深红天鹅绒 + 金绣滚边
            cpoly(g, [[-24, 0], [24, 0], [30 + sway, 80], [-30 + sway, 80]], c, 0.97);
            cline(g, [[-24, 0], [-30 + sway, 80]], 3, a);
            cline(g, [[24, 0], [30 + sway, 80]], 3, a);
            for (let k = 0; k < 4; k++) {
                g.fillStyle(a, 0.8 + 0.2 * Math.sin(now / 400 + k));
                g.fillCircle(-10 + k * 7, 20 + k * 14, 2);
            }
        } },
    boreaCloak: { c: 0x2a5a8a, a: 0x5affd8, draw: (g, now, sway, c, a) => {
            // 极光斗篷：深蓝袍 + 帷幕极光
            cpoly(g, [[-24, 0], [24, 0], [28 + sway, 80], [-28 + sway, 80]], c, 0.95);
            for (let k = 0; k < 3; k++) {
                cpoly(g, Array.from({ length: 7 }, (_, s) => {
                    const u = s / 6;
                    return [-18 + u * 36 + Math.sin(u * 4 + now / 400 + k) * 4 + sway * 0.3, 14 + u * 56];
                }).concat(Array.from({ length: 7 }, (_, s) => {
                    const u = 1 - s / 6;
                    return [-18 + u * 36 + Math.sin(u * 4 + now / 400 + k) * 4 + sway * 0.3, 26 + u * 50];
                })), k === 0 ? a : k === 1 ? 0xb8a8ff : 0x9ad4ff, 0.45);
            }
        } },
    venicCloak: { c: 0x8a2020, a: 0xffd45c, draw: (g, now, sway, c, a) => {
            // 面具斗篷：红金威尼斯披风
            cpoly(g, [[-24, 0], [24, 0], [28 + sway, 80], [-28 + sway, 80]], c, 0.95);
            cline(g, [[0, 0], [0 + sway * 0.8, 76]], 2.4, a, 0.9);
            for (let k = 0; k < 3; k++) {
                g.fillStyle(a, 0.9);
                g.fillCircle(-8 + k * 8 + sway * 0.4, 22 + k * 18, 3); // 金扣
            }
        } },
    olympCloak: { c: 0xf8f8f8, a: 0xffd45c, draw: (g, now, sway, c, a) => {
            // 神谕斗篷：白托加 + 金色桂叶别针
            cpoly(g, [[-24, 0], [24, 0], [26 + sway, 76], [-26 + sway, 76]], c, 0.96);
            cline(g, [[-24, 0], [-26 + sway, 76]], 2, a, 0.5); // 托加褶
            g.fillStyle(a, 1);
            g.fillCircle(-14, 10, 4);
            g.fillCircle(-8, 14, 3);
            g.fillCircle(-16, 16, 3); // 桂叶别针
        } },
    sambaCloak: { c: 0x3aa05a, a: 0xffd45c, draw: (g, now, sway, c, a) => {
            // 羽袍斗篷：绿袍 + 一排羽饰
            cpoly(g, [[-24, 0], [24, 0], [28 + sway, 80], [-28 + sway, 80]], c, 0.92);
            for (let r = 0; r < 3; r++)
                for (let k = 0; k < 6; k++) {
                    const px = -18 + k * 7.2 + (r % 2) * 3.6;
                    g.fillStyle([a, 0x4ac8ff, 0xe83a5a, 0xffffff][(r + k) % 4], 0.9);
                    g.fillEllipse(px + sway * 0.3, 16 + r * 18, 4.4, 9);
                }
        } },
    // ==== 第四批主题的 2★ 披风（逐件按名字独立画） ====
    pagodCape: { c: 0x6a2a20, a: 0xffd45c, draw: (g, now, sway, c, a) => {
            // 战袍披风：绛色战袍 + 背后金纹补子 + 束袖缘
            cpoly(g, [[-24, 0], [24, 0], [26 + sway, 78], [-26 + sway, 78]], c, 0.96);
            g.fillStyle(a, 0.9);
            g.fillRoundedRect(-9 + sway * 0.2, 22, 18, 22, 3);
            g.fillStyle(c, 0.9);
            g.fillTriangle(0 + sway * 0.2, 26, 6 + sway * 0.2, 38, -6 + sway * 0.2, 38);
            cline(g, [[-24, 10], [24, 10]], 2, a, 0.8);
        } },
    stormCape: { c: 0xbfe8ff, a: 0x3d4c5c, draw: (g, now, sway, c, a) => {
            // 风幕披风：被吹起的风幕 + 一道道风弧
            cpoly(g, [[-22, 0], [22, 0], [34 + sway, 70], [-24 + sway, 78]], c, 0.8);
            for (let k = 0; k < 3; k++) {
                g.lineStyle(2, a, 0.4 + 0.25 * Math.sin(now / 350 + k));
                g.beginPath();
                g.arc(-4 + (k % 2) * 10 + sway * 0.3, 22 + k * 16, 7, Math.PI * 0.15, Math.PI * 1.5);
                g.strokePath();
            }
        } },
    lunarCape: { c: 0xe8f0ff, a: 0xd8e8ff, draw: (g, now, sway, c, a) => {
            // 月白披风：月白纱 + 桂枝影 + 月晕圆
            cpoly(g, [[-24, 0], [24, 0], [28 + sway, 78], [-28 + sway, 78]], c, 0.85);
            g.fillStyle(0xffffff, 0.7);
            g.fillCircle(0 + sway * 0.2, 30, 8);
            g.fillStyle(0xc8d8e8, 0.5);
            g.fillCircle(3 + sway * 0.2, 28, 2.4);
            g.fillStyle(a, 0.6);
            for (let k = 0; k < 3; k++)
                g.fillEllipse(-12 + k * 12 + sway * 0.3, 52 + (k % 2) * 8, 8, 4);
        } },
    vikingCape: { c: 0x6a5240, a: 0x8fb4de, draw: (g, now, sway, c, a) => {
            // 粗布披风：粗织披风 + 粗缝线 + 一枚铁搭扣
            cpoly(g, [[-23, 0], [23, 0], [25 + sway, 74], [-25 + sway, 74]], c, 0.96);
            for (let k = 0; k < 3; k++) {
                cline(g, [[-18, 20 + k * 16], [18, 24 + k * 16]], 2, a, 0.5);
            }
            g.fillStyle(0x8a9aa8, 0.95);
            g.fillCircle(0, 10, 4);
            g.fillRect(-1.4, 4, 2.8, 6);
        } },
    safariCape: { c: 0xd8c8a0, a: 0x8a6a3a, draw: (g, now, sway, c, a) => {
            // 帆布披风：帆布 + 两只翻盖口袋 + 扣带
            cpoly(g, [[-23, 0], [23, 0], [26 + sway, 76], [-26 + sway, 76]], c, 0.96);
            g.fillStyle(a, 0.85);
            g.fillRoundedRect(-16 + sway * 0.2, 24, 11, 13, 2);
            g.fillRoundedRect(5 + sway * 0.3, 24, 11, 13, 2);
            cline(g, [[-10, 12], [10, 12]], 2.6, a, 0.8);
        } },
    theatCape: { c: 0xa82a4a, a: 0x2a1a2e, draw: (g, now, sway, c, a) => {
            // 天鹅绒披风：绛紫天鹅绒 + 金穗下摆 + 一圈领光
            cpoly(g, [[-24, 0], [24, 0], [27 + sway, 78], [-27 + sway, 78]], c, 0.97);
            for (let k = 0; k < 6; k++) {
                cline(g, [[-20 + k * 8 + sway * 0.4, 70], [-20 + k * 8 + sway * 0.6, 82]], 1.6, 0xffd45c, 0.85);
            }
            g.lineStyle(2.4, 0xffd45c, 0.8);
            g.strokeEllipse(0, 4, 20, 6);
        } },
    boreaCape: { c: 0x8a705a, a: 0x7dffc4, draw: (g, now, sway, c, a) => {
            // 兽裘披风：裘皮 + 毛领 + 底缘毛簇 + 一点极光
            cpoly(g, [[-24, 0], [24, 0], [27 + sway, 76], [-27 + sway, 76]], c, 0.96);
            g.fillStyle(0xd8c8a0, 0.9);
            g.fillEllipse(0, 2, 44, 9); // 毛领
            for (let k = 0; k < 6; k++) {
                g.fillStyle(0xd8c8a0, 0.8);
                g.fillCircle(-20 + k * 8 + sway * 0.4, 74, 3.2);
            }
            g.fillStyle(a, 0.3 + 0.15 * Math.sin(now / 400));
            g.fillEllipse(0 + sway * 0.3, 40, 30, 20);
        } },
    venicCape: { c: 0x2a5a8a, a: 0xe8404a, draw: (g, now, sway, c, a) => {
            // 船夫披肩：水手蓝披肩 + 白条纹 + 红领结
            cpoly(g, [[-22, 0], [22, 0], [24 + sway, 70], [-24 + sway, 70]], c, 0.96);
            for (let k = 0; k < 4; k++)
                g.fillRect(-22, 14 + k * 13, 44, 3);
            g.fillStyle(a, 0.95);
            g.fillTriangle(-5, 4, 5, 4, 0, 12);
        } },
    olympCape: { c: 0xf0ead8, a: 0x4a5a78, draw: (g, now, sway, c, a) => {
            // 托加披风：米白托加 + 希腊回纹滚边
            cpoly(g, [[-24, 0], [24, 0], [28 + sway, 78], [-28 + sway, 78]], c, 0.97);
            cline(g, [[-24, 8], [24, 8]], 3, a, 0.85);
            for (let k = 0; k < 5; k++) {
                g.lineStyle(1.6, a, 0.8);
                g.beginPath();
                g.arc(-16 + k * 8 + sway * 0.2, 14, 3, Math.PI, Math.PI * 2);
                g.strokePath();
            }
            g.fillStyle(0xffd45c, 0.9);
            g.fillCircle(0, 28, 3.4); // 金别针
        } },
    sambaCape: { c: 0xffd45c, a: 0x2a9a5a, draw: (g, now, sway, c, a) => {
            // 流苏披风：金底 + 彩片 + 两束绿流苏
            cpoly(g, [[-22, 0], [22, 0], [27 + sway, 74], [-27 + sway, 74]], c, 0.96);
            for (let k = 0; k < 8; k++) {
                g.fillStyle([a, 0xe8404a, 0x4ac8ff, 0xffffff][k % 4], 0.9);
                g.fillCircle(-16 + (k % 4) * 10 + (k % 2) * 4, 16 + k * 8, 2.6);
            }
            for (let k = 0; k < 4; k++) {
                cline(g, [[-18 + k * 4 + sway * 0.5, 62], [-20 + k * 4 + sway * 0.7, 76 + (k % 2) * 4]], 2, a, 0.9);
                cline(g, [[14 + k * 3 + sway * 0.5, 62], [16 + k * 3 + sway * 0.7, 76]], 2, a, 0.9);
            }
        } },
};
