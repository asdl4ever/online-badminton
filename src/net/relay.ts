import { Capacitor } from '@capacitor/core';
import type { NetLink, NetMessage, NetRole, NetStatus } from './link';

/** 两条通道都不可用时的提示 */
export const NET_UNAVAILABLE = '当前环境不支持联机（需要 WebRTC 或配置中继服务器）';

/** App 里没配中继、只剩直连时的提醒 */
export const NET_P2P_ONLY =
  '当前版本未配置联机服务器，只能尝试直连（需要双方网络能连上信令服务器）';

/**
 * **中继通道**可不可用。
 *
 * - 网页版：中继挂在同源 `/relay`（由 server/index.mjs 提供）。
 * - 装成 App：页面在 `https://localhost`，推不出真服务器，用下面内置的生产地址。
 * 两边都可以被打包时的 `VITE_RELAY_URL` 覆盖。
 */
export function relayAvailable(): boolean {
  return true;
}

/**
 * **直连通道**可不可用。
 *
 * 直连是 WebRTC，信令走 PeerJS 的公共服务器、打洞靠 STUN（见 ice.ts），
 * **不依赖我们自己的 relay**，所以在 App 里同样能尝试。
 */
export function p2pAvailable(): boolean {
  return typeof RTCPeerConnection !== 'undefined';
}

/**
 * 这个构建**能不能联机**：两条通道任意一条可用就行。
 *
 * 注意 App 里即使没配中继也仍然返回 true——直连还能试，只是成功率取决于网络。
 */
export function netAvailable(): boolean {
  return p2pAvailable() || relayAvailable();
}

/**
 * App（Capacitor）里默认用的中继地址。
 *
 * 装成 App 后页面跑在 `https://localhost`，同源推不出真实服务器，所以这里写死部署好的
 * 生产地址（Railway）。要换服务器就用打包时的 `VITE_RELAY_URL` 覆盖。
 */
const NATIVE_RELAY_URL = 'wss://online-badminton-production.up.railway.app/relay';

/**
 * Relay endpoint. Defaults to `/relay` on the same origin as the page, which
 * is what the bundled server (server/index.mjs) provides. Set VITE_RELAY_URL
 * to point at a relay hosted somewhere else.
 */
function relayUrl(): string {
  const override = import.meta.env.VITE_RELAY_URL;
  if (override) return String(override);
  // App：用内置的生产地址（否则会去连 localhost 白等 12 秒）
  if (Capacitor.isNativePlatform()) return NATIVE_RELAY_URL;
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/relay`;
}

/**
 * Duplex link over the WebSocket relay attached to the app's own server.
 * Works through any NAT because both players dial out to the server.
 */
export class RelaySession implements NetLink {
  readonly role: NetRole;
  readonly roomCode: string;
  readonly kind = '中继';

  connected = false;
  onMessage: ((m: NetMessage) => void) | null = null;
  onConnected: (() => void) | null = null;
  onDisconnected: (() => void) | null = null;
  onError: ((message: string) => void) | null = null;
  onStatus: ((status: NetStatus) => void) | null = null;

  private ws: WebSocket;
  private status: NetStatus = {
    signaling: 'connecting',
    ice: 'relay',
    candidates: 'websocket',
    note: '',
  };
  private dead = false;

  private constructor(role: NetRole, code: string, ws: WebSocket) {
    this.role = role;
    this.roomCode = code;
    this.ws = ws;
  }

  private publish(note?: string): void {
    if (note !== undefined) this.status.note = note;
    this.onStatus?.({ ...this.status });
  }

  private static open(
    role: NetRole,
    code: string,
    mode: 'create' | 'join',
  ): Promise<RelaySession> {
    return new Promise((resolve, reject) => {
      let url: string;
      try {
        url = relayUrl();
      } catch {
        reject(new Error('无法推导中继地址'));
        return;
      }

      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch (err) {
        reject(new Error(`无法连接中继：${(err as Error).message}`));
        return;
      }

      const session = new RelaySession(role, code, ws);
      let settled = false;
      const timer = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        try {
          ws.close();
        } catch {
          /* ignore */
        }
        reject(new Error('中继服务器无响应'));
      }, 12000);

      ws.onopen = () => {
        session.status.signaling = 'open';
        session.publish('已连接中继服务器，正在等待对手…');
        try {
          ws.send(JSON.stringify({ t: mode, code }));
        } catch {
          /* ignore */
        }
      };

      ws.onmessage = (ev) => {
        let msg: { t?: string; m?: string };
        try {
          msg = JSON.parse(String(ev.data));
        } catch {
          return;
        }
        if (!msg || typeof msg.t !== 'string') return;

        if (msg.t === 'waiting') {
          if (!settled) {
            settled = true;
            window.clearTimeout(timer);
            session.publish('已进入中继房间，等待对手…');
            resolve(session);
          }
          return;
        }
        if (msg.t === 'ready') {
          session.connected = true;
          session.publish('');
          if (!settled) {
            settled = true;
            window.clearTimeout(timer);
            resolve(session);
          }
          session.onConnected?.();
          return;
        }
        if (msg.t === 'error') {
          const text = msg.m || '中继服务器拒绝连接';
          if (!settled) {
            settled = true;
            window.clearTimeout(timer);
            try {
              ws.close();
            } catch {
              /* ignore */
            }
            reject(new Error(text));
          } else {
            session.onError?.(text);
          }
          return;
        }
        if (msg.t === 'peer-left') {
          session.connected = false;
          session.publish('对手已离开');
          if (settled) session.onDisconnected?.();
          return;
        }
        session.onMessage?.(msg as NetMessage);
      };

      ws.onerror = () => {
        if (!settled) {
          settled = true;
          window.clearTimeout(timer);
          reject(new Error('无法连接中继服务器'));
        }
      };

      ws.onclose = () => {
        session.connected = false;
        if (!settled) {
          settled = true;
          window.clearTimeout(timer);
          reject(new Error(role === 'guest' ? '找不到该房间（中继）' : '中继连接已关闭'));
          return;
        }
        if (!session.dead) {
          session.publish('中继连接已断开');
          session.onDisconnected?.();
        }
      };
    });
  }

  static host(code: string): Promise<RelaySession> {
    return RelaySession.open('host', code, 'create');
  }

  static join(code: string): Promise<RelaySession> {
    return RelaySession.open('guest', code, 'join');
  }

  send(message: NetMessage): void {
    if (this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(JSON.stringify(message));
    } catch {
      /* raced shut */
    }
  }

  destroy(): void {
    this.dead = true;
    this.connected = false;
    try {
      this.ws.close();
    } catch {
      /* ignore */
    }
  }
}
