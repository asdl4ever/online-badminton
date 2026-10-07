import { handle, pommel, TAU } from './shared.js';
/** 批七主题武器（赛博都市 / 东海龙宫 / 时空旅行）。局部空间：柄在 x ∈ [-13,-2]，拍框中心 ≈ (9,0)。 */
export const WEAPONS_10 = {
    cybRacketA: { c: 0x39ffd0, a: 0xff3bd4, draw: (g, now, c, a) => {
            // 脉冲刃·拍：拍面是一柄能量短刃——刃体 + 能量槽 + 充能流 + 磁轨柄
            handle(g, -13, 0, 4.6, 0x39424e);
            pommel(g, -13.4, 2.2, a);
            g.fillStyle(0x22303e, 1); // 刃座
            g.fillRect(-2, -4.4, 10, 8.8);
            g.fillStyle(c, 1); // 能量刃体（半透明晶刃）
            g.fillPoints([
                { x: 8, y: -6.4 }, { x: 30, y: -4 }, { x: 40, y: 0 }, { x: 30, y: 4 }, { x: 8, y: 6.4 },
            ], true);
            g.fillStyle(0xffffff, 0.45); // 刃面反光
            g.fillPoints([
                { x: 8, y: -6.4 }, { x: 30, y: -4 }, { x: 24, y: -1 }, { x: 8, y: -1.4 },
            ], true);
            g.lineStyle(1.6, a, 0.85); // 中央能量槽（明灭）
            g.lineBetween(10, 0, 36, 0);
            for (let k = 0; k < 3; k++) { // 充能流（沿槽冲向刃尖的能量点）
                const u = (now / 350 + k / 3) % 1;
                g.fillStyle(0xffffff, 0.9);
                g.fillCircle(10 + u * 26, Math.sin(now / 90 + k) * 0.6, 1.2);
            }
            g.fillStyle(0x39424e, 0.9); // 磁轨柄纹
            for (let k = 0; k < 3; k++)
                g.fillRect(-11 + k * 4, -2.2, 1.4, 4.4);
        } },
    cybRacketB: { c: 0xff3bd4, a: 0x39ffd0, draw: (g, now, c, a) => {
            // 重力炮·拍：拍面是一门小型重力炮——双管炮体 + 聚能环 + 引力奇点 + 散热鳍
            handle(g, -13, 0, 5, 0x39424e);
            pommel(g, -13.4, 2.4, a);
            g.fillStyle(0x39424e, 1); // 炮体
            g.fillRoundedRect(-2, -7, 34, 14, 4);
            g.fillStyle(0x22303e, 0.9);
            g.fillRect(-2, -2, 34, 4);
            for (const s of [-1, 1]) { // 双管
                g.fillStyle(0x5a6472, 1);
                g.fillRect(30, s * 4 - 2.4, 10, 4.8);
                g.fillStyle(0x22303e, 1);
                g.fillRect(38, s * 4 - 3, 4, 6);
            }
            for (let k = 0; k < 4; k++) { // 散热鳍
                g.fillStyle(0x5a6472, 1);
                g.fillRect(2 + k * 8, -9.4, 3, 3);
            }
            // 聚能环（炮口前悬浮的旋转环）
            const rot = now / 300;
            g.lineStyle(2, a, 0.9);
            g.beginPath();
            g.arc(44, 0, 6, rot, rot + 4.6);
            g.strokePath();
            // 引力奇点（环心明灭的奇点 + 吸入粒子）
            const gl = 0.5 + 0.5 * Math.sin(now / 200);
            g.fillStyle(c, 0.3 * gl);
            g.fillCircle(44, 0, 5);
            g.fillStyle(0xffffff, gl);
            g.fillCircle(44, 0, 2);
            for (let k = 0; k < 3; k++) {
                const u = (now / 500 + k / 3) % 1;
                const ang = k * 2.1 + now / 200;
                g.fillStyle(a, 0.7 * (1 - u));
                g.fillCircle(44 + Math.cos(ang) * (14 - u * 12), Math.sin(ang) * (14 - u * 12), 1.2);
            }
        } },
    dgRacketA: { c: 0xd9b45c, a: 0x7fd4ff, draw: (g, now, c, a) => {
            // 定海针·拍：拍面是缩小的定海神针——金柱双箍 + 「定海」刻纹 + 两端光
            handle(g, -13, 0, 4.6, 0x6b4a2f);
            pommel(g, -13.4, 2.2, a);
            g.fillStyle(0xb8943a, 1); // 针柱
            g.fillRect(-4, -4.4, 42, 8.8);
            g.fillStyle(c, 0.8);
            g.fillRect(-4, -4.4, 42, 2.6);
            for (const s of [-1, 1]) { // 双端金箍
                g.fillStyle(0xffd45c, 1);
                g.fillRect(s > 0 ? 32 : -6, -5.8, 8, 11.6);
                g.fillStyle(0xfff0b0, 0.7);
                g.fillRect(s > 0 ? 32 : -6, -4.6, 8, 1.6);
            }
            g.lineStyle(1, 0x8a6a2a, 0.9); // 「定海」双刻框
            g.strokeRect(4, -2.6, 7, 5.2);
            g.strokeRect(14, -2.6, 7, 5.2);
            g.fillStyle(0xfff0b0, 0.6 + 0.4 * Math.sin(now / 300)); // 两端金芒
            g.fillRect(38, -1.4, 5, 2.8);
            g.fillRect(-9.4, -1.4, 5, 2.8);
        } },
    dgRacketB: { c: 0xf0ead8, a: 0x7fd4ff, draw: (g, now, c, a) => {
            // 龙须鞭·拍：拍面是一根龙须长鞭——分节鞭身 + 游动波 + 鞭梢龙珠 + 龙鳞光
            handle(g, -13, 0, 4.4, 0x6b4a2f);
            pommel(g, -13.4, 2.2, a);
            g.lineStyle(3, c, 1); // 鞭身（波浪游动的长线）
            g.beginPath();
            g.moveTo(-2, 0);
            for (let k = 1; k <= 8; k++) {
                g.lineTo(-2 + k * 5.4, Math.sin(k * 1.2 + now / 240) * 3.4 * (k / 8));
            }
            g.strokePath();
            g.lineStyle(1.2, a, 0.6); // 鞭身鳞光
            g.beginPath();
            g.moveTo(-2, -1);
            for (let k = 1; k <= 8; k++) {
                g.lineTo(-2 + k * 5.4, -1 + Math.sin(k * 1.2 + now / 240) * 3.4 * (k / 8));
            }
            g.strokePath();
            for (let k = 0; k < 4; k++) { // 节环（鞭节金环）
                const bx = -2 + (k + 1) * 10.4;
                const by = Math.sin((k + 1.8) * 1.2 + now / 240) * 3.4 * ((k + 1.8) / 8);
                g.lineStyle(1.4, 0xd9b45c, 0.9);
                g.strokeCircle(bx, by, 2.4);
            }
            // 鞭梢龙珠（夜明珠，明灭）
            const gx = 41, gy = Math.sin(9.6 + now / 240) * 3.4;
            const gl = 0.6 + 0.4 * Math.sin(now / 260);
            g.fillStyle(a, 0.35 * gl);
            g.fillCircle(gx, gy, 6);
            g.fillStyle(0x5affd0, 0.95);
            g.fillCircle(gx, gy, 3);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(gx - 0.8, gy - 0.8, 1);
        } },
    chronoRacketA: { c: 0xffd45c, a: 0x9b5cff, draw: (g, now, c, a) => {
            // 时针·拍：拍面是一根巨型时针——菱形长针 + 表盘座 + 旋转刻度 + 逆转残影
            handle(g, -13, 0, 4.6, 0x6b4a2f);
            pommel(g, -13.4, 2.2, a);
            g.fillStyle(0xb8943a, 1); // 表盘座
            g.fillCircle(2, 0, 7);
            g.fillStyle(0xfff6d8, 0.9);
            g.fillCircle(2, 0, 4.6);
            for (let k = 0; k < 12; k++) { // 座上刻度（旋转）
                const ang = now / 800 + (k / 12) * TAU;
                g.lineStyle(0.9, 0x2a2010, 0.8);
                g.lineBetween(2 + Math.cos(ang) * 3.4, Math.sin(ang) * 3.4, 2 + Math.cos(ang) * 5.4, Math.sin(ang) * 5.4);
            }
            g.fillStyle(c, 1); // 时针（长菱形针）
            g.fillPoints([
                { x: 4, y: -2.6 }, { x: 30, y: -1 }, { x: 38, y: 0 }, { x: 30, y: 1 }, { x: 4, y: 2.6 },
            ], true);
            g.fillStyle(0xfff0b0, 0.5);
            g.fillPoints([
                { x: 4, y: -2.6 }, { x: 30, y: -1 }, { x: 26, y: -0.4 }, { x: 4, y: -1 },
            ], true);
            const back = Math.sin(now / 400); // 逆转残影（针后一条虚线影）
            g.lineStyle(1, a, 0.4 + back * 0.3);
            for (let k = 0; k < 4; k++)
                g.fillCircle(6 - k * 5, 0, 0.8);
            g.fillStyle(a, 0.9); // 针尖时符
            g.fillCircle(38, 0, 1.6);
        } },
    chronoRacketB: { c: 0x9b5cff, a: 0xffd45c, draw: (g, now, _c, a) => {
            // 裂相怀表·拍：拍面是一枚裂成两半仍悬浮的怀表——双半壳 + 缝隙时空光 + 齿轮
            handle(g, -13, 0, 4.6, 0x6b4a2f);
            pommel(g, -13.4, 2.2, a);
            const split = 1.4 + Math.sin(now / 500) * 0.8;
            g.fillStyle(0xb8943a, 1); // 上半壳
            g.beginPath();
            g.arc(9, -split - 2, 14, Math.PI, 0);
            g.closePath();
            g.fillPath();
            g.fillStyle(0xb8943a, 0.85); // 下半壳（错位）
            g.beginPath();
            g.arc(9 + 1.4, split + 2, 14, 0, Math.PI);
            g.closePath();
            g.fillPath();
            g.fillStyle(0xfff6d8, 0.9); // 上下表盘
            g.beginPath();
            g.arc(9, -split - 2, 10.4, Math.PI, 0);
            g.closePath();
            g.fillPath();
            g.beginPath();
            g.arc(9 + 1.4, split + 2, 10.4, 0, Math.PI);
            g.closePath();
            g.fillPath();
            for (let k = -3; k <= 3; k++) { // 上盘刻度
                g.lineStyle(1, 0x2a2010, 0.8);
                g.lineBetween(9 + k * 3, -split - 2, 9 + k * 3, -split - 5);
            }
            for (let k = -3; k <= 3; k++) { // 下盘刻度
                g.lineStyle(1, 0x2a2010, 0.8);
                g.lineBetween(9 + 1.4 + k * 3, split + 2, 9 + 1.4 + k * 3, split + 5);
            }
            // 缝隙时空光（裂缝中透出的紫光 + 电弧）
            g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 200));
            g.fillRect(7.4, -split - 3, 3.2, split * 2 + 6);
            g.lineStyle(1.2, 0xffffff, 0.8);
            g.lineBetween(9, -split - 4, 9 + Math.sin(now / 60) * 1.4, split + 4);
            // 悬浮齿轮（裂口边的小齿轮旋转）
            for (const [gx, gy, r, dir] of [[20, -8, 4, 1], [-2, 7, 3, -1]]) {
                g.lineStyle(1.4, 0xb8943a, 0.95);
                g.beginPath();
                g.arc(gx, gy, r, 0, TAU);
                g.strokePath();
                for (let k = 0; k < 6; k++) {
                    const ang = dir * now / 200 + (k / 6) * TAU;
                    g.fillStyle(0xb8943a, 0.95);
                    g.fillRect(gx + Math.cos(ang) * r - 0.8, gy + Math.sin(ang) * r - 0.8, 1.6, 1.6);
                }
            }
        } },
};
