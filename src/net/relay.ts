import type { NetLink, NetMessage, NetRole, NetStatus } from './link';

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
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        url = `${proto}//${window.location.host}/relay`;
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
