import { apoly, TAU } from './shared.js';
/** 批四主题光环（西游降魔 / 三国烽火）。(0,0) = 角色躯干中心，画在身后。 */
export const AURAS_9 = {
    xyAuraA: { c: 0xffe08a, a: 0xff9a3c, draw: (g, now, c, a) => {
            // 火眼金睛：高处一双巨大的火眼金瞳俯视——瞳孔扫描 + 金芒扫射 + 灼热尘埃
            for (const s of [-1, 1]) { // 双眼（斜上方的巨大杏眼）
                const ex = s * 42, ey = -96 + Math.sin(now / 700 + s) * 3;
                g.fillStyle(c, 0.2);
                g.fillEllipse(ex, ey, 34, 16);
                g.fillStyle(0xfff0b0, 0.85);
                g.fillEllipse(ex, ey, 26, 11);
                const scan = Math.sin(now / 500 + s) * 7; // 金瞳左右扫
                g.fillStyle(a, 0.95);
                g.fillEllipse(ex + scan, ey, 7, 9);
                g.fillStyle(0x241a0c, 0.95);
                g.fillEllipse(ex + scan, ey, 3, 6.4);
                g.fillStyle(0xffffff, 0.9);
                g.fillCircle(ex + scan - 1.4, ey - 2, 1.2);
                // 眼角金芒（周期扫射的斜光）
                const sweep = Math.sin(now / 900 + s * 2) * 0.4;
                g.fillStyle(c, 0.16);
                apoly(g, [[ex, ey], [ex + s * (110 - s * 40) * 1, ey - 40 + sweep * 60], [ex + s * 130, ey - 20 + sweep * 60]], c, 0.13);
            }
            g.fillStyle(c, 0.1); // 环身灼热底光
            g.fillCircle(0, -20, 84);
            for (let k = 0; k < 6; k++) { // 灼热尘埃（上升明灭）
                const ph = (now / 1200 + k / 6) % 1;
                const gl = 0.4 + 0.6 * Math.abs(Math.sin(now / 260 + k * 1.8));
                g.fillStyle(k % 2 ? a : 0xfff0b0, gl * Math.sin(ph * Math.PI));
                g.fillCircle(Math.sin(k * 2.6) * 50 + Math.sin(ph * 4 + k) * 8, 80 - ph * 190, 2 * (1 - ph) + 0.5);
            }
        } },
    xyAuraB: { c: 0xff9a3c, a: 0xffd45c, draw: (g, now, c, a) => {
            // 大闹天宫：身后一座被掀翻的天宫——凌霄殿剪影 + 倒卷云涛 + 四散仙器 + 战意金光
            g.fillStyle(0x3a2a1a, 0.4); // 天宫剪影（多层飞檐）
            apoly(g, [[-88, -40], [-56, -84], [-24, -40]], 0x3a2a1a, 0.45);
            apoly(g, [[-20, -40], [16, -98], [52, -40]], 0x3a2a1a, 0.5);
            apoly(g, [[56, -40], [88, -76], [116, -40]], 0x3a2a1a, 0.42);
            g.lineStyle(1.6, a, 0.5); // 檐角金勾
            g.lineBetween(-56, -84, -66, -92 + Math.sin(now / 500) * 2);
            g.lineBetween(16, -98, 6, -108 + Math.sin(now / 500 + 1) * 2);
            g.lineBetween(88, -76, 98, -84 + Math.sin(now / 500 + 2) * 2);
            for (let k = 0; k < 4; k++) { // 倒卷云涛（从下向上翻涌的云团）
                const ph = (now / 1800 + k / 4) % 1;
                const clx = Math.sin(ph * 4 + k * 1.6) * 60;
                g.fillStyle(k % 2 ? 0xf0ead8 : 0xd8d0c0, 0.3 * Math.sin(ph * Math.PI));
                g.fillCircle(clx, 90 - ph * 150, 8 + ph * 12);
            }
            for (let k = 0; k < 4; k++) { // 四散仙器（金冠/玉环/瓶剪影打转坠落）
                const ph = (now / 1400 + k / 4) % 1;
                const ox = Math.cos(ph * 4 + k * 1.8) * (30 + ph * 50);
                const oy = -100 + ph * 150;
                g.fillStyle(a, 0.7 * Math.sin(ph * Math.PI));
                g.fillRect(ox - 2, oy - 2, 4, 4);
                g.lineStyle(1.2, a, 0.5 * Math.sin(ph * Math.PI));
                g.strokeCircle(ox, oy, 2.4);
            }
            const war = 0.4 + 0.3 * Math.sin(now / 280); // 战意金光脉冲
            g.fillStyle(c, 0.08 + war * 0.06);
            g.fillCircle(0, -10, 88);
        } },
    sgmAuraA: { c: 0xffd45c, a: 0xe8404a, draw: (g, now, c, a) => {
            // 战鼓冲锋：环身共振的战鼓冲击——周期鼓环 + 鼓点尘埃 + 战旗虚影
            const beat = (now / 900) % 1; // 鼓点周期
            for (let k = 0; k < 3; k++) { // 三重鼓环（错相外扩）
                const ph = (beat + k / 3) % 1;
                const r = 18 + ph * 78;
                g.lineStyle(3.2 * (1 - ph) + 0.8, k === 0 ? a : c, 0.6 * (1 - ph));
                g.strokeCircle(0, -16, r);
            }
            for (let k = 0; k < 6; k++) { // 鼓点溅尘（沿环崩起）
                const ang = (k / 6) * TAU + 0.4;
                const ph = (beat + k / 6) % 1;
                const r = 24 + ph * 60;
                g.fillStyle(k % 2 ? c : 0xfff0b0, 0.7 * (1 - ph));
                g.fillCircle(Math.cos(ang) * r, -16 + Math.sin(ang) * r * 0.9, 1.8 * (1 - ph) + 0.4);
            }
            for (const s of [-1, 1]) { // 双侧战旗虚影（明灭的旗影）
                const gl = 0.2 + 0.15 * Math.sin(now / 600 + s);
                apoly(g, [
                    [s * 76, -50], [s * 100, -46 + Math.sin(now / 400 + s) * 3], [s * 102, 30], [s * 78, 26],
                ], a, gl + 0.12);
            }
            const drum = 0.5 + 0.5 * Math.sin(beat * TAU); // 鼓心脉冲底光
            g.fillStyle(c, 0.06 + drum * 0.07);
            g.fillCircle(0, -16, 66);
        } },
    sgmAuraB: { c: 0xff5a1a, a: 0xffd45c, draw: (g, now, c, a) => {
            // 火烧连营：身后一片火海连营——营帐剪影 + 三重火舌 + 飞烬 + 赤烟
            g.fillStyle(0x241a12, 0.5); // 连营剪影（一排营帐）
            const camps = [-84, -46, -8, 30, 66];
            camps.forEach((cx, k) => {
                apoly(g, [[cx, 74], [cx + 9, 48 - (k % 2) * 6], [cx + 18, 74]], 0x241a12, 0.55);
            });
            g.fillStyle(c, 0.1); // 火海映天底光
            g.fillEllipse(0, 60, 180, 70);
            camps.forEach((cx, k) => {
                const fx = cx + 9;
                for (let s = 0; s < 2; s++) {
                    const fh = 14 - s * 5 + Math.sin(now / 180 + k * 1.7 + s) * 3;
                    g.fillStyle(s === 0 ? c : a, s === 0 ? 0.55 : 0.8);
                    apoly(g, [[fx - 5 + s, 48 - (k % 2) * 6], [fx, 48 - (k % 2) * 6 - fh], [fx + 5 - s, 48 - (k % 2) * 6]], s === 0 ? c : 0xffe15c, s === 0 ? 0.6 : 0.85);
                }
            });
            for (let k = 0; k < 7; k++) { // 飞烬（乘风斜飘）
                const ph = (now / 1000 + k / 7) % 1;
                const gl = 0.4 + 0.6 * Math.abs(Math.sin(now / 220 + k * 1.9));
                g.fillStyle(k % 2 ? a : 0xffe15c, gl * (1 - ph));
                g.fillCircle(-80 + ph * 170 + Math.sin(ph * 5 + k) * 8, 70 - ph * 150, 1.8 * (1 - ph) + 0.4);
            }
            for (let k = 0; k < 3; k++) { // 赤烟柱
                const ph = (now / 2400 + k / 3) % 1;
                g.fillStyle(0x8a3a1a, 0.25 * Math.sin(ph * Math.PI));
                g.fillCircle(-40 + k * 40 + Math.sin(ph * 5 + k) * 10, 60 - ph * 140, 6 + ph * 14);
            }
        } },
};
