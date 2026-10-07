import { wpoly, TAU } from './shared.js';
/**
 * 批十主题背挂物件（电竞赛场 / 末日废土 / 星光偶像）。
 * 全部 `single: true`：只画一次、不镜像、不随扇动旋转，动效在 painter 体内。
 */
export const WINGS_17 = {
    // ---- 电竞赛场 ----
    esportBackA: { c: 0x39ffd0, a: 0xff2e88, single: true, draw: (g, now, _flap, c, a) => {
            // 背负机械键盘：斜背的 RGB 机械键盘——键帽矩阵 + RGB 流光扫过 + 线缆
            g.save();
            g.translateCanvas(-4, 0);
            g.rotateCanvas(-0.5 + Math.sin(now / 800) * 0.02);
            g.fillStyle(0x1c2430, 1); // 键盘体
            g.fillRoundedRect(-8, -24, 16, 48, 3);
            g.fillStyle(0x22303e, 0.9);
            g.fillRect(-7, -23, 14, 44);
            const sweep = (now / 700) % 1; // RGB 流光（沿键帽行扫过）
            for (let r = 0; r < 6; r++) {
                for (let k = 0; k < 4; k++) {
                    const d = Math.abs(r / 6 - sweep);
                    const gl = Math.max(0, 1 - d * 4);
                    g.fillStyle(gl > 0.4 ? (r % 2 ? c : a) : 0x2a3648, 0.35 + gl * 0.6);
                    g.fillRect(-6 + k * 3.2, -21 + r * 7, 2.4, 4.4);
                }
            }
            g.lineStyle(1.4, 0x39424e, 1); // 线缆
            g.beginPath();
            g.moveTo(0, -24);
            g.lineTo(4, -32);
            g.lineTo(-2, -38);
            g.strokePath();
            g.restore();
        } },
    esportBackB: { c: 0xffd45c, a: 0x00e5ff, single: true, draw: (g, now, _flap, c, a) => {
            // 冠军奖杯：背后的冠军奖杯——金杯 + 双耳 + 底座 + 杯身高光 + 星屑
            const bob = Math.sin(now / 700) * 2.4;
            g.save();
            g.translateCanvas(-10, -10 + bob);
            g.fillStyle(c, 0.15); // 圣光
            g.fillCircle(0, -6, 26);
            g.fillStyle(c, 0.95); // 杯身（碗形）
            g.fillPoints([
                { x: -12, y: -22 }, { x: 12, y: -22 }, { x: 10, y: -6 }, { x: 4, y: 2 }, { x: -4, y: 2 }, { x: -10, y: -6 },
            ], true);
            for (const s of [-1, 1]) { // 双耳
                g.lineStyle(2.4, c, 0.95);
                g.beginPath();
                g.arc(s * 14, -16, 5, s > 0 ? -Math.PI / 2 : Math.PI / 2, s > 0 ? Math.PI / 2 : Math.PI * 1.5);
                g.strokePath();
            }
            g.fillStyle(0xb8943a, 1); // 杯颈 + 底座
            g.fillRect(-2.4, 2, 4.8, 8);
            g.fillStyle(0x8a6a2a, 1);
            g.fillRoundedRect(-9, 10, 18, 6, 2);
            g.fillStyle(0xfff0b0, 0.7); // 杯身高光
            g.fillEllipse(-6, -14, 4, 12);
            g.fillStyle(a, 0.9); // 杯上星徽
            g.save();
            g.translateCanvas(0, -12);
            g.rotateCanvas(now / 400);
            g.fillPoints([
                { x: 0, y: -3 }, { x: 2.4, y: 0 }, { x: 0, y: 3 }, { x: -2.4, y: 0 },
            ], true);
            g.restore();
            g.restore();
            for (let k = 0; k < 4; k++) { // 星屑
                const ph = (now / 1000 + k / 4) % 1;
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k * 1.7));
                g.fillStyle(0xfff0b0, tw * (1 - ph));
                g.fillCircle(-10 + Math.sin(ph * 4 + k) * 12, -20 - ph * 26, 1.3 * (1 - ph) + 0.4);
            }
        } },
    esportBackC: { c: 0x00e5ff, a: 0xff2e88, single: true, draw: (g, now, _flap, c, a) => {
            // 战队旗帜：背后的战队旗——旗杆 + 队徽旗 + 电子纹 + 旗角飘
            g.save();
            g.translateCanvas(-10, 4);
            g.lineStyle(2.4, 0x39424e, 1); // 旗杆
            g.lineBetween(0, 26, 0, -64);
            g.fillStyle(c, 0.9); // 杆顶灯
            g.fillCircle(0, -65, 2.4);
            const fl = Math.sin(now / 280) * 3;
            g.fillStyle(0x0e1620, 0.92); // 旗面（黑底）
            g.beginPath();
            g.moveTo(1, -60);
            for (let s = 1; s <= 6; s++)
                g.lineTo(1 + s * 7, -58 - s * 1.2 - Math.sin(s * 1.3 + now / 260) * fl * (s / 6));
            for (let s = 6; s >= 1; s--)
                g.lineTo(1 + s * 7, -38 + s * 0.8 - Math.sin(s * 1.3 + now / 260 + 1) * fl * (s / 6));
            g.closePath();
            g.fillPath();
            g.lineStyle(1.2, c, 0.85); // 旗面电子描边
            g.strokeRect(6, -54, 26, 12);
            // 队徽（菱形 + 闪电）
            g.fillStyle(a, 0.95);
            g.fillPoints([{ x: 19, y: -54 }, { x: 25, y: -48 }, { x: 19, y: -42 }, { x: 13, y: -48 }], true);
            g.fillStyle(0xffffff, 0.95);
            g.fillPoints([{ x: 20, y: -51 }, { x: 23.4, y: -49 }, { x: 19, y: -46.4 }, { x: 20.4, y: -48.4 }], true);
            g.restore();
        } },
    esportBackD: { c: 0xff2e88, a: 0x39ffd0, single: true, draw: (g, now, _flap, c, a) => {
            // 电竞椅背包：背着的迷你电竞椅——椅背 + 双翼头枕 + RGB 边条 + 五星脚
            const bob = Math.sin(now / 680) * 1.6;
            g.save();
            g.translateCanvas(0, 4 + bob);
            g.fillStyle(0x1c2430, 1); // 椅背
            g.fillRoundedRect(-12, -26, 24, 40, 6);
            g.fillStyle(c, 0.7); // 椅面皮纹
            g.fillRoundedRect(-10, -24, 20, 34, 4);
            g.fillStyle(0x22303e, 1); // 中央条纹
            g.fillRect(-3, -24, 6, 34);
            for (const s of [-1, 1]) { // 双翼头枕
                g.fillStyle(c, 0.95);
                wpoly(g, [[s * 10, -24], [s * 20, -32], [s * 17, -20]], c, 0.95);
            }
            g.lineStyle(2, a, 0.85); // RGB 边条
            g.strokeRect(-12, -26, 24, 40);
            // 椅腿 + 五星脚
            g.lineStyle(2.4, 0x39424e, 1);
            g.lineBetween(0, 14, 0, 22);
            for (let k = 0; k < 5; k++) {
                const ang = (k / 5) * TAU + 0.3;
                g.lineBetween(0, 22, Math.cos(ang) * 10, 24 + Math.abs(Math.sin(ang)) * 3);
                g.fillStyle(0x22303e, 1);
                g.fillCircle(Math.cos(ang) * 10, 24 + Math.abs(Math.sin(ang)) * 3, 1.6);
            }
            g.restore();
        } },
    // ---- 末日废土 ----
    wasteBackA: { c: 0xc9a84a, a: 0xff8a3c, single: true, draw: (g, now, _flap, _c, _a) => {
            // 燃油桶：背后的锈油桶——桶体 + 锈迹 + 警示标 + 滴油
            const bob = Math.sin(now / 700) * 1.8;
            g.save();
            g.translateCanvas(-10, 4 + bob);
            g.fillStyle(0x8a6a2a, 0.95); // 桶体
            g.fillRoundedRect(-10, -22, 20, 40, 3);
            g.fillStyle(0xa8843a, 0.6); // 锈迹斑块
            g.fillEllipse(-4, -8, 6, 10);
            g.fillEllipse(5, 8, 5, 8);
            g.fillStyle(0x6a5018, 0.9); // 上下桶箍
            g.fillRect(-10, -16, 20, 3);
            g.fillRect(-10, 12, 20, 3);
            g.fillStyle(0xffd45c, 0.8); // 警示三角标
            g.fillTriangle(0, -4, -4.4, 4, 4.4, 4);
            g.fillStyle(0x1a1408, 1);
            g.fillRect(-0.7, -1.4, 1.4, 3);
            g.fillCircle(0, 2.6, 0.8);
            g.restore();
            for (let k = 0; k < 3; k++) { // 滴油（缓慢下坠的油滴）
                const ph = (now / 1400 + k / 3) % 1;
                g.fillStyle(0x4a3818, 0.7 * (1 - ph));
                g.fillCircle(-8 + k * 8, 22 + ph * 10, 1.2 * (1 - ph) + 0.4);
            }
        } },
    wasteBackB: { c: 0x8a7a5a, a: 0xff8a3c, single: true, draw: (g, now, _flap, c, _a) => {
            // 拼装板甲护肩：背后的拼装板甲——多层 scrap 钢板 + 铆钉 + 焊缝 + 尖刺
            const bob = Math.sin(now / 720) * 1.6;
            g.save();
            g.translateCanvas(-6, -2 + bob);
            for (let k = 0; k < 3; k++) { // 三层叠压钢板（越上越小）
                g.fillStyle(k % 2 ? c : 0x6a5a40, 0.95);
                g.fillRoundedRect(-14 + k * 2, -18 + k * 12, 28 - k * 4, 12, 2);
                g.fillStyle(0xff8a3c, 0.25); // 焊缝锈光
                g.fillRect(-14 + k * 2, -7 + k * 12, 28 - k * 4, 1.4);
                for (let s = 0; s < 3; s++) { // 铆钉
                    g.fillStyle(0x4a4030, 1);
                    g.fillCircle(-11 + k * 2 + s * 8, -12 + k * 12, 1.1);
                }
            }
            // 肩部尖刺（三根）
            for (let k = 0; k < 3; k++) {
                g.fillStyle(0x4a4030, 1);
                g.fillTriangle(-10 + k * 8, -18, -6 + k * 8, -18, -8 + k * 8, -27);
            }
            g.restore();
        } },
    wasteBackC: { c: 0xffe15c, a: 0xff8a3c, single: true, draw: (g, now, _flap, c, _a) => {
            // 探照灯：背后的废土探照灯——灯座 + 大灯头 + 扫动光锥 + 通电嗡鸣
            const bob = Math.sin(now / 750) * 1.6;
            const sweep = Math.sin(now / 900) * 0.3;
            g.save();
            g.translateCanvas(-10, 2 + bob);
            g.fillStyle(0x4a4030, 1); // 三脚架座
            g.fillTriangle(-8, 20, 8, 20, 0, 8);
            g.lineStyle(2.4, 0x6a5a40, 1);
            g.lineBetween(0, 8, 0, -4);
            g.save();
            g.translateCanvas(0, -10);
            g.rotateCanvas(sweep);
            g.fillStyle(0x6a5a40, 1); // 灯头
            g.fillRoundedRect(-8, -8, 16, 14, 4);
            g.fillStyle(c, 0.9); // 灯面
            g.fillEllipse(0, 0, 12, 9);
            g.fillStyle(0xffffff, 0.85);
            g.fillEllipse(-2, -1, 5, 3.4);
            // 光锥（扫动的探照光）
            g.fillStyle(c, 0.14);
            wpoly(g, [[4, -4], [46, -26], [46, 14], [4, 4]], c, 0.14);
            g.restore();
            g.restore();
        } },
    wasteBackD: { c: 0x8a94a2, a: 0xff8a3c, single: true, draw: (g, now, _flap, c, a) => {
            // 改装机械臂：背后接驳的机械臂——肩座 + 二节臂 + 液压管 + 爪手开合
            const bob = Math.sin(now / 720) * 1.6;
            const grab = Math.abs(Math.sin(now / 400)) * 0.3;
            g.save();
            g.translateCanvas(-8, 2 + bob);
            g.fillStyle(0x39424e, 1); // 肩座
            g.fillCircle(0, 4, 6);
            g.fillStyle(0x22303e, 1);
            g.fillCircle(0, 4, 3);
            g.lineStyle(5, c, 1); // 上臂
            g.lineBetween(0, 2, -10, -12);
            g.lineStyle(4.4, c, 1); // 前臂（带开合微动）
            g.lineBetween(-10, -12, -2 + grab * 4, -26);
            g.fillStyle(0x39424e, 1); // 肘关节
            g.fillCircle(-10, -12, 3.4);
            // 爪手（双指，随 grab 开合）
            g.lineStyle(3, 0x6a7480, 1);
            g.lineBetween(-2 + grab * 4, -26, 2 + grab * 6, -32);
            g.lineBetween(-2 + grab * 4, -26, -6 - grab * 2, -31);
            g.lineStyle(1.6, 0xff8a3c, 0.5 + 0.3 * Math.sin(now / 300)); // 液压管
            g.beginPath();
            g.moveTo(-2, 2);
            g.lineTo(-7, -6);
            g.lineTo(-12, -10);
            g.strokePath();
            g.fillStyle(a, 0.8); // 关节指示灯
            g.fillCircle(-10, -12, 1.2);
            g.restore();
            // 臂端电火花
            for (let k = 0; k < 2; k++) {
                const ph = (now / 350 + k / 2) % 1;
                g.lineStyle(1, a, 0.6 * (1 - ph));
                g.lineBetween(-2, -30 + bob, -2 + Math.sin(now / 50 + k) * 5, -34 - ph * 6);
            }
        } },
    // ---- 星光偶像 ----
    idolBackA: { c: 0xff9adf, a: 0x7ac8ff, single: true, draw: (g, now, _flap, c, a) => {
            // 荧光棒阵：背后一圈挥舞的荧光棒——八根棒绕环 + 交替变色 + 光晕
            const rot = now / 1000;
            for (let k = 0; k < 8; k++) {
                const ang = rot + (k / 8) * TAU;
                const px = Math.cos(ang) * 30, py = -16 + Math.sin(ang) * 24;
                const wave = Math.sin(now / 200 + k) * 0.2;
                g.save();
                g.translateCanvas(px, py);
                g.rotateCanvas(ang + Math.PI / 2 + wave);
                const col = (k + Math.floor(now / 500)) % 3;
                g.fillStyle(col === 0 ? c : col === 1 ? a : 0xffffff, 0.9);
                g.fillRoundedRect(-1.6, -11, 3.2, 22, 1.6);
                g.fillStyle(0xffffff, 0.4);
                g.fillRect(-0.6, -9, 1.2, 14);
                g.restore();
                g.fillStyle(col === 0 ? c : col === 1 ? a : 0xffffff, 0.2);
                g.fillCircle(px, py, 6);
            }
        } },
    idolBackB: { c: 0xfff6d8, a: 0xff5a8a, single: true, draw: (g, now, _flap, c, a) => {
            // 应援灯牌：背后举着的应援灯牌——灯牌 + 跑马灯边 + 亮字 + 双手杆
            const bob = Math.sin(now / 640) * 2;
            g.save();
            g.translateCanvas(0, -12 + bob);
            g.rotateCanvas(Math.sin(now / 700) * 0.05);
            g.fillStyle(0x1a1222, 1); // 牌体
            g.fillRoundedRect(-20, -16, 40, 30, 4);
            g.fillStyle(0x2a1e30, 0.8);
            g.fillRoundedRect(-17, -13, 34, 24, 3);
            // 亮字（LOVE 意象的点阵字，三行跑马）
            for (let r = 0; r < 3; r++) {
                for (let k = 0; k < 5; k++) {
                    const on = ((k + r * 2 + Math.floor(now / 300)) % 5) < 2;
                    g.fillStyle(on ? (r % 2 ? c : a) : 0x3a2a44, on ? 0.95 : 0.4);
                    g.fillRect(-13 + k * 5.6, -9 + r * 7.4, 4, 5);
                }
            }
            g.lineStyle(2, a, 0.85); // 跑马灯边
            g.strokeRect(-20, -16, 40, 30);
            for (const s of [-1, 1]) { // 双手杆
                g.lineStyle(2.4, 0x8a6a3a, 1);
                g.lineBetween(s * 14, 14, s * 10, 26);
            }
            g.restore();
            for (let k = 0; k < 4; k++) { // 牌前闪光
                const ph = (now / 700 + k / 4) % 1;
                const tw = Math.abs(Math.sin(now / 180 + k * 2));
                g.fillStyle(0xffffff, tw * (1 - ph));
                g.fillCircle(-14 + (k * 9) % 28, -20 - ph * 14, 1.3);
            }
        } },
    idolBackC: { c: 0xffd45c, a: 0xff9adf, single: true, draw: (g, now, _flap, c, a) => {
            // 星星麦克风：背后悬浮的星星麦克风——麦体 + 网头 + 星形装饰 + 声波
            const bob = Math.sin(now / 700) * 2.4;
            g.save();
            g.translateCanvas(-8, -10 + bob);
            g.rotateCanvas(-0.3 + Math.sin(now / 850) * 0.05);
            g.fillStyle(0x8a6a3a, 1); // 麦杆
            g.fillRect(-2, 0, 4, 22);
            g.fillStyle(0x39424e, 1); // 网头
            g.fillCircle(0, -6, 7.4);
            g.fillStyle(0x5a6472, 0.7); // 网纹
            for (let k = 0; k < 3; k++) {
                g.beginPath();
                g.arc(0, -6, 6 - k * 1.8, 0, Math.PI * 2);
                g.strokePath();
            }
            // 星形装饰（网头上的金五角星）
            g.fillStyle(c, 0.95);
            g.fillPoints((() => {
                const vs = [];
                for (let s = 0; s < 10; s++) {
                    const ang = (s / 10) * TAU - Math.PI / 2;
                    const rr = s % 2 ? 1.6 : 3.6;
                    vs.push({ x: Math.cos(ang) * rr, y: -6 + Math.sin(ang) * rr });
                }
                return vs;
            })(), true);
            g.fillStyle(a, 0.9); // 杆尾彩带
            g.fillTriangle(-2, 22, 2, 22, 0 + Math.sin(now / 300) * 2, 30);
            g.restore();
            for (let k = 0; k < 3; k++) { // 声波
                const ph = (now / 900 + k / 3) % 1;
                g.lineStyle(1.4, a, 0.5 * (1 - ph));
                g.strokeCircle(-8, -10 + bob, 10 + ph * 16);
            }
        } },
    idolBackD: { c: 0xff5a8a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
            // 巡演海报：背后的巡演海报——海报卷 + 偶像剪影 + 星光标题 + 卷角
            const bob = Math.sin(now / 800) * 2;
            g.save();
            g.translateCanvas(-10, -8 + bob);
            g.rotateCanvas(-0.06);
            g.fillStyle(0xfff6d8, 0.95); // 海报纸
            g.fillRoundedRect(-13, -24, 26, 46, 2);
            g.fillStyle(0xff5a8a, 0.9); // 海报上部（偶像剪影）
            g.fillRoundedRect(-13, -24, 26, 22, 2);
            g.fillStyle(0x2a1e30, 0.85); // 剪影（歌手剪影）
            g.fillCircle(0, -14, 4.4);
            g.fillPoints([
                { x: -5, y: -10 }, { x: 5, y: -10 }, { x: 6, y: -2 }, { x: -6, y: -2 },
            ], true);
            g.lineStyle(1.4, c, 0.9); // 手中的麦杆（斜举）
            g.lineBetween(2, -14, 9, -20);
            g.fillStyle(c, 0.95);
            g.fillCircle(10, -21, 1.6);
            // 星光标题（下部的金星行）
            for (let k = 0; k < 3; k++) {
                const gl = 0.5 + 0.5 * Math.abs(Math.sin(now / 280 + k));
                g.fillStyle(a, gl);
                g.fillPoints((() => {
                    const vs = [];
                    for (let s = 0; s < 10; s++) {
                        const ang = (s / 10) * TAU - Math.PI / 2;
                        const rr = s % 2 ? 1 : 2.4;
                        vs.push({ x: -6 + k * 6 + Math.cos(ang) * rr, y: 8 + Math.sin(ang) * rr });
                    }
                    return vs;
                })(), true);
            }
            g.lineStyle(0.9, 0xc0b090, 0.8); // 海报小字行
            g.lineBetween(-9, 14, 9, 14);
            g.lineBetween(-7, 17, 7, 17);
            // 卷角（右下微卷）
            g.fillStyle(0xe8d8c0, 0.9);
            g.fillPoints([{ x: 13, y: 16 }, { x: 13, y: 22 }, { x: 7, y: 22 }], true);
            g.restore();
        } },
};
