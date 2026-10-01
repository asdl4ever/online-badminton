<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import { useMobileShell } from './composables/useMobileShell';
import { useLobbyStore, type FriendRequest, type Invite } from './stores/lobby';
import { useProgressStore } from './stores/progress';
import type { InviteKind } from './net/lobby';
import Button from './components/ui/Button.vue';
import AppToast from './components/ui/AppToast.vue';

// requests fullscreen + landscape lock on the first tap (touch devices only)
useMobileShell();

const router = useRouter();
const lobby = useLobbyStore();
const progress = useProgressStore();

/** 邀请是哪个场景发出来的，接受后就去哪个页面（页面自己再取房间号入房） */
const INVITE_LANDING: Record<InviteKind, { path: string; label: string }> = {
  match: { path: '/online', label: '对局' },
  map: { path: '/', label: '大地图' },
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
</script>

<template>
  <RouterView />

  <AppToast />

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
</style>
