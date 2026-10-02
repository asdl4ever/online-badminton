import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import {
  fromHex,
  type AuraId,
  type CapeId,
  type CharacterSkin,
  type Cosmetic,
  type HatId,
  type HitStyle,
  type PetId,
  type   RacketSkinId,
  type RingId,
  type SwingTrailId,
  type TrailId,
  type WingId,
} from '../game/cosmetics';
import type { ThemeId } from '../game/theme';
import { useProgressStore } from './progress';

/**
 * The player's look, stored locally and applied to both single and online
 * games. Purely cosmetic — the opponent receives it over the match handshake
 * just so their client can draw us the same way.
 */
export const useCustomizeStore = defineStore('customize', () => {
  const progress = useProgressStore();
  const characterSkin = useLocalStorage<CharacterSkin>('bmt-skin', 'none');
  const emoji = useLocalStorage('bmt-emoji', '🙂');
  const racketHex = useLocalStorage('bmt-racket', '#44586f');
  const trailHex = useLocalStorage('bmt-trail', '#6f9fce');
  const effect = useLocalStorage<HitStyle>('bmt-effect', 'ring');
  const wings = useLocalStorage<WingId>('bmt-wings', 'none');
  const cape = useLocalStorage<CapeId>('bmt-cape', 'none');
  const aura = useLocalStorage<AuraId>('bmt-aura', 'none');
  const hat = useLocalStorage<HatId>('bmt-hat', 'none');
  const ring = useLocalStorage<RingId>('bmt-ring', 'none');
  const pet = useLocalStorage<PetId>('bmt-pet', 'none');
  const racketSkin = useLocalStorage<RacketSkinId>('bmt-racket-skin', 'default');
  const trailStyle = useLocalStorage<TrailId>('bmt-trail-style', 'classic');
  const swingTrail = useLocalStorage<SwingTrailId>('bmt-swing-trail', 'none');
  const theme = useLocalStorage<ThemeId>('bmt-theme', 'day');
  /** rotate the court theme automatically once a match is over */
  const autoCycle = useLocalStorage('bmt-theme-auto', true);

  const cosmetic = computed<Cosmetic>(() => ({
    characterSkin: characterSkin.value,
    emoji: emoji.value,
    racket: fromHex(racketHex.value),
    trail: fromHex(trailHex.value),
    effect: effect.value,
    wings: wings.value,
    cape: cape.value,
    aura: aura.value,
    hat: hat.value,
    ring: ring.value,
    pet: pet.value,
    petStar: pet.value === 'none' ? 1 : progress.petStar(pet.value) || 1,
    racketSkin: racketSkin.value,
    trailStyle: trailStyle.value,
    swingTrail: swingTrail.value,
  }));

  return {
    characterSkin,
    emoji,
    racketHex,
    trailHex,
    effect,
    wings,
    cape,
    aura,
    hat,
    ring,
    pet,
    racketSkin,
    trailStyle,
    swingTrail,
    theme,
    autoCycle,
    cosmetic,
  };
});
