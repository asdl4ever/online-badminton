<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import TopBar from '../components/ui/TopBar.vue';
import SideDock from '../components/ui/SideDock.vue';
import Button from '../components/ui/Button.vue';
import StatusChip from '../components/ui/StatusChip.vue';
import { MiningScene, type MiningSceneData } from '../game/mine/MiningScene';
import { VIEW_H, VIEW_W } from '../game/constants';
import { applyTheme } from '../game/theme';
import { sfx } from '../game/audio';
import { toastWarn } from '../composables/useToast';
import { hostOpen, joinMatch } from '../net/connect';
import { normaliseCode, type NetLink } from '../net/link';
import { useCustomizeStore } from '../stores/customize';
import { useProgressStore } from '../stores/progress';

const router = useRouter();
const customize = useCustomizeStore();
const progress = useProgressStore();
const container = ref<HTMLDivElement | null>(null);
let game: Phaser.Game | null = null;

const sessionTotal = ref(0);
const joinCode = ref('');
const roomCode = ref('');
const waiting = ref(false);
const phase = ref('');
let link: NetLink | null = null;

function back() {
  sfx.click();
  void router.push('/');
}

/** coins are granted as blocks break: the scene reports a running total */
function onEarn(total: number): void {
  if (total > sessionTotal.value) {
    progress.coins += total - sessionTotal.value;
    sessionTotal.value = total;
  }
}

function boot(session: NetLink | null) {
  if (!container.value) return;
  game?.destroy(true);
  const data: MiningSceneData = {
    cosmetic: customize.cosmetic,
    session,
    onEarn,
  };
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container.value,
    width: VIEW_W,
    height: VIEW_H,
    backgroundColor: '#c9c2ae',
    banner: false,
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [],
    callbacks: {
      postBoot: (g) => g.scene.add('MiningScene', MiningScene, true, data),
    },
  });
}

function host() {
  sfx.click();
  waiting.value = true;
  phase.value = '正在建房…';
  hostOpen({
    onPhase: (p) => (phase.value = p),
    onDisconnected: () => (phase.value = '对方已离开'),
  })
    .then(async (room) => {
      roomCode.value = room.code;
      phase.value = `房间 ${room.code}，等待矿友加入…`;
      link = await room.connected;
      phase.value = '矿友已加入！';
      waiting.value = false;
      boot(link);
    })
    .catch((e: Error) => {
      toastWarn(e.message);
      waiting.value = false;
    });
}

function join() {
  const code = normaliseCode(joinCode.value);
  if (code.length < 4) {
    toastWarn('请输入 4~6 位房号');
    return;
  }
  sfx.click();
  waiting.value = true;
  phase.value = '正在加入…';
  joinMatch(code, { onPhase: (p) => (phase.value = p) })
    .then((m) => {
      link = m.link;
      phase.value = '已加入！';
      waiting.value = false;
      boot(link);
    })
    .catch((e: Error) => {
      toastWarn(e.message);
      waiting.value = false;
    });
}

onMounted(() => {
  applyTheme(customize.theme);
  boot(null);
});

onBeforeUnmount(() => {
  link?.destroy();
  link = null;
  game?.destroy(true);
  game = null;
});
</script>

<template>
  <div class="page page--playing">
    <div class="shell">
      <TopBar collapsible @back="back">
        <template #title>采矿场</template>
        <template #aside>
          <span class="num mine-earn">本场 ¥{{ sessionTotal }}</span>
        </template>
      </TopBar>

      <SideDock>
        <StatusChip :tone="roomCode ? 'ok' : 'idle'">
          {{ roomCode ? `房间 ${roomCode}` : '单机' }}
        </StatusChip>
      </SideDock>

      <div class="stage">
        <div ref="container" class="mine-canvas" />
      </div>

      <div class="muted mine-note">
        <span>
          键盘：`A`/`D` 走动、`空格` 起跳；手机：按住屏幕拖动走位，左下角按钮起跳。挥拍砸面前的矿石，砸碎就得金币；石头→铁矿→金矿→钻石矿循环刷新，越往后越硬也越值钱。
        </span>
        <span class="mine-shop">
          <template v-if="!roomCode">
            <input
              v-model="joinCode"
              class="mine-code"
              maxlength="6"
              placeholder="房号"
              @keyup.enter="join"
            />
            <Button size="sm" :disabled="waiting" @click="host">建房</Button>
            <Button size="sm" :disabled="waiting" @click="join">加入</Button>
          </template>
          <template v-if="phase && waiting">{{ phase }}</template>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mine-canvas {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #c9c2ae;
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--e2);
  touch-action: none;
}

.mine-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.mine-earn {
  font-weight: 700;
  color: var(--accent-2);
}

.mine-note {
  margin-top: var(--s3);
  font-size: 13px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s3);
}

.mine-shop {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.mine-code {
  width: 76px;
  padding: 6px 8px;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
}
</style>
