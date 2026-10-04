<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ArenaSignup from './ArenaSignup.vue';
import Button from './ui/Button.vue';
import GameCanvas from './GameCanvas.vue';
import LeaderboardApp from './LeaderboardApp.vue';
import NewsPaper from './NewsPaper.vue';
import { arenaByTier } from '../game/arena';
import { arenaEventOf } from '../game/arena-events';
import { fmtClock } from '../game/arena-schedule';
import { sfx } from '../game/audio';
import { toastWarn } from '../composables/useToast';
import { ensureStats, type AiPlayer } from '../game/players';
import type { MatchOpponent } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';
import { useProgressStore } from '../stores/progress';

/**
 * 大地图上的那台平板（角色右手边那台，点它弹出来）。
 *
 * 界面是一个「ArenaOS」：主屏上一排应用，其中**赛事报名**直接复用晋级赛馆的报名组件
 * （`ArenaSignup`）——所以平板里报的名、预约的场次，和去晋级赛馆里操作完全一样。
 * 「我的预约」把 `progress.arenaBooking` 列出来，带开赛倒计时；到点由全局心跳自动开赛
 * （`App.vue` 会响铃提醒）。
 *
 * 另外两个应用是内嵌的：**🏅 排行榜**（`LeaderboardApp`，原「名人堂」的只读版，
 * 点球员看主页、可以挑战）和 **📰 新闻周刊**（`NewsPaper`，和 `/news` 整页同一份）。
 * 挑战要打一局正式对局，平板这屏装不下 —— 所以挑战时平板让位，**整屏**开一局
 * （`GameCanvas` 全屏覆盖层，退出后回到平板）。
 */
const props = defineProps<{ modelValue: boolean }>();

const emit = defineEmits<{
  'update:modelValue': [boolean];
  signed: [];
  /** 挑战对局开 / 关（大世界据此屏蔽键盘走动，免得一边打球一边把人走丢） */
  duel: [boolean];
}>();

const router = useRouter();
const progress = useProgressStore();
const customize = useCustomizeStore();
const lobby = useLobbyStore();

type AppId = 'signup' | 'bookings' | 'rank' | 'news';
const app = ref<AppId | null>(null);

/** 状态栏里写的应用名 */
const APP_TITLE: Record<AppId, string> = {
  signup: '赛事报名',
  bookings: '我的预约',
  rank: '排行榜',
  news: '新闻周刊',
};

/** 时钟 + 倒计时：只在平板打开时走表 */
const nowTick = ref(Date.now());
let timer: number | undefined;
onMounted(() => {
  timer = window.setInterval(() => (nowTick.value = Date.now()), 1000);
});
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});

const clock = computed(() => {
  const d = new Date(nowTick.value);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
});

/** 待开赛的预约（按档位列出来，带倒计时） */
const bookings = computed(() =>
  Object.entries(progress.arenaBooking)
    .map(([tier, b]) => {
      const t = arenaByTier(tier);
      const ev = arenaEventOf(tier, b.cupName);
      return {
        tier,
        label: t.label,
        glyph: t.glyph,
        cupName: b.cupName,
        venue: ev.venue,
        eventLabel: ev.label,
        left: Math.max(0, b.startAt - nowTick.value),
      };
    })
    .sort((a, b) => a.left - b.left),
);

const run = computed(() => progress.arenaRun);
const runInfo = computed(() => {
  const r = run.value;
  if (!r) return null;
  const t = arenaByTier(r.tier);
  return { cup: r.cupName, tier: t.label, round: r.round + 1 };
});

function close(): void {
  sfx.click();
  if (duel.value) quitDuel();
  app.value = null;
  emit('update:modelValue', false);
}

function openApp(id: AppId): void {
  sfx.click();
  app.value = id;
}

function home(): void {
  sfx.click();
  app.value = null;
}

/** 报名成功（报名界面 emit）→ 关掉平板直接去比赛 */
function onSigned(): void {
  app.value = null;
  emit('update:modelValue', false);
  emit('signed');
}

function cancelBooking(tier: string): void {
  sfx.click();
  if (progress.cancelBooking(tier)) toastWarn('已取消预约');
}

function go(path: string): void {
  sfx.click();
  close();
  void router.push(path);
}

/* --- ⚔️ 挑战：整屏打一局（比分 / 体力 / 摇杆都由 GameCanvas 自己画）--------- */
const duel = ref<MatchOpponent | null>(null);
const duelId = ref('');
const duelResult = ref<'win' | 'lose' | null>(null);
/** 每一场自增：重挂画布，换局不换人 */
const duelRound = ref(0);

/** 排行榜里点了「挑战」：对手的装扮与四维直接取自名人堂名录 */
function onChallenge(p: AiPlayer): void {
  sfx.click();
  duelId.value = p.id;
  duel.value = { name: p.name, cosmetic: p.cosmetic, stats: ensureStats(p) };
  duelResult.value = null;
  duelRound.value += 1;
  emit('duel', true);
}

function rematch(): void {
  sfx.click();
  duelResult.value = null;
  duelRound.value += 1;
}

function quitDuel(): void {
  duel.value = null;
  duelResult.value = null;
  duelId.value = '';
  emit('duel', false);
}

/** 打完结算：记玩家自己的战绩 + 该球员的战绩（和原来名人堂里的挑战一致） */
function onDuelSim(e: SimEvent): void {
  if (e.type === 'hit') sfx.hit(e.kind ?? 'drive');
  else if (e.type === 'belly') sfx.hit('lift');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') sfx.point();
  else if (e.type === 'gameover') {
    sfx.point();
    if (!duelResult.value) {
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
  <!-- 传送到 body：地图页面外面套着带 backdrop-filter 的玻璃外壳，
       那会变成 fixed 定位的包含块，平板就会被裁在页面里 -->
  <Teleport to="body">
    <!-- 挑战时平板整块让位，改由下面的全屏对局接管 -->
    <div v-if="props.modelValue && !duel" class="tbl" role="dialog" aria-label="平板">
      <div class="tbl__scrim" @click="close" />

      <!-- 平板本体：横向，左边一颗摄像头、底部一条 home 指示条 -->
      <div class="tbl__frame">
        <span class="tbl__cam" aria-hidden="true" />
        <div class="tbl__screen">
          <!-- 状态栏 -->
          <div class="tbl__bar">
            <span class="tbl__bar-left">
              <button v-if="app" class="tbl__back" type="button" @click="home">← 主屏幕</button>
              <b v-else>🏸 ArenaOS</b>
              <span v-if="app" class="tbl__bar-app">{{ APP_TITLE[app] }}</span>
            </span>
            <span class="tbl__bar-right num">
              {{ clock }}
              <span class="tbl__glyph">📶 🔋</span>
            </span>
          </div>

          <!-- 主屏幕：应用网格 -->
          <div v-if="!app" class="tbl__home">
            <p class="tbl__hello">今天想打哪一场？</p>
            <div class="tbl__grid">
              <button class="tbl-app" type="button" @click="openApp('signup')">
                <span class="tbl-app__icon tbl-app__icon--arena">🏆</span>
                <span class="tbl-app__name">赛事报名</span>
              </button>
              <button class="tbl-app" type="button" @click="openApp('bookings')">
                <span class="tbl-app__icon tbl-app__icon--book">⏰</span>
                <span class="tbl-app__name">我的预约</span>
                <span v-if="bookings.length" class="tbl-app__badge num">
                  {{ bookings.length }}
                </span>
              </button>
              <button class="tbl-app" type="button" @click="go('/watch')">
                <span class="tbl-app__icon tbl-app__icon--watch">📺</span>
                <span class="tbl-app__name">赛事中心</span>
              </button>
              <button class="tbl-app" type="button" @click="openApp('rank')">
                <span class="tbl-app__icon tbl-app__icon--rank">🏅</span>
                <span class="tbl-app__name">排行榜</span>
              </button>
              <button class="tbl-app" type="button" @click="openApp('news')">
                <span class="tbl-app__icon tbl-app__icon--news">📰</span>
                <span class="tbl-app__name">新闻周刊</span>
              </button>
            </div>

            <p v-if="runInfo" class="tbl__ticker">
              🔴 进行中：{{ runInfo.cup }}（{{ runInfo.tier }} · 第 {{ runInfo.round }} 轮）
            </p>
            <p v-else class="tbl__ticker muted">
              没有进行中的赛事 · 想打就进来报名，未开赛可以先预约
            </p>
          </div>

          <!-- 应用：赛事报名（复用晋级赛馆那一份） -->
          <div v-else-if="app === 'signup'" class="tbl__app">
            <ArenaSignup compact @signed="onSigned" />
          </div>

          <!-- 应用：🏅 排行榜（原「名人堂」的只读版：点球员看主页、可以挑战） -->
          <div v-else-if="app === 'rank'" class="tbl__app">
            <LeaderboardApp @challenge="onChallenge" />
          </div>

          <!-- 应用：📰 新闻周刊（和 `/news` 整页同一份正文，只是小一号） -->
          <div v-else-if="app === 'news'" class="tbl__app">
            <NewsPaper compact />
          </div>

          <!-- 应用：我的预约 -->
          <div v-else-if="app === 'bookings'" class="tbl__app">
            <div v-if="runInfo" class="bk-card">
              <div class="bk-card__title">🏸 本届进行中</div>
              <div class="muted bk-card__sub">
                {{ runInfo.cup }} · {{ runInfo.tier }} · 第 {{ runInfo.round }} 轮
              </div>
              <Button variant="primary" block @click="go('/arena')">去打完这一届</Button>
            </div>

            <p v-if="!bookings.length" class="muted bk-empty">
              还没有预约。在「赛事报名」里点一场<b>未开赛</b>的赛事就能预约，到点手机会响。
            </p>

            <div v-for="b in bookings" :key="b.tier" class="bk-row">
              <div class="bk-row__main">
                <div class="bk-row__cup">
                  {{ b.glyph }} {{ b.cupName }}
                  <span class="muted">{{ b.label }}</span>
                </div>
                <div class="muted bk-row__venue">{{ b.eventLabel }} · {{ b.venue }}</div>
              </div>
              <div class="bk-row__right">
                <span class="bk-row__cd num">{{ fmtClock(b.left) }}</span>
                <Button size="sm" variant="quiet" @click="cancelBooking(b.tier)">取消</Button>
              </div>
            </div>
          </div>

          <span class="tbl__indicator" aria-hidden="true" />
        </div>
      </div>
    </div>

    <!-- ⚔️ 挑战：整屏一局（平板那屏放不下对局，直接让 GameCanvas 铺满整屏）。
         摇杆 / 比分 / 体力条都由 GameCanvas 自己画，这里只加退出与「再战」。 -->
    <div v-if="duel" class="duel">
      <GameCanvas
        :key="`duel-${duel.name}-${duelRound}`"
        role="single"
        :session="null"
        :opponent="duel"
        :no-rematch="true"
        :cosmetic="customize.cosmetic"
        :local-name="lobby.playerName"
        :local-rank="progress.tier.id"
        :party="false"
        @sim="onDuelSim"
      />
      <button class="duel__exit" type="button" @click="quitDuel">← 退出</button>
      <div class="duel__banner">
        <span class="num">
          <template v-if="duelResult === 'win'">🏆 你赢了 {{ duel.name }}！</template>
          <template v-else-if="duelResult === 'lose'">你输给了 {{ duel.name }}，要再来吗？</template>
          <template v-else>⚔️ 挑战 {{ duel.name }}（先到 11 分）</template>
        </span>
        <Button v-if="duelResult" size="sm" @click="rematch">再战一场</Button>
        <Button size="sm" variant="quiet" @click="quitDuel">返回平板</Button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.tbl {
  position: fixed;
  inset: 0;
  z-index: 58;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--s4);
}

.tbl__scrim {
  position: absolute;
  inset: 0;
  background: rgba(20, 24, 30, 0.42);
  backdrop-filter: blur(3px);
}

.tbl__frame {
  position: relative;
  width: min(780px, 94vw);
  height: min(72vh, 540px);
  padding: 14px;
  border-radius: 28px;
  background: linear-gradient(160deg, #3a4048, #14171c 60%);
  box-shadow:
    0 30px 70px rgba(0, 0, 0, 0.45),
    inset 0 0 0 2px rgba(255, 255, 255, 0.14);
}

.tbl__cam {
  position: absolute;
  left: 5px;
  top: 50%;
  width: 6px;
  height: 6px;
  margin-top: -3px;
  border-radius: 50%;
  background: #0a0c10;
  box-shadow: inset 0 0 0 1px rgba(120, 160, 220, 0.5);
}

.tbl__screen {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background:
    radial-gradient(120% 80% at 12% 0%, #fffdf6 0%, rgba(255, 253, 246, 0) 60%),
    linear-gradient(180deg, #f7f2e6, #efe7d6);
}

.tbl__bar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s2);
  padding: 6px var(--s3);
  font-size: 12px;
  color: var(--text-dim);
  border-bottom: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
  background: color-mix(in srgb, #ffffff 55%, transparent);
}

.tbl__bar-left {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  color: var(--text);
}

.tbl__bar-app {
  font-weight: 700;
}

.tbl__bar-right {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tbl__glyph {
  font-size: 11px;
  letter-spacing: -1px;
}

.tbl__back {
  border: 1px solid var(--line);
  background: color-mix(in srgb, #ffffff 70%, transparent);
  color: var(--text);
  font: inherit;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  cursor: pointer;
}

.tbl__back:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* --- 主屏幕 ---------------------------------------------------------------- */
.tbl__home {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: var(--s3);
  padding: var(--s4) var(--s5);
  overflow-y: auto;
}

.tbl__hello {
  margin: 0;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.tbl__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: var(--s3);
}

.tbl-app {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: var(--s2);
  border: 1px solid transparent;
  border-radius: var(--r-md);
  background: transparent;
  cursor: pointer;
  transition:
    transform var(--dur-1) var(--ease),
    background var(--dur-1) var(--ease);
}

.tbl-app:hover {
  transform: translateY(-2px);
  background: color-mix(in srgb, #ffffff 60%, transparent);
}

.tbl-app:active {
  transform: scale(0.96);
}

.tbl-app__icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  font-size: 28px;
  border-radius: 16px;
  box-shadow: 0 6px 14px rgba(90, 70, 30, 0.22);
}

.tbl-app__icon--arena {
  background: linear-gradient(160deg, #ffd88a, #f0a03c);
}

.tbl-app__icon--book {
  background: linear-gradient(160deg, #b9e3ff, #5aa8ff);
}

.tbl-app__icon--watch {
  background: linear-gradient(160deg, #ffc9c9, #e4622f);
}

.tbl-app__icon--rank {
  background: linear-gradient(160deg, #d8ccff, #6a5aa8);
}

.tbl-app__icon--news {
  background: linear-gradient(160deg, #f4e7c6, #b4884a);
}

.tbl-app__name {
  font-size: 12px;
  color: var(--text);
}

.tbl-app__badge {
  position: absolute;
  top: 2px;
  right: 12px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #d64545;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.tbl__ticker {
  margin: auto 0 0;
  padding: 6px 10px;
  border-radius: var(--r-md);
  border: 1px dashed var(--line);
  font-size: 12px;
  color: var(--text);
}

/* --- 应用区 ---------------------------------------------------------------- */
.tbl__app {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: var(--s3) var(--s3) var(--s5);
}

.bk-card {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  padding: var(--s3);
  margin-bottom: var(--s3);
  border-radius: var(--r-md);
  border: 1px solid color-mix(in srgb, var(--accent) 45%, var(--line));
  background: color-mix(in srgb, #ffffff 62%, transparent);
}

.bk-card__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.bk-card__sub {
  font-size: 12px;
}

.bk-empty {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}

.bk-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  padding: var(--s2) var(--s3);
  margin-bottom: var(--s2);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: color-mix(in srgb, #ffffff 62%, transparent);
}

.bk-row__cup {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.bk-row__venue {
  font-size: 11px;
}

.bk-row__right {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
}

.bk-row__cd {
  font-size: 15px;
  font-weight: 700;
  color: var(--accent);
}

.tbl__indicator {
  flex: none;
  align-self: center;
  width: 110px;
  height: 4px;
  margin: 4px 0 6px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--text) 25%, transparent);
}

/* --- ⚔️ 挑战：整屏对局 ------------------------------------------------------ */
.duel {
  position: fixed;
  inset: 0;
  z-index: 62;
  background: #0b1a2b;
}

.duel__exit {
  position: absolute;
  left: max(12px, env(safe-area-inset-left));
  top: calc(var(--ui-top-h) + 12px);
  z-index: 5;
  padding: 4px 14px;
  border-radius: var(--r-pill);
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(10, 16, 28, 0.55);
  color: #eaf2fb;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.duel__banner {
  position: absolute;
  top: calc(var(--ui-top-h) + 12px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: 4px 16px;
  border-radius: var(--r-pill);
  background: rgba(10, 16, 28, 0.55);
  color: #eaf2fb;
  font-size: 13px;
  white-space: nowrap;
}

@media (max-width: 560px) {
  .tbl__frame {
    height: min(80vh, 480px);
    padding: 10px;
    border-radius: 22px;
  }

  .duel__banner {
    font-size: 12px;
    max-width: 92vw;
    overflow: hidden;
  }

  .tbl__home {
    padding: var(--s3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tbl-app {
    transition: none;
  }
}
</style>
