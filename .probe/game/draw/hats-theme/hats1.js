import { hpoly, TAU } from './shared.js';
/** 第一批主题头饰（沙漠 / 云端 / 甜点 / 马戏 / 骑士 / 茶馆 / 魔法 / 化石 / 玩具 / 元宵 / 山海） */
export const HATS_1 = {
    desTurban: { c: 0xf0e0c0, a: 0xc9803a, draw: (g, now, x, hy, c, a) => {
            // 商队头巾：缠出的头巾 + 额前宝石
            g.fillStyle(c, 1);
            g.fillEllipse(x, hy - 6, 34, 22);
            g.lineStyle(3, 0xc8b088, 0.9);
            g.beginPath();
            g.arc(x, hy - 4, 14, -2.9, -0.3);
            g.strokePath();
            g.beginPath();
            g.arc(x, hy - 8, 11, -2.7, -0.5);
            g.strokePath();
            g.fillStyle(a, 1);
            g.fillCircle(x, hy - 12, 4); // 额饰
            g.fillStyle(0xffffff, 0.5);
            g.fillCircle(x - 1.4, hy - 13.4, 1.4);
        } },
    desScarab: { c: 0x2f8a6a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 圣甲虫帽：金环上一只张翅圣甲虫
            g.fillStyle(a, 1);
            g.fillRect(x - 16, hy - 2, 32, 5); // 金环
            const wing = Math.sin(now / 400) * 2;
            g.fillStyle(0x8fd4c0, 0.9);
            g.fillEllipse(x - 8, hy - 10 - wing, 10, 5);
            g.fillEllipse(x + 8, hy - 10 - wing, 10, 5);
            g.fillStyle(c, 1);
            g.fillEllipse(x, hy - 10, 14, 12); // 虫身
            g.lineStyle(1.4, a, 0.9);
            g.lineBetween(x, hy - 16, x, hy - 5);
            g.fillStyle(a, 1);
            g.fillCircle(x, hy - 18, 2.6); // 头
        } },
    nimbHalo: { c: 0xeaf6ff, a: 0x9ad4ff, draw: (g, now, x, hy, c, a) => {
            // 云光环：悬在头顶上方的一圈云
            const fl = Math.sin(now / 500) * 2;
            for (let k = 0; k < 7; k++) {
                const ang = (k / 7) * TAU + now / 3000;
                g.fillStyle(k % 2 ? c : 0xffffff, 0.95);
                g.fillCircle(x + Math.cos(ang) * 20, hy - 24 + Math.sin(ang) * 7 + fl, 7 - k % 3);
            }
            g.fillStyle(a, 0.35);
            g.fillCircle(x, hy - 24 + fl, 22);
        } },
    nimbCrown: { c: 0xffffff, a: 0x9ad4ff, draw: (g, now, x, hy, c, a) => {
            // 云冠：前后两层云堆出的立体云冠 + 云隙金光 + 飘散云絮
            g.fillStyle(0xd8e8f8, 0.95);
            for (let k = 0; k < 4; k++)
                g.fillCircle(x - 15 + k * 10, hy - 10, 6.4); // 后层云
            g.fillStyle(0xbfe0ff, 0.9);
            g.fillCircle(x - 5, hy - 15, 8);
            g.fillCircle(x + 6, hy - 14, 7);
            const gl = 0.5 + 0.5 * Math.sin(now / 400);
            g.fillStyle(0xffe89a, 0.55 * gl);
            g.fillCircle(x, hy - 18, 5); // 云隙间的金光
            g.fillStyle(0xffffff, 0.95);
            for (let k = 0; k < 3; k++) {
                const px = x - 13 + k * 13;
                g.fillCircle(px, hy - 6, 7);
                g.fillCircle(px - 5, hy - 3, 5);
                g.fillCircle(px + 5, hy - 3, 5); // 前层大云团
            }
            g.fillStyle(c, 1);
            g.fillRect(x - 18, hy - 2, 36, 5);
            g.lineStyle(1.6, a, 0.7);
            g.strokeRect(x - 18, hy - 2, 36, 5);
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1300 + k / 3) % 1;
                g.fillStyle(0xffffff, 0.7 * (1 - ph));
                g.fillCircle(x - 14 + k * 14 + Math.sin(ph * 4 + k) * 4, hy - 24 - ph * 10, 2.4 * (1 - ph) + 0.6); // 飘散云絮
            }
        } },
    confCake: { c: 0xfff0e0, a: 0xff869c, draw: (g, now, x, hy, c, a) => {
            // 蛋糕帽：双层小蛋糕 + 顶樱桃
            g.fillStyle(a, 1);
            g.fillRoundedRect(x - 15, hy - 12, 30, 10, 4);
            g.fillStyle(c, 1);
            g.fillRoundedRect(x - 18, hy - 22, 36, 11, 4);
            g.fillStyle(0xffffff, 0.8);
            g.fillEllipse(x, hy - 22, 36, 5); // 奶油
            g.fillStyle(0xd93a5a, 1);
            g.fillCircle(x, hy - 28, 3.4); // 樱桃
            g.lineStyle(1.4, 0x5a8a3a, 0.9);
            g.lineBetween(x, hy - 31, x + 3, hy - 34);
        } },
    confCrown: { c: 0xffb7d5, a: 0xfff0e0, draw: (g, now, x, hy, c, a) => {
            // 糖霜冠：双层挤糖尖 + 淋酱 + 彩糖粒 + 顶樱桃 + 糖光
            g.fillStyle(c, 1);
            g.fillRect(x - 17, hy + 1, 34, 4);
            for (let k = 0; k < 4; k++) {
                const px = x - 14 + k * 9.4;
                hpoly(g, [[px - 5, hy + 2], [px + 5, hy + 2], [px, hy - 16 - (k === 1 || k === 2 ? 5 : 0)]], c);
                hpoly(g, [[px - 2, hy + 1], [px + 2, hy + 1], [px + 0.6, hy - 10 - (k === 1 || k === 2 ? 4 : 0)]], 0xffd0e4); // 高光面
            }
            g.fillStyle(a, 0.95);
            for (let k = 0; k < 4; k++) {
                const px = x - 14 + k * 9.4;
                const drop = 4 + Math.abs(Math.sin(now / 500 + k)) * 3;
                g.fillCircle(px, hy + 2 + drop * 0.5, 2.6);
                g.fillEllipse(px + 3, hy + 3, 1.6, 4 + drop * 0.4); // 淋酱条
            }
            const sprinkle = [0xff5a5a, 0x9effd0, 0xffd45c, 0x4ac8ff];
            for (let k = 0; k < 7; k++) {
                const px = x - 13 + k * 4.6, py = hy - 6 - (k % 3) * 5;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(k * 1.3);
                g.fillStyle(sprinkle[k % 4], 0.95);
                g.fillRect(-1.6, -0.7, 3.2, 1.4);
                g.restore();
            }
            const tw = 0.6 + 0.4 * Math.sin(now / 300);
            g.fillStyle(0xffffff, tw * 0.9);
            g.fillCircle(x - 4, hy - 15, 1.4);
            g.fillCircle(x + 6, hy - 18, 1.1);
        } },
    bigtClown: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 小丑帽：三根歪斜的尖角各带铃铛
            for (let k = -1; k <= 1; k++) {
                const tipX = x + k * 14, tipY = hy - 26 - Math.abs(k) * -4;
                const sway = Math.sin(now / 300 + k) * 2;
                hpoly(g, [[x + k * 9 - 4, hy + 2], [x + k * 9 + 4, hy + 2], [tipX + sway, tipY]], k === 0 ? a : c);
                g.fillStyle(0xffffff, 1);
                g.fillCircle(tipX + sway, tipY - 2, 2.8);
            }
            g.fillStyle(a, 1);
            g.fillRect(x - 14, hy + 1, 28, 4);
        } },
    bigtRing: { c: 0xffd45c, a: 0xe8404a, draw: (g, now, x, hy, c, a) => {
            // 彩环头饰：十字双环旋转 + 彩珠拖尾光 + 环心闪光
            const fl = Math.sin(now / 400) * 2;
            const rot = now / 700;
            for (let k = 0; k < 2; k++) {
                g.save();
                g.translateCanvas(x, hy - 22 + fl);
                g.rotateCanvas(k * Math.PI / 2 + Math.sin(now / 500 + k) * 0.12);
                g.lineStyle(4.4, k ? a : c, 0.9);
                g.beginPath();
                g.arc(0, 0, 19 - k * 3, 0.3, Math.PI + 0.3);
                g.strokePath();
                g.lineStyle(1.6, 0xffffff, 0.5);
                g.beginPath();
                g.arc(0, 0, 19 - k * 3, 0.3, Math.PI + 0.3);
                g.strokePath();
                g.restore();
            }
            const cols = [c, a, 0x4ac8ff, 0x9effd0];
            for (let k = 0; k < 4; k++) {
                const ang = rot + (k / 4) * TAU;
                const px = x + Math.cos(ang) * 19, py = hy - 22 + fl + Math.sin(ang) * 8;
                g.fillStyle(cols[k], 0.95);
                g.fillCircle(px, py, 3);
                g.fillStyle(0xffffff, 0.5);
                g.fillCircle(px - 1, py - 1, 1);
                g.fillStyle(cols[k], 0.25);
                g.fillCircle(px - Math.cos(ang) * 5, py - Math.sin(ang) * 2.4, 1.8); // 拖尾
            }
            const tw = 0.5 + 0.5 * Math.sin(now / 260);
            g.fillStyle(0xffffff, tw * 0.9);
            g.fillRect(x - 1, hy - 24 + fl - 3, 2, 6);
            g.fillRect(x - 3, hy - 24 + fl - 1, 6, 2);
        } },
    aegisHelm: { c: 0xc0ccda, a: 0x8a94a2, draw: (g, now, x, hy, c, a) => {
            // 骑士盔：钢盔 + 面甲缝
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy, 17, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 17, hy, 34, 8);
            g.fillStyle(0x2a2a32, 1);
            g.fillRect(x - 12, hy - 4, 24, 3); // 观察缝
            g.fillRect(x - 2, hy + 2, 4, 6); // 呼吸缝
            g.lineStyle(1.6, a, 0.8);
            g.beginPath();
            g.arc(x, hy, 17, Math.PI, TAU);
            g.strokePath();
            g.fillStyle(0xdfe6f0, 0.7);
            g.fillEllipse(x - 6, hy - 10, 10, 4); // 高光
        } },
    aegisCrest: { c: 0xc0ccda, a: 0xc0392b, draw: (g, now, x, hy, c, a) => {
            // 骑士冠：钢盔 + 红缨冠羽
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy, 16, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 16, hy, 32, 7);
            g.fillStyle(0x2a2a32, 1);
            g.fillRect(x - 11, hy - 4, 22, 3);
            g.fillStyle(a, 1);
            for (let k = 0; k < 4; k++) {
                const sway = Math.sin(now / 350 + k) * 2;
                g.fillEllipse(x + k * 5 - 8, hy - 20 - (k === 1 || k === 2 ? 4 : 0) + sway, 7, 14);
            }
            g.fillStyle(0xffd45c, 1);
            g.fillRect(x - 3, hy - 14, 6, 4); // 冠座
        } },
    chanHat: { c: 0x2f7a4a, a: 0xf0e0c0, draw: (g, now, x, hy, c, a) => {
            // 茶笠：宽大的斗笠 + 系带
            hpoly(g, [[x - 24, hy], [x - 8, hy - 16], [x + 8, hy - 16], [x + 24, hy]], c);
            g.fillStyle(0x3a8a5a, 0.9);
            hpoly(g, [[x - 8, hy - 16], [x + 8, hy - 16], [x, hy - 20]], 0x3a8a5a);
            g.lineStyle(1.6, a, 0.7);
            for (let k = -1; k <= 1; k++)
                g.lineBetween(x + k * 8, hy - 14 + Math.abs(k) * 6, x + k * 8, hy - 2 + Math.abs(k) * 1);
            g.fillStyle(a, 0.9);
            g.fillCircle(x, hy - 17, 2.6); // 笠顶
        } },
    chanLantern: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 灯笼头饰：细杆挑一盏小灯
            g.lineStyle(2.4, 0x8a5a2a, 1);
            g.lineBetween(x - 10, hy + 2, x - 10, hy - 18);
            g.lineBetween(x - 10, hy - 18, x + 8, hy - 18);
            const sway = Math.sin(now / 500) * 2;
            g.fillStyle(c, 0.95);
            g.fillEllipse(x + 8 + sway, hy - 11, 12, 14);
            g.fillStyle(a, 0.6 + 0.3 * Math.sin(now / 260));
            g.fillEllipse(x + 8 + sway, hy - 11, 5, 9);
            g.fillStyle(a, 1);
            g.fillRect(x + 3 + sway, hy - 18, 10, 2);
            g.fillRect(x + 3 + sway, hy - 5, 10, 2);
        } },
    arcanCap: { c: 0x4a2a8a, a: 0xb46cff, draw: (g, now, x, hy, c, a) => {
            // 魔法帽：弯尖尖帽 + 星屑
            hpoly(g, [[x - 15, hy + 2], [x + 15, hy + 2], [x + 4 + Math.sin(now / 700) * 3, hy - 32]], c);
            g.fillStyle(c, 1);
            g.fillRect(x - 20, hy + 2, 40, 5); // 帽檐
            g.lineStyle(1.6, a, 0.8);
            g.beginPath();
            g.arc(x, hy - 2, 14, -2.7, -0.5);
            g.strokePath(); // 帽带
            g.fillStyle(a, 1);
            g.fillCircle(x + 3, hy - 16, 2.4); // 星
            g.fillStyle(0xffffff, 0.7 * Math.abs(Math.sin(now / 300)));
            g.fillCircle(x + 10, hy - 22, 1.4);
        } },
    arcanCrown: { c: 0xb46cff, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 星月冠：冠座 + 弯月 + 星星
            g.fillStyle(c, 1);
            g.fillRect(x - 15, hy - 4, 30, 6);
            hpoly(g, [[x - 15, hy - 4], [x - 10, hy - 16], [x - 5, hy - 4]], c);
            hpoly(g, [[x + 5, hy - 4], [x + 10, hy - 16], [x + 15, hy - 4]], c);
            // 弯月
            g.fillStyle(a, 1);
            g.fillCircle(x, hy - 15, 6);
            g.fillStyle(c, 1);
            g.fillCircle(x + 2.6, hy - 16.5, 5);
            const tw = 0.5 + 0.5 * Math.sin(now / 250);
            g.fillStyle(a, tw);
            g.fillRect(x + 10, hy - 24 - 1, 2, 4);
            g.fillRect(x + 9, hy - 23, 4, 2);
        } },
    relicBone: { c: 0xd8c8a0, a: 0x8a6a3a, draw: (g, now, x, hy, c, a) => {
            // 骨头帽：交叉的两根骨头
            g.fillStyle(c, 1);
            for (const rot of [-0.5, 0.5]) {
                g.save();
                g.translateCanvas(x, hy - 8);
                g.rotateCanvas(rot);
                g.fillRoundedRect(-13, -2.4, 26, 4.8, 2.4);
                g.fillCircle(-13, -2.6, 3);
                g.fillCircle(-13, 2.6, 3);
                g.fillCircle(13, -2.6, 3);
                g.fillCircle(13, 2.6, 3);
                g.restore();
            }
            g.fillStyle(a, 0.9);
            g.fillCircle(x, hy - 8, 3); // 缚结
        } },
    relicAmber: { c: 0xd8902a, a: 0xffe8b0, draw: (g, now, x, hy, c, a) => {
            // 琥珀冠：金环 + 三颗琥珀
            g.fillStyle(a, 1);
            g.fillRect(x - 15, hy - 2, 30, 4);
            for (let k = -1; k <= 1; k++) {
                const px = x + k * 10;
                const s = k === 0 ? 6 : 4.4;
                g.fillStyle(c, 0.85);
                g.fillCircle(px, hy - 6 - s * 0.4, s);
                g.fillStyle(0xffe8b0, 0.7);
                g.fillCircle(px - s * 0.3, hy - 8 - s * 0.4, s * 0.3);
            }
            g.fillStyle(0x2a2a2a, 0.7);
            g.fillEllipse(x - 3, hy - 8, 3, 1.6); // 琥珀里的虫
        } },
    playBlock: { c: 0xe8404a, a: 0x4a90d9, draw: (g, now, x, hy, c, a) => {
            // 积木头饰：三块积木叠罗汉
            g.fillStyle(c, 1);
            g.fillRect(x - 15, hy - 8, 30, 9);
            g.fillStyle(a, 1);
            g.fillRect(x - 8, hy - 17, 16, 9);
            g.fillStyle(0xffd45c, 1);
            g.fillRect(x - 4, hy - 25, 8, 8);
            g.fillStyle(0xffffff, 0.5);
            g.fillRect(x - 15, hy - 8, 30, 2);
            g.fillRect(x - 8, hy - 17, 16, 2);
            g.fillStyle(0x000000, 0.15);
            g.fillRect(x - 4, hy - 19, 8, 2);
        } },
    playTop: { c: 0x4a90d9, a: 0xe8404a, draw: (g, now, x, hy, c, a) => {
            // 陀螺头饰：条纹锥体 + 旋转残影圈 + 底尖火花 + 飞舞彩带
            const rot = now / 300;
            g.save();
            g.translateCanvas(x, hy - 12);
            g.rotateCanvas(Math.sin(rot) * 0.15);
            hpoly(g, [[-11, -4], [11, -4], [3, 9], [-3, 9]], c);
            hpoly(g, [[0, -4], [11, -4], [3, 9]], 0x6ab0f0); // 亮面
            g.fillStyle(a, 1);
            g.fillRect(-11, -7, 22, 3.4);
            g.fillStyle(0xffd45c, 1);
            g.fillRect(-11, -7, 22, 1.4);
            g.lineStyle(2, 0xffd45c, 0.9);
            g.lineBetween(0, 9, 0, 13);
            g.fillStyle(0xffd45c, 0.9);
            g.fillCircle(0, 13.4, 1.4);
            g.restore();
            for (let k = 0; k < 5; k++) {
                const ang = rot * 2 + (k / 5) * TAU;
                const al = 0.4 - k * 0.07;
                g.fillStyle(a, al);
                g.fillCircle(x + Math.cos(ang) * (14 + k), hy - 14 + Math.sin(ang) * 5, 1.6 - k * 0.2);
            }
            const spark = 0.5 + 0.5 * Math.sin(now / 160);
            g.fillStyle(0xffd45c, spark * 0.9);
            g.fillCircle(x, hy + 2, 1.8 + spark); // 底尖摩擦火花
            for (let k = 0; k < 2; k++) {
                const ph = (now / 600 + k / 2) % 1;
                g.save();
                g.translateCanvas(x - 12 + ph * 24, hy - 22 - Math.sin(ph * Math.PI) * 8);
                g.rotateCanvas(Math.sin(now / 300 + k) * 1.2);
                g.fillStyle(k ? a : 0x9effd0, 0.7 * (1 - ph));
                g.fillRect(-3, -1.4, 6, 2.8);
                g.restore();
            }
        } },
    yuanLamp: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 花灯头饰：头顶一盏小花灯 + 垂穗
            const sway = Math.sin(now / 500) * 2;
            g.fillStyle(c, 0.95);
            g.fillEllipse(x + sway, hy - 12, 20, 24);
            g.fillStyle(a, 0.85);
            g.fillRect(x - 9 + sway, hy - 22, 18, 3);
            g.fillRect(x - 9 + sway, hy - 4, 18, 3);
            g.lineStyle(1.2, a, 0.8);
            g.lineBetween(x + sway, hy - 12, x + sway, hy - 22);
            g.lineBetween(x + sway, hy - 12, x + sway, hy - 4);
            g.fillStyle(a, 0.9);
            g.fillRect(x - 1 + sway, hy + 1, 2, 6 + Math.sin(now / 350) * 2); // 垂穗
            g.fillStyle(0xfff0c0, 0.6 + 0.3 * Math.sin(now / 300));
            g.fillEllipse(x + sway, hy - 12, 7, 12);
        } },
    yuanMask: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 面具头饰：华丽歌剧面具——金饰边 + 羽饰 + 亮片 + 面容微摆
            const sway = Math.sin(now / 600) * 1.4;
            g.save();
            g.translateCanvas(x + 8 + sway * 0.5, hy - 8);
            g.rotateCanvas(0.32 + sway * 0.02);
            // 羽饰（面具左上三根）
            for (let k = -1; k <= 1; k++) {
                g.save();
                g.translateCanvas(k * 4 - 8, -6);
                g.rotateCanvas(-0.6 + k * 0.4);
                g.fillStyle(k === 0 ? a : 0x4ac8ff, 0.9);
                g.fillEllipse(0, -7, 4.4, 14);
                g.restore();
            }
            g.fillStyle(c, 0.95);
            hpoly(g, [[-12, -4], [12, -4], [10, 6], [0, 10], [-10, 6]], c);
            g.fillStyle(0x6a1020, 0.35);
            hpoly(g, [[-12, -4], [0, -4], [0, 10], [-10, 6]], 0x6a1020, 0.3); // 暗面
            g.lineStyle(1.6, a, 0.9);
            g.beginPath();
            g.moveTo(-12, -4);
            g.lineTo(12, -4);
            g.lineTo(10, 6);
            g.lineTo(0, 10);
            g.lineTo(-10, 6);
            g.closePath();
            g.strokePath();
            g.fillStyle(0x1a1a2a, 0.95);
            g.fillEllipse(-5, 0, 5, 3);
            g.fillEllipse(5, 0, 5, 3);
            g.fillStyle(a, 1);
            g.fillRect(-2, 4, 4, 2);
            const gl = 0.5 + 0.5 * Math.sin(now / 280);
            g.fillStyle(0xffffff, gl * 0.9);
            g.fillCircle(-9, -1, 1);
            g.fillCircle(8.4, 2, 0.8);
            g.fillCircle(0, 7, 0.8); // 亮片
            g.restore();
        } },
    shanHatFeather: { c: 0xd8e8ff, a: 0x3a9a7a, draw: (g, now, x, hy, c, a) => {
            // 鹤羽笠：小斗笠 + 两根白鹤羽
            hpoly(g, [[x - 18, hy], [x, hy - 12], [x + 18, hy]], 0x8a9a6a);
            g.lineStyle(1.4, 0xffffff, 0.5);
            g.lineBetween(x - 10, hy - 3, x + 10, hy - 3);
            for (const s of [-1, 1]) {
                const sway = Math.sin(now / 600 + s) * 2;
                g.save();
                g.translateCanvas(x + s * 6, hy - 10);
                g.rotateCanvas(s * 0.7);
                g.fillStyle(c, 0.95);
                g.fillEllipse(s * 5 + sway, -6, 6, 16);
                g.restore();
            }
            g.fillStyle(a, 1);
            g.fillCircle(x, hy - 12, 2.4);
        } },
    shanHatDragon: { c: 0x3a9a7a, a: 0xd42a2a, draw: (g, now, x, hy, c, a) => {
            // 螭龙角：一对后掠的玉角
            for (const s of [-1, 1]) {
                hpoly(g, [
                    [x + s * 6, hy + 2], [x + s * 12, hy - 10], [x + s * 20, hy - 22], [x + s * 22, hy - 26],
                    [x + s * 14, hy - 20], [x + s * 8, hy - 8],
                ], c);
                g.fillStyle(0xffffff, 0.35);
                g.fillEllipse(x + s * 13, hy - 12, 4, 10); // 玉的光
            }
            g.fillStyle(a, 0.9);
            g.fillRect(x - 12, hy + 1, 24, 3); // 赤色箍
        } },
};
