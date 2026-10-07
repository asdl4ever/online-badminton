import { wpoly, wline, TAU } from './shared.js';
/**
 * 补遗批：早期主题与大池里最后 20 款独立手绘翅膀。
 * 只画右翼；左翼由入口镜像。构图全部按物品名来。
 */
export const WINGS_6 = {
    flame: { c: 0xff7a2a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
            // 烈焰：三簇向上的火舌组成的火翼，焰尖随扇动摇曳
            const f = flap * 7;
            for (let k = 0; k < 3; k++) {
                const bx = 8 + k * 22, h = 46 - k * 8;
                const sway = Math.sin(now / 220 + k * 1.7) * 5;
                wpoly(g, [[bx - 10 - k, 6], [bx - 4, -h * 0.5 - f], [bx + sway * 0.5, -h - f], [bx + 5 + sway, -h * 0.6 - f], [bx + 12 + k, 4]], k % 2 ? c : 0xff5a1a, 0.95);
                wpoly(g, [[bx - 4, 2], [bx + sway * 0.4, -h * 0.55 - f], [bx + 6, 0]], a, 0.9);
            }
            for (let k = 0; k < 5; k++) {
                const ph = (now / 600 + k / 5) % 1;
                g.fillStyle(a, 0.85 * (1 - ph));
                g.fillCircle(14 + k * 15, -30 - f * 0.6 - ph * 22, 2.2 * (1 - ph) + 0.5);
            }
        } },
    butterfly: { c: 0xff8ad4, a: 0x5a3a8a, draw: (g, _now, flap, c, a) => {
            // 蝶翼：上大下小两片翅室 + 翅脉 + 斑点，缓慢开合
            const f = flap * 9;
            wpoly(g, [[2, 2], [34, -42 - f], [70, -50 - f], [76, -30 - f], [40, -6]], c, 0.92);
            wpoly(g, [[4, 4], [30, 6], [48, 16], [34, 24], [8, 12]], c, 0.8);
            wline(g, [[4, 0], [40, -30 - f], [72, -42 - f]], 1.6, a, 0.7);
            wline(g, [[4, 2], [36, -12], [60, -24 - f * 0.6]], 1.4, a, 0.6);
            wline(g, [[4, 4], [30, 12], [46, 18]], 1.4, a, 0.6);
            g.fillStyle(0xffffff, 0.85);
            g.fillCircle(56, -38 - f, 3);
            g.fillCircle(64, -28 - f, 2.2);
            g.fillStyle(a, 0.9);
            g.fillCircle(30, 12, 2.4);
            g.fillCircle(42, 16, 1.8);
            wline(g, [[2, 0], [80, -34 - f]], 1.8, a, 0.8);
        } },
    mech: { c: 0x9aa7b8, a: 0x5ac8ff, draw: (g, now, flap, c, a) => {
            // 机械翼：分段金属板 + 铆钉 + 发光的能量管
            const f = flap * 5;
            for (let k = 0; k < 4; k++) {
                const px = 6 + k * 17, py = -6 - k * 12 - f * 0.5;
                wpoly(g, [[px, py], [px + 16, py - 3], [px + 15, py + 9], [px + 1, py + 11]], k % 2 ? 0xb8c4d6 : c);
                g.fillStyle(0x6a7686, 0.9);
                g.fillRect(px + 2, py + 7, 12, 2.4);
                g.fillStyle(0xdfe8f5, 0.9);
                g.fillCircle(px + 4, py + 3, 1.4);
                g.fillCircle(px + 11, py + 2, 1.4);
            }
            wline(g, [[4, 6], [26, -10 - f], [56, -30 - f], [80, -44 - f]], 3, a, 0.85);
            const gl = 0.6 + 0.4 * Math.sin(now / 300);
            g.fillStyle(a, gl);
            g.fillCircle(80, -44 - f, 3.4);
            g.fillStyle(a, gl * 0.5);
            g.fillCircle(80, -44 - f, 6.5);
            wline(g, [[2, 8], [12, 2]], 3.4, 0x6a7686); // 液压杆
        } },
    fairy: { c: 0xc9f0ff, a: 0x9ad4ff, draw: (g, now, flap, c, a) => {
            // 精灵翼：两瓣半透明的薄翼 + 光尘
            const f = flap * 8;
            wpoly(g, [[2, 0], [30, -38 - f], [62, -46 - f], [52, -12 - f * 0.5]], c, 0.4);
            wpoly(g, [[2, 2], [26, 4], [40, 20], [18, 20]], c, 0.32);
            wline(g, [[2, 0], [30, -38 - f], [62, -46 - f]], 1.6, a, 0.7);
            wline(g, [[2, 2], [26, 6], [40, 20]], 1.4, a, 0.6);
            for (let k = 0; k < 5; k++) {
                const ph = (now / 900 + k / 5) % 1;
                g.fillStyle(0xffffff, 0.8 * (1 - ph));
                g.fillCircle(16 + k * 11, -18 - k * 6 - ph * 10, 1.6 * (1 - ph) + 0.4);
            }
        } },
    cyber: { c: 0x39ffd0, a: 0xff3bd4, draw: (g, now, flap, c, a) => {
            // 赛博翼：霓虹电路板翼——发光走线 + 闪烁节点
            const f = flap * 4;
            wpoly(g, [[2, 4], [20, -30 - f], [48, -46 - f], [78, -40 - f], [58, -8], [30, 8]], 0x123a3a, 0.75);
            for (let k = 0; k < 4; k++) {
                const seg = [[4, 2], [22 + k * 6, -12 - k * 8 - f * 0.4], [44 + k * 6, -20 - k * 6 - f * 0.5], [72, -28 - f * 0.6]];
                wline(g, seg, 2, k % 2 ? a : c, 0.9);
            }
            for (let k = 0; k < 5; k++) {
                const gl = 0.5 + 0.5 * Math.sin(now / 240 + k * 1.9);
                const px = [22, 40, 58, 70, 34][k], py = [-14, -30, -40, -18, 2][k] - f * 0.3;
                g.fillStyle(k % 2 ? a : c, gl);
                g.fillRect(px - 2, py - 2, 4, 4);
            }
        } },
    leaf: { c: 0x7ed957, a: 0x3a7a2a, draw: (g, _now, flap, c, a) => {
            // 叶翼：一大片带羽状叶脉的叶子
            const f = flap * 6;
            wpoly(g, [[2, 4], [20, -34 - f], [52, -52 - f], [78, -42 - f], [70, -20 - f * 0.6], [38, 2]], c, 0.95);
            wline(g, [[3, 2], [44, -30 - f], [76, -40 - f]], 1.8, a, 0.8);
            for (let k = 0; k < 4; k++) {
                const t = 0.2 + k * 0.2;
                const mx = 2 + 74 * t, my = 3 - 42 * t - f * t;
                wline(g, [[mx, my], [mx + 6, my - 12], [mx + 12, my - 16]], 1.2, a, 0.55);
                wline(g, [[mx, my], [mx + 4, my + 12], [mx + 10, my + 16]], 1.2, a, 0.55);
            }
        } },
    paper: { c: 0xfff4d6, a: 0xc9a86a, draw: (g, _now, flap, c, a) => {
            // 纸翼：折纸——折痕分出明暗面，翼尖带着一架小纸飞机
            const f = flap * 7;
            wpoly(g, [[2, 4], [46, -50 - f], [74, -36 - f], [50, 0]], c, 0.95);
            wpoly(g, [[2, 4], [46, -50 - f], [30, -18]], 0xf0e0b8, 0.95);
            wline(g, [[2, 4], [46, -50 - f]], 1.6, a, 0.8);
            wline(g, [[30, -18], [56, -22 - f * 0.4]], 1.2, a, 0.6);
            const px = 66, py = -30 - f;
            wpoly(g, [[px, py], [px + 16, py + 3], [px, py + 7]], 0xffffff, 0.95);
            wline(g, [[px, py], [px + 16, py + 3]], 1.2, a, 0.7);
        } },
    ember: { c: 0xff9a3c, a: 0x3a2a2a, draw: (g, now, flap, c, a) => {
            // 余烬：暗炭翼面，边缘烧红，火星上飘
            const f = flap * 6;
            wpoly(g, [[2, 4], [36, -42 - f], [72, -36 - f], [52, 4]], a, 0.95);
            wline(g, [[2, 4], [36, -42 - f], [72, -36 - f]], 4, c, 0.85);
            wline(g, [[2, 4], [52, 4]], 3.2, c, 0.6);
            for (let k = 0; k < 6; k++) {
                const ph = (now / 700 + k / 6) % 1;
                const gl = 0.5 + 0.5 * Math.sin(now / 200 + k);
                g.fillStyle(k % 2 ? c : 0xffd45c, gl * (1 - ph));
                g.fillCircle(18 + k * 10, -30 - f * 0.5 - ph * 20, 1.8 * (1 - ph) + 0.4);
            }
        } },
    manta: { c: 0x3fbfc9, a: 0x1a6a7a, draw: (g, _now, flap, c, a) => {
            // 蝠鲼：菱形躯体延伸成的大翼，翼缘波浪状起伏
            const f = flap * 8;
            wpoly(g, [[2, 0], [30, -26 - f], [62, -36 - f * 1.2], [84, -28 - f], [70, -14 - f * 0.6], [40, -4], [12, 8]], c, 0.95);
            wline(g, [[2, 0], [40, -14 - f * 0.7], [80, -26 - f]], 2, a, 0.7);
            for (let k = 0; k < 3; k++)
                wline(g, [[14 + k * 18, -4 - k * 7], [30 + k * 18, -16 - k * 8 - f * 0.6]], 1.4, a, 0.5);
            g.fillStyle(a, 0.85);
            g.fillCircle(20, -4, 2.4); // 眼斑
            wline(g, [[8, 8], [2, 18]], 1.6, a, 0.8); // 尾
        } },
    reef: { c: 0xff8fa0, a: 0xc95a7a, draw: (g, now, flap, c, a) => {
            // 珊瑚：一丛鹿角珊瑚枝
            const f = flap * 4;
            const branches = [
                [[4, 8], [16, -18 - f], [14, -38 - f], [22, -50 - f]],
                [[16, -18 - f], [30, -26 - f]],
                [[4, 8], [34, -12], [46, -34 - f * 0.7], [44, -48 - f * 0.7]],
                [[34, -12], [52, -16], [60, -32 - f * 0.6]],
                [[4, 8], [48, 4], [62, -12], [74, -18 - f * 0.5]],
            ];
            for (let k = 0; k < branches.length; k++) {
                const b = branches[k];
                wline(g, b, 6 - k * 0.6, k % 2 ? c : 0xffa8b4, 0.95);
                g.fillStyle(a, 0.9);
                const tip = b[b.length - 1];
                g.fillCircle(tip[0], tip[1], 2.2);
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 800 + k / 4) % 1;
                g.fillStyle(0xffffff, 0.7 * (1 - ph));
                g.fillCircle(24 + k * 14, -20 - ph * 26, 1.8 * (1 - ph) + 0.4);
            }
        } },
    crest: { c: 0xffd45c, a: 0xe87a2a, draw: (g, _now, flap, c, a) => {
            // 冠鳍：三片递减的背鳍连成冠
            const f = flap * 5;
            for (let k = 0; k < 3; k++) {
                const h = 52 - k * 13;
                wpoly(g, [[6 + k * 24, 6 - k * 2], [14 + k * 24, -h - f * (1 - k * 0.2)], [26 + k * 24, -2 - k * 2]], k % 2 ? c : 0xffe89a, 0.95);
                wline(g, [[6 + k * 24, 6 - k * 2], [14 + k * 24, -h - f * (1 - k * 0.2)]], 1.6, a, 0.7);
            }
            wline(g, [[2, 8], [76, 0]], 2.4, a, 0.8);
        } },
    wave: { c: 0x5ad0ff, a: 0x2a6ad4, draw: (g, now, flap, c, a) => {
            // 潮浪：一记卷起浪头的弧 + 浪花
            const f = flap * 6;
            g.fillStyle(c, 0.92);
            g.fillPoints([
                { x: 2, y: 8 }, { x: 12, y: -26 - f }, { x: 32, y: -46 - f }, { x: 56, y: -52 - f },
                { x: 74, y: -50 - f }, { x: 76, y: -38 - f }, { x: 60, y: -44 - f }, { x: 48, y: -34 - f },
                { x: 40, y: -12 }, { x: 30, y: 8 },
            ], true);
            g.fillStyle(a, 0.4);
            g.beginPath();
            g.arc(34, -8, 20, Math.PI * 1.1, Math.PI * 1.7);
            g.closePath();
            g.fillPath();
            for (let k = 0; k < 4; k++) {
                const ph = (now / 700 + k / 4) % 1;
                g.fillStyle(0xffffff, 0.85 * (1 - ph));
                g.fillCircle(58 + k * 6, -56 - f + ph * 14, 2.6 * (1 - ph) + 0.6);
            }
        } },
    seaWave: { c: 0x4ab8e8, a: 0x9fe8ff, draw: (g, now, flap, c, a) => {
            // 海波：层层叠叠的海波弧 + 泡泡
            const f = flap * 5;
            for (let k = 0; k < 4; k++) {
                g.fillStyle(k % 2 ? c : 0x2a8ad4, 0.85);
                g.beginPath();
                g.arc(34 + k * 8, 8 - k * 14 - f * 0.5, 30 - k * 6, Math.PI, TAU);
                g.closePath();
                g.fillPath();
                g.fillStyle(0xffffff, 0.3);
                g.beginPath();
                g.arc(30 + k * 8, 2 - k * 14 - f * 0.5, (30 - k * 6) * 0.55, Math.PI * 1.2, Math.PI * 1.55);
                g.closePath();
                g.fillPath();
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 800 + k / 4) % 1;
                g.fillStyle(a, 0.8 * (1 - ph));
                g.fillCircle(18 + k * 16, -34 - f * 0.4 - ph * 18, 2 * (1 - ph) + 0.6);
            }
        } },
    sail: { c: 0xf0e8d8, a: 0xb08a4a, draw: (g, now, flap, c, a) => {
            // 风帆：一面鼓风的帆 + 帆骨 + 缭绳
            const f = flap * 5;
            const bulge = Math.sin(now / 500) * 3;
            g.fillStyle(c, 0.96);
            g.fillPoints([
                { x: 4, y: 8 }, { x: 24, y: -16 - f }, { x: 46 + bulge, y: -34 - f }, { x: 66, y: -50 - f },
                { x: 44, y: -40 - f }, { x: 24, y: -22 - f }, { x: 8, y: 6 },
            ], true);
            for (let k = 0; k < 3; k++)
                wline(g, [[8 + k * 4, 2 - k * 10], [50 + k * 4, -30 - k * 6 - f]], 1.2, a, 0.5);
            wline(g, [[4, 8], [66, -50 - f]], 3, a);
            wline(g, [[66, -50 - f], [58, 8]], 1.4, a, 0.6); // 缭绳
        } },
    sailStar: { c: 0xffe9a8, a: 0x8f7bff, draw: (g, now, flap, c, a) => {
            // 星帆：缀满星星的夜色帆 + 一道流星
            const f = flap * 5;
            wpoly(g, [[4, 8], [52, -30 - f], [68, -52 - f], [56, -40 - f], [10, 4]], 0x3a3a6a, 0.9);
            wpoly(g, [[4, 8], [56, -40 - f], [60, -14], [40, 8]], c, 0.5);
            for (let k = 0; k < 6; k++) {
                const tw = 0.5 + 0.5 * Math.sin(now / 260 + k * 2.1);
                const px = [18, 34, 48, 58, 26, 44][k], py = [-10, -26 - f * 0.4, -40 - f * 0.6, -48 - f * 0.6, -18, -30 - f * 0.4][k];
                g.fillStyle(0xfff6d8, tw);
                g.fillRect(px - 1.6, py - 0.6, 3.2, 1.2);
                g.fillRect(px - 0.6, py - 1.6, 1.2, 3.2);
            }
            wline(g, [[4, 8], [68, -52 - f]], 2.4, c);
            const ph = (now / 1400) % 1;
            wline(g, [[30 - ph * 30, -6 + ph * 20], [44 - ph * 30, -14 + ph * 16]], 1.6, a, 0.9 * (1 - ph));
        } },
    mothKing: { c: 0xd8b070, a: 0x6a4a2a, draw: (g, _now, flap, c, a) => {
            // 蛾皇：两对蛾翼 + 眼斑 + 绒毛边
            const f = flap * 8;
            wpoly(g, [[2, 0], [36, -40 - f], [72, -48 - f], [66, -22 - f], [36, -6]], c, 0.95);
            wpoly(g, [[2, 4], [28, 8], [44, 22], [26, 26], [8, 14]], 0xc9a060, 0.9);
            for (let k = 0; k < 5; k++)
                wline(g, [[4, 0], [30 + k * 9, -24 - k * 4 - f * 0.4]], 1, a, 0.4);
            g.fillStyle(a, 0.9);
            g.fillCircle(52, -34 - f, 4.4);
            g.fillStyle(0x2a2a2a, 0.9);
            g.fillCircle(52, -34 - f, 2);
            g.fillStyle(a, 0.8);
            g.fillCircle(36, 16, 3);
            for (let k = 0; k < 4; k++)
                g.fillStyle(c, 0.9), g.fillCircle(10 + k * 16, [2, -10, -22, -34][k] - f * 0.3, 1.6); // 绒毛
            wline(g, [[2, 0], [72, -46 - f]], 1.8, a, 0.7);
        } },
    sunfire: { c: 0xffc247, a: 0xff5a1a, draw: (g, now, flap, c, a) => {
            // 日炎：一轮燃烧的小日轮 + 放射日珥
            const f = flap * 4;
            g.fillStyle(a, 0.5);
            g.fillCircle(34, -26 - f, 24);
            g.fillStyle(c, 0.95);
            g.fillCircle(34, -26 - f, 16);
            g.fillStyle(0xfff0b0, 0.9);
            g.fillCircle(30, -30 - f, 8);
            for (let k = 0; k < 9; k++) {
                const ang = (k / 9) * TAU + Math.sin(now / 400) * 0.1;
                const len = 20 + (k % 3) * 7 + Math.sin(now / 300 + k) * 4;
                wline(g, [[34 + Math.cos(ang) * 17, -26 - f + Math.sin(ang) * 17], [34 + Math.cos(ang) * (17 + len), -26 - f + Math.sin(ang) * (17 + len)]], 2.4, k % 2 ? c : a, 0.9);
            }
        } },
    gearsoul: { c: 0xb0903a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
            // 齿魂：一大一小两枚咬合旋转的齿轮
            const f = flap * 3;
            const gear = (cx, cy, r, teeth, rot, col) => {
                g.fillStyle(col, 0.95);
                for (let k = 0; k < teeth; k++) {
                    const ang = rot + (k / teeth) * TAU;
                    wpoly(g, [
                        [cx + Math.cos(ang - 0.14) * r, cy + Math.sin(ang - 0.14) * r],
                        [cx + Math.cos(ang - 0.14) * (r + 6), cy + Math.sin(ang - 0.14) * (r + 6)],
                        [cx + Math.cos(ang + 0.14) * (r + 6), cy + Math.sin(ang + 0.14) * (r + 6)],
                        [cx + Math.cos(ang + 0.14) * r, cy + Math.sin(ang + 0.14) * r],
                    ], col);
                }
                g.fillCircle(cx, cy, r);
                g.fillStyle(0x6a5222, 0.95);
                g.fillCircle(cx, cy, r * 0.35);
                g.fillStyle(a, 0.9);
                g.fillCircle(cx, cy, r * 0.14);
            };
            gear(30, -24 - f, 15, 8, now / 900, c);
            gear(60, -38 - f, 10, 6, -now / 600 + 0.4, 0x8a6a2a);
            wline(g, [[4, 6], [24, -6 - f]], 3, 0x6a5222);
        } },
    coralFin: { c: 0xff8fa0, a: 0xd44a6a, draw: (g, now, flap, c, a) => {
            // 珊瑚鳍：一面大鱼鳍，鳍条放射 + 半透明鳍膜
            const f = flap * 6;
            g.fillStyle(c, 0.55);
            g.fillPoints([
                { x: 4, y: 8 }, { x: 24, y: -18 - f }, { x: 48, y: -36 - f }, { x: 74, y: -44 - f },
                { x: 50, y: -22 - f * 0.5 }, { x: 26, y: -8 }, { x: 12, y: 8 },
            ], true);
            for (let k = 0; k < 5; k++) {
                wline(g, [[5, 6], [20 + k * 12, -18 - k * 6 - f * (0.4 + k * 0.1)], [38 + k * 8, -30 - k * 3 - f * (0.5 + k * 0.1)]], 1.6, a, 0.75);
            }
            wline(g, [[4, 8], [74, -44 - f]], 2.4, a);
            for (let k = 0; k < 3; k++) {
                const ph = (now / 900 + k / 3) % 1;
                g.fillStyle(0xffffff, 0.7 * (1 - ph));
                g.fillCircle(50 + k * 9, -42 - f + ph * 12, 1.6 * (1 - ph) + 0.4);
            }
        } },
    bambooLeaf: { c: 0x9fd95a, a: 0x3a7a2a, draw: (g, now, flap, c, a) => {
            // 竹叶：一段竹枝 + 三簇竹叶
            const f = flap * 6;
            wline(g, [[2, 10], [24, -6 - f * 0.4], [52, -22 - f * 0.7], [76, -30 - f]], 3.4, 0x7aa84a);
            for (let k = 0; k < 4; k++) {
                const bx = [24, 40, 56, 68][k], by = [-6, -14, -22, -28][k] - f * 0.4;
                for (let s = 0; s < 2; s++) {
                    const droop = s ? 14 : -20;
                    g.save();
                    g.translateCanvas(bx, by);
                    g.rotateCanvas((s ? 0.5 : -1.05) + Math.sin(now / 700 + k + s) * 0.05);
                    wpoly(g, [[0, 0], [20 + droop * 0.4, droop * 0.5], [34 + droop * 0.7, droop], [16, 3]], k % 2 ? c : 0x8ac84a, 0.95);
                    g.restore();
                }
            }
            g.lineStyle(1.4, a, 0.4);
            g.lineBetween(6, 4, 74, -28 - f);
        } },
};
