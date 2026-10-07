import { apoly, TAU } from './shared.js';
/** 新批次主题光环（上古神话 / 重装机甲）重绘。(0,0) = 角色躯干中心，画在身后。 */
export const AURAS_7 = {
    shnAuraA: { c: 0xffe08a, a: 0xffd45c, draw: (g, now, c, a) => {
            // 造化灵光：身后一座悬空造化玉碟——主碟 + 反光碟影 + 环身灵符符文环绕 + 金尘涌泉
            const bob = Math.sin(now / 900) * 5;
            const rot = now / 1600;
            // 玉碟（背后大盘，多层椭圆造纵深感）
            g.fillStyle(0x3a2208, 0.35);
            g.fillEllipse(0, -34 + bob, 150, 40);
            g.fillStyle(c, 0.22);
            g.fillEllipse(0, -36 + bob, 132, 34);
            g.lineStyle(3, a, 0.7);
            g.strokeEllipse(0, -36 + bob, 120, 30);
            g.lineStyle(1.4, 0xfff6d8, 0.5);
            g.strokeEllipse(0, -36 + bob, 88, 22);
            // 碟面符文环（绕碟旋转的卦纹刻痕）
            for (let k = 0; k < 8; k++) {
                const ang = rot + (k / 8) * TAU;
                const px = Math.cos(ang) * 52, py = -36 + bob + Math.sin(ang) * 13;
                g.lineStyle(1.6, k % 2 ? a : 0xfff6d8, 0.75);
                g.lineBetween(px - 3, py, px + 3, py);
                g.fillStyle(0xfff6d8, 0.6);
                g.fillRect(px - 0.5, py - 2.4, 1, 1.6);
            }
            // 碟心太极轮（双色半轮反向旋转）
            for (const s of [-1, 1]) {
                const vs = [];
                for (let k = 0; k <= 10; k++) {
                    const ang = rot * 1.4 + (s > 0 ? 0 : Math.PI) - (k / 10) * Math.PI * s;
                    vs.push({ x: Math.cos(ang) * 15, y: -36 + bob + Math.sin(ang) * 4.4 });
                }
                g.fillStyle(s > 0 ? a : 0x2a4a6a, 0.75);
                g.fillPoints(vs, true);
            }
            g.fillStyle(0xffffff, 0.85);
            g.fillCircle(0, -36 + bob, 1.8);
            // 环身灵符（四道竖符光带随呼吸明灭）
            const runes = [[-64, -46, 30], [64, -50, 26], [-50, 34, 22], [54, 30, 24]];
            runes.forEach(([rx, ry, rh], k) => {
                const gl = 0.4 + 0.3 * Math.sin(now / 380 + k * 1.7);
                g.fillStyle(a, gl * 0.3);
                g.fillRect(rx - 4, ry, 8, rh);
                g.lineStyle(1.4, k % 2 ? 0xfff6d8 : a, gl);
                for (let s = 0; s < 3; s++)
                    g.lineBetween(rx - 3, ry + 5 + s * (rh - 8) / 2, rx + 3, ry + 3 + s * (rh - 8) / 2);
                g.fillStyle(0xffffff, gl * 0.7);
                g.fillCircle(rx, ry - 3, 1.4);
            });
            // 金尘涌泉（从脚下向上喷涌再散落）
            for (let k = 0; k < 7; k++) {
                const ph = (now / 1300 + k / 7) % 1;
                const gx = Math.sin(k * 2.7) * 46 + Math.sin(ph * 6 + k) * 10;
                const gy = 84 - ph * 210 - Math.sin(ph * Math.PI) * 24;
                g.fillStyle(k % 2 ? a : 0xfff6d8, 0.75 * Math.sin(ph * Math.PI));
                g.fillCircle(gx, gy, 2.2 * (1 - ph * 0.6) + 0.4);
            }
        } },
    shnAuraB: { c: 0x9fd0ff, a: 0xffd45c, draw: (g, now, c, a) => {
            // 周天星斗阵：身后整幅旋转星斗大阵——夜幕底色 + 三重异速星环 + 连线星宫 + 北斗垂光 + 流星
            g.fillStyle(0x141c34, 0.4);
            g.fillCircle(0, -16, 104);
            const rot = now / 2600;
            for (let ring = 0; ring < 3; ring++) {
                const rr = 42 + ring * 27;
                const dir = ring % 2 ? -1 : 1;
                g.lineStyle(1.6, ring === 1 ? a : c, 0.4);
                g.strokeCircle(0, -12, rr);
                const n = 4 + ring * 3;
                for (let k = 0; k < n; k++) {
                    const ang = rot * dir * (1 + ring * 0.4) + (k / n) * TAU;
                    const px = Math.cos(ang) * rr, py = -12 + Math.sin(ang) * rr * 1.12;
                    const tw = 0.45 + 0.55 * Math.abs(Math.sin(now / 240 + k * 1.7 + ring * 2));
                    // 主星 + 十字光芒（大星）或菱形微光（小星）
                    if (k % 3 === 0) {
                        g.fillStyle(0xffffff, tw);
                        g.fillRect(px - 4, py - 0.6, 8, 1.2);
                        g.fillRect(px - 0.6, py - 4, 1.2, 8);
                        g.fillStyle(ring === 1 ? a : c, tw * 0.5);
                        g.fillCircle(px, py, 3.4);
                    }
                    else {
                        g.fillStyle(0xfff6d8, tw);
                        apoly(g, [[px, py - 2.4], [px + 1.4, py], [px, py + 2.4], [px - 1.4, py]], 0xfff6d8, tw);
                    }
                }
            }
            // 连线星宫（内环星点按相位连线成宫）
            const palace = [];
            for (let k = 0; k < 7; k++) {
                const ang = rot * 0.7 + (k / 7) * TAU + 0.5;
                palace.push([Math.cos(ang) * 34, -14 + Math.sin(ang) * 38]);
            }
            g.lineStyle(1, a, 0.4);
            g.beginPath();
            palace.forEach(([px, py], k) => (k === 0 ? g.moveTo(px, py) : g.lineTo(px, py)));
            g.closePath();
            g.strokePath();
            // 北斗七星（高位斜挂，连线 + 垂光）
            const dipper = [[-46, -88], [-28, -102], [-8, -92], [14, -106], [34, -90], [50, -66], [30, -60]];
            g.lineStyle(1.4, a, 0.55);
            g.beginPath();
            dipper.forEach(([px, py], k) => (k === 0 ? g.moveTo(px, py) : g.lineTo(px, py)));
            g.strokePath();
            dipper.forEach(([px, py], k) => {
                const tw = 0.5 + 0.5 * Math.abs(Math.sin(now / 300 + k * 1.3));
                g.fillStyle(0xffffff, tw * 0.95);
                g.fillCircle(px, py, 2.2);
                g.fillStyle(a, tw * 0.3);
                g.fillCircle(px, py, 4.4);
                // 星光垂丝
                g.fillStyle(0xfff6d8, tw * 0.35);
                g.fillRect(px - 0.5, py + 3, 1, 14 + (k % 3) * 6);
            });
            // 划过的流星（两道错相）
            for (let k = 0; k < 2; k++) {
                const ph = (now / 2100 + k / 2) % 1;
                const mx = -90 + ph * 150, my = -130 + ph * 60;
                g.lineStyle(1.8, 0xffffff, (0.8 * (1 - ph)) * Math.min(1, ph * 6));
                g.lineBetween(mx, my, mx + 16, my - 7);
                g.fillStyle(0xffffff, 0.9 * (1 - ph));
                g.fillCircle(mx, my, 1.6);
            }
        } },
    mcaAuraA: { c: 0x7fd4ff, a: 0xffe15c, draw: (g, now, c, a) => {
            // 全息瞄具：身后立起的全息战术面板阵——主目标环 + 双侧数据塔 + 扫描扇面 + 数据块上浮
            const p1 = 0.5 + 0.5 * Math.sin(now / 400);
            // 主目标环（双环反向旋转 + 四角括标 + 锁定十字）
            g.lineStyle(2, c, 0.55);
            g.strokeCircle(0, -14, 64);
            g.lineStyle(1.2, c, 0.35);
            g.strokeCircle(0, -14, 48);
            for (let k = 0; k < 4; k++) {
                const ang = now / 1000 + (k / 4) * TAU;
                const px = Math.cos(ang) * 64, py = -14 + Math.sin(ang) * 64;
                g.lineStyle(2.6, a, 0.85);
                g.lineBetween(px - 7, py, px + 7, py);
                g.lineBetween(px, py - 7, px, py + 7);
            }
            const ldx = Math.cos(now / 700) * 20, ldy = -14 + Math.sin(now / 700) * 26;
            g.lineStyle(1.4, 0xff5a5a, 0.7 + 0.3 * Math.sin(now / 200)); // 锁定十字（游走）
            g.lineBetween(ldx - 5, ldy, ldx + 5, ldy);
            g.lineBetween(ldx, ldy - 5, ldx, ldy + 5);
            g.lineStyle(1, c, 0.4);
            g.strokeRect(ldx - 8, ldy - 8, 16, 16);
            // 双侧数据塔（竖直上升的刻度条）
            for (const s of [-1, 1]) {
                const bx = s * 84;
                g.fillStyle(c, 0.1);
                g.fillRect(bx - 5, -100, 10, 150);
                g.lineStyle(1.2, c, 0.5);
                g.strokeRect(bx - 5, -100, 10, 150);
                for (let k = 0; k < 6; k++) {
                    const ph = (now / 800 + k / 6 + (s > 0 ? 0 : 0.5)) % 1;
                    g.fillStyle(s > 0 ? a : 0x7dffc4, 0.7 * Math.sin(ph * Math.PI));
                    g.fillRect(bx - 3.4, 48 - ph * 145, 6.8, 3);
                }
                g.fillStyle(0xffffff, 0.8);
                g.fillRect(bx - 5, 44 + s * 3, 10, 1.6); // 塔顶读数线
            }
            // 扫描扇面（自目标环底部左右摆动）
            const sweep = Math.sin(now / 600) * 0.8;
            const spoly = [[0, -14]];
            for (let s = 0; s <= 6; s++) {
                const ang = -Math.PI / 2 + sweep - 0.5 + (s / 6) * 1;
                spoly.push([Math.cos(ang) * 96, -14 + Math.sin(ang) * 96]);
            }
            g.fillStyle(c, 0.07 + p1 * 0.04);
            apoly(g, spoly, c, 0.08 + p1 * 0.05);
            // 数据块上浮 + 全息噪点
            for (let k = 0; k < 5; k++) {
                const ph = (now / 1100 + k / 5) % 1;
                g.fillStyle(k % 2 ? a : c, 0.55 * (1 - ph));
                g.fillRect(-50 + (k * 27) % 100, 70 - ph * 170, 9, 5);
            }
            g.lineStyle(1, c, 0.18);
            for (let k = 0; k < 4; k++)
                g.lineBetween(-70, 20 + k * 24, 70, 20 + k * 24);
        } },
    mcaAuraB: { c: 0xffe15c, a: 0x7fd4ff, draw: (g, now, c, a) => {
            // 过载电场：身后一座特斯拉反应堆——核心电球 + 三层电离笼 + 乱窜电弧 + 警报闪 + 落雷
            const over = 0.5 + 0.5 * Math.sin(now / 160);
            const bob = Math.sin(now / 500) * 3;
            const cy = -24 + bob;
            // 警报底座（红蓝交替的警戒光环）
            g.fillStyle(0xff5a5a, 0.1 + over * 0.1);
            g.fillEllipse(0, 84, 150, 26);
            for (const s of [0, 1]) {
                const bl = Math.abs(Math.sin(now / 280 + s * Math.PI / 2));
                g.lineStyle(2.4, s ? 0xff5a5a : a, bl * 0.6);
                g.strokeEllipse(0, 84, 130 - s * 26, 22 - s * 5);
            }
            // 反应堆核心（三层沸腾电球 + 白热芯）
            g.fillStyle(c, 0.14 + over * 0.08);
            g.fillCircle(0, cy, 46);
            g.fillStyle(a, 0.5 + over * 0.2);
            g.fillCircle(Math.sin(now / 90) * 2.4, cy + Math.cos(now / 110) * 1.6, 13);
            g.fillStyle(0xffffff, 0.85);
            g.fillCircle(Math.sin(now / 90) * 1.6, cy, 5.4);
            // 三层电离笼（竖椭圆环，逐层错相明灭）
            for (let k = 0; k < 3; k++) {
                const gl = 0.3 + 0.3 * Math.sin(now / 220 + k * 2.1);
                g.lineStyle(2 - k * 0.4, k % 2 ? c : a, gl + 0.2);
                g.strokeEllipse(0, cy, 34 + k * 20, 52 + k * 30);
            }
            // 笼上放电球（六个绕行 + 分叉电弧）
            for (let k = 0; k < 6; k++) {
                const ang = now / 460 + (k / 6) * TAU;
                const px = Math.cos(ang) * 42, py = cy + Math.sin(ang) * 56;
                g.fillStyle(a, 0.9);
                g.fillCircle(px, py, 3);
                g.fillStyle(0xffffff, 0.7);
                g.fillCircle(px, py, 1.2);
                for (let s = 1; s <= 3; s++) {
                    const jitter = Math.sin(now / 42 + k * 3 + s) * 7;
                    g.lineStyle(1.3, s > 2 ? 0xffffff : a, 0.65 - s * 0.15);
                    g.lineBetween(px + (s - 1) * Math.cos(ang) * 5 + (s > 1 ? jitter : 0), py + (s - 1) * Math.sin(ang) * 6, px + s * Math.cos(ang) * 7 + jitter, py + s * Math.sin(ang) * 8);
                }
            }
            // 笼内乱窜电弧（三段折线闪电）
            for (let k = 0; k < 3; k++) {
                const a0 = now / 80 + k * 2.1;
                let px = Math.cos(a0) * 14, py = cy + Math.sin(a0) * 20;
                for (let s = 1; s <= 4; s++) {
                    const ang = a0 + s * 1.1 + Math.sin(now / 46 + s + k) * 0.5;
                    const nx = Math.cos(ang) * (14 + s * 11), ny = cy + Math.sin(ang) * (20 + s * 10);
                    g.lineStyle(1.8, s > 3 ? 0xffffff : a, 0.85);
                    g.lineBetween(px, py, nx, ny);
                    px = nx;
                    py = ny;
                }
            }
            // 天降落雷（周期性劈下 + 落点炸光）
            const strike = (now / 1900) % 1;
            if (strike < 0.22) {
                const sw = (1 - strike / 0.22);
                const lx = Math.sin(now / 300) * 30 - 20;
                g.lineStyle(2.6 * sw + 0.6, 0xffffff, sw);
                let bx = lx, by = -150;
                g.beginPath();
                g.moveTo(bx, by);
                for (let s = 1; s <= 5; s++) {
                    bx = lx + Math.sin(s * 3.1 + now) * 9;
                    by = -150 + s * 28;
                    g.lineTo(bx, by);
                }
                g.strokePath();
                g.fillStyle(a, sw * 0.5);
                g.fillCircle(bx, by, 12 * sw + 3);
            }
            // 上浮电离尘
            for (let k = 0; k < 5; k++) {
                const ph = (now / 900 + k / 5) % 1;
                g.fillStyle(a, 0.6 * (1 - ph));
                g.fillCircle(Math.sin(k * 2.6) * 40, 80 - ph * 160, 1.6 * (1 - ph) + 0.4);
            }
        } },
};
