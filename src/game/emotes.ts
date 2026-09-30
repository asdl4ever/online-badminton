export interface EmoteDef {
  id: string;
  char: string;
  label: string;
}

/**
 * Sent as a plain Unicode character so the feature needs no assets. The
 * trade-off is that the artwork differs per platform — acceptable for now.
 */
export const EMOTES: EmoteDef[] = [
  { id: 'nice', char: '👍', label: '好球' },
  { id: 'lol', char: '😂', label: '哈哈' },
  { id: 'wow', char: '😮', label: '哇' },
  { id: 'cry', char: '😭', label: '没了' },
  { id: 'fire', char: '🔥', label: '帅' },
  { id: 'strong', char: '💪', label: '稳' },
  { id: 'angry', char: '😤', label: '不服' },
  { id: 'gg', char: '🤝', label: 'GG' },
];

export const EMOTE_BY_ID: Record<string, EmoteDef> = Object.fromEntries(
  EMOTES.map((e) => [e.id, e]),
);

/** minimum gap between two emotes from the same player */
export const EMOTE_COOLDOWN_MS = 600;
/** how long a bubble stays on screen */
export const EMOTE_LIFE_S = 1.7;
