import { poly, handle, pommel, TAU, type WeaponArt } from './shared';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 新批次主题武器（上古神话 / 重装机甲）。局部空间：柄在 x ∈ [-13,-2]，拍框中心 ≈ (9,0)。 */
export const WEAPONS_5: Record<string, WeaponArt> = {
  shnRacketA: { c: 0xd9b45c, a: 0xd93a5a, draw: (g, now, c, a) => {
    // 打神鞭·拍：金鞭节节相连（节身随时间微颤）+ 符文节环 + 鞭梢宝珠
    handle(g, -13, 2, 5, 0x6b4a2f);
    pommel(g, -13.4, 2.6, a);
    for (let k = 0; k < 6; k++) {
      const bx = 2 + k * 5.4;
      const shiver = Math.sin(now / 140 + k) * 0.6;
      g.fillStyle(k % 2 ? c : 0xb8943a, 1);
      g.fillRoundedRect(bx - 3, -5 + shiver, 6, 10, 2);
      g.lineStyle(1.2, a, 0.85);
      g.strokeCircle(bx, -5 + shiver, 2.6); // 节环
      g.fillStyle(0xfff0b0, 0.6);
      g.fillRect(bx - 2.4, -4 + shiver, 2, 8);
    }
    const gl = 0.5 + 0.5 * Math.sin(now / 300); // 鞭梢宝珠
    g.fillStyle(0xffd45c, 0.3 * gl);
    g.fillCircle(36, 0, 6);
    g.fillStyle(a, 1);
    g.fillCircle(36, 0, 3.4);
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(35, -0.8, 1.1);
  } },
  shnRacketB: { c: 0x8fd0ff, a: 0xffd45c, draw: (g, now, c, a) => {
    // 乾坤圈·拍：一整只乾坤圈（环形拍框 + 八卦刻纹 + 旋转的阴阳鱼）
    g.lineStyle(3.4, 0xb8943a, 1); // 柄短，藏于环后
    g.lineBetween(-12, 0, 2, 0);
    pommel(g, -12.4, 2.4, 0xd9b45c);
    g.fillStyle(c, 0.95);
    g.fillCircle(9, 0, 17);
    g.fillStyle(0xffffff, 0.15);
    g.fillCircle(9, 0, 13);
    g.fillStyle(0x2a4a6a, 0.9); // 内环阴刻
    g.fillCircle(9, 0, 12);
    g.fillStyle(c, 0.95);
    g.fillCircle(9, 0, 8.4);
    g.lineStyle(1.6, a, 0.9);
    g.strokeCircle(9, 0, 17);
    g.strokeCircle(9, 0, 12);
    for (let k = 0; k < 8; k++) { // 八卦刻纹
      const ang = (k / 8) * TAU - Math.PI / 2;
      g.lineStyle(1.4, a, 0.8);
      g.lineBetween(9 + Math.cos(ang) * 12.6, Math.sin(ang) * 12.6, 9 + Math.cos(ang) * 16.6, Math.sin(ang) * 16.6);
    }
    const rot = now / 800; // 旋转阴阳鱼
    for (const s of [-1, 1]) {
      g.fillStyle(s > 0 ? 0x2a4a6a : 0xffe89a, 0.95);
      g.fillPoints((() => {
        const vs = [];
        for (let k = 0; k <= 12; k++) {
          const ang = rot + Math.PI / 2 - (k / 12) * Math.PI;
          const r = 7.4;
          vs.push({ x: 9 + Math.cos(ang) * r * s, y: Math.sin(ang) * r });
        }
        return vs;
      })() as never, true);
    }
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(9, 0, 1.4);
  } },
  mcaRacketA: { c: 0x39ffd0, a: 0x22303e, draw: (g, now, c, a) => {
    // 高斯长杆拍：电磁长杆（线圈段）+ 双导轨拍框 + 加速电光
    handle(g, -13, -2, 4.4, 0x39424e);
    pommel(g, -13.4, 2.2, 0x8fe0ff);
    g.fillStyle(0x39424e, 1);
    g.fillRect(-2, -3, 12, 6); // 电磁机匣
    const led = 0.5 + 0.5 * Math.sin(now / 200);
    g.fillStyle(0xffe15c, led);
    g.fillRect(0, -1, 8, 2);
    for (let k = 0; k < 5; k++) { // 线圈段
      g.fillStyle(0x5a6472, 1);
      g.fillRect(10 + k * 7, -6.4, 5, 12.8);
      g.lineStyle(1.2, c, 0.7);
      g.strokeRect(10 + k * 7, -6.4, 5, 12.8);
    }
    g.fillStyle(0x22303e, 0.95); // 双导轨拍框
    mpolyFrame(g, c, a);
    // 加速电光（框内来回）
    const t = (now / 400) % 1;
    const px = 14 + t * 22;
    g.lineStyle(2, 0xffffff, 0.8);
    g.lineBetween(px, -9, px, 9);
    g.fillStyle(c, 0.25);
    g.fillCircle(px, 0, 5);
  } },
  mcaRacketB: { c: 0xff3bd4, a: 0x22303e, draw: (g, now, _c, _a) => {
    // 等离子拍：圆形约束环内的等离子核（沸腾涌动）+ 排气鳍
    handle(g, -13, -2, 4.4, 0x39424e);
    pommel(g, -13.4, 2.2, 0xff3bd4);
    g.fillStyle(0x22303e, 1);
    g.fillCircle(9, 0, 16); // 约束环壳
    for (let k = 0; k < 6; k++) { // 排气鳍
      const ang = (k / 6) * TAU + 0.3;
      g.fillStyle(0x39424e, 1);
      g.fillTriangle(
        9 + Math.cos(ang) * 15, Math.sin(ang) * 15,
        9 + Math.cos(ang + 0.22) * 15, Math.sin(ang + 0.22) * 15,
        9 + Math.cos(ang + 0.11) * 20, Math.sin(ang + 0.11) * 20,
      );
    }
    g.lineStyle(2.4, 0x8a94a2, 1);
    g.strokeCircle(9, 0, 15.4);
    // 等离子核：三层沸腾圆
    const boil = Math.sin(now / 90);
    g.fillStyle(0xff3bd4, 0.35);
    g.fillCircle(9 + boil, 0, 11 + Math.sin(now / 130) * 1.4);
    g.fillStyle(0xff7ae0, 0.75);
    g.fillCircle(9 - boil * 0.6, 0, 7.4);
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(9 + boil * 0.4, -boil, 3.4);
    for (let k = 0; k < 3; k++) { // 溢出的等离子粒
      const ph = (now / 400 + k / 3) % 1;
      const ang = k * 2.1 + now / 300;
      g.fillStyle(0xff7ae0, 0.7 * (1 - ph));
      g.fillCircle(9 + Math.cos(ang) * (15 + ph * 8), Math.sin(ang) * (15 + ph * 8), 1.6 * (1 - ph) + 0.4);
    }
  } },
};

/** 高斯拍的导轨框（局部函数） */
function mpolyFrame(g: G, c: number, a: number): void {
  poly(g, [[14, -10], [36, -12], [40, -6], [40, 6], [36, 12], [14, 10]], 0x39424e, 0.95);
  poly(g, [[17, -7], [34, -8.4], [36, -4], [36, 4], [34, 8.4], [17, 7]], 0x0e1826, 0.9);
  g.lineStyle(1.4, c, 0.8);
  g.strokeRect(16, -8.6, 22, 17.2);
  void a;
}
