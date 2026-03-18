-- ============================================================================
-- Wild.AI – Seed Data: recommendations_content
-- Based on Dr. Stacy Sims research for female physiology-driven training,
-- nutrition, and recovery across all menstrual cycle phases, perimenopause,
-- and menopause.
-- algorithm_version = '0.1.0', status = 'approved'
-- ============================================================================

-- ============================================================================
-- MENSTRUAL CYCLE PHASES
-- ============================================================================

-- ---- MENSTRUAL (Early Follicular) – Days 1-5 --------------------------------

INSERT INTO recommendations_content (phase, life_stage, type, content, reviewed_by, reviewed_at, algorithm_version, status) VALUES
('menstrual', 'menstrual_cycle', 'training',
 '{
    "title": "Menstrual Phase Training",
    "summary": "Focus on low-to-moderate intensity. Hormones are at their lowest, which can feel like a reset. Light movement helps with cramps and mood.",
    "guidelines": [
      "Prioritise low-intensity steady-state cardio (walking, easy cycling, yoga)",
      "Reduce overall training volume by 10-20%",
      "Strength work is fine if energy permits – keep loads moderate",
      "Listen to your body: rest days are valid and productive",
      "Gentle mobility and stretching can alleviate cramping"
    ],
    "intensity_range": "RPE 3-6",
    "avoid": ["High-intensity interval sessions if fatigue or cramping is present", "New 1RM attempts"]
  }',
 'science_team', now(), '0.1.0', 'approved'),

('menstrual', 'menstrual_cycle', 'nutrition',
 '{
    "title": "Menstrual Phase Nutrition",
    "summary": "Iron-rich foods to offset menstrual blood loss. Anti-inflammatory whole foods to manage cramping and inflammation.",
    "guidelines": [
      "Increase iron-rich foods: red meat, lentils, spinach, fortified cereals",
      "Pair plant-based iron with vitamin C for absorption",
      "Include omega-3 fatty acids (salmon, walnuts, flaxseed) for anti-inflammatory support",
      "Stay well hydrated – aim for pale yellow urine",
      "Magnesium-rich foods (dark chocolate, nuts, seeds) may ease cramps",
      "Moderate caffeine; excess can worsen cramps"
    ],
    "key_nutrients": ["iron", "vitamin C", "omega-3", "magnesium"]
  }',
 'science_team', now(), '0.1.0', 'approved'),

('menstrual', 'menstrual_cycle', 'recovery',
 '{
    "title": "Menstrual Phase Recovery",
    "summary": "Prioritise sleep and gentle restoration. Inflammation and fatigue are common; recovery modalities help manage symptoms.",
    "guidelines": [
      "Aim for 8+ hours of sleep – melatonin is not suppressed by progesterone in this phase",
      "Use heat therapy (hot water bottle, warm baths) for cramp relief",
      "Gentle foam rolling and stretching",
      "Epsom salt baths for magnesium absorption and relaxation",
      "Reduce high-stress commitments where possible"
    ]
  }',
 'science_team', now(), '0.1.0', 'approved');


-- ---- FOLLICULAR (Late Follicular) – Days 6-12 -------------------------------

INSERT INTO recommendations_content (phase, life_stage, type, content, reviewed_by, reviewed_at, algorithm_version, status) VALUES
('follicular', 'menstrual_cycle', 'training',
 '{
    "title": "Follicular Phase Training",
    "summary": "Rising estrogen boosts energy, pain tolerance, and muscle-building capacity. This is the best window for high-intensity and strength work.",
    "guidelines": [
      "Schedule your hardest sessions here – HIIT, heavy lifts, sprint intervals",
      "Increase training volume and intensity progressively",
      "Estrogen supports tendon and ligament resilience – good time for plyometrics",
      "Motor learning is enhanced – practice complex skills and technique work",
      "Leverage higher pain tolerance for pushing through tough sets"
    ],
    "intensity_range": "RPE 7-9",
    "avoid": ["Under-training – capitalise on this high-energy window"]
  }',
 'science_team', now(), '0.1.0', 'approved'),

('follicular', 'menstrual_cycle', 'nutrition',
 '{
    "title": "Follicular Phase Nutrition",
    "summary": "Fuel for performance. Estrogen improves insulin sensitivity, so carbohydrate tolerance is at its best.",
    "guidelines": [
      "Increase complex carbohydrates to fuel high-intensity work",
      "Protein intake of 1.6-2.0 g/kg/day for muscle protein synthesis",
      "Leverage improved insulin sensitivity – carb-rich meals around training",
      "Maintain hydration; sweat rates may increase with higher intensity",
      "Include B-vitamins for energy metabolism (whole grains, eggs, legumes)"
    ],
    "key_nutrients": ["complex carbohydrates", "protein", "B-vitamins"]
  }',
 'science_team', now(), '0.1.0', 'approved'),

('follicular', 'menstrual_cycle', 'recovery',
 '{
    "title": "Follicular Phase Recovery",
    "summary": "Recovery capacity is enhanced. You can handle higher training loads with shorter recovery windows.",
    "guidelines": [
      "Standard recovery protocols are sufficient – 24-48h between hard sessions",
      "Active recovery (easy swim, walk) between high-intensity days",
      "Sleep remains important – 7-9 hours",
      "Cold-water immersion can be used effectively in this phase",
      "Foam rolling and mobility work post-session"
    ]
  }',
 'science_team', now(), '0.1.0', 'approved');


-- ---- OVULATORY – Days 12-16 ------------------------------------------------

INSERT INTO recommendations_content (phase, life_stage, type, content, reviewed_by, reviewed_at, algorithm_version, status) VALUES
('ovulatory', 'menstrual_cycle', 'training',
 '{
    "title": "Ovulatory Phase Training",
    "summary": "Peak estrogen window. Strength and power are at their highest, but ACL injury risk increases due to ligament laxity.",
    "guidelines": [
      "Peak strength window – attempt PRs and maximal efforts if well-recovered",
      "Power and explosive work (Olympic lifts, sprints) are well-supported",
      "Be mindful of ACL risk: warm up thoroughly, focus on landing mechanics",
      "Neuromuscular activation exercises before plyometrics",
      "Body temperature rises slightly – adjust for heat if training outdoors"
    ],
    "intensity_range": "RPE 8-10",
    "avoid": ["Skipping warm-ups", "Excessive single-leg plyometrics without proper activation"]
  }',
 'science_team', now(), '0.1.0', 'approved'),

('ovulatory', 'menstrual_cycle', 'nutrition',
 '{
    "title": "Ovulatory Phase Nutrition",
    "summary": "Continue fuelling for performance. Estrogen is peaking; support detox pathways and fibre intake.",
    "guidelines": [
      "Cruciferous vegetables (broccoli, kale, Brussels sprouts) support estrogen metabolism",
      "Maintain high protein intake for muscle repair from intense training",
      "Adequate fibre (25-30g/day) supports estrogen clearance",
      "Antioxidant-rich foods (berries, dark leafy greens) combat oxidative stress",
      "Light meals before training to avoid GI distress during high-intensity work"
    ],
    "key_nutrients": ["fibre", "cruciferous vegetables", "antioxidants", "protein"]
  }',
 'science_team', now(), '0.1.0', 'approved'),

('ovulatory', 'menstrual_cycle', 'recovery',
 '{
    "title": "Ovulatory Phase Recovery",
    "summary": "Core body temperature rises. Sleep may be slightly disrupted. Prioritise cooling strategies.",
    "guidelines": [
      "Cool sleeping environment (18-20C / 64-68F)",
      "Post-training cold-water immersion or cold showers can help regulate temperature",
      "Stay on top of hydration – slight core temp increase means more fluid loss",
      "Active recovery between hard sessions",
      "Monitor for signs of overreaching given the high-intensity bias of this phase"
    ]
  }',
 'science_team', now(), '0.1.0', 'approved');


-- ---- LUTEAL (Early + Late) – Days 16-28 ------------------------------------

INSERT INTO recommendations_content (phase, life_stage, type, content, reviewed_by, reviewed_at, algorithm_version, status) VALUES
('luteal', 'menstrual_cycle', 'training',
 '{
    "title": "Luteal Phase Training",
    "summary": "Rising progesterone increases core temperature, reduces anabolic capacity, and can impair heat tolerance. Shift toward moderate, sustained efforts.",
    "guidelines": [
      "Shift from max-intensity to moderate steady-state and tempo work",
      "Reduce overall volume by 10-15% compared to follicular phase",
      "Endurance capacity can remain strong – good window for longer, easier sessions",
      "Progesterone is catabolic – heavy eccentric work causes more muscle damage now",
      "Pre-cool before training in hot conditions (cold towel, ice slurry)",
      "Late luteal (PMS window): further reduce intensity if symptomatic"
    ],
    "intensity_range": "RPE 5-7",
    "avoid": ["Prolonged high-intensity in heat", "Heavy eccentric loading", "Ignoring PMS symptoms"]
  }',
 'science_team', now(), '0.1.0', 'approved'),

('luteal', 'menstrual_cycle', 'nutrition',
 '{
    "title": "Luteal Phase Nutrition",
    "summary": "Metabolic rate increases by ~100-300 kcal/day. Progesterone impairs carbohydrate access – shift toward more fat and protein.",
    "guidelines": [
      "Increase total caloric intake by 100-300 kcal to match elevated metabolic rate",
      "Increase healthy fat intake (avocado, nuts, olive oil) – body preferentially uses fat",
      "Maintain protein at 1.8-2.2 g/kg/day to counteract progesterone catabolic effects",
      "Reduce high-glycaemic carbs; favour complex carbs to manage insulin resistance",
      "Tart cherry juice or tryptophan-rich foods support serotonin (mood, cravings)",
      "Calcium (1000mg/day) and vitamin D may reduce PMS symptoms",
      "Sodium retention increases – be mindful of bloating triggers"
    ],
    "key_nutrients": ["healthy fats", "protein", "calcium", "vitamin D", "tryptophan", "complex carbohydrates"]
  }',
 'science_team', now(), '0.1.0', 'approved'),

('luteal', 'menstrual_cycle', 'recovery',
 '{
    "title": "Luteal Phase Recovery",
    "summary": "Core temperature is elevated, sleep quality often declines. Recovery takes longer. Prioritise sleep hygiene and stress management.",
    "guidelines": [
      "Cool sleeping environment is critical – progesterone raises basal body temp",
      "Magnesium supplementation (200-400mg) before bed for sleep and cramp prevention",
      "Extend recovery between hard sessions – 48-72 hours",
      "Avoid alcohol – it further disrupts already-compromised sleep",
      "Gentle yoga, meditation, and breathing exercises for stress / PMS management",
      "Epsom salt baths for relaxation and magnesium"
    ]
  }',
 'science_team', now(), '0.1.0', 'approved');


-- ============================================================================
-- PERIMENOPAUSE
-- ============================================================================

INSERT INTO recommendations_content (phase, life_stage, type, content, reviewed_by, reviewed_at, algorithm_version, status) VALUES
('perimenopause', 'perimenopause', 'training',
 '{
    "title": "Perimenopause Training",
    "summary": "Fluctuating and declining estrogen reduces muscle protein synthesis and bone density stimulus. Heavy resistance training and high-intensity intervals become essential, not optional.",
    "guidelines": [
      "Prioritise heavy resistance training 3-4x/week to counteract muscle loss",
      "Include high-intensity interval training (SIT or HIIT) 2-3x/week for metabolic health",
      "Load-bearing and impact exercises (jumping, running) for bone density maintenance",
      "Sprint interval training (SIT): 30s all-out efforts with full recovery – replaces the estrogen stimulus for muscle",
      "Avoid chronic moderate-intensity cardio as sole training – it accelerates body composition changes",
      "Plyometric training stimulates bone remodelling – include box jumps, skipping",
      "Allow adequate warm-up as joint stiffness may increase"
    ],
    "intensity_range": "RPE 7-9 for intervals, RPE 8-10 for strength",
    "avoid": ["Exclusively low-intensity training", "Ignoring resistance training", "Prolonged fasted training"]
  }',
 'science_team', now(), '0.1.0', 'approved'),

('perimenopause', 'perimenopause', 'nutrition',
 '{
    "title": "Perimenopause Nutrition",
    "summary": "Declining estrogen impairs insulin sensitivity and shifts body composition toward central adiposity. Protein timing and anti-inflammatory nutrition are critical.",
    "guidelines": [
      "Protein intake of 2.0-2.4 g/kg/day – higher than cycling women due to anabolic resistance",
      "Front-load protein: 30-40g within 30 minutes of waking and post-training",
      "Reduce refined carbohydrates – insulin sensitivity is declining",
      "Increase omega-3 intake (2-3g EPA/DHA daily) for inflammation and cardiovascular health",
      "Calcium (1200mg/day) and vitamin D (2000 IU/day) for bone protection",
      "Phytoestrogen-rich foods (soy, flaxseed) may modestly ease symptoms",
      "Limit alcohol – it worsens hot flashes, sleep disruption, and fat storage",
      "Creatine monohydrate (3-5g/day) supports muscle and cognitive function"
    ],
    "key_nutrients": ["protein", "omega-3", "calcium", "vitamin D", "creatine", "phytoestrogens"]
  }',
 'science_team', now(), '0.1.0', 'approved'),

('perimenopause', 'perimenopause', 'recovery',
 '{
    "title": "Perimenopause Recovery",
    "summary": "Sleep disruption from vasomotor symptoms (hot flashes, night sweats) impairs recovery. Cold exposure and sleep hygiene become foundational.",
    "guidelines": [
      "Cool sleeping environment (16-18C / 60-65F) with moisture-wicking bedding",
      "Cold-water immersion or cold showers in the evening to reduce core temperature",
      "Magnesium glycinate (300-400mg) before bed for sleep quality",
      "Tart cherry juice (natural melatonin source) in the evening",
      "Adaptogenic herbs (ashwagandha) may support cortisol regulation – consult healthcare provider",
      "Prioritise 48-72 hours between high-intensity sessions",
      "Stress management is critical – elevated cortisol compounds estrogen decline effects",
      "Regular sleep-wake schedule even on weekends"
    ]
  }',
 'science_team', now(), '0.1.0', 'approved');


-- ============================================================================
-- MENOPAUSE (Post-menopausal)
-- ============================================================================

INSERT INTO recommendations_content (phase, life_stage, type, content, reviewed_by, reviewed_at, algorithm_version, status) VALUES
('menopause', 'menopause', 'training',
 '{
    "title": "Menopause Training",
    "summary": "Estrogen and progesterone are chronically low. Without the hormonal stimulus, strength training and high-intensity work are the primary tools to maintain muscle mass, bone density, and metabolic health.",
    "guidelines": [
      "Heavy resistance training 3-4x/week is non-negotiable for sarcopenia prevention",
      "Lift heavy: 70-85% 1RM for 3-5 sets of 4-8 reps on compound movements",
      "Sprint interval training 2x/week: preserves VO2max and metabolic rate",
      "Impact-loading exercises for bone density – jumping, bounding, stair running",
      "Balance and proprioception training to reduce fall risk",
      "Maintain flexibility work – joint stiffness accelerates post-menopause",
      "Power training (explosive movements) preserves fast-twitch fibre recruitment"
    ],
    "intensity_range": "RPE 7-10 for resistance, RPE 8-10 for intervals",
    "avoid": ["Relying solely on walking or yoga", "Low-protein diets", "Excessive endurance training without strength base"]
  }',
 'science_team', now(), '0.1.0', 'approved'),

('menopause', 'menopause', 'nutrition',
 '{
    "title": "Menopause Nutrition",
    "summary": "Without estrogen, anabolic resistance is highest. Protein distribution, timing, and micronutrient support for bone and cardiovascular health are paramount.",
    "guidelines": [
      "Protein: 2.0-2.4 g/kg/day distributed across 4 meals (30-40g per meal)",
      "Leucine-rich protein sources (whey, eggs, poultry) to overcome anabolic resistance",
      "Creatine monohydrate 3-5g/day – supports muscle, bone, and brain health",
      "Calcium 1200mg/day + vitamin D 2000-4000 IU/day for osteoporosis prevention",
      "Omega-3 fatty acids 2-3g/day for cardiovascular and joint health",
      "Fibre 30g+/day for gut health and cholesterol management",
      "Limit added sugar and refined carbs – insulin resistance is established",
      "Collagen peptides (15g/day) may support joint and connective tissue health",
      "Stay well-hydrated – thirst sensation diminishes with age"
    ],
    "key_nutrients": ["protein", "leucine", "creatine", "calcium", "vitamin D", "omega-3", "collagen", "fibre"]
  }',
 'science_team', now(), '0.1.0', 'approved'),

('menopause', 'menopause', 'recovery',
 '{
    "title": "Menopause Recovery",
    "summary": "Recovery capacity is reduced. Sleep architecture changes. Structured recovery and stress management are essential for training adaptation.",
    "guidelines": [
      "Sleep remains the #1 recovery tool – aim for 7-9 hours, consistent schedule",
      "Cool sleeping environment with layered bedding for temperature regulation",
      "Cold-water immersion post-training for inflammation management",
      "48-72 hours between high-intensity sessions minimum",
      "Gentle movement on rest days (walking, swimming, tai chi)",
      "Mindfulness and stress reduction – chronic cortisol impairs bone and muscle health",
      "Regular health screenings: bone density (DEXA), cardiovascular markers, blood glucose",
      "Consider HRT discussion with healthcare provider – it significantly impacts training response",
      "Community and social connection support mental health and adherence"
    ]
  }',
 'science_team', now(), '0.1.0', 'approved');
