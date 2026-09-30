<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useClipboard, useIntervalFn } from '@vueuse/core';
import { VProgressCircular } from 'vuetify/components';
import GameCanvas from '../components/GameCanvas.vue';
import TopBar from '../components/ui/TopBar.vue';
import ScoreLine from '../components/ui/ScoreLine.vue';
import GlassPanel from '../components/ui/GlassPanel.vue';
import GlassButton from '../components/ui/GlassButton.vue';
import StatusChip from '../components/ui/StatusChip.vue';
import type { HudState } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import { hostOpen, joinMatch } from '../net/connect';
import { normaliseCode, type NetLink } from '../net/link';
import { useGameStore } from '../stores/game';
import { sfx } from '../game/audio';

const router = useRouter();
const store = useGameStore();

const joinCode = ref('');
const hud = ref<HudState | null>(null);
const notice = ref('');
const leaving = ref(false);
const phaseText = ref('');

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
const chipTone = computed(() => (playing.value ? 'ok' : busy.value || waiting.value ? 'warn' : 'idle'));
const chipLabel = computed(() => {
  if (store.transport && playing.value) return store.transport;
  if (store.role === 'host') return store.roomCode ? `房间 ${store.roomCode}` : '未连接';
  if (store.role === 'guest') return store.roomCode ? `已加入 ${store.roomCode}` : '未连接';
  return '未连接';
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

function onEvent(e: SimEvent) {
  if (e.type === 'hit') sfx.hit(e.kind ?? 'drive');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') sfx.point();
  else if (e.type === 'gameover') {
    const local = store.role === 'guest' ? 1 : 0;
    if (e.scorer === local) sfx.win();
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
      <TopBar @back="back">
        <template #title>联机对战</template>
        <template #aside>
          <StatusChip :tone="chipTone">{{ chipLabel }}</StatusChip>
        </template>
      </TopBar>

      <template v-if="playing">
        <div class="stage">
          <GameCanvas
            :role="store.role"
            :difficulty="store.difficulty"
            :session="store.session"
            @hud="onHud"
            @sim="onEvent"
            @disconnect="onDisconnect"
          />
        </div>
        <ScoreLine>
          <div class="muted">
            比分 <b style="color: var(--accent)">{{ hud?.score[0] ?? 0 }}</b>
            :
            <b style="color: var(--accent-2)">{{ hud?.score[1] ?? 0 }}</b>
            &nbsp;·&nbsp; 先到 11 分获胜
          </div>
          <div class="muted">
            你是{{ store.role === 'host' ? '左侧（蓝）' : '右侧（橙）' }}选手
            <template v-if="store.transport">· {{ store.transport }}</template>
          </div>
        </ScoreLine>
      </template>

      <template v-else>
        <GlassPanel v-if="waiting" style="text-align: center">
          <p class="muted">把下面这串房间号发给你的对手</p>

          <div class="code">
            <span class="code__value">{{ store.roomCode }}</span>
            <GlassButton variant="primary" :disabled="!clipboardSupported" @click="copyCode">
              {{ copied ? '已复制' : '复制' }}
            </GlassButton>
          </div>

          <div class="waiting">
            <VProgressCircular indeterminate size="18" width="2" color="primary" />
            <span class="muted">{{ phaseText }}</span>
          </div>

          <p class="muted" style="margin-top: 10px; font-size: 13px">
            已开放通道：{{ store.session?.kind ?? '—' }} · 对手直连不上时会自动走中继
          </p>
          <p class="muted" style="margin-top: 4px; font-size: 12px">已等待 {{ waited }}s</p>
        </GlassPanel>

        <GlassPanel
          v-else-if="store.connState === 'creating' || store.connState === 'connecting'"
          style="text-align: center"
        >
          <VProgressCircular indeterminate size="24" width="2" color="primary" />
          <p class="muted" style="margin-top: 14px">{{ phaseText || '正在连接…' }}</p>
          <p v-if="store.netStatus?.note" class="muted" style="margin-top: 8px; color: var(--warn)">
            {{ store.netStatus.note }}
          </p>
        </GlassPanel>

        <GlassPanel v-else>
          <div class="lobby">
            <div class="lobby__col">
              <h3>创建房间</h3>
              <p class="muted">生成一个房间号，等对手加入。</p>
              <GlassButton variant="primary" :disabled="busy" @click="createRoom">创建房间</GlassButton>
            </div>

            <div class="lobby__rule" />

            <div class="lobby__col">
              <h3>加入房间</h3>
              <p class="muted">输入对手给你的房间号。</p>
              <div class="join-row">
                <VTextField
                  v-model="joinCode"
                  class="glass-field"
                  placeholder="例如 7K3QM"
                  maxlength="8"
                  @keyup.enter="joinRoom"
                />
                <GlassButton :disabled="busy" @click="joinRoom">加入</GlassButton>
              </div>
            </div>
          </div>

          <p v-if="store.netError" class="alert alert--warn">{{ store.netError }}</p>
          <p v-if="notice" class="alert alert--warn">{{ notice }}</p>

          <p class="muted" style="margin-top: 20px">
            会先尝试 WebRTC 点对点直连（延迟更低）；如果双方网络打不通，自动切换到本服务器的 WebSocket 中继。
          </p>
        </GlassPanel>
      </template>
    </div>
  </div>
</template>

<style scoped>
.code {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin: 22px 0 14px;
  flex-wrap: wrap;
}

.code__value {
  font-family: var(--mono);
  font-size: 40px;
  letter-spacing: 10px;
  padding: 10px 22px;
  color: #fff;
  border-radius: var(--r-md);
  border: 1px solid var(--glass-line);
  background: rgba(10, 20, 33, 0.75);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
}

.waiting {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.lobby {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
}

.lobby__col {
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.lobby__rule {
  width: 1px;
  align-self: stretch;
  background: var(--glass-line);
}

/* the column is align-items:flex-start, so the row must opt back into full
   width or the field collapses to its contents */
.join-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  width: 100%;
}

.join-row :deep(.v-input) {
  flex: 0 0 210px;
  max-width: 210px;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.alert {
  margin-top: 18px;
  padding: 10px 14px;
  border-radius: var(--r-sm);
  font-size: 14px;
}

.alert--warn {
  color: var(--warn);
  border: 1px solid rgba(255, 209, 102, 0.32);
  background: rgba(255, 209, 102, 0.09);
}
</style>
