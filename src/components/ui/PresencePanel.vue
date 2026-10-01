<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import Button from './Button.vue';
import type { PresencePlayer } from '../../stores/presence';

withDefaults(
  defineProps<{
    players: PresencePlayer[];
    /** 正在观战的玩家 id（null = 在玩自己的） */
    watching?: string | null;
  }>(),
  { watching: null },
);

const emit = defineEmits<{
  join: [PresencePlayer];
  watch: [PresencePlayer];
}>();

/** 面板收起状态也记在本机 */
const hidden = useLocalStorage('bmt-presence-hidden', false);
</script>

<template>
  <aside class="presence" :class="{ 'is-hidden': hidden }">
    <div class="presence__head">
      <span class="presence__title">在线玩家 · {{ players.length }}</span>
      <button
        class="icon-btn jelly"
        type="button"
        title="收起玩家列表"
        aria-label="收起玩家列表"
        @click="hidden = true"
      >
        ‹
      </button>
    </div>

    <div class="presence__list stagger">
      <div v-for="p in players" :key="p.id" class="presence__row">
        <!-- 第一行两列：名字 | 正在玩的模式 -->
        <div class="presence__top">
          <span class="presence__who">
            <i class="presence__dot" />
            <span>{{ p.name }}</span>
          </span>
          <span class="presence__mode">{{ p.icon }} {{ p.mode || '在地图上' }}</span>
        </div>

        <!-- 第二行两列：申请加入 / 观战（就在你旁边的人不需要这两个按钮） -->
        <div v-if="!p.nearby" class="presence__actions">
          <Button
            size="sm"
            :variant="watching === p.id ? 'default' : 'default'"
            :disabled="!p.joinable || p.pending || p.joined"
            @click="emit('join', p)"
          >
            {{ p.joined ? '已加入' : p.pending ? '等待同意…' : '申请加入' }}
          </Button>
          <Button size="sm" :disabled="!p.mode" @click="emit('watch', p)">
            {{ watching === p.id ? '观战中' : '观战' }}
          </Button>
        </div>
      </div>

      <p v-if="!players.length" class="presence__empty">
        还没有好友在线 · 在左上角「模式设置」或右上角「好友」里加上好友，他们一上线就会出现在这里
      </p>
    </div>
  </aside>

  <!-- 收起后左边缘留一个小箭头，点它再展开 -->
  <button
    v-if="hidden"
    class="presence__ghost icon-btn jelly"
    type="button"
    title="显示在线玩家"
    aria-label="显示在线玩家"
    @click="hidden = false"
  >
    ›
  </button>
</template>

<style scoped>
.presence__empty {
  margin: 0;
  font-size: var(--ui-font-xs);
  color: var(--text-dim);
}

.presence__ghost {
  position: absolute;
  left: max(var(--s2), env(safe-area-inset-left));
  /* 收起的箭头也排在左上角那排按钮下面 */
  top: calc(env(safe-area-inset-top) + var(--s2) + var(--ui-top-h) + 6px);
  z-index: 27;
}
</style>
