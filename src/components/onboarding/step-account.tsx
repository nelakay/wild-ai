'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Checkbox,
  Input,
} from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function StepAccount() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data } = useOnboardingStore();
  const { setUser } = useAuthStore();

  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'signup';
  const [formMode, setFormMode] = useState<'signup' | 'login'>(initialMode);

  // Sign-up state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [healthConsent, setHealthConsent] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Sign-in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canCreateAccount =
    email.trim().length > 0 &&
    password.trim().length >= 6 &&
    healthConsent;

  const canSignIn =
    signInEmail.trim().length > 0 &&
    signInPassword.trim().length > 0;

  const handleCreateAccount = async () => {
    if (!canCreateAccount) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          profile: {
            life_stage: data.life_stage ?? 'menstrual_cycle',
            avatar_name: data.avatar_name,
            sport_type: data.sport_type,
            experience_level: data.experience_level ?? 'recreational',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            region: '',
            goal: data.goal ?? 'balance',
            consent_version: '1.0',
            health_consent: healthConsent,
            analytics_consent: analyticsConsent,
            marketing_consent: marketingConsent,
            last_period_start: data.last_period_start,
            cycle_length: data.cycle_length,
          },
        }),
      });

      const result = await res.json();

      if (!res.ok && res.status !== 207) {
        setErrorMessage(result.error ?? 'Signup failed');
        setIsSubmitting(false);
        return;
      }

      setUser(result.user as User);
      router.push('/home');
    } catch {
      setErrorMessage('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async () => {
    if (!canSignIn) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signInEmail, password: signInPassword }),
      });

      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.error ?? 'Login failed');
        setIsSubmitting(false);
        return;
      }

      setUser(result.user as User);
      router.push('/home');
    } catch {
      setErrorMessage('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          {formMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
        </h2>
        <p className="text-center text-default-500 mb-8">
          {formMode === 'login'
            ? 'Sign in to access your personalized experience.'
            : 'Secure your personalized experience.'}
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-5 flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {formMode === 'signup' && (
          <>
            {/* Email */}
            <motion.div variants={itemVariants}>
              <Input
                label="Email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onValueChange={setEmail}
                variant="flat"
                size="lg"
              />
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <Input
                label="Password"
                placeholder="At least 6 characters"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onValueChange={setPassword}
                variant="flat"
                size="lg"
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-default-400 hover:text-default-600 px-2"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                }
              />
            </motion.div>

            {/* Consent checkboxes */}
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <Checkbox
                isSelected={healthConsent}
                onValueChange={setHealthConsent}
                size="sm"
              >
                <span className="text-sm">
                  I consent to Wild.AI processing my health data to provide
                  personalized recommendations{' '}
                  <span className="text-danger">*</span>
                </span>
              </Checkbox>

              <Checkbox
                isSelected={analyticsConsent}
                onValueChange={setAnalyticsConsent}
                size="sm"
              >
                <span className="text-sm">
                  I consent to anonymous analytics to improve the app
                </span>
              </Checkbox>

              <Checkbox
                isSelected={marketingConsent}
                onValueChange={setMarketingConsent}
                size="sm"
              >
                <span className="text-sm">
                  I&apos;d like to receive updates about Wild.AI
                </span>
              </Checkbox>
            </motion.div>

            {/* Error message */}
            {errorMessage && (
              <motion.div variants={itemVariants}>
                <p className="text-sm text-danger text-center">{errorMessage}</p>
              </motion.div>
            )}

            {/* Create Account button */}
            <motion.div variants={itemVariants}>
              <Button
                size="lg"
                color="primary"
                className="w-full font-semibold"
                isDisabled={!canCreateAccount}
                isLoading={isSubmitting}
                onPress={handleCreateAccount}
              >
                Create Account
              </Button>
            </motion.div>

            {/* Switch to login */}
            <motion.div variants={itemVariants}>
              <p className="text-sm text-center text-default-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setErrorMessage(''); setFormMode('login'); }}
                  className="text-primary font-semibold hover:underline"
                >
                  Log In
                </button>
              </p>
            </motion.div>
          </>
        )}

        {formMode === 'login' && (
          <>
            <motion.div variants={itemVariants}>
              <Input
                label="Email"
                placeholder="you@example.com"
                type="email"
                value={signInEmail}
                onValueChange={setSignInEmail}
                variant="flat"
                size="lg"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                label="Password"
                placeholder="Your password"
                type={showSignInPassword ? 'text' : 'password'}
                value={signInPassword}
                onValueChange={setSignInPassword}
                variant="flat"
                size="lg"
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="text-xs text-default-400 hover:text-default-600 px-2"
                  >
                    {showSignInPassword ? 'Hide' : 'Show'}
                  </button>
                }
              />
            </motion.div>

            {/* Error message */}
            {errorMessage && (
              <motion.div variants={itemVariants}>
                <p className="text-sm text-danger text-center">{errorMessage}</p>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Button
                size="lg"
                color="primary"
                className="w-full font-semibold"
                isDisabled={!canSignIn}
                isLoading={isSubmitting}
                onPress={handleSignIn}
              >
                Sign In
              </Button>
            </motion.div>

            {/* Switch to signup */}
            <motion.div variants={itemVariants}>
              <p className="text-sm text-center text-default-500">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setErrorMessage(''); setFormMode('signup'); }}
                  className="text-primary font-semibold hover:underline"
                >
                  Create One
                </button>
              </p>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
