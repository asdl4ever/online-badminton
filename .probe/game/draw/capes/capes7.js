import { cpoly, cline } from './shared.js';
/** 新批次主题披风（上古神话 / 重装机甲）。从 (0,0) 肩锚垂到 y≈80。 */
export const CAPES_7 = {
    shnCapeA: { c: 0xffb0d8, a: 0xffd45c, draw: (g, now, sway, c, a) => {
            // 补天霞帔：双层霞色纱帔 + 云纹 + 环佩
            cpoly(g, [[-16, 0], [16, 0], [22 + sway, 52], [12 + sway * 1.2, 78], [-8 + sway, 74], [-20 + sway * 0.7, 46]], c, 0.55);
            cpoly(g, [[-9, 0], [9, 0], [13 + sway, 48], [4 + sway, 70], [-11 + sway * 0.8, 52]], 0xffe4f0, 0.5);
            cline(g, [[-16, 0], [-20 + sway * 0.7, 46]], 1.4, a, 0.6);
            cline(g, [[16, 0], [22 + sway, 52]], 1.4, a, 0.6);
            for (let k = 0; k < 4; k++) { // 云纹
                const cy = 16 + k * 15;
                g.lineStyle(1.4, a, 0.5);
                g.beginPath();
                g.arc(-6 + sway * (0.3 + k * 0.1), cy, 5 - k * 0.6, Math.PI * 0.9, Math.PI * 1.9);
                g.strokePath();
            }
            for (let k = 0; k < 3; k++) { // 环佩
                const ph = Math.sin(now / 400 + k);
                g.fillStyle(0xffd45c, 0.9);
                g.fillCircle(-10 + k * 10 + sway * 0.5 + ph, 58 + (k % 2) * 8, 1.8);
            }
        } },
    shnCapeB: { c: 0xc9a84a, a: 0xd93a5a, draw: (g, now, sway, c, a) => {
            // 山河社稷披：锦缎旗披 + 山河纹 + 日月徽 + 流苏
            cpoly(g, [[-16, 0], [16, 0], [22 + sway, 54], [12 + sway * 1.2, 80], [-9 + sway, 76], [-20 + sway * 0.7, 48]], c, 0.95);
            g.fillStyle(0x2a4a6a, 0.6); // 山
            cpoly(g, [[-14 + sway * 0.6, 46], [-6 + sway * 0.7, 26], [2 + sway * 0.8, 46]], 0x2a4a6a, 0.7);
            cpoly(g, [[2 + sway * 0.8, 46], [10 + sway, 30], [18 + sway, 48]], 0x2a4a6a, 0.7);
            g.fillStyle(0xffe89a, 0.9);
            g.fillCircle(10 + sway, 20, 4.4); // 日
            g.fillStyle(0xdfe8f5, 0.85);
            g.fillCircle(-8 + sway * 0.8, 16, 3.4); // 月
            cline(g, [[-20 + sway * 0.7, 48], [-9 + sway, 76]], 2, a, 0.75);
            cline(g, [[22 + sway, 54], [12 + sway * 1.2, 80]], 2, a, 0.75);
            for (let k = 0; k < 3; k++) { // 流苏
                const ph = Math.sin(now / 350 + k) * 1.6;
                cline(g, [[-12 + k * 12 + sway * 0.9, 74], [-12 + k * 12 + sway + ph, 84]], 1.6, a, 0.8);
            }
        } },
    mcaCapeA: { c: 0x2a3a5a, a: 0x5ac8ff, draw: (g, now, sway, c, a) => {
            // 能量披挂：硬质能量裙甲 + 发光管槽 + 过载闪烁
            cpoly(g, [[-15, 0], [15, 0], [20 + sway, 50], [10 + sway * 1.2, 74], [-8 + sway, 70], [-19 + sway * 0.7, 44]], c, 0.95);
            for (let k = 0; k < 3; k++) { // 能量管槽
                const gl = 0.5 + 0.5 * Math.sin(now / 240 + k * 2);
                cline(g, [[-12 + k * 12, 6], [-9 + k * 12 + sway * (0.3 + k * 0.1), 64]], 2.4, a, 0.4 + gl * 0.4);
            }
            cline(g, [[-15, 0], [-19 + sway * 0.7, 44]], 1.6, 0x8a94a2, 0.8);
            cline(g, [[15, 0], [20 + sway, 50]], 1.6, 0x8a94a2, 0.8);
            for (let k = 0; k < 4; k++) { // 装甲块
                g.fillStyle(0x39424e, 0.95);
                g.fillRect(-13 + k * 7 + sway * (0.3 + k * 0.08), 14 + k * 3, 6, 8);
            }
            const ol = Math.abs(Math.sin(now / 350)); // 过载闪烁
            g.fillStyle(a, ol * 0.5);
            g.fillRect(-15, 0, 30, 2.4);
        } },
    mcaCapeB: { c: 0x4a5a3a, a: 0x9eff3a, draw: (g, now, sway, c, a) => {
            // 战术迷彩甲：迷彩块披甲 + 战术织带 + 纳米修复扫描线
            cpoly(g, [[-15, 0], [15, 0], [21 + sway, 52], [11 + sway * 1.2, 76], [-8 + sway, 72], [-19 + sway * 0.7, 46]], c, 0.95);
            for (let k = 0; k < 6; k++) { // 迷彩块
                g.fillStyle(k % 2 ? 0x3a4a2c : 0x5a6a46, 0.9);
                const px = -14 + (k % 3) * 11 + sway * (0.3 + (k % 3) * 0.1);
                const py = 10 + Math.floor(k / 3) * 22;
                cpoly(g, [[px, py], [px + 10, py + 2], [px + 8, py + 12], [px - 2, py + 10]], k % 2 ? 0x3a4a2c : 0x5a6a46, 0.9);
            }
            cline(g, [[-15, 8], [15, 8]], 2.4, 0x2a2f22, 0.9); // 战术织带
            g.fillStyle(0x2a2f22, 0.9);
            g.fillRect(-3, 6, 6, 5);
            const scan = (now / 1200) % 1; // 纳米修复扫描线
            g.fillStyle(a, 0.25 * Math.sin(scan * Math.PI));
            g.fillRect(-16 + sway * 0.3, 10 + scan * 60, 32 + sway * 0.5, 3);
        } },
};
