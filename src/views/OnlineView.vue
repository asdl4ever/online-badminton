<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClipboard, useIntervalFn } from '@vueuse/core';
import { VProgressCircular, VTextField } from 'vuetify/components';
import GameCanvas from '../components/GameCanvas.vue';
import PartyOverlay from '../components/PartyOverlay.vue';
import TopBar from '../components/ui/TopBar.vue';
import SideDock from '../components/ui/SideDock.vue';
import AppModal from '../components/ui/AppModal.vue';
import ScoreLine from '../components/ui/ScoreLine.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import StatusChip from '../components/ui/StatusChip.vue';
import EmotePicker from '../components/ui/EmotePicker.vue';
import FriendsPanel from '../components/FriendsPanel.vue';
import type { HudState } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import type { NetMetrics } from '../game/telemetry';
import { hostOpen, joinMatch } from '../net/connect';
import { normaliseCode, type NetLink } from '../net/link';
import { emptyPartyState, type PartyState } from '../game/config';
import { isTouchDevice } from '../game/device';
import { useGameStore } from '../stores/game';
import { useLobbyStore } from '../stores/lobby';
import { useCustomizeStore } from '../stores/customize';
import { useProgressStore } from '../stores/progress';
import { sfx } from '../game/audio';

const router = useRouter();
const route = useRoute();
const store = useGameStore();
const lobby = useLobbyStore();
const customize = useCustomizeStore();
const progress = useProgressStore();

const joinCode = ref('');
const hud = ref<HudState | null>(null);
const notice = ref('');
const leaving = ref(false);
const phaseText = ref('');
const canvas = ref<InstanceType<typeof GameCanvas> | null>(null);
const editing = ref(false);
const emoteOpen = ref(false);
const friendsOpen = ref(false);
const touch = isTouchDevice();

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
const onRelay = computed(() => playing.value && store.transport === '中继');
const chipTone = computed(() => {
  if (onRelay.value) return 'warn';
  if (playing.value) return 'ok';
  return busy.value || waiting.value ? 'warn' : 'idle';
});
const chipLabel = computed(() => {
  if (store.transport && playing.value) return store.transport;
  if (store.role === 'host') return store.roomCode ? `房间 ${store.roomCode}` : '未连接';
  if (store.role === 'guest') return store.roomCode ? `已加入 ${store.roomCode}` : '未连接';
  return '未连接';
});

watch(waiting, (on) => {
  if (on) {
    waited.value = 0;
    waitClock.resume();
  } else {
    waitClock.pause();
  }
});

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

async function createRoom() {
  sfx.unlock();
  sfx.click();
  store.reset();
  notice.value = '';
  phaseText.value = '正在建立房间…';
  store.role = 'host';
  store.connState = 'creating';
  try {
    const room = await hostOpen(hooks);
    store.roomCode = room.code;
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

async function joinRoom() {
  sfx.unlock();
  sfx.click();
  const code = normaliseCode(joinCode.value);
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
    adopt(link);
  } catch (err) {
    if (leaving.value) return;
    store.connState = 'error';
    store.netError = (err as Error).message;
    phaseText.value = '';
  }
}

// a friend invite (accepted in the global toast) hands over a room code to
// auto-join; consume it once when this view is on screen
watch(
  () => lobby.pendingJoin,
  (code) => {
    if (!code) return;
    const c = lobby.takePendingJoin();
    if (c && !playing.value) {
      joinCode.value = c;
      void joinRoom();
    }
  },
  { immediate: true },
);

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
}

function onMetrics(m: NetMetrics) {
  store.metrics = m;
}

function onEvent(e: SimEvent) {
  if (e.type === 'hit') sfx.hit(e.kind ?? 'drive');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') sfx.point();
  else if (e.type === 'gameover') {
    const local = store.role === 'guest' ? 1 : 0;
    const win = e.scorer === local;
    progress.recordResult(win, 'online');
    if (win) sfx.win();
    else sfx.lose();
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
    <div class="shell">
      <TopBar collapsible @back="back">
        <template #title>联机对战</template>
      </TopBar>

      <SideDock>
        <Button
          v-if="playing"
          size="sm"
          aria-haspopup="dialog"
          :aria-expanded="emoteOpen"
          @click="emoteOpen = !emoteOpen"
        >
          <svg class="hud-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8" />
            <circle cx="9" cy="10" r="1.3" fill="currentColor" />
            <circle cx="15" cy="10" r="1.3" fill="currentColor" />
            <path
              d="M8.4 14.4a4.6 4.6 0 0 0 7.2 0"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          <span>表情</span>
        </Button>
        <EmotePicker
          v-if="emoteOpen && playing"
          @pick="pickEmote"
          @close="emoteOpen = false"
        />
        <Button v-if="touch && playing" size="sm" @click="canvas?.toggleEditMode()">
          <svg class="hud-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h8M16 17h4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <circle cx="16" cy="7" r="2.5" fill="currentColor" />
            <circle cx="10" cy="12" r="2.5" fill="currentColor" />
            <circle cx="14" cy="17" r="2.5" fill="currentColor" />
          </svg>
          <span>{{ editing ? '完成' : '摇杆' }}</span>
        </Button>
        <StatusChip :tone="chipTone">{{ chipLabel }}</StatusChip>
        <Button size="sm" aria-haspopup="dialog" :aria-expanded="friendsOpen" @click="friendsOpen = !friendsOpen">
          <span>邀请好友</span>
        </Button>
      </SideDock>

      <AppModal v-model="friendsOpen" title="邀请好友" max-width="560px">
        <FriendsPanel variant="invite" :room-code="store.roomCode" :can-invite="waiting" />
      </AppModal>

      <div v-if="partyMode && !playing" class="muted party-hint">
        乐趣模式已开启：一局 3 轮，每轮开始前投票选玩法
      </div>

      <template v-if="playing">
        <div class="stage">
          <GameCanvas
            ref="canvas"
            :role="store.role"
            :difficulty="store.difficulty"
            :session="store.session"
            :cosmetic="customize.cosmetic"
            :local-name="lobby.playerName"
            :local-rank="progress.tier.id"
            :theme="customize.theme"
            :auto-cycle-theme="customize.autoCycle"
            :party="partyMode"
            @hud="onHud"
            @sim="onEvent"
            @metrics="onMetrics"
            @editmode="editing = $event"
            @disconnect="onDisconnect"
            @themechange="customize.theme = $event"
            @party="partyState = $event"
          />
          <PartyOverlay
            :state="partyState"
            :local-name="lobby.playerName"
            remote-name="对手"
            @vote="canvas?.voteParty($event)"
            @next="canvas?.nextPartyRound()"
          />
        </div>
        <ScoreLine>
          <div v-if="partyState.active" class="muted">
            第 {{ partyState.round }} / {{ partyState.total }} 轮 · 积分
            <b class="num" style="color: var(--accent)">{{ partyState.scores[0] }}</b>
            :
            <b class="num" style="color: var(--accent-2)">{{ partyState.scores[1] }}</b>
            &nbsp;·&nbsp; 每轮投票选玩法
          </div>
          <div v-else class="muted">
            比分 <b class="num" style="color: var(--accent)">{{ hud?.score[0] ?? 0 }}</b>
            :
            <b class="num" style="color: var(--accent-2)">{{ hud?.score[1] ?? 0 }}</b>
            &nbsp;·&nbsp; 先到 11 分获胜
          </div>
          <div class="muted">
            你是{{ store.role === 'host' ? '左侧（蓝）' : '右侧（橙）' }}选手
            <template v-if="store.transport">
              · {{ store.transport
              }}<template v-if="store.metrics">
                <span class="num"> {{ store.metrics.rttMs.toFixed(0) }}ms</span>
              </template>
            </template>
          </div>
          <div v-if="onRelay" class="muted" style="color: var(--warn)">
            走中继会多绕服务器一圈，延迟偏高
          </div>
        </ScoreLine>
      </template>

      <template v-else>
        <Panel v-if="waiting" style="text-align: center">
          <p class="muted">把下面这串房间号发给你的对手</p>

          <div class="code">
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
              <Button variant="primary" :disabled="busy" @click="createRoom">创建房间</Button>
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
                <Button :disabled="busy" @click="joinRoom">加入</Button>
              </div>
            </div>
          </div>

          <p v-if="store.netError" class="alert alert--warn">{{ store.netError }}</p>
          <p v-if="notice" class="alert alert--warn">{{ notice }}</p>

          <p class="muted" style="margin-top: var(--s5)">
            会先尝试 WebRTC 点对点直连（延迟更低）；如果双方网络打不通，自动切换到本服务器的 WebSocket 中继。
          </p>
        </Panel>
      </template>
    </div>
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
</style>
