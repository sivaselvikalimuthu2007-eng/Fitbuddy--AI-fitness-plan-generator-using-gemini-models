import React, { useState } from 'react';
import { Zap, Activity, Info, ChevronDown, ChevronUp, Sparkles, Check, HeartPulse, Clock, Gauge } from 'lucide-react';
import { WorkoutIntensity, FitnessPlan } from '../types/fitness';
import { WORKOUT_INTENSITY_TIERS, getIntensityTier } from '../data/intensityData';

interface WorkoutIntensityControlProps {
  currentIntensity?: WorkoutIntensity;
  onIntensityChange: (newIntensity: WorkoutIntensity) => void;
  onAdaptWithAI?: (newIntensity: WorkoutIntensity) => void;
  isAdapting?: boolean;
}

export const WorkoutIntensityControl: React.FC<WorkoutIntensityControlProps> = ({
  currentIntensity = 'medium',
  onIntensityChange,
  onAdaptWithAI,
  isAdapting = false,
}) => {
  const [showMatrix, setShowMatrix] = useState(false);
  const activeTier = getIntensityTier(currentIntensity);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-slate-100 shadow-md">
      {/* Header & Current Intensity Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-0.5">
            <Gauge className="w-4 h-4" />
            <span>WORKOUT INTENSITY CONTROLS</span>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white">Intensity Calibration</h3>
            <span
              className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border ${activeTier.colorClass.badge}`}
            >
              Current: {activeTier.shortLabel} ({activeTier.rpeRange})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch between Low, Medium, and High to tune volume, target RPE, and cardiovascular demand.
          </p>
        </div>

        <button
          onClick={() => setShowMatrix(!showMatrix)}
          className="self-start sm:self-auto text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors border border-slate-700/60"
        >
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>{showMatrix ? 'Hide Intensity Science' : 'Intensity & RPE Science'}</span>
          {showMatrix ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3-Pillar Intensity Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
        {WORKOUT_INTENSITY_TIERS.map((tier) => {
          const isSelected = tier.id === currentIntensity;
          return (
            <div
              key={tier.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? `${tier.colorClass.bg} ${tier.colorClass.border} ring-1 ${tier.colorClass.ring} shadow-sm`
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${tier.colorClass.text}`} />
                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {tier.label}
                    </span>
                  </div>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> Active
                    </span>
                  ) : null}
                </div>

                <div className="text-[11px] font-mono text-slate-400 mb-2">
                  <span className={`font-semibold ${tier.colorClass.text}`}>{tier.rpeRange}</span>
                  <span className="mx-1">·</span>
                  <span>{tier.heartRateZone}</span>
                </div>

                <p className="text-xs text-slate-300 leading-snug mb-3">{tier.tagline}</p>

                <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/60 pt-2 mb-3">
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-500 font-mono flex-shrink-0">Volume:</span>
                    <span className="text-slate-300">{tier.volumeGuideline}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-500 font-mono flex-shrink-0">Rest:</span>
                    <span className="text-slate-300">{tier.restIntervals}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  disabled={isSelected}
                  onClick={() => onIntensityChange(tier.id)}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all text-center ${
                    isSelected
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-slate-800 hover:bg-slate-700 text-white hover:text-emerald-300 border border-slate-700'
                  }`}
                >
                  {isSelected ? 'Selected' : `Set to ${tier.shortLabel}`}
                </button>

                {onAdaptWithAI && (
                  <button
                    type="button"
                    disabled={isAdapting}
                    onClick={() => onAdaptWithAI(tier.id)}
                    title={`Recalibrate exercises for ${tier.label} using Gemini AI`}
                    className="py-1.5 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Adapt</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Scientific Physiology Comparison Matrix */}
      {showMatrix && (
        <div className="mt-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-emerald-400 font-bold">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>EXERCISE PHYSIOLOGY & INTENSITY CALIBRATION MATRIX</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="p-3">Intensity Option</th>
                  <th className="p-3">Target RPE & HR</th>
                  <th className="p-3">Sets & Volume</th>
                  <th className="p-3">Rest Intervals</th>
                  <th className="p-3">Biomechanical Focus</th>
                  <th className="p-3">Best Recommended For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {WORKOUT_INTENSITY_TIERS.map((tier) => (
                  <tr
                    key={tier.id}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      tier.id === currentIntensity ? 'bg-slate-800/40 font-medium' : ''
                    }`}
                  >
                    <td className="p-3 font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className={tier.colorClass.text}>{tier.label}</span>
                        {tier.id === currentIntensity && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                            Current
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      <div className={tier.colorClass.text}>{tier.rpeRange}</div>
                      <div className="text-slate-400 text-[10px]">{tier.heartRateZone}</div>
                    </td>
                    <td className="p-3 text-slate-300">{tier.volumeGuideline}</td>
                    <td className="p-3 text-slate-300">{tier.restIntervals}</td>
                    <td className="p-3 text-slate-400 leading-snug">{tier.biomechanicalFocus}</td>
                    <td className="p-3 text-slate-300">{tier.idealFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
