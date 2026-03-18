'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  Spinner,
  useDisclosure,
} from '@heroui/react';
import { motion } from 'framer-motion';
import { usePhaseStore } from '@/stores/phase-store';
import { useAuthStore } from '@/stores/auth-store';
import { computePhase } from '@/engine/phase-engine';
import { useDailyCard } from '@/hooks/use-daily-card';
import { BIOME_CONFIG, type BiomeKey } from '@/lib/constants';
import { PhaseCard } from '@/components/home/phase-card';
import { ReadinessGauge } from '@/components/home/readiness-gauge';
import { InsightCard } from '@/components/home/insight-card';
import { CheckInDrawer } from '@/components/checkin/check-in-drawer';
import type { PhaseInput, RecommendationType } from '@/types';

function getPrioritySentence(readinessScore: number, phase: string): string {
  if (readinessScore >= 70) {
    switch (phase) {
      case 'EF':
        return 'Your body is recovering well — honor the rest, gentle movement today.';
      case 'MF':
        return "Energy is rising — it's a great day to push your limits.";
      case 'OV':
        return "You're at your peak — chase the PR if it feels right.";
      case 'ML':
        return 'Steady energy — focus on endurance and mindful effort.';
      case 'LL':
        return 'Winding down — listen to your body and prioritize recovery.';
      default:
        return "You're feeling strong — trust your body's signals today.";
    }
  }
  if (readinessScore >= 40) {
    return 'Listen to your body — moderate effort is your friend today.';
  }
  return 'Your body is asking for rest — recovery is the priority today.';
}

function getMockCycleDay(): number {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return ((dayOfYear - 1) % 28) + 1;
}

export default function HomePage() {
  const { user } = useAuthStore();
  const {
    currentPhase,
    setCurrentPhase,
    todayCheckIn,
    recentCheckIns,
    historicalPhases,
    isLoading: storeLoading,
    setLoading,
  } = usePhaseStore();

  const readinessModal = useDisclosure();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Try fetching live data from Supabase
  const { data: dailyCard, isLoading: queryLoading } = useDailyCard();

  // Fallback: compute client-side if not authenticated or API fails
  useEffect(() => {
    if (dailyCard || queryLoading) return; // Live data handled by React Query
    if (currentPhase) {
      setLoading(false);
      return;
    }

    const lifeStage = user?.life_stage ?? 'menstrual_cycle';
    const cycleDay =
      lifeStage === 'menstrual_cycle' ? getMockCycleDay() : undefined;

    const input: PhaseInput = {
      life_stage: lifeStage,
      cycle_day: cycleDay ?? null,
      cycle_length_avg: 28,
      recent_check_ins: recentCheckIns,
      wearable_snapshot: null,
      historical_phases: historicalPhases,
      algorithm_version: '0.1.0',
    };

    try {
      const result = computePhase(input);
      setCurrentPhase(result);
    } catch (err) {
      console.error('Phase computation failed:', err);
    } finally {
      setLoading(false);
    }
  }, [
    dailyCard,
    queryLoading,
    currentPhase,
    user,
    recentCheckIns,
    historicalPhases,
    setCurrentPhase,
    setLoading,
  ]);

  const isLoading = queryLoading || (!currentPhase && storeLoading);

  const phaseName = currentPhase?.phase_name ?? 'MF';
  const biomeLabel = currentPhase?.biome_label ?? 'The Plains';
  const cycleDay = currentPhase?.cycle_day ?? null;
  const readinessScore = currentPhase?.readiness_score ?? 50;
  const hasCheckedInToday = !!todayCheckIn;
  const streakDays = hasCheckedInToday ? 1 : 0;

  const biomeKey: BiomeKey = useMemo(() => {
    const keyMap: Record<string, BiomeKey> = {
      EF: 'EF',
      MF: 'MF',
      OV: 'OV',
      ML: 'ML',
      LL: 'LL',
      perimenopause: 'perimenopause',
      menopause: 'menopause',
    };
    return keyMap[phaseName] ?? 'MF';
  }, [phaseName]);

  const biome = BIOME_CONFIG[biomeKey];

  const recs = currentPhase?.recommendations;
  const insightTypes: RecommendationType[] = ['training', 'nutrition', 'recovery'];

  const insights = useMemo(() => {
    if (!recs) return null;
    return insightTypes.map((type) => {
      const rec = recs[type];
      if (!rec) return null;
      return {
        type,
        title: rec.title,
        summary: rec.summary,
        details: rec.details,
        tips: rec.tips,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recs]);

  const priority = getPrioritySentence(readinessScore, phaseName);

  const breakdown = useMemo(() => {
    if (todayCheckIn) {
      return {
        energy: todayCheckIn.energy,
        sleep: todayCheckIn.sleep_quality,
        mood: todayCheckIn.mood,
        stress: todayCheckIn.stress,
        performance: todayCheckIn.performance_feel,
      };
    }
    return { energy: 5, sleep: 5, mood: 5, stress: 5, performance: 5 };
  }, [todayCheckIn]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <Spinner size="lg" color="primary" label="Preparing your day..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-24">
      <PhaseCard
        phaseName={phaseName}
        biomeLabel={biomeLabel}
        cycleDay={cycleDay}
        biomeColor={biome.color}
        gradient={biome.gradient}
        icon={biome.icon}
        terrain={biome.terrain}
        onTap={() => console.log('Navigate to phase detail for:', phaseName)}
      />

      <ReadinessGauge score={readinessScore} onTap={readinessModal.onOpen} />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card className="border border-divider">
          <CardBody className="p-4">
            <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide mb-1">
              Today&apos;s Priority
            </p>
            <p className="text-sm font-medium">{priority}</p>
          </CardBody>
        </Card>
      </motion.div>

      {insights && (
        <div className="grid grid-cols-1 gap-3">
          {insights.map(
            (insight, i) =>
              insight && (
                <InsightCard
                  key={insight.type}
                  type={insight.type}
                  title={insight.title}
                  summary={insight.summary}
                  details={insight.details}
                  tips={insight.tips}
                  index={i}
                />
              ),
          )}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <Chip
          variant="flat"
          color={streakDays > 0 ? 'success' : 'default'}
          size="sm"
          startContent={<span className="text-sm pl-1">{'\u{1F525}'}</span>}
        >
          {streakDays > 0 ? `${streakDays} day streak` : 'Start your streak today'}
        </Chip>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        className="fixed bottom-20 left-0 right-0 px-4 z-40"
      >
        <div className="max-w-lg mx-auto">
          <Button
            color="primary"
            size="lg"
            className="w-full font-semibold shadow-lg"
            onPress={() => setDrawerOpen(true)}
          >
            Log how you feel
          </Button>
        </div>
      </motion.div>

      <CheckInDrawer isOpen={drawerOpen} onOpenChange={setDrawerOpen} />

      <Modal
        isOpen={readinessModal.isOpen}
        onOpenChange={readinessModal.onOpenChange}
        placement="center"
        size="sm"
      >
        <ModalContent className="bg-white dark:bg-zinc-900">
          {(onClose) => (
            <>
              <ModalHeader>Readiness Breakdown</ModalHeader>
              <ModalBody>
                <p className="text-sm text-foreground/60 mb-3">
                  Your readiness score is calculated from recent check-ins,
                  wearable data, and your current phase.
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'Energy', value: breakdown.energy, emoji: '\u26A1' },
                    { label: 'Sleep', value: breakdown.sleep, emoji: '\u{1F31F}' },
                    { label: 'Mood', value: breakdown.mood, emoji: '\u{1F60A}' },
                    { label: 'Stress', value: breakdown.stress, emoji: '\u{1F525}', inverted: true },
                    { label: 'Performance', value: breakdown.performance, emoji: '\u{1F4AA}' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <span>{item.emoji}</span>
                        {item.label}
                        {item.inverted && (
                          <span className="text-xs text-foreground/40">(lower is better)</span>
                        )}
                      </span>
                      <span className="text-sm font-semibold">{item.value}/10</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-divider">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Overall Readiness</span>
                    <span className="text-lg font-bold text-primary">{readinessScore}</span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
