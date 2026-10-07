import { wpoly, TAU } from './shared.js';
/**
 * 批七主题背挂物件（赛博都市 / 东海龙宫 / 时空旅行）。
 * 全部 `single: true`：只画一次、不镜像、不随扇动旋转，动效在 painter 体内。
 */
export const WINGS_14 = {
    // ---- 赛博都市 ----
    cybBackA: { c: 0x39ffd0, a: 0xff3bd4, single: true, draw: (g, now, _flap, c, a) => {
            // 神经接驳缆：从颈后接出的一束发光缆线——三根缆 + 数据脉冲沿缆流动
            const pulses = [0, 0.4, 0.7];
            for (let k = 0; k < 3; k++) {
                const col = k === 0 ? c : k === 1 ? a : 0xffe15c;
                g.lineStyle(2, col, 0.85);
                g.beginPath();
                g.moveTo(-6, -2);
                g.lineTo(-14, 6 + Math.sin(now / 500 + k) * 2);
                g.lineTo(-24 - k * 4, 2 + Math.sin(now / 400 + k * 2) * 4);
                g.lineTo(-32 - k * 5, 12 + Math.sin(now / 600 + k) * 3);
                g.strokePath();
                // 数据脉冲（沿缆跑的亮点）
                const u = (now / 900 + pulses[k]) % 1;
                const px = -6 + u * (-26 - k * 5);
                const py = -2 + u * (10 + Math.sin(now / 500 + k) * 3);
                g.fillStyle(0xffffff, 0.9);
                g.fillCircle(px, py, 1.6);
                g.fillStyle(col, 0.4);
                g.fillCircle(px, py, 3.4);
            }
            g.fillStyle(0x39424e, 1); // 颈后接口
            g.fillRoundedRect(-9, -8, 8, 7, 2);
            const gl = 0.5 + 0.5 * Math.sin(now / 240); // 接口指示灯
            g.fillStyle(c, gl);
            g.fillCircle(-5, -4.6, 1.2);
        } },
    cybBackB: { c: 0xff3bd4, a: 0x39ffd0, single: true, draw: (g, now, _flap, c, a) => {
            // 悬浮无人机：绕体巡逻的四轴无人机——机身 + 旋翼光圈 + 扫描光束
            const ang = now / 1100;
            const px = Math.cos(ang) * 30, py = -26 + Math.sin(ang * 2) * 6;
            g.save();
            g.translateCanvas(px, py);
            const bank = Math.sin(ang) * 0.3;
            g.rotateCanvas(bank);
            g.fillStyle(0x39424e, 1); // 机身
            g.fillRoundedRect(-8, -4, 16, 8, 3);
            g.fillStyle(c, 0.9); // 机身灯带
            g.fillRect(-6, -1, 12, 2);
            for (const s of [-1, 1]) { // 双臂 + 旋翼光圈
                g.fillStyle(0x39424e, 1);
                g.fillRect(s * 8 - 1.6, -6, 3.2, 4);
                g.lineStyle(1.6, a, 0.5 + 0.3 * Math.abs(Math.sin(now / 90 + s)));
                g.strokeCircle(s * 10, -7, 4.4);
            }
            g.fillStyle(0xff5a5c, 0.7 + 0.3 * Math.sin(now / 200)); // 航行灯
            g.fillCircle(-7, 0, 1);
            g.fillStyle(0x7dffc4, Math.abs(Math.cos(now / 200)));
            g.fillCircle(7, 0, 1);
            g.restore();
            // 扫描光束（朝下的锥形光）
            g.fillStyle(c, 0.1);
            wpoly(g, [[px - 2, py + 4], [px + 2, py + 4], [px + 7, py + 26], [px - 7, py + 26]], c, 0.1);
        } },
    cybBackC: { c: 0x5ac8ff, a: 0xffe15c, single: true, draw: (g, now, _flap, c, a) => {
            // 数据芯片阵：背后悬浮的一圈数据芯片——六枚芯片绕转 + 引脚 + 读写闪
            const rot = now / 1800;
            for (let k = 0; k < 6; k++) {
                const ang = rot + (k / 6) * TAU;
                const px = Math.cos(ang) * 28, py = -16 + Math.sin(ang) * 20;
                const depth = (Math.sin(ang) + 1) / 2; // 前后景深
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(Math.sin(now / 500 + k) * 0.2);
                g.fillStyle(0x22303e, 0.95);
                g.fillRect(-4.4, -3.4, 8.8, 6.8);
                g.fillStyle(k % 2 ? c : a, 0.5 + depth * 0.4);
                g.fillRect(-3.2, -2.4, 6.4, 4.8);
                g.lineStyle(0.8, 0x8a94a2, 0.9); // 引脚
                for (let s = 0; s < 3; s++) {
                    g.lineBetween(-3 + s * 3, -4.4, -3 + s * 3, -3.4);
                    g.lineBetween(-3 + s * 3, 3.4, -3 + s * 3, 4.4);
                }
                const bl = Math.abs(Math.sin(now / 180 + k * 2)); // 读写闪
                g.fillStyle(0xffffff, bl * depth);
                g.fillCircle(2.4, -1.8, 0.8);
                g.restore();
            }
        } },
    cybBackD: { c: 0x39424e, a: 0x39ffd0, single: true, draw: (g, now, _flap, c, _a) => {
            // 等离子背包：背负的双罐等离子喷射背包——罐体 + 观察窗 + 喷焰 + 管线
            const bob = Math.sin(now / 620) * 1.6;
            g.save();
            g.translateCanvas(0, 2 + bob);
            for (const s of [-1, 1]) {
                g.fillStyle(c, 1);
                g.fillRoundedRect(s * 9 - 5.4, -18, 10.8, 30, 4);
                g.fillStyle(0x22303e, 0.9);
                g.fillRoundedRect(s * 9 - 3.8, -16, 7.6, 24, 3);
                // 等离子观察窗（翻涌发光）
                const gl = 0.5 + 0.4 * Math.sin(now / 240 + s);
                g.fillStyle(s > 0 ? 0x39ffd0 : 0xff3bd4, gl);
                g.fillRoundedRect(s * 9 - 2.6, -13, 5.2, 9, 2);
                g.fillStyle(0xffffff, gl * 0.7);
                g.fillCircle(s * 9 + Math.sin(now / 90 + s) * 1.4, -8.4, 1.2);
                // 底部喷口 + 喷焰
                g.fillStyle(0x22303e, 1);
                g.fillRect(s * 9 - 3, 12, 6, 4);
                const jet = 7 + Math.abs(Math.sin(now / 80 + s)) * 6;
                g.fillStyle(s > 0 ? 0x39ffd0 : 0xff3bd4, 0.7);
                g.fillTriangle(s * 9 - 3, 16, s * 9 + 3, 16, s * 9 + Math.sin(now / 100 + s) * 1.6, 16 + jet);
                g.lineStyle(1.6, 0x8a94a2, 1); // 连接管线
                if (s < 0)
                    g.lineBetween(4.4, -6, -3.6, -6);
            }
            g.restore();
        } },
    // ---- 东海龙宫 ----
    dgBackA: { c: 0xffd45c, a: 0xfff6d8, single: true, draw: (g, now, _flap, c, a) => {
            // 龙珠：悬浮的发光龙珠——珠体 + 内里龙影盘绕 + 外圈光环 + 珠光粒
            const bob = Math.sin(now / 760) * 3;
            const cy = -20 + bob;
            g.fillStyle(c, 0.15);
            g.fillCircle(0, cy, 26);
            g.fillStyle(c, 0.85);
            g.fillCircle(0, cy, 14);
            g.fillStyle(0xfff6d8, 0.6); // 珠面高光
            g.fillCircle(-4.4, cy - 4.4, 3.4);
            // 内里龙影（绕珠盘旋的暗纹）
            for (let k = 0; k < 5; k++) {
                const u = (now / 1200 + k / 5) % 1;
                const ang = u * 4.4;
                g.fillStyle(0x8a6a2a, 0.5 * Math.sin(u * Math.PI));
                g.fillCircle(Math.cos(ang) * 7, cy + Math.sin(ang) * 7, 1.6);
            }
            g.lineStyle(1.4, a, 0.5); // 外圈光环
            g.strokeCircle(0, cy, 19 + Math.sin(now / 400) * 1.6);
            for (let k = 0; k < 4; k++) { // 珠光粒（环绕逸散）
                const ang = now / 700 + (k / 4) * TAU;
                g.fillStyle(0xfff6d8, 0.7);
                g.fillCircle(Math.cos(ang) * 18, cy + Math.sin(ang) * 18, 1.3);
            }
        } },
    dgBackB: { c: 0xd9b45c, a: 0xff9a3c, single: true, draw: (g, now, _flap, c, _a) => {
            // 定海神针：背负的如意金箍棒式巨针——金柱 + 双端箍 + 刻「定海」纹 + 金光柱
            g.save();
            g.translateCanvas(-4, -6);
            g.rotateCanvas(-0.28 + Math.sin(now / 950) * 0.02);
            g.fillStyle(0xb8943a, 1); // 针柱
            g.fillRect(-3.6, -68, 7.2, 100);
            g.fillStyle(c, 0.8);
            g.fillRect(-3.6, -68, 2.4, 100);
            for (const s of [-1, 1]) { // 双端金箍
                g.fillStyle(0xffd45c, 1);
                g.fillRect(-5, s > 0 ? 24 : -68, 10, 8);
                g.fillStyle(0xfff0b0, 0.7);
                g.fillRect(-5, s > 0 ? 25 : -67, 10, 1.8);
            }
            for (let k = 0; k < 2; k++) { // 针身「定海」刻纹（方框刻字意象）
                g.lineStyle(1.2, 0x8a6a2a, 0.9);
                g.strokeRect(-2.6, -46 + k * 26, 5.2, 12);
            }
            const gl = 0.3 + 0.3 * Math.sin(now / 380); // 金光柱（针身外发光）
            g.fillStyle(0xffd45c, gl * 0.25);
            g.fillRect(-7, -68, 14, 100);
            g.restore();
        } },
    dgBackC: { c: 0xff8a9a, a: 0x7fd4ff, single: true, draw: (g, now, _flap, c, a) => {
            // 珊瑚枝：背后斜出的发光珊瑚枝——分枝 + 珊瑚虫触手 + 气泡
            g.lineStyle(4, 0xe86a7a, 0.9);
            g.lineBetween(-8, 20, -12, -4);
            g.lineBetween(-12, -4, -20, -18);
            g.lineBetween(-12, -4, -4, -22);
            g.lineStyle(2.6, c, 0.9);
            g.lineBetween(-20, -18, -24, -28);
            g.lineBetween(-20, -18, -16, -30);
            g.lineBetween(-4, -22, 2, -34);
            g.lineBetween(-4, -22, -8, -34);
            g.lineStyle(1.6, a, 0.7); // 末梢亮光
            g.lineBetween(-24, -28, -25, -33);
            g.lineBetween(2, -34, 4, -39);
            for (const [px, py] of [[-24, -28], [-16, -30], [2, -34], [-8, -34]]) { // 珊瑚虫触手（摇曳小须）
                for (let s = 0; s < 2; s++) {
                    g.lineStyle(0.9, a, 0.6);
                    g.lineBetween(px + s * 2 - 1, py, px + s * 2 - 1 + Math.sin(now / 300 + px + s) * 1.6, py - 4);
                }
            }
            for (let k = 0; k < 3; k++) { // 气泡上浮
                const ph = (now / 1300 + k / 3) % 1;
                g.lineStyle(1, 0xffffff, 0.5 * (1 - ph));
                g.strokeCircle(-14 + Math.sin(ph * 4 + k) * 4, -20 - ph * 34, 1.8 + ph * 1.6);
            }
        } },
    dgBackD: { c: 0x7fd4ff, a: 0xffffff, single: true, draw: (g, now, _flap, c, a) => {
            // 水涡轮：背后旋转的流水涡轮——三层叶轮反转 + 水流弧 + 溅泡
            const cy = -14 + Math.sin(now / 800) * 2;
            for (let k = 0; k < 3; k++) { // 三层叶轮（交替反转）
                const rot = (k % 2 ? -1 : 1) * (now / (500 + k * 180));
                const r = 12 + k * 9;
                for (let s = 0; s < 6; s++) {
                    const ang = rot + (s / 6) * TAU;
                    g.save();
                    g.translateCanvas(0, cy);
                    g.rotateCanvas(ang);
                    g.fillStyle(s % 2 ? c : 0x5ab8e8, 0.55);
                    g.fillEllipse(r * 0.7, 0, r * 0.6, 3);
                    g.restore();
                }
                g.lineStyle(1.2, a, 0.4);
                g.beginPath();
                g.arc(0, cy, r, 0, TAU);
                g.strokePath();
            }
            g.fillStyle(0xffffff, 0.85); // 轮心
            g.fillCircle(0, cy, 4);
            g.fillStyle(c, 0.5);
            g.fillCircle(0, cy, 6.4);
            for (let k = 0; k < 4; k++) { // 溅泡
                const ph = (now / 900 + k / 4) % 1;
                g.lineStyle(1, 0xffffff, 0.5 * (1 - ph));
                g.strokeCircle(Math.cos(k * 1.6) * 14, cy + Math.sin(k * 1.6) * 14 - ph * 16, 1.6 + ph);
            }
        } },
    // ---- 时空旅行 ----
    chronoBackA: { c: 0xffd45c, a: 0x9b5cff, single: true, draw: (g, now, _flap, _c, a) => {
            // 鎏金怀表：背后悬浮的巨大怀表——表壳 + 表盘走针 + 链条 + 时符逸散
            const bob = Math.sin(now / 780) * 2.4;
            g.save();
            g.translateCanvas(-10, -14 + bob);
            g.rotateCanvas(Math.sin(now / 900) * 0.06);
            g.fillStyle(0xb8943a, 1); // 表壳
            g.fillCircle(0, 0, 20);
            g.fillStyle(0xfff6d8, 0.9); // 表盘
            g.fillCircle(0, 0, 16);
            g.lineStyle(1, 0x8a6a2a, 0.8); // 刻度
            for (let k = 0; k < 12; k++) {
                const ang = (k / 12) * TAU;
                g.lineBetween(Math.cos(ang) * 12, Math.sin(ang) * 12, Math.cos(ang) * 14.4, Math.sin(ang) * 14.4);
            }
            const hour = (now / 12000) % 1, min = (now / 1800) % 1;
            g.lineStyle(2, 0x2a2010, 1); // 时针
            g.lineBetween(0, 0, Math.cos(hour * TAU - Math.PI / 2) * 7, Math.sin(hour * TAU - Math.PI / 2) * 7);
            g.lineStyle(1.2, 0x2a2010, 1); // 分针
            g.lineBetween(0, 0, Math.cos(min * TAU - Math.PI / 2) * 11, Math.sin(min * TAU - Math.PI / 2) * 11);
            g.fillStyle(0x9b5cff, 0.9); // 表冠
            g.fillCircle(0, -21, 3);
            g.restore();
            // 链条（从表冠垂下的三节链）
            for (let k = 0; k < 4; k++) {
                g.lineStyle(1.4, 0xb8943a, 0.9);
                g.strokeCircle(-10 - k * 3 + Math.sin(now / 500 + k) * 1.2, 2 + k * 6, 2);
            }
            for (let k = 0; k < 3; k++) { // 时符逸散（罗马数字光粒）
                const ph = (now / 1100 + k / 3) % 1;
                g.fillStyle(a, 0.6 * (1 - ph));
                g.fillCircle(-10 + Math.sin(ph * 4 + k) * 10, -14 + bob + ph * 26, 1.4 * (1 - ph) + 0.4);
            }
        } },
    chronoBackB: { c: 0x9b5cff, a: 0x5ac8ff, single: true, draw: (g, now, _flap, c, a) => {
            // 传送门环：背后旋转的时空传送门——双环 + 门内星涡 + 溢出的星屑
            const cy = -18;
            g.fillStyle(0x14102a, 0.8); // 门内暗域
            g.fillCircle(0, cy, 34);
            for (let k = 0; k < 3; k++) { // 门内星涡（三层旋转星臂）
                const rot = (k % 2 ? -1 : 1) * (now / (700 + k * 200));
                for (let s = 0; s < 5; s++) {
                    const ang = rot + (s / 5) * TAU;
                    const r = 6 + s * 5.4;
                    g.fillStyle(k % 2 ? a : c, 0.6);
                    g.fillCircle(Math.cos(ang) * r, cy + Math.sin(ang) * r * 0.9, 2 - k * 0.4);
                }
            }
            g.lineStyle(4, c, 0.95); // 外门环
            g.strokeCircle(0, cy, 36);
            g.lineStyle(1.6, a, 0.7); // 内环刻度
            g.strokeCircle(0, cy, 30);
            for (let k = 0; k < 8; k++) { // 环上时标
                const ang = (k / 8) * TAU + now / 1400;
                g.fillStyle(a, 0.8);
                g.fillRect(Math.cos(ang) * 33 - 1, cy + Math.sin(ang) * 33 - 1, 2, 2);
            }
            for (let k = 0; k < 5; k++) { // 溢出星屑（从门口飘出）
                const ph = (now / 1300 + k / 5) % 1;
                g.fillStyle(0xffffff, 0.7 * (1 - ph));
                g.fillCircle(Math.sin(k * 2.4) * 26, cy + 30 + ph * 40, 1.6 * (1 - ph) + 0.4);
            }
        } },
    chronoBackC: { c: 0xd9b45c, a: 0x9b5cff, single: true, draw: (g, now, _flap, c, _a) => {
            // 日晷盘：背后悬浮的黄铜日晷——晷盘 + 三角晷针 + 影子转动 + 刻度环
            const bob = Math.sin(now / 850) * 2;
            g.save();
            g.translateCanvas(-8, -12 + bob);
            g.rotateCanvas(-0.18);
            g.fillStyle(c, 0.95); // 晷盘（斜椭圆）
            g.fillEllipse(0, 0, 42, 16);
            g.fillStyle(0xb8943a, 0.7);
            g.fillEllipse(0, 1, 36, 12);
            g.lineStyle(1, 0x8a6a2a, 0.8); // 刻度环
            for (let k = 0; k < 12; k++) {
                const ang = (k / 12) * TAU;
                g.lineBetween(Math.cos(ang) * 15, Math.sin(ang) * 5.4, Math.cos(ang) * 19, Math.sin(ang) * 7);
            }
            g.fillStyle(0x8a6a2a, 1); // 晷针（斜三角）
            g.fillPoints([{ x: 0, y: -2 }, { x: -2.4, y: 2 }, { x: 2.4, y: 2 }, { x: 0, y: -12 }], true);
            // 针影（随时间转动的暗影）
            const shadow = now / 2400;
            g.fillStyle(0x4a3418, 0.6);
            g.fillEllipse(Math.cos(shadow) * 10, Math.sin(shadow) * 3.4 + 2, 10, 3);
            g.restore();
            for (let k = 0; k < 3; k++) { // 黄铜微光尘
                const ph = (now / 1400 + k / 3) % 1;
                g.fillStyle(c, 0.5 * (1 - ph));
                g.fillCircle(-8 + Math.sin(ph * 4 + k) * 12, -12 + bob + ph * 22, 1.2 * (1 - ph) + 0.3);
            }
        } },
    chronoBackD: { c: 0xbfe8f5, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
            // 流星辰漏：悬浮的黄铜星漏——双玻璃球 + 上落星辰 + 下积星光 + 黄铜架
            const bob = Math.sin(now / 700) * 2.4;
            g.save();
            g.translateCanvas(-10, -14 + bob);
            g.lineStyle(2.4, 0xb8943a, 1); // 黄铜架（上下圆盘 + 两侧柱）
            g.fillEllipse(0, -24, 22, 6);
            g.fillEllipse(0, 24, 22, 6);
            g.lineBetween(-9, -23, -9, 23);
            g.lineBetween(9, -23, 9, 23);
            g.fillStyle(c, 0.3); // 上玻璃球
            g.fillCircle(0, -12, 10);
            g.fillStyle(c, 0.45); // 下玻璃球（星光渐积）
            g.fillEllipse(0, 13, 9, 6);
            g.lineStyle(1.2, 0xffffff, 0.5); // 玻璃高光
            g.lineBetween(-5, -18, -7, -10);
            g.lineBetween(-4.4, 10, -6, 15);
            for (let k = 0; k < 5; k++) { // 星辰流泻（从上球流向下的星点）
                const ph = (now / 800 + k / 5) % 1;
                const py = -12 + ph * 25;
                const px = Math.sin(ph * 9 + k) * (3 - ph * 2);
                g.fillStyle(k % 2 ? a : 0xffffff, 0.85 * Math.sin(ph * Math.PI));
                g.fillCircle(px, py, 1.4 - ph * 0.6);
            }
            g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 300)); // 球腰流光
            g.fillRect(-1, -1, 2, 3);
            g.restore();
        } },
};
