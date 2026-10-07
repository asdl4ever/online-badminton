import { handle, poly, line, TAU } from './shared.js';
/** 第二批主题球拍的武器化 */
export const WEAPONS_2 = {
    pirateRacketA: { c: 0xb08a4a, a: 0x2a3a5a, draw: (g, now, c, a) => {
            // 罗盘短杖：杖顶一枚黄铜罗盘，指针在找北
            handle(g, -13, 1, 5, 0x6a4a2a);
            g.fillStyle(c, 1);
            g.fillCircle(10, -4, 9);
            g.fillStyle(0xf0e8d0, 1);
            g.fillCircle(10, -4, 6.5);
            g.lineStyle(1, a, 0.7);
            g.strokeCircle(10, -4, 6.5);
            const ang = -Math.PI / 2 + Math.sin(now / 500) * 0.9;
            poly(g, [
                [10 + Math.cos(ang) * 5, -4 + Math.sin(ang) * 5],
                [10 - Math.cos(ang) * 4, -4 - Math.sin(ang) * 4],
                [10 + Math.sin(ang) * 1.4, -4 - Math.cos(ang) * 1.4],
            ], 0xe84a4a);
            g.fillStyle(0x2a2a2a, 1);
            g.fillCircle(10, -4, 1.2);
        } },
    pirateRacketB: { c: 0x8a92a2, a: 0xb08a4a, draw: (g, now, c, a) => {
            // 船锚钩：短链 + 一只铁锚
            handle(g, -13, -6, 5, 0x6a4a2a);
            line(g, [[-6, 0], [-2, -2], [0, -4]], 2.4, 0x8a8a92);
            g.lineStyle(4, c, 1);
            g.beginPath();
            g.arc(5, 0, 8, 0.5, Math.PI - 0.5);
            g.strokePath();
            g.lineStyle(3.5, c, 1);
            g.lineBetween(5, -9, 5, 6);
            line(g, [[5, -9], [10, -12]], 3.5, c);
            for (const s of [-1, 1]) {
                g.fillStyle(c, 1);
                g.fillTriangle(5 + s * 8, s * 7 + 1, 5 + s * 8, s * 7 - 1, 5 + s * 4, s * 8.5);
            }
            g.fillStyle(a, 0.9);
            g.fillCircle(5, 6, 2.4);
        } },
    steamRacketA: { c: 0xb06a2a, a: 0x9aa7b8, draw: (g, now, c, a) => {
            // 管钳：铜柄 + 钳口
            handle(g, -13, 8, 6, c);
            g.fillStyle(0x8a4a1a, 0.8);
            g.fillCircle(-8, 0, 4);
            g.fillStyle(a, 1);
            g.fillRect(6, -9, 8, 6);
            g.fillRect(6, 3, 8, 6);
            g.fillStyle(0xd9b45c, 1);
            g.fillRect(14, -7, 7, 4);
            g.fillRect(14, 3, 7, 4);
            g.lineStyle(2, a, 1);
            g.lineBetween(8, -3, 18, -3);
        } },
    steamRacketB: { c: 0x9aa7b8, a: 0xd9b45c, draw: (g, now, c, a) => {
            // 活塞锤：钢锤 + 顶部汽缸呲白汽
            handle(g, -13, 2, 6, 0x6a4a2a);
            g.fillStyle(c, 1);
            g.fillRoundedRect(0, -9, 22, 18, 3);
            g.fillStyle(a, 1);
            g.fillRect(4, -12, 12, 5);
            for (let k = 0; k < 3; k++) {
                const ph = (now / 500 + k / 3) % 1;
                g.fillStyle(0xffffff, 0.55 * (1 - ph));
                g.fillCircle(6 + k * 4, -14 - ph * 8, 2.5 + ph * 3);
            }
            g.fillStyle(0x4a5462, 0.9);
            g.fillRect(0, -2, 22, 3);
        } },
    astroRacketA: { c: 0xdfe6f0, a: 0x5ac8ff, draw: (g, now, c, a) => {
            // 信号天线：碟形天线 + 顶端红灯闪烁
            handle(g, -13, 2, 5, 0x8a92a8);
            g.lineStyle(3, c, 1);
            g.beginPath();
            g.arc(10, -2, 10, Math.PI * 0.75, Math.PI * 1.9);
            g.strokePath();
            line(g, [[4, 4], [14, -8]], 2.5, a);
            const bl = Math.abs(Math.sin(now / 260));
            g.fillStyle(a, 0.4 + 0.6 * bl);
            g.fillCircle(15, -10, 2.6 + bl);
            g.fillStyle(0xffffff, 0.7);
            g.fillCircle(11, -4, 1.6);
        } },
    astroRacketB: { c: 0xe8f0ff, a: 0xff8a3a, draw: (g, now, c, a) => {
            // 小火箭：白箭身红鼻锥，尾部喷焰
            handle(g, -13, 0, 5, 0x8a92a8);
            poly(g, [[2, -6], [16, -6], [16, 6], [2, 6]], c);
            poly(g, [[16, -6], [24, 0], [16, 6]], 0xe8404a);
            poly(g, [[2, -6], [-2, -11], [2, -1]], 0xe8404a);
            poly(g, [[2, 6], [-2, 11], [2, 1]], 0xe8404a);
            g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 60));
            g.fillTriangle(-6, 0, 2, -4, 2, 4);
            g.fillStyle(0x5ac8ff, 0.9);
            g.fillCircle(9, 0, 2.2);
        } },
    juraRacketA: { c: 0xd8cba8, a: 0x5a7a3a, draw: (g, now, c) => {
            // 恐龙骨棒：一根粗股骨，骨节突起
            handle(g, -13, 4, 7, 0xb8ab88);
            g.fillStyle(c, 1);
            g.fillRoundedRect(2, -6, 18, 12, 5);
            g.fillStyle(c, 1);
            g.fillCircle(20, -6, 5);
            g.fillCircle(23, 0, 5.5);
            g.fillCircle(20, 6, 5);
            g.fillStyle(0x8a7a5a, 0.6);
            g.fillCircle(10, -2, 1.6);
            g.fillCircle(14, 2, 1.6);
        } },
    juraRacketB: { c: 0xd8902a, a: 0x5a7a3a, draw: (g, now, c, a) => {
            // 琥珀锤：木柄顶一颗琥珀球，里面封着一只蚊子
            handle(g, -13, 2, 5.5, 0x6a4a2a);
            g.fillStyle(c, 0.45);
            g.fillCircle(10, -4, 11);
            g.fillStyle(c, 0.85);
            g.fillCircle(10, -4, 8);
            g.fillStyle(0x2a2a2a, 0.9);
            g.fillEllipse(10, -4, 5, 2);
            g.lineStyle(1, 0x2a2a2a, 0.8);
            g.lineBetween(12, -5, 14, -7);
            g.fillStyle(0xffe8b0, 0.7);
            g.fillCircle(6, -8, 2.4);
            g.fillStyle(a, 0.7);
            g.fillCircle(17, 1, 1.8);
        } },
    mushRacketA: { c: 0xd95a4a, a: 0xf0e0c0, draw: (g, now, c, a) => {
            // 菌盖锤：奶白柄 + 红伞盖白点
            handle(g, -13, 4, 6, a);
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(9, 2, 13, Math.PI, TAU);
            g.closePath();
            g.strokePath();
            g.fillStyle(c, 1);
            g.fillEllipse(9, 2, 26, 10);
            g.fillStyle(0xffffff, 0.95);
            g.fillCircle(4, -4, 2.6);
            g.fillCircle(12, -6, 3.2);
            g.fillCircle(17, -2, 2.2);
        } },
    mushRacketB: { c: 0x6a8a4a, a: 0xb0a080, draw: (g, now, c, a) => {
            // 枯枝杖：扭弯的枯枝顶一朵灰菇，飘孢子
            handle(g, -13, 4, 5, 0x8a6a4a);
            line(g, [[4, 0], [8, -6], [5, -11], [9, -15]], 4.5, 0x8a6a4a);
            g.fillStyle(c, 0.6);
            g.fillEllipse(10, -18, 14, 7);
            g.fillStyle(a, 0.9);
            g.fillEllipse(10, -16, 8, 4);
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1100 + k / 3) % 1;
                g.fillStyle(0xd8e8b0, 0.7 * (1 - ph));
                g.fillCircle(10 + Math.sin(ph * 5 + k) * 7, -20 - ph * 9, 1.6);
            }
        } },
    tropicRacketA: { c: 0xff9a6a, a: 0x3ac8c8, draw: (g, now, c, a) => {
            // 海螺号：壳口当握，尖角朝前
            handle(g, -13, 0, 5.5, 0xc0785a);
            g.fillStyle(c, 1);
            g.fillCircle(6, 0, 8);
            const shell = [];
            for (let s = 0; s <= 8; s++) {
                const u = s / 8;
                shell.push([6 + u * 20, -8 + u * 5]);
            }
            shell.push([26, 2]);
            for (let s = 8; s >= 0; s--) {
                const u = s / 8;
                shell.push([6 + u * 20, 8 - u * 5]);
            }
            poly(g, shell, c);
            g.lineStyle(2, 0xc0785a, 0.8);
            for (let k = 1; k < 4; k++)
                g.lineBetween(6 + k * 5, -8 + k * 3.4, 6 + k * 5, 8 - k * 3.4);
            g.fillStyle(a, 0.7);
            g.fillCircle(6, 0, 3);
        } },
    tropicRacketB: { c: 0xff7a6a, a: 0x3a9a5a, draw: (g, now, c, a) => {
            // 珊瑚三叉：木柄上分出三根珊瑚枝
            handle(g, -13, 4, 5.5, 0x8a6a4a);
            g.lineStyle(3.5, c, 1);
            g.lineBetween(4, 0, 4, -8);
            g.lineBetween(4, -8, 0, -15);
            g.lineBetween(4, -8, 8, -15);
            g.lineBetween(4, -6, 4, -16);
            for (const [tx, ty] of [[0, -15], [8, -15], [4, -16]]) {
                g.fillStyle(a, 0.9);
                g.fillCircle(tx, ty, 2.2);
            }
            g.fillStyle(a, 0.6);
            g.fillCircle(6, 2, 2);
            g.fillCircle(2, 3, 1.6);
        } },
    cryptRacketA: { c: 0x7a8290, a: 0xd8d0c0, draw: (g, now, c, a) => {
            // 铁镐：镐尖磨损发亮
            handle(g, -13, 6, 5.5, 0x5a4a3a);
            line(g, [[4, -4], [16, -14], [28, -4]], 5, c);
            line(g, [[4, 4], [16, -14]], 4, c, 0.9);
            g.lineStyle(1.6, a, 0.8);
            g.lineBetween(12, -13, 22, -6);
            g.fillStyle(0x4a4a52, 0.8);
            g.fillCircle(4, 0, 4);
        } },
    cryptRacketB: { c: 0xd8d0c0, a: 0x6a4a9a, draw: (g, now, c, a) => {
            // 骨剑：肋骨磨成的刃 + 紫色魂火
            handle(g, -13, -3, 5, 0x3a3a42);
            g.fillStyle(0x8a8290, 1);
            g.fillRect(-5, -7, 4, 14);
            poly(g, [[-1, -4], [20, -3], [27, 0], [20, 3], [-1, 4]], c);
            g.lineStyle(1, 0xa89a88, 0.7);
            for (let k = 0; k < 3; k++)
                g.lineBetween(4 + k * 6, -2.6, 4 + k * 6, 2.6);
            const fl = 0.5 + 0.4 * Math.sin(now / 130);
            g.fillStyle(a, 0.35 * fl);
            g.fillCircle(20, 0, 7);
            g.fillStyle(a, 0.8 * fl);
            g.fillCircle(24, 0, 3);
        } },
    festivRacketA: { c: 0xe84a5a, a: 0xffffff, draw: (g, now, c, a) => {
            // 拐杖糖：整根就是一颗弯钩糖
            g.lineStyle(7, c, 1);
            g.beginPath();
            g.arc(14, -6, 9, Math.PI * 0.9, Math.PI * 1.9);
            g.strokePath();
            g.lineBetween(5, -5, -12, 0);
            g.lineStyle(2.4, a, 1);
            for (let k = 0; k < 5; k++) {
                const x = -11 + k * 3.6;
                g.lineBetween(x, -2.4, x + 2.4, 2.4);
            }
            for (let k = 0; k < 3; k++) {
                const ang = Math.PI * 0.95 + (k / 3) * Math.PI * 0.85;
                g.lineBetween(14 + Math.cos(ang) * 6.4, -6 + Math.sin(ang) * 6.4, 14 + Math.cos(ang + 0.28) * 11.6, -6 + Math.sin(ang + 0.28) * 11.6);
            }
        } },
    festivRacketB: { c: 0xffd45c, a: 0x3aa05a, draw: (g, now, c, a) => {
            // 铃铛锤：金铃当锤头，摇出声波
            handle(g, -13, 2, 5.5, 0x3aa05a);
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(9, 0, 11, Math.PI, TAU);
            g.closePath();
            g.strokePath();
            g.fillStyle(c, 1);
            g.fillEllipse(9, 1, 22, 12);
            g.fillStyle(0xa08030, 1);
            g.fillEllipse(9, 8, 10, 3.4);
            g.fillStyle(0x8a6a20, 1);
            g.fillCircle(9, 10, 2);
            g.fillStyle(a, 0.9);
            g.fillCircle(4, -6, 2);
            g.fillCircle(14, -4, 1.6);
            const ph = (now / 700) % 1;
            g.lineStyle(1.6, c, (1 - ph) * 0.6);
            g.beginPath();
            g.arc(9, 0, 13 + ph * 8, Math.PI * 1.15, Math.PI * 1.85);
            g.strokePath();
        } },
    sushiRacketA: { c: 0xf5f0e0, a: 0x2a3a2a, draw: (g, now, c, a) => {
            // 筷子夹饭团：两根筷尖夹一颗白饭团
            handle(g, -13, 10, 4.5, a);
            g.lineStyle(3.5, 0xc03a3a, 1);
            g.lineBetween(6, -2, 10, -2);
            g.lineStyle(3.5, c, 1);
            const pinch = Math.sin(now / 300) * 1.2;
            g.lineBetween(10, -2, 20, -5 + pinch);
            g.lineBetween(10, 2, 20, 5 - pinch);
            g.fillStyle(c, 1);
            g.fillCircle(24, 0, 5);
            g.fillStyle(a, 0.9);
            g.fillRect(21, -2, 6, 4);
        } },
    sushiRacketB: { c: 0xff8a5a, a: 0xd93a3a, draw: (g, now, c, a) => {
            // 鱼形刀：三文鱼色刀身 + 鱼尾握柄
            handle(g, -13, -3, 5.5, a);
            poly(g, [[-3, -4], [16, -5], [26, 0], [16, 5], [-3, 4]], c);
            poly(g, [[-3, -4], [-9, -7], [-3, 0]], 0xffb08a);
            g.fillStyle(0x2a2a2a, 1);
            g.fillCircle(1, -1, 1.2);
            g.lineStyle(1.4, 0xffffff, 0.55);
            g.lineBetween(2, 2, 14, 2);
            g.lineBetween(4, -2, 15, -2);
            g.fillStyle(a, 0.85);
            g.fillRect(12, -1.2, 3, 2.4);
        } },
    wildRacketA: { c: 0xb08a4a, a: 0x8a5a2a, draw: (g, now, c, a) => {
            // 套索：短柄甩出一圈旋转的绳套
            handle(g, -13, 4, 5, a);
            g.fillStyle(0x6a4a2a, 1);
            g.fillCircle(4, 0, 3);
            const t = now / 600;
            g.lineStyle(2.6, c, 1);
            g.beginPath();
            for (let s = 0; s <= 20; s++) {
                const u = s / 20;
                const ang = u * TAU * 1.6 + t;
                const r = 6 + u * 10;
                const px = 9 + Math.cos(ang) * r, py = Math.sin(ang) * r * 0.8 - u * 3;
                if (s === 0)
                    g.moveTo(px, py);
                else
                    g.lineTo(px, py);
            }
            g.strokePath();
            g.fillStyle(0xd9c08a, 0.8);
            g.fillCircle(9 + Math.cos(t) * 16, Math.sin(t) * 13 - 3, 2);
        } },
    wildRacketB: { c: 0xb0b8c0, a: 0x8a5a2a, draw: (g, now, c, a) => {
            // 左轮：枪身 + 转轮 + 木握把
            g.lineStyle(6, a, 1);
            g.lineBetween(-13, 2, -6, 2);
            g.fillStyle(c, 1);
            g.fillRect(-6, -3.5, 16, 7);
            g.lineStyle(4.5, c, 1);
            g.lineBetween(10, -1.5, 26, -1.5);
            g.fillStyle(0x6a7482, 1);
            g.fillCircle(4, 0, 5.5);
            g.fillStyle(0x2a2a32, 1);
            for (let k = 0; k < 5; k++) {
                const ang = (k / 5) * TAU + now / 900;
                g.fillCircle(4 + Math.cos(ang) * 3, Math.sin(ang) * 3, 1);
            }
            g.fillStyle(0xffd45c, 0.9);
            g.fillRect(24, -3.4, 3, 2);
            const kick = Math.abs(Math.sin(now / 480)) * 1.5;
            g.lineStyle(3, 0xd9c08a, 0.5);
            g.lineBetween(26, -3 - kick, 30, -5 - kick);
        } },
};
