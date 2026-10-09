import { groundShadow, type SkinPainter } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第七批 5★ 宇宙科幻皮肤：纳米女皇 / 超级AI·棱镜 / 跃迁领航员 / 火星开拓者 / 先行者守卫 */

/** 纳米女皇：银蓝半透明人形，体表纳米格流动重组，破损处粒子重组 */
export const nanoQueen: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, move } = pose;
  const blue = 0x7fe8ff, mint = 0x39ffd0, deep = 0x123048;
  groundShadow(g, pose, 62);
  const topY = feetY - 112;
  const breathe = Math.sin(now / 500) * 2;
  const step = Math.sin(now / 300) * (move ?? 0);
  // 脚底解构微粒
  for (let k = 0; k < 8; k++) { const ph = ((now / 800 + k / 8) % 1); g.fillStyle(mint, (1 - ph) * 0.6); g.fillRect(x - 24 + (k * 7 % 48), feetY - ph * 12, 3, 3); }
  // 腿 + 躯干（半透明分层）
  g.fillStyle(deep, 0.5); g.fillRoundedRect(x - 18 + step, feetY - 36, 14, 34, 6); g.fillRoundedRect(x + 4 + step, feetY - 36, 14, 34, 6);
  g.fillStyle(blue, 0.55); g.fillRoundedRect(x - 20, topY + 44 + breathe, 40, 34, 10);
  g.fillStyle(blue, 0.7); g.fillCircle(x, topY + 28 + breathe, 15);
  g.fillRect(x - 14, topY + 28 + breathe, 28, 24);
  // 体表纳米格（相位流动）
  for (let r = 0; r < 5; r++) { for (let c = 0; c < 5; c++) { const px = x - 12 + c * 6, py = topY + 48 + r * 6 + breathe; const on = 0.4 + 0.6 * Math.max(0, Math.sin(now / 300 + r * 0.7 + c * 0.5)); g.lineStyle(1, mint, 0.3 + 0.4 * on); g.strokeRect(px, py, 5, 5); } }
  // 手臂
  g.lineStyle(7, blue, 0.6); g.lineBetween(x - 16, topY + 50 + breathe, x - 28, topY + 76);
  g.lineStyle(7, blue, 0.6); g.lineBetween(x + 16, topY + 50 + breathe, x + 28, topY + 78);
  // 破损处粒子
  for (let k = 0; k < 6; k++) { const ph = ((now / 700 + k / 6) % 1); g.fillStyle(mint, (1 - ph) * 0.8); g.fillCircle(x + Math.sin(k * 2.1) * 22, topY + 60 + Math.cos(k * 1.7) * 20, 1.6); }
  // 头 + 冠
  const hy = topY + 12 + breathe;
  g.fillStyle(blue, 0.8); g.fillCircle(x, hy, 12);
  g.fillStyle(0xffffff, 0.5); g.fillCircle(x - 3, hy - 3, 4);
  for (let k = 0; k < 5; k++) { const off = Math.sin(now / 400 + k) * 2; g.fillStyle(k % 2 ? mint : blue, 0.95); g.fillRect(x - 10 + k * 5 - 2, hy - 20 + off, 4, 4); }
  // 纳米符文环
  for (let k = 0; k < 10; k++) { const ang = (k / 10) * Math.PI * 2 + now / 1400; g.fillStyle(k % 2 ? mint : blue, 0.7); g.fillCircle(x + Math.cos(ang) * 44, topY + 46 + Math.sin(ang) * 44, 1.6); }
  void step;
};

/** 超级AI·棱镜：悬空棱晶体人形，代码雨滚动、三眼错相、全息 UI 环 */
export const dataPrism: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const green = 0x4affc4, blue = 0x7fb8ff, dark = 0x0a1a1e;
  groundShadow(g, pose, 56);
  const topY = feetY - 116;
  const bob = Math.sin(now / 460) * 4;
  // 悬空（脚下断开）
  g.fillStyle(0x000000, 0.15); g.fillEllipse(x, feetY + 2, 44, 9);
  const base = feetY - 14 + bob;
  // 棱晶体躯干
  g.fillStyle(dark, 0.9);
  g.fillPoints([{ x: x - 20, y: base - 24 }, { x: x + 20, y: base - 24 }, { x: x + 26, y: base }, { x: x, y: base + 16 }, { x: x - 26, y: base }] as never, true);
  g.fillStyle(green, 0.35);
  g.fillPoints([{ x: x - 16, y: base - 22 }, { x: x + 16, y: base - 22 }, { x: x + 20, y: base }, { x: x, y: base + 11 }, { x: x - 20, y: base }] as never, true);
  g.lineStyle(1.6, green, 0.7);
  g.lineBetween(x, base - 22, x, base + 11); g.lineBetween(x - 16, base - 22, x, base + 11); g.lineBetween(x + 16, base - 22, x, base + 11);
  // 代码雨
  for (let k = 0; k < 8; k++) { const ph = ((now / 900 + k / 8) % 1); g.fillStyle(k % 2 ? blue : green, 0.6 * (1 - ph)); g.fillRect(x - 16 + (k * 5 % 32), base - 20 + ph * 34, 2.4, 6); }
  // 三只扫描眼
  for (let k = -1; k <= 1; k++) { const ex = x + k * 11, ey = base - 34 - Math.abs(k) * 2; const on = 0.5 + 0.5 * Math.sin(now / 300 + k * 1.6); g.fillStyle(dark, 1); g.fillEllipse(ex, ey, 8, 6); g.fillStyle(on > 0.4 ? 0xffffff : green, on); g.fillCircle(ex, ey, 2.6); }
  // 棱晶头
  g.fillStyle(green, 0.4); g.fillPoints([{ x: x - 12, y: base - 42 }, { x: x, y: base - 64 }, { x: x + 12, y: base - 42 }, { x, y: base - 30 }] as never, true);
  g.lineStyle(1.6, blue, 0.8); g.lineBetween(x - 12, base - 42, x, base - 30); g.lineBetween(x + 12, base - 42, x, base - 30); g.lineBetween(x - 12, base - 42, x + 12, base - 42);
  // 全息 UI 环
  for (let k = 0; k < 8; k++) { const ang = (k / 8) * Math.PI * 2 + now / 1600; g.fillStyle(k % 2 ? green : blue, 0.6); g.fillRect(x + Math.cos(ang) * 40 - 2, base - 30 + Math.sin(ang) * 40 - 2, 4, 4); }
  void topY;
};

/** 跃迁领航员：宇航服领航员，面罩流星空、身周星门碎片、背后引力透镜光环 */
export const warpPilot: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f, move } = pose;
  const suit = 0xd8e0e8, dark = 0x1a2450, star = 0x9fd8ff, purple = 0xa98cff;
  groundShadow(g, pose, 60);
  const topY = feetY - 110;
  const breathe = Math.sin(now / 520) * 2;
  const step = Math.sin(now / 300) * (move ?? 0);
  // 脚下星轨
  for (let k = 0; k < 8; k++) { const ang = (k / 8) * Math.PI * 2 + now / 1600; g.fillStyle(k % 2 ? star : purple, 0.6); g.fillRect(x + Math.cos(ang) * 26 - 4, feetY - 3 + Math.sin(ang) * 7 - 1, 8, 2); }
  // 引力透镜光环（背后）
  for (let k = 0; k < 3; k++) { g.lineStyle(2.4 - k * 0.5, k % 2 ? purple : star, 0.4 - k * 0.08); g.save(); g.translateCanvas(x, topY + 44); g.scaleCanvas(1, 0.7); g.beginPath(); g.arc(0, 0, 44 + k * 9, 0, Math.PI * 2); g.strokePath(); g.restore(); }
  // 腿 + 躯干
  g.fillStyle(dark, 1); g.fillRoundedRect(x - 16 + step, feetY - 34, 14, 32, 5); g.fillRoundedRect(x + 2 + step, feetY - 34, 14, 32, 5);
  g.fillStyle(suit, 1); g.fillRoundedRect(x - 20, topY + 44 + breathe, 40, 34, 9);
  g.fillStyle(0x9aa8b8, 0.8); g.fillRect(x - 18, topY + 60 + breathe, 36, 3);
  g.fillStyle(star, 0.5); g.fillCircle(x, topY + 58 + breathe, 5);
  // 手臂
  g.lineStyle(8, suit, 1); g.lineBetween(x - 16, topY + 50 + breathe, x - 28, topY + 78);
  g.lineStyle(8, suit, 1); g.lineBetween(x + 16, topY + 50 + breathe, x + 28, topY + 80);
  // 头盔 + 面罩
  const hy = topY + 20 + breathe;
  g.fillStyle(suit, 1); g.fillCircle(x, hy, 15);
  g.fillStyle(dark, 1); g.fillEllipse(x, hy, 22, 17);
  for (let k = 0; k < 6; k++) { const ang = now / 400 + k * 1.2, rr = (k % 3) * 4; g.fillStyle(0xffffff, 0.5 + 0.5 * Math.sin(now / 200 + k)); g.fillCircle(x + Math.cos(ang) * rr, hy + Math.sin(ang) * rr * 0.7, 1.2); }
  g.fillStyle(purple, 0.4); g.fillEllipse(x, hy, 16, 8);
  // 星门碎片
  for (let k = 0; k < 5; k++) { const ang = (k / 5) * Math.PI * 2 + now / 1200; g.fillStyle(k % 2 ? star : purple, 0.85); g.fillPoints([{ x: x + Math.cos(ang) * 40, y: topY + 44 + Math.sin(ang) * 40 }, { x: x + Math.cos(ang + 0.3) * 46, y: topY + 44 + Math.sin(ang + 0.3) * 46 }, { x: x + Math.cos(ang + 0.6) * 40, y: topY + 44 + Math.sin(ang + 0.6) * 40 }] as never, true); }
  void f;
};

/** 火星开拓者：红色增压服 + 穹顶头盔 + 呼吸背包白汽 + 探测杖 + 火星与卫星 */
export const marsPioneer: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f, move } = pose;
  const suit = 0xc0462a, suitD = 0x8a2e1a, dome = 0xb8d8e8, plant = 0x8fd45a, metal = 0xd8e0e8;
  groundShadow(g, pose, 66);
  const topY = feetY - 108;
  const breathe = Math.sin(now / 520) * 2;
  const step = Math.sin(now / 300) * (move ?? 0);
  // 红土地面
  g.fillStyle(0x5a2418, 0.6); g.fillEllipse(x, feetY + 2, 60, 12);
  // 火星 + 卫星（身后）
  const mpx = x - 34 * f, mpy = topY + 30;
  g.fillStyle(0xc0462a, 0.9); g.fillCircle(mpx, mpy, 14);
  g.fillStyle(0x8a2e1a, 0.5); g.fillCircle(mpx - 4, mpy + 3, 5);
  for (let k = 0; k < 2; k++) { const ang = now / 900 + k * Math.PI; g.fillStyle(0xd8d0c0, 0.9); g.fillCircle(mpx + Math.cos(ang) * 22, mpy + Math.sin(ang) * 12, 2.4); }
  // 腿 + 躯干
  g.fillStyle(suitD, 1); g.fillRoundedRect(x - 16 + step, feetY - 34, 14, 32, 5); g.fillRoundedRect(x + 2 + step, feetY - 34, 14, 32, 5);
  g.fillStyle(suit, 1); g.fillRoundedRect(x - 20, topY + 44 + breathe, 40, 34, 9);
  g.fillStyle(metal, 0.7); g.fillRect(x - 18, topY + 62 + breathe, 36, 3);
  g.fillStyle(0xffb08a, 0.6); g.fillCircle(x, topY + 56 + breathe, 5);
  // 呼吸背包 + 白汽
  g.fillStyle(metal, 1); g.fillRoundedRect(x - 26, topY + 48 + breathe, 12, 24, 4);
  for (let k = 0; k < 3; k++) { const ph = ((now / 800 + k / 3) % 1); g.fillStyle(0xffffff, 0.6 * (1 - ph)); g.fillCircle(x - 22 + Math.sin(now / 500 + k) * 3, topY + 46 + breathe - ph * 14, 2 - ph * 1.4); }
  // 探测杖
  const sx = x + 24 * f;
  g.lineStyle(4, metal, 1); g.lineBetween(sx, topY + 34, sx, feetY - 6);
  g.fillStyle(0xffe0b0, 0.7 + 0.3 * Math.sin(now / 200)); g.fillCircle(sx, topY + 32, 3.6);
  // 手臂
  g.lineStyle(8, suit, 1); g.lineBetween(x - 16, topY + 50 + breathe, sx, topY + 40);
  g.lineStyle(8, suit, 1); g.lineBetween(x + 16, topY + 50 + breathe, x + 28, topY + 78);
  // 穹顶头盔
  const hy = topY + 20 + breathe;
  g.fillStyle(suitD, 1); g.fillRoundedRect(x - 14, hy + 8, 28, 7, 3);
  g.fillStyle(dome, 0.4); g.beginPath(); g.arc(x, hy + 8, 15, Math.PI, Math.PI * 2); g.closePath(); g.fillPath();
  g.lineStyle(2, suit, 0.9); g.beginPath(); g.arc(x, hy + 8, 15, Math.PI, Math.PI * 2); g.strokePath();
  g.fillStyle(plant, 0.9); g.fillTriangle(x - 6, hy + 6, x - 3, hy + 6, x - 4.5, hy - 4); g.fillTriangle(x + 2, hy + 6, x + 5, hy + 6, x + 3.5, hy - 6);
  g.fillStyle(0xdff0ff, 0.5); g.fillEllipse(x, hy + 4, 18, 5);
  void f;
};

/** 先行者守卫：悬浮合金板块拼成的高大守卫，胸核脉动、头顶光环、身后符文碑 */
export const forerGuardian: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const metal = 0x2c3a4a, metalD = 0x16242e, glow = 0x5ad8ff, bright = 0xa8e0ff;
  groundShadow(g, pose, 70);
  const topY = feetY - 118;
  const breathe = Math.sin(now / 560) * 2;
  // 身后符文碑
  const mx = x - 44, my = topY + 46;
  g.fillStyle(metalD, 0.9); g.fillRoundedRect(mx - 12, my - 26, 24, 52, 4);
  g.fillStyle(metal, 0.95); g.fillRoundedRect(mx - 10, my - 24, 20, 48, 3);
  const scroll = (now / 700) % 1;
  for (let k = 0; k < 5; k++) { const t = ((k / 5) + scroll) % 1; const lit = 0.4 + 0.6 * Math.max(0, 1 - Math.abs(t - 0.5) * 2); g.lineStyle(1.6, glow, lit); g.lineBetween(mx - 6, my - 18 + t * 36, mx + 6, my - 18 + t * 36); }
  // 腿（板块）
  for (const s of [-1, 1]) { const off = Math.sin(now / 400 + s) * 1.5; g.fillStyle(metalD, 1); g.fillRoundedRect(x + s * 11 - 8, feetY - 34 + off, 16, 32, 4); g.fillStyle(metal, 1); g.fillRoundedRect(x + s * 11 - 6, feetY - 32 + off, 12, 28, 3); }
  // 躯干板块（缝隙透光）
  g.fillStyle(metalD, 1); g.fillRoundedRect(x - 22, topY + 42 + breathe, 44, 38, 8);
  for (let r = 0; r < 3; r++) { const off = Math.sin(now / 500 + r) * 2; g.fillStyle(metal, 1); g.fillRoundedRect(x - 19, topY + 46 + r * 12 + breathe + off, 38, 10, 3); g.fillStyle(glow, 0.5); g.fillRect(x - 19, topY + 56 + r * 12 + breathe + off, 38, 2); }
  // 胸核
  const pulse = 0.5 + 0.5 * Math.sin(now / 320);
  g.fillStyle(metalD, 1); g.fillCircle(x, topY + 62 + breathe, 9);
  g.fillStyle(glow, 0.5 * pulse); g.fillCircle(x, topY + 62 + breathe, 9);
  g.fillStyle(bright, 0.9); g.fillCircle(x, topY + 62 + breathe, 5);
  g.fillStyle(0xffffff, 0.7 + 0.3 * pulse); g.fillCircle(x, topY + 62 + breathe, 2);
  // 手臂
  for (const s of [-1, 1]) { g.fillStyle(metalD, 1); g.fillRoundedRect(x + s * 30 - 6, topY + 48 + breathe, 12, 30, 4); g.fillStyle(metal, 1); g.fillRoundedRect(x + s * 30 - 4, topY + 50 + breathe, 8, 26, 3); }
  // 头盔
  const hy = topY + 24 + breathe;
  g.fillStyle(metalD, 1); g.fillRoundedRect(x - 14, hy - 6, 28, 20, 6);
  g.fillStyle(metal, 1); g.fillRoundedRect(x - 12, hy - 4, 24, 16, 5);
  g.fillStyle(0x0e1620, 1); g.fillRect(x - 10, hy + 1, 20, 4);
  const scan = Math.sin(now / 600) * 7;
  g.fillStyle(glow, 0.9); g.fillRect(x + scan - 3, hy + 1, 6, 4);
  // 头顶光环
  g.save(); g.translateCanvas(x, hy - 16); g.scaleCanvas(1, 0.4);
  for (let k = 0; k < 10; k++) { const ang = now / 900 + (k / 10) * Math.PI * 2; g.fillStyle(k % 2 ? glow : bright, 0.85); g.fillRect(Math.cos(ang) * 16 - 2, Math.sin(ang) * 16 - 2, 4, 4); }
  g.lineStyle(2, glow, 0.5); g.beginPath(); g.arc(0, 0, 16, 0, Math.PI * 2); g.strokePath();
  g.restore();
};
