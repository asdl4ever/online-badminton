import { handle, pommel, poly, line, TAU } from './shared.js';
/** 第一批主题球拍的武器化（沙漠 / 云端 / 甜点 / 马戏 / 骑士 / 茶馆 / 魔法 / 化石 / 玩具 / 元宵 / 山海） */
export const WEAPONS_1 = {
    desRacketA: { c: 0xc9803a, a: 0x8a5a22, draw: (g, now, c) => {
            // 铜铃锤：木柄 + 一只铜铃，铃舌随节奏晃
            handle(g, -13, 2, 6, 0x8a5a22);
            g.lineStyle(2.5, c, 1);
            g.beginPath();
            g.arc(9, -3, 11, Math.PI, TAU);
            g.closePath();
            g.strokePath();
            g.fillStyle(c, 1);
            g.fillEllipse(9, 2, 22, 16);
            g.lineStyle(2, 0xa06a2a, 1);
            g.strokeEllipse(9, 2, 22, 16);
            g.lineStyle(2, 0x6a4218, 0.9);
            g.lineBetween(9, -14, 9, -9);
            const sw = Math.sin(now / 240) * 3;
            g.fillStyle(0x6a4218, 1);
            g.fillCircle(9 + sw, 6, 2.6);
            g.fillStyle(0xffe0a0, 0.7);
            g.fillEllipse(4, -6, 6, 4);
        } },
    desRacketB: { c: 0xd9a44a, a: 0x2f8a8a, draw: (g, now, c, a) => {
            // 金字塔法杖：杖顶悬浮一座小金字塔，缓缓旋转，底下绕着沙旋
            handle(g, -13, 0, 5, 0x7a5230);
            pommel(g, -13, 3, 0xd9a44a);
            g.lineStyle(4, 0x7a5230, 1);
            g.lineBetween(0, 0, 4, 0);
            const ang = now / 1600;
            const w1 = Math.abs(Math.cos(ang)) * 10 + 2;
            poly(g, [[9 - w1, 5], [9 + w1, 5], [9, -9]], c);
            line(g, [[9 - w1, 5], [9, -9]], 1.6, 0xffe0a0, 0.8);
            for (let k = 0; k < 3; k++) {
                const ph = (now / 900 + k / 3) % 1;
                g.fillStyle(a, 0.5 * (1 - ph));
                g.fillCircle(9 + Math.sin(ph * 6 + k) * 12, 6 - ph * 12, 2.2 * (1 - ph));
            }
        } },
    nimbRacketA: { c: 0xeaf6ff, a: 0x6fb7ff, draw: (g, now, c) => {
            // 云杖：弯钩杖头托着一团会呼吸的云
            handle(g, -13, 2, 5, 0xb8c4d4);
            line(g, [[2, 0], [6, -6], [6, -10]], 4, 0xb8c4d4);
            const br = 0.5 + 0.5 * Math.sin(now / 500);
            g.fillStyle(c, 1);
            g.fillCircle(4, -14, 5);
            g.fillCircle(11, -15, 6.5 + br);
            g.fillCircle(17, -13, 5);
            g.fillStyle(0xffffff, 0.85);
            g.fillCircle(10, -17, 4);
            g.fillStyle(0x6fb7ff, 0.8);
            g.fillCircle(17, -11, 1.6);
        } },
    nimbRacketB: { c: 0x9ad4ff, a: 0xffe89a, draw: (g, now, c, a) => {
            // 星云法杖：杖顶一颗星云球，三颗小星绕着转
            handle(g, -13, 1, 5, 0x8a92a8);
            pommel(g, -13, 3, a);
            g.fillStyle(c, 0.35);
            g.fillCircle(9, -4, 11);
            g.fillStyle(c, 0.9);
            g.fillCircle(9, -4, 7);
            g.fillStyle(0xffffff, 0.7);
            g.fillCircle(7, -6, 2.4);
            for (let k = 0; k < 3; k++) {
                const ang = now / 600 + (k / 3) * TAU;
                const px = 9 + Math.cos(ang) * 12, py = -4 + Math.sin(ang) * 8;
                g.fillStyle(a, 1);
                g.fillRect(px - 2.4, py - 0.8, 4.8, 1.6);
                g.fillRect(px - 0.8, py - 2.4, 1.6, 4.8);
            }
        } },
    confRacketA: { c: 0xff869c, a: 0x9effd0, draw: (g, now, c, a) => {
            // 棒棒糖锤：白柄 + 一颗粉白螺旋糖
            handle(g, -13, 0, 5, 0xf0e8dc);
            g.fillStyle(c, 1);
            g.fillCircle(9, -3, 12);
            g.lineStyle(3, 0xffffff, 1);
            g.beginPath();
            for (let s = 0; s <= 30; s++) {
                const u = s / 30, ang = u * TAU * 2.2;
                const r = u * 10.5;
                const px = 9 + Math.cos(ang + now / 1400) * r, py = -3 + Math.sin(ang + now / 1400) * r;
                if (s === 0)
                    g.moveTo(px, py);
                else
                    g.lineTo(px, py);
            }
            g.strokePath();
            g.fillStyle(a, 0.9);
            g.fillCircle(9, -3, 2);
        } },
    confRacketB: { c: 0xfff0e0, a: 0xffb7d5, draw: (g, now, c, a) => {
            // 奶油搅打锤：粗白锤头 + 顶上挤一圈奶油花
            handle(g, -13, 2, 6, 0xa06a4a);
            g.fillStyle(c, 1);
            g.fillRoundedRect(0, -9, 20, 18, 8);
            for (let k = 0; k < 4; k++) {
                g.fillStyle(a, 0.95);
                g.fillCircle(3 + k * 5, -9 - (k % 2) * 2, 3.6);
            }
            g.fillStyle(a, 0.7);
            g.fillCircle(18, 0, 3);
            g.fillStyle(0xffd45c, 0.8);
            g.fillCircle(4, 5, 2);
        } },
    bigtRacketA: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, c, a) => {
            // 小丑锤：红黄条纹的软锤
            handle(g, -13, -4, 6, 0x6a4a2f);
            g.fillStyle(c, 1);
            g.fillRoundedRect(-2, -8, 28, 16, 7);
            g.fillStyle(a, 1);
            for (let k = 0; k < 3; k++)
                g.fillRect(2 + k * 9, -8, 4, 16);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(24, 0, 4);
            g.fillStyle(0x2a2a3a, 1);
            g.fillCircle(24, 0, 1.8);
        } },
    bigtRacketB: { c: 0xe8404a, a: 0x4ac8ff, draw: (g, now, c, a) => {
            // 彩条鞭杖：杖顶三条彩绸螺旋甩出
            handle(g, -13, 0, 5, 0xd9b45c);
            pommel(g, -13, 3, c);
            const t = now / 300;
            for (let k = 0; k < 3; k++) {
                const col = [c, a, 0xffd45c][k];
                line(g, Array.from({ length: 9 }, (_, s) => {
                    const u = s / 8;
                    return [3 + u * 26, Math.sin(u * 5 + t + k * 0.7) * (3 + u * 7)];
                }), 3, col, 0.95);
            }
        } },
    aegisRacketA: { c: 0xc0ccda, a: 0x8a94a2, draw: (g, now, c, a) => {
            // 齿轮战锤：钢锤头带一圈齿，锤面一颗铆钉
            handle(g, -13, 0, 6, 0x6a7482);
            g.fillStyle(c, 1);
            g.fillRoundedRect(-1, -9, 22, 18, 3);
            g.fillStyle(a, 1);
            for (let k = 0; k < 6; k++) {
                const ang = (k / 6) * TAU;
                g.fillRect(10 + Math.cos(ang) * 12 - 2.5, Math.sin(ang) * 10 - 2.5, 5, 5);
            }
            g.fillStyle(0x4a5462, 1);
            g.fillCircle(10, 0, 4);
            g.fillStyle(0xdfe6f0, 0.9);
            g.fillCircle(10, 0, 1.8);
        } },
    aegisRacketB: { c: 0xdfe6f0, a: 0xc0392b, draw: (g, now, c, a) => {
            // 骑士长剑：十字护手 + 血槽 + 金柄尾
            handle(g, -13, -4, 5.5, 0x3a2a1a);
            pommel(g, -13, 3.2, 0xd9b45c);
            g.fillStyle(0xd9b45c, 1);
            g.fillRect(-4, -8, 4, 16);
            poly(g, [[0, -4], [2, -4], [2, 4], [0, 4]], 0x8a94a2);
            poly(g, [[2, -5], [16, -2.4], [24, 0], [16, 2.4], [2, 5]], c);
            line(g, [[3, 0], [20, 0]], 1.2, a, 0.85);
            g.lineStyle(1.4, 0xffffff, 0.6);
            g.lineBetween(3, -3, 20, -1);
        } },
    chanRacketA: { c: 0x8aa84a, a: 0x2f7a4a, draw: (g, now, c) => {
            // 竹节棍：两节竹子 + 节环
            handle(g, -13, 20, 5.5, c);
            g.lineStyle(1.6, 0x2a4a1a, 0.8);
            g.lineBetween(-6, -2.6, -6, 2.6);
            g.lineBetween(6, -2.6, 6, 2.6);
            g.fillStyle(0x2a4a1a, 0.8);
            g.fillEllipse(20, 0, 4, 6);
            g.fillStyle(0x5a8a3a, 0.7);
            g.fillEllipse(9, -2.4, 5, 2);
        } },
    chanRacketB: { c: 0x2f7a4a, a: 0xb0713a, draw: (g, now, c, a) => {
            // 茶筅：陶柄 + 一把散开的绿色茶刷，轻颤
            handle(g, -13, 2, 6, a);
            g.fillStyle(0x9a6a4a, 0.6);
            g.fillCircle(3, 0, 4);
            const sh = Math.sin(now / 90) * 1.2;
            g.lineStyle(1.8, c, 0.95);
            for (let k = 0; k < 7; k++) {
                const ang = -0.9 + (k / 6) * 1.8;
                g.lineBetween(4, 0, 4 + Math.cos(ang) * 17, (Math.sin(ang) + sh * (k % 2 ? 1 : -1)) * 9);
            }
            g.fillStyle(0x9effd0, 0.5);
            g.fillCircle(15, -2, 3);
        } },
    arcanRacketA: { c: 0xb46cff, a: 0xffd45c, draw: (g, now, c, a) => {
            // 星辉魔杖：黑杖 + 顶端一颗五角星
            handle(g, -13, 4, 4.5, 0x2a1a44);
            pommel(g, -13, 2.6, a);
            const pts = [];
            for (let k = 0; k < 10; k++) {
                const ang = -Math.PI / 2 + (k / 10) * TAU;
                const r = k % 2 === 0 ? 11 : 4.5;
                pts.push([9 + Math.cos(ang) * r, Math.sin(ang) * r]);
            }
            poly(g, pts, c);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(9, 0, 2.6);
            const tw = 0.5 + 0.5 * Math.sin(now / 200);
            g.fillStyle(a, tw);
            g.fillCircle(9 + Math.cos(now / 400) * 15, Math.sin(now / 400) * 11, 1.8);
        } },
    arcanRacketB: { c: 0x4a2a8a, a: 0xb46cff, draw: (g, now, c, a) => {
            // 符文权杖：杖顶宝珠 + 三枚符文绕行
            handle(g, -13, 2, 5.5, 0x2a1a44);
            g.fillStyle(c, 1);
            g.fillCircle(9, 0, 3.5);
            g.fillCircle(9, -6, 2.5);
            g.fillStyle(a, 0.95);
            g.fillCircle(9, -10, 6);
            g.fillStyle(0xe8d8ff, 0.9);
            g.fillCircle(7, -12, 2.2);
            for (let k = 0; k < 3; k++) {
                const ang = now / 700 + (k / 3) * TAU;
                g.fillStyle(a, 0.9);
                g.fillRect(9 + Math.cos(ang) * 13 - 1.5, Math.sin(ang) * 9 - 3, 3, 6);
            }
        } },
    relicRacketA: { c: 0xd8c8a0, a: 0x8a6a3a, draw: (g, now, c) => {
            // 骨杖：一段大腿骨 + 顶端一颗小骷髅
            handle(g, -13, 6, 5, 0xb8a880);
            g.fillStyle(c, 1);
            g.fillCircle(8, -2, 3);
            g.fillCircle(14, 2, 3);
            g.fillStyle(c, 1);
            g.fillCircle(9, -9, 5.5);
            g.fillStyle(0x2a2a2a, 1);
            g.fillCircle(7, -10, 1.6);
            g.fillCircle(11, -10, 1.6);
            g.fillStyle(0x2a2a2a, 0.8);
            g.fillRect(8, -6.5, 2.4, 1.8);
        } },
    relicRacketB: { c: 0x8a6a3a, a: 0xd8c8a0, draw: (g, now, c, a) => {
            // 青铜镐：镐尖 + 齿轮配重
            handle(g, -13, 4, 5.5, 0x6a4a22);
            line(g, [[2, -6], [14, -14], [26, -6]], 5, c);
            line(g, [[2, 6], [14, -14]], 4, c, 0.9);
            g.fillStyle(a, 1);
            g.fillCircle(14, -13, 3);
            g.fillStyle(c, 1);
            g.fillCircle(2, 0, 4.5);
            for (let k = 0; k < 6; k++) {
                const ang = (k / 6) * TAU + now / 1200;
                g.fillStyle(a, 0.8);
                g.fillRect(2 + Math.cos(ang) * 6 - 1.5, Math.sin(ang) * 6 - 1.5, 3, 3);
            }
        } },
    playRacketA: { c: 0xe8404a, a: 0x4a90d9, draw: (g, now, c, a) => {
            // 积木锤：红黄蓝积木拼的方锤
            handle(g, -13, 0, 6, 0xffd45c);
            g.fillStyle(c, 1);
            g.fillRect(-2, -10, 12, 20);
            g.fillStyle(a, 1);
            g.fillRect(10, -10, 10, 20);
            g.fillStyle(0xffd45c, 1);
            g.fillRect(6, -14, 8, 6);
            g.fillRect(6, 8, 8, 6);
            g.fillStyle(0xffffff, 0.5);
            g.fillRect(-2, -10, 12, 3);
        } },
    playRacketB: { c: 0xe8404a, a: 0x4a90d9, draw: (g, now, c, a) => {
            // 彩带体操棒：细棒顶一只小环，绸带甩出波纹
            handle(g, -13, 8, 4, 0xffd45c);
            g.lineStyle(2.5, a, 1);
            g.strokeCircle(12, 0, 5);
            const t = now / 260;
            line(g, Array.from({ length: 10 }, (_, s) => {
                const u = s / 9;
                return [15 + u * 20, Math.sin(u * 7 + t) * (2 + u * 8)];
            }), 3, c, 0.95);
        } },
    yuanRacketA: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, c, a) => {
            // 红绸棍：杖顶挑一段翻飞的红绸
            handle(g, -13, 6, 4.5, 0x8a2020);
            g.fillStyle(a, 1);
            g.fillCircle(8, 0, 3);
            const t = now / 220;
            for (let k = 0; k < 2; k++) {
                line(g, Array.from({ length: 11 }, (_, s) => {
                    const u = s / 10;
                    return [9 + u * 24, 2 + Math.sin(u * 4.5 + t + k * 0.9) * (2 + u * 9)];
                }), 3.5, k ? 0xc02838 : c, 0.95);
            }
        } },
    yuanRacketB: { c: 0xd9b45c, a: 0xe8404a, draw: (g, now, c, a) => {
            // 桃木剑：木剑身 + 一道朱砂符纸
            handle(g, -13, -3, 5.5, 0x8a2020);
            g.fillStyle(0xd9b45c, 1);
            g.fillRect(-5, -7, 4, 14);
            poly(g, [[-1, -3.5], [18, -2], [27, 0], [18, 2], [-1, 3.5]], 0x9a6a3a);
            line(g, [[0, 0], [22, 0]], 1, 0x6a4218, 0.7);
            g.fillStyle(a, 0.95);
            g.fillRect(8, -6, 6, 12);
            g.fillStyle(0xffd45c, 0.9);
            g.fillRect(9.5, -4, 3, 1.4);
            g.fillRect(9.5, 1, 3, 1.4);
        } },
    shanRacketA: { c: 0x3a9a7a, a: 0xd8e8ff, draw: (g, now, c, a) => {
            // 玉简：一卷青玉简牍，玉光流转
            handle(g, -13, 0, 5, 0x7a5a2a);
            g.fillStyle(c, 1);
            g.fillRoundedRect(0, -13, 14, 26, 3);
            g.lineStyle(1.4, 0xffffff, 0.4);
            for (let k = 0; k < 3; k++)
                g.lineBetween(2, -7 + k * 7, 12, -7 + k * 7);
            const sh = 0.4 + 0.3 * Math.sin(now / 400);
            g.lineStyle(2, a, sh);
            g.strokeRect(0, -13, 14, 26);
            g.fillStyle(a, 0.9);
            g.fillCircle(7, -15, 2.4);
        } },
    shanRacketB: { c: 0x3a9a7a, a: 0xd42a2a, draw: (g, now, c, a) => {
            // 螭鳞弯刀：玉刀身叠鳞纹，刀背一条赤鬃
            handle(g, -13, -2, 5, 0x7a5a2a);
            g.fillStyle(0xd9b45c, 1);
            g.fillRect(-4, -6, 3, 12);
            const blade = [];
            for (let s = 0; s <= 10; s++) {
                const u = s / 10;
                blade.push([u * 26, -4 - Math.sin(u * Math.PI * 0.5) * 4 + u * 2]);
            }
            blade.push([26, 4], [2, 4]);
            poly(g, blade, c);
            for (let k = 0; k < 4; k++) {
                g.fillStyle(0xffffff, 0.35);
                g.fillEllipse(4 + k * 5.5, -2 + k * 0.6, 4, 2.2);
            }
            line(g, [[0, -4], [20, -7]], 2, a, 0.9);
        } },
};
