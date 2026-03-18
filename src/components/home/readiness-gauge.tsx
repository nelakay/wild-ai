'use client';

import { CircularProgress } from '@heroui/react';
import { motion } from 'framer-motion';
import { READINESS_THRESHOLDS } from '@/lib/constants';

interface ReadinessGaugeProps {
  score: number;
  onTap?: () => void;
}

function getReadinessColor(score: number): 'success' | 'warning' | 'danger' {
  if (score >= READINESS_THRESHOLDS.high) return 'success';
  if (score >= READINESS_THRESHOLDS.medium) return 'warning';
  return 'danger';
}

function getReadinessText(score: number): string {
  if (score >= READINESS_THRESHOLDS.high) return 'Great';
  if (score >= READINESS_THRESHOLDS.medium) return 'Moderate';
  return 'Low';
}

export function ReadinessGauge({ score, onTap }: ReadinessGaugeProps) {
  const color = getReadinessColor(score);
  const label = getReadinessText(score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      className="flex flex-col items-center gap-2"
    >
      <button
        onClick={onTap}
        className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
        aria-label={`Readiness score ${score} out of 100. Tap for details.`}
      >
        <CircularProgress
          aria-label="Readiness score"
          size="lg"
          value={score}
          maxValue={100}
          color={color}
          showValueLabel={false}
          classNames={{
            svg: 'w-28 h-28',
            track: 'stroke-default-100',
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{score}</span>
          <span className="text-xs text-foreground/60">{label}</span>
        </div>
      </button>
      <p className="text-sm text-foreground/70 font-medium">Your Readiness</p>
    </motion.div>
  );
}
