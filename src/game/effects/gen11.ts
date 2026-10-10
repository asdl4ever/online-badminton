import type { EffectPainter } from './types';
const TAUf = Math.PI * 2;

/** 第十一批主题命中特效（SCP / 血肉 / 白猿 / 骨爬 / 巨兽）。按名字画爆点本身。 */

/** 收容失效爆：崩裂混凝土块 + 冲击环 + 眨眼提示 */
export const scpBreach: EffectPainter = (g, f, t, a, size) => {
  const conc = 0x8a9a8a, dark = 0x5f6f5f, eye = 0xffd45c, s = (10 + t * 16) * size;
  g.fillStyle(dark, a * 0.85); g.fillCircle(f.x, f.y, s * 0.9);
  g.fillStyle(conc, a * 0.9); g.fillCircle(f.x, f.y, s * 0.6);
  for (let k = 0; k < 8; k++) {
    const ang = f.seed + (k / 8) * TAUf, rr = (10 + t * 52) * size;
    g.fillStyle(k % 2 ? conc : dark, a * (1 - t * 0.4));
    g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang + t * 4);
    g.fillRect(-4 * size, -4 * size, 8 * size, 8 * size);
    g.restore();
  }
  g.lineStyle(3 * size, conc, a * (1 - t)); g.strokeCircle(f.x, f.y, s * (1 + t));
  g.lineStyle(1.6 * size, eye, a * (0.4 + 0.5 * Math.sin(t * 22))); g.strokeCircle(f.x, f.y, s * 0.7);
  g.fillStyle(eye, a * (0.5 + 0.5 * Math.sin(t * 30))); g.fillRect(f.x - 8 * size, f.y - 1.5 * size, 16 * size, 3 * size);
};

/** 血肉绽放：张开的血肉花瓣 + 血滴飞溅 */
export const keterBloom: EffectPainter = (g, f, t, a, size) => {
  const flesh = 0xa03030, dark = 0x6a1a1a, hi = 0xff5a5a, s = (9 + t * 15) * size;
  g.fillStyle(dark, a * 0.85); g.fillCircle(f.x, f.y, s * 0.9);
  for (let k = 0; k < 7; k++) {
    const ang = f.seed + (k / 7) * TAUf, rr = (8 + t * 40) * size, len = (18 + t * 14) * size;
    g.save(); g.translateCanvas(f.x, f.y); g.rotateCanvas(ang + t * 0.8);
    g.fillStyle(k % 2 ? flesh : 0xd05858, a * (1 - t * 0.3));
    g.fillEllipse(len * 0.5, 0, len, (10 - t * 3) * size);
    g.fillStyle(hi, a * 0.5); g.fillEllipse(len * 0.4, 0, len * 0.5, 4 * size);
    g.restore();
    g.fillStyle(hi, a * (1 - t)); g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 2 * size);
  }
  g.fillStyle(hi, a * (0.5 + 0.5 * Math.sin(t * 20))); g.fillCircle(f.x, f.y, s * 0.5);
  for (let k = 0; k < 10; k++) { const ang = f.seed + (k / 10) * TAUf + t * 2; const rr = (12 + t * 54) * size; g.fillStyle(k % 2 ? hi : flesh, a * (1 - t * 0.4)); g.fillEllipse(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 3 * size, 4 * size); }
};

/** 羞怯尖叫：惨白脸 + 同心声波环 + 飞沫 */
export const shyScream: EffectPainter = (g, f, t, a, size) => {
  const pale = 0xe8e8e0, cold = 0x6a7a8a, s = (8 + t * 12) * size;
  g.fillStyle(pale, a * (0.7 - t * 0.3)); g.fillEllipse(f.x, f.y, s * 1.2, s * 1.5);
  g.fillStyle(0x2a2028, a * (1 - t * 0.3)); g.fillEllipse(f.x, f.y + s * 0.2, s * 0.5, s * (0.4 + t * 0.8));
  for (let k = 0; k < 4; k++) { const ph = ((t + k * 0.25) % 1); const rr = s * 0.6 + ph * 60 * size; g.lineStyle((2 - k * 0.3) * size, k % 2 ? pale : cold, a * (1 - ph) * 0.8); g.strokeEllipse(f.x, f.y, rr * 1.4, rr); }
  for (let k = 0; k < 9; k++) { const ang = f.seed + (k / 9) * TAUf; const rr = (12 + t * 56) * size; g.fillStyle(pale, a * (1 - t * 0.4)); g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 2 * size); }
  g.fillStyle(cold, a * (0.4 + 0.4 * Math.sin(t * 26))); g.fillCircle(f.x, f.y, s * 0.4);
};

/** 夜行扑击：耙齿爪痕 + 暗影 + 红眼残影 */
export const rakePounce: EffectPainter = (g, f, t, a, size) => {
  const skin = 0x8a8070, claw = 0xd8d0c0, eye = 0xff3020, s = (9 + t * 13) * size;
  g.fillStyle(0x14100e, a * 0.7); g.fillCircle(f.x, f.y, s);
  for (let k = 0; k < 4; k++) {
    const off = (k - 1.5) * 9 * size;
    g.lineStyle(2.6 * size, k % 2 ? claw : skin, a * (1 - t * 0.3));
    g.beginPath(); g.moveTo(f.x - 30 * size + off, f.y - 30 * size); g.lineTo(f.x + 24 * size + off, f.y + 30 * size); g.strokePath();
  }
  g.fillStyle(eye, a * (0.6 + 0.4 * Math.sin(t * 24))); g.fillCircle(f.x - 8 * size, f.y - 6 * size, 3.5 * size); g.fillCircle(f.x + 8 * size, f.y - 6 * size, 3.5 * size);
  for (let k = 0; k < 8; k++) { const ang = f.seed + (k / 8) * TAUf + t * 3; const rr = (10 + t * 50) * size; g.fillStyle(skin, a * (1 - t * 0.4)); g.fillTriangle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, f.x + Math.cos(ang) * rr - 4 * size, f.y + Math.sin(ang) * rr + 5 * size, f.x + Math.cos(ang) * rr + 4 * size, f.y + Math.sin(ang) * rr + 5 * size); }
  g.lineStyle(2 * size, claw, a * (1 - t)); g.strokeCircle(f.x, f.y, s * 1.4);
};

/** 温迪戈嚎叫：朝 ang 方向的寒气锥 + 骷髅头 + 冰晶 */
export const wendiHowl: EffectPainter = (g, f, t, a, size) => {
  const flesh = 0x9a8060, bone = 0xe0d8c0, cold = 0xd8e8f0, s = (10 + t * 14) * size;
  g.fillStyle(flesh, a * (0.6 - t * 0.3)); g.fillCircle(f.x, f.y, s * 0.8);
  g.fillStyle(bone, a * (1 - t * 0.3)); g.fillEllipse(f.x, f.y, s * 0.7, s * 0.85);
  g.fillStyle(0x1a1410, a); g.fillEllipse(f.x - s * 0.2, f.y - s * 0.1, 3 * size, 3 * size); g.fillEllipse(f.x + s * 0.2, f.y - s * 0.1, 3 * size, 3 * size);
  for (let k = 0; k < 5; k++) {
    const spread = (k - 2) * 0.22, rr = (16 + t * 62) * size;
    g.fillStyle(cold, a * (1 - t * 0.5) * (0.7 - Math.abs(k - 2) * 0.1));
    g.fillEllipse(f.x + Math.cos(f.ang + spread) * rr, f.y + Math.sin(f.ang + spread) * rr, 12 * size, 6 * size);
  }
  for (let k = 0; k < 8; k++) { const ang = f.seed + (k / 8) * TAUf; const rr = (12 + t * 50) * size; g.fillStyle(bone, a * (1 - t)); g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang); g.fillTriangle(0, -4 * size, 2.4 * size, 3 * size, -2.4 * size, 3 * size); g.restore(); }
  g.lineStyle(2 * size, cold, a * (1 - t)); g.strokeCircle(f.x, f.y, s * 1.3);
};

/** 灾兆降临：蛾翼展开 + 红眼环 + 鳞粉飞散 */
export const mothmOmen: EffectPainter = (g, f, t, a, size) => {
  const fuzz = 0x7a5a3a, wing = 0xc0a078, eye = 0xff3a3a, s = (9 + t * 14) * size;
  g.fillStyle(fuzz, a * 0.8); g.fillCircle(f.x, f.y, s * 0.8);
  for (const side of [-1, 1]) {
    g.save(); g.translateCanvas(f.x, f.y); g.rotateCanvas(side * 0.5 + side * t * 0.6);
    g.fillStyle(fuzz, a * (1 - t * 0.3)); g.fillEllipse(side * s * 0.8, 0, s * 1.4, s * 0.9);
    g.fillStyle(wing, a * (1 - t * 0.3)); g.fillEllipse(side * s * 0.8, 0, s * 1.2, s * 0.7);
    g.fillStyle(eye, a * 0.5); g.fillCircle(side * s * 0.9, 0, 4 * size);
    g.restore();
  }
  g.lineStyle(2 * size, eye, a * (0.5 + 0.4 * Math.sin(t * 24))); g.strokeCircle(f.x, f.y, s * 1.2);
  for (let k = 0; k < 12; k++) { const ang = f.seed + (k / 12) * TAUf + t * 1.4; const rr = (12 + t * 58) * size; g.fillStyle(k % 2 ? wing : fuzz, a * (1 - t * 0.4)); g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, (1.8 + (k % 2)) * size); }
  g.fillStyle(eye, a * (1 - t)); g.fillCircle(f.x, f.y, s * 0.4);
};

/** 巨兽震击：地表裂缝 + 岩浆块 + 冲击波 */
export const gbeastQuake: EffectPainter = (g, f, t, a, size) => {
  const lava = 0x8a5a3a, body = 0x2a2422, spark = 0xffb347, s = (11 + t * 16) * size;
  g.fillStyle(body, a * 0.8); g.fillCircle(f.x, f.y, s * 0.95);
  g.fillStyle(lava, a * 0.85); g.fillCircle(f.x, f.y, s * 0.6);
  for (let k = 0; k < 6; k++) { const ang = f.seed + (k / 6) * TAUf; g.lineStyle((3 - t) * size, k % 2 ? spark : lava, a * (1 - t * 0.3)); g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(f.x + Math.cos(ang) * (20 + t * 50) * size, f.y + Math.sin(ang) * (14 + t * 30) * size); g.strokePath(); }
  for (let k = 0; k < 8; k++) { const ang = f.seed + (k / 8) * TAUf; const rr = (10 + t * 50) * size; g.fillStyle(k % 2 ? lava : body, a * (1 - t * 0.4)); g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang + t * 3); g.fillRect(-4 * size, -4 * size, 8 * size, 8 * size); g.restore(); }
  g.lineStyle(3 * size, spark, a * (1 - t)); g.strokeEllipse(f.x, f.y, s * (1.4 + t * 1.4), s * (0.7 + t * 0.6));
  g.fillStyle(spark, a * (0.5 + 0.5 * Math.sin(t * 20))); g.fillCircle(f.x, f.y, s * 0.4);
};

/** 骨爬吞噬：开合巨颚 + 利齿 + 骨屑 */
export const crawDevour: EffectPainter = (g, f, t, a, size) => {
  const scale = 0xc8a86a, dark = 0x4a2a1a, bone = 0xe0d0a0, s = (9 + t * 13) * size;
  g.fillStyle(dark, a * 0.85); g.fillCircle(f.x, f.y, s * 0.85);
  const gap = (1 - t) * 22 * size;
  g.fillStyle(scale, a * (1 - t * 0.3)); g.fillEllipse(f.x, f.y - gap - 6 * size, s * 1.4, s * 0.7);
  g.fillStyle(scale, a * (1 - t * 0.3)); g.fillEllipse(f.x, f.y + gap + 6 * size, s * 1.4, s * 0.7);
  g.fillStyle(0xffffff, a * (1 - t * 0.3));
  for (let k = 0; k < 6; k++) { const px = f.x - 24 * size + k * 9.6 * size; g.fillTriangle(px - 3 * size, f.y - gap - 2 * size, px + 3 * size, f.y - gap - 2 * size, px, f.y - gap + 8 * size); g.fillTriangle(px - 3 * size, f.y + gap + 2 * size, px + 3 * size, f.y + gap + 2 * size, px, f.y + gap - 8 * size); }
  for (let k = 0; k < 10; k++) { const ang = f.seed + (k / 10) * TAUf + t * 2; const rr = (12 + t * 52) * size; g.fillStyle(bone, a * (1 - t * 0.4)); g.fillRect(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 4 * size, 3 * size); }
  g.lineStyle(2 * size, scale, a * (1 - t)); g.strokeCircle(f.x, f.y, s * 1.3);
};

/** 核爆震击：甲壳爆裂 + 绿色辐射环 + 强光核 */
export const mutoBlast: EffectPainter = (g, f, t, a, size) => {
  const shell = 0x5a6a3a, dark = 0x39482a, core = 0x7dff5a, s = (10 + t * 16) * size;
  g.fillStyle(dark, a * 0.85); g.fillCircle(f.x, f.y, s);
  g.fillStyle(shell, a * 0.9); g.fillCircle(f.x, f.y, s * 0.7);
  g.fillStyle(core, a * (0.8 - t * 0.4)); g.fillCircle(f.x, f.y, s * (0.6 - t * 0.2));
  for (let k = 0; k < 8; k++) { const ang = f.seed + (k / 8) * TAUf; const rr = (10 + t * 52) * size; g.fillStyle(k % 2 ? shell : dark, a * (1 - t * 0.4)); g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang + t * 4); g.fillTriangle(-4 * size, 4 * size, 4 * size, 4 * size, 0, -5 * size); g.restore(); }
  for (let k = 0; k < 3; k++) { const rr = s * (0.8 + ((t + k * 0.33) % 1) * 1.8); const aa = a * (1 - ((t + k * 0.33) % 1)); g.lineStyle((2.4 - k * 0.5) * size, core, aa * 0.8); g.strokeCircle(f.x, f.y, rr); }
  g.fillStyle(0xffffff, a * (0.5 + 0.5 * Math.sin(t * 26))); g.fillCircle(f.x, f.y, s * 0.35);
};

/** 巨兽冲击：角撞星芒 + 碎石块 + 冲击环 + 尘土 */
export const beheImpact: EffectPainter = (g, f, t, a, size) => {
  const hide = 0x5a4030, hideD = 0x3a281c, horn = 0x8a6a4a, s = (11 + t * 15) * size;
  g.fillStyle(hideD, a * 0.85); g.fillCircle(f.x, f.y, s * 0.95);
  g.fillStyle(hide, a * 0.9); g.fillCircle(f.x, f.y, s * 0.6);
  for (let k = 0; k < 6; k++) { const ang = f.ang + (k - 2.5) * 0.5; g.lineStyle((3 - t) * size, k % 2 ? horn : hide, a * (1 - t * 0.3)); g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(f.x + Math.cos(ang) * (20 + t * 48) * size, f.y + Math.sin(ang) * (20 + t * 48) * size); g.strokePath(); }
  for (let k = 0; k < 9; k++) { const ang = f.seed + (k / 9) * TAUf; const rr = (10 + t * 52) * size; g.fillStyle(k % 2 ? hide : horn, a * (1 - t * 0.4)); g.save(); g.translateCanvas(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr); g.rotateCanvas(ang + t * 2); g.fillRect(-3.5 * size, -3.5 * size, 7 * size, 7 * size); g.restore(); }
  g.lineStyle(3 * size, horn, a * (1 - t)); g.strokeEllipse(f.x, f.y, s * (1.2 + t * 1.3), s * (0.8 + t * 0.7));
  g.fillStyle(horn, a * (0.5 + 0.5 * Math.sin(t * 18))); g.fillCircle(f.x, f.y, s * 0.4);
  for (let k = 0; k < 4; k++) { const ph = ((f.seed / 7 + k / 4 + t) % 1); g.fillStyle(hide, (1 - ph) * a * 0.5); g.fillCircle(f.x + Math.sin(k * 2) * 24 * size, f.y + ph * 20 * size, 3 * size); }
};
