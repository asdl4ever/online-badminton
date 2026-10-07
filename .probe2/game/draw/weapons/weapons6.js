import { poly, handle, pommel, TAU } from './shared.js';
/** 批三主题武器（光之巨人 / 怪兽之王）。局部空间：柄在 x ∈ [-13,-2]，拍框中心 ≈ (9,0)。 */
export const WEAPONS_6 = {
    otmRacketA: { c: 0xdfe8f5, a: 0xff4a5c, draw: (g, now, c, a) => {
            // 光线手刀·拍：整拍是一柄银色手刀——楔形刀身 + 红色刃缘 + 计时核心镶嵌
            handle(g, -13, 2, 5, 0x39424e);
            pommel(g, -13.4, 2.6, a);
            g.fillStyle(c, 1); // 楔形刀身
            poly(g, [[-2, -7], [26, -11], [36, 0], [26, 11], [-2, 7]], c, 1);
            g.fillStyle(0xffffff, 0.5); // 刀面受光
            poly(g, [[-2, -7], [26, -11], [24, -4], [-2, -3]], 0xffffff, 0.5);
            g.lineStyle(2, a, 0.85 + 0.15 * Math.sin(now / 260)); // 红色刃缘
            g.beginPath();
            g.moveTo(26, -11);
            g.lineTo(36, 0);
            g.lineTo(26, 11);
            g.strokePath();
            const gl = 0.5 + 0.5 * Math.sin(now / 300); // 刀身计时核心
            g.fillStyle(a, 0.3 * gl);
            g.fillCircle(14, 0, 6);
            g.fillStyle(0xdff2ff, 0.95);
            g.fillCircle(14, 0, 2.6);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(13.2, -0.8, 0.9);
            for (let k = 0; k < 3; k++) { // 刀尖溢光粒
                const ph = (now / 500 + k / 3) % 1;
                g.fillStyle(a, 0.6 * (1 - ph));
                g.fillCircle(36 + ph * 7, Math.sin(k * 2.1 + now / 200) * 3, 1.4 * (1 - ph) + 0.3);
            }
        } },
    otmRacketB: { c: 0xff4a5c, a: 0x9fd8ff, draw: (g, now, c, a) => {
            // 聚能光环·拍：环形拍框内悬浮聚能核心——双环框 + 充能核心 + 环绕光子
            handle(g, -13, 0, 5, 0x39424e);
            pommel(g, -13.4, 2.4, 0xdfe8f5);
            g.lineStyle(3.4, 0x8a94a2, 1); // 外框环
            g.strokeCircle(9, 0, 16);
            g.lineStyle(1.6, c, 0.9); // 内发光环
            g.strokeCircle(9, 0, 11.4);
            const charge = 0.4 + 0.6 * Math.abs(Math.sin(now / 380)); // 聚能核心（充能胀缩）
            g.fillStyle(c, 0.25 * charge);
            g.fillCircle(9, 0, 9 + charge * 3);
            g.fillStyle(0xdff2ff, 0.85);
            g.fillCircle(9, 0, 4 + charge * 1.6);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(8, -1, 1.4);
            for (let k = 0; k < 6; k++) { // 环绕光子（内外环之间转圈）
                const ang = now / 600 + (k / 6) * TAU;
                const px = 9 + Math.cos(ang) * 13.6, py = Math.sin(ang) * 13.6;
                g.fillStyle(k % 2 ? a : 0xffffff, 0.85);
                g.fillCircle(px, py, 1.6);
            }
            for (const s of [-1, 1]) { // 框侧集能鳍
                g.fillStyle(0x39424e, 1);
                g.fillTriangle(9 + s * 15, -4, 9 + s * 15, 4, 9 + s * 20, 0);
            }
        } },
    kjuRacketA: { c: 0xd8c8a0, a: 0xff5a5a, draw: (g, now, c, a) => {
            // 骨鞭·拍：节节兽骨连成的长鞭——骨节 + 骨缝红光 + 末端骨锤 + 微颤
            handle(g, -13, 2, 4.6, 0x6b4a2f);
            pommel(g, -13.4, 2.6, a);
            for (let k = 0; k < 6; k++) {
                const bx = 2 + k * 6;
                const shiver = Math.sin(now / 150 + k) * 0.7; // 鞭身微颤
                const r = 5.4 - k * 0.36; // 越靠末梢越细
                g.fillStyle(k % 2 ? c : 0xb8a878, 1);
                g.fillRoundedRect(bx - r / 2, -r + shiver, r, r * 2, 2);
                g.fillStyle(0x8a7a54, 0.5); // 骨面受光
                g.fillRect(bx - r / 2 + 0.8, -r + 0.8 + shiver, 1.6, r * 2 - 1.6);
                const gl = 0.4 + 0.4 * Math.sin(now / 240 + k); // 骨缝红光
                g.fillStyle(a, gl * 0.6);
                g.fillRect(bx - 0.6, -r + shiver, 1.2, r * 2);
            }
            const hx = 38, bob = Math.sin(now / 300) * 1.2; // 末端骨锤
            g.fillStyle(0x6a5a3a, 1);
            g.fillCircle(hx, bob, 4.4);
            for (let k = 0; k < 5; k++) {
                const ang = (k / 5) * TAU + now / 700;
                g.fillStyle(0xcfc4a0, 1);
                g.fillTriangle(hx + Math.cos(ang) * 3.4, bob + Math.sin(ang) * 3.4, hx + Math.cos(ang + 0.6) * 3.4, bob + Math.sin(ang + 0.6) * 3.4, hx + Math.cos(ang + 0.3) * 7, bob + Math.sin(ang + 0.3) * 7);
            }
        } },
    kjuRacketB: { c: 0x5ac8ff, a: 0x2f4530, draw: (g, now, c, _a) => {
            // 原子脊鳍·拍：拍框是一片兽王背鳍——三鳍框体 + 中央原子核心 + 蓄能辉光
            handle(g, -13, 0, 4.6, 0x39424e);
            pommel(g, -13.4, 2.2, c);
            g.fillStyle(0x43593a, 1); // 鳍基座
            poly(g, [[-2, -6], [20, -14], [34, 0], [20, 14], [-2, 6]], 0x43593a, 1);
            for (let k = 0; k < 3; k++) { // 三片骨鳍（中高侧低）
                const fx = 8 + k * 9, fh = 15 - Math.abs(k - 1) * 5;
                g.fillStyle(0xcfc4a0, 1);
                poly(g, [[fx - 3, -8], [fx, -8 - fh], [fx + 3, -8]], 0xcfc4a0, 1);
                const gl = 0.4 + 0.4 * Math.sin(now / 300 + k); // 鳍缘原子光
                g.lineStyle(1.6, c, gl + 0.3);
                g.lineBetween(fx, -9, fx, -8 - fh);
                g.fillStyle(0xffffff, gl);
                g.fillCircle(fx, -8 - fh, 1.4);
            }
            const core = 0.45 + 0.55 * Math.abs(Math.sin(now / 420)); // 中央原子核心
            g.fillStyle(c, 0.3 * core);
            g.fillCircle(16, 0, 8 + core * 2.4);
            g.fillStyle(0xdff2ff, 0.9);
            g.fillCircle(16, 0, 3.4 + core);
            g.lineStyle(1.2, c, 0.6); // 基座纹线
            g.lineBetween(-2, 0, 8, 0);
            for (let k = 0; k < 3; k++) { // 核心电离粒
                const ph = (now / 450 + k / 3) % 1;
                g.fillStyle(0xffffff, 0.7 * (1 - ph));
                g.fillCircle(16 + Math.cos(k * 2.1 + now / 300) * (9 + ph * 7), Math.sin(k * 2.1 + now / 300) * (9 + ph * 7), 1.2 * (1 - ph) + 0.3);
            }
        } },
};
