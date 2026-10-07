import { apoly, aline, TAU } from './shared.js';
/**
 * 第三批主题光环 → 背景特效（熔炉 / 海沟 / 道场 / 水墨 / 仙境 / 赛车 / 吸血鬼 / 丰收 / 熊猫 / 王牌）。
 * 每款按名字手工构图，画在角色身后；(0,0) = 角色躯干中心。
 */
export const AURAS_3 = {
    vulcAuraA: { c: 0xff5a1a, a: 0xffb02a, draw: (g, now, c, a) => {
            // 火星环绕：环身四溅的熔岩火星 + 脚下熔岩壳
            g.fillStyle(0x3a120a, 0.6);
            g.fillEllipse(0, 84, 110, 18);
            for (let k = 0; k < 5; k++)
                g.fillStyle(k % 2 ? c : a, 0.85), g.fillCircle(-36 + k * 18, 80 + (k % 2) * 4, 3);
            for (let k = 0; k < 9; k++) {
                const ph = (now / 500 + k / 9) % 1;
                const ang = -Math.PI / 2 + Math.sin(k * 2.7) * 1.1;
                const dist = ph * 110;
                const px = Math.cos(ang) * dist * 0.9, py = 78 - Math.abs(Math.sin(ang)) * dist * 1.4;
                const gl = 0.5 + 0.5 * Math.sin(now / 140 + k * 2.1);
                g.fillStyle(k % 2 ? c : a, gl * (1 - ph));
                g.fillCircle(px, py - 20 * ph, (1.8 + gl) * (1 - ph) + 0.4);
            }
        } },
    vulcAuraB: { c: 0xffb347, a: 0xff5a1a, draw: (g, now, c, a) => {
            // 熔流光环：背后流淌的熔岩瀑布 + 底部熔池 + 升腾热浪
            g.fillStyle(c, 0.35);
            apoly(g, [[-64, -130], [-40, -130], [-34, 40], [-58, 40]], c, 0.4);
            apoly(g, [[34, -130], [60, -130], [66, 30], [42, 30]], c, 0.4);
            g.fillStyle(a, 0.5);
            for (let k = 0; k < 6; k++) {
                const ph = (now / 500 + k / 6) % 1;
                g.fillEllipse(-50 + (k % 2) * 100, -120 + ph * 160, 6, 12);
            }
            g.fillStyle(a, 0.5);
            g.fillEllipse(0, 84, 150, 22);
            for (let k = 0; k < 4; k++) {
                const ph = (now / 800 + k / 4) % 1;
                g.fillStyle(0x8a2a1a, 0.2 * Math.sin(ph * Math.PI));
                g.fillEllipse(Math.sin(ph * 4 + k) * 40, 40 - ph * 60, 70, 30);
            }
        } },
    trenchAuraA: { c: 0x5fd0c0, a: 0x1a2a4a, draw: (g, now, c, a) => {
            // 气泡环绕：深海慢泡 + 一道探测光束 + 悬浮的微尘
            g.fillStyle(c, 0.1);
            apoly(g, [[20, -150], [46, -150], [86, 100], [50, 100]], c, 0.1);
            for (let k = 0; k < 8; k++) {
                const ph = (now / 2200 + k / 8) % 1;
                const bx = Math.sin(k * 2.9) * 56 + Math.sin(ph * 3 + k) * 8;
                const by = 90 - ph * 240;
                g.lineStyle(1.4, k % 3 ? c : a, 0.5 * (1 - ph * 0.4));
                g.strokeCircle(bx, by, 2.6 + (k % 3) * 2 + ph * 2);
            }
            for (let k = 0; k < 6; k++) {
                const ph = (now / 1800 + k / 6) % 1;
                g.fillStyle(0x8fb4de, 0.4 * Math.sin(ph * Math.PI));
                g.fillCircle(-80 + (k * 29) % 160, -90 + (k * 47) % 180, 1);
            }
        } },
    trenchAuraB: { c: 0x9ffcf0, a: 0x5affd8, draw: (g, now, c, a) => {
            // 深海光晕：环身脉动的深海生物光 + 发光触须 + 光点浮游
            const p1 = 0.5 + 0.5 * Math.sin(now / 600);
            g.fillStyle(c, 0.1 + p1 * 0.08);
            g.fillCircle(0, -10, 88);
            g.lineStyle(2.4, c, 0.4 + p1 * 0.3);
            g.strokeCircle(0, -10, 70 + p1 * 8);
            for (let k = 0; k < 5; k++) {
                const ang = (k / 5) * TAU + now / 1800;
                const pts = [];
                for (let s = 0; s <= 8; s++) {
                    const u = s / 8;
                    pts.push([Math.cos(ang) * (18 + u * 52) + Math.sin(u * 5 + now / 300 + k) * 7, -10 + Math.sin(ang) * (14 + u * 58) + Math.cos(u * 4 + now / 340 + k) * 7]);
                }
                aline(g, pts, 2, k % 2 ? c : a, 0.55);
                g.fillStyle(a, 0.8);
                g.fillCircle(pts[pts.length - 1][0], pts[pts.length - 1][1], 2.2);
            }
            for (let k = 0; k < 5; k++) {
                const gl = Math.max(0, Math.sin(now / 500 + k * 1.7));
                g.fillStyle(0xffffff, gl * 0.8);
                g.fillCircle(Math.sin(k * 2.5) * 60, -20 + Math.cos(k * 1.9) * 60, 1.6 + gl);
            }
        } },
    dojoAuraA: { c: 0xbfe8f0, a: 0x5a8a3a, draw: (g, now, c, a) => {
            // 汗珠环绕：训练甩出的汗珠 + 木地板反光 + 劲风线
            for (let k = 0; k < 6; k++) {
                const ph = (now / 600 + k / 6) % 1;
                const ang = k * 1.05 + Math.sin(now / 800) * 0.2;
                const px = Math.cos(ang) * (20 + ph * 50);
                const py = -20 + Math.sin(ang) * (16 + ph * 40) - ph * 30;
                g.fillStyle(c, 0.75 * (1 - ph));
                g.fillCircle(px, py, 2.6 * (1 - ph) + 0.6);
                g.fillStyle(0xffffff, 0.5 * (1 - ph));
                g.fillCircle(px - 0.8, py - 0.8, 0.8);
            }
            for (let k = 0; k < 3; k++) {
                const ph = (now / 350 + k / 3) % 1;
                g.lineStyle(2, a, (1 - ph) * 0.4);
                g.lineBetween(-90 + ph * 180, -80 + k * 50, -60 + ph * 180, -84 + k * 50);
            }
            g.fillStyle(0xc9a86a, 0.2);
            g.fillEllipse(0, 86, 140, 16);
        } },
    dojoAuraB: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, c, a) => {
            // 斗气光环：环身爆发的斗气弧 + 冲击波环 + 集中的气焰
            const p1 = 0.5 + 0.5 * Math.sin(now / 350);
            for (let k = 0; k < 4; k++) {
                const ang = (k / 4) * TAU + now / 500;
                g.fillStyle(k % 2 ? c : a, 0.3 + p1 * 0.2);
                apoly(g, [
                    [Math.cos(ang - 0.16) * 26, -10 + Math.sin(ang - 0.16) * 20],
                    [Math.cos(ang) * (66 + p1 * 16), -10 + Math.sin(ang) * (60 + p1 * 16)],
                    [Math.cos(ang + 0.16) * 26, -10 + Math.sin(ang + 0.16) * 20],
                ], k % 2 ? c : a, 0.35 + p1 * 0.2);
            }
            const ph = (now / 800) % 1;
            g.lineStyle(3 * (1 - ph) + 0.5, a, 0.6 * (1 - ph));
            g.strokeEllipse(0, -10, 40 + ph * 120, 60 + ph * 110);
            g.fillStyle(c, 0.2 + p1 * 0.15);
            g.fillCircle(0, -10, 20);
        } },
    inkwAuraA: { c: 0x2a2e36, a: 0xbfe8e0, draw: (g, now, c, a) => {
            // 墨点环绕：环身溅落的墨点 + 晕开的墨团 + 一笔飞白
            for (let k = 0; k < 5; k++) {
                const ph = (now / 1100 + k / 5) % 1;
                const px = Math.sin(k * 2.6) * 50 + Math.sin(ph * 5 + k) * 10;
                const py = -120 + ph * 240;
                g.fillStyle(c, 0.75 * Math.sin(ph * Math.PI));
                g.fillCircle(px, py, 2 + (k % 3) * 1.6);
                if (k % 2 === 0) {
                    g.fillStyle(c, 0.2 * Math.sin(ph * Math.PI));
                    g.fillCircle(px, py, 6 + (k % 3) * 3);
                }
            }
            const wob = Math.sin(now / 500);
            apoly(g, [
                [-84, -60], [-30, -74 + wob * 6], [40, -56 - wob * 6], [88, -70],
            ], c, 0.5);
            g.fillStyle(a, 0.5);
            apoly(g, [[-84, -60], [-30, -74 + wob * 6], [40, -56 - wob * 6]], a, 0.3);
        } },
    inkwAuraB: { c: 0xbfe8e0, a: 0x2a2e36, draw: (g, now, c, a) => {
            // 烟雨光环：斜织的雨丝 + 晕开的烟团 + 檐下水帘
            for (let k = 0; k < 7; k++) {
                const ph = (now / 400 + k / 7) % 1;
                const rx = -100 + ((ph + k / 7) % 1) * 200;
                const ry = -130 + ph * 240;
                g.lineStyle(1.4, c, 0.5 * (1 - ph));
                g.lineBetween(rx, ry, rx - 5, ry + 14);
            }
            for (let k = 0; k < 3; k++) {
                const ph = (now / 2000 + k / 3) % 1;
                g.fillStyle(a, 0.14 * Math.sin(ph * Math.PI));
                g.fillEllipse(Math.sin(ph * TAU + k) * 40, -30 + (k - 1) * 34, 76, 30);
            }
            g.lineStyle(2, a, 0.4);
            g.lineBetween(-80, -110, 80, -110);
            for (let k = 0; k < 5; k++) {
                const ph = (now / 300 + k / 5) % 1;
                g.fillStyle(c, 0.5 * (1 - ph));
                g.fillCircle(-64 + k * 32, -104 + ph * 30, 1.6);
            }
        } },
    fairyAuraA: { c: 0xffb7d5, a: 0xffffff, draw: (g, now, c, a) => {
            // 花粉环绕：环身飘散的花粉 + 旋转的花瓣风车 + 花影
            for (let k = 0; k < 10; k++) {
                const ph = (now / 1600 + k / 10) % 1;
                const px = Math.sin(k * 2.7) * 60 + Math.sin(ph * 5 + k) * 12;
                const py = 70 - ph * 220;
                g.fillStyle(k % 3 ? c : a, 0.7 * Math.sin(ph * Math.PI));
                g.fillCircle(px, py, 1.6 + (k % 3));
            }
            const spin = now / 900;
            for (let k = 0; k < 4; k++) {
                const ang = spin + (k / 4) * TAU;
                g.save();
                g.translateCanvas(46, -78);
                g.rotateCanvas(ang);
                g.fillStyle(k % 2 ? c : a, 0.6);
                g.fillEllipse(14, 0, 24, 9);
                g.restore();
            }
            g.fillStyle(c, 0.15);
            g.fillEllipse(-44, 60, 50, 22);
        } },
    fairyAuraB: { c: 0xfff2b0, a: 0xffe89a, draw: (g, now, c, a) => {
            // 萤光光环：环身飞舞的光精灵 + 萤光轨迹 + 中心光核
            for (let k = 0; k < 5; k++) {
                const ph = now / 1000 + k * 1.3;
                const px = Math.sin(ph * 0.8 + k * 2) * 58;
                const py = -20 + Math.sin(ph * 1.2 + k) * 64;
                const gl = Math.max(0, Math.sin(ph * 2.2));
                aline(g, [[px, py], [px - Math.sin(ph) * 10, py - Math.cos(ph) * 8]], 1.4, c, gl * 0.4);
                g.fillStyle(a, gl * 0.3);
                g.fillCircle(px, py, 5.4);
                g.fillStyle(0xffffff, gl);
                g.fillCircle(px, py, 1.8);
            }
            g.fillStyle(c, 0.2 + 0.1 * Math.sin(now / 400));
            g.fillCircle(0, -14, 22);
            g.fillStyle(0xffffff, 0.7);
            g.fillCircle(0, -14, 5);
        } },
    racerAuraA: { c: 0xff8a4a, a: 0x22222a, draw: (g, now, c, a) => {
            // 尾焰环绕：环身喷射的赛车尾焰 + 拉长的速度残影 + 赛道颗粒
            for (let k = 0; k < 2; k++) {
                const fy = -40 + k * 60;
                for (let s = 0; s < 4; s++) {
                    const ph = (now / 300 + s / 4 + k / 2) % 1;
                    g.fillStyle(s % 2 ? c : 0xffd45c, 0.6 * (1 - ph));
                    apoly(g, [
                        [70, fy - 7 + s], [70 + 44 * (1 - ph), fy - 3],
                        [70 + 50 * (1 - ph), fy], [70 + 44 * (1 - ph), fy + 3], [70, fy + 7 - s],
                    ], s % 2 ? c : 0xffd45c, 0.6 * (1 - ph));
                }
            }
            for (let k = 0; k < 5; k++) {
                const ph = (now / 250 + k / 5) % 1;
                g.lineStyle(2, k % 2 ? c : a, (1 - ph) * 0.5);
                g.lineBetween(-70 - ph * 40, -90 + k * 42, -110 - ph * 40, -90 + k * 42);
            }
            for (let k = 0; k < 5; k++) {
                const ph = (now / 200 + k / 5) % 1;
                g.fillStyle(a, 0.5 * (1 - ph));
                g.fillCircle(-90 + ph * 180, -100 + (k * 41) % 190, 1.4);
            }
        } },
    racerAuraB: { c: 0xffd45c, a: 0xe83a3a, draw: (g, now, c, a) => {
            // 涡流光环：环身高速旋转的气流涡 + 赛道旗门 + 火花
            for (let k = 0; k < 3; k++) {
                const pts = [];
                for (let s = 0; s <= 16; s++) {
                    const u = s / 16;
                    const ang = u * 5 - now / 160 + (k / 3) * TAU;
                    const r = 12 + u * 66;
                    pts.push([Math.cos(ang) * r, -10 + Math.sin(ang) * r * 1.25]);
                }
                aline(g, pts, 4 - k, k % 2 ? c : a, 0.5 - k * 0.1);
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 300 + k / 4) % 1;
                const px = Math.cos(ph * 6 + k) * 60, py = -10 + Math.sin(ph * 6 + k) * 74;
                g.fillStyle(k % 2 ? c : a, 0.8 * (1 - ph));
                g.fillCircle(px, py, 2 * (1 - ph) + 0.4);
            }
            g.lineStyle(2, a, 0.4);
            g.lineBetween(-30, -130, -30, -100);
            g.lineBetween(30, -130, 30, -100);
            g.fillStyle(c, 0.5);
            g.fillRect(-30, -126, 60, 6);
        } },
    vampAuraA: { c: 0x4a2a6a, a: 0xc8ccd8, draw: (g, now, c, a) => {
            // 蝠群环绕：环身盘旋的蝙蝠群 + 月下蝠影
            for (let k = 0; k < 5; k++) {
                const ph = now / 900 + k * 1.25;
                const bx = Math.sin(ph * 0.9 + k) * 62;
                const by = -30 + Math.sin(ph * 1.3 + k * 2) * 58;
                const flap = Math.sin(now / 90 + k * 2) * 5;
                g.fillStyle(k % 2 ? c : a, 0.75);
                apoly(g, [
                    [bx - 10, by - 3 - flap], [bx - 3, by], [bx, by + 2], [bx + 3, by], [bx + 10, by - 3 - flap],
                    [bx + 5, by + 3], [bx, by + 1.4], [bx - 5, by + 3],
                ], k % 2 ? c : a, 0.75);
            }
            g.fillStyle(c, 0.12);
            g.fillCircle(0, -10, 84);
        } },
    vampAuraB: { c: 0xc0203a, a: 0x1a1420, draw: (g, now, c, a) => {
            // 血月光环：背后一轮猩红满月 + 垂落的血雾 + 环绕的蝙蝠
            g.fillStyle(a, 0.5);
            g.fillCircle(0, -56, 80);
            g.fillStyle(c, 0.85);
            g.fillCircle(0, -56, 52);
            g.fillStyle(0x7a1020, 0.6);
            g.fillCircle(14, -68, 9);
            g.fillCircle(-16, -46, 6);
            for (let k = 0; k < 4; k++) {
                const ph = (now / 1500 + k / 4) % 1;
                g.fillStyle(c, 0.2 * Math.sin(ph * Math.PI));
                g.fillEllipse(Math.sin(k * 2.2) * 44, -10 + ph * 80, 40, 22);
            }
            for (let k = 0; k < 3; k++) {
                const ph = now / 700 + k * 2.1;
                const bx = Math.cos(ph) * 74, by = -50 + Math.sin(ph * 1.2) * 40;
                const flap = Math.sin(now / 80 + k) * 4;
                g.fillStyle(0x1a1420, 0.85);
                apoly(g, [[bx - 7, by - 2 - flap], [bx, by + 1], [bx + 7, by - 2 - flap], [bx, by + 3]], 0x1a1420, 0.85);
            }
        } },
    autumnAuraA: { c: 0xd4622a, a: 0xffd45c, draw: (g, now, c, a) => {
            // 落叶环绕：环身旋落的秋叶 + 底部落叶堆 + 打转的叶旋风
            for (let k = 0; k < 7; k++) {
                const ph = (now / 1500 + k / 7) % 1;
                const px = Math.sin(k * 2.7) * 56 + Math.sin(ph * 6 + k) * 14;
                const py = -130 + ph * 250;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(now / 450 + k * 1.3);
                apoly(g, [[0, -6], [6, 0], [0, 6], [-6, 0]], k % 2 ? c : a, 0.85 * Math.sin(ph * Math.PI));
                aline(g, [[0, -6], [0, 6]], 1, 0x8a4a1a, 0.5);
                g.restore();
            }
            g.fillStyle(a, 0.35);
            g.fillEllipse(0, 84, 120, 14);
            const sp = now / 700;
            for (let k = 0; k < 3; k++) {
                const ang = sp + (k / 3) * TAU;
                g.fillStyle(c, 0.6);
                g.fillCircle(Math.cos(ang) * 20, 78 + Math.sin(ang) * 4, 3);
            }
        } },
    autumnAuraB: { c: 0xffd45c, a: 0xd88a2a, draw: (g, now, c, a) => {
            // 稻香光环：身后成熟的稻穗丛 + 摇曳的麦浪 + 飘起的稻草屑
            for (let k = 0; k < 6; k++) {
                const hx = -70 + k * 28;
                const sway = Math.sin(now / 600 + k * 0.9) * 5;
                g.lineStyle(2, a, 0.55);
                g.lineBetween(hx, 90, hx + sway, 44);
                for (let s = 0; s < 4; s++) {
                    g.fillStyle(k % 2 ? c : a, 0.8);
                    g.fillEllipse(hx + sway + Math.sin(s * 2.2) * 4, 40 + s * 6, 5, 8);
                }
            }
            for (let k = 0; k < 3; k++) {
                const ph = (now / 800 + k / 3) % 1;
                g.fillStyle(a, 0.4 * Math.sin(ph * Math.PI));
                g.fillEllipse(-70 + ph * 140, 30 + (k % 2) * 24, 60, 12);
            }
            for (let k = 0; k < 5; k++) {
                const ph = (now / 900 + k / 5) % 1;
                g.fillStyle(c, 0.7 * (1 - ph));
                g.fillRect(Math.sin(k * 2.4) * 50 + Math.sin(ph * 6 + k) * 8, 40 - ph * 130, 5, 1.4);
            }
        } },
    pandaAuraA: { c: 0x8fbf5a, a: 0x4a6a2a, draw: (g, now, c, a) => {
            // 竹叶环绕：身后两竿青竹 + 旋落的竹叶 + 竹节光
            for (const s of [-1, 1]) {
                const bx = s * 56;
                g.lineStyle(5, s > 0 ? 0x7aa84a : c, 0.6);
                g.lineBetween(bx, 100, bx + s * 6, -130);
                g.lineStyle(1.4, a, 0.5);
                for (let k = 0; k < 4; k++) {
                    const by = 70 - k * 46;
                    g.lineBetween(bx + s * (2 + k * 1.5) - 4, by, bx + s * (2 + k * 1.5) + 4, by);
                }
                g.fillStyle(0x7aa84a, 0.7);
                g.save();
                g.translateCanvas(bx + s * 4, -30);
                g.rotateCanvas(s * -0.7);
                apoly(g, [[0, 0], [22, 6], [34, 16], [18, 4]], 0x7aa84a, 0.6);
                g.restore();
            }
            for (let k = 0; k < 5; k++) {
                const ph = (now / 1400 + k / 5) % 1;
                const px = Math.sin(k * 2.5) * 50 + Math.sin(ph * 5 + k) * 10;
                const py = -120 + ph * 240;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(now / 500 + k);
                apoly(g, [[0, -5], [7, 0], [0, 5]], k % 2 ? c : a, 0.8 * Math.sin(ph * Math.PI));
                g.restore();
            }
        } },
    pandaAuraB: { c: 0xdcefff, a: 0xffffff, draw: (g, now, c, a) => {
            // 清风光环：环身拂过的清风 + 竹影婆娑 + 飘起的白色光羽
            for (let k = 0; k < 3; k++) {
                const ph = (now / 700 + k / 3) % 1;
                g.lineStyle(2.6, k % 2 ? c : a, (1 - ph) * 0.5);
                g.lineBetween(-100 + ph * 200, -70 + k * 50, -55 + ph * 200, -76 + k * 50);
            }
            for (let k = 0; k < 4; k++) {
                const hx = -60 + k * 40;
                g.lineStyle(2, 0x7aa84a, 0.35);
                g.lineBetween(hx, 90, hx + Math.sin(now / 500 + k) * 6, 40);
            }
            for (let k = 0; k < 5; k++) {
                const ph = (now / 1300 + k / 5) % 1;
                const px = Math.sin(k * 2.3) * 52 + Math.sin(ph * 5 + k) * 14;
                const py = 60 - ph * 200;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(Math.sin(now / 400 + k) * 0.5);
                apoly(g, [[-3.4, -8], [3.4, -8], [2, 8], [-2, 8]], k % 2 ? c : a, 0.8 * Math.sin(ph * Math.PI));
                g.restore();
            }
        } },
    jokerAuraA: { c: 0xff8ad4, a: 0xffd45c, draw: (g, now, c, a) => {
            // 花色环绕：环身旋转飘落的四色扑克花色 + 弹跳的骰子
            const suits = ['heart', 'diamond', 'spade', 'club'];
            const suitCol = [0xe8404a, 0xe8404a, 0x1a1a2a, 0x1a1a2a];
            for (let k = 0; k < 6; k++) {
                const ph = (now / 1400 + k / 6) % 1;
                const px = Math.sin(k * 2.6) * 56 + Math.sin(ph * 5 + k) * 12;
                const py = -130 + ph * 260;
                const si = (k + Math.floor(now / 3000)) % 4;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(Math.sin(now / 400 + k) * 0.6);
                const col = suits[si] === 'heart' || suits[si] === 'diamond' ? suitCol[0] : suitCol[2];
                if (suits[si] === 'heart') {
                    g.fillStyle(col, 0.8 * Math.sin(ph * Math.PI));
                    g.fillCircle(px * 0 + -1.6, -1, 2);
                    g.fillCircle(1.6, -1, 2);
                    apoly(g, [[-3.2, -0.4], [3.2, -0.4], [0, 3.6]], col, 0.8);
                }
                else if (suits[si] === 'diamond') {
                    apoly(g, [[0, -3.4], [2.6, 0], [0, 3.4], [-2.6, 0]], col, 0.8);
                }
                else if (suits[si] === 'spade') {
                    apoly(g, [[0, -3.4], [-3, 0.6], [3, 0.6]], col, 0.8);
                    g.fillRect(-1, 0.6, 1.6, 2.6);
                }
                else {
                    g.fillCircle(-1.2, -0.8, 1.5);
                    g.fillCircle(1.2, -0.8, 1.5);
                    g.fillCircle(0, 1, 1.5);
                }
                g.restore();
            }
            for (let k = 0; k < 2; k++) {
                const ph = (now / 700 + k / 2) % 1;
                const dx = -30 + k * 60;
                const dy = 40 - Math.abs(Math.sin(ph * Math.PI)) * 50;
                g.save();
                g.translateCanvas(dx, dy);
                g.rotateCanvas(now / 300 + k);
                g.fillStyle(0xffffff, 0.9);
                g.fillRect(-4, -4, 8, 8);
                g.fillStyle(0x1a1a2a, 0.9);
                g.fillCircle(-1.6, -1.6, 0.9);
                g.fillCircle(1.6, 1.6, 0.9);
                g.restore();
            }
        } },
    jokerAuraB: { c: 0xffd45c, a: 0xffffff, draw: (g, now, c, a) => {
            // 王牌光环：身后展开的巨型王牌 + 旋转的 A 字 + 光边
            g.save();
            g.translateCanvas(0, -20);
            g.rotateCanvas(Math.sin(now / 1600) * 0.12);
            g.fillStyle(0xffffff, 0.85);
            g.fillRect(-34, -70, 68, 140);
            g.lineStyle(2, c, 0.8);
            g.strokeRect(-30, -66, 60, 132);
            const spin = now / 1200;
            g.save();
            g.translateCanvas(0, 0);
            g.rotateCanvas(Math.sin(spin) * 0.2);
            g.fillStyle(c, 0.9);
            g.fillCircle(-6, -8, 4);
            g.fillCircle(6, -8, 4);
            apoly(g, [[-11.4, -5], [11.4, -5], [0, 12]], c, 0.9);
            g.fillStyle(0xe8404a, 0.9);
            g.fillRect(-1.4, 8, 2.8, 8);
            g.restore();
            g.fillStyle(0xe8404a, 0.9);
            g.fillRect(-28, -62, 5, 9);
            g.fillRect(-28, -62, 9, 4);
            g.fillStyle(0xe8404a, 0.9);
            g.save();
            g.translateCanvas(25, 60);
            g.rotateCanvas(Math.PI);
            g.fillRect(-4.4, -4.4, 5, 9);
            g.fillRect(-4.4, -4.4, 9, 4);
            g.restore();
            g.restore();
            for (let k = 0; k < 4; k++) {
                const tw = Math.abs(Math.sin(now / 260 + k * 1.6));
                g.fillStyle(a, tw * 0.7);
                g.fillRect(-70 + (k * 41) % 140, -110 + (k % 2) * 30, 2, 7);
                g.fillRect(-71.5 + (k * 41) % 140, -108.5 + (k % 2) * 30, 5, 2);
            }
        } },
};
