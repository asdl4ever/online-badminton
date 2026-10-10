import { TAU, type WingArt } from './shared';

/**
 * 第十一批背部装饰（SCP / Keter / 遮蔽 / 耙 / 温迪哥 / 蛾人 / 巨兽 / 爬虫 / 变异体 / 巨兽领主）
 * ——全部 `single: true` 背挂物件。局部原点 = 肩锚，画一次、不镜像。
 */

export const WINGS_29: Record<string, WingArt> = {
  // ── SCP ──
  scpCage: { c: 0x8a9a8a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 收容笼：铁笼挂着锁与警示条
    g.fillStyle(0x4a5a4a, 1); g.fillRoundedRect(-18, -30, 36, 68, 3);
    g.fillStyle(c, 0.35); g.fillRoundedRect(-15, -27, 30, 62, 2);
    g.lineStyle(2, c, 0.95); for (let k = 0; k < 5; k++) { g.lineBetween(-12 + k * 6, -27, -12 + k * 6, 35); }
    g.lineStyle(2, c, 0.95); g.lineBetween(-15, -14, 15, -14); g.lineBetween(-15, 22, 15, 22);
    g.fillStyle(a, 0.65 + 0.35 * Math.sin(now / 300)); for (let k = 0; k < 3; k++) { g.fillTriangle(-18 + k * 12, -34, -12 + k * 12, -34, -15 + k * 12, -28); }
    g.fillStyle(0x8a9a8a, 1); g.fillRoundedRect(-4, 30, 8, 8, 2); g.fillStyle(0x2a3a2a, 1); g.fillCircle(0, 34, 1.6);
  } },
  scpBioTank: { c: 0x8a9a8a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 生物罐：玻璃培养罐里有东西在动
    g.fillStyle(0x3a4a3a, 1); g.fillRoundedRect(-16, -30, 32, 66, 4);
    g.fillStyle(0x9fd8d8, 0.35); g.fillRoundedRect(-13, -27, 26, 60, 3);
    const sw = Math.sin(now / 400) * 5;
    g.fillStyle(c, 0.9); g.fillEllipse(sw, 6, 12, 22);
    g.fillStyle(a, 0.9); g.fillCircle(sw + 2, 0, 2.4);
    g.fillStyle(0x6a7a6a, 1); g.fillRoundedRect(-18, -34, 36, 6, 2);
    g.fillStyle(0x9fd8ff, 0.25); g.fillEllipse(-5, -18, 6, 20);
    for (let k = 0; k < 3; k++) { const ph = ((now / 1000 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.8); g.fillCircle(-8 + k * 8, 26 - ph * 40, 1.6); }
  } },
  scpCamera: { c: 0x8a9a8a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 监控探头：壁装监控云台旋转
    g.fillStyle(0x4a5a4a, 1); g.fillRoundedRect(-18, -34, 36, 42, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-10, -8, 20, 12, 4);
    g.save(); g.translateCanvas(0, 4); g.rotateCanvas(Math.sin(now / 700) * 0.6);
    g.fillStyle(0x2a3a2a, 1); g.fillRoundedRect(-13, 2, 26, 12, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(-13, -6, 26, 10, 3);
    g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 200)); g.fillCircle(9, -1, 3);
    g.restore();
    g.fillStyle(a, 0.9); g.fillCircle(-14, -28, 2);
  } },
  scpStrongbox: { c: 0x8a9a8a, a: 0xffd45c, single: true, draw: (g, now, _flap, c, a) => {
    // 密码保险箱：带转盘密码锁的绿箱
    g.fillStyle(0x3a5a3a, 1); g.fillRoundedRect(-19, -14, 38, 48, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-17, -12, 34, 44, 2);
    g.lineStyle(1.4, 0x2a3a2a, 0.8); g.strokeRect(-17, -12, 34, 44);
    g.fillStyle(0x2a3a2a, 1); g.fillCircle(0, 4, 9);
    g.fillStyle(0x9aa89a, 1); g.fillCircle(0, 4, 6);
    const d = now / 500; g.lineStyle(2, 0xffe08a, 1); g.lineBetween(0, 4, Math.cos(d) * 5, 4 + Math.sin(d) * 5);
    g.fillStyle(a, 1); g.fillRoundedRect(-4, -18, 8, 6, 1);
  } },
  // ── Keter ──
  keterSpine: { c: 0xa03030, a: 0xff5a5a, single: true, draw: (g, now, _flap, c, a) => {
    // 脊骨背架：一列脊椎骨向上弯曲
    const sway = Math.sin(now / 600) * 2;
    for (let k = 0; k < 8; k++) { const bx = Math.sin(k * 0.4) * 6 + sway * (k / 8); g.fillStyle(c, 1); g.fillEllipse(bx, -30 + k * 9, 16 - k, 8); g.fillStyle(0x6a1a1a, 1); g.fillCircle(bx, -30 + k * 9, 3); }
    g.fillStyle(a, 0.7); for (let k = 0; k < 4; k++) { g.fillCircle(Math.sin(k) * 6, -26 + k * 18, 1.6); }
  } },
  keterTent: { c: 0xa03030, a: 0xff5a5a, single: true, draw: (g, now, _flap, c, a) => {
    // 触须背囊：肉囊里伸出几根触须
    g.fillStyle(c, 1); g.fillEllipse(0, 2, 34, 44);
    g.fillStyle(0x6a1a1a, 1); g.fillEllipse(0, 2, 20, 26);
    for (let k = 0; k < 5; k++) { g.lineStyle(2.4, c, 0.9); g.beginPath(); for (let j = 0; j <= 6; j++) { const xx = -12 + k * 6 + Math.sin(j * 0.8 + now / 300 + k) * 6; const yy = 20 + j * 4; if (j === 0) g.moveTo(-12 + k * 6, 12); else g.lineTo(xx, yy); } g.strokePath(); }
    g.fillStyle(a, 0.8); for (let k = 0; k < 3; k++) { g.fillCircle(-8 + k * 8, -6, 1.6); }
  } },
  keterHeart: { c: 0xa03030, a: 0xff5a5a, single: true, draw: (g, now, _flap, c, a) => {
    // 搏动肉核：一颗搏动的肉色心脏带血管
    const b = 1 + 0.08 * Math.sin(now / 220);
    g.save(); g.scaleCanvas(b, b);
    g.fillStyle(0x6a1a1a, 1); g.fillCircle(-8, -4, 13); g.fillCircle(8, -4, 13);
    g.fillStyle(c, 1); g.fillCircle(-8, -4, 11); g.fillCircle(8, -4, 11);
    g.fillStyle(c, 1); g.fillTriangle(-19, 0, 19, 0, 0, 26);
    g.restore();
    g.lineStyle(2, a, 0.8); g.beginPath(); g.moveTo(0, -14); g.lineTo(-4, -28); g.strokePath(); g.lineBetween(0, -14, 6, -30);
    g.fillStyle(a, 0.4 + 0.4 * Math.sin(now / 220)); g.fillCircle(0, 4, 6);
  } },
  keterRibcage: { c: 0xa03030, a: 0xff5a5a, single: true, draw: (g, now, _flap, c, a) => {
    // 肋骨笼：一排肋骨围成的笼
    g.lineStyle(3, c, 1); g.beginPath(); g.moveTo(0, -32); g.lineTo(0, 36); g.strokePath();
    for (let k = 0; k < 6; k++) { g.lineStyle(2.4, c, 0.95); const yy = -28 + k * 11; const w = 18 - Math.abs(k - 2) * 2; g.beginPath(); g.moveTo(0, yy); g.lineTo(-w, yy + 6); g.lineTo(-w + 3, yy + 14); g.strokePath(); g.beginPath(); g.moveTo(0, yy); g.lineTo(w, yy + 6); g.lineTo(w - 3, yy + 14); g.strokePath(); }
    g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 400)); g.fillCircle(0, 4, 3);
  } },
  // ── 遮蔽者 ──
  shyCage: { c: 0xe8e8e0, a: 0x6a7a8a, single: true, draw: (g, now, _flap, c, a) => {
    // 遮脸头笼：背一个铁头笼
    g.fillStyle(0x4a5560, 1); g.fillEllipse(0, 0, 36, 46);
    g.fillStyle(c, 0.25); g.fillEllipse(0, 0, 32, 42);
    g.lineStyle(2, 0x7a8794, 1); for (let k = 0; k < 5; k++) { g.lineBetween(-14 + k * 7, -22, -14 + k * 7, 22); }
    g.lineStyle(2, 0x7a8794, 1); g.strokeEllipse(0, 0, 34, 44);
    g.fillStyle(a, 1); g.fillCircle(0, -22, 2);
    g.fillStyle(0x7a8794, 1); g.fillRoundedRect(-6, -34, 12, 6, 2);
    void now;
  } },
  shyPalePack: { c: 0xe8e8e0, a: 0x6a7a8a, single: true, draw: (g, now, _flap, c, a) => {
    // 惨白背囊：惨白绷带包裹的背囊
    g.fillStyle(0xb8b8b0, 1); g.fillRoundedRect(-17, -8, 34, 42, 8);
    g.fillStyle(c, 1); g.fillRoundedRect(-15, -6, 30, 38, 7);
    for (let k = 0; k < 4; k++) { g.lineStyle(1.4, 0xa8a8a0, 0.9); g.lineBetween(-14, -2 + k * 10, 14, 2 + k * 10); }
    g.fillStyle(a, 0.6); g.fillRoundedRect(-4, -10, 8, 30, 3);
    g.lineStyle(1.4, 0x9a9a92, 0.8); g.lineBetween(15, -4, 20, 10 + Math.sin(now / 500) * 2);
  } },
  shyChain: { c: 0xe8e8e0, a: 0x6a7a8a, single: true, draw: (g, now, _flap, c, a) => {
    // 束缚锁链：一束拖地锁链
    g.fillStyle(a, 1); g.fillRoundedRect(-16, -12, 32, 10, 3);
    for (let k = 0; k < 4; k++) { g.lineStyle(2.4, 0x9aa8b4, 0.95); g.beginPath(); for (let j = 0; j <= 7; j++) { const xx = -12 + k * 8 + Math.sin(j * 0.7 + now / 400 + k) * 4; g.lineTo(xx, -4 + j * 6); } g.strokePath(); }
    g.fillStyle(c, 0.9); g.fillCircle(-12, 40, 2.4); g.fillCircle(12, 40, 2.4);
  } },
  shyTag: { c: 0xe8e8e0, a: 0x6a7a8a, single: true, draw: (g, now, _flap, c, a) => {
    // 档案号牌：挂着档案号牌与证件袋
    g.fillStyle(a, 1); g.fillRoundedRect(-14, -30, 28, 34, 4);
    g.fillStyle(c, 1); g.fillRoundedRect(-16, -6, 32, 40, 5);
    g.fillStyle(0xffffff, 0.9); g.fillRect(-12, 0, 24, 26);
    g.fillStyle(0x4a5560, 1); for (let k = 0; k < 3; k++) { g.fillRect(-9, 4 + k * 7, 18 - k * 4, 2); }
    const sw = Math.sin(now / 500) * 3; g.lineStyle(1.6, 0x9aa8b4, 1); g.lineBetween(0, -6, sw, -18);
    g.fillStyle(0xff5a5a, 1); g.fillCircle(0, -30, 3);
  } },
  // ── 耙 ──
  rakeSpine: { c: 0x8a8070, a: 0xd8d0c0, single: true, draw: (g, now, _flap, c, a) => {
    // 脊椎背架：弯曲脊椎骨
    const sway = Math.sin(now / 650) * 2;
    g.lineStyle(4, c, 1); g.beginPath(); for (let k = 0; k <= 8; k++) { const xx = Math.sin(k * 0.5) * 8 + sway; if (k === 0) g.moveTo(xx, -32 + k * 9); else g.lineTo(xx, -32 + k * 9); } g.strokePath();
    for (let k = 0; k < 7; k++) { g.fillStyle(a, 0.9); g.fillEllipse(Math.sin(k * 0.5) * 8 + sway, -28 + k * 9, 12, 5); }
  } },
  rakeFence: { c: 0x8a8070, a: 0xd8d0c0, single: true, draw: (g, now, _flap, c, a) => {
    // 骨篱背架：一截骨制篱笆
    g.fillStyle(c, 1); g.fillRect(-16, -6, 32, 34);
    g.lineStyle(2, 0x5a5044, 0.8); g.lineBetween(-16, 6, 16, 6); g.lineBetween(-16, 20, 16, 20);
    for (let k = 0; k < 5; k++) { g.fillStyle(a, 0.95); const bx = -14 + k * 7; g.fillTriangle(bx, -6, bx + 5, -6, bx + 2.5, -20); }
    g.fillStyle(0x6a6054, 1); g.fillCircle(0, 28, 4);
    void now;
  } },
  rakePelt: { c: 0x8a8070, a: 0xd8d0c0, single: true, draw: (g, now, _flap, c, a) => {
    // 人皮披挂：缝合成人形的皮挂
    g.fillStyle(c, 1); g.fillTriangle(-18, -30, 18, -30, 0, 40);
    g.fillStyle(a, 0.35); g.fillEllipse(0, 0, 16, 50);
    g.lineStyle(1.4, 0x6a6054, 0.9); for (let k = 0; k < 4; k++) { g.lineBetween(-14 + k * 9, -24, -10 + k * 9, 30); }
    g.fillStyle(0x4a4438, 1); g.fillCircle(-4, -12, 2); g.fillCircle(4, -12, 2);
    const sw = Math.sin(now / 600) * 2; g.fillStyle(c, 1); g.fillTriangle(-20, 34, -12, 30, -16 + sw, 40);
  } },
  rakeLair: { c: 0x8a8070, a: 0xd8d0c0, single: true, draw: (g, now, _flap, c, a) => {
    // 巢穴背篓：暗巢背篓里有眼睛在闪
    g.fillStyle(0x4a4438, 1); g.fillRoundedRect(-17, -10, 34, 46, 6);
    g.fillStyle(c, 1); g.fillRoundedRect(-14, -6, 28, 40, 5);
    g.fillStyle(0x2a2620, 1); g.fillEllipse(0, 12, 22, 24);
    for (let k = 0; k < 4; k++) { g.fillStyle(a, 0.6 + 0.4 * Math.sin(now / 300 + k)); g.fillCircle(-7 + k * 5, 8 + (k % 2) * 8, 2); }
    g.fillStyle(0x2a2620, 1); g.fillCircle(0, -14, 8);
  } },
  // ── 温迪哥 ──
  wendiAntlerPack: { c: 0x9a8060, a: 0xd8e8f0, single: true, draw: (g, _now, _flap, c, a) => {
    // 鹿角背架：一对枯鹿角组成的背架
    g.fillStyle(c, 1); g.fillRoundedRect(-14, 0, 28, 34, 5);
    g.lineStyle(3, c, 1);
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 6, 0); g.lineTo(s * 16, -20); g.lineTo(s * 10, -34); g.strokePath(); g.lineBetween(s * 12, -12, s * 22, -18); g.lineBetween(s * 15, -26, s * 8, -34); }
    g.fillStyle(a, 0.6); g.fillCircle(0, 16, 4);
  } },
  wendiFur: { c: 0x9a8060, a: 0xd8e8f0, single: true, draw: (g, now, _flap, c, a) => {
    // 兽毛披挂：厚兽毛披挂
    g.fillStyle(c, 1); g.fillRoundedRect(-20, -8, 40, 46, 10);
    g.fillStyle(0x6a5540, 1); g.fillRoundedRect(-16, -4, 32, 38, 8);
    for (let k = 0; k < 7; k++) { g.fillStyle(c, 1); g.fillTriangle(-18 + k * 6, -6, -14 + k * 6, -6, -16 + k * 6 + Math.sin(now / 700 + k) * 1.5, -20); }
    g.fillStyle(a, 0.4); g.fillEllipse(0, 10, 24, 22);
  } },
  wendiTotem: { c: 0x9a8060, a: 0xd8e8f0, single: true, draw: (g, now, _flap, c, a) => {
    // 饥饿图腾：饥饿图腾柱
    g.fillStyle(0x6a5540, 1); g.fillRoundedRect(-11, -34, 22, 70, 3);
    g.fillStyle(c, 1); g.fillRoundedRect(-9, -32, 18, 66, 2);
    g.fillStyle(0x3a2f22, 1); g.fillCircle(0, -20, 5); g.fillCircle(0, 2, 5); g.fillCircle(0, 24, 5);
    g.fillStyle(a, 0.65 + 0.35 * Math.sin(now / 400)); g.fillCircle(-3, -21, 1.6); g.fillCircle(3, -19, 1.6); g.fillCircle(0, 24, 2);
    g.fillStyle(a, 0.7); for (let k = 0; k < 3; k++) { g.fillTriangle(-13, -26 + k * 12, -9, -30 + k * 12, -9, -22 + k * 12); }
  } },
  wendiCage: { c: 0x9a8060, a: 0xd8e8f0, single: true, draw: (g, _now, _flap, c, a) => {
    // 骨笼背篓：骨制背篓带骷髅头
    g.fillStyle(c, 1); g.fillRoundedRect(-17, -6, 34, 44, 6);
    g.lineStyle(2, 0x5a4a36, 0.7); for (let k = 0; k < 5; k++) { g.lineBetween(-13 + k * 6.5, -6, -13 + k * 6.5, 38); }
    g.fillStyle(a, 0.95); g.fillCircle(0, -18, 10);
    g.fillStyle(0x4a3d2c, 1); g.fillCircle(-3, -20, 2.6); g.fillCircle(3, -20, 2.6); g.fillRect(-1, -16, 2, 5);
    g.fillStyle(0x3a2f22, 1); g.fillRect(-14, 38, 28, 4);
  } },
  // ── 蛾人 ──
  mothmWings: { c: 0x7a5a3a, a: 0xff3a3a, single: true, draw: (g, now, _flap, c, a) => {
    // 鳞粉背翼：一对收拢的蛾翼垂在背后
    const sw = Math.sin(now / 800) * 2;
    for (const s of [-1, 1]) { g.fillStyle(c, 1); g.fillPoints([{ x: s * 4, y: -30 }, { x: s * 18, y: -18 + sw }, { x: s * 14, y: 6 + sw }, { x: s * 4, y: 24 }] as never, true); g.fillStyle(0x4a3624, 1); g.fillEllipse(s * 12, -4 + sw, 8, 14); g.fillStyle(a, 0.8); g.fillCircle(s * 11, -8 + sw, 2); }
    g.fillStyle(c, 1); g.fillEllipse(0, -6, 8, 40);
    g.fillStyle(a, 0.5); g.fillCircle(0, -30, 2.4);
  } },
  mothmCocoon: { c: 0x7a5a3a, a: 0xff3a3a, single: true, draw: (g, now, _flap, c, a) => {
    // 蛾茧背囊：挂在背上的蛾茧
    g.fillStyle(0x4a3624, 1); g.fillEllipse(0, 4, 26, 52);
    g.fillStyle(c, 1); g.fillEllipse(0, 4, 22, 46);
    g.lineStyle(1.4, 0x9a7a54, 0.7); for (let k = 0; k < 5; k++) { g.lineBetween(-11, -14 + k * 10, 11, -10 + k * 10); }
    g.fillStyle(a, 0.4 + 0.4 * Math.sin(now / 350)); g.fillEllipse(0, 4, 12, 30);
    g.lineStyle(2, 0x4a3624, 1); g.lineBetween(0, -30, Math.sin(now / 700) * 4, -40);
  } },
  mothmLamp: { c: 0x7a5a3a, a: 0xff3a3a, single: true, draw: (g, now, _flap, c, a) => {
    // 诱蛾灯：背一盏诱蛾灯，周围小蛾环绕
    g.fillStyle(c, 1); g.fillRoundedRect(-3, -34, 6, 20, 2);
    g.fillStyle(0x4a3624, 1); g.fillRoundedRect(-12, -14, 24, 4, 1);
    g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 250)); g.fillEllipse(0, -2, 20, 24);
    g.fillStyle(a, 1); g.fillCircle(0, -2, 4);
    for (let k = 0; k < 4; k++) { const ang = now / 500 + k * (TAU / 4); g.fillStyle(0x6a5038, 0.9); g.fillEllipse(Math.cos(ang) * 18, -2 + Math.sin(ang) * 16, 5, 4); }
  } },
  mothmChrysalis: { c: 0x7a5a3a, a: 0xff3a3a, single: true, draw: (g, now, _flap, c, a) => {
    // 蛹壳背架：半透明蛹壳背架
    g.fillStyle(0x5a7a5a, 0.5); g.fillEllipse(0, 2, 28, 54);
    g.fillStyle(c, 0.55); g.fillEllipse(0, 2, 22, 46);
    g.fillStyle(0x2a3a2a, 1); g.fillEllipse(0, 14, 12, 20);
    g.lineStyle(1.6, a, 0.8); g.strokeEllipse(0, 2, 26, 50);
    for (let k = 0; k < 3; k++) { const ph = ((now / 1000 + k / 3) % 1); g.fillStyle(a, (1 - ph) * 0.7); g.fillCircle(-8 + k * 8, 28 - ph * 40, 1.4); }
  } },
  // ── 巨兽 ──
  gbeastBone: { c: 0x8a5a3a, a: 0xffb347, single: true, draw: (g, now, _flap, c, a) => {
    // 巨骨背架：一根巨大的兽骨背架
    g.save(); g.rotateCanvas(Math.sin(now / 700) * 0.05);
    g.fillStyle(c, 1); g.fillRoundedRect(-6, -34, 12, 68, 6);
    g.fillStyle(0xe8d8b8, 1); g.fillCircle(-8, -32, 8); g.fillCircle(8, -32, 8); g.fillCircle(-8, 32, 8); g.fillCircle(8, 32, 8);
    g.restore();
    g.fillStyle(a, 0.6); g.fillEllipse(0, 0, 4, 30);
  } },
  gbeastCrate: { c: 0x8a5a3a, a: 0xffb347, single: true, draw: (g, now, _flap, c, a) => {
    // 集装箱背箱：背一个集装箱
    g.fillStyle(c, 1); g.fillRoundedRect(-20, -16, 40, 48, 2);
    g.fillStyle(0x6a4028, 1); for (let k = 0; k < 4; k++) { g.fillRect(-18 + k * 9, -16, 2, 48); }
    g.lineStyle(2, 0x3a2418, 0.8); g.strokeRect(-20, -16, 40, 48);
    g.fillStyle(a, 0.9); g.fillCircle(-8, 0, 2.4); g.fillCircle(6, 0, 2.4);
    g.fillStyle(0x3a2418, 1); g.fillRect(10, 24, 6, 8);
    void now;
  } },
  gbeastDrum: { c: 0x8a5a3a, a: 0xffb347, single: true, draw: (g, now, _flap, c, a) => {
    // 战鼓背箱：背一面巨鼓
    g.fillStyle(0x5a3a24, 1); g.fillEllipse(0, 2, 40, 48);
    g.fillStyle(c, 1); g.fillEllipse(0, 0, 38, 44);
    g.fillStyle(a, 0.9); g.fillEllipse(0, 0, 28, 32);
    g.fillStyle(0x5a3a24, 1); for (let k = 0; k < 6; k++) { const ang = (k / 6) * TAU; g.fillCircle(Math.cos(ang) * 31, Math.sin(ang) * 18, 2); }
    g.fillStyle(0x3a2418, 1); g.fillCircle(0, 0, 3);
    for (let k = 0; k < 3; k++) { const ph = ((now / 500 + k / 3) % 1); g.strokeCircle(0, 0, 6 + ph * 22); }
  } },
  gbeastTotem: { c: 0x8a5a3a, a: 0xffb347, single: true, draw: (g, _now, _flap, c, a) => {
    // 巨兽图腾：巨兽图腾柱
    g.fillStyle(c, 1); g.fillRoundedRect(-12, -34, 24, 70, 4);
    g.fillStyle(0x6a4028, 1); g.fillRect(-12, -8, 24, 4); g.fillRect(-12, 18, 24, 4);
    g.fillStyle(0x3a2418, 1); g.fillCircle(0, -20, 6); g.fillCircle(0, 6, 6);
    g.fillStyle(a, 1); g.fillCircle(-2, -21, 1.8); g.fillCircle(2, -19, 1.8);
    g.fillStyle(a, 0.85); g.fillTriangle(-11, -34, -5, -34, -8, -44); g.fillTriangle(5, -34, 11, -34, 8, -44);
  } },
  // ── 爬虫 ──
  crawSpine: { c: 0xc8a86a, a: 0x4a2a1a, single: true, draw: (g, now, _flap, c, a) => {
    // 棘刺背架：一列背棘
    const sway = Math.sin(now / 600) * 1.5;
    g.lineStyle(4, a, 1); g.beginPath(); g.moveTo(0, 36); g.lineTo(0, -32); g.strokePath();
    for (let k = 0; k < 6; k++) { g.fillStyle(c, 1); g.fillTriangle(-8, 26 - k * 11 + sway, 8, 26 - k * 11 + sway, 0, 8 - k * 11 + sway); }
    g.fillStyle(a, 0.8); g.fillCircle(0, -34, 3);
  } },
  crawTail: { c: 0xc8a86a, a: 0x4a2a1a, single: true, draw: (g, now, _flap, c, a) => {
    // 骨尾披挂：一条垂下的骨尾
    g.fillStyle(0x7a6034, 1); g.fillRoundedRect(-10, -8, 20, 22, 4);
    g.lineStyle(6, c, 1); g.beginPath(); for (let k = 0; k <= 8; k++) { const xx = Math.sin(k * 0.7 + now / 500) * 8; if (k === 0) g.moveTo(xx, 8 + k * 5); else g.lineTo(xx, 8 + k * 5); } g.strokePath();
    g.fillStyle(a, 0.9); for (let k = 0; k < 5; k++) { g.fillCircle(-6 + k * 3, 20 + k * 5, 2); }
  } },
  crawEgg: { c: 0xc8a86a, a: 0x4a2a1a, single: true, draw: (g, _now, _flap, c, a) => {
    // 蛋壳背囊：半颗巨蛋壳背囊
    g.fillStyle(0x7a6034, 1); g.fillRoundedRect(-17, 22, 34, 16, 4);
    g.fillStyle(c, 1); g.fillEllipse(0, 6, 40, 56);
    g.fillStyle(a, 0.5); g.fillEllipse(0, 6, 32, 46);
    g.fillStyle(c, 1); g.fillPoints([{ x: -18, y: -8 }, { x: -6, y: -20 }, { x: 2, y: -4 }, { x: 12, y: -18 }, { x: 18, y: -2 }, { x: 16, y: -18 }] as never, true);
    g.fillStyle(0x2a1a12, 1); g.fillEllipse(0, 14, 16, 16);
  } },
  crawRib: { c: 0xc8a86a, a: 0x4a2a1a, single: true, draw: (g, now, _flap, c, a) => {
    // 肋骨背架：恐龙的肋骨背架
    g.lineStyle(4, c, 1); g.beginPath(); g.moveTo(0, -32); g.lineTo(4, 36); g.strokePath();
    for (let k = 0; k < 5; k++) { g.lineStyle(3, c, 0.95); const yy = -24 + k * 12; g.beginPath(); g.moveTo(0, yy); g.lineTo(-20 + k * 2, yy + 10); g.strokePath(); g.beginPath(); g.moveTo(0, yy); g.lineTo(20 - k * 2, yy + 10); g.strokePath(); }
    g.fillStyle(a, 0.7); g.fillCircle(0, 34, 3);
    void now;
  } },
  // ── 变异体 ──
  mutoWing: { c: 0x5a6a3a, a: 0x7dff5a, single: true, draw: (g, now, _flap, c, a) => {
    // 虫翼背架：一对收拢的虫翼
    const sw = Math.sin(now / 700) * 2;
    for (const s of [-1, 1]) { g.fillStyle(0x3a4a26, 0.85); g.fillEllipse(s * 12, -6 + sw, 16, 44); g.lineStyle(1.6, c, 0.9); for (let k = 0; k < 4; k++) { g.lineBetween(s * 4, -24 + k * 12 + sw, s * 20, -16 + k * 14 + sw); } }
    g.fillStyle(c, 1); g.fillEllipse(0, -4, 8, 34);
    g.fillStyle(a, 0.7); g.fillCircle(0, -22, 2.4);
  } },
  mutoEgg: { c: 0x5a6a3a, a: 0x7dff5a, single: true, draw: (g, now, _flap, c, a) => {
    // 虫卵背囊：一囊发光虫卵
    g.fillStyle(0x3a4a26, 1); g.fillEllipse(0, 6, 36, 54);
    g.fillStyle(c, 0.8); g.fillEllipse(0, 6, 30, 46);
    for (let k = 0; k < 5; k++) { g.fillStyle(a, 0.5 + 0.4 * Math.sin(now / 300 + k)); g.fillCircle(-10 + (k % 3) * 10, -8 + Math.floor(k / 3) * 20, 5); }
  } },
  mutoReactor: { c: 0x5a6a3a, a: 0x7dff5a, single: true, draw: (g, now, _flap, c, a) => {
    // 辐射反应堆：背一个辐射反应堆，绿色核心脉动
    g.fillStyle(0x3a3a2a, 1); g.fillRoundedRect(-18, -24, 36, 58, 6);
    g.fillStyle(c, 1); g.fillRoundedRect(-15, -21, 30, 52, 5);
    const p = 0.5 + 0.5 * Math.sin(now / 200);
    g.fillStyle(a, 0.4 + 0.6 * p); g.fillCircle(0, 4, 12);
    g.fillStyle(0xffffff, 0.5 + 0.4 * p); g.fillCircle(0, 4, 5);
    g.lineStyle(2, 0x2a2a1a, 0.8); for (let k = 0; k < 3; k++) { g.strokeCircle(0, 4, 16 + k * 4 + p * 4); }
    g.fillStyle(0xffd45c, 0.8); g.fillCircle(-11, 26, 2); g.fillCircle(11, 26, 2);
  } },
  mutoClaw: { c: 0x5a6a3a, a: 0x7dff5a, single: true, draw: (g, now, _flap, c, a) => {
    // 巨螯背架：一对巨大虫螯背架
    const open = 2 + Math.abs(Math.sin(now / 500)) * 4;
    for (const s of [-1, 1]) { g.fillStyle(c, 1); g.fillPoints([{ x: s * 3, y: -30 }, { x: s * (18 + open), y: -14 }, { x: s * (14 + open), y: 2 }, { x: s * 4, y: -8 }] as never, true); g.fillStyle(a, 0.8); g.fillCircle(s * (12 + open), -8, 2.2); }
    g.fillStyle(0x3a4a26, 1); g.fillRoundedRect(-8, -8, 16, 30, 4);
  } },
  // ── 巨兽领主 ──
  beheSpike: { c: 0x5a4030, a: 0x8a6a4a, single: true, draw: (g, now, _flap, c, a) => {
    // 尖刺背甲：背甲上的尖刺
    g.fillStyle(c, 1); g.fillRoundedRect(-18, -14, 36, 50, 6);
    g.fillStyle(0x3a2818, 1); g.fillRoundedRect(-14, -10, 28, 42, 5);
    for (let k = 0; k < 5; k++) { g.fillStyle(a, 0.95); const bx = -16 + k * 8; g.fillTriangle(bx, -14, bx + 7, -14, bx + 3.5, -14 - (10 + (k % 2) * 8)); }
    g.fillStyle(a, 0.6); g.fillEllipse(0, 18, 22, 12);
    void now;
  } },
  beheArmor: { c: 0x5a4030, a: 0x8a6a4a, single: true, draw: (g, now, _flap, c, a) => {
    // 装甲背板：厚重装甲背板
    g.fillStyle(c, 1); g.fillRoundedRect(-20, -20, 40, 58, 8);
    g.fillStyle(a, 0.5); g.fillRoundedRect(-15, -15, 30, 48, 6);
    g.lineStyle(2, 0x3a2818, 0.85); for (let k = 0; k < 3; k++) { g.lineBetween(-20, -6 + k * 16, 20, -6 + k * 16); }
    g.fillStyle(0x3a2818, 1); for (let k = 0; k < 4; k++) { g.fillCircle(-14 + (k % 2) * 28, -14 + Math.floor(k / 2) * 44, 2.4); }
    void now;
  } },
  beheMountain: { c: 0x5a4030, a: 0x8a6a4a, single: true, draw: (g, now, _flap, c, a) => {
    // 山岩背架：背着一座小山岩
    g.fillStyle(c, 1); g.fillTriangle(-22, 38, 22, 38, 0, -34);
    g.fillStyle(a, 0.7); g.fillTriangle(-8, 38, 14, 38, 4, -10);
    g.fillStyle(0xe8e8e0, 0.9); g.fillTriangle(-7, -14, 7, -14, 0, -34);
    g.fillStyle(0x3a2818, 1); for (let k = 0; k < 3; k++) { g.fillCircle(-12 + k * 12, 24 - k * 6, 3); }
    for (let k = 0; k < 3; k++) { const ph = ((now / 1100 + k / 3) % 1); g.fillStyle(0x8a6a4a, (1 - ph) * 0.7); g.fillCircle(-14 + k * 14, 36 - ph * 20, 1.6); }
  } },
  beheCage: { c: 0x5a4030, a: 0x8a6a4a, single: true, draw: (g, now, _flap, c, a) => {
    // 兽笼背箱：背一个兽笼
    g.fillStyle(c, 1); g.fillRoundedRect(-19, -30, 38, 68, 4);
    g.fillStyle(0x2a1e14, 0.5); g.fillRoundedRect(-16, -27, 32, 62, 3);
    g.lineStyle(2, a, 0.9); for (let k = 0; k < 6; k++) { g.lineBetween(-15 + k * 6, -28, -15 + k * 6, 34); }
    g.lineStyle(2, a, 0.9); g.lineBetween(-17, -14, 17, -14); g.lineBetween(-17, 20, 17, 20);
    g.fillStyle(0x3a2818, 1); g.fillRoundedRect(-4, 32, 8, 7, 2);
    void now;
  } },
};
