import type { SwingArt } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 局部小工具：实心多边形 */
function poly(g: G, x: number, y: number, r: number, sides: number, rot: number, color: number, al: number): void {
  const vs = [];
  for (let k = 0; k < sides; k++) {
    const ang = rot + (k / sides) * Math.PI * 2;
    vs.push({ x: x + Math.cos(ang) * r, y: y + Math.sin(ang) * r });
  }
  g.fillStyle(color, al);
  g.fillPoints(vs as never, true, true);
}

/** 批四主题挥拍拖尾（西游降魔 / 三国烽火）。kit 提供轨迹 pts/ribbon/core/at/dot。 */
export const SWINGS_5: Record<string, SwingArt> = {
  xySwing: { a: 0xffd45c, draw: (g, now, hot, kit, c, a) => {
    // 棒扫千军：金箍棒横扫——宽幅扫面 + 棒影残像 + 扫风圈 + 金屑迸裂
    kit.ribbon(15, c, 0.45 * hot);
    kit.ribbon(9, 0xfff0b0, 0.7 * hot);
    kit.ribbon(4, 0xffffff, 0.85 * hot);
    // 棒影残像（轨迹上三根渐隐的短棒）
    for (let k = 1; k <= 3; k++) {
      const p = kit.at(Math.max(0, kit.n - k * 5));
      const prev = kit.at(Math.max(0, kit.n - k * 5 - 3));
      const dx = p.x - prev.x, dy = p.y - prev.y;
      const l = Math.hypot(dx, dy) || 1;
      const half = (10 - k * 2) * hot;
      g.lineStyle(5 - k, c, (0.55 - k * 0.13) * hot);
      g.lineBetween(p.x - (dx / l) * half, p.y - (dy / l) * half, p.x + (dx / l) * half, p.y + (dy / l) * half);
      // 棒端金箍闪点
      g.fillStyle(a, (0.8 - k * 0.2) * hot);
      g.fillCircle(p.x + (dx / l) * half, p.y + (dy / l) * half, 2);
    }
    // 扫风圈（球头外扩的气浪环）
    const head = kit.at(kit.n - 1);
    const ph = (now / 450) % 1;
    g.lineStyle(2.6 * (1 - ph) + 0.6, 0xffffff, (0.6 * (1 - ph)) * hot);
    g.strokeCircle(head.x, head.y, 6 + ph * 20);
    for (let k = 0; k < 5; k++) { // 金屑迸裂
      const i = Math.floor(((k + 0.3) / 5) * (kit.n - 1));
      const p = kit.at(i);
      const pk = (now / 320 + k / 5) % 1;
      g.fillStyle(k % 2 ? a : 0xfff0b0, (0.85 * (1 - pk)) * hot);
      g.fillCircle(p.x + Math.sin(pk * 5 + k) * 6, p.y - pk * 10, 1.6 * (1 - pk) + 0.4);
    }
    g.fillStyle(0xffffff, 0.9 * hot);
    g.fillCircle(head.x, head.y, 3);
  } },
  sgmSwing: { a: 0xe8404a, draw: (g, now, hot, kit, c, a) => {
    // 刀劈千军：偃月刀下劈——新月刃面 + 血色刃缘 + 劈裂地光 + 溅血火星
    kit.ribbon(16, c, 0.5 * hot);
    kit.ribbon(10, 0xa8f0d0, 0.6 * hot);
    kit.ribbon(3.4, 0xffffff, 0.85 * hot);
    // 新月刃面收尾（球头处一道宽弯月）
    const head = kit.at(kit.n - 1);
    const prev = kit.at(Math.max(0, kit.n - 5));
    const dx = head.x - prev.x, dy = head.y - prev.y;
    const ang = Math.atan2(dy, dx);
    poly(g, head.x + Math.cos(ang + 1.9) * 12, head.y + Math.sin(ang + 1.9) * 12, 11, 3, ang, c, 0.55 * hot);
    poly(g, head.x + Math.cos(ang + 1.9) * 8, head.y + Math.sin(ang + 1.9) * 8, 7, 3, ang, 0xffffff, 0.7 * hot);
    // 劈裂地光（轨迹中段向下劈出的裂纹）
    const mid = kit.at(Math.floor(kit.n / 2));
    g.lineStyle(2, a, 0.75 * hot);
    g.lineBetween(mid.x, mid.y, mid.x + 4, mid.y + 14 + Math.sin(now / 70) * 2);
    g.lineStyle(1.2, a, 0.5 * hot);
    g.lineBetween(mid.x, mid.y + 4, mid.x - 5, mid.y + 13);
    for (let k = 0; k < 6; k++) { // 溅血火星
      const i = Math.floor(((k + 0.2) / 6) * (kit.n - 1));
      const p = kit.at(i);
      const ph = (now / 300 + k / 6) % 1;
      const side = k % 2 ? 1 : -1;
      g.fillStyle(k % 2 ? a : 0xffe15c, (0.85 * (1 - ph)) * hot);
      g.fillCircle(p.x + Math.sin(k * 2.2) * 3, p.y + side * ph * 13, 1.6 * (1 - ph) + 0.4);
    }
    g.fillStyle(0xffffff, 0.9 * hot);
    g.fillCircle(head.x, head.y, 2.8);
  } },
};
