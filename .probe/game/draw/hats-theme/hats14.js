import { TAU } from './shared.js';
/** 批十一主题头饰（软泥秘境 / 妖猫夜行 / 甲虫王朝） */
export const HATS_14 = {
    // ── 软泥秘境 ──
    slimeHatA: { c: 0x7de87d, a: 0xd0ff9a, draw: (g, now, x, hy, c, a) => {
            // 气泡冠：三颗果冻气泡悬浮在头顶，轻轻起伏
            const bob = Math.sin(now / 400);
            for (let k = 0; k < 3; k++) {
                const bx = x - 12 + k * 12, by = hy - 8 - k * 5 + Math.sin(now / 380 + k * 2) * 2.2;
                const r = 7.5 - k * 1.4;
                g.fillStyle(c, 0.55); // 果冻体
                g.fillCircle(bx, by, r);
                g.fillStyle(0xffffff, 0.5); // 高光
                g.fillCircle(bx - r * 0.32, by - r * 0.35, r * 0.3);
                g.lineStyle(1.4, a, 0.8); // 描边
                g.beginPath();
                g.arc(bx, by, r, 0, TAU);
                g.strokePath();
            }
            g.fillStyle(0x9aff7a, 0.35); // 底部黏液托
            g.fillEllipse(x, hy + 2 + bob, 24, 5);
        } },
    slimeHatB: { c: 0xd0ff9a, a: 0x7de87d, draw: (g, now, x, hy, c, a) => {
            // 果冻王冠：软塌塌的果冻五峰王冠，峰顶各嵌一颗小泡
            const squish = Math.sin(now / 350) * 1.2;
            g.fillStyle(c, 0.78);
            for (let k = 0; k < 5; k++) {
                const px = x - 14 + k * 7;
                const ph = (k === 2 ? 20 : 12 + (k % 2) * 4) + squish;
                g.fillRoundedRect(px - 4, hy - ph, 8, ph + 4, 4);
            }
            g.fillStyle(c, 0.5); // 冠带
            g.fillRoundedRect(x - 16, hy - 3, 32, 7, 3);
            for (let k = 0; k < 5; k++) { // 峰顶小泡
                const px = x - 14 + k * 7, py = hy - (k === 2 ? 21 : 13 + (k % 2) * 4) + Math.sin(now / 320 + k) * 1.4;
                g.fillStyle(0xffffff, 0.55);
                g.fillCircle(px, py, 1.8);
            }
            g.lineStyle(1.4, a, 0.75);
            g.beginPath();
            g.arc(x, hy - 1, 16, Math.PI * 1.05, Math.PI * 1.95);
            g.strokePath();
        } },
    // ── 妖猫夜行 ──
    nekHatA: { c: 0x2a2440, a: 0xb08aff, draw: (g, now, x, hy, c, a) => {
            // 狐火面纹：额间妖紫面具纹 + 两侧摇曳狐火
            g.fillStyle(c, 0.92); // 面纹底
            g.fillPoints([{ x: x - 9, y: hy + 2 }, { x: x - 4, y: hy - 12 }, { x: x, y: hy - 5 }, { x: x + 4, y: hy - 12 }, { x: x + 9, y: hy + 2 }], true);
            g.fillStyle(a, 0.85); // 妖纹（倒月牙）
            g.beginPath();
            g.arc(x, hy - 3, 4.4, 0.3, Math.PI - 0.3, true);
            g.fillPath();
            g.fillStyle(0xffd45c, 0.9); // 纹心
            g.fillCircle(x, hy - 4.5, 1.4);
            for (const s of [-1, 1]) { // 双侧狐火
                const fx = x + s * 15, fy = hy - 8 + Math.sin(now / 300 + s) * 2.5;
                g.fillStyle(0xb08aff, 0.5);
                g.fillCircle(fx, fy, 3.4);
                g.fillStyle(0xd0b0ff, 0.9);
                g.fillCircle(fx, fy, 1.7);
            }
        } },
    nekHatB: { c: 0xffd45c, a: 0xb08aff, draw: (g, now, x, hy, c, a) => {
            // 月牙额饰：金月牙悬于额前 + 垂链 + 星屑
            g.fillStyle(c, 0.95); // 月牙
            g.beginPath();
            g.arc(x, hy - 10, 8, Math.PI * 0.35, Math.PI * 1.65);
            g.arc(x + 3.4, hy - 10, 6.4, Math.PI * 1.55, Math.PI * 0.45, true);
            g.closePath();
            g.fillPath();
            g.lineStyle(1.6, a, 0.9); // 额带
            g.lineBetween(x - 14, hy - 1, x + 14, hy - 1);
            for (const s of [-1, 1]) { // 双侧垂链
                g.lineStyle(1, a, 0.7);
                g.beginPath();
                g.moveTo(x + s * 13, hy - 1);
                g.lineTo(x + s * 15, hy + 5 + Math.sin(now / 350 + s) * 1.5);
                g.strokePath();
                g.fillStyle(c, 0.9);
                g.fillCircle(x + s * 15, hy + 7 + Math.sin(now / 350 + s) * 1.5, 1.8);
            }
            for (let k = 0; k < 3; k++) { // 月牙下星屑
                const sx = x - 5 + k * 5, sy = hy - 3 + Math.sin(now / 280 + k * 2.1) * 1.8;
                g.fillStyle(0xfff0b0, 0.8);
                g.fillRect(sx - 1, sy - 0.4, 2, 0.8);
                g.fillRect(sx - 0.4, sy - 1, 0.8, 2);
            }
        } },
    // ── 甲虫王朝 ──
    btlHatA: { c: 0x7dff5a, a: 0xc8a832, draw: (g, now, x, hy, c, a) => {
            // 触角冠：双触角从额后扬起，梢头捶球轻颤
            for (const s of [-1, 1]) {
                const sway = Math.sin(now / 340 + (s > 0 ? 0 : 1.4)) * 2.4;
                g.lineStyle(2.2, 0x3a4a20, 1);
                g.beginPath();
                g.moveTo(x + s * 5, hy + 2);
                g.lineTo(x + s * 14 + sway * 0.5, hy - 12);
                g.lineTo(x + s * 18 + sway, hy - 18);
                g.strokePath();
                g.fillStyle(c, 0.95); // 捶球
                g.fillCircle(x + s * 18 + sway, hy - 19, 3.2);
                g.fillStyle(0xffffff, 0.4);
                g.fillCircle(x + s * 18 + sway - 1, hy - 20, 1.1);
            }
            g.fillStyle(0x3a4a20, 0.9); // 额基甲片
            g.fillEllipse(x, hy + 1, 16, 6);
            g.lineStyle(1, a, 0.6);
            g.beginPath();
            g.arc(x, hy, 8, Math.PI * 1.1, Math.PI * 1.9);
            g.strokePath();
        } },
    btlHatB: { c: 0xc8a832, a: 0x7dff5a, draw: (g, now, x, hy, c, a) => {
            // 金鞘翅盔：金质半圆盔 + 中脊 + 翘起的鞘翅护沿
            g.fillStyle(c, 0.95); // 盔体
            g.beginPath();
            g.arc(x, hy + 1, 13, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillStyle(0x8a6a2a, 0.85); // 中脊
            g.fillRect(x - 1.6, hy - 13, 3.2, 14);
            g.fillStyle(0xe8cc5a, 0.5); // 左右抛光
            g.fillEllipse(x - 6, hy - 5, 7, 10);
            g.fillEllipse(x + 6, hy - 5, 7, 10);
            g.fillStyle(0x3a5a2a, 0.95); // 鞘翅护沿（两端翘起）
            g.fillPoints([{ x: x - 13, y: hy + 1 }, { x: x - 19, y: hy - 6 }, { x: x - 15, y: hy - 8 }, { x: x - 11, y: hy - 3 }], true);
            g.fillPoints([{ x: x + 13, y: hy + 1 }, { x: x + 19, y: hy - 6 }, { x: x + 15, y: hy - 8 }, { x: x + 11, y: hy - 3 }], true);
            const glint = Math.abs(Math.sin(now / 450));
            g.fillStyle(0xffffff, glint * 0.5); // 扫光
            g.fillRect(x - 1, hy - 12, 2, 4);
            g.lineStyle(1.2, a, 0.7);
            g.beginPath();
            g.arc(x, hy + 1, 13, Math.PI, TAU);
            g.strokePath();
        } },
};
