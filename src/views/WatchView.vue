<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import GameCanvas from '../components/GameCanvas.vue';
import ArenaBracket from '../components/ArenaBracket.vue';
import PlayerProfile from '../components/PlayerProfile.vue';
import AppModal from '../components/ui/AppModal.vue';
import Joystick from '../components/ui/Joystick.vue';
import { ARENA_ROUNDS } from '../game/arena';
import {
  CUP_COUNT,
  CUP_ROUND_MS,
  MATCH_KEY,
  entrantSituation,
} from '../game/world-arena';
import { Crowd, type Walker } from '../game/world/spectators';
import { ensureStats, type AiPlayer } from '../game/players';
import { isTouchDevice } from '../game/device';
import { useJoystickPrefs } from '../composables/useJoystick';
import { AVATAR_FEET_PAD, asGraphics, avatarBoxSize, paintAvatar } from '../game/draw/canvas2d';
import { sfx } from '../game/audio';
import type { MatchOpponent } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import { toast, toastWarn } from '../composables/useToast';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';

/**
 * 👁 赛事中心（观战台）= **一间电影院**。
 *
 * - 走进房间，**靠近空座位**时右下角出现「🪑 坐」（手机点它 / 桌面按 E），坐下看墙上**大屏幕**；
 * - 大屏幕直播的是世界赛**正在进行的那一场**（见 `game/world-arena.ts`）：迷你球场 + 两位 AI 的真身
 *   （直接复用游戏里的 `paintAvatar`，装扮/球拍皮肤都跟着走）+ 来回的球 + 字幕；
 * - 邻座有 **NPC 入座**：按届号确定性从名人堂挑人（场上那两位不坐），头顶有名字；
 * - 坐下后还能「👁 进去真打」（双 AI 完整对局，打完把结果写回赛程）和「📋 赛程」（树状图 / 谁在打哪个赛事）。
 *
 * 行走系统与大地图（`WorldView.vue`）同源：DOM 平面 + `Joystick` 组件 + `paintAvatar` 画角色，
 * 所以手机端左摇杆（触屏必显 / 设置里可常显）与桌面 WASD 都能用。
 */
const router = useRouter();
const progress = useProgressStore();
const customize = useCustomizeStore();
const lobby = useLobbyStore();

/* --- 每秒钟走一格：倒计时 / 树状图随时间推进 --------------------------------- */
const tick = ref(Date.now());
let timer = 0;
onMounted(() => {
  progress.ensureLegend();
  timer = window.setInterval(() => {
    tick.value = Date.now();
  }, 1000);
  // 一进房间已经坐了 12 位观众（全是系统生成的），之后门口陆续有人进出
  crowd.prefill(Date.now(), 12);
  spectators.value = [...crowd.walkers];
  freeSig.value = crowd.freeSignature();
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  raf = requestAnimationFrame(loop);
});
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  cancelAnimationFrame(raf);
});

/* --- 世界赛：4 个杯同时在打，同一轮的比赛也是同时进行 -------------------------- */
const world = computed(() => progress.worldArenaState(tick.value));
const myRun = computed(() => progress.arenaRun);

/** 正在看哪个杯：'auto' = 自动跟随有直播的杯 */
const watchCup = ref<number | 'auto'>('auto');
/** 现在实际在看的那一个杯 */
const cupId = computed(() => {
  const st = world.value;
  if (watchCup.value !== 'auto') {
    const c = st.cups[watchCup.value];
    if (c) return c.id;
  }
  // 自动：优先跟有直播的杯（按杯号，稳定不跳台）
  return st.liveMatches[0]?.cup ?? st.cups[0]?.id ?? 0;
});
const cup = computed(() => world.value.cups[cupId.value]);

/** 每场状态（键 `${轮}:${场}`）：已经有结果的算已结束；正在直播的那一轮全是 live */
const phaseMap = computed<Record<string, 'upcoming' | 'live' | 'ended'>>(() => {
  const c = cup.value;
  if (!c) return {};
  const out: Record<string, 'upcoming' | 'live' | 'ended'> = {};
  for (let r = 0; r < c.rounds.length; r++) {
    for (let i = 0; i < c.rounds[r].length; i++) {
      const m = c.rounds[r][i];
      if (!m.a || !m.b) continue;
      // 没结果的只会出现在「当前轮」（live 或间隙）或之后的轮（还没开打）
      const phase: 'upcoming' | 'live' | 'ended' = m.winner
        ? 'ended'
        : c.live && c.round === r
          ? 'live'
          : 'upcoming';
      out[MATCH_KEY(r, i)] = phase;
    }
  }
  return out;
});

/** 正在看这个杯的哪些比赛在直播（同一轮的几场是同时进行的） */
const cupLive = computed(() => world.value.liveMatches.filter((l) => l.cup === cupId.value));

/** 树状图上手动点的「观看」：仍然只播直播，只是换成你点的那一场 */
const manualPick = ref<{ round: number; index: number } | null>(null);

/** 大屏播的那一场：优先你手动点的（还在直播的话），否则这一场里先开打的那一场 */
const broadcast = computed(() => {
  const c = cup.value;
  if (!c) return null;
  const picked =
    manualPick.value && c.id === cupId.value
      ? cupLive.value.find(
          (l) => l.round === manualPick.value!.round && l.index === manualPick.value!.index,
        )
      : undefined;
  const l = picked ?? cupLive.value[0];
  if (!l) return null;
  const m = c.rounds[l.round]?.[l.index];
  if (!m) return null;
  const a = c.entrants.find((e) => e.id === m.a);
  const b = c.entrants.find((e) => e.id === m.b);
  return a && b ? { ...l, a, b, season: c.season } : null;
});

/** 树状图上的「👁 观看」：只有正在直播的那些场次可点 */
function watchMatch(round: number, index: number): void {
  const l = cupLive.value.find((x) => x.round === round && x.index === index);
  if (!l) {
    toastWarn('这一场已经打完了，只播直播');
    return;
  }
  sfx.click();
  manualPick.value = { round, index };
  watchCup.value = cupId.value; // 钉在这个杯上，别被自动跟台切走
  toast(`📺 正在播放这一场（${cup.value?.roundNames[round] ?? ''}）`, 'info');
}

/** 树状图每场的补充说明：轮空 / 未开赛倒计时 */
const matchNote = computed<Record<string, string>>(() => {
  const c = cup.value;
  if (!c) return {};
  const out: Record<string, string> = {};
  for (let r = 0; r < c.rounds.length; r++) {
    for (let i = 0; i < c.rounds[r].length; i++) {
      const m = c.rounds[r][i];
      const key = MATCH_KEY(r, i);
      if (m.a && !m.b) {
        out[key] = '轮空 · 直接晋级';
        continue;
      }
      if (!m.a && m.b) {
        out[key] = '轮空 · 直接晋级';
        continue;
      }
      if (m.a && m.b && !m.winner && !(c.live && c.round === r)) {
        const from = c.startAt + r * CUP_ROUND_MS;
        out[key] = tick.value < from ? `⏳ ${mmss(from - tick.value)} 后开打` : '';
      }
    }
  }
  return out;
});

/** 正在直播的那些场次的键（树状图上给「👁 观看」按钮） */
const liveKeys = computed(() => cupLive.value.map((l) => MATCH_KEY(l.round, l.index)));

/** 大屏下方的「场地」签：本轮同时在打的每场一个，点谁切谁 */
const courtChips = computed(() => {
  const c = cup.value;
  if (!c) return [];
  const nm = (id: string) => c.entrants.find((e) => e.id === id)?.name ?? '—';
  return cupLive.value.map((l, i) => {
    const m = c.rounds[l.round]?.[l.index];
    return {
      key: MATCH_KEY(l.round, l.index),
      round: l.round,
      index: l.index,
      label: `场地${i + 1} · ${nm(m?.a ?? '')} VS ${nm(m?.b ?? '')}`,
    };
  });
});

/** 大屏正在播的那一场（树状图上标「📺 正在播」） */
const activeKey = computed(() => {
  const b = broadcast.value;
  return b ? MATCH_KEY(b.round, b.index) : '';
});

function mmss(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function clockOf(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 这个杯现在这段要不要等（间隙 / 未开赛）→ 下一轮开打还有多久 */
const cupWait = computed(() => {
  const c = cup.value;
  if (!c) return null;
  if (c.live) return null;
  if (c.round >= c.rounds.length) return null;
  return mmss(c.liveFrom - tick.value);
});

/** 本轮直播还剩多久 */
const liveLeft = computed(() =>
  cup.value?.live ? mmss(cup.value.liveTo - tick.value) : '',
);

/** 这一届还剩多久打完 */
const cupLeftText = computed(() =>
  cup.value ? mmss(Math.max(0, cup.value.endAt - tick.value)) : '',
);

// ============================================================================
// 影院房间
// ============================================================================

/** 房间平面尺寸（比视口大时相机会跟随） */
const ROOM_W = 1440;
const ROOM_H = 1180;
/** 后墙（挂屏幕的那面）的高度，往下就是地板 */
const WALL_H = 700;
/**
 * 墙上的大屏幕（房间坐标）：**正好 16:9**——
 * 对局是 1280×720 的逻辑画布、Phaser 用 `Scale.FIT` 等比缩放，
 * 只要这块屏本身是 16:9，投上去就是**满屏严丝合缝**（不留黑边、不拉伸）；
 * 尺寸也保证了投上去的字看得清（比分 64px → 52px，名字牌 15px → 12px）。
 */
const SCR = { x: 200, y: 60, w: 1040, h: 585 };
/**
 * 座位：左 / 中 / 右三块、每块两列，之间留两条过道（过道 x = 585 / 930）。
 * 列距 120 大于两倍 `SEAT_BLOCK`，所以两块之间**留得下一条窄缝**——
 * 玩家可以像真电影院那样侧身从两把椅子中间挤进去坐外侧的位子。
 */
const SEAT_COLS = [350, 470, 700, 820, 1040, 1160];
const SEAT_ROWS = [790, 880, 970];
/** 座位的「挡路」半径（走不进去，只能坐在旁边） */
const SEAT_BLOCK = 46;
/** 走到离座位这么近，右下角就出现「坐」（略大于过道到邻座的距离 115） */
const SIT_RANGE = 120;
/** 玩家一进房间站的位置（最后排正中的过道口） */
const SPAWN = { x: 720, y: 1100 };
/** 两条过道的中点 x：进出都走这里，玩家站起来也会挪到过道上 */
const AISLES = [585, 930];
/** 左右两个出入口（观众从这里进出） */
const DOORS = [
  { x: 200, y: 1150 },
  { x: 1240, y: 1150 },
];

interface Seat {
  id: string;
  x: number;
  y: number;
  /** 第几排（0 最靠屏幕）——决定绘制层级：越靠下越"近"，画在上层 */
  row: number;
}

const seatList: Seat[] = (() => {
  const out: Seat[] = [];
  SEAT_ROWS.forEach((y, r) => {
    SEAT_COLS.forEach((x, c) => out.push({ id: `s${r}-${c}`, x, y, row: r }));
  });
  return out;
})();

/** 每一层级的 z-index：排号越大越靠近镜头 */
const seatZ = (row: number): number => 10 + row * 10;
const rigZ = (row: number): number => 11 + row * 10;
const frontZ = (row: number): number => 12 + row * 10;

/**
 * 看台上的**系统观众**（见 `game/world/spectators.ts`）：
 * 名字 / 外观全由系统随机生成，跟名人堂名单无关；并且是**流动**的——
 * 门口不时有人走进来坐下，坐一阵再起身走到门口消失。
 */
const crowd = new Crowd({
  seats: seatList,
  aisles: AISLES,
  doors: DOORS,
  // 任何时候至少留 2 个空位给玩家
  minFree: 2,
  // 门口每 8~15 秒来一次「有人进 / 有人出」
  eventMs: [8000, 15000],
  // 坐下后停留 70 秒~3.5 分钟：跟上面的节奏配平，场内常驻约 12 位观众
  dwellMs: [70000, 210000],
});
const spectators = ref<Walker[]>([]);
/** 空位签名：变了才触发重渲染（空位要发蓝光 + 「坐」按钮的判据） */
const freeSig = ref('');
const freeIds = computed(() => new Set(freeSig.value ? freeSig.value.split(',') : []));

/* --- 行走 ------------------------------------------------------------------- */
const AVATAR_SCALE = 0.72;
const box = avatarBoxSize(AVATAR_SCALE);
const feetPad = Math.round(AVATAR_FEET_PAD * AVATAR_SCALE);

const me = ref({ ...SPAWN });
const joy = ref({ x: 0, y: 0 });
const facing = ref<1 | -1>(1);
const cam = ref({ x: 0, y: 0 });
const nearSeat = ref<Seat | null>(null);
/** 坐在哪个座位上（null = 站着） */
const seatedAt = ref<string | null>(null);
const stage = ref<HTMLElement | null>(null);
const plane = ref<HTMLElement | null>(null);
const meCanvas = ref<HTMLCanvasElement | null>(null);
/** 观众的 canvas（按观众 id）× 外层 div（每帧直接改样式，不走 Vue 渲染） */
const crowdCanvases = ref<Record<string, HTMLCanvasElement | null>>({});
const crowdEls: Record<string, HTMLElement | null> = {};
const screenFx = ref<HTMLCanvasElement | null>(null);

const { always: joyAlways } = useJoystickPrefs();
const showJoy = computed(() => isTouchDevice() || joyAlways.value);
/** 站立时角色画在所有座位之上；坐下时压在"自己那一排"的层级里（座垫会盖住腿） */
const meZ = computed(() => {
  const s = seatedAt.value ? seatList.find((x) => x.id === seatedAt.value) : null;
  return s ? rigZ(s.row) : 40;
});

const seatedSeat = computed(() =>
  seatedAt.value ? seatList.find((s) => s.id === seatedAt.value) ?? null : null,
);

const MOVE_SPEED = 380;
const KEY_VECTORS: Record<string, [number, number]> = {
  arrowleft: [-1, 0], a: [-1, 0],
  arrowright: [1, 0], d: [1, 0],
  arrowup: [0, -1], w: [0, -1],
  arrowdown: [0, 1], s: [0, 1],
};
const held = new Set<string>();

/** 可走范围：屏幕下沿再往下一点到房间底部（屏幕是一堵墙，走不上去） */
function clampRoom(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.max(90, Math.min(ROOM_W - 90, x)),
    y: Math.max(SCR.y + SCR.h + 18, Math.min(ROOM_H - 60, y)),
  };
}

/** 座位是实心的（可以绕着走，但进不去） */
function blocked(x: number, y: number, skip: string | null): boolean {
  for (const s of seatList) {
    if (s.id === skip) continue;
    if (Math.hypot(s.x - x, s.y - y) < SEAT_BLOCK) return true;
  }
  return false;
}

function setCrowdCanvas(id: string, el: unknown): void {
  crowdCanvases.value[id] = (el as HTMLCanvasElement | null) ?? null;
}

function setCrowdEl(id: string, el: unknown): void {
  crowdEls[id] = (el as HTMLElement | null) ?? null;
}

let raf = 0;
let last = performance.now();
/** 帧号：观众那十几张 canvas 隔帧重画就够（手机省一半开销，走路用的是每帧改样式） */
let frameNo = 0;

function loop(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  frameNo += 1;

  if (!seatedAt.value) {
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
      const dx = vx * k * MOVE_SPEED * dt;
      const dy = vy * k * MOVE_SPEED * dt;
      // 逐轴试算：撞到座位就只挡住那一个方向，可以贴着座位滑过去
      const nextX = clampRoom(me.value.x + dx, me.value.y);
      if (!blocked(nextX.x, me.value.y, null)) me.value = { x: nextX.x, y: me.value.y };
      const nextY = clampRoom(me.value.x, me.value.y + dy);
      if (!blocked(me.value.x, nextY.y, null)) me.value = { x: me.value.x, y: nextY.y };
      if (Math.abs(vx) > 0.06) facing.value = vx > 0 ? 1 : -1;
    }
  }

  stepCrowd(dt, now);
  stepNearSeat();
  updateCamera(dt);
  paintMe(now);
  if (frameNo % 2 === 0) paintCrowd(now);
  paintScreen(now);
  stepAmbience(now);
  raf = requestAnimationFrame(loop);
}

/** 推进观众（进场 / 坐下 / 起身 / 走出门），并把位置直接写进 DOM */
function stepCrowd(dt: number, now: number): void {
  // 上座率跟着「现在在看的这场」的重要程度走：越到后面坐得越满
  const lv = crowdLevel.value;
  if (crowd.level !== lv) crowd.setLevel(lv);
  if (crowd.step(dt, now)) spectators.value = [...crowd.walkers];
  const sig = crowd.freeSignature();
  if (sig !== freeSig.value) freeSig.value = sig;
  for (const w of crowd.walkers) {
    const el = crowdEls[w.id];
    if (!el) continue;
    el.style.left = `${w.x}px`;
    el.style.top = `${w.y}px`;
    // 层级按「现在走到哪一排」算：站在自己那排的人之后、下一排之前，
    // 所以侧身从别人面前过去时不会串到前排角色的前面去
    el.style.zIndex = String(frontZ(depthRow(w.y)));
  }
}

/** 这个 y 相当于第几排的深度（比第 0 排还靠里算 0，最后排之后算最后一排） */
function depthRow(y: number): number {
  let r = 0;
  for (let i = 0; i < SEAT_ROWS.length; i++) {
    if (y >= SEAT_ROWS[i] - 24) r = i;
  }
  return r;
}

/** 找最近的可坐空位（站着才找） */
function stepNearSeat(): void {
  if (seatedAt.value) {
    nearSeat.value = null;
    return;
  }
  let best: Seat | null = null;
  let bestD = Infinity;
  for (const s of seatList) {
    if (crowd.isTaken(s.id)) continue;
    const d = Math.hypot(s.x - me.value.x, s.y - me.value.y);
    if (d < SIT_RANGE && d < bestD) {
      bestD = d;
      best = s;
    }
  }
  nearSeat.value = best;
}

/**
 * 相机：站着跟着自己走；**坐下就把镜头对准大屏**（像真的在看电影）——
 * 竖屏 / 小屏会先保证看到屏幕最上面那条（比分行），再尽量多露出画面。
 * 目标位置做一点平滑跟随，坐下的瞬间镜头是"飘"过去的。
 */
function updateCamera(dt: number): void {
  const rect = stage.value?.getBoundingClientRect();
  const viewW = rect?.width ?? 900;
  const viewH = rect?.height ?? 420;
  const clampX = (v: number): number =>
    viewW >= ROOM_W ? (ROOM_W - viewW) / 2 : Math.max(0, Math.min(ROOM_W - viewW, v));
  const clampY = (v: number): number =>
    viewH >= ROOM_H ? (ROOM_H - viewH) / 2 : Math.max(0, Math.min(ROOM_H - viewH, v));

  let tx = clampX(me.value.x - viewW / 2);
  let ty = clampY(me.value.y - viewH / 2);
  if (seatedAt.value) {
    tx = clampX(SCR.x + SCR.w / 2 - viewW / 2);
    // 屏幕比视口高时，优先把屏幕顶部（比分行）留在画面里
    ty =
      viewH < SCR.h
        ? Math.min(clampY(SCR.y), clampY(SCR.y + SCR.h / 2 - viewH / 2))
        : clampY(SCR.y + SCR.h / 2 - viewH / 2);
  }

  const k = Math.min(1, dt * 7);
  const nx = cam.value.x + (tx - cam.value.x) * k;
  const ny = cam.value.y + (ty - cam.value.y) * k;
  cam.value = { x: Math.abs(nx - tx) < 0.5 ? tx : nx, y: Math.abs(ny - ty) < 0.5 ? ty : ny };

  if (plane.value) {
    plane.value.style.transform = `translate(${-cam.value.x}px, ${-cam.value.y}px)`;
  }
}

function paintMe(now: number): void {
  const canvas = meCanvas.value;
  if (!canvas) return;
  paintAvatar(canvas, customize.cosmetic, now, { scale: AVATAR_SCALE, facing: facing.value });
}

function paintCrowd(now: number): void {
  for (const w of crowd.walkers) {
    const canvas = crowdCanvases.value[w.id];
    if (!canvas) continue;
    paintAvatar(canvas, w.cosmetic, now, { scale: AVATAR_SCALE, facing: w.facing });
  }
}

/* --- 大屏幕 ----------------------------------------------------------------- */
/** 跑马灯：现在在看哪个杯、放的是什么 */
const marquee = computed(() => {
  const c = cup.value;
  const b = broadcast.value;
  if (!c) return '';
  const head = `${c.tier.glyph} ${c.name}(${c.tier.tag}) · 第 ${c.season % 1000 + 1} 届`;
  if (b) return `${head} · ${c.roundNames[b.round] ?? ''} · ${b.a.name} VS ${b.b.name}`;
  if (c.round >= c.rounds.length) return `${head} · 本届已结束`;
  return `${head} · 轮次间隙 · 下一轮 ${cupWait.value ?? ''}`;
});

const ticker = computed(() => {
  const b = broadcast.value;
  if (b) return `🔴 直播中 · ${liveLeft.value} · 同时进行 ${cupLive.value.length} 场`;
  return '本轮没有直播 · 马上看树状图或换个杯';
});

/**
 * 待机画面（轮次间隙 / 这一届打完了）：一块亮着灯的空场馆。
 * 「只显示直播」——没有直播时这里不放比赛，只放场馆和倒计时字幕。
 */
function paintScreen(now: number): void {
  if (broadcast.value) return; // 大屏在播真对局，这里空转
  const cv = screenFx.value;
  if (!cv) return;
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, SCR.w, SCR.h);
  const g = asGraphics(ctx);

  const W = SCR.w;
  const H = SCR.h;
  const s = H / 292;
  const floorY = H * 0.672;
  const baseY = H * 0.884;
  const netTop = H * 0.568;
  const backY = H * 0.685;

  // 背景：上半场馆、下半地板
  g.fillStyle(0x0c1322, 1);
  g.fillRect(0, 0, W, H);
  g.fillStyle(0x18273f, 1);
  g.fillRect(0, floorY, W, H - floorY);
  // 顶灯洒下的光锥
  g.fillStyle(0x9fd8ff, 0.07);
  g.fillTriangle(W * 0.5, 0, W * 0.103, H, W * 0.897, H);
  // 场地线
  g.lineStyle(2 * s, 0x8fd4ff, 0.3);
  g.lineBetween(W * 0.053, baseY, W * 0.947, baseY);
  g.lineBetween(W / 2, backY - H * 0.037, W / 2, baseY);
  g.lineBetween(W * 0.221, backY, W * 0.221, baseY);
  g.lineBetween(W * 0.779, backY, W * 0.779, baseY);
  g.lineStyle(1 * s, 0x8fd4ff, 0.16);
  for (let i = 1; i < 6; i++) {
    const x = W * 0.053 + (W * 0.894 * i) / 6;
    g.lineBetween(x, baseY, x, H);
  }
  // 球网
  g.lineStyle(3 * s, 0xdfefff, 0.5);
  g.lineBetween(W / 2, netTop, W / 2, baseY);
  g.lineStyle(1 * s, 0xdfefff, 0.3);
  for (let i = 0; i < 6; i++) {
    const y = netTop + i * H * 0.051;
    g.lineBetween(W / 2 - 4 * s, y, W / 2 + 4 * s, y);
  }
  // 地上两块灯光
  g.fillStyle(0x9fd8ff, 0.1);
  g.fillEllipse(W * 0.25, baseY + 4 * s, W * 0.221, 26 * s);
  g.fillEllipse(W * 0.75, baseY + 4 * s, W * 0.221, 26 * s);

  // 同步倒计时：下一轮（本届没打完）或下一届开打——每帧重画，永远和真实时刻对得上
  const c = cup.value;
  if (c) {
    const finished = c.round >= c.rounds.length;
    const ms = finished ? Math.max(0, c.nextAt - now) : Math.max(0, c.liveFrom - now);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#eaf6ff';
    ctx.font = `700 ${Math.round(52 * s)}px 'Chakra Petch', sans-serif`;
    ctx.fillText(mmss(ms), W / 2, H * 0.44);
    ctx.fillStyle = 'rgba(214, 232, 250, 0.85)';
    ctx.font = `600 ${Math.round(19 * s)}px sans-serif`;
    ctx.fillText(
      `${c.tier.glyph} ${c.name}(${c.tier.tag}) · ${finished ? '下一届开打' : '下一轮开打'}`,
      W / 2,
      H * 0.55,
    );
  }
}

/* --- 坐下 / 站起来 ----------------------------------------------------------- */
function sitAt(seat: Seat | null): void {
  if (!seat) return;
  sfx.click();
  seatedAt.value = seat.id;
  // 占住这个位子：观众就不会来坐了（起身时再释放）
  crowd.reserve(seat.id);
  // 坐进座位：脚正好落在座垫那一条上（座垫层级更高，会盖住小腿 → 看起来是坐着）
  me.value = { x: seat.x, y: seat.y };
  facing.value = seat.x > ROOM_W / 2 ? -1 : 1;
  nearSeat.value = null;
}

function stand(): void {
  sfx.click();
  const seat = seatedSeat.value;
  seatedAt.value = null;
  if (!seat) return;
  // 位子让出来，观众随时可以来坐
  crowd.release(seat.id);
  const aisle = AISLES.reduce(
    (best, a) => (Math.abs(a - seat.x) < Math.abs(best - seat.x) ? a : best),
    AISLES[0],
  );
  me.value = clampRoom(aisle, seat.y + 6);
}

function onKeyDown(e: KeyboardEvent): void {
  if (boardOpen.value) {
    if (e.key === 'Escape') boardOpen.value = false;
    return;
  }
  const k = e.key.toLowerCase();
  if (KEY_VECTORS[k]) held.add(k);
  if (k !== 'e') return;
  if (seatedAt.value) stand();
  else if (nearSeat.value) sitAt(nearSeat.value);
  else toastWarn('走到空座位旁边才能坐下');
}
function onKeyUp(e: KeyboardEvent): void {
  held.delete(e.key.toLowerCase());
}

/* --- 大屏直播：只播「正在进行」的比赛，选杯就是选频道 -------------------------- */
/** 大屏上那场对局喂给 GameCanvas 的两位选手 */
const screenOpps = computed(() =>
  broadcast.value
    ? {
        left: {
          name: broadcast.value.a.name,
          cosmetic: broadcast.value.a.cosmetic,
          stats: broadcast.value.a.stats,
        } satisfies MatchOpponent,
        right: {
          name: broadcast.value.b.name,
          cosmetic: broadcast.value.b.cosmetic,
          stats: broadcast.value.b.stats,
        } satisfies MatchOpponent,
      }
    : null,
);

/** 换一场（换轮 / 换杯）就换一个 key，让 GameCanvas 整个重挂（Phaser 对局不能"改人"） */
const screenKey = computed(() => {
  const c = cup.value;
  const b = broadcast.value;
  return b && c ? `live-c${c.id}-s${c.season}-r${b.round}-i${b.index}` : 'channel';
});

/** 正在看的是第几轮（上座率按它算：越到后面坐得越满） */
const focusRound = computed(() => broadcast.value?.round ?? cup.value?.round ?? 0);

/** 上座率：越到后面的轮次坐得越满（首轮 ~0.5，决赛坐满） */
const crowdLevel = computed(() => {
  const last = Math.max(1, ARENA_ROUNDS.length - 1);
  return 0.5 + 0.5 * Math.min(1, focusRound.value / last);
});

/** 这场打完了 → 自动切到这一轮的下一场（大屏永远只播直播） */
const screenResult = ref<string | null>(null);
// 换台（换杯 / 换轮 / 换场）时清掉上一场的战报
watch(screenKey, () => {
  screenResult.value = null;
});

function onSim(e: SimEvent): void {
  if (e.type === 'hit') {
    sfx.hit(e.kind ?? 'drive');
    // 扣杀最容易炸场
    if (e.kind === 'smash') cheer('wow');
  } else if (e.type === 'belly') sfx.hit('lift');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') {
    sfx.point();
    cheer(Math.random() < 0.45 ? 'gasp' : 'clap');
  } else if (e.type === 'gameover') {
    cheer('big');
    const b = broadcast.value;
    if (!b || screenResult.value) return;
    const winner = e.scorer === 0 ? b.a : b.b;
    const recorded = progress.recordWorldMatch(
      b.cup,
      b.season,
      b.round,
      b.index,
      winner.id,
    );
    screenResult.value = `${winner.name} 拿下这一场${recorded ? '，战绩已记入名人堂' : ''}`;
    sfx.win();
    tick.value = Date.now();
  }
}

/* --- 观众反应：偶尔鼓掌 / 惊呼 ------------------------------------------------ */
type CheerKind = 'clap' | 'gasp' | 'wow' | 'big';

interface Reaction {
  /** 观众 id + 起始时间拼出来的唯一 key */
  key: string;
  id: string;
  text: string;
  /** 开始冒出来的时刻（ms）——错开一点，看起来是"一片人"而不是整排机器 */
  at: number;
  /** 什么时候收掉 */
  until: number;
}
const REACTIONS: Record<CheerKind, string[]> = {
  clap: ['👏', '👏', '🎉'],
  gasp: ['😮', '😲'],
  wow: ['🤩', '😱', '🎊'],
  big: ['👏', '🎉', '🙌', '👏'],
};
const reactions = ref<Reaction[]>([]);
let reactionSeq = 0;
let lastCheer = 0;

/** 让一部分坐着的人鼓个掌 / 惊呼一声（走动的、还有你自己不参与） */
function cheer(kind: CheerKind, minGapMs = 0): void {
  const now = tick.value;
  if (minGapMs && performance.now() - lastCheer < minGapMs) return;
  lastCheer = performance.now();
  const seated = crowd.walkers.filter((w) => w.state === 'seated');
  if (!seated.length) return;
  const pool = [...seated].sort(() => Math.random() - 0.5);
  const n = Math.min(pool.length, kind === 'big' ? 8 : 3 + Math.floor(Math.random() * 4));
  const texts = REACTIONS[kind];
  const add: Reaction[] = [];
  for (let i = 0; i < n; i++) {
    const w = pool[i];
    const at = now + Math.random() * 620;
    reactionSeq += 1;
    add.push({
      key: `r${reactionSeq}`,
      id: w.id,
      text: texts[Math.floor(Math.random() * texts.length)],
      at,
      until: at + 1500 + Math.random() * 400,
    });
  }
  reactions.value = [...reactions.value, ...add].slice(-24);
}

/** 反应的时间窗过了就把它们收掉（只在真的变了的时候动响应式数组） */
function pruneReactions(now: number): void {
  if (!reactions.value.length) return;
  const next = reactions.value.filter((r) => r.until > now);
  if (next.length !== reactions.value.length) reactions.value = next;
}

/** 观众位置（头顶飘反应气泡用），按 id 查 */
function walkerAt(id: string): Walker | undefined {
  return crowd.walkers.find((w) => w.id === id);
}

/** 反应气泡的位置：缓一下，别在气泡冒出来的一瞬间人正好走位 */
const reactionSpots = computed(() =>
  reactions.value.map((r) => {
    const w = walkerAt(r.id);
    return { ...r, x: w?.x ?? -999, y: w?.y ?? -999 };
  }),
);

/** 闲时的气氛：没在播对局的时候也会偶尔来一片掌声 */
let nextAmbient = 0;
function stepAmbience(now: number): void {
  pruneReactions(now);
  if (!nextAmbient) nextAmbient = now + 12000 + Math.random() * 15000;
  if (now < nextAmbient) return;
  nextAmbient = now + 12000 + Math.random() * 20000;
  // 真在播对局时，掌声交给比赛事件触发；这里只管待机画面的气氛
  if (!broadcast.value) cheer(Math.random() < 0.25 ? 'wow' : 'clap');
}

/* --- 面板：选杯（上面）+ 树状图（下面）---------------------------------------- */
const boardOpen = ref(false);
const detail = ref<AiPlayer | null>(null);
const detailOpen = ref(false);

/** 每个杯在选单里的一行摘要 */
const cupChips = computed(() =>
  world.value.cups.map((c) => ({
    id: c.id,
    name: c.name,
    tag: c.tier.tag,
    glyph: c.tier.glyph,
    color: c.tier.color,
    entrants: c.entrants.length,
    roundNames: c.roundNames,
    season: c.season,
    round: c.round,
    live: c.live,
    liveCount: world.value.liveMatches.filter((l) => l.cup === c.id).length,
    wait: c.live ? '' : c.round >= c.rounds.length ? '本届结束' : mmss(Math.max(0, c.liveFrom - tick.value)),
  })),
);

function pickCup(id: number): void {
  sfx.click();
  watchCup.value = id;
  manualPick.value = null;
}

function pickAuto(): void {
  sfx.click();
  watchCup.value = 'auto';
  manualPick.value = null;
}

function openPlayer(id: string): void {
  const p = progress.aiPlayers.find((x) => x.id === id);
  if (!p) {
    toastWarn('这位球员已经不在名录里了');
    return;
  }
  sfx.click();
  detail.value = p;
  detailOpen.value = true;
}

/** 谁在打哪个赛事（按**正在看的杯**列） */
interface WhoRow {
  id: string;
  name: string;
  icon: string;
  label: string;
  live: boolean;
  round: number;
}
const whoRows = computed<WhoRow[]>(() => {
  const c = cup.value;
  if (!c) return [];
  const rows: WhoRow[] = [];
  for (const e of c.entrants) {
    const s = entrantSituation(c, e.id, tick.value);
    if (!s) continue;
    const foe = s.opponent?.name ?? '';
    const rn = c.roundNames[s.round] ?? ARENA_ROUNDS[s.round] ?? '';
    let icon = '⏳';
    let label = `${rn}：${clockOf(s.from)} 开打 vs ${foe}`;
    let live = false;
    if (s.out) {
      icon = '🚪';
      label = `${rn} 被 ${foe} 淘汰`;
    } else if (s.phase === 'live') {
      icon = '🔴';
      label = `${rn}：正在打 ${foe}`;
      live = true;
    } else if (s.phase === 'ended') {
      icon = '✅';
      label = `${rn} 击败 ${foe}，晋级`;
    }
    rows.push({ id: e.id, name: e.name, icon, label, live, round: s.round });
  }
  return rows.sort((a, b) => Number(b.live) - Number(a.live) || a.round - b.round);
});

/** 快进某一轮的第几场（结果按五维算，写回赛程） */
function fastForwardRound(): void {
  const c = cup.value;
  if (!c) return;
  sfx.click();
  const round = Math.min(c.round, c.rounds.length - 1);
  let n = 0;
  for (let i = 0; i < c.rounds[round].length; i++) {
    const m = c.rounds[round][i];
    if (m.a && m.b && !m.winner) {
      if (progress.fastForwardWorldMatch(c.id, c.season, round, i)) n += 1;
    }
  }
  tick.value = Date.now();
  if (n) toast(`这一轮 ${n} 场已出结果`, 'info');
  else toastWarn('这一轮已经全有结果了');
}

function back(): void {
  sfx.click();
  if (boardOpen.value) {
    boardOpen.value = false;
    return;
  }
  if (seatedAt.value) {
    stand();
    return;
  }
  void router.push('/');
}
</script>

<template>
  <div class="page page--playing">
    <PageShell title="赛事中心" back @back="back">
      <template #stage>
        <!-- 电影院：大屏可以投影一场真对局（选卡片 → 投上去） -->
        <div ref="stage" class="room">
          <div
            ref="plane"
            class="room__plane"
            :style="{ width: `${ROOM_W}px`, height: `${ROOM_H}px` }"
          >
            <!-- 墙 + 地板 -->
            <div class="room__wall" :style="{ height: `${WALL_H}px` }" />
            <div
              class="room__floor"
              :style="{ top: `${WALL_H}px`, height: `${ROOM_H - WALL_H}px` }"
            />

            <!-- 屏幕上方那条跑马灯：在看哪个杯、放的是什么 -->
            <div
              class="scr__marquee num"
              :style="{ left: `${SCR.x}px`, top: `${SCR.y - 44}px`, width: `${SCR.w}px` }"
            >
              <span class="scr__mq-title">
                {{ marquee }}
                <em :class="broadcast ? 'is-live' : 'is-replay'">
                  {{ broadcast ? '🔴 直播中' : '待机' }}
                </em>
                <template v-if="screenResult"> · {{ screenResult }}</template>
              </span>
            </div>

            <!-- 大屏幕：只播「正在进行」的对局；没有直播时是待机画面 -->
            <div
              class="scr"
              :style="{
                left: `${SCR.x}px`,
                top: `${SCR.y}px`,
                width: `${SCR.w}px`,
                height: `${SCR.h}px`,
              }"
            >
              <GameCanvas
                v-if="broadcast && screenOpps"
                :key="screenKey"
                class="scr__game"
                role="single"
                :spectate="screenOpps"
                :no-rematch="true"
                :session="null"
                :cosmetic="customize.cosmetic"
                :local-name="lobby.playerName"
                :local-rank="progress.tier.id"
                :theme="customize.theme"
                :auto-cycle-theme="customize.autoCycle"
                :party="false"
                @sim="onSim"
                @themechange="customize.theme = $event"
              />
              <template v-else>
                <canvas ref="screenFx" class="scr__fx" :width="SCR.w" :height="SCR.h" />
                <div class="scr__badge num">⏸ 待机</div>
                <div class="scr__ticker num">{{ ticker }}</div>
              </template>
            </div>

            <!-- 场地切换：本轮同时在打的几场，点谁大屏切到谁 -->
            <div
              v-if="courtChips.length"
              class="courts"
              :style="{ left: `${SCR.x}px`, top: `${SCR.y + SCR.h + 8}px`, width: `${SCR.w}px` }"
            >
              <button
                v-for="ch in courtChips"
                :key="ch.key"
                class="courts__chip num"
                :class="{ 'is-on': ch.key === activeKey }"
                type="button"
                @click="watchMatch(ch.round, ch.index)"
              >
                {{ ch.label }}
              </button>
            </div>

            <!-- 座位靠背（在角色后面） -->
            <div
              v-for="s in seatList"
              :key="`b-${s.id}`"
              class="seat__back"
              :style="{ left: `${s.x}px`, top: `${s.y}px`, zIndex: seatZ(s.row) }"
            />

            <!-- 观众：从门口走进来、坐下、坐够了自己走出去（位置每帧直接写样式） -->
            <div
              v-for="w in spectators"
              :key="w.id"
              class="avatar is-npc"
              :ref="(el) => setCrowdEl(w.id, el)"
              :style="{
                width: `${box.w}px`,
                height: `${box.h}px`,
                transform: `translate(-50%, calc(-100% + ${feetPad}px))`,
              }"
            >
              <canvas :ref="(el) => setCrowdCanvas(w.id, el)" class="avatar__rig" />
              <div class="avatar__name">{{ w.name }}</div>
            </div>

            <!-- 座垫（盖住腿，画在角色前面）；空位发蓝光 -->
            <div
              v-for="s in seatList"
              :key="`f-${s.id}`"
              class="seat__front"
              :class="{ 'is-free': freeIds.has(s.id) }"
              :style="{ left: `${s.x}px`, top: `${s.y}px`, zIndex: frontZ(s.row) }"
            />

            <!-- 左右两个出入口 -->
            <div
              v-for="(d, i) in DOORS"
              :key="`door-${i}`"
              class="room__door"
              :style="{ left: `${d.x}px`, top: `${d.y}px` }"
            />

            <!-- 玩家自己 -->
            <div
              class="avatar is-me"
              :style="{
                left: `${me.x}px`,
                top: `${me.y}px`,
                width: `${box.w}px`,
                height: `${box.h}px`,
                zIndex: meZ,
                transform: `translate(-50%, calc(-100% + ${feetPad}px))`,
              }"
            >
              <canvas ref="meCanvas" class="avatar__rig" />
              <div v-if="!seatedAt" class="avatar__name">你</div>
            </div>

            <!-- 观众的反应：鼓掌 / 惊呼（飘一下就收） -->
            <div
              v-for="r in reactionSpots"
              :key="r.key"
              class="cheer"
              :style="{
                left: `${r.x}px`,
                top: `${r.y - box.h}px`,
                zIndex: 60,
              }"
            >
              {{ r.text }}
            </div>
          </div>

          <!-- 手机/桌面：左摇杆走动 -->
          <Joystick v-if="showJoy" @move="(x, y) => (joy = { x, y })" />

          <div class="room__hint num">
            {{
              seatedAt
                ? '坐下了 · 镜头对着大屏 · 右下角可以选赛事'
                : '摇杆 / WASD 走动 · 走到发蓝光的空座位旁坐下（观众会一直进出）'
            }}
          </div>

          <!-- 右下角：坐 / 换杯 / 站起来 -->
          <div class="room__acts">
            <Button
              v-if="!seatedAt && nearSeat"
              variant="primary"
              size="lg"
              @click="sitAt(nearSeat)"
            >
              🪑 坐
            </Button>
            <Button size="lg" @click="boardOpen = true">📺 选杯</Button>
            <Button v-if="seatedAt" variant="quiet" size="lg" @click="stand">🧍 站起来</Button>
          </div>
        </div>
      </template>
    </PageShell>

    <!-- 选杯（上）+ 树状图（下）+ 谁在打哪个赛事 -->
    <AppModal v-model="boardOpen" title="赛事中心 · 选杯看直播">
      <div class="watch-stage">
        <!-- 上面：选杯（杯 = 段位，青铜 → 超神） -->
        <Panel class="watch-hero">
          <div class="hero__main">
            <div class="hero__title">📺 选一个段位杯看直播</div>
            <div class="muted hero__sub">
              杯按名人堂排名分级（<b class="num">{{ CUP_COUNT }}</b> 个段位，一位选手只打自己段位的杯）·
              同一轮的比赛<b>同时进行</b> · 现在共有 <b class="num">{{ world.liveMatches.length }}</b> 场正在直播
            </div>
          </div>
          <div class="hero__side">
            <label class="cup-auto">
              <input
                type="radio"
                name="cup"
                :checked="watchCup === 'auto'"
                @change="pickAuto"
              />
              <span>🔊 自动（跟有直播的杯）</span>
            </label>
          </div>
          <div class="cup-row">
            <button
              v-for="c in cupChips"
              :key="c.id"
              class="cup-chip"
              :class="{
                'is-live': c.live,
                'is-on': cupId === c.id,
                'is-auto': watchCup === 'auto',
              }"
              :style="cupId === c.id ? { boxShadow: `0 0 0 2px ${c.color}` } : undefined"
              type="button"
              @click="pickCup(c.id)"
            >
              <span class="cup-chip__name">{{ c.glyph }} {{ c.name }}</span>
              <span class="cup-chip__meta num">
                第 {{ c.season % 1000 + 1 }} 届 · {{ c.entrants }} 人 ·
                {{ c.roundNames?.[Math.min(c.round, c.roundNames.length - 1)] ?? '' }}
              </span>
              <span class="cup-chip__st">
                {{ c.live ? `🔴 直播 ${c.liveCount} 场` : c.round >= c.roundNames.length ? '✅ 已结束' : `⏳ ${c.wait}` }}
              </span>
            </button>
          </div>
        </Panel>

        <!-- 下面：树状图（就是当前选中的那个杯） -->
        <Panel v-if="cup" class="watch-tree">
          <div class="watch-tree__head">
            <b :style="{ color: cup.tier.color }">
              {{ cup.tier.glyph }} {{ cup.name }}({{ cup.tier.tag }}) · 第 {{ cup.season % 1000 + 1 }} 届
            </b>
            <span class="muted">
              {{ cup.live ? `🔴 ${cupLive.length} 场同时在打 · 点「👁 观看」切台` : `本轮间隙 · 下一轮 ${cupWait ?? ''}` }}
              · 本届还剩 <b class="num">{{ cupLeftText }}</b>
            </span>
          </div>
          <ArenaBracket
            :rounds="cup.rounds"
            :entrants="cup.entrants"
            :current-round="cup.round"
            :round-names="cup.roundNames"
            :match-phase="phaseMap"
            :match-note="matchNote"
            :live-keys="liveKeys"
            :active-key="activeKey"
            @select="openPlayer"
            @watch="watchMatch"
          />
          <div class="watch-tree__foot">
            <Button size="sm" variant="quiet" @click="fastForwardRound">
              ⏭ 这一轮直接出结果
            </Button>
            <span class="muted">只显示直播：没有结果的场次到点按五维自动结算</span>
          </div>
        </Panel>

        <Panel v-if="myRun" class="watch-mine">
          <div class="watch-mine__head">
            <b>🏆 我的赛事 · {{ myRun.cupName }}</b>
            <span class="muted">
              进行到 {{ ARENA_ROUNDS[myRun.round] ?? '已结束' }} · 已赢 {{ myRun.wins }} 场
            </span>
          </div>
          <ArenaBracket
            :rounds="myRun.rounds"
            :entrants="myRun.entrants"
            :current-round="myRun.round"
            @select="openPlayer"
          />
        </Panel>

        <Panel v-if="cup" class="watch-who">
          <div class="watch-who__head">
            <b>👥 谁在打哪个赛事</b>
            <span class="muted">{{ cup.name }}({{ cup.tier.tag }}) 这一届 {{ cup.entrants.length }} 位参赛球员的进程</span>
          </div>
          <div class="who-list">
            <button
              v-for="r in whoRows"
              :key="r.id"
              class="who-row"
              :class="{ 'is-live': r.live }"
              type="button"
              @click="openPlayer(r.id)"
            >
              <span class="who-row__icon">{{ r.icon }}</span>
              <span class="who-row__name">{{ r.name }}</span>
              <span class="who-row__label muted">{{ r.label }}</span>
            </button>
          </div>
        </Panel>
      </div>
    </AppModal>

    <AppModal v-model="detailOpen" :title="detail?.name ?? '球员主页'">
      <PlayerProfile
        v-if="detail"
        :name="detail.name"
        :style="detail.style"
        :rating="detail.rating"
        :wins="detail.wins"
        :losses="detail.losses"
        :stats="ensureStats(detail)"
        :cosmetic="detail.cosmetic"
        :roster="progress.aiNames"
      />
    </AppModal>
  </div>
</template>

<style scoped>
/* ---------- 赛事总览（弹窗里） ---------- */
.watch-stage {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.watch-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  flex-wrap: wrap;
}

.hero__title {
  font-size: 18px;
  font-weight: 700;
}

.hero__sub {
  font-size: 12px;
  margin-top: 4px;
}

.hero__side {
  text-align: right;
  font-size: 13px;
}

.hero__live {
  font-weight: 600;
}

.hero__buttons {
  display: flex;
  gap: var(--s2);
  justify-content: flex-end;
  margin-top: 8px;
}

.watch-mine__head,
.watch-tree__head,
.watch-who__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s2);
  margin-bottom: var(--s2);
  font-size: 13px;
}

.watch-mine__head {
  font-size: 14px;
}

.who-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 260px;
  overflow-y: auto;
}

.who-row {
  display: flex;
  align-items: center;
  gap: var(--s2);
  width: 100%;
  padding: 4px 8px;
  border: none;
  border-radius: var(--r-sm, 8px);
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}

.who-row:hover {
  background: var(--surface-2);
}

.who-row.is-live {
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}

.who-row__name {
  flex: none;
  min-width: 84px;
  font-weight: 600;
}

.who-row__label {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---------- 选杯 ---------- */
.cup-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: var(--s2);
  width: 100%;
}

.cup-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 10px;
  border: none;
  border-radius: var(--r-md, 12px);
  background: var(--surface-2);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.cup-chip:hover {
  transform: translateY(-1px);
}

.cup-chip.is-on {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 70%, transparent);
}

.cup-chip.is-live {
  background: color-mix(in srgb, var(--accent) 14%, var(--surface-2));
}

.cup-chip__name {
  font-size: 13px;
  font-weight: 700;
}

.cup-chip__meta {
  font-size: 11px;
  color: var(--text-dim, #9fb0c6);
}

.cup-chip__st {
  font-size: 11px;
  font-weight: 600;
}

.cup-chip.is-live .cup-chip__st {
  color: #ff6a72;
}

.cup-auto {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.watch-tree__foot {
  display: flex;
  align-items: center;
  gap: var(--s2);
  margin-top: var(--s2);
  font-size: 11px;
}

/* ---------- 电影院 ---------- */
.room {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #05080f;
}

.room__plane {
  position: absolute;
  left: 0;
  top: 0;
  will-change: transform;
}

/* 后墙（屏幕挂的这面） */
.room__wall {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  background: linear-gradient(180deg, #0b1120 0%, #121c33 72%, #1a2745 100%);
  box-shadow: inset 0 -10px 30px rgba(0, 0, 0, 0.55);
}

/* 地板：木纹 + 一排排地灯 */
.room__floor {
  position: absolute;
  left: 0;
  width: 100%;
  background:
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.025) 0 2px, transparent 2px 52px),
    linear-gradient(180deg, #221a2e 0%, #171223 55%, #100d1a 100%);
}

/* ---------- 大屏幕 ---------- */
/* 大屏下方的场地签：本轮同时在打的几场，点谁切谁 */
.courts {
  position: absolute;
  z-index: 6;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.courts__chip {
  flex: none;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid rgba(150, 200, 255, 0.28);
  background: rgba(10, 18, 32, 0.72);
  color: var(--text);
  font-size: 12px;
  cursor: pointer;
}

.courts__chip.is-on {
  border-color: #ff6a72;
  color: #ffd7d9;
  background: rgba(80, 20, 26, 0.7);
}

.scr {
  position: absolute;
  z-index: 5;
  border-radius: 12px;
  overflow: hidden;
  background: #05070d;
  box-shadow:
    0 0 0 7px #2a3350,
    0 0 0 13px #1a2138,
    0 24px 60px rgba(0, 0, 0, 0.65),
    0 0 90px rgba(120, 190, 255, 0.2);
}

/* 屏幕上方那条跑马灯：现在在放什么 */
.scr__marquee {
  position: absolute;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  background: rgba(10, 16, 30, 0.9);
  box-shadow: 0 0 0 1px rgba(140, 200, 255, 0.18);
  color: #dfe9f7;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
}

.scr__mq-title em {
  margin-left: 8px;
  font-style: normal;
  font-size: 12px;
  font-weight: 700;
}

.scr__mq-title em.is-live {
  color: #ff6a72;
}

.scr__mq-title em.is-replay {
  color: #ffc04a;
}

.scr__mq-title em.is-channel {
  color: #8fd4ff;
}

/* 投影进来的那场真对局：铺满整块屏（要压过全局那套 .game-canvas 尺寸） */
.scr :deep(.game-canvas) {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  aspect-ratio: auto !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background: #05070d !important;
  pointer-events: none;
}

.scr__fx {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.scr__badge {
  position: absolute;
  left: 12px;
  top: 10px;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(210, 40, 50, 0.85);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.scr__ticker {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
  text-align: center;
  color: #9fd8ff;
  font-size: 15px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

/* 左右两个出入口：地上一块亮着的门洞 */
.room__door {
  position: absolute;
  width: 120px;
  height: 34px;
  transform: translate(-50%, -100%);
  border-radius: 12px 12px 0 0;
  background: linear-gradient(180deg, rgba(150, 210, 255, 0.34) 0%, rgba(150, 210, 255, 0.06) 100%);
  box-shadow: 0 0 26px rgba(140, 200, 255, 0.35);
  pointer-events: none;
}

/* 观众的反应（鼓掌 / 惊呼）：从上往下飘一下就收 */
.cheer {
  position: absolute;
  transform: translate(-50%, -100%);
  font-size: 22px;
  pointer-events: none;
  animation: cheer-pop 1.6s ease-out both;
}

@keyframes cheer-pop {
  0% {
    opacity: 0;
    transform: translate(-50%, -90%) scale(0.6);
  }
  18% {
    opacity: 1;
    transform: translate(-50%, -118%) scale(1.15);
  }
  60% {
    opacity: 1;
    transform: translate(-50%, -140%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -180%) scale(0.95);
  }
}

/* ---------- 座位 ---------- */
.seat__back,
.seat__front {
  position: absolute;
  width: 90px;
  margin-left: -45px;
  border-radius: 12px;
}

.seat__back {
  height: 50px;
  margin-top: -42px;
  background: linear-gradient(180deg, #5a3a5e 0%, #452c4a 100%);
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.08);
}

.seat__front {
  height: 22px;
  margin-top: -16px;
  background: linear-gradient(180deg, #6b4670 0%, #4e3252 100%);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.35);
}

.seat__front.is-free {
  background: linear-gradient(180deg, #6ea0c8 0%, #4a7596 100%);
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.35),
    0 0 14px rgba(140, 210, 255, 0.5);
}

/* ---------- 角色 ---------- */
.avatar {
  position: absolute;
  pointer-events: none;
}

.avatar__rig {
  width: 100%;
  height: 100%;
}

.avatar__name {
  position: absolute;
  left: 50%;
  top: -14px;
  transform: translateX(-50%);
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(6, 10, 20, 0.6);
  color: #dfe9f7;
  font-size: 11px;
  white-space: nowrap;
}

/* ---------- HUD ---------- */
.room__hint {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  padding: 3px 14px;
  border-radius: var(--r-pill, 999px);
  background: rgba(8, 12, 22, 0.6);
  color: #dfe9f7;
  font-size: 12px;
}

.room__acts {
  position: absolute;
  right: 14px;
  bottom: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--s2);
  z-index: 30;
}
</style>
