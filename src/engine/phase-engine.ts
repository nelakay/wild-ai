/**
 * Phase Engine for Wild.AI
 *
 * Pure computation module — no side effects, no database access.
 * Determines the user's current hormonal phase, calculates readiness
 * and confidence scores, and generates science-backed recommendations
 * informed by Dr. Stacy Sims' research.
 *
 * Phase codes: EF (Early Follicular), MF (Mid Follicular), OV (Ovulation),
 * ML (Mid Luteal), LL (Late Luteal)
 *
 * @module phase-engine
 * @version 0.1.0
 */

import type {
  PhaseInput,
  PhaseOutput,
  PhaseName,
  BiomeLabel,
  CheckIn,
  RecommendationSummary,
} from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ALGORITHM_VERSION = '0.1.0';

const DEFAULT_CYCLE_LENGTH = 28;
const RECENT_CHECK_IN_WINDOW_DAYS = 3;
const HISTORY_THRESHOLD_DAYS = 14;

// ---------------------------------------------------------------------------
// Recommendation content (science-backed, Dr. Stacy Sims)
// ---------------------------------------------------------------------------

interface PhaseRecommendations {
  training: RecommendationSummary;
  nutrition: RecommendationSummary;
  recovery: RecommendationSummary;
}

const RECOMMENDATIONS: Record<string, PhaseRecommendations> = {
  EF: {
    training: {
      title: 'Gentle Movement',
      summary: 'Mobility, yoga, light walks. Your body is recovering — honor the rest.',
      details: 'During menstruation, estrogen and progesterone are at their lowest. This is your body\'s natural recovery window. Focus on gentle movement that promotes blood flow without taxing your system.',
      tips: ['Try restorative yoga or gentle stretching', 'Walk for 20-30 minutes outdoors', 'Avoid heavy lifting or high-intensity work', 'Listen to your body — rest days are training days'],
    },
    nutrition: {
      title: 'Nourish & Restore',
      summary: 'Iron-rich foods, anti-inflammatory meals. Think leafy greens, salmon, turmeric.',
      details: 'Iron loss during menstruation needs replenishing. Anti-inflammatory foods help reduce cramps and discomfort.',
      tips: ['Eat iron-rich foods: spinach, lentils, red meat', 'Add vitamin C to boost iron absorption', 'Include anti-inflammatory spices: turmeric, ginger', 'Stay hydrated — aim for 2-3L of water'],
    },
    recovery: {
      title: 'Deep Rest',
      summary: 'Prioritize sleep, try heat therapy, consider magnesium supplementation.',
      details: 'Your body is doing important work during menstruation. Support it with quality sleep and targeted recovery strategies.',
      tips: ['Aim for 8+ hours of sleep', 'Try a heating pad for cramp relief', 'Consider magnesium glycinate before bed', 'Epsom salt baths can ease muscle tension'],
    },
  },

  MF: {
    training: {
      title: 'Build Momentum',
      summary: 'Progressive overload, skill work. Estrogen is rising — your body is ready to grow.',
      details: 'Rising estrogen enhances muscle protein synthesis, pain tolerance, and energy. This is your body\'s building phase.',
      tips: ['Increase training volume gradually', 'Focus on compound lifts and skill work', 'Try new movements or techniques', 'Your body recovers faster now — push appropriately'],
    },
    nutrition: {
      title: 'Fuel the Build',
      summary: 'Complex carbs, moderate protein. Your metabolism supports muscle building now.',
      details: 'Your metabolic rate is lower in the follicular phase, meaning you\'re more efficient at using carbohydrates for fuel.',
      tips: ['Prioritize complex carbs: oats, sweet potato, rice', 'Moderate protein: 1.6-2g per kg bodyweight', 'Pre-workout carbs improve performance', 'Good fats for hormone production'],
    },
    recovery: {
      title: 'Standard Recovery',
      summary: 'Follow HRV guidance. Your body recovers efficiently in this phase.',
      details: 'Recovery is naturally efficient during the follicular phase. Use HRV data to guide training load and rest days.',
      tips: ['Monitor HRV trends for load management', 'Active recovery between sessions', 'Foam rolling and mobility work', 'Sleep 7-8 hours consistently'],
    },
  },

  OV: {
    training: {
      title: 'Peak Performance',
      summary: 'High intensity, power work, chase PRs. This is your hormonal peak.',
      details: 'Estrogen peaks around ovulation, boosting strength, power, and pain tolerance. This is your window for personal records.',
      tips: ['Go for PRs and max efforts', 'High-intensity intervals and power work', 'Plyometrics and explosive movements', 'Monitor for joint laxity — warm up thoroughly'],
    },
    nutrition: {
      title: 'Power Fuel',
      summary: 'High protein, maintain carbs. Support the intensity with quality fuel.',
      details: 'Your body needs quality fuel to support peak performance. Maintain carbohydrate intake and increase protein.',
      tips: ['High protein: 2g+ per kg bodyweight', 'Pre-workout meal 2-3 hours before', 'Post-workout protein within 30 minutes', 'Stay hydrated — performance drops with dehydration'],
    },
    recovery: {
      title: 'Active Recovery',
      summary: 'Keep moving between sessions. Monitor fatigue — you may feel invincible but track load.',
      details: 'You may feel invincible during ovulation, but connective tissues are more lax due to high estrogen. Warm up thoroughly.',
      tips: ['Thorough warm-ups are essential', 'Watch for joint instability signs', 'Active recovery: swimming, cycling', 'Track total training load to avoid overreaching'],
    },
  },

  ML: {
    training: {
      title: 'Steady Strength',
      summary: 'Maintain intensity, shift to endurance work. Progesterone is rising.',
      details: 'Progesterone rises after ovulation, increasing body temperature and metabolic rate. Maintain training but shift toward endurance.',
      tips: ['Maintain strength training 3-4x per week', 'Shift some sessions toward endurance', 'Slightly reduce max effort attempts', 'Monitor body temperature during exercise'],
    },
    nutrition: {
      title: 'Increase Fuel',
      summary: 'Add 100-300 kcal daily. Your body needs more energy now.',
      details: 'Your basal metabolic rate increases during the luteal phase. Your body genuinely needs more fuel.',
      tips: ['Increase daily intake by 100-300 kcal', 'Add an extra snack between meals', 'Complex carbs help with serotonin production', 'Don\'t ignore increased hunger — it\'s hormonal'],
    },
    recovery: {
      title: 'Extra Rest',
      summary: 'Prioritize sleep and stress management. Your body is working harder.',
      details: 'Progesterone can disrupt sleep quality and increase perceived effort during training. Prioritize recovery.',
      tips: ['Aim for 8+ hours of sleep', 'Cool your bedroom — progesterone raises body temp', 'Stress management: meditation, breathing exercises', 'Gentle evening stretching routine'],
    },
  },

  LL: {
    training: {
      title: 'Mindful Movement',
      summary: 'Reduce intensity, yoga, walking. Listen to your body\'s signals.',
      details: 'Both estrogen and progesterone are dropping rapidly. PMS symptoms may appear. Dial back intensity.',
      tips: ['Reduce training intensity by 20-30%', 'Yoga and Pilates are excellent choices', 'Walking and light cardio', 'Skip high-impact if you feel bloated or fatigued'],
    },
    nutrition: {
      title: 'Support & Soothe',
      summary: 'B6, magnesium, carb cycling. Combat PMS with nutrition.',
      details: 'Strategic nutrition can significantly reduce PMS symptoms. B6, magnesium, and smart carbohydrate timing help.',
      tips: ['Vitamin B6: bananas, chickpeas, potatoes', 'Magnesium-rich foods: dark chocolate, nuts', 'Carb cycling: higher carbs on harder days', 'Reduce caffeine and alcohol to ease symptoms'],
    },
    recovery: {
      title: 'Rest Priority',
      summary: 'Reduce training load. Sleep is your best performance tool right now.',
      details: 'Your body is preparing for menstruation. Recovery and rest are your primary training tools this week.',
      tips: ['Sleep is your #1 priority', 'Hot baths with epsom salts', 'Journaling or meditation for mood', 'Give yourself permission to rest'],
    },
  },

  perimenopause: {
    training: {
      title: 'Adapt Daily',
      summary: 'Follow HRV and how you feel. Some days are power days, some are rest days.',
      details: 'Hormonal fluctuations during perimenopause are unpredictable. Daily adaptation is the most effective strategy.',
      tips: ['Check HRV every morning before deciding intensity', 'Resistance training 3-4x per week for bone density', 'Include sprint interval training (SIT) sessions', 'Flexibility with your plan is strength, not weakness'],
    },
    nutrition: {
      title: 'Foundation Focus',
      summary: 'Calcium, Vitamin D, high protein. Support bone density and muscle mass.',
      details: 'Declining estrogen affects bone density and muscle mass. Nutritional strategy should focus on maintaining both.',
      tips: ['Protein at every meal: 30g+ per serving', 'Calcium: 1200mg daily', 'Vitamin D: 2000-4000 IU daily', 'Creatine supplementation may help (3-5g daily)'],
    },
    recovery: {
      title: 'Sleep First',
      summary: 'Consistent sleep schedule is non-negotiable. Stress reduction techniques daily.',
      details: 'Sleep disruption is one of the most impactful perimenopause symptoms. Prioritizing sleep quality has cascading benefits.',
      tips: ['Same bedtime and wake time every day', 'Cool bedroom: 65-68\u00B0F / 18-20\u00B0C', 'No screens 1 hour before bed', 'Consider tart cherry juice for natural melatonin'],
    },
  },

  menopause: {
    training: {
      title: 'Strength Priority',
      summary: 'Resistance training for bone density. 3-4 sessions per week minimum.',
      details: 'Post-menopause, maintaining bone density and muscle mass is critical. Resistance training is the most effective intervention.',
      tips: ['Heavy resistance training 3-4x per week', 'Include impact exercise: jumping, bounding', 'Balance and stability work prevents falls', 'Consistency matters more than intensity'],
    },
    nutrition: {
      title: 'Protein Forward',
      summary: 'High protein at every meal, calcium, Vitamin D. Protect what you\'ve built.',
      details: 'Without estrogen\'s anabolic support, protein intake becomes even more critical for maintaining muscle mass.',
      tips: ['40g protein per meal for optimal synthesis', 'Calcium: 1200-1500mg daily', 'Vitamin D: test levels, supplement to 50+ ng/mL', 'Creatine 3-5g daily supports muscle and brain'],
    },
    recovery: {
      title: 'Consistent Rhythm',
      summary: 'Same sleep/wake times. Recovery is about consistency, not intensity.',
      details: 'Without hormonal cycles driving variability, your body thrives on consistent routines.',
      tips: ['Fixed sleep and wake times', 'Daily walking for cardiovascular health', 'Stress management as daily practice', 'Regular health check-ups and bone density scans'],
    },
  },
};

// ---------------------------------------------------------------------------
// Exported helper functions
// ---------------------------------------------------------------------------

export function getPhaseForCycleDay(
  cycleDay: number,
  cycleLength: number = DEFAULT_CYCLE_LENGTH,
): PhaseName {
  const s = cycleLength / 28;
  const day = ((cycleDay - 1) % cycleLength) + 1;

  if (day <= Math.round(4 * s)) return 'EF';
  if (day <= Math.round(13 * s)) return 'MF';
  if (day <= Math.round(16 * s)) return 'OV';
  if (day <= Math.round(21 * s)) return 'ML';
  return 'LL';
}

export function getBiomeForPhase(phase: PhaseName | string): BiomeLabel {
  switch (phase) {
    case 'EF': return 'The Cave';
    case 'MF': return 'The Plains';
    case 'OV': return 'The Summit';
    case 'ML': return 'The Forest';
    case 'LL': return 'The Forest';
    case 'perimenopause': return 'The Tides';
    case 'menopause': return 'The Horizon';
    default: return 'The Plains';
  }
}

export function getConfidenceLabel(score: number): 'High' | 'Medium' | 'Learning' {
  if (score >= 0.7) return 'High';
  if (score >= 0.5) return 'Medium';
  return 'Learning';
}

export function getReadinessLabel(score: number): 'green' | 'amber' | 'red' {
  if (score >= 70) return 'green';
  if (score >= 40) return 'amber';
  return 'red';
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function isRecentCheckIn(checkIn: CheckIn, windowDays: number = RECENT_CHECK_IN_WINDOW_DAYS): boolean {
  if (!checkIn.date) return false;
  const checkInDate = new Date(checkIn.date);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);
  return checkInDate >= cutoff;
}

function inferPhaseFromCheckIns(checkIns: CheckIn[]): PhaseName | null {
  if (!checkIns || checkIns.length === 0) return null;
  const recent = checkIns.filter((c) => isRecentCheckIn(c));
  if (recent.length === 0) return null;

  const avgEnergy = average(recent.map((c) => c.energy ?? 0).filter((v) => v > 0));
  const avgMood = average(recent.map((c) => c.mood ?? 0).filter((v) => v > 0));
  if (avgEnergy === 0 && avgMood === 0) return null;

  const combined = (avgEnergy + avgMood) / 2;
  if (combined <= 3) return 'EF';
  if (combined <= 5) return 'LL';
  if (combined <= 7) return 'MF';
  return 'OV';
}

function calculateReadiness(
  checkIns: CheckIn[],
  phase: PhaseName | string,
  wearableHrv?: number | null,
  wearableRestingHr?: number | null,
): number {
  const recent = (checkIns ?? []).filter((c) => isRecentCheckIn(c));
  const metrics: number[] = [];

  const energyValues = recent.map((c) => c.energy).filter((v): v is number => v != null && v > 0);
  const sleepValues = recent.map((c) => c.sleep_quality).filter((v): v is number => v != null && v > 0);
  const moodValues = recent.map((c) => c.mood).filter((v): v is number => v != null && v > 0);
  const stressValues = recent.map((c) => c.stress).filter((v): v is number => v != null && v > 0);
  const perfValues = recent.map((c) => c.performance_feel).filter((v): v is number => v != null && v > 0);

  if (energyValues.length > 0) metrics.push(average(energyValues));
  if (sleepValues.length > 0) metrics.push(average(sleepValues));
  if (moodValues.length > 0) metrics.push(average(moodValues));
  if (stressValues.length > 0) metrics.push(11 - average(stressValues));
  if (perfValues.length > 0) metrics.push(average(perfValues));

  let base: number;
  if (metrics.length > 0) {
    base = (average(metrics) / 10) * 100;
  } else {
    base = 50;
  }

  let wearableAdjustment = 0;
  if (wearableHrv != null && wearableRestingHr != null) {
    const hrvSignal = wearableHrv > 50 ? 1 : wearableHrv > 30 ? 0 : -1;
    const hrSignal = wearableRestingHr < 60 ? 1 : wearableRestingHr < 75 ? 0 : -1;
    wearableAdjustment = ((hrvSignal + hrSignal) / 2) * 10;
  }

  let phaseModifier = 0;
  if (phase === 'EF') phaseModifier = -5;
  if (phase === 'LL') phaseModifier = -10;
  if (phase === 'OV') phaseModifier = 10;
  if (phase === 'MF') phaseModifier = 5;

  return clamp(Math.round(base + wearableAdjustment + phaseModifier), 0, 100);
}

function calculateConfidence(input: PhaseInput): number {
  let score = 0.3;
  if (input.cycle_day != null) score += 0.2;

  const hasRecentCheckIns =
    input.recent_check_ins?.length > 0 &&
    input.recent_check_ins.some((c) => isRecentCheckIn(c));
  if (hasRecentCheckIns) score += 0.2;

  if (input.wearable_snapshot?.hrv != null || input.wearable_snapshot?.resting_hr != null) {
    score += 0.15;
  }

  if (input.historical_phases && input.historical_phases.length > HISTORY_THRESHOLD_DAYS) {
    score += 0.15;
  }

  return Math.min(score, 1.0);
}

function selectRecommendations(
  phase: PhaseName | string,
  lifeStage: string,
): PhaseRecommendations {
  if (lifeStage === 'perimenopause') return RECOMMENDATIONS.perimenopause;
  if (lifeStage === 'menopause') return RECOMMENDATIONS.menopause;

  return RECOMMENDATIONS[phase] ?? RECOMMENDATIONS.MF;
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export function computePhase(input: PhaseInput): PhaseOutput {
  const lifeStage = input.life_stage ?? 'menstrual_cycle';
  const cycleLength = input.cycle_length_avg ?? DEFAULT_CYCLE_LENGTH;
  const checkIns = input.recent_check_ins ?? [];

  let phase: PhaseName | string;
  let biome: BiomeLabel;
  let confidence: number;

  if (lifeStage === 'perimenopause') {
    phase = inferPhaseFromCheckIns(checkIns) ?? 'ML';
    biome = 'The Tides';
    confidence = Math.min(calculateConfidence(input), 0.75);
  } else if (lifeStage === 'menopause') {
    phase = 'menopause';
    biome = 'The Horizon';
    confidence = calculateConfidence(input);
  } else {
    if (input.cycle_day != null) {
      phase = getPhaseForCycleDay(input.cycle_day, cycleLength);
      biome = getBiomeForPhase(phase);
      confidence = calculateConfidence(input);
    } else {
      const inferred = inferPhaseFromCheckIns(checkIns);
      phase = inferred ?? 'MF';
      biome = getBiomeForPhase(phase);
      confidence = inferred
        ? Math.max(calculateConfidence(input) - 0.1, 0.3)
        : 0.3;
    }
  }

  const readiness = calculateReadiness(
    checkIns,
    phase,
    input.wearable_snapshot?.hrv,
    input.wearable_snapshot?.resting_hr,
  );

  const recommendations = selectRecommendations(phase, lifeStage);

  return {
    phase_name: phase,
    biome_label: biome,
    cycle_day: input.cycle_day ?? null,
    confidence_score: parseFloat(confidence.toFixed(2)),
    readiness_score: readiness,
    recommendations,
    algorithm_version: ALGORITHM_VERSION,
  };
}
