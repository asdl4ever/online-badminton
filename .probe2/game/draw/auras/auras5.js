import { apoly, aline, TAU } from './shared.js';
/**
 * 补遗批一：大池老光环 62 款 → 背景特效。
 * 原本在 drawAura 老 switch 里（且雪/樱、泡/毒、轨/罗、齿/素共用画法），
 * 这里逐款独立构图；以 (0,0) = 角色躯干为中心、画在角色身后。
 */
export const AURAS_5 = {
    emerald: { a: 0x1a6a4a, draw: (g, now, c, _a) => {
            // 翡翠：身后一丛斜插的翡翠晶柱
            const crystals = [[-58, 70, 26, 150], [-20, 80, 34, 190], [22, 76, 28, 170], [58, 66, 22, 130]];
            crystals.forEach(([bx, by, w, h], k) => {
                const gl = 0.35 + 0.25 * Math.sin(now / 500 + k * 1.4);
                apoly(g, [[bx - w / 2, by], [bx, by - h], [bx + w / 2, by]], k % 2 ? c : 0x7dffc4, gl);
                apoly(g, [[bx - w / 2, by], [bx, by - h], [bx, by]], 0xffffff, gl * 0.35);
            });
        } },
    rose: { a: 0xb02a4a, draw: (g, now, c, a) => {
            // 绯红：身后一朵盛开的玫瑰剪影 + 飘落花瓣
            g.fillStyle(a, 0.3);
            g.fillCircle(0, -30, 66);
            for (let k = 0; k < 5; k++) {
                const ang = -Math.PI / 2 + (k / 5) * TAU;
                g.fillStyle(k % 2 ? c : 0xff8fa8, 0.5);
                g.fillEllipse(40 + Math.cos(ang) * 30, -50 + Math.sin(ang) * 30, 30, 18);
            }
            g.fillStyle(c, 0.7);
            g.fillCircle(40, -50, 13);
            for (let k = 0; k < 5; k++) {
                const ph = (now / 1200 + k / 5) % 1;
                g.fillStyle(c, 0.8 * Math.sin(ph * Math.PI));
                g.fillEllipse(-60 + k * 30 + Math.sin(ph * 5 + k) * 6, -120 + ph * 220, 9, 5);
            }
        } },
    frost: { a: 0xe8f8ff, draw: (g, now, c, a) => {
            // 寒霜：六向霜针从躯干向外生长
            for (let k = 0; k < 6; k++) {
                const ang = (k / 6) * TAU + Math.sin(now / 900) * 0.05;
                const len = 90 + Math.sin(now / 600 + k) * 8;
                const ex = Math.cos(ang) * len, ey = Math.sin(ang) * len * 1.3;
                aline(g, [[0, 0], [ex * 0.5, ey * 0.5]], 3, c, 0.5);
                aline(g, [[ex * 0.5, ey * 0.5], [ex, ey]], 1.6, a, 0.7);
                for (let s = 1; s <= 2; s++) {
                    const mx = ex * s * 0.33, my = ey * s * 0.33;
                    aline(g, [[mx, my], [mx + Math.cos(ang + 0.9) * 10, my + Math.sin(ang + 0.9) * 13]], 1.2, a, 0.55);
                    aline(g, [[mx, my], [mx - Math.cos(ang - 0.9) * 10, my - Math.sin(ang - 0.9) * 13]], 1.2, a, 0.55);
                }
            }
        } },
    toxic: { a: 0x3a6a1a, draw: (g, now, c, _a) => {
            // 剧毒：脚下冒起的毒泡 + 滴落的毒液
            for (let k = 0; k < 7; k++) {
                const ph = (now / 950 + k / 7) % 1;
                const bx = Math.sin(k * 2.4) * 34, by = 70 - ph * 170;
                g.lineStyle(1.8, c, 0.7 * (1 - ph));
                g.strokeCircle(bx, by, 4 + (k % 3) * 2 + ph * 3);
            }
            for (let k = 0; k < 3; k++) {
                const ph = (now / 700 + k / 3) % 1;
                g.fillStyle(c, 0.8 * (1 - ph));
                g.fillCircle(-24 + k * 24, -120 + ph * 60, 2.4 * (1 - ph) + 0.6);
            }
        } },
    flame: { a: 0xffd07a, draw: (g, now, c, a) => {
            // 烈焰：身后三道升腾的火柱
            for (let k = 0; k < 3; k++) {
                const fx = Math.sin(now / 320 + k * 2.1) * 26 + (k - 1) * 30;
                for (let s = 0; s < 4; s++) {
                    const ph = (now / 300 + s / 4 + k / 3) % 1;
                    g.fillStyle(s % 2 ? a : c, 0.5 * (1 - ph));
                    g.fillEllipse(fx + Math.sin(now / 250 + s) * 5, 60 - ph * 170, 20 * (1 - ph) + 5, 34 * (1 - ph) + 8);
                }
            }
        } },
    snow: { a: 0xbfe8ff, draw: (g, now, c, a) => {
            // 飘雪：六瓣雪花缓落
            for (let k = 0; k < 8; k++) {
                const ph = (now / 1400 + k / 8) % 1;
                const sx = Math.sin(k * 2.7) * 60 + Math.sin(now / 700 + k * 1.7) * 14;
                const sy = -130 + ph * 260;
                const r = 2.4 + (k % 3);
                g.lineStyle(1.4, k % 2 ? c : a, 0.85 * Math.sin(ph * Math.PI));
                for (let s = 0; s < 3; s++) {
                    const ang = (s / 3) * Math.PI;
                    g.lineBetween(sx - Math.cos(ang) * r, sy - Math.sin(ang) * r, sx + Math.cos(ang) * r, sy + Math.sin(ang) * r);
                }
            }
        } },
    bubble: { a: 0xdff6ff, draw: (g, now, c, _a) => {
            // 泡泡：大小不一的泡泡上浮，带高光点
            for (let k = 0; k < 8; k++) {
                const ph = (now / 1500 + k / 8) % 1;
                const bx = Math.sin(k * 3.1) * 40 + Math.sin(now / 600 + k * 2) * 8;
                const by = 70 - ph * 190;
                const r = 5 + (k % 4) * 3 + ph * 2;
                g.lineStyle(1.8, c, 0.65 * (1 - ph * 0.5));
                g.strokeCircle(bx, by, r);
                g.fillStyle(0xffffff, 0.7 * (1 - ph * 0.5));
                g.fillCircle(bx - r * 0.35, by - r * 0.35, r * 0.22);
            }
        } },
    gear: { a: 0x6a7686, draw: (g, now, c, a) => {
            // 齿轮：背后一大小两枚反向缓转的齿轮
            const gear = (cx, cy, r, teeth, rot, alpha) => {
                g.fillStyle(c, alpha);
                g.beginPath();
                for (let k = 0; k < teeth * 2; k++) {
                    const ang = rot + (k / (teeth * 2)) * TAU;
                    const rr = k % 2 === 0 ? r : r * 0.82;
                    const px = cx + Math.cos(ang) * rr, py = cy + Math.sin(ang) * rr;
                    if (k === 0)
                        g.moveTo(px, py);
                    else
                        g.lineTo(px, py);
                }
                g.closePath();
                g.fillPath();
                g.fillStyle(a, alpha);
                g.fillCircle(cx, cy, r * 0.35);
            };
            gear(0, -10, 74, 10, now / 2600, 0.4);
            gear(50, 50, 38, 8, -now / 1800, 0.55);
        } },
    pixel: { a: 0x1affc0, draw: (g, now, c, a) => {
            // 像素：阶梯状的像素块梯度闪烁
            for (let k = 0; k < 7; k++) {
                const gl = 0.35 + 0.45 * Math.abs(Math.sin(now / 350 + k * 0.9));
                g.fillStyle(k % 2 ? c : a, gl);
                g.fillRect(-72 + k * 20, 60 - (k % 4) * 26 - 10, 14, 14);
                g.fillRect(-62 + k * 20, 60 - (k % 4) * 26 + 6, 14, 14);
            }
        } },
    lava: { a: 0xffd07a, draw: (g, now, c, a) => {
            // 熔岩：脚下岩浆裂缝 + 缓滴的熔滴
            for (let k = 0; k < 4; k++) {
                g.fillStyle(c, 0.5 + 0.3 * Math.sin(now / 400 + k));
                g.fillRect(-80 + k * 42, 64 + Math.sin(k * 2) * 6, 26, 7);
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 800 + k / 4) % 1;
                g.fillStyle(a, 0.8 * (1 - ph));
                g.fillCircle(-50 + k * 32, 70 + ph * 30, 2.2 * (1 - ph) + 0.6);
            }
        } },
    neon: { a: 0xff3bd4, draw: (g, now, c, a) => {
            // 霓虹：身后霓虹灯管框，交替明灭
            const frame = (w, h, col, alpha) => {
                g.lineStyle(4, col, alpha);
                g.strokeRect(-w / 2, -h / 2 - 10, w, h);
            };
            frame(150, 190, c, 0.25 + 0.15 * Math.sin(now / 500));
            frame(110, 140, a, 0.35 + 0.25 * Math.sin(now / 380 + 1));
            g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 240));
            g.fillCircle(0, -10, 5);
        } },
    plume: { a: 0xffffff, draw: (g, now, c, a) => {
            // 落羽：白羽缓缓飘落，左右摇曳
            for (let k = 0; k < 6; k++) {
                const ph = (now / 1600 + k / 6) % 1;
                const px = Math.sin(k * 2.2) * 50 + Math.sin(ph * 6 + k) * 14;
                const py = -130 + ph * 250;
                const tilt = Math.sin(now / 500 + k) * 0.4;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(tilt);
                apoly(g, [[-3.4, -9], [3.4, -9], [2, 9], [-2, 9]], k % 2 ? c : a, 0.85 * Math.sin(ph * Math.PI));
                aline(g, [[0, -9], [0, 9]], 1, a, 0.6);
                g.restore();
            }
        } },
    coin: { a: 0xffe89a, draw: (g, now, c, a) => {
            // 聚财：金币绕身旋转，宽窄模拟翻转
            for (let k = 0; k < 6; k++) {
                const ang = now / 700 + (k / 6) * TAU;
                const ox = Math.cos(ang) * 62, oy = Math.sin(ang) * 30 - 20;
                const wCoin = 7 * Math.abs(Math.sin(ang));
                g.fillStyle(c, 0.85);
                g.fillEllipse(ox, oy, wCoin * 2 + 3, 14);
                g.lineStyle(1.2, a, 0.8);
                g.strokeEllipse(ox, oy, wCoin * 2 + 3, 14);
            }
        } },
    note: { a: 0xe8d8ff, draw: (g, now, c, a) => {
            // 音符：音符随节拍上浮明灭
            for (let k = 0; k < 5; k++) {
                const ph = (now / 1300 + k / 5) % 1;
                const nx = Math.sin(k * 2.9) * 44 + Math.sin(ph * 4 + k) * 8;
                const ny = 60 - ph * 180;
                const al = 0.8 * Math.sin(ph * Math.PI);
                g.fillStyle(k % 2 ? c : a, al);
                g.fillEllipse(nx, ny + 6, 7, 5.4);
                aline(g, [[nx + 3, ny + 5], [nx + 3, ny - 12]], 1.8, k % 2 ? c : a, al);
                g.lineBetween(nx + 3, ny - 12, nx + 9, ny - 9);
            }
        } },
    sand: { a: 0xc9a84a, draw: (g, now, c, a) => {
            // 沙尘：横向掠过的沙粒流
            for (let k = 0; k < 5; k++) {
                const ph = (now / 500 + k / 5) % 1;
                g.lineStyle(2.4, k % 2 ? c : a, (1 - ph) * 0.5);
                g.lineBetween(-110 + ph * 220, -80 + k * 34, -70 + ph * 220, -76 + k * 34);
            }
            for (let k = 0; k < 6; k++) {
                const ph = (now / 380 + k / 6) % 1;
                g.fillStyle(c, 0.6 * (1 - ph));
                g.fillCircle(-100 + ph * 200, -60 + (k * 23) % 140, 1.6);
            }
        } },
    wind: { a: 0xeaf6ff, draw: (g, now, c, a) => {
            // 风旋：环身旋转的风弧
            for (let k = 0; k < 4; k++) {
                const a0 = now / 400 + (k / 4) * TAU;
                g.lineStyle(3 - k * 0.5, k % 2 ? c : a, 0.55 - k * 0.08);
                g.beginPath();
                g.arc(0, -6, 46 + k * 12, a0, a0 + 2.2);
                g.strokePath();
            }
        } },
    hex: { a: 0xd8b0ff, draw: (g, now, c, a) => {
            // 六芒：背后旋转的六芒星阵
            const r = 78, rot = now / 2200;
            for (let star = 0; star < 2; star++) {
                g.fillStyle(star ? a : c, 0.18);
                g.beginPath();
                for (let k = 0; k < 3; k++) {
                    const ang = rot + star * Math.PI / 3 + (k / 3) * TAU;
                    const px = Math.cos(ang) * r, py = Math.sin(ang) * r;
                    if (k === 0)
                        g.moveTo(px, py);
                    else
                        g.lineTo(px, py);
                }
                g.closePath();
                g.fillPath();
            }
            g.lineStyle(1.4, a, 0.5);
            g.strokeCircle(0, -10, r);
        } },
    violet: { a: 0x6a3fb0, draw: (g, now, c, a) => {
            // 紫罗兰：身后一丛五瓣紫罗兰 + 花粉光点
            for (let k = 0; k < 3; k++) {
                const fx = -40 + k * 40, fy = -30 + (k % 2) * 34, fr = 12 + (k % 2) * 3;
                for (let p = 0; p < 5; p++) {
                    const ang = (p / 5) * TAU + Math.sin(now / 800 + k) * 0.1;
                    g.fillStyle(k % 2 ? c : 0xd8b0ff, 0.55);
                    g.fillEllipse(fx + Math.cos(ang) * fr, fy + Math.sin(ang) * fr, fr, fr * 0.62);
                }
                g.fillStyle(a, 0.8);
                g.fillCircle(fx, fy, 4);
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 900 + k / 4) % 1;
                g.fillStyle(a, 0.6 * (1 - ph));
                g.fillCircle(Math.sin(k * 2) * 40, 40 - ph * 100, 1.8 * (1 - ph) + 0.4);
            }
        } },
    gold: { a: 0xfff0b0, draw: (g, now, c, a) => {
            // 黄金：背后金色放射 + 绕身金粒
            for (let k = 0; k < 8; k++) {
                const ang = (k / 8) * TAU + now / 3000;
                aline(g, [[0, -10], [Math.cos(ang) * 92, -10 + Math.sin(ang) * 120]], 2.4, k % 2 ? c : a, 0.28);
            }
            for (let k = 0; k < 8; k++) {
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k * 1.3));
                g.fillStyle(c, 0.75 * tw);
                g.fillCircle(Math.cos(k * 0.9 + now / 1800) * 58, -10 + Math.sin(k * 0.9 + now / 1800) * 78, 2.6);
            }
        } },
    crimson: { a: 0x8a1a2a, draw: (g, now, c, a) => {
            // 血月：背后一轮血月 + 下垂的红雾
            g.fillStyle(a, 0.35);
            g.fillCircle(0, -66, 74);
            g.fillStyle(c, 0.75);
            g.fillCircle(0, -66, 48);
            g.fillStyle(0x4a0a14, 0.5);
            g.fillCircle(12, -78, 10);
            g.fillCircle(-14, -56, 7); // 月面暗斑
            for (let k = 0; k < 4; k++) {
                const ph = (now / 1400 + k / 4) % 1;
                g.fillStyle(c, 0.25 * Math.sin(ph * Math.PI));
                g.fillEllipse(Math.sin(k * 2) * 40, 30 + ph * 60, 60, 16);
            }
        } },
    electric: { a: 0xffffff, draw: (g, now, c, a) => {
            // 电光：环身乱窜的折线闪电
            for (let k = 0; k < 3; k++) {
                const a0 = now / 130 + k * 2.1;
                let px = Math.cos(a0) * 46, py = -10 + Math.sin(a0) * 64;
                for (let s = 1; s <= 5; s++) {
                    const ang = a0 + s * 0.32 + Math.sin(now / 55 + s * 3 + k) * 0.3;
                    const rr = 46 + s * 9;
                    const nx = Math.cos(ang) * rr, ny = -10 + Math.sin(ang) * rr * 1.35;
                    aline(g, [[px, py], [nx, ny]], 2, s > 3 ? a : c, 0.85);
                    px = nx;
                    py = ny;
                }
            }
        } },
    orbit: { a: 0xd8b0ff, draw: (g, now, c, a) => {
            // 星轨：两条交叉椭圆轨道 + 行星点
            [[64, 22, 0.5], [46, 34, -0.9]].forEach(([rx, ry, tilt], k) => {
                g.save();
                g.translateCanvas(0, -10);
                g.rotateCanvas(tilt);
                g.lineStyle(1.4, a, 0.4);
                g.beginPath();
                g.arc(0, 0, rx, 0, TAU);
                g.closePath();
                g.beginPath();
                for (let s = 0; s <= 24; s++) {
                    const ang = (s / 24) * TAU;
                    const px = Math.cos(ang) * rx, py = Math.sin(ang) * ry * (rx / 64) * 2.4;
                    if (s === 0)
                        g.moveTo(px, py);
                    else
                        g.lineTo(px, py);
                }
                g.closePath();
                g.strokePath();
                const ang = now / 600 + k * 2;
                g.fillStyle(c, 0.9);
                g.fillCircle(Math.cos(ang) * rx, Math.sin(ang) * ry * (rx / 64) * 2.4, 4.4);
                g.fillStyle(0xffffff, 0.7);
                g.fillCircle(Math.cos(ang) * rx - 1, Math.sin(ang) * ry * (rx / 64) * 2.4 - 1, 1.6);
                g.restore();
            });
        } },
    venom: { a: 0x4a8a1a, draw: (g, now, c, a) => {
            // 毒液：头顶滴落的毒滴 + 环绕毒雾
            for (let k = 0; k < 4; k++) {
                const ph = (now / 700 + k / 4) % 1;
                const dx = Math.sin(k * 2.4) * 34;
                g.fillStyle(c, 0.85 * (1 - ph));
                apoly(g, [[dx - 3, -110 + ph * 160], [dx + 3, -110 + ph * 160], [dx, -100 + ph * 160]], c, 0.85 * (1 - ph));
            }
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1600 + k / 3) % 1;
                g.fillStyle(a, 0.2 * Math.sin(ph * Math.PI));
                g.fillEllipse(Math.sin(ph * 4 + k) * 30, -20, 70, 100);
            }
        } },
    sakura: { a: 0xff8fa8, draw: (g, now, c, a) => {
            // 樱落：五瓣樱花旋转飘落
            for (let k = 0; k < 7; k++) {
                const ph = (now / 1700 + k / 7) % 1;
                const px = Math.sin(k * 2.6) * 55 + Math.sin(ph * 5 + k) * 16;
                const py = -130 + ph * 250;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(now / 800 + k);
                for (let p = 0; p < 5; p++) {
                    const ang = (p / 5) * TAU;
                    g.fillStyle(k % 2 ? c : a, 0.8 * Math.sin(ph * Math.PI));
                    g.fillEllipse(Math.cos(ang) * 4, Math.sin(ang) * 4, 6, 3.6);
                }
                g.fillStyle(0xffffff, 0.8);
                g.fillCircle(0, 0, 1.6);
                g.restore();
            }
        } },
    aurora: { a: 0x6fe09a, draw: (g, now, c, a) => {
            // 极光：身后三道波动的极光带
            for (let k = 0; k < 3; k++) {
                const col = [c, a, 0x9ad4ff][k];
                apoly(g, Array.from({ length: 10 }, (_, s) => {
                    const u = s / 9;
                    return [-100 + u * 200, -90 + k * 22 + Math.sin(u * 4.5 + now / 520 + k * 1.4) * 16];
                }).concat(Array.from({ length: 10 }, (_, s) => {
                    const u = 1 - s / 9;
                    return [-100 + u * 200, -130 + k * 22 + Math.sin(u * 4.5 + now / 520 + k * 1.4) * 16];
                })), col, 0.3);
            }
        } },
    ghost: { a: 0xb0c4e8, draw: (g, now, c, a) => {
            // 幽魂：两缕幽灵残影在身后漂
            for (let k = 0; k < 2; k++) {
                const ph = (now / 2400 + k / 2) % 1;
                const gx = Math.sin(ph * TAU + k) * 44;
                const gy = Math.sin(ph * TAU * 2) * 18 - 20;
                g.fillStyle(c, 0.3);
                apoly(g, [
                    [gx - 14, gy + 30], [gx - 14, gy - 8], [gx, gy - 26], [gx + 14, gy - 8], [gx + 14, gy + 30],
                    [gx + 9, gy + 22], [gx + 4.4, gy + 30], [gx, gy + 22], [gx - 4.4, gy + 30], [gx - 9, gy + 22],
                ], c, 0.3);
                g.fillStyle(a, 0.5);
                g.fillCircle(gx - 4.4, gy - 8, 2);
                g.fillCircle(gx + 4.4, gy - 8, 2);
            }
        } },
    prism: { a: 0x8ad8ff, draw: (g, now, c, a) => {
            // 棱镜：三角棱镜 + 一束白光折射成彩带
            apoly(g, [[-16, 40], [-16, -30], [24, 40]], c, 0.4);
            g.lineStyle(1.6, a, 0.6);
            g.beginPath();
            g.moveTo(-16, 40);
            g.lineTo(-16, -30);
            g.lineTo(24, 40);
            g.closePath();
            g.strokePath();
            const cols = [0xff5a5a, 0xffd45c, 0x7dffc4, 0x5ac8ff, 0xff9adf];
            for (let k = 0; k < 5; k++) {
                g.lineStyle(3, cols[k], 0.55);
                g.lineBetween(20, 10 + k * 3, 96, -40 + k * 22 + Math.sin(now / 600 + k) * 3);
            }
            g.lineStyle(2.4, 0xffffff, 0.5);
            g.lineBetween(-100, -50, -16, 0);
        } },
    thorn: { a: 0x4a7a2a, draw: (g, _now, c, a) => {
            // 荆棘：环身的荆棘藤蔓 + 尖刺
            for (let k = 0; k < 3; k++) {
                const pts = [];
                for (let s = 0; s <= 10; s++) {
                    const u = s / 10;
                    pts.push([Math.cos(u * 4.4 + k * 2.1) * (44 + k * 12), -70 + u * 150 + Math.sin(u * 6 + k) * 8]);
                }
                aline(g, pts, 2.6, k % 2 ? c : a, 0.7);
                for (let s = 1; s < 10; s += 2) {
                    const [tx, ty] = pts[s];
                    const ang = s * 0.7 + k;
                    apoly(g, [[tx, ty], [tx + Math.cos(ang) * 9, ty + Math.sin(ang) * 9], [tx + Math.cos(ang + 1.6) * 4, ty + Math.sin(ang + 1.6) * 4]], a, 0.8);
                }
            }
        } },
    chain: { a: 0x8a94a2, draw: (g, now, c, a) => {
            // 锁链：两垂一横的粗链环
            for (let k = 0; k < 2; k++) {
                const cx = k ? 58 : -58;
                for (let s = 0; s < 5; s++) {
                    const cy = -90 + s * 30 + Math.sin(now / 600 + s) * 2 * (s / 4);
                    g.lineStyle(3, s % 2 ? c : a, 0.75);
                    g.strokeEllipse(cx, cy, 10, 16);
                }
            }
            for (let s = 0; s < 5; s++) {
                const cx = -40 + s * 20;
                g.lineStyle(2.6, s % 2 ? a : c, 0.65);
                g.strokeEllipse(cx, 84 + Math.sin(now / 500 + s) * 3, 14, 8);
            }
        } },
    heart: { a: 0xffb7d5, draw: (g, now, c, a) => {
            // 爱心：大小爱心上浮明灭
            const heart = (hx, hy, r, col, al) => {
                g.fillStyle(col, al);
                g.fillCircle(hx - r * 0.5, hy - r * 0.3, r * 0.55);
                g.fillCircle(hx + r * 0.5, hy - r * 0.3, r * 0.55);
                apoly(g, [
                    [hx - r * 0.98, hy - r * 0.14], [hx + r * 0.98, hy - r * 0.14],
                    [hx, hy + r],
                ], col, al);
            };
            for (let k = 0; k < 6; k++) {
                const ph = (now / 1500 + k / 6) % 1;
                heart(Math.sin(k * 2.4) * 46 + Math.sin(ph * 4 + k) * 6, 60 - ph * 190, 6 + (k % 3) * 3, k % 2 ? c : a, 0.8 * Math.sin(ph * Math.PI));
            }
        } },
    sparkle: { a: 0xffe89a, draw: (g, now, c, a) => {
            // 星尘：四芒星尘环绕闪烁
            for (let k = 0; k < 9; k++) {
                const tw = Math.abs(Math.sin(now / 280 + k * 1.31));
                const ang = (k / 9) * TAU + now / 2400;
                const px = Math.cos(ang) * (40 + (k % 3) * 18);
                const py = -10 + Math.sin(ang) * (52 + (k % 4) * 14);
                const r = 2 + tw * 4;
                g.fillStyle(k % 3 ? c : a, 0.8 * tw);
                g.fillRect(px - r, py - r * 0.28, r * 2, r * 0.56);
                g.fillRect(px - r * 0.28, py - r, r * 0.56, r * 2);
            }
        } },
    moon: { a: 0xbfe8ff, draw: (g, now, c, a) => {
            // 月华：身后一轮弯月 + 月晕 + 星点
            g.fillStyle(a, 0.14);
            g.fillCircle(30, -64, 84);
            g.fillStyle(c, 0.8);
            g.fillCircle(30, -64, 46);
            g.fillStyle(0x2a3a5a, 0.92);
            g.fillCircle(48, -76, 40); // 月牙阴影
            for (let k = 0; k < 5; k++) {
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 320 + k * 1.7));
                g.fillStyle(0xffffff, tw);
                g.fillCircle(-60 + (k * 29) % 130, -110 + (k * 37) % 90, 1.8);
            }
        } },
    clock: { a: 0x8a6a3a, draw: (g, now, c, a) => {
            // 时针：背后一面怀表，指针急速回旋
            g.lineStyle(3, a, 0.6);
            g.strokeCircle(0, -20, 66);
            g.lineStyle(1.6, c, 0.5);
            g.strokeCircle(0, -20, 56);
            for (let k = 0; k < 12; k++) {
                const ang = (k / 12) * TAU;
                g.lineStyle(2, a, 0.5);
                g.lineBetween(Math.cos(ang) * 58, -20 + Math.sin(ang) * 58, Math.cos(ang) * 64, -20 + Math.sin(ang) * 64);
            }
            const fast = now / 180, slow = now / 2000;
            aline(g, [[0, -20], [Math.cos(fast) * 40, -20 + Math.sin(fast) * 40]], 2.6, c, 0.9);
            aline(g, [[0, -20], [Math.cos(slow) * 30, -20 + Math.sin(slow) * 30]], 2, a, 0.7);
            g.fillStyle(c, 0.9);
            g.fillCircle(0, -20, 3.4);
        } },
    ring: { a: 0xdff2ff, draw: (g, now, c, a) => {
            // 光环：环身呼吸的纯光双环
            const p1 = 0.5 + 0.5 * Math.sin(now / 520);
            g.lineStyle(5, c, 0.35 + 0.25 * p1);
            g.strokeEllipse(0, -10, 96 + p1 * 10, 150 + p1 * 16);
            g.lineStyle(2, a, 0.7);
            g.strokeEllipse(0, -10, 82 - p1 * 8, 128 - p1 * 12);
            g.fillStyle(a, 0.5);
            g.fillCircle(0, -10 - (60 + p1 * 30), 2.4);
        } },
    rune: { a: 0xd8f0ff, draw: (g, now, c, a) => {
            // 符文：环身缓慢旋转的发光符文刻痕
            for (let k = 0; k < 6; k++) {
                const ang = now / 2200 + (k / 6) * TAU;
                const px = Math.cos(ang) * 66, py = -10 + Math.sin(ang) * 92;
                const gl = 0.5 + 0.5 * Math.sin(now / 300 + k * 2);
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(ang + Math.PI / 2);
                g.lineStyle(2, k % 2 ? c : a, 0.6 * gl);
                g.lineBetween(-3, -7, 3, 7);
                g.lineBetween(-3, 0, 3, 0);
                g.lineBetween(3, -7, -3, 7);
                g.restore();
                g.fillStyle(c, 0.25 * gl);
                g.fillCircle(px, py, 9);
            }
        } },
    tide: { a: 0xbfe8ff, draw: (g, now, c, a) => {
            // 潮汐：环身两道起伏的波弧
            for (let k = 0; k < 2; k++) {
                const pts = [];
                for (let s = 0; s <= 12; s++) {
                    const u = s / 12;
                    pts.push([-96 + u * 192, 30 + k * 24 + Math.sin(u * 6.3 + now / 450 + k * 1.8) * 10 - u * 0]);
                }
                aline(g, pts, 3.4 - k, k % 2 ? c : a, 0.55);
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 900 + k / 4) % 1;
                g.fillStyle(a, 0.7 * (1 - ph));
                g.fillCircle(Math.sin(k * 2.4) * 50, 40 - ph * 60, 2 * (1 - ph) + 0.5);
            }
        } },
    rainbow: { a: 0xffd45c, draw: (g, now, _c, a) => {
            // 虹光：背后一道七彩虹弧
            const cols = [0xff5a5a, 0xffa04a, 0xffd45c, 0x7dffc4, 0x5ac8ff, 0x8f7bff, 0xff9adf];
            cols.forEach((col, k) => {
                g.lineStyle(4.4, col, 0.5);
                g.beginPath();
                g.arc(0, 70, 130 - k * 8, -Math.PI * 0.88, -Math.PI * 0.12);
                g.strokePath();
            });
            const tw = 0.5 + 0.5 * Math.sin(now / 400);
            g.fillStyle(a, 0.5 * tw);
            g.fillCircle(-84, -20, 2.4);
            g.fillCircle(84, -20, 2.4);
        } },
    holy: { a: 0xffffff, draw: (g, now, c, a) => {
            // 圣光：头顶降下的光柱 + 悬浮光环
            g.fillStyle(c, 0.16);
            apoly(g, [[-40, -150], [40, -150], [58, 80], [-58, 80]], c, 0.16);
            g.fillStyle(c, 0.1);
            apoly(g, [[-24, -150], [24, -150], [36, 80], [-36, 80]], 0xffffff, 0.16);
            const ry = -50 + Math.sin(now / 700) * 8;
            g.lineStyle(4, c, 0.7);
            g.beginPath();
            g.arc(0, ry, 34, Math.PI * 0.12, Math.PI * 0.88);
            g.strokePath();
            g.lineStyle(2, a, 0.8);
            g.beginPath();
            g.arc(0, ry, 26, Math.PI * 0.1, Math.PI * 0.9);
            g.strokePath();
        } },
    void: { a: 0x4a1a8a, draw: (g, now, c, a) => {
            // 虚空：身后缓慢旋转的紫黑漩涡
            for (let k = 0; k < 4; k++) {
                const pts = [];
                for (let s = 0; s <= 16; s++) {
                    const u = s / 16;
                    const ang = u * 3.6 + now / 1400 + (k / 4) * TAU;
                    const r = 16 + u * 66;
                    pts.push([Math.cos(ang) * r, -10 + Math.sin(ang) * r * 1.25]);
                }
                aline(g, pts, 5 - k, k % 2 ? c : a, 0.4 - k * 0.06);
            }
            g.fillStyle(0x1a0a2a, 0.85);
            g.fillCircle(0, -10, 20);
            g.fillStyle(c, 0.5);
            g.fillCircle(0, -10, 8);
        } },
    storm: { a: 0xbfd8ff, draw: (g, now, c, a) => {
            // 风暴：环身风圈 + 随机劈下的闪电
            for (let k = 0; k < 3; k++) {
                const a0 = now / 300 + (k / 3) * TAU;
                g.lineStyle(3, k % 2 ? c : a, 0.4);
                g.beginPath();
                g.arc(0, -10, 70 + k * 10, a0, a0 + 1.6);
                g.strokePath();
            }
            for (let k = 0; k < 2; k++) {
                const bx = k ? 30 : -34;
                const jx = Math.sin(now / 80 + k * 4) * 10;
                aline(g, [[bx, -140], [bx + 8 + jx, -90], [bx - 6, -46]], 2, a, 0.5 + 0.5 * Math.abs(Math.sin(now / 100 + k)));
            }
        } },
    skull: { a: 0x8a94a2, draw: (g, now, c, a) => {
            // 骷髅：身后巨大的半透明骷髅浮影，眼窝燃火
            const fy = -26 + Math.sin(now / 900) * 5;
            g.fillStyle(c, 0.3);
            g.fillCircle(0, fy, 42);
            apoly(g, [[-26, fy + 26], [26, fy + 26], [20, fy + 50], [10, fy + 42], [0, fy + 52], [-10, fy + 42], [-20, fy + 50]], c, 0.3);
            g.fillStyle(0x1a1a2a, 0.7);
            g.fillCircle(-14, fy - 6, 9);
            g.fillCircle(14, fy - 6, 9);
            g.fillStyle(a, 0.7 + 0.3 * Math.sin(now / 200));
            g.fillCircle(-14, fy - 6, 3.4);
            g.fillCircle(14, fy - 6, 3.4);
            g.fillRect(-2, fy + 8, 4, 8);
        } },
    sun: { a: 0xffe89a, draw: (g, now, c, a) => {
            // 烈日：背后一轮烈日 + 光芒呼吸
            const r = 46 + Math.sin(now / 500) * 4;
            g.fillStyle(a, 0.25);
            g.fillCircle(0, -50, r + 30);
            g.fillStyle(c, 0.85);
            g.fillCircle(0, -50, r);
            g.fillStyle(0xfff6d0, 0.8);
            g.fillCircle(-10, -60, r * 0.45);
            for (let k = 0; k < 10; k++) {
                const ang = (k / 10) * TAU + now / 3600;
                aline(g, [[Math.cos(ang) * (r + 4), -50 + Math.sin(ang) * (r + 4)], [Math.cos(ang) * (r + 22 + Math.sin(now / 300 + k) * 6), -50 + Math.sin(ang) * (r + 22 + Math.sin(now / 300 + k) * 6)]], 3, k % 2 ? c : a, 0.6);
            }
        } },
    radar: { a: 0xb0ffd0, draw: (g, now, c, _a) => {
            // 雷达：环身扫描扇 + 同心圈
            g.lineStyle(1.4, c, 0.4);
            [36, 58, 80].forEach(r => { g.strokeEllipse(0, -10, r * 2, r * 2.6); });
            for (let k = 0; k < 2; k++) {
                const a0 = now / 500 + k * Math.PI;
                g.fillStyle(c, 0.3);
                g.beginPath();
                g.moveTo(0, -10);
                g.arc(0, -10, 80, a0, a0 + 0.5);
                g.closePath();
                g.fillPath();
                g.fillStyle(0xffffff, 0.6 * (0.5 + 0.5 * Math.sin(now / 200 + k * 3)));
                g.fillCircle(Math.cos(a0 + 0.25) * 60, -10 + Math.sin(a0 + 0.25) * 74, 2.4);
            }
        } },
    matrix: { a: 0x1aff6a, draw: (g, now, c, _a) => {
            // 矩阵：绿色字符雨条
            for (let k = 0; k < 7; k++) {
                const bx = -72 + k * 24;
                const head = (now / 240 + k * 97) % 260;
                for (let s = 0; s < 4; s++) {
                    const ph = ((head - s * 14) % 260 + 260) % 260 / 260;
                    const by = -150 + ph * 300;
                    if (by > 150)
                        continue;
                    g.fillStyle(s === 0 ? 0xffffff : c, (1 - s * 0.22) * 0.7);
                    g.fillRect(bx, by, 4, 10);
                }
            }
        } },
    king: { a: 0xfff0b0, draw: (g, now, c, a) => {
            // 王者：头顶悬浮王冠光影 + 金芒
            const ky = -120 + Math.sin(now / 800) * 6;
            g.fillStyle(c, 0.35);
            apoly(g, [[-30, ky + 14], [-30, ky - 8], [-16, ky + 2], [0, ky - 16], [16, ky + 2], [30, ky - 8], [30, ky + 14]], c, 0.35);
            g.lineStyle(2, a, 0.7);
            g.beginPath();
            g.moveTo(-30, ky + 14);
            g.lineTo(-30, ky - 8);
            g.lineTo(-16, ky + 2);
            g.lineTo(0, ky - 16);
            g.lineTo(16, ky + 2);
            g.lineTo(30, ky - 8);
            g.lineTo(30, ky + 14);
            g.strokePath();
            g.fillStyle(a, 0.8);
            g.fillCircle(0, ky - 20, 2.6);
            g.fillCircle(-30, ky - 12, 2);
            g.fillCircle(30, ky - 12, 2);
            for (let k = 0; k < 6; k++) {
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 350 + k * 1.9));
                g.fillStyle(c, 0.6 * tw);
                g.fillCircle(Math.cos(k * 1.05 + now / 1600) * 66, -10 + Math.sin(k * 1.05 + now / 1600) * 86, 2);
            }
        } },
    firefly: { a: 0xffffff, draw: (g, now, c, a) => {
            // 萤火：明灭游移的萤火虫
            for (let k = 0; k < 7; k++) {
                const ph = now / 1000 + k * 1.7;
                const fx = Math.sin(ph * 0.9 + k * 2) * 60;
                const fy = -30 + Math.sin(ph * 1.3 + k) * 55;
                const gl = Math.max(0, Math.sin(ph * 2.1));
                g.fillStyle(a, gl * 0.25);
                g.fillCircle(fx, fy, 5);
                g.fillStyle(k % 2 ? c : a, gl);
                g.fillCircle(fx, fy, 1.8);
            }
        } },
    mist: { a: 0xffffff, draw: (g, now, c, a) => {
            // 雾霭：环身漂移的雾团
            for (let k = 0; k < 5; k++) {
                const ph = (now / 2600 + k / 5) % 1;
                const mx = -90 + ph * 180;
                const my = -40 + Math.sin(k * 2.4) * 50;
                g.fillStyle(k % 2 ? c : a, 0.2 * Math.sin(ph * Math.PI));
                g.fillEllipse(mx, my, 70, 22);
            }
        } },
    golddust: { a: 0xfff0b0, draw: (g, now, c, a) => {
            // 金尘：金粉明灭漂浮
            for (let k = 0; k < 10; k++) {
                const ph = (now / 1200 + k / 10) % 1;
                const px = Math.sin(k * 2.9) * 56 + Math.sin(ph * 5 + k) * 10;
                const py = 70 - ph * 190;
                const gl = 0.5 + 0.5 * Math.sin(now / 200 + k * 2.3);
                g.fillStyle(k % 3 ? c : a, gl * Math.sin(ph * Math.PI) * 0.9);
                g.fillCircle(px, py, 1.6 + gl);
            }
        } },
    dawn: { a: 0xffd8a0, draw: (g, now, c, _a) => {
            // 黎明：地平线升起的晨光
            g.fillStyle(c, 0.2);
            g.fillEllipse(0, 76, 190, 60);
            g.fillStyle(0xffe8c0, 0.3);
            g.fillEllipse(0, 70, 130, 34);
            const r = 20 + Math.sin(now / 900) * 3;
            g.fillStyle(c, 0.75);
            g.fillCircle(0, 62, r);
            for (let k = 0; k < 4; k++) {
                g.lineStyle(2, c, 0.35);
                g.lineBetween(-90 + k * 24, 40, -60 + k * 24, 4 - k * 6);
            }
        } },
    dusk: { a: 0xd85a3a, draw: (g, now, c, a) => {
            // 黄昏：下沉的落日 + 横贯的余晖带
            g.fillStyle(c, 0.6);
            g.fillCircle(0, 44 + Math.sin(now / 1400) * 6, 30);
            for (let k = 0; k < 3; k++) {
                g.fillStyle(k % 2 ? a : 0xffb070, 0.2);
                g.fillEllipse(0, 30 + k * 16, 190 - k * 30, 12);
            }
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1600 + k / 3) % 1;
                g.fillStyle(a, 0.6 * (1 - ph));
                g.fillEllipse(Math.sin(k * 2) * 50, 20 - ph * 90, 16, 4);
            }
        } },
    spring: { a: 0xffe0ec, draw: (g, now, c, a) => {
            // 春息：新芽破土 + 粉白花苞
            for (let k = 0; k < 3; k++) {
                const bx = -36 + k * 36;
                g.lineStyle(2.4, 0x4a9a3a, 0.7);
                g.lineBetween(bx, 78, bx + Math.sin(now / 800 + k) * 3, 78 - 30 - (k % 2) * 14);
                g.fillStyle(k % 2 ? c : a, 0.8);
                g.fillEllipse(bx + 4, 44 - (k % 2) * 14 + Math.sin(now / 800 + k) * 2, 8, 4.4);
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 1300 + k / 4) % 1;
                g.fillStyle(c, 0.7 * Math.sin(ph * Math.PI));
                g.fillEllipse(Math.sin(k * 2.2) * 46 + Math.sin(ph * 4 + k) * 6, 60 - ph * 150, 7, 4);
            }
        } },
    autumn: { a: 0xd4622a, draw: (g, now, c, a) => {
            // 秋意：旋转飘落的橙叶
            for (let k = 0; k < 6; k++) {
                const ph = (now / 1500 + k / 6) % 1;
                const px = Math.sin(k * 2.7) * 54 + Math.sin(ph * 6 + k) * 14;
                const py = -130 + ph * 250;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(now / 600 + k * 1.3);
                apoly(g, [[0, -7], [6, 0], [0, 7], [-6, 0]], k % 2 ? c : a, 0.85 * Math.sin(ph * Math.PI));
                aline(g, [[0, -7], [0, 7]], 1, 0x8a4a1a, 0.5);
                g.restore();
            }
        } },
    leafwind: { a: 0x4a9a3a, draw: (g, now, c, a) => {
            // 叶风：横向飞掠的绿叶
            for (let k = 0; k < 6; k++) {
                const ph = (now / 700 + k / 6) % 1;
                const px = -100 + ph * 200;
                const py = -70 + (k * 27) % 150 + Math.sin(ph * 8 + k) * 10;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(Math.sin(now / 300 + k) * 0.6);
                apoly(g, [[0, -5], [7, 0], [0, 5], [-5, 0]], k % 2 ? c : a, 0.8 * Math.sin(ph * Math.PI));
                g.restore();
            }
        } },
    vortex: { a: 0xd8b0ff, draw: (g, now, c, a) => {
            // 漩涡：螺线急速旋转
            for (let k = 0; k < 3; k++) {
                const pts = [];
                for (let s = 0; s <= 20; s++) {
                    const u = s / 20;
                    const ang = u * 5 + now / 500 + (k / 3) * TAU;
                    const r = 8 + u * 76;
                    pts.push([Math.cos(ang) * r, -10 + Math.sin(ang) * r * 1.2]);
                }
                aline(g, pts, 3 - k, k % 2 ? c : a, 0.55 - k * 0.12);
            }
        } },
    nebula: { a: 0xff9adf, draw: (g, now, c, a) => {
            // 星云：团块星云 + 嵌在里面的亮星
            g.fillStyle(c, 0.22);
            g.fillEllipse(-30, -40, 110, 70);
            g.fillStyle(a, 0.25);
            g.fillEllipse(36, 20, 90, 60);
            g.fillStyle(0x6a4ae8, 0.28);
            g.fillEllipse(10, -70, 80, 46);
            for (let k = 0; k < 6; k++) {
                const tw = 0.5 + 0.5 * Math.abs(Math.sin(now / 260 + k * 1.7));
                g.fillStyle(0xffffff, tw);
                g.fillCircle(-50 + (k * 33) % 120, -70 + (k * 41) % 120, 1.6 + tw);
            }
        } },
    eclipse: { a: 0xffd45c, draw: (g, now, c, a) => {
            // 日蚀：黑盘吞日，金边日冕
            const r = 54 + Math.sin(now / 700) * 3;
            g.fillStyle(a, 0.3);
            g.fillCircle(0, -40, r + 22);
            g.fillStyle(c, 0.9);
            g.fillCircle(0, -40, r);
            g.fillStyle(0x1a0a2a, 0.96);
            g.fillCircle(10, -50, r - 3);
            g.lineStyle(2.4, a, 0.75);
            g.beginPath();
            g.arc(0, -40, r + 4, Math.PI * 0.7, Math.PI * 1.7);
            g.strokePath();
        } },
    thundercloud: { a: 0xdfe8f5, draw: (g, now, c, a) => {
            // 雷云：头顶翻涌的云团 + 云缝闪电
            for (let k = 0; k < 4; k++) {
                const cx = -48 + k * 32, cy = -108 + (k % 2) * 10 + Math.sin(now / 700 + k) * 3;
                g.fillStyle(k % 2 ? c : a, 0.55);
                g.fillCircle(cx, cy, 24 - (k % 2) * 6);
                g.fillStyle(0x6a7a95, 0.4);
                g.fillCircle(cx + 6, cy + 8, 14);
            }
            for (let k = 0; k < 2; k++) {
                const bx = k ? 16 : -22;
                const gl = Math.abs(Math.sin(now / 130 + k * 2.4));
                if (gl > 0.4) {
                    aline(g, [[bx, -86], [bx + 6, -56], [bx - 4, -26], [bx + 3, 0]], 2.2, 0xfff2a0, gl);
                }
            }
        } },
    frostbite: { a: 0xffffff, draw: (g, now, c, a) => {
            // 极寒：环身一圈冰棱
            for (let k = 0; k < 8; k++) {
                const ang = (k / 8) * TAU + now / 3000;
                const px = Math.cos(ang) * 62, py = -10 + Math.sin(ang) * 84;
                const len = 14 + Math.sin(now / 500 + k) * 5;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(ang + Math.PI / 2);
                apoly(g, [[-3.4, 0], [3.4, 0], [0, -len]], k % 2 ? c : a, 0.7);
                g.restore();
            }
            g.fillStyle(c, 0.12);
            g.fillCircle(0, -10, 80);
        } },
    ember: { a: 0x3a2a2a, draw: (g, now, c, a) => {
            // 余烬：暗底上飘的火星
            g.fillStyle(a, 0.2);
            g.fillEllipse(0, 30, 130, 150);
            for (let k = 0; k < 8; k++) {
                const ph = (now / 900 + k / 8) % 1;
                const gl = 0.5 + 0.5 * Math.sin(now / 180 + k * 2.1);
                g.fillStyle(k % 2 ? c : 0xffd45c, gl * (1 - ph));
                g.fillCircle(Math.sin(k * 2.6) * 44 + Math.sin(ph * 5 + k) * 8, 60 - ph * 180, (1.6 + gl) * (1 - ph) + 0.4);
            }
        } },
    sparkstorm: { a: 0xffffff, draw: (g, now, c, a) => {
            // 电暴：多道短电弧乱窜
            for (let k = 0; k < 5; k++) {
                const a0 = now / 90 + k * 1.31;
                const cx = Math.cos(a0) * 50, cy = -10 + Math.sin(a0) * 70;
                const dx = Math.sin(now / 70 + k * 3) * 14, dy = Math.cos(now / 85 + k) * 12;
                aline(g, [[cx, cy], [cx + dx, cy + dy], [cx + dx * 0.4, cy + dy + 10]], 1.8, k % 2 ? c : a, 0.8);
                g.fillStyle(a, 0.6);
                g.fillCircle(cx, cy, 2);
            }
        } },
    petalrain: { a: 0xff8fa8, draw: (g, now, c, a) => {
            // 花雨：多彩花瓣密雨
            const cols = [c, a, 0xffffff, 0xffd0e0];
            for (let k = 0; k < 9; k++) {
                const ph = (now / 1100 + k / 9) % 1;
                const px = Math.sin(k * 2.4) * 58 + Math.sin(ph * 7 + k) * 12;
                const py = -140 + ph * 270;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(now / 500 + k);
                g.fillStyle(cols[k % 4], 0.85 * Math.sin(ph * Math.PI));
                g.fillEllipse(0, 0, 8, 4.4);
                g.restore();
            }
        } },
    runering: { a: 0xffffff, draw: (g, now, c, a) => {
            // 符文环：环身刻度符环旋转
            g.lineStyle(2.4, c, 0.5);
            g.strokeEllipse(0, -10, 120, 168);
            g.lineStyle(1.2, a, 0.4);
            g.strokeEllipse(0, -10, 104, 148);
            for (let k = 0; k < 8; k++) {
                const ang = now / 1600 + (k / 8) * TAU;
                const px = Math.cos(ang) * 56, py = -10 + Math.sin(ang) * 78;
                const gl = 0.5 + 0.5 * Math.sin(now / 340 + k * 1.9);
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(ang);
                g.lineStyle(2, a, 0.75 * gl);
                g.lineBetween(-2.6, -6, 2.6, 6);
                g.lineBetween(2.6, -6, -2.6, 6);
                g.restore();
            }
        } },
};
