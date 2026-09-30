import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { LobbyClient, type LobbyConnState } from '../net/lobby';
import { randomRoomCode, normaliseCode } from '../net/link';

export interface Friend {
  id: string;
  name: string;
}
export interface FriendRequest {
  from: string;
  name: string;
}
export interface Invite {
  from: string;
  name: string;
  code: string;
}

function randomName(): string {
  return `玩家${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Anonymous identity + social graph, all stored locally. There is no account:
 * `playerId` *is* the friend code other people type in. Friends live in
 * localStorage, the server only relays presence and messages between the two
 * people while they are both online.
 */
export const useLobbyStore = defineStore('lobby', () => {
  const playerId = useLocalStorage('bmt-player-id', '');
  if (!playerId.value) playerId.value = randomRoomCode(6);
  const playerName = useLocalStorage('bmt-player-name', '');
  if (!playerName.value) playerName.value = randomName();

  const friends = useLocalStorage<Friend[]>('bmt-friends', []);
  /** ids of friends currently online */
  const online = ref<string[]>([]);
  const requests = ref<FriendRequest[]>([]);
  const invites = ref<Invite[]>([]);
  const status = ref<LobbyConnState>('off');
  const lastError = ref('');
  /** room code handed over by an accepted invite, consumed by OnlineView */
  const pendingJoin = ref('');

  let client: LobbyClient | null = null;

  function isOnline(id: string): boolean {
    return online.value.includes(id);
  }

  function syncWatch(): void {
    client?.setWatch(friends.value.map((f) => f.id));
  }

  function upsertFriend(f: Friend): void {
    if (f.id === playerId.value) return;
    const i = friends.value.findIndex((x) => x.id === f.id);
    if (i >= 0) friends.value[i] = f;
    else friends.value = [...friends.value, f];
    syncWatch();
  }

  function connect(): void {
    if (client) return;
    status.value = 'connecting';
    client = new LobbyClient({
      onOpen: () => {
        status.value = 'online';
      },
      onClose: () => {
        status.value = 'connecting';
        online.value = [];
      },
      onPresence: (id, isOn) => {
        const has = online.value.includes(id);
        if (isOn && !has) online.value = [...online.value, id];
        else if (!isOn && has) online.value = online.value.filter((x) => x !== id);
      },
      onPresenceBatch: (ids) => {
        online.value = [...new Set(ids)];
      },
      onFriendRequest: (from, name) => {
        if (!from || friends.value.some((f) => f.id === from)) return;
        if (requests.value.some((r) => r.from === from)) return;
        requests.value = [...requests.value, { from, name: name || from }];
      },
      onFriendAccepted: (from, name) => {
        if (!from) return;
        requests.value = requests.value.filter((r) => r.from !== from);
        upsertFriend({ id: from, name: name || from });
      },
      onFriendDeclined: (from) => {
        requests.value = requests.value.filter((r) => r.from !== from);
      },
      onUnfriended: (from) => {
        friends.value = friends.value.filter((f) => f.id !== from);
        online.value = online.value.filter((x) => x !== from);
      },
      onInvite: (from, name, code) => {
        if (!from || !code) return;
        if (invites.value.some((v) => v.from === from)) return;
        invites.value = [...invites.value, { from, name: name || from, code }];
      },
      onError: (_code, message) => {
        lastError.value = message;
      },
    });
    client.connect(playerId.value, playerName.value);
    syncWatch();
  }

  function rename(name: string): void {
    const trimmed = name.trim().slice(0, 16);
    if (!trimmed || trimmed === playerName.value) return;
    playerName.value = trimmed;
    client?.rename(trimmed);
  }

  function requestFriend(code: string): void {
    lastError.value = '';
    const id = normaliseCode(code);
    if (!id) {
      lastError.value = '请输入好友码';
      return;
    }
    if (id === playerId.value) {
      lastError.value = '不能添加自己';
      return;
    }
    if (friends.value.some((f) => f.id === id)) {
      lastError.value = '已经是好友了';
      return;
    }
    client?.addFriend(id);
  }

  function acceptRequest(req: FriendRequest): void {
    requests.value = requests.value.filter((r) => r.from !== req.from);
    upsertFriend({ id: req.from, name: req.name });
    client?.acceptFriend(req.from);
  }

  function declineRequest(req: FriendRequest): void {
    requests.value = requests.value.filter((r) => r.from !== req.from);
    client?.declineFriend(req.from);
  }

  function removeFriend(id: string): void {
    friends.value = friends.value.filter((f) => f.id !== id);
    online.value = online.value.filter((x) => x !== id);
    client?.unfriend(id);
  }

  function invite(friendId: string, code: string): void {
    lastError.value = '';
    if (!code) {
      lastError.value = '请先创建房间再邀请';
      return;
    }
    client?.invite(friendId, code);
  }

  function acceptInvite(inv: Invite): void {
    invites.value = invites.value.filter((v) => v.from !== inv.from);
    pendingJoin.value = inv.code;
  }

  function declineInvite(inv: Invite): void {
    invites.value = invites.value.filter((v) => v.from !== inv.from);
  }

  function takePendingJoin(): string {
    const code = pendingJoin.value;
    pendingJoin.value = '';
    return code;
  }

  return {
    playerId,
    playerName,
    friends,
    online,
    requests,
    invites,
    status,
    lastError,
    pendingJoin,
    isOnline,
    connect,
    rename,
    requestFriend,
    acceptRequest,
    declineRequest,
    removeFriend,
    invite,
    acceptInvite,
    declineInvite,
    takePendingJoin,
    syncWatch,
  };
});
