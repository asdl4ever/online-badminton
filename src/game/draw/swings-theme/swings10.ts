import type { SwingArt } from './shared';
import {
  starRow, ripples, sparks, plates, puffs, embers, edgeHairs, orbiters, cometBand,
  glowHalo, tipOf, impact,
} from './vocab';

/** 批九挥拍拖尾（童话王国 / 深夜食堂 / 猫咖物语）*/

export const SWINGS_10: Record<string, SwingArt> = {
  // 魔法棒：一列转动的星 + 亮粉 + 收尾一朵小魔法环
  taleSwing: { a: 0xffb0e8, draw: (g, now, hot, k, c, a) => {
    glowHalo(g, k, 0xffb0e8, 0.16);
    starRow(g, k, now, 0xffe89a, 0xffffff, 0.95, 7, 3.4);
    sparks(g, k, now, 0xffd0f0, 0.9, 9, 22); // 亮粉
    orbiters(g, tipOf(k).x, tipOf(k).y, now, c, 0.9, 4, 12, 6, 420, 2);
    const t = tipOf(k);
    ripples(g, t.x, t.y, now, a, 0.5 + hot * 0.35, 3, 26 + hot * 12, 110);
  } },

  // 铁板铲：一路热气与油星 + 铲面反光 + 焦香余烬
  dinSwing: { a: 0xffd45c, draw: (g, now, hot, k, _c, a) => {
    glowHalo(g, k, 0xff8a3c, 0.14);
    plates(g, k, now, 0x8a92a0, 0.9, 5, 8); // 铲面
    puffs(g, k, now, 0xf0f0e8, 0.8, 10, 14); // 热气
    sparks(g, k, now, 0xffc24a, 0.9, 8, 18); // 油星
    embers(g, k, now, 0xff6a2a, 0x4a3a2a, 0.8, 6); // 焦香
    const t = tipOf(k);
    impact(g, t.x, t.y, now, hot, a, 0x8a92a0);
  } },

  // 猫爪连击：粉肉球掌印 + 绒毛 + 追着跑的小毛球
  catSwing: { a: 0xffb0c8, draw: (g, now, hot, k, c, a) => {
    glowHalo(g, k, 0xffb0c8, 0.14);
    cometBand(g, k, c, 0.55, 0.7); // 软乎乎的掌风
    // 沿轨迹的肉球掌印
    for (let i = 1; i < k.n - 1; i += 3) {
      const p = k.pts[i];
      const al = k.pts[i].a * 0.85;
      g.fillStyle(a, al);
      g.fillCircle(p.x, p.y, 3.4 + k.pts[i].w * 0.16);
      for (let s = 0; s < 4; s++) {
        const ang = -1.9 + s * 0.5;
        g.fillStyle(0xffffff, al * 0.8);
        g.fillCircle(p.x + Math.cos(ang) * 5, p.y + Math.sin(ang) * 5, 1.4);
      }
    }
    edgeHairs(g, k, 0xfff0f4, 0.6, 5, 2); // 绒毛
    orbiters(g, mid(k).x, mid(k).y, now, 0xfff0f4, 0.8, 3, 22, 10, 700, 2.4); // 追着跑的毛球
    const t = tipOf(k);
    impact(g, t.x, t.y, now, hot, 0xffffff, a);
  } },
};

/** 轨迹中点（本款专用） */
function mid(k: Parameters<typeof cometBand>[1]): { x: number; y: number; w: number; a: number } {
  return k.pts[Math.floor(k.n / 2)];
}
