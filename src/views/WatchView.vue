<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import GameCanvas from '../components/GameCanvas.vue';
import ArenaBracket from '../components/ArenaBracket.vue';
import PlayerProfile from '../components/PlayerProfile.vue';
import AppModal from '../components/ui/AppModal.vue';
import { ARENA_ROUNDS, type ArenaEntrant } from '../game/arena';
import {
  MATCH_KEY,
  matchPhase,
  matchStart,
  WORLD_MATCH_MS,
  entrantSituation,
  worldChampion,
  worldCupName,
  worldEdition,
  worldEditionEnd,
  worldSeasonNo,
} from '../game/world-arena';
import { ensureStats, type AiPlayer } from '../game/players';
import { sfx } from '../game/audio';
import type { MatchOpponent } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import { toast, toastWarn } from '../composables/useToast';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';

/**
 * 👁 赛事中心（观战台）。
 *
 * 两个赛事来源：
 * - 🌍 **世界赛**：名人堂球员持续打的 16 人单败淘汰赛，30 分钟一届、2 分钟一场
 *   （见 `game/world-arena.ts`）。树状图随时间往下长，正在打的那一场可以**真的进去看**
 *   （双 AI 完整对局），看完把结果写回赛程并计入名人堂战绩；不想等就「快进」。
 * - 🏆 **我的赛事**：玩家自己在晋级赛馆报名的那一届（`progress.arenaRun`）的树状图。
 */
const router = useRouter();
const progress = useProgressStore();
const customize = useCustomizeStore();
const lobby = useLobbyStore();

/* --- 每秒钟走一格：倒计时 / 树状图随时间推进 --------------------------------- */
const tick = ref(Date.now());
let timer = 0;
onMounted(() => {
  progress.ensureLegend();
  progress.ensureWorldEdition();
  timer = window.setInterval(() => {
    progress.ensureWorldEdition();
    tick.value = Date.now();
  }, 1000);
});
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});

const world = computed(() => progress.worldArenaState(tick.value));
const ed = computed(() => worldEdition(tick.value));
const champion = computed(() => worldChampion(world.value));
const myRun = computed(() => progress.arenaRun);

/** 每场状态（键 `${轮}:${场}`）：已经有结果的算已结束 */
const phaseMap = computed<Record<string, 'upcoming' | 'live' | 'ended'>>(() => {
  const st = world.value;
  const out: Record<string, 'upcoming' | 'live' | 'ended'> = {};
  for (let r = 0; r < st.rounds.length; r++) {
    for (let i = 0; i < st.rounds[r].length; i++) {
      const m = st.rounds[r][i];
      if (!m.a || !m.b) continue;
      out[MATCH_KEY(r, i)] = m.winner ? 'ended' : matchPhase(st.edition, r, i, tick.value);
    }
  }
  return out;
});

/** 现在能真看的那一场 */
const liveKey = computed(() => {
  const l = world.value.live;
  if (!l) return undefined;
  const m = world.value.rounds[l.round]?.[l.index];
  if (!m || m.winner) return undefined;
  return MATCH_KEY(l.round, l.index);
});
const liveRound = computed(() => world.value.live?.round ?? 0);
const liveMatch = computed(() => progress.worldLiveMatch(tick.value));

/** 下一场没开始的比赛的开赛时刻 */
const nextStart = computed<number | null>(() => {
  const st = world.value;
  for (let r = 0; r < st.rounds.length; r++) {
    for (let i = 0; i < st.rounds[r].length; i++) {
      const m = st.rounds[r][i];
      if (!m.a || !m.b || m.winner) continue;
      if (matchPhase(st.edition, r, i, tick.value) === 'upcoming') {
        return matchStart(st.edition, r, i);
      }
    }
  }
  return null;
});

function mmss(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function clockOf(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 换届倒计时 / 这一场的剩余观战时间 / 下一场倒计时 */
const editionLeft = computed(() => mmss(worldEditionEnd(ed.value) - tick.value));
const liveLeft = computed(() => {
  const l = world.value.live;
  if (!l) return '';
  return mmss(matchStart(world.value.edition, l.round, l.index) + WORLD_MATCH_MS - tick.value);
});
const nextLeft = computed(() => {
  const s = nextStart.value;
  return s == null ? '' : mmss(s - tick.value);
});

/* --- 真观战 ---------------------------------------------------------------- */
interface SpectateCtx {
  round: number;
  index: number;
  a: ArenaEntrant;
  b: ArenaEntrant;
}
const spectating = ref<SpectateCtx | null>(null);
const spectateResult = ref<string | null>(null);

const spectateOpps = computed(() =>
  spectating.value
    ? {
        left: {
          name: spectating.value.a.name,
          cosmetic: spectating.value.a.cosmetic,
          stats: spectating.value.a.stats,
        } satisfies MatchOpponent,
        right: {
          name: spectating.value.b.name,
          cosmetic: spectating.value.b.cosmetic,
          stats: spectating.value.b.stats,
        } satisfies MatchOpponent,
      }
    : null,
);

const canvasKey = computed(() =>
  spectating.value ? `watch-${spectating.value.round}-${spectating.value.index}` : 'board',
);

function watchMatch(r: number, i: number): void {
  if (MATCH_KEY(r, i) !== liveKey.value) {
    toastWarn('只有「正在进行」的那一场可以进去真看，其它场次可以快进');
    return;
  }
  const l = progress.worldLiveMatch(tick.value);
  if (!l) {
    toastWarn('这一场刚好结束了，看看下一场吧');
    return;
  }
  sfx.click();
  spectateResult.value = null;
  spectating.value = { round: l.round, index: l.index, a: l.a, b: l.b };
}

function leaveSpectate(): void {
  sfx.click();
  spectating.value = null;
  spectateResult.value = null;
  tick.value = Date.now();
}

function fastForward(r: number, i: number): void {
  sfx.click();
  if (!progress.fastForwardWorldMatch(r, i)) {
    toastWarn('这一场已经记过结果了');
    return;
  }
  tick.value = Date.now();
  // 记完之后重新读一次树，才拿得到刚定的胜者
  const st = progress.worldArenaState();
  const winId = st.rounds[r]?.[i]?.winner ?? '';
  const nm = st.entrants.find((e) => e.id === winId)?.name ?? '—';
  toast(`${ARENA_ROUNDS[r]}：${nm} 胜出`, 'info');
}

function onSim(e: SimEvent): void {
  if (e.type === 'hit') sfx.hit(e.kind ?? 'drive');
  else if (e.type === 'belly') sfx.hit('lift');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') sfx.point();
  else if (e.type === 'gameover') {
    const ctx = spectating.value;
    if (!ctx || spectateResult.value) return;
    const winner = e.scorer === 0 ? ctx.a : ctx.b;
    const recorded = progress.recordWorldMatch(ctx.round, ctx.index, winner.id);
    spectateResult.value = `${winner.name} 拿下这一场${recorded ? '，战绩已记入名人堂' : ''}`;
    sfx.win();
    tick.value = Date.now();
  }
}

/* --- 球员主页（点树状图里的名字） -------------------------------------------- */
const detail = ref<AiPlayer | null>(null);
const detailOpen = ref(false);

function openPlayer(id: string): void {
  const p = progress.aiPlayers.find((x) => x.id === id);
  if (!p) {
    toastWarn('这位球员已经不在名录里了');
    return;
  }
  sfx.click();
  detail.value = p;
  detailOpen.value = true;
}

/* --- 「谁在打哪个赛事」 ------------------------------------------------------ */
interface WhoRow {
  id: string;
  name: string;
  icon: string;
  label: string;
  live: boolean;
  round: number;
}
const whoRows = computed<WhoRow[]>(() => {
  const st = world.value;
  const rows: WhoRow[] = [];
  for (const e of st.entrants) {
    const s = entrantSituation(st, e.id, tick.value);
    if (!s) continue;
    const foe = s.opponent?.name ?? '';
    let icon = '⏳';
    let label = `${ARENA_ROUNDS[s.round]}：${clockOf(s.startAt)} 开打 vs ${foe}`;
    let live = false;
    if (s.out) {
      icon = '🚪';
      label = `${ARENA_ROUNDS[s.round]} 被 ${foe} 淘汰`;
    } else if (s.phase === 'live') {
      icon = '🔴';
      label = `${ARENA_ROUNDS[s.round]}：正在打 ${foe}`;
      live = true;
    } else if (s.phase === 'ended') {
      icon = '✅';
      label = `${ARENA_ROUNDS[s.round]} 击败 ${foe}，晋级`;
    }
    rows.push({ id: e.id, name: e.name, icon, label, live, round: s.round });
  }
  return rows.sort((a, b) => Number(b.live) - Number(a.live) || a.round - b.round);
});

function back(): void {
  sfx.click();
  if (spectating.value) {
    leaveSpectate();
    return;
  }
  void router.push('/');
}
</script>

<template>
  <div class="page page--playing">
    <PageShell title="赛事中心" back @back="back">
      <template #stage>
        <!-- 真观战：双 AI 完整对局 -->
        <GameCanvas
          v-if="spectating && spectateOpps"
          :key="canvasKey"
          role="single"
          difficulty="normal"
          :spectate="spectateOpps"
          :no-rematch="true"
          :session="null"
          :cosmetic="customize.cosmetic"
          :local-name="lobby.playerName"
          :local-rank="progress.tier.id"
          :theme="customize.theme"
          :auto-cycle-theme="customize.autoCycle"
          :party="false"
          @sim="onSim"
          @themechange="customize.theme = $event"
        />
        <div v-if="spectating" class="watch-banner num">
          <span>
            👁 观战中 · {{ ARENA_ROUNDS[spectating.round] }} ·
            {{ spectating.a.name }} VS {{ spectating.b.name }}
            <template v-if="spectateResult"> · {{ spectateResult }}</template>
          </span>
          <Button size="sm" variant="quiet" @click="leaveSpectate">返回赛程</Button>
        </div>

        <!-- 赛事总览 -->
        <div v-else class="watch-stage">
          <Panel class="watch-hero">
            <div class="hero__main">
              <div class="hero__title">
                🌍 {{ worldCupName(ed) }}
                <span class="muted">第 {{ worldSeasonNo(ed) }} 届</span>
              </div>
              <div class="muted hero__sub">
                名人堂球员的 16 人单败淘汰赛 · 每 30 分钟一届 · 一场 2 分钟 ·
                已结束 <b class="num">{{ world.done }}/{{ world.total }}</b> 场 ·
                ⏳ 换届 <b class="num">{{ editionLeft }}</b>
              </div>
            </div>
            <div class="hero__side">
              <template v-if="liveMatch">
                <div class="hero__live">
                  🔴 {{ ARENA_ROUNDS[world.live?.round ?? 0] }} ·
                  {{ liveMatch.a.name }} VS {{ liveMatch.b.name }}
                  <span class="muted">（{{ liveLeft }} 后可快进）</span>
                </div>
                <div class="hero__buttons">
                  <Button variant="primary" size="sm" @click="watchMatch(liveMatch.round, liveMatch.index)">
                    👁 进去看
                  </Button>
                  <Button size="sm" @click="fastForward(liveMatch.round, liveMatch.index)">
                    ⏭ 直接出结果
                  </Button>
                </div>
              </template>
              <template v-else-if="champion">
                <div class="hero__live">
                  🏆 本届冠军：<b>{{ world.entrants.find((e) => e.id === champion)?.name }}</b>
                </div>
                <div class="muted">下一届还有 {{ editionLeft }}</div>
              </template>
              <template v-else-if="nextStart">
                <div class="hero__live">⏳ 下一场 {{ clockOf(nextStart) }} 开打（还有 {{ nextLeft }}）</div>
              </template>
              <template v-else>
                <div class="muted">这一届没有安排比赛</div>
              </template>
            </div>
          </Panel>

          <!-- 我的赛事 -->
          <Panel v-if="myRun" class="watch-mine">
            <div class="watch-mine__head">
              <b>🏆 我的赛事 · {{ myRun.cupName }}</b>
              <span class="muted">
                进行到 {{ ARENA_ROUNDS[myRun.round] ?? '已结束' }} · 已赢 {{ myRun.wins }} 场
              </span>
            </div>
            <ArenaBracket
              :rounds="myRun.rounds"
              :entrants="myRun.entrants"
              :current-round="myRun.round"
              @select="openPlayer"
            />
          </Panel>

          <!-- 世界赛对阵树 -->
          <Panel class="watch-tree">
            <div class="watch-tree__head">
              <b>🌍 世界赛对阵树</b>
              <span class="muted">点名字看球员主页；「🔴 进行中」的那场可以进去真看，其余可以快进</span>
            </div>
            <ArenaBracket
              :rounds="world.rounds"
              :entrants="world.entrants"
              :current-round="liveRound"
              :match-phase="phaseMap"
              :live-key="liveKey"
              @select="openPlayer"
              @watch="watchMatch"
            />
          </Panel>

          <!-- 谁在打哪个赛事 -->
          <Panel class="watch-who">
            <div class="watch-who__head">
              <b>👥 谁在打哪个赛事</b>
              <span class="muted">本届 16 位参赛球员的进程</span>
            </div>
            <div class="who-list">
              <button
                v-for="r in whoRows"
                :key="r.id"
                class="who-row"
                :class="{ 'is-live': r.live }"
                type="button"
                @click="openPlayer(r.id)"
              >
                <span class="who-row__icon">{{ r.icon }}</span>
                <span class="who-row__name">{{ r.name }}</span>
                <span class="who-row__label muted">{{ r.label }}</span>
              </button>
            </div>
          </Panel>
        </div>
      </template>
    </PageShell>

    <AppModal v-model="detailOpen" :title="detail?.name ?? '球员主页'">
      <PlayerProfile
        v-if="detail"
        :name="detail.name"
        :style="detail.style"
        :rating="detail.rating"
        :wins="detail.wins"
        :losses="detail.losses"
        :stats="ensureStats(detail)"
        :cosmetic="detail.cosmetic"
      />
    </AppModal>
  </div>
</template>

<style scoped>
.watch-stage {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  padding: var(--s3);
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.watch-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  flex-wrap: wrap;
}

.hero__title {
  font-size: 18px;
  font-weight: 700;
}

.hero__sub {
  font-size: 12px;
  margin-top: 4px;
}

.hero__side {
  text-align: right;
  font-size: 13px;
}

.hero__live {
  font-weight: 600;
}

.hero__buttons {
  display: flex;
  gap: var(--s2);
  justify-content: flex-end;
  margin-top: 8px;
}

.watch-mine__head,
.watch-tree__head,
.watch-who__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s2);
  margin-bottom: var(--s2);
  font-size: 13px;
}

.watch-mine__head {
  font-size: 14px;
}

.who-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 260px
;
  overflow-y: auto;
}

.who-row {
  display: flex;
  align-items: center;
  gap: var(--s2);
  width: 100%;
  padding: 4px 8px;
  border: none;
  border-radius: var(--r-sm, 8px);
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}

.who-row:hover {
  background: var(--surface-2);
}

.who-row.is-live {
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}

.who-row__name {
  flex: none;
  min-width: 84px;
  font-weight: 600;
}

.who-row__label {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.watch-banner {
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  font-size: 13px;
}
</style>
