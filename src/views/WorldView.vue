<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import Joystick from '../components/ui/Joystick.vue';
import { isTouchDevice } from '../game/device';
import { useJoystickPrefs } from '../composables/useJoystick';
import { clampZoom, createPinchZoom, zoom } from '../composables/useZoom';
import { onboardingDone, onboardingForced } from '../composables/useOnboarding';
import AppModal from '../components/ui/AppModal.vue';
import OnboardingGuide from '../components/OnboardingGuide.vue';
import ComboPanel from '../components/ComboPanel.vue';
import TradePanel from '../components/TradePanel.vue';
import TabletPanel from '../components/TabletPanel.vue';
import {
  WORLD_DISTRICTS,
  WORLD_H,
  WORLD_W,
  WORLD_ZONES,
  ZONE_RADIUS,
  type WorldZone,
} from '../game/world/zones';
import { waitForRoomCode } from '../composables/useInviteRoom';
import { WORLD_NPCS, type WorldNpc } from '../game/world/npcs';
import { PLAYER_H } from '../game/constants';
import { RacketTracker } from '../game/racket';
import { DEFAULT_CONFIG } from '../game/config';
import { racketAim } from '../game/touch';
import { GZ_DAILY_MAX } from '../game/godzilla';
import { NAILONG_DAILY_MAX } from '../game/nailong';
import { ALIEN_DAILY_MAX, ALIEN_MILESTONES } from '../game/alien';
import { DEFAULT_COSMETIC } from '../game/cosmetics';
import CharacterPreview from '../components/CharacterPreview.vue';
import { AVATAR_FEET_PAD, REST_RACKET, avatarBoxSize, paintAvatar } from '../game/draw/canvas2d';
import { P } from '../game/theme';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';
import { useMapSession } from '../composables/useMapSession';
import { usePresenceStore } from '../stores/presence';
import { useProgressStore } from '../stores/progress';
import { useLobbyStore } from '../stores/lobby';
import { useCustomizeStore } from '../stores/customize';

const router = useRouter();
const presence = usePresenceStore();
const progress = useProgressStore();
const lobby = useLobbyStore();
const customize = useCustomizeStore();

/* --- 右侧活动入口 ---------------------------------------------------------------- */
/** 活动弹窗：左边一排 tab（简化信息），右边是选中那张活动的画面，点画面进原来的活动页 */
const eventsOpen = ref(false);

type EventId = 'nailong' | 'godzilla' | 'alien' | 'combo';

interface EventCard {
  id: EventId;
  icon: string;
  name: string;
  /** 左 tab 上那行简化信息 */
  brief: string;
  /** 右边画面上的一句说明 */
  desc: string;
  /** 画面里的角色形象（复用游戏同一份绘制）；没有就用大 emoji */
  skin?: 'nailong' | 'godzilla' | 'alien';
  /** 画面的天地两色（天空 / 地面） */
  art: [string, string];
  /** 画面下方的信息胶囊 */
  tags: string[];
  /** 「点了会去哪儿」 */
  cta: string;
}

const EVENTS = computed<EventCard[]>(() => [
  {
    id: 'nailong',
    icon: '🐲',
    name: '小黄龙联名',
    brief: `🎟 券 ${progress.nailongTickets}`,
    desc: `每天 ${NAILONG_DAILY_MAX} 张门票挑战小黄龙：趣味模式、先到 5 分，用球拍把球拍回去就行。赢下一场拿 1 张转盘券，转盘抽「小黄龙头套 / 小黄龙宝宝 / 小黄龙滚滚」。`,
    skin: 'nailong',
    art: ['#fff6cf', '#ffe7a3'],
    tags: [
      `🎟 抽奖券 ${progress.nailongTickets}`,
      `今日门票 ${progress.nailongLeftToday}/${NAILONG_DAILY_MAX}`,
    ],
    cta: '去挑战小黄龙',
  },
  {
    id: 'godzilla',
    icon: '🦖',
    name: '哥斯拉来袭',
    brief: `🎫 今日 ${progress.gzLeftToday}/${GZ_DAILY_MAX}`,
    desc: 'Boss 战：挥拍把火球拍回去砸它扣血，贴地激光要跳起来躲。你有 3 颗心，血空它就倒了——三档难度概率掉不同的限定，地狱难度才掉哥斯拉本体皮肤。',
    skin: 'godzilla',
    art: ['#e6eef6', '#cfd9e4'],
    tags: [
      `🎫 今日 ${progress.gzLeftToday}/${GZ_DAILY_MAX} 次`,
      `💀 累计 ${progress.gzKills} 杀`,
    ],
    cta: '去打哥斯拉',
  },
  {
    id: 'alien',
    icon: '🛸',
    name: '外星人降临',
    brief: `🎫 今日 ${progress.alienLeftToday}/${ALIEN_DAILY_MAX}`,
    desc: '一局 60 秒：飞碟越到后面撒陨石越密，每颗里裹着一个外星人——拍中陨石就把它击飞（算击败 +1），没拍中的落地会爬出来追着你打子弹，补拍也行。3 颗心，被砸到 / 碰到 / 打中掉一颗。',
    skin: 'alien',
    art: ['#0f1c33', '#243055'],
    tags: [
      `🎫 今日 ${progress.alienLeftToday}/${ALIEN_DAILY_MAX} 次`,
      `🏆 最高 ${progress.alienBest} 杀`,
      `🏅 里程碑 ${progress.alienTiers.length}/${ALIEN_MILESTONES.length}`,
    ],
    cta: '去打飞碟',
  },
  {
    id: 'combo',
    icon: '🎯',
    name: '连击里程碑',
    brief: `最高 ${progress.machineBest} · ${progress.milestones.length}/10`,
    desc: '发球机模式里的连击每满 10 的整数倍，就解锁一档「复古训练房」装扮（教练帽 / 涡轮双翼 / 冠军毛巾…），100 连击拿「发球机教练」形象。',
    art: ['#eaf8ff', '#cfeaff'],
    tags: [
      `🔥 历史最高 ${progress.machineBest} 连击`,
      `🏅 已解锁 ${progress.milestones.length}/10 档`,
    ],
    cta: '看进度 / 去练习',
  },
]);

const activeEventId = ref<EventId>('nailong');
const activeEvent = computed(
  () => EVENTS.value.find((e) => e.id === activeEventId.value) ?? EVENTS.value[0],
);

/** 画面里那个角色（小黄龙 / 哥斯拉），没有形象的用大 emoji 顶 */
const artCosmetic = computed(() =>
  activeEvent.value.skin
    ? { ...DEFAULT_COSMETIC, characterSkin: activeEvent.value.skin }
    : null,
);

const artBg = computed(() => {
  const [sky, floor] = activeEvent.value.art;
  // 62% 那条线是角色的脚（CharacterPreview 里 canvas 底边 = 天空/地面分界）
  return { background: `linear-gradient(180deg, ${sky} 0 62%, ${floor} 62% 100%)` };
});

/** 点右边的画面 = 进原来的活动页（连击里程碑是弹面板，不跳页） */
function openAlien(): void {
  eventsOpen.value = false;
  sfx.click();
  void router.push('/alien');
}

function enterEvent(id: EventId): void {
  if (id === 'nailong') openNailong();
  else if (id === 'godzilla') openGodzilla();
  else if (id === 'alien') openAlien();
  else openCombo();
}

/** 有券、或有今日挑战次数时，入口上点一个小红点提醒 */
const hasEventHint = computed(
  () =>
    progress.nailongTickets > 0 || progress.gzLeftToday > 0 || progress.alienLeftToday > 0,
);

function openEvents(): void {
  sfx.click();
  eventsOpen.value = true;
}

/** 小黄龙联名：跳转到活动页面（挑战 + 转盘） */
function openNailong(): void {
  eventsOpen.value = false;
  sfx.click();
  void router.push('/nailong');
}

/** 哥斯拉来袭：跳转到活动页面 */
function openGodzilla(): void {
  eventsOpen.value = false;
  sfx.click();
  void router.push('/godzilla');
}

/** 发球机连击里程碑：不跳页，直接弹详情看进度 */
const comboOpen = ref(false);

function openCombo(): void {
  eventsOpen.value = false;
  sfx.click();
  comboOpen.value = true;
}

/** 去看进度不如去练：跳到单机练习（走到球台 / 发球机开打） */
function goPractice(): void {
  comboOpen.value = false;
  sfx.click();
  void router.push('/single');
}

/* --- 地图上的角色：用游戏里那套绘制，所以装扮和球拍皮肤都跟着走 --------- */
const AVATAR_SCALE = 0.8;
const avatarBox = avatarBoxSize(AVATAR_SCALE);
const avatarFeetPad = Math.round(AVATAR_FEET_PAD * AVATAR_SCALE);
const meCanvas = ref<HTMLCanvasElement | null>(null);
const peerCanvas = ref<HTMLCanvasElement | null>(null);
/** 角色手（肩）离脚多高：NPC 的鞭子要钉在这个高度上 */
const HAND_UP = Math.round(PLAYER_H * 0.72 * AVATAR_SCALE);
let facing: 1 | -1 = 1;

/**
 * 新手引导：新号（0 积分）第一次进大世界自动弹三步 coach-mark；
 * 已在「设置 → 重看新手引导」里点过的（`forced`）不管积分多少都弹。
 */
const guideVisible = computed(
  () => onboardingForced.value || (!onboardingDone.value && progress.points === 0),
);

/* --- 右摇杆：控球拍指向（**比赛同一套手感**） ------------------------------- */
/**
 * 以前这里是自己手搓的「朝目标缓动 + 固定幅度」，手指推了球拍要慢慢跟过去，
 * 玩家一看就觉得和比赛里不是一只手。现在整个换成比赛那条管线：
 *
 * - 摇杆方向经 `racketAim`（1.3 灵敏度增益）映射成拍头目标 → **即时跟手**；
 * - 速度/轨迹由 `RacketTracker` 量（和比赛同一份平滑、瞬移保护、松手冻结速度），
 *   于是大世界的角色挥拍也会画出**身上装备的挥拍拖尾**。
 */
/** 右摇杆的归一化向量（松手回零） */
const racketJoy = ref({ x: 0, y: 0 });
/** 球拍状态（比赛同款取样器出：位置 + 速度 + 真实轨迹） */
const racket = new RacketTracker();
const racketSt = { rx: REST_RACKET.rx, ry: REST_RACKET.ry, rvx: 0, rvy: 0 };
/** 摇杆推到底时球拍相对斜举姿势能偏多远（角色单位） */
const RACKET_RANGE = 52;
/** 取样器配置：跟比赛一致，只把臂展放宽一点——大世界的待机位本来就偏在斜举位 */
const RACKET_CFG = { ...DEFAULT_CONFIG, racketMax: 128 };
/** 翻面时把取样器重置，免得斜举位镜像的跳变被当成一次挥拍 */
let racketFacing: 1 | -1 = 1;

function stepRacket(dt: number): void {
  if (facing !== racketFacing) {
    racketFacing = facing;
    racket.reset();
  }
  // 摇杆是屏幕方向：角色翻面时把 x 反过来（paintAvatar 内部还会再乘一次 facing），
  // 这样「往右推 = 球拍往右指」不看朝向。
  const v = racketAim(racketJoy.value.x, racketJoy.value.y);
  const tx = REST_RACKET.rx * facing + v.x * RACKET_RANGE;
  const ty = REST_RACKET.ry + v.y * RACKET_RANGE;
  const released = Math.hypot(racketJoy.value.x, racketJoy.value.y) < 0.02;
  const st = racket.update(tx, ty, 0, 0, dt, released, RACKET_CFG);
  // paintAvatar 的 racket 是「朝右坐标系」（内部再乘 facing），所以这里乘回去
  racketSt.rx = st.rx * facing;
  racketSt.ry = st.ry;
  racketSt.rvx = st.rvx;
  racketSt.rvy = st.rvy;
}

function paintMe(now: number): void {
  const canvas = meCanvas.value;
  if (!canvas) return;
  paintAvatar(canvas, customize.cosmetic, now, {
    scale: AVATAR_SCALE,
    facing,
    racket: { rx: racketSt.rx, ry: racketSt.ry },
    swingSpeed: Math.hypot(racketSt.rvx, racketSt.rvy),
    swingPath: racket.path.pts,
  });
}

/* --- 角色右手边的平板：点它弹出来（报名 / 预约 / 赛事中心 / 排行榜 / 新闻） --- */
const tabletOpen = ref(false);
/** 平板里正在打挑战（整屏对局）：这时屏蔽地图的键盘走动，免得一边打球一边把角色走丢 */
const tabletDuel = ref(false);
/** 待开赛的预约数：有就挂个角标，平板里是「我的预约」 */
const bookedCount = computed(() => Object.keys(progress.arenaBooking).length);
/**
 * 平板是地图上用 DOM 画的（不是画进 canvas），所以能直接点。
 * 视距缩小时按 1/zoom 反向放大一点，保证在任何视距下都还有手掌大的点击区。
 */
const tabletScale = computed(() => Math.min(1.6, Math.max(1, 1 / clampZoom(zoom.value))));

function openTablet(): void {
  sfx.click();
  tabletOpen.value = true;
}

/** 平板里报完名 → 直接去晋级赛馆打这一届 */
function onTabletSigned(): void {
  toastGood('已报名，去晋级赛馆打这一届');
  void router.push('/arena');
}

/* --- 一起逛：好友被邀请进来后，就站在这张地图上 ------------------------- */
const map = useMapSession();
// 解构成顶层 ref，模板里才会自动解包
const { code: mapCode, connState: mapConn, peer: mapPeer } = map;

/** 客人第一次拿到房主的位置时，站到他旁边 */
map.onFirstPeer = (x, y) => {
  me.value = clampToWorld(x + 70, y + 30);
};

function paintPeer(now: number): void {
  const peer = mapPeer.value;
  const canvas = peerCanvas.value;
  if (!peer || !canvas) return;
  // 对方用对战里 2 号位的颜色，和自己的 1 号位区分开
  paintAvatar(canvas, peer.cosmetic, now, {
    scale: AVATAR_SCALE,
    facing: peer.facing,
    color: P.player1,
  });
}

/* 左侧在线列表由大厅推送（App.vue 里汇总进 presence），这里不再自己塞数据 */

/** 接受好友的地图邀请后，直接进他的营地 */
watch(
  () => lobby.pendingJoin,
  () => {
    const code = lobby.consumeInvite('map');
    if (!code) return;
    void map.join(code);
  },
  { immediate: true },
);

/**
 * 好友面板点「邀请」时若无房间：自动走一遍建房，等房号出来再发邀请。
 * 有了它，邀请好友不用再先手动「建房一起逛」。
 */
async function ensureInviteRoom(): Promise<string> {
  if (mapCode.value) return mapCode.value;
  if (mapConn.value === 'off') map.host();
  return waitForRoomCode(() => mapCode.value);
}

/** 角色在平面上的坐标 + 摇杆推力 + 键盘按住的方向 */
const me = ref({ x: 620, y: 760 });
const joy = ref({ x: 0, y: 0 });
// 摇杆：触屏必显；桌面端开了「摇杆常显」也显示（设置里改）
const { always: joyAlways } = useJoystickPrefs();
const showJoy = computed(() => isTouchDevice() || joyAlways.value);
const held = new Set<string>();
const MOVED_SPEED = 400; // px/s
const cam = ref({ x: 0, y: 0 });

/* --- 视距（zoom）：双指捏合，大世界与各房间共用同一份 --------------------- */
/**
 * 双指捏合：固定摇杆 / 进入按钮 / 平板上的手指不参与——`.joy-zone`（自由摇杆热区）
 * **故意留着**，捏合要能从它上面起手（摇杆靠 `pinchActive` 让位）。
 *
 * `splitHalves`：大世界左右各一颗自由摇杆，**两指分处左右两半 = 一边走一边挥拍**，
 * 不能当成捏合（否则两颗摇杆一起让位，走也走不了、拍也挥不出）；同一半里的两指
 * 仍是捏合，所以缩放照旧。
 */
const pinch = createPinchZoom({
  ignore: '.joy, .world-enter, .world__tablet',
  splitHalves: true,
});

const nearZone = ref<WorldZone | null>(null);
const plane = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);
/**
 * 角色与平板这两块 DOM：位置**每帧直接写 style**，不走模板绑定。
 * 绑到 `me`（每秒变 60 次）上会让整个大世界每帧重渲染一次——直接写 DOM 后，
 * `me` 不再被渲染函数读取，改它就不会触发组件更新。
 */
const meBox = ref<HTMLElement | null>(null);
const tabletBtn = ref<HTMLElement | null>(null);

/* --- 段位/背包/宝箱(跳商城)/好友/成就都由 PageShell 内置 --- */

/** 在线玩家列表已移除（左侧不再显示）；好友邀请走右上角好友面板 */

const KEY_VECTORS: Record<string, [number, number]> = {
  arrowleft: [-1, 0],
  a: [-1, 0],
  arrowright: [1, 0],
  d: [1, 0],
  arrowup: [0, -1],
  w: [0, -1],
  arrowdown: [0, 1],
  s: [0, 1],
};

function clampToWorld(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.max(70, Math.min(WORLD_W - 70, x)),
    y: Math.max(70, Math.min(WORLD_H - 70, y)),
  };
}

/* --- 地图上的固定 NPC（赚钱区的农场主）：靠近 → 骂一句 → 抽你一鞭 ---------- */
//
// 一个 NPC 的「演出」是一条时间轴（`act` 秒，-1 = 闲着）：
//   0.00~0.80 冒对话气泡（台词见 `world/npcs.ts`）
//   0.80~1.50 挥鞭（CSS 动画），其中 0.95 那一瞬真的抽到你
// 演出结束进冷却（`npc.cooldown` 秒），所以站在他旁边会被反复抽。

interface NpcRt {
  facing: 1 | -1;
  /** 演出进度（秒），-1 = 闲着 */
  act: number;
  /** 冷却剩余（秒） */
  cd: number;
  /** 这一鞭是否已经抽到你了（防止同一鞭抽两下） */
  hit: boolean;
  /** 这一趟演出是「真抽」还是只是嘀咕一句（按 `lashChance` 抽） */
  whip: boolean;
}

/** 收购面板（农场主）是不是开着；开着时他不抽你 */
const tradeOpen = ref(false);
/** 正在跟谁交易（也是「靠近了收购商」的判据，用来显示 💰 按钮 / 接管 E 键） */
const tradeNpc = ref<WorldNpc | null>(null);

/**
 * 站在哪个收购商的范围里（没有就是 null）。
 *
 * **刻意不是 computed**：它依赖人的坐标，而坐标每帧都在动——做成 computed 会让
 * 整个大世界每帧重渲染一次。改成 ref，在 `updateCamera()` 里算，且只在**结果
 * 变了**才写（同引用不触发更新），于是跨进 / 跨出收购范围时才更新一次。
 */
const nearTrader = ref<WorldNpc | null>(null);

function openTrade(n: WorldNpc): void {
  sfx.click();
  // 面板开着时键盘不生效，先把按住的键清掉，免得关掉面板后角色自己往前冲
  held.clear();
  tradeNpc.value = n;
  tradeOpen.value = true;
}

const npcRt = reactive<Record<string, NpcRt>>({});
const npcCanvases: Record<string, HTMLCanvasElement | null> = {};
/** 挨抽时冒的星星（纯 DOM + CSS 动画，动画结束自己摘掉） */
const stars = ref<{ id: number; x: number; y: number; dx: number; dy: number }[]>([]);
let starId = 0;
/** 被鞭子推开的速度（px/s，逐帧衰减） */
const knock = { x: 0, y: 0 };
/** 震屏强度：1 → 0 */
let shake = 0;

function npcRuntime(id: string): NpcRt {
  let rt = npcRt[id];
  if (!rt) {
    rt = { facing: 1, act: -1, cd: 1.5, hit: false, whip: false };
    npcRt[id] = rt;
  }
  return rt;
}

function setNpcCanvas(id: string, el: unknown): void {
  npcCanvases[id] = (el as HTMLCanvasElement | null) ?? null;
}

function paintNpcs(now: number): void {
  for (const n of WORLD_NPCS) {
    const canvas = npcCanvases[n.id];
    if (!canvas) continue;
    paintAvatar(canvas, n.cosmetic, now, {
      scale: AVATAR_SCALE,
      facing: npcRuntime(n.id).facing,
    });
  }
}

/** 正在说台词（气泡亮着；不抽鞭的那一趟会一直挂到演出结束） */
function npcSaying(n: WorldNpc): boolean {
  const rt = npcRt[n.id];
  if (!rt || rt.act < 0) return false;
  return rt.act < (rt.whip ? 0.8 : 0.95);
}

/** 正在挥鞭 */
function npcCracking(n: WorldNpc): boolean {
  const rt = npcRt[n.id];
  return !!rt && rt.whip && rt.act >= 0.8 && rt.act < 1.5;
}

/**
 * 鞭子朝哪边伸：挥鞭时**指向玩家**，平时斜垂在身前。
 * 角度是世界坐标里的（鞭子的旋转中心就是他的手），所以左右朝向都对。
 */
function whipAngle(n: WorldNpc): number {
  const rt = npcRt[n.id];
  const facing0 = rt?.facing ?? 1;
  const handX = n.x + facing0 * 12;
  const handY = n.y - HAND_UP;
  if (rt && npcCracking(n)) {
    return Math.atan2(me.value.y - HAND_UP * 0.6 - handY, me.value.x - handX);
  }
  return facing0 > 0 ? 0.55 : Math.PI - 0.55;
}

/** 挨了一鞭：震屏 + 朝外拍退 + 冒星星（**不掉任何东西**） */
function lash(n: WorldNpc): void {
  sfx.hit('smash');
  shake = 1;
  const dx = me.value.x - n.x;
  const dy = me.value.y - n.y;
  const len = Math.hypot(dx, dy) || 1;
  knock.x = (dx / len) * 620;
  knock.y = (dy / len) * 320;
  for (let i = 0; i < 4; i++) {
    stars.value = [
      ...stars.value,
      {
        id: ++starId,
        x: me.value.x,
        y: me.value.y - HAND_UP,
        dx: (Math.random() - 0.5) * 96,
        dy: -34 - Math.random() * 46,
      },
    ];
  }
}

function stepNpcs(dt: number): void {
  for (const n of WORLD_NPCS) {
    const rt = npcRuntime(n.id);
    if (rt.cd > 0) rt.cd = Math.max(0, rt.cd - dt);
    // 一直朝着玩家站（左右翻面而已，不会走过来）
    rt.facing = me.value.x >= n.x ? 1 : -1;

    // 正在跟他交易：整段演出让位（不然一边买卖一边挨抽）
    if (tradeOpen.value && tradeNpc.value?.id === n.id) continue;

    if (rt.act < 0) {
      const d = Math.hypot(me.value.x - n.x, me.value.y - n.y);
      if (d < n.range && rt.cd <= 0) {
        rt.act = 0;
        rt.hit = false;
        // 大多数时候他只是嘀咕一句，`lashChance` 的几率才顺手抽你一下
        rt.whip = Math.random() < n.lashChance;
        if (rt.whip) sfx.hit('serve');
        else sfx.click();
      }
      continue;
    }

    rt.act += dt;
    if (rt.whip && !rt.hit && rt.act >= 0.95) {
      rt.hit = true;
      lash(n);
    }
    if (rt.act >= (rt.whip ? 1.5 : 0.95)) {
      rt.act = -1;
      rt.cd = n.cooldown;
    }
  }
}

function updateCamera(): void {
  const box = stage.value?.getBoundingClientRect();
  const z = clampZoom(zoom.value);
  // 视口按缩放折算成「世界像素」；镜头在世界坐标系里跟着人走
  const viewW = (box?.width ?? 844) / z;
  const viewH = (box?.height ?? 390) / z;
  // **人物永远钉在屏幕正中**：不管视距怎么调都以人为中心，不按世界边界夹镜头
  // （视比世界大时，世界外面那一圈露的是底色，这是刻意的）
  cam.value = {
    x: me.value.x - viewW / 2,
    y: me.value.y - viewH / 2,
  };
  if (plane.value) {
    // 震屏：镜头整体抖几像素（衰减在 loop 里）
    const sx = shake > 0 ? (Math.random() - 0.5) * 16 * shake : 0;
    const sy = shake > 0 ? (Math.random() - 0.5) * 16 * shake : 0;
    plane.value.style.transform = `scale(${z}) translate(${-cam.value.x + sx}px, ${-cam.value.y + sy}px)`;
  }

  let near: WorldZone | null = null;
  let best = Infinity;
  for (const z of WORLD_ZONES) {
    const d = Math.hypot(z.x - me.value.x, z.y - me.value.y);
    if (d < ZONE_RADIUS && d < best) {
      best = d;
      near = z;
    }
  }
  nearZone.value = near;

  // 站在哪个收购商跟前（他站在区域圈外，所以单独判一次）；只在结果变了才写
  let trader: WorldNpc | null = null;
  let tBest = Infinity;
  for (const n of WORLD_NPCS) {
    if (!n.trader) continue;
    const d = Math.hypot(n.x - me.value.x, n.y - me.value.y);
    if (d < n.range && d < tBest) {
      tBest = d;
      trader = n;
    }
  }
  if (nearTrader.value !== trader) nearTrader.value = trader;
}

/**
 * 把角色的位置直接写进 DOM（不经过 Vue 响应式）。
 * 这两块（角色、平板）每帧都在动，走模板绑定会每帧重渲染整个大世界。
 */
function syncAvatarDom(): void {
  const x = me.value.x;
  const y = me.value.y;
  if (meBox.value) {
    meBox.value.style.left = `${x}px`;
    meBox.value.style.top = `${y}px`;
  }
  if (tabletBtn.value) {
    // 平板**不在缩放平面里**（见模板注释）：它必须压过自由摇杆的半屏热区才点得到，
    // 而平面是带 transform 的层叠上下文，里面的 z-index 永远压不过热区。
    // 人物永远钉在舞台正中（`updateCamera`），所以这里用「舞台中心 + 世界偏移 × 视距」换算。
    const z = clampZoom(zoom.value);
    const halfW = (stage.value?.clientWidth ?? 0) / 2;
    const halfH = (stage.value?.clientHeight ?? 0) / 2;
    tabletBtn.value.style.left = `${halfW + 30 * z}px`;
    tabletBtn.value.style.top = `${halfH - 52 * z}px`;
    // 原先它跟着平面一起被缩放了 z，现在自己乘回来（`tabletScale` 那套补偿照旧）
    tabletBtn.value.style.transform = `translate(-50%, -50%) scale(${z * tabletScale.value})`;
  }
}

let raf = 0;
let last = performance.now();
function loop(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  let vx = joy.value.x;
  let vy = joy.value.y;
  held.forEach((k) => {
    const v = KEY_VECTORS[k];
    if (v) {
      vx += v[0];
      vy += v[1];
    }
  });
  const len = Math.hypot(vx, vy);
  if (len > 0.06) {
    const k = Math.min(len, 1) / len;
    me.value = clampToWorld(
      me.value.x + vx * k * MOVED_SPEED * dt,
      me.value.y + vy * k * MOVED_SPEED * dt,
    );
    // 朝移动方向：球拍和身体会跟着翻面
    if (Math.abs(vx) > 0.06) facing = vx > 0 ? 1 : -1;
  }

  // 挨了鞭子之后那一下：被推着走一小段（速度逐帧衰减）
  if (Math.abs(knock.x) > 1 || Math.abs(knock.y) > 1) {
    me.value = clampToWorld(me.value.x + knock.x * dt, me.value.y + knock.y * dt);
    const damp = Math.max(0, 1 - 7 * dt);
    knock.x *= damp;
    knock.y *= damp;
  }
  if (shake > 0) shake = Math.max(0, shake - dt * 3.5);

  stepNpcs(dt);
  stepRacket(dt);
  updateCamera();
  syncAvatarDom();
  // 自己的位姿发给对方（12Hz），对方的位置插值过来
  map.tick(dt, { x: me.value.x, y: me.value.y, facing });
  paintMe(now);
  paintPeer(now);
  paintNpcs(now);
  raf = requestAnimationFrame(loop);
}

function enterZone(z: WorldZone): void {
  if (!z.route) {
    toastWarn(`${z.name} 还没开放`);
    return;
  }
  // 理发店现在可以先免费试穿，确认修改才收费（扣费在 BarberView 里），所以不拦
  sfx.click();
  presence.setWatching(null);
  toastGood(`走进「${z.name}」`);
  void router.push(z.route);
}

function onZoneClick(z: WorldZone): void {
  if (nearZone.value?.id === z.id) enterZone(z);
  else toastWarn(`「${z.name}」还太远，先走过去`);
}

/**
 * 右下角的「进入」按钮（手机主要入口，桌面也能点）：
 * 靠近区域圈时出现——收购商优先（他站在圈外），否则是最近的区域。
 */
const enterHint = computed<{ label: string; go: () => void } | null>(() => {
  if (eventsOpen.value || comboOpen.value || tradeOpen.value) return null;
  if (nearTrader.value)
    return { label: `💰 和${nearTrader.value.name}换钱`, go: () => openTrade(nearTrader.value!) };
  if (nearZone.value) {
    const z = nearZone.value;
    return { label: `🚪 进入 ${z.name}`, go: () => enterZone(z) };
  }
  return null;
});

function onKeyDown(e: KeyboardEvent): void {
  // 弹窗 / 平板里的挑战对局开着时不响应键盘走动 / 按 E 进区域
  // （不然一边看活动、一边打球的时候会被传走 / 把人走丢）
  if (eventsOpen.value || comboOpen.value || tradeOpen.value || tabletDuel.value) return;
  const k = e.key.toLowerCase();
  if (KEY_VECTORS[k]) held.add(k);
  if (k !== 'e') return;
  // 站在收购商跟前时，E 优先换钱（他站在区域圈外，正常不会两个都亮）
  const trader = nearTrader.value;
  if (trader) openTrade(trader);
  else if (nearZone.value) enterZone(nearZone.value);
}

function onKeyUp(e: KeyboardEvent): void {
  held.delete(e.key.toLowerCase());
}

/* --- 坞里的功能 ----------------------------------------------------------- */

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  updateCamera();
  // 角色 / 平板的位置是直写 DOM 的，首帧到来前先摆好，避免开场闪一下左上角
  syncAvatarDom();
  raf = requestAnimationFrame(loop);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  map.leave();
});
</script>

<template>
  <!-- 整页固定高度、不滚动：地图平面靠外壳的主区域撑开 -->
  <div class="page page--playing">
    <PageShell
      avatar
      title="大世界 · 营地"
      friends-kind="map"
      :friends-code="mapCode"
      :friends-can-invite="!!mapCode"
      :friends-ensure-room="ensureInviteRoom"
    >
    <template #stage>
      <div
        ref="stage"
        class="world"
        @pointerdown="pinch.onPointerDown"
        @pointermove="pinch.onPointerMove"
        @pointerup="pinch.onPointerUp"
        @pointercancel="pinch.onPointerUp"
      >
        <div ref="plane" class="world__plane" :style="{ width: `${WORLD_W}px`, height: `${WORLD_H}px` }">
          <div class="world__path" style="left: 0; top: 620px; width: 2400px; height: 120px" />
          <div class="world__path" style="left: 1080px; top: 0; width: 130px; height: 1400px" />
          <!-- 通往「赚钱区」的两条小路：主路下来 → 区内把海湾和矿洞连起来 -->
          <div class="world__path" style="left: 440px; top: 620px; width: 120px; height: 380px" />
          <div class="world__path" style="left: 240px; top: 1175px; width: 540px; height: 120px" />
          <!-- 右上「活动和商场区」的入口：从竖路横进去一段 -->
          <div class="world__path" style="left: 1140px; top: 320px; width: 280px; height: 120px" />
          <!-- 右下攀岩崖：另一条支路往南走到底 -->
          <div class="world__path" style="left: 1140px; top: 1120px; width: 960px; height: 120px" />

          <!-- 地块（赚钱区）：只画地面，不挡点击 -->
          <div
            v-for="d in WORLD_DISTRICTS"
            :key="d.id"
            class="district"
            :style="{
              left: `${d.x}px`,
              top: `${d.y}px`,
              width: `${d.w}px`,
              height: `${d.h}px`,
            }"
          >
            <span class="district__name">{{ d.name }}</span>
            <span class="district__meta">{{ d.meta }}</span>
          </div>

          <button
            v-for="z in WORLD_ZONES"
            :key="z.id"
            class="zone jelly"
            type="button"
            :style="{ left: `${z.x}px`, top: `${z.y}px` }"
            @click="onZoneClick(z)"
          >
            <span class="zone__sign">{{ z.sign }}</span>
            <span class="zone__name">{{ z.name }}</span>
            <span class="zone__meta">{{ z.meta }}</span>
            <span v-if="z.badge" class="zone__badge">{{ z.badge }}</span>
          </button>

          <!-- 固定 NPC（赚钱区的农场主）：和玩家同一份绘制，脚底同样对齐坐标点 -->
          <div
            v-for="n in WORLD_NPCS"
            :key="n.id"
            class="avatar is-npc"
            :style="{
              left: `${n.x}px`,
              top: `${n.y}px`,
              width: `${avatarBox.w}px`,
              height: `${avatarBox.h}px`,
              transform: `translate(-50%, calc(-100% + ${avatarFeetPad}px))`,
            }"
          >
            <canvas :ref="(el) => setNpcCanvas(n.id, el)" class="avatar__rig" />
            <!-- 说话时腾出位置给气泡（名字占的是同一块地方） -->
            <div v-if="!npcSaying(n)" class="avatar__name">{{ n.name }}</div>
          </div>

          <!-- 他手里的鞭子：柄钉在手上，平时斜垂、抽你时指向你 -->
          <div
            v-for="n in WORLD_NPCS"
            :key="`whip-${n.id}`"
            class="npc-whip"
            :class="{ 'is-crack': npcCracking(n) }"
            :style="{
              left: `${n.x + (npcRt[n.id]?.facing ?? 1) * 12}px`,
              top: `${n.y - HAND_UP}px`,
              transform: `rotate(${whipAngle(n)}rad)`,
            }"
          >
            <div class="npc-whip__lash">
              <svg class="npc-whip__svg" viewBox="0 0 130 26" preserveAspectRatio="none">
                <path
                  d="M6 20 C 44 3 82 5 126 16"
                  stroke="#5f4227"
                  stroke-width="5.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <path
                  d="M6 20 C 44 3 82 5 126 16"
                  stroke="#c99a5c"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                />
                <circle cx="6" cy="20" r="5.5" fill="#4a3320" />
                <circle class="npc-whip__tip" cx="126" cy="16" r="7" fill="#ffe27a" />
              </svg>
            </div>
          </div>

          <!-- 台词气泡：冒完就抽你 -->
          <div
            v-for="n in WORLD_NPCS"
            v-show="npcSaying(n)"
            :key="`say-${n.id}`"
            class="npc-say"
            :style="{
              left: `${n.x}px`,
              top: `${n.y - avatarBox.h * 0.72}px`,
            }"
          >
            {{ n.line }}
          </div>

          <!-- 站在收购商（农场主）跟前：点这个或按 E，把仓库里的棉花 / 矿石 / 鱼换成钱 -->
          <button
            v-for="n in WORLD_NPCS.filter((x) => x.trader)"
            v-show="nearTrader?.id === n.id"
            :key="`trade-${n.id}`"
            class="npc-trade jelly"
            type="button"
            :style="{ left: `${n.x + 58}px`, top: `${n.y - 64}px` }"
            @click="openTrade(n)"
          >
            💰 换钱
          </button>

          <!-- 挨抽时冒的星星 -->
          <span
            v-for="s in stars"
            :key="s.id"
            class="hit-star"
            :style="{
              left: `${s.x}px`,
              top: `${s.y}px`,
              '--dx': `${s.dx}px`,
              '--dy': `${s.dy}px`,
            }"
            @animationend="stars = stars.filter((o) => o.id !== s.id)"
          >
            ⭐
          </span>

          <!-- 角色：和游戏里同一份绘制（含全部装扮 + 球拍皮肤），脚底对齐坐标点 -->
          <div
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

          <!-- 好友：同样的绘制，用 2 号位颜色区分，位置来自 12Hz 同步 -->
          <div
            v-if="mapPeer"
            class="avatar is-friend"
            :style="{
              left: `${mapPeer.x}px`,
              top: `${mapPeer.y}px`,
              width: `${avatarBox.w}px`,
              height: `${avatarBox.h}px`,
              transform: `translate(-50%, calc(-100% + ${avatarFeetPad}px))`,
            }"
          >
            <canvas ref="peerCanvas" class="avatar__rig" />
            <div class="avatar__name">{{ mapPeer.name }}</div>
          </div>
        </div>

        <!-- 角色右手边上那台平板：点它弹出「ArenaOS」（报名 / 预约 / 赛事中心 / 排行）。
             ⚠️ **刻意摆在平面之外**：平面带 transform，是个层叠上下文，里面的节点
             z-index 永远压不过自由摇杆的半屏热区（28）——就会被热区吞掉，点它变成走路。
             放在舞台层（z-index 31）才点得到；位置每帧由 `syncAvatarDom()` 直写。 -->
        <button
          ref="tabletBtn"
          class="world__tablet"
          type="button"
          title="平板 · 赛事报名 / 我的预约"
          @click.stop="openTablet"
        >
          <span class="world__tablet-frame">
            <span class="world__tablet-screen">🏆</span>
          </span>
          <span v-if="bookedCount" class="world__tablet-dot num">{{ bookedCount }}</span>
        </button>

        <div class="world__prompt" :class="{ 'is-on': !!nearZone }">
          {{ nearZone ? `按 E 进入「${nearZone.name}」` : '' }}
        </div>
        <div class="world__hint">摇杆 / WASD 自由走动 · 走进区域圈里按 E 进入</div>

        <!-- 活动：右侧只留一个入口，点开弹窗挑活动（活动随时可进，不用跑地图） -->
        <div class="world__events">
          <button
            class="world__event jelly"
            type="button"
            title="活动 · 小黄龙联名 / 哥斯拉来袭 / 连击里程碑"
            @click="openEvents"
          >
            <span class="world__event-icon">🎪</span>
            <span class="world__event-text">
              <b>活动</b>
              <em>小黄龙 · 哥斯拉 · 里程碑</em>
            </span>
            <span v-if="hasEventHint" class="world__event-dot" aria-hidden="true" />
          </button>
        </div>

        <!-- 左：走动；右：控球拍（松手回到斜举姿势） -->
        <Joystick v-if="showJoy" @move="(x, y) => (joy = { x, y })" />
        <!-- 右摇杆死区和比赛里那颗一致（0.15），手感不再两套 -->
        <Joystick v-if="showJoy" side="right" :dead-zone="0.15" @move="(x, y) => (racketJoy = { x, y })" />

        <!-- 新手引导：三步 coach-mark（可跳过、不锁界面），设置里可重看 -->
        <OnboardingGuide
          v-if="guideVisible"
          :get-me="() => me"
          :get-near="() => nearZone"
          :get-stage="() => stage"
          :show-joy="showJoy"
        />

        <!-- 视距：地图上**双指捏合**调（原来的右缘滑块已下线） -->

        <!-- 靠近区域 / 收购商：右下角出现「进入」按钮（层级压过摇杆热区，点它不会走人） -->
        <button v-if="enterHint" class="world-enter" type="button" @click="enterHint.go()">
          {{ enterHint.label }}
        </button>
      </div>
    </template>
  </PageShell>

  <!-- 活动：右上角的 🎪 打开。左边一排 tab 只放简化信息，右边是选中那张活动的画面，
       点画面就等于点「进入」（跳活动页 / 弹连击面板）。
       注意必须放在 PageShell 外面——它只有具名插槽，没有默认插槽，
       写在里面的内容根本不会渲染（之前就是踩了这个坑）。 -->
  <AppModal v-model="eventsOpen" title="🎪 活动" max-width="760px">
    <div class="evs">
      <!-- 左：活动 tab（简化信息） -->
      <div class="evs__tabs">
        <button
          v-for="e in EVENTS"
          :key="e.id"
          class="evs__tab"
          :class="{ 'is-on': e.id === activeEvent.id }"
          type="button"
          @click="sfx.click(); activeEventId = e.id"
        >
          <span class="evs__tab-icon">{{ e.icon }}</span>
          <span class="evs__tab-text">
            <b>{{ e.name }}</b>
            <em class="num">{{ e.brief }}</em>
          </span>
        </button>
      </div>

      <!-- 右：选中活动的画面，整块可点 -->
      <button class="evs__view" type="button" @click="enterEvent(activeEvent.id)">
        <div class="evs__art" :style="artBg">
          <CharacterPreview v-if="artCosmetic" :cosmetic="artCosmetic" />
          <span v-else class="evs__emoji">{{ activeEvent.icon }}</span>
        </div>
        <b class="evs__title">{{ activeEvent.icon }} {{ activeEvent.name }}</b>
        <p class="evs__desc">{{ activeEvent.desc }}</p>
        <div class="evs__tags">
          <span v-for="t in activeEvent.tags" :key="t" class="evs__tag num">{{ t }}</span>
        </div>
        <span class="evs__cta">{{ activeEvent.cta }} →</span>
      </button>
    </div>
  </AppModal>

  <!-- 发球机连击里程碑：点上面活动弹窗里的 🎯 打开，看进度与奖励 -->
  <AppModal v-model="comboOpen" title="🎯 连击里程碑" max-width="560px">
    <ComboPanel @play="goPractice" />
  </AppModal>

  <!-- 农场主收购站：棉花 / 矿石 / 鱼都在这里换成金币（材料唯一的取钱处） -->
  <AppModal v-model="tradeOpen" title="💰 农场主收购站" max-width="520px">
    <TradePanel :line="tradeNpc?.tradeLine" />
  </AppModal>

  <!-- 角色右手边那台平板点出来的界面（报名 / 预约 / 赛事中心 / 排行榜 / 新闻周刊） -->
  <TabletPanel
    v-model="tabletOpen"
    @signed="onTabletSigned"
    @duel="(v) => (tabletDuel = v)"
  />
  </div>
</template>

<style scoped>
.dock-note {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-dim);
}

/* 视距靠**双指捏合**调（`composables/useZoom.ts` 的 `createPinchZoom`），没有滑块了 */

/* --- 右下角「进入」按钮：靠近区域圈时出现 ----------------------------------- */
.world-enter {
  position: absolute;
  right: max(14px, env(safe-area-inset-right));
  /* 抬到底部摇杆（最大 156px）之上，固定/自由摇杆都挡不到它 */
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

.world-enter:active {
  transform: scale(0.94);
}

@keyframes enter-pop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.9);
  }
}

@media (pointer: fine) {
  /* 桌面没有底部摇杆时贴角放，不占中间视野 */
  .world-enter {
    bottom: calc(env(safe-area-inset-bottom) + 24px);
  }
}

/* 坞里的房号输入：手机端也刚好能戳 */
.world-code {
  width: 100%;
  padding: 6px 10px;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 600;
  text-align: center;
}

/* --- 赚钱区那个拿鞭子的农场主 --------------------------------------------- */

/* 手里的鞭子：柄钉在手上（旋转中心就是柄），平时斜垂、抽人时指向你 */
.npc-whip {
  position: absolute;
  z-index: 7;
  width: 118px;
  height: 24px;
  pointer-events: none;
  /* 5px / 18px = SVG 里鞭柄 (6,20) 在 118×24 上的位置 */
  transform-origin: 5px 18px;
}

.npc-whip__lash {
  width: 100%;
  height: 100%;
  transform-origin: 5px 18px;
}

.npc-whip.is-crack .npc-whip__lash {
  animation: whip-crack 0.45s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.npc-whip__svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.npc-whip__tip {
  opacity: 0;
}

.npc-whip.is-crack .npc-whip__tip {
  animation: whip-tip 0.45s ease-out;
}

/* 收柄 → 甩出去 → 回弹 */
@keyframes whip-crack {
  0% {
    transform: rotate(-0.55rad) scaleX(0.55);
  }
  30% {
    transform: rotate(0.3rad) scaleX(1.2);
  }
  62% {
    transform: rotate(0.1rad) scaleX(1.04);
  }
  100% {
    transform: rotate(0rad) scaleX(1);
  }
}

/* 鞭梢抽中那一下的亮光 */
@keyframes whip-tip {
  0%,
  28% {
    opacity: 0;
  }
  42% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* 台词气泡（说完就抽你） */
.npc-say {
  position: absolute;
  z-index: 9;
  transform: translate(-50%, -100%);
  max-width: 250px;
  padding: 6px 11px;
  border-radius: 12px;
  background: #fffdf4;
  border: 1px solid #d8c08a;
  box-shadow: var(--e1);
  color: #5a4415;
  font-size: 12px;
  line-height: 1.45;
  pointer-events: none;
}

.npc-say::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -6px;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top: 6px solid #fffdf4;
  border-bottom: 0;
}

/* 收购商跟前的「💰 换钱」按钮 */
.npc-trade {
  position: absolute;
  z-index: 9;
  transform: translate(-50%, -50%);
  padding: 5px 11px;
  border-radius: var(--r-pill);
  border: 1px solid #d8b25c;
  background: #fff6d6;
  color: #6b4a10;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: var(--e1);
}

.npc-trade:hover {
  background: #ffeeb4;
}

/* 挨抽时冒的星星：一趟 CSS 动画，结束自己摘掉 */
.hit-star {
  position: absolute;
  z-index: 8;
  font-size: 16px;
  pointer-events: none;
  animation: hit-star 0.7s ease-out forwards;
}

@keyframes hit-star {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.6);
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.3)
      rotate(140deg);
  }
}

/* 角色用 canvas 画（见 game/draw/canvas2d.ts），外面这个盒子只负责定位 */
.avatar__rig {
  display: block;
  width: 100%;
  height: 100%;
  /* 放大到整块地图的尺寸时不要被 DOM 的抗锯齿糊掉 */
  image-rendering: auto;
}

/* 名字挂到头顶上方，不占盒子高度（盒子底部要对齐脚下的坐标点） */
.avatar__name {
  position: absolute;
  bottom: calc(100% - 4px);
  left: 50%;
  transform: translateX(-50%);
}

/* --- 角色右手边那台平板：点它弹出「ArenaOS」 -------------------------------
   它挂在**舞台层**（不在 `.world__plane` 里），所以要压过自由摇杆热区（28）；
   位置由 `syncAvatarDom()` 每帧直写（舞台中心 + 世界偏移 × 视距）。 */
.world__tablet {
  position: absolute;
  z-index: 31;
  width: 40px;
  height: 52px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  /* 稍微斜着举，像夹在手里 */
  filter: drop-shadow(0 4px 6px rgba(30, 24, 12, 0.28));
}

.world__tablet::before {
  /* 点击热区比画出来的机身再大一圈，缩得很小时也好点 */
  content: '';
  position: absolute;
  inset: -12px;
}

.world__tablet-frame {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: 7px;
  padding: 3px;
  background: linear-gradient(160deg, #4a505a, #171a20 65%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.22);
  transform: rotate(-8deg);
  transition: transform var(--dur-1) var(--ease);
}

.world__tablet-screen {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  font-size: 16px;
  line-height: 1;
  background:
    radial-gradient(120% 90% at 30% 10%, #fffbe9 0%, rgba(255, 251, 233, 0) 70%),
    linear-gradient(160deg, #ffd88a, #eaa23c);
}

.world__tablet:hover .world__tablet-frame {
  transform: rotate(-2deg) scale(1.06);
}

.world__tablet:active .world__tablet-frame {
  transform: rotate(-8deg) scale(0.94);
}

/* 有预约待开赛：右上角挂个数字角标 */
.world__tablet-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 2px solid #fff;
  background: #d64545;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
/* --- 活动入口：挂在右上角「收起」按钮下面（点开是活动弹窗） --- */
.world__events {
  position: absolute;
  right: max(var(--s2), env(safe-area-inset-right));
  /* 让开右上角那一排工具栏（--ui-top-h） */
  top: calc(env(safe-area-inset-top) + var(--s2) + var(--ui-top-h) + 10px);
  /* 抬到区域卡、角色（z-index 6）以及自由摇杆的热区（28）之上：
     自由摇杆模式下右半屏都被摇杆热区盖住，活动入口是唯一只能点的按钮，必须点得到 */
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.world__event {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.55em;
  padding: 0.7em 1em;
  /* 整块字号走 --ui-*（随视口宽缩放），里面各元素用 em 跟着它走 */
  font-size: var(--ui-font-md);
  border-radius: var(--r-pill);
  border: 2px solid #ffd93d;
  background: linear-gradient(135deg, #fff6cf, #ffe07a);
  box-shadow: 0 8px 18px -8px rgba(120, 90, 0, 0.6);
  cursor: pointer;
}

.world__event-icon {
  font-size: 1.7em;
  line-height: 1;
}

.world__event-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.15;
}

.world__event-text b {
  font-size: 0.93em;
  color: #6a4a00;
}

.world__event-text em {
  font-style: normal;
  font-size: 0.71em;
  color: #9a7a20;
}

/* 有券 / 有今日挑战次数时的小红点 */
.world__event-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d42a3a;
  box-shadow: 0 0 0 2px #fff6cf;
}

/* --- 活动弹窗：左 tab + 右画面 --- */
.evs {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: var(--s3);
}

.evs__tabs {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.evs__tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
  text-align: left;
  cursor: pointer;
}

.evs__tab:hover {
  border-color: var(--line-strong);
}

.evs__tab.is-on {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, var(--surface-2));
}

.evs__tab-icon {
  flex: none;
  font-size: 20px;
  line-height: 1;
}

.evs__tab-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.evs__tab-text b {
  font-size: 13px;
  color: var(--text);
}

.evs__tab-text em {
  font-style: normal;
  font-size: 11px;
  color: var(--text-dim);
}

/* 右边那块「具体画面」：整块可点，点了就进活动 */
.evs__view {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
  text-align: left;
  cursor: pointer;
}

.evs__view:hover {
  border-color: var(--accent);
}

/* 画面：天空 + 地面（分界线对角色脚下），角色用游戏同一份绘制 */
.evs__art {
  position: relative;
  height: 172px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  border-radius: var(--r-md);
  overflow: hidden;
}

.evs__art :deep(.pc) {
  /* 关掉预览自带的球场底色与角标，只留角色（背景由 .evs__art 给） */
  width: auto;
  height: 100%;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: transparent !important;
}

.evs__art :deep(.pc__badge) {
  display: none;
}

.evs__emoji {
  align-self: center;
  font-size: 76px;
  line-height: 1;
}

.evs__title {
  font-size: 15px;
  color: var(--text);
}

.evs__desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-dim);
}

.evs__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.evs__tag {
  padding: 2px 9px;
  border-radius: var(--r-pill);
  background: color-mix(in srgb, var(--accent) 14%, var(--surface));
  font-size: 11px;
  color: var(--text);
}

.evs__cta {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
}

/* 手机上放不下左右两栏：tab 变横排，画面在下面 */
@media (max-width: 560px) {
  .evs {
    grid-template-columns: 1fr;
  }

  .evs__tabs {
    flex-direction: row;
    overflow-x: auto;
  }

  .evs__tab {
    flex: none;
  }
}
</style>
