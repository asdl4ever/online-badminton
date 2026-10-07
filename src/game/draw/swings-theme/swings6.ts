import type { SwingArt } from './shared';
import { hairLine, edgeHairs, dashLine, bolts, plates, shards, embers, impact, glowHalo, tipOf, ripples, petals } from './vocab';

/** 批五挥拍拖尾（武侠江湖 / 北欧神域）*/

export const SWINGS_6: Record<string, SwingArt> = {
  // 剑气纵横：极细的一条剑气 + 两侧剑芒 + 相位跳动的虚影，干净利落
  wxSwing: { a: 0xd0f0ff, draw: (g, now, hot, k, _c, a) => {
    glowHalo(g, k, 0xd0f0ff, 0.1);
    hairLine(g, k, 0xffffff, 0.95, 0.14); // 主剑气（极细）
    edgeHairs(g, k, 0xd0f0ff, 0.65, 7, 1); // 两侧剑芒
    dashLine(g, k, now, a, 0.5, 4, 0.16); // 相位虚影
    petals(g, k, now, 0xffd8e8, 0.5, 5, 3.4); // 随剑风卷起的落花
    const t = tipOf(k);
    hiltGlint(g, t.x, t.y, now, hot);
  } },

  // 雷神之锤：雷弧缠绕石锤，锤面溅碎石与余烬
  norseSwing: { a: 0x9fd8ff, draw: (g, now, hot, k, _c, a) => {
    glowHalo(g, k, 0x9fd8ff, 0.18);
    plates(g, k, now, 0x4a5262, 0.9, 6, 7); // 符文石锤面
    bolts(g, k, now, a, 0xffffff, 0.95, 5); // 雷弧
    bolts(g, k, now, 0xffffff, a, 0.7, 3);
    shards(g, k, now, 0x8a8a92, 0.8, 6, 8, 1.6); // 碎石
    embers(g, k, now, 0xffe08a, 0x5a4a2a, 0.85, 6);
    const t = tipOf(k);
    ripples(g, t.x, t.y, now, 0xffffff, 0.55 + hot * 0.35, 3, 28 + hot * 14, 100);
    impact(g, t.x, t.y, now, hot, 0xffe08a, 0x8a94a2);
  } },
};

/** 收剑处：剑格一点寒芒 + 一圈极小的气环（本款专用） */
function hiltGlint(g: import('phaser').GameObjects.Graphics, x: number, y: number, now: number, hot: number): void {
  const tw = 0.6 + 0.4 * Math.sin(now / 110);
  g.fillStyle(0xffffff, tw);
  g.fillCircle(x, y, 2.4 + hot * 2);
  g.lineStyle(1.4, 0xd0f0ff, 0.6);
  g.save();
  g.translateCanvas(x, y);
  g.scaleCanvas(1, 0.5);
  g.beginPath();
  g.arc(0, 0, 12 + hot * 8, 0, Math.PI * 2);
  g.strokePath();
  g.restore();
}
