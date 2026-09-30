import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import {
  fromHex,
  type AuraId,
  type Cosmetic,
  type HitStyle,
  type RacketSkinId,
  type TitleId,
  type WingId,
} from '../game/cosmetics';
import type { ThemeId } from '../game/theme';

/**
 * The player's look, stored locally and applied to both single and online
 * games. Purely cosmetic — the opponent receives it over the match handshake
 * just so their client can draw us the same way.
 */
export const useCustomizeStore = defineStore('customize', () => {
  const emoji = useLocalStorage('bmt-emoji', '🙂');
  const racketHex = useLocalStorage('bmt-racket', '#44586f');
  const trailHex = useLocalStorage('bmt-trail', '#6f9fce');
  const effect = useLocalStorage<HitStyle>('bmt-effect', 'ring');
  const wings = useLocalStorage<WingId>('bmt-wings', 'none');
  const aura = useLocalStorage<AuraId>('bmt-aura', 'none');
  const racketSkin = useLocalStorage<RacketSkinId>('bmt-racket-skin', 'default');
  const title = useLocalStorage<TitleId>('bmt-title', 'none');
  const theme = useLocalStorage<ThemeId>('bmt-theme', 'day');
  /** rotate the court theme automatically once a match is over */
  const autoCycle = useLocalStorage('bmt-theme-auto', true);

  const cosmetic = computed<Cosmetic>(() => ({
    emoji: emoji.value,
    racket: fromHex(racketHex.value),
    trail: fromHex(trailHex.value),
    effect: effect.value,
    wings: wings.value,
    aura: aura.value,
    racketSkin: racketSkin.value,
    title: title.value,
  }));

  return {
    emoji,
    racketHex,
    trailHex,
    effect,
    wings,
    aura,
    racketSkin,
    title,
    theme,
    autoCycle,
    cosmetic,
  };
});
