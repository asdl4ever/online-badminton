import { hpoly, TAU } from './shared.js';
/** 批六主题头饰（法老秘葬 / 暗部忍道） */
export const HATS_9 = {
    egHatA: { c: 0xffd45c, a: 0x3a5a8a, draw: (g, now, x, hy, c, a) => {
            // 圣蛇头带：额前金头带 + 竖起的圣蛇（眼镜蛇兜帽 + 吐信）
            g.fillStyle(c, 1); // 头带
            g.fillRect(x - 14, hy - 3, 28, 6);
            g.fillStyle(0xd9b45c, 0.7);
            g.fillRect(x - 14, hy + 1, 28, 2);
            for (let k = 0; k < 5; k++) { // 带上圣书刻符
                g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 400 + k));
                g.fillRect(x - 10 + k * 5, hy - 1.8, 2.4, 2.6);
            }
            // 圣蛇（S 形立起 + 兜帽展开）
            const sway = Math.sin(now / 450) * 1.4;
            g.fillStyle(0xd9b45c, 1); // 兜帽
            g.fillEllipse(x + sway * 0.4, hy - 12, 9, 11);
            g.fillStyle(c, 1); // 蛇身 S 形
            g.beginPath();
            g.moveTo(x, hy - 2);
            g.lineTo(x + 2 + sway * 0.3, hy - 5);
            g.lineTo(x - 1 + sway * 0.6, hy - 8);
            g.lineTo(x + sway, hy - 11);
            g.strokePath();
            g.lineStyle(2.2, c, 1);
            g.strokePath();
            g.fillStyle(0x1a1408, 1); // 蛇眼
            g.fillCircle(x + sway - 1.4, hy - 13, 0.7);
            g.fillCircle(x + sway + 1.4, hy - 13, 0.7);
            const flick = Math.abs(Math.sin(now / 180)); // 吐信
            g.lineStyle(1, 0xe8404a, flick);
            g.lineBetween(x + sway, hy - 9, x + sway + flick * 3, hy - 7.4);
        } },
    egHatB: { c: 0xd9b45c, a: 0x3a5a8a, draw: (g, now, x, hy, c, a) => {
            // 奈美斯金冠：法老条纹头巾冠——双垂翼 + 额前蛇徽 + 金蓝条纹
            g.fillStyle(c, 1); // 冠体（包头形）
            g.beginPath();
            g.arc(x, hy + 1, 15, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 15, hy + 1, 30, 6);
            for (let k = -2; k <= 2; k++) { // 金蓝条纹
                g.fillStyle(k % 2 ? a : 0xb8943a, 0.8);
                g.fillRect(x + k * 6 - 1.4, hy - 12 + Math.abs(k) * 1.4, 2.8, 12 - Math.abs(k) * 1.4);
            }
            for (const s of [-1, 1]) { // 双垂翼（垂到肩的头巾翼）
                g.fillStyle(c, 0.95);
                hpoly(g, [
                    [x + s * 13, hy + 2], [x + s * 17, hy + 14], [x + s * 20, hy + 20], [x + s * 15, hy + 18], [x + s * 11, hy + 6],
                ], s > 0 ? c : 0xb8943a, 0.95);
                g.fillStyle(a, 0.7); // 翼上条纹
                g.fillRect(x + s * 14, hy + 8, 4, 1.6);
                g.fillRect(x + s * 15, hy + 13, 4, 1.6);
            }
            g.fillStyle(0xffd45c, 1); // 额前蛇徽
            g.fillEllipse(x, hy - 8, 5, 7);
            g.fillStyle(0x1a1408, 1);
            g.fillCircle(x - 1.2, hy - 10, 0.6);
            g.fillCircle(x + 1.2, hy - 10, 0.6);
            const gl = 0.4 + 0.3 * Math.sin(now / 380); // 冠辉光
            g.lineStyle(1.2, 0xfff0b0, gl);
            g.beginPath();
            g.arc(x, hy + 1, 15, Math.PI, TAU);
            g.strokePath();
        } },
    njaHatA: { c: 0x2a2a34, a: 0xc0392b, draw: (g, now, x, hy, c, _a) => {
            // 护额：忍者额护——金属板 + 划痕 + 额带 + 垂带飘动
            g.fillStyle(c, 1); // 额带
            g.fillRect(x - 15, hy - 3, 30, 7);
            g.fillStyle(0x8a94a2, 1); // 金属板
            g.fillRoundedRect(x - 9, hy - 4.4, 18, 9, 2);
            g.fillStyle(0xb8c0cc, 0.6); // 板面受光
            g.fillRect(x - 9, hy - 4.4, 18, 2.6);
            g.lineStyle(1.2, 0x5a6472, 0.9); // 板上刻痕村徽（螺旋）
            g.beginPath();
            g.arc(x, hy, 2.6, now / 500, now / 500 + 4.2);
            g.strokePath();
            g.lineStyle(1, 0x5a6472, 0.8); // 战斗划痕
            g.lineBetween(x + 3, hy - 3, x + 7, hy + 2);
            g.lineBetween(x - 6, hy + 1, x - 3, hy + 3);
            for (const s of [-1, 1]) { // 垂带（长带飘动）
                const flap = Math.sin(now / 320 + (s > 0 ? 0 : 1.2)) * 2.4;
                g.fillStyle(s > 0 ? c : 0x1a1a22, 0.95);
                hpoly(g, [
                    [x + s * 14, hy + 2], [x + s * 22 + flap, hy + 14], [x + s * 20 + flap, hy + 18], [x + s * 11, hy + 4],
                ], s > 0 ? c : 0x1a1a22, 0.95);
            }
        } },
    njaHatB: { c: 0xd8d0c0, a: 0xc0392b, draw: (g, now, x, hy, c, a) => {
            // 暗部面具：侧挂的瓷面具——白面具脸 + 红纹 + 眼缝幽光 + 挂绳
            const bob = Math.sin(now / 700) * 1.6;
            g.save();
            g.translateCanvas(x + 12, hy + 4 + bob);
            g.rotateCanvas(0.14);
            g.lineStyle(1.4, a, 0.9); // 挂绳
            g.lineBetween(-12, -4, -20, -2);
            g.fillStyle(c, 1); // 面具脸（上宽下尖）
            g.fillPoints([
                { x: -7, y: -8 }, { x: 7, y: -8 }, { x: 7.4, y: 0 }, { x: 0, y: 10 }, { x: -7.4, y: 0 },
            ], true);
            g.fillStyle(0xc0b8a8, 0.5); // 面具侧影
            g.fillPoints([
                { x: 3, y: -8 }, { x: 7, y: -8 }, { x: 7.4, y: 0 }, { x: 0, y: 10 },
            ], true);
            for (const s of [-1, 1]) { // 眼缝幽光
                const gl = 0.5 + 0.5 * Math.sin(now / 340 + s);
                g.fillStyle(0x0c0c12, 1);
                g.fillEllipse(s * 3.4, -3, 4.4, 1.8);
                g.fillStyle(0xff5a5c, gl);
                g.fillEllipse(s * 3.4, -3, 3.4, 1);
            }
            g.lineStyle(1.4, a, 0.9); // 红纹（面纹两道）
            g.lineBetween(-4.4, 2, -3, 7);
            g.lineBetween(4.4, 2, 3, 7);
            g.lineBetween(-5, -6.4, -2, -5); // 眉纹
            g.lineBetween(5, -6.4, 2, -5);
            g.restore();
        } },
};
