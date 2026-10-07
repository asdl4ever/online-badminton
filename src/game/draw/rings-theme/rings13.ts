import { TAU, type RingArt } from './shared';

/** 批十二地环（变形机甲 / 蛛网游侠 / 钢铁巨兽）——原点 (x, feetY) */

export const RINGS_13: Record<string, RingArt> = {
  tfRing: { c: 0x5ac8ff, a: 0x8a94a2, draw: (g, now, x, feetY, c, a) => {
    // 履带碾压环：环形履带滚动 + 负重轮 + 碾出的油痕与火星
    const ry = feetY - 3;
    g.fillStyle(0x1a2430, 0.85); // 碾痕底
    g.fillEllipse(x, ry + 1, 58, 15);
    g.fillStyle(0x2a3a4a, 1); // 履带环
    g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26);
    g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.strokePath();
    g.lineStyle(9, 0x2a3a4a, 1);
    g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.strokePath();
    // 履带齿（滚动）
    const roll = now / 260;
    for (let k = 0; k < 22; k++) {
      const ang = roll + (k / 22) * TAU;
      g.lineStyle(3, 0x141c26, 1);
      g.beginPath();
      g.moveTo(Math.cos(ang) * 25.6, Math.sin(ang) * 25.6);
      g.lineTo(Math.cos(ang) * 34.4, Math.sin(ang) * 34.4);
      g.strokePath();
    }
    g.lineStyle(2, a, 0.45); // 履带外缘金属光
    g.beginPath(); g.arc(0, 0, 35, 0, TAU); g.strokePath();
    g.restore();
    // 负重轮三枚（错相起伏）
    for (let k = -1; k <= 1; k++) {
      const bob = Math.sin(now / 300 + k * 2.1) * 1.2;
      g.fillStyle(0x3a4a5a, 1);
      g.fillCircle(x + k * 20, ry + 2 + bob, 5);
      g.fillStyle(a, 0.85);
      g.fillCircle(x + k * 20, ry + 2 + bob, 2.2);
      g.fillStyle(0x141c26, 1);
      g.save(); g.translateCanvas(x + k * 20, ry + 2 + bob); g.scaleCanvas(1, 0.3);
      g.beginPath(); g.arc(0, 0, 1.6, 0, TAU); g.strokePath(); g.restore();
    }
    // 油痕（向前拖出的两道）
    for (const s of [-1, 1]) {
      g.fillStyle(0x0e141c, 0.5);
      g.fillEllipse(x - 40 * s, ry - 2, 26, 5);
      g.fillStyle(0x1a2430, 0.7);
      g.fillEllipse(x - 46 * s, ry - 2, 14, 3.4);
    }
    // 碾出的火星
    for (let k = 0; k < 4; k++) {
      const ph = ((now / 500 + k / 4) % 1);
      g.fillStyle(0xffd45c, 0.8 * (1 - ph));
      g.fillCircle(x - 28 + k * 20, ry - 3 - ph * 10, 1.6 * (1 - ph) + 0.4);
    }
    g.lineStyle(1.4, c, 0.4); // 环沿放电
    g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26);
    g.beginPath(); g.arc(0, 0, 38, 0, TAU); g.strokePath(); g.restore();
  } },

  spdRing: { c: 0xff4a5a, a: 0x8ae0ff, draw: (g, now, x, feetY, c, a) => {
    // 蛛网地环：地面一张蛛网 + 露珠 + 陷入的碎屑 + 蛛足投影
    const ry = feetY - 3;
    g.fillStyle(c, 0.12); // 底晕
    g.fillEllipse(x, ry, 60, 15);
    // 蛛网（12 向放射 + 4 圈同心）
    g.lineStyle(1.1, 0xf0f4f8, 0.55);
    g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26);
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * TAU;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(Math.cos(ang) * 34, Math.sin(ang) * 34);
      g.strokePath();
    }
    for (let r = 1; r <= 4; r++) {
      const rr = r * 8.4;
      g.beginPath();
      for (let k = 0; k <= 12; k++) {
        const ang = (k / 12) * TAU;
        const wob = 1 + Math.sin(now / 700 + k) * 0.03;
        if (k === 0) g.moveTo(Math.cos(ang) * rr * wob, Math.sin(ang) * rr * wob);
        else g.lineTo(Math.cos(ang) * rr * wob, Math.sin(ang) * rr * wob);
      }
      g.strokePath();
    }
    g.restore();
    // 露珠（沿网丝分布的亮点）
    for (let k = 0; k < 7; k++) {
      const ang = (k / 7) * TAU + now / 2600;
      const rr = 12 + (k % 3) * 9;
      const tw = 0.45 + 0.55 * Math.abs(Math.sin(now / 380 + k * 1.4));
      g.fillStyle(0xd8f8ff, tw * 0.85);
      g.fillCircle(x + Math.cos(ang) * rr, ry + Math.sin(ang) * rr * 0.26, 1.4);
      g.fillStyle(0xffffff, tw * 0.7);
      g.fillCircle(x + Math.cos(ang) * rr - 0.5, ry + Math.sin(ang) * rr * 0.26 - 0.5, 0.5);
    }
    // 陷入的碎屑
    for (let k = 0; k < 3; k++) {
      const ang = k * 2.2 + now / 4000;
      g.fillStyle(0x8a94a2, 0.7);
      g.save(); g.translateCanvas(x + Math.cos(ang) * 20, ry + Math.sin(ang) * 5); g.rotateCanvas(ang * 2);
      g.fillRect(-3, -2, 6, 3.4);
      g.restore();
    }
    // 粘在边缘的蛛足投影
    for (const s of [-1, 1]) {
      g.fillStyle(0x2a3a5a, 0.35);
      g.fillEllipse(x + s * 52, ry - 1, 12, 4);
    }
    g.lineStyle(1.2, a, 0.35); // 外圈蛛感微光
    g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26);
    g.beginPath(); g.arc(0, 0, 40, 0, TAU); g.strokePath(); g.restore();
  } },

  bstRing: { c: 0xff6a2a, a: 0xffd45c, draw: (g, now, x, feetY, c, a) => {
    // 碾痕地环：碎裂的钢板地面 + 熔岩缝 + 履带压痕 + 铁屑
    const ry = feetY - 3;
    g.fillStyle(0x2a2a30, 0.9); // 钢地面
    g.fillEllipse(x, ry, 62, 16);
    g.fillStyle(0x3a3a42, 0.9);
    g.fillEllipse(x, ry - 1, 52, 12);
    // 钢板裂缝（放射状）
    g.lineStyle(1.6, 0x14141a, 1);
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * TAU + 0.3;
      g.beginPath();
      g.moveTo(x, ry);
      g.lineTo(x + Math.cos(ang) * 30, ry + Math.sin(ang) * 8);
      g.strokePath();
    }
    // 熔岩缝（透出的橙光，明灭）
    for (let k = 0; k < 4; k++) {
      const heat = 0.4 + 0.35 * Math.sin(now / 420 + k * 1.5);
      g.lineStyle(2, c, heat);
      g.beginPath();
      g.moveTo(x - 24 + k * 16, ry + 3);
      g.lineTo(x - 18 + k * 16, ry - 2);
      g.lineTo(x - 22 + k * 16, ry - 6);
      g.strokePath();
      g.fillStyle(a, heat * 0.35);
      g.fillEllipse(x - 22 + k * 16, ry + 2, 10, 4);
    }
    // 履带压痕（两道弧）
    for (const s of [-1, 1]) {
      g.lineStyle(3.4, 0x1a1a20, 0.8);
      g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26);
      g.beginPath(); g.arc(0, 0, 30 + s * 7, Math.PI * 0.15, Math.PI * 0.85); g.strokePath();
      g.restore();
    }
    // 铁屑与火星
    for (let k = 0; k < 5; k++) {
      const ang = k * 1.9 + now / 3000;
      g.fillStyle(0x8a8a92, 0.75);
      g.fillRect(x + Math.cos(ang) * 34 - 2, ry + Math.sin(ang) * 9 - 1.5, 5, 3);
    }
    for (let k = 0; k < 4; k++) {
      const ph = ((now / 600 + k / 4) % 1);
      g.fillStyle(a, 0.85 * (1 - ph));
      g.fillCircle(x - 30 + k * 20, ry - 2 - ph * 12, 1.6 * (1 - ph) + 0.4);
    }
    g.lineStyle(1.5, c, 0.3 + 0.2 * Math.sin(now / 380)); // 外圈热光
    g.save(); g.translateCanvas(x, ry); g.scaleCanvas(1, 0.26);
    g.beginPath(); g.arc(0, 0, 42, 0, TAU); g.strokePath(); g.restore();
  } },
};
