<script setup lang="ts">
import { ref, watch } from 'vue';
import { useClipboard } from '@vueuse/core';
import { VTextField } from 'vuetify/components';
import Panel from './ui/Panel.vue';
import Button from './ui/Button.vue';
import StatusChip from './ui/StatusChip.vue';
import { useLobbyStore } from '../stores/lobby';

const props = withDefaults(
  defineProps<{
    /** the code others can join while hosting; empty when not in a room */
    roomCode: string;
    /** inviting only makes sense once a room is actually open */
    canInvite: boolean;
    /** drop the surrounding Panel + heading (for use inside a modal) */
    bare?: boolean;
    /**
     * 'manage' — home page: add friends on the top right, list on the left
     * 'invite' — in a room: only the "invite a friend" list
     */
    variant?: 'manage' | 'invite';
  }>(),
  { bare: false, variant: 'manage' },
);

const store = useLobbyStore();
const { copy, copied, isSupported: clipboardSupported } = useClipboard();

const addCode = ref('');
const nameDraft = ref(store.playerName);
watch(
  () => store.playerName,
  (v) => (nameDraft.value = v),
);

const statusLabel = () => {
  if (store.status === 'online') return '在线';
  if (store.status === 'connecting') return '连接中…';
  return '离线';
};

function copyId() {
  void copy(store.playerId);
}

function addFriend() {
  store.requestFriend(addCode.value);
  if (!store.lastError) addCode.value = '';
}

function commitName() {
  store.rename(nameDraft.value);
  nameDraft.value = store.playerName;
}

function invite(id: string) {
  store.invite(id, props.roomCode);
}
</script>

<template>
  <component :is="bare ? 'div' : Panel">
    <!-- ---------------- in-room: invite only ---------------- -->
    <template v-if="variant === 'invite'">
      <div class="fp__head">
        <h3>邀请好友</h3>
        <StatusChip :tone="store.status === 'online' ? 'ok' : 'warn'">
          {{ statusLabel() }}
        </StatusChip>
      </div>

      <ul class="fp__list">
        <li v-for="f in store.friends" :key="f.id" class="fp__friend">
          <span class="fp__dot" :class="{ 'fp__dot--on': store.isOnline(f.id) }" aria-hidden="true" />
          <span class="fp__name">{{ f.name }}</span>
          <span class="num fp__friend-id">{{ f.id }}</span>
          <Button
            size="sm"
            variant="primary"
            :disabled="!canInvite || !store.isOnline(f.id)"
            :title="canInvite ? '' : '先创建房间'"
            @click="invite(f.id)"
          >
            邀请
          </Button>
        </li>
        <li v-if="!store.friends.length" class="muted">
          还没有好友，去主页的「好友」里添加吧
        </li>
      </ul>

      <p class="muted fp__hint">好友列表只存在本机，双方都在线时才能邀请。</p>
    </template>

    <!-- ---------------- home page: left list / top-right add ---------------- -->
    <div v-else class="fp__grid">
      <section class="fp__col">
        <div class="fp__head">
          <h3 v-if="!bare">好友</h3>
          <span v-else />
          <StatusChip :tone="store.status === 'online' ? 'ok' : 'warn'">
            {{ statusLabel() }}
          </StatusChip>
        </div>

        <ul class="fp__list">
          <li v-for="f in store.friends" :key="f.id" class="fp__friend">
            <span
              class="fp__dot"
              :class="{ 'fp__dot--on': store.isOnline(f.id) }"
              aria-hidden="true"
            />
            <span class="fp__name">{{ f.name }}</span>
            <span class="num fp__friend-id">{{ f.id }}</span>
            <Button
              v-if="canInvite"
              size="sm"
              variant="primary"
              :disabled="!store.isOnline(f.id)"
              @click="invite(f.id)"
            >
              邀请
            </Button>
            <Button size="sm" variant="quiet" @click="store.removeFriend(f.id)">删</Button>
          </li>
          <li v-if="!store.friends.length" class="muted">
            还没有好友，把右边的好友码发给对方吧
          </li>
        </ul>

        <template v-if="store.requests.length">
          <p class="fp__subtitle">好友请求</p>
          <ul class="fp__list">
            <li v-for="r in store.requests" :key="r.from" class="fp__friend">
              <span class="fp__name">{{ r.name }}</span>
              <span class="num fp__friend-id">{{ r.from }}</span>
              <Button size="sm" variant="primary" @click="store.acceptRequest(r)">接受</Button>
              <Button size="sm" variant="quiet" @click="store.declineRequest(r)">忽略</Button>
            </li>
          </ul>
        </template>

        <p class="muted fp__hint">好友列表只存在本机。双方都在线时才能添加或邀请。</p>
      </section>

      <aside class="fp__col fp__add">
        <h4 class="fp__add-title">添加好友</h4>

        <div class="fp__id">
          <div class="fp__id-text">
            <span class="muted">我的好友码</span>
            <span class="num fp__code">{{ store.playerId }}</span>
          </div>
          <Button size="sm" :disabled="!clipboardSupported" @click="copyId">
            {{ copied ? '已复制' : '复制' }}
          </Button>
        </div>

        <VTextField
          v-model="addCode"
          class="soft-field"
          placeholder="输入好友码"
          maxlength="16"
          hide-details
          @keyup.enter="addFriend"
        />
        <Button size="sm" variant="primary" block @click="addFriend">添加好友</Button>

        <p v-if="store.lastError" class="alert alert--warn">{{ store.lastError }}</p>

        <div class="fp__nick">
          <VTextField
            v-model="nameDraft"
            class="soft-field"
            label="昵称"
            maxlength="16"
            hide-details
            @keyup.enter="commitName"
            @blur="commitName"
          />
          <Button size="sm" @click="commitName">保存</Button>
        </div>
      </aside>
    </div>
  </component>
</template>

<style scoped>
.fp__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: var(--s4);
  align-items: start;
}

.fp__col {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.fp__add {
  gap: var(--s2);
  padding: var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.fp__add-title {
  margin: 0 0 var(--s1);
  font-size: 14px;
  color: var(--text);
}

.fp__nick {
  display: flex;
  gap: var(--s2);
  align-items: center;
  margin-top: var(--s2);
  padding-top: var(--s3);
  border-top: 1px solid var(--line);
}

.fp__nick :deep(.v-input) {
  flex: 1 1 auto;
  min-width: 0;
}

@media (max-width: 640px) {
  .fp__grid {
    grid-template-columns: 1fr;
  }

  /* on phones the add box sits on top, the list below it */
  .fp__add {
    order: -1;
  }
}

.fp__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
}

.fp__id {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
}

.fp__id-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.fp__code {
  font-size: 20px;
  letter-spacing: 4px;
  color: var(--text);
}

.fp__list {
  list-style: none;
  margin: var(--s2) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.fp__friend {
  display: flex;
  align-items: center;
  gap: var(--s3);
  padding: var(--s2) var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.fp__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--line-strong);
  flex: none;
}

.fp__dot--on {
  background: var(--good);
}

.fp__name {
  color: var(--text);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fp__friend-id {
  flex: 1 1 auto;
  color: var(--text-dim);
  font-size: 12px;
  letter-spacing: 2px;
}

.fp__subtitle {
  margin: var(--s4) 0 var(--s1);
  font-size: 13px;
  color: var(--text-dim);
}

.fp__hint {
  margin-top: var(--s3);
  font-size: 12px;
}
</style>
