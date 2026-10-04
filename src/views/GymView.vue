<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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
  TRAIN_SET_SECONDS,
  TRAIN_SET_TARGET,
  TRAIN_QUALITY,
  TRAIN_GRADE_LABEL,
  TRAIN_GRADE_COLOR,
  TRAIN_DAILY_SETS,
  trainProgress,
  trainXpFor,
  trainJudge,
  trainGradeOf,
  trainSetBaseXp,
  trainComboBonus,
  type TrainGrade,
  type TrainKey,
  type TrainQuality,
} from '../game/training';
import { sfx } from '../game/audio';
import { toastGood } from '../composables/useToast';
import { celebrate } from '../composables/celebrate';
import { useCustomizeStore } from '../stores/customize';
import { useProgressStore } from '../stores/progress';

/**
 * 大世界的「健身房」：**俯视平面房间**（和大世界同一套走动 / 镜头 / 视距）。
 *
 * 走到哑铃区按 E（手机点一下）→ **举起哑铃**，然后用**右摇杆上下往复**：
 * 放到底再举起来算 1 次，每次给一笔「进攻」锻炼经验（见 training.ts）。
 * 再按一次 E / 走开就放下。角色头顶挂着正在练那一项的等级与进度条，
 * 屏幕底部是总览（`TrainXpHud`）。
 */
const router = useRouter();
const customize = useCustomizeStore();
const progress = useProgressStore();

const ROOM_W = 1600;
const ROOM_H = 1100;
/** 门口（画在正下方），走近它就出现「出门」 */
const DOOR = { x: 800, y: 1040 };
const EXIT_RADIUS = 175;

/* --- 走动 + 交互物件 ------------------------------------------------------ */
const stage = ref<HTMLElement | null>(null);
const plane = ref<HTMLElement | null>(null);
const meCanvas = ref<HTMLCanvasElement | null>(null);
const AVATAR_SCALE = 0.8;
const avatarBox = avatarBoxSize(AVATAR_SCALE);
const avatarFeetPad = Math.round(AVATAR_FEET_PAD * AVATAR_SCALE);

/** 三块场地：哑铃区（举重）与沙袋（挥拍）练「进攻」，跑步机练「体力」 */
const LIFT = { id: 'lift', x: 430, y: 470, sign: '🏋️', name: '哑铃区', desc: '举重练「进攻」' };
const BAG = { id: 'bag', x: 930, y: 470, sign: '🥊', name: '沙袋', desc: '挥拍练「进攻」' };
const TREAD = { id: 'tread', x: 1340, y: 470, sign: '🏃', name: '跑步机', desc: '跑步练「体力」' };
const AREAS = [LIFT, BAG, TREAD];

/** 当前在做的动作：站着 / 举重 / 打沙袋 / 上跑步机 */
const mode = ref<'idle' | 'lift' | 'bag' | 'tread'>('idle');
const lifting = computed(() => mode.value === 'lift');
const bagging = computed(() => mode.value === 'bag');
const treading = computed(() => mode.value === 'tread');
/** 跑步机上的里程（px，显示用） */
const treadDist = ref(0);
/** 沙袋被击中一次就 +1（key 一变就重放摆动动画） */
const bagPunch = ref(0);
/** 打沙袋：右摇杆先收回来（≤0.3）再推出去（≥0.8）才算一次挥拍 */
let bagArmed = true;
/** 0 = 完全放下，1 = 举到最高 */
const lift = ref(0);
/** 已经放到底（可以算下一次） */
let armed = true;
/** 这次进房一共做了多少动作 / 拿了多少经验 */
const reps = ref(0);
const sessionXp = ref(0);
/** 右摇杆向量（松手回零） */
const racketJoy = ref({ x: 0, y: 0 });
let liftLast = performance.now();

/* ===== 训练组：一次 20 秒的小挑战 ========================================= */
type GymStation = 'lift' | 'bag' | 'tread';

interface SetState {
  station: GymStation;
  /** 还剩几秒 */
  left: number;
  /** 质量分（含连击加成） */
  score: number;
  /** 有效动作（Perfect / Good） */
  reps: number;
  perfect: number;
  combo: number;
  bestCombo: number;
  /** 开组时刻 / 上一次动作时刻 / 跑步机下一次判定的时刻（都是 ms） */
  startAt: number;
  lastAt: number;
  tick: number;
}

/** 正在进行的那一组（null = 没在练） */
const set = ref<SetState | null>(null);
/** 这一组的结算卡（null = 没弹） */
const result = ref<{
  station: GymStation;
  key: TrainKey;
  grade: TrainGrade;
  reps: number;
  perfect: number;
  bestCombo: number;
  base: number;
  mul: number;
  xp: number;
  setsToday: number;
  up: TrainKey[];
} | null>(null);
const resultOpen = computed({
  get: () => result.value !== null,
  set: (v: boolean) => {
    if (!v) result.value = null;
  },
});
/** 节奏条：上一次动作到现在走了多少个节拍（0~1，满格 ≈ 该出手了） */
const beatPct = ref(0);
/** 跑步机现在是「冲刺」还是「慢跑」（间隔训练） */
const treadPush = ref(true);

/** 这台器械练哪一维（跑步机练体力，其余练进攻） */
const stationKey = (s: GymStation): TrainKey => (s === 'tread' ? 'stamina' : 'attack');

function startSet(station: GymStation): void {
  const now = performance.now();
  set.value = {
    station,
    left: TRAIN_SET_SECONDS,
    score: 0,
    reps: 0,
    perfect: 0,
    combo: 0,
    bestCombo: 0,
    startAt: now,
    lastAt: now,
    tick: now + 500,
  };
  beatPct.value = 0;
  sfx.click();
}

/** 记一次动作的质量：Perfect / Good 攒分并续连击，Miss 断连 */
function applyQuality(q: TrainQuality): void {
  const s = set.value;
  if (!s) return;
  if (q === 'miss') {
    s.combo = 0;
    return;
  }
  s.reps += 1;
  s.combo += 1;
  s.bestCombo = Math.max(s.bestCombo, s.combo);
  if (q === 'perfect') s.perfect += 1;
  s.score += TRAIN_QUALITY[q] * trainComboBonus(s.combo);
}

/** 举重 / 沙袋：按「距上一次动作的间隔」判质量（跟着节奏条做就是 Perfect） */
function judgeAction(): void {
  const s = set.value;
  if (!s) return;
  const now = performance.now();
  const dt = (now - s.lastAt) / 1000;
  s.lastAt = now;
  applyQuality(trainJudge(dt, TRAIN_SET_TARGET[s.station].beat).quality);
}

/** 跑步机：每 0.5 秒判一次「配速」——3 秒冲刺、3 秒慢跑交替，跟着提示推摇杆 */
function judgeTread(now: number): void {
  const s = set.value;
  if (!s || s.station !== 'tread' || now < s.tick) return;
  s.tick = now + 500;
  const push = Math.floor((now - s.startAt) / 3000) % 2 === 0;
  treadPush.value = push;
  const mag = Math.min(1, Math.hypot(rawJoy.value.x, rawJoy.value.y));
  let q: TrainQuality = 'miss';
  if (push) {
    if (mag >= 0.7) q = 'perfect';
    else if (mag >= 0.45) q = 'good';
  } else if (mag >= 0.25 && mag <= 0.65) {
    q = 'perfect';
  } else if (mag >= 0.15 && mag <= 0.8) {
    q = 'good';
  }
  applyQuality(q);
}

/** 一组结束：评级 → 每日额度 → 发经验 → 弹结算卡 */
function finishSet(): void {
  const s = set.value;
  if (!s) return;
  set.value = null;
  mode.value = 'idle';
  standTarget = null;
  racketJoy.value = { x: 0, y: 0 };
  joy.value = { ...rawJoy.value };
  beatPct.value = 0;
  if (s.reps === 0) return; // 一次都没做成 → 不算一组、也不占额度
  const key = stationKey(s.station);
  const grade = trainGradeOf(s.score, TRAIN_SET_TARGET[s.station].target);
  const base = trainSetBaseXp(grade);
  const r = progress.finishTrainSet(key, base);
  sessionXp.value += r.xp;
  for (const k of r.up) {
    toastGood(`${TRAIN_META[k].label} 升到 Lv.${progress.trainLevels[k]}！`);
    celebrate(1, [TRAIN_META[k].color]);
  }
  sfx.point();
  result.value = {
    station: s.station,
    key,
    grade,
    reps: s.reps,
    perfect: s.perfect,
    bestCombo: s.bestCombo,
    base,
    mul: r.mul,
    xp: r.xp,
    setsToday: r.setsToday,
    up: r.up,
  };
}

/** 结算卡上显示的东西 */
const resultInfo = computed(() => {
  const r = result.value;
  if (!r) return null;
  const meta = TRAIN_META[r.key];
  const stationName = { lift: '哑铃区', bag: '沙袋', tread: '跑步机' }[r.station];
  return {
    stationName,
    title: `${meta.label}训练 · ${stationName}`,
    gradeText: TRAIN_GRADE_LABEL[r.grade],
    gradeColor: TRAIN_GRADE_COLOR[r.grade],
    label: meta.label,
    color: meta.color,
    quotaNote:
      r.setsToday <= TRAIN_DAILY_SETS
        ? `今日第 ${r.setsToday} / ${TRAIN_DAILY_SETS} 组（满额）`
        : r.mul > 0
          ? `今日第 ${r.setsToday} 组 · 已超额，只给 ${Math.round(r.mul * 100)}%`
          : `今日第 ${r.setsToday} 组 · 今日额度已用完`,
  };
});

/** 头顶那条：现在在练的那一项（跑步机练体力，其它练进攻） */
const head = computed(() => {
  const k = treading.value ? 'stamina' : 'attack';
  const level = progress.trainLevels[k] ?? 0;
  const xp = progress.trainXp[k] ?? 0;
  return {
    icon: k === 'stamina' ? '💪' : '🏋️',
    label: TRAIN_META[k].label,
    level,
    pct: Math.round(trainProgress(level, xp) * 100),
    text: level >= TRAIN_MAX_LEVEL ? '满级' : `${xp}/${trainXpFor(level)}`,
    color: TRAIN_META[k].color,
  };
});

function paintMe(now: number): void {
  const c = meCanvas.value;
  if (!c) return;
  const rj = racketJoy.value;
  paintAvatar(c, customize.cosmetic, now, {
    scale: AVATAR_SCALE,
    facing,
    // 举重：手上换成哑铃、手臂跟着「举起的程度」抬；站着：两手空着；打沙袋：正常拿拍
    noRacket: !bagging.value,
    dumbbell: lifting.value,
    racket: bagging.value
      ? { rx: 14 + rj.x * 54, ry: -30 + rj.y * 40 }
      : treading.value
        ? { rx: -6 + Math.sin(now / 90) * 10, ry: -52 - Math.sin(now / 180) * 14 }
        : { rx: -4, ry: -56 - lift.value * 52 },
  });
}

function stepLift(now: number): void {
  const dt = Math.min((now - liftLast) / 1000, 0.05);
  liftLast = now;
  const target = lifting.value ? Math.max(0, Math.min(1, -racketJoy.value.y)) : 0;
  lift.value += (target - lift.value) * Math.min(1, dt * 14);
  if (lift.value <= 0.12) armed = true;
  else if (armed && lift.value >= 0.85) {
    armed = false;
    countRep();
  }
}

/** 一次动作（举重 / 打沙袋）：只判质量，经验在「一组结束」时一次性结算 */
function countRep(fromBag = false): void {
  reps.value += 1;
  if (fromBag) {
    bagPunch.value += 1;
    sfx.hit('smash');
  } else {
    sfx.hit('drive');
  }
  judgeAction();
}

/** 打沙袋：右摇杆推出去一次 = 一次有效挥拍（要先收回来才能再算） */
function stepBag(): void {
  const mag = Math.hypot(racketJoy.value.x, racketJoy.value.y);
  if (mag <= 0.3) bagArmed = true;
  else if (bagArmed && mag >= 0.8) {
    bagArmed = false;
    countRep(true);
  }
}

/** 跑步机：推着左摇杆就在跑（里程只用来显示），配速判定见 judgeTread */
function stepTread(dt: number): void {
  const mag = Math.min(1, Math.hypot(rawJoy.value.x, rawJoy.value.y));
  const d = 380 * mag * dt;
  if (d > 0.5) treadDist.value += d;
}

/** 朝向：跟着走动方向翻面；frameLast 给跑步机算 dt */
let facing: 1 | -1 = 1;
let frameLast = performance.now();

const walk = useWalk({
  stage,
  plane,
  width: ROOM_W,
  height: ROOM_H,
  radius: 210,
  objects: () => AREAS,
  spawn: { x: 800, y: 320 },
  onEnter: (id) => {
    toggleAction(id);
  },
  onFrame: (now) => {
    const dt = Math.min((now - frameLast) / 1000, 0.05);
    frameLast = now;
    if (joy.value.x) facing = joy.value.x > 0 ? 1 : -1;
    // 刚点了器械：先走过去站好，站定之前不算动作（免得走路也在跑步机上刷里程）
    stepToMachine(dt);
    if (standTarget) {
      paintMe(now);
      return;
    }
    // 站定了 → 开始这一组；倒计时走完 → 结算
    const s = set.value;
    if (!s && mode.value !== 'idle') {
      startSet(mode.value as GymStation);
    } else if (s) {
      s.left -= dt;
      if (s.left <= 0) {
        finishSet();
        paintMe(now);
        return;
      }
    }
    if (bagging.value) stepBag();
    else if (treading.value) {
      stepTread(dt);
      judgeTread(now);
    } else stepLift(now);
    // 节奏条：举重 / 沙袋按「距上次动作多久」走，满格 ≈ 该出手了
    const cur = set.value;
    if (cur && TRAIN_SET_TARGET[cur.station].beat > 0) {
      beatPct.value = Math.min(1, (now - cur.lastAt) / (TRAIN_SET_TARGET[cur.station].beat * 1000));
    }
    paintMe(now);
  },
});
const { me, joy, nearId, tryEnter } = walk;

/** 左摇杆原始输入：站着时用来走动，在器械上时只当动作输入（人不动） */
const rawJoy = ref({ x: 0, y: 0 });

function onWalkMove(x: number, y: number): void {
  rawJoy.value = { x, y };
  joy.value = mode.value === 'idle' ? { x, y } : { x: 0, y: 0 };
}

/** 点了器械之后要走到哪儿站好（器械中心往下一点＝站在上面 / 站在前面） */
function standPos(a: { x: number; y: number }): { x: number; y: number } {
  return { x: a.x, y: a.y + 70 };
}

/** 还没走到器械上时这里非空：走过去的过程就是「把人物移动到器械上」 */
let standTarget: { x: number; y: number } | null = null;

/** 每帧朝目标点走一小步（人站定了就把目标清掉） */
function stepToMachine(dt: number): void {
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
  if (Math.abs(dx) > 4) facing = dx > 0 ? 1 : -1;
  const step = Math.min(d, 560 * dt);
  me.value = { x: me.value.x + (dx / d) * step, y: me.value.y + (dy / d) * step };
}

function toggleAction(id: string): void {
  const want =
    id === 'lift' ? 'lift' : id === 'bag' ? 'bag' : id === 'tread' ? 'tread' : null;
  if (!want) return;
  if (result.value) return; // 结算卡还开着：别让 E / 点击又开一组
  // 已经在这台器械上 → 提前收手（这一组按已有成绩结算）
  if (mode.value === want) {
    if (set.value) finishSet();
    else {
      mode.value = 'idle';
      standTarget = null;
      racketJoy.value = { x: 0, y: 0 };
      joy.value = { ...rawJoy.value };
    }
    return;
  }
  // 换台 / 从站着上器械：先把没结算的那组结掉
  if (set.value) finishSet();
  mode.value = want;
  armed = true;
  bagArmed = true;
  racketJoy.value = { x: 0, y: 0 };
  joy.value = { x: 0, y: 0 };
  sfx.click();
  // 站到器械上去（跑步机就站在带子上，哑铃区 / 沙袋站在它前面）
  const a = AREAS.find((v) => v.id === want);
  standTarget = a ? standPos(a) : null;
}

/** 右下角那个图标按钮：靠近哪块场地就显示哪一块，做着动作时变成「收手」 */
const action = computed(() => {
  if (mode.value !== 'idle') return { icon: '✋', label: '收手' };
  if (nearId.value === 'lift') return { icon: '🏋️', label: '举起哑铃' };
  if (nearId.value === 'bag') return { icon: '🥊', label: '挥拍打沙袋' };
  if (nearId.value === 'tread') return { icon: '🏃', label: '上跑步机' };
  return null;
});

function onAction(): void {
  toggleAction(mode.value !== 'idle' ? mode.value : (nearId.value ?? ''));
}

/** 站在门口：右下角出现「出门」 */
const nearDoor = computed(
  () => Math.hypot(me.value.x - DOOR.x, me.value.y - DOOR.y) < EXIT_RADIUS,
);

const touch = isTouchDevice();
const { always: joyAlways } = useJoystickPrefs();
const showJoy = computed(() => touch || joyAlways.value);
const prompt = computed(() => {
  if (lifting.value) return '右摇杆上下往复举重 —— 跟着上面的节奏条做，越齐越准';
  if (bagging.value) return '右摇杆推出去再收回来 —— 跟着上面的节奏条做，越齐越准';
  if (treading.value) {
    return treadPush.value ? '冲刺！左摇杆推满' : '慢跑 —— 左摇杆轻轻推着';
  }
  return '';
});

function leave(): void {
  sfx.click();
  void router.push('/');
}

function back(): void {
  void router.push('/');
}

// 走开自动收手（正在进行的那一组按已有成绩结算）
watch(nearId, (v) => {
  if (!v && mode.value !== 'idle') {
    if (set.value) finishSet();
    else {
      mode.value = 'idle';
      standTarget = null;
      racketJoy.value = { x: 0, y: 0 };
    }
  }
});
</script>

<template>
  <div class="page page--playing">
    <PageShell title="健身房" back @back="back">
      <template #stage>
        <div ref="stage" class="room">
          <div
            ref="plane"
            class="room__plane"
            :style="{ width: `${ROOM_W}px`, height: `${ROOM_H}px` }"
          >
            <!-- 哑铃架：一排三副哑铃 -->
            <div class="rack" :style="{ left: `${LIFT.x}px`, top: `${LIFT.y - 130}px` }">
              <div class="rack__bar" />
              <div class="rack__set">
                <span v-for="i in 3" :key="i" class="dumbbell" />
              </div>
            </div>

            <!-- 沙袋：吊在架子上，每打中一次摆一下 -->
            <div class="bag" :style="{ left: `${BAG.x}px`, top: `${BAG.y - 160}px` }">
              <div class="bag__rope" />
              <div :key="bagPunch" class="bag__body" />
            </div>

            <!-- 跑步机：推着左摇杆跑，带子在滚 -->
            <div class="tread" :style="{ left: `${TREAD.x}px`, top: `${TREAD.y + 30}px` }">
              <div class="tread__belt" :class="{ 'is-run': treading }" />
              <div class="tread__deck" />
            </div>

            <!-- 两块场地的交互卡（靠近高亮 / 点它开始） -->
            <div
              v-for="a in AREAS"
              :key="a.id"
              class="area jelly"
              :class="{ 'is-near': nearId === a.id, 'is-on': nearId === a.id && mode !== 'idle' }"
              :style="{ left: `${a.x}px`, top: `${a.y + 150}px` }"
              @click="tryEnter(a.id)"
            >
              <span class="area__sign">{{ a.sign }}</span>
              <span class="area__name">{{ a.name }}</span>
              <span class="area__desc">{{ a.desc }}</span>
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
              <!-- 头顶：正在练的那一项（等级 + 进度条），跟着人走 -->
              <div class="avatar__xp">
                <span class="avatar__xplabel" :style="{ color: head.color }">
                  {{ head.icon }} {{ head.label }} Lv.{{ head.level }}
                </span>
                <span class="avatar__xptrack"><i :style="{ width: `${head.pct}%`, background: head.color }" /></span>
                <span class="avatar__xpnum num">{{ head.text }}</span>
              </div>
              <canvas ref="meCanvas" class="avatar__rig" />
            </div>
          </div>

          <!-- 本场统计 -->
          <div class="room__stat">
            本次 {{ reps }} 次 · 训练经验 +{{ sessionXp
            }}<template v-if="treadDist > 0"> · 跑了 {{ Math.round(treadDist / 32) }} m</template>
          </div>

          <!-- 训练组：倒计时 + 节奏条 + 连击 -->
          <div v-if="set" class="setbar">
            <span class="setbar__time num">⏱ {{ Math.ceil(set.left) }}s</span>
            <span
              v-if="TRAIN_SET_TARGET[set.station].beat > 0"
              class="setbar__beat"
              :style="{ '--fill': `${Math.round(beatPct * 100)}%` }"
            >
              <i class="setbar__zone" />
              <b />
            </span>
            <span v-else class="setbar__pace" :class="{ 'is-push': treadPush }">
              {{ treadPush ? '冲刺' : '慢跑' }}
            </span>
            <span class="setbar__combo">🔥 {{ set.combo }}</span>
            <span class="setbar__score num">{{ set.score.toFixed(1) }}</span>
          </div>

          <div class="room__prompt" :class="{ 'is-on': !!prompt }">{{ prompt }}</div>

          <!-- 左：走动（上器械后不动）；右：举重上下往复 / 打沙袋推出去 -->
          <Joystick v-if="showJoy" @move="onWalkMove" />
          <Joystick
            v-if="showJoy && (lifting || bagging)"
            side="right"
            @move="(x, y) => (racketJoy = { x, y })"
          />
          <ZoomControl />

          <!-- 靠近场地：右下角弹出图标按钮（手机点它开练，桌面也可以按 E） -->
          <button v-if="action" class="room-enter" type="button" @click="onAction">
            {{ action.icon }} {{ action.label }}
          </button>

          <button v-if="nearDoor" class="room__exit jelly" type="button" @click="leave">
            🚪 出门
          </button>
        </div>
      </template>

      <TrainXpHud :keys="['attack', 'stamina']" />
    </PageShell>

    <!-- 一组练完的结算卡 -->
    <AppModal v-model="resultOpen" title="训练结束" max-width="380px">
      <div v-if="result && resultInfo" class="sum">
        <p class="sum__grade" :style="{ color: resultInfo.gradeColor }">
          <b>{{ result.grade }}</b>
          <span>{{ resultInfo.gradeText }}</span>
        </p>
        <p class="sum__title">{{ resultInfo.title }}</p>
        <p class="muted sum__line">
          有效动作 {{ result.reps }} · Perfect {{ result.perfect }} · 最高连击 {{ result.bestCombo }}
        </p>
        <p class="sum__xp" :style="{ color: resultInfo.color }">
          +{{ result.xp }} {{ resultInfo.label }}经验
        </p>
        <p class="muted sum__line">基础 {{ result.base }} × 今日额度 {{ Math.round(result.mul * 100) }}%</p>
        <p class="muted sum__line">{{ resultInfo.quotaNote }}</p>
        <Button variant="primary" block @click="resultOpen = false">继续</Button>
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
  background: #2f3440;
}

.room__plane {
  position: absolute;
  left: 0;
  top: 0;
  background:
    linear-gradient(180deg, #3a4150 0 150px, #545b6b 150px 100%),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 2px, transparent 2px 90px);
  border-bottom: 16px solid #232833;
}

.room__door {
  position: absolute;
  width: 130px;
  height: 62px;
  transform: translate(-50%, -100%);
  border: 4px solid #232833;
  border-bottom: 0;
  border-radius: 62px 62px 0 0;
  background: linear-gradient(180deg, #6f7a8c, #4c5563);
}

/* --- 哑铃架 --------------------------------------------------------------- */
.rack {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 320px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  border-radius: 14px;
  border: 3px solid #232833;
  background: linear-gradient(180deg, #4b5261, #333944);
}

.rack__bar {
  width: 300px;
  height: 10px;
  border-radius: 6px;
  background: linear-gradient(180deg, #9aa3b4, #6b7383);
}

.rack__set {
  display: flex;
  gap: 42px;
}

.dumbbell {
  position: relative;
  display: block;
  width: 46px;
  height: 8px;
  border-radius: 4px;
  background: #3a4048;
}

.dumbbell::before,
.dumbbell::after {
  content: '';
  position: absolute;
  top: -8px;
  width: 10px;
  height: 24px;
  border-radius: 4px;
  background: #e0a13a;
}

.dumbbell::before {
  left: -8px;
}

.dumbbell::after {
  right: -8px;
}

/* --- 交互按钮 ------------------------------------------------------------- */
.area {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 20px 8px;
  border-radius: 14px;
  border: 2px solid #6b7383;
  background: linear-gradient(180deg, #4b5261, #333944);
  box-shadow: 0 6px 14px -6px rgba(0, 0, 0, 0.6);
  cursor: pointer;
}

.area.is-near {
  border-color: #ffd45c;
  box-shadow: 0 0 0 3px rgba(255, 212, 92, 0.45), 0 6px 14px -6px rgba(0, 0, 0, 0.6);
}

.area.is-on {
  border-color: #7fe08f;
}

.area__sign {
  font-size: 30px;
  line-height: 1;
}

.area__name {
  font-size: 14px;
  font-weight: 800;
  color: #fff4dc;
}

.area__desc {
  font-size: 11px;
  color: #cfd6e2;
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
  background: rgba(20, 26, 34, 0.72);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.avatar__xplabel {
  font-size: 11px;
}

.avatar__xptrack {
  display: block;
  width: 64px;
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
  color: #cfe0cf;
}

/* --- 提示 / 统计 ---------------------------------------------------------- */
.room__prompt,
.room__stat {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 14px;
  border-radius: var(--r-pill);
  font-size: 12px;
  pointer-events: none;
}

.room__prompt {
  bottom: 96px;
  background: rgba(20, 26, 34, 0.6);
  color: #f2ffe9;
  opacity: 0;
  transition: opacity 0.2s;
}

.room__prompt.is-on {
  opacity: 1;
}

.room__stat {
  top: calc(env(safe-area-inset-top) + 12px);
  background: rgba(20, 26, 34, 0.45);
  color: #e6eefc;
}

/* --- 训练组：倒计时 + 节奏条 + 连击 ---------------------------------------- */
.setbar {
  position: absolute;
  left: 50%;
  top: calc(env(safe-area-inset-top) + 46px);
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-radius: var(--r-pill);
  background: rgba(16, 22, 30, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #eaf3ff;
  font-size: 13px;
  font-weight: 800;
  pointer-events: none;
  white-space: nowrap;
}

.setbar__time {
  color: #ffd45c;
}

/* 节奏条：绿色区是 Perfect 窗口；白色填充走到绿区里出手最准 */
.setbar__beat {
  position: relative;
  display: block;
  width: 130px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  overflow: hidden;
}

.setbar__zone {
  position: absolute;
  left: 55%;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(55, 214, 122, 0.3);
}

.setbar__beat b {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--fill, 0%);
  border-radius: 999px;
  background: linear-gradient(90deg, #8fbcff, #ffffff);
}

.setbar__pace {
  padding: 1px 10px;
  border-radius: 999px;
  background: rgba(61, 139, 253, 0.3);
  color: #dbe9ff;
}

.setbar__pace.is-push {
  background: rgba(255, 90, 77, 0.35);
  color: #ffe3e0;
}

.setbar__combo {
  color: #ffb347;
}

.setbar__score {
  color: #9fe6b0;
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

.sum__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.sum__line {
  margin: 0;
  font-size: 12px;
}

.sum__xp {
  margin: 4px 0;
  font-size: 18px;
  font-weight: 800;
}

.room__exit {
  position: absolute;
  right: max(14px, env(safe-area-inset-right));
  bottom: calc(env(safe-area-inset-bottom) + 250px);
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
  .room-enter {
    bottom: calc(env(safe-area-inset-bottom) + 24px);
  }

  .room__exit {
    bottom: calc(env(safe-area-inset-bottom) + 88px);
  }
}

/* --- 沙袋 ----------------------------------------------------------------- */
.bag {
  position: absolute;
  transform: translate(-50%, 0);
  width: 74px;
  height: 190px;
}

.bag__rope {
  width: 4px;
  height: 56px;
  margin: 0 auto;
  background: #2b3038;
}

.bag__body {
  width: 74px;
  height: 122px;
  border-radius: 12px 12px 16px 16px;
  border: 3px solid #2b3038;
  background: linear-gradient(180deg, #7a2f2f, #5a2020);
  box-shadow: inset 0 -10px 18px -8px rgba(0, 0, 0, 0.6);
  transform-origin: 50% -58px;
  animation: bag-swing 0.55s ease-out;
}

@keyframes bag-swing {
  0% {
    transform: rotate(0deg);
  }

  30% {
    transform: rotate(14deg);
  }

  60% {
    transform: rotate(-9deg);
  }

  100% {
    transform: rotate(0deg);
  }
}

/* --- 右下角图标按钮（靠近场地出现；和大世界的「进入」同一款） ---------------- */
.room-enter {
  position: absolute;
  right: max(14px, env(safe-area-inset-right));
  bottom: calc(env(safe-area-inset-bottom) + 186px);
  z-index: 32;
  padding: 12px 22px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.55);
  background: linear-gradient(180deg, #37d67a, #1fa85c);
  color: #fff;
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 1px;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
  box-shadow: 0 10px 26px rgba(20, 120, 60, 0.45);
  cursor: pointer;
  animation: enter-pop 0.22s var(--ease);
}

.room-enter:active {
  transform: scale(0.94);
}

@keyframes enter-pop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.9);
  }
}

/* --- 跑步机 --------------------------------------------------------------- */
.tread {
  position: absolute;
  transform: translate(-50%, 0);
  width: 190px;
  height: 130px;
}

.tread__belt {
  width: 190px;
  height: 46px;
  border-radius: 10px;
  border: 3px solid #232833;
  background: repeating-linear-gradient(90deg, #4b5261 0 12px, #3a4150 12px 24px);
  background-size: 24px 100%;
}

.tread__belt.is-run {
  animation: belt-run 0.45s linear infinite;
}

@keyframes belt-run {
  to {
    background-position: -24px 0;
  }
}

.tread__deck {
  width: 206px;
  height: 16px;
  margin: -4px 0 0 -8px;
  border-radius: 8px;
  background: linear-gradient(180deg, #6b7383, #333944);
}
</style>
