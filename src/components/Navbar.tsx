import React from 'react';
import { Dumbbell, Sparkles, MessageSquare, Plus, Activity, HeartPulse, User } from 'lucide-react';

interface NavbarProps {
  currentTab: 'plan' | 'wellness' | 'progress';
  onTabChange: (tab: 'plan' | 'wellness' | 'progress') => void;
  onOpenAdapt: () => void;
  onOpenCoach: () => void;
  onOpenProfile: () => void;
  planTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenAdapt,
  onOpenCoach,
  onOpenProfile,
  planTitle,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white tracking-tight">FitBuddy</span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-900/60">
                AI Powered
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-xs hidden sm:block">
              {planTitle}
            </div>
          </div>
        </div>

        {/* Center: Segmented Tabs (Functional Buttons) */}
        <nav className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => onTabChange('plan')}
            className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              currentTab === 'plan'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weekly Plan
          </button>
          <button
            type="button"
            onClick={() => onTabChange('wellness')}
            className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              currentTab === 'wellness'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wellness & Fuel
          </button>
          <button
            type="button"
            onClick={() => onTabChange('progress')}
            className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              currentTab === 'progress'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            History & Logs
          </button>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Adapt Plan Trigger */}
          <button
            type="button"
            onClick={onOpenAdapt}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
            title="Adapt this plan with Gemini"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Adapt Plan</span>
          </button>

          {/* AI Coach Drawer Button */}
          <button
            type="button"
            onClick={onOpenCoach}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors relative"
            title="Chat with AI Coach"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
          </button>

          {/* Profile / New Plan Button */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors"
            title="Edit Profile or Generate New Plan"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
