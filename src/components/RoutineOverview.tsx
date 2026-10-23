import React, { useState } from 'react';
import {
  Play,
  Plus,
  Trash2,
  Clock,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare,
  Tablet,
  Smartphone,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { RoutineDay, RoutineExercise } from '../types/fitness';
import { EXERCISE_CATALOG } from '../data/initialData';

interface RoutineOverviewProps {
  onStartWorkoutTab: () => void;
  onOpenClientModal: () => void;
  onLogoutDni: () => void;
}

export const RoutineOverview: React.FC<RoutineOverviewProps> = ({
  onStartWorkoutTab,
  onOpenClientModal,
  onLogoutDni,
}) => {
  const {
    currentClient,
    routines,
    startWorkout,
    activeWorkout,
    addExerciseToRoutineDay,
    deleteExerciseFromRoutineDay,
    getStudentTodayExerciseStatus,
    deviceMode,
    setDeviceMode,
  } = useWorkout();

  const [expandedDayId, setExpandedDayId] = useState<string>(
    routines[0]?.id || ''
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDayForAdd, setSelectedDayForAdd] = useState<string>('');
  const [selectedCatalogExercise, setSelectedCatalogExercise] = useState<string>(
    EXERCISE_CATALOG[0].id
  );
  const [formSets, setFormSets] = useState('3');
  const [formReps, setFormReps] = useState('8-10');
  const [formWeight, setFormWeight] = useState('50');
  const [formRest, setFormRest] = useState('90');
  const [formNotes, setFormNotes] = useState('');

  const handleStartRoutine = (day: RoutineDay) => {
    startWorkout(day);
    onStartWorkoutTab();
  };

  const openAddExerciseModal = (dayId: string) => {
    setSelectedDayForAdd(dayId);
    setIsAddModalOpen(true);
  };

  const handleSaveNewExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const catalogItem = EXERCISE_CATALOG.find((ex) => ex.id === selectedCatalogExercise);
    if (!catalogItem || !selectedDayForAdd) return;

    const newExercise: RoutineExercise = {
      id: `re-custom-${Date.now()}`,
      exerciseId: catalogItem.id,
      name: catalogItem.name,
      muscleGroup: catalogItem.muscleGroup,
      targetSets: parseInt(formSets, 10) || 3,
      targetReps: formReps || '8-10',
      targetWeightKg: parseFloat(formWeight) || 20,
      restSec: parseInt(formRest, 10) || 90,
      notes: formNotes || catalogItem.tips,
    };

    addExerciseToRoutineDay(selectedDayForAdd, newExercise);
    setIsAddModalOpen(false);
    setFormNotes('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
      {/* Device Mode & Terminal Switcher Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 p-2 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs">
        <div className="flex items-center gap-2">
          {deviceMode === 'tablet_kiosk' ? (
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet Pública de Sala</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Modo Celular Personal</span>
            </div>
          )}
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            {deviceMode === 'tablet_kiosk'
              ? 'Tablet del Gimnasio · Recordá dejar la tablet libre al terminar.'
              : 'Acceso móvil personal con tu DNI.'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setDeviceMode(deviceMode === 'tablet_kiosk' ? 'personal' : 'tablet_kiosk')
            }
            className="text-[11px] text-neutral-400 hover:text-white px-2 py-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Cambiar a {deviceMode === 'tablet_kiosk' ? 'Modo Celular' : 'Modo Tablet'}
          </button>

          {deviceMode === 'tablet_kiosk' ? (
            <button
              onClick={onLogoutDni}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Cierra tu sesión en esta tablet para que el siguiente alumno pueda ingresar su DNI"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Dejar Tablet Libre</span>
            </button>
          ) : (
            <button
              onClick={onLogoutDni}
              className="text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg border border-neutral-800 bg-neutral-950 transition-colors cursor-pointer"
            >
              Salir (DNI)
            </button>
          )}
        </div>
      </div>

      {/* Client Welcome Strip - Compact & Mobile Friendly */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={currentClient.avatar}
              alt={currentClient.name}
              className="w-12 h-12 rounded-full object-cover border border-neutral-700 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  Hola, {currentClient.name.split(' ')[0]}
                </h1>
                <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  DNI: {currentClient.dni}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {currentClient.goal} · Coach: {currentClient.coach}
              </p>
            </div>
          </div>
        </div>

        {/* Coach direct note */}
        {currentClient.notesFromCoach && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-xs text-neutral-300 flex items-start gap-2.5">
            <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-400 block">
                Indicación de tu Profesor para esta semana:
              </span>
              <p className="text-neutral-300 mt-0.5 leading-relaxed">
                {currentClient.notesFromCoach}
              </p>
            </div>
          </div>
        )}

        {/* Big Quick Start CTA if active session */}
        {activeWorkout && (
          <button
            onClick={onStartWorkoutTab}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-neutral-950 animate-ping" />
            <span>Tienes un entrenamiento en curso — Continuar</span>
          </button>
        )}
      </div>

      {/* Routine Days List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-white">
            Tus Ejercicios de la Semana
          </h2>
          <span className="text-xs text-neutral-400">
            {routines.length} días programados
          </span>
        </div>

        {routines.length > 0 ? (
          routines.map((day) => {
            const isExpanded = expandedDayId === day.id;
            const totalSets = day.exercises.reduce((sum, ex) => sum + ex.targetSets, 0);

            return (
              <div
                key={day.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden transition-all"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedDayId(isExpanded ? '' : day.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-neutral-800/30 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-amber-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                        {day.dayName}
                      </span>
                      <span className="text-xs text-neutral-400 truncate">
                        {day.focus}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white truncate">
                      {day.title}
                    </h3>
                    <div className="text-xs text-neutral-400 flex items-center gap-1.5 flex-wrap">
                      <span>{day.exercises.length} ejercicios · {totalSets} series</span>
                      {(() => {
                        const doneCount = day.exercises.filter(
                          (ex) => getStudentTodayExerciseStatus(currentClient.id, ex.name).isFullyCompleted
                        ).length;
                        if (doneCount === 0) return null;
                        return (
                          <>
                            <span className="text-neutral-600">·</span>
                            <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono text-[11px]">
                              <CheckCircle2 className="w-3 h-3" />
                              {doneCount === day.exercises.length
                                ? 'Todo realizado hoy'
                                : `${doneCount}/${day.exercises.length} hechos hoy`}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRoutine(day);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-neutral-950" />
                      <span>Entrenar</span>
                    </button>

                    <div className="text-neutral-500 p-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded exercise details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-neutral-800 bg-neutral-950/40 space-y-3">
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Lista de Ejercicios
                      </span>
                      <button
                        onClick={() => openAddExerciseModal(day.id)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Agregar
                      </button>
                    </div>

                    <div className="space-y-2">
                      {day.exercises.map((exercise, index) => {
                        const status = getStudentTodayExerciseStatus(currentClient.id, exercise.name);

                        return (
                          <div
                            key={exercise.id}
                            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                              status.isFullyCompleted
                                ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                                : status.completedSets > 0
                                ? 'bg-amber-950/15 border-amber-500/30'
                                : 'bg-neutral-900 border-neutral-800/80'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span
                                className={`w-5 h-5 rounded-md text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                  status.isFullyCompleted
                                    ? 'bg-emerald-500 text-neutral-950'
                                    : status.completedSets > 0
                                    ? 'bg-amber-500 text-neutral-950'
                                    : 'bg-neutral-800 text-neutral-400'
                                }`}
                              >
                                {status.isFullyCompleted ? '✓' : index + 1}
                              </span>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-sm font-bold ${status.isFullyCompleted ? 'text-white' : 'text-neutral-100'}`}>
                                    {exercise.name}
                                  </span>
                                  <span className="text-[10px] text-neutral-400">
                                    {exercise.muscleGroup}
                                  </span>

                                  {/* Badge de estado del ejercicio para el día */}
                                  {status.isFullyCompleted ? (
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 font-mono">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      <span>Completado ({status.completedSets} series hechas)</span>
                                    </span>
                                  ) : status.completedSets > 0 ? (
                                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
                                      En progreso ({status.completedSets}/{exercise.targetSets} series)
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                                      Por realizar
                                    </span>
                                  )}
                                </div>

                                {exercise.notes && (
                                  <p className="text-xs text-neutral-400 mt-0.5">
                                    💡 {exercise.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 font-mono tabular-nums text-xs text-neutral-300 pl-7 sm:pl-0">
                              <span>{exercise.targetSets} series</span>
                              <span>·</span>
                              <span>{exercise.targetReps} reps</span>
                              <span>·</span>
                              <span className="text-amber-400 font-bold">{exercise.targetWeightKg} kg</span>
                              <span>·</span>
                              <span>{exercise.restSec}s desc.</span>

                              <button
                                onClick={() => deleteExerciseFromRoutineDay(day.id, exercise.id)}
                                className="text-neutral-500 hover:text-red-400 p-1 transition-colors ml-1 cursor-pointer"
                                title="Quitar ejercicio de la rutina"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handleStartRoutine(day)}
                      className="w-full py-3 mt-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-neutral-950" />
                      Comenzar este entrenamiento ahora
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-2xl">
            Aún no tienes ejercicios asignados. Tu entrenador los cargará en breve desde su panel.
          </div>
        )}
      </div>

      {/* Modal to add an exercise into a Routine Day */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              Agregar Ejercicio a la Rutina
            </h3>

            <form onSubmit={handleSaveNewExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Seleccionar Ejercicio
                </label>
                <select
                  value={selectedCatalogExercise}
                  onChange={(e) => setSelectedCatalogExercise(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {EXERCISE_CATALOG.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.muscleGroup} - {item.equipment})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Series
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formSets ?? '3'}
                    onChange={(e) => setFormSets(e.target.value ?? '3')}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Reps
                  </label>
                  <input
                    type="text"
                    value={formReps ?? '8-10'}
                    onChange={(e) => setFormReps(e.target.value ?? '')}
                    placeholder="ej. 8-10 o 12"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Peso Objetivo (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formWeight ?? '50'}
                    onChange={(e) => setFormWeight(e.target.value ?? '50')}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Descanso (segundos)
                  </label>
                  <input
                    type="number"
                    step="15"
                    value={formRest ?? '90'}
                    onChange={(e) => setFormRest(e.target.value ?? '90')}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Notas / Consejos
                </label>
                <textarea
                  rows={2}
                  value={formNotes ?? ''}
                  onChange={(e) => setFormNotes(e.target.value ?? '')}
                  placeholder="ej. Bajar controlado, apretar escápulas..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
