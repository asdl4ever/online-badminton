<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { useRouter } from 'vue-router';
import GameCanvas from '../components/GameCanvas.vue';
import PageShell from '../components/ui/PageShell.vue';
import Button from '../components/ui/Button.vue';
import AppModal from '../components/ui/AppModal.vue';
import Joystick from '../components/ui/Joystick.vue';
import GameSticks from '../components/ui/GameSticks.vue';
import StaminaRow from '../components/ui/StaminaRow.vue';
import { useWalk } from '../composables/useWalk';
import { clampZoom, zoom } from '../composables/useZoom';
import { isTouchDevice } from '../game/device';
import { useJoystickPrefs } from '../composables/useJoystick';
import { AVATAR_FEET_PAD, avatarBoxSize, paintAvatar } from '../game/draw/canvas2d';
import { VIEW_H, VIEW_W } from '../game/constants';
import { toastGood } from '../composables/useToast';
import { celebrate } from '../composables/celebrate';
import type { HudState, MatchOpponent } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import { STYLE_META, tierFromStats, type Difficulty } from '../game/ai';
import { formatGains, type MatchTally } from '../game/match-xp';
import { TRAIN_META, TRAIN_XP_PER, type TrainKey } from '../game/training';
import { ensureStats, pickOpponent, type AiPlayer } from '../game/players';
import { sfx } from '../game/audio';
import { useGameStore, type PracticeMode } from '../stores/game';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';
import { useProgressStore } from '../stores/progress';

/**
 * **大熊球馆**（原来的训练场 / 单机练习）——一间俯视大厅：
 *
 * - **🎾 普通场地区**：6 张**空**场地（3×2）。走近「上场」打一盘（挑战人机 /
 *   发球机对练 / 邀请好友参赛），平时就空着——**不放 AI 互打的演示**（一堆 Phaser
 *   实例同时跑对局太卡）。走到附近才挂画面（`courtMounted`）。
 *
 * ⚠️ 原来的 **🏆 中央比赛区**（两张 100 赛 / 200 赛公开赛场地的**实时直播** + 计分板 +
 * 座位）已经整块删掉：那两块各是一台完整的双 AI 对局，走进去要 `new Phaser.Game`
 * 建 WebGL 上下文 + 编译着色器，来回走就是「突然巨卡一下再恢复」。想观赛去**赛事中心**。
 *
 * 每块场地下面都垫着一层 `.court-mat`（看台 + 地板 + 收边），所以 `hall` 画布
 * （只画线 + 网）看起来也是一块**真场地**；场地之间是 `PATHS` 里的圆头走道。
 */
const router = useRouter();
const store = useGameStore();
const customize = useCustomizeStore();
const lobby = useLobbyStore();
const progress = useProgressStore();
const hud = ref<HudState | null>(null);
/**
 * 最近一次 HUD 里带的「本场统计」（扣杀 / 接杀 / 跑动 / 失误…）：
 * 打完一局拿它换五维经验（见 `game/match-xp.ts`）。
 */
const tally = ref<MatchTally | null>(null);

/* ===== 房间 =============================================================== */
const ROOM_W = 3600;
const ROOM_H = 2400;
const DOOR = { x: 1250, y: 2300 };
const EXIT_RADIUS = 175;

const stage = ref<HTMLElement | null>(null);
const plane = ref<HTMLElement | null>(null);
const meCanvas = ref<HTMLCanvasElement | null>(null);
/** 角色那块 DOM：位置每帧直写 style（不绑 `me`，否则走动时整页每帧重渲染） */
const meBox = ref<HTMLElement | null>(null);
const AVATAR_SCALE = 0.8;
const avatarBox = avatarBoxSize(AVATAR_SCALE);
const avatarFeetPad = Math.round(AVATAR_FEET_PAD * AVATAR_SCALE);

/** 前排 6 张普通场地（3 列 × 2 行，规则排列） */
const COURT_X = [700, 1800, 2900];
const COURT_Y = [1450, 1980];
const COURTS = COURT_Y.flatMap((y) => COURT_X.map((x) => ({ x, y })));

/**
 * 6 张普通场地**都是空的**：**不放 AI 互打的演示**（一堆 Phaser 实例同时跑对局太卡）。
 * 走近按 E / 点一下 → 弹「上场」卡：挑战人机 / 发球机对练 / 邀请好友参赛。
 */
/** 这张场地的画面挂上了没：走到附近才挂（省性能，别一进馆就起一堆 Phaser 实例） */
const courtMounted = ref<boolean[]>(COURTS.map(() => false));

/** 点场地：正在这块场地上（打球 / 看着）时当作挥拍，不去碰交互 */
function onCourtClick(i: number): void {
  if (courtFocus.value !== null) return;
  tryEnter(`court-${i}`);
}

/* ===== 上场打球 / 坐下看比赛 ============================================== */
/** 镜头锁在哪张场地上（null = 正常走动） */
const courtFocus = ref<number | null>(null);
/** 我在哪张场地上打（null = 没在打）：那张场地的对局切成**正式单机对局** */
const hallPlaying = ref<number | null>(null);

/** 哪块空场地在跑**发球机对练**（null = 没有）：和「挑战人机」一样占一张场地 */
const hallMachine = ref<number | null>(null);
/** 「上场」后弹的那张小卡：挑战人机 / 发球机对练 / 邀请好友参赛 */
const courtCard = ref<number | null>(null);
const hallOver = ref(false);
/** 我在打的那一局的双方体力（和正式对局同一份数据，摆到屏幕顶上） */
const stamina = ref<[number, number]>([100, 100]);

/**
 * 舞台（内容区）尺寸：场地盒子要按它算成「和练习区那个页面一样大」。
 * 用 ResizeObserver 跟着转屏 / 工具栏变化走。
 */
const stageSize = ref({ w: 0, h: 0 });
let stageObs: ResizeObserver | null = null;
watch(stage, (el) => {
  stageObs?.disconnect();
  stageObs = null;
  if (!el) return;
  stageSize.value = { w: el.clientWidth, h: el.clientHeight };
  stageObs = new ResizeObserver(() => {
    stageSize.value = { w: el.clientWidth, h: el.clientHeight };
  });
  stageObs.observe(el);
});

/**
 * 6 张场地的盒子尺寸 = **练习区「开打」那个页面的大小**：
 * 就是 1280×720 的画面按舞台比例缩到铺满（练习页那台相机用的同一个 fitZoom）。
 * 于是视距 100% 时，场地上的人物 / 网 / 比分在屏幕上和练习页里一模一样大。
 * 上下限：太大放不下两排（530 间距），太小就白瞎。
 */
const courtFit = computed(() => {
  const w = stageSize.value.w || 844;
  const h = stageSize.value.h || 390;
  return Math.max(0.4, Math.min(0.62, Math.min(w / VIEW_W, h / VIEW_H)));
});
const courtBox = computed(() => ({
  w: Math.round(VIEW_W * courtFit.value),
  h: Math.round(VIEW_H * courtFit.value),
}));

/**
 * 场地内容在 1280×720 画面里的中心（设计坐标）：地面 560、网顶 452、
 * 名字牌 72、比分 40——真正「有东西」的是下半部，所以镜头要往下偏一点，
 * 让**场地本身**落在屏幕正中，而不是连空着的天空一起居中。
 */
const COURT_FOCUS_BIAS = 130;

/**
 * 镜头拉到那块场地上时的视距：**铺满屏幕**——和练习区「开打」那台一个取景
 * （1280×720 的画面按舞台等比铺满）。比旁边那几张场地明显大，是因为这时
 * 整屏就是这一局，旁边那几张已经退到画面外了。
 */
function courtFocusCam(): { x: number; y: number; zoom: number } | null {
  const i = courtFocus.value;
  if (i == null || i < 0 || i >= COURTS.length) return null;
  const c = COURTS[i];
  // 用 ResizeObserver 维护的 stageSize，不再每帧 getBoundingClientRect（那是强制同步布局）
  const w = stageSize.value.w || 844;
  const h = stageSize.value.h || 390;
  const fit = Math.max(0.3, Math.min(1.4, Math.min(w / VIEW_W, h / VIEW_H)));
  return { x: c.x, y: c.y + COURT_FOCUS_BIAS, zoom: fit };
}



/**
 * **哪些画面此刻在屏幕内**（每帧在 `onFrame` 里刷）：球馆里可能同时挂着好几台 Phaser
 * （最多 6 张场地），全都在跑各自的 rAF 会很卡。屏幕外的那些就把 Phaser 主循环
 * `sleep()` 掉（update + 渲染一起停），重新走回来再 `wake()`。
 */
const courtVisible = ref<boolean[]>(COURTS.map(() => false));

/**
 * **错开创建**：一帧里同时进视野的可能有好几块场地，全是 `new Phaser.Game` 会堆成
 * 一次明显的卡顿。所以挂载都排进这个队列，每 `MOUNT_GAP_MS` 只挂一台。
 */
const MOUNT_GAP_MS = 170;
const mountQueue: number[] = [];
let lastMountAt = 0;

/** 同时挂着的场地上限：超了就把「离得最远的那张」还回去（省 WebGL 上下文） */
const MAX_MOUNTED = 4;
/**
 * **拆场的距离**：比「可见半径」远这么多才真的拆掉。
 * `new Phaser.Game`（建 WebGL 上下文 + 编译着色器）是球馆里最贵的一下，所以在场地
 * 边界来回走时**尽量别反复创建 / 销毁**——走远到这个倍数才还回去，走回来时它还在
 * （只是被 `sleep()` 着，几乎不耗）。
 */
const UNMOUNT_RATIO = 2.6;

/** 排进挂载队列（已经在挂 / 已挂的不重复排） */
function queueMount(idx: number): void {
  if (courtMounted.value[idx]) return;
  if (mountQueue.includes(idx)) return;
  mountQueue.push(idx);
}

/** 立刻挂上（镜头锁定的那一块不能等队列） */
function mountNow(idx: number): void {
  const at = mountQueue.indexOf(idx);
  if (at >= 0) mountQueue.splice(at, 1);
  if (!courtMounted.value[idx]) courtMounted.value[idx] = true;
}

/** 拆掉（连队列里没挂上的一起取消） */
function unmount(idx: number): void {
  const at = mountQueue.indexOf(idx);
  if (at >= 0) mountQueue.splice(at, 1);
  if (courtMounted.value[idx]) courtMounted.value[idx] = false;
}

/** 每 `MOUNT_GAP_MS` 放一台出来 */
function pumpMounts(now: number): void {
  if (!mountQueue.length || now - lastMountAt < MOUNT_GAP_MS) return;
  const next = mountQueue.shift();
  if (next === undefined) return;
  lastMountAt = now;
  courtMounted.value[next] = true;
}

/**
 * 每帧决定「哪几张场地的画面该挂着」：靠近的挂上、走远的拆掉；同时挂着的数量封顶
 * `MAX_MOUNTED`（超了按距离裁最远的）。**已挂的**在排序里算「更近」（减一个 radius），
 * 所以会在附近多留一会儿——这是为了减少 `new Phaser.Game` / `destroy` 的次数。
 */
function stepMounts(now: number): void {
  const radius = visibleRadius();
  const runR = runRadius();
  const drop = radius * UNMOUNT_RATIO;
  const mx = walk.me.value.x;
  const my = walk.me.value.y;
  const busy = (i: number) => hallPlaying.value === i || hallMachine.value === i;
  const dist = (i: number) => Math.hypot(COURTS[i].x - mx, COURTS[i].y - my);

  const wanted: number[] = [];
  for (let i = 0; i < COURTS.length; i++) {
    const d = dist(i);
    // 「挂不挂画布」看宽松的 radius（提前挂上，走近就有）；「跑不跑」看屏幕内的 runR
    courtVisible.value[i] = d <= runR;
    if (busy(i) || d <= radius) wanted.push(i);
    else if (courtMounted.value[i] && d <= drop) wanted.push(i);
    else if (courtMounted.value[i]) unmount(i);
  }

  if (wanted.length > MAX_MOUNTED) {
    const key = (i: number) => dist(i) - (courtMounted.value[i] ? radius : 0);
    wanted.sort((a, b) => key(a) - key(b));
    for (const i of wanted.slice(MAX_MOUNTED)) if (!busy(i)) unmount(i);
    wanted.length = MAX_MOUNTED;
  }
  for (const i of wanted) queueMount(i);
  pumpMounts(now);
}

/** 某块场地要不要暂停：在打某一格时只留那一格，其余全停 */
function courtPaused(i: number): boolean {
  return courtFocus.value !== null ? courtFocus.value !== i : !courtVisible.value[i];
}

/** 镜头锁定的那一块不能等队列，立刻挂上（点了「上场」就马上要有画面） */
watch(courtFocus, (i) => {
  if (i !== null && i >= 0) mountNow(i);
});

/** 场地之间的**走道**：一条主走道横贯全场（把中央比赛区与场地区分开）+ 一条副走道 +
 *  两条竖走道（左那条同时是**入口大道**，从出口一直通到主走道） */
const PATHS = [
  { x: 1800, y: 1130, w: 3360, h: 150 }, // 主走道
  { x: 1800, y: 1715, w: 3360, h: 130 }, // 副走道（普通场地两排之间）
  { x: 1250, y: 1665, w: 130, h: 1210 }, // 左侧竖走道（＝入口大道）
  { x: 2350, y: 1665, w: 130, h: 1210 }, // 右侧竖走道
];

/** 场地区的**地板平台**（纯地面装饰，压在最下层）：把一伙玩法圈在一起，看着像正经场馆 */
const AREA_PLATES = [
  { id: 'courts', name: '🎾 普通场地区', x: 1800, y: 1715, w: 3300, h: 1030 },
];

/** 6 张普通场地是可交互物：走近按 E / 点一下 → 弹「上场」卡（挑战人机 / 发球机 / 邀请） */
const COURT_OBJECTS = COURTS.map((c, i) => ({ id: `court-${i}`, x: c.x, y: c.y }));
const WALK_OBJECTS: { id: string; x: number; y: number }[] = [...COURT_OBJECTS];

function paintMe(now: number): void {
  const c = meCanvas.value;
  if (c) paintAvatar(c, customize.cosmetic, now, { scale: AVATAR_SCALE, facing: 1 });
}

/** 角色 DOM 的位置（走动手感无关的纯摆放；直写 style 跳过响应式） */
function syncMe(): void {
  const el = meBox.value;
  if (!el) return;
  el.style.left = `${me.value.x}px`;
  el.style.top = `${me.value.y}px`;
}

/** 镜头能看到的半径（决定哪几张场地要把对局挂起来）；锁在场地里时按锁定视距算 */
/**
 * **「真的要渲染」的范围**：屏幕上看得见的那一圈（含场地自身的尺寸）。
 *
 * 为什么要和「挂载半径」分开：挂上 / 销毁一次 Phaser 很贵（几百毫秒的主线程长任务），
 * 所以**一旦挂上就留到走远**（`UNMOUNT_RATIO`）；但**没必要让屏幕外的那几张一直跑**——
 * 每张都是一块全屏画布，手机上纯粹白烧填充率（诊断面板里球馆站着不动只有 28fps，
 * 就是因为同时有好几张在跑）。睡着的画布**保留最后一次画面**（场地是静态的，
 * 睡不睡肉眼看不出区别），所以这里不改变观感。
 */
function runRadius(): number {
  const z = clampZoom(courtFocusCam()?.zoom ?? zoom.value);
  const vw = (stageSize.value.w || 844) / z;
  const vh = (stageSize.value.h || 390) / z;
  return Math.hypot(vw / 2 + courtBox.value.w / 2, vh / 2 + courtBox.value.h / 2);
}

function visibleRadius(): number {
  const z = clampZoom(courtFocusCam()?.zoom ?? zoom.value);
  const vw = (stageSize.value.w || 844) / z;
  const vh = (stageSize.value.h || 390) / z;
  return Math.hypot(vw, vh) / 2 + 700;
}

/** 站在门口：右下角出现「出门」。**不是 computed**（它依赖每帧在动的坐标），
 *  在 onFrame 里按结果变化才写，避免走动时整页每帧重渲染。 */
const nearDoor = ref(false);

const walk = useWalk({
  stage,
  plane,
  width: ROOM_W,
  height: ROOM_H,
  radius: 200,
  objects: () => WALK_OBJECTS,
  spawn: { x: 1250, y: 2200 },
  focus: courtFocusCam,
  onEnter: (id) => {
    if (id.startsWith('court-') && courtFocus.value === null) {
      // 按 E / 点场地：普通场地都是空的 → 直接弹「上场」卡
      // （已经在一块场地上时忽略，免得打球时误点又弹一次卡）
      openCourt(Number(id.slice(6)));
    }
  },
  onFrame: (now) => {
    // 走到附近才把这块场地的画面挂起来（错开、封顶、走远才拆），见 stepMounts
    stepMounts(now);
    // 走动替身：位置直写 DOM、门口提示按变化才写（都不走模板绑定，免得每帧重渲染）
    syncMe();
    const nd = Math.hypot(me.value.x - DOOR.x, me.value.y - DOOR.y) < EXIT_RADIUS;
    if (nearDoor.value !== nd) nearDoor.value = nd;
    // 上场打球 / 发球机对练时我们就在场地里，球馆里那个走动的替身就别画了
    if (hallPlaying.value === null && hallMachine.value === null) paintMe(now);
  },
});
const { me, joy, nearId, tryEnter } = walk;

/* ===== 练习区：对战 AI / 发球机 ========================================== */
const playing = ref(false);
const pendingMode = ref<PracticeMode | null>(null);
/** 单机难度档（记在本机）：决定抽到哪种水平的对手 */
const difficulty = useLocalStorage<Difficulty>('bmt-single-difficulty', 'normal');
const DIFFS: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'easy', label: '简单', desc: '对手失误多、球速慢' },
  { value: 'normal', label: '普通', desc: '势均力敌' },
  { value: 'hard', label: '困难', desc: '预判准、杀球凶' },
];

const isMachine = computed(() => store.practice === 'machine');
const optionId = computed(() => (isMachine.value ? 'machineEasy' : undefined));

const currentOpponent = ref<AiPlayer | null>(null);
function rollOpponent(): void {
  const all = progress.aiPlayers;
  const byTier = all.filter((p) => tierFromStats(ensureStats(p)) === difficulty.value);
  const pool = byTier.length ? byTier : all;
  currentOpponent.value =
    pickOpponent(pool, {
      excludeId: currentOpponent.value?.id,
      points: byTier.length ? undefined : progress.points,
    }) ?? null;
}
rollOpponent();

const canvasKey = computed(() => `${store.practice}-${currentOpponent.value?.id ?? ''}`);
const opponentStats = computed(() =>
  currentOpponent.value ? ensureStats(currentOpponent.value) : null,
);
const opponentConfig = computed<MatchOpponent | undefined>(() => {
  const p = currentOpponent.value;
  const stats = opponentStats.value;
  if (!p || !stats || isMachine.value) return undefined;
  return { name: p.name, cosmetic: p.cosmetic, stats };
});
const opponentStyleLabel = computed(() =>
  currentOpponent.value ? STYLE_META[currentOpponent.value.style].label : '',
);
const opponentTierLabel = computed(() => {
  const s = opponentStats.value;
  if (!s) return '';
  return { easy: '简单', normal: '普通', hard: '困难' }[tierFromStats(s)];
});

function nextOpponent(): void {
  sfx.click();
  rollOpponent();
}

function setDifficulty(d: Difficulty): void {
  sfx.click();
  difficulty.value = d;
  rollOpponent();
}

function startMatch(mode: PracticeMode): void {
  sfx.click();
  store.practice = mode;
  if (mode === 'ai') rollOpponent();
  pendingMode.value = null;
  playing.value = true;
}

const cardOpen = computed({
  get: () => pendingMode.value === 'ai',
  set: (v: boolean) => {
    if (!v) pendingMode.value = null;
  },
});

/* ===== 场地上：上场（挑战人机 / 邀请好友）/ 坐下看 ======================== */
/** 上场：镜头先拉近这张空场地，再弹「和谁打」那张小卡 */
function openCourt(i: number): void {
  sfx.click();
  courtFocus.value = i;
  courtCard.value = i;
}

/** 挑战人机：就地开一局 —— **复用练习区那套**（同一个 GameCanvas / GameScene /
 *  绘制 / HUD），背景换成球馆（`hall` 让画布透明）；对手照旧按难度从名人堂里抽。 */
function startHallMatch(i: number): void {
  sfx.click();
  courtCard.value = null;
  courtFocus.value = i;
  hallOver.value = false;
  hallMachine.value = null;
  store.practice = 'ai'; // 让「战绩记给人机对手」那套生效
  rollOpponent();
  stamina.value = [100, 100];
  hallPlaying.value = i;
}

/**
 * **发球机对练**：把这块空场地切成「发球机喂球」，连击换经验 / 里程碑那套照旧；
 * 原来球馆里那台独立的发球机已经取消，现在上任意一块空场地都能选它。
 */
function startHallMachine(i: number): void {
  sfx.click();
  courtCard.value = null;
  courtFocus.value = i;
  hallOver.value = false;
  hallPlaying.value = null;
  stamina.value = [100, 100];
  store.practice = 'machine'; // 让「连击换经验 / 里程碑」那套生效
  hallMachine.value = i;
}

/**
 * 邀请好友参赛：开出**这块场地**的房间（场地号就是房号 `COURT{n}`），
 * 并直接进联机页、把「邀请好友」面板弹出来——在那儿点一下邀请，好友就进这个场地。
 */
function inviteToCourt(i: number): void {
  sfx.click();
  courtCard.value = null;
  courtFocus.value = null;
  void router.push({ path: '/online', query: { court: i + 1, invite: '1' } });
}

/** 离开这块场地：回到球馆里走动（人机那局的结果已经记过账了） */
function leaveCourt(): void {
  sfx.click();
  courtCard.value = null;
  courtFocus.value = null;
  hallPlaying.value = null;
  hallMachine.value = null;
  hallOver.value = false;
}

/*
 * ⚠️ 这里原来有个 `courtKey(i)`，用来在「空场地 / 人机对局 / 发球机对练」之间切换时
 * 通过 `:key` 把整块画布重挂。**已删掉**：重挂等于新建一个 Phaser 实例（建 WebGL
 * 上下文 + 编译着色器），手机上一次就是几百毫秒到两秒的主线程长任务——「上场 / 离开
 * 场地卡一下」就是这么来的。现在 `GameCanvas` 自己盯住 `idle` / `opponent` / `optionId`
 * 这些 props，变了就 `scene.restart()` **原地重启场景**（渲染器还在，只重建场景）。
 */

/** 每张场地的比分（正式对局同一份 HUD 数据，摆到场地上方的计分板上） */
const courtScore = ref<[number, number][]>(COURTS.map(() => [0, 0]));

/** 那张场地的 HUD（正式对局页同一份数据）：记比分；我在打的那张还记体力 */
function onCourtHud(i: number, s: HudState): void {
  const a = courtScore.value[i];
  if (a[0] !== s.score[0] || a[1] !== s.score[1]) courtScore.value[i] = [s.score[0], s.score[1]];
  if (hallMachine.value === i) {
    hud.value = s; // 发球机对练：连击换经验 / 里程碑要看这份 HUD
    return;
  }
  if (hallPlaying.value !== i) return;
  if (s.match) tally.value = s.match;
  stamina.value = s.stamina;
}

/** 计分板上写谁：我 + 这局的对手 */
function boardNames(): [string, string] {
  return [lobby.playerName || '你', currentOpponent.value?.name ?? '对手'];
}

/** 比分榜两边的头像（角色表情） */
function boardFaces(): [string, string] {
  return [customize.cosmetic.emoji, currentOpponent.value?.cosmetic?.emoji ?? '🙂'];
}

/** 比分榜挂在球场**背后那面墙**上（盒子高度的 20% 处），跟着盒子尺寸走 */
function boardTop(i: number): string {
  const h = courtFocus.value === i ? VIEW_H : courtBox.value.h;
  return `${Math.round(h * 0.2)}px`;
}

/** 榜的字号也跟盒子走（内部尺寸都用 em），这样在屏幕上看大小一致 */
function boardScale(i: number): string {
  const h = courtFocus.value === i ? VIEW_H : courtBox.value.h;
  return `${Math.round((h / VIEW_H) * 30)}px`;
}

/** 那张场地的事件：和练习区同一套（音效 + 战绩）；打完标记一下，给「再来一局」用 */
function onCourtSim(e: SimEvent): void {
  if (e.type === 'gameover') hallOver.value = true;
  onEvent(e);
}

/** 「和谁打」那张小卡：关掉就回到球馆 */
const courtCardOpen = computed({
  get: () => courtCard.value !== null,
  set: (v: boolean) => {
    if (!v) leaveCourt();
  },
});

/** 右下角那个按钮：走近某张空场地时出现 */
const action = computed(() => {
  if (courtFocus.value !== null) return null;
  const id = nearId.value ?? '';
  if (!id.startsWith('court-')) return null;
  return { label: '上场 · 这场地空着', court: Number(id.slice(6)) };
});

function onAction(): void {
  const a = action.value;
  if (a) openCourt(a.court);
}

const touch = isTouchDevice();
const { always: joyAlways } = useJoystickPrefs();
const showJoy = computed(() => touch || joyAlways.value);
const walkHint = computed(
  () =>
    `${touch ? '拖动摇杆' : 'WASD / 摇杆'}走动 · 6 张空场地，走近点一下就能上场（打人机 / 发球机对练 / 邀请好友）`,
);

function leave(): void {
  sfx.click();
  void router.push('/');
}

/**
 * 练球机：每接到一颗球（连击 +1）给一笔「防守」经验（发球机只管防守这一维）；
 * 连击每满 10 解锁一档「复古训练房」里程碑奖励（首次才发）。
 */
watch(
  () => hud.value?.machine?.streak ?? 0,
  (streak, prev) => {
    if (!isMachine.value) return;
    const gained = streak - (prev ?? 0);
    if (gained > 0) {
      const xp = gained * TRAIN_XP_PER.machineReturn;
      for (const k of progress.train({ defense: xp })) announceTrain(k);
    }
    if (streak <= 0) return;
    progress.noteMachineStreak(streak);
    const reward = progress.claimMilestone(streak);
    if (!reward) return;
    toastGood(`${streak} 连击！获得「${reward.item.label}」`);
    if (streak >= 100) {
      celebrate(3, ['#ffd45c', '#e8a33d', '#4f8a5f']);
      sfx.win();
    } else {
      celebrate(2, ['#ffd45c', '#3d8bfd', '#9b59d0']);
    }
  },
);

function announceTrain(k: TrainKey): void {
  toastGood(`${TRAIN_META[k].label} 升到 Lv.${progress.trainLevels[k]}！`);
  celebrate(1, [TRAIN_META[k].color]);
}

function onHud(state: HudState) {
  hud.value = state;
  if (state.match) tally.value = state.match;
}

function onEvent(e: SimEvent) {
  if (e.type === 'hit') sfx.hit(e.kind ?? 'drive');
  else if (e.type === 'belly') sfx.hit('lift');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') sfx.point();
  else if (e.type === 'gameover') {
    const win = e.scorer === 0;
    progress.recordResult(win, 'single');
    const foe = currentOpponent.value;
    if (!isMachine.value && foe) progress.recordVsAi(foe.id, win);
    if (win) sfx.win();
    else sfx.lose();
    // 「打比赛也在变强」：这一场干了什么 → 五维经验（发球机不算，它有自己的「接到一颗给一点」）
    if (!isMachine.value && tally.value) {
      const { gains, up } = progress.gainMatchXp({
        tally: tally.value,
        localIndex: 0,
        win,
        foeKey: foe?.id ?? 'single',
        foeRating: foe?.rating,
      });
      if (gains.length) toastGood(`🏸 本场训练：${formatGains(gains)}`);
      for (const k of up) announceTrain(k);
    }
    tally.value = null;
  }
}

function back() {
  sfx.click();
  if (playing.value) {
    playing.value = false;
    hud.value = null;
    return;
  }
  void router.push('/');
}

onBeforeUnmount(() => {
  stageObs?.disconnect();
  store.role = 'single';
});
</script>

<template>
  <div class="page page--playing">
    <PageShell title="大熊球馆" back :icons="!playing" @back="back">
      <template #stage>
        <!-- 开打：整块画布 -->
        <GameCanvas
          v-if="playing"
          :key="canvasKey"
          role="single"
          :option-id="optionId"
          :opponent="opponentConfig"
          :skills="progress.equippedSkills"
          :skill-branches="progress.skillBranch"
          :skill-mastery="progress.skillMastery"
          :session="null"
          :cosmetic="customize.cosmetic"
          :attrs="progress.attrs"
          :local-name="lobby.playerName"
          :local-rank="progress.tier.id"
          :party="false"
          @hud="onHud"
          @sim="onEvent"
        />

        <div v-else ref="stage" class="room" :class="{ 'is-solo': courtFocus !== null }">
          <div
            ref="plane"
            class="room__plane"
            :style="{ width: `${ROOM_W}px`, height: `${ROOM_H}px` }"
          >
            <!-- 三个区的**地板平台**（纯地面装饰，压在最下层）：把一伙玩法圈在一起，像正经场馆 -->
            <div
              v-for="a in AREA_PLATES"
              :key="`plate-${a.id}`"
              class="plate"
              :style="{
                left: `${a.x}px`,
                top: `${a.y}px`,
                width: `${a.w}px`,
                height: `${a.h}px`,
              }"
            >
              <span class="plate__name">{{ a.name }}</span>
            </div>

            <!-- 走道：主走道横贯全场，把中央比赛区与场地区分开；场地区里两条竖走道 + 一条副走道 -->
            <div
              v-for="(p, i) in PATHS"
              :key="`path-${i}`"
              class="path"
              :style="{
                left: `${p.x}px`,
                top: `${p.y}px`,
                width: `${p.w}px`,
                height: `${p.h}px`,
              }"
            />

            <!-- ===== 普通场地区：6 张普通场地（3×2）=====
                 每张就是一个**真的 GameCanvas**（和练习区「开打」那台同一套逻辑 /
                 组件 / 绘制），只是 `hall` 让画布透明、背景不画，下面垫一层场地垫 -->
            <div
              v-for="(c, i) in COURTS"
              :key="`court-${i}`"
              class="mini"
              :class="{ 'is-live': courtFocus === i }"
              :style="{
                left: `${c.x}px`,
                top: `${c.y}px`,
                /* 平时 = 练习区那个页面一样大；上场时放大到 1280×720（1:1） */
                width: `${courtFocus === i ? VIEW_W : courtBox.w}px`,
                height: `${courtFocus === i ? VIEW_H : courtBox.h}px`,
              }"
              @click="onCourtClick(i)"
            >
              <!-- 场地垫：透明画布下面垫一层「看台 + 地板」，场地才像块真场地 -->
              <div class="court-mat" />
              <GameCanvas
                v-if="courtMounted[i]"
                role="single"
                :session="null"
                :opponent="hallPlaying === i ? opponentConfig : undefined"
                :skills="progress.equippedSkills"
          :skill-branches="progress.skillBranch"
          :skill-mastery="progress.skillMastery"
                :hall="true"
                :paused="courtPaused(i)"
                :option-id="hallMachine === i ? 'machineEasy' : undefined"
                :idle="hallPlaying !== i && hallMachine !== i"
                :force-touch="hallPlaying === i || hallMachine === i"
                :no-sticks="true"
                :no-hud="true"
                :no-rematch="true"
                :cosmetic="customize.cosmetic"
                :attrs="progress.attrs"
                :local-name="lobby.playerName"
                :local-rank="progress.tier.id"
                :party="false"
                @hud="(s) => onCourtHud(i, s)"
                @sim="onCourtSim"
              />
              <!-- 球场**背后**（z 轴在下）的比分榜：头像 + 名字 + 比分。
                   只有我自己在这块场地上打的时候才挂它（空场地不摆榜） -->
              <div
                v-if="hallPlaying === i"
                class="board"
                :style="{ top: boardTop(i), fontSize: boardScale(i) }"
              >
                <span class="board__face">{{ boardFaces()[0] }}</span>
                <span class="board__name">{{ boardNames()[0] }}</span>
                <span class="board__num num">{{ courtScore[i][0] }}</span>
                <span class="board__sep">:</span>
                <span class="board__num num">{{ courtScore[i][1] }}</span>
                <span class="board__name board__name--r">{{ boardNames()[1] }}</span>
                <span class="board__face">{{ boardFaces()[1] }}</span>
              </div>
            </div>

            <!-- 门口 -->
            <div class="room__door" :style="{ left: `${DOOR.x}px`, top: `${DOOR.y}px` }">
              <span class="room__sign">出口</span>
            </div>

            <!-- 角色（上场打球 / 发球机对练时我们就在画面里，替身收起来） -->
            <div
              v-if="hallPlaying === null && hallMachine === null"
              ref="meBox"
              class="avatar is-me"
              :style="{
                width: `${avatarBox.w}px`,
                height: `${avatarBox.h}px`,
                transform: `translate(-50%, calc(-100% + ${avatarFeetPad}px))`,
              }"
            >
              <canvas ref="meCanvas" class="avatar__rig" />
              <div class="avatar__name">你</div>
            </div>
          </div>

          <div v-if="courtFocus === null" class="room__hint">{{ walkHint }}</div>

          <!-- 走动：球馆那颗摇杆。上场打球：换成和正式对局同一对 DOM 摇杆 -->
          <Joystick
            v-if="showJoy && hallPlaying === null && hallMachine === null"
            @move="(x, y) => (joy = { x, y })"
          />
          <!-- 上场打球 / 发球机对练：和正式对局同一对摇杆，而且**常显**（桌面 / 模拟器上也靠它走位）；
               技能按钮跟着携带列表走，不然球馆里打的这局没有招式可放 -->
          <GameSticks
            v-if="hallPlaying !== null || hallMachine !== null"
            :always="true"
            :skills="progress.equippedSkills"
          />

          <!-- 上场那局：复用正式对局那排体力条（比分写在场地画面里） -->
          <div v-if="hallPlaying !== null" class="court-hud">
            <StaminaRow :stamina="stamina" :local-index="0" />
          </div>


          <!-- 场地上的底部按钮：打完再来一局 / 离开（不看了） -->
          <div v-if="courtFocus !== null" class="court-foot">
            <button
              v-if="hallOver"
              class="room-enter"
              type="button"
              @click="startHallMatch(courtFocus)"
            >
              🔁 再来一局
            </button>
            <button class="room-enter" type="button" @click="leaveCourt">
              {{ hallPlaying !== null || hallMachine !== null ? '🚪 离开场地' : '👀 不看了' }}
            </button>
          </div>

          <!-- 靠近场地 / 练习区：右下角弹出图标按钮 -->
          <button v-if="action" class="room-enter" type="button" @click="onAction">
            {{ action.label }}
          </button>

          <button v-if="nearDoor" class="room__exit jelly" type="button" @click="leave">
            🚪 出门
          </button>
        </div>
      </template>
    </PageShell>

    <!-- 对战 AI：先设置难度 -->
    <AppModal v-model="cardOpen" title="对战 AI" max-width="420px">
      <div class="diff">
        <p class="diff__head">
          选难度（对手强度）。段位只是参考，<b>难度才是这局的门槛</b>。
        </p>
        <div class="diff__row">
          <button
            v-for="d in DIFFS"
            :key="d.value"
            class="diff__btn jelly"
            :class="{ 'is-on': difficulty === d.value }"
            type="button"
            @click="setDifficulty(d.value)"
          >
            <b>{{ d.label }}</b>
            <span>{{ d.desc }}</span>
          </button>
        </div>

        <div v-if="currentOpponent" class="diff__opp">
          本局对手：{{ currentOpponent.name }} · {{ opponentStyleLabel }} · {{ opponentTierLabel }}
        </div>
        <Button size="sm" block @click="nextOpponent">换一位对手</Button>

        <Button variant="primary" block @click="startMatch('ai')">⚔️ 开打</Button>
      </div>
    </AppModal>

    <!-- 空场地「上场」：和谁打 -->
    <AppModal
      v-model="courtCardOpen"
      :title="`场地 ${(courtCard ?? 0) + 1} · 空着`"
      max-width="420px"
    >
      <div class="diff">
        <p class="diff__head">镜头已经拉到这块场地上了。<b>怎么练？</b></p>
        <Button variant="primary" block @click="startHallMatch(courtCard ?? 0)">⚔️ 挑战人机</Button>
        <Button block @click="startHallMachine(courtCard ?? 0)">🏸 发球机对练</Button>
        <Button block @click="inviteToCourt(courtCard ?? 0)">🧑‍🤝‍🧑 邀请好友参赛</Button>
        <p class="muted" style="font-size: 13px">
          发球机对练：一台发射器按节奏喂球，连击换经验、里程碑奖励照旧。邀请好友：开出「场地
          {{ (courtCard ?? 0) + 1 }}」这个房间并弹出好友面板，点「邀请」好友就进这个场地和你打。
        </p>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
/* --- 大厅 --------------------------------------------------------------- */
.room {
  position: absolute;
  inset: 0;
  overflow: hidden;
  /* 球馆底色：淡色（原来那种饱和绿太亮眼） */
  background: #b7c1bc;
}

.room__plane {
  position: absolute;
  left: 0;
  top: 0;
  /* 球馆地面：上段（比赛区）略浅、下段（场地区）略深，铺一层很淡的地砖拼缝网格 */
  background:
    linear-gradient(180deg, #e9ede7 0 1000px, #dee4dd 1000px 100%),
    repeating-linear-gradient(90deg, rgba(20, 40, 30, 0.03) 0 2px, transparent 2px 140px),
    repeating-linear-gradient(0deg, rgba(20, 40, 30, 0.03) 0 2px, transparent 2px 140px);
  border-bottom: 18px solid #aeb8b2;
}

/* 三个区的**地板平台**：比场馆地面略深一点 + 一圈细边 + 左上角一块区名牌
   （刻意**不用亮白**：亮底会透过没挂画面的场地看出去，像一块白屏） */
.plate {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 28px;
  background: rgba(118, 143, 130, 0.12);
  box-shadow: inset 0 0 0 2px rgba(20, 40, 30, 0.07);
  pointer-events: none;
}

.plate__name {
  position: absolute;
  left: 22px;
  top: 16px;
  padding: 3px 14px;
  border-radius: 999px;
  background: rgba(16, 30, 20, 0.5);
  color: #fff4dc;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 1px;
  white-space: nowrap;
}

/* 场地之间的**走道**：圆头的**暗色**橡胶路，边上一圈亮线 + 顶部高光 */
.path {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: linear-gradient(180deg, #525d57, #3d4741);
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.1),
    inset 0 3px 0 rgba(255, 255, 255, 0.09),
    0 14px 24px -20px rgba(0, 0, 0, 0.55);
}

/* 门口：双开拱门 + 门框 + 门槛 + 一块「出口」小牌（门口不再铺场地 / 走道） */
.room__door {
  position: absolute;
  width: 220px;
  height: 132px;
  transform: translate(-50%, -100%);
  border: 7px solid #9aa6a0;
  border-bottom: 0;
  border-radius: 112px 112px 0 0;
  background: linear-gradient(180deg, #fbf7ec 0 40%, #e9e2d0 100%);
  box-shadow:
    inset 0 0 0 3px rgba(255, 255, 255, 0.65),
    0 12px 26px -16px rgba(0, 0, 0, 0.55);
}

/* 两扇门的中缝 */
.room__door::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 24%;
  bottom: 0;
  width: 3px;
  background: rgba(120, 110, 88, 0.4);
  transform: translateX(-50%);
}

/* 门槛（把门和地面接起来） */
.room__door::after {
  content: '';
  position: absolute;
  left: -16px;
  right: -16px;
  bottom: -12px;
  height: 20px;
  border-radius: 7px;
  background: linear-gradient(180deg, #d7ded8, #b6c0ba);
  box-shadow: 0 6px 12px -8px rgba(0, 0, 0, 0.4);
}

/* 门楣上那块「出口」小牌 */
.room__sign {
  position: absolute;
  left: 50%;
  top: 12px;
  transform: translateX(-50%);
  padding: 2px 12px;
  border-radius: 999px;
  background: #2f3a36;
  color: #ffe9a8;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
  white-space: nowrap;
}

/* --- 前排：6 张普通场地 ---------------------------------------------------
   每张就是一个**真 GameCanvas**（练习区「开打」那台本身）：同一套逻辑 / 组件 /
   绘制，`hall` 让画布透明、不画背景（天空 / 看台 / 木地板），场地直接摆在
   球馆地板上。
   尺寸由 `courtBox` 算（= 舞台 fitZoom 缩出来的 1280×720），视距 100% 时和
   练习页里一样大；上场 / 坐下看时内联尺寸放大到 1280×720。 */
.mini {
  position: absolute;
  transform: translate(-50%, -50%);
}

/* 镜头拉近某一格（上场打人机 / 发球机对练）时，**其余场地全部收起来**：
   它们是各自的比例 / 分辨率，透过聚焦那一格的透明背景露出来时，就成了
   「小一号、发虚、像另一个图层」的幽灵角色。 */
.room.is-solo .mini:not(.is-live) {
  visibility: hidden;
}

/* 上场 / 坐下看：放大到 1280×720（1:1），镜头再拉到能看见它、也还能看见隔壁 */
.mini.is-live {
  z-index: 4;
}

/* 球场**背后**的比分榜：头像 + 名字 + 比分。
   `z-index: -1` → 画在球场那一层之下（挂在墙上的感觉），球场是透明的，
   所以能透过背景看见；球员走到它前面就会把人挡住。尺寸全用 em，字号由
   `boardScale()` 按球场盒子给，所以在屏幕上看大小一致。 */
.board {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: -1;
  display: flex;
  align-items: center;
  gap: 1em;
  padding: 0.5em 1.4em;
  border-radius: 0.8em;
  border: 0.14em solid #ffd45c;
  background: rgba(10, 20, 14, 0.88);
  color: #f2ffe9;
  font-weight: 800;
  pointer-events: none;
  white-space: nowrap;
}

.board__face {
  font-size: 1.5em;
  line-height: 1;
}

.board__name {
  max-width: 6em;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95em;
}

.board__name--r {
  text-align: right;
}

.board__num {
  font-size: 1.9em;
  line-height: 1;
  color: #ffd45c;
}

.board__sep {
  opacity: 0.7;
}

/* --- 后排：中央比赛场地（赛事直播屏） ------------------------------------- */
.stage-court {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stage-court__board {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 18px;
  border-radius: 999px;
  background: rgba(12, 24, 16, 0.78);
  border: 2px solid #ffd45c;
  color: #f2ffe9;
  font-size: 14px;
  font-weight: 800;
}

.stage-court__live {
  font-size: 12px;
  color: #ff8a8a;
}

.stage-court__floor {
  position: relative;
  width: 1080px;
  height: 420px;
  border-radius: 14px;
  border: 5px solid #eef5ea;
  background: linear-gradient(180deg, #3f7c58, #33684a);
  box-shadow: 0 16px 34px -18px rgba(0, 0, 0, 0.7);
}

.stage-court__net {
  position: absolute;
  left: 50%;
  top: 14px;
  bottom: 14px;
  border-left: 4px dashed rgba(255, 255, 255, 0.75);
  transform: translateX(-50%);
}

.stage-court__line {
  position: absolute;
  inset: 26px;
  border: 3px solid rgba(255, 255, 255, 0.45);
  border-radius: 8px;
}

/* 两侧看台：一排排座位（坐下看直播接在下一轮） */
.stage-court__stands {
  width: 1180px;
  height: 34px;
  border-radius: 8px;
  background: repeating-linear-gradient(90deg, #6b7383 0 26px, #4b5261 26px 34px);
  border: 2px solid #232833;
}

/* --- 练习区两块场地（球台 / 发球机） ------------------------------------- */
.venue {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.venue.is-near .court {
  filter: drop-shadow(0 0 9px rgba(255, 212, 92, 0.85));
}

.venue.is-near .court {
  border-color: #ffd45c;
}

.court {
  position: relative;
  width: 272px;
  height: 176px;
  border-radius: 10px;
  border: 3px solid #eef5ea;
  background: linear-gradient(180deg, #4f8a5f, #3d6f4a);
  box-shadow: 0 8px 18px -10px rgba(0, 0, 0, 0.6);
}

.court__line {
  position: absolute;
  inset: 13px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 6px;
}

.court__net {
  position: absolute;
  left: 50%;
  top: 8px;
  bottom: 8px;
  border-left: 3px dashed rgba(255, 255, 255, 0.75);
  transform: translateX(-50%);
}

.court__foe {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 16px;
  height: 26px;
  border-radius: 8px 8px 4px 4px;
  background: #22303a;
}

.court__foe::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -12px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #22303a;
  transform: translateX(-50%);
}

/* --- 角色 / 提示 / 按钮 --------------------------------------------------- */
.avatar__rig {
  display: block;
  width: 100%;
  height: 100%;
}

.avatar__name {
  position: absolute;
  bottom: calc(100% - 4px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 600;
  color: #fff4dc;
}

.room__hint {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  padding: 5px 14px;
  border-radius: var(--r-pill);
  background: rgba(16, 32, 20, 0.45);
  color: #f2ffe9;
  font-size: 12px;
  pointer-events: none;
}

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

/* 上场那局的 HUD：体力条（比分本来就画在画面里，这里只补页面外壳那一层） */
.court-hud {
  position: absolute;
  left: 50%;
  top: 0;
  width: min(100%, 760px);
  transform: translateX(-50%);
  z-index: 30;
  pointer-events: none;
}

/* 场地里的底部按钮：再来一局 / 离开场地 */
.court-foot {
  position: absolute;
  right: max(14px, env(safe-area-inset-right));
  bottom: calc(env(safe-area-inset-bottom) + 186px);
  z-index: 32;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.court-foot .room-enter {
  position: static;
  inset: auto;
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

/* --- 难度卡 --------------------------------------------------------------- */
.diff {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.diff__head {
  margin: 0;
  font-size: 12px;
  color: var(--text-dim);
}

.diff__row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.diff__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 4px;
  border-radius: var(--r-md);
  border: 2px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  cursor: pointer;
}

.diff__btn.is-on {
  border-color: #37d67a;
  background: color-mix(in srgb, #37d67a 16%, var(--surface-2));
}

.diff__btn b {
  font-size: 14px;
}

.diff__btn span {
  font-size: 10px;
  color: var(--text-dim);
  text-align: center;
}

.diff__opp {
  font-size: 12px;
  color: var(--text);
}
</style>
