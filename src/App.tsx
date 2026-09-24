import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PlanOverview } from './components/PlanOverview';
import { WellnessGuideView } from './components/WellnessGuideView';
import { ProgressTrackerView } from './components/ProgressTrackerView';
import { LiveWorkoutModal } from './components/LiveWorkoutModal';
import { ExerciseModal } from './components/ExerciseModal';
import { AdaptPlanModal } from './components/AdaptPlanModal';
import { ProfileSetupModal } from './components/ProfileSetupModal';
import { CoachChatDrawer } from './components/CoachChatDrawer';
import { FitnessPlan, UserProfile, WorkoutDay, Exercise, WorkoutSessionLog, PrimaryGoal } from './types/fitness';
import { INITIAL_SAMPLE_PLAN, STARTER_PROFILES } from './data/defaultData';
import { Sparkles, CheckCircle2, MessageSquare, Dumbbell, ShieldCheck } from 'lucide-react';

export default function App() {
  // Plan state
  const [currentPlan, setCurrentPlan] = useState<FitnessPlan>(() => {
    try {
      const saved = localStorage.getItem('fitbuddy_current_plan');
      return saved ? JSON.parse(saved) : INITIAL_SAMPLE_PLAN;
    } catch {
      return INITIAL_SAMPLE_PLAN;
    }
  });

  // User Profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('fitbuddy_user_profile');
      return saved ? JSON.parse(saved) : STARTER_PROFILES[0].profile;
    } catch {
      return STARTER_PROFILES[0].profile;
    }
  });

  // Workout Session Logs state
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutSessionLog[]>(() => {
    try {
      const saved = localStorage.getItem('fitbuddy_workout_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Tab
  const [currentTab, setCurrentTab] = useState<'plan' | 'wellness' | 'progress'>('plan');

  // Modal States
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<WorkoutDay | null>(null);
  const [inspectedExercise, setInspectedExercise] = useState<{ exercise: Exercise; dayNumber: number } | null>(null);
  const [isAdaptModalOpen, setIsAdaptModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [generatorInitialGoal, setGeneratorInitialGoal] = useState<PrimaryGoal | undefined>(undefined);
  const [isCoachDrawerOpen, setIsCoachDrawerOpen] = useState(false);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fitbuddy_current_plan', JSON.stringify(currentPlan));
    } catch (e) {
      console.warn('Failed to save plan to localStorage:', e);
    }
  }, [currentPlan]);

  useEffect(() => {
    try {
      localStorage.setItem('fitbuddy_user_profile', JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage:', e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('fitbuddy_workout_logs', JSON.stringify(workoutLogs));
    } catch (e) {
      console.warn('Failed to save logs to localStorage:', e);
    }
  }, [workoutLogs]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((prev) => (prev === msg ? null : prev));
    }, 5000);
  };

  const handleSelectGoalPlan = (newPlan: FitnessPlan) => {
    setCurrentPlan(newPlan);
    setUserProfile(newPlan.profileSnapshot);
    setCurrentTab('plan');
    showNotification(`Switched active plan to: ${newPlan.title}`);
  };

  const handleOpenGeneratorForGoal = (goal: PrimaryGoal) => {
    setGeneratorInitialGoal(goal);
    setIsProfileModalOpen(true);
  };

  const handlePlanGenerated = (newPlan: FitnessPlan) => {
    setCurrentPlan(newPlan);
    setUserProfile(newPlan.profileSnapshot);
    setCurrentTab('plan');
    setGeneratorInitialGoal(undefined);
    showNotification(`New personalized plan "${newPlan.title}" created with Gemini AI!`);
  };

  const handlePlanAdapted = (adaptedPlan: FitnessPlan) => {
    setCurrentPlan(adaptedPlan);
    showNotification('Your fitness plan was dynamically adapted based on your feedback.');
  };

  const handleSwapExercise = (dayNumber: number, oldExerciseId: string, newExercise: Exercise) => {
    setCurrentPlan((prev) => {
      const updatedSchedule = prev.weeklySchedule.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          exercises: day.exercises.map((ex) => (ex.id === oldExerciseId ? newExercise : ex)),
        };
      });
      return { ...prev, weeklySchedule: updatedSchedule };
    });
    showNotification(`Substituted with "${newExercise.name}"`);
  };

  const handleWorkoutCompleted = (log: WorkoutSessionLog) => {
    setWorkoutLogs((prev) => [log, ...prev]);
    showNotification(`Great job! ${log.dayTitle} logged successfully.`);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear your workout history?')) {
      setWorkoutLogs([]);
      showNotification('Workout history cleared.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAdapt={() => setIsAdaptModalOpen(true)}
        onOpenCoach={() => setIsCoachDrawerOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        planTitle={currentPlan.title}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 p-3.5 bg-emerald-950/95 border border-emerald-500/50 rounded-2xl shadow-xl text-xs sm:text-sm text-emerald-200 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 no-print max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'plan' && (
          <PlanOverview
            plan={currentPlan}
            onStartWorkout={(day) => setActiveWorkoutDay(day)}
            onOpenExerciseModal={(exercise, dayNumber) =>
              setInspectedExercise({ exercise, dayNumber })
            }
            onOpenAdaptModal={() => setIsAdaptModalOpen(true)}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onSelectGoalPlan={handleSelectGoalPlan}
            onOpenGeneratorForGoal={handleOpenGeneratorForGoal}
          />
        )}

        {currentTab === 'wellness' && (
          <WellnessGuideView
            wellnessGuide={currentPlan.wellnessGuide}
            progressionStrategy={currentPlan.progressionStrategy}
            motivationalMantra={currentPlan.motivationalMantra}
            primaryGoal={currentPlan.profileSnapshot.primaryGoal}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressTrackerView
            logs={workoutLogs}
            onClearLogs={handleClearLogs}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 no-print mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Dumbbell className="w-3 h-3" />
            </div>
            <span className="font-bold text-slate-200">FitBuddy</span>
            <span aria-hidden="true">·</span>
            <span>Intelligent Fitness & Wellness Engineering</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span>Model: gemini-3.8-flash</span>
            <span aria-hidden="true">·</span>
            <span>Structured Biomechanics</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}

      {/* 1. Live Workout Execution Modal */}
      {activeWorkoutDay && (
        <LiveWorkoutModal
          day={activeWorkoutDay}
          planId={currentPlan.id}
          onClose={() => setActiveWorkoutDay(null)}
          onWorkoutCompleted={handleWorkoutCompleted}
        />
      )}

      {/* 2. Exercise Detail & AI Swap Modal */}
      {inspectedExercise && (
        <ExerciseModal
          exercise={inspectedExercise.exercise}
          dayNumber={inspectedExercise.dayNumber}
          userProfile={userProfile}
          onClose={() => setInspectedExercise(null)}
          onSwapExercise={handleSwapExercise}
        />
      )}

      {/* 3. AI Plan Adaptation Modal */}
      {isAdaptModalOpen && (
        <AdaptPlanModal
          currentPlan={currentPlan}
          onClose={() => setIsAdaptModalOpen(false)}
          onPlanAdapted={handlePlanAdapted}
        />
      )}

      {/* 4. Athlete Profile & Plan Generator Modal */}
      {isProfileModalOpen && (
        <ProfileSetupModal
          initialProfile={userProfile}
          targetGoal={generatorInitialGoal}
          onClose={() => {
            setIsProfileModalOpen(false);
            setGeneratorInitialGoal(undefined);
          }}
          onPlanGenerated={handlePlanGenerated}
        />
      )}

      {/* 5. Coach Chat Floating Drawer */}
      <CoachChatDrawer
        isOpen={isCoachDrawerOpen}
        onClose={() => setIsCoachDrawerOpen(false)}
        currentPlan={currentPlan}
        userProfile={userProfile}
      />
    </div>
  );
}
