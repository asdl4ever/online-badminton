import { groundShadow } from './shared.js';
import { PLAYER_H } from '../../constants.js';
/** 批九主题 5★ 皮肤（童话王国 / 深夜食堂 / 猫咖物语） */
/** 童话王子：童话绘本里的王子——金冠、小披风、佩剑、蝴蝶环绕 */
export const taleSpirit = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const coat = 0x463456, coatD = 0x3a2a4a, gold = 0xffd45c, skinT = 0xe8c090;
    groundShadow(g, pose, 48);
    const bounce = Math.sin(now / 380) * 1.4; // 王子的小跳步
    // 披风（身后飘起的小披风）
    g.fillStyle(coatD, 0.9);
    g.fillPoints([
        { x: x - f * 6, y: topY + 28 + bounce }, { x: x - f * 24 - Math.sin(now / 420) * 3, y: topY + 44 },
        { x: x - f * 26, y: topY + 62 }, { x: x - f * 10, y: topY + 58 },
    ], true);
    g.fillStyle(0x2a1e38, 0.6); // 披风内衬
    g.fillPoints([
        { x: x - f * 10, y: topY + 34 + bounce }, { x: x - f * 20, y: topY + 48 }, { x: x - f * 20, y: topY + 58 }, { x: x - f * 12, y: topY + 54 },
    ], true);
    // 双腿（白马裤 + 长靴）
    for (const s of [-1, 1]) {
        const step = Math.sin(now / 240 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
        g.fillStyle(0xf0ead8, 1);
        g.fillRoundedRect(x + s * 6 - 4, topY + 56 + bounce, 8, 18, 3);
        g.fillStyle(0x1a1410, 1);
        g.fillRoundedRect(x + s * 6 - 4.4 + step, feetY - 6, 9, 6, 2);
    }
    // 躯干（礼服外套 + 绶带）
    g.fillStyle(coat, 1);
    g.fillRoundedRect(x - 11, topY + 28 + bounce, 22, 30, 5);
    g.fillStyle(0x54406a, 0.6);
    g.fillRoundedRect(x - 8, topY + 30 + bounce, 7, 24, 3);
    g.fillStyle(0xe8404a, 0.9); // 绶带
    g.fillPoints([
        { x: x + f * 6, y: topY + 30 + bounce }, { x: x + f * 10, y: topY + 34 + bounce }, { x: x - f * 2, y: topY + 54 + bounce },
    ], true);
    g.fillStyle(0xfff6d8, 0.9); // 绶带上的勋章
    g.fillCircle(x + f * 3, topY + 42 + bounce, 2);
    g.fillStyle(gold, 0.9); // 一排金扣
    for (let k = 0; k < 3; k++)
        g.fillCircle(x - f * 7, topY + 34 + k * 6 + bounce, 1.2);
    // 双臂（一手扶冠一手背后）
    for (const s of [-1, 1]) {
        g.fillStyle(coat, 1);
        g.save();
        g.translateCanvas(x + s * 10, topY + 32 + bounce);
        g.rotateCanvas(s * 0.5);
        g.fillRoundedRect(-3.4, 0, 6.8, 18, 3);
        g.fillStyle(0xf0ead8, 1); // 白手套
        g.fillCircle(0, 19, 2.6);
        g.restore();
    }
    // 佩剑（腰间小剑）
    g.save();
    g.translateCanvas(x - f * 8, topY + 50 + bounce);
    g.rotateCanvas(-0.5);
    g.fillStyle(0xd9b45c, 1);
    g.fillRect(-1.4, -2, 2.8, 10);
    g.fillStyle(0xdfe8f5, 1);
    g.fillRect(-1, -10, 2, 8);
    g.restore();
    // 头（微卷金发 + 小金冠 + 亮眼睛）
    const hy = topY + 12 + bounce;
    g.fillStyle(skinT, 1);
    g.fillCircle(x, hy, 11);
    g.fillStyle(0xe8c888, 1); // 微卷金发
    g.fillEllipse(x, hy - 8, 20, 8);
    for (let k = -2; k <= 2; k++) {
        g.fillCircle(x + k * 4.4, hy - 9 + Math.abs(k) * 1.6, 3);
    }
    g.fillStyle(gold, 1); // 小金冠（三尖）
    g.fillRect(x - 6, hy - 16, 12, 4);
    for (let k = -1; k <= 1; k++) {
        g.fillTriangle(x + k * 4.4 - 2, hy - 16, x + k * 4.4 + 2, hy - 16, x + k * 4.4, hy - 21);
    }
    g.fillStyle(0x5ac8ff, 0.95); // 冠心蓝宝
    g.fillCircle(x, hy - 15, 1.4);
    for (const s of [-1, 1]) { // 亮眼
        g.fillStyle(0x2a1a30, 0.9);
        g.fillCircle(x + s * 4.4, hy - 1, 1.4);
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(x + s * 4.4 + f * 0.6, hy - 1.4, 0.6);
    }
    // 环绕的蝴蝶（两只会飞的蝴蝶）
    for (let k = 0; k < 2; k++) {
        const ang = now / 900 + k * Math.PI;
        const bx = x + Math.cos(ang) * 22, by2 = topY + 40 + Math.sin(ang * 2) * 10;
        const flap = Math.sin(now / 90 + k) * 0.6;
        g.fillStyle(k ? 0xff9adf : 0x5ac8ff, 0.9);
        g.fillEllipse(bx - 2 * Math.cos(flap), by2, 3.4, 2);
        g.fillEllipse(bx + 2 * Math.cos(flap), by2, 3.4, 2);
        g.fillStyle(0x2a1a30, 0.9);
        g.fillRect(bx - 0.4, by2 - 1.4, 0.8, 2.8);
    }
    // 环身星光
    for (let k = 0; k < 4; k++) {
        const ph = (now / 1000 + k / 4) % 1;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k * 1.6));
        g.fillStyle(0xfff0b0, tw * Math.sin(ph * Math.PI));
        g.fillCircle(x + Math.sin(k * 2.6) * 20, topY + 62 - ph * 70, 1.2);
    }
};
/** 深夜老板：系围裙的深夜食堂老板——头巾、白勺、炊烟、围裙油点 */
export const dinSpirit = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const shirt = 0x39424e, apron = 0xe8e0d0, towel = 0xd9453a, skinT = 0xd8a878;
    groundShadow(g, pose, 52);
    const breathe = Math.sin(now / 460) * 1.2;
    // 双腿（工作裤 + 布鞋）
    for (const s of [-1, 1]) {
        const step = Math.sin(now / 250 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
        g.fillStyle(0x2a2420, 1);
        g.fillRoundedRect(x + s * 7 - 4.4, topY + 58, 9, 22, 3);
        g.fillStyle(0x1a1410, 1);
        g.fillRoundedRect(x + s * 7 - 4.8 + step, feetY - 5, 10, 5, 2);
    }
    // 躯干（白围裙罩深色工作衫）
    g.fillStyle(shirt, 1);
    g.fillRoundedRect(x - 12, topY + 28 + breathe, 24, 34, 5);
    g.fillStyle(apron, 1); // 围裙（胸前到膝）
    g.fillRoundedRect(x - 9, topY + 40 + breathe, 18, 30, 3);
    g.lineStyle(1.6, apron, 0.9); // 围裙系带绕颈
    g.lineBetween(x - 9, topY + 40 + breathe, x - 5, topY + 30 + breathe);
    g.lineBetween(x + 9, topY + 40 + breathe, x + 5, topY + 30 + breathe);
    g.fillStyle(0xc0b8a8, 0.7); // 围裙油点（斜排小点）
    for (let k = 0; k < 5; k++) {
        g.fillCircle(x - 6 + (k % 3) * 6, topY + 48 + Math.floor(k / 3) * 9 + breathe, 0.9);
    }
    g.fillStyle(0x8a6a3a, 0.9); // 围裙口袋
    g.fillRect(x - 6, topY + 56 + breathe, 12, 6);
    // 双臂（一手叉腰一手持勺）
    for (const s of [-1, 1]) {
        g.fillStyle(shirt, 1);
        g.save();
        g.translateCanvas(x + s * 11, topY + 32 + breathe);
        g.rotateCanvas(s * 0.55);
        g.fillRoundedRect(-3.4, 0, 6.8, 18, 3);
        g.fillStyle(skinT, 1);
        g.fillCircle(0, 19, 2.6);
        g.restore();
    }
    // 手中长勺（斜插肩后的大勺）
    g.save();
    g.translateCanvas(x + f * 13, topY + 34 + breathe);
    g.rotateCanvas(f * 0.4);
    g.fillStyle(0x8a5a3a, 1);
    g.fillRect(-1.6, -20, 3.2, 22);
    g.fillStyle(0x39424e, 1);
    g.fillEllipse(0, 3, 6, 8);
    g.restore();
    // 头（短寸 + 胡渣 + 肩上毛巾）
    const hy = topY + 12 + breathe;
    g.fillStyle(skinT, 1);
    g.fillCircle(x, hy, 11);
    g.fillStyle(0x2a2018, 1); // 短寸发
    g.fillEllipse(x, hy - 8, 20, 7);
    g.fillStyle(0x3a2e20, 0.7); // 胡渣
    g.fillEllipse(x + f * 3, hy + 6, 10, 4);
    g.fillStyle(towel, 1); // 肩上红毛巾
    g.fillRoundedRect(x - f * 12, topY + 24 + breathe, 6, 16, 2);
    g.fillStyle(0xb8382e, 0.7);
    g.fillRect(x - f * 12, topY + 30 + breathe, 6, 2);
    for (const s of [-1, 1]) { // 疲惫温和的眼（下垂眼角）
        g.fillStyle(0x1a1410, 0.9);
        g.fillEllipse(x + s * 4.4, hy - 1, 3.8, 1.8);
        g.fillStyle(0xffffff, 0.6);
        g.fillCircle(x + s * 4.4 + f, hy - 1.4, 0.7);
    }
    g.fillStyle(0x8a5a3a, 0.8); // 微笑
    g.lineBetween(x - f * 2, hy + 5, x + f * 4, hy + 5.4);
    // 环身炊烟香雾
    for (let k = 0; k < 4; k++) {
        const ph = (now / 1600 + k / 4) % 1;
        g.fillStyle(0xf0ead8, 0.25 * Math.sin(ph * Math.PI));
        g.fillCircle(x + Math.sin(k * 2.6) * 20 + Math.sin(ph * 4 + k) * 5, topY + 64 - ph * 72, 2 + ph * 4);
    }
};
/** 猫店长：围裙猫店长——立起招财猫爪、铃铛项圈、尾巴尖端闪光 */
export const catSpirit = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const fur = 0xe8a050, furD = 0xc07830, cream = 0xffd8a8, apron = 0x8fb8d0;
    groundShadow(g, pose, 50);
    const waddle = Math.sin(now / 320) * 1.4;
    // 大尾巴（高高翘起甩动的橘尾）
    g.lineStyle(6, fur, 1);
    g.beginPath();
    g.moveTo(x - f * 10, topY + 62);
    g.lineTo(x - f * 20, topY + 52 + Math.sin(now / 280) * 3);
    g.lineTo(x - f * 22, topY + 40 + Math.sin(now / 280 + 1) * 4);
    g.strokePath();
    g.fillStyle(0xffb0c8, 0.8 + 0.2 * Math.sin(now / 250)); // 尾尖闪光
    g.fillCircle(x - f * 22, topY + 40 + Math.sin(now / 280 + 1) * 4, 2.6);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(x - f * 22, topY + 41, 1);
    // 双腿（猫后腿坐姿）
    for (const s of [-1, 1]) {
        g.fillStyle(furD, 1);
        g.fillRoundedRect(x + s * 8 - 4.4, topY + 60, 9, 18, 4);
        g.fillStyle(cream, 0.9); // 爪尖白
        g.fillEllipse(x + s * 8, feetY - 3, 7, 4.4);
    }
    // 躯干（胖猫身 + 蓝围裙）
    g.fillStyle(fur, 1);
    g.fillRoundedRect(x - 12, topY + 28 + waddle, 24, 34, 8);
    g.fillStyle(cream, 0.85); // 肚皮
    g.fillEllipse(x, topY + 48 + waddle, 14, 20);
    g.fillStyle(apron, 0.95); // 店长小围裙
    g.fillRoundedRect(x - 9, topY + 42 + waddle, 18, 16, 3);
    g.fillStyle(0x6a94b0, 0.8); // 围裙口袋
    g.fillRect(x - 5, topY + 50 + waddle, 10, 5);
    g.fillStyle(0xfff6d8, 0.9); // 围裙上小鱼图案
    g.fillEllipse(x + 1, topY + 46 + waddle, 5, 2.2);
    g.fillTriangle(x - 1.4, topY + 46 + waddle, x - 3.4, topY + 45.4 + waddle, x - 3.4, topY + 47 + waddle);
    // 双臂（一只招财猫爪上下摆）
    g.fillStyle(fur, 1);
    g.save();
    g.translateCanvas(x - f * 11, topY + 34 + waddle);
    g.rotateCanvas(-f * (0.8 + Math.sin(now / 260) * 0.3)); // 招财爪摆动
    g.fillRoundedRect(-3.4, -14, 6.8, 16, 3);
    g.fillStyle(cream, 0.95); // 爪垫
    g.fillCircle(0, -14, 3.4);
    g.restore();
    g.lineStyle(5, fur, 1);
    g.lineBetween(x + f * 11, topY + 34 + waddle, x + f * 17, topY + 46 + waddle);
    g.fillStyle(cream, 0.95);
    g.fillCircle(x + f * 18, topY + 48 + waddle, 2.6);
    // 头（圆猫头 + 条纹 + 眯眼 + 胡须）
    const hy = topY + 12 + waddle;
    g.fillStyle(fur, 1);
    g.fillCircle(x, hy, 12);
    g.fillStyle(furD, 0.8); // 额头橘纹（三道虎纹）
    for (let k = -1; k <= 1; k++)
        g.fillRect(x + k * 3 - 0.8, hy - 11, 1.6, 5);
    for (const s of [-1, 1]) { // 三角耳（内耳粉）
        g.fillStyle(fur, 1);
        g.fillTriangle(x + s * 5, hy - 9, x + s * 11, hy - 5, x + s * 4.4, hy - 12);
        g.fillStyle(0xffb0c8, 0.9);
        g.fillTriangle(x + s * 5.4, hy - 8.4, x + s * 9.4, hy - 5.4, x + s * 5, hy - 10);
        const twitch = Math.sin(now / 700 + s) * 0.06;
        void twitch;
    }
    // 铃铛项圈（红圈金铃）
    g.lineStyle(2.4, 0xe8404a, 1);
    g.lineBetween(x - 9, hy + 8, x + 9, hy + 8);
    g.fillStyle(0xffd45c, 1);
    g.fillCircle(x, hy + 9.4, 2.4);
    g.fillStyle(0x8a6a2a, 0.9);
    g.lineBetween(x - 1.8, hy + 9.4, x + 1.8, hy + 9.4);
    // 白吻 + 眯眼 + 胡须
    g.fillStyle(cream, 0.9);
    g.fillEllipse(x + f * 2, hy + 4, 12, 8);
    g.lineStyle(1.6, 0x1a1410, 0.95);
    g.beginPath();
    g.arc(x + f * 4, hy - 1, 2.6, Math.PI * 1.15, Math.PI * 1.85);
    g.strokePath();
    g.beginPath();
    g.arc(x + f * 9, hy - 1, 2.6, Math.PI * 1.15, Math.PI * 1.85);
    g.strokePath();
    g.fillStyle(0x1a1410, 1);
    g.fillTriangle(x + f * 7, hy + 2, x + f * 8.4, hy + 2, x + f * 7.7, hy + 3.4);
    g.lineStyle(0.9, 0xffffff, 0.8);
    for (const s of [-1, 1]) {
        g.lineBetween(x + f * 5, hy + 4, x + f * 12, hy + 3 + s * 2.4);
        g.lineBetween(x + f * 5, hy + 5.4, x + f * 12, hy + 5.4 + s * 2.4);
    }
    // 环身猫爪印与小鱼
    for (let k = 0; k < 4; k++) {
        const ph = (now / 1200 + k / 4) % 1;
        g.fillStyle(k % 2 ? 0xffb0c8 : 0xffd8a8, 0.6 * (1 - ph));
        g.fillEllipse(x + Math.sin(k * 2.6) * 20, topY + 62 - ph * 66, 3, 2);
        for (let s = 0; s < 3; s++)
            g.fillCircle(x + Math.sin(k * 2.6) * 20 - 1.6 + s * 1.6, topY + 63.4 - ph * 66, 0.8);
    }
};
