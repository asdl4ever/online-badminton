import { handle, pommel, TAU } from './shared.js';
/** 批十二球拍皮肤（变形机甲 / 蛛网游侠 / 钢铁巨兽） */
export const WEAPONS_15 = {
    // ── 变形机甲 ──
    tfRacketA: { c: 0x2a3a4a, a: 0xff8a2a, draw: (g, now, c, a) => {
            // 能量斧·拍：拍面化作单刃能量斧，刃口热光流动，柄上液压杆与铆钉
            handle(g, -14, -2, 7, 0x1a2430);
            pommel(g, -15, 2.6, 0x8a94a2);
            // 液压柄杆
            g.fillStyle(0x8a94a2, 1);
            g.fillRect(-9, -1.6, 8, 3.2);
            g.fillStyle(0x5a6472, 0.9);
            g.fillRect(-5.4, -2.2, 2, 4.4);
            // 斧头（机械块面）
            g.fillStyle(c, 0.98);
            g.fillPoints([
                { x: -1, y: -14 }, { x: 8, y: -19 }, { x: 21, y: -12 }, { x: 24, y: 2 }, { x: 15, y: 15 }, { x: 2, y: 13 },
            ], true);
            g.fillStyle(0x32465c, 0.9); // 斧面分块
            g.fillPoints([{ x: 2, y: -10 }, { x: 9, y: -14 }, { x: 12, y: 0 }, { x: 5, y: 8 }], true);
            g.fillStyle(0x8a94a2, 0.85); // 铆钉
            for (let k = 0; k < 3; k++)
                g.fillCircle(6 + k * 5, -8 + k * 6, 1);
            // 能量刃口（外弧，热光流动）
            const flow = (now / 700) % 1;
            g.lineStyle(4.4, 0x2a3a4a, 1);
            g.beginPath();
            g.moveTo(8, -19);
            g.lineTo(21, -12);
            g.lineTo(24, 2);
            g.lineTo(15, 15);
            g.strokePath();
            g.lineStyle(2.6, a, 0.85);
            g.beginPath();
            g.moveTo(8, -19);
            g.lineTo(21, -12);
            g.lineTo(24, 2);
            g.lineTo(15, 15);
            g.strokePath();
            // 刃口上的流动光点
            for (let k = 0; k < 3; k++) {
                const t = (flow + k / 3) % 1;
                const px = t < 0.34 ? 8 + (21 - 8) * (t / 0.34) : t < 0.67 ? 21 + (24 - 21) * ((t - 0.34) / 0.33) : 24 + (15 - 24) * ((t - 0.67) / 0.33);
                const py = t < 0.34 ? -19 + 7 * (t / 0.34) : t < 0.67 ? -12 + 14 * ((t - 0.34) / 0.33) : 2 + 13 * ((t - 0.67) / 0.33);
                g.fillStyle(0xffffff, 0.9);
                g.fillCircle(px, py, 1.6);
            }
            // 斧心能量核
            g.fillStyle(a, 0.4 + 0.2 * Math.sin(now / 240));
            g.fillCircle(13, 0, 4.4);
            g.fillStyle(0xffe89a, 0.9);
            g.fillCircle(13, 0, 2);
        } },
    tfRacketB: { c: 0x2f4152, a: 0x5ac8ff, draw: (g, now, c, a) => {
            // 聚变炮·拍：拍面化作炮口环——多层散热环 + 蓄能光球 + 泄压阀
            handle(g, -14, -2, 7, 0x1a2430);
            pommel(g, -15, 2.6, 0x8a94a2);
            // 炮身
            g.fillStyle(c, 1);
            g.fillPoints([
                { x: -1, y: -16 }, { x: 14, y: -20 }, { x: 24, y: -10 }, { x: 24, y: 10 }, { x: 14, y: 20 }, { x: -1, y: 16 },
            ], true);
            g.fillStyle(0x24344a, 0.95);
            g.fillEllipse(14, 0, 30, 30);
            // 散热环（三层，间隙透光）
            for (let k = 0; k < 3; k++) {
                const r = 8 + k * 4;
                g.lineStyle(2.6, k % 2 ? 0x8a94a2 : 0x3a4a5a, 0.9);
                g.save();
                g.translateCanvas(14, 0);
                g.scaleCanvas(1, 1);
                g.beginPath();
                g.arc(0, 0, r, 0, TAU);
                g.strokePath();
                g.restore();
            }
            // 蓄能光球（脉动 + 内芯）
            const charge = 0.6 + 0.4 * Math.sin(now / 300);
            for (let k = 2; k >= 0; k--) {
                g.fillStyle(a, 0.2 * charge * (1 - k * 0.3));
                g.fillCircle(14, 0, 6 + k * 4);
            }
            g.fillStyle(0xd8f8ff, 0.9);
            g.fillCircle(14, 0, 4);
            g.fillStyle(0xffffff, charge);
            g.fillCircle(14, 0, 1.8);
            // 泄压阀（两侧，周期放气）
            for (const s of [-1, 1]) {
                g.fillStyle(0x8a94a2, 1);
                g.fillRoundedRect(2, s * 11 - 2.4, 8, 4.8, 2);
                const ph = ((now / 900 + (s > 0 ? 0 : 0.5)) % 1);
                g.fillStyle(0xd8e8f0, 0.28 * (1 - ph));
                g.fillCircle(1 - ph * 6, s * 14, 2.4 + ph * 3);
            }
            // 炮口准星
            g.lineStyle(1.2, a, 0.6);
            g.lineBetween(24, -6, 24, 6);
        } },
    // ── 蛛网游侠 ──
    spdRacketA: { c: 0xc8323c, a: 0xf0f4f8, draw: (g, now, c, _a) => {
            // 蛛丝刃·拍：拍面为红蓝刃身，刃上缠着蛛丝，蛛丝随挥动飘
            handle(g, -14, -2, 6.4, 0x2a3a5a);
            pommel(g, -15, 2.4, 0x8a94a2);
            // 刃身（红蓝分区）
            g.fillStyle(c, 0.98);
            g.fillPoints([
                { x: -1, y: -13 }, { x: 10, y: -18 }, { x: 22, y: -8 }, { x: 22, y: 6 }, { x: 12, y: 17 }, { x: 0, y: 12 },
            ], true);
            g.fillStyle(0x2a3a5a, 0.95);
            g.fillPoints([{ x: 0, y: -2 }, { x: 10, y: -18 }, { x: 22, y: -8 }, { x: 22, y: 6 }, { x: 12, y: 17 }, { x: 0, y: 12 }], true);
            g.fillStyle(0x3a4a6a, 0.8); // 刃面高光
            g.fillPoints([{ x: 2, y: -8 }, { x: 10, y: -14 }, { x: 16, y: -6 }], true);
            // 蛛网格纹（刃面上）
            g.lineStyle(1, 0xf0f4f8, 0.6);
            for (let k = 0; k < 4; k++) {
                g.beginPath();
                g.moveTo(4, 8);
                g.lineTo(6 + k * 5, -14 + k * 6);
                g.strokePath();
            }
            for (let k = 1; k <= 3; k++) {
                g.beginPath();
                g.moveTo(2 + k * 3, 10 - k * 6);
                g.lineTo(10 + k * 3, 4 - k * 6);
                g.strokePath();
            }
            // 缠在刃上的蛛丝（飘动）
            for (const s of [-1, 1]) {
                const w = Math.sin(now / 400 + s) * 4;
                g.lineStyle(1.4, 0xffffff, 0.6);
                g.beginPath();
                g.moveTo(20, -4 + s * 6);
                g.lineTo(26 + w * 0.5, s * 4);
                g.lineTo(30 + w, s * 12);
                g.strokePath();
            }
            // 刃尖红星闪
            const tw = Math.abs(Math.sin(now / 300));
            g.fillStyle(0xff4a5a, tw * 0.9);
            g.fillCircle(21, -7, 2.2);
            g.fillStyle(0xffffff, tw * 0.7);
            g.fillCircle(21, -7, 1);
        } },
    spdRacketB: { c: 0x2a2440, a: 0x8ae0ff, draw: (g, now, c, a) => {
            // 蛛毒刺·拍：拍面为毒刺尾针——多节金属节 + 滴毒 + 毒气微光
            handle(g, -14, -2, 6, 0x1a2436);
            pommel(g, -15, 2.4, 0x8a94a2);
            // 多节刺身
            for (let k = 0; k < 4; k++) {
                const seg = k / 3;
                const r = 8 - seg * 4.4;
                g.fillStyle(k % 2 ? c : 0x3a3460, 0.98);
                g.fillEllipse(2 + k * 5.4, 0, r * 1.4, r * 2);
                g.fillStyle(a, 0.25);
                g.fillEllipse(1 + k * 5.4, -r * 0.5, r * 0.6, r * 0.8);
            }
            // 毒刺尖
            g.fillStyle(0x2a2440, 1);
            g.fillPoints([{ x: 20, y: -4 }, { x: 30, y: 0 }, { x: 20, y: 4 }], true);
            g.fillStyle(a, 0.8);
            g.fillPoints([{ x: 22, y: -2 }, { x: 28, y: 0 }, { x: 22, y: 2 }], true);
            // 刺尖毒液滴
            for (let k = 0; k < 2; k++) {
                const ph = ((now / 800 + k / 2) % 1);
                g.fillStyle(0x9cff3a, (1 - ph) * 0.9);
                g.fillEllipse(29 + k * 1.6, 4 + ph * 14, 2.4, 4);
            }
            // 毒气微光（沿刺散发）
            for (let k = 0; k < 4; k++) {
                const ph = ((now / 1000 + k / 4) % 1);
                g.fillStyle(0x9cff3a, 0.22 * (1 - ph));
                g.fillCircle(6 + k * 6, -6 - ph * 8, 3 + ph * 3);
            }
            // 节间的青色能量环
            for (let k = 0; k < 3; k++) {
                g.lineStyle(1.2, a, 0.6);
                g.save();
                g.translateCanvas(4.4 + k * 5.4, 0);
                g.scaleCanvas(0.5, 1);
                g.beginPath();
                g.arc(0, 0, 6 - k * 1.2, 0, TAU);
                g.strokePath();
                g.restore();
            }
        } },
    // ── 钢铁巨兽 ──
    bstRacketA: { c: 0x4a4a52, a: 0xff6a2a, draw: (g, now, c, a) => {
            // 钢牙·拍：拍框是一副钢制兽颚，颚齿咬合开合，喉部熔光
            handle(g, -14, -2, 7, 0x2a2a30);
            pommel(g, -15, 2.6, 0x8a8a92);
            const bite = (Math.sin(now / 420) * 0.5 + 0.5) * 4; // 咬合开合
            // 上颚
            g.save();
            g.translateCanvas(4, -6);
            g.rotateCanvas(-0.08 - bite * 0.06);
            g.fillStyle(c, 1);
            g.fillPoints([{ x: -6, y: 2 }, { x: 16, y: -4 }, { x: 24, y: 6 }, { x: 0, y: 10 }], true);
            g.fillStyle(0x5c5c64, 0.9);
            g.fillPoints([{ x: -3, y: 3 }, { x: 14, y: -1 }, { x: 18, y: 4 }, { x: 1, y: 7 }], true);
            for (let k = 0; k < 5; k++) { // 上排钢齿
                g.fillStyle(0xd8d4c8, 0.96);
                g.fillTriangle(k * 4.4, 8, k * 4.4 + 3.4, 8, k * 4.4 + 1.7, 14);
            }
            g.restore();
            // 下颚
            g.save();
            g.translateCanvas(4, 6);
            g.rotateCanvas(0.08 + bite * 0.06);
            g.fillStyle(0x3a3a42, 1);
            g.fillPoints([{ x: -6, y: -2 }, { x: 16, y: 4 }, { x: 24, y: -6 }, { x: 0, y: -10 }], true);
            for (let k = 0; k < 5; k++) { // 下排钢齿
                g.fillStyle(0xd8d4c8, 0.96);
                g.fillTriangle(k * 4.4, -8, k * 4.4 + 3.4, -8, k * 4.4 + 1.7, -14);
            }
            g.restore();
            // 喉部熔光（咬合时更亮）
            const heat = 0.5 + 0.4 * Math.sin(now / 300) + bite * 0.06;
            for (let k = 2; k >= 0; k--) {
                g.fillStyle(a, 0.18 * heat * (1 - k * 0.25));
                g.fillCircle(10, 0, 5 + k * 4);
            }
            g.fillStyle(0xffd45c, heat);
            g.fillCircle(10, 0, 3);
            // 颚关节铆钉
            for (const s of [-1, 1]) {
                g.fillStyle(0x9a9490, 0.95);
                g.fillCircle(4, s * 9, 1.6);
            }
            // 牙缝火星
            if (bite > 2.4) {
                for (let k = 0; k < 3; k++) {
                    g.fillStyle(0xffd45c, 0.9);
                    g.fillCircle(14 + k * 4, -2 + k * 2, 1.2);
                }
            }
        } },
    bstRacketB: { c: 0x3a3a42, a: 0xff6a2a, draw: (g, now, c, a) => {
            // 熔铁尾锤·拍：拍面为熔融铁锤锤头，滴着铁水，锤面裂开透光
            handle(g, -14, -2, 7, 0x232329);
            pommel(g, -15, 2.6, 0x8a8a92);
            // 锤身
            g.fillStyle(c, 1);
            g.fillPoints([
                { x: 0, y: -15 }, { x: 18, y: -13 }, { x: 22, y: 0 }, { x: 18, y: 13 }, { x: 0, y: 15 },
            ], true);
            g.fillStyle(0x50505a, 0.85); // 锤面高光
            g.fillEllipse(6, -4, 10, 16);
            // 锤面裂纹（透出熔光）
            const heat = 0.55 + 0.45 * Math.sin(now / 280);
            g.lineStyle(1.8, 0x14141a, 1);
            for (let k = 0; k < 3; k++) {
                g.beginPath();
                g.moveTo(4 + k * 5, -12);
                g.lineTo(7 + k * 5, -2);
                g.lineTo(4 + k * 5, 12);
                g.strokePath();
            }
            g.lineStyle(1.2, a, heat);
            for (let k = 0; k < 3; k++) {
                g.beginPath();
                g.moveTo(4 + k * 5, -12);
                g.lineTo(7 + k * 5, -2);
                g.lineTo(4 + k * 5, 12);
                g.strokePath();
            }
            // 锤心熔核
            for (let k = 2; k >= 0; k--) {
                g.fillStyle(a, 0.2 * heat * (1 - k * 0.3));
                g.fillCircle(11, 0, 4 + k * 4);
            }
            g.fillStyle(0xffd45c, heat);
            g.fillCircle(11, 0, 3.4);
            g.fillStyle(0xffffff, heat * 0.9);
            g.fillCircle(11, 0, 1.4);
            // 滴落的铁水（三条，不同相位）
            for (let k = 0; k < 3; k++) {
                const ph = ((now / 900 + k / 3) % 1);
                g.fillStyle(a, (1 - ph) * 0.9);
                g.fillEllipse(2 + k * 8, 16 + ph * 16, 2.6, 4.6);
                g.fillStyle(0xffffff, (1 - ph) * 0.5);
                g.fillCircle(2 + k * 8, 15 + ph * 16, 0.9);
            }
            // 锤身铆钉
            for (let k = 0; k < 3; k++) {
                g.fillStyle(0x9a9490, 0.9);
                g.fillCircle(19, -9 + k * 9, 1);
            }
        } },
};
