import { groundShadow, type SkinPainter } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 第八批 5★ 海洋怪兽皮肤：冰海利维坦 / 极夜幽光鮟鱇 / 巨牙海象王 / 维度吞噬者 / 虚空灯笼鱼神 */

/** 冰海利维坦：浮冰之下的巨鲸海怪，冰甲、喷冰雾、长须 */
export const glacLeviathan: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f } = pose;
  const ice = 0x5fd8ff, iceD = 0x2a6a8a, belly = 0xbfe8ff, dark = 0x0e2a3e;
  groundShadow(g, pose, 84);
  const bob = Math.sin(now / 480) * 4;
  const bodyY = feetY - 52 + bob;
  // 尾鳍（摆）
  const tw = Math.sin(now / 400) * 10;
  g.fillStyle(iceD, 1); g.fillPoints([{ x: x - f * 40, y: bodyY }, { x: x - f * 78 + tw, y: bodyY - 26 }, { x: x - f * 82 + tw, y: bodyY + 26 }, { x: x - f * 46, y: bodyY + 8 }] as never, true);
  // 庞大躯体
  g.fillStyle(dark, 1); g.fillEllipse(x, bodyY, 92, 54);
  g.fillStyle(ice, 1); g.fillEllipse(x, bodyY - 3, 86, 48);
  g.fillStyle(belly, 0.6); g.fillEllipse(x + f * 4, bodyY + 14, 60, 20);
  for (let k = 0; k < 5; k++) { g.lineStyle(1.6, belly, 0.6); g.lineBetween(x + (k - 2) * 10, bodyY + 10, x + (k - 2) * 10, bodyY + 22); }
  // 背脊冰甲
  for (let k = 0; k < 5; k++) { const bx = x - f * 24 + k * 12 * f; g.fillStyle(dark, 1); g.fillTriangle(bx - 5, bodyY - 18, bx + 5, bodyY - 18, bx, bodyY - 34 - (k % 2) * 6); }
  // 头
  const hx = x + f * 44, hy = bodyY - 6;
  g.fillStyle(ice, 1); g.fillEllipse(hx, hy, 34, 30);
  g.fillStyle(dark, 1); g.fillCircle(hx + f * 10, hy - 2, 3.4);
  g.fillStyle(0xffffff, 0.9); g.fillCircle(hx + f * 11, hy - 3, 1.2);
  for (let k = 0; k < 16; k++) { const ph = ((now / 1200 + k / 16) % 1); g.fillStyle(belly, (1 - ph) * 0.7); g.fillCircle(x + 6 + Math.sin(k * 2) * 6, bodyY - 30 - ph * 60, 2); }
  g.fillStyle(0xffffff, 0.5 + 0.3 * Math.sin(now / 400)); g.fillCircle(x + 6, bodyY - 30, 3.4);
};

/** 极夜幽光鮟鱇：漆黑冰海里的巨口鮟鱇，头顶诱饵灯、满口利齿 */
export const fridAngler: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f } = pose;
  const body = 0x0e2830, bodyD = 0x061419, glow = 0x7dffd0, tooth = 0xe8f4f8;
  groundShadow(g, pose, 76);
  const bob = Math.sin(now / 460) * 3;
  const bodyY = feetY - 46 + bob;
  // 尾
  const tw = Math.sin(now / 420) * 8;
  g.fillStyle(bodyD, 1); g.fillPoints([{ x: x - f * 34, y: bodyY }, { x: x - f * 66 + tw, y: bodyY - 20 }, { x: x - f * 68 + tw, y: bodyY + 22 }, { x: x - f * 38, y: bodyY + 8 }] as never, true);
  // 身躯
  g.fillStyle(bodyD, 1); g.fillEllipse(x, bodyY, 84, 56);
  g.fillStyle(body, 1); g.fillEllipse(x, bodyY - 2, 78, 50);
  for (let k = 0; k < 6; k++) { g.fillStyle(glow, 0.7); g.fillCircle(x - 30 + (k * 21 % 60), bodyY - 14 + Math.floor(k / 3) * 22, 2.2); }
  // 巨口（大张）
  const open = 0.5 + 0.5 * Math.sin(now / 500);
  const hx = x + f * 42, hy = bodyY;
  g.fillStyle(bodyD, 1); g.fillPoints([{ x: hx - 10 * f, y: hy - 10 }, { x: hx + 24 * f, y: hy - 6 - open * 14 }, { x: hx + 22 * f, y: hy + 2 }] as never, true);
  g.fillStyle(bodyD, 1); g.fillPoints([{ x: hx - 10 * f, y: hy + 16 }, { x: hx + 24 * f, y: hy + 12 + open * 14 }, { x: hx + 22 * f, y: hy + 2 }] as never, true);
  g.fillStyle(0x02080a, 1); g.fillEllipse(hx + 6 * f, hy + 2, 40, 8 + open * 22);
  g.fillStyle(glow, 0.3 * open); g.fillEllipse(hx + 6 * f, hy + 2, 30, 6 + open * 16);
  for (let k = 0; k < 8; k++) { g.fillStyle(tooth, 0.95); g.fillTriangle(hx - 8 * f + k * 4 * f, hy - 6, hx - 4 * f + k * 4 * f, hy - 6, hx - 6 * f + k * 4 * f, hy + 4); g.fillTriangle(hx - 8 * f + k * 4 * f, hy + 10, hx - 4 * f + k * 4 * f, hy + 10, hx - 6 * f + k * 4 * f, hy); }
  g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx - 8 * f, hy - 14, 3.4); g.fillStyle(glow, 0.9); g.fillCircle(hx - 8 * f, hy - 14, 1.4);
  // 头顶诱饵灯
  g.lineStyle(4, body, 1); g.beginPath(); g.moveTo(x - 2, bodyY - 26); g.lineTo(x + 10, bodyY - 60); g.strokePath();
  const gl = 0.5 + 0.5 * Math.sin(now / 300);
  g.fillStyle(glow, 0.35 * gl); g.fillCircle(x + 10, bodyY - 62, 18);
  g.fillStyle(glow, gl); g.fillCircle(x + 10, bodyY - 62, 7);
  g.fillStyle(0xffffff, 0.9 * gl); g.fillCircle(x + 10, bodyY - 62, 3);
};

/** 巨牙海象王：冰面上趴着的海象王，獠牙、胡须、厚脂 */
export const walrKing: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f } = pose;
  const hide = 0x8a705a, hideD = 0x6a5442, tusk = 0xe8f0f4, snow = 0xe8f4ff;
  groundShadow(g, pose, 84);
  const bodyY = feetY - 42;
  // 身躯
  g.fillStyle(hideD, 1); g.fillEllipse(x, bodyY, 98, 62);
  g.fillStyle(hide, 1); g.fillEllipse(x, bodyY - 2, 90, 56);
  for (let k = 0; k < 10; k++) { g.fillStyle(k % 2 ? 0x5a4436 : 0x7a6450, 0.6); g.fillEllipse(x - 38 + (k * 17 % 76), bodyY - 14 + Math.floor(k / 5) * 26, 5, 4); }
  // 前鳍
  const fl = Math.sin(now / 500) * 3;
  g.fillStyle(hide, 1); g.fillPoints([{ x: x + 30 * f, y: bodyY + 14 }, { x: x + 60 * f, y: bodyY + 30 + fl }, { x: x + 32 * f, y: bodyY + 38 }] as never, true);
  // 头
  const hx = x + 40 * f, hy = bodyY - 18;
  g.fillStyle(hide, 1); g.fillEllipse(hx, hy, 34, 30);
  g.fillStyle(hideD, 0.5); g.fillEllipse(hx + 6 * f, hy + 6, 20, 12);
  // 獠牙
  g.fillStyle(tusk, 1); g.fillPoints([{ x: hx + 8 * f, y: hy + 10 }, { x: hx + 12 * f, y: hy + 10 }, { x: hx + 18 * f, y: hy + 40 }] as never, true);
  g.fillPoints([{ x: hx + 0 * f, y: hy + 10 }, { x: hx + 4 * f, y: hy + 10 }, { x: hx + 8 * f, y: hy + 38 }] as never, true);
  // 胡须
  for (let k = 0; k < 5; k++) { g.lineStyle(1.2, 0xf0e8d8, 0.8); g.lineBetween(hx + 10 * f, hy + 2, hx + 22 * f, hy - 2 + k * 3); g.lineBetween(hx + 10 * f, hy + 4, hx + 22 * f, hy + 4 + k * 3); }
  g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx + 8 * f, hy - 6, 2.6);
  // 冰面霜花
  for (let k = 0; k < 5; k++) { const on = 0.4 + 0.6 * Math.abs(Math.sin(now / 400 + k)); g.fillStyle(snow, 0.7 * on); g.fillCircle(x - 40 + k * 20, feetY - 4, 2); }
};

/** 维度吞噬者：撕开空间的高维海怪，几何壳体、多眼、触须探入裂隙 */
export const dimDevourer: SkinPainter = (g: G, now, pose) => {
  const { x, feetY } = pose;
  const purple = 0xb08aff, glow = 0x7dffd0, voidc = 0x05040f;
  groundShadow(g, pose, 80);
  const bob = Math.sin(now / 460) * 4;
  const bodyY = feetY - 54 + bob;
  // 身后的裂隙
  g.fillStyle(voidc, 0.8); g.fillEllipse(x - 40, bodyY, 40, 90);
  g.lineStyle(2.4, purple, 0.6); g.strokeEllipse(x - 40, bodyY, 40, 90);
  // 几何壳体（旋转的板块）
  for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2 + now / 1600; const px = x + Math.cos(ang) * 34, py = bodyY + Math.sin(ang) * 34; g.save(); g.translateCanvas(px, py); g.rotateCanvas(ang + now / 900); g.fillStyle(k % 2 ? purple : glow, 0.85); g.fillPoints([{ x: 0, y: -14 }, { x: 10, y: 0 }, { x: 0, y: 14 }, { x: -10, y: 0 }] as never, true); g.restore(); }
  g.fillStyle(voidc, 1); g.fillCircle(x, bodyY, 26);
  g.fillStyle(purple, 0.6); g.fillCircle(x, bodyY, 26);
  g.fillStyle(voidc, 1); g.fillCircle(x, bodyY, 18);
  // 多只眼
  for (let k = 0; k < 5; k++) { const ang = -Math.PI / 2 + (k - 2) * 0.4; const ex = x + Math.cos(ang) * 20, ey = bodyY - 4 + Math.sin(ang) * 20; g.fillStyle(0xfff0a0, 0.95); g.fillCircle(ex, ey, 3); g.fillStyle(voidc, 1); g.fillCircle(ex, ey, 1.2); }
  // 触须探入裂隙
  for (let k = 0; k < 5; k++) { const base = -Math.PI / 2 + (k - 2) * 0.35; g.lineStyle(3.4 - (k % 2), k % 2 ? purple : glow, 0.85); g.beginPath(); for (let s = 0; s <= 5; s++) { const u = s / 5; const ang = base + Math.sin(u * 5 + now / 400 + k) * 0.5; const rr = u * 54; g.lineTo(x + Math.cos(ang) * rr, bodyY + Math.sin(ang) * rr); } g.strokePath(); }
  for (let k = 0; k < 8; k++) { const ph = ((now / 1000 + k / 8) % 1); g.fillStyle(k % 2 ? glow : purple, (1 - ph) * 0.8); g.fillCircle(x - 40 + Math.sin(k * 2) * 20, bodyY - 60 + ph * 120, 1.6); }
};

/** 虚空灯笼鱼神：深渊巨口的发光鱼神，灯笼摆、触须环、利齿 */
export const hadalLurefish: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, facing: f } = pose;
  const body = 0x0e2828, bodyD = 0x061618, glow = 0x39ffd0, tooth = 0xe8f4f8;
  groundShadow(g, pose, 78);
  const bob = Math.sin(now / 440) * 3;
  const bodyY = feetY - 50 + bob;
  // 尾
  const tw = Math.sin(now / 380) * 8;
  g.fillStyle(bodyD, 1); g.fillPoints([{ x: x - f * 36, y: bodyY }, { x: x - f * 70 + tw, y: bodyY - 22 }, { x: x - f * 72 + tw, y: bodyY + 24 }, { x: x - f * 40, y: bodyY + 8 }] as never, true);
  // 身躯
  g.fillStyle(bodyD, 1); g.fillEllipse(x, bodyY, 88, 58);
  g.fillStyle(body, 1); g.fillEllipse(x, bodyY - 2, 82, 52);
  // 幽光点
  for (let k = 0; k < 9; k++) { const on = 0.5 + 0.5 * Math.sin(now / 300 + k); g.fillStyle(glow, 0.7 * on); g.fillCircle(x - 34 + (k * 19 % 68), bodyY - 16 + Math.floor(k / 5) * 24, 2.4); }
  // 背鳍
  for (let k = 0; k < 4; k++) { g.fillStyle(bodyD, 1); g.fillTriangle(x - f * 20 + k * 12 * f, bodyY - 22, x - f * 14 + k * 12 * f, bodyY - 22, x - f * 17 + k * 12 * f, bodyY - 44 - (k % 2) * 8); }
  // 巨口
  const open = 0.5 + 0.5 * Math.sin(now / 480);
  const hx = x + f * 44, hy = bodyY;
  g.fillStyle(bodyD, 1); g.fillPoints([{ x: hx - 10 * f, y: hy - 12 }, { x: hx + 26 * f, y: hy - 8 - open * 14 }, { x: hx + 24 * f, y: hy + 2 }] as never, true);
  g.fillPoints([{ x: hx - 10 * f, y: hy + 18 }, { x: hx + 26 * f, y: hy + 14 + open * 14 }, { x: hx + 24 * f, y: hy + 2 }] as never, true);
  g.fillStyle(0x02080a, 1); g.fillEllipse(hx + 8 * f, hy + 2, 44, 10 + open * 24);
  g.fillStyle(glow, 0.3 * open); g.fillEllipse(hx + 8 * f, hy + 2, 32, 7 + open * 18);
  for (let k = 0; k < 9; k++) { g.fillStyle(tooth, 0.95); g.fillTriangle(hx - 8 * f + k * 4 * f, hy - 8, hx - 4 * f + k * 4 * f, hy - 8, hx - 6 * f + k * 4 * f, hy + 2); g.fillTriangle(hx - 8 * f + k * 4 * f, hy + 12, hx - 4 * f + k * 4 * f, hy + 12, hx - 6 * f + k * 4 * f, hy + 2); }
  g.fillStyle(0x1a1a1e, 1); g.fillCircle(hx - 8 * f, hy - 16, 3.2); g.fillStyle(glow, 0.9); g.fillCircle(hx - 8 * f, hy - 16, 1.2);
  // 头顶灯笼（长触须挑着）
  g.lineStyle(3.4, body, 1); g.beginPath(); g.moveTo(x - 2, bodyY - 28); g.lineTo(x + 4 + tw * 0.3, bodyY - 56); g.lineTo(x + 14, bodyY - 64); g.strokePath();
  const gl = 0.5 + 0.5 * Math.sin(now / 280);
  g.fillStyle(glow, 0.35 * gl); g.fillCircle(x + 14, bodyY - 66, 18);
  g.fillStyle(glow, gl); g.fillCircle(x + 14, bodyY - 66, 7);
  g.fillStyle(0xffffff, 0.9 * gl); g.fillCircle(x + 14, bodyY - 66, 3);
};
