'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody } from '@heroui/react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { BIOME_CONFIG } from '@/lib/constants';
import type { LifeStage } from '@/types';

interface LifeStageOption {
  key: LifeStage;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
}

const options: LifeStageOption[] = [
  {
    key: 'menstrual_cycle',
    title: 'Menstrual Cycle',
    subtitle: 'The world of phases',
    description:
      'Track your cycle phases and unlock personalized guidance that moves with your hormones.',
    gradient: `linear-gradient(135deg, ${BIOME_CONFIG.EF.color}, ${BIOME_CONFIG.MF.color}, ${BIOME_CONFIG.OV.color}, ${BIOME_CONFIG.LL.color})`,
  },
  {
    key: 'perimenopause',
    title: 'Perimenopause',
    subtitle: 'The Tides',
    description:
      'Navigate the transition with daily adaptations as your body finds its new rhythm.',
    gradient: `linear-gradient(135deg, ${BIOME_CONFIG.perimenopause.color}, #06b6d4)`,
  },
  {
    key: 'menopause',
    title: 'Menopause',
    subtitle: 'The Horizon',
    description:
      'Master your steady state with strength-focused guidance built for this chapter.',
    gradient: `linear-gradient(135deg, ${BIOME_CONFIG.menopause.color}, #f43f5e)`,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function StepLifeStage() {
  const { setLifeStage, nextStep } = useOnboardingStore();
  const [selected, setSelected] = useState<LifeStage | null>(null);

  const handleSelect = (stage: LifeStage) => {
    setSelected(stage);
    setLifeStage(stage);
    // Auto-advance after a short delay so user sees the selection
    setTimeout(() => {
      nextStep();
    }, 500);
  };

  return (
    <div className="min-h-dvh flex flex-col px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Choose Your Terrain
        </h2>
        <p className="text-center text-default-500 mb-8">
          Select the stage that best describes where you are today.
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-4 flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {options.map((option) => (
          <motion.div key={option.key} variants={cardVariants}>
            <Card
              isPressable
              onPress={() => handleSelect(option.key)}
              className={`relative overflow-hidden transition-all duration-300 ${
                selected === option.key
                  ? 'ring-3 ring-primary ring-offset-2 ring-offset-background scale-[1.02]'
                  : 'hover:scale-[1.01]'
              }`}
            >
              {/* Gradient background bar */}
              <div
                className="absolute inset-0 opacity-15"
                style={{ background: option.gradient }}
              />
              <CardBody className="relative z-10 p-5">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-default-400">
                    {option.subtitle}
                  </p>
                  <h3 className="text-xl font-bold">{option.title}</h3>
                  <p className="text-sm text-default-500 mt-1">
                    {option.description}
                  </p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
