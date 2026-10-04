<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import PlayerProfile from './PlayerProfile.vue';
import Button from './ui/Button.vue';
import { STYLE_META, type AiStyle } from '../game/ai';
import { ensureStats, type AiPlayer } from '../game/players';
import { sfx } from '../game/audio';
import { useLobbyStore } from '../stores/lobby';
import { useProgressStore } from '../stores/progress';

/**
 * 🏅 **排行榜**——大地图平板里的一个应用（原「名人堂」的只读版）。
 *
 * 列出现役球员 + 你，按 rating 排；点某位球员进**球员主页**（`PlayerProfile`，
 * 和晋级赛赛程树里看到的是同一份），在主页里可以 **⚔️ 挑战** 他 —— 挑战会
 * `emit('challenge')` 交给平板去开一局全屏对局。
 *
 * 球员管理（新增 / 退役 / 编辑）与观战已经下线：退役 / 新秀入行由系统按时间片
 * 自动进行（见 `players.evolveRoster()`），想看世界动态去「新闻周刊」。
 */
const emit = defineEmits<{ challenge: [AiPlayer] }>();

const progress = useProgressStore();
const lobby = useLobbyStore();

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
  const list: Row[] = progress.aiPlayers
    .filter((p) => !p.retired)
    .map((p) => ({
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

/** 自己的名次（写在榜单顶上，省得在长列表里找） */
const myRank = computed(() => rows.value.findIndex((r) => r.me) + 1);

/* --- 正在比赛的人（🔴）---------------------------------------------------- */
const nowTick = ref(Date.now());
let timer: number | undefined;
onMounted(() => {
  timer = window.setInterval(() => (nowTick.value = Date.now()), 1000);
});
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});

const liveIds = computed(() => {
  const set = new Set<string>();
  for (const l of progress.worldLiveMatches(nowTick.value)) {
    set.add(l.a.id);
    set.add(l.b.id);
  }
  return set;
});

/* --- 球员主页 -------------------------------------------------------------- */
const selected = ref<AiPlayer | null>(null);

function openDetail(id: string): void {
  const p = progress.aiPlayers.find((x) => x.id === id);
  if (!p) return;
  sfx.click();
  selected.value = p;
}

function closeDetail(): void {
  sfx.click();
  selected.value = null;
}

function challenge(): void {
  const s = selected.value;
  if (!s) return;
  sfx.click();
  emit('challenge', s);
}
</script>

<template>
  <!-- 球员主页 -->
  <div v-if="selected" class="lb lb--detail">
    <div class="lb__detail">
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
        <div class="lb__live" :class="{ 'is-live': liveIds.has(selected.id) }">
          <template v-if="liveIds.has(selected.id)">🔴 正在世界赛比赛</template>
          <template v-else>现在没有比赛，等下一场开打</template>
        </div>
        <Button variant="primary" block @click="challenge">⚔️ 挑战 {{ selected.name }}</Button>
        <Button variant="quiet" block @click="closeDetail">返回排行榜</Button>
      </PlayerProfile>
    </div>
  </div>

  <!-- 榜单 -->
  <div v-else class="lb">
    <div class="lb__head">
      <div>
        <div class="lb__title">🏅 排行榜</div>
        <div class="lb__sub muted">按 rating 排序 · 点球员看主页（可以挑战他）</div>
      </div>
      <div class="lb__right">
        <span class="lb__me">你的排名 <b class="num">#{{ myRank }}</b></span>
        <span class="lb__count">现役 {{ rows.length - 1 }} 位</span>
      </div>
    </div>

    <div class="lb__list">
      <button
        v-for="(r, i) in rows"
        :key="r.id"
        class="row"
        :class="{ 'is-me': r.me }"
        type="button"
        @click="!r.me && openDetail(r.id)"
      >
        <span class="row__no" :class="{ 'is-top': i < 3 }">{{ i + 1 }}</span>
        <span class="row__name">
          {{ r.name }}
          <span v-if="r.me" class="row__you">你</span>
        </span>
        <span v-if="liveIds.has(r.id)" class="row__live">🔴</span>
        <span
          v-if="r.style"
          class="row__style"
          :style="{ color: STYLE_META[r.style].color }"
        >
          {{ STYLE_META[r.style].label }}
        </span>
        <span v-else class="row__style muted">—</span>
        <span class="row__record">{{ r.wins }}胜 {{ r.losses }}负</span>
        <span class="row__rating num">{{ r.rating }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.lb {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.lb__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s3);
  flex-wrap: wrap;
}

.lb__title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
}

.lb__sub {
  font-size: 11px;
}

.lb__right {
  display: inline-flex;
  align-items: center;
  gap: var(--s3);
  font-size: 12px;
  color: var(--text-dim);
}

.lb__me b {
  color: var(--accent);
}

.lb__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.row {
  display: flex;
  align-items: center;
  gap: var(--s2);
  width: 100%;
  padding: 6px var(--s2);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: color-mix(in srgb, #ffffff 62%, transparent);
  color: var(--text);
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}

.row:hover {
  border-color: var(--accent);
}

.row.is-me {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 26%, transparent);
  cursor: default;
}

.row__no {
  flex: none;
  width: 20px;
  text-align: center;
  color: var(--text-dim);
}

.row__no.is-top {
  color: var(--accent);
  font-weight: 800;
}

.row__name {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row__you {
  margin-left: 4px;
  color: var(--accent);
}

.row__live {
  flex: none;
  font-size: 11px;
}

.row__style {
  flex: none;
  font-size: 11px;
}

.row__record {
  flex: none;
  color: var(--text-dim);
}

.row__rating {
  flex: none;
  width: 46px;
  text-align: right;
  font-weight: 700;
}

/* 球员主页：平板里可能比屏幕宽，让它自己滚 */
.lb--detail {
  display: block;
}

.lb__detail {
  overflow-x: auto;
}

.lb__live {
  font-size: 12px;
  color: var(--text-dim);
  margin-bottom: var(--s2);
}

.lb__live.is-live {
  color: #d64545;
  font-weight: 700;
}
</style>
