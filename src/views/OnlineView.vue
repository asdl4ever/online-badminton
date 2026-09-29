<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import GameCanvas from '../components/GameCanvas.vue';
import type { HudState } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import { createHostSession, joinSession, type NetSession } from '../net/session';
import { useGameStore } from '../stores/game';
import { sfx } from '../game/audio';

const router = useRouter();
const store = useGameStore();

const joinCode = ref('');
const copied = ref(false);
const hud = ref<HudState | null>(null);
const notice = ref('');
const leaving = ref(false);

const playing = computed(() => store.connState === 'connected');
const busy = computed(() => store.connState === 'creating' || store.connState === 'connecting');

function attach(session: NetSession) {
  session.onDisconnected = () => handlePeerLeft();
  session.onError = (m) => {
    if (!leaving.value) store.netError = m;
  };
}

async function createRoom() {
  sfx.unlock();
  sfx.click();
  store.reset();
  notice.value = '';
  store.role = 'host';
  store.connState = 'creating';
  try {
    const session = await createHostSession();
    store.session = session;
    store.roomCode = session.roomCode;
    store.connState = 'waiting';
    attach(session);
    session.onConnected = () => {
      notice.value = '';
      store.connState = 'connected';
    };
  } catch (err) {
    store.connState = 'error';
    store.netError = (err as Error).message;
  }
}

async function joinRoom() {
  sfx.unlock();
  sfx.click();
  const code = joinCode.value.trim();
  if (!code) {
    store.connState = 'error';
    store.netError = '请输入房间号';
    return;
  }
  store.reset();
  notice.value = '';
  store.role = 'guest';
  store.connState = 'connecting';
  try {
    const session = await joinSession(code);
    store.session = session;
    store.roomCode = session.roomCode;
    attach(session);
    store.connState = 'connected';
  } catch (err) {
    store.connState = 'error';
    store.netError = (err as Error).message;
  }
}

function handlePeerLeft() {
  if (leaving.value) return;
  notice.value = '对手已离开对局';
  store.connState = 'error';
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(store.roomCode);
    copied.value = true;
    sfx.click();
    window.setTimeout(() => (copied.value = false), 1400);
  } catch {
    /* clipboard unavailable */
  }
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
  <div class="page">
    <div class="shell">
      <div class="topbar">
        <button class="btn btn-ghost" @click="back">← 返回</button>
        <h2 style="font-size: 20px">联机对战</h2>
        <div class="chip">
          <span class="dot" :class="{ on: playing }" />
          <span v-if="store.role === 'host'">房间 {{ store.roomCode || '——' }}</span>
          <span v-else-if="store.role === 'guest'">已加入 {{ store.roomCode || '——' }}</span>
          <span v-else>未连接</span>
        </div>
      </div>

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
        <div class="topbar">
          <div class="muted">
            比分 <b style="color: var(--accent)">{{ hud?.score[0] ?? 0 }}</b>
            :
            <b style="color: var(--accent-2)">{{ hud?.score[1] ?? 0 }}</b>
            &nbsp;·&nbsp; 先到 11 分获胜
          </div>
          <div class="muted">你是{{ store.role === 'host' ? '左侧（蓝）' : '右侧（橙）' }}选手</div>
        </div>
      </template>

      <template v-else>
        <div v-if="store.connState === 'waiting'" class="card" style="text-align: center; padding: 40px">
          <p class="muted">把下面这串房间号发给你的对手</p>
          <div style="display: flex; gap: 12px; justify-content: center; align-items: center; margin: 22px 0">
            <div
              style="
                font-family: ui-monospace, Consolas, monospace;
                font-size: 44px;
                letter-spacing: 10px;
                color: #fff;
                background: #0a1421;
                border: 1px solid var(--border);
                border-radius: 12px;
                padding: 12px 26px;
              "
            >
              {{ store.roomCode }}
            </div>
            <button class="btn" @click="copyCode">{{ copied ? '已复制' : '复制' }}</button>
          </div>
          <p class="muted">等待对手加入…（对手在“加入房间”里输入这串号码）</p>
        </div>

        <div v-else-if="store.connState === 'connecting'" class="card" style="text-align: center; padding: 40px">
          <p class="muted">正在连接房间 {{ store.roomCode }} …</p>
        </div>

        <div v-else class="card">
          <div style="display: flex; gap: 28px; flex-wrap: wrap">
            <div style="flex: 1 1 260px">
              <h3 style="margin-bottom: 10px">创建房间</h3>
              <p class="muted" style="margin-bottom: 16px">生成一个房间号，等对手加入。</p>
              <button class="btn btn-primary" :disabled="busy" @click="createRoom">创建房间</button>
            </div>
            <div style="width: 1px; background: var(--border); align-self: stretch" />
            <div style="flex: 1 1 260px">
              <h3 style="margin-bottom: 10px">加入房间</h3>
              <p class="muted" style="margin-bottom: 16px">输入对手给你的房间号。</p>
              <div style="display: flex; gap: 10px">
                <input
                  v-model="joinCode"
                  placeholder="例如 7K3QM"
                  maxlength="8"
                  style="text-transform: uppercase; letter-spacing: 3px; width: 160px"
                  @keyup.enter="joinRoom"
                />
                <button class="btn" :disabled="busy" @click="joinRoom">加入</button>
              </div>
            </div>
          </div>

          <p v-if="store.netError" style="margin-top: 18px; color: var(--warn)">{{ store.netError }}</p>
          <p v-if="notice" style="margin-top: 18px; color: var(--warn)">{{ notice }}</p>

          <p class="muted" style="margin-top: 20px">
            联机基于 WebRTC 点对点（PeerJS 公共信令），房主端负责物理运算，对手端发送操作指令。
          </p>
        </div>
      </template>
    </div>
  </div>
</template>
