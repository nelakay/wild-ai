'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Progress } from '@heroui/react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { StepSplash } from '@/components/onboarding/step-splash';
import { StepLifeStage } from '@/components/onboarding/step-life-stage';
import { StepAvatar } from '@/components/onboarding/step-avatar';
import { StepQuiz } from '@/components/onboarding/step-quiz';
import { StepPhaseReveal } from '@/components/onboarding/step-phase-reveal';
import { StepWearable } from '@/components/onboarding/step-wearable';
import { StepAccount } from '@/components/onboarding/step-account';

const TOTAL_STEPS = 7;

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

function StepRenderer({ step }: { step: number }) {
  switch (step) {
    case 1: return <StepSplash />;
    case 2: return <StepLifeStage />;
    case 3: return <StepAvatar />;
    case 4: return <StepQuiz />;
    case 5: return <StepPhaseReveal />;
    case 6: return <StepWearable />;
    case 7: return <StepAccount />;
    default: return <StepSplash />;
  }
}

function OnboardingContent() {
  const searchParams = useSearchParams();
  const { step, setStep } = useOnboardingStore();

  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const parsed = parseInt(stepParam, 10);
      if (parsed >= 1 && parsed <= TOTAL_STEPS) {
        setStep(parsed);
      }
    }
  }, [searchParams, setStep]);

  return (
    <div className="min-h-dvh flex flex-col">
      {step > 1 && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-default-500">
              Step {step} of {TOTAL_STEPS}
            </span>
            <button
              onClick={() => useOnboardingStore.getState().prevStep()}
              className="text-xs text-primary hover:underline"
            >
              Back
            </button>
          </div>
          <Progress
            size="sm"
            value={(step / TOTAL_STEPS) * 100}
            color="primary"
            aria-label={`Onboarding progress: step ${step} of ${TOTAL_STEPS}`}
          />
        </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' as const }}
            className="h-full"
          >
            <StepRenderer step={step} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
