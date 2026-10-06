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

/** 新批次主题挥拍拖尾（上古神话 / 重装机甲）。kit 提供轨迹 pts/ribbon/core/at/dot。 */
export const SWINGS_3: Record<string, SwingArt> = {
  shnSwing: { a: 0xffd45c, draw: (g, now, hot, kit, c, a) => {
    // 开天斧斩：一记巨斧横劈——斧刃形的宽斩面 + 劈开的天地线 + 金芒
    kit.ribbon(16, 0xfff0b0, 0.22 * hot, -3);
    kit.ribbon(11, c, 0.55 * hot);
    kit.ribbon(5, 0xffffff, 0.85 * hot);
    // 斧刃形收尾（球头处一块梯形刃面）
    const head = kit.at(kit.n - 1);
    const prev = kit.at(Math.max(0, kit.n - 4));
    const dx = head.x - prev.x, dy = head.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const blade = 8 + hot * 12;
    poly(g, head.x + nx * blade * 0.4, head.y + ny * blade * 0.4, blade, 3, Math.atan2(dy, dx), c, 0.5 * hot);
    g.fillStyle(0xffffff, 0.85 * hot);
    g.fillCircle(head.x, head.y, 3);
    // 劈开的天地线（轨迹中段一根金线震颤）
    const mid = kit.at(Math.floor(kit.n / 2));
    g.lineStyle(1.6, a, 0.7 * hot);
    g.lineBetween(mid.x, mid.y - 12, mid.x, mid.y + 12 + Math.sin(now / 60) * 2);
    for (let k = 0; k < 4; k++) { // 迸裂的金屑
      const i = Math.floor(((k + 0.3) / 4) * (kit.n - 1));
      const p = kit.at(i);
      const ph = (now / 300 + k / 4) % 1;
      g.fillStyle(a, (0.8 * (1 - ph)) * hot);
      g.fillCircle(p.x + Math.sin(ph * 5 + k) * 6, p.y - ph * 10, 1.6 * (1 - ph) + 0.4);
    }
  } },
  mcaSwing: { a: 0x5ac8ff, draw: (g, now, hot, kit, c, _a) => {
    // 斩舰刀斩：军刀劈砍——细长刃面 + 高温刃缘 + 警示红闪 + 切割火花
    kit.ribbon(13, c, 0.4 * hot);
    kit.ribbon(7, 0xffffff, 0.75 * hot);
    kit.ribbon(2.4, 0xff5a5a, 0.9 * hot, -1);
    const head = kit.at(kit.n - 1);
    const gl = 0.5 + 0.5 * Math.sin(now / 120);
    g.fillStyle(0xffe15c, gl * 0.5 * hot);
    g.fillCircle(head.x, head.y, 7);
    g.fillStyle(0xffffff, 0.95 * hot);
    g.fillCircle(head.x, head.y, 2.8);
    for (let k = 0; k < 5; k++) { // 切割火花（垂直弹开）
      const i = Math.floor(((k + 0.4) / 5) * (kit.n - 1));
      const p = kit.at(i);
      const ph = (now / 250 + k / 5) % 1;
      const side = k % 2 ? 1 : -1;
      g.fillStyle(k % 2 ? 0xffe15c : 0xff5a5a, (0.85 * (1 - ph)) * hot);
      g.fillCircle(p.x + Math.sin(k * 2) * 3, p.y + side * ph * 12, 1.4 * (1 - ph) + 0.4);
    }
    // 刃面网格线（科幻感）
    for (let k = 1; k < 4; k++) {
      const p = kit.at(Math.floor((k / 4) * (kit.n - 1)));
      g.lineStyle(1, c, 0.4 * hot);
      g.lineBetween(p.x, p.y - 6, p.x, p.y + 6);
    }
  } },
};
