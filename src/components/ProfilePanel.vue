<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { VTextField } from 'vuetify/components';
import CharacterPreview from './CharacterPreview.vue';
import Button from './ui/Button.vue';
import { useProgressStore } from '../stores/progress';
import { useLobbyStore } from '../stores/lobby';
import { useCustomizeStore } from '../stores/customize';
import { ITEMS, PETS } from '../game/items';
import { titleForPoints } from '../game/ranks';
import { toHex } from '../game/cosmetics';
import {
  TRAIN_KEYS,
  TRAIN_META,
  TRAIN_MAX_LEVEL,
  TRAIN_MILESTONES,
  trainProgress,
  type TrainKey,
} from '../game/training';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';

/**
 * 个人主页：角色 + 段位 + 收集进度。
 * 数据全部来自本机存档（没有账号系统），所以这里看到的就是这台设备上的进度。
 */
const progress = useProgressStore();
const lobby = useLobbyStore();
const customize = useCustomizeStore();

const skins = computed(() => ITEMS.filter((i) => i.slot === 'skin'));
const skinLabel = computed(
  () => skins.value.find((i) => i.ref === customize.characterSkin)?.label ?? '默认',
);
const ownedSkins = computed(() => skins.value.filter((i) => progress.isOwned(i)).length);
const ownedTotal = computed(() => ITEMS.filter((i) => progress.isOwned(i)).length);
const hatchedPets = computed(() => Object.keys(progress.petStars).length);

/* --- 昵称 ---------------------------------------------------------------- */
const nameDraft = ref(lobby.playerName);
watch(
  () => lobby.playerName,
  (v) => (nameDraft.value = v),
);
const nameDirty = computed(() => nameDraft.value.trim() !== lobby.playerName && !!nameDraft.value.trim());

function saveName(): void {
  const next = nameDraft.value.trim().slice(0, 16);
  if (!next) {
    toastWarn('昵称不能是空的');
    nameDraft.value = lobby.playerName;
    return;
  }
  if (next === lobby.playerName) return;
  lobby.rename(next);
  nameDraft.value = next;
  sfx.click();
  toastGood(`昵称已改为「${next}」，好友看到的也是这个`);
}

const stats = computed(() => [
  { label: '金币', value: `¥${progress.coins}` },
  { label: '宝箱钥匙', value: `🔑 ${progress.chestKeys}` },
  { label: '星尘碎片', value: `🧩 ${progress.shards}` },
  { label: '外观收集', value: `${ownedTotal.value} / ${ITEMS.length}` },
  { label: '角色形象', value: `${ownedSkins.value} / ${skins.value.length}` },
  { label: '宠物', value: `${hatchedPets.value} / ${PETS.length}` },
  { label: '鱼竿等级', value: `Lv.${progress.rodLevel}` },
  { label: '兑换码', value: `${progress.redeemed.length} 个` },
]);

/* --- 锻炼（属性点改成去场地练出来） ---------------------------------------- */
const trainPct = (k: TrainKey): number =>
  Math.round(trainProgress(progress.trainLevels[k] ?? 0, progress.trainXp[k] ?? 0) * 100);
</script>

<template>
  <div class="pf">
    <div class="pf__hero">
      <div class="pf__preview" :style="{ borderColor: toHex(progress.tier.color) }">
        <CharacterPreview />
      </div>

      <div class="pf__who">
        <!-- 昵称直接在这里改（好友、玩家列表上显示的都是它） -->
        <div class="pf__name-row">
          <VTextField
            v-model="nameDraft"
            class="soft-field pf__name-field"
            maxlength="16"
            hide-details
            placeholder="你的昵称"
            @keyup.enter="saveName"
          />
          <Button size="sm" variant="primary" :disabled="!nameDirty" @click="saveName">改名</Button>
        </div>
        <div class="muted pf__id num">好友码 {{ lobby.playerId }}</div>

        <div class="pf__tier" :style="{ background: toHex(progress.tier.color) }">
          <span class="pf__glyph">{{ progress.tier.glyph }}</span>
          <span>{{ progress.tier.label }}</span>
        </div>
        <div class="pf__points num">
          {{ progress.points }} 分
          <span class="pf__title">「{{ titleForPoints(progress.points) }}」</span>
          <span class="muted">· 当前形象「{{ skinLabel }}」</span>
        </div>

        <div class="pf__bar">
          <span
            class="pf__bar-fill"
            :style="{ width: `${progress.progress * 100}%`, background: toHex(progress.tier.color) }"
          />
        </div>
        <div class="muted pf__next">
          {{
            progress.next
              ? `距离 ${progress.next.label} 还差 ${progress.next.points - progress.points} 分`
              : '已达最高组别'
          }}
        </div>
      </div>
    </div>

    <ul class="pf__stats">
      <li v-for="s in stats" :key="s.label" class="pf__stat">
        <span class="muted pf__stat-label">{{ s.label }}</span>
        <b class="num pf__stat-value">{{ s.value }}</b>
      </li>
    </ul>

    <div class="pf__attrs">
      <div class="pf__attrs-head">
        <span class="pf__attrs-title">锻炼</span>
        <span class="muted pf__attrs-sum">
          永久成长都在这里：练哪一维就长哪一维（最高 Lv.{{ TRAIN_MAX_LEVEL }}），
          每维 Lv5 / Lv8 再送一条永久功底；招式只管局内打法。
        </span>
      </div>

      <div v-for="k in TRAIN_KEYS" :key="k" class="pf__attrblock">
        <div class="pf__attr">
          <span class="pf__attr-name" :style="{ color: TRAIN_META[k].color }">
            {{ TRAIN_META[k].label }}
          </span>
          <span class="muted pf__attr-desc">{{ TRAIN_META[k].desc }} · {{ TRAIN_META[k].where }}</span>
          <span class="num pf__attr-val">
            {{ progress.trainLevels[k] }}/{{ TRAIN_MAX_LEVEL }}
          </span>
          <div class="pf__attr-bar">
            <span
              class="pf__attr-fill"
              :style="{ width: `${trainPct(k)}%`, background: TRAIN_META[k].color }"
            />
          </div>
        </div>
        <div class="pf__miles">
          <span
            v-for="m in TRAIN_MILESTONES[k]"
            :key="m.at"
            class="pf__mile"
            :class="{ 'is-on': (progress.trainLevels[k] ?? 0) >= m.at }"
            :style="(progress.trainLevels[k] ?? 0) >= m.at ? { borderColor: TRAIN_META[k].color } : undefined"
          >
            Lv{{ m.at }}「{{ m.name }}」{{ m.desc }}
          </span>
        </div>
      </div>

      <p class="muted pf__attrs-note">
        属性点不再随积分发放：大世界的 🏋️ 健身房举重练「进攻」、🥊 沙袋练「技术」、🏃 跑步机练「体力」，
        🏟 操场跑圈练「速度」、扔实心球（扔得越远给得越多）练「进攻」，单机的 🏸 发球机练「防守」。
        练满自动升级，不能自由分配、也不能重置。
      </p>
      <p class="muted pf__attrs-note">
        🏁 操场还有「跑量里程碑」：累计里程每满 1km 解锁一件「跑道特训」专属装备，在背包里换上。
      </p>
    </div>

    <p class="muted pf__hint">
      积分从对局与杯赛结算里来（单机 / 联机各算一档），只决定段位与杯赛门槛；荣誉奖励在「积分」里领；外观在「背包」里换。
    </p>
  </div>
</template>

<style scoped>
.pf {
  display: flex;
  flex-direction: column;
  gap: var(--s4);
}

.pf__hero {
  display: grid;
  grid-template-columns: 176px minmax(0, 1fr);
  gap: var(--s4);
  align-items: start;
}

.pf__preview {
  border: 2px solid var(--line);
  border-radius: var(--r-lg);
  overflow: hidden;
}

.pf__who {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.pf__name-row {
  display: flex;
  align-items: center;
  gap: var(--s2);
}

.pf__name-field {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 220px;
}

.pf__id {
  font-size: 12px;
  letter-spacing: 2px;
}

.pf__tier {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  border-radius: var(--r-pill);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
}

.pf__glyph {
  font-size: 15px;
}

.pf__points {
  font-size: 14px;
  color: var(--text);
}

.pf__title {
  color: var(--accent);
  font-weight: 700;
}

.pf__bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: color-mix(in srgb, var(--text) 12%, transparent);
}

.pf__bar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 220ms var(--ease);
}

.pf__next {
  font-size: 12px;
}

.pf__stats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--s2);
}

.pf__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--s2) var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.pf__stat-label {
  font-size: 12px;
}

.pf__stat-value {
  font-size: 15px;
  color: var(--text);
}

.pf__hint {
  margin: 0;
  font-size: 12px;
}

.pf__attrs {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  padding: var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.pf__attrs-head {
  display: flex;
  align-items: center;
  gap: var(--s2);
}

.pf__attrs-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.pf__attrs-sum {
  flex: 1 1 auto;
  font-size: 12px;
}

.pf__attr {
  display: flex;
  align-items: center;
  gap: var(--s2);
  font-size: 13px;
}

.pf__attr-name {
  flex: none;
  width: 44px;
  font-weight: 700;
}

.pf__attr-desc {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 12px;
}

.pf__attr-val {
  flex: none;
  width: 56px;
  text-align: right;
  color: var(--text);
  font-weight: 700;
}

/* 经验条：这一维离下一级还差多少 */
.pf__attr-bar {
  flex: none;
  width: 96px;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: color-mix(in srgb, var(--text) 12%, transparent);
}

.pf__attr-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 220ms var(--ease);
}

/* 每维下面的「功底」里程碑：练到就点亮 */
.pf__attrblock {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pf__miles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-left: 44px;
}

.pf__mile {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px dashed var(--line);
  color: var(--text-dim);
}

.pf__mile.is-on {
  border-style: solid;
  color: var(--text);
  background: color-mix(in srgb, var(--text) 6%, transparent);
}

.pf__attrs-note {
  margin: 2px 0 0;
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 560px) {
  .pf__hero {
    grid-template-columns: 1fr;
  }

  .pf__preview {
    max-width: 200px;
  }

  .pf__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
