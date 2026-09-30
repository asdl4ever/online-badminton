import { DEFAULT_CONFIG, type WorldConfig } from './config';

export interface RacketState {
  rx: number;
  ry: number;
  rvx: number;
  rvy: number;
}

/**
 * Turns raw pointer movement into a racket head offset + velocity.
 *
 * The racket head is pinned to the pointer but cannot leave RACKET_MAX of the
 * shoulder. Velocity is differentiated from frame-to-frame movement, with a
 * teleport guard so that lifting the mouse to re-centre does not register as a
 * monster swing.
 */
export class RacketTracker {
  private prevOx = 0;
  private prevOy = 0;
  private has = false;
  private svx = 0;
  private svy = 0;

  reset(): void {
    this.has = false;
    this.svx = 0;
    this.svy = 0;
  }

  update(
    targetX: number,
    targetY: number,
    shoulderX: number,
    shoulderY: number,
    dt: number,
    freezeVelocity = false,
    cfg: WorldConfig = DEFAULT_CONFIG,
  ): RacketState {
    let ox = targetX - shoulderX;
    let oy = targetY - shoulderY;
    const d = Math.hypot(ox, oy);
    if (d > cfg.racketMax) {
      ox = (ox / d) * cfg.racketMax;
      oy = (oy / d) * cfg.racketMax;
    }

    // Differentiate the *offset*, not the world position, so simply running
    // sideways does not count as a swing.
    let vx = 0;
    let vy = 0;
    if (!freezeVelocity && this.has && dt > 1e-4) {
      const mx = ox - this.prevOx;
      const my = oy - this.prevOy;
      if (Math.hypot(mx, my) <= cfg.racketTeleport) {
        vx = mx / dt;
        vy = my / dt;
      }
    }
    const sp = Math.hypot(vx, vy);
    if (sp > cfg.racketSpeedCap) {
      vx = (vx / sp) * cfg.racketSpeedCap;
      vy = (vy / sp) * cfg.racketSpeedCap;
    }
    if (freezeVelocity) {
      this.svx = 0;
      this.svy = 0;
    } else {
      this.svx += (vx - this.svx) * cfg.racketSmooth;
      this.svy += (vy - this.svy) * cfg.racketSmooth;
    }
    this.prevOx = ox;
    this.prevOy = oy;
    this.has = true;

    return { rx: ox, ry: oy, rvx: this.svx, rvy: this.svy };
  }
}
