import { TAU, mpoly, type MountArt } from './shared';

/** 批十主题坐骑（电竞赛场 / 末日废土 / 星光偶像）。(x, y) = 地面基准，f = 朝向。 */
export const MOUNTS_12: Record<string, MountArt> = {
  esportMount: { c: 0x00e5ff, a: 0xff2e88, draw: (g, now, x, y, f, c, a) => {
    // 战队战车：电竞战队涂装的悬浮战车——流线车身 + 队徽 + 双悬浮引擎 + 尾迹灯
    const hover = Math.sin(now / 340) * 2.4;
    const by = y - 14 + hover;
    g.fillStyle(0x0a0d12, 0.2);
    g.fillEllipse(x, y + 1, 60, 8);
    g.fillStyle(0x1c2430, 1); // 车身
    mpoly(g, [
      [x - f * 34, by + 2], [x - f * 22, by - 7], [x + f * 4, by - 10], [x + f * 26, by - 6],
      [x + f * 36, by], [x + f * 24, by + 6], [x - f * 24, by + 7],
    ], 0x1c2430, 1);
    g.fillStyle(c, 0.85); // 车侧霓虹条
    g.fillRect(x - f * 30, by - 1, f * 58, 2.4);
    g.fillStyle(a, 0.9); // 队徽（车侧闪电菱形）
    g.fillPoints([
      { x: x - f * 2, y: by - 7 }, { x: x - f * 2 + f * 4, y: by - 3 }, { x: x - f * 2, y: by + 1 }, { x: x - f * 2 - f * 4, y: by - 3 },
    ] as never, true);
    g.fillStyle(0x22303e, 1); // 座舱
    g.fillEllipse(x - f * 6, by - 11, 20, 10);
    g.fillStyle(c, 0.5 + 0.2 * Math.sin(now / 280));
    g.fillEllipse(x - f * 6, by - 12, 13, 5);
    // 双悬浮引擎（尾部双喷口）
    for (const s of [-1, 1]) {
      const px = x - f * 30;
      g.fillStyle(0x39424e, 1);
      g.fillEllipse(px, by + 3 + s * 3, 10, 4);
      const jet = 8 + Math.abs(Math.sin(now / 90 + s)) * 6;
      g.fillStyle(s > 0 ? a : c, 0.7);
      g.fillTriangle(px - 3, by + 5 + s * 3, px + 3, by + 5 + s * 3, px + Math.sin(now / 100 + s) * 1.6, by + 5 + s * 3 + jet);
    }
    // 尾迹灯（双色交替）
    for (let k = 0; k < 2; k++) {
      const ph = (now / 220 + k / 2) % 1;
      g.fillStyle(k ? a : c, 0.5 * (1 - ph));
      g.fillRect(x - f * (36 + ph * 18), by - 1 - k * 2.4, f * 12, 2.2 - k * 0.6);
    }
    // 头灯
    g.fillStyle(0xfff6d8, 0.9);
    g.fillCircle(x + f * 34, by - 1, 2.2);
  } },
  wasteMount: { c: 0x8a6a3a, a: 0xff8a3c, draw: (g, now, x, y, f, c, _a) => {
    // 改装战车：末日废土改装车——铆钉车体 + 防撞锥 + 顶架探照 + 烟囱
    const shake = Math.sin(now / 90) * 0.8;
    const by = y - 16 + shake;
    g.fillStyle(0x221c12, 0.25);
    g.fillEllipse(x, y + 1, 62, 9);
    // 四轮（越野大轮，转动）
    for (const [wx, wr] of [[x - f * 18, 10], [x + f * 18, 10]] as Array<[number, number]>) {
      g.fillStyle(0x1a1410, 1);
      g.fillCircle(wx, y - wr, wr);
      g.fillStyle(0x39424e, 0.9);
      g.fillCircle(wx, y - wr, wr - 3);
      g.lineStyle(1.2, 0x8a94a2, 0.8);
      for (let k = 0; k < 5; k++) {
        const ang = now / 100 + (k / 5) * TAU;
        g.lineBetween(wx, y - wr, wx + Math.cos(ang) * (wr - 2), y - wr + Math.sin(ang) * (wr - 2));
      }
    }
    g.fillStyle(c, 1); // 车体
    g.fillRoundedRect(x - f * 28, by - 8, f * 56, 18, 4);
    g.fillStyle(0x6a5228, 0.8); // 锈迹
    g.fillEllipse(x - f * 14, by + 2, 12, 6);
    g.fillEllipse(x + f * 10, by - 4, 10, 5);
    g.fillStyle(0xffd45c, 0.7); // 车体铆钉
    for (let k = 0; k < 5; k++) g.fillCircle(x - f * 22 + k * f * 11, by - 4, 1.1);
    // 驾驶舱
    g.fillStyle(0x4e4434, 1);
    g.fillRoundedRect(x - f * 8, by - 16, f * 16, 10, 3);
    g.fillStyle(0x1a1410, 1); // 挡风
    g.fillRoundedRect(x + f * 2, by - 15, f * 6, 7, 2);
    // 车头防撞锥（三根锥刺）
    for (let k = 0; k < 3; k++) {
      g.fillStyle(0x8a94a2, 1);
      g.fillTriangle(x + f * 28, by - 4 + k * 4, x + f * 36, by - 1 + k * 4, x + f * 28, by + 1 + k * 4);
    }
    // 顶架 + 探照灯（扫动光锥）
    g.lineStyle(2.4, 0x4a4030, 1);
    g.lineBetween(x - f * 10, by - 16, x - f * 10, by - 26);
    g.lineBetween(x + f * 6, by - 16, x + f * 6, by - 26);
    g.lineBetween(x - f * 12, by - 26, x + f * 8, by - 26);
    g.fillStyle(0xffe15c, 0.9); // 探照灯
    g.fillCircle(x + f * 2, by - 28, 3);
    g.fillStyle(0xffe15c, 0.12);
    mpoly(g, [[x + f * 4, by - 28], [x + f * 40, by - 38], [x + f * 40, by - 18], [x + f * 4, by - 28]], 0xffe15c, 0.12);
    // 排气管 + 突突黑烟
    g.fillStyle(0x39424e, 1);
    g.fillRect(x - f * 26, by - 22, 4, 10);
    for (let k = 0; k < 3; k++) {
      const ph = (now / 900 + k / 3) % 1;
      g.fillStyle(0x4a4030, 0.4 * (1 - ph));
      g.fillCircle(x - f * 24 + Math.sin(ph * 4 + k) * 3, by - 24 - ph * 22, 2.4 + ph * 5);
    }
  } },
  idolMount: { c: 0xff9adf, a: 0xffd45c, draw: (g, now, x, y, f, _c, a) => {
    // 星光巡游车：偶像巡游花车——花车台 + 星星装饰 + 顶棚 + 荧光洒落
    const hover = Math.sin(now / 380) * 2.6;
    const by = y - 18 + hover;
    g.fillStyle(0x1a1222, 0.15);
    g.fillEllipse(x, y + 1, 60, 9);
    // 花车台（双层粉色台）
    g.fillStyle(0xff5a8a, 0.95);
    g.fillRoundedRect(x - f * 30, by, f * 60, 14, 6);
    g.fillStyle(0xff9adf, 0.95);
    g.fillRoundedRect(x - f * 26, by - 6, f * 52, 10, 5);
    g.fillStyle(0xfff6d8, 0.6); // 台缘灯带
    g.fillRect(x - f * 24, by - 5, f * 48, 2);
    // 顶棚（舞台顶 + 垂穗）
    g.fillStyle(0x54406a, 0.95);
    mpoly(g, [
      [x - f * 24, by - 10], [x + f * 24, by - 10], [x + f * 20, by - 26], [x - f * 20, by - 26],
    ], 0x54406a, 0.95);
    g.fillStyle(0xffd45c, 0.8); // 顶棚星徽
    g.fillCircle(x, by - 18, 3.4);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(x - 1, by - 19, 1.2);
    for (let k = 0; k < 5; k++) { // 顶棚垂穗
      g.fillStyle(k % 2 ? a : 0xffb0c8, 0.9);
      g.fillRect(x - f * 20 + k * f * 10, by - 10, f * 4, 5 + (k % 2) * 3);
    }
    // 侧翼星星装饰（两侧大星星）
    for (const s of [-1, 1]) {
      g.fillStyle(a, 0.95);
      g.save();
      g.translateCanvas(x + s * f * 26, by - 14);
      g.rotateCanvas(Math.sin(now / 300 + s) * 0.15);
      g.fillPoints((() => {
        const vs = [];
        for (let k = 0; k < 10; k++) {
          const ang = (k / 10) * TAU - Math.PI / 2;
          const rr = k % 2 ? 3 : 7;
          vs.push({ x: Math.cos(ang) * rr, y: Math.sin(ang) * rr });
        }
        return vs;
      })() as never, true);
      g.restore();
    }
    // 荧光洒落
    for (let k = 0; k < 6; k++) {
      const ph = (now / 1200 + k / 6) % 1;
      g.fillStyle(k % 2 ? a : 0x7ac8ff, 0.6 * Math.sin(ph * Math.PI));
      g.fillCircle(x - 26 + (k * 9) % 52 + Math.sin(ph * 4 + k) * 3, by - 12 - ph * 24, 1.4);
    }
    // 车底聚光
    g.fillStyle(a, 0.12);
    g.fillEllipse(x, by + 12, 54, 8);
  } },
};
