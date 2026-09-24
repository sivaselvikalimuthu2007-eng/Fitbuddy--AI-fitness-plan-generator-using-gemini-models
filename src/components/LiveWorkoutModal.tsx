import React, { useState, useEffect, useRef } from 'react';
import {
  X, Play, Pause, RotateCcw, Check, CheckCircle2,
  Clock, Flame, ChevronRight, Award, Plus, Trash2, Volume2, VolumeX, Sparkles
} from 'lucide-react';
import { WorkoutDay, Exercise, WorkoutSessionLog } from '../types/fitness';
import { sound } from '../utils/audio';

interface LiveWorkoutModalProps {
  day: WorkoutDay;
  planId: string;
  onClose: () => void;
  onWorkoutCompleted: (log: WorkoutSessionLog) => void;
}

interface SetLog {
  setNumber: number;
  reps: string | number;
  weightKg: number;
  completed: boolean;
}

export const LiveWorkoutModal: React.FC<LiveWorkoutModalProps> = ({
  day,
  planId,
  onClose,
  onWorkoutCompleted,
}) => {
  const [activeStep, setActiveStep] = useState<'warmup' | 'exercises' | 'cooldown' | 'summary'>('warmup');
  const [warmupChecks, setWarmupChecks] = useState<boolean[]>(
    new Array(day.warmup.activities.length).fill(false)
  );
  const [cooldownChecks, setCooldownChecks] = useState<boolean[]>(
    new Array(day.cooldown.stretches.length).fill(false)
  );

  // Exercise tracking state: map exerciseId -> SetLog[]
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, SetLog[]>>(() => {
    const initial: Record<string, SetLog[]> = {};
    day.exercises.forEach((ex) => {
      initial[ex.id] = Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        reps: ex.reps.split(' ')[0] || '10',
        weightKg: 0,
        completed: false,
      }));
    });
    return initial;
  });

  // Current focused exercise index
  const [currentExIndex, setCurrentExIndex] = useState(0);

  // Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTimerTotal, setRestTimerTotal] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Overall workout stopwatch
  const [workoutElapsedSeconds, setWorkoutElapsedSeconds] = useState(0);

  // User notes & RPE rating on finish
  const [rpeRating, setRpeRating] = useState(7);
  const [workoutNotes, setWorkoutNotes] = useState('');

  // Stopwatch effect
  useEffect(() => {
    if (activeStep === 'summary') return;
    const interval = setInterval(() => {
      setWorkoutElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeStep]);

  // Rest timer effect
  useEffect(() => {
    let timer: any;
    if (isRestTimerActive && restTimerSeconds > 0) {
      timer = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 4 && prev > 1 && soundEnabled) {
            sound.playRestCountdownWarning();
          }
          if (prev <= 1) {
            if (soundEnabled) sound.playRestCompleted();
            setIsRestTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRestTimerActive, restTimerSeconds, soundEnabled]);

  const startRestTimer = (seconds: number) => {
    setRestTimerTotal(seconds);
    setRestTimerSeconds(seconds);
    setIsRestTimerActive(true);
  };

  const handleToggleSet = (exerciseId: string, setIndex: number, restSeconds: number) => {
    setExerciseLogs((prev) => {
      const currentList = [...(prev[exerciseId] || [])];
      const targetSet = { ...currentList[setIndex] };
      const nextCompleted = !targetSet.completed;
      targetSet.completed = nextCompleted;
      currentList[setIndex] = targetSet;

      if (nextCompleted) {
        if (soundEnabled) sound.playBeep(800, 0.15);
        // Start rest timer automatically if not last set
        if (setIndex < currentList.length - 1) {
          startRestTimer(restSeconds);
        }
      }

      return { ...prev, [exerciseId]: currentList };
    });
  };

  const handleWeightChange = (exerciseId: string, setIndex: number, weight: number) => {
    setExerciseLogs((prev) => {
      const currentList = [...(prev[exerciseId] || [])];
      currentList[setIndex] = { ...currentList[setIndex], weightKg: weight };
      return { ...prev, [exerciseId]: currentList };
    });
  };

  const handleRepsChange = (exerciseId: string, setIndex: number, reps: string) => {
    setExerciseLogs((prev) => {
      const currentList = [...(prev[exerciseId] || [])];
      currentList[setIndex] = { ...currentList[setIndex], reps };
      return { ...prev, [exerciseId]: currentList };
    });
  };

  const currentExercise = day.exercises[currentExIndex];

  // Completion calculation
  const totalSets = Object.values(exerciseLogs).flat().length;
  const completedSets = Object.values(exerciseLogs).flat().filter((s) => s.completed).length;
  const progressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const handleFinishWorkout = () => {
    if (soundEnabled) sound.playSuccessChime();
    const log: WorkoutSessionLog = {
      id: `log-${Date.now()}`,
      planId,
      dayNumber: day.dayNumber,
      dayTitle: day.dayTitle,
      dateCompleted: new Date().toISOString(),
      durationMinutes: Math.max(1, Math.round(workoutElapsedSeconds / 60)),
      exercisesCompleted: day.exercises.map((ex) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        completedSets: exerciseLogs[ex.id] || [],
      })),
      rpeFeedback: rpeRating,
      userNotes: workoutNotes,
    };
    onWorkoutCompleted(log);
    setActiveStep('summary');
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 my-4 flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE WORKOUT MODE</span>
              <span>·</span>
              <span>Day {day.dayNumber}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">{day.dayTitle}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Stopwatch */}
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-sm text-emerald-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{formatTime(workoutElapsedSeconds)}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-slate-800 border-slate-700 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Mute chimes' : 'Enable audio chimes'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Phase Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 my-3 bg-slate-950/80 border border-slate-800 rounded-xl flex-shrink-0">
          <button
            onClick={() => setActiveStep('warmup')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-colors text-center ${
              activeStep === 'warmup'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Warm-Up ({day.warmup.durationMin}m)
          </button>
          <button
            onClick={() => setActiveStep('exercises')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-colors text-center ${
              activeStep === 'exercises'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Core Exercises ({completedSets}/{totalSets} sets)
          </button>
          <button
            onClick={() => setActiveStep('cooldown')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-colors text-center ${
              activeStep === 'cooldown'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Cool-Down ({day.cooldown.durationMin}m)
          </button>
        </div>

        {/* Rest Timer Drawer (Active floating during exercises) */}
        {isRestTimerActive && (
          <div className="mb-3 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-sm">
                {restTimerSeconds}s
              </div>
              <div>
                <div className="text-xs text-emerald-300 font-medium">Resting Interval</div>
                <div className="text-[11px] text-slate-400">Deep slow breathing · Hydrate</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRestTimerSeconds((prev) => prev + 15)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                +15s
              </button>
              <button
                onClick={() => setIsRestTimerActive(false)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
              >
                Skip Rest
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* STEP 1: WARMUP */}
          {activeStep === 'warmup' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                <h3 className="text-sm font-semibold text-white mb-1">Dynamic Movement Preparation</h3>
                <p className="text-xs text-slate-400">
                  Elevate core body temperature, lubricate joint capsules, and prime the nervous system.
                </p>
              </div>

              <div className="space-y-2">
                {day.warmup.activities.map((act, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const updated = [...warmupChecks];
                      updated[idx] = !updated[idx];
                      setWarmupChecks(updated);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      warmupChecks[idx]
                        ? 'bg-emerald-950/20 border-emerald-900/50 text-slate-300'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                          warmupChecks[idx]
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {warmupChecks[idx] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${warmupChecks[idx] ? 'line-through text-slate-400' : 'text-white'}`}>
                          {act.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{act.cue}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-semibold whitespace-nowrap pl-2">
                      {act.durationOrReps}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveStep('exercises')}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-colors"
              >
                <span>Warm-Up Complete · Begin Exercises</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: EXERCISES */}
          {activeStep === 'exercises' && (
            <div className="space-y-4">
              {/* Exercise Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {day.exercises.map((ex, idx) => {
                  const exSets = exerciseLogs[ex.id] || [];
                  const isAllDone = exSets.length > 0 && exSets.every((s) => s.completed);
                  const isCurrent = idx === currentExIndex;

                  return (
                    <button
                      key={ex.id}
                      onClick={() => setCurrentExIndex(idx)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                          : isAllDone
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isAllDone && <Check className="w-3 h-3 text-emerald-400" />}
                      <span>{idx + 1}. {ex.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Exercise Card */}
              {currentExercise && (
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-mono text-emerald-400">
                        Exercise {currentExIndex + 1} of {day.exercises.length} · {currentExercise.equipment}
                      </div>
                      <h3 className="text-xl font-bold text-white mt-0.5">{currentExercise.name}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Target: <span className="text-slate-300">{currentExercise.targetMuscleGroup}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => startRestTimer(currentExercise.restSeconds)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Rest Timer ({currentExercise.restSeconds}s)</span>
                    </button>
                  </div>

                  {/* Cues Pill */}
                  <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl">
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">Key Form Cues</div>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {currentExercise.coachingCues.slice(0, 2).map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">›</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Set-by-Set Logging Table */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[11px] font-mono uppercase text-slate-400 px-2">
                      <span className="col-span-2">Set</span>
                      <span className="col-span-3">Target</span>
                      <span className="col-span-3">Weight (kg)</span>
                      <span className="col-span-2">Reps Done</span>
                      <span className="col-span-2 text-right">Complete</span>
                    </div>

                    {(exerciseLogs[currentExercise.id] || []).map((setLog, setIdx) => (
                      <div
                        key={setIdx}
                        className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border transition-colors ${
                          setLog.completed
                            ? 'bg-emerald-950/20 border-emerald-900/60'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="col-span-2 font-mono text-xs font-semibold text-slate-300">
                          #{setLog.setNumber}
                        </div>
                        <div className="col-span-3 text-xs text-slate-400 font-mono">
                          {currentExercise.reps}
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={setLog.weightKg || ''}
                            onChange={(e) => handleWeightChange(currentExercise.id, setIdx, parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={setLog.reps}
                            onChange={(e) => handleRepsChange(currentExercise.id, setIdx, e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleToggleSet(currentExercise.id, setIdx, currentExercise.restSeconds)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                              setLog.completed
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation between exercises */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      disabled={currentExIndex === 0}
                      onClick={() => setCurrentExIndex((prev) => prev - 1)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {currentExIndex < day.exercises.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentExIndex((prev) => prev + 1)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center gap-1.5"
                      >
                        <span>Next Movement</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveStep('cooldown')}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
                      >
                        <span>Move to Cool-Down</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: COOLDOWN & FINISH */}
          {activeStep === 'cooldown' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                <h3 className="text-sm font-semibold text-white mb-1">Downregulation & Flexibility</h3>
                <p className="text-xs text-slate-400">
                  Normalize heart rate, reduce sympathetic nervous drive, and decompress joint capsules.
                </p>
              </div>

              <div className="space-y-2">
                {day.cooldown.stretches.map((str, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const updated = [...cooldownChecks];
                      updated[idx] = !updated[idx];
                      setCooldownChecks(updated);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      cooldownChecks[idx]
                        ? 'bg-emerald-950/20 border-emerald-900/50 text-slate-300'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                          cooldownChecks[idx]
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {cooldownChecks[idx] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${cooldownChecks[idx] ? 'line-through text-slate-400' : 'text-white'}`}>
                          {str.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{str.cue}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-semibold whitespace-nowrap pl-2">
                      {str.holdTime}
                    </span>
                  </div>
                ))}
              </div>

              {/* RPE feedback and notes */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">Perceived Exertion (RPE Scale)</span>
                    <span className="font-mono text-emerald-400 font-bold">{rpeRating} / 10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={rpeRating}
                    onChange={(e) => setRpeRating(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>1 (Very light)</span>
                    <span>5 (Moderate)</span>
                    <span>8 (Hard challenge)</span>
                    <span>10 (Max failure)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Workout Notes & Reflections</label>
                  <textarea
                    rows={2}
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    placeholder="E.g., felt great energy on squats, shoulders felt solid, weights felt light..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinishWorkout}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-colors"
              >
                <Award className="w-5 h-5" />
                <span>Complete Workout & Save Log</span>
              </button>
            </div>
          )}

          {/* STEP 4: CELEBRATION SUMMARY */}
          {activeStep === 'summary' && (
            <div className="py-8 px-4 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-white">Workout Crushed!</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  Outstanding consistency, {day.dayTitle} is officially logged to your training history.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Duration</div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    {Math.max(1, Math.round(workoutElapsedSeconds / 60))}m
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Sets Done</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    {completedSets}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Est. Burn</div>
                  <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                    ~{day.estimatedCaloriesBurn} kcal
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/40 rounded-xl text-left text-xs text-emerald-200 max-w-md mx-auto">
                <span className="font-semibold text-emerald-300">Coach Recovery Protocol: </span>
                <span>{day.recoveryNotes}</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-colors"
              >
                Back to Plan Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
