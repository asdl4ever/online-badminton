/** 局部小工具：实心星 / 多边形（SwingKit 只有 ribbon/core/dot，形状自己补） */
function star(g, x, y, r, rot, color, al, pts = 5) {
    const vs = [];
    for (let k = 0; k < pts * 2; k++) {
        const ang = rot + (k / (pts * 2)) * Math.PI * 2;
        const rr = k % 2 === 0 ? r : r * 0.42;
        vs.push({ x: x + Math.cos(ang) * rr, y: y + Math.sin(ang) * rr });
    }
    g.fillStyle(color, al);
    g.fillPoints(vs, true, true);
}
function poly(g, x, y, r, sides, rot, color, al) {
    const vs = [];
    for (let k = 0; k < sides; k++) {
        const ang = rot + (k / sides) * Math.PI * 2;
        vs.push({ x: x + Math.cos(ang) * r, y: y + Math.sin(ang) * r });
    }
    g.fillStyle(color, al);
    g.fillPoints(vs, true, true);
}
/**
 * 第一批主题挥拍拖尾——按「斩」的名字逐款构图：
 * 弯刀就是弯刀、雷霆就是雷霆，不再共用同一套波形换色。
 */
export const SWINGS_1 = {
    // 冲刺斩：被拉出残影的极速刀光
    runSwing: { a: 0x39d0a0, draw: (g, _now, hot, k, c, a) => {
            k.ribbon(1.2, c, 0.6);
            k.ribbon(2.6, 0xffffff, 0.4 + hot * 0.5);
            for (let i = 2; i < k.n; i += 2) {
                const p = k.at(i, -6);
                g.lineStyle(1.4, a, (0.5 - i / k.n * 0.4) * (0.4 + hot * 0.5));
                g.lineBetween(p.x, p.y, p.x + (p.x - k.at(Math.max(0, i - 3)).x) * 2.2, p.y + (p.y - k.at(Math.max(0, i - 3)).y) * 2.2);
            }
            k.core(0.3, 1.2);
        } },
    // 弯刀斩：一道弯月形的刀锋扫过
    desSwing: { a: 0xffd45c, draw: (g, _now, _hot, k, c, a) => {
            k.ribbon(3, c, 0.9);
            k.ribbon(1.2, 0xfff0c0, 1);
            k.core(0.4, 1.25);
            const tip = k.at(k.n - 1);
            const mid = k.at(Math.floor(k.n / 2));
            g.lineStyle(2.4, a, 0.7);
            g.beginPath();
            g.arc((tip.x + mid.x) / 2, (tip.y + mid.y) / 2, 10, Math.atan2(tip.y - mid.y, tip.x - mid.x) - 1.2, Math.atan2(tip.y - mid.y, tip.x - mid.x) + 1.2);
            g.strokePath();
        } },
    // 云涡斩：绕刀锋打旋的云涡
    nimbSwing: { a: 0xffffff, draw: (g, now, _hot, k, c, a) => {
            k.ribbon(2.4, c, 0.7);
            for (let i = 2; i < k.n; i += 2) {
                const p = k.at(i);
                const swirl = now / 200 + i * 1.2;
                const r = 3 + (i % 4) * 2;
                g.lineStyle(1.4, a, 0.5);
                g.strokeCircle(p.x, p.y, r);
                g.fillStyle(c, 0.6);
                g.fillCircle(p.x + Math.cos(swirl) * r, p.y + Math.sin(swirl) * r, 1.6);
            }
            k.core(0.3, 1.05);
        } },
    // 糖霜斩：奶油般的厚刀锋 + 糖粒
    confSwing: { a: 0xff869c, draw: (g, now, _hot, k, c, a) => {
            k.ribbon(3.6, c, 0.55);
            k.ribbon(1.8, 0xfff8f0, 0.95);
            for (let i = 2; i < k.n; i += 3) {
                const p = k.at(i, Math.sin(i * 2.2) * 5);
                star(g, p.x, p.y, 1.8, now / 300 + i, i % 2 ? a : c, 0.8);
            }
            k.core(0.3, 1.05);
        } },
    // 彩纸斩：刀锋撒出一片彩纸屑
    bigtSwing: { a: 0xffd45c, draw: (g, now, _hot, k, c, a) => {
            k.ribbon(2.6, c, 0.5);
            k.ribbon(1.2, c, 0.95);
            for (let i = 2; i < k.n; i += 2) {
                const p = k.at(i, Math.sin(i * 1.9) * 8);
                const col = [a, 0x4ac8ff, 0x8fd45a, 0xffffff][i % 4];
                poly(g, p.x, p.y, 2, 4, now / 240 + i, col, 0.7);
            }
            k.core(0.32, 1.1);
        } },
    // 雷霆斩：暗刃 + 沿刃乱窜的电弧
    aegisSwing: { a: 0xc0392b, draw: (g, now, _hot, k, c, _a) => {
            k.ribbon(3, 0x2a2e36, 0.6);
            k.ribbon(1.2, c, 1);
            for (let i = 2; i < k.n - 2; i += 3) {
                const p0 = k.at(i), p1 = k.at(i + 2, 4);
                g.lineStyle(1.6, 0xffd45c, 0.85);
                g.lineBetween(p0.x, p0.y, p0.x + Math.sin(i * 3.1 + now / 80) * 5, (p0.y + p1.y) / 2);
                g.lineBetween(p0.x + Math.sin(i * 3.1 + now / 80) * 5, (p0.y + p1.y) / 2, p1.x, p1.y);
            }
            k.core(0.4, 1.2);
        } },
    // 水墨斩：浓墨大笔 + 末端飞白
    chanSwing: { a: 0x8fd45a, draw: (g, _now, _hot, k, _c, _a) => {
            k.ribbon(4.4, 0x2a2e36, 0.85);
            for (let i = 1; i < k.n; i += 2) {
                const p = k.at(i, Math.sin(i * 1.7) * 6);
                g.fillStyle(0x2a2e36, 0.35);
                g.fillCircle(p.x, p.y, 1.4 + k.pts[i].w * 2);
            }
            k.core(0.3, 1);
            const tip = k.at(k.n - 1);
            g.lineStyle(1.2, 0x8a8a92, 0.6);
            g.lineBetween(tip.x, tip.y, tip.x + (tip.x - k.at(k.n - 4).x) * 2, tip.y + (tip.y - k.at(k.n - 4).y) * 2);
        } },
    // 星辉斩：紫刃 + 一路旋转的星辉
    arcanSwing: { a: 0xffd45c, draw: (g, now, _hot, k, c, a) => {
            k.ribbon(2.8, c, 0.85);
            k.ribbon(1, 0xe8d8ff, 1);
            for (let i = 2; i < k.n; i += 2) {
                const p = k.at(i, Math.sin(i * 2.4) * 7);
                star(g, p.x, p.y, 2 + k.pts[i].w, now / 260 + i, i % 3 ? a : 0xffffff, 0.85);
            }
            k.core(0.35, 1.15);
        } },
    // 沙尘斩：刀过处的沙尘团
    relicSwing: { a: 0xb8a880, draw: (g, _now, _hot, k, c, a) => {
            k.ribbon(3.2, c, 0.7);
            for (let i = 2; i < k.n; i += 2) {
                const p = k.at(i, Math.sin(i * 2) * 6);
                g.fillStyle(i % 2 ? a : 0xf0e8d0, 0.4);
                g.fillCircle(p.x, p.y, 2 + k.pts[i].w * 2.4);
                g.fillStyle(i % 2 ? a : 0xf0e8d0, 0.25);
                g.fillCircle(p.x + 2, p.y - 2, 1.2 + k.pts[i].w);
            }
            k.core(0.32, 1.05);
        } },
    // 星彩斩：四色星星沿着刀锋撒
    playSwing: { a: 0x9effd0, draw: (g, now, _hot, k, c, a) => {
            k.ribbon(2.2, 0xffffff, 0.6);
            for (let i = 2; i < k.n; i += 2) {
                const p = k.at(i, Math.sin(i * 2.1) * 9);
                star(g, p.x, p.y, 2.2 + k.pts[i].w * 1.4, now / 240 + i, [c, a, 0xff869c, 0x4ac8ff][i % 4], 0.85);
            }
            k.core(0.3, 1.1);
        } },
    // 焰火斩：刀锋上是炸开的小烟花
    yuanSwing: { a: 0xffd45c, draw: (g, now, _hot, k, c, a) => {
            k.ribbon(2.6, c, 0.75);
            for (let i = 3; i < k.n - 1; i += 4) {
                const p = k.at(i);
                for (let s = 0; s < 6; s++) {
                    const ang = (s / 6) * Math.PI * 2 + now / 250 + i;
                    g.fillStyle(s % 2 ? a : 0xff8a3c, 0.7);
                    g.fillCircle(p.x + Math.cos(ang) * 5, p.y + Math.sin(ang) * 5, 1.2);
                }
            }
            k.core(0.4, 1.2);
        } },
    // 山海斩：青色灵气绕刃成涡
    shanSwing: { a: 0xff8a3c, draw: (g, now, _hot, k, c, a) => {
            // 山海斩：一刀劈开山海——墨青浪为刃、白沫为锋、釉青山影为脊、灵气随刃升腾
            k.ribbon(4.6, 0x1a4a5a, 0.65);
            k.ribbon(2.8, 0x2a6a7a, 0.5);
            k.ribbon(2, c, 1);
            // 浪尖白沫（沿刃一侧、越靠尖端越碎）
            for (let i = 1; i < k.n; i += 2) {
                const p = k.at(i, -5 - k.pts[i].w * 2);
                g.fillStyle(0xffffff, (0.5 + k.pts[i].w * 0.4) * 0.9);
                g.fillCircle(p.x, p.y, 1.2 + k.pts[i].w * 1.8);
                if (i % 4 === 1) {
                    const q = k.at(i, -9 - k.pts[i].w * 3);
                    g.fillStyle(0xffffff, 0.35);
                    g.fillCircle(q.x, q.y, 1 + k.pts[i].w);
                }
            }
            // 釉青山影：刃另一侧的小山随浪错落
            for (let i = 2; i < k.n - 2; i += 4) {
                const p = k.at(i, 7);
                const q = k.at(Math.min(k.n - 1, i + 2), 7);
                const h = 8 + (i % 8);
                const vs = [
                    { x: p.x, y: p.y }, { x: (p.x + q.x) / 2 - 2, y: (p.y + q.y) / 2 + h }, { x: q.x, y: q.y },
                ];
                g.fillStyle(0x2a6a4a, 0.8);
                g.fillPoints(vs, true);
                g.fillStyle(0x9fe8c0, 0.5);
                g.fillCircle((p.x + q.x) / 2, (p.y + q.y) / 2 + h, 1.2);
            }
            // 灵气：沿刃升腾的青色灵点
            for (let i = 2; i < k.n; i += 3) {
                const p = k.at(i, Math.sin(now / 260 + i * 1.5) * 6 - 10);
                g.fillStyle(0x9fe8c0, (0.4 + k.pts[i].w * 0.45) * 0.9);
                g.fillCircle(p.x, p.y, 1.4 + k.pts[i].w);
            }
            // 收斩处：卷起的浪头 + 鹏光一闪
            const tip = k.at(k.n - 1);
            g.lineStyle(2, 0xffffff, 0.9);
            g.beginPath();
            g.arc(tip.x, tip.y, 7, now / 200, now / 200 + 2.4);
            g.strokePath();
            g.fillStyle(a, 0.85 + 0.15 * Math.sin(now / 130));
            g.fillCircle(tip.x, tip.y, 2.8);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(tip.x, tip.y, 1.2);
            k.core(0.42, 1.3);
        } },
    // 锚爪斩：三道爪痕 + 铁链感
    pirateSwing: { a: 0xe8c86a, draw: (g, _now, _hot, k, c, _a) => {
            k.ribbon(2.4, c, 0.8);
            for (let i = 1; i < k.n; i += 3) {
                const p = k.at(i);
                for (const s of [-1, 0, 1]) {
                    g.lineStyle(1.6, 0x1a1a22, 0.7);
                    g.lineBetween(p.x + s * 4, p.y - 6, p.x + s * 5.5, p.y + 6);
                }
            }
            k.core(0.34, 1.15);
        } },
    // 齿轮斩：刀锋上转动的齿轮
    steamSwing: { a: 0xffb03a, draw: (g, now, _hot, k, c, a) => {
            k.ribbon(3, a, 0.4);
            k.ribbon(1.4, c, 1);
            for (let i = 3; i < k.n - 1; i += 4) {
                const p = k.at(i);
                const rot = now / 200 + i;
                g.lineStyle(1.6, 0x8a92a8, 0.8);
                g.strokeCircle(p.x, p.y, 3.4);
                for (let t = 0; t < 6; t++) {
                    const ang = rot + (t / 6) * Math.PI * 2;
                    g.lineBetween(p.x + Math.cos(ang) * 3.4, p.y + Math.sin(ang) * 3.4, p.x + Math.cos(ang) * 5, p.y + Math.sin(ang) * 5);
                }
            }
            k.core(0.3, 1);
        } },
    // 轨道斩：刃外一圈轨道环 + 环上星
    astroSwing: { a: 0x9fd8ff, draw: (g, now, _hot, k, c, a) => {
            k.ribbon(2.2, a, 0.7);
            k.core(0.35, 1.2);
            const mid = k.at(Math.floor(k.n / 2));
            g.lineStyle(1.4, c, 0.5);
            g.strokeCircle(mid.x, mid.y, 16);
            const orb = now / 300;
            star(g, mid.x + Math.cos(orb) * 16, mid.y + Math.sin(orb) * 16 * 0.5, 2.6, orb, 0xffffff, 0.9);
        } },
    // 撕咬斩：锯齿状的咬痕刀锋
    juraSwing: { a: 0x9fe86a, draw: (g, _now, _hot, k, c, _a) => {
            k.ribbon(2.2, 0x5a7a3a, 0.55);
            for (let i = 1; i < k.n - 1; i += 2) {
                const p0 = k.at(i), p2 = k.at(Math.min(k.n - 1, i + 2));
                const vs = [
                    { x: p0.x, y: p0.y }, { x: (p0.x + p2.x) / 2 + Math.sin(i) * 4, y: (p0.y + p2.y) / 2 + 6 },
                    { x: p2.x, y: p2.y },
                ];
                g.fillStyle(c, 0.85);
                g.fillPoints(vs, false);
            }
            k.core(0.36, 1.15);
        } },
    // 菌伞斩：一朵朵小菌伞沿刃排开
    mushSwing: { a: 0xffb7d5, draw: (g, _now, _hot, k, c, a) => {
            k.ribbon(2.2, c, 0.75);
            for (let i = 2; i < k.n; i += 3) {
                const p = k.at(i);
                g.fillStyle(a, 0.8);
                g.fillCircle(p.x, p.y, 2.6);
                g.fillStyle(0xfff0f4, 0.9);
                g.fillCircle(p.x - 0.8, p.y - 0.8, 1);
                g.fillStyle(0xf0e8d8, 0.9);
                g.fillRect(p.x - 1, p.y + 1.6, 2, 3);
            }
            k.core(0.3, 1.05);
        } },
    // 潮汐斩：一层层浪头卷过刀锋
    tropicSwing: { a: 0x5fe8d0, draw: (g, _now, _hot, k, c, _a) => {
            k.ribbon(3, 0x1a6a8a, 0.45);
            k.ribbon(1.8, c, 0.9);
            for (let i = 2; i < k.n; i += 3) {
                const p = k.at(i, -5);
                g.lineStyle(1.6, 0xffffff, 0.8);
                g.beginPath();
                g.arc(p.x, p.y + 3, 4, Math.PI, Math.PI * 2);
                g.strokePath();
            }
            k.core(0.34, 1.1);
        } },
    // 断骨斩：一节节白骨拼出的刀锋
    cryptSwing: { a: 0x9fd8a0, draw: (g, _now, _hot, k, c, _a) => {
            k.ribbon(2.6, c, 0.55);
            for (let i = 1; i < k.n - 1; i += 2) {
                const p0 = k.at(i), p1 = k.at(i + 1);
                g.lineStyle(3.4, 0xf0ead8, 0.9);
                g.lineBetween(p0.x, p0.y, p1.x, p1.y);
                g.fillStyle(0xf0ead8, 0.9);
                g.fillCircle(p0.x, p0.y, 2.2);
            }
            k.core(0.32, 1.05);
        } },
    // 铃铛斩：刀锋挂着一串会晃的小铃铛
    festivSwing: { a: 0xffd45c, draw: (g, now, _hot, k, c, a) => {
            k.ribbon(2.4, c, 0.75);
            for (let i = 2; i < k.n; i += 3) {
                const p = k.at(i, Math.sin(now / 150 + i) * 3);
                g.fillStyle(a, 0.9);
                g.fillCircle(p.x, p.y, 2.4);
                g.fillStyle(0x8a6a1a, 0.9);
                g.fillRect(p.x - 0.6, p.y + 2, 1.2, 1.6);
                g.lineStyle(1, 0xffffff, 0.4);
                g.strokeCircle(p.x, p.y, 4 + Math.sin(now / 120 + i) * 1.2);
            }
            k.core(0.3, 1.05);
        } },
    // 快刀斩：极薄极快的一道刀光
    sushiSwing: { a: 0xfff0d0, draw: (g, now, hot, k, c, _a) => {
            k.ribbon(1, 0xffffff, 1);
            k.ribbon(2.6, c, 0.35);
            k.core(0.45, 1.35);
            const tip = k.at(k.n - 1);
            star(g, tip.x, tip.y, 4 + hot * 3, now / 100, 0xffffff, 0.9, 4);
        } },
    // 拔枪斩：枪口的火光 + 硝烟
    wildSwing: { a: 0xffd45c, draw: (g, now, _hot, k, c, _a) => {
            k.ribbon(2.4, 0x8a8a92, 0.4);
            k.ribbon(1.2, c, 0.9);
            const tip = k.at(k.n - 1);
            for (let s = 0; s < 5; s++) {
                const ang = (s / 5) * Math.PI * 2 + now / 150;
                g.fillStyle(s % 2 ? 0xffd45c : 0xff8a3c, 0.85);
                g.fillCircle(tip.x + Math.cos(ang) * 6, tip.y + Math.sin(ang) * 6, 1.6);
            }
            for (let i = 2; i < k.n; i += 2) {
                const p = k.at(i, Math.sin(i * 2) * 6);
                g.fillStyle(0xd8d8d8, 0.3);
                g.fillCircle(p.x, p.y, 2 + k.pts[i].w * 2);
            }
            k.core(0.36, 1.15);
        } },
};
