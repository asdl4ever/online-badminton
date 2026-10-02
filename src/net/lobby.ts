/**
 * Presence / friend / invite channel.
 *
 * A long-lived WebSocket to `/lobby` (the bundled server's hub). It is
 * independent of the match link: even while sitting on the home screen the
 * client stays registered so friends can see it and send invites. Anonymous —
 * the only identity is the locally generated friend code.
 */

export type LobbyConnState = 'off' | 'connecting' | 'online';

/**
 * Which screen an invite belongs to. The host invites from the room he is
 * sitting in; the guest is routed to the matching page on accept.
 */
export type InviteKind = 'match' | 'map' | 'fish' | 'mine';

export const INVITE_KINDS: readonly InviteKind[] = ['match', 'map', 'fish', 'mine'];

export function normaliseInviteKind(raw: unknown): InviteKind {
  return typeof raw === 'string' && (INVITE_KINDS as readonly string[]).includes(raw)
    ? (raw as InviteKind)
    : 'match';
}

/** 一个人正在哪个界面（大厅/对局/潜水/矿洞/攀岩/孵化屋/大地图/主界面） */
export type SceneId =
  | 'off'
  | 'home'
  | 'map'
  | 'match'
  | 'fish'
  | 'mine'
  | 'climb'
  | 'petshop'
  | 'hall'
  | 'farm'
  | 'nailong'
  | 'godzilla';

export const SCENE_IDS: readonly SceneId[] = [
  'off',
  'home',
  'map',
  'match',
  'fish',
  'mine',
  'climb',
  'petshop',
  'hall',
  'farm',
  'nailong',
  'godzilla',
];

export function normaliseScene(raw: unknown): SceneId {
  return typeof raw === 'string' && (SCENE_IDS as readonly string[]).includes(raw)
    ? (raw as SceneId)
    : 'off';
}

/** 「在玩什么」：好友列表与跟随都靠这一条 */
export interface PeerState {
  id: string;
  name: string;
  scene: SceneId;
  /** 他开的房间号（有房间才能直接加入） */
  room: string;
  /** 他是否允许好友直接加入（关掉后别人点「加入」只会被拦下） */
  allowJoin: boolean;
}

export interface LobbyHooks {
  onOpen?: () => void;
  onClose?: () => void;
  onPresence?: (id: string, online: boolean) => void;
  onPresenceBatch?: (onlineIds: string[], states: PeerState[]) => void;
  /** 好友（或同房间的人）换了界面 / 开了房间 */
  onState?: (state: PeerState) => void;
  onFriendRequest?: (from: string, name: string) => void;
  onFriendAccepted?: (from: string, name: string) => void;
  onFriendDeclined?: (from: string) => void;
  onUnfriended?: (from: string) => void;
  onInvite?: (from: string, name: string, code: string, kind: InviteKind) => void;
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

/** 把服务端的一条 state / presence-batch 元素转成 PeerState */
function toPeerState(raw: unknown): PeerState | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === 'string' ? o.id : '';
  if (!id) return null;
  return {
    id,
    name: typeof o.name === 'string' ? o.name : id,
    scene: normaliseScene(o.scene),
    room: typeof o.room === 'string' ? o.room : '',
    // 老服务端不发这个字段：默认允许加入
    allowJoin: o.join !== false,
  };
}

export class LobbyClient {
  private ws: WebSocket | null = null;
  private id = '';
  private name = '';
  private active = false;
  private retry = 0;
  private timer: number | null = null;
  private watching: string[] = [];
  /** 上一次上报的界面 / 房间 / 是否允许加入，避免重复发 */
  private scene: SceneId = 'off';
  private room = '';
  private allowJoin = true;
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
  invite(target: string, code: string, kind: InviteKind = 'match'): void {
    this.send({ t: 'invite', target, code, kind });
  }

  /**
   * 上报「我在哪个界面 / 我的房间号」。好友列表靠它显示「在对局中 / 在潜水」，
   * 跟着房主走也靠它（房主换界面，访客收到 state 后跟过去）。
   */
  setState(scene: SceneId, room = ''): void {
    if (this.scene === scene && this.room === room) return;
    this.scene = scene;
    this.room = room;
    this.sendState();
  }

  /** 「允许好友加入」开关：换个值就重新上报一次，好友那边立刻看到 */
  setAllowJoin(allowJoin: boolean): void {
    if (this.allowJoin === allowJoin) return;
    this.allowJoin = allowJoin;
    this.sendState();
  }

  private sendState(): void {
    this.send({ t: 'state', scene: this.scene, room: this.room, join: this.allowJoin });
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
      // 重连后把「我在玩什么」再报一次（服务端是内存态）
      this.sendState();
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
      case 'presence-batch': {
        const online = Array.isArray(msg.online) ? (msg.online as string[]) : [];
        const states = Array.isArray(msg.states) ? msg.states.map(toPeerState) : [];
        this.hooks.onPresenceBatch?.(online, states.filter((s): s is PeerState => !!s));
        break;
      }
      case 'state': {
        const s = toPeerState(msg);
        if (s) this.hooks.onState?.(s);
        break;
      }
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
        this.hooks.onInvite?.(str(msg.from), str(msg.name), str(msg.code), normaliseInviteKind(msg.kind));
        break;
      case 'error':
        this.hooks.onError?.(str(msg.code), str(msg.m));
        break;
      default:
        break;
    }
  }
}
