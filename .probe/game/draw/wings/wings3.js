import { wpoly, wline, TAU } from './shared.js';
/** 第三批主题翅膀（火山 / 深海沟 / 剑道 / 水墨 / 精灵 / 赛车 / 吸血鬼 / 秋日 / 竹林 / 小丑） */
export const WINGS_3 = {
    vulcWingA: { c: 0xff5a1a, a: 0xffb02a, draw: (g, now, flap, c, a) => {
            // 火焰之翼：三层火焰舔上去
            const f = flap * 7;
            for (let k = 0; k < 3; k++) {
                g.fillStyle(k === 0 ? c : k === 1 ? a : 0xfff0b0, 0.85 - k * 0.15);
                wpoly(g, Array.from({ length: 7 }, (_, s) => {
                    const u = s / 6;
                    const px = 2 + u * (72 - k * 12);
                    const py = 4 - Math.sin(u * Math.PI) * (46 - k * 10) - f - Math.sin(now / 200 + k + u * 6) * 5;
                    return [px, py];
                }).concat([[74 - k * 12, 6], [2, 6]]), k === 0 ? c : k === 1 ? a : 0xfff0b0, 0.8);
            }
        } },
    vulcWingB: { c: 0x3a2a2a, a: 0xff5a1a, draw: (g, now, flap, c, a) => {
            // 熔渣之翼：黑曜石板翼 + 裂缝岩浆
            const f = flap * 5;
            wpoly(g, [[2, 6], [42, -50 - f], [80, -26 - f], [52, 6]], c, 0.95);
            g.lineStyle(2, a, 0.7 + 0.3 * Math.sin(now / 220));
            wline(g, [[10, 0], [26, -24 - f], [40, -12], [56, -34 - f]], 2, a, 0.8);
            for (let k = 0; k < 3; k++) {
                const ph = (now / 800 + k / 3) % 1;
                g.fillStyle(a, 0.8 * (1 - ph));
                g.fillCircle(24 + k * 18, -20 - f * 0.4 + ph * 20, 2 * (1 - ph) + 0.6);
            }
        } },
    trenchWingA: { c: 0x2a6a8a, a: 0x5ac8ff, draw: (g, now, flap, c, a) => {
            // 洋流之翼：波浪层叠的翼
            const f = flap * 5;
            wpoly(g, [[2, 6], [40, -48 - f], [78, -28 - f], [50, 6]], c, 0.55);
            for (let k = 0; k < 3; k++) {
                wline(g, Array.from({ length: 9 }, (_, s) => {
                    const u = s / 8;
                    return [6 + u * 66, -2 - k * 13 + Math.sin(u * 5 + now / 350 + k) * 4 - f * 0.3];
                }), 3, k % 2 ? a : 0x8ad8f0, 0.85);
            }
        } },
    trenchWingB: { c: 0x1a2a4a, a: 0x5affd8, draw: (g, now, flap, c, a) => {
            // 巨鳃之翼：鳃瓣排成的翼 + 生物荧光点
            const f = flap * 5;
            for (let k = 0; k < 6; k++) {
                const ang = -2.15 + k * 0.26;
                g.fillStyle(k % 2 ? c : 0x24365a, 0.95);
                wpoly(g, [
                    [4, 2],
                    [4 + Math.cos(ang) * 60, 2 + Math.sin(ang) * 60 - f * 0.4],
                    [4 + Math.cos(ang + 0.24) * 56, 2 + Math.sin(ang + 0.24) * 56 - f * 0.4],
                ], k % 2 ? c : 0x24365a, 0.95);
                const gl = 0.5 + 0.5 * Math.sin(now / 300 + k);
                g.fillStyle(a, gl);
                g.fillCircle(4 + Math.cos(ang + 0.1) * 40, 2 + Math.sin(ang + 0.1) * 40 - f * 0.4, 2);
            }
        } },
    dojoWingA: { c: 0xdfe6f0, a: 0x6a8ab0, draw: (g, now, flap, c, a) => {
            // 疾风之翼：几道斩击弧
            for (let k = 0; k < 3; k++) {
                const ph = (now / 500 + k / 3) % 1;
                g.lineStyle(4 - k, k === 0 ? c : a, (1 - ph) * 0.9);
                g.beginPath();
                g.arc(0, 4, 30 + k * 18 + ph * 14, -Math.PI * 0.95, -Math.PI * 0.25);
                g.strokePath();
            }
        } },
    dojoWingB: { c: 0x2a3a6a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
            // 龙魂之翼：龙鳞叠成的翼
            const f = flap * 6;
            wpoly(g, [[2, 6], [42, -50 - f], [80, -26 - f], [52, 6]], c, 0.95);
            g.fillStyle(a, 0.65);
            for (let r = 0; r < 3; r++)
                for (let k = 0; k < 4 - r; k++) {
                    g.beginPath();
                    g.arc(16 + k * 13 + r * 5, -10 - r * 11 - f * 0.3, 5.4, Math.PI, TAU, true);
                    g.fillPath();
                }
            wline(g, [[2, 6], [42, -50 - f], [80, -26 - f]], 2.2, a, 0.85);
        } },
    inkwWingA: { c: 0xf5f0e4, a: 0x8a8a92, draw: (g, now, flap, c, a) => {
            // 宣纸之翼：一张半透的宣纸
            const f = flap * 5;
            wpoly(g, [[2, 6], [40, -50 - f], [80, -30 - f], [56, 4]], c, 0.9);
            g.lineStyle(1.4, a, 0.5);
            g.strokeRect(20, -30 - f * 0.5, 34, 22); // 纸上的墨框
            g.fillStyle(a, 0.85);
            g.fillCircle(37, -19 - f * 0.5, 5); // 墨点
            wpoly(g, [[2, 6], [40, -50 - f], [80, -30 - f]], 0xe8e0d0, 0.5);
        } },
    inkwWingB: { c: 0x2a2a30, a: 0xf5f0e4, draw: (g, now, flap, c, a) => {
            // 墨鹤之翼：浓墨挥就的鹤翅
            const f = flap * 7;
            wpoly(g, [[2, 4], [46, -44 - f], [82, -20 - f], [60, 0], [30, -8]], c, 0.92);
            for (let k = 0; k < 4; k++) {
                const u = k / 4;
                wline(g, [[10 + u * 40, -6 - u * 18], [30 + u * 44, -30 - f + u * 18]], 3 - k * 0.5, c, 0.7); // 飞白
            }
            g.fillStyle(a, 0.9);
            g.fillCircle(10, 0, 2.6); // 鹤顶红
        } },
    fairyWingA: { c: 0xffb7d5, a: 0x9effd0, draw: (g, now, flap, c, a) => {
            // 蝶翼：两瓣圆翅 + 翅脉
            const f = flap * 8;
            g.fillStyle(c, 0.85);
            g.fillEllipse(26, -30 - f, 46, 40);
            g.fillEllipse(46, -10 - f * 0.4, 34, 28);
            g.fillStyle(a, 0.4);
            g.fillEllipse(24, -32 - f, 24, 20);
            g.lineStyle(1.4, 0xffffff, 0.7);
            g.lineBetween(2, 0, 34, -40 - f);
            g.lineBetween(2, 0, 56, -12 - f * 0.4);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(34, -34 - f, 3); // 翅斑
        } },
    fairyWingB: { c: 0xdff6ff, a: 0xffe89a, draw: (g, now, flap, c, a) => {
            // 光尘之翼：一圈光尘聚成的翼
            for (let k = 0; k < 14; k++) {
                const ang = -2.2 + (k / 14) * 2.1;
                const r = 30 + Math.sin(now / 500 + k * 2.4) * 14 + k * 3;
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 260 + k));
                g.fillStyle(k % 3 ? c : a, tw);
                g.fillCircle(4 + Math.cos(ang) * r, 0 + Math.sin(ang) * r, 2.6 * tw + 1);
            }
        } },
    racerWingA: { c: 0xe83a3a, a: 0x22222a, draw: (g, now, flap, c, a) => {
            // 尾翼：赛车尾翼板
            const f = flap * 3;
            g.save();
            g.translateCanvas(4, -4);
            g.rotateCanvas(-0.5 + f * 0.02);
            g.fillStyle(c, 1);
            g.fillRect(0, -8, 70, 14);
            g.fillStyle(a, 0.9);
            g.fillRect(0, -8, 70, 4);
            g.fillStyle(0xdfe6f0, 0.9);
            g.fillRect(6, 6, 8, 12);
            g.fillRect(56, 6, 8, 12); // 支柱
            g.restore();
        } },
    racerWingB: { c: 0x22222a, a: 0xe83a3a, draw: (g, now, flap, c, a) => {
            // 涡轮之翼：两只旋转的涡轮
            for (let k = 0; k < 2; k++) {
                const px = 28 + k * 32, py = -22 - k * 14;
                g.fillStyle(c, 0.95);
                g.fillCircle(px, py, 15 - k * 2);
                g.fillStyle(0x3a3a44, 0.9);
                g.fillCircle(px, py, 11 - k * 2);
                g.lineStyle(2.4, a, 0.95);
                for (let s = 0; s < 5; s++) {
                    const ang = now / 80 + (s / 5) * TAU;
                    g.lineBetween(px + Math.cos(ang) * 3, py + Math.sin(ang) * 3, px + Math.cos(ang + 0.8) * (10 - k * 2), py + Math.sin(ang + 0.8) * (10 - k * 2));
                }
            }
        } },
    vampWingA: { c: 0x2a1a2a, a: 0x8a1a2a, draw: (g, now, flap, c, a) => {
            // 蝠翼：窄长的黑膜
            const f = flap * 9;
            wpoly(g, [[2, 4], [34, -44 - f], [46, -12], [66, -34 - f * 0.7], [70, -2], [84, -16 - f * 0.4], [52, 8]], c, 0.96);
            g.lineStyle(1.8, a, 0.8);
            g.lineBetween(2, 4, 34, -44 - f);
            g.lineBetween(34, -44 - f, 46, -12);
            g.lineBetween(46, -12, 66, -34 - f * 0.7);
        } },
    vampWingB: { c: 0x1a1420, a: 0xc8ccd8, draw: (g, now, flap, c, a) => {
            // 暗影之翼：影子一样的翼 + 银边
            const f = flap * 7;
            for (let k = 0; k < 2; k++) {
                wpoly(g, [[2 + k * 4, 4], [36 - k * 6, -50 - f + k * 10], [78 - k * 10, -22 - f * 0.6 + k * 8], [48 + k * 6, 6]], c, 0.5 - k * 0.18);
            }
            g.lineStyle(1.4, a, 0.7);
            g.lineBetween(2, 4, 36, -50 - f);
            g.lineBetween(36, -50 - f, 78, -22 - f * 0.6);
        } },
    autumnWingA: { c: 0xc95a2a, a: 0xd88a2a, draw: (g, now, flap, c, a) => {
            // 红叶之翼：枫叶排成的翼
            const f = flap * 6;
            wline(g, [[2, 4], [40, -40 - f], [72, -22 - f]], 2.6, 0x8a5a2a);
            for (let k = 0; k < 5; k++) {
                const px = 14 + k * 14, py = -12 - k * 8 - f * 0.4;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(Math.sin(now / 600 + k) * 0.2 - 0.6);
                for (let s = 0; s < 5; s++) {
                    const ang = (s / 5) * TAU;
                    wpoly(g, [[0, 0], [Math.cos(ang) * 10 - 3, Math.sin(ang) * 10], [Math.cos(ang) * 10 + 3, Math.sin(ang) * 10]], k % 2 ? c : a, 0.95);
                }
                g.restore();
            }
        } },
    autumnWingB: { c: 0xd88a2a, a: 0x8a5a2a, draw: (g, now, flap, c, a) => {
            // 丰收之翼：麦穗编成的翼
            const f = flap * 5;
            wline(g, [[2, 4], [34, -40 - f], [72, -24 - f]], 3, a);
            for (let k = 0; k < 3; k++) {
                for (let s = 0; s < 5; s++) {
                    const u = s / 5;
                    const bx = 8 + k * 20 + u * 14, by = -6 - k * 10 - u * 24 - f * 0.4;
                    g.fillStyle(k % 2 ? c : 0xffd45c, 0.95);
                    g.fillEllipse(bx, by - 3, 3.4, 7);
                    g.fillEllipse(bx, by + 3, 3.4, 7);
                }
            }
        } },
    pandaWingA: { c: 0x7aa84a, a: 0x5a8a3a, draw: (g, now, flap, c, a) => {
            // 竹叶之翼：层层竹叶
            const f = flap * 6;
            for (let k = 0; k < 6; k++) {
                const ang = -2.0 + k * 0.28;
                g.save();
                g.translateCanvas(4, 2);
                g.rotateCanvas(ang + Math.PI / 2 + Math.sin(now / 700 + k) * 0.05);
                wpoly(g, [[-4, -8], [4, -8], [3, -40], [0, -48], [-3, -40]], k % 2 ? c : a, 0.95);
                g.restore();
            }
        } },
    pandaWingB: { c: 0x4a9a7a, a: 0x2a2a2a, draw: (g, now, flap, c, a) => {
            // 竹节之翼：两根粗竹节作翼骨
            const f = flap * 5;
            for (let k = 0; k < 2; k++) {
                const ang = -1.9 + k * 0.6;
                g.save();
                g.translateCanvas(4, 2);
                g.rotateCanvas(ang + Math.PI / 2 + f * 0.02);
                g.fillStyle(c, 1);
                g.fillRoundedRect(-5, -8, 10, 52 - k * 8, 4);
                g.fillStyle(a, 0.85);
                g.fillRect(-5, -8 + 16, 10, 3);
                g.fillRect(-5, -8 + 34, 10, 3); // 竹节
                g.fillStyle(0xffffff, 0.35);
                g.fillRect(-5, -8, 3, 52 - k * 8);
                g.restore();
            }
        } },
    jokerWingA: { c: 0xf0f0f0, a: 0xe83a5a, draw: (g, now, flap, c, a) => {
            // 纸牌之翼：一串张开的扑克牌
            const f = flap * 4;
            for (let k = 0; k < 5; k++) {
                g.save();
                g.translateCanvas(6 + k * 12, -6 - k * 10 - f * 0.4);
                g.rotateCanvas(-1.1 + k * 0.24);
                g.fillStyle(c, 0.97);
                g.fillRoundedRect(-7, -12, 14, 24, 2);
                g.lineStyle(1, 0x8a8a92, 0.6);
                g.strokeRect(-7, -12, 14, 24);
                g.fillStyle(k % 2 ? a : 0x22222a, 0.9);
                g.fillCircle(0, 0, 3.4);
                g.restore();
            }
        } },
    jokerWingB: { c: 0xe83a5a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
            // 小丑之翼：两撮翘起的小丑假发毛
            const f = flap * 7;
            for (let k = 0; k < 5; k++) {
                const ang = -2.3 + k * 0.4 + Math.sin(now / 300 + k) * 0.06;
                g.fillStyle([c, a, 0x4ac8ff, 0x9effd0, 0xffffff][k], 0.95);
                g.fillCircle(6 + Math.cos(ang) * 26, 0 + Math.sin(ang) * 26 - f * 0.3, 10 - k * 0.8);
                g.fillStyle(0xffffff, 0.4);
                g.fillCircle(6 + Math.cos(ang) * 26 - 3, 0 + Math.sin(ang) * 26 - f * 0.3 - 3, 3.4);
            }
        } },
};
