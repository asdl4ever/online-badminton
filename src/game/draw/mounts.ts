import Phaser from 'phaser';
import { MOUNT_COLORS, type MountId } from '../cosmetics';
import type { CharacterPose } from './character';

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
  }
}
