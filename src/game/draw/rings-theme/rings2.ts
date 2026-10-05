import { R_RX, R_RY, R_DY, rline, type RingArt } from './shared';

/** 第二批主题地环（火山 / 深海沟 / 剑道 / 水墨 / 精灵 / 赛车 / 吸血鬼 / 秋日 / 竹林 / 小丑 / 宫殿 / 风暴 / 月宫 / 维京 / 猎游 / 剧院 / 北境 / 威尼斯 / 奥林匹斯 / 桑巴） */
export const RINGS_2: Record<string, RingArt> = {
  vulcRing: { a: 0xff5a1a, draw: (g, now, x, fy, c, a) => {
    // 岩浆地环：黑岩环 + 裂缝透出岩浆光 + 火星
    const y = fy + R_DY;
    g.lineStyle(4, 0x2a2a2a, 0.95); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    g.lineStyle(1.6, a, 0.5 + 0.3 * Math.sin(now / 280));
    g.strokeEllipse(x, y, R_RX * 1.3, R_RY * 1.3);
    for (let k = 0; k < 3; k++) {
      const aa = now / 700 + (k / 3) * Math.PI * 2;
      g.fillStyle(a, 0.9);
      g.fillCircle(x + Math.cos(aa) * 20, y + Math.sin(aa) * 5 - Math.abs(Math.sin(aa * 2)) * 4, 1.8);
    }
  } },
  trenchRing: { a: 0x2a6a7a, draw: (g, now, x, fy, c, a) => {
    // 潮汐地环：深海水环 + 气泡上浮
    const y = fy + R_DY;
    g.fillStyle(c, 0.5); g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
    g.lineStyle(2.4, a, 0.85); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    for (let k = 0; k < 4; k++) {
      const aa = now / 900 + (k / 4) * Math.PI * 2;
      g.fillStyle(0xbfe8f0, 0.7);
      g.fillCircle(x + Math.cos(aa) * 18, y - Math.abs(Math.sin(aa * 2)) * 6, 2);
    }
  } },
  dojoRing: { a: 0xe8404a, draw: (g, now, x, fy, c, a) => {
    // 道场地环：白道场垫 + 红圈界线
    const y = fy + R_DY;
    g.fillStyle(0xf0eee4, 0.6); g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
    g.lineStyle(3, a, 0.9); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    g.lineStyle(1.6, a, 0.5); g.strokeEllipse(x, y, R_RX * 1.4, R_RY * 1.4);
  } },
  inkwRing: { a: 0x2a2e36, draw: (g, now, x, fy, c, a) => {
    // 砚台地环：墨池环 + 一笔墨痕绕环游走
    const y = fy + R_DY;
    g.fillStyle(a, 0.4); g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
    g.lineStyle(2.6, c, 0.85); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    const aa = now / 1200;
    g.lineStyle(3, a, 0.9);
    g.beginPath();
    g.arc(x, y, 24, aa, aa + 1.1);
    g.strokePath();
    g.fillStyle(a, 0.5);
    g.fillCircle(x + Math.cos(aa + 1.1) * 24, y + Math.sin(aa + 1.1) * 7, 3.4); // 墨点晕开
  } },
  fairyRing: { a: 0xa8ff9a, draw: (g, now, x, fy, c, a) => {
    // 苔藓地环：苔环 + 荧光孢子明灭
    const y = fy + R_DY;
    g.lineStyle(3.4, 0x5f8a3a, 0.9); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    for (let k = 0; k < 6; k++) {
      const aa = (k / 6) * Math.PI * 2 + now / 1600;
      g.fillStyle(a, 0.4 + 0.4 * Math.abs(Math.sin(now / 350 + k)));
      g.fillCircle(x + Math.cos(aa) * 20, y + Math.sin(aa) * 5.4, 2.2);
    }
  } },
  racerRing: { a: 0x1e222a, draw: (g, now, x, fy, c, a) => {
    // 赛道地环：红白路缘纹赛道环
    const y = fy + R_DY;
    g.lineStyle(4, 0x1e222a, 0.9); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    for (let k = 0; k < 8; k++) {
      const aa = (k / 8) * Math.PI * 2;
      g.fillStyle(k % 2 ? 0xffffff : 0xe8404a, 0.95);
      g.fillCircle(x + Math.cos(aa) * 24, y + Math.sin(aa) * 7, 2.4);
    }
    const v = (now / 12) % 60;
    g.fillStyle(0xffffff, 0.35);
    g.fillRect(x - 30 + v * 0.8, y - 1, 10, 2);
  } },
  vampRing: { a: 0x4a1a4a, draw: (g, now, x, fy, c, a) => {
    // 城堡地环（吸血鬼）：黑石环 + 红心点 + 蝙蝠影
    const y = fy + R_DY;
    g.lineStyle(3.6, 0x1a1420, 0.95); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    for (let k = 0; k < 4; k++) {
      const aa = (k / 4) * Math.PI * 2 + now / 1000;
      g.fillStyle(a, 0.75);
      const px = x + Math.cos(aa) * 21, py = y + Math.sin(aa) * 5.4;
      g.fillTriangle(px - 3.4, py, px, py - 2.6, px + 3.4, py);
      g.fillTriangle(px - 3.4, py, px, py + 2.6, px + 3.4, py);
    }
  } },
  autumnRing: { a: 0xd4622a, draw: (g, now, x, fy, c, a) => {
    // 田埂地环：土埂 + 散落的红叶
    const y = fy + R_DY;
    g.lineStyle(3.2, 0x9a7a4a, 0.85); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    for (let k = 0; k < 5; k++) {
      const aa = (k / 5) * Math.PI * 2 + Math.sin(now / 800 + k) * 0.2;
      g.fillStyle(k % 2 ? a : 0xe8a33d, 0.9);
      g.fillEllipse(x + Math.cos(aa) * 21, y + Math.sin(aa) * 5.6, 5, 3);
    }
  } },
  pandaRing: { a: 0x5f8a3a, draw: (g, now, x, fy, c, a) => {
    // 竹林地环：一圈竹节短桩 + 落叶
    const y = fy + R_DY;
    g.fillStyle(0x7a9a4a, 0.35); g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
    for (let k = 0; k < 6; k++) {
      const aa = (k / 6) * Math.PI * 2;
      const px = x + Math.cos(aa) * 22, py = y + Math.sin(aa) * 6.4;
      g.fillStyle(c, 0.95);
      g.fillRect(px - 2.2, py - 6, 4.4, 8);
      g.fillStyle(0xd8e8a0, 0.7);
      g.fillRect(px - 2.2, py - 3, 4.4, 1.2);
    }
  } },
  jokerRing: { a: 0xe8404a, draw: (g, now, x, fy, c, a) => {
    // 牌桌地环：一圈扑克牌首尾相接
    const y = fy + R_DY;
    for (let k = 0; k < 6; k++) {
      const aa = (k / 6) * Math.PI * 2 + now / 1500;
      g.save();
      g.translateCanvas(x + Math.cos(aa) * 20, y + Math.sin(aa) * 5.4);
      g.rotateCanvas(Math.sin(aa) * 0.5);
      g.fillStyle(0xffffff, 0.95);
      g.fillRect(-3.4, -4.6, 6.8, 9.2);
      g.fillStyle(k % 2 ? a : 0x1e222a, 0.9);
      g.fillRect(-1, -2, 2, 4); // 牌面花色
      g.restore();
    }
  } },
  pagodRing: { a: 0xffd45c, draw: (g, now, x, fy, c, a) => {
    // 宫殿地环：金銮环 + 四枚金钉 + 琉璃反光
    const y = fy + R_DY;
    g.lineStyle(3.6, 0xc0392b, 0.95); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    g.lineStyle(1.4, a, 0.9); g.strokeEllipse(x, y, R_RX * 1.7, R_RY * 1.7);
    for (let k = 0; k < 4; k++) {
      const aa = (k / 4) * Math.PI * 2 + Math.PI / 4;
      g.fillStyle(a, 0.95);
      g.fillCircle(x + Math.cos(aa) * 22, y + Math.sin(aa) * 6, 2);
    }
  } },
  stormRing: { a: 0x3d4c5c, draw: (g, now, x, fy, c, a) => {
    // 气旋地环：旋转的气旋弧线 + 偶发闪电
    const y = fy + R_DY;
    for (let k = 0; k < 3; k++) {
      g.lineStyle(2, c, 0.5 + 0.3 * Math.sin(now / 300 + k));
      g.beginPath();
      g.arc(x, y, 10 + k * 7, now / 600 + k * 2, now / 600 + k * 2 + 2.4);
      g.strokePath();
    }
    if (Math.sin(now / 500) > 0.86) {
      rline(g, [[x - 6, y - 6], [x + 2, y + 1], [x - 2, y + 1], [x + 6, y + 8]], 2, 0xffe89a, 0.95);
    }
  } },
  lunarRing: { a: 0xd8e8ff, draw: (g, now, x, fy, c, a) => {
    // 月宫地环：银白环 + 一圈月光晕 + 桂枝
    const y = fy + R_DY;
    g.fillStyle(0xffffff, 0.3 + 0.12 * Math.sin(now / 600)); g.fillEllipse(x, y, R_RX * 2.4, R_RY * 2.6);
    g.lineStyle(2.6, c, 0.95); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    g.fillStyle(a, 0.85);
    for (let k = 0; k < 3; k++) g.fillEllipse(x - 8 + k * 8, y - 1, 5, 2.4);
  } },
  vikingRing: { a: 0x8fb4de, draw: (g, now, x, fy, c, a) => {
    // 营地地环：一圈营火石 + 火堆余烬
    const y = fy + R_DY;
    for (let k = 0; k < 6; k++) {
      const aa = (k / 6) * Math.PI * 2;
      g.fillStyle(0x6a6a72, 0.95);
      g.fillCircle(x + Math.cos(aa) * 21, y + Math.sin(aa) * 5.8, 3);
    }
    const fl = Math.abs(Math.sin(now / 160));
    g.fillStyle(0xff8a3c, 0.9);
    g.fillEllipse(x, y - 3, 10, 5 + fl * 3);
    g.fillStyle(0xffd45c, 0.9);
    g.fillEllipse(x, y - 3, 5, 2.6 + fl * 2);
  } },
  safariRing: { a: 0xd9b45c, draw: (g, now, x, fy, c, a) => {
    // 营火地环（猎游）：土环 + 探照灯斑 + 草丛
    const y = fy + R_DY;
    g.fillStyle(0xc9a45c, 0.45); g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
    g.lineStyle(2, a, 0.8); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    for (let k = 0; k < 3; k++) {
      g.lineStyle(1.6, 0x5f8a3a, 0.9);
      const px = x - 12 + k * 12;
      g.beginPath(); g.moveTo(px, y + 2); g.lineTo(px - 2, y - 5); g.strokePath();
      g.beginPath(); g.moveTo(px, y + 2); g.lineTo(px + 2.6, y - 4); g.strokePath();
    }
  } },
  theatRing: { a: 0xffd45c, draw: (g, now, x, fy, c, a) => {
    // 舞台地环：舞台脚灯环 + 聚光角标
    const y = fy + R_DY;
    g.fillStyle(0x2a1a2e, 0.5); g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
    g.lineStyle(2.6, a, 0.9); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    for (let k = 0; k < 5; k++) {
      const aa = (k / 5) * Math.PI * 2;
      g.fillStyle(0xfff2c4, 0.6 + 0.3 * Math.sin(now / 300 + k));
      g.fillCircle(x + Math.cos(aa) * 22, y + Math.sin(aa) * 6, 2.6);
    }
  } },
  boreaRing: { a: 0x7dffc4, draw: (g, now, x, fy, c, a) => {
    // 冰原地环：冰晶环 + 极光带扫过
    const y = fy + R_DY;
    g.fillStyle(0xd8f2ff, 0.55); g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
    g.lineStyle(2, a, 0.8); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    const sweep = Math.sin(now / 900);
    g.fillStyle(0x7dffc4, 0.25 + 0.15 * sweep);
    g.fillEllipse(x + sweep * 8, y, R_RX * 1.2, R_RY);
  } },
  venicRing: { a: 0x2a5a8a, draw: (g, now, x, fy, c, a) => {
    // 运河地环：一圈水面 + 荡开的水纹 + 小船影
    const y = fy + R_DY;
    g.fillStyle(0x35a8b8, 0.4); g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
    for (let k = 0; k < 3; k++) {
      const w = 10 + ((now / 7 + k * 22) % 40);
      g.lineStyle(1.4, 0xffffff, 0.5 - w * 0.008);
      g.strokeEllipse(x, y, w * 1.6, w * 0.5);
    }
    g.fillStyle(a, 0.9);
    g.fillEllipse(x + 12, y, 10, 3.6);
  } },
  olympRing: { a: 0xffd45c, draw: (g, now, x, fy, c, a) => {
    // 竞技场地环：大理石环 + 五个奥运色小环
    const y = fy + R_DY;
    g.fillStyle(0xe8e4d8, 0.6); g.fillEllipse(x, y, R_RX * 2, R_RY * 2);
    g.lineStyle(2.6, a, 0.9); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    const cols = [0x4a90d9, 0x1e222a, 0xe8404a, 0xffd45c, 0x2a9a5a];
    for (let k = 0; k < 5; k++) {
      g.lineStyle(1.6, cols[k], 0.95);
      g.strokeEllipse(x - 14 + k * 7, y, 7, 5);
    }
  } },
  sambaRing: { a: 0x2a9a5a, draw: (g, now, x, fy, c, a) => {
    // 舞池地环：彩片环 + 明灭舞灯
    const y = fy + R_DY;
    g.lineStyle(3, c, 0.9); g.strokeEllipse(x, y, R_RX * 2, R_RY * 2);
    for (let k = 0; k < 8; k++) {
      const aa = (k / 8) * Math.PI * 2;
      g.fillStyle([0xe8404a, 0xffd45c, 0x4ac8ff, 0xffffff][k % 4], 0.6 + 0.35 * Math.sin(now / 240 + k));
      g.fillEllipse(x + Math.cos(aa) * 22, y + Math.sin(aa) * 6, 5, 3);
    }
  } },
};
