<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import SideDock from '../components/ui/SideDock.vue';
import Joystick from '../components/ui/Joystick.vue';
import PresencePanel from '../components/ui/PresencePanel.vue';
import Button from '../components/ui/Button.vue';
import AppModal from '../components/ui/AppModal.vue';
import RankPanel from '../components/RankPanel.vue';
import CustomizePanel from '../components/CustomizePanel.vue';
import BackpackPanel from '../components/BackpackPanel.vue';
import ChestPanel from '../components/ChestPanel.vue';
import PetEggPanel from '../components/PetEggPanel.vue';
import FriendsPanel from '../components/FriendsPanel.vue';
import type { PresencePlayer } from '../stores/presence';
import { WORLD_H, WORLD_W, WORLD_ZONES, ZONE_RADIUS, type WorldZone } from '../game/world/zones';
import { AVATAR_FEET_PAD, avatarBoxSize, paintAvatar } from '../game/draw/canvas2d';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';
import { usePresenceStore } from '../stores/presence';
import { useProgressStore } from '../stores/progress';
import { useGameStore } from '../stores/game';
import { useCustomizeStore } from '../stores/customize';

const router = useRouter();
const presence = usePresenceStore();
const progress = useProgressStore();
const game = useGameStore();
const customize = useCustomizeStore();

/* --- 地图上的角色：用游戏里那套绘制，所以装扮和球拍皮肤都跟着走 --------- */
const AVATAR_SCALE = 0.8;
const avatarBox = avatarBoxSize(AVATAR_SCALE);
const avatarFeetPad = Math.round(AVATAR_FEET_PAD * AVATAR_SCALE);
const meCanvas = ref<HTMLCanvasElement | null>(null);
let facing: 1 | -1 = 1;

function paintMe(now: number): void {
  const canvas = meCanvas.value;
  if (!canvas) return;
  paintAvatar(canvas, customize.cosmetic, now, { scale: AVATAR_SCALE, facing });
}
/** 有房间号说明已经联机开房，可以邀请好友进地图 */
const roomCode = computed(() => game.roomCode);

/** 角色在平面上的坐标 + 摇杆推力 + 键盘按住的方向 */
const me = ref({ x: 620, y: 760 });
const joy = ref({ x: 0, y: 0 });
const held = new Set<string>();
const MOVED_SPEED = 400; // px/s
const cam = ref({ x: 0, y: 0 });
const nearZone = ref<WorldZone | null>(null);
const plane = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);

const showRank = ref(false);
const showLook = ref(false);
const showBag = ref(false);
const showChest = ref(false);
const showEgg = ref(false);
const showFriends = ref(false);

/** 在线玩家列表：联机时由 presence store 填充，单机为空 */
const players = computed<PresencePlayer[]>(() => presence.players);

const KEY_VECTORS: Record<string, [number, number]> = {
  arrowleft: [-1, 0],
  a: [-1, 0],
  arrowright: [1, 0],
  d: [1, 0],
  arrowup: [0, -1],
  w: [0, -1],
  arrowdown: [0, 1],
  s: [0, 1],
};

function clampToWorld(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.max(70, Math.min(WORLD_W - 70, x)),
    y: Math.max(70, Math.min(WORLD_H - 70, y)),
  };
}

function updateCamera(): void {
  const box = stage.value?.getBoundingClientRect();
  const viewW = box?.width ?? 844;
  const viewH = box?.height ?? 390;
  cam.value = {
    x: Math.max(0, Math.min(WORLD_W - viewW, me.value.x - viewW / 2)),
    y: Math.max(0, Math.min(WORLD_H - viewH, me.value.y - viewH / 2)),
  };
  if (plane.value) plane.value.style.transform = `translate(${-cam.value.x}px, ${-cam.value.y}px)`;

  let near: WorldZone | null = null;
  let best = Infinity;
  for (const z of WORLD_ZONES) {
    const d = Math.hypot(z.x - me.value.x, z.y - me.value.y);
    if (d < ZONE_RADIUS && d < best) {
      best = d;
      near = z;
    }
  }
  nearZone.value = near;
}

let raf = 0;
let last = performance.now();
function loop(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  let vx = joy.value.x;
  let vy = joy.value.y;
  held.forEach((k) => {
    const v = KEY_VECTORS[k];
    if (v) {
      vx += v[0];
      vy += v[1];
    }
  });
  const len = Math.hypot(vx, vy);
  if (len > 0.06) {
    const k = Math.min(len, 1) / len;
    me.value = clampToWorld(
      me.value.x + vx * k * MOVED_SPEED * dt,
      me.value.y + vy * k * MOVED_SPEED * dt,
    );
    // 朝移动方向：球拍和身体会跟着翻面
    if (Math.abs(vx) > 0.06) facing = vx > 0 ? 1 : -1;
  }
  updateCamera();
  paintMe(now);
  raf = requestAnimationFrame(loop);
}

function enterZone(z: WorldZone): void {
  if (!z.route) {
    toastWarn(`${z.name} 还没开放`);
    return;
  }
  sfx.click();
  presence.setWatching(null);
  toastGood(`走进「${z.name}」`);
  void router.push(z.route);
}

function onZoneClick(z: WorldZone): void {
  if (nearZone.value?.id === z.id) enterZone(z);
  else toastWarn(`「${z.name}」还太远，先走过去`);
}

function onKeyDown(e: KeyboardEvent): void {
  const k = e.key.toLowerCase();
  if (KEY_VECTORS[k]) held.add(k);
  if (k === 'e' && nearZone.value) enterZone(nearZone.value);
}

function onKeyUp(e: KeyboardEvent): void {
  held.delete(e.key.toLowerCase());
}

/* --- 在线玩家：申请加入 / 观战 ------------------------------------------- */
function join(p: PresencePlayer): void {
  sfx.click();
  presence.requestJoin(p.id);
  toastGood(`已向 ${p.name} 发送加入申请，等对方同意`);
}

function watch(p: PresencePlayer): void {
  sfx.click();
  if (presence.watching === p.id) {
    presence.setWatching(null);
    return;
  }
  presence.setWatching(p.id);
  toastGood(`正在观战 ${p.name} 的「${p.mode}」`);
}

/* --- 坞里的功能 ----------------------------------------------------------- */
function copyCode(): void {
  const code = roomCode.value || '本地地图';
  sfx.click();
  void navigator.clipboard?.writeText(code).then(
    () => toastGood(`地图口令 ${code} 已复制`),
    () => toastWarn('复制失败，请手动备份地图口令'),
  );
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  updateCamera();
  raf = requestAnimationFrame(loop);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
});
</script>

<template>
  <!-- 整页固定高度、不滚动：地图平面靠外壳的主区域撑开 -->
  <div class="page page--playing">
    <PageShell title="大世界 · 营地" back @back="router.push('/home')">
    <template #icons>
      <button class="icon-btn jelly" type="button" title="段位" @click="showRank = true">🏅</button>
      <button class="icon-btn jelly" type="button" title="外观" @click="showLook = true">🎨</button>
      <button class="icon-btn jelly" type="button" title="背包" @click="showBag = true">🎒</button>
      <button class="icon-btn jelly" type="button" title="宝箱" @click="showChest = true">🎁</button>
      <button class="icon-btn jelly" type="button" title="宠物蛋" @click="showEgg = true">🥚</button>
      <button class="icon-btn jelly" type="button" title="好友" @click="showFriends = true">👥</button>
    </template>

    <template #dock>
      <SideDock>
        <span class="presence__mode">🪙 {{ progress.coins }}</span>
        <Button v-if="roomCode" size="sm" block @click="showFriends = true">邀请好友</Button>
        <Button v-else size="sm" block @click="router.push('/online')">去联机建房</Button>
        <Button size="sm" @click="copyCode">复制地图口令</Button>
        <p class="dock-note">
          摇杆 / WASD 在平面上走动，走进区域圈里按 E 进入；邀请来的好友会直接站在这张地图上。
        </p>
      </SideDock>
    </template>

    <template #stage>
      <div ref="stage" class="world">
        <div ref="plane" class="world__plane" :style="{ width: `${WORLD_W}px`, height: `${WORLD_H}px` }">
          <div class="world__path" style="left: 0; top: 620px; width: 2400px; height: 120px" />
          <div class="world__path" style="left: 1080px; top: 0; width: 130px; height: 1400px" />

          <button
            v-for="z in WORLD_ZONES"
            :key="z.id"
            class="zone jelly"
            type="button"
            :style="{ left: `${z.x}px`, top: `${z.y}px` }"
            @click="onZoneClick(z)"
          >
            <span class="zone__sign">{{ z.sign }}</span>
            <span class="zone__name">{{ z.name }}</span>
            <span class="zone__meta">{{ z.meta }}</span>
            <span v-if="z.badge" class="zone__badge">{{ z.badge }}</span>
          </button>

          <!-- 角色：和游戏里同一份绘制（含全部装扮 + 球拍皮肤），脚底对齐坐标点 -->
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

        <div class="world__prompt" :class="{ 'is-on': !!nearZone }">
          {{ nearZone ? `按 E 进入「${nearZone.name}」` : '' }}
        </div>
        <div class="world__hint">摇杆 / WASD 自由走动 · 走进区域圈里按 E 进入</div>

        <PresencePanel
          :players="players"
          :watching="presence.watching"
          @join="join"
          @watch="watch"
        />

        <Joystick @move="(x, y) => (joy = { x, y })" />
      </div>
    </template>
  </PageShell>

  <AppModal v-model="showRank" title="段位" max-width="600px"><RankPanel /></AppModal>
  <AppModal v-model="showLook" title="外观自定义"><CustomizePanel /></AppModal>
  <AppModal v-model="showBag" title="背包" max-width="760px"><BackpackPanel /></AppModal>
  <AppModal v-model="showChest" title="宝箱" max-width="540px"><ChestPanel /></AppModal>
  <AppModal v-model="showEgg" title="宠物蛋" max-width="480px"><PetEggPanel /></AppModal>
    <AppModal v-model="showFriends" title="好友" max-width="720px">
      <FriendsPanel :room-code="roomCode" :can-invite="!!roomCode" />
    </AppModal>
  </div>
</template>

<style scoped>
.dock-note {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-dim);
}

/* 角色用 canvas 画（见 game/draw/canvas2d.ts），外面这个盒子只负责定位 */
.avatar__rig {
  display: block;
  width: 100%;
  height: 100%;
  /* 放大到整块地图的尺寸时不要被 DOM 的抗锯齿糊掉 */
  image-rendering: auto;
}

/* 名字挂到头顶上方，不占盒子高度（盒子底部要对齐脚下的坐标点） */
.avatar__name {
  position: absolute;
  bottom: calc(100% - 4px);
  left: 50%;
  transform: translateX(-50%);
}
</style>
