import { NET_X, PLAYER_H, RACKET_REACH, SHUTTLE_R } from './constants';
import { simulateTrajectory } from './physics';
import { homeX, racketPoint } from './simulation';
import type { PlayerInput, World } from './types';

export type Difficulty = 'easy' | 'normal' | 'hard';

const TUNING: Record<Difficulty, { error: number; reaction: number; leap: number; speed: number }> = {
  easy: { error: 150, reaction: 0.26, leap: 0.55, speed: 300 },
  normal: { error: 80, reaction: 0.16, leap: 0.75, speed: 400 },
  hard: { error: 30, reaction: 0.08, leap: 0.9, speed: 430 },
};

export class AIController {
  private difficulty: Difficulty;
  private errorTimer = 0;
  private errorOffset = 0;
  private reactionTimer = 0;
  private targetX: number;

  constructor(difficulty: Difficulty = 'normal', side: 0 | 1 = 1) {
    this.difficulty = difficulty;
    this.targetX = homeX(side);
  }

  setDifficulty(d: Difficulty): void {
    this.difficulty = d;
  }

  update(world: World, me: 0 | 1, dt: number): PlayerInput {
    const cfg = TUNING[this.difficulty];
    const p = world.players[me];
    const shuttle = world.shuttle;
    const input: PlayerInput = {
      left: false,
      right: false,
      jump: false,
      swing: false,
      down: false,
    };

    this.reactionTimer -= dt;
    this.errorTimer -= dt;
    if (this.errorTimer <= 0) {
      this.errorTimer = 0.45 + Math.random() * 0.5;
      this.errorOffset = (Math.random() * 2 - 1) * cfg.error;
    }

    const mySide = me === 0 ? -1 : 1;

    if (world.phase === 'serve') {
      if (world.server === me) {
        this.targetX = homeX(me);
        if (world.phaseTimer <= 0.05) input.swing = true;
      } else {
        this.targetX = homeX(me);
      }
    } else if (world.phase === 'rally' && shuttle.live) {
      const dir = shuttle.vx >= 0 ? 1 : -1;
      const traj = simulateTrajectory(shuttle.x, shuttle.y, shuttle.vx, shuttle.vy, dir);
      const incoming = mySide < 0 ? traj.landX < NET_X : traj.landX > NET_X;
      if (incoming) {
        if (this.reactionTimer <= 0) {
          this.reactionTimer = cfg.reaction;
          const side = me === 0 ? -1 : 1;
          let tx = traj.landX + this.errorOffset;
          if (side < 0) tx = Math.min(tx, NET_X - 40);
          else tx = Math.max(tx, NET_X + 40);
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

    // decide whether to leap for a high shuttle
    if (shuttle.live && world.phase === 'rally') {
      const headY = p.y - PLAYER_H;
      const near = Math.abs(shuttle.x - p.x) < 90;
      const high = shuttle.y < headY - 10 && shuttle.y > headY - 190;
      if (near && high && p.onGround && Math.random() < cfg.leap) input.jump = true;
    }

    // swing when the shuttle is within reach
    if (shuttle.live && world.phase !== 'gameover') {
      const r = racketPoint(p);
      const d = Math.hypot(shuttle.x - r.x, shuttle.y - r.y);
      if (d < RACKET_REACH * 0.92 + SHUTTLE_R) input.swing = true;
    }

    return input;
  }
}
