import { TAU } from './shared.js';
/** 批十二头饰（变形机甲 / 蛛网游侠 / 钢铁巨兽） */
export const HATS_15 = {
    // ── 变形机甲 ──
    tfHatA: { c: 0x1a2436, a: 0x5ac8ff, draw: (g, now, x, hy, c, a) => {
            // 全息面甲：暗色基座 + 蓝屏 + 横扫扫描线 + HUD 刻度
            g.fillStyle(c, 0.98); // 基座
            g.beginPath();
            g.arc(x, hy + 2, 14, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillStyle(0x0a1018, 0.95); // 面甲腔
            g.fillEllipse(x, hy - 1, 24, 12);
            const scan = (now / 900) % 1; // 横扫扫描线
            const sx = x - 11 + scan * 22;
            g.fillStyle(a, 0.35);
            g.fillRect(sx - 3, hy - 6, 6, 11);
            g.fillStyle(0xffffff, 0.5);
            g.fillRect(sx - 0.8, hy - 6, 1.6, 11);
            for (let k = 0; k < 7; k++) { // HUD 刻度
                const on = k / 7 < scan;
                g.fillStyle(on ? a : 0x2a4a5a, on ? 0.9 : 0.5);
                g.fillRect(x - 12 + k * 4, hy - 6, 2, 3 + (k % 2) * 2);
            }
            // 侧甲片 + 铆钉
            for (const s of [-1, 1]) {
                g.fillStyle(0x2a3a4a, 1);
                g.fillPoints([{ x: x + s * 13, y: hy + 2 }, { x: x + s * 17, y: hy - 6 }, { x: x + s * 13, y: hy - 12 }, { x: x + s * 10, y: hy - 4 }], true);
                g.fillStyle(0x8a94a2, 0.9);
                g.fillCircle(x + s * 13.4, hy - 4, 1);
            }
            g.lineStyle(1.4, a, 0.7); // 甲缘光
            g.beginPath();
            g.arc(x, hy + 2, 14, Math.PI, TAU);
            g.strokePath();
            g.fillStyle(a, 0.3 + 0.2 * Math.sin(now / 300)); // 底部泛光
            g.fillEllipse(x, hy + 3, 22, 4);
        } },
    tfHatB: { c: 0x24344a, a: 0xff8a2a, draw: (g, now, x, hy, c, a) => {
            // 指挥头盔：双光镜 + 顶脊天线 + 面颊护板 + 通讯灯
            g.fillStyle(c, 1); // 盔体
            g.beginPath();
            g.arc(x, hy + 1, 14, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillStyle(0x34485f, 0.8); // 顶面高光
            g.fillEllipse(x - 4, hy - 7, 12, 7);
            g.fillStyle(0x16202c, 1); // 面罩带
            g.fillRect(x - 14, hy - 4, 28, 6);
            for (const s of [-1, 1]) { // 双光镜（呼吸）
                const gl = 0.7 + 0.3 * Math.sin(now / 320 + (s > 0 ? 0 : 1.2));
                g.fillStyle(a, 0.35 * gl);
                g.fillCircle(x + s * 6, hy - 1, 5.4);
                g.fillStyle(a, gl);
                g.fillEllipse(x + s * 6, hy - 1, 6, 4);
                g.fillStyle(0xffffff, 0.7 * gl);
                g.fillCircle(x + s * 6 - 1, hy - 2, 1.1);
            }
            g.fillStyle(0x8a94a2, 1); // 顶脊
            g.fillRect(x - 1.6, hy - 16, 3.2, 12);
            for (const s of [-1, 1]) { // 双天线（轻颤）
                const sw = Math.sin(now / 420 + (s > 0 ? 0 : 1)) * 2;
                g.lineStyle(1.8, 0x8a94a2, 1);
                g.beginPath();
                g.moveTo(x + s * 8, hy - 10);
                g.lineTo(x + s * 12 + sw, hy - 22);
                g.strokePath();
                g.fillStyle(a, 0.9);
                g.fillCircle(x + s * 12 + sw, hy - 23, 1.8);
            }
            for (const s of [-1, 1]) { // 面颊护板 + 铆钉
                g.fillStyle(0x2a3a4a, 1);
                g.fillPoints([{ x: x + s * 13, y: hy + 2 }, { x: x + s * 16, y: hy - 8 }, { x: x + s * 11, y: hy - 10 }, { x: x + s * 10, y: hy + 1 }], true);
                g.fillStyle(0x9aa4b2, 0.9);
                g.fillCircle(x + s * 12.4, hy - 4, 1);
            }
            const blink = Math.sin(now / 260) > 0; // 通讯灯
            g.fillStyle(blink ? 0x7dff5a : 0x2a4a2a, 0.95);
            g.fillCircle(x, hy - 13, 1.8);
        } },
    // ── 蛛网游侠 ──
    spdHatA: { c: 0xc8323c, a: 0xf0f4f8, draw: (g, now, x, hy, c, a) => {
            // 蛛丝面罩：红罩 + 白色大眼片 + 蛛网纹 + 缝线
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy + 2, 13, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillStyle(0xd84450, 0.7); // 顶面高光
            g.fillEllipse(x - 4, hy - 7, 11, 6);
            // 蛛网纹（面罩上的细网）
            g.lineStyle(0.9, 0x8a1a24, 0.7);
            for (let k = -2; k <= 2; k++) {
                g.beginPath();
                g.arc(x, hy + 1, 13, Math.PI + k * 0.12, Math.PI * 1.5 + k * 0.12);
                g.strokePath();
            }
            g.lineStyle(0.9, 0x8a1a24, 0.55);
            for (let k = 0; k < 5; k++) {
                g.lineBetween(x, hy + 1, x - 12 + k * 6, hy - 11);
            }
            // 白色大眼片（贴合面具的尖角形）
            for (const s of [-1, 1]) {
                g.fillStyle(a, 0.98);
                g.fillPoints([
                    { x: x + s * 2, y: hy - 5 }, { x: x + s * 12, y: hy - 8 }, { x: x + s * 11, y: hy + 2 }, { x: x + s * 3, y: hy + 1 },
                ], true);
                g.fillStyle(0x8aa0b8, 0.35); // 眼片内阴影
                g.fillPoints([{ x: x + s * 4, y: hy - 3 }, { x: x + s * 10, y: hy - 5 }, { x: x + s * 9, y: hy - 1 }, { x: x + s * 4, y: hy - 1 }], true);
                const gl = 0.2 + 0.2 * Math.sin(now / 400 + (s > 0 ? 0 : 1)); // 眼片微反光
                g.fillStyle(0xffffff, gl);
                g.fillPoints([{ x: x + s * 5, y: hy - 6 }, { x: x + s * 8, y: hy - 6.6 }, { x: x + s * 6, y: hy - 5 }], true);
            }
            g.lineStyle(1, 0x6a121a, 0.8); // 面具中缝
            g.lineBetween(x, hy - 10, x, hy - 3);
            g.fillStyle(0xf0f4f8, 0.18); // 面甲底光
            g.fillEllipse(x, hy + 3, 20, 4);
        } },
    spdHatB: { c: 0x2a3a5a, a: 0x8ae0ff, draw: (g, now, x, hy, c, a) => {
            // 感应目镜：金属框 + 青蓝镜片 + 蛛感波纹 + 侧扣
            g.fillStyle(c, 1);
            g.fillRoundedRect(x - 15, hy - 8, 30, 11, 4);
            g.fillStyle(0x3a4a6a, 0.8);
            g.fillRoundedRect(x - 13, hy - 7, 26, 3.4, 2);
            for (const s of [-1, 1]) { // 双镜片
                g.fillStyle(0x0e1a24, 1);
                g.fillEllipse(x + s * 6.4, hy - 2, 11, 7);
                g.fillStyle(a, 0.55); // 镜面渐变
                g.fillEllipse(x + s * 6.4, hy - 3, 9, 5);
                g.fillStyle(0xd8f8ff, 0.85);
                g.fillEllipse(x + s * 6.4 - 1, hy - 4.4, 3.4, 2);
            }
            g.fillStyle(0x1a2436, 1); // 鼻梁桥
            g.fillRect(x - 2, hy - 6, 4, 8);
            // 蛛感波纹（从镜片向外扩散）
            for (let k = 0; k < 3; k++) {
                const ph = ((now / 700 + k / 3) % 1);
                const r = 8 + ph * 13;
                g.lineStyle(1.4, a, 0.5 * (1 - ph));
                g.save();
                g.translateCanvas(x, hy - 2);
                g.scaleCanvas(1, 0.55);
                g.beginPath();
                g.arc(0, 0, r, 0, TAU);
                g.strokePath();
                g.restore();
            }
            for (const s of [-1, 1]) { // 侧扣 + 铆钉
                g.fillStyle(0x8a94a2, 1);
                g.fillRoundedRect(x + s * 15 - 2, hy - 6, 4, 8, 1.6);
                g.fillStyle(0x6a7482, 1);
                g.fillCircle(x + s * 15, hy - 2, 1);
            }
        } },
    // ── 钢铁巨兽 ──
    bstHatA: { c: 0x4a4a52, a: 0xff6a2a, draw: (g, now, x, hy, c, a) => {
            // 兽首头盔：钢兽颅骨 + 獠牙 + 熔光眼 + 铆钉
            g.fillStyle(c, 1); // 颅顶
            g.beginPath();
            g.arc(x, hy + 1, 14, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillStyle(0x5c5c64, 0.8);
            g.fillEllipse(x - 4, hy - 7, 12, 6);
            g.fillStyle(0x32323a, 1); // 前颌
            g.fillRoundedRect(x - 14, hy - 3, 28, 7, 3);
            g.fillStyle(0x232329, 1); // 口缝
            g.fillRect(x - 13, hy + 1, 26, 2.4);
            for (let k = -3; k <= 3; k++) { // 上下獠牙
                g.fillStyle(0xd8d4c8, 0.95);
                g.fillTriangle(x + k * 4 - 1.6, hy + 1, x + k * 4 + 1.6, hy + 1, x + k * 4, hy + 5.4);
                g.fillTriangle(x + k * 4 - 1.6, hy + 3.4, x + k * 4 + 1.6, hy + 3.4, x + k * 4, hy - 0.6);
            }
            // 熔光眼（脉动）
            for (const s of [-1, 1]) {
                const gl = 0.6 + 0.4 * Math.sin(now / 280 + (s > 0 ? 0 : 1.4));
                g.fillStyle(0x1a1a1e, 1);
                g.fillEllipse(x + s * 6, hy - 5, 7, 5);
                g.fillStyle(a, gl);
                g.fillEllipse(x + s * 6, hy - 5, 4.6, 3);
                g.fillStyle(0xfff0b0, gl * 0.9);
                g.fillCircle(x + s * 6, hy - 5, 1.2);
            }
            for (const s of [-1, 1]) { // 侧甲铆钉排
                for (let k = 0; k < 3; k++) {
                    g.fillStyle(0x9a9490, 0.9);
                    g.fillCircle(x + s * 13, hy - 9 + k * 4, 0.9);
                }
            }
            g.lineStyle(1.2, 0x8a8a92, 0.7); // 焊缝
            g.beginPath();
            g.arc(x, hy + 1, 14, Math.PI, TAU);
            g.strokePath();
        } },
    bstHatB: { c: 0x3a3a42, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 钢角盔：铁盔 + 双钢角 + 熔炉缝 + 蒸汽
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy + 1, 14, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillStyle(0x50505a, 0.75);
            g.fillEllipse(x - 3, hy - 7, 13, 7);
            g.fillStyle(0x232329, 1); // 熔炉观察缝
            g.fillRoundedRect(x - 9, hy - 4, 18, 5, 2);
            const heat = 0.6 + 0.4 * Math.sin(now / 260); // 缝内熔光
            g.fillStyle(a, heat);
            g.fillRoundedRect(x - 7, hy - 3, 14, 2.6, 1);
            for (const s of [-1, 1]) { // 双钢角（外弯，分层）
                g.fillStyle(0x9a9490, 1);
                g.fillPoints([
                    { x: x + s * 10, y: hy - 8 }, { x: x + s * 21, y: hy - 18 }, { x: x + s * 24, y: hy - 12 }, { x: x + s * 13, y: hy - 3 },
                ], true);
                g.fillStyle(0xc9c4bc, 0.7);
                g.fillPoints([{ x: x + s * 12, y: hy - 8 }, { x: x + s * 19, y: hy - 15 }, { x: x + s * 20, y: hy - 12 }, { x: x + s * 13, y: hy - 6 }], true);
                g.lineStyle(1, 0x6a6a72, 0.9); // 角环纹
                g.lineBetween(x + s * 14, hy - 10, x + s * 18, hy - 13);
                g.lineBetween(x + s * 16, hy - 8, x + s * 20, hy - 11);
            }
            for (let k = -2; k <= 2; k++) { // 顶铆钉
                g.fillStyle(0x9a9490, 0.9);
                g.fillCircle(x + k * 5, hy - 11 + Math.abs(k) * 1.4, 0.9);
            }
            // 两侧泄压蒸汽
            for (let k = 0; k < 2; k++) {
                const ph = ((now / 900 + k / 2) % 1);
                g.fillStyle(0xd8d8d0, 0.22 * (1 - ph));
                g.fillCircle(x + (k ? 12 : -12) + (k ? ph * 8 : -ph * 8), hy - 3 - ph * 8, 3 + ph * 3);
            }
        } },
};
