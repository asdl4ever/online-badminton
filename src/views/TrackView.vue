<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import ZoomControl from '../components/ui/ZoomControl.vue';
import Joystick from '../components/ui/Joystick.vue';
import AppModal from '../components/ui/AppModal.vue';
import Button from '../components/ui/Button.vue';
import TrainXpHud from '../components/TrainXpHud.vue';
import { useWalk } from '../composables/useWalk';
import { isTouchDevice } from '../game/device';
import { useJoystickPrefs } from '../composables/useJoystick';
import { AVATAR_FEET_PAD, avatarBoxSize, paintAvatar } from '../game/draw/canvas2d';
import {
  TRAIN_META,
  TRAIN_MAX_LEVEL,
  TRAIN_GRADE_LABEL,
  TRAIN_GRADE_COLOR,
  TRAIN_DAILY_SETS,
  trainProgress,
  trainXpFor,
  trainSetBaseXp,
  type TrainGrade,
} from '../game/training';
import { sfx } from '../game/audio';
import { toastGood } from '../composables/useToast';
import { celebrate } from '../composables/celebrate';
import { useCustomizeStore } from '../stores/customize';
import { useProgressStore } from '../stores/progress';

/**
 * 大世界的「操场」：**俯视平面房间**（和大世界同一套走动 / 镜头 / 视距）。
 *
 * 现在是**一圈一结算**：绕着环形跑道跑完一圈算「一组」，按**用时**评 S/A/B/C，
 * 给一笔「速度 + 体力」经验；每天每项 3 圈满额（见 `training.ts` 的训练组）。
 * 角色头顶挂着这两项的等级与进度条，屏幕底部是总览（`TrainXpHud`）。
 */
const router = useRouter();
const customize = useCustomizeStore();
const progress = useProgressStore();

const ROOM_W = 1800;
const ROOM_H = 1200;
/** 门口（画在正下方），走近它就出现「出门」 */
const DOOR = { x: 900, y: 1140 };
const EXIT_RADIUS = 175;
/** 像素 → 米（显示用） */
const PX_PER_M = 32;

/** 环形跑道的中心与半径（和模板里那圈 `left/top/width/height` 对齐） */
const TRACK = { x: 900, y: 580, rx: 740, ry: 410 };
/** 一圈的「A 标准用时」（越快评级越高；周长约 3700px，正常跑速约 9~11 秒） */
const TARGET_LAP_MS = 11_000;
/** 只有「在跑道上」（离中心足够远）才累计圈数，免得从中间穿过去也算一圈 */
const LANE_MIN_R = 0.6;

/** 一圈用时 → 评级 */
function lapGrade(ms: number): TrainGrade {
  const r = ms / TARGET_LAP_MS;
  if (r <= 0.8) return 'S';
  if (r <= 1.0) return 'A';
  if (r <= 1.4) return 'B';
  return 'C';
}

/* --- 走动 ----------------------------------------------------------------- */
const stage = ref<HTMLElement | null>(null);
const plane = ref<HTMLElement | null>(null);
const meCanvas = ref<HTMLCanvasElement | null>(null);
const AVATAR_SCALE = 0.8;
const avatarBox = avatarBoxSize(AVATAR_SCALE);
const avatarFeetPad = Math.round(AVATAR_FEET_PAD * AVATAR_SCALE);

/** 这次进场的里程与收获 */
const dist = ref(0);
const earned = ref({ speed: 0, stamina: 0 });
let lastPos = { x: 0, y: 0 };
let facing: 1 | -1 = 1;

/* --- 圈：跑完一圈 = 一组 --------------------------------------------------- */
/** 本圈进度（0~1）与本圈已用时 */
const lapPct = ref(0);
const lapMs = ref(0);
let prevTheta: number | null = null;
let accum = 0;
let lapStart = performance.now();
/** 上一圈的结算（结算卡用；null = 没弹） */
const lap = ref<{
  grade: TrainGrade;
  ms: number;
  base: number;
  speedXp: number;
  staminaXp: number;
  mul: number;
  setsToday: number;
} | null>(null);
const lapOpen = computed({
  get: () => lap.value !== null,
  set: (v: boolean) => {
    if (!v) lap.value = null;
  },
});
const lapInfo = computed(() => {
  const l = lap.value;
  if (!l) return null;
  return {
    gradeText: TRAIN_GRADE_LABEL[l.grade],
    gradeColor: TRAIN_GRADE_COLOR[l.grade],
    target: (TARGET_LAP_MS / 1000).toFixed(1),
    quotaNote:
      l.setsToday <= TRAIN_DAILY_SETS
        ? `今日第 ${l.setsToday} / ${TRAIN_DAILY_SETS} 圈（满额）`
        : l.mul > 0
          ? `今日第 ${l.setsToday} 圈 · 已超额，只给 ${Math.round(l.mul * 100)}%`
          : `今日第 ${l.setsToday} 圈 · 今日额度已用完`,
  };
});

/** 跑完一圈：按用时评级 → 每日额度 → 发「速度 + 体力」经验 → 弹结算卡 */
function finishLap(ms: number): void {
  const grade = lapGrade(ms);
  const base = trainSetBaseXp(grade);
  const rs = progress.finishTrainSet('speed', base);
  const rt = progress.finishTrainSet('stamina', base);
  earned.value.speed += rs.xp;
  earned.value.stamina += rt.xp;
  for (const k of [...rs.up, ...rt.up]) {
    toastGood(`${TRAIN_META[k].label} 升到 Lv.${progress.trainLevels[k]}！`);
    celebrate(1, [TRAIN_META[k].color]);
  }
  sfx.point();
  lap.value = {
    grade,
    ms,
    base,
    speedXp: rs.xp,
    staminaXp: rt.xp,
    mul: Math.min(rs.mul, rt.mul),
    setsToday: Math.max(rs.setsToday, rt.setsToday),
  };
}

/** 头顶两条：速度 / 体力 */
const heads = computed(() =>
  (['speed', 'stamina'] as const).map((k) => {
    const level = progress.trainLevels[k] ?? 0;
    const xp = progress.trainXp[k] ?? 0;
    return {
      key: k,
      icon: k === 'speed' ? '🏃' : '💪',
      label: TRAIN_META[k].label,
      color: TRAIN_META[k].color,
      level,
      pct: Math.round(trainProgress(level, xp) * 100),
      text: level >= TRAIN_MAX_LEVEL ? '满级' : `${xp}/${trainXpFor(level)}`,
    };
  }),
);

const meters = computed(() => Math.round(dist.value / PX_PER_M));

function paintMe(now: number): void {
  const c = meCanvas.value;
  if (!c) return;
  paintAvatar(c, customize.cosmetic, now, { scale: AVATAR_SCALE, facing });
}

const walk = useWalk({
  stage,
  plane,
  width: ROOM_W,
  height: ROOM_H,
  objects: () => [],
  spawn: { x: 900, y: 900 },
  // 操场上没有可以「进入」的物件（跑就够了）
  onEnter: () => {},
  onFrame: (now) => {
    const x = walk.me.value.x;
    const y = walk.me.value.y;
    const dx = x - lastPos.x;
    const dy = y - lastPos.y;
    if (Math.hypot(dx, dy) > 0.4) {
      dist.value += Math.hypot(dx, dy);
      if (Math.abs(dx) > 0.15) facing = dx > 0 ? 1 : -1;
    }
    lastPos = { x, y };

    // 圈：绕着跑道中心累计转角，走过一整圈 = 一组（从中间穿过去不算）
    const nx = (x - TRACK.x) / TRACK.rx;
    const ny = (y - TRACK.y) / TRACK.ry;
    const theta = Math.atan2(ny, nx);
    if (prevTheta === null) prevTheta = theta;
    let d = theta - prevTheta;
    if (d > Math.PI) d -= Math.PI * 2;
    else if (d < -Math.PI) d += Math.PI * 2;
    prevTheta = theta;
    if (lap.value) {
      // 结算卡还开着：这一圈先不记，等关掉重新计时
      accum = 0;
      lapPct.value = 0;
      lapMs.value = 0;
      lapStart = now;
    } else {
      if (Math.hypot(nx, ny) >= LANE_MIN_R) accum += d;
      lapPct.value = Math.min(1, Math.abs(accum) / (Math.PI * 2));
      lapMs.value = now - lapStart;
      if (Math.abs(accum) >= Math.PI * 2) {
        const ms = lapMs.value;
        accum = 0;
        lapStart = now;
        lapPct.value = 0;
        lapMs.value = 0;
        finishLap(ms);
      }
    }

    paintMe(now);
  },
});
const { me, joy } = walk;
lastPos = { x: me.value.x, y: me.value.y };

const touch = isTouchDevice();
const { always: joyAlways } = useJoystickPrefs();
const showJoy = computed(() => touch || joyAlways.value);

/** 站在门口：右下角出现「出门」 */
const nearDoor = computed(
  () => Math.hypot(me.value.x - DOOR.x, me.value.y - DOOR.y) < EXIT_RADIUS,
);

function leave(): void {
  sfx.click();
  void router.push('/');
}

function back(): void {
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
            <!-- 环形跑道 -->
            <div class="track" :style="{ left: '900px', top: '580px', width: '1480px', height: '820px' }">
              <div class="track__lane" />
              <div class="track__infield" />
            </div>

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
              <!-- 头顶：速度 / 体力（等级 + 进度条），跟着人走 -->
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
            本次 {{ meters }} m · 速度 +{{ earned.speed }} · 体力 +{{ earned.stamina }}
          </div>

          <!-- 本圈：进度 + 用时（跑满一圈结算一组，按用时评级） -->
          <div class="lapbar">
            <span class="lapbar__label">本圈</span>
            <span class="lapbar__track"><b :style="{ width: `${Math.round(lapPct * 100)}%` }" /></span>
            <span class="lapbar__time num">
              {{ (lapMs / 1000).toFixed(1) }}s / {{ (TARGET_LAP_MS / 1000).toFixed(1) }}s
            </span>
          </div>

          <div class="room__hint">
            {{
              touch
                ? '推左摇杆跑满一圈，按用时评 S/A/B/C，给速度 + 体力经验'
                : 'WASD / 摇杆跑满一圈，按用时评 S/A/B/C，给速度 + 体力经验'
            }}
          </div>

          <Joystick v-if="showJoy" @move="(x, y) => (joy = { x, y })" />
          <ZoomControl />

          <button v-if="nearDoor" class="room__exit jelly" type="button" @click="leave">
            🚪 出门
          </button>
        </div>
      </template>

      <TrainXpHud :keys="['speed', 'stamina']" />
    </PageShell>

    <!-- 一圈跑完的结算卡 -->
    <AppModal v-model="lapOpen" title="跑完一圈" max-width="380px">
      <div v-if="lap && lapInfo" class="sum">
        <p class="sum__grade" :style="{ color: lapInfo.gradeColor }">
          <b>{{ lap.grade }}</b>
          <span>{{ lapInfo.gradeText }}</span>
        </p>
        <p class="sum__line">
          用时 {{ (lap.ms / 1000).toFixed(1) }}s · 标准 {{ lapInfo.target }}s
        </p>
        <p class="sum__xp">+{{ lap.speedXp }} 速度 · +{{ lap.staminaXp }} 体力经验</p>
        <p class="muted sum__line">基础 {{ lap.base }} × 今日额度 {{ Math.round(lap.mul * 100) }}%</p>
        <p class="muted sum__line">{{ lapInfo.quotaNote }}</p>
        <Button variant="primary" block @click="lapOpen = false">继续跑</Button>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.room {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #bfe6ff;
}

.room__plane {
  position: absolute;
  left: 0;
  top: 0;
  background: linear-gradient(180deg, #bfe6ff 0 420px, #86b96a 420px 100%);
  border-bottom: 16px solid #6f9c58;
}

.room__door {
  position: absolute;
  width: 130px;
  height: 62px;
  transform: translate(-50%, -100%);
  border: 4px solid #6f9c58;
  border-bottom: 0;
  border-radius: 62px 62px 0 0;
  background: linear-gradient(180deg, #f2e6c8, #e2d3ab);
}

/* --- 环形跑道 ------------------------------------------------------------- */
.track {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #c85a3c;
}

/* 白色的分道线（沿跑道绕一圈） */
.track__lane {
  position: absolute;
  inset: 92px;
  border-radius: 50%;
  border: 3px dashed rgba(255, 255, 255, 0.55);
}

.track__infield {
  position: absolute;
  inset: 186px;
  border-radius: 50%;
  background: #74a95c;
  box-shadow: inset 0 6px 18px -8px rgba(0, 0, 0, 0.45);
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
  background: rgba(20, 34, 24, 0.7);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.avatar__xptrack {
  display: block;
  width: 56px;
  height: 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.avatar__xptrack i {
  display: block;
  height: 100%;
  border-radius: 999px;
}

.avatar__xpnum {
  font-size: 10px;
  color: #d8ecd4;
}

/* --- 提示 / 统计 ---------------------------------------------------------- */
.room__stat,
.room__hint {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 14px;
  border-radius: var(--r-pill);
  font-size: 12px;
  pointer-events: none;
}

.room__stat {
  top: calc(env(safe-area-inset-top) + 12px);
  background: rgba(20, 34, 24, 0.5);
  color: #f2ffe9;
}

/* --- 本圈：进度 + 用时 ----------------------------------------------------- */
.lapbar {
  position: absolute;
  left: 50%;
  top: calc(env(safe-area-inset-top) + 46px);
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 14px;
  border-radius: var(--r-pill);
  background: rgba(16, 30, 20, 0.55);
  color: #f2ffe9;
  font-size: 12px;
  font-weight: 700;
  pointer-events: none;
  white-space: nowrap;
}

.lapbar__track {
  display: block;
  width: 150px;
  height: 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.lapbar__track b {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #39d0a0, #ffd45c);
}

/* --- 结算卡 --------------------------------------------------------------- */
.sum {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sum__grade {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0;
}

.sum__grade b {
  font-family: var(--font-display);
  font-size: 34px;
  line-height: 1;
}

.sum__grade span {
  font-size: 13px;
  font-weight: 700;
}

.sum__line {
  margin: 0;
  font-size: 12px;
}

.sum__xp {
  margin: 4px 0;
  font-size: 17px;
  font-weight: 800;
  color: #17804a;
}

.room__hint {
  bottom: 20px;
  background: rgba(20, 34, 24, 0.35);
  color: #f2ffe9;
}

.room__exit {
  position: absolute;
  right: max(14px, env(safe-area-inset-right));
  bottom: calc(env(safe-area-inset-bottom) + 186px);
  z-index: 32;
  padding: 12px 22px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.55);
  background: linear-gradient(180deg, #f2b544, #d9942a);
  color: #fff;
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 1px;
  box-shadow: 0 10px 26px rgba(150, 100, 20, 0.45);
  cursor: pointer;
}

.room__exit:active {
  transform: scale(0.94);
}

@media (pointer: fine) {
  .room__exit {
    bottom: calc(env(safe-area-inset-bottom) + 24px);
  }
}
</style>
