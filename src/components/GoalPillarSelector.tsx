import React, { useState } from 'react';
import { Flame, Dumbbell, Flower, HeartPulse, Sparkles, ArrowRight, Check, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { PrimaryGoal, FitnessPlan } from '../types/fitness';
import { GOAL_PILLARS, GOAL_PLANS, GoalPillarInfo } from '../data/goalPillarsData';

interface GoalPillarSelectorProps {
  currentGoal: PrimaryGoal;
  onSelectGoalPlan: (plan: FitnessPlan) => void;
  onOpenGeneratorForGoal: (goal: PrimaryGoal) => void;
}

export const GoalPillarSelector: React.FC<GoalPillarSelectorProps> = ({
  currentGoal,
  onSelectGoalPlan,
  onOpenGeneratorForGoal,
}) => {
  const [selectedPillarId, setSelectedPillarId] = useState<PrimaryGoal>(currentGoal);
  const [showScienceDetails, setShowScienceDetails] = useState<boolean>(false);

  const activePillar = GOAL_PILLARS.find((p) => p.id === selectedPillarId) || GOAL_PILLARS[0];

  const getPillarIcon = (id: PrimaryGoal) => {
    switch (id) {
      case 'fat_loss':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'muscle_gain':
        return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      case 'mobility_flexibility':
        return <Flower className="w-4 h-4 text-indigo-400" />;
      case 'general_health':
      default:
        return <HeartPulse className="w-4 h-4 text-cyan-400" />;
    }
  };

  const handleApplyCuratedPlan = (pillar: GoalPillarInfo) => {
    const plan = GOAL_PLANS[pillar.id];
    if (plan) {
      onSelectGoalPlan(plan);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 no-print">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CORE FITNESS PILLARS</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Target Goals & Metabolic Modalities
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore and switch between our four specialized evidence-based pillars: Weight Loss, Muscle Gain, Flexibility, and General Wellness.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowScienceDetails(!showScienceDetails)}
          className="self-start sm:self-auto text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 transition-colors"
        >
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>{showScienceDetails ? 'Hide Goal Science' : 'View Goal Science'}</span>
          {showScienceDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 4 Pillars Interactive Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {GOAL_PILLARS.map((pillar) => {
          const isSelected = selectedPillarId === pillar.id;
          const isCurrentActivePlan = currentGoal === pillar.id;

          return (
            <div
              key={pillar.id}
              onClick={() => setSelectedPillarId(pillar.id)}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-950/80 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-950/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      {getPillarIcon(pillar.id)}
                    </div>
                    <span className="font-bold text-sm text-white">{pillar.shortLabel}</span>
                  </div>
                  {isCurrentActivePlan && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                  {pillar.tagline}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{pillar.targetRPE}</span>
                <span className={pillar.accentColor}>{pillar.restIntervals.split(';')[0]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Pillar Spotlight & Direct Action */}
      <div className="p-4 sm:p-5 bg-slate-950/70 border border-slate-800/90 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className={activePillar.accentColor}>SELECTED FOCUS: {activePillar.title.toUpperCase()}</span>
            <span>·</span>
            <span className="text-slate-400">{activePillar.metabolicTarget}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {activePillar.description}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
            <span><strong className="text-slate-200">Rep Strategy:</strong> {activePillar.repRangeStrategy}</span>
            <span aria-hidden="true">·</span>
            <span><strong className="text-slate-200">Protein:</strong> {activePillar.dailyProteinRule.split('(')[0]}</span>
          </div>
        </div>

        {/* Buttons to switch or generate */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => handleApplyCuratedPlan(activePillar)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Load Curated {activePillar.shortLabel} Plan</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenGeneratorForGoal(activePillar.id)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate with AI</span>
          </button>
        </div>
      </div>

      {/* Expanded Scientific Breakdown Drawer */}
      {showScienceDetails && (
        <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Info className="w-3.5 h-3.5" />
            <span>EXERCISE PHYSIOLOGY & NUTRITION COMPARISON MATRIX</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {GOAL_PILLARS.map((p) => (
              <div key={p.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  {getPillarIcon(p.id)}
                  <span>{p.shortLabel}</span>
                </div>
                <div className="space-y-1 text-slate-400">
                  <div>
                    <span className="text-slate-300 font-medium">Metabolic Pathway: </span>
                    <span>{p.metabolicTarget}</span>
                  </div>
                  <div>
                    <span className="text-slate-300 font-medium">Rest Time: </span>
                    <span>{p.restIntervals}</span>
                  </div>
                  <div>
                    <span className="text-slate-300 font-medium">Caloric Balance: </span>
                    <span>{p.caloricGuideline}</span>
                  </div>
                  <div>
                    <span className="text-slate-300 font-medium">Signature Moves: </span>
                    <span>{p.keyExercises.slice(0, 3).join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
