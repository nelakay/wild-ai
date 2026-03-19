'use client';

import { useState, useCallback } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Slider,
  Accordion,
  AccordionItem,
  Switch,
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhaseStore } from '@/stores/phase-store';
import { useSubmitCheckIn } from '@/hooks/use-daily-card';
import type { CheckIn } from '@/types';

interface CheckInDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CheckInValues {
  energy: number;
  sleep_quality: number;
  mood: number;
  stress: number;
  performance_feel: number;
  cramps?: number;
  brain_fog?: number;
  hot_flashes?: boolean;
}

const SLIDER_CONFIG = [
  {
    key: 'energy' as const,
    label: "How's your energy?",
    minEmoji: '\u{1F634}',
    maxEmoji: '\u26A1',
    minLabel: 'Drained',
    maxLabel: 'Charged',
  },
  {
    key: 'sleep_quality' as const,
    label: 'How did you sleep?',
    minEmoji: '\u{1F62B}',
    maxEmoji: '\u{1F31F}',
    minLabel: 'Terrible',
    maxLabel: 'Amazing',
  },
  {
    key: 'mood' as const,
    label: "How's your mood?",
    minEmoji: '\u{1F614}',
    maxEmoji: '\u{1F60A}',
    minLabel: 'Low',
    maxLabel: 'Great',
  },
  {
    key: 'stress' as const,
    label: 'Stress level?',
    minEmoji: '\u{1F60C}',
    maxEmoji: '\u{1F525}',
    minLabel: 'Calm',
    maxLabel: 'Stressed',
  },
  {
    key: 'performance_feel' as const,
    label: 'How does your body feel?',
    minEmoji: '\u{1F9BE}',
    maxEmoji: '\u{1F4AA}',
    minLabel: 'Heavy',
    maxLabel: 'Strong',
  },
];

export function CheckInDrawer({ isOpen, onOpenChange }: CheckInDrawerProps) {
  const { currentPhase, setTodayCheckIn } = usePhaseStore();
  const submitCheckIn = useSubmitCheckIn();
  const [values, setValues] = useState<CheckInValues>({
    energy: 5,
    sleep_quality: 5,
    mood: 5,
    stress: 5,
    performance_feel: 5,
  });
  const [submitted, setSubmitted] = useState(false);

  // Determine which Tier 2 fields to show based on current phase
  const phaseName = currentPhase?.phase_name ?? '';
  const showCramps = phaseName === 'EF';
  const showBrainFog = phaseName === 'ML' || phaseName === 'LL';
  const biomeLabel = currentPhase?.biome_label ?? '';
  const showHotFlashes = biomeLabel === 'The Tides';
  const hasTier2 = showCramps || showBrainFog || showHotFlashes;

  const handleSliderChange = useCallback(
    (key: keyof CheckInValues, value: number | number[]) => {
      const numericValue = Array.isArray(value) ? value[0] : value;
      setValues((prev) => ({ ...prev, [key]: numericValue }));
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    const payload = {
      energy: values.energy,
      sleep_quality: values.sleep_quality,
      mood: values.mood,
      stress: values.stress,
      performance_feel: values.performance_feel,
      extended_symptoms: {
        ...(values.cramps != null && { cramps: values.cramps }),
        ...(values.brain_fog != null && { brain_fog: values.brain_fog }),
        ...(values.hot_flashes != null && { hot_flashes: values.hot_flashes ? 1 : 0 }),
      },
    };

    // Optimistic local update
    const localCheckIn: CheckIn = {
      id: crypto.randomUUID(),
      user_id: '',
      date: new Date().toISOString().split('T')[0],
      phase_state_id: '',
      notes: null,
      ...payload,
    };
    setTodayCheckIn(localCheckIn);
    setSubmitted(true);

    // Persist to Supabase (non-blocking — mutation handles re-fetch)
    submitCheckIn.mutate(payload);

    setTimeout(() => {
      setSubmitted(false);
      onOpenChange(false);
    }, 1200);
  }, [values, setTodayCheckIn, onOpenChange, submitCheckIn]);

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="bottom">
      <DrawerContent className="max-h-[85dvh] bg-white dark:bg-zinc-900">
        {(onClose) => (
          <>
            <DrawerHeader className="flex flex-col gap-1">
              <h2 className="text-lg font-bold">Daily Check-in</h2>
              <p className="text-sm text-foreground/60">
                Quick — takes under 30 seconds
              </p>
            </DrawerHeader>

            <DrawerBody className="gap-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 gap-3"
                  >
                    <span className="text-5xl">{'\u2705'}</span>
                    <p className="text-lg font-semibold">Logged!</p>
                    <p className="text-sm text-foreground/60">
                      Your data helps personalize your experience
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Tier 1 - Core sliders */}
                    {SLIDER_CONFIG.map((slider) => (
                      <div key={slider.key} className="space-y-2">
                        <label className="text-sm font-medium">
                          {slider.label}
                        </label>
                        <div className="flex items-center gap-3">
                          <span className="text-lg shrink-0" title={slider.minLabel}>
                            {slider.minEmoji}
                          </span>
                          <Slider
                            aria-label={slider.label}
                            step={1}
                            minValue={1}
                            maxValue={10}
                            value={values[slider.key] as number}
                            onChange={(v) => handleSliderChange(slider.key, v)}
                            size="sm"
                            color="primary"
                            className="flex-1"
                          />
                          <span className="text-lg shrink-0" title={slider.maxLabel}>
                            {slider.maxEmoji}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-foreground/40 px-7">
                          <span>{slider.minLabel}</span>
                          <span>{slider.maxLabel}</span>
                        </div>
                      </div>
                    ))}

                    {/* Tier 2 - Contextual */}
                    {hasTier2 && (
                      <Accordion variant="bordered" className="mt-2">
                        <AccordionItem
                          key="tier2"
                          aria-label="Phase-specific symptoms"
                          title={
                            <span className="text-sm font-medium">
                              Phase-specific symptoms
                            </span>
                          }
                          subtitle={
                            <span className="text-xs text-foreground/50">
                              Optional, helps accuracy
                            </span>
                          }
                        >
                          <div className="space-y-5 pb-2">
                            {showCramps && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Cramps intensity
                                </label>
                                <div className="flex items-center gap-3">
                                  <span className="text-lg shrink-0">{'\u{1F60C}'}</span>
                                  <Slider
                                    aria-label="Cramps intensity"
                                    step={1}
                                    minValue={1}
                                    maxValue={10}
                                    value={values.cramps ?? 1}
                                    onChange={(v) => handleSliderChange('cramps', v)}
                                    size="sm"
                                    color="danger"
                                    className="flex-1"
                                  />
                                  <span className="text-lg shrink-0">{'\u{1F616}'}</span>
                                </div>
                              </div>
                            )}

                            {showBrainFog && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Brain fog level
                                </label>
                                <div className="flex items-center gap-3">
                                  <span className="text-lg shrink-0">{'\u{1F9E0}'}</span>
                                  <Slider
                                    aria-label="Brain fog level"
                                    step={1}
                                    minValue={1}
                                    maxValue={10}
                                    value={values.brain_fog ?? 1}
                                    onChange={(v) => handleSliderChange('brain_fog', v)}
                                    size="sm"
                                    color="warning"
                                    className="flex-1"
                                  />
                                  <span className="text-lg shrink-0">{'\u{1F32B}\uFE0F'}</span>
                                </div>
                              </div>
                            )}

                            {showHotFlashes && (
                              <div className="flex items-center justify-between py-2">
                                <label className="text-sm font-medium">
                                  Hot flashes today?
                                </label>
                                <Switch
                                  aria-label="Hot flashes today"
                                  isSelected={values.hot_flashes ?? false}
                                  onValueChange={(checked) =>
                                    setValues((prev) => ({
                                      ...prev,
                                      hot_flashes: checked,
                                    }))
                                  }
                                  size="sm"
                                  color="danger"
                                />
                              </div>
                            )}
                          </div>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Tier 3 - Placeholder */}
                    <div className="text-center pt-2">
                      <button
                        className="text-xs text-primary/70 hover:text-primary underline underline-offset-2"
                        onClick={() => {
                          // TODO: Expand to full symptom list in V2
                          console.log('Full symptom log coming in V2');
                        }}
                      >
                        Log more symptoms...
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </DrawerBody>

            {!submitted && (
              <DrawerFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit} className="font-semibold">
                  Save Check-in
                </Button>
              </DrawerFooter>
            )}
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
