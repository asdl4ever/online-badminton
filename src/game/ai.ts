import { NET_TOP, NET_X, PLAYER_H } from './constants';
import { clamp, simulateTrajectory } from './physics';
import { homeX, shoulderPoint } from './simulation';
import type { PlayerInput, World } from './types';

export type Difficulty = 'easy' | 'normal' | 'hard';

interface Tuning {
  posError: number;
  reaction: number;
  aimError: number;
  contactError: number;
  speedScale: number;
}

const TUNING: Record<Difficulty, Tuning> = {
  easy: { posError: 160, reaction: 0.26, aimError: 0.42, contactError: 72, speedScale: 0.78 },
  normal: { posError: 95, reaction: 0.16, aimError: 0.22, contactError: 38, speedScale: 0.9 },
  hard: { posError: 32, reaction: 0.08, aimError: 0.07, contactError: 8, speedScale: 1.0 },
};

const SWING_COMMIT = 0.14;

function readyInput(facing: 1 | -1): PlayerInput {
  return {
    left: false,
    right: false,
    jump: false,
    rx: 44 * facing,
    ry: -70,
    rvx: 0,
    rvy: 0,
  };
}

export class AIController {
  private difficulty: Difficulty;
  private errorTimer = 0;
  private errorOffset = 0;
  private reactionTimer = 0;
  private targetX: number;
  private swingTimer = 0;
  private swing: { rx: number; ry: number; rvx: number; rvy: number } | null = null;

  constructor(difficulty: Difficulty = 'normal', side: 0 | 1 = 1) {
    this.difficulty = difficulty;
    this.targetX = homeX(side);
  }

  setDifficulty(d: Difficulty): void {
    this.difficulty = d;
  }

  update(world: World, me: 0 | 1, dt: number): PlayerInput {
    const tune = TUNING[this.difficulty];
    const wc = world.config;
    const p = world.players[me];
    const shuttle = world.shuttle;
    const dir = p.facing;
    const mySide = me === 0 ? -1 : 1;
    const input = readyInput(dir);

    this.reactionTimer -= dt;
    this.errorTimer -= dt;
    if (this.errorTimer <= 0) {
      this.errorTimer = 0.45 + Math.random() * 0.5;
      this.errorOffset = (Math.random() * 2 - 1) * tune.posError;
    }

    // --- where should the body go -----------------------------------------
    if (world.mode === 'juggle') {
      this.targetX = world.juggle.turn === me ? shuttle.x : homeX(me);
    } else if (world.phase === 'serve') {
      this.targetX = homeX(me);
    } else if (world.phase === 'rally' && shuttle.live) {
      const travel = shuttle.vx >= 0 ? 1 : -1;
      const traj = simulateTrajectory(shuttle.x, shuttle.y, shuttle.vx, shuttle.vy, travel, wc);
      const incoming = mySide < 0 ? traj.landX < NET_X : traj.landX > NET_X;
      if (incoming) {
        if (this.reactionTimer <= 0) {
          this.reactionTimer = tune.reaction;
          let tx = traj.landX + this.errorOffset;
          tx = mySide < 0 ? Math.min(tx, NET_X - 40) : Math.max(tx, NET_X + 40);
          this.targetX = tx;
        }
      } else {
        this.targetX = homeX(me);
      }
    } else {
      this.targetX = homeX(me);
    }

    const dx = this.targetX - p.x;
    if (dx > 12) input.right = true;
    else if (dx < -12) input.left = true;

    // --- juggle challenge: keep the shuttle up, never let it drop ---------
    if (world.mode === 'juggle') {
      if (world.juggle.turn !== me || world.phase !== 'rally') {
        input.left = false;
        input.right = false;
        return input;
      }
      const sh = shoulderPoint(p);
      const sdx = shuttle.x - sh.x;
      const sdy = shuttle.y - sh.y;
      const dist = Math.hypot(sdx, sdy);
      if (dist < 180) {
        const reach = Math.min(dist, wc.racketMax);
        input.rx = dist > 1 ? (sdx / dist) * reach : 0;
        input.ry = dist > 1 ? (sdy / dist) * reach : -reach;
        input.rvx = dir * 120;
        input.rvy = -950;
        input.left = false;
        input.right = false;
      }
      return input;
    }

    // --- serve ------------------------------------------------------------
    if (world.phase === 'serve') {
      if (world.server === me && world.phaseTimer < 0.2) {
        const speed = wc.serveSpeedMin + 220;
        input.rvx = dir * speed * Math.cos(0.68);
        input.rvy = -speed * Math.sin(0.68);
      }
      return input;
    }

    // --- racket -----------------------------------------------------------
    if (world.phase === 'rally' && shuttle.live) {
      const sh = shoulderPoint(p);
      const sdx = shuttle.x - sh.x;
      const sdy = shuttle.y - sh.y;
      const dist = Math.hypot(sdx, sdy);

      if (p.onGround && shuttle.y < p.y - PLAYER_H * 0.95 && dist < 190 && Math.random() < 0.5) {
        input.jump = true;
      }

      const incoming = mySide < 0 ? shuttle.x < NET_X : shuttle.x > NET_X;

      if (this.swingTimer > 0 && this.swing) {
        this.swingTimer -= dt;
        input.rx = this.swing.rx;
        input.ry = this.swing.ry;
        input.rvx = this.swing.rvx;
        input.rvy = this.swing.rvy;
        input.left = false;
        input.right = false;
        return input;
      }

      if (incoming && dist > 1 && dist < 150) {
        const high = shuttle.y < NET_TOP - 30;
        const nearNet = Math.abs(p.x - NET_X) < 340;
        let elevation: number;
        let speed: number;
        if (high && nearNet) {
          elevation = -0.16;
          speed = 1950;
        } else if (high) {
          elevation = 0.62;
          speed = 1380;
        } else if (shuttle.y > NET_TOP + 55) {
          elevation = 0.85;
          speed = 1240;
        } else {
          elevation = 0.22;
          speed = 1320;
        }
        elevation += (Math.random() * 2 - 1) * tune.aimError;
        speed *= tune.speedScale * (1 + (Math.random() * 2 - 1) * 0.12);
        elevation = clamp(elevation, wc.aimMin, wc.aimMax);

        const reach = Math.min(dist, wc.racketMax);
        const err = tune.contactError;
        const rx = (sdx / dist) * reach + (Math.random() * 2 - 1) * err;
        const ry = (sdy / dist) * reach + (Math.random() * 2 - 1) * err;
        this.swing = {
          rx,
          ry,
          rvx: dir * speed * Math.cos(elevation),
          rvy: -speed * Math.sin(elevation),
        };
        this.swingTimer = SWING_COMMIT;
        input.rx = this.swing.rx;
        input.ry = this.swing.ry;
        input.rvx = this.swing.rvx;
        input.rvy = this.swing.rvy;
        input.left = false;
        input.right = false;
        return input;
      }
    }

    return input;
  }
}
