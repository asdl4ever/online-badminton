import { hpoly, TAU, type HatArt } from './shared';

/** 批七主题头饰（赛博都市 / 东海龙宫 / 时空旅行） */
export const HATS_10: Record<string, HatArt> = {
  cybHatA: { c: 0x39ffd0, a: 0xff3bd4, draw: (g, now, x, hy, c, a) => {
    // 光纤头带：额带 + 两束会跑光的光纤 + 接头灯
    g.fillStyle(0x22303e, 1);
    g.fillRect(x - 15, hy - 3, 30, 6);
    g.fillStyle(0x39424e, 0.9);
    g.fillRect(x - 15, hy + 1, 30, 2);
    for (let k = 0; k < 2; k++) { // 两根光纤（弧形甩向脑后）
      const col = k ? a : c;
      g.lineStyle(1.8, col, 0.9);
      g.beginPath();
      g.moveTo(x - 12 + k * 24, hy - 2);
      g.lineTo(x - 16 + k * 32, hy - 8);
      g.lineTo(x - 18 + k * 36 + Math.sin(now / 300 + k) * 2, hy - 14);
      g.strokePath();
      const u = (now / 700 + k * 0.5) % 1; // 光脉冲沿线跑
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(x - 12 + k * 24 + u * (-6 + k * 8), hy - 2 - u * 12, 1.4);
    }
    const gl = 0.5 + 0.5 * Math.sin(now / 220); // 额带中央灯
    g.fillStyle(c, gl);
    g.fillCircle(x, hy, 2.2);
  } },
  cybHatB: { c: 0x232a3c, a: 0x39ffd0, draw: (g, now, x, hy, c, a) => {
    // 全目镜：横贯的赛博护目镜——宽镜体 + 三段镜面数据流 + 侧挂线缆
    g.fillStyle(c, 1);
    g.fillRoundedRect(x - 17, hy - 5, 34, 10, 4);
    g.fillStyle(0x0e1620, 1);
    g.fillRoundedRect(x - 15, hy - 3.4, 30, 7, 3);
    for (let k = 0; k < 3; k++) { // 三段镜面（各自滚动数据流）
      const sx = x - 13 + k * 10.4;
      g.fillStyle(k === 1 ? a : 0x1a2a4a, 0.85);
      g.fillRect(sx, hy - 2.4, 8.4, 5.8);
      for (let s = 0; s < 3; s++) {
        const ph = (now / 280 + s / 3 + k * 0.3) % 1;
        g.fillStyle(0xffffff, 0.7 * (1 - ph));
        g.fillRect(sx + 0.8, hy - 2 + ph * 5, 6.4 - ph * 3, 0.9);
      }
      g.lineStyle(0.8, c, 0.7);
      g.strokeRect(sx, hy - 2.4, 8.4, 5.8);
    }
    for (const s of [-1, 1]) { // 侧挂线缆（垂到脑后）
      g.lineStyle(1.4, s > 0 ? a : c, 0.8);
      g.beginPath();
      g.moveTo(x + s * 17, hy);
      g.lineTo(x + s * 21, hy + 4);
      g.lineTo(x + s * 19 + Math.sin(now / 350 + s) * 2, hy + 10);
      g.strokePath();
    }
    const bl = 0.5 + 0.5 * Math.sin(now / 180); // 镜顶扫描条
    g.fillStyle(0xff3bd4, bl * 0.8);
    g.fillRect(x - 15, hy - 5.4, 30 * bl, 1.2);
  } },
  dgHatA: { c: 0xe88a7a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 虾兵盔：龙宫虾兵的头盔——弯虾壳盔 + 长须两根 + 节纹
    g.fillStyle(c, 1); // 虾壳盔体（前弯弧）
    g.beginPath(); g.arc(x, hy + 2, 13, Math.PI * 1.05, TAU - 0.2); g.closePath(); g.fillPath();
    g.fillStyle(0xd06858, 0.7); // 壳面受光
    g.fillEllipse(x - 3, hy - 4, 10, 6);
    for (let k = 0; k < 3; k++) { // 壳节纹
      g.lineStyle(1, 0xb85048, 0.8);
      g.beginPath();
      g.arc(x, hy + 2, 10 - k * 3, Math.PI * 1.15, TAU - 0.4);
      g.strokePath();
    }
    g.fillStyle(0xffd45c, 1); // 额前尖刺
    g.fillTriangle(x + 8, hy - 8, x + 20, hy - 11, x + 9, hy - 4);
    for (const s of [-1, 1]) { // 长须（向后飘的弯须）
      const sway = Math.sin(now / 350 + (s > 0 ? 0 : 1.3)) * 3;
      g.lineStyle(1.4, a, 0.9);
      g.beginPath();
      g.moveTo(x + s * 4, hy - 6);
      g.lineTo(x + s * 8 + sway, hy - 16);
      g.lineTo(x + s * 6 + sway * 1.6, hy - 26);
      g.strokePath();
    }
  } },
  dgHatB: { c: 0xd9b45c, a: 0x7fd4ff, draw: (g, now, x, hy, c, a) => {
    // 龙角冠：龙宫王冠——金冠体 + 一对分叉龙角 + 冠前龙珠
    g.fillStyle(c, 1); // 冠体
    g.fillRect(x - 13, hy - 3, 26, 7);
    for (let k = -2; k <= 2; k++) { // 冠齿
      g.fillStyle(0xfff0b0, 0.9);
      g.fillTriangle(x + k * 5.2 - 2, hy - 3, x + k * 5.2 + 2, hy - 3, x + k * 5.2, hy - 8 - Math.abs(k) * -2);
    }
    for (const s of [-1, 1]) { // 一对分叉龙角（两节弯角）
      const sway = Math.sin(now / 420 + (s > 0 ? 0 : 1.1)) * 1.4;
      g.fillStyle(0xfff0b0, 0.95);
      hpoly(g, [
        [x + s * 10, hy - 3], [x + s * 14 + sway, hy - 14], [x + s * 17 + sway * 1.4, hy - 22], [x + s * 19 + sway * 1.4, hy - 19], [x + s * 15, hy - 8],
      ], 0xfff0b0, 0.95);
      g.lineStyle(0.9, 0xb8943a, 0.8); // 角节环
      g.lineBetween(x + s * 12, hy - 7, x + s * 16, hy - 9);
    }
    g.fillStyle(a, 0.9); // 冠前龙珠
    g.fillCircle(x, hy - 6, 3);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(x - 0.8, hy - 6.8, 0.9);
    const gl = 0.3 + 0.25 * Math.sin(now / 300); // 珠光晕
    g.fillStyle(a, gl * 0.4);
    g.fillCircle(x, hy - 6, 5.4);
  } },
  chronoHatA: { c: 0xb8943a, a: 0xdfe8f5, draw: (g, now, x, hy, c, _a) => {
    // 黄铜风镜：额前的双圆黄铜风镜——镜带 + 双镜片（反光扫动）+ 铆钉
    g.fillStyle(0x6a4a2a, 1); // 皮革镜带
    g.fillRect(x - 15, hy - 3, 30, 6);
    g.lineStyle(1, 0x4a3418, 0.8);
    g.lineBetween(x - 15, hy, x + 15, hy);
    for (const s of [-1, 1]) { // 双圆镜
      g.fillStyle(c, 1);
      g.fillCircle(x + s * 7.4, hy, 5.4);
      g.fillStyle(0x1a2a3a, 0.9);
      g.fillCircle(x + s * 7.4, hy, 3.8);
      const gl = 0.4 + 0.4 * Math.sin(now / 500 + s); // 玻璃反光扫动
      g.fillStyle(0xffffff, gl);
      g.fillCircle(x + s * 7.4 - 1, hy - 1, 1.4);
      g.lineStyle(1.2, 0xfff0b0, 0.8); // 铜圈
      g.strokeCircle(x + s * 7.4, hy, 5.4);
    }
    g.fillStyle(0xfff0b0, 0.9); // 中间铰链
    g.fillCircle(x, hy, 1.6);
  } },
  chronoHatB: { c: 0xd9b45c, a: 0x9b5cff, draw: (g, now, x, hy, c, a) => {
    // 星盘冠：头戴的星盘仪——铜冠 + 环形刻度盘旋转 + 指针 + 垂珠
    g.fillStyle(c, 1); // 冠体
    g.fillRect(x - 12, hy - 2, 24, 6);
    g.fillStyle(0xb8943a, 0.8);
    g.fillRect(x - 12, hy + 2, 24, 2);
    g.lineStyle(2, 0xb8943a, 0.95); // 顶上斜置星盘环
    g.save();
    g.translateCanvas(x, hy - 8);
    g.rotateCanvas(-0.3);
    g.beginPath(); g.arc(0, 0, 9, 0, TAU); g.strokePath();
    g.lineStyle(1, a, 0.8); // 盘面刻度（旋转）
    for (let k = 0; k < 8; k++) {
      const ang = now / 900 + (k / 8) * TAU;
      g.lineBetween(Math.cos(ang) * 6, Math.sin(ang) * 6, Math.cos(ang) * 9, Math.sin(ang) * 9);
    }
    g.fillStyle(a, 0.95); // 指针
    g.lineBetween(0, 0, Math.cos(now / 600) * 7, Math.sin(now / 600) * 7);
    g.restore();
    g.fillStyle(a, 0.9); // 冠前星徽
    g.fillCircle(x, hy - 4, 2);
    for (let k = 0; k < 3; k++) { // 冠沿垂珠（左右中各一，轻摆）
      const sway = Math.sin(now / 400 + k) * 1.2;
      g.fillStyle(0xfff0b0, 0.9);
      g.fillCircle(x - 8 + k * 8 + sway, hy + 6, 1.4);
    }
  } },
};
