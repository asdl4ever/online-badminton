import { TAU, type G, type SwingArt, type SwingKit } from './shared';

/**
 * 批十三挥拍拖尾（尼斯湖水怪 / 熊出没 / 雪山谜踪）——**按名字重新构图**：
 * 每款不再是「沿轨迹铺条带 + 换色」，而是画出名字里那个东西本身：
 *   · 尼斯湖啸 = 一条水怪蛇身从轨迹里窜出、末端张口咆哮
 *   · 光头强之怒 = 一柄电锯沿轨迹切进木料，链齿滚动、木屑崩飞
 *   · 巨猿横扫 = 一条毛茸茸的巨臂横扫，末端张开巨掌、留下三道爪痕
 * 只影响画面，判定（拍长 / 甜区）仍由 constants.ts 决定。
 */

type Pt = { x: number; y: number };

/** 轨迹第 i 点的法线（单位向量） */
function nrm(k: SwingKit, i: number): Pt {
  const a = k.pts[Math.max(0, i - 1)];
  const b = k.pts[Math.min(k.n - 1, i + 1)];
  const dx = b.x - a.x, dy = b.y - a.y;
  const l = Math.hypot(dx, dy) || 1;
  return { x: -dy / l, y: dx / l };
}
/** 轨迹第 i 点的切线（单位向量，指向拍头） */
function tanOf(k: SwingKit, i: number): Pt {
  const a = k.pts[Math.max(0, i - 1)];
  const b = k.pts[Math.min(k.n - 1, i + 1)];
  const dx = b.x - a.x, dy = b.y - a.y;
  const l = Math.hypot(dx, dy) || 1;
  return { x: dx / l, y: dy / l };
}
/** 淡外光（只负责球场上的可读性，不进主剪影） */
function halo(g: G, k: SwingKit, color: number, a: number): void {
  for (let i = 1; i < k.n; i++) {
    g.lineStyle(Math.max(1, k.pts[i].w * 1.7), color, k.pts[i].a * a);
    g.lineBetween(k.pts[i - 1].x, k.pts[i - 1].y, k.pts[i].x, k.pts[i].y);
  }
}

export const SWINGS_14: Record<string, SwingArt> = {
  // ───────────────────────── 尼斯湖啸 ─────────────────────────
  lochSwing: { a: 0x35d8a8, draw: (g, now, hot, k, _c, a) => {
    const n = k.n;
    const body = a, deep = 0x123c3a, belly = 0xaef2d8, eyeC = 0xffe24a;
    halo(g, k, 0x8fe8c8, 0.12);

    // ① 蛇身：尾细颈粗的躯干，厚背 + 浅腹 + 背脊
    for (let i = 1; i < n; i++) {
      const nq = nrm(k, i - 1), np = nrm(k, i);
      const q = k.pts[i - 1], p = k.pts[i];
      const tq = (i - 1) / (n - 1), tp = i / (n - 1);
      const wq = q.w * (0.5 + 0.95 * tq), wp = p.w * (0.5 + 0.95 * tp);
      const al = p.a;
      g.fillStyle(deep, al * 0.95);
      g.fillPoints([
        { x: q.x + nq.x * wq * 1.08, y: q.y + nq.y * wq * 1.08 },
        { x: p.x + np.x * wp * 1.08, y: p.y + np.y * wp * 1.08 },
        { x: p.x - np.x * wp, y: p.y - np.y * wp },
        { x: q.x - nq.x * wq, y: q.y - nq.y * wq },
      ] as never, true);
      g.fillStyle(body, al);
      g.fillPoints([
        { x: q.x + nq.x * wq, y: q.y + nq.y * wq },
        { x: p.x + np.x * wp, y: p.y + np.y * wp },
        { x: p.x - np.x * wp, y: p.y - np.y * wp },
        { x: q.x - nq.x * wq, y: q.y - nq.y * wq },
      ] as never, true);
      g.fillStyle(belly, al * 0.5); // 腹部浅色
      g.fillPoints([
        { x: q.x - nq.x * wq * 0.12, y: q.y - nq.y * wq * 0.12 },
        { x: p.x - np.x * wp * 0.12, y: p.y - np.y * wp * 0.12 },
        { x: p.x - np.x * wp, y: p.y - np.y * wp },
        { x: q.x - nq.x * wq, y: q.y - nq.y * wq },
      ] as never, true);
    }
    // ② 腹甲横纹 + 背鳍
    for (let i = 1; i < n; i++) {
      const p = k.pts[i], np = nrm(k, i), tp = tanOf(k, i);
      const w = p.w * (0.5 + 0.95 * i / (n - 1));
      g.lineStyle(1.4, deep, p.a * 0.5);
      g.lineBetween(p.x - np.x * w * 0.2, p.y - np.y * w * 0.2, p.x - np.x * w * 0.9, p.y - np.y * w * 0.9);
      if (i % 2 === 0) {
        const bh = 5 + 4 * Math.abs(Math.sin(now / 320 + i));
        g.fillStyle(deep, p.a * 0.85);
        g.fillTriangle(
          p.x + np.x * w - tp.x * 2.4, p.y + np.y * w - tp.y * 2.4,
          p.x + np.x * w + tp.x * 2.4, p.y + np.y * w + tp.y * 2.4,
          p.x + np.x * (w + bh), p.y + np.y * (w + bh),
        );
      }
    }

    // ③ 水怪头：越过拍头，张口咆哮
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const hang = Math.atan2(dir.y, dir.x);
    g.save();
    g.translateCanvas(tip.x + dir.x * tip.w * 1.1, tip.y + dir.y * tip.w * 1.1);
    g.rotateCanvas(hang);
    // 颈根
    g.fillStyle(deep, 1);
    g.fillEllipse(0, 0, 15, 19);
    g.fillStyle(body, 1);
    g.fillEllipse(1, 0, 13, 16);
    // 颅骨 + 吻
    g.fillStyle(body, 1);
    g.fillPoints([{ x: -6, y: -9 }, { x: 24, y: -6 }, { x: 31, y: 0 }, { x: 24, y: 7 }, { x: -6, y: 10 }] as never, true);
    g.fillStyle(belly, 0.5);
    g.fillPoints([{ x: 0, y: -7 }, { x: 22, y: -5 }, { x: 26, y: -1 }, { x: 0, y: -2 }] as never, true);
    // 上颌牙
    for (let j = 0; j < 6; j++) {
      g.fillStyle(0xffffff, 0.96);
      g.fillTriangle(5 + j * 4, 1, 7.4 + j * 4, 1, 6.2 + j * 4, 4.4);
    }
    // 下颌（开合）
    const open = 0.3 + 0.24 * (0.5 + 0.5 * Math.sin(now / 210));
    g.save();
    g.translateCanvas(0, 3);
    g.rotateCanvas(open);
    g.fillStyle(deep, 1);
    g.fillPoints([{ x: -5, y: -2 }, { x: 22, y: 0 }, { x: 25, y: 6 }, { x: -5, y: 5 }] as never, true);
    for (let j = 0; j < 5; j++) {
      g.fillStyle(0xffffff, 0.96);
      g.fillTriangle(4 + j * 4, 2, 6.4 + j * 4, 2, 5.2 + j * 4, -1.2);
    }
    g.restore();
    // 眼 + 眉脊
    g.fillStyle(eyeC, 1);
    g.fillCircle(8, -4, 3.2);
    g.fillStyle(0x06201e, 1);
    g.fillRect(7.5, -6.6, 0.9, 5.2);
    g.fillStyle(deep, 1);
    g.fillTriangle(1, -8, 8, -8, 3.6, -13.5);
    // 咆哮声波
    for (let j = 0; j < 3; j++) {
      const r = 12 + j * 8 + ((now / 110 + j * 12) % 12);
      g.lineStyle(2.2 - j * 0.5, belly, Math.max(0, 0.5 - j * 0.13));
      g.beginPath(); g.arc(34, 0, r, -0.75, 0.75); g.strokePath();
    }
    // 喷出的水沫
    for (let j = 0; j < 5; j++) {
      const ph = ((now / 480 + j / 5) % 1);
      g.fillStyle(0xdff6ee, 0.8 * (1 - ph));
      g.fillCircle(30 + ph * 15, (j - 2) * 3.4 + ph * 6, 1.6 * (1 - ph) + 0.5);
    }
    g.restore();

    // ④ 沿身的水花 + 起点的水面涟漪
    for (let j = 0; j < 4; j++) {
      const ph = ((now / 680 + j / 4) % 1);
      const i = Math.round((1 - ph) * (n - 1) * 0.45);
      const p = k.pts[i], np = nrm(k, Math.max(1, i));
      g.fillStyle(0xdff6ee, 0.5 * (1 - ph) * p.a);
      g.fillCircle(p.x - np.x * (p.w + 3), p.y - np.y * (p.w + 3), 2 + ph * 3);
    }
    g.lineStyle(2, belly, 0.4 * k.pts[0].a * (0.6 + 0.4 * hot));
    g.save(); g.translateCanvas(k.pts[0].x, k.pts[0].y); g.scaleCanvas(1, 0.4);
    g.beginPath(); g.arc(0, 0, 9 + (now / 7) % 14, 0, TAU); g.strokePath(); g.restore();
  } },

  // ───────────────────────── 光头强之怒 ─────────────────────────
  boonSwing: { a: 0xffcf5c, draw: (g, now, hot, k, _c, a) => {
    const n = k.n;
    const steel = 0xcdd4dc, steelD = 0x59616b, chainC = 0x24282e;
    const wood = 0x8a5a3a, woodL = 0xc79a5e, dust = 0xe8d8a8;
    halo(g, k, 0xffcf5c, 0.13);

    // ① 木料：导板下侧一条被锯开的木条（连续带 + 断口毛刺 + 木纹）
    for (let i = 1; i < n; i++) {
      const nq = nrm(k, i - 1), np = nrm(k, i);
      const q = k.pts[i - 1], p = k.pts[i];
      const wq = q.w * 0.55, wp = p.w * 0.55;
      const oq = wq * 1.02 + 8, op = wp * 1.02 + 8;
      g.fillStyle(wood, p.a * 0.95);
      g.fillPoints([
        { x: q.x - nq.x * wq * 1.02, y: q.y - nq.y * wq * 1.02 },
        { x: p.x - np.x * wp * 1.02, y: p.y - np.y * wp * 1.02 },
        { x: p.x - np.x * op, y: p.y - np.y * op },
        { x: q.x - nq.x * oq, y: q.y - nq.y * oq },
      ] as never, true);
      // 断口毛刺
      if (i % 2 === 0) {
        g.fillStyle(woodL, p.a * 0.9);
        g.fillTriangle(
          p.x - np.x * wp * 1.02 - (p.x - q.x) * 0.3, p.y - np.y * wp * 1.02 - (p.y - q.y) * 0.3,
          p.x - np.x * wp * 1.02 + (p.x - q.x) * 0.3, p.y - np.y * wp * 1.02 + (p.y - q.y) * 0.3,
          p.x - np.x * (op + 4), p.y - np.y * (op + 4),
        );
      }
    }
    // 木纹
    g.lineStyle(1.2, 0x5a3820, 0.5);
    for (let i = 1; i < n; i++) {
      const np = nrm(k, i), p = k.pts[i], w = p.w * 0.55;
      g.lineBetween(p.x - np.x * (w + 3), p.y - np.y * (w + 3), p.x - np.x * (w + 7), p.y - np.y * (w + 7));
    }

    // ② 导板（金属条 + 中央导槽）
    for (let i = 1; i < n; i++) {
      const nq = nrm(k, i - 1), np = nrm(k, i);
      const q = k.pts[i - 1], p = k.pts[i];
      const wq = q.w * 0.55, wp = p.w * 0.55;
      const al = p.a;
      g.fillStyle(steelD, al);
      g.fillPoints([
        { x: q.x + nq.x * wq, y: q.y + nq.y * wq }, { x: p.x + np.x * wp, y: p.y + np.y * wp },
        { x: p.x - np.x * wp, y: p.y - np.y * wp }, { x: q.x - nq.x * wq, y: q.y - nq.y * wq },
      ] as never, true);
      g.fillStyle(steel, al * 0.95);
      const iwq = wq * 0.62, iwp = wp * 0.62;
      g.fillPoints([
        { x: q.x + nq.x * iwq, y: q.y + nq.y * iwq }, { x: p.x + np.x * iwp, y: p.y + np.y * iwp },
        { x: p.x - np.x * iwp, y: p.y - np.y * iwp }, { x: q.x - nq.x * iwq, y: q.y - nq.y * iwq },
      ] as never, true);
      g.lineStyle(1.8, chainC, al * 0.8);
      g.lineBetween(q.x, q.y, p.x, p.y);
    }

    // ③ 滚动的链齿（两侧，随 now 闪烁 = 链条在转）
    for (let i = 1; i < n - 1; i++) {
      const p = k.pts[i], np = nrm(k, i), tp = tanOf(k, i);
      const w = p.w * 0.55;
      for (const s of [1, -1]) {
        const flick = 0.45 + 0.55 * Math.abs(Math.sin(now / 75 - (i + (s > 0 ? 0 : 0.5)) * 1.3));
        const bx = p.x + np.x * s * w, by = p.y + np.y * s * w;
        g.fillStyle(chainC, p.a * flick);
        g.fillTriangle(
          bx - tp.x * 2.3, by - tp.y * 2.3,
          bx + tp.x * 2.3, by + tp.y * 2.3,
          bx + np.x * s * (w * 0.55 + 4.5), by + np.y * s * (w * 0.55 + 4.5),
        );
      }
    }

    // ④ 链轮头（拍头端的圆盘 + 齿）
    const tip = k.pts[n - 1];
    const tw = tip.w * 0.55;
    g.fillStyle(steelD, tip.a);
    g.fillCircle(tip.x, tip.y, tw + 4);
    g.fillStyle(steel, tip.a);
    g.fillCircle(tip.x, tip.y, tw + 1);
    for (let j = 0; j < 6; j++) {
      const ang = now / 260 + j * (TAU / 6);
      g.fillStyle(chainC, tip.a);
      g.fillTriangle(
        tip.x + Math.cos(ang) * (tw + 1), tip.y + Math.sin(ang) * (tw + 1),
        tip.x + Math.cos(ang + 0.4) * (tw + 1), tip.y + Math.sin(ang + 0.4) * (tw + 1),
        tip.x + Math.cos(ang + 0.2) * (tw + 6), tip.y + Math.sin(ang + 0.2) * (tw + 6),
      );
    }

    // ⑤ 引擎（轨迹起点）：橙壳 + 提手 + 拉绳 + 排气
    const p0 = k.pts[0], d0 = tanOf(k, 0);
    g.save();
    g.translateCanvas(p0.x, p0.y);
    g.rotateCanvas(Math.atan2(d0.y, d0.x));
    g.fillStyle(0xd86a2a, 1);
    g.fillRoundedRect(-16, -11, 28, 22, 5);
    g.fillStyle(0xa84a1a, 1);
    g.fillRoundedRect(-16, -11, 28, 6, 5);
    g.fillStyle(0x3a3a42, 1);
    g.fillRoundedRect(-9, -17, 17, 5, 2.4); // 顶提手
    g.fillStyle(0x2a2a30, 1);
    g.fillCircle(-2, -13.5, 3); // 拉绳柄
    g.lineStyle(1.6, 0xd8d4c8, 0.8);
    g.lineBetween(-2, -10.5, -2, -2);
    g.fillStyle(0x4a5058, 1);
    g.fillRect(10, -6, 6, 9); // 排气口
    g.restore();
    // 排气烟
    for (let j = 0; j < 3; j++) {
      const ph = ((now / 900 + j / 3) % 1);
      g.fillStyle(0x9a9488, 0.26 * (1 - ph));
      g.fillCircle(p0.x + d0.x * 14 + Math.sin(ph * 7 + j) * 5, p0.y + d0.y * 14 - 6 - ph * 16, 3 + ph * 6);
    }

    // ⑥ 崩飞的木屑（外侧，旋转木片）
    for (let j = 0; j < 8; j++) {
      const i0 = Math.max(1, Math.round(((j + 0.5) / 8) * (n - 1)));
      const p = k.pts[i0], np = nrm(k, i0);
      const out = p.w * 0.55 + 7 + 6 * Math.sin(now / 200 + j * 1.7);
      const cx = p.x + np.x * out, cy = p.y + np.y * out;
      g.save();
      g.translateCanvas(cx, cy);
      g.rotateCanvas(now / 220 + j * 0.9);
      g.fillStyle(j % 2 ? woodL : wood, p.a * 0.95);
      g.fillRect(-3.4, -1.7, 6.8, 3.4);
      g.fillStyle(0xd8b884, p.a * 0.5);
      g.fillRect(-3.4, -1.7, 2.4, 3.4);
      g.restore();
    }
    // 锯末
    for (let j = 0; j < 7; j++) {
      const ph = ((now / 850 + j / 7) % 1);
      const i0 = Math.max(1, Math.round((1 - ph) * (n - 1)));
      const p = k.pts[i0], np = nrm(k, i0);
      g.fillStyle(dust, 0.2 * (1 - ph));
      g.fillCircle(p.x - np.x * (p.w + ph * 9), p.y - np.y * (p.w + ph * 9), 3 + ph * 6);
    }

    // ⑦ 拍头端「怒气」放射短线
    for (let j = 0; j < 7; j++) {
      const ang = (j / 7) * TAU + now / 520;
      const r0 = tw + 8;
      g.lineStyle(2, a, 0.6 * tip.a * (0.5 + 0.5 * hot));
      g.lineBetween(tip.x + Math.cos(ang) * r0, tip.y + Math.sin(ang) * r0, tip.x + Math.cos(ang) * (r0 + 7), tip.y + Math.sin(ang) * (r0 + 7));
    }
  } },

  // ───────────────────────── 巨猿横扫 ─────────────────────────
  bigfSwing: { a: 0xbfe8ff, draw: (g, now, hot, k, _c, a) => {
    const n = k.n;
    const fur = 0xdfe8f2, furD = 0x8fa2b4, skin = 0x9fb0c0, claw = 0xeaf4ff, snow = 0xffffff;
    halo(g, k, 0xbfe8ff, 0.12);

    // ① 巨臂：从肩（起点）到手（末端）越来越粗的毛臂
    for (let i = 1; i < n; i++) {
      const nq = nrm(k, i - 1), np = nrm(k, i);
      const q = k.pts[i - 1], p = k.pts[i];
      const tq = (i - 1) / (n - 1), tp = i / (n - 1);
      const wq = q.w * (0.95 + 0.85 * tq), wp = p.w * (0.95 + 0.85 * tp);
      const al = p.a;
      g.fillStyle(furD, al);
      g.fillPoints([
        { x: q.x + nq.x * wq, y: q.y + nq.y * wq }, { x: p.x + np.x * wp, y: p.y + np.y * wp },
        { x: p.x - np.x * wp, y: p.y - np.y * wp }, { x: q.x - nq.x * wq, y: q.y - nq.y * wq },
      ] as never, true);
      g.fillStyle(fur, al * 0.96);
      const iwq = wq * 0.82, iwp = wp * 0.82;
      g.fillPoints([
        { x: q.x + nq.x * iwq, y: q.y + nq.y * iwq }, { x: p.x + np.x * iwp, y: p.y + np.y * iwp },
        { x: p.x - np.x * iwp, y: p.y - np.y * iwp }, { x: q.x - nq.x * iwq, y: q.y - nq.y * iwq },
      ] as never, true);
      g.fillStyle(skin, al * 0.4); // 内侧（掌侧）肤色
      g.fillPoints([
        { x: q.x - nq.x * wq * 0.5, y: q.y - nq.y * wq * 0.5 }, { x: p.x - np.x * wp * 0.5, y: p.y - np.y * wp * 0.5 },
        { x: p.x - np.x * wp, y: p.y - np.y * wp }, { x: q.x - nq.x * wq, y: q.y - nq.y * wq },
      ] as never, true);
    }
    // ② 臂毛：外缘一排毛刺（随 now 抖）
    for (let i = 1; i < n; i++) {
      const p = k.pts[i], np = nrm(k, i), tp = tanOf(k, i);
      const w = p.w * (0.95 + 0.85 * i / (n - 1));
      const len = 4 + 5 * Math.abs(Math.sin(now / 300 + i * 0.8));
      g.fillStyle(fur, p.a * 0.9);
      g.fillTriangle(
        p.x + np.x * w - tp.x * 2.4, p.y + np.y * w - tp.y * 2.4,
        p.x + np.x * w + tp.x * 2.4, p.y + np.y * w + tp.y * 2.4,
        p.x + np.x * (w + len), p.y + np.y * (w + len),
      );
    }

    // ③ 巨掌 + 五指 + 爪（越过拍头）
    const tip = k.pts[n - 1], dir = tanOf(k, n - 1);
    const hang = Math.atan2(dir.y, dir.x);
    const hw = tip.w * 0.9 + 7;
    g.save();
    g.translateCanvas(tip.x + dir.x * hw, tip.y + dir.y * hw);
    g.rotateCanvas(hang);
    g.fillStyle(furD, 1);
    g.fillEllipse(6, 0, 25, 23);
    g.fillStyle(fur, 1);
    g.fillEllipse(8, 0, 22, 20);
    g.fillStyle(skin, 0.7);
    g.fillEllipse(9, 2, 14, 12); // 掌心
    const spread = [-0.62, -0.2, 0.2, 0.62];
    for (let f = 0; f < 4; f++) {
      const fa = spread[f] + 0.12 * Math.sin(now / 250 + f);
      const fl = 15 + (f % 2) * 3;
      const fx = 15, fy = -5 + f * 3.4;
      const ex = fx + Math.cos(fa) * fl, ey = fy + Math.sin(fa) * fl;
      g.lineStyle(7, fur, 1);
      g.lineBetween(fx, fy, ex, ey);
      g.lineStyle(3, furD, 0.55);
      g.lineBetween(fx, fy, ex, ey);
      g.fillStyle(claw, 1);
      g.fillTriangle(ex - 2.2, ey - 2.2, ex + 2.2, ey + 2.2, ex + Math.cos(fa) * 6.5, ey + Math.sin(fa) * 6.5);
    }
    g.lineStyle(7, fur, 1); // 拇指
    g.lineBetween(6, 7, 0, 17);
    g.fillStyle(claw, 1);
    g.fillTriangle(-2, 16, 3, 22, 6, 16);
    g.restore();

    // ④ 三道爪痕（沿轨迹留在空气里的浅色弧线）
    for (let gI = 0; gI < 3; gI++) {
      const off = 11 + gI * 7;
      g.lineStyle(2.6 - gI * 0.6, snow, 0.35 * (0.55 + 0.45 * hot));
      g.beginPath();
      let started = false;
      for (let i = Math.floor(n * 0.34); i < n; i++) {
        const p = k.pts[i], np = nrm(k, Math.max(1, i));
        const x = p.x + np.x * off, y = p.y + np.y * off;
        if (!started) { g.moveTo(x, y); started = true; } else g.lineTo(x, y);
      }
      g.strokePath();
    }

    // ⑤ 拍头端的雪尘 + 冰晶
    for (let j = 0; j < 7; j++) {
      const ang = (j / 7) * TAU + now / 380;
      const d = 12 + hot * 12 + ((now / 80 + j * 9) % 14);
      const cx = tip.x + Math.cos(ang) * d, cy = tip.y + Math.sin(ang) * d * 0.8;
      const al = Math.max(0, 0.8 - d / 70);
      g.lineStyle(1.4, a, al);
      for (let s2 = 0; s2 < 3; s2++) {
        const a2 = now / 620 + (s2 / 3) * Math.PI;
        g.lineBetween(cx - Math.cos(a2) * 4.4, cy - Math.sin(a2) * 4.4, cx + Math.cos(a2) * 4.4, cy + Math.sin(a2) * 4.4);
      }
    }
    for (let j = 0; j < 6; j++) {
      const ang = (j / 6) * TAU - now / 300;
      const d = 8 + hot * 10;
      g.fillStyle(claw, 0.8);
      g.fillPoints([
        { x: tip.x + Math.cos(ang) * d, y: tip.y + Math.sin(ang) * d },
        { x: tip.x + Math.cos(ang) * (d + 8), y: tip.y + Math.sin(ang) * (d + 8) },
        { x: tip.x + Math.cos(ang + 0.25) * d, y: tip.y + Math.sin(ang + 0.25) * d },
      ] as never, true);
    }
  } },
};
