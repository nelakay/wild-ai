'use client';

import { motion } from 'framer-motion';
import { Button, Card, CardBody, Chip } from '@heroui/react';
import { useOnboardingStore } from '@/stores/onboarding-store';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function StepWearable() {
  const { nextStep } = useOnboardingStore();

  const handleConnectZepp = () => {
    // TODO: Implement actual Zepp/Amazfit connection
    alert('Zepp connection coming soon');
  };

  return (
    <div className="min-h-dvh flex flex-col px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Equip Your Tracker
        </h2>
        <p className="text-center text-default-500 mb-8">
          Link your wearable to sharpen your readiness score
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-4 flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Zepp / Amazfit */}
        <motion.div variants={itemVariants}>
          <Card className="p-2">
            <CardBody className="flex flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-lg">Zepp / Amazfit</p>
                <p className="text-sm text-default-500">
                  Sync HRV, sleep, and activity data for smarter recommendations.
                </p>
              </div>
              <Button
                color="primary"
                variant="flat"
                size="sm"
                onPress={handleConnectZepp}
              >
                Connect
              </Button>
            </CardBody>
          </Card>
        </motion.div>

        {/* Apple Health */}
        <motion.div variants={itemVariants}>
          <Card className="p-2 opacity-60">
            <CardBody className="flex flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-lg">Apple Health</p>
                  <Chip size="sm" variant="flat" color="default">
                    Coming in V2
                  </Chip>
                </div>
                <p className="text-sm text-default-400">
                  Apple Health integration is on the roadmap.
                </p>
              </div>
              <Button
                color="default"
                variant="flat"
                size="sm"
                isDisabled
              >
                Connect
              </Button>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>

      {/* Skip link */}
      <motion.div
        className="mt-4 mb-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={nextStep}
          className="text-sm text-default-400 hover:text-default-600 underline transition-colors"
        >
          You can add this later in Settings
        </button>
      </motion.div>

      {/* Continue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          size="lg"
          color="primary"
          className="w-full font-semibold"
          onPress={nextStep}
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
