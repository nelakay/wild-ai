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
  useDisclosure,
} from '@heroui/react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getDay,
  differenceInDays,
  isBefore,
  startOfDay,
} from 'date-fns';
import { usePhaseStore } from '@/stores/phase-store';
import { useAuthStore } from '@/stores/auth-store';
import { getPhaseForCycleDay } from '@/engine/phase-engine';
import { BIOME_CONFIG, PHASE_LABELS } from '@/lib/constants';
import type { PhaseName } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DayInfo {
  date: Date;
  cycleDay: number;
  phase: PhaseName | 'perimenopause' | 'menopause';
  biomeName: string;
  biomeIcon: string;
  terrain: string;
  color: string;
  isPredicted: boolean;
  hasWorkout: boolean;
}

// ---------------------------------------------------------------------------
// Mock data generators
// ---------------------------------------------------------------------------

function generateMockPhaseData(
  monthStart: Date,
  monthEnd: Date,
  lastPeriodStart: string | null,
  cycleLength: number,
  lifeStage: string,
): DayInfo[] {
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = startOfDay(new Date());

  // Default last period start: 14 days ago if not set
  const periodStart = lastPeriodStart
    ? new Date(lastPeriodStart)
    : new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Mock workout days (every 2-3 days in the past)
  const workoutDays = new Set<string>();
  days.forEach((d, i) => {
    if (isBefore(d, today) && i % 3 === 0) {
      workoutDays.add(format(d, 'yyyy-MM-dd'));
    }
  });

  return days.map((date) => {
    const daysSincePeriod = differenceInDays(date, periodStart);
    const cycleDay = ((daysSincePeriod % cycleLength) + cycleLength) % cycleLength + 1;
    const isPredicted = !isBefore(date, today) && !isSameDay(date, today);
    const hasWorkout = workoutDays.has(format(date, 'yyyy-MM-dd'));

    let phase: PhaseName | 'perimenopause' | 'menopause';
    let biomeKey: string;

    if (lifeStage === 'perimenopause') {
      phase = 'perimenopause';
      biomeKey = 'perimenopause';
    } else if (lifeStage === 'menopause') {
      phase = 'menopause';
      biomeKey = 'menopause';
    } else {
      phase = getPhaseForCycleDay(cycleDay, cycleLength);
      biomeKey = phase;
    }

    const config = BIOME_CONFIG[biomeKey as keyof typeof BIOME_CONFIG];

    return {
      date,
      cycleDay,
      phase,
      biomeName: config.name,
      biomeIcon: config.icon,
      terrain: config.terrain,
      color: config.color,
      isPredicted,
      hasWorkout,
    };
  });
}

// ---------------------------------------------------------------------------
// Mock check-in data for day detail modal
// ---------------------------------------------------------------------------

function getMockCheckIn(date: Date) {
  const today = startOfDay(new Date());
  if (!isBefore(date, today) && !isSameDay(date, today)) return null;
  // Pseudo-random based on day of month
  const seed = date.getDate();
  return {
    energy: ((seed * 3) % 5) + 1,
    sleep: ((seed * 7) % 5) + 1,
    mood: ((seed * 11) % 5) + 1,
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { user } = useAuthStore();
  const { historicalPhases } = usePhaseStore();

  const lifeStage = user?.life_stage ?? 'menstrual_cycle';
  const cycleLength = 28; // Default; would come from cycle log in production

  // Generate phase data for the displayed month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const dayInfos = useMemo(
    () =>
      generateMockPhaseData(
        monthStart,
        monthEnd,
        null, // lastPeriodStart — would come from user data
        cycleLength,
        lifeStage,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthStart.getTime(), monthEnd.getTime(), cycleLength, lifeStage],
  );

  // Build the calendar grid. Week starts on Monday.
  // getDay returns 0=Sun, 1=Mon...6=Sat. Convert so Mon=0.
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7; // 0=Mon
  const emptySlots = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const handleDayTap = useCallback(
    (dayInfo: DayInfo) => {
      setSelectedDay(dayInfo);
      onOpen();
    },
    [onOpen],
  );

  const goToPrevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const goToNextMonth = () => setCurrentMonth((m) => addMonths(m, 1));

  const checkIn = selectedDay ? getMockCheckIn(selectedDay.date) : null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button isIconOnly variant="light" size="sm" onPress={goToPrevMonth} aria-label="Previous month">
          <ChevronLeftIcon />
        </Button>
        <h1 className="text-xl font-bold">
          {format(currentMonth, 'MMMM yyyy')}
        </h1>
        <Button isIconOnly variant="light" size="sm" onPress={goToNextMonth} aria-label="Next month">
          <ChevronRightIcon />
        </Button>
      </div>

      {/* Phase legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(lifeStage === 'menstrual_cycle'
          ? (['EF', 'MF', 'OV', 'ML', 'LL'] as const)
          : lifeStage === 'perimenopause'
            ? (['perimenopause'] as const)
            : (['menopause'] as const)
        ).map((key) => {
          const config = BIOME_CONFIG[key];
          return (
            <div key={key} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs text-default-500">{PHASE_LABELS[key] ?? key}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1 ml-2">
          <div className="w-3 h-3 rounded-full border-2 border-dashed border-default-400" />
          <span className="text-xs text-default-500">Predicted</span>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-default-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty slots for offset */}
        {emptySlots.map((i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {dayInfos.map((dayInfo) => {
          const today = isToday(dayInfo.date);
          return (
            <button
              key={dayInfo.date.toISOString()}
              onClick={() => handleDayTap(dayInfo)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center relative
                transition-all duration-150 hover:scale-105
                ${today ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''}
                ${dayInfo.isPredicted ? 'border-2 border-dashed' : ''}
              `}
              style={{
                backgroundColor: dayInfo.isPredicted
                  ? `${dayInfo.color}30`
                  : dayInfo.color,
                borderColor: dayInfo.isPredicted ? dayInfo.color : undefined,
              }}
            >
              <span
                className={`text-sm font-medium ${
                  dayInfo.isPredicted ? 'text-foreground' : 'text-white'
                }`}
              >
                {format(dayInfo.date, 'd')}
              </span>
              <span
                className={`text-[9px] ${
                  dayInfo.isPredicted ? 'text-default-500' : 'text-white/70'
                }`}
              >
                D{dayInfo.cycleDay}
              </span>

              {/* Workout dot */}
              {dayInfo.hasWorkout && (
                <div
                  className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                    dayInfo.isPredicted ? 'bg-foreground/60' : 'bg-white/80'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Day detail modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="bottom">
        <ModalContent className="bg-white dark:bg-zinc-900">
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-3">
                <span className="text-2xl">{selectedDay?.biomeIcon}</span>
                <div>
                  <h3 className="text-lg font-bold">
                    {selectedDay && format(selectedDay.date, 'EEEE, MMMM d')}
                  </h3>
                  <p className="text-sm text-default-500">
                    {selectedDay?.biomeName} — Day {selectedDay?.cycleDay}
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {/* Phase info */}
                <div className="flex items-center gap-2 mb-2">
                  <Chip
                    size="sm"
                    style={{ backgroundColor: selectedDay?.color }}
                    className="text-white"
                  >
                    {selectedDay ? (PHASE_LABELS[selectedDay.phase] ?? selectedDay.phase) : ''}
                  </Chip>
                  {selectedDay?.isPredicted && (
                    <Chip size="sm" variant="bordered">
                      Predicted
                    </Chip>
                  )}
                </div>

                <p className="text-sm text-default-500 italic mb-3">
                  {selectedDay?.terrain}
                </p>

                <Divider />

                {/* Check-in data */}
                {checkIn ? (
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold mb-2">Check-in</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <ScoreCard label="Energy" value={checkIn.energy} />
                      <ScoreCard label="Sleep" value={checkIn.sleep} />
                      <ScoreCard label="Mood" value={checkIn.mood} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-default-400 mt-3">
                    No check-in data for this day.
                  </p>
                )}

                {/* Workouts */}
                {selectedDay?.hasWorkout && (
                  <>
                    <Divider className="my-3" />
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Workouts</h4>
                      <p className="text-sm text-default-500">
                        1 workout logged
                      </p>
                    </div>
                  </>
                )}

                {/* Recommendations */}
                <Divider className="my-3" />
                <div>
                  <h4 className="text-sm font-semibold mb-1">
                    Phase Recommendation
                  </h4>
                  <p className="text-sm text-default-500">
                    {selectedDay?.terrain}
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-default-100">
      <span className="text-xs text-default-500">{label}</span>
      <span className="text-lg font-bold">{value}/5</span>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
