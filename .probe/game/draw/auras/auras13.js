import { apoly, TAU } from './shared.js';
/** 批八主题光环（敦煌飞天 / 羽蛇神殿 / 圣辉天界）。(0,0) = 角色躯干中心，画在身后。 */
export const AURAS_13 = {
    dunAuraA: { c: 0xffd45c, a: 0xff9adf, draw: (g, now, c, a) => {
            // 佛光千叶：身后巨大的千叶佛光——多重背光环 + 千叶瓣 + 飞天飘带 + 落花
            for (let k = 0; k < 3; k++) { // 三重背光环（渐大的椭圆佛光）
                const gl = 0.22 - k * 0.05 + 0.04 * Math.sin(now / 400 + k);
                g.fillStyle(k % 2 ? a : c, gl);
                g.fillEllipse(0, -26, 110 - k * 22, 170 - k * 34);
                g.lineStyle(1.6, k % 2 ? a : 0xfff0d8, 0.5);
                g.strokeEllipse(0, -26, 110 - k * 22, 170 - k * 34);
            }
            for (let k = 0; k < 12; k++) { // 千叶瓣（沿外环排布的火焰瓣）
                const ang = (k / 12) * TAU + now / 3200;
                const px = Math.cos(ang) * 52, py = -26 + Math.sin(ang) * 80;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(ang + Math.PI / 2);
                g.fillStyle(k % 2 ? a : c, 0.55);
                apoly(g, [[-3, 0], [0, -10], [3, 0]], k % 2 ? a : c, 0.55);
                g.restore();
            }
            for (let k = 0; k < 3; k++) { // 佛光中的飞天飘带（弧形细带）
                g.lineStyle(2 - k * 0.4, k % 2 ? c : a, 0.4);
                g.beginPath();
                for (let s = 0; s <= 10; s++) {
                    const u = s / 10;
                    const px = Math.cos(u * 2.6 + now / 1600 + k) * (40 - k * 8);
                    const py = -26 + Math.sin(u * 2.6 + now / 1600 + k) * (64 - k * 12);
                    if (s === 0)
                        g.moveTo(px, py);
                    else
                        g.lineTo(px, py);
                }
                g.strokePath();
            }
            for (let k = 0; k < 6; k++) { // 落花
                const ph = (now / 1700 + k / 6) % 1;
                g.save();
                g.translateCanvas(Math.sin(k * 2.6) * 50 + Math.sin(ph * 4 + k) * 8, -120 + ph * 210);
                g.rotateCanvas(ph * 6 + k);
                g.fillStyle(k % 2 ? a : 0xffb0c8, 0.7 * Math.sin(ph * Math.PI));
                g.fillEllipse(0, 0, 3.4, 1.8);
                g.restore();
            }
        } },
    dunAuraB: { c: 0xffb070, a: 0xff9adf, draw: (g, now, c, a) => {
            // 九天飞仙：横贯九天的飞仙景象——天际云海 + 飞仙剪影群 + 飘带长河 + 金光
            g.fillStyle(0xffe0c0, 0.3); // 天际暖光
            g.fillEllipse(0, -40, 190, 130);
            for (let k = 0; k < 4; k++) { // 云海（层叠的横云）
                const ph = (now / 2800 + k / 4) % 1;
                const cx = -100 + ph * 210;
                g.fillStyle(k % 2 ? 0xf0e0d0 : 0xffe8d8, 0.4);
                g.fillEllipse(cx, -90 + (k % 2) * 44, 54, 14);
                g.fillEllipse(cx + 18, -86 + (k % 2) * 44, 34, 10);
            }
            for (let k = 0; k < 3; k++) { // 飞仙剪影群（御风而行的三道剪影）
                const ph = (now / 3600 + k / 3) % 1;
                const fx = -100 + ph * 210, fy = -60 + k * 30 + Math.sin(ph * 5 + k) * 6;
                g.fillStyle(0x8a5a3a, 0.5);
                g.fillEllipse(fx, fy, 9, 4);
                g.lineStyle(1.2, c, 0.5); // 身后飘带
                g.beginPath();
                g.moveTo(fx - 4, fy);
                g.lineTo(fx - 14, fy + 4 + Math.sin(ph * 6 + k) * 3);
                g.lineTo(fx - 24, fy + 2);
                g.strokePath();
            }
            // 飘带长河（一条横贯的绸带河）
            g.fillStyle(c, 0.3);
            g.beginPath();
            g.moveTo(-100, 20);
            for (let s = 0; s <= 10; s++)
                g.lineTo(-100 + s * 20, 20 - Math.sin(s * 1.2 + now / 500) * 8);
            for (let s = 10; s >= 0; s--)
                g.lineTo(-100 + s * 20, 30 - Math.sin(s * 1.2 + now / 500 + 0.6) * 8);
            g.closePath();
            g.fillPath();
            for (let k = 0; k < 6; k++) { // 金光尘
                const ph = (now / 1100 + k / 6) % 1;
                const gl = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k * 1.7));
                g.fillStyle(k % 2 ? a : 0xfff0d8, gl * Math.sin(ph * Math.PI));
                g.fillCircle(Math.sin(k * 2.7) * 60, -120 + ph * 200, 1.8 * (1 - ph) + 0.5);
            }
        } },
    aztAuraA: { c: 0x3ad49a, a: 0x8a7a5a, draw: (g, now, c, _a) => {
            // 丛林迷雾：环身翻涌的丛林迷雾——雾团 + 石柱剪影 + 萤火 + 藤影
            for (let k = 0; k < 5; k++) { // 翻涌雾团
                const ph = (now / 2200 + k / 5) % 1;
                const mx = Math.sin(ph * TAU + k * 1.3) * 50;
                const my = 60 - ph * 150;
                g.fillStyle(k % 2 ? 0x8fb8a0 : 0x6a9a80, 0.22 * Math.sin(ph * Math.PI));
                g.fillEllipse(mx, my, 62, 36);
            }
            g.fillStyle(0x16301a, 0.45); // 两侧丛林石柱剪影
            apoly(g, [[-84, 70], [-76, -50], [-68, 70]], 0x16301a, 0.5);
            apoly(g, [[68, 70], [76, -36], [84, 70]], 0x16301a, 0.45);
            for (let k = 0; k < 6; k++) { // 萤火（绿光明灭飘浮）
                const gl = 0.3 + 0.7 * Math.abs(Math.sin(now / 300 + k * 1.8));
                const ph = (now / 1600 + k / 6) % 1;
                g.fillStyle(0x7dffc4, gl * Math.sin(ph * Math.PI));
                g.fillCircle(Math.sin(k * 2.7) * 56 + Math.sin(ph * 4 + k) * 7, 60 - ph * 150, 1.4);
            }
            g.lineStyle(1.2, 0x2a5a44, 0.6); // 藤影（两侧垂藤）
            for (const s of [-1, 1]) {
                g.beginPath();
                g.moveTo(s * 78, -80);
                g.lineTo(s * 72, -50);
                g.lineTo(s * 80, -20);
                g.strokePath();
            }
            g.fillStyle(c, 0.05); // 环身雾底
            g.fillCircle(0, -14, 84);
        } },
    aztAuraB: { c: 0xff4a3a, a: 0xffd45c, draw: (g, now, c, a) => {
            // 血月神谕：头顶升起的血月与神谕——血月 + 月纹 + 神谕符文环绕 + 红雨
            g.fillStyle(0x5a1a10, 0.5); // 血月月晕
            g.fillCircle(0, -100, 52);
            g.fillStyle(0xff4a3a, 0.9); // 血月本体
            g.fillCircle(0, -100, 40);
            g.fillStyle(0xd83828, 0.6); // 月面环形山
            g.fillCircle(-12, -110, 7);
            g.fillCircle(14, -92, 5);
            g.fillCircle(-2, -84, 4);
            g.lineStyle(1.4, a, 0.6); // 月面神谕刻环
            g.beginPath();
            g.arc(0, -100, 26, 0.4, 2.8);
            g.strokePath();
            for (let k = 0; k < 8; k++) { // 环绕神谕符文（逆时针绕月旋转）
                const ang = -now / 1400 + (k / 8) * TAU;
                const px = Math.cos(ang) * 58, py = -70 + Math.sin(ang) * 74;
                const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 320 + k));
                g.fillStyle(a, gl);
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(ang + Math.PI / 2);
                g.fillRect(-1.4, -3, 2.8, 6);
                g.fillRect(-3, -1, 6, 2);
                g.restore();
            }
            for (let k = 0; k < 6; k++) { // 红雨（血月落下的红滴）
                const ph = (now / 500 + k / 6) % 1;
                g.fillStyle(c, 0.6 * (1 - ph));
                g.fillCircle(-50 + (k * 19) % 100, -60 + ph * 180, 1.4);
            }
            const warn = 0.5 + 0.5 * Math.sin(now / 300); // 环身血红警光
            g.fillStyle(c, 0.05 + warn * 0.04);
            g.fillCircle(0, -14, 84);
        } },
    angAuraA: { c: 0xfff6d8, a: 0xffd45c, draw: (g, now, c, a) => {
            // 天国圣光柱：天顶打下的三道圣光柱——光柱 + 云隙 + 光尘 + 云上钟影
            for (let k = 0; k < 3; k++) { // 三道圣光柱（错落角度的斜光柱）
                const ox = -50 + k * 50;
                const sway = Math.sin(now / 700 + k) * 6;
                g.fillStyle(c, 0.13);
                apoly(g, [
                    [ox - 10, -150], [ox + 10, -150], [ox + 34 + sway, 80], [ox - 34 + sway, 80],
                ], c, 0.12);
                g.fillStyle(0xffffff, 0.08);
                apoly(g, [
                    [ox - 4, -150], [ox + 4, -150], [ox + 16 + sway, 80], [ox - 16 + sway, 80],
                ], 0xffffff, 0.09);
            }
            for (let k = 0; k < 3; k++) { // 天顶云隙
                g.fillStyle(0xf0ead8, 0.4);
                g.fillEllipse(-46 + k * 46, -146 + (k % 2) * 8, 40, 10);
            }
            for (let k = 0; k < 7; k++) { // 光尘（在光柱里缓缓下落）
                const ph = (now / 1300 + k / 7) % 1;
                g.fillStyle(k % 2 ? a : 0xffffff, 0.6 * Math.sin(ph * Math.PI));
                g.fillCircle(Math.sin(k * 2.7) * 56 + Math.sin(ph * 4 + k) * 5, -140 + ph * 230, 1.5 * (1 - ph) + 0.4);
            }
            g.fillStyle(c, 0.06); // 环身圣光底
            g.fillEllipse(0, 20, 140, 180);
        } },
    angAuraB: { c: 0xffd45c, a: 0xfff6d8, draw: (g, now, c, a) => {
            // 审判之环：身后巨大的审判光环——巨环 + 内旋光焰 + 四福音符号 + 号角云
            g.fillStyle(c, 0.1);
            g.fillCircle(0, -20, 88);
            g.lineStyle(6, c, 0.55); // 巨环
            g.strokeCircle(0, -20, 74);
            g.lineStyle(2, 0xffffff, 0.5); // 内细环（反向刻度）
            g.strokeCircle(0, -20, 60);
            for (let k = 0; k < 16; k++) {
                const ang = -now / 1800 + (k / 16) * TAU;
                g.fillStyle(0xffffff, 0.6);
                g.fillRect(Math.cos(ang) * 67 - 0.7, -20 + Math.sin(ang) * 67 - 0.7, 1.4, 1.4);
            }
            for (let k = 0; k < 4; k++) { // 环上四福音符号（狮/牛/人/鹰意象的几何徽记）
                const ang = now / 2100 + (k / 4) * TAU;
                const px = Math.cos(ang) * 74, py = -20 + Math.sin(ang) * 74;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(ang + Math.PI / 2);
                g.fillStyle(a, 0.95);
                if (k === 0)
                    apoly(g, [[-4, 3], [0, -5], [4, 3]], a, 0.95); // 狮
                else if (k === 1) {
                    g.fillRect(-3.4, -3.4, 6.8, 6.8);
                } // 牛
                else if (k === 2) {
                    g.fillCircle(0, 0, 3.4);
                } // 人
                else
                    apoly(g, [[0, -4.4], [4, 3], [-4, 3]], a, 0.95); // 鹰
                g.restore();
                g.fillStyle(0xffffff, 0.5);
                g.fillCircle(px, py, 6.4);
            }
            // 旋光焰（环内逆旋的光焰丝）
            for (let k = 0; k < 3; k++) {
                g.lineStyle(2, k % 2 ? a : c, 0.3);
                g.beginPath();
                for (let s = 0; s <= 12; s++) {
                    const u = s / 12;
                    const ang = u * 3.6 - now / 800 + k * 2.1;
                    const r = 14 + u * 40;
                    const px = Math.cos(ang) * r, py = -20 + Math.sin(ang) * r * 0.92;
                    if (s === 0)
                        g.moveTo(px, py);
                    else
                        g.lineTo(px, py);
                }
                g.strokePath();
            }
            for (let k = 0; k < 5; k++) { // 圣光尘
                const ph = (now / 1000 + k / 5) % 1;
                g.fillStyle(0xffffff, 0.6 * (1 - ph));
                g.fillCircle(Math.sin(k * 2.6) * 60, 60 - ph * 160, 1.4 * (1 - ph) + 0.4);
            }
        } },
};
