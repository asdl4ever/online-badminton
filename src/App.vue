<script setup lang="ts">
import { onBeforeUnmount, ref, watch, watchEffect } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import { useMobileShell } from './composables/useMobileShell';
import { useLobbyStore, type FriendRequest, type Invite } from './stores/lobby';
import { usePresenceStore } from './stores/presence';
import { useProgressStore } from './stores/progress';
import { SCENE_KIND, joinInfo, sceneFromPath, sceneMeta } from './game/scenes';
import { toastWarn } from './composables/useToast';
import type { InviteKind } from './net/lobby';
import { sfx } from './game/audio';
import Button from './components/ui/Button.vue';
import AppToast from './components/ui/AppToast.vue';

// requests fullscreen + landscape lock on the first tap (touch devices only)
useMobileShell();

const router = useRouter();
const route = useRoute();
const lobby = useLobbyStore();
const presence = usePresenceStore();
const progress = useProgressStore();

/** 邀请是哪个场景发出来的，接受后就去哪个页面（页面自己再取房间号入房） */
const INVITE_LANDING: Record<InviteKind, { path: string; label: string }> = {
  match: { path: '/online', label: '对局' },
  map: { path: '/', label: '大世界' },
  fish: { path: '/fish', label: '钓鱼塘' },
  mine: { path: '/mine', label: '矿洞' },
};

function inviteLabel(inv: Invite): string {
  return INVITE_LANDING[inv.kind]?.label ?? '对局';
}

function acceptInvite(inv: Invite) {
  lobby.acceptInvite(inv);
  void router.push(INVITE_LANDING[inv.kind]?.path ?? '/online');
}

function acceptRequest(req: FriendRequest) {
  lobby.acceptRequest(req);
}

/* --- 我在哪：路由一变就报给大厅，好友的列表因此实时 --------------------- */
watch(
  () => route.path,
  (path) => lobby.setScene(sceneFromPath(path)),
  { immediate: true },
);

/* --- 在线好友列表：大厅推来的「在玩什么」汇总进 presence ---------------- */
watchEffect(() => {
  const myScene = sceneFromPath(route.path);
  presence.populate(
    lobby.onlineFriends.map((f) => {
      const meta = sceneMeta(f.scene);
      const sameRoom = !!lobby.room && f.room === lobby.room && f.scene === myScene;
      return {
        id: f.id,
        name: f.name,
        mode: meta.label,
        icon: meta.icon,
        joinable: joinInfo(f.scene, f.room, true, lobby.states[f.id]?.allowJoin ?? true).can,
        room: f.room,
        scene: f.scene,
        // 已经在同一间房、同一个界面：他就在你旁边，不需要「申请加入」
        nearby: sameRoom,
      };
    }),
  );
});

/* --- 晋级赛预约：低频心跳，到点自动开赛 ------------------------------------
 * 15 秒一次（预约的精度在分钟级，不需要更密），并在页面重新可见时补判一次——
 * 手机锁屏 / 切后台时定时器会被节流，回到前台必须立刻补上。
 * 开赛成功就**响铃提醒**（铃声 + 震动 + 顶部那块提示条），没人看着也不会错过。
 */
const ringing = ref<string | null>(null);
let ringTimer: number | undefined;
let ringLeft = 0;

function stopRing(): void {
  ringing.value = null;
  if (ringTimer) window.clearInterval(ringTimer);
  ringTimer = undefined;
}

/** 手机响：先来一嗓子，之后每 5 秒再响一次，最多 4 次（点掉就停） */
function startRing(cups: string): void {
  ringing.value = cups;
  ringLeft = 3;
  sfx.ring();
  navigator.vibrate?.([220, 120, 220]);
  if (ringTimer) window.clearInterval(ringTimer);
  ringTimer = window.setInterval(() => {
    if (ringLeft-- <= 0) {
      stopRing();
      return;
    }
    sfx.ring();
    navigator.vibrate?.([220, 120, 220]);
  }, 5000);
}

function gotoCups(): void {
  stopRing();
  void router.push('/arena');
}

function checkBookings(): void {
  // 世界自己会变：到点让老将退役、新秀入行（见 players.evolveRoster），
  // 世界赛冠军出炉也顺手记进「新闻周刊」（见 progress.scanWorldNews）
  progress.evolveRosterIfDue();
  progress.scanWorldNews();
  const started = progress.tickArenaBooking(Date.now(), lobby.playerName);
  if (started.length) startRing(started.join(' · '));
}

const bookingTimer = window.setInterval(checkBookings, 15_000);
const onVisible = (): void => {
  if (!document.hidden) checkBookings();
};
document.addEventListener('visibilitychange', onVisible);
onBeforeUnmount(() => {
  window.clearInterval(bookingTimer);
  document.removeEventListener('visibilitychange', onVisible);
  stopRing();
});

/* --- 跟随房主：他换界面我就跟过去（访客才有 following） ---------------- */
watch(
  () => {
    const host = lobby.following ? lobby.states[lobby.following] : null;
    return host ? `${host.scene}|${host.room}` : '';
  },
  () => {
    if (lobby.role !== 'guest' || !lobby.following) return;
    const host = lobby.states[lobby.following];
    if (!host) return;
    const meta = sceneMeta(host.scene);
    if (!meta.route || meta.route === route.path) return;
    // 房号交给目标页面：带 kind 的页面（对局/地图/潜水/矿洞）会自己入房
    const kind = SCENE_KIND[host.scene];
    if (kind && host.room) lobby.pendingJoin = { code: host.room, kind };
    toastWarn(`${host.name} 去了${meta.label}，跟着过去…`);
    void router.push(meta.route);
  },
);
</script>

<template>
  <RouterView />

  <AppToast />

  <!-- 预约到点：手机会响（铃声 + 震动 + 这块顶部提示条，点掉才停） -->
  <Transition name="alarm">
    <div v-if="ringing" class="alarm" role="alert">
      <span class="alarm__icon">🔔</span>
      <div class="alarm__body">
        <p class="alarm__title">开赛了！{{ ringing }}</p>
        <p class="alarm__sub">已自动为你报名，去晋级赛馆把这届打完</p>
      </div>
      <div class="alarm__actions">
        <Button size="sm" variant="primary" @click="gotoCups">去看赛程</Button>
        <Button size="sm" variant="quiet" @click="stopRing">知道了</Button>
      </div>
    </div>
  </Transition>

  <div v-auto-animate="{ duration: 220 }" class="toasts">
    <div v-if="progress.notice" class="toast toast--accent">
      <p class="toast__title">{{ progress.notice }}</p>
    </div>

    <div v-for="inv in lobby.invites" :key="`inv-${inv.from}`" class="toast">
      <p class="toast__title">
        <b>{{ inv.name }}</b> 邀请你加入{{ inviteLabel(inv) }}
      </p>
      <p class="toast__sub num">房间 {{ inv.code }}</p>
      <div class="toast__actions">
        <Button size="sm" variant="primary" @click="acceptInvite(inv)">接受</Button>
        <Button size="sm" variant="quiet" @click="lobby.declineInvite(inv)">拒绝</Button>
      </div>
    </div>

    <div v-for="req in lobby.requests" :key="`req-${req.from}`" class="toast">
      <p class="toast__title">
        <b>{{ req.name }}</b> 请求加你为好友
      </p>
      <p class="toast__sub num">{{ req.from }}</p>
      <div class="toast__actions">
        <Button size="sm" variant="primary" @click="acceptRequest(req)">接受</Button>
        <Button size="sm" variant="quiet" @click="lobby.declineRequest(req)">忽略</Button>
      </div>
    </div>
  </div>

  <div class="rotate-hint">
    <div>
      <svg class="rotate-hint__icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect
          x="7"
          y="2"
          width="10"
          height="20"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        />
        <path d="M10.5 5h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path
          d="M4 12a8.5 8.5 0 0 1 2-5.5M20 12a8.5 8.5 0 0 0-2-5.5"
          fill="none"
          stroke="var(--accent)"
          stroke-width="1.8"
          stroke-linecap="round"
        />
      </svg>
      <p style="font-size: 17px">请把手机横过来</p>
      <p class="muted" style="margin-top: 6px">横屏才能看清整个球场</p>
    </div>
  </div>
</template>

<style scoped>
.rotate-hint__icon {
  width: 52px;
  height: 52px;
  display: block;
  margin: 0 auto var(--s3);
  color: var(--text-dim);
}

.toasts {
  position: fixed;
  top: var(--s4);
  right: var(--s4);
  z-index: 60;
  display: flex;
  flex-direction: column;
  gap: var(--s3);
  max-width: min(320px, calc(100vw - var(--s5)));
}

.toast {
  padding: var(--s3) var(--s4);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2, var(--surface));
  box-shadow: var(--e2, var(--e1));
}

.toast__title {
  margin: 0;
  font-size: 14px;
  color: var(--text);
}

.toast__sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-dim);
  letter-spacing: 2px;
}

.toast--accent {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 25%, transparent), var(--e2, var(--e1));
}

.toast__actions {
  display: flex;
  gap: var(--s2);
  margin-top: var(--s3);
}

/* --- 预约开赛的响铃提示条（顶部居中，压在 toast 之上） ---------------------- */
.alarm {
  position: fixed;
  top: max(var(--s4), env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 70;
  display: flex;
  align-items: center;
  gap: var(--s3);
  max-width: min(92vw, 560px);
  padding: var(--s3) var(--s4);
  border-radius: var(--r-lg);
  border: 1px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, var(--surface));
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--accent) 22%, transparent),
    var(--e2, var(--e1));
}

.alarm__icon {
  flex: none;
  font-size: 26px;
  line-height: 1;
  animation: alarm-ring 1.2s ease-in-out infinite;
}

@keyframes alarm-ring {
  0%,
  100% {
    transform: rotate(-12deg);
  }
  50% {
    transform: rotate(12deg);
  }
}

.alarm__body {
  flex: 1 1 auto;
  min-width: 0;
}

.alarm__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.alarm__sub {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-dim);
}

.alarm__actions {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alarm-enter-active,
.alarm-leave-active {
  transition:
    opacity var(--dur-2) var(--ease),
    transform var(--dur-2) var(--ease);
}

.alarm-enter-from,
.alarm-leave-to {
  opacity: 0;
  transform: translate(-50%, -14px);
}

@media (prefers-reduced-motion: reduce) {
  .alarm__icon {
    animation: none;
  }
}

@media (max-width: 560px) {
  .alarm {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .alarm__actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
