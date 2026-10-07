import { TAU, curve, ribbon } from './shared.js';
/** 批八主题拖尾（敦煌飞天 / 羽蛇神殿 / 圣辉天界）。ctx: g/pts/fade/now，pts[0] 最旧、末位是球头。 */
export const TRAILS_9 = {
    dunTrailA: { c: 0xffd45c, a: 0xff9adf, draw: (ctx, c, a) => {
            // 天花乱坠：漫天花瓣与金花——花瓣雨带 + 旋转花朵 + 金粉
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 10, 1.6, now / 500, 7, c, 0.25 * fade);
            curve(ctx, 5, 1.2, 0.25, 0.5, 0xffe0b0);
            for (let k = 0; k < 7; k++) { // 旋转花朵（五瓣小花）
                const i = Math.floor(((k + 0.4) / 7) * (pts.length - 1));
                const p = pts[i];
                g.save();
                g.translateCanvas(p.x + Math.sin(k * 2.4) * 5, p.y + Math.cos(k * 1.8) * 4);
                g.rotateCanvas(now / 300 + k);
                g.fillStyle(k % 2 ? a : 0xffb0c8, 0.85 * fade);
                for (let s = 0; s < 5; s++) {
                    const ang = (s / 5) * TAU;
                    g.fillEllipse(Math.cos(ang) * 2.6, Math.sin(ang) * 2.6, 2.4, 1.6);
                }
                g.fillStyle(0xfff0d8, 0.9 * fade);
                g.fillCircle(0, 0, 1);
                g.restore();
            }
            for (let k = 0; k < 6; k++) { // 金粉
                const i = Math.floor(((k + 0.2) / 6) * (pts.length - 1));
                const p = pts[i];
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k * 1.7));
                g.fillStyle(0xfff0d8, tw * fade);
                g.fillCircle(p.x + Math.sin(k * 2.2) * 6, p.y + Math.cos(k * 2) * 4, 1.2);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xffffff, fade);
            g.fillCircle(head.x, head.y, 2.2);
            g.fillStyle(a, 0.4 * fade);
            g.fillCircle(head.x, head.y, 4.6);
        } },
    dunTrailB: { c: 0xffb0c8, a: 0xffd45c, draw: (ctx, c, a) => {
            // 霓裳云痕：飞天拂过的云霞痕——霞带 + 云卷头 + 彩带丝 + 暖光
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 13, 1.8, now / 450, 9, c, 0.3 * fade);
            curve(ctx, 9, 1.8, 0.15, 0.45, 0xffd0b0);
            curve(ctx, 4, 1.2, 0.3, 0.75, 0xffe8d8);
            for (let k = 0; k < 4; k++) { // 云卷头（带卷云弧的云团）
                const i = Math.floor(((k + 0.5) / 4) * (pts.length - 1));
                const p = pts[i];
                const r = 5 + (k % 2) * 2.4;
                g.fillStyle(0xffe8d8, 0.4 * fade);
                g.fillCircle(p.x, p.y - 2, r);
                g.lineStyle(1.4, a, 0.5 * fade);
                g.beginPath();
                g.arc(p.x, p.y - 2, r * 0.65, now / 280 + k, now / 280 + k + 2.2);
                g.strokePath();
            }
            for (let k = 0; k < 4; k++) { // 彩带丝（纤细的飘带丝）
                const i = Math.floor(((k + 0.3) / 4) * (pts.length - 1));
                const p = pts[i];
                g.lineStyle(1, k % 2 ? a : 0xff9adf, 0.5 * fade);
                g.beginPath();
                g.moveTo(p.x - 5, p.y - 3);
                g.lineTo(p.x, p.y - 1 + Math.sin(now / 200 + k) * 2);
                g.lineTo(p.x + 5, p.y - 3);
                g.strokePath();
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xfff0d8, fade);
            g.fillCircle(head.x, head.y, 2.4);
            g.fillStyle(c, 0.35 * fade);
            g.fillCircle(head.x, head.y, 5);
        } },
    aztTrailA: { c: 0x3ad49a, a: 0x8a7a5a, draw: (ctx, c, _a) => {
            // 藤蔓拖尾：轨迹长出藤蔓——主藤 + 卷须 + 叶片 + 小花
            const { g, pts, fade, now } = ctx;
            curve(ctx, 3.4, 1.2, 0.3, 0.85, 0x2a9a6e);
            for (let k = 0; k < 6; k++) { // 主藤上的叶片（交替方向）
                const i = Math.floor(((k + 0.4) / 6) * (pts.length - 1));
                const p = pts[i];
                const side = k % 2 ? 1 : -1;
                g.save();
                g.translateCanvas(p.x, p.y);
                g.rotateCanvas(side * (1 + Math.sin(now / 400 + k) * 0.15));
                g.fillStyle(k % 2 ? c : 0x2a9a6e, 0.85 * fade);
                g.fillEllipse(0, -4, 2.2, 5);
                g.lineStyle(0.8, 0x1a5a3e, 0.8);
                g.lineBetween(0, 0, 0, -3);
                g.restore();
            }
            for (let k = 0; k < 4; k++) { // 卷须（螺旋小卷）
                const i = Math.floor(((k + 0.5) / 4) * (pts.length - 1));
                const p = pts[i];
                const side = k % 2 ? 1 : -1;
                g.lineStyle(1, 0x2a9a6e, 0.7 * fade);
                g.beginPath();
                for (let s = 0; s <= 8; s++) {
                    const u = s / 8;
                    const ang = u * 3.4 + now / 300 + k;
                    g.lineTo(p.x + side * (2 + u * 5), p.y - u * 6 + Math.sin(ang) * u * 2);
                }
                g.strokePath();
            }
            for (let k = 0; k < 3; k++) { // 藤上小花
                const i = Math.floor(((k + 0.6) / 3) * (pts.length - 1));
                const p = pts[i];
                g.fillStyle(0xffd45c, 0.9 * fade);
                g.fillCircle(p.x, p.y - 3, 1.4);
                g.fillStyle(0xff8a5c, 0.8 * fade);
                g.fillCircle(p.x, p.y - 3, 0.7);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0x7dffc4, fade);
            g.fillCircle(head.x, head.y, 2);
            g.lineStyle(1.2, 0x2a9a6e, 0.7 * fade);
            g.strokeCircle(head.x, head.y, 3.6);
        } },
    aztTrailB: { c: 0xffd45c, a: 0xff7a3a, draw: (ctx, c, _a) => {
            // 星金粉尘：神殿洒落的星金——金尘带 + 旋转金箔 + 星芒 + 翡翠光点
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 11, 1.6, now / 420, 8, c, 0.28 * fade);
            curve(ctx, 6, 1.4, 0.2, 0.5, 0xe8a83a);
            for (let k = 0; k < 6; k++) { // 旋转金箔（方形金箔转飞）
                const i = Math.floor(((k + 0.4) / 6) * (pts.length - 1));
                const p = pts[i];
                g.save();
                g.translateCanvas(p.x + Math.sin(k * 2.4) * 5, p.y + Math.cos(k * 2) * 4);
                g.rotateCanvas(now / 180 + k * 1.4);
                g.fillStyle(k % 2 ? c : 0xe8a83a, 0.8 * fade);
                g.fillRect(-2, -2, 4, 4);
                g.fillStyle(0xfff0b0, 0.5 * fade);
                g.fillRect(-0.8, -0.8, 1.6, 1.6);
                g.restore();
            }
            for (let k = 0; k < 5; k++) { // 星芒
                const i = Math.floor(((k + 0.25) / 5) * (pts.length - 1));
                const p = pts[i];
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 220 + k * 1.8));
                const s = 2 + (k % 3);
                g.fillStyle(0xffffff, tw * fade);
                g.fillRect(p.x - s, p.y - 0.5, s * 2, 1);
                g.fillRect(p.x - 0.5, p.y - s, 1, s * 2);
            }
            for (let k = 0; k < 4; k++) { // 翡翠光点
                const i = Math.floor(((k + 0.5) / 4) * (pts.length - 1));
                const p = pts[i];
                const bl = Math.abs(Math.sin(now / 260 + k * 1.9));
                g.fillStyle(0x3ad49a, bl * 0.8 * fade);
                g.fillCircle(p.x + Math.sin(k * 2.6) * 6, p.y - 2, 1.4);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xfff0b0, fade);
            g.fillCircle(head.x, head.y, 2.4);
            g.fillStyle(c, 0.35 * fade);
            g.fillCircle(head.x, head.y, 4.8);
        } },
    angTrailA: { c: 0xffd45c, a: 0xffffff, draw: (ctx, c, _a) => {
            // 圣辉拖尾：圣辉光带——金辉主带 + 白芯 + 光柱斜落 + 圣音环
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 12, 1.4, now / 450, 6, c, 0.3 * fade);
            curve(ctx, 8, 1.8, 0.2, 0.55, c);
            curve(ctx, 3, 1, 0.4, 0.9, 0xffffff);
            for (let k = 0; k < 5; k++) { // 微型光柱（沿轨迹落下的光柱）
                const i = Math.floor(((k + 0.4) / 5) * (pts.length - 1));
                const p = pts[i];
                g.fillStyle(0xffffff, 0.14 * fade);
                g.fillPoints([
                    { x: p.x - 3, y: p.y - 10 }, { x: p.x + 3, y: p.y - 10 }, { x: p.x + 5, y: p.y + 6 }, { x: p.x - 5, y: p.y + 6 },
                ], true);
                g.fillStyle(0xfff6d8, 0.6 * fade);
                g.fillEllipse(p.x, p.y + 6, 6, 2);
            }
            for (let k = 0; k < 4; k++) { // 圣音环（周期扩散的细环）
                const i = Math.floor(((k + 0.5) / 4) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 750 + k / 4) % 1;
                g.lineStyle(1.4, c, (0.5 * (1 - ph)) * fade);
                g.strokeCircle(p.x, p.y, 3 + ph * 9);
            }
            const head = pts[pts.length - 1];
            const gl = 0.6 + 0.4 * Math.sin(now / 220);
            g.fillStyle(0xffffff, gl * fade);
            g.fillCircle(head.x, head.y, 2.4);
            g.fillStyle(c, 0.35 * fade);
            g.fillCircle(head.x, head.y, 5);
        } },
    angTrailB: { c: 0xfff6d8, a: 0xffd45c, draw: (ctx, c, a) => {
            // 白羽拖尾：飘落的白羽——羽带 + 旋转羽毛 + 绒羽小絮 + 金光衬
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 11, 1.8, now / 520, 8, c, 0.24 * fade);
            curve(ctx, 6, 1.4, 0.2, 0.45, 0xf0e8d0);
            for (let k = 0; k < 6; k++) { // 旋转羽毛（带羽轴的羽片）
                const i = Math.floor(((k + 0.4) / 6) * (pts.length - 1));
                const p = pts[i];
                g.save();
                g.translateCanvas(p.x + Math.sin(k * 2.4) * 5, p.y + Math.sin(ph(k) + k) * 4);
                g.rotateCanvas(now / 350 + k);
                g.fillStyle(k % 2 ? 0xffffff : 0xf0e8d0, 0.9 * fade);
                g.fillEllipse(0, 0, 6, 2.6);
                g.lineStyle(0.8, 0xc0b8a0, 0.8 * fade);
                g.lineBetween(-3, 0, 3, 0);
                g.restore();
            }
            function ph(k) { return (now / 900 + k / 6) % 1; }
            for (let k = 0; k < 5; k++) { // 绒羽小絮
                const i = Math.floor(((k + 0.25) / 5) * (pts.length - 1));
                const p = pts[i];
                const ph2 = (now / 800 + k / 5) % 1;
                g.fillStyle(0xffffff, 0.5 * (1 - ph2) * fade);
                g.fillCircle(p.x + Math.sin(ph2 * 4 + k) * 5, p.y - ph2 * 10, 1.4 * (1 - ph2) + 0.4);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xffffff, fade);
            g.fillCircle(head.x, head.y, 2.2);
            g.fillStyle(a, 0.4 * fade);
            g.fillCircle(head.x, head.y, 4.4);
        } },
};
