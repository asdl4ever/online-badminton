<script setup lang="ts">
import { computed } from 'vue';
import Button from './ui/Button.vue';
import { MATERIALS } from '../game/items';
import { useProgressStore } from '../stores/progress';
import { toastGood, toastWarn } from '../composables/useToast';
import { sfx } from '../game/audio';

/**
 * 农场主的**收购站**：把仓库里的材料换成金币。
 *
 * - 棉花 / 矿石按 `MATERIALS` 的单价收（棉花 ¥5/朵、矿石 ¥8/个）；
 * - 鱼按每条抓到时算好的 `value`（闪光 ×5、鱼王 ×3 已经含在里面），一条一条算；
 * - 鱼的部分会记进「卖鱼累计」（`noteSold`），那条成就靠它。
 *
 * 材料从哪来：采棉花 → `FarmView`、砸矿 → `MineView`、抓鱼 → `FishView`（上岸入仓）。
 */
const props = defineProps<{ line?: string }>();

const progress = useProgressStore();

const cottonCoins = computed(() => progress.cotton * MATERIALS.cotton.price);
const oreCoins = computed(() => progress.ore * MATERIALS.ore.price);
const fishCoins = computed(() => progress.fishBox.reduce((s, f) => s + f.value, 0));
/** 鱼仓里最值钱的几条，展示用 */
const topFish = computed(() =>
  [...progress.fishBox].sort((a, b) => b.value - a.value).slice(0, 3),
);

function sell(what: 'cotton' | 'ore' | 'fish' | 'all'): void {
  const r = progress.sellMaterials(what);
  if (!r.ok) {
    sfx.click();
    toastWarn(r.message);
    return;
  }
  sfx.win();
  toastGood(`💰 ${r.message}`);
}
</script>

<template>
  <div class="tp">
    <p v-if="props.line" class="tp__say">🤠 「{{ props.line }}」</p>

    <div class="tp__rows">
      <div class="tp__row">
        <span class="tp__icon">{{ MATERIALS.cotton.emoji }}</span>
        <span class="tp__body">
          <b>{{ MATERIALS.cotton.name }}</b>
          <em class="muted">仓里 {{ progress.cotton }} 个 · ¥{{ MATERIALS.cotton.price }}/个</em>
        </span>
        <span class="num tp__coins">¥{{ cottonCoins }}</span>
        <Button size="sm" :disabled="progress.cotton <= 0" @click="sell('cotton')">卖</Button>
      </div>

      <div class="tp__row">
        <span class="tp__icon">{{ MATERIALS.ore.emoji }}</span>
        <span class="tp__body">
          <b>{{ MATERIALS.ore.name }}</b>
          <em class="muted">仓里 {{ progress.ore }} 个 · ¥{{ MATERIALS.ore.price }}/个</em>
        </span>
        <span class="num tp__coins">¥{{ oreCoins }}</span>
        <Button size="sm" :disabled="progress.ore <= 0" @click="sell('ore')">卖</Button>
      </div>

      <div class="tp__row">
        <span class="tp__icon">🐟</span>
        <span class="tp__body">
          <b>鱼</b>
          <em class="muted">
            鱼仓 {{ progress.fishBox.length }} 条<template v-if="topFish.length">
              · 最值钱的：{{ topFish.map((f) => f.name).join(' / ') }}</template
            >
          </em>
        </span>
        <span class="num tp__coins">¥{{ fishCoins }}</span>
        <Button size="sm" :disabled="progress.fishBox.length <= 0" @click="sell('fish')">
          卖
        </Button>
      </div>
    </div>

    <div class="tp__foot">
      <span class="muted">
        一共 <b class="num">¥{{ progress.materialValue }}</b> · 现在有
        <b class="num">¥{{ progress.coins }}</b>
      </span>
      <Button
        variant="primary"
        :disabled="progress.materialValue <= 0"
        @click="sell('all')"
      >
        💰 全卖 ¥{{ progress.materialValue }}
      </Button>
    </div>

    <p class="muted tp__note">
      材料都从这些地方来：🌾 农场采棉花（一朵 = 1 🧵）· ⛏️ 矿洞砸矿（越硬的矿给得越多：石头 1 /
      铁矿 2 / 金矿 4 / 钻石 10）· 🤿 潜水抓鱼（**踩上岸就进鱼仓**）。
      采集类的收入只在收购站到手（对局、晋级赛、每日任务那边给的金币不算），
      所以想攒钱买皮肤 / 升装备，就得往赚钱区跑一趟。
    </p>
  </div>
</template>

<style scoped>
.tp {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.tp__say {
  margin: 0;
  padding: 7px 11px;
  border-radius: var(--r-md);
  background: #fffdf4;
  border: 1px solid #d8c08a;
  color: #5a4415;
  font-size: 12px;
  line-height: 1.5;
}

.tp__rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tp__row {
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: 8px 10px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.tp__icon {
  flex: none;
  font-size: 22px;
  line-height: 1;
}

.tp__body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.tp__body b {
  font-size: 13px;
  color: var(--text);
}

.tp__body em {
  font-style: normal;
  font-size: 11px;
  line-height: 1.4;
}

.tp__coins {
  flex: none;
  min-width: 62px;
  text-align: right;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.tp__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s2);
  flex-wrap: wrap;
}

.tp__note {
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
}
</style>
