import { TAU, type WingArt } from './shared';

/** 批十二背挂物件（全部 single:true，居中画一次）：
 * 变形机甲：聚变火种 / 双联肩炮 / 推进器组 / 相位圆盾
 * 蛛网游侠：蛛丝发射器 / 蛛网翼膜 / 蛛形背包 / 蛛网陷阱匣
 * 钢铁巨兽：熔炉心脏 / 兽牙导弹舱 / 液压尾骨 / 装甲翼匣
 */
export const WINGS_19: Record<string, WingArt> = {
  // ── 变形机甲 ──
  tfBackA: { c: 0x2a3a4a, a: 0xff8a2a, single: true, draw: (g, now, _flap, c, a) => {
    // 聚变火种：装甲托架中的橙色火种核，双环反向旋转，能量弧外溢
    const pulse = 0.7 + 0.3 * Math.sin(now / 320);
    // 托架
    g.fillStyle(c, 1);
    g.fillPoints([{ x: -16, y: -6 }, { x: -10, y: -24 }, { x: 10, y: -24 }, { x: 16, y: -6 }, { x: 10, y: 4 }, { x: -10, y: 4 }] as never, true);
    g.fillStyle(0x3a4a5a, 0.8);
    g.fillPoints([{ x: -12, y: -8 }, { x: -8, y: -20 }, { x: 8, y: -20 }, { x: 12, y: -8 }] as never, true);
    for (const s of [-1, 1]) { // 托架铆钉
      g.fillStyle(0x9aa4b2, 0.9);
      for (let k = 0; k < 3; k++) g.fillCircle(s * 12, -20 + k * 7, 0.9);
    }
    // 火种核（外发光 + 内核）
    for (let k = 3; k >= 0; k--) {
      g.fillStyle(a, 0.16 * pulse * (1 - k * 0.2));
      g.fillCircle(0, -14, 9 + k * 4);
    }
    g.fillStyle(0xffd45c, 0.95);
    g.fillCircle(0, -14, 6);
    g.fillStyle(0xffffff, 0.9 * pulse);
    g.fillCircle(0, -15, 2.4);
    // 双环反向旋转（缩放圆实现透视环）
    for (const [r, dir, sp] of [[15, 1, 700], [19, -1, 950]] as Array<[number, number, number]>) {
      const ang = dir * (now / sp);
      g.save(); g.translateCanvas(0, -14); g.scaleCanvas(1, 0.42); g.rotateCanvas(ang);
      g.lineStyle(1.6, 0x5ac8ff, 0.55);
      g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 1.5); g.strokePath();
      g.restore();
    }
    // 能量弧（两条分叉）
    for (let k = 0; k < 2; k++) {
      const a0 = now / 260 + k * 2.4;
      let px = Math.cos(a0) * 12, py = -14 + Math.sin(a0) * 6;
      for (let s = 1; s <= 3; s++) {
        const ang2 = a0 + s * 0.8 + Math.sin(now / 70 + s) * 0.5;
        const nx = Math.cos(ang2) * (14 + s * 5), ny = -14 + Math.sin(ang2) * (6 + s * 3);
        g.lineStyle(s > 2 ? 1.8 : 1.2, s > 2 ? 0xffffff : a, 0.6);
        g.lineBetween(px, py, nx, ny);
        px = nx; py = ny;
      }
    }
  } },
  tfBackB: { c: 0x2a3a4a, a: 0x5ac8ff, single: true, draw: (g, now, _flap, c, a) => {
    // 双联肩炮：双管自肩后越顶，炮口蓄能 + 后坐 + 准星
    const fire = (now / 1500) % 1;
    for (const s of [-1, 1]) {
      const recoil = fire < 0.08 ? (0.08 - fire) * 30 : 0; // 开火后坐
      g.save();
      g.translateCanvas(s * 14, -26 + recoil);
      g.fillStyle(0x1a2430, 1); // 基座
      g.fillRoundedRect(-6, 14, 12, 12, 3);
      g.fillStyle(c, 1); // 炮管
      g.fillRoundedRect(-4, -18, 8, 34, 3);
      g.fillStyle(0x3a4a5a, 0.9); // 管身分段
      for (let k = 0; k < 4; k++) g.fillRect(-4.6, -14 + k * 9, 9.2, 2.2);
      g.fillStyle(0x8a94a2, 0.95); // 管口
      g.fillRoundedRect(-5.4, -21, 10.8, 5, 2);
      const gl = Math.max(0.25, 1 - fire * 3); // 蓄能/开火闪光
      g.fillStyle(a, 0.5 * gl);
      g.fillCircle(0, -19, 5 * gl + 1.4);
      g.fillStyle(0xffffff, 0.85 * gl);
      g.fillCircle(0, -19, 1.8);
      g.restore();
    }
    // 目标准星（缓慢游走）
    const rx = Math.sin(now / 1300) * 22, ry = -46 + Math.cos(now / 1700) * 10;
    g.lineStyle(1.2, a, 0.55);
    g.lineBetween(rx - 7, ry, rx - 2, ry); g.lineBetween(rx + 2, ry, rx + 7, ry);
    g.lineBetween(rx, ry - 7, rx, ry - 2); g.lineBetween(rx, ry + 2, rx, ry + 7);
    g.lineStyle(1, a, 0.3);
    g.save(); g.translateCanvas(rx, ry); g.scaleCanvas(1, 0.5);
    g.beginPath(); g.arc(0, 0, 11, 0, TAU); g.strokePath(); g.restore();
  } },
  tfBackC: { c: 0x22303f, a: 0xff8a2a, single: true, draw: (g, now, _flap, c, _a) => {
    // 推进器组：双喷口 + 焰锥（含马赫环）+ 进气格栅 + 热浪
    g.fillStyle(c, 1); // 主体箱
    g.fillRoundedRect(-18, -26, 36, 24, 4);
    g.fillStyle(0x2f4152, 0.9);
    g.fillRoundedRect(-15, -23, 30, 8, 3);
    for (let k = 0; k < 5; k++) { // 进气格栅
      g.fillStyle(0x141c26, 1);
      g.fillRect(-13 + k * 5.6, -22, 3.4, 6);
    }
    for (let k = 0; k < 3; k++) { // 顶部散热鳍
      g.fillStyle(0x8a94a2, 0.9);
      g.fillRect(-12 + k * 9, -30, 3, 6);
    }
    for (const s of [-1, 1]) { // 双喷口 + 焰锥
      g.fillStyle(0x8a94a2, 1);
      g.fillRoundedRect(s * 9 - 4.6, -4, 9.2, 6, 2);
      const fl = 0.8 + 0.2 * Math.sin(now / 90 + s);
      for (let k = 0; k < 3; k++) { // 马赫环
        const d = 4 + k * 5;
        g.fillStyle(k === 0 ? 0xffffff : k === 1 ? 0xffd45c : 0xff6a2a, (0.85 - k * 0.22) * fl);
        g.fillEllipse(s * 9, d, (9 - k * 2) * fl, 4 - k * 0.6);
      }
      for (let k = 0; k < 3; k++) { // 热浪粒子
        const ph = ((now / 500 + k / 3) % 1);
        g.fillStyle(0xd8e8f0, 0.16 * (1 - ph));
        g.fillCircle(s * 9 + (k - 1) * 4, 4 + ph * 14, 3 + ph * 3);
      }
    }
  } },
  tfBackD: { c: 0x24344a, a: 0x5ac8ff, single: true, draw: (g, now, _flap, c, a) => {
    // 相位圆盾：六片能量板绕轴缓转 + 盾面网格 + 边缘辉光
    const spin = now / 2400;
    g.save(); g.translateCanvas(0, -24); g.scaleCanvas(1, 0.72); g.rotateCanvas(spin);
    for (let k = 0; k < 6; k++) { // 六片装甲板
      const ang = (k / 6) * TAU;
      g.fillStyle(k % 2 ? c : 0x32465c, 0.95);
      g.fillPoints([
        { x: Math.cos(ang) * 5, y: Math.sin(ang) * 5 },
        { x: Math.cos(ang - 0.42) * 19, y: Math.sin(ang - 0.42) * 19 },
        { x: Math.cos(ang + 0.42) * 19, y: Math.sin(ang + 0.42) * 19 },
      ] as never, true);
      g.fillStyle(a, 0.35); // 板内能量纹
      g.fillPoints([
        { x: Math.cos(ang) * 8, y: Math.sin(ang) * 8 },
        { x: Math.cos(ang - 0.24) * 16, y: Math.sin(ang - 0.24) * 16 },
        { x: Math.cos(ang + 0.24) * 16, y: Math.sin(ang + 0.24) * 16 },
      ] as never, true);
    }
    g.restore();
    // 外环辉光 + 游走光点
    g.lineStyle(1.6, a, 0.6 * (0.7 + 0.3 * Math.sin(now / 400)));
    g.save(); g.translateCanvas(0, -24); g.scaleCanvas(1, 0.72);
    g.beginPath(); g.arc(0, 0, 21, 0, TAU); g.strokePath(); g.restore();
    const la = now / 700;
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(Math.cos(la) * 21, -24 + Math.sin(la) * 15, 1.6);
    // 盾心
    g.fillStyle(a, 0.5);
    g.fillCircle(0, -24, 5);
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(0, -24, 2);
  } },
  // ── 蛛网游侠 ──
  spdBackA: { c: 0xc8323c, a: 0xf0f4f8, single: true, draw: (g, now, _flap, c, a) => {
    // 蛛丝发射器：腕上式装置挂在背后，弹匣 + 转盘 + 丝线喷出，蜘蛛标
    g.fillStyle(0x2a3a5a, 1); // 基座
    g.fillRoundedRect(-13, -22, 26, 20, 5);
    g.fillStyle(0x3a4a6a, 0.9);
    g.fillRoundedRect(-10, -19, 20, 7, 3);
    for (const s of [-1, 1]) { // 双弹匣
      g.fillStyle(c, 1);
      g.fillRoundedRect(s * 9 - 4, -20, 8, 13, 2.4);
      g.fillStyle(0x8a1a24, 0.8);
      g.fillRect(s * 9 - 3, -18, 6, 2);
    }
    // 中央转盘（缓转 + 齿孔）
    const spin = now / 1400;
    g.fillStyle(a, 0.95);
    g.fillCircle(0, -12, 6.4);
    g.fillStyle(0x2a3a5a, 1);
    for (let k = 0; k < 6; k++) {
      const ang = spin + (k / 6) * TAU;
      g.fillCircle(Math.cos(ang) * 4.4, -12 + Math.sin(ang) * 4.4, 1.2);
    }
    // 蜘蛛标（背部徽记）
    g.fillStyle(0xf0f4f8, 0.9);
    g.fillEllipse(0, -12, 4, 5);
    g.lineStyle(1, 0xf0f4f8, 0.8);
    for (let k = 0; k < 4; k++) {
      const ang = -0.9 + k * 0.6;
      g.lineBetween(0, -12, Math.cos(ang) * 7, -12 + Math.sin(ang) * 7);
      g.lineBetween(0, -12, -Math.cos(ang) * 7, -12 + Math.sin(ang) * 7);
    }
    // 丝线喷出（两条飘动）
    for (const s of [-1, 1]) {
      const w = Math.sin(now / 420 + s) * 5;
      g.lineStyle(1.4, 0xffffff, 0.55);
      g.beginPath();
      g.moveTo(s * 6, -4);
      g.lineTo(s * (10 + w * 0.5), 4);
      g.lineTo(s * (14 + w), 12);
      g.strokePath();
    }
    for (let k = 0; k < 3; k++) { // 装置指示灯
      const on = Math.sin(now / 300 + k * 1.5) > 0;
      g.fillStyle(on ? 0x8ae0ff : 0x2a4a5a, on ? 0.95 : 0.5);
      g.fillCircle(-8 + k * 8, -23, 1.2);
    }
  } },
  spdBackB: { c: 0x2a3a5a, a: 0xff4a5a, single: true, draw: (g, now, _flap, c, a) => {
    // 蛛网翼膜：双翼由蛛丝网撑开，网结处有露珠，边缘飘丝
    for (const s of [-1, 1]) {
      const sway = Math.sin(now / 520 + (s > 0 ? 0 : 0.7)) * 3;
      g.save();
      g.translateCanvas(s * 6, -24);
      g.rotateCanvas(s * 0.22);
      // 膜面
      g.fillStyle(c, 0.35);
      g.fillPoints([{ x: 0, y: -6 }, { x: s * 26, y: -14 + sway }, { x: s * 42, y: 2 + sway }, { x: s * 20, y: 12 }] as never, true);
      // 蛛网骨架（放射 + 同心）
      g.lineStyle(1.3, 0xf0f4f8, 0.75);
      for (let k = 0; k < 4; k++) {
        const ey = -12 + k * 8 + sway * (k / 3);
        g.lineBetween(0, -2, s * 40, ey);
      }
      for (let k = 1; k <= 3; k++) {
        g.beginPath();
        g.moveTo(s * (10 * k), -4 - k * 2 + sway * 0.3 * k);
        g.lineTo(s * (12 * k), k * 3 + sway * 0.4 * k);
        g.strokePath();
      }
      // 网结露珠
      for (let k = 0; k < 3; k++) {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 500 + k * 2 + s));
        g.fillStyle(0xd8f8ff, tw * 0.8);
        g.fillCircle(s * (12 + k * 10), -6 + k * 5 + sway * 0.5, 1.2);
      }
      // 边缘飘丝
      g.lineStyle(1, 0xffffff, 0.4);
      for (let k = 0; k < 2; k++) {
        g.beginPath();
        g.moveTo(s * 40, 2 + sway);
        g.lineTo(s * (44 + k * 4), 8 + k * 5 + Math.sin(now / 400 + k) * 3);
        g.strokePath();
      }
      g.restore();
    }
    // 背部连接器
    g.fillStyle(0x3a4a6a, 1);
    g.fillRoundedRect(-7, -22, 14, 12, 3);
    g.fillStyle(a, 0.9);
    g.fillCircle(0, -16, 2.6);
  } },
  spdBackC: { c: 0x2a3a5a, a: 0x8ae0ff, single: true, draw: (g, now, _flap, c, a) => {
    // 蛛形背包：八角蛛形外壳 + 蛛眼灯 + 蛛足状的固定扣
    g.fillStyle(c, 1);
    g.fillPoints([
      { x: 0, y: -26 }, { x: 13, y: -20 }, { x: 15, y: -8 }, { x: 6, y: -1 }, { x: -6, y: -1 }, { x: -15, y: -8 }, { x: -13, y: -20 },
    ] as never, true);
    g.fillStyle(0x3a4a6a, 0.85); // 背部中脊
    g.fillEllipse(0, -16, 12, 16);
    g.fillStyle(0x1a2436, 1); // 蛛腹分节
    for (let k = 0; k < 3; k++) {
      g.fillEllipse(0, -21 + k * 6, 14 - k * 2, 3);
    }
    // 蛛眼灯（两列，交替闪）
    for (let k = 0; k < 3; k++) {
      for (const s of [-1, 1]) {
        const on = (Math.floor(now / 200) + k) % 3 === 0;
        g.fillStyle(on ? a : 0x2a4a5a, on ? 0.95 : 0.6);
        g.fillCircle(s * (5 + k * 1.4), -22 + k * 2.4, 1.3);
      }
    }
    // 蛛足固定扣（左右各三对，扣在背上）
    g.lineStyle(2.2, 0x3a4a6a, 1);
    for (let k = 0; k < 3; k++) {
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(s * 12, -22 + k * 6);
        g.lineTo(s * (18 + k * 2), -14 + k * 6 + Math.sin(now / 500 + k) * 1.4);
        g.strokePath();
        g.fillStyle(0x8ae0ff, 0.7);
        g.fillCircle(s * (18 + k * 2), -14 + k * 6 + Math.sin(now / 500 + k) * 1.4, 1);
      }
    }
    // 蛛丝吊绳
    for (const s of [-1, 1]) {
      g.lineStyle(1.2, 0xffffff, 0.5);
      g.beginPath();
      g.moveTo(s * 4, -26);
      g.lineTo(s * 6 + Math.sin(now / 600 + s) * 2, -34);
      g.strokePath();
    }
  } },
  spdBackD: { c: 0x2a3a5a, a: 0xff4a5a, single: true, draw: (g, now, _flap, c, a) => {
    // 蛛网陷阱匣：方匣 + 弹出的蛛网陷阱（旋转的网） + 弹药格
    g.fillStyle(c, 1);
    g.fillRoundedRect(-14, -20, 28, 18, 4);
    g.fillStyle(0x1a2436, 1);
    g.fillRoundedRect(-11, -17, 22, 5, 2);
    for (let k = 0; k < 4; k++) { // 匣口弹孔
      g.fillStyle(0x3a4a6a, 1);
      g.fillCircle(-9 + k * 6, -9, 1.8);
    }
    for (const s of [-1, 1]) { // 侧面茧状罐
      g.fillStyle(0xd8e0e8, 0.85);
      g.fillRoundedRect(s * 15 - 3, -16, 6, 12, 3);
      g.fillStyle(0x8a94a2, 0.6);
      g.fillRect(s * 15 - 3, -13, 6, 1.4);
    }
    // 弹出的蛛网陷阱（上抛缓转的网）
    const spin = now / 900;
    const ty = -30 + Math.sin(now / 700) * 3;
    g.save(); g.translateCanvas(0, ty); g.scaleCanvas(1, 0.5); g.rotateCanvas(spin);
    g.lineStyle(1.2, 0xf0f4f8, 0.7);
    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * TAU;
      g.lineBetween(0, 0, Math.cos(ang) * 12, Math.sin(ang) * 12);
    }
    for (let k = 1; k <= 3; k++) {
      g.beginPath(); g.arc(0, 0, k * 4, 0, TAU); g.strokePath();
    }
    g.restore();
    g.fillStyle(a, 0.8); // 匣顶指示灯
    g.fillCircle(0, -21, 1.8 + Math.abs(Math.sin(now / 300)));
  } },
  // ── 钢铁巨兽 ──
  bstBackA: { c: 0x4a4a52, a: 0xff6a2a, single: true, draw: (g, now, _flap, c, a) => {
    // 熔炉心脏：铁笼 + 熔融核心 + 排气口火星 + 热浪
    const pulse = 0.7 + 0.3 * Math.sin(now / 380);
    for (let k = 3; k >= 0; k--) { // 外热光
      g.fillStyle(a, 0.14 * pulse * (1 - k * 0.22));
      g.fillCircle(0, -22, 10 + k * 5);
    }
    // 铁笼框
    g.fillStyle(c, 1);
    g.fillRoundedRect(-16, -30, 32, 24, 5);
    g.fillStyle(0x2a2a30, 1);
    g.fillRoundedRect(-12, -26, 24, 16, 4);
    for (let k = 0; k < 5; k++) { // 笼条
      g.fillStyle(c, 1);
      g.fillRect(-12 + k * 6, -26, 2.4, 16);
    }
    // 熔融核心
    g.fillStyle(0xffd45c, 0.9 * pulse);
    g.fillCircle(0, -18, 6);
    g.fillStyle(0xffffff, 0.8 * pulse);
    g.fillCircle(0, -18, 2.4);
    // 排气口 + 上升火星
    for (const s of [-1, 1]) {
      g.fillStyle(0x8a8a92, 1);
      g.fillRoundedRect(s * 11 - 3, -34, 6, 5, 2);
    }
    for (let k = 0; k < 6; k++) {
      const ph = ((now / 700 + k / 6) % 1);
      g.fillStyle(a, 0.85 * (1 - ph));
      g.fillCircle(Math.sin(k * 2.2) * 12 + (k % 2 ? 3 : -3), -30 - ph * 22, 1.6 * (1 - ph) + 0.4);
    }
    g.fillStyle(0x3a3a42, 1); // 底部挂钩
    g.fillRoundedRect(-10, -6, 20, 5, 2);
    g.fillStyle(0x9a9490, 0.9);
    for (let k = -1; k <= 1; k++) g.fillCircle(k * 7, -3.5, 1);
  } },
  bstBackB: { c: 0x4a4a52, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 兽牙导弹舱：舱体前缘兽牙咬合，六管发射口，周期齐射闪光
    const fire = (now / 1300) % 1;
    g.fillStyle(c, 1); // 舱体
    g.fillRoundedRect(-19, -26, 38, 22, 5);
    g.fillStyle(0x2f2f36, 1);
    g.fillRoundedRect(-16, -23, 32, 9, 4);
    for (let k = 0; k < 6; k++) { // 六管口
      const on = fire < 0.1 && k % 2 === 0;
      g.fillStyle(0x14141a, 1);
      g.fillCircle(-13 + k * 5.2, -18, 2.2);
      if (on) {
        g.fillStyle(a, 0.9);
        g.fillCircle(-13 + k * 5.2, -18, 1.4);
      }
    }
    for (let k = 0; k < 4; k++) { // 前缘兽牙
      g.fillStyle(0xd8d4c8, 0.95);
      g.fillTriangle(-16 + k * 10, -5, -8 + k * 10, -5, -12 + k * 10, 3);
    }
    g.fillStyle(0x8a8a92, 1); // 侧挂铆钉排
    for (const s of [-1, 1]) {
      for (let k = 0; k < 3; k++) g.fillCircle(s * 17, -22 + k * 7, 0.9);
    }
    // 齐射时舱口热浪
    if (fire < 0.2) {
      for (let k = 0; k < 4; k++) {
        g.fillStyle(0xd8d8d0, 0.25 * (1 - fire * 5));
        g.fillCircle(-14 + k * 9, -30 - fire * 20, 3 + fire * 10);
      }
    }
    g.lineStyle(1.4, 0x6a6a72, 0.8); // 舱盖缝
    g.lineBetween(-19, -14, 19, -14);
  } },
  bstBackC: { c: 0x4a4a52, a: 0xff6a2a, single: true, draw: (g, now, _flap, c, a) => {
    // 液压尾骨：五节骨节链甩动，节间液压杆伸缩，末端熔锤
    let px = 0, py = -6;
    for (let k = 0; k < 5; k++) {
      const u = k / 4;
      const nx = px + Math.sin(now / 480 + k * 0.55) * (7 + u * 7);
      const ny = py - 9;
      // 液压杆
      g.lineStyle(2.6, 0x8a8a92, 1);
      g.lineBetween(px, py, nx, ny);
      // 骨节
      g.fillStyle(k % 2 ? c : 0x5c5c64, 1);
      g.fillRoundedRect(nx - 5, ny - 4, 10, 8, 3);
      g.fillStyle(0x9a9490, 0.8); // 节上铆钉
      g.fillCircle(nx - 2.4, ny, 1);
      g.fillCircle(nx + 2.4, ny, 1);
      px = nx; py = ny;
    }
    // 末端熔锤
    g.fillStyle(0x3a3a42, 1);
    g.fillPoints([{ x: px - 8, y: py - 5 }, { x: px + 8, y: py - 5 }, { x: px + 6, y: py - 13 }, { x: px - 6, y: py - 13 }] as never, true);
    const heat = 0.6 + 0.4 * Math.sin(now / 260);
    g.fillStyle(a, heat);
    g.fillRoundedRect(px - 5, py - 12, 10, 4, 2);
    // 滴落的熔渣
    for (let k = 0; k < 3; k++) {
      const ph = ((now / 900 + k / 3) % 1);
      g.fillStyle(a, 0.8 * (1 - ph));
      g.fillCircle(px - 3 + k * 3, py - 6 + ph * 20, 1.6 * (1 - ph) + 0.4);
    }
  } },
  bstBackD: { c: 0x4a4a52, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 装甲翼匣：双匣开合，内藏折叠刀刃，匣口蓝白冷光
    const open = (Math.sin(now / 900) * 0.5 + 0.5) * 9;
    g.fillStyle(c, 1); // 背板
    g.fillRoundedRect(-22, -22, 44, 18, 5);
    for (let k = 0; k < 4; k++) { // 背板铆钉
      g.fillStyle(0x9a9490, 0.9);
      g.fillCircle(-15 + k * 10, -20.6, 0.9);
    }
    for (const s of [-1, 1]) { // 双匣盖
      g.save();
      g.translateCanvas(s * 9, -26);
      g.rotateCanvas(-s * open * 0.09);
      g.fillStyle(0x5c5c64, 1);
      g.fillRoundedRect(-9, -6, 18, 9, 3);
      g.fillStyle(0x3a3a42, 0.9);
      g.fillRect(-9, -2, 18, 1.6);
      // 折叠刀刃（匣内，随开合外露）
      g.fillStyle(0xd8d4c8, 0.95);
      g.fillPoints([{ x: -6, y: -2 }, { x: 6, y: -2 }, { x: 3, y: 4 + open * 0.5 }, { x: -3, y: 4 + open * 0.5 }] as never, true);
      g.fillStyle(a, 0.5);
      g.fillRect(-5, -1, 10, 1.2);
      g.restore();
    }
    // 匣口冷光
    g.fillStyle(a, 0.3 + 0.2 * Math.sin(now / 350));
    g.fillEllipse(0, -18, 34, 5);
    for (let k = 0; k < 3; k++) { // 冷光微粒
      const ph = ((now / 800 + k / 3) % 1);
      g.fillStyle(0xffffff, 0.5 * (1 - ph));
      g.fillCircle(-8 + k * 8, -20 - ph * 10, 1.2);
    }
  } },
};
