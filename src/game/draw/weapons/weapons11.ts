import { handle, pommel, type WeaponArt } from './shared';

/** 批八主题武器（敦煌飞天 / 羽蛇神殿 / 圣辉天界）。局部空间：柄在 x ∈ [-13,-2]，拍框中心 ≈ (9,0)。 */
export const WEAPONS_11: Record<string, WeaponArt> = {
  dunRacketA: { c: 0xffb070, a: 0xff9adf, draw: (g, now, c, a) => {
    // 飞天绸·拍：拍面是一段旋卷的飞天长绸——绸面盘卷 + 绸上花纹 + 流光
    handle(g, -13, 0, 4.4, 0x8a5a3a);
    pommel(g, -13.4, 2.2, a);
    // 盘卷的绸面（三圈渐开的螺旋带）
    for (let k = 0; k < 3; k++) {
      const rot = now / 600 + k * 2.1;
      g.fillStyle(k % 2 ? a : c, 0.75);
      g.beginPath();
      for (let s = 0; s <= 12; s++) {
        const u = s / 12;
        const ang = rot + u * 3.8;
        const r = 4 + u * (12 - k * 2);
        const px = 9 + Math.cos(ang) * r, py = Math.sin(ang) * r;
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      for (let s = 12; s >= 0; s--) {
        const u = s / 12;
        const ang = rot + u * 3.8;
        const r = 1.4 + u * (12 - k * 2);
        g.lineTo(9 + Math.cos(ang) * r, Math.sin(ang) * r);
      }
      g.closePath(); g.fillPath();
    }
    g.lineStyle(1, 0xfff0d8, 0.6); // 绸上花纹流光
    g.beginPath();
    for (let s = 0; s <= 12; s++) {
      const u = s / 12;
      const ang = now / 600 + u * 3.8;
      g.lineTo(9 + Math.cos(ang) * (5 + u * 8), Math.sin(ang) * (5 + u * 8));
    }
    g.strokePath();
    // 绸尾（从卷心飘出的一角）
    g.fillStyle(c, 0.8);
    g.fillTriangle(9, 0, 9 - 10 - Math.sin(now / 300) * 2, -4 - Math.sin(now / 300) * 2, 9 - 8, 3 + Math.sin(now / 300 + 1) * 2);
  } },
  dunRacketB: { c: 0xc08a3a, a: 0xff9adf, draw: (g, now, c, a) => {
    // 反弹琵琶·拍：拍面是一柄反背的琵琶——梨形琴身 + 四弦 + 凤尾装饰 + 音波
    handle(g, -13, 0, 4.6, 0x6b4a2f);
    pommel(g, -13.4, 2.2, a);
    g.fillStyle(c, 1); // 琴身（梨形，头朝下反背）
    g.fillPoints([
      { x: 2, y: 8 }, { x: 6, y: -8 }, { x: 12, y: -12 }, { x: 18, y: -8 }, { x: 22, y: 8 }, { x: 12, y: 12 },
    ] as never, true);
    g.fillStyle(0xd9b45c, 0.7); // 琴面
    g.fillPoints([
      { x: 4.4, y: 6 }, { x: 8, y: -6 }, { x: 16, y: -6 }, { x: 20, y: 6 }, { x: 12, y: 9 },
    ] as never, true);
    g.lineStyle(0.9, 0x6a4018, 0.9); // 四弦
    for (let k = 0; k < 4; k++) g.lineBetween(10.4 + k * 1.2, -8, 10.4 + k * 1.2, 9);
    g.fillStyle(0xfff0d8, 0.9); // 凤尾头饰（琴头一排花）
    for (let k = 0; k < 3; k++) g.fillCircle(9 + k * 3, 10.4, 1.4);
    const gl = 0.4 + 0.4 * Math.sin(now / 320); // 琴身宝光
    g.fillStyle(a, gl * 0.5);
    g.fillCircle(12, 0, 4);
    // 反弹音波（从琴身荡出的双环）
    for (let k = 0; k < 2; k++) {
      const ph = (now / 1000 + k / 2) % 1;
      g.lineStyle(1.2, a, 0.5 * (1 - ph));
      g.strokeCircle(12, 0, 14 + ph * 10);
    }
  } },
  aztRacketA: { c: 0x2a2a34, a: 0x3ad49a, draw: (g, now, c, a) => {
    // 黑曜石刃·拍：拍面是一柄黑曜石麦哲梯刃——扇形黑刃 + 石纹 + 翡翠镶嵌
    handle(g, -13, 0, 4.6, 0x6b4a2f);
    pommel(g, -13.4, 2.2, a);
    g.fillStyle(c, 1); // 扇形黑曜石刃
    g.fillPoints([
      { x: 0, y: -3 }, { x: 24, y: -12 }, { x: 38, y: -10 }, { x: 40, y: 0 },
      { x: 38, y: 10 }, { x: 24, y: 12 }, { x: 0, y: 3 },
    ] as never, true);
    g.fillStyle(0x3a3a48, 0.6); // 石面反光
    g.fillPoints([
      { x: 0, y: -3 }, { x: 24, y: -12 }, { x: 30, y: -6 }, { x: 0, y: -1 },
    ] as never, true);
    g.lineStyle(1, 0x8a94a2, 0.5); // 石纹
    g.lineBetween(6, -2, 30, -7);
    g.lineBetween(6, 2, 30, 7);
    for (let k = 0; k < 4; k++) { // 刃口翡翠镶嵌（交替明灭）
      const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 300 + k));
      g.fillStyle(a, gl);
      g.fillCircle(20 + k * 5, -9 + k * 1.4, 1.3);
    }
    g.fillStyle(0xd9b45c, 0.9); // 柄头金环
    g.lineStyle(1.6, 0xd9b45c, 0.9);
    g.strokeCircle(0, 0, 4.4);
  } },
  aztRacketB: { c: 0x3ad49a, a: 0xffd45c, draw: (g, now, c, a) => {
    // 羽蛇杖·拍：拍面是羽蛇盘绕的水晶杖——水晶杖首 + 盘蛇 + 羽冠 + 圣光
    handle(g, -13, 0, 4.6, 0x6b4a2f);
    pommel(g, -13.4, 2.2, a);
    g.fillStyle(0x8a6a3a, 1); // 杖身
    g.fillRect(-2, -3, 22, 6);
    g.fillStyle(0xb8943a, 0.6);
    g.fillRect(-2, -3, 22, 2);
    g.fillStyle(c, 0.9); // 杖首水晶（菱形晶）
    g.fillPoints([
      { x: 20, y: 0 }, { x: 26, y: -10 }, { x: 34, y: -12 }, { x: 40, y: -4 }, { x: 36, y: 6 }, { x: 26, y: 8 },
    ] as never, true);
    g.fillStyle(0xbfffe0, 0.6); // 晶面反光
    g.fillPoints([
      { x: 26, y: -10 }, { x: 34, y: -12 }, { x: 30, y: -2 },
    ] as never, true);
    g.lineStyle(1.4, a, 0.85); // 晶内光脉
    g.lineBetween(24, -2, 34, -7);
    // 盘蛇（绕晶的小金蛇）
    g.lineStyle(2.4, 0xd9b45c, 1);
    g.beginPath();
    g.moveTo(16, 6);
    g.lineTo(22, 8); g.lineTo(27, 6); g.lineTo(24, 2); g.lineTo(28, -2); g.lineTo(33, -1);
    g.strokePath();
    g.fillStyle(0xffd45c, 1);
    g.fillCircle(34, -2, 1.8);
    // 羽冠（晶顶绿羽）
    for (let k = 0; k < 3; k++) {
      g.fillStyle(a, 0.9);
      g.fillEllipse(30 + k * 3.4, -16 + Math.abs(k) * 3, 2, 6);
    }
    const gl = 0.4 + 0.4 * Math.sin(now / 280); // 杖首圣光
    g.fillStyle(a, gl * 0.4);
    g.fillCircle(29, -4, 8);
  } },
  angRacketA: { c: 0xfff6d8, a: 0xffd45c, draw: (g, now, c, a) => {
    // 圣剑·拍：拍面是一柄圣剑——宽剑身 + 十字护手 + 剑心圣光 + 羽饰
    handle(g, -13, 0, 4.6, 0x8a6a3a);
    pommel(g, -13.4, 2.2, a);
    g.fillStyle(a, 0.9); // 十字护手
    g.fillRect(-4, -6.4, 4, 12.8);
    g.fillStyle(c, 1); // 剑身
    g.fillPoints([
      { x: 0, y: -5.4 }, { x: 26, y: -4 }, { x: 36, y: 0 }, { x: 26, y: 4 }, { x: 0, y: 5.4 },
    ] as never, true);
    g.fillStyle(0xffffff, 0.6); // 剑面受光
    g.fillPoints([
      { x: 0, y: -5.4 }, { x: 26, y: -4 }, { x: 22, y: -1 }, { x: 0, y: -1 },
    ] as never, true);
    g.lineStyle(1, 0xd9b45c, 0.7); // 剑身中线
    g.lineBetween(0, 0, 32, 0);
    const gl = 0.5 + 0.5 * Math.sin(now / 280); // 剑心圣光
    g.fillStyle(a, 0.4 * gl);
    g.fillCircle(16, 0, 5.4);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(15, -0.8, 1.4);
    for (const s of [-1, 1]) { // 护手羽饰
      g.fillStyle(0xf0e8d0, 0.9);
      g.fillEllipse(-2, s * 8, 2.4, 4.4);
    }
    g.fillStyle(0xffffff, gl); // 剑尖光
    g.fillCircle(36, 0, 2);
  } },
  angRacketB: { c: 0xd9b45c, a: 0xfff6d8, draw: (g, now, c, a) => {
    // 天平·拍：拍面是一架审判天平——横梁双盘 + 链摆 + 衡心宝石 + 圣光秤杆
    handle(g, -13, 0, 4.4, 0x6b4a2f);
    pommel(g, -13.4, 2.2, a);
    g.lineStyle(2.6, c, 1); // 天平立柱 + 横梁
    g.lineBetween(-2, 6, -2, -8);
    g.lineBetween(-14, -8, 14, -8);
    const tilt = Math.sin(now / 500) * 0.12;
    g.fillStyle(0xb8943a, 1); // 衡心宝石
    g.fillCircle(-2, -8, 3);
    g.fillStyle(a, 0.6 + 0.3 * Math.sin(now / 260));
    g.fillCircle(-2, -8, 1.4);
    for (const s of [-1, 1]) { // 双盘（链条 + 秤盘，随横梁微倾）
      g.save();
      g.translateCanvas(s * 14, -8);
      g.rotateCanvas(s * tilt);
      g.lineStyle(1, 0xb8943a, 0.9);
      g.lineBetween(0, 0, -3.4, 8);
      g.lineBetween(0, 0, 3.4, 8);
      g.lineStyle(1.8, c, 1);
      g.beginPath(); g.arc(0, 8.4, 5.4, 0, Math.PI); g.closePath(); g.strokePath();
      g.fillStyle(0xfff6d8, 0.7); // 盘中圣光
      g.fillEllipse(0, 7.4, 6, 2);
      g.restore();
    }
    // 圣文梁刻（横梁上的符点明灭）
    for (let k = 0; k < 4; k++) {
      g.fillStyle(a, 0.4 + 0.4 * Math.abs(Math.sin(now / 340 + k)));
      g.fillCircle(-8 + k * 5.4, -8, 0.9);
    }
  } },
};
