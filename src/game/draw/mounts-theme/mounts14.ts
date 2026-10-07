import { mpoly, type MountArt } from './shared';

/** 批十二坐骑（变形机甲 / 蛛网游侠 / 钢铁巨兽）——(x, y) = 地面基准，f = 朝向 */

export const MOUNTS_14: Record<string, MountArt> = {
  tfMount: { c: 0x2a3a4a, a: 0x5ac8ff, draw: (g, now, x, y, f, c, a) => {
    // 变形载具：半变形状态的重装战车——四轮 + 半展开的翼板 + 驾驶舱 + 排气
    const bob = Math.sin(now / 420) * 1.6;
    const by = y - 20 + bob;
    // 底盘
    g.fillStyle(0x1a2430, 1);
    mpoly(g, [[x - 44 * f, by + 8], [x + 44 * f, by + 8], [x + 38 * f, by - 6], [x - 38 * f, by - 6]], c, 0.98);
    g.fillStyle(0x32465c, 0.9); // 底盘面板
    mpoly(g, [[x - 38 * f, by + 5], [x + 38 * f, by + 5], [x + 32 * f, by - 3], [x - 32 * f, by - 3]], 0x32465c, 0.9);
    for (let k = 0; k < 5; k++) { // 底盘铆钉排
      g.fillStyle(0x9aa4b2, 0.9);
      g.fillCircle(x + (-32 + k * 16) * f, by + 3, 1);
    }
    // 四轮（滚动 + 胎纹）
    for (const [wx, ph] of [[-30, 0], [-8, 1], [12, 0], [34, 1]] as Array<[number, number]>) {
      const roll = now / 220 + ph;
      g.fillStyle(0x141c26, 1);
      g.fillCircle(x + wx * f, y - 7, 9);
      g.fillStyle(0x2a3a4a, 1);
      g.fillCircle(x + wx * f, y - 7, 6.4);
      g.lineStyle(2, 0x0e141c, 0.9);
      for (let k = 0; k < 4; k++) {
        const ang = roll + (k / 4) * Math.PI * 2;
        g.lineBetween(x + wx * f + Math.cos(ang) * 2, y - 7 + Math.sin(ang) * 2, x + wx * f + Math.cos(ang) * 6, y - 7 + Math.sin(ang) * 6);
      }
      g.fillStyle(a, 0.8); // 轮毂光
      g.fillCircle(x + wx * f, y - 7, 1.6);
    }
    // 半展开翼板（缓慢张合）
    const spread = (Math.sin(now / 900) * 0.5 + 0.5) * 0.5;
    for (const s of [-1, 1]) {
      g.save();
      g.translateCanvas(x + s * 20 * f, by - 6);
      g.rotateCanvas(-s * spread * f);
      g.fillStyle(c, 0.95);
      mpoly(g, [[0, -3], [s * 26 * f, -12], [s * 30 * f, -4], [s * 6 * f, 2]], 0x32465c, 0.95);
      g.fillStyle(a, 0.35); // 翼面能量线
      g.fillRect(Math.min(6 * f, 24 * f), -8, 14, 1.6);
      g.restore();
    }
    // 驾驶舱（前部，带扫描灯）
    g.fillStyle(0x2f4152, 1);
    mpoly(g, [[x + 20 * f, by - 6], [x + 40 * f, by - 6], [x + 36 * f, by - 18], [x + 24 * f, by - 18]], 0x2f4152, 1);
    g.fillStyle(a, 0.55 + 0.2 * Math.sin(now / 300)); // 舱窗
    g.fillRect(x + 24 * f - 5, by - 16, 12, 8);
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(x + 24 * f - 4, by - 15.4, 4, 2);
    // 后部排气
    for (let k = 0; k < 3; k++) {
      const ph = ((now / 600 + k / 3) % 1);
      g.fillStyle(0xd8e8f0, 0.2 * (1 - ph));
      g.fillCircle(x - 42 * f, by - 2 - ph * 12, 3 + ph * 4);
    }
    g.fillStyle(0x000000, 0.14);
    g.fillEllipse(x, y + 2, 62, 9);
  } },

  spdMount: { c: 0xc8323c, a: 0x8ae0ff, draw: (g, now, x, y, f, _c, a) => {
    // 蛛网弹弓车：双大轮 + 弹弓式蛛丝发射架 + 装填的蛛网弹丸
    const by = y - 16;
    // 车架
    g.fillStyle(0x2a3a5a, 1);
    mpoly(g, [[x - 26 * f, by + 4], [x + 26 * f, by + 4], [x + 20 * f, by - 6], [x - 20 * f, by - 6]], 0x2a3a5a, 1);
    g.fillStyle(0x3a4a6a, 0.9);
    mpoly(g, [[x - 22 * f, by + 2], [x + 22 * f, by + 2], [x + 16 * f, by - 4], [x - 16 * f, by - 4]], 0x3a4a6a, 0.9);
    // 双大轮（辐条转动）
    const roll = now / 300;
    for (const wx of [-18, 18]) {
      g.fillStyle(0x1a2436, 1);
      g.fillCircle(x + wx * f, y - 9, 12);
      g.fillStyle(0x2a3a5a, 1);
      g.fillCircle(x + wx * f, y - 9, 8.4);
      g.lineStyle(1.6, 0x141c26, 0.9);
      for (let k = 0; k < 5; k++) {
        const ang = roll + (k / 5) * Math.PI * 2;
        g.lineBetween(x + wx * f, y - 9, x + wx * f + Math.cos(ang) * 8, y - 9 + Math.sin(ang) * 8);
      }
      g.fillStyle(a, 0.85); // 轮心蛛标
      g.fillCircle(x + wx * f, y - 9, 2.4);
      g.fillStyle(0x2a3a5a, 1);
      g.fillCircle(x + wx * f, y - 9, 1);
    }
    // 弹弓架（Y 形）
    g.lineStyle(3.4, 0x2a3a5a, 1);
    const pull = Math.sin(now / 700) * 2;
    g.beginPath();
    g.moveTo(x - 4 * f, by - 4);
    g.lineTo(x + 6 * f, by - 22);
    g.lineTo(x + 16 * f, by - 26);
    g.strokePath();
    g.beginPath();
    g.moveTo(x - 4 * f, by - 4);
    g.lineTo(x - 12 * f, by - 24);
    g.lineTo(x - 20 * f, by - 26);
    g.strokePath();
    // 蛛丝皮筋（拉紧）
    g.lineStyle(1.6, 0xf0f4f8, 0.8);
    g.beginPath();
    g.moveTo(x + 16 * f, by - 26);
    g.lineTo(x - 2 * f + pull, by - 16);
    g.lineTo(x - 20 * f, by - 26);
    g.strokePath();
    // 装填的蛛网弹丸（纯白团，会呼吸）
    const rr = 4.4 + Math.sin(now / 400) * 0.5;
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(x - 2 * f + pull, by - 16, rr);
    g.lineStyle(1, 0x8ae0ff, 0.7);
    g.save(); g.translateCanvas(x - 2 * f + pull, by - 16); g.scaleCanvas(1, 0.4);
    g.beginPath(); g.arc(0, 0, rr + 2, 0, Math.PI * 2); g.strokePath(); g.restore();
    // 车尾飘出的蛛丝
    g.lineStyle(1.2, 0xf0f4f8, 0.45);
    g.beginPath();
    g.moveTo(x - 24 * f, by - 2);
    g.lineTo(x - (34 + Math.sin(now / 400) * 3) * f, by - 8);
    g.strokePath();
    g.fillStyle(0x000000, 0.13);
    g.fillEllipse(x, y + 2, 56, 8);
  } },

  bstMount: { c: 0x3a3a42, a: 0xff6a2a, draw: (g, now, x, y, f, c, _a) => {
    // 装甲兽驹：四足钢甲巨兽，胸甲熔炉发光，背排气筒喷蒸汽，蹄铁沉重踏地
    const by = y - 26;
    const gallop = Math.abs(Math.sin(now / 260)) * 2;
    // 四腿（活塞式 + 蹄铁）
    for (const [lx, ph] of [[-20, 0], [-10, Math.PI], [14, Math.PI], [24, 0]] as Array<[number, number]>) {
      const step = Math.sin(now / 240 + ph) * 3;
      g.fillStyle(0x2a2a30, 1);
      g.fillRoundedRect(x + lx * f - 4.4 + step * 0.4, by + 8, 8.8, y - by - 12, 3);
      g.fillStyle(0x4a4a52, 1); // 液压杆
      g.fillRect(x + lx * f - 1.4 + step * 0.4, by + 10, 2.8, 10);
      g.fillStyle(0x232329, 1); // 蹄铁
      g.fillRoundedRect(x + lx * f - 5.4 + step, y - 5, 10.8, 5, 2);
      g.fillStyle(0x9a9490, 0.7);
      g.fillRect(x + lx * f - 4 + step, y - 4, 8, 1.2);
    }
    // 躯干（厚重装甲块面 + 铆钉）
    g.fillStyle(0x232329, 1);
    mpoly(g, [[x - 28 * f, by + 10], [x + 28 * f, by + 10], [x + 22 * f, by - 12 - gallop * 0.3], [x - 24 * f, by - 12 - gallop * 0.3]], 0x232329, 1);
    g.fillStyle(c, 1);
    mpoly(g, [[x - 24 * f, by + 7], [x + 24 * f, by + 7], [x + 18 * f, by - 9 - gallop * 0.3], [x - 20 * f, by - 9 - gallop * 0.3]], 0x3a3a42, 1);
    g.fillStyle(0x50505a, 0.75); // 背甲高光
    mpoly(g, [[x - 16 * f, by - 4], [x + 14 * f, by - 5], [x + 10 * f, by - 9], [x - 12 * f, by - 8]], 0x50505a, 0.75);
    for (let k = 0; k < 6; k++) { // 铆钉排
      g.fillStyle(0x9a9490, 0.9);
      g.fillCircle(x + (-18 + k * 7) * f, by + 4, 0.9);
    }
    // 胸甲熔炉（脉动 + 光溢出）
    const heat = 0.6 + 0.4 * Math.sin(now / 340);
    for (let k = 2; k >= 0; k--) {
      g.fillStyle(0xff6a2a, 0.16 * heat * (1 - k * 0.25));
      g.fillCircle(x + 20 * f, by - 2, 6 + k * 4);
    }
    g.fillStyle(0x1a1a20, 1);
    g.fillRoundedRect(x + 20 * f - 5, by - 6, 10, 9, 3);
    g.fillStyle(0xffd45c, heat);
    g.fillRoundedRect(x + 20 * f - 3.4, by - 4.4, 6.8, 5.6, 2);
    // 头（兽首：钢角 + 熔光眼 + 铁颚）
    const hx2 = x + 30 * f, hy2 = by - 14 - gallop * 0.3;
    g.fillStyle(0x2a2a30, 1);
    mpoly(g, [[hx2 - 8 * f, hy2 + 6], [hx2 + 9 * f, hy2 + 6], [hx2 + 11 * f, hy2 - 4], [hx2 - 7 * f, hy2 - 4]], 0x2a2a30, 1);
    g.fillStyle(0x4a4a52, 1);
    mpoly(g, [[hx2 - 6 * f, hy2 + 4], [hx2 + 8 * f, hy2 + 4], [hx2 + 9 * f, hy2 - 3], [hx2 - 5 * f, hy2 - 3]], 0x4a4a52, 1);
    g.fillStyle(0x9a9490, 1); // 钢角
    mpoly(g, [[hx2 + 4 * f, hy2 - 3], [hx2 + 12 * f, hy2 - 12], [hx2 + 13 * f, hy2 - 7], [hx2 + 6 * f, hy2 - 1]], 0x9a9490, 1);
    const gl = 0.65 + 0.35 * Math.sin(now / 260);
    g.fillStyle(0xff6a2a, gl); // 熔光眼
    g.fillCircle(hx2 + 5 * f, hy2, 2);
    g.fillStyle(0xfff0b0, gl);
    g.fillCircle(hx2 + 5 * f, hy2, 0.9);
    g.fillStyle(0x1a1a20, 1); // 铁颚
    g.fillRoundedRect(hx2 - 2 * f, hy2 + 5, 12, 4, 2);
    for (let k = 0; k < 3; k++) { // 颚齿
      g.fillStyle(0xd8d4c8, 0.95);
      g.fillTriangle(hx2 + (1 + k * 3.4) * f, hy2 + 5, hx2 + (3 + k * 3.4) * f, hy2 + 5, hx2 + (2 + k * 3.4) * f, hy2 + 8.4);
    }
    // 背排气筒 + 蒸汽
    for (let k = 0; k < 2; k++) {
      g.fillStyle(0x8a8a92, 1);
      g.fillRoundedRect(x + (-10 + k * 10) * f - 2.4, by - 22, 4.8, 12, 2);
      const ph = ((now / 900 + k / 2) % 1);
      g.fillStyle(0xd8d8d0, 0.24 * (1 - ph));
      g.fillCircle(x + (-10 + k * 10) * f, by - 22 - ph * 12, 3 + ph * 5);
    }
    // 尾部液压尾
    const tw = Math.sin(now / 420);
    g.lineStyle(3.6, 0x2a2a30, 1);
    g.beginPath();
    g.moveTo(x - 26 * f, by - 6);
    g.lineTo(x - 36 * f, by - 16 + tw * 3);
    g.lineTo(x - 42 * f, by - 10 + tw * 6);
    g.strokePath();
    g.fillStyle(0xff6a2a, 0.85);
    g.fillCircle(x - 42 * f, by - 10 + tw * 6, 2.6);
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(x, y + 2, 64, 10);
  } },
};
