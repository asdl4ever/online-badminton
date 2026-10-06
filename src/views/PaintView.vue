<script setup lang="ts">
import Phaser from 'phaser';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import Button from '../components/ui/Button.vue';
import AppModal from '../components/ui/AppModal.vue';
import { PaintScene, PAINT_COLORS, type PaintSceneData } from '../game/paint/PaintScene';
import { guessMatches, pickWords } from '../game/paint/words';
import { bindCanvasSize, renderConfig, sceneScaleConfig } from '../game/zoom';
import { applyTheme, DEFAULT_THEME } from '../game/theme';
import { sfx } from '../game/audio';
import { toastWarn } from '../composables/useToast';
import { hostOpen, joinMatch } from '../net/connect';
import { waitForRoomCode } from '../composables/useInviteRoom';
import { type NetLink } from '../net/link';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';

/**
 * 你画我猜（联机小玩法，和钓鱼/挖矿一个套路）：
 * - 轮流当画家：每轮系统给 4 个词，画家挑 1 个画，对方打字猜；
 * - 画笔特效**复用击球拖尾**（`game/draw/trails.ts`）——自己装备的拖尾风格直接长在笔迹上；
 * - 游戏本体在 `game/paint/PaintScene.ts`（画板），这里只管回合状态机与联机收发。
 * 房主是发牌员：开局/换轮都由房主生成词组并广播（`paintRound`）。
 */
const router = useRouter();
const customize = useCustomizeStore();
const lobby = useLobbyStore();

const container = ref<HTMLDivElement | null>(null);
let game: Phaser.Game | null = null;
let link: NetLink | null = null;

const ROUND_SECONDS = 90;

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
const timeLeft = ref(ROUND_SECONDS);
const guessText = ref('');
const pickOpen = computed(
  () => inRoom.value && iPaint.value && stage.value === 'pick' && options.value.length > 0,
);
const brush = ref(PAINT_COLORS[0]);
let timer = 0;

const myRole = computed<'host' | 'guest' | 'none'>(() =>
  link ? link.role : lobby.role === 'guest' ? 'guest' : 'none',
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

function scene(): PaintScene | undefined {
  return game?.scene.getScene('PaintScene') as PaintScene | undefined;
}

function boot(session: NetLink | null) {
  if (!container.value) return;
  game?.destroy(true);
  const data: PaintSceneData = {
    session,
    trailStyle: customize.cosmetic.trailStyle,
    onChunk: (id, s, c, pts, done) => {
      session?.send({ t: 'paintStroke', id, s, c, pts, ...(done ? { done: 1 as const } : {}) });
    },
    onUndo: () => session?.send({ t: 'paintUndo' }),
    onClear: () => session?.send({ t: 'paintClear' }),
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
  if (!session) scene()?.setEditable(true); // 单机自由涂鸦
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
      break;
    case 'paintPick':
      secret.value = m.word;
      startPlay();
      break;
    case 'paintStroke':
      scene()?.applyRemote(m.id, m.s, m.c, m.pts, m.done === 1);
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
      // 对面的猜手猜中了：给对面记一分
      if (m.round === round.value && stage.value === 'play') {
        if (myRole.value === 'host') scores.value.guest += 1;
        else scores.value.host += 1;
        finish(true);
      }
      break;
    case 'paintNext':
      // 房主是发牌员：收到「下一题」就开新一轮
      if (link?.role === 'host' && m.round === round.value) startRound(round.value + 1);
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
  scene()?.remoteClear();
  chat.value = [...chat.value, { who: 'sys', text: `第 ${n} 轮 · ${painterName.value}来画` }];
  link?.send({ t: 'paintRound', round: n, turn: turn.value, options: options.value });
}

/** 画家定了词（本地或对面发来）→ 双方开始计时 */
function startPlay(): void {
  stage.value = 'play';
  timeLeft.value = ROUND_SECONDS;
  scene()?.setEditable(iPaint.value);
  window.clearInterval(timer);
  timer = window.setInterval(() => {
    timeLeft.value -= 1;
    if (timeLeft.value <= 0) {
      window.clearInterval(timer);
      if (stage.value === 'play') finish(false);
    }
  }, 1000);
}

function pickWord(w: string): void {
  if (stage.value !== 'pick' || !iPaint.value) return;
  sfx.click();
  secret.value = w;
  link?.send({ t: 'paintPick', round: round.value, word: w });
  startPlay();
}

function sendGuess(): void {
  const text = guessText.value.trim();
  if (!text || stage.value !== 'play' || iPaint.value) return;
  guessText.value = '';
  chat.value = [...chat.value.slice(-30), { who: 'me', text }];
  link?.send({ t: 'paintGuess', round: round.value, text });
  if (guessMatches(text, secret.value)) {
    if (myRole.value === 'host') scores.value.host += 1;
    else scores.value.guest += 1;
    link?.send({ t: 'paintSolved', round: round.value });
    finish(true);
  }
}

/** 结束：solved=有人猜中（true）或时间到（false）；词都亮出来 */
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
  if (link?.role === 'host') startRound(round.value + 1);
  else link?.send({ t: 'paintNext', round: round.value });
}

function undo() {
  scene()?.remoteUndo();
  link?.send({ t: 'paintUndo' });
}

function clearBoard() {
  scene()?.remoteClear();
  link?.send({ t: 'paintClear' });
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
  link = l;
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
  boot(null);
});

onBeforeUnmount(() => {
  window.clearInterval(timer);
  link?.destroy();
  link = null;
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
        <span class="icon-btn ui-num paint-score" title="比分">
          🎨 第 {{ round || 1 }} 轮 · 我 {{ myScore }} : {{ peerScore }} 对手
        </span>
      </template>

      <template #stage>
        <div ref="container" class="paint-canvas" />

        <!-- 顶部状态条 -->
        <div class="paint-top">
          <template v-if="solo">
            <b>自由涂鸦</b>
            <span class="muted">建房邀请好友就开你画我猜</span>
          </template>
          <template v-else>
            <b>{{ stage === 'done' ? '答案：' + wordShown : iPaint ? '你来画：' + wordShown : '猜猜看！' }}</b>
            <span class="muted">{{ painterName }}在画 · {{ stage === 'play' ? timeLeft + 's' : '等待中' }}</span>
          </template>
        </div>

        <!-- 画家工具条 -->
        <div v-if="(iPaint && stage === 'play') || solo" class="paint-tools">
          <button
            v-for="c in PAINT_COLORS"
            :key="c"
            type="button"
            class="paint-tools__color"
            :class="{ 'is-on': brush === c }"
            :style="{ background: '#' + c.toString(16).padStart(6, '0') }"
            @click="brush !== c && (brush = c, scene()?.setBrush(c))"
          />
          <span class="paint-tools__gap" />
          <Button size="sm" variant="quiet" @click="undo">撤销</Button>
          <Button size="sm" variant="quiet" @click="clearBoard">清空</Button>
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

/* 画家工具条：调色板 + 撤销/清空 */
.paint-tools {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: var(--s4);
  z-index: 32;
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: 8px 12px;
  border-radius: var(--r-pill);
  border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--line));
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
}

.paint-tools__color {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.25);
  cursor: pointer;
  padding: 0;
}

.paint-tools__color.is-on {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent);
}

.paint-tools__gap {
  width: 6px;
}

/* 聊天 / 作答区：左下角 */
.paint-chat {
  position: absolute;
  left: var(--s3);
  bottom: var(--s4);
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

/* 结束后的下一题按钮：画面正中下方 */
.paint-next {
  position: absolute;
  left: 50%;
  bottom: calc(var(--s4) + 60px);
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
</style>
