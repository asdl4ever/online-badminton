/** 轨迹点（SwingKit.pts 的元素） */
export function ptAt(k, i, off = 0) {
    const idx = Math.max(0, Math.min(k.n - 1, Math.round(i)));
    const p0 = k.pts[Math.max(0, idx - 1)];
    const p1 = k.pts[Math.min(k.n - 1, idx + 1)];
    const dx = p1.x - p0.x, dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: k.pts[idx].x + (-dy / len) * off, y: k.pts[idx].y + (dx / len) * off, w: k.pts[idx].w, a: k.pts[idx].a };
}
/** 轨迹上第 i 点法线方向（单位向量） */
function normal(k, i) {
    const p0 = k.pts[Math.max(0, i - 1)];
    const p1 = k.pts[Math.min(k.n - 1, i + 1)];
    const dx = p1.x - p0.x, dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: -dy / len, y: dx / len, w: 0, a: 0 };
}
export const tipOf = (k) => ptAt(k, k.n - 1);
export const midOf = (k, t = 0.5) => ptAt(k, t * (k.n - 1));
// ───────────────────────── ① 剪影（主形状） ─────────────────────────
/** 厚背薄刃：沿轨迹一侧厚一侧薄的刀身剖面（正宗斩击剪影） */
export function bladeWedge(g, k, spine, edge, a = 1) {
    for (let i = 1; i < k.n; i++) {
        const n = normal(k, i);
        const w = k.pts[i].w;
        const al = k.pts[i].a * a;
        const p = k.pts[i];
        const q = k.pts[i - 1];
        g.fillStyle(spine, al * 0.95);
        g.fillPoints([
            { x: q.x + n.x * w * 0.5 * 0.4, y: q.y + n.y * w * 0.5 * 0.4 },
            { x: p.x + n.x * w * 0.5, y: p.y + n.y * w * 0.5 },
            { x: p.x - n.x * w * 0.18, y: p.y - n.y * w * 0.18 },
            { x: q.x - n.x * w * 0.06, y: q.y - n.y * w * 0.06 },
        ], true);
        g.fillStyle(edge, al);
        g.fillPoints([
            { x: q.x - n.x * w * 0.06, y: q.y - n.y * w * 0.06 },
            { x: p.x - n.x * w * 0.18, y: p.y - n.y * w * 0.18 },
            { x: p.x - n.x * w * 0.5, y: p.y - n.y * w * 0.5 },
            { x: q.x - n.x * w * 0.4, y: q.y - n.y * w * 0.4 },
        ], true);
    }
}
/** 彗尾：头粗尾细的实心带（比 ribbon 更有体积） */
export function cometBand(g, k, color, a = 1, bulge = 1) {
    for (let i = 1; i < k.n; i++) {
        const n = normal(k, i);
        const t = i / (k.n - 1);
        const w = k.pts[i].w * (0.35 + 0.9 * t) * bulge;
        const al = k.pts[i].a * a;
        g.fillStyle(color, al * 0.9);
        g.fillPoints([
            { x: k.pts[i - 1].x + n.x * w * 0.45, y: k.pts[i - 1].y + n.y * w * 0.45 },
            { x: k.pts[i].x + n.x * w * 0.5, y: k.pts[i].y + n.y * w * 0.5 },
            { x: k.pts[i].x - n.x * w * 0.5, y: k.pts[i].y - n.y * w * 0.5 },
            { x: k.pts[i - 1].x - n.x * w * 0.45, y: k.pts[i - 1].y - n.y * w * 0.45 },
        ], true);
    }
}
/** 缠带：像藤/蛇/缆一样绕轨迹盘一圈（off 正负决定绕向） */
export function coilBand(g, k, color, a = 1, loops = 3, amp = 1.6) {
    for (let i = 1; i < k.n; i++) {
        const n = normal(k, i);
        const t = i / (k.n - 1);
        const off = Math.sin(t * Math.PI * 2 * loops) * k.pts[i].w * amp;
        const off2 = Math.sin((t + 1 / (k.n - 1)) * Math.PI * 2 * loops) * k.pts[i].w * amp;
        g.lineStyle(Math.max(1, k.pts[i].w * 0.22), color, k.pts[i].a * a);
        g.lineBetween(k.pts[i - 1].x + n.x * off, k.pts[i - 1].y + n.y * off, k.pts[i].x + n.x * off2, k.pts[i].y + n.y * off2);
    }
}
/** 双刃交叉：两条错开的细刃剪影，用于「双刀 / 剪」型 */
export function doubleEdge(g, k, c1, c2, a = 1, sep = 3) {
    for (let i = 1; i < k.n; i++) {
        const n = normal(k, i);
        const w = Math.max(1, k.pts[i].w * 0.16);
        g.lineStyle(w, c1, k.pts[i].a * a);
        g.lineBetween(k.pts[i - 1].x + n.x * sep, k.pts[i - 1].y + n.y * sep, k.pts[i].x + n.x * sep, k.pts[i].y + n.y * sep);
        g.lineStyle(w, c2, k.pts[i].a * a);
        g.lineBetween(k.pts[i - 1].x - n.x * sep, k.pts[i - 1].y - n.y * sep, k.pts[i].x - n.x * sep, k.pts[i].y - n.y * sep);
    }
}
/** 极细极亮的锋线（快刀 / 斩钢） */
export function hairLine(g, k, color, a = 1, wmul = 0.1) {
    for (let i = 1; i < k.n; i++) {
        g.lineStyle(Math.max(1, k.pts[i].w * wmul), color, Math.min(1, k.pts[i].a * a));
        g.lineBetween(k.pts[i - 1].x, k.pts[i - 1].y, k.pts[i].x, k.pts[i].y);
    }
}
/** 断续虚线剪影（相位移动，像能量脉冲） */
export function dashLine(g, k, now, color, a = 1, period = 4, wmul = 0.2) {
    const shift = Math.floor((now / 120) % period);
    for (let i = 1; i < k.n; i++) {
        if ((i + shift) % period > period - 2)
            continue;
        g.lineStyle(Math.max(1, k.pts[i].w * wmul), color, k.pts[i].a * a);
        g.lineBetween(k.pts[i - 1].x, k.pts[i - 1].y, k.pts[i].x, k.pts[i].y);
    }
}
/** 淡外光（取代过去所有风格共用的底光带，只负责可读性） */
export function glowHalo(g, k, color, a = 0.12) {
    for (let i = 1; i < k.n; i++) {
        g.lineStyle(Math.max(1, k.pts[i].w * 1.5), color, k.pts[i].a * a);
        g.lineBetween(k.pts[i - 1].x, k.pts[i - 1].y, k.pts[i].x, k.pts[i].y);
    }
}
// ───────────────────────── ② 质感（材质） ─────────────────────────
/** 锯齿（撕咬 / 电锯 / 骨刺） */
export function sawTeeth(g, k, color, a = 1, len = 6, every = 2) {
    for (let i = 1; i < k.n - 1; i += every) {
        const n = normal(k, i);
        const p = k.pts[i];
        g.fillStyle(color, k.pts[i].a * a);
        g.fillTriangle(p.x, p.y, p.x + n.x * len, p.y + n.y * len, p.x - n.x * k.pts[i].w * 0.34, p.y - n.y * k.pts[i].w * 0.34);
    }
}
/** 锋毛：沿刃口竖起的细毛（毛笔 / 狼牙 / 草叶） */
export function edgeHairs(g, k, color, a = 1, len = 5, every = 1) {
    for (let i = 1; i < k.n - 1; i += every) {
        const n = normal(k, i);
        const p = k.pts[i];
        g.lineStyle(1, color, k.pts[i].a * a);
        g.lineBetween(p.x, p.y, p.x + n.x * (len + k.pts[i].w * 0.3), p.y + n.y * (len + k.pts[i].w * 0.3));
    }
}
/** 串珠（念珠 / 铃铛 / 气泡 / 齿轮节） */
export function beads(g, k, now, color, a = 1, r = 2.6, every = 2, sway = 0) {
    for (let i = 1; i < k.n - 1; i += every) {
        const n = normal(k, i);
        const off = sway ? Math.sin(now / 180 + i) * sway : 0;
        const p = k.pts[i];
        g.fillStyle(color, k.pts[i].a * a);
        g.fillCircle(p.x + n.x * off, p.y + n.y * off, r + k.pts[i].w * 0.12);
        g.fillStyle(0xffffff, k.pts[i].a * a * 0.45);
        g.fillCircle(p.x + n.x * off - r * 0.3, p.y + n.y * off - r * 0.3, r * 0.35);
    }
}
/** 鳞片/甲片（一片压一片，沿轨迹一侧铺） */
export function scales(g, k, color, a = 1, r = 3, every = 2) {
    for (let i = 2; i < k.n - 1; i += every) {
        const n = normal(k, i);
        const p = k.pts[i];
        g.fillStyle(color, k.pts[i].a * a);
        g.fillPoints([
            { x: p.x + n.x * r, y: p.y + n.y * r },
            { x: p.x - n.x * r, y: p.y - n.y * r },
            { x: p.x - n.x * r - k.pts[i].w * 0.3, y: p.y - n.y * r - k.pts[i].w * 0.3 },
        ], true);
    }
}
/** 棱晶（冰 / 晶石：尖锐的双锥） */
export function crystals(g, k, now, color, a = 1, n = 5, len = 7) {
    for (let j = 0; j < n; j++) {
        const i = Math.round(((j + 0.5) / n) * (k.n - 1));
        const p = k.pts[Math.max(0, Math.min(k.n - 1, i))];
        const ang = now / 800 + j * 1.7;
        const w = len * (0.6 + 0.4 * Math.sin(now / 300 + j));
        const side = j % 2 ? 1 : -1;
        g.fillStyle(color, p.a * a);
        g.fillPoints([
            { x: p.x + Math.cos(ang) * w * side, y: p.y + Math.sin(ang) * w * side },
            { x: p.x + Math.cos(ang + Math.PI / 2) * w * 0.3, y: p.y + Math.sin(ang + Math.PI / 2) * w * 0.3 },
            { x: p.x - Math.cos(ang) * w * 0.4 * side, y: p.y - Math.sin(ang) * w * 0.4 * side },
        ], true);
    }
}
/** 碎片（多边形碎块，崩飞感） */
export function shards(g, k, now, color, a = 1, n = 5, len = 7, spin = 1) {
    for (let j = 0; j < n; j++) {
        const i = Math.round(((j + 0.4) / n) * (k.n - 1));
        const p = k.pts[Math.max(0, Math.min(k.n - 1, i))];
        const nrm = normal(k, Math.max(1, i));
        const out = len * (0.7 + 0.5 * Math.sin(now / 260 + j * 2));
        const ang = now / 240 * spin + j;
        const cx = p.x + nrm.x * out, cy = p.y + nrm.y * out;
        g.fillStyle(color, p.a * a);
        g.fillPoints([
            { x: cx + Math.cos(ang) * 3, y: cy + Math.sin(ang) * 3 },
            { x: cx + Math.cos(ang + 2.1) * 3.4, y: cy + Math.sin(ang + 2.1) * 3.4 },
            { x: cx + Math.cos(ang + 4.2) * 2.6, y: cy + Math.sin(ang + 4.2) * 2.6 },
            { x: cx + Math.cos(ang + 5.4) * 1.8, y: cy + Math.sin(ang + 5.4) * 1.8 },
        ], true);
    }
}
/** 花瓣 / 叶（飘落，带自转） */
export function petals(g, k, now, color, a = 1, n = 6, size = 4) {
    for (let j = 0; j < n; j++) {
        const i = Math.round(((j + 0.3) / n) * (k.n - 1));
        const p = k.pts[Math.max(0, Math.min(k.n - 1, i))];
        const ph = now / 700 + j * 1.3;
        const dx = Math.sin(ph) * 9, dy = Math.cos(ph * 0.8) * 7;
        const ang = ph * 2;
        g.fillStyle(color, p.a * a);
        g.fillPoints([
            { x: p.x + dx + Math.cos(ang) * size, y: p.y + dy + Math.sin(ang) * size * 0.6 },
            { x: p.x + dx + Math.cos(ang + 1.7) * size * 0.7, y: p.y + dy + Math.sin(ang + 1.7) * size * 0.4 },
            { x: p.x + dx - Math.cos(ang) * size, y: p.y + dy - Math.sin(ang) * size * 0.6 },
            { x: p.x + dx - Math.cos(ang + 1.7) * size * 0.7, y: p.y + dy - Math.sin(ang + 1.7) * size * 0.4 },
        ], true);
    }
}
/** 六边形甲板（机械 / 蜂巢 / 能量板） */
export function plates(g, k, now, color, a = 1, n = 5, r = 5) {
    for (let j = 0; j < n; j++) {
        const i = Math.round(((j + 0.5) / n) * (k.n - 1));
        const p = k.pts[Math.max(0, Math.min(k.n - 1, i))];
        const arm = now / 600 + j;
        const vs = [];
        for (let s = 0; s < 6; s++) {
            const ang = arm + (s / 6) * Math.PI * 2;
            vs.push({ x: p.x + Math.cos(ang) * r, y: p.y + Math.sin(ang) * r });
        }
        g.fillStyle(color, p.a * a);
        g.fillPoints(vs, true);
        g.fillStyle(0xffffff, p.a * a * 0.4);
        g.fillCircle(p.x - r * 0.25, p.y - r * 0.25, r * 0.22);
    }
}
/** 骨节（一节节的脊椎/指骨） */
export function bones(g, k, color, a = 1, r = 2.4) {
    for (let i = 1; i < k.n - 1; i++) {
        const p = k.pts[i];
        g.lineStyle(Math.max(1.4, k.pts[i].w * 0.22), color, k.pts[i].a * a);
        g.lineBetween(k.pts[i - 1].x, k.pts[i - 1].y, p.x, p.y);
        g.fillStyle(color, k.pts[i].a * a);
        g.fillCircle(p.x, p.y, r);
    }
}
/** 墨点（水墨：由浓到飞白） */
export function inkDots(g, k, color, a = 1, every = 2) {
    for (let i = 1; i < k.n - 1; i += every) {
        const t = i / (k.n - 1);
        g.fillStyle(color, k.pts[i].a * a * (0.5 + 0.5 * t));
        g.fillCircle(k.pts[i].x, k.pts[i].y, 1 + k.pts[i].w * 0.5 * (1 - t * 0.5));
    }
}
/** 羽毛（一排飞羽） */
export function feathers(g, k, now, color, a = 1, n = 6, len = 9) {
    for (let j = 0; j < n; j++) {
        const i = Math.round(((j + 0.5) / n) * (k.n - 1));
        const p = k.pts[Math.max(0, Math.min(k.n - 1, i))];
        const nrm = normal(k, Math.max(1, i));
        const flap = Math.sin(now / 300 + j * 0.9) * 3;
        const dx = nrm.x * len + flap * 0.4, dy = nrm.y * len + flap;
        g.fillStyle(color, p.a * a);
        g.fillPoints([
            { x: p.x, y: p.y },
            { x: p.x + dx * 0.5 + nrm.x * 2, y: p.y + dy * 0.5 + nrm.y * 2 },
            { x: p.x + dx, y: p.y + dy },
            { x: p.x + dx * 0.5 - nrm.x * 2, y: p.y + dy * 0.5 - nrm.y * 2 },
        ], true);
    }
}
// ───────────────────────── ③ 动效（让每款活起来） ─────────────────────────
/** 火星（向上/向后飘） */
export function sparks(g, k, now, color, a = 1, n = 6, rise = 16) {
    for (let j = 0; j < n; j++) {
        const ph = (now / 600 + j / n) % 1;
        const i = Math.round((1 - ph) * (k.n - 1));
        const p = k.pts[Math.max(0, Math.min(k.n - 1, i))];
        g.fillStyle(color, (1 - ph) * a);
        g.fillCircle(p.x + Math.sin(ph * 9 + j) * 5, p.y - ph * rise, 1.6 * (1 - ph) + 0.4);
    }
}
/** 余烬（慢慢冷却变暗） */
export function embers(g, k, now, hotC, coldC, a = 1, n = 7) {
    for (let j = 0; j < n; j++) {
        const ph = (now / 900 + j / n) % 1;
        const i = Math.round((1 - ph) * (k.n - 1));
        const p = k.pts[Math.max(0, Math.min(k.n - 1, i))];
        g.fillStyle(ph < 0.4 ? hotC : coldC, (1 - ph) * a);
        g.fillCircle(p.x + (j % 2 ? 5 : -5), p.y - ph * 10, 1.4 * (1 - ph) + 0.4);
    }
}
/** 滴落（熔铁 / 糖霜 / 黏液：从轨迹往下挂） */
export function drips(g, k, now, color, hi, a = 1, n = 4) {
    for (let j = 0; j < n; j++) {
        const i = Math.round(((j + 0.35) / n) * (k.n - 1));
        const p = k.pts[Math.max(0, Math.min(k.n - 1, i))];
        const ph = (now / 800 + j / n) % 1;
        g.fillStyle(color, (1 - ph) * a);
        g.fillEllipse(p.x + (j % 2 ? 3 : -3), p.y + 4 + ph * 12, 2.4, 4);
        g.fillStyle(hi, (1 - ph) * a * 0.6);
        g.fillCircle(p.x + (j % 2 ? 3 : -3), p.y + 3 + ph * 12, 0.8);
    }
}
/** 烟团（翻滚的烟 / 蒸汽） */
export function puffs(g, k, now, color, a = 1, n = 8, grow = 10) {
    for (let j = 0; j < n; j++) {
        const ph = (now / 1000 + j / n) % 1;
        const i = Math.round((1 - ph) * (k.n - 1));
        const p = k.pts[Math.max(0, Math.min(k.n - 1, i))];
        const r = 3 + ph * grow;
        g.fillStyle(color, (0.3 - ph * 0.24) * a);
        g.fillCircle(p.x + Math.sin(ph * 7 + j) * 6, p.y - ph * 8, r);
    }
}
/** 电弧（沿轨迹分叉的雷） */
export function bolts(g, k, now, color, core, a = 1, n = 4) {
    for (let j = 0; j < n; j++) {
        const i0 = Math.round(((j + 0.2) / n) * (k.n - 1));
        const i1 = Math.min(k.n - 1, i0 + 3);
        const p0 = k.pts[Math.max(0, i0)];
        const p1 = k.pts[i1];
        const mid = { x: (p0.x + p1.x) / 2 + Math.sin(now / 70 + j * 2) * 7, y: (p0.y + p1.y) / 2 + Math.cos(now / 60 + j) * 6 };
        g.lineStyle(2.2, color, p0.a * a);
        g.lineBetween(p0.x, p0.y, mid.x, mid.y);
        g.lineBetween(mid.x, mid.y, p1.x, p1.y);
        g.lineStyle(1, core, p0.a * a);
        g.lineBetween(p0.x, p0.y, mid.x, mid.y);
        g.lineBetween(mid.x, mid.y, p1.x, p1.y);
    }
}
/** 残影（整条轨迹的错位重影） */
export function ghostEcho(g, k, color, a = 1, n = 3, dist = 4) {
    for (let e = 1; e <= n; e++) {
        for (let i = 1; i < k.n; i++) {
            g.lineStyle(Math.max(1, k.pts[i].w * (0.3 - e * 0.06)), color, k.pts[i].a * a * (1 - e / (n + 1)));
            g.lineBetween(k.pts[i - 1].x - dist * e, k.pts[i - 1].y, k.pts[i].x - dist * e, k.pts[i].y);
        }
    }
}
/** 分光（棱镜：红绿蓝三层错位） */
export function prismSplit(g, k, a = 1, sep = 4) {
    const cols = [0xff5a6a, 0x5aff9a, 0x5aa8ff];
    cols.forEach((col, idx) => {
        const off = (idx - 1) * sep;
        for (let i = 1; i < k.n; i++) {
            const n = normal(k, i);
            g.lineStyle(Math.max(1, k.pts[i].w * 0.22), col, k.pts[i].a * a * 0.7);
            g.lineBetween(k.pts[i - 1].x + n.x * off, k.pts[i - 1].y + n.y * off, k.pts[i].x + n.x * off, k.pts[i].y + n.y * off);
        }
    });
}
/** 焰舌（一串火舌沿刃烧） */
export function flameTongues(g, k, now, outer, inner, a = 1, n = 7) {
    for (let j = 0; j < n; j++) {
        const i = Math.round(((j + 0.3) / n) * (k.n - 1));
        const p = k.pts[Math.max(0, Math.min(k.n - 1, i))];
        const nrm = normal(k, Math.max(1, i));
        const h = 9 + Math.sin(now / 90 + j * 1.4) * 4;
        const bx = -nrm.x, by = -nrm.y; // 往刃背方向烧
        g.fillStyle(outer, p.a * a);
        g.fillTriangle(p.x + nrm.x * 3, p.y + nrm.y * 3, p.x - nrm.x * 3, p.y - nrm.y * 3, p.x + bx * h, p.y + by * h);
        g.fillStyle(inner, p.a * a * 0.95);
        g.fillTriangle(p.x + nrm.x * 1.4, p.y + nrm.y * 1.4, p.x - nrm.x * 1.4, p.y - nrm.y * 1.4, p.x + bx * h * 0.5, p.y + by * h * 0.5);
    }
}
/** 星点（一列转动的小星） */
export function starRow(g, k, now, color, color2, a = 1, n = 6, r = 2.6) {
    for (let j = 0; j < n; j++) {
        const i = Math.round(((j + 0.5) / n) * (k.n - 1));
        const p = k.pts[Math.max(0, Math.min(k.n - 1, i))];
        const rot = now / 300 + j;
        const vs = [];
        for (let s2 = 0; s2 < 10; s2++) {
            const ang = rot + (s2 / 10) * Math.PI * 2;
            const rr = s2 % 2 === 0 ? r + p.w * 0.12 : (r + p.w * 0.12) * 0.42;
            vs.push({ x: p.x + Math.cos(ang) * rr, y: p.y + Math.sin(ang) * rr });
        }
        g.fillStyle(j % 2 ? color : color2, p.a * a);
        g.fillPoints(vs, true);
    }
}
/** 光环（冲击环 / 音波 / 结界） */
export function ripples(g, x, y, now, color, a = 1, n = 3, maxR = 34, speed = 130) {
    for (let j = 0; j < n; j++) {
        const ph = ((now / speed + j / n) % 1);
        const r = 6 + ph * maxR;
        g.lineStyle(2.2 - ph * 1.2, color, (1 - ph) * a);
        g.save();
        g.translateCanvas(x, y);
        g.scaleCanvas(1, 0.62);
        g.beginPath();
        g.arc(0, 0, r, 0, Math.PI * 2);
        g.strokePath();
        g.restore();
    }
}
/** 裂纹（从一点向外炸开的地面裂纹） */
export function cracks(g, x, y, now, color, a = 0.8, n = 6, len = 20) {
    const grow = 0.7 + 0.3 * ((now / 200) % 1);
    for (let j = 0; j < n; j++) {
        const ang = (j / n) * Math.PI * 2 + 0.3;
        const l = len * grow * (0.7 + (j % 3) * 0.2);
        g.lineStyle(2, color, a);
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(ang) * l * 0.6, y + Math.sin(ang) * l * 0.3);
        g.lineTo(x + Math.cos(ang) * l, y + Math.sin(ang) * l * 0.45);
        g.strokePath();
    }
}
/** 环绕小球（轨道 / 蜂群 / 卫星） */
export function orbiters(g, x, y, now, color, a = 1, n = 4, rx = 18, ry = 9, speed = 500, r = 2) {
    for (let j = 0; j < n; j++) {
        const ang = now / speed + (j / n) * Math.PI * 2;
        g.fillStyle(color, a);
        g.fillCircle(x + Math.cos(ang) * rx, y + Math.sin(ang) * ry, r);
        g.fillStyle(0xffffff, a * 0.5);
        g.fillCircle(x + Math.cos(ang) * rx - 0.6, y + Math.sin(ang) * ry - 0.6, r * 0.4);
    }
}
/** 蛛网 / 网格（从一点张开的网） */
export function webNet(g, x, y, now, color, a = 0.8, r = 20, spokes = 8) {
    const wob = 1 + Math.sin(now / 300) * 0.06;
    g.lineStyle(1.2, color, a);
    for (let j = 0; j < spokes; j++) {
        const ang = (j / spokes) * Math.PI * 2;
        g.lineBetween(x, y, x + Math.cos(ang) * r * wob, y + Math.sin(ang) * r * wob * 0.82);
    }
    for (let ring2 = 1; ring2 <= 3; ring2++) {
        g.beginPath();
        for (let j = 0; j <= spokes; j++) {
            const ang = (j / spokes) * Math.PI * 2;
            const rr = (ring2 / 3.4) * r * wob;
            const px = x + Math.cos(ang) * rr, py = y + Math.sin(ang) * rr * 0.82;
            if (j === 0)
                g.moveTo(px, py);
            else
                g.lineTo(px, py);
        }
        g.strokePath();
    }
}
/** 音符（音乐主题） */
export function notes(g, k, now, color, a = 1, n = 4) {
    for (let j = 0; j < n; j++) {
        const i = Math.round(((j + 0.4) / n) * (k.n - 1));
        const p = k.pts[Math.max(0, Math.min(k.n - 1, i))];
        const ph = now / 900 + j * 1.4;
        const dx = Math.sin(ph) * 8, dy = -Math.abs(Math.cos(ph)) * 8;
        g.fillStyle(color, p.a * a);
        g.fillEllipse(p.x + dx, p.y + dy, 4.4, 3.2);
        g.fillRect(p.x + dx + 1.6, p.y + dy - 7, 1.6, 7);
    }
}
/** 雪片（六角光点） */
export function snowflakes(g, k, now, color, a = 1, n = 5, r = 3) {
    for (let j = 0; j < n; j++) {
        const i = Math.round(((j + 0.3) / n) * (k.n - 1));
        const p = k.pts[Math.max(0, Math.min(k.n - 1, i))];
        const rot = now / 700 + j;
        g.lineStyle(1.4, color, p.a * a);
        for (let s2 = 0; s2 < 3; s2++) {
            const ang = rot + (s2 / 3) * Math.PI;
            g.lineBetween(p.x - Math.cos(ang) * r, p.y - Math.sin(ang) * r, p.x + Math.cos(ang) * r, p.y + Math.sin(ang) * r);
        }
    }
}
/** 命中爆点：环 + 裂纹 + 碎屑（收斩处用） */
export function impact(g, x, y, now, hot, c, c2) {
    ripples(g, x, y, now, c, 0.5 + hot * 0.5, 3, 30 + hot * 14, 110);
    cracks(g, x, y, now, c2, 0.35 + hot * 0.35, 6, 16 + hot * 10);
    for (let j = 0; j < 7; j++) {
        const ang = (j / 7) * Math.PI * 2 + now / 400;
        const d = 8 + hot * 10 + ((now / 90 + j * 10) % 12);
        g.fillStyle(j % 2 ? c : c2, 0.85 - (d / 60));
        g.fillCircle(x + Math.cos(ang) * d, y + Math.sin(ang) * d * 0.7, 2.2 - d / 40);
    }
}
