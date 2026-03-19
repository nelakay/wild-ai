'use client';

import { Card, CardBody } from '@heroui/react';
import { motion } from 'framer-motion';
import { PHASE_LABELS } from '@/lib/constants';

interface PhaseCardProps {
  phaseName: string;
  biomeLabel: string;
  cycleDay: number | null;
  biomeColor: string;
  gradient: string;
  icon: string;
  terrain: string;
  onTap?: () => void;
}

export function PhaseCard({
  phaseName,
  biomeLabel,
  cycleDay,
  biomeColor,
  gradient,
  icon,
  terrain,
  onTap,
}: PhaseCardProps) {
  // Determine day label based on whether we have a cycle day
  const dayLabel = cycleDay != null ? `Day ${cycleDay}` : 'Today';
  const cycleDayLabel = cycleDay != null ? `Cycle Day ${cycleDay}` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card
        isPressable
        onPress={onTap}
        className={`w-full bg-gradient-to-r ${gradient} border-none shadow-lg`}
        style={{ '--biome-color': biomeColor } as React.CSSProperties}
      >
        <CardBody className="flex flex-row items-center gap-4 p-5">
          <span className="text-4xl" role="img" aria-label={biomeLabel}>
            {icon}
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">
              {biomeLabel}
            </h2>
            <p className="text-white/80 text-sm">
              {PHASE_LABELS[phaseName] ?? phaseName} &middot; {dayLabel}
            </p>
            {cycleDayLabel && (
              <p className="text-white/60 text-xs mt-0.5">{cycleDayLabel}</p>
            )}
            <p className="text-white/70 text-xs mt-1 italic">{terrain}</p>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
