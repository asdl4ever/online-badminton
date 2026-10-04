<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import Phaser from 'phaser';
import PageShell from '../components/ui/PageShell.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import {
  GZ_DIFFS,
  GZ_DIFF_ORDER,
  GZ_DROPS,
  GZ_DAILY_MAX,
  GZ_NAME,
  GZ_REWARD_ODDS,
  type GzDifficulty,
} from '../game/godzilla';
import { GodzillaScene, type GodzillaSceneCfg } from '../game/godzilla/GodzillaScene';
import { bindCanvasSize, renderConfig, sceneScaleConfig } from '../game/zoom';
import GameSticks from '../components/ui/GameSticks.vue';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { toastBad, toastGood } from '../composables/useToast';
import { celebrate } from '../composables/celebrate';
import { sfx } from '../game/audio';
import { RARITY_META } from '../game/items';

/**
 * 「哥斯拉来袭」活动页：选难度 → 开打。
 * 场景里 3 颗心，火球拍回去砸哥斯拉扣血、贴地激光跳起来躲；
 * 击杀结算在 `onEnd` 里走 `progress.grantGodzillaKill`（按难度概率掉该档限定）。
 */
const router = useRouter();
const progress = useProgressStore();
const customize = useCustomizeStore();

const host = ref<HTMLElement | null>(null);
let game: Phaser.Game | null = null;
const playing = ref(false);

/**
 * 三档难度**逐级解锁**（简单 → 普通 → 地狱）：默认选中「第一个还没打通的已解锁档」，
 * 全通了就停在最后一档（地狱）方便重复刷。
 */
function defaultDifficulty(): GzDifficulty {
  const next = GZ_DIFF_ORDER.find((d) => progress.gzUnlocked(d) && !progress.gzCleared.includes(d));
  return next ?? GZ_DIFF_ORDER[GZ_DIFF_ORDER.length - 1];
}

const difficulty = ref<GzDifficulty>(defaultDifficulty());
const result = ref<'win' | 'lose' | null>(null);
const resultText = ref('');
const loot = ref<{ label: string; color: string }[]>([]);

const attemptsLeft = computed(() => progress.gzLeftToday);

/** 这一档解锁了吗（没解锁的卡片点不动，并写明靠谁解锁） */
function unlocked(d: GzDifficulty): boolean {
  return progress.gzUnlocked(d);
}

/** 解锁这一档需要先打赢哪一档（已解锁返回空串） */
function unlockHint(d: GzDifficulty): string {
  const i = GZ_DIFF_ORDER.indexOf(d);
  if (i <= 0 || unlocked(d)) return '';
  return `击败「${GZ_DIFFS[GZ_DIFF_ORDER[i - 1]].label}」解锁`;
}

function pickDiff(d: GzDifficulty): void {
  if (!unlocked(d)) {
    toastBad(`🔒 ${unlockHint(d)}`);
    return;
  }
  sfx.click();
  difficulty.value = d;
}

/** 三选一摇奖的三个概率（给说明文案用，改 `GZ_REWARD_ODDS` 这里自动跟着变） */
const odds = computed(() => ({
  coins: Math.round(GZ_REWARD_ODDS.coins * 100),
  skin: Math.round(GZ_REWARD_ODDS.skin * 100),
  keys: Math.round(GZ_REWARD_ODDS.keys * 100),
}));

/** 每档限定的收集进度：皮肤档只在「还没拥有的」里掉，集齐了会折算金币 */
const setInfo = computed(
  () =>
    Object.fromEntries(
      GZ_DIFF_ORDER.map((d) => {
        const ids = GZ_DROPS[d].ids;
        return [d, { owned: ids.filter((id) => progress.owned.includes(id)).length, total: ids.length }];
      }),
    ) as Record<GzDifficulty, { owned: number; total: number }>,
);

async function start(): Promise<void> {
  if (playing.value) return;
  if (!unlocked(difficulty.value)) {
    toastBad(`🔒 ${unlockHint(difficulty.value)}`);
    return;
  }
  const r = progress.useGodzillaAttempt();
  if (!r.ok) {
    toastBad(r.message);
    return;
  }
  sfx.click();
  result.value = null;
  loot.value = [];
  playing.value = true;
  // ⚠️ 必须等战斗容器真正显示出来（有尺寸）再启 Phaser：
  // 容器是 v-show 控制的，`playing = true` 只是改了个标志，DOM 还是 display:none；
  // 在隐藏的父节点上启动，ScaleManager 会按 0×0 算缩放，之后再靠它每 500ms 一次的
  // 父节点尺寸轮询才纠正回来——这就是「进去半天才有图案」的原因。
  await nextTick();
  bootScene();
}

function bootScene(): void {
  if (!host.value) return;
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
    scale: sceneScaleConfig(),
    ...renderConfig(),
    scene: [],
    callbacks: {
      postBoot: (g) => g.scene.add('GodzillaScene', GodzillaScene, true, data),
    },
  });

  // 画布后备缓冲 = 容器 CSS 尺寸 × 设备像素比（高分屏不糊），并跟随尺寸变化
  bindCanvasSize(game, host.value);
}

function onEnd(win: boolean): void {
  playing.value = false;
  result.value = win ? 'win' : 'lose';
  if (!win) {
    sfx.lose();
    resultText.value = `你被 ${GZ_NAME} 打倒了，还剩 ${progress.gzLeftToday} 次挑战机会`;
    return;
  }

  // 战利品是**三选一摇出来的**（50% 金币 / 20% 该档限定 / 30% 钥匙），荣誉点固定给
  const beaten = difficulty.value;
  const r = progress.grantGodzillaKill(beaten);
  // 打赢这一档之后，下一档难度是不是刚解锁了（打在结算文案里）
  const unlockedNext = GZ_DIFF_ORDER.find((d) => progress.gzUnlocked(d) && !progress.gzCleared.includes(d));
  sfx.win();
  celebrate(3, ['#3a7d44', '#e8a33d', '#8fe0ff']);
  loot.value = r.drop ? [{ label: r.drop.label, color: RARITY_META[r.drop.rarity].color }] : [];
  // 掉出哥斯拉本体就直接穿上
  if (r.drop?.id === 'skin:godzilla') customize.characterSkin = 'godzilla';

  let gain: string;
  if (r.drop) {
    gain = `🎁 掉落限定「${r.drop.label}」`;
  } else if (r.kind === 'skin') {
    // 这一档的限定已经全拿到 → 不重复发，折算成金币
    gain = `这一档的限定已经拿齐了，折算 🪙 +${r.refund}`;
  } else if (r.kind === 'keys') {
    gain = `🔑 宝箱钥匙 +${r.keys}`;
  } else {
    gain = `🪙 金币 +${r.coins}`;
  }

  resultText.value =
    `🏆 击杀成功！（累计 ${progress.gzKills} 杀）${gain} · 🏅 +${r.honor}` +
    (r.allOwned ? ' · 这一档的限定已集齐' : '') +
    (unlockedNext && unlockedNext !== beaten
      ? ` · 🔓 解锁「${GZ_DIFFS[unlockedNext].label}」难度`
      : '');
  // 刚解锁下一档就顺手把它选上，省得玩家再点一次
  if (unlockedNext && unlockedNext !== beaten) difficulty.value = unlockedNext;
  toastGood(gain);
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
        <!-- 战斗画面：容器走公共的 phaser-stage（桌面 16:9、手机铺满整屏） -->
        <div v-show="playing" ref="host" class="phaser-stage">
          <GameSticks />
        </div>

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
                :class="{ 'is-on': difficulty === d, 'is-lock': !unlocked(d) }"
                type="button"
                :aria-disabled="!unlocked(d)"
                @click="pickDiff(d)"
              >
                <b>{{ unlocked(d) ? GZ_DIFFS[d].label : `🔒 ${GZ_DIFFS[d].label}` }}</b>
                <span class="num">血量 {{ GZ_DIFFS[d].hits }} 击</span>
                <span class="num">🪙 {{ GZ_DIFFS[d].coins }} · 🏅 {{ GZ_DIFFS[d].honor }}</span>
                <span class="num">
                  🎁 限定 {{ setInfo[d].owned }}/{{ setInfo[d].total
                  }}<template v-if="setInfo[d].owned >= setInfo[d].total"> · 已集齐</template>
                </span>
                <span v-if="!unlocked(d)" class="gz-lockhint">{{ unlockHint(d) }}</span>
                <span v-else-if="progress.gzCleared.includes(d)" class="gz-cleared">✓ 已通关</span>
              </button>
            </div>

            <p class="muted gz-note">
              三档难度<b>逐级解锁</b>：打赢<b>简单</b>才开<b>普通</b>、打赢<b>普通</b>才开<b>地狱</b>。
              每天 <b>{{ GZ_DAILY_MAX }}</b> 次免费挑战，失败也消耗次数。
              每次击杀摇一次<b>三选一</b>：🪙 金币 <b>{{ odds.coins }}%</b> ·
              🎁 该档限定 <b>{{ odds.skin }}%</b> · 🔑 宝箱钥匙 <b>{{ odds.keys }}%</b>（荣誉点固定给）。
              <b>简单</b>掉 原子烈焰 · 原子吐息，<b>普通</b>掉 背鳍光焰 · 鳞甲披风，<b>地狱</b>才是
              <b>哥斯拉本体皮肤</b>；每档只掉你还没有的，该档拿齐后皮肤档<b>折算成金币</b>，不会重复给。
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

/* 没解锁的档：整卡压暗、点击只弹提示 */
.gz-diff.is-lock {
  opacity: 0.5;
  cursor: not-allowed;
  border-style: dashed;
}

.gz-lockhint {
  font-size: 10px;
  font-weight: 700;
  color: #c9a24a;
}

.gz-cleared {
  font-size: 10px;
  font-weight: 700;
  color: #53e0a0;
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
