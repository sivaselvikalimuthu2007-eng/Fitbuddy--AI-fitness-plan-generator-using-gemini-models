export type PrimaryGoal =
  | 'fat_loss'
  | 'muscle_gain'
  | 'strength'
  | 'endurance'
  | 'mobility_flexibility'
  | 'general_health'
  | 'athletic_performance';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'returning';

export type WorkoutIntensity = 'low' | 'medium' | 'high';

export type EquipmentType =
  | 'bodyweight'
  | 'dumbbells'
  | 'barbell_plates'
  | 'kettlebells'
  | 'resistance_bands'
  | 'pullup_bar'
  | 'cable_machine'
  | 'full_gym'
  | 'cardio_machines';

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  primaryGoal: PrimaryGoal;
  secondaryGoals: string[];
  experienceLevel: ExperienceLevel;
  workoutIntensity?: WorkoutIntensity;
  availableEquipment: EquipmentType[];
  daysPerWeek: number;
  minutesPerSession: number;
  limitations: string[];
  customLimitation: string;
  workoutPreferences: string[];
  targetTimelineWeeks: number;
  wellnessPreferences: {
    dietaryStyle: string;
    hydrationGoalLiters: number;
    sleepTargetHours: number;
    recoveryFocus: string[];
  };
}

export interface WarmupActivityItem {
  name: string;
  durationOrReps: string;
  cue: string;
}

export interface CooldownStretchItem {
  name: string;
  holdTime: string;
  cue: string;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscleGroup: string;
  secondaryMuscles: string[];
  sets: number;
  reps: string;
  restSeconds: number;
  rpe: string;
  equipment: string;
  coachingCues: string[];
  commonMistakes: string[];
  alternativeExercise: string;
  tempo: string;
}

export interface WorkoutDay {
  dayNumber: number;
  dayTitle: string;
  focus: string;
  isRestDay: boolean;
  intensity?: WorkoutIntensity;
  estimatedDurationMin: number;
  estimatedCaloriesBurn: number;
  warmup: {
    durationMin: number;
    activities: WarmupActivityItem[];
  };
  exercises: Exercise[];
  cooldown: {
    durationMin: number;
    stretches: CooldownStretchItem[];
  };
  recoveryNotes: string;
}

export interface ProgressionStrategy {
  weeklyProgressionRule: string;
  deloadRecommendation: string;
  milestones: string[];
}

export interface WellnessGuide {
  dailyProteinRecommendation: string;
  hydrationGuideline: string;
  sleepAndRecoveryProtocol: string;
  stressManagementTip: string;
  preWorkoutNutrition: string;
  postWorkoutRecovery: string;
}

export interface AdaptationRecord {
  date: string;
  reason: string;
  changesSummary: string;
}

export interface FitnessPlan {
  id: string;
  title: string;
  overview: string;
  generatedAt: string;
  intensity?: WorkoutIntensity;
  profileSnapshot: UserProfile;
  splitType: string;
  weeklySchedule: WorkoutDay[];
  progressionStrategy: ProgressionStrategy;
  wellnessGuide: WellnessGuide;
  motivationalMantra: string;
  coachNotes: string;
  adaptationHistory: AdaptationRecord[];
}

export interface WorkoutSessionLog {
  id: string;
  planId: string;
  dayNumber: number;
  dayTitle: string;
  dateCompleted: string;
  durationMinutes: number;
  exercisesCompleted: {
    exerciseId: string;
    exerciseName: string;
    completedSets: {
      setNumber: number;
      reps: number | string;
      weightKg?: number;
      completed: boolean;
    }[];
    notes?: string;
  }[];
  rpeFeedback: number;
  userNotes?: string;
}

export interface NutritionRecommendation {
  id?: string;
  userId?: string;
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
  generatedAt?: string;
}

export interface FeedbackLogItem {
  id: string;
  userId: string;
  planId: string;
  feedbackText: string;
  adaptationType: string;
  targetIntensity?: WorkoutIntensity;
  targetDayNumber?: number;
  adaptationSummary?: string;
  createdAt: string;
}
