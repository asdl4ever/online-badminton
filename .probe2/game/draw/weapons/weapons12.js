import { handle, pommel, TAU } from './shared.js';
/** 批九主题武器（童话王国 / 深夜食堂 / 猫咖物语）。局部空间：柄在 x ∈ [-13,-2]，拍框中心 ≈ (9,0)。 */
export const WEAPONS_12 = {
    taleRacketA: { c: 0xffd45c, a: 0x9b5cff, draw: (g, now, c, a) => {
            // 魔法星杖·拍：拍面是一柄星杖——杖杆 + 顶端五角星 + 绕星星屑 + 星光尾
            handle(g, -13, 0, 4.4, 0x8a4ad0);
            pommel(g, -13.4, 2.2, a);
            g.fillStyle(0xb8943a, 1); // 杖杆
            g.fillRect(-2, -2, 26, 4);
            g.fillStyle(0xfff0b0, 0.6);
            g.fillRect(-2, -2, 26, 1.4);
            // 顶端大五角星（自转 + 光晕）
            const rot = now / 700;
            g.save();
            g.translateCanvas(30, 0);
            g.rotateCanvas(rot);
            g.fillStyle(a, 0.35);
            g.fillCircle(0, 0, 9);
            g.fillStyle(c, 1);
            g.fillPoints((() => {
                const vs = [];
                for (let s = 0; s < 10; s++) {
                    const ang = (s / 10) * TAU - Math.PI / 2;
                    const rr = s % 2 ? 3.4 : 8;
                    vs.push({ x: Math.cos(ang) * rr, y: Math.sin(ang) * rr });
                }
                return vs;
            })(), true);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(0, -1, 1.6);
            g.restore();
            // 绕星星屑
            for (let k = 0; k < 4; k++) {
                const ang = now / 300 + (k / 4) * TAU;
                g.fillStyle(k % 2 ? a : 0xffffff, 0.8);
                g.fillCircle(30 + Math.cos(ang) * 13, Math.sin(ang) * 13, 1.2);
            }
            g.lineStyle(1, a, 0.4); // 星光尾（从星拖向柄）
            g.beginPath();
            g.moveTo(28, 0);
            g.lineTo(20, Math.sin(now / 200) * 2);
            g.lineTo(10, Math.sin(now / 200 + 1) * 2);
            g.strokePath();
        } },
    taleRacketB: { c: 0xdfe8f5, a: 0xffd45c, draw: (g, now, c, a) => {
            // 王者之剑·拍：拍面是一柄王者巨剑——宽剑身 + 血槽 + 十字宽护手 + 剑穗宝石
            handle(g, -13, 0, 5, 0x8a6a3a);
            pommel(g, -13.4, 2.4, a);
            g.fillStyle(a, 0.95); // 十字宽护手
            g.fillRect(-5, -7.4, 5, 14.8);
            g.fillStyle(0xfff0b0, 0.6);
            g.fillRect(-5, -1, 5, 2);
            g.fillStyle(c, 1); // 宽剑身
            g.fillPoints([
                { x: 0, y: -6.4 }, { x: 24, y: -4.4 }, { x: 36, y: 0 }, { x: 24, y: 4.4 }, { x: 0, y: 6.4 },
            ], true);
            g.fillStyle(0xffffff, 0.55); // 剑面受光
            g.fillPoints([
                { x: 0, y: -6.4 }, { x: 24, y: -4.4 }, { x: 20, y: -1 }, { x: 0, y: -1 },
            ], true);
            g.lineStyle(1.2, 0x8a94a2, 0.8); // 血槽
            g.lineBetween(2, 0, 30, 0);
            g.fillStyle(a, 0.9); // 剑根宝石
            g.fillCircle(3, 0, 2);
            g.fillStyle(0xffffff, 0.7);
            g.fillCircle(2.4, -0.6, 0.7);
            const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 320)); // 剑尖王气
            g.fillStyle(0xfff0b0, gl);
            g.fillCircle(36, 0, 2.4);
            g.fillStyle(0xff9adf, 0.6 * gl);
            g.fillCircle(36, 0, 4.4);
        } },
    dinRacketA: { c: 0xc08a3a, a: 0xe8404a, draw: (g, now, c, a) => {
            // 长筷·拍：拍面是一双竹长筷——双筷并拢 + 筷头尖端 + 筷架绳结 + 夹着的煎蛋
            handle(g, -13, 0, 4.4, 0x8a5a3a);
            pommel(g, -13.4, 2.2, a);
            const open = Math.sin(now / 400) * 1.2;
            for (const s of [-1, 1]) { // 双筷（越到尖端越细，微微开合）
                g.fillStyle(s > 0 ? c : 0xa87848, 1);
                g.fillPoints([
                    { x: -2, y: s * 3 - 1.4 }, { x: 38, y: s * 1.4 - 0.6 + open }, { x: 38, y: s * 1.4 + 0.6 + open }, { x: -2, y: s * 3 + 1.4 },
                ], true);
                g.fillStyle(0xfff0d8, 0.5); // 筷面光泽
                g.fillRect(-2, s * 3 - 1.4, 20, 1);
            }
            g.fillStyle(a, 0.95); // 筷架绳结（红绳绕两圈）
            g.lineStyle(1.6, a, 0.95);
            g.strokeCircle(2, 0, 3);
            g.strokeCircle(2, 0, 5);
            // 筷尖夹着的煎蛋（蛋黄晃动）
            g.fillStyle(0xfff6d8, 0.95);
            g.fillEllipse(39, open, 7, 6);
            g.fillStyle(0xffb84a, 0.95);
            g.fillCircle(39 + Math.sin(now / 200) * 0.8, open, 2.4);
            g.fillStyle(0xffffff, 0.7);
            g.fillCircle(38.4, open - 0.8, 0.8);
        } },
    dinRacketB: { c: 0x39424e, a: 0xffb84a, draw: (g, now, c, a) => {
            // 大铁勺·拍：拍面是一柄大铁勺——勺体 + 长柄 + 勺内余汤 + 挂环 + 火光反射
            handle(g, -13, 0, 5, 0x8a5a3a);
            pommel(g, -13.4, 2.4, a);
            g.fillStyle(0x8a5a3a, 1); // 木柄
            g.fillRect(-2, -2.6, 26, 5.2);
            g.fillStyle(0xa87848, 0.6);
            g.fillRect(-2, -2.6, 26, 1.8);
            g.fillStyle(c, 1); // 勺体
            g.fillEllipse(32, 0, 20, 16);
            g.fillStyle(0x5a6472, 0.7); // 勺窝
            g.fillEllipse(32, -1, 14, 10);
            g.fillStyle(0xd88a3a, 0.9); // 勺内余汤
            g.fillEllipse(32, -0.4, 10, 6);
            g.fillStyle(0xffe15c, 0.6 + 0.3 * Math.sin(now / 200)); // 汤面油光反射
            g.fillEllipse(30, -1.4, 4, 1.6);
            g.fillStyle(0x8a94a2, 0.9); // 柄勺连接铆钉
            g.fillCircle(21, 0, 1.6);
            // 勺柄挂环
            g.lineStyle(1.6, a, 0.9);
            g.strokeCircle(24, 0, 2.6);
            // 热气（勺内升起的eszencial热气）
            for (let k = 0; k < 2; k++) {
                const ph = (now / 900 + k / 2) % 1;
                g.fillStyle(0xf0ead8, 0.3 * (1 - ph));
                g.fillCircle(32 + Math.sin(ph * 4 + k) * 3, -6 - ph * 14, 1.6 * (1 - ph) + 0.5);
            }
        } },
    catRacketA: { c: 0xffb0c8, a: 0xe8a050, draw: (g, now, c, a) => {
            // 逗猫棒·拍：拍面是一根逗猫棒——杆 + 顶端羽毛铃铛 + 甩动彩带
            handle(g, -13, 0, 4, 0x8a5a3a);
            pommel(g, -13.4, 2.2, a);
            g.lineStyle(2.6, c, 1); // 柔杆（微微弯曲）
            g.beginPath();
            g.moveTo(-2, 0);
            g.lineTo(20, -2 + Math.sin(now / 300) * 1.6);
            g.lineTo(34, -6 + Math.sin(now / 300 + 1) * 3);
            g.strokePath();
            // 顶端羽毛（三根小羽）
            const tipX = 34 + Math.sin(now / 300 + 1) * 3, tipY = -6 + Math.sin(now / 300 + 1) * 3;
            for (let k = -1; k <= 1; k++) {
                g.fillStyle(k % 2 ? a : 0xffffff, 0.95);
                g.fillEllipse(tipX + k * 3.4, tipY - 5 + Math.abs(k) * 1.6, 2.6, 6);
            }
            // 铃铛（叮当作响）
            const bell = 0.5 + 0.5 * Math.sin(now / 180);
            g.fillStyle(0xffd45c, 0.95);
            g.fillCircle(tipX, tipY + 2, 2.4);
            g.fillStyle(0x8a6a2a, 0.9);
            g.lineBetween(tipX - 2, tipY + 2, tipX + 2, tipY + 2);
            g.fillStyle(0xffffff, bell * 0.7);
            g.fillCircle(tipX - 0.8, tipY + 1.2, 0.7);
            // 彩带（顶端飘出的两条彩带）
            for (let k = 0; k < 2; k++) {
                g.lineStyle(1.4, k ? a : c, 0.8);
                g.beginPath();
                g.moveTo(tipX, tipY + 4);
                g.lineTo(tipX + 6 + Math.sin(now / 250 + k) * 3, tipY + 10 + k * 3);
                g.lineTo(tipX + 2 + Math.sin(now / 250 + k * 2) * 3, tipY + 16 + k * 2);
                g.strokePath();
            }
        } },
    catRacketB: { c: 0xe8a050, a: 0xffd8a8, draw: (g, now, c, a) => {
            // 巨猫爪·拍：拍面是一整只巨大猫爪——爪掌 + 三趾 + 肉球 + 绒毛 + 挥动爪缝
            handle(g, -13, 0, 4.6, 0x8a5a3a);
            pommel(g, -13.4, 2.2, a);
            g.fillStyle(c, 1); // 爪掌（大圆掌）
            g.fillCircle(28, 0, 14);
            g.fillStyle(0xd88a40, 0.6); // 掌面橘纹
            for (let k = 0; k < 3; k++)
                g.fillRect(18 + k * 7, -10, 2.4, 6);
            for (let k = 0; k < 3; k++) { // 三根粗趾（上排圆趾，Q弹缩放）
                const squish = 1 + Math.sin(now / 250 + k) * 0.06;
                g.fillStyle(c, 1);
                g.fillCircle(20 + k * 8, -13, 5.4 * squish);
                g.fillStyle(a, 0.9); // 趾上粉色肉垫
                g.fillCircle(20 + k * 8, -13, 3 * squish);
                g.fillStyle(0xffffff, 0.6);
                g.fillCircle(19.4 + k * 8, -13.6, 1);
            }
            g.fillStyle(a, 0.95); // 掌心大肉球
            g.fillEllipse(28, 2, 10, 7);
            g.fillStyle(0xffffff, 0.5);
            g.fillEllipse(26.4, 0.6, 3.4, 2);
            // 掌缘绒毛（锯齿小绒毛）
            g.lineStyle(1.2, c, 0.9);
            for (let k = 0; k < 5; k++) {
                const ang = Math.PI * 0.7 + k * 0.32;
                g.lineBetween(28 + Math.cos(ang) * 13, Math.sin(ang) * 13, 28 + Math.cos(ang) * 16, Math.sin(ang) * 16);
            }
            // 腕部毛环
            g.fillStyle(0xffd8a8, 0.8);
            g.fillRect(8, -6, 3.4, 12);
            // 抓痕闪光（爪缘偶发的抓光）
            if (Math.sin(now / 180) > 0.6) {
                g.lineStyle(1.4, 0xffffff, 0.7);
                g.lineBetween(40, -8, 46, -12);
            }
        } },
};
