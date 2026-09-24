import React, { useState } from 'react';
import {
  Calendar, Clock, Flame, Dumbbell, Play, Sparkles,
  ChevronRight, RefreshCw, AlertCircle, Printer, Eye,
  ShieldCheck, Info, Check, ArrowRight, Zap, Gauge
} from 'lucide-react';
import { FitnessPlan, WorkoutDay, Exercise, UserProfile, PrimaryGoal, WorkoutIntensity } from '../types/fitness';
import { GoalPillarSelector } from './GoalPillarSelector';
import { WorkoutIntensityControl } from './WorkoutIntensityControl';
import { getIntensityTier } from '../data/intensityData';

interface PlanOverviewProps {
  plan: FitnessPlan;
  onStartWorkout: (day: WorkoutDay) => void;
  onOpenExerciseModal: (exercise: Exercise, dayNumber: number) => void;
  onOpenAdaptModal: () => void;
  onOpenProfileModal: () => void;
  onSelectGoalPlan?: (plan: FitnessPlan) => void;
  onOpenGeneratorForGoal?: (goal: PrimaryGoal) => void;
  onIntensityChange?: (newIntensity: WorkoutIntensity) => void;
  onAdaptWithAI?: (newIntensity: WorkoutIntensity) => void;
  isAdaptingIntensity?: boolean;
}

export const PlanOverview: React.FC<PlanOverviewProps> = ({
  plan,
  onStartWorkout,
  onOpenExerciseModal,
  onOpenAdaptModal,
  onOpenProfileModal,
  onSelectGoalPlan,
  onOpenGeneratorForGoal,
  onIntensityChange,
  onAdaptWithAI,
  isAdaptingIntensity = false,
}) => {
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);

  const currentIntensity = plan.intensity || plan.profileSnapshot.workoutIntensity || 'medium';
  const intensityTier = getIntensityTier(currentIntensity);

  const selectedDay = plan.weeklySchedule.find((d) => d.dayNumber === selectedDayNum) || plan.weeklySchedule[0];
  const workoutDaysCount = plan.weeklySchedule.filter((d) => !d.isRestDay).length;
  const restDaysCount = plan.weeklySchedule.filter((d) => d.isRestDay).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Hero Plan Header Banner */}
      <div className="p-6 sm:p-7 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{plan.splitType}</span>
              <span aria-hidden="true">·</span>
              <span>{workoutDaysCount} Training Days / {restDaysCount} Rest</span>
              <span aria-hidden="true">·</span>
              <span>{plan.profileSnapshot.minutesPerSession} min target</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {plan.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {plan.overview}
            </p>

            {/* Quiet metadata line without pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="text-slate-300 font-medium">Athlete: {plan.profileSnapshot.name || 'User'}</span>
              <span aria-hidden="true">·</span>
              <span>Goal: {plan.profileSnapshot.primaryGoal.replace('_', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <span>Intensity:</span>
                <span className={`font-mono font-bold ${intensityTier.colorClass.text}`}>
                  {intensityTier.label} ({intensityTier.rpeRange})
                </span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Equip: {plan.profileSnapshot.availableEquipment.join(', ')}</span>
            </div>
          </div>

          {/* Quick Actions Cluster */}
          <div className="flex flex-wrap md:flex-col gap-2.5 flex-shrink-0 no-print">
            <button
              onClick={onOpenAdaptModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Adapt Plan with AI</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Print workout sheet"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sheet</span>
              </button>
              <button
                onClick={onOpenProfileModal}
                className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New AI Plan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Intensity Options (Low, Medium, High) Controls */}
      {onIntensityChange && (
        <WorkoutIntensityControl
          currentIntensity={currentIntensity}
          onIntensityChange={onIntensityChange}
          onAdaptWithAI={onAdaptWithAI}
          isAdapting={isAdaptingIntensity}
        />
      )}

      {/* Core Fitness Goal Pillars Switcher & Science Matrix */}
      {onSelectGoalPlan && onOpenGeneratorForGoal && (
        <GoalPillarSelector
          currentGoal={plan.profileSnapshot.primaryGoal}
          onSelectGoalPlan={onSelectGoalPlan}
          onOpenGeneratorForGoal={onOpenGeneratorForGoal}
        />
      )}

      {/* 7-Day Interactive Schedule Carousel / Tab bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Weekly 7-Day Cycle</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Select a day to view routines</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 no-print">
          {plan.weeklySchedule.map((day) => {
            const isSelected = day.dayNumber === selectedDayNum;
            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setSelectedDayNum(day.dayNumber)}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className={isSelected ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    Day {day.dayNumber}
                  </span>
                  {day.isRestDay ? (
                    <span className="text-[10px] text-indigo-400">Rest</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className={`text-[9px] font-bold uppercase px-1 rounded ${getIntensityTier(day.intensity || currentIntensity).colorClass.badge}`}>
                        {getIntensityTier(day.intensity || currentIntensity).shortLabel}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold">{day.estimatedDurationMin}m</span>
                    </div>
                  )}
                </div>

                <div className="text-xs font-bold text-white line-clamp-1">
                  {day.dayTitle.replace(/^Day \d+:\s*/, '')}
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {day.focus}
                </div>

                {isSelected && (
                  <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Detail Card */}
      {selectedDay && (
        <div className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 print-card">
          {/* Day Title & Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
                <span>DAY {selectedDay.dayNumber} FOCUS</span>
                <span>·</span>
                <span>{selectedDay.focus}</span>
                {!selectedDay.isRestDay && (
                  <>
                    <span>·</span>
                    <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${getIntensityTier(selectedDay.intensity || currentIntensity).colorClass.badge}`}>
                      {getIntensityTier(selectedDay.intensity || currentIntensity).label} ({getIntensityTier(selectedDay.intensity || currentIntensity).rpeRange})
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {selectedDay.dayTitle}
              </h2>
            </div>

            {!selectedDay.isRestDay ? (
              <div className="flex items-center gap-3 no-print">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-slate-400 font-mono">
                    ~{selectedDay.estimatedDurationMin} mins · ~{selectedDay.estimatedCaloriesBurn} kcal
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono">
                    {selectedDay.exercises.length} prescribed movements
                  </div>
                </div>
                <button
                  onClick={() => onStartWorkout(selectedDay)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Live Workout</span>
                </button>
              </div>
            ) : (
              <div className="text-xs font-mono text-indigo-400 px-3 py-1.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40">
                Active Recovery & Joint Restoration Day
              </div>
            )}
          </div>

          {/* If Rest Day: Display Recovery Protocol */}
          {selectedDay.isRestDay ? (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-indigo-400">
                  Recovery Blueprint
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedDay.recoveryNotes}
                </p>
              </div>

              {selectedDay.cooldown.stretches?.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Recommended Active Mobility & Stretches ({selectedDay.cooldown.durationMin} mins)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedDay.cooldown.stretches.map((str, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl">
                        <div className="flex justify-between items-start text-xs font-bold text-white mb-0.5">
                          <span>{str.name}</span>
                          <span className="font-mono text-emerald-400 font-semibold">{str.holdTime}</span>
                        </div>
                        <p className="text-xs text-slate-400">{str.cue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Part 1: Warm-up Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="uppercase tracking-wider">Phase 1: Dynamic Warm-Up</span>
                  <span>{selectedDay.warmup.durationMin} minutes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedDay.warmup.activities.map((act, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{act.name}</span>
                        <span className="text-[11px] font-mono text-emerald-400">{act.durationOrReps}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{act.cue}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part 2: Core Exercise List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="uppercase tracking-wider">Phase 2: Core Strength & Hypertrophy</span>
                  <span>{selectedDay.exercises.length} exercises</span>
                </div>

                <div className="space-y-2.5">
                  {selectedDay.exercises.map((ex, idx) => (
                    <div
                      key={ex.id}
                      className="p-4 bg-slate-950/70 border border-slate-800/90 rounded-2xl hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                          <span>#{idx + 1}</span>
                          <span>·</span>
                          <span>{ex.equipment}</span>
                          <span>·</span>
                          <span className="text-slate-400">{ex.targetMuscleGroup}</span>
                        </div>
                        <h4 className="text-base font-bold text-white hover:text-emerald-300 transition-colors">
                          {ex.name}
                        </h4>
                        <div className="text-xs text-slate-400">
                          <span className="text-slate-300">Form Cue: </span>
                          <span>{ex.coachingCues[0]}</span>
                        </div>
                      </div>

                      {/* Reps, Sets, Rest specs & Inspect button */}
                      <div className="flex items-center gap-4 self-end md:self-center flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-400 font-mono">
                            {ex.sets} sets × {ex.reps}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {ex.restSeconds}s rest · {ex.rpe}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenExerciseModal(ex, selectedDay.dayNumber)}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors no-print"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Form & Swap</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part 3: Cool-down Section */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/70">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="uppercase tracking-wider">Phase 3: Downregulation & Cooldown</span>
                  <span>{selectedDay.cooldown.durationMin} minutes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedDay.cooldown.stretches.map((str, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{str.name}</span>
                        <span className="text-[11px] font-mono text-emerald-400">{str.holdTime}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{str.cue}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coach Post-Workout Note */}
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-xs text-emerald-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-300">Recovery Nutrition & Cues: </span>
                  <span>{selectedDay.recoveryNotes}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Feedback-Based Workout Plan Modification History */}
      {plan.adaptationHistory && plan.adaptationHistory.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                Feedback Adaptation Audit Trail
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ({plan.adaptationHistory.length} modifications logged)
              </span>
            </div>
            <button
              onClick={onOpenAdaptModal}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>+ New Feedback Modification</span>
            </button>
          </div>

          <div className="space-y-2">
            {plan.adaptationHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-200">{item.reason}</span>
                  <span className="text-slate-400">{item.date}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{item.changesSummary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
