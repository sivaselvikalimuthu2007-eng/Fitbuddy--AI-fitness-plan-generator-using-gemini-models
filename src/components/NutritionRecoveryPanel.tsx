import React, { useState, useEffect } from 'react';
import {
  Apple, Moon, Droplets, Sparkles, RefreshCw, Flame,
  ShieldCheck, Clock, CheckCircle2, ChevronRight, Activity, Zap
} from 'lucide-react';
import { FitnessPlan, UserProfile, NutritionRecommendation, WorkoutIntensity } from '../types/fitness';
import { getIntensityTier } from '../data/intensityData';

interface NutritionRecoveryPanelProps {
  plan: FitnessPlan;
  profile: UserProfile;
  onPlanAdapted?: (plan: FitnessPlan) => void;
}

export const NutritionRecoveryPanel: React.FC<NutritionRecoveryPanelProps> = ({
  plan,
  profile,
}) => {
  const [recommendation, setRecommendation] = useState<NutritionRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waterLoggedLiters, setWaterLoggedLiters] = useState<number>(1.5);
  const [activeTab, setActiveTab] = useState<'macros' | 'timing' | 'sleep' | 'supplements'>('macros');

  const currentIntensity = plan.intensity || profile.workoutIntensity || 'medium';
  const intensityTier = getIntensityTier(currentIntensity);

  // Load existing recommendation from SQLite API or generate
  useEffect(() => {
    fetchLatestRecommendation();
  }, [plan.id, currentIntensity]);

  const fetchLatestRecommendation = async () => {
    try {
      const res = await fetch(`/api/nutrition-recovery/${profile.name ? profile.name.toLowerCase().replace(/\s+/g, '-') : 'active-user'}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.dailyCalories) {
          setRecommendation({
            dailyCalories: data.daily_calories || data.dailyCalories,
            proteinGrams: data.protein_grams || data.proteinGrams,
            carbsGrams: data.carbs_grams || data.carbsGrams,
            fatsGrams: data.fats_grams || data.fatsGrams,
            hydrationLiters: data.hydration_liters || data.hydrationLiters,
            mealTimingProtocol: data.meal_timing_protocol || data.mealTimingProtocol,
            supplementGuidance: data.supplement_guidance || data.supplementGuidance,
            sleepRecoveryProtocol: data.sleep_recovery_protocol || data.sleepRecoveryProtocol,
            activeRecoveryProtocol: data.active_recovery_protocol || data.activeRecoveryProtocol,
            generatedAt: data.created_at || data.generatedAt,
          });
          return;
        }
      }
      // If none found in DB yet, generate initial baseline
      generateRecommendations();
    } catch {
      generateRecommendations();
    }
  };

  const generateRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-nutrition-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            ...profile,
            workoutIntensity: currentIntensity,
          },
          currentPlan: plan,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate nutrition protocol');
      }

      const data: NutritionRecommendation = await res.json();
      setRecommendation(data);
    } catch (err: any) {
      console.error('Error generating nutrition:', err);
      // Fallback baseline calibration based on intensity
      const baseCal = currentIntensity === 'high' ? 2600 : currentIntensity === 'low' ? 1900 : 2250;
      const baseProt = currentIntensity === 'high' ? 170 : currentIntensity === 'low' ? 130 : 155;
      const baseCarb = currentIntensity === 'high' ? 310 : currentIntensity === 'low' ? 190 : 240;
      const baseFat = currentIntensity === 'high' ? 75 : currentIntensity === 'low' ? 55 : 65;

      setRecommendation({
        dailyCalories: baseCal,
        proteinGrams: baseProt,
        carbsGrams: baseCarb,
        fatsGrams: baseFat,
        hydrationLiters: currentIntensity === 'high' ? 3.8 : currentIntensity === 'low' ? 2.6 : 3.2,
        mealTimingProtocol: `Consume 30-40g high-quality protein within 90 minutes post-training. Concentrate 60% of carbohydrates around the ${currentIntensity.toUpperCase()} intensity workout window to maximize glycogen replenishment and muscle protein synthesis.`,
        supplementGuidance: 'Creatine Monohydrate (5g/day for ATP replenishment), High-grade Whey Isolate post-workout, Magnesium Glycinate (400mg before bed for neuromuscular relaxation), Omega-3 Fish Oil (2g EPA/DHA daily for joint health).',
        sleepRecoveryProtocol: 'Maintain an 8-hour sleep opportunity window in a cool (18-19°C), completely dark room. Avoid screen blue light 60 minutes prior to sleep to maximize natural melatonin release and growth hormone secretion during slow-wave deep sleep.',
        activeRecoveryProtocol: `Incorporate 20-30 minutes of Zone 1 low-impact walking outdoors on rest days to flush metabolic waste products and stimulate parasympathetic vagal tone without eliciting central nervous system fatigue.`,
        generatedAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addWater = (amount: number) => {
    setWaterLoggedLiters((prev) => Math.min(6, Math.max(0, parseFloat((prev + amount).toFixed(1)))));
  };

  const targetHydration = recommendation?.hydrationLiters || 3.0;
  const hydrationPct = Math.min(100, Math.round((waterLoggedLiters / targetHydration) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <span className="flex items-center gap-1.5 font-bold">
              <Apple className="w-4 h-4 text-emerald-400" />
              AI NUTRITION & RECOVERY PROTOCOL
            </span>
            <span>·</span>
            <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${intensityTier.colorClass.badge}`}>
              {intensityTier.label} ({intensityTier.rpeRange})
            </span>
            <span>·</span>
            <span className="text-slate-400">SQLite Synced</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Metabolic Fueling & Restoration Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Evidence-based macronutrient targets, nutrient timing, sleep hygiene, and active recovery calibrated to your {currentIntensity.toUpperCase()} intensity schedule.
          </p>
        </div>

        <button
          onClick={generateRecommendations}
          disabled={isLoading}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Calibrating...' : 'Recalibrate AI Nutrition'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Daily Caloric & Macro Cards */}
      {recommendation && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Daily Calories */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="font-bold">DAILY CALORIES</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {recommendation.dailyCalories}
                <span className="text-xs text-slate-400 font-sans font-normal ml-1">kcal/day</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Calibrated for {profile.primaryGoal.replace('_', ' ')}
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full w-full" />
            </div>
          </div>

          {/* Protein Target */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-2">
              <span className="font-bold">PROTEIN TARGET</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 font-bold">1.8-2.4g/kg</span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {recommendation.proteinGrams}
                <span className="text-xs text-slate-400 font-sans font-normal ml-1">g/day</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Preserves lean muscle & accelerates repair
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-4/5" />
            </div>
          </div>

          {/* Carbohydrates Target */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-sky-400 mb-2">
              <span className="font-bold">CARBOHYDRATES</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 font-bold">Glycogen Reload</span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono">
                {recommendation.carbsGrams}
                <span className="text-xs text-slate-400 font-sans font-normal ml-1">g/day</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Fuel for {currentIntensity.toUpperCase()} training output
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full w-3/4" />
            </div>
          </div>

          {/* Healthy Fats Target */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-2">
              <span className="font-bold">ESSENTIAL FATS</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 font-bold">Endocrine Support</span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                {recommendation.fatsGrams}
                <span className="text-xs text-slate-400 font-sans font-normal ml-1">g/day</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Hormonal balance & joint lubrication
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-3/5" />
            </div>
          </div>
        </div>
      )}

      {/* Hydration Tracker Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Daily Hydration Target</span>
              <span className="text-xs font-mono text-sky-400 font-bold">{waterLoggedLiters}L / {targetHydration}L ({hydrationPct}%)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hydration supports nutrient delivery and joint cushioning during {currentIntensity} intensity movements.
            </p>
          </div>
        </div>

        {/* Water Log Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => addWater(0.25)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors"
          >
            +250ml
          </button>
          <button
            onClick={() => addWater(0.5)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors"
          >
            +500ml
          </button>
          <button
            onClick={() => setWaterLoggedLiters(0)}
            className="px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors"
            title="Reset Water Log"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Detailed Protocols Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('macros')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'macros' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Apple className="w-3.5 h-3.5" />
          <span>Meal Timing & Nutrients</span>
        </button>

        <button
          onClick={() => setActiveTab('sleep')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'sleep' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Sleep & Restoration</span>
        </button>

        <button
          onClick={() => setActiveTab('timing')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'timing' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Active Recovery Routine</span>
        </button>

        <button
          onClick={() => setActiveTab('supplements')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'supplements' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Ergogenic Supplements</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      {recommendation && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          {activeTab === 'macros' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-mono text-emerald-400 font-bold text-xs uppercase">
                <Clock className="w-4 h-4" />
                <span>Nutrient Timing Architecture</span>
              </div>
              <p className="text-sm text-slate-200">{recommendation.mealTimingProtocol}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-white text-xs mb-1">Pre-Workout (60-90m prior)</div>
                  <p className="text-[11px] text-slate-400">Complex carbs + 25-30g lean protein. Low fat to speed gastric emptying.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-white text-xs mb-1">Intra-Workout</div>
                  <p className="text-[11px] text-slate-400">500ml water with electrolytes (sodium + potassium) to maintain motor unit firing.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-white text-xs mb-1">Post-Workout (within 2h)</div>
                  <p className="text-[11px] text-slate-400">30-40g high-leucine protein + fast carbohydrates to stimulate muscle protein synthesis.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sleep' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-mono text-purple-400 font-bold text-xs uppercase">
                <Moon className="w-4 h-4" />
                <span>Circadian & Deep Sleep Architecture</span>
              </div>
              <p className="text-sm text-slate-200">{recommendation.sleepRecoveryProtocol}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-white text-xs mb-1">Bedroom Environment</div>
                  <p className="text-[11px] text-slate-400">Keep temperature at 18-19°C. 100% blacked-out room. Silent or pink noise.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-white text-xs mb-1">Circadian Alignment</div>
                  <p className="text-[11px] text-slate-400">Get 10 minutes of outdoor morning sunlight within 30 minutes of waking to anchor cortisol rhythm.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timing' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-mono text-sky-400 font-bold text-xs uppercase">
                <Activity className="w-4 h-4" />
                <span>Active Recovery & Vagal Nerve Stimulation</span>
              </div>
              <p className="text-sm text-slate-200">{recommendation.activeRecoveryProtocol}</p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 mt-2">
                <div className="font-bold text-white text-xs mb-1">Rest Day Recommendation</div>
                <p className="text-[11px] text-slate-400">
                  Perform 20-30 minutes of nasal-only walking or light mobility drills. Keep heart rate below 115 bpm (Zone 1) to facilitate cellular repair without increasing systemic fatigue.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'supplements' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-mono text-amber-400 font-bold text-xs uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Evidence-Based Ergogenic Supplements</span>
              </div>
              <p className="text-sm text-slate-200">{recommendation.supplementGuidance}</p>
              <p className="text-[11px] text-slate-400 italic pt-2">
                *Always consult your medical physician before introducing new dietary supplements.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
