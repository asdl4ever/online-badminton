import { wpoly, wline, TAU } from './shared.js';
/** 第二批主题翅膀（海盗 / 蒸汽 / 太空 / 侏罗纪 / 蘑菇 / 热带 / 墓地 / 节日 / 寿司 / 西部） */
export const WINGS_2 = {
    pirateWingA: { c: 0xe8e0cc, a: 0x6a4a2a, draw: (g, now, flap, c, a) => {
            // 破帆之翼：一块撕烂的帆布
            const f = flap * 5;
            wpoly(g, [[2, 4], [40, -46 - f], [78, -30 - f], [66, -8], [50, -16], [34, 0], [16, -8]], c, 0.95);
            wline(g, [[2, 4], [40, -46 - f], [78, -30 - f]], 2.4, a);
            g.lineStyle(1.4, a, 0.6);
            for (let k = 0; k < 3; k++)
                wline(g, [[8 + k * 6, 0], [30 + k * 16, -34 - f * 0.6]], 1.4, a, 0.5); // 帆骨
            g.fillStyle(0x2a2a2a, 0.25);
            g.fillCircle(56, -20 - f * 0.5, 5); // 破洞
        } },
    pirateWingB: { c: 0x2a6a4a, a: 0x8a4a9a, draw: (g, now, flap, c, a) => {
            // 海怪之翼：几条触手张开成翼
            const t = now / 400;
            for (let k = 0; k < 4; k++) {
                const ang = -2.2 + k * 0.34;
                wline(g, Array.from({ length: 8 }, (_, s) => {
                    const u = s / 7;
                    const len = u * (52 + k * 8);
                    return [6 + Math.cos(ang) * len, 2 + Math.sin(ang) * len + Math.sin(u * 5 + t + k) * 3];
                }), 5 - k * 0.6, k % 2 ? c : 0x3a8a5a, 0.95);
                g.fillStyle(a, 0.8);
                g.fillCircle(6 + Math.cos(ang) * 56, 2 + Math.sin(ang) * 56, 2);
            }
        } },
    steamWingA: { c: 0xb08a4a, a: 0x9aa7b8, draw: (g, now, flap, c, a) => {
            // 黄铜之翼：机械羽毛，一节节黄铜板
            const f = flap * 5;
            for (let k = 0; k < 5; k++) {
                const ang = -2.05 + k * 0.28;
                g.save();
                g.translateCanvas(4, 2);
                g.rotateCanvas(ang + Math.PI / 2 + f * 0.02);
                g.fillStyle(k % 2 ? c : 0xd9b45c, 0.95);
                g.fillRect(-4, -10 - k * 9, 8, 30);
                g.fillStyle(a, 0.7);
                g.fillRect(-4, -10 - k * 9, 8, 3);
                g.fillStyle(0x6a7482, 0.9);
                g.fillCircle(0, 14, 3); // 铆钉
                g.restore();
            }
        } },
    steamWingB: { c: 0xc9573a, a: 0xdfe6f0, draw: (g, now, flap, c, a) => {
            // 气囊之翼：三只小飞艇气囊吊着升空
            const f = flap * 8;
            for (let k = 0; k < 3; k++) {
                const px = 20 + k * 22, py = -20 - k * 16 - f * (0.5 + k * 0.2);
                g.fillStyle(k % 2 ? c : 0xb06a2a, 0.95);
                g.fillEllipse(px, py, 15, 10);
                g.fillStyle(a, 0.7);
                g.fillEllipse(px - 2, py - 2, 6, 3);
                g.fillStyle(0x6a4a2a, 0.9);
                g.fillRect(px - 3, py + 5, 6, 4); // 吊舱
                wline(g, [[px - 2, py + 5], [px - 4, py + 12]], 1, 0x6a4a2a, 0.7);
            }
        } },
    astroWingA: { c: 0x2a3a6a, a: 0x5ac8ff, draw: (g, now, flap, c, a) => {
            // 太阳能翼：深蓝板 + 蓝色电池格
            const f = flap * 4;
            g.save();
            g.translateCanvas(4, 0);
            g.rotateCanvas(-0.55 + f * 0.02);
            g.fillStyle(c, 1);
            g.fillRect(0, -14, 72, 30);
            g.fillStyle(0x1a2a4a, 0.9);
            for (let r = 0; r < 2; r++)
                for (let k = 0; k < 6; k++) {
                    g.fillRect(3 + k * 11.4, -11 + r * 13, 9, 11);
                }
            g.lineStyle(1.4, a, 0.6 + 0.3 * Math.sin(now / 300));
            g.strokeRect(0, -14, 72, 30);
            g.fillStyle(a, 0.9);
            g.fillRect(-4, -6, 5, 14); // 支架
            g.restore();
        } },
    astroWingB: { c: 0xff8a3a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
            // 流星之翼：三颗拖尾的流星
            for (let k = 0; k < 3; k++) {
                const ph = (now / 900 + k / 3) % 1;
                const hx = 14 + k * 22, hy = -20 - k * 16;
                const tl = 30 + k * 8;
                g.fillStyle(k % 2 ? a : c, 0.85 * (1 - ph * 0.4));
                g.fillCircle(hx, hy, 4.5 - k);
                wpoly(g, [[hx, hy - 3], [hx - tl, hy - 9 - tl * 0.3], [hx - tl * 0.6, hy]], k % 2 ? c : a, 0.5 * (1 - ph * 0.5));
            }
        } },
    juraWingA: { c: 0x5a7a3a, a: 0x8aa84a, draw: (g, now, flap, c, a) => {
            // 蕨叶之翼：一根蕨茎 + 两侧小叶
            const f = flap * 6;
            wline(g, [[4, 2], [30, -26 - f], [62, -44 - f]], 3, 0x4a6a2a);
            for (let k = 0; k < 6; k++) {
                const u = (k + 1) / 7;
                const px = 4 + u * 56, py = 2 - u * 44 - f * u;
                const lw = 13 - k * 1.4;
                g.fillStyle(k % 2 ? c : a, 0.95);
                wpoly(g, [[px, py], [px + lw, py - lw * 0.4], [px + lw * 0.7, py + 2]], k % 2 ? c : a, 0.95);
                wpoly(g, [[px, py], [px + lw * 0.8, py + lw * 0.3], [px + lw * 0.5, py + 4]], 0x4a6a2a, 0.8);
            }
        } },
    juraWingB: { c: 0x8a6a4a, a: 0xd8cba8, draw: (g, now, flap, c, a) => {
            // 翼龙之翼：皮膜 + 指骨尖端
            const f = flap * 7;
            wpoly(g, [[2, 6], [44, -50 - f], [82, -26 - f], [58, 4], [30, -6]], c, 0.9);
            wline(g, [[2, 6], [44, -50 - f]], 3, a); // 翼指骨
            wline(g, [[44, -50 - f], [82, -26 - f]], 2.4, a);
            g.fillStyle(a, 0.9);
            g.fillCircle(44, -50 - f, 3); // 指节
            for (let k = 0; k < 3; k++)
                wline(g, [[8 + k * 14, -2 - k * 12], [26 + k * 14, -34 - f * 0.7]], 1.4, a, 0.4); // 膜纹
        } },
    mushWingA: { c: 0xd95a4a, a: 0xf0e0c0, draw: (g, now, flap, c, a) => {
            // 孢子之翼：菌褶状的翼 + 飘孢子
            const f = flap * 5;
            wpoly(g, [[2, 4], [44, -46 - f], [78, -24 - f], [46, 6]], c, 0.92);
            g.lineStyle(1.6, 0xf0e0c0, 0.7);
            for (let k = 0; k < 4; k++)
                wline(g, [[8, 0], [20 + k * 15, -32 - f * 0.6]], 1.6, a, 0.55); // 菌褶
            for (let k = 0; k < 5; k++) {
                const ph = (now / 1000 + k / 5) % 1;
                g.fillStyle(0xf0e0c0, 0.8 * (1 - ph));
                g.fillCircle(20 + k * 12, -30 - f * 0.5 + ph * 34, 2 * (1 - ph) + 0.5); // 孢子
            }
        } },
    mushWingB: { c: 0xc9572a, a: 0xd88a2a, draw: (g, now, flap, c, a) => {
            // 落叶之翼：一片片翻飞的落叶
            for (let k = 0; k < 6; k++) {
                const ph = (now / 1400 + k / 6) % 1;
                const px = 12 + (k % 3) * 24, py = -14 - k * 11;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(Math.sin(now / 600 + k) * 0.5 - 0.4);
                g.fillStyle(k % 2 ? c : a, 0.9 * Math.sin(ph * Math.PI) + 0.2);
                wpoly(g, [[0, 0], [9, -3], [17, 0], [9, 3]], k % 2 ? c : a, 0.9);
                g.restore();
            }
            wline(g, [[2, 4], [30, -34 - flap * 5]], 2.2, 0x8a5a2a, 0.8);
        } },
    tropicWingA: { c: 0x3ac8c8, a: 0xff9a6a, draw: (g, now, flap, c, a) => {
            // 鱼鳍之翼：一片扇形鱼鳍 + 鳍条
            const f = flap * 6;
            wpoly(g, [[2, 6], [40, -52 - f], [76, -30 - f], [50, 4]], c, 0.85);
            g.lineStyle(1.6, a, 0.8);
            for (let k = 0; k < 5; k++) {
                const ang = -2.1 + k * 0.26;
                g.lineBetween(4, 4, 4 + Math.cos(ang) * 62, 4 + Math.sin(ang) * 62); // 鳍条
            }
            g.fillStyle(a, 0.85);
            g.fillCircle(2, 6, 4);
        } },
    tropicWingB: { c: 0xc86ad9, a: 0x9effd0, draw: (g, now, flap, c, a) => {
            // 水母之翼：半透明伞盖 + 飘带触须
            const f = flap * 7;
            g.fillStyle(c, 0.4);
            g.fillEllipse(36, -34 - f, 70, 34);
            g.fillStyle(c, 0.7);
            g.fillEllipse(36, -38 - f, 56, 24);
            for (let k = 0; k < 5; k++) {
                wline(g, Array.from({ length: 7 }, (_, s) => {
                    const u = s / 6;
                    return [14 + k * 11, -26 - f + u * (20 + k * 5) + Math.sin(u * 4 + now / 300 + k) * 3];
                }), 2, a, 0.75);
            }
        } },
    cryptWingA: { c: 0x3a3a44, a: 0x6a4a9a, draw: (g, now, flap, c, a) => {
            // 蝙蝠之翼：三段指骨撑起的黑膜
            const f = flap * 8;
            wpoly(g, [[2, 4], [30, -36 - f], [40, -8], [58, -30 - f * 0.8], [64, 0], [80, -18 - f * 0.5], [56, 8]], c, 0.95);
            g.lineStyle(2, 0x6a6a78, 0.9);
            g.lineBetween(2, 4, 30, -36 - f);
            g.lineBetween(30, -36 - f, 40, -8);
            g.lineBetween(40, -8, 58, -30 - f * 0.8);
            g.lineBetween(58, -30 - f * 0.8, 64, 0);
            wline(g, [[2, 4], [80, -18 - f * 0.5]], 1.6, a, 0.6);
        } },
    cryptWingB: { c: 0x8a8a94, a: 0x5a6a7a, draw: (g, now, flap, c, a) => {
            // 石像鬼之翼：石雕翼，棱面感
            const f = flap * 4;
            wpoly(g, [[2, 6], [38, -48 - f], [76, -28 - f], [50, 6]], c, 0.95);
            wpoly(g, [[2, 6], [38, -48 - f], [52, -22]], 0xa8a8b4, 0.9);
            wpoly(g, [[52, -22], [76, -28 - f], [50, 6]], 0x6a6a74, 0.9);
            g.lineStyle(1.6, a, 0.8);
            g.lineBetween(2, 6, 38, -48 - f);
            g.lineBetween(38, -48 - f, 76, -28 - f);
        } },
    festivWingA: { c: 0xdfeefc, a: 0x5ac8ff, draw: (g, now, flap, c, a) => {
            // 雪花之翼：六角雪花晶体排成翼
            const f = flap * 5;
            for (let k = 0; k < 4; k++) {
                const px = 18 + k * 18, py = -16 - k * 12 - f * 0.5;
                const r = 13 - k * 1.6;
                g.lineStyle(2, k % 2 ? a : c, 0.9);
                for (let s = 0; s < 6; s++) {
                    const ang = (s / 6) * TAU + now / 1600;
                    g.lineBetween(px, py, px + Math.cos(ang) * r, py + Math.sin(ang) * r);
                    g.lineBetween(px + Math.cos(ang) * r * 0.6, py + Math.sin(ang) * r * 0.6, px + Math.cos(ang + 0.5) * r * 0.6, py + Math.sin(ang + 0.5) * r * 0.6);
                }
            }
        } },
    festivWingB: { c: 0x3aa05a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
            // 铃铛之翼：绿松枝架上挂着金铃
            const f = flap * 5;
            wline(g, [[2, 4], [34, -40 - f], [74, -26 - f]], 4, c);
            g.fillStyle(a, 0.9);
            g.fillCircle(24, -24 - f, 3);
            g.fillCircle(46, -34 - f, 3);
            g.fillCircle(64, -26 - f, 3); // 冬青果
            for (let k = 0; k < 3; k++) {
                const px = 22 + k * 20, py = -12 - k * 7 - f * 0.3;
                wline(g, [[px, py - 8], [px, py - 3]], 1.2, a, 0.7);
                g.fillStyle(a, 1);
                g.beginPath();
                g.arc(px, py, 6 - k, Math.PI, TAU);
                g.closePath();
                g.fillPath();
                g.fillStyle(0xa08030, 1);
                g.fillCircle(px, py + 1.4, 1.8);
            }
        } },
    sushiWingA: { c: 0xff8a5a, a: 0xffffff, draw: (g, now, flap, c, a) => {
            // 鲷鱼之翼：一片巨大的鱼尾鳍
            const f = flap * 7;
            wpoly(g, [[2, 8], [40, -52 - f], [72, -36 - f], [58, -10], [78, -6], [50, 10]], c, 0.95);
            g.lineStyle(1.6, 0xffffff, 0.6);
            for (let k = 0; k < 4; k++)
                wline(g, [[6, 4], [26 + k * 14, -30 - f * 0.6]], 1.6, 0xffffff, 0.5); // 鳍条
            g.fillStyle(a, 0.85);
            g.fillCircle(8, 4, 4); // 尾柄
        } },
    sushiWingB: { c: 0xc03a3a, a: 0xf5f0e0, draw: (g, now, flap, c, a) => {
            // 筷箸之翼：几根筷子搭成翼骨，尖端夹一颗饭团
            const f = flap * 5;
            for (let k = 0; k < 4; k++) {
                const ang = -2.0 + k * 0.3;
                g.lineStyle(3, k % 2 ? c : 0x8a4a2a, 0.95);
                g.lineBetween(2, 2, 2 + Math.cos(ang) * 66, 2 + Math.sin(ang) * 66);
            }
            const px = 30, py = -34 - f;
            g.fillStyle(a, 1);
            g.fillCircle(px, py, 6);
            g.fillStyle(0x2a3a2a, 0.9);
            g.fillRect(px - 4, py - 2, 8, 4);
        } },
    wildWingA: { c: 0x4a3a2e, a: 0x8a6a4a, draw: (g, now, flap, c, a) => {
            // 秃鹫之翼：粗硬的深色羽毛
            const f = flap * 6;
            wpoly(g, [[2, 4], [40, -44 - f], [78, -26 - f], [48, 6]], c, 0.95);
            for (let k = 0; k < 5; k++) {
                const u = k / 5;
                g.fillStyle(k % 2 ? 0x3a2e24 : a, 0.8);
                g.fillRect(6 + u * 56, -6 - u * 26 - f * 0.5, 14, 3.4);
            }
            wline(g, [[2, 4], [40, -44 - f], [78, -26 - f]], 2.2, 0x2a2018, 0.9);
        } },
    wildWingB: { c: 0xb08a4a, a: 0x8a5a2a, draw: (g, now, flap, c, a) => {
            // 风滚草之翼：一团会滚的枯草
            const t = now / 700;
            for (let k = 0; k < 3; k++) {
                const cx = 22 + k * 20, cy = -20 - k * 12;
                g.lineStyle(2, k % 2 ? c : a, 0.9);
                g.beginPath();
                for (let s = 0; s <= 14; s++) {
                    const u = s / 14;
                    const ang = u * TAU + t * (k % 2 ? 1 : -1);
                    const r = 12 - k * 2 + Math.sin(ang * 3 + k) * 2.4;
                    const px = cx + Math.cos(ang) * r, py = cy + Math.sin(ang) * r;
                    if (s === 0)
                        g.moveTo(px, py);
                    else
                        g.lineTo(px, py);
                }
                g.closePath();
                g.strokePath();
            }
        } },
};
