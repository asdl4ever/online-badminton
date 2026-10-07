import { cpoly, cline, TAU } from './shared.js';
/**
 * 补遗批：早期 11 主题里最后 10 款独立手绘披风。
 * painter 画一件从 (0,0)（肩锚）垂到 y≈80 的披风，sway = 底部摆幅。
 */
export const CAPES_6 = {
    seamist: { c: 0x35a8b8, a: 0x9fe8ff, draw: (g, now, sway, c, a) => {
            // 深海雾纱：半透明雾纱垂帘 + 纱上浮着气泡
            cpoly(g, [[-14, 0], [14, 0], [18 + sway, 46], [12 + sway * 1.2, 74], [-6 + sway, 70], [-18 + sway * 0.6, 42]], c, 0.4);
            cpoly(g, [[-8, 0], [8, 0], [11 + sway, 44], [4 + sway, 68], [-8 + sway * 0.8, 48]], a, 0.3);
            cline(g, [[-14, 0], [-18 + sway * 0.6, 42], [-6 + sway, 70]], 1.6, a, 0.6);
            for (let k = 0; k < 5; k++) {
                const ph = (now / 1100 + k / 5) % 1;
                g.fillStyle(0xffffff, 0.6 * (1 - ph));
                g.fillCircle(-8 + k * 5 + sway * (0.4 + ph * 0.4), 62 - ph * 50, 2.2 * (1 - ph) + 0.5);
            }
        } },
    batcape: { c: 0x3a2a5a, a: 0x8a5ad4, draw: (g, now, sway, c, a) => {
            // 蝙蝠斗篷：扇形锯齿下摆的蝠翼斗篷
            const f = Math.sin(now / 380) * 5;
            cpoly(g, [[-16, 0], [16, 0], [24 + sway, 28], [16 + sway * 1.2, 22 + f], [12 + sway, 44], [4 + sway * 1.2, 34 + f * 0.7], [-2 + sway, 60], [-8 + sway, 40 + f], [-16 + sway * 0.8, 50], [-20 + sway * 0.6, 24]], c);
            for (let k = 0; k < 3; k++)
                cline(g, [[0, 0], [-14 + k * 14, 30 + Math.abs(k - 1) * -6 + f]], 1.4, a, 0.5);
            cline(g, [[-16, 0], [-20 + sway * 0.6, 24]], 1.6, a, 0.7);
            cline(g, [[16, 0], [24 + sway, 28]], 1.6, a, 0.7);
            g.fillStyle(a, 0.85);
            g.fillCircle(0, 4, 2.6); // 领扣
        } },
    slagcape: { c: 0x7f8fa8, a: 0xff7a2a, draw: (g, now, sway, c, a) => {
            // 焊渣披风：铁灰帆布 + 下缘烧灼 + 焊渣火星滴落
            cpoly(g, [[-15, 0], [15, 0], [20 + sway, 52], [10 + sway * 1.2, 78], [-8 + sway, 74], [-19 + sway * 0.7, 46]], c, 0.95);
            cpoly(g, [[-19 + sway * 0.7, 46], [10 + sway * 1.2, 78], [-8 + sway, 74]], 0x4a3a30, 0.9); // 烧焦下缘
            cline(g, [[-15, 0], [-19 + sway * 0.7, 46]], 1.6, 0x5a6a7a);
            cline(g, [[15, 0], [20 + sway, 52]], 1.6, 0x5a6a7a);
            for (let k = 0; k < 4; k++) {
                const ph = (now / 600 + k / 4) % 1;
                const gl = 0.6 + 0.4 * Math.sin(now / 150 + k);
                g.fillStyle(a, gl * (1 - ph));
                g.fillCircle(-10 + k * 7 + sway * 0.6, 60 - ph * -8, 1.8 * (1 - ph) + 0.4);
            }
            for (let k = 0; k < 3; k++)
                g.fillStyle(a, 0.8), g.fillCircle(4 + k * 6, 72 + Math.sin(now / 300 + k) * 1.5, 1.4); // 下缘余温
        } },
    ermine: { c: 0xf3ede0, a: 0x2a2a2a, draw: (g, now, sway, c, a) => {
            // 白貂披风：雪白貂皮 + 一排黑点貂尾纹 + 金色滚边
            cpoly(g, [[-16, 0], [16, 0], [22 + sway, 54], [12 + sway * 1.2, 80], [-9 + sway, 76], [-20 + sway * 0.7, 48]], c);
            cline(g, [[-20 + sway * 0.7, 48], [-9 + sway, 76]], 2.4, 0xd9b84a);
            cline(g, [[22 + sway, 54], [12 + sway * 1.2, 80]], 2.4, 0xd9b84a);
            for (let k = 0; k < 5; k++) {
                g.fillStyle(a, 0.85);
                g.fillCircle(-12 + k * 6 + sway * (0.5 + k * 0.08), 30 + k * 8 + Math.sin(now / 500 + k) * 1, 2.2);
            }
            g.fillStyle(0xd9b84a, 0.9);
            g.fillCircle(0, 5, 3); // 金扣
        } },
    petalveil: { c: 0xffc4da, a: 0xe86a9a, draw: (g, now, sway, c, a) => {
            // 花瓣纱：两层薄纱 + 缓缓飘落的花瓣
            cpoly(g, [[-14, 0], [14, 0], [19 + sway, 50], [9 + sway * 1.2, 74], [-7 + sway, 70], [-18 + sway * 0.6, 44]], c, 0.45);
            cpoly(g, [[-8, 0], [8, 0], [12 + sway, 46], [3 + sway, 66], [-9 + sway * 0.8, 50]], 0xffe0ec, 0.4);
            cline(g, [[-14, 0], [-18 + sway * 0.6, 44]], 1.4, a, 0.5);
            cline(g, [[14, 0], [19 + sway, 50]], 1.4, a, 0.5);
            for (let k = 0; k < 5; k++) {
                const ph = (now / 1300 + k / 5) % 1;
                const px = -12 + k * 6 + Math.sin(ph * 5 + k) * 4 + sway * 0.5;
                g.fillStyle(k % 2 ? c : a, 0.9 * (1 - ph * 0.5));
                g.fillEllipse(px, 16 + ph * 56, 4.4, 2.6);
            }
        } },
    starmap: { c: 0x2a3a8a, a: 0xffd45c, draw: (g, now, sway, c, a) => {
            // 星图披风：深蓝夜幕 + 星座连线 + 罗盘刻度
            cpoly(g, [[-16, 0], [16, 0], [22 + sway, 52], [12 + sway * 1.2, 78], [-8 + sway, 74], [-20 + sway * 0.7, 46]], c, 0.95);
            const stars = [[-10, 16], [-2, 30], [8, 24], [14, 40], [2, 50]];
            g.lineStyle(1, a, 0.55);
            g.beginPath();
            g.moveTo(stars[0][0] + sway * 0.3, stars[0][1]);
            for (let k = 1; k < stars.length; k++)
                g.lineTo(stars[k][0] + sway * (0.3 + k * 0.1), stars[k][1]);
            g.lineTo(stars[0][0] + sway * 0.3, stars[0][1]);
            g.strokePath();
            stars.forEach(([px, py], k) => {
                const tw = 0.6 + 0.4 * Math.sin(now / 300 + k * 1.8);
                g.fillStyle(a, tw);
                g.fillRect(px + sway * (0.3 + k * 0.1) - 1.6, py - 0.6, 3.2, 1.2);
                g.fillRect(px + sway * (0.3 + k * 0.1) - 0.6, py - 1.6, 1.2, 3.2);
            });
            g.lineStyle(1.2, 0xd9b84a, 0.5);
            g.beginPath();
            g.arc(0, 66 + sway, 7, 0, TAU);
            g.strokePath();
            g.lineBetween(-7, 66 + sway, 7, 66 + sway);
            g.lineBetween(0, 59 + sway, 0, 73 + sway); // 罗盘
        } },
    cinder: { c: 0x8a2a1a, a: 0xff9a3c, draw: (g, now, sway, c, a) => {
            // 火山灰披风：暗红火山岩色 + 灰纹 + 上飘的余烬
            cpoly(g, [[-15, 0], [15, 0], [21 + sway, 50], [11 + sway * 1.2, 76], [-8 + sway, 72], [-19 + sway * 0.7, 44]], c, 0.95);
            for (let k = 0; k < 4; k++) {
                cline(g, [[-12 + k * 8, 6 + k * 2], [-8 + k * 7 + sway * (0.3 + k * 0.1), 30 + k * 9]], 2, 0x5a1a10, 0.7);
            }
            cline(g, [[-19 + sway * 0.7, 44], [-8 + sway, 72]], 2, a, 0.75); // 灼热下缘
            for (let k = 0; k < 5; k++) {
                const ph = (now / 800 + k / 5) % 1;
                g.fillStyle(a, 0.85 * (1 - ph));
                g.fillCircle(-8 + k * 5 + Math.sin(ph * 4 + k) * 3 + sway * 0.5, 66 - ph * 54, 1.8 * (1 - ph) + 0.4);
            }
        } },
    icemist: { c: 0xd8f2ff, a: 0x6fc8ee, draw: (g, now, sway, c, a) => {
            // 冰雾披风：冰蓝雾纱 + 垂挂的冰棱
            cpoly(g, [[-15, 0], [15, 0], [20 + sway, 48], [10 + sway * 1.2, 74], [-8 + sway, 70], [-19 + sway * 0.7, 42]], c, 0.55);
            cpoly(g, [[-9, 0], [9, 0], [12 + sway, 44], [4 + sway, 64], [-10 + sway * 0.8, 48]], 0xffffff, 0.4);
            cline(g, [[-15, 0], [-19 + sway * 0.7, 42]], 1.6, a, 0.7);
            cline(g, [[15, 0], [20 + sway, 48]], 1.6, a, 0.7);
            for (let k = 0; k < 4; k++) {
                const px = -12 + k * 8 + sway * (0.5 + k * 0.08);
                const len = 8 + (k % 3) * 5;
                cpoly(g, [[px - 2.4, 52 + k * 4], [px + 2.4, 52 + k * 4], [px, 52 + k * 4 + len]], a, 0.8);
            }
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1000 + k / 3) % 1;
                g.fillStyle(0xffffff, 0.7 * (1 - ph));
                g.fillCircle(-6 + k * 7 + sway * 0.5, 60 - ph * 44, 1.6 * (1 - ph) + 0.4);
            }
        } },
    canopy: { c: 0x3a8a3a, a: 0x8ac84a, draw: (g, now, sway, c, a) => {
            // 树冠披风：层层叠叠的阔叶树冠
            const f = Math.sin(now / 480) * 3;
            for (let k = 0; k < 4; k++) {
                const py = 14 + k * 17;
                g.fillStyle(k % 2 ? c : 0x2f7a2f, 0.95);
                g.fillEllipse(-6 + sway * (0.25 + k * 0.12), py, (17 - k * 1.5) * 2, 20);
                g.fillEllipse(9 + sway * (0.25 + k * 0.12), py + 3, (12 - k) * 2, 14.8);
            }
            for (let k = 0; k < 5; k++) {
                g.fillStyle(a, 0.85);
                const px = -13 + k * 6 + sway * 0.4, py = 10 + (k % 3) * 20 + f;
                g.fillEllipse(px, py, 7, 3.6);
                g.fillStyle(0x4a9a3a, 0.9);
                g.fillEllipse(px + 1, py - 1.4, 5.4, 2.6);
            }
        } },
    tapecape: { c: 0xe83a9a, a: 0x2a2a2a, draw: (g, now, sway, c, a) => {
            // 磁带披风：磁带盒身 + 两枚转动的带轮 + 拖出的磁带条
            cpoly(g, [[-15, 0], [15, 0], [20 + sway, 50], [10 + sway * 1.2, 76], [-8 + sway, 72], [-19 + sway * 0.7, 44]], c, 0.92);
            cpoly(g, [[-11, 10], [11, 10], [13 + sway * 0.3, 34], [-9 + sway * 0.3, 32]], a, 0.9); // 盒窗
            for (let k = 0; k < 2; k++) {
                const cx = -5 + k * 10, cy = 22;
                g.fillStyle(0xf0f0f0, 0.95);
                g.fillCircle(cx, cy, 4);
                g.fillStyle(a, 0.95);
                g.fillCircle(cx, cy, 2.4);
                const rot = now / 400 * (k ? -1 : 1);
                for (let s = 0; s < 3; s++) {
                    const ang = rot + (s / 3) * TAU;
                    g.fillStyle(0x2a2a2a, 0.95);
                    g.fillRect(cx + Math.cos(ang) * 2.8 - 0.8, cy + Math.sin(ang) * 2.8 - 0.8, 1.6, 1.6);
                }
            }
            // 拖出的磁带
            const tx = 12 + sway * 0.7, ty = 52;
            cline(g, [[tx, ty], [tx + 10, ty + 8 + Math.sin(now / 350) * 2], [tx + 22, ty + 6]], 3.4, 0x2a2a2a, 0.85);
            cline(g, [[tx, ty], [tx + 10, ty + 8 + Math.sin(now / 350) * 2], [tx + 22, ty + 6]], 1, a, 0.6);
        } },
};
