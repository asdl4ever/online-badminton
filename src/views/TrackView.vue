<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import Joystick from '../components/ui/Joystick.vue';
import AppModal from '../components/ui/AppModal.vue';
import Button from '../components/ui/Button.vue';
import ItemIcon from '../components/ItemIcon.vue';
import TrainXpHud from '../components/TrainXpHud.vue';
import { useWalk } from '../composables/useWalk';
import { isTouchDevice } from '../game/device';
import { useJoystickPrefs } from '../composables/useJoystick';
import { zoom as worldZoom } from '../composables/useZoom';
import { AVATAR_FEET_PAD, avatarBoxSize, paintAvatar } from '../game/draw/canvas2d';
import { TRAIN_META, TRAIN_MAX_LEVEL, trainProgress, trainXpFor } from '../game/training';
import { ITEMS, RUN_KM_STEP, RUN_MILESTONES } from '../game/items';
import { sfx } from '../game/audio';
import { toastGood } from '../composables/useToast';
import { celebrate } from '../composables/celebrate';
import { useCustomizeStore } from '../stores/customize';
import { useProgressStore } from '../stores/progress';

/**
 * 大世界的「操场」：**俯视平面房间**（和大世界同一套走动 / 镜头 / 视距）。
 *
 * 两种玩法：
 * - 🏃 **跑步挑战**：点「开始跑步」→ 选跑几圈 → 人物被**锁在跑道上**（内场与跑道外
 *   都走不出去），跑满圈数自动结算：**每 100m 给 2 点「速度」经验**（跑道一圈约 100m，
 *   所以差不多 1 圈 2 点）；跑量同时累计，**每满 1km** 解锁一件「跑道特训」专属装备；
 * - 🏐 **50m 直道**：走到球堆点一下拿球，人物自动站到投掷线，再**推右摇杆把球挥出去**
 *   （推哪边就往哪边飞、**推得越快越远**），落点就是成绩（最远 50m），越远「进攻」经验越多。
 * 没有计时评级、没有每日额度。
 */
const router = useRouter();
const customize = useCustomizeStore();
const progress = useProgressStore();

const ROOM_W = 1800;
const ROOM_H = 1700;
/** 门口（画在正下方），走近它就出现「出门」 */
const DOOR = { x: 900, y: 1620 };
const EXIT_RADIUS = 175;
/** 场景标尺：50m 直道画成 1600px，所以 32px = 1m（投掷成绩与跑步里程共用） */
const PX_PER_M = 32;

/** 上面的环形跑道（中心与半径，和模板里那圈对齐） */
const TRACK = { x: 900, y: 690, rx: 680, ry: 380 };
/** 跑道内场的缩进（和 `track__infield` 的 `inset` 一致），用来挡住「跑进内场」 */
const INFIELD_INSET = 136;
/** 只有「在跑道上」（离中心足够远）才累计圈数，免得从中间穿过去也算一圈 */
const LANE_MIN_R = 0.6;
/** 起跑线（画在跑道正下方这一段）与起跑位置 */
const START = { x: 900, y: 1005 };
/** 起跑线的两端（从内场边到跑道外缘） */
const START_LINE = { x: 900, y1: TRACK.y + (TRACK.ry - INFIELD_INSET), y2: TRACK.y + TRACK.ry };

/* --- 跑步挑战 ------------------------------------------------------------- */
/** 可选的圈数 */
const LAP_OPTIONS = [1, 3, 5, 10];
/** 一圈大约多少米（显示预估用；真实里程按实际跑的路径算） */
const LAP_APPROX_M = 100;
/** 每 100m 给多少「速度」经验 */
const XP_PER_100M = 2;
/** 一圈给多少经验（≈100m → 2 点） */
const XP_PER_LAP = (LAP_APPROX_M / 100) * XP_PER_100M;

/** 选的按钮（0 = 没在跑）：目标圈数 / 已跑圈数 / 本次跑的路径长度（px） */
const runTarget = ref(0);
const runLaps = ref(0);
const runPx = ref(0);
/** 圈数选择弹窗 */
const pickOpen = ref(false);
/** 这次进场跑完的累计里程（显示用） */
const sessionMeters = ref(0);

/* --- 50m 直道上的投掷 ------------------------------------------------------ */
/** 推摇杆的「参考速度」：达到它就算满力（单位 = 摇杆行程/秒） */
const SPEED_REF = 7;
/** 距离区间（米）：力量 0 ~ 1 映射到这段 */
const THROW_MIN_M = 5;
const THROW_MAX_M = 50;
/** 投掷动画时长 */
const FLIGHT_MS = 950;

/** idle = 空手；hold = 拿着球（等待挥出）；fly = 球在空中 */
const phase = ref<'idle' | 'hold' | 'fly'>('idle');
/** 拿球后要站到投掷线上（走过去的过程由 stepToSpot 推进） */
let standTarget: { x: number; y: number } | null = null;
/** 球在空中时的位置（plane 坐标） */
const ball = ref<{ x: number; y: number } | null>(null);
let flight: { x0: number; y0: number; x1: number; y1: number; t0: number } | null = null;
/** 落点标记（投掷完成后显示一会儿） */
const landing = ref<{ x: number; m: number } | null>(null);
let landingTimer = 0;
/** 本次进场最远的一投 */
const bestThrow = ref(0);

/** 右下角的球堆 / 投掷线 */
const RUNWAY = { x0: 110, y: 1370, len: 1600, h: 150 };
const THROW_SPOT = { x: 110, y: 1370 };
const PILE = { id: 'pile', x: 150, y: 1215 };

/** 右摇杆原始向量（松手回零） */
const stick = ref({ x: 0, y: 0 });
/** 最近几次摇杆采样（算「挥得多快」） */
let samples: { x: number; y: number; t: number }[] = [];
/** 这一次挥动的峰值速度与方向 */
let peak = { sp: 0, dx: 0, dy: 0 };
/** 最后一次推出去的方向（没挥起来时的兜底） */
let lastDir = { x: 1, y: 0 };
/** 已经推出去过（松手才触发投掷） */
let swung = false;

function resetSwing(): void {
  stick.value = { x: 0, y: 0 };
  samples = [];
  peak = { sp: 0, dx: 0, dy: 0 };
  lastDir = { x: 1, y: 0 };
  swung = false;
}

/* --- 投掷时镜头跟着球（50m 太长，站着看不到落点） --------------------------- */
const cam = ref<{ x: number; y: number; zoom: number } | null>(null);
/** 镜头锁到什么时候（ms 时间戳；过了就交还给人） */
let camUntil = 0;

/** 跟住某一点（投掷期间） */
function lockCam(x: number): void {
  cam.value = { x, y: 1240, zoom: Math.min(worldZoom.value, 0.85) };
  camUntil = Infinity;
}

/** 再跟一会儿就还给人 */
function keepCam(ms: number): void {
  camUntil = performance.now() + ms;
}

function clearCam(): void {
  cam.value = null;
  camUntil = 0;
}

/* --- 走动 ----------------------------------------------------------------- */
const stage = ref<HTMLElement | null>(null);
const plane = ref<HTMLElement | null>(null);
const meCanvas = ref<HTMLCanvasElement | null>(null);
const AVATAR_SCALE = 0.8;
const avatarBox = avatarBoxSize(AVATAR_SCALE);
const avatarFeetPad = Math.round(AVATAR_FEET_PAD * AVATAR_SCALE);

/** 本次进场的收获 */
const earned = ref({ speed: 0, attack: 0 });
let lastPos = { x: 0, y: 0 };
let facing: 1 | -1 = 1;
let frameLast = performance.now();

/* --- 圈的累计（跑步挑战期间） ---------------------------------------------- */
let prevTheta: number | null = null;
let accum = 0;

/** 跑量总览 + 下一件还差多少 */
const runInfo = computed(() => {
  const total = progress.runMeters;
  const unlocked = Math.max(
    0,
    Math.min(RUN_MILESTONES.length, Math.floor(total / RUN_KM_STEP)),
  );
  const nextId = RUN_MILESTONES[unlocked];
  const nextItem = nextId ? (ITEMS.find((i) => i.id === nextId) ?? null) : null;
  return {
    km: (total / 1000).toFixed(2),
    next: nextItem,
    remain: nextItem ? Math.max(0, Math.round((unlocked + 1) * RUN_KM_STEP - total)) : 0,
  };
});

/** 这一趟跑了多少米 / 跑到第几圈 */
const runMeters = computed(() => Math.round(runPx.value / PX_PER_M));
const runPct = computed(() =>
  runTarget.value > 0 ? Math.min(1, runLaps.value / runTarget.value) : 0,
);
/** 某一档圈数的预估里程与经验（选择弹窗里写明） */
const lapPlans = computed(() =>
  LAP_OPTIONS.map((n) => ({
    laps: n,
    meters: n * LAP_APPROX_M,
    xp: Math.round(n * XP_PER_LAP),
  })),
);

/* --- 跑步挑战：开始 / 结束 ------------------------------------------------- */
function openPick(): void {
  if (phase.value !== 'idle' || runTarget.value > 0) return;
  sfx.click();
  pickOpen.value = true;
}

function startRun(laps: number): void {
  pickOpen.value = false;
  runTarget.value = laps;
  runLaps.value = 0;
  runPx.value = 0;
  accum = 0;
  prevTheta = null;
  // 站到起跑线上、面朝前
  me.value = { ...START };
  lastPos = { ...START };
  facing = 1;
  sfx.click();
  showFlash(`开跑！跑满 ${laps} 圈（约 ${laps * LAP_APPROX_M}m）`);
}

/** 把人物钉在跑道上：内场进不去、跑道外也出不去 */
function lockToTrack(): void {
  const cx = TRACK.x;
  const cy = TRACK.y;
  // 内场边界（椭圆）
  const ix = TRACK.rx - INFIELD_INSET;
  const iy = TRACK.ry - INFIELD_INSET;
  const ex = (me.value.x - cx) / ix;
  const ey = (me.value.y - cy) / iy;
  const er = Math.hypot(ex, ey);
  if (er < 1) {
    const s = 1 / Math.max(er, 0.05);
    me.value = { x: cx + (me.value.x - cx) * s, y: cy + (me.value.y - cy) * s };
  }
  // 跑道外缘
  const ox = (me.value.x - cx) / TRACK.rx;
  const oy = (me.value.y - cy) / TRACK.ry;
  const orr = Math.hypot(ox, oy);
  if (orr > 1) {
    const s = 1 / orr;
    me.value = { x: cx + (me.value.x - cx) * s, y: cy + (me.value.y - cy) * s };
  }
}

/** 结束（跑满目标圈数 / 主动收手）：按实际里程结算「速度」经验 */
function finishRun(): void {
  const laps = runLaps.value;
  const meters = runPx.value / PX_PER_M;
  runTarget.value = 0;
  runLaps.value = 0;
  runPx.value = 0;
  accum = 0;
  prevTheta = null;
  if (meters <= 0) return;
  sessionMeters.value += meters;
  // 经验按「跑完的圈数」算（一圈约 100m → 2 点），不因为贴内道跑短了而少给
  const xp = Math.round(laps * XP_PER_LAP);
  if (xp > 0) {
    earned.value.speed += xp;
    for (const k of progress.train({ speed: xp })) {
      toastGood(`${TRAIN_META[k].label} 升到 Lv.${progress.trainLevels[k]}！`);
      celebrate(1, [TRAIN_META[k].color]);
    }
  }
  // 跑量（每 1km 一件「跑道特训」装备）
  for (const id of progress.noteRun(meters)) {
    const item = ITEMS.find((i) => i.id === id);
    toastGood(`跑量里程碑！解锁「${item?.label ?? '跑道特训装备'}」`);
    celebrate(2, ['#39d0a0', '#ffd45c']);
    sfx.win();
  }
  sfx.point();
  showFlash(
    `🏁 跑完 ${laps} 圈 · ${Math.round(meters)} m · 速度 +${xp}`,
  );
}

/* --- 浮动提示（自动消失） -------------------------------------------------- */
const flash = ref<string | null>(null);
let flashTimer = 0;
function showFlash(text: string): void {
  flash.value = text;
  window.clearTimeout(flashTimer);
  flashTimer = window.setTimeout(() => {
    flash.value = null;
  }, 2200);
}

/** 头顶那条：速度 */
const heads = computed(() =>
  (['speed'] as const).map((k) => {
    const level = progress.trainLevels[k] ?? 0;
    const xp = progress.trainXp[k] ?? 0;
    return {
      key: k,
      icon: '🏃',
      label: TRAIN_META[k].label,
      color: TRAIN_META[k].color,
      level,
      pct: Math.round(trainProgress(level, xp) * 100),
      text: level >= TRAIN_MAX_LEVEL ? '满级' : `${xp}/${trainXpFor(level)}`,
    };
  }),
);

function paintMe(now: number): void {
  const c = meCanvas.value;
  if (!c) return;
  paintAvatar(c, customize.cosmetic, now, { scale: AVATAR_SCALE, facing });
}

/* --- 拿球 / 投掷 ----------------------------------------------------------- */
function takeBall(): void {
  if (phase.value !== 'idle' || runTarget.value > 0) return;
  phase.value = 'hold';
  standTarget = { ...THROW_SPOT };
  facing = 1;
  resetSwing();
  landing.value = null;
  clearCam();
  showFlash('推右摇杆把球挥出去 —— 推得越快越远');
}

/** 放下球（不扔了） */
function dropBall(): void {
  if (phase.value !== 'hold') return;
  phase.value = 'idle';
  standTarget = null;
  resetSwing();
  clearCam();
}

/** 球堆的交互（点它 / 按 E / 点按钮都走这里） */
function onEnterPile(): void {
  if (runTarget.value > 0) return;
  if (phase.value === 'hold') dropBall();
  else takeBall();
}

/** 右摇杆：记录这次挥动的**峰值速度**与方向（和羽毛球摆拍一个思路） */
function onStick(x: number, y: number): void {
  stick.value = { x, y };
  if (phase.value !== 'hold') return;
  const now = performance.now();
  samples.push({ x, y, t: now });
  if (samples.length > 40) samples.shift();
  const recent = samples.filter((s) => now - s.t < 160);
  if (recent.length >= 2) {
    const a = recent[0];
    const b = recent[recent.length - 1];
    const dt = (b.t - a.t) / 1000;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dt > 0.012 && Math.hypot(b.x, b.y) >= 0.3) {
      const sp = Math.hypot(dx, dy) / dt;
      if (sp > peak.sp) peak = { sp, dx, dy };
    }
  }
  if (Math.hypot(x, y) > 0.3) {
    swung = true;
    lastDir = { x, y };
  }
}

/** 松手：把球按「峰值速度 → 力量、方向 → 去向」扔出去 */
function release(): void {
  if (phase.value !== 'hold' || standTarget) return;
  const p = peak.sp > 0.01 ? { x: peak.dx, y: peak.dy } : lastDir;
  const len = Math.hypot(p.x, p.y) || 1;
  const dirX = p.x / len;
  const dirY = p.y / len;
  const power = Math.max(0, Math.min(1, peak.sp / SPEED_REF));
  const distM = THROW_MIN_M + (THROW_MAX_M - THROW_MIN_M) * power;
  const px = distM * PX_PER_M;
  const x1 = Math.max(60, Math.min(ROOM_W - 60, THROW_SPOT.x + dirX * px));
  const y1 = Math.max(320, Math.min(ROOM_H - 80, THROW_SPOT.y + dirY * px));
  flight = { x0: me.value.x, y0: me.value.y - 60, x1, y1, t0: performance.now() };
  ball.value = { x: flight.x0, y: flight.y0 };
  phase.value = 'fly';
  lockCam(flight.x0);
  sfx.hit('smash');
}

/** 球落地：按落点离投掷线的水平距离记成绩、发「进攻」经验 */
function land(): void {
  const f = flight;
  flight = null;
  if (!f) return;
  const m = Math.max(0, Math.min(THROW_MAX_M, (f.x1 - THROW_SPOT.x) / PX_PER_M));
  const xp = Math.max(1, Math.round(m / 6));
  earned.value.attack += xp;
  bestThrow.value = Math.max(bestThrow.value, m);
  for (const k of progress.train({ attack: xp })) {
    toastGood(`${TRAIN_META[k].label} 升到 Lv.${progress.trainLevels[k]}！`);
    celebrate(1, [TRAIN_META[k].color]);
  }
  sfx.point();
  ball.value = null;
  landing.value = { x: f.x1, m };
  window.clearTimeout(landingTimer);
  landingTimer = window.setTimeout(() => {
    landing.value = null;
  }, 3200);
  showFlash(`🏐 ${m.toFixed(1)} m · 进攻 +${xp}`);
  phase.value = 'idle';
  resetSwing();
  lockCam(f.x1);
  keepCam(1100);
}

/** 每帧朝投掷线走一小步（站定了就清掉目标） */
function stepToSpot(dt: number): void {
  const t = standTarget;
  if (!t) return;
  const dx = t.x - me.value.x;
  const dy = t.y - me.value.y;
  const d = Math.hypot(dx, dy);
  if (d < 2) {
    me.value = { ...t };
    standTarget = null;
    return;
  }
  const step = Math.min(d, 620 * dt);
  me.value = { x: me.value.x + (dx / d) * step, y: me.value.y + (dy / d) * step };
}

const walk = useWalk({
  stage,
  plane,
  width: ROOM_W,
  height: ROOM_H,
  radius: 210,
  objects: () => [PILE],
  spawn: { x: 900, y: 1000 },
  onEnter: (id) => {
    if (id === 'pile') onEnterPile();
  },
  // 球飞出去时镜头跟着球（这条直道 50m 太长，站着看不到落点）
  focus: () => (performance.now() < camUntil ? cam.value : null),
  onFrame: (now) => {
    const dt = Math.min((now - frameLast) / 1000, 0.05);
    frameLast = now;

    if (phase.value !== 'idle') {
      joy.value = { x: 0, y: 0 };
      stepToSpot(dt);
      // 这段时间人物是被脚本挪动的，别算进里程
      lastPos = { x: me.value.x, y: me.value.y };
      // 松手 → 扔出去
      if (phase.value === 'hold' && !standTarget) {
        if (Math.hypot(stick.value.x, stick.value.y) <= 0.3) {
          if (swung) {
            swung = false;
            release();
          }
        } else swung = true;
      }
      // 球在空中：沿抛物线飞
      if (phase.value === 'fly' && flight) {
        const t = Math.min(1, (now - flight.t0) / FLIGHT_MS);
        ball.value = {
          x: flight.x0 + (flight.x1 - flight.x0) * t,
          y: flight.y0 + (flight.y1 - flight.y0) * t - Math.sin(Math.PI * t) * 190,
        };
        lockCam(ball.value.x);
        if (t >= 1) land();
      }
      paintMe(now);
      return;
    }

    // 跑步挑战：先把人锁回跑道
    if (runTarget.value > 0) lockToTrack();

    const x = walk.me.value.x;
    const y = walk.me.value.y;
    const dx = x - lastPos.x;
    const dy = y - lastPos.y;
    const step = Math.hypot(dx, dy);
    if (step > 0.4) {
      if (Math.abs(dx) > 0.15) facing = dx > 0 ? 1 : -1;
      if (runTarget.value > 0) runPx.value += step;
    }
    lastPos = { x, y };

    // 圈：绕着跑道中心累计转角，走过一整圈 = 一圈
    if (runTarget.value > 0) {
      const nx = (x - TRACK.x) / TRACK.rx;
      const ny = (y - TRACK.y) / TRACK.ry;
      const theta = Math.atan2(ny, nx);
      if (prevTheta === null) prevTheta = theta;
      let d = theta - prevTheta;
      if (d > Math.PI) d -= Math.PI * 2;
      else if (d < -Math.PI) d += Math.PI * 2;
      prevTheta = theta;
      if (Math.hypot(nx, ny) >= LANE_MIN_R) accum += d;
      if (Math.abs(accum) >= Math.PI * 2) {
        accum = 0;
        runLaps.value += 1;
        sfx.point();
        if (runLaps.value >= runTarget.value) finishRun();
      }
    }

    paintMe(now);
  },
});
const { me, joy, nearId, tryEnter } = walk;
lastPos = { x: me.value.x, y: me.value.y };

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown);
  // 中途离开页面：把这一趟按已完成的圈数结算掉，别白跑
  if (runTarget.value > 0) finishRun();
});

function onKeyDown(e: KeyboardEvent): void {
  if (e.repeat) return;
  if (e.key.toLowerCase() !== 'e') return;
  if (runTarget.value > 0) return;
  if (nearId.value !== 'pile') return;
  sfx.click();
  onEnterPile();
}

/** 右下角按钮（拿球 / 放下球） */
function clickPile(): void {
  sfx.click();
  onEnterPile();
}

const holding = computed(() => phase.value === 'hold');
const running = computed(() => runTarget.value > 0);
/** 右下角按钮：靠近球堆（且空手、没在跑步） */
const canTake = computed(
  () => phase.value === 'idle' && !running.value && nearId.value === 'pile',
);

const touch = isTouchDevice();
const { always: joyAlways } = useJoystickPrefs();
const showJoy = computed(() => touch || joyAlways.value);

/** 站在门口：右下角出现「出门」 */
const nearDoor = computed(
  () =>
    phase.value === 'idle' &&
    !running.value &&
    Math.hypot(me.value.x - DOOR.x, me.value.y - DOOR.y) < EXIT_RADIUS,
);

/** 直道上的 5m 刻度 */
const marks = Array.from({ length: 10 }, (_, i) => (i + 1) * 5);

function leave(): void {
  sfx.click();
  if (runTarget.value > 0) finishRun();
  void router.push('/');
}

function back(): void {
  if (runTarget.value > 0) finishRun();
  void router.push('/');
}
</script>

<template>
  <div class="page page--playing">
    <PageShell title="操场" back @back="back">
      <template #stage>
        <div ref="stage" class="room">
          <div
            ref="plane"
            class="room__plane"
            :style="{ width: `${ROOM_W}px`, height: `${ROOM_H}px` }"
          >
            <!-- 天空：太阳与云 -->
            <div class="sun" />
            <div class="cloud cloud--1" />
            <div class="cloud cloud--2" />
            <div class="hedge" />

            <!-- 四角的树 -->
            <div class="tree" style="left: 150px; top: 400px" />
            <div class="tree" style="left: 1650px; top: 430px" />
            <div class="tree" style="left: 240px; top: 990px" />
            <div class="tree" style="left: 1560px; top: 1010px" />

            <!-- 上面的环形跑道 -->
            <div
              class="track"
              :style="{ left: `${TRACK.x}px`, top: `${TRACK.y}px`, width: `${TRACK.rx * 2}px`, height: `${TRACK.ry * 2}px` }"
            >
              <div class="track__lane" style="inset: 34px" />
              <div class="track__lane" style="inset: 68px" />
              <div class="track__lane" style="inset: 102px" />
              <div class="track__infield">
                <div class="track__circle" />
              </div>
            </div>

            <!-- 起跑线（白色，横跨跑道） -->
            <div
              class="start-line"
              :style="{
                left: `${START_LINE.x}px`,
                top: `${START_LINE.y1}px`,
                height: `${START_LINE.y2 - START_LINE.y1}px`,
              }"
            />
            <div class="start-tag" :style="{ left: `${START_LINE.x}px`, top: `${START_LINE.y2 + 8}px` }">
              起跑线
            </div>

            <!-- 下面新增的 50m 直道 -->
            <div
              class="runway"
              :style="{
                left: `${RUNWAY.x0}px`,
                top: `${RUNWAY.y - RUNWAY.h / 2}px`,
                width: `${RUNWAY.len}px`,
                height: `${RUNWAY.h}px`,
              }"
            >
              <span class="runway__start">起点</span>
              <div
                v-for="m in marks"
                :key="m"
                class="runway__mark"
                :style="{ left: `${(m / 5) * 160}px` }"
              >
                <i />
                <b>{{ m }}m</b>
              </div>
            </div>

            <!-- 球堆（点一下 / 走近按 E 拿球） -->
            <div
              class="pile"
              :class="{ 'is-near': nearId === 'pile' && !running }"
              :style="{ left: `${PILE.x}px`, top: `${PILE.y}px` }"
              @click="tryEnter('pile')"
            >
              <span class="pile__ball" />
              <span class="pile__ball" />
              <span class="pile__ball" />
              <span class="pile__name">🏐 实心球</span>
            </div>

            <!-- 落点标记 -->
            <div
              v-if="landing"
              class="landing"
              :style="{ left: `${landing.x}px`, top: `${RUNWAY.y}px` }"
            >
              <span class="landing__m">{{ landing.m.toFixed(1) }}m</span>
            </div>

            <!-- 球（拿在手上 / 飞在空中） -->
            <div
              v-if="phase === 'fly' && ball"
              class="ball is-fly"
              :style="{ left: `${ball.x}px`, top: `${ball.y}px` }"
            />
            <div
              v-else-if="holding"
              class="ball is-held"
              :style="{ left: `${me.x + facing * 34}px`, top: `${me.y - 66}px` }"
            />

            <!-- 门口 -->
            <div class="room__door" :style="{ left: `${DOOR.x}px`, top: `${DOOR.y}px` }" />

            <!-- 角色：和地图同一份绘制 -->
            <div
              class="avatar is-me"
              :style="{
                left: `${me.x}px`,
                top: `${me.y}px`,
                width: `${avatarBox.w}px`,
                height: `${avatarBox.h}px`,
                transform: `translate(-50%, calc(-100% + ${avatarFeetPad}px))`,
              }"
            >
              <!-- 头顶：速度（等级 + 进度条），跟着人走 -->
              <div class="avatar__xp">
                <template v-for="h in heads" :key="h.key">
                  <span class="avatar__xplabel" :style="{ color: h.color }">
                    {{ h.icon }} {{ h.label }} Lv.{{ h.level }}
                  </span>
                  <span class="avatar__xptrack">
                    <i :style="{ width: `${h.pct}%`, background: h.color }" />
                  </span>
                  <span class="avatar__xpnum num">{{ h.text }}</span>
                </template>
              </div>
              <canvas ref="meCanvas" class="avatar__rig" />
            </div>
          </div>

          <div class="room__stat">
            本次 {{ Math.round(sessionMeters) }} m · 速度 +{{ earned.speed }} · 进攻 +{{
              earned.attack
            }}<template v-if="bestThrow > 0"> · 最远 {{ bestThrow.toFixed(1) }} m</template>
          </div>

          <!-- 🏟 跑量里程碑：累计里程 + 下一件还差多少 -->
          <div class="runcard">
            <span class="runcard__km">🏁 累计 {{ runInfo.km }} km</span>
            <template v-if="runInfo.next">
              <span class="runcard__bar">
                <i
                  :style="{
                    width: `${Math.round((1 - runInfo.remain / RUN_KM_STEP) * 100)}%`,
                  }"
                />
              </span>
              <span class="runcard__next">
                再跑 {{ runInfo.remain }} m →
                <ItemIcon class="runcard__icon" :item="runInfo.next" />
                「{{ runInfo.next.label }}」
              </span>
            </template>
            <span v-else class="runcard__next">跑道特训装备已全部解锁 🎉</span>
          </div>

          <!-- 🏃 跑步挑战：第几圈 + 里程 -->
          <div v-if="running" class="runbar">
            <span class="runbar__laps">🏃 第 {{ Math.min(runLaps + 1, runTarget) }} / {{ runTarget }} 圈</span>
            <span class="runbar__bar"><i :style="{ width: `${Math.round(runPct * 100)}%` }" /></span>
            <span class="runbar__m num">{{ runMeters }} m</span>
          </div>

          <div v-if="flash" class="room__flash">{{ flash }}</div>

          <Joystick v-if="showJoy && phase === 'idle'" @move="(x, y) => (joy = { x, y })" />
          <Joystick v-if="showJoy && holding" side="right" @move="onStick" />

          <!-- 空手、不在跑、也不在球堆/门口：开始跑步 -->
          <button
            v-if="phase === 'idle' && !running && !canTake && !nearDoor"
            class="run-btn"
            type="button"
            @click="openPick"
          >
            🏃 开始跑步
          </button>

          <!-- 跑步中：收手（按已跑的里程结算） -->
          <button v-if="running" class="stop-btn" type="button" @click="finishRun">
            ✋ 结束跑步
          </button>

          <!-- 靠近球堆：拿一颗 -->
          <button v-if="canTake" class="pile-btn" type="button" @click="clickPile">
            🏐 拿一颗实心球
          </button>

          <!-- 拿着球：放下球 -->
          <button v-if="holding" class="drop-btn" type="button" @click="clickPile">
            ✋ 放下球
          </button>

          <button v-if="nearDoor" class="room__exit jelly" type="button" @click="leave">
            🚪 出门
          </button>
        </div>
      </template>

      <TrainXpHud :keys="['speed']" />
    </PageShell>

    <!-- 选跑几圈 -->
    <AppModal v-model="pickOpen" title="跑多少圈？" max-width="380px">
      <div class="laps">
        <button
          v-for="p in lapPlans"
          :key="p.laps"
          class="laps__item"
          type="button"
          @click="startRun(p.laps)"
        >
          <b>{{ p.laps }} 圈</b>
          <span>约 {{ p.meters }} m · 速度 +{{ p.xp }}</span>
        </button>
        <p class="muted laps__note">
          开跑后会被锁在跑道上，跑满圈数自动结算：每 100m 给 2 点「速度」经验（跑道一圈约 100m）。
        </p>
        <Button block @click="pickOpen = false">取消</Button>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
/* --- 房间 ----------------------------------------------------------------- */
.room {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #7cb160;
}

/* 天空 → 草地（俯视平面，上方一条天空 + 灌木带，其余是草地） */
.room__plane {
  position: absolute;
  left: 0;
  top: 0;
  background-color: #7cb160;
  background-image:
    linear-gradient(
      180deg,
      #c3e9ff 0 218px,
      #d9f1ff 218px 236px,
      #8fc26b 236px 268px,
      rgba(0, 0, 0, 0) 268px
    ),
    radial-gradient(70% 46% at 50% 46%, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0) 72%),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.045) 0 46px, rgba(0, 0, 0, 0) 46px 92px);
  border-bottom: 16px solid #639b4c;
}

/* 太阳 */
.sun {
  position: absolute;
  left: 260px;
  top: 44px;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 38%, #fff3b0, #ffd45c 62%, rgba(255, 212, 92, 0) 72%);
  box-shadow: 0 0 60px 18px rgba(255, 214, 110, 0.55);
}

/* 云：两层圆角叠出来的软云 */
.cloud {
  position: absolute;
  height: 34px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 16px -10px rgba(90, 130, 160, 0.6);
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  bottom: 6px;
  border-radius: 50%;
  background: inherit;
}

.cloud--1 {
  left: 700px;
  top: 70px;
  width: 180px;
}

.cloud--1::before {
  left: 34px;
  width: 68px;
  height: 68px;
}

.cloud--1::after {
  left: 92px;
  width: 50px;
  height: 50px;
}

.cloud--2 {
  left: 1180px;
  top: 120px;
  width: 140px;
  transform: scale(0.8);
}

.cloud--2::before {
  left: 28px;
  width: 56px;
  height: 56px;
}

.cloud--2::after {
  left: 76px;
  width: 42px;
  height: 42px;
}

/* 远处那排灌木 */
.hedge {
  position: absolute;
  left: 0;
  right: 0;
  top: 236px;
  height: 32px;
  background:
    radial-gradient(24px 22px at 24px 22px, #5f9b48 96%, rgba(0, 0, 0, 0) 100%) 0 0 / 48px 32px
      repeat-x,
    #6fae53;
}

/* 树：一个圆冠 + 一根树干 */
.tree {
  position: absolute;
  width: 96px;
  height: 96px;
  transform: translate(-50%, -70%);
  border-radius: 50%;
  background: radial-gradient(circle at 38% 32%, #8fd06a, #4f9140 68%, #3d7531);
  box-shadow: 0 16px 20px -16px rgba(30, 60, 20, 0.7);
}

.tree::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -26px;
  width: 12px;
  height: 30px;
  transform: translateX(-50%);
  border-radius: 4px;
  background: linear-gradient(90deg, #8a6a42, #6b4f2f);
}

/* --- 环形跑道（上半） ------------------------------------------------------ */
.track {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: linear-gradient(160deg, #dd6a46, #bf4a2e);
  box-shadow:
    inset 0 0 0 6px rgba(255, 255, 255, 0.22),
    0 22px 44px -26px rgba(40, 20, 10, 0.6);
}

.track__lane {
  position: absolute;
  border-radius: 50%;
  border: 3px dashed rgba(255, 255, 255, 0.5);
}

.track__infield {
  position: absolute;
  inset: 136px;
  border-radius: 50%;
  background-color: #79b45e;
  background-image: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 0 44px,
    rgba(0, 0, 0, 0) 44px 88px
  );
  box-shadow: inset 0 10px 24px -12px rgba(30, 60, 20, 0.5);
}

.track__circle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 170px;
  height: 170px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.55);
}

.track__circle::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 26px;
  height: 26px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.55);
}

/* --- 起跑线 --------------------------------------------------------------- */
.start-line {
  position: absolute;
  width: 10px;
  transform: translateX(-50%);
  border-radius: 4px;
  background: #ffffff;
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.35),
    0 6px 14px -8px rgba(40, 20, 10, 0.6);
  pointer-events: none;
}

.start-tag {
  position: absolute;
  transform: translate(-50%, 0);
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(255, 252, 240, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.75);
  color: #8a4a2a;
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
  pointer-events: none;
}

/* --- 50m 直道（下半） ------------------------------------------------------ */
.runway {
  position: absolute;
  border-radius: 18px;
  background: linear-gradient(180deg, #d8613f, #bf4a2e);
  box-shadow:
    inset 0 0 0 5px rgba(255, 255, 255, 0.22),
    0 18px 34px -22px rgba(40, 20, 10, 0.55);
}

.runway__start {
  position: absolute;
  left: 0;
  top: -30px;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(255, 252, 240, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: #8a4a2a;
  font-size: 11px;
  font-weight: 800;
}

.runway__mark {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
}

.runway__mark i {
  position: absolute;
  left: -1.5px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: rgba(255, 255, 255, 0.5);
}

.runway__mark b {
  position: absolute;
  left: 0;
  bottom: -24px;
  transform: translateX(-50%);
  padding: 1px 8px;
  border-radius: 999px;
  background: rgba(255, 252, 240, 0.86);
  color: #8a4a2a;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

/* --- 球堆 ----------------------------------------------------------------- */
.pile {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: flex-end;
  gap: 2px;
  padding: 10px 16px 8px;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 250, 238, 0.82);
  box-shadow: 0 10px 22px -14px rgba(60, 80, 40, 0.7);
  backdrop-filter: blur(8px) saturate(1.3);
  -webkit-backdrop-filter: blur(8px) saturate(1.3);
  cursor: pointer;
}

.pile.is-near {
  border-color: #ffce5c;
  box-shadow: 0 0 0 3px rgba(255, 206, 92, 0.5), 0 10px 22px -14px rgba(60, 80, 40, 0.7);
}

.pile__ball {
  display: block;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(circle at 34% 30%, #9aa4b4, #5c6674 58%, #38404c);
  box-shadow: inset -5px -5px 10px -5px rgba(0, 0, 0, 0.6);
}

.pile__ball:nth-child(2) {
  width: 34px;
  height: 34px;
}

.pile__name {
  position: absolute;
  left: 50%;
  top: -26px;
  transform: translateX(-50%);
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(255, 252, 240, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: #4f7028;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

/* --- 球 / 落点 ------------------------------------------------------------ */
.ball {
  position: absolute;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: radial-gradient(circle at 34% 30%, #9aa4b4, #5c6674 58%, #38404c);
  box-shadow: 0 10px 16px -12px rgba(0, 0, 0, 0.8);
  pointer-events: none;
}

.ball.is-held,
.ball.is-fly {
  transform: translate(-50%, -50%);
}

.landing {
  position: absolute;
  width: 18px;
  height: 18px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 3px solid #ffd45c;
  background: rgba(255, 212, 92, 0.35);
  animation: land-pop 0.3s var(--ease);
}

.landing__m {
  position: absolute;
  left: 50%;
  top: -26px;
  transform: translateX(-50%);
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(255, 252, 240, 0.95);
  color: #8a4a2a;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

@keyframes land-pop {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.4);
  }
}

.room__door {
  position: absolute;
  width: 150px;
  height: 74px;
  transform: translate(-50%, -100%);
  border: 5px solid #8fc26b;
  border-bottom: 0;
  border-radius: 74px 74px 0 0;
  background: linear-gradient(180deg, #fff6e2, #f0e0bd);
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.6);
}

/* --- 角色 ----------------------------------------------------------------- */
.avatar__rig {
  display: block;
  width: 100%;
  height: 100%;
}

.avatar__xp {
  position: absolute;
  left: 50%;
  bottom: calc(100% - 2px);
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(255, 252, 240, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.7);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.avatar__xptrack {
  display: block;
  width: 56px;
  height: 6px;
  border-radius: 999px;
  background: rgba(60, 90, 40, 0.2);
  overflow: hidden;
}

.avatar__xptrack i {
  display: block;
  height: 100%;
  border-radius: 999px;
}

.avatar__xpnum {
  font-size: 10px;
  color: #5f7a3f;
}

/* --- 提示 / 统计 ---------------------------------------------------------- */
.room__stat,
.room__flash,
.runcard,
.runbar {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 15px;
  border-radius: var(--r-pill);
  font-size: 12px;
  pointer-events: none;
}

.room__stat {
  top: calc(env(safe-area-inset-top) + 12px);
  background: rgba(255, 252, 240, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #4f7028;
}

/* 🏟 跑量里程碑 */
.runcard {
  top: calc(env(safe-area-inset-top) + 46px);
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 252, 240, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #4f7028;
  font-weight: 700;
  white-space: nowrap;
}

.runcard__bar {
  display: block;
  width: 110px;
  height: 8px;
  border-radius: 999px;
  background: rgba(60, 90, 40, 0.2);
  overflow: hidden;
}

.runcard__bar i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #39d0a0, #ffd45c);
}

.runcard__next {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #6f8a48;
  font-size: 11px;
}

/* 下一件装备的图标（和背包里同一个绘制） */
.runcard__icon {
  width: 26px;
  height: 26px;
  flex: none;
}

/* 🏃 跑步挑战 */
.runbar {
  top: calc(env(safe-area-inset-top) + 80px);
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 252, 240, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: #2f7d3a;
  font-weight: 800;
  white-space: nowrap;
  animation: flash-in 0.22s var(--ease);
}

.runbar__bar {
  display: block;
  width: 150px;
  height: 8px;
  border-radius: 999px;
  background: rgba(60, 90, 40, 0.2);
  overflow: hidden;
}

.runbar__bar i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #39d0a0, #ffd45c);
  transition: width 0.15s linear;
}

/* 完成一圈 / 投掷 / 结算的浮动提示 */
.room__flash {
  bottom: 132px;
  background: rgba(255, 250, 238, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.75);
  color: #2f7d3a;
  font-weight: 800;
  box-shadow: 0 10px 22px -14px rgba(40, 90, 40, 0.7);
  animation: flash-in 0.25s var(--ease);
}

@keyframes flash-in {
  from {
    opacity: 0;
    transform: translate(-50%, 8px) scale(0.94);
  }
}

.room__exit,
.pile-btn,
.drop-btn,
.run-btn,
.stop-btn {
  position: absolute;
  right: max(14px, env(safe-area-inset-right));
  bottom: calc(env(safe-area-inset-bottom) + 186px);
  z-index: 32;
  padding: 0.7em 1.3em;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.55);
  font-family: var(--font-display);
  font-size: var(--ui-pill-font);
  font-weight: 800;
  letter-spacing: 1px;
  color: #fff;
  cursor: pointer;
}

.room__exit {
  background: linear-gradient(180deg, #f2b544, #d9942a);
  box-shadow: 0 10px 26px rgba(150, 100, 20, 0.45);
}

.pile-btn {
  background: linear-gradient(180deg, #37d67a, #1fa85c);
  box-shadow: 0 10px 26px rgba(20, 120, 60, 0.45);
  animation: enter-pop 0.22s var(--ease);
}

.drop-btn {
  background: linear-gradient(180deg, #8a94a6, #66707f);
  box-shadow: 0 10px 26px rgba(60, 70, 80, 0.45);
}

.run-btn {
  background: linear-gradient(180deg, #3aa6e0, #1f7fb8);
  box-shadow: 0 10px 26px rgba(20, 90, 140, 0.45);
  animation: enter-pop 0.22s var(--ease);
}

.stop-btn {
  background: linear-gradient(180deg, #f2724a, #cf4a2a);
  box-shadow: 0 10px 26px rgba(160, 60, 30, 0.45);
}

.room__exit:active,
.pile-btn:active,
.drop-btn:active,
.run-btn:active,
.stop-btn:active {
  transform: scale(0.94);
}

@keyframes enter-pop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.9);
  }
}

@media (pointer: fine) {
  .room__exit,
  .pile-btn,
  .drop-btn,
  .run-btn,
  .stop-btn {
    bottom: calc(env(safe-area-inset-bottom) + 24px);
  }
}

/* --- 圈数选择弹窗 --------------------------------------------------------- */
.laps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.laps__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 2px solid rgba(255, 255, 255, 0.7);
  background: rgba(255, 250, 238, 0.9);
  color: #4a3410;
  cursor: pointer;
  transition: transform 0.12s var(--ease);
}

.laps__item b {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 900;
}

.laps__item span {
  font-size: 12px;
  color: #8a7440;
}

.laps__item:active {
  transform: scale(0.97);
}

.laps__note {
  margin: 4px 0 2px;
  font-size: 12px;
}
</style>
