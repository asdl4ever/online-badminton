import { TAU, type HatArt } from './shared';

/** 批十主题头饰（电竞赛场 / 末日废土 / 星光偶像） */
export const HATS_13: Record<string, HatArt> = {
  esportHatA: { c: 0x1c2430, a: 0x00e5ff, draw: (g, now, x, hy, c, a) => {
    // 战队棒球帽：帽体 + 鸭舌 + 队徽 + 侧标
    g.fillStyle(c, 1); // 帽体
    g.beginPath(); g.arc(x, hy + 1, 13, Math.PI, TAU); g.closePath(); g.fillPath();
    g.fillStyle(0x00e5ff, 0.15);
    g.fillEllipse(x - 3, hy - 4, 10, 6);
    g.fillStyle(0x0e1620, 1); // 鸭舌
    g.fillEllipse(x + f_(), hy + 2, 20, 6);
    g.lineStyle(1, a, 0.7); // 帽檐描边
    g.beginPath(); g.arc(x + f_(), hy + 2, 10, -0.4, Math.PI + 0.4); g.strokePath();
    function f_(): number { return 3; }
    g.fillStyle(a, 0.95); // 队徽（菱形）
    g.fillPoints([{ x: x + 3, y: hy - 8 }, { x: x + 6, y: hy - 4 }, { x: x + 3, y: hy }, { x: x, y: hy - 4 }] as never, true);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(x + 3, hy - 4, 0.9);
    g.lineStyle(1.2, 0x39424e, 0.9); // 帽线
    g.lineBetween(x, hy - 12, x, hy - 2);
    const bl = Math.abs(Math.sin(now / 250)); // 侧标灯
    g.fillStyle(a, bl);
    g.fillCircle(x - 11, hy - 4, 1.2);
  } },
  esportHatB: { c: 0x1c2430, a: 0x00e5ff, draw: (g, now, x, hy, _c, a) => {
    // 冠军耳机：包耳耳机 + 麦克风杆 + RGB 耳罩光环
    g.fillStyle(0x22303e, 1); // 头带
    g.beginPath(); g.arc(x, hy - 2, 13, Math.PI, TAU); g.closePath(); g.fillPath();
    g.lineStyle(2.4, a, 0.9); // 头带描边
    g.beginPath(); g.arc(x, hy - 2, 13, Math.PI * 1.1, Math.PI * 1.9); g.strokePath();
    for (const s of [-1, 1]) { // 双耳罩
      g.fillStyle(0x39424e, 1);
      g.fillRoundedRect(x + s * 11 - 4, hy - 5, 8, 12, 3);
      const gl = 0.5 + 0.5 * Math.sin(now / 240 + s);
      g.fillStyle(s > 0 ? a : 0xff2e88, gl);
      g.fillRoundedRect(x + s * 11 - 2.4, hy - 3.4, 4.8, 8.8, 2);
      g.fillStyle(0xffffff, 0.5);
      g.fillCircle(x + s * 11, hy + 1, 1);
    }
    // 麦克风杆（左耳罩伸出 + 拾音头）
    g.lineStyle(1.6, 0x39424e, 1);
    g.beginPath();
    g.moveTo(x - 11, hy + 7);
    g.lineTo(x - 14, hy + 12);
    g.lineTo(x - 8, hy + 13);
    g.strokePath();
    g.fillStyle(0xff2e88, 0.7 + 0.3 * Math.sin(now / 200)); // 拾音灯
    g.fillCircle(x - 8, hy + 13, 1.6);
    g.fillStyle(0xfff0b0, 0.9); // 头带冠军星
    g.fillCircle(x, hy - 14, 2);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(x - 0.6, hy - 14.6, 0.7);
  } },
  wasteHatA: { c: 0x6a7a5a, a: 0xffe15c, draw: (g, now, x, hy, c, a) => {
    // 防毒面具：军用绿防毒面具——面罩 + 双圆滤罐 + 护目镜片
    g.fillStyle(c, 1); // 面罩主体
    g.fillEllipse(x, hy + 1, 24, 22);
    g.fillStyle(0x5a6a4a, 0.7); // 面罩暗纹
    g.fillEllipse(x - 4, hy + 3, 9, 8);
    for (const s of [-1, 1]) { // 护目镜片（反光圆镜）
      g.fillStyle(0x0e1620, 1);
      g.fillCircle(x + s * 5.4, hy - 3, 4);
      g.fillStyle(0x8fb8d0, 0.6 + 0.3 * Math.sin(now / 350 + s)); // 镜片反光
      g.fillCircle(x + s * 5.4 - 0.8, hy - 3.8, 1.6);
      g.lineStyle(1.2, 0x4a5440, 1); // 镜框
      g.strokeCircle(x + s * 5.4, hy - 3, 4);
    }
    // 滤罐（右下单只大罐）
    g.fillStyle(0x4a5440, 1);
    g.fillEllipse(x + 9, hy + 8, 8, 9);
    g.lineStyle(0.9, 0x3a4434, 0.9); // 滤罐纹
    for (let k = 0; k < 3; k++) g.lineBetween(x + 6, hy + 5 + k * 2.6, x + 12, hy + 5 + k * 2.6);
    g.fillStyle(c, 0.9); // 额带铆钉
    g.fillCircle(x - 9, hy - 8, 1.2);
    g.fillCircle(x + 9, hy - 8, 1.2);
    const gl = 0.3 + 0.3 * Math.sin(now / 400); // 面罩橡胶微光
    g.lineStyle(1, a, gl);
    g.strokeEllipse(x, hy + 1, 24, 22);
  } },
  wasteHatB: { c: 0x8a6a3a, a: 0xff8a3c, draw: (g, now, x, hy, c, a) => {
    // 焊接头盔：翻起的焊接头盔——盔体 + 观察窗焊光 + 顶散热带
    g.fillStyle(c, 1); // 盔体（上翻状态）
    g.fillRoundedRect(x - 12, hy - 12, 24, 16, 4);
    g.fillStyle(0x6a5028, 0.8); // 盔面灼痕
    g.fillEllipse(x + 4, hy - 6, 7, 6);
    g.fillStyle(0x1a1408, 1); // 观察窗（黑玻璃）
    g.fillRect(x - 8, hy - 8, 16, 7);
    const arc = Math.abs(Math.sin(now / 130)); // 窗内焊光闪烁
    g.fillStyle(0x8fd8ff, arc);
    g.fillRect(x - 6.4, hy - 6.6, 12.8, 4.4);
    g.fillStyle(0xffffff, arc * 0.8);
    g.fillRect(x - 2, hy - 5.8, 4, 2.8);
    for (const s of [-1, 1]) { // 侧铆钉
      g.fillStyle(0x4a3818, 1);
      g.fillCircle(x + s * 10, hy - 3, 1.2);
    }
    g.fillStyle(0x6a5028, 0.9); // 顶散热带
    for (let k = -1; k <= 1; k++) g.fillRect(x + k * 4 - 1, hy - 15, 2, 4);
    // 盔下阴影（脸在盔影里）
    g.fillStyle(0x1a1408, 0.6);
    g.fillRect(x - 10, hy + 4, 20, 4);
    g.fillStyle(a, 0.5 + 0.3 * Math.sin(now / 260)); // 盔顶警示灯
    g.fillCircle(x, hy - 16, 1.4);
  } },
  idolHatA: { c: 0xff9adf, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
    // 应援发箍：应援色发箍 + 蝴蝶结双饰 + 小星
    g.fillStyle(c, 1); // 箍体
    g.fillRect(x - 15, hy + 1, 30, 4);
    for (const s of [-1, 1]) { // 蝴蝶结（左右各一，扇翅微动）
      const flap = Math.sin(now / 260 + (s > 0 ? 0 : 1)) * 0.2;
      g.save();
      g.translateCanvas(x + s * 10, hy - 1);
      g.rotateCanvas(s * flap);
      g.fillStyle(c, 0.95);
      g.fillEllipse(-4, 0, 6, 4);
      g.fillEllipse(4, 0, 6, 4);
      g.fillStyle(a, 0.95);
      g.fillCircle(0, 0, 1.8);
      g.restore();
    }
    for (let k = 0; k < 3; k++) { // 箍上小星
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 240 + k * 2));
      g.fillStyle(0xfff0b0, tw);
      g.fillCircle(x - 4 + k * 4, hy + 3, 1);
    }
  } },
  idolHatB: { c: 0xffd45c, a: 0xff5a8a, draw: (g, now, x, hy, c, a) => {
    // 偶像皇冠：偶像小皇冠——三拱冠 + 宝石 + 侧羽毛 + 珠链垂
    g.fillStyle(c, 1); // 冠环
    g.fillRect(x - 11, hy - 3, 22, 7);
    for (let k = -1; k <= 1; k++) { // 三拱冠峰
      g.fillStyle(0xfff0b0, 0.95);
      g.beginPath();
      g.arc(x + k * 7.4, hy - 3, 3, Math.PI, TAU);
      g.closePath(); g.fillPath();
      g.fillStyle(k === 0 ? a : 0x5ac8ff, 0.95);
      g.fillCircle(x + k * 7.4, hy - 5, 1.4);
      g.fillStyle(0xffffff, 0.7);
      g.fillCircle(x + k * 7.4 - 0.4, hy - 5.4, 0.5);
    }
    for (const s of [-1, 1]) { // 侧羽毛（粉羽摇曳）
      const sway = Math.sin(now / 320 + (s > 0 ? 0 : 1.2)) * 2;
      g.fillStyle(s > 0 ? c : 0xffb0c8, 0.95);
      g.fillEllipse(x + s * 12 + sway * 0.4, hy - 10, 3, 8);
      g.lineStyle(0.8, 0xfff0b0, 0.8);
      g.lineBetween(x + s * 12, hy - 4, x + s * 12 + sway, hy - 13);
    }
    g.fillStyle(a, 0.9); // 冠心粉宝
    g.fillCircle(x, hy + 0.6, 2);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(x - 0.6, hy, 0.7);
    // 珠链垂（三珠轻摆）
    for (let k = 0; k < 3; k++) {
      const sway = Math.sin(now / 300 + k) * 1.2;
      g.fillStyle(0xfff6d8, 0.9);
      g.fillCircle(x - 6 + k * 6 + sway, hy + 7, 1.2);
    }
  } },
};
