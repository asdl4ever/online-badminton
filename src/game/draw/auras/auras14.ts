import { apoly, TAU, type AuraArt } from './shared';

/** 批九主题光环（童话王国 / 深夜食堂 / 猫咖物语）。(0,0) = 角色躯干中心，画在身后。 */
export const AURAS_14: Record<string, AuraArt> = {
  taleAuraA: { c: 0x9b5cff, a: 0xffd45c, draw: (g, now, c, a) => {
    // 魔法星尘：环身飞舞的魔法星尘——螺旋星流 + 四角星阵 + 星云雾 + 闪光点
    for (let k = 0; k < 3; k++) { // 三条螺旋星流（异速旋转）
      const rot = (k % 2 ? -1 : 1) * (now / (900 + k * 250));
      const pts: Array<[number, number]> = [];
      for (let s = 0; s <= 12; s++) {
        const u = s / 12;
        const ang = rot + u * 4 + k * 2.1;
        const r = 10 + u * (50 - k * 8);
        pts.push([Math.cos(ang) * r, -14 + Math.sin(ang) * r * 1.15]);
      }
      g.lineStyle(3.4 - k, k % 2 ? a : c, 0.35);
      g.beginPath();
      pts.forEach(([px, py], s) => (s === 0 ? g.moveTo(px, py) : g.lineTo(px, py)));
      g.strokePath();
      for (let s = 0; s < pts.length; s += 3) { // 流上闪星
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + s + k));
        g.fillStyle(0xffffff, tw);
        g.fillRect(pts[s][0] - 2.4, pts[s][1] - 0.5, 4.8, 1);
        g.fillRect(pts[s][0] - 0.5, pts[s][1] - 2.4, 1, 4.8);
      }
    }
    for (let k = 0; k < 6; k++) { // 四角星阵（环绕的星）
      const ang = (k / 6) * TAU + now / 1600;
      const px = Math.cos(ang) * 62, py = -14 + Math.sin(ang) * 80;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 280 + k));
      g.fillStyle(k % 2 ? a : c, tw);
      apoly(g, [[px, py - 3.4], [px + 2.4, py], [px, py + 3.4], [px - 2.4, py]], k % 2 ? a : c, tw);
    }
    g.fillStyle(c, 0.07); // 环身星云
    g.fillCircle(0, -14, 80);
  } },
  taleAuraB: { c: 0xff9adf, a: 0xffd45c, draw: (g, now, c, a) => {
    // 童话城堡：身后一座童话城堡——尖塔群 + 旗帜 + 悬桥 + 星空
    g.fillStyle(0x54406a, 0.5); // 城堡主体剪影
    apoly(g, [[-58, 66], [-58, -50], [-34, -50], [-34, 66]], 0x54406a, 0.55);
    apoly(g, [[34, 66], [34, -50], [58, -50], [58, 66]], 0x54406a, 0.55);
    apoly(g, [[-24, 66], [-24, -76], [24, -76], [24, 66]], 0x604a78, 0.6);
    for (const [tx, tw2] of [[-58, 24], [34, 24], [-24, 48]] as Array<[number, number]>) { // 尖塔顶（圆锥）
      g.fillStyle(0xff9adf, 0.8);
      apoly(g, [[tx, -50], [tx + tw2 / 2, -96], [tx + tw2, -50]], 0xff9adf, 0.8);
      g.lineStyle(1.2, a, 0.8); // 塔旗
      g.lineBetween(tx + tw2 / 2, -96, tx + tw2 / 2, -110);
      g.fillStyle(c, 0.9);
      const fl = Math.sin(now / 300 + tx) * 2;
      apoly(g, [[tx + tw2 / 2, -110], [tx + tw2 / 2 + 12, -107 + fl], [tx + tw2 / 2, -104]], c, 0.9);
    }
    g.fillStyle(0xfff6d8, 0.6); // 城堡亮窗
    for (let k = 0; k < 5; k++) {
      g.fillRect(-52 + k * 22, -34 + (k % 2) * 22, 5, 9);
    }
    g.fillStyle(0x221830, 0.4); // 悬桥
    apoly(g, [[-12, 66], [12, 66], [8, 78], [-8, 78]], 0x221830, 0.4);
    for (let k = 0; k < 7; k++) { // 星空
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(now / 300 + k * 1.7));
      g.fillStyle(0xffffff, tw);
      g.fillCircle(-80 + (k * 27) % 160, -120 + (k * 31) % 50, 1.3);
    }
  } },
  dinAuraA: { c: 0xff9a3c, a: 0xffd45c, draw: (g, now, c, a) => {
    // 暖炉烟火：环身暖炉的橘暖光——炉火光晕 + 上升火星 + 蒸汽 + 炭火明灭
    g.fillStyle(c, 0.1); // 暖光底
    g.fillCircle(0, 0, 84);
    g.fillStyle(0xffd45c, 0.08);
    g.fillCircle(0, 0, 64);
    for (let k = 0; k < 4; k++) { // 上升火星
      const ph = (now / 900 + k / 4) % 1;
      const gl = 0.5 + 0.5 * Math.abs(Math.sin(now / 200 + k * 1.9));
      g.fillStyle(k % 2 ? a : c, gl * (1 - ph));
      g.fillCircle(Math.sin(k * 2.7) * 44 + Math.sin(ph * 5 + k) * 6, 70 - ph * 150, 1.6 * (1 - ph) + 0.5);
    }
    for (let k = 0; k < 3; k++) { // 蒸汽团（慢升慢散）
      const ph = (now / 1900 + k / 3) % 1;
      g.fillStyle(0xf0ead8, 0.22 * Math.sin(ph * Math.PI));
      g.fillCircle(Math.sin(ph * 5 + k) * 16, 60 - ph * 130, 4 + ph * 10);
    }
    const flick = 0.4 + 0.4 * Math.sin(now / 150); // 炭火明灭
    g.fillStyle(0xff7a3a, flick * 0.3);
    g.fillEllipse(0, 78, 60, 12);
    g.fillStyle(0xffe15c, flick * 0.4);
    g.fillEllipse(0, 78, 34, 7);
    g.lineStyle(1.2, c, 0.2); // 暖光丝带
    g.beginPath();
    for (let s = 0; s <= 10; s++) {
      const u = s / 10;
      const px = Math.cos(u * 3 + now / 500) * 60;
      const py = 40 - u * 130;
      if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.strokePath();
  } },
  dinAuraB: { c: 0xffd45c, a: 0xff7a3a, draw: (g, now, c, _a) => {
    // 深夜开张：身后支起深夜食堂摊——摊棚剪影 + 暖帘 + 灯笼 + 蒸笼塔
    g.fillStyle(0x3a3228, 0.6); // 摊棚
    apoly(g, [[-88, -30], [0, -66], [88, -30], [88, -22], [-88, -22]], 0x3a3228, 0.6);
    g.lineStyle(2.4, 0x6b4a2f, 0.9); // 棚柱
    g.lineBetween(-84, -24, -84, 70);
    g.lineBetween(84, -24, 84, 70);
    // 暖帘（一排短帘）
    for (let k = 0; k < 6; k++) {
      const sway = Math.sin(now / 400 + k) * 1.6;
      g.fillStyle(k % 2 ? c : 0xffe8c8, 0.75);
      g.fillRect(-70 + k * 24, -20, 18, 30 + (k % 2) * 6 + sway);
      g.fillStyle(0xe8404a, 0.8); // 帘上圆纹
      g.fillCircle(-61 + k * 24, -6 + (k % 2) * 4, 3);
    }
    for (let k = 0; k < 2; k++) { // 挂灯笼
      const lx = -40 + k * 80, glow = 0.6 + 0.4 * Math.sin(now / 240 + k);
      g.lineStyle(1, 0x6b4a2f, 0.9);
      g.lineBetween(lx, -20, lx, -12);
      g.fillStyle(0xe8404a, 0.95);
      g.fillEllipse(lx, -4, 9, 12);
      g.fillStyle(0xffb84a, glow);
      g.fillEllipse(lx, -4, 5, 7);
      g.fillStyle(0xffd45c, 0.9);
      g.fillRect(lx - 0.8, 3, 1.6, 5);
    }
    // 蒸笼塔（右侧一摞）
    for (let k = 0; k < 3; k++) {
      g.fillStyle(0xb8943a, 0.9);
      g.fillRoundedRect(52, 40 - k * 12, 26, 11, 2);
      g.fillStyle(0x8a6a2a, 0.8);
      g.fillRect(52, 40 - k * 12 + 4.4, 26, 1.6);
    }
    for (let k = 0; k < 4; k++) { // 蒸笼热气
      const ph = (now / 1100 + k / 4) % 1;
      g.fillStyle(0xf0ead8, 0.3 * Math.sin(ph * Math.PI));
      g.fillCircle(65 + Math.sin(ph * 4 + k) * 4, 38 - k * 10 - ph * 30, 2.4 + ph * 4);
    }
    g.fillStyle(c, 0.06); // 环身暖光
    g.fillCircle(0, -10, 80);
  } },
  catAuraA: { c: 0xffb070, a: 0xffd8a8, draw: (g, now, c, a) => {
    // 毛绒暖阳：环身蓬松的暖阳绒光——太阳绒盘 + 绒毛射线 + 慢泡泡 + 绒球
    g.fillStyle(c, 0.16); // 绒阳心
    g.fillCircle(0, -30, 46);
    g.fillStyle(a, 0.12);
    g.fillCircle(0, -30, 34);
    for (let k = 0; k < 10; k++) { // 绒毛射线（圆头软射线，呼吸伸缩）
      const ang = (k / 10) * TAU + now / 3000;
      const len = 52 + Math.sin(now / 400 + k) * 5;
      g.lineStyle(4, k % 2 ? a : c, 0.4);
      g.lineBetween(Math.cos(ang) * 36, -30 + Math.sin(ang) * 36, Math.cos(ang) * len, -30 + Math.sin(ang) * len);
      g.fillStyle(k % 2 ? a : c, 0.35);
      g.fillCircle(Math.cos(ang) * len, -30 + Math.sin(ang) * len, 2.4);
    }
    g.fillStyle(0xffffff, 0.5); // 阳心高光
    g.fillCircle(-8, -38, 6);
    for (let k = 0; k < 5; k++) { // 慢泡泡（暖阳里的光泡）
      const ph = (now / 1500 + k / 5) % 1;
      g.lineStyle(1, 0xffffff, 0.4 * (1 - ph));
      g.strokeCircle(Math.sin(k * 2.4) * 46 + Math.sin(ph * 4 + k) * 5, 50 - ph * 150, 1.6 + ph * 2.4);
    }
    for (let k = 0; k < 4; k++) { // 绒球（毛茸茸小球漂浮）
      const ph = (now / 1300 + k / 4) % 1;
      const bx = Math.sin(k * 2.6) * 44 + Math.sin(ph * 4 + k) * 6;
      const by = 60 - ph * 150;
      g.fillStyle(k % 2 ? a : 0xffd8a8, 0.6 * Math.sin(ph * Math.PI));
      g.fillCircle(bx, by, 2.6);
      g.fillStyle(0xffffff, 0.3 * Math.sin(ph * Math.PI));
      g.fillCircle(bx - 1, by - 1, 1.2);
    }
  } },
  catAuraB: { c: 0xffd8a8, a: 0xffb070, draw: (g, now, c, a) => {
    // 喵之星环：环身绕行的喵星轨道——轨道双环 + 绕行猫头 + 鱼干星 + 爪印
    g.lineStyle(2, c, 0.5); // 双轨道环
    g.strokeCircle(0, -14, 62);
    g.lineStyle(1.2, a, 0.35);
    g.strokeCircle(0, -14, 44);
    for (let k = 0; k < 3; k++) { // 三只绕行的迷你猫头
      const ang = now / 1400 + (k / 3) * TAU;
      const px = Math.cos(ang) * 62, py = -14 + Math.sin(ang) * 74;
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas(Math.sin(ang) * 0.3);
      g.fillStyle(k % 2 ? a : 0xffb070, 0.95); // 猫头
      g.fillCircle(0, 0, 6);
      g.fillTriangle(-5, -4, -2, -5, -4.4, -8); // 双耳
      g.fillTriangle(5, -4, 2, -5, 4.4, -8);
      g.fillStyle(0x1a1410, 0.9); // 眼睛眯线
      g.lineBetween(-3.4, 0, -1.4, 0);
      g.lineBetween(1.4, 0, 3.4, 0);
      g.fillStyle(0xffffff, 0.7); // 鼻
      g.fillCircle(0, 2, 0.7);
      g.restore();
      g.lineStyle(1, a, 0.25); // 尾迹
      g.beginPath();
      g.arc(0, -14, 62, ang - 0.5, ang);
      g.strokePath();
    }
    for (let k = 0; k < 5; k++) { // 鱼干星（轨道上的小鱼星）
      const ang = -now / 1000 + (k / 5) * TAU;
      const px = Math.cos(ang) * 44, py = -14 + Math.sin(ang) * 52;
      g.fillStyle(k % 2 ? a : c, 0.85);
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas(ang);
      g.fillEllipse(0, 0, 6, 2.6);
      g.fillTriangle(-3, 0, -5.4, -2, -5.4, 2);
      g.restore();
    }
    for (let k = 0; k < 4; k++) { // 环内爪印（明灭）
      const ang = (k / 4) * TAU + now / 2200;
      const px = Math.cos(ang) * 22, py = -14 + Math.sin(ang) * 26;
      const gl = 0.35 + 0.45 * Math.abs(Math.sin(now / 340 + k));
      g.fillStyle(a, gl);
      g.fillEllipse(px, py, 4, 3);
      for (let s = 0; s < 3; s++) g.fillCircle(px - 2 + s * 2, py - 3, 0.9);
    }
    g.fillStyle(c, 0.05); // 环身暖光
    g.fillCircle(0, -14, 78);
  } },
};
