import { mpoly } from './shared.js';
/** 批十一主题坐骑（软泥秘境 / 妖猫夜行 / 甲虫王朝）——(x, y) = 地面基准 */
export const MOUNTS_13 = {
    slimeMount: { c: 0x9aff7a, a: 0xd0ff9a, draw: (g, now, x, y, f, c, _a) => {
            // 果冻鲸：圆滚滚的果冻巨鲸伏在地上，呼吸起伏 + 尾鳍拍地 + 喷水柱
            const breathe = Math.sin(now / 480) * 2.2;
            const by = y - 22 + breathe * 0.5;
            g.fillStyle(c, 0.82); // 鲸身（果冻半透明）
            g.fillEllipse(x, by, 58, 30);
            g.fillStyle(0xffffff, 0.3); // 果冻高光
            g.fillEllipse(x - 10 * f, by - 9, 20, 9);
            g.fillStyle(c, 0.6); // 尾鳍（拍地）
            const slap = Math.sin(now / 480) * 6;
            mpoly(g, [
                [x - 26 * f, by + 6], [x - 38 * f, by + 14 + slap], [x - 44 * f, by + 8 + slap], [x - 30 * f, by - 2],
            ], 0x7de87d, 0.7);
            g.fillStyle(0x5ac8ff, 0.85); // 背喷水柱
            const spout = 10 + Math.sin(now / 480) * 4;
            g.fillRect(x + 8 * f - 2, by - 16 - spout, 4, spout + 6);
            g.fillStyle(0xbfe8ff, 0.7); // 水柱顶花
            g.fillCircle(x + 8 * f, by - 16 - spout, 3.4);
            g.fillCircle(x + 8 * f - 3, by - 12 - spout, 2.2);
            g.fillCircle(x + 8 * f + 3, by - 12 - spout, 2.2);
            g.fillStyle(0x1a2a34, 1); // 眼
            g.fillCircle(x + 20 * f, by - 4, 2.6);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(x + 20 * f - 0.8, by - 4.8, 0.9);
            g.lineStyle(2, 0x5ac8ff, 0.6); // 嘴缝
            g.beginPath();
            g.moveTo(x + 22 * f, by + 4);
            g.lineTo(x + 12 * f, by + 7);
            g.strokePath();
            for (let k = 0; k < 3; k++) { // 体内游走小泡
                const ph = now / 800 + k * 2;
                g.fillStyle(0xffffff, 0.4);
                g.fillCircle(x + Math.sin(ph) * 14 * f, by + Math.cos(ph * 1.3) * 7, 1.6);
            }
            g.fillStyle(0x000000, 0.12); // 影
            g.fillEllipse(x, y + 2, 56, 9);
        } },
    nekMount: { c: 0xb08aff, a: 0xffd45c, draw: (g, now, x, y, f, c, a) => {
            // 云雾猫灵：踩着云团的巨大猫灵，四足踏云、双尾摇摆、眯眼灵光
            const bob = Math.sin(now / 420) * 3;
            const by = y - 26 + bob;
            g.fillStyle(0xe8e0f8, 0.85); // 云团（几团圆云叠成）
            for (const [dx, dy, r] of [[-24, 6, 12], [-6, 9, 14], [14, 7, 12], [26, 9, 9], [0, 2, 16]]) {
                g.fillCircle(x + dx * f, y - 4 + dy * 0.3 + Math.sin(now / 500 + dx) * 1.4, r);
            }
            g.fillStyle(c, 0.92); // 猫躯干
            g.fillEllipse(x, by + 4, 46, 24);
            g.fillStyle(c, 0.92); // 胸头
            g.fillCircle(x + 20 * f, by - 8, 13);
            for (const s of [-1, 1]) { // 双耳
                mpoly(g, [
                    [x + 20 * f + s * 8, by - 16], [x + 20 * f + s * 12, by - 26], [x + 20 * f + s * 2, by - 19],
                ], c, 0.92);
            }
            g.lineStyle(2, a, 0.9); // 眯眼灵光（两道弯月）
            for (const s of [-1, 1]) {
                g.beginPath();
                g.arc(x + 20 * f + s * 5, by - 9, 3, 0.2, Math.PI - 0.2);
                g.strokePath();
            }
            g.fillStyle(0xff8ad4, 0.8); // 妖鼻
            g.fillCircle(x + 20 * f, by - 5, 1.4);
            g.lineStyle(4.4, c, 0.92); // 双尾（前后摆动）
            for (let k = 0; k < 2; k++) {
                const sway = Math.sin(now / 380 + k * 2.4) * 8;
                g.beginPath();
                g.moveTo(x - 20 * f, by + k * 3);
                g.lineTo(x - 30 * f, by - 8 + sway * 0.5 - k * 4);
                g.lineTo(x - 36 * f, by - 18 + sway - k * 8);
                g.strokePath();
            }
            for (const s of [0, 1]) { // 前后腿踏云
                const step = Math.sin(now / 300 + s * Math.PI) * 3;
                g.fillStyle(c, 0.9);
                g.fillRect(x + (s ? -14 : 14) * f - 4, by + 12, 8, 10 + step);
            }
            g.fillStyle(a, 0.5); // 云下妖光
            g.fillEllipse(x, y + 2, 60, 8);
            for (let k = 0; k < 4; k++) { // 环绕妖火
                const ph = now / 600 + k * 1.7;
                g.fillStyle(0xd0b0ff, 0.6);
                g.fillCircle(x + Math.cos(ph) * 40 * f, by + Math.sin(ph) * 10, 2.4);
            }
        } },
    btlMount: { c: 0x3a5a2a, a: 0xc8a832, draw: (g, now, x, y, f, c, a) => {
            // 巨甲虫战驹：六足金背巨虫，鞘翅开合、独角前指、触角轻颤
            const by = y - 24;
            const walk = Math.sin(now / 260);
            g.lineStyle(3.4, 0x2a1c0a, 1); // 六足（两组交替）
            for (let k = 0; k < 3; k++) {
                for (const side of [0, 1]) {
                    const ph = walk + k * 2.1 + side * Math.PI;
                    const lx = x + (k - 1) * 14 * f;
                    g.beginPath();
                    g.moveTo(lx, by + 8);
                    g.lineTo(lx + Math.sin(ph) * 5 * f, by + 16);
                    g.lineTo(lx + Math.sin(ph) * 8 * f, y);
                    g.strokePath();
                }
            }
            g.fillStyle(c, 0.95); // 虫腹
            g.fillEllipse(x, by + 6, 52, 22);
            const open = (Math.sin(now / 900) * 0.5 + 0.5) * 8; // 鞘翅开合
            g.fillStyle(a, 0.9); // 金鞘翅（左右）
            mpoly(g, [
                [x, by - 4], [x - 26 * f, by - 6 - open * 0.4], [x - 30 * f, by + 4 + open], [x - 4 * f, by + 8],
            ], a, 0.9);
            mpoly(g, [
                [x, by - 4], [x + 6 * f, by - 6 - open * 0.4], [x + 10 * f, by + 4 + open], [x - 2 * f, by + 8],
            ], 0x8a6a2a, 0.9);
            g.lineStyle(1.2, 0x5a4a1a, 0.7); // 鞘翅纹路
            g.lineBetween(x - 8 * f, by - 2, x - 24 * f, by + 2 + open * 0.5);
            g.lineBetween(x + 2 * f, by - 2, x + 6 * f, by + 2 + open * 0.5);
            g.fillStyle(0x2a1c0a, 1); // 头胸
            g.fillCircle(x + 24 * f, by - 2, 9);
            g.fillStyle(a, 1); // 独角（前指微扬）
            mpoly(g, [
                [x + 28 * f, by - 6], [x + 46 * f, by - 16], [x + 44 * f, by - 10], [x + 30 * f, by - 2],
            ], a, 1);
            g.lineStyle(2, 0x2a1c0a, 1); // 触角（梢球轻颤）
            for (const s of [-1, 1]) {
                const ant = Math.sin(now / 240 + s) * 2;
                g.beginPath();
                g.moveTo(x + 26 * f, by - 8);
                g.lineTo(x + 30 * f + ant, by - 18);
                g.strokePath();
                g.fillStyle(a, 0.9);
                g.fillCircle(x + 30 * f + ant, by - 19, 2);
            }
            g.fillStyle(0xffd45c, 0.8); // 眼
            g.fillCircle(x + 27 * f, by - 4, 1.8);
            g.fillStyle(0x000000, 0.12); // 影
            g.fillEllipse(x, y + 2, 56, 8);
        } },
};
