import { curve, ribbon, type TrailArt } from './shared';

/** 新批次主题拖尾（上古神话 / 重装机甲）。ctx: g/pts/fade/now，pts[0] 最旧、末位是球头。 */
export const TRAILS_3: Record<string, TrailArt> = {
  shnTrailA: { c: 0xffe08a, a: 0xffd45c, draw: (ctx, c, a) => {
    // 流云拖尾：整条轨迹化作一段流云——云带 + 翻卷云头 + 云隙金光
    const { g, pts, fade, now } = ctx;
    ribbon(ctx, 9, 2.2, now / 500, 12, c, 0.4 * fade);
    curve(ctx, 2, 10, 0.15, 0.8, 0xffffff);
    for (let k = 0; k < 4; k++) { // 翻卷的云头
      const i = Math.floor(((k + 0.5) / 4) * (pts.length - 1));
      const p = pts[i];
      const r = 4 + (k % 2) * 2.4;
      g.fillStyle(0xffffff, 0.5 * fade);
      g.fillCircle(p.x, p.y - 2, r);
      g.fillStyle(c, 0.3 * fade);
      g.fillCircle(p.x + r * 0.4, p.y - r * 0.4, r * 0.6);
    }
    const head = pts[pts.length - 1];
    const gl = 0.5 + 0.5 * Math.sin(now / 250);
    g.fillStyle(a, gl * fade);
    g.fillCircle(head.x, head.y, 3);
    g.fillStyle(0xffffff, fade);
    g.fillCircle(head.x, head.y, 1.4);
  } },
  shnTrailB: { c: 0xff8ad4, a: 0xffd45c, draw: (ctx, c, a) => {
    // 霞光拖尾：整条轨迹化作一段晚霞——霞层云带 + 卷云头 + 星屑 + 彩凤尾羽光斑
    const { g, pts, fade, now } = ctx;
    ribbon(ctx, 15, 2, now / 600, 10, 0xffb0d8, 0.3 * fade);
    curve(ctx, 12, 1.6, 0.15, 0.4, c);
    curve(ctx, 7, 1.4, 0.2, 0.65, 0xffe0b0);
    curve(ctx, 3.2, 1, 0.3, 0.95, 0xfff0b0);
    for (let k = 0; k < 5; k++) { // 翻卷霞云头（上下交错）
      const i = Math.floor(((k + 0.4) / 5) * (pts.length - 1));
      const p = pts[i];
      const r = 5 + (k % 3) * 2.4;
      const up = k % 2 ? -1 : 1;
      g.fillStyle(0xffffff, 0.45 * fade);
      g.fillCircle(p.x, p.y + up * 3, r);
      g.fillStyle(c, 0.35 * fade);
      g.fillCircle(p.x + r * 0.5, p.y + up * 3 - up * r * 0.3, r * 0.55);
      g.fillStyle(0xfff0b0, 0.3 * fade);
      g.fillCircle(p.x - r * 0.4, p.y + up * 3 + up * r * 0.2, r * 0.4);
    }
    for (let k = 0; k < 7; k++) { // 霞光星屑（十字闪光）
      const i = Math.floor(((k + 0.25) / 7) * (pts.length - 1));
      const p = pts[i];
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 220 + k * 1.7));
      const s = 2 + (k % 3);
      g.fillStyle(0xffffff, tw * fade);
      g.fillRect(p.x - s, p.y - 0.5, s * 2, 1); g.fillRect(p.x - 0.5, p.y - s, 1, s * 2);
      g.fillStyle(k % 2 ? a : c, tw * 0.4 * fade);
      g.fillCircle(p.x, p.y, s * 0.8);
    }
    const head = pts[pts.length - 1]; // 球头：一轮小落日 + 光晕
    const gl = 0.6 + 0.4 * Math.sin(now / 300);
    g.fillStyle(0xffd45c, gl * 0.5 * fade);
    g.fillCircle(head.x, head.y, 6.4);
    g.fillStyle(0xffe89a, fade);
    g.fillCircle(head.x, head.y, 3);
    g.fillStyle(0xffffff, fade);
    g.fillCircle(head.x - 0.8, head.y - 0.8, 1.2);
  } },
  mcaTrailA: { c: 0xff8a3a, a: 0xffd45c, draw: (ctx, c, a) => {
    // 尾焰拖尾：喷射尾焰——外焰带 + 内焰芯 + 崩溅火星
    const { g, pts, fade, now } = ctx;
    curve(ctx, 13, 3, 0.2, 0.7, 0xff5a1a);
    curve(ctx, 7, 1.6, 0.35, 0.85, c);
    curve(ctx, 3, 0.8, 0.5, 0.95, 0xffe15c);
    for (let k = 0; k < 7; k++) { // 崩溅火星
      const i = Math.floor(((k + 0.2) / 7) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 300 + k / 7) % 1;
      g.fillStyle(k % 2 ? a : 0xff5a1a, (0.8 * (1 - ph)) * fade);
      g.fillCircle(p.x + Math.sin(ph * 5 + k) * 5, p.y - ph * 7, 1.6 * (1 - ph) + 0.4);
    }
    const head = pts[pts.length - 1];
    g.fillStyle(0xffffff, fade);
    g.fillCircle(head.x, head.y, 2.2);
  } },
  mcaTrailB: { c: 0x7ae0ff, a: 0x39ffd0, draw: (ctx, c, a) => {
    // 雷达波拖尾：轨迹化作雷达扫描——同心弧环 + 扫描线 + 目标点
    const { g, pts, fade, now } = ctx;
    curve(ctx, 2.4, 1, 0.2, 0.6, c);
    for (let k = 0; k < 5; k++) { // 沿轨迹的雷达弧环
      const i = Math.floor(((k + 0.5) / 5) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 500 + k / 5) % 1;
      g.lineStyle(1.6, c, (0.6 * (1 - ph)) * fade);
      g.strokeCircle(p.x, p.y, 3 + ph * 9);
    }
    for (let k = 0; k < 4; k++) { // 锁定的目标点
      const i = Math.floor(((k + 0.4) / 4) * (pts.length - 1));
      const p = pts[i];
      const bl = Math.abs(Math.sin(now / 200 + k * 1.9));
      g.fillStyle(a, bl * fade);
      g.fillRect(p.x - 2, p.y - 0.5, 4, 1); g.fillRect(p.x - 0.5, p.y - 2, 1, 4);
    }
    const head = pts[pts.length - 1];
    g.fillStyle(0xffffff, fade);
    g.fillCircle(head.x, head.y, 2.2);
    g.lineStyle(1.2, c, 0.7 * fade);
    g.strokeCircle(head.x, head.y, 4.4);
  } },
};
