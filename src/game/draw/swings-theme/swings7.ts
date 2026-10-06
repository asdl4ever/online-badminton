import type { SwingArt } from './shared';

/** 批六主题挥拍拖尾（法老秘葬 / 暗部忍道）。kit 提供轨迹 pts/ribbon/core/at/dot。 */
export const SWINGS_7: Record<string, SwingArt> = {
  egSwing: { a: 0x3a5a8a, draw: (g, now, hot, kit, c, a) => {
    // 诅咒之触：法老的诅咒之爪横扫——金蓝双弧 + 爪痕三道 + 圣甲虫群 + 诅咒符环
    kit.ribbon(13, c, 0.45 * hot);
    kit.ribbon(8, 0xffd45c, 0.6 * hot);
    kit.ribbon(3, 0xfff6d8, 0.85 * hot);
    // 爪痕三道（球头处三道并行的弧形爪痕）
    const head = kit.at(kit.n - 1);
    const prev = kit.at(Math.max(0, kit.n - 5));
    const dx = head.x - prev.x, dy = head.y - prev.y;
    const ang = Math.atan2(dy, dx);
    for (let k = -1; k <= 1; k++) {
      g.save();
      g.translateCanvas(head.x, head.y);
      g.rotateCanvas(ang);
      g.lineStyle(2.4, a, 0.85 * hot);
      g.beginPath();
      g.moveTo(-6, k * 5);
      g.lineTo(4, k * 5 - 2);
      g.strokePath();
      g.fillStyle(0xffd45c, 0.9 * hot);
      g.fillCircle(5, k * 5 - 2, 1.4);
      g.restore();
    }
    // 圣甲虫群（沿轨迹爬行的小圣甲虫）
    for (let k = 0; k < 3; k++) {
      const u = (now / 600 + k / 3) % 1;
      const i = Math.floor(u * (kit.n - 1));
      const p = kit.at(i);
      g.fillStyle(0x3a5a8a, 0.9 * hot);
      g.fillEllipse(p.x, p.y, 5, 3.4);
      g.fillStyle(0xffd45c, 0.8 * hot);
      g.fillCircle(p.x + 2, p.y - 0.6, 1);
    }
    // 诅咒符环（球头外扩的符文环）
    const ph = (now / 550) % 1;
    g.lineStyle(2 * (1 - ph) + 0.5, a, (0.65 * (1 - ph)) * hot);
    g.strokeCircle(head.x, head.y, 5 + ph * 17);
    for (let k = 0; k < 5; k++) { // 诅咒金尘
      const i = Math.floor(((k + 0.3) / 5) * (kit.n - 1));
      const p = kit.at(i);
      const pk = (now / 380 + k / 5) % 1;
      g.fillStyle(k % 2 ? 0xffd45c : 0x3a5a8a, (0.8 * (1 - pk)) * hot);
      g.fillCircle(p.x + Math.sin(pk * 5 + k) * 5, p.y - pk * 9, 1.5 * (1 - pk) + 0.4);
    }
    g.fillStyle(0xfff6d8, 0.9 * hot);
    g.fillCircle(head.x, head.y, 2.6);
  } },
  njaSwing: { a: 0xb08ad0, draw: (g, now, hot, kit, c, a) => {
    // 影刃一闪：暗影刃的瞬斩——极窄影刃 + 分身错位残像 + 紫电贯串 + 静默斩痕
    kit.ribbon(8, c, 0.5 * hot);
    kit.ribbon(3, 0xd8d0e8, 0.8 * hot);
    kit.ribbon(1.4, a, 0.85 * hot, -1.2);
    // 分身错位残像（轨迹上两个紫影人形错位闪现）
    for (let k = 0; k < 2; k++) {
      const i = Math.floor(((k + 0.3) / 2) * (kit.n - 1));
      const p = kit.at(i);
      const gl = 0.3 + 0.2 * Math.sin(now / 260 + k * 2);
      g.fillStyle(a, gl * hot);
      g.fillRoundedRect(p.x - 3, p.y - 8, 6, 16, 2);
      g.fillStyle(0x0c0c12, gl * hot);
      g.fillRect(p.x - 2, p.y - 5, 4, 1.2); // 影面具眼缝
    }
    // 紫电贯串（沿轨迹的锯齿紫电）
    for (let k = 0; k < 3; k++) {
      const i0 = Math.floor((k / 3) * (kit.n - 1));
      const i1 = Math.min(kit.n - 1, i0 + Math.floor(kit.n / 3));
      const p0 = kit.at(i0), p1 = kit.at(i1);
      g.lineStyle(1.4, a, 0.75 * hot);
      g.beginPath();
      g.moveTo(p0.x, p0.y);
      const seg = 4;
      for (let s = 1; s <= seg; s++) {
        const u = s / seg;
        g.lineTo(p0.x + (p1.x - p0.x) * u + Math.sin(now / 42 + k + s) * 4, p0.y + (p1.y - p0.y) * u + Math.cos(now / 48 + s) * 4);
      }
      g.strokePath();
    }
    // 静默斩痕（球头一道细白斩线，先亮后隐）
    const head = kit.at(kit.n - 1);
    const prev = kit.at(Math.max(0, kit.n - 4));
    const dx = head.x - prev.x, dy = head.y - prev.y;
    const l = Math.hypot(dx, dy) || 1;
    const slash = Math.abs(Math.sin(now / 110));
    g.lineStyle(2, 0xffffff, slash * 0.9 * hot);
    g.lineBetween(head.x - (dx / l) * 11, head.y - (dy / l) * 11, head.x + (dx / l) * 11, head.y + (dy / l) * 11);
    g.fillStyle(0xd8d0e8, 0.9 * hot);
    g.fillCircle(head.x, head.y, 2.4);
    for (let k = 0; k < 4; k++) { // 消散紫尘
      const i = Math.floor(((k + 0.4) / 4) * (kit.n - 1));
      const p = kit.at(i);
      const ph = (now / 300 + k / 4) % 1;
      g.fillStyle(a, (0.7 * (1 - ph)) * hot);
      g.fillCircle(p.x + Math.sin(ph * 5 + k) * 5, p.y + Math.cos(ph * 4 + k) * 5, 1.4 * (1 - ph) + 0.4);
    }
  } },
};
