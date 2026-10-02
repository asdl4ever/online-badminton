<script setup lang="ts">
import Phaser from 'phaser';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import SideDock from '../components/ui/SideDock.vue';
import Button from '../components/ui/Button.vue';
import StatusChip from '../components/ui/StatusChip.vue';
import AppModal from '../components/ui/AppModal.vue';
import { DiveScene, type DiveBagState, type DiveSceneData } from '../game/dive/DiveScene';
import {
  bagLimits,
  BOAT_COST,
  gearStats,
  ISLANDS,
  islandById,
  MAX_LEVEL,
  oxygenMax,
  SPECIES,
  upgradeCost,
} from '../game/dive/fish';
import { VIEW_H, VIEW_W } from '../game/constants';
import { ITEMS } from '../game/items';
import { applyTheme } from '../game/theme';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';
import { hostOpen, joinMatch } from '../net/connect';
import { normaliseCode, type NetLink } from '../net/link';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';
import { useProgressStore } from '../stores/progress';

/**
 * 潜水（原来的岸边抛竿换成了这个）：下潜抓鱼 → 回水面卖钱 → 升级氧气/背包/渔具 → 买船去更远的海岛。
 * 玩法本体在 `game/dive/DiveScene.ts`，这里只负责岸上的部分（升级、出海、卖鱼、联机）。
 */
const router = useRouter();
const customize = useCustomizeStore();
const lobby = useLobbyStore();
const progress = useProgressStore();

const container = ref<HTMLDivElement | null>(null);
let game: Phaser.Game | null = null;
let link: NetLink | null = null;

const bag = ref<DiveBagState>({ count: 0, kg: 0, value: 0, items: [] });
const sessionCaught = ref(0);
const sessionEarned = ref(0);
const joinCode = ref('');
const roomCode = ref('');
const waiting = ref(false);
const phase = ref('');
/** 点岸边那条船弹出来的小卡片（原来是一个「出海选项页」） */
const boatOpen = ref(false);
const codexOpen = ref(false);
const shopOpen = ref(false);
/** 人是不是已经上岸 / 有没有站在装备店门口 / 有没有靠在船边 */
const onLand = ref(false);
const nearHut = ref(false);
const nearBoat = ref(false);

/** 现在能去的海岛：渔具等级够的那些（其余的先升渔具） */
const sailable = computed(() =>
  ISLANDS.filter((i) => i.id !== progress.island && progress.rodLevel >= i.gear),
);

/** 出海前还得背包空、船钱够 */
function sailReady(i: (typeof ISLANDS)[number]): boolean {
  return bag.value.count === 0 && progress.coins >= i.cost;
}

/** 按钮上直接写清为什么还不能走 */
function sailWhy(i: (typeof ISLANDS)[number]): string {
  if (progress.coins < i.cost) return `差 ¥${i.cost - progress.coins}`;
  return '先卖鱼';
}

function openBoat(): void {
  sfx.click();
  boatOpen.value = true;
}

const island = computed(() => islandById(progress.island));
const limits = computed(() => bagLimits(progress.bagLv));
const gear = computed(() => gearStats(progress.rodLevel));
const oxygenTop = computed(() => oxygenMax(progress.oxygenLv));

const codex = computed(() =>
  SPECIES.map((s) => {
    const log = progress.fishLog[s.id];
    return { s, count: log?.count ?? 0, best: log?.best ?? 0, shiny: log?.shiny ?? 0 };
  }),
);

// ---- 每日钓鱼任务 -------------------------------------------------------------
progress.ensureFishTask();
const task = computed(() => progress.fishTask);
const taskPct = computed(() =>
  task.value.goal ? Math.min(1, progress.fishTaskProg / task.value.goal) : 1,
);
const taskDone = computed(() => progress.fishTaskProg >= task.value.goal);

function claimTask(): void {
  const r = progress.claimFishTask();
  if (r.ok) {
    sfx.win();
    toastGood(r.message);
  } else {
    toastWarn(r.message);
  }
}

/** 开海底宝箱：金币 / 未拥有的装扮 / 闪光鱼饵，三选一 */
function openChest(): string {
  const roll = Math.random();
  if (roll < 0.45) {
    const coins = 120 + Math.floor(Math.random() * 260);
    progress.coins += coins;
    return `金币 +¥${coins}`;
  }
  if (roll < 0.75) {
    const n = progress.grantShinyBait();
    return `闪光鱼饵（现有 ${n} 个，下一条刷出的鱼必闪光）`;
  }
  const pool = ITEMS.filter((i) => i.source === 'gacha' && !progress.owned.includes(i.id));
  if (!pool.length) {
    const coins = 300 + Math.floor(Math.random() * 200);
    progress.coins += coins;
    return `金币 +¥${coins}（装扮都快集齐了）`;
  }
  const item = pool[Math.floor(Math.random() * pool.length)];
  progress.owned = [...progress.owned, item.id];
  return `获得装扮「${item.label}」`;
}

function scene(): DiveScene | undefined {
  return game?.scene.getScene('DiveScene') as DiveScene | undefined;
}

function back() {
  sfx.click();
  void router.push('/');
}

/**
 * 每做一件可能推进成就的事（上鱼 / 卖鱼 / 升级 / 买船 / 出海 / 下潜变深）都过一遍。
 * 判定与发奖在 store 里，新达成会走全局提示条弹出来。
 */
function checkAch(): void {
  if (progress.syncAchievements().length) sfx.win();
}

/** 重建 Phaser 实例（换海岛 / 联机状态变化时用） */
function boot(session: NetLink | null) {
  if (!container.value) return;
  game?.destroy(true);
  // 每开一局算一次下潜
  progress.noteDive();
  const data: DiveSceneData = {
    cosmetic: customize.cosmetic,
    session,
    islandId: progress.island,
    oxygenLv: progress.oxygenLv,
    bagLv: progress.bagLv,
    gearLv: progress.rodLevel,
    boat: progress.boat,
    onBag: (s) => (bag.value = s),
    onCatch: (id, kg, _value, flags) => {
      progress.logFish(id, kg, flags.shiny);
      if (flags.king) progress.noteFishKing();
      if (flags.shiny) progress.noteFishShiny();
      progress.noteFishCatch(progress.fishTask.id, id, kg, flags.shiny);
      sessionCaught.value += 1;
      sfx.point();
      checkAch();
    },
    // 下潜深度上报（每 5 米一次）：百尺深潜那类成就靠它
    onStats: (s) => {
      progress.noteDepth(s.maxDepth);
      checkAch();
    },
    onWipeout: (lost) => {
      sfx.lose();
      toastWarn(lost ? `氧气耗尽，丢了 ${lost} 条鱼` : '氧气耗尽，被冲上水面');
    },
    onHurt: (what) => (what === 'jelly' ? sfx.hit('lift') : sfx.lose()),
    // 上岸状态：装备店只开在沙滩上，所以按钮跟着这个走
    onShore: (s) => {
      onLand.value = s.onLand;
      nearHut.value = s.nearHut;
      nearBoat.value = s.nearBoat;
    },
    onShop: () => openShop(),
    // 点了岸边的船（或站在旁边按 E）：买船 / 出海都在这一张卡片里
    onBoat: () => openBoat(),
    // 海底宝箱：页面侧发奖励（金币 / 未拥有的装扮 / 闪光鱼饵）
    onChest: () => openChest(),
    // 闪光鱼饵：消耗一个，下一条刷出来的鱼必为闪光
    consumeShinyBait: () => progress.consumeShinyBait(),
  };
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container.value,
    width: VIEW_W,
    height: VIEW_H,
    backgroundColor: '#0b2e4a',
    banner: false,
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [],
    callbacks: {
      postBoot: (g) => g.scene.add('DiveScene', DiveScene, true, data),
    },
  });
  sessionCaught.value = 0;
  sessionEarned.value = 0;
}

/** 装备店只开在沙滩上：游在水里是开不了的 */
function openShop(): void {
  if (!onLand.value) {
    toastWarn('装备店在岸上：先游回沙滩再升级');
    return;
  }
  sfx.click();
  shopOpen.value = true;
}

function upgrade(kind: 'oxygen' | 'bag' | 'gear') {
  if (!onLand.value) {
    toastWarn('回到岸上的装备店才能升级');
    return;
  }
  const lv =
    kind === 'oxygen' ? progress.oxygenLv : kind === 'bag' ? progress.bagLv : progress.rodLevel;
  const name = kind === 'oxygen' ? '氧气罐' : kind === 'bag' ? '背包' : '渔具';
  if (lv >= MAX_LEVEL) {
    toastWarn(`${name} 已经满级了`);
    return;
  }
  const cost = upgradeCost(lv);
  if (progress.coins < cost) {
    toastWarn(`金币不够，升级「${name}」需要 ¥${cost}`);
    return;
  }
  if (!progress.upgradeDive(kind)) return;
  sfx.point();
  toastGood(`${name} 升到 Lv.${lv + 1}`);
  // 等级在场景里是热的，不用重开
  scene()?.setLevels({
    oxygenLv: progress.oxygenLv,
    bagLv: progress.bagLv,
    gearLv: progress.rodLevel,
  });
  checkAch();
}

function buyBoat() {
  if (progress.boat) return;
  if (progress.coins < BOAT_COST) {
    toastWarn(`买船要 ¥${BOAT_COST}，多抓点大鱼吧`);
    return;
  }
  if (!progress.buyBoat()) return;
  scene()?.setBoat(true);
  sfx.win();
  toastGood('买到船了！可以出海去别的海岛');
  checkAch();
}

function sail(id: string) {
  if (id === progress.island) return;
  if (!onLand.value) {
    toastWarn('先游回岸上，船停在栈桥边');
    return;
  }
  const target = islandById(id);
  if (target.boat && !progress.boat) {
    toastWarn('要先买船才能出海');
    return;
  }
  if (progress.rodLevel < target.gear) {
    toastWarn(`「${target.name}」需要渔具 Lv.${target.gear}，现在的钩子拉不住那里的鱼`);
    return;
  }
  if (progress.coins < target.cost) {
    toastWarn(`出海去「${target.name}」要 ¥${target.cost}`);
    return;
  }
  if ((scene()?.bagCount() ?? 0) > 0) {
    toastWarn('先把背包里的鱼卖掉再出海');
    return;
  }
  if (!progress.sailTo(id)) return;
  sfx.win();
  toastGood(`出发去「${target.name}」！`);
  boatOpen.value = false;
  checkAch();
  boot(link);
}

function sell() {
  const count = bag.value.count;
  const coin = scene()?.sellBag() ?? 0;
  if (coin <= 0) {
    toastWarn('背包里还没鱼，下去抓几条吧');
    return;
  }
  progress.coins += coin;
  progress.noteSold(coin);
  sessionEarned.value += coin;
  sfx.win();
  toastGood(`卖出 ${count} 条鱼，共 ¥${coin}`);
  checkAch();
}

function host() {
  sfx.click();
  waiting.value = true;
  phase.value = '正在建房…';
  hostOpen(
    {
      onPhase: (p) => (phase.value = p),
      onDisconnected: () => (phase.value = '好友已上船'),
    },
    // 复用「一间房」：海岛/玩法换页不换房号
    lobby.room,
  )
    .then(async (room) => {
      roomCode.value = room.code;
      lobby.setRoom(room.code, 'host');
      phase.value = `房间 ${room.code}，等好友…`;
      link = await room.connected;
      phase.value = '好友已下水！';
      waiting.value = false;
      boot(link);
    })
    .catch((e: Error) => {
      toastWarn(e.message);
      waiting.value = false;
    });
}

function join() {
  const code = normaliseCode(joinCode.value);
  if (code.length < 4) {
    toastWarn('请输入 4~6 位房号');
    return;
  }
  sfx.click();
  waiting.value = true;
  phase.value = '正在加入…';
  joinMatch(code, { onPhase: (p) => (phase.value = p) })
    .then((m) => {
      link = m.link;
      lobby.setRoom(code, 'guest');
      phase.value = '已汇合！';
      waiting.value = false;
      boot(link);
    })
    .catch((e: Error) => {
      toastWarn(e.message);
      waiting.value = false;
    });
}

onMounted(() => {
  applyTheme(customize.theme);
  boot(null);
});

onBeforeUnmount(() => {
  link?.destroy();
  link = null;
  game?.destroy(true);
  game = null;
});
</script>

<template>
  <div class="page page--playing">
    <PageShell title="海湾 · 潜水" back @back="back">
      <template #icons>
      </template>

      <template #dock>
        <SideDock>
          <StatusChip :tone="roomCode ? 'ok' : 'idle'">
            {{ roomCode ? `房间 ${roomCode}` : '单机下潜' }}
          </StatusChip>
          <span class="dive-num">🫧 {{ island.name }} · 本场 {{ sessionCaught }} 条</span>
          <Button size="sm" variant="primary" block @click="sell">
            卖鱼 ¥{{ bag.value }}（{{ bag.count }} 条）
          </Button>

          <!-- 装备店只开在岸上：人上岸了才能进店升级 -->
          <Button
            size="sm"
            :variant="nearHut ? 'primary' : 'quiet'"
            block
            :disabled="!onLand"
            @click="openShop"
          >
            {{ onLand ? (nearHut ? '装备店（门口 · 按 E）' : '装备店') : '装备店（要先上岸）' }}
          </Button>
          <span class="dive-num">
            氧气 Lv.{{ progress.oxygenLv }} · 背包 Lv.{{ progress.bagLv }} · 渔具 Lv.{{
              progress.rodLevel
            }}
          </span>

          <!-- 每日钓鱼任务：跨天自动换一条 -->
          <div class="fish-task" :class="{ 'is-done': taskDone }">
            <div class="fish-task__head">
              <b>📋 每日钓鱼任务</b>
              <span class="muted num">{{ progress.fishTaskProg }}/{{ task.goal }}</span>
            </div>
            <p class="muted fish-task__text">{{ task.text }}</p>
            <div class="fish-task__bar">
              <i :style="{ width: `${taskPct * 100}%` }" />
            </div>
            <Button
              size="sm"
              block
              :variant="taskDone && !progress.fishTaskClaimed ? 'primary' : 'quiet'"
              :disabled="!taskDone || progress.fishTaskClaimed"
              @click="claimTask"
            >
              {{
                progress.fishTaskClaimed
                  ? '今日已领取'
                  : taskDone
                    ? `领取 🪙${task.coins} · 🏅${task.honor}`
                    : '未完成'
              }}
            </Button>
          </div>

          <template v-if="!roomCode">
            <input
              v-model="joinCode"
              class="ui-input"
              maxlength="6"
              placeholder="房号"
              @keyup.enter="join"
            />
            <div class="dive-pair">
              <Button size="sm" :disabled="waiting" @click="host">建房</Button>
              <Button size="sm" :disabled="waiting" @click="join">加入</Button>
            </div>
          </template>
          <span v-if="phase" class="dock-note">{{ phase }}</span>
          <p class="dock-note">
            左摇杆游动（上推上浮）· 右摇杆把拍头指到鱼身上勾住，之后朝鱼的方向收杆。
            <b>出海要走到栈桥边点那条船</b>（买船 / 换海岛都在船上的卡片里）；升级装备去岸上的装备店。
            氧气没了会被冲上水面并丢掉一半渔获。
          </p>
        </SideDock>
      </template>

      <template #stage>
        <div ref="container" class="fish-canvas" />
      </template>

      <template #overlay>
        <div v-if="nearHut" class="dive-prompt">🏠 装备店门口 · 按 E 打开</div>
        <div v-else-if="nearBoat" class="dive-prompt">
          🛶 {{ progress.boat ? '点这条船出海 · 或按 E' : '点这条船买下它 · 或按 E' }}
        </div>

        <!-- 岸边那条船：点它（或站在旁边按 E）弹出的小卡片，出海都从这里走 -->
        <div v-if="boatOpen" class="boat-card">
          <div class="boat-card__head">
            <b>🛶 岸边的小船</b>
            <span class="muted boat-card__place">{{ island.name }}</span>
            <button class="boat-card__x" type="button" @click="boatOpen = false">✕</button>
          </div>

          <template v-if="!progress.boat">
            <p class="muted boat-card__note">
              船老大：交 ¥{{ BOAT_COST }} 这条船就归你，以后出海都靠它。
              现在有 <b class="num">¥{{ progress.coins }}</b>。
            </p>
            <Button
              size="sm"
              variant="primary"
              block
              :disabled="progress.coins < BOAT_COST"
              @click="buyBoat"
            >
              {{ progress.coins < BOAT_COST ? `还差 ¥${BOAT_COST - progress.coins}` : `买下这条船 ¥${BOAT_COST}` }}
            </Button>
          </template>

          <template v-else>
            <p class="muted boat-card__note">
              出海前要先把背包里的鱼卖掉（现在 {{ bag.count }} 条）。能去：
            </p>
            <ul class="boat-card__list">
              <li v-for="i in sailable" :key="i.id" class="boat-card__item">
                <div class="boat-card__body">
                  <div class="boat-card__name">{{ i.name }}</div>
                  <div class="muted boat-card__desc">
                    海床 {{ Math.round(i.floor / 10) }}m · 船费 ¥{{ i.cost }} · {{ i.desc }}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  :disabled="!sailReady(i)"
                  @click="sail(i.id)"
                >
                  {{ sailReady(i) ? '出海' : sailWhy(i) }}
                </Button>
              </li>
            </ul>
            <p v-if="!sailable.length" class="muted boat-card__note">
              渔具等级还不够，去装备店升级渔具再来。
            </p>
          </template>

          <button class="boat-card__codex" type="button" @click="codexOpen = !codexOpen">
            🐟 鱼图鉴 {{ codex.filter((c) => c.count).length }}/{{ SPECIES.length }}
            <span class="muted">{{ codexOpen ? '收起' : '展开' }}</span>
          </button>
          <ul v-if="codexOpen" class="isl__codex boat-card__codexlist">
            <li v-for="c in codex" :key="c.s.id" class="isl__codex-item" :class="{ 'is-new': !c.count }">
              <span class="isl__codex-emoji">{{ c.count ? c.s.emoji : '❔' }}</span>
              <span class="isl__codex-name">
                {{ c.s.name }} <span v-if="c.shiny" title="抓到过闪光鱼">✨{{ c.shiny }}</span>
              </span>
              <span class="muted num">
                {{ c.count ? `${c.count} 条 · 最大 ${c.best.toFixed(1)}kg` : '未发现' }}
              </span>
              <span class="muted isl__codex-band">Lv.{{ c.s.gear }}+</span>
            </li>
          </ul>
        </div>
      </template>
    </PageShell>

    <!-- 岸上的装备店：氧气罐 / 背包 / 渔具 -->
    <AppModal v-model="shopOpen" title="装备店" max-width="460px">
      <div class="shop">
        <p class="muted shop__head">
          💈 岸上的小屋 · 今天余额 <b class="num">¥{{ progress.coins }}</b>
        </p>

        <div class="dive-up">
          <span class="dive-up__name">氧气罐 Lv.{{ progress.oxygenLv }}</span>
          <span class="muted dive-up__info">水下能待 {{ oxygenTop }} 秒</span>
          <Button
            size="sm"
            :disabled="progress.oxygenLv >= MAX_LEVEL || progress.coins < upgradeCost(progress.oxygenLv)"
            @click="upgrade('oxygen')"
          >
            {{ progress.oxygenLv >= MAX_LEVEL ? '满级' : `升级 ¥${upgradeCost(progress.oxygenLv)}` }}
          </Button>
        </div>

        <div class="dive-up">
          <span class="dive-up__name">背包 Lv.{{ progress.bagLv }}</span>
          <span class="muted dive-up__info">{{ limits.count }} 条 / {{ limits.kg }}kg</span>
          <Button
            size="sm"
            :disabled="progress.bagLv >= MAX_LEVEL || progress.coins < upgradeCost(progress.bagLv)"
            @click="upgrade('bag')"
          >
            {{ progress.bagLv >= MAX_LEVEL ? '满级' : `升级 ¥${upgradeCost(progress.bagLv)}` }}
          </Button>
        </div>

        <div class="dive-up">
          <span class="dive-up__name">渔具 Lv.{{ progress.rodLevel }}</span>
          <span class="muted dive-up__info">能拉 {{ gear.maxKg }}kg · 钩子 {{ gear.hook }}</span>
          <Button
            size="sm"
            :disabled="progress.rodLevel >= MAX_LEVEL || progress.coins < upgradeCost(progress.rodLevel)"
            @click="upgrade('gear')"
          >
            {{ progress.rodLevel >= MAX_LEVEL ? '满级' : `升级 ¥${upgradeCost(progress.rodLevel)}` }}
          </Button>
        </div>

        <div class="shop__foot">
          <Button size="sm" block @click="sell">卖鱼 ¥{{ bag.value }}（{{ bag.count }} 条）</Button>
        </div>
        <p class="muted shop__note">
          装备升级只在岸上的店里做；氧气耗尽会被冲上水面并丢一半渔获，先升氧气罐再往深处走更稳。
        </p>
      </div>
    </AppModal>

  </div>
</template>

<style scoped>
.dive-num {
  font-size: var(--ui-font-xs);
  color: var(--text-dim);
}

/* 每日钓鱼任务卡 */
.fish-task {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.fish-task.is-done {
  border-color: #e8a33d;
  background: color-mix(in srgb, #e8a33d 12%, var(--surface-2));
}

.fish-task__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text);
}

.fish-task__text {
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
}

.fish-task__bar {
  height: 6px;
  border-radius: 4px;
  background: rgba(127, 127, 127, 0.2);
  overflow: hidden;
}

.fish-task__bar i {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #54d6ff, #e8a33d);
  transition: width 0.3s ease;
}

.dive-up {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 2px var(--s2);
}

.dive-up__name {
  font-size: var(--ui-font-sm);
  font-weight: 600;
  color: var(--text);
}

.dive-up__info {
  grid-column: 1;
  font-size: 11px;
}

.dive-up :deep(.v-btn) {
  grid-row: 1 / span 2;
  grid-column: 2;
}

.dive-pair {
  display: flex;
  gap: var(--s2);
}

.dive-pair > * {
  flex: 1;
}

/* 站在装备店门口时的浮标提示（DOM，压在画面上） */
.dive-prompt {
  position: absolute;
  left: 50%;
  bottom: 116px;
  transform: translateX(-50%);
  z-index: 32;
  padding: 7px 16px;
  border-radius: var(--r-pill);
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
  background: color-mix(in srgb, var(--accent) 24%, var(--glass-bg));
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  color: var(--text);
  font-size: var(--ui-font-sm);
  font-weight: 700;
  pointer-events: none;
}

.shop {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.shop__head {
  margin: 0;
  font-size: 13px;
}

.shop__foot {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.shop__note {
  margin: 0;
  font-size: 12px;
}

/* 岸边那条船点出来的小卡片：开在画面里，不是整页弹窗 */
.boat-card {
  position: absolute;
  left: 50%;
  bottom: var(--s4);
  transform: translateX(-50%);
  z-index: 34;
  width: min(440px, calc(100% - 2 * var(--s3)));
  max-height: min(64%, 430px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--s3);
  padding: var(--s3);
  border-radius: var(--r-md);
  border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--line));
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  box-shadow: 0 18px 40px -22px rgba(0, 0, 0, 0.65);
}

.boat-card__head {
  display: flex;
  align-items: center;
  gap: var(--s2);
  font-size: 14px;
}

.boat-card__place {
  font-size: 12px;
}

.boat-card__x {
  margin-left: auto;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: var(--text-dim);
  font-size: 15px;
  cursor: pointer;
}

.boat-card__note {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}

.boat-card__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.boat-card__item {
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: var(--s2);
  border-radius: var(--r-sm, 8px);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.boat-card__body {
  flex: 1;
  min-width: 0;
}

.boat-card__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.boat-card__desc {
  font-size: 11px;
}

.boat-card__codex {
  display: flex;
  align-items: center;
  gap: var(--s2);
  width: 100%;
  padding: 6px 10px;
  border-radius: var(--r-sm, 8px);
  border: 1px dashed var(--line);
  background: transparent;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
}

.boat-card__codex > .muted {
  margin-left: auto;
  font-size: 11px;
}

.boat-card__codexlist {
  max-height: 240px;
  overflow-y: auto;
}

.isl__codex {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.isl__codex-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: var(--r-sm, 8px);
  border: 1px solid var(--line);
  background: var(--surface-2);
  font-size: 12px;
}

.isl__codex-item.is-new {
  opacity: 0.55;
}

.isl__codex-name {
  color: var(--text);
}

.isl__codex-band {
  margin-left: auto;
  font-size: 11px;
}

@media (max-width: 560px) {
  .isl__codex {
    grid-template-columns: 1fr;
  }
}
</style>
