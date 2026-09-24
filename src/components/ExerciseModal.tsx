import React, { useState } from 'react';
import { X, Dumbbell, AlertTriangle, CheckCircle2, RefreshCw, Clock, Flame, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { Exercise, UserProfile } from '../types/fitness';

interface ExerciseModalProps {
  exercise: Exercise | null;
  dayNumber: number;
  userProfile: UserProfile;
  onClose: () => void;
  onSwapExercise: (dayNumber: number, oldExerciseId: string, newExercise: Exercise) => void;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  exercise,
  dayNumber,
  userProfile,
  onClose,
  onSwapExercise,
}) => {
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapReason, setSwapReason] = useState('');
  const [showSwapPrompt, setShowSwapPrompt] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

  if (!exercise) return null;

  const handleExecuteSwap = async (customReason?: string) => {
    setIsSwapping(true);
    setSwapError(null);
    try {
      const res = await fetch('/api/quick-exercise-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentExercise: exercise,
          availableEquipment: userProfile.availableEquipment,
          limitation: userProfile.limitations.join(', ') + (userProfile.customLimitation ? ` (${userProfile.customLimitation})` : ''),
          reason: customReason || swapReason || 'Alternative exercise variation requested',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to find exercise alternative');
      }

      const newExercise: Exercise = await res.json();
      onSwapExercise(dayNumber, exercise.id, newExercise);
      onClose();
    } catch (err: any) {
      setSwapError(err.message || 'Swap failed. Please try again.');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-8 text-slate-100 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span>Day {dayNumber} Exercise Guide</span>
              <span>·</span>
              <span>{exercise.equipment}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{exercise.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
              <span className="text-slate-200 font-medium">{exercise.targetMuscleGroup}</span>
              {exercise.secondaryMuscles?.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400">Secondary: {exercise.secondaryMuscles.join(', ')}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prescription Parameters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-center">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Sets × Reps</div>
            <div className="text-base font-semibold text-emerald-400 mt-0.5">{exercise.sets} × {exercise.reps}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Rest Interval</div>
            <div className="text-base font-semibold text-slate-200 mt-0.5 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{exercise.restSeconds}s</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Intensity</div>
            <div className="text-base font-semibold text-amber-400 mt-0.5">{exercise.rpe}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Tempo Cadence</div>
            <div className="text-base font-semibold text-cyan-300 font-mono mt-0.5">{exercise.tempo || 'Controlled'}</div>
          </div>
        </div>

        {/* Coaching Cues */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Form & Technique Coaching Cues</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-300 pl-2">
              {exercise.coachingCues?.map((cue, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Common Mistakes */}
          {exercise.commonMistakes?.length > 0 && (
            <div className="p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-300 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Common Pitfalls to Avoid</span>
              </div>
              <ul className="space-y-1.5 text-sm text-rose-200/90 pl-1">
                {exercise.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">×</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Default Alternative */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">Prescribed Alternative / Regression</div>
            <div className="text-sm font-medium text-slate-200">{exercise.alternativeExercise}</div>
          </div>

          {/* Swap Trigger Section */}
          <div className="pt-3 border-t border-slate-800">
            {!showSwapPrompt ? (
              <button
                type="button"
                onClick={() => setShowSwapPrompt(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-sm font-medium text-slate-200 hover:text-white border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Swap this exercise with Gemini AI</span>
              </button>
            ) : (
              <div className="p-3.5 bg-slate-950 border border-emerald-900/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Exercise Substitution</span>
                  </div>
                  <button
                    onClick={() => setShowSwapPrompt(false)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Joint discomfort / pain',
                    'Missing required equipment',
                    'Too difficult (need regression)',
                    'Too easy (need challenge)',
                    'Prefer bodyweight variation',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleExecuteSwap(preset)}
                      disabled={isSwapping}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors disabled:opacity-50"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={swapReason}
                    onChange={(e) => setSwapReason(e.target.value)}
                    placeholder="Or type custom reason (e.g., wrist feels sensitive today)..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleExecuteSwap()}
                    disabled={isSwapping}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSwapping ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{isSwapping ? 'Generating...' : 'Swap'}</span>
                  </button>
                </div>

                {swapError && (
                  <p className="text-xs text-rose-400">{swapError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
