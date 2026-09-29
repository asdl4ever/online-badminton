import {
  COURT_LEFT,
  COURT_RIGHT,
  GROUND_Y,
  NET_HALF_W,
  NET_TOP,
  NET_X,
  PLAYER_ACCEL,
  PLAYER_GRAVITY,
  PLAYER_H,
  PLAYER_JUMP_V,
  PLAYER_MARGIN,
  PLAYER_SPEED,
  POINT_PAUSE,
  RACKET_OFFSET_X,
  RACKET_OFFSET_Y,
  RACKET_REACH,
  SERVE_PAUSE,
  SHUTTLE_DRAG,
  SHUTTLE_GRAVITY,
  SHUTTLE_MAX_SPEED,
  SHUTTLE_R,
  SWING_ACTIVE_END,
  SWING_ACTIVE_START,
  SWING_COOLDOWN,
  SWING_DURATION,
  WIN_SCORE,
} from './constants';
import {
  SHOT_SPEED_MIN,
  SHOT_TABLE,
  classifyShot,
  mirroredTarget,
  solveLaunchSpeed,
} from './physics';
import type {
  PlayerInput,
  PlayerState,
  SimEvent,
  World,
  WorldSnapshot,
} from './types';

const SUB_DT = 1 / 240;

export function makePlayer(index: 0 | 1): PlayerState {
  const facing: 1 | -1 = index === 0 ? 1 : -1;
  return {
    x: homeX(index),
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    onGround: true,
    facing,
    swingTimer: 0,
    swingCooldown: 0,
    hitUsed: false,
  };
}

export function homeX(index: 0 | 1): number {
  return index === 0 ? NET_X - 300 : NET_X + 300;
}

export function racketPoint(p: PlayerState): { x: number; y: number } {
  return {
    x: p.x + p.facing * RACKET_OFFSET_X,
    y: p.y - PLAYER_H * RACKET_OFFSET_Y,
  };
}

export function createWorld(): World {
  return {
    shuttle: { x: NET_X, y: GROUND_Y - 300, vx: 0, vy: 0, live: false },
    players: [makePlayer(0), makePlayer(1)],
    score: [0, 0],
    server: 0,
    phase: 'serve',
    phaseTimer: SERVE_PAUSE,
    lastHitter: -1,
    winner: -1,
    time: 0,
    rallyHits: 0,
    events: [],
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function bounds(index: number): [number, number] {
  return index === 0
    ? [COURT_LEFT - PLAYER_MARGIN, NET_X - 30]
    : [NET_X + 30, COURT_RIGHT + PLAYER_MARGIN];
}

export function stepPlayerLocal(
  p: PlayerState,
  index: 0 | 1,
  input: PlayerInput,
  dt: number,
): void {
  stepPlayer(p, index, input, dt);
}

function stepPlayer(p: PlayerState, index: 0 | 1, input: PlayerInput, dt: number): void {
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const targetVx = dir * PLAYER_SPEED;
  const dv = PLAYER_ACCEL * dt;
  if (p.vx < targetVx) p.vx = Math.min(targetVx, p.vx + dv);
  else if (p.vx > targetVx) p.vx = Math.max(targetVx, p.vx - dv);
  p.x += p.vx * dt;

  const [lo, hi] = bounds(index);
  if (p.x < lo) {
    p.x = lo;
    p.vx = 0;
  } else if (p.x > hi) {
    p.x = hi;
    p.vx = 0;
  }

  if (input.jump && p.onGround) {
    p.vy = PLAYER_JUMP_V;
    p.onGround = false;
  }
  p.vy += PLAYER_GRAVITY * dt;
  p.y += p.vy * dt;
  if (p.y >= GROUND_Y) {
    p.y = GROUND_Y;
    p.vy = 0;
    p.onGround = true;
  }

  if (p.swingCooldown > 0) p.swingCooldown -= dt;
  if (p.swingTimer > 0) p.swingTimer = Math.max(0, p.swingTimer - dt);
  if (input.swing && p.swingTimer <= 0 && p.swingCooldown <= 0) {
    p.swingTimer = SWING_DURATION;
    p.swingCooldown = SWING_COOLDOWN;
    p.hitUsed = false;
  }
}

function swingActive(p: PlayerState): boolean {
  if (p.swingTimer <= 0) return false;
  const elapsed = SWING_DURATION - p.swingTimer;
  return elapsed >= SWING_ACTIVE_START && elapsed <= SWING_ACTIVE_END;
}

function applyHit(world: World, index: 0 | 1, kind: keyof typeof SHOT_TABLE, aimShort: boolean): void {
  const p = world.players[index];
  const shuttle = world.shuttle;
  const dir = p.facing;
  const spec = SHOT_TABLE[kind];

  let target = aimShort ? spec.shortTarget : spec.target;
  target += (Math.random() - 0.5) * 50;
  target = clamp(target, NET_X + 80, COURT_RIGHT - 20);
  const absoluteTarget = dir === 1 ? target : mirroredTarget(target);

  const r = racketPoint(p);
  const solved = solveLaunchSpeed(r.x, r.y, absoluteTarget, spec.angle, dir);
  const speed = Math.max(SHOT_SPEED_MIN, Math.min(solved, 2200));
  const rad = (spec.angle * Math.PI) / 180;

  shuttle.x = r.x;
  shuttle.y = r.y;
  shuttle.live = true;
  shuttle.vx = dir * speed * Math.cos(rad);
  shuttle.vy = -speed * Math.sin(rad);

  world.lastHitter = index;
  world.rallyHits++;
  world.events.push({ type: 'hit', player: index, kind });
}

function startServe(world: World): void {
  world.phase = 'serve';
  world.phaseTimer = SERVE_PAUSE;
  world.rallyHits = 0;
  for (let i = 0; i < 2; i++) {
    const p = world.players[i];
    p.x = homeX(i as 0 | 1);
    p.y = GROUND_Y;
    p.vx = 0;
    p.vy = 0;
    p.onGround = true;
    p.swingTimer = 0;
    p.swingCooldown = 0;
    p.hitUsed = false;
  }
  world.shuttle.live = false;
  world.shuttle.vx = 0;
  world.shuttle.vy = 0;
}

function scorePoint(world: World, scorer: number): void {
  world.score[scorer]++;
  world.server = scorer as 0 | 1;
  world.events.push({ type: 'point', scorer });
  if (world.score[scorer] >= WIN_SCORE) {
    world.phase = 'gameover';
    world.winner = scorer;
    world.phaseTimer = 0;
    world.events.push({ type: 'gameover', scorer });
  } else {
    world.phase = 'point';
    world.phaseTimer = POINT_PAUSE;
  }
}

function resolveLanding(world: World, x: number): void {
  const inBounds = x >= COURT_LEFT && x <= COURT_RIGHT;
  if (!inBounds || world.lastHitter < 0) {
    scorePoint(world, 1 - world.lastHitter);
    return;
  }
  const side = x < NET_X ? 0 : 1;
  scorePoint(world, 1 - side);
}

function stepHits(world: World): void {
  if (world.phase !== 'rally') return;
  for (let i = 0; i < 2; i++) {
    const p = world.players[i];
    if (p.hitUsed || !swingActive(p)) continue;
    if (world.lastHitter === i) continue;
    const r = racketPoint(p);
    const dx = world.shuttle.x - r.x;
    const dy = world.shuttle.y - r.y;
    const reach = RACKET_REACH + SHUTTLE_R;
    if (dx * dx + dy * dy > reach * reach) continue;
    const headY = p.y - PLAYER_H;
    const kind = classifyShot(headY, world.shuttle.y);
    const aimShort = p.facing === 1 ? p.vx < -40 : p.vx > 40;
    applyHit(world, i as 0 | 1, kind, aimShort);
    p.hitUsed = true;
  }
}

export function stepWorld(world: World, inputs: [PlayerInput, PlayerInput], dt: number): void {
  world.events.length = 0;
  world.time += dt;

  const frozen = world.phase === 'gameover';
  if (!frozen) {
    stepPlayer(world.players[0], 0, inputs[0], dt);
    stepPlayer(world.players[1], 1, inputs[1], dt);
  }

  if (world.phase === 'serve') {
    if (world.phaseTimer > 0) world.phaseTimer -= dt;
    const server = world.players[world.server];
    if (!world.shuttle.live) {
      const r = racketPoint(server);
      world.shuttle.x = r.x;
      world.shuttle.y = r.y;
    }
    if (swingActive(server)) {
      if (world.server === 0) {
        applyHit(world, 0, 'serve', false);
      } else {
        applyHit(world, 1, 'serve', false);
      }
      world.phase = 'rally';
      world.events.push({ type: 'serve', player: world.server });
    }
  } else if (world.phase === 'rally') {
    let remain = dt;
    while (remain > 1e-6) {
      const slice = Math.min(SUB_DT, remain);
      stepShuttleSlice(world, slice);
      remain -= slice;
      if (world.phase !== 'rally') break;
    }
    if (world.phase === 'rally') stepHits(world);
  } else if (world.phase === 'point') {
    world.phaseTimer -= dt;
    if (world.phaseTimer <= 0) startServe(world);
  }
}

/** one fixed slice of shuttle motion (keeps integration stable) */
function stepShuttleSlice(world: World, dt: number): void {
  const shuttle = world.shuttle;
  if (!shuttle.live) return;

  const prevX = shuttle.x;
  const s = Math.hypot(shuttle.vx, shuttle.vy);
  const drag = SHUTTLE_DRAG * s;
  shuttle.vx -= shuttle.vx * drag * dt;
  shuttle.vy -= shuttle.vy * drag * dt;
  shuttle.vy += SHUTTLE_GRAVITY * dt;
  const sp = Math.hypot(shuttle.vx, shuttle.vy);
  if (sp > SHUTTLE_MAX_SPEED) {
    shuttle.vx = (shuttle.vx / sp) * SHUTTLE_MAX_SPEED;
    shuttle.vy = (shuttle.vy / sp) * SHUTTLE_MAX_SPEED;
  }
  shuttle.x += shuttle.vx * dt;
  shuttle.y += shuttle.vy * dt;

  const crossedNet =
    (prevX < NET_X && shuttle.x >= NET_X) || (prevX > NET_X && shuttle.x <= NET_X);
  if (crossedNet && shuttle.y >= NET_TOP) {
    const side = prevX < NET_X ? -1 : 1;
    shuttle.x = NET_X + side * (NET_HALF_W + 1);
    shuttle.vx = -shuttle.vx * 0.15;
    shuttle.vy = Math.abs(shuttle.vy) * 0.25;
    world.events.push({ type: 'net' });
    return;
  }

  if (shuttle.y >= GROUND_Y - SHUTTLE_R) {
    shuttle.y = GROUND_Y - SHUTTLE_R;
    shuttle.live = false;
    world.events.push({ type: 'land', x: shuttle.x });
    resolveLanding(world, shuttle.x);
    return;
  }

  if (shuttle.x < COURT_LEFT - 200 || shuttle.x > COURT_RIGHT + 200) {
    shuttle.live = false;
    world.events.push({ type: 'land', x: shuttle.x });
    scorePoint(world, 1 - world.lastHitter);
    return;
  }
  if (shuttle.y < -900) {
    shuttle.y = -900;
    shuttle.vy = Math.abs(shuttle.vy) * 0.2;
  }
}

// ---- serialisation -------------------------------------------------------

export function serializeWorld(w: World): WorldSnapshot {
  const pack = (p: PlayerState): number[] => [
    p.x,
    p.y,
    p.vx,
    p.vy,
    p.onGround ? 1 : 0,
    p.facing,
    p.swingTimer,
    p.swingCooldown,
    p.hitUsed ? 1 : 0,
  ];
  return {
    s: [w.shuttle.x, w.shuttle.y, w.shuttle.vx, w.shuttle.vy, w.shuttle.live],
    p: [pack(w.players[0]), pack(w.players[1])],
    sc: [w.score[0], w.score[1]],
    sv: w.server,
    ph: w.phase,
    pt: w.phaseTimer,
    lh: w.lastHitter,
    w: w.winner,
    t: w.time,
    rh: w.rallyHits,
  };
}

export function applySnapshot(world: World, snap: WorldSnapshot): void {
  world.shuttle.x = snap.s[0];
  world.shuttle.y = snap.s[1];
  world.shuttle.vx = snap.s[2];
  world.shuttle.vy = snap.s[3];
  world.shuttle.live = !!snap.s[4];
  for (let i = 0; i < 2; i++) {
    const src = snap.p[i];
    const p = world.players[i];
    p.x = src[0];
    p.y = src[1];
    p.vx = src[2];
    p.vy = src[3];
    p.onGround = !!src[4];
    p.facing = src[5] as 1 | -1;
    p.swingTimer = src[6];
    p.swingCooldown = src[7];
    p.hitUsed = !!src[8];
  }
  world.score[0] = snap.sc[0];
  world.score[1] = snap.sc[1];
  world.server = snap.sv as 0 | 1;
  world.phase = snap.ph;
  world.phaseTimer = snap.pt;
  world.lastHitter = snap.lh;
  world.winner = snap.w;
  world.time = snap.t;
  world.rallyHits = snap.rh;
}

export function lerpWorld(dst: World, src: World, t: number): void {
  dst.shuttle.x += (src.shuttle.x - dst.shuttle.x) * t;
  dst.shuttle.y += (src.shuttle.y - dst.shuttle.y) * t;
  dst.shuttle.vx = src.shuttle.vx;
  dst.shuttle.vy = src.shuttle.vy;
  dst.shuttle.live = src.shuttle.live;
  for (let i = 0; i < 2; i++) {
    const a = dst.players[i];
    const b = src.players[i];
    a.x += (b.x - a.x) * t;
    a.y += (b.y - a.y) * t;
    a.vx = b.vx;
    a.vy = b.vy;
    a.onGround = b.onGround;
    a.facing = b.facing;
    a.swingTimer = b.swingTimer;
    a.swingCooldown = b.swingCooldown;
    a.hitUsed = b.hitUsed;
  }
  dst.score[0] = src.score[0];
  dst.score[1] = src.score[1];
  dst.server = src.server;
  if (dst.phase !== src.phase) {
    dst.events.push({
      type: src.phase === 'gameover' ? 'gameover' : 'point',
      scorer: src.phase === 'gameover' ? src.winner : undefined,
    });
  }
  dst.phase = src.phase;
  dst.phaseTimer = src.phaseTimer;
  dst.winner = src.winner;
  dst.time = src.time;
  dst.rallyHits = src.rallyHits;
}

export type { SimEvent };
