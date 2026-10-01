import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

/**
 * 左侧「在线玩家」列表。
 *
 * 数据来源是大厅（`stores/lobby.ts`）：好友谁在线、在哪个界面、房间号是多少，
 * 全由服务端推送的 state 汇总而来（见 `App.vue` 里的 watchEffect），
 * 所以「好友在玩什么」在每一个页面上都是实时的。
 */
export interface PresencePlayer {
  id: string;
  name: string;
  /** 正在玩的模式名（空 = 站在地图上） */
  mode: string;
  icon: string;
  /** 有房号、且那个界面能联机一起玩 → 可以直接加入 */
  joinable: boolean;
  /** 已发出申请，等对方同意 */
  pending: boolean;
  /** 已经在他的对局里 */
  joined: boolean;
  /** 已经和你站在同一张地图上（不需要申请加入 / 观战） */
  nearby?: boolean;
  /** 他的房间号（能加入时用它直接进房） */
  room?: string;
  /** 他在哪个界面（决定「加入」要跳到哪一页） */
  scene?: import('../net/lobby').SceneId;
}

export const usePresenceStore = defineStore('presence', () => {
  const players = ref<PresencePlayer[]>([]);
  /** 正在观战谁的 id（null = 在玩自己的） */
  const watching = ref<string | null>(null);

  const hasPlayers = computed(() => players.value.length > 0);

  /** 由大厅数据汇总出列表（App.vue 里 watchEffect 调它），保留本地申请/已加入状态 */
  function populate(list: Omit<PresencePlayer, 'pending' | 'joined'>[]): void {
    players.value = list.map((p) => {
      const prev = players.value.find((x) => x.id === p.id);
      return { ...p, pending: prev?.pending ?? false, joined: prev?.joined ?? false };
    });
    if (watching.value && !players.value.some((p) => p.id === watching.value)) watching.value = null;
  }

  /** 申请加入：先置为等待同意，真正的“对方点头”由大厅通道回来时再翻 */
  function requestJoin(id: string): void {
    const p = players.value.find((x) => x.id === id);
    if (!p || !p.joinable || p.pending || p.joined) return;
    p.pending = true;
  }

  /** 对方同意了（本地演示或网络回调都能调它） */
  function acceptJoin(id: string): void {
    const p = players.value.find((x) => x.id === id);
    if (!p) return;
    p.pending = false;
    p.joined = true;
  }

  function denyJoin(id: string): void {
    const p = players.value.find((x) => x.id === id);
    if (p) p.pending = false;
  }

  function setWatching(id: string | null): void {
    watching.value = id;
  }

  function clear(): void {
    players.value = [];
    watching.value = null;
  }

  return {
    players,
    watching,
    hasPlayers,
    populate,
    requestJoin,
    acceptJoin,
    denyJoin,
    setWatching,
    clear,
  };
});
