import { TAU, type WingArt } from './shared';

/**
 * 批十一背挂物件（全部 single:true，居中只画一次，不镜像）
 * 软泥秘境：软泥触手 / 凝胶核心 / 泡泡机 / 黏液瓶
 * 妖猫夜行：妖铃铛串 / 妖火提灯 / 招财幡 / 影分身猫灵
 * 甲虫王朝：琥珀晶石 / 蜂巢背匣 / 叶甲战旗 / 备用巨角
 */
export const WINGS_18: Record<string, WingArt> = {
  // ── 软泥秘境 ──
  slimeBackA: { c: 0x9aff7a, a: 0xd0ff9a, single: true, draw: (g, now, _flap, c, a) => {
    // 软泥触手：三条果冻触手从背后竖起轻摆，梢头带吸盘
    for (let k = -1; k <= 1; k++) {
      const sway = Math.sin(now / 420 + k * 1.8) * 5;
      const bx = k * 10, topX = bx + sway, topY = -46 - Math.abs(k) * -6;
      g.lineStyle(7 - Math.abs(k), c, 0.88);
      g.beginPath();
      g.moveTo(bx, 0);
      g.lineTo(bx + sway * 0.4, -26);
      g.lineTo(topX, topY);
      g.strokePath();
      g.fillStyle(a, 0.9); // 吸盘
      g.fillCircle(topX, topY, 3.4);
      g.fillStyle(0xffffff, 0.45);
      g.fillCircle(topX - 1, topY - 1, 1.2);
    }
    g.fillStyle(c, 0.5); // 根部黏液
    g.fillEllipse(0, 2, 34, 8);
  } },
  slimeBackB: { c: 0xd0ff9a, a: 0x7de87d, single: true, draw: (g, now, _flap, c, a) => {
    // 凝胶核心：背后悬浮的脉动凝胶球，内有游走小泡
    const pulse = 1 + Math.sin(now / 380) * 0.08;
    const r = 15 * pulse;
    g.fillStyle(c, 0.55);
    g.fillCircle(0, -30, r);
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(-r * 0.3, -30 - r * 0.3, r * 0.28);
    for (let k = 0; k < 4; k++) { // 内部游走小泡
      const ph = now / 500 + k * 1.7;
      const bx = Math.cos(ph) * r * 0.5, by = -30 + Math.sin(ph * 1.3) * r * 0.5;
      g.fillStyle(0xffffff, 0.5);
      g.fillCircle(bx, by, 1.6 + (k % 2));
    }
    g.lineStyle(1.6, a, 0.7);
    g.beginPath(); g.arc(0, -30, r, 0, TAU); g.strokePath();
    g.fillStyle(a, 0.35); // 底部托光
    g.fillEllipse(0, -14, r * 2.2, 5);
  } },
  slimeBackC: { c: 0x5ac8ff, a: 0xd0ff9a, single: true, draw: (g, now, _flap, c, a) => {
    // 泡泡机：小圆机匣 + 顶部出泡口，成串泡泡向上飘
    g.fillStyle(0x2a3a4a, 0.95); // 机匣
    g.fillRoundedRect(-9, -22, 18, 20, 4);
    g.fillStyle(c, 0.9); // 出泡口
    g.fillEllipse(0, -23, 12, 5);
    g.fillStyle(0x8ae0ff, 0.4); // 观察窗
    g.fillRoundedRect(-6, -18, 12, 7, 2);
    for (let k = 0; k < 5; k++) { // 飘起的泡泡
      const ph = (now / 900 + k * 0.24) % 1;
      const by = -26 - ph * 30, bx = Math.sin(ph * 7 + k * 2) * 7;
      const r = 2.4 + k % 3;
      g.fillStyle(0xd0f0ff, 0.4 * (1 - ph * 0.5));
      g.fillCircle(bx, by, r);
      g.fillStyle(0xffffff, 0.5 * (1 - ph));
      g.fillCircle(bx - r * 0.3, by - r * 0.3, r * 0.3);
    }
    g.fillStyle(a, 0.6); // 侧挂黏液滴
    g.fillCircle(9, -8 + Math.sin(now / 400) * 1, 2);
  } },
  slimeBackD: { c: 0xffd45c, a: 0x9aff7a, single: true, draw: (g, now, _flap, c, a) => {
    // 黏液瓶：背后斜背的软木塞圆瓶，绿液晃动冒泡
    g.save();
    g.translateCanvas(0, -28);
    g.rotateCanvas(0.18);
    g.fillStyle(0xd8e8f0, 0.4); // 瓶身玻璃
    g.fillRoundedRect(-8, -12, 16, 26, 6);
    g.fillStyle(c, 0.85); // 瓶内液体（液面晃动）
    const lvl = Math.sin(now / 350) * 1.2;
    g.fillRect(-7.2, -2 + lvl, 14.4, 15);
    for (let k = 0; k < 3; k++) { // 液内上浮小泡
      const ph = (now / 700 + k * 0.4) % 1;
      g.fillStyle(0xffffff, 0.5 * (1 - ph));
      g.fillCircle(Math.sin(ph * 6 + k) * 4, 10 - ph * 11, 1.4);
    }
    g.fillStyle(0x8a6a3a, 1); // 软木塞
    g.fillRoundedRect(-4, -17, 8, 6, 2);
    g.lineStyle(1.2, a, 0.6);
    g.strokeRoundedRect(-8, -12, 16, 26, 6);
    g.restore();
    g.fillStyle(0x5a4a2a, 0.9); // 背带扣
    g.fillRect(-2, -6, 4, 8);
  } },
  // ── 妖猫夜行 ──
  nekBackA: { c: 0xb08aff, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 妖铃铛串：从肩后垂下的三只妖铃，左右轻晃
    for (let k = 0; k < 3; k++) {
      const bx = -12 + k * 12, sway = Math.sin(now / 380 + k * 1.9) * 2.6;
      const topY = -22, botY = -34 + k * 5;
      g.lineStyle(1.4, 0x6a5a8a, 0.9);
      g.beginPath();
      g.moveTo(bx, topY);
      g.lineTo(bx + sway, botY);
      g.strokePath();
      g.fillStyle(k === 1 ? a : c, 0.95); // 铃身
      g.beginPath(); g.arc(bx + sway, botY + 4, 4.2, Math.PI, TAU); g.closePath(); g.fillPath();
      g.fillRect(bx + sway - 4.2, botY + 4, 8.4, 2);
      g.fillStyle(0x4a3a2a, 1); // 铃舌
      g.fillCircle(bx + sway, botY + 7.4, 1.3);
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(bx + sway - 1.4, botY + 2.6, 1.2);
    }
  } },
  nekBackB: { c: 0xff8ad4, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 妖火提灯：竹竿挑着的纸灯笼，灯内妖火明灭
    g.lineStyle(2.4, 0x4a3a2a, 1); // 竹竿
    g.beginPath();
    g.moveTo(6, 4);
    g.lineTo(20, -40);
    g.strokePath();
    g.lineStyle(1.2, 0x4a3a2a, 1); // 吊绳
    g.lineBetween(20, -40, 17, -50);
    const flick = 0.75 + 0.25 * Math.sin(now / 130);
    g.fillStyle(c, 0.9 * flick); // 灯笼体
    g.fillRoundedRect(11, -56, 12, 14, 5);
    g.fillStyle(0x4a3a2a, 0.9); // 上下箍
    g.fillRect(11, -57, 12, 2);
    g.fillRect(11, -44, 12, 2);
    g.lineStyle(1, 0x8a3a6a, 0.7); // 灯骨
    for (let k = -1; k <= 1; k++) g.lineBetween(17 + k * 4, -55, 17 + k * 4, -45);
    g.fillStyle(a, flick); // 灯内妖火
    g.fillCircle(17, -49, 2.6 + flick * 1.2);
    g.fillStyle(0xffffff, 0.6 * flick);
    g.fillCircle(17, -49, 1.1);
  } },
  nekBackC: { c: 0xffd45c, a: 0xb08aff, single: true, draw: (g, now, _flap, c, a) => {
    // 招财幡：背后竖起的黄幡，幡面波纹 + 顶端铜铃
    g.lineStyle(2.2, 0x4a3a2a, 1); // 幡杆
    g.lineBetween(-14, 4, -14, -52);
    const wave = Math.sin(now / 300);
    g.fillStyle(c, 0.92); // 幡面
    g.fillPoints([
      { x: -12, y: -50 }, { x: 6, y: -50 + wave }, { x: 8, y: -18 + wave }, { x: -12, y: -16 },
    ] as never, true);
    g.fillStyle(0x8a3a2a, 0.85); // 幡头福字块
    g.fillRect(-9, -46 + wave * 0.5, 14, 10);
    g.fillStyle(0xffe8a0, 0.9); // 波纹暗纹
    for (let k = 0; k < 3; k++) {
      g.fillRect(-10, -32 + k * 5 + wave * (k + 1) * 0.4, 16, 1.2);
    }
    g.fillStyle(a, 0.95); // 顶端铜铃
    g.beginPath(); g.arc(-14, -55, 3, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(-15, -56, 1);
  } },
  nekBackD: { c: 0x8a9aff, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 影分身猫灵：肩后悬浮半透明猫灵虚影，尾巴慢摆
    const bob = Math.sin(now / 450) * 2.4;
    const ghost = 0.4 + 0.12 * Math.sin(now / 300);
    g.save();
    g.translateCanvas(10, -34 + bob);
    g.fillStyle(c, ghost); // 猫身
    g.fillEllipse(0, 0, 18, 12);
    g.fillStyle(c, ghost); // 头
    g.fillCircle(6, -7, 6);
    g.fillStyle(c, ghost); // 双耳
    g.fillPoints([{ x: 2, y: -11 }, { x: 4, y: -17 }, { x: 7, y: -12 }] as never, true);
    g.fillPoints([{ x: 9, y: -12 }, { x: 12, y: -16 }, { x: 12, y: -10 }] as never, true);
    g.fillStyle(a, ghost + 0.2); // 灵眼
    g.fillEllipse(4.5, -7.5, 2.4, 1.4);
    g.fillEllipse(8, -7.5, 2.4, 1.4);
    g.lineStyle(3, c, ghost); // 灵尾
    g.beginPath();
    g.moveTo(-8, -1);
    g.lineTo(-14, 2 + Math.sin(now / 400) * 3);
    g.lineTo(-14, -8 + Math.sin(now / 400) * 3);
    g.strokePath();
    g.restore();
    g.fillStyle(0x6a7aff, 0.25); // 残影拖雾
    g.fillEllipse(4, -30 + bob * 0.6, 26, 8);
  } },
  // ── 甲虫王朝 ──
  btlBackA: { c: 0xd9a83c, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 琥珀晶石：背后嵌着一块琥珀原石，内封远古小虫
    g.save();
    g.translateCanvas(0, -30);
    g.fillStyle(c, 0.75); // 原石外形（不规则六边）
    g.fillPoints([{ x: -11, y: -8 }, { x: -3, y: -14 }, { x: 9, y: -10 }, { x: 12, y: 2 }, { x: 2, y: 12 }, { x: -10, y: 6 }] as never, true);
    g.fillStyle(0x8a5a1a, 0.5); // 内部深晕
    g.fillEllipse(2, 2, 14, 12);
    g.fillStyle(0x3a2a10, 0.9); // 封印小虫
    g.fillEllipse(-2, -1, 6, 3);
    g.fillCircle(1.6, -1.4, 1.8);
    g.lineStyle(1, 0x3a2a10, 0.8); // 虫腿
    for (const s of [-1, 1]) {
      g.lineBetween(-3, -1 + s * 2, -6, -1 + s * 4);
      g.lineBetween(0, -1 + s * 2, 2, -1 + s * 4);
    }
    const glint = Math.abs(Math.sin(now / 520));
    g.fillStyle(0xffffff, glint * 0.45); // 扫光
    g.fillPoints([{ x: -6, y: -9 }, { x: -2, y: -9 }, { x: -8, y: 4 }, { x: -10, y: 2 }] as never, true);
    g.lineStyle(1.2, a, 0.5);
    g.beginPath();
    g.moveTo(-11, -8); g.lineTo(-3, -14); g.lineTo(9, -10); g.lineTo(12, 2); g.lineTo(2, 12); g.lineTo(-10, 6); g.closePath();
    g.strokePath();
    g.restore();
  } },
  btlBackB: { c: 0xc8a832, a: 0x7dff5a, single: true, draw: (g, now, _flap, _c, a) => {
    // 蜂巢背匣：六边形蜂巢背匣，几格巢孔渗蜜发光
    g.fillStyle(0x8a6a2a, 0.95); // 匣体
    g.fillPoints([{ x: -12, y: -40 }, { x: 0, y: -46 }, { x: 12, y: -40 }, { x: 12, y: -18 }, { x: 0, y: -12 }, { x: -12, y: -18 }] as never, true);
    g.fillStyle(0x3a2a10, 0.9); // 巢孔
    const holes: Array<[number, number]> = [[-5, -34], [4, -34], [0, -26], [-5, -20], [4, -20]];
    holes.forEach(([hx, hy], i) => {
      const glow = 0.35 + 0.3 * Math.abs(Math.sin(now / 400 + i * 1.3));
      g.fillStyle(i === 2 ? 0x000000 : 0x3a2a10, 0.9);
      g.beginPath(); g.arc(hx, hy, 3, 0, TAU); g.fillPath();
      if (i % 2 === 0) { // 渗蜜
        g.fillStyle(a, glow);
        g.fillCircle(hx, hy + 0.5, 1.8);
      }
    });
    g.lineStyle(1.4, a, 0.55);
    g.beginPath();
    g.moveTo(-12, -40); g.lineTo(0, -46); g.lineTo(12, -40); g.lineTo(12, -18); g.lineTo(0, -12); g.lineTo(-12, -18); g.closePath();
    g.strokePath();
    g.fillStyle(0xffd45c, 0.6); // 匣底滴蜜
    g.fillCircle(2, -10 + Math.abs(Math.sin(now / 500)) * 2, 1.6);
  } },
  btlBackC: { c: 0x7dff5a, a: 0xc8a832, single: true, draw: (g, now, _flap, c, a) => {
    // 叶甲战旗：叶形战旗 + 叶脉纹 + 杆顶金甲虫徽
    g.lineStyle(2.4, 0x3a4a20, 1); // 旗杆
    g.lineBetween(-12, 4, -12, -54);
    const wave = Math.sin(now / 320) * 2;
    g.fillStyle(0x3a6a2a, 0.95); // 叶形旗面
    g.fillPoints([
      { x: -10, y: -52 }, { x: 8, y: -48 + wave }, { x: 14, y: -34 + wave }, { x: 8, y: -20 + wave * 0.5 }, { x: -10, y: -18 },
    ] as never, true);
    g.lineStyle(1, 0x8ae85a, 0.7); // 叶脉
    g.beginPath();
    g.moveTo(-9, -35);
    g.lineTo(12, -35 + wave * 0.6);
    for (let k = 0; k < 3; k++) {
      const vy = -46 + k * 9 + wave * 0.5;
      g.moveTo(-8 + k * 2, vy);
      g.lineTo(4, vy + 2);
    }
    g.strokePath();
    g.fillStyle(c, 0.9); // 金甲虫徽
    g.fillEllipse(2, -40 + wave * 0.4, 6, 3.4);
    g.fillCircle(5.4, -40.6 + wave * 0.4, 1.8);
    g.fillStyle(a, 1); // 杆顶徽珠
    g.fillCircle(-12, -56, 2.2);
  } },
  btlBackD: { c: 0x8a6a2a, a: 0xd9a83c, single: true, draw: (g, now, _flap, c, a) => {
    // 备用巨角：斜缚在背后的独角仙巨角，缚绳 + 微光
    g.save();
    g.translateCanvas(-4, -34);
    g.rotateCanvas(-0.5);
    g.fillStyle(c, 0.95); // 角主体（弯月形）
    g.fillPoints([
      { x: 0, y: 16 }, { x: -6, y: 4 }, { x: -8, y: -10 }, { x: -4, y: -22 }, { x: 2, y: -26 }, { x: 5, y: -18 }, { x: 4, y: -4 },
    ] as never, true);
    g.fillStyle(0x5a4a1a, 0.6); // 纵向棱纹
    for (let k = 0; k < 3; k++) {
      g.fillRect(-5 + k * 3, -20, 1.2, 32);
    }
    g.fillStyle(a, 0.9); // 角尖
    g.fillPoints([{ x: -4, y: -22 }, { x: 2, y: -26 }, { x: 5, y: -18 }] as never, true);
    g.lineStyle(2, 0x3a2a10, 0.9); // 缚绳两道
    g.lineBetween(-8, 2, 5, 0);
    g.lineBetween(-7, -8, 4.4, -10);
    const glint = Math.abs(Math.sin(now / 600));
    g.fillStyle(0xffffff, glint * 0.35); // 扫光
    g.fillRect(-4, -16, 1.6, 8);
    g.restore();
  } },
};
