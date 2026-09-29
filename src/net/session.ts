import Peer, { type DataConnection } from 'peerjs';
import type { PlayerInput, WorldSnapshot } from '../game/types';

const ID_PREFIX = 'bmt-';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(len = 5): string {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

export type NetMessage =
  | { t: 'hello'; name: string }
  | { t: 'input'; i: PlayerInput }
  | { t: 'snap'; s: WorldSnapshot }
  | { t: 'rematch' }
  | { t: 'leave' };

export type NetRole = 'host' | 'guest';

export class NetSession {
  readonly role: NetRole;
  readonly roomCode: string;
  readonly peer: Peer;
  conn: DataConnection | null = null;
  connected = false;

  onMessage: ((m: NetMessage) => void) | null = null;
  onConnected: (() => void) | null = null;
  onDisconnected: (() => void) | null = null;
  onError: ((message: string) => void) | null = null;

  constructor(peer: Peer, role: NetRole, roomCode: string, conn: DataConnection | null) {
    this.peer = peer;
    this.role = role;
    this.roomCode = roomCode;
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

  private attach(conn: DataConnection): void {
    this.conn = conn;
    this.connected = !!conn.open;
    conn.on('open', () => {
      this.connected = true;
      this.onConnected?.();
    });
    conn.on('data', (data) => {
      this.onMessage?.(data as NetMessage);
    });
    conn.on('close', () => {
      this.connected = false;
      this.onDisconnected?.();
    });
    conn.on('error', (err) => {
      this.onError?.(String(err));
    });
  }

  send(message: NetMessage): void {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(message);
      } catch {
        /* connection raced shut */
      }
    }
  }

  destroy(): void {
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

export function createHostSession(): Promise<NetSession> {
  return new Promise((resolve, reject) => {
    let attempt = 0;
    const attemptCreate = () => {
      attempt++;
      const code = randomCode();
      const peer = new Peer(ID_PREFIX + code, { debug: 1 });
      let settled = false;
      peer.on('open', () => {
        if (settled) return;
        settled = true;
        resolve(new NetSession(peer, 'host', code, null));
      });
      peer.on('error', (err: Error & { type?: string }) => {
        if (settled) {
          return;
        }
        if (err.type === 'unavailable-id' && attempt < 6) {
          peer.destroy();
          attemptCreate();
          return;
        }
        settled = true;
        reject(new Error(translatePeerError(err)));
      });
    };
    attemptCreate();
  });
}

export function joinSession(code: string): Promise<NetSession> {
  const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return new Promise((resolve, reject) => {
    const peer = new Peer({ debug: 1 });
    let settled = false;
    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      peer.destroy();
      reject(new Error(message));
    };

    const timer = window.setTimeout(() => fail('连接超时，请检查房间号'), 20000);

    peer.on('open', () => {
      const conn = peer.connect(ID_PREFIX + clean, {
        reliable: true,
        serialization: 'json',
      });
      conn.on('open', () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve(new NetSession(peer, 'guest', clean, conn));
      });
      conn.on('error', (err) => fail(translatePeerError(err)));
    });
    peer.on('error', (err: Error & { type?: string }) => {
      if (err.type === 'peer-unavailable') fail('找不到该房间，请确认房间号是否正确');
      else fail(translatePeerError(err));
    });
  });
}

function translatePeerError(err: Error & { type?: string }): string {
  switch (err.type) {
    case 'network':
      return '网络错误，无法连接信令服务器';
    case 'server-error':
      return '信令服务器错误，请稍后再试';
    case 'browser-incompatible':
      return '当前浏览器不支持 WebRTC';
    case 'peer-unavailable':
      return '找不到该房间';
    case 'unavailable-id':
      return '房间号冲突，请重试';
    default:
      return err.message || '连接失败';
  }
}
