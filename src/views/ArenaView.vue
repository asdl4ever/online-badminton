<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import GameCanvas from '../components/GameCanvas.vue';
import ArenaBracket from '../components/ArenaBracket.vue';
import PlayerProfile from '../components/PlayerProfile.vue';
import PageShell from '../components/ui/PageShell.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import AppModal from '../components/ui/AppModal.vue';
import ArenaSignup from '../components/ArenaSignup.vue';
import type { HudState, MatchOpponent } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import { formatGains, type MatchTally } from '../game/match-xp';
import { STYLE_META, tierFromStats } from '../game/ai';
import {
  ARENA_ROUNDS,
  PLACE_LABEL,
  arenaByTier,
  type ArenaEntrant,
  type ArenaPlace,
} from '../game/arena';
import { arenaEventOf } from '../game/arena-events';
import { THEMES } from '../game/theme';
import { toHex } from '../game/cosmetics';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';
import { celebrate } from '../composables/celebrate';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';
import { useGameStore } from '../stores/game';

/**
 * 晋级赛馆：报名（`ArenaSignup`，两步选级别 → 选赛事）→ 树状赛程 → 逐场开打。
 * 一届 16 人单败（16强/8强/4强/决赛），每场一局定胜负；打完一届该杯赛冷却 5 分钟。
 * 报名后没开打就返回 = 直接走人，本届保留，下次进来继续。
 * 报名界面本身是独立组件（大地图上的平板也复用它）。
 */
const router = useRouter();
const progress = useProgressStore();
const customize = useCustomizeStore();
const lobby = useLobbyStore();
const game = useGameStore();

const phase = ref<'lobby' | 'bracket' | 'match'>('lobby');
const hud = ref<HudState | null>(null);
/** 本场统计（扣杀 / 接杀 / 跑动 / 失误…）：打完换五维经验，见 `game/match-xp.ts` */
const tally = ref<MatchTally | null>(null);
const quitOpen = ref(false);
const resultOpen = ref(false);
const lastPlace = ref<ArenaPlace | null>(null);
/** 刚打完的那一届的身份与赛事名（结算海报用——结算时 arenaRun 已经被清掉了） */
const lastEvent = ref<ReturnType<typeof arenaEventOf> | null>(null);
const lastCupName = ref('');

/** 名次徽章 */
const placeMedal = computed(() => {
  switch (lastPlace.value) {
    case 'champion':
      return '🏆';
    case 'runner':
      return '🥈';
    case 'third':
      return '🥉';
    case 'fourth':
      return '🎖';
    case 'qf':
      return '🎗';
    default:
      return '🏸';
  }
});

const run = computed(() => progress.arenaRun);
const cup = computed(() => (run.value ? arenaByTier(run.value.tier) : null));
const me = computed(() => run.value?.entrants.find((e) => e.isMe) ?? null);
const roundName = computed(() => (run.value ? ARENA_ROUNDS[run.value.round] : ''));

/** 玩家本轮那一场 */
const myMatch = computed(() => {
  const r = run.value;
  const m0 = me.value;
  if (!r || !m0) return null;
  return (r.rounds[r.round] ?? []).find((x) => x.a === m0.id || x.b === m0.id) ?? null;
});

/** 本轮对手 */
const myOpponent = computed(() => {
  const r = run.value;
  const m0 = me.value;
  const mm = myMatch.value;
  if (!r || !m0 || !mm) return null;
  const foeId = mm.a === m0.id ? mm.b : mm.a;
  return r.entrants.find((e) => e.id === foeId) ?? null;
});

const opponentTierLabel = computed(() => {
  const foe = myOpponent.value;
  if (!foe) return '';
  return { easy: '简单', normal: '普通', hard: '困难' }[tierFromStats(foe.stats)];
});

const opponentConfig = computed<MatchOpponent | undefined>(() => {
  const foe = myOpponent.value;
  if (!foe) return undefined;
  // 行为与加成全部由对手四维派生
  return { name: foe.name, cosmetic: foe.cosmetic, stats: foe.stats };
});

/** 点树状图里的名字 → 弹出球员主页（复用名人堂那一份） */
const selectedEntrant = ref<ArenaEntrant | null>(null);
const profileOpen = computed({
  get: () => !!selectedEntrant.value,
  set: (v: boolean) => {
    if (!v) selectedEntrant.value = null;
  },
});

function openEntrant(id: string): void {
  const e = run.value?.entrants.find((x) => x.id === id);
  if (!e) return;
  sfx.click();
  selectedEntrant.value = e;
}

function closeEntrant(): void {
  selectedEntrant.value = null;
}

const canvasKey = computed(() =>
  run.value ? `arena-${run.value.round}-${run.value.wins}` : 'none',
);

/* --- 一旦有进行中的一届就进赛程；预约到点自动开赛也跟过去 ---------------- */
onMounted(() => {
  if (run.value) phase.value = 'bracket';
});
watch(
  () => progress.arenaAutoStartedAt,
  (at) => {
    if (at && run.value) phase.value = 'bracket';
  },
);

/** 本届赛事的身份（场馆 / 主题 / 阵容），对局场地与赛程页头部都用它 */
const ev = computed(() => (run.value ? arenaEventOf(run.value.tier, run.value.cupName) : null));
const evThemeLabel = computed(() => (ev.value ? THEMES[ev.value.theme].label : ''));

/** 报名成功（报名界面 emit）→ 直接进本届赛程 */
function onSigned(): void {
  phase.value = 'bracket';
}

function startMatch(): void {
  if (!myOpponent.value) {
    toastWarn('本轮对手还没确定');
    return;
  }
  sfx.click();
  game.role = 'single';
  phase.value = 'match';
}

function back(): void {
  sfx.click();
  // 只有真正在打的时候才要确认放弃；看赛程 / 选杯时直接走人（本届保留）
  if (phase.value === 'match') {
    quitOpen.value = true;
    return;
  }
  void router.push('/');
}

function confirmQuit(): void {
  quitOpen.value = false;
  const r = progress.arenaQuit();
  if (r.ok) toastGood(r.message);
  else toastWarn(r.message);
  phase.value = 'lobby';
  resultOpen.value = false;
  void router.push('/');
}

function closeResult(): void {
  sfx.click();
  resultOpen.value = false;
  phase.value = 'lobby';
}

function onHud(state: HudState): void {
  hud.value = state;
  if (state.match) tally.value = state.match;
}

function onEvent(e: SimEvent): void {
  if (e.type === 'hit') sfx.hit(e.kind ?? 'drive');
  else if (e.type === 'belly') sfx.hit('lift');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') sfx.point();
  else if (e.type === 'gameover') {
    const win = e.scorer === 0;
    // 结算会把 arenaRun 清掉，所以先把本届的身份与赛事名留下来给结算海报用
    const before = run.value;
    const evBefore = before ? arenaEventOf(before.tier, before.cupName) : null;
    const nameBefore = before?.cupName ?? '';
    // 对手也要先拿住（`myOpponent` 是从 arenaRun 算的）
    const foeBefore = myOpponent.value;
    const res = progress.arenaFinishMatch(win);
    if (win) sfx.win();
    else sfx.lose();
    // 「打比赛也在变强」：这一场干了什么 → 五维经验（对手 rating 决定强度系数）
    if (tally.value && foeBefore) {
      const { gains } = progress.gainMatchXp({
        tally: tally.value,
        localIndex: 0,
        win,
        foeKey: foeBefore.id,
        foeRating: foeBefore.rating,
      });
      if (gains.length) toastGood(`🏸 本场训练：${formatGains(gains)}`);
    }
    tally.value = null;
    if (res.finished) {
      lastPlace.value = res.place ?? null;
      lastEvent.value = evBefore;
      lastCupName.value = nameBefore;
      if (win) celebrate(3, ['#ffd45c', '#3d8bfd', '#f2e7c9']);
      resultOpen.value = true;
      phase.value = 'lobby';
    } else {
      phase.value = 'bracket';
    }
  }
}
</script>

<template>
  <div class="page page--playing">
    <PageShell title="晋级赛馆" back @back="back">

      <template #stage>
        <!-- 正在打：羽毛球场景铺满 -->
        <GameCanvas
          v-if="phase === 'match' && run"
          :key="canvasKey"
          role="single"
          :option-id="undefined"
          :opponent="opponentConfig"
          :session="null"
          :cosmetic="customize.cosmetic"
          :attrs="progress.attrs"
          :local-name="lobby.playerName"
          :local-rank="progress.tier.id"
          :theme="ev?.theme"
          :party="false"
          @hud="onHud"
          @sim="onEvent"
        />

        <!-- 树状赛程 -->
        <div v-else-if="phase === 'bracket' && run && cup" class="arena-stage">
          <Panel class="arena-card">
            <div class="arena-head">
              <div>
                <div class="arena-head__title">🏆 {{ run.cupName }}</div>
                <div class="muted arena-head__sub">
                  {{ cup.label }} · 16 人单败 · 当前 {{ roundName }}（第 {{ run.round + 1 }} / 4 轮）
                </div>
                <div v-if="ev" class="arena-head__venue">
                  <span class="arena-venue__dot" :style="{ background: toHex(ev.art[0]) }" />
                  <span>{{ ev.venue }}</span>
                  <span class="arena-venue__chip" :style="{ borderColor: toHex(ev.art[0]) }">
                    {{ ev.label }}
                  </span>
                  <span class="muted">球场主题 · {{ evThemeLabel }}</span>
                </div>
              </div>
              <span class="arena-season">赛季 {{ progress.seasonId }}</span>
            </div>

            <ArenaBracket
              :rounds="run.rounds"
              :entrants="run.entrants"
              :current-round="run.round"
              decorated
              @select="openEntrant"
            />

            <div class="next-match">
              <div class="next-match__title">下一场 · {{ roundName }}</div>
              <div class="next-match__vs">
                <span>{{ me?.name ?? '你' }}</span>
                <b class="next-match__x">VS</b>
                <span>{{ myOpponent?.name ?? '待定' }}</span>
              </div>
              <div class="muted next-match__sub">
                对手风格：{{ myOpponent ? STYLE_META[myOpponent.style].label : '—' }}
                <template v-if="myOpponent">
                  · 难度 {{ opponentTierLabel }} · 积分 {{ myOpponent.rating }}
                </template>
                <template v-if="ev"> · 本场是{{ ev.label }}（{{ ev.venue }}）</template>
              </div>
              <Button variant="primary" block @click="startMatch">开始比赛</Button>
              <p class="muted next-match__hint">返回不会放弃本届，下次进来继续。</p>
            </div>

            <div class="arena-actions">
              <Button variant="quiet" block @click="quitOpen = true">放弃本届（退 20% 报名费）</Button>
            </div>
          </Panel>
        </div>

        <!-- 报名：两步走（先选级别，再选该级别下的赛事），复用独立的报名组件 -->
        <div v-else class="arena-stage">
          <ArenaSignup @signed="onSigned" />
        </div>
      </template>
    </PageShell>

    <!-- 放弃确认 -->
    <AppModal v-model="quitOpen" title="放弃这届杯赛？" max-width="400px">
      <p class="muted quit-note">放弃后本届直接结束，只退还报名费的 20%，成绩不计入名次。</p>
      <div class="quit-actions">
        <Button variant="quiet" block @click="quitOpen = false">继续比赛</Button>
        <Button variant="primary" block @click="confirmQuit">确认放弃</Button>
      </div>
    </AppModal>

    <!-- 本届结算：一张赛事海报 -->
    <AppModal v-model="resultOpen" title="本届结束" max-width="400px">
      <div
        class="poster"
        :style="{
          background: lastEvent
            ? `linear-gradient(135deg, ${toHex(lastEvent.art[0])}, ${toHex(lastEvent.art[1])})`
            : undefined,
        }"
      >
        <div class="poster__cup">{{ lastCupName }}</div>
        <div class="poster__venue">{{ lastEvent?.venue ?? '' }}</div>
      </div>

      <p class="result-line">
        <span class="result-line__medal">{{ placeMedal }}</span>
        <template v-if="lastPlace === 'champion'">夺冠！</template>
        <template v-else>被淘汰 · {{ lastPlace ? PLACE_LABEL[lastPlace] : '' }}</template>
      </p>
      <p v-if="lastEvent" class="muted quit-note">
        {{ lastEvent.label }} · {{ lastEvent.blurb }}
      </p>
      <p class="muted quit-note">奖励已结算，详情看画面上方的提示。该杯赛冷却 5 分钟。</p>
      <Button variant="primary" block @click="closeResult">回到选杯</Button>
    </AppModal>

    <!-- 球员主页（点树状图里的名字打开） -->
    <AppModal v-model="profileOpen" title="球员主页" max-width="620px">
      <PlayerProfile
        v-if="selectedEntrant"
        :name="selectedEntrant.name"
        :style="selectedEntrant.style"
        :rating="selectedEntrant.rating"
        :stats="selectedEntrant.stats"
        :cosmetic="selectedEntrant.cosmetic"
        :is-me="selectedEntrant.isMe"
        :roster="progress.aiNames"
      >
        <Button variant="quiet" block @click="closeEntrant">关闭</Button>
      </PlayerProfile>
    </AppModal>
  </div>
</template>

<style scoped>
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
  width: min(680px, 100%);
  margin: auto 0;
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
  flex: none;
  font-size: 11px;
  color: var(--text-dim);
  text-align: right;
}

.next-match {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  margin-top: var(--s3);
  padding: var(--s3);
  border-radius: var(--r-md);
  border: 1px dashed var(--line);
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

.next-match__hint {
  margin: 0;
  font-size: 11px;
}

.arena-actions {
  margin-top: var(--s3);
}

/* --- 弹窗 --- */
.quit-note {
  margin: 0 0 var(--s3);
  font-size: 13px;
  line-height: 1.6;
}

.quit-actions {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.result-line {
  margin: 0 0 var(--s2);
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.dock-coins {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.dock-pts {
  font-size: 13px;
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

/* --- 赛程页头部：场馆 + 阵容 + 主题 ---------------------------------------- */
.arena-head__venue {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-dim);
}

.arena-venue__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.arena-venue__chip {
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid var(--line);
  color: var(--text);
  font-weight: 600;
}

/* --- 结算海报 --------------------------------------------------------------- */
.poster {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  height: 120px;
  padding: var(--s3) var(--s4);
  margin-bottom: var(--s3);
  border-radius: var(--r-lg);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.poster__cup {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
}

.poster__venue {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.result-line {
  display: flex;
  align-items: center;
  gap: var(--s2);
}

.result-line__medal {
  font-size: 22px;
  line-height: 1;
}
</style>
