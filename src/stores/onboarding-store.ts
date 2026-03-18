import { create } from 'zustand';
import type { OnboardingData, LifeStage, ExperienceLevel, UserGoal } from '@/types';

interface OnboardingState {
  step: number;
  data: OnboardingData;
  phaseRevealed: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setLifeStage: (stage: LifeStage) => void;
  setAvatarName: (name: string) => void;
  setSportType: (sport: string) => void;
  setExperienceLevel: (level: ExperienceLevel) => void;
  setGoal: (goal: UserGoal) => void;
  setLastPeriodStart: (date: string) => void;
  setCycleLength: (length: number) => void;
  setPrePeriodFeeling: (feeling: string) => void;
  setSleepQuality: (quality: string) => void;
  setEnergyVariability: (variability: string) => void;
  setPhaseRevealed: (revealed: boolean) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  life_stage: null,
  avatar_name: '',
  sport_type: '',
  experience_level: null,
  goal: null,
  last_period_start: null,
  cycle_length: 28,
  pre_period_feeling: null,
  sleep_quality: null,
  energy_variability: null,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  data: { ...initialData },
  phaseRevealed: false,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  setLifeStage: (life_stage) => set((state) => ({ data: { ...state.data, life_stage } })),
  setAvatarName: (avatar_name) => set((state) => ({ data: { ...state.data, avatar_name } })),
  setSportType: (sport_type) => set((state) => ({ data: { ...state.data, sport_type } })),
  setExperienceLevel: (experience_level) => set((state) => ({ data: { ...state.data, experience_level } })),
  setGoal: (goal) => set((state) => ({ data: { ...state.data, goal } })),
  setLastPeriodStart: (last_period_start) => set((state) => ({ data: { ...state.data, last_period_start } })),
  setCycleLength: (cycle_length) => set((state) => ({ data: { ...state.data, cycle_length } })),
  setPrePeriodFeeling: (pre_period_feeling) => set((state) => ({ data: { ...state.data, pre_period_feeling } })),
  setSleepQuality: (sleep_quality) => set((state) => ({ data: { ...state.data, sleep_quality } })),
  setEnergyVariability: (energy_variability) => set((state) => ({ data: { ...state.data, energy_variability } })),
  setPhaseRevealed: (phaseRevealed) => set({ phaseRevealed }),
  reset: () => set({ step: 1, data: { ...initialData }, phaseRevealed: false }),
}));
