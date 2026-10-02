<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import GameCanvas from '../components/GameCanvas.vue';
import PageShell from '../components/ui/PageShell.vue';
import SideDock from '../components/ui/SideDock.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import type { HudState } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import type { Difficulty } from '../game/ai';
import { toastGood, toastWarn } from '../composables/useToast';
import { celebrate } from '../composables/celebrate';
import { sfx } from '../game/audio';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';
import { useGameStore } from '../stores/game';
import {
  ARENA_BOTS,
  ARENA_ROUNDS,
  arenaByTier,
  arenaDifficulty,
  goldForPlace,
} from '../game/arena';
import { TIERS, tierForPoints } from '../game/ranks';

/**
 * 晋级赛馆：8 人单败淘汰赛（你 + 7 个 AI）。
 * 报名费按当前段位收，名次结算金币与积分；赛季每月清零积分。
 * 对局复用羽毛球场景（role="single"，AI 难度随段位与轮次爬升）。
 */
const router = useRouter();
const progress = useProgressStore();
const customize = useCustomizeStore();
const lobby = useLobbyStore();
const game = useGameStore();

/** null = 在馆里看板 / 报名；'match' = 正在打一场 */
const phase = ref<'lobby' | 'match'>('lobby');
const hud = ref<HudState | null>(null);

const run = computed(() => progress.arenaRun);
const myTier = computed(() => tierForPoints(progress.points));
const arena = computed(() => arenaByTier(myTier.value.id));
const tierIdx = computed(() => TIERS.findIndex((t) => t.id === myTier.value.id));

/** 下一场的对手：按届内进度取一个稳定的名字 */
const opponent = computed(() => {
  const runV = run.value;
  if (!runV) return '';
  return ARENA_BOTS[(runV.wins * 3 + runV.round) % ARENA_BOTS.length];
});

const diff = computed<Difficulty>(() => {
  const runV = run.value;
  if (!runV) return 'normal';
  return (['easy', 'normal', 'hard'] as const)[arenaDifficulty(tierIdx.value, runV.round)];
});

const roundName = computed(() => {
  const runV = run.value;
  if (!runV) return '';
  if (runV.round === 2) return runV.semisWon ? '决赛' : '季军赛';
  return ARENA_ROUNDS[runV.round];
});

/** 对局每换一场就重建场景 */
const canvasKey = computed(() => `arena-${run.value?.round ?? 0}-${run.value?.wins ?? 0}`);

function enter(): void {
  sfx.click();
  const r = progress.enterArena();
  if (!r.ok) {
    toastWarn(r.message);
    return;
  }
  toastGood(r.message);
}

function startMatch(): void {
  sfx.click();
  game.role = 'single';
  phase.value = 'match';
}

function onEvent(e: SimEvent): void {
  if (e.type === 'hit') sfx.hit(e.kind ?? 'drive');
  else if (e.type === 'belly') sfx.hit('lift');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') sfx.point();
  else if (e.type === 'gameover') {
    const win = e.scorer === 0;
    if (win) {
      progress.arenaWin();
      sfx.win();
      if (!progress.arenaRun) {
        // 冠军：全场 3 连胜
        celebrate(3, ['#ffd45c', '#3d8bfd', '#f2e7c9']);
      }
    } else {
      progress.arenaLose();
      sfx.lose();
    }
    phase.value = 'lobby';
  }
}

function onHud(state: HudState): void {
  hud.value = state;
}

function back(): void {
  if (phase.value === 'match') {
    toastWarn('比赛进行中，先打完这场！');
    return;
  }
  sfx.click();
  void router.push('/');
}
</script>

<template>
  <div class="page page--playing">
    <PageShell title="晋级赛馆" back @back="back">
      <template #dock>
        <SideDock>
          <span class="dock-coins">🪙 {{ progress.coins }}</span>
          <div v-if="run" class="dock-run">
            {{ run.tier === myTier.id ? '本届赛事' : '跨段位赛事' }} · {{ roundName }}
          </div>
          <p class="dock-note">
            8 人单败淘汰，AI 难度随段位与轮次爬升。名次结算金币与积分，赛季每月清零。
          </p>
        </SideDock>
      </template>

      <template #stage>
        <!-- 正在打一场：羽毛球场景铺满 -->
        <GameCanvas
          v-if="phase === 'match' && run"
          :key="canvasKey"
          ref="canvas"
          role="single"
          :difficulty="diff"
          :option-id="undefined"
          :session="null"
          :cosmetic="customize.cosmetic"
          :local-name="lobby.playerName"
          :local-rank="myTier.id"
          :theme="customize.theme"
          :auto-cycle-theme="customize.autoCycle"
          :party="false"
          @hud="onHud"
          @sim="onEvent"
          @themechange="customize.theme = $event"
        />

        <!-- 馆内：看板 + 报名 / 赛程 -->
        <div v-else class="arena-stage">
          <Panel class="arena-card">
            <!-- 报名看板 -->
            <div class="arena-head">
              <div>
                <div class="arena-head__title">🏆 {{ arena.label }}组 · 晋级赛</div>
                <div class="muted arena-head__sub">
                  报名费 🪙{{ arena.fee }} · 冠军 🪙{{ arena.championGold }}（3 连胜 +10%）
                </div>
              </div>
              <span class="arena-season">赛季 {{ progress.seasonId }} · 最高 {{ tierForPoints(progress.points).label }}</span>
            </div>

            <!-- 赛程进行中 -->
            <template v-if="run">
              <div class="bracket">
                <div
                  v-for="(r, i) in ARENA_ROUNDS"
                  :key="r"
                  class="bracket-round"
                  :class="{ 'is-done': run.round > i, 'is-now': run.round === i }"
                >
                  <span class="bracket-round__name">
                    {{ i === 2 ? (run.semisWon ? '决赛' : '季军赛') : r }}
                  </span>
                  <span class="bracket-round__state">
                    {{ run.round > i ? (i === 1 && !run.semisWon ? '惜败' : '胜') : run.round === i ? '进行中' : '—' }}
                  </span>
                </div>
              </div>

              <div class="next-match">
                <div class="next-match__title">下一场 · {{ roundName }}</div>
                <div class="next-match__vs">
                  <span>你（{{ myTier.label }}）</span>
                  <b class="next-match__x">VS</b>
                  <span>{{ opponent }}</span>
                </div>
                <div class="muted next-match__sub">对手难度：{{ diff === 'easy' ? '简单' : diff === 'hard' ? '困难' : '普通' }}</div>
                <Button variant="primary" block @click="startMatch">进入比赛</Button>
              </div>
            </template>

            <!-- 报名 -->
            <template v-else>
              <div class="rewards">
                <div class="rewards__row is-top">
                  <span>🏆 冠军</span><span class="num">🪙 {{ goldForPlace(arena, 'champion', 3) }}</span>
                  <span class="num muted">+{{ arena.points }} 积分</span>
                </div>
                <div class="rewards__row">
                  <span>🥈 亚军</span><span class="num">🪙 {{ goldForPlace(arena, 'runner', 2) }}</span>
                  <span class="num muted">+{{ Math.round(arena.points * 0.6) }} 积分</span>
                </div>
                <div class="rewards__row">
                  <span>🥉 季军</span><span class="num">🪙 {{ goldForPlace(arena, 'third', 2) }}</span>
                  <span class="num muted">+{{ Math.round(arena.points * 0.4) }} 积分</span>
                </div>
                <div class="rewards__row">
                  <span>4 强</span><span class="num">🪙 {{ goldForPlace(arena, 'fourth', 1) }}</span>
                  <span class="num muted">+{{ Math.round(arena.points * 0.1) }} 积分</span>
                </div>
                <div class="rewards__row">
                  <span>8 强</span><span class="num">🪙 退半价</span>
                  <span class="muted">无积分</span>
                </div>
              </div>
              <Button variant="primary" block @click="enter">
                报名参赛 · 🪙 {{ arena.fee }}
              </Button>
              <p class="muted arena-note">
                8 人单败淘汰：8强→4强→决赛，赢了继续输了止步（首轮出局退一半报名费）。
                冠军 +{{ arena.points }} 积分向更高段位冲刺。当前段位：{{ myTier.label }}组。
              </p>
            </template>
          </Panel>
        </div>
      </template>
    </PageShell>
  </div>
</template>

<style scoped>
.dock-coins {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.dock-run {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}

.dock-note {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-dim);
}

.arena-stage {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--s4);
}

.arena-card {
  width: min(560px, 100%);
}

.arena-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s3);
  margin-bottom: var(--s3);
  padding-bottom: var(--s3);
  border-bottom: 1px solid var(--line);
}

.arena-head__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}

.arena-head__sub {
  margin-top: 2px;
  font-size: 12px;
}

.arena-season {
  font-size: 11px;
  color: var(--text-dim);
  text-align: right;
}

/* --- 赛程 --- */
.bracket {
  display: flex;
  gap: var(--s2);
  margin-bottom: var(--s3);
}

.bracket-round {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
  font-size: 12px;
}

.bracket-round.is-now {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 30%, transparent);
}

.bracket-round.is-done {
  background: color-mix(in srgb, #3a7d44 14%, var(--surface-2));
}

.bracket-round__name {
  font-weight: 700;
  color: var(--text);
}

.bracket-round__state {
  color: var(--text-dim);
}

.next-match {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  padding: var(--s3);
  border-radius: var(--r-md);
  border: 1px dashed var(--line);
  margin-bottom: var(--s3);
}

.next-match__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.next-match__vs {
  display: flex;
  align-items: center;
  gap: var(--s3);
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.next-match__x {
  color: var(--accent);
}

.next-match__sub {
  font-size: 12px;
}

/* --- 奖励表 --- */
.rewards {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--s3);
}

.rewards__row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--s3);
  padding: 8px 12px;
  border-radius: var(--r-md);
  background: var(--surface-2);
  border: 1px solid var(--line);
  font-size: 13px;
  color: var(--text);
}

.rewards__row.is-top {
  border-color: color-mix(in srgb, #e8a33d 55%, var(--line));
  background: color-mix(in srgb, #e8a33d 10%, var(--surface-2));
}

.arena-note {
  margin: var(--s3) 0 0;
  font-size: 12px;
  line-height: 1.6;
}
</style>
