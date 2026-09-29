import {
  COURT_LEFT,
  COURT_RIGHT,
  GROUND_Y,
  NET_TOP,
  NET_X,
  SHUTTLE_DRAG,
  SHUTTLE_GRAVITY,
  SHUTTLE_R,
} from './constants';
import type { ShotKind } from './types';

const DEG = Math.PI / 180;
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
 * ground, leaves the field, or times out. Used both by the aim solver and
 * by the AI's landing prediction.
 */
export function simulateTrajectory(
  x0: number,
  y0: number,
  vx: number,
  vy: number,
  dir: 1 | -1,
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
    const drag = SHUTTLE_DRAG * speed;
    cvx -= cvx * drag * SUB_DT;
    cvy -= cvy * drag * SUB_DT;
    cvy += SHUTTLE_GRAVITY * SUB_DT;
    x += cvx * SUB_DT;
    y += cvy * SUB_DT;
    t += SUB_DT;

    if (
      netY === null &&
      ((prevX < NET_X && x >= NET_X) || (prevX > NET_X && x <= NET_X))
    ) {
      netY = y;
    }
    if (y >= GROUND_Y - SHUTTLE_R) {
      return { landX: x, time: t, netY, clearedNet: netY !== null && netY < NET_TOP, out: false };
    }
    if ((dir > 0 && x > limit) || (dir < 0 && x < limit)) {
      return { landX: x, time: t, netY, clearedNet: netY !== null && netY < NET_TOP, out: true };
    }
  }
  return { landX: x, time: t, netY, clearedNet: false, out: true };
}

/**
 * Fixed-angle / solved-power aiming. Given a launch point and a target x on
 * the floor, binary-search the launch speed that lands the shuttle there.
 * This makes shots distance-correct from anywhere on the court.
 */
export function solveLaunchSpeed(
  x0: number,
  y0: number,
  targetX: number,
  angleDeg: number,
  dir: 1 | -1,
  maxSpeed = 2200,
): number {
  const cos = Math.cos(angleDeg * DEG) * dir;
  const sin = -Math.sin(angleDeg * DEG);
  const key = (v: number) => {
    const r = simulateTrajectory(x0, y0, cos * v, sin * v, dir);
    return dir > 0 ? r.landX * dir : r.landX * dir;
  };
  let lo = 120;
  let hi = maxSpeed;
  const want = targetX * dir;
  for (let i = 0; i < 34; i++) {
    const mid = (lo + hi) * 0.5;
    if (key(mid) < want) lo = mid;
    else hi = mid;
  }
  return (lo + hi) * 0.5;
}

export interface ShotSpec {
  angle: number;
  /** target x (left->right convention) when aimed normally */
  target: number;
  /** target x when the player holds "down" (drop / short) */
  shortTarget: number;
}

/**
 * Targets are expressed in "left attacking right" coordinates; they are
 * mirrored around the net for the other player.
 */
export const SHOT_TABLE: Record<ShotKind, ShotSpec> = {
  lift: { angle: 58, target: COURT_RIGHT - 60, shortTarget: COURT_RIGHT - 330 },
  drive: { angle: 30, target: COURT_RIGHT - 130, shortTarget: COURT_RIGHT - 380 },
  clear: { angle: 42, target: COURT_RIGHT - 30, shortTarget: COURT_RIGHT - 300 },
  smash: { angle: -8, target: COURT_RIGHT - 210, shortTarget: COURT_RIGHT - 420 },
  serve: { angle: 55, target: COURT_RIGHT - 110, shortTarget: COURT_RIGHT - 320 },
};

export const SHOT_SPEED_MIN = 480;

export function classifyShot(headY: number, shuttleY: number): ShotKind {
  const d = headY - shuttleY;
  if (d > -10) return shuttleY < NET_TOP - 20 ? 'smash' : 'clear';
  if (d > -70) return 'drive';
  return 'lift';
}

export function mirroredTarget(x: number): number {
  return NET_X * 2 - x;
}
