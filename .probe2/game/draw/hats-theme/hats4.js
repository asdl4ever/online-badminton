import { hpoly, hline, TAU } from './shared.js';
/** 第四批主题头饰（衙门 / 风暴 / 月宫 / 维京 / 猎游 / 剧院 / 北境 / 威尼斯 / 奥林匹斯 / 桑巴） */
export const HATS_4 = {
    pagodHat: { c: 0x1a1a22, a: 0xc0392b, draw: (g, now, x, hy, c, a) => {
            // 乌纱帽：黑纱帽 + 双翅
            g.fillStyle(c, 1);
            hpoly(g, [[x - 13, hy + 2], [x + 13, hy + 2], [x + 10, hy - 14], [x - 10, hy - 14]], c);
            const sway = Math.sin(now / 450) * 2;
            g.fillStyle(0x2a2a32, 0.95);
            g.fillEllipse(x - 20, hy - 10 + sway, 14, 4); // 左翅
            g.fillEllipse(x + 20, hy - 10 + sway, 14, 4); // 右翅
            g.fillStyle(a, 0.9);
            g.fillRect(x - 13, hy - 2, 26, 2); // 帽正
        } },
    pagodCrown: { c: 0xc0392b, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 将军盔缨：红缨盔
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy + 2, 15, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 15, hy + 2, 30, 4);
            g.fillStyle(a, 1);
            g.fillCircle(x, hy - 14, 2.6); // 缨座
            for (let k = 0; k < 4; k++) {
                const sway = Math.sin(now / 300 + k) * 2.4;
                g.fillStyle(k % 2 ? a : 0xe05a4a, 0.95);
                g.fillEllipse(x + (k - 1.5) * 4 + sway, hy - 20 - Math.abs(k - 1.5) * 2, 3, 9);
            }
            g.fillStyle(0xffd45c, 0.9);
            hline(g, [[x - 15, hy - 1], [x + 15, hy - 1]], 1.6, 0xffd45c, 0.9);
        } },
    stormHat: { c: 0x3a4a5a, a: 0x7ae0ff, draw: (g, now, x, hy, c, a) => {
            // 风镜帽：飞行帽 + 风镜
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy, 16, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 16, hy, 32, 5);
            g.fillStyle(0x6a7a8a, 0.9);
            g.fillRect(x - 16, hy - 2, 32, 3); // 帽耳带
            g.fillStyle(0x1a2430, 0.9);
            g.fillCircle(x - 8, hy - 6, 6);
            g.fillCircle(x + 8, hy - 6, 6); // 镜框
            g.fillStyle(a, 0.55 + 0.2 * Math.sin(now / 300));
            g.fillCircle(x - 8, hy - 6, 4);
            g.fillCircle(x + 8, hy - 6, 4);
        } },
    stormCrown: { c: 0x3a4a6a, a: 0x7ae0ff, draw: (g, now, x, hy, c, a) => {
            // 雷云之冠：双层积雨云冠 + 云隙劈雷 + 雨丝 + 电离光
            g.fillStyle(0x2c3a56, 0.95);
            for (let k = 0; k < 4; k++)
                g.fillCircle(x - 12 + k * 8, hy - 6, 6.4); // 后层暗云
            g.fillStyle(c, 1);
            for (let k = 0; k < 5; k++)
                g.fillCircle(x - 13 + k * 6.5, hy - 9, 6.4);
            g.fillStyle(0x4a5c80, 0.6);
            g.fillCircle(x - 8, hy - 13, 4);
            g.fillCircle(x + 9, hy - 12, 3.4); // 云顶亮团
            g.fillRect(x - 16, hy - 4, 32, 6);
            g.lineStyle(1.2, a, 0.3);
            for (let k = 0; k < 4; k++) {
                const ph = (now / 400 + k / 4) % 1;
                g.lineBetween(x - 12 + k * 8, hy - 2, x - 13 + k * 8, hy + 2 + ph * 4); // 雨丝
            }
            const strike = Math.sin(now / 170) > 0.55;
            if (strike) {
                g.lineStyle(2.4, a, 0.95);
                hline(g, [[x - 5, hy - 14], [x - 1, hy - 8], [x - 5, hy - 4]], 2.4, 0xffffff, 0.95);
                g.lineStyle(5, a, 0.25);
                hline(g, [[x - 5, hy - 14], [x - 1, hy - 8], [x - 5, hy - 4]], 5, a, 0.3);
            }
            g.lineStyle(1.6, a, 0.6 + 0.3 * Math.sin(now / 90));
            hline(g, [[x + 7, hy - 12], [x + 10, hy - 6]], 1.6, a, 0.7);
            const p1 = 0.5 + 0.5 * Math.sin(now / 240);
            g.fillStyle(a, 0.1 + p1 * 0.08);
            g.fillCircle(x, hy - 10, 20); // 电离光
        } },
    lunarHat: { c: 0xd8c8a0, a: 0x8a5a2a, draw: (g, now, x, hy, c, a) => {
            // 桂枝帽：布帽 + 一枝桂花
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy + 1, 14, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillEllipse(x, hy + 1, 36, 6);
            g.lineStyle(2, 0x6a4a2a, 1);
            g.lineBetween(x - 8, hy - 4, x + 2, hy - 16);
            g.fillStyle(0xffe89a, 0.95);
            for (let k = 0; k < 4; k++)
                g.fillCircle(x - 6 + k * 2.6, hy - 8 - k * 2.4, 2);
        } },
    lunarCrown: { c: 0xe8e8f8, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 月轮王冠：银冠 + 悬浮满月 + 月晕 + 环绕星子 + 银河光带
            hpoly(g, [[x - 15, hy + 2], [x - 9, hy - 14], [x, hy - 8], [x + 9, hy - 14], [x + 15, hy + 2]], c);
            hpoly(g, [[x - 15, hy + 2], [x - 9, hy - 14], [x, hy - 8], [0, hy + 2]], 0xf8f8ff, 0.6);
            g.fillStyle(a, 0.8);
            g.fillRect(x - 15, hy, 30, 2);
            g.fillStyle(0x8f9ad0, 0.5);
            g.fillRect(x - 13, hy - 5, 26, 1.2); // 錾银纹
            const gl = 0.5 + 0.3 * Math.sin(now / 400);
            g.fillStyle(a, gl * 0.3);
            g.fillCircle(x, hy - 20, 11); // 月晕
            g.fillStyle(a, gl);
            g.fillCircle(x, hy - 20, 6.4);
            g.fillStyle(0xc8c8dc, 0.7);
            g.fillCircle(x - 2, hy - 22, 1.6);
            g.fillCircle(x + 2.6, hy - 18.4, 1.1);
            for (let k = 0; k < 3; k++) {
                const ang = now / 1100 + (k / 3) * TAU;
                const px = x + Math.cos(ang) * 13, py = hy - 20 + Math.sin(ang) * 6;
                const tw = 0.5 + 0.5 * Math.sin(now / 240 + k * 2);
                g.fillStyle(0xffffff, tw);
                g.fillRect(px - 1.6, py - 0.5, 3.2, 1);
                g.fillRect(px - 0.5, py - 1.6, 1, 3.2); // 环绕星子
            }
            g.fillStyle(0xdfe8ff, 0.35);
            g.fillRect(x - 15, hy - 3.4, 30, 1); // 银河光带
        } },
    vikingHelm: { c: 0x8a8a94, a: 0x6a4a2a, draw: (g, now, x, hy, c, a) => {
            // 角斗头盔：钢盔 + 一对弯角
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy + 2, 16, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 16, hy + 2, 32, 5);
            g.fillStyle(0x2a2a32, 0.9);
            g.fillRect(x - 12, hy - 4, 24, 3); // 观察缝
            g.fillStyle(a, 1);
            for (const s of [-1, 1]) {
                g.save();
                g.translateCanvas(x + s * 13, hy - 8);
                g.rotateCanvas(s * -0.5);
                hpoly(g, [[-3, 0], [3, 0], [5, -12], [0, -16], [-5, -12]], 0xf0e8d0);
                g.restore();
            }
            g.fillStyle(0xdfe6f0, 0.5);
            g.fillEllipse(x - 5, hy - 11, 8, 3);
        } },
    vikingCrown: { c: 0x8a6a4a, a: 0xc0392b, draw: (g, now, x, hy, c, a) => {
            // 战利之冠：皮冠 + 战利品（斧与剑交叉）
            g.fillStyle(c, 1);
            g.fillRoundedRect(x - 16, hy - 10, 32, 12, 5);
            g.fillStyle(0x6a4a2a, 0.9);
            g.fillRect(x - 16, hy - 4, 32, 3);
            g.lineStyle(2.4, 0x9aa2ac, 1);
            g.lineBetween(x - 8, hy - 2, x - 2, hy - 18);
            g.lineBetween(x + 8, hy - 2, x + 2, hy - 18);
            g.fillStyle(0xdfe6f0, 1);
            g.fillTriangle(x - 6, hy - 20, x - 1, hy - 16, x - 4, hy - 13); // 斧刃
            g.fillStyle(a, 0.9);
            g.fillCircle(x, hy - 4, 2.4); // 徽
        } },
    safariHat: { c: 0xc8b070, a: 0x6a4a2a, draw: (g, now, x, hy, c, a) => {
            // 探险遮阳帽：双檐探险帽
            g.fillStyle(c, 1);
            g.fillEllipse(x, hy + 3, 46, 8); // 下檐
            g.beginPath();
            g.arc(x, hy + 1, 14, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillEllipse(x, hy - 3, 30, 6); // 中檐
            g.beginPath();
            g.arc(x, hy - 4, 10, Math.PI, TAU);
            g.closePath();
            g.fillPath(); // 顶
            g.fillStyle(a, 0.8);
            g.fillRect(x - 14, hy - 3, 28, 3); // 帽带
            g.fillStyle(0x8a6a3a, 0.9);
            g.fillCircle(x, hy - 1.5, 2); // 帽徽
        } },
    safariCrown: { c: 0xc8b070, a: 0xd88a2a, draw: (g, now, x, hy, c, a) => {
            // 鬃毛王冠：狮鬃排成的冠
            for (let k = 0; k < 7; k++) {
                const ang = Math.PI * 1.08 + (k / 7) * Math.PI * 0.84;
                g.fillStyle(k % 2 ? a : 0xc95a2a, 0.95);
                g.fillEllipse(x + Math.cos(ang) * 16, hy - 4 + Math.sin(ang) * 14, 7, 12);
            }
            g.fillStyle(0x8a6a3a, 0.95);
            g.fillRect(x - 15, hy - 2, 30, 4);
            const gl = 0.5 + 0.4 * Math.sin(now / 350);
            g.fillStyle(0xffd45c, gl);
            g.fillCircle(x, hy - 10, 3); // 狮心
        } },
    theatHat: { c: 0xf0e8f4, a: 0xc86ad9, draw: (g, now, x, hy, c, a) => {
            // 花翎帽：软帽 + 斜插花翎
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy + 1, 13, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillEllipse(x, hy + 1, 34, 6);
            g.fillStyle(a, 0.6);
            g.fillRect(x - 13, hy - 3, 26, 3);
            for (const s of [-1, 1]) {
                const sway = Math.sin(now / 450 + s) * 2;
                g.save();
                g.translateCanvas(x + s * 9, hy - 8);
                g.rotateCanvas(s * 0.9);
                g.fillStyle(s > 0 ? a : 0xffd45c, 0.9);
                g.fillEllipse(s * 6 + sway, -8, 5, 16); // 翎
                g.fillStyle(0xffffff, 0.6);
                g.fillEllipse(s * 6 + sway, -12, 2, 6);
                g.restore();
            }
        } },
    theatCrown: { c: 0xd9b45c, a: 0xc0392b, draw: (g, now, x, hy, c, a) => {
            // 桂冠（剧院）：金桂环
            g.fillStyle(0x8a6a3a, 0.9);
            g.fillRect(x - 15, hy - 3, 30, 3);
            for (let k = 0; k < 9; k++) {
                const ang = Math.PI * 1.08 + (k / 9) * Math.PI * 0.84;
                g.fillStyle(k % 2 ? c : 0xf0d080, 0.95);
                g.fillEllipse(x + Math.cos(ang) * 16, hy - 5 + Math.sin(ang) * 13, 7, 3.4);
                g.fillStyle(a, 0.7);
                g.fillCircle(x + Math.cos(ang) * 16, hy - 5 + Math.sin(ang) * 13, 1.2);
                g.fillStyle(c, 1);
            }
        } },
    boreaHat: { c: 0x9ad4ff, a: 0xeaf6ff, draw: (g, now, x, hy, c, a) => {
            // 御寒兜帽：毛绒兜帽 + 白绒边
            g.fillStyle(c, 0.9);
            g.beginPath();
            g.arc(x, hy, 17, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 17, hy, 34, 7);
            g.fillStyle(0xffffff, 0.95);
            for (let k = 0; k < 7; k++)
                g.fillCircle(x - 15 + k * 5, hy + 5, 3.4); // 绒边
            g.fillStyle(0xffffff, 0.5);
            g.fillEllipse(x - 6, hy - 9, 9, 4); // 冰光
        } },
    boreaCrown: { c: 0x9ad4ff, a: 0xffffff, draw: (g, now, x, hy, c, a) => {
            // 冰晶王冠：冰棱尖 + 霜光
            for (let k = 0; k < 5; k++) {
                const px = x - 14 + k * 7;
                const h = k === 2 ? 20 : k === 1 || k === 3 ? 14 : 9;
                hpoly(g, [[px - 3, hy + 2], [px + 3, hy + 2], [px, hy - h]], k % 2 ? c : 0xdfeefc, 0.95);
                g.fillStyle(0xffffff, 0.6);
                hpoly(g, [[px - 1, hy + 2], [px + 1, hy + 2], [px, hy - h * 0.7]], 0xffffff, 0.5);
                g.fillStyle(c, 1);
            }
            g.fillStyle(a, 0.9);
            g.fillRect(x - 16, hy + 1, 32, 3);
            const gl = 0.3 + 0.3 * Math.sin(now / 300);
            g.fillStyle(a, gl);
            g.fillCircle(x, hy - 16, 8);
        } },
    venicHat: { c: 0x8a6a3a, a: 0xd9b45c, draw: (g, now, x, hy, c, a) => {
            // 船夫草帽：宽檐草帽 + 红缎带
            g.fillStyle(0xc8a860, 1);
            g.fillEllipse(x, hy + 2, 46, 9);
            g.beginPath();
            g.arc(x, hy + 1, 13, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillStyle(a, 0.95);
            g.fillRect(x - 13, hy - 4, 26, 3.4); // 缎带
            g.fillStyle(0xc0392b, 0.9);
            g.fillCircle(x + 10, hy - 2.5, 2.4); // 缎带结
            g.lineStyle(1, 0xa08040, 0.6);
            for (let k = -2; k <= 2; k++)
                g.lineBetween(x + k * 5, hy - 8 + Math.abs(k), x + k * 6, hy + 2);
        } },
    venicCrown: { c: 0xd9b45c, a: 0x3a8ab0, draw: (g, now, x, hy, c, a) => {
            // 面具华冠：金冠 + 顶一面面具
            hpoly(g, [[x - 15, hy + 2], [x - 8, hy - 12], [x, hy - 6], [x + 8, hy - 12], [x + 15, hy + 2]], c);
            g.fillStyle(0xf0e8d0, 0.95);
            hpoly(g, [[x - 8, hy - 14], [x + 8, hy - 14], [x + 6, hy - 22], [x - 6, hy - 22]], 0xf0e8d0); // 小面具
            g.fillStyle(a, 0.9);
            g.fillEllipse(x - 3, hy - 18, 3, 2);
            g.fillEllipse(x + 3, hy - 18, 3, 2); // 眼孔
            g.fillStyle(0xc86ad9, 0.8);
            g.fillRect(x - 6, hy - 14, 12, 1.6); // 面具彩带
            g.fillStyle(0xffd45c, 1);
            g.fillCircle(x, hy - 24, 2); // 冠顶珠
        } },
    olympWreath: { c: 0x5a9a3a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 橄榄桂冠：绿叶环 + 金橄榄
            for (let k = 0; k < 10; k++) {
                const ang = Math.PI * 1.05 + (k / 10) * Math.PI * 0.9;
                g.fillStyle(k % 2 ? c : 0x7ed957, 0.95);
                g.fillEllipse(x + Math.cos(ang) * 17, hy - 4 + Math.sin(ang) * 13, 8, 3.4);
            }
            g.fillStyle(a, 0.95);
            g.fillEllipse(x - 6, hy - 10, 3.4, 5);
            g.fillEllipse(x + 6, hy - 10, 3.4, 5); // 金橄榄
        } },
    olympCrown: { c: 0xffd45c, a: 0xfff6d0, draw: (g, now, x, hy, c, a) => {
            // 神祇之冠：双层光芒神冠 + 錾纹冠带 + 圣光核 + 飞升金屑
            for (let k = 0; k < 9; k++) {
                const ang = Math.PI * 1.06 + (k / 9) * Math.PI * 0.88;
                const long = k % 2 === 0;
                const breathe = 1 + Math.sin(now / 500 + k) * 0.05;
                hpoly(g, [
                    [x + Math.cos(ang - 0.05) * 10, hy - 4 + Math.sin(ang - 0.05) * 10],
                    [x + Math.cos(ang) * (long ? 26 : 18) * breathe, hy - 4 + Math.sin(ang) * (long ? 26 : 18) * breathe],
                    [x + Math.cos(ang + 0.05) * 10, hy - 4 + Math.sin(ang + 0.05) * 10],
                ], long ? c : a, 0.95);
            }
            for (let k = 0; k < 9; k += 2) {
                const ang = Math.PI * 1.06 + (k / 9) * Math.PI * 0.88;
                g.fillStyle(0xffffff, 0.35);
                g.fillCircle(x + Math.cos(ang) * 20, hy - 4 + Math.sin(ang) * 20, 1.2); // 芒尖光珠
            }
            g.fillStyle(c, 1);
            g.fillRect(x - 15, hy - 4, 30, 5);
            g.fillStyle(0xb08a2a, 0.7);
            g.fillRect(x - 15, hy - 1.4, 30, 1.4);
            for (let k = -1; k <= 1; k++)
                g.fillCircle(x + k * 10, hy - 1.5, 1.4); // 錾纹宝石座
            const gl = 0.4 + 0.3 * Math.sin(now / 300);
            g.fillStyle(0xffffff, gl * 0.4);
            g.fillCircle(x, hy - 8, 8);
            g.fillStyle(0xffffff, gl);
            g.fillCircle(x, hy - 8, 4); // 圣光核
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1000 + k / 3) % 1;
                g.fillStyle(a, 0.7 * (1 - ph));
                g.fillCircle(x - 10 + k * 10 + Math.sin(ph * 4 + k) * 3, hy - 18 - ph * 12, 1.4 * (1 - ph) + 0.3); // 飞升金屑
            }
        } },
    sambaHat: { c: 0x3aa05a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 羽饰头冠：绿冠座 + 彩羽排
            g.fillStyle(c, 1);
            g.fillRect(x - 15, hy - 4, 30, 6);
            g.fillStyle(a, 0.9);
            g.fillRect(x - 15, hy - 1, 30, 2);
            for (let k = 0; k < 5; k++) {
                const px = x - 12 + k * 6;
                const sway = Math.sin(now / 320 + k) * 2;
                const col = [0xffd45c, 0x4ac8ff, 0xe83a5a, 0x9effd0, 0xff8ad4][k];
                g.fillStyle(col, 0.95);
                g.fillEllipse(px + sway, hy - 16, 5, 14);
                g.fillStyle(0xffffff, 0.5);
                g.fillCircle(px + sway, hy - 21, 1.4);
            }
        } },
    sambaCrown: { c: 0xffd45c, a: 0xff8ad4, draw: (g, now, x, hy, c, a) => {
            // 狂欢王冠：金冠 + 彩羽扇 + 亮片
            hpoly(g, [[x - 16, hy + 2], [x - 10, hy - 10], [x, hy - 14], [x + 10, hy - 10], [x + 16, hy + 2]], c);
            g.fillStyle(a, 0.9);
            g.fillRect(x - 16, hy, 32, 2);
            for (let k = 0; k < 5; k++) {
                const sway = Math.sin(now / 300 + k * 1.3) * 2.4;
                const col = [0xff8ad4, 0x4ac8ff, 0x9effd0, 0xe83a5a, 0xffffff][k];
                g.fillStyle(col, 0.95);
                g.fillEllipse(x - 12 + k * 6 + sway, hy - 20, 4.4, 12);
            }
            for (let k = 0; k < 4; k++) {
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k));
                g.fillStyle(0xffffff, tw);
                g.fillCircle(x - 10 + k * 7, hy - 5, 1.2); // 亮片
            }
        } },
    // 跑鞋头带：吸汗头带 + 顶上支着一只小跑鞋（鞋带随步伐弹）
    runHat: { c: 0x39d0a0, a: 0xffffff, draw: (g, now, x, hy, c, a) => {
            // 吸汗带（绕头一圈）
            g.fillStyle(c, 1);
            g.fillRoundedRect(x - 15, hy - 8, 30, 7, 3.5);
            g.fillStyle(0x2a8a70, 0.7);
            g.fillRoundedRect(x - 15, hy - 3.4, 30, 2.4, 1.2);
            // 白色双杠运动条纹
            g.fillStyle(a, 0.95);
            g.fillRect(x - 13, hy - 6.4, 26, 1.2);
            g.fillRect(x - 11, hy - 4.4, 22, 1);
            // 正中小闪电标
            g.fillStyle(a, 0.95);
            hpoly(g, [[x + 2, hy - 7.5], [x - 1.5, hy - 4.5], [x + 0.5, hy - 4.5], [x - 1, hy - 1.5], [x + 2.5, hy - 5], [x + 0.5, hy - 5]], a, 0.95);
            // 顶上的小跑鞋（微微颠动）
            const bounce = Math.abs(Math.sin(now / 280)) * 2;
            g.save();
            g.translateCanvas(x + 2, hy - 14 - bounce);
            g.rotateCanvas(-0.12);
            g.fillStyle(0xffffff, 1);
            g.fillRoundedRect(-8, 1, 16, 4, 2);
            g.fillStyle(0xd0d8e2, 0.9);
            for (let k = 0; k < 4; k++)
                g.fillRect(-6.5 + k * 3.6, 3.2, 1.6, 1.6);
            g.fillStyle(c, 1);
            hpoly(g, [[-7, 1], [-6, -4], [0, -5.5], [6, -3], [8, 1]], c, 1);
            g.fillStyle(0xffffff, 0.9);
            g.fillEllipse(6, -0.5, 5, 4);
            g.lineStyle(1.1, 0xffffff, 0.95);
            for (let k = 0; k < 3; k++) {
                const lax = -3 + k * 2.6;
                g.lineBetween(lax, -4.6 + bounce * 0.2, lax + 2.2, -1.4);
                g.lineBetween(lax + 2.2, -4.6 + bounce * 0.2, lax, -1.4);
            }
            g.fillStyle(0xffd45c, 0.95);
            g.fillCircle(-6.4, -1.4, 1.2);
            g.restore();
            // 带子两端小速度翅标
            const zip = Math.sin(now / 200) * 1.4;
            g.fillStyle(a, 0.7);
            g.fillTriangle(x - 15, hy - 7, x - 21 - zip, hy - 5, x - 15, hy - 3.6);
            g.fillTriangle(x + 15, hy - 7, x + 21 + zip, hy - 5, x + 15, hy - 3.6);
        } },
};
