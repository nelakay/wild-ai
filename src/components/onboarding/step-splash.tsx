'use client';

import { motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { BIOME_CONFIG } from '@/lib/constants';

const biomeColors = [
  BIOME_CONFIG.EF.color,
  BIOME_CONFIG.MF.color,
  BIOME_CONFIG.OV.color,
  BIOME_CONFIG.ML.color,
  BIOME_CONFIG.LL.color,
  BIOME_CONFIG.perimenopause.color,
  BIOME_CONFIG.menopause.color,
];

function PhaseOrb({ color, delay, x, y, size }: {
  color: string;
  delay: number;
  x: string;
  y: string;
  size: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl opacity-30"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        left: x,
        top: y,
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: 5,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function StepSplash() {
  const { nextStep } = useOnboardingStore();
  const router = useRouter();

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center bg-black overflow-hidden px-6">
      {/* Animated phase orbs background */}
      <PhaseOrb color={biomeColors[0]} delay={0} x="10%" y="15%" size={180} />
      <PhaseOrb color={biomeColors[1]} delay={0.7} x="65%" y="10%" size={140} />
      <PhaseOrb color={biomeColors[2]} delay={1.4} x="50%" y="55%" size={160} />
      <PhaseOrb color={biomeColors[3]} delay={2.1} x="15%" y="65%" size={120} />
      <PhaseOrb color={biomeColors[4]} delay={2.8} x="75%" y="70%" size={150} />
      <PhaseOrb color={biomeColors[5]} delay={3.5} x="35%" y="85%" size={130} />
      <PhaseOrb color={biomeColors[6]} delay={4.2} x="80%" y="40%" size={110} />

      {/* Logo reveal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-10 text-center"
      >
        <motion.h1
          className="text-6xl font-bold text-white tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Wild<span className="text-purple-400">.AI</span>
        </motion.h1>

        <motion.p
          className="mt-4 text-lg text-white/70 font-light max-w-xs mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          Train with your nature, not against it.
        </motion.p>
      </motion.div>

      {/* CTA button */}
      <motion.div
        className="relative z-10 mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <Button
          size="lg"
          color="primary"
          variant="shadow"
          className="px-8 py-6 text-lg font-semibold"
          onPress={nextStep}
        >
          Begin Your Journey
        </Button>
        <Button
          size="lg"
          variant="bordered"
          className="mt-3 px-8 py-6 text-lg font-semibold text-white/80 border-white/30"
          onPress={() => router.push('/onboarding?step=7&mode=login')}
        >
          Log In
        </Button>
      </motion.div>
    </div>
  );
}
