<script setup lang="ts">
import { computed, ref } from 'vue';
import { VSlider, VSwitch, VTextField } from 'vuetify/components';
import Button from './ui/Button.vue';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { toastBad, toastGood } from '../composables/useToast';
import { celebrate } from '../composables/celebrate';
import { useJoystickPrefs } from '../composables/useJoystick';
import { sfx } from '../game/audio';
import { RARITY_META, type Rarity } from '../game/items';
import type { CharacterSkin } from '../game/cosmetics';

/**
 * 设置：兑换码 + 全局操作开关（摇杆常显 / 自由摇杆 / 摇杆大小）。
 * 码表在 `stores/progress.ts` 的 `REDEEM_CODES`（例：`ux7891` → U熊皮肤），
 * 一个码只能用一次，换到的东西直接进收藏（和宝箱一样），角色形象会顺手穿上。
 */
const progress = useProgressStore();
const customize = useCustomizeStore();
const {
  always: joyAlways,
  setAlways: setJoyAlways,
  free: joyFree,
  setFree: setJoyFree,
  scale: joyScale,
  setScale: setJoyScale,
} = useJoystickPrefs();

const code = ref('');
const unlocked = ref<{ label: string; rarity: Rarity } | null>(null);

const redeemedCount = computed(() => progress.redeemed.length);

function submit(): void {
  const res = progress.redeem(code.value);
  if (!res.ok) {
    sfx.click();
    toastBad(res.message);
    return;
  }
  const item = res.item;
  unlocked.value = { label: item.label, rarity: item.rarity };
  code.value = '';
  sfx.win();
  celebrate(3, ['#8b5a2b', '#f0cf9e', '#ffd45c']);
  toastGood(`兑换成功：「${item.label}」已放进背包`);
  // 换到的是角色形象就直接穿上，省得再去背包找
  if (item.slot === 'skin') customize.characterSkin = item.ref as CharacterSkin;
}
</script>

<template>
  <div class="set">
    <section class="set__block">
      <h4 class="set__title">兑换码</h4>
      <div class="set__row">
        <VTextField
          v-model="code"
          class="soft-field set__input"
          placeholder="输入兑换码"
          maxlength="24"
          hide-details
          autocapitalize="off"
          autocomplete="off"
          @keyup.enter="submit"
        />
        <Button size="sm" variant="primary" @click="submit">兑换</Button>
      </div>
      <p class="muted set__hint">
        兑换码区分大小写以外都不挑，空格也会自动忽略；换到的东西会直接进背包，角色形象会顺手穿上。
      </p>
      <p v-if="redeemedCount" class="muted set__hint">已经兑换过 {{ redeemedCount }} 个码</p>

      <div v-if="unlocked" class="set__prize" :style="{ borderColor: RARITY_META[unlocked.rarity].color }">
        <span class="set__prize-dot" :style="{ background: RARITY_META[unlocked.rarity].color }" />
        <b>{{ unlocked.label }}</b>
        <span class="muted">{{ RARITY_META[unlocked.rarity].label }}</span>
      </div>
    </section>

    <section class="set__block">
      <h4 class="set__title">操作</h4>
      <VSwitch
        :model-value="joyAlways"
        color="primary"
        hide-details
        label="桌面端也显示虚拟摇杆"
        @update:model-value="setJoyAlways(!!$event)"
      />
      <VSwitch
        :model-value="joyFree"
        color="primary"
        hide-details
        label="自由摇杆（左侧按下才出现，松手消失）"
        @update:model-value="setJoyFree(!!$event)"
      />
      <div class="set__slider">
        <span class="set__slider-label">摇杆大小</span>
        <VSlider
          :model-value="joyScale"
          :min="0.7"
          :max="1.5"
          :step="0.05"
          color="primary"
          thumb-label
          hide-details
          @update:model-value="setJoyScale(Number($event))"
        />
      </div>
      <p class="muted set__hint">
        自由摇杆：大地图 / 商店 / 宠物店在左侧区域按下，摇杆出现在手指下，松手消失；
        比赛里是左半屏（右半屏仍然是瞄准球拍）。大小对全部摇杆生效（比赛下一局生效）。
        比赛里把左摇杆往上推仍然是<b>起跳</b>，操作逻辑没有变化。
      </p>
      <p class="muted set__hint">
        「桌面端也显示虚拟摇杆」：触屏设备始终显示；打开后电脑上也在大地图 / 商店 /
        宠物店 / 比赛 / 矿洞 / 农场 / 潜水常显摇杆（比赛场景下一局生效）。
      </p>
    </section>

    <section class="set__block">
      <h4 class="set__title">提示</h4>
      <ul class="set__list muted">
        <li>角色形象在「背包 → 角色形象」里换，U熊的肚皮能把球弹回去。</li>
        <li>所有进度都存在本机浏览器里，换了设备不会同步。</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.set {
  display: flex;
  flex-direction: column;
  gap: var(--s4);
}

.set__block {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  padding: var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.set__title {
  margin: 0;
  font-size: 14px;
  color: var(--text);
}

.set__row {
  display: flex;
  align-items: center;
  gap: var(--s2);
}

.set__input {
  flex: 1 1 auto;
  min-width: 0;
}

.set__hint {
  margin: 0;
  font-size: 12px;
}

.set__slider {
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: 0 var(--s1);
}

.set__slider-label {
  flex: none;
  font-size: 13px;
  color: var(--text);
}

.set__list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.set__prize {
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: var(--s2) var(--s3);
  border-radius: var(--r-md);
  border: 2px solid var(--line);
  background: var(--surface);
}

.set__prize-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>
