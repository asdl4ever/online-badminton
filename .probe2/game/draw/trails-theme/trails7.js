import { curve, ribbon } from './shared.js';
/** 批六主题拖尾（法老秘葬 / 暗部忍道）。ctx: g/pts/fade/now，pts[0] 最旧、末位是球头。 */
export const TRAILS_7 = {
    egTrailA: { c: 0xd9a84a, a: 0xffd45c, draw: (ctx, c, a) => {
            // 流沙拖尾：轨迹化作一道流动的沙瀑——沙浪带 + 沙丘涡 + 金沙倾泻
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 13, 2, now / 450, 9, c, 0.4 * fade);
            curve(ctx, 8, 2, 0.2, 0.5, 0xc08838);
            for (let k = 0; k < 5; k++) { // 沙丘涡（带旋转感的沙团）
                const i = Math.floor(((k + 0.5) / 5) * (pts.length - 1));
                const p = pts[i];
                const r = 4.4 + (k % 3) * 2;
                g.fillStyle(c, 0.4 * fade);
                g.fillCircle(p.x, p.y, r);
                g.fillStyle(0xe8c88a, 0.35 * fade);
                g.fillCircle(p.x + Math.cos(now / 280 + k) * r * 0.5, p.y + Math.sin(now / 280 + k) * r * 0.5, r * 0.5);
            }
            for (let k = 0; k < 7; k++) { // 金沙倾泻（从沙带上洒落的沙粒）
                const i = Math.floor(((k + 0.2) / 7) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 340 + k / 7) % 1;
                g.fillStyle(k % 2 ? a : 0xe8c88a, 0.75 * (1 - ph) * fade);
                g.fillCircle(p.x + Math.sin(ph * 5 + k) * 4, p.y + ph * 9, 1.3 * (1 - ph) + 0.4);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(a, fade);
            g.fillCircle(head.x, head.y, 2.6);
            g.fillStyle(0xffffff, 0.7 * fade);
            g.fillCircle(head.x, head.y, 1.1);
        } },
    egTrailB: { c: 0xffd45c, a: 0x3a5a8a, draw: (ctx, c, a) => {
            // 圣书光痕：轨迹化作一段发光圣书——金色光带 + 沿途圣书字符 + 法眼印 + 粒尘
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 10, 1.4, now / 550, 6, c, 0.3 * fade);
            curve(ctx, 6, 1.4, 0.2, 0.55, c);
            curve(ctx, 2.2, 0.8, 0.35, 0.9, 0xfff6d8);
            for (let k = 0; k < 6; k++) { // 沿途圣书字符（交替的几何符形）
                const i = Math.floor(((k + 0.3) / 6) * (pts.length - 1));
                const p = pts[i];
                const gl = 0.4 + 0.6 * Math.abs(Math.sin(now / 320 + k * 1.6));
                g.fillStyle(k % 2 ? a : 0xffd45c, gl * fade);
                if (k % 3 === 0) {
                    g.fillEllipse(p.x, p.y, 4.4, 2.6);
                }
                else if (k % 3 === 1) {
                    g.fillRect(p.x - 1.4, p.y - 2.4, 2.8, 4.8);
                    g.fillRect(p.x - 2.6, p.y - 0.8, 5.2, 1.4);
                }
                else {
                    g.fillCircle(p.x, p.y, 2);
                    g.fillRect(p.x - 3.4, p.y - 0.5, 6.8, 1);
                }
            }
            for (let k = 0; k < 3; k++) { // 法眼印（轨迹上浮现的法眼符号）
                const i = Math.floor(((k + 0.5) / 3) * (pts.length - 1));
                const p = pts[i];
                const gl = 0.35 + 0.4 * Math.abs(Math.sin(now / 400 + k));
                g.lineStyle(1.2, c, gl * fade);
                g.strokeEllipse(p.x, p.y - 5, 8, 4);
                g.fillStyle(a, gl * fade);
                g.fillCircle(p.x, p.y - 5, 1.4);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xfff6d8, fade);
            g.fillCircle(head.x, head.y, 2.4);
            g.fillStyle(c, 0.4 * fade);
            g.fillCircle(head.x, head.y, 5);
        } },
    njaTrailA: { c: 0xb08ad0, a: 0xd8d0c0, draw: (ctx, c, a) => {
            // 瞬身拖尾：瞬身术的残像轨迹——紫残影 + 消散棱块 + 电光丝
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 9, 1.2, now / 380, 7, c, 0.3 * fade);
            curve(ctx, 5, 1.4, 0.2, 0.55, c);
            for (let k = 0; k < 5; k++) { // 残像棱块（菱形残影渐隐碎裂）
                const i = Math.floor(((k + 0.4) / 5) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 500 + k / 5) % 1;
                g.save();
                g.translateCanvas(p.x, p.y);
                g.rotateCanvas(now / 200 + k);
                g.fillStyle(c, (0.5 * (1 - ph)) * fade);
                g.fillPoints([
                    { x: 0, y: -5 }, { x: 3.4, y: 0 }, { x: 0, y: 5 }, { x: -3.4, y: 0 },
                ], true);
                g.restore();
                if (ph > 0.6) { // 碎裂成两半
                    g.fillStyle(a, 0.5 * (1 - ph) * fade);
                    g.fillRect(p.x - 5, p.y - 0.6, 3, 1.2);
                    g.fillRect(p.x + 2, p.y + 0.4, 3, 1.2);
                }
            }
            for (let k = 0; k < 4; k++) { // 电光丝（残影间的紫电）
                const i = Math.floor(((k + 0.3) / 4) * (pts.length - 1));
                const p = pts[i];
                const q = pts[Math.min(pts.length - 1, i + 3)];
                g.lineStyle(1, a, 0.5 * fade);
                g.lineBetween(p.x, p.y, (p.x + q.x) / 2 + Math.sin(now / 60 + k) * 4, (p.y + q.y) / 2 + Math.cos(now / 55 + k) * 4);
                g.lineBetween((p.x + q.x) / 2, (p.y + q.y) / 2, q.x, q.y);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xffffff, fade);
            g.fillCircle(head.x, head.y, 2.2);
            g.fillStyle(c, 0.35 * fade);
            g.fillCircle(head.x, head.y, 4.6);
        } },
    njaTrailB: { c: 0xc0c8d0, a: 0xb08ad0, draw: (ctx, c, a) => {
            // 烟雾弹痕：忍术烟雾弹留下的烟带——烟团链 + 烟圈升腾 + 落地的哑火火星
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 14, 2, now / 500, 10, c, 0.32 * fade);
            curve(ctx, 9, 2.2, 0.15, 0.4, 0x9aa4b0);
            for (let k = 0; k < 5; k++) { // 烟团链（翻滚的大烟团）
                const i = Math.floor(((k + 0.5) / 5) * (pts.length - 1));
                const p = pts[i];
                const r = 5.4 + (k % 2) * 3;
                g.fillStyle(c, 0.42 * fade);
                g.fillCircle(p.x, p.y - 1, r);
                g.fillStyle(0xffffff, 0.18 * fade);
                g.fillCircle(p.x - r * 0.3, p.y - 1 - r * 0.3, r * 0.55);
                g.fillStyle(0x9aa4b0, 0.3 * fade);
                g.fillCircle(p.x + r * 0.4, p.y - 1 + r * 0.2, r * 0.45);
            }
            for (let k = 0; k < 4; k++) { // 烟圈升腾（从烟带里冒出的小烟圈）
                const i = Math.floor(((k + 0.4) / 4) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 800 + k / 4) % 1;
                g.lineStyle(1.4, a, (0.55 * (1 - ph)) * fade);
                g.strokeCircle(p.x + Math.sin(ph * 4 + k) * 4, p.y - 4 - ph * 16, 2.4 + ph * 4);
            }
            for (let k = 0; k < 3; k++) { // 哑火火星（烟里噼啪的红点）
                const i = Math.floor(((k + 0.3) / 3) * (pts.length - 1));
                const p = pts[i];
                const bl = Math.abs(Math.sin(now / 140 + k * 2.4));
                g.fillStyle(0xff5a5c, bl * 0.8 * fade);
                g.fillCircle(p.x + Math.sin(k * 2.2) * 5, p.y + 2, 1.3);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xffffff, fade);
            g.fillCircle(head.x, head.y, 2.6);
        } },
};
