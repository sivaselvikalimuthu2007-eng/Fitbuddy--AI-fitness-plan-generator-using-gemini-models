import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, AlertCircle, History, Clock, ArrowRight, Check } from 'lucide-react';
import { FitnessPlan } from '../types/fitness';

interface AdaptPlanModalProps {
  currentPlan: FitnessPlan;
  onClose: () => void;
  onPlanAdapted: (adaptedPlan: FitnessPlan) => void;
}

export const AdaptPlanModal: React.FC<AdaptPlanModalProps> = ({
  currentPlan,
  onClose,
  onPlanAdapted,
}) => {
  const [feedbackPrompt, setFeedbackPrompt] = useState('');
  const [adaptationType, setAdaptationType] = useState<string>('injury');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      label: 'Sore Knees / Low Joint Impact',
      type: 'injury',
      prompt: 'My knees feel sensitive today from deep squatting. Please adapt leg movements to joint-friendly hinge and glute exercises with minimal knee flexion strain.',
    },
    {
      label: 'Time Crunch (Shorten to 20 mins)',
      type: 'schedule',
      prompt: 'I am extremely busy this week and only have 20 minutes per workout. Condense the sessions into high-density supersets without losing compound benefits.',
    },
    {
      label: 'Travel Mode (Zero Equipment Bodyweight)',
      type: 'equipment',
      prompt: 'I am traveling and staying in a hotel room with zero equipment. Reconfigure all exercises to bodyweight, towel, and calisthenics alternatives.',
    },
    {
      label: 'Progressive Overload Ramp (More Intensity)',
      type: 'intensity',
      prompt: 'The current workouts feel a bit easy. Increase intensity, volume, or target RPE to stimulate greater hypertrophy and strength adaptation.',
    },
    {
      label: 'Add Extra Core & Mobility Emphasis',
      type: 'custom',
      prompt: 'Add more targeted core stability work (anti-rotation, hollow body) and desk-worker thoracic spine mobility at the end of each session.',
    },
    {
      label: 'Deload & Active Recovery Week',
      type: 'intensity',
      prompt: 'I feel accumulating central nervous system fatigue. Convert this week into a restorative deload with 50% volume and mobility flows.',
    },
  ];

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setAdaptationType(preset.type);
    setFeedbackPrompt(preset.prompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackPrompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/adapt-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlan,
          feedbackPrompt,
          adaptationType,
          targetDayNumber: selectedDayNumber === 'all' ? undefined : selectedDayNumber,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to adapt plan');
      }

      const updatedPlan: FitnessPlan = await res.json();
      onPlanAdapted(updatedPlan);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong while adapting the plan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 my-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>DYNAMIC GEMINI ADAPTATION</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Adapt Your Fitness Plan</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Life changes, injuries happen, and schedules shift. Tell Gemini what needs adjusting and your routine will re-calculate dynamically.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Common Quick Adaptation Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 text-left rounded-xl border transition-all text-xs flex items-start justify-between ${
                    feedbackPrompt === preset.prompt
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="font-medium pr-2">{preset.label}</span>
                  {feedbackPrompt === preset.prompt && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Scope selection */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-mono text-slate-400">Target Scope:</span>
            <button
              type="button"
              onClick={() => setSelectedDayNumber('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                selectedDayNumber === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Entire 7-Day Plan
            </button>
            {currentPlan.weeklySchedule.map((d) => (
              <button
                key={d.dayNumber}
                type="button"
                onClick={() => setSelectedDayNumber(d.dayNumber)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  selectedDayNumber === d.dayNumber
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Day {d.dayNumber}
              </button>
            ))}
          </div>

          {/* Detailed Prompt Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Specific Instructions & Athlete Feedback
            </label>
            <textarea
              rows={3}
              value={feedbackPrompt}
              onChange={(e) => setFeedbackPrompt(e.target.value)}
              placeholder="Describe your current status (e.g., 'My shoulder feels pinched during overhead movements, please replace with horizontal presses and rear delt work')..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !feedbackPrompt.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini Re-Engineering Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Adapt Plan with AI</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Previous Adaptation Log */}
        {currentPlan.adaptationHistory?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Adaptation Log ({currentPlan.adaptationHistory.length})</span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
              {currentPlan.adaptationHistory.map((item, i) => (
                <div key={i} className="p-2.5 bg-slate-950/60 border border-slate-800/70 rounded-lg text-xs">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span className="text-emerald-400 font-medium">{item.reason}</span>
                    <span>{item.date}</span>
                  </div>
                  <p className="text-slate-300 mt-1">{item.changesSummary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
