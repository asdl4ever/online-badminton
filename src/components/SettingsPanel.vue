<script setup lang="ts">
import { computed, ref } from 'vue';
import { VSlider, VSwitch, VTextField } from 'vuetify/components';
import Button from './ui/Button.vue';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';
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
const lobby = useLobbyStore();
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

// ---- 清空存档：两步确认，输入「同意删除」才执行 ------------------------------
const wipeOpen = ref(false);
const wipeText = ref('');
/** 完全等于「同意删除」才允许确认（前后空格忽略） */
const wipeReady = computed(() => wipeText.value.trim() === '同意删除');

function cancelWipe(): void {
  wipeOpen.value = false;
  wipeText.value = '';
}

/** 删掉所有 bmt-* 存档键（进度 / 装扮 / 好友 / 成就统计…）然后整页刷新 */
function wipeSave(): void {
  if (!wipeReady.value) return;
  const removed: string[] = [];
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith('bmt-')) {
      removed.push(key);
      localStorage.removeItem(key);
    }
  }
  if (!removed.length) {
    toastBad('没有找到任何存档');
    cancelWipe();
    return;
  }
  sfx.click();
  toastGood(`已清空 ${removed.length} 项存档，页面即将刷新`);
  window.setTimeout(() => window.location.reload(), 700);
}

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
      <h4 class="set__title">联机</h4>
      <VSwitch
        :model-value="lobby.allowJoin"
        color="primary"
        hide-details
        label="允许好友直接加入我"
        @update:model-value="lobby.setAllowJoin(!!$event)"
      />
      <p class="muted set__hint">
        默认开着：好友在「好友」列表里点「加入」就能直接来到你所在的模式（大世界 / 对局 /
        海湾 / 矿洞），不需要你点头。关掉后他们那边的「加入」会置灰并写明原因，
        仍然可以用「邀请」把房号发给你。
      </p>
    </section>

    <section class="set__block">
      <h4 class="set__title">提示</h4>
      <ul class="set__list muted">
        <li>角色形象在「背包 → 角色形象」里换，U熊的肚皮能把球弹回去。</li>
        <li>所有进度都存在本机浏览器里，换了设备不会同步。</li>
      </ul>
    </section>

    <section class="set__block set__danger">
      <h4 class="set__title">清空存档</h4>
      <p class="muted set__hint">
        会删掉本机保存的<b>全部进度</b>：金币、装扮、宠物、段位、成就、好友……删了就找不回来。
        点击后需要输入「<b>同意删除</b>」四个字才会执行。
      </p>
      <Button v-if="!wipeOpen" size="sm" variant="quiet" @click="wipeOpen = true">清空存档…</Button>
      <template v-else>
        <div class="set__row">
          <VTextField
            v-model="wipeText"
            class="soft-field set__input"
            placeholder="输入：同意删除"
            maxlength="12"
            hide-details
            autocapitalize="off"
            autocomplete="off"
            @keyup.enter="wipeSave"
          />
          <Button size="sm" variant="primary" :disabled="!wipeReady" @click="wipeSave">确认清空</Button>
          <Button size="sm" variant="quiet" @click="cancelWipe">取消</Button>
        </div>
        <p class="muted set__hint">输入框里是「{{ wipeText || '　' }}」——只有完全等于「同意删除」才会亮起确认按钮。</p>
      </template>
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

.set__danger {
  border-color: color-mix(in srgb, #d05a4a 55%, var(--line));
  background: color-mix(in srgb, #d05a4a 6%, var(--surface-2));
}
</style>
