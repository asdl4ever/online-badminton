import { mpoly } from './shared.js';
/** 批四主题坐骑（西游降魔 / 三国烽火）。(x, y) = 地面基准，f = 朝向。 */
export const MOUNTS_6 = {
    xyMount: { c: 0xf0ead8, a: 0xffd45c, draw: (g, now, x, y, f, c, a) => {
            // 筋斗祥云：一朵驮人的筋斗云——三团云体 + 云底金光 + 翻筋斗的转速环 + 云隙星子
            const hover = Math.sin(now / 380) * 3;
            const by = y - 16 + hover;
            g.fillStyle(0x0e1620, 0.15); // 云影
            g.fillEllipse(x, y + 1, 54, 7);
            // 三团主云（前中后错落）
            g.fillStyle(c, 0.95);
            g.fillEllipse(x - f * 12, by + 2, 26, 14);
            g.fillEllipse(x + f * 8, by - 2, 24, 16);
            g.fillEllipse(x + f * 20, by + 3, 18, 11);
            g.fillStyle(0xffffff, 0.8); // 云顶受光
            g.fillEllipse(x + f * 8, by - 6, 14, 6);
            g.fillEllipse(x - f * 12, by - 2, 12, 5);
            // 云底金光（祥云金边）
            g.lineStyle(1.6, a, 0.6 + 0.2 * Math.sin(now / 300));
            g.beginPath();
            g.moveTo(x - f * 24, by + 7);
            g.lineTo(x - f * 12, by + 9);
            g.lineTo(x + f * 2, by + 6);
            g.lineTo(x + f * 18, by + 9);
            g.lineTo(x + f * 28, by + 7);
            g.strokePath();
            // 翻筋斗的转速环（云周高速旋转的弧环，暗示一个筋斗十万八千里）
            for (let k = 0; k < 2; k++) {
                const spin = now / 140 + k * Math.PI;
                g.lineStyle(2, a, 0.5 + 0.2 * Math.sin(now / 200 + k));
                g.beginPath();
                g.arc(x + f * 2, by - 1, 22 + k * 5, spin, spin + 1.8);
                g.strokePath();
            }
            for (let k = 0; k < 4; k++) { // 云隙星子（明灭）
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 260 + k * 1.7));
                g.fillStyle(0xfff0b0, tw);
                g.fillCircle(x - 18 + k * 13, by - 12 - (k % 2) * 6, 1.4);
            }
            // 云尾流散的碎云
            for (let k = 0; k < 3; k++) {
                const ph = (now / 900 + k / 3) % 1;
                g.fillStyle(0xffffff, 0.5 * (1 - ph));
                g.fillCircle(x - f * (26 + ph * 16), by + 2 + Math.sin(ph * 4 + k) * 3, 3.4 * (1 - ph) + 0.8);
            }
        } },
    sgmMount: { c: 0x8a3a2a, a: 0xe8404a, draw: (g, now, x, y, f, c, a) => {
            // 赤兔战马：冲锋姿态的赤马——马身 + 鬃尾飞扬 + 奔跑四蹄 + 红缨鞍具
            const by = y - 24;
            g.fillStyle(0x101810, 0.25); // 落影
            g.fillEllipse(x, y + 1, 56, 8);
            // 四蹄奔跑（两前两后交错）
            for (let k = 0; k < 4; k++) {
                const front = k < 2;
                const lx = x + f * (front ? 16 - k * 8 : -14 - (k - 2) * 8);
                const sw = Math.sin(now / 200 + (k % 2) * Math.PI + (front ? 0 : 1.4)) * 5;
                g.fillStyle(0x6a2a1e, 1);
                g.fillRect(lx - 2.4, by + 8, 5, 16 - Math.abs(sw));
                g.fillStyle(0x2a1a12, 1);
                g.fillRect(lx - 3 + sw * 0.4, y - 4, 6, 4); // 蹄
            }
            g.fillStyle(c, 1); // 躯干
            g.fillEllipse(x, by, 38, 18);
            g.fillStyle(0xa84a34, 0.7); // 背部受光
            g.fillEllipse(x - f * 2, by - 5, 28, 8);
            // 颈 + 头（昂首）
            const hx = x + f * 22, hy = by - 12;
            g.fillStyle(c, 1);
            mpoly(g, [[x + f * 14, by - 4], [x + f * 19, hy - 2], [x + f * 24, hy], [x + f * 22, by + 2]], c, 1);
            g.fillEllipse(hx, hy, 13, 9);
            g.fillStyle(0x2a1a12, 1); // 耳
            g.fillTriangle(hx + f * 2, hy - 4, hx + f * 5, hy - 3, hx + f * 3, hy - 8);
            g.fillStyle(0x1a0e08, 1); // 眼
            g.fillCircle(hx + f * 4, hy - 1, 1.3);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(hx + f * 4.4, hy - 1.4, 0.5);
            g.fillStyle(0x2a1a12, 0.9); // 鼻孔喷气
            g.fillCircle(hx + f * 6.4, hy + 2.4, 0.9);
            // 红鬃（飞扬的一串鬃毛）
            for (let k = 0; k < 5; k++) {
                const u = k / 4;
                g.fillStyle(a, 0.9);
                g.fillTriangle(x + f * (10 + u * 12), by - 8 - u * 4, x + f * (14 + u * 12), by - 10 - u * 5 - Math.sin(now / 180 + k) * 2, x + f * (8 + u * 12) - f * 4, by - 6 - u * 5);
            }
            // 尾（甩动长尾）
            const tail = Math.sin(now / 260) * 5;
            g.fillStyle(a, 0.85);
            mpoly(g, [
                [x - f * 18, by - 4], [x - f * 28, by - 8 + tail], [x - f * 32, by - 2 + tail], [x - f * 24, by + 4],
            ], a, 0.85);
            // 鞍具（红缨金鞍）
            g.fillStyle(0xd9b45c, 1);
            g.fillEllipse(x - f * 3, by - 9, 12, 5);
            g.fillStyle(a, 1); // 鞍上红缨
            const tass = Math.sin(now / 240) * 1.6;
            g.fillTriangle(x - f * 6, by - 10, x - f * 2, by - 10, x - f * 4 + tass * 0.4, by - 4 + tass);
        } },
};
