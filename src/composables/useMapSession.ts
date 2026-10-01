import { ref, type Ref } from 'vue';
import { hostOpen, joinMatch } from '../net/connect';
import { normaliseCode, type NetLink } from '../net/link';
import { DEFAULT_COSMETIC, sanitizeCosmetic, type Cosmetic } from '../game/cosmetics';
import { sfx } from '../game/audio';
import { useLobbyStore } from '../stores/lobby';
import { useCustomizeStore } from '../stores/customize';
import { toastGood, toastWarn } from './useToast';

/**
 * 大地图上的联机：房主建房、好友（接受邀请或输房号）进来，两个人就站在同一张
 * 地图上互相看得见。
 *
 * 和钓鱼 / 采矿一样是「各玩各的」：不做权威模拟，只同步「我是谁（名字 + 装扮）」
 * 和 12Hz 的位姿，所以谁也不会把谁推开，也不需要担心延迟补偿。
 *
 * 房间是 1v1 的（PeerJS / 中继都是两方通道），所以这里只维护一个 peer。
 */

/** how often the map pose goes out — a person walks, it does not need 60Hz */
const POSE_HZ = 12;
/** peer position smoothing: fraction per second towards the latest pose */
const PEER_SMOOTH = 14;

export interface MapPeerView {
  name: string;
  cosmetic: Cosmetic;
  /** 插值后的坐标（地图坐标系） */
  x: number;
  y: number;
  facing: 1 | -1;
}

export type MapConnState = 'off' | 'connecting' | 'online';

export interface MapSession {
  /** 自己开的房间号（当客人时为空） */
  code: Ref<string>;
  phase: Ref<string>;
  waiting: Ref<boolean>;
  connState: Ref<MapConnState>;
  /** 地图上的另一个人（没有就是自己一个人逛） */
  peer: Ref<MapPeerView | null>;
  /** 自己是谁（名字 + 当前装扮），连上时发给对方 */
  host(): void;
  join(rawCode: string): Promise<boolean>;
  leave(): void;
  /** 每帧调用：发自己的位姿 + 把对方的位置插值到最新 */
  tick(dt: number, own: { x: number; y: number; facing: 1 | -1 }): void;
  /**
   * 客机第一次收到房主的位置时回调（用来让客人站到房主旁边）。
   * 返回 true 表示已经用过了。
   */
  onFirstPeer: ((x: number, y: number) => void) | null;
}

export function useMapSession(): MapSession {
  const lobby = useLobbyStore();
  const customize = useCustomizeStore();

  const code = ref('');
  const phase = ref('');
  const waiting = ref(false);
  const connState = ref<MapConnState>('off');
  const peer = ref<MapPeerView | null>(null);

  let link: NetLink | null = null;
  let poseClock = 0;
  /** 对方最新报来的位置（插值的目标） */
  let peerTo = { x: 0, y: 0, facing: 1 as 1 | -1 };
  let placed = false;
  const session: MapSession = {
    code,
    phase,
    waiting,
    connState,
    peer,
    host,
    join,
    leave,
    tick,
    onFirstPeer: null,
  };

  function describeSelf(): { name: string; cosmetic: Cosmetic } {
    return {
      name: lobby.playerName || '好友',
      cosmetic: sanitizeCosmetic(customize.cosmetic),
    };
  }

  /** the peer has to know who we are before it can draw us; repeat in case the
      first hello races the other side installing its message handler */
  function announce(): void {
    const me = describeSelf();
    const send = () => link?.send({ t: 'hello', name: me.name, cosmetic: me.cosmetic });
    send();
    for (const ms of [300, 900]) window.setTimeout(send, ms);
  }

  /** drop a link without letting its own close handler touch the UI */
  function teardown(dead: NetLink | null): void {
    if (!dead) return;
    dead.onMessage = null;
    dead.onConnected = null;
    dead.onDisconnected = null;
    dead.onError = null;
    dead.onStatus = null;
    dead.destroy();
  }

  function bind(next: NetLink): void {
    teardown(link);
    link = next;
    next.onMessage = (m) => {
      if (m.t === 'hello') {
        const name = typeof m.name === 'string' && m.name.trim() ? m.name.trim().slice(0, 16) : '好友';
        const known = peer.value;
        peer.value = {
          name,
          cosmetic: sanitizeCosmetic(m.cosmetic),
          x: known?.x ?? peerTo.x,
          y: known?.y ?? peerTo.y,
          facing: known?.facing ?? 1,
        };
        if (!known) toastGood(`${name} 来到了营地`);
      } else if (m.t === 'mapPose') {
        peerTo = {
          x: Number(m.x) || 0,
          y: Number(m.y) || 0,
          facing: m.f === -1 ? -1 : 1,
        };
        if (!peer.value) {
          // hello may have been dropped: show them anyway, then wait for the cosmetic
          peer.value = {
            name: '好友',
            cosmetic: { ...DEFAULT_COSMETIC },
            x: peerTo.x,
            y: peerTo.y,
            facing: peerTo.facing,
          };
        }
        if (!placed) {
          placed = true;
          session.onFirstPeer?.(peerTo.x, peerTo.y);
        }
      } else if (m.t === 'leave') {
        if (peer.value) toastWarn(`${peer.value.name} 离开了营地`);
        peer.value = null;
      }
    };
    next.onDisconnected = () => {
      connState.value = 'off';
      waiting.value = false;
      phase.value = '对方已离开';
      if (peer.value) toastWarn(`${peer.value.name} 离开了营地`);
      peer.value = null;
    };
    next.onError = (message) => toastWarn(message);
    announce();
    connState.value = 'online';
  }

  function host(): void {
    if (waiting.value) return;
    sfx.click();
    waiting.value = true;
    phase.value = '正在建房…';
    placed = true; // 房主不需要被"挪到对方旁边"
    hostOpen({
      onPhase: (p) => (phase.value = p),
      onDisconnected: () => {
        phase.value = '对方已离开';
      },
    })
      .then(async (room) => {
        code.value = room.code;
        phase.value = `房间 ${room.code} · 等好友进来…`;
        const connected = await room.connected;
        phase.value = '好友已到营地！';
        waiting.value = false;
        bind(connected);
      })
      .catch((e: Error) => {
        toastWarn(e.message);
        waiting.value = false;
        phase.value = '';
      });
  }

  async function join(rawCode: string): Promise<boolean> {
    const clean = normaliseCode(rawCode);
    if (clean.length < 4) {
      toastWarn('请输入 4~6 位房号');
      return false;
    }
    if (waiting.value) return false;
    sfx.click();
    waiting.value = true;
    phase.value = '正在加入…';
    code.value = '';
    placed = false;
    try {
      const match = await joinMatch(clean, { onPhase: (p) => (phase.value = p) });
      phase.value = '已到营地！';
      waiting.value = false;
      bind(match.link);
      return true;
    } catch (e) {
      toastWarn((e as Error).message);
      waiting.value = false;
      phase.value = '';
      return false;
    }
  }

  function leave(): void {
    link?.send({ t: 'leave' });
    teardown(link);
    link = null;
    peer.value = null;
    code.value = '';
    phase.value = '';
    waiting.value = false;
    connState.value = 'off';
  }

  function tick(dt: number, own: { x: number; y: number; facing: 1 | -1 }): void {
    if (link && link.connected) {
      poseClock += dt;
      if (poseClock >= 1 / POSE_HZ) {
        poseClock = 0;
        link.send({ t: 'mapPose', x: Math.round(own.x), y: Math.round(own.y), f: own.facing });
      }
    }
    const p = peer.value;
    if (!p) return;
    const k = 1 - Math.exp(-dt * PEER_SMOOTH);
    p.x += (peerTo.x - p.x) * k;
    p.y += (peerTo.y - p.y) * k;
    p.facing = peerTo.facing;
  }

  return session;
}
