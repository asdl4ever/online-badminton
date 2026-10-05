<script setup lang="ts">
import { computed } from 'vue';
import AppModal from './ui/AppModal.vue';
import ItemIcon from './ItemIcon.vue';
import Stars from './ui/Stars.vue';
import Button from './ui/Button.vue';
import CharacterPreview from './CharacterPreview.vue';
import ItemPreviewStage from './ItemPreviewStage.vue';
import { SLOT_LABELS, wearItem, type Item } from '../game/items';
import { useCustomizeStore } from '../stores/customize';

/**
 * 🛍️ 商店试穿确认弹窗：点货架上的商品先弹这个——
 * 左边（大图）演出「装备在角色身上的效果」，确认后才真正扣钱购买。
 * 动作类部位（拖尾 / 挥拍拖尾 / 命中特效）静穿看不见，走 ItemPreviewStage 演动作。
 */
const props = defineProps<{
  /** 要试穿的商品（null = 弹窗关闭） */
  item: Item | null;
  /** 价格行文案（如「🪙 200」/「🏅 800」/「🧩 120」） */
  priceLabel: string;
  /** 已拥有时按钮置灰（金币店已拥有的根本不弹） */
  owned?: boolean;
}>();

const emit = defineEmits<{ close: []; confirm: [] }>();

const customize = useCustomizeStore();

const IN_GAME_ONLY: Item['slot'][] = ['trail', 'swingTrail', 'effect'];

/** 试穿的这一身 = 自己现在穿的 + 这件商品 */
const previewCos = computed(() =>
  props.item ? wearItem(customize.cosmetic, props.item) : customize.cosmetic,
);
</script>

<template>
  <AppModal
    :model-value="!!item"
    :title="item ? `试穿 · ${item.label}` : '试穿'"
    max-width="520px"
    @update:model-value="emit('close')"
  >
    <div v-if="item" class="tsm">
      <div class="tsm__stage">
        <ItemPreviewStage
          v-if="IN_GAME_ONLY.includes(item.slot)"
          :cosmetic="previewCos"
          :slot="item.slot"
        />
        <CharacterPreview v-else :cosmetic="previewCos" />
      </div>

      <div class="tsm__info">
        <span class="tsm__icon"><ItemIcon :item="item" /></span>
        <div class="tsm__meta">
          <b class="tsm__label">{{ item.label }}</b>
          <Stars class="tsm__stars" :value="item.stars" />
          <span class="muted">{{ SLOT_LABELS[item.slot] }} · 装备后如左图所示</span>
        </div>
        <span class="tsm__price num">{{ priceLabel }}</span>
      </div>

      <div class="tsm__actions">
        <Button variant="quiet" @click="emit('close')">再想想</Button>
        <Button
          variant="primary"
          :disabled="owned"
          @click="emit('confirm')"
        >
          {{ owned ? '已拥有' : '就买这件' }}
        </Button>
      </div>
    </div>
  </AppModal>
</template>

<style scoped>
.tsm {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.tsm__stage {
  display: flex;
  justify-content: center;
}

.tsm__info {
  display: flex;
  align-items: center;
  gap: var(--s3);
}

.tsm__icon {
  width: 64px;
  height: 64px;
  flex: none;
}

.tsm__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.tsm__label {
  font-size: 15px;
}

.tsm__stars {
  font-size: 11px;
}

.tsm__meta .muted {
  font-size: 12px;
}

.tsm__price {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.tsm__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--s2);
}
</style>
