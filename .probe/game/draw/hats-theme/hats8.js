import { hpoly, TAU } from './shared.js';
/** 批五主题头饰（武侠江湖 / 北欧神域） */
export const HATS_8 = {
    wxHatA: { c: 0xcfc4a0, a: 0x8a7a54, draw: (g, now, x, hy, c, a) => {
            // 斗笠：宽檐竹斗笠——笠顶 + 双层宽檐 + 竹篾纹 + 垂纱
            g.fillStyle(c, 1); // 笠顶
            g.beginPath();
            g.arc(x, hy - 2, 10, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillStyle(0xdfd4b0, 0.7);
            g.beginPath();
            g.arc(x - 2, hy - 3, 6, Math.PI * 1.1, Math.PI * 1.8);
            g.closePath();
            g.fillPath();
            g.fillStyle(c, 1); // 宽檐（扁平椭圆）
            g.fillEllipse(x, hy, 34, 8);
            g.fillStyle(a, 0.4); // 檐下阴影
            g.fillEllipse(x, hy + 1.4, 30, 5);
            g.lineStyle(0.9, a, 0.7); // 竹篾纹
            for (let k = -3; k <= 3; k++)
                g.lineBetween(x, hy - 10, x + k * 5, hy - 0.4);
            g.fillStyle(0xdfd4b0, 0.9); // 顶珠
            g.fillCircle(x, hy - 11, 1.6);
            // 檐边垂纱（两片轻纱摆动）
            for (const s of [-1, 1]) {
                const sway = Math.sin(now / 420 + (s > 0 ? 0 : 1.4)) * 1.6;
                g.fillStyle(0xffffff, 0.28);
                hpoly(g, [
                    [x + s * 12, hy + 1], [x + s * 17 + sway, hy + 9], [x + s * 10 + sway, hy + 8], [x + s * 8, hy + 2],
                ], 0xffffff, 0.28);
            }
        } },
    wxHatB: { c: 0x2a2a30, a: 0xd9b45c, draw: (g, now, x, hy, c, a) => {
            // 玉簪发冠：束发玉冠——冠体 + 横插玉簪 + 簪头玉坠 + 发带
            g.fillStyle(c, 1); // 冠体
            g.fillRoundedRect(x - 10, hy - 8, 20, 12, 4);
            g.fillStyle(0x3a3a42, 0.7);
            g.fillRect(x - 10, hy - 1, 20, 3);
            g.fillStyle(a, 0.85); // 冠面纹
            g.fillCircle(x, hy - 2, 2.4);
            g.fillStyle(0xbfe8d0, 1); // 横插玉簪
            g.fillRect(x - 16, hy - 4, 32, 2);
            g.fillStyle(0x8fbfa0, 1); // 簪头玉坠（摇曳）
            const sway = Math.sin(now / 380) * 1.4;
            g.fillCircle(x - 16.4, hy - 3 + sway * 0.4, 2.2);
            g.lineStyle(1, 0xbfe8d0, 0.8);
            g.lineBetween(x - 16.4, hy - 1, x - 17 + sway, hy + 4);
            g.fillStyle(0x8fbfa0, 0.9);
            g.fillCircle(x - 17 + sway, hy + 5, 1.4);
            g.fillStyle(0x1a1a20, 0.9); // 发带垂下
            g.fillRect(x - 9, hy + 4, 2.4, 8);
            g.fillRect(x + 6.6, hy + 4, 2.4, 7);
        } },
    norseHatA: { c: 0x8a94a2, a: 0xdfe8f5, draw: (g, now, x, hy, c, a) => {
            // 翼盔：钢盔 + 双侧钢翼 + 盔沿铆钉 + 眉梁
            g.fillStyle(c, 1); // 盔体
            g.beginPath();
            g.arc(x, hy + 2, 14, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 14, hy + 2, 28, 4);
            g.fillStyle(0xb8c0cc, 0.55); // 盔面受光
            g.fillEllipse(x - 4, hy - 5, 11, 7);
            g.lineStyle(1.2, 0x5a6472, 0.9); // 盔中线
            g.lineBetween(x, hy - 12, x, hy - 2);
            g.fillStyle(0xdfe8f5, 0.8); // 眉梁
            g.fillRect(x - 9, hy - 3, 18, 2);
            for (const s of [-1, 1]) { // 双侧钢翼（上翘展开）
                const flap = Math.sin(now / 350 + (s > 0 ? 0 : 1)) * 1.4;
                hpoly(g, [
                    [x + s * 8, hy - 2], [x + s * 20, hy - 12 + flap], [x + s * 24, hy - 5 + flap], [x + s * 13, hy + 2],
                ], s > 0 ? c : 0xb8c0cc, 0.95);
                g.lineStyle(1, a, 0.7);
                g.lineBetween(x + s * 12, hy - 2, x + s * 21, hy - 9 + flap);
            }
            for (let k = -2; k <= 2; k++) { // 盔沿铆钉
                g.fillStyle(a, 0.9);
                g.fillCircle(x + k * 6, hy + 4, 0.9);
            }
        } },
    norseHatB: { c: 0x8a6a3a, a: 0xdfd4c0, draw: (g, now, x, hy, c, a) => {
            // 双角毛盔：皮毛帽 + 一对弯牛角 + 帽檐绒毛 + 风雪挂霜
            g.fillStyle(c, 1); // 皮毛帽体
            g.fillRoundedRect(x - 12, hy - 8, 24, 13, 5);
            g.fillStyle(0x6a4a2a, 0.7);
            g.fillRect(x - 12, hy - 8, 24, 4);
            g.fillStyle(a, 1); // 帽檐绒毛（锯齿毛边）
            for (let k = -5; k <= 5; k++) {
                g.fillCircle(x + k * 2.4, hy + 5, 1.4);
            }
            for (const s of [-1, 1]) { // 弯牛角（由粗到细的三段）
                g.fillStyle(0xdfd4c0, 1);
                hpoly(g, [
                    [x + s * 9, hy - 4], [x + s * 15, hy - 10], [x + s * 18, hy - 16], [x + s * 19.4, hy - 13], [x + s * 14, hy - 6],
                ], 0xdfd4c0, 1);
                g.fillStyle(0xb8ac90, 0.6); // 角纹
                g.lineStyle(1, 0xb8ac90, 0.6);
                g.lineBetween(x + s * 13, hy - 6, x + s * 17, hy - 13);
            }
            g.fillStyle(0xf0f4fa, 0.6 + 0.3 * Math.sin(now / 500)); // 顶上挂霜
            g.fillEllipse(x, hy - 9, 14, 2.4);
            g.fillStyle(0x2a1a10, 0.8); // 帽前图腾印
            g.fillCircle(x, hy - 1, 1.6);
        } },
};
