/**
 * Presence / friend / invite channel.
 *
 * A long-lived WebSocket to `/lobby` (the bundled server's hub). It is
 * independent of the match link: even while sitting on the home screen the
 * client stays registered so friends can see it and send invites. Anonymous —
 * the only identity is the locally generated friend code.
 */

export type LobbyConnState = 'off' | 'connecting' | 'online';

export interface LobbyHooks {
  onOpen?: () => void;
  onClose?: () => void;
  onPresence?: (id: string, online: boolean) => void;
  onPresenceBatch?: (onlineIds: string[]) => void;
  onFriendRequest?: (from: string, name: string) => void;
  onFriendAccepted?: (from: string, name: string) => void;
  onFriendDeclined?: (from: string) => void;
  onUnfriended?: (from: string) => void;
  onInvite?: (from: string, name: string, code: string) => void;
  onError?: (code: string, message: string) => void;
}

/** Defaults to `/lobby` on the app's own origin; override with VITE_LOBBY_URL. */
function lobbyUrl(): string {
  const override = import.meta.env.VITE_LOBBY_URL;
  if (override) return String(override);
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/lobby`;
}

const MAX_RETRY_MS = 15000;

export class LobbyClient {
  private ws: WebSocket | null = null;
  private id = '';
  private name = '';
  private active = false;
  private retry = 0;
  private timer: number | null = null;
  private watching: string[] = [];
  private readonly hooks: LobbyHooks;

  constructor(hooks: LobbyHooks) {
    this.hooks = hooks;
  }

  /** Idempotent: safe to call again to (re)register with a fresh name. */
  connect(id: string, name: string): void {
    this.id = id;
    this.name = name;
    if (this.active) {
      this.sayHello();
      return;
    }
    this.active = true;
    this.open();
  }

  disconnect(): void {
    this.active = false;
    if (this.timer != null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    try {
      this.ws?.close();
    } catch {
      /* ignore */
    }
    this.ws = null;
  }

  rename(name: string): void {
    this.name = name;
    this.sayHello();
  }

  setWatch(ids: string[]): void {
    this.watching = [...new Set(ids)];
    this.send({ t: 'watch', ids: this.watching });
  }

  addFriend(target: string): void {
    this.send({ t: 'add', target });
  }
  acceptFriend(target: string): void {
    this.send({ t: 'accept', target });
  }
  declineFriend(target: string): void {
    this.send({ t: 'decline', target });
  }
  unfriend(target: string): void {
    this.send({ t: 'unfriend', target });
  }
  invite(target: string, code: string): void {
    this.send({ t: 'invite', target, code });
  }

  private open(): void {
    let url: string;
    try {
      url = lobbyUrl();
    } catch {
      this.scheduleRetry();
      return;
    }

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      this.scheduleRetry();
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      this.retry = 0;
      this.sayHello();
      if (this.watching.length) this.send({ t: 'watch', ids: this.watching });
      this.hooks.onOpen?.();
    };
    ws.onmessage = (ev) => this.receive(ev);
    ws.onerror = () => {
      /* onclose always follows, retry is handled there */
    };
    ws.onclose = () => {
      this.ws = null;
      this.hooks.onClose?.();
      this.scheduleRetry();
    };
  }

  private scheduleRetry(): void {
    if (!this.active || this.timer != null) return;
    const delay = Math.min(MAX_RETRY_MS, 1000 * 2 ** Math.min(this.retry, 4));
    this.retry++;
    this.timer = window.setTimeout(() => {
      this.timer = null;
      if (this.active) this.open();
    }, delay);
  }

  private sayHello(): void {
    this.send({ t: 'hello', id: this.id, name: this.name });
  }

  private send(msg: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(msg));
      } catch {
        /* raced shut */
      }
    }
  }

  private receive(ev: MessageEvent): void {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(String(ev.data));
    } catch {
      return;
    }
    if (!msg || typeof msg.t !== 'string') return;
    const str = (v: unknown) => (typeof v === 'string' ? v : '');
    switch (msg.t) {
      case 'presence':
        this.hooks.onPresence?.(str(msg.id), !!msg.online);
        break;
      case 'presence-batch':
        this.hooks.onPresenceBatch?.(Array.isArray(msg.online) ? (msg.online as string[]) : []);
        break;
      case 'friend-request':
        this.hooks.onFriendRequest?.(str(msg.from), str(msg.name));
        break;
      case 'friend-accepted':
        this.hooks.onFriendAccepted?.(str(msg.from), str(msg.name));
        break;
      case 'friend-declined':
        this.hooks.onFriendDeclined?.(str(msg.from));
        break;
      case 'unfriended':
        this.hooks.onUnfriended?.(str(msg.from));
        break;
      case 'invite':
        this.hooks.onInvite?.(str(msg.from), str(msg.name), str(msg.code));
        break;
      case 'error':
        this.hooks.onError?.(str(msg.code), str(msg.m));
        break;
      default:
        break;
    }
  }
}
