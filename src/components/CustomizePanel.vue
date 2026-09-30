<script setup lang="ts">
import { VTextField } from 'vuetify/components';
import Panel from './ui/Panel.vue';
import { useCustomizeStore } from '../stores/customize';
import { COLOR_PRESETS, EMOJI_PRESETS, HIT_STYLES, toHex } from '../game/cosmetics';
import { THEMES, THEME_IDS } from '../game/theme';

const store = useCustomizeStore();
</script>

<template>
  <Panel>
    <h3 style="margin-bottom: var(--s3)">外观自定义</h3>

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
            class="cz__emoji"
            :class="{ 'is-active': store.emoji === e }"
            type="button"
            @click="store.emoji = e"
          >
            {{ e }}
          </button>
          <button
            class="cz__emoji"
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

    <div class="cz__row">
      <label class="cz__label">命中特效</label>
      <div class="cz__control">
        <button
          v-for="s in HIT_STYLES"
          :key="s.id"
          class="cz__option"
          :class="{ 'is-active': store.effect === s.id }"
          type="button"
          @click="store.effect = s.id"
        >
          {{ s.label }}
        </button>
      </div>
    </div>

    <div class="cz__row">
      <label class="cz__label">球场主题</label>
      <div class="cz__control">
        <button
          v-for="id in THEME_IDS"
          :key="id"
          class="cz__theme"
          :class="{ 'is-active': store.theme === id }"
          type="button"
          @click="store.theme = id"
        >
          <span
            class="cz__theme-swatch"
            :style="{
              background: `linear-gradient(180deg, ${toHex(THEMES[id].swatch[0])} 55%, ${toHex(
                THEMES[id].swatch[1],
              )} 55%)`,
            }"
          />
          {{ THEMES[id].label }}
        </button>
      </div>
    </div>

    <label class="cz__toggle">
      <input v-model="store.autoCycle" type="checkbox" />
      <span>每局结束自动换一个球场主题</span>
    </label>

    <p class="muted" style="margin-top: var(--s3); font-size: 12px">
      外观只影响画面，不影响判定。联机时对手会看到你的这身装扮。
    </p>
  </Panel>
</template>

<style scoped>
.cz__row {
  display: flex;
  gap: var(--s4);
  align-items: flex-start;
  padding: var(--s3) 0;
  border-top: 1px solid var(--line);
}

.cz__row:first-of-type {
  border-top: none;
}

.cz__label {
  flex: 0 0 76px;
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

.cz__emoji-field {
  flex: 0 0 160px;
  max-width: 160px;
}

.cz__swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cz__emoji {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--surface-2);
  font-size: 19px;
  line-height: 1;
  cursor: pointer;
}

.cz__emoji.is-active,
.cz__option.is-active,
.cz__theme.is-active {
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

.cz__option,
.cz__theme {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
}

.cz__theme {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.cz__theme-swatch {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid var(--line-strong);
}

.cz__toggle {
  display: flex;
  align-items: center;
  gap: var(--s2);
  margin-top: var(--s3);
  font-size: 13px;
  color: var(--text-dim);
  cursor: pointer;
}
</style>
