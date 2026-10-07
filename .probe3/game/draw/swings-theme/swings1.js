import { ghostEcho, hairLine, dashLine, bladeWedge, edgeHairs, coilBand, cometBand, puffs, orbiters, drips, beads, shards, starRow, petals, bolts, embers, inkDots, plates, crystals, flameTongues, sawTeeth, bones, snowflakes, sparks, ripples, scales, cracks, glowHalo, tipOf, impact, } from './vocab.js';
/**
 * 第一批主题挥拍拖尾（22 款）。
 *
 * 重绘原则：**每款自己决定「这一刀长什么样」**——
 * 剪影（刃 / 彗尾 / 缠带 / 细线 / 断续脉冲…）互不相同，
 * 再叠自己材质的质感与动效，所以不会再出现「同一条带子换个颜色」的观感。
 */
export const SWINGS_1 = {
    // 冲刺斩：被拉长的极速残影 + 一道过曝的细刃
    runSwing: { a: 0x39d0a0, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, c, 0.14);
            ghostEcho(g, k, c, 0.6, 4, 10); // 拉长的速度残影
            dashLine(g, k, now, 0xffffff, 0.5, 6, 0.14);
            hairLine(g, k, a, 0.95, 0.16);
            sparks(g, k, now, a, 0.9, 9, 26); // 被风甩出的火花
            const t = tipOf(k);
            ripples(g, t.x, t.y, now, 0xffffff, 0.4 + hot * 0.4, 2, 20 + hot * 8, 80);
        } },
    // 弯刀斩：标准弯月刀身 + 刃口扬沙 + 收刀处一钩月
    desSwing: { a: 0xffd45c, draw: (g, now, hot, k, _c, a) => {
            glowHalo(g, k, 0xffd45c, 0.12);
            bladeWedge(g, k, 0x8a6a2a, 0xffe8b0, 0.95);
            edgeHairs(g, k, 0xf0dcb0, 0.5, 5, 1); // 刃口扬起的细沙
            const t = tipOf(k);
            // 收刀处：一钩弯月
            g.lineStyle(2.6, 0xfff4d0, 0.9);
            g.beginPath();
            g.arc(t.x - 6, t.y - 4, 9, -0.6, 1.9);
            g.strokePath();
            impact(g, t.x, t.y, now, hot, a, 0x8a6a2a);
        } },
    // 云涡斩：一条云带绕成涡 + 翻滚云团 + 追着转的云珠
    nimbSwing: { a: 0xffffff, draw: (g, now, _hot, k, c, a) => {
            glowHalo(g, k, 0xe8f4ff, 0.12);
            coilBand(g, k, c, 0.75, 3, 2.4); // 螺旋云带
            puffs(g, k, now, 0xffffff, 0.9, 9, 12); // 翻滚的云
            puffs(g, k, now, 0xc0d4e8, 0.5, 6, 15);
            orbiters(g, tipOf(k).x, tipOf(k).y, now, a, 0.9, 4, 16, 8, 600, 2.2);
        } },
    // 糖霜斩：厚奶油刃 + 挂下来的糖霜滴 + 撒在刃上的糖粒
    confSwing: { a: 0xff869c, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xffc0d0, 0.16);
            cometBand(g, k, c, 0.85, 1.2); // 厚奶油
            cometBand(g, k, 0xfff8f0, 0.85, 0.5);
            drips(g, k, now, 0xfff8f0, 0xffffff, 0.85, 5); // 挂下的糖霜
            beads(g, k, now, a, 0.9, 1.8, 1, 2); // 糖粒
            const t = tipOf(k);
            impact(g, t.x, t.y, now, hot, 0xffffff, a);
        } },
    // 彩纸斩：崩飞的彩纸片 + 四色星 + 花瓣状的纸屑
    bigtSwing: { a: 0xffd45c, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xffd45c, 0.12);
            hairLine(g, k, 0xffffff, 0.7, 0.18); // 一条细彩带
            shards(g, k, now, a, 0.9, 7, 10, 2.4);
            shards(g, k, now, 0x4ac8ff, 0.8, 6, 12, -2);
            starRow(g, k, now, 0xffffff, 0xff869c, 0.85, 6, 2.6);
            petals(g, k, now, 0x8fd45a, 0.6, 5, 3.6);
            void hot;
            void c;
        } },
    // 雷霆斩：暗刃 + 缠绕的多股电弧 + 冷却中的余烬
    aegisSwing: { a: 0xc0392b, draw: (g, now, hot, k, _c, a) => {
            glowHalo(g, k, 0x8ab0ff, 0.16);
            bladeWedge(g, k, 0x2a2e36, 0x5a6472, 0.95); // 暗铁刃
            bolts(g, k, now, 0xffd45c, 0xffffff, 0.95, 5);
            bolts(g, k, now, a, 0xffd45c, 0.6, 3);
            embers(g, k, now, 0xffd45c, 0x4a3a2a, 0.8, 7);
            const t = tipOf(k);
            impact(g, t.x, t.y, now, hot, 0xffd45c, 0x2a2e36);
        } },
    // 水墨斩：浓墨一笔 + 边缘飞白 + 末端甩出的墨点
    chanSwing: { a: 0x8fd45a, draw: (g, now, hot, k, _c, a) => {
            glowHalo(g, k, 0x9aa8b8, 0.08);
            cometBand(g, k, 0x2a2e36, 0.9, 1.5); // 浓墨主笔
            cometBand(g, k, 0x4a5058, 0.6, 0.8);
            edgeHairs(g, k, 0x8a8a92, 0.5, 6, 1); // 飞白
            inkDots(g, k, 0x2a2e36, 0.8, 2); // 墨点
            embers(g, k, now, a, 0x2a2e36, 0.5, 5);
            void hot;
        } },
    // 星辉斩：紫刃 + 一列飞转的星 + 环绕的星尘
    arcanSwing: { a: 0xffd45c, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0x9a7bff, 0.18);
            starRow(g, k, now, a, 0xffffff, 0.95, 7, 3.2);
            plates(g, k, now, 0x5a3aa0, 0.7, 5, 6); // 魔法阵碎片
            sparkle(g, k, now);
            orbiters(g, tipOf(k).x, tipOf(k).y, now, 0xe8d8ff, 0.9, 5, 18, 9, 520, 2);
            void c;
            void hot;
        } },
    // 沙尘斩：翻卷的沙团 + 埋在沙里露出的化石棱晶
    relicSwing: { a: 0xb8a880, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xd8c8a0, 0.12);
            puffs(g, k, now, 0xd8c08a, 0.85, 10, 13);
            puffs(g, k, now, 0x8a6a3a, 0.5, 7, 17);
            crystals(g, k, now, 0xf0e8d0, 0.8, 4, 8); // 化石棱晶
            inkDots(g, k, 0x8a6a3a, 0.5, 3);
            void c;
            void hot;
            void a;
        } },
    // 星彩斩：四色大星沿弧排开 + 糖纸般的碎屑
    playSwing: { a: 0x9effd0, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xffffff, 0.14);
            starRow(g, k, now, c, a, 1, 8, 3.6);
            starRow(g, k, now + 300, 0xff869c, 0x4ac8ff, 0.8, 5, 2.4);
            shards(g, k, now, 0xffffff, 0.7, 5, 10, 2);
            void hot;
        } },
    // 焰火斩：沿刃一串炸开的小烟花 + 上升火星 + 冲击环
    yuanSwing: { a: 0xffd45c, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xff8a3c, 0.16);
            cometBand(g, k, 0x8a3a1a, 0.7, 0.9);
            flameTongues(g, k, now, 0xff8a3c, 0xffe89a, 0.8, 6);
            sparks(g, k, now, 0xffd45c, 0.9, 9, 24);
            const t = tipOf(k);
            firework(g, t.x, t.y, now, c, a);
            impact(g, t.x, t.y, now, hot, 0xffd45c, 0xff8a3c);
        } },
    // 山海斩：墨青浪为刃、白沫为锋、灵气沿刃升腾，收斩处卷起浪头
    shanSwing: { a: 0xff8a3c, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0x2a6a7a, 0.14);
            cometBand(g, k, 0x1a4a5a, 0.75, 1.3); // 墨青浪体
            cometBand(g, k, c, 0.7, 0.55); // 亮浪面
            beads(g, k, now, 0xffffff, 0.85, 2.2, 1, 2.5); // 浪尖白沫
            edgeHairs(g, k, 0x9fe8c0, 0.6, 7, 1); // 升腾灵气
            sparks(g, k, now, 0x9fe8c0, 0.8, 7, 20);
            const t = tipOf(k);
            // 卷起的浪头
            g.lineStyle(2.4, 0xffffff, 0.85);
            g.beginPath();
            g.arc(t.x, t.y, 8, now / 200, now / 200 + 2.6);
            g.strokePath();
            impact(g, t.x, t.y, now, hot, a, 0x1a4a5a);
        } },
    // 锚爪斩：三道并排爪痕 + 铁链感的一节节链环
    pirateSwing: { a: 0xe8c86a, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0x8a5a2a, 0.14);
            bones(g, k, 0x6a6a72, 0.85, 2.2); // 链环
            for (let i = 1; i < k.n - 1; i += 3) { // 三道爪痕
                const p = k.pts[i];
                for (const off of [-4, 0, 4]) {
                    g.lineStyle(1.8, 0x1a1a22, k.pts[i].a * 0.5);
                    g.lineBetween(p.x + off - 1, p.y - 7, p.x + off + 1, p.y + 7);
                    g.lineStyle(1, 0xf0e0b0, k.pts[i].a * 0.7);
                    g.lineBetween(p.x + off - 1, p.y - 7, p.x + off + 1, p.y + 7);
                }
            }
            impact(g, tipOf(k).x, tipOf(k).y, now, hot, a, 0x6a6a72);
            void c;
        } },
    // 齿轮斩：一排转动的齿轮 + 蒸汽 + 甩出的齿轮碎片
    steamSwing: { a: 0xffb03a, draw: (g, now, hot, k, c, _a) => {
            glowHalo(g, k, 0xffb03a, 0.14);
            plates(g, k, now, 0x8a92a8, 0.9, 6, 7.5); // 齿轮盘
            for (let i = 2; i < k.n - 1; i += 4) { // 齿轮齿
                const p = k.pts[i];
                const rot = now / 200 + i;
                for (let s = 0; s < 8; s++) {
                    const ang = rot + (s / 8) * Math.PI * 2;
                    g.lineStyle(1.4, 0x5a6472, p.a * 0.8);
                    g.lineBetween(p.x + Math.cos(ang) * 6, p.y + Math.sin(ang) * 6, p.x + Math.cos(ang) * 8.4, p.y + Math.sin(ang) * 8.4);
                }
            }
            puffs(g, k, now, 0xdfe6f0, 0.8, 8, 13);
            shards(g, k, now, 0x8a92a8, 0.7, 5, 9, 2);
            void c;
            void hot;
        } },
    // 轨道斩：刃外一层轨道环 + 环上卫星 + 星轨尾迹
    astroSwing: { a: 0x9fd8ff, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0x9fd8ff, 0.16);
            starRow(g, k, now, 0xffffff, a, 0.85, 5, 2.2);
            const m = k.pts[Math.floor(k.n / 2)];
            // 双层轨道环
            for (const [r, sp] of [[16, 1], [22, -1]]) {
                g.lineStyle(1.4, c, 0.5);
                g.save();
                g.translateCanvas(m.x, m.y);
                g.scaleCanvas(1, 0.5);
                g.beginPath();
                g.arc(0, 0, r, 0, Math.PI * 2);
                g.strokePath();
                g.restore();
                orbiters(g, m.x, m.y, now * sp, a, 0.9, 3, r, r * 0.5, 500, 2.2);
            }
            const t = tipOf(k);
            ripples(g, t.x, t.y, now, 0x9fd8ff, 0.4 + hot * 0.3, 2, 22, 110);
        } },
    // 撕咬斩：巨大的兽齿剪影 + 甲鳞 + 一路余烬
    juraSwing: { a: 0x9fe86a, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0x5a7a3a, 0.14);
            cometBand(g, k, 0x3a5a2a, 0.85, 1.15); // 兽颌主体
            sawTeeth(g, k, 0xf0f4e0, 0.95, 11, 1); // 巨齿
            sawTeeth(g, k, 0xd8e8b0, 0.7, 7, 2);
            scales(g, k, 0x2a4a1a, 0.7, 3.4, 2);
            embers(g, k, now, a, 0x4a3a2a, 0.7, 6);
            impact(g, tipOf(k).x, tipOf(k).y, now, hot, 0xf0f4e0, 0x3a5a2a);
            void c;
        } },
    // 菌伞斩：沿刃一朵朵小菌伞 + 飘散的孢子 + 湿气
    mushSwing: { a: 0xffb7d5, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xffb7d5, 0.12);
            petals(g, k, now, c, 0.9, 6, 5); // 菌伞（伞盖朝外）
            beads(g, k, now, 0xfff0f4, 0.8, 1.6, 1, 3); // 孢子
            puffs(g, k, now, 0xd8e8d0, 0.45, 6, 10); // 林间湿气
            starRow(g, k, now, a, 0xffffff, 0.6, 4, 2);
            void hot;
        } },
    // 潮汐斩：一层层涌过的浪脊 + 挂下的水珠 + 浪环
    tropicSwing: { a: 0x5fe8d0, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0x2a8a9a, 0.14);
            coilBand(g, k, 0x1a6a8a, 0.7, 2, 2.2); // 涌动的浪
            coilBand(g, k, c, 0.8, -2, 1.6);
            // 一层层浪脊（半圆）
            for (let i = 2; i < k.n - 1; i += 3) {
                const p = k.pts[i];
                g.lineStyle(1.8, 0xffffff, p.a * 0.8);
                g.beginPath();
                g.arc(p.x, p.y + 3, 4.4, Math.PI, Math.PI * 2);
                g.strokePath();
            }
            drips(g, k, now, 0x8ae8ff, 0xffffff, 0.7, 4);
            impact(g, tipOf(k).x, tipOf(k).y, now, hot, 0xffffff, 0x1a6a8a);
            void a;
        } },
    // 断骨斩：一节节白骨拼成的刃 + 崩落的骨屑
    cryptSwing: { a: 0x9fd8a0, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0x9fd8a0, 0.12);
            bones(g, k, 0xf0ead8, 0.95, 2.6); // 骨节
            for (let i = 1; i < k.n - 1; i += 3) { // 骨刺
                const p = k.pts[i];
                g.fillStyle(0xd8d0b8, p.a * 0.9);
                g.fillTriangle(p.x - 2, p.y - 3, p.x + 2, p.y - 3, p.x, p.y - 9 - p.w * 0.2);
            }
            shards(g, k, now, 0xf0ead8, 0.7, 5, 8, 1.6); // 骨屑
            embers(g, k, now, a, 0x3a4a3a, 0.5, 5);
            void c;
            void hot;
        } },
    // 铃铛斩：一串会晃的铃 + 飘下的雪花 + 环绕的铃光
    festivSwing: { a: 0xffd45c, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xffd45c, 0.16);
            beads(g, k, now, a, 0.95, 2.8, 1, 5); // 晃动的铃
            for (let i = 1; i < k.n - 1; i += 3) { // 铃的光晕
                const p = k.pts[i];
                g.lineStyle(1, 0xffffff, p.a * 0.4);
                g.strokeCircle(p.x, p.y, 4.4 + Math.sin(now / 120 + i) * 1.4);
            }
            snowflakes(g, k, now, 0xffffff, 0.8, 5, 3.4);
            orbiters(g, tipOf(k).x, tipOf(k).y, now, 0xffffff, 0.9, 4, 14, 7, 560, 1.8);
            void c;
            void hot;
        } },
    // 快刀斩：极薄极亮的一道 + 相位断线 + 收刀的小星
    sushiSwing: { a: 0xfff0d0, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, c, 0.12);
            hairLine(g, k, 0xffffff, 1, 0.09);
            dashLine(g, k, now, a, 0.6, 5, 0.1);
            const t = tipOf(k);
            starRow(g, k, now, 0xffffff, a, 0.8, 3, 2);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(t.x, t.y, 2 + hot * 2.4);
            ripples(g, t.x, t.y, now, 0xffffff, 0.3 + hot * 0.3, 2, 16, 80);
        } },
    // 拔枪斩：枪口火光 + 硝烟 + 子弹破空的热痕与裂纹
    wildSwing: { a: 0xffd45c, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0x8a8a92, 0.12);
            puffs(g, k, now, 0xd8d8d8, 0.8, 9, 14); // 硝烟
            cometBand(g, k, c, 0.5, 0.55); // 破空热痕
            sparks(g, k, now, 0xffd45c, 0.9, 8, 20);
            for (let i = 2; i < k.n - 1; i += 4) {
                cracks(g, k.pts[i].x, k.pts[i].y + 6, now, 0x2a2a30, 0.35, 3, 9);
            }
            const t = tipOf(k);
            muzzle(g, t.x, t.y, now, a);
            impact(g, t.x, t.y, now, hot, 0xffd45c, 0xd8d8d8);
        } },
};
/** 星辉斩专用：沿刃漂浮的细碎星尘 */
function sparkle(g, k, now) {
    for (let i = 1; i < k.n - 1; i += 2) {
        const p = k.pts[i];
        const tw = Math.abs(Math.sin(now / 260 + i));
        g.fillStyle(0xffffff, p.a * tw * 0.9);
        g.fillRect(p.x - 2.4, p.y - 0.4, 4.8, 0.8);
        g.fillRect(p.x - 0.4, p.y - 2.4, 0.8, 4.8);
    }
}
/** 焰火斩专用：一朵炸开的小烟花 */
function firework(g, x, y, now, c, a) {
    const ph = (now / 500) % 1;
    for (let s = 0; s < 8; s++) {
        const ang = (s / 8) * Math.PI * 2 + now / 300;
        const d = 4 + ph * 10;
        g.fillStyle(s % 2 ? c : a, (1 - ph) * 0.9);
        g.fillCircle(x + Math.cos(ang) * d, y + Math.sin(ang) * d, 1.6 * (1 - ph) + 0.4);
    }
}
/** 拔枪斩专用：枪口焰 */
function muzzle(g, x, y, now, a) {
    const fl = 0.7 + 0.3 * Math.sin(now / 60);
    g.fillStyle(a, 0.7 * fl);
    g.fillPoints([
        { x: x, y: y - 4 }, { x: x + 12, y: y }, { x: x, y: y + 4 },
    ], true);
    g.fillStyle(0xffffff, fl);
    g.fillCircle(x + 2, y, 2.4);
}
