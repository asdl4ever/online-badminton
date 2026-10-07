import { handle, pommel, TAU } from './shared.js';
/** 批十一主题球拍皮肤（软泥秘境 / 妖猫夜行 / 甲虫王朝） */
export const WEAPONS_14 = {
    // ── 软泥秘境 ──
    slimeRacketA: { c: 0x9aff7a, a: 0xd0ff9a, draw: (g, now, c, a) => {
            // 果冻棒·拍：半透明果冻拍面 + 内部游走小泡 + Q弹拍框
            handle(g, -13, -3, 6, 0x5a8a4a);
            pommel(g, -14, 2.4, a);
            const wob = 1 + Math.sin(now / 260) * 0.04;
            g.fillStyle(c, 0.5); // 果冻拍面
            g.fillEllipse(8, 0, 26 * wob, 38 * wob);
            g.lineStyle(2.6, a, 0.85); // Q弹拍框
            g.save();
            g.translateCanvas(8, 0);
            g.scaleCanvas(1, 19 / 13);
            g.beginPath();
            g.arc(0, 0, 13 * wob, 0, TAU);
            g.strokePath();
            g.restore();
            for (let k = 0; k < 4; k++) { // 拍面内小泡
                const ph = now / 600 + k * 1.7;
                g.fillStyle(0xffffff, 0.45);
                g.fillCircle(8 + Math.cos(ph) * 6, Math.sin(ph * 1.3) * 10, 1.8);
            }
            g.fillStyle(0xffffff, 0.5); // 高光
            g.fillEllipse(4, -8, 5, 9);
            g.lineStyle(1, a, 0.5); // 果冻拍线
            for (let k = -1; k <= 1; k++) {
                g.lineBetween(8 + k * 6, -15, 8 + k * 6, 15);
                g.lineBetween(1, k * 7, 15, k * 7);
            }
        } },
    slimeRacketB: { c: 0xd0ff9a, a: 0x5ac8ff, draw: (g, now, c, a) => {
            // 软泥鞭·拍：一节节软泥鞭身甩成拍面，鞭节蠕动
            handle(g, -13, -6, 5, 0x4a5a3a);
            g.lineStyle(5, c, 0.85); // 鞭柄节
            g.beginPath();
            g.moveTo(-6, 0);
            g.lineTo(0, 0);
            g.strokePath();
            for (let k = 0; k < 7; k++) { // 蠕动鞭节（沿弧线展开成拍）
                const ph = now / 350;
                const seg = k / 6;
                const ang = seg * 2.4 - 1.2 + Math.sin(ph + k) * 0.08;
                const r0 = 2 + seg * 16;
                const bx = Math.cos(ang) * r0, by = Math.sin(ang) * r0 * 1.5;
                const br = 3.4 - seg * 1.2;
                g.fillStyle(k % 2 ? c : 0x9aff7a, 0.8);
                g.fillCircle(bx, by, br);
                g.fillStyle(0xffffff, 0.35);
                g.fillCircle(bx - br * 0.3, by - br * 0.3, br * 0.3);
            }
            g.fillStyle(a, 0.8); // 鞭梢水珠
            const tip = Math.sin(now / 300) * 2;
            g.fillCircle(16 + tip, -4 + tip, 2.4);
            g.fillStyle(0xffffff, 0.5);
            g.fillCircle(15.4 + tip, -4.6 + tip, 0.9);
        } },
    // ── 妖猫夜行 ──
    nekRacketA: { c: 0xb08aff, a: 0xffd45c, draw: (g, now, c, a) => {
            // 猫爪·拍：拍面是一只软绒巨猫掌，四趾垫 + 肉球拍心
            handle(g, -13, -3, 6, 0x6a5a8a);
            pommel(g, -14, 2.4, a);
            g.fillStyle(c, 0.9); // 掌面
            g.fillEllipse(8, 2, 24, 32);
            for (let t = 0; t < 4; t++) { // 四趾
                const tx = 1 + t * 4.8;
                const ty = -12 + Math.abs(t - 1.5) * 1.6;
                g.fillStyle(c, 0.9);
                g.fillEllipse(tx, ty, 4.2, 5.4);
                g.fillStyle(0xd0b0ff, 0.6); // 趾垫
                g.fillEllipse(tx, ty, 2.2, 3);
            }
            g.fillStyle(0xd0b0ff, 0.7); // 大肉球
            g.fillEllipse(8, 3, 8, 7);
            const squeeze = Math.abs(Math.sin(now / 500)); // 肉球按压呼吸
            g.fillStyle(0xffffff, 0.3 + squeeze * 0.3);
            g.fillEllipse(8, 3, 5, 4);
            g.lineStyle(1.2, a, 0.5); // 绒毛描边
            g.save();
            g.translateCanvas(8, 2);
            g.scaleCanvas(1, 16 / 12);
            g.beginPath();
            g.arc(0, 0, 12, 0, TAU);
            g.strokePath();
            g.restore();
        } },
    nekRacketB: { c: 0x2a2440, a: 0xffd45c, draw: (g, now, c, a) => {
            // 铃刃·拍：暗色刀身拍面 + 沿刃铃铛 + 月牙刃光
            handle(g, -13, -2, 5.4, 0x1a1626);
            g.fillStyle(c, 0.95); // 刀身拍面（弯月形）
            g.fillPoints([
                { x: -2, y: -3 }, { x: 10, y: -17 }, { x: 20, y: -12 }, { x: 22, y: 4 }, { x: 12, y: 16 }, { x: 2, y: 6 },
            ], true);
            g.lineStyle(1.6, a, 0.6);
            g.beginPath();
            g.moveTo(-2, -3);
            g.lineTo(10, -17);
            g.lineTo(20, -12);
            g.lineTo(22, 4);
            g.lineTo(12, 16);
            g.lineTo(2, 6);
            g.closePath();
            g.strokePath();
            for (let k = 0; k < 3; k++) { // 沿刃小铃
                const sway = Math.sin(now / 320 + k * 2) * 1.4;
                const bx = 4 + k * 7, by = -12 + k * 11;
                g.fillStyle(a, 0.95);
                g.beginPath();
                g.arc(bx + sway, by, 2.6, Math.PI, TAU);
                g.closePath();
                g.fillPath();
                g.fillRect(bx + sway - 2.6, by, 5.2, 1.2);
                g.fillStyle(0x4a3a2a, 1);
                g.fillCircle(bx + sway, by + 2, 0.8);
            }
            const glint = Math.abs(Math.sin(now / 430)); // 月牙刃光扫过
            g.fillStyle(0xd0b0ff, glint * 0.6);
            g.fillPoints([
                { x: 8, y: -13 }, { x: 17, y: -9 }, { x: 16, y: -5 },
            ], true);
        } },
    // ── 甲虫王朝 ──
    btlRacketA: { c: 0x3a5a2a, a: 0xc8a832, draw: (g, now, c, a) => {
            // 独角·拍：拍框是一只前指的独角仙巨角，角上缚金环
            handle(g, -13, -2, 6, 0x2a1c0a);
            pommel(g, -14, 2.4, a);
            g.fillStyle(c, 0.95); // 角身（从柄伸出的弯角）
            g.fillPoints([
                { x: -2, y: -5 }, { x: 10, y: -12 }, { x: 24, y: -13 }, { x: 26, y: -4 }, { x: 14, y: 0 }, { x: 0, y: 5 },
            ], true);
            g.fillStyle(0x2a1c0a, 0.7); // 棱纹
            for (let k = 0; k < 3; k++)
                g.fillRect(k * 7, -9 + k * 1.6, 1.6, 9);
            g.fillStyle(a, 0.95); // 角尖
            g.fillPoints([{ x: 24, y: -13 }, { x: 30, y: -10 }, { x: 26, y: -4 }], true);
            for (let k = 0; k < 2; k++) { // 缚金环
                g.lineStyle(2, a, 0.9);
                g.beginPath();
                g.arc(6 + k * 11, -6 + k * 2, 4.4, -0.6, Math.PI + 0.6);
                g.strokePath();
            }
            const glint = Math.abs(Math.sin(now / 500)); // 角面扫光
            g.fillStyle(0xffffff, glint * 0.4);
            g.fillRect(9, -10, 2, 5);
            g.fillStyle(0xffd45c, 0.8); // 角根小眼
            g.fillCircle(1, -1, 1.4);
        } },
    btlRacketB: { c: 0xc8a832, a: 0x7dff5a, draw: (g, now, c, a) => {
            // 鞘翅刃·拍：拍面由两片金鞘翅拼成，开合呼吸 + 翅脉发光
            handle(g, -13, -3, 5.6, 0x2a1c0a);
            const open = (Math.sin(now / 700) * 0.5 + 0.5) * 5;
            for (const s of [-1, 1]) { // 双鞘翅拍面
                g.fillStyle(s < 0 ? c : 0x8a6a2a, 0.9);
                g.fillPoints([
                    { x: 0, y: 0 }, { x: s * 4, y: -18 - open * 0.4 }, { x: s * 13, y: -16 + open * 0.3 }, { x: s * 8, y: 8 },
                ], true);
                g.lineStyle(1, 0x5a4a1a, 0.7); // 翅脉
                g.beginPath();
                g.moveTo(0, 0);
                g.lineTo(s * 6, -12 - open * 0.3);
                g.moveTo(0, 0);
                g.lineTo(s * 9, -6 + open * 0.2);
                g.strokePath();
            }
            g.lineStyle(1.6, a, 0.6); // 合缝光
            g.lineBetween(0, -18 - open * 0.4, 0, 8);
            const glint = Math.abs(Math.sin(now / 420));
            g.fillStyle(0xffffff, glint * 0.45); // 翅面扫光
            g.fillEllipse(-5, -9 - open * 0.2, 4, 8);
            g.fillStyle(a, 0.7); // 翅根萤光点
            const tw = Math.abs(Math.sin(now / 260));
            g.fillCircle(0, -2, 1.6 + tw);
        } },
};
