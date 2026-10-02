<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import GameCanvas from '../components/GameCanvas.vue';
import PlayerProfile from '../components/PlayerProfile.vue';
import PageShell from '../components/ui/PageShell.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import { STYLE_META, type AiStyle } from '../game/ai';
import { ensureStats, LEGEND_ID, liveMatches, type AiPlayer, type LiveMatch } from '../game/players';
import type { MatchOpponent } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import { sfx } from '../game/audio';
import { toastWarn } from '../composables/useToast';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';

/**
 * 名人堂：AI 球员排行榜 + 球员主页（四维图）+ 观战。
 * 观战只在球员「正在比赛」时才开放——赛程按时间片确定性生成（见 players.liveMatches）。
 */
const router = useRouter();
const progress = useProgressStore();
const customize = useCustomizeStore();
const lobby = useLobbyStore();

/* --- 正在进行的比赛（每 45 秒换一批，5 秒轮询一次 UI） ---------------------- */
const nowTick = ref(Date.now());
let timer: number | undefined;
onMounted(() => {
  // 兜底校验一次：老存档、或「更新前就开着」的游戏，也要把传奇球员补进名录
  progress.ensureLegend();
  timer = window.setInterval(() => (nowTick.value = Date.now()), 5000);
});
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});

const live = computed<LiveMatch[]>(() => liveMatches(progress.aiPlayers, nowTick.value));
const liveMap = computed(() => {
  const m = new Map<string, LiveMatch>();
  for (const lm of live.value) {
    m.set(lm.a.id, lm);
    m.set(lm.b.id, lm);
  }
  return m;
});

/* --- 排行榜 ---------------------------------------------------------------- */
interface Row {
  id: string;
  name: string;
  style: AiStyle | null;
  rating: number;
  wins: number;
  losses: number;
  me: boolean;
}

const rows = computed<Row[]>(() => {
  const list: Row[] = progress.aiPlayers.map((p) => ({
    id: p.id,
    name: p.name,
    style: p.style,
    rating: p.rating,
    wins: p.wins,
    losses: p.losses,
    me: false,
  }));
  list.push({
    id: '__me__',
    name: lobby.playerName || '你',
    style: null,
    rating: 1000 + progress.points,
    wins: progress.playerRecord.wins,
    losses: progress.playerRecord.losses,
    me: true,
  });
  return list.sort((a, b) => b.rating - a.rating);
});

/** 自己在榜单上的名次（右上角常显，省得在长列表里找自己） */
const myRank = computed(() => rows.value.findIndex((r) => r.me) + 1);

/* --- 视图状态 -------------------------------------------------------------- */
const view = ref<'board' | 'detail'>('board');
const selected = ref<AiPlayer | null>(null);
const watch = ref<{ left: MatchOpponent; right: MatchOpponent } | null>(null);

/* --- 挑战：和名人堂里的某位球员打一场（战绩照记） -------------------------- */
const duel = ref<MatchOpponent | null>(null);
const duelId = ref('');
const duelResult = ref<'win' | 'lose' | null>(null);
/** 每一场挑战自增，用来重挂 GameCanvas（换局而不换对手） */
const duelRound = ref(0);

function opponentOf(p: AiPlayer): MatchOpponent {
  // 两位 AI 的行为与加成全部由各自的四维派生
  return { name: p.name, cosmetic: p.cosmetic, stats: ensureStats(p) };
}

function openDetail(id: string): void {
  const p = progress.aiPlayers.find((x) => x.id === id);
  if (!p) return;
  sfx.click();
  selected.value = p;
  view.value = 'detail';
}

function closeDetail(): void {
  sfx.click();
  view.value = 'board';
  selected.value = null;
}

const selectedMatch = computed<LiveMatch | null>(() =>
  selected.value ? liveMap.value.get(selected.value.id) ?? null : null,
);

/* --- 挑战 ------------------------------------------------------------------ */
function startDuel(): void {
  const s = selected.value;
  if (!s) return;
  sfx.click();
  duelId.value = s.id;
  duel.value = opponentOf(s);
  duelResult.value = null;
  duelRound.value += 1;
}

/** 打完再来一局（换局不换人） */
function rematch(): void {
  if (!duel.value) return;
  sfx.click();
  duelResult.value = null;
  duelRound.value += 1;
}

function quitDuel(): void {
  duel.value = null;
  duelResult.value = null;
  duelId.value = '';
}

/* --- 观战 ------------------------------------------------------------------ */
const canvasKey = computed(() => {
  if (watch.value) return `watch-${watch.value.left.name}-${watch.value.right.name}`;
  if (duel.value) return `duel-${duel.value.name}-${duelRound.value}`;
  return 'board';
});

function spectateMatch(m: LiveMatch): void {
  sfx.click();
  watch.value = { left: opponentOf(m.a), right: opponentOf(m.b) };
}

function spectateSelected(): void {
  const m = selectedMatch.value;
  if (!m) {
    toastWarn('这位球员现在没有比赛，等下一场开打再来');
    return;
  }
  spectateMatch(m);
}

function spectateById(id: string): void {
  const m = liveMap.value.get(id);
  if (!m) {
    toastWarn('这位球员现在没有比赛，等下一场开打再来');
    return;
  }
  spectateMatch(m);
}

function back(): void {
  sfx.click();
  if (watch.value) {
    watch.value = null;
    return;
  }
  if (duel.value) {
    quitDuel();
    return;
  }
  if (view.value === 'detail') {
    view.value = 'board';
    selected.value = null;
    return;
  }
  void router.push('/');
}

function onEvent(e: SimEvent): void {
  if (e.type === 'hit') sfx.hit(e.kind ?? 'drive');
  else if (e.type === 'belly') sfx.hit('lift');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') sfx.point();
  else if (e.type === 'gameover') {
    sfx.point();
    // 只有「挑战」才结算战绩，纯观战不记
    if (duel.value && !duelResult.value) {
      const win = e.scorer === 0;
      progress.recordResult(win, 'single');
      if (duelId.value) progress.recordVsAi(duelId.value, win);
      duelResult.value = win ? 'win' : 'lose';
      if (win) sfx.win();
      else sfx.lose();
    }
  }
}
</script>

<template>
  <div class="page page--playing">
    <PageShell title="名人堂" back @back="back">
      <template #stage>
        <GameCanvas
          v-if="watch || duel"
          :key="canvasKey"
          role="single"
          :difficulty="watch ? 'normal' : 'hard'"
          :spectate="watch ?? undefined"
          :opponent="duel ?? undefined"
          :session="null"
          :cosmetic="customize.cosmetic"
          :local-name="lobby.playerName"
          :local-rank="progress.tier.id"
          :theme="customize.theme"
          :auto-cycle-theme="customize.autoCycle"
          :party="false"
          @sim="onEvent"
          @themechange="customize.theme = $event"
        />

        <!-- 球员主页（复用 PlayerProfile，和晋级赛赛程树里看到的一样） -->
        <div v-else-if="view === 'detail' && selected" class="hall-stage">
          <Panel class="hall-card hall-card--detail">
            <PlayerProfile
              :name="selected.name"
              :style="selected.style"
              :rating="selected.rating"
              :wins="selected.wins"
              :losses="selected.losses"
              :stats="ensureStats(selected)"
              :cosmetic="selected.cosmetic"
            >
              <div class="detail-live" :class="{ 'is-live': !!selectedMatch }">
                <template v-if="selectedMatch">
                  🔴 正在比赛 ·
                  {{ selectedMatch.a.id === selected.id ? selectedMatch.b.name : selectedMatch.a.name }}
                </template>
                <template v-else>现在没有比赛，等下一场开打</template>
              </div>
              <Button variant="primary" block @click="startDuel">
                ⚔️ 挑战 {{ selected.name }}
              </Button>
              <Button variant="quiet" block :disabled="!selectedMatch" @click="spectateSelected">
                {{ selectedMatch ? '观战这场' : '无比赛可观战' }}
              </Button>
              <Button variant="quiet" block @click="closeDetail">返回榜单</Button>
            </PlayerProfile>
          </Panel>
        </div>

        <!-- 排行榜 -->
        <div v-else class="hall-stage">
          <Panel class="hall-card">
            <div class="hall-head">
              <div>
                <div class="hall-head__title">🏛️ 球员排行榜</div>
                <div class="muted hall-head__sub">
                  点球员进主页看四维图；只有「正在比赛」的球员才能观战。
                </div>
              </div>
              <div class="hall-head__right">
                <div class="hall-me">
                  你的排名 <b class="num">#{{ myRank }}</b>
                </div>
                <span class="hall-season">共 {{ progress.aiPlayers.length }} 位</span>
              </div>
            </div>

            <div class="rank-list">
              <div
                v-for="(r, i) in rows"
                :key="r.id"
                class="rank-row"
                :class="{ 'is-me': r.me, 'is-legend': r.id === LEGEND_ID }"
              >
                <span class="rank-row__no" :class="{ 'is-top': i < 3 }">{{ i + 1 }}</span>
                <span class="rank-row__name">
                  <span v-if="r.id === LEGEND_ID" class="rank-row__crown" title="传奇 · 名人堂榜首">👑</span>
                  {{ r.name }}
                  <span v-if="r.me" class="rank-row__you">你</span>
                </span>
                <span v-if="liveMap.has(r.id)" class="rank-row__live">🔴</span>
                <span
                  v-if="r.style"
                  class="rank-row__style"
                  :style="{ color: STYLE_META[r.style].color }"
                >
                  {{ STYLE_META[r.style].label }}
                </span>
                <span v-else class="rank-row__style muted">—</span>
                <span class="rank-row__record">{{ r.wins }}胜 {{ r.losses }}负</span>
                <span class="rank-row__rating num">{{ r.rating }}</span>
                <template v-if="!r.me">
                  <Button size="sm" variant="quiet" @click="openDetail(r.id)">主页</Button>
                  <Button
                    size="sm"
                    :disabled="!liveMap.has(r.id)"
                    @click="spectateById(r.id)"
                  >
                    观战
                  </Button>
                </template>
                <span v-else class="rank-row__spacer" />
              </div>
            </div>
          </Panel>
        </div>

        <div v-if="watch" class="watch-banner num">
          观战中 · {{ watch.left.name }} VS {{ watch.right.name }}
        </div>

        <div v-else-if="duel" class="watch-banner watch-banner--duel">
          <span class="num">
            <template v-if="duelResult === 'win'">🏆 你赢了 {{ duel.name }}！</template>
            <template v-else-if="duelResult === 'lose'">你输给了 {{ duel.name }}，要再来吗？</template>
            <template v-else>⚔️ 挑战 {{ duel.name }}（先到 11 分）</template>
          </span>
          <Button v-if="duelResult" size="sm" @click="rematch">再战一场</Button>
          <Button size="sm" variant="quiet" @click="quitDuel">返回榜单</Button>
        </div>
      </template>
    </PageShell>
  </div>
</template>

<style scoped>
.hall-stage {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--s4);
}

.hall-card {
  width: min(620px, 100%);
  margin: auto 0;
}

.hall-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s3);
  margin-bottom: var(--s3);
  padding-bottom: var(--s3);
  border-bottom: 1px solid var(--line);
}

.hall-head__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}

.hall-head__sub {
  margin-top: 2px;
  font-size: 12px;
}

.hall-head__right {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.hall-me {
  font-size: 12px;
  color: var(--text-dim);
}

.hall-me b {
  font-size: 15px;
  color: var(--accent);
}

.hall-season {
  flex: none;
  font-size: 11px;
  color: var(--text-dim);
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rank-row {
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: 6px var(--s2);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
  font-size: 13px;
}

.rank-row.is-me {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 26%, transparent);
}

/* 传奇（皮泽恩）：金边高亮，稳坐榜首 */
.rank-row.is-legend {
  border-color: #ffd45c;
  background: color-mix(in srgb, #ffd45c 12%, var(--surface-2));
}

.rank-row.is-legend .rank-row__name {
  color: #e8a33d;
}

.rank-row__no {
  flex: none;
  width: 20px;
  text-align: center;
  color: var(--text-dim);
}

.rank-row__no.is-top {
  color: #e8a33d;
  font-weight: 700;
}

.rank-row__name {
  flex: 1 1 auto;
  min-width: 0;
  color: var(--text);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-row__you {
  margin-left: 4px;
  padding: 0 6px;
  border-radius: var(--r-pill);
  background: var(--accent);
  color: #fff;
  font-size: 10px;
}

.rank-row__live {
  flex: none;
  font-size: 11px;
}

.rank-row__style {
  flex: none;
  font-size: 11px;
}

.rank-row__record {
  flex: none;
  font-size: 11px;
  color: var(--text-dim);
}

.rank-row__rating {
  flex: none;
  width: 44px;
  text-align: right;
  color: var(--text);
  font-weight: 700;
}

.rank-row__spacer {
  flex: none;
  width: 96px;
}

/* --- 球员主页 --- */
.detail-live {
  margin: var(--s3) 0 var(--s2);
  padding: 8px var(--s3);
  border-radius: var(--r-md);
  border: 1px dashed var(--line);
  font-size: 12px;
  color: var(--text-dim);
}

.detail-live.is-live {
  border-style: solid;
  border-color: #ff5a4d;
  color: var(--text);
}

.watch-banner {
  position: absolute;
  top: calc(var(--ui-top-h) + 12px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  padding: 4px 16px;
  border-radius: var(--r-pill);
  background: rgba(10, 16, 28, 0.55);
  color: #eaf2fb;
  font-size: 13px;
  pointer-events: none;
}

/* 挑战横幅带按钮，所以恢复点击 */
.watch-banner--duel {
  display: flex;
  align-items: center;
  gap: var(--s2);
  pointer-events: auto;
}

.rank-row__crown {
  margin-right: 3px;
  font-size: 12px;
}

@media (max-width: 560px) {
  .hall-card {
    width: 100%;
  }
}
</style>
