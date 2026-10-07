<script setup lang="ts">
import Phaser from 'phaser';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import Button from '../components/ui/Button.vue';
import AppModal from '../components/ui/AppModal.vue';
import { PaintScene, PAINT_COLORS, type PaintSceneData } from '../game/paint/PaintScene';
import {
  PAINT_BRUSHES,
  SIZE_DEFAULT,
  SIZE_MAX,
  SIZE_MIN,
  type BrushId,
} from '../game/paint/brushes';
import { guessMatches, pickWords } from '../game/paint/words';
import { bindCanvasSize, renderConfig, sceneScaleConfig } from '../game/zoom';
import { applyTheme, DEFAULT_THEME } from '../game/theme';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';
import { hostOpen, joinMatch } from '../net/connect';
import { waitForRoomCode } from '../composables/useInviteRoom';
import { type NetLink } from '../net/link';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';
import { useProgressStore } from '../stores/progress';

/**
 * 你画我猜（联机小玩法，和钓鱼/挖矿一个套路）：
 * - 轮流当画家：每轮系统给 4 个词，画家挑 1 个画，对方打字猜；
 * - 画笔六种（马克笔 / 铅笔 / 荧光 / 喷雾 / 毛笔 / 橡皮），**特效复用击球拖尾**
 *   （`game/draw/trails.ts`）——自己装备的拖尾风格直接长在笔迹上；
 * - 画板旁边站着你的角色（复用 `draw/rig.ts`，带装备与挥拍动作）；
 * - 金币：猜中「猜手 +120，画家 +80」；超时不扣；单机自由涂鸦不结算。
 * - 游戏本体在 `game/paint/PaintScene.ts`（画板），这里只管回合状态机与联机收发。
 * 房主是发牌员：开局/换轮都由房主生成词组并广播（`paintRound`）。
 */
const router = useRouter();
const customize = useCustomizeStore();
const lobby = useLobbyStore();
const progress = useProgressStore();

/** 猜中一局的钱：猜手拿大头，画家也有份 */
const COIN_GUESSER = 120;
const COIN_PAINTER = 80;

const container = ref<HTMLDivElement | null>(null);
let game: Phaser.Game | null = null;
/**
 * 联机链路。**必须是响应式的**：`myRole` / `iPaint` 都按它算，
 * 用普通变量会算一次缓存成 'none'（房主因此永远不开画笔、不进选词）。
 */
const link = shallowRef<NetLink | null>(null);

/** 一轮 60 秒：画家边画、猜手边猜（同一段时间） */
const ROUND_SECONDS = 60;

const phase = ref('');          // 连接阶段的提示文案
const roomCode = ref('');
const inRoom = ref(false);      // 对手是否已就位
const round = ref(0);
const turn = ref<'host' | 'guest'>('host');
const options = ref<string[]>([]);
const secret = ref('');         // 本轮的词（双方客户端都知道，猜手界面只显示 ?）
const stage = ref<'idle' | 'wait' | 'pick' | 'play' | 'done'>('idle');
const chat = ref<{ who: 'me' | 'peer' | 'sys'; text: string }[]>([]);
const scores = ref({ host: 0, guest: 0 });
/** 本轮剩余秒数 */
const timeLeft = ref(ROUND_SECONDS);
const guessText = ref('');
const pickOpen = computed(
  () => inRoom.value && iPaint.value && stage.value === 'pick' && options.value.length > 0,
);
const color = ref(PAINT_COLORS[0]);
const brush = ref<BrushId>('marker');
/** 粗细滑条的百分比（100 = 标准；橡皮同样是它） */
const sizePct = ref<number>(SIZE_DEFAULT);
const size = computed(() => sizePct.value / 100);
/** 现在是橡皮（独立工具，不在笔列表里） */
const erasing = computed(() => brush.value === 'eraser');
/** 滑条左边那颗小圆点：视觉上直接表示当前粗细 */
const dotSize = computed(() => `${Math.round(3 + (sizePct.value / SIZE_MAX) * 11)}px`);
/** 手机竖屏：画板会被压得比较小，提示横屏 */
const portrait = ref(false);
const portraitMq =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(orientation: portrait)')
    : null;
function syncPortrait(): void {
  portrait.value = !!portraitMq?.matches && window.innerWidth < 820;
}
/** 本局双方赚到的金币（结束/猜中时提示用） */
const earned = ref(0);
let timer = 0;

function pushBrush(): void {
  scene()?.setBrush(brush.value, color.value, size.value);
}

function pickBrush(id: BrushId): void {
  sfx.click();
  brush.value = id;
  pushBrush();
}

function toggleEraser(): void {
  sfx.click();
  brush.value = erasing.value ? 'marker' : 'eraser';
  pushBrush();
}

function pickColor(c: number): void {
  color.value = c;
  if (erasing.value) brush.value = 'marker'; // 选色自然是回到画
  pushBrush();
}

function onSize(e: Event): void {
  sizePct.value = Number((e.target as HTMLInputElement).value);
  pushBrush();
}

const myRole = computed<'host' | 'guest' | 'none'>(() =>
  link.value ? link.value.role : lobby.role === 'guest' ? 'guest' : 'none',
);
const iPaint = computed(() => inRoom.value && myRole.value !== 'none' && turn.value === myRole.value);
const solo = computed(() => !inRoom.value);
const wordShown = computed(() => secret.value || (options.value.length ? '？？' : ''));
const painterName = computed(() =>
  !inRoom.value ? '我' : turn.value === 'host' ? '房主' : '对手',
);
const myScore = computed(() =>
  myRole.value === 'guest' ? scores.value.guest : scores.value.host,
);
const peerScore = computed(() =>
  myRole.value === 'guest' ? scores.value.host : scores.value.guest,
);

/** 顶部状态卡的两行文案：按阶段与角色分 */
const headline = computed(() => {
  switch (stage.value) {
    case 'pick':
      return '挑一个词来画';
    case 'wait':
      return '对手在挑词…';
    case 'play':
      return iPaint.value ? `你来画：${secret.value}` : '猜猜看！';
    case 'done':
      return `答案：${secret.value || wordShown.value}`;
    default:
      return '准备中…';
  }
});

const subline = computed(() => {
  switch (stage.value) {
    case 'play':
      return iPaint.value
        ? `⏱ ${Math.max(0, timeLeft.value)}s · 边画边让他猜`
        : `⏱ ${Math.max(0, timeLeft.value)}s · 打字猜，猜中 +¥${COIN_GUESSER}`;
    case 'done':
      return `我 ${myScore.value} : ${peerScore.value} 对手`;
    default:
      return `${painterName.value}作画 · 稍等`;
  }
});

function scene(): PaintScene | undefined {
  return game?.scene.getScene('PaintScene') as PaintScene | undefined;
}

function boot(session: NetLink | null) {
  if (!container.value) return;
  game?.destroy(true);
  const data: PaintSceneData = {
    session,
    cosmetic: customize.cosmetic,
    editable: !session,
    brush: brush.value,
    color: color.value,
    size: size.value,
    onChunk: (id, b, s, c, w, pts, done) => {
      session?.send({
        t: 'paintStroke',
        id,
        b,
        s,
        c,
        w,
        pts,
        ...(done ? { done: 1 as const } : {}),
      });
    },
    // 橡皮：先告诉对面擦掉了哪些笔画，再把擦剩的段作为新笔画发过去
    onErase: (ids, parts) => {
      session?.send({ t: 'paintErase', ids });
      for (const p of parts) {
        session?.send({
          t: 'paintStroke',
          id: p.id,
          b: p.b,
          s: p.s,
          c: p.c,
          w: p.w,
          pts: p.pts,
          done: 1,
        });
      }
    },
    onUndo: () => session?.send({ t: 'paintUndo' }),
  };
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container.value,
    width: 900,
    height: 560,
    backgroundColor: '#f7f3e8',
    banner: false,
    audio: { noAudio: true },
    scale: sceneScaleConfig(),
    ...renderConfig(),
    scene: [],
    callbacks: { postBoot: (g) => g.scene.add('PaintScene', PaintScene, true, data) },
  });
  bindCanvasSize(game, container.value);
}

// ---- 联机 ------------------------------------------------------------------

function handle(m: Parameters<NonNullable<NetLink['onMessage']>>[0]): void {
  switch (m.t) {
    case 'paintRound':
      round.value = m.round;
      turn.value = m.turn;
      options.value = m.options;
      secret.value = '';
      stage.value = myRole.value === m.turn ? 'pick' : 'wait';
      scene()?.setEditable(false);
      // 新一轮：先把上一轮的画清掉（不然画布上还留着上一个人画的东西）
      scene()?.remoteClear();
      break;
    case 'paintPick':
      secret.value = m.word;
      startPlay();
      break;
    case 'paintStroke':
      scene()?.applyRemote(m.id, m.b, m.s, m.c, m.w, m.pts, m.done === 1);
      break;
    case 'paintErase':
      scene()?.remoteErase(m.ids);
      break;
    case 'paintUndo':
      scene()?.remoteUndo();
      break;
    case 'paintClear':
      scene()?.remoteClear();
      break;
    case 'paintGuess':
      chat.value = [...chat.value.slice(-30), { who: 'peer', text: m.text }];
      break;
    case 'paintSolved':
      // 对面的猜手猜中了：给对面记一分，我这边是画家 → 拿画家的金币
      if (m.round === round.value && stage.value === 'play') {
        if (myRole.value === 'host') scores.value.guest += 1;
        else scores.value.host += 1;
        reward(COIN_PAINTER, '我是画家');
        finish(true);
      }
      break;
    case 'paintNext':
      // 房主是发牌员：收到「下一题」就开新一轮
      if (link.value?.role === 'host' && m.round === round.value) startRound(round.value + 1);
      break;
    default:
      break;
  }
}

/** 房主开一轮：换人当画家 + 发 4 个候选词 */
function startRound(n: number): void {
  round.value = n;
  turn.value = n % 2 === 1 ? 'host' : 'guest';
  options.value = pickWords(4);
  secret.value = '';
  stage.value = myRole.value === turn.value ? 'pick' : 'wait';
  scene()?.setEditable(false);
  // 新一轮清空上一轮的画（本地先清，再通知对面一起清）
  scene()?.remoteClear();
  link.value?.send({ t: 'paintClear' });
  chat.value = [...chat.value, { who: 'sys', text: `第 ${n} 轮 · ${painterName.value}来画` }];
  link.value?.send({ t: 'paintRound', round: n, turn: turn.value, options: options.value });
}

/** 画家定了词 → 本轮开始：60 秒内边画边猜（同一段时间，双方都可能动） */
function startPlay(): void {
  stage.value = 'play';
  timeLeft.value = ROUND_SECONDS;
  scene()?.setEditable(iPaint.value);
  chat.value = [
    ...chat.value.slice(-30),
    { who: 'sys', text: `⏱ ${ROUND_SECONDS} 秒 · 边画边猜，猜中 +¥${COIN_GUESSER}` },
  ];
  window.clearInterval(timer);
  timer = window.setInterval(() => {
    timeLeft.value -= 1;
    if (timeLeft.value <= 0) finish(false);
  }, 1000);
}

function pickWord(w: string): void {
  if (stage.value !== 'pick' || !iPaint.value) return;
  sfx.click();
  secret.value = w;
  link.value?.send({ t: 'paintPick', round: round.value, word: w });
  startPlay();
}

function sendGuess(): void {
  const text = guessText.value.trim();
  // 边画边猜：只要本轮在跑就能猜（画家自己在画，不猜）
  if (!text || stage.value !== 'play' || iPaint.value) return;
  guessText.value = '';
  chat.value = [...chat.value.slice(-30), { who: 'me', text }];
  link.value?.send({ t: 'paintGuess', round: round.value, text });
  if (guessMatches(text, secret.value)) {
    if (myRole.value === 'host') scores.value.host += 1;
    else scores.value.guest += 1;
    link.value?.send({ t: 'paintSolved', round: round.value });
    // 我是猜手 → 拿猜手的金币；对面画家在收到 paintSolved 时自己拿画家那份
    reward(COIN_GUESSER, '猜中');
    finish(true);
  }
}

/** 联机对局的奖励入账（单机自由涂鸦不结算） */
function reward(coin: number, why: string): void {
  if (solo.value) return;
  progress.gainCoins(coin);
  earned.value += coin;
  toastGood(`🎨 ${why} · 金币 +¥${coin}`);
}

/** 结束：solved=有人猜中（true）或 60 秒到（false）；词都亮出来 */
function finish(solved: boolean): void {
  stage.value = 'done';
  window.clearInterval(timer);
  scene()?.setEditable(false);
  if (solved) {
    sfx.win();
    chat.value = [...chat.value, { who: 'sys', text: `猜中了！答案：${secret.value}` }];
  } else {
    chat.value = [...chat.value, { who: 'sys', text: `时间到！答案是：${secret.value}` }];
  }
}

/** 下一题：房主直接开，访客向房主要 */
function nextRound(): void {
  sfx.click();
  options.value = [];
  if (link.value?.role === 'host') startRound(round.value + 1);
  else link.value?.send({ t: 'paintNext', round: round.value });
}

function undo() {
  scene()?.remoteUndo();
  link.value?.send({ t: 'paintUndo' });
}

// ---- 建房 / 加入（照抄钓鱼/矿洞的一间房流程） --------------------------------

async function ensureInviteRoom(): Promise<string> {
  if (roomCode.value) return roomCode.value;
  host();
  return waitForRoomCode(() => roomCode.value);
}

function host() {
  sfx.click();
  phase.value = '正在建房…';
  hostOpen(
    {
      onPhase: (p) => (phase.value = p),
      onDisconnected: () => (phase.value = '对手已离开'),
    },
    lobby.room,
  )
    .then(async (room) => {
      roomCode.value = room.code;
      lobby.setRoom(room.code, 'host');
      phase.value = `房间 ${room.code}，等好友…`;
      const l = await room.connected;
      adopt(l);
    })
    .catch((e: Error) => {
      toastWarn(e.message);
      phase.value = '';
    });
}

function join(code: string) {
  sfx.click();
  phase.value = '正在加入…';
  joinMatch(code, {
    onPhase: (p) => (phase.value = p),
    onDisconnected: () => (phase.value = '对手已离开'),
  })
    .then((m) => {
      roomCode.value = m.code;
      lobby.setRoom(m.code, 'guest');
      adopt(m.link);
    })
    .catch((e: Error) => {
      toastWarn(e.message);
      phase.value = '';
    });
}

function adopt(l: NetLink): void {
  link.value = l;
  l.onMessage = handle;
  inRoom.value = true;
  phase.value = '';
  boot(l);
  if (l.role === 'host') startRound(1);
}

function back() {
  sfx.click();
  void router.push('/');
}

onMounted(() => {
  applyTheme(DEFAULT_THEME);
  syncPortrait();
  portraitMq?.addEventListener('change', syncPortrait);
  window.addEventListener('resize', syncPortrait);
  boot(null);
});

onBeforeUnmount(() => {
  portraitMq?.removeEventListener('change', syncPortrait);
  window.removeEventListener('resize', syncPortrait);
  window.clearInterval(timer);
  link.value?.destroy();
  link.value = null;
  game?.destroy(true);
  game = null;
});

// 好友接受邀请 → 自动入房（房号由大厅转交）
watch(
  () => lobby.pendingJoin,
  () => {
    if (inRoom.value) return;
    const code = lobby.consumeInvite('paint');
    if (code) join(code);
  },
  { immediate: true },
);
</script>

<template>
  <div class="page page--playing">
    <PageShell
      title="画室 · 你画我猜"
      back
      friends-kind="paint"
      :friends-code="roomCode"
      :friends-ensure-room="ensureInviteRoom"
      @back="back"
    >
      <template #icons>
        <span class="icon-btn ui-num paint-score" title="比分与本局金币">
          🎨 第 {{ round || 1 }} 轮 · 我 {{ myScore }} : {{ peerScore }} 对手
          <template v-if="earned > 0"> · +¥{{ earned }}</template>
        </span>
      </template>

      <template #stage>
        <div ref="container" class="paint-canvas" />

        <!-- 顶部状态条 -->
        <div class="paint-top">
          <template v-if="solo">
            <b>自由涂鸦</b>
            <span class="muted">
              {{ portrait ? '📱 竖屏画板小，横过来画更舒服' : '建房邀请好友就开你画我猜' }}
            </span>
          </template>
          <template v-else>
            <b>{{ headline }}</b>
            <span class="muted">{{ subline }}</span>
          </template>
        </div>

        <!-- 画家工具条：第一行 = 画笔 + 橡皮，第二行 = 粗细滑条 + 颜色 + 撤销
             （分两行是为了手机上每一件都够得到，不会被挤出屏幕） -->
        <div v-if="(iPaint && stage === 'play') || solo" class="paint-tools">
          <div class="paint-tools__group">
            <button
              v-for="b in PAINT_BRUSHES"
              :key="b.id"
              type="button"
              class="paint-tools__brush"
              :class="{ 'is-on': brush === b.id }"
              :title="b.label"
              @click="pickBrush(b.id)"
            >
              {{ b.icon }}
            </button>
            <button
              type="button"
              class="paint-tools__brush paint-tools__eraser"
              :class="{ 'is-on': erasing }"
              title="橡皮擦（点一下切换）"
              @click="toggleEraser"
            >
              🧽
            </button>
          </div>

          <div class="paint-tools__group">
            <!-- 粗细滑条：画笔与橡皮共用（橡皮擦到哪由光标圈显示） -->
            <label class="paint-tools__size" :title="`粗细 ${sizePct}%`">
              <span class="paint-tools__size-dot" :style="{ width: dotSize, height: dotSize }" />
              <input
                type="range"
                :min="SIZE_MIN"
                :max="SIZE_MAX"
                :value="sizePct"
                @input="onSize"
              />
            </label>

            <button
              v-for="c in PAINT_COLORS"
              :key="c"
              type="button"
              class="paint-tools__color"
              :class="{ 'is-on': !erasing && color === c }"
              :style="{ background: '#' + c.toString(16).padStart(6, '0') }"
              @click="pickColor(c)"
            />

            <Button size="sm" variant="quiet" @click="undo">撤销</Button>
          </div>
        </div>

        <!-- 猜手输入 + 聊天区 -->
        <div v-if="!solo" class="paint-chat">
          <ul v-if="chat.length" class="paint-chat__list">
            <li v-for="(c, i) in chat.slice(-6)" :key="i" :class="`is-${c.who}`">
              {{ c.who === 'sys' ? c.text : (c.who === 'me' ? '我：' : '对手：') + c.text }}
            </li>
          </ul>
          <div v-if="!iPaint && stage === 'play'" class="paint-chat__row">
            <input
              v-model="guessText"
              class="paint-chat__input"
              placeholder="输入你的答案…"
              maxlength="20"
              @keydown.enter="sendGuess"
            />
            <Button size="sm" variant="primary" @click="sendGuess">猜</Button>
          </div>
        </div>

        <!-- 结束：下一题按钮 -->
        <div v-if="inRoom && stage === 'done'" class="paint-next">
          <Button variant="primary" size="lg" @click="nextRound">下一题 →</Button>
        </div>

        <!-- 建房 / 加入面板 -->
        <div v-if="!inRoom" class="paint-lobby">
          <p class="muted paint-lobby__tip">轮流当画家和猜手，猜对得分。画笔特效用的是你的击球拖尾！</p>
          <Button variant="primary" block @click="host">建房开局</Button>
          <div class="paint-lobby__join">
            <input v-model="roomCode" class="paint-chat__input" placeholder="输入房号" maxlength="8" />
            <Button size="sm" variant="primary" :disabled="roomCode.length < 4" @click="join(roomCode)">
              加入
            </Button>
          </div>
        </div>

        <!-- 连接中提示 -->
        <div v-if="phase" class="paint-phase">{{ phase }}</div>
      </template>
    </PageShell>

    <!-- 画家 4 选 1 -->
    <AppModal :model-value="pickOpen" title="挑一个词来画" max-width="360px">
      <div class="paint-pick">
        <Button
          v-for="w in options"
          :key="w"
          size="lg"
          variant="primary"
          block
          @click="pickWord(w)"
        >
          {{ w }}
        </Button>
        <p class="muted paint-pick__note">选好词双方就开始计时（{{ 90 }} 秒）</p>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.paint-canvas {
  position: absolute;
  inset: 0;
}

/* 关键：手机上手指拖动画笔时别让浏览器接管手势去滚页面（否则 pointercancel，画不了） */
.paint-canvas :deep(canvas) {
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}

.paint-score {
  font-weight: 700;
  color: var(--accent-2);
  font-size: var(--ui-font-sm);
}

/* 顶部状态条 */
.paint-top {
  position: absolute;
  top: calc(var(--ui-top-h) + var(--s3));
  left: 50%;
  transform: translateX(-50%);
  z-index: 32;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 16px;
  border-radius: var(--r-md);
  border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--line));
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  font-size: var(--ui-font-sm);
  text-align: center;
  pointer-events: none;
}

/* 画家工具条：两组（笔+橡皮 / 滑条+颜色+撤销），窄屏自动折成两行 */
.paint-tools {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: max(var(--s3), env(safe-area-inset-bottom));
  z-index: 32;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: calc(100% - 2 * var(--s3));
  padding: 7px 10px;
  border-radius: var(--r-pill);
  border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--line));
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
}

/* 工具条里的一组控件（一行） */
.paint-tools__group {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 画笔图标按钮（含橡皮） */
.paint-tools__brush {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: var(--r-sm, 8px);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--line));
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}

.paint-tools__brush.is-on {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 22%, var(--surface));
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent);
}

.paint-tools__color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.25);
  cursor: pointer;
  padding: 0;
}

.paint-tools__color.is-on {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent);
}

/* 粗细滑条：左边一颗「当前粗细」小圆点 + 滑条本体 */
.paint-tools__size {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 4px;
  cursor: pointer;
}

.paint-tools__size-dot {
  flex: none;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 1.5px color-mix(in srgb, currentColor 45%, transparent);
}

.paint-tools__size input[type='range'] {
  width: 80px;
  accent-color: var(--accent);
  cursor: pointer;
}

/* 橡皮按钮：和画笔同一排，选中时高亮 */
.paint-tools__eraser {
  font-size: 15px;
}

.paint-tools__gap {
  width: 6px;
}

/* 聊天 / 作答区：左下角（让开底部的画笔工具条） */
.paint-chat {
  position: absolute;
  left: max(var(--s3), env(safe-area-inset-left));
  bottom: calc(max(var(--s3), env(safe-area-inset-bottom)) + 58px);
  z-index: 32;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: min(240px, 60vw);
}

.paint-chat__list {
  list-style: none;
  margin: 0;
  padding: 6px 10px;
  border-radius: var(--r-sm, 8px);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--line));
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 130px;
  overflow-y: auto;
}

.paint-chat__list .is-sys {
  color: var(--accent-2);
  font-weight: 700;
}

.paint-chat__list .is-peer {
  color: var(--text-dim);
}

.paint-chat__row {
  display: flex;
  gap: 6px;
}

.paint-chat__input {
  flex: 1;
  min-width: 0;
  padding: 7px 10px;
  border-radius: var(--r-sm, 8px);
  border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--line));
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  color: var(--text);
  font-size: 13px;
  outline: none;
}

.paint-chat__input:focus {
  border-color: var(--accent);
}

/* 建房面板（未联机时） */
.paint-lobby {
  position: absolute;
  right: var(--s3);
  top: calc(var(--ui-top-h) + var(--s3) + 64px);
  z-index: 32;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  width: 230px;
  padding: var(--s3);
  border-radius: var(--r-md);
  border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--line));
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
}

.paint-lobby__tip {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
}

.paint-lobby__join {
  display: flex;
  gap: 6px;
}

.paint-phase {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 34;
  padding: 12px 22px;
  border-radius: var(--r-pill);
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
  background: color-mix(in srgb, var(--accent) 24%, var(--glass-bg));
  font-weight: 700;
  color: var(--text);
}

/* 结束后的下一题按钮：画面正中下方（同样让开工具条） */
.paint-next {
  position: absolute;
  left: 50%;
  bottom: calc(max(var(--s3), env(safe-area-inset-bottom)) + 66px);
  transform: translateX(-50%);
  z-index: 34;
}

/* 4 选 1 弹窗 */
.paint-pick {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.paint-pick__note {
  margin: 0;
  text-align: center;
  font-size: 11px;
}

/* ---- 手机 / 窄屏 ---------------------------------------------------------- */
@media (max-width: 640px) {
  .paint-score {
    font-size: 11px;
  }

  /* 状态卡：给右上角那排图标让开，自己也别铺太宽 */
  .paint-top {
    top: calc(var(--ui-top-h) + var(--s2));
    max-width: min(70%, 260px);
    padding: 6px 10px;
    font-size: 11px;
    line-height: 1.35;
  }

  /* 六支笔 + 六色 + 两个按钮在手机上折成两行 */
  .paint-tools {
    gap: 4px;
    padding: 6px 8px;
    border-radius: var(--r-md);
  }

  .paint-tools__brush {
    width: 26px;
    height: 26px;
    font-size: 14px;
  }

  .paint-tools__color {
    width: 22px;
    height: 22px;
  }

  .paint-tools__gap {
    width: 2px;
  }

  .paint-tools__size {
    gap: 4px;
    padding: 0 2px;
  }

  .paint-tools__size input[type='range'] {
    width: 64px;
  }

  /* 工具条在窄屏是两行（≈90px），聊天区与「下一题」都要抬到它上面 */
  .paint-chat {
    width: min(190px, 46vw);
    bottom: calc(max(var(--s3), env(safe-area-inset-bottom)) + 96px);
  }

  .paint-next {
    bottom: calc(max(var(--s3), env(safe-area-inset-bottom)) + 104px);
  }

  /* 手机上关掉实时毛玻璃：叠在 WebGL 画布上的 backdrop-filter 每帧都要重算，
     是「手机特别卡」的主要来源之一——换成普通半透明底，观感几乎一样。 */
  .paint-top,
  .paint-tools,
  .paint-chat__list,
  .paint-lobby {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: color-mix(in srgb, var(--surface) 96%, transparent);
  }

  .paint-chat__list {
    max-height: 84px;
    font-size: 11px;
  }

  /* 建房面板：窄屏改成整宽的卡片，落在状态卡下面，别吊在右上角 */
  .paint-lobby {
    left: var(--s3);
    right: var(--s3);
    top: calc(var(--ui-top-h) + 64px);
    width: auto;
  }

  .paint-phase {
    max-width: 88%;
    padding: 10px 16px;
    font-size: 13px;
    text-align: center;
  }
}

/* 触屏：按钮给够手指点得中的尺寸 */
@media (pointer: coarse) {
  .paint-tools__brush {
    width: 30px;
    height: 30px;
  }

  .paint-tools__color {
    width: 26px;
    height: 26px;
  }
}
</style>
