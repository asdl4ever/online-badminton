import { defineStore } from 'pinia';
import { shallowRef, ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import type { MatchRole } from '../game/types';
import type { NetMetrics } from '../game/telemetry';
import type { NetLink, NetStatus } from '../net/link';

export type ConnState =
  | 'idle'
  | 'creating'
  | 'waiting'
  | 'connecting'
  | 'connected'
  | 'error';

/** offline practice variants: a real opponent, or the ball machine */
export type PracticeMode = 'ai' | 'machine';

export const useGameStore = defineStore('game', () => {
  const role = ref<MatchRole>('single');
  /** what the offline mode pits you against（难度由抽到的对手四维决定） */
  const practice = useLocalStorage<PracticeMode>('bmt-practice', 'ai');
  const connState = ref<ConnState>('idle');
  const roomCode = ref('');
  const transport = ref('');
  const netError = ref('');
  const netStatus = ref<NetStatus | null>(null);
  /** netcode telemetry snapshot, pushed by the scene at 2Hz */
  const metrics = ref<NetMetrics | null>(null);
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
    metrics.value = null;
  }

  return {
    role,
    practice,
    connState,
    roomCode,
    transport,
    netError,
    netStatus,
    metrics,
    session,
    reset,
  };
});
