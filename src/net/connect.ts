import {
  NET_UNAVAILABLE,
  netAvailable,
  p2pAvailable,
  relayAvailable,
  RelaySession,
} from './relay';
import { createHostSession, joinSession } from './session';
import { normaliseCode, randomRoomCode, type NetLink, type NetStatus } from './link';

/** how long the guest gives WebRTC before falling back to the relay.
 *  Direct takes 3-5s to establish on a real network, so the retry window
 *  cannot be much shorter than this without killing it. */
const P2P_GRACE_MS = 6000;
const P2P_RETRY_MS = 4500;
const PREF_KEY = 'bmt-net-preference';

export type NetMode = 'auto' | 'p2p' | 'relay';

function storedPreference(): 'direct' | 'relay' | null {
  try {
    const v = window.localStorage.getItem(PREF_KEY);
    return v === 'direct' || v === 'relay' ? v : null;
  } catch {
    return null;
  }
}

function remember(kind: string): void {
  try {
    window.localStorage.setItem(PREF_KEY, kind === '中继' ? 'relay' : 'direct');
  } catch {
    /* private mode */
  }
}

export interface ConnectHooks {
  onStatus?: (status: NetStatus, transport: string) => void;
  onPhase?: (phase: string) => void;
  onDisconnected?: (reason: string) => void;
  onError?: (message: string) => void;
}

/**
 * `?net=relay` forces the WebSocket relay, `?net=p2p` forces WebRTC. Handy for
 * diagnosing which transport is actually in use.
 */
export function netMode(): NetMode {
  try {
    const v = new URLSearchParams(window.location.search).get('net');
    return v === 'relay' || v === 'p2p' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

export interface HostRoom {
  code: string;
  /** resolves with the link once an opponent actually shows up */
  connected: Promise<NetLink>;
}

export interface Match {
  link: NetLink;
  code: string;
}

function wire(link: NetLink, hooks: ConnectHooks): void {
  link.onStatus = (st) => hooks.onStatus?.(st, link.kind);
  link.onDisconnected = () => hooks.onDisconnected?.('对手已离开');
  link.onError = (m) => hooks.onError?.(m);
}

/**
 * Host: opens BOTH transports under the same room code and returns the code
 * immediately so the opponent can dial in. Whichever transport the guest
 * reaches first wins; the other is torn down.
 *
 * `wantCode` 用来复用**同一个房号**：一间房贯穿所有玩法（「房主去哪访客跟哪」
 * 就靠它），不传时才随机生成一个新号。
 */
export async function hostOpen(hooks: ConnectHooks = {}, wantCode = ''): Promise<HostRoom> {
  if (!netAvailable()) throw new Error(NET_UNAVAILABLE);
  const mode = netMode();
  const code = normaliseCode(wantCode) || randomRoomCode();
  const candidates: NetLink[] = [];

  // 两条通道各按自身可用性决定用不用（App 里没配中继 → 只剩直连，仍能尝试）
  const useP2P = mode !== 'relay' && p2pAvailable();
  const useRelay = mode !== 'p2p' && relayAvailable();
  if (!useP2P && !useRelay) throw new Error(NET_UNAVAILABLE);

  if (useP2P) {
    try {
      const s = await createHostSession(code);
      wire(s, hooks);
      candidates.push(s);
    } catch (err) {
      // 只剩这一条通道时，错误才有必要抛给玩家
      if (!useRelay) throw err;
      hooks.onPhase?.(`直连通道不可用：${(err as Error).message}`);
    }
  }

  if (useRelay) {
    try {
      const s = await RelaySession.host(code);
      wire(s, hooks);
      candidates.push(s);
    } catch (err) {
      if (!useP2P || candidates.length === 0) {
        throw new Error(`中继通道不可用：${(err as Error).message}`);
      }
    }
  }

  if (candidates.length === 0) {
    throw new Error('直连和中继都不可用');
  }

  hooks.onPhase?.('等待对手加入…');
  const connected = firstConnected(candidates).then((winner) => {
    for (const s of candidates) if (s !== winner) s.destroy();
    return winner;
  });
  return { code, connected };
}

/**
 * Guest: try the transport that worked last time first, otherwise let WebRTC
 * have a fair shot (direct is far lower latency) and silently fall back to the
 * relay.
 */
/**
 * Guest: always try direct first — it is worth an order of magnitude in
 * latency — but shrink the wait when direct lost last time, so a relay-only
 * player is not stalled 6s on every match.
 */
export async function joinMatch(code: string, hooks: ConnectHooks = {}): Promise<Match> {
  if (!netAvailable()) throw new Error(NET_UNAVAILABLE);
  const mode = netMode();
  const useP2P = mode !== 'relay' && p2pAvailable();
  const useRelay = mode !== 'p2p' && relayAvailable();
  if (!useP2P && !useRelay) throw new Error(NET_UNAVAILABLE);

  if (useP2P) {
    const grace = storedPreference() === 'relay' ? P2P_RETRY_MS : P2P_GRACE_MS;
    hooks.onPhase?.('尝试直连…');
    try {
      const link = await joinSession(code, grace);
      link.connected = true;
      wire(link, hooks);
      remember(link.kind);
      hooks.onPhase?.('');
      return { link, code };
    } catch (err) {
      if (!useRelay) throw err;
      hooks.onPhase?.(`直连打不通（${(err as Error).message}），改用中继…`);
    }
  }

  if (!useRelay) {
    throw new Error('直连打不通，且当前版本未配置中继服务器');
  }

  const link = await RelaySession.join(code);
  link.connected = true;
  wire(link, hooks);
  remember(link.kind);
  hooks.onPhase?.('');
  return { link, code };
}

function firstConnected(links: NetLink[]): Promise<NetLink> {
  return new Promise((resolve) => {
    let done = false;
    for (const link of links) {
      if (link.connected) {
        if (!done) {
          done = true;
          resolve(link);
        }
        return;
      }
      const prev = link.onConnected;
      link.onConnected = () => {
        prev?.();
        if (done) return;
        done = true;
        resolve(link);
      };
    }
  });
}
