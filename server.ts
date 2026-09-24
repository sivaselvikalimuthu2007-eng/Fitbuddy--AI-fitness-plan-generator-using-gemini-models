import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { fileURLToPath } from 'url';
import nunjucks from 'nunjucks';
import {
  initDatabase,
  getAllUsers,
  getUserWithDetails,
  saveUser,
  saveWorkoutPlan,
  saveFeedbackLog,
  saveNutritionRecommendation,
  getLatestNutritionRecommendation,
  saveWorkoutSession,
  getAdminStats,
  db,
} from './src/server/db';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Configure Jinja2 Templating Engine via Nunjucks
nunjucks.configure(path.resolve(process.cwd(), 'templates'), {
  autoescape: true,
  express: app,
  watch: false,
});
app.set('view engine', 'jinja2');

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MODEL_NAME = 'gemini-3.8-flash';

// Robust Gemini invoker with exponential backoff and instant model fallback on transient 503/429/quota limits
async function callGeminiWithRetry(params: any, retries = 2) {
  const modelsToTry = [MODEL_NAME, 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isQuota =
          errMsg.includes('429') ||
          errMsg.includes('Resource has been exhausted') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('Quota exceeded') ||
          errMsg.includes('quota');

        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('Overloaded');

        if (isQuota) {
          console.warn(`Quota rate limit hit on ${model}, instantly falling back to next available model.`);
          break; // Immediately try next model
        }

        if (isTransient && attempt < retries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        if (isTransient) {
          break; // Switch to next model in fallback list
        }
        throw err;
      }
    }
  }
  throw lastError || new Error('Gemini API calls failed after retries.');
}

// Response Schema for FitnessPlan
const fitnessPlanResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Creative, inspiring title for the personalized fitness program' },
    overview: { type: Type.STRING, description: 'Executive summary explaining why this plan fits the user’s exact goals, intensity tier, and limitations' },
    intensity: { type: Type.STRING, enum: ['low', 'medium', 'high'], description: 'Workout intensity level: low, medium, or high' },
    splitType: { type: Type.STRING, description: 'Training split structure e.g. Upper/Lower, Push/Pull/Legs, Full Body Circuit' },
    weeklySchedule: {
      type: Type.ARRAY,
      description: 'Full 7-day schedule (including designated rest/active recovery days)',
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER, description: 'Day 1 through 7' },
          dayTitle: { type: Type.STRING, description: 'e.g. Day 1: Posterior Chain & Hamstring Drive' },
          focus: { type: Type.STRING, description: 'Primary muscle groups or recovery focus' },
          isRestDay: { type: Type.BOOLEAN, description: 'True if active recovery or complete rest' },
          intensity: { type: Type.STRING, enum: ['low', 'medium', 'high'], description: 'Workout intensity tier for this specific session' },
          estimatedDurationMin: { type: Type.INTEGER, description: 'Workout time in minutes' },
          estimatedCaloriesBurn: { type: Type.INTEGER, description: 'Estimated metabolic expenditure' },
          warmup: {
            type: Type.OBJECT,
            properties: {
              durationMin: { type: Type.INTEGER },
              activities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    durationOrReps: { type: Type.STRING },
                    cue: { type: Type.STRING }
                  },
                  required: ['name', 'durationOrReps', 'cue']
                }
              }
            },
            required: ['durationMin', 'activities']
          },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                targetMuscleGroup: { type: Type.STRING },
                secondaryMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
                sets: { type: Type.INTEGER },
                reps: { type: Type.STRING },
                restSeconds: { type: Type.INTEGER },
                rpe: { type: Type.STRING },
                equipment: { type: Type.STRING },
                coachingCues: { type: Type.ARRAY, items: { type: Type.STRING } },
                commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
                alternativeExercise: { type: Type.STRING },
                tempo: { type: Type.STRING }
              },
              required: ['id', 'name', 'targetMuscleGroup', 'secondaryMuscles', 'sets', 'reps', 'restSeconds', 'rpe', 'equipment', 'coachingCues', 'commonMistakes', 'alternativeExercise', 'tempo']
            }
          },
          cooldown: {
            type: Type.OBJECT,
            properties: {
              durationMin: { type: Type.INTEGER },
              stretches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    holdTime: { type: Type.STRING },
                    cue: { type: Type.STRING }
                  },
                  required: ['name', 'holdTime', 'cue']
                }
              }
            },
            required: ['durationMin', 'stretches']
          },
          recoveryNotes: { type: Type.STRING }
        },
        required: ['dayNumber', 'dayTitle', 'focus', 'isRestDay', 'estimatedDurationMin', 'estimatedCaloriesBurn', 'warmup', 'exercises', 'cooldown', 'recoveryNotes']
      }
    },
    progressionStrategy: {
      type: Type.OBJECT,
      properties: {
        weeklyProgressionRule: { type: Type.STRING },
        deloadRecommendation: { type: Type.STRING },
        milestones: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['weeklyProgressionRule', 'deloadRecommendation', 'milestones']
    },
    wellnessGuide: {
      type: Type.OBJECT,
      properties: {
        dailyProteinRecommendation: { type: Type.STRING },
        hydrationGuideline: { type: Type.STRING },
        sleepAndRecoveryProtocol: { type: Type.STRING },
        stressManagementTip: { type: Type.STRING },
        preWorkoutNutrition: { type: Type.STRING },
        postWorkoutRecovery: { type: Type.STRING }
      },
      required: ['dailyProteinRecommendation', 'hydrationGuideline', 'sleepAndRecoveryProtocol', 'stressManagementTip', 'preWorkoutNutrition', 'postWorkoutRecovery']
    },
    motivationalMantra: { type: Type.STRING },
    coachNotes: { type: Type.STRING }
  },
  required: ['title', 'overview', 'splitType', 'weeklySchedule', 'progressionStrategy', 'wellnessGuide', 'motivationalMantra', 'coachNotes']
};

// API Endpoint: Generate Fresh Fitness Plan
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  try {
    const profile = req.body;
    if (!profile || !profile.primaryGoal) {
      return res.status(400).json({ error: 'User profile with primaryGoal is required.' });
    }

    const targetIntensity = profile.workoutIntensity || 'medium';

    const systemInstruction = `You are FitBuddy's master exercise physiologist, strength and conditioning specialist (CSCS), and functional wellness coach.
Your job is to produce an individualized, evidence-based, 7-day structured fitness & wellness plan for this exact individual.

CRITICAL INSTRUCTIONS:
1. Equipment Fidelity: ONLY prescribe exercises that use the user's available equipment: ${JSON.stringify(profile.availableEquipment)}. If only bodyweight or dumbbells are available, never prescribe cable machines or barbells!
2. Injury & Limitation Precaution: Respect all limitations rigorously: "${profile.limitations?.join(', ') || 'None'}" - ${profile.customLimitation || ''}. Provide joint-safe variations and explicit coaching cues to prevent strain.
3. Goal-Specific Biomechanics & Metabolic Modality:
   - If Goal is "fat_loss" (Weight Loss): Prioritize metabolic resistance density, supersets, active transitions, 12-20 reps, EPOC stimulation, and caloric deficit guidance with high protein (2.0-2.4g/kg) to preserve lean mass.
   - If Goal is "muscle_gain" (Muscle Gain): Prioritize mechanical tension, progressive overload, 8-12 reps with controlled 3-second eccentrics, 90-120s rest for ATP regeneration, and slight caloric surplus fueling.
   - If Goal is "mobility_flexibility" (Flexibility): Prioritize joint decompression, full kinetic range of motion, PNF stretching, active 30-60s isometric holds, thoracic/hip openers, and fascial hydration protocols.
   - If Goal is "general_health" (General Wellness): Prioritize sustainable functional longevity, multi-joint patterns (squat/hinge/push/pull/carry), posture correction, Zone 2 aerobic base, and stress downregulation.
4. Workout Intensity Options & Calibration (${targetIntensity.toUpperCase()} INTENSITY):
   - "low" Intensity: Target RPE 4–6. Volume: 2–3 sets per exercise, generous rest intervals (75–90s), gentle joint impact, steady controlled tempo, 3–4 reps in reserve (RIR), zero training to failure. Best for active recovery, gentle rehabilitation, beginners, or deloads.
   - "medium" Intensity: Target RPE 6.5–8. Volume: 3–4 sets per exercise, standard rest (60–90s for compounds, 45–60s for isolation), progressive overload with 2–3 reps in reserve (RIR). Best for sustainable hypertrophy, balanced strength, and consistent fitness gains.
   - "high" Intensity: Target RPE 8.5–10. Volume: 3–5 working sets, high mechanical tension or metabolic density (supersets/complexes), shorter rest intervals (30–45s) for metabolic conditioning or near-failure compound sets (1–2 RIR). Peak cardiovascular demand and maximum caloric burn.
   Ensure every exercise's sets, reps, restSeconds, and RPE rating reflect this "${targetIntensity}" intensity level!
5. Time Management: The user specified ${profile.minutesPerSession} minutes per session. Tailor the exercise count, warm-up, and rest intervals so it fits realistically within this timeframe.
6. Schedule Balance: Prescribe exactly ${profile.daysPerWeek} active training days and ${7 - profile.daysPerWeek} active recovery/rest days across the 7-day schedule (Days 1 through 7).
7. Comprehensive Detail: Every exercise must have practical coaching cues (3-4 crisp cues), common mistakes to avoid, exact sets & reps, tempo (e.g. 3-0-1-0 or controlled), and an accessible alternative.
8. Scientific Wellness: Provide tailored nutrition/protein, hydration, sleep, and recovery guidance aligned with their fitness goals (${profile.primaryGoal}).`;

    const userPrompt = `Generate a complete personalized fitness program for:
Name: ${profile.name || 'Athlete'}
Age: ${profile.age || 30}, Gender: ${profile.gender || 'Not specified'}
Primary Goal: ${profile.primaryGoal}
Target Workout Intensity: ${targetIntensity.toUpperCase()} (Options: Low, Medium, High)
Secondary Goals: ${profile.secondaryGoals?.join(', ') || 'General tone'}
Experience Level: ${profile.experienceLevel}
Available Equipment: ${profile.availableEquipment?.join(', ')}
Schedule: ${profile.daysPerWeek} days per week, ${profile.minutesPerSession} minutes per workout
Limitations/Injuries: ${profile.limitations?.join(', ') || 'None'} ${profile.customLimitation ? `(Note: ${profile.customLimitation})` : ''}
Training Preferences: ${profile.workoutPreferences?.join(', ') || 'Balanced'}
Dietary Style: ${profile.wellnessPreferences?.dietaryStyle || 'Balanced'}
Target Timeline: ${profile.targetTimelineWeeks || 8} weeks`;

    const response = await callGeminiWithRetry({
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: fitnessPlanResponseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error('No response received from Gemini model.');
    }

    const planData = JSON.parse(jsonText);
    const fullPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
      intensity: planData.intensity || targetIntensity,
      generatedAt: new Date().toISOString(),
      profileSnapshot: {
        ...profile,
        workoutIntensity: targetIntensity,
      },
      adaptationHistory: [
        {
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          reason: 'Initial Plan Generation',
          changesSummary: `Custom program built for ${profile.primaryGoal} over ${profile.daysPerWeek} weekly sessions.`
        }
      ]
    };

    // Store in SQLite database (SQLAlchemy models)
    try {
      const userId = saveUser({
        name: profile.name || 'Active Athlete',
        age: profile.age,
        gender: profile.gender,
        primary_goal: profile.primaryGoal,
        experience_level: profile.experienceLevel,
        workout_intensity: targetIntensity,
        days_per_week: profile.daysPerWeek,
        minutes_per_session: profile.minutesPerSession,
        availableEquipment: profile.availableEquipment,
        limitations: profile.limitations,
      });
      saveWorkoutPlan(fullPlan, userId);
    } catch (dbErr) {
      console.warn('SQLite storage notice on plan generation:', dbErr);
    }

    return res.json(fullPlan);
  } catch (error: any) {
    console.error('Error generating fitness plan:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate fitness plan.' });
  }
});

// API Endpoint: Dynamically Adapt Plan (Feedback-based workout plan modification)
app.post('/api/adapt-plan', async (req: Request, res: Response) => {
  try {
    const { currentPlan, feedbackPrompt, adaptationType, targetDayNumber, targetIntensity } = req.body;
    if (!currentPlan || !feedbackPrompt) {
      return res.status(400).json({ error: 'currentPlan and feedbackPrompt are required.' });
    }

    const effectiveIntensity = targetIntensity || currentPlan.profileSnapshot?.workoutIntensity || currentPlan.intensity || 'medium';

    const systemInstruction = `You are FitBuddy's master coach and exercise physiologist. The athlete is asking you to adapt their current fitness plan.
Read their current plan, their profile snapshot, target intensity (${effectiveIntensity.toUpperCase()}), and dynamic feedback.
Calibrate intensity levels accordingly:
- "low": Target RPE 4-6, 2-3 sets, longer rest (75-90s), gentle joint impact, zero failure.
- "medium": Target RPE 6.5-8, 3-4 sets, standard rest (60-90s), progressive overload with 2-3 RIR.
- "high": Target RPE 8.5-10, 3-5 sets, metabolic density/supersets, 30-45s rest or near-failure (1-2 RIR).
Produce an updated version of their plan adhering strictly to the JSON schema.
Ensure you update or preserve all 7 days appropriately.
In addition, formulate an executive summary of the changes made and explain how it accommodates their feedback.`;

    const prompt = `Current Plan Title: ${currentPlan.title}
Profile Snapshot: ${JSON.stringify(currentPlan.profileSnapshot)}
Requested Intensity Level: ${effectiveIntensity.toUpperCase()} (Low, Medium, or High)
Adaptation Request Type: ${adaptationType || 'Custom feedback'}
Target Day (if specific): ${targetDayNumber ? `Day ${targetDayNumber}` : 'Entire schedule'}
User Feedback & Situation: "${feedbackPrompt}"

Please re-engineer the fitness plan to address this request. Keep the parts that work well, and intelligently adjust the exercises, duration, intensity (Low, Medium, or High), or rest days to accommodate their needs.`;

    const response = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: fitnessPlanResponseSchema,
        temperature: 0.6,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error('No response from Gemini during plan adaptation.');
    }

    const adaptedData = JSON.parse(jsonText);
    const adaptationRecord = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      reason: `${adaptationType ? `[${adaptationType.toUpperCase()}] ` : ''}${feedbackPrompt.slice(0, 70)}${feedbackPrompt.length > 70 ? '...' : ''}`,
      changesSummary: adaptedData.overview || 'Plan updated based on athlete feedback.'
    };

    const updatedPlan = {
      ...adaptedData,
      id: currentPlan.id,
      intensity: adaptedData.intensity || effectiveIntensity,
      generatedAt: new Date().toISOString(),
      profileSnapshot: {
        ...currentPlan.profileSnapshot,
        workoutIntensity: effectiveIntensity,
      },
      adaptationHistory: [
        adaptationRecord,
        ...(currentPlan.adaptationHistory || [])
      ]
    };

    // Store in SQLite database (feedback log and plan update)
    try {
      const userProfile = currentPlan.profileSnapshot || {};
      const userId = saveUser({
        name: userProfile.name || 'Active Athlete',
        age: userProfile.age,
        gender: userProfile.gender,
        primary_goal: userProfile.primaryGoal || 'general_health',
        experience_level: userProfile.experienceLevel,
        workout_intensity: effectiveIntensity,
        days_per_week: userProfile.daysPerWeek,
        minutes_per_session: userProfile.minutesPerSession,
        availableEquipment: userProfile.availableEquipment,
        limitations: userProfile.limitations,
      });
      saveWorkoutPlan(updatedPlan, userId);
      saveFeedbackLog({
        userId,
        planId: currentPlan.id,
        feedbackText: feedbackPrompt,
        adaptationType: adaptationType || 'intensity',
        targetIntensity: effectiveIntensity,
        targetDayNumber: targetDayNumber || undefined,
        adaptationSummary: adaptationRecord.changesSummary,
      });
    } catch (dbErr) {
      console.warn('SQLite storage notice on plan adaptation:', dbErr);
    }

    return res.json(updatedPlan);
  } catch (error: any) {
    console.error('Error adapting plan:', error);
    return res.status(500).json({ error: error.message || 'Failed to adapt fitness plan.' });
  }
});

// API Endpoint: Quick Exercise Swap
app.post('/api/quick-exercise-swap', async (req: Request, res: Response) => {
  try {
    const { currentExercise, availableEquipment, limitation, reason } = req.body;
    if (!currentExercise) {
      return res.status(400).json({ error: 'currentExercise is required.' });
    }

    const swapSchema = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        targetMuscleGroup: { type: Type.STRING },
        secondaryMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
        sets: { type: Type.INTEGER },
        reps: { type: Type.STRING },
        restSeconds: { type: Type.INTEGER },
        rpe: { type: Type.STRING },
        equipment: { type: Type.STRING },
        coachingCues: { type: Type.ARRAY, items: { type: Type.STRING } },
        commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
        alternativeExercise: { type: Type.STRING },
        tempo: { type: Type.STRING },
        swapReasoning: { type: Type.STRING, description: 'Explanation of why this is a great alternative' }
      },
      required: ['id', 'name', 'targetMuscleGroup', 'secondaryMuscles', 'sets', 'reps', 'restSeconds', 'rpe', 'equipment', 'coachingCues', 'commonMistakes', 'alternativeExercise', 'tempo', 'swapReasoning']
    };

    const prompt = `Recommend a direct substitute exercise for:
Current Exercise: ${currentExercise.name} (Targets: ${currentExercise.targetMuscleGroup})
Current Equipment: ${currentExercise.equipment}
User Available Equipment: ${JSON.stringify(availableEquipment || ['bodyweight', 'dumbbells'])}
Limitation/Constraint: ${limitation || 'None'}
Reason for Swap: ${reason || 'User requested alternate movement'}

Provide an equivalent or regression/progression exercise that works the same primary muscle group safely.`;

    const response = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert biomechanics and strength coach. Provide an exact, high-quality substitute exercise in JSON format.',
        responseMimeType: 'application/json',
        responseSchema: swapSchema,
        temperature: 0.5,
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in quick swap:', error);
    return res.status(500).json({ error: error.message || 'Failed to swap exercise.' });
  }
});

// API Endpoint: AI Fitness Coach Chat
app.post('/api/coach-chat', async (req: Request, res: Response) => {
  try {
    const { message, planSummary, userProfile, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const systemInstruction = `You are Coach FitBuddy, an encouraging, knowledgeable, and certified fitness, nutrition, and recovery coach.
You have immediate access to the user's active fitness program and their personal profile.
Guidelines:
- Give direct, actionable, science-based advice.
- Keep answers concise, empathetic, and clear (max 3-4 bullet points or 2 short paragraphs unless deep breakdown is requested).
- If they ask about form, explain joint alignment and muscle activation cues.
- If they ask about soreness, explain active recovery and safe modifications.
- User Context:
  Goal: ${userProfile?.primaryGoal || 'General Fitness'}
  Experience: ${userProfile?.experienceLevel || 'Intermediate'}
  Equipment: ${userProfile?.availableEquipment?.join(', ') || 'Standard'}
  Active Plan Context: ${planSummary || 'Custom FitBuddy plan'}`;

    // Build contents from history plus current message
    const formattedContents: any[] = [];
    if (Array.isArray(chatHistory)) {
      for (const item of chatHistory.slice(-6)) {
        formattedContents.push({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.text }]
        });
      }
    }
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await callGeminiWithRetry({
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in coach chat:', error);
    return res.status(500).json({ error: error.message || 'Failed to communicate with coach.' });
  }
});

// ==========================================
// AI-GENERATED NUTRITION & RECOVERY RECOMMENDATIONS
// ==========================================
const nutritionRecoveryResponseSchema = {
  type: Type.OBJECT,
  properties: {
    dailyCalories: { type: Type.INTEGER, description: 'Target daily calories' },
    proteinGrams: { type: Type.INTEGER, description: 'Target daily protein in grams' },
    carbsGrams: { type: Type.INTEGER, description: 'Target daily carbohydrates in grams' },
    fatsGrams: { type: Type.INTEGER, description: 'Target daily fats in grams' },
    hydrationLiters: { type: Type.NUMBER, description: 'Target daily hydration in liters' },
    mealTimingProtocol: { type: Type.STRING, description: 'Pre, intra, and post-workout meal timing protocol' },
    supplementGuidance: { type: Type.STRING, description: 'Evidence-based ergogenic aids and supplements' },
    sleepRecoveryProtocol: { type: Type.STRING, description: 'Deep sleep and parasympathetic restoration protocol' },
    activeRecoveryProtocol: { type: Type.STRING, description: 'Zone 1 active recovery and mobility protocol' },
  },
  required: [
    'dailyCalories',
    'proteinGrams',
    'carbsGrams',
    'fatsGrams',
    'hydrationLiters',
    'mealTimingProtocol',
    'supplementGuidance',
    'sleepRecoveryProtocol',
    'activeRecoveryProtocol',
  ],
};

app.post('/api/generate-nutrition-recovery', async (req: Request, res: Response) => {
  try {
    const { profile, currentPlan } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Profile is required.' });
    }

    const intensity = currentPlan?.intensity || profile.workoutIntensity || 'medium';
    const goal = profile.primaryGoal || 'general_health';

    const systemInstruction = `You are FitBuddy's Chief Sports Nutritionist and Recovery Physiologist.
Generate an evidence-based, scientifically calibrated nutrition and recovery blueprint.
Calibrate to the athlete's intensity tier:
- Low Intensity: Moderate caloric expenditure, emphasize anti-inflammatory foods, joint recovery, hydration 2.5L-3.0L.
- Medium Intensity: Balanced progressive overload fueling, 1.8-2.2g/kg protein, targeted carbohydrate replenishment, hydration 3.0L-3.5L.
- High Intensity: High metabolic output & glycogen depletion, 2.0-2.4g/kg protein, rapid post-workout carb reload, electrolytes, contrast recovery, 3.5L-4.0L hydration.`;

    const prompt = `Athlete Demographics:
Age: ${profile.age || 30}, Gender: ${profile.gender || 'neutral'}, Weight: ${profile.weightKg || profile.weight_kg || 70}kg, Height: ${profile.heightCm || profile.height_cm || 175}cm
Primary Goal: ${goal}
Workout Intensity: ${intensity.toUpperCase()}
Sessions per Week: ${profile.daysPerWeek || 4}, Minutes/Session: ${profile.minutesPerSession || 45}
Dietary Style: ${profile.wellnessPreferences?.dietaryStyle || 'Balanced'}
Biomechanical Limitations: ${(profile.limitations || []).join(', ') || 'None'}
Active Workout Program: ${currentPlan?.title || 'FitBuddy Split'} (${currentPlan?.splitType || 'Hybrid Split'})

Formulate complete daily caloric and macro targets, meal timing, hydration, sleep protocols, and active recovery routines.`;

    const response = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: nutritionRecoveryResponseSchema,
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Save in SQLite database
    let savedId = `nutr-${Date.now()}`;
    try {
      const userId = saveUser({
        name: profile.name || 'Active Athlete',
        age: profile.age,
        gender: profile.gender,
        primary_goal: goal,
        workout_intensity: intensity,
        days_per_week: profile.daysPerWeek,
        minutes_per_session: profile.minutesPerSession,
        availableEquipment: profile.availableEquipment,
        limitations: profile.limitations,
      });

      savedId = saveNutritionRecommendation({
        userId,
        planId: currentPlan?.id,
        dailyCalories: parsed.dailyCalories || 2200,
        proteinGrams: parsed.proteinGrams || 150,
        carbsGrams: parsed.carbsGrams || 220,
        fatsGrams: parsed.fatsGrams || 65,
        hydrationLiters: parsed.hydrationLiters || 3.0,
        mealTimingProtocol: parsed.mealTimingProtocol || '',
        supplementGuidance: parsed.supplementGuidance || '',
        sleepRecoveryProtocol: parsed.sleepRecoveryProtocol || '',
        activeRecoveryProtocol: parsed.activeRecoveryProtocol || '',
      });
    } catch (dbErr) {
      console.warn('SQLite storage notice for nutrition recommendation:', dbErr);
    }

    return res.json({
      ...parsed,
      id: savedId,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating nutrition & recovery recommendations:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate nutrition protocol.' });
  }
});

app.get('/api/nutrition-recovery/:userId', (req: Request, res: Response) => {
  try {
    const recommendation = getLatestNutritionRecommendation(req.params.userId);
    return res.json(recommendation || null);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// WORKOUT SESSION LOGGING (SQLITE PERSISTENCE)
// ==========================================
app.post('/api/log-workout-session', (req: Request, res: Response) => {
  try {
    const { userId, planId, dayNumber, dayTitle, durationMinutes, perceivedRpe, caloriesBurned, intensity, notes } = req.body;
    const sessionId = saveWorkoutSession({
      userId: userId || 'user-elena-01',
      planId: planId || undefined,
      dayNumber: Number(dayNumber) || 1,
      dayTitle: dayTitle || 'Completed Workout Day',
      durationMinutes: Number(durationMinutes) || 45,
      perceivedRpe: Number(perceivedRpe) || 7.0,
      caloriesBurned: Number(caloriesBurned) || 300,
      intensity: intensity || 'medium',
      notes: notes || undefined,
    });
    return res.json({ success: true, sessionId });
  } catch (error: any) {
    console.error('Error logging workout session to SQLite:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ADMIN DASHBOARD API ENDPOINTS (JSON)
// ==========================================
app.get('/api/admin/users', (req: Request, res: Response) => {
  try {
    const goal = req.query.goal as string;
    const intensity = req.query.intensity as string;
    const search = req.query.search as string;
    const users = getAllUsers({ goal, intensity, search });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/user/:id', (req: Request, res: Response) => {
  try {
    const user = getUserWithDetails(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/stats', (_req: Request, res: Response) => {
  try {
    const stats = getAdminStats();
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// RESPONSIVE HTML INTERFACE USING JINJA2 TEMPLATES
// ==========================================
app.get('/admin', (req: Request, res: Response) => {
  try {
    const goal = (req.query.goal as string) || 'all';
    const intensity = (req.query.intensity as string) || 'all';
    const search = (req.query.search as string) || '';

    const users = getAllUsers({ goal, intensity, search });
    const stats = getAdminStats();
    const recentFeedbacks = db.prepare(`
      SELECT f.*, u.name as athlete_name, p.title as plan_title
      FROM feedback_logs f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN workout_plans p ON f.plan_id = p.id
      ORDER BY f.created_at DESC LIMIT 6
    `).all();

    res.render('admin_dashboard.jinja2', {
      users,
      stats,
      currentFilters: { goal, intensity, search },
      recentFeedbacks,
    });
  } catch (error: any) {
    console.error('Error rendering admin dashboard:', error);
    res.status(500).send(`Error loading admin dashboard: ${error.message}`);
  }
});

app.get('/admin/user/:id', (req: Request, res: Response) => {
  try {
    const user = getUserWithDetails(req.params.id);
    if (!user) {
      return res.status(404).send('Athlete not found in SQLite database.');
    }
    res.render('user_detail.jinja2', { user });
  } catch (error: any) {
    res.status(500).send(`Error loading athlete detail: ${error.message}`);
  }
});

app.get('/admin/database', (_req: Request, res: Response) => {
  try {
    const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
    const planCount = (db.prepare('SELECT COUNT(*) as c FROM workout_plans').get() as any).c;
    const feedbackCount = (db.prepare('SELECT COUNT(*) as c FROM feedback_logs').get() as any).c;
    const nutritionCount = (db.prepare('SELECT COUNT(*) as c FROM nutrition_recommendations').get() as any).c;
    const sessionCount = (db.prepare('SELECT COUNT(*) as c FROM workout_sessions').get() as any).c;

    res.render('schema.jinja2', {
      userCount,
      planCount,
      feedbackCount,
      nutritionCount,
      sessionCount,
    });
  } catch (error: any) {
    res.status(500).send(`Error loading schema view: ${error.message}`);
  }
});

// Setup Vite middleware for development or serve dist in production
async function startServer() {
  initDatabase();
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitBuddy server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
