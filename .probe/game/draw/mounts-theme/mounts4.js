import { mpoly } from './shared.js';
/** 新批次主题坐骑（上古神话 / 重装机甲）。(x, y) = 地面基准，f = 朝向。 */
export const MOUNTS_4 = {
    shnMount: { c: 0xe8b84a, a: 0xd93a5a, draw: (g, now, x, y, f, c, a) => {
            // 祥龙古辇：一条金龙拉着云辇（龙身游动 + 辇盖悬浮 + 云雾）
            const swim = Math.sin(now / 400) * 3;
            // 云辇（在身后）
            const lx = x - f * 26;
            g.fillStyle(0xd8c8a0, 0.95);
            g.fillEllipse(lx, y - 18, 30, 14);
            g.fillStyle(a, 0.95); // 辇盖
            g.fillEllipse(lx, y - 34 + swim * 0.4, 34, 9);
            g.fillStyle(0xffe89a, 0.9);
            g.fillEllipse(lx, y - 36 + swim * 0.4, 20, 4);
            g.lineStyle(2, 0x8a6a2a, 1); // 辇柱
            g.lineBetween(lx - 8, y - 20, lx - 8, y - 32);
            g.lineBetween(lx + 8, y - 20, lx + 8, y - 32);
            // 云雾
            g.fillStyle(0xffffff, 0.5);
            g.fillCircle(lx - 14, y - 8, 7);
            g.fillCircle(lx + 12, y - 9, 8);
            g.fillCircle(lx, y - 6, 6);
            // 金龙（在前面拉）：蛇形三段 + 龙头 + 角 + 爪
            for (let k = 3; k >= 1; k--) {
                const bx = x + f * (12 + k * 12) - f * 8;
                const by = y - 16 - Math.sin(now / 350 + k * 1.1) * 4 - k * 2;
                g.fillStyle(k % 2 ? c : 0xc9a04a, 1);
                g.fillCircle(bx, by, 9 - k * 1.4);
                g.fillStyle(0x8a6a1a, 0.7);
                g.fillCircle(bx, by + 3, 5 - k);
            }
            const hx = x + f * 20, hy = y - 26 - Math.sin(now / 350) * 4;
            g.fillStyle(c, 1);
            g.fillEllipse(hx, hy, 15, 11);
            g.fillStyle(0xd93a5a, 1); // 龙鬃
            for (let k = -1; k <= 1; k++) {
                g.fillTriangle(hx - f * 6 + k * 3, hy - 4, hx - f * 9 + k * 3, hy - 2, hx - f * 8 + k * 4, hy - 8 - Math.sin(now / 120 + k) * 2);
            }
            g.fillStyle(0xd9b45c, 1); // 双角
            for (const s of [-1, 1]) {
                mpoly(g, [[hx + s * 3, hy - 5], [hx + s * 6, hy - 14], [hx + s * 8, hy - 6]], 0xd9b45c, 0.95);
            }
            g.fillStyle(0x1a1a22, 1);
            g.fillCircle(hx + f * 5, hy - 2, 1.8);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(hx + f * 5.6, hy - 2.6, 0.6);
            g.fillStyle(0xd9b45c, 0.9); // 龙须
            g.lineStyle(1.2, 0xd9b45c, 0.8);
            g.lineBetween(hx + f * 7, hy + 2, hx + f * 12, hy + 5 + Math.sin(now / 250) * 2);
            // 龙爪扒地
            for (const s of [-1, 1]) {
                g.fillStyle(0xc9a04a, 1);
                g.fillTriangle(hx + s * 5, y - 6, hx + s * 9, y - 6, hx + s * 7, y - 1);
            }
        } },
    mcaMount: { c: 0x6a7686, a: 0x5ac8ff, draw: (g, now, x, y, f, c, a) => {
            // 悬浮装甲车：反重力悬浮艇——艇身 + 座舱罩 + 双悬浮喷口 + 炮塔
            const hover = Math.sin(now / 350) * 2.4;
            const by = y - 12 + hover;
            g.fillStyle(0x0e1620, 0.2); // 悬浮影
            g.fillEllipse(x, y + 1, 60, 8);
            g.fillStyle(c, 1); // 艇身
            mpoly(g, [[x - f * 34, by + 4], [x - f * 24, by - 6], [x + f * 18, by - 8], [x + f * 34, by + 1], [x + f * 26, by + 7], [x - f * 26, by + 8]], c, 1);
            g.fillStyle(0x8a94a2, 0.8); // 装甲板
            mpoly(g, [[x - f * 20, by - 4], [x + f * 10, by - 6], [x + f * 14, by - 1], [x - f * 16, by + 1]], 0x8a94a2, 0.6);
            g.fillStyle(0x22303e, 1); // 座舱罩
            g.fillEllipse(x + f * 8, by - 9, 18, 9);
            g.fillStyle(a, 0.5 + 0.2 * Math.sin(now / 300));
            g.fillEllipse(x + f * 8, by - 10, 12, 5);
            for (const s of [-1, 1]) { // 双悬浮喷口
                const px = x + s * 20;
                g.fillStyle(0x39424e, 1);
                g.fillEllipse(px, by + 9, 12, 5);
                const jet = 7 + Math.abs(Math.sin(now / 90 + s)) * 5;
                g.fillStyle(0x7fd4ff, 0.7);
                g.fillTriangle(px - 3.4, by + 11, px + 3.4, by + 11, px + Math.sin(now / 110 + s) * 1.4, by + 11 + jet);
                g.fillStyle(0xffffff, 0.8);
                g.fillCircle(px, by + 11.4, 1.4);
            }
            g.lineStyle(3, 0x39424e, 1); // 炮塔
            g.lineBetween(x - f * 4, by - 10, x + f * 14, by - 15);
            g.fillStyle(0x39424e, 1);
            g.fillCircle(x - f * 6, by - 10, 4);
            const bl = Math.abs(Math.sin(now / 250)); // 航行灯
            g.fillStyle(0xff5a5a, bl);
            g.fillCircle(x - f * 30, by + 2, 1.6);
            g.fillStyle(0x7dffc4, Math.abs(Math.cos(now / 250)));
            g.fillCircle(x + f * 30, by + 2, 1.6);
        } },
};
