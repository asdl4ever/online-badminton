import type { SwingArt } from './shared';

/** 局部小工具：实心星 / 多边形 */
function star(g: any, x: number, y: number, r: number, rot: number, color: number, al: number, pts = 5): void {
  const vs = [];
  for (let k = 0; k < pts * 2; k++) {
    const ang = rot + (k / (pts * 2)) * Math.PI * 2;
    const rr = k % 2 === 0 ? r : r * 0.42;
    vs.push({ x: x + Math.cos(ang) * rr, y: y + Math.sin(ang) * rr });
  }
  g.fillStyle(color, al);
  g.fillPoints(vs as never, true, true);
}
function poly(g: any, x: number, y: number, r: number, sides: number, rot: number, color: number, al: number): void {
  const vs = [];
  for (let k = 0; k < sides; k++) {
    const ang = rot + (k / sides) * Math.PI * 2;
    vs.push({ x: x + Math.cos(ang) * r, y: y + Math.sin(ang) * r });
  }
  g.fillStyle(color, al);
  g.fillPoints(vs as never, true, true);
}

/**
 * 第三、四批主题挥拍拖尾——按「斩」的名字逐款构图。
 */
export const SWINGS_2: Record<string, SwingArt> = {
  // 岩浆斩：暗壳熔岩刃 + 烧红的裂口
  vulcSwing: { a: 0xffb347, draw: (g, _now, _hot, k, c, _a) => {
    k.ribbon(3.4, 0x3a1a0a, 0.6);
    k.ribbon(1.4, c, 1);
    for (let i = 2; i < k.n; i += 2) {
      const p = k.at(i);
      g.fillStyle(0xff5a1a, 0.7);
      g.fillCircle(p.x + Math.sin(i * 2.4) * 4, p.y, 1.4 + k.pts[i].w);
    }
    k.core(0.36, 1.15);
  } },
  // 海啸斩：卷起的浪头拍过刀锋
  trenchSwing: { a: 0x5fd0c0, draw: (g, _now, _hot, k, c, _a) => {
    k.ribbon(3.6, 0x1a2a4a, 0.5);
    k.ribbon(2, c, 0.9);
    for (let i = 2; i < k.n; i += 3) {
      const p = k.at(i, -6);
      g.fillStyle(0xffffff, 0.75);
      g.fillCircle(p.x, p.y, 1.6 + k.pts[i].w);
    }
    k.core(0.34, 1.1);
  } },
  // 居合斩：出鞘一瞬的白刃
  dojoSwing: { a: 0xf0eee4, draw: (g, now, hot, k, c, _a) => {
    k.ribbon(0.9, 0xffffff, 1);
    k.ribbon(2.2, c, 0.25 + hot * 0.3);
    k.core(0.5, 1.4);
    const tip = k.at(k.n - 1);
    star(g, tip.x, tip.y, 3.5 + hot * 4, now / 90, 0xffffff, 0.95, 4);
  } },
  // 泼墨斩：甩出去的一串墨点
  inkwSwing: { a: 0x2a2e36, draw: (g, now, _hot, k, _c, _a) => {
    k.ribbon(3.6, 0x2a2e36, 0.8);
    for (let i = 1; i < k.n; i += 2) {
      const p = k.at(i, Math.sin(i * 2.6 + now / 300) * 8);
      g.fillStyle(0x2a2e36, 0.55);
      g.fillCircle(p.x, p.y, 1.2 + k.pts[i].w * 2.6);
    }
    k.core(0.32, 1.05);
  } },
  // 花瓣斩：刀锋卷起一阵花瓣
  fairySwing: { a: 0xffb7d5, draw: (g, now, _hot, k, c, a) => {
    k.ribbon(2.2, c, 0.7);
    for (let i = 2; i < k.n; i += 2) {
      const p = k.at(i, Math.sin(now / 240 + i * 1.4) * 7);
      poly(g, p.x, p.y, 2.2 + k.pts[i].w, 3, now / 220 + i, i % 2 ? a : 0xffffff, 0.8);
    }
    k.core(0.3, 1.05);
  } },
  // 疾驰斩：风驰电掣的速度线
  racerSwing: { a: 0xffd45c, draw: (g, _now, _hot, k, c, a) => {
    k.ribbon(1.2, c, 0.9);
    for (let i = 2; i < k.n; i += 2) {
      const p = k.at(i);
      const back = k.at(Math.max(0, i - 4));
      g.lineStyle(1.8, a, 0.5);
      g.lineBetween(p.x, p.y, back.x, back.y);
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(p.x, p.y, 1.2);
    }
    k.core(0.35, 1.2);
  } },
  // 血宴斩：暗刃 + 滴落的血珠
  vampSwing: { a: 0xc0203a, draw: (g, now, _hot, k, c, _a) => {
    k.ribbon(3.2, 0x1a1420, 0.7);
    k.ribbon(1.2, c, 1);
    for (let i = 2; i < k.n; i += 2) {
      const p = k.at(i);
      const drip = ((now / 160 + i * 21) % 14);
      g.fillStyle(c, 0.7 - drip / 22);
      g.fillCircle(p.x, p.y + drip, 1.2 + k.pts[i].w);
    }
    k.core(0.32, 1.05);
  } },
  // 落枫斩：红枫叶沿刃打旋
  autumnSwing: { a: 0xd4622a, draw: (g, now, _hot, k, c, _a) => {
    k.ribbon(2.4, c, 0.7);
    for (let i = 2; i < k.n; i += 2) {
      const p = k.at(i, Math.sin(now / 300 + i) * 7);
      star(g, p.x, p.y, 2.6 + k.pts[i].w, now / 260 + i, i % 2 ? c : 0xffd45c, 0.85);
    }
    k.core(0.32, 1.1);
  } },
  // 竹裂斩：被一刀劈开的两半竹节
  pandaSwing: { a: 0x8fbf5a, draw: (g, _now, _hot, k, c, _a) => {
    k.ribbon(1.2, 0xffffff, 0.9);
    for (let i = 1; i < k.n - 1; i += 3) {
      const p = k.at(i);
      const ang = Math.atan2(p.y - k.at(Math.max(0, i - 3)).y, p.x - k.at(Math.max(0, i - 3)).x);
      for (const s of [-1, 1]) {
        g.lineStyle(3, i % 2 ? c : 0x4a6a2a, 0.85);
        g.lineBetween(p.x + Math.cos(ang + Math.PI / 2) * 3.5 * s, p.y + Math.sin(ang + Math.PI / 2) * 3.5 * s,
          p.x + Math.cos(ang + Math.PI / 2 + 0.5 * s) * 9 * s, p.y + Math.sin(ang + Math.PI / 2 + 0.5 * s) * 9 * s);
      }
    }
    k.core(0.34, 1.1);
  } },
  // 切牌斩：刀锋把扑克牌切成两半
  jokerSwing: { a: 0xffd45c, draw: (g, now, _hot, k, c, a) => {
    k.ribbon(1.4, 0xffffff, 0.8);
    for (let i = 2; i < k.n; i += 3) {
      const p = k.at(i);
      poly(g, p.x - 3, p.y + 2, 3, 4, now / 250 + i, i % 2 ? a : 0xe8404a, 0.8);
      poly(g, p.x + 3, p.y - 2, 3, 4, now / 250 + i + 1, i % 2 ? 0xffffff : c, 0.8);
      g.lineStyle(1, 0x1a1a22, 0.5);
      g.lineBetween(p.x - 5, p.y - 4, p.x + 5, p.y + 4);
    }
    k.core(0.3, 1.05);
  } },
  // 开山斩：一道金色裂隙劈开山岩
  pagodSwing: { a: 0xffd45c, draw: (g, _now, _hot, k, _c, a) => {
    k.ribbon(3, 0x6a5a4a, 0.5);
    for (let i = 1; i < k.n; i += 2) {
      const p0 = k.at(i), p1 = k.at(Math.min(k.n - 1, i + 1), Math.sin(i) * 3);
      g.lineStyle(2, a, 0.9);
      g.lineBetween(p0.x, p0.y, p1.x, p1.y);
    }
    for (let i = 2; i < k.n; i += 3) {
      const p = k.at(i, Math.sin(i * 2.4) * 8);
      poly(g, p.x, p.y, 2.4, 3, i * 1.3, 0x6a5a4a, 0.7);
    }
    k.core(0.4, 1.2);
  } },
  // 龙卷斩：绕刃疾转的气旋
  stormSwing: { a: 0x9fd8ff, draw: (g, now, _hot, k, c, a) => {
    k.ribbon(2, c, 0.6);
    for (let i = 1; i < k.n; i += 2) {
      const p = k.at(i);
      const swirl = now / 120 + i * 1.4;
      const r = 3 + (i % 3) * 3;
      g.fillStyle(i % 2 ? a : 0xffffff, 0.6);
      g.fillCircle(p.x + Math.cos(swirl) * r, p.y + Math.sin(swirl) * r * 0.6, 1.4);
    }
    k.core(0.36, 1.2);
  } },
  // 月华斩：银白月刃 + 月尘
  lunarSwing: { a: 0xffe89a, draw: (g, _now, _hot, k, c, a) => {
    k.ribbon(3, a, 0.55);
    k.ribbon(1, 0xffffff, 1);
    for (let i = 2; i < k.n; i += 2) {
      const p = k.at(i, Math.sin(i * 2.2) * 6);
      g.fillStyle(c, 0.6);
      g.fillCircle(p.x, p.y, 1.2 + k.pts[i].w);
    }
    k.core(0.42, 1.3);
  } },
  // 战斧斩：厚重的斧刃劈过
  vikingSwing: { a: 0xc0c8d0, draw: (g, _now, _hot, k, c, _a) => {
    k.ribbon(3.6, c, 0.6);
    k.ribbon(1.4, 0xffffff, 0.9);
    for (let i = 2; i < k.n; i += 3) {
      const p = k.at(i);
      const ang = Math.atan2(p.y - k.at(Math.max(0, i - 2)).y, p.x - k.at(Math.max(0, i - 2)).x);
      poly(g, p.x + Math.cos(ang) * 5, p.y + Math.sin(ang) * 5, 3.6, 3, ang, 0x8a6a4a, 0.75);
    }
    k.core(0.38, 1.2);
  } },
  // 猛扑斩：三道野兽抓痕
  safariSwing: { a: 0xffb03a, draw: (g, _now, _hot, k, c, _a) => {
    k.ribbon(2.4, 0x8a6a4a, 0.4);
    for (let i = 1; i < k.n; i += 2) {
      const p0 = k.at(i), p1 = k.at(Math.min(k.n - 1, i + 1));
      for (const s of [-1, 0, 1]) {
        g.lineStyle(1.6, c, 0.85);
        g.lineBetween(p0.x, p0.y + s * 5, p1.x + s * 3, p1.y + s * 7);
      }
    }
    k.core(0.34, 1.1);
  } },
  // 谢幕斩：帷幕扫过 + 追光
  theatSwing: { a: 0xfff0c0, draw: (g, now, _hot, k, c, a) => {
    k.ribbon(3.4, 0xc0203a, 0.45);
    k.ribbon(1.6, c, 0.95);
    for (let i = 2; i < k.n; i += 2) {
      const p = k.at(i, Math.sin(i * 1.8) * 6);
      star(g, p.x, p.y, 1.8 + k.pts[i].w, now / 240 + i, a, 0.85, 4);
    }
    k.core(0.4, 1.25);
  } },
  // 极光斩：多层极光带随刃摆动
  boreaSwing: { a: 0x7dffc4, draw: (_g, _now, _hot, k, c, _a) => {
    k.ribbon(4.4, 0x9ad4ff, 0.4);
    k.ribbon(2.6, c, 0.65);
    k.ribbon(1, 0xffffff, 0.9);
    k.core(0.36, 1.2);
  } },
  // 荡桨斩：桨叶划过留下的水痕
  venicSwing: { a: 0xffd8a0, draw: (g, now, _hot, k, c, _a) => {
    k.ribbon(3, 0x5fe8d0, 0.45);
    k.ribbon(1.4, c, 0.95);
    for (let i = 2; i < k.n; i += 2) {
      const p = k.at(i);
      const ex = ((now / 240 + i * 19) % 10) / 10;
      g.lineStyle(1.2, 0x5fe8d0, (1 - ex) * 0.6);
      g.strokeCircle(p.x, p.y, 2 + ex * 6);
    }
    k.core(0.34, 1.1);
  } },
  // 神罚斩：神明降下的光柱刃
  olympSwing: { a: 0xfff0b0, draw: (g, _now, _hot, k, _c, a) => {
    k.ribbon(4, a, 0.5);
    k.ribbon(1.4, 0xffffff, 1);
    for (let i = 1; i < k.n; i += 2) {
      const p = k.at(i);
      g.lineStyle(1, a, 0.5);
      g.lineBetween(p.x, p.y - 12, p.x, p.y + 12);
    }
    k.core(0.45, 1.35);
  } },
  // 旋舞斩：舞动的彩带绕刃飞旋
  sambaSwing: { a: 0xff8ad4, draw: (g, now, _hot, k, c, a) => {
    k.ribbon(2.4, c, 0.75);
    k.ribbon(3.6, 0x4ac8ff, 0.35);
    for (let i = 2; i < k.n; i += 2) {
      const p = k.at(i, Math.sin(now / 200 + i * 1.6) * 8);
      poly(g, p.x, p.y, 2 + k.pts[i].w, 4, now / 200 + i, [a, 0xffd45c, 0x8fd45a][i % 3], 0.8);
    }
    k.core(0.34, 1.15);
  } },
};
