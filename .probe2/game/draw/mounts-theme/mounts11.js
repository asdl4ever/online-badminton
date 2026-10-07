import { TAU, mpoly } from './shared.js';
/** 批九主题坐骑（童话王国 / 深夜食堂 / 猫咖物语）。(x, y) = 地面基准，f = 朝向。 */
export const MOUNTS_11 = {
    taleMount: { c: 0xffffff, a: 0xff9adf, draw: (g, now, x, y, f, c, a) => {
            // 独角兽：童话独角兽——白马 + 独角 + 彩鬃 + 星光蹄
            const by = y - 24;
            g.fillStyle(0x221830, 0.15);
            g.fillEllipse(x, y + 1, 54, 8);
            // 四足（轻快小跑）
            for (let k = 0; k < 4; k++) {
                const front = k < 2;
                const lx = x + f * (front ? 15 - (k % 2) * 7 : -13 - (k % 2) * 7);
                const sw = Math.sin(now / 220 + (k % 2) * Math.PI + (front ? 0 : 1.2)) * 4;
                g.fillStyle(0xf0e8f0, 1);
                g.fillRect(lx - 2.2, by + 7, 4.4, 15 - Math.abs(sw));
                g.fillStyle(a, 0.7); // 星光蹄
                g.fillEllipse(lx + sw * 0.4, y - 3, 5, 2.4);
            }
            g.fillStyle(c, 1); // 躯干
            g.fillEllipse(x, by, 38, 18);
            g.fillStyle(0xfff0f8, 0.8);
            g.fillEllipse(x - f * 2, by - 5, 26, 8);
            // 颈 + 头
            const hx = x + f * 22, hy = by - 12;
            g.fillStyle(c, 1);
            mpoly(g, [[x + f * 14, by - 4], [x + f * 20, hy - 2], [x + f * 25, hy], [x + f * 22, by + 2]], c, 1);
            g.fillEllipse(hx, hy, 14, 10);
            g.fillStyle(0x2a1a30, 1);
            g.fillTriangle(hx + f * 1, hy - 4, hx + f * 4, hy - 3, hx + f * 2, hy - 8);
            g.fillStyle(0x1a0e18, 1);
            g.fillCircle(hx + f * 4.4, hy - 1, 1.3);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(hx + f * 4.8, hy - 1.4, 0.5);
            // 金角（螺旋独角 + 星光）
            g.fillStyle(a, 0.95);
            g.fillTriangle(hx + f * 3, hy - 8, hx + f * 6, hy - 8, hx + f * 4.4, hy - 20);
            g.lineStyle(0.8, 0xffffff, 0.7); // 角上螺旋纹
            g.lineBetween(hx + f * 4, hy - 10, hx + f * 4.8, hy - 14);
            g.lineBetween(hx + f * 4.4, hy - 14, hx + f * 4.4, hy - 17);
            const gl = 0.5 + 0.5 * Math.sin(now / 250); // 角尖星芒
            g.fillStyle(0xffffff, gl);
            g.fillCircle(hx + f * 4.4, hy - 20, 1.8);
            // 彩鬃（粉紫蓝三段渐变鬃）
            const maneCols = [0xff9adf, 0x9b5cff, 0x5ac8ff];
            for (let k = 0; k < 6; k++) {
                const u = k / 5;
                g.fillStyle(maneCols[k % 3], 0.95);
                g.fillTriangle(x + f * (9 + u * 13), by - 9 - u * 4, x + f * (13 + u * 13), by - 11 - u * 5 - Math.sin(now / 200 + k) * 2, x + f * (7 + u * 13) - f * 4, by - 7 - u * 5);
            }
            // 尾（彩尾）
            const tail = Math.sin(now / 240) * 5;
            for (let k = 0; k < 3; k++) {
                g.fillStyle(maneCols[k], 0.9);
                g.fillEllipse(x - f * (22 + k * 4), by - 4 + tail * (1 - k * 0.2), 10, 5 - k);
            }
        } },
    dinMount: { c: 0x39424e, a: 0xffd45c, draw: (g, now, x, y, f, c, a) => {
            // 外送单车：车把挂灯笼的深夜外送单车——双轮 + 车架 + 保温箱 + 前灯
            const roll = now / 90;
            const by = y - 16;
            g.fillStyle(0x161008, 0.2);
            g.fillEllipse(x, y + 1, 56, 8);
            // 双轮（辐条转）
            for (const wx of [x - f * 16, x + f * 16]) {
                g.lineStyle(2.4, 0x22303e, 1);
                g.strokeCircle(wx, y - 9, 9);
                g.lineStyle(1, 0x39424e, 0.9);
                for (let k = 0; k < 6; k++) {
                    const ang = roll + (k / 6) * TAU;
                    g.lineBetween(wx, y - 9, wx + Math.cos(ang) * 8, y - 9 + Math.sin(ang) * 8);
                }
            }
            // 车架
            g.lineStyle(2.6, c, 1);
            g.lineBetween(x - f * 16, y - 9, x - f * 2, by - 2);
            g.lineBetween(x - f * 2, by - 2, x + f * 14, y - 9);
            g.lineBetween(x - f * 2, by - 2, x - f * 4, by + 2);
            g.lineBetween(x + f * 14, y - 9, x + f * 12, by + 2);
            g.lineBetween(x - f * 4, by + 2, x + f * 12, by + 2);
            // 车把 + 座
            g.lineStyle(2.4, 0x22303e, 1);
            g.lineBetween(x + f * 14, y - 9, x + f * 16, by - 6);
            g.lineBetween(x + f * 11, by - 6, x + f * 20, by - 6);
            g.fillStyle(0x1a1a22, 1);
            g.fillRoundedRect(x - f * 6, by - 6, f * 7, 4, 2);
            // 后座保温箱
            g.fillStyle(0xd8453a, 1);
            g.fillRoundedRect(x - f * 18, by - 16, f * 13, 13, 3);
            g.fillStyle(0xfff6d8, 0.9);
            g.fillRect(x - f * 13, by - 11, f * 3, f * 3.4);
            g.fillStyle(0xb8382e, 0.8);
            g.fillRect(x - f * 18, by - 16, f * 13, 3);
            // 前灯（暖光照路）
            g.fillStyle(a, 0.95);
            g.fillCircle(x + f * 16, by - 4, 2.4);
            g.fillStyle(a, 0.15);
            mpoly(g, [[x + f * 18, by - 5], [x + f * 44, by - 13], [x + f * 44, by + 5], [x + f * 18, by - 3]], a, 0.13);
            // 车把挂的小灯笼（摇曳）
            const sway = Math.sin(now / 300) * 1.6;
            g.fillStyle(0xe8404a, 0.95);
            g.fillEllipse(x + f * 18 + sway * 0.4, by + 2, 6, 8);
            g.fillStyle(0xffb84a, 0.7 + 0.3 * Math.sin(now / 240));
            g.fillEllipse(x + f * 18 + sway * 0.4, by + 2, 3.4, 4.6);
            // 骑行扬尘
            for (let k = 0; k < 3; k++) {
                const ph = (now / 400 + k / 3) % 1;
                g.fillStyle(0x8a7a5a, 0.35 * (1 - ph));
                g.fillCircle(x - f * (20 + ph * 12), y - 2 - ph * 4, 2 * (1 - ph) + 0.5);
            }
        } },
    catMount: { c: 0xe8a050, a: 0xffd8a8, draw: (g, now, x, y, f, c, a) => {
            // 巨型橘猫：慵懒迈步的大橘猫——胖身 + 条纹 + 甩尾 + 眯眼
            const by = y - 22;
            g.fillStyle(0x1a1410, 0.2);
            g.fillEllipse(x, y + 1, 60, 9);
            // 四只短腿（慢步）
            for (let k = 0; k < 4; k++) {
                const front = k < 2;
                const lx = x + f * (front ? 16 - (k % 2) * 8 : -14 - (k % 2) * 8);
                const sw = Math.sin(now / 260 + (k % 2) * Math.PI + (front ? 0 : 1.3)) * 3;
                g.fillStyle(0xd88a40, 1);
                g.fillRect(lx - 2.6, by + 8, 5.2, 14 - Math.abs(sw));
                g.fillStyle(0xc07830, 1);
                g.fillRect(lx - 3 + sw * 0.4, y - 4, 6, 4);
            }
            g.fillStyle(c, 1); // 胖躯干
            g.fillEllipse(x, by, 46, 24);
            g.fillStyle(0xffb870, 0.7);
            g.fillEllipse(x - f * 2, by - 6, 32, 10);
            // 虎条纹（橘猫条纹）
            g.fillStyle(0xc07830, 0.85);
            for (let k = 0; k < 4; k++) {
                g.fillRect(x - 14 + k * 8, by - 10, 3, 7);
            }
            // 头（圆大脑袋 + 眯眼 + 三角耳 + 白吻）
            const hx = x + f * 24, hy = by - 10;
            g.fillStyle(c, 1);
            g.fillCircle(hx, hy, 14);
            g.fillStyle(0xffd8a8, 0.9); // 白吻
            g.fillEllipse(hx + f * 5, hy + 4, 10, 7);
            for (const s of [-1, 1]) { // 三角耳（内耳粉）
                g.fillStyle(c, 1);
                g.fillTriangle(hx + s * 6, hy - 10, hx + s * 11, hy - 6, hx + s * 4, hy - 13);
                g.fillStyle(0xffb0c8, 0.9);
                g.fillTriangle(hx + s * 6.4, hy - 9, hx + s * 9.4, hy - 6.4, hx + s * 5.4, hy - 10.4);
            }
            // 眯眼（一条弧线，满足感）
            g.lineStyle(1.6, 0x1a1410, 0.95);
            g.beginPath();
            g.arc(hx + f * 3, hy - 2, 2.4, Math.PI * 1.15, Math.PI * 1.85);
            g.strokePath();
            g.beginPath();
            g.arc(hx + f * 9, hy - 2, 2.4, Math.PI * 1.15, Math.PI * 1.85);
            g.strokePath();
            g.fillStyle(0x1a1410, 1); // 鼻 + 胡须
            g.fillTriangle(hx + f * 7, hy + 2, hx + f * 8.4, hy + 2, hx + f * 7.7, hy + 3.4);
            g.lineStyle(0.9, 0xffffff, 0.8);
            for (const s of [-1, 1]) {
                g.lineBetween(hx + f * 6, hy + 4, hx + f * 12, hy + 3 + s * 2);
                g.lineBetween(hx + f * 6, hy + 5, hx + f * 12, hy + 5 + s * 2);
            }
            // 长尾（高高翘起甩动的尾巴）
            const tail = Math.sin(now / 280) * 6;
            g.lineStyle(5, c, 1);
            g.beginPath();
            g.moveTo(x - f * 22, by + 2);
            g.lineTo(x - f * 30, by - 8 + tail);
            g.lineTo(x - f * 33, by - 16 + tail);
            g.strokePath();
            g.fillStyle(0xd88a40, 0.9); // 尾尖深色
            g.fillCircle(x - f * 33, by - 16 + tail, 2.6);
            // 背上小鞍垫（坐垫）
            g.fillStyle(a, 0.85);
            g.fillEllipse(x - f * 2, by - 11, 16, 7);
            g.fillStyle(0xffb0c8, 0.9);
            g.fillCircle(x - f * 2, by - 12, 2);
            // 脚边毛絮
            for (let k = 0; k < 3; k++) {
                const ph = (now / 900 + k / 3) % 1;
                g.fillStyle(0xffd8a8, 0.35 * (1 - ph));
                g.fillCircle(x - f * (18 + ph * 10), y - 3 - ph * 4, 1.6 * (1 - ph) + 0.5);
            }
        } },
};
