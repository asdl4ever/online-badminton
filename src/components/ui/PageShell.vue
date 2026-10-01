<script setup lang="ts">
import { useSlots } from 'vue';
import { useLocalStorage } from '@vueuse/core';

/**
 * 所有对局页共用的外壳：固定 44px 顶栏 + 自适应铺满的画面区 +
 * 右上角一排横向小图标 + 右侧功能坞 + 底部比分行。
 *
 * 尺寸全部走 `--ui-*` 固定像素（桌面/手机一致，不随屏幕缩放），
 * 外观是奶黄 Liquid Glass，按下有果冻回弹（见 style.css 的 .jelly）。
 */
withDefaults(
  defineProps<{
    title?: string;
    /** 顶栏左侧返回按钮，没有就不显示 */
    back?: boolean;
    /** 是否允许把顶栏整条收起来（收起后只剩右上角的图标行） */
    collapsible?: boolean;
  }>(),
  { title: '', back: false, collapsible: true },
);

const emit = defineEmits<{ back: [] }>();

const slots = useSlots();
const hasFoot = () => !!slots.foot;

/** 顶栏收起状态与图标行的铺开状态都记在本机 */
const barHidden = useLocalStorage('bmt-ui-bar-hidden', false);
const iconsOpen = useLocalStorage('bmt-ui-icons-open', true);
</script>

<template>
  <div class="shell-ui">
    <header v-show="!barHidden" class="shell-ui__bar">
      <button
        v-if="back"
        class="icon-btn jelly"
        type="button"
        aria-label="返回"
        title="返回"
        @click="emit('back')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M15 5 8 12l7 7"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="shell-ui__title">{{ title }}</div>
      <slot name="bar-actions" />
      <button
        v-if="collapsible"
        class="icon-btn jelly"
        type="button"
        :title="barHidden ? '展开顶栏' : '收起顶栏'"
        :aria-label="barHidden ? '展开顶栏' : '收起顶栏'"
        @click="barHidden = !barHidden"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            :d="barHidden ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </header>

    <div class="shell-ui__main">
      <slot name="stage" />

      <!-- 右上角：一排横向小图标，收起时只留一个箭头 -->
      <div
        class="hud-icons"
        :class="{ 'is-collapsed': !iconsOpen }"
        :style="{
          /* 图标行在内容区里（顶栏之下），所以顶栏可见时不需要再加一条顶栏高度 */
          top: barHidden ? 'calc(env(safe-area-inset-top) + var(--s2))' : 'var(--s2)',
        }"
      >
        <div class="hud-icons__row">
          <slot name="icons" />
          <button
            class="icon-btn jelly icon-btn--toggle"
            type="button"
            :title="iconsOpen ? '收起图标' : '展开功能'"
            :aria-label="iconsOpen ? '收起图标' : '展开功能'"
            @click="iconsOpen = !iconsOpen"
          >
            {{ iconsOpen ? '›' : '‹' }}
          </button>
        </div>
      </div>

      <slot name="dock" />
      <slot name="overlay" />
    </div>

    <div v-if="hasFoot()" class="hud-foot">
      <slot name="foot" />
    </div>
  </div>
</template>
