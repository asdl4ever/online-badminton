import { defineStore } from 'pinia';
import { computed, watchEffect } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { petBonusOf } from '../game/pets';
import {
  fromHex,
  isWingFamily,
  type AuraId,
  type BackId,
  type CharacterSkin,
  type Cosmetic,
  type HatId,
  type HitStyle,
  type PetFollow,
  type PetId,
  type PetSide,
  type   RacketSkinId,
  type MountId,
  type RingId,
  type SwingTrailId,
  type TrailId,
} from '../game/cosmetics';
import { useProgressStore } from './progress';

/**
 * 🧥 旧存档迁移：把合并前的 `bmt-wings` / `bmt-cape`（VueUse 的 JSON 串）读出来，
 * 两者都非空时**保留翅膀**，迁移完删掉旧 key。没有旧档就返回 'none'。
 */
function migrateBackEquip(): BackId {
  try {
    const read = (key: string): string | null => {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      try {
        const v = JSON.parse(raw);
        return typeof v === 'string' && v !== 'none' ? v : null;
      } catch {
        return raw !== 'none' ? raw : null;
      }
    };
    const wing = read('bmt-wings');
    const cape = read('bmt-cape');
    localStorage.removeItem('bmt-wings');
    localStorage.removeItem('bmt-cape');
    if (wing && isWingFamily(wing as BackId)) return wing as BackId;
    if (cape && !isWingFamily(cape as BackId)) return cape as BackId;
  } catch {
    /* SSR / 隐私模式等没有 localStorage 的场合静默跳过 */
  }
  return 'none';
}

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
  /**
   * 🧥 背部装饰（原翅膀 + 披风合并）：
   * 旧存档分别记在 `bmt-wings` / `bmt-cape`（VueUse 存的是 JSON 串）。
   * 迁移规则：两个都装了时**保留翅膀**，只装了披风就迁披风。
   */
  const back = useLocalStorage<BackId>('bmt-back', migrateBackEquip());
  const aura = useLocalStorage<AuraId>('bmt-aura', 'none');
  const hat = useLocalStorage<HatId>('bmt-hat', 'none');
  const ring = useLocalStorage<RingId>('bmt-ring', 'none');
  const pet = useLocalStorage<PetId>('bmt-pet', 'none');
  /** 🐾 宠物怎么跟着你（肩旁悬浮 / 贴地跟在身后 / 站在脚边不动）+ 在左还是右 */
  const petFollow = useLocalStorage<PetFollow>('bmt-pet-follow', 'shoulder');
  const petSide = useLocalStorage<PetSide>('bmt-pet-side', 'right');
  const racketSkin = useLocalStorage<RacketSkinId>('bmt-racket-skin', 'default');
  const trailStyle = useLocalStorage<TrailId>('bmt-trail-style', 'classic');
  const swingTrail = useLocalStorage<SwingTrailId>('bmt-swing-trail', 'none');
  /** 坐骑（荣誉商店兑换，纯装饰） */
  const mount = useLocalStorage<MountId>('bmt-mount', 'none');

  const cosmetic = computed<Cosmetic>(() => ({
    characterSkin: characterSkin.value,
    emoji: emoji.value,
    racket: fromHex(racketHex.value),
    trail: fromHex(trailHex.value),
    effect: effect.value,
    back: back.value,
    aura: aura.value,
    hat: hat.value,
    ring: ring.value,
    pet: pet.value,
    petStar: pet.value === 'none' ? 1 : progress.petStar(pet.value) || 1,
    petFollow: petFollow.value,
    petSide: petSide.value,
    racketSkin: racketSkin.value,
    trailStyle: trailStyle.value,
    swingTrail: swingTrail.value,
    mount: mount.value,
  }));

  /**
   * 🐾 宠物加成：**只算当前装备的那一只**（星级越高越强，见 `game/pets.ts`）。
   * 这里算好写进 progress，金币 / 经验的入账函数直接读，
   * 省得两个 store 互相 import 绕成环。
   */
  watchEffect(() => {
    progress.setPetBonus(petBonusOf(pet.value, cosmetic.value.petStar));
  });

  return {
    characterSkin,
    emoji,
    racketHex,
    trailHex,
    effect,
    back,
    aura,
    hat,
    ring,
    pet,
    petFollow,
    petSide,
    racketSkin,
    trailStyle,
    swingTrail,
    mount,
    cosmetic,
  };
});
