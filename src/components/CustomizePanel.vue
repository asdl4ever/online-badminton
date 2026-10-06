<script setup lang="ts">
import { computed, ref } from 'vue';
import { VTextField } from 'vuetify/components';
import CharacterPreview from './CharacterPreview.vue';
import { useCustomizeStore } from '../stores/customize';
import { COLOR_PRESETS, EMOJI_PRESETS, toHex } from '../game/cosmetics';
import { isSingleBack } from '../game/draw/wings';
import { getBackTune, setBackTune } from '../game/backTune';

const store = useCustomizeStore();

/** 背挂逐件微调：当前装备的背部是「单件背挂物件」时，可以调画层与水平位置 */
const ver = ref(0); // 手动版本号：调参改的是 localStorage，用它让 computed 重新读
const backId = computed(() => store.cosmetic.back);
const tunable = computed(() => {
  ver.value;
  return backId.value !== 'none' && isSingleBack(backId.value);
});
const tune = computed(() => {
  ver.value;
  return getBackTune(backId.value);
});

function retune(patch: { front?: boolean; ox?: number }): void {
  const cur = getBackTune(backId.value);
  setBackTune(backId.value, {
    front: patch.front ?? cur.front,
    ox: Math.max(-40, Math.min(40, patch.ox ?? cur.ox)),
  });
  ver.value++;
}
</script>

<template>
  <div class="cz">
    <CharacterPreview />

    <div class="cz__controls">
      <div
        v-if="tunable"
        class="cz__row"
      >
        <label class="cz__label">背挂调整</label>
        <div class="cz__control cz__tune">
          <button
            class="cz__tune-btn"
            :class="{ 'is-front': tune.front }"
            type="button"
            :title="tune.front ? '当前：画在身前（点击切回身后）' : '当前：画在身后（点击移到身前，不被身体挡住）'"
            @click="retune({ front: !tune.front })"
          >
            {{ tune.front ? '身前' : '身后' }}
          </button>
          <button
            class="cz__tune-btn"
            type="button"
            title="向左移"
            @click="retune({ ox: tune.ox - 2 })"
          >
            ←
          </button>
          <span class="cz__ox num">{{ tune.ox > 0 ? `+${tune.ox}` : tune.ox }}</span>
          <button
            class="cz__tune-btn"
            type="button"
            title="向右移"
            @click="retune({ ox: tune.ox + 2 })"
          >
            →
          </button>
          <button
            v-if="tune.ox !== 0 || tune.front"
            class="cz__tune-btn cz__tune-reset"
            type="button"
            title="恢复默认"
            @click="retune({ front: false, ox: 0 })"
          >
            ↺
          </button>
        </div>
      </div>

      <div class="cz__row">
        <label class="cz__label">角色表情</label>
        <div class="cz__control">
          <VTextField
            v-model="store.emoji"
            class="soft-field cz__emoji-field"
            placeholder="输入或粘贴 emoji"
            maxlength="4"
            hide-details
          />
          <div class="cz__swatches">
            <button
              v-for="e in EMOJI_PRESETS"
              :key="e"
              class="cz__emoji-btn"
              :class="{ 'is-active': store.emoji === e }"
              type="button"
              @click="store.emoji = e"
            >
              {{ e }}
            </button>
            <button
              class="cz__emoji-btn"
              :class="{ 'is-active': store.emoji === '' }"
              type="button"
              title="使用默认头型"
              @click="store.emoji = ''"
            >
              ⬜
            </button>
          </div>
        </div>
      </div>

      <div class="cz__row">
        <label class="cz__label">球拍颜色</label>
        <div class="cz__control">
          <input v-model="store.racketHex" type="color" class="cz__color" />
          <span class="num cz__hex">{{ store.racketHex }}</span>
          <div class="cz__swatches">
            <button
              v-for="c in COLOR_PRESETS"
              :key="`r${c}`"
              class="cz__chip"
              :style="{ background: toHex(c) }"
              type="button"
              @click="store.racketHex = toHex(c)"
            />
          </div>
        </div>
      </div>

      <div class="cz__row">
        <label class="cz__label">拖尾颜色</label>
        <div class="cz__control">
          <input v-model="store.trailHex" type="color" class="cz__color" />
          <span class="num cz__hex">{{ store.trailHex }}</span>
          <div class="cz__swatches">
            <button
              v-for="c in COLOR_PRESETS"
              :key="`t${c}`"
              class="cz__chip"
              :style="{ background: toHex(c) }"
              type="button"
              @click="store.trailHex = toHex(c)"
            />
          </div>
        </div>
      </div>

      <p class="muted cz__note">
        外观只影响画面，不影响判定。头饰 / 翅膀 / 披风 / 背景 / 宠物 / 球拍皮肤 / 拖尾 / 特效请在「背包」里装备。
      </p>
    </div>
  </div>
</template>

<style scoped>
.cz {
  display: grid;
  grid-template-columns: minmax(180px, 260px) 1fr;
  gap: var(--s5);
  align-items: start;
}

.cz__controls {
  min-width: 0;
}

.cz__row {
  display: flex;
  gap: var(--s4);
  align-items: flex-start;
  padding: var(--s3) 0;
  border-top: 1px solid var(--line);
}

.cz__row:first-child {
  border-top: none;
  padding-top: 0;
}

.cz__label {
  flex: 0 0 66px;
  font-size: 13px;
  color: var(--text-dim);
  padding-top: 10px;
}

.cz__control {
  flex: 1 1 auto;
  display: flex;
  flex-wrap: wrap;
  gap: var(--s3);
  align-items: center;
}

.cz__tune {
  gap: 8px;
}

.cz__tune-btn {
  height: 36px;
  min-width: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--surface-2);
  font-size: 14px;
  cursor: pointer;
}

.cz__tune-btn.is-front {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent);
}

.cz__tune-reset {
  color: var(--text-dim);
}

.cz__ox {
  min-width: 34px;
  text-align: center;
  font-size: 12px;
  color: var(--text-dim);
}

.cz__emoji-field {
  flex: 0 0 150px;
  max-width: 150px;
}

.cz__swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cz__emoji-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--surface-2);
  font-size: 19px;
  line-height: 1;
  cursor: pointer;
}

.cz__emoji-btn.is-active {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent);
}

.cz__color {
  width: 44px;
  height: 36px;
  padding: 2px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface-2);
  cursor: pointer;
}

.cz__hex {
  font-size: 12px;
  color: var(--text-dim);
  letter-spacing: 1px;
}

.cz__chip {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: 1px solid var(--line-strong);
  cursor: pointer;
}

.cz__note {
  margin-top: var(--s2);
  font-size: 12px;
}

@media (max-width: 560px) {
  .cz {
    grid-template-columns: 1fr;
  }
}
</style>
