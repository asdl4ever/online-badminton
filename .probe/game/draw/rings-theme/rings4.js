import { TAU } from './shared.js';
/** 批三主题地环（光之巨人 / 怪兽之王）。(x, feetY) 原点，地面基准 y = feetY - 3。 */
export const RINGS_4 = {
    otmRing: { c: 0x9fd8ff, a: 0xff4a5c, draw: (g, now, x, feetY, c, a) => {
            // 光之印记：脚下发光的能量印记环——双环 + 计时核心 + 旋转符点
            const ry = feetY - 3;
            const p1 = 0.5 + 0.5 * Math.sin(now / 380);
            g.fillStyle(c, 0.16 + p1 * 0.06);
            g.fillEllipse(x, ry, 54, 16);
            g.lineStyle(2.4, c, 0.75);
            g.strokeEllipse(x, ry, 48, 14);
            g.lineStyle(1.2, 0xffffff, 0.5);
            g.strokeEllipse(x, ry, 32, 9);
            const core = 0.5 + 0.5 * Math.sin(now / 300); // 环心计时核心（蓝↔红）
            g.fillStyle(core > 0.7 ? a : c, 0.3 + core * 0.2);
            g.fillEllipse(x, ry, 12, 4);
            g.fillStyle(core > 0.7 ? a : 0xdff2ff, 0.95);
            g.fillEllipse(x, ry, 6, 2.2);
            for (let k = 0; k < 6; k++) { // 旋转符点（沿外环转）
                const ang = now / 900 + (k / 6) * TAU;
                const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 6.4;
                g.fillStyle(k % 2 ? a : 0xffffff, 0.85);
                g.fillRect(px - 1.4, py - 0.5, 2.8, 1);
                g.fillRect(px - 0.5, py - 1.4, 1, 2.8);
            }
            for (let k = 0; k < 4; k++) { // 上浮光尘
                const ph = (now / 1000 + k / 4) % 1;
                g.fillStyle(0xffffff, 0.6 * (1 - ph));
                g.fillCircle(x - 14 + k * 10 + Math.sin(ph * 4 + k) * 3, ry - ph * 26, 1.3 * (1 - ph) + 0.4);
            }
        } },
    kjuRing: { c: 0x8ae86a, a: 0xff5a5a, draw: (g, now, x, feetY, c, a) => {
            // 踏痕地环：兽王踏出的龟裂焦土——裂纹 + 三趾爪印 + 辐射尘点
            const ry = feetY - 3;
            g.fillStyle(0x101810, 0.5); // 焦土底
            g.fillEllipse(x, ry, 56, 17);
            g.lineStyle(1.6, 0x2f4530, 0.8);
            g.strokeEllipse(x, ry, 52, 15);
            for (let k = 0; k < 6; k++) { // 放射裂纹
                const ang = (k / 6) * TAU + 0.26;
                g.lineStyle(1.4, 0x101810, 0.7);
                g.beginPath();
                let px = x + Math.cos(ang) * 10, py = ry + Math.sin(ang) * 3.4;
                g.moveTo(px, py);
                for (let s = 1; s <= 2; s++) {
                    px = x + Math.cos(ang + Math.sin(now / 600 + k) * 0.1) * (10 + s * 9);
                    py = ry + Math.sin(ang) * (3.4 + s * 3);
                    g.lineTo(px, py);
                }
                g.strokePath();
            }
            g.fillStyle(0x2f4530, 0.9); // 中央三趾爪印
            for (let k = -1; k <= 1; k++) {
                g.fillEllipse(x + k * 7, ry - Math.abs(k) * 1.2, 6, 2.6);
            }
            for (let k = 0; k < 5; k++) { // 辐射尘点（明灭上浮）
                const ph = (now / 1100 + k / 5) % 1;
                const bl = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k * 1.8));
                g.fillStyle(k % 2 ? c : a, bl * (1 - ph));
                g.fillCircle(x - 18 + k * 9, ry - 2 - ph * 22, 1.4 * (1 - ph) + 0.4);
            }
            for (const s of [-1, 1]) { // 环缘警示灯
                const bl = Math.abs(Math.sin(now / 300 + (s > 0 ? 0 : Math.PI / 2)));
                g.fillStyle(s > 0 ? a : c, bl);
                g.fillCircle(x + s * 23, ry - 1, 1.7);
            }
        } },
};
