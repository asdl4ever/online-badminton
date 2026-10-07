import { wpoly, wline, TAU } from './shared.js';
/**
 * 批三主题背挂物件（光之巨人 / 怪兽之王）。
 * 全部 `single: true`：不是一双翼也不是披风——只画一次、不镜像、不随扇动旋转，
 * 动效全部在 painter 体内。锚点 (0,0) = 肩部（topY+48 展开锚）。
 */
export const WINGS_10 = {
    // ---- 光之巨人 ----
    otmBackA: { c: 0xdfe8f5, a: 0x9fd8ff, single: true, draw: (g, now, _flap, c, a) => {
            // 变身器：悬浮在背后的银色变身胶囊——舱体 + 竖立的蓝色光杆 + 呼吸辉光 + 旋转光粒
            const bob = Math.sin(now / 700) * 3;
            g.save();
            g.translateCanvas(-14, -6 + bob);
            g.rotateCanvas(-0.18);
            g.fillStyle(0x39424e, 1); // 握持座
            g.fillEllipse(0, 12, 12, 6);
            g.fillStyle(c, 1); // 舱体（竖立胶囊）
            g.fillRoundedRect(-7, -14, 14, 26, 6);
            g.fillStyle(0x8a94a2, 0.7); // 舱体受光
            g.fillRoundedRect(-5, -12, 4, 20, 3);
            const glow = 0.5 + 0.5 * Math.sin(now / 260); // 顶部蓝光杆
            g.fillStyle(a, 0.25 * glow);
            g.fillCircle(0, -18, 9);
            g.fillStyle(a, 0.9);
            g.fillRect(-2, -30, 4, 12);
            g.fillStyle(0xffffff, glow);
            g.fillCircle(0, -30, 2.2);
            g.lineStyle(1.2, a, 0.6); // 舱体环带
            g.lineBetween(-7, -2, 7, -2);
            g.lineBetween(-7, 4, 7, 4);
            g.restore();
            for (let k = 0; k < 5; k++) { // 环绕光粒（绕舱体转圈）
                const ang = now / 800 + (k / 5) * TAU;
                g.fillStyle(k % 2 ? a : 0xffffff, 0.7);
                g.fillCircle(-14 + Math.cos(ang) * 16, -6 + bob + Math.sin(ang) * 22, 1.4);
            }
        } },
    otmBackB: { c: 0x9fd8ff, a: 0xffe89a, single: true, draw: (g, now, _flap, c, a) => {
            // 光子轮盘：背后悬浮的双层旋转光环——外环符点 + 内环反向 + 中心计时核心
            const bob = Math.sin(now / 900) * 2.4;
            const cy = -16 + bob;
            g.fillStyle(c, 0.12);
            g.fillCircle(0, cy, 46);
            g.lineStyle(2.6, c, 0.7); // 外环
            g.strokeCircle(0, cy, 40);
            g.lineStyle(1.4, a, 0.5); // 内环（反向转）
            g.strokeCircle(0, cy, 24);
            for (let k = 0; k < 8; k++) { // 外环符点
                const ang = now / 1100 + (k / 8) * TAU;
                const px = Math.cos(ang) * 40, py = cy + Math.sin(ang) * 40;
                g.fillStyle(k % 2 ? a : 0xffffff, 0.9);
                g.fillRect(px - 1.6, py - 0.5, 3.2, 1);
                g.fillRect(px - 0.5, py - 1.6, 1, 3.2);
            }
            for (let k = 0; k < 4; k++) { // 内环反向短刻
                const ang = -now / 700 + (k / 4) * TAU;
                g.lineStyle(2, a, 0.8);
                g.lineBetween(Math.cos(ang) * 20, cy + Math.sin(ang) * 20, Math.cos(ang) * 24, cy + Math.sin(ang) * 24);
            }
            const core = 0.5 + 0.5 * Math.sin(now / 300); // 中心计时核心（蓝↔金）
            g.fillStyle(core > 0.7 ? a : c, 0.3 + core * 0.2);
            g.fillCircle(0, cy, 12);
            g.fillStyle(core > 0.7 ? a : 0xdff2ff, 0.95);
            g.fillCircle(0, cy, 5);
            g.fillStyle(0xffffff, 0.85);
            g.fillCircle(-1.4, cy - 1.4, 1.6);
        } },
    otmBackC: { c: 0xdfe8f5, a: 0xff4a5c, single: true, draw: (g, now, _flap, c, a) => {
            // 头镖僚机：三枚迷你头镖绕背后巡航——刃形小镖 + 尾迹 + 编队灯
            for (let k = 0; k < 3; k++) {
                const ang = now / 1300 + (k / 3) * TAU;
                const px = Math.cos(ang) * 34, py = -18 + Math.sin(ang) * 26;
                const bank = Math.sin(ang) * 0.5; // 转弯侧倾
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(bank + (Math.cos(ang) > 0 ? 0.2 : -0.2));
                g.fillStyle(c, 1); // 小头镖刃身
                wpoly(g, [[-2.4, 5], [-1.8, -7], [0, -10], [1.8, -7], [2.4, 5]], c);
                g.fillStyle(0xffffff, 0.5);
                wpoly(g, [[-2.4, 5], [-1.8, -7], [-0.4, -6]], 0xffffff, 0.5);
                g.fillStyle(a, 0.9); // 编队灯
                g.fillCircle(0, -1, 1.2);
                g.restore();
                // 尾迹（沿轨道后方拖出）
                for (let s = 1; s <= 3; s++) {
                    const ta = ang - s * 0.16;
                    g.fillStyle(c, 0.4 * (1 - s / 4));
                    g.fillCircle(Math.cos(ta) * 34, -18 + Math.sin(ta) * 26, 1.4 * (1 - s / 4) + 0.3);
                }
            }
        } },
    otmBackD: { c: 0xb8c8dc, a: 0x9fd8ff, single: true, draw: (g, now, _flap, c, a) => {
            // 能量背包：背在身后的双罐能量背包——罐体 + 顶部喷口粒子 + 连接管线
            const bob = Math.sin(now / 600) * 1.6;
            g.save();
            g.translateCanvas(0, 4 + bob);
            for (const s of [-1, 1]) { // 双能量罐
                g.fillStyle(0x39424e, 1);
                g.fillRoundedRect(s * 9 - 6, -18, 12, 30, 5);
                g.fillStyle(c, 1);
                g.fillRoundedRect(s * 9 - 4, -16, 8, 24, 4);
                const lvl = 0.5 + 0.5 * Math.sin(now / 400 + s); // 罐内液位辉光
                g.fillStyle(a, 0.4 + lvl * 0.3);
                g.fillRect(s * 9 - 4, -16 + (1 - lvl) * 20, 8, 4 + lvl * 20);
                g.fillStyle(0x8a94a2, 1); // 顶部喷口
                g.fillRect(s * 9 - 2.4, -22, 4.8, 4);
                // 喷口粒子
                for (let k = 0; k < 2; k++) {
                    const ph = (now / 500 + k / 2 + (s > 0 ? 0.5 : 0)) % 1;
                    g.fillStyle(0xffffff, 0.7 * (1 - ph));
                    g.fillCircle(s * 9, -23 - ph * 8, 1.2 * (1 - ph) + 0.3);
                }
            }
            g.lineStyle(1.6, 0x39424e, 1); // 连接管线
            g.lineBetween(-4, 6, 4, 6);
            g.restore();
        } },
    // ---- 怪兽之王 ----
    kjuBackA: { c: 0x5a7a4a, a: 0x7de87d, single: true, draw: (g, now, _flap, c, _a) => {
            // 兽王之尾：从背后甩出的一条巨尾——分节尾椎 + 末端骨锤 + 摆尾动效
            const sway = Math.sin(now / 500);
            const pts = [];
            for (let s = 0; s <= 8; s++) {
                const u = s / 8;
                pts.push([-6 - u * 74, 6 - u * 14 - Math.sin(u * 4 + now / 500) * (4 + u * 10) * sway]);
            }
            for (let s = 1; s < pts.length; s++) { // 尾椎节（渐粗渐暗）
                const [x1, y1] = pts[s];
                g.fillStyle(s % 2 ? c : 0x43593a, 0.95);
                g.fillCircle(x1, y1, 3 + (s / pts.length) * 5);
                g.fillStyle(0x7de87d, 0.2); // 背脊微光
                g.fillCircle(x1, y1 - 3 - s * 0.4, 1.2);
            }
            const [tx, ty] = pts[pts.length - 1]; // 末端骨锤
            g.fillStyle(0x6a5a3a, 1);
            g.fillCircle(tx, ty, 7.4);
            for (let k = 0; k < 5; k++) { // 骨锤尖刺
                const ang = (k / 5) * TAU + now / 600;
                g.fillStyle(0xcfc4a0, 1);
                g.fillTriangle(tx + Math.cos(ang) * 5, ty + Math.sin(ang) * 5, tx + Math.cos(ang + 0.5) * 5, ty + Math.sin(ang + 0.5) * 5, tx + Math.cos(ang + 0.25) * 10, ty + Math.sin(ang + 0.25) * 10);
            }
            wline(g, pts, 3, 0x2f4530, 0.5); // 尾下缘描线
        } },
    kjuBackB: { c: 0x3a5a6a, a: 0x5ac8ff, single: true, draw: (g, now, _flap, c, a) => {
            // 脊鳍阵列：沿背后竖起的一排发光背鳍——三高两低 + 蓄能辉光 + 原子雾
            const fins = [[-34, 22, 0], [-16, 34, 1], [4, 42, 2], [24, 32, 1], [40, 20, 0]];
            fins.forEach(([fx, fh, tier], k) => {
                const gl = 0.35 + 0.35 * Math.sin(now / 300 + k * 1.2); // 逐鳍错相蓄能
                g.fillStyle(0xcfc4a0, 1); // 骨鳍
                wpoly(g, [[fx - 4, 8], [fx, 8 - fh], [fx + 4, 8]], 0xcfc4a0);
                g.fillStyle(0x9a8f70, 0.6);
                wpoly(g, [[fx - 4, 8], [fx, 8 - fh], [fx, 8]], 0x9a8f70, 0.6);
                g.lineStyle(2, a, gl + 0.25); // 鳍缘原子光
                g.lineBetween(fx, 4, fx, 8 - fh);
                g.fillStyle(tier > 0 ? a : 0xffffff, gl); // 鳍尖辉点
                g.fillCircle(fx, 8 - fh, 1.6 + gl);
                if (tier === 2) { // 主鳍顶端原子雾团
                    g.fillStyle(c, 0.2 + gl * 0.12);
                    g.fillCircle(fx, 8 - fh - 4, 8);
                }
            });
            g.fillStyle(c, 0.08 + 0.04 * Math.sin(now / 400)); // 环背原子底雾
            g.fillEllipse(0, 6, 90, 26);
        } },
    kjuBackC: { c: 0xcfc4a0, a: 0xff5a5a, single: true, draw: (g, now, _flap, c, a) => {
            // 骨刺轮：背后悬转的兽骨刺轮——骨圈 + 放射刺 + 系链 + 血色微光
            const bob = Math.sin(now / 800) * 2;
            const cy = -14 + bob;
            const rot = now / 900;
            g.lineStyle(2.6, c, 0.95); // 骨圈（双圈）
            g.strokeCircle(0, cy, 22);
            g.lineStyle(1.2, 0x9a8f70, 0.8);
            g.strokeCircle(0, cy, 16);
            for (let k = 0; k < 8; k++) { // 放射骨刺
                const ang = rot + (k / 8) * TAU;
                g.lineStyle(2.4, c, 0.95);
                g.lineBetween(Math.cos(ang) * 20, cy + Math.sin(ang) * 20, Math.cos(ang) * 30, cy + Math.sin(ang) * 30);
                g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 240 + k)); // 刺尖血光
                g.fillCircle(Math.cos(ang) * 31, cy + Math.sin(ang) * 31, 1.3);
            }
            g.fillStyle(0x9a8f70, 1); // 轮心骨眼
            g.fillCircle(0, cy, 4);
            g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 200));
            g.fillCircle(0, cy, 1.8);
            // 系链（连到肩锚的三节链环）
            for (let s = 1; s <= 3; s++) {
                const u = s / 4;
                g.lineStyle(1.6, 0x9a8f70, 0.9);
                g.strokeCircle(u * 16, cy - 8 - u * 10, 2.2);
            }
        } },
    kjuBackD: { c: 0x7de87d, a: 0xdff2ff, single: true, draw: (g, now, _flap, c, a) => {
            // 原子储囊：背负的两只原子储囊——玻璃囊体 + 翻涌荧光液 + 环身电离
            const bob = Math.sin(now / 640) * 1.8;
            g.save();
            g.translateCanvas(0, 2 + bob);
            for (const s of [-1, 1]) {
                const cx = s * 10;
                g.fillStyle(0x2f4530, 0.5); // 囊体背板
                g.fillEllipse(cx, 0, 15, 26);
                g.fillStyle(c, 0.35 + 0.15 * Math.sin(now / 350 + s)); // 荧光液
                g.fillEllipse(cx, 0, 12, 22);
                // 液内翻涌的气泡
                for (let k = 0; k < 3; k++) {
                    const ph = (now / 900 + k / 3 + (s > 0 ? 0.4 : 0)) % 1;
                    g.fillStyle(a, 0.8 * (1 - ph));
                    g.fillCircle(cx + Math.sin(ph * 5 + k + s) * 3, 9 - ph * 18, 1.6 * (1 - ph) + 0.5);
                }
                g.lineStyle(1.2, 0x8a94a2, 0.8); // 囊箍
                g.lineBetween(cx - 6, -6, cx + 6, -6);
                g.lineBetween(cx - 6, 6, cx + 6, 6);
                g.fillStyle(0x39424e, 1); // 顶阀
                g.fillRect(cx - 2.4, -16, 4.8, 5);
            }
            g.restore();
            // 环身电离尘（从囊口逸出）
            for (let k = 0; k < 4; k++) {
                const ph = (now / 1100 + k / 4) % 1;
                g.fillStyle(a, 0.6 * (1 - ph));
                g.fillCircle((k % 2 ? 10 : -10) + Math.sin(ph * 4 + k) * 4, -14 + bob - ph * 18, 1.4 * (1 - ph) + 0.4);
            }
        } },
};
