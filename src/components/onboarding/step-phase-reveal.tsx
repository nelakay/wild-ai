'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from '@heroui/react';
import { differenceInDays } from 'date-fns';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { computePhase, getConfidenceLabel } from '@/engine/phase-engine';
import { BIOME_CONFIG } from '@/lib/constants';
import type { BiomeKey } from '@/lib/constants';
import type { PhaseInput, RecommendationType } from '@/types';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.6 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const recTypeLabels: Record<RecommendationType, string> = {
  training: 'Training',
  nutrition: 'Nutrition',
  recovery: 'Recovery',
};

const recTypeColors: Record<RecommendationType, 'primary' | 'success' | 'secondary'> = {
  training: 'primary',
  nutrition: 'success',
  recovery: 'secondary',
};

export function StepPhaseReveal() {
  const { data, setPhaseRevealed, nextStep } = useOnboardingStore();
  const [modalType, setModalType] = useState<RecommendationType | null>(null);

  const phaseOutput = useMemo(() => {
    let cycleDay: number | null = null;

    if (data.life_stage === 'menstrual_cycle' && data.last_period_start) {
      const start = new Date(data.last_period_start);
      const today = new Date();
      const diff = differenceInDays(today, start);
      // Cycle day is 1-indexed; wrap around cycle length
      cycleDay = diff >= 0 ? (diff % data.cycle_length) + 1 : 1;
    }

    return computePhase({
      life_stage: data.life_stage ?? 'menstrual_cycle',
      cycle_day: cycleDay,
      cycle_length_avg: data.cycle_length,
      recent_check_ins: [],
      historical_phases: [],
      algorithm_version: '0.1.0',
    });
  }, [data]);

  // Find the matching biome config key
  const biomeKey = useMemo((): BiomeKey => {
    const entries = Object.entries(BIOME_CONFIG) as [BiomeKey, (typeof BIOME_CONFIG)[BiomeKey]][];
    const match = entries.find(([, cfg]) => cfg.name === phaseOutput.biome_label);
    return match ? match[0] : 'MF';
  }, [phaseOutput.biome_label]);

  const biome = BIOME_CONFIG[biomeKey];
  const confidenceLabel = getConfidenceLabel(phaseOutput.confidence_score);

  const confidenceColor =
    confidenceLabel === 'High'
      ? 'success'
      : confidenceLabel === 'Medium'
        ? 'warning'
        : 'default';

  const recommendations = phaseOutput.recommendations;
  const recTypes: RecommendationType[] = ['training', 'nutrition', 'recovery'];

  const handleContinue = () => {
    setPhaseRevealed(true);
    nextStep();
  };

  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${biome.color}33 0%, ${biome.color}11 50%, transparent 100%)`,
      }}
    >
      {/* Dramatic biome glow */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[120px] opacity-40"
        style={{ backgroundColor: biome.color }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      <div className="relative z-10 flex flex-col px-4 py-8 flex-1">
        {/* Biome name reveal */}
        <motion.div
          className="text-center mt-8 mb-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.p
            className="text-5xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
          >
            {biome.icon}
          </motion.p>
          <h1 className="text-3xl font-bold">
            Welcome to{' '}
            <span style={{ color: biome.color }}>{biome.name}</span>
            {data.avatar_name ? `, ${data.avatar_name}` : ''}.
          </h1>
        </motion.div>

        <motion.p
          className="text-center text-lg text-default-600 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Here is what your body can do today.
        </motion.p>

        {/* Confidence badge */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Chip color={confidenceColor} variant="flat" size="sm">
            Insight quality: {confidenceLabel}
          </Chip>
        </motion.div>

        {/* Recommendation cards */}
        <motion.div
          className="flex flex-col gap-4 flex-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {recTypes.map((type) => {
            const rec = recommendations[type];
            return (
              <motion.div key={type} variants={cardVariants}>
                <Card
                  isPressable
                  onPress={() => setModalType(type)}
                  className="border-l-4 hover:scale-[1.01] transition-transform"
                  style={{ borderLeftColor: biome.color }}
                >
                  <CardHeader className="pb-1">
                    <div className="flex items-center gap-2">
                      <Chip size="sm" color={recTypeColors[type]} variant="flat">
                        {recTypeLabels[type]}
                      </Chip>
                      <span className="font-semibold text-sm">{rec.title}</span>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <p className="text-sm text-default-500">{rec.summary}</p>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Continue */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <Button
            size="lg"
            color="primary"
            className="w-full font-semibold"
            onPress={handleContinue}
          >
            Continue
          </Button>
        </motion.div>
      </div>

      {/* Recommendation detail modal */}
      <Modal
        isOpen={modalType !== null}
        onOpenChange={(open) => {
          if (!open) setModalType(null);
        }}
        placement="bottom"
      >
        <ModalContent className="bg-white dark:bg-zinc-900">
          {modalType && (
            <>
              <ModalHeader className="flex items-center gap-2">
                <Chip size="sm" color={recTypeColors[modalType]} variant="flat">
                  {recTypeLabels[modalType]}
                </Chip>
                {recommendations[modalType].title}
              </ModalHeader>
              <ModalBody className="pb-6">
                <p className="text-default-600">
                  {recommendations[modalType].details || recommendations[modalType].summary}
                </p>
                <div className="mt-4 p-3 rounded-lg bg-default-100">
                  <p className="text-xs text-default-400 mb-1">
                    Current biome
                  </p>
                  <p className="text-sm font-medium" style={{ color: biome.color }}>
                    {biome.icon} {biome.name} &mdash; {biome.terrain}
                  </p>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
