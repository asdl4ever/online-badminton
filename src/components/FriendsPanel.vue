<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useClipboard } from '@vueuse/core';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import { VTextField } from 'vuetify/components';
import Panel from './ui/Panel.vue';
import Button from './ui/Button.vue';
import StatusChip from './ui/StatusChip.vue';
import CharacterPreview from './CharacterPreview.vue';
import { DEFAULT_COSMETIC } from '../game/cosmetics';
import { joinInfo, sceneMeta } from '../game/scenes';
import { toastBad, toastGood } from '../composables/useToast';
import { useLobbyStore } from '../stores/lobby';
import type { InviteKind } from '../net/lobby';

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
    /** which screen the invite should open on (match / map / fish / mine) */
    kind?: InviteKind;
    /**
     * 没有房间时点「邀请」：页面提供的自动建房流程，返回房间号。
     * 有了它就不用先手动建房——点邀请即自动开房再发邀请。
     */
    ensureRoom?: () => Promise<string>;
  }>(),
  { bare: false, variant: 'manage', kind: 'match' },
);

const store = useLobbyStore();
const router = useRouter();
const { copy, copied, isSupported: clipboardSupported } = useClipboard();

/**
 * 好友列表的一行：名字 + 现在的状态（在哪个模式 / 离线）+ 能不能直接加入。
 * 状态与能否加入全部来自大厅同步（`store.states`），本地不猜。
 */
const rows = computed(() =>
  store.friends.map((f) => {
    const online = store.isOnline(f.id);
    const st = store.states[f.id];
    const scene = st?.scene ?? 'off';
    const meta = sceneMeta(scene);
    return {
      friend: f,
      online,
      icon: online ? meta.icon : '💤',
      status: online ? meta.label : '离线',
      join: joinInfo(scene, st?.room ?? '', online, st?.allowJoin ?? true),
      route: meta.route,
    };
  }),
);

const addCode = ref('');
/** 「新增好友」添加区默认收起，点右上角按钮展开 */
const addOpen = ref(false);
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
  toastGood('好友码已复制');
}

function addFriend() {
  store.requestFriend(addCode.value);
  if (store.lastError) {
    toastBad(store.lastError);
    return;
  }
  addCode.value = '';
  toastGood('好友请求已发送');
}

function commitName() {
  store.rename(nameDraft.value);
  nameDraft.value = store.playerName;
  toastGood('昵称已保存');
}

/** 邀请中（自动建房需要一两秒），防止连点 */
const inviting = ref(false);

async function invite(id: string) {
  if (inviting.value) return;
  let code = props.roomCode;
  if (!code) {
    if (!props.ensureRoom) return;
    inviting.value = true;
    try {
      code = await props.ensureRoom();
    } catch (e) {
      toastBad(e instanceof Error ? e.message : '建房失败，稍后再试');
      return;
    } finally {
      inviting.value = false;
    }
  }
  if (!code) {
    toastBad('建房失败，稍后再试');
    return;
  }
  store.invite(id, code, props.kind);
  toastGood('邀请已发送');
}

/**
 * 一键加入：记下他的房号（`pendingJoin`），再跳到他所在的页面——
 * 目标页面自己 `consumeInvite` 入房，所以不用输房号、也不用等对方同意。
 */
function join(id: string, route: string): void {
  const r = store.requestJoin(id);
  if (!r) {
    toastBad('现在无法加入');
    return;
  }
  toastGood('正在加入…');
  if (route) void router.push(route);
}

/**
 * 点好友整行 = 直接邀请（和「邀请」按钮等价）：没房间就自动建房再发邀请，
 * 所以不用先手动创建房间。
 */
function inviteRow(id: string, online: boolean): void {
  if (!online || !(props.canInvite || props.ensureRoom)) return;
  void invite(id);
}
</script>

<template>
  <component :is="bare ? 'div' : Panel">
    <div class="fp__col">
      <div class="fp__head">
        <h3 v-if="!bare">{{ variant === 'invite' ? '邀请好友' : '好友' }}</h3>
        <span v-else />
        <div class="fp__head-actions">
          <StatusChip :tone="store.status === 'online' ? 'ok' : 'warn'">
            {{ statusLabel() }}
          </StatusChip>
          <Button
            v-if="variant === 'manage'"
            size="sm"
            variant="primary"
            @click="addOpen = !addOpen"
          >
            {{ addOpen ? '收起' : '＋ 新增好友' }}
          </Button>
        </div>
      </div>

      <!-- 添加区默认收起：我的好友码 + 输码发送请求（对方接受后互为好友） -->
      <div v-if="variant === 'manage' && addOpen" class="fp__add">
        <div class="fp__id">
          <div class="fp__id-text">
            <span class="muted">我的好友码</span>
            <span class="num fp__code">{{ store.playerId }}</span>
          </div>
          <Button size="sm" :disabled="!clipboardSupported" @click="copyId">
            {{ copied ? '已复制' : '复制' }}
          </Button>
        </div>

        <div class="fp__add-row">
          <VTextField
            v-model="addCode"
            class="soft-field"
            placeholder="输入好友码"
            maxlength="16"
            hide-details
            @keyup.enter="addFriend"
          />
          <Button size="sm" variant="primary" @click="addFriend">发送请求</Button>
        </div>
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
      </div>

      <!-- 好友列表：状态（在哪个模式 / 离线）+ 一键「加入」（不能加入时置灰并写出原因）+「邀请」 -->
      <ul v-auto-animate="{ duration: 220 }" class="fp__list">
        <li
          v-for="r in rows"
          :key="r.friend.id"
          class="fp__friend"
          :class="{ 'is-invitable': (canInvite || ensureRoom) && r.online }"
          :title="(canInvite || ensureRoom) && r.online ? `点一下直接邀请 ${r.friend.name}` : ''"
          @click="inviteRow(r.friend.id, r.online)"
        >
          <span class="fp__avatar">
            <CharacterPreview :cosmetic="r.friend.cosmetic ?? DEFAULT_COSMETIC" />
            <span class="fp__dot fp__dot--badge" :class="{ 'fp__dot--on': r.online }" aria-hidden="true" />
          </span>
          <span class="fp__body">
            <span class="fp__name" :title="r.friend.name">{{ r.friend.name }}</span>
            <span class="fp__state">
              <span class="num fp__friend-id">{{ r.friend.id }}</span>
              <span class="fp__scene">{{ r.icon }} {{ r.status }}</span>
              <span v-if="r.online && !r.join.can" class="fp__why">· {{ r.join.reason }}</span>
            </span>
          </span>
          <Button
            size="sm"
            variant="primary"
            :disabled="!r.join.can"
            :title="r.join.can ? `加入 ${r.friend.name} 的房间` : r.join.reason"
            @click.stop="join(r.friend.id, r.route)"
          >
            加入
          </Button>
          <Button
            v-if="canInvite || ensureRoom"
            size="sm"
            :disabled="!r.online || inviting"
            :title="r.online ? '发邀请给他（还没建房就自动建）' : '离线'"
            @click.stop="invite(r.friend.id)"
          >
            {{ inviting ? '建房中…' : '邀请' }}
          </Button>
          <Button
            v-if="variant === 'manage'"
            size="sm"
            variant="quiet"
            @click.stop="store.removeFriend(r.friend.id)"
          >
            删
          </Button>
        </li>
        <li v-if="!rows.length" class="muted">
          {{ variant === 'manage'
            ? '还没有好友，点右上角「＋ 新增好友」，把你的好友码发给对方吧'
            : '还没有好友，去主页的「好友」里添加吧' }}
        </li>
      </ul>

      <template v-if="variant === 'manage' && store.requests.length">
        <p class="fp__subtitle">好友请求</p>
        <ul v-auto-animate="{ duration: 220 }" class="fp__list">
          <li v-for="r in store.requests" :key="r.from" class="fp__friend">
            <span class="fp__avatar">
              <CharacterPreview :cosmetic="DEFAULT_COSMETIC" />
            </span>
            <span class="fp__body">
              <span class="fp__name">{{ r.name }}</span>
              <span class="num fp__friend-id">{{ r.from }}</span>
            </span>
            <Button size="sm" variant="primary" @click="store.acceptRequest(r)">接受</Button>
            <Button size="sm" variant="quiet" @click="store.declineRequest(r)">忽略</Button>
          </li>
        </ul>
      </template>

      <p class="muted fp__hint">
        好友之间用好友码互加即可，<b>不用先建房</b>：对方在线时点「加入」直接进他所在的模式
        （大世界 / 对局 / 海湾 / 矿洞），点「邀请」则请他过来你这边（还没建房会自动建）。
        状态由服务端同步，灰掉的按钮上写着为什么不能加入。
      </p>
    </div>
  </component>
</template>

<style scoped>
.fp__col {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.fp__add {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  margin-top: var(--s2);
  padding: var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.fp__add-row {
  display: flex;
  gap: var(--s2);
  align-items: center;
}

.fp__add-row :deep(.v-input) {
  flex: 1 1 auto;
  min-width: 0;
}

.fp__nick {
  display: flex;
  gap: var(--s2);
  align-items: center;
  padding-top: var(--s2);
  border-top: 1px solid var(--line);
}

.fp__nick :deep(.v-input) {
  flex: 1 1 auto;
  min-width: 0;
}

.fp__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
}

.fp__head-actions {
  display: flex;
  align-items: center;
  gap: var(--s2);
  flex-wrap: wrap;
  justify-content: flex-end;
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

/* 在线好友：点整行 = 直接邀请他到当前场景 */
.fp__friend.is-invitable {
  cursor: pointer;
}

.fp__friend.is-invitable:hover {
  border-color: color-mix(in srgb, var(--accent) 55%, var(--line));
  background: color-mix(in srgb, var(--accent) 8%, var(--surface-2));
}

/* 角色小头像：游戏同一份绘制；在线状态点压在右上角 */
.fp__avatar {
  position: relative;
  flex: none;
  width: 46px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--line);
}

.fp__avatar :deep(.pc) {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.fp__avatar :deep(.pc__badge) {
  display: none;
}

.fp__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1 1 auto;
  min-width: 0;
}

.fp__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--line-strong);
  flex: none;
}

.fp__dot--badge {
  position: absolute;
  top: 3px;
  right: 3px;
  z-index: 1;
  box-shadow: 0 0 0 2px var(--surface-2);
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
  color: var(--text-dim);
  font-size: 12px;
  letter-spacing: 2px;
}

/* 第二行：好友码 + 他在哪个模式 + 不能加入时的原因 */
.fp__state {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.fp__scene {
  font-size: 12px;
  color: var(--text);
}

.fp__why {
  font-size: 12px;
  color: var(--warn, #c98a2b);
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
