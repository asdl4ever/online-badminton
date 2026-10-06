import { curve, ribbon, type TrailArt } from './shared';

/** 批七主题拖尾（赛博都市 / 东海龙宫 / 时空旅行）。ctx: g/pts/fade/now，pts[0] 最旧、末位是球头。 */
export const TRAILS_8: Record<string, TrailArt> = {
  cybTrailA: { c: 0x39ffd0, a: 0xff3bd4, draw: (ctx, c, a) => {
    // 数据流拖尾：轨迹化作一段数据流——码流带 + 字符块 + 流动脉冲
    const { g, pts, fade, now } = ctx;
    ribbon(ctx, 9, 1.2, now / 300, 6, c, 0.35 * fade);
    curve(ctx, 5, 1.4, 0.2, 0.6, c);
    curve(ctx, 2, 0.8, 0.4, 0.9, 0xffffff);
    for (let k = 0; k < 8; k++) { // 码流字符块（0/1 意象的方块列）
      const i = Math.floor(((k + 0.3) / 8) * (pts.length - 1));
      const p = pts[i];
      g.fillStyle(k % 3 === 0 ? a : c, 0.7 * fade);
      g.fillRect(p.x - 1.2, p.y - 1.6, 2.4, 3.2);
      if (k % 2) {
        g.fillStyle(0xffffff, 0.4 * fade);
        g.fillRect(p.x - 1.2, p.y + 1.4, 2.4, 1);
      }
    }
    for (let k = 0; k < 3; k++) { // 流动脉冲（沿线冲刺的亮点）
      const u = (now / 380 + k / 3) % 1;
      const i = Math.floor(u * (pts.length - 1));
      const p = pts[i];
      g.fillStyle(0xffffff, 0.9 * fade);
      g.fillCircle(p.x, p.y, 1.8);
      g.fillStyle(c, 0.4 * fade);
      g.fillCircle(p.x, p.y, 3.6);
    }
    const head = pts[pts.length - 1];
    g.fillStyle(0xffffff, fade);
    g.fillCircle(head.x, head.y, 2.4);
  } },
  cybTrailB: { c: 0xff3bd4, a: 0x39ffd0, draw: (ctx, c, a) => {
    // 故障光痕：信号故障的光痕——主光带 + RGB 错位 + 撕裂块 + 干扰星
    const { g, pts, fade, now } = ctx;
    curve(ctx, 7, 1.6, 0.2, 0.6, c);
    // RGB 错位（三色错开的重影带）
    for (let k = 0; k < 3; k++) {
      const off = (k - 1) * 2 + Math.sin(now / 90 + k) * 1;
      g.lineStyle(2.4, [0xff5a5c, 0x5aff7a, 0x5a8aff][k], 0.45 * fade);
      for (let s = 0; s < pts.length - 1; s += 2) {
        g.lineBetween(pts[s].x + off, pts[s].y + off * 0.5, pts[s + 1].x + off, pts[s + 1].y + off * 0.5);
      }
    }
    for (let k = 0; k < 4; k++) { // 撕裂块（横向跳变的色块）
      const i = Math.floor(((k + 0.4) / 4) * (pts.length - 1));
      const p = pts[i];
      if (Math.sin(now / 120 + k * 2.4) > 0) {
        g.fillStyle(k % 2 ? a : c, 0.5 * fade);
        g.fillRect(p.x - 6, p.y - 3, 12 + (k % 3) * 4, 3);
      }
    }
    for (let k = 0; k < 5; k++) { // 干扰星（随机明灭的十字）
      const i = Math.floor(((k + 0.2) / 5) * (pts.length - 1));
      const p = pts[i];
      const tw = Math.abs(Math.sin(now / 150 + k * 1.9));
      g.fillStyle(0xffffff, tw * fade);
      g.fillRect(p.x - 2.4, p.y - 0.5, 4.8, 1); g.fillRect(p.x - 0.5, p.y - 2.4, 1, 4.8);
    }
    const head = pts[pts.length - 1];
    g.fillStyle(0xffffff, fade);
    g.fillCircle(head.x, head.y, 2.4);
    g.fillStyle(c, 0.4 * fade);
    g.fillCircle(head.x, head.y, 5);
  } },
  dgTrailA: { c: 0x7fd4ff, a: 0x5affd0, draw: (ctx, c, a) => {
    // 水流拖尾：轨迹化作一道水流——水带 + 卷浪头 + 水珠溅 + 波光
    const { g, pts, fade, now } = ctx;
    ribbon(ctx, 12, 1.8, now / 320, 8, c, 0.4 * fade);
    curve(ctx, 7, 1.8, 0.2, 0.55, c);
    curve(ctx, 2.6, 1, 0.35, 0.9, 0xffffff);
    for (let k = 0; k < 4; k++) { // 卷浪头（带翻卷弧的浪团）
      const i = Math.floor(((k + 0.5) / 4) * (pts.length - 1));
      const p = pts[i];
      const r = 5 + (k % 2) * 2.4;
      g.fillStyle(c, 0.45 * fade);
      g.fillCircle(p.x, p.y, r);
      g.lineStyle(1.4, 0xffffff, 0.5 * fade);
      g.beginPath();
      g.arc(p.x, p.y, r * 0.7, now / 250 + k, now / 250 + k + 2.4);
      g.strokePath();
    }
    for (let k = 0; k < 6; k++) { // 水珠溅（抛物线水滴）
      const i = Math.floor(((k + 0.2) / 6) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 420 + k / 6) % 1;
      g.fillStyle(k % 2 ? a : 0xffffff, 0.75 * (1 - ph) * fade);
      g.fillCircle(p.x + Math.sin(k * 2.2) * 5, p.y - Math.sin(ph * Math.PI) * 9, 1.5 * (1 - ph) + 0.4);
    }
    for (let k = 0; k < 3; k++) { // 波光（水带上流过的亮斑）
      const i = Math.floor(((k + 0.5) / 3) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 600 + k / 3) % 1;
      g.fillStyle(0xffffff, 0.4 * Math.sin(ph * Math.PI) * fade);
      g.fillEllipse(p.x, p.y, 8, 2.4);
    }
    const head = pts[pts.length - 1];
    g.fillStyle(0xffffff, fade);
    g.fillCircle(head.x, head.y, 2.4);
  } },
  dgTrailB: { c: 0x5affd0, a: 0x7fd4ff, draw: (ctx, c, a) => {
    // 龙息拖尾：龙的吐息——青白龙息雾 + 冰晶 + 龙鳞光片
    const { g, pts, fade, now } = ctx;
    ribbon(ctx, 15, 2, now / 420, 11, c, 0.3 * fade);
    curve(ctx, 10, 2.2, 0.18, 0.45, 0xbfffe8);
    curve(ctx, 4, 1.2, 0.3, 0.8, 0xffffff);
    for (let k = 0; k < 5; k++) { // 龙息雾团（翻涌的青雾）
      const i = Math.floor(((k + 0.5) / 5) * (pts.length - 1));
      const p = pts[i];
      const r = 5.4 + (k % 3) * 2.4;
      g.fillStyle(c, 0.32 * fade);
      g.fillCircle(p.x, p.y, r);
      g.fillStyle(0xffffff, 0.2 * fade);
      g.fillCircle(p.x - r * 0.3, p.y - r * 0.3, r * 0.5);
    }
    for (let k = 0; k < 6; k++) { // 冰晶（六角星晶旋转）
      const i = Math.floor(((k + 0.3) / 6) * (pts.length - 1));
      const p = pts[i];
      g.save();
      g.translateCanvas(p.x + Math.sin(k * 2.2) * 5, p.y + Math.cos(k * 1.8) * 4);
      g.rotateCanvas(now / 250 + k);
      g.lineStyle(1, 0xffffff, 0.7 * fade);
      for (let s = 0; s < 3; s++) {
        const ang = (s / 3) * Math.PI;
        g.lineBetween(-Math.cos(ang) * 3, -Math.sin(ang) * 3, Math.cos(ang) * 3, Math.sin(ang) * 3);
      }
      g.restore();
    }
    for (let k = 0; k < 4; k++) { // 龙鳞光片（发光的鳞片掠过）
      const i = Math.floor(((k + 0.4) / 4) * (pts.length - 1));
      const p = pts[i];
      const gl = 0.4 + 0.5 * Math.abs(Math.sin(now / 300 + k));
      g.fillStyle(a, gl * fade);
      g.fillEllipse(p.x, p.y + 3, 4.4, 2.2);
    }
    const head = pts[pts.length - 1];
    g.fillStyle(0xffffff, fade);
    g.fillCircle(head.x, head.y, 2.6);
    g.fillStyle(c, 0.4 * fade);
    g.fillCircle(head.x, head.y, 5.4);
  } },
  chronoTrailA: { c: 0x9b5cff, a: 0xffd45c, draw: (ctx, c, a) => {
    // 残影拖尾：时间残影——多重残像轮廓 + 时刻数字 + 逆转涟漪
    const { g, pts, fade, now } = ctx;
    curve(ctx, 4, 1.2, 0.2, 0.5, c);
    for (let k = 0; k < 4; k++) { // 多重残像（轮廓渐隐的残影竖条）
      const i = Math.floor(((k + 0.4) / 4) * (pts.length - 1));
      const p = pts[i];
      const al = 0.3 - k * 0.06;
      g.lineStyle(1.6, k % 2 ? a : c, al * fade);
      g.strokeCircle(p.x, p.y - 4, 4 - k * 0.6);
      g.strokeCircle(p.x, p.y + 6, 3 - k * 0.5);
    }
    for (let k = 0; k < 6; k++) { // 时刻数字（闪现的时刻刻度）
      const i = Math.floor(((k + 0.3) / 6) * (pts.length - 1));
      const p = pts[i];
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k * 1.7));
      g.fillStyle(k % 2 ? a : c, tw * fade);
      g.fillRect(p.x - 1, p.y - 2.4, 2, 4.8);
      g.fillRect(p.x - 2.4, p.y - 0.6, 4.8, 1.2);
    }
    for (let k = 0; k < 3; k++) { // 逆转涟漪（沿轨迹荡开的环）
      const i = Math.floor(((k + 0.5) / 3) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 700 + k / 3) % 1;
      g.lineStyle(1.4, c, (0.5 * (1 - ph)) * fade);
      g.strokeCircle(p.x, p.y, 3 + ph * 9);
    }
    const head = pts[pts.length - 1];
    g.fillStyle(0xffffff, fade);
    g.fillCircle(head.x, head.y, 2.2);
    g.lineStyle(1.4, a, 0.6 * fade);
    g.strokeCircle(head.x, head.y, 4.6);
  } },
  chronoTrailB: { c: 0xbfe8ff, a: 0x9b5cff, draw: (ctx, c, a) => {
    // 星尘拖尾：星门溢出的星尘——尘带 + 大小星辰 + 星云雾 + 亮星轨迹
    const { g, pts, fade, now } = ctx;
    ribbon(ctx, 11, 1.6, now / 480, 8, c, 0.22 * fade);
    curve(ctx, 6, 1.4, 0.2, 0.45, 0xd8c8ff);
    for (let k = 0; k < 7; k++) { // 大小星辰（不同的星，明灭）
      const i = Math.floor(((k + 0.3) / 7) * (pts.length - 1));
      const p = pts[i];
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 260 + k * 1.6));
      const r = 1.2 + (k % 3) * 0.8;
      g.fillStyle(k % 2 ? 0xffffff : a, tw * fade);
      g.fillCircle(p.x + Math.sin(k * 2.4) * 4, p.y + Math.cos(k * 2) * 3, r);
      if (k % 3 === 0) { // 大星带十字光
        g.fillStyle(0xffffff, tw * 0.6 * fade);
        g.fillRect(p.x - 4, p.y - 0.5, 8, 1); g.fillRect(p.x - 0.5, p.y - 4, 1, 8);
      }
    }
    for (let k = 0; k < 4; k++) { // 星云雾（紫云团）
      const i = Math.floor(((k + 0.5) / 4) * (pts.length - 1));
      const p = pts[i];
      const ph = (now / 1600 + k / 4) % 1;
      g.fillStyle(0x9b5cff, 0.15 * Math.sin(ph * Math.PI) * fade);
      g.fillCircle(p.x, p.y + Math.sin(ph * 4 + k) * 3, 6 + ph * 6);
    }
    const head = pts[pts.length - 1];
    const gl = 0.6 + 0.4 * Math.sin(now / 200);
    g.fillStyle(0xffffff, gl * fade);
    g.fillCircle(head.x, head.y, 2.4);
    g.fillStyle(a, 0.35 * fade);
    g.fillCircle(head.x, head.y, 5.4);
  } },
};
