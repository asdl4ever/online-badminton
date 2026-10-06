import { groundShadow, type SkinPainter } from './shared';
import { PLAYER_H } from '../../constants';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 新批次主题 5★ 皮肤（上古神话 / 重装机甲） */

/** 创世古神：半神之躯背负初开天地——身绕星河、掌托日月、双目开阖放光 */
export const shnSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const skin = 0xd8b090, robe = 0x8a5a2a, gold = 0xffd45c;
  groundShadow(g, pose, 54);
  const breathe = Math.sin(now / 500) * 1.6;
  // 星河披带（身后）：一条银河斜绕
  g.fillStyle(0x3a2a6a, 0.3);
  g.fillPoints([
    { x: x - 40, y: topY + 20 }, { x: x + 40, y: topY + 4 }, { x: x + 48, y: topY + 26 }, { x: x - 30, y: topY + 46 },
  ] as never, true);
  for (let k = 0; k < 8; k++) {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 260 + k * 1.5));
    g.fillStyle(0xfff6d8, tw);
    g.fillCircle(x - 34 + (k * 11) % 76, topY + 14 + (k * 29) % 30, 1.4);
  }
  // 躯干：古神铜色身 + 兽皮腰带
  g.fillStyle(skin, 1);
  g.fillRoundedRect(x - 15, topY + 30 + breathe, 30, PLAYER_H - 32, 10);
  g.fillStyle(0xc09878, 0.7); // 受光
  g.fillRoundedRect(x - 12, topY + 32 + breathe, 9, PLAYER_H - 40, 8);
  g.fillStyle(robe, 1); // 腰带
  g.fillRect(x - 15, topY + 62, 30, 8);
  g.fillStyle(gold, 0.95);
  g.fillCircle(x, topY + 66, 3.4);
  // 双臂：一臂托日、一臂托月
  for (const s of [-1, 1]) {
    g.lineStyle(6, skin, 1);
    g.lineBetween(x + s * 12, topY + 40, x + s * 22, topY + 26 + breathe);
    g.lineBetween(x + s * 22, topY + 26 + breathe, x + s * 26, topY + 14 + breathe);
  }
  // 日（右掌）：三层光焰
  const sun = 0.5 + 0.5 * Math.sin(now / 320);
  g.fillStyle(0xff5a1a, 0.3 * sun);
  g.fillCircle(x + 26, topY + 10, 12);
  g.fillStyle(0xff9a3c, 0.95);
  g.fillCircle(x + 26, topY + 10, 7);
  g.fillStyle(0xfff0b0, 0.95);
  g.fillCircle(x + 26, topY + 10, 3.6);
  // 月（左掌）：弯月 + 月晕
  g.fillStyle(0xffe89a, 0.15 + 0.08 * Math.sin(now / 420));
  g.fillCircle(x - 26, topY + 10, 11);
  g.fillStyle(0xe8f0ff, 0.95);
  g.fillCircle(x - 26, topY + 10, 6.4);
  g.fillStyle(0x3a2a6a, 0.9);
  g.fillCircle(x - 23.4, topY + 8, 5.4);
  // 头：束发古面 + 眉宇 + 环形耳饰
  const hy = topY + 14 + breathe;
  g.fillStyle(skin, 1);
  g.fillCircle(x, hy, 13);
  g.fillStyle(0x2a1a10, 1); // 束发
  g.fillEllipse(x, hy - 10, 24, 8);
  g.fillStyle(gold, 0.9);
  g.fillRect(x - 12, hy - 9, 24, 2.4); // 金额带
  g.fillStyle(0x1a0a08, 1);
  g.fillEllipse(x - f * 4.4, hy - 2, 4, 2.8);
  g.fillEllipse(x + f * 4.4, hy - 2, 4, 2.8);
  g.fillStyle(0xffe08a, 0.85);
  g.fillCircle(x - f * 4.4, hy - 2, 1.2);
  g.fillCircle(x + f * 4.4, hy - 2, 1.2);
  g.lineStyle(1.4, 0x2a1a10, 0.8); // 长髯
  g.lineBetween(x - 1, hy + 12, x - 2 - f, hy + 22);
  g.lineBetween(x + 1, hy + 12, x + 2 - f, hy + 21);
  // 双足
  for (const s of [-1, 1]) {
    g.fillStyle(skin, 1);
    g.fillRoundedRect(x + s * 8 - 5, feetY - 6, 10, 6, 2.4);
  }
  // 周身金尘
  for (let k = 0; k < 5; k++) {
    const ph = (now / 1100 + k / 5) % 1;
    g.fillStyle(gold, 0.6 * (1 - ph));
    g.fillCircle(x + Math.sin(k * 2.4) * 26 + Math.sin(ph * 5 + k) * 5, topY + 60 - ph * 70, 1.6 * (1 - ph) + 0.4);
  }
};

/** 机甲元帅：重型人形机甲——装甲板身、能量核心、肩炮充能、目镜扫描 */
export const mcaSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const plate = 0x5a6472, dark = 0x39424e, steel = 0x8a94a2, neon = 0x5ac8ff;
  groundShadow(g, pose, 56);
  const servo = Math.sin(now / 400) * 1.2;
  // 双腿（液压腿 + 膝关节 + 脚掌）
  for (const s of [-1, 1]) {
    const step = Math.sin(now / 230 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 4;
    g.fillStyle(dark, 1);
    g.fillRoundedRect(x + s * 10 - 6, topY + 62, 12, 22, 3);
    g.fillStyle(steel, 1);
    g.fillCircle(x + s * 10, topY + 72, 4.4); // 膝
    g.fillStyle(plate, 1);
    g.fillRoundedRect(x + s * 10 - 6 + step * 0.4, topY + 78, 12, 14, 2.4);
    g.fillStyle(0x22303e, 1);
    g.fillRoundedRect(x + s * 10 - 7 + step, feetY - 5, 14, 5, 2); // 脚掌
    const thr = Math.abs(Math.sin(now / 90 + s)); // 脚底推进器
    g.fillStyle(neon, 0.5 * thr);
    g.fillEllipse(x + s * 10 + step, feetY, 8, 2.4);
  }
  // 躯干装甲（胸甲分层 + 腹部能量核心）
  g.fillStyle(plate, 1);
  g.fillRoundedRect(x - 16, topY + 28 + servo, 32, 36, 6);
  g.fillStyle(steel, 0.7); // 胸甲受光
  g.fillRoundedRect(x - 12, topY + 30 + servo, 10, 30, 4);
  g.fillStyle(dark, 1);
  g.fillRoundedRect(x - 16, topY + 56 + servo, 32, 8, 3); // 腹甲
  const core = 0.5 + 0.5 * Math.sin(now / 240); // 能量核心
  g.fillStyle(neon, 0.25 + core * 0.2);
  g.fillCircle(x, topY + 44 + servo, 10);
  g.fillStyle(neon, 0.95);
  g.fillCircle(x, topY + 44 + servo, 5.4);
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(x - 1.4, topY + 42.6 + servo, 1.8);
  // 肩甲 + 双肩炮（充能时炮口聚光）
  for (const s of [-1, 1]) {
    g.fillStyle(steel, 1);
    g.fillEllipse(x + s * 20, topY + 30 + servo, 16, 12);
    g.fillStyle(dark, 1);
    g.fillEllipse(x + s * 20, topY + 30 + servo, 10, 7);
    g.fillStyle(plate, 1); // 炮管
    g.fillRoundedRect(x + s * 22 - 3, topY + 16 + servo, 6, 14, 2);
    const charge = Math.abs(Math.sin(now / 340 + s)); // 炮口聚光
    g.fillStyle(0xffe15c, charge);
    g.fillCircle(x + s * 25, topY + 15 + servo, 2.2 + charge * 1.4);
  }
  // 头盔：全覆式 + 单条扫描目镜（左右扫）+ 头顶天线
  const hy = topY + 14 + servo;
  g.fillStyle(plate, 1);
  g.fillRoundedRect(x - 12, hy - 10, 24, 18, 5);
  g.fillStyle(dark, 1);
  g.fillRoundedRect(x - 10, hy - 6, 20, 8, 3); // 目镜槽
  const scan = Math.sin(now / 260) * 7; // 扫描光左右扫
  g.fillStyle(neon, 0.95);
  g.fillRect(x + scan - 2, hy - 4.4, 4, 3.6);
  g.fillStyle(0xffffff, 0.8);
  g.fillRect(x + scan - 0.8, hy - 4.4, 1.6, 3.6);
  g.lineStyle(1.6, steel, 1); // 天线
  g.lineBetween(x + 10, hy - 10, x + 15, hy - 20);
  const bl = Math.abs(Math.sin(now / 240));
  g.fillStyle(0xff5a5a, bl);
  g.fillCircle(x + 15, hy - 21, 1.8);
  // 背后排气蒸汽
  for (let k = 0; k < 3; k++) {
    const ph = (now / 700 + k / 3) % 1;
    g.fillStyle(0xdfe6f0, 0.3 * (1 - ph));
    g.fillCircle(x - f * 20 - ph * 8, topY + 24 - ph * 16, 2.4 * (1 - ph) + 0.6);
  }
};
