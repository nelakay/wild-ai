// Life stages
export type LifeStage = 'menstrual_cycle' | 'perimenopause' | 'menopause';

// Phase names for menstrual cycle
// EF = Early Follicular (menstruation), MF = Mid Follicular, OV = Ovulation,
// ML = Mid Luteal, LL = Late Luteal
export type PhaseName = 'EF' | 'MF' | 'OV' | 'ML' | 'LL';

// Biome labels matching phases
export type BiomeLabel = 'The Cave' | 'The Plains' | 'The Summit' | 'The Forest' | 'The Tides' | 'The Horizon';

// Experience levels
export type ExperienceLevel = 'beginner' | 'recreational' | 'competitive' | 'elite';

// Wearable providers (V1)
export type WearableProvider = 'zepp' | 'apple_health';

// Recommendation types
export type RecommendationType = 'training' | 'nutrition' | 'recovery';

// Content status for science-backed recommendations
export type ContentStatus = 'draft' | 'approved' | 'archived';

// Consent types
export type ConsentType = 'health_processing' | 'analytics' | 'marketing';

// Workout source
export type WorkoutSource = 'manual' | 'apple_health' | 'zepp';

// Cycle source
export type CycleSource = 'manual' | 'predicted' | 'wearable';

// Wearable connection status
export type WearableStatus = 'active' | 'error' | 'disconnected';

// User goal
export type UserGoal = 'performance' | 'health' | 'balance' | 'recovery';

// --- Database model interfaces ---

export interface User {
  id: string;
  email: string;
  created_at: string;
  life_stage: LifeStage;
  avatar_name: string;
  sport_type: string;
  experience_level: ExperienceLevel;
  timezone: string;
  region: string;
  goal: UserGoal;
  consent_version: string;
  consent_granted_at: string;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  granted: boolean;
  version: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  performed_at: string;
  ip_hash: string;
}

export interface CycleLog {
  id: string;
  user_id: string;
  period_start_date: string;
  cycle_length_days: number;
  period_length_days: number;
  is_confirmed: boolean;
  source: CycleSource;
}

export interface PhaseState {
  id: string;
  user_id: string;
  date: string;
  phase_name: PhaseName | string;
  biome_label: BiomeLabel;
  cycle_day: number | null;
  confidence_score: number;
  life_stage: LifeStage;
  algorithm_version: string;
  readiness_score: number;
}

export interface CheckIn {
  id: string;
  user_id: string;
  date: string;
  phase_state_id: string;
  energy: number;
  sleep_quality: number;
  mood: number;
  stress: number;
  performance_feel: number;
  extended_symptoms: Record<string, number> | null;
  notes: string | null;
}

export interface RecommendationContent {
  id: string;
  phase: PhaseName | string;
  life_stage: LifeStage;
  type: RecommendationType;
  content: {
    title: string;
    summary: string;
    details: string;
    tips: string[];
  };
  reviewed_by: string | null;
  reviewed_at: string | null;
  algorithm_version: string;
  status: ContentStatus;
}

export interface Recommendation {
  id: string;
  user_id: string;
  date: string;
  phase_state_id: string;
  type: RecommendationType;
  content_id: string;
  confidence_score: number;
  algorithm_version: string;
  content?: RecommendationContent;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  date: string;
  phase_state_id: string;
  activity_type: string;
  duration_minutes: number;
  rpe: number;
  source: WorkoutSource;
  post_workout_feel: string | null;
  notes: string | null;
}

export interface WearableConnection {
  id: string;
  user_id: string;
  provider: WearableProvider;
  last_sync_at: string | null;
  status: WearableStatus;
}

export interface WearableSnapshot {
  id: string;
  user_id: string;
  date: string;
  provider: WearableProvider;
  hrv: number | null;
  resting_hr: number | null;
  sleep_score: number | null;
  sleep_duration_mins: number | null;
  steps: number | null;
  raw_payload: Record<string, unknown> | null;
}

// --- Phase Engine types ---

export interface PhaseInput {
  life_stage: LifeStage;
  cycle_day?: number | null;
  cycle_length_avg?: number | null;
  recent_check_ins: CheckIn[];
  wearable_snapshot?: WearableSnapshot | null;
  historical_phases: PhaseState[];
  algorithm_version: string;
}

export interface PhaseOutput {
  phase_name: PhaseName | string;
  biome_label: BiomeLabel;
  cycle_day: number | null;
  confidence_score: number;
  readiness_score: number;
  recommendations: {
    training: RecommendationSummary;
    nutrition: RecommendationSummary;
    recovery: RecommendationSummary;
  };
  algorithm_version: string;
}

export interface RecommendationSummary {
  title: string;
  summary: string;
  details: string;
  tips: string[];
  why: string;
}

// --- Onboarding types ---

export interface OnboardingData {
  life_stage: LifeStage | null;
  avatar_name: string;
  sport_type: string;
  experience_level: ExperienceLevel | null;
  goal: UserGoal | null;
  last_period_start: string | null;
  cycle_length: number;
  pre_period_feeling: string | null;
  sleep_quality: string | null;
  energy_variability: string | null;
}

// --- Theme ---
export type ThemeMode = 'light' | 'dark' | 'system';
