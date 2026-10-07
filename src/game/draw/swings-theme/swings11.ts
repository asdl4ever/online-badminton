import { TAU, type SwingArt } from './shared';

/** 批十主题挥拍拖尾（电竞赛场 / 末日废土 / 星光偶像）。kit 提供轨迹 pts/ribbon/core/at/dot。 */
export const SWINGS_11: Record<string, SwingArt> = {
  esportSwing: { a: 0x00e5ff, draw: (g, now, hot, kit, c, a) => {
    // 终结一击：决胜局的终结技——超窄极速刃 + 双频残像 + K.O. 爆字闪 + 帧冻结线
    kit.ribbon(7, c, 0.6 * hot);
    kit.ribbon(3, 0xffffff, 0.9 * hot);
    kit.ribbon(1.4, a, 0.9 * hot, -1.2);
    // 双频残像（轨迹上的青/品红错位重影）
    for (let k = 0; k < 2; k++) {
      const off = k ? 3 : -3;
      g.lineStyle(1.6, k ? a : c, 0.5 * hot);
      g.beginPath();
      for (let s = 0; s < kit.n; s += 2) {
        const p = kit.at(s);
        if (s === 0) g.moveTo(p.x + off, p.y);
        else g.lineTo(p.x + off, p.y);
      }
      g.strokePath();
    }
    // K.O. 爆字闪（球头处周期闪出的爆裂星芒）
    const head = kit.at(kit.n - 1);
    const burst = (now / 650) % 1;
    const bl = Math.abs(Math.sin(now / 140));
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * TAU + now / 300;
      const len = 6 + burst * 12;
      g.lineStyle(2, k % 2 ? a : 0xffffff, (0.9 - burst * 0.6) * hot);
      g.lineBetween(head.x + Math.cos(ang) * 4, head.y + Math.sin(ang) * 4, head.x + Math.cos(ang) * (4 + len), head.y + Math.sin(ang) * (4 + len));
    }
    g.fillStyle(0xffffff, bl * hot);
    g.fillCircle(head.x, head.y, 3);
    // 帧冻结线（轨迹上的竖直扫描细线）
    for (let k = 0; k < 4; k++) {
      const i = Math.floor(((k + 0.3) / 4) * (kit.n - 1));
      const p = kit.at(i);
      g.lineStyle(1, c, 0.4 * hot);
      g.lineBetween(p.x, p.y - 8, p.x, p.y + 8);
    }
  } },
  wasteSwing: { a: 0xff8a3c, draw: (g, now, hot, kit, c, a) => {
    // 爆裂重锤：废土重锤的爆裂一击——重锤弧面 + 链锤残影 + 爆炸火球 + 碎铁飞溅
    kit.ribbon(16, 0x6a5a3a, 0.4 * hot);
    kit.ribbon(10, c, 0.6 * hot);
    kit.ribbon(4, 0xffe15c, 0.9 * hot);
    // 链锤残影（轨迹上三个渐隐铁球）
    for (let k = 1; k <= 3; k++) {
      const p = kit.at(Math.max(0, kit.n - k * 6));
      g.fillStyle(0x39424e, (0.55 - k * 0.14) * hot);
      g.fillCircle(p.x, p.y, 8 - k * 1.4);
      g.fillStyle(0x8a94a2, (0.5 - k * 0.13) * hot);
      g.fillCircle(p.x - 1.4, p.y - 1.4, 3.4 - k * 0.7);
      // 链锤尖刺
      for (let s = 0; s < 4; s++) {
        const ang = (s / 4) * TAU + k;
        g.fillStyle(0x8a94a2, (0.5 - k * 0.13) * hot);
        g.fillTriangle(
          p.x + Math.cos(ang) * (8 - k * 1.4), p.y + Math.sin(ang) * (8 - k * 1.4),
          p.x + Math.cos(ang + 0.5) * (8 - k * 1.4), p.y + Math.sin(ang + 0.5) * (8 - k * 1.4),
          p.x + Math.cos(ang + 0.25) * (12 - k * 1.6), p.y + Math.sin(ang + 0.25) * (12 - k * 1.6),
        );
      }
    }
    // 爆炸火球（球头周期爆开的三层火球）
    const head = kit.at(kit.n - 1);
    const boom = (now / 700) % 1;
    if (boom < 0.5) {
      const bz = Math.sin(boom * Math.PI);
      g.fillStyle(c, 0.5 * bz * hot);
      g.fillCircle(head.x, head.y, 10 + bz * 10);
      g.fillStyle(0xffe15c, 0.8 * bz * hot);
      g.fillCircle(head.x, head.y, 6 + bz * 5);
      g.fillStyle(0xffffff, 0.9 * bz * hot);
      g.fillCircle(head.x, head.y, 2.6);
    }
    for (let k = 0; k < 6; k++) { // 碎铁飞溅
      const i = Math.floor(((k + 0.2) / 6) * (kit.n - 1));
      const p = kit.at(i);
      const ph = (now / 320 + k / 6) % 1;
      g.fillStyle(k % 2 ? 0x8a94a2 : a, (0.85 * (1 - ph)) * hot);
      g.save();
      g.translateCanvas(p.x + Math.sin(k * 2.4) * 6, p.y - ph * 12);
      g.rotateCanvas(ph * 8 + k);
      g.fillRect(-1.6, -1.2, 3.2, 2.4);
      g.restore();
    }
  } },
  idolSwing: { a: 0xff5a8a, draw: (g, now, hot, kit, c, a) => {
    // 谢幕爆点：演唱会谢幕的最后一击——星光辉刃 + 荧光海浪 + 抛洒星光 + 爆点闪光
    kit.ribbon(12, c, 0.5 * hot);
    kit.ribbon(7, 0xffd45c, 0.65 * hot);
    kit.ribbon(3, 0xffffff, 0.9 * hot);
    // 星光辉刃（球头处的五角星大爆星）
    const head = kit.at(kit.n - 1);
    const spin = now / 200;
    g.fillStyle(a, 0.3 * hot);
    g.fillCircle(head.x, head.y, 12);
    g.fillStyle(c, 0.95 * hot);
    g.save();
    g.translateCanvas(head.x, head.y);
    g.rotateCanvas(spin);
    g.fillPoints((() => {
      const vs = [];
      for (let s = 0; s < 10; s++) {
        const ang = (s / 10) * TAU - Math.PI / 2;
        const rr = s % 2 ? 3.4 : 8.4;
        vs.push({ x: Math.cos(ang) * rr, y: Math.sin(ang) * rr });
      }
      return vs;
    })() as never, true);
    g.restore();
    g.fillStyle(0xffffff, 0.85 * hot);
    g.fillCircle(head.x, head.y, 2.4);
    // 荧光海浪（轨迹下方的应援浪两道）
    for (let k = 0; k < 2; k++) {
      g.lineStyle(2.4, k ? a : c, 0.5 * hot);
      g.beginPath();
      for (let s = 0; s < kit.n; s++) {
        const p = kit.at(s);
        const y = p.y + 8 + k * 4 + Math.sin(s * 0.7 + now / 220 + k) * 2.4;
        if (s === 0) g.moveTo(p.x, y);
        else g.lineTo(p.x, y);
      }
      g.strokePath();
    }
    // 抛洒星光
    for (let k = 0; k < 6; k++) {
      const i = Math.floor(((k + 0.25) / 6) * (kit.n - 1));
      const p = kit.at(i);
      const ph = (now / 420 + k / 6) % 1;
      g.save();
      g.translateCanvas(p.x + Math.sin(k * 2.4) * 7 + pk(ph, k), p.y - ph * 14);
      g.rotateCanvas(ph * 6 + k);
      g.fillStyle(k % 2 ? a : 0xffd45c, (0.85 * (1 - ph)) * hot);
      g.fillPoints([
        { x: 0, y: -2.4 }, { x: 2.4, y: 0 }, { x: 0, y: 2.4 }, { x: -2.4, y: 0 },
      ] as never, true);
      g.restore();
    }
    function pk(ph: number, k: number): number { return Math.sin(ph * 4 + k) * 2; }
    // 爆点闪光（球头白闪）
    const flash = Math.abs(Math.sin(now / 150));
    g.fillStyle(0xffffff, flash * 0.8 * hot);
    g.fillCircle(head.x, head.y, 4);
  } },
};
