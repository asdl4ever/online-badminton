import { handle, pommel } from './shared.js';
/** 批四主题武器（西游降魔 / 三国烽火）。局部空间：柄在 x ∈ [-13,-2]，拍框中心 ≈ (9,0)。 */
export const WEAPONS_7 = {
    xyRacketA: { c: 0xd9b45c, a: 0xff9a3c, draw: (g, now, c, a) => {
            // 金箍棒·拍：拍面是一根缩短的金箍棒——棒身横置 + 双端金箍 + 两端流光
            handle(g, -13, 0, 5, 0x6b4a2f);
            pommel(g, -13.4, 2.4, a);
            g.fillStyle(0xb8943a, 1); // 棒身（横置贯穿拍位）
            g.fillRoundedRect(-4, -4.4, 40, 8.8, 3);
            g.fillStyle(0xd9b45c, 0.7); // 受光棱
            g.fillRect(-4, -4.4, 40, 2.6);
            for (const s of [-1, 1]) { // 两端金箍（拍头两侧）
                g.fillStyle(c, 1);
                g.fillRect(s > 0 ? 30 : -6, -6, 8, 12);
                g.fillStyle(0xfff0b0, 0.7);
                g.fillRect(s > 0 ? 30 : -6, -5, 8, 1.8);
            }
            for (let k = 0; k < 3; k++) { // 棒身符光流动（左→右）
                const ph = (now / 600 + k / 3) % 1;
                g.fillStyle(a, 0.8 * Math.sin(ph * Math.PI));
                g.fillRect(-2 + ph * 34, -1.4, 3, 2.8);
            }
            const gl = 0.5 + 0.5 * Math.sin(now / 280); // 两端星芒
            g.fillStyle(0xfff0b0, gl);
            g.fillRect(34.4, -1, 4, 2);
            g.fillRect(35.6, -2.2, 1.6, 4.4);
            g.fillRect(-9, -1, 4, 2);
            g.fillRect(-7.8, -2.2, 1.6, 4.4);
        } },
    xyRacketB: { c: 0x9a6ad0, a: 0xffd45c, draw: (g, now, c, a) => {
            // 紫金钵·拍：拍面是一尊紫金钵盂——钵体 + 钵口紫雾 + 金箍钵沿 + 收摄符文
            handle(g, -13, 2, 5, 0x6b4a2f);
            pommel(g, -13.4, 2.6, a);
            g.fillStyle(c, 1); // 钵体（半圆钵身）
            g.beginPath();
            g.arc(9, -2, 15, 0, Math.PI);
            g.closePath();
            g.fillPath();
            g.fillStyle(0x7a4aa0, 0.7); // 钵身暗部
            g.beginPath();
            g.arc(9, -2, 15, 0.35, Math.PI - 0.35);
            g.closePath();
            g.fillPath();
            g.fillStyle(0xb08ad0, 0.5); // 钵身受光
            g.beginPath();
            g.arc(9, -2, 15, Math.PI * 1.15, Math.PI * 1.7);
            g.closePath();
            g.fillPath();
            g.fillStyle(0xd9b45c, 1); // 金箍钵沿
            g.fillRect(-6.5, -4.4, 31, 4);
            g.fillStyle(0xfff0b0, 0.6);
            g.fillRect(-6.5, -3.4, 31, 1.2);
            for (let k = 0; k < 3; k++) { // 钵口紫雾（向上升腾旋绕）
                const ph = (now / 1100 + k / 3) % 1;
                g.fillStyle(c, 0.5 * Math.sin(ph * Math.PI));
                g.fillCircle(9 + Math.sin(ph * 5 + k) * 8, -8 - ph * 14, 2.6 * (1 - ph) + 0.6);
            }
            for (let k = 0; k < 4; k++) { // 收摄符文（钵身符点明灭）
                const ang = Math.PI * 0.25 + (k / 4) * Math.PI * 0.5;
                const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 340 + k));
                g.fillStyle(a, gl);
                g.fillCircle(9 + Math.cos(ang) * 9, 2 + Math.sin(ang) * 9, 1.3);
            }
        } },
    sgmRacketA: { c: 0x6ad0a0, a: 0xe8404a, draw: (g, now, c, a) => {
            // 青龙刀·拍：拍面是偃月刀刃——弯月刃 + 青龙纹 + 血缨 + 刃口寒光
            handle(g, -13, 0, 5, 0x6b4a2f);
            pommel(g, -13.4, 2.4, a);
            g.fillStyle(0x6b4a2f, 1); // 刀杆伸进拍位
            g.fillRect(-4, -2.4, 18, 4.8);
            g.fillStyle(c, 1); // 偃月刃（大弯月）
            g.fillPoints([
                { x: 12, y: -3 }, { x: 20, y: -13 }, { x: 34, y: -15 }, { x: 40, y: -8 }, { x: 30, y: -8 }, { x: 22, y: -3 }, { x: 12, y: 3 }, { x: 12, y: -3 },
            ], true);
            g.fillStyle(0xa8f0d0, 0.55); // 刃口受光
            g.fillPoints([
                { x: 34, y: -15 }, { x: 40, y: -8 }, { x: 30, y: -8 }, { x: 26, y: -12 },
            ], true);
            g.fillStyle(0x2f8a6a, 0.7); // 青龙纹（刃身盘龙线）
            g.lineStyle(1.4, 0x2f8a6a, 0.8);
            g.beginPath();
            g.moveTo(16, -2);
            g.lineTo(24, -8);
            g.lineTo(33, -11);
            g.strokePath();
            g.lineStyle(2, a, 0.85 + 0.15 * Math.sin(now / 260)); // 血缨（刃背红绸）
            g.beginPath();
            g.moveTo(14, -6);
            g.lineTo(10, -14 + Math.sin(now / 300) * 2);
            g.lineTo(16, -12 + Math.sin(now / 300 + 1) * 2);
            g.strokePath();
            for (let k = 0; k < 2; k++) { // 刃尖寒光
                const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 320 + k));
                g.fillStyle(0xffffff, gl);
                g.fillRect(36 - k * 14, -14 + k * 8, 3, 1.2);
                g.fillRect(37 - k * 14, -15.2 + k * 8, 1, 3.6);
            }
        } },
    sgmRacketB: { c: 0x8a94a2, a: 0xe8404a, draw: (g, now, c, a) => {
            // 丈八矛·拍：拍面是蛇矛矛头——矛锋 + 蛇形脊线 + 红缨 + 挥刺残光
            handle(g, -13, 0, 5, 0x39424e);
            pommel(g, -13.4, 2.4, a);
            g.fillStyle(0x6b4a2f, 1); // 矛杆
            g.fillRect(-4, -2.6, 22, 5.2);
            g.fillStyle(0x8a6a3a, 0.5);
            g.fillRect(-4, -2.6, 22, 1.8);
            // 矛锋（蛇形曲脊的亮钢锋）
            g.fillStyle(c, 1);
            g.fillPoints([
                { x: 16, y: -6 }, { x: 30, y: -8 }, { x: 36, y: -3 }, { x: 41, y: 0 },
                { x: 36, y: 3 }, { x: 30, y: 8 }, { x: 16, y: 6 },
            ], true);
            g.fillStyle(0xdfe8f5, 0.6); // 锋面受光
            g.fillPoints([
                { x: 16, y: -6 }, { x: 30, y: -8 }, { x: 36, y: -3 }, { x: 30, y: -2 },
            ], true);
            g.lineStyle(1.4, 0x4a5460, 0.9); // 蛇形脊线
            g.beginPath();
            g.moveTo(16, 0);
            g.lineTo(24, -2 + Math.sin(now / 280) * 1);
            g.lineTo(31, 1);
            g.lineTo(40, 0);
            g.strokePath();
            // 红缨（矛杆与锋交界的一撮缨）
            for (let k = -1; k <= 1; k++) {
                g.fillStyle(a, 0.95);
                g.fillTriangle(15, k * 3, 15 + 8, k * 3.4 + Math.sin(now / 260 + k) * 2, 15, k * 3 + 2.4);
            }
            // 挥刺残光（锋前时隐时现的刺击光）
            const thrust = Math.abs(Math.sin(now / 380));
            g.lineStyle(1.6, 0xffffff, thrust * 0.5);
            g.lineBetween(41, 0, 41 + thrust * 9, 0);
        } },
};
