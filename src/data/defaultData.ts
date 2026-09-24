import { FitnessPlan, UserProfile } from '../types/fitness';

export const STARTER_PROFILES: { label: string; description: string; profile: UserProfile }[] = [
  {
    label: 'Busy Professional (30m Quick Dumbbells)',
    description: '4 days/wk, 30 min home dumbbell & bodyweight sessions designed for fat loss and lean tone.',
    profile: {
      name: 'Alex Morgan',
      age: 32,
      gender: 'Non-binary',
      primaryGoal: 'fat_loss',
      secondaryGoals: ['Cardiovascular fitness', 'Core stability'],
      experienceLevel: 'intermediate',
      availableEquipment: ['dumbbells', 'resistance_bands', 'bodyweight'],
      daysPerWeek: 4,
      minutesPerSession: 30,
      limitations: ['Tight hip flexors from desk work'],
      customLimitation: '',
      workoutPreferences: ['Supersets', 'Functional mobility', 'HIIT finisher'],
      workoutIntensity: 'medium',
      targetTimelineWeeks: 8,
      wellnessPreferences: {
        dietaryStyle: 'High protein balanced',
        hydrationGoalLiters: 2.8,
        sleepTargetHours: 7.5,
        recoveryFocus: ['Active walking', 'Desk mobility drills']
      }
    }
  },
  {
    label: 'Gym Strength & Hypertrophy (PPL)',
    description: '5 days/wk full commercial gym barbell & machine split for progressive muscle growth.',
    profile: {
      name: 'Jordan Lee',
      age: 27,
      gender: 'Male',
      primaryGoal: 'muscle_gain',
      secondaryGoals: ['Raw bench/squat strength', 'Upper back posture'],
      experienceLevel: 'advanced',
      availableEquipment: ['full_gym', 'barbell_plates', 'dumbbells', 'cable_machine'],
      daysPerWeek: 5,
      minutesPerSession: 60,
      limitations: ['Slight right shoulder click on overhead press'],
      customLimitation: '',
      workoutPreferences: ['Strength-focused', 'Progressive overload', 'Pyramid sets'],
      targetTimelineWeeks: 12,
      wellnessPreferences: {
        dietaryStyle: 'Caloric surplus high protein',
        hydrationGoalLiters: 3.5,
        sleepTargetHours: 8,
        recoveryFocus: ['Foam rolling', 'Sauna/deload protocols']
      }
    }
  },
  {
    label: 'Bodyweight Calisthenics & Joint Longevity',
    description: '3 days/wk zero-equipment routine prioritizing mobility, core control, and low impact joints.',
    profile: {
      name: 'Elena Rostova',
      age: 39,
      gender: 'Female',
      primaryGoal: 'mobility_flexibility',
      secondaryGoals: ['Functional core power', 'Lower back resilience'],
      experienceLevel: 'beginner',
      availableEquipment: ['bodyweight', 'resistance_bands'],
      daysPerWeek: 3,
      minutesPerSession: 45,
      limitations: ['Sensitive lower back after prolonged sitting'],
      customLimitation: '',
      workoutPreferences: ['Calisthenics', 'Pilates/Mobility flow', 'Low impact'],
      targetTimelineWeeks: 6,
      wellnessPreferences: {
        dietaryStyle: 'Anti-inflammatory Mediterranean',
        hydrationGoalLiters: 2.5,
        sleepTargetHours: 8,
        recoveryFocus: ['Spinal decompression', 'Gentle yoga walks']
      }
    }
  },
  {
    label: 'Athletic Conditioning & Kettlebell Hybrid',
    description: '4 days/wk dynamic power, kettlebell swings, and high-stamina circuits.',
    profile: {
      name: 'Marcus Chen',
      age: 35,
      gender: 'Male',
      primaryGoal: 'athletic_performance',
      secondaryGoals: ['Metabolic conditioning', 'Grip endurance'],
      experienceLevel: 'intermediate',
      availableEquipment: ['kettlebells', 'pullup_bar', 'bodyweight', 'resistance_bands'],
      daysPerWeek: 4,
      minutesPerSession: 45,
      limitations: ['Old ankle sprain stiffness'],
      customLimitation: '',
      workoutPreferences: ['Circuit training', 'Interval conditioning', 'Kettlebell complexes'],
      targetTimelineWeeks: 8,
      wellnessPreferences: {
        dietaryStyle: 'Nutrient dense whole foods',
        hydrationGoalLiters: 3.2,
        sleepTargetHours: 7.5,
        recoveryFocus: ['Cold showers', 'Ankle flossing mobility']
      }
    }
  }
];

export const INITIAL_SAMPLE_PLAN: FitnessPlan = {
  id: 'plan-starter-default',
  title: 'Metabolic Tone & Hypertrophy Split',
  overview: 'A high-efficiency 4-day hybrid split designed for balanced muscular hypertrophy, metabolic fat loss, and spinal posture alignment with home dumbbells and resistance bands.',
  intensity: 'medium',
  generatedAt: new Date().toISOString(),
  profileSnapshot: STARTER_PROFILES[0].profile,
  splitType: 'Upper Body Tone & Lower Body Conditioning Split (4 Days)',
  weeklySchedule: [
    {
      dayNumber: 1,
      dayTitle: 'Day 1: Upper Torso Push & Horizontal Pull',
      focus: 'Chest, Upper Back, Triceps & Scapular Stability',
      isRestDay: false,
      estimatedDurationMin: 32,
      estimatedCaloriesBurn: 240,
      warmup: {
        durationMin: 5,
        activities: [
          { name: 'Arm Circles & Band Dislocates', durationOrReps: '10 forward, 10 reverse', cue: 'Keep ribs tucked and shoulders relaxed.' },
          { name: 'Cat-Cow & Thread-the-Needle', durationOrReps: '8 reps per side', cue: 'Mobilize thoracic spine without forcing neck.' },
          { name: 'Push-up Plank Shoulder Taps', durationOrReps: '16 slow touches', cue: 'Lock hips level to the floor.' }
        ]
      },
      exercises: [
        {
          id: 'ex-101',
          name: 'Dumbbell Floor Press with Pause',
          targetMuscleGroup: 'Pectoralis Major & Anterior Deltoid',
          secondaryMuscles: ['Triceps Brachii', 'Core'],
          sets: 3,
          reps: '10-12 reps',
          restSeconds: 60,
          rpe: 'RPE 7.5',
          equipment: 'Dumbbells',
          coachingCues: ['Plant feet flat on floor', 'Drive elbows at 45-degree angle', 'Brief 1-sec pause at floor contact before explosive press'],
          commonMistakes: ['Flaring elbows 90 degrees wide', 'Lifting hips off the floor'],
          alternativeExercise: 'Push-ups with hands on elevated surface or Push-ups on knees',
          tempo: '3-1-1-0'
        },
        {
          id: 'ex-102',
          name: 'Single-Arm Supported Dumbbell Row',
          targetMuscleGroup: 'Latissimus Dorsi & Rhomboids',
          secondaryMuscles: ['Biceps Brachii', 'Posterior Deltoid'],
          sets: 3,
          reps: '10-12 reps / arm',
          restSeconds: 60,
          rpe: 'RPE 8',
          equipment: 'Dumbbells + Chair/Bench',
          coachingCues: ['Pull elbow back toward back hip pocket', 'Maintain neutral spine from crown to tailbone', 'Squeeze lat peak for 1 second'],
          commonMistakes: ['Jerking torso upwards to yank dumbbell', 'Rounding lower back'],
          alternativeExercise: 'Resistance Band Kneeling Row',
          tempo: '2-1-1-0'
        },
        {
          id: 'ex-103',
          name: 'Standing Neutral Dumbbell Overhead Press',
          targetMuscleGroup: 'Anterior & Medial Deltoids',
          secondaryMuscles: ['Triceps', 'Upper Trapezius', 'Core'],
          sets: 3,
          reps: '10 reps',
          restSeconds: 60,
          rpe: 'RPE 7',
          equipment: 'Dumbbells',
          coachingCues: ['Use neutral palms-facing-in grip to spare shoulder joint', 'Brace glutes and abs tight to avoid arching back'],
          commonMistakes: ['Hyperextending lumbar spine to push weight overhead'],
          alternativeExercise: 'Resistance Band High Diagonal Pull-Aparts',
          tempo: '2-0-1-0'
        },
        {
          id: 'ex-104',
          name: 'Resistance Band Face Pull & External Rotation',
          targetMuscleGroup: 'Rear Deltoids & Infraspinatus',
          secondaryMuscles: ['Rhomboids', 'Mid Traps'],
          sets: 3,
          reps: '15 reps',
          restSeconds: 45,
          rpe: 'RPE 7',
          equipment: 'Resistance Band',
          coachingCues: ['Anchor band at eye height', 'Lead with knuckles and pull toward temples', 'Spread band wide at peak contraction'],
          commonMistakes: ['Shrugging shoulders into ears'],
          alternativeExercise: 'Prone Y-T-W Floor Raises',
          tempo: '2-1-1-0'
        },
        {
          id: 'ex-105',
          name: 'Overhead Dumbbell Tricep Extension (Seated)',
          targetMuscleGroup: 'Triceps (Long Head)',
          secondaryMuscles: ['Forearms'],
          sets: 2,
          reps: '12-15 reps',
          restSeconds: 45,
          rpe: 'RPE 7.5',
          equipment: 'Single Dumbbell',
          coachingCues: ['Keep upper arms vertical and close to ears', 'Lower bell behind crown with controlled deep tricep stretch'],
          commonMistakes: ['Flaring elbows excessively outwards'],
          alternativeExercise: 'Diamond Floor Push-ups or Chair Tricep Dips',
          tempo: '3-0-1-0'
        }
      ],
      cooldown: {
        durationMin: 4,
        stretches: [
          { name: 'Doorway Chest & Bicep Stretch', holdTime: '30s per side', cue: 'Gently breathe into upper chest without rotating hips.' },
          { name: 'Cross-Body Posterior Deltoid Stretch', holdTime: '30s per side', cue: 'Depress shoulder blade down away from ear.' },
          { name: 'Childs Pose with Lat Reach', holdTime: '45s total', cue: 'Sink hips back toward heels and walk hands forward.' }
        ]
      },
      recoveryNotes: 'Consume 25-30g of lean protein within 90 minutes. Drink 500ml water with electrolytes.'
    },
    {
      dayNumber: 2,
      dayTitle: 'Day 2: Lower Body Power & Posterior Chain Strength',
      focus: 'Glutes, Quadriceps, Hamstrings & Hip Hinge Mechanics',
      isRestDay: false,
      estimatedDurationMin: 34,
      estimatedCaloriesBurn: 275,
      warmup: {
        durationMin: 5,
        activities: [
          { name: 'World Greatest Stretch', durationOrReps: '5 reps per side', cue: 'Step into deep lunge, rotate upper torso skyward.' },
          { name: 'Glute Bridges with 2-sec Pause', durationOrReps: '12 reps', cue: 'Drive through heels, recruit glutes at peak.' },
          { name: 'Bodyweight Air Squats', durationOrReps: '10 smooth reps', cue: 'Track knees over toes, chest upright.' }
        ]
      },
      exercises: [
        {
          id: 'ex-201',
          name: 'Goblet Squat to Box / Chair',
          targetMuscleGroup: 'Quadriceps & Gluteus Maximus',
          secondaryMuscles: ['Adductors', 'Erector Spinae', 'Core'],
          sets: 3,
          reps: '10-12 reps',
          restSeconds: 60,
          rpe: 'RPE 8',
          equipment: 'Dumbbell',
          coachingCues: ['Hold dumbbell tight against sternum like a goblet', 'Push knees outwards along line of middle toes', 'Tap box lightly without resting weight'],
          commonMistakes: ['Caving knees inward (valgus collapse)', 'Rounding upper back forward'],
          alternativeExercise: 'Bodyweight Box Squat with isometric pause at bottom',
          tempo: '3-1-1-0'
        },
        {
          id: 'ex-202',
          name: 'Dumbbell Romanian Deadlift (RDL)',
          targetMuscleGroup: 'Hamstrings & Posterior Chain',
          secondaryMuscles: ['Gluteus Maximus', 'Latissimus Dorsi', 'Spinal Erectors'],
          sets: 3,
          reps: '10-12 reps',
          restSeconds: 60,
          rpe: 'RPE 7.5',
          equipment: 'Dumbbells',
          coachingCues: ['Soft knee unlock, then initiate movement by pushing hips straight back toward the wall', 'Shave dumbbells down along shins', 'Feel intense tension in hamstring bellies'],
          commonMistakes: ['Squatting down instead of hinging hips back', 'Rounding lumbar spine'],
          alternativeExercise: 'Single-Leg Romanian Deadlift (Bodyweight balance focus)',
          tempo: '3-1-1-0'
        },
        {
          id: 'ex-203',
          name: 'Elevated Reverse Lunges (Alternating)',
          targetMuscleGroup: 'Glutes & Quads',
          secondaryMuscles: ['Calves', 'Core Stabilizers'],
          sets: 3,
          reps: '10 reps / leg',
          restSeconds: 60,
          rpe: 'RPE 8',
          equipment: 'Dumbbells or Bodyweight',
          coachingCues: ['Step back into soft landing, front shin vertical', 'Drive forcefully through front heel to return to standing'],
          commonMistakes: ['Slamming rear knee onto hard floor', 'Leaning torso excessively sideways'],
          alternativeExercise: 'Stationary Split Squat (Bodyweight)',
          tempo: '2-0-1-0'
        },
        {
          id: 'ex-204',
          name: 'Deadbug Core Anti-Extension Press',
          targetMuscleGroup: 'Transverse Abdominis & Rectus Abdominis',
          secondaryMuscles: ['Hip Flexors'],
          sets: 3,
          reps: '12 alternating reps',
          restSeconds: 45,
          rpe: 'RPE 7',
          equipment: 'Bodyweight',
          coachingCues: ['Flatten lower back completely against the floor like pinning a sheet of paper', 'Slowly extend opposite arm and leg without arching spine'],
          commonMistakes: ['Lower back arching off floor during limb extension'],
          alternativeExercise: 'Hollow Body Hold (Bent knees)',
          tempo: '3-1-3-0'
        }
      ],
      cooldown: {
        durationMin: 4,
        stretches: [
          { name: 'Half-Kneeling Hip Flexor Stretch', holdTime: '40s per side', cue: 'Tuck pelvis under (posterior tilt) and squeeze back glute.' },
          { name: 'Figure-Four Glute Stretch', holdTime: '40s per side', cue: 'Cross ankle over opposite knee, gently pull thigh toward chest.' },
          { name: 'Standing Quad & Ankle Stretch', holdTime: '30s per side', cue: 'Keep knees together, stand tall.' }
        ]
      },
      recoveryNotes: 'Take a gentle 15-minute post-meal walk in the evening to accelerate glycogen replenishment and reduce DOMS.'
    },
    {
      dayNumber: 3,
      dayTitle: 'Day 3: Active Rest & Structural Mobility Recharge',
      focus: 'Systemic Nervous System Recovery, Lymphatic Flow & Joint Mobility',
      isRestDay: true,
      estimatedDurationMin: 20,
      estimatedCaloriesBurn: 110,
      warmup: {
        durationMin: 3,
        activities: [
          { name: 'Diaphragmatic Box Breathing (4-4-4-4)', durationOrReps: '3 minutes', cue: 'Inhale deep into belly for 4s, hold 4s, exhale 4s, hold 4s.' }
        ]
      },
      exercises: [],
      cooldown: {
        durationMin: 15,
        stretches: [
          { name: '90/90 Hip Rotations', holdTime: '60s per side', cue: 'Slowly shift between internal and external hip rotation.' },
          { name: 'Thoracic Extension over Foam Roller or Rolled Towel', holdTime: '90s total', cue: 'Support head with hands, gently extend upper back.' },
          { name: 'Pigeon Pose or Reclined Figure Four', holdTime: '60s per side', cue: 'Breathe into outer glute tension.' },
          { name: 'Legs-Up-The-Wall Restoration', holdTime: '5 minutes', cue: 'Elevate legs to assist venous return and downregulate heart rate.' }
        ]
      },
      recoveryNotes: 'Prioritize 8 hours of sleep tonight. Keep hydration steady at 2.8+ liters. Aim for 7,000 to 10,000 casual steps.'
    },
    {
      dayNumber: 4,
      dayTitle: 'Day 4: Full Body High-Density Conditioning & Core',
      focus: 'Metabolic Output, Full Body Synergy & Rotational Strength',
      isRestDay: false,
      estimatedDurationMin: 30,
      estimatedCaloriesBurn: 260,
      warmup: {
        durationMin: 5,
        activities: [
          { name: 'Inchworm to Cobra to Downward Dog', durationOrReps: '6 reps', cue: 'Walk hands out, open hips, push chest toward thighs.' },
          { name: 'Lateral Hip Openers (Spiderman Lunge)', durationOrReps: '5 reps / side', cue: 'Open adductors with tall chest.' },
          { name: 'Jumping Jacks or Quick Step Jacks', durationOrReps: '45 seconds', cue: 'Elevate core body temperature.' }
        ]
      },
      exercises: [
        {
          id: 'ex-401',
          name: 'Dumbbell Thrusters (Squat to Overhead Press)',
          targetMuscleGroup: 'Quads, Shoulders & Triceps',
          secondaryMuscles: ['Glutes', 'Core', 'Cardiovascular System'],
          sets: 3,
          reps: '10-12 reps',
          restSeconds: 60,
          rpe: 'RPE 8.5',
          equipment: 'Dumbbells',
          coachingCues: ['Descend into full squat with dumbbells at shoulders', 'Drive up explosively through legs and transfer momentum into press', 'Lock out overhead with ribs controlled'],
          commonMistakes: ['Pressing before the legs finish driving', 'Dumbbells drifting too far in front of forehead'],
          alternativeExercise: 'Dumbbell Push Press or Bodyweight Squat Jump (low impact version: speedy air squats)',
          tempo: '2-0-X-0'
        },
        {
          id: 'ex-402',
          name: 'Renegade Rows in High Plank',
          targetMuscleGroup: 'Upper Back & Anti-Rotational Core',
          secondaryMuscles: ['Obliques', 'Biceps', 'Shoulders'],
          sets: 3,
          reps: '8 reps / side',
          restSeconds: 60,
          rpe: 'RPE 8',
          equipment: 'Dumbbells',
          coachingCues: ['Widen feet wider than hips for stable tripod base', 'Pull one dumbbell up to hip without twisting pelvis', 'Return weight gently to ground before switching sides'],
          commonMistakes: ['Twisting hips violently from side to side', 'Holding breath'],
          alternativeExercise: 'Bird-Dog with 3-sec pause at extension',
          tempo: '2-1-1-0'
        },
        {
          id: 'ex-403',
          name: 'Dumbbell Farmer Walk or Marches in Place',
          targetMuscleGroup: 'Grip, Forearms & Obliques',
          secondaryMuscles: ['Traps', 'Glutes', 'Core'],
          sets: 3,
          reps: '45 seconds',
          restSeconds: 45,
          rpe: 'RPE 7.5',
          equipment: 'Dumbbells',
          coachingCues: ['Hold dumbbells at sides with tall athletic posture', 'March knees to hip height with deliberate control and stability', 'Do not let torso sway sideways'],
          commonMistakes: ['Slouching shoulders forward', 'Rushing reps instead of controlling each single-leg balance'],
          alternativeExercise: 'Suitcase Carry (Single dumbbell to challenge asymmetric core)',
          tempo: 'Deliberate cadence'
        },
        {
          id: 'ex-404',
          name: 'Side Plank with Top Leg Lift / Clamshell',
          targetMuscleGroup: 'Gluteus Medius & Internal/External Obliques',
          secondaryMuscles: ['Shoulder Stabilizers'],
          sets: 2,
          reps: '30 seconds / side',
          restSeconds: 45,
          rpe: 'RPE 7.5',
          equipment: 'Bodyweight',
          coachingCues: ['Elbow stacked directly under shoulder', 'Lift hips to form straight line from shoulder to ankle'],
          commonMistakes: ['Sagging hips toward the mat', 'Rotating chest toward floor'],
          alternativeExercise: 'Knee-Supported Side Plank',
          tempo: 'Isometric'
        }
      ],
      cooldown: {
        durationMin: 4,
        stretches: [
          { name: 'Puppy Dog Pose (Heart Melting)', holdTime: '45s', cue: 'Hips high over knees, melt chest toward floor to open shoulders.' },
          { name: 'Seated Spinal Twist', holdTime: '30s / side', cue: 'Lengthen spine tall before gently rotating from ribs.' },
          { name: 'Deep Diaphragmatic Calming Breathing', holdTime: '60s', cue: 'Place hand over heart and belly, downshift heart rate.' }
        ]
      },
      recoveryNotes: 'Replenish electrolytes. High nutrient density dinner with complex carbohydrates and lean protein.'
    },
    {
      dayNumber: 5,
      dayTitle: 'Day 5: Posterior Chain Hinge & Pull Hypertrophy',
      focus: 'Lats, Rhomboids, Hamstrings & Bicep Peak',
      isRestDay: false,
      estimatedDurationMin: 32,
      estimatedCaloriesBurn: 245,
      warmup: {
        durationMin: 5,
        activities: [
          { name: 'Band Pull-Aparts', durationOrReps: '15 reps', cue: 'Feel blades glide toward each other.' },
          { name: 'Bodyweight Good Mornings', durationOrReps: '10 reps', cue: 'Hands behind head, push hips back with soft knees.' },
          { name: 'Scapular Wall Slides', durationOrReps: '8 reps', cue: 'Keep forearms and lower back flush against wall.' }
        ]
      },
      exercises: [
        {
          id: 'ex-501',
          name: 'Dumbbell Romanian Deadlift to Shrug',
          targetMuscleGroup: 'Hamstrings, Glutes & Upper Trapezius',
          secondaryMuscles: ['Forearms', 'Core'],
          sets: 3,
          reps: '10 reps',
          restSeconds: 60,
          rpe: 'RPE 8',
          equipment: 'Dumbbells',
          coachingCues: ['Perform smooth hip hinge until dumbbells pass below knees', 'Snap hips through to vertical and add a smooth shrug at top'],
          commonMistakes: ['Over-arching lower back at top lockout'],
          alternativeExercise: 'Single-Leg Glute Bridge with isometric squeeze',
          tempo: '3-0-1-1'
        },
        {
          id: 'ex-502',
          name: 'Dual Dumbbell Bent-Over Row (Underhand Supinated)',
          targetMuscleGroup: 'Lower Lats & Biceps',
          secondaryMuscles: ['Middle Trapezius', 'Posterior Deltoids'],
          sets: 3,
          reps: '10-12 reps',
          restSeconds: 60,
          rpe: 'RPE 7.5',
          equipment: 'Dumbbells',
          coachingCues: ['Turn palms facing forward (supinated) to recruit lower lats and biceps', 'Pull dumbbells toward navel', 'Hold contraction for 1 second'],
          commonMistakes: ['Standing too upright (less than 45 degree torso)'],
          alternativeExercise: 'Doorframe Towel Rows',
          tempo: '2-1-1-0'
        },
        {
          id: 'ex-503',
          name: 'Hammer Curls with Controlled Negative',
          targetMuscleGroup: 'Brachialis & Brachioradialis',
          secondaryMuscles: ['Biceps Brachii'],
          sets: 3,
          reps: '12 reps',
          restSeconds: 45,
          rpe: 'RPE 7.5',
          equipment: 'Dumbbells',
          coachingCues: ['Keep palms facing each other (neutral grip)', 'Pin elbows strictly to your ribs without swinging', 'Take 3 full seconds to lower the dumbbells'],
          commonMistakes: ['Using momentum or rocking shoulders backward to cheat the weight'],
          alternativeExercise: 'Resistance Band Hammer Curls',
          tempo: '3-0-1-0'
        }
      ],
      cooldown: {
        durationMin: 4,
        stretches: [
          { name: 'Kneeling Lat & Tricep Stretch', holdTime: '40s / side', cue: 'Place elbow on chair with palms together behind head, sink chest down.' },
          { name: 'Standing Hamstring Sweep', holdTime: '8 sweeps / side', cue: 'Hinge back with one heel planted, sweep arms through smoothly.' }
        ]
      },
      recoveryNotes: 'Take magnesium glycinate and stay hydrated. You completed the week strong!'
    },
    {
      dayNumber: 6,
      dayTitle: 'Day 6: Outdoor Aerobic Zone 2 or Free Play',
      focus: 'Mitochondrial Density, Aerobic Base & Mental Wellbeing',
      isRestDay: true,
      estimatedDurationMin: 35,
      estimatedCaloriesBurn: 200,
      warmup: {
        durationMin: 3,
        activities: [
          { name: 'Gentle ankle circles and leg swings', durationOrReps: '10 reps each', cue: 'Relax joints and warm up gait.' }
        ]
      },
      exercises: [],
      cooldown: {
        durationMin: 5,
        stretches: [
          { name: 'Calf & Achilles Wall Stretch', holdTime: '45s / leg', cue: 'Press back heel firmly into floor with straight knee.' },
          { name: 'Standing Quad Stretch', holdTime: '30s / leg', cue: 'Maintain tall upright posture.' }
        ]
      },
      recoveryNotes: 'Brisk walk, outdoor cycle, or recreational sport at a conversational conversational pace (Zone 2 heart rate).'
    },
    {
      dayNumber: 7,
      dayTitle: 'Day 7: Complete Rest & Weekly Reset',
      focus: 'Central Nervous System Restoration & Goal Reflection',
      isRestDay: true,
      estimatedDurationMin: 0,
      estimatedCaloriesBurn: 0,
      warmup: {
        durationMin: 0,
        activities: []
      },
      exercises: [],
      cooldown: {
        durationMin: 10,
        stretches: [
          { name: 'Full Body Gentle Flow or Warm Epsom Salt Soak', holdTime: '10 min', cue: 'Let muscles fully soften.' }
        ]
      },
      recoveryNotes: 'Meal prep for the upcoming week, assess your energy, and celebrate consistency.'
    }
  ],
  progressionStrategy: {
    weeklyProgressionRule: 'Apply the 2-for-2 progressive overload rule: if you complete all prescribed sets and reps with target RPE for two consecutive workouts, increase dumbbell weight by 1-2.5 kg or add 1-2 reps per set.',
    deloadRecommendation: 'Take a planned deload on Week 5 by reducing volume (sets from 3 down to 2) and keeping RPE at or below 6 to allow connective tissue remodeling.',
    milestones: [
      'Week 2: Perfecting movement mechanics, zero joint friction, consistent hydration streak.',
      'Week 4: Noticeable increases in muscular stamina, improved posture during working hours.',
      'Week 8: Visible body recomposition, enhanced core stability, and increased dumbbell resistance loads.'
    ]
  },
  wellnessGuide: {
    dailyProteinRecommendation: 'Aim for 1.6 to 2.0 grams of protein per kilogram of body weight (approx. 110-135g daily for lean tissue preservation).',
    hydrationGuideline: 'Drink 2.8 liters of water daily, plus an additional 500ml on training days with a pinch of sea salt or electrolyte packet.',
    sleepAndRecoveryProtocol: 'Maintain a consistent sleep window: 7.5 to 8 hours nightly. Dim screens 45 minutes before sleep to support deep phase growth hormone release.',
    stressManagementTip: 'Perform 3 minutes of physiological sigh breathing (two quick inhales through nose, long relaxed exhale through mouth) before stressful meetings or post-workout.',
    preWorkoutNutrition: 'Eat a light carbohydrate and protein snack 45-60 minutes prior (e.g., banana with 1 tbsp peanut butter or rice cake with whey shake).',
    postWorkoutRecovery: 'Consume 25-30g of fast-absorbing protein and 30g complex carbohydrates within 2 hours of completing resistance training.'
  },
  motivationalMantra: 'Consistency trumps intensity. Small daily deposits build an unshakeable athletic foundation.',
  coachNotes: 'Alex, your plan is dialed specifically for your home dumbbell setup and desk-worker posture. Pay close attention to thoracic mobility and scapular retraction. Never hesitate to use the "Adapt Plan" button if your schedule changes or you experience fatigue!',
  adaptationHistory: [
    {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      reason: 'Initial Plan Creation',
      changesSummary: 'Engineered 4-day hybrid split optimized for 30-min duration, home dumbbells, and hip/back posture restoration.'
    }
  ]
};
