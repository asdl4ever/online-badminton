import { type G, type MountArt } from './shared';

/** 第十一批坐骑（SCP 收容 / 恐怖怪物 / 巨兽荒原）——逐款精绘，本地坐标 +x=朝右，f<0 镜像。 */

function faces(g: G, x: number, y: number, f: 1 | -1, fn: () => void): void {
  g.save(); g.translateCanvas(x, y); if (f < 0) g.scaleCanvas(-1, 1); fn(); g.restore();
}

/** 一只带辐条的车轮（收容舱 / 运输类坐骑共用） */
function wheel(g: G, wx: number, wy: number, r: number, spin: number): void {
  g.fillStyle(0x1a1a1a, 0.9); g.fillCircle(wx, wy, r);
  g.fillStyle(0x555555, 1); g.fillCircle(wx, wy, r - 2.5);
  g.fillStyle(0x9a9aa0, 1); g.fillCircle(wx, wy, r - 6);
  g.lineStyle(1.6, 0x3a3a3a, 0.9);
  for (let k = 0; k < 4; k++) { const ang = spin + (k / 4) * Math.PI * 2; g.lineBetween(wx, wy, wx + Math.cos(ang) * (r - 6), wy + Math.sin(ang) * (r - 6)); }
  g.fillStyle(0x6a6a70, 1); g.fillCircle(wx, wy, 2.4);
}

export const MOUNTS_24: Record<string, MountArt> = {
  // ── SCP 收容 ──
  scpPod: { c: 0x8a9a8a, a: 0xffd45c, draw: (g, now, x, y, f, c, a) => {
    // 收容舱：带脚轮与观察窗的运输舱，里面有个模糊人形，警示灯闪
    g.fillStyle(0x0a0f0a, 0.3); g.fillEllipse(x, y + 5, 158, 16);
    faces(g, x, y, f, () => {
      const spin = now / 300;
      wheel(g, -46, 4, 11, spin); wheel(g, 42, 4, 11, spin);
      // 舱体
      g.fillStyle(0x3a4a3a, 1); g.fillRoundedRect(-58, -42, 116, 44, 9);
      g.fillStyle(c, 1); g.fillRoundedRect(-56, -40, 112, 40, 8);
      // 危险条纹
      g.fillStyle(a, 0.9); for (let k = 0; k < 6; k++) g.fillRect(-54 + k * 18, -6, 9, 5);
      // 观察窗 + 里面的人形
      g.fillStyle(0x18241e, 1); g.fillRoundedRect(-34, -34, 54, 20, 5);
      g.fillStyle(0x66807a, 0.55); g.fillRoundedRect(-32, -32, 50, 16, 4);
      g.fillStyle(0x0e1a14, 0.8); g.fillCircle(-8, -26, 4); g.fillRoundedRect(-12, -22, 8, 12, 3);
      // 玻璃反光 + 呼吸光
      g.fillStyle(a, 0.3 + 0.15 * Math.sin(now / 400)); g.fillRoundedRect(-8, -32, 24, 16, 4);
      g.fillStyle(0xffffff, 0.25); g.fillTriangle(-30, -30, -20, -30, -30, -22);
      // 环箍
      g.lineStyle(2, 0x2a3a2a, 0.9); g.strokeRect(-56, -40, 112, 40); g.lineBetween(-20, -40, -20, 0); g.lineBetween(20, -40, 20, 0);
      // 警示灯
      const blink = 0.4 + 0.6 * Math.abs(Math.sin(now / 260));
      g.fillStyle(0xd83a2a, blink); g.fillCircle(50, -44, 4); g.fillStyle(0xff8a6a, blink * 0.5); g.fillCircle(50, -44, 7);
      for (let k = 0; k < 3; k++) { const q = ((now / 900 + k / 3) % 1); g.fillStyle(a, (1 - q) * 0.8); g.fillCircle(-40 + k * 40, -48 - q * 10, 1.8); }
    });
  } },
  keterMass: { c: 0xa03030, a: 0xff5a5a, draw: (g, now, x, y, f, c, a) => {
    // 增殖肉块座驾：一坨不断蠕动、长眼长口的血肉
    g.fillStyle(0x1a0808, 0.35); g.fillEllipse(x, y + 5, 166, 18);
    faces(g, x, y, f, () => {
      const w1 = Math.sin(now / 260) * 3, w2 = Math.sin(now / 260 + 1.5) * 3;
      g.fillStyle(0x601818, 1); g.fillEllipse(-6, -20 + w1 * 0.4, 136, 50);
      g.fillStyle(c, 1); g.fillEllipse(-8, -22 + w2 * 0.3, 126, 44);
      // 瘤块
      for (let k = 0; k < 6; k++) { const ph = now / 500 + k; g.fillStyle(k % 2 ? 0x802020 : c, 1); g.fillCircle(-50 + k * 18, -30 + Math.sin(ph) * 5, 9 + Math.sin(ph) * 1.5); }
      // 高光膜
      g.fillStyle(a, 0.45); g.fillEllipse(-12, -34, 66, 12);
      // 触须
      g.lineStyle(3, 0x701818, 1); for (let k = 0; k < 4; k++) { const bx = -40 + k * 26; g.beginPath(); g.moveTo(bx, -8); g.lineTo(bx + Math.sin(now / 300 + k) * 6, 4); g.strokePath(); }
      // 眼睛 + 口
      for (let k = 0; k < 4; k++) { const ex = -30 + k * 20, ey = -30 + (k % 2) * 12, o = 0.4 + 0.6 * Math.abs(Math.sin(now / 460 + k)); g.fillStyle(0xffe0e0, 1); g.fillEllipse(ex, ey, 6, 5 * o); g.fillStyle(0x201010, 1); g.fillEllipse(ex, ey, 3, 3 * o); }
      g.fillStyle(0x3a0a0a, 1); g.fillEllipse(24, -22, 22, 12); g.fillStyle(0xff5a5a, 0.8); g.fillEllipse(24, -22, 16, 6); g.fillStyle(0xffffff, 0.8); for (let d = 0; d < 5; d++) g.fillTriangle(17 + d * 3, -26, 18 + d * 3, -18, 17.5 + d * 3, -22);
      for (let k = 0; k < 4; k++) { const q = ((now / 800 + k / 4) % 1); g.fillStyle(a, (1 - q) * 0.8); g.fillCircle(-32 + k * 18, -40 - q * 14, 1.6); }
    });
  } },
  shyStride: { c: 0xe8e8e0, a: 0x6a7a8a, draw: (g, now, x, y, f, c, a) => {
    // 长臂座驾：惨白长臂怪四肢撑地、弓身行走，背上可骑
    g.fillStyle(0x101418, 0.28); g.fillEllipse(x, y + 5, 170, 16);
    faces(g, x, y, f, () => {
      const sw = Math.sin(now / 340) * 5;
      // 两条超长前臂撑地
      for (const s of [-1, 1]) { g.lineStyle(10, s < 0 ? 0xb8b8b0 : c, 1); g.beginPath(); g.moveTo(6, -42); g.lineTo(-30, -26); g.lineTo(-44, 4 + s * sw * 0.6); g.strokePath(); g.fillStyle(0xb8b8b0, 1); g.fillCircle(-44, 4 + s * sw * 0.6, 5); for (let c2 = 0; c2 < 3; c2++) g.lineBetween(-46 + c2 * 3, 6 + s * sw * 0.6, -48 + c2 * 3, 12 + s * sw * 0.6); }
      // 弓起的躯干
      g.fillStyle(0xd0d0c8, 1); g.fillEllipse(-6, -40, 92, 40);
      g.fillStyle(c, 1); g.fillEllipse(-8, -42, 84, 32);
      g.fillStyle(0xffffff, 0.25); g.fillEllipse(-14, -52, 44, 12);
      g.lineStyle(1.4, 0xb8b8b0, 0.8); for (let k = 0; k < 3; k++) g.lineBetween(-40, -36 + k * 8, 24, -34 + k * 8);
      // 低垂的头
      g.fillStyle(0xd0d0c8, 1); g.fillEllipse(38, -40, 26, 26); g.fillStyle(c, 1); g.fillEllipse(38, -40, 21, 21);
      g.fillStyle(0x24242a, 1); g.fillEllipse(44, -44, 3, 4); g.fillEllipse(32, -44, 3, 4);
      g.fillStyle(0x3a1818, 1); g.fillEllipse(42, -32, 10, 7);
      // 后爪
      for (const s of [-1, 1]) { g.lineStyle(7, 0xb8b8b0, 1); g.beginPath(); g.moveTo(-24, -20); g.lineTo(-30 + s * 4, 2); g.strokePath(); }
      for (let k = 0; k < 4; k++) { const q = ((now / 700 + k / 4) % 1); g.fillStyle(a, (1 - q) * 0.7); g.fillCircle(-20 + k * 12, -54 - q * 12, 1.6); }
    });
  } },
  rakeCrawl: { c: 0x8a8070, a: 0xd8d0c0, draw: (g, now, x, y, f, c, a) => {
    // 爬行座驾：灰白四足怪贴地爬行，脊背可骑
    g.fillStyle(0x14120e, 0.3); g.fillEllipse(x, y + 5, 168, 18);
    faces(g, x, y, f, () => {
      const ph = Math.sin(now / 280) * 5;
      // 四肢
      for (const [lx, d] of [[-40, 1], [-16, -1], [18, 1], [40, -1]] as Array<[number, number]>) { g.lineStyle(7, 0x564e44, 1); g.beginPath(); g.moveTo(lx, -20); g.lineTo(lx + d * ph, 4); g.strokePath(); g.fillStyle(0xd8d0c0, 1); for (let c2 = 0; c2 < 3; c2++) g.lineBetween(lx + d * ph - 4 + c2 * 3, 4, lx + d * ph - 4 + c2 * 3, 10); }
      // 躯干 + 背脊
      g.fillStyle(0x564e44, 1); g.fillRoundedRect(-52, -34, 100, 30, 12);
      g.fillStyle(c, 1); g.fillRoundedRect(-50, -36, 96, 28, 11);
      g.fillStyle(0xa89e8e, 0.4); g.fillEllipse(-14, -44, 46, 10);
      g.fillStyle(0x564e44, 1); for (let k = 0; k < 6; k++) { const bx = -44 + k * 15; g.fillTriangle(bx - 3, -48, bx + 3, -48, bx, -58); }
      // 长吻头 + 耙齿
      g.fillStyle(0x4a4238, 1); g.fillEllipse(48, -28, 28, 22); g.fillStyle(c, 1); g.fillEllipse(50, -28, 23, 17);
      g.fillStyle(0x32180f, 1); g.fillTriangle(58, -34, 58, -22, 74, -28);
      g.fillStyle(a, 0.95); g.fillCircle(54, -32, 3); g.fillStyle(0x32180f, 1); g.fillCircle(56, -31, 1.4);
      g.lineStyle(2, 0xd8d0c0, 1); for (let k = 0; k < 3; k++) g.lineBetween(60 + k * 3, -22, 62 + k * 3, -15);
      for (let k = 0; k < 3; k++) { const q = ((now / 800 + k / 3) % 1); g.fillStyle(a, (1 - q) * 0.7); g.fillCircle(-30 + k * 26, -60 - q * 10, 1.6); }
    });
  } },
  // ── 巨兽荒原 ──
  wendiElk: { c: 0x9a8060, a: 0xd8e8f0, draw: (g, now, x, y, f, c, a) => {
    // 白骨巨鹿：骨躯巨鹿，分叉鹿角，蹄下结霜
    g.fillStyle(0x181410, 0.3); g.fillEllipse(x, y + 5, 176, 16);
    faces(g, x, y, f, () => {
      const st = Math.sin(now / 300) * 3;
      // 四条骨腿
      for (const lx of [-30, -12, 12, 32]) { g.fillStyle(0xd8d0c0, 1); g.fillRoundedRect(lx - 3, -32, 6, 34, 2); g.fillStyle(0xb8ac96, 1); g.fillRoundedRect(lx - 4, -4, 8, 6, 2); }
      // 骨躯干 + 肋骨
      g.fillStyle(0xc8bca8, 1); g.fillEllipse(-6, -46, 102, 42);
      g.fillStyle(c, 1); g.fillEllipse(-8, -48, 92, 34);
      g.lineStyle(3, a, 0.6); for (let k = 0; k < 5; k++) g.lineBetween(-44, -56 + k * 5, 26, -54 + k * 5);
      g.fillStyle(0xe0d8c0, 0.4); g.fillEllipse(-16, -60, 50, 12);
      // 头颈 + 分叉鹿角
      g.fillStyle(0xd8d0c0, 1); g.beginPath(); g.moveTo(26, -58); g.lineTo(46, -78); g.lineTo(64, -70); g.lineTo(50, -52); g.lineTo(32, -46); g.closePath(); g.fillPath();
      g.fillStyle(0xd8d0c0, 1); g.fillEllipse(62, -68, 22, 16);
      g.fillStyle(0x1a1410, 1); g.fillEllipse(68, -70, 3, 3);
      g.lineStyle(3, 0xc8bca8, 1);
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(56, -78); g.lineTo(50 + s * 6, -96); g.lineTo(40 + s * 20, -104); g.strokePath(); g.lineBetween(50 + s * 6, -96, 50 + s * 14, -92); g.lineBetween(56, -78, 60 + s * 4, -92); }
      g.fillStyle(a, 0.8); g.fillCircle(68, -70, 1.6);
      // 寒气
      for (let k = 0; k < 5; k++) { const q = ((now / 900 + k / 5) % 1); g.fillStyle(a, (1 - q) * 0.6); g.fillCircle(-34 + k * 18, -62 - q * 14, 1.8); }
      void st;
    });
  } },
  mothmWing: { c: 0x7a5a3a, a: 0xff3a3a, draw: (g, now, x, y, f, c, a) => {
    // 巨蛾坐骑：绒身巨蛾，双翅宽展、带眼斑与鳞粉
    g.fillStyle(0x14100a, 0.28); g.fillEllipse(x, y + 6, 158, 14);
    faces(g, x, y, f, () => {
      const flap = Math.abs(Math.sin(now / 220)) * 12;
      for (const s of [-1, 1]) {
        g.fillStyle(s < 0 ? 0x5a4028 : c, 0.95); g.beginPath(); g.moveTo(4, -30); g.lineTo(-66, -46 - flap + s * 2); g.lineTo(-58, -14 + s * 2); g.lineTo(-4, -20); g.closePath(); g.fillPath();
        g.fillStyle(0x8a6a48, 0.6); g.beginPath(); g.moveTo(0, -30); g.lineTo(-52, -40 - flap * 0.7); g.lineTo(-30, -24); g.closePath(); g.fillPath();
        g.fillStyle(a, 0.7); g.fillCircle(-40, -32 - flap * 0.5 + s * 3, 4.5); g.fillStyle(0x3a1010, 0.8); g.fillCircle(-40, -32 - flap * 0.5 + s * 3, 1.8);
      }
      // 绒身
      g.fillStyle(0x4a3520, 1); g.fillEllipse(6, -28, 62, 24);
      g.fillStyle(c, 1); g.fillEllipse(8, -32, 54, 17);
      g.lineStyle(2, 0x4a3520, 0.6); for (let r = 0; r < 4; r++) g.lineBetween(-16, -34 + r * 5, 32, -33 + r * 5);
      g.fillStyle(0x2a1c10, 1); g.fillCircle(24, -34, 4.5); g.fillStyle(a, 0.9); g.fillCircle(25, -35, 2);
      // 触须
      g.lineStyle(2, 0x4a3520, 1); for (const dx of [2, -4]) { g.beginPath(); g.moveTo(28, -42); g.lineTo(40 + dx, -56); g.strokePath(); }
      for (let k = 0; k < 4; k++) { const q = ((now / 1000 + k / 4) % 1); g.fillStyle(a, (1 - q) * 0.7); g.fillCircle(-24 + k * 22, -48 - q * 14, 1.6); }
    });
  } },
  gbeastBack: { c: 0x8a5a3a, a: 0xffb347, draw: (g, now, x, y, f, c, a) => {
    // 巨兽背乘：庞然厚皮巨兽的宽背（供骑乘）
    g.fillStyle(0x180f08, 0.32); g.fillEllipse(x, y + 5, 196, 20);
    faces(g, x, y, f, () => {
      const br = Math.sin(now / 360) * 3;
      // 四柱腿
      for (const lx of [-54, -22, 20, 54]) { g.fillStyle(0x5a3a24, 1); g.fillRoundedRect(lx - 6, -38, 12, 40, 4); g.fillStyle(0x3a2618, 1); g.fillRoundedRect(lx - 7, -2, 14, 7, 3); }
      // 躯干 + 鞍状背
      g.fillStyle(0x6a4428, 1); g.fillEllipse(-6, -44 + br, 156, 58);
      g.fillStyle(c, 1); g.fillEllipse(-8, -48 + br, 146, 48);
      g.fillStyle(0x9a6a3a, 0.35); g.fillEllipse(-14, -62 + br, 90, 16);
      // 背棘
      for (let k = 0; k < 6; k++) { g.fillStyle(0x4a2e1a, 1); g.fillTriangle(-54 + k * 22, -68 + br, -46 + k * 22, -68 + br, -50 + k * 22, -48 + br); }
      // 头 + 眼 + 牙
      g.fillStyle(0x5a3a24, 1); g.fillEllipse(78, -58 + br, 42, 32);
      g.fillStyle(c, 1); g.fillEllipse(76, -60 + br, 36, 26);
      g.fillStyle(a, 0.95); g.fillCircle(88, -62 + br, 3.5); g.fillStyle(0x2a1a10, 1); g.fillCircle(90, -61 + br, 1.6);
      g.fillStyle(0x4a2e1a, 1); g.fillEllipse(90, -46 + br, 14, 9);
      g.fillStyle(0xe0d8c0, 1); for (let k = 0; k < 4; k++) g.fillTriangle(80 + k * 5, -42 + br, 82 + k * 5, -42 + br, 81 + k * 5, -35 + br);
      for (let k = 0; k < 5; k++) { const q = ((now / 900 + k / 5) % 1); g.fillStyle(a, (1 - q) * 0.6); g.fillCircle(-64 + k * 34, -74 - q * 12, 1.8); }
    });
  } },
  crawRide: { c: 0xc8a86a, a: 0x4a2a1a, draw: (g, now, x, y, f, c, a) => {
    // 骨爬坐骑：四足低伏的骨爬巨兽，长尾扫动
    g.fillStyle(0x14100a, 0.32); g.fillEllipse(x, y + 5, 186, 18);
    faces(g, x, y, f, () => {
      const ph = Math.sin(now / 300) * 5;
      // 长尾 + 尾棘
      g.lineStyle(11, 0xb09870, 1); g.beginPath(); g.moveTo(-40, -30); g.lineTo(-70, -26); g.lineTo(-96, -34 + ph); g.strokePath();
      g.lineStyle(6, c, 1); g.beginPath(); g.moveTo(-40, -30); g.lineTo(-70, -26); g.lineTo(-94, -33 + ph); g.strokePath();
      g.fillStyle(0xe0d0b0, 1); for (let k = 0; k < 3; k++) { const tx = -66 - k * 16; g.fillTriangle(tx - 2, -32, tx + 2, -32, tx, -42); }
      // 四足
      for (const lx of [-52, -20, 16, 48]) { g.lineStyle(7, 0xb09870, 1); g.beginPath(); g.moveTo(lx, -18); g.lineTo(lx + (lx < 0 ? -10 : 10) + ph, -2); g.lineTo(lx + (lx < 0 ? -6 : 6), 6); g.strokePath(); g.fillStyle(0xe0d0b0, 1); for (let c2 = 0; c2 < 3; c2++) g.lineBetween(lx + (lx < 0 ? -8 : 8) + c2 * 3, 8, lx + (lx < 0 ? -8 : 8) + c2 * 3, 13); }
      // 躯干 + 背棘
      g.fillStyle(c, 1); g.fillEllipse(-4, -26, 138, 38);
      g.fillStyle(0xe0d0b0, 1); g.fillEllipse(-4, -34, 126, 27);
      g.fillStyle(0x8a6a3a, 1); for (let k = 0; k < 6; k++) { const bx = -50 + k * 16; g.fillTriangle(bx - 3, -46, bx + 3, -46, bx, -58); }
      g.lineStyle(2, a, 0.5); for (let k = 0; k < 4; k++) g.lineBetween(-48, -38 + k * 5, 30, -36 + k * 5);
      // 长吻头骨 + 牙
      g.fillStyle(0xb09870, 1); g.beginPath(); g.moveTo(56, -34); g.lineTo(78, -50); g.lineTo(94, -40); g.lineTo(80, -28); g.lineTo(60, -24); g.closePath(); g.fillPath();
      g.fillStyle(0xe0d0b0, 1); g.fillEllipse(76, -38, 26, 15);
      g.fillStyle(a, 0.95); g.fillCircle(84, -42, 3);
      g.fillStyle(0xffffff, 0.9); for (let k = 0; k < 6; k++) g.fillTriangle(66 + k * 4, -30, 68 + k * 4, -30, 67 + k * 4, -24);
      for (let k = 0; k < 3; k++) { const q = ((now / 800 + k / 3) % 1); g.fillStyle(c, (1 - q) * 0.6); g.fillCircle(-30 + k * 30, -50 - q * 10, 1.6); }
    });
  } },
  mutoDriller: { c: 0x5a6a3a, a: 0x7dff5a, draw: (g, now, x, y, f, c, a) => {
    // 钻地巨虫：分节甲壳身躯前接旋转钻头，绿核脉动
    g.fillStyle(0x0a0e06, 0.35); g.fillEllipse(x, y + 5, 176, 18);
    faces(g, x, y, f, () => {
      const wr = Math.sin(now / 200) * 3;
      // 分节身躯
      g.fillStyle(0x3a4a24, 1); g.fillRoundedRect(-58, -32 + wr, 104, 28, 13);
      g.fillStyle(c, 1); g.fillRoundedRect(-56, -34 + wr, 100, 26, 12);
      for (let k = 0; k < 5; k++) { g.lineStyle(2, 0x2a3418, 0.8); g.strokeCircle(-48 + k * 20, -22 + wr + Math.sin(now / 200 + k) * 2, 10); g.fillStyle(0x6a7a4a, 0.5); g.fillCircle(-48 + k * 20, -24 + wr, 3); }
      // 绿核
      const pulse = 0.5 + 0.5 * Math.sin(now / 240);
      g.fillStyle(a, 0.4 * pulse); g.fillCircle(-18, -30 + wr, 12); g.fillStyle(a, 0.9); g.fillCircle(-18, -30 + wr, 6);
      // 旋转钻头
      g.save(); g.translateCanvas(58, -20 + wr); g.rotateCanvas(now / 90);
      g.fillStyle(0x8a9a5a, 1); g.fillTriangle(-14, -12, -14, 12, 26, 0);
      g.fillStyle(0xd8f0b0, 1); for (let k = 0; k < 4; k++) { const ang = (k / 4) * Math.PI * 2; g.fillTriangle(0, 0, Math.cos(ang) * 20, Math.sin(ang) * 20, Math.cos(ang + 0.6) * 20, Math.sin(ang + 0.6) * 20); }
      g.restore();
      g.fillStyle(a, 0.8); g.fillCircle(40, -20 + wr, 4);
      for (let k = 0; k < 4; k++) { const q = ((now / 700 + k / 4) % 1); g.fillStyle(a, (1 - q) * 0.8); g.fillCircle(52 + k * 4, -38 + q * 12, 1.8); }
    });
  } },
  beheRhino: { c: 0x5a4030, a: 0x8a6a4a, draw: (g, now, x, y, f, c, a) => {
    // 巨兽坐骑：厚皮似犀的庞然巨兽，装甲背板 + 鼻角
    g.fillStyle(0x140e08, 0.34); g.fillEllipse(x, y + 5, 196, 20);
    faces(g, x, y, f, () => {
      const st = Math.sin(now / 320) * 2;
      // 四柱腿
      for (const lx of [-48, -16, 22, 52]) { g.fillStyle(0x3a2818, 1); g.fillRoundedRect(lx - 6, -36, 12, 38, 4); g.fillStyle(0x241810, 1); g.fillRoundedRect(lx - 7, -2, 14, 7, 3); }
      // 躯干 + 装甲背板
      g.fillStyle(0x442e1e, 1); g.fillEllipse(-8, -42 + st, 158, 60);
      g.fillStyle(c, 1); g.fillEllipse(-10, -46 + st, 148, 52);
      g.fillStyle(0x38261a, 1); g.fillEllipse(-30, -58 + st, 76, 26);
      g.fillStyle(0x6a5040, 1); for (let r = 0; r < 2; r++) for (let cc = 0; cc < 4; cc++) g.fillRoundedRect(-58 + cc * 30, -66 + r * 14 + st, 20, 10, 4);
      g.fillStyle(0x9a7a54, 0.25); g.fillEllipse(-20, -62 + st, 96, 12);
      // 头 + 鼻角 + 侧角 + 眼
      g.fillStyle(0x38261a, 1); g.fillRoundedRect(48, -52 + st, 46, 32, 12);
      g.fillStyle(c, 1); g.fillRoundedRect(50, -50 + st, 42, 28, 11);
      g.fillStyle(0x9a7a54, 1); g.fillTriangle(84, -48 + st, 102, -70 + st, 92, -44 + st);
      g.fillStyle(0xc8b088, 0.5); g.fillTriangle(84, -48 + st, 92, -48 + st, 90, -62 + st);
      g.fillStyle(0x9a7a54, 1); g.fillTriangle(56, -52 + st, 48, -58 + st, 58, -44 + st); g.fillTriangle(92, -52 + st, 100, -58 + st, 90, -44 + st);
      g.fillStyle(a, 0.9); g.fillCircle(96, -50 + st, 3); g.fillStyle(0x1a1008, 1); g.fillCircle(98, -49 + st, 1.4);
      g.fillStyle(0xe0d8c0, 1); g.fillTriangle(74, -26 + st, 78, -26 + st, 76, -20 + st); g.fillTriangle(86, -26 + st, 90, -26 + st, 88, -20 + st);
      for (let k = 0; k < 5; k++) { const q = ((now / 900 + k / 5) % 1); g.fillStyle(a, (1 - q) * 0.6); g.fillCircle(-54 + k * 30, -74 - q * 12, 1.8); }
    });
  } },
};
