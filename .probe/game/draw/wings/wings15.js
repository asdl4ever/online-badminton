import { wpoly, TAU } from './shared.js';
/**
 * 批八主题背挂物件（敦煌飞天 / 羽蛇神殿 / 圣辉天界）。
 * 全部 `single: true`：只画一次、不镜像、不随扇动旋转，动效在 painter 体内。
 */
export const WINGS_15 = {
    // ---- 敦煌飞天 ----
    dunBackA: { c: 0xffb070, a: 0xff9adf, single: true, draw: (g, now, _flap, c, a) => {
            // 霓裳长绸：身后飘卷的两条长绸——主绸 + 副绸 + 绸上花纹 + 流光
            for (let k = 0; k < 2; k++) {
                const col = k ? a : c;
                const amp = 7 - k * 2;
                g.fillStyle(col, k ? 0.4 : 0.75);
                g.beginPath();
                g.moveTo(-4, 6 + k * 4);
                for (let s = 1; s <= 10; s++) {
                    const u = s / 10;
                    g.lineTo(-4 + u * (70 - k * 14), 6 + k * 4 - u * (36 - k * 10) - Math.sin(u * 5.4 + now / 320 + k * 1.4) * amp);
                }
                for (let s = 10; s >= 0; s--) {
                    const u = s / 10;
                    g.lineTo(-4 + u * (70 - k * 14), 12 + k * 4 - u * (32 - k * 10) - Math.sin(u * 5.4 + now / 320 + k * 1.4 + 0.9) * amp);
                }
                g.closePath();
                g.fillPath();
                g.lineStyle(1, 0xfff0d8, 0.5); // 绸上流光
                g.beginPath();
                g.moveTo(-2, 9 + k * 4);
                for (let s = 1; s <= 10; s++) {
                    const u = s / 10;
                    g.lineTo(-2 + u * (66 - k * 14), 9 + k * 4 - u * (34 - k * 10) - Math.sin(u * 5.4 + now / 320 + k * 1.4 + 0.4) * amp);
                }
                g.strokePath();
            }
        } },
    dunBackB: { c: 0xc08a3a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
            // 箜篌：背后斜抱的竖箜篌——弯木架 + 五弦 + 弦音涟漪 + 金饰
            const bob = Math.sin(now / 800) * 2;
            g.save();
            g.translateCanvas(-10, -8 + bob);
            g.rotateCanvas(-0.14);
            g.fillStyle(c, 1); // 弯木架（L 形弯）
            g.fillRoundedRect(-5, -26, 6, 48, 3);
            g.save();
            g.translateCanvas(-2, -24);
            g.rotateCanvas(0.6);
            g.fillRoundedRect(-2.6, 0, 5.2, 20, 2.4);
            g.restore();
            g.lineStyle(0.9, 0xfff0d8, 0.85); // 五弦
            for (let k = 0; k < 5; k++)
                g.lineBetween(-3, -22 + k * 2.2, 16, -8 + k * 2.6);
            g.fillStyle(a, 0.9); // 弦轴金饰
            for (let k = 0; k < 5; k++)
                g.fillCircle(-4, -22 + k * 2.2, 1);
            // 弦音涟漪（周期扩散）
            for (let k = 0; k < 2; k++) {
                const ph = (now / 1500 + k / 2) % 1;
                g.lineStyle(1, a, 0.4 * (1 - ph));
                g.strokeCircle(8, -4, 10 + ph * 18);
            }
            g.restore();
        } },
    dunBackC: { c: 0xc07830, a: 0xff9adf, single: true, draw: (g, now, _flap, c, a) => {
            // 散花篮：臂弯里的花篮——藤篮 + 满篮花 + 撒落的花瓣雨
            const bob = Math.sin(now / 700) * 2;
            g.save();
            g.translateCanvas(-12, -2 + bob);
            g.rotateCanvas(-0.1);
            g.lineStyle(2.2, 0x8a5a2a, 1); // 篮柄拱
            g.beginPath();
            g.arc(0, -4, 9, Math.PI, 0);
            g.strokePath();
            g.fillStyle(c, 1); // 篮身（半球）
            g.beginPath();
            g.arc(0, 2, 11, 0, Math.PI);
            g.closePath();
            g.fillPath();
            g.fillStyle(0xa06028, 0.7);
            g.beginPath();
            g.arc(0, 4, 8, 0, Math.PI * 0.9);
            g.closePath();
            g.fillPath();
            g.lineStyle(0.9, 0x6a4018, 0.8); // 篮纹
            for (let k = 0; k < 3; k++)
                g.lineBetween(-9 + k * 3, 3 + k * 1.6, 9 - k * 3, 3 + k * 1.6);
            for (let k = 0; k < 5; k++) { // 满篮的花
                const ang = -0.2 - k * 0.35;
                g.fillStyle(k % 2 ? a : 0xfff0d8, 0.95);
                g.fillCircle(Math.cos(ang) * 9, -5 + Math.sin(ang) * 4, 2.4);
                g.fillStyle(0xffd45c, 0.9);
                g.fillCircle(Math.cos(ang) * 9, -5 + Math.sin(ang) * 4, 0.9);
            }
            g.restore();
            for (let k = 0; k < 5; k++) { // 撒落花瓣（旋转飘落）
                const ph = (now / 1500 + k / 5) % 1;
                g.save();
                g.translateCanvas(-12 + Math.sin(ph * 4 + k) * 10 + (k - 2) * 4, 6 + ph * 40);
                g.rotateCanvas(ph * 6 + k);
                g.fillStyle(k % 2 ? a : 0xffb0c8, 0.75 * Math.sin(ph * Math.PI));
                g.fillEllipse(0, 0, 3.4, 1.8);
                g.restore();
            }
        } },
    dunBackD: { c: 0xd9b45c, a: 0xff9adf, single: true, draw: (g, now, _flap, c, a) => {
            // 宝幢风铃：背后的宝幢——幢杆 + 三层幢盖 + 垂铃摇曳 + 幡带
            const sway = Math.sin(now / 600) * 2;
            g.save();
            g.translateCanvas(-10, 6);
            g.lineStyle(2.4, c, 1); // 幢杆
            g.lineBetween(0, 16, 0, -58);
            for (let k = 0; k < 3; k++) { // 三层幢盖（上小下大）
                const w = 12 + k * 7, y = -52 + k * 13;
                g.fillStyle(k % 2 ? c : 0xb8943a, 0.95);
                wpoly(g, [[-w, y], [w, y], [w - 2, y + 5], [-w + 2, y + 5]], k % 2 ? c : 0xb8943a, 0.95);
                g.fillStyle(0xfff0d8, 0.6);
                g.fillRect(-w + 2, y + 1, w * 2 - 4, 1.4);
            }
            for (let k = 0; k < 3; k++) { // 垂铃（摇曳 + 摆铃舌）
                const bx = -14 + k * 14 + sway * (0.4 + k * 0.2);
                const by = -20 + Math.abs(k - 1) * 3;
                g.fillStyle(a, 0.95);
                g.fillEllipse(bx, by, 5, 6);
                g.fillStyle(c, 0.9);
                g.fillCircle(bx, by + 4, 1.2);
                g.lineStyle(0.8, c, 0.8);
                g.lineBetween(bx, by - 3, bx, -20);
            }
            // 幡带（两条垂幡）
            for (const s of [-1, 1]) {
                g.fillStyle(s > 0 ? 0xffb0c8 : a, 0.8);
                wpoly(g, [
                    [s * 8, -18], [s * 12 + sway, 8], [s * 9 + sway, 20], [s * 5, 0],
                ], s > 0 ? 0xffb0c8 : a, 0.8);
            }
            g.restore();
        } },
    // ---- 羽蛇神殿 ----
    aztBackA: { c: 0x3ad49a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, _a) => {
            // 羽蛇杖：手持的羽蛇权杖——杖身 + 顶端羽蛇盘绕 + 羽毛扇 + 蛇眼宝石
            g.save();
            g.translateCanvas(-6, 0);
            g.rotateCanvas(-0.16 + Math.sin(now / 800) * 0.02);
            g.fillStyle(0x6b4a2f, 1); // 杖身
            g.fillRect(-2.6, -18, 5.2, 52);
            g.fillStyle(0x8a6a3a, 0.6);
            g.fillRect(-2.6, -18, 2, 52);
            // 顶端盘绕的羽蛇（S 盘 + 蛇头）
            const rot = Math.sin(now / 500) * 0.15;
            g.save();
            g.translateCanvas(0, -26);
            g.rotateCanvas(rot);
            g.lineStyle(4.4, c, 1);
            g.beginPath();
            g.moveTo(0, 6);
            g.lineTo(-7, 0);
            g.lineTo(-4, -6);
            g.lineTo(3, -7);
            g.lineTo(7, -2);
            g.strokePath();
            g.fillStyle(c, 1); // 蛇头
            g.fillEllipse(8, -3, 8, 6);
            g.fillStyle(0xffd45c, 1); // 蛇眼宝石
            g.fillCircle(10, -4.4, 1.4);
            g.fillStyle(0xff4a3a, 0.9);
            g.fillCircle(10, -4.4, 0.6);
            // 蛇冠羽毛（五根绿羽扇开）
            for (let k = 0; k < 5; k++) {
                const ang = -0.9 + k * 0.4 + Math.sin(now / 350 + k) * 0.06;
                g.fillStyle(k % 2 ? c : 0x2a9a6e, 0.95);
                g.fillEllipse(8 + Math.cos(ang) * 8, -3 + Math.sin(ang) * 8, 6, 2.6);
            }
            g.restore();
            g.restore();
        } },
    aztBackB: { c: 0xffd45c, a: 0x3ad49a, single: true, draw: (g, now, _flap, c, a) => {
            // 太阳历石：背后悬浮的阿兹特克历石——八芒日轮 + 内环刻纹 + 中心神面
            const cy = -16 + Math.sin(now / 850) * 2;
            const rot = now / 2400;
            for (let k = 0; k < 8; k++) { // 外圈八芒（方舌日芒）
                const ang = rot + (k / 8) * TAU;
                g.save();
                g.translateCanvas(Math.cos(ang) * 30, cy + Math.sin(ang) * 30);
                g.rotateCanvas(ang);
                g.fillStyle(k % 2 ? c : 0xe8a83a, 0.92);
                g.fillRect(-2.4, -3.4, 12, 6.8);
                g.restore();
            }
            g.fillStyle(0xc08838, 0.95); // 石盘
            g.fillCircle(0, cy, 26);
            g.fillStyle(0xd8a050, 0.7);
            g.fillCircle(0, cy, 21);
            g.lineStyle(1.4, a, 0.7); // 内环刻纹（点环）
            g.strokeCircle(0, cy, 16);
            for (let k = 0; k < 16; k++) {
                const ang = rot * 1.4 + (k / 16) * TAU;
                g.fillStyle(a, 0.7);
                g.fillRect(Math.cos(ang) * 16 - 0.7, cy + Math.sin(ang) * 16 - 0.7, 1.4, 1.4);
            }
            g.fillStyle(0x2a5a44, 0.95); // 中心神面（方脸 + 大眼）
            g.fillRoundedRect(-8, cy - 8, 16, 16, 3);
            g.fillStyle(0xfff0d8, 0.9);
            g.fillEllipse(-3.4, cy - 2.4, 4.4, 3);
            g.fillEllipse(3.4, cy - 2.4, 4.4, 3);
            g.fillStyle(0x1a2a1e, 1);
            g.fillCircle(-3.4, cy - 2.4, 1.2);
            g.fillCircle(3.4, cy - 2.4, 1.2);
            g.fillStyle(0xfff0d8, 0.7); // 齿排
            g.fillRect(-4, cy + 4, 8, 2);
            for (let k = 0; k < 3; k++)
                g.fillRect(-4 + k * 3.2, cy + 4, 1, 2.6);
        } },
    aztBackC: { c: 0x4ac8a0, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
            // 翡翠面具：背后悬浮的翡翠死亡面具——马赛克玉面 + 眼窝贝光 + 龅牙
            const bob = Math.sin(now / 800) * 2.2;
            g.save();
            g.translateCanvas(-12, -12 + bob);
            g.rotateCanvas(Math.sin(now / 900) * 0.06);
            g.fillStyle(c, 0.95); // 玉面
            g.fillRoundedRect(-10, -13, 20, 27, 7);
            g.fillStyle(0x2a9a78, 0.7); // 马赛克拼块
            for (let r = 0; r < 4; r++)
                for (let k = 0; k < 3; k++) {
                    g.fillRect(-8.4 + k * 6, -11 + r * 6, 5, 5);
                }
            g.fillStyle(0x0e2418, 0.9); // 眼窝（深洞）
            g.fillEllipse(-4.4, -4, 4.4, 3.4);
            g.fillEllipse(4.4, -4, 4.4, 3.4);
            g.fillStyle(0xfff0d8, 0.85 + 0.15 * Math.sin(now / 300)); // 眼窝贝光
            g.fillCircle(-4.4, -4, 1.2);
            g.fillCircle(4.4, -4, 1.2);
            g.fillStyle(0x0e2418, 0.9); // 鼻孔
            g.fillEllipse(-1.4, 3, 1.4, 2);
            g.fillEllipse(1.4, 3, 1.4, 2);
            g.fillStyle(0xfff0d8, 1); // 龅牙（两排方牙）
            g.fillRect(-5, 7, 3.4, 5);
            g.fillRect(1.6, 7, 3.4, 5);
            g.fillStyle(0xc0b090, 0.6);
            g.fillRect(-5, 7, 3.4, 1.4);
            g.fillRect(1.6, 7, 3.4, 1.4);
            g.lineStyle(1.4, a, 0.7); // 额上金饰
            g.fillCircle(0, -11, 2);
            g.restore();
        } },
    aztBackD: { c: 0xff7a3a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
            // 圣火盆：背后悬浮的献祭火盆——石盆 + 三层火舌 + 升腾火星 + 烟
            const bob = Math.sin(now / 620) * 1.8;
            g.save();
            g.translateCanvas(-8, 6 + bob);
            g.fillStyle(0x8a7a5a, 0.95); // 石盆
            g.fillEllipse(0, 12, 22, 10);
            g.fillStyle(0x6a5a40, 0.9);
            g.fillEllipse(0, 9.4, 17, 6);
            g.fillStyle(0x8a7a5a, 0.9); // 盆三足
            g.fillTriangle(-8, 14, -4, 14, -6, 20);
            g.fillTriangle(8, 14, 4, 14, 6, 20);
            const fire = 0.6 + 0.4 * Math.sin(now / 140);
            for (let k = 0; k < 3; k++) { // 三层火舌（外橙内黄）
                const fh = 16 - k * 5 + Math.sin(now / 150 + k * 2) * 3;
                g.fillStyle(k === 0 ? c : k === 1 ? 0xffb84a : 0xffe89a, (0.85 - k * 0.15) * fire);
                wpoly(g, [[-7 + k * 2, 9], [0, 9 - fh], [7 - k * 2, 9]], k === 0 ? c : k === 1 ? 0xffb84a : 0xffe89a, (0.85 - k * 0.15) * fire);
            }
            g.restore();
            for (let k = 0; k < 5; k++) { // 升腾火星
                const ph = (now / 650 + k / 5) % 1;
                const gl = 0.5 + 0.5 * Math.abs(Math.sin(now / 200 + k * 1.8));
                g.fillStyle(k % 2 ? a : 0xffb84a, gl * (1 - ph));
                g.fillCircle(-8 + Math.sin(ph * 5 + k) * 8, 4 - ph * 44, 1.6 * (1 - ph) + 0.5);
            }
            for (let k = 0; k < 2; k++) { // 袅袅青烟
                const ph = (now / 2000 + k / 2) % 1;
                g.fillStyle(0x8a7a6a, 0.2 * Math.sin(ph * Math.PI));
                g.fillCircle(-8 + Math.sin(ph * 5 + k) * 10, -8 - ph * 56, 3 + ph * 7);
            }
        } },
    // ---- 圣辉天界 ----
    angBackA: { c: 0xfff6d8, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
            // 六翼光轮：背后的炽天使六翼环——六片羽翼绕环排布 + 中央圣光
            const rot = Math.sin(now / 1100) * 0.12;
            g.save();
            g.translateCanvas(0, -16);
            g.rotateCanvas(rot);
            g.fillStyle(c, 0.12); // 中央圣光
            g.fillCircle(0, 0, 40);
            for (let k = 0; k < 6; k++) { // 六片羽翼（环上排布，轻扇）
                const ang = (k / 6) * TAU + Math.PI / 6;
                const flap = Math.sin(now / 300 + k) * 0.06;
                g.save();
                g.translateCanvas(Math.cos(ang) * 24, Math.sin(ang) * 24);
                g.rotateCanvas(ang + Math.PI / 2 + flap);
                g.fillStyle(k % 2 ? c : 0xf0e8d0, 0.85);
                wpoly(g, [[-4, 0], [0, -18], [4, 0]], k % 2 ? c : 0xf0e8d0, 0.85);
                g.fillStyle(0xffffff, 0.5);
                wpoly(g, [[-4, 0], [0, -18], [0, 0]], 0xffffff, 0.5);
                g.restore();
            }
            g.lineStyle(2.4, a, 0.7); // 光轮环
            g.strokeCircle(0, 0, 24);
            g.restore();
        } },
    angBackB: { c: 0xd9b45c, a: 0xfff6d8, single: true, draw: (g, now, _flap, c, a) => {
            // 祷言圣钟：身后悬着的圣钟——钟体 + 钟摆 + 钟声波 + 圣文带
            const swing = Math.sin(now / 900) * 0.12;
            g.save();
            g.translateCanvas(-10, -10);
            g.lineStyle(2, 0xb8943a, 1); // 悬架
            g.lineBetween(-12, -26, 12, -26);
            g.rotateCanvas(swing);
            g.fillStyle(0xb8943a, 0.7); // 钟绳
            g.lineBetween(0, -26, 0, -18);
            g.fillStyle(c, 0.95); // 钟体（钟形）
            g.fillPoints([
                { x: -11, y: 12 }, { x: -7, y: -14 }, { x: 7, y: -14 }, { x: 11, y: 12 },
            ], true);
            g.fillStyle(0xe8c88a, 0.6); // 钟面受光
            g.fillPoints([
                { x: -7, y: 10 }, { x: -4, y: -12 }, { x: 0, y: -12 }, { x: 0, y: 10 },
            ], true);
            g.fillStyle(0xfff0d8, 0.8); // 钟口沿
            g.fillRect(-12, 10, 24, 3);
            g.fillStyle(a, 0.9); // 圣文带（点上符点）
            g.fillRect(-8, -4, 16, 3);
            for (let k = 0; k < 4; k++)
                g.fillCircle(-6 + k * 4, -2.4, 0.7);
            g.fillStyle(0x8a6a2a, 1); // 钟摆
            g.fillCircle(0, 15, 2.6);
            g.restore();
            for (let k = 0; k < 2; k++) { // 钟声波（周期扩散的圣音环）
                const ph = (now / 1400 + k / 2) % 1;
                g.lineStyle(1.6, a, 0.45 * (1 - ph) * Math.min(1, ph * 5));
                g.strokeCircle(-10, 0, 16 + ph * 30);
            }
        } },
    angBackC: { c: 0xe8c88a, a: 0xfff6d8, single: true, draw: (g, now, _flap, c, a) => {
            // 传令号角：斜负的金号角——号身弯管 + 喇叭口 + 吹奏音波 + 流苏
            const bob = Math.sin(now / 750) * 2;
            g.save();
            g.translateCanvas(-8, -4 + bob);
            g.rotateCanvas(-0.5);
            g.lineStyle(4.4, c, 1); // 弯管（两段折弯）
            g.lineBetween(0, 16, 0, -4);
            g.lineBetween(0, -4, 12, -12);
            g.lineStyle(2.6, 0xb8943a, 0.8); // 管上环箍
            g.strokeCircle(0, 6, 2.4);
            g.strokeCircle(4, -1, 2.4);
            g.fillStyle(c, 1); // 喇叭口
            g.fillEllipse(15, -14, 12, 9);
            g.fillStyle(0x8a6a2a, 0.8); // 喇叭口内
            g.fillEllipse(15, -14, 7, 5);
            g.fillStyle(a, 0.95); // 吹口
            g.fillEllipse(-1, 17, 4, 3);
            g.restore();
            for (let k = 0; k < 3; k++) { // 吹奏音波（从喇叭口扩散）
                const ph = (now / 1200 + k / 3) % 1;
                g.lineStyle(1.4, a, 0.5 * (1 - ph));
                g.strokeCircle(6, -12 + bob, 6 + ph * 20);
            }
            g.fillStyle(0xffb0c8, 0.9); // 流苏
            const sway = Math.sin(now / 300) * 1.6;
            g.fillTriangle(-8 + sway, 12 + bob, -4 + sway, 12 + bob, -6 + sway * 1.4, 20 + bob);
        } },
    angBackD: { c: 0xfff6d8, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
            // 圣典：背后摊开的漂浮圣典——双页 + 金扣 + 圣文行 + 神圣光晕
            const bob = Math.sin(now / 800) * 2.4;
            g.save();
            g.translateCanvas(-10, -10 + bob);
            g.rotateCanvas(Math.sin(now / 900) * 0.05);
            g.fillStyle(0xc0b090, 0.4); // 光晕
            g.fillCircle(0, 0, 30);
            g.fillStyle(0x8a6a4a, 1); // 封皮（摊开双页）
            g.fillPoints([
                { x: 0, y: -14 }, { x: 20, y: -10 }, { x: 20, y: 14 }, { x: 0, y: 10 },
            ], true);
            g.fillStyle(0x6a4a34, 1);
            g.fillPoints([
                { x: 0, y: -14 }, { x: -20, y: -10 }, { x: -20, y: 14 }, { x: 0, y: 10 },
            ], true);
            g.fillStyle(c, 0.98); // 翻开的书页
            g.fillPoints([
                { x: 0, y: -11 }, { x: 17, y: -7.4 }, { x: 17, y: 11 }, { x: 0, y: 7 },
            ], true);
            g.fillPoints([
                { x: 0, y: -11 }, { x: -17, y: -7.4 }, { x: -17, y: 11 }, { x: 0, y: 7 },
            ], true);
            g.lineStyle(0.9, 0x8a7a5a, 0.8); // 圣文行（左右页各三行）
            for (let k = 0; k < 3; k++) {
                g.lineBetween(-14, -3 + k * 4.4, -3, -2.4 + k * 4.4);
                g.lineBetween(3, -3.6 + k * 4.4, 14, -3 + k * 4.4);
            }
            g.fillStyle(a, 0.95); // 中缝金扣
            g.fillCircle(0, 0, 2);
            g.restore();
            for (let k = 0; k < 4; k++) { // 圣光尘（上升）
                const ph = (now / 1300 + k / 4) % 1;
                g.fillStyle(a, 0.6 * (1 - ph));
                g.fillCircle(-10 + Math.sin(ph * 4 + k) * 12, 14 - ph * 36, 1.3 * (1 - ph) + 0.4);
            }
        } },
};
