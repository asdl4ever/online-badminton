<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import Joystick from '../components/ui/Joystick.vue';
import AppModal from '../components/ui/AppModal.vue';
import ChestPanel from '../components/ChestPanel.vue';
import CoinShopPanel from '../components/CoinShopPanel.vue';
import HonorShopPanel from '../components/HonorShopPanel.vue';
import { useWalk } from '../composables/useWalk';
import { isTouchDevice } from '../game/device';
import { useJoystickPrefs } from '../composables/useJoystick';
import { AVATAR_FEET_PAD, avatarBoxSize, paintAvatar } from '../game/draw/canvas2d';
import { useCustomizeStore } from '../stores/customize';
import { sfx } from '../game/audio';

/**
 * 大地图上的「商店」：一间可以走动的小房间——
 * 活动告示板、宝箱柜摆在店里，走近按 E（或点柜台）弹对应面板。
 * 走动逻辑在 `useWalk`（和大地图同一套手感），角色是游戏同一份绘制。
 */
const router = useRouter();
const route = useRoute();
const customize = useCustomizeStore();

const ROOM_W = 1200;
const ROOM_H = 760;

/* --- 走动 + 交互物件 ------------------------------------------------------ */
const stage = ref<HTMLElement | null>(null);
const plane = ref<HTMLElement | null>(null);
const meCanvas = ref<HTMLCanvasElement | null>(null);
const AVATAR_SCALE = 0.8;
const avatarBox = avatarBoxSize(AVATAR_SCALE);
const avatarFeetPad = Math.round(AVATAR_FEET_PAD * AVATAR_SCALE);

function paintMe(now: number): void {
  const c = meCanvas.value;
  if (c) paintAvatar(c, customize.cosmetic, now, { scale: AVATAR_SCALE, facing: 1 });
}

const OBJECTS = [
  { id: 'notice', x: 240, y: 430 },
  { id: 'honor', x: 520, y: 430 },
  { id: 'coin', x: 800, y: 430 },
  { id: 'chest', x: 1080, y: 430 },
];

const showEvents = ref(false);
const showHonor = ref(false);
const showCoin = ref(false);
const showChest = ref(false);

/** 活动卡：小黄龙 / 哥斯拉可以点开跳转（其余还是占位） */
function openEvent(id: string): void {
  if (id === 'nailong') {
    sfx.click();
    void router.push('/nailong');
  } else if (id === 'godzilla') {
    sfx.click();
    void router.push('/godzilla');
  }
}

const walk = useWalk({
  stage,
  plane,
  width: ROOM_W,
  height: ROOM_H,
  objects: () => OBJECTS,
  spawn: { x: 600, y: 660 },
  onEnter: (id) => {
    if (id === 'notice') showEvents.value = true;
    else if (id === 'chest') showChest.value = true;
    else if (id === 'honor') showHonor.value = true;
    else if (id === 'coin') showCoin.value = true;
  },
  onFrame: paintMe,
});
const { me, joy, nearId, tryEnter } = walk;

/** 手机上没有键盘：提示文案跟着设备走 */
const touch = isTouchDevice();
// 摇杆：触屏必显；桌面端开了「摇杆常显」也显示（设置里改）
const { always: joyAlways } = useJoystickPrefs();
const showJoy = computed(() => touch || joyAlways.value);
const nearHint = computed(() =>
  nearId.value ? (touch ? '点按查看' : '按 E 查看') : '',
);
const walkHint = computed(() =>
  touch ? '拖动摇杆走动 · 点按柜台查看' : '摇杆 / WASD 自由走动 · 走近柜台按 E',
);

function back(): void {
  void router.push('/');
}

/* --- 活动告示板上的内容（占位卡，数据后续接） ----------------------------- */
const EVENTS = [
  {
    id: 'nailong',
    icon: '🐲',
    title: '小黄龙联名 · 转盘抽奖',
    desc: '点这里去挑战小黄龙（趣味模式），赢球换抽奖券，转盘抽「小黄龙头套 / 小黄龙宝宝 / 小黄龙滚滚」',
    time: '活动进行中',
    tone: 'gold',
    tag: '联动',
  },
  {
    id: 'godzilla',
    icon: '🦖',
    title: '哥斯拉来袭 · 拍火球打巨兽',
    desc: '用球拍把它的火球拍回去砸它扣血，躲开贴地激光；每天 3 次免费挑战，三档难度概率掉不同的限定（地狱才掉哥斯拉皮肤）',
    time: '限时活动',
    tone: 'red',
    tag: '新活动',
  },
  {
    id: 'placeholder1',
    icon: '🎪',
    title: '敬请期待',
    desc: '更多活动准备中',
    time: '—',
    tone: 'blue',
    tag: '占位',
  },
  {
    id: 'placeholder2',
    icon: '🎪',
    title: '敬请期待',
    desc: '更多活动准备中',
    time: '—',
    tone: 'blue',
    tag: '占位',
  },
  {
    id: 'double-coins',
    icon: '🪙',
    title: '周末狂欢 · 双倍金币',
    desc: '周六日至周日，联机对局与采矿的金币收益翻倍',
    time: '每周六 00:00 开始',
    tone: 'gold',
    tag: '限时',
  },
  {
    id: 'newbie',
    icon: '🎉',
    title: '新手特惠 · 免费十连',
    desc: '新玩家登录即送免费十连抽，背包里直接领取',
    time: '永久有效',
    tone: 'blue',
    tag: '常驻',
  },
  {
    id: 'pet-sale',
    icon: '🐾',
    title: '宠物上新 · 稀有出没',
    desc: '宠物店每小时补货，史诗 / 传说宠物小概率上架',
    time: '敬请期待',
    tone: 'purple',
    tag: '预告',
  },
] as const;

const now = ref(Date.now());
let timer = 0;
onMounted(() => {
  timer = window.setInterval(() => (now.value = Date.now()), 1000);
  // 直达链接：/shop?open=chest（或 coin / honor / events）直接弹对应面板，不用走过去
  const open = route.query.open;
  if (open === 'chest') showChest.value = true;
  else if (open === 'coin') showCoin.value = true;
  else if (open === 'honor') showHonor.value = true;
  else if (open === 'events') showEvents.value = true;
});
onBeforeUnmount(() => window.clearInterval(timer));
/** 占位倒计时：距离下个整点 */
const countdown = computed(() => {
  const left = 3600_000 - (now.value % 3600_000);
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});
</script>

<template>
  <div class="page page--playing">
    <PageShell title="商店" back @back="back">

      <template #stage>
        <div ref="stage" class="room">
          <div
            ref="plane"
            class="room__plane"
            :style="{ width: `${ROOM_W}px`, height: `${ROOM_H}px` }"
          >
            <!-- 店内陈设：柜台 / 告示板 -->
            <div
              v-for="o in [
                { ...OBJECTS[0], sign: '🎪', name: '活动告示板' },
                { ...OBJECTS[1], sign: '🏅', name: '荣誉柜台' },
                { ...OBJECTS[2], sign: '🪙', name: '金币商店' },
                { ...OBJECTS[3], sign: '🎁', name: '宝箱柜' },
              ]"
              :key="o.id"
              class="counter jelly"
              :class="{ 'is-near': nearId === o.id }"
              :style="{ left: `${o.x}px`, top: `${o.y}px` }"
              @click="tryEnter(o.id)"
            >
              <span class="counter__sign">{{ o.sign }}</span>
              <span class="counter__name">{{ o.name }}</span>
            </div>

            <!-- 角色：和地图同一份绘制 -->
            <div
              class="avatar is-me"
              :style="{
                left: `${me.x}px`,
                top: `${me.y}px`,
                width: `${avatarBox.w}px`,
                height: `${avatarBox.h}px`,
                transform: `translate(-50%, calc(-100% + ${avatarFeetPad}px))`,
              }"
            >
              <canvas ref="meCanvas" class="avatar__rig" />
              <div class="avatar__name">你</div>
            </div>
          </div>

          <div class="room__prompt" :class="{ 'is-on': !!nearId }">
            {{ nearHint }}
          </div>
          <div class="room__hint">{{ walkHint }}</div>

          <Joystick v-if="showJoy" @move="(x, y) => (joy = { x, y })" />
        </div>
      </template>
    </PageShell>

    <!-- 活动告示板 -->
    <AppModal v-model="showEvents" title="🎪 活动告示板" max-width="560px">
      <div class="shop-banner">
        <div>
          <div class="shop-banner__title">商店活动</div>
          <div class="muted shop-banner__sub">精彩活动持续上新，敬请期待</div>
        </div>
        <span class="shop-banner__timer num">{{ countdown }}</span>
      </div>
      <div
        v-for="e in EVENTS"
        :key="e.id"
        class="event-card"
        :class="[`is-${e.tone}`, { 'is-clickable': e.id === 'nailong' }]"
        @click="openEvent(e.id)"
      >
        <span class="event-card__icon">{{ e.icon }}</span>
        <div class="event-card__body">
          <div class="event-card__title">
            {{ e.title }}
            <span class="event-card__tag">{{ e.tag }}</span>
          </div>
          <div class="muted event-card__desc">{{ e.desc }}</div>
          <div class="event-card__time">⏱ {{ e.time }}</div>
        </div>
      </div>
    </AppModal>

    <!-- 荣誉柜台 -->
    <AppModal v-model="showHonor" title="🏅 荣誉柜台" max-width="620px">
      <HonorShopPanel />
    </AppModal>

    <!-- 金币商店 -->
    <AppModal v-model="showCoin" title="🪙 金币商店" max-width="680px">
      <CoinShopPanel />
    </AppModal>

    <!-- 宝箱柜：左边宝箱、右边物品墙，两列布局所以给宽一点 -->
    <AppModal v-model="showChest" title="🎁 宝箱柜" max-width="900px">
      <ChestPanel />
    </AppModal>

  </div>
</template>

<style scoped>
.dock-coins {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.dock-honor {
  font-size: 14px;
  font-weight: 700;
  color: #e8a33d;
}

.dock-keys {
  font-size: 14px;
  font-weight: 700;
  color: #7fd4ff;
}

.dock-note {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-dim);
}

/* --- 房间：地板 + 墙 --- */
.room {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #e8dfca;
}

.room__plane {
  position: absolute;
  left: 0;
  top: 0;
  background: linear-gradient(180deg, #d8cba8 0 120px, #cfc09a 120px 100%);
  border-bottom: 14px solid #b09a6a;
}

/* --- 柜台 --- */
.counter {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 18px 10px;
  border-radius: 12px;
  border: 2px solid #8a6a3a;
  background: linear-gradient(180deg, #a97f42, #8a6232);
  box-shadow: 0 6px 14px -6px rgba(60, 40, 10, 0.5);
  cursor: pointer;
}

.counter.is-near {
  border-color: #ffd45c;
  box-shadow: 0 0 0 3px rgba(255, 212, 92, 0.5), 0 6px 14px -6px rgba(60, 40, 10, 0.5);
}

.counter__sign {
  font-size: 30px;
  line-height: 1;
}

.counter__name {
  font-size: 12px;
  font-weight: 700;
  color: #fff4dc;
}

/* --- 角色（和 WorldView 同款） --- */
.avatar__rig {
  display: block;
  width: 100%;
  height: 100%;
}

.avatar__name {
  position: absolute;
  bottom: calc(100% - 4px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}

/* --- 提示 --- */
.room__prompt,
.room__hint {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 14px;
  border-radius: var(--r-pill);
  background: rgba(20, 14, 6, 0.55);
  color: #fff4dc;
  font-size: 12px;
  pointer-events: none;
}

.room__prompt {
  bottom: 84px;
  opacity: 0;
  transition: opacity 0.2s;
}

.room__prompt.is-on {
  opacity: 1;
}

.room__hint {
  bottom: 20px;
  background: rgba(20, 14, 6, 0.35);
}

/* --- 活动卡（弹窗里） --- */
.shop-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  padding: var(--s3) var(--s4);
  border-radius: var(--r-md);
  background: linear-gradient(120deg, color-mix(in srgb, var(--accent) 22%, var(--surface-2)), var(--surface-2));
  border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--line));
}

.shop-banner__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}

.shop-banner__sub {
  font-size: 12px;
  margin-top: 2px;
}

.shop-banner__timer {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.event-card {
  display: flex;
  gap: var(--s3);
  align-items: flex-start;
  margin-top: var(--s3);
  padding: var(--s3) var(--s4);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.event-card.is-gold {
  border-color: color-mix(in srgb, #e8a33d 55%, var(--line));
  background: color-mix(in srgb, #e8a33d 8%, var(--surface-2));
}

.event-card.is-clickable {
  cursor: pointer;
}

.event-card.is-clickable:hover {
  border-color: color-mix(in srgb, #ffd93d 75%, var(--line));
  background: color-mix(in srgb, #ffd93d 12%, var(--surface-2));
}

.event-card.is-blue {
  border-color: color-mix(in srgb, #3d8bfd 55%, var(--line));
  background: color-mix(in srgb, #3d8bfd 8%, var(--surface-2));
}

.event-card.is-purple {
  border-color: color-mix(in srgb, #9b59d0 55%, var(--line));
  background: color-mix(in srgb, #9b59d0 8%, var(--surface-2));
}

.event-card__icon {
  font-size: 26px;
  line-height: 1;
}

.event-card__body {
  min-width: 0;
  flex: 1;
}

.event-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.event-card__tag {
  padding: 1px 8px;
  border-radius: var(--r-pill);
  font-size: 10px;
  font-weight: 600;
  color: var(--text);
  background: color-mix(in srgb, var(--accent) 22%, var(--surface));
}

.event-card__desc {
  margin-top: 3px;
  font-size: 12px;
  line-height: 1.5;
}

.event-card__time {
  margin-top: 5px;
  font-size: 11px;
  color: var(--text-dim);
}
</style>
