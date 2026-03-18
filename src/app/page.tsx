'use client';

import { Button } from '@heroui/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect } from 'react';
import { BIOME_CONFIG } from '@/lib/constants';

const biomes = Object.values(BIOME_CONFIG);

export default function SplashPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Animated biome gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: biomes.map(
            (b) =>
              `radial-gradient(ellipse at 50% 50%, ${b.color}40 0%, transparent 70%)`
          ),
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'easeInOut',
        }}
      />

      {/* Floating phase orbs */}
      {biomes.map((biome, i) => (
        <motion.div
          key={biome.name}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: 200 + i * 30,
            height: 200 + i * 30,
            backgroundColor: biome.color,
          }}
          animate={{
            x: [0, 50 * Math.cos(i * 1.2), -30 * Math.sin(i * 0.8), 0],
            y: [0, -40 * Math.sin(i * 1.5), 60 * Math.cos(i * 0.6), 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Wild<span className="text-primary">.</span>AI
          </h1>
        </motion.div>

        <motion.p
          className="text-lg text-white/70 max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          Train with your nature, not against it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <Button
            size="lg"
            color="primary"
            variant="shadow"
            className="font-semibold text-lg px-10 py-6"
            onPress={() => router.push('/onboarding')}
          >
            Enter Your World
          </Button>
        </motion.div>

        <motion.button
          className="text-sm text-white/40 hover:text-white/70 transition-colors mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          onClick={() => router.push('/onboarding?step=7')}
        >
          Already have an account? Sign in
        </motion.button>
      </div>
    </div>
  );
}
