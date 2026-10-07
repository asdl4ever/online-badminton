import { wpoly, TAU } from './shared.js';
/**
 * 批六主题背挂物件（法老秘葬 / 暗部忍道）。
 * 全部 `single: true`：只画一次、不镜像、不随扇动旋转，动效在 painter 体内。
 */
export const WINGS_13 = {
    // ---- 法老秘葬 ----
    egBackA: { c: 0xd9b45c, a: 0x3a5a8a, single: true, draw: (g, now, _flap, c, a) => {
            // 圣杖连枷：背后交叉的王权圣杖与连枷——弯钩杖 + 三珠连枷 + 交叉金光
            g.save();
            g.translateCanvas(-4, 0);
            const sway = Math.sin(now / 800) * 0.02;
            g.save();
            g.rotateCanvas(-0.34 + sway); // 弯钩杖
            g.fillStyle(c, 1);
            g.fillRect(-2.4, -28, 4.8, 56);
            g.fillStyle(a, 0.9); // 杖头弯钩
            g.fillRect(-2.4, -34, 4.8, 7);
            g.fillPoints([{ x: -2.4, y: -30 }, { x: -10, y: -34 }, { x: -10, y: -27 }, { x: -2.4, y: -25 }], true);
            g.restore();
            g.save();
            g.rotateCanvas(0.3 - sway); // 连枷
            g.fillStyle(c, 1);
            g.fillRect(-2, -24, 4, 46);
            for (let k = 0; k < 3; k++) { // 三珠垂链
                const ph = Math.sin(now / 400 + k) * 1.4;
                g.fillStyle(a, 0.9);
                g.fillCircle(k * 3 - 3, 26 + ph, 2.2);
            }
            g.restore();
            // 交叉金光（呼吸）
            const gl = 0.25 + 0.2 * Math.sin(now / 380);
            g.fillStyle(c, gl);
            g.fillCircle(-4, 0, 14);
            g.restore();
        } },
    egBackB: { c: 0x3a5a8a, a: 0x5ac8ff, single: true, draw: (g, now, _flap, c, a) => {
            // 圣甲虫：背负的巨大圣甲虫——鞘翅 + 展开的彩虹膜翅 + 推动的小日轮
            const bob = Math.sin(now / 700) * 2.4;
            g.save();
            g.translateCanvas(-8, -10 + bob);
            g.rotateCanvas(-0.15);
            // 膜翅（两片半透明虹翅）
            for (const s of [-1, 1]) {
                const flap = Math.sin(now / 160 + (s > 0 ? 0 : 1.5)) * 0.24;
                g.save();
                g.rotateCanvas(s * (0.5 + flap));
                g.fillStyle(s > 0 ? 0x9fd8ff : 0xc0b0ff, 0.4);
                wpoly(g, [[2, -2], [26, -22], [34, -10], [8, 4]], s > 0 ? 0x9fd8ff : 0xc0b0ff, 0.38);
                g.lineStyle(0.8, a, 0.5);
                g.lineBetween(4, 0, 28, -16);
                g.restore();
            }
            g.fillStyle(c, 1); // 鞘翅（双瓣）
            g.fillEllipse(-3, 0, 13, 20);
            g.fillEllipse(3, 0, 13, 20);
            g.lineStyle(1.2, a, 0.8); // 鞘翅中缝
            g.lineBetween(0, -9, 0, 9);
            g.fillStyle(0x2a3a5a, 1); // 头胸
            g.fillCircle(0, -11, 6);
            g.fillStyle(0xd9b45c, 0.9); // 金色头盾
            g.fillEllipse(0, -14, 6, 4);
            g.fillStyle(0xffd45c, 0.9); // 推动的小日轮
            const sun = 0.5 + 0.5 * Math.sin(now / 300);
            g.fillCircle(0, -20, 3.4 + sun);
            g.fillStyle(0xfff6d8, 0.8);
            g.fillCircle(0, -20, 1.6);
            g.restore();
        } },
    egBackC: { c: 0xffd45c, a: 0x3a5a8a, single: true, draw: (g, now, _flap, c, a) => {
            // 荷鲁斯之眼：悬浮在身侧的守护法眼——眼形 + 泪痕 + 螺纹尾 + 扫视瞳
            const bob = Math.sin(now / 850) * 3;
            g.save();
            g.translateCanvas(-12, -14 + bob);
            g.fillStyle(c, 0.14); // 法眼辉光
            g.fillCircle(0, 0, 22);
            g.lineStyle(2.6, c, 0.95); // 上眼睑（杏仁弧）
            g.beginPath();
            g.moveTo(-12, 0);
            g.lineTo(-6, -7);
            g.lineTo(6, -7);
            g.lineTo(12, 0);
            g.strokePath();
            g.beginPath();
            g.moveTo(-12, 0);
            g.lineTo(-6, 5);
            g.lineTo(6, 5);
            g.lineTo(12, 0);
            g.strokePath();
            const scan = Math.sin(now / 600) * 4; // 扫视瞳
            g.fillStyle(a, 0.95);
            g.fillEllipse(scan, -1, 7, 6);
            g.fillStyle(0xffd45c, 0.6);
            g.fillCircle(scan - 1.4, -2.4, 1.4);
            g.lineStyle(2.2, c, 0.9); // 泪痕（眼下垂直线）
            g.lineBetween(0, 6, 0, 16);
            g.lineBetween(0, 16, -5, 16);
            // 螺纹尾（向右下卷曲的折线螺旋）
            g.lineStyle(2.2, c, 0.9);
            g.beginPath();
            g.moveTo(12, 2);
            g.lineTo(20, 4);
            g.lineTo(22, 10);
            g.lineTo(16, 13);
            g.lineTo(12, 10);
            g.strokePath();
            g.restore();
        } },
    egBackD: { c: 0xd9c88a, a: 0x3a5a8a, single: true, draw: (g, now, _flap, _c, a) => {
            // 圣书浮匾：背后悬浮的圣书石匾——石匾 + 三行圣书字 + 金光描边 + 微尘
            const bob = Math.sin(now / 900) * 2;
            g.save();
            g.translateCanvas(-8, -8 + bob);
            g.rotateCanvas(-0.06);
            g.fillStyle(0xc0b088, 0.95); // 石匾
            g.fillRoundedRect(-14, -22, 28, 44, 3);
            g.fillStyle(0xa89868, 0.7); // 匾面受光
            g.fillRect(-12, -20, 10, 40);
            g.lineStyle(1.2, a, 0.6); // 金光描边
            g.strokeRect(-14, -22, 28, 44);
            for (let r = 0; r < 3; r++) { // 三行圣书字（小符号排布，随机明灭似解读）
                for (let k = 0; k < 4; k++) {
                    const gl = 0.3 + 0.5 * Math.abs(Math.sin(now / 500 + r * 3 + k * 1.7));
                    const sx = -10 + k * 6.4, sy = -15 + r * 10;
                    g.fillStyle(a, gl);
                    if ((r + k) % 3 === 0)
                        g.fillEllipse(sx, sy, 4, 2.6);
                    else if ((r + k) % 3 === 1) {
                        g.fillRect(sx - 1.4, sy - 2, 2.8, 4);
                    }
                    else
                        g.fillCircle(sx, sy, 1.8);
                }
            }
            g.restore();
            for (let k = 0; k < 3; k++) { // 匾周微尘
                const ph = (now / 1400 + k / 3) % 1;
                g.fillStyle(0xffd45c, 0.5 * (1 - ph));
                g.fillCircle(-8 + Math.sin(ph * 5 + k) * 14, 16 - ph * 30, 1.2 * (1 - ph) + 0.3);
            }
        } },
    // ---- 暗部忍道 ----
    njaBackA: { c: 0x8a94a2, a: 0xc0392b, single: true, draw: (g, now, _flap, _c, a) => {
            // 背负忍者刀：斜负的直刀——黑鞘 + 柄缠带 + 刀绪 + 呼吸的刀鸣线
            g.save();
            g.translateCanvas(-4, -6);
            g.rotateCanvas(-0.38 + Math.sin(now / 900) * 0.02);
            g.fillStyle(0x1a1a22, 1); // 黑鞘
            g.fillRect(-2.6, -18, 5.2, 52);
            g.fillStyle(0x2a2a34, 0.8);
            g.fillRect(-2.6, -18, 2.2, 52);
            g.fillStyle(0x3a3a44, 1); // 鞠金具
            g.fillRect(-3.2, -16, 6.4, 2.4);
            g.fillRect(-3.2, 30, 6.4, 2.4);
            g.fillStyle(0x1a1a22, 1); // 柄
            g.fillRect(-1.8, -32, 3.6, 14);
            g.lineStyle(0.9, a, 0.85); // 柄缠带（斜纹）
            for (let k = 0; k < 4; k++)
                g.lineBetween(-1.8, -31 + k * 3.2, 1.8, -29.6 + k * 3.2);
            const sway = Math.sin(now / 360) * 2; // 刀绪（灰紫绪）
            g.lineStyle(1.4, 0xb08ad0, 0.9);
            g.lineBetween(0, -32, sway, -40);
            g.fillStyle(0xb08ad0, 0.9);
            g.fillCircle(sway, -41, 1.6);
            const gl = 0.25 + 0.3 * Math.abs(Math.sin(now / 520)); // 刀鸣线
            g.fillStyle(0xdfe8f5, gl);
            g.fillRect(-2.6, -18, 5.2, 1.4);
            g.restore();
        } },
    njaBackB: { c: 0xb8c0cc, a: 0xc0392b, single: true, draw: (g, now, _flap, c, a) => {
            // 巨手里剑：背后悬转的四刃手里剑——四刃 + 中心孔 + 红绳环 + 旋转残光
            const cy = -14 + Math.sin(now / 750) * 2;
            const rot = now / 850;
            g.save();
            g.translateCanvas(0, cy);
            g.rotateCanvas(rot);
            for (let k = 0; k < 4; k++) { // 四刃
                g.save();
                g.rotateCanvas((k / 4) * TAU);
                g.fillStyle(c, 0.95);
                wpoly(g, [[-3, -4], [0, -26], [3, -4], [1.4, -2], [-1.4, -2]], c, 0.95);
                g.fillStyle(0xdfe8f5, 0.5); // 刃面开锋
                wpoly(g, [[0, -26], [3, -4], [1.4, -2]], 0xdfe8f5, 0.5);
                g.restore();
            }
            g.fillStyle(0x2a2a34, 1); // 中心座
            g.fillCircle(0, 0, 5.4);
            g.fillStyle(0x0c0c12, 1); // 中心孔
            g.fillCircle(0, 0, 2.4);
            g.fillStyle(a, 0.9); // 红绳环
            g.lineStyle(1.6, a, 0.9);
            g.strokeCircle(0, 0, 8.4);
            g.restore();
            // 旋转残光（跟随的淡弧）
            g.lineStyle(2, c, 0.25);
            g.beginPath();
            g.arc(0, cy, 24, rot + 0.4, rot + 1.7);
            g.strokePath();
        } },
    njaBackC: { c: 0xd9c8a0, a: 0xb08ad0, single: true, draw: (g, now, _flap, c, a) => {
            // 封印卷轴：背后的紫绳卷轴——卷筒 + 解开的一角 + 封印符文 + 灵光
            const bob = Math.sin(now / 820) * 1.8;
            g.save();
            g.translateCanvas(-10, 2 + bob);
            g.fillStyle(c, 1); // 卷筒（横置）
            g.fillRoundedRect(-16, -8, 32, 16, 6);
            g.fillStyle(0xc0b088, 0.6); // 卷纸纹
            g.fillRect(-16, -2, 32, 2);
            g.fillStyle(0x8a6a3a, 1); // 两端木轴
            g.fillEllipse(-16, 0, 5, 14);
            g.fillEllipse(16, 0, 5, 14);
            // 解开的卷角（垂下的纸片 + 符文）
            const unroll = 8 + Math.sin(now / 600) * 1.4;
            g.fillStyle(0xe8dcb8, 0.95);
            g.fillRect(-6, 8, 12, unroll);
            for (let k = 0; k < 2; k++) {
                const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 400 + k));
                g.fillStyle(a, gl);
                g.fillRect(-3.4 + k * 5, 11 + k * 3, 2.8, 1.6);
                g.fillRect(-2 + k * 5, 9.4 + k * 3, 0.8, 4.8);
            }
            g.lineStyle(2, a, 0.95); // 紫绳十字缚
            g.lineBetween(-16, 0, 16, 0);
            g.lineBetween(0, -8, 0, 8);
            g.fillStyle(0xd9b45c, 0.9); // 绳结印
            g.fillCircle(0, 0, 2.6);
            g.restore();
            // 封印灵光（周期性从符文逸出）
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1200 + k / 3) % 1;
                g.fillStyle(a, 0.6 * (1 - ph));
                g.fillCircle(-10 + Math.sin(ph * 4 + k) * 4, 12 + bob - ph * 20, 1.3 * (1 - ph) + 0.3);
            }
        } },
    njaBackD: { c: 0xb08ad0, a: 0xd8d0c0, single: true, draw: (g, now, _flap, c, a) => {
            // 影分身残像：身后两个结印的紫色残像——半透明人形 + 结印手势 + 消散粒子
            for (let k = 0; k < 2; k++) {
                const ph = now / 1100 + k * Math.PI / 2;
                const fade = 0.25 + 0.15 * Math.sin(ph);
                const ox = -22 - k * 12, oy = -6 + Math.sin(ph * 2) * 2;
                g.fillStyle(c, fade); // 残像躯干
                g.fillRoundedRect(ox - 6, oy - 4, 12, 26, 4);
                g.fillStyle(c, fade * 0.9); // 残像头
                g.fillCircle(ox, oy - 10, 5);
                g.fillStyle(0x0c0c12, fade); // 面具眼缝
                g.fillRect(ox - 3, oy - 11, 6, 1.4);
                // 结印手势（胸前合掌）
                g.fillStyle(c, fade);
                g.fillTriangle(ox - 3, oy + 2, ox + 3, oy + 2, ox, oy - 3);
                // 脚部消散
                for (let s = 0; s < 3; s++) {
                    g.fillStyle(c, fade * 0.6 * (1 - s / 3));
                    g.fillCircle(ox - 3 + s * 3, oy + 24 + s * 2 + Math.sin(now / 300 + s) * 1.4, 2.4 - s * 0.5);
                }
            }
            for (let k = 0; k < 4; k++) { // 消散粒子
                const ph = (now / 900 + k / 4) % 1;
                g.fillStyle(a, 0.6 * (1 - ph));
                g.fillCircle(-26 + Math.sin(ph * 5 + k) * 8, 18 - ph * 26, 1.4 * (1 - ph) + 0.4);
            }
        } },
};
