import { apoly, TAU } from './shared.js';
/** 批三主题光环（光之巨人 / 怪兽之王）。(0,0) = 角色躯干中心，画在身后。 */
export const AURAS_8 = {
    otmAuraA: { c: 0x9fd8ff, a: 0xff4a5c, draw: (g, now, c, a) => {
            // 三重光线：胸口原点向外放出的三道交叉光线 + 环身光晕 + 计时脉动
            const pulse = 0.5 + 0.5 * Math.sin(now / 300);
            g.fillStyle(c, 0.08 + pulse * 0.05); // 环身光晕
            g.fillCircle(0, -14, 80);
            for (let k = 0; k < 3; k++) { // 三道光线（自胸口向外的光束，缓慢转动）
                const ang = -Math.PI / 2 + (k - 1) * 0.6 + Math.sin(now / 900) * 0.15;
                const len = 120 + Math.sin(now / 500 + k) * 14;
                const ex = Math.cos(ang) * len, ey = -30 + Math.sin(ang) * len;
                g.fillStyle(0xffffff, 0.5); // 光束芯
                apoly(g, [[0, -30], [ex, ey], [ex - Math.sin(ang) * 3, ey + Math.cos(ang) * 3]], 0xffffff, 0.55);
                g.fillStyle(k % 2 ? c : a, 0.3); // 光束晕
                apoly(g, [[0, -30], [ex, ey], [ex + Math.sin(ang) * 6, ey - Math.cos(ang) * 6]], k % 2 ? c : a, 0.22);
                // 光束沿途光珠
                for (let s = 1; s <= 3; s++) {
                    const ph = (now / 400 + s / 3 + k / 3) % 1;
                    g.fillStyle(0xffffff, 0.8 * Math.sin(ph * Math.PI));
                    g.fillCircle(Math.cos(ang) * len * ph, -30 + Math.sin(ang) * len * ph, 2.2 * Math.sin(ph * Math.PI) + 0.4);
                }
            }
            const gl = 0.6 + 0.4 * Math.sin(now / 240); // 胸口计时核心
            g.fillStyle(a, 0.3 * gl);
            g.fillCircle(0, -30, 10);
            g.fillStyle(0xdff2ff, 0.95);
            g.fillCircle(0, -30, 4);
            // 环身微光粒
            for (let k = 0; k < 5; k++) {
                const ang = (k / 5) * TAU + now / 1800;
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 280 + k * 1.6));
                g.fillStyle(0xffffff, tw);
                g.fillCircle(Math.cos(ang) * 64, -14 + Math.sin(ang) * 84, 1.6);
            }
        } },
    otmAuraB: { c: 0xffe8a0, a: 0x9fd8ff, draw: (g, now, c, a) => {
            // 变身光幕：环身升起的变身光柱帷幕——双层光幕 + 上升光粒 + 底部光环
            g.fillStyle(c, 0.1); // 底部触发环
            g.fillEllipse(0, 82, 130, 24);
            g.lineStyle(2.4, 0xffffff, 0.5 + 0.2 * Math.sin(now / 300));
            g.strokeEllipse(0, 82, 108, 18);
            for (let k = 0; k < 2; k++) { // 双层光幕（错相波动）
                const eol = 0.5 + 0.5 * Math.sin(now / 420 + k * Math.PI);
                g.fillStyle(k ? a : c, 0.12 + eol * 0.06);
                apoly(g, [
                    [-64 - k * 12, 84], [-58 - k * 12 + Math.sin(now / 500 + k) * 5, -150],
                    [58 + k * 12 + Math.sin(now / 500 + k + 2) * 5, -150], [64 + k * 12, 84],
                ], k ? a : c, 0.12 + eol * 0.06);
            }
            for (let k = 0; k < 8; k++) { // 上升光粒（变速螺旋）
                const ph = (now / 1300 + k / 8) % 1;
                const px = Math.sin(k * 2.6) * 44 + Math.sin(ph * 5 + k) * 12;
                g.fillStyle(k % 2 ? 0xffffff : c, 0.75 * Math.sin(ph * Math.PI));
                g.fillCircle(px, 80 - ph * 220, 2.2 * (1 - ph * 0.5) + 0.4);
            }
            for (let k = 0; k < 4; k++) { // 幕顶闪光
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k * 1.9));
                g.fillStyle(0xffffff, tw);
                g.fillRect(-56 + k * 30, -148, 5, 5);
            }
        } },
    kjuAuraA: { c: 0x5ac8ff, a: 0xdff2ff, draw: (g, now, c, a) => {
            // 原子吐息：横扫身后的原子吐息光束——蓄能辉光 + 蓝白光束 + 溅射光点
            const charge = (now / 2400) % 1; // 蓄能→喷射循环
            const firing = charge > 0.25;
            const ang = firing ? Math.sin(now / 400) * 0.3 - 0.1 : 0;
            if (firing) { // 主光束（从身体中部向斜上喷射）
                const len = 150 * Math.min(1, (charge - 0.25) * 6);
                const ex = Math.cos(ang) * len, ey = -40 + Math.sin(ang) * len;
                g.fillStyle(c, 0.35); // 外晕
                apoly(g, [[-10, -40], [ex, ey], [ex + Math.sin(ang) * 9, ey - Math.cos(ang) * 9]], c, 0.3);
                g.fillStyle(0xdff2ff, 0.75); // 束芯
                apoly(g, [[-6, -40], [ex, ey], [ex + Math.sin(ang) * 3, ey - Math.cos(ang) * 3]], 0xdff2ff, 0.8);
                g.fillStyle(0xffffff, 0.9); // 内芯线
                apoly(g, [[-3, -40], [ex, ey], [ex + Math.sin(ang) * 1.4, ey - Math.cos(ang) * 1.4]], 0xffffff, 0.9);
                for (let k = 0; k < 5; k++) { // 束上溅射光点
                    const ph = (now / 220 + k / 5) % 1;
                    g.fillStyle(0xffffff, 0.8 * (1 - ph));
                    g.fillCircle(Math.cos(ang) * len * ph + Math.sin(now / 90 + k) * 7, -40 + Math.sin(ang) * len * ph - ph * 10, 1.8 * (1 - ph) + 0.4);
                }
            }
            else { // 蓄能：胸口聚能球 + 汇聚光粒
                const gl = 0.4 + 0.6 * (charge / 0.25);
                g.fillStyle(c, gl * 0.4);
                g.fillCircle(0, -40, 12 + gl * 6);
                g.fillStyle(0xdff2ff, gl);
                g.fillCircle(0, -40, 4 + gl * 3);
                for (let k = 0; k < 5; k++) {
                    const ph = (now / 300 + k / 5) % 1;
                    const angk = k * 1.26 + now / 200;
                    const r = 44 * (1 - ph) + 8;
                    g.fillStyle(0xffffff, gl * (1 - ph));
                    g.fillCircle(Math.cos(angk) * r, -40 + Math.sin(angk) * r * 0.7, 1.6);
                }
            }
            g.fillStyle(a, 0.15); // 环身蓝雾
            g.fillCircle(0, -20, 70);
        } },
    kjuAuraB: { c: 0x7de87d, a: 0xff5a5a, draw: (g, now, c, a) => {
            // 兽王威压：脚下龟裂 + 环身压迫冲击环 + 兽瞳虚影 + 警红脉冲
            for (let k = 0; k < 5; k++) { // 脚下放射龟裂
                const ang = (k / 5) * TAU + 0.3;
                g.lineStyle(2, 0x101810, 0.6);
                g.beginPath();
                let px = Math.cos(ang) * 16, py = 74 + Math.sin(ang) * 5;
                g.moveTo(px, py);
                for (let s = 1; s <= 3; s++) {
                    px += Math.cos(ang + Math.sin(now / 500 + k + s) * 0.2) * 12;
                    py += Math.sin(ang) * 3;
                    g.lineTo(px, py);
                }
                g.strokePath();
            }
            const pulse = (now / 1600) % 1; // 压迫冲击环（周期外扩）
            const r = 20 + pulse * 76;
            g.lineStyle(3.4 * (1 - pulse) + 0.8, c, 0.7 * (1 - pulse));
            g.strokeCircle(0, -20, r);
            g.lineStyle(1.4, 0xffffff, 0.4 * (1 - pulse));
            g.strokeCircle(0, -20, r * 0.8);
            for (let k = 0; k < 2; k++) { // 兽瞳虚影（头顶两侧明灭的巨大竖瞳）
                const gl = 0.25 + 0.2 * Math.sin(now / 500 + k * 2.4);
                const ex = k ? 40 : -40;
                g.fillStyle(a, gl);
                g.fillEllipse(ex, -96, 10, 22);
                g.fillStyle(0x101810, gl * 0.9);
                g.fillEllipse(ex, -96, 3, 18);
            }
            const warn = 0.5 + 0.5 * Math.sin(now / 200); // 警红脉冲底光
            g.fillStyle(a, 0.06 + warn * 0.05);
            g.fillCircle(0, -10, 88);
        } },
};
