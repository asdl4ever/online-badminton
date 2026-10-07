import { groundShadow } from './shared.js';
import { PLAYER_H } from '../../constants.js';
/** 批三主题 5★ 皮肤（光之巨人 / 怪兽之王） */
/** 光之巨人：银红配色的巨人之躯——胸口计时器呼吸、目眼放光、手刀蓄光 */
export const otmSpirit = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const silver = 0xd8e0ea, red = 0xff4a5c, dark = 0x8a94a2;
    groundShadow(g, pose, 52);
    const breathe = Math.sin(now / 520) * 1.4;
    // 双腿（银色腿甲 + 红色腿纹）
    for (const s of [-1, 1]) {
        const step = Math.sin(now / 240 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
        g.fillStyle(silver, 1);
        g.fillRoundedRect(x + s * 8 - 5, topY + 62, 10, 24, 3);
        g.fillStyle(red, 0.9); // 腿侧红纹
        g.fillRect(x + s * 8 - 1.4 + step * 0.3, topY + 64, 2.8, 18);
        g.fillStyle(dark, 1);
        g.fillRoundedRect(x + s * 8 - 6 + step, feetY - 5, 12, 5, 2);
    }
    // 躯干（银色胸甲 + 双肩红纹 + 胸口计时器）
    g.fillStyle(silver, 1);
    g.fillRoundedRect(x - 15, topY + 28 + breathe, 30, 36, 7);
    g.fillStyle(0xf0f4fa, 0.7); // 胸甲受光
    g.fillRoundedRect(x - 12, topY + 30 + breathe, 10, 30, 5);
    for (const s of [-1, 1]) { // 肩部红纹条
        g.fillStyle(red, 1);
        g.fillRoundedRect(x + s * 13 - 2.4, topY + 30 + breathe, 4.8, 14, 2);
        g.fillStyle(dark, 1); // 肩甲
        g.fillEllipse(x + s * 16, topY + 30 + breathe, 12, 8);
    }
    g.fillStyle(red, 1); // 躯干中央红槽
    g.fillRect(x - 3, topY + 34 + breathe, 6, 8);
    const timer = 0.5 + 0.5 * Math.sin(now / 320); // 胸口计时器（蓝↔红警示呼吸）
    const warn = timer > 0.75;
    g.fillStyle(dark, 1);
    g.fillCircle(x, topY + 44 + breathe, 6.4);
    g.fillStyle(warn ? red : 0x9fd8ff, 0.35 + timer * 0.3);
    g.fillCircle(x, topY + 44 + breathe, 4.6);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(x - 1.2, topY + 42.8 + breathe, 1.4);
    // 双臂（右手手刀蓄光）
    for (const s of [-1, 1]) {
        g.lineStyle(6, silver, 1);
        g.lineBetween(x + s * 13, topY + 36, x + s * 21, topY + 52 + breathe);
    }
    const chop = 0.5 + 0.5 * Math.sin(now / 260); // 手刀缘光
    g.fillStyle(0x9fd8ff, 0.3 * chop);
    g.fillEllipse(x + f * 24, topY + 54, 12, 5);
    g.fillStyle(0xdff2ff, 0.95);
    g.fillEllipse(x + f * 23, topY + 54, 8, 3);
    // 头（圆颅 + 头镖冠 + 发光目眼）
    const hy = topY + 14 + breathe;
    g.fillStyle(silver, 1);
    g.fillCircle(x, hy, 12);
    g.fillStyle(0xf0f4fa, 0.6);
    g.fillCircle(x - 3, hy - 3, 6);
    g.fillStyle(0xcfc4a0, 1); // 头镖（竖立小冠刃）
    g.fillRoundedRect(x - 1.6, hy - 22, 3.2, 12, 1.4);
    g.fillStyle(0xffffff, 0.5 + 0.3 * chop);
    g.fillRect(x - 0.6, hy - 21, 1.2, 9);
    for (const s of [-1, 1]) { // 椭圆发光目眼
        const gl = 0.7 + 0.3 * Math.sin(now / 300 + s);
        g.fillStyle(0xffe89a, gl);
        g.fillEllipse(x + s * 5 + f * 1.4, hy - 1, 5, 3);
        g.fillStyle(0xffffff, gl);
        g.fillCircle(x + s * 5 + f * 2, hy - 1, 0.9);
    }
    // 周身光粒
    for (let k = 0; k < 5; k++) {
        const ph = (now / 1200 + k / 5) % 1;
        g.fillStyle(0x9fd8ff, 0.6 * (1 - ph));
        g.fillCircle(x + Math.sin(k * 2.6) * 24, topY + 60 - ph * 70, 1.5 * (1 - ph) + 0.4);
    }
};
/** 怪兽之王：墨绿鳞甲巨兽之躯——背鳍蓄能、atomic 胸纹、甩尾剪影 */
export const kjuSpirit = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const hide = 0x2f4032, scale = 0x3f5a3a, bone = 0xcfc4a0, atomic = 0x5ac8ff;
    groundShadow(g, pose, 58);
    const breathe = Math.sin(now / 460) * 1.6;
    // 尾巴（甩向身后的锥形尾，左右摆）
    const sway = Math.sin(now / 480) * 5;
    g.fillStyle(hide, 1);
    g.fillPoints([
        { x: x - f * 10, y: topY + 70 }, { x: x - f * 34, y: topY + 62 + sway }, { x: x - f * 46, y: topY + 54 + sway * 1.4 }, { x: x - f * 36, y: topY + 74 + sway * 0.6 },
    ], true);
    g.fillStyle(scale, 0.8); // 尾背棱线
    g.fillCircle(x - f * 34, topY + 62 + sway, 3);
    g.fillCircle(x - f * 44, topY + 55 + sway * 1.4, 2);
    // 双腿（粗壮兽腿 + 爪趾）
    for (const s of [-1, 1]) {
        const step = Math.sin(now / 260 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
        g.fillStyle(scale, 1);
        g.fillRoundedRect(x + s * 9 - 6, topY + 60, 12, 24, 4);
        g.fillStyle(hide, 1);
        g.fillRoundedRect(x + s * 9 - 7 + step, feetY - 6, 14, 6, 2);
        for (let k = 0; k < 3; k++) { // 爪趾
            g.fillStyle(bone, 0.9);
            g.fillTriangle(x + s * 9 + step - 5 + k * 4, feetY - 2, x + s * 9 + step - 2 + k * 4, feetY - 2, x + s * 9 + step - 3.5 + k * 4, feetY + 1);
        }
    }
    // 躯干（宽厚鳞甲 + 腹部atomic纹）
    g.fillStyle(hide, 1);
    g.fillRoundedRect(x - 17, topY + 26 + breathe, 34, 38, 8);
    g.fillStyle(scale, 0.7);
    g.fillRoundedRect(x - 14, topY + 28 + breathe, 12, 32, 6);
    for (let k = 0; k < 3; k++) { // 腹部atomic鳃纹（呼吸明灭）
        const gl = 0.35 + 0.3 * Math.sin(now / 340 + k * 1.6);
        g.fillStyle(atomic, gl);
        g.fillRect(x - 3, topY + 38 + k * 8 + breathe, 9, 3);
    }
    // 背鳍阵列（背上五片骨鳍，蓄能辉光向atomic汇聚）
    for (let k = 0; k < 5; k++) {
        const fx = x - f * 15 + f * k * 7;
        const fh = 8 + Math.sin(k * 1.4) * 3 + (k === 2 ? 4 : 0);
        const gl = 0.3 + 0.4 * Math.abs(Math.sin(now / 300 + k * 1.1));
        g.fillStyle(bone, 1);
        g.fillTriangle(fx - 4, topY + 26 + breathe, fx + 4, topY + 26 + breathe, fx, topY + 26 - fh + breathe);
        g.lineStyle(1.6, atomic, gl);
        g.lineBetween(fx, topY + 24 + breathe, fx, topY + 26 - fh + breathe);
        if (k === 2) {
            g.fillStyle(atomic, gl * 0.4);
            g.fillCircle(fx, topY + 20 + breathe, 5);
        }
    }
    // 双臂（兽爪）
    for (const s of [-1, 1]) {
        g.lineStyle(7, scale, 1);
        g.lineBetween(x + s * 14, topY + 34, x + s * 22, topY + 50 + breathe);
        g.fillStyle(bone, 0.9); // 爪尖
        g.fillTriangle(x + s * 20, topY + 50 + breathe, x + s * 26, topY + 52 + breathe, x + s * 22, topY + 56 + breathe);
    }
    // 头（兽首：低颅 + 吻部 + 骨冠 + 竖瞳）
    const hy = topY + 12 + breathe;
    g.fillStyle(hide, 1);
    g.fillCircle(x, hy, 12);
    g.fillStyle(scale, 1); // 吻部
    g.fillEllipse(x + f * 8, hy + 3, 14, 9);
    g.fillStyle(bone, 1); // 头冠骨刺
    g.fillTriangle(x - 6, hy - 9, x + 6, hy - 9, x, hy - 18);
    g.fillStyle(0xffe15c, 0.9); // 竖瞳（红黄凶光）
    g.fillEllipse(x + f * 4, hy - 1, 4.4, 3);
    g.fillStyle(0x101810, 1);
    g.fillEllipse(x + f * 4.6, hy - 1, 1.4, 2.6);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(x + f * 4.8, hy - 1.8, 0.6);
    g.fillStyle(bone, 0.9); // 獠牙
    g.fillTriangle(x + f * 11, hy + 5, x + f * 14, hy + 5, x + f * 12.4, hy + 9);
    // 嘴角atomic电弧（蓄能滋滋）
    for (let k = 0; k < 2; k++) {
        const ph = (now / 350 + k / 2) % 1;
        g.lineStyle(1.2, atomic, 0.7 * (1 - ph));
        g.lineBetween(x + f * 13, hy + 6, x + f * 16 + Math.sin(now / 60 + k) * 2, hy + 4 - ph * 6);
    }
};
