<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Phaser from 'phaser';
import PageShell from '../components/ui/PageShell.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import { GZ_DIFFS, GZ_DIFF_ORDER, GZ_DAILY_MAX, GZ_NAME, type GzDifficulty } from '../game/godzilla';
import { GodzillaScene, type GodzillaSceneCfg } from '../game/godzilla/GodzillaScene';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { toastBad, toastGood } from '../composables/useToast';
import { celebrate } from '../composables/celebrate';
import { sfx } from '../game/audio';
import { RARITY_META } from '../game/items';

/**
 * 「哥斯拉来袭」活动页：选难度 → 开打。
 * 场景里 3 颗心，火球拍回去砸哥斯拉扣血、贴地激光跳起来躲；
 * 击杀结算在 `onEnd` 里走 `progress.grantGodzillaKill`（首杀送限定套装）。
 */
const router = useRouter();
const progress = useProgressStore();
const customize = useCustomizeStore();

const host = ref<HTMLElement | null>(null);
let game: Phaser.Game | null = null;
const playing = ref(false);
const difficulty = ref<GzDifficulty>('easy');
const result = ref<'win' | 'lose' | null>(null);
const resultText = ref('');
const loot = ref<{ label: string; color: string }[]>([]);

const attemptsLeft = computed(() => progress.gzLeftToday);

function start(): void {
  if (playing.value) return;
  const r = progress.useGodzillaAttempt();
  if (!r.ok) {
    toastBad(r.message);
    return;
  }
  sfx.click();
  result.value = null;
  loot.value = [];
  playing.value = true;
  bootScene();
}

function bootScene(): void {
  if (game) game.destroy(true);
  const data: GodzillaSceneCfg = {
    difficulty: difficulty.value,
    cosmetic: customize.cosmetic,
    onEnd: onEnd,
  };
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: host.value ?? undefined,
    width: 1280,
    height: 720,
    transparent: true,
    banner: false,
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [],
    callbacks: {
      postBoot: (g) => g.scene.add('GodzillaScene', GodzillaScene, true, data),
    },
  });
}

function onEnd(win: boolean): void {
  playing.value = false;
  result.value = win ? 'win' : 'lose';
  if (win) {
    const r = progress.grantGodzillaKill(difficulty.value);
    sfx.win();
    celebrate(3, ['#3a7d44', '#e8a33d', '#8fe0ff']);
    const parts: string[] = [`🪙 +${r.coins}`, `🏅 +${r.honor}`];
    loot.value = r.items.map((i) => ({ label: i.label, color: RARITY_META[i.rarity].color }));
    // 首杀送了哥斯拉本体：直接穿上，昭告天下
    if (r.items.some((i) => i.id === 'skin:godzilla')) customize.characterSkin = 'godzilla';
    resultText.value = r.firstKill
      ? `🏆 首杀达成！${GZ_NAME}倒下了：${parts.join(' · ')}，限定套装已进背包`
      : `🏆 击杀成功！（累计 ${progress.gzKills} 杀）${parts.join(' · ')}`;
    toastGood(resultText.value);
  } else {
    sfx.lose();
    resultText.value = `你被 ${GZ_NAME} 打倒了，还剩 ${progress.gzLeftToday} 次挑战机会`;
  }
}

function back(): void {
  sfx.click();
  destroyGame();
  void router.push('/');
}

function destroyGame(): void {
  game?.destroy(true);
  game = null;
}

onMounted(() => {
  if (attemptsLeft.value <= 0) {
    // 进来一看次数用完了也别拦着，页面还能看介绍；只是开打会被拒
  }
});

onBeforeUnmount(destroyGame);
</script>

<template>
  <div class="page page--playing">
    <PageShell :title="`${GZ_NAME}来袭`" back @back="back">
      <template #icons>
        <span class="icon-btn ui-num gz-attempts" title="今日剩余挑战次数">
          🎫 今日 {{ attemptsLeft }}/{{ GZ_DAILY_MAX }}
        </span>
      </template>

      <template #stage>
        <!-- 战斗画面 -->
        <div v-show="playing" ref="host" class="gz-stage" />

        <!-- 活动主页：哥斯拉 + 难度选择 -->
        <div v-if="!playing" class="gz-home">
          <Panel class="gz-card">
            <div class="gz-head">
              <span class="gz-face">🦖</span>
              <div>
                <div class="gz-title">{{ GZ_NAME }}来袭</div>
                <div class="muted gz-sub">
                  它站在场地右边吐<b>火球</b>——挥拍把它拍回去砸在它身上就能扣血；
                  它还会扫<b>贴地激光</b>——跳起来躲。
                  你有 <b>3 颗心</b>，被激光扫到或被火球砸中掉一颗，扣完挑战失败。
                </div>
              </div>
            </div>

            <div class="gz-diffs">
              <button
                v-for="d in GZ_DIFF_ORDER"
                :key="d"
                class="gz-diff"
                :class="{ 'is-on': difficulty === d }"
                type="button"
                @click="sfx.click(); difficulty = d"
              >
                <b>{{ GZ_DIFFS[d].label }}</b>
                <span class="num">血量 {{ GZ_DIFFS[d].hits }} 击</span>
                <span class="num">🪙 {{ GZ_DIFFS[d].coins }} · 🏅 {{ GZ_DIFFS[d].honor }}</span>
              </button>
            </div>

            <p class="muted gz-note">
              每天 <b>{{ GZ_DAILY_MAX }}</b> 次免费挑战，失败也消耗次数。
              <b>首次击杀</b>（任意难度）送「哥斯拉来袭」限定套装：背鳍光焰 · 鳞甲披风 ·
              原子吐息 · 原子烈焰；重复击杀按难度给金币和荣誉点。
            </p>

            <div v-if="loot.length" class="gz-loot">
              <span
                v-for="l in loot"
                :key="l.label"
                class="gz-loot-item"
                :style="{ borderColor: l.color }"
              >
                {{ l.label }}
              </span>
            </div>

            <p v-if="result" class="gz-result" :class="`is-${result}`">{{ resultText }}</p>

            <Button
              variant="primary"
              block
              :disabled="attemptsLeft <= 0"
              @click="start"
            >
              {{
                attemptsLeft <= 0
                  ? '今日次数已用完，明天再来'
                  : `⚔️ 挑战（${GZ_DIFFS[difficulty].label}）· 今日剩 ${attemptsLeft} 次`
              }}
            </Button>
          </Panel>
        </div>
      </template>
    </PageShell>
  </div>
</template>

<style scoped>
.gz-stage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gz-stage :deep(canvas) {
  max-width: 100%;
  max-height: 100%;
}

.gz-home {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--s4);
}

.gz-card {
  width: min(560px, 94vw);
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.gz-head {
  display: flex;
  align-items: flex-start;
  gap: var(--s3);
}

.gz-face {
  font-size: 44px;
  line-height: 1;
}

.gz-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--text);
}

.gz-sub {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.7;
}

.gz-diffs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--s2);
}

.gz-diff {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 4px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  cursor: pointer;
}

.gz-diff.is-on {
  border-color: #d85858;
  background: color-mix(in srgb, #d85858 14%, var(--surface-2));
}

.gz-diff b {
  font-size: 14px;
}

.gz-diff span {
  font-size: 10px;
  color: var(--text-dim);
}

.gz-note {
  margin: 0;
  font-size: 11px;
  line-height: 1.7;
}

.gz-loot {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s2);
}

.gz-loot-item {
  padding: 3px 10px;
  border-radius: var(--r-pill);
  border: 2px solid var(--line);
  font-size: 12px;
  color: var(--text);
}

.gz-result {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}

.gz-result.is-win {
  color: #53e0a0;
}

.gz-result.is-lose {
  color: #ff8a8a;
}

.gz-attempts {
  color: #ff8a8a;
}
</style>
