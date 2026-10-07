import { TAU, type AuraArt } from './shared';

/** 批十一主题光环（软泥秘境 / 妖猫夜行 / 甲虫王朝）——成景构图，画在角色身后 */

export const AURAS_16: Record<string, AuraArt> = {
  // ── 软泥秘境 ──
  slimeAuraA: { c: 0x9aff7a, a: 0xd0ff9a, draw: (g, now, c, a) => {
    // 软泥雨：天降的绿色黏液滴 + 地面溅起的泥花
    for (let k = 0; k < 7; k++) { // 下落黏滴
      const ph = (now / 900 + k * 0.14) % 1;
      const dx = -70 + k * 21;
      const dy = -90 + ph * 130;
      g.fillStyle(c, 0.55 * (0.4 + ph * 0.6));
      g.fillEllipse(dx, dy, 3.4, 7);
      g.fillStyle(0xffffff, 0.3 * ph);
      g.fillEllipse(dx - 0.8, dy - 1.6, 1.4, 3);
    }
    for (let k = 0; k < 5; k++) { // 地面泥花（溅起的小冠）
      const ph = (now / 900 + k * 0.2 + 0.5) % 1;
      const sx = -60 + k * 30, sy = 42;
      const h = (1 - ph) * 8;
      g.fillStyle(a, 0.5 * (1 - ph));
      g.fillEllipse(sx, sy - h, 5, 3);
      g.fillStyle(c, 0.4 * (1 - ph));
      g.fillEllipse(sx - 5, sy - h * 0.4, 4, 2);
      g.fillEllipse(sx + 5, sy - h * 0.4, 4, 2);
    }
    g.fillStyle(c, 0.25); // 底部黏液洼
    g.fillEllipse(0, 44, 150, 16);
  } },
  slimeAuraB: { c: 0xd0ff9a, a: 0x7de87d, draw: (g, now, c, a) => {
    // 凝胶领域：半透明果冻穹顶罩住全场，顶上有一颗大气泡
    const breathe = 1 + Math.sin(now / 500) * 0.03;
    g.fillStyle(c, 0.14); // 穹顶
    g.beginPath();
    g.arc(0, 20, 92 * breathe, Math.PI, TAU);
    g.closePath(); g.fillPath();
    g.lineStyle(2, a, 0.5); // 穹顶描边 + 流动高光
    g.beginPath();
    g.arc(0, 20, 92 * breathe, Math.PI, TAU);
    g.strokePath();
    const ha = (now / 1600) % 1; // 高光弧沿穹顶游走
    g.lineStyle(3.4, 0xffffff, 0.5);
    g.beginPath();
    g.arc(0, 20, 92 * breathe, Math.PI + ha * Math.PI, Math.PI + ha * Math.PI + 0.4);
    g.strokePath();
    for (let k = 0; k < 5; k++) { // 穹内悬浮泡
      const ph = now / 700 + k * 1.9;
      const bx = Math.sin(ph) * 55, by = 10 - Math.abs(Math.cos(ph)) * 40 - k * 4;
      g.fillStyle(0xffffff, 0.3);
      g.fillCircle(bx, by, 3 + k % 3);
    }
    g.fillStyle(a, 0.6); // 顶冠大气泡
    const cy = -84 + Math.sin(now / 400) * 3;
    g.fillCircle(0, cy, 9);
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(-2.6, cy - 2.6, 2.6);
    g.fillStyle(c, 0.3); // 地面凝影
    g.fillEllipse(0, 44, 120, 12);
  } },
  // ── 妖猫夜行 ──
  nekAuraA: { c: 0xb08aff, a: 0xffd45c, draw: (g, now, c, a) => {
    // 妖火环绕：五团青紫妖火绕身盘旋，拖出细焰尾
    for (let k = 0; k < 5; k++) {
      const ph = now / 700 + (k / 5) * TAU;
      const fx = Math.cos(ph) * 62;
      const fy = -26 + Math.sin(ph * 2) * 30 - k * 3;
      const depth = 0.45 + 0.35 * (Math.sin(ph) * 0.5 + 0.5);
      g.lineStyle(2.4, c, depth * 0.5); // 焰尾
      g.beginPath();
      g.moveTo(fx + Math.cos(ph) * 14, fy + 4);
      g.lineTo(fx, fy);
      g.strokePath();
      g.fillStyle(c, depth); // 焰体
      g.fillCircle(fx, fy, 5.4);
      g.fillStyle(0xd0b0ff, depth); // 焰心
      g.fillCircle(fx, fy, 2.6);
      g.fillStyle(a, depth * 0.9); // 焰瞳
      g.fillCircle(fx, fy - 0.6, 1);
    }
    g.fillStyle(c, 0.16); // 地面妖火圈影
    g.fillEllipse(0, 44, 130, 14);
    g.lineStyle(1.4, a, 0.3);
    g.save(); g.translateCanvas(0, 44); g.scaleCanvas(1, 8 / 66);
    g.beginPath(); g.arc(0, 0, 66, 0, TAU); g.strokePath(); g.restore();
  } },
  nekAuraB: { c: 0xffd45c, a: 0xb08aff, draw: (g, now, c, a) => {
    // 月夜结界：身后悬起巨大的满月 + 结界符环 + 飘落的夜樱
    g.fillStyle(0xfff4d0, 0.85); // 满月
    g.fillCircle(0, -64, 44);
    g.fillStyle(0xe8d8a8, 0.5); // 月面暗斑
    g.fillCircle(-12, -74, 7);
    g.fillCircle(10, -56, 5);
    g.fillCircle(16, -76, 4);
    g.lineStyle(2, a, 0.5); // 结界符环（绕月缓转）
    for (let k = 0; k < 8; k++) {
      const ph = now / 3000 + (k / 8) * TAU;
      const rx = Math.cos(ph) * 58, ry = -64 + Math.sin(ph) * 18;
      g.fillStyle(a, 0.4 + 0.3 * Math.sin(ph));
      g.fillRect(rx - 1.4, ry - 1.4, 2.8, 2.8);
    }
    g.lineStyle(1.4, a, 0.35); // 符环轨道
    g.save(); g.translateCanvas(0, -64); g.scaleCanvas(1, 18 / 58);
    g.beginPath(); g.arc(0, 0, 58, 0, TAU); g.strokePath(); g.restore();
    for (let k = 0; k < 6; k++) { // 月下飘落夜樱瓣
      const ph = (now / 2400 + k * 0.17) % 1;
      const px = -60 + k * 22 + Math.sin(ph * 5 + k) * 8;
      const py = -100 + ph * 150;
      g.fillStyle(0xc8a8ff, 0.5 * (1 - ph * 0.5));
      g.fillEllipse(px, py, 4, 2.4);
    }
    g.fillStyle(c, 0.2); // 月光洒地
    g.fillEllipse(0, 44, 140, 12);
  } },
  // ── 甲虫王朝 ──
  btlAuraA: { c: 0x7dff5a, a: 0xc8a832, draw: (g, now, c, a) => {
    // 信息素轨迹：身周螺旋上升的发光微粒，如虫群信息素
    for (let k = 0; k < 9; k++) {
      const ph = (now / 1300 + k / 9) % 1;
      const ang = ph * TAU * 2 + k;
      const rx = 26 + ph * 46;
      const px = Math.cos(ang) * rx;
      const py = 30 - ph * 120;
      const al = Math.sin(ph * Math.PI);
      g.fillStyle(c, al * 0.7);
      g.fillCircle(px, py, 2.6 - ph * 1.4);
      g.fillStyle(0xffffff, al * 0.4);
      g.fillCircle(px, py - 0.8, 1);
    }
    g.save(); g.translateCanvas(0, 32); g.scaleCanvas(1, 7 / 40);
    g.lineStyle(2, a, 0.5); // 轨迹基环
    g.beginPath(); g.arc(0, 0, 40, 0, TAU); g.strokePath();
    g.lineStyle(1.4, a, 0.3);
    g.beginPath(); g.arc(0, 0, 40, 0, TAU); g.strokePath();
    g.restore();
  } },
  btlAuraB: { c: 0xc8a832, a: 0x7dff5a, draw: (g, now, c, a) => {
    // 甲虫军势：身后浮现双列行军甲虫剪影 + 金色王光
    g.fillStyle(0xffe8a0, 0.35); // 王光背景
    g.fillPoints([
      { x: -90, y: 40 }, { x: -30, y: -95 }, { x: 30, y: -95 }, { x: 90, y: 40 },
    ] as never, true);
    for (let row = 0; row < 2; row++) { // 双列甲虫剪影
      for (let k = 0; k < 4; k++) {
        const march = Math.sin(now / 600 + k * 1.4 + row * 2) * 3;
        const bx = -66 + k * 34 + (row ? 16 : 0);
        const by = -8 - row * 26;
        const sc = 1 - row * 0.2;
        g.fillStyle(0x2a3a14, 0.75); // 虫身
        g.fillEllipse(bx + march * 0.4, by, 16 * sc, 9 * sc);
        g.fillStyle(0x1a2810, 0.85); // 头 + 角
        g.fillCircle(bx + march * 0.4 + 9 * sc, by - 2 * sc, 4.4 * sc);
        g.fillPoints([
          { x: bx + march * 0.4 + 10 * sc, y: by - 4 * sc }, { x: bx + march * 0.4 + 17 * sc, y: by - 9 * sc }, { x: bx + march * 0.4 + 12 * sc, y: by - 3 * sc },
        ] as never, true);
        g.lineStyle(1.4, 0x1a2810, 0.7); // 步足
        for (const s of [-1, 1]) {
          g.lineBetween(bx + march * 0.4 + s * 4, by + 4, bx + march * 0.4 + s * 7 + march, by + 8);
        }
        g.fillStyle(a, 0.35); // 鞘翅金光
        g.fillEllipse(bx + march * 0.4 - 2, by - 2, 7 * sc, 4 * sc);
      }
    }
    g.fillStyle(c, 0.2); // 地面军影
    g.fillEllipse(0, 44, 160, 12);
  } },
};
