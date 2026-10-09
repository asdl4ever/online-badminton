import { TAU, apoly, aline, type AuraArt } from './shared';

/** 批十六光环（天竺神话 / 高天原 / 凯尔特 / 美索不达米亚 / 克苏鲁）——成景构图，画在角色身后 */

export const AURAS_21: Record<string, AuraArt> = {
  vdaHalo: { c: 0xffd45c, a: 0xff9a3a, draw: (g, now, _c, a) => {
    // 梵天光环：身后多层同心光轮，缓缓呼吸
    const pulse = 0.5 + 0.5 * Math.sin(now / 500);
    for (let k = 3; k >= 0; k--) {
      g.fillStyle(k % 2 ? a : 0xffe8a0, 0.1 * pulse * (1 - k * 0.18));
      g.fillCircle(0, -30, 30 + k * 22);
    }
    g.lineStyle(2.4, a, 0.5 * pulse); g.beginPath(); g.arc(0, -30, 46, 0, TAU); g.strokePath();
    for (let k = 0; k < 16; k++) {
      const ang = (k / 16) * TAU + now / 1600;
      const rr = 46 + Math.sin(now / 400 + k) * 4;
      g.fillStyle(0xfff0b0, 0.6 + 0.4 * Math.abs(Math.sin(now / 300 + k)));
      g.fillCircle(Math.cos(ang) * rr, -30 + Math.sin(ang) * rr, 1.6);
    }
    // 莲座底座
    for (let k = 0; k < 7; k++) { const ang = Math.PI * 0.15 + (k / 6) * Math.PI * 0.7; g.fillStyle(0xffb7d5, 0.3); g.fillEllipse(Math.cos(ang) * 40, 34 + Math.sin(ang) * 10, 12, 6); }
  } },
  vdaChurn: { c: 0x7fd4ff, a: 0xffd45c, draw: (g, now, _c, a) => {
    // 搅乳海：身后乳海翻涌成涡，甘露飞溅
    for (let k = 0; k < 6; k++) { g.fillStyle(0x2a5a8a, 0.3); g.fillEllipse(-80 + k * 32 + Math.sin(now / 900 + k) * 10, 30, 46, 26); }
    for (let arm = 0; arm < 3; arm++) {
      g.lineStyle(6, arm % 2 ? a : 0xdff0ff, 0.35);
      g.beginPath();
      for (let s = 0; s <= 10; s++) {
        const u = s / 10;
        const ang = (arm / 3) * TAU + u * 4 + now / 500;
        const rr = u * 70;
        const px = Math.cos(ang) * rr, py = -20 + Math.sin(ang) * rr * 0.6;
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokePath();
    }
    for (let k = 0; k < 12; k++) { const ph = ((now / 1200 + k / 12) % 1); g.fillStyle(k % 2 ? a : 0xffffff, (1 - ph) * 0.8); g.fillCircle(-90 + (k * 43 % 180), -30 - ph * 60, 1.6 * (1 - ph) + 0.5); }
    g.fillStyle(0xdff0ff, 0.2); g.fillEllipse(0, 40, 200, 22);
  } },
  takThunder: { c: 0xffe15c, a: 0xff8a5c, draw: (g, now, _c, a) => {
    // 雷云环绕：身后翻卷雷云 + 云间电闪
    for (let k = 0; k < 7; k++) { g.fillStyle(0x3a3448, 0.4); g.fillCircle(-84 + k * 28 + Math.sin(now / 900 + k) * 8, -66 + (k % 3) * 20, 24); }
    const flick = Math.sin(now / 100) > 0.4 ? 1 : 0.25;
    g.lineStyle(2.6, a, flick);
    g.beginPath(); g.moveTo(26, -80); g.lineTo(12, -42); g.lineTo(20, -36); g.lineTo(2, 2); g.strokePath();
    g.lineStyle(1.6, 0xffe15c, flick * 0.8);
    g.beginPath(); g.moveTo(-20, -70); g.lineTo(-30, -40); g.lineTo(-24, -36); g.lineTo(-38, -6); g.strokePath();
    for (let k = 0; k < 8; k++) { const ph = ((now / 600 + k / 8) % 1); aline(g, [[-70 + k * 20, 0], [-74 + k * 20, 0 + ph * 50]], 1.4, 0x9fd8ff, 0.35); }
  } },
  takSunrise: { c: 0xffd45c, a: 0xc0392b, draw: (g, now, _c, a) => {
    // 天岩户曙光：身后岩洞缝隙里透出晨光，光柱外扩
    g.fillStyle(0x2a2430, 0.85); apoly(g, [[-100, 60], [-100, -60], [-30, -70], [-24, 60]], 0x2a2430, 0.85);
    g.fillStyle(0x2a2430, 0.85); apoly(g, [[100, 60], [100, -60], [30, -70], [24, 60]], 0x2a2430, 0.85);
    const glow = 0.5 + 0.5 * Math.sin(now / 700);
    g.fillStyle(a, 0.25 + 0.2 * glow); apoly(g, [[-22, -50], [22, -50], [40, 60], [-40, 60]], a, 0.25 + 0.2 * glow);
    g.fillStyle(0xfff0b0, 0.5 * glow); apoly(g, [[-8, -46], [8, -46], [16, 60], [-16, 60]], 0xfff0b0, 0.5 * glow);
    for (let k = 0; k < 5; k++) { g.lineStyle(3 - k * 0.4, 0xfff0b0, (0.35 - k * 0.05) * glow); g.beginPath(); g.moveTo((k - 2) * 14, -46); g.lineTo((k - 2) * 26, 60); g.strokePath(); }
    for (let k = 0; k < 6; k++) { const ph = ((now / 1000 + k / 6) % 1); g.fillStyle(0xfff0b0, (1 - ph) * 0.7); g.fillCircle(-20 + k * 8, -30 - ph * 40, 1.6); }
  } },
  celtFogRing: { c: 0x9fd8c8, a: 0x8fd45a, draw: (g, now, _c, a) => {
    // 迷雾环：身后一层缓缓旋转的灰绿雾环
    for (let k = 0; k < 10; k++) {
      const ang = (k / 10) * TAU + now / 3000;
      const rr = 60 + Math.sin(now / 800 + k) * 14;
      g.fillStyle(0xbfe8d8, 0.12); g.fillCircle(Math.cos(ang) * rr, -30 + Math.sin(ang) * rr * 0.6, 34);
    }
    g.lineStyle(2, a, 0.3); g.save(); g.translateCanvas(0, -30); g.scaleCanvas(1, 0.6); g.beginPath(); g.arc(0, 0, 74, 0, TAU); g.strokePath(); g.restore();
    for (let k = 0; k < 12; k++) { const ph = ((now / 1600 + k / 12) % 1); g.fillStyle(a, (1 - ph) * 0.6); g.fillCircle(-80 + (k * 41 % 160), 30 - ph * 90, 1.6 * (1 - ph) + 0.5); }
  } },
  celtStoneCircle: { c: 0x9a9a8a, a: 0x8fd45a, draw: (g, now, _c, a) => {
    // 石阵环绕：身后一圈立石，符文依次亮起
    for (let k = 0; k < 7; k++) {
      const ang = Math.PI * 0.1 + (k / 7) * Math.PI * 0.8;
      const sx = Math.cos(ang) * 90, sy = -10 + Math.sin(ang) * 30;
      const lit = 0.3 + 0.7 * Math.max(0, Math.sin(now / 500 - k));
      g.fillStyle(0x6a6a5a, 0.9); apoly(g, [[sx - 8, sy + 26], [sx - 7, sy - 22], [sx + 7, sy - 22], [sx + 8, sy + 26]], 0x6a6a5a, 0.9);
      g.fillStyle(0x8a8a7a, 0.9); apoly(g, [[sx - 6, sy + 24], [sx - 5, sy - 20], [sx + 5, sy - 20], [sx + 6, sy + 24]], 0x8a8a7a, 0.9);
      g.lineStyle(1.8, a, lit); g.lineBetween(sx - 4, sy + 4 - k, sx + 4, sy + 4 - k); g.lineBetween(sx, sy - 2 - k, sx, sy + 10 - k);
    }
    g.fillStyle(a, 0.15); g.fillEllipse(0, 34, 200, 20);
  } },
  mesoInanna: { c: 0x5a8aff, a: 0xffd45c, draw: (g, now, _c, a) => {
    // 伊南娜之星：身后一颗缓缓旋转的八芒金星
    const rot = now / 2200;
    g.fillStyle(a, 0.18); g.fillCircle(0, -34, 60);
    for (let k = 0; k < 8; k++) {
      const ang = rot + (k / 8) * TAU;
      g.fillStyle(k % 2 ? a : 0x8fb4ff, 0.75);
      g.fillTriangle(Math.cos(ang) * 62, -34 + Math.sin(ang) * 62, Math.cos(ang + 0.22) * 18, -34 + Math.sin(ang + 0.22) * 18, Math.cos(ang - 0.22) * 18, -34 + Math.sin(ang - 0.22) * 18);
    }
    for (let k = 0; k < 8; k++) { const ang = -rot + (k / 8) * TAU; g.fillStyle(0x5a8aff, 0.6); g.fillTriangle(Math.cos(ang) * 44, -34 + Math.sin(ang) * 44, Math.cos(ang + 0.18) * 12, -34 + Math.sin(ang + 0.18) * 12, Math.cos(ang - 0.18) * 12, -34 + Math.sin(ang - 0.18) * 12); }
    const gl = 0.5 + 0.5 * Math.sin(now / 300);
    g.fillStyle(0xffffff, gl); g.fillCircle(0, -34, 6);
  } },
  mesoZiggurat: { c: 0xd8b45a, a: 0x5a8aff, draw: (g, now, _c, a) => {
    // 通天塔：身后阶梯神塔，塔顶祭火
    for (let k = 4; k >= 0; k--) {
      const w = 30 + k * 24, y = 40 - k * 22;
      g.fillStyle(k % 2 ? 0x6a5a3a : 0x8a7448, 0.9);
      apoly(g, [[-w, y], [w, y], [w - 8, y - 20], [-w + 8, y - 20]], k % 2 ? 0x6a5a3a : 0x8a7448, 0.9);
      g.fillStyle(0x3a2e18, 0.5); g.fillRect(-w + 8, y - 6, 2 * (w - 8), 3);
    }
    const gl = 0.5 + 0.5 * Math.sin(now / 400);
    g.fillStyle(a, gl * 0.8); g.fillEllipse(0, -64, 14, 6);
    for (let k = 0; k < 4; k++) { const ph = ((now / 800 + k / 4) % 1); g.fillStyle(k % 2 ? a : 0xffd45c, (1 - ph) * 0.85); g.fillCircle((k - 1.5) * 5, -68 - ph * 22, 2 * (1 - ph) + 0.5); }
    for (let k = 0; k < 4; k++) { g.fillStyle(0x5a8aff, 0.5); g.fillRect(-34 + k * 22, 22 - (k % 2) * 22, 6, 4); }
  } },
  cthTentacleHalo: { c: 0x1e5a4a, a: 0x5fe8c8, draw: (g, now, _c, a) => {
    // 触须环绕：身后一圈环生触须，各自蠕动
    for (let k = 0; k < 12; k++) {
      const base = (k / 12) * TAU;
      g.lineStyle(4 - (k % 3) * 0.6, k % 2 ? 0x0e2a24 : 0x1e5a4a, 0.9);
      g.beginPath();
      let px = 0, py = 0;
      for (let s = 0; s <= 4; s++) {
        const u = s / 4;
        const rr = 40 + u * 40;
        const ang = base + Math.sin(now / 400 + k + u * 3) * 0.3;
        px = Math.cos(ang) * rr; py = -20 + Math.sin(ang) * rr * 0.6;
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokePath();
      g.fillStyle(a, 0.7); g.fillCircle(px, py, 1.6);
    }
    g.fillStyle(0x0a1e18, 0.5); g.fillEllipse(0, -20, 120, 90);
  } },
  cthVoidRift: { c: 0x7a4aa8, a: 0x5fe8c8, draw: (g, now, _c, a) => {
    // 虚空裂隙：身后裂开一道虚空，边缘触须、内部星光塌陷
    const wide = 18 + Math.sin(now / 600) * 4;
    g.fillStyle(0x05080f, 0.9); apoly(g, [[-wide, -120], [wide, -110], [wide * 1.4, 0], [wide, 90], [-wide, 80], [-wide * 0.9, -20]], 0x05080f, 0.9);
    g.lineStyle(2.4, a, 0.5 + 0.3 * Math.sin(now / 300));
    g.beginPath(); g.moveTo(-wide, -120); g.lineTo(-wide * 0.9, -20); g.lineTo(-wide, 80); g.strokePath();
    g.beginPath(); g.moveTo(wide, -110); g.lineTo(wide * 1.4, 0); g.lineTo(wide, 90); g.strokePath();
    for (let k = 0; k < 8; k++) { const ph = ((now / 900 + k / 8) % 1); g.fillStyle(k % 2 ? a : 0xb08aff, (1 - ph) * 0.8); g.fillCircle((k % 2 ? 1 : -1) * wide * 0.6, -100 + ph * 180, 1.6); }
    for (let k = 0; k < 5; k++) { const ang = -1.2 + k * 0.6; g.lineStyle(2, 0x2a4a44, 0.8); g.beginPath(); g.moveTo(-wide, -40 + k * 24); g.lineTo(-wide - Math.cos(ang) * 20, -40 + k * 24 + Math.sin(ang) * 14); g.strokePath(); }
    g.fillStyle(a, 0.15); g.fillEllipse(0, -10, 140, 220);
  } },
};
