import { mpoly } from './shared.js';
import { TAU } from './shared.js';
/** 一根羽毛 / 叶片：从 (bx,by) 朝 ang 方向伸出的水滴形（鲲鹏翼、鬃毛共用） */
function feather(g, bx, by, ang, len, wid, c, al = 1) {
    const cos = Math.cos(ang), sin = Math.sin(ang);
    const pts = [];
    const steps = 4;
    for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        pts.push({ x: bx + cos * len * t - sin * wid * Math.sin(t * Math.PI), y: by + sin * len * t + cos * wid * Math.sin(t * Math.PI) });
    }
    for (let k = steps; k >= 0; k--) {
        const t = k / steps;
        pts.push({ x: bx + cos * len * t + sin * wid * Math.sin(t * Math.PI), y: by + sin * len * t - cos * wid * Math.sin(t * Math.PI) });
    }
    g.fillStyle(c, al);
    g.fillPoints(pts, true);
}
/** 一小团云雾 */
function mist(g, x, y, r, al = 0.5) {
    g.fillStyle(0xffffff, al * 0.7);
    g.fillCircle(x - r * 0.7, y + r * 0.2, r * 0.6);
    g.fillCircle(x + r * 0.7, y + r * 0.15, r * 0.65);
    g.fillStyle(0xffffff, al);
    g.fillCircle(x, y, r * 0.8);
}
/**
 * 第一批主题坐骑——**逐款精绘**：分层形体 + 明暗 + 贴名细节 + 动画。
 * （鲲鹏 / 骆驼 / 云朵 / 蛋糕车 / 彩球 / 钢铁战马 / 茶船 / 魔珠 / 骸骨战马 / 摇摇马 / 灯船）
 */
export const MOUNTS_1 = {
    // ── 商队骆驼：双峰 + 行走步态 + 缰绳铜铃 ──
    desCamel: { c: 0xd8a24a, a: 0x8a5a22, draw: (g, now, x, y, f, c, _a) => {
            const gait = Math.sin(now / 300);
            // 四腿：前后两对交替迈步
            g.lineStyle(7, 0xb8873a, 1);
            for (const [dx, ph] of [[-26, 0], [-14, Math.PI], [16, Math.PI], [28, 0]]) {
                const sw = Math.sin(now / 300 + ph) * 5;
                g.lineBetween(x + dx, y - 22, x + dx + sw, y + 2);
                g.fillStyle(0x6a4218, 1);
                g.fillCircle(x + dx + sw, y + 1, 3); // 蹄
            }
            // 身体 + 双峰（峰顶绒毛加深）
            g.fillStyle(c, 1);
            g.fillEllipse(x, y - 24, 80, 36);
            g.fillCircle(x - 16, y - 40, 13);
            g.fillCircle(x + 12, y - 40, 13);
            g.fillStyle(0xc08c38, 0.7);
            g.fillEllipse(x - 16, y - 46, 16, 7);
            g.fillEllipse(x + 12, y - 46, 16, 7);
            // 鞍毯
            g.fillStyle(0xa8324a, 1);
            g.fillRoundedRect(x - 14, y - 34, 28, 14, 3);
            g.lineStyle(1.6, 0xffd45c, 0.9);
            g.lineBetween(x - 14, y - 30, x + 14, y - 30);
            g.lineBetween(x - 14, y - 26, x + 14, y - 26);
            // 颈（弯向上方）+ 头
            g.fillStyle(c, 1);
            g.fillRoundedRect(x + f * 26 - 8, y - 48, 16, 30, 7);
            g.fillEllipse(x + f * 36, y - 52, 28, 16);
            g.fillStyle(0xc08c38, 1);
            g.fillEllipse(x + f * 44, y - 48, 10, 8); // 吻
            g.fillStyle(0x1a1a22, 0.95);
            g.fillCircle(x + f * 38, y - 55, 2.2); // 眼
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(x + f * 37.2, y - 55.8, 0.8);
            g.fillStyle(0x6a4218, 0.9);
            g.fillEllipse(x + f * 30, y - 58, 6, 4); // 耳
            // 缰绳 + 铜铃（随步伐晃）
            g.lineStyle(1.6, 0x8a4a1a, 0.9);
            g.lineBetween(x + f * 30, y - 50, x + f * 22, y - 30);
            const bell = Math.sin(now / 300) * 2;
            g.fillStyle(0xffd45c, 1);
            g.fillCircle(x + f * 22 + bell * 0.3, y - 28 + bell, 3);
            g.fillStyle(0x8a6a1a, 1);
            g.fillRect(x + f * 22 - 1 + bell * 0.3, y - 26 + bell, 2, 1.6);
            // 尾鬃（甩动）
            g.lineStyle(3, 0xb8873a, 1);
            g.lineBetween(x - f * 38, y - 30, x - f * 44 + gait, y - 14);
            g.fillStyle(0x8a5a22, 0.9);
            g.fillCircle(x - f * 44 + gait, y - 13, 3.4);
        } },
    // ── 小云朵：蓬松积云 + 柔光 + 星屑环绕 ──
    nimbCloud: { c: 0xeaf6ff, a: 0x9fd8ff, draw: (g, now, x, y, _f, c, a) => {
            const br = Math.sin(now / 500) * 3;
            const dr = Math.sin(now / 380) * 2;
            // 底层暗面
            g.fillStyle(0xbcdcf2, 0.9);
            g.fillCircle(x - 26, y - 8, 13);
            g.fillCircle(x + 24, y - 8, 14);
            g.fillEllipse(x, y - 4, 62, 14);
            // 主体云团
            g.fillStyle(c, 1);
            g.fillCircle(x - 28, y - 14, 15);
            g.fillCircle(x + 24, y - 15, 16);
            g.fillCircle(x - 4, y - 24 - br, 21);
            g.fillCircle(x + 6, y - 10, 17);
            // 顶部高光
            g.fillStyle(0xffffff, 0.95);
            g.fillCircle(x - 8, y - 30 - br, 8);
            g.fillCircle(x + 12, y - 22, 6);
            g.fillCircle(x - 22, y - 20, 5);
            // 云隙里的星屑（绕圈）
            for (let k = 0; k < 4; k++) {
                const ang = now / 900 + (k / 4) * TAU;
                const sx = x + Math.cos(ang) * 40, sy = y - 14 + Math.sin(ang) * 12;
                g.fillStyle(k % 2 ? a : 0xffffff, 0.5 + 0.5 * Math.sin(now / 300 + k * 2));
                g.fillRect(sx - 2, sy - 0.6, 4, 1.2);
                g.fillRect(sx - 0.6, sy - 2, 1.2, 4);
            }
            // 云影
            g.fillStyle(a, 0.2);
            g.fillEllipse(x, y + 4 + dr * 0.2, 58, 8);
        } },
    // ── 蛋糕车：双层蛋糕 + 淋面 + 草莓 + 蜡烛 ──
    confCake: { c: 0xfff0e0, a: 0xff869c, draw: (g, now, x, y, _f, c, a) => {
            // 车轮（滚动辐条）
            for (const wx of [x - 24, x + 24]) {
                g.fillStyle(0x8a92a2, 1);
                g.fillCircle(wx, y + 2, 8);
                g.fillStyle(0xd0d8e2, 1);
                g.fillCircle(wx, y + 2, 4);
                g.lineStyle(1.4, 0x5a6272, 0.9);
                g.lineBetween(wx - 6, y + 2, wx + 6, y + 2);
            }
            // 底层蛋糕
            g.fillStyle(c, 1);
            g.fillRoundedRect(x - 36, y - 22, 72, 22, 8);
            // 淋面（波浪边）
            g.fillStyle(a, 1);
            g.fillRoundedRect(x - 36, y - 24, 72, 9, 4);
            for (let k = 0; k < 6; k++) {
                const dx = -30 + k * 12;
                g.fillStyle(a, 1);
                g.fillCircle(x + dx, y - 14 + (k % 2) * 2, 3.2);
            }
            // 上层
            g.fillStyle(c, 1);
            g.fillRoundedRect(x - 24, y - 42, 48, 18, 7);
            g.fillStyle(0xffd8e2, 1);
            g.fillRoundedRect(x - 24, y - 44, 48, 8, 4);
            // 草莓两颗
            for (const sx of [x - 14, x + 12]) {
                g.fillStyle(0xe8404a, 1);
                g.fillEllipse(sx, y - 28, 9, 11);
                g.fillStyle(0x4a8a3a, 1);
                g.fillEllipse(sx, y - 34, 5, 3);
                g.fillStyle(0xffffff, 0.5);
                g.fillCircle(sx - 1.6, y - 30, 1);
            }
            // 蜡烛 + 火苗
            for (let k = 0; k < 3; k++) {
                const px = x - 8 + k * 8;
                g.fillStyle(k % 2 ? 0xe8404a : 0x4a90d9, 1);
                g.fillRect(px - 1.3, y - 58, 2.6, 14);
                const fl = 0.6 + 0.4 * Math.sin(now / 120 + k * 2);
                g.fillStyle(0xffd45c, fl);
                g.fillCircle(px, y - 60, 2.8);
                g.fillStyle(0xfff0c0, fl);
                g.fillCircle(px, y - 60, 1.4);
            }
        } },
    // ── 踩球：大彩球 + 星纹滚动 + 底座光 ──
    bigtBall: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, x, y, _f, c, a) => {
            const roll = now / 260;
            const cy = y - 26;
            g.fillStyle(c, 1);
            g.fillCircle(x, cy, 28);
            // 滚动的星纹
            g.save();
            g.translateCanvas(x, cy);
            g.rotateCanvas(roll);
            for (let k = 0; k < 3; k++) {
                const ang = (k / 3) * TAU;
                const sx = Math.cos(ang) * 14, sy = Math.sin(ang) * 14;
                g.fillStyle(a, 0.95);
                const vs = [];
                for (let p = 0; p < 10; p++) {
                    const pa = (p / 10) * TAU;
                    const rr = p % 2 === 0 ? 6 : 2.5;
                    vs.push({ x: sx + Math.cos(pa) * rr, y: sy + Math.sin(pa) * rr });
                }
                g.fillPoints(vs, true);
            }
            g.restore();
            // 赤道环带
            g.lineStyle(3, 0xffffff, 0.75);
            g.beginPath();
            g.arc(x, cy, 28, 0.4, Math.PI - 0.4);
            g.strokePath();
            // 轮缘 + 高光 + 地面光
            g.lineStyle(2.4, a, 0.95);
            g.strokeCircle(x, cy, 28);
            g.fillStyle(0xffffff, 0.5);
            g.fillCircle(x - 9, cy - 11, 5.5);
            g.fillStyle(a, 0.25);
            g.fillEllipse(x, y + 2, 52, 8);
        } },
    // ── 钢铁战马：层叠马铠 + 铆钉 + 红缨盔 ──
    aegisSteed: { c: 0xaab4c2, a: 0xc0392b, draw: (g, now, x, y, f, c, a) => {
            const gait = Math.sin(now / 320);
            // 四条铁腿（带护膝板）
            g.lineStyle(8, 0x8a94a2, 1);
            for (const [dx, ph] of [[-28, 0], [-14, Math.PI], [14, Math.PI], [28, 0]]) {
                const sw = Math.sin(now / 320 + ph) * 4;
                g.lineBetween(x + dx, y - 24, x + dx + sw, y + 2);
                g.fillStyle(0x6a7482, 1);
                g.fillRoundedRect(x + dx + sw - 4, y - 12, 8, 6, 2); // 护膝
                g.fillStyle(0x4a5462, 1);
                g.fillCircle(x + dx + sw, y + 1, 3.4); // 铁蹄
            }
            // 躯干 + 胸甲斜面
            g.fillStyle(c, 1);
            g.fillEllipse(x, y - 24, 82, 36);
            g.fillStyle(0x98a2b2, 1);
            g.fillRoundedRect(x - 34, y - 38, 64, 20, 5); // 大块马铠
            g.lineStyle(1.6, 0x6a7482, 0.9);
            for (let k = 0; k < 3; k++)
                g.lineBetween(x - 24 + k * 20, y - 38, x - 24 + k * 20, y - 18);
            // 铆钉
            g.fillStyle(0xffd45c, 0.9);
            for (let k = 0; k < 4; k++)
                g.fillCircle(x - 28 + k * 18, y - 28, 1.5);
            // 颈甲（分节）+ 头
            g.fillStyle(0x98a2b2, 1);
            for (let k = 0; k < 3; k++)
                g.fillRoundedRect(x + f * (24 + k * 7) - 7, y - 50 + k * 3, 14, 12, 4);
            g.fillStyle(c, 1);
            g.fillEllipse(x + f * 48, y - 46, 30, 17);
            g.fillStyle(0x4a5462, 1);
            g.fillRoundedRect(x + f * 44 - 8, y - 54, 18, 9, 3); // 头盔
            g.fillStyle(0x1a1a22, 0.95);
            g.fillRect(x + f * 52, y - 46, 6, 2.6); // 眼缝
            g.fillStyle(a, 1); // 红缨（飘）
            const pl = Math.sin(now / 240) * 3;
            mpoly(g, [[x + f * 40, y - 54], [x + f * 30, y - 66 + pl], [x + f * 42, y - 62], [x + f * 46, y - 54]], a, 0.95);
            // 铁尾
            g.lineStyle(4, 0x8a94a2, 1);
            g.lineBetween(x - f * 40, y - 30, x - f * 52, y - 18 + gait * 2);
        } },
    // ── 茶船：竹筏 + 茶席 + 茶壶冒热气 + 水痕 ──
    chanBoat: { c: 0x3a8a5a, a: 0xb0713a, draw: (g, now, x, y, _f, c, _a) => {
            const rock = Math.sin(now / 600);
            // 水痕（先画，垫底）
            g.fillStyle(0x6aa8b8, 0.4);
            g.fillEllipse(x, y + 6, 104, 10);
            g.lineStyle(1.4, 0x6aa8b8, 0.6);
            g.lineBetween(x - 52, y + 6, x - 62, y + 6);
            g.lineBetween(x + 52, y + 6, x + 62, y + 6);
            g.save();
            g.translateCanvas(x, y - 8 + rock * 1.5);
            g.rotateCanvas(rock * 0.03);
            // 竹排（两排捆扎）
            for (let k = 0; k < 5; k++)
                g.fillRoundedRect(-42 + k * 19, -4, 12, 16, 5);
            g.lineStyle(2, 0x6a4218, 0.9);
            g.lineBetween(-40, -2, 40, -2);
            g.lineBetween(-40, 8, 40, 8);
            // 竹席茶台
            g.fillStyle(0x8fbf6a, 1);
            g.fillRoundedRect(-26, -10, 52, 8, 3);
            g.lineStyle(1, 0x5a8a44, 0.8);
            for (let k = 0; k < 6; k++)
                g.lineBetween(-24 + k * 9, -10, -24 + k * 9, -2);
            // 茶壶
            g.fillStyle(c, 1);
            g.fillEllipse(-12, -16, 18, 11);
            g.fillStyle(0x2f7a4a, 1);
            g.fillRoundedRect(-16, -24, 9, 7, 2.5); // 壶盖
            g.lineStyle(2, 0x2f7a4a, 1);
            g.lineBetween(-3, -16, 3, -20); // 壶嘴
            g.lineBetween(-21, -16, -25, -13); // 壶柄
            // 两只茶杯
            for (const cx2 of [8, 20]) {
                g.fillStyle(0xe8e2d0, 1);
                g.fillEllipse(cx2, -14, 9, 6);
                g.fillStyle(0xb0893a, 0.8);
                g.fillEllipse(cx2, -15, 5, 2.4); // 茶汤
            }
            // 热气（两缕上飘）
            for (let k = 0; k < 2; k++) {
                const st = ((now / 900) + k * 0.5) % 1;
                g.fillStyle(0xffffff, 0.4 * (1 - st));
                g.fillCircle(-12 + k * 4 + Math.sin(st * 6) * 3, -26 - st * 16, 2.6 + st * 3);
            }
            g.restore();
        } },
    // ── 浮空魔珠：星云内核 + 双层轨道 + 符文 ──
    arcanOrb: { c: 0xb46cff, a: 0xffd45c, draw: (g, now, x, y, _f, c, a) => {
            const fl = y - 30 + Math.sin(now / 420) * 5;
            // 外光晕
            g.fillStyle(c, 0.16);
            g.fillCircle(x, fl, 40);
            g.fillStyle(c, 0.3);
            g.fillCircle(x, fl, 32);
            // 球体
            g.fillStyle(c, 0.75);
            g.fillCircle(x, fl, 25);
            // 内部星云（旋转的三团）
            g.save();
            g.translateCanvas(x, fl);
            g.rotateCanvas(now / 1400);
            for (let k = 0; k < 3; k++) {
                const ang = (k / 3) * TAU;
                g.fillStyle(0xe8d8ff, 0.5);
                g.fillEllipse(Math.cos(ang) * 10, Math.sin(ang) * 8, 16, 9);
            }
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(-6, -7, 5);
            g.restore();
            // 球面高光 + 轮廓
            g.lineStyle(2, 0xe8d8ff, 0.9);
            g.strokeCircle(x, fl, 25);
            g.fillStyle(0xffffff, 0.35);
            g.fillCircle(x - 9, fl - 10, 5);
            // 内轨 + 外轨（各带一颗星）
            g.lineStyle(1.6, a, 0.7);
            g.strokeEllipse(x, fl, 62, 22);
            const o1 = now / 700;
            g.fillStyle(a, 1);
            g.fillCircle(x + Math.cos(o1) * 31, fl + Math.sin(o1) * 11, 2.8);
            g.lineStyle(1.2, a, 0.45);
            g.strokeEllipse(x, fl, 80, 30);
            const o2 = -now / 500 + 2;
            g.fillStyle(0xe8d8ff, 0.9);
            g.fillCircle(x + Math.cos(o2) * 40, fl + Math.sin(o2) * 15, 2.2);
            // 环绕符文（菱形小光块）
            for (let k = 0; k < 3; k++) {
                const ang = now / 600 + (k / 3) * TAU;
                const rx = x + Math.cos(ang) * 34, ry = fl + Math.sin(ang) * 12;
                g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 250 + k * 2));
                g.fillRect(rx - 2, ry - 4, 4, 8);
                g.fillRect(rx - 4, ry - 2, 8, 4);
            }
            // 悬浮投影
            g.fillStyle(c, 0.22);
            g.fillEllipse(x, y + 2, 52, 9);
        } },
    // ── 骸骨战马：外露骨架 + 绿火眼窝 + 椎骨马尾（保留原有精细款，微调） ──
    relicBone: { c: 0xd8c8a0, a: 0x5affd8, draw: (g, now, x, y, f, c, a) => {
            g.fillStyle(c, 1);
            // 四条骨腿（两对交替迈步）
            for (const [dx, ph] of [[-24, 0], [-12, 2], [12, 2], [24, 0]]) {
                const sw = Math.sin(now / 200 + ph) * 4;
                g.lineStyle(5, c, 0.95);
                g.lineBetween(x + dx, y - 26, x + dx + sw, y + 2);
            }
            // 肋骨胸腹
            g.lineStyle(2.6, c, 0.95);
            for (let k = 0; k < 5; k++) {
                g.beginPath();
                g.arc(x - 8 + k * 9, y - 30, 13 - Math.abs(k - 2) * 2, -Math.PI * 0.8, Math.PI * 0.8);
                g.strokePath();
            }
            // 脊椎
            g.lineStyle(4, c, 1);
            g.lineBetween(x - 30, y - 38, x + 26, y - 40);
            // 颈骨 + 头骨
            g.lineStyle(5, c, 1);
            g.lineBetween(x + 26, y - 40, x + f * 40, y - 62);
            g.fillStyle(c, 1);
            g.fillEllipse(x + f * 48, y - 66, 24, 14);
            g.fillStyle(0x1a1a22, 1);
            g.fillRect(x + f * 54, y - 64, 10, 4); // 颌骨阴影
            const fl = 0.6 + 0.4 * Math.sin(now / 180);
            g.fillStyle(a, fl);
            g.fillCircle(x + f * 50, y - 68, 3.2); // 绿火眼窝
            g.fillStyle(a, fl * 0.5);
            g.fillCircle(x + f * 50, y - 68, 6); // 眼火外晕
            // 椎骨马尾
            for (let k = 0; k < 5; k++) {
                const t = k / 5;
                const tx = x - 30 - t * 22 + Math.sin(now / 300 + k) * 3;
                const ty = y - 38 + Math.sin(t * 2.4 + now / 400) * 8;
                g.fillStyle(c, 0.95);
                g.fillCircle(tx, ty, 3.4 - t);
            }
            g.fillStyle(0x8a7a5a, 0.6);
            g.fillCircle(x - 4, y - 30, 5); // 心口残影
        } },
    // ── 摇摇马：木刻摇马 + 鬃毛弧 + 摇杆 ──
    playHorse: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, x, y, f, c, a) => {
            const rock = Math.sin(now / 500) * 0.09;
            g.save();
            g.translateCanvas(x, y - 12);
            g.rotateCanvas(rock);
            // 摇杆（厚弧）+ 支架
            g.lineStyle(6, a, 1);
            g.beginPath();
            g.arc(0, 22, 32, Math.PI + 0.25, TAU - 0.25);
            g.strokePath();
            g.fillStyle(0x8a5a2a, 1);
            g.fillRect(-26, 8, 52, 6);
            g.fillRect(-6, 0, 12, 9);
            // 尾巴（后掠弧）
            g.lineStyle(4, 0xffb0a0, 1);
            g.beginPath();
            g.arc(-f * 28, -8, 10, -2.6, -0.8);
            g.strokePath();
            // 身体 + 脖子 + 头
            g.fillStyle(c, 1);
            g.fillEllipse(0, -4, 58, 26);
            g.fillRoundedRect(f * 16 - 6, -26, 13, 22, 6);
            g.fillCircle(f * 24, -22, 12);
            g.fillStyle(0xc2384a, 0.6);
            g.fillEllipse(-4, 4, 40, 10); // 腹部阴影
            // 木刻鬃毛（一排半圆）
            g.fillStyle(a, 1);
            for (let k = 0; k < 4; k++)
                g.fillCircle(f * (10 - k * 7), -30 + k * 1.5, 4.5 - k * 0.4);
            // 耳 + 眼 + 鞍
            g.fillStyle(0x8a5a2a, 1);
            mpoly(g, [[f * 28, -30], [f * 31, -38], [f * 33, -30]], 0x8a5a2a, 1);
            g.fillStyle(0x1a1a22, 0.95);
            g.fillCircle(f * 28, -24, 2);
            g.fillStyle(0xffffff, 0.85);
            g.fillCircle(f * 27.2, -24.8, 0.7);
            g.fillStyle(a, 1);
            g.fillRoundedRect(-10, -16, 20, 8, 3); // 鞍
            g.lineStyle(1.6, 0x8a6a1a, 0.9);
            g.strokeRoundedRect(-10, -16, 20, 8, 3);
            g.restore();
        } },
    // ── 灯船：红灯笼串 + 帆 + 水面倒影 ──
    yuanBoat: { c: 0xe8404a, a: 0xffd45c, draw: (g, now, x, y, f, c, _a) => {
            const rock = Math.sin(now / 600) * 1.6;
            // 水痕 + 灯影
            g.fillStyle(0x6a7ab8, 0.35);
            g.fillEllipse(x, y + 7, 100, 9);
            g.fillStyle(0xe8404a, 0.3);
            g.fillEllipse(x - 30, y + 7, 12, 4);
            g.save();
            g.translateCanvas(x, y - 6 + rock);
            g.rotateCanvas(Math.sin(now / 600) * 0.03);
            // 船身（弯月形）
            mpoly(g, [[-48, -6], [48, -6], [34, 8], [-34, 8]], 0x8a5a2a);
            g.lineStyle(2, 0x6a4218, 0.9);
            g.lineBetween(-48, -6, 48, -6);
            // 船头装饰
            g.fillStyle(0xffd45c, 1);
            g.fillCircle(-f * 44, -8, 3);
            // 桅杆 + 帆（鼓起）
            g.fillStyle(0x8a5a2a, 1);
            g.fillRect(x * 0 + -2, -52, 5, 46);
            mpoly(g, [[3, -48], [30, -36], [34, -20], [3, -14]], 0xf0d8a0, 0.95);
            g.lineStyle(1.4, 0xc9a86a, 0.9);
            g.lineBetween(6, -44, 30, -34);
            g.lineBetween(6, -30, 32, -22);
            // 桅顶红灯笼
            g.lineStyle(1.4, 0x6a4218, 1);
            g.lineBetween(0, -52, 0, -58);
            g.fillStyle(c, 1);
            g.fillEllipse(0, -64, 12, 15);
            g.fillStyle(0xffe89a, 0.7 + 0.3 * Math.sin(now / 300));
            g.fillEllipse(0, -64, 5, 9);
            g.fillStyle(0xffd45c, 1);
            g.fillRect(-2.6, -72, 5.2, 2.4); // 顶盖
            g.fillRect(-2, -57, 4, 2); // 灯穗
            // 船尾小灯笼
            g.fillStyle(c, 0.95);
            g.fillEllipse(-34, -20, 9, 11);
            g.fillStyle(0xffe89a, 0.6 + 0.3 * Math.sin(now / 260 + 1));
            g.fillEllipse(-34, -20, 4, 7);
            g.restore();
        } },
    // ── 鲲鹏：巨翼九羽 + 鲸尾双叶 + 鲤须 + 踏云（重点重做） ──
    shanMountKun: { c: 0x4aa8d8, a: 0xd8e8ff, draw: (g, now, x, y, f, c, a) => {
            const glide = Math.sin(now / 700) * 4;
            const yy = y - 26 + glide;
            const flap = Math.sin(now / 520);
            const dark = 0x2f6a9a, deep = 0x24507a, light = 0x9fd4ee, pale = 0xd8eef8;
            // —— 脚下踏云 ——
            mist(g, x - 24, y - 2, 11, 0.45);
            mist(g, x + 20, y, 10, 0.4);
            mist(g, x - 2, y + 3, 12, 0.5);
            // —— 远翼（身后，深色，反相扇动）——
            const frx = x - f * 6, fry = yy - 8 - flap * 7;
            const farBase = f === 1 ? -Math.PI + 1.1 : -1.1;
            for (let k = 0; k < 5; k++) {
                feather(g, frx, fry, farBase - f * k * 0.26, 54 - k * 7, 7, k % 2 ? deep : dark, 0.95);
            }
            // —— 鲲尾（鲸尾双叶，缓摆）——
            const tail = Math.sin(now / 650) * 7;
            mpoly(g, [
                [x - f * 32, yy - 2],
                [x - f * 52, yy - 20 + tail], [x - f * 62, yy - 24 + tail],
                [x - f * 50, yy - 2 + tail * 0.5], [x - f * 62, yy + 16 + tail],
                [x - f * 52, yy + 12 + tail],
            ], dark, 1);
            // —— 身体 ——
            g.fillStyle(c, 1);
            g.fillEllipse(x, yy, 90, 32);
            // 背脊深化
            mpoly(g, [[x - 42, yy - 4], [x - 16, yy - 15], [x + 18, yy - 14], [x + 42, yy - 4], [x + 18, yy - 9], [x - 18, yy - 10]], deep, 0.5);
            // 腹部提亮
            g.fillStyle(light, 0.9);
            g.fillEllipse(x + f * 2, yy + 9, 68, 15);
            g.fillStyle(pale, 0.7);
            g.fillEllipse(x + f * 8, yy + 7, 40, 9);
            // 背鳍 + 侧鳍（划水）
            mpoly(g, [[x - 8, yy - 14], [x + 2, yy - 27], [x + 14, yy - 13]], dark, 1);
            mpoly(g, [[x - f * 8, yy + 6], [x - f * 24, yy + 19 + Math.sin(now / 400) * 3], [x - f * 2, yy + 11]], dark, 0.95);
            // —— 头部（朝向 f）——
            g.fillStyle(c, 1);
            g.fillCircle(x + f * 36, yy - 4, 16);
            g.fillEllipse(x + f * 47, yy + 1, 20, 13);
            // 嘴缝（弧线）
            g.lineStyle(2, deep, 0.85);
            g.beginPath();
            g.arc(x + f * 44, yy - 1, 9, f === 1 ? 0.5 : Math.PI - 1.6, f === 1 ? 1.6 : Math.PI - 0.5);
            g.strokePath();
            // 眼（温和的大眼）
            g.fillStyle(0xffffff, 1);
            g.fillCircle(x + f * 38, yy - 8, 4.6);
            g.fillStyle(0x1a2a3a, 1);
            g.fillCircle(x + f * 39.4, yy - 8, 2.4);
            g.fillStyle(0xffffff, 0.95);
            g.fillCircle(x + f * 38.6, yy - 9, 0.9);
            // 鲤须两根（飘动）
            g.lineStyle(1.6, dark, 0.9);
            for (let k = 0; k < 2; k++) {
                const wav = Math.sin(now / 350 + k * 1.8) * 3;
                g.lineBetween(x + f * 52, yy + 2 + k * 3, x + f * 58, yy + 4 + k * 5 + wav);
                g.lineBetween(x + f * 58, yy + 4 + k * 5 + wav, x + f * 62, yy + 2 + k * 7 + wav * 1.5);
            }
            // —— 近翼（身前，亮色，五羽 + 羽轴）——
            const nrx = x + f * 8, nry = yy - 10 + flap * 9;
            const nearBase = f === 1 ? -1.15 : -Math.PI + 1.15;
            for (let k = 0; k < 5; k++) {
                const flen = 66 - k * 7;
                feather(g, nrx, nry, nearBase + f * k * 0.27, flen, 8.5, k % 2 ? light : pale, 1);
                // 羽轴
                const ax = nrx + Math.cos(nearBase + f * k * 0.27) * flen * 0.55;
                const ay = nry + Math.sin(nearBase + f * k * 0.27) * flen * 0.55;
                g.lineStyle(1, 0x8fc4e8, 0.7);
                g.lineBetween(nrx, nry, ax, ay);
            }
            // 翼根覆盖
            g.fillStyle(c, 1);
            g.fillEllipse(nrx, nry + 2, 22, 12);
            // —— 翼尖星光 ——
            for (let k = 0; k < 3; k++) {
                const ang = nearBase + f * (0.1 + k * 0.3);
                const sx = nrx + Math.cos(ang) * (60 + Math.sin(now / 300 + k * 2) * 6);
                const sy = nry + Math.sin(ang) * (60 + Math.sin(now / 300 + k * 2) * 6);
                g.fillStyle(a, 0.4 + 0.5 * Math.abs(Math.sin(now / 280 + k * 1.7)));
                g.fillRect(sx - 2.4, sy - 0.8, 4.8, 1.6);
                g.fillRect(sx - 0.8, sy - 2.4, 1.6, 4.8);
            }
        } },
};
