import { apoly, TAU, type AuraArt } from './shared';

/** 批六主题光环（法老秘葬 / 暗部忍道）。(0,0) = 角色躯干中心，画在身后。 */
export const AURAS_11: Record<string, AuraArt> = {
  egAuraA: { c: 0xd9a84a, a: 0x3a5a8a, draw: (g, now, c, a) => {
    // 法老诅咒：环身翻卷的墓道沙暴——沙浪 + 幽蓝法眼 + 坠落圣甲虫 + 警示符文
    for (let k = 0; k < 4; k++) { // 环形沙浪（错相横卷）
      const ph = (now / 1500 + k / 4) % 1;
      const wx = -100 + ph * 200;
      g.fillStyle(k % 2 ? c : 0xc08838, 0.2 * Math.sin(ph * Math.PI));
      g.fillEllipse(wx, -60 + (k % 2) * 60 + Math.sin(ph * 4 + k) * 8, 66, 40);
    }
    for (let k = 0; k < 6; k++) { // 飞沙
      const ph = (now / 350 + k / 6) % 1;
      g.fillStyle(0xe8c88a, 0.6 * (1 - ph));
      g.fillCircle(-100 + ph * 200, -110 + (k * 37) % 210 + Math.sin(ph * 7 + k) * 6, 1.5);
    }
    for (let k = 0; k < 2; k++) { // 沙幕中的幽蓝法眼（明灭窥视）
      const gl = Math.max(0, Math.sin(now / 900 + k * 2.4));
      const ex = k ? 52 : -52, ey = -90 + k * 30;
      g.fillStyle(a, gl * 0.7);
      g.fillEllipse(ex, ey, 10, 5);
      g.fillStyle(0xdff2ff, gl);
      g.fillCircle(ex + Math.sin(now / 300) * 2, ey, 1.4);
    }
    const strike = (now / 2000) % 1; // 坠落的圣甲虫（周期掉落 + 金光）
    if (strike < 0.35) {
      const ph = strike / 0.35;
      g.fillStyle(0x3a5a8a, 0.9);
      g.fillEllipse(Math.sin(now / 200) * 30 - 20, -140 + ph * 210, 7, 5);
      g.fillStyle(0x5ac8ff, (1 - ph) * 0.7);
      g.fillCircle(Math.sin(now / 200) * 30 - 20, -140 + ph * 210, 5 * (1 - ph) + 1);
    }
    for (let k = 0; k < 4; k++) { // 环身警示符文（圣书体明灭）
      const ang = (k / 4) * TAU + now / 2800;
      const px = Math.cos(ang) * 58, py = -14 + Math.sin(ang) * 78;
      const gl = 0.35 + 0.45 * Math.abs(Math.sin(now / 380 + k));
      g.fillStyle(0xffd45c, gl);
      if (k % 2) { g.fillRect(px - 1.4, py - 3, 2.8, 6); g.fillRect(px - 3, py - 1, 6, 2); }
      else { g.fillCircle(px, py, 2); g.fillRect(px - 3, py - 0.6, 6, 1.2); }
    }
  } },
  egAuraB: { c: 0xffd45c, a: 0xff9a3c, draw: (g, now, c, a) => {
    // 太阳神船：头顶横渡的太阳神船——金船剪影 + 巨日圆盘 + 圣甲虫护航 + 圣河波光
    const cross = (now / 6000) % 1; // 神船横渡周期
    const bx = -110 + cross * 220, by = -108 + Math.sin(cross * 6) * 4;
    // 巨日圆盘（船头前方的太阳）
    g.fillStyle(c, 0.25);
    g.fillCircle(bx + 34, by, 18);
    g.fillStyle(c, 0.85);
    g.fillCircle(bx + 34, by, 12);
    g.fillStyle(0xfff6d8, 0.9);
    g.fillCircle(bx + 34, by, 6);
    for (let k = 0; k < 8; k++) { // 日盘光芒
      const ang = (k / 8) * TAU + now / 1200;
      g.lineStyle(1.6, a, 0.7);
      g.lineBetween(bx + 34 + Math.cos(ang) * 13, by + Math.sin(ang) * 13, bx + 34 + Math.cos(ang) * 18, by + Math.sin(ang) * 18);
    }
    // 神船（弯月船身 + 船头圣蛇饰 + 船上一排桨手剪影）
    g.fillStyle(0x8a5a20, 0.9);
    apoly(g, [
      [bx - 36, by + 6], [bx - 24, by + 12], [bx + 22, by + 12], [bx + 34, by + 4], [bx + 24, by + 10], [bx - 24, by + 10],
    ], 0x8a5a20, 0.92);
    g.fillStyle(c, 0.9);
    g.fillTriangle(bx + 30, by + 4, bx + 40, by - 2, bx + 33, by + 8);
    g.fillStyle(0x5a3a10, 0.9);
    for (let k = 0; k < 5; k++) g.fillCircle(bx - 18 + k * 9, by + 7, 2.2);
    for (let k = 0; k < 2; k++) { // 圣甲虫护航（绕船小点）
      const ang = now / 900 + k * Math.PI;
      g.fillStyle(0x3a5a8a, 0.9);
      g.fillEllipse(bx + Math.cos(ang) * 30, by + Math.sin(ang) * 12, 4.4, 3);
    }
    // 圣河波光（环身下部的金色水波纹）
    for (let k = 0; k < 3; k++) {
      const ph = (now / 1400 + k / 3) % 1;
      g.lineStyle(1.6, c, 0.4 * Math.sin(ph * Math.PI));
      g.beginPath();
      for (let s = 0; s <= 8; s++) {
        const px = -80 + s * 20, py = 78 - k * 7 - Math.sin(s * 1.4 + ph * 5) * 3;
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokePath();
    }
    g.fillStyle(c, 0.05); // 环身圣光底
    g.fillCircle(0, -20, 86);
  } },
  njaAuraA: { c: 0xc0c8d0, a: 0xb08ad0, draw: (g, now, c, a) => {
    // 烟隐之术：环身炸开的忍术烟雾——烟团扩散 + 紫电信号 + 隐现的手印
    for (let k = 0; k < 5; k++) { // 烟团（周期扩散消散）
      const ph = (now / 1800 + k / 5) % 1;
      const ang = (k / 5) * TAU + now / 2500;
      const px = Math.cos(ang) * (14 + ph * 54), py = -14 + Math.sin(ang) * (12 + ph * 66);
      g.fillStyle(k % 2 ? c : 0x9aa4b0, 0.35 * Math.sin(ph * Math.PI));
      g.fillCircle(px, py, 8 + ph * 14);
      g.fillStyle(0xffffff, 0.15 * Math.sin(ph * Math.PI));
      g.fillCircle(px - 3, py - 3, 4 + ph * 6);
    }
    for (let k = 0; k < 4; k++) { // 紫电信号（烟雾中噼啪的紫闪）
      const a0 = now / 120 + k * 1.6;
      const cx = Math.cos(a0) * 40, cy = -14 + Math.sin(a0) * 52;
      g.lineStyle(1.4, a, 0.75);
      g.lineBetween(cx, cy, cx + Math.sin(now / 45 + k) * 12, cy + Math.cos(now / 50 + k) * 10);
      g.fillStyle(a, 0.5);
      g.fillCircle(cx, cy, 2);
    }
    for (let k = 0; k < 2; k++) { // 烟中隐现的结印手（半透明浮现又没入）
      const gl = Math.max(0, Math.sin(now / 1000 + k * 2.6));
      const hx = k ? 34 : -34, hy = 20 + k * 18;
      g.fillStyle(0xe8c090, gl * 0.5);
      g.fillRoundedRect(hx - 4, hy - 4, 8, 9, 2);
      g.fillStyle(0x2a2a34, gl * 0.5); // 指缝
      g.fillRect(hx - 3, hy - 4, 1, 9);
      g.fillRect(hx + 2, hy - 4, 1, 9);
    }
    g.fillStyle(c, 0.05); // 烟底
    g.fillCircle(0, -14, 76);
  } },
  njaAuraB: { c: 0xe8404a, a: 0xff5a5c, draw: (g, now, c, a) => {
    // 幻术红瞳：头顶悬浮的巨大幻术之瞳——三层血轮眼 + 勾玉旋转 + 幻术涟漪
    const cy = -96;
    g.fillStyle(0x0c0c12, 0.6); // 瞳底
    g.fillCircle(0, cy, 30);
    g.fillStyle(c, 0.85); // 外环
    g.fillCircle(0, cy, 26);
    g.fillStyle(0x0c0c12, 0.9);
    g.fillCircle(0, cy, 21);
    g.fillStyle(c, 0.9); // 内环
    g.fillCircle(0, cy, 17);
    g.fillStyle(0x0c0c12, 0.95);
    g.fillCircle(0, cy, 12);
    const rot = now / 700;
    for (let k = 0; k < 3; k++) { // 三勾玉（旋转的泪滴勾）
      const ang = rot + (k / 3) * TAU;
      g.save();
      g.translateCanvas(Math.cos(ang) * 8, cy + Math.sin(ang) * 8);
      g.rotateCanvas(ang + Math.PI / 2);
      g.fillStyle(c, 0.95);
      apoly(g, [[0, -6], [3.4, 0], [0, 4], [-3.4, 0]], c, 0.95);
      g.fillStyle(a, 0.9);
      g.fillCircle(0, -3.4, 1.6);
      g.restore();
    }
    g.fillStyle(0xff5a5c, 0.4 + 0.2 * Math.sin(now / 260)); // 瞳心红光
    g.fillCircle(0, cy, 4);
    for (let k = 0; k < 2; k++) { // 幻术涟漪（周期外扩的红色圆环）
      const ph = (now / 1300 + k / 2) % 1;
      g.lineStyle(2.2 * (1 - ph) + 0.5, c, (0.55 * (1 - ph)));
      g.strokeCircle(0, cy, 30 + ph * 50);
    }
    for (let k = 0; k < 5; k++) { // 环身幻术粒子（上升的血点）
      const ph = (now / 1000 + k / 5) % 1;
      g.fillStyle(a, 0.6 * (1 - ph));
      g.fillCircle(Math.sin(k * 2.6) * 44, 70 - ph * 150, 1.6 * (1 - ph) + 0.4);
    }
    g.fillStyle(c, 0.05 + 0.03 * Math.sin(now / 300)); // 环身幻术底光
    g.fillCircle(0, -14, 80);
  } },
};
