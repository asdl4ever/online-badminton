import { hpoly, TAU } from './shared.js';
/** 批九主题头饰（童话王国 / 深夜食堂 / 猫咖物语） */
export const HATS_12 = {
    taleHatA: { c: 0xffd45c, a: 0x9b5cff, draw: (g, now, x, hy, c, a) => {
            // 王子冠：小巧的金王冠——冠体 + 宝石三颗 + 拱形冠口
            g.fillStyle(c, 1);
            g.fillRect(x - 11, hy - 3, 22, 7);
            for (let k = -1; k <= 1; k++) { // 三尖冠齿
                g.fillStyle(0xfff0b0, 0.95);
                g.fillTriangle(x + k * 7.4 - 2.4, hy - 3, x + k * 7.4 + 2.4, hy - 3, x + k * 7.4, hy - 9);
            }
            for (let k = -1; k <= 1; k++) { // 冠齿宝石
                g.fillStyle(k === 0 ? a : 0x5ac8ff, 0.95);
                g.fillCircle(x + k * 7.4, hy - 6, 1.2);
                g.fillStyle(0xffffff, 0.7);
                g.fillCircle(x + k * 7.4 - 0.4, hy - 6.4, 0.5);
            }
            g.fillStyle(a, 0.7); // 冠身横纹
            g.fillRect(x - 11, hy + 1, 22, 1.4);
            const gl = 0.4 + 0.3 * Math.sin(now / 300); // 冠体微光
            g.fillStyle(0xffffff, gl * 0.5);
            g.fillRect(x - 9, hy - 2, 5, 1.2);
        } },
    taleHatB: { c: 0x9b5cff, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 魔法尖帽：弯折的魔法师尖帽——宽檐 + 弯尖 + 星月饰 + 帽带
            g.fillStyle(c, 1); // 宽檐
            g.fillEllipse(x, hy, 36, 9);
            g.fillStyle(0x8a4ad0, 0.7);
            g.fillEllipse(x, hy + 1, 30, 6);
            // 帽体（向上收窄的弯尖）
            const bend = Math.sin(now / 500) * 2;
            g.fillStyle(c, 1);
            hpoly(g, [
                [x - 10, hy - 3], [x - 2 + bend, hy - 22], [x + bend * 1.6, hy - 26], [x + 2 + bend, hy - 20], [x + 10, hy - 3],
            ], c, 1);
            g.fillStyle(0x8a4ad0, 0.6); // 帽体暗面
            hpoly(g, [
                [x + 3, hy - 4], [x + 2 + bend, hy - 20], [x + 10, hy - 3],
            ], 0x8a4ad0, 0.6);
            g.fillStyle(a, 0.95); // 帽带
            g.fillRect(x - 9, hy - 6, 18, 2.4);
            // 帽上星月饰
            g.fillStyle(0xfff0b0, 0.95);
            g.save();
            g.translateCanvas(x - 3 + bend * 0.5, hy - 14);
            g.rotateCanvas(now / 400);
            for (let k = 0; k < 4; k++) {
                const ang = (k / 4) * TAU;
                g.fillEllipse(Math.cos(ang) * 2.4, Math.sin(ang) * 2.4, 1.4, 2.4);
            }
            g.restore();
            g.fillStyle(0xfff0b0, 0.9); // 帽尖坠星
            g.fillCircle(x + bend * 1.6, hy - 28, 1.6);
        } },
    dinHatA: { c: 0xf0ead8, a: 0xe8404a, draw: (g, now, x, hy, c, a) => {
            // 厨师帽：蓬松的白色厨师帽——帽箍 + 三团蓬包 + 褶皱
            g.fillStyle(c, 1); // 帽箍
            g.fillRect(x - 11, hy, 22, 6);
            g.fillStyle(0xd8d0c0, 0.7);
            g.fillRect(x - 11, hy + 4, 22, 2);
            g.fillStyle(a, 0.8); // 箍上红线
            g.fillRect(x - 11, hy + 3, 22, 1.2);
            g.fillStyle(c, 1); // 三团蓬包
            g.fillCircle(x - 7, hy - 5, 6);
            g.fillCircle(x + 7, hy - 5, 6);
            g.fillCircle(x, hy - 8, 7);
            g.fillStyle(0xffffff, 0.7); // 顶部高光
            g.fillCircle(x - 2, hy - 10, 3);
            g.lineStyle(0.9, 0xd8d0c0, 0.8); // 褶皱线
            g.lineBetween(x - 4, hy - 1, x - 3, hy - 6);
            g.lineBetween(x + 4, hy - 1, x + 3, hy - 6);
            g.lineBetween(x, hy - 1, x, hy - 7);
            const steam = 0.3 + 0.3 * Math.sin(now / 350); // 帽顶热气感微光
            g.fillStyle(0xffffff, steam * 0.5);
            g.fillCircle(x + 1, hy - 12, 1.4);
        } },
    dinHatB: { c: 0xd9453a, a: 0xffd45c, draw: (g, now, x, hy, c, _a) => {
            // 暖帘头巾：日式红色头巾——头巾结 + 后垂双带 + 白点纹 + 汗巾
            g.fillStyle(c, 1); // 头巾
            g.fillRect(x - 14, hy - 3, 28, 7);
            g.fillStyle(0xb8382e, 0.7);
            g.fillRect(x - 14, hy + 2, 28, 2);
            g.fillStyle(0xfff6d8, 0.85); // 白点纹（手绘圆点）
            for (let k = 0; k < 4; k++)
                g.fillCircle(x - 10 + k * 6.6, hy - 0.4, 1.1);
            g.fillStyle(c, 1); // 额前结
            g.fillCircle(x, hy, 3);
            g.fillStyle(0xb8382e, 0.8);
            g.fillCircle(x, hy, 1.4);
            for (const s of [-1, 1]) { // 后垂双带（甩动）
                const flap = Math.sin(now / 300 + (s > 0 ? 0 : 1.1)) * 2.4;
                g.fillStyle(s > 0 ? c : 0xb8382e, 0.95);
                hpoly(g, [
                    [x + s * 12, hy + 1], [x + s * 22 + flap, hy + 10], [x + s * 20 + flap, hy + 15], [x + s * 10, hy + 4],
                ], s > 0 ? c : 0xb8382e, 0.95);
                g.fillStyle(0xfff6d8, 0.8); // 带端白点
                g.fillCircle(x + s * 21 + flap, hy + 12, 1.2);
            }
        } },
    catHatA: { c: 0x2a2a30, a: 0xffb0c8, draw: (g, now, x, hy, c, a) => {
            // 猫耳发箍：发箍 + 一对毛绒猫耳（内耳粉 + 耳内绒毛）
            g.fillStyle(c, 1); // 发箍
            g.fillRect(x - 15, hy + 1, 30, 4);
            for (const s of [-1, 1]) { // 双猫耳（三角 + 内耳 + 绒毛颤动）
                const twitch = Math.sin(now / 700 + (s > 0 ? 0 : 2)) * 0.08;
                g.save();
                g.translateCanvas(x + s * 9, hy - 1);
                g.rotateCanvas(s * twitch);
                g.fillStyle(c, 1);
                hpoly(g, [[-4.4, 2], [s * 1.4, -9], [4.4, 2]], c, 1);
                g.fillStyle(a, 0.95); // 内耳粉
                hpoly(g, [[-2.2, 1.4], [s * 1.2, -6], [2.6, 1.4]], a, 0.95);
                g.fillStyle(0xffffff, 0.5); // 耳缘绒毛
                g.lineBetween(-4.4, 1.4, s * 1.4 - 1, -7);
                g.restore();
            }
            for (let k = 0; k < 2; k++) { // 箍上小铃铛
                g.fillStyle(0xffd45c, 0.95);
                g.fillCircle(x - 6 + k * 12, hy + 3, 1.6);
                g.fillStyle(0x8a6a2a, 0.9);
                g.lineBetween(x - 6 + k * 12 - 1.4, hy + 3, x - 6 + k * 12 + 1.4, hy + 3);
            }
        } },
    catHatB: { c: 0x2a2a30, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 管家礼帽：猫管家的圆顶礼帽——帽体 + 帽檐 + 缎带 + 侧插小鱼签
            g.fillStyle(c, 1); // 帽体（圆顶）
            g.beginPath();
            g.arc(x, hy, 13, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 13, hy, 26, 4);
            g.fillStyle(0x1a1a20, 0.7); // 帽面高光弧
            g.beginPath();
            g.arc(x - 3, hy, 9, Math.PI * 1.1, Math.PI * 1.6);
            g.closePath();
            g.fillPath();
            g.fillStyle(0x1a1a20, 1); // 帽檐
            g.fillEllipse(x, hy + 4, 34, 8);
            g.fillStyle(a, 0.95); // 缎带
            g.fillRect(x - 13, hy - 1, 26, 3.4);
            g.fillStyle(0xfff6d8, 0.9); // 缎带小结
            g.fillCircle(x + 8, hy + 0.6, 1.4);
            // 侧插小鱼签（斜插的小鱼剪影，摇动）
            const sway = Math.sin(now / 350) * 2;
            g.lineStyle(0.9, 0x8a6a3a, 0.9);
            g.lineBetween(x + 10, hy + 2, x + 16 + sway, hy - 10);
            g.fillStyle(0xd9b45c, 0.95);
            g.fillEllipse(x + 16 + sway, hy - 12, 5, 2.6);
            g.fillTriangle(x + 19 + sway, hy - 13, x + 22 + sway, hy - 14, x + 19.4 + sway, hy - 10.4);
        } },
};
