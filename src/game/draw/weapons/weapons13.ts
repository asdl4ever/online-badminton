import { handle, pommel, TAU, type WeaponArt } from './shared';

/** 批十主题武器（电竞赛场 / 末日废土 / 星光偶像）。局部空间：柄在 x ∈ [-13,-2]，拍框中心 ≈ (9,0)。 */
export const WEAPONS_13: Record<string, WeaponArt> = {
  esportRacketA: { c: 0xff2e88, a: 0x00e5ff, draw: (g, now, c, a) => {
    // 电竞鼠标·拍：拍面是一枚电竞游戏鼠标——鼠身 + 滚轮 + RGB 尾光 + 点击涟漪
    handle(g, -13, 0, 4.4, 0x1c2430);
    pommel(g, -13.4, 2.2, a);
    g.fillStyle(0x1c2430, 1); // 鼠身（流线）
    g.fillPoints([
      { x: -2, y: -5 }, { x: 16, y: -8 }, { x: 30, y: -5 }, { x: 34, y: 2 }, { x: 22, y: 8 }, { x: -2, y: 5 },
    ] as never, true);
    g.fillStyle(0x2a3648, 0.8); // 鼠身按键分缝
    g.lineBetween(10, -6.4, 10, 6);
    g.fillStyle(c, 0.9); // 滚轮
    g.fillRoundedRect(8, -1.6, 4, 3.2, 1.4);
    const gl = 0.5 + 0.5 * Math.sin(now / 200); // RGB 尾光
    g.fillStyle(gl > 0.5 ? a : c, 0.9);
    g.fillRoundedRect(26, -3.4, 7, 6.8, 2.4);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(29.4, 0, 1.2);
    // 点击涟漪（点击时从滚轮荡出）
    const click = (now / 800) % 1;
    g.lineStyle(1.4, a, (0.7 * (1 - click)));
    g.strokeCircle(10, 0, 4 + click * 7);
  } },
  esportRacketB: { c: 0x00e5ff, a: 0xff2e88, draw: (g, now, c, a) => {
    // 光速刃·拍：拍面是一柄光速战刃——能量刃体 + 双轨导槽 + 超载流光
    handle(g, -13, 0, 4.6, 0x1c2430);
    pommel(g, -13.4, 2.2, a);
    g.fillStyle(0x1c2430, 1); // 刃座
    g.fillRoundedRect(-2, -5, 10, 10, 2);
    g.fillStyle(c, 1); // 能量刃体
    g.fillPoints([
      { x: 8, y: -6.4 }, { x: 28, y: -3.4 }, { x: 38, y: 0 }, { x: 28, y: 3.4 }, { x: 8, y: 6.4 },
    ] as never, true);
    g.fillStyle(0xffffff, 0.5); // 刃面
    g.fillPoints([
      { x: 8, y: -6.4 }, { x: 28, y: -3.4 }, { x: 24, y: -0.6 }, { x: 8, y: -1 },
    ] as never, true);
    for (const s of [-1, 1]) { // 双轨导槽（能量沿轨冲向刃尖）
      g.lineStyle(1.4, s > 0 ? a : c, 0.85);
      g.lineBetween(10, s * 3.4, 34, s * 1.6);
      const u = (now / 300 + (s > 0 ? 0 : 0.5)) % 1;
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(10 + u * 24, s * (3.4 - u * 1.8), 1.2);
    }
    const ol = 0.4 + 0.5 * Math.abs(Math.sin(now / 180)); // 超载流光（刃尖超载）
    g.fillStyle(0xffffff, ol);
    g.fillCircle(38, 0, 2.4);
    g.fillStyle(a, ol * 0.4);
    g.fillCircle(38, 0, 5);
  } },
  wasteRacketA: { c: 0x8a7a5a, a: 0xff8a3c, draw: (g, now, c, a) => {
    // 钢管·拍：拍面是一根缠带钢管——锈钢管 + 缠布握把 + 管口毛刺 + 火光反射
    handle(g, -13, 0, 4.6, 0x8a5a3a);
    pommel(g, -13.4, 2.4, a);
    g.fillStyle(c, 1); // 锈钢管
    g.fillRect(-2, -3.4, 40, 6.8);
    g.fillStyle(0x6a5a3a, 0.7); // 锈斑
    g.fillEllipse(8, 0, 6, 4);
    g.fillEllipse(24, -0.4, 5, 3);
    g.fillStyle(0x4a4030, 0.9); // 管箍两道
    g.fillRect(6, -3.4, 2.4, 6.8);
    g.fillRect(22, -3.4, 2.4, 6.8);
    // 管口毛刺（锯齿状断口）
    g.fillStyle(c, 1);
    for (let k = 0; k < 3; k++) {
      g.fillTriangle(38, -3.4 + k * 3.2, 38, -1.6 + k * 3.2, 43, -2.4 + k * 3.4);
    }
    const gl = 0.4 + 0.4 * Math.sin(now / 260); // 火光反射（管身橘光）
    g.fillStyle(a, gl * 0.5);
    g.fillRect(30, -3.4, 8, 1.6);
    // 缠布握把（柄上布条）
    g.fillStyle(0xd9c8a0, 0.9);
    g.fillRoundedRect(-11, -2.6, 8, 5.2, 2);
    g.lineStyle(0.8, 0x8a7a5a, 0.8);
    g.lineBetween(-9.4, -2.6, -8.4, 2.6);
  } },
  wasteRacketB: { c: 0x8a94a2, a: 0xff8a3c, draw: (g, now, _c, a) => {
    // 电锯·拍：拍面是一把咆哮电锯——锯体 + 导板锯齿链（转动）+ 引擎 + 排气
    handle(g, -13, 0, 4.6, 0x8a5a3a);
    pommel(g, -13.4, 2.2, a);
    g.fillStyle(0x39424e, 1); // 锯体引擎
    g.fillRoundedRect(-2, -6, 16, 12, 3);
    g.fillStyle(0xff8a3c, 0.7 + 0.3 * Math.sin(now / 120)); // 引擎散热灯
    g.fillRect(0, -3, 8, 2.4);
    g.fillStyle(0x5a6472, 1); // 导板
    g.fillRoundedRect(14, -3, 30, 6, 2);
    // 锯齿链（沿导板转动的小齿）
    const roll = now / 60;
    for (let k = 0; k < 8; k++) {
      const px = 15 + ((k * 3.8 + roll * 3.8) % 28);
      g.fillStyle(0xd8d0c0, 0.95);
      g.fillTriangle(px, -3, px + 2.4, -3, px + 1.2, -6);
      g.fillTriangle(px, 3, px + 2.4, 3, px + 1.2, 6);
    }
    g.lineStyle(1, a, 0.6); // 导板中线
    g.lineBetween(14, 0, 44, 0);
    // 排气烟
    for (let k = 0; k < 2; k++) {
      const ph = (now / 700 + k / 2) % 1;
      g.fillStyle(0x4a4030, 0.35 * (1 - ph));
      g.fillCircle(-4 + Math.sin(ph * 4 + k) * 2, -8 - ph * 12, 1.6 + ph * 3);
    }
    // 引擎震动线
    g.lineStyle(1, a, 0.6);
    for (let k = 0; k < 2; k++) {
      g.lineBetween(2 + k * 8, -7, 4 + k * 8, -9 + Math.sin(now / 40 + k) * 1.4);
    }
  } },
  idolRacketA: { c: 0xff9adf, a: 0xffd45c, draw: (g, now, c, a) => {
    // 星光麦·拍：拍面是一支偶像麦克风——麦头网罩 + 星星装饰 + 手柄缠带 + 声波
    handle(g, -13, 0, 4.4, 0x8a5a3a);
    pommel(g, -13.4, 2.2, a);
    g.fillStyle(0x8a6a3a, 1); // 麦杆
    g.fillRect(-2, -2.6, 22, 5.2);
    g.fillStyle(0xfff0d8, 0.5); // 杆面光
    g.fillRect(-2, -2.6, 22, 1.6);
    g.fillStyle(0x39424e, 1); // 网罩头
    g.fillCircle(27, 0, 8.4);
    g.fillStyle(0x5a6472, 0.6); // 网纹
    for (let k = 0; k < 3; k++) {
      g.beginPath(); g.arc(27, 0, 7 - k * 2, 0, TAU); g.strokePath();
    }
    // 网罩上五角星
    g.fillStyle(a, 0.95);
    g.save();
    g.translateCanvas(27, 0);
    g.rotateCanvas(now / 500);
    g.fillPoints((() => {
      const vs = [];
      for (let s = 0; s < 10; s++) {
        const ang = (s / 10) * TAU - Math.PI / 2;
        const rr = s % 2 ? 1.8 : 4;
        vs.push({ x: Math.cos(ang) * rr, y: Math.sin(ang) * rr });
      }
      return vs;
    })() as never, true);
    g.restore();
    // 声波（从网罩荡出）
    for (let k = 0; k < 2; k++) {
      const ph = (now / 700 + k / 2) % 1;
      g.lineStyle(1.2, c, 0.5 * (1 - ph));
      g.strokeCircle(27, 0, 11 + ph * 8);
    }
    // 柄尾彩带
    g.fillStyle(a, 0.9);
    g.fillTriangle(-13.4, 2.4, -9.4, 2.4, -11.4 + Math.sin(now / 300) * 1.4, 9);
  } },
  idolRacketB: { c: 0xff5a8a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 电吉他·拍：拍面是一柄电吉他——琴身双切角 + 拾音器 + 琴颈品格 + 声波爆
    handle(g, -13, 0, 4.4, 0x8a5a3a);
    pommel(g, -13.4, 2.2, a);
    g.fillStyle(c, 1); // 琴颈
    g.fillRect(-2, -2, 20, 4);
    g.fillStyle(0xfff0d8, 0.7); // 品格
    for (let k = 0; k < 4; k++) g.fillRect(1 + k * 4.4, -2, 0.9, 4);
    g.fillStyle(c, 1); // 琴身（双切角造型）
    g.fillPoints([
      { x: 18, y: -2 }, { x: 24, y: -8 }, { x: 34, y: -9 }, { x: 40, y: -2 },
      { x: 38, y: 7 }, { x: 28, y: 9 }, { x: 18, y: 6 },
    ] as never, true);
    g.fillStyle(0xff8ab0, 0.6); // 琴身高光
    g.fillPoints([
      { x: 24, y: -8 }, { x: 34, y: -9 }, { x: 38, y: -2 }, { x: 28, y: -2 },
    ] as never, true);
    g.fillStyle(0x1a1222, 1); // 拾音器
    g.fillRect(24, -4.4, 10, 3);
    g.fillRect(24, 1.4, 10, 3);
    g.fillStyle(0xffffff, 0.8); // 琴弦
    for (let k = 0; k < 3; k++) g.lineBetween(-2, -1.4 + k * 1.4, 36, -1 + k * 1.2);
    // 声波爆（琴身荡出的音浪环）
    for (let k = 0; k < 2; k++) {
      const ph = (now / 800 + k / 2) % 1;
      g.lineStyle(1.4, a, 0.5 * (1 - ph));
      g.strokeCircle(30, 0, 12 + ph * 10);
    }
    const gl = 0.4 + 0.4 * Math.sin(now / 240); // 琴身星光
    g.fillStyle(0xffffff, gl * 0.7);
    g.fillCircle(30, -4, 1.6);
  } },
};
