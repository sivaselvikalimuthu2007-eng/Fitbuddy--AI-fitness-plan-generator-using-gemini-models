import { WorkoutIntensity } from '../types/fitness';

export interface WorkoutIntensityTierInfo {
  id: WorkoutIntensity;
  label: string;
  shortLabel: string;
  tagline: string;
  rpeRange: string;
  heartRateZone: string;
  volumeGuideline: string;
  restIntervals: string;
  biomechanicalFocus: string;
  idealFor: string;
  calorieMultiplier: number;
  colorClass: {
    text: string;
    bg: string;
    border: string;
    badge: string;
    glow: string;
    ring: string;
  };
}

export const WORKOUT_INTENSITY_TIERS: WorkoutIntensityTierInfo[] = [
  {
    id: 'low',
    label: 'Low Intensity',
    shortLabel: 'Low',
    tagline: 'Gentle, restorative & joint-friendly movement flow',
    rpeRange: 'RPE 4–6',
    heartRateZone: 'Zone 1–2 (50–65% HRmax)',
    volumeGuideline: '2–3 sets · Controlled tempo (3-1-2) · 3–4 RIR',
    restIntervals: '75–90s unhurried rest for complete nervous reset',
    biomechanicalFocus: 'Joint decompression, synovial lubrication, motor patterning & minimal systemic fatigue',
    idealFor: 'Beginners, active recovery, joint rehab, stress relief, and low-energy days',
    calorieMultiplier: 0.8,
    colorClass: {
      text: 'text-sky-400',
      bg: 'bg-sky-950/40',
      border: 'border-sky-500/50',
      badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      glow: 'shadow-sky-500/10',
      ring: 'ring-sky-400/40',
    },
  },
  {
    id: 'medium',
    label: 'Medium Intensity',
    shortLabel: 'Medium',
    tagline: 'Balanced progressive overload & sustainable conditioning',
    rpeRange: 'RPE 6.5–8',
    heartRateZone: 'Zone 2–3 (65–80% HRmax)',
    volumeGuideline: '3–4 sets · Consistent loading · 2–3 RIR',
    restIntervals: '60–90s compound / 45–60s isolation',
    biomechanicalFocus: 'Optimal mechanical tension, progressive overload, aerobic stamina & tissue density',
    idealFor: 'Consistent muscle growth, steady fat loss, athletic maintenance, and lifelong wellness',
    calorieMultiplier: 1.0,
    colorClass: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-500/50',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      glow: 'shadow-emerald-500/10',
      ring: 'ring-emerald-400/40',
    },
  },
  {
    id: 'high',
    label: 'High Intensity',
    shortLabel: 'High',
    tagline: 'Maximum effort, rapid metabolic density & peak output',
    rpeRange: 'RPE 8.5–10',
    heartRateZone: 'Zone 4–5 (80–95% HRmax)',
    volumeGuideline: '4–5 sets · 0–1 RIR or timed HIIT density intervals',
    restIntervals: '30–45s rapid transitions or full ATP recharge for max lifts',
    biomechanicalFocus: 'High-threshold motor unit recruitment, intense EPOC afterburn & anaerobic power',
    idealFor: 'Aggressive fat shred, strength breakthroughs, conditioned athletes & peak power',
    calorieMultiplier: 1.3,
    colorClass: {
      text: 'text-amber-400',
      bg: 'bg-amber-950/40',
      border: 'border-amber-500/50',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      glow: 'shadow-amber-500/10',
      ring: 'ring-amber-400/40',
    },
  },
];

export function getIntensityTier(intensity?: WorkoutIntensity): WorkoutIntensityTierInfo {
  return (
    WORKOUT_INTENSITY_TIERS.find((t) => t.id === intensity) ||
    WORKOUT_INTENSITY_TIERS[1] // default Medium
  );
}
