<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import GameCanvas from '../components/GameCanvas.vue';
import PageShell from '../components/ui/PageShell.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import type { MatchOpponent } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import { currentWeek, weeklyStagePower } from '../game/weekly';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';

/**
 * 🗓 **本机周赛**：每周 5 关 AI（逐关变强），首通给金币 / 荣誉，跨周重置。
 * 纯本机内容，不联网——给「练出来的属性」一个随时能变现、有周目标的舞台。
 */

const router = useRouter();
const progress = useProgressStore();
const customize = useCustomizeStore();
const lobby = useLobbyStore();

const playing = ref(false);
const stageIdx = ref(0);
const lastMsg = ref('');

onMounted(() => progress.syncWeekly());

const stages = computed(() => progress.weeklyStagesNow);
const cleared = computed(() => progress.weeklyCleared);
const week = computed(() => currentWeek());
/** 玩家五维综合分（和竞技场报名界面同款） */
const myPower = computed(() => progress.myStatPower);

/** 这一关能不能打：下一关（=cleared）与已通关的都能打；后面的锁住 */
function stageState(i: number): 'cleared' | 'playable' | 'locked' {
  if (i < cleared.value) return 'cleared';
  if (i === cleared.value) return 'playable';
  return 'locked';
}

const opponentConfig = computed<MatchOpponent | undefined>(() => {
  if (!playing.value) return undefined;
  const s = stages.value[stageIdx.value];
  if (!s) return undefined;
  return { name: s.name, stats: s.stats };
});

function startStage(i: number): void {
  if (i > cleared.value) {
    toastWarn('按顺序打，先过前面这一关');
    return;
  }
  sfx.click();
  stageIdx.value = i;
  lastMsg.value = '';
  playing.value = true;
}

function onEvent(e: SimEvent): void {
  if (e.type === 'hit') sfx.hit(e.kind ?? 'drive');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') sfx.point();
  else if (e.type === 'gameover') {
    const win = e.scorer === 0;
    if (win) sfx.win();
    else sfx.lose();
    const r = progress.reportWeeklyResult(win, stageIdx.value);
    if (r.advanced) {
      lastMsg.value = `✅ 通关「${stages.value[stageIdx.value]?.round}」 · +🪙${r.coins}${
        r.honor ? ` · 🏅+${r.honor}` : ''
      }${r.scrolls ? ` · 📜+${r.scrolls}` : ''}`;
      toastGood(lastMsg.value);
    } else if (win) {
      lastMsg.value = '这关已通关过了，不再发奖（练练手也不错）';
      toastGood('过关！');
    } else {
      lastMsg.value = '❌ 没赢下这一关，调整一下再来';
      toastWarn('惜败，再试一次');
    }
    playing.value = false;
  }
}

function back(): void {
  sfx.click();
  if (playing.value) {
    playing.value = false;
    return;
  }
  void router.push('/arena');
}
</script>

<template>
  <div class="page page--playing">
    <PageShell title="本机周赛" back @back="back">
      <template #stage>
        <GameCanvas
          v-if="playing"
          :key="`wk-${week}-${stageIdx}`"
          role="single"
          :option-id="undefined"
          :opponent="opponentConfig"
          :skills="progress.equippedSkills"
          :skill-branches="progress.skillBranch"
          :skill-mastery="progress.skillMastery"
          :session="null"
          :cosmetic="customize.cosmetic"
          :attrs="progress.attrs"
          :local-name="lobby.playerName"
          :local-rank="progress.tier.id"
          :party="false"
          @sim="onEvent"
        />

        <div v-else class="weekly-stage">
          <Panel class="weekly-card">
            <div class="weekly-head">
              <div>
                <div class="weekly-head__title">🗓 本周周赛 · 第 {{ week }} 周</div>
                <div class="muted weekly-head__sub">
                  5 关单败 AI，逐关变强；首通给金币 / 荣誉，下周一自动换关并计入本机榜
                </div>
              </div>
              <span class="weekly-badge">已通 {{ cleared }} / {{ stages.length }}</span>
            </div>

            <p v-if="lastMsg" class="weekly-msg">{{ lastMsg }}</p>

            <div class="weekly-list">
              <div
                v-for="s in stages"
                :key="s.idx"
                class="weekly-row"
                :class="`is-${stageState(s.idx)}`"
              >
                <div class="weekly-row__round">
                  {{ s.round }}
                  <span class="muted">· 对手 {{ s.name }}</span>
                </div>
                <div class="weekly-row__power num">
                  强度 ≈ {{ weeklyStagePower(s) }}
                  <span class="muted">/ 你 {{ myPower }}</span>
                </div>
                <div class="weekly-row__reward num">
                  🪙{{ s.coins }}<template v-if="s.honor"> · 🏅{{ s.honor }}</template>
                </div>
                <Button
                  v-if="stageState(s.idx) !== 'locked'"
                  size="sm"
                  :variant="stageState(s.idx) === 'playable' ? 'primary' : 'quiet'"
                  @click="startStage(s.idx)"
                >
                  {{ stageState(s.idx) === 'cleared' ? '重打' : '挑战' }}
                </Button>
                <span v-else class="muted weekly-row__lock">🔒 先过上一关</span>
              </div>
            </div>

            <div class="weekly-rank">
              <div class="weekly-rank__title">🏅 本机榜</div>
              <div class="weekly-rank__row">
                <span>本周</span><span class="num">已通 {{ cleared }} 关</span>
              </div>
              <div v-for="h in progress.weeklySave.history" :key="h.week" class="weekly-rank__row">
                <span>第 {{ h.week }} 周</span><span class="num">已通 {{ h.cleared }} 关</span>
              </div>
              <div v-if="!progress.weeklySave.history.length" class="muted weekly-rank__empty">
                还没有往期记录——打完这周，下周就上榜。
              </div>
            </div>
          </Panel>
        </div>
      </template>
    </PageShell>
  </div>
</template>

<style scoped>
.weekly-stage {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--s4);
}

.weekly-card {
  width: min(640px, 100%);
  margin: auto 0;
}

.weekly-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s3);
  margin-bottom: var(--s3);
}

.weekly-head__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.weekly-head__sub {
  margin-top: 2px;
  font-size: 12px;
}

.weekly-badge {
  flex: none;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--surface-2, #f1efe9);
  font-size: 12px;
  font-weight: 700;
}

.weekly-msg {
  margin: 0 0 var(--s3);
  padding: var(--s2) var(--s3);
  border-radius: var(--r-md);
  background: color-mix(in srgb, var(--accent) 12%, #fff);
  font-size: 13px;
}

.weekly-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.weekly-row {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: var(--s3);
  padding: var(--s2) var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface);
}

.weekly-row.is-cleared {
  opacity: 0.7;
}

.weekly-row.is-locked {
  opacity: 0.5;
}

.weekly-row__round {
  font-size: 14px;
  font-weight: 600;
}

.weekly-row__power,
.weekly-row__reward {
  font-size: 12px;
  color: var(--text-dim);
  white-space: nowrap;
}

.weekly-row__lock {
  font-size: 12px;
  white-space: nowrap;
}

.weekly-rank {
  margin-top: var(--s3);
  padding-top: var(--s3);
  border-top: 1px solid var(--line);
}

.weekly-rank__title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 6px;
}

.weekly-rank__row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 2px 0;
  color: var(--text-dim);
}

.weekly-rank__empty {
  font-size: 12px;
}
</style>
