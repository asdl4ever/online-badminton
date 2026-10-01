<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import CustomizePanel from '../components/CustomizePanel.vue';
import { useProgressStore } from '../stores/progress';
import { BARBER_COST } from '../game/items';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';

/**
 * 大地图上的「理发店」：外观自定义从首页搬到了这里，**每次进店收一次金币**。
 *
 * 收费点放在这里（而不是地图的进区逻辑里），是因为这样直接输 URL 进来也一样要付钱；
 * 大地图那边只做一次「钱够不够」的友好提醒。
 */
const router = useRouter();
const progress = useProgressStore();
const paid = ref(false);

function back(): void {
  sfx.click();
  void router.push('/');
}

onMounted(() => {
  if (progress.coins < BARBER_COST) {
    toastWarn(`理发要 ¥${BARBER_COST}，先去钓鱼塘或矿洞赚点金币吧`);
    void router.replace('/');
    return;
  }
  progress.coins -= BARBER_COST;
  paid.value = true;
  sfx.point();
  toastGood(`已付 ¥${BARBER_COST}，慢慢挑`);
});
</script>

<template>
  <div class="page page--narrow">
    <div class="shell">
      <Panel>
        <div class="bb__head">
          <Button size="sm" variant="quiet" @click="back">← 回大地图</Button>
          <h2 class="bb__title"><span class="bb__sign">💈</span>理发店</h2>
          <div class="bb__wallet">
            <span class="num">¥{{ progress.coins }}</span>
            <span v-if="paid" class="muted bb__paid">本次已付 ¥{{ BARBER_COST }}</span>
          </div>
        </div>

        <p class="muted bb__hint">
          表情、球拍与拖尾配色、球场主题都在这里改，只影响画面不影响判定。头饰 / 翅膀 / 披风 /
          光环 / 宠物 / 球拍皮肤 / 特效请在「背包」里装备。
        </p>

        <CustomizePanel />
      </Panel>
    </div>
  </div>
</template>

<style scoped>
.bb__head {
  display: flex;
  align-items: center;
  gap: var(--s3);
  flex-wrap: wrap;
  margin-bottom: var(--s2);
}

.bb__title {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--text);
}

.bb__sign {
  font-size: 22px;
}

.bb__wallet {
  margin-left: auto;
  display: inline-flex;
  align-items: baseline;
  gap: var(--s2);
  font-weight: 700;
  color: var(--accent-2);
}

.bb__paid {
  font-size: 12px;
  font-weight: 500;
}

.bb__hint {
  margin: 0 0 var(--s4);
  font-size: 13px;
}
</style>
