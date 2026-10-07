import { groundShadow } from './shared.js';
import { PLAYER_H } from '../../constants.js';
/** 批八主题 5★ 皮肤（敦煌飞天 / 羽蛇神殿 / 圣辉天界） */
/** 飞天神女：敦煌壁画里的飞天——彩带绕身、散花、足不点地 */
export const dunSpirit = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const skinT = 0xe8c090, skirt = 0xff9adf, gold = 0xffd45c;
    groundShadow(g, pose, 44);
    const float = Math.sin(now / 500) * 3; // 足不点地的浮空
    // 环身双长绸（两根大彩带绕体飞舞）
    for (let k = 0; k < 2; k++) {
        const col = k ? 0xff9adf : 0xffb070;
        g.fillStyle(col, 0.65);
        g.beginPath();
        g.moveTo(x - f * 8, topY + 26 + k * 8);
        for (let s = 1; s <= 10; s++) {
            const u = s / 10;
            g.lineTo(x - f * 8 + u * f * (60 - k * 16), topY + 26 + k * 8 - Math.sin(u * 5 + now / 300 + k * 1.6) * (10 + u * 12));
        }
        for (let s = 10; s >= 0; s--) {
            const u = s / 10;
            g.lineTo(x - f * 8 + u * f * (60 - k * 16), topY + 32 + k * 8 - Math.sin(u * 5 + now / 300 + k * 1.6 + 0.8) * (10 + u * 12));
        }
        g.closePath();
        g.fillPath();
    }
    // 双腿（飘起的裙裤，足尖绷直）
    for (const s of [-1, 1]) {
        g.fillStyle(s > 0 ? skirt : 0xffc0e0, 0.95);
        g.fillRoundedRect(x + s * 6 - 4, topY + 52 + float, 8, 18, 3);
        g.fillStyle(skinT, 1); // 赤足
        g.fillEllipse(x + s * 6, topY + 74 + float, 6, 4);
        g.fillStyle(gold, 0.9); // 脚镯
        g.fillRect(x + s * 6 - 2.4, topY + 68 + float, 5, 1.6);
    }
    // 躯干（短衫露腰 + 披帛）
    g.fillStyle(skinT, 1);
    g.fillRoundedRect(x - 11, topY + 30 + float, 22, 24, 6);
    g.fillStyle(0xd8a878, 0.5);
    g.fillRoundedRect(x - 8, topY + 32 + float, 7, 18, 3);
    g.fillStyle(0x8a4a3a, 0.95); // 短衫抹胸
    g.fillRoundedRect(x - 11, topY + 30 + float, 22, 10, 4);
    g.fillStyle(gold, 0.9); // 金璎珞
    g.fillCircle(x, topY + 44 + float, 1.8);
    g.fillCircle(x, topY + 50 + float, 1.4);
    // 双臂（一手托花一手撒花）
    for (const s of [-1, 1]) {
        g.lineStyle(4.4, skinT, 1);
        g.lineBetween(x + s * 10, topY + 34 + float, x + s * 17, topY + 44 + float);
        g.fillStyle(skinT, 1);
        g.fillCircle(x + s * 18, topY + 46 + float, 2.6);
    }
    // 掌上莲花（发光小莲）
    g.fillStyle(0xffb0c8, 0.9);
    for (let k = 0; k < 5; k++) {
        const ang = (k / 5) * Math.PI * 2 + now / 300;
        g.fillEllipse(x + f * 20 + Math.cos(ang) * 2.6, topY + 42 + float + Math.sin(ang) * 2, 2.4, 1.6);
    }
    g.fillStyle(gold, 0.9);
    g.fillCircle(x + f * 20, topY + 42 + float, 1.2);
    // 头（双环髻 + 花钿 + 步摇）
    const hy = topY + 13 + float;
    g.fillStyle(skinT, 1);
    g.fillCircle(x, hy, 11);
    g.fillStyle(0x3a2a1a, 1); // 双环髻
    g.fillCircle(x - 5, hy - 10, 4.4);
    g.fillCircle(x + 5, hy - 10, 4.4);
    g.fillStyle(gold, 0.9); // 髻上金饰
    g.fillCircle(x - 5, hy - 11, 1.4);
    g.fillCircle(x + 5, hy - 11, 1.4);
    g.fillStyle(0xe8404a, 0.85); // 眉心花钿
    g.fillCircle(x + f * 1, hy - 4, 1.4);
    g.fillStyle(0xffd45c, 0.8);
    g.fillCircle(x + f * 1, hy - 4, 0.7);
    for (const s of [-1, 1]) { // 温婉垂目
        g.fillStyle(0x3a2a1a, 0.9);
        g.fillEllipse(x + s * 4.4, hy - 0.4, 3.8, 1.4);
        g.fillStyle(0xffffff, 0.7);
        g.fillCircle(x + s * 4.4 + f, hy - 1, 0.7);
    }
    g.fillStyle(0xe8404a, 0.8); // 唇
    g.fillEllipse(x + f * 2, hy + 4, 3, 1.6);
    // 环身散花
    for (let k = 0; k < 6; k++) {
        const ph = (now / 1400 + k / 6) % 1;
        g.save();
        g.translateCanvas(x + Math.sin(k * 2.6) * 24 + Math.sin(ph * 4 + k) * 6, topY + 66 - ph * 76);
        g.rotateCanvas(ph * 6 + k);
        g.fillStyle(k % 2 ? 0xffb0c8 : 0xffd45c, 0.7 * Math.sin(ph * Math.PI));
        g.fillEllipse(0, 0, 3, 1.6);
        g.restore();
    }
};
/** 羽蛇神：自天而降的羽蛇神——翡翠龙躯、金羽冠、周身落羽 */
export const aztSpirit = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const jade = 0x2a9a78, jadeD = 0x1e6a52, gold = 0xffd45c, feather = 0x3ad49a;
    groundShadow(g, pose, 56);
    const coil = Math.sin(now / 400) * 2;
    // 盘绕的长蛇尾（身后盘一圈的身体）
    g.fillStyle(jadeD, 1);
    g.fillCircle(x - f * 20, topY + 62, 12);
    g.fillStyle(jade, 1);
    g.fillCircle(x - f * 20, topY + 62, 8);
    g.fillStyle(gold, 0.7); // 尾环纹
    g.fillCircle(x - f * 20, topY + 62, 4);
    g.fillStyle(jadeD, 0.9); // 连接躯干的尾段
    g.fillRoundedRect(x - f * 12, topY + 54, f * 14, 12, 5);
    // 躯干（翡翠鳞甲 + 金腹甲）
    g.fillStyle(jade, 1);
    g.fillRoundedRect(x - 13, topY + 28 + coil * 0.4, 26, 34, 8);
    g.fillStyle(gold, 0.85); // 腹甲（横节）
    g.fillRoundedRect(x - 6, topY + 34 + coil * 0.4, 12, 24, 4);
    g.lineStyle(1, jadeD, 0.8);
    for (let k = 0; k < 4; k++)
        g.lineBetween(x - 6, topY + 38 + k * 6 + coil * 0.4, x + 6, topY + 38 + k * 6 + coil * 0.4);
    // 背部羽冠鬃（沿背一排绿羽）
    for (let k = 0; k < 4; k++) {
        g.fillStyle(feather, 0.95);
        g.fillTriangle(x - f * 10 + f * k * 6, topY + 28 + coil * 0.4, x - f * 10 + f * (k * 6 + 6), topY + 28 + coil * 0.4, x - f * 10 + f * (k * 6 + 3), topY + 16 + coil * 0.4);
        g.fillStyle(gold, 0.8); // 羽尖金点
        g.fillCircle(x - f * 10 + f * (k * 6 + 3), topY + 17 + coil * 0.4, 1.2);
    }
    // 双臂（龙爪臂）
    for (const s of [-1, 1]) {
        g.lineStyle(5, jade, 1);
        g.lineBetween(x + s * 11, topY + 34 + coil * 0.4, x + s * 18, topY + 48 + coil * 0.4);
        g.fillStyle(gold, 0.9); // 三爪
        for (let k = 0; k < 3; k++) {
            g.fillTriangle(x + s * 17, topY + 48 + coil * 0.4, x + s * 21, topY + 46 + coil * 0.4, x + s * 19, topY + 53 + coil * 0.4);
        }
    }
    // 头（羽蛇首：长吻 + 羽冠 + 金睛 + 吐信）
    const hy = topY + 12 + coil * 0.4;
    g.fillStyle(jade, 1);
    g.fillCircle(x, hy, 12);
    g.fillStyle(jadeD, 1); // 长吻
    g.fillEllipse(x + f * 10, hy + 3, 15, 9);
    g.fillStyle(0x0e2418, 1);
    g.fillCircle(x + f * 14, hy + 2, 1);
    g.fillStyle(0xfff0d8, 0.9); // 獠牙
    g.fillTriangle(x + f * 12, hy + 6, x + f * 15, hy + 6, x + f * 13.4, hy + 10);
    for (const s of [-1, 1]) { // 大羽冠（扇形展开）
        for (let k = 0; k < 3; k++) {
            g.fillStyle(k % 2 ? feather : gold, 0.95);
            g.fillEllipse(x + s * (6 + k * 3.4), hy - 10 - k * 2.6 + Math.sin(now / 300 + s + k) * 1.2, 5, 3);
        }
    }
    for (const s of [-1, 1]) { // 金睛竖瞳
        g.fillStyle(gold, 0.95);
        g.fillEllipse(x + s * 4.6, hy - 1, 4.4, 3);
        g.fillStyle(0x0e2418, 1);
        g.fillEllipse(x + s * 4.6 + f * 0.6, hy - 1, 1.2, 2.4);
    }
    // 吐信（分叉红信）
    const flick = Math.abs(Math.sin(now / 160));
    g.lineStyle(1.2, 0xe8404a, flick);
    g.lineBetween(x + f * 16, hy + 4, x + f * 19 + flick * 3, hy + 4);
    g.lineBetween(x + f * 19 + flick * 3, hy + 4, x + f * 20.4 + flick * 3, hy + 3);
    g.lineBetween(x + f * 19 + flick * 3, hy + 4, x + f * 20.4 + flick * 3, hy + 5);
    // 环身落羽
    for (let k = 0; k < 6; k++) {
        const ph = (now / 1500 + k / 6) % 1;
        g.save();
        g.translateCanvas(x + Math.sin(k * 2.7) * 26 + Math.sin(ph * 4 + k) * 6, topY + 60 - ph * 76);
        g.rotateCanvas(ph * 5 + k);
        g.fillStyle(k % 2 ? feather : gold, 0.7 * Math.sin(ph * Math.PI));
        g.fillEllipse(0, 0, 4, 1.8);
        g.restore();
    }
};
/** 大天使：执剑的大天使——白袍金甲、六翼隐现、脚下圣云 */
export const angSpirit = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const robe = 0xf0ead8, armor = 0xd9b45c, halo = 0xffd45c, skinT = 0xe8c090;
    groundShadow(g, pose, 50);
    const float = Math.sin(now / 480) * 2.6;
    // 六翼（背后三对收拢光翼，错相微扇）
    for (let k = 0; k < 3; k++) {
        for (const s of [-1, 1]) {
            const flap = Math.sin(now / 320 + k * 1.2 + (s > 0 ? 0 : 0.7)) * 0.08;
            g.save();
            g.translateCanvas(x - f * 10, topY + 34 + float);
            g.rotateCanvas(s * (0.5 + k * 0.3) + flap + Math.PI / 2);
            g.fillStyle(k % 2 ? robe : 0xf8f2e0, 0.85);
            g.fillEllipse(0, 14 + k * 4, 7, 20 + k * 6);
            g.fillStyle(0xffffff, 0.6);
            g.fillEllipse(0, 16 + k * 4, 3.4, 14 + k * 5);
            g.restore();
        }
    }
    // 双腿（白袍下摆 + 赤足悬空）
    for (const s of [-1, 1]) {
        g.fillStyle(robe, 1);
        g.fillRoundedRect(x + s * 7 - 4.4, topY + 56 + float, 9, 18, 3);
        g.fillStyle(skinT, 1);
        g.fillEllipse(x + s * 7, topY + 76 + float, 6, 3.4);
    }
    // 躯干（白袍 + 金胸甲）
    g.fillStyle(robe, 1);
    g.fillRoundedRect(x - 12, topY + 28 + float, 24, 32, 6);
    g.fillStyle(armor, 0.95); // 金胸甲
    g.fillRoundedRect(x - 8, topY + 32 + float, 16, 14, 4);
    g.fillStyle(0xfff0d8, 0.6);
    g.fillRoundedRect(x - 6, topY + 33 + float, 6, 11, 3);
    g.lineStyle(1.4, armor, 0.9); // 圣十字纹
    g.lineBetween(x, topY + 33 + float, x, topY + 45 + float);
    g.lineBetween(x - 3.4, topY + 37 + float, x + 3.4, topY + 37 + float);
    g.fillStyle(armor, 0.9); // 腰封
    g.fillRect(x - 12, topY + 52 + float, 24, 4.4);
    // 双臂（一手前伸执光剑）
    for (const s of [-1, 1]) {
        g.fillStyle(robe, 1);
        g.save();
        g.translateCanvas(x + s * 11, topY + 32 + float);
        g.rotateCanvas(s * 0.6);
        g.fillRoundedRect(-3.4, 0, 6.8, 19, 3);
        g.fillStyle(skinT, 1);
        g.fillCircle(0, 20, 2.6);
        g.restore();
    }
    // 执光剑（刃身发光 + 剑格翼）
    g.save();
    g.translateCanvas(x + f * 14, topY + 44 + float);
    g.rotateCanvas(f * -0.5);
    g.fillStyle(armor, 1);
    g.fillRect(-5.4, -2, 10.8, 3.4); // 剑格
    g.fillStyle(0xfff6d8, 1);
    g.fillPoints([
        { x: 0, y: -2.4 }, { x: 20, y: -1 }, { x: 27, y: 0 }, { x: 20, y: 1 }, { x: 0, y: 2.4 },
    ], true);
    g.fillStyle(0xffffff, 0.7 + 0.3 * Math.sin(now / 240)); // 剑身圣光
    g.fillPoints([
        { x: 0, y: -2.4 }, { x: 20, y: -1 }, { x: 24, y: 0 }, { x: 0, y: -1 },
    ], true);
    g.restore();
    // 头（圣洁面容 + 金发 + 悬浮光环）
    const hy = topY + 12 + float;
    g.fillStyle(skinT, 1);
    g.fillCircle(x, hy, 11);
    g.fillStyle(0xe8c888, 1); // 金发（中分披发）
    g.fillEllipse(x - f * 4, hy - 8, 18, 8);
    g.fillEllipse(x - f * 10, hy + 2, 6, 14);
    g.fillEllipse(x + f * 10, hy + 2, 6, 14);
    g.fillStyle(halo, 0.9); // 头顶光环（倾斜椭圆 + 微光）
    g.lineStyle(3, halo, 0.9);
    g.strokeEllipse(x, hy - 15, 24, 7);
    g.fillStyle(0xffffff, 0.7);
    g.fillEllipse(x - 6, hy - 16.4, 5, 1.8);
    for (const s of [-1, 1]) { // 圣洁双目
        g.fillStyle(0xfff6d8, 0.9);
        g.fillEllipse(x + s * 4.4, hy - 1, 3.8, 2.2);
        g.fillStyle(0x4a3a1a, 1);
        g.fillCircle(x + s * 4.4 + f * 0.6, hy - 1, 0.9);
    }
    g.fillStyle(0xffffff, 0.6); // 周身圣光
    g.fillCircle(x, topY + 40 + float, 30);
    // 脚下圣云
    g.fillStyle(0xf0ead8, 0.7);
    g.fillEllipse(x, feetY + 1, 40, 9);
    g.fillEllipse(x - f * 8, feetY - 1, 14, 5);
    g.fillEllipse(x + f * 8, feetY, 13, 5);
    // 环身光尘
    for (let k = 0; k < 5; k++) {
        const ph = (now / 1200 + k / 5) % 1;
        g.fillStyle(0xfff6d8, 0.6 * (1 - ph));
        g.fillCircle(x + Math.sin(k * 2.6) * 22, topY + 60 - ph * 70, 1.4 * (1 - ph) + 0.4);
    }
};
