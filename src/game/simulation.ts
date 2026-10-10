import {
  COURT_LEFT,
  COURT_RIGHT,
  GROUND_Y,
  NET_HALF_W,
  NET_TOP,
  NET_X,
  PLAYER_H,
  PLAYER_MARGIN,
  SHOULDER_DX,
  SHOULDER_DY,
  STAMINA_HIT_DRAIN,
  STAMINA_JUMP_DRAIN,
  STAMINA_MAX,
  STAMINA_POINT_RECOVER,
  STAMINA_POWER_FLOOR,
  STAMINA_REGEN_MOVING,
  STAMINA_REGEN_STILL,
  STAMINA_RUN_DRAIN,
  STAMINA_SPEED_FLOOR,
} from './constants';
import {
  configFor,
  contactRadiusFor,
  DEFAULT_CONFIG,
  DEFAULT_OPTION_ID,
  JUGGLE_TURN_TIME,
  MACHINE_X,
  MACHINE_Y,
  modeFor,
  type WorldConfig,
  type WorldMode,
} from './config';
import { NEUTRAL_ATTRS, type PlayerAttrs } from './attrs';
import { clamp, classifyShot, minReleaseFor, netClearFloor, simulateTrajectory } from './physics';
import type {
  JuggleState,
  MachineState,
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

/** U熊肚皮的圆：中心离脚 `BELLY_CY`，半径 `BELLY_R`，弹性 `BELLY_REST` */
const BELLY_R = 28;
const BELLY_CY = 42;
const BELLY_REST = 0.92;

/**
 * 小黄龙：**整个身子都是果冻**——球撞上去软软地弹回去。
 * 弹性比 U熊肚皮小得多（掉一半多的速度），所以球弹回玩家半场时很慢、很好接，
 * 回合会被拖长，纯搞笑的趣味模式手感。
 */
const NAILONG_R = 40;
const NAILONG_CY = 52;
const NAILONG_REST = 0.42;

/** 老皮的钢铁屁股：hip 高度左右各一个钢板圆，钢铁弹性（几乎不掉速） */
const BUTT_R = 17;
const BUTT_OFF = 17;
const BUTT_CY = 26;
const BUTT_REST = 1.0;

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
    stamina: STAMINA_MAX,
  };
}

export function shoulderPoint(p: PlayerState): { x: number; y: number } {
  return { x: p.x + p.facing * SHOULDER_DX, y: p.y - PLAYER_H * SHOULDER_DY };
}

export function racketHead(p: PlayerState): { x: number; y: number } {
  const s = shoulderPoint(p);
  return { x: s.x + p.rx, y: s.y + p.ry };
}

function freshJuggle(): JuggleState {
  return { count: [0, 0], turn: 0, timeLeft: JUGGLE_TURN_TIME, done: [false, false] };
}

function freshMachine(): MachineState {
  return { timer: 1.2, feeds: 0, streak: 0, best: 0, returns: 0, misses: 0 };
}

export function createWorld(optionId: string = DEFAULT_OPTION_ID): World {
  const cfg = configFor(optionId);
  const mode: WorldMode = modeFor(optionId);
  const machine = freshMachine();
  return {
    shuttle: { x: NET_X, y: GROUND_Y - 300, vx: 0, vy: 0, live: false },
    players: [makePlayer(0), makePlayer(1)],
    score: [0, 0],
    server: 0,
    // the machine mode never enters serve/point: the feeder drives everything
    phase: mode === 'machine' ? 'rally' : 'serve',
    phaseTimer: mode === 'juggle' ? 1.6 : mode === 'machine' ? 0 : cfg.servePause,
    lastHitter: -1,
    winner: -1,
    time: 0,
    rallyHits: 0,
    events: [],
    config: cfg,
    configId: optionId,
    mode,
    // 装扮 / 属性由场景写进来（`GameScene` 按本地/对方的 cosmetic 与 attrs 同步）
    skins: ['none', 'none'],
    attrs: [{ ...NEUTRAL_ATTRS }, { ...NEUTRAL_ATTRS }],
    // 出球改造：只有单机/PvE 的招式会写它（见 ShotStyle），默认无
    shot: [null, null],
    juggle: freshJuggle(),
    machine,
  };
}

/** swap the world onto a different party option (keeps players where they are) */
export function setWorldOption(world: World, optionId: string): void {
  world.configId = optionId;
  world.config = configFor(optionId);
  world.mode = modeFor(optionId);
  world.juggle = freshJuggle();
  world.machine = freshMachine();
  world.score[0] = 0;
  world.score[1] = 0;
  world.winner = -1;
  world.rallyHits = 0;
  world.lastHitter = -1;
  world.shot[0] = null;
  world.shot[1] = null;
  world.shuttle.live = false;
  world.phase = world.mode === 'machine' ? 'rally' : 'serve';
  world.phaseTimer =
    world.mode === 'juggle' ? 1.6 : world.mode === 'machine' ? 0 : world.config.servePause;
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
  cfg: WorldConfig,
  /** 该玩家的属性倍率（速度加成让移动更快、体力加成让体力条更耐用） */
  attrs: PlayerAttrs = NEUTRAL_ATTRS,
  /** extra distance from the net the player is not allowed to cross */
  netMargin = 0,
  /** 体力系统只在正式对局生效（发球机 / 颠球挑战不消耗） */
  useStamina = true,
): void {
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  // 体力越低跑得越慢（最低六五折）：长回合追不到本来追得到的球
  const stam = useStamina ? clamp(p.stamina / STAMINA_MAX, 0, 1) : 1;
  // 「体力」属性：练得越高，同样的跑动 / 挥拍掉得越慢、回得越快
  const stamMul = useStamina ? Math.max(0.4, attrs.stamina) : 1;
  const speedFactor = STAMINA_SPEED_FLOOR + (1 - STAMINA_SPEED_FLOOR) * stam;
  const targetVx = dir * cfg.playerSpeed * attrs.speed * speedFactor;
  // 加速度同倍率放大，加速到顶速的时间不变，只是整体更快
  const dv = cfg.playerAccel * attrs.speed * speedFactor * dt;
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
    // 起跳高度固定（原来的「弹跳」维已换成体力，不再影响起跳）
    p.vy = cfg.playerJumpV;
    p.onGround = false;
    if (useStamina) p.stamina = Math.max(0, p.stamina - STAMINA_JUMP_DRAIN / stamMul);
  }

  // 体力结算：跑动消耗（按实际速度占比），不跑/慢走时缓缓恢复
  if (useStamina) {
    const runRatio = Math.min(1, Math.abs(p.vx) / Math.max(1, cfg.playerSpeed * attrs.speed));
    if (runRatio > 0.08) {
      p.stamina -= ((runRatio * STAMINA_RUN_DRAIN) / stamMul) * dt;
      p.stamina += STAMINA_REGEN_STILL * stamMul * STAMINA_REGEN_MOVING * dt;
    } else {
      p.stamina += STAMINA_REGEN_STILL * stamMul * dt;
    }
    p.stamina = clamp(p.stamina, 0, STAMINA_MAX);
  }
  p.vy += cfg.playerGravity * dt;
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
  cfg: WorldConfig = DEFAULT_CONFIG,
  attrs: PlayerAttrs = NEUTRAL_ATTRS,
  netMargin = 0,
): void {
  stepPlayer(p, index, input, dt, cfg, attrs, netMargin);
}

/**
 * Forward integration that returns where a launch starting at (x, y) with
 * velocity (vx, vy) would touch the floor. Mirrors the authoritative step
 * (same SUB_DT) so the prediction matches the real trajectory; it is only
 * used to size a launch, never to advance the shuttle.
 */
function predictLandingX(
  x: number,
  y: number,
  vx: number,
  vy: number,
  cfg: WorldConfig,
): number {
  const dt = SUB_DT;
  const floor = GROUND_Y - cfg.shuttleR;
  for (let i = 0; i < 900; i++) {
    const s = Math.hypot(vx, vy);
    const drag = cfg.shuttleDrag * s;
    vx -= vx * drag * dt;
    vy -= vy * drag * dt;
    vy += cfg.shuttleGravity * dt;
    const sp = Math.hypot(vx, vy);
    if (sp > cfg.shuttleMaxSpeed) {
      vx = (vx / sp) * cfg.shuttleMaxSpeed;
      vy = (vy / sp) * cfg.shuttleMaxSpeed;
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
  cfg: WorldConfig,
): void {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const land = predictLandingX(x, y, launch.vx * mid, launch.vy * mid, cfg);
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
  const cfg = world.config;
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
  // 🎯 招式出球改造：先强改仰角，再兜一条「至少要能过网」的下限——
  // 后场强行压平重杀 / 贴地搓球时不会被自己的网挡下来
  const style = world.shot[index];
  if (style?.elevation != null) {
    elevation = style.elevation;
    if (world.mode !== 'juggle') elevation = Math.max(elevation, netClearFloor(shuttle.x, shuttle.y, cfg));
  }
  elevation = clamp(elevation, cfg.aimMin, cfg.aimMax);
  // juggling is played straight up against no net, so skip the net-clear clamp
  if (world.mode !== 'juggle') {
    elevation = Math.max(elevation, minReleaseFor(shuttle.x, shuttle.y, cfg));
  }

  // 「力量」把击球力度整体放大（上限同步放宽，否则满级会顶到原来的天花板）；
  // 「技术」抬高下限——挥拍不到位时球质也不至于崩掉；
  // 体力低了打不出全力（杀球变「推球」），并扣掉这次击球的体力
  const attrs = world.attrs[index];
  const stam = clamp(p.stamina / STAMINA_MAX, 0, 1);
  const powerFactor = STAMINA_POWER_FLOOR + (1 - STAMINA_POWER_FLOOR) * stam;
  let speed = clamp(
    raw * cfg.shotSpeedGain * attrs.power * powerFactor,
    cfg.shotSpeedMin * attrs.skill,
    cfg.shotSpeedMax * attrs.power * powerFactor,
  );
  // 🎯 招式出球改造：速度倍率叠在属性倍率之后（贴网小球调慢、扑杀调快）
  if (style?.speedMul) speed *= style.speedMul;
  if (world.mode === 'match') {
    p.stamina = Math.max(0, p.stamina - STAMINA_HIT_DRAIN / Math.max(0.4, attrs.stamina));
  }

  shuttle.vx = p.facing * speed * Math.cos(elevation);
  shuttle.vy = -speed * Math.sin(elevation);

  // Trim the power so a full swing does not sail past the opponent's back
  // line. Only the host (authority) runs this and ships the resulting
  // velocity in its snapshot, so guests stay in sync automatically.
  if (world.mode !== 'juggle') {
    const towardRight = p.facing > 0;
    // 🎯 招式可以改「落点上限」：搓球收在网前、扑杀压在中前场
    let limit =
      style?.landWithin != null
        ? NET_X + p.facing * style.landWithin
        : (towardRight ? COURT_RIGHT : COURT_LEFT) + (towardRight ? cfg.shotLandSlack : -cfg.shotLandSlack);
    // 落点目标必须还在球的飞行方向前方，否则退回默认后场线，免得被裁成原地掉球
    if (towardRight ? limit <= shuttle.x + 30 : limit >= shuttle.x - 30) {
      limit = (towardRight ? COURT_RIGHT : COURT_LEFT) + (towardRight ? cfg.shotLandSlack : -cfg.shotLandSlack);
    }
    const predicted = predictLandingX(shuttle.x, shuttle.y, shuttle.vx, shuttle.vy, cfg);
    if (towardRight ? predicted > limit : predicted < limit) {
      trimShotToLand(shuttle.x, shuttle.y, shuttle, limit, towardRight, cfg);
    }
  }

  // 🎯 招式强改过仰角 / 收过落点之后，用**真实积分**复核过网（直线近似会低估重力下坠，
  // 裁速也会把过网点压低）：低于网顶 10px 就抬高仰角重试，最多 8 次。
  if (style?.elevation != null && world.mode !== 'juggle') {
    for (let i = 0; i < 8; i++) {
      const probe = simulateTrajectory(shuttle.x, shuttle.y, shuttle.vx, shuttle.vy, p.facing, cfg);
      if (probe.netY == null || probe.netY <= NET_TOP - 10) break;
      elevation = Math.min(cfg.aimMax, elevation + 0.06);
      shuttle.vx = p.facing * speed * Math.cos(elevation);
      shuttle.vy = -speed * Math.sin(elevation);
    }
  }

  shuttle.live = true;

  p.hitCooldown = cfg.hitCooldown;
  world.lastHitter = index;
  world.rallyHits++;
  if (world.mode === 'juggle') {
    world.juggle.count[index]++;
  } else {
    world.events.push({
      type: 'hit',
      player: index,
      kind: classifyShot(elevation),
      power: clamp(raw / cfg.racketSpeedCap, 0, 1),
    });
    if (world.mode === 'machine' && index === 0) {
      const m = world.machine;
      m.returns++;
      m.streak++;
      if (m.streak > m.best) m.best = m.streak;
    }
  }
}

function tryHit(
  world: World,
  index: 0 | 1,
  sample?: { x: number; y: number } | null,
): void {
  if (world.phase !== 'rally') return;
  if (world.mode === 'juggle' && world.juggle.turn !== index) return;
  const p = world.players[index];
  if (p.hitCooldown > 0) return;
  // a rally forbids hitting your own shot twice; juggling is exactly that
  if (world.lastHitter === index && world.mode !== 'juggle') return;
  const head = racketHead(p);
  // `sample` lets the host judge a laggy swing against where the shuttle was
  // when that player actually saw it; the launch still happens from the
  // shuttle's real current position so nothing teleports
  const probe = sample ?? world.shuttle;
  const dx = probe.x - head.x;
  const dy = probe.y - head.y;
  const reach = contactRadiusFor(world.config, world.attrs[index]);
  if (dx * dx + dy * dy > reach * reach) return;
  releaseShuttle(world, index);
}

function resetPlayer(world: World, index: 0 | 1): void {
  const p = world.players[index];
  p.x = homeX(index);
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

function startServe(world: World): void {
  world.phase = 'serve';
  world.phaseTimer = world.config.servePause;
  world.rallyHits = 0;
  world.lastHitter = -1;
  resetPlayer(world, 0);
  resetPlayer(world, 1);
  // 每分之间小回一口气：体力像「本局的预算」，长回合多了全场一起累
  // （回的多少同样看各自的「体力」属性）
  world.players.forEach((p, i) => {
    const mul = Math.max(0.4, world.attrs[i]?.stamina ?? 1);
    p.stamina = Math.min(STAMINA_MAX, p.stamina + STAMINA_POINT_RECOVER * mul);
  });
  world.shuttle.live = false;
  world.shuttle.vx = 0;
  world.shuttle.vy = 0;
}

/** toss the shuttle up so the current juggler can start their run */
function startJuggleTurn(world: World): void {
  const turn = world.juggle.turn;
  resetPlayer(world, turn);
  const p = world.players[turn];
  const s = world.shuttle;
  s.x = p.x + p.facing * 24;
  // tossed from racket height so the very first juggle needs no jump
  s.y = GROUND_Y - 130;
  s.vx = p.facing * 10;
  s.vy = -430;
  s.live = true;
  // the player may hit their own toss immediately, so clear the guard
  world.lastHitter = -1;
  world.phase = 'rally';
  world.phaseTimer = 0;
  world.juggle.timeLeft = JUGGLE_TURN_TIME;
}

function endJuggleTurn(world: World): void {
  const j = world.juggle;
  j.done[j.turn] = true;
  world.shuttle.live = false;
  const other = (1 - j.turn) as 0 | 1;
  if (!j.done[other]) {
    j.turn = other;
    startJuggleTurn(world);
    return;
  }
  const [a, b] = j.count;
  world.winner = a === b ? -1 : a > b ? 0 : 1;
  world.phase = 'gameover';
  world.phaseTimer = 0;
  world.events.push({ type: 'gameover', scorer: world.winner });
}

// ---- ball machine (offline practice) -------------------------------------

/**
 * Solve the launch speed that makes a feed at the config's fixed elevation land
 * on `targetX`. Range grows monotonically with speed at a fixed angle, so a
 * bisection is enough — and unlike solving for the *angle*, it cannot fall off
 * the far side of the 45° peak. Uses the same integrator the sim runs, so the
 * landing point genuinely matches.
 */
function solveFeedVelocity(
  fromX: number,
  fromY: number,
  targetX: number,
  cfg: WorldConfig,
): { vx: number; vy: number } {
  const dir: 1 | -1 = targetX < fromX ? -1 : 1;
  const cos = Math.cos(cfg.machineAngle);
  const sin = Math.sin(cfg.machineAngle);
  let lo = 80;
  let hi = cfg.shuttleMaxSpeed;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const land = simulateTrajectory(fromX, fromY, dir * mid * cos, -mid * sin, dir, cfg).landX;
    if (dir < 0 ? land <= targetX : land >= targetX) hi = mid;
    else lo = mid;
  }
  const v = (lo + hi) / 2;
  return { vx: dir * v * cos, vy: -v * sin };
}

function feedShuttle(world: World): void {
  const cfg = world.config;
  const s = world.shuttle;
  const p = world.players[0];
  rampMachineDifficulty(world);
  s.x = MACHINE_X;
  s.y = MACHINE_Y;

  const jitter = (Math.random() - 0.5) * 2 * cfg.machineSpread;
  const aimed = clamp(
    (cfg.machineAimAt ? p.x : NET_X - 260) + jitter,
    COURT_LEFT + 70,
    NET_X - 80,
  );
  const v = cfg.machineAimAt
    ? solveFeedVelocity(s.x, s.y, aimed, cfg)
    : {
        vx: -cfg.machineSpeed * Math.cos(cfg.machineAngle),
        vy: -cfg.machineSpeed * Math.sin(cfg.machineAngle),
      };
  s.vx = v.vx;
  s.vy = v.vy;
  s.live = true;

  // nobody has touched it yet, so a drop from here counts as a miss
  world.lastHitter = -1;
  world.machine.feeds++;
  world.events.push({ type: 'serve', player: 1 });
}

/**
 * The machine gets harder as the streak grows: faster feeds, tighter spacing,
 * wider placement. Scales off the *current* streak so a miss eases it back.
 */
function rampMachineDifficulty(world: World): void {
  const cfg = world.config;
  const n = Math.min(world.machine.streak, 120);
  cfg.machineInterval = Math.max(0.45, 1.1 - n * 0.006);
  cfg.machineSpeed = Math.min(2600, 1500 + n * 12);
  cfg.machineSpread = Math.min(430, 190 + n * 2.2);
  cfg.machineAngle = Math.min(0.5, 0.22 + n * 0.002);
}

/** the feeder's own clock: feed, let it play out, feed again */
function stepMachine(world: World, dt: number): void {
  const m = world.machine;
  if (world.shuttle.live) return;
  m.timer -= dt;
  if (m.timer <= 0) feedShuttle(world);
}

/** a fed ball died: either the player returned it, or they let it drop */
function onMachineLanding(world: World, x: number): void {
  const m = world.machine;
  const returned = world.lastHitter === 0 && x >= NET_X;
  if (!returned) {
    m.streak = 0;
    m.misses++;
  }
  m.timer = world.config.machineInterval;
  world.lastHitter = -1;
}

function scorePoint(world: World, scorer: number): void {
  const cfg = world.config;
  world.score[scorer]++;
  world.server = scorer as 0 | 1;
  world.events.push({ type: 'point', scorer });
  if (world.score[scorer] >= cfg.winScore) {
    world.phase = 'gameover';
    world.winner = scorer;
    world.phaseTimer = 0;
    world.events.push({ type: 'gameover', scorer });
  } else {
    world.phase = 'point';
    world.phaseTimer = cfg.pointPause;
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
  const cfg = world.config;

  const prevX = shuttle.x;
  const s = Math.hypot(shuttle.vx, shuttle.vy);
  const drag = cfg.shuttleDrag * s;
  shuttle.vx -= shuttle.vx * drag * dt;
  shuttle.vy -= shuttle.vy * drag * dt;
  shuttle.vy += cfg.shuttleGravity * dt;
  const sp = Math.hypot(shuttle.vx, shuttle.vy);
  if (sp > cfg.shuttleMaxSpeed) {
    shuttle.vx = (shuttle.vx / sp) * cfg.shuttleMaxSpeed;
    shuttle.vy = (shuttle.vy / sp) * cfg.shuttleMaxSpeed;
  }
  shuttle.x += shuttle.vx * dt;
  shuttle.y += shuttle.vy * dt;

  const crossedNet =
    (prevX < NET_X && shuttle.x >= NET_X) || (prevX > NET_X && shuttle.x <= NET_X);
  if (cfg.netEnabled && world.mode !== 'juggle' && crossedNet && shuttle.y >= NET_TOP) {
    // 发球机的喂球自己挂网：机器的失误，不算玩家失误、不清连击，快速重新喂球
    if (world.mode === 'machine' && world.lastHitter !== 0) {
      shuttle.live = false;
      world.machine.timer = 0.5;
      world.events.push({ type: 'net' });
      return;
    }
    const side = prevX < NET_X ? -1 : 1;
    shuttle.x = NET_X + side * (NET_HALF_W + 1);
    shuttle.vx = -shuttle.vx * 0.15;
    shuttle.vy = Math.abs(shuttle.vy) * 0.25;
    world.events.push({ type: 'net' });
    return;
  }

  // U熊的肚皮：球撞上来会被弹开（果冻式反弹，不掉速太多）
  for (let i = 0; i < 2; i++) {
    if (world.skins[i] !== 'ubear') continue;
    const p = world.players[i];
    const bx = p.x;
    const by = p.y - BELLY_CY;
    const dx = shuttle.x - bx;
    const dy = shuttle.y - by;
    const d = Math.hypot(dx, dy);
    const contact = BELLY_R + cfg.shuttleR;
    if (d >= contact) continue;
    const nx = d > 1e-3 ? dx / d : -p.facing;
    const ny = d > 1e-3 ? dy / d : -1;
    const vn = shuttle.vx * nx + shuttle.vy * ny;
    // 正在离开 / 只是擦过：不算撞击
    if (vn > -30) continue;
    shuttle.vx -= (1 + BELLY_REST) * vn * nx;
    shuttle.vy -= (1 + BELLY_REST) * vn * ny;
    // 推到肚皮表面外，免得下一小步又判定一次
    shuttle.x = bx + nx * (contact + 1);
    shuttle.y = by + ny * (contact + 1);
    world.events.push({ type: 'belly', player: i, power: clamp(-vn / 1400, 0, 1) });
  }

  // 小黄龙的果冻身子：球撞上来软软弹回去（和肚皮同一套，但弹性小得多）
  for (let i = 0; i < 2; i++) {
    if (world.skins[i] !== 'nailong') continue;
    const p = world.players[i];
    const bx = p.x;
    const by = p.y - NAILONG_CY;
    const dx = shuttle.x - bx;
    const dy = shuttle.y - by;
    const d = Math.hypot(dx, dy);
    const contact = NAILONG_R + cfg.shuttleR;
    if (d >= contact) continue;
    const nx = d > 1e-3 ? dx / d : -p.facing;
    const ny = d > 1e-3 ? dy / d : -1;
    const vn = shuttle.vx * nx + shuttle.vy * ny;
    // 正在离开 / 只是擦过：不算撞击
    if (vn > -30) continue;
    shuttle.vx -= (1 + NAILONG_REST) * vn * nx;
    shuttle.vy -= (1 + NAILONG_REST) * vn * ny;
    shuttle.x = bx + nx * (contact + 1);
    shuttle.y = by + ny * (contact + 1);
    world.events.push({ type: 'belly', player: i, power: clamp(-vn / 1400, 0, 1) });
  }

  // 老皮的钢铁屁股：球砸在钢板圆上直接弹开（比肚皮更弹）
  for (let i = 0; i < 2; i++) {
    if (world.skins[i] !== 'laopi') continue;
    const p = world.players[i];
    for (const off of [-BUTT_OFF, BUTT_OFF]) {
      const bx = p.x + off;
      const by = p.y - BUTT_CY;
      const dx = shuttle.x - bx;
      const dy = shuttle.y - by;
      const d = Math.hypot(dx, dy);
      const contact = BUTT_R + cfg.shuttleR;
      if (d >= contact) continue;
      const nx = d > 1e-3 ? dx / d : -p.facing;
      const ny = d > 1e-3 ? dy / d : -1;
      const vn = shuttle.vx * nx + shuttle.vy * ny;
      // 正在离开 / 只是擦过：不算撞击
      if (vn > -30) continue;
      shuttle.vx -= (1 + BUTT_REST) * vn * nx;
      shuttle.vy -= (1 + BUTT_REST) * vn * ny;
      // 推到钢板表面外，免得下一小步又判定一次
      shuttle.x = bx + nx * (contact + 1);
      shuttle.y = by + ny * (contact + 1);
      world.events.push({ type: 'belly', player: i, power: clamp(-vn / 1400, 0, 1) });
    }
  }

  if (shuttle.y >= GROUND_Y - cfg.shuttleR) {
    shuttle.y = GROUND_Y - cfg.shuttleR;
    shuttle.live = false;
    world.events.push({ type: 'land', x: shuttle.x });
    if (world.mode === 'juggle') endJuggleTurn(world);
    else if (world.mode === 'machine') onMachineLanding(world, shuttle.x);
    else resolveLanding(world, shuttle.x);
    return;
  }

  if (shuttle.x < COURT_LEFT - 200 || shuttle.x > COURT_RIGHT + 200) {
    shuttle.live = false;
    world.events.push({ type: 'land', x: shuttle.x });
    if (world.mode === 'juggle') endJuggleTurn(world);
    else if (world.mode === 'machine') onMachineLanding(world, shuttle.x);
    else scorePoint(world, 1 - world.lastHitter);
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
  const cfg = world.config;
  world.events.length = 0;
  world.time += dt;

  if (world.phase !== 'gameover') {
    // nobody may crowd the net while a serve is being set up
    const netMargin =
      world.phase === 'serve' && world.mode === 'match' ? cfg.serveNetMargin : 0;
    stepPlayer(
      world.players[0],
      0,
      inputs[0],
      dt,
      cfg,
      world.attrs[0],
      netMargin,
      world.mode === 'match',
    );
    // the feeder has no body on court, so slot 1 is left parked
    if (world.mode !== 'machine') {
      stepPlayer(
        world.players[1],
        1,
        inputs[1],
        dt,
        cfg,
        world.attrs[1],
        netMargin,
        world.mode === 'match',
      );
    }
  }

  if (world.mode === 'machine') stepMachine(world, dt);

  if (world.phase === 'serve') {
    if (world.phaseTimer > 0) world.phaseTimer -= dt;
    if (world.mode === 'juggle') {
      if (world.phaseTimer <= 0) startJuggleTurn(world);
      return;
    }
    const server = world.players[world.server];
    const head = racketHead(server);
    world.shuttle.x = head.x;
    world.shuttle.y = head.y;

    // A serve only fires on a deliberate swing: the racket must have settled
    // after the reset, and be travelling towards the opponent (or upwards).
    const armed = world.phaseTimer < cfg.servePause - cfg.serveArmDelay;
    const racketSpeed = Math.hypot(server.rvx, server.rvy);
    const forward = server.rvx * server.facing;
    const aimed = forward > cfg.serveForwardMin || server.rvy < 0;
    if (armed && aimed && racketSpeed >= cfg.serveSpeedMin) {
      releaseShuttle(world, world.server);
      world.phase = 'rally';
      world.events.push({ type: 'serve', player: world.server });
    }
  } else if (world.phase === 'rally') {
    if (world.mode === 'juggle') {
      world.juggle.timeLeft -= dt;
      if (world.juggle.timeLeft <= 0) {
        endJuggleTurn(world);
        return;
      }
    }
    let remain = dt;
    while (remain > 1e-6) {
      const slice = Math.min(SUB_DT, remain);
      stepShuttleSlice(world, slice);
      remain -= slice;
      if (world.phase !== 'rally') break;
    }
    if (world.phase === 'rally') {
      tryHit(world, 0, hitSamples?.[0]);
      if (world.mode !== 'machine') tryHit(world, 1, hitSamples?.[1]);
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
  cfg: WorldConfig = DEFAULT_CONFIG,
): void {
  const speed = Math.hypot(s.vx, s.vy);
  const drag = cfg.shuttleDrag * speed;
  s.vx -= s.vx * drag * dt;
  s.vy -= s.vy * drag * dt;
  s.vy += cfg.shuttleGravity * dt;
  const sp = Math.hypot(s.vx, s.vy);
  if (sp > cfg.shuttleMaxSpeed) {
    s.vx = (s.vx / sp) * cfg.shuttleMaxSpeed;
    s.vy = (s.vy / sp) * cfg.shuttleMaxSpeed;
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
    p.stamina,
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
    cfg: w.configId,
    md: w.mode,
    jg: [
      w.juggle.count[0],
      w.juggle.count[1],
      w.juggle.turn,
      w.juggle.timeLeft,
      w.juggle.done[0] ? 1 : 0,
      w.juggle.done[1] ? 1 : 0,
    ],
    ev: events && events.length ? events : undefined,
  };
}

export function applySnapshot(world: World, snap: WorldSnapshot): void {
  // the host owns the rules; follow whatever option it is simulating with
  if (snap.cfg && snap.cfg !== world.configId) {
    world.configId = snap.cfg;
    world.config = configFor(snap.cfg);
  }
  if (snap.md) world.mode = snap.md;

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
    // 旧版主机的快照没有这个字段：当作满体力
    p.stamina = src.length > 11 && Number.isFinite(src[11]) ? src[11] : STAMINA_MAX;
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
  if (snap.jg) {
    world.juggle.count[0] = snap.jg[0];
    world.juggle.count[1] = snap.jg[1];
    world.juggle.turn = snap.jg[2] as 0 | 1;
    world.juggle.timeLeft = snap.jg[3];
    world.juggle.done[0] = !!snap.jg[4];
    world.juggle.done[1] = !!snap.jg[5];
  }
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
    a.stamina = b.stamina;
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
  dst.configId = src.configId;
  dst.config = src.config;
  dst.mode = src.mode;
  dst.juggle.count[0] = src.juggle.count[0];
  dst.juggle.count[1] = src.juggle.count[1];
  dst.juggle.turn = src.juggle.turn;
  dst.juggle.timeLeft = src.juggle.timeLeft;
  dst.juggle.done[0] = src.juggle.done[0];
  dst.juggle.done[1] = src.juggle.done[1];
}

export type { SimEvent };
