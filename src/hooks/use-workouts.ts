import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { WorkoutLog } from '@/types';

export function useWorkouts() {
  return useQuery<WorkoutLog[]>({
    queryKey: ['workouts'],
    queryFn: async () => {
      const res = await fetch('/api/workouts');
      if (res.status === 401) throw new Error('unauthorized');
      if (!res.ok) throw new Error('Failed to fetch workouts');
      const data = await res.json();
      return data.workouts;
    },
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      activity_type: string;
      duration_minutes: number;
      rpe: number;
      notes?: string;
      post_workout_feel?: string;
    }) => {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create workout');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      activity_type: string;
      duration_minutes: number;
      rpe: number;
      notes?: string;
      post_workout_feel?: string;
    }) => {
      const res = await fetch('/api/workouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update workout');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/workouts?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete workout');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}
