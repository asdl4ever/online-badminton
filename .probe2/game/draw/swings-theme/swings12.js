import { TAU } from './shared.js';
/** 批十一挥拍拖尾（软泥秘境 / 妖猫夜行 / 甲虫王朝）——沿真实挥击轨迹构图 */
export const SWINGS_12 = {
    slimeSwing: { a: 0xd0ff9a, draw: (g, now, hot, kit, c, a) => {
            // 果冻重压：一记Q弹的果冻巨掌拍痕 + 溅射泥滴
            kit.ribbon(13, c, 0.35);
            kit.core(7, 0.5);
            const n = kit.n;
            for (let k = 0; k < 6; k++) { // 轨迹上的果冻团块（Q弹脉动）
                const i = Math.floor(((k + 0.3) / 6) * (n - 1));
                const p = kit.at(i);
                const wob = 1 + Math.sin(now / 200 + k * 1.8) * 0.25;
                const r = (3 + (k / 6) * 7) * wob;
                g.fillStyle(c, 0.55);
                g.fillCircle(p.x, p.y, r);
                g.fillStyle(0xffffff, 0.3);
                g.fillCircle(p.x - r * 0.3, p.y - r * 0.3, r * 0.3);
            }
            const tip = kit.at(n - 1); // 掌痕：五瓣拍印
            for (let t = 0; t < 5; t++) {
                const ang = -0.9 + t * 0.45;
                g.fillStyle(hot > 0.5 ? a : c, 0.85);
                g.fillCircle(tip.x + Math.cos(ang) * 9, tip.y + Math.sin(ang) * 9, 3.2);
            }
            g.fillStyle(0xffffff, 0.5);
            g.fillCircle(tip.x, tip.y, 3.4);
            for (let k = 0; k < 5; k++) { // 溅射泥滴
                const ang = now / 300 + k * 1.26;
                const d = 12 + Math.abs(Math.sin(now / 250 + k)) * 6;
                g.fillStyle(a, 0.6);
                g.fillCircle(tip.x + Math.cos(ang) * d, tip.y + Math.sin(ang) * d, 1.8);
            }
        } },
    nekSwing: { a: 0xffd45c, draw: (g, now, hot, kit, c, a) => {
            // 三尾连击：三道残影刃波交替 + 爪风撕裂线
            for (let wave = 0; wave < 3; wave++) { // 三重残影刃波（相位错开）
                kit.ribbon(10 - wave * 2.4, wave === 1 ? a : c, 0.4 - wave * 0.1, wave * 2.2);
            }
            const n = kit.n;
            for (let k = 0; k < 5; k++) { // 爪风撕裂线（三道一组的爪痕）
                const i = Math.floor(((k + 0.2) / 5) * (n - 1));
                const p = kit.at(i);
                g.lineStyle(1.6, 0xd0b0ff, 0.6);
                for (const off of [-4, 0, 4]) {
                    g.beginPath();
                    g.moveTo(p.x + off, p.y - 6);
                    g.lineTo(p.x + off + 2, p.y + 6);
                    g.strokePath();
                }
            }
            const tip = kit.at(n - 1); // 收尾：妖猫之瞳闪爆
            const fl = 0.7 + 0.3 * Math.sin(now / 90);
            g.fillStyle(hot > 0.5 ? 0xffffff : a, 0.6 * fl);
            g.fillCircle(tip.x, tip.y, 10);
            g.fillStyle(c, 0.9);
            g.fillCircle(tip.x, tip.y, 5);
            g.fillStyle(a, fl); // 竖瞳
            g.fillEllipse(tip.x, tip.y, 1.6, 5);
            for (let k = 0; k < 6; k++) { // 爆散妖火
                const ang = (k / 6) * TAU + now / 400;
                g.fillStyle(a, 0.7);
                g.fillCircle(tip.x + Math.cos(ang) * 13, tip.y + Math.sin(ang) * 13, 1.8);
            }
        } },
    btlSwing: { a: 0x7dff5a, draw: (g, now, hot, kit, c, a) => {
            // 角突冲撞：金色冲角犁地轨迹 + 碎土飞溅 + 冲击环
            kit.ribbon(14, c, 0.4);
            kit.core(8, 0.55);
            const n = kit.n;
            g.lineStyle(2, a, 0.6); // 犁沟线（轨迹下缘）
            g.beginPath();
            for (let i = 0; i < n; i++) {
                const p = kit.at(i);
                if (i === 0)
                    g.moveTo(p.x, p.y + 7);
                else
                    g.lineTo(p.x, p.y + 7);
            }
            g.strokePath();
            for (let k = 0; k < 7; k++) { // 犁起的碎土
                const i = Math.floor(((k + 0.2) / 7) * (n - 1));
                const p = kit.at(i);
                const up = Math.abs(Math.sin(now / 320 + k * 1.5)) * 6;
                g.fillStyle(0x6a5a2a, 0.7);
                g.fillEllipse(p.x, p.y + 8 - up, 3, 2.2);
            }
            const tip = kit.at(n - 1); // 收尾：冲角锥 + 冲击环
            g.fillStyle(hot > 0.5 ? 0xfff0b0 : a, 0.9);
            g.fillPoints([
                { x: tip.x - 10, y: tip.y + 4 }, { x: tip.x + 2, y: tip.y - 8 }, { x: tip.x + 4, y: tip.y + 6 },
            ], true);
            const ring = 8 + ((now / 90) % 22); // 扩散冲击环
            g.lineStyle(2.4, a, Math.max(0, 0.8 - ring / 26));
            g.beginPath();
            g.arc(tip.x, tip.y, ring, 0, TAU);
            g.strokePath();
            g.lineStyle(1.2, c, Math.max(0, 0.5 - ring / 30));
            g.beginPath();
            g.arc(tip.x, tip.y, ring * 0.6, 0, TAU);
            g.strokePath();
        } },
};
