import { TAU } from './shared.js';
/** 批七主题挥拍拖尾（赛博都市 / 东海龙宫 / 时空旅行）。kit 提供轨迹 pts/ribbon/core/at/dot。 */
export const SWINGS_8 = {
    cybSwing: { a: 0x39ffd0, draw: (g, now, hot, kit, c, a) => {
            // 脉冲斩：能量脉冲刃——双频刃面 + 电容充能环 + 贯穿射线 + 碎码
            kit.ribbon(11, c, 0.5 * hot);
            kit.ribbon(6, 0xffffff, 0.75 * hot);
            kit.ribbon(2.4, a, 0.85 * hot, -1.2);
            // 电容充能环（球头处的充能方环）
            const head = kit.at(kit.n - 1);
            const charge = (now / 400) % 1;
            g.lineStyle(1.6, a, 0.8 * hot);
            g.strokeRect(head.x - 6 - charge * 4, head.y - 6 - charge * 4, 12 + charge * 8, 12 + charge * 8);
            g.fillStyle(0xffffff, 0.9 * hot);
            g.fillCircle(head.x, head.y, 2.6);
            // 贯穿射线（沿轨迹末端的直线射线）
            const prev = kit.at(Math.max(0, kit.n - 6));
            const dx = head.x - prev.x, dy = head.y - prev.y;
            const l = Math.hypot(dx, dy) || 1;
            g.lineStyle(2, c, 0.7 * hot);
            g.lineBetween(head.x, head.y, head.x + (dx / l) * 26, head.y + (dy / l) * 26);
            g.fillStyle(0xffffff, 0.7 * hot);
            g.fillCircle(head.x + (dx / l) * 26, head.y + (dy / l) * 26, 1.6);
            for (let k = 0; k < 5; k++) { // 碎码（崩散的方块数据）
                const i = Math.floor(((k + 0.3) / 5) * (kit.n - 1));
                const p = kit.at(i);
                const ph = (now / 300 + k / 5) % 1;
                g.fillStyle(k % 2 ? a : c, (0.8 * (1 - ph)) * hot);
                g.fillRect(p.x + Math.sin(ph * 5 + k) * 6 - 1.2, p.y - ph * 10 - 1.2, 2.4, 2.4);
            }
        } },
    dgSwing: { a: 0x5affd0, draw: (g, now, hot, kit, c, a) => {
            // 翻江倒海：龙尾横扫的巨浪——宽浪扫面 + 双层浪卷 + 龙影掠过 + 飞鱼
            kit.ribbon(18, c, 0.4 * hot);
            kit.ribbon(11, 0xbfffe8, 0.6 * hot);
            kit.ribbon(4, 0xffffff, 0.85 * hot);
            // 双层浪卷（球头处上下两道卷浪弧）
            const head = kit.at(kit.n - 1);
            for (let k = 0; k < 2; k++) {
                const ph = (now / 380 + k / 2) % 1;
                g.lineStyle(3 * (1 - ph) + 0.6, k ? a : 0xffffff, (0.7 * (1 - ph)) * hot);
                g.beginPath();
                g.arc(head.x, head.y + k * 6, 6 + ph * 16, Math.PI, Math.PI * (1.8 + ph * 0.4));
                g.strokePath();
            }
            // 龙影掠过（沿轨迹掠过的一条龙形光带）
            const u = (now / 700) % 1;
            const i = Math.floor(u * (kit.n - 1));
            const p = kit.at(i);
            g.save();
            g.translateCanvas(p.x, p.y);
            g.rotateCanvas(Math.sin(now / 200) * 0.2);
            g.fillStyle(c, 0.7 * hot);
            g.fillEllipse(0, 0, 14, 5);
            g.fillStyle(0xffffff, 0.8 * hot); // 龙角两点
            g.fillTriangle(-4, -2.4, -2, -2.4, -3, -5);
            g.fillStyle(0x1a4054, 0.8 * hot); // 眼
            g.fillCircle(4, -0.8, 0.9);
            g.restore();
            for (let k = 0; k < 5; k++) { // 飞鱼（浪里跳出的小鱼）
                const i2 = Math.floor(((k + 0.3) / 5) * (kit.n - 1));
                const p2 = kit.at(i2);
                const ph = (now / 400 + k / 5) % 1;
                g.fillStyle(k % 2 ? 0xffd45c : 0xff8a5c, (0.8 * (1 - ph)) * hot);
                g.fillEllipse(p2.x + Math.sin(k * 2) * 4, p2.y - Math.sin(ph * Math.PI) * 12, 4, 2);
                g.fillTriangle(p2.x + Math.sin(k * 2) * 4 - 2, p2.y - Math.sin(ph * Math.PI) * 12, p2.x + Math.sin(k * 2) * 4 - 4, p2.y - Math.sin(ph * Math.PI) * 12 - 2, p2.x + Math.sin(k * 2) * 4 - 4, p2.y - Math.sin(ph * Math.PI) * 12 + 2);
            }
            g.fillStyle(0xffffff, 0.9 * hot);
            g.fillCircle(head.x, head.y, 2.8);
        } },
    chronoSwing: { a: 0x9b5cff, draw: (g, now, hot, kit, c, a) => {
            // 时光斩：斩击同时存在于三个时刻——三重错位刃 + 时钟崩解 + 回溯光
            for (let k = 0; k < 3; k++) { // 三重错位刃（过去/现在/未来的刃面错位）
                const off = (k - 1) * 5;
                kit.ribbon(k === 1 ? 10 : 6, k === 1 ? 0xffffff : (k ? a : c), (0.6 - Math.abs(k - 1) * 0.2) * hot, off);
            }
            const head = kit.at(kit.n - 1);
            // 时钟崩解（球头处崩碎的表盘：环 + 四散刻度）
            const shatter = (now / 800) % 1;
            g.lineStyle(2, a, (1 - shatter) * 0.8 * hot);
            g.strokeCircle(head.x, head.y, 8 + shatter * 16);
            for (let k = 0; k < 12; k++) {
                const ang = (k / 12) * TAU;
                const r = 8 + shatter * 16;
                g.fillStyle(k % 2 ? a : 0xffffff, (1 - shatter) * 0.8 * hot);
                g.fillRect(head.x + Math.cos(ang) * r - 1, head.y + Math.sin(ang) * r - 1, 2, 2);
            }
            // 回溯光（沿轨迹反向流动的光点，时间倒流感）
            for (let k = 0; k < 4; k++) {
                const u = 1 - ((now / 450 + k / 4) % 1);
                const i = Math.floor(u * (kit.n - 1));
                const p = kit.at(i);
                g.fillStyle(k % 2 ? a : 0xffffff, 0.85 * Math.sin(u * Math.PI) * hot);
                g.fillCircle(p.x, p.y, 1.6);
                g.fillStyle(c, 0.3 * Math.sin(u * Math.PI) * hot);
                g.fillCircle(p.x, p.y, 3.4);
            }
            g.fillStyle(0xffffff, 0.9 * hot);
            g.fillCircle(head.x, head.y, 2.6);
            g.fillStyle(a, 0.4 * hot);
            g.fillCircle(head.x, head.y, 5);
        } },
};
