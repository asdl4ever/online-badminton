import { wline, TAU } from './shared.js';
/**
 * 「背挂物件」批：名字不是翼 / 披风的背部装饰，按名字画成**别的形态**
 * （规范：部位只决定挂载位置，画法自由）。全部 `single: true`——
 * 只画一次、不镜像；原点 = 肩部锚点，可用范围 ±95 / -95~+25。
 */
export const WINGS_8 = {
    turbo: { c: 0x9fb6d8, a: 0xff8a3a, single: true, draw: (g, now, flap, c, _a) => {
            // 涡轮双翼：背挂双涡轮喷气包，喷口火舌随扇动伸缩 + 金属壳 + 铆钉
            for (const s of [-1, 1]) {
                const tx = s * 26;
                g.fillStyle(0x5a6a80, 1);
                g.fillRoundedRect(tx - 12, -34, 24, 46, 8);
                g.fillStyle(c, 1);
                g.fillRoundedRect(tx - 10, -32, 20, 42, 7);
                g.fillStyle(0xdfe6f0, 0.4);
                g.fillRect(tx - 8, -30, 5, 38); // 受光
                g.fillStyle(0x5a6a80, 1);
                g.fillCircle(tx, -38, 7); // 进气口
                g.fillStyle(0x1a2230, 1);
                g.fillCircle(tx, -38, 4);
                g.fillStyle(0xd9b45c, 0.9);
                g.fillCircle(tx - 6, -22, 1.4);
                g.fillCircle(tx + 6, -22, 1.4);
                g.fillStyle(0x2a3442, 1);
                g.fillEllipse(tx, 12, 18, 6); // 喷口
                // 喷焰（三层，随扇动伸缩）
                const jet = 16 + Math.sin(now / 90 + s) * 6 + flap * 8;
                g.fillStyle(0xff5a1a, 0.75);
                g.fillTriangle(tx - 7, 14, tx + 7, 14, tx + Math.sin(now / 120 + s) * 2, 14 + jet);
                g.fillStyle(0xffd45c, 0.85);
                g.fillTriangle(tx - 4, 14, tx + 4, 14, tx, 14 + jet * 0.6);
                g.fillStyle(0xffffff, 0.9);
                g.fillCircle(tx, 15, 2);
            }
            g.fillStyle(0x5a6a80, 1);
            g.fillRect(-10, -14, 20, 10); // 背带横梁
        } },
    manta: { c: 0x3fbfc9, a: 0x1a6a7a, single: true, draw: (g, now, _flap, c, a) => {
            // 蝠鲼：一条蝠鲼驮在背上游泳，双翼波浪状扑动 + 长尾摆
            const wave = Math.sin(now / 400);
            g.fillStyle(c, 0.95);
            g.fillPoints([
                { x: -78, y: -26 + wave * 5 }, { x: -30, y: -52 - wave * 4 }, { x: 6, y: -34 },
                { x: 42, y: -52 - wave * 4 }, { x: 82, y: -22 + wave * 5 },
                { x: 60, y: -4 }, { x: 20, y: 6 }, { x: -20, y: 8 }, { x: -58, y: -6 },
            ], true);
            g.fillStyle(0x6ad4dc, 0.5);
            g.fillEllipse(4, -22, 60, 20); // 背部亮面
            g.fillStyle(a, 0.9);
            g.fillCircle(-8, -24, 2.4);
            g.fillCircle(-16, -28, 1.8); // 眼斑
            g.lineStyle(2.4, a, 0.8);
            g.beginPath();
            for (let s = 0; s <= 8; s++) {
                const u = s / 8;
                const px = -20 - u * 58;
                const py = 4 + u * 14 + Math.sin(u * 6 + now / 300) * 6 * u;
                if (s === 0)
                    g.moveTo(px, py);
                else
                    g.lineTo(px, py);
            }
            g.strokePath(); // 长尾
            wline(g, [[-2, -30], [-20, -44 - wave * 4]], 1.4, a, 0.5); // 头鳍
        } },
    dragonfly: { c: 0x7fffd4, a: 0x5a8ab4, single: true, draw: (g, now, _flap, _c, a) => {
            // 蜻蜓：一只大蜻蜓停在背后，四片透明翅高频扑动 + 长腹分节
            const buzz = Math.sin(now / 60) * 0.3;
            for (const s of [-1, 1]) {
                for (let k = 0; k < 2; k++) {
                    g.save();
                    g.translateCanvas(s * 8, -38 + k * 6);
                    g.rotateCanvas(s * (0.5 + k * 0.35 + buzz));
                    g.fillStyle(0xd8fff0, 0.6);
                    g.fillEllipse(s * 26, 0, 46, 9);
                    g.lineStyle(1, a, 0.6);
                    g.lineBetween(0, 0, s * 48, 0);
                    g.restore();
                }
            }
            g.fillStyle(0x3a8a6a, 1);
            g.fillEllipse(0, -34, 14, 12); // 头
            g.fillStyle(0x1a3a2a, 1);
            g.fillCircle(-3, -36, 2.4);
            g.fillCircle(3, -36, 2.4); // 复眼
            g.fillStyle(0x2f7a5a, 1);
            g.fillRoundedRect(-4, -28, 8, 12, 3); // 胸
            for (let k = 0; k < 7; k++) {
                g.fillStyle(k % 2 ? 0x2f7a5a : 0x3a8a6a, 1);
                g.fillRect(-2.4, -14 + k * 7, 4.8, 6); // 分节长腹
            }
            g.fillStyle(0x1a3a2a, 1);
            g.fillEllipse(0, 34, 3.4, 6); // 腹尖
        } },
    nightjar: { c: 0x4a5a8a, a: 0xe8ecf4, single: true, draw: (g, now, _flap, c, a) => {
            // 夜鹰：一只夜鹰鸟伏在背后，偶尔展翅（扑动）+ 斑驳羽毛 + 亮眼
            const flapN = Math.max(0, Math.sin(now / 900)) ** 3; // 大部分时间伏着，偶尔扑一下
            g.fillStyle(c, 1);
            g.fillEllipse(0, -10, 76, 30); // 身
            g.fillStyle(0x3a4768, 0.9);
            g.fillEllipse(0, -2, 70, 16); // 腹面暗
            g.fillStyle(a, 0.5);
            for (let k = 0; k < 6; k++)
                g.fillEllipse(-28 + k * 11, -14 + (k % 2) * 6, 8, 2.4); // 斑纹
            g.fillStyle(c, 1);
            g.fillCircle(30, -18, 10); // 头
            g.fillStyle(0x1a2230, 0.9);
            g.fillTriangle(38, -20, 46, -17, 38, -15); // 喙
            g.fillStyle(0xffe89a, 0.95);
            g.fillCircle(32, -21, 2); // 亮眼
            g.fillStyle(0xffffff, 0.7);
            g.fillCircle(31.4, -21.6, 0.7);
            // 双翼（偶尔展开扑动）
            for (const s of [-1, 1]) {
                g.save();
                g.translateCanvas(s * 12, -16);
                g.rotateCanvas(s * (0.5 + flapN * 0.8));
                g.fillStyle(0x3a4768, 0.95);
                g.fillEllipse(s * 30, 0, 56, 14);
                g.fillStyle(a, 0.4);
                g.fillEllipse(s * 30, -2, 48, 6);
                g.restore();
            }
            g.fillStyle(c, 1);
            g.fillEllipse(-38, 2, 26, 8); // 尾
        } },
    mothKing: { c: 0xd8b070, a: 0x6a4a2a, single: true, draw: (g, now, _flap, c, a) => {
            // 蛾皇：一只巨型蛾伏在背上，双对翅缓慢开合 + 眼斑 + 绒毛身
            const fold = Math.sin(now / 700) * 0.35;
            for (const s of [-1, 1]) {
                // 上翅
                g.save();
                g.translateCanvas(s * 8, -22);
                g.rotateCanvas(s * fold);
                g.fillStyle(c, 0.95);
                g.fillEllipse(s * 30, -8, 58, 30);
                g.fillStyle(0xc9a060, 0.8);
                g.fillEllipse(s * 30, -4, 50, 20);
                g.fillStyle(a, 0.9); // 眼斑
                g.fillCircle(s * 40, -10, 6);
                g.fillStyle(0x2a1a0a, 0.9);
                g.fillCircle(s * 40, -10, 2.8);
                g.fillStyle(0xffffff, 0.4);
                g.fillCircle(s * 42, -12, 1.4);
                g.restore();
                // 下翅
                g.save();
                g.translateCanvas(s * 6, -8);
                g.rotateCanvas(s * fold * 1.2);
                g.fillStyle(0xc9a060, 0.9);
                g.fillEllipse(s * 22, 8, 40, 22);
                g.restore();
            }
            g.fillStyle(0x8a6a3a, 1); // 绒毛身
            g.fillRoundedRect(-7, -30, 14, 40, 6);
            g.fillStyle(0xa8843a, 0.7);
            for (let k = 0; k < 4; k++)
                g.fillCircle(0, -24 + k * 11, 3.4);
            g.lineStyle(1.6, a, 0.8); // 触角
            for (const s of [-1, 1]) {
                g.beginPath();
                g.moveTo(s * 3, -30);
                g.lineTo(s * 9, -40 - Math.sin(now / 300 + s) * 1.5);
                g.strokePath();
            }
        } },
    ribbonDance: { c: 0xffaad4, a: 0x4ac8ff, single: true, draw: (g, now, _flap, c, a) => {
            // 飘带：环身飞舞的三条绸带（各自波动 + 旋转），带光
            const cols = [c, a, 0xffd45c];
            for (let k = 0; k < 3; k++) {
                const pts = [];
                for (let s = 0; s <= 16; s++) {
                    const u = s / 16;
                    const ang = u * 3.2 - now / 600 + (k / 3) * Math.PI * 2;
                    pts.push([
                        Math.cos(ang) * (34 + u * 46),
                        -20 + Math.sin(ang) * (18 + u * 22) + Math.sin(u * 8 + now / 300 + k) * 7,
                    ]);
                }
                wline(g, pts, 4 - k, cols[k], 0.8);
            }
            for (let k = 0; k < 5; k++) {
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 260 + k * 1.7));
                g.fillStyle(0xffffff, tw * 0.7);
                g.fillCircle(Math.cos(k * 1.3 + now / 800) * 60, -20 + Math.sin(k * 1.3 + now / 800) * 34, 1.6);
            }
        } },
    rosewing: { c: 0xff6f91, a: 0x4fae4a, single: true, draw: (g, now, _flap, c, a) => {
            // 玫瑰：背后一朵盛开的巨型玫瑰 + 叶片 + 飘落花瓣 + 花心光
            g.lineStyle(3, a, 0.8); // 茎
            g.lineBetween(0, 10, 0, -8);
            for (const s of [-1, 1]) {
                g.fillStyle(a, 0.9);
                g.save();
                g.translateCanvas(s * 12, 0);
                g.rotateCanvas(s * 0.9);
                g.fillEllipse(s * 8, 0, 14, 6); // 叶
                g.restore();
            }
            for (let ring = 0; ring < 3; ring++) {
                const n = 5 + ring * 2, r = 14 + ring * 11;
                for (let k = 0; k < n; k++) {
                    const ang = (k / n) * TAU + ring * 0.4 + Math.sin(now / 900) * 0.04;
                    g.fillStyle(ring % 2 ? c : 0xff8fa8, 0.95 - ring * 0.12);
                    g.fillEllipse(Math.cos(ang) * r, -34 + Math.sin(ang) * r * 0.9, 16 - ring * 3, 10 - ring * 1.6);
                }
            }
            const gl = 0.5 + 0.5 * Math.sin(now / 320);
            g.fillStyle(0xfff0b0, gl * 0.8);
            g.fillCircle(0, -34, 4); // 花心
            for (let k = 0; k < 4; k++) {
                const ph = (now / 1400 + k / 4) % 1;
                g.fillStyle(c, 0.8 * (1 - ph));
                g.fillEllipse(-40 + k * 20 + Math.sin(ph * 5 + k) * 6, -50 + ph * 60, 7, 4);
            }
        } },
    bambooLeaf: { c: 0x9fd95a, a: 0x3a7a2a, single: true, draw: (g, now, _flap, c, a) => {
            // 竹叶：背后斜负的一捆竹枝 + 竹节 + 叶簇（随风摆）
            const sway = Math.sin(now / 600) * 2;
            for (let k = 0; k < 3; k++) {
                const bx = -14 + k * 14;
                g.lineStyle(4.4 - k * 0.6, k % 2 ? 0x7aa84a : c, 0.95);
                g.lineBetween(bx, 16, bx + 10 + sway * (1 - k * 0.2), -70 + k * 6);
                g.lineStyle(1.2, a, 0.6);
                for (let s = 0; s < 3; s++) {
                    g.lineBetween(bx + (10 + sway) * ((s + 1) / 4) - 3, 16 - ((s + 1) / 4) * 78, bx + (10 + sway) * ((s + 1) / 4) + 3, 16 - ((s + 1) / 4) * 78);
                }
                for (let s = 0; s < 3; s++) {
                    const ly = -20 - s * 16 + k * 4, lx = bx + (10 + sway) * (0.4 + s * 0.2);
                    g.fillStyle(s % 2 ? c : 0x8ac84a, 0.95);
                    g.save();
                    g.translateCanvas(lx, ly);
                    g.rotateCanvas(-0.5 + s * 0.2 + Math.sin(now / 500 + k + s) * 0.05);
                    g.fillEllipse(10, 0, 18, 4.4);
                    g.restore();
                }
            }
        } },
    reef: { c: 0xff8fa0, a: 0xc95a7a, single: true, draw: (g, now, _flap, c, a) => {
            // 珊瑚：背后一丛鹿角珊瑚 + 珊瑚虫触手摆动 + 上浮气泡
            const branches = [
                [[-30, 20], [-34, -8], [-44, -30], [-42, -46]],
                [[-34, -8], [-20, -22], [-14, -44]],
                [[0, 22], [4, -10], [-2, -36], [4, -56]],
                [[4, -10], [22, -24], [30, -46]],
                [[26, 18], [34, -6], [48, -20], [58, -34]],
            ];
            branches.forEach((b, k) => {
                wline(g, b, 7 - k * 0.7, k % 2 ? c : 0xffa8b4, 0.95);
                const tip = b[b.length - 1];
                g.fillStyle(a, 0.9);
                g.fillCircle(tip[0], tip[1], 2.6);
            });
            for (let k = 0; k < 5; k++) {
                const ph = now / 500 + k * 1.3;
                const px = [-42, -14, 4, 30, 58][k];
                const py = [-48, -46, -58, -48, -36][k] + Math.sin(ph) * 2;
                g.lineStyle(1.4, 0xffc4d0, 0.7);
                g.lineBetween(px, py, px + Math.sin(ph * 1.2) * 3, py - 6);
                g.fillStyle(0xffffff, 0.8);
                g.fillCircle(px + Math.sin(ph * 1.2) * 3, py - 7, 1.2); // 珊瑚虫触手
            }
            for (let k = 0; k < 4; k++) {
                const ph = (now / 1100 + k / 4) % 1;
                g.lineStyle(1.2, 0xffffff, 0.6 * (1 - ph));
                g.strokeCircle(-20 + k * 14, 0 - ph * 50, 2.2 * (1 - ph) + 0.6);
            }
        } },
    fireflyWing: { c: 0x2a3442, a: 0xd8ff6a, single: true, draw: (g, now, _flap, c, a) => {
            // 流萤：背后一团暗影树影 + 环身明灭飞舞的萤火虫群
            g.fillStyle(c, 0.35);
            g.fillEllipse(0, -30, 70, 90); // 夜色影
            for (let k = 0; k < 9; k++) {
                const ph = now / 1000 + k * 1.31;
                const px = Math.sin(ph * 0.8 + k * 2) * 58;
                const py = -40 + Math.sin(ph * 1.2 + k) * 52;
                const gl = Math.max(0, Math.sin(ph * 2.2));
                g.fillStyle(a, gl * 0.3);
                g.fillCircle(px, py, 5.4);
                g.fillStyle(k % 2 ? a : 0xffffff, gl);
                g.fillCircle(px, py, 1.8);
                // 小翅
                g.fillStyle(0xffffff, gl * 0.4);
                g.fillEllipse(px - 2, py - 1, 2.6, 1.2);
                g.fillEllipse(px + 2, py - 1, 2.6, 1.2);
            }
        } },
    spike: { c: 0xb8c4d6, a: 0x6a7686, single: true, draw: (g, now, _flap, c, _a) => {
            // 尖刺：背部竖起的金属刺阵（三排）+ 铆钉底座 + 寒光扫过
            const rows = [
                [[-44, 6], [-28, 6], [-12, 6], [4, 6], [20, 6], [36, 6]],
                [[-34, -8], [-18, -8], [-2, -8], [14, -8], [30, -8]],
                [[-22, -22], [-6, -22], [10, -22], [24, -22]],
            ];
            rows.forEach((row, r) => {
                row.forEach(([px, py], k) => {
                    const h = 22 - r * 6 - (k % 2) * 4;
                    const tipX = px + (k % 2 ? 1 : -1);
                    g.fillStyle(r % 2 ? c : 0xdfe6f0, 0.95);
                    g.fillPoints([
                        { x: px - 4.4, y: py }, { x: px + 4.4, y: py }, { x: tipX, y: py - h },
                    ], true);
                    g.fillStyle(0xffffff, 0.4);
                    g.fillPoints([
                        { x: px - 3, y: py }, { x: px - 0.4, y: py }, { x: tipX - 0.4, y: py - h },
                    ], true);
                });
            });
            g.fillStyle(0x5a6472, 0.95);
            g.fillRect(-48, 6, 92, 7);
            g.fillStyle(0xd9b45c, 0.9);
            for (let k = 0; k < 5; k++)
                g.fillCircle(-38 + k * 19, 9.5, 1.6);
            const sweep = (now / 1400) % 1;
            g.fillStyle(0xffffff, 0.16 * Math.sin(sweep * Math.PI));
            g.fillPoints([
                { x: -50 + sweep * 100, y: 8 }, { x: -36 + sweep * 100, y: 8 }, { x: -18 + sweep * 100, y: -44 }, { x: -32 + sweep * 100, y: -44 },
            ], true);
        } },
    cirrus: { c: 0xdcf4ff, a: 0x9ac8ee, single: true, draw: (g, now, _flap, c, a) => {
            // 云羽：背后一大朵卷云（多层云团缓慢漂移）+ 云隙光 + 环绕云絮
            const drift = Math.sin(now / 1300) * 5;
            g.fillStyle(a, 0.35);
            for (let k = 0; k < 4; k++)
                g.fillCircle(-24 + k * 16 + drift * 0.6, -34 + (k % 2) * 8, 13 - k % 3);
            g.fillStyle(c, 0.92);
            for (let k = 0; k < 5; k++) {
                g.fillCircle(-30 + k * 15 + drift, -30 + Math.sin(k * 2.2) * 7, 12 - k % 3);
                g.fillCircle(-24 + k * 15 + drift, -38 + Math.sin(k * 1.7) * 5, 8);
            }
            g.fillStyle(0xffffff, 0.5);
            for (let k = 0; k < 3; k++)
                g.fillCircle(-20 + k * 18 + drift, -44 + Math.sin(now / 500 + k) * 2, 4.4);
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1600 + k / 3) % 1;
                g.fillStyle(0xffffff, 0.5 * (1 - ph));
                g.fillEllipse(-50 + ph * 100 + Math.sin(ph * 4 + k) * 6, -54 - ph * 10, 16, 4);
            }
        } },
    chrono: { c: 0xb46cff, a: 0xffe89a, single: true, draw: (g, now, _flap, c, a) => {
            // 时空：背后一座缓缓旋转的巨钟盘——外环刻度 + 双针 + 幽光 + 环绕时之粒
            g.fillStyle(c, 0.1 + 0.05 * Math.sin(now / 500));
            g.fillCircle(0, -26, 62);
            g.lineStyle(3, c, 0.55);
            g.strokeCircle(0, -26, 52);
            g.lineStyle(1.4, a, 0.5);
            g.strokeCircle(0, -26, 44);
            for (let k = 0; k < 12; k++) {
                const ang = (k / 12) * TAU + now / 6000;
                g.lineStyle(2, a, 0.5);
                g.lineBetween(Math.cos(ang) * 46, -26 + Math.sin(ang) * 46, Math.cos(ang) * 51, -26 + Math.sin(ang) * 51);
            }
            const fast = now / 400, slow = now / 2400;
            wline(g, [[0, -26], [Math.cos(fast) * 34, -26 + Math.sin(fast) * 34]], 2.6, c, 0.9);
            wline(g, [[0, -26], [Math.cos(slow) * 26, -26 + Math.sin(slow) * 26]], 2, a, 0.7);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(0, -26, 3.4);
            for (let k = 0; k < 4; k++) {
                const ang = now / 700 + (k / 4) * Math.PI * 2;
                const px = Math.cos(ang) * 62, py = -26 + Math.sin(ang) * 62;
                g.fillStyle(a, 0.8);
                g.fillRect(px - 1.6, py - 0.5, 3.2, 1);
                g.fillRect(px - 0.5, py - 1.6, 1, 3.2);
            }
        } },
    abyss: { c: 0x2a4a8a, a: 0x5a8ab0, single: true, draw: (g, now, _flap, c, a) => {
            // 深渊：背后一个缓缓旋转的黑漩涡 + 吸入的光点 + 深渊之眼
            for (let k = 0; k < 4; k++) {
                const pts = [];
                for (let s = 0; s <= 14; s++) {
                    const u = s / 14;
                    const ang = u * 3.6 + now / 1400 + (k / 4) * Math.PI / 2;
                    const r = 12 + u * 52;
                    pts.push([Math.cos(ang) * r, -30 + Math.sin(ang) * r]);
                }
                wline(g, pts, 4 - k, k % 2 ? c : a, 0.4 - k * 0.05);
            }
            g.fillStyle(0x0a1020, 0.9);
            g.fillCircle(0, -30, 18);
            g.fillStyle(c, 0.4 + 0.2 * Math.sin(now / 400));
            g.fillCircle(0, -30, 6);
            for (let k = 0; k < 5; k++) {
                const ph = (now / 900 + k / 5) % 1;
                const ang = ph * 4 + k * 1.7;
                const r = 70 * (1 - ph) + 18;
                g.fillStyle(0xffffff, 0.8 * (1 - ph * 0.5));
                g.fillCircle(Math.cos(ang) * r, -30 + Math.sin(ang) * r, 1.6 * (1 - ph) + 0.4);
            }
        } },
};
