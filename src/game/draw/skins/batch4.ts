import { groundShadow, type SkinPainter } from './shared';
import { PLAYER_H } from '../../constants';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 批四主题 5★ 皮肤（西游降魔 / 三国烽火） */

/** 齐天大圣：金毛猴王——虎皮裙、金箍、火眼金睛、身形灵动 */
export const xySpirit: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const fur = 0xd9a84a, skin = 0xe8c090, red = 0xc03a2a, gold = 0xffd45c;
  groundShadow(g, pose, 50);
  const bounce = Math.sin(now / 320) * 2; // 猴王踏步的轻弹
  // 尾巴（身后上翘的猴尾，甩动）
  g.lineStyle(4, fur, 1);
  g.beginPath();
  g.moveTo(x - f * 8, topY + 66);
  g.lineTo(x - f * 20, topY + 52 + Math.sin(now / 400) * 4);
  g.lineTo(x - f * 24, topY + 40 + Math.sin(now / 400) * 5);
  g.strokePath();
  // 双腿（红色裤 + 黑靴，交错踏步）
  for (const s of [-1, 1]) {
    const step = Math.sin(now / 240 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
    g.fillStyle(red, 1);
    g.fillRoundedRect(x + s * 7 - 4.4, topY + 58 + bounce, 9, 16, 3);
    g.fillStyle(0x1a1210, 1);
    g.fillRoundedRect(x + s * 7 - 5 + step, feetY - 6, 10, 6, 2);
  }
  // 虎皮裙（黄底黑纹的短裙）
  g.fillStyle(0xd9b45c, 1);
  g.fillRoundedRect(x - 12, topY + 52 + bounce, 24, 12, 3);
  g.fillStyle(0x241a0c, 0.85);
  for (let k = 0; k < 4; k++) g.fillRect(x - 10 + k * 6, topY + 53 + bounce, 3, 10);
  g.lineStyle(1.6, gold, 0.9); // 裙腰金带
  g.lineBetween(x - 12, topY + 54 + bounce, x + 12, topY + 54 + bounce);
  // 躯干（红色紧身衣 + 胸前金扣）
  g.fillStyle(red, 1);
  g.fillRoundedRect(x - 12, topY + 30 + bounce, 24, 24, 6);
  g.fillStyle(0xd95040, 0.6);
  g.fillRoundedRect(x - 9, topY + 32 + bounce, 8, 18, 4);
  g.fillStyle(gold, 0.95);
  g.fillCircle(x, topY + 42 + bounce, 2.4);
  // 双臂（一手叉腰一手持棒意）
  for (const s of [-1, 1]) {
    g.lineStyle(5, red, 1);
    g.lineBetween(x + s * 10, topY + 34 + bounce, x + s * 17, topY + 46 + bounce);
    g.fillStyle(skin, 1); // 毛手
    g.fillCircle(x + s * 18, topY + 48 + bounce, 3);
  }
  // 头（圆脸猴相 + 金箍 + 火眼金睛 + 桃心毛）
  const hy = topY + 15 + bounce;
  g.fillStyle(fur, 1);
  g.fillCircle(x, hy, 12);
  g.fillStyle(skin, 1); // 脸盘
  g.fillEllipse(x, hy + 2, 17, 14);
  g.fillStyle(fur, 1); // 桃心头顶毛
  g.fillCircle(x, hy - 11, 4.4);
  g.fillCircle(x - 3.4, hy - 9, 3);
  g.fillCircle(x + 3.4, hy - 9, 3);
  g.fillStyle(gold, 1); // 金箍
  g.fillRect(x - 11, hy - 6, 22, 4);
  g.fillStyle(0xfff0b0, 0.6 + 0.3 * Math.sin(now / 400)); // 箍上咒纹明灭
  for (let k = 0; k < 4; k++) g.fillRect(x - 8 + k * 5, hy - 5.2, 2, 2.4);
  for (const s of [-1, 1]) { // 火眼金睛（金瞳灼灼）
    const gl = 0.75 + 0.25 * Math.sin(now / 300 + s);
    g.fillStyle(0xffe15c, gl);
    g.fillEllipse(x + s * 4.4, hy - 1, 5.4, 3.4);
    g.fillStyle(0x241a0c, 1);
    g.fillCircle(x + s * 4.4 + f, hy - 1, 1.2);
    g.fillStyle(0xffffff, gl);
    g.fillCircle(x + s * 4.4 + f * 0.6, hy - 1.8, 0.7);
  }
  g.fillStyle(0x8a5a2a, 1); // 吻部
  g.fillEllipse(x + f * 1, hy + 5, 8, 4);
  // 周身金毫光点
  for (let k = 0; k < 5; k++) {
    const ph = (now / 1000 + k / 5) % 1;
    g.fillStyle(gold, 0.6 * (1 - ph));
    g.fillCircle(x + Math.sin(k * 2.6) * 22, topY + 56 - ph * 62, 1.4 * (1 - ph) + 0.4);
  }
};

/** 赤壁武圣：赤面长髯的武圣——绿袍金甲、卧蚕眉丹凤眼、身披战意 */
export const sgmSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const robe = 0x2f6a3a, armor = 0x8a94a2, face = 0xc05040, beard = 0x2a2018, gold = 0xffd45c;
  groundShadow(g, pose, 54);
  const breathe = Math.sin(now / 480) * 1.4;
  // 披袍（身后展开的绿战袍）
  g.fillStyle(robe, 0.9);
  g.fillPoints([
    { x: x - f * 6, y: topY + 28 }, { x: x - f * 26, y: topY + 44 + Math.sin(now / 500) * 2 },
    { x: x - f * 30, y: topY + 70 }, { x: x - f * 12, y: topY + 66 },
  ] as never, true);
  g.fillStyle(0x244a28, 0.6); // 袍内侧暗部
  g.fillPoints([
    { x: x - f * 10, y: topY + 34 }, { x: x - f * 24, y: topY + 50 }, { x: x - f * 26, y: topY + 66 }, { x: x - f * 14, y: topY + 62 },
  ] as never, true);
  // 双腿（黑甲战靴）
  for (const s of [-1, 1]) {
    const step = Math.sin(now / 250 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
    g.fillStyle(0x2a2420, 1);
    g.fillRoundedRect(x + s * 8 - 5, topY + 60, 10, 22, 3);
    g.fillStyle(armor, 0.8); // 胫甲
    g.fillRoundedRect(x + s * 8 - 5 + step * 0.4, topY + 66, 10, 8, 2);
    g.fillStyle(0x1a1410, 1);
    g.fillRoundedRect(x + s * 8 - 6 + step, feetY - 5, 12, 5, 2);
  }
  // 躯干（绿袍 + 胸前金甲兽面）
  g.fillStyle(robe, 1);
  g.fillRoundedRect(x - 14, topY + 28 + breathe, 28, 34, 7);
  g.fillStyle(armor, 1); // 胸甲
  g.fillRoundedRect(x - 10, topY + 32 + breathe, 20, 16, 4);
  g.fillStyle(gold, 0.9); // 兽面扣
  g.fillCircle(x, topY + 40 + breathe, 3.4);
  g.fillStyle(0x241a0c, 0.8);
  g.fillCircle(x - 1.2, topY + 39.4 + breathe, 1);
  g.fillCircle(x + 1.2, topY + 39.4 + breathe, 1);
  // 腰带
  g.fillStyle(0x241a0c, 1);
  g.fillRect(x - 14, topY + 54 + breathe, 28, 5);
  g.fillStyle(gold, 0.9);
  g.fillRect(x - 3, topY + 54 + breathe, 6, 5);
  // 双臂
  for (const s of [-1, 1]) {
    g.lineStyle(5.4, robe, 1);
    g.lineBetween(x + s * 12, topY + 32 + breathe, x + s * 19, topY + 48 + breathe);
    g.fillStyle(face, 1);
    g.fillCircle(x + s * 20, topY + 50 + breathe, 3);
  }
  // 头（赤面 + 卧蚕眉丹凤眼 + 五绺长髯）
  const hy = topY + 13 + breathe;
  g.fillStyle(face, 1);
  g.fillCircle(x, hy, 12);
  g.fillStyle(0xd06858, 0.5);
  g.fillCircle(x - 3, hy - 3, 6);
  g.fillStyle(beard, 1); // 长髯（三绺垂胸，随风）
  const bw = Math.sin(now / 420) * 1.6;
  for (let k = -1; k <= 1; k++) {
    g.fillPoints([
      { x: x + k * 5 - 2, y: hy + 6 }, { x: x + k * 5 + 2, y: hy + 6 },
      { x: x + k * 6 + bw, y: hy + 30 - Math.abs(k) * 6 },
    ] as never, true);
  }
  g.fillStyle(0x1a1210, 1); // 卧蚕眉（浓黑上挑）
  for (const s of [-1, 1]) {
    g.fillRoundedRect(x + s * 3 - 3.4, hy - 5 + (s > 0 ? 0.8 : 0), 7, 2.4, 1.2);
  }
  for (const s of [-1, 1]) { // 丹凤眼（细长微眯）
    g.fillStyle(0xffe15c, 0.85);
    g.fillEllipse(x + s * 4.6, hy - 1, 4.6, 1.8);
    g.fillStyle(0x1a1210, 1);
    g.fillCircle(x + s * 4.6 + f * 0.8, hy - 1, 0.8);
  }
  g.fillStyle(0x2a2018, 1); // 束发冠
  g.fillEllipse(x, hy - 11, 16, 7);
  g.fillStyle(gold, 0.9); // 发冠金箍
  g.fillRect(x - 8, hy - 12, 16, 2.4);
  // 周身战意金尘
  for (let k = 0; k < 4; k++) {
    const ph = (now / 1100 + k / 4) % 1;
    g.fillStyle(gold, 0.5 * (1 - ph));
    g.fillCircle(x + Math.sin(k * 2.4) * 24 + Math.sin(ph * 5 + k) * 4, topY + 58 - ph * 66, 1.4 * (1 - ph) + 0.4);
  }
};
