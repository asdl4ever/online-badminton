<script setup lang="ts">
import { computed } from 'vue';
import { VTextField } from 'vuetify/components';
import { useCustomizeStore } from '../stores/customize';
import { COLOR_PRESETS, EMOJI_PRESETS, HIT_STYLES, toHex } from '../game/cosmetics';
import { THEMES, THEME_IDS } from '../game/theme';

const store = useCustomizeStore();

const previewBg = computed(() => {
  const [sky, floor] = THEMES[store.theme].swatch;
  return {
    background: `linear-gradient(180deg, ${toHex(sky)} 0 58%, ${toHex(floor)} 58% 100%)`,
  };
});
</script>

<template>
  <div class="cz">
    <!-- left: live preview -->
    <div class="cz__preview" :style="previewBg">
      <div class="cz__scene">
        <svg class="cz__racket" viewBox="0 0 150 190" aria-hidden="true">
          <path
            class="cz__trail"
            d="M34 156 A 92 92 0 0 1 132 58"
            :stroke="store.trailHex"
          />
          <line class="cz__shaft" x1="62" y1="176" x2="76" y2="108" />
          <ellipse class="cz__frame" cx="86" cy="82" rx="24" ry="30" :stroke="store.racketHex" />
        </svg>
        <div class="cz__char">
          <div v-if="store.emoji" class="cz__emoji">{{ store.emoji }}</div>
          <div v-else class="cz__emoji cz__emoji--plain" />
          <div class="cz__body" />
        </div>
      </div>
      <span class="cz__badge">{{ THEMES[store.theme].label }}</span>
    </div>

    <!-- right: controls -->
    <div class="cz__controls">
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

      <p class="muted cz__note">外观只影响画面，不影响判定。联机时对手会看到你的这身装扮。</p>
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

.cz__preview {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: var(--r-lg);
  border: 1px solid var(--line);
  overflow: hidden;
  box-shadow: inset 0 1px 6px rgba(2, 6, 16, 0.08);
}

.cz__scene {
  position: absolute;
  inset: 0;
}

.cz__char {
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cz__emoji {
  font-size: 56px;
  line-height: 1;
  z-index: 2;
}

.cz__emoji--plain {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f0c49c;
  border: 2px solid rgba(0, 0, 0, 0.12);
}

.cz__body {
  width: 50px;
  height: 84px;
  margin-top: -8px;
  border-radius: 16px 16px 10px 10px;
  background: #2a7ad4;
  box-shadow: inset 0 -10px 0 rgba(0, 0, 0, 0.08);
}

.cz__racket {
  position: absolute;
  right: -8px;
  bottom: 40px;
  width: 62%;
  height: auto;
}

.cz__trail {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  opacity: 0.55;
}

.cz__shaft {
  stroke: #5b6b80;
  stroke-width: 9;
  stroke-linecap: round;
}

.cz__frame {
  fill: none;
  stroke-width: 6;
}

.cz__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 10px;
  border-radius: var(--r-pill);
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 12px;
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
  flex: 0 0 72px;
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

.cz__emoji-btn.is-active,
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

.cz__note {
  margin-top: var(--s2);
  font-size: 12px;
}

@media (max-width: 560px) {
  .cz {
    grid-template-columns: 1fr;
  }

  .cz__preview {
    aspect-ratio: 16 / 9;
    max-height: 220px;
  }
}
</style>
