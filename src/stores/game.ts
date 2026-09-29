import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import type { Difficulty } from '../game/ai';
import type { MatchRole } from '../game/types';
import type { NetSession } from '../net/session';

export type ConnState =
  | 'idle'
  | 'creating'
  | 'waiting'
  | 'connecting'
  | 'connected'
  | 'error';

export const useGameStore = defineStore('game', () => {
  const role = ref<MatchRole>('single');
  const difficulty = ref<Difficulty>('normal');
  const connState = ref<ConnState>('idle');
  const roomCode = ref('');
  const netError = ref('');
  const session = shallowRef<NetSession | null>(null);

  function reset(): void {
    session.value?.destroy();
    session.value = null;
    role.value = 'single';
    connState.value = 'idle';
    roomCode.value = '';
    netError.value = '';
  }

  return { role, difficulty, connState, roomCode, netError, session, reset };
});
