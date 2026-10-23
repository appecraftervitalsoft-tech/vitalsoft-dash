import React, { useState } from 'react';
import {
  Check,
  Plus,
  Minus,
  Trash2,
  Trophy,
  Flame,
  Clock,
  Dumbbell,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Tablet,
  Smartphone,
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { formatTime, calculate1RM } from '../utils/calculator';
import { EXERCISE_CATALOG } from '../data/initialData';
import { ExerciseDefinition } from '../types/fitness';

interface ActiveWorkoutViewProps {
  onWorkoutFinished: () => void;
  onGoToRoutineTab: () => void;
}

export const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({
  onWorkoutFinished,
  onGoToRoutineTab,
}) => {
  const {
    activeWorkout,
    workoutDurationSec,
    updateLoggedSet,
    toggleCompleteSet,
    addSetToActiveExercise,
    removeSetFromActiveExercise,
    addExerciseToLiveWorkout,
    finishWorkout,
    cancelWorkout,
    startRestTimer,
    deviceMode,
  } = useWorkout();

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAddExerciseCatalog, setShowAddExerciseCatalog] = useState(false);

  const [feeling, setFeeling] = useState<'fuerte' | 'excelente' | 'normal' | 'fatigado'>('fuerte');
  const [finishNotes, setFinishNotes] = useState('');

  if (!activeWorkout) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 text-amber-500 flex items-center justify-center mx-auto">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No hay entrenamiento en curso</h2>
        <p className="text-sm text-neutral-400">
          Selecciona una rutina de tu plan semanal para comenzar a registrar tus series y repeticiones en tiempo real.
        </p>
        <button
          onClick={onGoToRoutineTab}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Play className="w-4 h-4 fill-neutral-950" />
          Ir a Mi Rutina y Empezar
        </button>
      </div>
    );
  }

  // Calculate live session statistics
  let totalLiveVolume = 0;
  let totalSetsCompleted = 0;
  let totalSetsPlanned = 0;
  let prsInSession = 0;

  activeWorkout.exercises.forEach((ex) => {
    totalSetsPlanned += ex.sets.length;
    ex.sets.forEach((set) => {
      if (set.completed) {
        totalSetsCompleted++;
        totalLiveVolume += set.actualWeightKg * set.actualReps;
        if (set.isPR) prsInSession++;
      }
    });
  });

  const completionPercent = totalSetsPlanned > 0 ? Math.round((totalSetsCompleted / totalSetsPlanned) * 100) : 0;

  const handleConfirmFinish = () => {
    finishWorkout(feeling, finishNotes);
    setShowFinishModal(false);
    onWorkoutFinished();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Real-Time Workout Header Strip */}
      <div className="sticky top-16 z-30 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-2xl p-4 shadow-xl shadow-black/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Sesión en Vivo
              </span>
              <span className="text-neutral-600">·</span>
              <span className="font-mono tabular-nums text-sm font-bold text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                ⏱ {formatTime(workoutDurationSec)}
              </span>
              <span className="text-neutral-600">·</span>
              {deviceMode === 'tablet_kiosk' ? (
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                  <Tablet className="w-3 h-3" /> Tablet de Sala (Transmitiendo a Profesores)
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> Celular (Transmitiendo a Profesores)
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-wide uppercase truncate max-w-xl">
              {activeWorkout.routineTitle}
            </h1>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-4 text-xs font-mono tabular-nums bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl">
              <div>
                <span className="text-neutral-500 text-[10px] block">SERIES</span>
                <span className="text-white font-bold">{totalSetsCompleted} / {totalSetsPlanned}</span>
              </div>
              <div className="h-6 w-px bg-neutral-800" />
              <div>
                <span className="text-neutral-500 text-[10px] block">VOLUMEN</span>
                <span className="text-amber-400 font-bold">{totalLiveVolume} kg</span>
              </div>
              {prsInSession > 0 && (
                <>
                  <div className="h-6 w-px bg-neutral-800" />
                  <div className="text-amber-300 font-bold flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{prsInSession} PR</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowCancelModal(true)}
              className="px-3 py-2 rounded-xl border border-neutral-800 hover:border-red-800 text-neutral-400 hover:text-red-400 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={() => setShowFinishModal(true)}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Finalizar Sesión</span>
            </button>
          </div>
        </div>

        {/* Micro progress bar */}
        <div className="w-full bg-neutral-900 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Exercises List in Real-Time */}
      <div className="space-y-6">
        {activeWorkout.exercises.map((exercise, exIdx) => {
          return (
            <div
              key={`${exercise.exerciseId}-${exIdx}`}
              className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg transition-all"
            >
              {/* Exercise Header */}
              <div className="p-4 sm:p-5 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      EJERCICIO {exIdx + 1}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {exercise.muscleGroup}
                    </span>
                    <span className="text-neutral-600">·</span>
                    <button
                      onClick={() => startRestTimer(exercise.restSec, exercise.name)}
                      className="text-xs text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                      title="Iniciar descanso manual"
                    >
                      <Clock className="w-3 h-3" /> Descanso: {exercise.restSec}s
                    </button>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {exercise.name}
                  </h3>

                  {exercise.previousBest && (
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                      <Trophy className="w-3 h-3 text-amber-500" />
                      <span>
                        Récord Previo: <strong className="text-neutral-200">{exercise.previousBest.weightKg} kg × {exercise.previousBest.reps} reps</strong> (1RM est: {exercise.previousBest.estimated1RM} kg)
                      </span>
                    </p>
                  )}
                </div>

                {exercise.notes && (
                  <div className="text-xs text-neutral-400 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80 max-w-sm">
                    <span className="font-semibold text-neutral-300 block">Indicación del Coach:</span>
                    {exercise.notes}
                  </div>
                )}
              </div>

              {/* Set Logging Rows */}
              <div className="p-3 sm:p-5 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-800 pb-2">
                      <th className="py-2 px-2 text-center w-12">SET</th>
                      <th className="py-2 px-2 w-28">ANTERIOR</th>
                      <th className="py-2 px-2 min-w-[140px]">PESO (KG)</th>
                      <th className="py-2 px-2 min-w-[120px]">REPS</th>
                      <th className="py-2 px-2 w-20">RPE</th>
                      <th className="py-2 px-2 text-center w-16">LISTO</th>
                      <th className="py-2 px-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {exercise.sets.map((set, setIdx) => {
                      const estimated1RM = calculate1RM(set.actualWeightKg, set.actualReps);

                      return (
                        <tr
                          key={set.id}
                          className={`transition-colors ${
                            set.completed ? 'bg-emerald-950/10' : 'hover:bg-neutral-800/20'
                          }`}
                        >
                          {/* Set Number */}
                          <td className="py-3 px-2 text-center">
                            <span
                              className={`w-7 h-7 rounded-lg font-mono font-bold text-xs inline-flex items-center justify-center ${
                                set.completed
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-neutral-800 text-neutral-300'
                              }`}
                            >
                              {set.setNumber}
                            </span>
                          </td>

                          {/* Previous Reference */}
                          <td className="py-3 px-2 font-mono tabular-nums text-neutral-400 text-xs">
                            {set.targetWeightKg} kg × {set.targetReps}
                          </td>

                          {/* Weight (kg) with quick steppers */}
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  updateLoggedSet(exIdx, setIdx, {
                                    actualWeightKg: Math.max(0, set.actualWeightKg - 2.5),
                                  })
                                }
                                className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-xs transition-colors shrink-0"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                step="0.5"
                                value={set.actualWeightKg ?? 0}
                                onChange={(e) =>
                                  updateLoggedSet(exIdx, setIdx, {
                                    actualWeightKg: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-16 bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white text-sm focus:outline-none focus:border-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateLoggedSet(exIdx, setIdx, {
                                    actualWeightKg: set.actualWeightKg + 2.5,
                                  })
                                }
                                className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-xs transition-colors shrink-0"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateLoggedSet(exIdx, setIdx, {
                                    actualWeightKg: set.actualWeightKg + 5,
                                  })
                                }
                                className="text-[10px] font-mono px-1.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-amber-300 shrink-0 hidden sm:block"
                              >
                                +5
                              </button>
                            </div>
                          </td>

                          {/* Reps with steppers */}
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  updateLoggedSet(exIdx, setIdx, {
                                    actualReps: Math.max(1, set.actualReps - 1),
                                  })
                                }
                                className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-xs transition-colors shrink-0"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={set.actualReps ?? 1}
                                onChange={(e) =>
                                  updateLoggedSet(exIdx, setIdx, {
                                    actualReps: parseInt(e.target.value, 10) || 1,
                                  })
                                }
                                className="w-14 bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white text-sm focus:outline-none focus:border-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateLoggedSet(exIdx, setIdx, {
                                    actualReps: set.actualReps + 1,
                                  })
                                }
                                className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-xs transition-colors shrink-0"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* RPE Selector */}
                          <td className="py-3 px-2">
                            <select
                              value={set.rpe || 8}
                              onChange={(e) =>
                                updateLoggedSet(exIdx, setIdx, {
                                  rpe: parseFloat(e.target.value),
                                })
                              }
                              className="bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-neutral-300 font-mono focus:outline-none"
                            >
                              <option value="6">RPE 6</option>
                              <option value="7">RPE 7</option>
                              <option value="7.5">RPE 7.5</option>
                              <option value="8">RPE 8</option>
                              <option value="8.5">RPE 8.5</option>
                              <option value="9">RPE 9</option>
                              <option value="9.5">RPE 9.5</option>
                              <option value="10">RPE 10 (Fallo)</option>
                            </select>
                          </td>

                          {/* Check / Complete Button */}
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => toggleCompleteSet(exIdx, setIdx)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                set.completed
                                  ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/30'
                                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white border border-neutral-700'
                              }`}
                              title={set.completed ? 'Marcar incompleto' : 'Completar serie'}
                            >
                              <Check className={`w-5 h-5 ${set.completed ? 'stroke-[3]' : ''}`} />
                            </button>
                          </td>

                          {/* Delete Set */}
                          <td className="py-3 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeSetFromActiveExercise(exIdx, setIdx)}
                              className="text-neutral-500 hover:text-red-400 p-1 rounded transition-colors"
                              title="Eliminar serie"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Add set button row */}
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-800/80">
                  <button
                    type="button"
                    onClick={() => addSetToActiveExercise(exIdx)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Agregar Serie</span>
                  </button>

                  <span className="text-[11px] text-neutral-500">
                    Marca la casilla para guardar en vivo y activar el descanso automático
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Button to add extra exercise to this live session */}
      <div className="pt-2">
        <button
          onClick={() => setShowAddExerciseCatalog(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900/50 text-neutral-400 hover:text-amber-400 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Ejercicio Adicional a la Sesión</span>
        </button>
      </div>

      {/* Modal: Catalog Selector for adding to live session */}
      {showAddExerciseCatalog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">
                Seleccionar Ejercicio para Agregar
              </h3>
              <button
                onClick={() => setShowAddExerciseCatalog(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-neutral-800/60 my-4 pr-1">
              {EXERCISE_CATALOG.map((ex) => (
                <div
                  key={ex.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-neutral-800/30 px-2 rounded-xl"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{ex.name}</h4>
                    <p className="text-xs text-neutral-400">
                      {ex.muscleGroup} · {ex.equipment} · Descanso: {ex.defaultRestSec}s
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      addExerciseToLiveWorkout(ex);
                      setShowAddExerciseCatalog(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Finish Session */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-display font-extrabold text-white uppercase tracking-wide">
                ¡Gran Entrenamiento!
              </h3>
              <p className="text-xs text-neutral-400">
                Registra tus sensaciones para guardar tu sesión en el historial y actualizar tus récords personales.
              </p>
            </div>

            {/* Quick summary stats */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-center font-mono tabular-nums">
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase">Tiempo</span>
                <span className="text-base font-bold text-white">{formatTime(workoutDurationSec)}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase">Volumen</span>
                <span className="text-base font-bold text-amber-400">{totalLiveVolume} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase">Series</span>
                <span className="text-base font-bold text-emerald-400">{totalSetsCompleted}</span>
              </div>
            </div>

            {/* Feeling Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                ¿Cómo te sentiste físicamente hoy?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'fuerte', label: '🔥 Fuerte' },
                  { id: 'excelente', label: '⚡ Excelente' },
                  { id: 'normal', label: '👌 Normal' },
                  { id: 'fatigado', label: '🥱 Fatigado' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFeeling(item.id as typeof feeling)}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition-all ${
                      feeling === item.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300 block">
                Notas del Atleta / Sensaciones para el Coach:
              </label>
              <textarea
                rows={2}
                value={finishNotes ?? ''}
                onChange={(e) => setFinishNotes(e.target.value ?? '')}
                placeholder="ej. Mejor control en bajada de sentadilla, hombro sin molestias..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFinishModal(false)}
                className="w-1/2 py-3 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition-colors"
              >
                Volver al Registro
              </button>
              <button
                onClick={handleConfirmFinish}
                className="w-1/2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                Guardar y Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Cancel Session */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">¿Descartar este entrenamiento?</h3>
            <p className="text-xs text-neutral-400">
              Se perderán las series registradas en esta sesión actual y no se guardará en el historial.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
              >
                Continuar entrenando
              </button>
              <button
                onClick={() => {
                  cancelWorkout();
                  setShowCancelModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Descartar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
