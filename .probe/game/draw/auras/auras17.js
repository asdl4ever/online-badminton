import { TAU } from './shared.js';
/** 批十二光环（变形机甲 / 蛛网游侠 / 钢铁巨兽）——成景构图，画在角色身后 */
export const AURAS_17 = {
    // ── 变形机甲 ──
    tfAuraA: { c: 0x5ac8ff, a: 0x8a94a2, draw: (g, now, c, a) => {
            // 变形齿轮阵：三重巨型齿轮异速咬合旋转 + 齿缝光 + 铆钉与机械符文
            const gears = [
                [-46, -26, 34, 1, 2600], [30, -40, 26, -1, 1900], [6, 34, 30, 1, 3200],
            ];
            gears.forEach(([gx, gy, R, dir, sp], gi) => {
                const rot = dir * (now / sp);
                g.save();
                g.translateCanvas(gx, gy);
                g.rotateCanvas(rot);
                // 齿轮体
                g.fillStyle(gi === 1 ? 0x2f3f52 : 0x24344a, 0.95);
                g.fillCircle(0, 0, R * 0.78);
                g.lineStyle(2, c, 0.4 * (0.7 + 0.3 * Math.sin(now / 500 + gi)));
                g.beginPath();
                g.arc(0, 0, R * 0.78, 0, TAU);
                g.strokePath();
                // 齿
                for (let k = 0; k < 12; k++) {
                    const ang = (k / 12) * TAU;
                    g.fillStyle(gi === 1 ? 0x3a4a5f : 0x2a3a4e, 1);
                    g.fillPoints([
                        { x: Math.cos(ang - 0.11) * R * 0.76, y: Math.sin(ang - 0.11) * R * 0.76 },
                        { x: Math.cos(ang + 0.11) * R * 0.76, y: Math.sin(ang + 0.11) * R * 0.76 },
                        { x: Math.cos(ang + 0.08) * R, y: Math.sin(ang + 0.08) * R },
                        { x: Math.cos(ang - 0.08) * R, y: Math.sin(ang - 0.08) * R },
                    ], true);
                }
                // 辐条 + 轴心
                g.lineStyle(3, 0x1a2430, 0.9);
                for (let k = 0; k < 6; k++) {
                    const ang = (k / 6) * TAU;
                    g.lineBetween(Math.cos(ang) * 7, Math.sin(ang) * 7, Math.cos(ang) * R * 0.7, Math.sin(ang) * R * 0.7);
                }
                g.fillStyle(a, 0.9);
                g.fillCircle(0, 0, 6);
                g.fillStyle(0x1a2430, 1);
                g.fillCircle(0, 0, 3);
            });
            // 齿轮间的咬合电火花
            for (let k = 0; k < 3; k++) {
                const ph = (now / 260 + k / 3) % 1;
                const sx = -18 + k * 26, sy = -8 + Math.sin(k * 2.1) * 20;
                g.fillStyle(0xffffff, ph < 0.25 ? 0.9 : 0);
                g.fillCircle(sx, sy, 2);
            }
            // 机械符文（悬浮方块缓慢上浮）
            for (let k = 0; k < 5; k++) {
                const ph = ((now / 1800 + k / 5) % 1);
                const rx = -70 + k * 34, ry = 40 - ph * 90;
                g.fillStyle(c, 0.5 * (1 - ph * 0.6));
                g.fillRect(rx - 3, ry - 3, 6, 6);
                g.fillStyle(0xffffff, 0.35 * (1 - ph));
                g.fillRect(rx - 1, ry - 1, 2, 2);
            }
        } },
    tfAuraB: { c: 0xff8a2a, a: 0x5ac8ff, draw: (g, now, c, a) => {
            // 火种源共鸣：身后矩阵核心脉动 + 矩阵格 + 电弧触须 + 悬浮全息环
            const pulse = 0.6 + 0.4 * Math.sin(now / 340);
            // 背景全息圈
            for (let k = 0; k < 3; k++) {
                const r = 52 + k * 16;
                g.lineStyle(1.2, a, 0.18 - k * 0.04);
                g.save();
                g.translateCanvas(0, -26);
                g.scaleCanvas(1, 0.72);
                g.rotateCanvas(now / (1800 + k * 700));
                g.beginPath();
                g.arc(0, 0, r, 0, Math.PI * 1.6);
                g.strokePath();
                g.restore();
            }
            // 矩阵核心（外晕 + 内芯）
            for (let k = 3; k >= 0; k--) {
                g.fillStyle(c, 0.15 * pulse * (1 - k * 0.2));
                g.fillCircle(0, -26, 12 + k * 7);
            }
            g.save();
            g.translateCanvas(0, -26);
            g.rotateCanvas(now / 3000);
            g.fillStyle(0x1a2430, 0.95);
            g.fillPoints([{ x: 0, y: -14 }, { x: 13, y: 0 }, { x: 0, y: 14 }, { x: -13, y: 0 }], true);
            g.fillStyle(c, 0.85);
            g.fillPoints([{ x: 0, y: -8 }, { x: 7, y: 0 }, { x: 0, y: 8 }, { x: -7, y: 0 }], true);
            g.restore();
            g.fillStyle(0xffffff, pulse);
            g.fillCircle(0, -26, 3);
            // 电弧触须（六向分叉）
            for (let k = 0; k < 6; k++) {
                const a0 = (k / 6) * TAU + now / 900;
                let px = Math.cos(a0) * 14, py = -26 + Math.sin(a0) * 14;
                for (let s = 1; s <= 3; s++) {
                    const ang = a0 + Math.sin(now / 80 + s + k) * 0.5 + s * 0.24;
                    const rr = 14 + s * 12;
                    const nx = Math.cos(ang) * rr, ny = -26 + Math.sin(ang) * rr;
                    g.lineStyle(s > 2 ? 1.8 : 1.2, s > 2 ? 0xffffff : a, 0.55);
                    g.lineBetween(px, py, nx, ny);
                    px = nx;
                    py = ny;
                }
            }
            // 悬浮齿轮碎块
            for (let k = 0; k < 6; k++) {
                const ang = now / 1400 + (k / 6) * TAU;
                const rr = 62 + Math.sin(now / 600 + k) * 6;
                const bx = Math.cos(ang) * rr, by = -26 + Math.sin(ang) * rr * 0.6;
                g.fillStyle(0x8a94a2, 0.6);
                g.save();
                g.translateCanvas(bx, by);
                g.rotateCanvas(ang * 3);
                g.fillRect(-3, -2, 6, 4);
                g.fillRect(-1.4, -4, 2.8, 8);
                g.restore();
            }
        } },
    // ── 蛛网游侠 ──
    spdAuraA: { c: 0x8ae0ff, a: 0xff4a5a, draw: (g, now, c, a) => {
            // 蛛感预警：同心波纹环从身周外扩 + 放射警示刻度 + 背后巨大蛛网衬底
            g.lineStyle(1, 0xffffff, 0.12); // 蛛网衬底
            g.save();
            g.translateCanvas(0, -24);
            g.scaleCanvas(1, 0.86);
            for (let k = 0; k < 12; k++) {
                const ang = (k / 12) * TAU;
                g.lineBetween(0, 0, Math.cos(ang) * 74, Math.sin(ang) * 74);
            }
            for (let r = 16; r <= 72; r += 14) {
                g.beginPath();
                g.arc(0, 0, r, 0, TAU);
                g.strokePath();
            }
            g.restore();
            // 蛛感波纹（三圈错相外扩）
            for (let k = 0; k < 3; k++) {
                const ph = ((now / 900 + k / 3) % 1);
                const r = 18 + ph * 62;
                g.lineStyle(2 - ph, c, 0.5 * (1 - ph));
                g.save();
                g.translateCanvas(0, -24);
                g.scaleCanvas(1, 0.8);
                g.beginPath();
                g.arc(0, 0, r, 0, TAU);
                g.strokePath();
                g.restore();
            }
            // 放射警示刻度（跳动）
            for (let k = 0; k < 8; k++) {
                const ang = (k / 8) * TAU + now / 2000;
                const on = Math.sin(now / 160 + k) > 0.4;
                g.fillStyle(a, on ? 0.85 : 0.25);
                g.save();
                g.translateCanvas(0, -24);
                g.rotateCanvas(ang);
                g.fillRect(54, -1.4, 12, 2.8);
                g.restore();
            }
            // 发丝般的预警电流
            for (let k = 0; k < 5; k++) {
                const ang = now / 700 + k * 1.3;
                g.lineStyle(1, 0xffffff, 0.4);
                g.beginPath();
                g.moveTo(Math.cos(ang) * 30, -24 + Math.sin(ang) * 24);
                g.lineTo(Math.cos(ang) * 44, -24 + Math.sin(ang) * 34);
                g.strokePath();
            }
        } },
    spdAuraB: { c: 0xff4a5a, a: 0x8ae0ff, draw: (g, now, c, _a) => {
            // 蛛网雨：头顶挂下的多层蛛网，露珠滑落，网上粘着碎屑
            g.lineStyle(1.1, 0xf0f4f8, 0.4);
            for (let layer = 0; layer < 2; layer++) {
                const cy = -74 + layer * 26;
                const w = 62 + layer * 14;
                // 网框（三角吊挂）
                g.lineBetween(-w, cy + 16, 0, cy - 12);
                g.lineBetween(w, cy + 16, 0, cy - 12);
                // 放射丝
                for (let k = 0; k < 7; k++) {
                    const t = k / 6;
                    g.beginPath();
                    g.moveTo(0, cy - 12);
                    g.lineTo(-w + t * w * 2, cy + 16);
                    g.strokePath();
                }
                // 同心丝（带下垂感）
                for (let r = 1; r <= 3; r++) {
                    const rr = r / 3.4;
                    g.beginPath();
                    g.moveTo(-w * rr, cy + 16 - rr * 26);
                    g.lineTo(0, cy - 12 + rr * 4);
                    g.lineTo(w * rr, cy + 16 - rr * 26);
                    g.strokePath();
                }
            }
            // 露珠滑落 + 网结闪亮
            for (let k = 0; k < 5; k++) {
                const ph = ((now / 1400 + k / 5) % 1);
                const dx = -34 + k * 17;
                g.fillStyle(0xd8f8ff, 0.7 * (1 - ph * 0.5));
                g.fillCircle(dx, -60 + ph * 34, 1.6);
            }
            for (let k = 0; k < 6; k++) {
                const tw = Math.abs(Math.sin(now / 420 + k * 1.7));
                g.fillStyle(0xffffff, tw * 0.6);
                g.fillCircle(-40 + k * 16, -46 + Math.sin(k * 2.3) * 12, 1.2);
            }
            // 网上的碎屑
            for (let k = 0; k < 3; k++) {
                g.fillStyle(0x8a94a2, 0.7);
                g.fillRect(-24 + k * 22, -50 + Math.sin(k * 3) * 8, 5, 3);
            }
            // 脚下投影
            g.fillStyle(c, 0.14);
            g.fillEllipse(0, 44, 130, 14);
        } },
    // ── 钢铁巨兽 ──
    bstAuraA: { c: 0x8a94a2, a: 0xff6a2a, draw: (g, now, _c, a) => {
            // 钢铁风暴：碎钢屑与齿轮残骸绕身两股反向旋流，撞出火星
            for (let dir = -1; dir <= 1; dir += 2) {
                for (let k = 0; k < 9; k++) {
                    const ang = dir * (now / 700 + (k / 9) * TAU);
                    const rr = 34 + (k % 4) * 15;
                    const px = Math.cos(ang) * rr;
                    const py = -24 + Math.sin(ang) * rr * 0.62;
                    const depth = 0.35 + 0.4 * (Math.sin(ang) * 0.5 + 0.5);
                    g.save();
                    g.translateCanvas(px, py);
                    g.rotateCanvas(ang * dir * 3);
                    if (k % 3 === 0) { // 齿轮残片
                        g.fillStyle(0x6a6a72, depth);
                        g.fillRect(-3.4, -3.4, 6.8, 6.8);
                        g.fillStyle(0x3a3a42, depth);
                        g.fillRect(-1.4, -1.4, 2.8, 2.8);
                    }
                    else if (k % 3 === 1) { // 钢板碎片
                        g.fillStyle(0x8a8a92, depth);
                        g.fillPoints([{ x: -4, y: -2 }, { x: 4, y: -3 }, { x: 3, y: 3 }, { x: -3, y: 2 }], true);
                    }
                    else { // 螺栓
                        g.fillStyle(0x9a9490, depth);
                        g.fillCircle(0, 0, 2.4);
                        g.fillStyle(0x5a5a62, depth);
                        g.fillRect(-2.4, -0.7, 4.8, 1.4);
                    }
                    g.restore();
                }
            }
            // 碎片对撞火星
            for (let k = 0; k < 4; k++) {
                const ph = (now / 300 + k / 4) % 1;
                const sx = Math.sin(k * 2.4) * 40, sy = -24 + Math.cos(k * 1.7) * 26;
                g.fillStyle(0xffd45c, ph < 0.2 ? 0.95 : 0.2);
                g.fillCircle(sx, sy, 2.2);
                g.fillStyle(0xffffff, ph < 0.12 ? 0.9 : 0);
                g.fillCircle(sx, sy, 1);
            }
            g.fillStyle(a, 0.18); // 地面铁屑堆光
            g.fillEllipse(0, 44, 150, 13);
        } },
    bstAuraB: { c: 0xff6a2a, a: 0xffd45c, draw: (g, now, c, a) => {
            // 熔核过载：胸口方向的熔核爆闪 + 冲击环三连 + 地面熔岩裂缝 + 热浪扭曲
            const cyc = now % 1800;
            const burst = cyc < 300 ? cyc / 300 : 0;
            // 背景热浪
            for (let k = 0; k < 4; k++) {
                const ph = ((now / 1400 + k / 4) % 1);
                g.fillStyle(c, 0.1 * (1 - ph));
                g.fillEllipse(Math.sin(k * 2.2) * 40, 30 - ph * 60, 26 + k * 8, 40 + k * 10);
            }
            // 熔核（背后高处的炉口）
            for (let k = 3; k >= 0; k--) {
                g.fillStyle(a, (0.16 + 0.3 * burst) * (1 - k * 0.2));
                g.fillCircle(0, -54, 12 + k * 9);
            }
            g.fillStyle(0x3a3a42, 1);
            g.fillPoints([{ x: -14, y: -44 }, { x: 14, y: -44 }, { x: 9, y: -66 }, { x: -9, y: -66 }], true);
            g.fillStyle(a, 0.9);
            g.fillRoundedRect(-7, -60, 14, 12, 4);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(0, -54, 3 + burst * 3);
            // 冲击环三连
            for (let k = 0; k < 3; k++) {
                const r = 20 + burst * (60 + k * 18);
                g.lineStyle(2.4 - k * 0.5, k === 0 ? 0xffffff : c, Math.max(0, 0.7 - burst) * (1 - k * 0.2));
                g.save();
                g.translateCanvas(0, -30);
                g.scaleCanvas(1, 0.72);
                g.beginPath();
                g.arc(0, 0, r, 0, TAU);
                g.strokePath();
                g.restore();
            }
            // 地面熔岩裂缝
            for (let k = 0; k < 5; k++) {
                const fx = -64 + k * 32;
                g.lineStyle(2, a, 0.45 + 0.25 * Math.sin(now / 400 + k));
                g.beginPath();
                g.moveTo(fx, 42);
                g.lineTo(fx + 5, 34);
                g.lineTo(fx - 3, 26);
                g.strokePath();
                g.fillStyle(c, 0.3);
                g.fillEllipse(fx, 43, 14, 5);
            }
            // 上浮熔渣
            for (let k = 0; k < 6; k++) {
                const ph = ((now / 1200 + k / 6) % 1);
                g.fillStyle(a, 0.8 * (1 - ph));
                g.fillCircle(Math.sin(k * 2.1) * 44, 40 - ph * 90, 1.8 * (1 - ph) + 0.5);
            }
        } },
};
