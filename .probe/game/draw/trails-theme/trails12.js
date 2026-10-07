import { TAU } from './shared.js';
/** 批十一主题拖尾（软泥秘境 / 妖猫夜行 / 甲虫王朝）——整条轨迹画成一个整体 */
export const TRAILS_12 = {
    slimeTrailA: { c: 0x9aff7a, a: 0xd0ff9a, draw: (ctx, c, a) => {
            // 黏液拖尾：粗果冻浆带 + 液面泡 + 甩出泥滴
            const { g, pts, fade, now } = ctx;
            for (let k = 0; k < pts.length - 1; k++) { // 浆带（宽窄起伏）
                const p0 = pts[k], p1 = pts[k + 1];
                const age = k / (pts.length - 1);
                const w = (3 + age * 7 + Math.sin(now / 300 + k) * 1.6) * fade;
                g.lineStyle(w, c, 0.65 * fade);
                g.beginPath();
                g.moveTo(p0.x, p0.y);
                g.lineTo(p1.x, p1.y);
                g.strokePath();
            }
            for (let k = 0; k < 6; k++) { // 液面小泡
                const i = Math.floor(((k + 0.3) / 6) * (pts.length - 1));
                const p = pts[i];
                const pop = Math.abs(Math.sin(now / 350 + k * 1.6));
                g.fillStyle(0xffffff, (0.3 + pop * 0.3) * fade);
                g.fillEllipse(p.x, p.y - 2, (2.4 * pop + 1) * 2, 3.6);
            }
            for (let k = 0; k < 4; k++) { // 甩出的泥滴
                const i = Math.floor(((k + 0.2) / 4) * (pts.length - 1));
                const p = pts[i];
                const drop = Math.sin(now / 450 + k * 2) * 4;
                g.fillStyle(a, 0.7 * fade);
                g.fillEllipse(p.x + drop, p.y - 5 - (k % 2) * 4, 3, 4.4);
            }
            const head = pts[pts.length - 1]; // 球头：一大团黏液
            g.fillStyle(c, 0.85 * fade);
            g.fillCircle(head.x, head.y, 6.4);
            g.fillStyle(a, 0.9 * fade);
            g.fillCircle(head.x, head.y - 1, 4);
            g.fillStyle(0xffffff, 0.5 * fade);
            g.fillCircle(head.x - 2, head.y - 2.4, 1.6);
        } },
    slimeTrailB: { c: 0xd0ff9a, a: 0x5ac8ff, draw: (ctx, _c, a) => {
            // 泡泡拖尾：一串渐大的肥皂泡 + 虹彩高光 + 破泡闪屑
            const { g, pts, fade, now } = ctx;
            for (let k = 0; k < pts.length - 1; k++) { // 细泡沫线
                const p0 = pts[k], p1 = pts[k + 1];
                g.lineStyle(2.2, 0xbfe8ff, 0.35 * fade);
                g.beginPath();
                g.moveTo(p0.x, p0.y);
                g.lineTo(p1.x, p1.y);
                g.strokePath();
            }
            for (let k = 0; k < 8; k++) { // 主体泡泡串
                const i = Math.floor(((k + 0.2) / 8) * (pts.length - 1));
                const p = pts[i];
                const age = k / 8;
                const r = 2 + age * 6 + Math.sin(now / 400 + k) * 0.8;
                const wob = Math.sin(now / 250 + k * 2) * 1.4;
                g.fillStyle(0xbfe8ff, 0.25 * fade);
                g.fillCircle(p.x, p.y + wob, r);
                g.lineStyle(1.2, 0x8ad0ff, 0.55 * fade);
                g.beginPath();
                g.arc(p.x, p.y + wob, r, 0, TAU);
                g.strokePath();
                // 虹彩高光（相位流动）
                g.fillStyle(k % 2 ? 0xffb0e8 : 0xb0ffd0, 0.4 * fade);
                g.fillCircle(p.x - r * 0.35, p.y + wob - r * 0.35, r * 0.26);
            }
            for (let k = 0; k < 4; k++) { // 破泡闪屑
                const i = Math.floor(((k + 0.55) / 4) * (pts.length - 1));
                const p = pts[i];
                const tw = Math.abs(Math.sin(now / 180 + k * 2.2));
                g.fillStyle(0xffffff, tw * 0.7 * fade);
                g.fillRect(p.x - 2, p.y - 0.4, 4, 0.8);
                g.fillRect(p.x - 0.4, p.y - 2, 0.8, 4);
            }
            const head = pts[pts.length - 1]; // 球头：最大一颗泡泡包着闪核
            const hr = 8 + Math.sin(now / 300) * 0.8;
            g.fillStyle(0xbfe8ff, 0.3 * fade);
            g.fillCircle(head.x, head.y, hr);
            g.lineStyle(1.4, a, 0.6 * fade);
            g.beginPath();
            g.arc(head.x, head.y, hr, 0, TAU);
            g.strokePath();
            g.fillStyle(0xffffff, 0.7 * fade);
            g.fillCircle(head.x - hr * 0.35, head.y - hr * 0.35, 2);
        } },
    nekTrailA: { c: 0xb08aff, a: 0xffd45c, draw: (ctx, c, a) => {
            // 妖火拖尾：紫焰带 + 内焰 + 飘散火星
            const { g, pts, fade, now } = ctx;
            for (let k = 0; k < pts.length - 1; k++) { // 外焰带（波动）
                const p0 = pts[k], p1 = pts[k + 1];
                const age = k / (pts.length - 1);
                const wob = Math.sin(now / 160 + k * 0.9) * 3.4;
                g.lineStyle((2 + age * 8) * fade, c, (0.28 + age * 0.3) * fade);
                g.beginPath();
                g.moveTo(p0.x, p0.y + wob);
                g.lineTo(p1.x, p1.y + wob * 0.6);
                g.strokePath();
            }
            for (let k = 0; k < pts.length - 1; k += 2) { // 内焰亮线
                const p0 = pts[k], p1 = pts[k + 1];
                g.lineStyle(2.4, 0xd0b0ff, 0.6 * fade);
                g.beginPath();
                g.moveTo(p0.x, p0.y);
                g.lineTo(p1.x, p1.y);
                g.strokePath();
            }
            for (let k = 0; k < 7; k++) { // 上飘火星
                const i = Math.floor(((k + 0.2) / 7) * (pts.length - 1));
                const p = pts[i];
                const ph = (now / 500 + k * 0.3) % 1;
                g.fillStyle(a, (1 - ph) * 0.8 * fade);
                g.fillCircle(p.x + Math.sin(ph * 5 + k) * 6, p.y - ph * 16, 1.6 - ph);
            }
            const head = pts[pts.length - 1]; // 球头：妖火珠
            const fl = 0.75 + 0.25 * Math.sin(now / 110);
            g.fillStyle(c, 0.5 * fl * fade);
            g.fillCircle(head.x, head.y, 8);
            g.fillStyle(0xd0b0ff, 0.9 * fade);
            g.fillCircle(head.x, head.y, 4.4);
            g.fillStyle(a, fl * fade);
            g.fillCircle(head.x, head.y - 1, 2);
            g.fillStyle(0xffffff, 0.8 * fade);
            g.fillCircle(head.x - 1, head.y - 1.6, 0.9);
        } },
    nekTrailB: { c: 0xffd45c, a: 0xb08aff, draw: (ctx, c, a) => {
            // 猫足印拖尾：左右交替的梅花爪印渐隐 + 爪尖妖光
            const { g, pts, fade, now } = ctx;
            g.lineStyle(1.6, c, 0.2 * fade); // 底线微光
            g.beginPath();
            g.moveTo(pts[0].x, pts[0].y);
            for (const p of pts)
                g.lineTo(p.x, p.y);
            g.strokePath();
            for (let k = 0; k < 9; k++) { // 交替爪印
                const i = Math.floor(((k + 0.5) / 9) * (pts.length - 1));
                const p = pts[i];
                const side = k % 2 ? 1 : -1;
                const age = k / 9;
                const alpha = (0.25 + age * 0.55) * fade;
                const px = p.x + side * 4, py = p.y;
                g.fillStyle(c, alpha); // 掌垫
                g.fillEllipse(px, py + 2, 5, 3.6);
                for (let t = 0; t < 4; t++) { // 四趾
                    g.fillStyle(c, alpha);
                    g.fillEllipse(px - 3 + t * 2, py - 2.4 + Math.abs(t - 1.5) * 0.8, 1.6, 2);
                }
                if (k === 8) { // 最新印的爪尖妖光
                    const tw = Math.abs(Math.sin(now / 200));
                    g.fillStyle(a, tw * fade);
                    for (let t = 0; t < 4; t++)
                        g.fillCircle(px - 3 + t * 2, py - 2.4 + Math.abs(t - 1.5) * 0.8, 0.8);
                }
            }
            const head = pts[pts.length - 1]; // 球头：一枚发光猫首印
            g.fillStyle(c, 0.8 * fade);
            g.fillCircle(head.x, head.y, 5.4);
            g.fillStyle(c, 0.9 * fade); // 双耳
            g.fillPoints([{ x: head.x - 4, y: head.y - 3 }, { x: head.x - 3, y: head.y - 8 }, { x: head.x - 0.6, y: head.y - 4 }], true);
            g.fillPoints([{ x: head.x + 4, y: head.y - 3 }, { x: head.x + 3, y: head.y - 8 }, { x: head.x + 0.6, y: head.y - 4 }], true);
            g.fillStyle(a, fade); // 灵眼
            g.fillRect(head.x - 3, head.y - 1, 2, 1.2);
            g.fillRect(head.x + 1, head.y - 1, 2, 1.2);
        } },
    btlTrailA: { c: 0x7dff5a, a: 0xc8a832, draw: (ctx, c, a) => {
            // 花粉拖尾：金黄花粉云 + 粒子飘散
            const { g, pts, fade, now } = ctx;
            for (let k = 0; k < pts.length - 1; k++) { // 花粉云带
                const p0 = pts[k], p1 = pts[k + 1];
                const age = k / (pts.length - 1);
                const w = (4 + age * 8) * fade;
                g.lineStyle(w, 0xd8e878, (0.18 + age * 0.2) * fade);
                g.beginPath();
                g.moveTo(p0.x, p0.y);
                g.lineTo(p1.x, p1.y);
                g.strokePath();
            }
            for (let k = 0; k < 12; k++) { // 花粉粒（无序漂浮）
                const i = Math.floor(((k + 0.1) / 12) * (pts.length - 1));
                const p = pts[i];
                const ph = now / 700 + k * 1.9;
                const dx = Math.sin(ph) * 8, dy = Math.cos(ph * 1.4) * 6;
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(ph * 2));
                g.fillStyle(k % 3 ? c : a, tw * 0.8 * fade);
                g.fillCircle(p.x + dx, p.y + dy, 1.2 + (k % 2) * 0.8);
            }
            const head = pts[pts.length - 1]; // 球头：花蕊闪核
            const gl = 0.6 + 0.4 * Math.sin(now / 250);
            g.fillStyle(a, gl * 0.4 * fade);
            g.fillCircle(head.x, head.y, 7);
            g.fillStyle(0xfff0b0, fade);
            g.fillCircle(head.x, head.y, 3.2);
            g.fillStyle(0xffffff, fade);
            g.fillCircle(head.x - 1, head.y - 1, 1.2);
        } },
    btlTrailB: { c: 0xc8a832, a: 0x7dff5a, draw: (ctx, c, a) => {
            // 甲光拖尾：金绿渐变的鞘翅光带 + 掠过的翅影格
            const { g, pts, fade, now } = ctx;
            for (let k = 0; k < pts.length - 1; k++) { // 双层光带
                const p0 = pts[k], p1 = pts[k + 1];
                const age = k / (pts.length - 1);
                g.lineStyle((3 + age * 7) * fade, c, (0.3 + age * 0.4) * fade);
                g.beginPath();
                g.moveTo(p0.x, p0.y);
                g.lineTo(p1.x, p1.y);
                g.strokePath();
                g.lineStyle((1.4 + age * 2.6) * fade, a, (0.4 + age * 0.4) * fade);
                g.beginPath();
                g.moveTo(p0.x, p0.y - 2.4);
                g.lineTo(p1.x, p1.y - 2.4);
                g.strokePath();
            }
            for (let k = 0; k < 6; k++) { // 掠过的翅影斜格（沿轨迹流动）
                const ph = (now / 400 + k / 6) % 1;
                const i = Math.floor(ph * (pts.length - 1));
                const p = pts[i];
                g.save();
                g.translateCanvas(p.x, p.y);
                g.rotateCanvas(-0.5);
                g.fillStyle(0xe8cc5a, 0.4 * fade);
                g.fillRect(-1.4, -6, 2.8, 12);
                g.restore();
            }
            const head = pts[pts.length - 1]; // 球头：金甲珠
            const gl = 0.6 + 0.4 * Math.sin(now / 300);
            g.fillStyle(c, 0.7 * fade);
            g.fillCircle(head.x, head.y, 5.6);
            g.fillStyle(a, gl * fade);
            g.fillCircle(head.x, head.y - 1, 3);
            g.fillStyle(0xffffff, 0.6 * fade);
            g.fillCircle(head.x - 1.4, head.y - 2, 1.2);
        } },
};
