import { TAU, curve, ribbon } from './shared.js';
/** 批十主题拖尾（电竞赛场 / 末日废土 / 星光偶像）。ctx: g/pts/fade/now，pts[0] 最旧、末位是球头。 */
export const TRAILS_11 = {
    esportTrailA: { c: 0x00e5ff, a: 0xff2e88, draw: (ctx, c, a) => {
            // 电流拖尾：狂奔的电流——主电弧 + 分叉电枝 + 电容闪光 + 数据点
            const { g, pts, fade, now } = ctx;
            curve(ctx, 2.4, 0.8, 0.2, 0.5, c);
            for (let k = 0; k < 6; k++) { // 分叉电枝（锯齿状主弧 + 分叉）
                const i = Math.floor(((k + 0.4) / 6) * (pts.length - 1));
                const p = pts[i];
                const q = pts[Math.min(pts.length - 1, i + 2)];
                g.lineStyle(2, k % 2 ? a : c, 0.85 * fade);
                g.beginPath();
                g.moveTo(p.x, p.y);
                const seg = 3;
                for (let s = 1; s <= seg; s++) {
                    const u = s / seg;
                    g.lineTo(p.x + (q.x - p.x) * u + Math.sin(now / 40 + k + s) * 5, p.y + (q.y - p.y) * u + Math.cos(now / 45 + s) * 5);
                }
                g.strokePath();
                // 枝端小分叉
                g.lineStyle(1, c, 0.5 * fade);
                g.lineBetween(q.x, q.y, q.x + Math.sin(now / 60 + k) * 6, q.y + Math.cos(now / 55 + k) * 6);
            }
            for (let k = 0; k < 4; k++) { // 电容闪光（周期爆亮的节点）
                const i = Math.floor(((k + 0.5) / 4) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 260 + k / 4) % 1;
                g.fillStyle(0xffffff, (0.8 * (1 - ph)) * fade);
                g.fillCircle(p.x, p.y, 3.4 * (1 - ph) + 1);
                g.fillStyle(c, 0.3 * (1 - ph) * fade);
                g.fillCircle(p.x, p.y, 6 * (1 - ph) + 1);
            }
            const head = pts[pts.length - 1];
            const gl = 0.6 + 0.4 * Math.sin(now / 90);
            g.fillStyle(0xffffff, gl * fade);
            g.fillCircle(head.x, head.y, 2.4);
            g.fillStyle(c, 0.4 * fade);
            g.fillCircle(head.x, head.y, 5.4);
        } },
    esportTrailB: { c: 0xffd45c, a: 0x00e5ff, draw: (ctx, c, a) => {
            // 胜利光带：胜利的金色光带——金带 + 青描边 + 星形光斑 + 彩纸屑
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 12, 1.4, now / 450, 6, c, 0.4 * fade);
            curve(ctx, 7, 1.6, 0.2, 0.6, c);
            curve(ctx, 2.6, 1, 0.35, 0.9, 0xfff6d8);
            g.lineStyle(1.4, a, 0.6 * fade); // 青描边（光带上下缘）
            for (const off of [-7, 7]) {
                g.beginPath();
                for (let s = 0; s < pts.length; s++) {
                    const p = pts[s];
                    if (s === 0)
                        g.moveTo(p.x, p.y + off);
                    else
                        g.lineTo(p.x, p.y + off + Math.sin(s * 0.6 + now / 250) * 1.4);
                }
                g.strokePath();
            }
            for (let k = 0; k < 5; k++) { // 星形光斑
                const i = Math.floor(((k + 0.4) / 5) * (pts.length - 1));
                const p = pts[i];
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 200 + k * 1.7));
                g.fillStyle(0xffffff, tw * fade);
                g.fillPoints((() => {
                    const vs = [];
                    for (let s = 0; s < 10; s++) {
                        const ang = (s / 10) * TAU - Math.PI / 2 + k;
                        const rr = s % 2 ? 1.2 : 3;
                        vs.push({ x: p.x + Math.sin(k * 2) * 5 + Math.cos(ang) * rr, y: p.y + Math.cos(k * 2) * 4 + Math.sin(ang) * rr });
                    }
                    return vs;
                })(), true);
            }
            for (let k = 0; k < 6; k++) { // 彩纸屑（旋转飘落的纸屑）
                const i = Math.floor(((k + 0.2) / 6) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 500 + k / 6) % 1;
                g.save();
                g.translateCanvas(p.x + Math.sin(ph * 4 + k) * 6, p.y - ph * 10);
                g.rotateCanvas(ph * 7 + k);
                g.fillStyle(k % 2 ? a : 0xff2e88, 0.7 * (1 - ph) * fade);
                g.fillRect(-1.6, -1, 3.2, 2);
                g.restore();
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xfff6d8, fade);
            g.fillCircle(head.x, head.y, 2.4);
        } },
    wasteTrailA: { c: 0xc9a84a, a: 0x8a7430, draw: (ctx, c, _a) => {
            // 沙暴拖尾：呼啸的沙暴——沙浪带 + 飞沙 + 卷起杂物 + 风蚀纹
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 14, 2.2, now / 380, 10, c, 0.4 * fade);
            curve(ctx, 9, 2, 0.15, 0.45, 0xa8843a);
            for (let k = 0; k < 5; k++) { // 沙浪卷（翻滚的沙团）
                const i = Math.floor(((k + 0.5) / 5) * (pts.length - 1));
                const p = pts[i];
                const r = 5 + (k % 3) * 2.4;
                g.fillStyle(c, 0.4 * fade);
                g.fillCircle(p.x, p.y - 1, r);
                g.fillStyle(0xe8c88a, 0.25 * fade);
                g.fillCircle(p.x - r * 0.3, p.y - 1 - r * 0.3, r * 0.5);
            }
            for (let k = 0; k < 7; k++) { // 飞沙
                const i = Math.floor(((k + 0.2) / 7) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 300 + k / 7) % 1;
                g.fillStyle(0xe8c88a, 0.6 * (1 - ph) * fade);
                g.fillCircle(p.x + Math.sin(ph * 5 + k) * 6, p.y - ph * 8, 1.2 * (1 - ph) + 0.4);
            }
            for (let k = 0; k < 3; k++) { // 卷起的杂物（铁皮片）
                const i = Math.floor(((k + 0.5) / 3) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 600 + k / 3) % 1;
                g.save();
                g.translateCanvas(p.x + Math.sin(ph * 5 + k) * 5, p.y - Math.sin(ph * Math.PI) * 10);
                g.rotateCanvas(ph * 8 + k);
                g.fillStyle(0x6a5a3a, 0.7 * Math.sin(ph * Math.PI) * fade);
                g.fillRect(-2.4, -1.6, 4.8, 3.2);
                g.restore();
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xe8c88a, fade);
            g.fillCircle(head.x, head.y, 2.6);
        } },
    wasteTrailB: { c: 0x4a4438, a: 0xff8a3c, draw: (ctx, c, a) => {
            // 机油拖尾：滴落的机油痕——油带 + 油滴拉丝 + 彩虹油膜 + 火星
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 11, 1.4, now / 500, 5, c, 0.5 * fade);
            curve(ctx, 7, 1.8, 0.15, 0.5, 0x3a3428);
            for (let k = 0; k < 5; k++) { // 油滴拉丝（下坠拉长的油滴）
                const i = Math.floor(((k + 0.4) / 5) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 550 + k / 5) % 1;
                g.fillStyle(0x1a1610, 0.85 * (1 - ph) * fade);
                g.fillEllipse(p.x + Math.sin(k * 2.4) * 5, p.y + ph * 12, 1.6, 3.4 * (1 - ph) + 1);
            }
            for (let k = 0; k < 4; k++) { // 彩虹油膜（油面上流转的虹光）
                const i = Math.floor(((k + 0.5) / 4) * (pts.length - 1));
                const p = pts[i];
                const cols = [0xff5a5c, 0x7dffc4, 0x5ac8ff];
                for (let s = 0; s < 3; s++) {
                    g.fillStyle(cols[s], 0.25 * fade);
                    g.fillEllipse(p.x - 3 + s * 3, p.y - 1, 3, 1.4);
                }
            }
            for (let k = 0; k < 3; k++) { // 火星（机油遇火的零星火星）
                const i = Math.floor(((k + 0.4) / 3) * (pts.length - 1));
                const p = pts[i];
                const bl = Math.abs(Math.sin(now / 160 + k * 2.2));
                g.fillStyle(a, bl * 0.8 * fade);
                g.fillCircle(p.x + Math.sin(k * 2.2) * 6, p.y - 3, 1.2);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0x1a1610, fade);
            g.fillCircle(head.x, head.y, 2.4);
            g.fillStyle(a, 0.4 * fade);
            g.fillCircle(head.x, head.y, 4);
        } },
    idolTrailA: { c: 0x7ac8ff, a: 0xff9adf, draw: (ctx, c, a) => {
            // 荧光拖尾：观众荧光棒汇成的荧光流——荧光带 + 光棒流 + 星点 + 应援色闪
            const { g, pts, fade, now } = ctx;
            ribbon(ctx, 11, 1.4, now / 420, 7, c, 0.3 * fade);
            curve(ctx, 6, 1.4, 0.2, 0.55, c);
            curve(ctx, 2.2, 0.9, 0.35, 0.85, 0xffffff);
            for (let k = 0; k < 6; k++) { // 光棒流（短棒随波流动）
                const i = Math.floor(((k + 0.4) / 6) * (pts.length - 1));
                const p = pts[i];
                g.save();
                g.translateCanvas(p.x + Math.sin(k * 2.4) * 5, p.y + Math.cos(k * 2) * 4);
                g.rotateCanvas(Math.sin(now / 250 + k) * 0.4);
                g.fillStyle(k % 2 ? a : c, 0.85 * fade);
                g.fillRoundedRect(-1.2, -4.4, 2.4, 8.8, 1.2);
                g.fillStyle(0xffffff, 0.4 * fade);
                g.fillRect(-0.4, -3.4, 0.8, 6.4);
                g.restore();
            }
            for (let k = 0; k < 5; k++) { // 星点
                const i = Math.floor(((k + 0.25) / 5) * (pts.length - 1));
                const p = pts[i];
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 220 + k * 1.7));
                g.fillStyle(0xffffff, tw * fade);
                g.fillRect(p.x - 2, p.y - 0.5, 4, 1);
                g.fillRect(p.x - 0.5, p.y - 2, 1, 4);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xffffff, fade);
            g.fillCircle(head.x, head.y, 2.2);
            g.fillStyle(a, 0.35 * fade);
            g.fillCircle(head.x, head.y, 4.6);
        } },
    idolTrailB: { c: 0xff9adf, a: 0xffd45c, draw: (ctx, c, _a) => {
            // 彩带拖尾：谢幕抛洒的彩带——多层彩带 + 旋转飘带 + 亮片 + 花瓣
            const { g, pts, fade, now } = ctx;
            const cols = [0xff5a8a, 0xffd45c, 0x7ac8ff, 0x9b5cff];
            for (let k = 0; k < 4; k++) { // 多层彩带（四条异相波浪带）
                g.lineStyle(2.6, cols[k], 0.6 * fade);
                g.beginPath();
                for (let s = 0; s < pts.length; s++) {
                    const p = pts[s];
                    const off = (k - 1.5) * 2.6 + Math.sin(s * 0.7 + now / 250 + k) * 2.4;
                    if (s === 0)
                        g.moveTo(p.x, p.y + off);
                    else
                        g.lineTo(p.x, p.y + off);
                }
                g.strokePath();
            }
            for (let k = 0; k < 6; k++) { // 旋转飘带
                const i = Math.floor(((k + 0.3) / 6) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 550 + k / 6) % 1;
                g.save();
                g.translateCanvas(p.x + Math.sin(ph * 4 + k) * 6, p.y - ph * 12);
                g.rotateCanvas(ph * 8 + k);
                g.fillStyle(cols[k % 4], 0.8 * Math.sin(ph * Math.PI) * fade);
                g.fillRect(-3, -1.2, 6, 2.4);
                g.restore();
            }
            for (let k = 0; k < 5; k++) { // 亮片
                const i = Math.floor(((k + 0.4) / 5) * (pts.length - 1));
                const p = pts[i];
                const tw = Math.abs(Math.sin(now / 170 + k * 1.9));
                g.fillStyle(0xffffff, tw * fade);
                g.fillCircle(p.x + Math.sin(k * 2.2) * 6, p.y + Math.cos(k * 2) * 5, 1.1);
            }
            const head = pts[pts.length - 1];
            g.fillStyle(0xfff6d8, fade);
            g.fillCircle(head.x, head.y, 2.4);
            g.fillStyle(c, 0.35 * fade);
            g.fillCircle(head.x, head.y, 4.8);
        } },
};
