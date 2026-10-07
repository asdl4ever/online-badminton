import { wpoly, TAU } from './shared.js';
/**
 * 批九主题背挂物件（童话王国 / 深夜食堂 / 猫咖物语）。
 * 全部 `single: true`：只画一次、不镜像、不随扇动旋转，动效在 painter 体内。
 */
export const WINGS_16 = {
    // ---- 童话王国 ----
    taleBackA: { c: 0x9b5cff, a: 0xffd45c, single: true, draw: (g, now, _flap, _c, a) => {
            // 魔法典籍：身后摊开的悬浮魔法书——书页自翻 + 悬浮符文 + 星屑
            const bob = Math.sin(now / 800) * 2.4;
            g.save();
            g.translateCanvas(-10, -10 + bob);
            const flip = Math.abs(Math.sin(now / 900));
            g.fillStyle(0x463456, 1); // 封底
            g.fillPoints([
                { x: 0, y: -12 }, { x: 18, y: -8 }, { x: 18, y: 12 }, { x: 0, y: 8 },
                { x: -18, y: 12 }, { x: -18, y: -8 },
            ], true);
            g.fillStyle(0xfff6d8, 0.95); // 摊开书页
            g.fillPoints([
                { x: 0, y: -10 }, { x: 15, y: -6.4 }, { x: 15, y: 10 }, { x: 0, y: 6 },
            ], true);
            g.fillPoints([
                { x: 0, y: -10 }, { x: -15, y: -6.4 }, { x: -15, y: 10 }, { x: 0, y: 6 },
            ], true);
            // 自动翻页的书页角
            g.fillStyle(0xfff6d8, 0.85);
            g.save();
            g.translateCanvas(0, -10);
            g.rotateCanvas(-flip * 0.9);
            g.fillPoints([{ x: 0, y: 0 }, { x: 14, y: 2 }, { x: 12, y: 12 }], true);
            g.restore();
            // 符文行
            g.lineStyle(0.9, 0x9b5cff, 0.8);
            for (let k = 0; k < 2; k++) {
                g.lineBetween(-13, -2 + k * 5, -3, -2.6 + k * 5);
                g.lineBetween(3, -3.4 + k * 5, 13, -3 + k * 5);
            }
            // 悬浮符文星（绕书转）
            for (let k = 0; k < 4; k++) {
                const ang = now / 700 + (k / 4) * TAU;
                const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 300 + k));
                g.fillStyle(a, gl);
                g.save();
                g.translateCanvas(Math.cos(ang) * 26, Math.sin(ang) * 18);
                g.rotateCanvas(ang);
                g.fillRect(-1.4, -2.4, 2.8, 4.8);
                g.restore();
            }
            g.restore();
        } },
    taleBackB: { c: 0xffd45c, a: 0x9b5cff, single: true, draw: (g, now, _flap, c, a) => {
            // 王权宝球：背后的权杖十字宝球——金球 + 十字 + 珠宝带 + 圣光
            const bob = Math.sin(now / 760) * 2.4;
            g.save();
            g.translateCanvas(-10, -14 + bob);
            g.rotateCanvas(Math.sin(now / 850) * 0.05);
            g.fillStyle(c, 0.15);
            g.fillCircle(0, 0, 30);
            g.fillStyle(c, 0.95); // 金球
            g.fillCircle(0, 0, 18);
            g.fillStyle(0xfff0b0, 0.5); // 球面高光
            g.fillCircle(-5, -6, 6);
            g.lineStyle(2, 0x8a6a2a, 0.9); // 珠宝赤道带
            g.beginPath();
            g.arc(0, 0, 18, 0.4, Math.PI - 0.4);
            g.strokePath();
            for (let k = 0; k < 3; k++) { // 带上宝石
                const ang = 0.9 + k * 0.7;
                g.fillStyle(a, 0.95);
                g.fillCircle(Math.cos(ang) * 17, Math.sin(ang) * 17, 1.6);
            }
            g.fillStyle(c, 1); // 顶十字
            g.fillRect(-2, -34, 4, 14);
            g.fillRect(-7, -29, 14, 4);
            g.fillStyle(0xffffff, 0.6 + 0.3 * Math.sin(now / 260)); // 球心圣光
            g.fillCircle(2, -4, 2.4);
            g.restore();
        } },
    taleBackC: { c: 0xb8c0cc, a: 0xffd45c, single: true, draw: (g, now, _flap, _c, a) => {
            // 石中剑：背负的迷你「石中剑」景观——小石座 + 插着的圣剑 + 拔剑微光
            const bob = Math.sin(now / 820) * 1.8;
            g.save();
            g.translateCanvas(-8, 6 + bob);
            g.fillStyle(0x8a94a2, 0.95); // 石座（多面石块）
            wpoly(g, [[-12, 10], [-8, -4], [0, -8], [8, -4], [12, 10]], 0x8a94a2, 0.95);
            g.fillStyle(0x6a7480, 0.7);
            wpoly(g, [[-12, 10], [-8, -4], [-2, -6], [-4, 10]], 0x6a7480, 0.7);
            g.lineStyle(1, 0x5a6470, 0.8); // 石裂纹
            g.lineBetween(-4, -2, -6, 6);
            g.fillStyle(0xdfe8f5, 1); // 剑身（插入石中）
            g.fillPoints([
                { x: -2.4, y: -8 }, { x: -0.8, y: -34 }, { x: 0.8, y: -34 }, { x: 2.4, y: -8 },
            ], true);
            g.fillStyle(0xffd45c, 1); // 剑格
            g.fillRect(-5, -9, 10, 3);
            g.fillStyle(0x8a6a3a, 1); // 剑柄
            g.fillRect(-1.4, -17, 2.8, 8);
            g.fillStyle(0xffd45c, 0.9); // 柄尾宝珠
            g.fillCircle(0, -18.4, 2.2);
            const gl = 0.3 + 0.3 * Math.sin(now / 420); // 剑身微光（等待拔出）
            g.fillStyle(0xffffff, gl);
            g.fillRect(-2.4, -30, 4.8, 2);
            g.restore();
            for (let k = 0; k < 3; k++) { // 剑柄逸出的微光尘
                const ph = (now / 1200 + k / 3) % 1;
                g.fillStyle(a, 0.6 * (1 - ph));
                g.fillCircle(-8 + Math.sin(ph * 4 + k) * 3, -14 + bob - ph * 16, 1.1 * (1 - ph) + 0.3);
            }
        } },
    taleBackD: { c: 0x8fd8ff, a: 0xff9adf, single: true, draw: (g, now, _flap, c, a) => {
            // 占卜水晶球：悬浮的水晶球——玻璃球 + 内里星象 + 底座云雾 + 星云旋
            const bob = Math.sin(now / 700) * 2.6;
            g.save();
            g.translateCanvas(-10, -14 + bob);
            g.fillStyle(c, 0.2); // 玻璃球
            g.fillCircle(0, 0, 18);
            g.lineStyle(1.4, 0xffffff, 0.6); // 球面高光弧
            g.beginPath();
            g.arc(0, 0, 17, Math.PI * 1.1, Math.PI * 1.7);
            g.strokePath();
            g.fillStyle(0xffffff, 0.3);
            g.fillCircle(-6, -7, 3);
            // 内里星象（旋转的小星 + 迷你星座连线）
            const rot = now / 1400;
            const stars = [];
            for (let k = 0; k < 5; k++) {
                const ang = rot + (k / 5) * TAU;
                const px = Math.cos(ang) * 8, py = Math.sin(ang) * 8;
                stars.push([px, py]);
                g.fillStyle(0xffffff, 0.9);
                g.fillCircle(px, py, 1.2);
            }
            g.lineStyle(0.8, a, 0.6);
            stars.forEach(([px, py], k) => {
                const nx = stars[(k + 1) % stars.length];
                g.lineBetween(px, py, nx[0], nx[1]);
            });
            g.fillStyle(a, 0.25); // 内里星云
            g.fillCircle(3, 4, 5);
            g.fillStyle(0xb8943a, 0.95); // 黄铜底座
            g.fillEllipse(0, 20, 22, 7);
            g.fillStyle(0x8a6a2a, 0.8);
            g.fillEllipse(0, 17.4, 16, 4);
            g.restore();
            // 底座云雾
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1400 + k / 3) % 1;
                g.fillStyle(0xdff2ff, 0.25 * Math.sin(ph * Math.PI));
                g.fillCircle(-10 + Math.sin(ph * 4 + k) * 10, 22 + bob - ph * 14, 3 + ph * 4);
            }
        } },
    // ---- 深夜食堂 ----
    dinBackA: { c: 0xe8404a, a: 0xffd45c, single: true, draw: (g, now, _flap, _c, _a) => {
            // 灯笼串：肩后挑起的一串红灯笼——横杆 + 三只灯笼 + 暖光摇曳
            const bob = Math.sin(now / 620) * 1.6;
            g.save();
            g.translateCanvas(-6, -14 + bob);
            g.lineStyle(2.4, 0x6b4a2f, 1); // 挑杆
            g.lineBetween(-18, -6, 20, -10);
            for (let k = 0; k < 3; k++) {
                const lx = -12 + k * 14 + Math.sin(now / 400 + k) * 1.4;
                const ly = -4 + k % 2;
                g.lineStyle(1, 0x6b4a2f, 0.9);
                g.lineBetween(lx, ly - 4, lx, ly);
                const glow = 0.6 + 0.4 * Math.sin(now / 240 + k * 1.7);
                g.fillStyle(0xe8404a, 0.95); // 灯笼身
                g.fillEllipse(lx, ly + 8, 10, 13);
                g.fillStyle(0xffb84a, glow); // 灯心暖光
                g.fillEllipse(lx, ly + 8, 6, 8);
                g.fillStyle(0xfff0d8, 0.85); // 上下盖
                g.fillRect(lx - 3.4, ly - 1, 6.8, 2);
                g.fillRect(lx - 3.4, ly + 14, 6.8, 2);
                g.lineStyle(0.9, 0xffd45c, 0.7); // 灯笼骨
                g.lineBetween(lx - 4, ly + 8, lx + 4, ly + 8);
                g.fillStyle(0xffd45c, 0.9); // 灯穗
                g.fillRect(lx - 0.8, ly + 16, 1.6, 5);
            }
            g.restore();
        } },
    dinBackB: { c: 0x39424e, a: 0xff9a3c, single: true, draw: (g, now, _flap, c, _a) => {
            // 老汤大锅：背后咕嘟咕嘟的老汤锅——黑锅 + 汤面翻滚 + 热气 + 火苗
            const bob = Math.sin(now / 700) * 1.6;
            g.save();
            g.translateCanvas(-8, 6 + bob);
            g.fillStyle(c, 1); // 锅体
            g.fillEllipse(0, 10, 26, 14);
            g.fillStyle(0x22303e, 0.9);
            g.fillEllipse(0, 6, 24, 10);
            g.fillStyle(0xd9b45c, 0.9); // 锅沿
            g.fillEllipse(0, 2, 24, 7);
            g.fillStyle(0xd88a3a, 0.95); // 汤面
            g.fillEllipse(0, 2, 19, 4.6);
            // 汤面翻滚的泡
            for (let k = 0; k < 4; k++) {
                const ph = (now / 500 + k / 4) % 1;
                g.fillStyle(0xffe0b0, 0.7 * Math.sin(ph * Math.PI));
                g.fillCircle(-8 + k * 5.4, 2 - Math.sin(ph * Math.PI) * 1.6, 1.4 + ph);
            }
            // 灶火苗（锅下两簇）
            for (const s of [-1, 1]) {
                const fh = 6 + Math.abs(Math.sin(now / 120 + s)) * 3;
                g.fillStyle(0xff7a3a, 0.9);
                g.fillTriangle(s * 8 - 3, 18, s * 8 + 3, 18, s * 8, 18 - fh);
                g.fillStyle(0xffe15c, 0.9);
                g.fillTriangle(s * 8 - 1.4, 18, s * 8 + 1.4, 18, s * 8, 18 - fh * 0.55);
            }
            g.restore();
            for (let k = 0; k < 3; k++) { // 热气（大团慢升）
                const ph = (now / 1800 + k / 3) % 1;
                g.fillStyle(0xf0ead8, 0.3 * Math.sin(ph * Math.PI));
                g.fillCircle(-8 + Math.sin(ph * 5 + k) * 7, 0 - ph * 46, 3.4 + ph * 7);
            }
        } },
    dinBackC: { c: 0x8a6a3a, a: 0xffe0b0, single: true, draw: (g, now, _flap, c, _a) => {
            // 手写菜单板：背后的木菜单板——板体 + 粉笔字行 + 挂绳 + 手绘小碗
            const bob = Math.sin(now / 780) * 1.8;
            g.save();
            g.translateCanvas(-10, -8 + bob);
            g.rotateCanvas(Math.sin(now / 900) * 0.04);
            g.fillStyle(c, 0.95); // 木板
            g.fillRoundedRect(-14, -20, 28, 40, 3);
            g.fillStyle(0x6a4a2a, 0.7);
            g.fillRect(-14, -20, 28, 4);
            g.fillStyle(0x2a2018, 0.9); // 黑板面
            g.fillRoundedRect(-11, -14, 22, 26, 2);
            g.lineStyle(0.9, 0xf0ead8, 0.85); // 粉笔字行（波浪线）
            for (let k = 0; k < 4; k++) {
                g.beginPath();
                g.moveTo(-9, -10 + k * 6.4);
                for (let s = 1; s <= 6; s++)
                    g.lineTo(-9 + s * 3, -10 + k * 6.4 + ((s % 2) ? -1 : 1) * 0.8);
                g.strokePath();
            }
            g.fillStyle(0xffb84a, 0.9); // 手绘小碗
            g.beginPath();
            g.arc(-3, 7, 2.6, 0, Math.PI);
            g.closePath();
            g.fillPath();
            g.lineBetween(-6, 7, 0, 7);
            // 挂绳
            g.lineStyle(1.4, 0x8a6a3a, 0.9);
            g.lineBetween(-8, -20, -4, -26);
            g.lineBetween(8, -20, 4, -26);
            g.restore();
        } },
    dinBackD: { c: 0xd8453a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, _a) => {
            // 外卖保温箱：背着的红色外卖箱——箱体 + 白十字 + 扣带 + 蒸汽缝
            const bob = Math.sin(now / 640) * 1.6;
            g.save();
            g.translateCanvas(0, 2 + bob);
            g.fillStyle(c, 1); // 箱体
            g.fillRoundedRect(-13, -22, 26, 38, 4);
            g.fillStyle(0xb8382e, 0.7); // 箱盖
            g.fillRoundedRect(-13, -22, 26, 8, 4);
            g.fillStyle(0xfff6d8, 0.9); // 白十字标
            g.fillRect(-2, -10, 4, 12);
            g.fillRect(-5, -7, 10, 6);
            g.fillStyle(0x8a2a22, 0.9); // 侧扣带
            g.fillRect(-13, 2, 26, 2.4);
            for (const s of [-1, 1]) { // 扣锁
                g.fillStyle(0xffd45c, 0.9);
                g.fillRect(s * 11 - 2, 0, 4, 6);
            }
            g.fillStyle(0x2a2018, 0.9); // 提手
            g.fillRoundedRect(-6, -27, 12, 4, 2);
            g.restore();
            for (let k = 0; k < 3; k++) { // 箱缝蒸汽（保温的热气）
                const ph = (now / 1100 + k / 3) % 1;
                g.fillStyle(0xf0ead8, 0.3 * (1 - ph));
                g.fillCircle(-6 + k * 6, -24 - ph * 14, 1.6 * (1 - ph) + 0.5);
            }
        } },
    // ---- 猫咖物语 ----
    catBackA: { c: 0xffb0c8, a: 0xe8a050, single: true, draw: (g, now, _flap, c, _a) => {
            // 毛线球：背后悬浮的粉毛线球——球体 + 缠绕纹 + 散开的线头 + 猫爪抓痕
            const bob = Math.sin(now / 700) * 2.4;
            g.save();
            g.translateCanvas(-10, -10 + bob);
            g.rotateCanvas(Math.sin(now / 800) * 0.1);
            g.fillStyle(c, 0.95); // 球体
            g.fillCircle(0, 0, 14);
            g.fillStyle(0xffc8d8, 0.7); // 缠绕高光纹
            for (let k = 0; k < 3; k++) {
                g.beginPath();
                g.arc(0, 0, 11 - k * 3, now / 600 + k, now / 600 + k + 3.6);
                g.strokePath();
            }
            g.lineStyle(0.9, 0xe88aa0, 0.7); // 球面缠绕暗纹
            for (let k = 0; k < 3; k++) {
                g.beginPath();
                g.arc(0, 0, 13 - k * 4, -now / 700 + k, -now / 700 + k + 3);
                g.strokePath();
            }
            // 散开的线头（甩出去的弯线）
            g.lineStyle(1.6, c, 0.95);
            g.beginPath();
            g.moveTo(12, -6);
            g.lineTo(20 + Math.sin(now / 300) * 2, -12);
            g.lineTo(26, -6 + Math.sin(now / 260) * 2);
            g.strokePath();
            g.restore();
            // 空中飘的线絮
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1300 + k / 3) % 1;
                g.fillStyle(c, 0.5 * (1 - ph));
                g.fillCircle(-14 + Math.sin(ph * 4 + k) * 6, -18 - ph * 16, 1.2 * (1 - ph) + 0.4);
            }
        } },
    catBackB: { c: 0xd9b45c, a: 0xe8a050, single: true, draw: (g, now, _flap, c, _a) => {
            // 小鱼干串：背后挂着的小鱼干串——绳 + 三条鱼干 + 摇摆 + 香气
            const bob = Math.sin(now / 720) * 1.8;
            g.save();
            g.translateCanvas(-8, -14 + bob);
            g.lineStyle(1.6, 0x8a6a3a, 1); // 挂绳
            g.lineBetween(-12, -8, 12, -8);
            for (let k = 0; k < 3; k++) {
                const lx = -8 + k * 8;
                const sway = Math.sin(now / 350 + k) * 2;
                g.lineStyle(0.9, 0x8a6a3a, 0.9);
                g.lineBetween(lx, -8, lx + sway, -4);
                g.fillStyle(k % 2 ? c : 0xc0a070, 0.95); // 鱼干（梭形）
                g.fillEllipse(lx + sway, 2, 6, 9);
                g.fillStyle(0x8a6a3a, 0.7); // 鱼干纹
                g.lineBetween(lx + sway - 1.4, -1, lx + sway + 1.4, -1);
                g.lineBetween(lx + sway - 1.2, 3, lx + sway + 1.2, 3);
                g.fillStyle(0x2a2018, 0.9); // 干瘪鱼眼
                g.fillCircle(lx + sway, -2, 0.9);
                g.fillStyle(c, 0.9); // 尾鳍
                g.fillTriangle(lx + sway - 1.6, 6.4, lx + sway + 1.6, 6.4, lx + sway + sway * 0.4, 10);
            }
            g.restore();
            for (let k = 0; k < 3; k++) { // 香气线
                const ph = (now / 1400 + k / 3) % 1;
                g.fillStyle(0xfff0d8, 0.3 * Math.sin(ph * Math.PI));
                g.fillCircle(-8 + Math.sin(ph * 5 + k) * 6, -18 - ph * 20, 1.4 * (1 - ph) + 0.5);
            }
        } },
    catBackC: { c: 0xc08a3a, a: 0xffb0c8, single: true, draw: (g, now, _flap, c, a) => {
            // 迷你猫爬架：背后的迷你猫爬架——立柱 + 双层平台 + 悬吊毛球 + 顶端猫爪印
            const bob = Math.sin(now / 760) * 1.6;
            g.save();
            g.translateCanvas(-10, 4 + bob);
            g.fillStyle(c, 1); // 立柱（猫抓柱）
            g.fillRect(-3, -40, 6, 48);
            g.lineStyle(0.8, 0x8a6a3a, 0.8); // 麻绳缠绕纹
            for (let k = 0; k < 8; k++)
                g.lineBetween(-3, -36 + k * 6, 3, -34 + k * 6);
            g.fillStyle(0xd9b45c, 0.95); // 底座 + 双层平台
            g.fillRoundedRect(-12, 6, 24, 6, 2);
            g.fillRoundedRect(-13, -14, 26, 5, 2);
            g.fillStyle(0xd9b45c, 0.95);
            g.fillRoundedRect(-13, -38, 26, 5, 2);
            // 平台上的毛球
            g.fillStyle(a, 0.95);
            g.fillCircle(-8, -19, 3);
            g.fillCircle(8, -43, 3);
            // 悬吊毛线球（晃动）
            const sway = Math.sin(now / 350) * 2.4;
            g.lineStyle(0.9, 0x8a6a3a, 0.9);
            g.lineBetween(6, -9, 6 + sway, -2);
            g.fillStyle(0xffb0c8, 0.95);
            g.fillCircle(6 + sway, 0, 2.6);
            // 顶端猫爪印
            g.fillStyle(a, 0.85);
            g.fillEllipse(0, -46, 5, 3.4);
            for (let k = 0; k < 3; k++)
                g.fillEllipse(-2.4 + k * 2.4, -49, 1.4, 2);
            g.restore();
        } },
    catBackD: { c: 0xf0d8b8, a: 0xe8a050, single: true, draw: (g, now, _flap, c, a) => {
            // 猫窝抱枕：背后蓬松的猫窝抱枕——枕体 + 缝线 + 塌陷猫印 + Zzz
            const bob = Math.sin(now / 650) * 2;
            g.save();
            g.translateCanvas(0, 8 + bob);
            g.fillStyle(c, 0.95); // 枕体（大扁枕）
            g.fillEllipse(0, 0, 40, 18);
            g.fillStyle(0xe8d0a8, 0.8); // 枕面受光
            g.fillEllipse(0, -2, 34, 12);
            g.lineStyle(1, 0xc0a878, 0.9); // 缝线（虚线感）
            for (let k = 0; k < 6; k++)
                g.lineBetween(-16 + k * 6, -8, -14 + k * 6, -4);
            // 中央塌陷的猫印（蜷缩的猫压痕）
            g.fillStyle(0xd8c098, 0.7);
            g.fillEllipse(0, 0, 16, 7);
            g.fillStyle(0xc0a878, 0.8); // 压痕里的尾巴卷
            g.beginPath();
            g.arc(4, 0, 3, 0.4, Math.PI * 1.6);
            g.strokePath();
            g.fillStyle(a, 0.85); // 压痕上的耳朵印
            g.fillTriangle(-5, -2, -2, -2, -3.5, -5);
            g.fillTriangle(5, -2, 2, -2, 3.5, -5);
            g.restore();
            // Zzz（睡梦符号）
            for (let k = 0; k < 3; k++) {
                const ph = (now / 1600 + k / 3) % 1;
                const zx = 14 + k * 5, zy = -18 - k * 7;
                g.fillStyle(a, 0.7 * Math.sin(ph * Math.PI));
                g.lineStyle(1.2, a, 0.7 * Math.sin(ph * Math.PI));
                g.lineBetween(zx - 2, zy - 2, zx + 2, zy - 2);
                g.lineBetween(zx + 2, zy - 2, zx - 2, zy + 2);
                g.lineBetween(zx - 2, zy + 2, zx + 2, zy + 2);
            }
        } },
};
