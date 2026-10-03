<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import GameCanvas from '../components/GameCanvas.vue';
import ArenaBracket from '../components/ArenaBracket.vue';
import PlayerProfile from '../components/PlayerProfile.vue';
import PageShell from '../components/ui/PageShell.vue';
import SideDock from '../components/ui/SideDock.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import AppModal from '../components/ui/AppModal.vue';
import type { HudState, MatchOpponent } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import { STYLE_META, tierFromStats } from '../game/ai';
import {
  ARENA_ROUNDS,
  ARENA_TIERS,
  PLACE_LABEL,
  arenaByTier,
  goldForPlace,
  honorForPlace,
  type ArenaEntrant,
  type ArenaPlace,
} from '../game/arena';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';
import { celebrate } from '../composables/celebrate';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';
import { useGameStore } from '../stores/game';

/**
 * 晋级赛馆：滑动卡片选杯 → 树状赛程 → 逐场开打。
 * 一届 16 人单败（16强/8强/4强/决赛），每场一局定胜负；打完一届该杯赛冷却 5 分钟。
 * 报名后没开打就返回 = 直接走人，本届保留，下次进来继续。
 */
const router = useRouter();
const progress = useProgressStore();
const customize = useCustomizeStore();
const lobby = useLobbyStore();
const game = useGameStore();

const phase = ref<'lobby' | 'bracket' | 'match'>('lobby');
const hud = ref<HudState | null>(null);
const quitOpen = ref(false);
const resultOpen = ref(false);
const lastPlace = ref<ArenaPlace | null>(null);

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

/* --- 冷却倒计时（每秒刷新） ------------------------------------------------ */
const nowTick = ref(Date.now());
let timer: number | undefined;
onMounted(() => {
  timer = window.setInterval(() => (nowTick.value = Date.now()), 1000);
  if (run.value) phase.value = 'bracket';
});
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});

function cooldownLeft(tier: string): number {
  return Math.max(0, (progress.arenaCooldown[tier] ?? 0) - nowTick.value);
}
function fmtCd(ms: number): string {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/* --- 操作 ------------------------------------------------------------------ */
function signup(tier: (typeof ARENA_TIERS)[number]['tier']): void {
  sfx.click();
  const r = progress.enterArena(tier, lobby.playerName);
  if (!r.ok) {
    toastWarn(r.message);
    return;
  }
  toastGood(r.message);
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
}

function onEvent(e: SimEvent): void {
  if (e.type === 'hit') sfx.hit(e.kind ?? 'drive');
  else if (e.type === 'belly') sfx.hit('lift');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') sfx.point();
  else if (e.type === 'gameover') {
    const win = e.scorer === 0;
    const res = progress.arenaFinishMatch(win);
    if (win) sfx.win();
    else sfx.lose();
    if (res.finished) {
      lastPlace.value = res.place ?? null;
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
      <template #dock>
        <SideDock>
          <span class="dock-coins">🪙 {{ progress.coins }}</span>
          <div class="dock-pts num">积分 {{ progress.points }}</div>
          <div v-if="run && cup" class="dock-run">{{ run.cupName }} · {{ roundName }}</div>
          <p class="dock-note">
            16 人单败，每场一局定胜负。打完一届该杯赛冷却 5 分钟，赛季每月清零。
          </p>
        </SideDock>
      </template>

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
          :local-rank="run.tier"
          :theme="customize.theme"
          :auto-cycle-theme="customize.autoCycle"
          :party="false"
          @hud="onHud"
          @sim="onEvent"
          @themechange="customize.theme = $event"
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
              </div>
              <span class="arena-season">赛季 {{ progress.seasonId }}</span>
            </div>

            <ArenaBracket
              :rounds="run.rounds"
              :entrants="run.entrants"
              :current-round="run.round"
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
              </div>
              <Button variant="primary" block @click="startMatch">开始比赛</Button>
              <p class="muted next-match__hint">返回不会放弃本届，下次进来继续。</p>
            </div>

            <div class="arena-actions">
              <Button variant="quiet" block @click="quitOpen = true">放弃本届（退 20% 报名费）</Button>
            </div>
          </Panel>
        </div>

        <!-- 选杯：左右滑动的卡片 -->
        <div v-else class="arena-stage">
          <div class="lobby-wrap">
            <div class="lobby-head">
              <div class="lobby-head__title">🏆 报名杯赛</div>
              <div class="muted lobby-head__sub">
                积分 {{ progress.points }} · 左右滑动选杯赛，按积分逐档解锁，打完冷却 5 分钟
              </div>
            </div>

            <div class="cup-scroller">
              <div
                v-for="c in ARENA_TIERS"
                :key="c.tier"
                class="cup-card"
                :class="{ 'is-locked': progress.points < c.req }"
              >
                <div class="cup-card__cup">{{ c.glyph }} {{ c.cup }}</div>
                <div class="muted cup-card__group">
                  {{ c.label }} · {{ c.names.length }} 个赛事名每届轮换
                </div>

                <div class="cup-card__meta">
                  <div>门槛 <b class="num">{{ c.req }}</b> 分</div>
                  <div>报名 <b class="num">🪙{{ c.fee }}</b></div>
                  <div>冠军 <b class="num">🪙{{ goldForPlace(c, 'champion', 4) }}</b></div>
                  <div>冠军积分 <b class="num">+{{ c.points }}</b></div>
                  <div>冠军荣誉 <b class="num">🏅{{ honorForPlace(c.tier, 'champion') }}</b></div>
                </div>

                <div class="cup-card__foot">
                  <span v-if="cooldownLeft(c.tier) > 0" class="cup-card__cd num">
                    冷却中 {{ fmtCd(cooldownLeft(c.tier)) }}
                  </span>
                  <span v-else-if="progress.points < c.req" class="cup-card__cd">
                    🔒 还差 {{ c.req - progress.points }} 分
                  </span>
                  <Button
                    v-else
                    variant="primary"
                    block
                    @click="signup(c.tier)"
                  >
                    报名 · 🪙{{ c.fee }}
                  </Button>
                </div>
              </div>
            </div>
          </div>
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

    <!-- 本届结算 -->
    <AppModal v-model="resultOpen" title="本届结束" max-width="400px">
      <p class="result-line">
        <template v-if="lastPlace === 'champion'">🏆 夺冠！</template>
        <template v-else>被淘汰 · {{ lastPlace ? PLACE_LABEL[lastPlace] : '' }}</template>
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

/* --- 选杯卡片 --- */
.lobby-wrap {
  width: min(760px, 100%);
  margin: auto 0;
}

.lobby-head {
  margin-bottom: var(--s3);
  text-align: center;
}

.lobby-head__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.lobby-head__sub {
  margin-top: 2px;
  font-size: 12px;
}

.cup-scroller {
  display: flex;
  gap: var(--s3);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: var(--s1) var(--s1) var(--s3);
}

.cup-card {
  flex: none;
  width: 224px;
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  padding: var(--s3);
  border-radius: var(--r-lg);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--e2);
}

.cup-card.is-locked {
  opacity: 0.62;
}

.cup-card__cup {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.cup-card__group {
  font-size: 11px;
}

.cup-card__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--text-dim);
}

.cup-card__meta b {
  color: var(--text);
}

.cup-card__foot {
  margin-top: auto;
  padding-top: var(--s2);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cup-card__cd {
  text-align: center;
  font-size: 12px;
  color: var(--text-dim);
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
</style>
