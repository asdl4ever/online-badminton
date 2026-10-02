<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import SideDock from '../components/ui/SideDock.vue';
import Joystick from '../components/ui/Joystick.vue';
import PresencePanel from '../components/ui/PresencePanel.vue';
import Button from '../components/ui/Button.vue';
import StatusChip from '../components/ui/StatusChip.vue';
import { isTouchDevice } from '../game/device';
import { useJoystickPrefs } from '../composables/useJoystick';
import AppModal from '../components/ui/AppModal.vue';
import ComboPanel from '../components/ComboPanel.vue';
import type { PresencePlayer } from '../stores/presence';
import { WORLD_H, WORLD_W, WORLD_ZONES, ZONE_RADIUS, type WorldZone } from '../game/world/zones';
import { SCENE_KIND, sceneMeta } from '../game/scenes';
import { AVATAR_FEET_PAD, avatarBoxSize, paintAvatar } from '../game/draw/canvas2d';
import { P } from '../game/theme';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';
import { useMapSession } from '../composables/useMapSession';
import { usePresenceStore } from '../stores/presence';
import { useProgressStore } from '../stores/progress';
import { useLobbyStore } from '../stores/lobby';
import { useCustomizeStore } from '../stores/customize';

const router = useRouter();
const presence = usePresenceStore();
const progress = useProgressStore();
const lobby = useLobbyStore();
const customize = useCustomizeStore();

/* --- 右侧活动栏 ------------------------------------------------------------------ */
/** 小黄龙联名：跳转到活动页面（挑战 + 转盘） */
function openNailong(): void {
  sfx.click();
  void router.push('/nailong');
}

/** 哥斯拉来袭：跳转到活动页面 */
function openGodzilla(): void {
  sfx.click();
  void router.push('/godzilla');
}

/** 发球机连击里程碑：不跳页，直接弹详情看进度 */
const comboOpen = ref(false);

function openCombo(): void {
  sfx.click();
  comboOpen.value = true;
}

/** 去看进度不如去练：跳到单机练习（在里面选发球机模式） */
function goPractice(): void {
  comboOpen.value = false;
  sfx.click();
  void router.push('/single');
}

/* --- 地图上的角色：用游戏里那套绘制，所以装扮和球拍皮肤都跟着走 --------- */
const AVATAR_SCALE = 0.8;
const avatarBox = avatarBoxSize(AVATAR_SCALE);
const avatarFeetPad = Math.round(AVATAR_FEET_PAD * AVATAR_SCALE);
const meCanvas = ref<HTMLCanvasElement | null>(null);
const peerCanvas = ref<HTMLCanvasElement | null>(null);
let facing: 1 | -1 = 1;

function paintMe(now: number): void {
  const canvas = meCanvas.value;
  if (!canvas) return;
  paintAvatar(canvas, customize.cosmetic, now, { scale: AVATAR_SCALE, facing });
}

/* --- 一起逛：好友被邀请进来后，就站在这张地图上 ------------------------- */
const map = useMapSession();
// 解构成顶层 ref，模板里才会自动解包
const { code: mapCode, phase: mapPhase, waiting: mapWaiting, connState: mapConn, peer: mapPeer } = map;
const mapJoinCode = ref('');

/** 客人第一次拿到房主的位置时，站到他旁边 */
map.onFirstPeer = (x, y) => {
  me.value = clampToWorld(x + 70, y + 30);
};

function paintPeer(now: number): void {
  const peer = mapPeer.value;
  const canvas = peerCanvas.value;
  if (!peer || !canvas) return;
  // 对方用对战里 2 号位的颜色，和自己的 1 号位区分开
  paintAvatar(canvas, peer.cosmetic, now, {
    scale: AVATAR_SCALE,
    facing: peer.facing,
    color: P.player1,
  });
}

/* 左侧在线列表由大厅推送（App.vue 里汇总进 presence），这里不再自己塞数据 */

/** 接受好友的地图邀请后，直接进他的营地 */
watch(
  () => lobby.pendingJoin,
  () => {
    const code = lobby.consumeInvite('map');
    if (!code) return;
    mapJoinCode.value = code;
    void map.join(code);
  },
  { immediate: true },
);

function joinMapByCode(): void {
  void map.join(mapJoinCode.value);
}

/** 角色在平面上的坐标 + 摇杆推力 + 键盘按住的方向 */
const me = ref({ x: 620, y: 760 });
const joy = ref({ x: 0, y: 0 });
// 摇杆：触屏必显；桌面端开了「摇杆常显」也显示（设置里改）
const { always: joyAlways } = useJoystickPrefs();
const showJoy = computed(() => isTouchDevice() || joyAlways.value);
const held = new Set<string>();
const MOVED_SPEED = 400; // px/s
const cam = ref({ x: 0, y: 0 });
const nearZone = ref<WorldZone | null>(null);
const plane = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);

/** 段位/背包/宝箱(跳商店)/好友/成就都由 PageShell 内置，这里只留一个引用去调它的方法 */
const shell = ref<{ openFriends: () => void } | null>(null);

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
  // 自己的位姿发给对方（12Hz），对方的位置插值过来
  map.tick(dt, { x: me.value.x, y: me.value.y, facing });
  paintMe(now);
  paintPeer(now);
  raf = requestAnimationFrame(loop);
}

function enterZone(z: WorldZone): void {
  if (!z.route) {
    toastWarn(`${z.name} 还没开放`);
    return;
  }
  // 理发店现在可以先免费试穿，确认修改才收费（扣费在 BarberView 里），所以不拦
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
/**
 * 「申请加入」= 直接用他的房号进他那一局：跳到他所在的页面，房号交给那个页面
 * （页面自己的 join 流程会消费它），之后他就是房主、我跟着他走。
 */
function join(p: PresencePlayer): void {
  sfx.click();
  if (!p.room || !p.scene || !SCENE_KIND[p.scene]) {
    toastWarn(`${p.name} 还没开房：让他先「建房」再邀请你`);
    return;
  }
  if (!lobby.requestJoin(p.id)) {
    toastWarn(`${p.name} 的房间暂时进不去`);
    return;
  }
  const meta = sceneMeta(p.scene);
  toastGood(`加入 ${p.name} · ${meta.label}`);
  void router.push(meta.route);
}

function spectate(p: PresencePlayer): void {
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
  const code = mapCode.value;
  sfx.click();
  if (!code) {
    toastWarn('先建房才能分享房号');
    return;
  }
  void navigator.clipboard?.writeText(code).then(
    () => toastGood(`房号 ${code} 已复制，发给好友即可一起逛`),
    () => toastWarn('复制失败，请手动记下房号'),
  );
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  updateCamera();
  raf = requestAnimationFrame(loop);
});

function leaveMap(): void {
  sfx.click();
  map.leave();
  toastGood('已离开营地');
}

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  map.leave();
});
</script>

<template>
  <!-- 整页固定高度、不滚动：地图平面靠外壳的主区域撑开 -->
  <div class="page page--playing">
    <PageShell
      ref="shell"
      title="大世界 · 营地"
      back
      friends-kind="map"
      :friends-code="mapCode"
      :friends-can-invite="!!mapCode"
      @back="router.push('/home')"
    >
    <template #dock>
      <SideDock>
        <span class="presence__mode">🪙 {{ progress.coins }}</span>
        <StatusChip :tone="mapConn === 'online' ? 'ok' : mapWaiting ? 'warn' : 'idle'">
          {{ mapConn === 'online' ? '好友在营地' : mapCode ? `房间 ${mapCode}` : '一个人逛' }}
        </StatusChip>

        <!-- 房主：建房 → 邀请好友 -->
        <Button v-if="!mapCode && mapConn === 'off'" size="sm" block :disabled="mapWaiting" @click="map.host()">
          建房一起逛
        </Button>
        <Button v-if="mapCode" size="sm" block @click="shell?.openFriends()">邀请好友</Button>

        <!-- 客人：输房号直接进 -->
        <template v-if="!mapCode && mapConn === 'off'">
          <input
            v-model="mapJoinCode"
            class="world-code"
            maxlength="6"
            placeholder="房号"
            @keyup.enter="joinMapByCode"
          />
          <Button size="sm" block :disabled="mapWaiting" @click="joinMapByCode">加入好友营地</Button>
        </template>

        <Button v-if="mapCode" size="sm" block @click="copyCode">复制房号</Button>
        <Button v-if="mapConn === 'online'" size="sm" block @click="leaveMap">离开营地</Button>

        <span v-if="mapPhase" class="dock-note">{{ mapPhase }}</span>
        <Button size="sm" variant="quiet" block @click="router.push('/online')">去联机对战</Button>
        <p class="dock-note">
          摇杆 / WASD 走动，走进区域圈里按 E 进入；建房后邀请好友，他们会直接站到这张地图上。
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

          <!-- 好友：同样的绘制，用 2 号位颜色区分，位置来自 12Hz 同步 -->
          <div
            v-if="mapPeer"
            class="avatar is-friend"
            :style="{
              left: `${mapPeer.x}px`,
              top: `${mapPeer.y}px`,
              width: `${avatarBox.w}px`,
              height: `${avatarBox.h}px`,
              transform: `translate(-50%, calc(-100% + ${avatarFeetPad}px))`,
            }"
          >
            <canvas ref="peerCanvas" class="avatar__rig" />
            <div class="avatar__name">{{ mapPeer.name }}</div>
          </div>
        </div>

        <div class="world__prompt" :class="{ 'is-on': !!nearZone }">
          {{ nearZone ? `按 E 进入「${nearZone.name}」` : '' }}
        </div>
        <div class="world__hint">摇杆 / WASD 自由走动 · 走进区域圈里按 E 进入</div>

        <!-- 活动栏：右侧悬浮入口（活动随时可进，不用跑地图） -->
        <div class="world__events">
          <button
            class="world__event jelly"
            type="button"
            title="小黄龙联名 · 挑战 + 转盘抽奖"
            @click="openNailong"
          >
            <span class="world__event-icon">🐲</span>
            <span class="world__event-text">
              <b>小黄龙联名</b>
              <em>挑战 / 转盘抽奖</em>
            </span>
            <span v-if="progress.nailongTickets > 0" class="world__event-badge num">
              {{ progress.nailongTickets }}
            </span>
          </button>

          <button
            class="world__event jelly"
            type="button"
            title="哥斯拉来袭 · 拍火球打巨兽"
            @click="openGodzilla"
          >
            <span class="world__event-icon">🦖</span>
            <span class="world__event-text">
              <b>哥斯拉来袭</b>
              <em>拍火球 · 拿限定装扮</em>
            </span>
          </button>

          <button
            class="world__event world__event--combo jelly"
            type="button"
            title="发球机连击里程碑 · 点击查看进度"
            @click="openCombo"
          >
            <span class="world__event-icon">🎯</span>
            <span class="world__event-text">
              <b>连击里程碑</b>
              <em>最高 {{ progress.machineBest }} 连击 · {{ progress.milestones.length }}/10 档</em>
            </span>
          </button>
        </div>

        <PresencePanel
          :players="players"
          :watching="presence.watching"
          @join="join"
          @watch="spectate"
        />

        <Joystick v-if="showJoy" @move="(x, y) => (joy = { x, y })" />
      </div>
    </template>
  </PageShell>

  <!-- 发球机连击里程碑：点右侧活动栏的 🎯 打开，看进度与奖励。
       注意必须放在 PageShell 外面——它只有具名插槽，没有默认插槽，
       写在里面的内容根本不会渲染（之前就是踩了这个坑）。 -->
  <AppModal v-model="comboOpen" title="🎯 连击里程碑" max-width="560px">
    <ComboPanel @play="goPractice" />
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

/* 坞里的房号输入：手机端也刚好能戳 */
.world-code {
  width: 100%;
  padding: 6px 10px;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 600;
  text-align: center;
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
/* --- 右侧的活动栏 --- */
.world__events {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  /* 抬到区域卡与角色（都是 z-index 6）之上，保证活动栏一定点得到 */
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.world__event {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--r-pill);
  border: 2px solid #ffd93d;
  background: linear-gradient(135deg, #fff6cf, #ffe07a);
  box-shadow: 0 8px 18px -8px rgba(120, 90, 0, 0.6);
  cursor: pointer;
}

/* 连击里程碑换个色系，和联名活动区分开 */
.world__event--combo {
  border-color: #7fd4ff;
  background: linear-gradient(135deg, #eaf8ff, #bfe9ff);
}

.world__event--combo .world__event-text b {
  color: #14556e;
}

.world__event--combo .world__event-text em {
  color: #3d7f96;
}

.world__event-icon {
  font-size: 24px;
  line-height: 1;
}

.world__event-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.15;
}

.world__event-text b {
  font-size: 13px;
  color: #6a4a00;
}

.world__event-text em {
  font-style: normal;
  font-size: 10px;
  color: #9a7a20;
}

.world__event-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 50%;
  background: #d42a3a;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: grid;
  place-items: center;
}
</style>
