<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClipboard, useIntervalFn } from '@vueuse/core';
import { VProgressCircular, VTextField } from 'vuetify/components';
import GameCanvas from '../components/GameCanvas.vue';
import PartyOverlay from '../components/PartyOverlay.vue';
import TopBar from '../components/ui/TopBar.vue';
import PageShell from '../components/ui/PageShell.vue';
import AppModal from '../components/ui/AppModal.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import EmotePicker from '../components/ui/EmotePicker.vue';
import FriendsPanel from '../components/FriendsPanel.vue';

import type { HudState } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import { formatGains, type MatchTally } from '../game/match-xp';
import { toastGood } from '../composables/useToast';
import type { NetMetrics } from '../game/telemetry';
import { hostOpen, joinMatch } from '../net/connect';
import { normaliseCode, type NetLink } from '../net/link';
import { emptyPartyState, type PartyState } from '../game/config';
import { useGameStore } from '../stores/game';
import { useLobbyStore } from '../stores/lobby';
import { useCustomizeStore } from '../stores/customize';
import { useProgressStore } from '../stores/progress';
import { waitForRoomCode } from '../composables/useInviteRoom';
import { sfx } from '../game/audio';

const router = useRouter();
const route = useRoute();
const store = useGameStore();
const lobby = useLobbyStore();
const customize = useCustomizeStore();
const progress = useProgressStore();

const joinCode = ref('');
const hud = ref<HudState | null>(null);
/** 本场统计（扣杀 / 接杀 / 跑动 / 失误…）：打完换五维经验，见 `game/match-xp.ts` */
const tally = ref<MatchTally | null>(null);
const notice = ref('');
const leaving = ref(false);
const phaseText = ref('');
const canvas = ref<InstanceType<typeof GameCanvas> | null>(null);
const emoteOpen = ref(false);
const friendsOpen = ref(false);

/** fun mode: entered from the home page, driven by the host */
const partyMode = ref(route.query.party === '1');
const partyState = ref<PartyState>(emptyPartyState());

function pickEmote(id: string) {
  sfx.click();
  canvas.value?.sendEmote(id);
  emoteOpen.value = false;
}

const { copy, copied, isSupported: clipboardSupported } = useClipboard();

/** seconds spent waiting for an opponent, so the screen proves it is alive */
const waited = ref(0);
const waitClock = useIntervalFn(() => (waited.value += 1), 1000, { immediate: false });

const playing = computed(() => store.connState === 'connected');
const busy = computed(() => store.connState === 'creating' || store.connState === 'connecting');
const waiting = computed(() => store.connState === 'waiting');

watch(waiting, (on) => {
  if (on) {
    waited.value = 0;
    waitClock.resume();
  } else {
    waitClock.pause();
  }
});

/**
 * 从球馆「邀请好友参赛」进来的（`/online?court=N&invite=1`）：
 * 等房间建好（`waiting`）就把「邀请好友」面板弹出来，直接点「邀请」好友就进这个场地。
 */
const inviteOnEnter = route.query.invite === '1';
let inviteOpened = false;
watch(
  waiting,
  (on) => {
    if (!inviteOnEnter || inviteOpened || !on) return;
    inviteOpened = true;
    friendsOpen.value = true;
  },
  { immediate: true },
);

const hooks = {
  onStatus: (s: Parameters<NonNullable<NetLink['onStatus']>>[0]) => {
    store.netStatus = s;
  },
  onPhase: (p: string) => {
    phaseText.value = p;
  },
  onDisconnected: (reason: string) => handlePeerLeft(reason),
  onError: (m: string) => {
    if (!leaving.value) store.netError = m;
  },
};

function adopt(link: NetLink) {
  store.transport = link.kind;
  store.session = link;
  store.connState = 'connected';
  phaseText.value = '';
}

/**
 * 好友面板点「邀请」时若无房间：自动建房并等房号。
 * 已经在等对手 / 正在对局时直接用现有房间号。
 */
async function ensureInviteRoom(): Promise<string> {
  if (store.roomCode) return store.roomCode;
  if (store.connState === 'idle' || store.connState === 'error') await createRoom();
  return waitForRoomCode(() => store.roomCode);
}

async function createRoom(wantCode = '') {
  sfx.unlock();
  sfx.click();
  store.reset();
  notice.value = '';
  phaseText.value = '正在建立房间…';
  store.role = 'host';
  store.connState = 'creating';
  try {
    const room = await hostOpen(hooks, wantCode || lobby.room);
    store.roomCode = room.code;
    lobby.setRoom(room.code, 'host');
    store.connState = 'waiting';
    const link = await room.connected;
    if (leaving.value) return;
    notice.value = '';
    adopt(link);
  } catch (err) {
    if (leaving.value) return;
    store.connState = 'error';
    store.netError = (err as Error).message;
    phaseText.value = '';
  }
}

async function joinRoom(codeIn?: string) {
  sfx.unlock();
  sfx.click();
  const code = normaliseCode(codeIn ?? joinCode.value);
  if (!code) {
    store.connState = 'error';
    store.netError = '请输入房间号';
    return;
  }
  store.reset();
  notice.value = '';
  phaseText.value = '正在连接…';
  store.role = 'guest';
  store.connState = 'connecting';
  try {
    const { link, code: actual } = await joinMatch(code, hooks);
    store.roomCode = actual;
    lobby.setRoom(actual, 'guest');
    adopt(link);
  } catch (err) {
    if (leaving.value) return;
    store.connState = 'error';
    store.netError = (err as Error).message;
    phaseText.value = '';
  }
}

// a friend invite (accepted in the global toast) hands over a room code to
// auto-join; take the ones that belong to a *match* once this view is on screen
watch(
  () => lobby.pendingJoin,
  () => {
    if (playing.value) return;
    const code = lobby.consumeInvite('match');
    if (!code) return;
    joinCode.value = code;
    void joinRoom();
  },
  { immediate: true },
);

/*
 * 球场进来的：`/online?court=2`。
 * 场地号就是房间号（COURT2）——有好友已经在这个场地等着就连他，否则自己开这个场。
 */
const courtNo = computed(() => {
  const n = Number(route.query.court ?? 0);
  return Number.isInteger(n) && n >= 1 && n <= 6 ? n : 0;
});

async function enterCourt(n: number): Promise<void> {
  const code = `COURT${n}`;
  // 已经在这个场地里了（连着 / 正等着）就别重来
  if (store.roomCode === code && (playing.value || waiting.value || busy.value)) return;
  const camper = Object.values(lobby.states).find(
    (s) => s.room === code && s.allowJoin !== false,
  );
  if (camper) await joinRoom(code);
  else await createRoom(code);
}

onMounted(() => {
  if (!courtNo.value) return;
  // 邀请 / 一键加入已经接手了（正在连/已在等），就不再按场地号重开一个房
  if (store.connState !== 'idle' && store.connState !== 'error') return;
  void enterCourt(courtNo.value);
});

function handlePeerLeft(reason = '对手已离开对局') {
  if (leaving.value) return;
  notice.value = reason;
  store.connState = 'error';
}

async function copyCode() {
  sfx.click();
  await copy(store.roomCode);
}

function onHud(state: HudState) {
  hud.value = state;
  if (state.match) tally.value = state.match;
}

function onMetrics(m: NetMetrics) {
  store.metrics = m;
}

function onEvent(e: SimEvent) {
  if (e.type === 'hit') sfx.hit(e.kind ?? 'drive');
  else if (e.type === 'belly') sfx.hit('lift');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') sfx.point();
  else if (e.type === 'gameover') {
    const local = store.role === 'guest' ? 1 : 0;
    const win = e.scorer === local;
    progress.recordResult(win, 'online');
    if (win) sfx.win();
    else sfx.lose();
    // 「打比赛也在变强」：联机的对手是真人，没有 rating，强度系数按 1.0
    if (tally.value) {
      const { gains } = progress.gainMatchXp({
        tally: tally.value,
        localIndex: local,
        win,
        foeKey: store.roomCode || 'online',
      });
      if (gains.length) toastGood(`🏸 本场训练：${formatGains(gains)}`);
    }
    tally.value = null;
  }
}

function onDisconnect(message: string) {
  if (leaving.value) return;
  notice.value = message;
  store.connState = 'error';
}

function back() {
  sfx.click();
  leaving.value = true;
  store.reset();
  void router.push('/');
}

onBeforeUnmount(() => {
  leaving.value = true;
  if (store.connState !== 'idle') store.reset();
});
</script>

<template>
  <div class="page" :class="{ 'page--playing': playing }">
    <!-- 对局：统一外壳（顶栏 + 铺满画面 + 右上图标行 + 右侧坞 + 底部比分行） -->
    <PageShell
      v-if="playing"
      title="联机对战"
      back
      :icons="false"
      friends-kind="match"
      :friends-code="store.roomCode"
      :friends-can-invite="!!store.roomCode"
      :friends-ensure-room="ensureInviteRoom"
      @back="back"
    >
      <template #icons>
        <button class="icon-btn jelly" type="button" title="发一个表情" @click="emoteOpen = !emoteOpen">
          表情
        </button>
        <!-- 挂在图标行上：模式设置面板收起来时也要能看到/点到 -->
        <EmotePicker v-if="emoteOpen" @pick="pickEmote" @close="emoteOpen = false" />
        <button class="icon-btn jelly" type="button" title="邀请好友" @click="friendsOpen = true">
          邀请好友
        </button>
      </template>


      <template #stage>
        <GameCanvas
          ref="canvas"
          :role="store.role"
          :session="store.session"
          :cosmetic="customize.cosmetic"
          :attrs="progress.attrs"
          :local-name="lobby.playerName"
          :local-rank="progress.tier.id"
          :local-code="lobby.playerId"
          :party="partyMode"
          @hud="onHud"
          @sim="onEvent"
          @metrics="onMetrics"
          @disconnect="onDisconnect"
          @party="partyState = $event"
        />
        <PartyOverlay
          :state="partyState"
          :local-name="lobby.playerName"
          remote-name="对手"
          @vote="canvas?.voteParty($event)"
          @next="canvas?.nextPartyRound()"
        />
      </template>

    </PageShell>

    <!-- 大厅：非对局时是居中卡片（不进外壳，页面可滚动） -->
    <div v-else class="shell">
      <TopBar @back="back">
        <template #title>{{ courtNo ? `球场 · 场地 ${courtNo}` : '联机对战' }}</template>
      </TopBar>

      <div v-if="partyMode" class="muted party-hint">
        乐趣模式已开启：一局 3 轮，每轮开始前投票选玩法
      </div>

      <!-- 注意：这里不要用裸 `<template>` 当包裹层——它会被编译成原生 <template> 元素，
           浏览器不会渲染它的内容，整个大厅卡片就会「存在但看不见」。直接平铺兄弟节点。 -->
      <Panel v-if="waiting" style="text-align: center">
        <p class="muted">
          {{
            courtNo
              ? `场地 ${courtNo} · 等好友接受邀请（右上「邀请好友」）`
              : '把下面这串房间号发给你的对手'
          }}
        </p>

        <div v-if="!courtNo" class="code">
          <span class="code__value num">{{ store.roomCode }}</span>
          <Button variant="primary" :disabled="!clipboardSupported" @click="copyCode">
            {{ copied ? '已复制' : '复制' }}
          </Button>
        </div>

        <div class="waiting">
          <VProgressCircular indeterminate size="18" width="2" color="primary" />
          <span class="muted">{{ phaseText }}</span>
          <span class="muted num">{{ waited }}s</span>
        </div>

        <p class="muted" style="margin-top: var(--s3); font-size: 13px">
          已开放通道：{{ store.session?.kind ?? '—' }} · 对手直连不上时会自动走中继
        </p>
      </Panel>

      <Panel
        v-else-if="store.connState === 'creating' || store.connState === 'connecting'"
        style="text-align: center"
      >
        <VProgressCircular indeterminate size="24" width="2" color="primary" />
        <p class="muted" style="margin-top: var(--s4)">{{ phaseText || '正在连接…' }}</p>
        <p v-if="store.netStatus?.note" class="muted" style="margin-top: var(--s2); color: var(--warn)">
          {{ store.netStatus.note }}
        </p>
      </Panel>

      <Panel v-else>
        <div class="lobby">
          <div class="lobby__col">
            <h3>创建房间</h3>
            <p class="muted">生成一个房间号，等对手加入。</p>
            <Button variant="primary" :disabled="busy" @click="createRoom()">创建房间</Button>
          </div>

          <div class="lobby__rule" />

          <div class="lobby__col">
            <h3>加入房间</h3>
            <p class="muted">输入对手给你的房间号。</p>
            <div class="join-row">
              <VTextField
                v-model="joinCode"
                class="soft-field"
                placeholder="例如 7K3QM"
                maxlength="8"
                @keyup.enter="joinRoom"
              />
              <Button :disabled="busy" @click="joinRoom()">加入</Button>
            </div>
          </div>
        </div>

        <p v-if="store.netError" class="alert alert--warn">{{ store.netError }}</p>
        <p v-if="notice" class="alert alert--warn">{{ notice }}</p>

        <p class="muted" style="margin-top: var(--s5)">
          会先尝试 WebRTC 点对点直连（延迟更低）；如果双方网络打不通，自动切换到本服务器的 WebSocket 中继。
        </p>
      </Panel>
    </div>

    <AppModal v-model="friendsOpen" title="邀请好友" max-width="560px">
      <FriendsPanel
        variant="invite"
        kind="match"
        :room-code="store.roomCode"
        :can-invite="waiting"
      />
    </AppModal>
  </div>
</template>

<style scoped>
.hud-icon {
  width: 17px;
  height: 17px;
  margin-right: 6px;
}

.party-hint {
  padding: 8px 12px;
  border-radius: var(--r-pill);
  border: 1px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  font-size: 13px;
  text-align: center;
}

.code {
  display: flex;
  gap: var(--s3);
  justify-content: center;
  align-items: center;
  margin: var(--s5) 0 var(--s4);
  flex-wrap: wrap;
}

.code__value {
  font-size: 38px;
  font-weight: 600;
  letter-spacing: 8px;
  padding: var(--s3) var(--s5);
  color: var(--text);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--bg);
  box-shadow: inset 0 1px 3px rgba(2, 6, 16, 0.5);
}

.waiting {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--s3);
}

.lobby {
  display: flex;
  gap: var(--s5);
  flex-wrap: wrap;
}

.lobby__col {
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  gap: var(--s3);
  align-items: flex-start;
}

.lobby__rule {
  width: 1px;
  align-self: stretch;
  background: var(--line);
}

/* the column is align-items:flex-start, so the row must opt back into full
   width or the field collapses to its contents */
.join-row {
  display: flex;
  gap: var(--s3);
  align-items: flex-start;
  width: 100%;
}

.join-row :deep(.v-input) {
  flex: 0 0 210px;
  max-width: 210px;
  letter-spacing: 3px;
  text-transform: uppercase;
}
.dock-warn {
  margin: 0;
  padding: 6px 10px;
  border-radius: var(--r-md);
  background: color-mix(in srgb, #e8a33d 16%, transparent);
  font-size: var(--ui-font-xs);
  line-height: 1.5;
  color: var(--text);
}
</style>
