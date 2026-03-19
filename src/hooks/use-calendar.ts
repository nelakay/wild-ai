import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CheckIn, WorkoutLog, PhaseState } from '@/types';

export interface CalendarData {
  checkIns: CheckIn[];
  workouts: WorkoutLog[];
  phaseStates: PhaseState[];
  cycleLogs: { period_start_date: string; cycle_length_days: number; period_length_days: number }[];
  lifeStage: string;
}

export function useCalendarData(from: string, to: string) {
  return useQuery<CalendarData>({
    queryKey: ['calendar', from, to],
    queryFn: async () => {
      const res = await fetch(`/api/calendar?from=${from}&to=${to}`);
      if (res.status === 401) throw new Error('unauthorized');
      if (!res.ok) throw new Error('Failed to fetch calendar data');
      return res.json();
    },
  });
}

export function useSaveCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      date: string;
      energy: number;
      sleep_quality: number;
      mood: number;
      stress: number;
      performance_feel: number;
      notes?: string | null;
      extended_symptoms?: Record<string, number>;
    }) => {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Check-in save failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['daily-card'] });
    },
  });
}
