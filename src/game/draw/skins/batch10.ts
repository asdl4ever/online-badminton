import { groundShadow, type SkinPainter } from './shared';
import { PLAYER_H } from '../../constants';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 批十主题 5★ 皮肤（电竞赛场 / 末日废土 / 星光偶像） */

/** 电竞冠军：捧杯的电竞冠军——冠军耳机、队服、肩章金线、身后奖杯逆光 */
export const esportSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const jersey = 0x1c2430, jerseyD = 0x141a24, neon = 0x00e5ff, magenta = 0xff2e88, skinT = 0xd8a878;
  groundShadow(g, pose, 52);
  const breathe = Math.sin(now / 440) * 1.2;
  // 双腿（队裤 + 运动鞋）
  for (const s of [-1, 1]) {
    const step = Math.sin(now / 240 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
    g.fillStyle(jerseyD, 1);
    g.fillRoundedRect(x + s * 7 - 4.4, topY + 58, 9, 22, 3);
    g.fillStyle(neon, 0.8); // 裤侧条
    g.fillRect(x + s * 7 - 1, topY + 60, 2, 18);
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(x + s * 7 - 5 + step, feetY - 5, 10, 5, 2);
  }
  // 躯干（冠军队服 + 金线肩章 + 队徽）
  g.fillStyle(jersey, 1);
  g.fillRoundedRect(x - 12, topY + 28 + breathe, 24, 32, 5);
  g.fillStyle(0x2a3648, 0.7);
  g.fillRoundedRect(x - 9, topY + 30 + breathe, 8, 26, 3);
  g.fillStyle(neon, 0.9); // 队服荧光滚边
  g.fillRect(x - 12, topY + 28 + breathe, 24, 2);
  g.fillRect(x - 12, topY + 46 + breathe, 24, 1.6);
  for (const s of [-1, 1]) { // 金线肩章
    g.fillStyle(0xffd45c, 0.95);
    g.fillRect(x + s * 10 - 2.4, topY + 29 + breathe, 4.8, 3);
  }
  g.fillStyle(0xffffff, 0.9); // 胸前队徽
  g.fillPoints([
    { x: x + f * 5, y: topY + 36 + breathe }, { x: x + f * 8, y: topY + 40 + breathe }, { x: x + f * 5, y: topY + 44 + breathe }, { x: x + f * 2, y: topY + 40 + breathe },
  ] as never, true);
  // 双臂（一手高举奖杯一手比 V）
  g.fillStyle(jersey, 1);
  g.save();
  g.translateCanvas(x + f * 11, topY + 32 + breathe);
  g.rotateCanvas(f * -0.9);
  g.fillRoundedRect(-3.4, -16, 6.8, 18, 3);
  g.fillStyle(skinT, 1);
  g.fillCircle(0, -17, 2.8);
  g.restore();
  g.lineStyle(5, jersey, 1);
  g.lineBetween(x - f * 11, topY + 34 + breathe, x - f * 17, topY + 46 + breathe);
  g.fillStyle(skinT, 1); // 比 V 的手
  g.fillCircle(x - f * 18, topY + 48 + breathe, 2.6);
  g.fillStyle(0xffffff, 0.9);
  g.fillRect(x - f * 19, topY + 44 + breathe, 1.2, 3);
  g.fillRect(x - f * 16, topY + 44 + breathe, 1.2, 3);
  // 高举的奖杯（金杯 + 星光）
  const tx = x + f * 13, ty = topY + 6 + breathe;
  g.fillStyle(0xffd45c, 0.95);
  g.fillPoints([
    { x: tx - 7, y: ty - 8 }, { x: tx + 7, y: ty - 8 }, { x: tx + 5, y: ty }, { x: tx - 5, y: ty },
  ] as never, true);
  for (const s of [-1, 1]) {
    g.lineStyle(1.8, 0xffd45c, 0.95);
    g.beginPath(); g.arc(tx + s * 8, ty - 5, 3.4, s > 0 ? -Math.PI / 2 : Math.PI / 2, s > 0 ? Math.PI / 2 : Math.PI * 1.5); g.strokePath();
  }
  g.fillStyle(0xb8943a, 1);
  g.fillRect(tx - 1.4, ty, 2.8, 4);
  g.fillStyle(0x8a6a2a, 1);
  g.fillRect(tx - 4.4, ty + 4, 8.8, 3);
  g.fillStyle(0xfff0b0, 0.6 + 0.4 * Math.sin(now / 240)); // 杯身闪光
  g.fillEllipse(tx - 3, ty - 4, 2.4, 6);
  // 头（冠军耳机 + 乱发 + 笑）
  const hy = topY + 12 + breathe;
  g.fillStyle(skinT, 1);
  g.fillCircle(x, hy, 11);
  g.fillStyle(0x2a2018, 1); // 乱发（从耳机里翘出）
  for (let k = -2; k <= 2; k++) {
    g.fillTriangle(x + k * 4 - 2, hy - 8, x + k * 4 + 2, hy - 8, x + k * 4.6, hy - 13 + Math.abs(k) * 1.6);
  }
  g.fillStyle(0x39424e, 1); // 头带
  g.beginPath(); g.arc(x, hy - 2, 12, Math.PI, Math.PI * 2); g.closePath(); g.fillPath();
  for (const s of [-1, 1]) { // 冠军耳机耳罩（RGB 光）
    g.fillStyle(0x39424e, 1);
    g.fillRoundedRect(x + s * 10 - 3.4, hy - 4, 7, 10, 3);
    const gl = 0.5 + 0.5 * Math.sin(now / 200 + s);
    g.fillStyle(s > 0 ? neon : magenta, gl);
    g.fillRoundedRect(x + s * 10 - 2, hy - 2.6, 4, 7.2, 2);
  }
  g.fillStyle(0x1a1410, 0.9); // 兴奋眯眼
  g.beginPath(); g.arc(x + f * 4, hy - 1, 2.2, Math.PI * 1.1, Math.PI * 1.9); g.strokePath();
  g.beginPath(); g.arc(x - f * 4, hy - 1, 2.2, Math.PI * 1.1, Math.PI * 1.9); g.strokePath();
  g.fillStyle(0xffffff, 0.8); // 咧嘴笑
  g.fillEllipse(x + f * 2, hy + 5, 6, 2.6);
  // 环身彩带屑
  for (let k = 0; k < 6; k++) {
    const ph = (now / 1100 + k / 6) % 1;
    g.save();
    g.translateCanvas(x + Math.sin(k * 2.6) * 22 + Math.sin(ph * 4 + k) * 5, topY + 60 - ph * 72);
    g.rotateCanvas(ph * 7 + k);
    g.fillStyle(k % 2 ? neon : magenta, 0.7 * Math.sin(ph * Math.PI));
    g.fillRect(-2, -0.8, 4, 1.6);
    g.restore();
  }
};

/** 废土浪客：蒙面的废土浪客——护目镜、防毒滤罐、拼甲护肩、面巾下的呼吸 */
export const wasteSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const cloth = 0x6a5a3a, clothD = 0x4a4030, metal = 0x8a94a2, goggles = 0x8fb8d0, skinT = 0xc09868;
  groundShadow(g, pose, 54);
  const sway = Math.sin(now / 480) * 1.6;
  // 破斗篷（身后残破斗篷，撕边）
  g.fillStyle(clothD, 0.9);
  g.fillPoints([
    { x: x - f * 6, y: topY + 26 }, { x: x - f * 24 - sway * 2, y: topY + 42 },
    { x: x - f * 30, y: topY + 58 }, { x: x - f * 20, y: topY + 54 },
    { x: x - f * 26, y: topY + 66 }, { x: x - f * 8, y: topY + 60 },
  ] as never, true);
  // 双腿（缠布腿 + 长靴）
  for (const s of [-1, 1]) {
    const step = Math.sin(now / 250 + (s > 0 ? 0 : Math.PI)) * (pose.move ?? 0) * 3;
    g.fillStyle(clothD, 1);
    g.fillRoundedRect(x + s * 7 - 4.4, topY + 56, 9, 22, 3);
    g.lineStyle(0.9, 0x3a3226, 0.8); // 缠布纹
    for (let k = 0; k < 3; k++) g.lineBetween(x + s * 7 - 4.4, topY + 60 + k * 5, x + s * 7 + 4.4, topY + 58 + k * 5);
    g.fillStyle(0x1a1410, 1);
    g.fillRoundedRect(x + s * 7 - 5 + step, feetY - 6, 11, 6, 2);
  }
  // 躯干（皮甲 + 拼装板甲单片）
  g.fillStyle(cloth, 1);
  g.fillRoundedRect(x - 12, topY + 28 + sway * 0.3, 24, 32, 5);
  g.fillStyle(metal, 0.9); // 单片拼甲（左胸）
  g.fillRoundedRect(x - f * 12 - (f > 0 ? 0 : -14), topY + 30 + sway * 0.3, 12, 14, 2);
  g.fillStyle(0x4a4030, 1); // 拼甲铆钉
  g.fillCircle(x - f * 9, topY + 33 + sway * 0.3, 1);
  g.fillCircle(x - f * 4, topY + 41 + sway * 0.3, 1);
  g.fillStyle(0x3a3226, 0.9); // 腰带 + 弹夹
  g.fillRect(x - 12, topY + 52 + sway * 0.3, 24, 4);
  g.fillRect(x + f * 2, topY + 50 + sway * 0.3, 4, 9);
  // 双臂（一手扶肩甲一手垂下）
  for (const s of [-1, 1]) {
    g.lineStyle(5, cloth, 1);
    g.lineBetween(x + s * 11, topY + 32 + sway * 0.3, x + s * 18, topY + 46 + sway * 0.3);
    g.fillStyle(0x4a4030, 1); // 手套
    g.fillCircle(x + s * 19, topY + 48 + sway * 0.3, 2.6);
  }
  // 拼甲护肩（左肩三层 scrap）
  for (let k = 0; k < 3; k++) {
    g.fillStyle(k % 2 ? metal : 0x6a7480, 0.95);
    g.fillRoundedRect(x - f * 16 - 6 + k * 2, topY + 24 + sway * 0.3 + k * 6, 14 - k * 3, 8, 2);
  }
  // 头（面巾 + 护目镜双镜片 + 风镜带）
  const hy = topY + 12 + sway * 0.4;
  g.fillStyle(skinT, 1);
  g.fillCircle(x, hy, 11);
  g.fillStyle(0x4a4030, 0.95); // 面巾（遮口鼻）
  g.fillRoundedRect(x - 9, hy + 1, 18, 10, 4);
  g.lineStyle(0.8, 0x3a3226, 0.8); // 面巾褶
  g.lineBetween(x - 6, hy + 5, x + 6, hy + 5);
  g.fillStyle(0x2a241c, 1); // 风镜带
  g.fillRect(x - 11, hy - 6, 22, 4);
  for (const s of [-1, 1]) { // 双圆护目镜（反光镜片）
    g.fillStyle(0x1a1410, 1);
    g.fillCircle(x + s * 5, hy - 4, 4.4);
    g.fillStyle(goggles, 0.5 + 0.3 * Math.sin(now / 350 + s)); // 镜片反光
    g.fillCircle(x + s * 5 - 0.8, hy - 4.8, 1.8);
    g.lineStyle(1.2, 0x8a6a3a, 1); // 镜框
    g.strokeCircle(x + s * 5, hy - 4, 4.4);
  }
  g.fillStyle(0x3a2a1a, 0.9); // 风吹乱发
  for (let k = -1; k <= 1; k++) {
    g.fillTriangle(x + k * 5, hy - 10, x + k * 5 + 3, hy - 10, x + k * 5 + 4 - f * 2, hy - 14);
  }
  // 环身浮灰
  for (let k = 0; k < 5; k++) {
    const ph = (now / 1300 + k / 5) % 1;
    g.fillStyle(0xc9a84a, 0.4 * (1 - ph));
    g.fillCircle(x + Math.sin(k * 2.6) * 22 + Math.sin(ph * 4 + k) * 4, topY + 62 - ph * 68, 1.2 * (1 - ph) + 0.4);
  }
};

/** 舞台偶像：追光灯下的偶像——双马尾、星星话筒、裙摆、满场应援光 */
export const idolSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const topY = feetY - PLAYER_H;
  const dress = 0xff9adf, dressD = 0xff5a8a, white = 0xfff6d8, gold = 0xffd45c, skinT = 0xe8c090;
  groundShadow(g, pose, 46);
  const hop = Math.sin(now / 300) * 2.4; // 偶像的小跳
  // 双马尾（两束马尾随跳摆动）
  for (const s of [-1, 1]) {
    g.fillStyle(s > 0 ? dress : dressD, 0.95);
    g.fillPoints([
      { x: x + s * 9, y: hy0() }, { x: x + s * 15, y: hy0() + 14 + Math.sin(now / 280 + s) * 3 },
      { x: x + s * 13, y: hy0() + 30 + Math.sin(now / 280 + s * 2) * 4 }, { x: x + s * 7, y: hy0() + 18 },
    ] as never, true);
    g.fillStyle(gold, 0.9); // 马尾发圈
    g.fillCircle(x + s * 10, hy0() + 2, 1.6);
  }
  function hy0(): number { return topY + 6; }
  // 双腿（过膝袜 + 舞鞋，踮脚小跳）
  for (const s of [-1, 1]) {
    g.fillStyle(0xffffff, 0.95);
    g.fillRoundedRect(x + s * 6 - 3.4, topY + 58 + hop, 7, 16, 3);
    g.fillStyle(dressD, 0.95); // 舞鞋
    g.fillEllipse(x + s * 6, topY + 76 + hop, 7, 4);
    g.fillStyle(gold, 0.8); // 袜口金边
    g.fillRect(x + s * 6 - 3.4, topY + 60 + hop, 7, 1.6);
  }
  // 裙摆（舞台短裙，两层）
  g.fillStyle(dressD, 0.95);
  g.fillEllipse(x, topY + 54 + hop, 30, 12);
  g.fillStyle(dress, 0.95);
  g.fillEllipse(x, topY + 51 + hop, 26, 10);
  // 躯干（演出服上衣 + 胸前蝴蝶结）
  g.fillStyle(white, 1);
  g.fillRoundedRect(x - 10, topY + 30 + hop, 20, 24, 5);
  g.fillStyle(dress, 0.9); // 衣边
  g.fillRect(x - 10, topY + 30 + hop, 20, 3);
  g.fillStyle(dressD, 1); // 胸前蝴蝶结
  g.fillEllipse(x - f * 3, topY + 34 + hop, 5, 3.4);
  g.fillEllipse(x + f * 3, topY + 34 + hop, 5, 3.4);
  g.fillStyle(gold, 0.95);
  g.fillCircle(x, topY + 34 + hop, 1.4);
  // 双臂（一手持麦一手张开）
  for (const s of [-1, 1]) {
    g.lineStyle(4.4, skinT, 1);
    g.lineBetween(x + s * 9, topY + 34 + hop, x + s * 17, topY + 42 + hop - s * 4);
    g.fillStyle(skinT, 1);
    g.fillCircle(x + s * 18, topY + 40 + hop - s * 4, 2.4);
  }
  // 星星话筒（张开的手里，麦头星光）
  const mx = x + f * 19, my = topY + 34 + hop;
  g.fillStyle(0x39424e, 1);
  g.fillCircle(mx, my, 3.4);
  g.fillStyle(gold, 0.95);
  g.fillPoints((() => {
    const vs = [];
    for (let s = 0; s < 10; s++) {
      const ang = (s / 10) * Math.PI * 2 - Math.PI / 2 + now / 300;
      const rr = s % 2 ? 1.6 : 3.6;
      vs.push({ x: mx + Math.cos(ang) * rr, y: my + Math.sin(ang) * rr });
    }
    return vs;
  })() as never, true);
  // 头（双马尾头 + 大蝴蝶结 + 星星发卡 + 星星眼）
  const hy = topY + 10 + hop;
  g.fillStyle(skinT, 1);
  g.fillCircle(x, hy, 11);
  g.fillStyle(dressD, 1); // 头发（齐刘海 + 两侧）
  g.fillEllipse(x, hy - 8, 22, 9);
  g.fillEllipse(x - f * 9, hy + 2, 6, 12);
  g.fillEllipse(x + f * 9, hy + 2, 6, 12);
  g.fillStyle(gold, 0.95); // 大蝴蝶结（头顶）
  g.fillEllipse(x - 5, hy - 12, 7, 4.4);
  g.fillEllipse(x + 5, hy - 12, 7, 4.4);
  g.fillStyle(0xffffff, 0.85);
  g.fillCircle(x, hy - 12, 2);
  g.fillStyle(0x5ac8ff, 0.9); // 星星发卡
  g.fillPoints([
    { x: x - f * 7, y: hy - 5 }, { x: x - f * 5.6, y: hy - 3.4 }, { x: x - f * 7, y: hy - 1.8 }, { x: x - f * 8.4, y: hy - 3.4 },
  ] as never, true);
  for (const s of [-1, 1]) { // 星星眼（闪亮大眼）
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(x + s * 4.4, hy - 1, 2.8);
    g.fillStyle(0x5ac8ff, 0.95);
    g.fillCircle(x + s * 4.4 + f * 0.4, hy - 1, 1.8);
    g.fillStyle(0x1a1222, 1);
    g.fillCircle(x + s * 4.4 + f * 0.6, hy - 1, 0.9);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(x + s * 4.4 + f * 0.4 - 0.6, hy - 2, 0.7);
  }
  g.fillStyle(0xe8404a, 0.85); // 微张唱嘴
  g.fillEllipse(x + f * 1.4, hy + 5, 3.4, 2.4);
  // 环身星屑与音符
  for (let k = 0; k < 6; k++) {
    const ph = (now / 1100 + k / 6) % 1;
    if (k % 2) {
      g.fillStyle(0xffffff, 0.7 * (1 - ph));
      g.fillCircle(x + Math.sin(k * 2.6) * 20, topY + 60 - ph * 66, 1.3);
    } else {
      g.lineStyle(1.2, gold, 0.7 * (1 - ph));
      g.strokeCircle(x + Math.sin(k * 2.6) * 20, topY + 60 - ph * 66, 2);
      g.fillRect(x + Math.sin(k * 2.6) * 20 - 0.4, topY + 58 - ph * 66, 0.8, 4);
    }
  }
};
