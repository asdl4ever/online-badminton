import Phaser from 'phaser';
import type { CharacterPose } from './character';
import type {
  ThemeHatArt,
  ThemeAuraArt,
  ThemeRingArt,
  ThemeMountArt,
  ThemeRacketArt,
  ThemeTrailArt,
  ThemeSwingArt,
} from './themeart';

/**
 * **第四批 20 个主题宝箱**的绘制规格（见 `game/chest.ts` 的 `CHEST_THEMES`）。
 *
 * 与第三批一样：一件物品 = 一条 spec（图案 + 主色 + 点缀色），
 * 各部位的绘制函数在最前面查一次 spec 表、命中就走 `themeart.ts` 的通用画法；
 * 每个主题另有**一只独立造型的招牌形象**（`THEME_SKIN_ART_3`）。
 *
 * 这些表由 `themeart.ts` 展开进它自己的表里（`...THEME_HATS_3` 等），
 * 所以各绘制入口不用改。
 *
 * 20 个主题：🌋 熔岩核心 / 🌊 深渊海沟 / 🥋 道场精神 / 🖌️ 水墨江南 /
 * 🦋 精灵花园 / 🏁 极速竞逐 / 🦇 吸血鬼城堡 / 🍁 秋日枫林 / 🐼 竹林熊猫 /
 * 🃏 纸牌王国 / 🏯 古都风华 / 🌪️ 风暴之眼 / 🐇 月宫玉兔 / ⚔️ 维京战船 /
 * 🦁 草原巡礼 / 🎭 戏剧后台 / 🌠 极光夜境 / 🛶 水城泛舟 / 🏛️ 古希腊 / 🥁 桑巴狂欢
 */

const TAU = Math.PI * 2;

/** 眨眼开合（1 睁 / 0 闭） */
function blinkAt(now: number, period = 3400, dur = 170): number {
  const t = now % period;
  if (t < period - dur) return 1;
  return Math.abs(1 - ((t - (period - dur)) / dur) * 2);
}

/** 二次贝塞尔的折线近似（Phaser Graphics 与 DOM 适配层都只认 moveTo/lineTo） */
function quadTo(
  g: Phaser.GameObjects.Graphics,
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
): void {
  for (let s = 1; s <= 8; s++) {
    const u = s / 8;
    const v = 1 - u;
    g.lineTo(v * v * x0 + 2 * v * u * cx + u * u * x1, v * v * y0 + 2 * v * u * cy + u * u * y1);
  }
}

/** 一对圆眼（会眨 + 高光） */
function eyes(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  off: number,
  r: number,
  open: number,
  ink: number,
): void {
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

// ---- 🌋 熔岩核心：熔岩巨人 --------------------------------------------------
function drawVulcTitan(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const feetY = pose.feetY;
  const breathe = Math.sin(now / 640);
  const glow = 0.5 + 0.5 * Math.sin(now / 320);
  const rock = 0x4a2a22;
  const rockDark = 0x33201a;
  const lava = 0xff5a1a;
  const ember = 0xffb347;

  g.fillStyle(0, 0.14);
  g.fillEllipse(x, feetY + 2, 52, 9);
  // 熔岩底光
  g.fillStyle(lava, 0.12 + 0.08 * glow);
  g.fillEllipse(x, feetY - 46, 74, 96);
  // 岩石躯干（呼吸起伏）
  g.fillStyle(rock, 1);
  g.fillRoundedRect(x - 19, feetY - 64 + breathe * 1.5, 38, 60, 12);
  g.fillStyle(rockDark, 1);
  g.fillRoundedRect(x - 19, feetY - 30 + breathe * 1.5, 38, 26, 10);
  // 躯干裂纹（发亮的熔岩缝）
  g.lineStyle(2.4, lava, 0.55 + 0.4 * glow);
  g.lineBetween(x - 8, feetY - 58, x - 2, feetY - 44);
  g.lineBetween(x - 2, feetY - 44, x + 7, feetY - 40);
  g.lineBetween(x + 4, feetY - 30, x - 5, feetY - 20);
  g.lineBetween(x - 5, feetY - 20, x + 3, feetY - 12);
  g.lineStyle(1.6, ember, 0.4 + 0.3 * glow);
  g.lineBetween(x + 9, feetY - 56, x + 13, feetY - 46);
  // 岩臂
  g.fillStyle(rock, 1);
  g.fillRoundedRect(x - 27, feetY - 58, 10, 24, 5);
  g.fillRoundedRect(x + 17, feetY - 58, 10, 24, 5);
  g.fillStyle(lava, 0.8 * glow + 0.2);
  g.fillCircle(x - 22, feetY - 34, 2.6);
  g.fillCircle(x + 22, feetY - 34, 2.6);
  // 粗腿
  g.fillStyle(rockDark, 1);
  g.fillRoundedRect(x - 14, feetY - 10, 11, 12, 4);
  g.fillRoundedRect(x + 3, feetY - 10, 11, 12, 4);
  // 头
  const hy = feetY - 78 + breathe * 1.5;
  g.fillStyle(rock, 1);
  g.fillCircle(x, hy, 13);
  // 熔岩眼 + 嘴
  g.fillStyle(lava, 0.6 + 0.4 * glow);
  g.fillEllipse(x - 5, hy - 2, 5, 4);
  g.fillEllipse(x + 5, hy - 2, 5, 4);
  g.fillStyle(ember, 1);
  g.fillCircle(x - 5, hy - 2, 1.8);
  g.fillCircle(x + 5, hy - 2, 1.8);
  g.fillStyle(rockDark, 1);
  g.fillRect(x - 5, hy + 5, 10, 3);
  // 头顶岩角 + 冒火星
  g.fillStyle(rockDark, 1);
  g.fillTriangle(x - 14, hy - 8, x - 6, hy - 12, x - 9, hy - 2);
  g.fillTriangle(x + 14, hy - 8, x + 6, hy - 12, x + 9, hy - 2);
  for (let k = 0; k < 4; k++) {
    const t = (now / 1100 + k / 4) % 1;
    g.fillStyle(k % 2 ? lava : ember, 0.85 * (1 - t));
    g.fillCircle(x + Math.sin(k * 2.4 + now / 400) * 16, hy - 18 - t * 34, 1.8 + (k % 2));
  }
}

// ---- 🌊 深渊海沟：深渊巨妖 --------------------------------------------------
function drawTrenchLeviathan(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const sway = Math.sin(now / 560);
  const glow = 0.5 + 0.5 * Math.sin(now / 430);
  const skin = 0x1f4a58;
  const skinDark = 0x12303c;
  const fin = 0x5fd0c0;
  const eye = 0x9ffcf0;

  g.fillStyle(0, 0.16);
  g.fillEllipse(x, feetY + 2, 52, 9);
  // 深海冷光
  g.fillStyle(fin, 0.08 + 0.06 * glow);
  g.fillEllipse(x, feetY - 44, 78, 98);
  // 触腕（两条左右摆）
  g.lineStyle(5, skinDark, 1);
  g.beginPath();
  g.moveTo(x - f * 14, feetY - 44);
  quadTo(g, x - f * 14, feetY - 44, x - f * (34 + sway * 8), feetY - 34, x - f * (40 + sway * 10), feetY - 10);
  g.strokePath();
  g.beginPath();
  g.moveTo(x + f * 12, feetY - 40);
  quadTo(g, x + f * 12, feetY - 40, x + f * (30 - sway * 8), feetY - 26, x + f * (34 - sway * 9), feetY - 4);
  g.strokePath();
  // 触腕吸盘
  g.fillStyle(fin, 0.7);
  for (let k = 0; k < 3; k++) {
    g.fillCircle(x - f * (22 + k * 7), feetY - 36 + k * 8, 1.4);
    g.fillCircle(x + f * (20 + k * 6), feetY - 30 + k * 8, 1.4);
  }
  // 躯干（水滴形）
  g.fillStyle(skin, 1);
  g.fillEllipse(x, feetY - 36, 40, 60);
  g.fillStyle(skinDark, 1);
  g.fillEllipse(x, feetY - 22, 34, 30);
  // 背鳍（摆）
  g.fillStyle(fin, 0.9);
  g.fillTriangle(x - 4, feetY - 62, x + f * 8, feetY - 70, x + f * 2 + sway * 3, feetY - 56);
  // 巨眼（会眨 + 发光）
  const hy = feetY - 56;
  g.fillStyle(skinDark, 1);
  g.fillEllipse(x + f * 8, hy, 15, 13);
  g.fillStyle(eye, 0.65 + 0.35 * glow);
  g.fillCircle(x + f * 9, hy, 5);
  g.fillStyle(0x0a1a20, 1);
  g.fillEllipse(x + f * 10, hy, 2.6, 6);
  g.fillStyle(0xffffff, 0.7);
  g.fillCircle(x + f * 7, hy - 2, 1.4);
  // 头顶灯笼（鮟鱇灯）
  g.lineStyle(1.6, skinDark, 1);
  g.lineBetween(x + f * 4, hy - 8, x + f * 16, hy - 20 + sway * 2);
  g.fillStyle(eye, 0.55 + 0.4 * glow);
  g.fillCircle(x + f * 17, hy - 22 + sway * 2, 5.4);
  g.fillStyle(0xffffff, 0.85);
  g.fillCircle(x + f * 17, hy - 22 + sway * 2, 2.4);
  // 冒上来的气泡
  for (let k = 0; k < 4; k++) {
    const t = (now / 1500 + k / 4) % 1;
    g.lineStyle(1.4, 0xbfe8f0, 0.55 * (1 - t));
    g.strokeCircle(x + Math.sin(k * 2.2) * 22, feetY - 60 - t * 60, 2 + (k % 3));
  }
}

// ---- 🥋 道场精神：道场师范 --------------------------------------------------
function drawDojoMaster(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const breathe = Math.sin(now / 720) * 1.2;
  const gi = 0xf0eee4;
  const belt = 0x1a1a22;
  const skin = 0xf0c9a0;
  const ink = 0x1a1a22;
  const red = 0xc0392b;

  g.fillStyle(0, 0.12);
  g.fillEllipse(x, feetY + 2, 44, 9);
  // 道服
  g.fillStyle(gi, 1);
  g.fillRoundedRect(x - 17, feetY - 64 + breathe, 34, 60, 8);
  g.fillStyle(0xd8d4c4, 1);
  g.fillRect(x - 17, feetY - 40 + breathe, 34, 5);
  // 黑带（带飘尾）
  g.fillStyle(belt, 1);
  g.fillRect(x - 17, feetY - 40 + breathe, 34, 7);
  g.fillTriangle(x + 2, feetY - 33 + breathe, x + 8, feetY - 33 + breathe, x + 7 + Math.sin(now / 380) * 3, feetY - 20 + breathe);
  // 扎马步的腿
  g.fillStyle(gi, 1);
  g.fillRoundedRect(x - 20, feetY - 22, 12, 22, 5);
  g.fillRoundedRect(x + 8, feetY - 22, 12, 22, 5);
  g.fillStyle(0xf0eee4, 1);
  g.fillRect(x - 24, feetY - 4, 14, 5);
  g.fillRect(x + 10, feetY - 4, 14, 5);
  // 出拳的手臂（蓄力呼吸）
  const punch = 4 + Math.sin(now / 300) * 4;
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x + 14 + punch, feetY - 54 + breathe, 10, 9, 4);
  g.fillStyle(gi, 1);
  g.fillRoundedRect(x - 3, feetY - 56 + breathe, 18 + punch, 9, 4);
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x - 25, feetY - 56 + breathe, 9, 14, 4);
  // 头 + 白胡子
  const hy = feetY - 80 + breathe;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 13);
  eyes(g, x + f * 2, hy - 1, 5, 3, blinkAt(now), ink);
  g.fillStyle(0xd8d4c8, 1);
  g.fillEllipse(x, hy + 10, 16, 12);
  g.fillEllipse(x + f * 6, hy + 2, 8, 5);
  // 额头红点 + 束发
  g.fillStyle(red, 1);
  g.fillCircle(x, hy - 8, 2.2);
  g.fillStyle(belt, 1);
  g.fillRect(x - 13, hy - 14, 26, 5);
  // 地上的汗滴
  for (let k = 0; k < 3; k++) {
    const t = (now / 1200 + k / 3) % 1;
    g.fillStyle(0x9fd8ff, 0.5 * (1 - t));
    g.fillCircle(x - 20 + k * 20, feetY - 6 - t * 14, 1.8);
  }
}

// ---- 🖌️ 水墨江南：水墨先生 --------------------------------------------------
function drawInkwScribe(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const sway = Math.sin(now / 700);
  const robe = 0xe8e4d8;
  const robeDark = 0xb8b4a4;
  const ink = 0x2a2e36;
  const skin = 0xf0d8c0;
  const teal = 0x5a8a7a;

  g.fillStyle(0, 0.1);
  g.fillEllipse(x, feetY + 2, 44, 9);
  // 长衫（下摆微飘）
  g.fillStyle(robe, 1);
  g.fillTriangle(x - 18, feetY - 2, x + 18, feetY - 2, x + 8, feetY - 62 + sway);
  g.fillTriangle(x - 18, feetY - 2, x - 8, feetY - 62 + sway, x + 8, feetY - 62 + sway);
  g.fillStyle(robeDark, 1);
  g.fillTriangle(x - 18, feetY - 2, x + 4, feetY - 2, x - 4, feetY - 26);
  // 交叠的袖子 + 摇着的折扇
  g.fillStyle(robe, 1);
  g.fillRoundedRect(x - 24, feetY - 52, 12, 20, 5);
  g.fillRoundedRect(x + 12, feetY - 52, 12, 20, 5);
  g.save();
  g.translateCanvas(x + f * 24, feetY - 46);
  g.rotateCanvas(Math.sin(now / 500) * 0.35 - 0.5);
  g.fillStyle(teal, 0.95);
  g.fillTriangle(-9, 0, 9, 0, 0, -20);
  g.lineStyle(1.6, 0x8a6a4a, 1);
  g.lineBetween(0, 2, 0, -20);
  g.restore();
  // 头 + 束发方巾
  const hy = feetY - 76 + sway;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 13);
  eyes(g, x + f * 1, hy - 1, 4.6, 2.8, blinkAt(now), ink);
  g.fillStyle(ink, 1);
  g.fillRect(x - 12, hy - 16, 24, 8);
  g.fillStyle(robeDark, 1);
  g.fillTriangle(x - 12, hy - 16, x + 12, hy - 16, x, hy - 24);
  // 飘下来的墨点
  for (let k = 0; k < 3; k++) {
    const t = (now / 1600 + k / 3) % 1;
    g.fillStyle(ink, 0.4 * (1 - t));
    g.fillCircle(x + Math.sin(k * 2.6 + now / 600) * 26, hy - 20 - t * 30, 1.6 + (k % 2));
  }
}

// ---- 🦋 精灵花园：花园精灵 --------------------------------------------------
function drawFairyDuchess(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const hover = Math.sin(now / 520) * 2.4;
  const glow = 0.5 + 0.5 * Math.sin(now / 400);
  const dress = 0x8fd88a;
  const dressDark = 0x5aa85a;
  const wing = 0xd8f8d0;
  const skin = 0xf7dcc4;
  const ink = 0x2a3a2a;
  const petal = 0xffb7d5;

  g.fillStyle(0, 0.1);
  g.fillEllipse(x, feetY + 2, 40, 8);
  // 花瓣裙（三层）
  g.fillStyle(dress, 1);
  g.fillTriangle(x - 20, feetY - 4, x + 20, feetY - 4, x, feetY - 44);
  g.fillStyle(dressDark, 1);
  for (let k = -2; k <= 2; k++) {
    g.fillTriangle(x + k * 8 - 4, feetY - 4, x + k * 8 + 4, feetY - 4, x + k * 8, feetY - 14);
  }
  // 小身子
  g.fillStyle(dress, 1);
  g.fillRoundedRect(x - 9, feetY - 52 + hover, 18, 22, 7);
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x - 16, feetY - 48 + hover, 7, 14, 3.5);
  g.fillRoundedRect(x + 9, feetY - 48 + hover, 7, 14, 3.5);
  // 振翅（两对，透明感）
  const flap = Math.sin(now / 90);
  g.fillStyle(wing, 0.55 + 0.15 * flap);
  g.fillEllipse(x - f * 16, feetY - 56 + hover, 24, 12 + flap * 4);
  g.fillEllipse(x + f * 16, feetY - 56 + hover, 24, 12 - flap * 4);
  g.fillStyle(0xffffff, 0.4);
  g.fillEllipse(x - f * 13, feetY - 62 + hover, 14, 8);
  g.fillEllipse(x + f * 13, feetY - 62 + hover, 14, 8);
  // 头 + 触角
  const hy = feetY - 66 + hover;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 11);
  eyes(g, x + f * 1, hy - 1, 4, 2.6, blinkAt(now), ink);
  g.fillStyle(0xffa8b8, 0.5);
  g.fillEllipse(x - 8, hy + 5, 5, 3.4);
  g.fillEllipse(x + 8, hy + 5, 5, 3.4);
  g.lineStyle(1.4, ink, 1);
  g.lineBetween(x - 4, hy - 10, x - 8, hy - 17);
  g.lineBetween(x + 4, hy - 10, x + 8, hy - 17);
  g.fillStyle(petal, 1);
  g.fillCircle(x - 8, hy - 18, 2);
  g.fillCircle(x + 8, hy - 18, 2);
  // 头顶小花 + 萤光
  g.fillStyle(petal, 1);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * TAU + now / 600;
    g.fillEllipse(x + Math.cos(a) * 4, hy - 24 + Math.sin(a) * 3, 4, 3);
  }
  g.fillStyle(0xfff2b0, 0.5 + 0.4 * glow);
  g.fillCircle(x, hy - 24, 2);
  // 绕身的萤光点
  for (let k = 0; k < 5; k++) {
    const a = now / 800 + (k / 5) * TAU;
    g.fillStyle(0xfff2b0, 0.5 + 0.4 * Math.sin(now / 300 + k));
    g.fillCircle(x + Math.cos(a) * 30, feetY - 40 + Math.sin(a) * 18, 1.6);
  }
}

// ---- 🏁 极速竞逐：车手王牌 --------------------------------------------------
function drawRacerAce(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const shake = Math.sin(now / 90) * 1.1;
  const suit = 0xe8404a;
  const suitDark = 0xa82a34;
  const visor = 0x2a2e3a;
  const gold = 0xffd45c;

  g.fillStyle(0, 0.12);
  g.fillEllipse(x, feetY + 2, 46, 9);
  // 赛车服
  g.fillStyle(suit, 1);
  g.fillRoundedRect(x - 17, feetY - 64 + shake, 34, 60, 8);
  g.fillStyle(suitDark, 1);
  g.fillRect(x - 17, feetY - 46 + shake, 34, 5);
  g.fillStyle(0xf0f0f0, 1);
  g.fillRect(x - 4, feetY - 64 + shake, 8, 60);
  // 胸前号码牌
  g.fillStyle(0xf0f0f0, 1);
  g.fillRoundedRect(x - 8, feetY - 38 + shake, 16, 14, 3);
  g.fillStyle(suitDark, 1);
  g.fillRect(x - 3, feetY - 35 + shake, 3, 8);
  g.fillRect(x + 2, feetY - 35 + shake, 3, 8);
  // 手套
  g.fillStyle(0x2a2e3a, 1);
  g.fillRoundedRect(x - 25, feetY - 56 + shake, 9, 16, 4);
  g.fillRoundedRect(x + 16, feetY - 56 + shake, 9, 16, 4);
  // 站姿腿
  g.fillStyle(suitDark, 1);
  g.fillRoundedRect(x - 13, feetY - 12, 10, 12, 3);
  g.fillRoundedRect(x + 3, feetY - 12, 10, 12, 3);
  // 头 + 全罩头盔
  const hy = feetY - 80 + shake;
  g.fillStyle(0xf0f0f0, 1);
  g.fillCircle(x, hy, 15);
  g.fillStyle(suit, 1);
  g.fillEllipse(x, hy - 6, 30, 16);
  g.fillStyle(visor, 1);
  g.fillRoundedRect(x - 12, hy - 6, 24, 12, 5);
  g.fillStyle(0x9fd8ff, 0.5);
  g.fillEllipse(x - f * 2, hy - 2, 12, 5);
  // 头盔顶条纹 + 小尾翼
  g.fillStyle(suitDark, 1);
  g.fillRect(x - 3, hy - 22, 6, 10);
  g.fillTriangle(x - f * 12, hy - 14, x - f * 20, hy - 10, x - f * 12, hy - 8);
  // 身后的速度线
  for (let k = 0; k < 4; k++) {
    const t = (now / 700 + k / 4) % 1;
    g.lineStyle(2, gold, 0.6 * (1 - t));
    g.lineBetween(x - f * (20 + t * 34), feetY - 30 - k * 8, x - f * (30 + t * 34), feetY - 30 - k * 8);
  }
}

// ---- 🦇 吸血鬼城堡：血爵 ----------------------------------------------------
function drawVampCount(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const feetY = pose.feetY;
  const sway = Math.sin(now / 620);
  const glow = 0.5 + 0.5 * Math.sin(now / 460);
  const cape = 0x2a1230;
  const capeIn = 0x4a1a4a;
  const skin = 0xe8d8d0;
  const blood = 0xc0203a;
  const hair = 0x14101c;

  g.fillStyle(0, 0.15);
  g.fillEllipse(x, feetY + 2, 46, 9);
  // 高领大披风（左右摆）
  g.fillStyle(cape, 1);
  g.fillTriangle(x - 24 + sway * 3, feetY - 2, x + 24 + sway * 3, feetY - 2, x, feetY - 40);
  g.fillTriangle(x - 24 + sway * 3, feetY - 2, x - 6, feetY - 62, x, feetY - 40);
  g.fillTriangle(x + 24 + sway * 3, feetY - 2, x + 6, feetY - 62, x, feetY - 40);
  g.fillStyle(capeIn, 1);
  g.fillTriangle(x - 18 + sway * 2, feetY - 6, x + 18 + sway * 2, feetY - 6, x, feetY - 44);
  // 高领
  g.fillStyle(cape, 1);
  g.fillTriangle(x - 12, feetY - 60, x - 2, feetY - 74, x + 4, feetY - 58);
  g.fillTriangle(x + 12, feetY - 60, x + 2, feetY - 74, x - 4, feetY - 58);
  // 正装
  g.fillStyle(0x1a1420, 1);
  g.fillRoundedRect(x - 13, feetY - 58, 26, 34, 6);
  g.fillStyle(0xf0f0f0, 1);
  g.fillTriangle(x - 5, feetY - 56, x + 5, feetY - 56, x, feetY - 42);
  g.fillStyle(blood, 1);
  g.fillCircle(x, feetY - 46, 2.2);
  // 白手
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x - 22, feetY - 52, 8, 16, 4);
  g.fillRoundedRect(x + 14, feetY - 52, 8, 16, 4);
  // 头（苍白 + 尖耳 + 獠牙）
  const hy = feetY - 78;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 13);
  g.fillStyle(skin, 1);
  g.fillTriangle(x - 13, hy, x - 20, hy - 2 - sway, x - 12, hy + 6);
  g.fillTriangle(x + 13, hy, x + 20, hy - 2 - sway, x + 12, hy + 6);
  g.fillStyle(hair, 1);
  g.fillEllipse(x, hy - 10, 26, 12);
  g.fillStyle(blood, 0.5 + 0.4 * glow);
  g.fillEllipse(x - 5, hy - 1, 5, 3.4);
  g.fillEllipse(x + 5, hy - 1, 5, 3.4);
  g.fillStyle(0x3a0a12, 1);
  g.fillEllipse(x, hy + 7, 7, 4);
  g.fillStyle(0xffffff, 1);
  g.fillTriangle(x - 3, hy + 7, x - 1, hy + 7, x - 2, hy + 11);
  g.fillTriangle(x + 1, hy + 7, x + 3, hy + 7, x + 2, hy + 11);
  // 绕身的蝙蝠
  for (let k = 0; k < 2; k++) {
    const a = now / 1000 + k * Math.PI;
    const bx = x + Math.cos(a) * 34;
    const by = feetY - 70 + Math.sin(a) * 14;
    const fl = Math.sin(now / 80 + k) * 3;
    g.fillStyle(0x1a1024, 0.9);
    g.fillEllipse(bx, by, 7, 5);
    g.fillTriangle(bx - 3, by - 1, bx - 9, by - 3 - fl, bx - 4, by + 2);
    g.fillTriangle(bx + 3, by - 1, bx + 9, by - 3 + fl, bx + 4, by + 2);
  }
}

// ---- 🍁 秋日枫林：枫林守护者 ------------------------------------------------
function drawAutumnWarden(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const breathe = Math.sin(now / 680) * 1.2;
  const robe = 0x8a4a22;
  const robeDark = 0x5f3216;
  const maple = 0xd4622a;
  const gold = 0xffd45c;
  const skin = 0xf0c9a0;
  const ink = 0x2e1a0c;

  g.fillStyle(0, 0.12);
  g.fillEllipse(x, feetY + 2, 46, 9);
  // 枫叶大氅（一层层叶子）
  g.fillStyle(robe, 1);
  g.fillTriangle(x - 22, feetY - 2, x + 22, feetY - 2, x, feetY - 60 + breathe);
  g.fillStyle(robeDark, 1);
  g.fillTriangle(x - 22, feetY - 2, x + 6, feetY - 2, x - 6, feetY - 30);
  g.fillStyle(maple, 0.9);
  for (let k = -2; k <= 2; k++) {
    g.fillEllipse(x + k * 9, feetY - 8 - Math.abs(k) * 4, 9, 6);
  }
  // 皮甲 + 腰带
  g.fillStyle(robeDark, 1);
  g.fillRoundedRect(x - 15, feetY - 58 + breathe, 30, 26, 8);
  g.fillStyle(gold, 1);
  g.fillRect(x - 15, feetY - 40 + breathe, 30, 4);
  // 木杖手 + 法杖（杖头枫叶）
  g.fillStyle(robeDark, 1);
  g.fillRoundedRect(x - 24, feetY - 54 + breathe, 9, 20, 4);
  g.lineStyle(2.6, 0x6a4a2a, 1);
  g.lineBetween(x + 20, feetY - 2, x + 24, feetY - 66);
  g.fillStyle(maple, 1);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * TAU + Math.sin(now / 500) * 0.3;
    g.fillEllipse(x + 24 + Math.cos(a) * 6, feetY - 72 + Math.sin(a) * 5, 7, 5);
  }
  g.fillStyle(gold, 1);
  g.fillCircle(x + 24, feetY - 72, 2.4);
  // 头 + 兽皮兜帽
  const hy = feetY - 74 + breathe;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 12);
  eyes(g, x + f * 2, hy - 1, 4.6, 2.8, blinkAt(now), ink);
  g.fillStyle(robeDark, 1);
  g.fillTriangle(x - 14, hy - 6, x + 14, hy - 6, x, hy - 24);
  g.fillStyle(maple, 1);
  g.fillCircle(x - 8, hy - 12, 2);
  g.fillCircle(x + 8, hy - 12, 2);
  // 打旋落下的枫叶
  for (let k = 0; k < 5; k++) {
    const t = (now / 1800 + k / 5) % 1;
    g.fillStyle(k % 2 ? maple : gold, 0.8 * (1 - t * 0.5));
    g.fillEllipse(
      x + Math.sin(k * 2.4 + now / 500) * 26, feetY - 70 + t * 90, 6, 4,
    );
  }
}

// ---- 🐼 竹林熊猫：竹团熊猫 --------------------------------------------------
function drawPandaSpirit(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const feetY = pose.feetY;
  const breathe = Math.sin(now / 660);
  const fur = 0xf4f4ee;
  const black = 0x2a2e2c;
  const ink = 0x1a1e1c;
  const bamboo = 0x8fbf5a;
  const bambooDark = 0x5f8a3a;

  g.fillStyle(0, 0.12);
  g.fillEllipse(x, feetY + 2, 46, 9);
  // 圆滚滚的白身子（呼吸压扁回弹）
  const sq = 1 + breathe * 0.05;
  g.fillStyle(fur, 1);
  g.fillEllipse(x, feetY - 26, 44 * sq, 48 / sq);
  // 黑色前肢（一只抱着竹子）
  g.fillStyle(black, 1);
  g.fillEllipse(x - 15, feetY - 22, 13, 24);
  g.fillEllipse(x + 15, feetY - 22, 13, 24);
  // 黑腿 + 黑脚印
  g.fillStyle(black, 1);
  g.fillEllipse(x - 10, feetY - 4, 11, 8);
  g.fillEllipse(x + 10, feetY - 4, 11, 8);
  // 抱着的竹竿（一手扶着）
  g.lineStyle(5, bambooDark, 1);
  g.lineBetween(x + 20, feetY - 2, x + 16, feetY - 66);
  g.lineStyle(3, bamboo, 1);
  g.lineBetween(x + 19, feetY - 10, x + 16.5, feetY - 60);
  g.fillStyle(bamboo, 1);
  for (let k = 0; k < 4; k++) {
    const ly = feetY - 56 + k * 8;
    g.fillEllipse(x + 12 + Math.sin(now / 400 + k) * 3, ly, 14, 5);
  }
  // 竹叶簌簌落
  for (let k = 0; k < 3; k++) {
    const t = (now / 1400 + k / 3) % 1;
    g.fillStyle(bamboo, 0.75 * (1 - t));
    g.fillEllipse(x + Math.sin(k * 2.2 + now / 500) * 24, feetY - 60 + t * 70, 7, 4);
  }
  // 圆头 + 黑耳黑眼圈
  const hy = feetY - 62;
  g.fillStyle(fur, 1);
  g.fillCircle(x, hy, 17);
  g.fillStyle(black, 1);
  g.fillCircle(x - 12, hy - 12, 6);
  g.fillCircle(x + 12, hy - 12, 6);
  g.fillEllipse(x - 6, hy - 1, 8, 9);
  g.fillEllipse(x + 6, hy - 1, 8, 9);
  eyes(g, x, hy - 1, 3, 1.8, blinkAt(now), 0xffffff);
  g.fillStyle(ink, 1);
  g.fillEllipse(x, hy + 7, 5, 3.4);
  g.fillStyle(black, 1);
  g.fillEllipse(x, hy + 13, 6, 4);
}

// ---- 🃏 纸牌王国：纸牌小丑 --------------------------------------------------
function drawJokerJester(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const feetY = pose.feetY;
  const bounce = Math.sin(now / 380) * 2;
  const suit = 0x8a2a6a;
  const suit2 = 0x4a2a8a;
  const gold = 0xffd45c;
  const skin = 0xf4e8dc;
  const ink = 0x1a1a22;

  g.fillStyle(0, 0.12);
  g.fillEllipse(x, feetY + 2, 44, 9);
  // 菱格小丑服
  g.fillStyle(suit, 1);
  g.fillRoundedRect(x - 17, feetY - 62 + bounce, 34, 58, 10);
  g.fillStyle(suit2, 1);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if ((r + c) % 2 === 0) {
        g.fillTriangle(
          x - 17 + c * 11.3, feetY - 62 + r * 14.5 + bounce,
          x - 17 + (c + 1) * 11.3, feetY - 62 + r * 14.5 + bounce,
          x - 17 + c * 11.3 + 5.6, feetY - 62 + (r + 1) * 14.5 + bounce,
        );
      }
    }
  }
  // 铃铛手
  g.fillStyle(suit2, 1);
  g.fillRoundedRect(x - 25, feetY - 54 + bounce, 9, 20, 4);
  g.fillRoundedRect(x + 16, feetY - 54 + bounce, 9, 20, 4);
  g.fillStyle(gold, 1);
  g.fillCircle(x - 20, feetY - 32 + bounce, 3);
  g.fillCircle(x + 20, feetY - 32 + bounce, 3);
  // 尖头鞋
  g.fillStyle(gold, 1);
  g.fillTriangle(x - 18, feetY - 2, x - 2, feetY - 2, x - 26, feetY + 1);
  g.fillTriangle(x + 2, feetY - 2, x + 18, feetY - 2, x + 26, feetY + 1);
  g.fillStyle(gold, 0.8);
  g.fillCircle(x - 25, feetY, 2.2);
  g.fillCircle(x + 25, feetY, 2.2);
  // 头 + 白脸
  const hy = feetY - 78 + bounce;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 13);
  // 小丑妆：菱形眼 + 大红嘴
  g.fillStyle(suit, 1);
  g.fillTriangle(x - 9, hy - 4, x - 2, hy - 4, x - 5.5, hy + 2);
  g.fillTriangle(x + 9, hy - 4, x + 2, hy - 4, x + 5.5, hy + 2);
  eyes(g, x, hy - 2, 4.4, 2.4, blinkAt(now), ink);
  g.fillStyle(0xc0203a, 1);
  g.fillEllipse(x, hy + 8, 12, 6);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(x - 3, hy + 8, 1.2);
  g.fillCircle(x + 3, hy + 8, 1.2);
  // 三尖帽（每尖一颗铃铛，跟着晃）
  g.fillStyle(suit, 1);
  g.fillTriangle(x - 18, hy - 10, x - 4, hy - 10, x - 14 + Math.sin(now / 300) * 3, hy - 30);
  g.fillStyle(suit2, 1);
  g.fillTriangle(x - 4, hy - 10, x + 10, hy - 10, x + 2, hy - 34);
  g.fillStyle(suit, 1);
  g.fillTriangle(x + 4, hy - 10, x + 18, hy - 10, x + 16 + Math.sin(now / 300 + 1) * 3, hy - 28);
  g.fillStyle(gold, 1);
  g.fillCircle(x - 14 + Math.sin(now / 300) * 3, hy - 32, 2.6);
  g.fillCircle(x + 2, hy - 36, 2.6);
  g.fillCircle(x + 16 + Math.sin(now / 300 + 1) * 3, hy - 30, 2.6);
  // 环绕飘的两张牌
  for (let k = 0; k < 2; k++) {
    const a = now / 900 + k * Math.PI;
    const px = x + Math.cos(a) * 32;
    const py = feetY - 46 + Math.sin(a) * 16;
    g.save();
    g.translateCanvas(px, py);
    g.rotateCanvas(a);
    g.fillStyle(0xf8f4ec, 1);
    g.fillRect(-5, -7, 10, 14);
    g.fillStyle(k ? 0xc0203a : ink, 1);
    g.fillTriangle(0, -3, -2.6, 1, 2.6, 1);
    g.restore();
  }
}

// ---- 🏯 古都风华：镇守将军 --------------------------------------------------
function drawPagodGeneral(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const breathe = Math.sin(now / 700) * 1.1;
  const armor = 0x6a2a20;
  const armorDark = 0x4a1c14;
  const gold = 0xffd45c;
  const skin = 0xf0c9a0;
  const ink = 0x20100a;

  g.fillStyle(0, 0.14);
  g.fillEllipse(x, feetY + 2, 48, 9);
  // 甲胄（叠瓦）
  g.fillStyle(armor, 1);
  g.fillRoundedRect(x - 18, feetY - 64 + breathe, 36, 60, 9);
  g.fillStyle(armorDark, 1);
  for (let r = 0; r < 4; r++) g.fillRect(x - 18, feetY - 52 + r * 12 + breathe, 36, 4);
  // 护心镜
  g.fillStyle(gold, 1);
  g.fillCircle(x, feetY - 44 + breathe, 6);
  g.fillStyle(armorDark, 1);
  g.fillCircle(x, feetY - 44 + breathe, 3);
  // 肩甲
  g.fillStyle(armor, 1);
  g.fillEllipse(x - 21, feetY - 58 + breathe, 14, 18);
  g.fillEllipse(x + 21, feetY - 58 + breathe, 14, 18);
  g.fillStyle(gold, 0.9);
  g.fillEllipse(x - 21, feetY - 62 + breathe, 10, 6);
  g.fillEllipse(x + 21, feetY - 62 + breathe, 10, 6);
  // 披风（背后金鳞）
  g.fillStyle(armorDark, 1);
  g.fillTriangle(x - f * 16, feetY - 62 + breathe, x - f * 22, feetY - 2, x + f * 2, feetY - 20);
  // 靠旗（背后两面小旗）
  for (const s of [-1, 1]) {
    g.save();
    g.translateCanvas(x + s * 16, feetY - 60 + breathe);
    g.rotateCanvas(s * (0.5 + Math.sin(now / 600) * 0.06));
    g.fillStyle(gold, 0.95);
    g.fillTriangle(0, 0, s * 6, -4, s * 6, 22);
    g.fillStyle(0xc0203a, 1);
    g.fillTriangle(0, 2, s * 4.4, -1, s * 4.4, 16);
    g.restore();
  }
  // 头 + 盔缨
  const hy = feetY - 80 + breathe;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 13);
  eyes(g, x + f * 2, hy - 1, 5, 3, blinkAt(now), ink);
  g.fillStyle(ink, 1);
  g.fillRect(x - 6, hy + 8, 12, 4);
  // 战盔
  g.fillStyle(armor, 1);
  g.fillEllipse(x, hy - 10, 30, 14);
  g.fillRoundedRect(x - 12, hy - 22, 24, 14, 5);
  g.fillStyle(gold, 1);
  g.fillEllipse(x, hy - 12, 22, 5);
  g.lineStyle(2, gold, 1);
  g.lineBetween(x, hy - 22, x, hy - 34);
  g.fillStyle(0xc0203a, 1);
  g.fillCircle(x, hy - 36, 3.4);
  g.fillStyle(gold, 0.6);
  g.fillCircle(x, hy - 36 + Math.sin(now / 200) * 1, 5);
}

// ---- 🌪️ 风暴之眼：驭风者 ----------------------------------------------------
function drawStormCaller(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const feetY = pose.feetY;
  const sway = Math.sin(now / 480);
  const robe = 0x3d4c5c;
  const robeLight = 0x5f7890;
  const glow = 0.5 + 0.5 * Math.sin(now / 360);
  const bolt = 0x9fd8ff;
  const skin = 0xd8e0e8;

  g.fillStyle(0, 0.12);
  g.fillEllipse(x, feetY + 2, 44, 9);
  // 飘起的长袍（下摆被风卷起）
  g.fillStyle(robe, 1);
  g.fillTriangle(x - 18, feetY - 4 + sway, x + 18, feetY - 4 - sway, x + 4, feetY - 62);
  g.fillTriangle(x - 18, feetY - 4 + sway, x - 4, feetY - 62, x + 4, feetY - 62);
  g.fillStyle(robeLight, 1);
  g.fillTriangle(x - 18, feetY - 4 + sway, x + 2, feetY - 4, x - 8, feetY - 34);
  // 袖子（一只前伸驭风）
  g.fillStyle(robe, 1);
  g.fillRoundedRect(x + 10, feetY - 56, 16 + sway * 2, 9, 4.5);
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x + 25 + sway * 2, feetY - 56, 8, 9, 4);
  g.fillRoundedRect(x - 24, feetY - 54, 9, 16, 4);
  // 脚（离地悬浮）
  g.fillStyle(robeLight, 1);
  g.fillEllipse(x - 6, feetY - 8, 9, 5);
  g.fillEllipse(x + 6, feetY - 10, 9, 5);
  // 头 + 兜帽
  const hy = feetY - 76;
  g.fillStyle(robe, 1);
  g.fillCircle(x, hy, 14);
  g.fillStyle(robeLight, 1);
  g.fillCircle(x, hy, 10);
  g.fillStyle(0x0e1822, 1);
  g.fillCircle(x, hy, 8);
  // 兜帽里的发光双眼
  g.fillStyle(bolt, 0.6 + 0.4 * glow);
  g.fillEllipse(x - 3, hy - 1, 3.4, 2.4);
  g.fillEllipse(x + 3, hy - 1, 3.4, 2.4);
  // 绕身的小旋风（两层弧，椭圆用折线采样画，DOM 适配层同样认）
  for (let k = 0; k < 2; k++) {
    const rx = 34 - k * 8;
    const ry = 44 - k * 10;
    const a0 = now / 500 + k * 2;
    g.lineStyle(1.8, k ? bolt : 0xffffff, 0.5 - k * 0.15);
    g.beginPath();
    for (let s = 0; s <= 20; s++) {
      const a = a0 + (s / 20) * 4.2;
      const px = x + Math.cos(a) * rx;
      const py = feetY - 40 + Math.sin(a) * ry;
      if (s === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.strokePath();
  }
  // 手前的雷光球
  g.fillStyle(bolt, 0.35 + 0.3 * glow);
  g.fillCircle(x + 34 + sway * 2, feetY - 52, 8);
  g.fillStyle(0xffffff, 0.6 + 0.3 * glow);
  g.fillCircle(x + 34 + sway * 2, feetY - 52, 3.4);
  // 竖着的细闪电
  for (let k = 0; k < 3; k++) {
    const jx = Math.sin(now / 70 + k * 2.4) * 5;
    g.lineStyle(1.4, 0xffffff, 0.5 + 0.3 * glow);
    g.lineBetween(x + 30 + k * 5, feetY - 62, x + 32 + k * 5 + jx, feetY - 74);
  }
}

// ---- 🐇 月宫玉兔：玉兔仙子 --------------------------------------------------
function drawLunarHare(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const hover = Math.sin(now / 540) * 2.2;
  const glow = 0.5 + 0.5 * Math.sin(now / 440);
  const robe = 0xe8f0fa;
  const robeTrim = 0xbfd4ee;
  const fur = 0xfafaf6;
  const ink = 0x3a3a42;
  const gold = 0xffd45c;

  g.fillStyle(0, 0.08);
  g.fillEllipse(x, feetY + 2, 40, 8);
  // 月白广袖裙
  g.fillStyle(robe, 1);
  g.fillTriangle(x - 19, feetY - 4, x + 19, feetY - 4, x, feetY - 48);
  g.fillStyle(robeTrim, 1);
  g.fillRect(x - 19, feetY - 8, 38, 3);
  // 广袖（飘）
  g.fillStyle(robe, 1);
  g.fillRoundedRect(x - 26, feetY - 52 + hover + sway2(now), 12, 18, 5);
  g.fillRoundedRect(x + 14, feetY - 52 + hover - sway2(now), 12, 18, 5);
  // 怀里的玉杵
  g.lineStyle(3.4, gold, 1);
  g.lineBetween(x - 6, feetY - 16 + hover, x + 10, feetY - 44 + hover);
  g.fillStyle(gold, 1);
  g.fillCircle(x + 11, feetY - 46 + hover, 4);
  // 长耳（一只是耳朵会动）
  const ear = Math.sin(now / 700) * 0.12;
  for (const s of [-1, 1]) {
    g.save();
    g.translateCanvas(x + s * 6, feetY - 76 + hover);
    g.rotateCanvas(s * (0.18 + (s > 0 ? ear : -ear)));
    g.fillStyle(fur, 1);
    g.fillEllipse(0, -12, 8, 26);
    g.fillStyle(0xffc4d0, 0.8);
    g.fillEllipse(0, -12, 4, 18);
    g.restore();
  }
  // 圆头
  const hy = feetY - 70 + hover;
  g.fillStyle(fur, 1);
  g.fillCircle(x, hy, 13);
  eyes(g, x + f * 2, hy - 1, 4.6, 2.6, blinkAt(now), ink);
  g.fillStyle(0xffa8b8, 0.55);
  g.fillEllipse(x - 8, hy + 5, 5, 3.4);
  g.fillEllipse(x + 8, hy + 5, 5, 3.4);
  g.fillStyle(ink, 1);
  g.fillTriangle(x - 2, hy + 5, x + 2, hy + 5, x, hy + 8);
  // 月晕环（头顶淡淡的环）
  g.lineStyle(1.6, robeTrim, 0.3 + 0.25 * glow);
  g.strokeCircle(x, hy - 8, 20);
  // 环绕的桂花与月尘
  for (let k = 0; k < 5; k++) {
    const a = now / 900 + (k / 5) * TAU;
    g.fillStyle(k % 2 ? gold : 0xffffff, 0.55 + 0.35 * Math.sin(now / 300 + k));
    g.fillCircle(x + Math.cos(a) * 30, feetY - 44 + Math.sin(a) * 16, 1.8);
  }
}
/** 玉兔袖子的小相位 */
function sway2(now: number): number {
  return Math.sin(now / 620) * 2;
}

// ---- ⚔️ 维京战船：维京首领 --------------------------------------------------
function drawVikingChieftain(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const breathe = Math.sin(now / 660) * 1.2;
  const mail = 0x8a94a4;
  const fur = 0x6a5240;
  const furLight = 0x8a705a;
  const steel = 0xc0c8d0;
  const skin = 0xe8b888;
  const ink = 0x241a10;
  const red = 0xb03030;

  g.fillStyle(0, 0.13);
  g.fillEllipse(x, feetY + 2, 48, 9);
  // 锁子甲 + 皮裙
  g.fillStyle(mail, 1);
  g.fillRoundedRect(x - 17, feetY - 60 + breathe, 34, 40, 8);
  g.fillStyle(fur, 1);
  g.fillRoundedRect(x - 17, feetY - 26 + breathe, 34, 16, 5);
  g.fillStyle(furLight, 1);
  for (let k = -2; k <= 2; k++) g.fillTriangle(x + k * 7 - 3, feetY - 12, x + k * 7 + 3, feetY - 12, x + k * 7, feetY - 4);
  // 腿 + 皮靴
  g.fillStyle(0x3a3026, 1);
  g.fillRoundedRect(x - 13, feetY - 12, 10, 12, 3);
  g.fillRoundedRect(x + 3, feetY - 12, 10, 12, 3);
  // 战斧（扛在肩上）
  g.lineStyle(3.4, 0x6a4a2a, 1);
  g.lineBetween(x + f * 14, feetY - 66 + breathe, x + f * 24, feetY - 22 + breathe);
  g.fillStyle(steel, 1);
  g.fillEllipse(x + f * 22, feetY - 66 + breathe, 16, 11);
  g.fillStyle(steel, 0.7);
  g.fillEllipse(x + f * 22, feetY - 66 + breathe, 9, 5);
  // 盾（挂在另一侧）
  g.fillStyle(0x7a4a2a, 1);
  g.fillCircle(x - f * 22, feetY - 40 + breathe, 11);
  g.fillStyle(steel, 1);
  g.fillCircle(x - f * 22, feetY - 40 + breathe, 4);
  g.lineStyle(1.6, steel, 0.8);
  g.strokeCircle(x - f * 22, feetY - 40 + breathe, 9);
  // 头 + 大胡子 + 辫子
  const hy = feetY - 74 + breathe;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 13);
  eyes(g, x + f * 2, hy - 2, 4.6, 2.8, blinkAt(now), ink);
  g.fillStyle(0x8a5a2a, 1);
  g.fillEllipse(x, hy + 10, 18, 12);
  g.fillTriangle(x - f * 8, hy + 14, x - f * 12, hy + 24, x - f * 2, hy + 14);
  g.fillStyle(red, 0.6);
  g.fillTriangle(x - 4, hy - 8, x + 4, hy - 8, x, hy - 6);
  // 角盔（无角不维京）
  g.fillStyle(furLight, 1);
  g.fillEllipse(x, hy - 11, 28, 12);
  g.fillStyle(0xe8dcc0, 1);
  g.save();
  g.translateCanvas(x - 13, hy - 13);
  g.rotateCanvas(-0.5 + Math.sin(now / 500) * 0.05);
  g.fillTriangle(0, 0, 0, -14, -6, -2);
  g.restore();
  g.save();
  g.translateCanvas(x + 13, hy - 13);
  g.rotateCanvas(0.5 - Math.sin(now / 500) * 0.05);
  g.fillTriangle(0, 0, 0, -14, 6, -2);
  g.restore();
  // 头顶盘旋的海鸥
  const a = now / 800;
  g.lineStyle(1.6, 0xf0f0f0, 0.8);
  const gx = x + Math.cos(a) * 36;
  const gy = feetY - 84 + Math.sin(a) * 10;
  g.lineBetween(gx - 4, gy, gx, gy - 3);
  g.lineBetween(gx, gy - 3, gx + 4, gy);
}

// ---- 🦁 草原巡礼：草原狮后 --------------------------------------------------
function drawSafariLioness(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const breathe = Math.sin(now / 640);
  const fur = 0xd8a45a;
  const furDark = 0xa87a3a;
  const mane = 0xb06a2a;
  const belly = 0xf0d8b0;
  const ink = 0x2e1e0e;
  const grass = 0x9aa74a;

  g.fillStyle(0, 0.13);
  g.fillEllipse(x, feetY + 2, 50, 9);
  // 尾巴（甩）
  g.lineStyle(3, fur, 1);
  g.beginPath();
  g.moveTo(x - f * 14, feetY - 26);
  quadTo(
    g, x - f * 14, feetY - 26,
    x - f * 30, feetY - 30,
    x - f * (40 + Math.sin(now / 300) * 5), feetY - 40,
  );
  g.strokePath();
  g.fillStyle(furDark, 1);
  g.fillCircle(x - f * (40 + Math.sin(now / 300) * 5), feetY - 41, 3);
  // 狮身
  g.fillStyle(fur, 1);
  g.fillEllipse(x, feetY - 26, 44, 40);
  g.fillStyle(belly, 1);
  g.fillEllipse(x + f * 4, feetY - 16, 26, 16);
  // 四肢
  g.fillStyle(fur, 1);
  g.fillRoundedRect(x - 16, feetY - 14 + breathe, 9, 14, 4);
  g.fillRoundedRect(x + 7, feetY - 14 - breathe, 9, 14, 4);
  g.fillStyle(furDark, 1);
  g.fillRoundedRect(x - 17, feetY - 4 + breathe, 11, 5, 2.5);
  g.fillRoundedRect(x + 6, feetY - 4 - breathe, 11, 5, 2.5);
  // 颈鬃
  g.fillStyle(mane, 1);
  for (let k = 0; k < 10; k++) {
    const a = -0.7 + (k / 9) * 2.6;
    g.fillEllipse(x + f * 8 + Math.cos(a) * 14, feetY - 44 + Math.sin(a) * 14, 10, 7);
  }
  // 头
  const hy = feetY - 46;
  g.fillStyle(fur, 1);
  g.fillCircle(x + f * 8, hy, 13);
  g.fillStyle(furDark, 1);
  g.fillTriangle(x + f * 4, hy + 6, x + f * 12, hy + 6, x + f * 8, hy + 10);
  eyes(g, x + f * 10, hy - 2, 4, 2.4, blinkAt(now), ink);
  g.fillStyle(mane, 1);
  g.fillTriangle(x + f * 2, hy - 10, x + f * 8, hy - 14, x + f * 6, hy - 5);
  g.fillTriangle(x + f * 14, hy - 10, x + f * 12, hy - 14, x + f * 12, hy - 5);
  // 头顶两位小鸟报信
  const hop = Math.abs(Math.sin(now / 300)) * 2;
  g.fillStyle(0x6fa8d8, 1);
  g.fillEllipse(x + f * 20, hy - 22 - hop, 7, 6);
  g.fillStyle(0xffb03a, 1);
  g.fillTriangle(x + f * 24, hy - 22 - hop, x + f * 28, hy - 20 - hop, x + f * 24, hy - 19 - hop);
  // 脚边的草浪
  for (let k = 0; k < 5; k++) {
    g.lineStyle(1.6, grass, 0.7);
    const gx = x - 24 + k * 12;
    g.lineBetween(gx, feetY + 2, gx + Math.sin(now / 400 + k) * 3, feetY - 8);
  }
}

// ---- 🎭 戏剧后台：台柱名伶 --------------------------------------------------
function drawTheatDiva(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const sway = Math.sin(now / 560);
  const gown = 0xa82a4a;
  const gownDark = 0x701c30;
  const gold = 0xffd45c;
  const skin = 0xf7dcc4;
  const ink = 0x2a1420;
  const glow = 0.5 + 0.5 * Math.sin(now / 380);

  g.fillStyle(0, 0.12);
  g.fillEllipse(x, feetY + 2, 44, 9);
  // 大摆礼服（多层裙摆，走一下晃一下）
  g.fillStyle(gown, 1);
  g.fillTriangle(x - 22, feetY - 2, x + 22, feetY - 2, x + sway * 2, feetY - 52);
  g.fillStyle(gownDark, 1);
  g.fillTriangle(x - 22, feetY - 2, x - 2, feetY - 2, x - 8, feetY - 26);
  g.fillStyle(gold, 0.85);
  g.fillTriangle(x - 4, feetY - 2, x + 4, feetY - 2, x, feetY - 14);
  // 蕾丝袖（抬起谢幕的那只）
  g.fillStyle(gown, 1);
  g.fillRoundedRect(x - 4, feetY - 60 + sway, 20 + sway * 2, 9, 4.5);
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x + 15 + sway * 2, feetY - 62 + sway, 7, 8, 3.5);
  g.fillRoundedRect(x - 22, feetY - 52, 8, 16, 4);
  // 头 + 高盘发
  const hy = feetY - 74 + sway;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 12);
  eyes(g, x + f * 2, hy - 1, 4.4, 2.6, blinkAt(now), ink);
  g.fillStyle(0xc0203a, 0.5);
  g.fillEllipse(x - 7, hy + 5, 5, 3);
  g.fillEllipse(x + 7, hy + 5, 5, 3);
  g.fillStyle(0x3a1a24, 1);
  g.fillEllipse(x, hy - 12, 22, 12);
  g.fillEllipse(x + f * 10, hy - 8, 10, 8);
  // 发间的金冠
  g.fillStyle(gold, 1);
  g.fillTriangle(x - 8, hy - 16, x - 4, hy - 16, x - 6, hy - 22);
  g.fillTriangle(x - 2, hy - 16, x + 2, hy - 16, x, hy - 24);
  g.fillTriangle(x + 4, hy - 16, x + 8, hy - 16, x + 6, hy - 22);
  // 头顶的追光
  g.fillStyle(0xfff0c0, 0.1 + 0.08 * glow);
  g.fillTriangle(x - 22, feetY - 84, x + 22, feetY - 84, x, feetY + 2);
  // 身边散落的掌声星星
  for (let k = 0; k < 4; k++) {
    const t = (now / 1100 + k / 4) % 1;
    const r = 4 * (1 - t) + 1;
    g.fillStyle(gold, 0.8 * (1 - t));
    g.fillCircle(x + Math.sin(k * 2.6) * 30, feetY - 60 - t * 26, r);
  }
}

// ---- 🌠 极光夜境：极光萨满 --------------------------------------------------
function drawBoreaShaman(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const sway = Math.sin(now / 620);
  const glow = 0.5 + 0.5 * Math.sin(now / 400);
  const robe = 0x2a4258;
  const robeTrim = 0x7dffc4;
  const fur = 0xd8e4ee;

  g.fillStyle(0, 0.12);
  g.fillEllipse(x, feetY + 2, 44, 9);
  // 极光底光
  g.fillStyle(robeTrim, 0.07 + 0.06 * glow);
  g.fillEllipse(x, feetY - 44, 80, 100);
  // 兽裘长袍
  g.fillStyle(robe, 1);
  g.fillTriangle(x - 20, feetY - 2, x + 20, feetY - 2, x, feetY - 62);
  g.fillStyle(fur, 1);
  g.fillRect(x - 20, feetY - 8, 40, 6);
  g.fillStyle(robeTrim, 0.7);
  g.fillRect(x - 20, feetY - 3, 40, 2);
  // 骨杖（杖头晶簇）
  g.lineStyle(3, 0x6a4a30, 1);
  g.lineBetween(x + f * 20, feetY - 2, x + f * 24, feetY - 64);
  g.fillStyle(robeTrim, 0.6 + 0.3 * glow);
  g.fillTriangle(x + f * 24, feetY - 62, x + f * 18, feetY - 74, x + f * 30, feetY - 74);
  g.fillStyle(0xdffcf0, 0.85);
  g.fillTriangle(x + f * 24, feetY - 66, x + f * 20, feetY - 74, x + f * 28, feetY - 74);
  // 兜帽 + 围裘
  const hy = feetY - 76 + sway;
  g.fillStyle(robe, 1);
  g.fillCircle(x, hy, 14);
  g.fillStyle(fur, 1);
  g.fillEllipse(x, hy + 11, 26, 9);
  g.fillStyle(0x0c1620, 1);
  g.fillCircle(x, hy + 1, 8);
  g.fillStyle(robeTrim, 0.6 + 0.4 * glow);
  g.fillEllipse(x - 3, hy, 3, 2.4);
  g.fillEllipse(x + 3, hy, 3, 2.4);
  // 头顶细雪
  for (let k = 0; k < 5; k++) {
    const t = (now / 1700 + k / 5) % 1;
    g.fillStyle(0xffffff, 0.75 * (1 - t * 0.4));
    g.fillCircle(x + Math.sin(k * 2.3 + now / 600) * 28, hy - 24 + t * 90, 1.4 + (k % 2));
  }
  // 背后的极光带（两道弧）
  for (let k = 0; k < 2; k++) {
    g.lineStyle(3, k ? 0x9ad4ff : robeTrim, (0.3 + 0.2 * glow) * (1 - k * 0.3));
    g.beginPath();
    g.moveTo(x - 34 + k * 6, feetY - 30 - k * 18);
    quadTo(
      g, x - 34 + k * 6, feetY - 30 - k * 18,
      x - 10 + Math.sin(now / 700 + k) * 6, feetY - 78 - k * 12,
      x + 30 - k * 6, feetY - 40 - k * 16,
    );
    g.strokePath();
  }
}

// ---- 🛶 水城泛舟：贡多拉船夫 ------------------------------------------------
function drawVenicGondolier(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const row = Math.sin(now / 480);
  const shirt = 0x2a5a8a;
  const sash = 0xc0203a;
  const straw = 0xe0c88a;
  const ribbon = 0xc0203a;
  const skin = 0xf0c9a0;
  const ink = 0x1a2430;
  const teal = 0x2a8a8a;

  g.fillStyle(0, 0.12);
  g.fillEllipse(x, feetY + 2, 44, 9);
  // 条纹衫
  g.fillStyle(shirt, 1);
  g.fillRoundedRect(x - 16, feetY - 60, 32, 56, 8);
  g.fillStyle(0xf0f0f0, 1);
  for (let r = 0; r < 5; r++) g.fillRect(x - 16, feetY - 56 + r * 10, 32, 4);
  // 红腰带
  g.fillStyle(sash, 1);
  g.fillRect(x - 16, feetY - 34, 32, 6);
  // 摇桨的手臂（一推一拉）
  g.fillStyle(shirt, 1);
  g.fillRoundedRect(x - 4, feetY - 56 + row * 2, 18, 8, 4);
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x + 13 + row * 3, feetY - 57 + row * 2, 8, 9, 4);
  g.fillRoundedRect(x - 24, feetY - 54 - row * 2, 8, 16, 4);
  // 船桨（斜着划）
  g.save();
  g.translateCanvas(x + f * 18, feetY - 50 + row * 3);
  g.rotateCanvas(0.9 + row * 0.12);
  g.lineStyle(3.2, 0x8a6238, 1);
  g.lineBetween(0, 0, 0, 34);
  g.fillStyle(0x6a4a2a, 1);
  g.fillEllipse(0, 36, 10, 18);
  g.restore();
  // 头 + 草帽缎带
  const hy = feetY - 76;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 12);
  eyes(g, x + f * 2, hy - 1, 4.4, 2.6, blinkAt(now), ink);
  g.fillStyle(ink, 1);
  g.fillRect(x - 5, hy + 7, 10, 3);
  g.fillStyle(straw, 1);
  g.fillEllipse(x, hy - 10, 40, 12);
  g.fillRoundedRect(x - 12, hy - 22, 24, 13, 6);
  g.fillStyle(ribbon, 1);
  g.fillRect(x - 12, hy - 14, 24, 4);
  // 脚边的涟漪
  for (let k = 0; k < 2; k++) {
    const t = (now / 1300 + k / 2) % 1;
    g.lineStyle(1.4, 0xbfe8f0, 0.5 * (1 - t));
    g.strokeEllipse(x, feetY + 2, 30 + t * 30, 8 + t * 8);
  }
  // 飘过的音符
  for (let k = 0; k < 2; k++) {
    const t = (now / 1500 + k / 2) % 1;
    g.fillStyle(teal, 0.7 * (1 - t));
    g.fillCircle(x + Math.sin(k * 2 + now / 400) * 24, feetY - 66 - t * 30, 2);
    g.fillRect(x + Math.sin(k * 2 + now / 400) * 24 + 2, feetY - 74 - t * 30, 1.4, 8);
  }
}

// ---- 🏛️ 古希腊：奥林匹斯勇士 ------------------------------------------------
function drawOlympChampion(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const breathe = Math.sin(now / 680) * 1.2;
  const toga = 0xf0ead8;
  const togaShade = 0xd8d0b8;
  const gold = 0xffd45c;
  const bronze = 0xc08a3a;
  const skin = 0xf0c9a0;
  const ink = 0x2a2418;
  const glow = 0.5 + 0.5 * Math.sin(now / 420);

  g.fillStyle(0, 0.12);
  g.fillEllipse(x, feetY + 2, 46, 9);
  // 白托加袍（单肩）
  g.fillStyle(toga, 1);
  g.fillTriangle(x - 18, feetY - 2, x + 18, feetY - 2, x + 4, feetY - 62 + breathe);
  g.fillTriangle(x - 18, feetY - 2, x - 4, feetY - 62 + breathe, x + 4, feetY - 62 + breathe);
  g.fillStyle(togaShade, 1);
  g.fillTriangle(x - 18, feetY - 2, x + 2, feetY - 2, x - 6, feetY - 28);
  g.fillStyle(gold, 0.9);
  g.fillRect(x - 14, feetY - 34 + breathe, 28, 3);
  // 肌肉手臂（一只举起桂冠）
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x - 25, feetY - 56 + breathe, 9, 22, 4.5);
  g.fillRoundedRect(x + 16, feetY - 72, 9, 22, 4.5);
  // 举着的金桂冠
  g.lineStyle(2.6, gold, 1);
  g.strokeCircle(x + 20, feetY - 78, 8);
  g.fillStyle(gold, 1);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * TAU + now / 500;
    g.fillEllipse(x + 20 + Math.cos(a) * 8, feetY - 78 + Math.sin(a) * 8, 4, 2.6);
  }
  // 凉鞋长腿
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x - 13, feetY - 16, 9, 16, 4);
  g.fillRoundedRect(x + 4, feetY - 16, 9, 16, 4);
  g.fillStyle(bronze, 1);
  g.fillRect(x - 16, feetY - 4, 14, 3);
  g.fillRect(x + 2, feetY - 4, 14, 3);
  // 头 + 月桂头环
  const hy = feetY - 78 + breathe;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 13);
  eyes(g, x + f * 2, hy - 1, 4.6, 2.8, blinkAt(now), ink);
  g.fillStyle(0x8a6a4a, 1);
  g.fillEllipse(x, hy + 8, 8, 4);
  g.fillStyle(gold, 1);
  for (let k = -2; k <= 2; k++) g.fillEllipse(x + k * 5, hy - 12 + Math.abs(k) * 1.5, 5, 3);
  // 大理石柱与神光（背景件）
  g.fillStyle(0xe8e0d0, 0.9);
  g.fillRect(x - f * 34, feetY - 58, 8, 58);
  g.fillRect(x - f * 36, feetY - 62, 12, 5);
  g.fillStyle(gold, 0.12 + 0.1 * glow);
  g.fillEllipse(x + f * 30, feetY - 40, 30, 80);
}

// ---- 🥁 桑巴狂欢：桑巴舞者 --------------------------------------------------
function drawSambaDancer(g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose): void {
  const x = pose.x;
  const f = pose.facing;
  const feetY = pose.feetY;
  const dance = Math.sin(now / 240);
  const sway = Math.sin(now / 480);
  const outfit = 0x2a9a5a;
  const outfit2 = 0xffd45c;
  const pink = 0xff8ad4;
  const skin = 0xd89a6a;
  const ink = 0x1e1408;
  const glow = 0.5 + 0.5 * Math.sin(now / 300);

  g.fillStyle(0, 0.12);
  g.fillEllipse(x, feetY + 2, 44, 9);
  // 流苏舞裙（一层层随舞步摆）
  g.fillStyle(outfit, 1);
  g.fillTriangle(x - 19, feetY - 2, x + 19, feetY - 2, x + sway * 3, feetY - 40);
  g.fillStyle(pink, 0.95);
  for (let k = -3; k <= 3; k++) {
    g.fillTriangle(
      x + k * 6 - 3 + sway, feetY - 2, x + k * 6 + 3 + sway, feetY - 2,
      x + k * 6 + sway * 2, feetY - 12,
    );
  }
  // 亮片上衣
  g.fillStyle(outfit2, 0.9 + 0.1 * glow);
  g.fillRoundedRect(x - 12, feetY - 54 + dance * 1.5, 24, 18, 6);
  // 摇沙锤的手（上下摇）
  const shk = Math.sin(now / 160);
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x - 25, feetY - 50 + shk * 4, 8, 16, 4);
  g.fillRoundedRect(x + 17, feetY - 50 - shk * 4, 8, 16, 4);
  for (const s of [-1, 1]) {
    const by = feetY - 52 + s * shk * 6;
    g.fillStyle(outfit2, 1);
    g.fillCircle(x + s * 21, by, 5);
    g.fillStyle(outfit, 1);
    g.fillCircle(x + s * 21, by, 2.4);
  }
  // 高抬腿舞步
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x - 12, feetY - 12 + Math.max(0, dance) * 6, 8, 12, 4);
  g.fillRoundedRect(x + 4, feetY - 12 + Math.max(0, -dance) * 6, 8, 12, 4);
  g.fillStyle(pink, 1);
  g.fillEllipse(x - 9, feetY - 1 + Math.max(0, dance) * 6, 10, 4);
  g.fillEllipse(x + 7, feetY - 1 + Math.max(0, -dance) * 6, 10, 4);
  // 头 + 大羽冠
  const hy = feetY - 66 + dance * 1.5;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 12);
  eyes(g, x + f * 2, hy - 1, 4.4, 2.6, blinkAt(now), ink);
  g.fillStyle(0xc05a3a, 0.5);
  g.fillEllipse(x - 7, hy + 5, 5, 3);
  g.fillEllipse(x + 7, hy + 5, 5, 3);
  g.fillStyle(outfit2, 1);
  g.fillRect(x - 11, hy - 14, 22, 4);
  // 羽冠（三根会颤的羽毛）
  for (const [dx, c] of [[-8, pink], [0, outfit2], [8, 0x5ac8ff]] as [number, number][]) {
    g.save();
    g.translateCanvas(x + dx, hy - 14);
    g.rotateCanvas(dx / 22 + Math.sin(now / 200 + dx) * 0.08);
    g.fillStyle(c, 0.95);
    g.fillEllipse(0, -10, 6, 20);
    g.fillStyle(0xffffff, 0.5);
    g.fillEllipse(0, -12, 2.4, 12);
    g.restore();
  }
  // 环绕的彩带
  for (let k = 0; k < 3; k++) {
    const a = now / 500 + (k / 3) * TAU;
    g.lineStyle(2, [pink, outfit2, 0x5ac8ff][k], 0.6);
    g.beginPath();
    g.arc(x, feetY - 36, 30 + k * 4, a, a + 1.8, false, 0);
    g.strokePath();
  }
}

// ---- 招牌形象表 -----------------------------------------------------------
export const THEME_SKIN_ART_3: Record<
  string,
  (g: Phaser.GameObjects.Graphics, now: number, pose: CharacterPose) => void
> = {
  vulcSpirit: drawVulcTitan,
  trenchSpirit: drawTrenchLeviathan,
  dojoSpirit: drawDojoMaster,
  inkwSpirit: drawInkwScribe,
  fairySpirit: drawFairyDuchess,
  racerSpirit: drawRacerAce,
  vampSpirit: drawVampCount,
  autumnSpirit: drawAutumnWarden,
  pandaSpirit: drawPandaSpirit,
  jokerSpirit: drawJokerJester,
  pagodSpirit: drawPagodGeneral,
  stormSpirit: drawStormCaller,
  lunarSpirit: drawLunarHare,
  vikingSpirit: drawVikingChieftain,
  safariSpirit: drawSafariLioness,
  theatSpirit: drawTheatDiva,
  boreaSpirit: drawBoreaShaman,
  venicSpirit: drawVenicGondolier,
  olympSpirit: drawOlympChampion,
  sambaSpirit: drawSambaDancer,
};

// ---- 各部位 spec 表 -------------------------------------------------------
export const THEME_HATS_3: Record<string, ThemeHatArt> = {
  vulcHelm: { ornament: 'flame', accent: 0xff5a1a, base: 'band' },
  vulcCrown: { ornament: 'gem', accent: 0xffb347, base: 'topper' },
  trenchDiver: { ornament: 'drop', accent: 0x9ffcf0, base: 'band' },
  trenchCrown: { ornament: 'shell', accent: 0x5fd0c0, base: 'topper' },
  dojoHachimaki: { ornament: 'sword', accent: 0xc0392b, base: 'band' },
  dojoCrown: { ornament: 'banner', accent: 0xe8404a, base: 'topper' },
  inkwHat: { ornament: 'fan', accent: 0x5a8a7a, base: 'topper' },
  inkwCrown: { ornament: 'coin', accent: 0xffd45c, base: 'band' },
  fairyHat: { ornament: 'petal', accent: 0xffb7d5, base: 'topper' },
  fairyCrown: { ornament: 'leaf', accent: 0xa8ff9a, base: 'band' },
  racerHelm: { ornament: 'bolt', accent: 0xffd45c, base: 'band' },
  racerCrown: { ornament: 'star', accent: 0xffd45c, base: 'topper' },
  vampHat: { ornament: 'wing', accent: 0xc0203a, base: 'topper' },
  vampCrown: { ornament: 'crescent', accent: 0xb455d6, base: 'band' },
  autumnHat: { ornament: 'leaf', accent: 0xd4622a, base: 'topper' },
  autumnCrown: { ornament: 'leaf', accent: 0xffd45c, base: 'band' },
  pandaHat: { ornament: 'leaf', accent: 0x8fbf5a, base: 'band' },
  pandaCrown: { ornament: 'leaf', accent: 0x5f8a3a, base: 'topper' },
  jokerHat: { ornament: 'heart', accent: 0xffd45c, base: 'topper' },
  jokerCrown: { ornament: 'crown', accent: 0xffd45c, base: 'topper' },
  pagodHat: { ornament: 'coin', accent: 0xc0203a, base: 'band' },
  pagodCrown: { ornament: 'banner', accent: 0xffd45c, base: 'topper' },
  stormHat: { ornament: 'cloud', accent: 0x9fd8ff, base: 'band' },
  stormCrown: { ornament: 'bolt', accent: 0x9fd8ff, base: 'topper' },
  lunarHat: { ornament: 'leaf', accent: 0x8fbf5a, base: 'band' },
  lunarCrown: { ornament: 'crescent', accent: 0xffe89a, base: 'topper' },
  vikingHelm: { ornament: 'horn', accent: 0xc0c8d0, base: 'band' },
  vikingCrown: { ornament: 'sword', accent: 0xd8e0e8, base: 'topper' },
  safariHat: { ornament: 'sun', accent: 0x9aa74a, base: 'topper' },
  safariCrown: { ornament: 'sun', accent: 0xffb03a, base: 'band' },
  theatHat: { ornament: 'feather', accent: 0xffd45c, base: 'topper' },
  theatCrown: { ornament: 'star', accent: 0xfff0c0, base: 'band' },
  boreaHat: { ornament: 'snow', accent: 0x7dffc4, base: 'band' },
  boreaCrown: { ornament: 'gem', accent: 0x7dffc4, base: 'topper' },
  venicHat: { ornament: 'fan', accent: 0xc0203a, base: 'topper' },
  venicCrown: { ornament: 'shell', accent: 0xffd8a0, base: 'band' },
  olympWreath: { ornament: 'leaf', accent: 0xffd45c, base: 'band' },
  olympCrown: { ornament: 'sun', accent: 0xffd45c, base: 'topper' },
  sambaHat: { ornament: 'feather', accent: 0xff8ad4, base: 'topper' },
  sambaCrown: { ornament: 'star', accent: 0xffd45c, base: 'topper' },
};

export const THEME_AURAS_3: Record<string, ThemeAuraArt> = {
  vulcAuraA: { motion: 'pulse', accent: 0xff5a1a },
  vulcAuraB: { motion: 'swirl', accent: 0xffb347 },
  trenchAuraA: { motion: 'rise', accent: 0x5fd0c0 },
  trenchAuraB: { motion: 'drift', accent: 0x9ffcf0 },
  dojoAuraA: { motion: 'fall', accent: 0xbfe8f0 },
  dojoAuraB: { motion: 'pulse', accent: 0xe8404a },
  inkwAuraA: { motion: 'fall', accent: 0x2a2e36 },
  inkwAuraB: { motion: 'drift', accent: 0xbfe8e0 },
  fairyAuraA: { motion: 'fall', accent: 0xffb7d5 },
  fairyAuraB: { motion: 'sparkle', accent: 0xfff2b0 },
  racerAuraA: { motion: 'drift', accent: 0xff8a4a },
  racerAuraB: { motion: 'swirl', accent: 0xffd45c },
  vampAuraA: { motion: 'swirl', accent: 0x4a2a6a },
  vampAuraB: { motion: 'pulse', accent: 0xc0203a },
  autumnAuraA: { motion: 'fall', accent: 0xd4622a },
  autumnAuraB: { motion: 'rise', accent: 0xffd45c },
  pandaAuraA: { motion: 'fall', accent: 0x8fbf5a },
  pandaAuraB: { motion: 'drift', accent: 0xdcefff },
  jokerAuraA: { motion: 'orbit', accent: 0xff8ad4 },
  jokerAuraB: { motion: 'sparkle', accent: 0xffd45c },
  pagodAuraA: { motion: 'rise', accent: 0xffb03a },
  pagodAuraB: { motion: 'swirl', accent: 0xffd45c },
  stormAuraA: { motion: 'drift', accent: 0x9fd8ff },
  stormAuraB: { motion: 'ring', accent: 0xffffff },
  lunarAuraA: { motion: 'drift', accent: 0xe8f0ff },
  lunarAuraB: { motion: 'fall', accent: 0xffe89a },
  vikingAuraA: { motion: 'rise', accent: 0xffb03a },
  vikingAuraB: { motion: 'pulse', accent: 0x8fb4de },
  safariAuraA: { motion: 'drift', accent: 0xd8c8a0 },
  safariAuraB: { motion: 'pulse', accent: 0xff9a4a },
  theatAuraA: { motion: 'sparkle', accent: 0xffd45c },
  theatAuraB: { motion: 'orbit', accent: 0xfff0c0 },
  boreaAuraA: { motion: 'fall', accent: 0xffffff },
  boreaAuraB: { motion: 'swirl', accent: 0x7dffc4 },
  venicAuraA: { motion: 'rise', accent: 0xbfe8f0 },
  venicAuraB: { motion: 'orbit', accent: 0xffd8a0 },
  olympAuraA: { motion: 'orbit', accent: 0xffd45c },
  olympAuraB: { motion: 'pulse', accent: 0xfff0b0 },
  sambaAuraA: { motion: 'swirl', accent: 0xff8ad4 },
  sambaAuraB: { motion: 'pulse', accent: 0xffd45c },
};

export const THEME_RINGS_3: Record<string, ThemeRingArt> = {
  vulcRing: { pattern: 'spikes', accent: 0xff5a1a },
  trenchRing: { pattern: 'arcs', accent: 0x5fd0c0 },
  dojoRing: { pattern: 'arcs', accent: 0xc0392b },
  inkwRing: { pattern: 'petals', accent: 0x2a2e36 },
  fairyRing: { pattern: 'petals', accent: 0xffb7d5 },
  racerRing: { pattern: 'arcs', accent: 0xffd45c },
  vampRing: { pattern: 'runes', accent: 0xc0203a },
  autumnRing: { pattern: 'orbs', accent: 0xd4622a },
  pandaRing: { pattern: 'petals', accent: 0x8fbf5a },
  jokerRing: { pattern: 'arcs', accent: 0xe8404a },
  pagodRing: { pattern: 'runes', accent: 0xffd45c },
  stormRing: { pattern: 'arcs', accent: 0x9fd8ff },
  lunarRing: { pattern: 'orbs', accent: 0xe8f0ff },
  vikingRing: { pattern: 'spikes', accent: 0xc0c8d0 },
  safariRing: { pattern: 'orbs', accent: 0xffb03a },
  theatRing: { pattern: 'arcs', accent: 0xffd45c },
  boreaRing: { pattern: 'arcs', accent: 0x7dffc4 },
  venicRing: { pattern: 'arcs', accent: 0x5fe8d0 },
  olympRing: { pattern: 'arcs', accent: 0xffd45c },
  sambaRing: { pattern: 'orbs', accent: 0xff8ad4 },
};

export const THEME_MOUNTS_3: Record<string, ThemeMountArt> = {
  vulcHound: { family: 'beast', accent: 0xff5a1a },
  trenchRay: { family: 'glider', accent: 0x5fd0c0 },
  dojoCrest: { family: 'crest', accent: 0xe8404a },
  inkwBoat: { family: 'glider', accent: 0x8a9aa8 },
  fairySnail: { family: 'creature', accent: 0xffb7d5 },
  racerKart: { family: 'wheeled', accent: 0xe8404a },
  vampStallion: { family: 'beast', accent: 0x2a2a3a },
  autumnBoar: { family: 'beast', accent: 0x8a5a2a },
  pandaSled: { family: 'glider', accent: 0x8fbf5a },
  jokerCarriage: { family: 'wheeled', accent: 0xe8404a },
  pagodPalanquin: { family: 'float', accent: 0xc0392b },
  stormGlider: { family: 'glider', accent: 0x7fd4ff },
  lunarCloud: { family: 'float', accent: 0xe8f0ff },
  vikingDrakkar: { family: 'glider', accent: 0x8fb4de },
  safariElephant: { family: 'beast', accent: 0x9aa7b8 },
  theatSpotlight: { family: 'float', accent: 0xfff0c0 },
  boreaStag: { family: 'beast', accent: 0x7dffc4 },
  venicGondola: { family: 'glider', accent: 0x8a5a2a },
  olympChariot: { family: 'wheeled', accent: 0xf0ead8 },
  sambaFloat: { family: 'float', accent: 0xffd45c },
};

export const THEME_RACKETS_3: Record<string, ThemeRacketArt> = {
  vulcRacketA: { pattern: 'spike', accent: 0xff5a1a, frame: 'claw' },
  vulcRacketB: { pattern: 'gear', accent: 0xffb347, frame: 'flame' },
  trenchRacketA: { pattern: 'spike', accent: 0x5fd0c0, frame: 'blade' },
  trenchRacketB: { pattern: 'gem', accent: 0x9ffcf0, frame: 'teardrop' },
  dojoRacketA: { pattern: 'rope', accent: 0x8fbf5a, frame: 'leaf' },
  dojoRacketB: { pattern: 'spike', accent: 0xe8404a, frame: 'shield' },
  inkwRacketA: { pattern: 'rune', accent: 0x2a2e36, frame: 'scroll' },
  inkwRacketB: { pattern: 'rune', accent: 0x5a8a7a, frame: 'crescent' },
  fairyRacketA: { pattern: 'gem', accent: 0xffb7d5, frame: 'heart' },
  fairyRacketB: { pattern: 'gem', accent: 0xa8ff9a, frame: 'leaf' },
  racerRacketA: { pattern: 'gear', accent: 0xe8404a, frame: 'hex' },
  racerRacketB: { pattern: 'gear', accent: 0xffd45c, frame: 'blade' },
  vampRacketA: { pattern: 'rope', accent: 0x4a2a6a, frame: 'bone' },
  vampRacketB: { pattern: 'spike', accent: 0xc0203a, frame: 'claw' },
  autumnRacketA: { pattern: 'rope', accent: 0x8a5a2a, frame: 'leaf' },
  autumnRacketB: { pattern: 'gem', accent: 0xd4622a, frame: 'teardrop' },
  pandaRacketA: { pattern: 'rope', accent: 0x5f8a3a, frame: 'circle' },
  pandaRacketB: { pattern: 'gem', accent: 0x8fbf5a, frame: 'tent' },
  jokerRacketA: { pattern: 'gem', accent: 0xffd45c, frame: 'star' },
  jokerRacketB: { pattern: 'rune', accent: 0xe8404a, frame: 'gate' },
  pagodRacketA: { pattern: 'spike', accent: 0xc0392b, frame: 'blade' },
  pagodRacketB: { pattern: 'gem', accent: 0xffd45c, frame: 'lantern' },
  stormRacketA: { pattern: 'ribbon', accent: 0x9fd8ff, frame: 'coil' },
  stormRacketB: { pattern: 'rune', accent: 0xffffff, frame: 'blade' },
  lunarRacketA: { pattern: 'gem', accent: 0xffe89a, frame: 'crescent' },
  lunarRacketB: { pattern: 'rune', accent: 0xd8e8ff, frame: 'ring' },
  vikingRacketA: { pattern: 'spike', accent: 0xc0c8d0, frame: 'claw' },
  vikingRacketB: { pattern: 'gem', accent: 0x8fb4de, frame: 'kite' },
  safariRacketA: { pattern: 'rope', accent: 0x9aa74a, frame: 'teardrop' },
  safariRacketB: { pattern: 'gem', accent: 0xf0e8d0, frame: 'circle' },
  theatRacketA: { pattern: 'rune', accent: 0xffd45c, frame: 'scroll' },
  theatRacketB: { pattern: 'gear', accent: 0xfff0c0, frame: 'circle' },
  boreaRacketA: { pattern: 'spike', accent: 0x7dffc4, frame: 'blade' },
  boreaRacketB: { pattern: 'rune', accent: 0x9ad4ff, frame: 'gate' },
  venicRacketA: { pattern: 'rope', accent: 0x8a5a2a, frame: 'scroll' },
  venicRacketB: { pattern: 'gem', accent: 0x5fe8d0, frame: 'gourd' },
  olympRacketA: { pattern: 'spike', accent: 0xffd45c, frame: 'blade' },
  olympRacketB: { pattern: 'rune', accent: 0xfff0b0, frame: 'gate' },
  sambaRacketA: { pattern: 'gem', accent: 0xff8ad4, frame: 'heart' },
  sambaRacketB: { pattern: 'gear', accent: 0xffd45c, frame: 'lantern' },
};

export const THEME_TRAILS_3: Record<string, ThemeTrailArt> = {
  vulcTrailA: { pattern: 'ember', accent: 0xffb347 },
  vulcTrailB: { pattern: 'flame', accent: 0xff5a1a },
  trenchTrailA: { pattern: 'bubble', accent: 0x5fd0c0 },
  trenchTrailB: { pattern: 'water', accent: 0x9ffcf0 },
  dojoTrailA: { pattern: 'silk', accent: 0xf0eee4 },
  dojoTrailB: { pattern: 'swirl', accent: 0xe8404a },
  inkwTrailA: { pattern: 'ink', accent: 0x2a2e36 },
  inkwTrailB: { pattern: 'smoke', accent: 0xbfe8e0 },
  fairyTrailA: { pattern: 'petal', accent: 0xffb7d5 },
  fairyTrailB: { pattern: 'star', accent: 0xfff2b0 },
  racerTrailA: { pattern: 'smoke', accent: 0xcfd8e0 },
  racerTrailB: { pattern: 'comet', accent: 0xffd45c },
  vampTrailA: { pattern: 'silk', accent: 0x4a2a6a },
  vampTrailB: { pattern: 'smoke', accent: 0xc0203a },
  autumnTrailA: { pattern: 'feather', accent: 0xd4622a },
  autumnTrailB: { pattern: 'ember', accent: 0xffd45c },
  pandaTrailA: { pattern: 'bamboo', accent: 0x8fbf5a },
  pandaTrailB: { pattern: 'silk', accent: 0xdcefff },
  jokerTrailA: { pattern: 'confetti', accent: 0xff8ad4 },
  jokerTrailB: { pattern: 'swirl', accent: 0xffd45c },
  pagodTrailA: { pattern: 'smoke', accent: 0xffb03a },
  pagodTrailB: { pattern: 'scale', accent: 0xffd45c },
  stormTrailA: { pattern: 'ribbon', accent: 0xbfe8ff },
  stormTrailB: { pattern: 'bolt', accent: 0x9fd8ff },
  lunarTrailA: { pattern: 'star', accent: 0xffe89a },
  lunarTrailB: { pattern: 'petal', accent: 0xd8e8ff },
  vikingTrailA: { pattern: 'snow', accent: 0xf0f4fa },
  vikingTrailB: { pattern: 'ember', accent: 0xff8a3c },
  safariTrailA: { pattern: 'sand', accent: 0xd8c8a0 },
  safariTrailB: { pattern: 'comet', accent: 0xffb03a },
  theatTrailA: { pattern: 'ribbon', accent: 0xff8ad4 },
  theatTrailB: { pattern: 'star', accent: 0xfff0c0 },
  boreaTrailA: { pattern: 'snow', accent: 0x7dffc4 },
  boreaTrailB: { pattern: 'comet', accent: 0x9ad4ff },
  venicTrailA: { pattern: 'water', accent: 0x5fe8d0 },
  venicTrailB: { pattern: 'star', accent: 0xffd8a0 },
  olympTrailA: { pattern: 'feather', accent: 0xf0ead8 },
  olympTrailB: { pattern: 'flame', accent: 0xffd45c },
  sambaTrailA: { pattern: 'ribbon', accent: 0xff8ad4 },
  sambaTrailB: { pattern: 'confetti', accent: 0xffd45c },
};

export const THEME_SWINGS_3: Record<string, ThemeSwingArt> = {
  vulcSwing: { pattern: 'flame', accent: 0xffb347 },
  trenchSwing: { pattern: 'water', accent: 0x5fd0c0 },
  dojoSwing: { pattern: 'slash', accent: 0xf0eee4 },
  inkwSwing: { pattern: 'inkwash', accent: 0x2a2e36 },
  fairySwing: { pattern: 'petal', accent: 0xffb7d5 },
  racerSwing: { pattern: 'bolt', accent: 0xffd45c },
  vampSwing: { pattern: 'crescent', accent: 0xc0203a },
  autumnSwing: { pattern: 'feather', accent: 0xd4622a },
  pandaSwing: { pattern: 'cross', accent: 0x8fbf5a },
  jokerSwing: { pattern: 'chain', accent: 0xffd45c },
  pagodSwing: { pattern: 'scale', accent: 0xffd45c },
  stormSwing: { pattern: 'spiral', accent: 0x9fd8ff },
  lunarSwing: { pattern: 'star', accent: 0xffe89a },
  vikingSwing: { pattern: 'talon', accent: 0xc0c8d0 },
  safariSwing: { pattern: 'smoke', accent: 0xffb03a },
  theatSwing: { pattern: 'ribbon', accent: 0xfff0c0 },
  boreaSwing: { pattern: 'ribbon', accent: 0x7dffc4 },
  venicSwing: { pattern: 'water', accent: 0xffd8a0 },
  olympSwing: { pattern: 'bolt', accent: 0xfff0b0 },
  sambaSwing: { pattern: 'spiral', accent: 0xff8ad4 },
};

/** 坐骑主色的镜像表（避免和 cosmetics 的 `MOUNT_COLORS` 互相 import） */
export const MOUNT_TINT_3: Record<string, number> = {
  vulcHound: 0x5a2a1a,
  trenchRay: 0x2a6a7a,
  dojoCrest: 0xc0392b,
  inkwBoat: 0x4a525c,
  fairySnail: 0xd8b08a,
  racerKart: 0xe8404a,
  vampStallion: 0x1a1a26,
  autumnBoar: 0x6a4a2a,
  pandaSled: 0x8fbf5a,
  jokerCarriage: 0xe8404a,
  pagodPalanquin: 0xc0392b,
  stormGlider: 0x7fd4ff,
  lunarCloud: 0xe8f0ff,
  vikingDrakkar: 0x6a5240,
  safariElephant: 0x9aa7b8,
  theatSpotlight: 0xfff0c0,
  boreaStag: 0x8a705a,
  venicGondola: 0x2a3a4a,
  olympChariot: 0xd8d0b8,
  sambaFloat: 0xffd45c,
};
