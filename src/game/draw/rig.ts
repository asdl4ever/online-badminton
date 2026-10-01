import Phaser from 'phaser';
import { PLAYER_H, SHOULDER_DX, SHOULDER_DY } from '../constants';
import type { Cosmetic } from '../cosmetics';
import { FONT_EMOJI, P } from '../theme';
import { drawCharacter } from './character';
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
  // identical to the match scene's face: centred origin, emoji font
  const face = scene.add
    .text(0, 0, '', { fontFamily: FONT_EMOJI, fontSize: '34px' })
    .setOrigin(0.5)
    .setDepth(6)
    .setVisible(false);

  return {
    face,
    draw(g, now, cos, pose, rx, ry, swingSpeed = 0, contactR = 0) {
      const shoulder = {
        x: pose.x + pose.facing * SHOULDER_DX,
        y: pose.feetY - PLAYER_H * SHOULDER_DY,
      };
      const head = { x: shoulder.x + rx, y: shoulder.y + ry };
      const ang = Math.atan2(head.y - shoulder.y, head.x - shoulder.x);

      // swing trail arc, same thresholds as the match
      const hot = Math.min(1, swingSpeed / 1400);
      if (hot > 0.08) {
        const reach = Math.hypot(head.x - shoulder.x, head.y - shoulder.y);
        g.lineStyle(6 + 10 * hot, cos.trail, 0.18 + 0.3 * hot);
        g.beginPath();
        g.arc(shoulder.x, shoulder.y, reach, ang - 0.55, ang, false, 0);
        g.strokePath();
      }

      drawCharacter(g, now, cos, {
        x: pose.x,
        feetY: pose.feetY,
        facing: pose.facing,
        color: pose.color,
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
    },
  };
}
