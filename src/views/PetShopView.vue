<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import SideDock from '../components/ui/SideDock.vue';
import Joystick from '../components/ui/Joystick.vue';
import AppModal from '../components/ui/AppModal.vue';
import Button from '../components/ui/Button.vue';
import Stars from '../components/ui/Stars.vue';
import ItemIcon from '../components/ItemIcon.vue';
import { toastGood, toastWarn } from '../composables/useToast';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { useWalk } from '../composables/useWalk';
import { isTouchDevice } from '../game/device';
import { AVATAR_FEET_PAD, avatarBoxSize, paintAvatar } from '../game/draw/canvas2d';
import { PETS, type Item } from '../game/items';

/**
 * 大地图上的「宠物店」：一间可以走动的小房间——
 * 3 个展示柜立在店里，柜子上方飘着对应的宠物和价格牌，走近按 E 确认购买。
 * 每小时整点补货（倒计时挂在门口招牌上）；走动逻辑在 `useWalk`。
 *
 * 目前是 UI 骨架：展示位先放固定样例宠物，补货与购买的具体逻辑后续接。
 */
const router = useRouter();
const progress = useProgressStore();
const customize = useCustomizeStore();

const ROOM_W = 1200;
const ROOM_H = 760;

/* --- 一只在售的宠物：物品 + 星级 + 价格 ---------------------------------- */
interface ShopPet {
  item: Item;
  ref: string;
  star: number;
  price: number;
}

/** 按星级定价（占位，后续进 store） */
const STAR_PRICE: Record<number, number> = { 1: 150, 2: 280, 3: 480, 4: 880, 5: 1600 };

/** 占位样例：普通/稀有常见，史诗/传说小概率——先固定三只不同星级的宠物看版式 */
const SAMPLE_REFS: { ref: string; star: number }[] = [
  { ref: 'cat', star: 3 },
  { ref: 'fairy', star: 4 },
  { ref: 'dragon', star: 5 },
];
const stock = computed<ShopPet[]>(() =>
  SAMPLE_REFS.map(({ ref, star }) => ({
    item: PETS.find((p) => p.ref === ref)!,
    ref,
    star,
    price: STAR_PRICE[star] ?? 480,
  })),
);

/* --- 每小时整点补货：倒计时（逻辑后续接 store） -------------------------- */
const nowMs = ref(Date.now());
let timer = 0;
onMounted(() => {
  timer = window.setInterval(() => (nowMs.value = Date.now()), 1000);
});
onBeforeUnmount(() => window.clearInterval(timer));

const countdown = computed(() => {
  const left = 3600_000 - (nowMs.value % 3600_000);
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

/* --- 走动 + 展示柜交互 ---------------------------------------------------- */
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

/** 三个展示位的世界坐标（柜子立在这，宠物飘在柜子上方） */
const CABINET_X = [250, 600, 950];

const selected = ref<ShopPet | null>(null);
const showBuy = ref(false);

const walk = useWalk({
  stage,
  plane,
  width: ROOM_W,
  height: ROOM_H,
  objects: () => CABINET_X.map((x, i) => ({ id: `pet${i}`, x, y: 470 })),
  spawn: { x: 600, y: 660 },
  onEnter: (id) => {
    selected.value = stock.value[Number(id.slice(3))] ?? null;
    showBuy.value = !!selected.value;
  },
  onFrame: paintMe,
});
const { me, joy, nearId } = walk;

/** 手机上没有键盘：提示文案跟着设备走 */
const touch = isTouchDevice();
const nearHint = computed(() =>
  nearId.value ? (touch ? '点按查看这只宠物' : '按 E 看这只宠物') : '',
);
const walkHint = computed(() =>
  touch ? '拖动摇杆走动 · 点按展示柜查看' : '摇杆 / WASD 自由走动 · 走近展示柜按 E',
);

function buy(pet: ShopPet): void {
  if (progress.coins < pet.price) {
    toastWarn(`金币不足，还差 ${pet.price - progress.coins}`);
    return;
  }
  // TODO 接 store：扣钱、宠物入袋（已拥有则折算金币）、下架该展示位
  toastGood(`「${pet.item.label}」已带回家！（功能开发中）`);
  showBuy.value = false;
}

function openPet(i: number): void {
  walk.tryEnter(`pet${i}`);
}

function back(): void {
  void router.push('/');
}
</script>

<template>
  <div class="page page--playing">
    <PageShell title="宠物店" back @back="back">
      <template #dock>
        <SideDock>
          <span class="dock-coins">🪙 {{ progress.coins }}</span>
          <p class="dock-note">
            {{ touch ? '拖动摇杆走动，点按展示柜看宠物。' : '摇杆 / WASD 走动，走到展示柜前按 E 看宠物。' }}
            每小时整点补货，稀有宠物可遇不可求。
          </p>
        </SideDock>
      </template>

      <template #stage>
        <div ref="stage" class="room">
          <div
            ref="plane"
            class="room__plane"
            :style="{ width: `${ROOM_W}px`, height: `${ROOM_H}px` }"
          >
            <!-- 门口招牌：补货倒计时 -->
            <div class="room__sign">
              🐾 宠物店 · 下批补货 <span class="num">{{ countdown }}</span>
            </div>

            <!-- 三个展示柜 -->
            <div
              v-for="(pet, i) in stock"
              :key="pet.ref"
              class="cabinet"
              :class="{ 'is-near': nearId === `pet${i}` }"
              :style="{ left: `${CABINET_X[i]}px` }"
              @click="openPet(i)"
            >
              <!-- 柜子上方飘着的宠物 + 价格牌 -->
              <div class="cabinet__float">
                <div class="cabinet__pet">
                  <ItemIcon :item="pet.item" />
                </div>
                <div class="cabinet__price num">🪙 {{ pet.price }}</div>
              </div>
              <div class="cabinet__glass">
                <Stars class="cabinet__stars" :value="pet.star" />
                <span class="cabinet__name">{{ pet.item.label }}</span>
              </div>
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

          <Joystick @move="(x, y) => (joy = { x, y })" />
        </div>
      </template>
    </PageShell>

    <!-- 购买确认小卡 -->
    <AppModal v-model="showBuy" title="带它回家？" max-width="380px">
      <div v-if="selected" class="buy-card">
        <div class="buy-card__icon">
          <ItemIcon :item="selected.item" />
        </div>
        <Stars class="buy-card__stars" :value="selected.star" />
        <div class="buy-card__price num">🪙 {{ selected.price }}</div>
        <p class="muted buy-card__note">
          买下后直接进收藏，去「背包」里装备；重复购买的宠物会折算成金币返还。
        </p>
        <div class="buy-card__actions">
          <Button variant="primary" block @click="buy(selected)">确认 · 🪙 {{ selected.price }}</Button>
          <Button block variant="quiet" @click="showBuy = false">再逛逛</Button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.dock-coins {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
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
  background: #dfe8f2;
}

.room__plane {
  position: absolute;
  left: 0;
  top: 0;
  background: linear-gradient(180deg, #cdd9e8 0 120px, #d4cfc2 120px 100%);
  border-bottom: 14px solid #9aa7b8;
}

.room__sign {
  position: absolute;
  left: 50%;
  top: 56px;
  transform: translateX(-50%);
  padding: 8px 20px;
  border-radius: 12px;
  background: linear-gradient(180deg, #5a8ad4, #3a6ab4);
  border: 2px solid #2a4a8a;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 6px 14px -6px rgba(20, 40, 80, 0.6);
}

/* --- 展示柜 --- */
.cabinet {
  position: absolute;
  top: 470px;
  transform: translateX(-50%);
  width: 150px;
  cursor: pointer;
}

.cabinet__float {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-bottom: -8px;
  animation: pet-float 2.4s ease-in-out infinite;
}

.cabinet__pet {
  width: 64px;
  height: 64px;
  filter: drop-shadow(0 4px 6px rgba(30, 40, 60, 0.25));
}

.cabinet__price {
  padding: 1px 10px;
  border-radius: var(--r-pill);
  background: rgba(255, 244, 214, 0.95);
  border: 1px solid #d8b070;
  font-size: 12px;
  font-weight: 700;
  color: #7a5a1a;
}

@keyframes pet-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-7px);
  }
}

.cabinet__glass {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 8px 8px;
  border-radius: 12px;
  border: 2px solid #7a6a4a;
  background: linear-gradient(180deg, rgba(180, 210, 235, 0.5), rgba(150, 170, 195, 0.75));
  box-shadow: 0 6px 14px -6px rgba(40, 50, 70, 0.5);
}

.cabinet.is-near .cabinet__glass {
  border-color: #ffd45c;
  box-shadow: 0 0 0 3px rgba(255, 212, 92, 0.5), 0 6px 14px -6px rgba(40, 50, 70, 0.5);
}

.cabinet__stars {
  font-size: 12px;
}

.cabinet__name {
  font-size: 12px;
  font-weight: 700;
  color: #2a3a4a;
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
  background: rgba(14, 20, 30, 0.55);
  color: #eaf2fb;
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
  background: rgba(14, 20, 30, 0.35);
}

/* --- 购买小卡 --- */
.buy-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.buy-card__icon {
  width: 84px;
  height: 84px;
}

.buy-card__stars {
  font-size: 15px;
}

.buy-card__price {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.buy-card__note {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}

.buy-card__actions {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  width: 100%;
  margin-top: var(--s2);
}
</style>
