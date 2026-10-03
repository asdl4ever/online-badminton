<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import GameCanvas from '../components/GameCanvas.vue';
import PlayerProfile from '../components/PlayerProfile.vue';
import CharacterPreview from '../components/CharacterPreview.vue';
import AppModal from '../components/ui/AppModal.vue';
import PageShell from '../components/ui/PageShell.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import { STYLE_META, type AiStyle } from '../game/ai';
import {
  ensureStats,
  LEGEND_ID,
  rerollCosmetic,
  type AiPlayer,
  type LiveMatch,
  type PlayerStats,
} from '../game/players';
import type { MatchOpponent } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import { sfx } from '../game/audio';
import { toast, toastWarn } from '../composables/useToast';
import { ARENA_ROUNDS } from '../game/arena';
import { DEFAULT_COSMETIC, type Cosmetic } from '../game/cosmetics';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';

/**
 * 名人堂：AI 球员排行榜 + 球员主页（五维图）+ 观战 + **球员管理（新增 / 退役 / 编辑）**。
 *
 * 观战接的是**世界赛**（`game/world-arena.ts`）：名人堂球员持续打的 16 人淘汰赛，
 * 现在正在打的那一场可以真看，看完结果写回赛程并计入双方战绩。
 * 想看得更全（树状图 / 赛程 / 谁在打哪个赛事）就去赛事中心（`/watch`）。
 */
const router = useRouter();
const progress = useProgressStore();
const customize = useCustomizeStore();
const lobby = useLobbyStore();

/* --- 世界赛里正在进行的那一场（1 秒轮询，和观战台的时钟同频） ---------------- */
const nowTick = ref(Date.now());
let timer: number | undefined;
onMounted(() => {
  // 兜底校验一次：老存档、或「更新前就开着」的游戏，也要把传奇球员补进名录
  progress.ensureLegend();
  timer = window.setInterval(() => {
    nowTick.value = Date.now();
  }, 1000);
});
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});

/** 现在所有正在直播的比赛（可能同时好几场、跨好几个杯） */
const liveAll = computed(() => progress.worldLiveMatches(nowTick.value));

/** 正在比赛的那两位 → 他们各自对应同一场（列表里显示 🔴、观战按钮可点） */
const liveMap = computed(() => {
  const m = new Map<string, LiveMatch>();
  for (const l of liveAll.value) {
    const a = progress.aiPlayers.find((p) => p.id === l.a.id);
    const b = progress.aiPlayers.find((p) => p.id === l.b.id);
    if (a && b && !m.has(a.id)) {
      const pair: LiveMatch = { a, b };
      m.set(a.id, pair);
      m.set(b.id, pair);
    }
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

/** 现役球员（排行榜上的人） */
const activePlayers = computed(() => progress.aiPlayers.filter((p) => !p.retired));
/** 退役名录（战绩保留，可复出） */
const retiredPlayers = computed(() => progress.aiPlayers.filter((p) => p.retired));

const rows = computed<Row[]>(() => {
  const list: Row[] = activePlayers.value.map((p) => ({
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

/* --- 球员管理：新增 / 退役 / 复出 / 编辑 ------------------------------------- */
/** 榜单是否切成「退役名录」 */
const showRetired = ref(false);

/** 编辑弹窗 */
const editing = ref<AiPlayer | null>(null);
const editOpen = ref(false);
const editName = ref('');
const editCosmetic = ref<Cosmetic>({ ...DEFAULT_COSMETIC });
const editStats = reactive<PlayerStats>({
  technique: 50,
  speed: 50,
  attack: 50,
  defense: 50,
  jump: 50,
});

const STAT_LABELS: { key: keyof PlayerStats; label: string }[] = [
  { key: 'technique', label: '技术' },
  { key: 'speed', label: '速度' },
  { key: 'attack', label: '进攻' },
  { key: 'defense', label: '防守' },
  { key: 'jump', label: '弹跳' },
];

/** 编辑里改任意一维之后，rating 会按五维重算（面板上实时预览） */
const editRatingPreview = computed(() => {
  const s = editStats;
  const v = (s.technique + s.speed + s.attack + s.defense + s.jump) / 5;
  return Math.round(Math.max(400, Math.min(2800, 900 + ((v - 45) / 52) * 1500)));
});

function addPlayer(): void {
  sfx.click();
  const p = progress.addAiPlayer();
  toast(`「${p.name}」加入了名人堂`, 'good');
  showRetired.value = false;
  openEdit(p.id);
}

function openEdit(id: string): void {
  const p = progress.aiPlayers.find((x) => x.id === id);
  if (!p) return;
  sfx.click();
  editing.value = p;
  editName.value = p.name;
  editCosmetic.value = { ...p.cosmetic };
  Object.assign(editStats, ensureStats(p));
  editOpen.value = true;
}

function rerollLook(): void {
  sfx.click();
  const c = rerollCosmetic();
  // 只换装扮（表情 / 帽子 / 翅膀 / 披风 / 光环 / 球拍 / 拖尾），保留原配色偏好
  editCosmetic.value = { ...c, racket: editCosmetic.value.racket, trail: editCosmetic.value.trail };
}

function saveEdit(): void {
  const p = editing.value;
  if (!p) return;
  sfx.click();
  progress.updateAiPlayer(p.id, {
    name: editName.value.trim() || p.name,
    stats: { ...editStats },
    cosmetic: editCosmetic.value,
  });
  toast(`已更新「${editName.value.trim() || p.name}」`, 'good');
  editOpen.value = false;
}

function retireEditing(): void {
  const p = editing.value;
  if (!p) return;
  sfx.click();
  progress.setAiRetired(p.id, true);
  editOpen.value = false;
}

function removeEditing(): void {
  const p = editing.value;
  if (!p) return;
  sfx.click();
  if (progress.removeAiPlayer(p.id)) editOpen.value = false;
  else toastWarn('系统球员不能除名，请用「退役」');
}

function unretire(id: string): void {
  sfx.click();
  progress.setAiRetired(id, false);
}

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

/** 正在看的那一场在世界赛里的位置（结束时要写回赛程 + 记战绩） */
const watchCtx = ref<{
  cup: number;
  season: number;
  round: number;
  index: number;
  aId: string;
  bId: string;
} | null>(null);

function spectateMatch(m: LiveMatch): void {
  const l = liveAll.value.find((x) => x.a.id === m.a.id && x.b.id === m.b.id);
  if (!l) {
    toastWarn('这一场刚好结束了，去赛事中心看看下一场');
    return;
  }
  sfx.click();
  watchCtx.value = {
    cup: l.cup,
    season: l.season,
    round: l.round,
    index: l.index,
    aId: m.a.id,
    bId: m.b.id,
  };
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
    watchCtx.value = null;
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
    // 观战：把这一场的结果写回世界赛（胜者晋级、双方战绩都记一笔）
    if (watch.value && watchCtx.value) {
      const ctx = watchCtx.value;
      const winnerId = e.scorer === 0 ? ctx.aId : ctx.bId;
      const ok = progress.recordWorldMatch(ctx.cup, ctx.season, ctx.round, ctx.index, winnerId);
      const nm = progress.aiPlayers.find((p) => p.id === winnerId)?.name ?? '—';
      toast(
        `${ARENA_ROUNDS[ctx.round] ?? ''}：${nm} 胜出${ok ? '，战绩已记入名人堂' : ''}`,
        'info',
      );
      watchCtx.value = null;
    }
    // 只有「挑战」才结算玩家自己的战绩，纯观战不记
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
          :no-rematch="!!watch"
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
              :roster="progress.aiNames"
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
                  点球员进主页看五维图；正在比赛的球员可以观战（真打一局，结果写回世界赛）。
                </div>
              </div>
              <div class="hall-head__right">
                <div class="hall-me">
                  你的排名 <b class="num">#{{ myRank }}</b>
                </div>
                <span class="hall-season">现役 {{ activePlayers.length }} 位</span>
                <Button size="sm" variant="primary" @click="addPlayer">➕ 新增球员</Button>
                <Button size="sm" variant="quiet" @click="showRetired = !showRetired">
                  {{ showRetired ? '← 回榜单' : `退役名录 ${retiredPlayers.length}` }}
                </Button>
              </div>
            </div>

            <!-- 退役名录 -->
            <div v-if="showRetired" class="rank-list">
              <div v-if="!retiredPlayers.length" class="muted hall-empty">
                还没有退役的球员。在上面点「⚙️」可以把人退役。
              </div>
              <div v-for="p in retiredPlayers" :key="p.id" class="rank-row is-retired">
                <span class="rank-row__name">{{ p.name }}</span>
                <span class="rank-row__record">{{ p.wins }}胜 {{ p.losses }}负</span>
                <span class="rank-row__rating num">{{ p.rating }}</span>
                <Button size="sm" variant="quiet" @click="openDetail(p.id)">主页</Button>
                <Button size="sm" variant="quiet" @click="openEdit(p.id)">⚙️</Button>
                <Button size="sm" @click="unretire(p.id)">复出</Button>
              </div>
            </div>

            <div v-else class="rank-list">
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
                  <Button size="sm" variant="quiet" title="编辑 / 退役" @click="openEdit(r.id)">⚙️</Button>
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

    <!-- 编辑球员：改名 / 调五维 / 换装扮 / 退役 / 除名 -->
    <AppModal v-model="editOpen" :title="`编辑球员 · ${editing?.name ?? ''}`">
      <div class="edit-player">
        <div class="edit-top">
          <div class="edit-preview"><CharacterPreview :cosmetic="editCosmetic" /></div>
          <div class="edit-fields">
            <label class="edit-field">
              <span class="muted">名字</span>
              <input v-model="editName" class="edit-input" maxlength="12" />
            </label>
            <div class="muted edit-hint">
              改五维会按综合分重算榜单分数：<b class="num">{{ editRatingPreview }}</b>
              （现在 {{ editing?.rating ?? 0 }}）
            </div>
            <Button size="sm" @click="rerollLook">🎲 随机换装</Button>
          </div>
        </div>

        <div class="edit-stats">
          <label v-for="s in STAT_LABELS" :key="s.key" class="edit-stat">
            <span class="edit-stat__label">{{ s.label }}</span>
            <input v-model.number="editStats[s.key]" type="range" min="20" max="99" />
            <span class="num edit-stat__value">{{ editStats[s.key] }}</span>
          </label>
        </div>

        <div class="edit-actions">
          <Button variant="primary" @click="saveEdit">保存</Button>
          <Button variant="quiet" @click="editOpen = false">取消</Button>
          <Button variant="quiet" @click="retireEditing">🏳️ 退役</Button>
          <Button v-if="editing?.custom" variant="quiet" @click="removeEditing">🗑 除名</Button>
        </div>
      </div>
    </AppModal>
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

/* --- 退役名录 / 编辑球员 --------------------------------------------------- */

.hall-empty {
  padding: var(--s4) var(--s2);
  font-size: 13px;
}

.rank-row.is-retired {
  opacity: 0.72;
}

.edit-player {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.edit-top {
  display: flex;
  gap: var(--s3);
  align-items: center;
  flex-wrap: wrap;
}

.edit-preview {
  flex: none;
  width: 120px;
  border-radius: var(--r-md, 12px);
  overflow: hidden;
  border: 1px solid var(--line);
}

.edit-fields {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.edit-field {
  display: flex;
  align-items: center;
  gap: var(--s2);
  font-size: 13px;
}

.edit-input {
  flex: 1 1 auto;
  min-width: 0;
  padding: 6px 10px;
  border-radius: var(--r-sm, 8px);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  font: inherit;
}

.edit-hint {
  font-size: 12px;
}

.edit-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edit-stat {
  display: flex;
  align-items: center;
  gap: var(--s2);
  font-size: 13px;
}

.edit-stat__label {
  flex: none;
  width: 3em;
  color: var(--text-dim);
}

.edit-stat input[type='range'] {
  flex: 1 1 auto;
}

.edit-stat__value {
  flex: none;
  width: 2.5em;
  text-align: right;
  font-weight: 700;
}

.edit-actions {
  display: flex;
  gap: var(--s2);
  justify-content: flex-end;
  flex-wrap: wrap;
}
</style>
