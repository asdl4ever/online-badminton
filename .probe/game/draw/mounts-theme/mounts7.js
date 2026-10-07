import { mpoly } from './shared.js';
/** 批五主题坐骑（武侠江湖 / 北欧神域）。(x, y) = 地面基准，f = 朝向。 */
export const MOUNTS_7 = {
    wxMount: { c: 0x8ac85a, a: 0xd9b45c, draw: (g, now, x, y, f, c, _a) => {
            // 竹叶轻舟：脚下的一叶轻舟——舟身 + 竹篙 + 船头灯笼 + 水波
            const rock = Math.sin(now / 600) * 1.6;
            const by = y - 8 + rock;
            g.fillStyle(0x0e1620, 0.15);
            g.fillEllipse(x, y + 2, 56, 8);
            for (let k = 0; k < 2; k++) {
                const ph = (now / 1100 + k / 2) % 1;
                g.lineStyle(1.4, 0xbfe8f0, 0.5 * (1 - ph));
                g.strokeEllipse(x, y + 2, 44 + ph * 18, 9 + ph * 3);
            }
            g.fillStyle(0x6a4a2a, 1);
            mpoly(g, [
                [x - f * 30, by - 2], [x - f * 22, by + 6], [x + f * 20, by + 6], [x + f * 30, by - 3],
                [x + f * 24, by - 6], [x - f * 24, by - 6],
            ], 0x6a4a2a, 1);
            g.fillStyle(0x8a6a3a, 0.8);
            g.fillRect(x - f * 24, by - 7, f * 48, 2.4);
            g.lineStyle(1, 0x4a3420, 0.8);
            for (let k = 0; k < 4; k++)
                g.lineBetween(x - f * 16 + k * f * 10, by - 5, x - f * 16 + k * f * 10, by + 5);
            const lx = x + f * 24, fire = 0.6 + 0.4 * Math.sin(now / 240);
            g.lineStyle(1.2, 0x4a3420, 1);
            g.lineBetween(lx, by - 6, lx, by - 14);
            g.fillStyle(0xe8404a, 0.9);
            g.fillRoundedRect(lx - 3.4, by - 20, 6.8, 8, 2.4);
            g.fillStyle(0xffe15c, fire);
            g.fillEllipse(lx, by - 16, 3.4, 4.4);
            g.fillStyle(0xd9b45c, 0.8);
            g.fillRect(lx - 3.4, by - 21, 6.8, 1.4);
            g.fillRect(lx - 3.4, by - 12.6, 6.8, 1.4);
            g.save();
            g.translateCanvas(x - f * 10, by);
            g.rotateCanvas(0.24 + Math.sin(now / 700) * 0.03);
            g.fillStyle(0x8ac85a, 1);
            g.fillRect(-1.6, -30, 3.2, 44);
            for (let k = 0; k < 3; k++)
                g.fillRect(-1.6, -22 + k * 12, 3.2, 1.4);
            g.restore();
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1600 + k / 3) % 1;
                g.fillStyle(c, 0.6 * (1 - ph));
                g.fillEllipse(x - f * 20 + ph * f * 30, by - 14 - (1 - ph) * 12, 3.4, 1.6);
            }
        } },
    norseMount: { c: 0xd8d0c0, a: 0x7fd4ff, draw: (g, now, x, y, f, c, a) => {
            // 八足神驹：奥丁的斯莱普尼尔——马身 + 八条奔腿（两层错相）+ 雪白鬃尾 + 蹄下生风
            const by = y - 26;
            g.fillStyle(0x101810, 0.25);
            g.fillEllipse(x, y + 1, 60, 8);
            for (let k = 0; k < 8; k++) {
                const front = k < 4;
                const layer = k % 2;
                const lx = x + f * (front ? 18 - (k % 4) * 6 : -16 - (k % 4) * 6);
                const sw = Math.sin(now / 220 + (k % 4) * Math.PI / 2 + layer * 1.2) * 6;
                g.fillStyle(layer ? 0xb8b0a0 : 0xd8d0c0, 1);
                g.fillRect(lx - 2.2, by + 8 + layer * 2, 4.4, 16 - Math.abs(sw));
                g.fillStyle(0x2a2420, 1);
                g.fillRect(lx - 2.8 + sw * 0.4, y - 3, 5.6, 3.4);
            }
            g.fillStyle(c, 1);
            g.fillEllipse(x, by, 40, 19);
            g.fillStyle(0xf0ead8, 0.7);
            g.fillEllipse(x - f * 2, by - 5, 28, 8);
            const hx = x + f * 24, hy = by - 13;
            g.fillStyle(c, 1);
            mpoly(g, [[x + f * 14, by - 4], [x + f * 20, hy - 2], [x + f * 25, hy], [x + f * 22, by + 2]], c, 1);
            g.fillEllipse(hx, hy, 13, 9);
            g.fillStyle(0x2a2420, 1);
            g.fillTriangle(hx + f * 1, hy - 4, hx + f * 4, hy - 3, hx + f * 2, hy - 9);
            g.fillStyle(0x1a0e08, 1);
            g.fillCircle(hx + f * 4.4, hy - 1, 1.3);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(hx + f * 4.8, hy - 1.4, 0.5);
            for (let k = 0; k < 5; k++) {
                const u = k / 4;
                g.fillStyle(0xf0f4fa, 0.95);
                g.fillTriangle(x + f * (9 + u * 13), by - 9 - u * 4, x + f * (13 + u * 13), by - 11 - u * 5 - Math.sin(now / 170 + k) * 2.4, x + f * (7 + u * 13) - f * 4, by - 7 - u * 5);
            }
            const tail = Math.sin(now / 240) * 6;
            g.fillStyle(0xf0f4fa, 0.95);
            mpoly(g, [
                [x - f * 19, by - 5], [x - f * 30, by - 9 + tail], [x - f * 34, by - 2 + tail], [x - f * 25, by + 4],
            ], 0xf0f4fa, 0.95);
            // 鞍毯（冰蓝纹章毯）
            g.fillStyle(a, 0.75);
            g.fillEllipse(x - f * 3, by - 9, 14, 6);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(x - f * 3, by - 10, 1.8);
            // 蹄下生风（奔跑时扬起的小风团）
            for (let k = 0; k < 3; k++) {
                const ph = (now / 300 + k / 3) % 1;
                g.fillStyle(0xffffff, 0.4 * (1 - ph));
                g.fillCircle(x - f * (20 + ph * 14), y - 3 - ph * 4, 2.6 * (1 - ph) + 0.6);
            }
        } },
};
