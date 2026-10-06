import { TAU, type SwingArt } from './shared';

/** 批五主题挥拍拖尾（武侠江湖 / 北欧神域）。kit 提供轨迹 pts/ribbon/core/at/dot。 */
export const SWINGS_6: Record<string, SwingArt> = {
  wxSwing: { a: 0xe8404a, draw: (g, now, hot, kit, c, a) => {
    // 拔剑斩：居合一闪——极窄极速的刃光 + 鞘光 + 斩击十字 + 收剑残影
    kit.ribbon(7, c, 0.6 * hot);
    kit.ribbon(2.4, 0xffffff, 0.9 * hot);
    kit.ribbon(1.2, a, 0.85 * hot, -1.2);
    // 居合十字（球头处一闪而过的十字斩光）
    const head = kit.at(kit.n - 1);
    const flash = Math.abs(Math.sin(now / 130));
    g.lineStyle(2.4, 0xffffff, flash * 0.8 * hot);
    g.lineBetween(head.x - 9, head.y, head.x + 9, head.y);
    g.lineBetween(head.x, head.y - 9, head.x, head.y + 9);
    g.fillStyle(0xffffff, 0.9 * hot);
    g.fillCircle(head.x, head.y, 2.4);
    // 鞘光（轨迹起点的圆弧鞘口光）
    const start = kit.at(0);
    g.lineStyle(2, a, 0.5 * hot);
    g.beginPath();
    g.arc(start.x, start.y, 8, now / 300, now / 300 + 1.8);
    g.strokePath();
    for (let k = 0; k < 4; k++) { // 斩击余韵（细线飞散）
      const i = Math.floor(((k + 0.3) / 4) * (kit.n - 1));
      const p = kit.at(i);
      const ph = (now / 260 + k / 4) % 1;
      g.lineStyle(1, c, (0.6 * (1 - ph)) * hot);
      g.lineBetween(p.x, p.y, p.x + Math.sin(k * 2.2) * 8, p.y + (k % 2 ? 1 : -1) * ph * 10);
    }
  } },
  norseSwing: { a: 0x7fd4ff, draw: (g, now, hot, kit, c, a) => {
    // 雷霆一击：巨锤砸落——重锤弧面 + 落点冲击波 + 雷电迸裂 + 震地尘环
    kit.ribbon(17, c, 0.45 * hot);
    kit.ribbon(10, 0xffffff, 0.65 * hot);
    kit.ribbon(4, a, 0.85 * hot);
    // 锤影残像（轨迹上三个渐隐的方锤头）
    for (let k = 1; k <= 3; k++) {
      const p = kit.at(Math.max(0, kit.n - k * 6));
      g.save();
      g.translateCanvas(p.x, p.y);
      g.rotateCanvas(k * 0.5 + now / 400);
      g.fillStyle(0x8a94a2, (0.5 - k * 0.13) * hot);
      g.fillRect(-7, -5, 14, 10);
      g.restore();
    }
    // 落点冲击波（球头双环外扩）
    const head = kit.at(kit.n - 1);
    const ph = (now / 480) % 1;
    g.lineStyle(3 * (1 - ph) + 0.6, a, (0.7 * (1 - ph)) * hot);
    g.strokeCircle(head.x, head.y, 5 + ph * 20);
    g.lineStyle(1.4, 0xffffff, (0.5 * (1 - ph)) * hot);
    g.strokeCircle(head.x, head.y, (5 + ph * 20) * 0.65);
    for (let k = 0; k < 6; k++) { // 雷电迸裂（球头向外的锯齿电）
      const ang = (k / 6) * TAU + now / 250;
      g.lineStyle(1.6, a, 0.85 * hot);
      let bx = head.x + Math.cos(ang) * 5, by = head.y + Math.sin(ang) * 5;
      g.beginPath(); g.moveTo(bx, by);
      for (let s = 1; s <= 3; s++) {
        bx += Math.cos(ang) * 5 + Math.sin(now / 40 + k + s) * 3;
        by += Math.sin(ang) * 5;
        g.lineTo(bx, by);
      }
      g.strokePath();
    }
    for (let k = 0; k < 5; k++) { // 震地尘屑
      const i = Math.floor(((k + 0.3) / 5) * (kit.n - 1));
      const p = kit.at(i);
      const pk = (now / 340 + k / 5) % 1;
      g.fillStyle(k % 2 ? c : 0xb8b0a0, (0.8 * (1 - pk)) * hot);
      g.fillCircle(p.x + Math.sin(pk * 5 + k) * 6, p.y - pk * 8, 1.6 * (1 - pk) + 0.4);
    }
    g.fillStyle(0xffffff, 0.9 * hot);
    g.fillCircle(head.x, head.y, 3);
  } },
};
