'use client';

import { motion } from 'framer-motion';
import { Button, Card, CardBody, Slider } from '@heroui/react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { MIN_CYCLE_LENGTH, MAX_CYCLE_LENGTH } from '@/lib/constants';
import type { UserGoal } from '@/types';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function OptionCard({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      isPressable
      onPress={onSelect}
      className={`transition-all duration-200 ${
        selected
          ? 'ring-2 ring-primary bg-primary/10'
          : 'hover:bg-default-100'
      }`}
    >
      <CardBody className="p-3 text-center">
        <p
          className={`text-sm font-medium ${
            selected ? 'text-primary' : 'text-default-700'
          }`}
        >
          {label}
        </p>
      </CardBody>
    </Card>
  );
}

const goalOptions: { key: UserGoal; label: string }[] = [
  { key: 'performance', label: 'Performance' },
  { key: 'health', label: 'Health' },
  { key: 'balance', label: 'Balance' },
  { key: 'recovery', label: 'Recovery' },
];

function GoalQuestion() {
  const { data, setGoal } = useOnboardingStore();

  return (
    <motion.div variants={itemVariants}>
      <p className="text-sm font-medium mb-3 text-default-600">
        What is your main goal?
      </p>
      <div className="grid grid-cols-2 gap-3">
        {goalOptions.map((opt) => (
          <OptionCard
            key={opt.key}
            label={opt.label}
            selected={data.goal === opt.key}
            onSelect={() => setGoal(opt.key)}
          />
        ))}
      </div>
    </motion.div>
  );
}

function MenstrualCycleQuiz() {
  const {
    data,
    setLastPeriodStart,
    setCycleLength,
    setPrePeriodFeeling,
  } = useOnboardingStore();

  const prePeriodOptions = [
    'Energized & Strong',
    'Moody & Tired',
    'It Varies',
  ];

  return (
    <>
      {/* Q1: Last period start date */}
      <motion.div variants={itemVariants}>
        <label className="block text-sm font-medium mb-2 text-default-600">
          When did your last period start?
        </label>
        <input
          type="date"
          value={data.last_period_start ?? ''}
          onChange={(e) => setLastPeriodStart(e.target.value)}
          className="w-full rounded-xl bg-default-100 px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </motion.div>

      {/* Q2: Average cycle length */}
      <motion.div variants={itemVariants}>
        <p className="text-sm font-medium mb-2 text-default-600">
          How long is your average cycle?
        </p>
        <Slider
          label="Cycle Length"
          step={1}
          minValue={MIN_CYCLE_LENGTH}
          maxValue={MAX_CYCLE_LENGTH}
          value={data.cycle_length}
          onChange={(val) => setCycleLength(val as number)}
          className="w-full"
          showTooltip
          marks={[
            { value: 21, label: '21' },
            { value: 28, label: '28' },
            { value: 35, label: '35' },
            { value: 45, label: '45' },
          ]}
          endContent={
            <span className="text-xs text-default-500 min-w-[50px] text-right">
              {data.cycle_length} days
            </span>
          }
        />
      </motion.div>

      {/* Q3: Pre-period feeling */}
      <motion.div variants={itemVariants}>
        <p className="text-sm font-medium mb-3 text-default-600">
          How do you feel in the week before your period?
        </p>
        <div className="flex flex-col gap-3">
          {prePeriodOptions.map((opt) => (
            <OptionCard
              key={opt}
              label={opt}
              selected={data.pre_period_feeling === opt}
              onSelect={() => setPrePeriodFeeling(opt)}
            />
          ))}
        </div>
      </motion.div>

      {/* Q4: Goal */}
      <GoalQuestion />
    </>
  );
}

function PeriMenoQuiz() {
  const { data, setSleepQuality, setEnergyVariability } = useOnboardingStore();

  const sleepOptions = ['Great', 'Okay', 'Rough'];
  const energyOptions = ['Consistent', 'Some variation', 'Very variable'];

  return (
    <>
      {/* Q1: Sleep quality */}
      <motion.div variants={itemVariants}>
        <p className="text-sm font-medium mb-3 text-default-600">
          How has your sleep been this week?
        </p>
        <div className="flex flex-col gap-3">
          {sleepOptions.map((opt) => (
            <OptionCard
              key={opt}
              label={opt}
              selected={data.sleep_quality === opt}
              onSelect={() => setSleepQuality(opt)}
            />
          ))}
        </div>
      </motion.div>

      {/* Q2: Energy variability */}
      <motion.div variants={itemVariants}>
        <p className="text-sm font-medium mb-3 text-default-600">
          How variable is your energy?
        </p>
        <div className="flex flex-col gap-3">
          {energyOptions.map((opt) => (
            <OptionCard
              key={opt}
              label={opt}
              selected={data.energy_variability === opt}
              onSelect={() => setEnergyVariability(opt)}
            />
          ))}
        </div>
      </motion.div>

      {/* Q3: Goal */}
      <GoalQuestion />
    </>
  );
}

export function StepQuiz() {
  const { data, nextStep } = useOnboardingStore();
  const isMenstrualCycle = data.life_stage === 'menstrual_cycle';

  const canContinue = isMenstrualCycle
    ? data.last_period_start !== null &&
      data.pre_period_feeling !== null &&
      data.goal !== null
    : data.sleep_quality !== null &&
      data.energy_variability !== null &&
      data.goal !== null;

  return (
    <div className="min-h-dvh flex flex-col px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Phase Awareness Quiz
        </h2>
        <p className="text-center text-default-500 mb-8">
          Help us understand your body&apos;s rhythm.
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-6 flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isMenstrualCycle ? <MenstrualCycleQuiz /> : <PeriMenoQuiz />}
      </motion.div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          size="lg"
          color="primary"
          className="w-full font-semibold"
          isDisabled={!canContinue}
          onPress={nextStep}
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
