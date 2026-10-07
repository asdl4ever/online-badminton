import { apoly, TAU } from './shared.js';
/** 批五主题光环（武侠江湖 / 北欧神域）。(0,0) = 角色躯干中心，画在身后。 */
export const AURAS_10 = {
    wxAuraA: { c: 0xdfe8f5, a: 0xffffff, draw: (g, now, c, a) => {
            // 剑气纵横：环身交错的剑气弧——三道弧形剑气 + 剑锋星芒 + 破空痕
            for (let k = 0; k < 3; k++) { // 三道弧形剑气（不同半径错相扫过）
                const ph = (now / 900 + k / 3) % 1;
                const a0 = ph * TAU + k * 2.1;
                const r = 34 + k * 16;
                g.lineStyle(2.6 - k * 0.5, k === 1 ? a : c, 0.65 * Math.sin(ph * Math.PI) + 0.15);
                g.beginPath();
                g.arc(0, -12, r, a0, a0 + 1.6);
                g.strokePath();
                // 剑锋星芒（弧端亮点）
                const ex = Math.cos(a0 + 1.6) * r, ey = -12 + Math.sin(a0 + 1.6) * r;
                g.fillStyle(0xffffff, 0.85 * Math.sin(ph * Math.PI));
                g.fillRect(ex - 3.4, ey - 0.6, 6.8, 1.2);
                g.fillRect(ex - 0.6, ey - 3.4, 1.2, 6.8);
            }
            for (let k = 0; k < 4; k++) { // 破空痕（横掠的细线）
                const ph = (now / 500 + k / 4) % 1;
                const y = -70 + k * 38;
                g.lineStyle(1, c, 0.5 * (1 - ph));
                g.lineBetween(-90 + ph * 180, y + Math.sin(now / 300 + k) * 3, -60 + ph * 180, y + Math.sin(now / 300 + k) * 3);
            }
            g.fillStyle(c, 0.06); // 环身气劲底光
            g.fillCircle(0, -14, 74);
        } },
    wxAuraB: { c: 0xc0d0e8, a: 0xe8404a, draw: (g, now, c, _a) => {
            // 万剑归宗：环身悬浮的一圈飞剑——十二柄剑首朝外 + 缓转 + 三柄领剑锋芒
            const rot = now / 3000;
            for (let k = 0; k < 12; k++) { // 十二柄悬浮剑
                const ang = rot + (k / 12) * TAU;
                const px = Math.cos(ang) * 66, py = -14 + Math.sin(ang) * 84;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(ang + Math.PI / 2 + Math.PI);
                g.fillStyle(k % 3 === 0 ? 0xf0f4fa : c, 0.8); // 剑身（细长）
                apoly(g, [[-1.4, 0], [-1.4, -14], [0, -18], [1.4, -14], [1.4, 0]], k % 3 === 0 ? 0xf0f4fa : c, 0.8);
                g.fillStyle(0xe8404a, 0.9); // 剑柄红穗
                g.fillRect(-1.4, 0, 2.8, 3);
                g.fillStyle(0x8a94a2, 0.9); // 剑格
                g.fillRect(-2.4, -1, 4.8, 1.6);
                g.restore();
                if (k % 3 === 0) { // 领剑锋芒
                    const gl = 0.4 + 0.4 * Math.abs(Math.sin(now / 240 + k));
                    g.fillStyle(0xffffff, gl * 0.4);
                    g.fillCircle(px, py, 7);
                }
            }
            const core = 0.4 + 0.3 * Math.sin(now / 400); // 人后剑心
            g.fillStyle(c, core * 0.25);
            g.fillCircle(0, -14, 26);
            g.fillStyle(0xffffff, 0.7);
            g.fillRect(-0.8, -34, 1.6, 40);
        } },
    norseAuraA: { c: 0x7fd4ff, a: 0xffe15c, draw: (g, now, c, a) => {
            // 雷云压顶：头顶翻涌的雷云——多层云团 + 云隙电光 + 周期落雷 + 雨丝
            for (let k = 0; k < 5; k++) { // 翻涌云团（头顶弧线排布，明暗错落）
                const cx = -64 + k * 32;
                const cy = -120 + Math.sin(now / 700 + k) * 4;
                g.fillStyle(k % 2 ? 0x3d4c5c : 0x2a3440, 0.75);
                g.fillCircle(cx, cy, 14 + (k % 3) * 4);
                g.fillStyle(0x55687c, 0.5);
                g.fillCircle(cx - 4, cy - 4, 8 + (k % 2) * 3);
                const gl = 0.3 + 0.4 * Math.abs(Math.sin(now / 240 + k * 1.4)); // 云隙电光
                g.fillStyle(a, gl * 0.6);
                g.fillEllipse(cx + 8, cy + 8, 8, 2.4);
            }
            const strike = (now / 1500) % 1; // 周期落雷
            if (strike < 0.16) {
                const sw = 1 - strike / 0.16;
                g.lineStyle(2.8 * sw + 0.6, 0xffffff, sw);
                let bx = Math.sin(now / 200) * 20 - 20, by = -104;
                g.beginPath();
                g.moveTo(bx, by);
                for (let s = 1; s <= 4; s++) {
                    bx += Math.sin(s * 2.7 + now / 100) * 8;
                    by += 16;
                    g.lineTo(bx, by);
                }
                g.strokePath();
                g.fillStyle(a, sw * 0.5);
                g.fillCircle(bx, by, 10 * sw + 2);
            }
            g.lineStyle(1, c, 0.3); // 细雨丝
            for (let k = 0; k < 6; k++) {
                const ph = (now / 400 + k / 6) % 1;
                g.lineBetween(-60 + k * 24, -96 + ph * 130, -56 + k * 24, -88 + ph * 130);
            }
            g.fillStyle(c, 0.07); // 环身雷光底
            g.fillCircle(0, -20, 80);
        } },
    norseAuraB: { c: 0x9fe8c0, a: 0xbfe8ff, draw: (g, now, c, a) => {
            // 极光神域：身后垂落的极光幕 + 环绕符文 + 雪原星霜
            for (let k = 0; k < 3; k++) { // 三道极光带（摆动的竖向光幕）
                const pts = [];
                for (let s = 0; s <= 10; s++) {
                    const u = s / 10;
                    pts.push([-84 + k * 12 + u * 66, -130 + Math.sin(u * 5 + now / 700 + k * 2) * 16 + u * 20]);
                }
                for (let s = 0; s < pts.length - 1; s++) {
                    g.lineStyle(6 - k * 1.4, k === 1 ? a : c, (0.22 - k * 0.05) * (0.6 + 0.4 * Math.sin(now / 500 + s + k)));
                    g.lineBetween(pts[s][0], pts[s][1], pts[s + 1][0], pts[s + 1][1]);
                }
            }
            const rot = now / 2600;
            for (let k = 0; k < 8; k++) { // 环绕的卢恩符文（几何符形明灭）
                const ang = rot + (k / 8) * TAU;
                const px = Math.cos(ang) * 62, py = -14 + Math.sin(ang) * 80;
                const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 320 + k * 1.5));
                g.lineStyle(1.6, k % 2 ? a : c, gl);
                g.beginPath();
                if (k % 3 === 0) { // ᚱ 形
                    g.moveTo(px - 2, py + 4);
                    g.lineTo(px - 2, py - 4);
                    g.lineTo(px + 2, py - 1);
                    g.lineTo(px - 2, py + 2);
                }
                else if (k % 3 === 1) { // ᛉ 形
                    g.moveTo(px - 2.4, py + 4);
                    g.lineTo(px, py - 4);
                    g.lineTo(px + 2.4, py + 4);
                    g.moveTo(px, py - 4);
                    g.lineTo(px, py + 1);
                }
                else { // ᛏ 形
                    g.moveTo(px, py - 4);
                    g.lineTo(px, py + 4);
                    g.moveTo(px - 2.4, py - 2);
                    g.lineTo(px + 2.4, py - 2);
                }
                g.strokePath();
                g.fillStyle(0xffffff, gl * 0.5);
                g.fillCircle(px, py, 1);
            }
            for (let k = 0; k < 6; k++) { // 雪原星霜（缓落雪点）
                const ph = (now / 2600 + k / 6) % 1;
                g.fillStyle(0xffffff, 0.7 * (1 - ph));
                g.fillCircle(Math.sin(k * 2.4) * 60, -120 + ph * 210, 1.4 * (1 - ph) + 0.4);
            }
        } },
};
