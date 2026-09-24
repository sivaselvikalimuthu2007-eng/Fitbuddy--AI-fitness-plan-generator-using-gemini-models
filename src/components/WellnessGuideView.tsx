import React, { useState, useEffect } from 'react';
import {
  HeartPulse, Utensils, Droplets, Moon, Sparkles, Wind,
  CheckCircle, Plus, Minus, ArrowUpRight, ShieldCheck, Dumbbell,
  Calculator, Flame, Flower
} from 'lucide-react';
import { WellnessGuide, ProgressionStrategy, PrimaryGoal } from '../types/fitness';
import { GOAL_PILLARS } from '../data/goalPillarsData';

interface WellnessGuideViewProps {
  wellnessGuide: WellnessGuide;
  progressionStrategy: ProgressionStrategy;
  motivationalMantra: string;
  primaryGoal?: PrimaryGoal;
}

export const WellnessGuideView: React.FC<WellnessGuideViewProps> = ({
  wellnessGuide,
  progressionStrategy,
  motivationalMantra,
  primaryGoal = 'fat_loss',
}) => {
  // Interactive water tracker saved in local session
  const [glassesDrank, setGlassesDrank] = useState<number>(() => {
    const saved = localStorage.getItem('fitbuddy_water_glasses');
    return saved ? parseInt(saved, 10) : 4;
  });

  useEffect(() => {
    localStorage.setItem('fitbuddy_water_glasses', glassesDrank.toString());
  }, [glassesDrank]);

  // Breathing pacer state
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);

  useEffect(() => {
    let interval: any;
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            setBreathPhase((current) => {
              if (current === 'Inhale') return 'Hold';
              if (current === 'Hold') return 'Exhale';
              if (current === 'Exhale') return 'Rest';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathing]);

  // Interactive Nutrition Calculator
  const [athleteWeightKg, setAthleteWeightKg] = useState<number>(70);
  const [calcGoal, setCalcGoal] = useState<PrimaryGoal>(primaryGoal);

  useEffect(() => {
    setCalcGoal(primaryGoal);
  }, [primaryGoal]);

  const calculateTargetMacros = (weight: number, goal: PrimaryGoal) => {
    let proteinFactor = 1.6;
    let calorieType = 'Maintenance balance';
    let carbTip = 'Moderate low-GI carbs';

    switch (goal) {
      case 'fat_loss':
        proteinFactor = 2.2;
        calorieType = '300-500 kcal Deficit (Fat oxidation)';
        carbTip = 'Carbs timed around workouts; prioritize fiber';
        break;
      case 'muscle_gain':
        proteinFactor = 2.0;
        calorieType = '250-350 kcal Surplus (Hypertrophy)';
        carbTip = 'High complex carbs to replenish muscle glycogen';
        break;
      case 'mobility_flexibility':
        proteinFactor = 1.5;
        calorieType = 'Iso-caloric Maintenance (Tissue remodeling)';
        carbTip = 'Anti-inflammatory carbs (berries, quinoa, sweet potatoes)';
        break;
      case 'general_health':
      default:
        proteinFactor = 1.6;
        calorieType = 'Equilibrium Maintenance (Vitality)';
        carbTip = 'Whole grains, leafy greens, colorful Mediterranean';
        break;
    }

    const totalProtein = Math.round(weight * proteinFactor);
    const estMaintenance = Math.round(weight * 33);
    return {
      dailyProteinGrams: totalProtein,
      estMaintenanceCalories: estMaintenance,
      calorieType,
      carbTip,
    };
  };

  const macroStats = calculateTargetMacros(athleteWeightKg, calcGoal);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Motivational Hero Kicker */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-900/40 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HOLISTIC WELLNESS PROTOCOL</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            "{motivationalMantra}"
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Workouts stimulate biological adaptation; nutrition, hydration, and sleep synthesize the results.
          </p>
        </div>
      </div>

      {/* Goal-Specific Macro & Fueling Calculator */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Calculator className="w-4 h-4" />
            <span>Goal-Specific Macro & Fueling Calculator</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {GOAL_PILLARS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setCalcGoal(p.id)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  calcGoal === p.id
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {p.shortLabel}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Weight Input */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Athlete Body Weight</span>
              <span className="font-mono text-emerald-400 font-bold">
                {athleteWeightKg} kg ({Math.round(athleteWeightKg * 2.20462)} lbs)
              </span>
            </div>
            <input
              type="range"
              min={45}
              max={130}
              value={athleteWeightKg}
              onChange={(e) => setAthleteWeightKg(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="text-[11px] text-slate-400">
              Drag to adjust target calculation
            </div>
          </div>

          {/* Protein Target */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Daily Target Protein
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              ~{macroStats.dailyProteinGrams} g / day
            </div>
            <div className="text-[11px] text-emerald-400">
              {calcGoal === 'fat_loss' && 'Preserves lean mass during caloric restriction'}
              {calcGoal === 'muscle_gain' && 'Maximizes muscle protein synthesis (MPS)'}
              {calcGoal === 'mobility_flexibility' && 'Collagen & tendon remodeling support'}
              {calcGoal === 'general_health' && 'Optimal cellular longevity & satiety'}
            </div>
          </div>

          {/* Caloric Strategy */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Caloric Balance Model
            </div>
            <div className="text-sm font-bold text-white">
              {macroStats.calorieType}
            </div>
            <div className="text-[11px] text-slate-400">
              {macroStats.carbTip}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Nutrition & Hydration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card: Daily Protein & Fueling */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Utensils className="w-4 h-4" />
            <span>Prescribed Nutrition Protocol</span>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Daily Prescription</div>
            <p className="text-sm font-medium text-white">{wellnessGuide.dailyProteinRecommendation}</p>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-slate-950/50 border border-slate-800/60 rounded-xl">
              <div className="text-xs font-semibold text-emerald-300 mb-0.5">Pre-Workout Fuel</div>
              <p className="text-xs text-slate-300">{wellnessGuide.preWorkoutNutrition}</p>
            </div>
            <div className="p-3 bg-slate-950/50 border border-slate-800/60 rounded-xl">
              <div className="text-xs font-semibold text-cyan-300 mb-0.5">Post-Workout Anabolic Window</div>
              <p className="text-xs text-slate-300">{wellnessGuide.postWorkoutRecovery}</p>
            </div>
          </div>
        </div>

        {/* Card: Hydration Tracker & Guidelines */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <Droplets className="w-4 h-4" />
              <span>Hydration & Cellular Fluid Balance</span>
            </div>
            <span className="text-xs font-mono text-cyan-300 font-bold">
              {(glassesDrank * 0.25).toFixed(1)} L Drunk
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">Prescription</div>
            <p className="text-xs sm:text-sm text-slate-200">{wellnessGuide.hydrationGuideline}</p>
          </div>

          {/* Interactive Hydration Counter */}
          <div className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">Daily Water Counter</div>
              <div className="text-[11px] text-slate-400">Target: 8 - 12 glasses (250ml each)</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGlassesDrank((prev) => Math.max(0, prev - 1))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-sm font-bold text-white w-6 text-center">
                {glassesDrank}
              </span>
              <button
                type="button"
                onClick={() => setGlassesDrank((prev) => prev + 1)}
                className="w-8 h-8 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center transition-colors"
                title="Add 1 glass"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Sleep & Nervous System Breathwork */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card: Sleep Protocol */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Moon className="w-4 h-4" />
            <span>Circadian Sleep & Neural Reset</span>
          </div>
          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed">
            {wellnessGuide.sleepAndRecoveryProtocol}
          </div>
          <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-xs text-indigo-200">
            <span className="font-semibold text-indigo-300">Quick Sleep Cue: </span>
            Keep bedroom between 18-20°C (65-68°F) to trigger core temperature drop necessary for REM & slow-wave stages.
          </div>
        </div>

        {/* Card: Stress & Interactive Breathwork Pacer */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Wind className="w-4 h-4" />
              <span>Downregulation & Vagal Tone</span>
            </div>
            <button
              onClick={() => setIsBreathing(!isBreathing)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              {isBreathing ? 'Stop Pacer' : 'Start 4-4-4 Box Breath'}
            </button>
          </div>

          <p className="text-xs text-slate-300">{wellnessGuide.stressManagementTip}</p>

          {/* Interactive Breath Pacer View */}
          {isBreathing && (
            <div className="p-4 bg-slate-950 border border-amber-900/40 rounded-xl flex items-center justify-around animate-in zoom-in-95">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono text-xl font-bold">
                {breathTimer}
              </div>
              <div className="text-left">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Current Phase</div>
                <div className="text-lg font-bold text-amber-300">{breathPhase}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Smooth, gentle diaphragmatic flow</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progression & Deload Architecture */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <Dumbbell className="w-4 h-4" />
          <span>Long-Term Progression & Periodization Strategy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">Overload Formula</div>
            <p className="text-xs sm:text-sm text-slate-200">{progressionStrategy.weeklyProgressionRule}</p>
          </div>
          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">Deload Architecture</div>
            <p className="text-xs sm:text-sm text-slate-200">{progressionStrategy.deloadRecommendation}</p>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Program Roadmap Milestones</div>
          <div className="space-y-2">
            {progressionStrategy.milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
