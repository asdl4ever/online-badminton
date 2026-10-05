import { PLAYER_H } from '../constants';
import {
  AURA_COLORS,
  DEFAULT_COSMETIC,
  MOUNT_COLORS,
  RACKET_SKIN_COLORS,
  SWING_TRAIL_COLORS,
  TRAIL_COLORS,
  toHex,
  isWingFamily,
  type AuraId,
  type BackId,
  type CapeId,
  type Cosmetic,
  type HatId,
  type HitStyle,
  type MountId,
  type PetId,
  type RacketSkinId,
  type SwingTrailId,
  type TrailId,
} from '../cosmetics';
import { EFFECT_PAINTERS, paintDefault, type HitFlash } from '../effects';
import type { Item } from '../items';
import { asGraphics, paintAvatar } from './canvas2d';
import { drawAura, drawCape, drawHat, drawPet, drawRing, drawWings } from './character';
import { drawMount } from './mounts';
import { drawRacketHead } from './racket';

/**
 * 物品图标：把每个部位的**游戏同款绘制**画进一张方形小 canvas。
 *
 * 复用 `draw/` 与 `effects/` 里那唯一一份画法（经 canvas2d.ts 的 Graphics→Canvas2D
 * 适配层），所以背包/宝箱里看到的就是游戏里的样子，不用再维护一套图标素材。
 *
 * 全部是**静态快照**：`now` 固定，画一次就没有后续开销——一页 25 个图标也就
 * 几毫秒的一次性成本，不会引入逐帧动画的负担。
 */

const ICON = 96;
const TAU = Math.PI * 2;
/** 固定的动画时刻（取一个摆动/脉动都在半途的值，比 0 更有代表性） */
const NOW = 480;

export function paintItemIcon(item: Item, canvas: HTMLCanvasElement): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = Math.round(ICON * dpr);
  if (canvas.width !== size) {
    canvas.width = size;
    canvas.height = size;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, ICON, ICON);

  const g = asGraphics(ctx);
  const c = ICON / 2;
  /** 让 `span` 个世界单位刚好铺满图标 */
  const fit = (span: number): number => ICON / span;
  const cos = (slot: keyof Cosmetic, ref: string): Cosmetic =>
    ({ ...DEFAULT_COSMETIC, [slot]: ref }) as Cosmetic;

  switch (item.slot) {
    case 'skin': {
      // 整只角色：先按头像盒子画到离屏 canvas，再等比收进方框
      const off = document.createElement('canvas');
      paintAvatar(off, cos('characterSkin', item.ref), NOW, { scale: 1 });
      const s = (Math.min(ICON / off.width, ICON / off.height) * 0.94);
      ctx.drawImage(off, (ICON - off.width * s) / 2, (ICON - off.height * s) / 2, off.width * s, off.height * s);
      break;
    }
    case 'hat':
      // 头饰以「头顶」为锚（topY），往上长——锚点放低给帽子留空间
      ctx.translate(c, ICON * 0.8);
      ctx.scale(fit(90), fit(90));
      // 传 NOW：图标虽然是静止的一帧，但动态头饰要有个像样的姿态
      drawHat(g, 0, 0, item.ref as HatId, NOW);
      break;
    case 'back': {
      // 背部装饰：按 id 家族分派——展开形（原翅膀）向上后方展开，垂坠形（原披风）往下长
      if (isWingFamily(item.ref as BackId)) {
        ctx.translate(c, ICON * 0.42);
        ctx.scale(fit(190), fit(190));
        drawWings(g, NOW, 0, 0, item.ref as BackId);
      } else {
        ctx.translate(c, ICON * 0.06);
        ctx.scale(fit(150), fit(150));
        drawCape(g, NOW, 0, 0, item.ref as BackId as CapeId);
      }
      break;
    }
    case 'aura': {
      // 背景特效化的光环跨度更大（纵跨约 ±150）：缩放口径放宽，图标里看得更全
      ctx.translate(c, c);
      ctx.scale(fit(260), fit(260));
      drawAura(g, NOW, 0, PLAYER_H / 2, item.ref as AuraId, AURA_COLORS[item.ref as AuraId] ?? 0xffd45c);
      break;
    }
    case 'pet':
      // 宠物画在 x + 42 处，把 x 设为 -42 让它居中
      ctx.translate(c, c);
      ctx.scale(fit(60), fit(60));
      drawPet(g, NOW, -42, 4, 0, item.ref as PetId, item.stars);
      break;
    case 'ring':
      // 地环：椭圆环整体居中
      ctx.translate(c, c);
      ctx.scale(fit(90), fit(90));
      drawRing(g, NOW, 0, 0, item.ref as import('../cosmetics').RingId);
      break;
    case 'racketSkin': {
      ctx.translate(c, c);
      const s = fit(64);
      ctx.scale(s, s);
      // 拍框中心在局部 (9, 0)，往回挪一点让整体居中
      ctx.translate(-9, 0);
      drawRacketHead(g, NOW, item.ref as RacketSkinId, RACKET_SKIN_COLORS[item.ref as RacketSkinId] ?? 0x44586f);
      break;
    }
    case 'effect': {
      ctx.translate(c, c);
      ctx.scale(fit(140), fit(140));
      const flash: HitFlash = {
        x: 0,
        y: 0,
        life: 0,
        ang: -0.6,
        style: item.ref as HitStyle,
        color: 0xffd45c,
        power: 1,
        seed: 7,
      };
      (EFFECT_PAINTERS[flash.style] ?? paintDefault)(g, flash, 0.35, 1, 1);
      break;
    }
    case 'trail': {
      // 拖尾跟球走、没有独立造型：画一串沿弧线渐隐的彗星点示意配色
      const color = item.ref === 'none' ? '#9aa7b8' : toHex(TRAIL_COLORS[item.ref as TrailId] ?? 0x6f9fce);
      for (let k = 0; k < 7; k++) {
        const f = k / 6;
        ctx.globalAlpha = 1 - f * 0.82;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(22 + f * 54, 60 - Math.sin(f * Math.PI) * 30 + f * 14, 7.5 - f * 4.5, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'swingTrail': {
      // 挥拍拖尾：一条挥拍弧线的示意（三层错开的弧 + 拍头亮点）
      const color =
        item.ref === 'none' ? '#9aa7b8' : toHex(SWING_TRAIL_COLORS[item.ref as SwingTrailId] ?? 0xd8ecff);
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        ctx.globalAlpha = 0.8 - k * 0.24;
        ctx.lineWidth = 9 - k * 3;
        ctx.beginPath();
        ctx.arc(30, 64, 42 - k * 5, -Math.PI * 0.12, Math.PI * 0.44);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      const ex = 30 + Math.cos(Math.PI * 0.44) * 42;
      const ey = 64 + Math.sin(Math.PI * 0.44) * 42;
      ctx.beginPath();
      ctx.arc(ex, ey, 7, 0, TAU);
      ctx.fill();
      break;
    }
    case 'mount': {
      if (item.ref === 'none') {
        // 「无」：画个虚线圈示意
        ctx.strokeStyle = '#9aa7b8';
        ctx.lineWidth = 3;
        ctx.setLineDash([7, 6]);
        ctx.beginPath();
        ctx.arc(c, c, 32, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }
      // 坐骑：以「脚下」为锚，跟角色绘制里一样画法
      ctx.translate(c, c + 14);
      ctx.scale(fit(180), fit(180));
      drawMount(g, NOW, item.ref as MountId, {
        x: 0,
        feetY: 0,
        facing: 1,
        color: MOUNT_COLORS[item.ref as MountId] ?? 0xffd45c,
      });
      break;
    }
  }
}
