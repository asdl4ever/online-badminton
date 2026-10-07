import { hpoly, TAU } from './shared.js';
/** 批四主题头饰（西游降魔 / 三国烽火） */
export const HATS_7 = {
    xyHatA: { c: 0xd9b45c, a: 0xfff0b0, draw: (g, now, x, hy, c, a) => {
            // 紧箍：额上金箍——双箍环 + 刻符 + 收紧时的符文明灭
            g.fillStyle(c, 1);
            g.fillRect(x - 14, hy - 3, 28, 6);
            g.fillStyle(0xb8943a, 0.8);
            g.fillRect(x - 14, hy + 1, 28, 2);
            for (let k = 0; k < 5; k++) { // 箍身刻符（明灭如念咒）
                const gl = 0.35 + 0.5 * Math.abs(Math.sin(now / 420 + k * 1.5));
                g.fillStyle(a, gl);
                g.fillRect(x - 10 + k * 5, hy - 2, 2.4, 3.2);
            }
            for (const s of [-1, 1]) { // 箍侧搭扣
                g.fillStyle(0xb8943a, 1);
                g.fillCircle(x + s * 14, hy, 2);
            }
            const gl = 0.3 + 0.3 * Math.sin(now / 350); // 箍沿泛光
            g.lineStyle(1, a, gl + 0.3);
            g.strokeRect(x - 14, hy - 3, 28, 6);
        } },
    xyHatB: { c: 0x8a5a2a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 凤翅紫金冠：紫金冠体 + 前突金冠缨 + 双长雉鸡翎（随节奏摆动）
            g.fillStyle(c, 1); // 冠体
            g.beginPath();
            g.arc(x, hy + 2, 13, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 13, hy + 2, 26, 5);
            g.fillStyle(0xb8875a, 0.6); // 冠面受光
            g.fillEllipse(x - 4, hy - 4, 10, 6);
            g.fillStyle(a, 0.95); // 冠前金突
            hpoly(g, [[x - 4, hy - 8], [x, hy - 16], [x + 4, hy - 8]], a);
            g.fillStyle(0xfff0b0, 0.8);
            g.fillCircle(x, hy - 14, 1.4);
            for (const s of [-1, 1]) { // 双雉鸡翎（长翎，节纹 + 摆动）
                const sway = Math.sin(now / 380 + (s > 0 ? 0 : 1.2)) * 4;
                const bx = x + s * 9;
                g.lineStyle(2.2, 0x2f6a3a, 1);
                g.beginPath();
                g.moveTo(bx, hy - 6);
                g.lineTo(bx + s * 6 + sway, hy - 24);
                g.lineTo(bx + s * 10 + sway * 1.6, hy - 42);
                g.strokePath();
                for (let k = 0; k < 4; k++) { // 翎上卵斑
                    const u = (k + 1) / 5;
                    g.fillStyle(0xffd45c, 0.9);
                    g.fillEllipse(bx + s * (6 + 4 * u) + sway * (1 + u * 0.6), hy - 8 - u * 34, 2.6, 1.8);
                }
            }
        } },
    sgmHatA: { c: 0xe8404a, a: 0x8a2a30, draw: (g, now, x, hy, c, _a) => {
            // 赤帻：战士的红色头巾——巾体 + 额前结带 + 双飘带（随节奏甩）
            g.fillStyle(c, 1);
            g.fillRect(x - 15, hy - 3, 30, 7);
            g.fillStyle(0xb83038, 0.7); // 巾上褶皱
            g.fillRect(x - 15, hy - 1, 30, 1.6);
            g.fillStyle(c, 1); // 额前结
            g.fillCircle(x, hy + 1, 3.4);
            g.fillStyle(0xfff0b0, 0.7);
            g.fillCircle(x - 0.8, hy + 0.2, 1);
            for (const s of [-1, 1]) { // 飘带（向脑后甩）
                const flap = Math.sin(now / 300 + (s > 0 ? 0 : 1)) * 2.4;
                hpoly(g, [[x + s * 8, hy - 1], [x + s * 20, hy - 5 + flap], [x + s * 24, hy - 1 + flap], [x + s * 12, hy + 2]], s > 0 ? c : 0xb83038, 0.95);
            }
        } },
    sgmHatB: { c: 0xd9b45c, a: 0xe8404a, draw: (g, now, x, hy, c, a) => {
            // 凤翅兜鍪：将盔——盔体 + 前冲盔枪 + 双凤翅护板 + 盔缨
            g.fillStyle(c, 1); // 盔体
            g.beginPath();
            g.arc(x, hy + 2, 15, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 15, hy + 2, 30, 5);
            g.fillStyle(0xb8943a, 0.7); // 盔面受光
            g.fillEllipse(x - 5, hy - 5, 12, 7);
            g.lineStyle(1.2, 0x8a6a2a, 0.8); // 盔接缝
            g.lineBetween(x, hy - 14, x, hy - 2);
            g.fillStyle(a, 1); // 盔缨（顶红单簇）
            for (let k = -1; k <= 1; k++) {
                g.fillEllipse(x + k * 2.4, hy - 17 + Math.sin(now / 300 + k) * 1.2, 2, 6);
            }
            g.fillStyle(0xfff0b0, 0.9); // 盔枪
            g.fillCircle(x, hy - 20, 1.8);
            for (const s of [-1, 1]) { // 双凤翅护板（上翘的翼形铜板）
                const flap = Math.sin(now / 320 + (s > 0 ? 0 : 1)) * 1.2;
                hpoly(g, [
                    [x + s * 10, hy + 1], [x + s * 20, hy - 8 + flap], [x + s * 23, hy - 2 + flap], [x + s * 14, hy + 4],
                ], s > 0 ? c : 0xb8943a, 0.95);
                g.fillStyle(a, 0.85); // 翅缘红漆
                g.lineStyle(1.4, a, 0.8);
                g.lineBetween(x + s * 14, hy + 3, x + s * 22, hy - 4 + flap);
            }
        } },
};
