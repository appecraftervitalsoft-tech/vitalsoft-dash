import React from 'react';
import { Trophy, CheckCircle, Clock, Flame, Dumbbell, ArrowRight } from 'lucide-react';
import { CompletedWorkout } from '../types/fitness';

interface WorkoutSummaryModalProps {
  workout: CompletedWorkout | null;
  onClose: () => void;
  onViewProgress: () => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  workout,
  onClose,
  onViewProgress,
}) => {
  if (!workout) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
            ¡Entrenamiento Registrado con Éxito!
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-wide uppercase">
            {workout.routineTitle}
          </h2>
          <p className="text-xs text-neutral-400">
            Tu progreso se ha guardado en el historial y tus estadísticas se han actualizado.
          </p>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-center font-mono tabular-nums">
          <div>
            <span className="text-[10px] text-neutral-500 block uppercase font-sans">Duración</span>
            <span className="text-lg sm:text-xl font-bold text-white">
              {workout.durationMinutes} min
            </span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block uppercase font-sans">Volumen</span>
            <span className="text-lg sm:text-xl font-bold text-amber-400">
              {workout.totalVolumeKg} kg
            </span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block uppercase font-sans">Series</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-400">
              {workout.totalSetsCompleted}
            </span>
          </div>
        </div>

        {/* PR highlight if any */}
        {workout.prsAchieved > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-amber-300 block">
                ¡{workout.prsAchieved} Nuevo Récord Personal alcanzado hoy!
              </span>
              <span className="text-neutral-400">
                Tus marcas máximas se han actualizado en el cuadro de honor.
              </span>
            </div>
          </div>
        )}

        {/* Exercises completed summary */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
            Ejercicios Registrados:
          </span>
          {workout.exercises.map((ex, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80 flex items-center justify-between text-xs"
            >
              <span className="font-semibold text-neutral-200">{ex.name}</span>
              <span className="font-mono text-neutral-400 text-[11px]">
                {ex.sets.length} series completadas
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onViewProgress();
            }}
            className="w-full sm:w-1/2 py-3 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Ver Gráfica de Progreso</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-1/2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all active:scale-95"
          >
            Aceptar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
