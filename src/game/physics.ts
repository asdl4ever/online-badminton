import { COURT_LEFT, COURT_RIGHT, GROUND_Y, NET_TOP, NET_X } from './constants';
import type { WorldConfig } from './config';
import type { ShotKind } from './types';

const SUB_DT = 1 / 240;

export interface Trajectory {
  landX: number;
  time: number;
  netY: number | null;
  clearedNet: boolean;
  out: boolean;
}

/**
 * Integrates a shuttle launch with quadratic air drag until it hits the
 * ground, leaves the field, or times out. Used by the AI to predict where a
 * shot is heading.
 */
export function simulateTrajectory(
  x0: number,
  y0: number,
  vx: number,
  vy: number,
  dir: 1 | -1,
  cfg: WorldConfig,
): Trajectory {
  let x = x0;
  let y = y0;
  let cvx = vx;
  let cvy = vy;
  let prevX = x;
  let t = 0;
  let netY: number | null = null;
  const far = 160;
  const limit = dir > 0 ? COURT_RIGHT + far : COURT_LEFT - far;

  for (let i = 0; i < 240 * 8; i++) {
    prevX = x;
    const speed = Math.hypot(cvx, cvy);
    const drag = cfg.shuttleDrag * speed;
    cvx -= cvx * drag * SUB_DT;
    cvy -= cvy * drag * SUB_DT;
    cvy += cfg.shuttleGravity * SUB_DT;
    x += cvx * SUB_DT;
    y += cvy * SUB_DT;
    t += SUB_DT;

    if (
      netY === null &&
      ((prevX < NET_X && x >= NET_X) || (prevX > NET_X && x <= NET_X))
    ) {
      netY = y;
    }
    if (y >= GROUND_Y - cfg.shuttleR) {
      return { landX: x, time: t, netY, clearedNet: netY !== null && netY < NET_TOP, out: false };
    }
    if ((dir > 0 && x > limit) || (dir < 0 && x < limit)) {
      return { landX: x, time: t, netY, clearedNet: netY !== null && netY < NET_TOP, out: true };
    }
  }
  return { landX: x, time: t, netY, clearedNet: false, out: true };
}

export function mirroredTarget(x: number): number {
  return NET_X * 2 - x;
}

/**
 * Lowest elevation a shuttle may be released at from a given contact point so
 * that it can physically clear the net. Contacts above the net are free (you
 * can aim down and smash); the lower and closer to the net the contact, the
 * more the release is forced upward. Stops players from spiking the shuttle
 * straight into their own floor when scooping up a low ball.
 */
export function minReleaseFor(x: number, y: number, cfg: WorldConfig): number {
  if (!cfg.netEnabled) return cfg.aimMin;
  const dxNet = Math.max(Math.abs(NET_X - x), 6);
  const needY = NET_TOP - 10;
  if (y <= needY) return cfg.aimMin;
  const rise = y - needY;
  const geom = Math.atan2(rise, dxNet);
  return Math.min(cfg.aimMax, Math.max(cfg.aimMin, geom * 1.06 + 0.05));
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Coarse label used for hit feedback / audio. */
export function classifyShot(elevation: number): ShotKind {
  if (elevation < -0.1) return 'smash';
  if (elevation < 0.18) return 'drive';
  if (elevation < 0.72) return 'clear';
  return 'lift';
}
