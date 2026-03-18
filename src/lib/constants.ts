export const BIOME_CONFIG = {
  EF: {
    name: 'The Cave',
    color: '#3730A3',
    gradient: 'from-indigo-900 to-indigo-700',
    terrain: 'Rest, restore, go inward',
    icon: '\u{1F319}',
    days: '1\u20134',
  },
  MF: {
    name: 'The Plains',
    color: '#059669',
    gradient: 'from-emerald-700 to-emerald-500',
    terrain: 'Rising energy, build momentum',
    icon: '\u{1F33F}',
    days: '5\u201313',
  },
  OV: {
    name: 'The Summit',
    color: '#D97706',
    gradient: 'from-amber-600 to-amber-400',
    terrain: 'Peak power, high performance',
    icon: '\u26F0\uFE0F',
    days: '14\u201316',
  },
  ML: {
    name: 'The Forest',
    color: '#7C3AED',
    gradient: 'from-purple-700 to-purple-500',
    terrain: 'Endurance, mindfulness, slow burn',
    icon: '\u{1F332}',
    days: '17\u201321',
  },
  LL: {
    name: 'The Forest',
    color: '#7C3AED',
    gradient: 'from-purple-700 to-purple-500',
    terrain: 'Pre-menstrual, wind down',
    icon: '\u{1F332}',
    days: '22\u201328',
  },
  perimenopause: {
    name: 'The Tides',
    color: '#0891B2',
    gradient: 'from-cyan-700 to-cyan-500',
    terrain: 'Variable, fluid, adapt daily',
    icon: '\u{1F30A}',
    days: 'Variable',
  },
  menopause: {
    name: 'The Horizon',
    color: '#E11D48',
    gradient: 'from-rose-700 to-rose-500',
    terrain: 'Steady state, maintenance mastery',
    icon: '\u{1F305}',
    days: 'Ongoing',
  },
} as const;

export type BiomeKey = keyof typeof BIOME_CONFIG;

export const ACTIVITY_TYPES = [
  'Running', 'Cycling', 'Swimming', 'Weightlifting', 'CrossFit',
  'Yoga', 'Pilates', 'HIIT', 'Walking', 'Hiking',
  'Rock Climbing', 'Rowing', 'Kayaking', 'Skiing', 'Snowboarding',
  'Soccer', 'Basketball', 'Tennis', 'Volleyball', 'Martial Arts',
  'Boxing', 'Dance', 'Gymnastics', 'Track & Field', 'Triathlon',
  'Surfing', 'Skating', 'Golf', 'Badminton', 'Table Tennis',
  'Elliptical', 'Stair Climbing', 'Jump Rope', 'Other',
] as const;

export const SPORT_TYPES = [
  'Running', 'Cycling', 'Swimming', 'Weightlifting', 'CrossFit',
  'Yoga', 'Team Sports', 'Martial Arts', 'Dance', 'Triathlon',
  'Hiking', 'General Fitness', 'Other',
] as const;

export const ALGORITHM_VERSION = '0.1.0';

export const DEFAULT_CYCLE_LENGTH = 28;
export const MIN_CYCLE_LENGTH = 21;
export const MAX_CYCLE_LENGTH = 45;

export const READINESS_THRESHOLDS = {
  high: 70,
  medium: 40,
} as const;

export const CONFIDENCE_LABELS = {
  high: 'High',
  medium: 'Medium',
  learning: 'Learning',
} as const;

export const PHASE_DAY_RANGES = {
  EF: { start: 1, end: 4 },
  MF: { start: 5, end: 13 },
  OV: { start: 14, end: 16 },
  ML: { start: 17, end: 21 },
  LL: { start: 22, end: 28 },
} as const;

// Human-readable phase labels
export const PHASE_LABELS: Record<string, string> = {
  EF: 'Early Follicular',
  MF: 'Mid Follicular',
  OV: 'Ovulation',
  ML: 'Mid Luteal',
  LL: 'Late Luteal',
  perimenopause: 'Perimenopause',
  menopause: 'Menopause',
};
