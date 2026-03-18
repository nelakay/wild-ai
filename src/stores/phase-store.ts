import { create } from 'zustand';
import type { PhaseOutput, CheckIn, PhaseState } from '@/types';

interface PhaseStoreState {
  currentPhase: PhaseOutput | null;
  todayCheckIn: CheckIn | null;
  recentCheckIns: CheckIn[];
  historicalPhases: PhaseState[];
  isLoading: boolean;
  setCurrentPhase: (phase: PhaseOutput | null) => void;
  setTodayCheckIn: (checkIn: CheckIn | null) => void;
  setRecentCheckIns: (checkIns: CheckIn[]) => void;
  setHistoricalPhases: (phases: PhaseState[]) => void;
  setLoading: (loading: boolean) => void;
}

export const usePhaseStore = create<PhaseStoreState>((set) => ({
  currentPhase: null,
  todayCheckIn: null,
  recentCheckIns: [],
  historicalPhases: [],
  isLoading: true,
  setCurrentPhase: (currentPhase) => set({ currentPhase }),
  setTodayCheckIn: (todayCheckIn) => set({ todayCheckIn }),
  setRecentCheckIns: (recentCheckIns) => set({ recentCheckIns }),
  setHistoricalPhases: (historicalPhases) => set({ historicalPhases }),
  setLoading: (isLoading) => set({ isLoading }),
}));
