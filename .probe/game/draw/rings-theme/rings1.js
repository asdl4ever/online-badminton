import { R_RX, R_RY, R_DY, rline } from './shared.js';
/** 第一批主题地环（按名字独立画：商队 / 云端 / 甜点 / 马戏 / 城堡 / 茶馆 / 法阵 / 博物馆 / 玩具 / 灯会 / 海盗 / 蒸汽 / 太空 / 侏罗纪 / 蘑菇 / 热带 / 墓地 / 节日 / 寿司 / 西部 / 山海） */
export const RINGS_1 = {
    desRing: { a: 0xe0b56a, draw: (g, now, x, fy, c, a) => {
            // 商队地环：沙丘线 + 一串驼印 + 半截旗杆
            const y = fy + R_DY;
            g.lineStyle(2, c, 0.5);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            g.lineStyle(1.6, a, 0.8);
            for (let k = 0; k < 2; k++)
                g.strokeEllipse(x - 10 + k * 20, y, 30, 9);
            for (let k = 0; k < 5; k++) {
                const px = -16 + k * 8;
                g.fillStyle(a, 0.8);
                g.fillEllipse(x + px, y + (k % 2) * 2, 3.4, 2);
            }
        } },
    nimbRing: { a: 0xffffff, draw: (g, now, x, fy, c, a) => {
            // 云端地环：踩在一朵云上 + 环绕小云絮
            const y = fy + R_DY;
            g.fillStyle(c, 0.85);
            for (let k = 0; k < 5; k++)
                g.fillCircle(x - 18 + k * 9, y + (k % 2) * 2, 6);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(x, y - 3, 9);
            for (let k = 0; k < 3; k++) {
                const aa = now / 1400 + (k / 3) * Math.PI * 2;
                g.fillStyle(a, 0.7);
                g.fillEllipse(x + Math.cos(aa) * 24, y + Math.sin(aa) * 6, 9, 5);
            }
        } },
    confRing: { a: 0xffd0e0, draw: (g, now, x, fy, c, a) => {
            // 甜点地环：奶油花边环 + 樱桃点缀
            const y = fy + R_DY;
            g.lineStyle(4, c, 0.85);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            for (let k = 0; k < 6; k++) {
                const aa = (k / 6) * Math.PI * 2;
                g.fillStyle(a, 0.9);
                g.fillCircle(x + Math.cos(aa) * 24, y + Math.sin(aa) * 7, 3.4);
            }
        } },
    bigtRing: { a: 0xe8404a, draw: (g, now, x, fy, c, a) => {
            // 彩环地环：马戏大Ring + 一圈彩灯珠
            const y = fy + R_DY;
            g.lineStyle(3.4, c, 0.9);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            for (let k = 0; k < 8; k++) {
                const aa = now / 1100 + (k / 8) * Math.PI * 2;
                g.fillStyle([a, 0xffd45c, 0x4ac8ff, 0xffffff][k % 4], 0.95);
                g.fillCircle(x + Math.cos(aa) * 24, y + Math.sin(aa) * 7, 2.6);
            }
        } },
    aegisRing: { a: 0x8fb4de, draw: (g, now, x, fy, c, a) => {
            // 城堡地环：石砖环 + 四座小城垛
            const y = fy + R_DY;
            g.lineStyle(3.6, c, 0.9);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            for (let k = 0; k < 4; k++) {
                const aa = (k / 4) * Math.PI * 2 + Math.PI / 4;
                const px = x + Math.cos(aa) * 24, py = y + Math.sin(aa) * 7;
                g.fillStyle(a, 0.9);
                g.fillRect(px - 4, py - 6, 8, 5);
                g.fillRect(px - 4, py - 8, 2.6, 3);
                g.fillRect(px + 1.4, py - 8, 2.6, 3);
            }
        } },
    chanRing: { a: 0xd8c8a0, draw: (g, now, x, fy, c, a) => {
            // 茶馆地环：一圈茶汤 + 浮着的茶叶
            const y = fy + R_DY;
            g.fillStyle(c, 0.55);
            g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
            g.lineStyle(2, c, 0.8);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            for (let k = 0; k < 4; k++) {
                const aa = now / 1300 + (k / 4) * Math.PI * 2;
                g.fillStyle(a, 0.85);
                g.fillEllipse(x + Math.cos(aa) * 16, y + Math.sin(aa) * 4.6, 5, 2.4);
            }
        } },
    arcanRing: { a: 0xbfe8ff, draw: (g, now, x, fy, c, a) => {
            // 法阵地环：双环法阵 + 六符文缓转
            const y = fy + R_DY;
            g.lineStyle(2, c, 0.8);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            g.lineStyle(1.4, c, 0.5);
            g.strokeEllipse(x, y, R_RX * 1.4, R_RY * 1.4);
            for (let k = 0; k < 6; k++) {
                const aa = now / 1500 + (k / 6) * Math.PI * 2;
                const px = x + Math.cos(aa) * 24, py = y + Math.sin(aa) * 7;
                g.fillStyle(a, 0.9);
                g.fillRect(px - 1.2, py - 3, 2.4, 6);
            }
        } },
    relicRing: { a: 0xd8c8a0, draw: (g, now, x, fy, c, a) => {
            // 博物馆地环：展台底座环 + 围栏四柱
            const y = fy + R_DY;
            g.lineStyle(3.2, c, 0.85);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            for (let k = 0; k < 4; k++) {
                const px = x - 18 + k * 12;
                rline(g, [[px, y + 2], [px, y - 7]], 1.8, a, 0.8);
            }
            rline(g, [[x - 18, y - 7], [x + 18, y - 7]], 1.8, a, 0.8);
        } },
    playRing: { a: 0xe8404a, draw: (g, now, x, fy, c, a) => {
            // 玩具地环：积木拼的环 + 一颗弹跳小球
            const y = fy + R_DY;
            for (let k = 0; k < 6; k++) {
                const aa = (k / 6) * Math.PI * 2;
                g.fillStyle([c, a, 0x4a90d9][k % 3], 0.95);
                g.fillRect(x + Math.cos(aa) * 22 - 4, y + Math.sin(aa) * 6 - 4, 8, 8);
            }
            const hop = Math.abs(Math.sin(now / 300)) * 8;
            g.fillStyle(0xffd45c, 0.95);
            g.fillCircle(x, y - 6 - hop, 3.4);
        } },
    yuanRing: { a: 0xc0392b, draw: (g, now, x, fy, c, a) => {
            // 灯会地环：红环 + 一圈小灯笼 + 暖光晕
            const y = fy + R_DY;
            g.fillStyle(0xc0392b, 0.25);
            g.fillEllipse(x, y, R_RX * 2.3, R_RY * 2.4);
            g.lineStyle(2.6, a, 0.9);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            for (let k = 0; k < 5; k++) {
                const aa = (k / 5) * Math.PI * 2 + now / 1700;
                const px = x + Math.cos(aa) * 22, py = y + Math.sin(aa) * 6;
                g.fillStyle(0xe8404a, 0.95);
                g.fillEllipse(px, py, 6, 7);
                g.fillStyle(0xffd45c, 0.9);
                g.fillRect(px - 1.4, py - 5.4, 2.8, 1.6);
            }
        } },
    pirateRing: { a: 0xd8c09a, draw: (g, now, x, fy, c, a) => {
            // 甲板地环：木板拼环 + 缆绳结
            const y = fy + R_DY;
            g.lineStyle(4, 0x8a6a3a, 0.9);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            for (let k = 0; k < 5; k++) {
                const aa = (k / 5) * Math.PI * 2 + 0.4;
                rline(g, [[x + Math.cos(aa) * 20, y + Math.sin(aa) * 5.6], [x + Math.cos(aa) * 27, y + Math.sin(aa) * 8]], 1.6, a, 0.8);
            }
            g.fillStyle(a, 0.9);
            g.fillCircle(x, y, 3.4);
        } },
    steamRing: { a: 0xd9b45c, draw: (g, now, x, fy, c, a) => {
            // 压力阀地环：铁环 + 四颗铆钉 + 偶尔喷汽
            const y = fy + R_DY;
            g.lineStyle(4, c, 0.92);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            for (let k = 0; k < 4; k++) {
                const aa = (k / 4) * Math.PI * 2;
                g.fillStyle(a, 0.95);
                g.fillCircle(x + Math.cos(aa) * 24, y + Math.sin(aa) * 7, 2.2);
            }
            const puff = (now / 900) % 1;
            if (puff < 0.5) {
                g.fillStyle(0xffffff, 0.5 * (1 - puff * 2));
                g.fillCircle(x + 20, y - 4 - puff * 14, 3 + puff * 4);
            }
        } },
    astroRing: { a: 0xbfe8ff, draw: (g, now, x, fy, c, a) => {
            // 发射台地环：停机坪圆 + 虚线 + 一枚小火箭影
            const y = fy + R_DY;
            g.fillStyle(c, 0.35);
            g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
            g.lineStyle(2, a, 0.8);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            g.lineStyle(1.4, a, 0.6);
            g.beginPath();
            g.moveTo(x - 14, y);
            g.lineTo(x + 14, y);
            g.strokePath();
            g.beginPath();
            g.moveTo(x, y - 5);
            g.lineTo(x, y + 5);
            g.strokePath();
            g.fillStyle(a, 0.9);
            g.fillTriangle(x + 18, y + 2, x + 24, y + 2, x + 21, y - 6);
        } },
    juraRing: { a: 0x5f8a3a, draw: (g, now, x, fy, c, a) => {
            // 脚印地环：泥地 + 一串三趾恐龙脚印
            const y = fy + R_DY;
            g.fillStyle(0x6a5240, 0.4);
            g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
            for (let k = 0; k < 4; k++) {
                const px = x - 15 + k * 10, py = y + (k % 2) * 2;
                g.fillStyle(a, 0.85);
                for (let t = 0; t < 3; t++) {
                    g.fillEllipse(px + Math.cos((t - 1) * 0.7) * 2.6, py + Math.sin((t - 1) * 0.7) * 1.6, 2.8, 2);
                }
            }
        } },
    mushRing: { a: 0x8a5a8a, draw: (g, now, x, fy, c, a) => {
            // 菌圈地环：一圈小蘑菇（经典 fairy ring）
            const y = fy + R_DY;
            g.lineStyle(1.6, c, 0.5);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            for (let k = 0; k < 6; k++) {
                const aa = (k / 6) * Math.PI * 2;
                const px = x + Math.cos(aa) * 22, py = y + Math.sin(aa) * 6.4;
                g.fillStyle(0xe8d8c0, 0.95);
                g.fillRect(px - 1.2, py - 3, 2.4, 4);
                g.fillStyle(a, 0.95);
                g.fillEllipse(px, py - 4, 7, 3.6);
            }
        } },
    tropicRing: { a: 0xbfe8f0, draw: (g, now, x, fy, c, a) => {
            // 沙滩地环：一圈沙 + 贝壳与海星
            const y = fy + R_DY;
            g.fillStyle(0xf0dcb0, 0.6);
            g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
            g.lineStyle(2, c, 0.7);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            for (let k = 0; k < 3; k++) {
                const aa = (k / 3) * Math.PI * 2 + 0.5;
                const px = x + Math.cos(aa) * 20, py = y + Math.sin(aa) * 5.6;
                if (k % 2) {
                    g.fillStyle(a, 0.9);
                    g.fillTriangle(px, py - 3, px + 3, py + 2, px - 3, py + 2);
                }
                else {
                    g.fillStyle(0xffffff, 0.9);
                    g.fillEllipse(px, py, 5, 3.4);
                }
            }
        } },
    cryptRing: { a: 0x8a9aa8, draw: (g, now, x, fy, c, a) => {
            // 石砖地环：一圈歪斜石砖 + 缝里杂草
            const y = fy + R_DY;
            for (let k = 0; k < 7; k++) {
                const aa = (k / 7) * Math.PI * 2;
                g.fillStyle(k % 2 ? c : 0x3a3a34, 0.92);
                g.save();
                g.translateCanvas(x + Math.cos(aa) * 21, y + Math.sin(aa) * 6);
                g.rotateCanvas(Math.sin(aa) * 0.3);
                g.fillRect(-4.4, -2.4, 8.8, 4.8);
                g.restore();
            }
            g.lineStyle(1.4, a, 0.7);
            g.beginPath();
            g.moveTo(x + 2, y - 4);
            g.lineTo(x + 3, y - 8);
            g.strokePath();
        } },
    festivRing: { a: 0x2c6a44, draw: (g, now, x, fy, c, a) => {
            // 雪原地环：一圈雪 + 雪松小影 + 落雪点
            const y = fy + R_DY;
            g.fillStyle(0xf0f6ff, 0.75);
            g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
            g.lineStyle(2, c, 0.6);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            for (let k = 0; k < 3; k++) {
                const px = x - 12 + k * 12;
                g.fillStyle(a, 0.85);
                g.fillTriangle(px - 3.4, y, px + 3.4, y, px, y - 7);
            }
            for (let k = 0; k < 4; k++) {
                const yy = y - 6 + ((now / 8 + k * 20) % 16);
                g.fillStyle(0xffffff, 0.8);
                g.fillCircle(x - 14 + k * 9, yy, 1.4);
            }
        } },
    sushiRing: { a: 0x8a6a3a, draw: (g, now, x, fy, c, a) => {
            // 木纹地环：拼木地板环 + 木纹线
            const y = fy + R_DY;
            g.fillStyle(0x9a7a4a, 0.5);
            g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
            g.lineStyle(3, c, 0.9);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            for (let k = 0; k < 3; k++) {
                rline(g, [[x - 20 + k * 4, y - 5 + k], [x + 8 + k * 6, y - 5 + k]], 1.2, a, 0.5);
            }
        } },
    wildRing: { a: 0x6a4a2a, draw: (g, now, x, fy, c, a) => {
            // 马蹄地环：沙地 + 一圈马蹄印 + 一个套索
            const y = fy + R_DY;
            g.fillStyle(0xd9b45c, 0.4);
            g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
            g.lineStyle(2, c, 0.75);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            for (let k = 0; k < 4; k++) {
                const aa = (k / 4) * Math.PI * 2 + 0.3;
                g.fillStyle(a, 0.85);
                g.fillEllipse(x + Math.cos(aa) * 20, y + Math.sin(aa) * 5.4, 4.4, 2.6);
            }
            g.lineStyle(1.8, 0x8a6a3a, 0.8);
            g.strokeEllipse(x + 14, y - 2, 8, 3.6); // 套索圈
        } },
    shanRing: { a: 0xbfe8d8, draw: (g, now, x, fy, c, a) => {
            // 昆仑地环：玉环 + 环上云纹 + 一座小昆仑峰影
            const y = fy + R_DY;
            g.lineStyle(3, c, 0.85);
            g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
            g.lineStyle(1.4, a, 0.7);
            g.strokeEllipse(x, y, R_RX * 1.5, R_RY * 1.5);
            for (let k = 0; k < 3; k++) {
                g.lineStyle(1.6, a, 0.8);
                g.beginPath();
                g.arc(x - 10 + k * 10, y + Math.sin(now / 1000 + k) * 1.4, 3.4, Math.PI * 0.9, Math.PI * 1.9);
                g.strokePath();
            }
        } },
};
