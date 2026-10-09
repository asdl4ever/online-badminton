import { TAU, type SwingArt, type SwingKit } from './shared';

/** 第九批挥拍拖尾（恐龙 / 史前 / 神话 / 恶搞 10 主题）——按名字沿真实拍头轨迹构图 */

function tang(k: SwingKit, i: number): number {
  const a = k.pts[Math.max(0, i - 1)], b = k.pts[Math.min(k.n - 1, i + 1)];
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export const SWINGS_21: Record<string, SwingArt> = {
  // ── 白垩纪猎场 ──
  cretBite: { a: 0xff7a2a, draw: (g, now, hot, kit, c, _a) => {
    // 暴龙撕咬斩：沿轨迹窜出咆哮暴龙头，巨颚开合咬下 + 碎骨
    kit.ribbon(6, 0x4a3a22, 0.5); kit.core(3, 0.7);
    const j = Math.floor(kit.n * 0.6); const h = kit.at(j);
    g.save(); g.translateCanvas(h.x, h.y); g.rotateCanvas(tang(kit, j));
    const open = 0.25 + 0.3 * Math.abs(Math.sin(now / 120 + hot * 6));
    g.fillStyle(c, 1); g.fillPoints([{ x: -10, y: -6 }, { x: 22, y: -8 }, { x: 34, y: -22 }, { x: 6, y: -14 }] as never, true);
    g.save(); g.rotateCanvas(-open); g.fillStyle(c, 1); g.fillPoints([{ x: -12, y: 0 }, { x: 26, y: -2 }, { x: 36, y: -6 }, { x: -10, y: 8 }] as never, true); g.fillStyle(0xf0e8d0, 1); for (let k = 0; k < 5; k++) { g.fillTriangle(2 + k * 6, 0, 5 + k * 6, 0, 3 + k * 6, 8); } g.restore();
    g.save(); g.rotateCanvas(open); g.fillStyle(c, 1); g.fillPoints([{ x: -12, y: 0 }, { x: 26, y: -2 }, { x: 36, y: -6 }, { x: -10, y: -8 }] as never, true); g.fillStyle(0xf0e8d0, 1); for (let k = 0; k < 5; k++) { g.fillTriangle(2 + k * 6, 0, 5 + k * 6, 0, 3 + k * 6, -8); } g.restore();
    g.fillStyle(0xff5a3a, 0.9); g.fillCircle(14, -16, 3);
    g.restore();
    // 碎骨
    const e = kit.at(kit.n - 1); for (let k = 0; k < 7; k++) { const ang = k * 1.1 + now / 200; g.fillStyle(0xf0e8d0, 0.9); g.save(); g.translateCanvas(e.x + Math.cos(ang) * 30 * hot, e.y + Math.sin(ang) * 30 * hot); g.rotateCanvas(ang); g.fillRect(-3, -1.6, 6, 3.2); g.restore(); }
  } },
  // ── 史前沼泽 ──
  swampRoll: { a: 0x7dff9a, draw: (g, now, hot, kit, c, _a) => {
    // 巨鳄翻滚斩：鳄身螺旋翻转 + 水花
    kit.ribbon(7, 0x2a5a3a, 0.5); kit.core(3, 0.6);
    for (let i = 2; i < kit.n - 1; i += 3) { const p = kit.at(i); const roll = i / kit.n * TAU * 1.5 + now / 150; g.save(); g.translateCanvas(p.x, p.y); g.rotateCanvas(roll); g.fillStyle(c, kit.pts[i].a * 0.9); g.fillEllipse(0, 0, 20, 8); g.fillStyle(0x2a5a3a, 0.8); for (let k = 0; k < 4; k++) { g.fillTriangle(-8 + k * 5, -3, -6 + k * 5, -3, -7 + k * 5, -8); } g.restore(); }
    const e = kit.at(kit.n - 1); for (let k = 0; k < 9; k++) { const ang = k / 9 * TAU + now / 100; g.fillStyle(0xdff4ff, 0.7); g.fillCircle(e.x + Math.cos(ang) * (20 + hot * 24), e.y + Math.sin(ang) * (14 + hot * 18), 2.4); }
  } },
  // ── 冰河世纪 ──
  iceageGlacier: { a: 0x8fd8ff, draw: (g, now, hot, kit, c, _a) => {
    // 冰川劈斩：崩落冰川断面 + 碎冰飞溅
    kit.ribbon(8, 0x5a8ab0, 0.6); kit.core(4, 0.8);
    for (let i = 2; i < kit.n - 1; i += 2) { const p = kit.at(i); const t = tang(kit, i); const sw = 10 + kit.pts[i].w * 1.2; g.save(); g.translateCanvas(p.x, p.y); g.rotateCanvas(t); g.fillStyle(c, kit.pts[i].a * 0.85); g.fillPoints([{ x: -sw * 0.4, y: -6 }, { x: sw * 0.5, y: -4 }, { x: sw * 0.5, y: 4 }, { x: -sw * 0.4, y: 6 }] as never, true); g.fillStyle(0xdff4ff, 0.6); g.fillPoints([{ x: -sw * 0.3, y: -3 }, { x: sw * 0.3, y: -2 }, { x: sw * 0.3, y: 2 }] as never, true); g.restore(); }
    const e = kit.at(kit.n - 1); for (let k = 0; k < 10; k++) { const ang = k / 10 * TAU + now / 150; g.fillStyle(0xdff4ff, 0.85); g.fillPoints([{ x: e.x + Math.cos(ang) * 20 * hot, y: e.y + Math.sin(ang) * 20 * hot }, { x: e.x + Math.cos(ang + 0.2) * 30 * hot, y: e.y + Math.sin(ang + 0.2) * 30 * hot }, { x: e.x + Math.cos(ang + 0.4) * 20 * hot, y: e.y + Math.sin(ang + 0.4) * 20 * hot }] as never, true); }
  } },
  // ── 非洲雷神 ──
  yorAxeSwing: { a: 0xffe08a, draw: (g, now, hot, kit, c, a) => {
    // 雷神双斧斩：两道交叉斧光 + 交线爆电
    kit.ribbon(6, 0x7a3416, 0.4);
    const cols = [0xffb03a, 0xffe08a];
    for (let lane = 0; lane < 2; lane++) { const off = lane ? 6 : -6; for (let i = 2; i < kit.n - 1; i += 2) { const p = kit.at(i, off); const t = tang(kit, i); g.save(); g.translateCanvas(p.x, p.y); g.rotateCanvas(t + (lane ? 1.4 : -1.4)); g.fillStyle(cols[lane], kit.pts[i].a * 0.7); g.fillPoints([{ x: -12, y: 0 }, { x: 6, y: -7 }, { x: 12, y: 0 }, { x: 6, y: 7 }] as never, true); g.restore(); } }
    const mid = kit.at(Math.floor(kit.n * 0.5));
    g.lineStyle(3, 0xfff080, 0.5 + 0.5 * Math.abs(Math.sin(now / 90))); g.lineBetween(mid.x - 10, mid.y + 10, mid.x + 10, mid.y - 10);
    const e = kit.at(kit.n - 1); for (let k = 0; k < 8; k++) { const ang = k / 8 * TAU + now / 120; g.lineStyle(2, 0xffe08a, 0.8); g.lineBetween(e.x, e.y, e.x + Math.cos(ang) * 26 * hot, e.y + Math.sin(ang) * 26 * hot); }
    void c; void a;
  } },
  // ── 芬兰史诗 ──
  kalSongSwing: { a: 0x9fe8d0, draw: (g, now, hot, kit, c, a) => {
    // 万物之歌斩：五线谱化作光刃 + 音符飞散
    kit.ribbon(7, 0x3a5a6a, 0.4); kit.core(3, 0.7);
    for (let s = -1; s <= 1; s++) { for (let i = 2; i < kit.n - 1; i += 1) { const p = kit.at(i, s * 5); g.fillStyle(c, kit.pts[i].a * 0.5); g.fillCircle(p.x, p.y, 1.2); } }
    for (let i = 3; i < kit.n - 1; i += 4) { const p = kit.at(i); g.fillStyle(0xd8e8f0, 0.85); g.fillEllipse(p.x, p.y, 5, 4); g.fillRect(p.x + 1.4, p.y - 8, 1.3, 8); }
    const e = kit.at(kit.n - 1); for (let k = 0; k < 3; k++) { g.lineStyle(2, a, (0.7 - k * 0.2) * (0.6 + 0.4 * Math.sin(now / 100))); g.strokeCircle(e.x, e.y, 10 + k * 12 * hot); }
  } },
  // ── 香蕉王国 ──
  banSlip: { a: 0xfff080, draw: (g, now, hot, kit, c, _a) => {
    // 蕉皮滑铲斩：脚下连环蕉皮 + 果汁爆开
    kit.ribbon(5, 0x8a8a1a, 0.35);
    for (let i = 2; i < kit.n - 1; i += 5) { const p = kit.at(i); g.save(); g.translateCanvas(p.x, p.y); g.rotateCanvas(now / 200 + i); g.fillStyle(c, 0.95); g.fillPoints([{ x: -8, y: 0 }, { x: 0, y: -6 }, { x: 8, y: 0 }, { x: 0, y: 5 }] as never, true); g.restore(); }
    const e = kit.at(kit.n - 1); for (let k = 0; k < 9; k++) { const ang = k / 9 * TAU + now / 130; g.fillStyle(k % 2 ? 0xfff6c0 : c, 0.85); g.fillCircle(e.x + Math.cos(ang) * 26 * hot, e.y + Math.sin(ang) * 26 * hot, 3); }
  } },
  // ── 迷因宇宙 ──
  meme404: { a: 0x39ffd0, draw: (g, now, hot, kit, c, a) => {
    // 404斩：巨大的「404 ERROR」光刃 + 报错红框炸开
    kit.ribbon(6, 0x2a2a3a, 0.4); kit.core(3, 0.6);
    const mid = kit.at(Math.floor(kit.n * 0.55));
    const sc = 1 + hot * 0.6; g.fillStyle(c, 0.92); g.fillRoundedRect(mid.x - 40 * sc, mid.y - 12 * sc, 80 * sc, 24 * sc, 4);
    g.fillStyle(0xff4a5a, 0.9); g.fillRect(mid.x - 36 * sc, mid.y - 8 * sc, 30 * sc, 4 * sc); g.fillRect(mid.x - 36 * sc, mid.y + 1 * sc, 22 * sc, 4 * sc);
    g.lineStyle(2, 0x0e1620, 0.8); g.strokeRect(mid.x - 40 * sc, mid.y - 12 * sc, 80 * sc, 24 * sc);
    const e = kit.at(kit.n - 1); for (let k = 0; k < 14; k++) { const ang = k / 14 * TAU + now / 160; g.fillStyle(k % 3 === 0 ? 0xff4a5a : k % 3 === 1 ? 0x7dff9a : 0x39ffd0, 0.8); g.fillRect(e.x + Math.cos(ang) * 34 * hot, e.y + Math.sin(ang) * 34 * hot, 4, 4); }
    void a;
  } },
  // ── 摸鱼办公室 ──
  officeOvertime: { a: 0xffd45c, draw: (g, now, hot, kit, c, a) => {
    // 加班暴击斩：巨大的「加班」印章拍下 + 票据飞散
    kit.ribbon(6, 0x3a3a44, 0.35);
    const mid = kit.at(Math.floor(kit.n * 0.6)); const sc = 1 + hot * 0.5;
    g.fillStyle(0x8a2a2a, 0.85); g.fillRoundedRect(mid.x - 26 * sc, mid.y - 26 * sc, 52 * sc, 52 * sc, 5);
    g.fillStyle(c, 0.95); g.fillRoundedRect(mid.x - 22 * sc, mid.y - 22 * sc, 44 * sc, 44 * sc, 4);
    g.lineStyle(3, 0xd84a3a, 0.9); g.strokeRect(mid.x - 16 * sc, mid.y - 16 * sc, 32 * sc, 32 * sc);
    const e = kit.at(kit.n - 1); for (let k = 0; k < 8; k++) { const ang = k / 8 * TAU + now / 140; g.fillStyle(0xf0ead8, 0.85); g.save(); g.translateCanvas(e.x + Math.cos(ang) * 30 * hot, e.y + Math.sin(ang) * 30 * hot); g.rotateCanvas(ang); g.fillRect(-5, -3, 10, 6); g.restore(); }
    void a;
  } },
  // ── 花园地精 ──
  gnomeVine: { a: 0xa8ff7a, draw: (g, now, hot, kit, c, a) => {
    // 藤蔓缠绕斩：疯长的藤蔓横扫 + 花苞绽开
    kit.ribbon(5, 0x3a6a2a, 0.4);
    for (let i = 2; i < kit.n - 1; i += 3) { const p = kit.at(i); const wob = Math.sin(i * 0.6 + now / 200) * 6; const t = tang(kit, i); g.save(); g.translateCanvas(p.x, p.y); g.rotateCanvas(t + 1.57); g.fillStyle(c, kit.pts[i].a * 0.85); g.fillEllipse(wob, 0, 10 + kit.pts[i].w, 3); g.restore(); }
    const last = Math.floor(kit.n * 0.85); const fp = kit.at(last);
    for (let k = 0; k < 5; k++) { const ang = k / 5 * TAU; g.fillStyle(0xffd0e2, 0.9); g.fillPoints([{ x: fp.x, y: fp.y }, { x: fp.x + Math.cos(ang) * 8 * hot, y: fp.y + Math.sin(ang) * 8 * hot }, { x: fp.x + Math.cos(ang + 0.5) * 8 * hot, y: fp.y + Math.sin(ang + 0.5) * 8 * hot }] as never, true); }
    g.fillStyle(0xffe040, 0.9); g.fillCircle(fp.x, fp.y, 3);
    void a;
  } },
  // ── 垃圾回收站 ──
  trashCrusher: { a: 0x8fd4a0, draw: (g, now, hot, kit, c, _a) => {
    // 压缩机碾压斩：两只合拢的压板 + 崩出的零件汽水
    kit.ribbon(7, 0x3a4a4a, 0.5); kit.core(3, 0.6);
    const mid = kit.at(Math.floor(kit.n * 0.55)); const t = tang(kit, mid && kit.n ? Math.floor(kit.n * 0.55) : 1);
    const gap = (1 - hot) * 20 + 6;
    g.save(); g.translateCanvas(mid.x, mid.y); g.rotateCanvas(t);
    g.fillStyle(c, 0.95); g.fillRect(-6, -gap - 14, 30, 12); g.fillRect(-6, gap + 2, 30, 12);
    g.fillStyle(0x2a3a3a, 0.8); for (let k = 0; k < 4; k++) { g.fillRect(-4 + k * 8, -gap - 12, 3, 8); g.fillRect(-4 + k * 8, gap + 4, 3, 8); }
    g.restore();
    const e = kit.at(kit.n - 1); for (let k = 0; k < 10; k++) { const ang = k / 10 * TAU + now / 160; g.fillStyle(k % 3 === 0 ? 0xd84a3a : k % 3 === 1 ? 0xf0d020 : 0x8fd4a0, 0.85); g.fillRect(e.x + Math.cos(ang) * 32 * hot, e.y + Math.sin(ang) * 32 * hot, 5, 4); }
    for (let k = 0; k < 4; k++) { g.fillStyle(0xffffff, 0.35 * (1 - k / 4)); g.fillCircle(e.x, e.y - k * 8, 6 + k * 4); }
  } },
};
