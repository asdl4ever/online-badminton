import { RACKET_MAX, RACKET_SMOOTH, RACKET_SPEED_CAP, RACKET_TELEPORT } from './constants';

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
    mouseX: number,
    mouseY: number,
    shoulderX: number,
    shoulderY: number,
    dt: number,
  ): RacketState {
    let ox = mouseX - shoulderX;
    let oy = mouseY - shoulderY;
    const d = Math.hypot(ox, oy);
    if (d > RACKET_MAX) {
      ox = (ox / d) * RACKET_MAX;
      oy = (oy / d) * RACKET_MAX;
    }

    // Differentiate the *offset*, not the world position, so simply running
    // sideways does not count as a swing.
    let vx = 0;
    let vy = 0;
    if (this.has && dt > 1e-4) {
      const mx = ox - this.prevOx;
      const my = oy - this.prevOy;
      if (Math.hypot(mx, my) <= RACKET_TELEPORT) {
        vx = mx / dt;
        vy = my / dt;
      }
    }
    const sp = Math.hypot(vx, vy);
    if (sp > RACKET_SPEED_CAP) {
      vx = (vx / sp) * RACKET_SPEED_CAP;
      vy = (vy / sp) * RACKET_SPEED_CAP;
    }
    this.svx += (vx - this.svx) * RACKET_SMOOTH;
    this.svy += (vy - this.svy) * RACKET_SMOOTH;
    this.prevOx = ox;
    this.prevOy = oy;
    this.has = true;

    return { rx: ox, ry: oy, rvx: this.svx, rvy: this.svy };
  }
}
