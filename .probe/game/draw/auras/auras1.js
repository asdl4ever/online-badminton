import { apoly, aline, TAU } from './shared.js';
/**
 * 第一批主题光环 → 背景特效（操场 / 沙漠 / 云端 / 甜点 / 马戏 / 骑士 / 茶馆 / 魔法 / 化石 / 玩具 / 元宵 / 山海）。
 * 每款按名字手工构图，画在角色身后；(0,0) = 角色躯干中心。
 */
export const AURAS_1 = {
    runAura: { a: 0x39d0a0, draw: (g, now, c, a) => {
            // 冲线光环：身后一条起伏的终点布带 + 计圈速度线 + 地面跑道
            const wave = [];
            for (let s = 0; s <= 12; s++) {
                const u = s / 12;
                wave.push([-84 + u * 168, -96 + Math.sin(u * 6.3 + now / 320) * 7]);
            }
            g.fillStyle(0xffffff, 0.75);
            g.beginPath();
            g.moveTo(wave[0][0], wave[0][1]);
            for (let s = 1; s < wave.length; s++)
                g.lineTo(wave[s][0], wave[s][1]);
            for (let s = wave.length - 1; s >= 0; s--)
                g.lineTo(wave[s][0], wave[s][1] + 16);
            g.closePath();
            g.fillPath();
            g.fillStyle(0x1a1a1a, 0.75);
            for (let s = 0; s < 6; s++) {
                const u0 = s / 6, u1 = (s + 0.5) / 6;
                const xa = -84 + u0 * 168, xb = -84 + u1 * 168;
                const ya = -96 + Math.sin(u0 * 6.3 + now / 320) * 7;
                const yb = -96 + Math.sin(u1 * 6.3 + now / 320) * 7;
                g.fillStyle(0x1a1a1a, 0.75);
                apoly(g, [[xa, ya], [xb, yb], [xb, yb + 16], [xa, ya + 16]], 0x1a1a1a, 0.75);
            }
            for (let k = 0; k < 5; k++) {
                const ph = (now / 340 + k / 5) % 1;
                g.lineStyle(2.6, k % 2 ? c : a, (1 - ph) * 0.7);
                g.lineBetween(-70 + k * 34, 40 - ph * 170, -70 + k * 34, 90 - ph * 170);
            }
            g.fillStyle(c, 0.4);
            g.fillEllipse(0, 86, 150, 20);
            g.lineStyle(2, a, 0.6);
            g.strokeEllipse(0, 86, 120, 15);
        } },
    desSandAura: { c: 0xc9803a, a: 0xf0d8a0, draw: (g, now, c, a) => {
            // 风沙环绕：身后滚动的沙暴墙 + 两道沙丘剪影 + 掠过的沙粒流
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1600 + k / 3) % 1;
                const wx = -110 + ph * 220;
                g.fillStyle(k % 2 ? c : a, 0.24 * Math.sin(ph * Math.PI));
                g.fillEllipse(wx, -40 + (k - 1) * 46, 84, 100);
            }
            g.fillStyle(c, 0.4);
            g.beginPath();
            g.moveTo(-100, 84);
            g.lineTo(-60, 44);
            g.lineTo(-20, 64);
            g.lineTo(30, 30);
            g.lineTo(80, 58);
            g.lineTo(100, 84);
            g.closePath();
            g.fillPath();
            for (let k = 0; k < 9; k++) {
                const ph = (now / 420 + k / 9) % 1;
                const sy = -100 + (k * 27) % 190;
                g.fillStyle(k % 3 ? a : c, 0.75 * (1 - ph));
                g.fillRect(-100 + ph * 200, sy + Math.sin(ph * 7 + k) * 7, 4.4, 1.6);
            }
            g.lineStyle(1.6, a, 0.4);
            g.beginPath();
            g.arc(20, -10, 60, now / 900, now / 900 + 1.8);
            g.strokePath();
        } },
    desSunAura: { c: 0xffd45c, a: 0xff9a4a, draw: (g, now, c, a) => {
            // 烈日光环：三层日芒的大日轮 + 呼吸日珥 + 地面热浪
            const r = 52 + Math.sin(now / 520) * 4;
            g.fillStyle(a, 0.14);
            g.fillCircle(0, -46, r + 46);
            g.fillStyle(c, 0.2);
            g.fillCircle(0, -46, r + 24);
            g.fillStyle(c, 0.85);
            g.fillCircle(0, -46, r);
            g.fillStyle(0xfff6d0, 0.7);
            g.fillCircle(-12, -58, r * 0.42);
            for (let k = 0; k < 12; k++) {
                const ang = (k / 12) * TAU + now / 2800;
                const len = 26 + (k % 3) * 12 + Math.sin(now / 320 + k * 1.4) * 6;
                apoly(g, [
                    [Math.cos(ang - 0.05) * (r - 2), -46 + Math.sin(ang - 0.05) * (r - 2)],
                    [Math.cos(ang - 0.02) * (r + len), -46 + Math.sin(ang - 0.02) * (r + len)],
                    [Math.cos(ang + 0.02) * (r + len), -46 + Math.sin(ang + 0.02) * (r + len)],
                    [Math.cos(ang + 0.05) * (r - 2), -46 + Math.sin(ang + 0.05) * (r - 2)],
                ], k % 2 ? c : a, 0.55);
            }
            for (let k = 0; k < 3; k++) {
                const ph = (now / 900 + k / 3) % 1;
                g.fillStyle(a, 0.2 * Math.sin(ph * Math.PI));
                g.fillEllipse(-70 + ph * 140, 74, 54, 10);
            }
        } },
    nimbWindAura: { c: 0xffffff, a: 0x9ad4ff, draw: (g, now, c, a) => {
            // 流风环绕：环身盘旋上升的风螺线 + 云丝 + 卷起的风叶
            for (let k = 0; k < 3; k++) {
                const pts = [];
                for (let s = 0; s <= 16; s++) {
                    const u = s / 16;
                    const ang = u * 4.4 + now / 1000 + (k / 3) * TAU;
                    pts.push([Math.cos(ang) * (18 + u * 54), 70 - u * 180]);
                }
                aline(g, pts, 3.4 - k * 0.7, k % 2 ? a : c, 0.6 - k * 0.12);
            }
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1300 + k / 3) % 1;
                g.fillStyle(0xffffff, 0.28 * Math.sin(ph * Math.PI));
                g.fillEllipse(-80 + ph * 160, -60 + (k % 2) * 70, 60, 14);
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 500 + k / 4) % 1;
                const ang = ph * 5 + k * 1.6;
                g.save();
                g.translateCanvas(Math.cos(ang) * 66, -10 + Math.sin(ang) * 30);
                g.rotateCanvas(ang * 2);
                apoly(g, [[0, -4], [7, 0], [0, 4]], a, 0.7 * (1 - ph));
                g.restore();
            }
        } },
    nimbStarAura: { c: 0xffe89a, a: 0xffffff, draw: (g, now, c, a) => {
            // 星云光环：身后紫蓝星云雾 + 亮星 + 两道小星轨
            g.fillStyle(0x6a4ae8, 0.2);
            g.fillEllipse(-28, -50, 110, 70);
            g.fillStyle(0x3a6ae8, 0.18);
            g.fillEllipse(34, 10, 90, 60);
            g.fillStyle(c, 0.14);
            g.fillEllipse(0, -30, 70, 50);
            for (let k = 0; k < 12; k++) {
                const tw = 0.3 + 0.7 * Math.abs(Math.sin(now / 280 + k * 1.9));
                const px = -92 + (k * 41) % 184, py = -120 + (k * 53) % 220;
                g.fillStyle(k % 3 ? a : c, tw);
                g.fillRect(px - 2.4, py - 0.7, 4.8, 1.4);
                g.fillRect(px - 0.7, py - 2.4, 1.4, 4.8);
            }
            for (let k = 0; k < 2; k++) {
                const ph = (now / 1500 + k / 2) % 1;
                const ang = ph * 2.4 + k * 3;
                aline(g, [[Math.cos(ang) * 70, -30 + Math.sin(ang) * 46], [Math.cos(ang) * 70 - 16, -30 + Math.sin(ang) * 46 - 9]], 1.6, c, 0.8 * (1 - ph));
            }
        } },
    confSugarAura: { c: 0xff869c, a: 0xfff0e0, draw: (g, now, c, a) => {
            // 糖霜环绕：身后缓缓落下的糖霜帘 + 底部堆起的糖霜 + 彩糖粒
            for (let k = 0; k < 8; k++) {
                const ph = (now / 1100 + k / 8) % 1;
                g.fillStyle(k % 2 ? a : c, 0.75 * Math.sin(ph * Math.PI));
                g.fillEllipse(-72 + (k * 21) % 144, -140 + ph * 220, 8, 4.6);
            }
            g.fillStyle(a, 0.5);
            g.beginPath();
            g.moveTo(-90, 88);
            g.lineTo(-70, 62);
            g.lineTo(-46, 80);
            g.lineTo(-16, 58);
            g.lineTo(14, 78);
            g.lineTo(48, 60);
            g.lineTo(78, 82);
            g.lineTo(90, 88);
            g.closePath();
            g.fillPath();
            for (let k = 0; k < 6; k++) {
                g.fillStyle([0xff869c, 0x9effd0, 0xffd45c, 0x4ac8ff][k % 4], 0.85);
                g.fillCircle(-60 + k * 24, 52 + (k % 3) * 7, 3);
            }
        } },
    confHeartAura: { c: 0xffb7d5, a: 0xffffff, draw: (g, now, c, a) => {
            // 爱心光环：身后一枚大爱心浮影 + 环绕上浮的小爱心 + 闪光
            const heart = (hx, hy, r, col, al) => {
                g.fillStyle(col, al);
                g.fillCircle(hx - r * 0.5, hy - r * 0.32, r * 0.56);
                g.fillCircle(hx + r * 0.5, hy - r * 0.32, r * 0.56);
                apoly(g, [[hx - r * 0.99, hy - r * 0.16], [hx + r * 0.99, hy - r * 0.16], [hx, hy + r]], col, al);
            };
            const beat = 1 + Math.max(0, Math.sin(now / 400)) * 0.08;
            heart(0, -14, 66 * beat, c, 0.22);
            heart(0, -14, 44 * beat, 0xff6f91, 0.3);
            for (let k = 0; k < 6; k++) {
                const ph = (now / 1300 + k / 6) % 1;
                const ang = (k / 6) * TAU + now / 1600;
                heart(Math.cos(ang) * 70, -10 + Math.sin(ang) * 60 - ph * 20, 6 + (k % 3) * 3, k % 2 ? c : a, 0.8 * Math.sin(ph * Math.PI));
            }
            for (let k = 0; k < 4; k++) {
                const tw = Math.abs(Math.sin(now / 240 + k * 1.8));
                g.fillStyle(a, tw * 0.8);
                g.fillRect(-50 + k * 28, -90 + (k % 2) * 40, 2, 7);
                g.fillRect(-52.5 + k * 28, -87.5 + (k % 2) * 40, 7, 2);
            }
        } },
    bigtConfetti: { c: 0xffd45c, a: 0xe8404a, draw: (g, now, c, a) => {
            // 彩纸环绕：漫天彩带卷曲下落 + 纸屑 + 环身彩旗
            const cols = [c, a, 0x4ac8ff, 0x9effd0, 0xff8ad4];
            for (let k = 0; k < 6; k++) {
                const ph = (now / 1300 + k / 6) % 1;
                const px = -80 + (k * 31) % 160;
                const py = -140 + ph * 270;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(now / 400 + k);
                g.lineStyle(2.6, cols[k % 5], 0.85 * Math.sin(ph * Math.PI));
                g.beginPath();
                g.arc(0, 0, 6, 0, Math.PI + Math.sin(now / 300 + k) * 0.6);
                g.strokePath();
                g.restore();
            }
            for (let k = 0; k < 8; k++) {
                const ph = (now / 900 + k / 8) % 1;
                g.fillStyle(cols[k % 5], 0.9 * Math.sin(ph * Math.PI));
                g.save();
                g.translateCanvas(-90 + (k * 23) % 180, -130 + ph * 250);
                g.rotateCanvas(Math.sin(now / 280 + k) * 1.4);
                g.fillRect(-3.4, -2, 6.8, 4);
                g.restore();
            }
            for (let k = 0; k < 5; k++) {
                g.fillStyle(cols[k % 5], 0.5);
                apoly(g, [[-60 + k * 30, -110], [-60 + k * 30, -96], [-45 + k * 30, -103]], cols[k % 5], 0.5);
            }
        } },
    bigtSpotAura: { c: 0xff869c, a: 0xfff0c0, draw: (g, now, c, a) => {
            // 聚光光环：左右两道摇摆的舞台光锥 + 地面光斑 + 光尘
            const sw = Math.sin(now / 900) * 16;
            apoly(g, [[-46 + sw, -160], [-16 + sw, -160], [36, 88], [-28, 88]], a, 0.2);
            apoly(g, [[16 - sw, -160], [46 - sw, -160], [28, 88], [-36, 88]], c, 0.16);
            g.fillStyle(0xffffff, 0.4);
            g.fillEllipse(4, 86, 96, 16);
            g.fillStyle(c, 0.2);
            g.fillEllipse(-20 + sw * 0.5, 82, 60, 12);
            for (let k = 0; k < 6; k++) {
                const ph = (now / 1000 + k / 6) % 1;
                g.fillStyle(a, 0.7 * (1 - ph));
                g.fillCircle(-30 + sw + Math.sin(k * 2.2) * 26, 60 - ph * 190, 1.6 * (1 - ph) + 0.4);
            }
        } },
    aegisBanner: { c: 0xc0392b, a: 0xd9b45c, draw: (g, now, c, a) => {
            // 战旗环绕：两杆挂旗 + 纹章 + 飘摆旗面
            for (const s of [-1, 1]) {
                const sway = Math.sin(now / 520 + s) * 5;
                aline(g, [[s * 74, -140], [s * 74, 96]], 3.4, 0x6a4a2a, 0.9);
                apoly(g, [
                    [s * 74, -132], [s * (116 + sway * 0.6), -126], [s * (108 + sway), 60], [s * (80 + sway), 44], [s * 74, 62],
                ], c, 0.85);
                g.fillStyle(a, 0.9);
                g.fillCircle(s * 92 + sway * 0.4, -88, 7);
                apoly(g, [[s * 92 + sway * 0.4, -104], [s * 99 + sway * 0.4, -92], [s * 92 + sway * 0.4, -80], [s * 85 + sway * 0.4, -92]], a, 0.6);
            }
            g.fillStyle(a, 0.5 + 0.2 * Math.sin(now / 600));
            g.fillCircle(0, -20, 4);
        } },
    aegisSteel: { c: 0xc0ccda, a: 0x8a94a2, draw: (g, now, c, a) => {
            // 钢铁光环：背后竖起的合金装甲板 + 铆钉 + 滑过的磨光
            apoly(g, [[-64, -128], [64, -128], [84, 106], [-84, 106]], c, 0.5);
            apoly(g, [[-64, -128], [0, -128], [0, 106], [-84, 106]], 0xdfe6f0, 0.28);
            g.lineStyle(3, a, 0.8);
            g.strokeRect(-56, -120, 112, 218);
            g.lineStyle(1.6, a, 0.6);
            g.lineBetween(-56, -40, 56, -40);
            g.lineBetween(-56, 40, 56, 40);
            for (let k = 0; k < 8; k++) {
                g.fillStyle(0x6a7686, 0.9);
                g.fillCircle(-48 + (k % 4) * 32, k < 4 ? -112 : 98, 2.6);
            }
            const sweep = (now / 1400) % 1;
            g.fillStyle(0xffffff, 0.16 * Math.sin(sweep * Math.PI));
            apoly(g, [[-90 + sweep * 180, 110], [-60 + sweep * 180, 110], [20 + sweep * 180, -130], [-10 + sweep * 180, -130]], 0xffffff, 0.14 * Math.sin(sweep * Math.PI));
        } },
    chanInkAura: { c: 0x2f7a4a, a: 0x8ac8a8, draw: (g, now, c, a) => {
            // 水墨环绕：身后晕开的墨涡 + 落墨点 + 一缕茶烟
            for (let k = 0; k < 4; k++) {
                const ph = (now / 2000 + k / 4) % 1;
                const r = 12 + ph * 52;
                g.fillStyle(k % 2 ? c : a, 0.2 * (1 - ph));
                g.beginPath();
                g.arc(Math.sin(k * 2.4) * 40, -20 + Math.cos(k * 1.7) * 30, r, 0, TAU);
                g.closePath();
                g.fillPath();
                g.lineStyle(1.6, k % 2 ? a : c, 0.4 * (1 - ph));
                g.strokeCircle(Math.sin(k * 2.4) * 40, -20 + Math.cos(k * 1.7) * 30, r);
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 900 + k / 4) % 1;
                g.fillStyle(c, 0.7 * (1 - ph));
                g.fillCircle(Math.sin(k * 3.1) * 44, 30 - ph * 130, 2.6 * (1 - ph) + 0.5);
            }
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1600 + k / 3) % 1;
                g.fillStyle(0xffffff, 0.3 * Math.sin(ph * Math.PI));
                g.fillEllipse(46 + Math.sin(ph * 5 + k) * 5, 40 - ph * 150, 12, 30 * (1 - ph) + 6);
            }
        } },
    chanPetalAura: { c: 0xffb7d5, a: 0xffffff, draw: (g, now, c, a) => {
            // 花瓣光环：一枝斜出的花枝 + 旋落的花瓣 + 花蕊光
            g.lineStyle(2.4, 0x6a4a3a, 0.6);
            g.lineBetween(-70, 90, -30, 20);
            g.lineBetween(-30, 20, 10, -50);
            for (let k = 0; k < 4; k++) {
                const px = [-70, -46, -30, 10][k] + 10, py = [90, 55, 20, -50][k] - 8;
                for (let p = 0; p < 5; p++) {
                    const ang = (p / 5) * TAU + now / 1800 + k;
                    g.fillStyle(k % 2 ? c : a, 0.7);
                    g.fillEllipse(px + Math.cos(ang) * 6, py + Math.sin(ang) * 6, 8, 5);
                }
                g.fillStyle(0xffd45c, 0.8);
                g.fillCircle(px, py, 2.4);
            }
            for (let k = 0; k < 7; k++) {
                const ph = (now / 1400 + k / 7) % 1;
                const px = Math.sin(k * 2.5) * 60 + Math.sin(ph * 5 + k) * 12;
                const py = -120 + ph * 250;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(now / 600 + k);
                g.fillStyle(k % 2 ? c : a, 0.8 * Math.sin(ph * Math.PI));
                g.fillEllipse(0, 0, 9, 5);
                g.restore();
            }
        } },
    arcanRuneAura: { c: 0xb46cff, a: 0xffd45c, draw: (g, now, c, a) => {
            // 符文环绕：身后一套缓转的魔法阵——双环 + 三重刻纹 + 六符文
            const r1 = 84, rot = now / 2400;
            g.lineStyle(2.4, c, 0.5);
            g.beginPath();
            g.arc(0, -14, r1, 0, TAU);
            g.closePath();
            g.strokePath();
            g.lineStyle(1.4, a, 0.4);
            g.beginPath();
            g.arc(0, -14, r1 - 12, 0, TAU);
            g.closePath();
            g.strokePath();
            for (let star = 0; star < 2; star++) {
                g.lineStyle(1.8, star ? a : c, 0.35);
                g.beginPath();
                for (let k = 0; k < 3; k++) {
                    const ang = rot * (star ? -1 : 1) + star * Math.PI / 3 + (k / 3) * TAU;
                    const px = Math.cos(ang) * (r1 - 12), py = -14 + Math.sin(ang) * (r1 - 12);
                    if (k === 0)
                        g.moveTo(px, py);
                    else
                        g.lineTo(px, py);
                }
                g.closePath();
                g.strokePath();
            }
            for (let k = 0; k < 6; k++) {
                const ang = rot + (k / 6) * TAU;
                const px = Math.cos(ang) * r1, py = -14 + Math.sin(ang) * r1;
                const gl = 0.5 + 0.5 * Math.sin(now / 260 + k * 2);
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(ang + Math.PI / 2);
                g.lineStyle(2, k % 2 ? a : c, 0.8 * gl);
                g.lineBetween(-3, -6, 3, 6);
                g.lineBetween(3, -6, -3, 6);
                g.lineBetween(-3, 0, 3, 0);
                g.restore();
                g.fillStyle(c, 0.2 * gl);
                g.fillCircle(px, py, 10);
            }
            g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 400));
            g.fillCircle(0, -14, 4.4);
        } },
    arcanStarAura: { c: 0xb46cff, a: 0xffe89a, draw: (g, now, c, a) => {
            // 星辉光环：身后的星座连线 + 大四芒星 + 划过的流星
            const stars = [[-70, -80], [-30, -110], [20, -90], [60, -120], [78, -60], [40, -30], [-10, -50], [-56, -34]];
            g.fillStyle(c, 0.1);
            g.beginPath();
            g.moveTo(stars[0][0], stars[0][1]);
            for (let k = 1; k < stars.length; k++)
                g.lineTo(stars[k][0], stars[k][1]);
            g.closePath();
            g.fillPath();
            g.lineStyle(1.4, a, 0.55);
            g.beginPath();
            g.moveTo(stars[0][0], stars[0][1]);
            for (let k = 1; k < stars.length; k++)
                g.lineTo(stars[k][0], stars[k][1]);
            g.closePath();
            g.strokePath();
            stars.forEach(([px, py], k) => {
                const tw = 0.5 + 0.5 * Math.abs(Math.sin(now / 260 + k * 1.7));
                g.fillStyle(a, tw);
                g.fillCircle(px, py, 2.2);
            });
            const sp = (now / 1200) % 1;
            const sx = -90 + sp * 180, sy = -130 + sp * 60;
            aline(g, [[sx, sy], [sx - 18, sy + 10]], 2, a, 0.9 * (1 - sp));
            g.fillStyle(0xffffff, (1 - sp));
            g.fillCircle(sx, sy, 2.2);
        } },
    relicDustAura: { c: 0xd8c8a0, a: 0xb8a880, draw: (g, now, c, a) => {
            // 尘土环绕：身后扬起的化石尘雾 + 半埋的骨影 + 沉降的尘粒
            for (let k = 0; k < 4; k++) {
                const ph = (now / 2200 + k / 4) % 1;
                g.fillStyle(k % 2 ? c : a, 0.18 * Math.sin(ph * Math.PI));
                g.fillEllipse(Math.sin(ph * TAU + k) * 40, 20 - ph * 40, 80, 34);
            }
            g.fillStyle(a, 0.35);
            g.fillEllipse(-50, 60, 60, 16);
            g.lineStyle(4, 0x8a7a5a, 0.4);
            g.lineBetween(-70, 66, -30, 56);
            g.fillCircle(-26, 54, 5);
            for (let k = 0; k < 8; k++) {
                const ph = (now / 1400 + k / 8) % 1;
                g.fillStyle(c, 0.6 * (1 - ph));
                g.fillCircle(-80 + (k * 23) % 160, -110 + ph * 200, 1.6 * (1 - ph) + 0.4);
            }
        } },
    relicAmberAura: { c: 0xffb02a, a: 0xffe8b0, draw: (g, now, c, a) => {
            // 琥珀光环：身后三块悬浮的琥珀 + 封存的古虫 + 内部流光
            const chunks = [[-44, 10, 22], [8, -40, 28], [48, 26, 18]];
            chunks.forEach(([ax, ay, r], k) => {
                const fl = 0.3 + 0.2 * Math.sin(now / 500 + k * 1.6);
                g.fillStyle(c, 0.4 + fl * 0.3);
                apoly(g, [[ax - r * 0.8, ay + r * 0.7], [ax - r * 0.5, ay - r * 0.8], [ax + r * 0.7, ay - r * 0.5], [ax + r * 0.6, ay + r * 0.8]], c, 0.45 + fl * 0.25);
                g.fillStyle(a, 0.35);
                apoly(g, [[ax - r * 0.8, ay + r * 0.7], [ax - r * 0.5, ay - r * 0.8], [ax, ay - r * 0.2], [ax - r * 0.3, ay + r * 0.5]], a, 0.3);
                g.fillStyle(0x5a3a1a, 0.7);
                g.fillEllipse(ax + 3, ay + 2, r * 0.4, r * 0.16);
                g.lineStyle(1, 0x5a3a1a, 0.5);
                g.lineBetween(ax + 3 - r * 0.2, ay + 1, ax + 3 + r * 0.2, ay + 1);
            });
            for (let k = 0; k < 3; k++) {
                const ph = (now / 800 + k / 3) % 1;
                g.fillStyle(a, 0.5 * (1 - ph));
                g.fillCircle(Math.sin(k * 2.4) * 40, 60 - ph * 140, 1.6 * (1 - ph) + 0.4);
            }
        } },
    playBallAura: { c: 0x4a90d9, a: 0xe8404a, draw: (g, now, c, a) => {
            // 弹球光环：环身弹跳的玩具球 + 弹跳轨迹虚线 + 落点光圈
            for (let k = 0; k < 3; k++) {
                const bx = -50 + k * 50;
                g.lineStyle(1.4, a, 0.3);
                g.beginPath();
                g.moveTo(bx, -90);
                let yy = -90;
                for (let s = 1; s <= 8; s++) {
                    const ph = (s / 8 + k * 0.37) % 1;
                    yy = 80 - Math.abs(Math.sin(ph * Math.PI * 2.5)) * (150 - ph * 60);
                    g.lineTo(bx + Math.sin(k * 2) * 20 + s * 4, yy);
                }
                g.strokePath();
                const ph = (now / 700 + k / 3) % 1;
                const by = 80 - Math.abs(Math.sin(ph * Math.PI * 2.5)) * (150 - ph * 60);
                g.fillStyle(k % 2 ? c : a, 0.9);
                g.fillCircle(bx + Math.sin(k * 2) * 20 + ph * 32, by, 5.4);
                g.fillStyle(0xffffff, 0.6);
                g.fillCircle(bx + Math.sin(k * 2) * 20 + ph * 32 - 1.6, by - 1.6, 1.6);
            }
        } },
    playSparkAura: { c: 0xffc04a, a: 0xffffff, draw: (g, now, c, a) => {
            // 火花光环：头顶旋转的风火轮火花 + 溅落的星火
            for (let k = 0; k < 8; k++) {
                const ang = now / 200 + (k / 8) * TAU;
                const rr = 40 + (k % 3) * 12;
                const px = Math.cos(ang) * rr, py = -110 + Math.sin(ang) * rr * 0.5;
                aline(g, [[px, py], [px + Math.cos(ang) * 12, py + Math.sin(ang) * 6]], 2.2, k % 2 ? c : a, 0.8);
            }
            for (let k = 0; k < 6; k++) {
                const ph = (now / 600 + k / 6) % 1;
                g.fillStyle(k % 2 ? c : a, 0.8 * (1 - ph));
                g.fillCircle(Math.sin(k * 2.7) * 50 + Math.sin(ph * 5 + k) * 6, -100 + ph * 200, 1.8 * (1 - ph) + 0.4);
            }
            g.fillStyle(c, 0.3);
            g.fillCircle(0, -110, 14);
        } },
    yuanFireAura: { c: 0xffd45c, a: 0xe8404a, draw: (g, now, c, a) => {
            // 焰火环绕：身后两侧炸开的烟花——外圈光点 + 内圈芒线 + 拖尾
            for (let k = 0; k < 2; k++) {
                const cx = k ? 56 : -56, cy = -60 + k * 30;
                const ph = (now / 1400 + k * 0.5) % 1;
                const rr = 14 + ph * 44;
                for (let s = 0; s < 10; s++) {
                    const ang = (s / 10) * TAU + k;
                    const gl = (1 - ph) * (0.5 + 0.5 * Math.sin(now / 150 + s));
                    g.fillStyle(s % 2 ? c : a, gl);
                    g.fillCircle(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 2.2 * (1 - ph) + 0.5);
                    aline(g, [[cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr], [cx + Math.cos(ang) * (rr - 8), cy + Math.sin(ang) * (rr - 8)]], 1.2, s % 2 ? c : a, gl * 0.6);
                }
                g.fillStyle(0xffffff, 0.8 * (1 - ph));
                g.fillCircle(cx, cy, 2);
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 700 + k / 4) % 1;
                g.fillStyle(a, 0.6 * (1 - ph));
                g.fillCircle(Math.sin(k * 2.2) * 40, 40 - ph * 130, 1.6 * (1 - ph) + 0.4);
            }
        } },
    yuanLanternAura: { c: 0xff869c, a: 0xffd45c, draw: (g, now, c, a) => {
            // 灯笼光环：身后悬浮的三盏灯笼 + 暖光晕 + 摆动的灯穗
            for (let k = 0; k < 3; k++) {
                const lx = -44 + k * 44;
                const ly = -60 + Math.sin(now / 700 + k * 1.4) * 6 + (k % 2) * 22;
                const gl = 0.7 + 0.3 * Math.sin(now / 340 + k * 1.9);
                g.fillStyle(a, 0.14 * gl);
                g.fillCircle(lx, ly, 26);
                g.lineStyle(1.2, a, 0.6);
                g.lineBetween(lx, ly - 26, lx, ly - 16);
                g.fillStyle(k % 2 ? c : 0xff9a4a, 0.9);
                g.fillEllipse(lx, ly, 15, 18);
                g.fillStyle(a, 0.9);
                g.fillRect(lx - 5, ly - 11, 10, 2.4);
                g.fillRect(lx - 5, ly + 9, 10, 2.4);
                g.fillStyle(0xfff0b0, gl);
                g.fillEllipse(lx, ly, 5.4, 9);
                g.lineStyle(1.2, a, 0.7);
                g.lineBetween(lx, ly + 11, lx + Math.sin(now / 500 + k) * 3, ly + 19);
            }
        } },
    shanAuraSpirit: { c: 0x9fe8c0, a: 0xffffff, draw: (g, now, c, a) => {
            // 灵气环绕：环身游走的青色灵雾 + 凝聚的灵珠
            for (let k = 0; k < 4; k++) {
                const ph = (now / 1800 + k / 4) % 1;
                const ang = ph * TAU + k * 1.7;
                const mx = Math.cos(ang) * (44 + (k % 2) * 22);
                const my = -10 + Math.sin(ang) * (60 + (k % 2) * 24);
                g.fillStyle(c, 0.18);
                g.fillEllipse(mx, my, 34, 20);
            }
            for (let k = 0; k < 5; k++) {
                const ph = (now / 900 + k / 5) % 1;
                const gl = Math.sin(ph * Math.PI);
                g.fillStyle(k % 2 ? c : a, 0.8 * gl);
                g.fillCircle(Math.cos(ph * 4 + k * 1.3) * 50, -10 + Math.sin(ph * 4 + k * 1.3) * 70, 2 + gl * 2);
            }
            g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 400));
            g.fillCircle(0, -14, 5);
            g.fillStyle(c, 0.2);
            g.fillCircle(0, -14, 12);
        } },
    shanAuraStar: { c: 0xffe89a, a: 0xd8e8ff, draw: (g, now, c, a) => {
            // 星汉光环：身后一条斜贯的银河 + 密集星点 + 顺流而下的星砂
            g.save();
            g.translateCanvas(0, -20);
            g.rotateCanvas(-0.4);
            g.fillStyle(0x8f7bff, 0.14);
            g.fillRect(-110, -18, 220, 36);
            g.fillStyle(0x5ac8ff, 0.12);
            g.fillRect(-110, -8, 220, 16);
            g.restore();
            for (let k = 0; k < 14; k++) {
                const tw = 0.3 + 0.7 * Math.abs(Math.sin(now / 250 + k * 1.6));
                const px = -95 + (k * 37) % 190, py = -120 + (k * 61) % 240;
                g.fillStyle(k % 3 ? a : c, tw);
                g.fillRect(px, py, 1.8, 1.8);
            }
            for (let k = 0; k < 5; k++) {
                const ph = (now / 800 + k / 5) % 1;
                const u = ph;
                const px = -90 + u * 180, py = -70 + u * 100;
                g.fillStyle(k % 2 ? c : a, 0.8 * (1 - ph));
                g.fillRect(px, py, 5, 1.4);
            }
        } },
};
