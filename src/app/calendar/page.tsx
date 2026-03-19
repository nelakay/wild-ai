'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Divider,
  Slider,
  Textarea,
  Spinner,
  useDisclosure,
} from '@heroui/react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  addMonths,
  subMonths,
  getDay,
  differenceInDays,
  isBefore,
  startOfDay,
} from 'date-fns';
import { useAuthStore } from '@/stores/auth-store';
import { getPhaseForCycleDay } from '@/engine/phase-engine';
import { BIOME_CONFIG, PHASE_LABELS } from '@/lib/constants';
import { useCalendarData, useSaveCheckIn } from '@/hooks/use-calendar';
import type { CheckIn, WorkoutLog, PhaseName } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DayCell {
  date: Date;
  dateStr: string;
  cycleDay: number | null;
  phase: PhaseName | 'perimenopause' | 'menopause' | null;
  color: string;
  isPredicted: boolean;
  isEF: boolean;
  checkIn: CheckIn | null;
  workouts: WorkoutLog[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayCell | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { user, isAuthenticated } = useAuthStore();

  // Date range for API
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const fromStr = format(monthStart, 'yyyy-MM-dd');
  const toStr = format(monthEnd, 'yyyy-MM-dd');

  const { data: calData, isLoading } = useCalendarData(fromStr, toStr);
  const saveCheckIn = useSaveCheckIn();

  const lifeStage = calData?.lifeStage ?? user?.life_stage ?? 'menstrual_cycle';

  // Build day cells
  const days = useMemo(() => {
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const today = startOfDay(new Date());

    // Index check-ins and workouts by date
    const checkInMap = new Map<string, CheckIn>();
    (calData?.checkIns ?? []).forEach((c) => checkInMap.set(c.date, c));

    const workoutMap = new Map<string, WorkoutLog[]>();
    (calData?.workouts ?? []).forEach((w) => {
      const existing = workoutMap.get(w.date) ?? [];
      existing.push(w);
      workoutMap.set(w.date, existing);
    });

    // Get cycle info from cycle logs
    const latestCycle = calData?.cycleLogs?.[0];
    const periodStart = latestCycle
      ? new Date(latestCycle.period_start_date)
      : null;
    const cycleLength = latestCycle?.cycle_length_days ?? 28;
    const periodLength = latestCycle?.period_length_days ?? 4;

    // Phase states from DB
    const phaseMap = new Map<string, { phase_name: string; cycle_day: number | null }>();
    (calData?.phaseStates ?? []).forEach((ps) => {
      phaseMap.set(ps.date, { phase_name: ps.phase_name as string, cycle_day: ps.cycle_day });
    });

    return allDays.map((date): DayCell => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const isPredicted = !isBefore(date, today) && !isToday(date);

      // Try DB phase state first
      const dbPhase = phaseMap.get(dateStr);
      let phase: PhaseName | 'perimenopause' | 'menopause' | null = null;
      let cycleDay: number | null = null;

      if (dbPhase) {
        phase = dbPhase.phase_name as PhaseName;
        cycleDay = dbPhase.cycle_day;
      } else if (periodStart && lifeStage === 'menstrual_cycle') {
        const daysSincePeriod = differenceInDays(date, periodStart);
        cycleDay = ((daysSincePeriod % cycleLength) + cycleLength) % cycleLength + 1;
        phase = getPhaseForCycleDay(cycleDay, cycleLength);
      } else if (lifeStage === 'perimenopause') {
        phase = 'perimenopause';
      } else if (lifeStage === 'menopause') {
        phase = 'menopause';
      }

      const biomeKey = phase ?? 'MF';
      const config = BIOME_CONFIG[biomeKey as keyof typeof BIOME_CONFIG];
      const color = config?.color ?? '#6B7280';

      const isEF = phase === 'EF' && cycleDay != null && cycleDay <= periodLength;

      return {
        date,
        dateStr,
        cycleDay,
        phase,
        color,
        isPredicted,
        isEF,
        checkIn: checkInMap.get(dateStr) ?? null,
        workouts: workoutMap.get(dateStr) ?? [],
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthStart.getTime(), monthEnd.getTime(), calData, lifeStage]);

  // Calendar grid offset (Mon = 0)
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7;
  const emptySlots = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const handleDayTap = useCallback(
    (day: DayCell) => {
      setSelectedDay(day);
      onOpen();
    },
    [onOpen],
  );

  const goToPrevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const goToNextMonth = () => setCurrentMonth((m) => addMonths(m, 1));

  // Phase legend keys
  const legendKeys = lifeStage === 'menstrual_cycle'
    ? (['EF', 'MF', 'OV', 'ML', 'LL'] as const)
    : lifeStage === 'perimenopause'
      ? (['perimenopause'] as const)
      : (['menopause'] as const);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button isIconOnly variant="light" size="sm" onPress={goToPrevMonth} aria-label="Previous month">
          <ChevronIcon direction="left" />
        </Button>
        <h1 className="text-xl font-bold">
          {format(currentMonth, 'MMMM yyyy')}
        </h1>
        <Button isIconOnly variant="light" size="sm" onPress={goToNextMonth} aria-label="Next month">
          <ChevronIcon direction="right" />
        </Button>
      </div>

      {/* Phase legend */}
      <div className="flex flex-wrap gap-3 mb-4 px-1">
        {legendKeys.map((key) => {
          const config = BIOME_CONFIG[key];
          return (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
              <span className="text-[10px] text-default-500">{PHASE_LABELS[key] ?? key}</span>
            </div>
          );
        })}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-[10px] font-medium text-default-400 py-1 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" color="primary" />
        </div>
      )}

      {/* Calendar grid */}
      {!isLoading && (
        <div className="grid grid-cols-7 gap-y-1">
          {emptySlots.map((i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {days.map((day) => {
            const today = isToday(day.date);
            const hasCheckIn = !!day.checkIn;
            const hasWorkouts = day.workouts.length > 0;

            return (
              <button
                key={day.dateStr}
                onClick={() => handleDayTap(day)}
                className={`
                  aspect-square flex flex-col items-center justify-center relative
                  transition-all duration-100
                  ${today ? 'bg-default-100 rounded-full' : ''}
                `}
              >
                {/* Day number colored by phase */}
                <span
                  className={`text-sm font-semibold leading-none ${day.isPredicted ? 'opacity-40' : ''}`}
                  style={{ color: day.color }}
                >
                  {format(day.date, 'd')}
                </span>

                {/* Icons row */}
                <div className="flex items-center gap-0.5 mt-0.5 h-3">
                  {day.isEF && (
                    <span className="text-[8px] leading-none">{'\u2764\uFE0F'}</span>
                  )}
                  {hasWorkouts && (
                    <span className="text-[8px] leading-none">{'\u{1F3CB}'}</span>
                  )}
                  {hasCheckIn && !day.isEF && !hasWorkouts && (
                    <div className="w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>

                {/* Today ring */}
                {today && (
                  <div className="absolute inset-0.5 rounded-full ring-2 ring-primary pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Day detail modal */}
      {selectedDay && (
        <DayDetailModal
          day={selectedDay}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onSaveCheckIn={saveCheckIn}
          isAuthenticated={isAuthenticated}
        />
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Day Detail Modal
// ---------------------------------------------------------------------------

function DayDetailModal({
  day,
  isOpen,
  onOpenChange,
  onSaveCheckIn,
  isAuthenticated,
}: {
  day: DayCell;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveCheckIn: ReturnType<typeof useSaveCheckIn>;
  isAuthenticated: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [energy, setEnergy] = useState(day.checkIn?.energy ?? 5);
  const [sleep, setSleep] = useState(day.checkIn?.sleep_quality ?? 5);
  const [mood, setMood] = useState(day.checkIn?.mood ?? 5);
  const [stress, setStress] = useState(day.checkIn?.stress ?? 5);
  const [performance, setPerformance] = useState(day.checkIn?.performance_feel ?? 5);
  const [notes, setNotes] = useState(day.checkIn?.notes ?? '');

  const phaseLabel = day.phase ? (PHASE_LABELS[day.phase] ?? day.phase) : null;
  const biomeKey = day.phase ?? 'MF';
  const config = BIOME_CONFIG[biomeKey as keyof typeof BIOME_CONFIG];

  const handleSave = () => {
    onSaveCheckIn.mutate({
      date: day.dateStr,
      energy,
      sleep_quality: sleep,
      mood,
      stress,
      performance_feel: performance,
      notes: notes.trim() || null,
    });
    setEditing(false);
  };

  const startEdit = () => {
    setEnergy(day.checkIn?.energy ?? 5);
    setSleep(day.checkIn?.sleep_quality ?? 5);
    setMood(day.checkIn?.mood ?? 5);
    setStress(day.checkIn?.stress ?? 5);
    setPerformance(day.checkIn?.performance_feel ?? 5);
    setNotes(day.checkIn?.notes ?? '');
    setEditing(true);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="bottom" scrollBehavior="inside">
      <ModalContent className="bg-white dark:bg-zinc-900">
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-3 pb-2">
              <span className="text-2xl">{config?.icon ?? '\u{1F33F}'}</span>
              <div>
                <h3 className="text-lg font-bold">
                  {format(day.date, 'EEEE, MMMM d')}
                </h3>
                <p className="text-sm text-default-500">
                  {config?.name ?? 'Unknown'}
                  {day.cycleDay != null && ` \u2014 Day ${day.cycleDay}`}
                </p>
              </div>
            </ModalHeader>

            <ModalBody>
              {/* Phase chip */}
              <div className="flex items-center gap-2 mb-3">
                {phaseLabel && (
                  <Chip size="sm" style={{ backgroundColor: day.color }} className="text-white">
                    {phaseLabel}
                  </Chip>
                )}
                {day.isPredicted && (
                  <Chip size="sm" variant="bordered">Predicted</Chip>
                )}
                {day.isEF && (
                  <Chip size="sm" variant="flat" color="danger">Period</Chip>
                )}
              </div>

              <p className="text-sm text-default-500 italic mb-3">{config?.terrain}</p>

              <Divider />

              {/* Check-in section */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Check-in</h4>
                  {isAuthenticated && !editing && (
                    <Button size="sm" variant="light" color="primary" onPress={startEdit}>
                      {day.checkIn ? 'Edit' : 'Add'}
                    </Button>
                  )}
                </div>

                {editing ? (
                  <div className="flex flex-col gap-4">
                    <SliderField label="Energy" emoji={'\u26A1'} value={energy} onChange={setEnergy} />
                    <SliderField label="Sleep" emoji={'\u{1F31F}'} value={sleep} onChange={setSleep} />
                    <SliderField label="Mood" emoji={'\u{1F60A}'} value={mood} onChange={setMood} />
                    <SliderField label="Stress" emoji={'\u{1F525}'} value={stress} onChange={setStress} hint="(lower is better)" />
                    <SliderField label="Performance" emoji={'\u{1F4AA}'} value={performance} onChange={setPerformance} />

                    <Textarea
                      label="Notes"
                      placeholder="How did you feel? Anything to remember..."
                      value={notes}
                      onValueChange={setNotes}
                      minRows={2}
                      maxRows={4}
                    />

                    <div className="flex gap-2">
                      <Button size="sm" variant="light" onPress={() => setEditing(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        onPress={handleSave}
                        isLoading={onSaveCheckIn.isPending}
                        className="flex-1"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : day.checkIn ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <ScoreCard label="Energy" emoji={'\u26A1'} value={day.checkIn.energy} />
                      <ScoreCard label="Sleep" emoji={'\u{1F31F}'} value={day.checkIn.sleep_quality} />
                      <ScoreCard label="Mood" emoji={'\u{1F60A}'} value={day.checkIn.mood} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <ScoreCard label="Stress" emoji={'\u{1F525}'} value={day.checkIn.stress} />
                      <ScoreCard label="Performance" emoji={'\u{1F4AA}'} value={day.checkIn.performance_feel} />
                    </div>
                    {day.checkIn.notes && (
                      <div className="p-2.5 rounded-lg bg-default-50 mt-2">
                        <p className="text-xs text-default-400 mb-0.5">Notes</p>
                        <p className="text-sm">{day.checkIn.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-default-400">
                    No check-in for this day.
                    {isAuthenticated && ' Tap Add to log one.'}
                  </p>
                )}
              </div>

              {/* Workouts section */}
              {day.workouts.length > 0 && (
                <>
                  <Divider className="my-3" />
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Workouts</h4>
                    <div className="space-y-2">
                      {day.workouts.map((w) => (
                        <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-default-50">
                          <div>
                            <p className="text-sm font-medium">{w.activity_type}</p>
                            <p className="text-xs text-default-400">{w.duration_minutes} min · RPE {w.rpe}</p>
                          </div>
                          {w.notes && (
                            <p className="text-xs text-default-400 max-w-[120px] truncate">{w.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={onClose}>Close</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SliderField({
  label,
  emoji,
  value,
  onChange,
  hint,
}: {
  label: string;
  emoji: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{emoji}</span>
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold text-primary ml-auto">{value}/10</span>
        {hint && <span className="text-[10px] text-default-400">{hint}</span>}
      </div>
      <Slider
        size="sm"
        step={1}
        minValue={1}
        maxValue={10}
        value={value}
        onChange={(v) => onChange(v as number)}
        aria-label={label}
      />
    </div>
  );
}

function ScoreCard({ label, emoji, value }: { label: string; emoji: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 p-2 rounded-lg bg-default-50">
      <span className="text-sm">{emoji}</span>
      <span className="text-xs text-default-500">{label}</span>
      <span className="text-sm font-bold">{value}/10</span>
    </div>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  const d = direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7';
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}
