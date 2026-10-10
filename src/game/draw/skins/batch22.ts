import { groundShadow, type SkinPainter } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第十一批主题形象（SCP 收容 / 恐怖怪物 / 巨兽）——逐款独立手绘，五层堆料 + 多组动效。 */

/** 眨眼：大部分时间睁开，偶尔压成一条缝 */
function blink(now: number, phase = 0): number {
  return Math.sin(now / 1400 + phase) > 0.9 ? 0.15 : 1;
}

/** 花生雕像（SCP-173）：钢筋水泥人形——被注视时静止、转开视线就瞬移，并闪警示线 */
export const scpStatue: SkinPainter = (g: G, now, pose) => {
  const { x: x0, feetY, facing: f } = pose;
  const conc = 0x8f9d8f, concD = 0x566156, concL = 0xbcc7ba, rebar = 0x8a5230, paint = 0xffd45c, danger = 0xd83a2a;
  groundShadow(g, pose, 58);
  const watched = Math.sin(now / 1500) > 0.72; // 被注视 → 静止
  const shift = watched ? 0 : Math.sin(now / 80) * 7 * (0.3 + Math.abs(Math.sin(now / 900))) * f;
  const x = x0 + shift;
  const topY = feetY - 112;
  // ① 底光 + 警示圈
  g.fillStyle(0x1c261c, 0.4); g.fillEllipse(x, feetY - 4, 56, 13);
  g.lineStyle(2, watched ? paint : danger, 0.2 + (watched ? 0.4 : 0.08)); g.strokeEllipse(x0, feetY - 54, watched ? 44 : 62, 106);
  // ② 主形：方柱双腿 + 脚
  for (const s of [-1, 1]) {
    g.fillStyle(concD, 1); g.fillRoundedRect(x + s * 16 - 8, topY + 64, 15, 46, 3);
    g.fillStyle(conc, 1); g.fillRoundedRect(x + s * 16 - 7, topY + 66, 13, 42, 3);
    g.fillStyle(concD, 1); g.fillRoundedRect(x + s * 16 - 10, feetY - 8, 20, 9, 3);
  }
  // 桶状躯干（略前倾）
  g.fillStyle(concD, 1); g.fillRoundedRect(x - 22, topY + 20, 44, 54, 10);
  g.fillStyle(conc, 1); g.fillRoundedRect(x - 19, topY + 22, 38, 50, 9);
  // ③ 质感：混凝土斑驳 / 裂缝 / 外露钢筋
  g.fillStyle(concL, 0.32); for (let k = 0; k < 12; k++) g.fillCircle(x - 16 + (k * 17 % 32), topY + 26 + (k * 13 % 44), 1 + (k % 3) * 0.6);
  g.lineStyle(1.2, 0x3a463a, 0.5); g.beginPath(); g.moveTo(x - 10, topY + 24); g.lineTo(x - 4, topY + 40); g.lineTo(x - 11, topY + 56); g.strokePath();
  g.beginPath(); g.moveTo(x + 8, topY + 30); g.lineTo(x + 3, topY + 46); g.strokePath();
  g.lineStyle(2, rebar, 0.9); g.lineBetween(x - 19, topY + 34, x - 26, topY + 30); g.lineBetween(x + 19, topY + 44, x + 26, topY + 40);
  // 交叉双臂 + 拳
  g.lineStyle(11, concD, 1); g.lineBetween(x - 18, topY + 32, x - 2, topY + 56); g.lineBetween(x + 18, topY + 32, x + 2, topY + 56);
  g.lineStyle(7, conc, 1); g.lineBetween(x - 16, topY + 33, x - 2, topY + 54); g.lineBetween(x + 16, topY + 33, x + 2, topY + 54);
  g.fillStyle(concD, 1); g.fillCircle(x - 3, topY + 55, 4.6); g.fillCircle(x + 3, topY + 55, 4.6);
  // ④ 高光：肩胸受光
  g.fillStyle(0xffffff, 0.16); g.fillEllipse(x - 8, topY + 30, 15, 30);
  // 无脸头 + 喷漆记号
  const hy = topY + 12;
  g.fillStyle(concD, 1); g.fillCircle(x, hy, 15); g.fillStyle(conc, 1); g.fillCircle(x, hy, 12.5);
  g.fillStyle(concL, 0.4); g.fillEllipse(x - 4, hy - 5, 8, 6);
  g.fillStyle(paint, watched ? 0.85 : 0.5); g.fillRect(x - 9, hy - 1, 18, 2);
  g.lineStyle(1.5, danger, 0.55); g.lineBetween(x + 4, hy - 6, x + 10, hy - 2); g.lineBetween(x + 10, hy - 2, x + 4, hy + 3);
  // ⑤ 环绕尘粒 + 瞬移残影
  for (let k = 0; k < 5; k++) { const q = ((now / 1300 + k / 5) % 1); g.fillStyle(concL, (1 - q) * 0.5); g.fillCircle(x - 28 + k * 14, feetY - 4 - q * 26, 1.4); }
  if (!watched) { g.fillStyle(conc, 0.12); g.fillRoundedRect(x - shift - 19, topY + 22, 38, 90, 9); }
};

/** 血肉聚合体：成堆蠕动的肉团 + 错相睁开的眼睛 + 开合肉口 + 搏动心脏 */
export const keterFlesh: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const flesh = 0xa03030, dark = 0x601818, hi = 0xff5a5a, pale = 0xd88a8a, vein = 0x8a1830;
  groundShadow(g, pose, 72);
  const topY = feetY - 102;
  // ① 血底光
  g.fillStyle(dark, 0.5); g.fillEllipse(x, feetY - 6, 74, 18);
  // ② 层层肉团（错相蠕动）
  const lumps: [number, number, number][] = [[0, 48, 40], [-24, 30, 23], [22, 34, 25], [0, 14, 28], [-16, 64, 19], [18, 64, 19], [0, 76, 22]];
  for (let i = 0; i < lumps.length; i++) {
    const [ox, oy, rr] = lumps[i], br = Math.sin(now / 420 + i * 1.3) * 3;
    g.fillStyle(dark, 1); g.fillEllipse(x + ox, topY + oy + br, rr * 2 + 4, rr * 2 + 4);
    g.fillStyle(flesh, 0.96); g.fillEllipse(x + ox, topY + oy + br, rr * 2, rr * 2);
    g.fillStyle(pale, 0.3); g.fillEllipse(x + ox - rr * 0.3, topY + oy - rr * 0.35 + br, rr, rr * 0.8);
  }
  // ③ 质感：血管网 + 搏动心脏
  g.lineStyle(1.6, vein, 0.6); for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(x - 26 + k * 13, topY + 16); g.lineTo(x - 20 + k * 13, topY + 48); g.lineTo(x - 26 + k * 13, topY + 78); g.strokePath(); }
  const beat = 1 + 0.14 * Math.sin(now / 260);
  g.fillStyle(0xd83a3a, 1); g.fillCircle(x + 4, topY + 52, 11 * beat);
  g.fillStyle(hi, 0.9); g.fillCircle(x + 4, topY + 52, 7 * beat);
  g.fillStyle(0xffffff, 0.5); g.fillCircle(x + 1, topY + 49, 2.6);
  // ④ 错相呼吸的眼睛（大小不一）
  for (let k = 0; k < 7; k++) {
    const ex = x - 30 + k * 10, ey = topY + 24 + (k % 3) * 16, sz = 3 + (k % 2) * 1.4;
    const open = 0.35 + 0.65 * Math.abs(Math.sin(now / 500 + k * 1.7));
    g.fillStyle(0xffe0e0, 1); g.fillEllipse(ex, ey, sz * 2, sz * 2 * open);
    g.fillStyle(0x201010, 1); g.fillEllipse(ex, ey, sz, sz * open);
    g.fillStyle(hi, 0.7); g.fillCircle(ex, ey, sz * 0.4 * open);
  }
  // ⑤ 开合肉口 + 环绕血雾
  for (let k = 0; k < 2; k++) {
    const mx = x + (k ? 18 : -16), my = topY + 70, open = 0.5 + 0.5 * Math.sin(now / 380 + k * 2.1);
    g.fillStyle(0x3a0a0a, 1); g.fillEllipse(mx, my, 17, 12 * open + 4);
    g.fillStyle(hi, 0.8); g.fillEllipse(mx, my, 13, 7 * open + 2);
    g.fillStyle(0xffffff, 0.8); for (let d = 0; d < 5; d++) g.fillTriangle(mx - 5 + d * 2.6, my - 2 * open, mx - 4 + d * 2.6, my + 2 * open, mx - 4.5 + d * 2.6, my);
  }
  for (let k = 0; k < 5; k++) { const q = ((now / 1500 + k / 5) % 1); g.fillStyle(hi, (1 - q) * 0.4); g.fillCircle(x - 32 + k * 16, feetY - q * 22, 3 + q * 2); }
};

/** 羞怯白猿（SCP-096）：惨白高瘦猿形，双臂垂地，受刺激时张口尖啸 */
export const shyGiant: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const fur = 0xe8e8e0, furD = 0xb4b4ac, shade = 0xcfcfc6, mouth = 0x3a1818, gum = 0x8a4a4a;
  groundShadow(g, pose, 66);
  const topY = feetY - 116, breathe = Math.sin(now / 520) * 2;
  const agi = Math.sin(now / 1100) > 0.6; // 暴走状态
  // ① 冷底光
  g.fillStyle(furD, 0.3); g.fillEllipse(x, feetY - 6, 62, 14);
  // ② 主形：细长身躯 + 极长双臂（垂地）
  const armSw = Math.sin(now / 320) * 4;
  for (const s of [-1, 1]) {
    g.lineStyle(12, furD, 1); g.beginPath(); g.moveTo(x + s * 18, topY + 26 + breathe); g.lineTo(x + s * 30, topY + 60); g.lineTo(x + s * (32 + (agi ? 2 : 0)), feetY - 8 - armSw * s); g.strokePath();
    g.lineStyle(8, fur, 1); g.beginPath(); g.moveTo(x + s * 17, topY + 26 + breathe); g.lineTo(x + s * 28, topY + 60); g.lineTo(x + s * 30, feetY - 10 - armSw * s); g.strokePath();
    g.fillStyle(furD, 1); g.fillCircle(x + s * 32, feetY - 6 - armSw * s, 4.5); // 手
  }
  g.fillStyle(furD, 1); g.fillRoundedRect(x - 22, topY + 28 + breathe, 44, 66, 14);
  g.fillStyle(fur, 1); g.fillRoundedRect(x - 19, topY + 30 + breathe, 38, 62, 13);
  // ③ 质感：肋骨 + 灰斑
  g.lineStyle(1.4, shade, 0.9); for (let k = 0; k < 4; k++) g.lineBetween(x - 12, topY + 46 + k * 10 + breathe, x + 12, topY + 44 + k * 10 + breathe);
  g.fillStyle(shade, 0.5); for (let k = 0; k < 5; k++) g.fillCircle(x - 12 + (k * 13 % 26), topY + 40 + (k * 17 % 44), 2);
  // ④ 高光 + 拉长的头 + 眼睛
  g.fillStyle(0xffffff, 0.3); g.fillEllipse(x, topY + 50 + breathe, 16, 30);
  const hy = topY + 14 + breathe;
  g.fillStyle(furD, 1); g.fillEllipse(x, hy, 16, 19); g.fillStyle(fur, 1); g.fillEllipse(x, hy, 13, 16);
  const eh = 3 * blink(now, 1);
  g.fillStyle(0x24242a, 1); g.fillEllipse(x - 5, hy - 2, 2.4, eh); g.fillEllipse(x + 5, hy - 2, 2.4, eh);
  g.fillStyle(0x24242a, 1); g.fillEllipse(x - 5, hy - 10, 1.4, 0.7); g.fillEllipse(x + 5, hy - 10, 1.4, 0.7); // 眉
  // ⑤ 张口尖啸 + 环绕惊惧飞絮
  const mo = agi ? 0.6 + 0.4 * Math.sin(now / 120) : 0.14;
  g.fillStyle(mouth, 1); g.fillEllipse(x, hy + 12, 13, 11 * mo + 2);
  g.fillStyle(gum, 0.9); g.fillEllipse(x, hy + 12 + 3 * mo, 11, 8 * mo + 1);
  g.fillStyle(0xffffff, 0.9); for (let d = 0; d < 5; d++) { g.fillTriangle(x - 6 + d * 3, hy + 7, x - 5 + d * 3, hy + 15 * mo + 7, x - 5.5 + d * 3, hy + 7); g.fillTriangle(x - 6 + d * 3, hy + 17 * mo + 8, x - 5 + d * 3, hy + 9, x - 5.5 + d * 3, hy + 17 * mo + 8); }
  for (let k = 0; k < 6; k++) { const q = ((now / 1400 + k / 6) % 1); g.fillStyle(furD, (1 - q) * 0.5); g.fillCircle(x - 30 + k * 12, topY + 4 - q * 28, 1.6); }
};

/** 耙齿长臂怪（The Rake）：灰白低伏四足怪，利爪如耙、暗处一对赤眼 */
export const rakeThing: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f } = pose;
  const skin = 0x8a8070, skinD = 0x564e44, skinL = 0xa89e8e, claw = 0xe4dccc, eye = 0xff3020;
  groundShadow(g, pose, 78);
  const topY = feetY - 66, breathe = Math.sin(now / 460) * 2;
  // ① 暗底光
  g.fillStyle(0x141210, 0.55); g.fillEllipse(x, feetY - 4, 82, 16);
  // ② 低伏躯干 + 背脊
  g.fillStyle(skinD, 1); g.fillEllipse(x - f * 2, topY + 32 + breathe, 64, 34);
  g.fillStyle(skin, 1); g.fillEllipse(x - f * 2, topY + 30 + breathe, 57, 29);
  g.fillStyle(skinL, 0.35); g.fillEllipse(x - f * 2 - f * 4, topY + 22 + breathe, 34, 12); // 背受光
  g.fillStyle(skinD, 1); for (let k = 0; k < 6; k++) { const bx = x - 26 + k * 11; g.fillTriangle(bx - 3, topY + 16 + breathe, bx + 3, topY + 16 + breathe, bx, topY + 2 + breathe); }
  // ③ 质感：皮褶
  g.lineStyle(1.4, skinD, 0.6); for (let k = 0; k < 3; k++) g.lineBetween(x - 22, topY + 30 + k * 8 + breathe, x + 18, topY + 28 + k * 8 + breathe);
  // ④ 长四肢 + 耙状利爪
  const stride = Math.sin(now / 250) * 7;
  const legSet: [number, number][] = [[-24, 1], [-12, -1], [14, 1], [24, -1]];
  for (const [lx, d] of legSet) { g.lineStyle(7, skinD, 1); g.beginPath(); g.moveTo(x + lx, topY + 42); g.lineTo(x + lx + d * stride, feetY - 4); g.strokePath(); g.fillStyle(claw, 1); for (let c2 = 0; c2 < 3; c2++) g.lineBetween(x + lx + d * stride - 4 + c2 * 3.4, feetY - 4, x + lx + d * stride - 4 + c2 * 3.4, feetY + 3); }
  // 长吻 + 耙齿
  const hx = x + f * 30, hy = topY + 32 + breathe;
  g.fillStyle(skinD, 1); g.fillEllipse(hx, hy, 34, 22); g.fillStyle(skin, 1); g.fillEllipse(hx, hy - 1, 30, 18);
  g.fillStyle(skinD, 1); g.fillTriangle(hx + f * 12, hy - 6, hx + f * 12, hy + 6, hx + f * 26, hy);
  g.lineStyle(2.4, claw, 1); for (let k = 0; k < 4; k++) g.lineBetween(hx + f * (15 + k * 1.6), hy + 6, hx + f * (19 + k * 1.6), hy + 16);
  g.fillStyle(eye, 0.85 + 0.15 * Math.sin(now / 200)); g.fillCircle(hx - f * 4, hy - 5, 3.4); g.fillCircle(hx + f * 4, hy - 5, 3.4);
  g.fillStyle(0xffffff, 0.7); g.fillCircle(hx - f * 4, hy - 6, 1.1); g.fillCircle(hx + f * 4, hy - 6, 1.1);
  // ⑤ 暗处窥视的眼睛环绕
  for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2 + now / 1800; const a2 = 0.25 + 0.75 * Math.abs(Math.sin(now / 300 + k)); g.fillStyle(eye, a2 * 0.85); g.fillCircle(x + Math.cos(ang) * 48, topY + 32 + Math.sin(ang) * 22, 1.8); }
};

/** 鹿首食人妖（温迪戈）：枯瘦人形 + 骷髅鹿头 + 分叉枯角，寒气环身 */
export const wendiStag: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const flesh = 0x9a8060, fleshD = 0x63503c, bone = 0xe6dfc8, cold = 0xd8e8f0, gut = 0x3a2a1e;
  groundShadow(g, pose, 62);
  const topY = feetY - 114, breathe = Math.sin(now / 500) * 2;
  // ① 寒气底光
  g.fillStyle(cold, 0.18); g.fillEllipse(x, feetY - 48, 74, 106);
  // ② 主形：驼背躯干 + 枯瘦四肢
  g.fillStyle(fleshD, 1); g.beginPath(); g.moveTo(x - 10, topY + 26 + breathe); g.lineTo(x + 14, topY + 30 + breathe); g.lineTo(x + 26, topY + 74 + breathe); g.lineTo(x - 24, topY + 74 + breathe); g.closePath(); g.fillPath();
  g.fillStyle(flesh, 1); g.beginPath(); g.moveTo(x - 8, topY + 29 + breathe); g.lineTo(x + 12, topY + 32 + breathe); g.lineTo(x + 22, topY + 72 + breathe); g.lineTo(x - 20, topY + 72 + breathe); g.closePath(); g.fillPath();
  const st = Math.sin(now / 300) * 3;
  g.lineStyle(8, fleshD, 1); g.lineBetween(x - 14, topY + 48 + breathe, x - 24, feetY - 6); g.lineBetween(x + 14, topY + 48 + breathe, x + 22, feetY - 6);
  g.lineStyle(5, flesh, 1); g.lineBetween(x - 13, topY + 48 + breathe, x - 22, feetY - 8); g.lineBetween(x + 13, topY + 48 + breathe, x + 20, feetY - 8);
  g.lineStyle(5, fleshD, 1); g.beginPath(); g.moveTo(x - 12, topY + 44 + breathe); g.lineTo(x - 30, topY + 58); g.lineTo(x - 34, topY + 74 + st); g.strokePath();
  g.beginPath(); g.moveTo(x + 12, topY + 44 + breathe); g.lineTo(x + 30, topY + 58); g.lineTo(x + 34, topY + 74 - st); g.strokePath();
  g.lineStyle(2, bone, 1); for (const s of [-1, 1]) for (let c2 = 0; c2 < 3; c2++) g.lineBetween(x + s * (32 + c2 * 3), topY + 74, x + s * (34 + c2 * 3), topY + 81);
  // ③ 质感：肋骨
  g.lineStyle(1.6, 0xcfc4a8, 0.85); for (let k = 0; k < 4; k++) g.lineBetween(x - 12, topY + 40 + k * 7 + breathe, x + 10, topY + 39 + k * 7 + breathe);
  // ④ 骷髅鹿头 + 分叉枯角
  const hy = topY + 16 + breathe;
  g.fillStyle(fleshD, 1); g.fillEllipse(x - 2, hy, 20, 24);
  g.fillStyle(bone, 1); g.fillEllipse(x - 6, hy, 15, 19); g.fillTriangle(x - 17, hy - 2, x - 28, hy + 11, x - 12, hy + 9);
  g.fillStyle(gut, 1); g.fillEllipse(x - 10, hy - 4, 5, 6); g.fillEllipse(x - 3, hy - 4, 5, 6);
  g.fillStyle(cold, 0.9); g.fillCircle(x - 10, hy - 4, 2); g.fillCircle(x - 3, hy - 4, 2);
  g.fillStyle(bone, 1); for (let k = 0; k < 4; k++) g.fillTriangle(x - 12 + k * 4, hy + 8, x - 10 + k * 4, hy + 8, x - 11 + k * 4, hy + 13);
  g.lineStyle(3, bone, 0.95);
  g.beginPath(); g.moveTo(x - 8, hy - 14); g.lineTo(x - 20, hy - 36); g.lineTo(x - 36, hy - 46); g.strokePath();
  g.lineBetween(x - 20, hy - 36, x - 16, hy - 52);
  g.beginPath(); g.moveTo(x - 8, hy - 14); g.lineTo(x - 2, hy - 44); g.lineTo(x + 4, hy - 60); g.strokePath();
  g.beginPath(); g.moveTo(x + 4, hy - 14); g.lineTo(x + 12, hy - 34); g.lineTo(x + 26, hy - 44); g.strokePath();
  // ⑤ 寒气环绕 + 冷焰
  for (let k = 0; k < 7; k++) { const q = ((now / 1600 + k / 7) % 1); g.fillStyle(cold, (1 - q) * 0.5); g.fillCircle(x - 32 + (k * 13 % 64), feetY - q * 66, 2 + q * 2); }
  const fl = Math.sin(now / 260) * 3;
  g.fillStyle(cold, 0.45); g.fillEllipse(x - 32, hy - 4 + fl, 9, 19); g.fillEllipse(x + 24, hy - 2 - fl, 9, 19);
};

/** 巨蛾预言者：真人大小的蛾人——巨大蛾翼半展、复眼泛红、羽状触须 */
export const mothmSeer: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const fuzz = 0x8a6a44, fuzzD = 0x4a3524, wing = 0xc0a078, wingD = 0x8a6a48, eye = 0xff3a3a;
  groundShadow(g, pose, 62);
  const topY = feetY - 112, breathe = Math.sin(now / 480) * 2;
  const flap = 0.35 + Math.abs(Math.sin(now / 500)) * 0.55;
  // ① 底光
  g.fillStyle(fuzzD, 0.35); g.fillEllipse(x, feetY - 52, 96, 96);
  // ② 巨大蛾翼（半展 + 眼斑 + 脉纹）
  for (const s of [-1, 1]) {
    g.save(); g.translateCanvas(x, topY + 44 + breathe); g.rotateCanvas(s * flap * 0.5);
    g.fillStyle(fuzzD, 1); g.fillEllipse(s * 40, 4, 88, 60);
    g.fillStyle(wing, 0.95); g.fillEllipse(s * 38, 5, 80, 52);
    g.fillStyle(wingD, 0.5); g.fillEllipse(s * 30, -6, 44, 26); // 上翼色块
    g.lineStyle(1.6, wingD, 0.6); for (let k = 0; k < 3; k++) g.lineBetween(s * 6, 6, s * (60 - k * 6), -18 + k * 16);
    g.fillStyle(fuzzD, 1); g.fillCircle(s * 48, 8, 11); g.fillStyle(eye, 0.6); g.fillCircle(s * 48, 8, 6); g.fillStyle(0xffffff, 0.5); g.fillCircle(s * 46, 6, 2.4);
    g.restore();
  }
  // ③ 毛绒身躯
  g.fillStyle(fuzzD, 1); g.fillRoundedRect(x - 16, topY + 26 + breathe, 32, 70, 14);
  g.fillStyle(fuzz, 1); g.fillRoundedRect(x - 13, topY + 28 + breathe, 26, 66, 12);
  g.lineStyle(2, fuzzD, 0.5); for (let r = 0; r < 7; r++) g.lineBetween(x - 12, topY + 36 + r * 9 + breathe, x + 12, topY + 35 + r * 9 + breathe);
  g.fillStyle(0xffffff, 0.14); g.fillEllipse(x - 5, topY + 40 + breathe, 10, 30);
  // ④ 头 + 复眼 + 口器
  const hy = topY + 14 + breathe;
  g.fillStyle(fuzzD, 1); g.fillCircle(x, hy, 15); g.fillStyle(fuzz, 1); g.fillCircle(x, hy, 12);
  g.fillStyle(eye, 0.95); g.fillEllipse(x - 6, hy - 1, 11, 9); g.fillEllipse(x + 6, hy - 1, 11, 9);
  for (const ex of [x - 6, x + 6]) { g.fillStyle(0x2a0a0a, 0.85); for (let k = 0; k < 5; k++) g.fillCircle(ex - 3 + (k % 2) * 6, hy - 4 + Math.floor(k / 2) * 6, 1.3); }
  g.fillStyle(fuzzD, 1); g.fillCircle(x, hy + 9, 4); g.fillStyle(fuzz, 1); g.fillCircle(x, hy + 9, 2.4);
  // ⑤ 羽状触须 + 鳞粉
  const ant = Math.sin(now / 600) * 4;
  for (const s of [-1, 1]) {
    g.lineStyle(2, fuzz, 1); g.beginPath(); g.moveTo(x + s * 6, hy - 10); g.lineTo(x + s * 16, hy - 26 + ant); g.lineTo(x + s * 24, hy - 42 + ant * 1.5); g.strokePath();
    for (let k = 0; k < 4; k++) g.lineBetween(x + s * (8 + k * 4), hy - 14 - k * 8 + ant, x + s * (14 + k * 4), hy - 20 - k * 8 + ant);
  }
  for (let k = 0; k < 7; k++) { const q = ((now / 1500 + k / 7) % 1); g.fillStyle(wing, (1 - q) * 0.6); g.fillCircle(x - 36 + (k * 17 % 72), feetY - q * 62, 1.6); }
};

/** 熔岩巨猿：庞然黑猿——裂出熔岩的背脊、冒火的巨拳、落地震尘 */
export const gbeastPrime: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const body = 0x2a2422, bodyD = 0x141010, bodyL = 0x463a34, lava = 0x8a5a3a, spark = 0xffb347;
  groundShadow(g, pose, 86);
  const topY = feetY - 118, breathe = Math.sin(now / 420) * 3;
  // ① 底部熔岩光
  g.fillStyle(lava, 0.22); g.fillEllipse(x, feetY - 4, 96, 22);
  // ② 粗腿 + 宽肩躯干
  for (const s of [-1, 1]) {
    g.fillStyle(bodyD, 1); g.fillRoundedRect(x + s * 30 - 14, topY + 62, 28, 54, 10);
    g.fillStyle(body, 1); g.fillRoundedRect(x + s * 30 - 12, topY + 60, 24, 52, 9);
    g.fillStyle(bodyD, 1); g.fillRoundedRect(x + s * 30 - 16, feetY - 8, 34, 10, 4);
  }
  g.fillStyle(bodyD, 1); g.fillRoundedRect(x - 40, topY + 22 + breathe, 80, 60, 22);
  g.fillStyle(body, 1); g.fillRoundedRect(x - 37, topY + 24 + breathe, 74, 56, 21);
  g.fillStyle(bodyL, 0.4); g.fillEllipse(x - 10, topY + 36 + breathe, 34, 26); // 胸受光
  // ③ 背脊熔岩纹 + 熔核
  g.lineStyle(3, lava, 0.95); g.beginPath(); g.moveTo(x - 6, topY + 24 + breathe); g.lineTo(x + 3, topY + 42 + breathe); g.lineTo(x - 6, topY + 58 + breathe); g.strokePath();
  g.lineStyle(2, spark, 0.85); g.beginPath(); g.moveTo(x + 7, topY + 28 + breathe); g.lineTo(x + 13, topY + 44 + breathe); g.lineTo(x + 6, topY + 60 + breathe); g.strokePath();
  g.fillStyle(spark, 0.5 + 0.4 * Math.sin(now / 300)); g.fillCircle(x, topY + 40 + breathe, 4.5);
  // ④ 长臂 + 冒火巨拳
  const pump = Math.sin(now / 380) * 6;
  for (const s of [-1, 1]) {
    g.lineStyle(17, bodyD, 1); g.beginPath(); g.moveTo(x + s * 32, topY + 32 + breathe); g.lineTo(x + s * 42, topY + 60); g.lineTo(x + s * 46, topY + (s < 0 ? 80 : 78) + (s < 0 ? -pump : pump)); g.strokePath();
    g.lineStyle(10, body, 1); g.beginPath(); g.moveTo(x + s * 32, topY + 33 + breathe); g.lineTo(x + s * 41, topY + 60); g.lineTo(x + s * 44, topY + (s < 0 ? 79 : 77) + (s < 0 ? -pump : pump)); g.strokePath();
    const fx = x + s * 45, fy = topY + (s < 0 ? 82 - pump : 80 + pump);
    g.fillStyle(bodyD, 1); g.fillCircle(fx, fy, 15); g.fillStyle(body, 1); g.fillCircle(fx, fy, 12.5);
    for (let k = 0; k < 4; k++) { const q = ((now / 500 + k / 4) % 1); g.fillStyle(k % 2 ? spark : lava, (1 - q) * 0.9); g.fillCircle(fx + Math.sin(k * 2) * 8, fy - q * 20, 2 + q * 2); }
  }
  // ⑤ 低垂头 + 环绕火星烟尘
  const hy = topY + 14 + breathe;
  g.fillStyle(bodyD, 1); g.fillCircle(x, hy, 21); g.fillStyle(body, 1); g.fillCircle(x, hy, 18);
  g.fillStyle(bodyL, 0.3); g.fillEllipse(x - 6, hy - 6, 12, 8);
  g.fillStyle(bodyD, 1); g.fillEllipse(x, hy + 13, 30, 14); // 下颚
  g.fillStyle(spark, 0.9); g.fillCircle(x - 8, hy - 2, 3); g.fillCircle(x + 8, hy - 2, 3);
  g.fillStyle(0xffffff, 0.8); g.fillCircle(x - 9, hy - 3, 1.1); g.fillCircle(x + 7, hy - 3, 1.1);
  for (let k = 0; k < 6; k++) { const q = ((now / 1300 + k / 6) % 1); g.fillStyle(spark, (1 - q) * 0.7); g.fillCircle(x - 42 + (k * 23 % 84), feetY - 20 - q * 54, 1.8); }
  g.fillStyle(bodyD, 0.2); g.fillEllipse(x - 30, feetY - 2, 26, 6); g.fillEllipse(x + 30, feetY - 2, 26, 6);
};

/** 骨爬巨龙（骷髅爬行者）：低伏长尾、长吻利齿、背棘、四足疾走 */
export const crawCrawler: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f } = pose;
  const scale = 0xc8a86a, scaleD = 0x8a6a3a, bone = 0xe8d8ac, dark = 0x4a2a1a, eye = 0xffb347;
  groundShadow(g, pose, 90);
  const topY = feetY - 60, breathe = Math.sin(now / 440) * 2;
  // ① 底光
  g.fillStyle(dark, 0.5); g.fillEllipse(x, feetY - 4, 92, 16);
  // ② 长尾（带棘）
  const tail = Math.sin(now / 400) * 10;
  g.lineStyle(11, scaleD, 1); g.beginPath(); g.moveTo(x - 10, topY + 40); g.lineTo(x - 42, topY + 44); g.lineTo(x - 68, topY + 36 + tail); g.lineTo(x - 92, topY + 28 + tail * 1.4); g.strokePath();
  g.lineStyle(6, scale, 1); g.beginPath(); g.moveTo(x - 10, topY + 40); g.lineTo(x - 42, topY + 44); g.lineTo(x - 68, topY + 36 + tail); g.strokePath();
  g.fillStyle(bone, 1); for (let k = 0; k < 4; k++) { const tx = x - 40 - k * 16, ty = topY + 40 + (k < 2 ? 2 : -2 + tail * 0.4); g.fillTriangle(tx - 2, ty, tx + 2, ty, tx, ty - 8); }
  // ③ 低伏躯干 + 背棘
  g.fillStyle(scaleD, 1); g.fillEllipse(x - 6, topY + 34 + breathe, 70, 36);
  g.fillStyle(scale, 1); g.fillEllipse(x - 6, topY + 32 + breathe, 64, 31);
  g.fillStyle(bone, 1); for (let k = 0; k < 6; k++) { const bx = x - 34 + k * 12; g.fillTriangle(bx - 3, topY + 22 + breathe, bx + 3, topY + 22 + breathe, bx, topY + 4 + breathe); }
  // ④ 四足（疾走）
  const stride = Math.sin(now / 240) * 8;
  const legs: [number, number][] = [[-28, 1], [-12, -1], [22, 1], [10, -1]];
  for (const [lx, d] of legs) { g.lineStyle(8, scaleD, 1); g.beginPath(); g.moveTo(x + lx, topY + 44); g.lineTo(x + lx + d * stride, feetY - 6); g.strokePath(); g.fillStyle(bone, 1); for (let c2 = 0; c2 < 3; c2++) g.lineBetween(x + lx + d * stride - 5 + c2 * 4, feetY - 6, x + lx + d * stride - 5 + c2 * 4, feetY + 2); }
  // 长吻头骨 + 连环利齿
  const hx = x + f * 36, hy = topY + 34 + breathe;
  g.fillStyle(scaleD, 1); g.fillEllipse(hx, hy, 38, 20); g.fillStyle(bone, 1); g.fillEllipse(hx + f * 4, hy, 32, 16);
  g.fillStyle(scaleD, 1); g.fillTriangle(hx + f * 14, hy - 5, hx + f * 14, hy + 5, hx + f * 30, hy + 1);
  g.fillStyle(0xffffff, 0.95); for (let k = 0; k < 7; k++) g.fillTriangle(hx - f * 8 + f * k * 5, hy + 6, hx - f * 6 + f * k * 5, hy + 6, hx - f * 7 + f * k * 5, hy + 14);
  g.fillStyle(eye, 0.9); g.fillCircle(hx - f * 6, hy - 6, 2.8);
  // ⑤ 环绕骨屑 / 尘埃
  for (let k = 0; k < 6; k++) { const q = ((now / 1400 + k / 6) % 1); g.fillStyle(bone, (1 - q) * 0.55); g.fillCircle(x - 44 + (k * 21 % 84), topY + 18 - q * 34, 1.8); }
};

/** 双足巨虫（MUTO）：甲壳分节、发光绿核、巨螯、复眼 */
export const mutoQueen: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const shell = 0x5a6a3a, shellD = 0x35452a, core = 0x7dff5a, bone = 0xc8d0a0;
  groundShadow(g, pose, 64);
  const topY = feetY - 116, breathe = Math.sin(now / 460) * 2;
  // ① 绿核底光
  g.fillStyle(core, 0.18); g.fillEllipse(x, topY + 54, 66, 78);
  // ② 双足 + 甲壳躯干
  for (const s of [-1, 1]) {
    g.lineStyle(12, shellD, 1); g.beginPath(); g.moveTo(x + s * 12, topY + 68); g.lineTo(x + s * 16, topY + 90); g.lineTo(x + s * 24, feetY - 4); g.strokePath();
    g.lineStyle(7, shell, 1); g.beginPath(); g.moveTo(x + s * 12, topY + 68); g.lineTo(x + s * 16, topY + 90); g.lineTo(x + s * 22, feetY - 6); g.strokePath();
    g.fillStyle(shellD, 1); g.fillEllipse(x + s * 24, feetY - 2, 16, 8);
  }
  g.fillStyle(shellD, 1); g.fillRoundedRect(x - 26, topY + 24 + breathe, 52, 48, 14);
  g.fillStyle(shell, 1); g.fillRoundedRect(x - 23, topY + 26 + breathe, 46, 44, 13);
  // ③ 甲壳分节 + 发光核
  g.lineStyle(1.6, shellD, 0.7); for (let r = 0; r < 5; r++) g.lineBetween(x - 22, topY + 34 + r * 9 + breathe, x + 22, topY + 33 + r * 9 + breathe);
  const pulse = 0.6 + 0.4 * Math.sin(now / 260);
  g.fillStyle(core, 0.4 * pulse); g.fillCircle(x, topY + 48 + breathe, 17);
  g.fillStyle(core, 0.9); g.fillCircle(x, topY + 48 + breathe, 9.5);
  g.fillStyle(0xffffff, 0.75); g.fillCircle(x, topY + 48 + breathe, 3.6);
  // ④ 头 + 复眼 + 口器
  const hy = topY + 12 + breathe;
  g.fillStyle(shellD, 1); g.fillEllipse(x, hy, 30, 24); g.fillStyle(shell, 1); g.fillEllipse(x, hy - 1, 26, 20);
  g.fillStyle(core, 0.9); g.fillEllipse(x - 8, hy - 3, 9, 8); g.fillEllipse(x + 8, hy - 3, 9, 8);
  g.fillStyle(0x1a2a10, 1); g.fillCircle(x - 8, hy - 3, 2.2); g.fillCircle(x + 8, hy - 3, 2.2);
  for (const s of [-1, 1]) { g.fillStyle(bone, 1); g.beginPath(); g.moveTo(x + s * 6, hy + 12); g.lineTo(x + s * 16, hy + 18 + Math.sin(now / 300) * 2); g.lineTo(x + s * 4, hy + 16); g.strokePath(); }
  // ⑤ 巨螯（开合）+ 环绕孢子
  const open = 0.5 + 0.5 * Math.sin(now / 320);
  for (const s of [-1, 1]) {
    g.lineStyle(8, shellD, 1); g.beginPath(); g.moveTo(x + s * 22, topY + 34 + breathe); g.lineTo(x + s * 42, topY + 46); g.lineTo(x + s * 54, topY + 38 - open * 8); g.strokePath();
    g.fillStyle(shell, 1); g.fillEllipse(x + s * 50, topY + 40, 22, 16);
    g.fillStyle(bone, 1); g.fillTriangle(x + s * 58, topY + 40 + open * 6, x + s * 68, topY + 30 - open * 6, x + s * 54, topY + 34);
    g.lineStyle(2, core, 0.7); g.lineBetween(x + s * 44, topY + 42, x + s * 58, topY + 38 - open * 4);
  }
  for (let k = 0; k < 6; k++) { const q = ((now / 1400 + k / 6) % 1); g.fillStyle(core, (1 - q) * 0.6); g.fillCircle(x - 34 + (k * 19 % 68), feetY - q * 50, 1.6); }
};

/** 尖角巨兽（贝希摩斯）：厚皮装甲巨兽——鼻角 + 侧角、装甲板块、扫尾 */
export const beheTitan: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const hide = 0x5a4030, hideD = 0x39271b, plate = 0x6a5040, horn = 0x9a7a54, hornL = 0xc8b088;
  groundShadow(g, pose, 86);
  const topY = feetY - 112, breathe = Math.sin(now / 440) * 2.6;
  // ① 底光
  g.fillStyle(hideD, 0.5); g.fillEllipse(x, feetY - 4, 92, 18);
  // ② 粗腿 + 扫尾
  const tail = Math.sin(now / 430) * 8;
  g.lineStyle(12, hideD, 1); g.beginPath(); g.moveTo(x - 12, topY + 76); g.lineTo(x - 46, topY + 84); g.lineTo(x - 72, topY + 72 + tail); g.strokePath();
  g.lineStyle(6, hide, 1); g.beginPath(); g.moveTo(x - 12, topY + 76); g.lineTo(x - 46, topY + 84); g.lineTo(x - 70, topY + 74 + tail); g.strokePath();
  for (const s of [-1, 1]) {
    g.fillStyle(hideD, 1); g.fillRoundedRect(x + s * 26 - 15, topY + 60, 30, 54, 8);
    g.fillStyle(hide, 1); g.fillRoundedRect(x + s * 26 - 13, topY + 58, 26, 52, 8);
    g.fillStyle(plate, 1); g.fillRoundedRect(x + s * 26 - 11, topY + 82, 22, 10, 4);
  }
  // ③ 厚重躯干 + 装甲板块
  g.fillStyle(hideD, 1); g.fillRoundedRect(x - 32, topY + 18 + breathe, 64, 64, 16);
  g.fillStyle(hide, 1); g.fillRoundedRect(x - 29, topY + 20 + breathe, 58, 60, 15);
  g.fillStyle(plate, 1); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { g.fillRoundedRect(x - 23 + c * 16, topY + 26 + r * 17 + breathe, 12, 12, 3); }
  g.fillStyle(hornL, 0.2); g.fillEllipse(x - 10, topY + 30 + breathe, 26, 20);
  // ④ 头 + 鼻角 + 侧角 + 眼
  const hy = topY + 8 + breathe;
  g.fillStyle(hideD, 1); g.fillRoundedRect(x - 23, hy - 9, 46, 36, 12);
  g.fillStyle(hide, 1); g.fillRoundedRect(x - 20, hy - 7, 40, 32, 11);
  g.fillStyle(hideD, 1); g.fillEllipse(x, hy + 22, 30, 12);
  g.fillStyle(horn, 1); g.fillTriangle(x - 5, hy + 12, x + 5, hy + 12, x, hy + 34);
  g.fillStyle(hornL, 0.5); g.fillTriangle(x - 3, hy + 12, x, hy + 12, x - 1, hy + 26);
  g.fillStyle(horn, 1); g.fillTriangle(x - 22, hy - 4, x - 8, hy - 12, x - 10, hy + 8); g.fillTriangle(x + 22, hy - 4, x + 8, hy - 12, x + 10, hy + 8);
  g.fillStyle(0x1a1008, 1); g.fillEllipse(x - 9, hy + 5, 4, 4); g.fillEllipse(x + 9, hy + 5, 4, 4);
  g.fillStyle(0xffb347, 0.85); g.fillCircle(x - 9, hy + 5, 1.4); g.fillCircle(x + 9, hy + 5, 1.4);
  g.fillStyle(0xffffff, 0.9); g.fillTriangle(x - 8, hy + 26, x - 4, hy + 26, x - 6, hy + 33); g.fillTriangle(x + 8, hy + 26, x + 4, hy + 26, x + 6, hy + 33); // 獠牙
  // ⑤ 环绕尘土
  for (let k = 0; k < 6; k++) { const q = ((now / 1500 + k / 6) % 1); g.fillStyle(horn, (1 - q) * 0.5); g.fillCircle(x - 40 + (k * 19 % 76), topY + 6 - q * 26, 2 + q * 2); }
  for (let k = 0; k < 4; k++) { const q = ((now / 1200 + k / 4) % 1); g.fillStyle(hideD, 0.3); g.fillEllipse(x - 34 + k * 24, feetY - q * 12, 14 + q * 10, 5); }
};
