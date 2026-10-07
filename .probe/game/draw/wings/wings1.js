import { wpoly, wline, TAU } from './shared.js';
/**
 * 第一批主题翅膀（沙漠 / 云端 / 甜点 / 马戏 / 骑士 / 茶馆 / 魔法 / 化石 / 玩具 / 元宵 / 山海）。
 * 只画右翼；左翼由入口镜像。
 */
export const WINGS_1 = {
    desSandWing: { c: 0xd8a24a, a: 0x8a5a22, draw: (g, now, flap, c, a) => {
            // 流沙之翼：一整片沙浪鳍，翼缘往下淌沙
            const f = flap * 6;
            wpoly(g, [[2, 4], [30, -30 - f], [58, -52 - f], [84, -44 - f], [66, -12], [36, 10]], c);
            wpoly(g, [[6, 2], [30, -26 - f], [56, -44 - f]], 0xf0d8a0, 0.55);
            for (let k = 0; k < 4; k++) {
                const ph = (now / 800 + k / 4) % 1;
                g.fillStyle(a, 0.8 * (1 - ph));
                g.fillCircle(46 + k * 11, -38 - f + ph * 26, 2.4 * (1 - ph) + 0.6);
            }
            wline(g, [[2, 4], [30, -30 - f], [58, -52 - f], [84, -44 - f]], 2.4, a);
        } },
    desDuneWing: { c: 0xc9803a, a: 0xf0d8a0, draw: (g, now, flap, c, a) => {
            // 沙丘之翼：三道叠起来的沙丘弧
            const f = flap * 5;
            for (let k = 0; k < 3; k++) {
                const y0 = 6 - k * 20;
                g.fillStyle(k % 2 ? a : c, 0.92);
                g.beginPath();
                g.arc(30 + k * 6, y0 - f * 0.4, 30 - k * 6, Math.PI, TAU);
                g.closePath();
                g.fillPath();
                g.fillStyle(0xffffff, 0.25);
                g.beginPath();
                g.arc(30 + k * 6, y0 - f * 0.4, (30 - k * 6) * 0.62, Math.PI * 1.15, Math.PI * 1.5);
                g.closePath();
                g.fillPath();
            }
        } },
    nimbWindWing: { c: 0xeaf6ff, a: 0x6fb7ff, draw: (g, now, flap, c, a) => {
            // 风之翼：没有翼膜，只有几道风的弧线
            for (let k = 0; k < 4; k++) {
                const r = 22 + k * 15;
                g.lineStyle(3.4 - k * 0.5, k % 2 ? a : c, 0.9 - k * 0.12);
                g.beginPath();
                g.arc(0, 6, r, -Math.PI * (0.95 - k * 0.08) + flap * 0.12, -Math.PI * 0.18 + flap * 0.12);
                g.strokePath();
            }
            g.fillStyle(a, 0.8);
            g.fillCircle(72 + Math.sin(now / 400) * 4, -8, 2.4); // 风尾亮点
        } },
    nimbFeatherWing: { c: 0xffffff, a: 0x9ad4ff, draw: (g, now, flap, c, a) => {
            // 羽云翼：一团团云组成的翼，云上插三根白羽
            const f = flap * 7;
            for (let k = 0; k < 4; k++) {
                const px = 10 + k * 18, py = -14 - k * 13 - f * 0.5;
                g.fillStyle(k % 2 ? c : 0xdff0fc, 0.95);
                g.fillCircle(px, py, 12 - k * 1.6);
                g.fillStyle(0xffffff, 0.6);
                g.fillCircle(px - 3, py - 4, 5 - k * 0.6);
            }
            for (let k = 0; k < 3; k++) {
                const ang = -1.9 + k * 0.28;
                wline(g, [[14 + k * 8, -20 - k * 8], [14 + Math.cos(ang) * 34, -20 + Math.sin(ang) * 34 - k * 8]], 2.2, a, 0.9);
            }
        } },
    confSugarWing: { c: 0xfff0e0, a: 0xffb7d5, draw: (g, now, flap, c, a) => {
            // 糖霜翼：奶油扇面 + 一排往下淌的糖霜
            const f = flap * 6;
            wpoly(g, [[2, 6], [40, -46 - f], [82, -38 - f], [60, 4]], c);
            g.fillStyle(a, 0.9);
            for (let k = 0; k < 4; k++) {
                const px = 14 + k * 15;
                const drop = 6 + Math.abs(Math.sin(now / 500 + k)) * 4;
                g.fillCircle(px, 2 + drop * 0.4, 4.4);
                g.fillRect(px - 3, -4, 6, 8 + drop * 0.4);
            }
            wline(g, [[2, 6], [40, -46 - f], [82, -38 - f]], 2.2, a, 0.9);
        } },
    confCandyWing: { c: 0xff869c, a: 0x9effd0, draw: (g, now, flap, c, a) => {
            // 糖果翼：条纹糖纸翼 + 两端拧起的糖纸角
            const f = flap * 6;
            wpoly(g, [[4, 4], [36, -42 - f], [78, -30 - f], [52, 8]], c);
            for (let k = 0; k < 4; k++) {
                g.fillStyle(k % 2 ? 0xffffff : a, 0.85);
                g.save();
                g.translateCanvas(6 + k * 12, -6 - k * 6);
                g.rotateCanvas(-0.9);
                g.fillRect(0, 0, 30, 4.4);
                g.restore();
            }
            wpoly(g, [[4, 4], [-4, -6], [10, -8]], 0xffd45c, 1); // 糖纸角
            wline(g, [[4, 4], [36, -42 - f], [78, -30 - f]], 2.2, 0xffffff, 0.8);
        } },
    bigtTentWing: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
            // 帐篷翼：红白条纹的三角帐篷帆
            const f = flap * 5;
            wpoly(g, [[2, 6], [46, -50 - f], [80, 0]], 0xfff0e0);
            for (let k = 0; k < 4; k++) {
                g.fillStyle(c, 0.92);
                const t0 = k / 4, t1 = (k + 1) / 4;
                wpoly(g, [
                    [2 + 44 * t0, 6 - 56 * t0 - f * t0],
                    [2 + 44 * t1, 6 - 56 * t1 - f * t1],
                    [2 + 78 * t1, -t1 * 6],
                    [2 + 78 * t0, -t0 * 6],
                ], c);
            }
            wline(g, [[2, 6], [46, -50 - f], [80, 0]], 2.4, a);
        } },
    bigtConfettiWing: { c: 0xe8404a, a: 0x4ac8ff, draw: (g, now, flap, c, a) => {
            // 彩带翼：一圈飞散的彩带与纸屑
            const t = now / 300;
            for (let k = 0; k < 5; k++) {
                const col = [c, a, 0xffd45c, 0x9effd0, 0xffffff][k];
                wline(g, Array.from({ length: 8 }, (_, s) => {
                    const u = s / 7;
                    return [6 + u * 70, -8 - k * 9 + Math.sin(u * 4 + t + k) * (3 + u * 7)];
                }), 3, col, 0.95);
            }
            for (let k = 0; k < 8; k++) {
                const ph = (now / 900 + k / 8) % 1;
                g.fillStyle([c, a, 0xffd45c][k % 3], 0.9 * (1 - ph));
                g.fillRect(20 + k * 8, -60 + ph * 46, 3.4, 5);
            }
        } },
    aegisShieldWing: { c: 0xc0ccda, a: 0xc0392b, draw: (g, now, flap, c, a) => {
            // 盾翼：两枚叠放的钢盾
            const f = flap * 4;
            for (let k = 0; k < 2; k++) {
                const ox = 6 + k * 24, oy = -f * (0.4 + k * 0.3);
                wpoly(g, [[ox, oy - 20], [ox + 20, oy - 24], [ox + 26, oy - 4], [ox + 13, oy + 16], [ox, oy - 2]], k ? c : 0xdfe6f0);
                g.fillStyle(a, 0.9);
                g.fillCircle(ox + 13, oy - 4, 3);
            }
            wline(g, [[2, 4], [30, -34 - f], [64, -18 - f]], 2.2, 0x8a94a2);
        } },
    aegisBladeWing: { c: 0xdfe6f0, a: 0xc0392b, draw: (g, now, flap, c, a) => {
            // 刃翼：五把短剑成扇展开
            const f = flap * 0.2;
            for (let k = 0; k < 5; k++) {
                const ang = -1.75 + k * 0.33 + f;
                g.save();
                g.translateCanvas(4, 2);
                g.rotateCanvas(ang + Math.PI / 2);
                wpoly(g, [[-2.6, -14], [2.6, -14], [2, -40], [0, -46], [-2, -40]], k % 2 ? 0xc0ccda : c);
                g.fillStyle(a, 0.9);
                g.fillRect(-3, -12, 6, 3);
                g.restore();
            }
        } },
    chanFanWing: { c: 0x2f7a4a, a: 0xf0e0c0, draw: (g, now, flap, c, a) => {
            // 折扇翼：一把半开的折扇
            const f = flap * 0.22;
            for (let k = 0; k < 6; k++) {
                const ang = -2.4 + k * 0.3 + f;
                g.lineStyle(2, a, 0.9);
                g.lineBetween(2, 4, 2 + Math.cos(ang) * 62, 4 + Math.sin(ang) * 62);
                g.fillStyle(k % 2 ? c : 0x3a8a5a, 0.9);
                wpoly(g, [
                    [2 + Math.cos(ang) * 16, 4 + Math.sin(ang) * 16],
                    [2 + Math.cos(ang + 0.28) * 60, 4 + Math.sin(ang + 0.28) * 60],
                    [2 + Math.cos(ang) * 62, 4 + Math.sin(ang) * 62],
                ], k % 2 ? c : 0x3a8a5a, 0.85);
            }
            g.fillStyle(a, 1);
            g.fillCircle(2, 4, 4); // 扇钉
        } },
    chanLeafWing: { c: 0x8aa84a, a: 0x2f7a4a, draw: (g, now, flap, c, a) => {
            // 竹叶翼：一丛斜出的竹叶
            const f = flap * 6;
            for (let k = 0; k < 6; k++) {
                const ang = -1.9 + k * 0.26 + Math.sin(now / 700 + k) * 0.04;
                g.save();
                g.translateCanvas(4, 0);
                g.rotateCanvas(ang + f * 0.02);
                wpoly(g, [[0, 0], [44, -4], [72 - k * 3, 0], [40, 4]], k % 2 ? c : 0x5a8a3a, 0.95);
                g.lineStyle(1, a, 0.6);
                g.lineBetween(4, 0, 66 - k * 3, 0);
                g.restore();
            }
        } },
    arcanRuneWing: { c: 0xb46cff, a: 0xffd45c, draw: (g, now, flap, c, a) => {
            // 符文翼：半透明翼膜 + 三枚发光符文
            const f = flap * 7;
            wpoly(g, [[2, 4], [34, -44 - f], [76, -40 - f], [56, 6]], c, 0.4);
            wline(g, [[2, 4], [34, -44 - f], [76, -40 - f], [56, 6]], 2.2, c, 0.9);
            for (let k = 0; k < 3; k++) {
                const gl = 0.5 + 0.5 * Math.sin(now / 260 + k * 2);
                const px = 22 + k * 18, py = -20 - k * 8 - f * 0.4;
                g.fillStyle(a, 0.5 * gl);
                g.fillCircle(px, py, 7);
                g.fillStyle(a, 0.95 * gl);
                g.fillRect(px - 1.6, py - 4.5, 3.2, 9);
            }
        } },
    arcanStarWing: { c: 0x4a2a8a, a: 0xffe89a, draw: (g, now, flap, c, a) => {
            // 星辉翼：星座连线翼
            const f = flap * 5;
            const stars = [[8, 0], [26, -30 - f], [48, -46 - f], [72, -34 - f], [40, -12], [66, 2]];
            wpoly(g, [stars[0], stars[1], stars[2], stars[3], stars[5]], c, 0.25);
            g.lineStyle(1.4, a, 0.8);
            g.beginPath();
            g.moveTo(stars[0][0], stars[0][1]);
            for (let k = 1; k < stars.length; k++)
                g.lineTo(stars[k][0], stars[k][1]);
            g.strokePath();
            stars.forEach(([px, py], k) => {
                const tw = 0.6 + 0.4 * Math.sin(now / 240 + k * 1.7);
                g.fillStyle(a, tw);
                g.fillRect(px - 2.4, py - 0.8, 4.8, 1.6);
                g.fillRect(px - 0.8, py - 2.4, 1.6, 4.8);
            });
        } },
    relicBoneWing: { c: 0xd8c8a0, a: 0x8a6a3a, draw: (g, now, flap, c, a) => {
            // 骨翼：骨刺为架、皮膜为面
            const f = flap * 6;
            wpoly(g, [[4, 4], [40, -40 - f], [74, -32 - f], [50, 6]], 0xb8a880, 0.45);
            for (let k = 0; k < 4; k++) {
                const t0 = k / 4, t1 = (k + 0.5) / 4;
                const bx = 4 + (70 - 4) * t1, by = 4 - (44 + f) * t1;
                wline(g, [[4, 2], [bx, by]], 4, c);
                g.fillStyle(c, 1);
                g.fillCircle(bx, by, 3.4);
                g.fillCircle(bx + 4, by + 3, 2.4); // 骨节
            }
            wline(g, [[4, 4], [40, -40 - f], [74, -32 - f]], 2.4, a);
        } },
    relicAmberWing: { c: 0xd8902a, a: 0x5a7a3a, draw: (g, now, flap, c, a) => {
            // 琥珀翼：半透明的琥珀扇面，里面封着虫
            const f = flap * 6;
            wpoly(g, [[2, 4], [38, -46 - f], [80, -34 - f], [54, 6]], c, 0.4);
            wpoly(g, [[2, 4], [38, -46 - f], [80, -34 - f], [54, 6]], 0xffe8b0, 0.25);
            g.fillStyle(0x2a2a2a, 0.85);
            g.fillEllipse(36, -24 - f * 0.4, 6, 2.4);
            g.fillEllipse(54, -16, 5, 2); // 虫
            wline(g, [[2, 4], [38, -46 - f], [80, -34 - f]], 2.2, a, 0.85);
            for (let k = 0; k < 3; k++)
                wline(g, [[4, 2], [20 + k * 20, -14 - k * 10 - f * 0.4]], 1.6, a, 0.5); // 琥珀流纹
        } },
    playBlockWing: { c: 0xe8404a, a: 0x4a90d9, draw: (g, now, flap, c, a) => {
            // 积木翼：一块块积木拼出的阶梯翼
            const f = flap * 3;
            for (let k = 0; k < 5; k++) {
                const px = 4 + k * 15, py = -8 - k * 11 - f * 0.4;
                g.fillStyle([c, a, 0xffd45c, 0x9effd0, 0xe8404a][k], 0.95);
                g.fillRect(px, py, 13, 13);
                g.fillStyle(0xffffff, 0.4);
                g.fillRect(px, py, 13, 3);
                g.fillStyle(0x000000, 0.12);
                g.fillRect(px, py + 10, 13, 3);
            }
        } },
    playKiteWing: { c: 0x4a90d9, a: 0xe8404a, draw: (g, now, flap, c, a) => {
            // 风筝翼：两只风筝牵着线
            const f = flap * 8;
            for (let k = 0; k < 2; k++) {
                const px = 26 + k * 34, py = -34 - k * 22 - f;
                wline(g, [[4, 2], [px, py + 12]], 1.4, 0xffffff, 0.7);
                wpoly(g, [[px, py - 14], [px + 11, py], [px, py + 14], [px - 11, py]], k ? a : c);
                wline(g, [[px, py - 14], [px, py + 14]], 1.2, 0xffffff, 0.8);
                wline(g, [[px - 11, py], [px + 11, py]], 1.2, 0xffffff, 0.8);
                wline(g, [[px - 4, py + 14], [px + 2, py + 24]], 1.4, a, 0.9); // 尾巴
            }
        } },
    yuanLanternWing: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
            // 灯笼翼：弧形竹架上挂三盏灯笼
            const f = flap * 5;
            wline(g, [[2, 4], [30, -40 - f], [70, -30 - f]], 3, 0x8a5a2a);
            for (let k = 0; k < 3; k++) {
                const px = 18 + k * 20, py = -22 - k * 5 - f * 0.4;
                wline(g, [[px, py - 14], [px, py - 6]], 1.2, a, 0.7);
                g.fillStyle(k % 2 ? c : 0xff9a4a, 0.95);
                g.fillEllipse(px, py, 12, 14);
                g.fillStyle(a, 0.9);
                g.fillRect(px - 5, py - 8, 10, 2);
                g.fillRect(px - 5, py + 6, 10, 2);
                g.fillStyle(0xffe89a, 0.6 + 0.3 * Math.sin(now / 300 + k));
                g.fillEllipse(px, py, 5, 8);
            }
        } },
    yuanFireWing: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
            // 焰火翼：两朵炸开的焰火
            for (let k = 0; k < 2; k++) {
                const cx = 34 + k * 30, cy = -30 - k * 14;
                for (let s = 0; s < 9; s++) {
                    const ang = (s / 9) * TAU + k;
                    const len = 16 + ((s * 7 + k * 3) % 10);
                    const ph = (now / 700 + k * 0.5) % 1;
                    wline(g, [[cx, cy], [cx + Math.cos(ang) * len * (1 - ph * 0.4), cy + Math.sin(ang) * len * (1 - ph * 0.4)]], 2, s % 2 ? c : a, 0.9 - ph * 0.4);
                }
                g.fillStyle(a, 0.9);
                g.fillCircle(cx, cy, 2.4);
            }
        } },
    shanWingFeather: { c: 0xd8e8ff, a: 0x3a9a7a, draw: (g, now, flap, c, a) => {
            // 鲲羽之翼：几根巨大的青白羽
            const f = flap * 7;
            for (let k = 0; k < 4; k++) {
                const ang = -2.15 + k * 0.3;
                g.save();
                g.translateCanvas(4, 2);
                g.rotateCanvas(ang + Math.PI / 2 + f * 0.02);
                wpoly(g, [[-5, -12], [5, -12], [3.4, -58 + k * 4], [0, -66 + k * 4], [-3.4, -58 + k * 4]], k % 2 ? c : 0xffffff, 0.95);
                g.lineStyle(1, a, 0.5);
                g.lineBetween(0, -14, 0, -60 + k * 4);
                g.restore();
            }
        } },
    shanWingCloud: { c: 0xdfeef8, a: 0x3a9a7a, draw: (g, now, flap, c, a) => {
            // 云螭翼：一条云气盘成翼形
            const f = flap * 6;
            for (let k = 0; k < 4; k++) {
                const px = 12 + k * 16, py = -12 - k * 12 - f * 0.5;
                g.fillStyle(k % 2 ? c : 0xffffff, 0.95);
                g.fillCircle(px, py, 10 - k);
                g.fillStyle(a, 0.35);
                g.fillCircle(px + 4, py + 3, 5); // 云影
            }
            wline(g, [[6, 4], [16, -8 - f], [34, -22 - f], [58, -30 - f], [78, -22 - f]], 2.4, a, 0.8); // 螭脊
        } },
};
