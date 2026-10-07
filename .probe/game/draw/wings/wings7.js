import { wpoly, wline } from './shared.js';
/**
 * 传奇翅膀（5★）大改批：20 款全部重写本体画法。
 * 特点：更强的上下挥动（flap 幅度 ±0.5，本体乘 10~16 直接驱动整片翼面起伏），
 * 每款叠加多组 `now` 驱动的专属动效（粒子 / 光晕 / 流星 / 电弧…），不再靠附加层。
 * 只画右翼；左翼由入口镜像。
 */
export const WINGS_7 = {
    angel: { c: 0xf6f6fa, a: 0xffd45c, draw: (g, now, flap, c, a) => {
            // 天使：三层白羽大幅挥动（羽根金环）+ 圣光尘飘落 + 翼尖泛光
            const f = flap * 14;
            for (let row = 0; row < 3; row++) {
                const n = 5 - row, y0 = 6 - row * 8, len = 62 - row * 10;
                for (let k = 0; k < n; k++) {
                    const t = k / Math.max(1, n - 1);
                    const bx = 4 + row * 6, by = y0 - t * (14 + f * 0.7);
                    const ang = -Math.PI / 2.6 + t * 0.95 + flap * 0.1;
                    const cos = Math.cos(ang), sin = Math.sin(ang);
                    const vs = [];
                    for (let s = 0; s <= 4; s++) {
                        const u = s / 4;
                        vs.push({ x: bx + cos * len * u - sin * 5.4 * Math.sin(u * Math.PI), y: by + sin * len * u + cos * 5.4 * Math.sin(u * Math.PI) });
                    }
                    for (let s = 4; s >= 0; s--) {
                        const u = s / 4;
                        vs.push({ x: bx + cos * len * u + sin * 5.4 * Math.sin(u * Math.PI), y: by + sin * len * u - cos * 5.4 * Math.sin(u * Math.PI) });
                    }
                    g.fillStyle(row === 2 ? 0xe4e4ec : c, 0.98 - row * 0.05);
                    g.fillPoints(vs, true);
                }
            }
            g.lineStyle(2.2, a, 0.9);
            g.strokeCircle(10, -2, 9);
            const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 300));
            g.fillStyle(a, tw);
            g.fillCircle(58, -52 - f * 0.8, 2.4);
            g.fillCircle(78, -38 - f * 0.8, 1.8);
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1500 + k / 3) % 1;
                g.save();
                g.translateCanvas(20 + k * 18 + Math.sin(ph * 4 + k) * 5, -40 - f + ph * 44);
                g.rotateCanvas(Math.sin(now / 400 + k) * 0.6);
                g.fillStyle(0xffffff, 0.75 * (1 - ph));
                g.fillEllipse(0, 0, 2.2, 6);
                g.restore();
            }
            g.fillStyle(0xfff6d8, 0.12 + 0.06 * Math.sin(now / 400));
            g.fillEllipse(40, -30 - f * 0.5, 70, 46);
        } },
    holyWing: { c: 0xfff6dc, a: 0xf2c14a, draw: (g, now, flap, c, a) => {
            // 圣羽：金边白翼大幅挥动 + 光环脉冲 + 圣光尘 + 翼尖三珠闪
            const f = flap * 13;
            g.fillStyle(a, 0.08 + 0.05 * Math.sin(now / 420));
            g.fillEllipse(40, -26 - f * 0.6, 90, 60);
            wpoly(g, [[2, 4], [26, -34 - f], [56, -58 - f], [88, -46 - f], [70, -10], [34, 10]], c);
            wpoly(g, [[8, 2], [30, -30 - f], [58, -50 - f], [80, -42 - f], [62, -8]], a, 0.28);
            wline(g, [[4, 2], [30, -30 - f], [54, -50 - f]], 1.6, a, 0.9);
            wline(g, [[6, 4], [36, -22 - f], [66, -34 - f]], 1.4, a, 0.7);
            wline(g, [[6, 6], [40, -12 - f], [72, -18 - f]], 1.4, a, 0.6);
            for (let k = 0; k < 3; k++) {
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k * 1.5));
                g.fillStyle(a, tw);
                g.fillCircle([84, 66, 46][k], [-44, -52, -54][k] - f, [2.8, 2.2, 1.8][k]);
                g.fillStyle(0xffffff, tw * 0.7);
                g.fillCircle([84, 66, 46][k] - 1, [-45, -53, -55][k] - f, 1);
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 1200 + k / 4) % 1;
                g.fillStyle(0xfff6d8, 0.7 * (1 - ph));
                g.fillCircle(14 + k * 20 + Math.sin(ph * 5 + k) * 6, -34 - f * 0.6 - ph * 24, 1.8 * (1 - ph) + 0.4);
            }
        } },
    phoenix: { c: 0xe8562a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
            // 凤凰：三层翎羽烈焰翼大幅挥动 + 上腾火羽 + 翼缘流火 + 热浪底光
            const f = flap * 15;
            g.fillStyle(0xff5a2a, 0.1 + 0.06 * Math.sin(now / 260));
            g.fillEllipse(42, -28 - f * 0.5, 96, 60);
            wpoly(g, [[2, 4], [24, -38 - f], [58, -60 - f], [90, -42 - f], [64, -8], [32, 10]], 0xb83a1a, 0.9);
            wpoly(g, [[6, 2], [28, -30 - f], [58, -48 - f], [80, -36 - f], [58, -6]], c, 0.95);
            wpoly(g, [[10, 0], [32, -20 - f], [54, -30 - f], [66, -22 - f], [48, -2]], a, 0.75);
            for (let k = 0; k < 6; k++) {
                const ph = (now / 450 + k / 6) % 1;
                const px = 22 + k * 12 + Math.sin(ph * 5 + k) * 4;
                const py = -52 - f - ph * 26;
                g.fillStyle(k % 2 ? a : 0xfff0b0, 0.85 * (1 - ph));
                g.fillTriangle(px - 2.2, py + 4, px + 2.2, py + 4, px + Math.sin(now / 150 + k) * 1.4, py - 6 * (1 - ph) - 2);
            }
            g.lineStyle(2, a, 0.7 + 0.3 * Math.sin(now / 200));
            g.beginPath();
            for (let s = 0; s <= 10; s++) {
                const u = s / 10;
                const px = 6 + u * 84;
                const py = -50 - f - Math.sin(u * Math.PI) * 12 + Math.sin(u * 7 + now / 200) * 3;
                if (s === 0)
                    g.moveTo(px, py);
                else
                    g.lineTo(px, py);
            }
            g.strokePath(); // 翼缘流火
            wline(g, [[2, 4], [24, -38 - f], [58, -60 - f], [90, -42 - f]], 2, a, 0.9);
        } },
    shine: { c: 0xfff8e0, a: 0xf2c14a, draw: (g, now, flap, c, a) => {
            // 圣光：光刃翼大幅挥动 + 周期扩散光环 + 扫过的流光带
            const f = flap * 12;
            for (let k = 0; k < 2; k++) {
                const ph = (now / 1000 + k / 2) % 1;
                g.lineStyle(3 * (1 - ph) + 0.5, a, 0.45 * (1 - ph));
                g.strokeEllipse(40, -24 - f * 0.4, 70 + ph * 90, 46 + ph * 60);
            }
            wpoly(g, [[2, 4], [34, -40 - f], [70, -52 - f], [84, -34 - f], [54, 2]], c, 0.9);
            wpoly(g, [[8, 2], [36, -32 - f], [64, -42 - f], [74, -30 - f], [50, 0]], 0xffffff, 0.5);
            const sweep = (now / 1200) % 1;
            g.fillStyle(0xfff8e0, 0.16 * Math.sin(sweep * Math.PI));
            wpoly(g, [[10 + sweep * 60, 4], [26 + sweep * 60, 4], [50 + sweep * 60, -48 - f], [36 + sweep * 60, -50 - f]], 0xffffff, 0.16 * Math.sin(sweep * Math.PI));
            for (let k = 0; k < 4; k++) {
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k * 1.9));
                g.fillStyle(a, tw);
                g.fillCircle(20 + k * 18, -30 - f * 0.7 - (k % 2) * 12, 1.8);
            }
        } },
    star: { c: 0x2a2a44, a: 0xfff0b0, draw: (g, now, flap, c, a) => {
            // 星辰：夜幕星翼大幅挥动 + 嵌入的星群明灭 + 环绕星尘 + 划过的流星
            const f = flap * 12;
            wpoly(g, [[2, 4], [30, -40 - f], [64, -54 - f], [86, -38 - f], [58, -4], [30, 10]], c, 0.94);
            for (let k = 0; k < 6; k++) {
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k * 1.9));
                g.fillStyle(a, tw);
                g.fillCircle(16 + (k % 3) * 24, -30 - f * 0.6 - (k % 2) * 14, 1.8);
                g.fillRect(16 + (k % 3) * 24 - 2.4, -30 - f * 0.6 - (k % 2) * 14 - 0.6, 4.8, 1.2);
                g.fillRect(16 + (k % 3) * 24 - 0.6, -30 - f * 0.6 - (k % 2) * 14 - 2.4, 1.2, 4.8);
            }
            for (let k = 0; k < 4; k++) {
                const ang = now / 1000 + (k / 4) * Math.PI * 2;
                g.fillStyle(a, 0.8);
                g.fillCircle(44 + Math.cos(ang) * 40, -28 - f * 0.4 + Math.sin(ang) * 24, 1.6);
            }
            const ph = (now / 1400) % 1;
            const sx = 10 + ph * 70, sy = -56 - f * 0.5 + ph * 30;
            g.lineStyle(1.6, a, 0.9 * (1 - ph));
            g.lineBetween(sx, sy, sx - 13, sy + 8);
            g.fillStyle(0xffffff, 1 - ph);
            g.fillCircle(sx, sy, 1.8);
        } },
    rainbow: { c: 0xffffff, a: 0xff8ad4, draw: (g, now, flap, c, _a) => {
            // 虹翼：七彩虹带翼大幅挥动 + 色带流动 + 环绕七彩光斑
            const f = flap * 12;
            const cols = [0xff5a5a, 0xffa04a, 0xffd45c, 0x7dffc4, 0x5ac8ff, 0x8f7bff, 0xff9adf];
            wpoly(g, [[2, 4], [28, -38 - f], [60, -52 - f], [84, -38 - f], [56, -4], [30, 10]], c, 0.25);
            cols.forEach((col, k) => {
                g.lineStyle(3.4, col, 0.75);
                g.beginPath();
                for (let s = 0; s <= 10; s++) {
                    const u = s / 10;
                    const px = 6 + u * 74;
                    const py = -12 - k * 6 - f * (0.4 + u * 0.5) - Math.sin(u * 4 + now / 400 + k * 0.5) * 5;
                    if (s === 0)
                        g.moveTo(px, py);
                    else
                        g.lineTo(px, py);
                }
                g.strokePath();
            });
            for (let k = 0; k < 7; k++) {
                const ang = now / 900 + (k / 7) * Math.PI * 2;
                g.fillStyle(cols[k], 0.6 + 0.3 * Math.sin(now / 300 + k));
                g.fillCircle(44 + Math.cos(ang) * 44, -26 - f * 0.4 + Math.sin(ang) * 26, 2.4);
            }
        } },
    galaxy: { c: 0x6a4ae8, a: 0xd8c8ff, draw: (g, now, flap, _c, a) => {
            // 星河：星云翼大幅挥动 + 两条旋臂缓转 + 嵌入亮星 + 环绕星点
            const f = flap * 12;
            wpoly(g, [[2, 4], [30, -40 - f], [62, -54 - f], [86, -36 - f], [56, -2], [30, 10]], 0x2a1a5a, 0.85);
            g.fillStyle(0x8f7bff, 0.25);
            g.fillEllipse(40, -30 - f * 0.5, 70, 44);
            for (let arm = 0; arm < 2; arm++) {
                g.lineStyle(4 - arm, arm ? a : 0xc9a0ff, 0.4);
                g.beginPath();
                for (let s = 0; s <= 12; s++) {
                    const u = s / 12;
                    const ang = u * 3 + now / 1800 + arm * Math.PI;
                    const px = 42 + Math.cos(ang) * (8 + u * 40);
                    const py = -28 - f * 0.5 + Math.sin(ang) * (5 + u * 26);
                    if (s === 0)
                        g.moveTo(px, py);
                    else
                        g.lineTo(px, py);
                }
                g.strokePath();
            }
            for (let k = 0; k < 6; k++) {
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k * 1.7));
                g.fillStyle(0xffffff, tw);
                g.fillCircle(20 + (k % 3) * 22, -34 - f * 0.6 - (k % 2) * 12, 1.6);
            }
            for (let k = 0; k < 3; k++) {
                const ang = now / 800 + (k / 3) * Math.PI * 2;
                g.fillStyle(a, 0.8);
                g.fillCircle(44 + Math.cos(ang) * 44, -26 - f * 0.4 + Math.sin(ang) * 26, 2);
            }
        } },
    prism: { c: 0xe8f0ff, a: 0x8ad8ff, draw: (g, now, flap, c, a) => {
            // 棱光：棱镜翼大幅挥动 + 出射的五束彩光摆动扫射 + 彩斑
            const f = flap * 12;
            const cols = [0xff5a5a, 0xffd45c, 0x7dffc4, 0x5ac8ff, 0xff9adf];
            wpoly(g, [[2, 4], [30, -38 - f], [60, -52 - f], [80, -36 - f], [54, 2]], c, 0.4);
            wline(g, [[2, 4], [30, -38 - f], [60, -52 - f]], 1.8, a, 0.8);
            g.fillStyle(0xffffff, 0.35);
            g.fillTriangle(18, -8, 30, -8, 24, -30 - f * 0.4); // 棱镜体
            const sw = Math.sin(now / 600) * 0.22;
            cols.forEach((col, k) => {
                g.lineStyle(2.6, col, 0.6);
                g.lineBetween(24, -18 - f * 0.4, 24 + Math.cos(-1.35 + sw + k * 0.13) * 60, -18 - f * 0.4 + Math.sin(-1.35 + sw + k * 0.13) * 44);
            });
            for (let k = 0; k < 5; k++) {
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 260 + k * 1.6));
                g.fillStyle(cols[k], tw * 0.8);
                g.fillCircle(14 + k * 14, -40 - f * 0.6 - (k % 2) * 8, 2);
            }
        } },
    solaris: { c: 0xffb03a, a: 0xfff0b0, draw: (g, now, flap, c, a) => {
            // 烈阳：日轮翼大幅挥动 + 日冕呼吸 + 放射日芒缓转 + 飞散日屑
            const f = flap * 13;
            g.fillStyle(a, 0.12 + 0.06 * Math.sin(now / 380));
            g.fillCircle(44, -26 - f * 0.5, 34);
            wpoly(g, [[2, 4], [28, -38 - f], [62, -52 - f], [86, -36 - f], [56, 0], [30, 10]], c, 0.9);
            g.fillStyle(0xffe89a, 0.4);
            g.fillEllipse(44, -26 - f * 0.5, 20, 16);
            for (let k = 0; k < 8; k++) {
                const ang = (k / 8) * Math.PI * 2 + now / 2600;
                const len = 30 + Math.sin(now / 300 + k) * 5;
                g.lineStyle(2.2, k % 2 ? c : a, 0.6);
                g.lineBetween(44 + Math.cos(ang) * 16, -26 - f * 0.5 + Math.sin(ang) * 16, 44 + Math.cos(ang) * len, -26 - f * 0.5 + Math.sin(ang) * len);
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 800 + k / 4) % 1;
                g.fillStyle(0xfff0b0, 0.7 * (1 - ph));
                g.fillCircle(30 + k * 10 + Math.sin(ph * 4 + k) * 4, -50 - f * 0.6 - ph * 16, 1.6 * (1 - ph) + 0.4);
            }
        } },
    thunder: { c: 0x9fd8ff, a: 0xffe89a, draw: (g, now, flap, c, a) => {
            // 雷霆：雷翼大幅挥动 + 翼面乱窜电弧 + 翼尖炸雷 + 电离光晕
            const f = flap * 13;
            g.fillStyle(c, 0.08 + 0.06 * Math.abs(Math.sin(now / 150)));
            g.fillEllipse(42, -28 - f * 0.5, 90, 56);
            wpoly(g, [[2, 4], [28, -38 - f], [62, -54 - f], [86, -36 - f], [56, -2], [30, 10]], 0x3a4a6a, 0.9);
            wpoly(g, [[8, 2], [32, -30 - f], [58, -44 - f], [74, -32 - f], [50, 0]], 0x4a5c80, 0.6);
            for (let k = 0; k < 3; k++) {
                const a0 = now / 110 + k * 2.1;
                let px = 12 + Math.cos(a0) * 10, py = -20 - f * 0.4 + Math.sin(a0) * 12;
                for (let s = 1; s <= 4; s++) {
                    const ang = a0 + s * 0.9 + Math.sin(now / 50 + s * 3 + k) * 0.5;
                    const nx = 12 + Math.cos(ang) * (14 + s * 14);
                    const ny = -20 - f * 0.4 + Math.sin(ang) * (10 + s * 12);
                    g.lineStyle(1.8, s > 2 ? 0xffffff : c, 0.85);
                    g.lineBetween(px, py, nx, ny);
                    px = nx;
                    py = ny;
                }
            }
            const strike = Math.sin(now / 170) > 0.5;
            if (strike) {
                wline(g, [[86, -36 - f], [80, -28 - f], [88, -22 - f]], 2.4, 0xffffff, 0.95);
                wline(g, [[86, -36 - f], [80, -28 - f], [88, -22 - f]], 5, a, 0.25);
            }
            wline(g, [[2, 4], [28, -38 - f], [62, -54 - f], [86, -36 - f]], 2, c, 0.9);
        } },
    demon: { c: 0xc23bff, a: 0xff3a6a, draw: (g, now, flap, c, a) => {
            // 恶魔：蝠膜魔翼大幅挥动 + 翼骨 + 升腾紫焰 + 翼缘红光脉冲
            const f = flap * 14;
            wpoly(g, [[2, 4], [26, -36 - f], [56, -56 - f], [84, -40 - f], [60, -6], [30, 10]], c, 0.5);
            wpoly(g, [[2, 4], [26, -36 - f], [56, -56 - f], [84, -40 - f], [60, -6], [30, 10]], 0x6a1ab0, 0.35);
            wline(g, [[2, 4], [30, -30 - f], [58, -48 - f], [84, -40 - f]], 2.6, 0x3a1060, 0.95);
            wline(g, [[4, 4], [38, -18 - f], [64, -28 - f]], 2, 0x3a1060, 0.8);
            for (let k = 0; k < 5; k++) {
                const ph = (now / 500 + k / 5) % 1;
                g.fillStyle(k % 2 ? c : a, 0.7 * (1 - ph));
                g.fillCircle(24 + k * 14 + Math.sin(ph * 5 + k) * 5, -44 - f * 0.7 - ph * 22, 2.4 * (1 - ph) + 0.5);
            }
            g.lineStyle(1.6, a, 0.3 + 0.25 * Math.sin(now / 300));
            g.beginPath();
            for (let s = 0; s <= 10; s++) {
                const u = s / 10;
                const px = 6 + u * 78;
                const py = -48 - f - Math.sin(u * Math.PI) * 10;
                if (s === 0)
                    g.moveTo(px, py);
                else
                    g.lineTo(px, py);
            }
            g.strokePath();
        } },
    dragon: { c: 0x53e0a0, a: 0xffd45c, draw: (g, now, flap, c, _a) => {
            // 龙翼：鳞纹翼大幅挥动 + 骨翼架构 + 翼尖龙息 + 环绕龙焰 + 升腾火屑
            const f = flap * 15;
            wpoly(g, [[2, 4], [26, -36 - f], [58, -58 - f], [90, -40 - f], [62, -6], [32, 10]], 0x2a8a5a, 0.95);
            wpoly(g, [[8, 2], [30, -28 - f], [56, -46 - f], [76, -34 - f], [54, -2]], c, 0.9);
            g.lineStyle(1.2, 0x1a5a3a, 0.7);
            for (let k = 0; k < 3; k++) {
                g.beginPath();
                g.arc(30 + k * 16, -22 - f * 0.5 - (k % 2) * 8, 4, Math.PI * 0.15, Math.PI * 0.85);
                g.strokePath(); // 鳞弧
            }
            wline(g, [[2, 4], [30, -32 - f], [58, -52 - f], [90, -40 - f]], 2.4, 0xffd45c, 0.9); // 骨架
            for (const tx of [90, 58]) {
                g.fillStyle(0xffd45c, 0.8 + 0.2 * Math.sin(now / 140 + tx));
                g.fillTriangle(tx - 2, -40 - f, tx + 2, -40 - f, tx + Math.sin(now / 130 + tx) * 2, -50 - f - Math.sin(now / 160 + tx) * 3);
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 500 + k / 4) % 1;
                g.fillStyle(0xffd45c, 0.7 * (1 - ph));
                g.fillCircle(30 + k * 14 + Math.sin(ph * 5 + k) * 5, -50 - f * 0.7 - ph * 20, 2 * (1 - ph) + 0.4);
            }
        } },
    devilWing: { c: 0xb02a4a, a: 0x1a1420, draw: (g, now, flap, c, _a) => {
            // 魔翼：暗红蝠膜大幅挥动 + 翼刺 + 血雾上升 + 翼缘暗光脉冲
            const f = flap * 14;
            g.fillStyle(0x2a0a14, 0.25 + 0.08 * Math.sin(now / 300));
            g.fillEllipse(42, -28 - f * 0.5, 90, 58);
            wpoly(g, [[2, 4], [24, -38 - f], [54, -58 - f], [86, -42 - f], [58, -6], [30, 10]], c, 0.95);
            wpoly(g, [[8, 2], [28, -30 - f], [54, -48 - f], [72, -36 - f], [50, 0]], 0x6a1428, 0.7);
            for (let k = 0; k < 3; k++) {
                const px = 24 + k * 24;
                g.fillStyle(0x1a1420, 1);
                g.fillTriangle(px - 2.6, -46 - f * 0.8, px + 2.6, -46 - f * 0.8, px, -56 - f * 0.8 - (k === 1 ? 5 : 0)); // 翼刺
            }
            wline(g, [[2, 4], [28, -32 - f], [54, -52 - f], [86, -42 - f]], 2, 0x1a1420, 0.9);
            for (let k = 0; k < 5; k++) {
                const ph = (now / 600 + k / 5) % 1;
                g.fillStyle(0xff3a6a, 0.6 * (1 - ph));
                g.fillCircle(26 + k * 12 + Math.sin(ph * 5 + k) * 5, -44 - f * 0.7 - ph * 20, 2 * (1 - ph) + 0.4);
            }
        } },
    paper: { c: 0xfff4d6, a: 0xc9a86a, draw: (g, now, flap, c, a) => {
            // 纸翼：折纸翼大幅挥动（折面明暗）+ 盘旋的小纸飞机 + 纸屑
            const f = flap * 12;
            wpoly(g, [[2, 4], [44, -50 - f], [74, -36 - f], [50, 0]], c, 0.95);
            wpoly(g, [[2, 4], [44, -50 - f], [30, -18]], 0xf0e0b8, 0.95);
            wline(g, [[2, 4], [44, -50 - f]], 1.6, a, 0.8);
            wline(g, [[30, -18], [56, -22 - f * 0.4]], 1.2, a, 0.6);
            for (let k = 0; k < 3; k++) {
                const a0 = now / 1100 + (k / 3) * Math.PI * 2;
                g.save();
                g.translateCanvas(36 + Math.cos(a0) * 40, -26 - f * 0.5 + Math.sin(a0) * 22);
                g.rotateCanvas(now / 400 + k);
                g.fillStyle(0xffffff, 0.95);
                g.fillTriangle(0, -4, 9, 0, 0, 3); // 小纸飞机
                g.lineStyle(0.8, a, 0.7);
                g.lineBetween(0, -4, 9, 0);
                g.restore();
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 1300 + k / 4) % 1;
                g.save();
                g.translateCanvas(20 + k * 14 + Math.sin(ph * 5 + k) * 5, -40 - f * 0.6 - ph * 18);
                g.rotateCanvas(Math.sin(now / 300 + k) * 1.2);
                g.fillStyle(0xfff4d6, 0.7 * (1 - ph));
                g.fillRect(-2.4, -1.4, 4.8, 2.8);
                g.restore();
            }
        } },
    sailStar: { c: 0xffe9a8, a: 0x8f7bff, draw: (g, now, flap, c, a) => {
            // 星帆：星夜帆面大幅挥动 + 缀星明灭 + 帆骨金线 + 流星 + 缭绳摆动
            const f = flap * 13;
            wpoly(g, [[4, 8], [52, -30 - f], [68, -52 - f], [56, -40 - f], [10, 4]], 0x3a3a6a, 0.92);
            wpoly(g, [[4, 8], [56, -40 - f], [60, -14], [40, 8]], c, 0.5);
            for (let k = 0; k < 6; k++) {
                const tw = 0.5 + 0.5 * Math.sin(now / 240 + k * 2.1);
                g.fillStyle(0xfff6d8, tw);
                g.fillCircle([18, 34, 48, 58, 26, 44][k], [-10, -26 - f * 0.4, -40 - f * 0.6, -48 - f * 0.6, -18, -30 - f * 0.4][k], 1.6);
            }
            wline(g, [[4, 8], [68, -52 - f]], 2.4, c);
            wline(g, [[4, 8], [52, -30 - f]], 1.2, c, 0.7);
            const rope = Math.sin(now / 500) * 3;
            wline(g, [[68, -52 - f], [58 + rope, 8]], 1.4, a, 0.6);
            const ph = (now / 1400) % 1;
            const sx = 20 + ph * 44, sy = -50 - f + ph * 26;
            g.lineStyle(1.6, a, 0.9 * (1 - ph));
            g.lineBetween(sx, sy, sx - 12, sy + 7);
        } },
    comet: { c: 0xffe9a8, a: 0x9fe8ff, draw: (g, now, flap, c, a) => {
            // 彗尾：彗星翼大幅挥动 + 冰蓝尘尾流动 + 周期划过的小彗星 + 尘光
            const f = flap * 13;
            g.fillStyle(a, 0.1 + 0.05 * Math.sin(now / 350));
            g.fillEllipse(40, -28 - f * 0.5, 90, 54);
            wpoly(g, [[2, 4], [32, -42 - f], [68, -50 - f], [84, -32 - f], [52, 2]], c, 0.55);
            wpoly(g, [[6, 2], [34, -34 - f], [62, -42 - f], [76, -28 - f], [48, 0]], 0xffffff, 0.4);
            for (let s = 0; s < 5; s++) {
                const ph = (now / 500 + s / 5) % 1;
                const px = 80 - ph * 30, py = -38 - f * 0.6 + ph * 16 + Math.sin(ph * 6 + s) * 3;
                g.fillStyle(a, 0.7 * (1 - ph));
                g.fillCircle(px, py, 2.4 * (1 - ph) + 0.5);
            }
            const ph = (now / 1300) % 1;
            const sx = 10 + ph * 70, sy = -54 - f * 0.5 + ph * 34;
            g.fillStyle(0xffffff, 0.95 * (1 - ph * 0.4));
            g.fillCircle(sx, sy, 2.4);
            for (let s = 1; s <= 3; s++) {
                g.fillStyle(a, 0.5 * (1 - s / 3) * (1 - ph * 0.4));
                g.fillCircle(sx - s * 6, sy + s * 3.4, 1.8 - s * 0.3);
            }
        } },
    glow: { c: 0xa0ffd8, a: 0xffffff, draw: (g, now, flap, c, _a) => {
            // 流光：流光翼大幅挥动 + 翼面流光扫过 + 呼吸光晕 + 环绕光珠
            const f = flap * 12;
            g.fillStyle(c, 0.12 + 0.08 * Math.sin(now / 350));
            g.fillEllipse(40, -26 - f * 0.5, 92, 56);
            wpoly(g, [[2, 4], [30, -40 - f], [62, -52 - f], [84, -34 - f], [54, 2]], c, 0.45);
            wpoly(g, [[8, 2], [34, -32 - f], [60, -44 - f], [74, -30 - f], [50, 0]], 0xffffff, 0.3);
            const sweep = (now / 1100) % 1;
            wpoly(g, [[12 + sweep * 56, 2], [26 + sweep * 56, 2], [50 + sweep * 56, -46 - f], [38 + sweep * 56, -48 - f]], 0xffffff, 0.18 * Math.sin(sweep * Math.PI));
            for (let k = 0; k < 4; k++) {
                const ang = now / 900 + (k / 4) * Math.PI * 2;
                g.fillStyle(0xffffff, 0.7 + 0.3 * Math.sin(now / 250 + k));
                g.fillCircle(42 + Math.cos(ang) * 42, -26 - f * 0.4 + Math.sin(ang) * 26, 2);
            }
        } },
    quartz: { c: 0xd9c9ff, a: 0xffffff, draw: (g, now, flap, c, _a) => {
            // 晶簇：水晶棱面翼大幅挥动 + 晶面反光扫描 + 悬浮的小晶体绕转 + 晶尖闪
            const f = flap * 13;
            wpoly(g, [[2, 4], [30, -40 - f], [62, -54 - f], [86, -36 - f], [56, 0], [30, 10]], c, 0.55);
            wpoly(g, [[8, 2], [32, -32 - f], [58, -46 - f], [76, -32 - f], [50, 0]], 0xffffff, 0.35);
            for (let k = 0; k < 4; k++) {
                const px = 18 + k * 16, py = -34 - f * 0.6 - (k % 2) * 12;
                g.fillStyle(k % 2 ? 0xb8a0f0 : c, 0.9);
                g.fillTriangle(px - 3.4, py + 4, px + 3.4, py + 4, px, py - 12 - (k === 1 ? 5 : 0)); // 小晶柱
                const gl = 0.5 + 0.5 * Math.sin(now / 240 + k * 1.7);
                g.fillStyle(0xffffff, gl);
                g.fillTriangle(px - 1, py + 2, px + 1, py + 2, px, py - 6 - (k === 1 ? 5 : 0) * 0.4);
            }
            for (let k = 0; k < 3; k++) {
                const a0 = now / 900 + (k / 3) * Math.PI * 2;
                g.save();
                g.translateCanvas(42 + Math.cos(a0) * 46, -26 - f * 0.5 + Math.sin(a0) * 26);
                g.rotateCanvas(now / 300 + k);
                g.fillStyle(0xb8a0f0, 0.85);
                g.fillTriangle(0, -4, 3.4, 2.4, -3.4, 2.4);
                g.restore();
            }
        } },
    obsidian: { c: 0x3a3a4a, a: 0xb46cff, draw: (g, now, flap, c, a) => {
            // 黑曜：黑曜翼大幅挥动 + 紫电裂纹随机明灭 + 暗雾 + 翼缘暗紫脉冲线
            const f = flap * 14;
            g.fillStyle(0x120a20, 0.3);
            g.fillEllipse(42, -28 - f * 0.5, 92, 58);
            wpoly(g, [[2, 4], [28, -38 - f], [62, -54 - f], [86, -36 - f], [56, -2], [30, 10]], c, 0.95);
            wpoly(g, [[8, 2], [32, -30 - f], [58, -46 - f], [76, -32 - f], [50, 0]], 0x242432, 0.8);
            for (let k = 0; k < 3; k++) {
                const gl = Math.sin(now / 160 + k * 2.4);
                if (gl > 0.4) {
                    g.lineStyle(1.4, a, (gl - 0.4) * 1.4);
                    g.lineBetween(24 + k * 18, -46 - f * 0.6, 30 + k * 18, -30 - f * 0.5);
                    g.lineBetween(30 + k * 18, -30 - f * 0.5, 22 + k * 18, -12);
                }
            }
            g.lineStyle(1.6, a, 0.25 + 0.2 * Math.sin(now / 300));
            g.beginPath();
            for (let s = 0; s <= 10; s++) {
                const u = s / 10;
                const px = 6 + u * 78;
                const py = -50 - f - Math.sin(u * Math.PI) * 10;
                if (s === 0)
                    g.moveTo(px, py);
                else
                    g.lineTo(px, py);
            }
            g.strokePath();
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1200 + k / 3) % 1;
                g.fillStyle(a, 0.4 * (1 - ph));
                g.fillCircle(24 + k * 18 + Math.sin(ph * 4 + k) * 5, -40 - f * 0.6 - ph * 16, 1.8 * (1 - ph) + 0.4);
            }
        } },
    chrono: { c: 0xb46cff, a: 0xffe89a, draw: (g, now, flap, c, a) => {
            // 时空：时之翼大幅挥动 + 双环时间残影（反向转带刻度）+ 环绕时之粒 + 闪回光斑
            const f = flap * 12;
            wpoly(g, [[2, 4], [30, -40 - f], [62, -54 - f], [86, -36 - f], [56, -2], [30, 10]], c, 0.4);
            wpoly(g, [[8, 2], [34, -32 - f], [60, -46 - f], [76, -32 - f], [50, 0]], 0x8f5aff, 0.35);
            for (let k = 0; k < 2; k++) {
                const dir = k ? -1 : 1;
                g.lineStyle(1.4, k ? a : c, 0.5);
                g.beginPath();
                for (let s = 0; s <= 16; s++) {
                    const u = s / 16;
                    const ang = u * Math.PI * 1.6 + now / 900 * dir + k * 0.9;
                    const px = 42 + Math.cos(ang) * (40 + k * 10);
                    const py = -26 - f * 0.4 + Math.sin(ang) * (24 + k * 6);
                    if (s === 0)
                        g.moveTo(px, py);
                    else
                        g.lineTo(px, py);
                }
                g.strokePath();
            }
            for (let k = 0; k < 3; k++) {
                const ang = now / 500 + (k / 3) * Math.PI * 2;
                g.fillStyle(a, 0.85);
                g.fillCircle(42 + Math.cos(ang) * 52, -26 - f * 0.4 + Math.sin(ang) * 32, 2);
            }
            const fb = 0.5 + 0.5 * Math.sin(now / 400);
            g.fillStyle(0xffffff, fb * 0.2);
            g.fillCircle(30, -34 - f * 0.6, 8);
        } },
};
