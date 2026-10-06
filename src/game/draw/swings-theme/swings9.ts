import type { SwingArt } from './shared';

/** 批八主题挥拍拖尾（敦煌飞天 / 羽蛇神殿 / 圣辉天界）。kit 提供轨迹 pts/ribbon/core/at/dot。 */
export const SWINGS_9: Record<string, SwingArt> = {
  dunSwing: { a: 0xff9adf, draw: (g, now, hot, kit, c, a) => {
    // 飘带回旋：长绸甩出的回旋斩——绸带三叠刃 + 回旋花 + 散花 + 柔光
    for (let k = 0; k < 3; k++) { // 三叠绸刃（错相位的三道绸光）
      kit.ribbon(k === 1 ? 9 : 5, k === 1 ? 0xffffff : (k ? a : c), (0.55 - k * 0.1) * hot, (k - 1) * 2.4);
    }
    // 回旋花（球头处绸带卷成的花结）
    const head = kit.at(kit.n - 1);
    const rot = now / 260;
    for (let k = 0; k < 5; k++) {
      const ang = rot + (k / 5) * Math.PI * 2;
      g.lineStyle(2, k % 2 ? a : c, 0.8 * hot);
      g.beginPath();
      g.arc(head.x + Math.cos(ang) * 5, head.y + Math.sin(ang) * 5, 4.4, ang, ang + 2.4);
      g.strokePath();
    }
    g.fillStyle(0xffffff, 0.9 * hot);
    g.fillCircle(head.x, head.y, 2.2);
    // 散花（沿轨迹散落的旋花）
    for (let k = 0; k < 5; k++) {
      const i = Math.floor(((k + 0.3) / 5) * (kit.n - 1));
      const p = kit.at(i);
      const ph = (now / 500 + k / 5) % 1;
      g.save();
      g.translateCanvas(p.x + Math.sin(ph * 4 + k) * 6, p.y - ph * 10);
      g.rotateCanvas(ph * 6 + k);
      g.fillStyle(k % 2 ? a : 0xffb0c8, (0.7 * (1 - ph)) * hot);
      g.fillEllipse(0, 0, 3.4, 1.8);
      g.restore();
    }
  } },
  aztSwing: { a: 0x3ad49a, draw: (g, now, hot, kit, c, a) => {
    // 猛虎扑击：翡翠猛虎扑杀——宽爪痕三道 + 虎纹残影 + 咬合双颚 + 裂地尘
    kit.ribbon(15, 0xb8943a, 0.4 * hot);
    kit.ribbon(9, c, 0.6 * hot);
    kit.ribbon(3.4, 0xbfffe0, 0.85 * hot);
    // 爪痕三道（球头处三道深爪痕）
    const head = kit.at(kit.n - 1);
    const prev = kit.at(Math.max(0, kit.n - 5));
    const ang = Math.atan2(head.y - prev.y, head.x - prev.x);
    for (let k = -1; k <= 1; k++) {
      g.save();
      g.translateCanvas(head.x, head.y);
      g.rotateCanvas(ang);
      g.lineStyle(2.8, a, 0.85 * hot);
      g.beginPath();
      g.moveTo(-7, k * 5.4);
      g.lineTo(5, k * 5.4 - 2);
      g.strokePath();
      g.fillStyle(0xffd45c, 0.9 * hot);
      g.fillCircle(6, k * 5.4 - 2, 1.3);
      g.restore();
    }
    // 虎纹残影（轨迹上两道虎纹影）
    for (let k = 0; k < 2; k++) {
      const i = Math.floor(((k + 0.3) / 2) * (kit.n - 1));
      const p = kit.at(i);
      g.save();
      g.translateCanvas(p.x, p.y);
      g.rotateCanvas(ang);
      g.fillStyle(0x1e3a2e, (0.35 - k * 0.1) * hot);
      for (let s = 0; s < 3; s++) g.fillRect(-5 + s * 5, -5 + s * 1.4, 1.6, 8);
      g.restore();
    }
    // 咬合双颚（球头前的上下颚弧）
    const bite = Math.abs(Math.sin(now / 160));
    g.lineStyle(2.4, c, 0.8 * hot);
    g.beginPath();
    g.arc(head.x + 6, head.y - 3, 5, Math.PI * 0.2, Math.PI * 0.9 + bite * 0.3);
    g.strokePath();
    g.beginPath();
    g.arc(head.x + 6, head.y + 3, 5, -Math.PI * 0.9 - bite * 0.3, -Math.PI * 0.2);
    g.strokePath();
    for (let k = 0; k < 5; k++) { // 裂地尘屑
      const i = Math.floor(((k + 0.3) / 5) * (kit.n - 1));
      const p = kit.at(i);
      const ph = (now / 320 + k / 5) % 1;
      g.fillStyle(k % 2 ? a : 0xc0b090, (0.8 * (1 - ph)) * hot);
      g.fillRect(p.x + Math.sin(k * 2.2) * 5 - 1.2, p.y - ph * 9 - 1.2, 2.4, 2.4);
    }
  } },
  angSwing: { a: 0xffd45c, draw: (g, now, hot, kit, c, a) => {
    // 天罚斩：圣剑的天罚一击——金白巨刃 + 审判之环 + 落雷 + 羽落
    kit.ribbon(14, c, 0.5 * hot);
    kit.ribbon(8, 0xffffff, 0.75 * hot);
    kit.ribbon(2.6, a, 0.9 * hot, -1.4);
    // 审判之环（球头处收缩的审判环）
    const head = kit.at(kit.n - 1);
    const ring = (now / 600) % 1;
    g.lineStyle(3 * (1 - ring) + 0.6, a, (0.8 * (1 - ring)) * hot);
    g.strokeCircle(head.x, head.y, 14 - ring * 9);
    g.lineStyle(1.4, 0xffffff, (0.6 * (1 - ring)) * hot);
    g.strokeCircle(head.x, head.y, (14 - ring * 9) * 0.7);
    // 落雷（刃尖处劈下的小圣雷）
    const strike = (now / 800) % 1;
    if (strike < 0.25) {
      const sw = 1 - strike / 0.25;
      g.lineStyle(2, 0xffffff, sw * hot);
      g.beginPath();
      g.moveTo(head.x, head.y - 20);
      g.lineTo(head.x + Math.sin(now / 60) * 4, head.y - 12);
      g.lineTo(head.x - Math.sin(now / 50) * 3, head.y - 5);
      g.lineTo(head.x, head.y);
      g.strokePath();
      g.fillStyle(a, sw * 0.6 * hot);
      g.fillCircle(head.x, head.y, 8 * sw + 2);
    }
    // 圣十字（轨迹中段的十字圣光）
    const mid = kit.at(Math.floor(kit.n / 2));
    const cross = 0.5 + 0.5 * Math.sin(now / 300);
    g.lineStyle(2, 0xffffff, cross * 0.7 * hot);
    g.lineBetween(mid.x, mid.y - 8, mid.x, mid.y + 8);
    g.lineBetween(mid.x - 8, mid.y, mid.x + 8, mid.y);
    for (let k = 0; k < 5; k++) { // 羽落
      const i = Math.floor(((k + 0.3) / 5) * (kit.n - 1));
      const p = kit.at(i);
      const ph = (now / 600 + k / 5) % 1;
      g.save();
      g.translateCanvas(p.x + Math.sin(ph * 4 + k) * 5, p.y - ph * 12);
      g.rotateCanvas(ph * 5 + k);
      g.fillStyle(k % 2 ? 0xffffff : 0xf0e8d0, (0.7 * (1 - ph)) * hot);
      g.fillEllipse(0, 0, 4.4, 1.8);
      g.restore();
    }
    g.fillStyle(0xffffff, 0.9 * hot);
    g.fillCircle(head.x, head.y, 2.6);
  } },
};
