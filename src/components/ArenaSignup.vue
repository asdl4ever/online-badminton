<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import ArenaEventCard from './ArenaEventCard.vue';
import Button from './ui/Button.vue';
import { ARENA_TIERS, goldForPlace, honorForPlace } from '../game/arena';
import { ARENA_EVENTS, arenaEventOf } from '../game/arena-events';
import { anyOpenNow, fmtClock, nextStartIn, phaseOf, slotOf } from '../game/arena-schedule';
import { toHex } from '../game/cosmetics';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';
import { useProgressStore } from '../stores/progress';
import { useLobbyStore } from '../stores/lobby';

/**
 * 晋级赛的**报名界面**（两步：先选级别 → 再从该级别的 6 场赛事里挑一场）。
 *
 * 抽成组件是为了复用：晋级赛馆（`ArenaView`）与大地图上的平板
 * （`TabletPanel` 的「赛事报名」App）用的是同一份界面与同一套逻辑。
 *
 * 每场赛事有自己的开赛时刻与报名窗口（见 `game/arena-schedule.ts`）：
 * 窗口内点「报名」，未开赛点「预约」到点自动开赛，过点了等下一场。
 * 报名成功 emit `signed`，父级决定接下来的动作（进赛程 / 跳去比赛）。
 */
const props = defineProps<{
  /** 平板里用：窄一点、内边距小一点 */
  compact?: boolean;
}>();

const emit = defineEmits<{ signed: [message: string] }>();

const progress = useProgressStore();
const lobby = useLobbyStore();

/* --- 每秒刷新：冷却 / 距开赛 / 距截止都靠它走 ------------------------------- */
const nowTick = ref(Date.now());
let timer: number | undefined;
onMounted(() => {
  timer = window.setInterval(() => (nowTick.value = Date.now()), 1000);
});
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});

function cooldownLeft(tier: string): number {
  return Math.max(0, (progress.arenaCooldown[tier] ?? 0) - nowTick.value);
}

/* --- 两步报名 ----------------------------------------------------------------- */
const pickedTier = ref<string | null>(null);
const picked = computed(() => ARENA_TIERS.find((t) => t.tier === pickedTier.value) ?? null);

function pickTier(id: string): void {
  const t = ARENA_TIERS.find((x) => x.tier === id);
  if (!t) return;
  sfx.click();
  if (progress.points < t.req) {
    toastWarn(`还差 ${t.req - progress.points} 积分解锁「${t.label}」`);
    return;
  }
  pickedTier.value = id;
}

function backToTiers(): void {
  sfx.click();
  pickedTier.value = null;
}

/** 第二步里一场赛事的当前状态（每秒随 nowTick 重算） */
interface EventState {
  name: string;
  event: ReturnType<typeof arenaEventOf>;
  phase: ReturnType<typeof phaseOf>;
  startIn: number;
  closeIn: number;
  nextIn: number;
  cooldownIn: number;
  booked: boolean;
  locked: boolean;
  lockedPoints: number;
}

const eventStates = computed<EventState[]>(() => {
  const t = picked.value;
  if (!t) return [];
  const now = nowTick.value;
  return t.names.map((name, i) => {
    const slot = slotOf(t.tier, i, now);
    return {
      name,
      event: arenaEventOf(t.tier, name),
      phase: phaseOf(slot, now),
      startIn: slot.startAt - now,
      closeIn: slot.closesAt - now,
      nextIn: slot.nextStartAt - now,
      cooldownIn: cooldownLeft(t.tier),
      booked: progress.arenaBooking[t.tier]?.cupName === name,
      locked: progress.points < t.req,
      lockedPoints: Math.max(0, t.req - progress.points),
    };
  });
});

/** 档位卡底部那行「现在有没有场可打」的速览 */
function tierSummary(tier: string): string {
  const now = nowTick.value;
  if (cooldownLeft(tier) > 0) return `冷却中 ${fmtClock(cooldownLeft(tier))}`;
  return anyOpenNow(tier, now)
    ? '🔴 现在有场可打'
    : `下一场 ${fmtClock(nextStartIn(tier, now))} 后开赛`;
}

/** 这一档的对手强度 vs 玩家五维综合分：给出量级标签（报名界面用来预估强不强） */
function powerLabel(tier: string): { text: string; tone: string } {
  const d = progress.myStatPower - (progress.arenaTierPower[tier] ?? 0);
  if (d >= 18) return { text: '碾压', tone: 'p-easy' };
  if (d >= 6) return { text: '占优', tone: 'p-good' };
  if (d >= -6) return { text: '势均', tone: 'p-even' };
  if (d >= -18) return { text: '吃力', tone: 'p-hard' };
  return { text: '悬殊', tone: 'p-brutal' };
}

/** 报名：只有该场赛事正处在报名窗口内才能报（窗口外只能预约或等下一场） */
function signupEvent(tier: string, eventName: string): void {
  sfx.click();
  const r = progress.enterArena(tier, lobby.playerName, eventName);
  if (!r.ok) {
    toastWarn(r.message);
    return;
  }
  toastGood(r.message);
  pickedTier.value = null;
  emit('signed', r.message);
}

/** 预约一场还没开赛的赛事（到点由全局心跳自动开赛） */
function bookEvent(tier: string, eventName: string): void {
  sfx.click();
  const r = progress.bookArena(tier, eventName);
  if (r.ok) toastGood(r.message);
  else toastWarn(r.message);
}

function cancelBooking(tier: string): void {
  sfx.click();
  if (progress.cancelBooking(tier)) toastWarn('已取消预约');
}
</script>

<template>
  <div class="signup" :class="{ 'is-compact': props.compact }">
    <!-- 第二步：该级别下的 6 场赛事（各有开赛时刻、场馆与对手阵容） -->
    <template v-if="picked">
      <div class="lobby-head">
        <div class="lobby-head__title">{{ picked.glyph }} {{ picked.label }}</div>
        <div class="muted lobby-head__sub">
          报名 🪙{{ picked.fee }} · 冠军 🪙{{ goldForPlace(picked, 'champion', 4) }} / +{{
            picked.points
          }}
          分 / 🏅{{ honorForPlace(picked.tier, 'champion') }} · 16 人单败，每场一局定胜负
        </div>
      </div>

      <div class="cup-scroller">
        <ArenaEventCard
          v-for="s in eventStates"
          :key="s.name"
          :name="s.name"
          :event="s.event"
          :phase="s.phase"
          :start-in="s.startIn"
          :close-in="s.closeIn"
          :next-in="s.nextIn"
          :cooldown-in="s.cooldownIn"
          :fee="picked.fee"
          :booked="s.booked"
          :locked="s.locked"
          :locked-points="s.lockedPoints"
          @signup="signupEvent(picked.tier, s.name)"
          @book="bookEvent(picked.tier, s.name)"
          @cancel="cancelBooking(picked.tier)"
        />
      </div>

      <div class="lobby-foot">
        <Button variant="quiet" size="sm" @click="backToTiers">← 换个级别</Button>
      </div>
    </template>

    <!-- 第一步：级别卡片（上=级别，下=该级别的赛事名） -->
    <template v-else>
      <div class="lobby-head">
        <div class="lobby-head__title">🏆 报名赛事</div>
        <div class="muted lobby-head__sub">
          积分 {{ progress.points }} · 先选级别，点进去再选具体赛事；按积分逐档解锁，打完冷却 5 分钟
        </div>
      </div>

      <div class="cup-scroller">
        <div
          v-for="c in ARENA_TIERS"
          :key="c.tier"
          class="cup-card"
          :class="{ 'is-locked': progress.points < c.req }"
          role="button"
          @click="pickTier(c.tier)"
        >
          <div class="cup-card__cup">{{ c.glyph }} {{ c.label }}</div>
          <div class="muted cup-card__group">{{ c.names.join('、') }}</div>

          <!-- 这一档的 6 场赛事固定会遇到这 6 种对手阵容 -->
          <div class="roster-row">
            <span
              v-for="e in ARENA_EVENTS"
              :key="e.key"
              class="roster-chip"
              :style="{
                borderColor: toHex(e.art[0]),
                background: `color-mix(in srgb, ${toHex(e.art[0])} 14%, #ffffff)`,
              }"
            >
              {{ e.label }}
            </span>
          </div>

          <div class="cup-card__meta">
            <div>
              对手强度 <b class="num">≈{{ progress.arenaTierPower[c.tier] ?? 0 }}</b> · 你
              <b class="num">{{ progress.myStatPower }}</b> ·
              <span class="tone" :class="powerLabel(c.tier).tone">{{ powerLabel(c.tier).text }}</span>
            </div>
            <div>门槛 <b class="num">{{ c.req }}</b> 分</div>
            <div>报名 <b class="num">🪙{{ c.fee }}</b></div>
            <div>冠军 <b class="num">🪙{{ goldForPlace(c, 'champion', 4) }}</b></div>
            <div>冠军积分 <b class="num">+{{ c.points }}</b></div>
            <div>冠军荣誉 <b class="num">🏅{{ honorForPlace(c.tier, 'champion') }}</b></div>
          </div>

          <div class="cup-card__foot">
            <span v-if="cooldownLeft(c.tier) > 0" class="cup-card__cd num">
              冷却中 {{ fmtClock(cooldownLeft(c.tier)) }}
            </span>
            <span v-else-if="progress.points < c.req" class="cup-card__cd">
              🔒 还差 {{ c.req - progress.points }} 分
            </span>
            <span v-else class="cup-card__cd num">{{ tierSummary(c.tier) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.signup {
  width: min(760px, 100%);
  margin: auto 0;
}

.signup.is-compact {
  width: 100%;
  margin: 0;
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

.lobby-foot {
  display: flex;
  justify-content: center;
  margin-top: var(--s3);
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

/* 第一步的级别卡整卡可点 */
.cup-card[role='button'] {
  cursor: pointer;
  transition:
    transform var(--dur-1, 0.15s) var(--ease, ease),
    border-color var(--dur-1, 0.15s) var(--ease, ease);
}

.cup-card[role='button']:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--accent) 55%, var(--line));
}

.cup-card[role='button']:active {
  transform: scale(0.98);
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

/* --- 这一档会遇到的 6 种对手阵容 -------------------------------------------- */
.roster-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.roster-chip {
  padding: 1px 7px;
  border-radius: 999px;
  border: 1px solid var(--line);
  font-size: 10px;
  color: var(--text);
  white-space: nowrap;
}

/* --- 对手强度量级标签 ---------------------------------------------------------- */
.tone {
  font-weight: 700;
}
.tone.p-easy {
  color: #1f9d55;
}
.tone.p-good {
  color: #3d8bfd;
}
.tone.p-even {
  color: var(--text-dim);
}
.tone.p-hard {
  color: #d9822b;
}
.tone.p-brutal {
  color: #d64545;
}
</style>
