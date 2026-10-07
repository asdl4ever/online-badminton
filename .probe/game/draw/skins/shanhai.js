import { groundShadow } from './shared.js';
import { PLAYER_H } from '../../constants.js';
/**
 * 🗺️ 山海十怪（神话夸张版重绘）。
 * 设计原则：
 *  1. **多层肌体**——暗色描边层 + 主体 + 亮面 + 高光，压出厚度，不再是一堆平圆；
 *  2. **专属质感**——蛇鳞弧纹 / 虎纹条带 / 羽层飞羽 / 青铜云雷纹 / 熔岩裂纹；
 *  3. **会呼吸的夸张部件**——更大的角、更长的尾、多层焰鬃、可开合的巨口/竖瞳；
 *  4. **内发光与相位**——昼夜开眼、蓄能脉动、凶气漩涡、毒雾沼沼，全部由 now 驱动；
 *  5. **粒子收尾**——火星、毒滴、雪尘、风羽、血焰，让每只都在「活着」。
 * 坐标：x = 中线，feetY = 脚底，facing = 朝向；身高基准 PLAYER_H。
 */
// ─────────────────────────── 共享绘制语言 ───────────────────────────
/** 暗色轮廓：形体前先垫一圈墨色，压出立体边界 */
function back(g, x, y, r, a = 1) {
    g.fillStyle(0x120c1a, 0.9 * a);
    g.fillCircle(x + 1.8, y + 1.8, r);
}
/** 伪辉光：三层同心半透明圆，模拟外发光 */
function glow(g, x, y, r, c, a) {
    g.fillStyle(c, a * 0.2);
    g.fillCircle(x, y, r);
    g.fillStyle(c, a * 0.32);
    g.fillCircle(x, y, r * 0.62);
    g.fillStyle(c, a * 0.55);
    g.fillCircle(x, y, r * 0.32);
}
/** 蛇鳞纹理：三列弧鳞 × n 排 */
function scales(g, cx, cy, w, rows, c, a, step = 6) {
    g.lineStyle(1.1, c, a);
    for (let r = 0; r < rows; r++) {
        const y = cy - (rows * step) / 2 + r * step;
        for (let k = -1; k <= 1; k++) {
            g.beginPath();
            g.arc(cx + k * w * 0.5, y, w * 0.42, Math.PI * 1.15, Math.PI * 1.85);
            g.strokePath();
        }
    }
}
/** 焰舌：外焰 + 内焰 + 抖动 */
function flame(g, x, y, h, w, c1, c2, seed, now) {
    const fl = 1 + Math.sin(now / 90 + seed) * 0.16;
    g.fillStyle(c1, 0.92);
    g.fillTriangle(x - w, y, x + w, y, x + Math.sin(now / 120 + seed) * w * 0.7, y - h * fl);
    g.fillStyle(c2, 0.95);
    g.fillTriangle(x - w * 0.45, y, x + w * 0.45, y, x + Math.sin(now / 140 + seed) * w * 0.4, y - h * 0.55 * fl);
}
/** 上升火星 */
function embers(g, x, y, n, spread, rise, c, now, seed = 0) {
    for (let k = 0; k < n; k++) {
        const ph = (now / 620 + k / n + seed) % 1;
        g.fillStyle(c, 0.85 * (1 - ph));
        g.fillCircle(x + Math.sin(k * 2.4 + seed) * spread * (0.4 + ph), y - ph * rise, 1.6 * (1 - ph) + 0.4);
    }
}
/** 旋绕气环：椭圆伪 3D 环（用缩放圆代替 ellipse） */
function ring(g, x, y, rx, ry, w, c, a) {
    g.save();
    g.translateCanvas(x, y);
    g.scaleCanvas(1, ry / rx);
    g.lineStyle(w, c, a);
    g.beginPath();
    g.arc(0, 0, rx, 0, Math.PI * 2);
    g.strokePath();
    g.restore();
}
// ─────────────────────────── 1. 烛龙 ───────────────────────────
/** 烛龙：人面赤龙盘绕三匝，睁眼为昼（金光辐射）/ 闭眼为夜（星幕下沉），脊背赤焰鬃成排 */
export const zhuLong = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const red = 0xd4321f, deep = 0x6e0f14, scale = 0xff7a4a, gold = 0xffd45c;
    groundShadow(g, pose, 62);
    // 昼夜相位：睁眼 → 昼光；闭眼 → 夜幕
    const cyc = now % 4200;
    const open = cyc < 1900 ? Math.min(1, cyc / 320) : cyc < 3000 ? 1 - Math.min(1, (cyc - 1900) / 320) : 0;
    const nightA = 1 - open;
    // 身后日轮 / 月轮（交替显影）
    if (open > 0.05) {
        glow(g, x - f * 6, topY + 10, 62 + 16 * open, 0xffd45c, 0.5 * open);
        g.lineStyle(2.4, 0xfff0b0, 0.45 * open);
        g.strokeCircle(x - f * 6, topY + 10, 40 + 22 * open);
        for (let k = 0; k < 12; k++) { // 辐射日芒
            const a = (k / 12) * Math.PI * 2 + now / 2600;
            const r0 = 44 + 20 * open, r1 = r0 + 10 + 10 * open;
            g.lineStyle(2, 0xffe89a, 0.35 * open);
            g.lineBetween(x - f * 6 + Math.cos(a) * r0, topY + 10 + Math.sin(a) * r0, x - f * 6 + Math.cos(a) * r1, topY + 10 + Math.sin(a) * r1);
        }
    }
    if (nightA > 0.05) {
        g.fillStyle(0x0a0a22, 0.22 * nightA);
        g.fillCircle(x, topY + 16, 58);
        for (let k = 0; k < 9; k++) { // 夜幕星点
            const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 300 + k * 1.7));
            g.fillStyle(0xdfe8ff, tw * 0.6 * nightA);
            g.fillCircle(x - 50 + k * 13, topY - 6 + Math.sin(k * 3.1) * 16, 1.4);
        }
        glow(g, x - f * 6, topY + 10, 40, 0x8ab0ff, 0.35 * nightA);
    }
    // 蛇身：三匝盘绕（外匝暗红 → 中匝赤 → 上匝亮），每匝带鳞纹与背光
    const coil = [
        [x - f * 4, feetY - 16, 30],
        [x + f * 8, feetY - 40, 26],
        [x - f * 2, feetY - 62, 22],
    ];
    coil.forEach(([bx, by, rx], i) => {
        for (let k = 4; k >= -4; k--) {
            const px = bx + k * (rx / 4.6);
            const py = by + Math.sin(now / 700 + i * 1.7 + k * 0.4) * 3.4 - i * 2;
            const w = rx - Math.abs(k) * 2.2;
            back(g, px, py, w * 0.62);
            g.fillStyle(i === 0 ? deep : i === 1 ? red : 0xe8552a, 1);
            g.fillCircle(px, py, w * 0.6);
            g.fillStyle(scale, 0.3);
            g.fillCircle(px - w * 0.2, py - w * 0.22, w * 0.26);
            if (k % 2 === 0)
                scales(g, px, py, w * 0.44, 1, 0xffb08a, 0.35, 0);
        }
    });
    // 背脊赤焰鬃：一排五行，焰高随呼吸起伏
    for (let k = 0; k < 7; k++) {
        const by = feetY - 26 - k * 11;
        const bx = x + f * 12 + Math.sin(now / 500 + k * 0.6) * 2;
        flame(g, bx, by, 15 + 7 * Math.sin(now / 110 + k * 1.3), 6, 0xff6a2a, 0xffe89a, k, now);
    }
    embers(g, x + f * 12, feetY - 40, 6, 8, 84, 0xffc24a, now);
    // 鳞纹长尾（甩向身后）
    const tw = Math.sin(now / 420);
    g.lineStyle(7, red, 1);
    g.beginPath();
    g.moveTo(x - f * 26, feetY - 20);
    g.lineTo(x - f * 46, feetY - 32 + tw * 4);
    g.lineTo(x - f * 60, feetY - 22 + tw * 8);
    g.strokePath();
    g.lineStyle(3, 0xff7a4a, 0.8);
    g.beginPath();
    g.moveTo(x - f * 26, feetY - 22);
    g.lineTo(x - f * 46, feetY - 34 + tw * 4);
    g.lineTo(x - f * 60, feetY - 24 + tw * 8);
    g.strokePath();
    g.fillStyle(0xffe89a, 0.9); // 尾端焰
    g.fillCircle(x - f * 60, feetY - 22 + tw * 8, 3.4);
    // 颈部与臂
    g.lineStyle(9, deep, 1);
    g.lineBetween(x + f * 6, topY + 40, x + f * 14, topY + 26);
    g.lineStyle(5.5, red, 1);
    g.lineBetween(x + f * 6, topY + 40, x + f * 14, topY + 26);
    for (const s of [-1, 1]) { // 双臂撑地（龙爪）
        const sw = Math.sin(now / 600 + s) * 2;
        g.lineStyle(6, deep, 1);
        g.lineBetween(x + s * 12, topY + 44, x + s * (24 + sw), topY + 66);
        g.lineStyle(3.4, 0xe8552a, 1);
        g.lineBetween(x + s * 12, topY + 44, x + s * (24 + sw), topY + 66);
        g.fillStyle(0xffd45c, 1); // 金爪
        for (let c2 = -1; c2 <= 1; c2++) {
            g.fillTriangle(x + s * (24 + sw), topY + 66, x + s * (24 + sw) + c2 * 3, topY + 72, x + s * (24 + sw) + c2 * 4.4, topY + 66);
        }
    }
    // 人面：金冠 + 旒珠 + 赤须
    const hy = topY + 16;
    glow(g, x, hy, 30, gold, 0.45 * (0.4 + 0.6 * open));
    back(g, x, hy, 15);
    g.fillStyle(0xe8b48a, 1);
    g.fillCircle(x, hy, 14);
    g.fillStyle(0xffd8b0, 0.6); // 面高光
    g.fillEllipse(x - 4, hy - 4, 10, 12);
    g.fillStyle(deep, 1); // 冠
    g.fillRect(x - 15, hy - 19, 30, 7);
    g.fillTriangle(x - 15, hy - 15, x - 5, hy - 16, x - 16, hy - 34);
    g.fillTriangle(x + 15, hy - 15, x + 5, hy - 16, x + 16, hy - 34);
    g.fillStyle(gold, 1);
    g.fillRect(x - 16, hy - 21, 32, 3);
    for (let k = -2; k <= 2; k++) { // 冕旒珠（摆动）
        const bx = x + k * 6, sway = Math.sin(now / 380 + k) * 1.8;
        g.lineStyle(1, gold, 0.8);
        g.lineBetween(bx, hy - 18, bx + sway, hy - 8);
        g.fillStyle(0xffe89a, 0.95);
        g.fillCircle(bx + sway, hy - 6, 1.5);
    }
    // 眼：昼为金瞳，夜为竖缝
    const eyeH = 11 * (0.1 + 0.9 * open);
    for (const s of [-1, 1]) {
        g.fillStyle(0xfff6e0, 1);
        g.fillEllipse(x + s * 5.4, hy + 1, 9, eyeH);
    }
    if (open > 0.4) {
        for (const s of [-1, 1]) {
            g.fillStyle(0xffc24a, 1);
            g.fillCircle(x + s * 5.4, hy + 1, 3.4);
            g.fillStyle(0xffffff, 0.85 * open);
            g.fillCircle(x + s * 5.4 - 0.8, hy + 0.2, 1.2);
        }
    }
    else {
        for (const s of [-1, 1]) {
            g.fillStyle(deep, 1);
            g.fillEllipse(x + s * 5.4, hy + 1, 8, 2.6);
        }
    }
    // 赤须（飘动）
    for (const s of [-1, 1]) {
        const sw = Math.sin(now / 300 + s) * 3;
        g.lineStyle(1.8, deep, 0.95);
        g.beginPath();
        g.moveTo(x + s * 4, hy + 11);
        g.lineTo(x + s * (8 + sw * 0.4), hy + 20);
        g.lineTo(x + s * (12 + sw), hy + 28);
        g.strokePath();
    }
    // 吐息（赤焰从口角溢出）
    const breath = 0.5 + 0.5 * Math.sin(now / 520);
    flame(g, x + f * 13, hy + 11, 8 + breath * 6, 3, 0xff6a2a, 0xffe89a, 9, now);
};
// ─────────────────────────── 2. 相柳 ───────────────────────────
/** 相柳：九首呈扇形张开各自摆动，主首更大居中，吐毒落地成沼（毒雾沼沼） */
export const xiangLiu = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const body = 0x2f6a48, deep = 0x14301e, skin = 0xb8e8c0, venom = 0x9cff3a;
    groundShadow(g, pose, 64);
    // 身后毒沼（成沼 + 毒雾）
    g.fillStyle(0x1e3a2a, 0.5);
    g.fillEllipse(x, feetY - 2, 96, 18);
    g.fillStyle(venom, 0.16);
    g.fillEllipse(x, feetY - 3, 74, 12);
    for (let k = 0; k < 6; k++) {
        const ph = (now / 1000 + k / 6) % 1;
        g.fillStyle(venom, 0.3 * (1 - ph));
        g.fillCircle(x - 34 + k * 13, feetY - 4 - ph * 14, 3.4 * (1 - ph) + 1.4);
    }
    // 盘起的蛇躯：三层背甲环
    for (let layer = 2; layer >= 0; layer--) {
        const r = 30 - layer * 7;
        ring(g, x, feetY - 14 - layer * 9, r, r * 0.34, 11 - layer * 2, layer ? deep : body, 0.95 - layer * 0.05);
        ring(g, x, feetY - 16 - layer * 9, r, r * 0.34, 3, layer ? body : 0x5a9a6a, 0.6);
        for (let k = 0; k < 5; k++) { // 环上鳞纹
            const a = Math.PI * 1.15 + (k / 4) * Math.PI * 0.7;
            scales(g, x + Math.cos(a) * r, feetY - 14 - layer * 9 + Math.sin(a) * r * 0.34, 7, 1, 0x8ae8a0, 0.3, 0);
        }
    }
    // 九颈九首：扇形张开，主首（i=4）大一号
    for (let i = 0; i < 9; i++) {
        const off = i - 4;
        const a = -Math.PI / 2 + off * 0.3 + Math.sin(now / 700 + i * 0.8) * 0.05;
        const main = i === 4;
        const len = (main ? 60 : 50) + Math.sin(now / 700 + i * 0.8) * 5;
        const hx = x + Math.cos(a) * len * 0.92 - f * 3;
        const hy = topY + 26 + Math.sin(a) * (main ? 42 : 38);
        // 双线蛇颈（暗底 + 亮面）+ 鳞纹
        g.lineStyle(main ? 10 : 7, deep, 1);
        g.lineBetween(x, feetY - 30, hx, hy);
        g.lineStyle(main ? 6 : 4, i % 2 ? body : 0x3f7a56, 1);
        g.lineBetween(x, feetY - 30, hx, hy);
        g.lineStyle(1.4, 0x8ae8a0, 0.35);
        for (let s = 1; s <= 3; s++) {
            const u = s / 4;
            g.beginPath();
            g.arc(x + (hx - x) * u, feetY - 30 + (hy - (feetY - 30)) * u, 4 - s * 0.5, Math.PI * 1.1, Math.PI * 1.9);
            g.strokePath();
        }
        // 头：三角蛇首 + 亮面 + 竖瞳
        const hr = main ? 10 : 8;
        back(g, hx, hy, hr);
        g.fillStyle(skin, 1);
        g.fillEllipse(hx, hy, hr * 2.1, hr * 1.5);
        g.fillStyle(0x8ac8a0, 0.55);
        g.fillEllipse(hx - hr * 0.3, hy - hr * 0.4, hr * 1.1, hr * 0.6);
        g.fillStyle(0x3a7a54, 0.9); // 头顶斑纹
        g.fillTriangle(hx - hr * 0.8, hy - hr * 0.4, hx + hr * 0.9, hy - hr * 0.5, hx, hy - hr * 1.1);
        const blink = Math.sin(now / 760 + i * 1.3) > 0.93;
        for (const s of [-1, 1]) {
            if (blink) {
                g.fillStyle(deep, 1);
                g.fillRect(hx + s * 4 - 2, hy - 1, 4, 1.4);
            }
            else {
                g.fillStyle(0xffe89a, 1);
                g.fillEllipse(hx + s * 3.4, hy - 1, 4.6, 4);
                g.fillStyle(0x1a1a10, 1);
                g.fillEllipse(hx + s * 3.4, hy - 1, 1.4, 3.2);
            }
        }
        // 吐信 + 毒滴
        const fet = Math.sin(now / 300 + i) > 0;
        if (fet) {
            g.lineStyle(1.4, 0xff5a5a, 0.9);
            g.lineBetween(hx + f * hr, hy + 3, hx + f * (hr + 9), hy + 3);
            g.lineBetween(hx + f * (hr + 9), hy + 3, hx + f * (hr + 13), hy);
            g.lineBetween(hx + f * (hr + 9), hy + 3, hx + f * (hr + 13), hy + 6);
        }
        if (i % 2 === 0) {
            const drop = (now / 620 + i / 3) % 1;
            g.fillStyle(venom, 0.9 * (1 - drop));
            g.fillEllipse(hx + Math.sin(i) * 2, hy + hr + drop * 16, 3.4, 5.4);
        }
    }
    embers(g, x, feetY - 20, 5, 30, 40, venom, now, 0.3);
};
// ─────────────────────────── 3. 穷奇 ───────────────────────────
/** 穷奇：虎身双翼（三排飞羽可张合）+ 背刺林立 + 巨口獠牙 + 雷electricity 环绕 */
export const qiongQi = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const fur = 0xe0a83c, deep = 0x7a5218, cream = 0xf8ecd0, spike = 0x3a2a12;
    groundShadow(g, pose, 60);
    const move = pose.move ?? 0;
    // 双翼：三排飞羽（逐排相位错开），翼展更夸张
    for (const s of [-1, 1]) {
        const flap = Math.sin(now / 340 + (s > 0 ? 0 : 0.6));
        g.save();
        g.translateCanvas(x + s * 16, topY + 30);
        g.rotateCanvas(s * (0.42 + flap * 0.3));
        // 翼膜
        g.fillStyle(0x5a4218, 0.92);
        g.fillPoints([
            { x: 0, y: -6 }, { x: s * 30, y: -20 }, { x: s * 62, y: -10 }, { x: s * 74, y: 6 }, { x: s * 40, y: 12 },
        ], true);
        // 三排飞羽（长度递减，各自摆动）
        for (let row = 0; row < 3; row++) {
            const rw = Math.sin(now / 300 + row * 1.1 + (s > 0 ? 0 : 0.5)) * 3;
            g.fillStyle(row === 0 ? fur : row === 1 ? 0xc9922e : 0xa87a22, 0.95);
            g.fillPoints([
                { x: s * (10 + row * 6), y: -4 + row * 6 },
                { x: s * (66 - row * 8), y: -12 + row * 12 + rw },
                { x: s * (72 - row * 8), y: -2 + row * 12 + rw },
                { x: s * (14 + row * 6), y: 4 + row * 6 },
            ], true);
            // 羽轴
            g.lineStyle(1.4, deep, 0.75);
            for (let k = 1; k <= 4; k++) {
                const u = k / 5;
                g.lineBetween(s * (14 + row * 6 + (52 - row * 8) * u * 0.9), -4 + row * 6 + rw * u, s * (14 + row * 6 + (52 - row * 8) * u * 0.9), 2 + row * 6 + rw * u);
            }
        }
        g.lineStyle(2, cream, 0.5); // 翼缘白光
        g.beginPath();
        g.moveTo(0, -6);
        g.lineTo(s * 30, -20);
        g.lineTo(s * 62, -10);
        g.lineTo(s * 74, 6);
        g.strokePath();
        g.restore();
    }
    // 虎身：暗底 + 主体 + 亮面 + 虎纹条带
    back(g, x, topY + 56, 24);
    g.fillStyle(deep, 1);
    g.fillEllipse(x, topY + 58, 46, 36);
    g.fillStyle(fur, 1);
    g.fillEllipse(x, topY + 56, 43, 33);
    g.fillStyle(0xf0c464, 0.55);
    g.fillEllipse(x - f * 5, topY + 46, 26, 16);
    g.fillStyle(spike, 0.85); // 虎纹
    for (let k = 0; k < 4; k++) {
        g.fillRect(x - 14 + k * 9, topY + 40, 3, 12 + (k % 2) * 6);
    }
    // 胸口白毛
    g.fillStyle(cream, 0.9);
    g.fillEllipse(x + f * 18, topY + 58, 16, 14);
    // 背刺（7 根，会立起）
    for (let k = 0; k < 7; k++) {
        const px = x - 20 + k * 6.6;
        const up = 8 + 7 * Math.max(0, Math.sin(now / 500 + k * 1.2));
        g.fillStyle(spike, 0.95);
        g.fillTriangle(px - 2.6, topY + 42, px + 2.6, topY + 42, px, topY + 42 - up);
        g.fillStyle(0xffd45c, 0.5); // 刺尖光
        g.fillTriangle(px - 1, topY + 42, px + 1, topY + 42, px, topY + 42 - up * 0.6);
    }
    // 四足（虎爪，交替踏步 + 尘）
    for (const [lx, phase] of [[14, 0], [20, Math.PI], [-12, Math.PI], [-18, 0]]) {
        const step = Math.sin(now / 200 + phase) * move * 4;
        g.fillStyle(deep, 1);
        g.fillRoundedRect(x + lx - 5 + step * 0.4, topY + 70, 10, feetY - topY - 74, 3.4);
        g.fillStyle(fur, 1);
        g.fillRoundedRect(x + lx - 4 + step * 0.4, topY + 70, 8, feetY - topY - 76, 3);
        g.fillStyle(cream, 1); // 白爪
        g.fillRoundedRect(x + lx - 5 + step, feetY - 6, 10, 5, 2);
    }
    // 头：虎首 + 巨口獠牙 + 电眼
    const hx = x + f * 16, hy = topY + 30;
    const roar = 0.5 + 0.5 * Math.sin(now / 420); // 咆哮开合
    back(g, hx, hy, 15);
    g.fillStyle(fur, 1);
    g.fillCircle(hx, hy, 14);
    g.fillStyle(cream, 1); // 额白斑 + 王字
    g.fillEllipse(hx, hy - 6, 16, 9);
    g.fillStyle(spike, 0.9);
    g.fillRect(hx - 3, hy - 12, 6, 1.6);
    g.fillRect(hx - 5, hy - 9, 10, 1.6);
    // 双耳
    for (const s of [-1, 1]) {
        g.fillStyle(fur, 1);
        g.fillTriangle(hx + s * 9, hy - 8, hx + s * 14, hy - 19, hx + s * 3, hy - 12);
        g.fillStyle(0xffb0a0, 0.8);
        g.fillTriangle(hx + s * 9, hy - 10, hx + s * 12, hy - 16, hx + s * 6, hy - 12);
    }
    // 眉 + 电眼（雷electricity 瞳）
    g.lineStyle(2, spike, 0.9);
    g.lineBetween(hx + f * 1, hy - 6, hx + f * 8, hy - 3);
    g.fillStyle(0xffe89a, 1);
    g.fillEllipse(hx + f * 6, hy - 1, 6, 4.6);
    g.fillStyle(0x1a1a22, 1);
    g.fillEllipse(hx + f * 6, hy - 1, 1.6, 3.6);
    // 巨口（随咆哮张开）+ 獠牙 + 口腔
    const mo = 4 + roar * 9;
    g.fillStyle(0x2a0a12, 1);
    g.fillEllipse(hx + f * 8, hy + 11, 24, mo * 1.5);
    g.fillStyle(0x7a1a2a, 0.9); // 口腔内壁
    g.fillEllipse(hx + f * 8, hy + 11, 18, mo * 1.1);
    g.fillStyle(0xffffff, 1);
    for (let k = -2; k <= 2; k++) { // 上牙
        g.fillTriangle(hx + f * 8 + k * 4 - 1.7, hy + 11 - mo, hx + f * 8 + k * 4 + 1.7, hy + 11 - mo, hx + f * 8 + k * 4, hy + 11 - mo + 4.6);
    }
    for (let k = -2; k <= 2; k++) { // 下牙
        g.fillTriangle(hx + f * 8 + k * 4 - 1.7, hy + 11 + mo, hx + f * 8 + k * 4 + 1.7, hy + 11 + mo, hx + f * 8 + k * 4, hy + 11 + mo - 4.2);
    }
    g.fillStyle(0xffffff, 1); // 外露獠牙（更长）
    g.fillTriangle(hx + f * 3, hy + 9, hx + f * 7, hy + 9, hx + f * 4.4, hy + 9 + 9);
    g.fillTriangle(hx + f * 13, hy + 9, hx + f * 17, hy + 9, hx + f * 15.6, hy + 9 + 9);
    // 雷电环绕（分叉电弧，两股反向旋转）
    for (let k = 0; k < 2; k++) {
        const a0 = now / 130 + k * Math.PI;
        let px = x + Math.cos(a0) * 36, py = topY + 40 + Math.sin(a0) * 36;
        for (let s2 = 1; s2 <= 4; s2++) {
            const ang = a0 + s2 * 0.9 + Math.sin(now / 60 + s2 + k) * 0.5;
            const rr = 40 + s2 * 9;
            const nx = x + Math.cos(ang) * rr, ny = topY + 40 + Math.sin(ang) * rr;
            g.lineStyle(s2 > 2 ? 2.2 : 1.6, s2 > 2 ? 0xffffff : 0x9fd8ff, 0.75);
            g.lineBetween(px, py, nx, ny);
            px = nx;
            py = ny;
        }
    }
    // 咆哮音波环
    const wave = (now / 90) % 30;
    ring(g, hx + f * 20, hy + 8, wave, wave * 0.6, 1.6, 0xdfe8ff, Math.max(0, 0.5 - wave / 60));
};
// ─────────────────────────── 4. 饕餮 ───────────────────────────
/** 饕餮：青铜巨器质感——云雷纹、螺旋双角、三层獠牙巨口、腋下发光眼、吞云漩涡 */
export const taoTie = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const bronze = 0x9a7a44, deep = 0x4a3a1a, patina = 0x5a8a6a, horn = 0xc9a24a;
    groundShadow(g, pose, 60);
    const chew = Math.abs(Math.sin(now / 300));
    // 吞云漩涡：粒子由外向内被吸入口中
    for (let k = 0; k < 10; k++) {
        const ph = (now / 1100 + k / 10) % 1;
        const ang = k * 0.9 + now / 900;
        const r = 70 * (1 - ph);
        const px = x + f * 8 + Math.cos(ang) * r;
        const py = topY + 26 + Math.sin(ang) * r * 0.6;
        g.fillStyle(0xd8e8f0, 0.35 * ph);
        g.fillCircle(px, py, 2 + ph * 2.4);
    }
    // 青铜躯（羊身）：渐变块面 + 云雷纹
    back(g, x, topY + 54, 24);
    g.fillStyle(deep, 1);
    g.fillEllipse(x, topY + 55, 46, 38);
    g.fillStyle(bronze, 1);
    g.fillEllipse(x, topY + 54, 43, 35);
    g.fillStyle(0xb8955a, 0.5);
    g.fillEllipse(x - f * 6, topY + 44, 24, 16);
    g.fillStyle(patina, 0.35); // 铜锈
    g.fillEllipse(x + f * 10, topY + 62, 16, 12);
    // 云雷纹（回形方纹带）
    g.lineStyle(1.4, deep, 0.6);
    for (let k = 0; k < 3; k++) {
        const bx = x - 14 + k * 14, by = topY + 46;
        g.strokeRect(bx - 4, by - 4, 8, 8);
        g.strokeRect(bx - 2, by - 2, 4, 4);
    }
    // 卷云羊毛（外圈铜色卷）
    for (let k = 0; k < 7; k++) {
        const a = Math.PI * 0.85 + (k / 6) * Math.PI * 1.3;
        const r = 22;
        g.fillStyle(k % 2 ? bronze : deep, 0.95);
        g.fillCircle(x + Math.cos(a) * r, topY + 52 + Math.sin(a) * r * 0.8, 7 - (k % 2) * 1.6);
    }
    // 人爪按地（双手）
    for (const s of [-1, 1]) {
        const sw = Math.sin(now / 620 + s) * 2;
        g.lineStyle(6, deep, 1);
        g.lineBetween(x + s * 13, topY + 58, x + s * (22 + sw), topY + 74);
        g.lineStyle(3.4, bronze, 1);
        g.lineBetween(x + s * 13, topY + 58, x + s * (22 + sw), topY + 74);
        g.fillStyle(0xe8d8b8, 1);
        for (let c2 = -1; c2 <= 1; c2++) {
            g.fillTriangle(x + s * (22 + sw), topY + 74, x + s * (22 + sw) + c2 * 3, topY + 81, x + s * (22 + sw) + c2 * 5, topY + 74);
        }
    }
    // 双腿
    for (const s of [-1, 1]) {
        const step = Math.sin(now / 240 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 4;
        g.fillStyle(deep, 1);
        g.fillRect(x + s * 12 - 4, topY + 68 + Math.max(0, -step), 8, feetY - topY - 70 + Math.max(0, step));
        g.fillStyle(0xe8d8b8, 0.95);
        g.fillRect(x + s * 12 - 5, feetY - 5, 10, 5);
    }
    // 腋下双发光眼（竖瞳 + 血丝）
    for (const s of [-1, 1]) {
        const gl = 0.45 + 0.55 * Math.sin(now / 300 + s * 1.6);
        glow(g, x + s * 21, topY + 42, 13, 0xff8a2a, gl);
        g.fillStyle(0x1a0a00, 0.92);
        g.fillEllipse(x + s * 21, topY + 42, 12, 8.6);
        g.fillStyle(0xffd45c, gl);
        g.fillEllipse(x + s * 21, topY + 42, 8, 6);
        g.fillStyle(0xff5a2a, gl); // 竖瞳
        g.fillEllipse(x + s * 21, topY + 42, 2, 5);
        g.fillStyle(0xffffff, 0.7 * gl);
        g.fillCircle(x + s * 21 - 1.4, topY + 40.6, 1);
    }
    // 头：羊首人面 + 螺旋双角
    const hy = topY + 22;
    back(g, x + f * 6, hy, 15);
    g.fillStyle(0xe8c8a0, 1);
    g.fillCircle(x + f * 6, hy, 14);
    g.fillStyle(0xf8dcb8, 0.6);
    g.fillEllipse(x + f * 3, hy - 4, 12, 12);
    for (const s of [-1, 1]) { // 螺旋角（三层弧）
        for (let k = 0; k < 3; k++) {
            g.lineStyle(3.4 - k * 0.6, k === 2 ? horn : deep, 0.98);
            g.beginPath();
            g.arc(x + f * 6 + s * 13, hy - 6 - k * 3, 8 + k * 5, s > 0 ? Math.PI * 1.15 : Math.PI * 0.85, s > 0 ? Math.PI * 1.95 : Math.PI * 1.65, s < 0);
            g.strokePath();
        }
        g.fillStyle(horn, 1);
        g.fillCircle(x + f * 6 + s * 15, hy - 20, 2.6);
    }
    // 巨口（三层獠牙 + 深喉）
    const mh = 4 + chew * 7;
    g.fillStyle(0x1a0508, 1);
    g.fillEllipse(x + f * 6, hy + 10, 28, mh * 1.9);
    g.fillStyle(0x6a1018, 0.95); // 口腔
    g.fillEllipse(x + f * 6, hy + 10, 21, mh * 1.4);
    g.fillStyle(0x2a0508, 1); // 深喉
    g.fillEllipse(x + f * 8, hy + 10, 8, mh);
    for (let row = 0; row < 2; row++) { // 内外两排牙
        const inset = row;
        for (let k = -3; k <= 3; k++) {
            g.fillStyle(row === 0 ? 0xffffff : 0xd8d0b8, 1);
            g.fillTriangle(x + f * 6 + k * 3.8 + inset, hy + 10 - mh + inset, x + f * 6 + k * 3.8 + 3.2 - inset, hy + 10 - mh + inset, x + f * 6 + k * 3.8 + 1.6, hy + 10 - mh + 4.4 + inset);
            g.fillTriangle(x + f * 6 + k * 3.8 + inset, hy + 10 + mh - inset, x + f * 6 + k * 3.8 + 3.2 - inset, hy + 10 + mh - inset, x + f * 6 + k * 3.8 + 1.6, hy + 10 + mh - 4 + inset);
        }
    }
    // 眼（凶光）
    for (const s of [-1, 1]) {
        g.fillStyle(0x1a1a22, 1);
        g.fillEllipse(x + f * 6 + s * 5, hy - 4, 5.4, 4.2);
        g.fillStyle(0xff5a2a, 0.75 + 0.25 * Math.sin(now / 180 + s));
        g.fillCircle(x + f * 6 + s * 5, hy - 4, 1.6);
    }
    if (chew > 0.72) { // 咀嚼碎屑
        g.fillStyle(0xe8d8b8, 0.85);
        g.fillCircle(x + f * 8 + Math.sin(now / 90) * 5, hy + 13 + Math.sin(now / 80) * 4, 1.6);
    }
};
// ─────────────────────────── 5. 梼杌 ───────────────────────────
/** 梼杌：猪口獠牙 + 犬毛领 + 一丈八尺长尾（尾端鬃扇）+ 骨棘背脊 + 喷气 */
export const taoWu = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const hide = 0x8a6a4a, deep = 0x4a3420, mane = 0x2e2014, tusk = 0xf0e8d0;
    groundShadow(g, pose, 58);
    const wag = Math.sin(now / 460);
    // 长尾（更长：13 段，尾端鬃扇 + 骨环）
    const tail = [];
    for (let s = 0; s <= 12; s++) {
        const u = s / 12;
        tail.push([
            x - f * (18 + u * 104),
            topY + 44 - Math.sin(u * Math.PI) * (30 + wag * 12 * u) + u * 14,
        ]);
    }
    for (let s = 1; s < tail.length; s++) {
        const [x0, y0] = tail[s - 1];
        const [x1, y1] = tail[s];
        g.lineStyle(9 - s * 0.5, deep, 1);
        g.lineBetween(x0, y0, x1, y1);
        g.lineStyle(6 - s * 0.4, s % 2 ? hide : 0x6a4a30, 1);
        g.lineBetween(x0, y0, x1, y1);
        if (s % 3 === 0) { // 尾上骨环
            g.lineStyle(1.6, tusk, 0.5);
            g.lineBetween(x1 - 3, y1 - 3, x1 + 3, y1 + 3);
        }
    }
    const [tx, ty] = tail[tail.length - 1];
    for (let k = 0; k < 7; k++) { // 尾端鬃扇
        const ang = -1.0 + k * 0.33 + wag * 0.35;
        g.fillStyle(k % 2 ? mane : deep, 0.95);
        g.fillTriangle(tx - 3, ty, tx + 3, ty, tx + Math.cos(ang) * 15, ty + Math.sin(ang) * 15 - 5);
    }
    glow(g, tx, ty, 12, 0xff8a3c, 0.35);
    // 躯干
    back(g, x, topY + 54, 25);
    g.fillStyle(deep, 1);
    g.fillEllipse(x, topY + 55, 44, 38);
    g.fillStyle(hide, 1);
    g.fillEllipse(x, topY + 54, 41, 35);
    g.fillStyle(0xa8825c, 0.5);
    g.fillEllipse(x - f * 5, topY + 44, 24, 14);
    g.fillStyle(0x8a6a4a, 0.6); // 腹线
    ring(g, x, topY + 64, 24, 10, 1.6, 0x5a4028, 0.5);
    // 骨棘背脊（9 根，闪烁微光）
    for (let k = 0; k < 9; k++) {
        const px = x - 22 + k * 5.6;
        const up = 7 + 6 * Math.max(0, Math.sin(now / 520 + k * 1.1));
        g.fillStyle(0xe8dcc0, 0.95);
        g.fillTriangle(px - 2.2, topY + 40, px + 2.2, topY + 40, px, topY + 40 - up);
        g.fillStyle(0xffffff, 0.35);
        g.fillTriangle(px - 1, topY + 40, px + 1, topY + 40, px, topY + 40 - up * 0.55);
    }
    // 犬毛领（两层交错毛簇）
    for (let layer = 0; layer < 2; layer++) {
        const r = 22 - layer * 5;
        for (let k = 0; k < 11; k++) {
            const ang = Math.PI * 0.92 + (k / 10) * Math.PI * 1.16;
            g.fillStyle(layer ? 0x3e2c1c : mane, 0.95);
            g.fillTriangle(x + Math.cos(ang) * r, topY + 44 + Math.sin(ang) * r * 0.7, x + Math.cos(ang + 0.16) * r, topY + 44 + Math.sin(ang + 0.16) * r * 0.7, x + Math.cos(ang + 0.08) * (r + 8 - layer * 2), topY + 44 + Math.sin(ang + 0.08) * (r + 8) * 0.7);
        }
    }
    // 四蹄（腾尘）
    for (const s of [-1, 1]) {
        const step = Math.sin(now / 210 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 4;
        g.fillStyle(deep, 1);
        g.fillRect(x + s * 12 - 4, topY + 70 + Math.max(0, -step), 8, feetY - topY - 72 + Math.max(0, step));
        g.fillStyle(0x3a2a1a, 1); // 蹄
        g.fillEllipse(x + s * 12, feetY - 2 + Math.max(0, -step), 11, 5);
        g.fillStyle(tusk, 0.5); // 蹄光
        g.fillEllipse(x + s * 12 - 1, feetY - 4 + Math.max(0, -step), 5, 2);
        if ((pose.move ?? 0) > 0.15) { // 蹄下尘
            for (let k = 0; k < 3; k++) {
                const ph = (now / 400 + k / 3) % 1;
                g.fillStyle(0xd8c8b0, 0.3 * (1 - ph));
                g.fillCircle(x + s * 12 + (s > 0 ? 6 : -6) - ph * s * 12, feetY - ph * 8, 3 * (1 - ph) + 1);
            }
        }
    }
    // 头：人面 + 猪口 + 长獠牙 + 鼻孔喷气
    const hy = topY + 20, snort = Math.abs(Math.sin(now / 520));
    back(g, x + f * 8, hy, 14);
    g.fillStyle(0xd8b090, 1);
    g.fillCircle(x + f * 8, hy, 13);
    g.fillStyle(0xe8c8a8, 0.6);
    g.fillEllipse(x + f * 6, hy - 4, 11, 11);
    g.fillStyle(0xc99a7a, 1); // 猪吻
    g.fillEllipse(x + f * 17, hy + 5, 11, 9);
    g.fillStyle(0x5a2a20, 1);
    g.fillCircle(x + f * 15, hy + 5, 1.3);
    g.fillCircle(x + f * 19, hy + 5, 1.3);
    g.lineStyle(2, deep, 0.9); // 眉
    g.lineBetween(x + f * 3, hy - 7, x + f * 11, hy - 5);
    g.fillStyle(0xff3a3a, 0.7 + 0.3 * snort); // 赤瞳
    g.fillEllipse(x + f * 5, hy - 3, 5, 3.6);
    g.fillStyle(0x1a0a08, 0.9);
    g.fillEllipse(x + f * 5, hy - 3, 1.6, 3);
    // 长獠牙（两层 + 涎丝）
    g.fillStyle(tusk, 1);
    g.fillTriangle(x + f * 12, hy + 9, x + f * 17, hy + 8, x + f * 15, hy + 20);
    g.fillTriangle(x + f * 5, hy + 10, x + f * 10, hy + 10, x + f * 8, hy + 21);
    g.fillStyle(0xffffff, 0.5);
    g.lineStyle(1, 0xe8e0c8, 0.6); // 涎丝
    g.lineBetween(x + f * 15, hy + 20, x + f * 15 + Math.sin(now / 300) * 2, hy + 24);
    // 鼻孔喷气
    for (let k = 0; k < 2; k++) {
        const ph = (now / 800 + k / 2) % 1;
        g.fillStyle(0xd8c8b0, 0.22 * (1 - ph) * snort);
        g.fillCircle(x + f * (22 + ph * 18), hy + 3 - ph * 7, 3 + ph * 6);
    }
};
// ─────────────────────────── 6. 混沌 ───────────────────────────
/** 混沌：无面目赤囊——熔岩裂纹透光、体表游走星斑、四翼三段羽层、六足疾走、赤炎环 */
export const hunDun = (g, now, pose) => {
    const { x, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const sack = 0xe8b84c, deep = 0x8a5a14, lava = 0xff5a1a, star = 0xfff0b0;
    groundShadow(g, pose, 56);
    const wob = Math.sin(now / 380);
    const pulse = 0.5 + 0.5 * Math.sin(now / 280);
    // 赤炎环（身后旋转火圈）
    for (let k = 0; k < 14; k++) {
        const a = now / 900 + (k / 14) * Math.PI * 2;
        const rx = 46 + Math.sin(now / 500 + k) * 3;
        const px = x + Math.cos(a) * rx;
        const py = topY + 42 + Math.sin(a) * rx * 0.5;
        const depth = 0.35 + 0.4 * (Math.sin(a) * 0.5 + 0.5);
        g.fillStyle(lava, depth * 0.7);
        g.fillCircle(px, py, 3.4 + (k % 3));
        g.fillStyle(0xffe89a, depth * 0.8);
        g.fillCircle(px, py, 1.4);
    }
    glow(g, x, topY + 40, 54, lava, 0.3 + pulse * 0.2);
    // 囊体：暗底 + 主体 + 亮面 + 熔岩裂纹
    back(g, x, topY + 40 + wob, 26);
    g.fillStyle(deep, 1);
    g.fillEllipse(x + 2, topY + 42 + wob, 44, 50 - wob * 3);
    g.fillStyle(sack, 1);
    g.fillEllipse(x, topY + 40 + wob, 41, 47 - wob * 3);
    g.fillStyle(0xf8dc90, 0.55);
    g.fillEllipse(x - 9, topY + 28 + wob, 17, 22);
    // 熔岩裂纹（三段，宽度随脉动）
    g.lineStyle(1.6 + pulse, lava, 0.75);
    g.beginPath();
    g.moveTo(x - 16, topY + 24 + wob);
    g.lineTo(x - 6, topY + 36 + wob);
    g.lineTo(x - 12, topY + 48 + wob);
    g.strokePath();
    g.beginPath();
    g.moveTo(x + 12, topY + 30 + wob);
    g.lineTo(x + 4, topY + 44 + wob);
    g.lineTo(x + 14, topY + 56 + wob);
    g.strokePath();
    // 体表游走星斑（无目之物，以身代眼）
    for (let k = 0; k < 6; k++) {
        const a = now / 1400 + k * 1.05;
        const rx = Math.cos(a) * 16, ry = Math.sin(a * 1.3) * 18;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 260 + k * 2));
        g.fillStyle(star, tw * 0.8);
        g.fillCircle(x + rx, topY + 40 + wob + ry, 1.6 + (k % 2));
    }
    // 四翼（三段羽层 + 相位差扇动）
    for (let k = 0; k < 4; k++) {
        const s = k < 2 ? -1 : 1;
        const row = k % 2;
        const ph = Math.sin(now / 250 + k * 1.7);
        g.save();
        g.translateCanvas(x + s * 18, topY + 28 + row * 15 + wob);
        g.rotateCanvas(s * (0.5 + ph * 0.55) + (row ? 0.35 : 0));
        g.fillStyle(row ? deep : 0xc99a2e, 0.92);
        g.fillPoints([
            { x: 0, y: -6 }, { x: s * 24, y: -12 }, { x: s * 50, y: -2 }, { x: s * 52, y: 8 }, { x: s * 20, y: 6 },
        ], true);
        for (let f2 = 0; f2 < 3; f2++) { // 三段羽
            g.fillStyle(f2 === 0 ? sack : f2 === 1 ? 0xc99a2e : deep, 0.95);
            g.fillPoints([
                { x: s * (6 + f2 * 8), y: -4 + f2 * 3 },
                { x: s * (48 - f2 * 10), y: -8 + f2 * 5 },
                { x: s * (50 - f2 * 10), y: 0 + f2 * 5 },
                { x: s * (10 + f2 * 8), y: 4 + f2 * 3 },
            ], true);
        }
        g.lineStyle(1.6, 0xffe89a, 0.45); // 翼缘火光
        g.beginPath();
        g.moveTo(0, -6);
        g.lineTo(s * 24, -12);
        g.lineTo(s * 50, -2);
        g.lineTo(s * 52, 8);
        g.strokePath();
        g.restore();
    }
    // 六足（疾走 + 速度线）
    for (let k = 0; k < 6; k++) {
        const s = k % 2 === 0 ? -1 : 1;
        const step = Math.sin(now / 150 + k * 1.05) * (pose.move ?? 0.3) * 5;
        g.lineStyle(3.2, deep, 1);
        g.lineBetween(x + s * 12, topY + 62 + wob, x + s * (16 + (k > 3 ? 7 : 0)) + step, feetY - 2);
        g.lineStyle(1.8, sack, 0.9);
        g.lineBetween(x + s * 12, topY + 62 + wob, x + s * (16 + (k > 3 ? 7 : 0)) + step, feetY - 3);
        g.fillStyle(deep, 1);
        g.fillCircle(x + s * (16 + (k > 3 ? 7 : 0)) + step, feetY - 2, 2.4);
    }
    // 体心赤光核
    glow(g, x, topY + 38 + wob, 16, lava, 0.5 + pulse * 0.3);
    g.fillStyle(0xffe89a, pulse * 0.9);
    g.fillCircle(x, topY + 38 + wob, 3.4);
    embers(g, x, topY + 40, 6, 30, 40, lava, now, 0.6);
};
// ─────────────────────────── 7. 九尾狐 ───────────────────────────
/** 九尾狐：九尾更长更蓬（白→雪蓝→狐火尾尖三段渐变），眉心朱砂，狐火绕身轨道，雪尘 */
export const jiuweiHu = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const fur = 0xf4f0e8, shade = 0xcfd8e8, frost = 0xa8d8ff, foxfire = 0x9fe8ff;
    groundShadow(g, pose, 54);
    const move = pose.move ?? 0;
    // 九尾：三段渐变 + 狐火尾尖
    for (let k = 0; k < 9; k++) {
        const base = Math.PI * 0.72 + (k / 8) * Math.PI * 0.56;
        const sway = Math.sin(now / 420 + k * 0.55) * 0.14;
        const ang = f > 0 ? Math.PI - (base + sway) : base + sway;
        const len = 60 + (k % 3) * 10;
        const mx = x + Math.cos(ang) * len * 0.5, my = topY + 30 + Math.sin(ang) * len * 0.5;
        const nx2 = x + Math.cos(ang) * len * 0.78, ny2 = topY + 30 + Math.sin(ang) * len * 0.78;
        const ex = x + Math.cos(ang) * len, ey = topY + 30 + Math.sin(ang) * len;
        // 暗底
        g.lineStyle(12 - Math.abs(k - 4) * 0.6, 0x9aa8c0, 1);
        g.beginPath();
        g.moveTo(x, topY + 30);
        g.lineTo(mx, my);
        g.lineTo(nx2, ny2);
        g.lineTo(ex, ey);
        g.strokePath();
        // 白毛主体
        g.lineStyle(8.6 - Math.abs(k - 4) * 0.5, k % 2 ? fur : shade, 1);
        g.beginPath();
        g.moveTo(x, topY + 30);
        g.lineTo(mx, my);
        g.lineTo(nx2, ny2);
        g.strokePath();
        // 雪蓝中段
        g.lineStyle(5, frost, 0.85);
        g.beginPath();
        g.moveTo(mx, my);
        g.lineTo(nx2, ny2);
        g.strokePath();
        // 尾尖狐火
        const fl = 0.6 + 0.4 * Math.sin(now / 150 + k * 1.6);
        glow(g, ex, ey, 10, foxfire, fl * 0.7);
        g.fillStyle(0xffffff, fl);
        g.fillCircle(ex, ey, 3.6);
        // 蓬松毛簇（尾端三簇）
        for (let c2 = 0; c2 < 3; c2++) {
            const ca = ang + (c2 - 1) * 0.28;
            g.fillStyle(fur, 0.9);
            g.fillTriangle(ex - 2, ey, ex + 2, ey, ex + Math.cos(ca) * 9, ey + Math.sin(ca) * 9);
        }
    }
    const bob = Math.abs(Math.sin(now / 260)) * move * 2.4;
    // 躯干
    back(g, x, topY + 50 - bob, 20);
    g.fillStyle(shade, 1);
    g.fillEllipse(x, topY + 51 - bob, 36, 29);
    g.fillStyle(fur, 1);
    g.fillEllipse(x, topY + 50 - bob, 33, 26);
    g.fillStyle(0xffffff, 0.6);
    g.fillEllipse(x - f * 5, topY + 44 - bob, 18, 12);
    // 四肢（雪白细腿 + 爪）
    for (const [lx, phase] of [[10, 0], [15, Math.PI], [-9, Math.PI], [-14, 0]]) {
        const step = Math.sin(now / 220 + phase) * move * 3;
        g.lineStyle(4, shade, 1);
        g.lineBetween(x + lx, topY + 58 - bob, x + lx + step, feetY - 3);
        g.lineStyle(2.6, fur, 1);
        g.lineBetween(x + lx, topY + 58 - bob, x + lx + step, feetY - 3);
        g.fillStyle(0xffffff, 0.95);
        g.fillEllipse(x + lx + step, feetY - 2, 7, 3.4);
    }
    // 头：狐首 + 大耳 + 金瞳竖瞳 + 眉心朱砂 + 三须
    const hx = x + f * 13, hy = topY + 22 - bob;
    back(g, hx, hy, 12);
    g.fillStyle(fur, 1);
    g.fillCircle(hx, hy, 11);
    g.fillStyle(0xffffff, 0.6);
    g.fillEllipse(hx - f * 2, hy - 3, 9, 8);
    for (const s of [-1, 1]) { // 大耳（内粉）
        g.fillStyle(fur, 1);
        g.fillTriangle(hx + s * 8, hy - 6, hx + s * 13, hy - 21, hx + s * 2, hy - 11);
        g.fillStyle(0xffc8d8, 0.85);
        g.fillTriangle(hx + s * 8.4, hy - 8, hx + s * 11.4, hy - 17, hx + s * 5, hy - 10.6);
    }
    g.fillStyle(0xff5a7a, 0.9); // 眉心朱砂
    g.fillTriangle(hx, hy - 9, hx - 2.4, hy - 5, hx + 2.4, hy - 5);
    // 金瞳（呼吸发光 + 竖瞳）
    const eyeGlow = 0.7 + 0.3 * Math.sin(now / 300);
    glow(g, hx + f * 3, hy, 6, 0xffe89a, eyeGlow * 0.7);
    g.fillStyle(0xffe89a, 1);
    g.fillEllipse(hx + f * 3.4, hy - 0.6, 5.4, 4.4);
    g.fillStyle(0x2a0a14, 1);
    g.fillEllipse(hx + f * 3.4, hy - 0.6, 1.4, 3.6);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(hx + f * 2.4, hy - 2, 1);
    // 吻 + 须
    g.fillStyle(fur, 1);
    g.fillTriangle(hx + f * 8, hy + 2, hx + f * 16, hy + 4, hx + f * 8, hy + 7);
    g.fillStyle(0x2a0a14, 0.9);
    g.fillCircle(hx + f * 15.4, hy + 4, 1);
    for (let k = 0; k < 3; k++) {
        g.lineStyle(1, 0xcfd8e8, 0.7);
        g.beginPath();
        g.moveTo(hx + f * 12, hy + 3 + k * 2);
        g.lineTo(hx + f * (20 + k), hy + 1 + k * 3 + Math.sin(now / 400 + k) * 1);
        g.strokePath();
    }
    // 狐火绕身轨道（三层 + 拖尾）
    for (let k = 0; k < 7; k++) {
        const ph = now / 900 + (k / 7) * Math.PI * 2;
        const gl = 0.5 + 0.5 * Math.sin(now / 240 + k * 1.9);
        const px = x + Math.cos(ph) * 38, py = topY + 22 + Math.sin(ph * 1.6) * 26;
        g.fillStyle(foxfire, gl * 0.3);
        g.fillCircle(px, py, 6);
        g.fillStyle(0xffffff, gl);
        g.fillCircle(px, py, 2);
        g.fillStyle(foxfire, gl * 0.35); // 拖尾
        g.fillCircle(px + Math.cos(ph) * 9, py + Math.sin(ph * 1.6) * 9, 1.6);
    }
    // 雪尘
    for (let k = 0; k < 5; k++) {
        const ph = (now / 1400 + k / 5) % 1;
        g.fillStyle(0xffffff, 0.4 * (1 - ph));
        g.fillCircle(x - 30 + k * 15 + Math.sin(ph * 6 + k) * 6, topY + 60 - ph * 60, 1.6);
    }
};
// ─────────────────────────── 8. 巴蛇 ───────────────────────────
/** 巴蛇：青赤黑三色巨蛇——环腰盘绕、腹部鼓包内可见小象轮廓、腹甲横纹、分叉长信子、尾端响环 */
export const baShe = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const green = 0x2f7a4a, red = 0xb03030, ink = 0x0e1a14, belly = 0xd8c8a0;
    groundShadow(g, pose, 66);
    // 盘绕蛇躯（三匝，青赤黑交替 + 腹甲横纹）
    for (let i = 2; i >= 0; i--) {
        const rx = 34 - i * 6, ry = rx * 0.36;
        const cy = feetY - 16 - i * 12;
        ring(g, x, cy, rx, ry, 15 - i * 3, ink, 1);
        ring(g, x, cy, rx - 1, ry - 1, 11 - i * 2.4, i === 1 ? red : green, 1);
        for (let k = 0; k < 9; k++) { // 腹甲横纹
            const a = Math.PI * 1.05 + (k / 8) * Math.PI * 0.9;
            const px = x + Math.cos(a) * rx, py = cy + Math.sin(a) * ry;
            g.lineStyle(1.6, belly, 0.65);
            g.lineBetween(px - 2.5, py - 4, px + 2.5, py + 4);
        }
        for (let k = 0; k < 4; k++) { // 背部鳞纹
            const a = Math.PI * 0.15 + (k / 3) * Math.PI * 0.7;
            scales(g, x + Math.cos(a) * rx, cy + Math.sin(a) * ry, 9, 1, 0x8ae8a0, 0.3, 0);
        }
    }
    // 腹部鼓包（吞象）：轮廓 + 可辨小象剪影 + 呼吸蠕动
    const br = 6 + Math.sin(now / 560) * 2.6;
    const bX = x - f * 6, bY = feetY - 30;
    glow(g, bX, bY, 24 + br, 0xffd45c, 0.2);
    g.fillStyle(belly, 0.95);
    g.fillEllipse(bX, bY, 26 + br, 21 + br * 0.8);
    g.lineStyle(1.2, ink, 0.45);
    ring(g, bX, bY, 15 + br * 0.6, 11 + br * 0.5, 1.2, ink, 0.4);
    // 腹内小象剪影（象头 + 耳 + 卷鼻 + 腿）
    g.fillStyle(0x8a6a3a, 0.55);
    g.fillEllipse(bX + br * 0.2, bY - 1, 13, 9); // 象身
    g.fillCircle(bX + 6 + br * 0.3, bY - 3, 4); // 象头
    g.fillEllipse(bX + 3, bY - 4, 5, 6); // 耳
    g.lineStyle(1.8, 0x8a6a3a, 0.55); // 卷鼻
    g.beginPath();
    g.moveTo(bX + 10, bY - 1);
    g.lineTo(bX + 12, bY + 4 + Math.sin(now / 500) * 1.4);
    g.lineTo(bX + 9, bY + 7);
    g.strokePath();
    for (let k = 0; k < 3; k++) { // 象腿
        g.lineStyle(1.6, 0x8a6a3a, 0.5);
        g.lineBetween(bX - 4 + k * 4, bY + 5, bX - 4 + k * 4, bY + 9);
    }
    // 颈与巨首
    const hx = x + f * 16, hy = topY + 20;
    g.lineStyle(13, ink, 1);
    g.lineBetween(x + f * 4, feetY - 46, hx, hy + 8);
    g.lineStyle(9, green, 1);
    g.lineBetween(x + f * 4, feetY - 46, hx, hy + 8);
    g.lineStyle(1.6, 0x8ae8a0, 0.4);
    for (let k = 1; k <= 3; k++) {
        const u = k / 4;
        g.beginPath();
        g.arc(x + f * 4 + (hx - x - f * 4) * u, feetY - 46 + (hy + 8 - (feetY - 46)) * u, 5 - k, Math.PI * 1.1, Math.PI * 1.9);
        g.strokePath();
    }
    back(g, hx, hy, 15);
    g.fillStyle(green, 1);
    g.fillEllipse(hx, hy, 26, 17);
    g.fillStyle(0x8ac8a0, 0.6);
    g.fillEllipse(hx - f * 2, hy - 4, 15, 7);
    g.fillStyle(ink, 0.55); // 头顶斑
    g.fillTriangle(hx - 8, hy - 6, hx + 9, hy - 7, hx, hy - 14);
    // 眉棱 + 竖瞳
    g.fillStyle(0x1a5a3a, 1);
    g.fillEllipse(hx + f * 5, hy - 6, 8, 4);
    glow(g, hx + f * 5, hy - 3, 8, 0xffd45c, 0.6);
    g.fillStyle(0xffe89a, 1);
    g.fillEllipse(hx + f * 5, hy - 3, 6, 5);
    g.fillStyle(0x1a1a10, 1);
    g.fillEllipse(hx + f * 5.4, hy - 3, 1.6, 4.6);
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(hx + f * 4.4, hy - 4.4, 1.2);
    // 分叉长信子（吞吐 + 更长）
    const flick = Math.max(0, Math.sin(now / 280));
    if (flick > 0.05) {
        const tl = flick * 14;
        g.lineStyle(1.8, 0xff4a4a, 0.95);
        g.beginPath();
        g.moveTo(hx + f * 12, hy + 4);
        g.lineTo(hx + f * (12 + tl), hy + 4 + flick * 2);
        g.strokePath();
        g.lineStyle(1.4, 0xff4a4a, 0.9);
        g.lineBetween(hx + f * (12 + tl), hy + 4 + flick * 2, hx + f * (12 + tl + 5), hy + 1);
        g.lineBetween(hx + f * (12 + tl), hy + 4 + flick * 2, hx + f * (12 + tl + 5), hy + 7);
    }
    // 毒牙
    g.fillStyle(0xffffff, 0.95);
    g.fillTriangle(hx + f * 7, hy + 6, hx + f * 10, hy + 6, hx + f * 8.4, hy + 12);
    g.fillTriangle(hx + f * 1, hy + 6, hx + f * 4, hy + 6, hx + f * 2.4, hy + 12);
    // 尾端响环（角质环层 + 抖动）
    const tw2 = Math.sin(now / 200) * 2;
    g.fillStyle(0xc9a24a, 0.95);
    for (let k = 0; k < 3; k++) {
        g.fillEllipse(x - f * (44 + k * 5), feetY - 22 + k * 2 + tw2, 7 - k, 5 - k * 0.6);
    }
    g.fillStyle(0x8a6a2a, 0.8);
    ring(g, x - f * 44, feetY - 22 + tw2, 5, 3.4, 1.2, 0x4a3410, 0.6);
    // 毒雾
    for (let k = 0; k < 4; k++) {
        const ph = (now / 1200 + k / 4) % 1;
        g.fillStyle(0x9cff3a, 0.22 * (1 - ph));
        g.fillCircle(x + Math.sin(k * 2.2) * 30, feetY - 6 - ph * 20, 5 * (1 - ph) + 2);
    }
};
// ─────────────────────────── 9. 蛊雕 ───────────────────────────
/** 蛊雕：有角巨雕——三段羽层大翼可上挥压下、凤羽金斑长冠、钩喙带齿、三趾金爪、气流旋 */
export const guDiao = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const feather = 0x9a8666, deep = 0x4e3e26, cream = 0xf0e4c8, gold = 0xe8c25c;
    groundShadow(g, pose, 50);
    const flap = Math.sin(now / 560);
    // 气流旋（身后）
    for (let k = 0; k < 3; k++) {
        const a0 = now / 700 + k * 2.1;
        ring(g, x, topY + 40, 40 + k * 8, (40 + k * 8) * 0.4, 1.4, 0xdfe8ff, 0.2 - k * 0.05);
        g.fillStyle(0xdfe8ff, 0.25);
        g.fillCircle(x + Math.cos(a0) * (42 + k * 8), topY + 40 + Math.sin(a0) * (17 + k * 3), 1.8);
    }
    // 双翼：三段羽层，扇幅夸张（上挥过高、压下更低）
    for (const s of [-1, 1]) {
        g.save();
        g.translateCanvas(x + s * 15, topY + 34);
        g.rotateCanvas(s * (0.32 + flap * 0.5));
        // 翼膜
        g.fillStyle(0x3e3018, 0.9);
        g.fillPoints([
            { x: 0, y: -8 }, { x: s * 34, y: -22 }, { x: s * 70, y: -8 }, { x: s * 78, y: 10 }, { x: s * 40, y: 14 },
        ], true);
        // 三段羽层
        for (let row = 0; row < 3; row++) {
            const rw = Math.sin(now / 480 + row * 1.3 + (s > 0 ? 0 : 0.7)) * 4;
            g.fillStyle(row === 0 ? feather : row === 1 ? 0x7a6a4a : 0x5e4e30, 0.96);
            g.fillPoints([
                { x: s * (8 + row * 7), y: -6 + row * 7 },
                { x: s * (70 - row * 9), y: -14 + row * 13 + rw },
                { x: s * (76 - row * 9), y: -2 + row * 13 + rw },
                { x: s * (12 + row * 7), y: 5 + row * 7 },
            ], true);
            // 羽轴 + 金斑
            g.lineStyle(1.4, deep, 0.7);
            for (let k = 1; k <= 5; k++) {
                const u = k / 6;
                const px = s * (12 + row * 7 + (58 - row * 9) * u * 0.92);
                g.lineBetween(px, -6 + row * 7 + rw * u, px, 4 + row * 7 + rw * u);
            }
            g.fillStyle(gold, 0.5);
            g.fillCircle(s * (30 + row * 5), -2 + row * 12 + rw, 2);
        }
        g.lineStyle(2.2, cream, 0.5); // 翼缘白
        g.beginPath();
        g.moveTo(0, -8);
        g.lineTo(s * 34, -22);
        g.lineTo(s * 70, -8);
        g.lineTo(s * 78, 10);
        g.strokePath();
        g.restore();
    }
    // 躯干 + 尾羽（5 根，扇形）
    back(g, x, topY + 52, 18);
    g.fillStyle(deep, 1);
    g.fillEllipse(x, topY + 52, 34, 32);
    g.fillStyle(feather, 1);
    g.fillEllipse(x, topY + 51, 31, 29);
    g.fillStyle(cream, 0.85); // 胸羽
    g.fillEllipse(x - f * 3, topY + 58, 20, 16);
    for (let k = 0; k < 5; k++) {
        const a = Math.PI * 1.15 + (k / 4) * Math.PI * 0.7;
        const sw = Math.sin(now / 400 + k) * 3;
        g.fillStyle(k % 2 ? deep : feather, 0.95);
        g.fillPoints([
            { x: x - f * 14, y: topY + 62 },
            { x: x - f * 14 + Math.cos(a) * 24, y: topY + 62 + Math.sin(a) * 24 + sw },
            { x: x - f * 14 + Math.cos(a + 0.2) * 24, y: topY + 62 + Math.sin(a + 0.2) * 24 + sw },
        ], true);
    }
    // 双腿金爪（三趾 + 后趾，趾尖反光）
    for (const s of [-1, 1]) {
        const lift = Math.max(0, Math.sin(now / 500 + (s > 0 ? 0 : Math.PI))) * (pose.move ?? 0) * 4;
        g.lineStyle(2.8, gold, 1);
        g.lineBetween(x + s * 8, topY + 66, x + s * 9, feetY - 6 - lift);
        for (let t = -1; t <= 1; t++) { // 三前趾
            g.lineStyle(2.2, gold, 1);
            g.beginPath();
            g.moveTo(x + s * 9, feetY - 6 - lift);
            g.lineTo(x + s * (9 + t * 5), feetY - 1 - lift);
            g.strokePath();
            g.fillStyle(0xfff0b0, 0.8); // 趾尖
            g.fillCircle(x + s * (9 + t * 5), feetY - 1 - lift, 1.2);
        }
        g.lineStyle(1.8, gold, 0.9); // 后趾
        g.lineBetween(x + s * 9, feetY - 6 - lift, x + s * 3, feetY - 1 - lift);
    }
    // 头：钩喙 + 齿 + 金瞳 + 凤羽长冠
    const hx = x + f * 11, hy = topY + 22;
    back(g, hx, hy, 12);
    g.fillStyle(feather, 1);
    g.fillCircle(hx, hy, 11);
    g.fillStyle(cream, 0.85);
    g.fillEllipse(hx - f * 2, hy + 3, 12, 8);
    // 凤羽长冠（4 根飘带 + 金斑）
    for (let k = 0; k < 4; k++) {
        const sw = Math.sin(now / 320 + k * 1.2) * 4;
        g.fillStyle(k % 2 ? cream : gold, 0.95);
        g.beginPath();
        g.moveTo(hx - f * 4, hy - 8);
        g.lineTo(hx - f * (10 + k * 3) + sw * 0.3, hy - 14 - k * 5);
        g.lineTo(hx - f * (14 + k * 3) + sw, hy - 12 - k * 5);
        g.strokePath();
        g.fillStyle(gold, 0.85);
        g.fillCircle(hx - f * (13 + k * 3) + sw, hy - 13 - k * 5, 1.4);
    }
    // 双角（金）+ 角环纹
    for (const s of [-1, 1]) {
        g.fillStyle(gold, 1);
        g.fillPoints([
            { x: hx + s * 6, y: hy - 8 }, { x: hx + s * 12, y: hy - 21 }, { x: hx + s * 13, y: hy - 13 }, { x: hx + s * 7, y: hy - 6 },
        ], true);
        g.lineStyle(1, 0x8a6a2a, 0.8);
        g.lineBetween(hx + s * 8, hy - 10, hx + s * 11, hy - 15);
    }
    // 钩喙（带齿 + 口腔红）
    g.fillStyle(gold, 1);
    g.fillPoints([
        { x: hx + f * 7, y: hy - 3 }, { x: hx + f * 20, y: hy + 1 }, { x: hx + f * 17, y: hy + 4 },
        { x: hx + f * 20, y: hy + 9 }, { x: hx + f * 7, y: hy + 6 },
    ], true);
    g.fillStyle(0xff5a4a, 0.85); // 口腔
    g.fillPoints([{ x: hx + f * 8, y: hy + 1 }, { x: hx + f * 16, y: hy + 2 }, { x: hx + f * 8, y: hy + 5 }], true);
    g.fillStyle(0xffffff, 0.9); // 喙齿
    for (let k = 0; k < 3; k++) {
        g.fillTriangle(hx + f * (9 + k * 3), hy + 5, hx + f * (11 + k * 3), hy + 5, hx + f * (10 + k * 3), hy + 7.6);
    }
    // 眼（金瞳 + 凶光）
    glow(g, hx + f * 4, hy - 3, 7, 0xffe89a, 0.5 + 0.3 * Math.sin(now / 340));
    g.fillStyle(0x1a1a22, 1);
    g.fillCircle(hx + f * 4, hy - 3, 3);
    g.fillStyle(0xffe89a, 1);
    g.fillCircle(hx + f * 4, hy - 3, 1.6);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(hx + f * 3.4, hy - 3.8, 0.8);
    // 飘落羽
    for (let k = 0; k < 3; k++) {
        const ph = (now / 1600 + k / 3) % 1;
        g.fillStyle(feather, 0.5 * (1 - ph));
        g.fillEllipse(x - f * (30 - ph * 40), topY + 70 + ph * 30, 6, 2.4);
    }
};
// ─────────────────────────── 10. 猰貐 ───────────────────────────
/** 猰貐：赤牛躯 + 人面獠牙 + 马足 + 牛角符纹 + 赤色凶气漩涡 + 蹄下火星 + 血焰吐息 */
export const yuYu = (g, now, pose) => {
    const { x, facing: f, feetY } = pose;
    const topY = feetY - PLAYER_H;
    const hide = 0xc2503a, deep = 0x6e2418, cream = 0xf0d0b0, blood = 0xff4020;
    groundShadow(g, pose, 62);
    const move = pose.move ?? 0;
    const gallop = Math.abs(Math.sin(now / 240)) * move * 3;
    // 赤色凶气漩涡（身后两股反向旋转的赤环）
    for (let k = 0; k < 2; k++) {
        for (let j = 0; j < 9; j++) {
            const a = (k ? -1 : 1) * (now / 800 + (j / 9) * Math.PI * 2);
            const rx = 46 + j * 1.4;
            const px = x + Math.cos(a) * rx;
            const py = topY + 44 + Math.sin(a) * rx * 0.42;
            const depth = 0.3 + 0.4 * (Math.sin(a) * 0.5 + 0.5);
            g.fillStyle(blood, depth * 0.5);
            g.fillCircle(px, py, 2.6 + (j % 3));
        }
    }
    glow(g, x, topY + 42, 56, blood, 0.16 + 0.08 * Math.sin(now / 300));
    // 牛躯：暗底 + 主体 + 肌肉块面 + 背脊线
    back(g, x, topY + 54 - gallop * 0.4, 24);
    g.fillStyle(deep, 1);
    g.fillEllipse(x + 1.8, topY + 55 + 1.6 - gallop * 0.4, 47, 36);
    g.fillStyle(hide, 1);
    g.fillEllipse(x, topY + 54 - gallop * 0.4, 44, 33);
    g.fillStyle(0xd86a50, 0.55); // 肩肌
    g.fillEllipse(x - f * 8, topY + 44 - gallop * 0.4, 24, 15);
    g.fillStyle(0xe8846a, 0.4); // 后臀
    g.fillEllipse(x - f * 20, topY + 58 - gallop * 0.4, 16, 14);
    g.lineStyle(1.6, deep, 0.55); // 背脊
    g.lineBetween(x - f * 18, topY + 42 - gallop * 0.4, x + f * 16, topY + 42 - gallop * 0.4);
    for (let k = 0; k < 3; k++) { // 肋线
        g.lineStyle(1.2, deep, 0.35);
        g.beginPath();
        g.arc(x - f * (4 - k * 8), topY + 58 - gallop * 0.4, 12 + k * 2, Math.PI * 1.15, Math.PI * 1.75);
        g.strokePath();
    }
    // 四马足（蹄铁反光 + 蹄下火星）
    for (const s of [-1, 1]) {
        for (let p = 0; p < 2; p++) {
            const ph = now / 180 + (s > 0 ? 0 : Math.PI) + p * 1.4;
            const step = Math.sin(ph) * move * 6;
            const hx2 = x + s * (12 + p * 6) + step;
            g.lineStyle(5.4, deep, 1);
            g.lineBetween(x + s * (12 + p * 6), topY + 66 - gallop * 0.4, hx2, feetY - 4);
            g.lineStyle(3.4, s * p > 0 ? hide : 0xa03a28, 1);
            g.lineBetween(x + s * (12 + p * 6), topY + 66 - gallop * 0.4, hx2, feetY - 4);
            g.fillStyle(0x2a1a12, 1); // 蹄
            g.fillEllipse(hx2, feetY - 2, 9, 4.6);
            g.fillStyle(0xd8d0c0, 0.6); // 蹄铁光
            g.fillEllipse(hx2 - 1, feetY - 3.4, 4.4, 1.6);
            if (move > 0.15) { // 蹄下火星
                for (let k = 0; k < 3; k++) {
                    const fp = (now / 260 + k / 3) % 1;
                    g.fillStyle(0xffb04a, 0.8 * (1 - fp));
                    g.fillCircle(hx2 - step * 0.3 + (k - 1) * 3, feetY - 2 - fp * 9, 1.6 * (1 - fp) + 0.4);
                }
            }
        }
    }
    // 尾（龙尾 + 鬃）
    const wag = Math.sin(now / 420);
    g.lineStyle(4, deep, 1);
    g.beginPath();
    g.moveTo(x - f * 22, topY + 44 - gallop * 0.4);
    g.lineTo(x - f * (34 + wag * 3), topY + 58);
    g.lineTo(x - f * (40 + wag * 6), topY + 50 + wag * 4);
    g.strokePath();
    g.lineStyle(2.4, hide, 1);
    g.beginPath();
    g.moveTo(x - f * 22, topY + 46 - gallop * 0.4);
    g.lineTo(x - f * (34 + wag * 3), topY + 60);
    g.lineTo(x - f * (40 + wag * 6), topY + 52 + wag * 4);
    g.strokePath();
    g.fillStyle(blood, 0.9); // 尾尖赤焰
    g.fillCircle(x - f * (40 + wag * 6), topY + 50 + wag * 4, 3);
    for (let k = 0; k < 4; k++) { // 尾鬃
        g.fillStyle(0x3a2018, 0.9);
        g.fillTriangle(x - f * (28 + k * 4), topY + 50, x - f * (30 + k * 4), topY + 58, x - f * (34 + k * 4), topY + 52 + wag * 2);
    }
    // 头：人面 + 牛角符纹 + 赤瞳 + 獠牙 + 血焰吐息
    const hx = x + f * 17, hy = topY + 22 - gallop * 0.4;
    back(g, hx, hy, 14);
    g.fillStyle(cream, 1);
    g.fillCircle(hx, hy, 13);
    g.fillStyle(0xf8e0c8, 0.6);
    g.fillEllipse(hx - f * 3, hy - 4, 11, 11);
    // 牛角（外弯 + 红色符纹）
    for (const s of [-1, 1]) {
        g.fillStyle(0xe8dcc0, 1);
        g.fillPoints([
            { x: hx + s * 8, y: hy - 8 }, { x: hx + s * 19, y: hy - 17 }, { x: hx + s * 22, y: hy - 11 },
            { x: hx + s * 13, y: hy - 4 },
        ], true);
        g.lineStyle(1.2, blood, 0.85); // 角上符纹
        g.lineBetween(hx + s * 11, hy - 7, hx + s * 17, hy - 13);
        g.lineBetween(hx + s * 15, hy - 12, hx + s * 18, hy - 8);
    }
    // 额血纹
    g.fillStyle(blood, 0.9);
    g.fillTriangle(hx, hy - 13, hx - 3.4, hy - 7, hx + 3.4, hy - 7);
    // 赤瞳（凶光脉动）
    const gl = 0.6 + 0.4 * Math.sin(now / 220);
    glow(g, hx - f * 5, hy - 2, 6, blood, gl * 0.6);
    glow(g, hx + f * 5, hy - 2, 6, blood, gl * 0.6);
    for (const s of [-1, 1]) {
        g.fillStyle(0xff3a2a, gl);
        g.fillEllipse(hx + s * 5, hy - 2, 5, 4);
        g.fillStyle(0x1a0808, 0.95);
        g.fillEllipse(hx + s * 5, hy - 2, 1.4, 3.2);
    }
    // 獠牙（四枚，长）
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(hx - f * 7, hy + 7, hx - f * 3, hy + 7, hx - f * 6, hy + 15);
    g.fillTriangle(hx + f * 3, hy + 7, hx + f * 7, hy + 7, hx + f * 6, hy + 15);
    g.fillTriangle(hx - f * 4, hy + 8, hx - f * 2, hy + 8, hx - f * 3.6, hy + 12);
    g.fillTriangle(hx + f * 2, hy + 8, hx + f * 4, hy + 8, hx + f * 3.4, hy + 12);
    // 口边血焰吐息
    for (let k = 0; k < 3; k++) {
        const ph = (now / 700 + k / 3) % 1;
        g.fillStyle(blood, 0.3 * (1 - ph));
        g.fillCircle(hx + f * (14 + ph * 16), hy + 6 - ph * 8, 3.4 * (1 - ph) + 1.4);
    }
    embers(g, x, topY + 46, 5, 26, 50, blood, now, 0.4);
};
