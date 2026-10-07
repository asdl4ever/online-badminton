import { groundShadow } from './shared.js';
import { PLAYER_H } from '../../constants.js';
/** 批七主题 5★ 皮肤（赛博都市 / 东海龙宫 / 时空旅行） */
/** 赛博义体人：半人半机的街头义体客——机械臂、数据眼、颈后接口、信号故障闪烁 */
export const cybSpirit = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const plate = 0x2a3440, dark = 0x1a222c, neon = 0x39ffd0, magenta = 0xff3bd4, skinT = 0xd8a878;
    groundShadow(g, pose, 52);
    const servo = Math.sin(now / 380) * 1.2;
    // 双腿（机械腿：大腿-膝-小腿三段）
    for (const s of [-1, 1]) {
        const step = Math.sin(now / 240 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 4;
        g.fillStyle(dark, 1);
        g.fillRoundedRect(x + s * 8 - 4.4, topY + 60, 9, 14, 3);
        g.fillStyle(plate, 1);
        g.fillRoundedRect(x + s * 8 - 4.4 + step * 0.3, topY + 72, 9, 12, 3);
        g.fillStyle(0x8a94a2, 1); // 膝关节
        g.fillCircle(x + s * 8, topY + 72, 3.4);
        g.fillStyle(0x22303e, 1);
        g.fillRoundedRect(x + s * 8 - 5 + step, feetY - 5, 10, 5, 2);
        g.fillStyle(neon, 0.5 + 0.4 * Math.sin(now / 200 + s)); // 腿侧灯条
        g.fillRect(x + s * 8 - 1, topY + 63, 2, 20);
    }
    // 躯干（半人半机：左半皮肤右半装甲）
    g.fillStyle(skinT, 1);
    g.fillRoundedRect(x - 13, topY + 28 + servo, 26, 32, 6);
    g.fillStyle(plate, 1); // 机械半躯
    g.fillPoints([
        { x: x + f * 2, y: topY + 28 + servo }, { x: x + 13, y: topY + 30 + servo },
        { x: x + 13, y: topY + 58 + servo }, { x: x + f * 2, y: topY + 60 + servo },
    ], true);
    g.fillStyle(neon, 0.8); // 机躯能量脊
    g.fillRect(x + f * 8, topY + 32 + servo, 2, 24);
    g.fillStyle(magenta, 0.9); // 胸口接口组
    g.fillCircle(x - f * 5, topY + 38 + servo, 2.2);
    g.fillStyle(neon, 0.9);
    g.fillCircle(x - f * 5, topY + 44 + servo, 2.2);
    // 左臂（人臂）右臂（机械臂带钳）
    g.lineStyle(5, skinT, 1);
    g.lineBetween(x - f * 11, topY + 34 + servo, x - f * 18, topY + 48 + servo);
    g.fillStyle(plate, 1);
    g.fillRoundedRect(x + f * 14 - 3, topY + 34 + servo, 6, 16, 2);
    g.fillStyle(0x8a94a2, 1); // 肩球
    g.fillCircle(x + f * 14, topY + 34 + servo, 3.4);
    g.fillStyle(0x8a94a2, 1); // 机械钳
    g.fillTriangle(x + f * 14 - 3, topY + 50 + servo, x + f * 14 - 6, topY + 56 + servo, x + f * 14 - 1, topY + 52 + servo);
    g.fillTriangle(x + f * 14 + 3, topY + 50 + servo, x + f * 14 + 6, topY + 56 + servo, x + f * 14 + 1, topY + 52 + servo);
    // 颈后接口 + 垂缆
    g.fillStyle(dark, 1);
    g.fillRoundedRect(x - f * 12, topY + 26 + servo, 6, 5, 1.6);
    g.lineStyle(1.4, neon, 0.85);
    g.beginPath();
    g.moveTo(x - f * 10, topY + 30 + servo);
    g.lineTo(x - f * 16 - sway(), topY + 40 + servo);
    g.lineTo(x - f * 20, topY + 52 + servo);
    g.strokePath();
    function sway() { return Math.sin(now / 300) * 2; }
    // 头（半脸机械 + 双色义眼 + 短数据辫）
    const hy = topY + 13 + servo;
    g.fillStyle(skinT, 1);
    g.fillCircle(x, hy, 11);
    g.fillStyle(plate, 1); // 机械半脸
    g.fillPoints([
        { x: x + f * 1, y: hy - 11 }, { x: x + f * 10, y: hy - 6 }, { x: x + f * 11, y: hy + 4 },
        { x: x + f * 7, y: hy + 10 }, { x: x + f * 1, y: hy + 11 },
    ], true);
    g.fillStyle(neon, 0.9); // 机械脸缝灯
    g.fillRect(x + f * 5, hy - 8, 1.4, 16);
    g.fillStyle(0x1a222c, 1); // 数据辫接口
    g.fillCircle(x - f * 8, hy - 8, 2.6);
    for (let k = 0; k < 3; k++) { // 数据辫（三根短辫甩动）
        g.lineStyle(1.4, k % 2 ? neon : magenta, 0.9);
        g.beginPath();
        g.moveTo(x - f * 8, hy - 8);
        g.lineTo(x - f * 13 - k * 2, hy - 12 + Math.sin(now / 250 + k) * 2);
        g.lineTo(x - f * 15 - k * 3, hy - 6 + Math.sin(now / 250 + k * 2) * 3);
        g.strokePath();
    }
    for (const s of [-1, 1]) { // 双色义眼（发光 + 扫描）
        const isMech = s === f;
        g.fillStyle(isMech ? neon : 0xffffff, 0.95);
        g.fillEllipse(x + s * 4.4, hy - 2, 4.4, 2.4);
        g.fillStyle(isMech ? 0x0a0e18 : neon, 1);
        g.fillCircle(x + s * 4.4 + f * Math.sin(now / 300) * 1.2, hy - 2, 1);
    }
    // 周身数码噪点
    for (let k = 0; k < 5; k++) {
        const ph = (now / 800 + k / 5) % 1;
        g.fillStyle(k % 2 ? neon : magenta, 0.6 * (1 - ph));
        g.fillRect(x + Math.sin(k * 2.6) * 22 - 1, topY + 58 - ph * 66, 2, 2);
    }
};
/** 东海龙王：苍龙化形的东海龙王——龙角龙须、鳞甲龙尾、掌中龙珠 */
export const dgSpirit = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const scale = 0x2a6a8a, scaleD = 0x1a4a62, belly = 0xbfe8f0, gold = 0xffd45c, horn = 0xfff0b0;
    groundShadow(g, pose, 56);
    const swim = Math.sin(now / 420) * 1.6;
    // 龙尾（身后长尾，节节摆动）
    g.fillStyle(scale, 1);
    for (let k = 6; k >= 1; k--) {
        const tx = x - f * (14 + k * 7);
        const ty = topY + 58 + Math.sin(now / 350 + k * 0.9) * (2 + k);
        g.fillCircle(tx, ty, 8 - k * 0.8);
        g.fillStyle(gold, 0.7); // 尾背金棘
        g.fillTriangle(tx - 2, ty - 6, tx + 2, ty - 6, tx, ty - 10);
        g.fillStyle(scale, 1);
    }
    // 双腿（龙爪腿）
    for (const s of [-1, 1]) {
        const step = Math.sin(now / 260 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
        g.fillStyle(scaleD, 1);
        g.fillRoundedRect(x + s * 8 - 4.4, topY + 58, 9, 22, 3);
        for (let k = 0; k < 3; k++) { // 爪趾
            g.fillStyle(gold, 0.9);
            g.fillTriangle(x + s * 8 + step - 4 + k * 3.4, feetY - 4, x + s * 8 + step - 1.4 + k * 3.4, feetY - 4, x + s * 8 + step - 2.7 + k * 3.4, feetY + 1);
        }
    }
    // 躯干（鳞甲 + 白腹 + 腰间玉带）
    g.fillStyle(scale, 1);
    g.fillRoundedRect(x - 13, topY + 28 + swim, 26, 32, 7);
    g.fillStyle(belly, 0.9); // 白腹
    g.fillRoundedRect(x - 5, topY + 32 + swim, 10, 26, 5);
    g.lineStyle(1, scaleD, 0.8); // 鳞纹
    for (let k = 0; k < 4; k++) {
        g.beginPath();
        g.arc(x - 8 + (k % 2) * 8, topY + 36 + k * 6 + swim, 3.4, Math.PI, 0);
        g.strokePath();
    }
    g.fillStyle(gold, 0.95); // 玉带
    g.fillRect(x - 13, topY + 52 + swim, 26, 4.4);
    g.fillStyle(0x5ac8ff, 0.9); // 带扣玉
    g.fillCircle(x, topY + 54.2 + swim, 2);
    // 双臂（一手托龙珠）
    for (const s of [-1, 1]) {
        g.lineStyle(5, scale, 1);
        g.lineBetween(x + s * 11, topY + 34 + swim, x + s * 18, topY + 46 + swim);
        g.fillStyle(gold, 0.9); // 爪
        g.fillCircle(x + s * 19, topY + 48 + swim, 2.6);
    }
    // 掌上龙珠（发光 + 内里龙影）
    const orbY = topY + 40 + swim;
    g.fillStyle(gold, 0.3 + 0.15 * Math.sin(now / 300));
    g.fillCircle(x + f * 24, orbY, 9);
    g.fillStyle(gold, 0.95);
    g.fillCircle(x + f * 24, orbY, 5.4);
    g.fillStyle(0xfff6d8, 0.85);
    g.fillCircle(x + f * 24 - 1.4, orbY - 1.4, 1.6);
    // 头（龙首：长吻 + 双角 + 龙须 + 鬃）
    const hy = topY + 13 + swim;
    g.fillStyle(scale, 1);
    g.fillCircle(x, hy, 12);
    g.fillStyle(scaleD, 1); // 长吻
    g.fillEllipse(x + f * 9, hy + 2, 14, 9);
    g.fillStyle(0x1a0e08, 1); // 鼻孔
    g.fillCircle(x + f * 13, hy + 1, 0.9);
    g.fillStyle(0xffffff, 0.9); // 獠牙
    g.fillTriangle(x + f * 12, hy + 5, x + f * 14.4, hy + 5, x + f * 13.2, hy + 8);
    for (const s of [-1, 1]) { // 双角（后掠分叉）
        g.fillStyle(horn, 0.95);
        g.fillPoints([
            { x: x + s * 6, y: hy - 8 }, { x: x + s * 12, y: hy - 18 }, { x: x + s * 15, y: hy - 24 },
            { x: x + s * 16, y: hy - 19 }, { x: x + s * 10, y: hy - 10 },
        ], true);
        g.lineStyle(0.9, 0xb8943a, 0.7); // 角节
        g.lineBetween(x + s * 9, hy - 12, x + s * 13, hy - 15);
    }
    g.fillStyle(gold, 0.9); // 鬃毛（头顶金鬃火焰）
    for (let k = -2; k <= 2; k++) {
        g.fillTriangle(x + k * 4, hy - 9, x + k * 4 + 3, hy - 9, x + k * 4.4 + Math.sin(now / 200 + k) * 1.6, hy - 16 - Math.abs(k) * 2);
    }
    // 龙须（两根长须飘动）
    for (const s of [-1, 1]) {
        g.lineStyle(1.4, 0xfff0b0, 0.9);
        g.beginPath();
        g.moveTo(x + s * 8 + f * 4, hy + 4);
        g.lineTo(x + s * 14 + f * 6, hy + 12 + Math.sin(now / 300 + s) * 3);
        g.lineTo(x + s * 16 + f * 8, hy + 20 + Math.sin(now / 300 + s * 2) * 4);
        g.strokePath();
    }
    for (const s of [-1, 1]) { // 眼（竖瞳金睛）
        g.fillStyle(0xffe15c, 0.95);
        g.fillEllipse(x + s * 4.4, hy - 2, 4.4, 3);
        g.fillStyle(0x1a0e08, 1);
        g.fillEllipse(x + s * 4.4 + f * 0.6, hy - 2, 1.2, 2.4);
    }
    // 环身水泡
    for (let k = 0; k < 5; k++) {
        const ph = (now / 1100 + k / 5) % 1;
        g.lineStyle(1, 0xffffff, 0.4 * (1 - ph));
        g.strokeCircle(x + Math.sin(k * 2.6) * 22, topY + 60 - ph * 68, 1.4 + ph * 1.6);
    }
};
/** 时空旅者：维多利亚装束的时间旅行者——黄铜护目镜、怀表链、周身时间涟漪 */
export const chronoSpirit = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const coat = 0x3a2a4a, coatD = 0x2a1e38, brass = 0xd9b45c, brassD = 0xb8943a, skinT = 0xe8c090;
    groundShadow(g, pose, 52);
    const sway = Math.sin(now / 460) * 1.6;
    // 双腿（条纹西裤 + 皮靴）
    for (const s of [-1, 1]) {
        const step = Math.sin(now / 250 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
        g.fillStyle(0x2a2430, 1);
        g.fillRoundedRect(x + s * 7 - 4.4, topY + 56, 9, 22, 3);
        g.lineStyle(0.8, 0x1a161e, 0.7); // 裤条纹
        g.lineBetween(x + s * 7 - 1, topY + 58, x + s * 7 - 1, feetY - 6);
        g.fillStyle(0x1a1410, 1);
        g.fillRoundedRect(x + s * 7 - 5 + step, feetY - 5, 10, 5, 2);
    }
    // 长外套（身后翻飞的燕尾）
    g.fillStyle(coatD, 0.9);
    g.fillPoints([
        { x: x - f * 6, y: topY + 40 }, { x: x - f * 26 - sway * 2, y: topY + 58 },
        { x: x - f * 22, y: topY + 72 }, { x: x - f * 4, y: topY + 64 },
    ], true);
    // 躯干（长外套 + 黄铜扣排）
    g.fillStyle(coat, 1);
    g.fillRoundedRect(x - 13, topY + 28 + sway * 0.3, 26, 34, 6);
    g.fillStyle(0x463456, 0.6);
    g.fillRoundedRect(x - 10, topY + 30 + sway * 0.3, 9, 28, 4);
    g.fillStyle(brass, 0.95); // 双排铜扣
    for (let k = 0; k < 3; k++) {
        g.fillCircle(x - f * 6, topY + 34 + k * 7 + sway * 0.3, 1.3);
        g.fillCircle(x + f * 6, topY + 34 + k * 7 + sway * 0.3, 1.3);
    }
    // 怀表链（横跨的马甲链）
    g.lineStyle(1.2, brass, 0.9);
    g.beginPath();
    g.moveTo(x - f * 10, topY + 38 + sway * 0.3);
    for (let k = 1; k <= 6; k++)
        g.lineTo(x - f * 10 + k * f * 3.2, topY + 37 + Math.sin(k) * 1.4 + sway * 0.3);
    g.strokePath();
    g.fillStyle(brassD, 1); // 表袋里的怀表
    g.fillCircle(x + f * 9, topY + 44 + sway * 0.3, 2.4);
    // 双臂（一手扶护目镜、一手持怀表）
    for (const s of [-1, 1]) {
        g.fillStyle(coat, 1);
        g.save();
        g.translateCanvas(x + s * 12, topY + 32 + sway * 0.3);
        g.rotateCanvas(s * 0.55 + Math.sin(now / 460 + s) * 0.06);
        g.fillRoundedRect(-3.6, 0, 7.2, 20, 3.4);
        g.fillStyle(skinT, 1);
        g.fillCircle(0, 21, 2.8);
        g.restore();
    }
    // 头（凌乱发 + 黄铜风镜 + 围巾）
    const hy = topY + 13 + sway * 0.4;
    g.fillStyle(skinT, 1);
    g.fillCircle(x, hy, 11);
    g.fillStyle(0x4a3a2a, 1); // 翘起的乱发
    for (let k = -2; k <= 2; k++) {
        g.fillTriangle(x + k * 4 - 2, hy - 8, x + k * 4 + 2, hy - 8, x + k * 4.6, hy - 14 - Math.abs(k) * -1.4 + Math.sin(now / 300 + k) * 0.8);
    }
    g.fillStyle(brass, 1); // 额上风镜（双圆）
    for (const s of [-1, 1]) {
        g.fillCircle(x + s * 5, hy - 7, 4);
        g.fillStyle(0x8fb8d0, 0.9);
        g.fillCircle(x + s * 5, hy - 7, 2.6);
        const gl = 0.4 + 0.4 * Math.sin(now / 480 + s); // 玻璃反光
        g.fillStyle(0xffffff, gl);
        g.fillCircle(x + s * 5 - 1, hy - 8, 1);
        g.fillStyle(brass, 1);
    }
    g.fillStyle(0x8a2a2a, 1); // 脖上围巾（一端飘动）
    g.fillRoundedRect(x - 8, hy + 9, 16, 5, 2);
    g.fillPoints([
        { x: x - f * 8, y: hy + 11 }, { x: x - f * 18 - sway, y: hy + 16 }, { x: x - f * 16 - sway, y: hy + 21 }, { x: x - f * 7, y: hy + 14 },
    ], true);
    // 环身时间涟漪 + 齿轮
    for (let k = 0; k < 2; k++) {
        const ph = (now / 1200 + k / 2) % 1;
        g.lineStyle(1.4, 0x9b5cff, 0.4 * (1 - ph));
        g.strokeCircle(x, topY + 46, 16 + ph * 36);
    }
    for (let k = 0; k < 2; k++) {
        const ang = (k ? 1 : -1) * now / 400 + k * 2;
        const gx = x + Math.cos(ang) * 20, gy = topY + 40 + Math.sin(ang) * 26;
        g.lineStyle(1.2, brass, 0.8);
        g.strokeCircle(gx, gy, 3);
        g.fillStyle(brass, 0.9);
        g.fillCircle(gx, gy, 1);
    }
};
