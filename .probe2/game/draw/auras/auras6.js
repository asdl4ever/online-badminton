import { apoly, aline, TAU } from './shared.js';
/**
 * 补遗批二：纯主题宝箱 / 活动里程碑光环 32 款 → 背景特效。
 * 原本走 THEME_AURAS 模板表或老 switch，这里逐款独立构图。
 */
export const AURAS_6 = {
    haloRing: { a: 0xfff6d0, draw: (g, now, c, a) => {
            // 圣环：头顶悬浮的圣光环 + 光尘下落
            const ry = -108 + Math.sin(now / 700) * 5;
            g.fillStyle(c, 0.2);
            g.fillEllipse(0, ry, 88, 22);
            g.lineStyle(5, c, 0.75);
            g.strokeEllipse(0, ry, 76, 18);
            g.lineStyle(2, a, 0.8);
            g.strokeEllipse(0, ry, 60, 13);
            for (let k = 0; k < 5; k++) {
                const ph = (now / 1200 + k / 5) % 1;
                g.fillStyle(a, 0.6 * (1 - ph));
                g.fillCircle(Math.sin(k * 2.4) * 40, ry + 20 + ph * 120, 1.8 * (1 - ph) + 0.4);
            }
        } },
    hexflame: { a: 0x2a8a6a, draw: (g, now, c, _a) => {
            // 鬼火：三团青磷火飘忽明灭
            for (let k = 0; k < 3; k++) {
                const ph = now / 1100 + k * 2.1;
                const fx = Math.sin(ph) * 44 + (k - 1) * 18;
                const fy = -20 + Math.sin(ph * 1.4) * 40;
                const gl = 0.5 + 0.5 * Math.sin(now / 260 + k * 2.3);
                g.fillStyle(c, gl * 0.3);
                g.fillEllipse(fx, fy, 20, 30);
                g.fillStyle(k % 2 ? 0xd0fff0 : c, gl * 0.85);
                g.fillEllipse(fx, fy + 4, 10, 16);
                g.fillStyle(0xffffff, gl * 0.8);
                g.fillCircle(fx, fy + 8, 2.4);
            }
        } },
    bubblefield: { a: 0xdff6ff, draw: (g, now, c, a) => {
            // 泡泡田：大群慢泡泡田般漂浮
            for (let k = 0; k < 10; k++) {
                const ph = (now / 2600 + k / 10) % 1;
                const bx = -90 + ((k * 41) % 180) + Math.sin(now / 700 + k * 2) * 10;
                const by = 80 - ph * 220;
                const r = 4 + (k % 4) * 3.4;
                g.lineStyle(1.6, k % 3 ? c : a, 0.6 * (1 - ph * 0.4));
                g.strokeCircle(bx, by, r);
                g.fillStyle(0xffffff, 0.6 * (1 - ph * 0.4));
                g.fillCircle(bx - r * 0.3, by - r * 0.3, r * 0.2);
            }
        } },
    prismatic: { a: 0x8ad8ff, draw: (g, now, _c, _a) => {
            // 棱彩：环身折射的彩光斑带
            const cols = [0xff5a5a, 0xffd45c, 0x7dffc4, 0x5ac8ff, 0xff9adf];
            for (let k = 0; k < 5; k++) {
                const ph = (now / 900 + k / 5) % 1;
                g.fillStyle(cols[k], 0.4 * Math.sin(ph * Math.PI));
                g.fillEllipse(-80 + ph * 160, -60 + k * 30 + Math.sin(ph * 6 + k) * 8, 40, 10);
            }
            for (let k = 0; k < 5; k++) {
                const tw = 0.5 + 0.5 * Math.sin(now / 240 + k * 1.6);
                g.fillStyle(cols[(k + 2) % 5], 0.8 * tw);
                g.fillCircle(Math.cos(k * 1.26 + now / 1500) * 62, -10 + Math.sin(k * 1.26 + now / 1500) * 82, 2.6);
            }
        } },
    snowstorm: { a: 0xffffff, draw: (g, now, c, a) => {
            // 风雪：斜向猛吹的雪幕
            for (let k = 0; k < 4; k++) {
                const ph = (now / 350 + k / 4) % 1;
                g.lineStyle(2.6, k % 2 ? c : a, (1 - ph) * 0.45);
                g.lineBetween(-110 + ph * 220, -90 + k * 40, -60 + ph * 220, -104 + k * 40);
            }
            for (let k = 0; k < 9; k++) {
                const ph = (now / 300 + k / 9) % 1;
                const sx = -110 + ph * 240;
                const sy = -120 + (k * 31) % 240 + Math.sin(ph * 9 + k) * 8;
                g.fillStyle(k % 2 ? c : a, 0.8 * (1 - ph));
                g.fillCircle(sx, sy, 1.6 + (k % 3));
            }
        } },
    starfield: { a: 0xffffff, draw: (g, now, c, a) => {
            // 星野：身后一整片深空星野
            g.fillStyle(0x1a1a3a, 0.35);
            g.fillCircle(0, -20, 100);
            for (let k = 0; k < 12; k++) {
                const tw = 0.3 + 0.7 * Math.abs(Math.sin(now / 300 + k * 1.7));
                const px = -90 + (k * 37) % 180, py = -110 + (k * 53) % 220;
                g.fillStyle(k % 3 ? c : a, tw);
                g.fillRect(px, py, 1.8, 1.8);
                if (k % 4 === 0) {
                    g.fillStyle(a, tw * 0.7);
                    g.fillRect(px - 3, py + 0.4, 7.8, 1);
                    g.fillRect(px + 0.4, py - 3, 1, 7.8);
                }
            }
        } },
    voidRift: { a: 0x9b5cff, draw: (g, now, c, a) => {
            // 虚空裂隙：身后一道竖直空间裂缝，紫光外泄
            const w = 7 + Math.sin(now / 300) * 2;
            g.fillStyle(c, 0.25);
            apoly(g, [[-w - 6, -140], [w + 6, -120], [w + 3, 40], [-w - 3, 60]], c, 0.25);
            g.fillStyle(0x0a0514, 0.9);
            apoly(g, [[-w, -136], [w, -118], [w * 0.7, 36], [-w * 0.7, 54]], 0x0a0514, 0.9);
            g.lineStyle(2, a, 0.7);
            g.beginPath();
            g.moveTo(-w, -136);
            g.lineTo(w, -118);
            g.lineTo(w * 0.7, 36);
            g.lineTo(-w * 0.7, 54);
            g.closePath();
            g.strokePath();
            for (let k = 0; k < 4; k++) {
                const ph = (now / 700 + k / 4) % 1;
                g.fillStyle(a, 0.7 * (1 - ph));
                g.fillCircle(Math.sin(k * 2.2) * 30, -60 + ph * 100, 2 * (1 - ph) + 0.4);
            }
        } },
    blackhole: { a: 0xffb347, draw: (g, now, c, a) => {
            // 黑洞：吸积盘 + 被吸入的光点
            g.fillStyle(c, 0.25);
            g.fillEllipse(0, -16, 150, 44);
            g.fillStyle(0x0a0514, 0.95);
            g.fillCircle(0, -16, 30);
            g.lineStyle(3, a, 0.7);
            g.beginPath();
            g.arc(0, -16, 38, now / 700, now / 700 + 4.4);
            g.strokePath();
            g.lineStyle(1.6, c, 0.5);
            g.beginPath();
            g.arc(0, -16, 50, -now / 500, -now / 500 + 3.6);
            g.strokePath();
            for (let k = 0; k < 4; k++) {
                const ph = (now / 900 + k / 4) % 1;
                const ang = ph * 4 + k * 1.7;
                const r = 90 * (1 - ph) + 32;
                g.fillStyle(0xffffff, 0.8 * (1 - ph * 0.5));
                g.fillCircle(Math.cos(ang) * r, -16 + Math.sin(ang) * r * 0.4, 1.6 * (1 - ph) + 0.5);
            }
        } },
    supernova: { a: 0xffffff, draw: (g, now, c, a) => {
            // 超新星：周期性爆发的冲击环 + 放射光
            const ph = (now / 1600) % 1;
            const r = 20 + ph * 90;
            g.lineStyle(4 * (1 - ph) + 1, c, 0.8 * (1 - ph));
            g.strokeCircle(0, -20, r);
            g.lineStyle(2, a, 0.5 * (1 - ph));
            g.strokeCircle(0, -20, r * 0.7);
            for (let k = 0; k < 8; k++) {
                const ang = (k / 8) * TAU + 0.4;
                const len = 30 + ph * 60;
                aline(g, [[Math.cos(ang) * 24, -20 + Math.sin(ang) * 24], [Math.cos(ang) * len, -20 + Math.sin(ang) * len]], 2.4, k % 2 ? c : a, 0.7 * (1 - ph));
            }
            g.fillStyle(0xffffff, 0.9 * (1 - ph * 0.6));
            g.fillCircle(0, -20, 10 - ph * 5);
        } },
    quantum: { a: 0xb0fff0, draw: (g, now, c, a) => {
            // 量子：两态叠加的虚影交替闪现
            for (let k = 0; k < 2; k++) {
                const gl = Math.max(0, Math.sin(now / 340 + k * Math.PI));
                const ox = k ? 18 : -18;
                g.lineStyle(2, k ? a : c, gl * 0.7);
                g.strokeEllipse(ox, -10, 70, 130);
                g.fillStyle(k ? c : a, gl * 0.4);
                g.fillCircle(ox, -10, 20);
            }
            g.lineStyle(1.2, a, 0.4);
            g.beginPath();
            g.arc(0, -10, 88, now / 600, now / 600 + 2.4);
            g.strokePath();
            g.beginPath();
            g.arc(0, -10, 88, now / 600 + Math.PI, now / 600 + Math.PI + 2.4);
            g.strokePath();
        } },
    laserscan: { a: 0xff8a9a, draw: (g, now, c, a) => {
            // 激光：上下往复的扫描线 + 网格
            g.lineStyle(1, c, 0.2);
            for (let k = 0; k < 5; k++)
                g.lineBetween(-70 + k * 35, -120, -70 + k * 35, 110);
            for (let k = 0; k < 6; k++)
                g.lineBetween(-80, -100 + k * 40, 80, -100 + k * 40);
            const sy = -110 + ((now / 700) % 1) * 220;
            g.fillStyle(a, 0.18);
            g.fillRect(-80, sy - 8, 160, 16);
            g.lineStyle(2.4, a, 0.85);
            g.lineBetween(-80, sy, 80, sy);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(Math.sin(now / 400) * 70, sy, 2.4);
        } },
    holo: { a: 0xbfe8ff, draw: (g, now, c, a) => {
            // 全息：环身的全息网格 + 上升的数据块
            g.fillStyle(c, 0.1);
            g.fillRect(-70, -110, 140, 220);
            g.lineStyle(1, a, 0.35);
            for (let k = 0; k < 6; k++)
                g.lineBetween(-60 + k * 24, -110, -60 + k * 24, 110);
            for (let k = 0; k < 7; k++) {
                const ph = (now / 500 + k / 7) % 1;
                g.lineStyle(1, k % 2 ? c : a, 0.5 * Math.sin(ph * Math.PI));
                g.lineBetween(-70, -110 + ph * 220, 70, -110 + ph * 220);
            }
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1200 + k / 3) % 1;
                g.fillStyle(0xffffff, 0.6 * (1 - ph));
                g.fillRect(-40 + k * 34, 80 - ph * 190, 8, 5);
            }
        } },
    crystalline: { a: 0x5ac8ff, draw: (g, now, c, a) => {
            // 晶簇：身后一丛水晶簇
            const crystals = [[-52, 80, 20, 120], [-18, 90, 30, 170], [16, 86, 24, 140], [48, 76, 18, 100]];
            crystals.forEach(([bx, by, w, h], k) => {
                const gl = 0.4 + 0.25 * Math.sin(now / 480 + k * 1.5);
                g.save();
                g.translateCanvas(bx, by);
                g.rotateCanvas((k - 1.5) * 0.16);
                apoly(g, [[-w / 2, 0], [0, -h], [w / 2, 0]], k % 2 ? c : a, gl);
                apoly(g, [[-w / 2, 0], [0, -h], [0, 0]], 0xffffff, gl * 0.4);
                g.restore();
            });
        } },
    wisteria: { a: 0xe8d8ff, draw: (g, now, c, a) => {
            // 紫藤：垂落的紫藤花串
            for (let k = 0; k < 4; k++) {
                const vx = -54 + k * 36;
                const sway = Math.sin(now / 700 + k) * 4;
                g.lineStyle(1.6, 0x6a4a8a, 0.5);
                g.lineBetween(vx, -130, vx + sway, -40);
                for (let s = 0; s < 5; s++) {
                    const fy = -116 + s * 18 + Math.sin(now / 700 + k) * 3 * (s / 4);
                    g.fillStyle(s % 2 ? c : a, 0.75);
                    g.fillEllipse(vx + sway * (s / 4), fy, 7, 11);
                }
            }
        } },
    coral: { a: 0xffb0bc, draw: (g, now, c, a) => {
            // 珊瑚：身后两侧的珊瑚枝 + 上浮的氧泡
            for (let k = 0; k < 2; k++) {
                const side = k ? 1 : -1;
                g.lineStyle(5, k ? c : a, 0.6);
                g.lineBetween(side * 40, 80, side * 46, 20);
                g.lineBetween(side * 46, 20, side * 62, -16);
                g.lineBetween(side * 46, 20, side * 34, -8);
                g.lineStyle(3, k ? a : c, 0.55);
                g.lineBetween(side * 62, -16, side * 70, -38);
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 1100 + k / 4) % 1;
                g.lineStyle(1.4, 0xffffff, 0.6 * (1 - ph));
                g.strokeCircle(Math.sin(k * 2.2) * 30, 40 - ph * 130, 2.4 * (1 - ph) + 0.8);
            }
        } },
    beacon: { a: 0xd8ffd0, draw: (g, now, c, _a) => {
            // 幽绿信标：脚下信标灯 + 环身螺旋光带（外星人降临）
            g.fillStyle(0x0a2a1a, 0.6);
            g.fillEllipse(0, 80, 60, 16);
            g.lineStyle(3, 0x39ff8a, 0.7);
            g.strokeEllipse(0, 80, 48, 12);
            for (let k = 0; k < 3; k++) {
                const pts = [];
                for (let s = 0; s <= 14; s++) {
                    const u = s / 14;
                    const ang = u * 5 + now / 600 + (k / 3) * TAU;
                    pts.push([Math.cos(ang) * (14 + u * 48), 80 - u * 170]);
                }
                aline(g, pts, 2.2 - k * 0.4, k % 2 ? 0x39ff8a : c, 0.55);
            }
        } },
    spiral: { a: 0xd8b0ff, draw: (g, now, c, a) => {
            // 螺旋星系：背后旋转的双旋臂星系
            for (let arm = 0; arm < 2; arm++) {
                const pts = [];
                for (let s = 0; s <= 18; s++) {
                    const u = s / 18;
                    const ang = u * 4.2 + now / 2000 + arm * Math.PI;
                    const r = 6 + u * 74;
                    pts.push([Math.cos(ang) * r, -16 + Math.sin(ang) * r * 0.85]);
                }
                g.lineStyle(8 - arm * 3, arm ? a : c, 0.3);
                aline(g, pts, arm ? 4 : 8, arm ? a : c, 0.35);
            }
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(0, -16, 5);
            g.fillStyle(c, 0.4);
            g.fillCircle(0, -16, 12);
        } },
    phantom: { a: 0xb0c4e8, draw: (g, now, c, a) => {
            // 幻影：多重残影轮廓错位闪现
            for (let k = 0; k < 3; k++) {
                const ph = now / 700 + k * 0.8;
                const ox = Math.sin(ph) * (10 + k * 8);
                const al = 0.35 - k * 0.1;
                g.lineStyle(2, k % 2 ? c : a, al);
                g.strokeEllipse(ox, -12 + Math.cos(ph * 1.3) * 5, 44, 110);
                g.strokeCircle(ox, -52 + Math.cos(ph * 1.3) * 5, 14);
            }
        } },
    miasma: { a: 0x6a9a1a, draw: (g, now, c, a) => {
            // 瘴气：环身翻涌的毒雾
            for (let k = 0; k < 5; k++) {
                const ph = (now / 2000 + k / 5) % 1;
                const mx = Math.sin(ph * TAU + k * 1.3) * 44;
                const my = 50 - ph * 130;
                g.fillStyle(k % 2 ? c : a, 0.2 * Math.sin(ph * Math.PI));
                g.fillEllipse(mx, my, 60, 34);
            }
            for (let k = 0; k < 3; k++) {
                const ph = (now / 800 + k / 3) % 1;
                g.fillStyle(0x4a7a0a, 0.6 * (1 - ph));
                g.fillCircle(Math.sin(k * 2.4) * 34, 60 - ph * 150, 2.2 * (1 - ph) + 0.6);
            }
        } },
    laurel: { a: 0x8fbf5a, draw: (g, now, c, a) => {
            // 桂冠：环身的月桂枝 + 金光
            for (let k = 0; k < 2; k++) {
                const side = k ? 1 : -1;
                for (let s = 0; s < 6; s++) {
                    const ang = -0.7 + s * 0.36;
                    const px = side * Math.cos(ang) * 62;
                    const py = -20 + Math.sin(ang) * 76;
                    g.save();
                    g.translateCanvas(px, py);
                    g.rotateCanvas(side * (ang + Math.PI / 2) + Math.PI);
                    apoly(g, [[0, 0], [11, -3], [14, 3], [3, 5]], s % 2 ? c : a, 0.8);
                    g.restore();
                }
            }
            const tw = 0.5 + 0.5 * Math.sin(now / 500);
            g.fillStyle(0xffe89a, 0.5 * tw);
            g.fillCircle(0, -30, 14);
        } },
    emberfall: { a: 0x3a2a2a, draw: (g, now, c, _a) => {
            // 落烬：缓缓下坠的暗火星
            for (let k = 0; k < 8; k++) {
                const ph = (now / 1800 + k / 8) % 1;
                const gl = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k * 1.9));
                g.fillStyle(k % 2 ? c : 0xffd45c, gl * Math.sin(ph * Math.PI));
                g.fillCircle(Math.sin(k * 2.7) * 52 + Math.sin(ph * 4 + k) * 8, -140 + ph * 260, 1.4 + gl * (1 - ph) + 0.4);
            }
        } },
    static: { a: 0xffffff, draw: (g, now, c, a) => {
            // 静电：环身噼啪的静电弧 + 电离光斑
            for (let k = 0; k < 4; k++) {
                const a0 = now / 100 + k * 1.57;
                const cx = Math.cos(a0) * 54, cy = -10 + Math.sin(a0) * 76;
                for (let s = 0; s < 2; s++) {
                    const dx = Math.sin(now / 55 + k * 3 + s * 2) * 16;
                    const dy = Math.cos(now / 48 + k + s) * 14;
                    aline(g, [[cx, cy], [cx + dx, cy + dy]], 1.6, s ? a : c, 0.75);
                }
                g.fillStyle(c, 0.25);
                g.fillCircle(cx, cy, 5);
            }
        } },
    tidalwave: { a: 0xbfe8ff, draw: (g, now, c, a) => {
            // 怒涛：身后扑起的高浪
            const lift = Math.sin(now / 800) * 8;
            g.fillStyle(c, 0.4);
            g.beginPath();
            g.moveTo(-100, 90);
            g.lineTo(-100, -20 + lift);
            for (let s = 0; s <= 8; s++) {
                const u = s / 8;
                g.lineTo(-100 + u * 200, -20 + lift - Math.sin(u * Math.PI) * 46 - Math.sin(u * 9 + now / 300) * 6);
            }
            g.lineTo(100, 90);
            g.closePath();
            g.fillPath();
            g.lineStyle(3, a, 0.7);
            g.beginPath();
            for (let s = 0; s <= 8; s++) {
                const u = s / 8;
                const px = -100 + u * 200;
                const py = -20 + lift - Math.sin(u * Math.PI) * 46 - Math.sin(u * 9 + now / 300) * 6;
                if (s === 0)
                    g.moveTo(px, py);
                else
                    g.lineTo(px, py);
            }
            g.strokePath();
            for (let k = 0; k < 4; k++) {
                const ph = (now / 600 + k / 4) % 1;
                g.fillStyle(0xffffff, 0.8 * (1 - ph));
                g.fillCircle(-60 + k * 40, -66 + lift - Math.sin((k / 3) * Math.PI) * 40 + ph * 20, 2.4 * (1 - ph) + 0.5);
            }
        } },
    sandstorm: { a: 0xc9a04a, draw: (g, now, c, a) => {
            // 沙暴：环身滚动的沙墙
            for (let k = 0; k < 4; k++) {
                const ph = (now / 700 + k / 4) % 1;
                const wx = -110 + ph * 220;
                g.fillStyle(k % 2 ? c : a, 0.22 * Math.sin(ph * Math.PI));
                g.fillEllipse(wx, -30 + (k % 2) * 40, 70, 90);
            }
            for (let k = 0; k < 8; k++) {
                const ph = (now / 260 + k / 8) % 1;
                g.fillStyle(c, 0.7 * (1 - ph));
                g.fillCircle(-110 + ph * 220, -110 + (k * 29) % 220 + Math.sin(ph * 7 + k) * 8, 1.6);
            }
        } },
    auroraring: { a: 0x9ad4ff, draw: (g, now, c, a) => {
            // 极光环：环身一圈流动的极光环带
            for (let k = 0; k < 3; k++) {
                g.lineStyle(5 - k, [c, a, 0x9b5cff][k], 0.4 - k * 0.08);
                g.beginPath();
                const seg = 20;
                for (let s = 0; s <= seg; s++) {
                    const u = s / seg;
                    const ang = u * TAU + now / 1400;
                    const wobble = Math.sin(u * 6 + now / 400 + k) * 8;
                    const px = Math.cos(ang) * (66 + wobble);
                    const py = -10 + Math.sin(ang) * (88 + wobble);
                    if (s === 0)
                        g.moveTo(px, py);
                    else
                        g.lineTo(px, py);
                }
                g.closePath();
                g.strokePath();
            }
        } },
    singularity: { a: 0xffb347, draw: (g, now, c, a) => {
            // 奇点：极致收缩的光点 + 吞噬环
            g.fillStyle(0x0a0514, 0.95);
            g.fillCircle(0, -16, 16);
            const p1 = 0.5 + 0.5 * Math.sin(now / 300);
            g.lineStyle(2.4, c, 0.7);
            g.strokeCircle(0, -16, 20 + p1 * 4);
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1000 + k / 3) % 1;
                const r = 100 * (1 - ph) + 18;
                const ang = ph * 5 + k * 2.1;
                g.lineStyle(1.6, a, 0.7 * (1 - ph));
                g.beginPath();
                g.arc(0, -16, r, ang, ang + 1.2);
                g.strokePath();
            }
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(0, -16, 2.4);
        } },
    rebirth: { a: 0xffd45c, draw: (g, now, c, a) => {
            // 涅槃：身后展开的火翼 + 升腾的火羽
            for (let k = 0; k < 2; k++) {
                const side = k ? 1 : -1;
                apoly(g, [
                    [side * 8, 20], [side * 52, -30], [side * 88, -60], [side * 62, -34], [side * 76, -20], [side * 40, -6], [side * 12, 40],
                ], k ? c : 0xff8a3a, 0.4);
            }
            for (let k = 0; k < 6; k++) {
                const ph = (now / 700 + k / 6) % 1;
                g.fillStyle(k % 2 ? a : c, 0.7 * (1 - ph));
                g.fillEllipse(Math.sin(k * 2.4) * 36, 70 - ph * 190, 5, 12 * (1 - ph) + 3);
            }
        } },
    spotlight: { a: 0xffffff, draw: (g, now, c, a) => {
            // 训练聚光灯：头顶打下的聚光锥 + 地面光斑（发球机里程碑）
            g.fillStyle(c, 0.14);
            apoly(g, [[-14, -160], [14, -160], [66, 84], [-66, 84]], c, 0.14);
            g.fillStyle(c, 0.1);
            apoly(g, [[-7, -160], [7, -160], [40, 84], [-40, 84]], 0xffffff, 0.12);
            const p1 = 0.5 + 0.5 * Math.sin(now / 600);
            g.fillStyle(c, 0.2 + 0.08 * p1);
            g.fillEllipse(0, 82, 120, 22);
            g.lineStyle(2, a, 0.5 + 0.2 * p1);
            g.strokeEllipse(0, 82, 96, 16);
            g.fillStyle(0xffffff, 0.5);
            g.fillCircle(0, -160, 7);
        } },
    dorsal: { a: 0x5ac8ff, draw: (g, now, c, a) => {
            // 背鳍光焰：背后哥斯拉背鳍剪影，泛原子蓝光（哥斯拉来袭）
            const fins = [[-40, 26], [-12, 44], [18, 38], [44, 22]];
            fins.forEach(([fx, fh], k) => {
                const gl = 0.55 + 0.35 * Math.sin(now / 260 + k * 1.4);
                apoly(g, [
                    [fx - 13, 70], [fx - 4, 70 - fh], [fx + 5, 70 - fh - 8], [fx + 13, 70],
                ], k % 2 ? c : a, gl * 0.65);
                aline(g, [[fx - 4, 70 - fh], [fx + 5, 70 - fh - 8]], 2, 0xffffff, gl * 0.5);
            });
            g.fillStyle(c, 0.1 + 0.06 * Math.sin(now / 300));
            g.fillEllipse(0, 20, 130, 130);
        } },
    shardglow: { a: 0x5ac8ff, draw: (g, now, c, a) => {
            // 碎晶光环：环身漂浮的发光碎晶（碎片兑换专属）
            for (let k = 0; k < 6; k++) {
                const ang = (k / 6) * TAU + now / 2200;
                const px = Math.cos(ang) * 58, py = -10 + Math.sin(ang) * 82;
                const gl = 0.5 + 0.5 * Math.sin(now / 300 + k * 2);
                const s = 5 + gl * 3;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(ang + Math.sin(now / 700 + k) * 0.3);
                apoly(g, [[0, -s], [s * 0.6, 0], [0, s], [-s * 0.6, 0]], k % 2 ? c : a, 0.5 + gl * 0.4);
                apoly(g, [[0, -s], [s * 0.6, 0], [0, 0]], 0xffffff, gl * 0.5);
                g.restore();
                g.fillStyle(c, 0.15 * gl);
                g.fillCircle(px, py, s + 4);
            }
        } },
    dranebula: { a: 0x9b5cff, draw: (g, now, c, a) => {
            // 龙星云气：宇宙龙域——身后一条盘绕的星云气龙影
            const segs = [];
            for (let s = 0; s <= 12; s++) {
                const u = s / 12;
                const ang = u * 4.6 + now / 2400;
                segs.push([Math.cos(ang) * (14 + u * 52), -20 + Math.sin(ang) * (12 + u * 46) - u * 30]);
            }
            for (let s = 1; s < segs.length; s++) {
                const [x1, y1] = segs[s];
                const r = 3 + (s / segs.length) * 9;
                g.fillStyle(s % 2 ? c : a, 0.3);
                g.fillCircle(x1, y1, r);
            }
            const [hx, hy] = segs[segs.length - 1];
            g.fillStyle(c, 0.7);
            g.fillCircle(hx, hy, 7);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(hx - 2, hy - 1, 1.6);
            g.fillCircle(hx + 2, hy - 1, 1.6);
            for (let k = 0; k < 5; k++) {
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 280 + k * 1.8));
                g.fillStyle(0xffffff, tw);
                g.fillCircle(-70 + (k * 34) % 140, -100 + (k * 43) % 160, 1.4);
            }
        } },
    runAura: { a: 0xffffff, draw: (g, now, c, a) => {
            // 冲线光环：脚下终点线 + 环身的速度光带（操场跑量里程碑）
            g.fillStyle(0xffffff, 0.55);
            for (let k = 0; k < 4; k++)
                g.fillRect(-56 + k * 30, 78, 14, 7);
            for (let k = 0; k < 4; k++) {
                const ph = (now / 400 + k / 4) % 1;
                g.fillStyle(k % 2 ? c : a, 0.4 * (1 - ph));
                g.fillRect(-100 + ph * 200, -70 + k * 40, 26, 5);
            }
            g.lineStyle(2, c, 0.5);
            g.strokeEllipse(0, 80, 130, 22);
        } },
};
