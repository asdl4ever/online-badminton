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

/** 批三主题挥拍拖尾（光之巨人 / 怪兽之王）。kit 提供轨迹 pts/ribbon/core/at/dot。 */
export const SWINGS_4: Record<string, SwingArt> = {
  otmSwing: { a: 0xff4a5c, draw: (g, now, hot, kit, c, a) => {
    // 手刀斩：一记银色手刀劈砍——窄长刃面 + 红色刃缘 + 劈风音痕 + 光子崩散
    kit.ribbon(9, c, 0.5 * hot);
    kit.ribbon(4, 0xffffff, 0.85 * hot);
    kit.ribbon(2, a, 0.9 * hot, -1.4);
    // 手刀刃形收尾（球头处一道窄长斜刃）
    const head = kit.at(kit.n - 1);
    const prev = kit.at(Math.max(0, kit.n - 4));
    const dx = head.x - prev.x, dy = head.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const blade = 6 + hot * 9;
    poly(g, head.x + nx * blade * 0.35, head.y + ny * blade * 0.35, blade, 3, Math.atan2(dy, dx), 0xdfe8f5, 0.6 * hot);
    g.fillStyle(0xffffff, 0.9 * hot);
    g.fillCircle(head.x, head.y, 2.6);
    g.fillStyle(a, 0.7 * hot); // 刃缘红光
    g.fillCircle(head.x + nx * 3, head.y + ny * 3, 4.4);
    // 劈风音痕（轨迹后段的弧形细线）
    for (let k = 1; k <= 3; k++) {
      const p = kit.at(Math.max(0, kit.n - k * 5));
      g.lineStyle(1, c, (0.5 - k * 0.12) * hot);
      g.lineBetween(p.x - dx / len * 8, p.y - dy / len * 8 - k * 2.4, p.x + dx / len * 4, p.y + dy / len * 4 - k * 2.4);
    }
    for (let k = 0; k < 4; k++) { // 光子崩散
      const i = Math.floor(((k + 0.3) / 4) * (kit.n - 1));
      const p = kit.at(i);
      const ph = (now / 280 + k / 4) % 1;
      g.fillStyle(k % 2 ? a : 0xffffff, (0.8 * (1 - ph)) * hot);
      g.fillCircle(p.x + Math.sin(ph * 5 + k) * 5, p.y + Math.cos(ph * 4 + k) * 5, 1.4 * (1 - ph) + 0.4);
    }
  } },
  kjuSwing: { a: 0x8ae86a, draw: (g, now, hot, kit, c, a) => {
    // 尾锤横扫：兽王巨尾横扫——宽弧扫面 + 骨锤残影 + 碎屑飞溅 + 冲击波
    kit.ribbon(18, 0x3a4a2c, 0.4 * hot);
    kit.ribbon(12, c, 0.6 * hot);
    kit.ribbon(5, 0xcfc4a0, 0.8 * hot);
    // 骨锤残影（轨迹上三个渐隐的重锤圆）
    for (let k = 1; k <= 3; k++) {
      const p = kit.at(Math.max(0, kit.n - k * 6));
      g.fillStyle(0x6a5a3a, (0.5 - k * 0.13) * hot);
      g.fillCircle(p.x, p.y, 9 - k * 1.4);
      g.fillStyle(0xcfc4a0, (0.6 - k * 0.16) * hot);
      g.fillCircle(p.x, p.y, 4 - k * 0.8);
    }
    // 冲击波（球头外扩弧环）
    const head = kit.at(kit.n - 1);
    const ph = (now / 500) % 1;
    g.lineStyle(2.4 * (1 - ph) + 0.6, a, (0.7 * (1 - ph)) * hot);
    g.strokeCircle(head.x, head.y, 6 + ph * 18);
    for (let k = 0; k < 6; k++) { // 碎屑飞溅
      const i = Math.floor(((k + 0.2) / 6) * (kit.n - 1));
      const p = kit.at(i);
      const pk = (now / 300 + k / 6) % 1;
      const side = k % 2 ? 1 : -1;
      g.fillStyle(k % 2 ? 0xcfc4a0 : a, (0.85 * (1 - pk)) * hot);
      g.fillRect(p.x - 1.4, p.y - 1.4, 2.8, 2.8);
      g.fillCircle(p.x + Math.sin(k * 2) * 4, p.y + side * pk * 14, 1.2 * (1 - pk) + 0.3);
    }
    g.fillStyle(0xffffff, 0.9 * hot);
    g.fillCircle(head.x, head.y, 3);
  } },
};
