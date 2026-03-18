-- ============================================================================
-- Wild.AI – Complete Supabase Database Schema
-- Run this file against a fresh Supabase Postgres database.
-- ============================================================================

-- 1. Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- 2. Tables
-- ============================================================================

-- ---- users -----------------------------------------------------------------
-- Core user profile created during onboarding.
CREATE TABLE users (
    id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               text        UNIQUE NOT NULL,
    created_at          timestamptz DEFAULT now(),
    life_stage          text        NOT NULL CHECK (life_stage IN ('menstrual_cycle', 'perimenopause', 'menopause')),
    avatar_name         text        NOT NULL,
    sport_type          text        NOT NULL,
    experience_level    text        NOT NULL CHECK (experience_level IN ('beginner', 'recreational', 'competitive', 'elite')),
    timezone            text        DEFAULT 'UTC',
    region              text        DEFAULT 'US',
    goal                text        CHECK (goal IN ('performance', 'health', 'balance', 'recovery')),
    consent_version     text,
    consent_granted_at  timestamptz
);
COMMENT ON TABLE users IS 'Core user profile created during onboarding. One row per authenticated user.';

-- ---- consent_records -------------------------------------------------------
-- Append-only ledger of every consent action (grant / revoke).
CREATE TABLE consent_records (
    id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid        REFERENCES users(id) ON DELETE CASCADE,
    consent_type    text        NOT NULL CHECK (consent_type IN ('health_processing', 'analytics', 'marketing')),
    granted         boolean     NOT NULL,
    version         text        NOT NULL,
    timestamp       timestamptz DEFAULT now()
);
COMMENT ON TABLE consent_records IS 'Append-only ledger of every consent action. No updates or deletes permitted.';

-- ---- audit_log -------------------------------------------------------------
-- Immutable audit trail kept for a minimum of 7 years.
CREATE TABLE audit_log (
    id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid        REFERENCES users(id) ON DELETE SET NULL,
    action          text        NOT NULL,
    entity_type     text        NOT NULL,
    entity_id       text,
    performed_at    timestamptz DEFAULT now(),
    ip_hash         text
);
COMMENT ON TABLE audit_log IS 'Immutable audit trail (7-year retention). INSERT only – no updates or deletes.';

-- ---- cycle_logs ------------------------------------------------------------
-- Menstrual cycle tracking data entered manually or synced from wearables.
CREATE TABLE cycle_logs (
    id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             uuid        REFERENCES users(id) ON DELETE CASCADE,
    period_start_date   date        NOT NULL,
    cycle_length_days   integer     DEFAULT 28,
    period_length_days  integer     DEFAULT 5,
    is_confirmed        boolean     DEFAULT false,
    source              text        DEFAULT 'manual' CHECK (source IN ('manual', 'predicted', 'wearable')),
    created_at          timestamptz DEFAULT now()
);
COMMENT ON TABLE cycle_logs IS 'Menstrual cycle tracking data – manual entries, predictions, or wearable imports.';

-- ---- phase_states ----------------------------------------------------------
-- Daily computed hormonal phase / biome state for each user.
CREATE TABLE phase_states (
    id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             uuid        REFERENCES users(id) ON DELETE CASCADE,
    date                date        NOT NULL,
    phase_name          text        NOT NULL,
    biome_label         text        NOT NULL,
    cycle_day           integer,
    confidence_score    numeric(3,2) DEFAULT 0.3,
    life_stage          text        NOT NULL,
    algorithm_version   text        NOT NULL,
    readiness_score     integer     DEFAULT 50,
    created_at          timestamptz DEFAULT now(),
    UNIQUE(user_id, date)
);
COMMENT ON TABLE phase_states IS 'Daily computed hormonal phase and biome state for each user. One row per user per date.';

-- ---- check_ins -------------------------------------------------------------
-- Daily subjective wellness check-in from the user.
CREATE TABLE check_ins (
    id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             uuid        REFERENCES users(id) ON DELETE CASCADE,
    date                date        NOT NULL,
    phase_state_id      uuid        REFERENCES phase_states(id),
    energy              integer     CHECK (energy BETWEEN 1 AND 10),
    sleep_quality       integer     CHECK (sleep_quality BETWEEN 1 AND 10),
    mood                integer     CHECK (mood BETWEEN 1 AND 10),
    stress              integer     CHECK (stress BETWEEN 1 AND 10),
    performance_feel    integer     CHECK (performance_feel BETWEEN 1 AND 10),
    extended_symptoms   jsonb       DEFAULT '{}',
    created_at          timestamptz DEFAULT now()
);
COMMENT ON TABLE check_ins IS 'Daily subjective wellness check-in capturing energy, sleep, mood, stress, and performance feel.';

-- ---- recommendations_content -----------------------------------------------
-- Science-team-curated recommendation templates keyed by phase and life stage.
CREATE TABLE recommendations_content (
    id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase               text        NOT NULL,
    life_stage          text        NOT NULL,
    type                text        NOT NULL CHECK (type IN ('training', 'nutrition', 'recovery')),
    content             jsonb       NOT NULL,
    reviewed_by         text,
    reviewed_at         timestamptz,
    algorithm_version   text        NOT NULL,
    status              text        DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'archived')),
    created_at          timestamptz DEFAULT now()
);
COMMENT ON TABLE recommendations_content IS 'Science-team-curated recommendation templates. Managed via admin tooling; read-only for end users.';

-- ---- recommendations -------------------------------------------------------
-- Personalised recommendations surfaced to a user on a given date.
CREATE TABLE recommendations (
    id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             uuid        REFERENCES users(id) ON DELETE CASCADE,
    date                date        NOT NULL,
    phase_state_id      uuid        REFERENCES phase_states(id),
    type                text        NOT NULL CHECK (type IN ('training', 'nutrition', 'recovery')),
    content_id          uuid        REFERENCES recommendations_content(id),
    confidence_score    numeric(3,2),
    algorithm_version   text        NOT NULL,
    created_at          timestamptz DEFAULT now()
);
COMMENT ON TABLE recommendations IS 'Personalised recommendations surfaced to a user on a given date, linked to a phase state and content template.';

-- ---- workout_logs ----------------------------------------------------------
-- Workout / activity entries logged manually or imported from wearables.
CREATE TABLE workout_logs (
    id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             uuid        REFERENCES users(id) ON DELETE CASCADE,
    date                date        NOT NULL,
    phase_state_id      uuid        REFERENCES phase_states(id),
    activity_type       text        NOT NULL,
    duration_minutes    integer     NOT NULL,
    rpe                 integer     CHECK (rpe BETWEEN 1 AND 10),
    source              text        DEFAULT 'manual' CHECK (source IN ('manual', 'apple_health', 'zepp')),
    post_workout_feel   text,
    notes               text,
    created_at          timestamptz DEFAULT now()
);
COMMENT ON TABLE workout_logs IS 'Workout / activity entries logged manually or imported from Apple Health or Zepp.';

-- ---- wearable_connections --------------------------------------------------
-- OAuth connection state for each wearable provider per user.
CREATE TABLE wearable_connections (
    id                          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                     uuid        REFERENCES users(id) ON DELETE CASCADE,
    provider                    text        NOT NULL CHECK (provider IN ('apple_health', 'zepp')),
    last_sync_at                timestamptz,
    status                      text        DEFAULT 'disconnected' CHECK (status IN ('active', 'error', 'disconnected')),
    access_token_encrypted      text,
    refresh_token_encrypted     text,
    created_at                  timestamptz DEFAULT now(),
    UNIQUE(user_id, provider)
);
COMMENT ON TABLE wearable_connections IS 'OAuth connection state for each wearable provider per user. Tokens stored encrypted.';

-- ---- wearable_snapshots ----------------------------------------------------
-- Daily health metrics snapshot pulled from a wearable provider.
CREATE TABLE wearable_snapshots (
    id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             uuid        REFERENCES users(id) ON DELETE CASCADE,
    date                date        NOT NULL,
    provider            text        NOT NULL CHECK (provider IN ('apple_health', 'zepp')),
    hrv                 numeric(6,2),
    resting_hr          integer,
    sleep_score         numeric(5,2),
    sleep_duration_mins integer,
    steps               integer,
    raw_payload         jsonb,
    created_at          timestamptz DEFAULT now()
);
COMMENT ON TABLE wearable_snapshots IS 'Daily health metrics snapshot from a wearable provider. raw_payload should be treated as encrypted at rest.';


-- 3. Row Level Security
-- ============================================================================

-- Enable RLS on every table
ALTER TABLE users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log               ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_logs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_states            ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins               ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_connections    ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_snapshots      ENABLE ROW LEVEL SECURITY;

-- ---- users -----------------------------------------------------------------
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ---- consent_records (append-only: insert only) ----------------------------
CREATE POLICY "consent_records_insert_own" ON consent_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "consent_records_select_own" ON consent_records
    FOR SELECT USING (auth.uid() = user_id);

-- ---- audit_log (insert only, no deletes ever) -----------------------------
CREATE POLICY "audit_log_insert_authenticated" ON audit_log
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "audit_log_select_own" ON audit_log
    FOR SELECT USING (auth.uid() = user_id);

-- ---- cycle_logs ------------------------------------------------------------
CREATE POLICY "cycle_logs_select_own" ON cycle_logs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cycle_logs_insert_own" ON cycle_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cycle_logs_update_own" ON cycle_logs
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cycle_logs_delete_own" ON cycle_logs
    FOR DELETE USING (auth.uid() = user_id);

-- ---- phase_states ----------------------------------------------------------
CREATE POLICY "phase_states_select_own" ON phase_states
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "phase_states_insert_own" ON phase_states
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "phase_states_update_own" ON phase_states
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---- check_ins -------------------------------------------------------------
CREATE POLICY "check_ins_select_own" ON check_ins
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "check_ins_insert_own" ON check_ins
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "check_ins_update_own" ON check_ins
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "check_ins_delete_own" ON check_ins
    FOR DELETE USING (auth.uid() = user_id);

-- ---- recommendations_content (read-only for authenticated users) -----------
CREATE POLICY "recommendations_content_select_authenticated" ON recommendations_content
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- ---- recommendations -------------------------------------------------------
CREATE POLICY "recommendations_select_own" ON recommendations
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "recommendations_insert_own" ON recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---- workout_logs ----------------------------------------------------------
CREATE POLICY "workout_logs_select_own" ON workout_logs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "workout_logs_insert_own" ON workout_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_logs_update_own" ON workout_logs
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_logs_delete_own" ON workout_logs
    FOR DELETE USING (auth.uid() = user_id);

-- ---- wearable_connections --------------------------------------------------
CREATE POLICY "wearable_connections_select_own" ON wearable_connections
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wearable_connections_insert_own" ON wearable_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wearable_connections_update_own" ON wearable_connections
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wearable_connections_delete_own" ON wearable_connections
    FOR DELETE USING (auth.uid() = user_id);

-- ---- wearable_snapshots ----------------------------------------------------
CREATE POLICY "wearable_snapshots_select_own" ON wearable_snapshots
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wearable_snapshots_insert_own" ON wearable_snapshots
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 4. Indexes
-- ============================================================================

-- Composite indexes on (user_id, date) for time-series queries
CREATE INDEX idx_phase_states_user_date       ON phase_states       (user_id, date);
CREATE INDEX idx_check_ins_user_date          ON check_ins          (user_id, date);
CREATE INDEX idx_workout_logs_user_date       ON workout_logs       (user_id, date);
CREATE INDEX idx_wearable_snapshots_user_date ON wearable_snapshots (user_id, date);

-- user_id indexes for FK look-ups on all tables with user_id
CREATE INDEX idx_consent_records_user         ON consent_records        (user_id);
CREATE INDEX idx_audit_log_user               ON audit_log              (user_id);
CREATE INDEX idx_cycle_logs_user              ON cycle_logs             (user_id);
CREATE INDEX idx_recommendations_user         ON recommendations        (user_id);
CREATE INDEX idx_wearable_connections_user    ON wearable_connections   (user_id);

-- Status index for filtering approved content
CREATE INDEX idx_recommendations_content_status ON recommendations_content (status);
