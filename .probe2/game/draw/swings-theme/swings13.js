import { TAU } from './shared.js';
/** 批十二挥拍拖尾（变形机甲 / 蛛网游侠 / 钢铁巨兽）——沿真实挥击轨迹构图 */
export const SWINGS_13 = {
    tfSwing: { a: 0x5ac8ff, draw: (g, now, hot, kit, c, a) => {
            // 变形重击：机械重刃轨迹 + 齿轮碎块崩飞 + 能量破片环 + 相位残影
            const n = kit.n;
            // 相位残影（轨迹整体错位两层）
            kit.ribbon(11, 0x5ac8ff, 0.18, 3);
            kit.ribbon(11, 0xff8a2a, 0.18, -3);
            kit.ribbon(14, c, 0.4);
            kit.core(7, 0.5);
            for (let k = 0; k < 6; k++) { // 沿轨迹的机械刃节
                const i = Math.floor(((k + 0.2) / 6) * (n - 1));
                const p = kit.at(i);
                const s = 4 + (k / 6) * 6;
                g.save();
                g.translateCanvas(p.x, p.y);
                g.rotateCanvas(k * 0.6 + now / 300);
                g.fillStyle(0x2a3a4a, 0.85);
                g.fillRect(-s, -s * 0.32, s * 2, s * 0.64);
                g.fillStyle(a, 0.7);
                g.fillRect(-s * 0.8, -s * 0.16, s * 1.6, s * 0.32);
                g.restore();
            }
            const tip = kit.at(n - 1); // 收尾：撞击爆点
            const burst = ((now / 110) % 1);
            for (let k = 0; k < 3; k++) { // 破片环
                const r = 6 + burst * (16 + k * 10);
                g.lineStyle(2.4 - k * 0.5, k === 0 ? 0xffffff : a, Math.max(0, 0.75 - burst) * (1 - k * 0.2));
                g.beginPath();
                g.arc(tip.x, tip.y, r, 0, TAU);
                g.strokePath();
            }
            for (let k = 0; k < 7; k++) { // 崩飞的齿轮碎片
                const ang = (k / 7) * TAU + now / 500;
                const d = 12 + burst * 26;
                g.save();
                g.translateCanvas(tip.x + Math.cos(ang) * d, tip.y + Math.sin(ang) * d);
                g.rotateCanvas(ang * 2 + now / 200);
                g.fillStyle(hot > 0.5 ? 0xffd45c : 0x8a94a2, 0.9);
                g.fillRect(-3, -2.4, 6, 4.8);
                g.fillStyle(0x2a3a4a, 0.9);
                g.fillRect(-1.2, -1.2, 2.4, 2.4);
                g.restore();
            }
        } },
    spdSwing: { a: 0xff4a5a, draw: (g, now, hot, kit, c, _a) => {
            // 蛛网猛击：拳风轨迹 + 命中网点（蛛网从冲击点炸开）+ 蛛感波纹 + 裂纹
            const n = kit.n;
            kit.ribbon(12, 0xd8e0e8, 0.35);
            kit.ribbon(8, c, 0.45);
            kit.core(5, 0.55);
            const tip = kit.at(n - 1);
            // 从冲击点炸开的蛛网（八向 + 三圈）
            const burst = ((now / 130) % 1);
            const rr = 10 + burst * 30;
            g.lineStyle(1.4, 0xf0f4f8, Math.max(0, 0.8 - burst) * 0.9);
            for (let k = 0; k < 8; k++) {
                const ang = (k / 8) * TAU;
                g.lineBetween(tip.x, tip.y, tip.x + Math.cos(ang) * rr, tip.y + Math.sin(ang) * rr);
            }
            for (let k = 1; k <= 3; k++) {
                g.lineStyle(1.2, 0xf0f4f8, Math.max(0, 0.7 - burst) * (1 - k * 0.2));
                g.save();
                g.translateCanvas(tip.x, tip.y);
                g.scaleCanvas(1, 0.75);
                g.beginPath();
                g.arc(0, 0, rr * (k / 3.2), 0, TAU);
                g.strokePath();
                g.restore();
            }
            // 蛛感波纹（快速外扩两道）
            for (let k = 0; k < 2; k++) {
                const ph = ((now / 90 + k / 2) % 1);
                g.lineStyle(2 - ph, 0x8ae0ff, Math.max(0, 0.6 - ph) * 0.9);
                g.save();
                g.translateCanvas(tip.x, tip.y);
                g.scaleCanvas(1, 0.6);
                g.beginPath();
                g.arc(0, 0, 8 + ph * 40, 0, TAU);
                g.strokePath();
                g.restore();
            }
            // 沿拳风的白色丝线
            for (let k = 0; k < 4; k++) {
                const i = Math.floor(((k + 0.3) / 4) * (n - 1));
                const p = kit.at(i);
                g.lineStyle(1.2, 0xffffff, 0.5);
                g.beginPath();
                g.moveTo(p.x - 6, p.y - 4 + k * 2);
                g.lineTo(p.x + 8, p.y + 2 + k * 2);
                g.strokePath();
            }
            // 命中闪白
            if (hot > 0.5) {
                g.fillStyle(0xffffff, 0.5);
                g.fillCircle(tip.x, tip.y, 6);
            }
        } },
    bstSwing: { a: 0xff6a2a, draw: (g, now, hot, kit, c, _a) => {
            // 巨兽践踏：沉重的砸击轨迹 + 地面碎裂 + 冲击波 + 熔岩喷溅
            const n = kit.n;
            kit.ribbon(16, 0x4a4a52, 0.4);
            kit.ribbon(10, c, 0.45);
            kit.core(6, 0.55);
            // 轨迹下缘的地面犁痕
            g.lineStyle(2.4, 0x1a1a20, 0.7);
            g.beginPath();
            for (let i = 0; i < n; i++) {
                const p = kit.at(i);
                if (i === 0)
                    g.moveTo(p.x, p.y + 10);
                else
                    g.lineTo(p.x, p.y + 10);
            }
            g.strokePath();
            const tip = kit.at(n - 1);
            const burst = ((now / 120) % 1);
            // 三重冲击波
            for (let k = 0; k < 3; k++) {
                const rr = 8 + burst * (20 + k * 14);
                g.lineStyle(2.6 - k * 0.6, k === 0 ? 0xffffff : 0xff6a2a, Math.max(0, 0.7 - burst) * (1 - k * 0.22));
                g.save();
                g.translateCanvas(tip.x, tip.y);
                g.scaleCanvas(1, 0.5);
                g.beginPath();
                g.arc(0, 0, rr, 0, TAU);
                g.strokePath();
                g.restore();
            }
            // 地面放射裂缝
            g.lineStyle(2, 0x14141a, 0.85);
            for (let k = 0; k < 7; k++) {
                const ang = (k / 7) * TAU + 0.4;
                const d = 14 + burst * 22;
                g.beginPath();
                g.moveTo(tip.x, tip.y + 4);
                g.lineTo(tip.x + Math.cos(ang) * d * 0.6, tip.y + 4 + Math.sin(ang) * d * 0.3);
                g.lineTo(tip.x + Math.cos(ang) * d, tip.y + 4 + Math.sin(ang) * d * 0.4);
                g.strokePath();
            }
            // 熔岩喷溅（向上飞出的熔滴）
            for (let k = 0; k < 8; k++) {
                const ang = -Math.PI * 0.15 + k * 0.42;
                const ph = ((now / 200 + k / 8) % 1);
                const d = ph * 30;
                g.fillStyle(k % 2 ? 0xffd45c : 0xff6a2a, (1 - ph) * 0.9);
                g.fillCircle(tip.x + Math.cos(ang) * d, tip.y - Math.abs(Math.sin(ang)) * d * 1.2 + ph * 6, 2 * (1 - ph) + 0.6);
            }
            // 崩起的碎钢块
            for (let k = 0; k < 5; k++) {
                const ang = (k / 5) * TAU + now / 400;
                const d = 10 + burst * 24;
                g.save();
                g.translateCanvas(tip.x + Math.cos(ang) * d, tip.y - 4 + Math.sin(ang) * d * 0.5);
                g.rotateCanvas(ang * 3 + now / 250);
                g.fillStyle(0x8a8a92, 0.9);
                g.fillPoints([{ x: -4, y: -3 }, { x: 4, y: -4 }, { x: 3, y: 3 }, { x: -3, y: 2 }], true);
                g.restore();
            }
            if (hot > 0.5) {
                g.fillStyle(0xffd45c, 0.5);
                g.fillCircle(tip.x, tip.y, 8);
            }
        } },
};
