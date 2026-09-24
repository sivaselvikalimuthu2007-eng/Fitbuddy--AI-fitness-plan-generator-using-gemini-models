import React, { useState } from 'react';
import {
  X, Sparkles, Dumbbell, ShieldAlert, HeartPulse, Clock, Calendar,
  Activity, User, Check, RefreshCw, AlertCircle, Compass, Zap, Gauge
} from 'lucide-react';
import { UserProfile, PrimaryGoal, ExperienceLevel, EquipmentType, FitnessPlan, WorkoutIntensity } from '../types/fitness';
import { STARTER_PROFILES } from '../data/defaultData';
import { WORKOUT_INTENSITY_TIERS } from '../data/intensityData';

interface ProfileSetupModalProps {
  initialProfile: UserProfile;
  targetGoal?: PrimaryGoal;
  onClose: () => void;
  onPlanGenerated: (newPlan: FitnessPlan) => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  initialProfile,
  targetGoal,
  onClose,
  onPlanGenerated,
}) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const base = {
      ...initialProfile,
      workoutIntensity: initialProfile.workoutIntensity || 'medium',
    };
    if (targetGoal) {
      return { ...base, primaryGoal: targetGoal };
    }
    return base;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const corePillarGoals: { id: PrimaryGoal; label: string; desc: string; badge: string }[] = [
    { id: 'fat_loss', label: 'Weight Loss & Shred', desc: 'Metabolic density, high caloric burn & lean muscle preservation', badge: 'Core Pillar' },
    { id: 'muscle_gain', label: 'Muscle Gain & Hypertrophy', desc: 'Mechanical tension, 8-12 reps, progressive volume & density', badge: 'Core Pillar' },
    { id: 'mobility_flexibility', label: 'Flexibility & Joint Mobility', desc: 'Decompression, expanded kinetic ROM & pain-free movement flow', badge: 'Core Pillar' },
    { id: 'general_health', label: 'General Wellness & Longevity', desc: 'Sustainable vitality, posture correction, Zone 2 heart health', badge: 'Core Pillar' },
  ];

  const additionalGoals: { id: PrimaryGoal; label: string; desc: string }[] = [
    { id: 'strength', label: 'Raw Strength & Power', desc: 'Heavy progressive overload, CNS neural drive & 3-5 rep output' },
    { id: 'endurance', label: 'Cardio Stamina & Aerobic Base', desc: 'Mitochondrial density, lactate clearance & high-volume work' },
    { id: 'athletic_performance', label: 'Athletic Conditioning', desc: 'Explosive power, speed agility, plyometrics & functional output' },
  ];

  const equipmentOptions: { id: EquipmentType; label: string }[] = [
    { id: 'bodyweight', label: 'Bodyweight (Zero gear)' },
    { id: 'dumbbells', label: 'Dumbbells (Fixed or Adjustable)' },
    { id: 'resistance_bands', label: 'Resistance Bands / Loops' },
    { id: 'kettlebells', label: 'Kettlebells' },
    { id: 'pullup_bar', label: 'Pull-up Bar' },
    { id: 'barbell_plates', label: 'Barbell & Weight Plates' },
    { id: 'cable_machine', label: 'Cable Station / Pulleys' },
    { id: 'cardio_machines', label: 'Cardio Gear (Treadmill, Rower, Bike)' },
    { id: 'full_gym', label: 'Full Commercial Gym Access' },
  ];

  const commonLimitations = [
    'Lower back sensitivity',
    'Knee discomfort / pain',
    'Shoulder impingement',
    'Wrist strain',
    'Tight hips from sitting',
    'Neck / upper trap tension',
  ];

  const toggleEquipment = (eq: EquipmentType) => {
    setProfile((prev) => {
      const exists = prev.availableEquipment.includes(eq);
      return {
        ...prev,
        availableEquipment: exists
          ? prev.availableEquipment.filter((x) => x !== eq)
          : [...prev.availableEquipment, eq],
      };
    });
  };

  const toggleLimitation = (lim: string) => {
    setProfile((prev) => {
      const exists = prev.limitations.includes(lim);
      return {
        ...prev,
        limitations: exists
          ? prev.limitations.filter((x) => x !== lim)
          : [...prev.limitations, lim],
      };
    });
  };

  const handleApplyStarter = (starterProfile: UserProfile) => {
    setProfile(starterProfile);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.availableEquipment.length === 0) {
      setError('Please select at least one available equipment option (e.g., Bodyweight).');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate fitness plan.');
      }

      const newPlan: FitnessPlan = await res.json();
      onPlanGenerated(newPlan);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 my-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>AI FITNESS ARCHITECT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Design Your AI Workout & Wellness Plan</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Powered by Google Gemini. Every exercise, rep range, and rest protocol tailored to your real environment.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Starter Profiles */}
        <div className="my-4 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fast-Track: 1-Click Persona Templates</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {STARTER_PROFILES.map((st, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyStarter(st.profile)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-white group-hover:text-emerald-300">
                  {st.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                  {st.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Section: Athlete Basics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Athlete Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="E.g. Alex"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Age</label>
              <input
                type="number"
                min={14}
                max={95}
                value={profile.age || ''}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 28 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Experience Level</label>
              <select
                value={profile.experienceLevel}
                onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value as ExperienceLevel })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="beginner">Beginner (0-6 months)</option>
                <option value="intermediate">Intermediate (6-24 months)</option>
                <option value="advanced">Advanced (2+ years)</option>
                <option value="returning">Returning after injury/hiatus</option>
              </select>
            </div>
          </div>

          {/* Section: Primary Goal */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Core Fitness Goals & Pillars
                </label>
                <span className="text-[11px] text-slate-400">Select your primary objective</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {corePillarGoals.map((g) => {
                  const isSelected = profile.primaryGoal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, primaryGoal: g.id })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/40'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className={isSelected ? 'text-emerald-300' : 'text-white'}>{g.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-snug">{g.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Additional Specialized Modalities
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {additionalGoals.map((g) => {
                  const isSelected = profile.primaryGoal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, primaryGoal: g.id })}
                      className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                          : 'bg-slate-950/30 border-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className={isSelected ? 'text-emerald-300' : 'text-slate-200'}>{g.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">{g.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section: Workout Intensity (Low, Medium, High) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                <span>Workout Intensity Options</span>
              </label>
              <span className="text-[11px] text-slate-400">Low, Medium, or High Effort Tier</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {WORKOUT_INTENSITY_TIERS.map((tier) => {
                const isSelected = (profile.workoutIntensity || 'medium') === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, workoutIntensity: tier.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${tier.colorClass.bg} ${tier.colorClass.border} text-white shadow-sm ring-1 ${tier.colorClass.ring}`
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Zap className={`w-3.5 h-3.5 ${tier.colorClass.text}`} />
                        <span className={isSelected ? 'text-white' : 'text-slate-200'}>{tier.label}</span>
                      </div>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">{tier.shortLabel}</span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mb-1">
                      <span className={`font-semibold ${tier.colorClass.text}`}>{tier.rpeRange}</span>
                      <span className="mx-1">·</span>
                      <span>{tier.heartRateZone.split(' ')[0]}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 leading-snug">{tier.tagline}</div>
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                      {tier.volumeGuideline.split('·')[0].trim()} · {tier.restIntervals.split(' ')[0]} rest
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Equipment Access */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Available Equipment (Select all you have)
              </label>
              <span className="text-[11px] text-emerald-400 font-mono">
                {profile.availableEquipment.length} selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {equipmentOptions.map((eq) => {
                const isSelected = profile.availableEquipment.includes(eq.id);
                return (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => toggleEquipment(eq.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-medium'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{eq.label}</span>
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Schedule & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-200">Training Frequency</span>
                <span className="font-mono text-emerald-400 font-bold">{profile.daysPerWeek} days / week</span>
              </div>
              <input
                type="range"
                min={2}
                max={6}
                value={profile.daysPerWeek}
                onChange={(e) => setProfile({ ...profile, daysPerWeek: Number(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>2 days</span>
                <span>3 days</span>
                <span>4 days</span>
                <span>5 days</span>
                <span>6 days</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-200">Session Duration</span>
                <span className="font-mono text-emerald-400 font-bold">{profile.minutesPerSession} minutes</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[20, 30, 45, 60, 75].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setProfile({ ...profile, minutesPerSession: mins })}
                    className={`py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors ${
                      profile.minutesPerSession === mins
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Limitations & Injuries */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Physical Limitations, Joint Sensitivities, or Injuries
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {commonLimitations.map((lim) => {
                const isSelected = profile.limitations.includes(lim);
                return (
                  <button
                    key={lim}
                    type="button"
                    onClick={() => toggleLimitation(lim)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 font-medium'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {lim}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={profile.customLimitation}
              onChange={(e) => setProfile({ ...profile, customLimitation: e.target.value })}
              placeholder="Additional injury details or notes (e.g., healing right wrist fracture, no overhead pressing)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Section: Dietary & Lifestyle Preference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nutrition Preference</label>
              <input
                type="text"
                value={profile.wellnessPreferences?.dietaryStyle || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    wellnessPreferences: {
                      ...profile.wellnessPreferences,
                      dietaryStyle: e.target.value,
                    },
                  })
                }
                placeholder="E.g. High protein, Plant-based, Mediterranean, Balanced"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Program Target Horizon</label>
              <select
                value={profile.targetTimelineWeeks}
                onChange={(e) => setProfile({ ...profile, targetTimelineWeeks: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={4}>4-Week Kickstart</option>
                <option value={8}>8-Week Transformation</option>
                <option value={12}>12-Week Complete Periodization</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Bottom Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/20 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini is Formulating Your Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete AI Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
