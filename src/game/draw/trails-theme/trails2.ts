import {
  curve, ribbon, scatter, boltLine, headCore, alongPath, starAt, polyAt, petalAt,
  ringAt, puffAt, sparkAt, type TrailArt,
} from './shared';

/**
 * 第三、四批主题拖尾——按名字逐款构图，每款有自己贴题的主形与动态。
 */
export const TRAILS_2: Record<string, TrailArt> = {
  // 火星拖尾：烧红的火星一路往上蹿
  vulcTrailA: { c: 0xffb347, a: 0xff5a1a, draw: (t, c, a) => {
    curve(t, 2, 6, 0.1, 0.4, a);
    alongPath(t, 2, 1, (x, y, _ang, f, i) => {
      const rise = ((t.now / 120 + i * 13) % 18);
      sparkAt(t, x, y - rise, 2 + f * 2.4, t.now / 200 + i, i % 2 ? c : a, (0.6 - rise / 24) * (0.4 + f * 0.6));
    });
    headCore(t, a);
  } },
  // 熔流拖尾：亮芯熔浆 + 结壳的暗斑
  vulcTrailB: { c: 0xff5a1a, a: 0xffd45c, draw: (t, c, a) => {
    curve(t, 9, 20, 0.15, 0.6, c);
    curve(t, 2.4, 8, 0.25, 0.85, a);
    alongPath(t, 4, 2, (x, y, _ang, f, i) => {
      if (i % 2) polyAt(t, x, y + Math.sin(i * 2.6) * 5, 2.4, 4, i, 0x3a1a0a, 0.35 + f * 0.3);
    });
    headCore(t, a);
  } },
  // 气泡拖尾（深海）：小气泡一路向上冒
  trenchTrailA: { c: 0x5fd0c0, a: 0xffffff, draw: (t, c, a) => {
    curve(t, 1.4, 5, 0.08, 0.3, c);
    alongPath(t, 2, 1, (x, y, _ang, f, i) => {
      const rise = ((t.now / 90 + i * 17) % 16);
      const r = 1.4 + f * 2.6;
      ringAt(t, x + Math.sin(i * 2.2) * 6, y - rise, r, 1, i % 3 ? a : c, (0.5 - rise / 24) * (0.3 + f * 0.7));
    });
    headCore(t, c);
  } },
  // 洋流拖尾：两层海浪叠着往前推
  trenchTrailB: { c: 0x9ffcf0, a: 0x1a2a4a, draw: (t, c, a) => {
    ribbon(t, 8, 1.4, 380, 4.4, c, 0.8);
    ribbon(t, 12, 1, 560, 2.2, a, 0.45);
    alongPath(t, 5, 2, (x, y, ang, f, i) => {
      petalAt(t, x, y, ang + Math.PI, 5, 1.6, c, (0.3 + f * 0.4) * (i % 2 ? 1 : 0.5));
    });
    headCore(t, c);
  } },
  // 疾风拖尾：几道被拉长的风线
  dojoTrailA: { c: 0xf0eee4, a: 0x8a8a92, draw: (t, c, a) => {
    curve(t, 1.4, 4, 0.08, 0.3, a);
    alongPath(t, 4, 1, (x, y, ang, f, i) => {
      const len = 10 + f * 8, off = Math.sin(i * 2.5) * 8;
      const px = x + Math.cos(ang + Math.PI / 2) * off;
      const py = y + Math.sin(ang + Math.PI / 2) * off;
      t.g.lineStyle(1.6, c, (0.25 + f * 0.6) * t.fade);
      t.g.lineBetween(px - Math.cos(ang) * len / 2, py - Math.sin(ang) * len / 2,
        px + Math.cos(ang) * len / 2, py + Math.sin(ang) * len / 2);
    });
    headCore(t, c);
  } },
  // 龙卷拖尾：绕轨迹螺旋上升的气旋
  dojoTrailB: { c: 0xe8404a, a: 0xffd45c, draw: (t, c, a) => {
    curve(t, 2, 7, 0.1, 0.35, a);
    alongPath(t, 2, 1, (x, y, _ang, f, i) => {
      const swirl = t.now / 160 + i * 1.1;
      const r = 4 + f * 8;
      t.g.fillStyle(c, (0.25 + f * 0.55) * t.fade);
      t.g.fillCircle(x + Math.cos(swirl) * r, y + Math.sin(swirl) * r * 0.5, 1.6 + f * 1.6);
    });
    headCore(t, a);
  } },
  // 墨迹拖尾（水墨）：笔锋收尖、末端晕开
  inkwTrailA: { c: 0x2a2e36, a: 0x8a8a92, draw: (t, c, a) => {
    for (let i = 1; i < t.pts.length; i++) {
      const f = i / (t.pts.length - 1);
      t.g.lineStyle(1 + f * f * 12, c, (0.2 + f * 0.75) * t.fade);
      t.g.lineBetween(t.pts[i - 1].x, t.pts[i - 1].y, t.pts[i].x, t.pts[i].y);
    }
    alongPath(t, 6, 2, (x, y, _ang, f) => {
      t.g.fillStyle(c, 0.22 * t.fade);
      t.g.fillCircle(x, y + Math.sin(x) * 6, 2.5 + f * 3);
    });
    headCore(t, a);
  } },
  // 烟雨拖尾：斜斜的雨丝落下来
  inkwTrailB: { c: 0xbfe8e0, a: 0x2a2e36, draw: (t, c, a) => {
    curve(t, 2, 6, 0.06, 0.25, c);
    alongPath(t, 3, 1, (x, y, _ang, f, i) => {
      const fall = ((t.now / 70 + i * 11) % 12);
      t.g.lineStyle(1, a, (0.4 - fall / 30) * (0.3 + f * 0.6) * t.fade);
      t.g.lineBetween(x + Math.sin(i) * 8, y - fall, x + Math.sin(i) * 8 + 1.6, y - fall + 6);
    });
    headCore(t, a);
  } },
  // 花瓣拖尾（精灵）：粉瓣 + 白光点一起飞
  fairyTrailA: { c: 0xffb7d5, a: 0xffffff, draw: (t, c, a) => {
    curve(t, 1.6, 5, 0.08, 0.3, a);
    alongPath(t, 2, 1, (x, y, ang, f, i) => {
      const flip = t.now / 240 + i * 1.4;
      petalAt(t, x, y, ang + Math.sin(flip) * 1.3, 5 + f * 4, 2.4, c, 0.3 + f * 0.6);
    });
    scatter(t, 5, 1.4, a, 10, -3);
    headCore(t, c);
  } },
  // 萤光拖尾：一只只萤火虫在闪
  fairyTrailB: { c: 0xfff2b0, a: 0xffe89a, draw: (t, c, a) => {
    curve(t, 1.2, 4, 0.05, 0.2, a);
    alongPath(t, 3, 1, (x, y, _ang, f, i) => {
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(t.now / 300 + i * 2.4));
      const drift = Math.sin(t.now / 450 + i) * 6;
      t.g.fillStyle(a, 0.18 * tw * t.fade);
      t.g.fillCircle(x, y + drift, 5);
      t.g.fillStyle(c, tw * (0.3 + f * 0.6) * t.fade);
      t.g.fillCircle(x, y + drift, 1.8);
    });
    headCore(t, c);
  } },
  // 轮迹拖尾：双轮压出的两道虚线
  racerTrailA: { c: 0xcfd8e0, a: 0x8a94a2, draw: (t, c, a) => {
    alongPath(t, 3, 1, (x, y, ang, f, i) => {
      const nx = Math.cos(ang + Math.PI / 2), ny = Math.sin(ang + Math.PI / 2);
      for (const s of [-1, 1]) {
        const px = x + nx * 5 * s, py = y + ny * 5 * s;
        t.g.fillStyle(i % 2 ? a : c, (0.25 + f * 0.5) * t.fade);
        t.g.fillCircle(px, py, 1.8 + f);
      }
    });
    headCore(t, a);
  } },
  // 火箭拖尾：锥形尾焰 + 速度线
  racerTrailB: { c: 0xffd45c, a: 0xe83a3a, draw: (t, c, a) => {
    for (let i = 1; i < t.pts.length; i++) {
      const f = i / (t.pts.length - 1);
      t.g.lineStyle(1 + f * 10, a, (0.15 + f * 0.6) * t.fade);
      t.g.lineBetween(t.pts[i - 1].x, t.pts[i - 1].y, t.pts[i].x, t.pts[i].y);
    }
    const head = t.pts[t.pts.length - 1];
    const prev = t.pts[Math.max(0, t.pts.length - 3)];
    const ang = Math.atan2(head.y - prev.y, head.x - prev.x);
    for (let k = 0; k < 3; k++) {
      const len = 26 - k * 7;
      const spread = (k - 1) * 0.4;
      const vs = [
        { x: head.x + Math.cos(ang + Math.PI + spread) * len, y: head.y + Math.sin(ang + Math.PI + spread) * len },
        { x: head.x + Math.cos(ang + spread - 0.5) * 3, y: head.y + Math.sin(ang + spread - 0.5) * 3 },
        { x: head.x + Math.cos(ang + spread + 0.5) * 3, y: head.y + Math.sin(ang + spread + 0.5) * 3 },
      ];
      t.g.fillStyle(k === 0 ? a : c, (0.7 - k * 0.2) * t.fade);
      t.g.fillPoints(vs as never, true, true);
    }
    headCore(t, c);
  } },
  // 蝠影拖尾：小蝙蝠拍着翅膀跟一路
  vampTrailA: { c: 0x4a2a6a, a: 0xc8ccd8, draw: (t, c, a) => {
    curve(t, 1.4, 4, 0.08, 0.25, c);
    alongPath(t, 5, 1, (x, y, _ang, f, i) => {
      const flap = Math.sin(t.now / 130 + i * 2) * 5;
      const vs = [
        { x: x - 8, y: y - 2 + flap }, { x: x - 3, y: y - 4 },
        { x, y }, { x: x + 3, y: y - 4 }, { x: x + 8, y: y - 2 + flap },
        { x: x + 3, y: y + 2 }, { x: x - 3, y: y + 2 },
      ];
      t.g.fillStyle(c, (0.3 + f * 0.6) * t.fade);
      t.g.fillPoints(vs as never, true, true);
      t.g.fillStyle(a, 0.5 * f * t.fade);
      t.g.fillCircle(x - 1.2, y - 1, 0.7);
      t.g.fillCircle(x + 1.2, y - 1, 0.7);
    });
    headCore(t, c);
  } },
  // 血雾拖尾：暗红血雾 + 往下滴的血珠
  vampTrailB: { c: 0xc0203a, a: 0x8a1a2a, draw: (t, c, a) => {
    alongPath(t, 3, 1, (x, y, _ang, f, i) => {
      puffAt(t, x, y, 4 + f * 5, i % 2 ? c : a, 0.2 + f * 0.3);
      const drip = ((t.now / 150 + i * 23) % 20);
      t.g.fillStyle(c, (0.5 - drip / 30) * t.fade);
      t.g.fillCircle(x + Math.sin(i * 3.3) * 5, y + drip, 1.2 + f);
    });
    headCore(t, c);
  } },
  // 落叶拖尾：秋叶打着旋一路落
  autumnTrailA: { c: 0xd4622a, a: 0xffd45c, draw: (t, c, a) => {
    curve(t, 1.4, 4, 0.06, 0.25, a);
    alongPath(t, 3, 1, (x, y, ang, f, i) => {
      const spin = t.now / 250 + i * 1.6;
      const sway = Math.sin(t.now / 380 + i) * 5;
      petalAt(t, x, y + sway, ang + Math.sin(spin) * 1.5, 6 + f * 3.5, 3.2, i % 2 ? c : a, 0.3 + f * 0.6);
    });
    headCore(t, c);
  } },
  // 篝火拖尾：一簇簇小火苗舔着走 + 火星
  autumnTrailB: { c: 0xffd45c, a: 0xd88a2a, draw: (t, c, a) => {
    alongPath(t, 4, 1, (x, y, _ang, f, i) => {
      const flick = Math.sin(t.now / 90 + i * 2.6) * 2.5;
      const vs = [
        { x: x - 3.5, y }, { x, y: y - 9 - flick - f * 3 }, { x: x + 3.5, y },
        { x: x + 1.5, y: y + 2.5 }, { x: x - 1.5, y: y + 2.5 },
      ];
      t.g.fillStyle(i % 2 ? c : a, (0.35 + f * 0.5) * t.fade);
      t.g.fillPoints(vs as never, true, true);
      t.g.fillStyle(0xfff0c0, 0.5 * f * t.fade);
      t.g.fillCircle(x, y - 3, 1.4);
    });
    scatter(t, 5, 1.5, c, 10, 8);
    headCore(t, a);
  } },
  // 竹叶拖尾：细长竹叶一片片飘
  pandaTrailA: { c: 0x8fbf5a, a: 0x4a6a2a, draw: (t, c, a) => {
    curve(t, 1.4, 4, 0.06, 0.25, a);
    alongPath(t, 3, 1, (x, y, ang, f, i) => {
      const sway = Math.sin(t.now / 320 + i * 1.2) * 0.8;
      petalAt(t, x, y, ang + sway, 9 + f * 4, 1.7, i % 2 ? c : a, 0.3 + f * 0.6);
    });
    headCore(t, c);
  } },
  // 清风拖尾：几缕绕圈的微风
  pandaTrailB: { c: 0xdcefff, a: 0xffffff, draw: (t, c, a) => {
    curve(t, 1.4, 4, 0.06, 0.2, a);
    alongPath(t, 4, 1, (x, y, _ang, f, i) => {
      const r = 4 + (i % 3) * 2.5;
      const swirl = t.now / 240 + i * 1.8;
      ringAt(t, x, y, r, 1.1, i % 2 ? c : a, (0.2 + f * 0.5) * 0.8);
      t.g.fillStyle(c, (0.3 + f * 0.5) * t.fade);
      t.g.fillCircle(x + Math.cos(swirl) * r, y + Math.sin(swirl) * r, 1.4);
    });
    headCore(t, a);
  } },
  // 花色拖尾：方块 / 梅花 / 黑桃 / 星四色轮换
  jokerTrailA: { c: 0xff8ad4, a: 0xffd45c, draw: (t, c, _a) => {
    alongPath(t, 4, 1, (x, y, ang, f, i) => {
      const k = i % 4;
      if (k === 0) polyAt(t, x, y, 3 + f * 2, 4, ang + Math.PI / 4, 0xe8404a, 0.4 + f * 0.5);
      else if (k === 1) polyAt(t, x, y, 2.6 + f * 2, 4, ang + Math.PI / 4, 0x1a1a22, 0.4 + f * 0.5);
      else if (k === 2) {
        for (let p = 0; p < 5; p++) {
          const ang2 = (p / 5) * Math.PI * 2;
          t.g.fillStyle(0xe8404a, (0.4 + f * 0.5) * t.fade);
          t.g.fillCircle(x + Math.cos(ang2) * 2, y + Math.sin(ang2) * 2, 1.4 + f);
        }
      } else starAt(t, x, y, 2.8 + f * 2, 0, 0x1a1a22, 0.4 + f * 0.5);
    });
    headCore(t, c);
  } },
  // 洗牌拖尾：一张张小牌翻飞
  jokerTrailB: { c: 0xffd45c, a: 0xffffff, draw: (t, c, a) => {
    curve(t, 1.4, 4, 0.06, 0.22, a);
    alongPath(t, 4, 1, (x, y, ang, f, i) => {
      const tilt = Math.sin(t.now / 200 + i * 2.1) * 0.7;
      const w = 5 + f * 2, h = 7 + f * 3;
      const cos = Math.cos(ang + tilt), sin = Math.sin(ang + tilt);
      const vs = [
        { x: x + (-cos + sin) * w * 0.7, y: y + (-sin - cos) * h * 0.5 },
        { x: x + (cos + sin) * w * 0.7, y: y + (sin - cos) * h * 0.5 },
        { x: x + (cos - sin) * w * 0.7, y: y + (sin + cos) * h * 0.5 },
        { x: x + (-cos - sin) * w * 0.7, y: y + (-sin + cos) * h * 0.5 },
      ];
      t.g.fillStyle(i % 2 ? a : 0xffffff, (0.3 + f * 0.6) * t.fade);
      t.g.fillPoints(vs as never, true, true);
      if (i % 2) starAt(t, x, y, 1.6, t.now / 300, c, (0.4 + f * 0.5) * t.fade, 4);
    });
    headCore(t, c);
  } },
  // 香烟拖尾：一炷烟直直上升、末端打卷
  pagodTrailA: { c: 0xffb03a, a: 0xfff0c0, draw: (t, c, a) => {
    curve(t, 1.6, 5, 0.05, 0.2, c);
    alongPath(t, 2, 1, (x, y, _ang, f, i) => {
      const curl = Math.sin(t.now / 380 + i * 0.9) * (3 + f * 7);
      t.g.fillStyle(a, (0.15 + f * 0.3) * t.fade);
      t.g.fillCircle(x + curl, y, 2 + f * 3.5);
    });
    headCore(t, c);
  } },
  // 金鳞拖尾：一片片金鳞叠着排
  pagodTrailB: { c: 0xffd45c, a: 0x8a2020, draw: (t, c, a) => {
    curve(t, 2, 6, 0.08, 0.3, a);
    alongPath(t, 3, 1, (x, y, ang, f, i) => {
      const bow = Math.sin((i % 2) * Math.PI) * 0.5;
      for (const s of [-1, 1]) {
        const nx = Math.cos(ang + Math.PI / 2) * 4 * s;
        const ny = Math.sin(ang + Math.PI / 2) * 4 * s;
        t.g.lineStyle(1.8, i % 2 ? a : c, (0.3 + f * 0.55) * t.fade);
        t.g.beginPath();
        t.g.arc(x + nx, y + ny, 3.5 + f * 1.5, ang + bow - 1.2, ang + bow + 1.2);
        t.g.strokePath();
      }
    });
    headCore(t, c);
  } },
  // 疾风拖尾：三道被甩出去的风
  stormTrailA: { c: 0xbfe8ff, a: 0xffffff, draw: (t, c, a) => {
    ribbon(t, 9, 1.5, 300, 3.4, c, 0.7);
    ribbon(t, 13, 1.1, 440, 2, a, 0.5);
    ribbon(t, 6, 2.1, 240, 1.4, 0xffffff, 0.65);
    headCore(t, c);
  } },
  // 雷光拖尾：锯齿闪电 + 沿路闪光
  stormTrailB: { c: 0x9fd8ff, a: 0xffffff, draw: (t, c, a) => {
    boltLine(t, 7, 10, 2.2, c, 0.95);
    boltLine(t, 5, 14, 1.1, a, 0.7);
    alongPath(t, 4, 1, (x, y, _ang, f, i) => {
      if ((i + Math.floor(t.now / 160)) % 3 === 0) sparkAt(t, x, y, 3.5, t.now / 100, a, 0.6 * (0.3 + f * 0.7));
    });
    headCore(t, a);
  } },
  // 月尘拖尾：银金色的月尘浮起来
  lunarTrailA: { c: 0xffe89a, a: 0xffffff, draw: (t, c, a) => {
    curve(t, 2, 7, 0.08, 0.3, c);
    alongPath(t, 2, 1, (x, y, _ang, f, i) => {
      const rise = ((t.now / 200 + i * 19) % 14);
      t.g.fillStyle(i % 2 ? a : c, (0.55 - rise / 26) * (0.3 + f * 0.6) * t.fade);
      t.g.fillCircle(x + Math.sin(i * 2.7) * 8, y - rise, 1.2 + f * 1.4);
    });
    headCore(t, c);
  } },
  // 桂香拖尾：细碎的桂花一朵朵
  lunarTrailB: { c: 0xd8e8ff, a: 0xffe89a, draw: (t, c, a) => {
    curve(t, 1.4, 4, 0.06, 0.22, c);
    alongPath(t, 3, 1, (x, y, _ang, f, i) => {
      const sway = Math.sin(t.now / 400 + i) * 4;
      for (let p = 0; p < 4; p++) {
        petalAt(t, x, y + sway, (p / 4) * Math.PI * 2 + t.now / 500 + i, 2.6 + f, 1.1, a, 0.35 + f * 0.5);
      }
      t.g.fillStyle(0xfff0c0, (0.4 + f * 0.4) * t.fade);
      t.g.fillCircle(x, y + sway, 1);
    });
    headCore(t, a);
  } },
  // 雪原拖尾：雪片横着飘
  vikingTrailA: { c: 0xf0f4fa, a: 0x8fb4de, draw: (t, c, a) => {
    curve(t, 2, 6, 0.06, 0.25, a);
    alongPath(t, 2, 1, (x, y, _ang, f, i) => {
      const drift = Math.sin(t.now / 300 + i * 1.4) * 7;
      starAt(t, x + drift, y, 1.4 + f * 1.8, t.now / 600 + i, i % 3 ? c : a, 0.3 + f * 0.6, 6);
    });
    headCore(t, a);
  } },
  // 战火拖尾：火舌 + 黑烟混着一路
  vikingTrailB: { c: 0xff8a3c, a: 0xffd45c, draw: (t, c, a) => {
    alongPath(t, 4, 1, (x, y, _ang, f, i) => {
      const flick = Math.sin(t.now / 80 + i * 2.2) * 3;
      const vs = [
        { x: x - 4, y }, { x: x - 1, y: y - 8 - flick }, { x: x + 1, y: y - 6 - flick * 0.6 },
        { x: x + 4, y }, { x, y: y + 2.5 },
      ];
      t.g.fillStyle(i % 2 ? c : a, (0.35 + f * 0.5) * t.fade);
      t.g.fillPoints(vs as never, true, true);
      if (i % 2) puffAt(t, x, y - 10, 3.5, 0x2a2020, 0.3);
    });
    headCore(t, a);
  } },
  // 草浪拖尾：草叶顺着风向一片片倒
  safariTrailA: { c: 0xd8c8a0, a: 0xc9803a, draw: (t, c, a) => {
    curve(t, 1.4, 4, 0.06, 0.2, a);
    alongPath(t, 3, 1, (x, y, ang, f, i) => {
      const bend = Math.sin(t.now / 350 + i * 1.1) * 0.6;
      petalAt(t, x, y, ang + Math.PI / 2 + bend, 7 + f * 3, 1.4, i % 2 ? 0x8fbf5a : c, 0.3 + f * 0.55);
      petalAt(t, x + 3, y, ang + Math.PI / 2 - bend, 5 + f * 2, 1.1, a, 0.25 + f * 0.45);
    });
    headCore(t, a);
  } },
  // 热风拖尾：扭曲的热浪一层层
  safariTrailB: { c: 0xffb03a, a: 0xfff0c0, draw: (t, c, a) => {
    ribbon(t, 5, 2.6, 200, 2.6, c, 0.5);
    ribbon(t, 8, 2, 280, 1.6, a, 0.4);
    ribbon(t, 3, 3.4, 150, 1.2, 0xffffff, 0.35);
    headCore(t, c);
  } },
  // 彩带拖尾（剧院）：两条抛起又落下的缎带 + 金星
  theatTrailA: { c: 0xff8ad4, a: 0xfff0c0, draw: (t, c, a) => {
    ribbon(t, 11, 1.6, 320, 4, c, 0.8);
    ribbon(t, 15, 1.2, 460, 2.4, a, 0.6);
    alongPath(t, 5, 2, (x, y, _ang, f, i) => {
      starAt(t, x, y + Math.sin(i * 2) * 10, 2, t.now / 300, 0xffd45c, 0.35 + f * 0.5, 4);
    });
    headCore(t, c);
  } },
  // 星光拖尾：聚光灯下的星屑亮起
  theatTrailB: { c: 0xfff0c0, a: 0xffd45c, draw: (t, c, a) => {
    curve(t, 1.6, 5, 0.06, 0.25, a);
    alongPath(t, 3, 1, (x, y, _ang, f, i) => {
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(t.now / 280 + i * 1.9));
      starAt(t, x, y + Math.sin(i * 2.3) * 8, 2 + f * 2.8, t.now / 350 + i, i % 2 ? c : 0xffffff, tw * (0.3 + f * 0.6), 4);
    });
    const head = t.pts[t.pts.length - 1];
    starAt(t, head.x, head.y, 10 + Math.sin(t.now / 180) * 1.5, t.now / 400, c, 0.75);
    headCore(t, a);
  } },
  // 雪尘拖尾：被球带起的雪雾
  boreaTrailA: { c: 0x7dffc4, a: 0xffffff, draw: (t, c, a) => {
    alongPath(t, 3, 1, (x, y, _ang, f, i) => {
      puffAt(t, x, y + Math.sin(i * 1.7) * 3, 3.5 + f * 4.5, i % 2 ? a : c, 0.18 + f * 0.3);
    });
    scatter(t, 6, 1.4, a, 10, 3);
    headCore(t, a);
  } },
  // 光弧拖尾：极光一层层垂下来
  boreaTrailB: { c: 0x9ad4ff, a: 0xeaf6ff, draw: (t, c, a) => {
    ribbon(t, 12, 1, 500, 5, c, 0.55);
    ribbon(t, 18, 0.8, 700, 3, 0x7dffc4, 0.4);
    ribbon(t, 8, 1.5, 380, 1.6, a, 0.6);
    alongPath(t, 5, 2, (x, y, _ang, _f, i) => {
      const drop = ((t.now / 300 + i * 13) % 14);
      t.g.fillStyle(a, (0.5 - drop / 24) * t.fade);
      t.g.fillCircle(x + Math.sin(i * 2.1) * 9, y + drop, 1.1);
    });
    headCore(t, c);
  } },
  // 涟漪拖尾：一圈圈水纹荡开
  venicTrailA: { c: 0x5fe8d0, a: 0xffffff, draw: (t, c, a) => {
    curve(t, 1.4, 4, 0.06, 0.2, c);
    alongPath(t, 4, 1, (x, y, _ang, f, i) => {
      const ex = ((t.now / 220 + i * 29) % 12) / 12;
      ringAt(t, x, y, 2 + ex * 8, 1, i % 2 ? c : a, (1 - ex) * (0.3 + f * 0.5));
    });
    headCore(t, c);
  } },
  // 歌声拖尾：一路浮着的音符
  venicTrailB: { c: 0xffd8a0, a: 0xff9a4a, draw: (t, c, a) => {
    curve(t, 1.4, 4, 0.05, 0.2, a);
    alongPath(t, 4, 1, (x, y, _ang, f, i) => {
      const bob = Math.sin(t.now / 320 + i * 1.6) * 5;
      const col = i % 2 ? c : a;
      t.g.fillStyle(col, (0.35 + f * 0.55) * t.fade);
      t.g.fillCircle(x, y + bob, 2 + f * 1.2);
      t.g.lineStyle(1.2, col, (0.35 + f * 0.55) * t.fade);
      t.g.lineBetween(x + 1.8, y + bob, x + 1.8, y + bob - 8 - f * 2);
      t.g.lineBetween(x + 1.8, y + bob - 8 - f * 2, x + 4.4, y + bob - 6);
    });
    headCore(t, c);
  } },
  // 橄榄拖尾：橄榄枝的叶子一片片
  olympTrailA: { c: 0xf0ead8, a: 0xffd45c, draw: (t, _c, a) => {
    curve(t, 1.4, 4, 0.06, 0.2, a);
    alongPath(t, 3, 1, (x, y, ang, f, i) => {
      const sway = Math.sin(t.now / 340 + i) * 0.5;
      petalAt(t, x, y, ang + Math.PI / 2 + sway, 6.5 + f * 3, 1.8, 0x8aa860, 0.35 + f * 0.55);
      if (i % 2) {
        t.g.fillStyle(a, (0.4 + f * 0.5) * t.fade);
        t.g.fillCircle(x + 4, y - 3, 1.6 + f);
      }
    });
    headCore(t, a);
  } },
  // 圣火拖尾：金白色的圣焰盘旋上升
  olympTrailB: { c: 0xffd45c, a: 0xfff0b0, draw: (t, c, a) => {
    curve(t, 4, 12, 0.1, 0.4, c);
    alongPath(t, 3, 1, (x, y, _ang, _f, i) => {
      const rise = ((t.now / 140 + i * 17) % 16);
      const swirl = t.now / 200 + i;
      const px = x + Math.cos(swirl) * 4, py = y - rise;
      const flick = Math.sin(t.now / 70 + i * 2) * 1.5;
      const vs = [
        { x: px - 2.5, y: py + 2 }, { x: px, y: py - 6 - flick }, { x: px + 2.5, y: py + 2 },
      ];
      t.g.fillStyle(i % 2 ? c : a, (0.55 - rise / 26) * t.fade);
      t.g.fillPoints(vs as never, true, true);
    });
    headCore(t, a);
  } },
  // 彩带拖尾（桑巴）：彩色纸带 + 亮片四溅
  sambaTrailA: { c: 0xff8ad4, a: 0x4ac8ff, draw: (t, c, a) => {
    ribbon(t, 12, 1.4, 300, 3.6, c, 0.8);
    ribbon(t, 16, 1, 440, 2.2, a, 0.6);
    alongPath(t, 4, 1, (x, y, _ang, f, i) => {
      const col = [0xffd45c, 0x8fd45a, 0xffffff][i % 3];
      polyAt(t, x, y + Math.sin(i * 2.4) * 10, 1.6 + f, 4, t.now / 250 + i, col, 0.35 + f * 0.5);
    });
    headCore(t, c);
  } },
  // 焰火拖尾（桑巴）：每隔一段炸开一朵烟花 + 彩屑
  sambaTrailB: { c: 0xffd45c, a: 0xffffff, draw: (t, c, a) => {
    curve(t, 1.4, 5, 0.08, 0.3, a);
    alongPath(t, 5, 3, (x, y, _ang, f, i) => {
      for (let k = 0; k < 8; k++) {
        const ang = (k / 8) * Math.PI * 2 + i;
        sparkAt(t, x + Math.cos(ang) * (4 + f * 5), y + Math.sin(ang) * (4 + f * 5), 2.6, ang,
          [c, a, 0xff8ad4, 0x4ac8ff][k % 4], 0.35 + f * 0.5);
      }
    });
    headCore(t, c);
  } },
};
