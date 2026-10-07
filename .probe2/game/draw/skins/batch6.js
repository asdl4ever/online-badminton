import { groundShadow } from './shared.js';
import { PLAYER_H } from '../../constants.js';
/** 批六主题 5★ 皮肤（法老秘葬 / 暗部忍道） */
/** 法老王：黄金面具的法老——奈美斯金冠、假胡须、圣蛇权杖、周身圣沙 */
export const egSpirit = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const gold = 0xffd45c, goldD = 0xd9b45c, blue = 0x3a5a8a, linen = 0xf0e6c8;
    groundShadow(g, pose, 54);
    const breathe = Math.sin(now / 480) * 1.4;
    // 双腿（白色亚麻围腰布 + 金胫甲）
    for (const s of [-1, 1]) {
        const step = Math.sin(now / 250 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
        g.fillStyle(linen, 1);
        g.fillRoundedRect(x + s * 8 - 5, topY + 54, 10, 20, 3);
        g.fillStyle(goldD, 0.9);
        g.fillRoundedRect(x + s * 8 - 4.4 + step * 0.4, topY + 68, 9, 10, 2);
        g.fillStyle(0x2a2010, 1);
        g.fillRoundedRect(x + s * 8 - 5.4 + step, feetY - 5, 11, 5, 2);
    }
    // 围腰布（金蓝条纹的法老裙）
    g.fillStyle(linen, 1);
    g.fillRoundedRect(x - 13, topY + 48 + breathe, 26, 12, 3);
    for (let k = 0; k < 4; k++) {
        g.fillStyle(k % 2 ? blue : gold, 0.85);
        g.fillRect(x - 12 + k * 6.4, topY + 49 + breathe, 3, 10);
    }
    g.lineStyle(1.6, gold, 1); // 金腰带
    g.lineBetween(x - 13, topY + 48 + breathe, x + 13, topY + 48 + breathe);
    // 躯干（古铜肤色 + 金项圈）
    g.fillStyle(0xc08a58, 1);
    g.fillRoundedRect(x - 12, topY + 28 + breathe, 24, 22, 6);
    g.fillStyle(0xd09a68, 0.6);
    g.fillRoundedRect(x - 9, topY + 30 + breathe, 8, 16, 4);
    // 宽项圈（三层金蓝珠帘）
    for (let k = 0; k < 3; k++) {
        g.lineStyle(2.4, k % 2 ? blue : gold, 0.95);
        g.beginPath();
        g.arc(x, topY + 30 + breathe, 12 + k * 3.4, 0.35, Math.PI - 0.35);
        g.strokePath();
    }
    // 双臂（一手持弯钩权杖）
    for (const s of [-1, 1]) {
        g.lineStyle(5, 0xc08a58, 1);
        g.lineBetween(x + s * 11, topY + 34 + breathe, x + s * 18, topY + 48 + breathe);
    }
    g.save();
    g.translateCanvas(x + f * 19, topY + 48 + breathe);
    g.rotateCanvas(-0.2);
    g.fillStyle(goldD, 1);
    g.fillRect(-2, -22, 4, 24);
    g.fillStyle(gold, 1);
    g.fillRect(-2.6, -26, 5.2, 5);
    g.fillPoints([{ x: -2.6, y: -23 }, { x: -9, y: -26 }, { x: -9, y: -21 }, { x: -2.6, y: -20 }], true);
    g.restore();
    // 头（奈美斯金冠 + 黄金面具脸 + 假胡须）
    const hy = topY + 13 + breathe;
    g.fillStyle(gold, 1); // 冠体
    g.beginPath();
    g.arc(x, hy, 13, Math.PI, 0);
    g.closePath();
    g.fillPath();
    g.fillRect(x - 13, hy, 26, 5);
    for (let k = -2; k <= 2; k++) { // 金蓝条纹
        g.fillStyle(k % 2 ? blue : goldD, 0.9);
        g.fillRect(x + k * 5.4 - 1.2, hy - 11 + Math.abs(k) * 1.2, 2.4, 11 - Math.abs(k) * 1.2);
    }
    for (const s of [-1, 1]) { // 冠垂翼
        g.fillStyle(gold, 0.95);
        g.fillPoints([
            { x: x + s * 12, y: hy + 2 }, { x: x + s * 15, y: hy + 13 }, { x: x + s * 17, y: hy + 18 }, { x: x + s * 11, y: hy + 6 },
        ], true);
    }
    g.fillStyle(0xd0a060, 1); // 面具脸（黄金面）
    g.fillEllipse(x, hy + 1, 17, 15);
    g.fillStyle(0xe8b878, 0.5);
    g.fillEllipse(x - 3, hy - 1, 6, 8);
    for (const s of [-1, 1]) { // 法老眼线（黑长眼线 + 白瞳）
        g.lineStyle(1.6, 0x1a1408, 1);
        g.lineBetween(x + s * 2.4, hy - 2, x + s * 6, hy - 2.6);
        g.fillStyle(0xffffff, 0.9);
        g.fillEllipse(x + s * 4.4, hy - 1, 3.4, 2);
        g.fillStyle(0x1a1408, 1);
        g.fillCircle(x + s * 4.4 + f * 0.6, hy - 1, 0.9);
    }
    g.fillStyle(0x1a1408, 0.9); // 眉
    g.fillRect(x - 6, hy - 4.4, 4.6, 1.2);
    g.fillRect(x + 1.4, hy - 4.4, 4.6, 1.2);
    g.fillStyle(goldD, 1); // 假胡须（山羊须金管）
    g.fillRect(x - 1.6, hy + 9, 3.2, 10);
    g.fillStyle(0xfff0b0, 0.6);
    g.fillRect(x - 1.6, hy + 9, 1.2, 10);
    // 圣蛇徽（冠前小蛇）
    g.fillStyle(goldD, 1);
    g.fillEllipse(x + f * 1, hy - 12, 4, 6);
    g.fillStyle(0xe8404a, 0.6 + 0.4 * Math.sin(now / 300)); // 蛇眼红点
    g.fillCircle(x + f * 1, hy - 14, 0.7);
    // 周身圣沙
    for (let k = 0; k < 5; k++) {
        const ph = (now / 1200 + k / 5) % 1;
        g.fillStyle(0xe8c88a, 0.6 * (1 - ph));
        g.fillCircle(x + Math.sin(k * 2.6) * 24 + Math.sin(ph * 5 + k) * 5, topY + 60 - ph * 70, 1.4 * (1 - ph) + 0.4);
    }
};
/** 暗部首领：蒙面暗部忍者——斗篷残影、结印起手、瞬身残像 */
export const njaSpirit = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const suit = 0x2a2a34, suitD = 0x1a1a22, purple = 0xb08ad0;
    groundShadow(g, pose, 50);
    const sway = Math.sin(now / 460) * 1.6;
    // 斗篷残影（身后撕碎的暗斗篷）
    g.fillStyle(suitD, 0.85);
    g.fillPoints([
        { x: x - f * 8, y: topY + 28 }, { x: x - f * 26 - sway * 2, y: topY + 46 }, { x: x - f * 22, y: topY + 66 },
        { x: x - f * 30, y: topY + 58 }, { x: x - f * 14, y: topY + 62 },
    ], true);
    // 双腿（窄管忍裤 + 软底靴）
    for (const s of [-1, 1]) {
        const step = Math.sin(now / 240 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
        g.fillStyle(suit, 1);
        g.fillRoundedRect(x + s * 7 - 4, topY + 58, 8, 22, 3);
        g.fillStyle(suitD, 1);
        g.fillRoundedRect(x + s * 7 - 4.4 + step, feetY - 5, 9, 5, 2);
    }
    // 躯干（束腰忍装 + 胸前绑带）
    g.fillStyle(suit, 1);
    g.fillRoundedRect(x - 12, topY + 28 + sway * 0.3, 24, 32, 6);
    g.fillStyle(suitD, 0.8);
    g.fillRoundedRect(x - 9, topY + 30 + sway * 0.3, 8, 26, 4);
    g.lineStyle(1.8, 0x3a3a44, 1); // 胸绑带
    g.lineBetween(x - 11, topY + 36 + sway * 0.3, x + 11, topY + 42 + sway * 0.3);
    g.lineBetween(x - 11, topY + 44 + sway * 0.3, x + 11, topY + 38 + sway * 0.3);
    g.fillStyle(purple, 0.9); // 腰间紫绳结
    g.fillCircle(x + f * 5, topY + 52 + sway * 0.3, 2.2);
    // 双臂（一臂结印、一臂负后）
    g.fillStyle(suit, 1);
    g.save();
    g.translateCanvas(x + f * 11, topY + 34 + sway * 0.3);
    g.rotateCanvas(f * 0.5);
    g.fillRoundedRect(-3.4, 0, 6.8, 18, 3);
    g.fillStyle(0xe8c090, 1); // 结印的手
    g.fillCircle(0, 19, 3);
    g.fillStyle(suitD, 1); // 合拢的指尖
    g.fillTriangle(-2.4, 17, 2.4, 17, 0, 13);
    g.restore();
    g.lineStyle(5, suit, 1);
    g.lineBetween(x - f * 11, topY + 36 + sway * 0.3, x - f * 19, topY + 30 + sway * 0.3);
    // 头（面罩头套 + 额护 + 单眼锐光）
    const hy = topY + 13 + sway * 0.4;
    g.fillStyle(suit, 1);
    g.fillCircle(x, hy, 11);
    g.fillStyle(suitD, 1); // 面罩（下半脸）
    g.fillRoundedRect(x - 10, hy + 1, 20, 10, 4);
    g.fillStyle(0x8a94a2, 1); // 斜挂的额护
    g.save();
    g.translateCanvas(x, hy - 3);
    g.rotateCanvas(-0.12);
    g.fillRoundedRect(-9, -3, 18, 7, 1.6);
    g.fillStyle(0xb8c0cc, 0.6);
    g.fillRect(-9, -3, 18, 2.4);
    g.lineStyle(1, 0x5a6472, 0.9); // 板上划痕徽
    g.beginPath();
    g.arc(0, 0.4, 2, 0.4, 3.4);
    g.strokePath();
    g.restore();
    for (const s of [-1, 1]) { // 双眼（一只平时、一只红瞳）
        const isRed = s === f;
        g.fillStyle(0xf0f4fa, 0.9);
        g.fillEllipse(x + s * 4.4, hy - 1, 4.4, 2);
        g.fillStyle(isRed ? 0xff5a5c : 0x1a1a22, 1);
        g.fillCircle(x + s * 4.4 + f * 0.8, hy - 1, 1);
        if (isRed) {
            g.fillStyle(0xff5a5c, 0.35 + 0.25 * Math.sin(now / 240)); // 红瞳辉光
            g.fillCircle(x + s * 4.4 + f * 0.8, hy - 1, 2.4);
        }
    }
    // 瞬身残像（身后两道淡紫残影条）
    for (let k = 0; k < 2; k++) {
        const ph = (now / 900 + k / 2) % 1;
        g.fillStyle(purple, 0.2 * (1 - ph));
        g.fillRect(x - f * (16 + ph * 20) - 2, topY + 30, 4, 40);
    }
    // 环身紫电
    for (let k = 0; k < 3; k++) {
        const a0 = now / 130 + k * 2.1;
        const px = Math.cos(a0) * 22, py = topY + 44 + Math.sin(a0) * 30;
        g.lineStyle(1.2, purple, 0.7);
        g.lineBetween(px, py, px + Math.sin(now / 45 + k) * 8, py + Math.cos(now / 50 + k) * 7);
    }
};
