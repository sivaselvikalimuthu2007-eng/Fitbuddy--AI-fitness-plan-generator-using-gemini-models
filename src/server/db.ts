import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(process.cwd(), 'fitbuddy.db');

export const db = new Database(DB_PATH);

// Pragmas for performance and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      age INTEGER,
      gender TEXT,
      weight_kg REAL,
      height_cm REAL,
      primary_goal TEXT NOT NULL,
      experience_level TEXT DEFAULT 'intermediate',
      workout_intensity TEXT DEFAULT 'medium',
      days_per_week INTEGER DEFAULT 4,
      minutes_per_session INTEGER DEFAULT 45,
      equipment_json TEXT DEFAULT '[]',
      limitations_json TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workout_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      overview TEXT,
      intensity TEXT DEFAULT 'medium',
      split_type TEXT,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      weekly_schedule_json TEXT NOT NULL,
      wellness_guide_json TEXT,
      progression_strategy TEXT,
      motivational_mantra TEXT,
      adaptation_history_json TEXT DEFAULT '[]',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS feedback_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      feedback_text TEXT NOT NULL,
      adaptation_type TEXT DEFAULT 'intensity',
      target_intensity TEXT,
      target_day_number INTEGER,
      adaptation_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS nutrition_recommendations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT,
      daily_calories INTEGER,
      protein_grams INTEGER,
      carbs_grams INTEGER,
      fats_grams INTEGER,
      hydration_liters REAL,
      meal_timing_protocol TEXT,
      supplement_guidance TEXT,
      sleep_recovery_protocol TEXT,
      active_recovery_protocol TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS workout_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT,
      day_number INTEGER NOT NULL,
      day_title TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 45,
      perceived_rpe REAL DEFAULT 7.0,
      calories_burned INTEGER DEFAULT 300,
      intensity TEXT DEFAULT 'medium',
      notes TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) return;

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, name, email, age, gender, weight_kg, height_cm, primary_goal,
      experience_level, workout_intensity, days_per_week, minutes_per_session,
      equipment_json, limitations_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPlan = db.prepare(`
    INSERT INTO workout_plans (
      id, user_id, title, overview, intensity, split_type, generated_at,
      weekly_schedule_json, wellness_guide_json, progression_strategy,
      motivational_mantra, adaptation_history_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertNutrition = db.prepare(`
    INSERT INTO nutrition_recommendations (
      id, user_id, plan_id, daily_calories, protein_grams, carbs_grams, fats_grams,
      hydration_liters, meal_timing_protocol, supplement_guidance,
      sleep_recovery_protocol, active_recovery_protocol, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertFeedback = db.prepare(`
    INSERT INTO feedback_logs (
      id, user_id, plan_id, feedback_text, adaptation_type, target_intensity,
      target_day_number, adaptation_summary, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSession = db.prepare(`
    INSERT INTO workout_sessions (
      id, user_id, plan_id, day_number, day_title, duration_minutes,
      perceived_rpe, calories_burned, intensity, notes, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Athlete 1: Elena Rostova (Fat Loss - Medium/High)
  insertUser.run(
    'user-elena-01',
    'Elena Rostova',
    'elena.rostova@athlete.io',
    29,
    'female',
    64,
    168,
    'fat_loss',
    'intermediate',
    'medium',
    4,
    45,
    JSON.stringify(['dumbbells', 'resistance_bands', 'pullup_bar']),
    JSON.stringify(['Tight hip flexors from desk work']),
    new Date(Date.now() - 7 * 86400000).toISOString()
  );

  insertPlan.run(
    'plan-elena-starter',
    'user-elena-01',
    'Metabolic Lean Tone & Core Hypertrophy',
    'High-density compound supersets and core stabilizers calibrated for steady adipose oxidation and lean tone.',
    'medium',
    'Upper/Lower Metabolic Split (4 Days)',
    new Date(Date.now() - 7 * 86400000).toISOString(),
    JSON.stringify([
      {
        dayNumber: 1,
        dayTitle: 'Day 1: Upper Body Metabolic Density',
        focus: 'Chest, Back & Core',
        isRestDay: false,
        intensity: 'medium',
        estimatedDurationMin: 45,
        estimatedCaloriesBurn: 380,
        warmup: { durationMin: 6, movements: ['Arm circles', 'Cat-Cow', 'Band Pull-Aparts'] },
        cooldown: { durationMin: 5, movements: ['Doorway chest stretch', 'Child’s pose'] },
        exercises: [
          {
            id: 'e1',
            name: 'Dumbbell Floor Press',
            targetMuscles: ['Chest', 'Triceps'],
            sets: 3,
            reps: '12-15',
            tempo: '3-0-1-0',
            restSeconds: 60,
            rpe: 'RPE 7.5',
            notes: 'Keep elbows tucked at 45 degrees to protect shoulders.',
            commonMistakes: ['Flaring elbows outward 90 degrees'],
            coachingCues: ['Drive through knuckles', 'Squeeze chest at top'],
            alternative: 'Push-ups on knees or elevated bench',
          },
          {
            id: 'e2',
            name: 'Single-Arm Dumbbell Row',
            targetMuscles: ['Lats', 'Rhomboids'],
            sets: 3,
            reps: '12 reps/side',
            tempo: '2-1-1-0',
            restSeconds: 60,
            rpe: 'RPE 7.5',
            notes: 'Pull dumbbell toward hip crease, not shoulder.',
            commonMistakes: ['Rounding lower spine'],
            coachingCues: ['Pull elbow to hip pocket', 'Retract scapula'],
            alternative: 'Resistance band seated rows',
          }
        ]
      },
      {
        dayNumber: 2,
        dayTitle: 'Day 2: Posterior Chain & Hamstring Drive',
        focus: 'Glutes & Hamstrings',
        isRestDay: false,
        intensity: 'medium',
        estimatedDurationMin: 45,
        estimatedCaloriesBurn: 410,
        warmup: { durationMin: 6, movements: ['Glute bridges', 'Inchworms'] },
        cooldown: { durationMin: 5, movements: ['Hamstring sweep', 'Figure-4 stretch'] },
        exercises: [
          {
            id: 'e3',
            name: 'Dumbbell Romanian Deadlift',
            targetMuscles: ['Hamstrings', 'Glutes'],
            sets: 3,
            reps: '10-12',
            tempo: '3-1-1-0',
            restSeconds: 60,
            rpe: 'RPE 8.0',
            notes: 'Hinge hips backwards until deep stretch in hamstrings.',
            commonMistakes: ['Squatting with bent knees instead of hip hinge'],
            coachingCues: ['Push hips to back wall', 'Flat back like a table'],
            alternative: 'Glute bridge with resistance band',
          }
        ]
      },
      {
        dayNumber: 3,
        dayTitle: 'Day 3: Active Rest & Fascial Recovery',
        focus: 'Cellular Restoration & Mobility',
        isRestDay: true,
        intensity: 'low',
        estimatedDurationMin: 30,
        estimatedCaloriesBurn: 140,
        warmup: { durationMin: 5, movements: ['Gentle spinal twists'] },
        cooldown: { durationMin: 5, movements: ['Legs up the wall'] },
        exercises: []
      },
      {
        dayNumber: 4,
        dayTitle: 'Day 4: Full-Body Functional Density Circuit',
        focus: 'Full Body Conditioning',
        isRestDay: false,
        intensity: 'medium',
        estimatedDurationMin: 45,
        estimatedCaloriesBurn: 430,
        warmup: { durationMin: 6, movements: ['High knees', 'World’s greatest stretch'] },
        cooldown: { durationMin: 5, movements: ['Cobra stretch', 'Quad stretch'] },
        exercises: []
      }
    ]),
    JSON.stringify({
      nutritionFocus: 'Slight caloric deficit of 300 kcal with 2.2g/kg protein to preserve lean muscle tissue while accelerating fat oxidation.',
      hydrationTarget: '2.8 to 3.2 Liters daily including 500mg sodium in morning water.',
      sleepTargetHours: 8,
      stressManagement: 'Box breathing 4x4 after high-demand training sessions.'
    }),
    'Double progression: When you complete 15 clean reps on all 3 sets, increase weight by 2.5kg.',
    'Discipline is choosing between what you want now and what you want most.',
    JSON.stringify([
      {
        date: new Date(Date.now() - 3 * 86400000).toLocaleDateString(),
        summary: 'Adapted Day 2 lunges to Bulgarian split squats with support to accommodate tight hip flexors.',
        adaptationType: 'injury'
      }
    ])
  );

  insertNutrition.run(
    'nutr-elena-01',
    'user-elena-01',
    'plan-elena-starter',
    1850,
    140,
    175,
    55,
    3.0,
    'Consume 35g protein within 90 minutes post-workout. Cluster 60% of daily carbohydrates around training window.',
    'Creatine monohydrate 5g daily, Whey isolate, Omega-3 (2000mg EPA/DHA), Magnesium glycinate 400mg before bed.',
    'Dark room at 19°C. No blue light 60 minutes prior to sleep. Magnesium glycinate 30 mins before sleep.',
    '20-30 min Zone 1 recovery walk outdoors in morning sunlight to sync circadian rhythm and clear residual lactate.',
    new Date(Date.now() - 7 * 86400000).toISOString()
  );

  insertFeedback.run(
    'fb-elena-01',
    'user-elena-01',
    'plan-elena-starter',
    'Hip flexors felt pinched during weighted walking lunges. Requested joint-friendly unilateral switch.',
    'injury',
    'medium',
    2,
    'Substituted walking lunges with supported Bulgarian split squats and added hip flexor couch stretch.',
    new Date(Date.now() - 3 * 86400000).toISOString()
  );

  insertSession.run(
    'sess-elena-01',
    'user-elena-01',
    'plan-elena-starter',
    1,
    'Day 1: Upper Body Metabolic Density',
    44,
    7.5,
    385,
    'medium',
    'Felt strong on DB floor press. 14kg felt solid.',
    new Date(Date.now() - 5 * 86400000).toISOString()
  );

  insertSession.run(
    'sess-elena-02',
    'user-elena-01',
    'plan-elena-starter',
    2,
    'Day 2: Posterior Chain & Hamstring Drive',
    46,
    8.0,
    415,
    'medium',
    'RDL stretch was intense. Hip hinge feels much smoother.',
    new Date(Date.now() - 2 * 86400000).toISOString()
  );

  // Athlete 2: Marcus Vance (Muscle Gain - High Intensity)
  insertUser.run(
    'user-marcus-02',
    'Marcus Vance',
    'marcus.vance@powerlift.com',
    34,
    'male',
    82,
    182,
    'muscle_gain',
    'advanced',
    'high',
    5,
    55,
    JSON.stringify(['barbell_plates', 'dumbbells', 'pullup_bar', 'bench']),
    JSON.stringify(['Mild left shoulder impingement with overhead presses']),
    new Date(Date.now() - 14 * 86400000).toISOString()
  );

  insertPlan.run(
    'plan-marcus-02',
    'user-marcus-02',
    'Hypertrophy Overload & Power Split',
    'Heavy mechanical tension and controlled 3-second eccentrics targeting high-threshold motor unit recruitment.',
    'high',
    'Upper / Lower Heavy Volume Split (5 Days)',
    new Date(Date.now() - 14 * 86400000).toISOString(),
    JSON.stringify([
      {
        dayNumber: 1,
        dayTitle: 'Day 1: Upper Body Mechanical Tension',
        focus: 'Chest, Lats & Triceps',
        isRestDay: false,
        intensity: 'high',
        estimatedDurationMin: 55,
        estimatedCaloriesBurn: 520,
        warmup: { durationMin: 8, movements: ['Band face pulls', 'Scapular pull-ups'] },
        cooldown: { durationMin: 6, movements: ['Chest doorway stretch', 'Lat stretch'] },
        exercises: [
          {
            id: 'm1',
            name: 'Incline Dumbbell Press',
            targetMuscles: ['Upper Chest', 'Front Delts', 'Triceps'],
            sets: 4,
            reps: '8-10',
            tempo: '3-1-1-0',
            restSeconds: 90,
            rpe: 'RPE 8.5',
            notes: 'Neutral 45-degree hand angle to protect left shoulder.',
            commonMistakes: ['Bouncing weights at bottom'],
            coachingCues: ['Keep shoulder blades pinned to bench', 'Push ceiling away'],
            alternative: 'Push-ups with hands on elevated dumbbells'
          }
        ]
      }
    ]),
    JSON.stringify({
      nutritionFocus: 'Hypertrophic caloric surplus of +350 kcal. 2.0g/kg protein (165g) with complex carbs around workouts.',
      hydrationTarget: '3.5 Liters daily.',
      sleepTargetHours: 8.5,
      stressManagement: 'Contrast showers (3 min hot / 1 min cold) on heavy leg days.'
    }),
    'Add 1 rep or 1.25kg to your main working sets each week. Log every working set.',
    'Iron sharpens iron. Respect the eccentric tempo.',
    JSON.stringify([])
  );

  insertNutrition.run(
    'nutr-marcus-02',
    'user-marcus-02',
    'plan-marcus-02',
    3100,
    175,
    380,
    85,
    3.8,
    '4 meals evenly spaced with 40g protein each. Carb-heavy pre-workout meal 90 mins prior to training.',
    'Creatine Monohydrate 5g, L-Citrulline 6g pre-workout, Vitamin D3 + K2, Ashwagandha KSM-66.',
    'Cold bedroom (18°C), 8.5 hours in bed. Mouth taping or nasal strips if congested.',
    'Zone 2 stationary bike 20 mins at 120 bpm on off days for capillary density.',
    new Date(Date.now() - 14 * 86400000).toISOString()
  );

  insertSession.run(
    'sess-marcus-01',
    'user-marcus-02',
    'plan-marcus-02',
    1,
    'Day 1: Upper Body Mechanical Tension',
    52,
    9.0,
    510,
    'high',
    '32kg DBs on incline press. Felt heavy but solid.',
    new Date(Date.now() - 4 * 86400000).toISOString()
  );

  // Athlete 3: Chloe Bennett (Flexibility - Low Intensity)
  insertUser.run(
    'user-chloe-03',
    'Chloe Bennett',
    'chloe.b@mobilityflow.org',
    27,
    'female',
    58,
    165,
    'mobility_flexibility',
    'intermediate',
    'low',
    4,
    35,
    JSON.stringify(['bodyweight', 'yoga_mat', 'foam_roller']),
    JSON.stringify(['Hypermobility in elbows, prone to hyperextension']),
    new Date(Date.now() - 5 * 86400000).toISOString()
  );

  insertPlan.run(
    'plan-chloe-03',
    'user-chloe-03',
    'Kinetic Fascial Release & Joint Decompression',
    'Restorative kinetic mobility routines focused on end-range joint control, thoracic rotational decompression, and pelvic stability.',
    'low',
    'Full Body Flow & Pelvic Alignment (4 Days)',
    new Date(Date.now() - 5 * 86400000).toISOString(),
    JSON.stringify([
      {
        dayNumber: 1,
        dayTitle: 'Day 1: Thoracic Spine & Posterior Hip Capsule',
        focus: 'Thoracic & Pelvis',
        isRestDay: false,
        intensity: 'low',
        estimatedDurationMin: 35,
        estimatedCaloriesBurn: 180,
        warmup: { durationMin: 5, movements: ['Cat-Cow breathing', 'Child’s pose to cobra'] },
        cooldown: { durationMin: 5, movements: ['Legs up the wall relaxation'] },
        exercises: [
          {
            id: 'c1',
            name: '90/90 Hip Capsule Transitions',
            targetMuscles: ['Hip Rotators', 'Glute Medius'],
            sets: 3,
            reps: '10 smooth switches',
            tempo: '4-2-4-0',
            restSeconds: 75,
            rpe: 'RPE 5.0',
            notes: 'Keep chest tall without tipping backward.',
            commonMistakes: ['Rushing the rotation'],
            coachingCues: ['Lead with the back knee', 'Stay tall through the crown'],
            alternative: 'Seated butterfly stretch'
          }
        ]
      }
    ]),
    JSON.stringify({
      nutritionFocus: 'Anti-inflammatory whole food protocol with rich polyphenols, collagen peptides, and omega-3s.',
      hydrationTarget: '2.5 Liters structured water.',
      sleepTargetHours: 8,
      stressManagement: '10-minute mindfulness body scan before sleep.'
    }),
    'Hold end ranges for 3 deep diaphragmatic breaths before transitioning.',
    'Range without control is vulnerability. Build strength in your expansion.',
    JSON.stringify([])
  );

  // Athlete 4: David Kim (General Wellness - Medium)
  insertUser.run(
    'user-david-04',
    'David Kim',
    'david.kim@techlead.co',
    42,
    'male',
    78,
    176,
    'general_health',
    'returning',
    'medium',
    3,
    40,
    JSON.stringify(['dumbbells', 'resistance_bands']),
    JSON.stringify(['Sedentary posture, lower back stiffness']),
    new Date(Date.now() - 10 * 86400000).toISOString()
  );

  insertPlan.run(
    'plan-david-04',
    'user-david-04',
    'Functional Longevity & Daily Energy Blueprint',
    'Balanced multi-joint functional patterns designed to reverse sedentary posture, build cardiovascular resilience, and restore spinal vitality.',
    'medium',
    'Full Body Functional Circuit (3 Days)',
    new Date(Date.now() - 10 * 86400000).toISOString(),
    JSON.stringify([
      {
        dayNumber: 1,
        dayTitle: 'Day 1: Posture Reset & Core Foundation',
        focus: 'Back, Glutes & Deep Core',
        isRestDay: false,
        intensity: 'medium',
        estimatedDurationMin: 40,
        estimatedCaloriesBurn: 320,
        warmup: { durationMin: 6, movements: ['Bird-Dog', 'Deadbug', 'Glute Bridge'] },
        cooldown: { durationMin: 5, movements: ['Seated piriformis stretch'] },
        exercises: [
          {
            id: 'd1',
            name: 'Goblet Squat to Bench',
            targetMuscles: ['Quadriceps', 'Glutes', 'Core'],
            sets: 3,
            reps: '12',
            tempo: '3-1-1-0',
            restSeconds: 60,
            rpe: 'RPE 7.0',
            notes: 'Lightly tap the bench with glutes, do not collapse weight.',
            commonMistakes: ['Knees caving inward'],
            coachingCues: ['Spread the floor with your feet', 'Chest proud'],
            alternative: 'Bodyweight box squats'
          }
        ]
      }
    ]),
    JSON.stringify({
      nutritionFocus: 'Mediterranean style whole foods with steady blood sugar control and 1.6g/kg protein.',
      hydrationTarget: '3.0 Liters daily.',
      sleepTargetHours: 7.5,
      stressManagement: '15-minute screen-free lunch walk.'
    }),
    'Consistent movement beats occasional perfection. Aim for 3 solid workouts weekly.',
    'Health is the foundation of all high performance.',
    JSON.stringify([])
  );
}

// User CRUD
export function getAllUsers(filter?: { intensity?: string; goal?: string; search?: string }) {
  let query = `
    SELECT u.*,
      COUNT(DISTINCT p.id) as plans_count,
      COUNT(DISTINCT s.id) as sessions_count,
      MAX(p.title) as latest_plan_title,
      MAX(p.generated_at) as latest_plan_date
    FROM users u
    LEFT JOIN workout_plans p ON u.id = p.user_id
    LEFT JOIN workout_sessions s ON u.id = s.user_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filter?.intensity && filter.intensity !== 'all') {
    query += ' AND u.workout_intensity = ?';
    params.push(filter.intensity);
  }

  if (filter?.goal && filter.goal !== 'all') {
    query += ' AND u.primary_goal = ?';
    params.push(filter.goal);
  }

  if (filter?.search && filter.search.trim()) {
    query += ' AND (u.name LIKE ? OR u.email LIKE ?)';
    params.push(`%${filter.search.trim()}%`, `%${filter.search.trim()}%`);
  }

  query += ' GROUP BY u.id ORDER BY u.updated_at DESC';

  const rows = db.prepare(query).all(...params) as any[];
  return rows.map((r) => ({
    ...r,
    availableEquipment: JSON.parse(r.equipment_json || '[]'),
    limitations: JSON.parse(r.limitations_json || '[]'),
  }));
}

export function getUserWithDetails(userId: string) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user) return null;

  const plans = db.prepare('SELECT * FROM workout_plans WHERE user_id = ? ORDER BY generated_at DESC').all(userId) as any[];
  const feedbacks = db.prepare('SELECT * FROM feedback_logs WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
  const nutrition = db.prepare('SELECT * FROM nutrition_recommendations WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
  const sessions = db.prepare('SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY completed_at DESC').all(userId) as any[];

  return {
    ...user,
    availableEquipment: JSON.parse(user.equipment_json || '[]'),
    limitations: JSON.parse(user.limitations_json || '[]'),
    plans: plans.map((p) => ({
      ...p,
      weeklySchedule: JSON.parse(p.weekly_schedule_json || '[]'),
      wellnessGuide: JSON.parse(p.wellness_guide_json || '{}'),
      adaptationHistory: JSON.parse(p.adaptation_history_json || '[]'),
    })),
    feedbacks,
    nutrition,
    sessions,
  };
}

export function saveUser(user: {
  id?: string;
  name: string;
  email?: string;
  age?: number;
  gender?: string;
  weight_kg?: number;
  height_cm?: number;
  primary_goal: string;
  experience_level?: string;
  workout_intensity?: string;
  days_per_week?: number;
  minutes_per_session?: number;
  availableEquipment?: string[];
  limitations?: string[];
}) {
  const userId = user.id || `user-${Date.now()}`;
  const stmt = db.prepare(`
    INSERT INTO users (
      id, name, email, age, gender, weight_kg, height_cm, primary_goal,
      experience_level, workout_intensity, days_per_week, minutes_per_session,
      equipment_json, limitations_json, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      email = excluded.email,
      age = excluded.age,
      gender = excluded.gender,
      weight_kg = excluded.weight_kg,
      height_cm = excluded.height_cm,
      primary_goal = excluded.primary_goal,
      experience_level = excluded.experience_level,
      workout_intensity = excluded.workout_intensity,
      days_per_week = excluded.days_per_week,
      minutes_per_session = excluded.minutes_per_session,
      equipment_json = excluded.equipment_json,
      limitations_json = excluded.limitations_json,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(
    userId,
    user.name,
    user.email || `${user.name.toLowerCase().replace(/\s+/g, '.')}@fitbuddy.user`,
    user.age || 30,
    user.gender || 'neutral',
    user.weight_kg || 70,
    user.height_cm || 175,
    user.primary_goal,
    user.experience_level || 'intermediate',
    user.workout_intensity || 'medium',
    user.days_per_week || 4,
    user.minutes_per_session || 45,
    JSON.stringify(user.availableEquipment || []),
    JSON.stringify(user.limitations || [])
  );

  return userId;
}

// Workout Plan CRUD
export function saveWorkoutPlan(plan: any, userId: string) {
  const planId = plan.id || `plan-${Date.now()}`;
  const stmt = db.prepare(`
    INSERT INTO workout_plans (
      id, user_id, title, overview, intensity, split_type, generated_at,
      weekly_schedule_json, wellness_guide_json, progression_strategy,
      motivational_mantra, adaptation_history_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      overview = excluded.overview,
      intensity = excluded.intensity,
      split_type = excluded.split_type,
      weekly_schedule_json = excluded.weekly_schedule_json,
      wellness_guide_json = excluded.wellness_guide_json,
      progression_strategy = excluded.progression_strategy,
      motivational_mantra = excluded.motivational_mantra,
      adaptation_history_json = excluded.adaptation_history_json
  `);

  stmt.run(
    planId,
    userId,
    plan.title,
    plan.overview || '',
    plan.intensity || plan.profileSnapshot?.workoutIntensity || 'medium',
    plan.splitType || plan.split_type || 'Hybrid Split',
    plan.generatedAt || new Date().toISOString(),
    JSON.stringify(plan.weeklySchedule || []),
    JSON.stringify(plan.wellnessGuide || {}),
    plan.progressionStrategy || '',
    plan.motivationalMantra || '',
    JSON.stringify(plan.adaptationHistory || [])
  );

  return planId;
}

export function getWorkoutPlanById(planId: string) {
  const plan = db.prepare('SELECT p.*, u.name as user_name, u.email as user_email FROM workout_plans p JOIN users u ON p.user_id = u.id WHERE p.id = ?').get(planId) as any;
  if (!plan) return null;

  return {
    ...plan,
    weeklySchedule: JSON.parse(plan.weekly_schedule_json || '[]'),
    wellnessGuide: JSON.parse(plan.wellness_guide_json || '{}'),
    adaptationHistory: JSON.parse(plan.adaptation_history_json || '[]'),
  };
}

// Feedback Log CRUD
export function saveFeedbackLog(data: {
  userId: string;
  planId: string;
  feedbackText: string;
  adaptationType: string;
  targetIntensity?: string;
  targetDayNumber?: number;
  adaptationSummary?: string;
}) {
  const id = `fb-${Date.now()}`;
  const stmt = db.prepare(`
    INSERT INTO feedback_logs (
      id, user_id, plan_id, feedback_text, adaptation_type, target_intensity,
      target_day_number, adaptation_summary, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  stmt.run(
    id,
    data.userId,
    data.planId,
    data.feedbackText,
    data.adaptationType,
    data.targetIntensity || null,
    data.targetDayNumber || null,
    data.adaptationSummary || null
  );

  return id;
}

// Nutrition Recommendation CRUD
export function saveNutritionRecommendation(data: {
  userId: string;
  planId?: string;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  hydrationLiters: number;
  mealTimingProtocol: string;
  supplementGuidance: string;
  sleepRecoveryProtocol: string;
  activeRecoveryProtocol: string;
}) {
  const id = `nutr-${Date.now()}`;
  const stmt = db.prepare(`
    INSERT INTO nutrition_recommendations (
      id, user_id, plan_id, daily_calories, protein_grams, carbs_grams, fats_grams,
      hydration_liters, meal_timing_protocol, supplement_guidance,
      sleep_recovery_protocol, active_recovery_protocol, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  stmt.run(
    id,
    data.userId,
    data.planId || null,
    data.dailyCalories,
    data.proteinGrams,
    data.carbsGrams,
    data.fatsGrams,
    data.hydrationLiters,
    data.mealTimingProtocol,
    data.supplementGuidance,
    data.sleepRecoveryProtocol,
    data.activeRecoveryProtocol
  );

  return id;
}

export function getLatestNutritionRecommendation(userId: string) {
  const row = db.prepare('SELECT * FROM nutrition_recommendations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId) as any;
  return row || null;
}

// Workout Session Logging
export function saveWorkoutSession(data: {
  userId: string;
  planId?: string;
  dayNumber: number;
  dayTitle: string;
  durationMinutes: number;
  perceivedRpe: number;
  caloriesBurned: number;
  intensity?: string;
  notes?: string;
}) {
  const id = `sess-${Date.now()}`;
  const stmt = db.prepare(`
    INSERT INTO workout_sessions (
      id, user_id, plan_id, day_number, day_title, duration_minutes,
      perceived_rpe, calories_burned, intensity, notes, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  stmt.run(
    id,
    data.userId,
    data.planId || null,
    data.dayNumber,
    data.dayTitle,
    data.durationMinutes,
    data.perceivedRpe,
    data.caloriesBurned,
    data.intensity || 'medium',
    data.notes || null
  );

  return id;
}

// Admin Aggregates & Dashboard Stats
export function getAdminStats() {
  const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  const totalPlans = (db.prepare('SELECT COUNT(*) as count FROM workout_plans').get() as any).count;
  const totalFeedbacks = (db.prepare('SELECT COUNT(*) as count FROM feedback_logs').get() as any).count;
  const totalSessions = (db.prepare('SELECT COUNT(*) as count FROM workout_sessions').get() as any).count;

  const avgCalories = (db.prepare('SELECT AVG(calories_burned) as avg FROM workout_sessions').get() as any).avg || 0;
  const avgDuration = (db.prepare('SELECT AVG(duration_minutes) as avg FROM workout_sessions').get() as any).avg || 0;

  const intensityStats = db.prepare(`
    SELECT workout_intensity, COUNT(*) as count
    FROM users
    GROUP BY workout_intensity
  `).all() as { workout_intensity: string; count: number }[];

  const goalStats = db.prepare(`
    SELECT primary_goal, COUNT(*) as count
    FROM users
    GROUP BY primary_goal
  `).all() as { primary_goal: string; count: number }[];

  return {
    totalUsers,
    totalPlans,
    totalFeedbacks,
    totalSessions,
    avgCalories: Math.round(avgCalories),
    avgDuration: Math.round(avgDuration),
    intensityDistribution: {
      low: intensityStats.find((s) => s.workout_intensity === 'low')?.count || 0,
      medium: intensityStats.find((s) => s.workout_intensity === 'medium')?.count || 0,
      high: intensityStats.find((s) => s.workout_intensity === 'high')?.count || 0,
    },
    goalDistribution: goalStats,
  };
}
