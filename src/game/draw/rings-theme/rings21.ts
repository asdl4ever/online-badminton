import { TAU, type RingArt } from './shared';

/** 第九批地环（恐龙 / 史前 / 神话 / 恶搞 10 主题）——原点 (x, feetY)，地面基准 feetY-3 */

export const RINGS_21: Record<string, RingArt> = {
  cretClaw: { c: 0x8a5a2a, a: 0xe8d07a, draw: (g, now, x, feetY, c, a) => {
    // 爪印地环：脚下三趾爪印 + 地面裂痕
    const ry = feetY - 3;
    g.fillStyle(0x2a1a0c, 0.45); g.fillEllipse(x, ry + 1, 56, 15);
    for (let k = 0; k < 5; k++) { const ang = (k / 5) * TAU; const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 7; g.fillStyle(c, 0.85); g.fillEllipse(px, py, 7, 5); for (const d of [-1, 0, 1]) { g.fillStyle(c, 0.85); g.fillTriangle(px + d * 3 - 1.4, py - 3, px + d * 3 + 1.4, py - 3, px + d * 3, py - 8); } }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 350)); g.fillEllipse(x, ry, 12, 4);
  } },
  swampMud: { c: 0x4a3a22, a: 0x7dff9a, draw: (g, now, x, feetY, c, a) => {
    // 泥沼地环：冒泡泥沼
    const ry = feetY - 3;
    g.fillStyle(0x0f2418, 0.5); g.fillEllipse(x, ry + 1, 60, 16);
    g.fillStyle(c, 0.75); g.fillEllipse(x, ry, 54, 13);
    for (let k = 0; k < 7; k++) { const ang = (k / 7) * TAU; const pb = Math.max(0, Math.sin(now / 300 + k * 1.3)); g.fillStyle(a, 0.6 * pb); g.fillCircle(x + Math.cos(ang) * 22, ry + Math.sin(ang) * 7, 1.6 + pb * 1.6); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 260)); g.fillEllipse(x, ry, 12, 4);
  } },
  iceageCrack: { c: 0x5a8ab0, a: 0x8fd8ff, draw: (g, now, x, feetY, _c, a) => {
    // 冰裂地环：冰面裂开，缝里透蓝光
    const ry = feetY - 3;
    g.fillStyle(0x0e2030, 0.5); g.fillEllipse(x, ry + 1, 58, 15);
    g.fillStyle(0xdff4ff, 0.4); g.fillEllipse(x, ry, 54, 13);
    g.lineStyle(1.8, a, 0.6 + 0.3 * Math.sin(now / 400));
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; const px = x + Math.cos(ang) * 26, py = ry + Math.sin(ang) * 7; g.lineBetween(x, ry, px, py); g.lineBetween(px, py, px + Math.cos(ang + 0.5) * 9, py + Math.sin(ang + 0.5) * 5); }
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 300 + k)); g.fillCircle(x + Math.cos(ang) * 26, ry + Math.sin(ang) * 7, 2); }
  } },
  yorThunder: { c: 0xffb03a, a: 0xffe08a, draw: (g, now, x, feetY, c, a) => {
    // 雷纹地环：脚下雷纹圈 + 电花
    const ry = feetY - 3;
    g.fillStyle(0x241008, 0.5); g.fillEllipse(x, ry + 1, 58, 15);
    g.lineStyle(2, c, 0.7); g.strokeEllipse(x, ry, 48, 12);
    const flash = Math.max(0, Math.sin(now / 140)); if (flash > 0.7) { g.lineStyle(2, a, flash); g.lineBetween(x - 20, ry, x - 6, ry - 2); g.lineBetween(x - 6, ry - 2, x + 2, ry + 2); g.lineBetween(x + 2, ry + 2, x + 18, ry - 3); }
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU; g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 200 + k)); g.fillCircle(x + Math.cos(ang) * 24, ry + Math.sin(ang) * 6, 1.6); }
  } },
  kalMoss: { c: 0x3a6a4a, a: 0x9fe8d0, draw: (g, now, x, feetY, c, a) => {
    // 苔石地环：脚下苔石圈
    const ry = feetY - 3;
    g.fillStyle(0x12202a, 0.45); g.fillEllipse(x, ry + 1, 58, 15);
    for (let k = 0; k < 9; k++) { const ang = (k / 9) * TAU; const px = x + Math.cos(ang) * 25, py = ry + Math.sin(ang) * 7; g.fillStyle(0x6a6a6a, 0.9); g.fillEllipse(px, py, 8, 5); g.fillStyle(c, 0.8); g.fillEllipse(px, py - 2, 7, 3); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 350)); g.fillEllipse(x, ry, 12, 4);
  } },
  banRing: { c: 0xf0d020, a: 0xfff080, draw: (g, now, x, feetY, c, a) => {
    // 蕉皮地环：脚下一圈蕉皮
    const ry = feetY - 3;
    g.fillStyle(0x4a4a08, 0.4); g.fillEllipse(x, ry + 1, 58, 15);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU + now / 3000; const px = x + Math.cos(ang) * 24, py = ry + Math.sin(ang) * 7; g.save(); g.translateCanvas(px, py); g.rotateCanvas(ang + now / 3000); g.fillStyle(c, 0.95); g.fillPoints([{ x: -7, y: 0 }, { x: 0, y: -5 }, { x: 7, y: 0 }, { x: 0, y: 4 }] as never, true); g.fillStyle(0x8a8a1a, 0.8); g.fillCircle(0, 0, 1.4); g.restore(); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, ry, 12, 4);
  } },
  memeLoading: { c: 0x39ffd0, a: 0x7dff9a, draw: (g, now, x, feetY, c, a) => {
    // 加载圈地环：脚下转圈加载环
    const ry = feetY - 3;
    g.fillStyle(0x0e1620, 0.45); g.fillEllipse(x, ry + 1, 58, 15);
    const rot = now / 400;
    for (let k = 0; k < 10; k++) { const ang = (k / 10) * TAU + rot; const on = (Math.sin(rot * 3 - k * 0.6) + 1) / 2; g.fillStyle(k % 2 ? c : a, 0.3 + 0.6 * on); g.fillRect(x + Math.cos(ang) * 24 - 2.4, ry + Math.sin(ang) * 7 - 2.4, 4.8, 4.8); }
  } },
  officeSplat: { c: 0x4a3a2a, a: 0xffd45c, draw: (g, now, x, feetY, c, a) => {
    // 咖啡渍地环：脚下咖啡渍 + 液滴
    const ry = feetY - 3;
    g.fillStyle(c, 0.55); g.fillEllipse(x, ry, 50, 13);
    g.fillStyle(0x2a1a10, 0.5); g.fillEllipse(x - 8, ry, 14, 6); g.fillEllipse(x + 10, ry + 2, 10, 5);
    for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU + 0.4; g.fillStyle(c, 0.8); g.fillCircle(x + Math.cos(ang) * 28, ry + Math.sin(ang) * 7, 2); }
    for (let k = 0; k < 3; k++) { const ph = ((now / 900 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.6); g.fillCircle(-8 + k * 10, ry - ph * 10, 1.6); }
  } },
  gnomeFairy: { c: 0xc0392b, a: 0xa8ff7a, draw: (g, now, x, feetY, c, a) => {
    // 蘑菇圈地环：脚下一圈小蘑菇
    const ry = feetY - 3;
    g.fillStyle(0x1a2c16, 0.45); g.fillEllipse(x, ry + 1, 58, 15);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU; const px = x + Math.cos(ang) * 25, py = ry + Math.sin(ang) * 7; const bob = Math.sin(now / 500 + k) * 1; g.fillStyle(0xe8e0d0, 1); g.fillRect(px - 1.6, py - 4, 3.2, 5); g.fillStyle(c, 1); g.fillEllipse(px, py - 5 + bob, 9, 5); g.fillStyle(0xf0f0e0, 1); g.fillCircle(px - 2, py - 5 + bob, 1.2); }
    g.fillStyle(a, 0.4 + 0.3 * Math.sin(now / 300)); g.fillEllipse(x, ry, 12, 4);
  } },
  trashPuddle: { c: 0x4a5a4a, a: 0x8fd4a0, draw: (g, now, x, feetY, c, a) => {
    // 污水地环：脚下污水涟漪 + 气泡
    const ry = feetY - 3;
    g.fillStyle(0x2a3030, 0.55); g.fillEllipse(x, ry + 1, 60, 16);
    g.fillStyle(c, 0.7); g.fillEllipse(x, ry, 54, 13);
    for (let k = 0; k < 3; k++) { const ph = ((now / 1200 + k / 3) % 1); g.lineStyle(1.4, a, (1 - ph) * 0.6); g.strokeEllipse(x, ry, 12 + ph * 40, 3 + ph * 10); }
    for (let k = 0; k < 5; k++) { const ang = (k / 5) * TAU; g.fillStyle(a, 0.6); g.fillCircle(x + Math.cos(ang) * 22, ry + Math.sin(ang) * 7, 1.6); }
  } },
};
