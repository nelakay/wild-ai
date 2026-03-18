-- ============================================================================
-- Wild.AI – Complete Database Migration
-- Run this entire file in Supabase SQL Editor (supabase.com → SQL Editor)
-- Combines: schema.sql + seed.sql
-- ============================================================================

-- ============================================================================
-- 1. SCHEMA
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---- users -----------------------------------------------------------------
CREATE TABLE users (
    id                  uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email               text        UNIQUE NOT NULL,
    created_at          timestamptz DEFAULT now(),
    life_stage          text        NOT NULL CHECK (life_stage IN ('menstrual_cycle', 'perimenopause', 'menopause')),
    avatar_name         text        NOT NULL,
    sport_type          text        NOT NULL,
    experience_level    text        NOT NULL CHECK (experience_level IN ('beginner', 'recreational', 'competitive', 'elite')),
    timezone            text        DEFAULT 'UTC',
    region              text        DEFAULT 'US',
    goal                text        CHECK (goal IN ('performance', 'health', 'balance', 'recovery')),
    onboarding_complete boolean     DEFAULT false,
    consent_version     text,
    consent_granted_at  timestamptz
);

-- ---- consent_records -------------------------------------------------------
CREATE TABLE consent_records (
    id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid        REFERENCES users(id) ON DELETE CASCADE,
    consent_type    text        NOT NULL CHECK (consent_type IN ('health_processing', 'analytics', 'marketing')),
    granted         boolean     NOT NULL,
    version         text        NOT NULL,
    timestamp       timestamptz DEFAULT now()
);

-- ---- audit_log -------------------------------------------------------------
CREATE TABLE audit_log (
    id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid        REFERENCES users(id) ON DELETE SET NULL,
    action          text        NOT NULL,
    entity_type     text        NOT NULL,
    entity_id       text,
    performed_at    timestamptz DEFAULT now(),
    ip_hash         text
);

-- ---- cycle_logs ------------------------------------------------------------
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

-- ---- phase_states ----------------------------------------------------------
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

-- ---- check_ins -------------------------------------------------------------
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
    created_at          timestamptz DEFAULT now(),
    UNIQUE(user_id, date)
);

-- ---- recommendations_content -----------------------------------------------
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

-- ---- recommendations -------------------------------------------------------
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

-- ---- workout_logs ----------------------------------------------------------
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

-- ---- wearable_connections --------------------------------------------------
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

-- ---- wearable_snapshots ----------------------------------------------------
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

-- ============================================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================================

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

-- users
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- consent_records (append-only)
CREATE POLICY "consent_records_insert_own" ON consent_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "consent_records_select_own" ON consent_records FOR SELECT USING (auth.uid() = user_id);

-- audit_log (insert only)
CREATE POLICY "audit_log_insert_authenticated" ON audit_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "audit_log_select_own" ON audit_log FOR SELECT USING (auth.uid() = user_id);

-- cycle_logs
CREATE POLICY "cycle_logs_all_own" ON cycle_logs FOR ALL USING (auth.uid() = user_id);

-- phase_states
CREATE POLICY "phase_states_select_own" ON phase_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "phase_states_insert_own" ON phase_states FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "phase_states_update_own" ON phase_states FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- check_ins
CREATE POLICY "check_ins_all_own" ON check_ins FOR ALL USING (auth.uid() = user_id);

-- recommendations_content (read-only for authenticated)
CREATE POLICY "recommendations_content_select_authenticated" ON recommendations_content FOR SELECT USING (auth.uid() IS NOT NULL);

-- recommendations
CREATE POLICY "recommendations_select_own" ON recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "recommendations_insert_own" ON recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- workout_logs
CREATE POLICY "workout_logs_all_own" ON workout_logs FOR ALL USING (auth.uid() = user_id);

-- wearable_connections
CREATE POLICY "wearable_connections_all_own" ON wearable_connections FOR ALL USING (auth.uid() = user_id);

-- wearable_snapshots
CREATE POLICY "wearable_snapshots_select_own" ON wearable_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wearable_snapshots_insert_own" ON wearable_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

CREATE INDEX idx_phase_states_user_date       ON phase_states       (user_id, date);
CREATE INDEX idx_check_ins_user_date          ON check_ins          (user_id, date);
CREATE INDEX idx_workout_logs_user_date       ON workout_logs       (user_id, date);
CREATE INDEX idx_wearable_snapshots_user_date ON wearable_snapshots (user_id, date);
CREATE INDEX idx_consent_records_user         ON consent_records    (user_id);
CREATE INDEX idx_audit_log_user               ON audit_log          (user_id);
CREATE INDEX idx_cycle_logs_user              ON cycle_logs         (user_id);
CREATE INDEX idx_recommendations_user         ON recommendations    (user_id);
CREATE INDEX idx_wearable_connections_user    ON wearable_connections (user_id);
CREATE INDEX idx_recommendations_content_status ON recommendations_content (status);

-- ============================================================================
-- 4. SEED DATA: recommendations_content
-- ============================================================================

-- EARLY FOLLICULAR (EF) — Days 1-4
INSERT INTO recommendations_content (phase, life_stage, type, content, reviewed_by, reviewed_at, algorithm_version, status) VALUES
('EF', 'menstrual_cycle', 'training',
 '{"title":"Early Follicular Training","summary":"Focus on low-to-moderate intensity. Hormones are at their lowest, which can feel like a reset. Light movement helps with cramps and mood.","guidelines":["Prioritise low-intensity steady-state cardio (walking, easy cycling, yoga)","Reduce overall training volume by 10-20%","Strength work is fine if energy permits – keep loads moderate","Listen to your body: rest days are valid and productive","Gentle mobility and stretching can alleviate cramping"],"intensity_range":"RPE 3-6","avoid":["High-intensity interval sessions if fatigue or cramping is present","New 1RM attempts"]}',
 'science_team', now(), '0.1.0', 'approved'),
('EF', 'menstrual_cycle', 'nutrition',
 '{"title":"Early Follicular Nutrition","summary":"Iron-rich foods to offset menstrual blood loss. Anti-inflammatory whole foods to manage cramping and inflammation.","guidelines":["Increase iron-rich foods: red meat, lentils, spinach, fortified cereals","Pair plant-based iron with vitamin C for absorption","Include omega-3 fatty acids (salmon, walnuts, flaxseed) for anti-inflammatory support","Stay well hydrated – aim for pale yellow urine","Magnesium-rich foods (dark chocolate, nuts, seeds) may ease cramps","Moderate caffeine; excess can worsen cramps"],"key_nutrients":["iron","vitamin C","omega-3","magnesium"]}',
 'science_team', now(), '0.1.0', 'approved'),
('EF', 'menstrual_cycle', 'recovery',
 '{"title":"Early Follicular Recovery","summary":"Prioritise sleep and gentle restoration. Inflammation and fatigue are common; recovery modalities help manage symptoms.","guidelines":["Aim for 8+ hours of sleep – melatonin is not suppressed by progesterone in this phase","Use heat therapy (hot water bottle, warm baths) for cramp relief","Gentle foam rolling and stretching","Epsom salt baths for magnesium absorption and relaxation","Reduce high-stress commitments where possible"]}',
 'science_team', now(), '0.1.0', 'approved');

-- MID FOLLICULAR (MF) — Days 5-13
INSERT INTO recommendations_content (phase, life_stage, type, content, reviewed_by, reviewed_at, algorithm_version, status) VALUES
('MF', 'menstrual_cycle', 'training',
 '{"title":"Mid Follicular Training","summary":"Rising estrogen boosts energy, pain tolerance, and muscle-building capacity. This is the best window for high-intensity and strength work.","guidelines":["Schedule your hardest sessions here – HIIT, heavy lifts, sprint intervals","Increase training volume and intensity progressively","Estrogen supports tendon and ligament resilience – good time for plyometrics","Motor learning is enhanced – practice complex skills and technique work","Leverage higher pain tolerance for pushing through tough sets"],"intensity_range":"RPE 7-9","avoid":["Under-training – capitalise on this high-energy window"]}',
 'science_team', now(), '0.1.0', 'approved'),
('MF', 'menstrual_cycle', 'nutrition',
 '{"title":"Mid Follicular Nutrition","summary":"Fuel for performance. Estrogen improves insulin sensitivity, so carbohydrate tolerance is at its best.","guidelines":["Increase complex carbohydrates to fuel high-intensity work","Protein intake of 1.6-2.0 g/kg/day for muscle protein synthesis","Leverage improved insulin sensitivity – carb-rich meals around training","Maintain hydration; sweat rates may increase with higher intensity","Include B-vitamins for energy metabolism (whole grains, eggs, legumes)"],"key_nutrients":["complex carbohydrates","protein","B-vitamins"]}',
 'science_team', now(), '0.1.0', 'approved'),
('MF', 'menstrual_cycle', 'recovery',
 '{"title":"Mid Follicular Recovery","summary":"Recovery capacity is enhanced. You can handle higher training loads with shorter recovery windows.","guidelines":["Standard recovery protocols are sufficient – 24-48h between hard sessions","Active recovery (easy swim, walk) between high-intensity days","Sleep remains important – 7-9 hours","Cold-water immersion can be used effectively in this phase","Foam rolling and mobility work post-session"]}',
 'science_team', now(), '0.1.0', 'approved');

-- OVULATION (OV) — Days 14-16
INSERT INTO recommendations_content (phase, life_stage, type, content, reviewed_by, reviewed_at, algorithm_version, status) VALUES
('OV', 'menstrual_cycle', 'training',
 '{"title":"Ovulation Training","summary":"Peak estrogen window. Strength and power are at their highest, but ACL injury risk increases due to ligament laxity.","guidelines":["Peak strength window – attempt PRs and maximal efforts if well-recovered","Power and explosive work (Olympic lifts, sprints) are well-supported","Be mindful of ACL risk: warm up thoroughly, focus on landing mechanics","Neuromuscular activation exercises before plyometrics","Body temperature rises slightly – adjust for heat if training outdoors"],"intensity_range":"RPE 8-10","avoid":["Skipping warm-ups","Excessive single-leg plyometrics without proper activation"]}',
 'science_team', now(), '0.1.0', 'approved'),
('OV', 'menstrual_cycle', 'nutrition',
 '{"title":"Ovulation Nutrition","summary":"Continue fuelling for performance. Estrogen is peaking; support detox pathways and fibre intake.","guidelines":["Cruciferous vegetables (broccoli, kale, Brussels sprouts) support estrogen metabolism","Maintain high protein intake for muscle repair from intense training","Adequate fibre (25-30g/day) supports estrogen clearance","Antioxidant-rich foods (berries, dark leafy greens) combat oxidative stress","Light meals before training to avoid GI distress during high-intensity work"],"key_nutrients":["fibre","cruciferous vegetables","antioxidants","protein"]}',
 'science_team', now(), '0.1.0', 'approved'),
('OV', 'menstrual_cycle', 'recovery',
 '{"title":"Ovulation Recovery","summary":"Core body temperature rises. Sleep may be slightly disrupted. Prioritise cooling strategies.","guidelines":["Cool sleeping environment (18-20C / 64-68F)","Post-training cold-water immersion or cold showers can help regulate temperature","Stay on top of hydration – slight core temp increase means more fluid loss","Active recovery between hard sessions","Monitor for signs of overreaching given the high-intensity bias of this phase"]}',
 'science_team', now(), '0.1.0', 'approved');

-- MID LUTEAL (ML) — Days 17-21
INSERT INTO recommendations_content (phase, life_stage, type, content, reviewed_by, reviewed_at, algorithm_version, status) VALUES
('ML', 'menstrual_cycle', 'training',
 '{"title":"Mid Luteal Training","summary":"Rising progesterone increases core temperature and reduces anabolic capacity. Shift toward moderate, sustained efforts and endurance work.","guidelines":["Shift from max-intensity to moderate steady-state and tempo work","Reduce overall volume by 10-15% compared to mid follicular phase","Endurance capacity can remain strong – good window for longer, easier sessions","Progesterone is catabolic – heavy eccentric work causes more muscle damage now","Pre-cool before training in hot conditions (cold towel, ice slurry)"],"intensity_range":"RPE 5-7","avoid":["Prolonged high-intensity in heat","Heavy eccentric loading"]}',
 'science_team', now(), '0.1.0', 'approved'),
('ML', 'menstrual_cycle', 'nutrition',
 '{"title":"Mid Luteal Nutrition","summary":"Metabolic rate increases by ~100-300 kcal/day. Progesterone impairs carbohydrate access – shift toward more fat and protein.","guidelines":["Increase total caloric intake by 100-300 kcal to match elevated metabolic rate","Increase healthy fat intake (avocado, nuts, olive oil) – body preferentially uses fat","Maintain protein at 1.8-2.2 g/kg/day to counteract progesterone catabolic effects","Reduce high-glycaemic carbs; favour complex carbs to manage insulin resistance","Tart cherry juice or tryptophan-rich foods support serotonin (mood, cravings)"],"key_nutrients":["healthy fats","protein","tryptophan","complex carbohydrates"]}',
 'science_team', now(), '0.1.0', 'approved'),
('ML', 'menstrual_cycle', 'recovery',
 '{"title":"Mid Luteal Recovery","summary":"Core temperature is elevated, sleep quality may start to decline. Prioritise sleep hygiene and recovery modalities.","guidelines":["Cool sleeping environment is critical – progesterone raises basal body temp","Magnesium supplementation (200-400mg) before bed for sleep and cramp prevention","Extend recovery between hard sessions – 48-72 hours","Foam rolling and mobility work post-session","Epsom salt baths for relaxation and magnesium"]}',
 'science_team', now(), '0.1.0', 'approved');

-- LATE LUTEAL (LL) — Days 22-28
INSERT INTO recommendations_content (phase, life_stage, type, content, reviewed_by, reviewed_at, algorithm_version, status) VALUES
('LL', 'menstrual_cycle', 'training',
 '{"title":"Late Luteal Training","summary":"PMS window. Progesterone and estrogen are both declining. Fatigue, mood shifts, and cramps are common. Reduce intensity and honour your body.","guidelines":["Further reduce intensity if symptomatic – RPE 4-6","Favour gentle movement: yoga, walking, light swimming","Maintain some movement to support mood and circulation","Avoid pushing through significant discomfort","This is a recovery-focused phase – training adaptation happens during rest"],"intensity_range":"RPE 4-6","avoid":["Prolonged high-intensity in heat","Heavy eccentric loading","Ignoring PMS symptoms"]}',
 'science_team', now(), '0.1.0', 'approved'),
('LL', 'menstrual_cycle', 'nutrition',
 '{"title":"Late Luteal Nutrition","summary":"Hormones are declining. Cravings and mood shifts peak. Support serotonin, manage inflammation, and nourish gently.","guidelines":["Calcium (1000mg/day) and vitamin D may reduce PMS symptoms","Sodium retention increases – be mindful of bloating triggers","Tart cherry juice or tryptophan-rich foods support serotonin (mood, cravings)","Maintain adequate caloric intake – not the time for restriction","Complex carbs in the evening can support sleep and serotonin","Dark chocolate (70%+) in moderation for magnesium and mood"],"key_nutrients":["calcium","vitamin D","tryptophan","magnesium","complex carbohydrates"]}',
 'science_team', now(), '0.1.0', 'approved'),
('LL', 'menstrual_cycle', 'recovery',
 '{"title":"Late Luteal Recovery","summary":"Sleep quality often declines. Recovery takes longer. Prioritise sleep hygiene and stress management above all.","guidelines":["Cool sleeping environment is critical – progesterone raises basal body temp","Magnesium supplementation (200-400mg) before bed for sleep and cramp prevention","Avoid alcohol – it further disrupts already-compromised sleep","Gentle yoga, meditation, and breathing exercises for stress / PMS management","Epsom salt baths for relaxation and magnesium","Extend recovery between any sessions – 48-72 hours"]}',
 'science_team', now(), '0.1.0', 'approved');

-- PERIMENOPAUSE
INSERT INTO recommendations_content (phase, life_stage, type, content, reviewed_by, reviewed_at, algorithm_version, status) VALUES
('perimenopause', 'perimenopause', 'training',
 '{"title":"Perimenopause Training","summary":"Fluctuating and declining estrogen reduces muscle protein synthesis and bone density stimulus. Heavy resistance training and high-intensity intervals become essential, not optional.","guidelines":["Prioritise heavy resistance training 3-4x/week to counteract muscle loss","Include high-intensity interval training (SIT or HIIT) 2-3x/week for metabolic health","Load-bearing and impact exercises (jumping, running) for bone density maintenance","Sprint interval training (SIT): 30s all-out efforts with full recovery","Avoid chronic moderate-intensity cardio as sole training","Plyometric training stimulates bone remodelling – include box jumps, skipping","Allow adequate warm-up as joint stiffness may increase"],"intensity_range":"RPE 7-9 for intervals, RPE 8-10 for strength","avoid":["Exclusively low-intensity training","Ignoring resistance training","Prolonged fasted training"]}',
 'science_team', now(), '0.1.0', 'approved'),
('perimenopause', 'perimenopause', 'nutrition',
 '{"title":"Perimenopause Nutrition","summary":"Declining estrogen impairs insulin sensitivity and shifts body composition toward central adiposity. Protein timing and anti-inflammatory nutrition are critical.","guidelines":["Protein intake of 2.0-2.4 g/kg/day – higher than cycling women due to anabolic resistance","Front-load protein: 30-40g within 30 minutes of waking and post-training","Reduce refined carbohydrates – insulin sensitivity is declining","Increase omega-3 intake (2-3g EPA/DHA daily) for inflammation and cardiovascular health","Calcium (1200mg/day) and vitamin D (2000 IU/day) for bone protection","Phytoestrogen-rich foods (soy, flaxseed) may modestly ease symptoms","Limit alcohol – it worsens hot flashes, sleep disruption, and fat storage","Creatine monohydrate (3-5g/day) supports muscle and cognitive function"],"key_nutrients":["protein","omega-3","calcium","vitamin D","creatine","phytoestrogens"]}',
 'science_team', now(), '0.1.0', 'approved'),
('perimenopause', 'perimenopause', 'recovery',
 '{"title":"Perimenopause Recovery","summary":"Sleep disruption from vasomotor symptoms (hot flashes, night sweats) impairs recovery. Cold exposure and sleep hygiene become foundational.","guidelines":["Cool sleeping environment (16-18C / 60-65F) with moisture-wicking bedding","Cold-water immersion or cold showers in the evening to reduce core temperature","Magnesium glycinate (300-400mg) before bed for sleep quality","Tart cherry juice (natural melatonin source) in the evening","Adaptogenic herbs (ashwagandha) may support cortisol regulation – consult healthcare provider","Prioritise 48-72 hours between high-intensity sessions","Stress management is critical – elevated cortisol compounds estrogen decline effects","Regular sleep-wake schedule even on weekends"]}',
 'science_team', now(), '0.1.0', 'approved');

-- MENOPAUSE
INSERT INTO recommendations_content (phase, life_stage, type, content, reviewed_by, reviewed_at, algorithm_version, status) VALUES
('menopause', 'menopause', 'training',
 '{"title":"Menopause Training","summary":"Estrogen and progesterone are chronically low. Without the hormonal stimulus, strength training and high-intensity work are the primary tools to maintain muscle mass, bone density, and metabolic health.","guidelines":["Heavy resistance training 3-4x/week is non-negotiable for sarcopenia prevention","Lift heavy: 70-85% 1RM for 3-5 sets of 4-8 reps on compound movements","Sprint interval training 2x/week: preserves VO2max and metabolic rate","Impact-loading exercises for bone density – jumping, bounding, stair running","Balance and proprioception training to reduce fall risk","Maintain flexibility work – joint stiffness accelerates post-menopause","Power training (explosive movements) preserves fast-twitch fibre recruitment"],"intensity_range":"RPE 7-10 for resistance, RPE 8-10 for intervals","avoid":["Relying solely on walking or yoga","Low-protein diets","Excessive endurance training without strength base"]}',
 'science_team', now(), '0.1.0', 'approved'),
('menopause', 'menopause', 'nutrition',
 '{"title":"Menopause Nutrition","summary":"Without estrogen, anabolic resistance is highest. Protein distribution, timing, and micronutrient support for bone and cardiovascular health are paramount.","guidelines":["Protein: 2.0-2.4 g/kg/day distributed across 4 meals (30-40g per meal)","Leucine-rich protein sources (whey, eggs, poultry) to overcome anabolic resistance","Creatine monohydrate 3-5g/day – supports muscle, bone, and brain health","Calcium 1200mg/day + vitamin D 2000-4000 IU/day for osteoporosis prevention","Omega-3 fatty acids 2-3g/day for cardiovascular and joint health","Fibre 30g+/day for gut health and cholesterol management","Limit added sugar and refined carbs – insulin resistance is established","Collagen peptides (15g/day) may support joint and connective tissue health","Stay well-hydrated – thirst sensation diminishes with age"],"key_nutrients":["protein","leucine","creatine","calcium","vitamin D","omega-3","collagen","fibre"]}',
 'science_team', now(), '0.1.0', 'approved'),
('menopause', 'menopause', 'recovery',
 '{"title":"Menopause Recovery","summary":"Recovery capacity is reduced. Sleep architecture changes. Structured recovery and stress management are essential for training adaptation.","guidelines":["Sleep remains the #1 recovery tool – aim for 7-9 hours, consistent schedule","Cool sleeping environment with layered bedding for temperature regulation","Cold-water immersion post-training for inflammation management","48-72 hours between high-intensity sessions minimum","Gentle movement on rest days (walking, swimming, tai chi)","Mindfulness and stress reduction – chronic cortisol impairs bone and muscle health","Regular health screenings: bone density (DEXA), cardiovascular markers, blood glucose","Consider HRT discussion with healthcare provider – it significantly impacts training response","Community and social connection support mental health and adherence"]}',
 'science_team', now(), '0.1.0', 'approved');
