<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import Joystick from '../components/ui/Joystick.vue';
import TrainXpHud from '../components/TrainXpHud.vue';
import { useWalk } from '../composables/useWalk';
import { isTouchDevice } from '../game/device';
import { useJoystickPrefs } from '../composables/useJoystick';
import { AVATAR_FEET_PAD, avatarBoxSize, paintAvatar } from '../game/draw/canvas2d';
import {
  TRAIN_META,
  TRAIN_MAX_LEVEL,
  TRAIN_XP_PER,
  trainProgress,
  trainXpFor,
  type TrainKey,
} from '../game/training';
import { sfx } from '../game/audio';
import { toastGood } from '../composables/useToast';
import { celebrate } from '../composables/celebrate';
import { useCustomizeStore } from '../stores/customize';
import { useProgressStore } from '../stores/progress';

/**
 * 大世界的「健身房」：**俯视平面房间**（和大世界同一套走动 / 镜头 / 视距）。
 *
 * 走到哑铃 / 沙袋 / 跑步机旁边按 E（手机点一下）就开始练，**一台器械只管一维**：
 * - 🏋️ 哑铃区：右摇杆上下往复，举一次给「进攻」经验；
 * - 🥊 沙袋：右摇杆推出去再收回来，挥一拳给「技术」经验；
 * - 🏃 跑步机：左摇杆推着跑，跑得越多给越多「体力」经验。
 * 没有节奏判定、没有 20 秒一组、也没有评级与每日额度——做一次记一次。
 * 角色头顶挂着正在练那一项的等级与进度条，屏幕底部是总览（`TrainXpHud`）。
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
/** 角色那块 DOM：位置每帧直写 style（不绑 `me`，否则走动时整页每帧重渲染） */
const meBox = ref<HTMLElement | null>(null);
const AVATAR_SCALE = 0.8;
const avatarBox = avatarBoxSize(AVATAR_SCALE);
const avatarFeetPad = Math.round(AVATAR_FEET_PAD * AVATAR_SCALE);

/** 三台器械各练一维：举重 → 进攻，沙袋 → 技术，跑步机 → 体力 */
const LIFT = { id: 'lift', x: 430, y: 470, sign: '🏋️', name: '哑铃区', desc: '举重 +进攻' };
const BAG = { id: 'bag', x: 930, y: 470, sign: '🥊', name: '沙袋', desc: '挥拍 +技术' };
const TREAD = { id: 'tread', x: 1340, y: 470, sign: '🏃', name: '跑步机', desc: '跑步 +体力' };
const AREAS = [LIFT, BAG, TREAD];

/** 当前在做的动作：站着 / 举重 / 打沙袋 / 上跑步机 */
const mode = ref<'idle' | 'lift' | 'bag' | 'tread'>('idle');
const lifting = computed(() => mode.value === 'lift');
const bagging = computed(() => mode.value === 'bag');
const treading = computed(() => mode.value === 'tread');

/** 跑步机上的里程（px，显示用） */
const treadDist = ref(0);
/** 沙袋被打一拳就 +1（key 一变就重放摆动动画） */
const bagPunch = ref(0);
/** 这次进房一共做了多少动作 / 拿了多少经验 */
const reps = ref(0);
const sessionXp = ref(0);
/** 0 = 完全放下，1 = 举到最高 */
const lift = ref(0);
/** 右摇杆向量（松手回零） */
const racketJoy = ref({ x: 0, y: 0 });
/** 左摇杆原始输入：站着时用来走动，在器械上时只当动作输入（人不动） */
const rawJoy = ref({ x: 0, y: 0 });
let armed = true;
let bagArmed = true;
let liftLast = performance.now();
/** 跑步机：累计里程（每跑够一段给一次经验） */
let treadAccum = 0;

/* --- 飘字（做一次动作 +N） ------------------------------------------------ */
interface Pop {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}
const pops = ref<Pop[]>([]);
let popSeq = 0;
function addPop(text: string, color: string): void {
  const p: Pop = { id: ++popSeq, x: me.value.x, y: me.value.y - 190, text, color };
  pops.value = [...pops.value, p];
  window.setTimeout(() => {
    pops.value = pops.value.filter((v) => v.id !== p.id);
  }, 900);
}

/** 给某一维加经验，升级了就弹提示 + 庆祝 */
function addXp(key: TrainKey, amount: number): void {
  for (const k of progress.train({ [key]: amount } as Partial<Record<TrainKey, number>>)) {
    toastGood(`${TRAIN_META[k].label} 升到 Lv.${progress.trainLevels[k]}！`);
    celebrate(1, [TRAIN_META[k].color]);
  }
}

/** 记一次动作：加经验 + 飘字 + 累加本场统计 */
function gain(key: TrainKey, amount: number): void {
  reps.value += 1;
  sessionXp.value += amount;
  addXp(key, amount);
  addPop(`+${amount} ${TRAIN_META[key].label}`, TRAIN_META[key].color);
}

/** 朝向：跟着走动方向翻面；frameLast 给跑步机算 dt */
let facing: 1 | -1 = 1;
let frameLast = performance.now();

/** 角色 DOM 的位置（直写 style，跳过响应式） */
function syncMe(): void {
  const el = meBox.value;
  if (!el) return;
  el.style.left = `${me.value.x}px`;
  el.style.top = `${me.value.y}px`;
}

/** 站在门口：右下角出现「出门」。**不是 computed**（依赖每帧在动的坐标），
 *  在 onFrame 里按变化才写，避免走动时整页每帧重渲染。 */
const nearDoor = ref(false);

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
    sfx.hit('drive');
    gain('attack', TRAIN_XP_PER.lift);
  }
}

/** 打沙袋：右摇杆推出去一次 = 一次有效挥拍（要先收回来才能再算） */
function stepBag(): void {
  const mag = Math.hypot(racketJoy.value.x, racketJoy.value.y);
  if (mag <= 0.3) bagArmed = true;
  else if (bagArmed && mag >= 0.8) {
    bagArmed = false;
    bagPunch.value += 1;
    sfx.hit('smash');
    gain('technique', TRAIN_XP_PER.bag);
  }
}

/** 跑步机：推着左摇杆就在跑，每跑够一段给一次「体力」经验 */
function stepTread(dt: number): void {
  const mag = Math.min(1, Math.hypot(rawJoy.value.x, rawJoy.value.y));
  const d = 380 * mag * dt;
  if (d <= 0.5) return;
  treadDist.value += d;
  treadAccum += d;
  if (treadAccum >= 380) {
    treadAccum -= 380;
    gain('stamina', TRAIN_XP_PER.tread);
  }
}

const walk = useWalk({
  stage,
  plane,
  width: ROOM_W,
  height: ROOM_H,
  radius: 210,
  objects: () => AREAS,
  spawn: { x: 800, y: 640 },
  onEnter: (id) => {
    toggleAction(id);
  },
  onFrame: (now) => {
    const dt = Math.min((now - frameLast) / 1000, 0.05);
    frameLast = now;
    if (joy.value.x) facing = joy.value.x > 0 ? 1 : -1;
    // 刚点了器械：先走过去站好，站定之前不做动作
    stepToMachine(dt);
    if (!standTarget) {
      if (bagging.value) stepBag();
      else if (treading.value) stepTread(dt);
      else stepLift(now);
    }
    paintMe(now);
    // 走动替身：位置直写 DOM、门口提示按变化才写（都不走模板绑定）
    syncMe();
    const nd = Math.hypot(me.value.x - DOOR.x, me.value.y - DOOR.y) < EXIT_RADIUS;
    if (nearDoor.value !== nd) nearDoor.value = nd;
  },
});
const { me, joy, nearId, tryEnter } = walk;

function onWalkMove(x: number, y: number): void {
  rawJoy.value = { x, y };
  joy.value = mode.value === 'idle' ? { x, y } : { x: 0, y: 0 };
}

/** 点了器械之后要走到哪儿站好（器械中心往下一点＝站上去 / 站前面） */
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

/** 从器械上下来（不管在做什么，直接回站立状态） */
function dismount(): void {
  mode.value = 'idle';
  standTarget = null;
  racketJoy.value = { x: 0, y: 0 };
  joy.value = { ...rawJoy.value };
  lift.value = 0;
  treadAccum = 0;
}

function toggleAction(id: string): void {
  const want = id === 'lift' ? 'lift' : id === 'bag' ? 'bag' : id === 'tread' ? 'tread' : null;
  if (!want) return;
  // 已经在这台器械上 → 收手
  if (mode.value === want) {
    dismount();
    return;
  }
  mode.value = want;
  armed = true;
  bagArmed = true;
  lift.value = 0;
  treadAccum = 0;
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

/** 当前这台器械练哪一维（站着时默认显示举重那一项） */
const HEAD_KEY: Record<'idle' | 'lift' | 'bag' | 'tread', TrainKey> = {
  idle: 'attack',
  lift: 'attack',
  bag: 'technique',
  tread: 'stamina',
};
const HEAD_ICON: Record<TrainKey, string> = {
  attack: '🏋️',
  technique: '🎯',
  stamina: '💪',
  speed: '🏃',
  defense: '🛡️',
};

/** 头顶那条：现在在练的那一项 */
const head = computed(() => {
  const k: TrainKey = HEAD_KEY[mode.value];
  const level = progress.trainLevels[k] ?? 0;
  const xp = progress.trainXp[k] ?? 0;
  return {
    icon: HEAD_ICON[k],
    label: TRAIN_META[k].label,
    level,
    pct: Math.round(trainProgress(level, xp) * 100),
    text: level >= TRAIN_MAX_LEVEL ? '满级' : `${xp}/${trainXpFor(level)}`,
    color: TRAIN_META[k].color,
  };
});

const touch = isTouchDevice();
const { always: joyAlways } = useJoystickPrefs();
const showJoy = computed(() => touch || joyAlways.value);
const prompt = computed(() => {
  if (lifting.value) return '右摇杆上下往复举重 —— 每举起一次都给「进攻」经验';
  if (bagging.value) return '右摇杆推出去再收回来 —— 每挥一拳都给「技术」经验';
  if (treading.value) return '左摇杆推着跑 —— 跑得越多，「体力」经验越多';
  return '';
});

function leave(): void {
  sfx.click();
  void router.push('/');
}

function back(): void {
  void router.push('/');
}

// 走开自动收手
watch(nearId, (v) => {
  if (!v && mode.value !== 'idle') dismount();
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
            <!-- 墙上的窗（暖光透进来） -->
            <div class="window" :style="{ left: '800px' }" />
            <div class="window" :style="{ left: '1150px' }" />

            <!-- 哑铃区背后的练功镜 -->
            <div class="mirror" :style="{ left: `${LIFT.x}px` }" />

            <!-- 哑铃架 -->
            <div class="rack" :style="{ left: `${LIFT.x}px`, top: `${LIFT.y - 110}px` }">
              <div class="rack__top">
                <span v-for="i in 3" :key="i" class="dumbbell" />
              </div>
              <div class="rack__legs" />
            </div>

            <!-- 沙袋：吊在架子上，每打中一次摆一下 -->
            <div class="bag" :style="{ left: `${BAG.x}px`, top: `${BAG.y - 190}px` }">
              <div class="bag__frame" />
              <div class="bag__rope" />
              <div :key="bagPunch" class="bag__body" />
            </div>

            <!-- 跑步机：推着左摇杆跑，带子在滚 -->
            <div class="tread" :style="{ left: `${TREAD.x}px`, top: `${TREAD.y + 20}px` }">
              <div class="tread__deck">
                <div class="tread__belt" :class="{ 'is-run': treading }" />
              </div>
              <div class="tread__console" />
            </div>

            <!-- 三块场地的交互卡（靠近高亮 / 点它开始） -->
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

            <!-- 做一次动作的飘字 -->
            <div
              v-for="p in pops"
              :key="p.id"
              class="pop"
              :style="{ left: `${p.x}px`, top: `${p.y}px`, color: p.color }"
            >
              {{ p.text }}
            </div>

            <!-- 角色：和地图同一份绘制 -->
            <div
              ref="meBox"
              class="avatar is-me"
              :style="{
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

          <div class="room__prompt" :class="{ 'is-on': !!prompt }">{{ prompt }}</div>

          <!-- 左：走动（上器械后不动）；右：举重上下往复 / 打沙袋推出去 -->
          <Joystick v-if="showJoy" @move="onWalkMove" />
          <Joystick
            v-if="showJoy && (lifting || bagging)"
            side="right"
            @move="(x, y) => (racketJoy = { x, y })"
          />

          <!-- 靠近场地：右下角弹出图标按钮（手机点它开练，桌面也可以按 E） -->
          <button v-if="action" class="room-enter" type="button" @click="onAction">
            {{ action.icon }} {{ action.label }}
          </button>

          <button v-if="nearDoor" class="room__exit jelly" type="button" @click="leave">
            🚪 出门
          </button>
        </div>
      </template>

      <TrainXpHud :keys="['attack', 'technique', 'stamina']" />
    </PageShell>
  </div>
</template>

<style scoped>
/* --- 房间 ----------------------------------------------------------------- */
.room {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #e7d2a6;
}

/* 奶油色的墙 + 暖木地板：俯视平面，上半是墙、下半是地板 */
.room__plane {
  position: absolute;
  left: 0;
  top: 0;
  background-color: #ecd9b0;
  background-image:
    linear-gradient(
      180deg,
      #fdf4e0 0 178px,
      #f6e7c6 178px 190px,
      #ddc194 190px 200px,
      rgba(0, 0, 0, 0) 200px
    ),
    radial-gradient(120% 66% at 50% 72%, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0) 72%),
    repeating-linear-gradient(90deg, rgba(168, 128, 70, 0.1) 0 2px, rgba(0, 0, 0, 0) 2px 84px),
    repeating-linear-gradient(0deg, rgba(168, 128, 70, 0.07) 0 1px, rgba(0, 0, 0, 0) 1px 44px);
  border-bottom: 16px solid #d8bd8c;
}

/* 墙上的窗：暖光玻璃 + 奶油窗框 */
.window {
  position: absolute;
  top: 40px;
  width: 210px;
  height: 112px;
  transform: translateX(-50%);
  border-radius: 12px;
  border: 7px solid #fff6e4;
  background: linear-gradient(180deg, #bfe6ff 0 58%, #dff0ff 58% 100%);
  box-shadow:
    inset 0 0 0 2px rgba(190, 150, 90, 0.25),
    0 8px 20px -12px rgba(120, 90, 40, 0.6);
  overflow: hidden;
}

.window::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 6px;
  transform: translateX(-50%);
  background: #fff6e4;
}

/* 练功镜：哑铃区背后的整面镜子 */
.mirror {
  position: absolute;
  top: 34px;
  width: 330px;
  height: 130px;
  transform: translateX(-50%);
  border-radius: 12px;
  background: linear-gradient(150deg, rgba(214, 236, 250, 0.95), rgba(178, 208, 232, 0.9));
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.55),
    0 8px 20px -12px rgba(120, 90, 40, 0.55);
}

.mirror::after {
  content: '';
  position: absolute;
  left: 14%;
  top: 10%;
  width: 26%;
  height: 80%;
  border-radius: 999px;
  background: linear-gradient(115deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0));
  filter: blur(2px);
}

.room__door {
  position: absolute;
  width: 150px;
  height: 74px;
  transform: translate(-50%, -100%);
  border: 5px solid #d8bd8c;
  border-bottom: 0;
  border-radius: 74px 74px 0 0;
  background: linear-gradient(180deg, #fff3da, #f0dcb2);
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.6);
}

/* --- 哑铃架 --------------------------------------------------------------- */
.rack {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 22px 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, #7a6649, #5a4830);
  box-shadow:
    0 16px 26px -14px rgba(70, 46, 12, 0.7),
    inset 0 2px 0 rgba(255, 255, 255, 0.18);
}

.rack__top {
  display: flex;
  gap: 46px;
  padding: 12px 16px;
  border-radius: 10px;
  background: linear-gradient(180deg, #fff7e6, #efdcb6);
  box-shadow: inset 0 -4px 8px -4px rgba(120, 90, 40, 0.5);
}

.rack__legs {
  width: 100%;
  height: 8px;
  border-radius: 6px;
  background: linear-gradient(180deg, #8d7653, #6a563a);
}

.dumbbell {
  position: relative;
  display: block;
  width: 46px;
  height: 9px;
  border-radius: 5px;
  background: linear-gradient(180deg, #dfe4ec, #97a0b0);
}

.dumbbell::before,
.dumbbell::after {
  content: '';
  position: absolute;
  top: -9px;
  width: 13px;
  height: 27px;
  border-radius: 5px;
  background: linear-gradient(180deg, #4a5264, #262b35);
  box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.25);
}

.dumbbell::before {
  left: -9px;
}

.dumbbell::after {
  right: -9px;
}

/* --- 沙袋 ----------------------------------------------------------------- */
.bag {
  position: absolute;
  transform: translate(-50%, 0);
  width: 84px;
  height: 200px;
}

.bag__frame {
  position: absolute;
  left: -48px;
  right: -48px;
  top: 0;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(180deg, #aab2c0, #5f6675);
  box-shadow: 0 6px 12px -8px rgba(0, 0, 0, 0.6);
}

.bag__rope {
  width: 5px;
  height: 46px;
  margin: 12px auto 0;
  background: linear-gradient(90deg, #9aa2b2, #5f6675);
}

.bag__body {
  position: relative;
  width: 78px;
  height: 134px;
  margin: 0 auto;
  border-radius: 14px 14px 20px 20px;
  background: linear-gradient(180deg, #c85a5a, #8c3131);
  box-shadow:
    inset -9px 0 16px -9px rgba(0, 0, 0, 0.6),
    inset 9px 0 16px -9px rgba(255, 255, 255, 0.3),
    0 16px 24px -16px rgba(0, 0, 0, 0.7);
  transform-origin: 50% -58px;
  animation: bag-swing 0.55s ease-out;
}

.bag__body::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 8px;
  width: 30px;
  height: 10px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.35);
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

/* --- 跑步机 --------------------------------------------------------------- */
.tread {
  position: absolute;
  transform: translate(-50%, 0);
  width: 220px;
  height: 130px;
}

.tread__deck {
  position: absolute;
  left: 0;
  top: 44px;
  width: 200px;
  height: 64px;
  padding: 8px;
  border-radius: 14px;
  background: linear-gradient(180deg, #59626f, #39414d);
  box-shadow: 0 16px 24px -16px rgba(0, 0, 0, 0.65);
}

.tread__belt {
  width: 100%;
  height: 100%;
  border-radius: 9px;
  background: repeating-linear-gradient(90deg, #3c414d 0 14px, #31363f 14px 28px);
  background-size: 28px 100%;
  box-shadow: inset 0 2px 6px -2px rgba(0, 0, 0, 0.7);
}

.tread__belt.is-run {
  animation: belt-run 0.5s linear infinite;
}

@keyframes belt-run {
  to {
    background-position: -28px 0;
  }
}

.tread__console {
  position: absolute;
  right: 0;
  top: 6px;
  width: 48px;
  height: 62px;
  border-radius: 10px;
  background: linear-gradient(180deg, #59626f, #39414d);
  box-shadow: 0 10px 18px -12px rgba(0, 0, 0, 0.7);
}

.tread__console::after {
  content: '';
  position: absolute;
  left: 8px;
  right: 8px;
  top: 9px;
  height: 26px;
  border-radius: 5px;
  background: linear-gradient(180deg, #9fe4ff, #3aa6e0);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.35);
}

/* --- 交互按钮 ------------------------------------------------------------- */
.area {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 22px 9px;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 250, 238, 0.82);
  box-shadow: 0 10px 22px -14px rgba(110, 80, 30, 0.7);
  backdrop-filter: blur(8px) saturate(1.3);
  -webkit-backdrop-filter: blur(8px) saturate(1.3);
  cursor: pointer;
}

.area.is-near {
  border-color: #ffce5c;
  box-shadow: 0 0 0 3px rgba(255, 206, 92, 0.5), 0 10px 22px -14px rgba(110, 80, 30, 0.7);
}

.area.is-on {
  border-color: #4ecb7a;
  box-shadow: 0 0 0 3px rgba(78, 203, 122, 0.45), 0 10px 22px -14px rgba(110, 80, 30, 0.7);
}

.area__sign {
  font-size: 30px;
  line-height: 1;
}

.area__name {
  font-size: 14px;
  font-weight: 800;
  color: #4a3410;
}

.area__desc {
  font-size: 11px;
  color: #8a7440;
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
  background: rgba(255, 250, 238, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.7);
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
  background: rgba(90, 60, 10, 0.18);
  overflow: hidden;
}

.avatar__xptrack i {
  display: block;
  height: 100%;
  border-radius: 999px;
}

.avatar__xpnum {
  font-size: 10px;
  color: #8a7440;
}

/* --- 做一次动作的飘字 ------------------------------------------------------ */
.pop {
  position: absolute;
  transform: translate(-50%, -50%);
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 900;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.85);
  pointer-events: none;
  animation: pop-up 0.9s ease-out forwards;
}

@keyframes pop-up {
  0% {
    opacity: 0;
    transform: translate(-50%, -40%) scale(0.8);
  }

  25% {
    opacity: 1;
    transform: translate(-50%, -62%) scale(1.12);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -170%) scale(1);
  }
}

/* --- 提示 / 统计 ---------------------------------------------------------- */
.room__prompt,
.room__stat {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 15px;
  border-radius: var(--r-pill);
  font-size: 12px;
  pointer-events: none;
}

.room__prompt {
  bottom: 96px;
  background: rgba(255, 250, 238, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: #4a3410;
  opacity: 0;
  transition: opacity 0.2s;
}

.room__prompt.is-on {
  opacity: 1;
}

.room__stat {
  top: calc(env(safe-area-inset-top) + 12px);
  background: rgba(255, 250, 238, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #6a5220;
}

.room__exit {
  position: absolute;
  right: max(14px, env(safe-area-inset-right));
  bottom: calc(env(safe-area-inset-bottom) + 250px);
  z-index: 32;
  padding: 0.7em 1.3em;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.55);
  background: linear-gradient(180deg, #f2b544, #d9942a);
  color: #fff;
  font-family: var(--font-display);
  font-size: var(--ui-pill-font);
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

/* --- 右下角图标按钮（靠近场地出现；和大世界的「进入」同一款） ---------------- */
.room-enter {
  position: absolute;
  right: max(14px, env(safe-area-inset-right));
  bottom: calc(env(safe-area-inset-bottom) + 186px);
  z-index: 32;
  padding: 0.7em 1.3em;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.55);
  background: linear-gradient(180deg, #37d67a, #1fa85c);
  color: #fff;
  font-family: var(--font-display);
  font-size: var(--ui-pill-font);
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
</style>
