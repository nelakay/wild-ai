import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePhaseStore } from '@/stores/phase-store';
import type { PhaseOutput, CheckIn, RecommendationSummary } from '@/types';

export interface DailyCardResponse {
  phase: {
    phase_name: string;
    biome_label: string;
    cycle_day: number | null;
    confidence_score: number;
    readiness_score: number;
    algorithm_version: string;
  };
  recommendations: {
    training: RecommendationSummary;
    nutrition: RecommendationSummary;
    recovery: RecommendationSummary;
  };
  todayCheckIn: CheckIn | null;
  profile: {
    life_stage: string;
    avatar_name: string;
    sport_type: string;
    goal: string | null;
  };
}

export function useDailyCard() {
  const { setCurrentPhase, setTodayCheckIn } = usePhaseStore();

  return useQuery<DailyCardResponse>({
    queryKey: ['daily-card'],
    queryFn: async () => {
      const res = await fetch('/api/daily-card');
      if (res.status === 401) throw new Error('unauthorized');
      if (!res.ok) throw new Error('Failed to fetch daily card');
      const data: DailyCardResponse = await res.json();

      // Sync to Zustand for components that read from the store
      const phaseOutput: PhaseOutput = {
        phase_name: data.phase.phase_name,
        biome_label: data.phase.biome_label as PhaseOutput['biome_label'],
        cycle_day: data.phase.cycle_day,
        confidence_score: data.phase.confidence_score,
        readiness_score: data.phase.readiness_score,
        recommendations: data.recommendations,
        algorithm_version: data.phase.algorithm_version,
      };
      setCurrentPhase(phaseOutput);

      if (data.todayCheckIn) {
        setTodayCheckIn(data.todayCheckIn);
      }

      return data;
    },
  });
}

export function useSubmitCheckIn() {
  const queryClient = useQueryClient();
  const { setTodayCheckIn } = usePhaseStore();

  return useMutation({
    mutationFn: async (payload: {
      energy: number;
      sleep_quality: number;
      mood: number;
      stress: number;
      performance_feel: number;
      extended_symptoms?: Record<string, number>;
    }) => {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Check-in failed');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.checkIn) {
        setTodayCheckIn(data.checkIn);
      }
      // Re-fetch daily card to get updated readiness based on new check-in
      queryClient.invalidateQueries({ queryKey: ['daily-card'] });
    },
  });
}
