import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

/**
 * 大厅/大地图上的“谁在线、在玩什么”。
 *
 * 目前只有本地状态：单机时列表为空，联机时由联机页写入自己看到的玩家。
 * 跨客户端的实时同步（邀请进地图 / 申请加入要对方同意）需要一条大厅通道，
 * 这一步还没接——界面与状态机已经就位，接上网络只需要 populate() 与新消息类型。
 */
export interface PresencePlayer {
  id: string;
  name: string;
  /** 正在玩的模式名（空 = 站在地图上） */
  mode: string;
  icon: string;
  /** 隐私房不可加入 */
  joinable: boolean;
  /** 已发出申请，等对方同意 */
  pending: boolean;
  /** 已经在他的对局里 */
  joined: boolean;
  /** 已经和你站在同一张地图上（不需要申请加入 / 观战） */
  nearby?: boolean;
}

export const usePresenceStore = defineStore('presence', () => {
  const players = ref<PresencePlayer[]>([]);
  /** 正在观战谁的 id（null = 在玩自己的） */
  const watching = ref<string | null>(null);

  const hasPlayers = computed(() => players.value.length > 0);

  /** 联机页拿到对手信息后调用，把自己看到的玩家写进列表 */
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
