import type { PlayerInput, WorldSnapshot } from '../game/types';
import type { Cosmetic } from '../game/cosmetics';

export type NetRole = 'host' | 'guest';

export type NetMessage =
  | { t: 'hello'; name?: string; rank?: string; cosmetic?: Cosmetic }
  | { t: 'input'; i: PlayerInput }
  | { t: 'snap'; s: WorldSnapshot }
  | { t: 'rematch' }
  | { t: 'leave' }
  /** a reaction bubble the opponent should show above the sender */
  | { t: 'emote'; id: string; ts: number }
  /** latency probe — the sender stamps it and measures its own round trip */
  | { t: 'ping'; ts: number }
  | { t: 'pong'; ts: number };

export interface NetStatus {
  /** 'connecting' | 'open' | 'failed' */
  signaling: string;
  ice: string;
  candidates: string;
  note: string;
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function randomRoomCode(len = 5): string {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

export function normaliseCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * A duplex link to the other player. Implemented by the WebRTC (PeerJS) path
 * and by the WebSocket relay.
 */
export interface NetLink {
  readonly role: NetRole;
  readonly roomCode: string;
  /** human label shown in the UI, e.g. '直连' or '中继' */
  readonly kind: string;
  connected: boolean;
  onMessage: ((m: NetMessage) => void) | null;
  onConnected: (() => void) | null;
  onDisconnected: (() => void) | null;
  onError: ((message: string) => void) | null;
  onStatus: ((status: NetStatus) => void) | null;
  send(message: NetMessage): void;
  destroy(): void;
}
