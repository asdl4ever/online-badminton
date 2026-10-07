import { TAU } from './shared.js';
/** 批四主题地环（西游降魔 / 三国烽火）。(x, feetY) 原点，地面基准 y = feetY - 3。 */
export const RINGS_5 = {
    xyRing: { c: 0xffd45c, a: 0xffb0c8, draw: (g, now, x, feetY, _c, a) => {
            // 桃源地环：脚下桃源一隅——花环 + 落英旋转 + 两枚蟠桃 + 花雨
            const ry = feetY - 3;
            g.fillStyle(0xffd0e0, 0.3);
            g.fillEllipse(x, ry, 54, 16);
            g.lineStyle(2.2, a, 0.75);
            g.strokeEllipse(x, ry, 48, 14);
            g.lineStyle(1, 0xfff0f4, 0.6);
            g.strokeEllipse(x, ry, 32, 9);
            for (const s of [-1, 1]) { // 双蟠桃（环上一对）
                const ang = Math.sin(now / 800 + s) * 0.3 + (s > 0 ? 0.5 : -0.5);
                const px = x + Math.cos(ang) * 20, py = ry + Math.sin(ang) * 4.4;
                g.fillStyle(0xff9a5c, 0.95);
                g.fillEllipse(px, py, 7, 5.4);
                g.fillStyle(0xffd0b0, 0.7);
                g.fillCircle(px - 1.4, py - 1, 1.4);
                g.fillStyle(0x8ac85a, 0.9); // 桃叶
                g.fillEllipse(px + 1.4, py - 3, 4, 1.8);
            }
            for (let k = 0; k < 6; k++) { // 落英（沿环旋转飘落）
                const ang = now / 1100 + (k / 6) * TAU;
                const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 5.4;
                const tw = 0.5 + 0.5 * Math.sin(now / 300 + k * 1.5);
                g.fillStyle(k % 2 ? a : 0xfff0f4, tw);
                g.fillEllipse(px, py, 3.4, 1.8);
            }
            for (let k = 0; k < 4; k++) { // 花雨（环内上空飘落）
                const ph = (now / 1400 + k / 4) % 1;
                g.fillStyle(k % 2 ? a : 0xfff0f4, 0.7 * (1 - ph));
                g.fillEllipse(x - 16 + k * 11 + Math.sin(ph * 4 + k) * 3, ry - 6 - (1 - ph) * 26, 3, 1.6);
            }
        } },
    sgmRing: { c: 0xe8404a, a: 0xb8a890, draw: (g, now, x, feetY, c, a) => {
            // 战场地环：脚下战场一隅——插地的箭矢 + 残旗 + 车辙尘 + 篝火余烬
            const ry = feetY - 3;
            g.fillStyle(0x4a3f2c, 0.4); // 焦土底
            g.fillEllipse(x, ry, 56, 17);
            g.lineStyle(1.6, 0x2a2016, 0.7);
            g.strokeEllipse(x, ry, 50, 15);
            for (let k = 0; k < 4; k++) { // 插地的箭（错落角度）
                const px = x - 18 + k * 12;
                const tilt = Math.sin(k * 2.4) * 0.2;
                g.lineStyle(1.6, 0x6b4a2f, 0.95);
                g.lineBetween(px, ry + 3, px + tilt * 12, ry - 9 - (k % 2) * 3);
                g.fillStyle(0xcfc4a0, 1); // 箭镞
                g.fillTriangle(px + tilt * 12 - 1.6, ry - 8 - (k % 2) * 3, px + tilt * 12 + 1.6, ry - 8 - (k % 2) * 3, px + tilt * 12, ry - 12 - (k % 2) * 3);
                g.fillStyle(a, 0.9); // 尾羽
                g.fillTriangle(px - 3, ry + 2, px + 1, ry + 2, px - 1, ry - 2);
            }
            // 残旗（半截旗杆 + 破旗）
            g.lineStyle(1.6, 0x6b4a2f, 1);
            g.lineBetween(x + 20, ry + 2, x + 20, ry - 13);
            const flap = Math.sin(now / 350) * 1.6;
            g.fillStyle(c, 0.85);
            g.fillPoints([
                { x: x + 20, y: ry - 13 }, { x: x + 29, y: ry - 12 + flap }, { x: x + 27, y: ry - 7 + flap }, { x: x + 20, y: ry - 8 },
            ], true);
            for (let k = 0; k < 4; k++) { // 车辙扬尘（贴地滚过）
                const ph = (now / 1100 + k / 4) % 1;
                g.fillStyle(a, 0.4 * Math.sin(ph * Math.PI));
                g.fillEllipse(x - 22 + ph * 44, ry + 4, 8, 3);
            }
            for (let k = 0; k < 3; k++) { // 余烬明灭
                const gl = 0.4 + 0.6 * Math.abs(Math.sin(now / 260 + k * 2));
                g.fillStyle(0xff9a3c, gl);
                g.fillCircle(x - 12 + k * 12, ry - 1, 1.3);
            }
        } },
};
