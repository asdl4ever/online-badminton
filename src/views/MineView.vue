<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
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
import { isTouchDevice } from '../game/device';
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
const editing = ref(false);
const touch = isTouchDevice();
let link: NetLink | null = null;

function toggleEdit() {
  const scene = game?.scene.getScene('MiningScene') as MiningScene | undefined;
  scene?.toggleEditMode();
  editing.value = !editing.value;
}

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
    <PageShell title="采矿场" back @back="back">
      <template #icons>
        <span class="icon-btn ui-num mine-earn" title="本场收益">¥{{ sessionTotal }}</span>
        <button v-if="touch" class="icon-btn jelly" type="button" title="摇杆布局" @click="toggleEdit">
          🕹
        </button>
      </template>

      <template #dock>
        <SideDock>
          <StatusChip :tone="roomCode ? 'ok' : 'idle'">
            {{ roomCode ? `房间 ${roomCode}` : '单机' }}
          </StatusChip>
          <span class="ui-num mine-earn">本场 ¥{{ sessionTotal }}</span>
          <span v-if="phase" class="dock-note">{{ phase }}</span>
          <template v-if="!roomCode">
            <input
              v-model="joinCode"
              class="ui-input"
              maxlength="6"
              placeholder="房号"
              @keyup.enter="join"
            />
            <Button size="sm" block :disabled="waiting" @click="host">建房</Button>
            <Button size="sm" block :disabled="waiting" @click="join">加入</Button>
          </template>
          <Button v-if="touch" size="sm" block @click="toggleEdit">
            {{ editing ? '完成' : '摇杆布局' }}
          </Button>
        </SideDock>
      </template>

      <template #stage>
        <div ref="container" class="mine-canvas" />
      </template>
    </PageShell>
  </div>
</template>

<style scoped>
.mine-earn {
  font-weight: 700;
  color: var(--accent-2);
  font-size: var(--ui-font-sm);
}

.dock-note {
  margin: 0;
  font-size: var(--ui-font-xs);
  color: var(--text-dim);
}
</style>
