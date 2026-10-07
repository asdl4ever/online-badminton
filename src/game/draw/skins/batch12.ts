import { groundShadow, type SkinPainter } from './shared';
import { PLAYER_H } from '../../constants';
import type Phaser from 'phaser';
type G = Phaser.GameObjects.Graphics;

/** 批十二 5★ 皮肤：相位变形者（机甲）/ 蛛网游侠 / 钢铁巨兽 */

/** 共享：装甲板（带描边、铆钉、分块高光） */
function plate(g: G, x: number, y: number, w: number, h: number, c: number, hi: number, a = 1): void {
  g.fillStyle(0x10141c, 0.95 * a);
  g.fillRoundedRect(x - w / 2 - 1.2, y - h / 2 - 1.2, w + 2.4, h + 2.4, 3.4);
  g.fillStyle(c, a);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 3);
  g.fillStyle(hi, 0.5 * a);
  g.fillRoundedRect(x - w / 2 + 1.4, y - h / 2 + 1.4, w * 0.42, h * 0.34, 2);
}
/** 共享：铆钉行 */
function rivets(g: G, x: number, y: number, n: number, step: number, c = 0x9aa4b2): void {
  g.fillStyle(c, 0.9);
  for (let k = 0; k < n; k++) g.fillCircle(x + k * step, y, 0.9);
}

/** 相位变形者：银蓝装甲人形——驾驶舱胸口火种脉动、面甲扫描、肩甲分块、腿部推进器喷焰、甲板错位相位残影 */
export const tfSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, feetY, move } = pose;
  const topY = feetY - PLAYER_H;
  const armor = 0x3a4c63, armorD = 0x25313f, silver = 0x9aa4b2, energy = 0x5ac8ff, hot = 0xff8a2a;
  groundShadow(g, pose, 56);
  const step = Math.sin(now / 260) * (move ?? 0);
  const breathe = Math.sin(now / 500) * 1.2;

  // 相位残影（甲板轻微错位的半透明重影）
  g.fillStyle(energy, 0.12);
  g.fillRoundedRect(x - 15, topY + 26 + breathe, 30, 26, 8);
  g.fillRoundedRect(x - 17, topY + 12 + breathe, 34, 14, 6);

  // 腿（机械分节 + 推进器喷焰）
  for (const s of [-1, 1]) {
    const sw = step * s * 3;
    plate(g, x + s * 8 + sw * 0.4, topY + 66, 13, 20, armorD, silver); // 大腿
    plate(g, x + s * 8 + sw, topY + 84, 11, 18, armor, silver); // 小腿
    g.fillStyle(silver, 0.9); // 膝关节盘
    g.fillCircle(x + s * 8 + sw * 0.7, topY + 76, 4);
    g.fillStyle(energy, 0.7);
    g.fillCircle(x + s * 8 + sw * 0.7, topY + 76, 1.6);
    g.fillStyle(0x1a2028, 1); // 脚
    g.fillRoundedRect(x + s * 8 + sw - 6, feetY - 6, 14, 6, 2.4);
    g.fillStyle(silver, 0.8); // 脚尖甲
    g.fillRect(x + s * 8 + sw - 6, feetY - 6, 5, 2);
    // 小腿侧推进器 + 喷焰
    g.fillStyle(0x2a3644, 1);
    g.fillRoundedRect(x + s * 14 + sw - 2, topY + 78, 4, 12, 2);
    const fl = 0.7 + 0.3 * Math.sin(now / 110 + s);
    for (let k = 0; k < 3; k++) {
      g.fillStyle(k === 0 ? 0xffffff : k === 1 ? energy : hot, (0.75 - k * 0.2) * fl);
      g.fillEllipse(x + s * 16 + sw, topY + 92 + k * 3, 5 - k, 3 - k * 0.5);
    }
  }

  // 躯干（胸甲 + 腹部装甲带）
  plate(g, x, topY + 44 + breathe, 28, 24, armor, silver);
  for (let k = 0; k < 3; k++) { // 腹甲分节
    plate(g, x, topY + 58 + k * 5 + breathe, 22 - k * 2, 4.4, armorD, silver, 0.95);
  }
  rivets(g, x - 11, topY + 36 + breathe, 5, 5.5, silver);
  // 驾驶舱火种（脉动 + 光溢出）
  const pulse = 0.65 + 0.35 * Math.sin(now / 340);
  for (let k = 2; k >= 0; k--) {
    g.fillStyle(hot, 0.16 * pulse * (1 - k * 0.3));
    g.fillCircle(x, topY + 42 + breathe, 6 + k * 4);
  }
  g.fillStyle(0x1a2028, 1);
  g.fillRoundedRect(x - 7, topY + 36 + breathe, 14, 12, 3);
  g.fillStyle(hot, pulse);
  g.fillRoundedRect(x - 5, topY + 38 + breathe, 10, 8, 2);
  g.fillStyle(0xffe89a, pulse * 0.9);
  g.fillCircle(x, topY + 42 + breathe, 2.4);

  // 肩甲（大块斜置，带散热缝）
  for (const s of [-1, 1]) {
    g.save();
    g.translateCanvas(x + s * 19, topY + 32 + breathe);
    g.rotateCanvas(s * 0.22);
    g.fillStyle(0x10141c, 0.95);
    g.fillRoundedRect(-9, -9, 18, 18, 4);
    g.fillStyle(armor, 1);
    g.fillRoundedRect(-8, -8, 16, 16, 3.4);
    g.fillStyle(silver, 0.45);
    g.fillRoundedRect(-6.4, -6.4, 7, 6, 2);
    g.fillStyle(energy, 0.7); // 散热缝
    for (let k = 0; k < 3; k++) g.fillRect(-5 + k * 3.4, 2, 1.6, 5);
    g.restore();
    rivets(g, x + s * 14, topY + 24 + breathe, 3, 4);
  }

  // 双臂（前臂较粗，手部为机械爪）
  for (const s of [-1, 1]) {
    const armSw = Math.sin(now / 300 + (s > 0 ? 0 : 0.8)) * (2 + (move ?? 0) * 3);
    g.fillStyle(armorD, 1);
    g.lineStyle(6.4, armorD, 1);
    g.lineBetween(x + s * 17, topY + 40 + breathe, x + s * 21 + armSw, topY + 54);
    g.lineStyle(3.6, armor, 1);
    g.lineBetween(x + s * 17, topY + 40 + breathe, x + s * 21 + armSw, topY + 54);
    plate(g, x + s * 22 + armSw, topY + 60, 9, 14, armor, silver);
    g.fillStyle(silver, 1); // 机械爪
    for (let k = -1; k <= 1; k++) {
      g.fillRoundedRect(x + s * 22 + armSw + k * 2.6 - 1.2, topY + 68, 2.4, 5, 1);
    }
  }

  // 头（头盔 + 扫描面甲 + 侧甲）
  const hy = topY + 16 + breathe;
  g.fillStyle(0x10141c, 0.95);
  g.beginPath(); g.arc(x, hy, 13.6, Math.PI, Math.PI * 2); g.closePath(); g.fillPath();
  g.fillStyle(armor, 1);
  g.beginPath(); g.arc(x, hy, 12.6, Math.PI, Math.PI * 2); g.closePath(); g.fillPath();
  g.fillStyle(silver, 0.4);
  g.fillEllipse(x - 4, hy - 6, 9, 4);
  g.fillStyle(0x0c1016, 1); // 面甲
  g.fillRoundedRect(x - 10, hy - 5, 20, 9, 3);
  const scan = (now / 1000) % 1; // 扫描线
  const sx = x - 8 + scan * 16;
  g.fillStyle(energy, 0.35);
  g.fillRect(sx - 2.4, hy - 5, 4.8, 9);
  g.fillStyle(0xffffff, 0.5);
  g.fillRect(sx - 0.7, hy - 5, 1.4, 9);
  for (let k = 0; k < 5; k++) { // 面甲刻度
    g.fillStyle(k / 5 < scan ? energy : 0x24384a, k / 5 < scan ? 0.9 : 0.6);
    g.fillRect(x - 9 + k * 4.4, hy + 1, 2, 3);
  }
  for (const s of [-1, 1]) { // 侧甲 + 天线
    g.fillStyle(armorD, 1);
    g.fillPoints([{ x: x + s * 12, y: hy + 1 }, { x: x + s * 15, y: hy - 6 }, { x: x + s * 12, y: hy - 11 }, { x: x + s * 10, y: hy - 3 }] as never, true);
    g.fillStyle(silver, 0.85);
    g.fillCircle(x + s * 12.2, hy - 4, 0.9);
  }
  g.fillStyle(silver, 1); // 头顶天线
  g.fillRect(x - 0.9, hy - 19, 1.8, 8);
  g.fillStyle(energy, 0.9);
  g.fillCircle(x, hy - 20, 1.6);
  // 通讯灯
  g.fillStyle(Math.sin(now / 260) > 0 ? hot : 0x4a2a12, 0.95);
  g.fillCircle(x + 6, hy - 9, 1.3);
};

/** 蛛网游侠：红蓝战衣人形——蛛网纹身、白色大眼片、胸口蛛徽、腕部蛛丝飘带、蓄力下蹲 */
export const spdSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY, move } = pose;
  const topY = feetY - PLAYER_H;
  const red = 0xc8323c, redL = 0xe04a54, blue = 0x24386a, blueL = 0x35508c, white = 0xf0f4f8;
  groundShadow(g, pose, 48);
  const step = Math.sin(now / 250) * (move ?? 0);
  const crouch = 2 + Math.sin(now / 520) * 1.4; // 微微压低的重心

  // 腿（蓝色 + 蛛丝纹）
  for (const s of [-1, 1]) {
    const sw = step * s * 3;
    g.fillStyle(blue, 1);
    g.fillRoundedRect(x + s * 7 + sw * 0.4 - 4, topY + 58, 8.4, 18, 3);
    g.fillStyle(blueL, 0.6);
    g.fillRoundedRect(x + s * 7 + sw * 0.4 - 3, topY + 59, 4, 14, 2);
    g.fillStyle(red, 1); // 小红靴
    g.fillRoundedRect(x + s * 7 + sw * 0.4 - 4, topY + 74, 8.4, 6, 2.4);
    g.fillStyle(redL, 0.6);
    g.fillRect(x + s * 7 + sw * 0.4 - 4, topY + 74, 8.4, 1.6);
    g.fillStyle(blue, 1); // 小腿
    g.fillRoundedRect(x + s * 7 + sw - 3.6, topY + 76, 7.6, feetY - topY - 78, 3);
    g.fillStyle(0x1a2848, 1); // 靴底
    g.fillRoundedRect(x + s * 7 + sw - 4.4, feetY - 4, 9.6, 4, 1.6);
  }

  // 躯干（红胸 + 蓝腹，蛛网暗纹）
  g.fillStyle(red, 1);
  g.fillRoundedRect(x - 14, topY + 26 + crouch, 28, 26, 6);
  g.fillStyle(redL, 0.55);
  g.fillRoundedRect(x - 12, topY + 28 + crouch, 9, 20, 4);
  g.fillStyle(blue, 1);
  g.fillRoundedRect(x - 12, topY + 48 + crouch, 24, 12, 4);
  g.lineStyle(0.9, 0x8a1018, 0.75); // 战衣蛛网纹（胸背）
  for (let k = -1; k <= 1; k++) {
    g.beginPath(); g.arc(x, topY + 38 + crouch, 12, Math.PI + k * 0.35, Math.PI * 1.4 + k * 0.35); g.strokePath();
  }
  for (let k = 0; k < 4; k++) {
    g.lineBetween(x, topY + 38 + crouch, x - 12 + k * 8, topY + 26 + crouch);
  }
  // 胸口蛛徽（黑色蜘蛛剪影）
  g.fillStyle(0x14161c, 0.95);
  g.fillEllipse(x, topY + 36 + crouch, 4.4, 6);
  g.fillEllipse(x, topY + 41 + crouch, 3, 3.4);
  g.lineStyle(1.1, 0x14161c, 0.95);
  for (let k = 0; k < 4; k++) {
    const ang = -0.9 + k * 0.62;
    g.lineBetween(x, topY + 37 + crouch, x + Math.cos(ang) * 8, topY + 37 + crouch + Math.sin(ang) * 7);
    g.lineBetween(x, topY + 37 + crouch, x - Math.cos(ang) * 8, topY + 37 + crouch + Math.sin(ang) * 7);
  }

  // 手臂（红上臂 + 蓝前臂 + 腕部蛛丝发射器 + 飘带）
  for (const s of [-1, 1]) {
    const sw = Math.sin(now / 300 + (s > 0 ? 0 : 0.9)) * (2 + (move ?? 0) * 3);
    g.lineStyle(6.4, red, 1);
    g.lineBetween(x + s * 13, topY + 30 + crouch, x + s * 17 + sw, topY + 44 + crouch);
    g.lineStyle(5.4, blue, 1);
    g.lineBetween(x + s * 17 + sw, topY + 44 + crouch, x + s * 19 + sw, topY + 58 + crouch);
    g.fillStyle(0x2a3a5a, 1); // 腕部发射器
    g.fillRoundedRect(x + s * 19 + sw - 3.4, topY + 52 + crouch, 6.8, 7, 2);
    g.fillStyle(0x8ae0ff, 0.8);
    g.fillRect(x + s * 19 + sw - 2, topY + 54 + crouch, 4, 1.4);
    // 拉出的蛛丝飘带
    const wv = Math.sin(now / 380 + s * 1.4) * 5;
    g.lineStyle(1.2, white, 0.5);
    g.beginPath();
    g.moveTo(x + s * 19 + sw, topY + 58 + crouch);
    g.lineTo(x + s * (24 + wv * 0.4), topY + 66 + crouch);
    g.lineTo(x + s * (28 + wv), topY + 74 + crouch);
    g.strokePath();
    // 手（握拳）
    g.fillStyle(red, 1);
    g.fillCircle(x + s * 19 + sw, topY + 60 + crouch, 3.2);
  }

  // 头（红面罩 + 大白眼片 + 网纹）
  const hy = topY + 18 + crouch;
  g.fillStyle(0x8a1018, 0.9);
  g.beginPath(); g.arc(x, hy, 12.6, Math.PI, Math.PI * 2); g.closePath(); g.fillPath();
  g.fillStyle(red, 1);
  g.beginPath(); g.arc(x, hy, 11.6, Math.PI, Math.PI * 2); g.closePath(); g.fillPath();
  g.fillStyle(redL, 0.5);
  g.fillEllipse(x - 3.4, hy - 5, 8, 3.4);
  g.lineStyle(0.9, 0x8a1018, 0.7); // 头罩网纹
  for (let k = -1; k <= 1; k++) {
    g.beginPath(); g.arc(x, hy + 1, 11, Math.PI + k * 0.4, Math.PI * 1.4 + k * 0.4); g.strokePath();
  }
  // 白色大眼片（眯眼/睁眼呼吸）
  const squint = 0.88 + 0.12 * Math.sin(now / 900);
  for (const s of [-1, 1]) {
    g.fillStyle(white, 0.98);
    g.fillPoints([
      { x: x + s * 1.5, y: hy - 4 },
      { x: x + s * 11, y: hy - 6.4 * squint },
      { x: x + s * 10, y: hy + 1.4 * squint },
      { x: x + s * 2.4, y: hy + 0.6 },
    ] as never, true);
    g.fillStyle(0x8aa0b8, 0.32);
    g.fillPoints([
      { x: x + s * 3.4, y: hy - 2.6 }, { x: x + s * 9, y: hy - 4.4 }, { x: x + s * 8.4, y: hy }, { x: x + s * 3.6, y: hy - 0.4 },
    ] as never, true);
  }
  g.lineStyle(1, 0x6a121a, 0.8); // 中缝
  g.lineBetween(x, hy - 9, x, hy - 3);
  // 蛛感微光（眼片前一闪）
  const sense = Math.abs(Math.sin(now / 700));
  if (sense > 0.75) {
    g.fillStyle(0xffffff, (sense - 0.75) * 2);
    g.fillCircle(x + f * 9, hy - 4, 1.2);
  }
  // 肩上的蛛丝吊索（摆动的丝）
  for (const s of [-1, 1]) {
    const wv = Math.sin(now / 460 + s) * 4;
    g.lineStyle(1, white, 0.4);
    g.beginPath();
    g.moveTo(x + s * 12, topY + 26 + crouch);
    g.lineTo(x + s * (16 + wv * 0.4), topY + 34 + crouch);
    g.strokePath();
  }
};

/** 钢铁巨兽：四足装甲兽形——熔炉胸腔、排气筒蒸汽、铆接甲板、液压四肢、尾部火焰 */
export const bstSpirit: SkinPainter = (g: G, now, pose) => {
  const { x, facing: f, feetY } = pose;
  const iron = 0x4a4a52, ironD = 0x2a2a30, plate2 = 0x5c5c64, rust = 0x6a4a32, hot = 0xff6a2a;
  groundShadow(g, pose, 60);
  const gallop = Math.abs(Math.sin(now / 280)) * ((pose.move ?? 0) * 2 + 1.2);
  const bodyY = feetY - 34 - gallop * 0.6;

  // 尾部（液压分节 + 尾焰）
  const tw = Math.sin(now / 440);
  let tx = x - f * 24, ty = bodyY - 6;
  for (let k = 0; k < 4; k++) {
    const nx = tx - f * 8, ny = ty - 6 + tw * (k + 1) * 1.2;
    g.lineStyle(4.4, ironD, 1);
    g.lineBetween(tx, ty, nx, ny);
    g.fillStyle(k % 2 ? iron : plate2, 1);
    g.fillRoundedRect(nx - 3.4, ny - 3.4, 6.8, 6.8, 2.4);
    g.fillStyle(0x9a9490, 0.8);
    g.fillCircle(nx, ny, 1);
    tx = nx; ty = ny;
  }
  const flTail = 0.6 + 0.4 * Math.sin(now / 140);
  for (let k = 0; k < 3; k++) {
    g.fillStyle(k === 0 ? 0xffffff : k === 1 ? 0xffd45c : hot, (0.8 - k * 0.24) * flTail);
    g.fillCircle(tx - f * (3 + k * 3), ty - k * 1.4, 4 - k * 1.1);
  }

  // 四肢（活塞腿 + 蹄铁）
  for (const [lx, ph] of [[-18, 0], [-8, Math.PI], [12, Math.PI], [22, 0]] as Array<[number, number]>) {
    const stp = Math.sin(now / 250 + ph) * ((pose.move ?? 0) * 3 + 1);
    g.fillStyle(ironD, 0.98);
    g.fillRoundedRect(x + lx * f - 5 + stp * 0.4, bodyY + 8, 10, feetY - bodyY - 12, 3.4);
    g.fillStyle(plate2, 0.95); // 甲板
    g.fillRoundedRect(x + lx * f - 4 + stp * 0.4, bodyY + 10, 8, 12, 3);
    g.fillStyle(0x9a9490, 1); // 液压杆
    g.fillRect(x + lx * f - 1.4 + stp * 0.4, bodyY + 12, 2.8, 14);
    g.fillStyle(0x1a1a20, 1); // 蹄铁
    g.fillRoundedRect(x + lx * f - 6 + stp, feetY - 6, 12, 6, 2.4);
    g.fillStyle(0x9a9490, 0.75);
    g.fillRect(x + lx * f - 5 + stp, feetY - 5, 10, 1.4);
    rivets(g, x + lx * f - 4 + stp, feetY - 3.4, 4, 2.8, 0x8a8a92);
  }

  // 躯干（多层甲板 + 铆钉 + 锈迹）
  g.fillStyle(0x10141a, 0.95);
  g.fillRoundedRect(x - 30, bodyY - 14, 60, 30, 8);
  g.fillStyle(iron, 1);
  g.fillRoundedRect(x - 28, bodyY - 12, 56, 26, 7);
  g.fillStyle(plate2, 0.85); // 背甲高光板
  g.fillRoundedRect(x - 22, bodyY - 11, 40, 10, 5);
  g.fillStyle(rust, 0.35); // 锈斑
  g.fillEllipse(x - 18, bodyY + 6, 12, 7);
  g.fillEllipse(x + 14, bodyY - 6, 9, 6);
  rivets(g, x - 24, bodyY + 10, 10, 5.4, 0x9a9490);
  rivets(g, x - 24, bodyY - 9, 10, 5.4, 0x9a9490);
  // 甲板接缝光（受熔炉映照）
  g.lineStyle(1, hot, 0.25 + 0.15 * Math.sin(now / 400));
  g.lineBetween(x - 26, bodyY - 1, x + 26, bodyY - 1);

  // 胸腔熔炉（脉动 + 光溢出 + 栅栏）
  const heat = 0.6 + 0.4 * Math.sin(now / 320);
  for (let k = 3; k >= 0; k--) {
    g.fillStyle(hot, 0.15 * heat * (1 - k * 0.2));
    g.fillCircle(x + 18 * f, bodyY + 2, 8 + k * 5);
  }
  g.fillStyle(0x1a1a20, 1);
  g.fillRoundedRect(x + 18 * f - 8, bodyY - 5, 16, 14, 4);
  for (let k = 0; k < 4; k++) { // 炉栅
    g.fillStyle(iron, 1);
    g.fillRect(x + 18 * f - 7 + k * 4, bodyY - 4, 2, 12);
  }
  g.fillStyle(0xffd45c, heat);
  g.fillRoundedRect(x + 18 * f - 6, bodyY - 3, 12, 10, 3);
  g.fillStyle(0xffffff, heat * 0.85);
  g.fillCircle(x + 18 * f, bodyY + 2, 2.4);

  // 头（兽首 + 双钢角 + 熔光眼 + 铁颚）
  const hy = bodyY - 18 - gallop * 0.2;
  const hx = x + 30 * f;
  g.fillStyle(0x10141a, 0.95);
  g.fillRoundedRect(hx - 14, hy - 8, 28, 20, 6);
  g.fillStyle(iron, 1);
  g.fillRoundedRect(hx - 12, hy - 7, 24, 18, 5);
  g.fillStyle(plate2, 0.85); // 颅顶高光
  g.fillRoundedRect(hx - 9, hy - 6, 14, 8, 4);
  for (const s of [-1, 1]) { // 双钢角（分层 + 环纹）
    g.fillStyle(0x9a9490, 1);
    g.fillPoints([
      { x: hx + s * 7, y: hy - 4 }, { x: hx + s * 16 + f * 3, y: hy - 16 }, { x: hx + s * 18 + f * 3, y: hy - 9 }, { x: hx + s * 10, y: hy - 1 },
    ] as never, true);
    g.fillStyle(0xc9c4bc, 0.65);
    g.fillPoints([
      { x: hx + s * 9, y: hy - 4 }, { x: hx + s * 15 + f * 3, y: hy - 13 }, { x: hx + s * 16 + f * 3, y: hy - 9 }, { x: hx + s * 10, y: hy - 2 },
    ] as never, true);
    g.lineStyle(1, 0x6a6a72, 0.85);
    g.lineBetween(hx + s * 11, hy - 6, hx + s * 14 + f * 3, hy - 11);
  }
  // 熔光眼（脉动）
  const eye = 0.65 + 0.35 * Math.sin(now / 260);
  for (const s of [-1, 1]) {
    g.fillStyle(0x1a1a20, 1);
    g.fillEllipse(hx + s * 5 + f * 4, hy + 1, 7, 5);
    g.fillStyle(hot, eye);
    g.fillEllipse(hx + s * 5 + f * 4, hy + 1, 4.6, 3);
    g.fillStyle(0xfff0b0, eye);
    g.fillCircle(hx + s * 5 + f * 4, hy + 1, 1.1);
  }
  // 铁颚（咬合微动） + 牙
  const bite = Math.sin(now / 500) * 1.2;
  g.fillStyle(ironD, 1);
  g.fillRoundedRect(hx + f * 6 - 2, hy + 7 + bite, 14, 6, 3);
  g.fillStyle(0xd8d4c8, 0.96);
  for (let k = 0; k < 4; k++) {
    g.fillTriangle(hx + f * (7 + k * 3.4), hy + 7 + bite, hx + f * (9.4 + k * 3.4), hy + 7 + bite, hx + f * (8.2 + k * 3.4), hy + 11 + bite);
  }
  // 排气筒（背后两管喷蒸汽）
  for (let k = 0; k < 2; k++) {
    g.fillStyle(0x8a8a92, 1);
    g.fillRoundedRect(x + (-6 + k * 12) * f - 3, bodyY - 26, 6, 14, 2.4);
    g.fillStyle(0x2a2a30, 1);
    g.fillEllipse(x + (-6 + k * 12) * f, bodyY - 26, 6, 2.4);
    const ph = ((now / 1000 + k / 2) % 1);
    g.fillStyle(0xd8d8d0, 0.22 * (1 - ph));
    g.fillCircle(x + (-6 + k * 12) * f + Math.sin(ph * 6) * 2, bodyY - 26 - ph * 16, 3 + ph * 5);
  }
  // 地面熔渣痕
  g.fillStyle(hot, 0.14 + 0.08 * Math.sin(now / 400));
  g.fillEllipse(x, feetY - 1, 62, 8);
};
