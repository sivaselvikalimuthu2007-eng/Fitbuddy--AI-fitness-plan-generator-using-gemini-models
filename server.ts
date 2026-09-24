import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

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

// Robust Gemini invoker with exponential backoff and model fallback on transient 503/429
async function callGeminiWithRetry(params: any, retries = 2) {
  const modelsToTry = [MODEL_NAME, 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
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
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('429') ||
          errMsg.includes('Resource has been exhausted');

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
    overview: { type: Type.STRING, description: 'Executive summary explaining why this plan fits the user’s exact goals and limitations' },
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

    const systemInstruction = `You are FitBuddy's master exercise physiologist, strength and conditioning specialist (CSCS), and functional wellness coach.
Your job is to produce an individualized, evidence-based, 7-day structured fitness & wellness plan for this exact individual.

CRITICAL INSTRUCTIONS:
1. Equipment Fidelity: ONLY prescribe exercises that use the user's available equipment: ${JSON.stringify(profile.availableEquipment)}. If only bodyweight or dumbbells are available, never prescribe cable machines or barbells!
2. Injury & Limitation Precaution: Respect all limitations rigorously: "${profile.limitations?.join(', ') || 'None'}" - ${profile.customLimitation || ''}. Provide joint-safe variations and explicit coaching cues to prevent strain.
3. Goal-Specific Biomechanics & Metabolic Modality:
   - If Goal is "fat_loss" (Weight Loss): Prioritize metabolic resistance density, supersets, active transitions (30-45s rest), 12-20 reps, EPOC stimulation, and caloric deficit guidance with high protein (2.0-2.4g/kg) to preserve lean mass.
   - If Goal is "muscle_gain" (Muscle Gain): Prioritize mechanical tension, progressive overload, 8-12 reps with controlled 3-second eccentrics, 90-120s rest for ATP regeneration, and slight caloric surplus fueling.
   - If Goal is "mobility_flexibility" (Flexibility): Prioritize joint decompression, full kinetic range of motion, PNF stretching, active 30-60s isometric holds, thoracic/hip openers, and fascial hydration protocols.
   - If Goal is "general_health" (General Wellness): Prioritize sustainable functional longevity, multi-joint patterns (squat/hinge/push/pull/carry), posture correction, Zone 2 aerobic base, and stress downregulation.
4. Time Management: The user specified ${profile.minutesPerSession} minutes per session. Tailor the exercise count, warm-up, and rest intervals so it fits realistically within this timeframe.
5. Schedule Balance: Prescribe exactly ${profile.daysPerWeek} active training days and ${7 - profile.daysPerWeek} active recovery/rest days across the 7-day schedule (Days 1 through 7).
6. Comprehensive Detail: Every exercise must have practical coaching cues (3-4 crisp cues), common mistakes to avoid, exact sets & reps, tempo (e.g. 3-0-1-0 or controlled), and an accessible alternative.
7. Scientific Wellness: Provide tailored nutrition/protein, hydration, sleep, and recovery guidance aligned with their fitness goals (${profile.primaryGoal}).`;

    const userPrompt = `Generate a complete personalized fitness program for:
Name: ${profile.name || 'Athlete'}
Age: ${profile.age || 30}, Gender: ${profile.gender || 'Not specified'}
Primary Goal: ${profile.primaryGoal}
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
      generatedAt: new Date().toISOString(),
      profileSnapshot: profile,
      adaptationHistory: [
        {
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          reason: 'Initial Plan Generation',
          changesSummary: `Custom program built for ${profile.primaryGoal} over ${profile.daysPerWeek} weekly sessions.`
        }
      ]
    };

    return res.json(fullPlan);
  } catch (error: any) {
    console.error('Error generating fitness plan:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate fitness plan.' });
  }
});

// API Endpoint: Dynamically Adapt Plan
app.post('/api/adapt-plan', async (req: Request, res: Response) => {
  try {
    const { currentPlan, feedbackPrompt, adaptationType, targetDayNumber } = req.body;
    if (!currentPlan || !feedbackPrompt) {
      return res.status(400).json({ error: 'currentPlan and feedbackPrompt are required.' });
    }

    const systemInstruction = `You are FitBuddy's master coach. The athlete is asking you to adapt their current fitness plan.
Read their current plan, their profile snapshot, and their dynamic feedback.
Produce an updated version of their plan adhering strictly to the JSON schema.
Ensure you update or preserve all 7 days appropriately.
In addition, formulate an executive summary of the changes made and explain how it accommodates their feedback.`;

    const prompt = `Current Plan Title: ${currentPlan.title}
Profile Snapshot: ${JSON.stringify(currentPlan.profileSnapshot)}
Adaptation Request Type: ${adaptationType || 'Custom feedback'}
Target Day (if specific): ${targetDayNumber ? `Day ${targetDayNumber}` : 'Entire schedule'}
User Feedback & Situation: "${feedbackPrompt}"

Please re-engineer the fitness plan to address this request. Keep the parts that work well, and intelligently adjust the exercises, duration, intensity, or rest days to accommodate their needs.`;

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
      generatedAt: new Date().toISOString(),
      profileSnapshot: currentPlan.profileSnapshot,
      adaptationHistory: [
        adaptationRecord,
        ...(currentPlan.adaptationHistory || [])
      ]
    };

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

// Setup Vite middleware for development or serve dist in production
async function startServer() {
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
