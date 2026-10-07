import { apoly, TAU } from './shared.js';
/** 批十主题光环（电竞赛场 / 末日废土 / 星光偶像）。(0,0) = 角色躯干中心，画在身后。 */
export const AURAS_15 = {
    esportAuraA: { c: 0x00e5ff, a: 0xff2e88, draw: (g, now, c, a) => {
            // 赛场聚光：赛场顶灯的多道聚光——三色光柱 + 扫动 + 观众席灯点
            for (let k = 0; k < 3; k++) { // 三道聚光（青/品红/金，缓慢摆动）
                const ox = -60 + k * 60;
                const sway = Math.sin(now / 800 + k * 2) * 14;
                const col = k === 0 ? c : k === 1 ? a : 0xffd45c;
                g.fillStyle(col, 0.13);
                apoly(g, [
                    [ox - 10, -150], [ox + 10, -150], [ox + 30 + sway, 80], [ox - 30 + sway, 80],
                ], col, 0.12);
                g.fillStyle(0xffffff, 0.06);
                apoly(g, [
                    [ox - 3, -150], [ox + 3, -150], [ox + 12 + sway, 80], [ox - 12 + sway, 80],
                ], 0xffffff, 0.07);
            }
            for (let k = 0; k < 8; k++) { // 观众席灯点（闪烁的应援灯海）
                const tw = 0.3 + 0.7 * Math.abs(Math.sin(now / 220 + k * 1.7));
                g.fillStyle(k % 2 ? a : c, tw);
                g.fillCircle(-84 + (k * 23) % 168, -128 + (k * 17) % 26, 1.6);
            }
            g.fillStyle(c, 0.05); // 舞台地面反光
            g.fillEllipse(0, 78, 160, 22);
            g.lineStyle(1.4, a, 0.3); // 地面线
            g.lineBetween(-80, 78, 80, 78);
        } },
    esportAuraB: { c: 0xffd45c, a: 0x00e5ff, draw: (g, now, c, a) => {
            // 夺冠时刻：夺冠瞬间的金色彩带雨——彩带 + 金雨 + 奖杯逆光 + 闪光
            for (let k = 0; k < 8; k++) { // 彩带雨（双色旋转飘落）
                const ph = (now / 1600 + k / 8) % 1;
                const cx = -90 + (k * 23) % 180 + Math.sin(ph * 5 + k) * 7;
                const cy = -140 + ph * 250;
                g.save();
                g.translateCanvas(cx, cy);
                g.rotateCanvas(Math.sin(ph * 5 + k) * 1.4 + k);
                g.fillStyle(k % 2 ? c : a, 0.7 * Math.sin(ph * Math.PI));
                g.fillRect(-3.4, -1.4, 6.8, 2.8);
                g.restore();
            }
            g.fillStyle(c, 0.12); // 奖杯逆光（身后一团金光）
            g.fillCircle(0, -30, 52);
            g.fillStyle(0xfff0b0, 0.2);
            g.fillCircle(0, -30, 32);
            for (let k = 0; k < 5; k++) { // 金雨丝
                const ph = (now / 400 + k / 5) % 1;
                g.lineStyle(1.4, c, 0.5 * (1 - ph));
                g.lineBetween(-70 + (k * 33) % 140, -120 + ph * 180, -70 + (k * 33) % 140, -112 + ph * 180);
            }
            for (let k = 0; k < 6; k++) { // 闪光
                const tw = Math.abs(Math.sin(now / 180 + k * 1.4));
                const s = 2.4 + (k % 3);
                g.fillStyle(0xffffff, tw);
                g.fillRect(-80 + (k * 31) % 160 - s, -100 + (k * 41) % 160 - 0.5, s * 2, 1);
                g.fillRect(-80 + (k * 31) % 160 - 0.5, -100 + (k * 41) % 160 - s, 1, s * 2);
            }
        } },
    wasteAuraA: { c: 0xc9a84a, a: 0xff8a3c, draw: (g, now, c, a) => {
            // 辐射沙尘：环身飘的辐射沙尘——沙浪 + 辐射标志光 + 坠落灰烬 + 地平线
            g.fillStyle(0x8a7430, 0.3); // 地平线沙幕
            g.fillEllipse(0, 66, 190, 36);
            for (let k = 0; k < 4; k++) { // 横卷沙浪
                const ph = (now / 1600 + k / 4) % 1;
                g.fillStyle(k % 2 ? c : 0xa8843a, 0.2 * Math.sin(ph * Math.PI));
                g.fillEllipse(-90 + ph * 180, -60 + (k % 2) * 60, 70, 40);
            }
            // 辐射标志光（身后浮出又隐没的三叶标志）
            const rad = Math.max(0, Math.sin(now / 1100));
            if (rad > 0.15) {
                g.save();
                g.translateCanvas(0, -70);
                g.fillStyle(a, rad * 0.35);
                for (let k = 0; k < 3; k++) {
                    g.save();
                    g.rotateCanvas((k / 3) * TAU);
                    apoly(g, [[-8, -8], [8, -8], [0, -26]], a, rad * 0.35);
                    g.restore();
                }
                g.lineStyle(2, a, rad * 0.5);
                g.strokeCircle(0, 0, 14);
                g.fillStyle(0xffd45c, rad);
                g.fillCircle(0, 0, 3);
                g.restore();
            }
            for (let k = 0; k < 7; k++) { // 坠落灰烬
                const ph = (now / 1000 + k / 7) % 1;
                g.fillStyle(k % 2 ? 0x8a7430 : 0x6a5a3a, 0.5 * (1 - ph));
                g.fillCircle(-84 + (k * 25) % 168 + Math.sin(ph * 4 + k) * 6, -130 + ph * 240, 1.2 * (1 - ph) + 0.4);
            }
            g.fillStyle(c, 0.05); // 环身沙色
            g.fillCircle(0, -14, 82);
        } },
    wasteAuraB: { c: 0xff8a3c, a: 0x8a94a2, draw: (g, now, c, a) => {
            // 废土风暴：环身呼啸的废土风暴——斜风沙 + 卷起的杂物 + 电闪 + 风柱
            for (let k = 0; k < 4; k++) { // 斜风沙带
                const ph = (now / 450 + k / 4) % 1;
                g.lineStyle(2.6, k % 2 ? c : 0xa8843a, (0.4 * (1 - ph)));
                g.lineBetween(-100 + ph * 200, -100 + k * 40, -60 + ph * 200, -116 + k * 40);
            }
            for (let k = 0; k < 5; k++) { // 卷起的杂物（纸片/铁皮翻飞）
                const ph = (now / 700 + k / 5) % 1;
                g.save();
                g.translateCanvas(-90 + ph * 190 + Math.sin(ph * 6 + k) * 6, -110 + (k * 37) % 190 + Math.cos(ph * 4 + k) * 6);
                g.rotateCanvas(ph * 8 + k);
                g.fillStyle(k % 2 ? 0x6a5a3a : a, 0.6 * Math.sin(ph * Math.PI));
                g.fillRect(-2.4, -1.6, 4.8, 3.2);
                g.restore();
            }
            const flash = (now / 1700) % 1; // 电闪
            if (flash < 0.14) {
                const sw = 1 - flash / 0.14;
                g.lineStyle(2.2 * sw + 0.5, 0xfff0b0, sw);
                let bx = Math.sin(now / 250) * 30, by = -130;
                g.beginPath();
                g.moveTo(bx, by);
                for (let s = 1; s <= 4; s++) {
                    bx += Math.sin(s * 2.8 + now / 90) * 9;
                    by += 26;
                    g.lineTo(bx, by);
                }
                g.strokePath();
                g.fillStyle(a, sw * 0.5);
                g.fillCircle(bx, by, 12 * sw + 3);
            }
            // 风柱（右侧一道旋转沙柱）
            const pts = [];
            for (let s = 0; s <= 12; s++) {
                const u = s / 12;
                const ang = u * 5 + now / 260;
                pts.push([60 + Math.cos(ang) * (16 - u * 8), 70 - u * 150]);
            }
            g.lineStyle(4, c, 0.3);
            g.beginPath();
            pts.forEach(([px, py], s) => (s === 0 ? g.moveTo(px, py) : g.lineTo(px, py)));
            g.strokePath();
            g.fillStyle(c, 0.06); // 环身风暴底
            g.fillCircle(0, -14, 84);
        } },
    idolAuraA: { c: 0xff9adf, a: 0x7ac8ff, draw: (g, now, c, a) => {
            // 舞台追光：舞台的两道追光交叉锁定——双色追光 + 地面光斑 + 星光舞台
            for (let k = 0; k < 2; k++) {
                const sway = Math.sin(now / 700 + k * Math.PI) * 22;
                const col = k ? a : c;
                g.fillStyle(col, 0.14);
                apoly(g, [
                    [(k ? -110 : 110) - 12, -150], [(k ? -110 : 110) + 12, -150], [sway + 26, 80], [sway - 26, 80],
                ], col, 0.13);
                g.fillStyle(0xffffff, 0.07);
                apoly(g, [
                    [(k ? -110 : 110) - 5, -150], [(k ? -110 : 110) + 5, -150], [sway + 11, 80], [sway - 11, 80],
                ], 0xffffff, 0.08);
                g.fillStyle(col, 0.25); // 地面光斑
                g.fillEllipse(sway, 76, 54, 12);
            }
            for (let k = 0; k < 6; k++) { // 舞台星点
                const tw = 0.3 + 0.7 * Math.abs(Math.sin(now / 240 + k * 1.8));
                g.fillStyle(k % 2 ? a : 0xffffff, tw);
                g.fillCircle(-70 + (k * 28) % 140, -100 + (k * 23) % 90, 1.5);
            }
            g.lineStyle(1.4, c, 0.25); // 舞台边缘线
            g.lineBetween(-90, 70, 90, 70);
        } },
    idolAuraB: { c: 0x7ac8ff, a: 0xff9adf, draw: (g, now, c, a) => {
            // 荧光星海：观众席的荧光海——多层荧光浪 + 挥舞光棒剪影 + 应援灯牌 + 星雨
            for (let k = 0; k < 4; k++) { // 荧光浪（一层层起伏的荧光波）
                const lift = Math.sin(now / 700 + k * 1.5) * 8;
                g.fillStyle(k % 2 ? c : a, 0.16);
                g.beginPath();
                g.moveTo(-100, 84);
                for (let s = 0; s <= 10; s++) {
                    g.lineTo(-100 + s * 20, 40 - k * 8 + lift - Math.sin(s * 1.3 + now / 300 + k) * 6);
                }
                g.lineTo(100, 84);
                g.closePath();
                g.fillPath();
                g.lineStyle(1.6, k % 2 ? a : c, 0.4);
                g.beginPath();
                for (let s = 0; s <= 10; s++) {
                    const px = -100 + s * 20, py = 40 - k * 8 + lift - Math.sin(s * 1.3 + now / 300 + k) * 6;
                    if (s === 0)
                        g.moveTo(px, py);
                    else
                        g.lineTo(px, py);
                }
                g.strokePath();
            }
            for (let k = 0; k < 6; k++) { // 挥舞光棒剪影（浪上晃动的荧光棒）
                const px = -75 + k * 30;
                const sway = Math.sin(now / 260 + k) * 6;
                g.lineStyle(2.6, k % 2 ? a : c, 0.8);
                g.lineBetween(px, 34 - k * 6, px + sway, 14 - k * 6);
                g.fillStyle(0xffffff, 0.5);
                g.fillCircle(px + sway, 13 - k * 6, 1.4);
            }
            for (let k = 0; k < 2; k++) { // 应援灯牌（远处的亮牌）
                const bx = k ? 52 : -58;
                const on = Math.sin(now / 280 + k * 2) > -0.4 ? 1 : 0.3;
                g.fillStyle(0x1a1222, 0.8);
                g.fillRect(bx - 11, 2 + k * 6, 22, 14);
                g.fillStyle(c, on * 0.9);
                g.fillRect(bx - 8, 5 + k * 6, 16, 8);
                g.fillStyle(0xffffff, on * 0.7);
                g.fillRect(bx - 5, 7 + k * 6, 10, 4);
            }
            for (let k = 0; k < 6; k++) { // 星雨（细碎上升光点）
                const ph = (now / 1200 + k / 6) % 1;
                g.fillStyle(0xffffff, 0.6 * (1 - ph));
                g.fillCircle(Math.sin(k * 2.6) * 70 + Math.sin(ph * 4 + k) * 6, 70 - ph * 200, 1.3 * (1 - ph) + 0.4);
            }
        } },
};
