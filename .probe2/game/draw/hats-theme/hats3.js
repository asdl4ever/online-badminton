import { hpoly, hline, TAU } from './shared.js';
/** 第三批主题头饰（火山 / 深海沟 / 剑道 / 水墨 / 精灵 / 赛车 / 吸血鬼 / 秋日 / 竹林 / 小丑） */
export const HATS_3 = {
    vulcHelm: { c: 0x3a2a2a, a: 0xff5a1a, draw: (g, now, x, hy, c, a) => {
            // 熔岩头盔：黑盔 + 裂缝透光
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy + 2, 17, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 17, hy + 2, 34, 5);
            g.lineStyle(2, a, 0.7 + 0.3 * Math.sin(now / 200));
            g.lineBetween(x - 10, hy - 8, x - 4, hy - 1);
            g.lineBetween(x + 4, hy - 10, x + 10, hy - 3);
            g.fillStyle(a, 0.5 + 0.2 * Math.sin(now / 160));
            g.fillCircle(x - 5, hy - 3, 2);
            g.fillCircle(x + 7, hy - 5, 1.6);
        } },
    vulcCrown: { c: 0xff5a1a, a: 0x3a2a2a, draw: (g, now, x, hy, c, a) => {
            // 火山王冠：黑曜石锯齿冠 + 灌顶岩浆 + 崩溅火星 + 中峰火山口
            for (let k = 0; k < 5; k++) {
                const px = x - 14 + k * 7;
                hpoly(g, [[px - 3.4, hy + 2], [px + 3.4, hy + 2], [px, hy - 12 - (k === 2 ? 8 : 0)]], k === 2 ? 0x4a3028 : a);
                hpoly(g, [[px - 3.4, hy + 2], [px, hy + 2], [px, hy - 8 - (k === 2 ? 8 : 0)]], 0x55403a, 0.5); // 亮面
            }
            g.fillStyle(a, 1);
            g.fillRect(x - 16, hy + 1, 32, 4);
            g.fillStyle(c, 0.9);
            g.fillEllipse(x, hy - 21, 8, 3); // 火山口
            for (let k = 0; k < 4; k++) {
                const ph = (now / 450 + k / 4) % 1;
                const fx = x + Math.sin(ph * 5 + k * 2) * 8 * ph;
                const fy = hy - 22 - ph * 12;
                g.fillStyle(k % 2 ? c : 0xffd45c, (0.85) * (1 - ph));
                g.fillCircle(fx, fy, (1.8 + (k % 2)) * (1 - ph) + 0.4); // 崩溅火星
            }
            g.lineStyle(1.8, c, 0.75 + 0.25 * Math.sin(now / 170));
            for (let k = 0; k < 5; k++) {
                const px = x - 14 + k * 7;
                const drop = 3 + Math.sin(now / 300 + k) * 1.5;
                g.lineBetween(px, hy - 4, px, hy - 6 - (k === 2 ? 8 : 0) - drop); // 岩浆脉动
            }
        } },
    trenchDiver: { c: 0x8a94a2, a: 0x5ac8ff, draw: (g, now, x, hy, c, a) => {
            // 深潜头盔：黄铜球盔 + 三颗铆钉 + 圆窗
            g.fillStyle(c, 1);
            g.fillCircle(x, hy - 4, 16);
            g.fillStyle(0x6a7482, 0.9);
            g.fillRect(x - 16, hy + 4, 32, 5);
            g.fillStyle(0x2a3a4a, 0.9);
            g.fillCircle(x, hy - 5, 7.4); // 圆窗
            g.fillStyle(a, 0.5 + 0.2 * Math.sin(now / 350));
            g.fillCircle(x - 2, hy - 7, 3);
            g.fillStyle(0xd9b45c, 1);
            g.fillCircle(x - 10, hy + 2, 1.6);
            g.fillCircle(x + 10, hy + 2, 1.6);
            g.fillCircle(x, hy - 16, 1.6);
        } },
    trenchCrown: { c: 0x1a2a4a, a: 0x5affd8, draw: (g, now, x, hy, c, a) => {
            // 沟底王冠：深渊色冠 + 发光珊瑚枝丛 + 磷光气泡 + 潮汐明暗
            g.fillStyle(c, 1);
            g.fillRect(x - 15, hy - 2, 30, 5);
            g.fillStyle(0x24365a, 0.9);
            g.fillRect(x - 15, hy - 2, 30, 2);
            for (let k = 0; k < 4; k++) {
                const px = x - 12 + k * 8;
                const h = k === 1 || k === 2 ? 16 : 11;
                hpoly(g, [[px - 3, hy - 2], [px + 3, hy - 2], [px, hy - 2 - h]], k % 2 ? 0x24365a : c);
                g.lineStyle(1.6, a, 0.55);
                g.lineBetween(px, hy - 4, px - 3, hy - 8 - h * 0.5);
                g.lineBetween(px, hy - 6, px + 3, hy - 10 - h * 0.4); // 珊瑚枝
                const gl = 0.5 + 0.5 * Math.sin(now / 300 + k * 2);
                g.fillStyle(a, gl);
                g.fillCircle(px, hy - 3 - h, 2.4);
                g.fillStyle(a, gl * 0.25);
                g.fillCircle(px, hy - 3 - h, 5.4); // 磷光晕
            }
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1100 + k / 3) % 1;
                g.lineStyle(1.2, 0xffffff, 0.5 * (1 - ph));
                g.strokeCircle(x - 8 + k * 8, hy - 20 - ph * 12, 1.6 * (1 - ph) + 0.4); // 磷光气泡
            }
        } },
    dojoHachimaki: { c: 0xf0f0e8, a: 0xe8404a, draw: (g, now, x, hy, c, a) => {
            // 修行头带：白头带 + 后飘带 + 日之丸
            g.fillStyle(c, 1);
            g.fillRect(x - 16, hy - 10, 32, 9);
            const sway = Math.sin(now / 400) * 3;
            hpoly(g, [[x + 14, hy - 9], [x + 30, hy - 6 + sway], [x + 26, hy - 1 + sway], [x + 14, hy - 3]], c); // 飘带
            g.fillStyle(a, 1);
            g.fillCircle(x, hy - 5.5, 3.4); // 日之丸
        } },
    dojoCrown: { c: 0x2a3a6a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 大师之冠：黑金冠 + 弯月前立
            g.fillStyle(c, 1);
            hpoly(g, [[x - 14, hy + 2], [x - 10, hy - 12], [x + 10, hy - 12], [x + 14, hy + 2]], c);
            g.fillStyle(a, 1);
            g.fillCircle(x, hy - 16, 6);
            g.fillStyle(c, 1);
            g.fillCircle(x + 2.4, hy - 17.5, 5); // 弯月前立
            g.fillStyle(a, 0.8);
            g.fillRect(x - 14, hy - 1, 28, 2.4);
        } },
    inkwHat: { c: 0x2a2e36, a: 0x3a8a5a, draw: (g, now, x, hy, c, a) => {
            // 文人方巾：黑色四方巾 + 玉簪
            g.fillStyle(c, 1);
            hpoly(g, [[x - 13, hy + 2], [x + 13, hy + 2], [x + 13, hy - 12], [x - 13, hy - 12]], c);
            hpoly(g, [[x - 16, hy + 2], [x + 16, hy + 2], [x + 16, hy - 3], [x - 16, hy - 3]], 0x3a3e46); // 巾顶
            g.fillStyle(a, 0.9);
            g.fillRect(x - 16, hy - 4, 32, 2); // 玉色横带
            g.lineStyle(2, 0x8aa84a, 1);
            g.lineBetween(x + 13, hy - 8, x + 22, hy - 12); // 簪
        } },
    inkwCrown: { c: 0x2a2e36, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 状元冠：金翅乌纱 + 展翅摆动 + 金线滚边 + 顶珠光
            g.fillStyle(c, 1);
            hpoly(g, [[x - 12, hy + 2], [x + 12, hy + 2], [x + 9, hy - 14], [x - 9, hy - 14]], c);
            hpoly(g, [[x - 12, hy + 2], [x + 12, hy + 2], [x + 9, hy - 14], [x - 9, hy - 14]], 0x3a404c, 0.4);
            g.lineStyle(1.4, a, 0.9);
            g.beginPath();
            g.moveTo(x - 12, hy + 2);
            g.lineTo(x + 12, hy + 2);
            g.lineTo(x + 9, hy - 14);
            g.lineTo(x - 9, hy - 14);
            g.closePath();
            g.strokePath();
            g.fillStyle(0x1a1e26, 0.9);
            g.fillRect(x - 9, hy - 6, 18, 2.4); // 束带
            const fl = Math.sin(now / 400);
            g.fillStyle(a, 0.95);
            g.fillEllipse(x - 19, hy - 12 + fl * 2, 13, 4.4);
            g.fillEllipse(x + 19, hy - 12 - fl * 2, 13, 4.4);
            g.fillStyle(0xfff0b0, 0.7);
            g.fillEllipse(x - 19, hy - 13.4 + fl * 2, 8, 1.6);
            g.fillEllipse(x + 19, hy - 13.4 - fl * 2, 8, 1.6);
            g.fillStyle(a, 1);
            g.fillCircle(x, hy - 16.5, 3);
            const tw = 0.5 + 0.5 * Math.sin(now / 260);
            g.fillStyle(0xffffff, tw);
            g.fillRect(x - 1, hy - 22, 2, 6);
            g.fillRect(x - 3, hy - 20, 6, 2); // 顶珠闪光
        } },
    fairyHat: { c: 0xffb7d5, a: 0x7ed957, draw: (g, now, x, hy, c, a) => {
            // 花冠：一圈小花
            g.fillStyle(a, 0.8);
            g.fillRect(x - 15, hy - 4, 30, 3); // 藤环
            for (let k = 0; k < 5; k++) {
                const px = x - 12 + k * 6;
                const ang = (k / 5) * TAU + now / 1200;
                g.fillStyle(k % 2 ? c : 0xffffff, 0.95);
                for (let s = 0; s < 5; s++) {
                    g.fillEllipse(px + Math.cos(ang + (s / 5) * TAU) * 3, hy - 8 + Math.sin(ang + (s / 5) * TAU) * 3, 3.4, 2.4);
                }
                g.fillStyle(0xffe89a, 1);
                g.fillCircle(px, hy - 8, 1.6);
            }
        } },
    fairyCrown: { c: 0x7ed957, a: 0xffb7d5, draw: (g, now, x, hy, c, a) => {
            // 藤蔓王冠：盘绕的藤 + 花 + 蝴蝶
            g.lineStyle(2.6, c, 1);
            g.beginPath();
            for (let s = 0; s <= 10; s++) {
                const u = s / 10;
                const px = x - 15 + u * 30;
                const py = hy - 8 + Math.sin(u * 5 + now / 700) * 3;
                if (s === 0)
                    g.moveTo(px, py);
                else
                    g.lineTo(px, py);
            }
            g.strokePath();
            for (let k = 0; k < 3; k++) {
                g.fillStyle(k % 2 ? a : 0xffffff, 0.95);
                g.fillCircle(x - 9 + k * 9, hy - 10 + Math.sin(k * 2) * 2, 2.8);
            }
            const fl = Math.sin(now / 300) * 2;
            g.fillStyle(a, 0.9);
            g.fillEllipse(x + 16, hy - 16 + fl, 6, 4);
            g.fillEllipse(x + 16, hy - 20 + fl, 6, 4); // 蝴蝶
        } },
    racerHelm: { c: 0xe83a3a, a: 0x22222a, draw: (g, now, x, hy, c, a) => {
            // 车手头盔：红盔 + 深色面窗 + 白条纹
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy + 2, 16, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 16, hy + 2, 32, 5);
            g.fillStyle(a, 0.9);
            g.fillRect(x - 11, hy - 7, 22, 6); // 面窗
            g.fillStyle(0x5ac8ff, 0.6);
            g.fillRect(x - 9, hy - 5.5, 18, 2);
            g.fillStyle(0xffffff, 0.9);
            g.fillRect(x - 3, hy - 16, 6, 9);
            g.fillRect(x - 16, hy + 2, 32, 2); // 条纹
        } },
    racerCrown: { c: 0xffd45c, a: 0x5a9a3a, draw: (g, now, x, hy, c, a) => {
            // 冠军桂冠：双环月桂 + 金叶脉 + 中央金牌「1」+ 香槟气泡 + 金屑
            for (let k = 0; k < 10; k++) {
                const ang = Math.PI * 1.08 + (k / 10) * Math.PI * 0.84;
                const px = x + Math.cos(ang) * 18, py = hy - 6 + Math.sin(ang) * 13;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(ang + Math.PI / 2);
                g.fillStyle(k % 2 ? a : 0x7ed957, 0.92);
                g.fillEllipse(0, 0, 7, 3.4);
                g.lineStyle(0.8, 0x3a6a2a, 0.5);
                g.lineBetween(-3, 0, 3, 0);
                g.restore();
            }
            g.fillStyle(c, 1);
            g.fillCircle(x, hy - 10, 6.4);
            g.fillStyle(0x8a6a1a, 0.9);
            g.fillRect(x - 0.8, hy - 13.4, 1.6, 6.8); // 「1」
            g.fillRect(x - 2.6, hy - 13.4, 3.4, 1.4);
            g.fillStyle(0xffffff, 0.5);
            g.fillCircle(x - 2, hy - 12.4, 1.4);
            for (let k = 0; k < 3; k++) {
                const bub = (now / 600 + k / 3) % 1;
                g.fillStyle(0xfff0c0, 0.8 * (1 - bub));
                g.fillCircle(x - 10 + k * 10, hy - 16 - bub * 9, 1.8 * (1 - bub) + 0.5);
            }
            for (let k = 0; k < 3; k++) {
                const ph = (now / 900 + k / 3) % 1;
                g.fillStyle(c, 0.6 * (1 - ph));
                g.fillRect(x - 14 + k * 14 + Math.sin(ph * 4 + k) * 3, hy - 24 - ph * 6, 2.4, 1.2); // 金屑
            }
        } },
    vampHat: { c: 0x1a1420, a: 0x8a1a2a, draw: (g, now, x, hy, c, a) => {
            // 血族礼帽：高顶礼帽 + 红帽带 + 蝙蝠扣
            g.fillStyle(c, 1);
            g.fillRect(x - 12, hy - 26, 24, 26);
            g.fillEllipse(x, hy, 36, 6); // 帽檐
            g.fillStyle(a, 0.9);
            g.fillRect(x - 12, hy - 10, 24, 4); // 帽带
            g.fillStyle(a, 1);
            hpoly(g, [[x - 5, hy - 8], [x - 2, hy - 11], [x, hy - 8], [x + 2, hy - 11], [x + 5, hy - 8]], a); // 蝙蝠翼扣
        } },
    vampCrown: { c: 0x1a1420, a: 0xc0203a, draw: (g, now, x, hy, c, a) => {
            // 血月王冠：黑曜尖齿 + 悬浮血月 + 月下红雾 + 环绕蝙蝠 + 宝石滴血
            for (let k = 0; k < 5; k++) {
                const px = x - 14 + k * 7;
                hpoly(g, [[px - 3.4, hy + 2], [px + 3.4, hy + 2], [px, hy - 12 - (k === 2 ? 6 : 0)]], c);
                hpoly(g, [[px - 3.4, hy + 2], [px, hy + 2], [px, hy - 8 - (k === 2 ? 6 : 0)]], 0x332a44, 0.55);
            }
            g.fillStyle(c, 1);
            g.fillRect(x - 16, hy + 1, 32, 4);
            g.fillStyle(a, 0.5);
            g.fillRect(x - 16, hy + 1, 32, 1.4);
            const gl = 0.6 + 0.3 * Math.sin(now / 300);
            g.fillStyle(a, gl * 0.3);
            g.fillCircle(x, hy - 17, 9.4); // 月晕
            g.fillStyle(a, gl);
            g.fillCircle(x, hy - 17, 6);
            g.fillStyle(0x8a1428, 0.8);
            g.fillCircle(x - 2, hy - 19, 1.8);
            g.fillCircle(x + 2.4, hy - 15, 1.2);
            for (let k = 0; k < 2; k++) {
                const ph = now / 800 + k * 2.4;
                const bx = x + Math.cos(ph) * 14, by = hy - 17 + Math.sin(ph * 1.2) * 7;
                const flap = Math.sin(now / 90 + k * 3) * 2.4;
                g.fillStyle(0x1a1420, 0.95);
                hpoly(g, [[bx - 4.4, by - 1.4 - flap], [bx, by + 1], [bx + 4.4, by - 1.4 - flap], [bx, by + 2]], 0x1a1420, 0.95);
            }
            for (let k = 0; k < 2; k++) {
                const ph = (now / 900 + k / 2) % 1;
                g.fillStyle(a, 0.7 * (1 - ph));
                g.fillCircle(x - 2 + k * 4, hy - 12 + ph * 10, 1.2 * (1 - ph) + 0.3); // 滴血
            }
        } },
    autumnHat: { c: 0xd8b06a, a: 0xc95a2a, draw: (g, now, x, hy, c, a) => {
            // 麦秆帽：草帽 + 麦穗饰带
            g.fillStyle(c, 1);
            g.fillEllipse(x, hy + 2, 42, 8);
            g.beginPath();
            g.arc(x, hy + 1, 13, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.lineStyle(1.4, 0xb08a4a, 0.8);
            g.lineBetween(x - 10, hy - 6, x + 10, hy - 6);
            g.fillStyle(a, 0.95);
            for (let k = 0; k < 5; k++) {
                const px = x - 8 + k * 4;
                g.fillEllipse(px, hy - 8, 2.4, 5); // 麦穗
            }
        } },
    autumnCrown: { c: 0xc95a2a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 枫叶王冠：双层枫叶环 + 叶脉 + 飘落的枫叶 + 枝干冠座
            g.fillStyle(0x8a5a2a, 0.95);
            g.fillRect(x - 16, hy - 2, 32, 4);
            g.lineStyle(1.2, 0x6a4420, 0.7);
            g.lineBetween(x - 16, hy - 1, x + 16, hy - 1);
            for (let k = 0; k < 6; k++) {
                const px = x - 14 + k * 5.6;
                const sway = Math.sin(now / 500 + k) * 1.2;
                g.save();
                g.translateCanvas(px, hy - 7 + sway);
                g.rotateCanvas((k - 2.5) * 0.25);
                g.fillStyle(0x9a4a1a, 0.95);
                hpoly(g, [[0, -1], [Math.cos(1.57) * 7 - 1.8, Math.sin(1.57) * 7], [Math.cos(1.57) * 7 + 1.8, Math.sin(1.57) * 7]], 0x9a4a1a, 0.7); // 后层叶
                for (let s = 0; s < 4; s++) {
                    const ang = (s / 4) * TAU;
                    hpoly(g, [[0, 0], [Math.cos(ang) * 6.4 - 1.8, Math.sin(ang) * 6.4], [Math.cos(ang) * 6.4 + 1.8, Math.sin(ang) * 6.4]], k % 2 ? c : a, 0.95);
                }
                g.lineStyle(0.8, 0x6a3010, 0.6);
                g.lineBetween(0, 4, 0, -5); // 叶脉
                g.restore();
            }
            for (let k = 0; k < 2; k++) {
                const ph = (now / 1400 + k / 2) % 1;
                g.save();
                g.translateCanvas(x - 16 + ph * 32 + Math.sin(ph * 5 + k) * 4, hy - 16 + ph * 14);
                g.rotateCanvas(now / 300 + k);
                hpoly(g, [[0, -2.4], [2.4, 0], [0, 2.4], [-2.4, 0]], k % 2 ? c : a, 0.7 * (1 - ph));
                g.restore();
            }
        } },
    pandaHat: { c: 0x8fbf5a, a: 0x2a2a2a, draw: (g, now, x, hy, c, a) => {
            // 竹叶帽：竹编帽 + 竹叶
            hpoly(g, [[x - 18, hy + 1], [x - 6, hy - 12], [x + 6, hy - 12], [x + 18, hy + 1]], 0xa8c878);
            g.lineStyle(1.2, 0x6a8a4a, 0.8);
            for (let k = -1; k <= 1; k++)
                hline(g, [[x + k * 8, hy - 9 + Math.abs(k) * 7], [x + k * 10, hy + 1]], 1.2, 0x6a8a4a, 0.8);
            for (const s of [-1, 1]) {
                g.save();
                g.translateCanvas(x + s * 8, hy - 10);
                g.rotateCanvas(s * 0.8);
                g.fillStyle(c, 0.95);
                g.fillEllipse(s * 6, -3, 10, 3.6);
                g.restore();
            }
            g.fillStyle(a, 0.8);
            g.fillCircle(x, hy - 11, 2); // 结
        } },
    pandaCrown: { c: 0x4a9a7a, a: 0x8fbf5a, draw: (g, now, x, hy, c, a) => {
            // 竹王冠：竹节丛 + 顶生竹叶 + 垂下的竹叶 + 嫩芽
            for (let k = 0; k < 4; k++) {
                const px = x - 13 + k * 8.6;
                const h = k === 1 || k === 2 ? 17 : 12;
                g.fillStyle(k % 2 ? c : 0x3a7a5a, 0.95);
                g.fillRoundedRect(px - 3.4, hy - h, 6.8, h + 2, 3);
                g.fillStyle(a, 0.7);
                g.fillRect(px - 3.4, hy - h * 0.45, 6.8, 1.6);
                g.fillRect(px - 3.4, hy - h * 0.75, 6.8, 1.4);
                g.fillStyle(0xffffff, 0.3);
                g.fillRect(px - 3.4, hy - h, 2, h + 2);
                g.fillStyle(0x6fbf8a, 0.9);
                g.fillCircle(px, hy - h - 1, 1.6); // 顶芽
            }
            for (const s of [-1, 1]) {
                const bx = x + s * 15;
                g.save();
                g.translateCanvas(bx, hy - 6);
                g.rotateCanvas(s * (0.7 + Math.sin(now / 700) * 0.06));
                g.fillStyle(a, 0.9);
                g.fillEllipse(s * 6, -3, 12, 4);
                g.fillStyle(0x2a5a3a, 0.6);
                g.lineStyle(0.8, 0x2a5a3a, 0.5);
                g.lineBetween(0, 0, s * 10, -4);
                g.restore();
            }
        } },
    jokerHat: { c: 0xe83a5a, a: 0xf0f0f0, draw: (g, now, x, hy, c, a) => {
            // 方片帽：歪斜的方片花色帽
            g.save();
            g.translateCanvas(x, hy);
            g.rotateCanvas(-0.12);
            hpoly(g, [[-13, 2], [13, 2], [9, -18], [-9, -18]], c);
            g.fillStyle(a, 0.95);
            hpoly(g, [[0, -14], [4, -10], [0, -6], [-4, -10]], a); // 方片
            g.fillStyle(0xffffff, 0.5);
            g.fillRect(-9, -18, 18, 2);
            g.restore();
            g.fillStyle(0xffffff, 0.6);
            g.fillEllipse(x, hy + 2, 32, 4); // 帽檐
        } },
    jokerCrown: { c: 0xffd45c, a: 0xe83a5a, draw: (g, now, x, hy, c, a) => {
            // 国王牌冠：金冠 + 红宝石 + 小丑尖
            hpoly(g, [[x - 15, hy + 2], [x - 10, hy - 13], [x - 4, hy - 5], [x, hy - 18], [x + 4, hy - 5], [x + 10, hy - 13], [x + 15, hy + 2]], c);
            g.fillStyle(a, 1);
            g.fillCircle(x - 10, hy - 13, 2.2);
            g.fillCircle(x + 10, hy - 13, 2.2);
            g.fillCircle(x, hy - 18, 2.6); // 尖顶球
            g.fillStyle(0x2a1a44, 1);
            g.fillCircle(x, hy - 4, 2.8); // 宝石
            g.fillStyle(0xffffff, 0.5);
            g.fillCircle(x - 1, hy - 5, 1);
        } },
};
