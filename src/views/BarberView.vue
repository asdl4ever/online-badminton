<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import CustomizePanel from '../components/CustomizePanel.vue';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { BARBER_COST } from '../game/items';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';

/**
 * 大地图上的「理发店」：外观自定义从首页搬到了这里。
 *
 * 可以随便试——**进店不收费**，改的时候实时预览，只有点「确认修改」才扣一次金币；
 * 没确认就离开（或者直接返回）会把装扮还原成进店时的样子。
 */
const router = useRouter();
const progress = useProgressStore();
const customize = useCustomizeStore();
/** 已经点过「确认修改」并付过钱 */
const paid = ref(false);

/** 进店时的装扮快照：没确认就照这个还原 */
let snap: {
  emoji: string;
  racketHex: string;
  trailHex: string;
  theme: typeof customize.theme;
  autoCycle: boolean;
} | null = null;

const canAfford = (): boolean => progress.coins >= BARBER_COST;

onMounted(() => {
  snap = {
    emoji: customize.emoji,
    racketHex: customize.racketHex,
    trailHex: customize.trailHex,
    theme: customize.theme,
    autoCycle: customize.autoCycle,
  };
});

/** 没确认付费 → 把装扮还原回进店时的样子 */
function restore(): void {
  if (paid.value || !snap) return;
  customize.emoji = snap.emoji;
  customize.racketHex = snap.racketHex;
  customize.trailHex = snap.trailHex;
  customize.theme = snap.theme;
  customize.autoCycle = snap.autoCycle;
  snap = null;
}

function confirmStyle(): void {
  if (paid.value) return;
  if (!canAfford()) {
    toastWarn(`还差 ¥${BARBER_COST - progress.coins}，先去赚点金币吧`);
    return;
  }
  progress.coins -= BARBER_COST;
  paid.value = true;
  sfx.point();
  toastGood(`已付 ¥${BARBER_COST}，新造型生效！`);
}

function back(): void {
  sfx.click();
  restore();
  void router.push('/');
}

onBeforeUnmount(restore);
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
            <span v-if="paid" class="muted bb__paid">已付 ¥{{ BARBER_COST }}</span>
          </div>
        </div>

        <p class="muted bb__hint">
          随便试——<b>确认修改才收费</b>（¥{{ BARBER_COST }}）；不确认直接离开，装扮会还原成进店时的样子。
          表情、球拍与拖尾配色、球场主题都在这里改，只影响画面不影响判定。头饰 / 翅膀 / 披风 /
          光环 / 宠物 / 球拍皮肤 / 特效请在「背包」里装备。
        </p>

        <CustomizePanel />

        <div class="bb__actions">
          <Button
            variant="primary"
            block
            :disabled="paid || !canAfford()"
            @click="confirmStyle"
          >
            {{ paid ? '已确认，新造型已生效' : `确认修改 · ¥${BARBER_COST}` }}
          </Button>
          <Button variant="quiet" block @click="back">
            {{ paid ? '回大地图' : '不改了，直接离开' }}
          </Button>
          <p v-if="!paid && !canAfford()" class="muted bb__warn">
            金币不够 ¥{{ BARBER_COST }}：可以随便试穿，攒够钱再回来按「确认修改」。
          </p>
        </div>
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
  line-height: 1.6;
}

.bb__actions {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  margin-top: var(--s4);
  padding-top: var(--s4);
  border-top: 1px solid var(--line);
}

.bb__warn {
  margin: 0;
  font-size: 12px;
  text-align: center;
}
</style>
