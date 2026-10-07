import { curve, ribbon } from './shared.js';
/** 批四主题拖尾（西游降魔 / 三国烽火）。ctx: g/pts/fade/now，pts[0] 最旧、末位是球头。 */
export const TRAILS_5 = {
    xyTrailA: { c: 0xf0ead8, a: 0xffd45c, draw: (ctx, c, a) => {
            // 筋斗云拖尾：整条轨迹化作翻涌的筋斗云——云带 + 旋转云涡 + 云隙金光
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 12, 2, now / 400, 10, c, 0.45 * fade);
            curve(ctx, 6, 1.6, 0.2, 0.7, 0xffffff);
            for (let k = 0; k < 5; k++) { // 翻滚云涡（带自转感的云团）
                const i = Math.floor(((k + 0.5) / 5) * (pts.length - 1));
                const p = pts[i];
                const r = 5 + (k % 2) * 2.6;
                g.fillStyle(0xffffff, 0.55 * fade);
                g.fillCircle(p.x, p.y - 2, r);
                g.fillStyle(c, 0.4 * fade);
                g.fillCircle(p.x + Math.cos(now / 300 + k) * r * 0.4, p.y - 2 + Math.sin(now / 300 + k) * r * 0.4, r * 0.55);
            }
            for (let k = 0; k < 4; k++) { // 云隙金光（从云缝漏出的光斑）
                const i = Math.floor(((k + 0.3) / 4) * (pts.length - 1));
                const p = pts[i];
                const gl = 0.4 + 0.6 * Math.abs(Math.sin(now / 260 + k * 1.6));
                g.fillStyle(a, gl * 0.6 * fade);
                g.fillCircle(p.x, p.y + 2, 2.2);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xffffff, fade);
            g.fillCircle(head.x, head.y, 2.6);
            g.fillStyle(a, 0.5 * fade);
            g.fillCircle(head.x, head.y, 5);
        } },
    xyTrailB: { c: 0xffb0c8, a: 0xffd45c, draw: (ctx, c, a) => {
            // 蟠桃霞光：桃色霞带 + 旋转花瓣 + 球头一枚小蟠桃
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 11, 1.6, now / 450, 8, c, 0.35 * fade);
            curve(ctx, 6, 1.4, 0.2, 0.55, c);
            curve(ctx, 2.6, 0.9, 0.35, 0.9, 0xffe0e8);
            for (let k = 0; k < 6; k++) { // 旋转花瓣（沿轨迹滚落）
                const i = Math.floor(((k + 0.4) / 6) * (pts.length - 1));
                const p = pts[i];
                const ang = now / 200 + k * 1.9;
                g.save();
                g.translateCanvas(p.x, p.y);
                g.rotateCanvas(ang);
                g.fillStyle(k % 2 ? a : 0xfff0f4, 0.8 * fade);
                g.fillEllipse(0, 0, 4.4, 2.2);
                g.restore();
            }
            for (let k = 0; k < 4; k++) { // 霞光星屑
                const i = Math.floor(((k + 0.2) / 4) * (pts.length - 1));
                const p = pts[i];
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k * 1.7));
                g.fillStyle(0xffffff, tw * fade);
                g.fillRect(p.x - 2.2, p.y - 0.5, 4.4, 1);
                g.fillRect(p.x - 0.5, p.y - 2.2, 1, 4.4);
            }
            const head = pts[pts.length - 1]; // 球头小蟠桃
            g.fillStyle(0xff9a5c, fade);
            g.fillEllipse(head.x, head.y, 6, 5);
            g.fillStyle(0xffd0b0, 0.8 * fade);
            g.fillCircle(head.x - 1.2, head.y - 1, 1.4);
            g.fillStyle(0x8ac85a, fade);
            g.fillEllipse(head.x + 1.6, head.y - 2.6, 3.4, 1.6);
        } },
    sgmTrailA: { c: 0xb8a890, a: 0x8a7a5a, draw: (ctx, c, a) => {
            // 烟尘拖尾：万马奔腾的烟尘带——尘浪 + 崩碎石屑 + 蹄印尘圈
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 14, 2.2, now / 350, 9, c, 0.4 * fade);
            curve(ctx, 8, 2, 0.15, 0.4, a);
            for (let k = 0; k < 5; k++) { // 翻滚尘浪
                const i = Math.floor(((k + 0.5) / 5) * (pts.length - 1));
                const p = pts[i];
                const r = 5 + (k % 3) * 2;
                g.fillStyle(c, 0.45 * fade);
                g.fillCircle(p.x, p.y - 1, r);
                g.fillStyle(0xd0c4ac, 0.4 * fade);
                g.fillCircle(p.x + r * 0.4, p.y - 1 - r * 0.3, r * 0.55);
            }
            for (let k = 0; k < 5; k++) { // 崩碎石屑（弹跳下落）
                const i = Math.floor(((k + 0.2) / 5) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 380 + k / 5) % 1;
                g.fillStyle(a, 0.8 * (1 - ph) * fade);
                g.fillRect(p.x - 1.2, p.y - 1.2 - Math.sin(ph * Math.PI) * 8, 2.4, 2.4);
            }
            for (let k = 0; k < 3; k++) { // 蹄印尘圈（沿轨迹绽开又散去）
                const i = Math.floor(((k + 0.4) / 3) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 600 + k / 3) % 1;
                g.lineStyle(1.6, c, (0.5 * (1 - ph)) * fade);
                g.strokeCircle(p.x, p.y + 3, 3 + ph * 7);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xd0c4ac, fade);
            g.fillCircle(head.x, head.y, 3);
        } },
    sgmTrailB: { c: 0xff5a1a, a: 0xffe15c, draw: (ctx, c, a) => {
            // 赤焰箭痕：火箭掠过的焰痕——焰带 + 箭簇星火 + 沿途燃点 + 烟迹
            const { g, pts, fade, now } = ctx;
            curve(ctx, 11, 2.4, 0.12, 0.35, 0x8a2a10);
            curve(ctx, 7, 1.8, 0.2, 0.6, c);
            curve(ctx, 2.8, 0.9, 0.35, 0.9, a);
            for (let k = 0; k < 6; k++) { // 箭簇星火（沿焰带炸开的十字火）
                const i = Math.floor(((k + 0.3) / 6) * (pts.length - 1));
                const p = pts[i];
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 180 + k * 1.8));
                const s = 2.4 + (k % 3);
                g.fillStyle(a, tw * fade);
                g.fillRect(p.x - s, p.y - 0.5, s * 2, 1);
                g.fillRect(p.x - 0.5, p.y - s, 1, s * 2);
                g.fillStyle(0xffffff, tw * 0.7 * fade);
                g.fillCircle(p.x, p.y, 1.2);
            }
            for (let k = 0; k < 4; k++) { // 沿途燃点（残留火苗摇曳）
                const i = Math.floor(((k + 0.5) / 4) * (pts.length - 1));
                const p = pts[i];
                const flick = Math.sin(now / 120 + k * 2) * 1.6;
                g.fillStyle(c, 0.7 * fade);
                g.fillTriangle(p.x - 2.4, p.y + 2, p.x + 2.4, p.y + 2, p.x + flick, p.y - 4);
            }
            for (let k = 0; k < 3; k++) { // 上飘烟迹
                const i = Math.floor(((k + 0.4) / 3) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 800 + k / 3) % 1;
                g.fillStyle(0x8a2a10, 0.3 * (1 - ph) * fade);
                g.fillCircle(p.x + Math.sin(ph * 5 + k) * 4, p.y - ph * 14, 2.4 * (1 - ph) + 0.6);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xffe15c, fade);
            g.fillCircle(head.x, head.y, 2.8);
            g.fillStyle(0xffffff, fade);
            g.fillCircle(head.x, head.y, 1.2);
        } },
};
