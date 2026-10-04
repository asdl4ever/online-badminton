<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import { MiningScene, type MiningSceneData } from '../game/mine/MiningScene';
import { VIEW_H, VIEW_W } from '../game/constants';
import { bindCanvasSize, sceneScaleConfig } from '../game/zoom';
import GameSticks from '../components/ui/GameSticks.vue';
import { applyTheme, DEFAULT_THEME } from '../game/theme';
import { sfx } from '../game/audio';
import { toastWarn } from '../composables/useToast';
import { hostOpen } from '../net/connect';
import { waitForRoomCode } from '../composables/useInviteRoom';
import { type NetLink } from '../net/link';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';
import { useProgressStore } from '../stores/progress';

const router = useRouter();
const customize = useCustomizeStore();
const lobby = useLobbyStore();
const progress = useProgressStore();
const container = ref<HTMLDivElement | null>(null);
let game: Phaser.Game | null = null;

const sessionTotal = ref(0);
const roomCode = ref('');
const waiting = ref(false);
const phase = ref('');
let link: NetLink | null = null;

function back() {
  sfx.click();
  void router.push('/');
}

/**
 * 矿石砸碎就进仓（**材料，不是金币**）：场景上报的是本场累计个数，这里只记增量。
 * 换钱要把矿石拉去赚钱区交给农场主。
 */
function onOre(total: number): void {
  if (total > sessionTotal.value) {
    progress.addOre(total - sessionTotal.value);
    sessionTotal.value = total;
  }
}

function boot(session: NetLink | null) {
  if (!container.value) return;
  game?.destroy(true);
  const data: MiningSceneData = {
    cosmetic: customize.cosmetic,
    session,
    onOre,
  };
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container.value,
    width: VIEW_W,
    height: VIEW_H,
    backgroundColor: '#c9c2ae',
    banner: false,
    audio: { noAudio: true },
    scale: sceneScaleConfig(),
    scene: [],
    callbacks: {
      postBoot: (g) => g.scene.add('MiningScene', MiningScene, true, data),
    },
  });

  // 画布后备缓冲 = 容器 CSS 尺寸 × 设备像素比（高分屏不糊），并跟随尺寸变化
  bindCanvasSize(game, container.value);
}

/**
 * 好友面板点「邀请」时若无房间：自动建房并等房号，不用先手动点「建房」。
 */
async function ensureInviteRoom(): Promise<string> {
  if (roomCode.value) return roomCode.value;
  host();
  return waitForRoomCode(() => roomCode.value);
}

function host() {
  sfx.click();
  waiting.value = true;
  phase.value = '正在建房…';
  hostOpen(
    {
      onPhase: (p) => (phase.value = p),
      onDisconnected: () => (phase.value = '对方已离开'),
    },
    // 复用「一间房」：换玩法页不换房号
    lobby.room,
  )
    .then(async (room) => {
      roomCode.value = room.code;
      lobby.setRoom(room.code, 'host');
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


onMounted(() => {
  applyTheme(DEFAULT_THEME);
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
    <PageShell
      title="采矿场"
      back
      friends-kind="mine"
      :friends-code="roomCode"
      :friends-ensure-room="ensureInviteRoom"
      @back="back"
    >
      <template #icons>
        <span class="icon-btn ui-num mine-earn" title="本场挖到多少矿石">
          🪨 本场 {{ sessionTotal }} · 仓 {{ progress.ore }}
        </span>
      </template>


      <template #stage>
        <div ref="container" class="mine-canvas">
          <GameSticks />
        </div>
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
