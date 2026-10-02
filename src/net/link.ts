import type { PlayerInput, WorldSnapshot } from '../game/types';
import type { Cosmetic } from '../game/cosmetics';
import type { PlayerAttrs } from '../game/attrs';

export type NetRole = 'host' | 'guest';

export type NetMessage =
  | { t: 'hello'; name?: string; rank?: string; cosmetic?: Cosmetic; attrs?: PlayerAttrs }
  | { t: 'input'; i: PlayerInput }
  | { t: 'snap'; s: WorldSnapshot }
  | { t: 'rematch' }
  | { t: 'leave' }
  /** a reaction bubble the opponent should show above the sender */
  | { t: 'emote'; id: string; ts: number }
  /** fun-mode: this player's pick for the round's option */
  | { t: 'vote'; round: number; option: string }
  /** fun-mode: host announces the round plan / the result scoreboard */
  | {
      t: 'party';
      round: number;
      kind: 'vote' | 'play' | 'result' | 'done';
      options?: string[];
      option?: string;
      scores?: [number, number];
      label?: string;
      detail?: string;
      winner?: number;
    }
  /** fishing: a light pose so both clients can draw the other angler */
  | { t: 'fishPose'; x: number; y: number; a: number; r: number }
  /** fishing: this player just landed a fish (display only, no sim) */
  | { t: 'fishCatch'; fish: string; value: number }
  /** mining: a light pose so both clients can draw the other miner */
  | { t: 'minePose'; x: number; y: number; a: number; r: number }
  /** mining: this player just broke an ore block (display only, no sim) */
  | { t: 'mineBreak'; ore: string; value: number }
  /** world map: where the other player is standing (light pose, ~12Hz) */
  | { t: 'mapPose'; x: number; y: number; f: 1 | -1 }
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
