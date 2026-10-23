import React, { useState } from 'react';
import { Timer, Plus, Minus, X, Bell } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { formatTime } from '../utils/calculator';

export const RestTimerFloating: React.FC = () => {
  const { restTimer, stopRestTimer, addRestTimerSeconds } = useWorkout();
  const [minimized, setMinimized] = useState(false);

  if (!restTimer.active) return null;

  const percentage = restTimer.totalSec > 0
    ? Math.max(0, Math.min(100, (restTimer.remainingSec / restTimer.totalSec) * 100))
    : 0;

  if (minimized) {
    return (
      <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 animate-bounce">
        <button
          onClick={() => setMinimized(false)}
          className="px-4 py-2.5 bg-amber-500 text-neutral-950 font-bold rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-2 hover:bg-amber-400 transition-transform active:scale-95"
        >
          <Timer className="w-4 h-4 animate-spin" />
          <span className="font-mono tabular-nums text-sm">
            {formatTime(restTimer.remainingSec)}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 w-[92vw] max-w-sm">
      <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-2xl p-4 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Timer className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-200">
                Tiempo de Descanso
              </p>
              {restTimer.exerciseName && (
                <p className="text-[11px] text-neutral-400 truncate max-w-[170px]">
                  {restTimer.exerciseName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(true)}
              className="text-xs text-neutral-400 hover:text-neutral-200 px-2 py-1 rounded transition-colors"
            >
              Minimizar
            </button>
            <button
              onClick={stopRestTimer}
              className="w-7 h-7 rounded-lg text-neutral-400 hover:text-red-400 flex items-center justify-center hover:bg-neutral-800 transition-colors"
              title="Cerrar temporizador"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Countdown */}
        <div className="py-2 text-center">
          <div className="font-display font-extrabold text-5xl tracking-tight text-amber-400 font-mono tabular-nums">
            {formatTime(restTimer.remainingSec)}
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => addRestTimerSeconds(-15)}
              disabled={restTimer.remainingSec <= 15}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-40 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Minus className="w-3 h-3" /> 15s
            </button>
            <button
              onClick={() => addRestTimerSeconds(30)}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> 30s
            </button>
          </div>

          <button
            onClick={stopRestTimer}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition-colors"
          >
            Saltar Descanso
          </button>
        </div>
      </div>
    </div>
  );
};
