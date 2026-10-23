import React, { useState } from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import { Navbar } from './components/Navbar';
import { RoutineOverview } from './components/RoutineOverview';
import { ActiveWorkoutView } from './components/ActiveWorkoutView';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { GymTools } from './components/GymTools';
import { CoachDashboard } from './components/CoachDashboard';
import { DniLogin } from './components/DniLogin';
import { RestTimerFloating } from './components/RestTimerFloating';
import { WorkoutSummaryModal } from './components/WorkoutSummaryModal';
import { ClientProfileModal } from './components/ClientProfileModal';
import { Dumbbell, Activity, BarChart2, Wrench, ShieldCheck } from 'lucide-react';
import { formatTime } from './utils/calculator';

function GymAppContent() {
  const [activeTab, setActiveTab] = useState<'routine' | 'active' | 'progress' | 'tools' | 'coach'>('routine');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const {
    currentUserRole,
    loginAsCoach,
    switchToClientRole,
    logout,
    activeWorkout,
    workoutDurationSec,
    lastCompletedWorkout,
    clearLastCompletedWorkout,
  } = useWorkout();

  // If no user is logged in, show clean DNI login
  if (!currentUserRole) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-neutral-950">
        <DniLogin
          onSuccessLogin={() => setActiveTab('routine')}
          onEnterAsCoach={() => {
            setActiveTab('coach');
          }}
        />
      </div>
    );
  }

  // If Coach role is active
  if (currentUserRole === 'coach') {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenClientModal={() => setIsClientModalOpen(true)}
          onLogout={logout}
        />
        <main className="flex-1 pb-12">
          <CoachDashboard
            onBackToClientView={(studentId?: string) => {
              switchToClientRole(studentId);
              setActiveTab('routine');
            }}
          />
        </main>
      </div>
    );
  }

  // Client mode
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans pb-20 sm:pb-8 selection:bg-amber-500 selection:text-neutral-950">
      {/* Top Bar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenClientModal={() => setIsClientModalOpen(true)}
        onLogout={logout}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'routine' && (
          <RoutineOverview
            onStartWorkoutTab={() => setActiveTab('active')}
            onOpenClientModal={() => setIsClientModalOpen(true)}
            onLogoutDni={logout}
          />
        )}

        {activeTab === 'active' && (
          <ActiveWorkoutView
            onWorkoutFinished={() => setActiveTab('progress')}
            onGoToRoutineTab={() => setActiveTab('routine')}
          />
        )}

        {activeTab === 'progress' && <ProgressAnalytics />}

        {activeTab === 'tools' && <GymTools />}
      </main>

      {/* Floating Rest Countdown Timer */}
      <RestTimerFloating />

      {/* Workout Post-Completion Summary Modal */}
      <WorkoutSummaryModal
        workout={lastCompletedWorkout}
        onClose={clearLastCompletedWorkout}
        onViewProgress={() => setActiveTab('progress')}
      />

      {/* Client Profile / Switcher Modal */}
      <ClientProfileModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
      />

      {/* Mobile Fixed Bottom Tab Bar (Thumb Zone Navigation) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 grid grid-cols-4 items-center h-16 px-1">
        <button
          onClick={() => setActiveTab('routine')}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
            activeTab === 'routine' ? 'text-amber-400 font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Rutina</span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`flex flex-col items-center justify-center h-full relative transition-colors cursor-pointer ${
            activeTab === 'active'
              ? 'text-emerald-400 font-semibold'
              : activeWorkout
              ? 'text-emerald-400'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          {activeWorkout && (
            <span className="absolute top-2 right-5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
          <Activity className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">
            {activeWorkout ? formatTime(workoutDurationSec) : 'En Vivo'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
            activeTab === 'progress' ? 'text-amber-400 font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Progreso</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
            activeTab === 'tools' ? 'text-amber-400 font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Discos & 1RM</span>
        </button>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <WorkoutProvider>
      <GymAppContent />
    </WorkoutProvider>
  );
}
