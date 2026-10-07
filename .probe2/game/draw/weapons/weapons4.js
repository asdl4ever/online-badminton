import { handle, poly, line, TAU } from './shared.js';
/** 第四批主题球拍的武器化 */
export const WEAPONS_4 = {
    pagodRacketA: { c: 0xc0ccd8, a: 0x8a2020, draw: (g, now, c, a) => {
            // 官刀（偃月刀）：长柄 + 弯月大刃 + 红缨
            handle(g, -13, 2, 5, 0x6a4a2a);
            g.fillStyle(a, 1);
            g.fillEllipse(3, 0, 3, 12);
            const blade = [];
            for (let s = 0; s <= 8; s++) {
                const u = s / 8;
                blade.push([6 + u * 22, -3 - Math.sin(u * Math.PI * 0.6) * 6]);
            }
            blade.push([28, 2], [8, 2.6]);
            poly(g, blade, c);
            g.lineStyle(1.2, 0xffffff, 0.5);
            g.lineBetween(8, -5, 24, -8);
            const t = now / 240;
            g.fillStyle(a, 0.9);
            g.fillTriangle(4, -4, 4 + Math.sin(t) * 4, -9, 4 - Math.sin(t) * 3, -8);
            g.fillStyle(0xd9b45c, 1);
            g.fillCircle(4, -5, 1.6);
        } },
    pagodRacketB: { c: 0x4a9a7a, a: 0xd9b45c, draw: (g, now, c, a) => {
            // 玉玺：金钮玉印
            handle(g, -13, 4, 5.5, 0x6a4a2a);
            g.fillStyle(c, 1);
            g.fillRoundedRect(0, -6, 18, 12, 2);
            g.fillStyle(0x3a7a5a, 0.8);
            g.fillRect(2, -4, 14, 3);
            g.fillStyle(a, 1);
            g.fillCircle(9, -9, 4.5);
            g.fillStyle(a, 0.8);
            g.fillEllipse(9, -13, 8, 4);
            g.fillStyle(0xffffff, 0.5);
            g.fillCircle(7, -10.5, 1.4);
        } },
    stormRacketA: { c: 0x6a8ab0, a: 0xdfe8f4, draw: (g, now, c, a) => {
            // 逆风旗杖：旗面被风撕成三条飘带
            handle(g, -13, 8, 4, 0x3a4a5a);
            for (let k = 0; k < 3; k++) {
                line(g, Array.from({ length: 9 }, (_, s) => {
                    const u = s / 8;
                    return [10 + u * 20, -8 + k * 5 + Math.sin(u * 5 + now / 200 + k) * (1.5 + u * 4)];
                }), 3, k === 1 ? a : c, 0.95);
            }
            g.lineStyle(1.4, a, 0.4);
            g.beginPath();
            g.arc(2, 0, 16, -0.6 + Math.sin(now / 400) * 0.2, 0.6 + Math.sin(now / 400) * 0.2);
            g.strokePath();
        } },
    stormRacketB: { c: 0x2a3a5a, a: 0x7ae0ff, draw: (g, now, c, a) => {
            // 引雷锤：铁锤 + 顶端避雷针，电弧噼啪
            handle(g, -13, 2, 6, 0x3a4a5a);
            g.fillStyle(c, 1);
            g.fillRoundedRect(0, -8, 20, 16, 3);
            line(g, [[10, -8], [10, -16]], 2.4, a);
            for (let k = 0; k < 2; k++) {
                const j = Math.sin(now / 60 + k * 3.7) * 2;
                line(g, [[10, -16], [14 + j, -20], [8 - j, -23], [12, -27]], 1.6, a, 0.7);
            }
            g.fillStyle(a, 0.6);
            g.fillCircle(10, -27, 2.4);
            g.lineStyle(1.4, a, 0.5);
            g.lineBetween(2, 0, 6, 2);
            g.lineBetween(14, 4, 18, 2);
        } },
    lunarRacketA: { c: 0xb8d8d0, a: 0xd9b45c, draw: (g, now, c, a) => {
            // 玉杵：捣药玉杵，杵头缠彩绳
            handle(g, -13, 8, 5.5, 0x8a6a5a);
            g.fillStyle(a, 1);
            g.fillRect(4, -3.4, 5, 6.8);
            g.fillStyle(c, 1);
            g.fillRoundedRect(9, -5, 14, 10, 5);
            g.fillStyle(0xffffff, 0.5);
            g.fillEllipse(13, -2.6, 8, 2.4);
            g.fillStyle(0xe8f4f0, 0.7);
            g.fillCircle(20, 0, 2);
        } },
    lunarRacketB: { c: 0xe8e8f8, a: 0xffe89a, draw: (g, now, c, a) => {
            // 月轮杖：满月悬杖头，一道月牙绕行
            handle(g, -13, 2, 5, 0x8a92b8);
            const gl = 0.5 + 0.3 * Math.sin(now / 400);
            g.fillStyle(a, 0.3 * gl);
            g.fillCircle(9, -2, 13);
            g.fillStyle(c, 1);
            g.fillCircle(9, -2, 9);
            g.fillStyle(0xc8c8dc, 0.6);
            g.fillCircle(6, -4, 2);
            g.fillCircle(12, 0, 1.6);
            const ang = now / 900;
            poly(g, [
                [9 + Math.cos(ang) * 15, -2 + Math.sin(ang) * 10],
                [9 + Math.cos(ang + 0.5) * 15, -2 + Math.sin(ang + 0.5) * 10],
                [9 + Math.cos(ang + 0.25) * 11, -2 + Math.sin(ang + 0.25) * 7],
            ], a);
        } },
    vikingRacketA: { c: 0x9aa2ac, a: 0x6a4a2a, draw: (g, now, c, a) => {
            // 战斧：粗柄 + 半月斧刃 + 缠皮
            handle(g, -13, 8, 6.5, a);
            g.fillStyle(0x8a6a4a, 0.7);
            g.fillRect(-4, -3.4, 4, 6.8);
            poly(g, [[4, -6], [22, -12], [26, 4], [12, 6], [4, 4]], c);
            poly(g, [[18, -10], [26, 4], [21, 2]], 0xdfe6f0);
            g.lineStyle(2, 0x6a7482, 0.9);
            g.strokeCircle(6, 0, 4);
        } },
    vikingRacketB: { c: 0x8a6a4a, a: 0x9aa2ac, draw: (g, now, c, a) => {
            // 龙首锤：锤头雕成龙头，眼睛发亮
            handle(g, -13, 2, 6, a);
            g.fillStyle(c, 1);
            g.fillRoundedRect(0, -8, 20, 16, 5);
            poly(g, [[18, -6], [28, -9], [26, -2]], c);
            poly(g, [[18, 6], [28, 9], [26, 2]], c);
            g.fillStyle(0xffffff, 0.95);
            g.fillTriangle(26, -8, 24, -5, 27, -5);
            g.fillTriangle(26, 8, 24, 5, 27, 5);
            g.fillStyle(0xffb02a, 0.8 + 0.2 * Math.sin(now / 200));
            g.fillCircle(14, -4, 2);
            g.fillStyle(a, 0.8);
            g.fillTriangle(2, -8, 6, -12, 8, -8);
            g.fillTriangle(2, 8, 6, 12, 8, 8);
        } },
    safariRacketA: { c: 0x8a6a3a, a: 0x3aa05a, draw: (g, now, c, a) => {
            // 藤杖：藤蔓缠着杖身爬
            handle(g, -13, 12, 5, c);
            g.lineStyle(2.4, a, 0.9);
            g.beginPath();
            for (let s = 0; s <= 12; s++) {
                const u = s / 12;
                const px = -8 + u * 18, py = Math.sin(u * 8 + now / 900) * 3.2;
                if (s === 0)
                    g.moveTo(px, py);
                else
                    g.lineTo(px, py);
            }
            g.strokePath();
            g.fillStyle(0x7ed957, 0.9);
            g.fillEllipse(-2, -3.4, 5, 2.6);
            g.fillEllipse(6, 3.4, 5, 2.6);
        } },
    safariRacketB: { c: 0xf0e8d0, a: 0xc8b070, draw: (g, now, c, a) => {
            // 象牙：一整根弯象牙
            handle(g, -13, -2, 5.5, a);
            const tusk = [];
            for (let s = 0; s <= 10; s++) {
                const u = s / 10;
                tusk.push([u * 26, -2 - Math.sin(u * Math.PI * 0.55) * 7 + u * 4]);
            }
            for (let s = 10; s >= 0; s--) {
                const u = s / 10;
                tusk.push([u * 26, 3 - Math.sin(u * Math.PI * 0.55) * 6 + u * 4]);
            }
            poly(g, tusk, c);
            g.lineStyle(1.2, 0xc8b088, 0.6);
            for (let k = 1; k < 4; k++) {
                const u = k / 4;
                g.lineBetween(u * 24, -1.4 - Math.sin(u * Math.PI * 0.55) * 6 + u * 4, u * 24, 2.4 - Math.sin(u * Math.PI * 0.55) * 6 + u * 4);
            }
            g.fillStyle(a, 0.8);
            g.fillCircle(-1, 0, 3.4);
        } },
    theatRacketA: { c: 0xd9b45c, a: 0x2a2a2a, draw: (g, now, c) => {
            // 指挥棒：白棒 + 软木握 + 顶点星光
            handle(g, -13, 6, 4, 0x8a5a2a);
            g.fillStyle(0xf5f0e4, 1);
            g.fillRect(6, -1.4, 22, 2.8);
            const tw = 0.5 + 0.5 * Math.sin(now / 260);
            g.fillStyle(c, 0.4 * tw);
            g.fillCircle(29, 0, 5);
            g.fillStyle(c, 1);
            g.fillCircle(29, 0, 2 + tw);
        } },
    theatRacketB: { c: 0x8a92a2, a: 0xe8404a, draw: (g, now, c, a) => {
            // 麦克风：网头 + 红话筒标 + 声波
            handle(g, -13, 2, 5, 0x2a2a2a);
            g.fillStyle(a, 1);
            g.fillRect(1, -3.4, 4, 6.8);
            g.fillStyle(c, 1);
            g.fillRoundedRect(5, -5.5, 12, 11, 5);
            g.fillStyle(0xdfe6f0, 1);
            g.fillCircle(18, 0, 6);
            g.lineStyle(1, 0x8a92a2, 0.8);
            for (let k = 0; k < 3; k++) {
                g.beginPath();
                g.arc(18, 0, 2 + k * 2, 0, TAU);
                g.strokePath();
            }
            const wave = Math.abs(Math.sin(now / 240));
            g.lineStyle(1.4, a, 0.5 * wave);
            g.beginPath();
            g.arc(18, 0, 8 + wave * 3, -0.8, 0.8);
            g.strokePath();
        } },
    boreaRacketA: { c: 0x9ad4ff, a: 0x2a5a8a, draw: (g, now, c, a) => {
            // 冰镐：蓝冰镐尖 + 防滑缠带
            handle(g, -13, 5, 5.5, 0x3a4a5a);
            g.fillStyle(0xdfe6f0, 0.6);
            for (let k = 0; k < 3; k++)
                g.fillRect(-10 + k * 4, -3, 2.4, 6);
            line(g, [[4, -5], [17, -13], [28, -5]], 5, c);
            line(g, [[4, 4], [17, -13]], 4, c, 0.9);
            g.lineStyle(1.6, 0xffffff, 0.85);
            g.lineBetween(14, -12.4, 25, -5.4);
            g.fillStyle(a, 0.85);
            g.fillCircle(4, 0, 3.6);
        } },
    boreaRacketB: { c: 0x9ad4ff, a: 0xeaf6ff, draw: (g, now, c, a) => {
            // 光幕之刃：一道悬浮的能量刃，光幕闪烁
            handle(g, -13, -2, 5, 0x2a5a8a);
            g.fillStyle(0xdfe6f0, 1);
            g.fillEllipse(-2, 0, 4, 12);
            const fl = 0.6 + 0.3 * Math.sin(now / 120);
            g.fillStyle(c, 0.28 * fl);
            g.fillCircle(9, 0, 14);
            poly(g, [[-1, -3], [14, -2.6], [26, 0], [14, 2.6], [-1, 3]], c);
            poly(g, [[-1, -1.4], [20, -1], [26, 0], [20, 1], [-1, 1.4]], a);
            g.fillStyle(0xffffff, 0.85);
            g.fillRect(2, -0.7, 20, 1.4);
            for (let k = 0; k < 3; k++) {
                const ph = (now / 500 + k / 3) % 1;
                g.fillStyle(a, 0.7 * (1 - ph));
                g.fillCircle(6 + k * 7, Math.sin(ph * 9 + k) * 6, 1.6 * (1 - ph));
            }
        } },
    venicRacketA: { c: 0xd9b45c, a: 0x3a8ab0, draw: (g, now, c, a) => {
            // 贡多拉桨：长桨 + 金箔桨叶
            handle(g, -13, 8, 4.5, 0x6a4a2a);
            g.fillStyle(0x8a92a2, 1);
            g.fillRect(6, -2.4, 4, 4.8);
            poly(g, [[10, -5], [26, -7], [30, 0], [26, 7], [10, 5]], c);
            g.fillStyle(0xfff0c0, 0.8);
            g.fillEllipse(22, 0, 8, 10);
            g.lineStyle(1.2, a, 0.6);
            g.strokeEllipse(22, 0, 8, 10);
            g.fillStyle(a, 0.5);
            g.fillCircle(13, 0, 1.6);
        } },
    venicRacketB: { c: 0xa8d8f0, a: 0x3a8ab0, draw: (g, now, c, a) => {
            // 琉璃杖：透明琉璃杖身灌着运河水
            handle(g, -13, 2, 5, 0xd9b45c);
            g.fillStyle(c, 0.4);
            g.fillRoundedRect(2, -4, 24, 8, 4);
            const t = now / 300;
            g.fillStyle(a, 0.7);
            for (let k = 0; k < 3; k++) {
                const px = 4 + ((k * 8 + t * 12) % 20);
                g.fillEllipse(px, Math.sin(px / 3 + t) * 1.6, 5, 2.4);
            }
            g.lineStyle(1.4, 0xffffff, 0.5);
            g.strokeRoundedRect(2, -4, 24, 8, 4);
            g.fillStyle(c, 0.9);
            g.fillCircle(28, 0, 3);
            g.fillStyle(0xffffff, 0.6);
            g.fillCircle(27, -1, 1.2);
        } },
    olympRacketA: { c: 0xd9b45c, a: 0x5a9ad8, draw: (g, now, c, a) => {
            // 长矛：金矛尖 + 缠绳 + 橄榄枝
            handle(g, -13, 12, 4.5, 0x8a6a3a);
            g.fillStyle(a, 0.7);
            g.fillRect(-4, -2.8, 5, 5.6);
            poly(g, [[12, -3.4], [22, -3], [30, 0], [22, 3], [12, 3.4]], c);
            g.fillStyle(0xffffff, 0.6);
            g.fillTriangle(14, -2.4, 22, -1, 14, 0);
            g.fillStyle(0x5a9a3a, 0.9);
            g.fillEllipse(10, -6, 7, 3);
            g.fillEllipse(14, 5.4, 7, 3);
        } },
    olympRacketB: { c: 0xffd45c, a: 0x5a9ad8, draw: (g, now, c, a) => {
            // 宙斯雷霆：锯齿神雷
            handle(g, -13, 0, 5, 0x8a6a3a);
            g.fillStyle(c, 1);
            g.fillCircle(2, 0, 4);
            poly(g, [[4, -2], [12, -2], [8, -1], [18, -1], [12, 1], [22, 1], [14, 3], [24, 3], [16, 5]], c);
            poly(g, [[4, 2], [10, 2], [6, 4], [14, 4]], a);
            const fl = 0.5 + 0.4 * Math.sin(now / 100);
            g.fillStyle(0xffffff, 0.5 * fl);
            g.fillCircle(14, 1, 4);
            g.lineStyle(1.4, a, 0.6);
            g.lineBetween(20, -4, 26, -6);
            g.lineBetween(22, 4, 27, 3);
        } },
    sambaRacketA: { c: 0x3aa05a, a: 0xffd45c, draw: (g, now, c, a) => {
            // 沙锤：绿锤身金圆点，摇动时撒沙
            handle(g, -13, 4, 5, 0x8a5a2a);
            g.fillStyle(c, 1);
            g.fillEllipse(12, 0, 18, 22);
            g.fillStyle(a, 0.9);
            g.fillCircle(8, -5, 2);
            g.fillCircle(15, -2, 2);
            g.fillCircle(10, 4, 2);
            g.fillCircle(16, 5, 1.6);
            const sh = Math.sin(now / 160) * 2;
            g.fillStyle(0xd9b45c, 0.6);
            g.fillCircle(12 + sh, 12, 1.6);
            g.fillCircle(16 - sh, 13, 1.2);
        } },
    sambaRacketB: { c: 0xffd45c, a: 0x4ac8ff, draw: (g, now, c, a) => {
            // 狂欢号角：喇叭口朝前，飘出彩带
            handle(g, -13, 2, 5, 0x3aa05a);
            poly(g, [[2, -3], [16, -6], [16, 6], [2, 3]], c);
            g.fillStyle(a, 0.9);
            g.beginPath();
            g.arc(20, 0, 8, -Math.PI * 0.42, Math.PI * 0.42);
            g.closePath();
            g.fillPath();
            g.fillStyle(c, 0.8);
            g.beginPath();
            g.arc(20, 0, 8, -Math.PI * 0.3, Math.PI * 0.3);
            g.closePath();
            g.fillPath();
            for (let k = 0; k < 3; k++) {
                const ph = (now / 500 + k / 3) % 1;
                g.fillStyle(k % 2 ? a : 0xe83a5a, 0.85 * (1 - ph));
                g.fillEllipse(24 + ph * 10, Math.sin(ph * 6 + k) * 5, 5 * (1 - ph) + 2, 2.4);
            }
        } },
};
