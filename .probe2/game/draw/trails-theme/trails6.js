import { TAU, curve, ribbon } from './shared.js';
/** 批五主题拖尾（武侠江湖 / 北欧神域）。ctx: g/pts/fade/now，pts[0] 最旧、末位是球头。 */
export const TRAILS_6 = {
    wxTrailA: { c: 0xdfe8f5, a: 0xffffff, draw: (ctx, c, a) => {
            // 剑光拖尾：一闪而过的剑光——细锐白光 + 残像刃面 + 剑锋星屑
            const { g, pts, fade, now } = ctx;
            curve(ctx, 6, 1.6, 0.2, 0.5, c);
            curve(ctx, 2, 0.8, 0.4, 0.95, 0xffffff);
            for (let k = 0; k < 4; k++) { // 残像刃面（三角残影渐隐）
                const i = Math.floor(((k + 0.4) / 4) * (pts.length - 1));
                const p = pts[i];
                const q = pts[Math.max(0, i - 2)];
                const dx = p.x - q.x, dy = p.y - q.y;
                const l = Math.hypot(dx, dy) || 1;
                g.fillStyle(c, (0.35 - k * 0.07) * fade);
                g.fillPoints([
                    { x: p.x, y: p.y }, { x: p.x - (dy / l) * 7, y: p.y + (dx / l) * 7 }, { x: p.x - dx * 0.5, y: p.y - dy * 0.5 },
                ], true);
            }
            for (let k = 0; k < 5; k++) { // 剑锋星屑（十字闪）
                const i = Math.floor(((k + 0.3) / 5) * (pts.length - 1));
                const p = pts[i];
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 200 + k * 1.8));
                g.fillStyle(a, tw * fade);
                g.fillRect(p.x - 2.4, p.y - 0.5, 4.8, 1);
                g.fillRect(p.x - 0.5, p.y - 2.4, 1, 4.8);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xffffff, fade);
            g.fillCircle(head.x, head.y, 2.2);
            g.lineStyle(1.2, c, 0.6 * fade);
            g.strokeCircle(head.x, head.y, 4.4);
        } },
    wxTrailB: { c: 0x2a2a30, a: 0x8a94a2, draw: (ctx, c, _a) => {
            // 泼墨拖尾：轨迹化作一笔泼墨——墨带 + 洇开墨团 + 飞白 + 落款红印
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 12, 1.8, now / 500, 8, c, 0.5 * fade);
            curve(ctx, 8, 2, 0.2, 0.55, c);
            curve(ctx, 3, 1, 0.35, 0.8, 0x3a3a42);
            for (let k = 0; k < 4; k++) { // 洇开的墨团（边缘不规则的大墨点）
                const i = Math.floor(((k + 0.5) / 4) * (pts.length - 1));
                const p = pts[i];
                const r = 4 + (k % 2) * 3;
                g.fillStyle(c, 0.4 * fade);
                g.fillCircle(p.x, p.y, r);
                g.fillStyle(c, 0.25 * fade);
                g.fillCircle(p.x + r * 0.5, p.y - r * 0.3, r * 0.7);
                g.fillStyle(c, 0.15 * fade);
                g.fillCircle(p.x - r * 0.6, p.y + r * 0.4, r * 0.5);
            }
            for (let k = 0; k < 5; k++) { // 飞白（笔锋扫出的断续白丝）
                const i = Math.floor(((k + 0.2) / 5) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 600 + k / 5) % 1;
                g.lineStyle(1, 0xf0f4fa, 0.5 * (1 - ph) * fade);
                g.lineBetween(p.x - 4, p.y - 1, p.x + 4, p.y - 1);
            }
            const head = pts[pts.length - 1]; // 球头：一枚落款红印
            g.fillStyle(0xc0392b, 0.9 * fade);
            g.fillRect(head.x - 2.4, head.y - 2.4, 4.8, 4.8);
            g.fillStyle(0xf0f4fa, 0.8 * fade);
            g.fillRect(head.x - 1.2, head.y - 1.2, 2.4, 1);
        } },
    norseTrailA: { c: 0xffe15c, a: 0xffffff, draw: (ctx, c, a) => {
            // 雷电拖尾：轨迹化作一道狂雷——雷柱 + 分叉电枝 + 沿途电球 + 雷鸣闪
            const { g, pts, fade, now } = ctx;
            curve(ctx, 8, 2.4, 0.2, 0.55, c);
            curve(ctx, 3, 1, 0.4, 0.9, 0xffffff);
            for (let k = 0; k < 5; k++) { // 分叉电枝（从主轨迹劈出的锯齿闪）
                const i = Math.floor(((k + 0.4) / 5) * (pts.length - 1));
                const p = pts[i];
                const side = k % 2 ? 1 : -1;
                g.lineStyle(1.4, a, 0.8 * fade);
                g.beginPath();
                g.moveTo(p.x, p.y);
                let bx = p.x, by = p.y;
                for (let s = 1; s <= 3; s++) {
                    bx += side * 5 + Math.sin(now / 40 + k + s) * 3;
                    by += side * 4;
                    g.lineTo(bx, by);
                }
                g.strokePath();
                g.fillStyle(a, 0.8 * fade);
                g.fillCircle(p.x, p.y, 2);
            }
            for (let k = 0; k < 4; k++) { // 雷鸣闪（整条轨迹周期性爆亮）
                const ph = (now / 350 + k / 4) % 1;
                const i = Math.floor(((k + 0.5) / 4) * (pts.length - 1));
                const p = pts[i];
                g.fillStyle(0xffffff, 0.7 * (1 - ph) * fade);
                g.fillCircle(p.x, p.y, 4 * (1 - ph) + 1);
            }
            const head = pts[pts.length - 1];
            const gl = 0.6 + 0.4 * Math.sin(now / 100);
            g.fillStyle(0xffffff, gl * fade);
            g.fillCircle(head.x, head.y, 3);
            g.fillStyle(c, 0.4 * fade);
            g.fillCircle(head.x, head.y, 6);
        } },
    norseTrailB: { c: 0xbfe8ff, a: 0xffffff, draw: (ctx, c, a) => {
            // 寒冰拖尾：轨迹冻结成冰晶带——冰棱带 + 六角冰花 + 冰尘 + 球头冰晶
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 10, 1.4, now / 600, 5, c, 0.4 * fade);
            curve(ctx, 6, 1.6, 0.2, 0.6, c);
            curve(ctx, 2.4, 0.9, 0.35, 0.9, 0xffffff);
            for (let k = 0; k < 4; k++) { // 环境冰棱（轨迹旁竖起的小冰锥）
                const i = Math.floor(((k + 0.4) / 4) * (pts.length - 1));
                const p = pts[i];
                const side = k % 2 ? 1 : -1;
                const h = 5 + (k % 3) * 2;
                g.fillStyle(k % 2 ? c : a, 0.7 * fade);
                g.fillTriangle(p.x - 2 * side, p.y, p.x + 2 * side, p.y, p.x, p.y - h);
                g.fillStyle(0xffffff, 0.4 * fade);
                g.fillTriangle(p.x - side, p.y, p.x, p.y, p.x, p.y - h * 0.7);
            }
            for (let k = 0; k < 5; k++) { // 六角冰花（旋转飘落）
                const i = Math.floor(((k + 0.3) / 5) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 900 + k / 5) % 1;
                g.save();
                g.translateCanvas(p.x + Math.sin(ph * 4 + k) * 5, p.y + ph * 10);
                g.rotateCanvas(now / 300 + k);
                g.lineStyle(1, a, 0.7 * (1 - ph) * fade);
                for (let s = 0; s < 3; s++) {
                    const ang = (s / 3) * Math.PI;
                    g.lineBetween(-Math.cos(ang) * 3, -Math.sin(ang) * 3, Math.cos(ang) * 3, Math.sin(ang) * 3);
                }
                g.restore();
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xffffff, fade);
            g.fillCircle(head.x, head.y, 2.4);
            g.lineStyle(1.4, c, 0.8 * fade);
            g.strokeCircle(head.x, head.y, 5);
            for (let s = 0; s < 6; s++) {
                const ang = (s / 6) * TAU + now / 400;
                g.lineBetween(head.x + Math.cos(ang) * 5, head.y + Math.sin(ang) * 5, head.x + Math.cos(ang) * 7, head.y + Math.sin(ang) * 7);
            }
        } },
};
