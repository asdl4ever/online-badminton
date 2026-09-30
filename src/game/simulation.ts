import {
  AIM_HARD_MAX,
  AIM_HARD_MIN,
  CONTACT_R,
  COURT_LEFT,
  COURT_RIGHT,
  GROUND_Y,
  HIT_COOLDOWN,
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
  SERVE_ARM_DELAY,
  SERVE_FORWARD_MIN,
  SERVE_NET_MARGIN,
  SERVE_PAUSE,
  SERVE_SPEED_MIN,
  SHOT_LAND_SLACK,
  SHOT_SPEED_GAIN,
  SHOT_SPEED_MAX,
  SHOT_SPEED_MIN,
  SHOULDER_DX,
  SHOULDER_DY,
  SHUTTLE_DRAG,
  SHUTTLE_GRAVITY,
  SHUTTLE_MAX_SPEED,
  SHUTTLE_R,
  WIN_SCORE,
} from './constants';
import { clamp, classifyShot, minReleaseFor } from './physics';
import type {
  PlayerInput,
  PlayerState,
  SimEvent,
  World,
  WorldSnapshot,
} from './types';

const SUB_DT = 1 / 240;

export function homeX(index: 0 | 1): number {
  return index === 0 ? NET_X - 300 : NET_X + 300;
}

export function makePlayer(index: 0 | 1): PlayerState {
  const facing: 1 | -1 = index === 0 ? 1 : -1;
  return {
    x: homeX(index),
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    onGround: true,
    facing,
    hitCooldown: 0,
    rx: 46 * facing,
    ry: -70,
    rvx: 0,
    rvy: 0,
  };
}

export function shoulderPoint(p: PlayerState): { x: number; y: number } {
  return { x: p.x + p.facing * SHOULDER_DX, y: p.y - PLAYER_H * SHOULDER_DY };
}

export function racketHead(p: PlayerState): { x: number; y: number } {
  const s = shoulderPoint(p);
  return { x: s.x + p.rx, y: s.y + p.ry };
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

function bounds(index: number, netMargin = 0): [number, number] {
  return index === 0
    ? [COURT_LEFT - PLAYER_MARGIN, NET_X - 30 - netMargin]
    : [NET_X + 30 + netMargin, COURT_RIGHT + PLAYER_MARGIN];
}

function stepPlayer(
  p: PlayerState,
  index: 0 | 1,
  input: PlayerInput,
  dt: number,
  /** extra distance from the net the player is not allowed to cross */
  netMargin = 0,
): void {
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const targetVx = dir * PLAYER_SPEED;
  const dv = PLAYER_ACCEL * dt;
  if (p.vx < targetVx) p.vx = Math.min(targetVx, p.vx + dv);
  else if (p.vx > targetVx) p.vx = Math.max(targetVx, p.vx - dv);
  p.x += p.vx * dt;

  const [lo, hi] = bounds(index, netMargin);
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

  p.rx = input.rx;
  p.ry = input.ry;
  p.rvx = input.rvx;
  p.rvy = input.rvy;
  if (p.hitCooldown > 0) p.hitCooldown -= dt;
}

export function stepPlayerLocal(
  p: PlayerState,
  index: 0 | 1,
  input: PlayerInput,
  dt: number,
  netMargin = 0,
): void {
  stepPlayer(p, index, input, dt, netMargin);
}

/**
 * Forward integration that returns where a launch starting at (x, y) with
 * velocity (vx, vy) would touch the floor. Mirrors the authoritative step
 * (same SUB_DT) so the prediction matches the real trajectory; it is only
 * used to size a launch, never to advance the shuttle.
 */
function predictLandingX(x: number, y: number, vx: number, vy: number): number {
  const dt = SUB_DT;
  const floor = GROUND_Y - SHUTTLE_R;
  for (let i = 0; i < 900; i++) {
    const s = Math.hypot(vx, vy);
    const drag = SHUTTLE_DRAG * s;
    vx -= vx * drag * dt;
    vy -= vy * drag * dt;
    vy += SHUTTLE_GRAVITY * dt;
    const sp = Math.hypot(vx, vy);
    if (sp > SHUTTLE_MAX_SPEED) {
      vx = (vx / sp) * SHUTTLE_MAX_SPEED;
      vy = (vy / sp) * SHUTTLE_MAX_SPEED;
    }
    x += vx * dt;
    y += vy * dt;
    if (y >= floor) return x;
  }
  return x;
}

/**
 * Scales a launch down (direction unchanged) until it lands no further than
 * `limit`. Landing distance grows monotonically with launch speed, so a short
 * bisection finds the largest power that still drops in.
 */
function trimShotToLand(
  x: number,
  y: number,
  launch: { vx: number; vy: number },
  limit: number,
  towardRight: boolean,
): void {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const land = predictLandingX(x, y, launch.vx * mid, launch.vy * mid);
    if (towardRight ? land > limit : land < limit) hi = mid;
    else lo = mid;
  }
  launch.vx *= lo;
  launch.vy *= lo;
}

/**
 * Converts the racket's motion into a shuttle launch.
 * Direction comes from where the racket is travelling, power from how fast.
 */
function releaseShuttle(world: World, index: 0 | 1): void {
  const p = world.players[index];
  const shuttle = world.shuttle;

  let vx = p.rvx;
  let vy = p.rvy;
  let raw = Math.hypot(vx, vy);
  if (raw < 1) {
    vx = p.facing;
    vy = 0;
    raw = 1;
  }

  // forward-relative elevation of the swing
  const forward = vx * p.facing;
  const up = -vy;
  let elevation: number;
  if (forward <= 0.05) elevation = up >= 0 ? Math.PI / 2 : -Math.PI / 2;
  else elevation = Math.atan2(up, forward);
  elevation = clamp(elevation, AIM_HARD_MIN, AIM_HARD_MAX);
  elevation = Math.max(elevation, minReleaseFor(shuttle.x, shuttle.y));

  const speed = clamp(raw * SHOT_SPEED_GAIN, SHOT_SPEED_MIN, SHOT_SPEED_MAX);

  shuttle.vx = p.facing * speed * Math.cos(elevation);
  shuttle.vy = -speed * Math.sin(elevation);

  // Trim the power so a full swing does not sail past the opponent's back
  // line. Only the host (authority) runs this and ships the resulting
  // velocity in its snapshot, so guests stay in sync automatically.
  const towardRight = p.facing > 0;
  const limit =
    (towardRight ? COURT_RIGHT : COURT_LEFT) + (towardRight ? SHOT_LAND_SLACK : -SHOT_LAND_SLACK);
  const predicted = predictLandingX(shuttle.x, shuttle.y, shuttle.vx, shuttle.vy);
  if (towardRight ? predicted > limit : predicted < limit) {
    trimShotToLand(shuttle.x, shuttle.y, shuttle, limit, towardRight);
  }

  shuttle.live = true;

  p.hitCooldown = HIT_COOLDOWN;
  world.lastHitter = index;
  world.rallyHits++;
  world.events.push({ type: 'hit', player: index, kind: classifyShot(elevation) });
}

function tryHit(
  world: World,
  index: 0 | 1,
  sample?: { x: number; y: number } | null,
): void {
  if (world.phase !== 'rally') return;
  const p = world.players[index];
  if (p.hitCooldown > 0) return;
  if (world.lastHitter === index) return;
  const head = racketHead(p);
  // `sample` lets the host judge a laggy swing against where the shuttle was
  // when that player actually saw it; the launch still happens from the
  // shuttle's real current position so nothing teleports
  const probe = sample ?? world.shuttle;
  const dx = probe.x - head.x;
  const dy = probe.y - head.y;
  if (dx * dx + dy * dy > CONTACT_R * CONTACT_R) return;
  releaseShuttle(world, index);
}

function startServe(world: World): void {
  world.phase = 'serve';
  world.phaseTimer = SERVE_PAUSE;
  world.rallyHits = 0;
  world.lastHitter = -1;
  for (let i = 0; i < 2; i++) {
    const p = world.players[i];
    p.x = homeX(i as 0 | 1);
    p.y = GROUND_Y;
    p.vx = 0;
    p.vy = 0;
    p.onGround = true;
    p.hitCooldown = 0;
    p.rvx = 0;
    p.rvy = 0;
    p.rx = 46 * p.facing;
    p.ry = -70;
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
  scorePoint(world, x < NET_X ? 1 : 0);
}

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

export function stepWorld(
  world: World,
  inputs: [PlayerInput, PlayerInput],
  dt: number,
  /** optional rewound shuttle positions used only for the contact test */
  hitSamples?: [{ x: number; y: number } | null, { x: number; y: number } | null],
): void {
  world.events.length = 0;
  world.time += dt;

  if (world.phase !== 'gameover') {
    // nobody may crowd the net while a serve is being set up
    const netMargin = world.phase === 'serve' ? SERVE_NET_MARGIN : 0;
    stepPlayer(world.players[0], 0, inputs[0], dt, netMargin);
    stepPlayer(world.players[1], 1, inputs[1], dt, netMargin);
  }

  if (world.phase === 'serve') {
    if (world.phaseTimer > 0) world.phaseTimer -= dt;
    const server = world.players[world.server];
    const head = racketHead(server);
    world.shuttle.x = head.x;
    world.shuttle.y = head.y;

    // A serve only fires on a deliberate swing: the racket must have settled
    // after the reset, and be travelling towards the opponent (or upwards).
    const armed = world.phaseTimer < SERVE_PAUSE - SERVE_ARM_DELAY;
    const racketSpeed = Math.hypot(server.rvx, server.rvy);
    const forward = server.rvx * server.facing;
    const aimed = forward > SERVE_FORWARD_MIN || server.rvy < 0;
    if (armed && aimed && racketSpeed >= SERVE_SPEED_MIN) {
      releaseShuttle(world, world.server);
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
    if (world.phase === 'rally') {
      tryHit(world, 0, hitSamples?.[0]);
      tryHit(world, 1, hitSamples?.[1]);
    }
  } else if (world.phase === 'point') {
    world.phaseTimer -= dt;
    if (world.phaseTimer <= 0) startServe(world);
  }
}

/**
 * One integration step of the shuttle, identical to what the authoritative sim
 * does. The guest runs this forward from each snapshot (dead reckoning) so the
 * ball it draws is not a filtered copy of a stale position.
 */
export function integrateShuttle(
  s: { x: number; y: number; vx: number; vy: number },
  dt: number,
): void {
  const speed = Math.hypot(s.vx, s.vy);
  const drag = SHUTTLE_DRAG * speed;
  s.vx -= s.vx * drag * dt;
  s.vy -= s.vy * drag * dt;
  s.vy += SHUTTLE_GRAVITY * dt;
  const sp = Math.hypot(s.vx, s.vy);
  if (sp > SHUTTLE_MAX_SPEED) {
    s.vx = (s.vx / sp) * SHUTTLE_MAX_SPEED;
    s.vy = (s.vy / sp) * SHUTTLE_MAX_SPEED;
  }
  s.x += s.vx * dt;
  s.y += s.vy * dt;
}

// ---- serialisation -------------------------------------------------------

export function serializeWorld(w: World, events?: SimEvent[]): WorldSnapshot {
  const pack = (p: PlayerState): number[] => [
    p.x,
    p.y,
    p.vx,
    p.vy,
    p.onGround ? 1 : 0,
    p.facing,
    p.hitCooldown,
    p.rx,
    p.ry,
    p.rvx,
    p.rvy,
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
    ev: events && events.length ? events : undefined,
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
    p.hitCooldown = src[6];
    p.rx = src[7];
    p.ry = src[8];
    p.rvx = src[9];
    p.rvy = src[10];
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
    a.hitCooldown = b.hitCooldown;
    a.rx = b.rx;
    a.ry = b.ry;
    a.rvx = b.rvx;
    a.rvy = b.rvy;
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
