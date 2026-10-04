<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { useRouter } from 'vue-router';
import GameCanvas from '../components/GameCanvas.vue';
import ArenaScreen from '../components/ArenaScreen.vue';
import { arenaLive } from '../composables/useArenaLive';
import PageShell from '../components/ui/PageShell.vue';
import Button from '../components/ui/Button.vue';
import AppModal from '../components/ui/AppModal.vue';
import ZoomControl from '../components/ui/ZoomControl.vue';
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
import { TRAIN_META, TRAIN_XP_PER, type TrainKey } from '../game/training';
import { ensureStats, pickOpponent, type AiPlayer } from '../game/players';
import { sfx } from '../game/audio';
import { useGameStore, type PracticeMode } from '../stores/game';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';
import { useProgressStore } from '../stores/progress';

/**
 * **大熊球馆**（原来的训练场 / 单机练习）——一间俯视大厅，分成三个区（`AREA_PLATES`）：
 *
 * - **🏆 中央比赛区**（上）：两张公开赛场地（100 赛 / 200 赛）**并排放在一起**，
 *   播赛事中心这两个档的真实直播，场地上方有计分板（`ArenaScreen` + `ArenaBoard`）、
 *   场边有座位；走近「坐下看」，镜头拉到 1:1（复用赛事中心的 `world-arena`）。
 * - **🏸 训练区**（左）：🏸 发球机（走近 → 右下角按钮 → 开练，开练后换成正式对局画布）。
 * - **🎾 普通场地区**（下）：6 张**空**场地（3×2）。走近「上场」打一盘（挑战人机 /
 *   邀请好友参赛），平时就空着——**不再放 AI 互打的演示**（一堆 Phaser 实例同时
 *   跑对局太卡）。走到附近才挂画面（`courtMounted`）。
 *
 * 每块场地下面都垫着一层 `.court-mat`（看台 + 地板 + 收边），所以 `hall` 画布
 * （只画线 + 网）看起来也是一块**真场地**；区与区之间是 `PATHS` 里的圆头走道。
 */
const router = useRouter();
const store = useGameStore();
const customize = useCustomizeStore();
const lobby = useLobbyStore();
const progress = useProgressStore();
const hud = ref<HudState | null>(null);

/* ===== 房间 =============================================================== */
const ROOM_W = 3600;
const ROOM_H = 2400;
const DOOR = { x: 1250, y: 2300 };
const EXIT_RADIUS = 175;

const stage = ref<HTMLElement | null>(null);
const plane = ref<HTMLElement | null>(null);
const meCanvas = ref<HTMLCanvasElement | null>(null);
const AVATAR_SCALE = 0.8;
const avatarBox = avatarBoxSize(AVATAR_SCALE);
const avatarFeetPad = Math.round(AVATAR_FEET_PAD * AVATAR_SCALE);

/** 前排 6 张普通场地（3 列 × 2 行，规则排列） */
const COURT_X = [700, 1800, 2900];
const COURT_Y = [1450, 1980];
const COURTS = COURT_Y.flatMap((y) => COURT_X.map((x) => ({ x, y })));

/**
 * 6 张普通场地**都是空的**：球馆里只有「中央比赛区」那两张公开赛场地在跑直播
 * （`STAGE_COURTS` + `ArenaScreen`），普通场地**不再放 AI 对局**——一堆 Phaser
 * 实例同时跑对局太卡。空场地可以「上场」或「邀请好友参赛」。
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

/** 练习区的**发球机**也做成一张场地（和 6 张普通场地同一套）：
 *  没在练的时候就是一块空场地（**不放 AI 演示**），走近点「开练」你自己上 */
const MACHINE = { x: 2600, y: 950 };
/** 发球机那一格的哨兵下标（不在 COURTS 里；镜头 / 盒子尺寸按它算） */
const MACHINE_SLOT = COURTS.length;
const machineMounted = ref(false);
const machinePlaying = ref(false);
/** 「上场」后弹的那张小卡：挑战人机 / 邀请好友参赛 */
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
  if (i == null) return null;
  const cup = cupSlotIndex(i);
  const c = i === MACHINE_SLOT ? MACHINE : cup >= 0 ? STAGE_COURTS[cup] : COURTS[i];
  const box = stage.value?.getBoundingClientRect();
  const w = box?.width ?? 844;
  const h = box?.height ?? 390;
  const fit = Math.max(0.3, Math.min(1.4, Math.min(w / VIEW_W, h / VIEW_H)));
  return { x: c.x, y: c.y + COURT_FOCUS_BIAS, zoom: fit };
}



/** 中排：只剩发球机（「对战 AI」已取消 —— 直接上前排任意一块空场地上场打） */
const PRACTICE = [
  { id: 'machine', x: 520, y: 900, sign: '🏸', name: '发球机', desc: '接球练连击' },
];

/** **中央比赛区**：两张公开赛场地**并排放在一起**（100 赛 / 200 赛）——
 *  播赛事中心这两个档的**真实直播**，上面有计分板（`ArenaBoard`） */
const STAGE_COURTS = [
  { id: 'cup100', x: 1400, y: 500, label: '100 赛', tier: 'l100' },
  { id: 'cup200', x: 2200, y: 500, label: '200 赛', tier: 'l200' },
];

/** 后排两块中央场地此刻要播的那一场（赛事中心 `l100` / `l200` 档的直播）。
 *  `worldState` 是纯函数、按 `now` 算，所以每秒喂一次新的时间戳刷新。 */
const arenaNow = ref(Date.now());
let arenaTick = Date.now();
const cupLive = computed(() =>
  STAGE_COURTS.map((c) => {
    void arenaNow.value;
    return arenaLive(progress.aiPlayers, c.tier, arenaNow.value);
  }),
);

/** 后排两块中央场地的镜头槽位（和发球机那格一样，是 `courtFocus` 的哨兵下标） */
const CUP_SLOTS = STAGE_COURTS.map((_, i) => COURTS.length + 1 + i);
const cupSlotIndex = (i: number): number => CUP_SLOTS.indexOf(i);

/** 两块公开赛场地的**计分**：观战直播的 HUD 给的，喂给场地上方那块牌子 */
const cupScore = ref<[number, number][]>(STAGE_COURTS.map(() => [0, 0]));
function onCupHud(i: number, s: HudState): void {
  const a = cupScore.value[i];
  if (a[0] !== s.score[0] || a[1] !== s.score[1]) cupScore.value[i] = [s.score[0], s.score[1]];
}

/** 场地之间的**走道**：一条主走道横贯全场（把中央比赛区与场地区分开）+ 一条副走道 +
 *  两条竖走道（左那条同时是**入口大道**，从出口一直通到主走道） */
const PATHS = [
  { x: 1800, y: 1130, w: 3360, h: 150 }, // 主走道
  { x: 1800, y: 1715, w: 3360, h: 130 }, // 副走道（普通场地两排之间）
  { x: 1250, y: 1665, w: 130, h: 1210 }, // 左侧竖走道（＝入口大道）
  { x: 2350, y: 1665, w: 130, h: 1210 }, // 右侧竖走道
];

/** 三个区的**地板平台**（纯地面装饰，压在最下层）：把一伙玩法圈在一起，看着像正经场馆 */
const AREA_PLATES = [
  { id: 'cup', name: '🏆 中央比赛区', x: 1800, y: 560, w: 2100, h: 700 },
  { id: 'practice', name: '🏸 训练区', x: 520, y: 900, w: 820, h: 560 },
  { id: 'courts', name: '🎾 普通场地区', x: 1800, y: 1715, w: 3300, h: 1030 },
];

/** 6 张普通场地也是可交互物：空的「上场」，有人的「坐下看」 */
const COURT_OBJECTS = COURTS.map((c, i) => ({ id: `court-${i}`, x: c.x, y: c.y }));
const WALK_OBJECTS = [...PRACTICE, ...STAGE_COURTS, ...COURT_OBJECTS];

function paintMe(now: number): void {
  const c = meCanvas.value;
  if (c) paintAvatar(c, customize.cosmetic, now, { scale: AVATAR_SCALE, facing: 1 });
}

/** 镜头能看到的半径（决定哪几张场地要把对局挂起来）；锁在场地里时按锁定视距算 */
function visibleRadius(): number {
  const box = stage.value?.getBoundingClientRect();
  const z = clampZoom(courtFocusCam()?.zoom ?? zoom.value);
  const vw = (box?.width ?? 844) / z;
  const vh = (box?.height ?? 390) / z;
  return Math.hypot(vw, vh) / 2 + 700;
}

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
    if (id === 'machine') openMachine();
    else if (id === 'ai') pendingMode.value = 'ai';
    else if (id.startsWith('court-') && courtFocus.value === null) {
      // 按 E / 点场地：普通场地都是空的 → 直接弹「上场」卡
      // （已经在一块场地上时忽略，免得打球时误点又弹一次卡）
      openCourt(Number(id.slice(6)));
    }
  },
  onFrame: (now) => {
    // 每秒刷一次赛事直播（`worldState` 按时间算的纯函数，得喂新时间戳才知道换场了）
    if (now - arenaTick > 1000) {
      arenaTick = now;
      arenaNow.value = now;
    }
    // 走到附近才把这块场地的画面挂起来（挂过就一直留着）：一堆 Phaser 实例
    // 一起跑太费，屏幕上通常同时只有 1~3 张（且都是空场地，只画线 + 网）
    const radius = visibleRadius();
    for (let i = 0; i < COURTS.length; i++) {
      if (courtMounted.value[i]) continue;
      const c = COURTS[i];
      if (Math.hypot(c.x - walk.me.value.x, c.y - walk.me.value.y) > radius) continue;
      courtMounted.value[i] = true;
    }
    // 发球机那一格同理
    if (
      !machineMounted.value &&
      Math.hypot(MACHINE.x - walk.me.value.x, MACHINE.y - walk.me.value.y) <= radius
    ) {
      machineMounted.value = true;
    }
    // 上场打球 / 发球机开练时我们就在场地里，球馆里那个走动的替身就别画了
    if (hallPlaying.value === null && !machinePlaying.value) paintMe(now);
  },
});
const { me, joy, nearId, tryEnter } = walk;

const nearDoor = computed(
  () => Math.hypot(me.value.x - DOOR.x, me.value.y - DOOR.y) < EXIT_RADIUS,
);

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
  rollOpponent();
  stamina.value = [100, 100];
  hallPlaying.value = i;
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

/** 后排中央球场：坐下看（镜头拉到那块直播屏，画面放大到 1:1） */
function watchCup(i: number): void {
  sfx.click();
  courtFocus.value = CUP_SLOTS[i];
}

/** 发球机：镜头拉到它那张场地，并把那一格切成「你自己练」（再点一次收手） */
function openMachine(): void {
  if (machinePlaying.value) {
    machinePlaying.value = false;
    courtFocus.value = null;
    return;
  }
  sfx.click();
  store.practice = 'machine'; // 让「连击换经验 / 里程碑」那套生效
  courtFocus.value = MACHINE_SLOT;
  machinePlaying.value = true;
}

/** 离开这块场地：回到球馆里走动（人机那局的结果已经记过账了） */
function leaveCourt(): void {
  sfx.click();
  courtCard.value = null;
  courtFocus.value = null;
  hallPlaying.value = null;
  machinePlaying.value = false;
  hallOver.value = false;
}

/** 整块重挂的 key：在「空场地」和「正式对局」之间切换、或换对手时要重开一局 */
function courtKey(i: number): string {
  const mode = hallPlaying.value === i ? 'play' : 'idle';
  return `${i}-${mode}-${currentOpponent.value?.id ?? ''}`;
}

/** 每张场地的比分（正式对局同一份 HUD 数据，摆到场地上方的计分板上） */
const courtScore = ref<[number, number][]>(COURTS.map(() => [0, 0]));

/** 那张场地的 HUD（正式对局页同一份数据）：记比分；我在打的那张还记体力 */
function onCourtHud(i: number, s: HudState): void {
  const a = courtScore.value[i];
  if (a[0] !== s.score[0] || a[1] !== s.score[1]) courtScore.value[i] = [s.score[0], s.score[1]];
  if (hallPlaying.value !== i) return;
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

/** 右下角那个按钮：6 张普通场地（都空着）+ 发球机 + 中央球场 */
const action = computed(() => {
  if (courtFocus.value !== null) return null;
  const id = nearId.value ?? '';
  if (id.startsWith('court-')) {
    return { label: '上场 · 这场地空着', court: Number(id.slice(6)), kind: 'play' as const };
  }
  if (id === 'machine') return { label: '发球机 · 开练', court: -1, kind: 'machine' as const };
  const cup = STAGE_COURTS.findIndex((c) => c.id === id);
  if (cup >= 0) return { label: '坐下看 · 中央球场', court: -1, kind: 'cup' as const, cup };
  return null;
});

function onAction(): void {
  const a = action.value;
  if (!a) return;
  if (a.kind === 'play') openCourt(a.court);
  else if (a.kind === 'cup') watchCup(a.cup);
  else openMachine();
}

const touch = isTouchDevice();
const { always: joyAlways } = useJoystickPrefs();
const showJoy = computed(() => touch || joyAlways.value);
const walkHint = computed(
  () =>
    `${touch ? '拖动摇杆' : 'WASD / 摇杆'}走动 · 下两排是空场地（可上场 / 邀请好友），上是公开赛直播，左侧是发球机`,
);

function leave(): void {
  sfx.click();
  void router.push('/');
}

/**
 * 练球机：每接到一颗球（连击 +1）给一笔「技术 + 防守」经验；
 * 连击每满 10 解锁一档「复古训练房」里程碑奖励（首次才发）。
 */
watch(
  () => hud.value?.machine?.streak ?? 0,
  (streak, prev) => {
    if (!isMachine.value) return;
    const gained = streak - (prev ?? 0);
    if (gained > 0) {
      const xp = gained * TRAIN_XP_PER.machineReturn;
      for (const k of progress.train({ technique: xp, defense: xp })) announceTrain(k);
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
    if (!isMachine.value && currentOpponent.value) {
      progress.recordVsAi(currentOpponent.value.id, win);
    }
    if (win) sfx.win();
    else sfx.lose();
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

            <!-- ===== 中央比赛区：两张公开赛场地**并排放在一起**（100 赛 / 200 赛）=====
                 播**赛事中心这两个档的真实直播**（同一台 GameCanvas + spectate，
                 和普通场地是同一份逻辑），场地上方有计分板，场边有座位区，走近可以坐下看 -->
            <div
              v-for="(c, i) in STAGE_COURTS"
              :key="c.id"
              class="cupscreen"
              :class="{ 'is-live': courtFocus === CUP_SLOTS[i] }"
              :style="{ left: `${c.x}px`, top: `${c.y}px` }"
            >
              <ArenaScreen
                :broadcast="cupLive[i]"
                :score="cupScore[i]"
                :focused="courtFocus === CUP_SLOTS[i]"
                :w="courtFocus === CUP_SLOTS[i] ? VIEW_W : courtBox.w"
                :h="courtFocus === CUP_SLOTS[i] ? VIEW_H : courtBox.h"
                :seats="13"
                :idle-text="`${c.label} · 本场已结束 · 等下一场`"
                :cosmetic="customize.cosmetic"
                :attrs="progress.attrs"
                :local-name="lobby.playerName"
                :local-rank="progress.tier.id"
                @hud="(s) => onCupHud(i, s)"
              />
              <span class="venue__name">{{ c.label }} · 公开赛</span>
            </div>

            <!-- ===== 训练区：发球机 ===== -->
            <div
              v-for="a in PRACTICE"
              :key="a.id"
              class="venue"
              :class="{ 'is-near': nearId === a.id }"
              :style="{ left: `${a.x}px`, top: `${a.y}px` }"
              @click="tryEnter(a.id)"
            >
              <!-- 发球机：和 6 张普通场地一样 —— 一张场地 + 一个真 GameCanvas
                   （发球机本身由场景自己画），没在练的时候是「AI 对着它练球」 -->
              <div
                class="micourt"
                :class="{ 'is-live': courtFocus === MACHINE_SLOT }"
                :style="{
                  width: `${courtFocus === MACHINE_SLOT ? VIEW_W : courtBox.w}px`,
                  height: `${courtFocus === MACHINE_SLOT ? VIEW_H : courtBox.h}px`,
                }"
              >
                <div class="court-mat" />
                <GameCanvas
                  v-if="machineMounted"
                  :key="`machine-${machinePlaying ? 'play' : 'idle'}`"
                  role="single"
                  :session="null"
                  option-id="machineEasy"
                  :hall="true"
                  :idle="!machinePlaying"
                  :no-sticks="true"
                  :no-hud="true"
                  :no-rematch="true"
                  :force-touch="machinePlaying"
                  :cosmetic="customize.cosmetic"
                  :attrs="progress.attrs"
                  :local-name="lobby.playerName"
                  :local-rank="progress.tier.id"
                  :party="false"
                  @hud="(s) => (hud = s)"
                  @sim="onEvent"
                />
              </div>
              <span class="venue__name">{{ a.name }}</span>
            </div>

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
                :key="courtKey(i)"
                role="single"
                :session="null"
                :opponent="hallPlaying === i ? opponentConfig : undefined"
                :hall="true"
                :idle="hallPlaying !== i"
                :force-touch="hallPlaying === i"
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

            <!-- 角色（上场打球 / 发球机开练时我们就在画面里，替身收起来） -->
            <div
              v-if="hallPlaying === null && !machinePlaying"
              class="avatar is-me"
              :style="{
                left: `${me.x}px`,
                top: `${me.y}px`,
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
            v-if="showJoy && hallPlaying === null && !machinePlaying"
            @move="(x, y) => (joy = { x, y })"
          />
          <!-- 上场打球 / 发球机开练：和正式对局同一对摇杆，而且**常显**（桌面 / 模拟器上也靠它走位） -->
          <GameSticks v-if="hallPlaying !== null || machinePlaying" :always="true" />
          <ZoomControl v-if="courtFocus === null" />

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
              {{ hallPlaying !== null ? '🚪 离开场地' : '👀 不看了' }}
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
        <p class="diff__head">镜头已经拉到这块场地上了。<b>和谁打？</b></p>
        <Button variant="primary" block @click="startHallMatch(courtCard ?? 0)">⚔️ 挑战人机</Button>
        <Button block @click="inviteToCourt(courtCard ?? 0)">🧑‍🤝‍🧑 邀请好友参赛</Button>
        <p class="muted" style="font-size: 13px">
          邀请好友：开出「场地 {{ (courtCard ?? 0) + 1 }}」这个房间并弹出好友面板，点「邀请」好友就进这个场地和你打。
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

/* 镜头拉近某一格（上场 / 坐下看 / 发球机开练）时，**其余场地全部收起来**：
   它们是各自的比例 / 分辨率，透过聚焦那一格的透明背景露出来时，就成了
   「小一号、发虚、像另一个图层」的幽灵角色。 */
.room.is-solo .mini:not(.is-live),
.room.is-solo .micourt:not(.is-live),
.room.is-solo .cupscreen:not(.is-live) {
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
/* 一块 ArenaScreen：场地 + 赛事中心真实直播 + 场边座位区 */
.cupscreen {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

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

.venue.is-near .court,
.venue.is-near .machine {
  filter: drop-shadow(0 0 9px rgba(255, 212, 92, 0.85));
}

.venue.is-near .court {
  border-color: #ffd45c;
}

.venue__name {
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(16, 30, 20, 0.55);
  font-size: 12px;
  font-weight: 800;
  color: #fff4dc;
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

/* 练习区那块「场地盒子」（发球机）：尺寸由内联给，和 6 张普通场地同一套 */
.micourt {
  position: relative;
  flex: none;
}

.machine {
  position: relative;
  width: 130px;
  height: 132px;
}

.machine__base {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 100px;
  height: 30px;
  border-radius: 10px;
  border: 2px solid #232833;
  background: linear-gradient(180deg, #6b7383, #3a4150);
  transform: translateX(-50%);
}

.machine__barrel {
  position: absolute;
  left: 50%;
  top: 34px;
  width: 26px;
  height: 58px;
  border-radius: 8px;
  border: 2px solid #232833;
  background: linear-gradient(180deg, #8b93a4, #4b5261);
  transform: translateX(-50%) rotate(14deg);
}

.machine__balls {
  position: absolute;
  left: 50%;
  top: 0;
  width: 46px;
  height: 26px;
  transform: translateX(-50%);
}

.machine__balls i {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #f6f7f9;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.machine__balls i:nth-child(1) {
  left: 2px;
  top: 9px;
}

.machine__balls i:nth-child(2) {
  left: 17px;
  top: 2px;
}

.machine__balls i:nth-child(3) {
  left: 32px;
  top: 10px;
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
