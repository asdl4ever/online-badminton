/**
 * **第三批 10 个主题宝箱**的绘制规格（见 `game/chest.ts` 的 `CHEST_THEMES`）。
 *
 * 与第二批一样：一件物品 = 一条 spec（图案 + 主色 + 点缀色），
 * 各部位的绘制函数在最前面查一次 spec 表、命中就走 `themeart.ts` 的通用画法；
 * 每个主题另有**一只独立造型的招牌形象**（`THEME_SKIN_ART_2`）。
 *
 * 这些表由 `themeart.ts` 展开进它自己的表里（`...THEME_HATS_2` 等），
 * 所以各绘制入口不用改。
 *
 * 10 个主题：🏴‍☠️ 海盗港湾 / ⚙️ 蒸汽朋克 / 🚀 星际宇航 / 🦖 侏罗纪 /
 * 🍄 蘑菇森林 / 🐠 热带珊瑚 / 🗝️ 地牢探险 / 🎄 圣诞雪夜 / 🍣 和风料亭 / 🤠 西部荒野
 */
const TAU = Math.PI * 2;
/** 眨眼开合（1 睁 / 0 闭） */
function blinkAt(now, period = 3400, dur = 170) {
    const t = now % period;
    if (t < period - dur)
        return 1;
    return Math.abs(1 - ((t - (period - dur)) / dur) * 2);
}
/** 一对圆眼（会眨 + 高光） */
function eyes(g, cx, cy, off, r, open, ink) {
    const rh = Math.max(1.1, r * open);
    g.fillStyle(ink, 1);
    g.fillEllipse(cx - off, cy, r * 1.7, rh * 1.7);
    g.fillEllipse(cx + off, cy, r * 1.7, rh * 1.7);
    if (open > 0.5) {
        g.fillStyle(0xffffff, 0.85);
        g.fillCircle(cx - off + r * 0.5, cy - r * 0.5, r * 0.4);
        g.fillCircle(cx + off + r * 0.5, cy - r * 0.5, r * 0.4);
    }
}
// ---- 🏴‍☠️ 海盗港湾：铁钩船长 ------------------------------------------------
function drawPirateCaptain(g, now, pose) {
    const x = pose.x;
    const f = pose.facing;
    const feetY = pose.feetY;
    const sway = Math.sin(now / 620);
    const wood = 0x2a3a44;
    const red = 0xb03030;
    const gold = 0xe8c86a;
    const skin = 0xf0c9a0;
    const ink = 0x101820;
    g.fillStyle(0, 0.12);
    g.fillEllipse(x, feetY + 2, 44, 9);
    // 红外套 + 金扣
    g.fillStyle(red, 1);
    g.fillRoundedRect(x - 17, feetY - 66, 34, 62, 10);
    g.fillStyle(wood, 1);
    g.fillRect(x - 17, feetY - 40, 34, 5);
    g.fillStyle(gold, 1);
    for (let k = -1; k <= 1; k++)
        g.fillCircle(x + k * 10, feetY - 42, 2.4);
    // 手 + 铁钩
    g.fillStyle(skin, 1);
    g.fillRoundedRect(x - 24, feetY - 58, 10, 20, 5);
    g.fillStyle(0xb8c0c8, 1);
    g.fillRoundedRect(x + 14, feetY - 58, 10, 18, 5);
    g.lineStyle(2.6, 0xb8c0c8, 1);
    g.beginPath();
    g.arc(x + 22, feetY - 38, 7, -1.2, 1.6, false, 0);
    g.strokePath();
    // 头 + 眼罩 + 胡子
    const hy = feetY - 82;
    g.fillStyle(skin, 1);
    g.fillCircle(x, hy, 14);
    g.fillStyle(ink, 1);
    g.fillRect(x + f * 2 - 10, hy - 5, 20, 7);
    eyes(g, x + f * 2, hy - 1, 5, 3.2, blinkAt(now), ink);
    g.fillStyle(0x6a4a30, 1);
    g.fillEllipse(x, hy + 9, 22, 10);
    // 三角帽 + 骷髅徽
    g.fillStyle(ink, 1);
    g.fillTriangle(x - 20, hy - 12, x + 20, hy - 12, x, hy - 30);
    g.fillRoundedRect(x - 22, hy - 14, 44, 7, 3);
    g.fillStyle(0xd8c8a0, 1);
    g.fillCircle(x, hy - 16 + sway * 0.5, 3);
    // 肩上鹦鹉
    g.fillStyle(0x3ac0a0, 1);
    g.fillEllipse(x + f * 26, feetY - 70 + sway * 2, 10, 13);
    g.fillStyle(0xffd45c, 1);
    g.fillTriangle(x + f * 26, feetY - 79 + sway * 2, x + f * 35, feetY - 74 + sway * 2, x + f * 26, feetY - 72 + sway * 2);
}
// ---- ⚙️ 蒸汽朋克：黄铜机师 ------------------------------------------------
function drawSteamEngineer(g, now, pose) {
    const x = pose.x;
    const feetY = pose.feetY;
    const puff = (now / 900) % 1;
    const brass = 0xd8a24a;
    const dark = 0x5a4326;
    const steel = 0x8fa0b0;
    const skin = 0xf0c9a0;
    g.fillStyle(0, 0.12);
    g.fillEllipse(x, feetY + 2, 44, 9);
    // 工装 + 皮带
    g.fillStyle(dark, 1);
    g.fillRoundedRect(x - 17, feetY - 66, 34, 62, 9);
    g.fillStyle(0x3a2c18, 1);
    g.fillRect(x - 17, feetY - 42, 34, 7);
    g.fillStyle(brass, 1);
    g.fillRect(x - 4, feetY - 43, 8, 9);
    // 手臂 + 扳手
    g.fillStyle(dark, 1);
    g.fillRoundedRect(x - 25, feetY - 58, 10, 24, 5);
    g.fillRoundedRect(x + 15, feetY - 58, 10, 24, 5);
    g.fillStyle(steel, 1);
    g.fillRoundedRect(x + 17, feetY - 34, 6, 18, 3);
    g.fillCircle(x + 20, feetY - 34, 6);
    // 头 + 护目镜
    const hy = feetY - 82;
    g.fillStyle(skin, 1);
    g.fillCircle(x, hy, 14);
    g.fillStyle(steel, 1);
    g.fillRoundedRect(x - 19, hy - 6, 38, 11, 5);
    g.fillStyle(0x8fd8ff, 0.85);
    g.fillCircle(x - 6, hy, 4.4);
    g.fillCircle(x + 6, hy, 4.4);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(x - 7, hy - 1.5, 1.5);
    g.fillCircle(x + 5, hy - 1.5, 1.5);
    // 黄铜头盔 + 烟囱冒气
    g.fillStyle(brass, 1);
    g.fillRoundedRect(x - 15, hy - 20, 30, 10, 5);
    g.fillStyle(steel, 1);
    g.fillRoundedRect(x + 12, hy - 26, 8, 14, 3);
    for (let k = 0; k < 3; k++) {
        const t = (puff + k / 3) % 1;
        g.fillStyle(0xdfe6f0, 0.5 * (1 - t));
        g.fillCircle(x + 16 + Math.sin(t * 6) * 4, hy - 30 - t * 22, 3.4 + t * 5);
    }
    // 胸口的齿轮
    g.lineStyle(2, brass, 0.9);
    for (let k = 0; k < 12; k++) {
        const a = now / 700 + (k / 12) * TAU;
        const rr = k % 2 === 0 ? 9 : 7;
        const px = x + Math.cos(a) * rr;
        const py = feetY - 52 + Math.sin(a) * rr;
        if (k === 0)
            g.beginPath();
        if (k === 0)
            g.moveTo(px, py);
        else
            g.lineTo(px, py);
    }
    g.closePath();
    g.strokePath();
}
// ---- 🚀 星际宇航：星舰驾驶员 ----------------------------------------------
function drawAstroPilot(g, now, pose) {
    const x = pose.x;
    const f = pose.facing;
    const feetY = pose.feetY;
    const glow = 0.5 + 0.5 * Math.sin(now / 420);
    const suit = 0xe8eef6;
    const orange = 0xffb03a;
    const visor = 0x9fd8ff;
    g.fillStyle(0, 0.12);
    g.fillEllipse(x, feetY + 2, 46, 9);
    // 宇航服 + 胸前控制板
    g.fillStyle(suit, 1);
    g.fillRoundedRect(x - 18, feetY - 66, 36, 62, 11);
    g.fillStyle(0xc0ccda, 1);
    g.fillRect(x - 18, feetY - 40, 36, 6);
    g.fillStyle(orange, 1);
    g.fillRoundedRect(x - 8, feetY - 36, 16, 12, 3);
    g.fillStyle(0x5ac8ff, 0.6 + 0.4 * glow);
    g.fillRect(x - 6, feetY - 34, 12, 8);
    // 生命背包
    g.fillStyle(0xc0ccda, 1);
    g.fillRoundedRect(x - f * 26 - 9, feetY - 62, 18, 34, 6);
    g.fillStyle(0x5ac8ff, 0.7);
    g.fillCircle(x - f * 22, feetY - 50, 3);
    // 头盔（玻璃罩 + 反光面罩）
    const hy = feetY - 82;
    g.fillStyle(suit, 1);
    g.fillCircle(x, hy - 2, 19);
    g.fillStyle(visor, 0.9);
    g.fillEllipse(x + f * 2, hy - 2, 26, 22);
    g.fillStyle(0xffffff, 0.7);
    g.fillEllipse(x + f * 2 - 6, hy - 7, 8, 5);
    g.lineStyle(2, 0xc0ccda, 0.9);
    g.strokeCircle(x, hy - 2, 19);
    // 天线 + 信号
    g.lineStyle(2, 0xc0ccda, 1);
    g.lineBetween(x + 14, hy - 14, x + 20, hy - 30 + Math.sin(now / 300) * 2);
    g.fillStyle(orange, 0.6 + 0.4 * glow);
    g.fillCircle(x + 20, hy - 31 + Math.sin(now / 300) * 2, 3);
    // 环绕的小星
    for (let k = 0; k < 4; k++) {
        const a = now / 1100 + (k / 4) * TAU;
        g.fillStyle(0xfff2c4, 0.7 + 0.3 * Math.sin(now / 300 + k));
        g.fillCircle(x + Math.cos(a) * 34, feetY - 54 + Math.sin(a) * 16, 1.6);
    }
}
// ---- 🦖 侏罗纪：迅猛龙 ----------------------------------------------------
function drawJuraRaptor(g, now, pose) {
    const x = pose.x;
    const f = pose.facing;
    const feetY = pose.feetY;
    const step = Math.sin(now / 260);
    const green = 0x5a8a3a;
    const dark = 0x395f2a;
    const belly = 0xc8d8a0;
    const ink = 0x14200e;
    g.fillStyle(0, 0.12);
    g.fillEllipse(x, feetY + 2, 48, 9);
    // 长尾（左右摆）
    g.fillStyle(dark, 1);
    g.fillTriangle(x - f * 8, feetY - 44, x - f * 10, feetY - 26, x - f * (52 + step * 6), feetY - 34 + step * 4);
    // 身体
    g.fillStyle(green, 1);
    g.fillEllipse(x, feetY - 32, 42, 34);
    g.fillStyle(belly, 1);
    g.fillEllipse(x + f * 4, feetY - 24, 26, 20);
    // 后腿 + 爪
    g.fillStyle(green, 1);
    g.fillRoundedRect(x - 8, feetY - 18 + step * 2, 10, 18, 4);
    g.fillRoundedRect(x + 6, feetY - 18 - step * 2, 10, 18, 4);
    g.fillStyle(0xd8c8a0, 1);
    g.fillTriangle(x - 9, feetY - 2 + step * 2, x - 1, feetY - 2 + step * 2, x - 5, feetY + 2 + step * 2);
    g.fillTriangle(x + 5, feetY - 2 - step * 2, x + 13, feetY - 2 - step * 2, x + 9, feetY + 2 - step * 2);
    // 脖子 + 头
    const hy = feetY - 62;
    g.fillStyle(green, 1);
    g.fillRoundedRect(x + f * 6 - 7, feetY - 58, 16, 24, 7);
    g.fillEllipse(x + f * 16, hy, 26, 18);
    g.fillStyle(dark, 1);
    g.fillTriangle(x + f * 4, hy - 14, x + f * 12, hy - 12, x + f * 6, hy - 22);
    // 眼 + 牙
    g.fillStyle(0xffd45c, 1);
    g.fillCircle(x + f * 22, hy - 3, 3);
    g.fillStyle(ink, 1);
    g.fillEllipse(x + f * 22, hy - 3, 2.4, 3.6);
    g.fillStyle(0xffffff, 1);
    for (let k = 0; k < 4; k++)
        g.fillTriangle(x + f * (14 + k * 5), hy + 6, x + f * (17 + k * 5), hy + 6, x + f * (15.5 + k * 5), hy + 11);
}
// ---- 🍄 蘑菇森林：蘑菇小妖 ------------------------------------------------
function drawMushSprite(g, now, pose) {
    const x = pose.x;
    const f = pose.facing;
    const feetY = pose.feetY;
    const breathe = Math.sin(now / 700);
    const cap = 0xd84a4a;
    const spot = 0xfff0e0;
    const stem = 0xf0e0c8;
    const ink = 0x3a1a1a;
    g.fillStyle(0, 0.12);
    g.fillEllipse(x, feetY + 2, 40, 9);
    // 菌柄身体
    g.fillStyle(stem, 1);
    g.fillRoundedRect(x - 14, feetY - 48, 28, 48, 12);
    g.fillStyle(0xe0c8a8, 1);
    g.fillEllipse(x, feetY - 8, 26, 14);
    // 小短手
    g.fillStyle(stem, 1);
    g.fillRoundedRect(x - 22, feetY - 40 + breathe, 9, 16, 4.5);
    g.fillRoundedRect(x + 13, feetY - 40 - breathe, 9, 16, 4.5);
    // 眼 + 腮红
    const hy = feetY - 34;
    eyes(g, x + f * 1, hy, 5, 3.4, blinkAt(now), ink);
    g.fillStyle(0xffa8a8, 0.55);
    g.fillEllipse(x - 11, hy + 7, 7, 4.5);
    g.fillEllipse(x + 11, hy + 7, 7, 4.5);
    g.fillStyle(ink, 1);
    g.fillEllipse(x, hy + 10, 6, 4);
    // 伞盖（一压一弹）+ 白点
    const squish = 1 + breathe * 0.06;
    g.fillStyle(cap, 1);
    g.fillEllipse(x, feetY - 54, 62 * squish, 32 / squish);
    g.fillStyle(0x8a2020, 1);
    g.fillEllipse(x, feetY - 46, 62 * squish, 12);
    g.fillStyle(spot, 0.95);
    g.fillCircle(x - 18, feetY - 58, 5);
    g.fillCircle(x + 4, feetY - 64, 6);
    g.fillCircle(x + 20, feetY - 56, 4.4);
    // 孢子
    for (let k = 0; k < 4; k++) {
        const t = (now / 1400 + k / 4) % 1;
        g.fillStyle(0xa8ff7a, 0.7 * (1 - t));
        g.fillCircle(x + Math.sin(now / 500 + k * 2) * 26, feetY - 70 - t * 36, 2 + (k % 2));
    }
}
// ---- 🐠 热带珊瑚：珊瑚人鱼 ------------------------------------------------
function drawTropicMermaid(g, now, pose) {
    const x = pose.x;
    const f = pose.facing;
    const feetY = pose.feetY;
    const sway = Math.sin(now / 560);
    const skin = 0xf0c8b0;
    const coral = 0xff8a70;
    const tail = 0x2fb0a8;
    const tailDark = 0x1f7a76;
    const ink = 0x0e2a2a;
    g.fillStyle(0, 0.12);
    g.fillEllipse(x, feetY + 2, 44, 9);
    // 鱼尾（左右摆）
    g.fillStyle(tailDark, 1);
    g.fillTriangle(x - 4, feetY - 18, x + 4, feetY - 18, x + sway * 6, feetY + 4);
    g.fillStyle(tail, 1);
    g.fillRoundedRect(x - 13, feetY - 42, 26, 30, 10);
    g.lineStyle(1.6, 0x8fe8e0, 0.7);
    for (let k = 0; k < 3; k++) {
        g.beginPath();
        g.arc(x, feetY - 38 + k * 8, 9, Math.PI, 0, false, 0);
        g.strokePath();
    }
    // 上身 + 贝壳胸甲
    g.fillStyle(skin, 1);
    g.fillRoundedRect(x - 14, feetY - 70, 28, 32, 10);
    g.fillStyle(coral, 1);
    g.fillEllipse(x - 7, feetY - 58, 14, 11);
    g.fillEllipse(x + 7, feetY - 58, 14, 11);
    // 头 + 长发
    const hy = feetY - 84;
    g.fillStyle(coral, 1);
    g.fillEllipse(x, hy + 2, 40, 40);
    g.fillStyle(skin, 1);
    g.fillCircle(x, hy, 14);
    eyes(g, x + f * 2, hy - 1, 5, 3.2, blinkAt(now), ink);
    g.fillStyle(ink, 1);
    g.fillEllipse(x, hy + 8, 7, 4);
    // 珊瑚头饰 + 气泡
    g.fillStyle(coral, 1);
    g.fillCircle(x - 14, hy - 14, 5);
    g.fillCircle(x + 6, hy - 20, 6);
    g.fillCircle(x + 18, hy - 12, 4.4);
    for (let k = 0; k < 5; k++) {
        const t = (now / 1500 + k / 5) % 1;
        g.lineStyle(1.6, 0xbfe8f0, 0.7 * (1 - t));
        g.strokeCircle(x + Math.sin(k * 2.4) * 30, feetY - 20 - t * 70, 2 + (k % 3));
    }
    // 绕游的小鱼
    const a = now / 900;
    g.fillStyle(0xffb7a0, 1);
    g.fillEllipse(x + Math.cos(a) * 38, feetY - 56 + Math.sin(a) * 14, 10, 6);
    g.fillTriangle(x + Math.cos(a) * 38 + 5, feetY - 56 + Math.sin(a) * 14, x + Math.cos(a) * 38 + 12, feetY - 61 + Math.sin(a) * 14, x + Math.cos(a) * 38 + 12, feetY - 51 + Math.sin(a) * 14);
}
// ---- 🗝️ 地牢探险：骷髅法师 ------------------------------------------------
function drawCryptLich(g, now, pose) {
    const x = pose.x;
    const feetY = pose.feetY;
    const sway = Math.sin(now / 640);
    const robe = 0x4a3a5a;
    const robeDark = 0x322840;
    const bone = 0xd8c8a0;
    const glow = 0.5 + 0.5 * Math.sin(now / 380);
    g.fillStyle(0, 0.14);
    g.fillEllipse(x, feetY + 2, 46, 9);
    // 幽绿光
    g.fillStyle(0x9fd8a0, 0.1 + 0.08 * glow);
    g.fillEllipse(x, feetY - 50, 76, 104);
    // 长袍
    g.fillStyle(robe, 1);
    g.fillTriangle(x - 22, feetY - 2, x + 22, feetY - 2, x + 10, feetY - 60);
    g.fillTriangle(x - 22, feetY - 2, x - 10, feetY - 60, x + 10, feetY - 60);
    g.fillStyle(robeDark, 1);
    g.fillTriangle(x - 22, feetY - 2, x + 22, feetY - 2, x, feetY - 30);
    // 骨手
    g.fillStyle(bone, 1);
    g.fillRoundedRect(x - 24, feetY - 56, 9, 16, 4);
    g.fillRoundedRect(x + 15, feetY - 56, 9, 16, 4);
    // 骷髅头
    const hy = feetY - 76;
    g.fillStyle(bone, 1);
    g.fillCircle(x, hy, 14);
    g.fillRect(x - 8, hy + 8, 16, 8);
    g.fillStyle(0x1a1020, 1);
    g.fillEllipse(x - 5, hy - 1, 6, 7);
    g.fillEllipse(x + 5, hy - 1, 6, 7);
    g.fillStyle(0x9fd8a0, 0.6 + 0.4 * glow);
    g.fillCircle(x - 5, hy - 1, 2);
    g.fillCircle(x + 5, hy - 1, 2);
    g.fillStyle(0x1a1020, 1);
    for (let k = 0; k < 3; k++)
        g.fillRect(x - 7 + k * 5, hy + 8, 2, 8);
    // 尖帽 + 幽火
    g.fillStyle(robeDark, 1);
    g.fillTriangle(x - 16, hy - 12, x + 16, hy - 12, x + sway * 3, hy - 40);
    g.fillStyle(0x9fd8a0, 0.7 * (0.6 + 0.4 * glow));
    g.fillTriangle(x - 4, hy - 40 + sway * 3, x + 4, hy - 40 + sway * 3, x + Math.sin(now / 150) * 3, hy - 54 + sway * 3);
}
// ---- 🎄 圣诞雪夜：圣诞小精灵 ----------------------------------------------
function drawFestivElf(g, now, pose) {
    const x = pose.x;
    const f = pose.facing;
    const feetY = pose.feetY;
    const bell = Math.sin(now / 260);
    const green = 0x2c6a44;
    const greenDark = 0x1e4a2f;
    const red = 0xd23b3b;
    const gold = 0xffd45c;
    const skin = 0xf7d8b8;
    const ink = 0x0e2418;
    g.fillStyle(0, 0.12);
    g.fillEllipse(x, feetY + 2, 42, 9);
    // 绿衣 + 金腰带
    g.fillStyle(green, 1);
    g.fillRoundedRect(x - 16, feetY - 60, 32, 56, 10);
    g.fillStyle(greenDark, 1);
    g.fillTriangle(x - 16, feetY - 2, x + 16, feetY - 2, x, feetY - 26);
    g.fillStyle(ink, 1);
    g.fillRect(x - 16, feetY - 36, 32, 6);
    g.fillStyle(gold, 1);
    g.fillRect(x - 4, feetY - 37, 9, 8);
    // 手 + 礼物盒
    g.fillStyle(green, 1);
    g.fillRoundedRect(x - 23, feetY - 52, 9, 20, 4.5);
    g.fillStyle(red, 1);
    g.fillRoundedRect(x + 14, feetY - 40, 18, 16, 3);
    g.fillStyle(gold, 1);
    g.fillRect(x + 21, feetY - 40, 4, 16);
    g.fillRect(x + 14, feetY - 33, 18, 3);
    // 头
    const hy = feetY - 72;
    g.fillStyle(skin, 1);
    g.fillCircle(x, hy, 13);
    eyes(g, x + f * 2, hy - 1, 5, 3.2, blinkAt(now), ink);
    g.fillStyle(0xffa8a8, 0.55);
    g.fillEllipse(x - 10, hy + 6, 6, 4);
    g.fillEllipse(x + 10, hy + 6, 6, 4);
    // 尖帽 + 铃铛
    g.fillStyle(red, 1);
    g.fillTriangle(x - 15, hy - 10, x + 15, hy - 10, x + 10 + bell * 4, hy - 42);
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(x - 16, hy - 13, 32, 7, 3.5);
    g.fillStyle(gold, 1);
    g.fillCircle(x + 10 + bell * 4, hy - 44, 4.4);
    // 落雪
    for (let k = 0; k < 6; k++) {
        const t = (now / 1600 + k / 6) % 1;
        g.fillStyle(0xffffff, 0.85 * (1 - t * 0.4));
        g.fillCircle(x + Math.sin(k * 2.3 + now / 700) * 30, hy - 30 + t * 100, 1.6 + (k % 3));
    }
}
// ---- 🍣 和风料亭：料理长 ------------------------------------------------
function drawSushiChef(g, now, pose) {
    const x = pose.x;
    const f = pose.facing;
    const feetY = pose.feetY;
    const bob = Math.sin(now / 700) * 1.5;
    const coat = 0xf4f4f0;
    const navy = 0x2a3a5a;
    const band = 0xd8c8a0;
    const salmon = 0xff8a6a;
    const skin = 0xf0c9a0;
    const ink = 0x1a1a22;
    g.fillStyle(0, 0.12);
    g.fillEllipse(x, feetY + 2, 44, 9);
    // 白色料理衣 + 围裙
    g.fillStyle(coat, 1);
    g.fillRoundedRect(x - 17, feetY - 64 + bob, 34, 60, 9);
    g.fillStyle(navy, 1);
    g.fillRoundedRect(x - 12, feetY - 34 + bob, 24, 30, 6);
    g.fillStyle(band, 1);
    g.fillRect(x - 12, feetY - 36 + bob, 24, 4);
    // 手 + 寿司托盘
    g.fillStyle(coat, 1);
    g.fillRoundedRect(x - 24, feetY - 56 + bob, 9, 20, 4.5);
    g.fillStyle(0x8a6238, 1);
    g.fillRoundedRect(x + 13, feetY - 44 + bob, 22, 6, 3);
    g.fillStyle(0xf4f4f0, 1);
    g.fillEllipse(x + 24, feetY - 47 + bob, 12, 7);
    g.fillStyle(salmon, 1);
    g.fillEllipse(x + 24, feetY - 49 + bob, 12, 5);
    // 头
    const hy = feetY - 78 + bob;
    g.fillStyle(skin, 1);
    g.fillCircle(x, hy, 13);
    eyes(g, x + f * 2, hy - 1, 5, 3.2, blinkAt(now), ink);
    g.fillStyle(ink, 1);
    g.fillEllipse(x, hy + 7, 6, 3.4);
    // 头巾（打结 + 飘带）
    g.fillStyle(navy, 1);
    g.fillRoundedRect(x - 15, hy - 16, 30, 9, 4.5);
    g.fillTriangle(x + 15, hy - 12, x + 15, hy - 4, x + 27 + Math.sin(now / 400) * 3, hy - 10);
    // 头顶冒的热气
    for (let k = 0; k < 3; k++) {
        const t = (now / 1300 + k / 3) % 1;
        g.fillStyle(0xffffff, 0.35 * (1 - t));
        g.fillEllipse(x - 10 + k * 10 + Math.sin(t * 6) * 3, hy - 24 - t * 20, 6, 10);
    }
    // 灯笼吊饰
    g.fillStyle(0xe8404a, 1);
    g.fillEllipse(x - f * 30, feetY - 84 + Math.sin(now / 500) * 2, 12, 15);
    g.fillStyle(0xffd45c, 1);
    g.fillRect(x - f * 30 - 6, feetY - 86 + Math.sin(now / 500) * 2, 12, 2);
}
// ---- 🤠 西部荒野：快枪手 ------------------------------------------------
function drawWildGunslinger(g, now, pose) {
    const x = pose.x;
    const f = pose.facing;
    const feetY = pose.feetY;
    const bounce = Math.sin(now / 520) * 1.4;
    const vest = 0x8a6a3a;
    const vestDark = 0x6a4a2a;
    const scarf = 0xd23b3b;
    const skin = 0xe8b888;
    const metal = 0xc0c8d0;
    const ink = 0x2e1e0e;
    g.fillStyle(0, 0.12);
    g.fillEllipse(x, feetY + 2, 46, 9);
    // 马甲 + 衬衫
    g.fillStyle(vest, 1);
    g.fillRoundedRect(x - 17, feetY - 62 + bounce, 34, 58, 8);
    g.fillStyle(0xd8c8a0, 1);
    g.fillRect(x - 6, feetY - 62 + bounce, 12, 20);
    // 皮带 + 左轮枪套
    g.fillStyle(ink, 1);
    g.fillRect(x - 17, feetY - 34 + bounce, 34, 8);
    g.fillStyle(metal, 1);
    g.fillRect(x - 5, feetY - 35 + bounce, 10, 10);
    g.fillStyle(0x8a6238, 1);
    g.fillRoundedRect(x + f * 14, feetY - 30 + bounce, 9, 16, 4);
    g.fillStyle(metal, 1);
    g.fillRoundedRect(x + f * 15, feetY - 33 + bounce, 7, 5, 2);
    // 手
    g.fillStyle(skin, 1);
    g.fillRoundedRect(x - 24, feetY - 54 + bounce, 9, 18, 4.5);
    g.fillRoundedRect(x + 15, feetY - 54 + bounce, 9, 18, 4.5);
    // 红围巾（飘）
    g.fillStyle(scarf, 1);
    g.fillRoundedRect(x - 12, feetY - 64 + bounce, 24, 7, 3.5);
    g.fillTriangle(x - f * 10, feetY - 62 + bounce, x - f * 12, feetY - 54 + bounce, x - f * (30 + Math.sin(now / 300) * 4), feetY - 60 + bounce);
    // 头
    const hy = feetY - 78 + bounce;
    g.fillStyle(skin, 1);
    g.fillCircle(x, hy, 13);
    eyes(g, x + f * 2, hy - 1, 5, 3.2, blinkAt(now), ink);
    g.fillStyle(0x8a3a2a, 1);
    g.fillEllipse(x, hy + 7, 6, 3.4);
    // 牛仔帽（宽檐 + 高顶）
    g.fillStyle(vestDark, 1);
    g.fillEllipse(x, hy - 12, 52, 12);
    g.fillRoundedRect(x - 13, hy - 30, 26, 20, 8);
    g.fillStyle(0x4a3218, 1);
    g.fillRect(x - 13, hy - 15, 26, 4);
    // 头顶的一圈尘
    for (let k = 0; k < 5; k++) {
        const t = (now / 1200 + k / 5) % 1;
        g.fillStyle(0xd8c8a0, 0.6 * (1 - t));
        g.fillCircle(x + Math.sin(k * 2.3 + now / 800) * 28, feetY - 20 - t * 40, 2 + (k % 2));
    }
}
// ---- 招牌形象表 -----------------------------------------------------------
export const THEME_SKIN_ART_2 = {
    pirateSpirit: drawPirateCaptain,
    steamSpirit: drawSteamEngineer,
    astroSpirit: drawAstroPilot,
    juraSpirit: drawJuraRaptor,
    mushSpirit: drawMushSprite,
    tropicSpirit: drawTropicMermaid,
    cryptSpirit: drawCryptLich,
    festivSpirit: drawFestivElf,
    sushiSpirit: drawSushiChef,
    wildSpirit: drawWildGunslinger,
};
// ---- 各部位 spec 表 -------------------------------------------------------
export const THEME_HATS_2 = {
    pirateHat: { ornament: 'anchor', accent: 0xd8c8a0, base: 'wrap' },
    pirateCrown: { ornament: 'crown', accent: 0x5fd0c0, base: 'band' },
    steamHat: { ornament: 'gear', accent: 0x8fd8ff, base: 'band' },
    steamCrown: { ornament: 'wheel', accent: 0xffb03a, base: 'topper' },
    astroHat: { ornament: 'bubble', accent: 0x9fd8ff, base: 'band' },
    astroCrown: { ornament: 'star', accent: 0xffb03a, base: 'band' },
    juraHat: { ornament: 'shell', accent: 0x7a6440, base: 'topper' },
    juraCrown: { ornament: 'bone', accent: 0xe8d07a, base: 'band' },
    mushHat: { ornament: 'mushroom', accent: 0xffffff, base: 'topper' },
    mushCrown: { ornament: 'clover', accent: 0xa8ff7a, base: 'band' },
    tropicHat: { ornament: 'shell', accent: 0xffffff, base: 'topper' },
    tropicCrown: { ornament: 'gem', accent: 0x5fe8d0, base: 'band' },
    cryptHat: { ornament: 'shield', accent: 0x8a8a92, base: 'band' },
    cryptCrown: { ornament: 'skull', accent: 0xd8c8a0, base: 'band' },
    festivHat: { ornament: 'bell', accent: 0xffffff, base: 'topper' },
    festivCrown: { ornament: 'star', accent: 0xffd45c, base: 'band' },
    sushiHat: { ornament: 'fan', accent: 0xd8c8a0, base: 'wrap' },
    sushiCrown: { ornament: 'coin', accent: 0xffd45c, base: 'band' },
    wildHat: { ornament: 'top', accent: 0x6a4a2a, base: 'topper' },
    wildCrown: { ornament: 'star', accent: 0xffd45c, base: 'band' },
};
export const THEME_AURAS_2 = {
    pirateAuraA: { motion: 'drift', accent: 0x5fd0c0 },
    pirateAuraB: { motion: 'swirl', accent: 0xd8c8a0 },
    steamAuraA: { motion: 'orbit', accent: 0xffb03a },
    steamAuraB: { motion: 'ring', accent: 0x8fd8ff },
    astroAuraA: { motion: 'orbit', accent: 0xffb03a },
    astroAuraB: { motion: 'sparkle', accent: 0x9fd8ff },
    juraAuraA: { motion: 'rise', accent: 0x9fe86a },
    juraAuraB: { motion: 'fall', accent: 0xffb03a },
    mushAuraA: { motion: 'rise', accent: 0xa8ff7a },
    mushAuraB: { motion: 'sparkle', accent: 0xffe89a },
    tropicAuraA: { motion: 'rise', accent: 0xbfe8f0 },
    tropicAuraB: { motion: 'drift', accent: 0x5fe8d0 },
    cryptAuraA: { motion: 'fall', accent: 0x9fd8a0 },
    cryptAuraB: { motion: 'pulse', accent: 0xffb03a },
    festivAuraA: { motion: 'fall', accent: 0xffffff },
    festivAuraB: { motion: 'sparkle', accent: 0xffd45c },
    sushiAuraA: { motion: 'rise', accent: 0xffffff },
    sushiAuraB: { motion: 'fall', accent: 0xffb7d5 },
    wildAuraA: { motion: 'drift', accent: 0xffb03a },
    wildAuraB: { motion: 'pulse', accent: 0xff9a4a },
};
export const THEME_RINGS_2 = {
    pirateRing: { pattern: 'arcs', accent: 0x5fd0c0 },
    steamRing: { pattern: 'runes', accent: 0x8fd8ff },
    astroRing: { pattern: 'orbs', accent: 0xffb03a },
    juraRing: { pattern: 'spikes', accent: 0x9fe86a },
    mushRing: { pattern: 'petals', accent: 0xa8ff7a },
    tropicRing: { pattern: 'orbs', accent: 0xbfe8f0 },
    cryptRing: { pattern: 'runes', accent: 0x9fd8a0 },
    festivRing: { pattern: 'petals', accent: 0xffffff },
    sushiRing: { pattern: 'arcs', accent: 0xd8c8a0 },
    wildRing: { pattern: 'arcs', accent: 0xffd45c },
};
export const THEME_MOUNTS_2 = {
    pirateMount: { family: 'glider', accent: 0xe8c86a },
    steamMount: { family: 'wheeled', accent: 0xd8a24a },
    astroMount: { family: 'float', accent: 0xffb03a },
    juraMount: { family: 'beast', accent: 0x7ed957 },
    mushMount: { family: 'creature', accent: 0x8a6a4a },
    tropicMount: { family: 'creature', accent: 0x4aa88a },
    cryptMount: { family: 'beast', accent: 0xd8c8a0 },
    festivMount: { family: 'glider', accent: 0xffd45c },
    sushiMount: { family: 'float', accent: 0x8a6238 },
    wildMount: { family: 'beast', accent: 0x8a5a2a },
};
export const THEME_RACKETS_2 = {
    pirateRacketA: { pattern: 'rope', accent: 0x5fd0c0, frame: 'circle' },
    pirateRacketB: { pattern: 'spike', accent: 0xe8c86a, frame: 'shield' },
    steamRacketA: { pattern: 'gear', accent: 0xffb03a, frame: 'gate' },
    steamRacketB: { pattern: 'gear', accent: 0x8fd8ff, frame: 'hex' },
    astroRacketA: { pattern: 'rune', accent: 0xffb03a, frame: 'ring' },
    astroRacketB: { pattern: 'spike', accent: 0x9fd8ff, frame: 'gate' },
    juraRacketA: { pattern: 'spike', accent: 0x7ed957, frame: 'claw' },
    juraRacketB: { pattern: 'gem', accent: 0xffb02a, frame: 'bone' },
    mushRacketA: { pattern: 'gem', accent: 0xffffff, frame: 'circle' },
    mushRacketB: { pattern: 'rope', accent: 0x5a7a3a, frame: 'leaf' },
    tropicRacketA: { pattern: 'ribbon', accent: 0xffb7a0, frame: 'teardrop' },
    tropicRacketB: { pattern: 'gem', accent: 0x5fe8d0, frame: 'coil' },
    cryptRacketA: { pattern: 'spike', accent: 0x9fd8a0, frame: 'bone' },
    cryptRacketB: { pattern: 'rune', accent: 0xffb03a, frame: 'blade' },
    festivRacketA: { pattern: 'ribbon', accent: 0xffffff, frame: 'ring' },
    festivRacketB: { pattern: 'rope', accent: 0xd23b3b, frame: 'star' },
    sushiRacketA: { pattern: 'rope', accent: 0xff8a6a, frame: 'scroll' },
    sushiRacketB: { pattern: 'ribbon', accent: 0xd8c8a0, frame: 'teardrop' },
    wildRacketA: { pattern: 'rope', accent: 0xffd45c, frame: 'ring' },
    wildRacketB: { pattern: 'gem', accent: 0xd8c8a0, frame: 'hex' },
};
export const THEME_TRAILS_2 = {
    pirateTrailA: { pattern: 'water', accent: 0xe8c86a },
    pirateTrailB: { pattern: 'smoke', accent: 0xff8a3c },
    steamTrailA: { pattern: 'smoke', accent: 0x8fd8ff },
    steamTrailB: { pattern: 'spark', accent: 0xffb03a },
    astroTrailA: { pattern: 'comet', accent: 0xffb03a },
    astroTrailB: { pattern: 'bolt', accent: 0x9fd8ff },
    juraTrailA: { pattern: 'feather', accent: 0x9fe86a },
    juraTrailB: { pattern: 'ember', accent: 0xff7a2a },
    mushTrailA: { pattern: 'bubble', accent: 0xa8ff7a },
    mushTrailB: { pattern: 'spark', accent: 0xffe89a },
    tropicTrailA: { pattern: 'bubble', accent: 0x5fe8d0 },
    tropicTrailB: { pattern: 'water', accent: 0xbfe8f0 },
    cryptTrailA: { pattern: 'bone', accent: 0x9fd8a0 },
    cryptTrailB: { pattern: 'ember', accent: 0xffb03a },
    festivTrailA: { pattern: 'snow', accent: 0xff6a6a },
    festivTrailB: { pattern: 'lantern', accent: 0xffd45c },
    sushiTrailA: { pattern: 'smoke', accent: 0xffffff },
    sushiTrailB: { pattern: 'ink', accent: 0x8a4a2a },
    wildTrailA: { pattern: 'sand', accent: 0xffd45c },
    wildTrailB: { pattern: 'spark', accent: 0xffb03a },
};
export const THEME_SWINGS_2 = {
    pirateSwing: { pattern: 'talon', accent: 0xe8c86a },
    steamSwing: { pattern: 'gear', accent: 0xffb03a },
    astroSwing: { pattern: 'bolt', accent: 0x9fd8ff },
    juraSwing: { pattern: 'talon', accent: 0x9fe86a },
    mushSwing: { pattern: 'petal', accent: 0xffb7d5 },
    tropicSwing: { pattern: 'water', accent: 0x5fe8d0 },
    cryptSwing: { pattern: 'bone', accent: 0x9fd8a0 },
    festivSwing: { pattern: 'candy', accent: 0xffd45c },
    sushiSwing: { pattern: 'slash', accent: 0xfff0d0 },
    wildSwing: { pattern: 'crescent', accent: 0xffd45c },
};
/** 坐骑主色的镜像表（避免和 cosmetics 的 `MOUNT_COLORS` 互相 import） */
export const MOUNT_TINT_2 = {
    pirateMount: 0x8a5a2a,
    steamMount: 0x8a6a3a,
    astroMount: 0xd8e8ff,
    juraMount: 0x6a9a4a,
    mushMount: 0x8a6a4a,
    tropicMount: 0x4aa88a,
    cryptMount: 0xd8c8a0,
    festivMount: 0x8a5a2a,
    sushiMount: 0x8a6238,
    wildMount: 0x8a5a2a,
};
