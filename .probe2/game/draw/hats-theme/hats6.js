import { hpoly, TAU } from './shared.js';
/** 批三主题头饰（光之巨人 / 怪兽之王） */
export const HATS_6 = {
    otmHatA: { c: 0xdfe8f5, a: 0xff4a5c, draw: (g, now, x, hy, c, a) => {
            // 银光头镖：头顶竖立的银色头镖（能量刃）+ 底座 + 刃身流光
            g.fillStyle(0x8a94a2, 1); // 底座
            g.fillEllipse(x, hy + 2, 14, 5);
            g.fillStyle(c, 1); // 刃身（上窄下宽的银刃）
            hpoly(g, [[x - 3, hy + 2], [x - 2, hy - 24], [x, hy - 30], [x + 2, hy - 24], [x + 3, hy + 2]], c);
            g.fillStyle(0xffffff, 0.55); // 刃面受光
            hpoly(g, [[x - 3, hy + 2], [x - 2, hy - 24], [x - 0.6, hy - 22]], 0xffffff, 0.5);
            const gl = 0.5 + 0.5 * Math.sin(now / 300); // 刃身流光（自下而上扫）
            const ly = hy + 2 - ((now / 500) % 1) * 30;
            g.fillStyle(a, gl * 0.7);
            g.fillRect(x - 1.2, ly, 2.4, 2.6);
            for (let k = 0; k < 3; k++) { // 刃尖光粒
                const ph = (now / 700 + k / 3) % 1;
                g.fillStyle(a, 0.7 * (1 - ph));
                g.fillCircle(x + Math.sin(k * 2 + now / 200) * 2, hy - 30 - ph * 8, 1.2 * (1 - ph) + 0.3);
            }
        } },
    otmHatB: { c: 0xff4a5c, a: 0x9fd8ff, draw: (g, now, x, hy, c, a) => {
            // 计时器发带：额头发带 + 中央计时器宝石（蓝红双相闪）+ 侧翼小灯
            g.fillStyle(0xdfe8f5, 1); // 发带
            g.fillRect(x - 16, hy - 3, 32, 6);
            g.fillStyle(0x8a94a2, 0.8);
            g.fillRect(x - 16, hy + 2, 32, 1.4);
            const pulse = 0.5 + 0.5 * Math.sin(now / 350); // 计时器（蓝↔红呼吸）
            g.fillStyle(a, 0.3 + pulse * 0.3);
            g.fillCircle(x, hy, 7);
            g.fillStyle(pulse > 0.7 ? c : a, 0.95);
            g.fillCircle(x, hy, 3.6);
            g.fillStyle(0xffffff, 0.85);
            g.fillCircle(x - 1, hy - 1, 1.2);
            for (const s of [-1, 1]) { // 侧翼小灯（交替闪）
                const bl = Math.abs(Math.sin(now / 300 + (s > 0 ? 0 : Math.PI / 2)));
                g.fillStyle(s > 0 ? a : c, bl);
                g.fillCircle(x + s * 13, hy, 1.6);
            }
        } },
    kjuHatA: { c: 0x7de87d, a: 0xcfc4a0, draw: (g, now, x, hy, c, a) => {
            // 兽王头冠：一圈兽骨獠牙冠 + 中心绿晶 + 骨刺
            g.fillStyle(0x2f4530, 1); // 冠带
            g.fillRect(x - 15, hy, 30, 5);
            for (let k = -2; k <= 2; k++) { // 獠牙（五根，中间最高）
                const h = 12 - Math.abs(k) * 3.4;
                g.fillStyle(a, 1);
                hpoly(g, [[x + k * 6 - 2, hy], [x + k * 6, hy - h], [x + k * 6 + 2, hy]], a);
            }
            g.fillStyle(c, 0.35 + 0.25 * Math.sin(now / 320)); // 中心绿晶
            g.fillCircle(x, hy - 3, 6);
            g.fillStyle(c, 0.95);
            hpoly(g, [[x, hy - 8], [x + 2.6, hy - 3], [x, hy + 1.4], [x - 2.6, hy - 3]], c);
            g.fillStyle(0xffffff, 0.7);
            g.fillCircle(x - 0.8, hy - 4.4, 0.9);
            for (let k = 0; k < 2; k++) { // 冠带铆钉
                g.fillStyle(a, 0.8);
                g.fillCircle(x - 11 + k * 22, hy + 2.4, 1.2);
            }
        } },
    kjuHatB: { c: 0x4a5a3a, a: 0x5ac8ff, draw: (g, now, x, hy, c, a) => {
            // 脊鳍盔：仿兽王背鳍的头盔——三片骨鳍 + 盔体 + 原子蓄能光
            g.fillStyle(c, 1); // 盔体
            g.beginPath();
            g.arc(x, hy + 3, 14, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 14, hy + 3, 28, 4);
            for (let k = -1; k <= 1; k++) { // 三片骨鳍（中间高）
                const h = 18 - Math.abs(k) * 6;
                const fx = x + k * 8;
                g.fillStyle(0xcfc4a0, 1);
                hpoly(g, [[fx - 2.4, hy - 1], [fx, hy - 1 - h], [fx + 2.4, hy - 1]], 0xcfc4a0);
                const gl = 0.3 + 0.3 * Math.sin(now / 300 + k); // 鳍缘原子光
                g.lineStyle(1.4, a, gl + 0.3);
                g.lineBetween(fx, hy - 3, fx, hy - 1 - h);
            }
            g.fillStyle(0x101810, 1); // 观察缝
            g.fillRect(x - 8, hy - 3, 16, 3);
            const bl = 0.5 + 0.5 * Math.sin(now / 260); // 盔沿蓄能灯
            g.fillStyle(a, bl);
            g.fillRect(x - 8, hy + 3.6, 16, 1.6);
        } },
};
