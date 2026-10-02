import type Phaser from 'phaser';
import { PLAYER_H, SHOULDER_DX, SHOULDER_DY } from '../constants';
import { SWING_TRAIL_COLORS, type Cosmetic, type SwingTrailId } from '../cosmetics';
import { FONT_EMOJI, P } from '../theme';
import { drawCharacter, type FaceSink } from './character';
import { drawRacketHead, racketFrameColor } from './racket';

/**
 * The shared player rig: emoji face + body + arm + racket, drawn exactly the
 * way the match scene draws them, so every mode's character looks identical.
 *
 * One rig per character per scene (the face is a Text object driven from
 * outside, so it cannot live inside a Graphics command buffer).
 */
export interface RigPose {
  x: number;
  feetY: number;
  facing: 1 | -1;
  /** body colour */
  color: number;
  /** U熊肚皮的果冻形变（0 = 静止），见 `CharacterPose.belly` */
  belly?: number;
}

export interface PlayerRig {
  /** the emoji face; hide it manually for characters with no emoji */
  face: Phaser.GameObjects.Text;
  /**
   * Draw the whole character. rx/ry is the racket-head offset from the
   * shoulder (same values the RacketTracker produces), swingSpeed drives the
   * swing trail arc, contactR optionally draws the sweet-spot ring.
   */
  draw(
    g: Phaser.GameObjects.Graphics,
    now: number,
    cos: Cosmetic,
    pose: RigPose,
    rx: number,
    ry: number,
    swingSpeed?: number,
    contactR?: number,
  ): { shoulder: { x: number; y: number }; head: { x: number; y: number }; ang: number };
}

export function createPlayerRig(scene: Phaser.Scene): PlayerRig {
  // identical to the match scene's face: centred origin, emoji font.
  // depth 3 = 在角色身体层（场景里 charG 通常是 depth 2）**之上**：
  // 头永远露在身体上面，不会被身体/装备盖住。
  const face = scene.add
    .text(0, 0, '', { fontFamily: FONT_EMOJI, fontSize: '34px' })
    .setOrigin(0.5)
    .setDepth(3)
    .setVisible(false);

  return {
    face,
    draw: (g, now, cos, pose, rx, ry, swingSpeed = 0, contactR = 0) =>
      drawRigGraphics(g, now, cos, pose, rx, ry, swingSpeed, contactR, face),
  };
}

/**
 * The rig's graphics only — no Phaser scene needed, so non-Phaser renderers
 * (e.g. the world map's plain `<canvas>`, see `canvas2d.ts`) can reuse the exact
 * same arm/racket/character drawing. `face` is the object that receives the
 * emoji text; pass `null` to let the body's own face circle show instead.
 */
export function drawRigGraphics(
  g: Phaser.GameObjects.Graphics,
  now: number,
  cos: Cosmetic,
  pose: RigPose,
  rx: number,
  ry: number,
  swingSpeed = 0,
  contactR = 0,
  face: FaceSink | null = null,
): { shoulder: { x: number; y: number }; head: { x: number; y: number }; ang: number } {
  const shoulder = {
    x: pose.x + pose.facing * SHOULDER_DX,
    y: pose.feetY - PLAYER_H * SHOULDER_DY,
  };
  const head = { x: shoulder.x + rx, y: shoulder.y + ry };
  const ang = Math.atan2(head.y - shoulder.y, head.x - shoulder.x);

  // swing trail arc, same thresholds as the match
  const hot = Math.min(1, swingSpeed / 1400);
  drawSwingTrail(g, now, cos, shoulder.x, shoulder.y, head.x, head.y, ang, hot);

  drawCharacter(g, now, cos, {
    x: pose.x,
    feetY: pose.feetY,
    facing: pose.facing,
    color: pose.color,
    belly: pose.belly,
  }, { face });

  // arm from shoulder to just behind the racket head
  const hx = head.x - Math.cos(ang) * 12;
  const hy = head.y - Math.sin(ang) * 12;
  g.lineStyle(6, P.skin, 1);
  g.lineBetween(shoulder.x, shoulder.y, hx, hy);

  const skin = cos.racketSkin;
  const frameColor = racketFrameColor(skin, cos.racket);
  g.save();
  g.translateCanvas(head.x, head.y);
  g.rotateCanvas(ang);
  drawRacketHead(g, now, skin, frameColor);
  g.restore();

  if (contactR > 0 && hot > 0.15) {
    g.lineStyle(2, frameColor, 0.12 + 0.28 * hot);
    g.strokeCircle(head.x, head.y, contactR);
  }

  return { shoulder, head, ang };
}

/**
 * 挥拍拖尾：球拍挥动时那条弧线的绘制。`cos.swingTrail` 为 'none' 时回退成
 * 按挥拍速度上色的普通弧线（旧观感）。比赛场景与网页预览（canvas2d）共用。
 */
export function drawSwingTrail(
  g: Phaser.GameObjects.Graphics,
  now: number,
  cos: Cosmetic,
  sx: number,
  sy: number,
  hx: number,
  hy: number,
  ang: number,
  hot: number,
): void {
  if (hot <= 0.08) return;
  const style: SwingTrailId = cos.swingTrail ?? 'none';
  const reach = Math.hypot(hx - sx, hy - sy);

  if (style === 'none') {
    g.lineStyle(6 + 10 * hot, cos.trail, 0.18 + 0.3 * hot);
    g.beginPath();
    g.arc(sx, sy, reach, ang - 0.55, ang, false, 0);
    g.strokePath();
    return;
  }

  const color = SWING_TRAIL_COLORS[style];
  const a0 = ang - 0.55;
  const a1 = ang;
  const pt = (f: number, r = reach) => ({
    x: sx + Math.cos(a0 + (a1 - a0) * f) * r,
    y: sy + Math.sin(a0 + (a1 - a0) * f) * r,
  });
  const stroke = (pts: { x: number; y: number }[]): void => {
    if (pts.length < 2) return;
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.strokePath();
  };
  const arcAt = (r: number, w: number, c: number, a: number): void => {
    g.lineStyle(w, c, a);
    g.beginPath();
    g.arc(sx, sy, r, a0, a1, false, 0);
    g.strokePath();
  };
  const samples = (fr: (f: number) => number, n = 12): { x: number; y: number }[] => {
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i <= n; i++) out.push(pt(i / n, fr(i / n)));
    return out;
  };

  switch (style) {
    case 'slash': {
      arcAt(reach, 10 + 10 * hot, color, 0.16 + 0.3 * hot);
      arcAt(reach, 3 + 4 * hot, 0xffffff, 0.3 + 0.45 * hot);
      break;
    }
    case 'atomic': {
      // 原子吐息：三层电蓝能量弧 + 翻涌的白芯，像哥斯拉的吐息扫过
      arcAt(reach, 13 + 9 * hot, 0x123a4a, 0.45 + 0.3 * hot);
      for (let k = 0; k < 3; k++) {
        arcAt(reach - k * 5, 4 - k, color, (0.42 - k * 0.1) * (0.6 + hot));
      }
      arcAt(reach + 2, 2 + 2 * hot, 0xffffff, 0.25 + 0.5 * hot);
      break;
    }
    case 'tempo': {
      // 节拍器：主弧 + 均匀刻度短线，像节拍器摆杆上的一格格刻度
      arcAt(reach, 7 + 6 * hot, color, 0.4 + 0.3 * hot);
      for (let k = 1; k <= 5; k++) {
        const a = a0 + (a1 - a0) * (k / 6);
        g.lineStyle(2, 0xffffff, 0.3 + 0.4 * hot);
        g.lineBetween(
          sx + Math.cos(a) * (reach - 6),
          sy + Math.sin(a) * (reach - 6),
          sx + Math.cos(a) * (reach + 6 + k * hot * 2),
          sy + Math.sin(a) * (reach + 6 + k * hot * 2),
        );
      }
      break;
    }
    case 'shock': {
      for (let k = 0; k < 3; k++) arcAt(reach + k * 7, 5 - k, color, (0.34 - 0.09 * k) * (0.5 + hot));
      break;
    }
    case 'cyclone': {
      stroke(samples((f) => reach + Math.sin(f * Math.PI * 3) * 11));
      arcAt(reach, 2, 0xffffff, 0.2 + 0.3 * hot);
      break;
    }
    case 'afterimage': {
      for (let k = 0; k < 3; k++) {
        g.lineStyle(6 - k, color, (0.3 - 0.08 * k) * (0.6 + hot));
        g.beginPath();
        g.arc(sx, sy, reach, a0 - 0.13 * k, a1 - 0.13 * k, false, 0);
        g.strokePath();
      }
      break;
    }
    case 'bolt': {
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= 10; i++) {
        const jitter = i % 2 === 0 ? 7 : -7;
        pts.push(pt(i / 10, reach + jitter * (0.4 + hot)));
      }
      g.lineStyle(6, color, 0.18 + 0.2 * hot);
      stroke(pts);
      g.lineStyle(2, 0xffffff, 0.5 + 0.4 * hot);
      stroke(pts);
      break;
    }
    case 'blaze': {
      arcAt(reach, 6 + 8 * hot, 0xff7a2a, 0.2 + 0.3 * hot);
      arcAt(reach, 3 + 3 * hot, 0xffe08a, 0.25 + 0.4 * hot);
      for (let i = 0; i <= 6; i++) {
        const f = i / 6;
        const jitter = ((i * 37) % 11) / 11 - 0.5;
        const base = pt(f, reach);
        const tip = pt(f, reach + 12 + 14 * hot + jitter * 12);
        g.fillStyle(0xff9a3c, 0.3 + 0.4 * hot);
        g.fillTriangle(base.x, base.y, tip.x, tip.y, base.x + 4, base.y + 4);
      }
      break;
    }
    case 'frostbite': {
      arcAt(reach, 3 + 3 * hot, 0xffffff, 0.3 + 0.4 * hot);
      arcAt(reach, 5, color, 0.2 + 0.25 * hot);
      for (let i = 0; i <= 6; i++) {
        const p = pt(i / 6, reach + 3);
        g.fillStyle(0xdcf4ff, 0.5 + 0.4 * hot);
        g.fillCircle(p.x, p.y, 2 + 2 * hot);
      }
      break;
    }
    case 'orbit': {
      arcAt(reach, 2 + 2 * hot, color, 0.25 + 0.3 * hot);
      for (let i = 0; i < 5; i++) {
        const f = (i / 5 + (now / 900) % 1) % 1;
        const p = pt(f, reach);
        g.fillStyle(0xfff2b0, 0.6 + 0.4 * hot);
        g.fillCircle(p.x, p.y, 1.5 + 2.5 * hot);
      }
      break;
    }
    case 'wave': {
      stroke(samples((f) => reach + Math.sin(f * Math.PI * 6 + now / 120) * 6));
      arcAt(reach, 2, color, 0.3 + 0.3 * hot);
      break;
    }
    case 'thorn': {
      arcAt(reach, 3 + 3 * hot, color, 0.3 + 0.35 * hot);
      for (let i = 0; i <= 7; i++) {
        const f = i / 7;
        const base = pt(f, reach);
        const tip = pt(f, reach + 9 + 9 * hot);
        g.lineStyle(2, color, 0.4 + 0.3 * hot);
        g.lineBetween(base.x, base.y, tip.x, tip.y);
      }
      break;
    }
    case 'prism': {
      const segs = [0xff8ad4, 0xffd45c, 0x8fe0ff, 0x9fe8b0];
      for (let k = 0; k < segs.length; k++) {
        g.lineStyle(7 + 5 * hot, segs[k], 0.2 + 0.3 * hot);
        g.beginPath();
        g.arc(
          sx, sy, reach,
          a0 + ((a1 - a0) * k) / segs.length,
          a0 + ((a1 - a0) * (k + 1)) / segs.length,
          false, 0,
        );
        g.strokePath();
      }
      break;
    }
    case 'voidcut': {
      arcAt(reach, 12 + 10 * hot, 0x1a0b2e, 0.4 + 0.3 * hot);
      arcAt(reach, 3 + 3 * hot, color, 0.5 + 0.4 * hot);
      arcAt(reach + 6, 2, 0xffffff, 0.3 + 0.3 * hot);
      break;
    }
  }
}
