import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import {
  POINT_RULES,
  TIERS,
  nextTier,
  tierForPoints,
  tierProgress,
  type PlayMode,
  type TierId,
} from '../game/ranks';

/**
 * Rank ladder, stored locally. Cumulative points — never deducted — so it
 * only ever goes up. Claiming a tier unlocks the cosmetic options gated on it
 * (see cosmetics.ts).
 */
export const useProgressStore = defineStore('progress', () => {
  const points = useLocalStorage('bmt-points', 0);
  const claimed = useLocalStorage<TierId[]>('bmt-claimed', []);
  const notice = ref('');
  let noticeTimer: number | undefined;

  const tier = computed(() => tierForPoints(points.value));
  const next = computed(() => nextTier(points.value));
  const progress = computed(() => tierProgress(points.value));
  const claimable = computed(() =>
    TIERS.filter((t) => points.value >= t.points && !claimed.value.includes(t.id)),
  );

  function isClaimed(id: TierId): boolean {
    return claimed.value.includes(id);
  }

  /** a cosmetic option is usable if it has no gate, or its tier was claimed */
  function isUnlocked(unlock?: TierId): boolean {
    return !unlock || claimed.value.includes(unlock);
  }

  function pushNotice(text: string): void {
    notice.value = text;
    if (noticeTimer) window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => {
      notice.value = '';
    }, 4200);
  }

  function recordResult(win: boolean, mode: PlayMode): void {
    const rule = POINT_RULES[mode];
    const gain = win ? rule.win : rule.lose;
    const before = tierForPoints(points.value).id;
    points.value = Math.max(0, points.value + gain);
    const after = tierForPoints(points.value);
    if (after.id !== before) {
      pushNotice(`+${gain} 积分 · 晋级 ${after.label}！可领取奖励`);
    } else {
      pushNotice(`+${gain} 积分`);
    }
  }

  function claim(id: TierId): void {
    const t = TIERS.find((x) => x.id === id);
    if (!t || points.value < t.points || claimed.value.includes(id)) return;
    claimed.value = [...claimed.value, id];
    pushNotice(`已领取 ${t.label} 奖励：${t.reward}`);
  }

  return {
    points,
    claimed,
    notice,
    tier,
    next,
    progress,
    claimable,
    isClaimed,
    isUnlocked,
    recordResult,
    claim,
  };
});
