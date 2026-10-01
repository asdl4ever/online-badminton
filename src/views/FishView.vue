<script setup lang="ts">
import Phaser from 'phaser';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import SideDock from '../components/ui/SideDock.vue';
import Button from '../components/ui/Button.vue';
import StatusChip from '../components/ui/StatusChip.vue';
import { FishingScene, type FishingSceneData } from '../game/fish/FishingScene';
import { VIEW_H, VIEW_W } from '../game/constants';
import { applyTheme } from '../game/theme';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';
import { hostOpen, joinMatch } from '../net/connect';
import { normaliseCode, type NetLink } from '../net/link';
import { isTouchDevice } from '../game/device';
import { useCustomizeStore } from '../stores/customize';
import { useProgressStore } from '../stores/progress';

const ROD_COST = 300;

const router = useRouter();
const customize = useCustomizeStore();
const progress = useProgressStore();
const container = ref<HTMLDivElement | null>(null);
let game: Phaser.Game | null = null;

const basket = ref({ count: 0, value: 0 });
const joinCode = ref('');
const roomCode = ref('');
const waiting = ref(false);
const phase = ref('');
const editing = ref(false);
const touch = isTouchDevice();
let link: NetLink | null = null;

function toggleEdit() {
  const scene = game?.scene.getScene('FishingScene') as FishingScene | undefined;
  scene?.toggleEditMode();
  editing.value = !editing.value;
}

const nextRodCost = computed(() => ROD_COST * progress.rodLevel);
const rodMaxed = computed(() => progress.rodLevel >= 5);

function back() {
  sfx.click();
  void router.push('/');
}

/** (re)boot the phaser instance, optionally wired to a net link */
function boot(session: NetLink | null) {
  if (!container.value) return;
  game?.destroy(true);
  const data: FishingSceneData = {
    cosmetic: customize.cosmetic,
    session,
    rodLevel: progress.rodLevel,
    onBasket: (count, value) => (basket.value = { count, value }),
  };
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container.value,
    width: VIEW_W,
    height: VIEW_H,
    backgroundColor: '#bfe0f5',
    banner: false,
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [],
    callbacks: {
      postBoot: (g) => g.scene.add('FishingScene', FishingScene, true, data),
    },
  });
}

function host() {
  sfx.click();
  waiting.value = true;
  phase.value = '正在建房…';
  hostOpen({
    onPhase: (p) => (phase.value = p),
    onDisconnected: () => {
      phase.value = '对方已离开';
    },
  })
    .then(async (room) => {
      roomCode.value = room.code;
      phase.value = `房间 ${room.code}，等待钓友加入…`;
      link = await room.connected;
      phase.value = '钓友已加入！';
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

function sell() {
  if (!game) return;
  const count = basket.value.count;
  const scene = game.scene.getScene('FishingScene') as FishingScene | undefined;
  const coins = scene?.sellBasket() ?? 0;
  if (coins <= 0) {
    toastWarn('鱼篓是空的，先去钓鱼吧');
    return;
  }
  progress.coins += coins;
  sfx.win();
  toastGood(`卖出 ${count} 条鱼，共 ¥${coins}`);
}

function upgradeRod() {
  const cost = nextRodCost.value;
  if (progress.coins < cost) {
    toastWarn(`金币不够，升级需要 ¥${cost}`);
    return;
  }
  progress.coins -= cost;
  progress.rodLevel += 1;
  sfx.point();
  toastGood(`鱼竿升到 ${progress.rodLevel} 级！够得更远、钩子更大`);
  // remount so the new reach takes effect
  boot(link);
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
    <PageShell title="钓鱼塘" back @back="back">
      <template #icons>
        <button
          class="icon-btn jelly"
          type="button"
          :title="`把鱼篓换成金币（¥${basket.value}）`"
          @click="sell"
        >
          卖鱼 ¥{{ basket.value }}
        </button>
        <button
          v-if="!rodMaxed"
          class="icon-btn jelly"
          type="button"
          :title="`鱼竿升级（¥${nextRodCost}）`"
          @click="upgradeRod"
        >
          鱼竿 Lv.{{ progress.rodLevel }}
        </button>
        <button v-if="touch" class="icon-btn jelly" type="button" title="摇杆布局" @click="toggleEdit">
          摇杆布局
        </button>
      </template>

      <template #dock>
        <SideDock>
          <StatusChip :tone="roomCode ? 'ok' : 'idle'">
            {{ roomCode ? `房间 ${roomCode}` : '单机' }}
          </StatusChip>
          <Button size="sm" variant="primary" block @click="sell">
            卖鱼 ¥{{ basket.value }}
          </Button>
          <Button
            v-if="!rodMaxed"
            size="sm"
            block
            :disabled="progress.coins < nextRodCost"
            @click="upgradeRod"
          >
            鱼竿升级 ¥{{ nextRodCost }}
          </Button>
          <span v-else class="dock-note">鱼竿已满级</span>
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
        <div ref="container" class="fish-canvas" />
      </template>
    </PageShell>
  </div>
</template>

<style scoped>
.fish-canvas {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #bfe0f5;
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--e2);
  touch-action: none;
}

.fish-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.dock-note {
  margin: 0;
  font-size: var(--ui-font-xs);
  color: var(--text-dim);
}
</style>
