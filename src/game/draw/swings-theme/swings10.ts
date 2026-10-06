import type { SwingArt } from './shared';

/** 批九主题挥拍拖尾（童话王国 / 深夜食堂 / 猫咖物语）。kit 提供轨迹 pts/ribbon/core/at/dot。 */
export const SWINGS_10: Record<string, SwingArt> = {
  taleSwing: { a: 0x9b5cff, draw: (g, now, hot, kit, c, a) => {
    // 魔法冲击：魔杖挥出的魔法冲击——星辉刃 + 魔阵环 + 星星爆散 + 彩泡
    kit.ribbon(10, c, 0.5 * hot);
    kit.ribbon(5, 0xffffff, 0.75 * hot);
    kit.ribbon(2.4, a, 0.85 * hot, -1.2);
    // 魔阵环（球头处的旋转魔阵：双环 + 四角星）
    const head = kit.at(kit.n - 1);
    const rot = now / 250;
    g.lineStyle(1.6, a, 0.8 * hot);
    g.strokeCircle(head.x, head.y, 8);
    g.lineStyle(1, c, 0.6 * hot);
    g.strokeCircle(head.x, head.y, 12);
    for (let k = 0; k < 4; k++) {
      const ang = rot + (k / 4) * Math.PI * 2;
      g.fillStyle(a, 0.9 * hot);
      g.save();
      g.translateCanvas(head.x + Math.cos(ang) * 12, head.y + Math.sin(ang) * 12);
      g.rotateCanvas(ang);
      g.fillPoints([
        { x: 0, y: -3.4 }, { x: 2.4, y: 0 }, { x: 0, y: 3.4 }, { x: -2.4, y: 0 },
      ] as never, true);
      g.restore();
    }
    g.fillStyle(0xffffff, 0.9 * hot);
    g.fillCircle(head.x, head.y, 2.4);
    for (let k = 0; k < 5; k++) { // 星星爆散
      const i = Math.floor(((k + 0.3) / 5) * (kit.n - 1));
      const p = kit.at(i);
      const ph = (now / 350 + k / 5) % 1;
      g.save();
      g.translateCanvas(p.x + Math.sin(ph * 4 + k) * 5, p.y - ph * 10);
      g.rotateCanvas(ph * 5 + k);
      g.fillStyle(k % 2 ? a : c, (0.8 * (1 - ph)) * hot);
      g.fillPoints([
        { x: 0, y: -3 }, { x: 2.4, y: 0 }, { x: 0, y: 3 }, { x: -2.4, y: 0 },
      ] as never, true);
      g.restore();
    }
    for (let k = 0; k < 3; k++) { // 彩泡（浮起的彩泡）
      const ph = (now / 700 + k / 3) % 1;
      g.lineStyle(1, 0xffffff, 0.5 * (1 - ph) * hot);
      g.strokeCircle(head.x - 8 + k * 8, head.y + 6 - ph * 20, 2 + ph * 3);
    }
  } },
  dinSwing: { a: 0xff7a3a, draw: (g, now, hot, kit, c, a) => {
    // 颠勺猛火：大勺扬起的猛火——火舌扫面 + 勺影 + 食材飞溅 + 灶火星
    kit.ribbon(13, 0xd88a3a, 0.35 * hot);
    kit.ribbon(8, c, 0.6 * hot);
    kit.ribbon(3.4, 0xffe15c, 0.9 * hot);
    // 勺影残像（轨迹上两个铁勺影）
    for (let k = 1; k <= 2; k++) {
      const p = kit.at(Math.max(0, kit.n - k * 6));
      g.save();
      g.translateCanvas(p.x, p.y);
      g.rotateCanvas(k * 0.6 + Math.sin(now / 200) * 0.2);
      g.fillStyle(0x39424e, (0.5 - k * 0.15) * hot);
      g.fillEllipse(0, 0, 12, 8);
      g.fillRect(-2, 4, 4, 10);
      g.restore();
    }
    // 食材飞溅（青葱/辣椒丁在火里跳）
    const cols = [0x7dffc4, 0xe8404a, 0xffd45c, 0xf0ead8];
    for (let k = 0; k < 6; k++) {
      const i = Math.floor(((k + 0.25) / 6) * (kit.n - 1));
      const p = kit.at(i);
      const ph = (now / 300 + k / 6) % 1;
      g.fillStyle(cols[k % 4], (0.9 * (1 - ph)) * hot);
      g.fillRect(p.x + Math.sin(k * 2.4) * 6 - 1.4, p.y - Math.sin(ph * Math.PI) * 12 - 1.4, 2.8, 2.8);
    }
    // 灶火星（球头喷出的火星）
    for (let k = 0; k < 4; k++) {
      const i = Math.floor(((k + 0.4) / 4) * (kit.n - 1));
      const p = kit.at(i);
      const ph = (now / 250 + k / 4) % 1;
      const gl = 0.5 + 0.5 * Math.abs(Math.sin(now / 160 + k * 2));
      g.fillStyle(k % 2 ? a : 0xffe15c, gl * (1 - ph) * hot);
      g.fillCircle(p.x + Math.sin(ph * 5 + k) * 6, p.y - ph * 12, 1.5 * (1 - ph) + 0.5);
    }
    const head = kit.at(kit.n - 1);
    g.fillStyle(0xffe15c, 0.9 * hot);
    g.fillCircle(head.x, head.y, 2.6);
    g.fillStyle(0xffffff, 0.7 * hot);
    g.fillCircle(head.x, head.y, 1.2);
  } },
  catSwing: { a: 0xe8a050, draw: (g, now, hot, kit, c, a) => {
    // 猫猫重击：巨猫爪拍击——软爪巨痕 + 肉球冲击 + 爪痕三线 + 惊飞毛絮
    kit.ribbon(16, c, 0.45 * hot);
    kit.ribbon(9, a, 0.6 * hot);
    kit.ribbon(3.6, 0xffd8a8, 0.85 * hot);
    // 软爪巨痕（球头处的圆爪痕 + 三趾）
    const head = kit.at(kit.n - 1);
    const squish = 1 + Math.sin(now / 200) * 0.1;
    g.fillStyle(c, 0.7 * hot);
    g.fillEllipse(head.x, head.y, 12 * squish, 8);
    g.fillStyle(a, 0.9 * hot);
    for (let k = 0; k < 3; k++) {
      g.fillCircle(head.x - 3.4 + k * 3.4, head.y - 4.4, 1.8);
    }
    g.fillStyle(0xffd8a8, 0.8 * hot);
    g.fillEllipse(head.x, head.y, 6 * squish, 4);
    // 肉球冲击波（外扩的软环）
    const ph = (now / 500) % 1;
    g.lineStyle(3 * (1 - ph) + 0.6, a, (0.6 * (1 - ph)) * hot);
    g.strokeCircle(head.x, head.y, 8 + ph * 16);
    // 爪痕三线（轨迹中段的抓痕线）
    const mid = kit.at(Math.floor(kit.n / 2));
    g.lineStyle(1.6, a, 0.7 * hot);
    for (let k = -1; k <= 1; k++) {
      g.lineBetween(mid.x - 5, mid.y + k * 4, mid.x + 5, mid.y + k * 4 + 2);
    }
    for (let k = 0; k < 6; k++) { // 惊飞毛絮
      const i = Math.floor(((k + 0.25) / 6) * (kit.n - 1));
      const p = kit.at(i);
      const pk = (now / 380 + k / 6) % 1;
      g.fillStyle(k % 2 ? 0xffb0c8 : 0xffd8a8, (0.8 * (1 - pk)) * hot);
      g.fillCircle(p.x + Math.sin(k * 2.4) * 6 + pk * 4, p.y - pk * 11, 1.5 * (1 - pk) + 0.5);
      g.fillStyle(0xffffff, 0.4 * (1 - pk) * hot);
      g.fillCircle(p.x + Math.sin(k * 2.4) * 6 + pk * 4 - 0.6, p.y - pk * 11 - 0.6, 0.7);
    }
    g.fillStyle(0xffd8a8, 0.9 * hot);
    g.fillCircle(head.x, head.y, 2);
  } },
};
