import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import {
  LobbyClient,
  type InviteKind,
  type LobbyConnState,
  type PeerState,
  type SceneId,
} from '../net/lobby';
import { randomRoomCode, normaliseCode } from '../net/link';
import { SCENE_KIND } from '../game/scenes';

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
  /** 邀请是哪个场景发出的：对局 / 大地图 / 钓鱼塘 / 矿洞 */
  kind: InviteKind;
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
  /**
   * Room code + kind handed over by an accepted invite. The page that the kind
   * belongs to picks it up (see `consumeInvite`), so an accepted map invite
   * cannot accidentally land in the matchmaker.
   */
  const pendingJoin = ref<{ code: string; kind: InviteKind } | null>(null);

  // ---- 在线好友「在玩什么」+ 一间房 ----------------------------------------

  /** id -> 好友正在哪个界面 / 他的房间号（由大厅的 state 推来） */
  const states = ref<Record<string, PeerState>>({});
  /**
   * 当前这一局的房间号：**全程只有一个**。房主开一次房，之后换玩法页、换海岛
   * 都复用它，好友也一直用同一个房号，不用每进一个玩法就重新建房。
   */
  const room = ref('');
  /** 我是房主还是访客（房间的归属） */
  const role = ref<'none' | 'host' | 'guest'>('none');
  /** 正在跟随的房主 id（访客才有；他换界面我就跟过去） */
  const following = ref('');
  /** 我现在报给大厅的界面 */
  let myScene: SceneId = 'off';

  let client: LobbyClient | null = null;

  function isOnline(id: string): boolean {
    return online.value.includes(id);
  }

  function syncWatch(): void {
    client?.setWatch(friends.value.map((f) => f.id));
  }

  /** 上报「我在哪个界面 / 我的房号」，好友列表和跟随都靠它 */
  function setScene(scene: SceneId, roomOverride?: string): void {
    myScene = scene;
    client?.setState(scene, roomOverride ?? room.value);
  }

  /** 房主开好房：记下来，之后所有玩法页共用这个房号 */
  function setRoom(code: string, who: 'host' | 'guest' = 'host'): void {
    room.value = code;
    role.value = who;
    client?.setState(myScene, code);
  }

  /** 退房 */
  function clearRoom(): void {
    room.value = '';
    role.value = 'none';
    following.value = '';
    client?.setState(myScene, '');
  }

  /** 某个好友现在能不能直接加入（有房号 + 在会开房的界面） */
  function joinable(state: PeerState | undefined): boolean {
    if (!state || !state.room) return false;
    const kind = SCENE_KIND[state.scene];
    return !!kind && state.room.length >= 4;
  }

  /** 点好友列表里的「申请加入」：记下要进的房，并记住跟着谁 */
  function requestJoin(id: string): { code: string; kind: InviteKind } | null {
    const st = states.value[id];
    if (!st) return null;
    const kind = SCENE_KIND[st.scene];
    if (!kind || st.room.length < 4) return null;
    pendingJoin.value = { code: st.room, kind };
    following.value = id;
    return { code: st.room, kind };
  }

  /** 好友列表要的数据：在线的朋友 + 各自在玩什么 */
  const onlineFriends = computed(() =>
    friends.value
      .filter((f) => online.value.includes(f.id))
      .map((f) => ({
        id: f.id,
        name: states.value[f.id]?.name || f.name,
        scene: states.value[f.id]?.scene ?? ('off' as SceneId),
        room: states.value[f.id]?.room ?? '',
      })),
  );

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
      onPresenceBatch: (ids, list) => {
        online.value = [...new Set(ids)];
        // 顺带把每个人「在玩什么」一起收下（服务端随 batch 一起发）
        const next = { ...states.value };
        for (const s of list) next[s.id] = s;
        states.value = next;
      },
      onState: (s) => {
        states.value = { ...states.value, [s.id]: s };
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
      onInvite: (from, name, code, kind) => {
        if (!from || !code) return;
        if (invites.value.some((v) => v.from === from)) return;
        invites.value = [...invites.value, { from, name: name || from, code, kind }];
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

  function invite(friendId: string, code: string, kind: InviteKind = 'match'): void {
    lastError.value = '';
    if (!code) {
      lastError.value = '请先创建房间再邀请';
      return;
    }
    client?.invite(friendId, code, kind);
  }

  function acceptInvite(inv: Invite): void {
    invites.value = invites.value.filter((v) => v.from !== inv.from);
    pendingJoin.value = { code: inv.code, kind: inv.kind };
    // 接受谁的邀请就跟着谁走（他换界面我也跟过去）
    room.value = inv.code;
    role.value = 'guest';
    following.value = inv.from;
  }

  function declineInvite(inv: Invite): void {
    invites.value = invites.value.filter((v) => v.from !== inv.from);
  }

  /**
   * A page asks for the invite that belongs to it ("I am the map, is there a
   * map invite waiting?"). Anything else is left alone for its own page.
   */
  function consumeInvite(kind: InviteKind): string {
    if (pendingJoin.value?.kind !== kind) return '';
    const code = pendingJoin.value.code;
    pendingJoin.value = null;
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
    // 在线好友「在玩什么」+ 一间房 / 跟随
    states,
    room,
    role,
    following,
    onlineFriends,
    setScene,
    setRoom,
    clearRoom,
    requestJoin,
    joinable,
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
    consumeInvite,
    syncWatch,
  };
});
