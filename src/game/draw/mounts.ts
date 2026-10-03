import Phaser from 'phaser';
import { MOUNT_COLORS, type MountId } from '../cosmetics';
import type { CharacterPose } from './character';
import { THEME_MOUNTS, drawThemeMount } from './themeart';

/**
 * 坐骑绘制：**纯装饰**，画在角色脚下、跟着他跑和跳。
 *
 * 它不参与任何物理（不改移动速度、不改判定半径），所以联机时两边各画各的就行，
 * 轨迹不会因为这个分叉。所有坐骑都以 `pose.feetY` 为基准往上/往下画一点点。
 */
export function drawMount(
  g: Phaser.GameObjects.Graphics,
  now: number,
  id: MountId,
  pose: CharacterPose,
): void {
  if (id === 'none') return;
  const x = pose.x;
  const y = pose.feetY;
  const f = pose.facing;
  const color = MOUNT_COLORS[id];
  /** 悬浮类坐骑的上下浮动 */
  const bob = Math.sin(now / 420) * 3;

  // 新主题宝箱的坐骑：走 themeart 的通用画法（beast / glider / wheeled…）
  if (THEME_MOUNTS[id]) {
    drawThemeMount(g, now, id, pose);
    return;
  }

  switch (id) {
    // ---- 滑板：一块板 + 两个轮子 ------------------------------------------
    case 'board': {
      g.fillStyle(0x1a1a20, 1);
      g.fillCircle(x - 20, y + 6, 4.5);
      g.fillCircle(x + 20, y + 6, 4.5);
      g.fillStyle(0x2b2b33, 1);
      g.fillRoundedRect(x - 34, y - 5, 68, 9, 4);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 30, y - 3, 60, 5, 2);
      break;
    }

    // ---- 泡泡：半透明大泡泡包住脚 ----------------------------------------
    case 'bubble': {
      const by = y - 10 + bob;
      g.fillStyle(color, 0.22);
      g.fillCircle(x, by, 46);
      g.fillStyle(0xffffff, 0.5);
      g.fillEllipse(x - 16, by - 22, 16, 10);
      g.lineStyle(2.5, 0xffffff, 0.6);
      g.strokeCircle(x, by, 46);
      break;
    }

    // ---- 筋斗云：几团白云 --------------------------------------------------
    case 'cloud': {
      const by = y + bob;
      g.fillStyle(0xd6e4f2, 0.95);
      g.fillEllipse(x, by + 4, 86, 26);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x - 26, by - 2, 17);
      g.fillCircle(x, by - 9, 23);
      g.fillCircle(x + 26, by - 2, 17);
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(x - 8, by - 18, 12);
      break;
    }

    // ---- 御剑：一把横剑，脚踩其上 ----------------------------------------
    case 'sword': {
      const by = y + 3 + bob * 0.6;
      g.fillStyle(0x9fe8ff, 0.35 + 0.25 * Math.sin(now / 260));
      g.fillEllipse(x, by - 12, 76, 12);
      g.fillStyle(0x22303f, 1);
      g.fillRoundedRect(x - 42, by - 2, 84, 9, 4);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 42, by - 5, 84, 6, 3);
      g.fillStyle(0xffffff, 0.7);
      g.fillRoundedRect(x - 34, by - 4, 62, 2, 1);
      g.fillStyle(0xffd45c, 1);
      g.fillCircle(x + 40, by - 1, 5.5);
      break;
    }

    // ---- 战马：四腿 + 身子 + 脖子马头 ------------------------------------
    case 'horse': {
      const by = y - 8;
      g.fillStyle(0x6f4620, 1);
      for (const dx of [-22, -8, 10, 24]) g.fillRoundedRect(x + dx - 3, by + 12, 6, 24, 3);
      g.fillStyle(color, 1);
      g.fillEllipse(x, by + 6, 76, 34);
      g.fillRoundedRect(x + f * 26 - 8, by - 20, 16, 28, 6);
      g.fillStyle(color, 1);
      g.fillEllipse(x + f * 41, by - 22, 27, 17);
      g.fillStyle(0x3a2a1c, 1);
      g.fillEllipse(x + f * 24, by - 22, 13, 22);
      g.fillEllipse(x - f * 38, by + 2, 16, 28);
      g.fillStyle(0x1c1410, 1);
      g.fillCircle(x + f * 46, by - 24, 2.4);
      break;
    }

    // ---- 魔毯：飞毯 + 流苏 ------------------------------------------------
    case 'carpet': {
      const by = y + bob;
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 52, by - 10, 104, 20, 6);
      g.fillStyle(0xffd45c, 1);
      g.fillRoundedRect(x - 46, by - 6, 92, 3, 1);
      g.fillRoundedRect(x - 46, by + 3, 92, 3, 1);
      for (let i = -4; i <= 4; i++) {
        g.fillStyle(0xffd45c, 0.85);
        g.fillRect(x + i * 12 - 1, by + 10, 2, 6);
      }
      break;
    }

    // ---- 流星：发光的核 + 旋转光芒 + 尾迹 --------------------------------
    case 'star': {
      const by = y - 8 + bob;
      g.fillStyle(0xffb03a, 0.3);
      g.fillEllipse(x - f * 46, by, 66, 16);
      g.fillStyle(0xffd45c, 0.55);
      g.fillEllipse(x - f * 28, by, 44, 12);
      g.lineStyle(3, color, 0.85);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + now / 900;
        g.lineBetween(
          x + Math.cos(a) * 13,
          by + Math.sin(a) * 13,
          x + Math.cos(a) * 23,
          by + Math.sin(a) * 23,
        );
      }
      g.fillStyle(0xfff2b0, 1);
      g.fillCircle(x, by, 11);
      break;
    }

    // ---- 幼龙：扇翅膀的小飞龙 --------------------------------------------
    case 'dragon': {
      const by = y - 12 + bob;
      const flap = Math.sin(now / 150) * 7;
      g.fillStyle(0x2f9a78, 0.95);
      g.fillTriangle(x - 10, by - 2, x - 60, by - 28 + flap, x - 16, by + 12);
      g.fillTriangle(x + 10, by - 2, x + 60, by - 28 - flap, x + 16, by + 12);
      g.fillStyle(0x2f9a78, 1);
      g.fillEllipse(x - f * 38, by + 4, 24, 12);
      g.fillStyle(color, 1);
      g.fillEllipse(x, by + 2, 64, 26);
      g.fillRoundedRect(x + f * 30 - 8, by - 18, 20, 18, 8);
      g.fillStyle(0xffd45c, 1);
      g.fillCircle(x + f * 38, by - 10, 3.2);
      g.fillStyle(0x2f9a78, 1);
      g.fillTriangle(x + f * 33, by - 20, x + f * 26, by - 30, x + f * 40, by - 26);
      break;
    }

    // ---- 火箭：机身 + 尾焰 ------------------------------------------------
    case 'rocket': {
      const by = y + 2;
      const flame = 16 + Math.sin(now / 90) * 5;
      g.fillStyle(0xff9a3c, 0.9);
      g.fillTriangle(x - 12, by + 11, x + 12, by + 11, x, by + 11 + flame);
      g.fillStyle(0xffe08a, 1);
      g.fillTriangle(x - 7, by + 11, x + 7, by + 11, x, by + 11 + flame * 0.6);
      g.fillStyle(0xd23b3b, 1);
      g.fillTriangle(x - 17, by + 6, x - 31, by + 17, x - 9, by + 11);
      g.fillTriangle(x + 17, by + 6, x + 31, by + 17, x + 9, by + 11);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 17, by - 16, 34, 28, 11);
      g.fillStyle(0x9fe8ff, 1);
      g.fillCircle(x, by - 5, 6);
      break;
    }

    // ---- 浮空王座：金王座 + 红垫 ------------------------------------------
    case 'throne': {
      const by = y - 2 + bob;
      g.fillStyle(0xa06a24, 1);
      g.fillRoundedRect(x - 36, by - 36, 14, 40, 5);
      g.fillRoundedRect(x + 22, by - 36, 14, 40, 5);
      g.fillRoundedRect(x - 36, by - 48, 72, 15, 5);
      g.fillStyle(0x8a5a1e, 1);
      g.fillRoundedRect(x - 36, by - 6, 72, 20, 6);
      g.fillStyle(0xc0392b, 1);
      g.fillRoundedRect(x - 23, by - 10, 46, 11, 3);
      g.fillStyle(0xffd45c, 1);
      g.fillCircle(x - 29, by - 56, 5);
      g.fillCircle(x + 29, by - 56, 5);
      g.fillCircle(x, by - 62, 6.5);
      break;
    }

    // ---- 飞碟：碟身 + 玻璃罩里的小外星人 + 绕碟一圈的灯 --------------------
    case 'ufo': {
      const by = y - 16 + bob * 1.6;
      // 朝地面投下的一束绿光
      g.fillStyle(0x6fe09a, 0.16 + 0.08 * Math.sin(now / 260));
      g.beginPath();
      g.moveTo(x - 16, by + 10);
      g.lineTo(x + 16, by + 10);
      g.lineTo(x + 46, y + 24);
      g.lineTo(x - 46, y + 24);
      g.closePath();
      g.fillPath();
      // 碟身
      g.fillStyle(0x8fa6b8, 1);
      g.fillEllipse(x, by + 4, 96, 22);
      g.fillStyle(color, 1);
      g.fillEllipse(x, by - 3, 86, 18);
      g.fillStyle(0xd8e6f0, 0.9);
      g.fillEllipse(x, by - 6, 56, 10);
      // 玻璃罩 + 里面那只小外星人
      g.fillStyle(0x9fe8ff, 0.32);
      g.fillCircle(x, by - 19, 19);
      g.fillStyle(0x6fe09a, 1);
      g.fillEllipse(x, by - 17, 16, 20);
      g.fillStyle(0x0e1a14, 1);
      g.fillEllipse(x - 4, by - 20, 5.5, 7);
      g.fillEllipse(x + 4, by - 20, 5.5, 7);
      g.lineStyle(2, 0xd8e6f0, 0.75);
      g.strokeCircle(x, by - 19, 19);
      // 绕碟一圈交替闪的灯
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + now / 300;
        g.fillStyle(k % 2 ? 0xffd45c : 0x6fe09a, 0.9);
        g.fillCircle(x + Math.cos(a) * 40, by + 3 + Math.sin(a) * 8, 2.6);
      }
      break;
    }

    // ==== 宇宙龙域限定 ========================================================
    case 'stardrake': {
      // 星渊龙驹：卧在脚下的小星龙，翅膀慢慢扇，尾尖一点金光
      const flap = Math.sin(now / 220);
      g.fillStyle(0x2a224e, 0.5);
      g.fillEllipse(x, y - 6, 54, 16);
      g.fillStyle(0x3a2f6b, 1);
      g.fillEllipse(x, y - 16 + bob, 46, 24);
      // 尾巴 + 尾尖的金光
      g.fillTriangle(
        x - f * 20, y - 18 + bob,
        x - f * 20, y - 8 + bob,
        x - f * 36 + Math.sin(now / 260) * 4, y - 14 + bob,
      );
      g.fillStyle(0xffd45c, 0.9);
      g.fillCircle(x - f * 36 + Math.sin(now / 260) * 4, y - 14 + bob, 2.6);
      // 一对星翼
      for (const s of [-1, 1]) {
        g.save();
        g.translateCanvas(x + s * 12, y - 24 + bob);
        g.rotateCanvas(s * (0.6 + flap * 0.3));
        g.fillStyle(0x5a4a9a, 0.95);
        g.fillTriangle(0, 0, s * 20, -16, s * 22, 2);
        g.restore();
      }
      // 抬着的头（星云色的眼睛望着你）
      g.fillStyle(0x3a2f6b, 1);
      g.fillEllipse(x + f * 16, y - 26 + bob, 24, 18);
      g.fillStyle(0x9fe8ff, 1);
      g.fillCircle(x + f * 20, y - 29 + bob, 2.6);
      g.fillStyle(0xffd45c, 1);
      g.fillTriangle(x + f * 12, y - 34 + bob, x + f * 17, y - 33 + bob, x + f * 15, y - 41 + bob);
      // 背上的鞍位
      g.fillStyle(0x8f7bff, 0.7);
      g.fillEllipse(x, y - 26 + bob, 20, 8);
      break;
    }

    // ==== 金币商店那批「普通款」（1~3★）：造型简单，但各有一个小动作 ==========
    // 参考现有那批的尺度：都在 ±50 以内、贴着 feetY 画，所以不会和判定冲突。

    // ---- 滑板车：两个轮子在转 + 把手轻轻摇 --------------------------------
    case 'scooter': {
      const spin = now / 110;
      g.lineStyle(1.6, color, 0.95);
      for (const wx of [-22, 22]) {
        g.fillStyle(0x2b2b33, 1);
        g.fillCircle(x + wx, y + 8, 6);
        for (let k = 0; k < 3; k++) {
          const a = spin + (k / 3) * Math.PI * 2;
          g.lineBetween(x + wx, y + 8, x + wx + Math.cos(a) * 4.6, y + 8 + Math.sin(a) * 4.6);
        }
      }
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 30, y - 1, 60, 8, 4);
      g.fillStyle(0x1a1a20, 0.35);
      g.fillRoundedRect(x - 26, y + 2, 52, 3, 1.5);
      // 立杆 + 把手（摇摆）
      const sway = Math.sin(now / 520) * 2.4;
      g.fillStyle(0x8fa6b8, 1);
      g.fillRect(x + f * 24 - 2, y - 26 + sway * 0.5, 4, 26);
      g.fillRoundedRect(x + f * 24 - 10, y - 31 + sway * 0.5, 20, 5, 2.5);
      break;
    }

    // ---- 圆木：木纹横向滚动 + 端面年轮 ------------------------------------
    case 'log': {
      g.fillStyle(0x6b4a26, 1);
      g.fillRoundedRect(x - 44, y - 11, 88, 25, 12);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 44, y - 14, 88, 24, 12);
      const off = (now / 9) % 14;
      g.fillStyle(0x5a3f22, 0.5);
      for (let k = -3; k <= 3; k++) {
        const lx = x + k * 14 + (f > 0 ? -off : off);
        g.fillRect(lx - 1, y - 13, 2.4, 22);
      }
      g.fillStyle(0x8a6238, 1);
      g.fillCircle(x + f * 44, y - 2, 13);
      g.lineStyle(1.6, 0x5a3f22, 0.85);
      g.strokeCircle(x + f * 44, y - 2, 9);
      g.strokeCircle(x + f * 44, y - 2, 5);
      break;
    }

    // ---- 纸箱：一路颠，两片箱盖反向翘 ------------------------------------
    case 'box': {
      const j = Math.sin(now / 90) * 1.4;
      const flap = Math.sin(now / 260) * 0.4;
      g.fillStyle(0xb98a52, 1);
      g.fillRoundedRect(x - 32, y - 22 + j, 64, 24, 4);
      g.fillStyle(0xa87a44, 1);
      g.fillRect(x - 32, y - 22 + j, 64, 5);
      for (const s of [-1, 1]) {
        g.save();
        g.translateCanvas(x + s * 16, y - 22 + j);
        g.rotateCanvas(s * flap);
        g.fillStyle(0xc99a5c, 1);
        g.fillRect(-16, -7, 32, 8);
        g.restore();
      }
      g.fillStyle(0xd8c08a, 0.92);
      g.fillRect(x - 5, y - 20 + j, 10, 22);
      g.fillStyle(0x6b4a26, 0.85);
      g.fillRect(x - 19, y - 12 + j, 12, 3);
      g.fillRect(x + 7, y - 12 + j, 12, 3);
      break;
    }

    // ---- 弹簧：一路压一压、弹一弹 ----------------------------------------
    case 'spring': {
      const t = Math.abs(Math.sin(now / 320)); // 1 = 压到底
      const h = 8 + (1 - t) * 22;
      g.fillStyle(0x8fa6b8, 1);
      g.fillRoundedRect(x - 17, y - 4, 34, 7, 3.5);
      g.lineStyle(4, color, 1);
      for (let k = 0; k < 4; k++) {
        g.strokeEllipse(x, y - 8 - (k / 4) * h, 26 - k, 7 - k * 0.6);
      }
      g.fillStyle(0xd8e6f0, 1);
      g.fillRoundedRect(x - 19, y - 12 - h, 38, 7, 3.5);
      break;
    }

    // ---- 独轮小推车：轮子转 + 车斗前后倾 --------------------------------
    case 'cart': {
      const spin = now / 95;
      const tilt = Math.sin(now / 720) * 0.06;
      g.fillStyle(0x2b2b33, 1);
      g.fillCircle(x, y + 9, 10);
      g.lineStyle(2, color, 0.95);
      for (let k = 0; k < 4; k++) {
        const a = spin + (k / 4) * Math.PI * 2;
        g.lineBetween(x, y + 9, x + Math.cos(a) * 7.6, y + 9 + Math.sin(a) * 7.6);
      }
      g.save();
      g.translateCanvas(x, y + 7);
      g.rotateCanvas(tilt);
      g.fillStyle(color, 1);
      g.fillRoundedRect(-31, -21, 62, 19, 4);
      g.fillStyle(0x8a5a1e, 1);
      g.fillRect(-29, -19, 58, 3);
      g.fillRoundedRect(-31, -24, 62, 4, 2);
      g.restore();
      g.fillStyle(0x8a5a1e, 1);
      g.fillRoundedRect(x + f * 30 - 3, y - 18, 6, 20, 3);
      g.fillRoundedRect(x + f * 32 - 11, y - 23, 22, 5, 2.5);
      break;
    }

    // ---- 扫帚：帚须左右扫 + 身后扬起星尘 ---------------------------------
    case 'broom': {
      const sway = Math.sin(now / 240) * 3.4;
      g.fillStyle(0x8a6238, 1);
      g.fillRoundedRect(x - 44, y - 9, 68, 7, 3.5);
      g.fillStyle(0xc0392b, 1);
      g.fillRect(x + 18, y - 11, 6, 11);
      g.lineStyle(3, color, 1);
      for (let k = 0; k < 5; k++) {
        const bx = x + 24 + k * 3;
        g.lineBetween(bx, y - 7, bx + 10 + sway * 0.3, y + 2 + k * 0.8 + sway);
      }
      for (let k = 0; k < 3; k++) {
        const t = ((now / 1200 + k / 3) % 1);
        g.fillStyle(0xffe08a, 0.5 * (1 - t));
        g.fillCircle(x - f * (8 + t * 42), y - 2 - t * 16, 2.6 - t * 1.2);
      }
      break;
    }

    // ---- 小乌龟：四条腿交替划 + 脑袋一伸一缩 -----------------------------
    case 'turtle': {
      const step = Math.sin(now / 320);
      g.fillStyle(0x6fae4f, 1);
      g.fillRoundedRect(x - 27, y - 1 + step * 2.4, 12, 8, 3.5);
      g.fillRoundedRect(x + 15, y - 1 - step * 2.4, 12, 8, 3.5);
      g.fillRoundedRect(x - 15, y + step * 2.4, 11, 7, 3);
      g.fillRoundedRect(x + 5, y - step * 2.4, 11, 7, 3);
      g.fillTriangle(x - f * 30, y - 4, x - f * 41, y, x - f * 30, y + 3);
      g.fillStyle(color, 1);
      g.fillEllipse(x, y - 9, 62, 27);
      g.fillStyle(0x2f6b2a, 0.5);
      for (let k = -1; k <= 1; k++) g.fillEllipse(x + k * 15, y - 9, 10, 13);
      const neck = 1 + Math.sin(now / 700) * 0.4; // 头伸缩
      g.fillStyle(0x6fae4f, 1);
      g.fillEllipse(x + f * (26 + neck * 6), y - 13, 20 * neck + 6, 13);
      g.fillStyle(0x1c2a14, 1);
      g.fillCircle(x + f * (30 + neck * 6), y - 15, 2);
      break;
    }

    // ---- 小自行车：前后轮转 + 脚踏跟着转 --------------------------------
    case 'bike': {
      const spin = now / 90;
      g.lineStyle(1.8, 0xdfe6f0, 0.95);
      for (const wx of [-24, 24]) {
        g.fillStyle(0x2b2b33, 1);
        g.fillCircle(x + wx, y + 7, 11);
        for (let k = 0; k < 4; k++) {
          const a = spin + (k / 4) * Math.PI * 2;
          g.lineBetween(x + wx, y + 7, x + wx + Math.cos(a) * 8.5, y + 7 + Math.sin(a) * 8.5);
        }
      }
      g.lineStyle(3.4, color, 1);
      g.lineBetween(x - 24, y + 7, x - 2, y - 12);
      g.lineBetween(x - 2, y - 12, x + 24, y + 7);
      g.lineBetween(x - 2, y - 12, x + f * 16, y - 16);
      g.lineBetween(x - 24, y + 7, x - 2, y + 7);
      g.fillStyle(0x8a5a1e, 1);
      g.fillRoundedRect(x + f * 16 - 9, y - 21, 18, 5, 2.5);
      // 脚踏（转）
      const pa = Math.sin(spin) * 6;
      g.fillStyle(0x2b2b33, 1);
      g.fillCircle(x - 2 + pa, y + 2, 3.2);
      g.fillCircle(x - 2 - pa, y + 2, 3.2);
      break;
    }

    // ---- 悬浮板：上下浮 + 底下两股喷流 -----------------------------------
    case 'hover': {
      const hb = y - 12 + Math.sin(now / 380) * 4;
      const jet = 12 + Math.sin(now / 70) * 4;
      for (const s of [-1, 1]) {
        g.fillStyle(0x6fe3ff, 0.35);
        g.fillTriangle(
          x + s * 14 - 6,
          hb + 5,
          x + s * 14 + 6,
          hb + 5,
          x + s * 14 + Math.sin(now / 120 + s) * 3,
          hb + 5 + jet,
        );
      }
      g.fillStyle(0x3a4a5c, 1);
      g.fillRoundedRect(x - 34, hb, 68, 9, 4.5);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 32, hb - 4, 64, 6, 3);
      g.fillStyle(0x9fe8ff, 0.9 + 0.1 * Math.sin(now / 130));
      g.fillRoundedRect(x - 26, hb + 1, 52, 2.6, 1.3);
      break;
    }

    // ---- 鲨鱼：尾巴左右摆 + 两侧水花 -------------------------------------
    case 'shark': {
      const tail = Math.sin(now / 260) * 0.5;
      g.fillStyle(0x6f9fce, 0.35);
      g.fillEllipse(x, y + 4, 104, 14);
      g.fillStyle(color, 1);
      g.fillEllipse(x, y - 6, 86, 26);
      g.fillEllipse(x + f * 38, y - 10, 34, 20);
      g.fillTriangle(x - f * 10, y - 18, x + f * 12, y - 20, x - f * 2, y - 32);
      g.save();
      g.translateCanvas(x - f * 40, y - 4);
      g.rotateCanvas(f * tail);
      g.fillStyle(color, 1);
      g.fillTriangle(-f * 6, 0, -f * 26, -12, -f * 24, 8);
      g.restore();
      g.fillStyle(0x0e1a24, 1);
      g.fillCircle(x + f * 44, y - 12, 2.6);
      g.fillStyle(0xffffff, 0.8);
      for (let k = 0; k < 4; k++) {
        const wx = x + f * (18 + k * 6);
        g.fillTriangle(wx, y - 16, wx + f * 3, y - 12, wx, y - 18);
      }
      break;
    }

    // ---- 小黄龙滚滚：小黄龙趴着打滚，小短腿朝天 ----------------------------
    case 'nailongRoll': {
      const by = y - 10;
      const spin = now / 260;
      // 尾巴 + 身子
      g.fillStyle(0xefb81e, 1);
      g.fillEllipse(x - f * 30, by + 6, 26, 14);
      g.fillStyle(color, 1);
      g.fillCircle(x, by + 2, 22);
      g.fillStyle(0xfff3bd, 1);
      g.fillEllipse(x, by + 8, 26, 20);
      // 脑袋
      g.fillStyle(color, 1);
      g.fillCircle(x + f * 26, by - 10, 16);
      g.fillStyle(0xefb81e, 1);
      g.fillCircle(x + f * 20, by - 24, 4.5);
      g.fillCircle(x + f * 32, by - 24, 4.5);
      g.fillStyle(0x3a2a06, 1);
      g.fillCircle(x + f * 22, by - 12, 3);
      g.fillCircle(x + f * 32, by - 12, 3);
      g.fillStyle(0x8a3a2a, 1);
      g.fillEllipse(x + f * 28, by - 4, 7, 5);
      // 朝天的小短腿（跟着转）
      g.fillStyle(0xefb81e, 1);
      for (let k = 0; k < 2; k++) {
        const a = spin + k * Math.PI;
        g.fillCircle(x + Math.cos(a) * 14, by - 16 + Math.sin(a) * 4, 5);
      }
      break;
    }

    // ==== 主题宝箱专属坐骑（每个主题一只，见 game/chest.ts 的 CHEST_THEMES）=======

    // ---- 小海豚：拱着背跃出水面，底下一汪水花 ------------------------------
    case 'dolphin': {
      const hop = Math.abs(Math.sin(now / 500)) * 6;
      const dy = y - 10 - hop;
      g.fillStyle(0x9fd8f0, 0.5);
      g.fillEllipse(x, y + 2, 80, 12);
      g.fillStyle(color, 1);
      g.fillEllipse(x, dy, 70, 24);
      g.fillEllipse(x + f * 34, dy - 6, 26, 18);
      g.fillTriangle(x - f * 4, dy - 12, x + f * 12, dy - 10, x + f * 2, dy - 24);
      g.save();
      g.translateCanvas(x - f * 34, dy + 2);
      g.rotateCanvas(f * Math.sin(now / 260) * 0.5);
      g.fillTriangle(0, 0, -f * 20, -10, -f * 18, 8);
      g.restore();
      g.fillStyle(0xd8f0ff, 1);
      g.fillEllipse(x + f * 12, dy + 2, 26, 8);
      g.fillStyle(0x0e1a24, 1);
      g.fillCircle(x + f * 40, dy - 8, 2.4);
      break;
    }

    // ---- 南瓜车：小南瓜安上轮子，车灯一闪一闪 ------------------------------
    case 'pumpkincart': {
      const spin = now / 120;
      g.lineStyle(1.6, 0x6b4a26, 0.95);
      for (const wx of [-22, 22]) {
        g.fillStyle(0x2b2b33, 1);
        g.fillCircle(x + wx, y + 8, 7);
        for (let k = 0; k < 3; k++) {
          const a = spin + (k / 3) * Math.PI * 2;
          g.lineBetween(x + wx, y + 8, x + wx + Math.cos(a) * 5.4, y + 8 + Math.sin(a) * 5.4);
        }
      }
      // 南瓜车斗：几瓣鼓起来
      g.fillStyle(color, 1);
      for (let k = -1; k <= 1; k++) g.fillEllipse(x + k * 13, y - 8, 18, 26);
      g.fillStyle(0x4a7a2a, 1);
      g.fillRect(x - 2, y - 24, 4, 6);
      // 车灯（会闪的南瓜眼）
      const glow = 0.6 + 0.4 * Math.sin(now / 240);
      g.fillStyle(0xffd45c, glow);
      g.fillTriangle(x + f * 8, y - 12, x + f * 16, y - 12, x + f * 12, y - 18);
      g.fillTriangle(x - f * 4, y - 12, x - f * 12, y - 12, x - f * 8, y - 18);
      break;
    }

    // ---- 齿轮机车：一台小蒸汽机车，烟囱冒烟、连杆在动 ----------------------
    case 'gearbike': {
      const spin = now / 90;
      g.fillStyle(0x2b2b33, 1);
      for (const wx of [-20, 14]) {
        g.fillCircle(x + wx, y + 8, 8);
      }
      g.lineStyle(1.6, 0xd8e0ea, 0.9);
      for (const wx of [-20, 14]) {
        for (let k = 0; k < 3; k++) {
          const a = spin + (k / 3) * Math.PI * 2;
          g.lineBetween(x + wx, y + 8, x + wx + Math.cos(a) * 6, y + 8 + Math.sin(a) * 6);
        }
      }
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - 34, y - 14, 62, 20, 5);
      g.fillStyle(0x59657a, 1);
      g.fillRect(x - 34, y - 2, 62, 4);
      // 驾驶室 + 烟囱（冒烟）
      g.fillStyle(0x59657a, 1);
      g.fillRoundedRect(x + f * 14, y - 30, 16, 18, 3);
      g.fillStyle(color, 1);
      g.fillRoundedRect(x - f * 26 - 4, y - 28, 10, 16, 3);
      for (let k = 0; k < 3; k++) {
        const t = (now / 900 + k / 3) % 1;
        g.fillStyle(0xdfe6f0, 0.5 * (1 - t));
        g.fillCircle(x - f * 22 + Math.sin(t * 6) * 4, y - 32 - t * 22, 4 + t * 5);
      }
      break;
    }

    // ---- 小狮子：金鬃毛的大猫，尾巴尖一撮毛晃来晃去 ------------------------
    case 'lion': {
      const breath = Math.sin(now / 500);
      g.lineStyle(4, color, 1);
      g.beginPath();
      g.moveTo(x - f * 26, y - 10);
      g.lineTo(x - f * 40, y - 16);
      g.strokePath();
      g.fillStyle(0x8a5a2a, 1);
      g.fillCircle(x - f * 42, y - 17, 4);
      g.fillStyle(color, 1);
      g.fillEllipse(x, y - 8 + breath * 0.8, 60, 28);
      for (const dx of [-18, -6, 8, 20]) g.fillRoundedRect(x + dx - 3, y - 2, 6, 10, 3);
      // 鬃毛（一圈锯齿）+ 脸
      g.fillStyle(0xb8822a, 1);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        g.fillCircle(x + f * 24 + Math.cos(a) * 13, y - 18 + Math.sin(a) * 13, 5.4);
      }
      g.fillStyle(color, 1);
      g.fillCircle(x + f * 24, y - 18, 11);
      g.fillStyle(0x3a2a10, 1);
      g.fillCircle(x + f * 20, y - 20, 1.8);
      g.fillCircle(x + f * 28, y - 20, 1.8);
      g.fillTriangle(x + f * 22, y - 14, x + f * 26, y - 14, x + f * 24, y - 11);
      break;
    }

    // ---- 春风纸鸢：一只燕子风筝，飘在脚下、飘带跟着风摆 --------------------
    case 'kite': {
      const dy = y - 14 + Math.sin(now / 420) * 4;
      const sway = Math.sin(now / 380) * 4;
      g.save();
      g.translateCanvas(x, dy);
      g.rotateCanvas(Math.sin(now / 620) * 0.1);
      // 菱形风筝面
      g.fillStyle(color, 1);
      g.fillTriangle(0, -24, -20, 0, 0, 24);
      g.fillTriangle(0, -24, 20, 0, 0, 24);
      g.fillStyle(0xffffff, 0.5);
      g.fillTriangle(0, -24, -20, 0, 0, 0);
      g.fillStyle(0x8a4a6a, 0.8);
      g.fillTriangle(0, -8, -8, 0, 8, 0);
      g.restore();
      // 骨架 + 两条飘带
      g.lineStyle(1.6, 0x5a3a4a, 0.8);
      g.lineBetween(x, dy - 24, x, dy + 24);
      g.lineBetween(x - 20, dy, x + 20, dy);
      g.lineStyle(2.4, 0xffd45c, 0.95);
      g.lineBetween(x, dy + 24, x + sway, dy + 40);
      g.lineBetween(x + sway, dy + 40, x - sway * 0.6, dy + 54);
      break;
    }

    // ---- 弯月舟：坐进一弯月牙里，星星围着你转 ------------------------------
    case 'crescent': {
      const dy = y - 12 + Math.sin(now / 440) * 4;
      g.fillStyle(color, 1);
      // 月牙：大圆减出弧形——用两个圆近似
      g.fillCircle(x, dy, 26);
      g.fillStyle(0x2a3a8a, 0.0);
      g.fillCircle(x + f * 12, dy - 6, 20);
      g.fillStyle(0x3a2a10, 0.0);
      g.fillEllipse(x, dy, 1, 1);
      // 弧面上的月斑
      g.fillStyle(0xd8b870, 0.7);
      g.fillCircle(x - f * 10, dy + 6, 3.4);
      g.fillCircle(x + f * 2, dy + 12, 2.6);
      g.fillCircle(x + f * 12, dy + 2, 2.2);
      // 上弦的内弧阴影
      g.fillStyle(0xc9a44a, 0.45);
      g.fillEllipse(x + f * 14, dy - 10, 22, 10);
      // 绕着转的小星星
      for (const s of [0, Math.PI, Math.PI / 2]) {
        const a = now / 500 + s;
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(x + Math.cos(a) * 34, dy + Math.sin(a) * 16 - 4, 2);
      }
      break;
    }

    // ---- 烈焰火轮：一只烧着的火轮滚在脚下，火星乱蹦 ------------------------
    case 'firewheel': {
      const spin = now / 70;
      const dy = y - 4;
      // 外焰（锯齿火苗跟着转）
      for (let k = 0; k < 8; k++) {
        const a = spin + (k / 8) * Math.PI * 2;
        const len = 26 + Math.sin(now / 130 + k) * 5;
        g.fillStyle(0xff7a2a, 0.9);
        g.fillTriangle(
          x + Math.cos(a) * 18, dy + Math.sin(a) * 18,
          x + Math.cos(a + 0.22) * 18, dy + Math.sin(a + 0.22) * 18,
          x + Math.cos(a + 0.11) * len, dy + Math.sin(a + 0.11) * len,
        );
      }
      // 轮盘 + 辐条
      g.fillStyle(color, 1);
      g.fillCircle(x, dy, 17);
      g.fillStyle(0x8a1a08, 1);
      g.fillCircle(x, dy, 8);
      g.lineStyle(2.4, 0xffd45c, 0.9);
      for (let k = 0; k < 4; k++) {
        const a = spin + (k / 4) * Math.PI * 2;
        g.lineBetween(x, dy, x + Math.cos(a) * 15, dy + Math.sin(a) * 15);
      }
      // 身后蹦出的火星
      for (let k = 0; k < 3; k++) {
        const t = (now / 500 + k / 3) % 1;
        g.fillStyle(0xffd45c, 0.7 * (1 - t));
        g.fillCircle(x - f * (20 + t * 26), dy - 8 - t * 14, 2.4 - t);
      }
      break;
    }

    // ---- 雪原熊：白白胖胖的北极熊，走路一晃一晃 ----------------------------
    case 'polarbear': {
      const step = Math.sin(now / 340);
      const dy = y - 12;
      g.fillStyle(color, 1);
      // 四条腿（交替迈）
      g.fillRoundedRect(x - 24, dy + 8 + step * 2, 11, 14, 5);
      g.fillRoundedRect(x + 12, dy + 8 - step * 2, 11, 14, 5);
      g.fillRoundedRect(x - 12, dy + 8 - step * 2, 10, 13, 5);
      g.fillRoundedRect(x + 2, dy + 8 + step * 2, 10, 13, 5);
      // 身子 + 圆头 + 小耳朵
      g.fillEllipse(x, dy, 62, 34);
      g.fillCircle(x + f * 26, dy - 10, 14);
      g.fillCircle(x + f * 20, dy - 22, 5);
      g.fillCircle(x + f * 32, dy - 22, 5);
      // 黑鼻头 + 眯眼
      g.fillStyle(0x2a3a44, 1);
      g.fillEllipse(x + f * 34, dy - 10, 6, 5);
      g.fillCircle(x + f * 24, dy - 12, 1.8);
      g.fillCircle(x + f * 31, dy - 12, 1.8);
      break;
    }

    // ---- 小恐龙：绿皮小恐龙驮着你，背刺跟呼吸起伏 --------------------------
    case 'dino': {
      const br = Math.sin(now / 480);
      const dy = y - 12;
      g.fillStyle(color, 1);
      // 尾巴 + 身子 + 四条短腿
      g.fillTriangle(x - f * 26, dy + 6, x - f * 26, dy - 10, x - f * 44, dy + 4);
      g.fillEllipse(x, dy + 2, 58, 30);
      for (const dx of [-20, -6, 8, 20]) g.fillRoundedRect(x + dx - 3.4, dy + 10, 7, 12, 3.4);
      // 背刺一排（跟着呼吸）
      g.fillStyle(0x2f7a4a, 1);
      for (let k = 0; k < 4; k++) {
        g.fillTriangle(x - f * 18 + k * 11, dy - 10, x - f * 10 + k * 11, dy - 10, x - f * 14 + k * 11, dy - 18 - br * 2);
      }
      // 抬着的头 + 白肚皮 + 眼睛
      g.fillStyle(color, 1);
      g.fillEllipse(x + f * 28, dy - 12, 26, 20);
      g.fillStyle(0xd8f0d0, 1);
      g.fillEllipse(x, dy + 10, 40, 12);
      g.fillStyle(0x0e1a14, 1);
      g.fillCircle(x + f * 32, dy - 16, 2.2);
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(x + f * 33, dy - 17, 0.8);
      break;
    }

    // ---- 霓虹摩托：一台发光的低趴摩托，轮子转、车尾喷霓虹 ------------------
    case 'laserbike': {
      const spin = now / 80;
      g.lineStyle(1.8, color, 0.95);
      for (const wx of [-24, 24]) {
        g.fillStyle(0x1a1a20, 1);
        g.fillCircle(x + wx, y + 8, 9);
        for (let k = 0; k < 3; k++) {
          const a = spin + (k / 3) * Math.PI * 2;
          g.lineBetween(x + wx, y + 8, x + wx + Math.cos(a) * 7, y + 8 + Math.sin(a) * 7);
        }
      }
      // 车身（低趴楔形）+ 发光描边
      g.fillStyle(0x2a2a34, 1);
      g.fillRoundedRect(x - 28, y - 8, 60, 12, 5);
      g.fillStyle(color, 0.9 + 0.1 * Math.sin(now / 150));
      g.fillRoundedRect(x - 26, y - 6, 56, 4, 2);
      // 车头 + 车尾喷的霓虹尾迹
      g.fillStyle(0x2a2a34, 1);
      g.fillRoundedRect(x + f * 22 - 4, y - 22, 8, 16, 3);
      g.fillStyle(color, 0.9);
      g.fillCircle(x + f * 26, y - 24, 3);
      for (let k = 0; k < 4; k++) {
        const t = (now / 400 + k / 4) % 1;
        g.fillStyle(color, 0.5 * (1 - t));
        g.fillEllipse(x - f * (30 + t * 40), y + 2, 16 - t * 8, 5 - t * 2);
      }
      break;
    }
  }
}
