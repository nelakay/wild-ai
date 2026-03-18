'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Slider,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  useDisclosure,
} from '@heroui/react';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/auth-store';
import { usePhaseStore } from '@/stores/phase-store';
import { getPhaseForCycleDay } from '@/engine/phase-engine';
import { ACTIVITY_TYPES, BIOME_CONFIG } from '@/lib/constants';
import {
  useWorkouts,
  useCreateWorkout,
  useUpdateWorkout,
  useDeleteWorkout,
} from '@/hooks/use-workouts';
import type { WorkoutLog } from '@/types';


// ---------------------------------------------------------------------------
// Activity emoji mapping
// ---------------------------------------------------------------------------

const ACTIVITY_EMOJIS: Record<string, string> = {
  Running: '\u{1F3C3}',
  Cycling: '\u{1F6B4}',
  Swimming: '\u{1F3CA}',
  Weightlifting: '\u{1F3CB}',
  CrossFit: '\u{1F4AA}',
  Yoga: '\u{1F9D8}',
  Pilates: '\u{1F9D8}',
  HIIT: '\u26A1',
  Walking: '\u{1F6B6}',
  Hiking: '\u26F0\uFE0F',
  'Rock Climbing': '\u{1F9D7}',
  Rowing: '\u{1F6A3}',
  Kayaking: '\u{1F6F6}',
  Skiing: '\u26F7\uFE0F',
  Snowboarding: '\u{1F3C2}',
  Soccer: '\u26BD',
  Basketball: '\u{1F3C0}',
  Tennis: '\u{1F3BE}',
  Volleyball: '\u{1F3D0}',
  'Martial Arts': '\u{1F94B}',
  Boxing: '\u{1F94A}',
  Dance: '\u{1F483}',
  Gymnastics: '\u{1F938}',
  'Track & Field': '\u{1F3C5}',
  Triathlon: '\u{1F3C6}',
  Surfing: '\u{1F3C4}',
  Skating: '\u26F8\uFE0F',
  Golf: '\u26F3',
  Badminton: '\u{1F3F8}',
  'Table Tennis': '\u{1F3D3}',
  Elliptical: '\u{1F3BD}',
  'Stair Climbing': '\u{1FA9C}',
  'Jump Rope': '\u{1F4AB}',
  Other: '\u{1F3CB}',
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TrainingPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { user, isAuthenticated } = useAuthStore();
  const { currentPhase } = usePhaseStore();

  // Live data from Supabase
  const { data: liveWorkouts } = useWorkouts();
  const createWorkout = useCreateWorkout();
  const updateWorkout = useUpdateWorkout();
  const deleteWorkoutMutation = useDeleteWorkout();

  // Local fallback for unauthenticated users
  const [localWorkouts, setLocalWorkouts] = useState<WorkoutLog[]>([]);

  const workouts = isAuthenticated ? (liveWorkouts ?? []) : localWorkouts;

  // Track which workout is being edited (null = creating new)
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState('');
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');

  // Derive current phase context
  const lifeStage = user?.life_stage ?? 'menstrual_cycle';
  const today = new Date();

  const phaseContext = useMemo(() => {
    // Use current phase from store if available, otherwise calculate
    if (currentPhase) {
      const phaseKey = (currentPhase.phase_name ?? 'MF') as string;
      const config = BIOME_CONFIG[phaseKey as keyof typeof BIOME_CONFIG];
      return {
        cycleDay: currentPhase.cycle_day ?? 1,
        phase: phaseKey,
        biomeName: currentPhase.biome_label ?? config?.name ?? 'The Plains',
        terrain: config?.terrain ?? '',
      };
    }

    // Fallback: estimate from mock data
    const cycleDay = (today.getDate() % 28) + 1;
    let phase: string;
    if (lifeStage === 'perimenopause') {
      phase = 'perimenopause';
    } else if (lifeStage === 'menopause') {
      phase = 'menopause';
    } else {
      phase = getPhaseForCycleDay(cycleDay, 28);
    }
    const config = BIOME_CONFIG[phase as keyof typeof BIOME_CONFIG];
    return {
      cycleDay,
      phase,
      biomeName: config?.name ?? 'The Plains',
      terrain: config?.terrain ?? '',
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhase, lifeStage, today.getDate()]);

  const resetForm = () => {
    setActivityType('');
    setDuration('');
    setRpe(5);
    setNotes('');
    setEditingId(null);
  };

  const openNewWorkout = () => {
    resetForm();
    onOpen();
  };

  const openEditWorkout = (workout: WorkoutLog) => {
    setEditingId(workout.id);
    setActivityType(workout.activity_type);
    setDuration(String(workout.duration_minutes));
    setRpe(workout.rpe);
    setNotes(workout.notes ?? '');
    onOpen();
  };

  const handleSave = (onClose: () => void) => {
    if (!activityType || !duration) return;

    const durationMinutes = parseInt(duration, 10);

    if (isAuthenticated && editingId) {
      updateWorkout.mutate({
        id: editingId,
        activity_type: activityType,
        duration_minutes: durationMinutes,
        rpe,
        notes: notes || undefined,
      });
    } else if (isAuthenticated) {
      createWorkout.mutate({
        activity_type: activityType,
        duration_minutes: durationMinutes,
        rpe,
        notes: notes || undefined,
      });
    } else {
      // Local fallback
      if (editingId) {
        setLocalWorkouts((prev) =>
          prev.map((w) =>
            w.id === editingId
              ? { ...w, activity_type: activityType, duration_minutes: durationMinutes, rpe, notes }
              : w,
          ),
        );
      } else {
        const workout: WorkoutLog = {
          id: crypto.randomUUID(),
          user_id: '',
          date: new Date().toISOString().split('T')[0],
          phase_state_id: '',
          activity_type: activityType,
          duration_minutes: durationMinutes,
          rpe,
          source: 'manual',
          post_workout_feel: null,
          notes,
        };
        setLocalWorkouts((prev) => [workout, ...prev]);
      }
    }

    resetForm();
    onClose();
  };

  const handleDelete = (onClose: () => void) => {
    if (!editingId) return;

    if (isAuthenticated) {
      deleteWorkoutMutation.mutate(editingId);
    } else {
      setLocalWorkouts((prev) => prev.filter((w) => w.id !== editingId));
    }

    resetForm();
    onClose();
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Training Log</h1>
        <Button color="primary" onPress={openNewWorkout} className="font-semibold">
          + Log Workout
        </Button>
      </div>

      {/* Phase context banner */}
      <Card className="mb-6" shadow="sm">
        <CardBody className="flex flex-row items-center gap-3 py-3">
          <span className="text-2xl">
            {BIOME_CONFIG[phaseContext.phase as keyof typeof BIOME_CONFIG]?.icon ?? '\u{1F33F}'}
          </span>
          <div>
            <p className="text-sm font-semibold">
              Day {phaseContext.cycleDay} — {phaseContext.biomeName}
            </p>
            <p className="text-xs text-default-500">{phaseContext.terrain}</p>
          </div>
        </CardBody>
      </Card>

      {/* Recent workouts */}
      {workouts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">{'\u{1F3CB}\uFE0F'}</p>
          <p className="text-default-500">No workouts logged yet.</p>
          <p className="text-sm text-default-400 mt-1">
            Tap &quot;Log Workout&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-default-500 uppercase tracking-wide">
            Recent Workouts
          </h2>
          {workouts.map((w) => (
            <Card key={w.id} shadow="sm" isPressable onPress={() => openEditWorkout(w)}>
              <CardBody className="flex flex-row items-start gap-3">
                <span className="text-2xl mt-0.5">
                  {ACTIVITY_EMOJIS[w.activity_type] ?? '\u{1F3CB}'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{w.activity_type}</h3>
                    <span className="text-xs text-default-400">
                      {format(new Date(w.date), 'MMM d')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Chip size="sm" variant="flat">
                      {w.duration_minutes} min
                    </Chip>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={w.rpe >= 8 ? 'danger' : w.rpe >= 5 ? 'warning' : 'success'}
                    >
                      RPE {w.rpe}
                    </Chip>
                  </div>
                  {w.notes && (
                    <p className="text-xs text-default-500 mt-1 truncate">
                      {w.notes}
                    </p>
                  )}
                  {w.post_workout_feel && (
                    <Chip size="sm" variant="bordered" className="mt-1">
                      Felt: {w.post_workout_feel}
                    </Chip>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Log Workout Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="bottom" scrollBehavior="inside">
        <ModalContent className="bg-white dark:bg-zinc-900">
          {(onClose) => (
            <>
              <ModalHeader>{editingId ? 'Edit Workout' : 'Log Workout'}</ModalHeader>
              <ModalBody>
                {/* Phase context display */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-default-100 mb-2">
                  <span className="text-lg">
                    {BIOME_CONFIG[phaseContext.phase as keyof typeof BIOME_CONFIG]?.icon ?? '\u{1F33F}'}
                  </span>
                  <p className="text-sm">
                    Day {phaseContext.cycleDay} — {phaseContext.biomeName} —{' '}
                    <span className="text-default-500 italic">
                      {phaseContext.terrain}
                    </span>
                  </p>
                </div>

                <Select
                  label="Activity Type"
                  placeholder="Select an activity"
                  selectedKeys={activityType ? [activityType] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setActivityType(selected ?? '');
                  }}
                >
                  {ACTIVITY_TYPES.map((activity) => (
                    <SelectItem key={activity}>
                      {`${ACTIVITY_EMOJIS[activity] ?? ''} ${activity}`}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  type="number"
                  label="Duration (minutes)"
                  placeholder="e.g. 45"
                  value={duration}
                  onValueChange={setDuration}
                  min={1}
                  max={600}
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    RPE (Rate of Perceived Exertion): {rpe}
                  </label>
                  <Slider
                    size="sm"
                    step={1}
                    minValue={1}
                    maxValue={10}
                    value={rpe}
                    onChange={(v) => setRpe(v as number)}
                    className="max-w-full"
                    aria-label="RPE"
                  />
                  <div className="flex justify-between text-xs text-default-400 mt-1">
                    <span>Easy</span>
                    <span>Max effort</span>
                  </div>
                </div>

                <Textarea
                  label="Notes"
                  placeholder="How did it feel? Any observations..."
                  value={notes}
                  onValueChange={setNotes}
                  minRows={2}
                  maxRows={4}
                />
              </ModalBody>
              <ModalFooter>
                {editingId && (
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => handleDelete(onClose)}
                    className="mr-auto"
                  >
                    Delete
                  </Button>
                )}
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleSave(onClose)}
                  isDisabled={!activityType || !duration}
                >
                  {editingId ? 'Update' : 'Save'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
