import { TAU, mpoly } from './shared.js';
/** 批八主题坐骑（敦煌飞天 / 羽蛇神殿 / 圣辉天界）。(x, y) = 地面基准，f = 朝向。 */
export const MOUNTS_10 = {
    dunMount: { c: 0xffb0c8, a: 0xffd45c, draw: (g, now, x, y, f, _c, a) => {
            // 祥云莲台：浮空的莲花祥云台——莲台 + 托举祥云 + 绕台飘带 + 落花
            const hover = Math.sin(now / 380) * 3;
            const by = y - 16 + hover;
            g.fillStyle(0x0e1620, 0.12);
            g.fillEllipse(x, y + 1, 50, 7);
            // 托举祥云（台下的云）
            g.fillStyle(0xf0e8f8, 0.9);
            g.fillEllipse(x - f * 10, by + 10, 22, 9);
            g.fillEllipse(x + f * 10, by + 11, 20, 8);
            g.fillEllipse(x, by + 12, 16, 7);
            // 莲台（两层莲瓣台座）
            g.fillStyle(0xff9adf, 0.95);
            g.fillEllipse(x, by + 2, 44, 12);
            for (let k = 0; k < 7; k++) { // 外层莲瓣
                const ang = (k / 7) * TAU;
                const px = x + Math.cos(ang) * 19, py = by + 2 + Math.sin(ang) * 5;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(ang + Math.PI / 2);
                g.fillStyle(k % 2 ? 0xffb0c8 : 0xff9adf, 0.95);
                g.fillEllipse(0, 0, 8, 3.6);
                g.restore();
            }
            g.fillStyle(0xffd0e0, 0.95); // 内层台面
            g.fillEllipse(x, by - 3, 34, 9);
            g.fillStyle(0xfff0f4, 0.7);
            g.fillEllipse(x - f * 3, by - 5, 20, 5);
            // 台上金莲心
            g.fillStyle(a, 0.9);
            g.fillCircle(x, by - 6, 4);
            g.fillStyle(0xfff6d8, 0.8);
            g.fillCircle(x - 1, by - 7, 1.4);
            // 绕台飘带（两根环绕的彩带）
            for (let k = 0; k < 2; k++) {
                g.lineStyle(1.6, k ? 0xff9adf : 0xffd45c, 0.7);
                g.beginPath();
                for (let s = 0; s <= 12; s++) {
                    const u = s / 12;
                    const ang = u * TAU + now / 900 + k * Math.PI;
                    const px = x + Math.cos(ang) * (26 + Math.sin(u * 6 + now / 300) * 2);
                    const py = by - 4 + Math.sin(ang) * 8 - u * 6;
                    if (s === 0)
                        g.moveTo(px, py);
                    else
                        g.lineTo(px, py);
                }
                g.strokePath();
            }
            // 落花
            for (let k = 0; k < 4; k++) {
                const ph = (now / 1400 + k / 4) % 1;
                g.fillStyle(k % 2 ? a : 0xffb0c8, 0.6 * (1 - ph));
                g.fillEllipse(x - 20 + ph * 40 + Math.sin(ph * 5 + k) * 4, by - 10 - (1 - ph) * 14, 3, 1.6);
            }
        } },
    aztMount: { c: 0xd9b45c, a: 0x3ad49a, draw: (g, now, x, y, f, c, a) => {
            // 翡翠美洲豹：镶翡翠的金豹——豹身奔姿 + 翡翠斑 + 羽冠 + 尾卷
            const by = y - 20;
            g.fillStyle(0x0e2418, 0.25);
            g.fillEllipse(x, y + 1, 54, 8);
            // 四足奔跑
            for (let k = 0; k < 4; k++) {
                const front = k < 2;
                const lx = x + f * (front ? 15 - (k % 2) * 8 : -13 - (k % 2) * 8);
                const sw = Math.sin(now / 200 + (k % 2) * Math.PI + (front ? 0 : 1.3)) * 5;
                g.fillStyle(0xb8943a, 1);
                g.fillRect(lx - 2.2, by + 7, 4.4, 14 - Math.abs(sw));
                g.fillStyle(0x0e2418, 1);
                g.fillRect(lx - 2.6 + sw * 0.4, y - 3, 5.2, 3.4);
            }
            g.fillStyle(c, 1); // 躯干
            g.fillEllipse(x, by, 36, 18);
            g.fillStyle(0xc09a40, 0.7);
            g.fillEllipse(x - f * 2, by - 5, 26, 8);
            // 翡翠斑（豹斑换翡翠方块）
            g.fillStyle(a, 0.9);
            for (let k = 0; k < 5; k++) {
                const px = x - 10 + k * 5, py = by - 5 + Math.sin(k * 2.2) * 4;
                g.fillRect(px - 1.4, py - 1.4, 2.8, 2.8);
            }
            // 头（豹首 + 咧口獠牙）
            const hx = x + f * 21, hy = by - 6;
            g.fillStyle(c, 1);
            g.fillEllipse(hx, hy, 16, 13);
            g.fillStyle(0xb8943a, 0.8); // 吻
            g.fillEllipse(hx + f * 7, hy + 3, 8, 6);
            g.fillStyle(0x0e2418, 1);
            g.fillCircle(hx + f * 10, hy + 2, 1.1);
            g.fillStyle(0xfff0d8, 1); // 獠牙
            g.fillTriangle(hx + f * 8, hy + 5, hx + f * 10.4, hy + 5, hx + f * 9.2, hy + 8.4);
            g.fillStyle(0x1a0e08, 1); // 眼
            g.fillCircle(hx + f * 4, hy - 2, 1.4);
            g.fillStyle(0x3ad49a, 0.9); // 翡翠眼
            g.fillCircle(hx + f * 4.2, hy - 2, 0.7);
            for (const s of [-1, 1]) { // 双耳
                g.fillStyle(c, 1);
                g.fillTriangle(hx + f * (s > 0 ? 2 : -4), hy - 5, hx + f * (s > 0 ? 5 : -1), hy - 4, hx + f * (s > 0 ? 3.4 : -2.4), hy - 10);
            }
            // 羽冠（头顶绿羽三根）
            for (let k = -1; k <= 1; k++) {
                g.fillStyle(a, 0.95);
                g.fillTriangle(hx + f * 1 + k * 3, hy - 8, hx + f * 3 + k * 3, hy - 8, hx + f * 2 + k * 3.4, hy - 15 + Math.abs(k) * 3);
            }
            // 卷尾（末端卷成环）
            const tail = Math.sin(now / 250) * 4;
            g.fillStyle(0xb8943a, 1);
            g.fillEllipse(x - f * 20, by - 4 + tail, 12, 6);
            g.lineStyle(2.6, c, 1);
            g.beginPath();
            g.arc(x - f * 23, by - 4 + tail, 4.4, 0.4, Math.PI * 1.6);
            g.strokePath();
            // 背鞍（翡翠鞍）
            g.fillStyle(a, 0.85);
            g.fillEllipse(x - f * 3, by - 9, 14, 6);
            g.fillStyle(0xffd45c, 0.9);
            g.fillCircle(x - f * 3, by - 10, 1.6);
        } },
    angMount: { c: 0xfff6d8, a: 0xffd45c, draw: (g, now, x, y, f, c, a) => {
            // 圣光翼马：飞行的白马——马身 + 展开双翼 + 光蹄 + 鬃毛流光
            const fly = Math.sin(now / 380) * 3;
            const by = y - 26 + fly;
            g.fillStyle(0x22222e, 0.15);
            g.fillEllipse(x, y + 1, 52, 8);
            // 双翼（上下扇动的白翼）
            for (let k = 0; k < 2; k++) {
                const flap = Math.sin(now / 260 + k * Math.PI) * 0.5;
                g.save();
                g.translateCanvas(x - f * 2, by - 8);
                g.rotateCanvas((k ? 1 : -1) * (0.5 + flap) - Math.PI / 2 * (k ? -1 : 1) * 0 + (k ? -0.4 : 0.4));
                g.fillStyle(0xf0e8d8, 0.9);
                for (let s = 0; s < 4; s++) { // 翼羽四根
                    g.fillEllipse(s * 7 - 4, -8, 10, 4.4);
                }
                g.fillStyle(0xffffff, 0.8);
                g.fillEllipse(6, -8, 12, 4);
                g.restore();
            }
            // 四腿（飞行收拢姿态）
            for (let k = 0; k < 4; k++) {
                const front = k < 2;
                const lx = x + f * (front ? 14 - (k % 2) * 7 : -12 - (k % 2) * 7);
                g.fillStyle(0xe8e0d0, 1);
                g.fillRect(lx - 2, by + 6, 4, 12 + (front ? 2 : 0));
                g.fillStyle(a, 0.8); // 光蹄
                g.fillEllipse(lx, y - 8 + Math.sin(now / 200 + k) * 2, 5.4, 2.4);
            }
            g.fillStyle(c, 1); // 躯干
            g.fillEllipse(x, by, 38, 18);
            g.fillStyle(0xffffff, 0.8);
            g.fillEllipse(x - f * 2, by - 5, 26, 8);
            // 颈 + 头
            const hx = x + f * 22, hy = by - 12;
            g.fillStyle(c, 1);
            mpoly(g, [[x + f * 14, by - 4], [x + f * 20, hy - 2], [x + f * 25, hy], [x + f * 22, by + 2]], c, 1);
            g.fillEllipse(hx, hy, 14, 10);
            g.fillStyle(0x2a2430, 1);
            g.fillTriangle(hx + f * 1, hy - 4, hx + f * 4, hy - 3, hx + f * 2, hy - 9);
            g.fillStyle(0x1a0e08, 1);
            g.fillCircle(hx + f * 4.4, hy - 1, 1.2);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(hx + f * 4.8, hy - 1.4, 0.5);
            // 金色鬃（流光鬃毛）
            for (let k = 0; k < 5; k++) {
                const u = k / 4;
                g.fillStyle(k % 2 ? a : 0xfff0b0, 0.95);
                g.fillTriangle(x + f * (9 + u * 13), by - 9 - u * 4, x + f * (13 + u * 13), by - 11 - u * 5 - Math.sin(now / 200 + k) * 2, x + f * (7 + u * 13) - f * 4, by - 7 - u * 5);
            }
            // 额前金角（独角兽角 + 光）
            g.fillStyle(a, 0.95);
            g.fillTriangle(hx + f * 3, hy - 8, hx + f * 6, hy - 8, hx + f * 4.4, hy - 18);
            g.fillStyle(0xffffff, 0.5 + 0.4 * Math.sin(now / 250));
            g.fillCircle(hx + f * 4.4, hy - 18, 1.8);
            // 尾（流光尾）
            const tail = Math.sin(now / 240) * 5;
            g.fillStyle(0xfff0b0, 0.95);
            mpoly(g, [
                [x - f * 19, by - 4], [x - f * 30, by - 8 + tail], [x - f * 33, by - 1 + tail], [x - f * 24, by + 4],
            ], 0xfff0b0, 0.95);
        } },
};
