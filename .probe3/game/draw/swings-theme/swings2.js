import { bladeWedge, cometBand, coilBand, flameTongues, drips, embers, puffs, petals, plates, shards, starRow, ripples, bolts, orbiters, ghostEcho, dashLine, hairLine, inkDots, feathers, snowflakes, sparks, sawTeeth, bones, glowHalo, tipOf, impact, } from './vocab.js';
/** 第二批主题挥拍拖尾（20 款）——同样一款一套剪影，不再共用底光带 */
export const SWINGS_2 = {
    // 熔岩核心：烧红的岩刃，缝里透光，一路滴熔铁与火星
    vulcSwing: { a: 0xff6a2a, draw: (g, now, hot, k, c, _a) => {
            glowHalo(g, k, 0xff6a2a, 0.18);
            bladeWedge(g, k, 0x3a2a22, 0x8a4a2a, 0.95); // 焦岩背
            flameTongues(g, k, now, 0xff6a2a, 0xffe89a, 0.85, 7);
            drips(g, k, now, 0xff8a2a, 0xffd45c, 0.9, 4);
            embers(g, k, now, 0xffd45c, 0x4a3a2a, 0.9, 8);
            const t = tipOf(k);
            impact(g, t.x, t.y, now, hot, 0xffd45c, 0xff6a2a);
            void c;
        } },
    // 深渊海沟：幽蓝水压刃，沿刃一串上浮气泡与冷光
    trenchSwing: { a: 0x5ac8ff, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0x2a5a8a, 0.16);
            cometBand(g, k, 0x123048, 0.85, 1.1); // 深水
            cometBand(g, k, c, 0.55, 0.5);
            bubbles(g, k, now, 0xbfe8ff, 0.85, 7); // 上浮气泡
            inkDots(g, k, 0x0a1a2a, 0.5, 3);
            const t = tipOf(k);
            ripples(g, t.x, t.y, now, 0x5ac8ff, 0.5 + hot * 0.3, 2, 22, 120);
            impact(g, t.x, t.y, now, hot, a, 0x123048);
        } },
    // 道场：极干净的一记剑风 + 一圈收势气环 + 竹叶
    dojoSwing: { a: 0xe8f0f8, draw: (g, now, hot, k, _c, a) => {
            glowHalo(g, k, 0xe8f0f8, 0.1);
            hairLine(g, k, 0xffffff, 0.95, 0.13); // 剑风
            edgeHairs2(g, k, a, 6);
            petals(g, k, now, 0x8fd45a, 0.5, 4, 3.4); // 竹叶
            const t = tipOf(k);
            ripples(g, t.x, t.y, now, 0xffffff, 0.45 + hot * 0.35, 3, 24 + hot * 10, 100);
        } },
    // 水墨江南：一笔墨 + 随笔画落的桃瓣 + 水痕
    inkwSwing: { a: 0xffb0d8, draw: (g, now, hot, k, _c, _a) => {
            glowHalo(g, k, 0x9aa8b8, 0.08);
            cometBand(g, k, 0x2a2e36, 0.85, 1.4);
            inkDots(g, k, 0x2a2e36, 0.75, 2);
            edgeHairs2(g, k, 0x8a8a92, 6);
            petals(g, k, now, 0xffb0d8, 0.7, 6, 4);
            drips(g, k, now, 0x6a7480, 0x9aa8b8, 0.4, 3); // 水痕
            void hot;
        } },
    // 精灵花园：藤蔓缠出的刃 + 飞舞花瓣与萤光
    fairySwing: { a: 0xa8ff7a, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xa8ff7a, 0.16);
            coilBand(g, k, 0x4a8a3a, 0.8, 3, 2); // 藤蔓
            petals(g, k, now, 0xffb0e8, 0.85, 7, 5);
            orbiters(g, tipOf(k).x, tipOf(k).y, now, a, 0.9, 5, 20, 10, 600, 2); // 萤光
            starRow(g, k, now, 0xffffff, c, 0.7, 5, 2.2);
            void hot;
        } },
    // 极速竞逐：拉长的速度残影 + 断续的加速脉冲 + 尾流
    racerSwing: { a: 0x5ac8ff, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, c, 0.18);
            ghostEcho(g, k, c, 0.55, 4, 12); // 速度残影
            dashLine(g, k, now, 0xffffff, 0.55, 4, 0.12);
            plates(g, k, now, 0x1a2a3a, 0.6, 4, 4.4);
            sparks(g, k, now, a, 0.9, 9, 26);
            const t = tipOf(k);
            impact(g, t.x, t.y, now, hot, a, c);
        } },
    // 吸血鬼：暗红刃 + 血雾 + 滴血 + 蝠翼残影
    vampSwing: { a: 0xff3a4a, draw: (g, now, hot, k, c, _a) => {
            glowHalo(g, k, 0x8a1a2a, 0.18);
            bladeWedge(g, k, 0x2a0f18, 0x8a1a2a, 0.95); // 暗红刃
            puffs(g, k, now, 0x6a1020, 0.7, 8, 13); // 血雾
            drips(g, k, now, 0xd02030, 0xff8a9a, 0.9, 4); // 滴血
            feathers(g, k, now, 0x3a0f1a, 0.8, 5, 12); // 蝠翼
            embers(g, k, now, 0xff5a6a, 0x2a0f18, 0.7, 6);
            void c;
            void hot;
        } },
    // 秋日枫林：一路翻飞的枫叶 + 暖色余辉 + 落叶成带
    autumnSwing: { a: 0xff8a3c, draw: (g, now, hot, k, c, _a) => {
            glowHalo(g, k, 0xffb060, 0.14);
            cometBand(g, k, 0x8a4a1a, 0.5, 0.8);
            petals(g, k, now, c, 0.9, 8, 5.4); // 枫叶
            petals(g, k, now + 400, 0xffd45c, 0.7, 6, 4);
            embers(g, k, now, 0xffd45c, 0x4a3a2a, 0.6, 6);
            void hot;
        } },
    // 竹林熊猫：竹节刃 + 竹叶 + 起落的尘
    pandaSwing: { a: 0xd8f0b0, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0x8fd45a, 0.12);
            bones(g, k, 0x6a9a3a, 0.95, 3.2); // 竹节
            petals(g, k, now, 0xa8e86a, 0.85, 7, 5); // 竹叶
            puffs(g, k, now, 0xd8e8d0, 0.4, 5, 10);
            starRow(g, k, now, a, 0xffffff, 0.6, 4, 2);
            void c;
            void hot;
            void a;
        } },
    // 纸牌王国：一张张翻过的牌 + 四色花色碎屑
    jokerSwing: { a: 0xff5a6a, draw: (g, now, hot, k, c, _a) => {
            glowHalo(g, k, 0xff5a6a, 0.14);
            for (let i = 1; i < k.n - 1; i += 3) { // 翻过的牌
                const p = k.pts[i];
                const flip = Math.abs(Math.cos(now / 300 + i));
                g.fillStyle(0xffffff, p.a * 0.9);
                g.save();
                g.translateCanvas(p.x, p.y);
                g.scaleCanvas(0.4 + 0.6 * flip, 1);
                g.fillRoundedRect(-5, -7, 10, 14, 2);
                g.fillStyle(c, p.a * 0.9);
                g.fillCircle(0, 0, 2.2);
                g.restore();
            }
            shards(g, k, now, 0xff5a6a, 0.7, 5, 9, 2);
            void hot;
        } },
    // 古都风华：绸带缠绕 + 一路上扬的牡丹花瓣 + 宫灯金芒
    pagodSwing: { a: 0xffd45c, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xffb0c8, 0.14);
            coilBand(g, k, c, 0.85, 3, 2.2); // 绸带
            coilBand(g, k, 0x9fe8ff, 0.5, -3, 1.8);
            petals(g, k, now, 0xffb0c8, 0.85, 7, 5); // 牡丹
            sparks(g, k, now, a, 0.85, 7, 18);
            void hot;
        } },
    // 风暴之眼：两股反向风旋 + 风眼中的电弧与雨丝
    stormSwing: { a: 0x9fd8ff, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0x8ab0d8, 0.16);
            coilBand(g, k, c, 0.8, 4, 2.6); // 正旋风
            coilBand(g, k, 0xd0e8ff, 0.6, -4, 2.2); // 反旋风
            bolts(g, k, now, a, 0xffffff, 0.8, 4);
            puffs(g, k, now, 0xc0d4e8, 0.5, 8, 14); // 雨雾
            windHairs(g, k, now);
            void hot;
        } },
    // 月宫玉兔：一轮弯月跟着走 + 桂花飘落 + 月华环
    lunarSwing: { a: 0xffe89a, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xfff4d0, 0.18);
            cometBand(g, k, 0xe8e0c0, 0.5, 0.7);
            petals(g, k, now, a, 0.85, 6, 4); // 桂花
            snowflakes(g, k, now, 0xffffff, 0.6, 4, 2.6);
            const t = tipOf(k);
            // 弯月
            g.fillStyle(0xfff4d0, 0.95);
            g.fillCircle(t.x, t.y, 8);
            g.fillStyle(0x2a3a6a, 0);
            g.fillCircle(t.x - 4, t.y - 2, 7);
            ripples(g, t.x, t.y, now, 0xfff4d0, 0.4 + hot * 0.3, 2, 20, 120);
            void c;
        } },
    // 维京战船：船首骨刃劈开浪 + 木屑与浪花
    vikingSwing: { a: 0xd8c8a0, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0x8a9ab0, 0.14);
            bones(g, k, 0x8a6238, 0.95, 3); // 船骨
            sawTeeth(g, k, 0xd8c8a0, 0.8, 8, 2);
            ripples(g, midX(k), midY(k) + 8, now, 0xbfe8ff, 0.5, 3, 26, 110); // 浪环
            shards(g, k, now, 0x8a6238, 0.7, 5, 9, 1.6); // 木屑
            impact(g, tipOf(k).x, tipOf(k).y, now, hot, a, 0x8a6238);
            void c;
        } },
    // 草原巡礼：兽牙刃 + 扬起的草屑与尘土 + 远去的蹄尘
    safariSwing: { a: 0xffd45c, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xd8b878, 0.14);
            cometBand(g, k, 0x8a6a3a, 0.6, 0.9);
            sawTeeth(g, k, 0xf0e8d0, 0.9, 9, 1); // 兽牙
            puffs(g, k, now, 0xd8c8a0, 0.7, 9, 14); // 尘
            petals(g, k, now, 0xa8c86a, 0.6, 6, 4); // 草屑
            impact(g, tipOf(k).x, tipOf(k).y, now, hot, a, 0x8a6a3a);
            void c;
        } },
    // 戏剧后台：一道聚光扫过 + 飘散的纸屑与星星
    theatSwing: { a: 0xffd45c, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xfff0b0, 0.18);
            cometBand(g, k, 0xfff4d0, 0.6, 1.3); // 聚光
            starRow(g, k, now, a, 0xffffff, 0.9, 6, 3);
            shards(g, k, now, 0xffffff, 0.6, 5, 10, 2.2);
            sparks(g, k, now, 0xfff0b0, 0.8, 6, 20);
            void c;
            void hot;
        } },
    // 极光夜境：分光的极光带 + 星尘 + 雪片
    boreaSwing: { a: 0x9fffd0, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0x9fffd0, 0.2);
            prismSplit2(g, k, now); // 极光分光
            cometBand(g, k, 0xd0fff0, 0.5, 0.8);
            snowflakes(g, k, now, 0xffffff, 0.7, 5, 3);
            starRow(g, k, now, 0xffffff, c, 0.7, 5, 2.2);
            ripples(g, tipOf(k).x, tipOf(k).y, now, a, 0.4 + hot * 0.3, 2, 24, 130);
        } },
    // 水城泛舟：船桨划出的水弧 + 水珠 + 涟漪
    venicSwing: { a: 0x8ae8ff, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0x3a8a9a, 0.14);
            coilBand(g, k, 0x1a6a8a, 0.7, 2, 2);
            cometBand(g, k, c, 0.5, 0.6);
            drips(g, k, now, 0x8ae8ff, 0xffffff, 0.8, 5);
            ripples(g, midX(k), midY(k) + 6, now, 0xffffff, 0.45, 3, 24, 110);
            petals(g, k, now, 0xffd0e0, 0.4, 4, 3.4);
            void a;
            void hot;
        } },
    // 古希腊：宙斯雷霆刃 + 神庙石板碎片 + 圣火余烬
    olympSwing: { a: 0xffe89a, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xffe89a, 0.2);
            plates(g, k, now, 0xd8d4c0, 0.85, 6, 8); // 神庙石板
            bolts(g, k, now, 0xffffff, c, 0.95, 5); // 雷
            bolts(g, k, now, a, 0xffffff, 0.7, 3);
            shards(g, k, now, 0xd8d4c0, 0.8, 6, 10, 1.6);
            embers(g, k, now, 0xffd45c, 0x5a4a2a, 0.7, 6);
            impact(g, tipOf(k).x, tipOf(k).y, now, hot, a, 0xd8d4c0);
        } },
    // 桑巴狂欢：一身羽饰扇过 + 彩屑与鼓点音符
    sambaSwing: { a: 0xffd45c, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xff8ad4, 0.18);
            feathers(g, k, now, c, 0.9, 9, 12); // 大片羽饰
            feathers(g, k, now + 200, 0x4ac8ff, 0.7, 6, 9);
            petals(g, k, now, 0xffb0e8, 0.8, 7, 4); // 彩屑
            starRow(g, k, now, a, 0xffffff, 0.85, 5, 2.6);
            impact(g, tipOf(k).x, tipOf(k).y, now, hot, a, c);
        } },
};
// ───────── 本文件的几处专用小画法 ─────────
/** 道场：剑风两侧的极短芒线 */
function edgeHairs2(g, k, color, len) {
    for (let i = 1; i < k.n - 1; i += 2) {
        const p = k.pts[i];
        g.lineStyle(1, color, p.a * 0.55);
        g.lineBetween(p.x, p.y - len * 0.5, p.x, p.y + len * 0.5);
    }
}
/** 深渊：上浮气泡 */
function bubbles(g, k, now, color, a, n) {
    for (let j = 0; j < n; j++) {
        const i = Math.round(((j + 0.4) / n) * (k.n - 1));
        const p = k.pts[Math.max(0, Math.min(k.n - 1, i))];
        const ph = (now / 900 + j / n) % 1;
        const r = 1.6 + ph * 3;
        g.fillStyle(color, (1 - ph) * a);
        g.fillCircle(p.x + Math.sin(ph * 8 + j) * 5, p.y - ph * 10, r);
        g.fillStyle(0xffffff, (1 - ph) * a * 0.5);
        g.fillCircle(p.x + Math.sin(ph * 8 + j) * 5 - r * 0.3, p.y - ph * 10 - r * 0.3, r * 0.3);
    }
}
/** 风暴：被风扯出的斜雨丝 */
function windHairs(g, k, now) {
    for (let i = 1; i < k.n - 1; i += 2) {
        const p = k.pts[i];
        const drift = Math.sin(now / 200 + i) * 3;
        g.lineStyle(1, 0xd0e8ff, p.a * 0.5);
        g.lineBetween(p.x, p.y, p.x - 8 + drift, p.y + 6);
    }
}
/** 极光：三层错位且缓慢流动的彩带 */
function prismSplit2(g, k, now) {
    const cols = [0x5affb0, 0x5ad0ff, 0xc85aff];
    cols.forEach((col, idx) => {
        const off = (idx - 1) * 5;
        for (let i = 1; i < k.n; i++) {
            const wave = Math.sin(now / 400 + i * 0.5 + idx) * 3;
            g.lineStyle(Math.max(1, k.pts[i].w * 0.3), col, k.pts[i].a * 0.6);
            g.lineBetween(k.pts[i - 1].x + off, k.pts[i - 1].y + wave, k.pts[i].x + off, k.pts[i].y + wave);
        }
    });
}
const midX = (k) => k.pts[Math.floor(k.n / 2)].x;
const midY = (k) => k.pts[Math.floor(k.n / 2)].y;
