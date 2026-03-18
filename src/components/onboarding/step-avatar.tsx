'use client';

import { motion } from 'framer-motion';
import { Button, Card, CardBody, Input, Select, SelectItem } from '@heroui/react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { SPORT_TYPES } from '@/lib/constants';
import type { ExperienceLevel } from '@/types';

const experienceLevels: { key: ExperienceLevel; label: string }[] = [
  { key: 'beginner', label: 'Beginner' },
  { key: 'recreational', label: 'Recreational' },
  { key: 'competitive', label: 'Competitive' },
  { key: 'elite', label: 'Elite' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function StepAvatar() {
  const { data, setAvatarName, setSportType, setExperienceLevel, nextStep } =
    useOnboardingStore();

  const isComplete =
    data.avatar_name.trim().length > 0 &&
    data.sport_type.length > 0 &&
    data.experience_level !== null;

  return (
    <div className="min-h-dvh flex flex-col px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Name Your Avatar
        </h2>
        <p className="text-center text-default-500 mb-8">
          Tell us a bit about yourself.
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-6 flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* First Name */}
        <motion.div variants={itemVariants}>
          <Input
            label="First Name"
            placeholder="Enter your first name"
            value={data.avatar_name}
            onValueChange={setAvatarName}
            variant="flat"
            size="lg"
          />
        </motion.div>

        {/* Primary Sport */}
        <motion.div variants={itemVariants}>
          <Select
            label="Primary Sport"
            placeholder="Choose your sport"
            selectedKeys={data.sport_type ? [data.sport_type] : []}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string;
              if (val) setSportType(val);
            }}
            variant="flat"
            size="lg"
          >
            {SPORT_TYPES.map((sport) => (
              <SelectItem key={sport}>{sport}</SelectItem>
            ))}
          </Select>
        </motion.div>

        {/* Experience Level */}
        <motion.div variants={itemVariants}>
          <p className="text-sm font-medium mb-3 text-default-600">
            Experience Level
          </p>
          <div className="grid grid-cols-2 gap-3">
            {experienceLevels.map((level) => (
              <Card
                key={level.key}
                isPressable
                onPress={() => setExperienceLevel(level.key)}
                className={`transition-all duration-200 ${
                  data.experience_level === level.key
                    ? 'ring-2 ring-primary bg-primary/10'
                    : 'hover:bg-default-100'
                }`}
              >
                <CardBody className="p-3 text-center">
                  <p
                    className={`text-sm font-medium ${
                      data.experience_level === level.key
                        ? 'text-primary'
                        : 'text-default-700'
                    }`}
                  >
                    {level.label}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Continue button */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          size="lg"
          color="primary"
          className="w-full font-semibold"
          isDisabled={!isComplete}
          onPress={nextStep}
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
