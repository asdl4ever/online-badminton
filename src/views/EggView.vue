<script setup lang="ts">
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import SideDock from '../components/ui/SideDock.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import PetEggPanel from '../components/PetEggPanel.vue';
import { sfx } from '../game/audio';

/**
 * 大地图上的「孵化屋」：宠物蛋从首页那个弹窗里搬出来，变成地图上的一栋房子。
 *
 * 面板本体还是 `PetEggPanel.vue`（数据在 progress store），这里只负责把它放进
 * 统一外壳里，所以右上角的成就 / 段位 / 背包…和大世界完全一致。
 */
const router = useRouter();

function back(): void {
  sfx.click();
  void router.push('/');
}
</script>

<template>
  <div class="page page--playing">
    <PageShell title="孵化屋 · 宠物蛋" back @back="back">
      <template #stage>
        <div class="egg-stage">
          <Panel class="egg-card">
            <p class="muted egg-hint">
              🥚 挑一颗蛋孵化：星级越高宠物越强，重复的宠物会折算成金币。孵出来的宠物可以在
              「背包」里换上。
            </p>
            <PetEggPanel />
          </Panel>
        </div>
      </template>

      <template #dock>
        <SideDock>
          <p class="egg-note">
            宠物蛋只在孵化屋抽（大地图左上角那栋房子）。孵到高星的宠物会自动记在收藏里，
            重复的会退金币。
          </p>
          <Button size="sm" block @click="back">回大地图</Button>
        </SideDock>
      </template>
    </PageShell>
  </div>
</template>

<style scoped>
.egg-stage {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--s4);
}

.egg-card {
  width: min(560px, 100%);
}

.egg-hint {
  margin: 0 0 var(--s3);
  font-size: 12px;
  line-height: 1.6;
}

.egg-note {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-dim);
}
</style>
