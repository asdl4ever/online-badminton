import Peer, { type DataConnection } from 'peerjs';
import { rtcConfiguration } from './ice';
import { normaliseCode, type NetLink, type NetMessage, type NetRole, type NetStatus } from './link';

export type { NetLink, NetMessage, NetRole, NetStatus } from './link';

const ID_PREFIX = 'bmt-';
const SIGNAL_TIMEOUT = 12000;
const PEER_TIMEOUT = 20000;

/**
 * WebRTC (PeerJS) link. Preferred when a direct path exists because it skips
 * the server round trip; falls back to the relay otherwise.
 */
export class NetSession implements NetLink {
  readonly role: NetRole;
  readonly roomCode: string;
  readonly kind = '直连';

  readonly peer: Peer;
  conn: DataConnection | null = null;
  connected = false;
  status: NetStatus = { signaling: 'connecting', ice: 'new', candidates: '', note: '' };

  onMessage: ((m: NetMessage) => void) | null = null;
  onConnected: (() => void) | null = null;
  onDisconnected: (() => void) | null = null;
  onError: ((message: string) => void) | null = null;
  onStatus: ((status: NetStatus) => void) | null = null;

  private iceTimer = 0;

  constructor(peer: Peer, role: NetRole, roomCode: string, conn: DataConnection | null) {
    this.peer = peer;
    this.role = role;
    this.roomCode = roomCode;
    this.status.signaling = 'open';
    this.watchPeer(peer);
    if (conn) this.attach(conn);
    if (role === 'host') {
      peer.on('connection', (incoming) => {
        if (this.conn && this.conn.open) {
          incoming.close();
          return;
        }
        this.attach(incoming);
      });
    }
  }

  private publish(note?: string): void {
    if (note !== undefined) this.status.note = note;
    this.onStatus?.({ ...this.status });
  }

  private watchPeer(peer: Peer): void {
    peer.on('disconnected', () => {
      this.status.signaling = 'connecting';
      this.publish('信令服务器断线，正在重连…');
      try {
        peer.reconnect();
      } catch {
        /* ignore */
      }
    });
  }

  private attach(conn: DataConnection): void {
    this.conn = conn;
    this.connected = !!conn.open;
    this.publish();

    // PeerJS drives negotiation through `pc.onicecandidate` /
    // `pc.oniceconnectionstatechange` *property* handlers, so we must only use
    // addEventListener here -- assigning them would silently kill the candidate
    // exchange and the connection would never come up.
    const seen = new Set<string>();
    let hooked = false;
    const observe = () => {
      const pc = conn.peerConnection;
      if (!pc || hooked) return;
      hooked = true;
      const derive = () => {
        this.status.candidates = [...seen].sort().join(',');
        this.status.ice = pc.iceConnectionState;
        const st = pc.iceConnectionState;
        this.publish(
          st === 'checking'
            ? '正在协商直连通道…'
            : st === 'failed'
              ? '直连打不通'
              : st === 'connected' || st === 'completed'
                ? ''
                : this.status.note,
        );
      };
      pc.addEventListener('icecandidate', (ev) => {
        const cand = ev.candidate;
        if (!cand) return;
        const type = / typ (\w+)/.exec(cand.candidate)?.[1];
        if (type) seen.add(type);
        derive();
      });
      pc.addEventListener('iceconnectionstatechange', derive);
      derive();
    };
    observe();
    if (!hooked) {
      let tries = 0;
      this.iceTimer = window.setInterval(() => {
        observe();
        if (hooked || ++tries > 100) window.clearInterval(this.iceTimer);
      }, 50);
    }

    conn.on('open', () => {
      this.connected = true;
      this.publish('');
      this.onConnected?.();
    });
    conn.on('data', (data) => this.onMessage?.(data as NetMessage));
    conn.on('close', () => {
      this.connected = false;
      this.publish('连接已关闭');
      this.onDisconnected?.();
    });
    conn.on('error', (err) => {
      this.publish(String(err));
      this.onError?.(String(err));
    });
  }

  send(message: NetMessage): void {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(message);
      } catch {
        /* raced shut */
      }
    }
  }

  destroy(): void {
    window.clearInterval(this.iceTimer);
    try {
      if (this.conn && this.conn.open) this.conn.close();
    } catch {
      /* ignore */
    }
    try {
      this.peer.destroy();
    } catch {
      /* ignore */
    }
    this.connected = false;
  }
}

/** Creates a room and resolves once the signalling server has the room open. */
export function createHostSession(code: string): Promise<NetSession> {
  return new Promise((resolve, reject) => {
    const peer = new Peer(ID_PREFIX + code, { debug: 0, config: rtcConfiguration() });
    let settled = false;

    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      peer.destroy();
      reject(new Error('连接信令服务器超时'));
    }, SIGNAL_TIMEOUT);

    peer.on('open', () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(new NetSession(peer, 'host', code, null));
    });

    peer.on('error', (err: Error & { type?: string }) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      peer.destroy();
      reject(new Error(err.type === 'unavailable-id' ? '房间号已被占用' : translatePeerError(err)));
    });
  });
}

export function joinSession(code: string, timeoutMs = PEER_TIMEOUT): Promise<NetSession> {
  const clean = normaliseCode(code);
  return new Promise((resolve, reject) => {
    const peer = new Peer({ debug: 0, config: rtcConfiguration() });
    let settled = false;
    let signalOpen = false;
    let session: NetSession | null = null;

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(signalTimer);
      window.clearTimeout(peerTimer);
      peer.destroy();
      reject(new Error(message));
    };

    const signalTimer = window.setTimeout(
      () => fail('连接信令服务器超时'),
      SIGNAL_TIMEOUT,
    );
    let peerTimer = 0;

    peer.on('open', () => {
      signalOpen = true;
      window.clearTimeout(signalTimer);
      const conn = peer.connect(ID_PREFIX + clean, {
        reliable: true,
        serialization: 'json',
      });
      session = new NetSession(peer, 'guest', clean, conn);

      peerTimer = window.setTimeout(() => {
        const ice = session?.status.ice ?? 'unknown';
        const cands = session?.status.candidates || '无';
        fail(`直连打不通（ICE: ${ice}，候选: ${cands}）`);
      }, timeoutMs);

      conn.on('open', () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(peerTimer);
        resolve(session as NetSession);
      });
    });

    peer.on('error', (err: Error & { type?: string }) => {
      if (err.type === 'peer-unavailable') {
        fail(signalOpen ? '找不到该房间' : translatePeerError(err));
      } else {
        fail(translatePeerError(err));
      }
    });
  });
}

function translatePeerError(err: Error & { type?: string }): string {
  switch (err.type) {
    case 'network':
      return '无法连接信令服务器';
    case 'server-error':
      return '信令服务器错误';
    case 'browser-incompatible':
      return '当前浏览器不支持 WebRTC';
    case 'peer-unavailable':
      return '找不到该房间';
    case 'unavailable-id':
      return '房间号冲突';
    default:
      return err.message || '连接失败';
  }
}
