import { TAU, type TrailArt } from './shared';

/** 批十二拖尾（变形机甲 / 蛛网游侠 / 钢铁巨兽）——整条轨迹画成整体 */

export const TRAILS_13: Record<string, TrailArt> = {
  // ── 变形机甲 ──
  tfTrailA: { c: 0xff8a2a, a: 0xffd45c, draw: (ctx, c, a) => {
    // 推进焰拖尾：外焰锥 + 马赫环序列 + 白热内芯 + 热浪
    const { g, pts, fade, now } = ctx;
    for (let k = 0; k < pts.length - 1; k++) { // 外焰（随年龄变宽变淡）
      const p0 = pts[k], p1 = pts[k + 1];
      const age = k / (pts.length - 1);
      g.lineStyle((3 + age * 11) * fade, c, (0.22 + age * 0.3) * fade);
      g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.strokePath();
    }
    for (let k = 0; k < pts.length - 1; k += 1) { // 白热内芯
      const p0 = pts[k], p1 = pts[k + 1];
      g.lineStyle(2.4 * fade, 0xfff0b0, 0.75 * fade);
      g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.strokePath();
    }
    // 马赫环（沿轨迹等距排布的亮环）
    const flow = (now / 260) % 1;
    for (let k = 0; k < 6; k++) {
      const t = (k + flow) / 6;
      const i = Math.min(pts.length - 1, Math.floor(t * (pts.length - 1)));
      const p = pts[i];
      const age = i / (pts.length - 1);
      const r = (3 + age * 8) * fade;
      g.fillStyle(k % 2 ? 0xffffff : a, 0.5 * fade);
      g.save(); g.translateCanvas(p.x, p.y); g.scaleCanvas(1, 0.6);
      g.beginPath(); g.arc(0, 0, r, 0, TAU); g.strokePath(); g.restore();
    }
    for (let k = 0; k < 5; k++) { // 热浪粒子
      const ph = ((now / 600 + k / 5) % 1);
      const i = Math.floor(ph * (pts.length - 1));
      const p = pts[i];
      g.fillStyle(0xd8e8f0, 0.18 * (1 - ph) * fade);
      g.fillCircle(p.x + Math.sin(ph * 8 + k) * 6, p.y - 4 - ph * 10, 3 + ph * 3);
    }
    const head = pts[pts.length - 1]; // 球头：喷口 + 焰锥
    const fl = 0.85 + 0.15 * Math.sin(now / 80);
    for (let k = 0; k < 3; k++) {
      g.fillStyle(k === 0 ? 0xffffff : k === 1 ? a : c, (0.9 - k * 0.25) * fl * fade);
      g.fillEllipse(head.x, head.y + k * 2, (14 - k * 4) * fl, 7 - k * 1.6);
    }
  } },
  tfTrailB: { c: 0x5ac8ff, a: 0xff8a2a, draw: (ctx, c, a) => {
    // 相位电痕：折线状的相位跳跃光路 + 卡顿方块（数字故障感） + 残影色差
    const { g, pts, fade, now } = ctx;
    // 主轨迹（折线，带相位跳跃）
    g.lineStyle(3.2 * fade, c, 0.6 * fade);
    g.beginPath();
    for (let k = 0; k < pts.length; k++) {
      const jump = k % 2 === 0 ? 0 : Math.sin(now / 120 + k) * 3;
      const p = pts[k];
      if (k === 0) g.moveTo(p.x, p.y + jump);
      else g.lineTo(p.x, p.y + jump);
    }
    g.strokePath();
    // 残影色差（红蓝错位）
    g.lineStyle(1.6 * fade, 0xff4a5a, 0.35 * fade);
    g.beginPath();
    for (let k = 0; k < pts.length; k++) {
      const p = pts[k];
      if (k === 0) g.moveTo(p.x - 2, p.y - 1);
      else g.lineTo(p.x - 2, p.y - 1);
    }
    g.strokePath();
    g.lineStyle(1.6 * fade, 0x8ae0ff, 0.35 * fade);
    g.beginPath();
    for (let k = 0; k < pts.length; k++) {
      const p = pts[k];
      if (k === 0) g.moveTo(p.x + 2, p.y + 1);
      else g.lineTo(p.x + 2, p.y + 1);
    }
    g.strokePath();
    // 数字故障方块（沿轨迹闪现）
    for (let k = 0; k < 8; k++) {
      const ph = ((now / 400 + k / 8) % 1);
      const i = Math.floor(ph * (pts.length - 1));
      const p = pts[i];
      const s = 2 + (k % 3) * 1.6;
      g.fillStyle(c, 0.55 * fade);
      g.fillRect(p.x - s / 2, p.y - s / 2 + (k % 2 ? 2 : -2), s, s * 0.7);
      g.fillStyle(0xffffff, 0.4 * fade);
      g.fillRect(p.x - s / 4, p.y - s / 4, s / 2, s / 3);
    }
    // 电弧叉枝
    for (let k = 0; k < 3; k++) {
      const ph = ((now / 500 + k / 3) % 1);
      const i = Math.floor(ph * (pts.length - 1));
      const p = pts[i];
      g.lineStyle(1.2, 0xffffff, 0.6 * fade);
      g.beginPath();
      g.moveTo(p.x, p.y);
      g.lineTo(p.x + Math.sin(now / 90 + k) * 7, p.y - 6 - (k % 2) * 4);
      g.lineTo(p.x + Math.sin(now / 70 + k) * 10, p.y - 12 - (k % 2) * 6);
      g.strokePath();
    }
    const head = pts[pts.length - 1]; // 球头：相位核心
    const pulse = 0.7 + 0.3 * Math.sin(now / 110);
    g.fillStyle(c, 0.4 * pulse * fade);
    g.fillCircle(head.x, head.y, 9);
    g.fillStyle(a, 0.85 * fade);
    g.fillCircle(head.x, head.y, 4);
    g.fillStyle(0xffffff, pulse * fade);
    g.fillCircle(head.x, head.y, 1.8);
  } },
  // ── 蛛网游侠 ──
  spdTrailA: { c: 0xd8e0e8, a: 0x8ae0ff, draw: (ctx, c, a) => {
    // 蛛丝拖尾：一根柔韧的蛛丝沿轨迹延伸 + 挂着的露珠 + 末端蛛网小结
    const { g, pts, fade, now } = ctx;
    // 双股丝（略有分离，像搓过的丝）
    for (const off of [-1.2, 1.2]) {
      g.lineStyle(1.8 * fade, c, 0.7 * fade);
      g.beginPath();
      for (let k = 0; k < pts.length; k++) {
        const p = pts[k];
        const wob = Math.sin(now / 300 + k * 0.5) * (1 + off);
        if (k === 0) g.moveTo(p.x + off, p.y + wob);
        else g.lineTo(p.x + off, p.y + wob);
      }
      g.strokePath();
    }
    // 丝上高光（沿丝移动）
    const flow = (now / 700) % 1;
    for (let k = 0; k < 4; k++) {
      const t = (k + flow) / 4;
      const i = Math.min(pts.length - 1, Math.floor(t * (pts.length - 1)));
      const p = pts[i];
      g.fillStyle(0xffffff, 0.6 * fade);
      g.fillCircle(p.x, p.y, 1.2);
    }
    // 悬挂的露珠（向下轻微垂坠）
    for (let k = 0; k < 5; k++) {
      const i = Math.floor(((k + 0.3) / 5) * (pts.length - 1));
      const p = pts[i];
      const sag = Math.sin(now / 400 + k * 1.4) * 2;
      g.fillStyle(a, 0.7 * fade);
      g.fillEllipse(p.x, p.y + 5 + sag, 3, 4.4);
      g.fillStyle(0xffffff, 0.7 * fade);
      g.fillCircle(p.x - 0.8, p.y + 4 + sag, 0.9);
    }
    const head = pts[pts.length - 1]; // 球头：蛛网小结
    g.lineStyle(1.3, c, 0.75 * fade);
    g.save(); g.translateCanvas(head.x, head.y); g.scaleCanvas(1, 0.7);
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * TAU;
      g.lineBetween(0, 0, Math.cos(ang) * 7, Math.sin(ang) * 7);
    }
    g.beginPath(); g.arc(0, 0, 4, 0, TAU); g.strokePath();
    g.restore();
    g.fillStyle(0xffffff, 0.85 * fade);
    g.fillCircle(head.x, head.y, 2);
  } },
  spdTrailB: { c: 0xff4a5a, a: 0x8ae0ff, draw: (ctx, c, a) => {
    // 攀墙丝痕：拖出的丝线 + 沿轨迹的蹬踏印（小三角） + 蛛感微光
    const { g, pts, fade, now } = ctx;
    g.lineStyle(2.4 * fade, 0xd8e0e8, 0.45 * fade); // 主丝痕
    g.beginPath();
    for (let k = 0; k < pts.length; k++) {
      const p = pts[k];
      const wob = Math.sin(now / 360 + k * 0.7) * 1.6;
      if (k === 0) g.moveTo(p.x, p.y + wob);
      else g.lineTo(p.x, p.y + wob);
    }
    g.strokePath();
    // 蹬踏印（左右交替的小三角，像攀爬落脚点）
    for (let k = 0; k < 9; k++) {
      const i = Math.floor(((k + 0.5) / 9) * (pts.length - 1));
      const p = pts[i];
      const side = k % 2 ? 1 : -1;
      const age = k / 9;
      g.fillStyle(c, (0.3 + age * 0.5) * fade);
      g.fillPoints([
        { x: p.x + side * 5, y: p.y },
        { x: p.x + side * 10, y: p.y + 3 },
        { x: p.x + side * 6, y: p.y + 5 },
      ] as never, true);
      g.fillStyle(0xffffff, (0.2 + age * 0.3) * fade);
      g.fillRect(p.x + side * 6, p.y, 3, 1);
    }
    // 蛛感微光（沿丝扩散的波纹点）
    for (let k = 0; k < 4; k++) {
      const ph = ((now / 600 + k / 4) % 1);
      const i = Math.floor(ph * (pts.length - 1));
      const p = pts[i];
      g.fillStyle(a, 0.5 * (1 - ph) * fade);
      g.fillCircle(p.x, p.y, 2.4 * (1 - ph) + 0.8);
    }
    const head = pts[pts.length - 1]; // 球头：红色蛛标
    g.fillStyle(c, 0.9 * fade);
    g.fillEllipse(head.x, head.y, 5, 6);
    g.lineStyle(1.2, 0xf0f4f8, 0.8 * fade);
    for (let k = 0; k < 4; k++) {
      const ang = -0.9 + k * 0.6;
      g.lineBetween(head.x, head.y, head.x + Math.cos(ang) * 8, head.y + Math.sin(ang) * 8);
      g.lineBetween(head.x, head.y, head.x - Math.cos(ang) * 8, head.y + Math.sin(ang) * 8);
    }
  } },
  // ── 钢铁巨兽 ──
  bstTrailA: { c: 0x4a4a52, a: 0xff6a2a, draw: (ctx, c, _a) => {
    // 黑烟拖尾：翻滚的黑色烟团（由小到大渐散）+ 夹带火星与铁屑
    const { g, pts, fade, now } = ctx;
    for (let k = 0; k < 12; k++) {
      const i = Math.floor(((k + 0.2) / 12) * (pts.length - 1));
      const p = pts[i];
      const age = k / 12;
      const ph = now / 900 + k * 1.4;
      const r = (5 + age * 13) * (1 + Math.sin(ph) * 0.12);
      g.fillStyle(0x1a1a20, (0.34 - age * 0.16) * fade);
      g.fillCircle(p.x + Math.sin(ph) * 5, p.y - age * 6 + Math.cos(ph * 1.2) * 3, r);
      g.fillStyle(0x3a3a42, (0.22 - age * 0.12) * fade);
      g.fillCircle(p.x + Math.sin(ph) * 5 - r * 0.3, p.y - age * 6 - r * 0.25, r * 0.6);
    }
    for (let k = 0; k < 6; k++) { // 火星
      const ph = ((now / 500 + k / 6) % 1);
      const i = Math.floor(ph * (pts.length - 1));
      const p = pts[i];
      g.fillStyle(k % 2 ? 0xffd45c : 0xff6a2a, (1 - ph) * 0.85 * fade);
      g.fillCircle(p.x + Math.sin(ph * 7 + k) * 4, p.y - ph * 10, 1.4 * (1 - ph) + 0.4);
    }
    for (let k = 0; k < 4; k++) { // 铁屑
      const i = Math.floor(((k + 0.4) / 4) * (pts.length - 1));
      const p = pts[i];
      g.fillStyle(0x8a8a92, 0.6 * fade);
      g.save(); g.translateCanvas(p.x, p.y - 4); g.rotateCanvas(now / 400 + k);
      g.fillRect(-2.4, -1.4, 4.8, 2.8);
      g.restore();
    }
    const head = pts[pts.length - 1]; // 球头：排气口
    g.fillStyle(c, 0.95 * fade);
    g.fillRoundedRect(head.x - 5, head.y - 4, 10, 8, 3);
    g.fillStyle(0xff6a2a, 0.6 * fade);
    g.fillCircle(head.x, head.y - 1, 2.4);
  } },
  bstTrailB: { c: 0xff6a2a, a: 0xffd45c, draw: (ctx, c, a) => {
    // 熔渣拖尾：熔融铁水痕（亮橙主线 + 冷却变暗的外层）+ 滴落熔珠 + 冷却星火
    const { g, pts, fade, now } = ctx;
    for (let k = 0; k < pts.length - 1; k++) { // 冷却外层（越老越暗越宽）
      const p0 = pts[k], p1 = pts[k + 1];
      const age = k / (pts.length - 1);
      g.lineStyle((3 + age * 9) * fade, 0x3a2a22, (0.5 - age * 0.2) * fade);
      g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.strokePath();
      g.lineStyle((2 + age * 5) * fade, c, (0.7 - age * 0.3) * fade);
      g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.strokePath();
    }
    for (let k = 0; k < pts.length - 1; k += 2) { // 内芯白热
      const p0 = pts[k], p1 = pts[k + 1];
      g.lineStyle(1.6 * fade, a, 0.6 * fade);
      g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.strokePath();
    }
    // 滴落熔珠（向下滴）
    for (let k = 0; k < 5; k++) {
      const i = Math.floor(((k + 0.3) / 5) * (pts.length - 1));
      const p = pts[i];
      const ph = ((now / 700 + k / 5) % 1);
      g.fillStyle(a, (1 - ph) * 0.9 * fade);
      g.fillEllipse(p.x + Math.sin(k * 2) * 3, p.y + 4 + ph * 12, 2.6, 4.4);
      g.fillStyle(0xffffff, (1 - ph) * 0.6 * fade);
      g.fillCircle(p.x + Math.sin(k * 2) * 3, p.y + 3 + ph * 12, 0.9);
    }
    // 冷却星火（离开主线后变暗的小点）
    for (let k = 0; k < 6; k++) {
      const ph = ((now / 800 + k / 6) % 1);
      const i = Math.floor(ph * (pts.length - 1));
      const p = pts[i];
      g.fillStyle(ph < 0.5 ? a : 0x6a4a3a, (1 - ph) * 0.7 * fade);
      g.fillCircle(p.x + (k % 2 ? 5 : -5), p.y - ph * 8, 1.2 * (1 - ph) + 0.4);
    }
    const head = pts[pts.length - 1]; // 球头：熔炉口
    const heat = 0.7 + 0.3 * Math.sin(now / 200);
    g.fillStyle(c, 0.5 * heat * fade);
    g.fillCircle(head.x, head.y, 9);
    g.fillStyle(a, 0.95 * fade);
    g.fillCircle(head.x, head.y, 4.4);
    g.fillStyle(0xffffff, heat * fade);
    g.fillCircle(head.x, head.y, 1.6);
  } },
};
