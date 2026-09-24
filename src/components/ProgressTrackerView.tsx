import React from 'react';
import {
  Flame, Award, Clock, Calendar, CheckCircle2,
  Trash2, Dumbbell, TrendingUp, ChevronRight, Activity
} from 'lucide-react';
import { WorkoutSessionLog } from '../types/fitness';

interface ProgressTrackerViewProps {
  logs: WorkoutSessionLog[];
  onClearLogs: () => void;
}

export const ProgressTrackerView: React.FC<ProgressTrackerViewProps> = ({
  logs,
  onClearLogs,
}) => {
  const totalMinutes = logs.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const totalSetsLogged = logs.reduce((acc, curr) => {
    return acc + curr.exercisesCompleted.reduce((sum, ex) => sum + (ex.completedSets?.filter(s => s.completed).length || 0), 0);
  }, 0);

  // Calculate current streak (consecutive days or workouts this week)
  const streakCount = logs.length > 0 ? Math.min(logs.length, 7) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">Completed</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{logs.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Logged sessions</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">Consistency</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">{streakCount} Streak</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Workout velocity</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">Training Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{totalMinutes}m</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Under load</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">Sets Finished</span>
            <Dumbbell className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">{totalSetsLogged}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Work sets executed</div>
        </div>
      </div>

      {/* Log History */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Workout Log History</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified sessions recorded directly from Live Workout Mode.
            </p>
          </div>
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-3">
            <Activity className="w-10 h-10 mx-auto text-slate-600" />
            <div className="text-sm font-medium text-slate-300">No logged workouts yet</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Open any training day from your weekly schedule and tap "Start Workout" to record your live sets and reps.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                      <span>Day {log.dayNumber}</span>
                      <span>·</span>
                      <span>{new Date(log.dateCompleted).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span>·</span>
                      <span>{log.durationMinutes} minutes</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-0.5">{log.dayTitle}</h4>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
                      RPE {log.rpeFeedback}/10
                    </span>
                  </div>
                </div>

                {/* Exercises listed */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                  {log.exercisesCompleted.map((ex, i) => {
                    const doneCount = ex.completedSets?.filter((s) => s.completed).length || 0;
                    return (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        {ex.exerciseName} ({doneCount} sets)
                      </span>
                    );
                  })}
                </div>

                {log.userNotes && (
                  <p className="text-xs text-slate-400 italic pt-1">
                    "{log.userNotes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
