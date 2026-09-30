import { defineStore } from 'pinia';
import { shallowRef, ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import type { Difficulty } from '../game/ai';
import type { MatchRole } from '../game/types';
import type { NetLink, NetStatus } from '../net/link';

export type ConnState =
  | 'idle'
  | 'creating'
  | 'waiting'
  | 'connecting'
  | 'connected'
  | 'error';

export const useGameStore = defineStore('game', () => {
  const role = ref<MatchRole>('single');
  /** persisted so the chosen difficulty survives a reload */
  const difficulty = useLocalStorage<Difficulty>('bmt-difficulty', 'normal');
  const connState = ref<ConnState>('idle');
  const roomCode = ref('');
  const transport = ref('');
  const netError = ref('');
  const netStatus = ref<NetStatus | null>(null);
  const session = shallowRef<NetLink | null>(null);

  function reset(): void {
    session.value?.destroy();
    session.value = null;
    role.value = 'single';
    connState.value = 'idle';
    roomCode.value = '';
    transport.value = '';
    netError.value = '';
    netStatus.value = null;
  }

  return {
    role,
    difficulty,
    connState,
    roomCode,
    transport,
    netError,
    netStatus,
    session,
    reset,
  };
});
