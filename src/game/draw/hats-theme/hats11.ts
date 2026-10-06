import { hpoly, TAU, type HatArt } from './shared';

/** 批八主题头饰（敦煌飞天 / 羽蛇神殿 / 圣辉天界） */
export const HATS_11: Record<string, HatArt> = {
  dunHatA: { c: 0xff9adf, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 花鬘：绕额的花鬘——花朵串 + 垂坠小花 + 步摇珠
    for (let k = -3; k <= 3; k++) { // 七朵花绕额
      const fy = hy - 2 - Math.cos(k * 0.5) * 2;
      g.fillStyle(k % 2 ? c : 0xffb0c8, 1);
      for (let s = 0; s < 5; s++) {
        const ang = (s / 5) * TAU + now / 600;
        g.fillEllipse(x + k * 4.6 + Math.cos(ang) * 1.8, fy + Math.sin(ang) * 1.8, 2, 1.4);
      }
      g.fillStyle(a, 1);
      g.fillCircle(x + k * 4.6, fy, 1);
    }
    for (const s of [-1, 1]) { // 两鬓垂花（摇曳）
      const sway = Math.sin(now / 340 + (s > 0 ? 0 : 1.2)) * 1.6;
      g.lineStyle(1, a, 0.9);
      g.lineBetween(x + s * 14, hy - 1, x + s * 15 + sway, hy + 6);
      g.fillStyle(0xffb0c8, 0.95);
      g.fillCircle(x + s * 15 + sway, hy + 7, 1.8);
    }
    const tw = 0.5 + 0.5 * Math.sin(now / 260); // 额心花宝光
    g.fillStyle(0xffffff, tw * 0.8);
    g.fillCircle(x, hy - 4, 1.2);
  } },
  dunHatB: { c: 0xffd45c, a: 0xff9adf, draw: (g, now, x, hy, c, a) => {
    // 金步摇冠：金冠 + 满冠步摇（垂珠链随节奏摇）
    g.fillStyle(c, 1); // 冠体
    g.fillRect(x - 12, hy - 4, 24, 7);
    g.fillStyle(0xd9b45c, 0.8);
    g.fillRect(x - 12, hy + 1, 24, 2);
    for (let k = -2; k <= 2; k++) { // 冠上金齿
      g.fillStyle(0xfff0b0, 0.95);
      g.fillTriangle(x + k * 4.8 - 2, hy - 4, x + k * 4.8 + 2, hy - 4, x + k * 4.8, hy - 8);
    }
    for (let k = -2; k <= 2; k++) { // 步摇垂珠链（三珠一串，轻摇）
      const sway = Math.sin(now / 300 + k * 1.3) * 1.8;
      g.lineStyle(0.9, a, 0.9);
      g.lineBetween(x + k * 4.8, hy - 8, x + k * 4.8 + sway, hy - 2);
      for (let s = 0; s < 3; s++) {
        g.fillStyle(0xfff0d8, 0.9);
        g.fillCircle(x + k * 4.8 + sway * (s / 2), hy - 6 + s * 2.6, 1);
      }
    }
    const tw = 0.5 + 0.5 * Math.sin(now / 280); // 冠心宝石
    g.fillStyle(a, 1);
    g.fillCircle(x, hy - 0.4, 2.4);
    g.fillStyle(0xffffff, tw * 0.8);
    g.fillCircle(x - 0.7, hy - 1.1, 0.8);
  } },
  aztHatA: { c: 0x3ad49a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 凤尾羽冠：绿咬鹃羽冠——扇形排羽 + 羽轴 + 金额饰
    g.fillStyle(0x8a6a3a, 1); // 冠带
    g.fillRect(x - 14, hy - 2, 28, 5);
    g.fillStyle(a, 0.8);
    g.fillRect(x - 14, hy + 1, 28, 1.4);
    for (let k = -4; k <= 4; k++) { // 扇形排羽（中间最高，随风轻摆）
      const sway = Math.sin(now / 380 + k) * 1.6;
      const h = 20 - Math.abs(k) * 2.8;
      const bx = x + k * 3.2;
      g.fillStyle(k % 2 ? c : 0x2a9a6e, 0.95);
      hpoly(g, [
        [bx - 2, hy - 2], [bx + sway * 0.6, hy - h], [bx + 2 + sway, hy - h + 2], [bx + 2, hy - 2],
      ], k % 2 ? c : 0x2a9a6e, 0.95);
      g.lineStyle(0.8, a, 0.6); // 羽轴
      g.lineBetween(bx, hy - 3, bx + sway * 0.6, hy - h + 3);
    }
    g.fillStyle(a, 0.95); // 额饰（金圆日徽）
    g.fillCircle(x, hy + 0.6, 2.4);
    g.fillStyle(0xff4a3a, 0.9);
    g.fillCircle(x, hy + 0.6, 1);
  } },
  aztHatB: { c: 0xd9b45c, a: 0x3ad49a, draw: (g, now, x, hy, c, a) => {
    // 金豹战盔：美洲豹头形金盔——豹盔 + 双耳 + 铊纹 + 獠牙护颊
    g.fillStyle(c, 1); // 盔体（豹头）
    g.beginPath(); g.arc(x, hy + 2, 14, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillRect(x - 14, hy + 2, 28, 5);
    g.fillStyle(0xb8943a, 0.7); // 盔面铊纹豹斑
    for (let k = 0; k < 4; k++) {
      g.fillCircle(x - 8 + (k % 2) * 15, hy - 5 + Math.floor(k / 2) * 5, 1.8);
    }
    for (const s of [-1, 1]) { // 双耳
      g.fillStyle(c, 1);
      g.fillTriangle(x + s * 9, hy - 10, x + s * 13, hy - 13, x + s * 11, hy - 16);
      g.fillStyle(a, 0.8);
      g.fillTriangle(x + s * 10, hy - 11, x + s * 12, hy - 12, x + s * 11, hy - 14);
    }
    g.fillStyle(0x0e2418, 1); // 观察眼孔
    g.fillEllipse(x - 5, hy - 2, 4.4, 3);
    g.fillEllipse(x + 5, hy - 2, 4.4, 3);
    g.fillStyle(0xdfe8f5, 0.6 + 0.3 * Math.sin(now / 300)); // 眼孔幽光
    g.fillCircle(x - 5, hy - 2, 1);
    g.fillCircle(x + 5, hy - 2, 1);
    g.fillStyle(0xfff0d8, 1); // 獠牙护颊
    g.fillTriangle(x - 9, hy + 5, x - 6, hy + 5, x - 7.5, hy + 9);
    g.fillTriangle(x + 9, hy + 5, x + 6, hy + 5, x + 7.5, hy + 9);
    g.fillStyle(a, 0.8); // 盔顶羽饰一撮
    for (let k = -1; k <= 1; k++) g.fillEllipse(x + k * 2.4, hy - 15 + Math.sin(now / 300 + k) * 1.2, 1.8, 5);
  } },
  angHatA: { c: 0xffd45c, a: 0xfff6d8, draw: (g, now, x, hy, c, a) => {
    // 圣光环：头顶悬浮的金色光环——主环 + 内辉环 + 光尘 + 上下浮动
    const bob = Math.sin(now / 600) * 3;
    const ry = hy - 12 + bob;
    g.fillStyle(c, 0.15);
    g.fillEllipse(x, ry, 40, 12);
    g.lineStyle(4, c, 0.9);
    g.strokeEllipse(x, ry, 30, 9);
    g.lineStyle(1.6, a, 0.8);
    g.strokeEllipse(x, ry, 22, 6.4);
    g.fillStyle(0xffffff, 0.85); // 环上高光点
    g.fillEllipse(x - 8, ry - 2, 4, 1.6);
    for (let k = 0; k < 4; k++) { // 光尘
      const ph = (now / 900 + k / 4) % 1;
      g.fillStyle(a, 0.6 * (1 - ph));
      g.fillCircle(x + Math.sin(k * 2.4) * 14, ry - 2 - ph * 14, 1.2 * (1 - ph) + 0.4);
    }
  } },
  angHatB: { c: 0xfff6d8, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 炽天使冠：白金冠冕——三重冠环 + 顶十字 + 冠沿宝珠 + 圣光
    g.fillStyle(c, 1); // 冠体
    g.fillRoundedRect(x - 12, hy - 4, 24, 9, 3);
    g.lineStyle(1.6, a, 0.9); // 三重冠环
    g.strokeRect(x - 12, hy - 4, 24, 3.4);
    g.strokeRect(x - 10.4, hy + 1, 20.8, 3);
    g.fillStyle(a, 0.95); // 冠沿宝珠
    for (let k = -1; k <= 1; k++) g.fillCircle(x + k * 7, hy + 4.4, 1.4);
    g.lineStyle(2.4, a, 0.95); // 顶十字
    g.lineBetween(x, hy - 6, x, hy - 16);
    g.lineBetween(x - 4, hy - 12, x + 4, hy - 12);
    g.fillStyle(0xffffff, 0.7 + 0.3 * Math.sin(now / 260)); // 冠顶圣光
    g.fillCircle(x, hy - 17, 2.4);
    g.fillStyle(c, 0.2);
    g.fillCircle(x, hy - 17, 5);
    for (const s of [-1, 1]) { // 冠侧小翼
      g.fillStyle(0xf0e8d0, 0.9);
      hpoly(g, [
        [x + s * 11, hy - 2], [x + s * 16, hy - 8], [x + s * 17, hy - 3], [x + s * 12, hy + 1],
      ], 0xf0e8d0, 0.9);
    }
  } },
};
