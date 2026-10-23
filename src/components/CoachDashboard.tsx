import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Dumbbell,
  CheckCircle,
  Calendar,
  Flame,
  ArrowLeft,
  ChevronRight,
  Target,
  Sparkles,
  Activity,
  Send,
  Tablet,
  Smartphone,
  Trophy,
  Zap,
  Clock,
  MessageSquare,
  Radio,
  Edit3,
  Cloud,
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { ClientProfile, RoutineDay, RoutineExercise } from '../types/fitness';
import { EXERCISE_CATALOG } from '../data/initialData';
import { RegisterModal } from './RegisterModal';

interface CoachDashboardProps {
  onBackToClientView: (studentId?: string) => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({
  onBackToClientView,
}) => {
  const {
    clients,
    allRoutinesMap,
    completedWorkouts,
    addNewClient,
    deleteClient,
    addDayToClientRoutine,
    deleteDayFromClientRoutine,
    addExerciseToSpecificClient,
    deleteExerciseForSpecificClient,
    selectClient,
    activeFloorStudents,
    activeWorkoutsMap,
    coaches,
    currentCoach,
    liveFloorActivities,
    sendCoachFeedbackToStudent,
    simulateLiveFloorActivity,
    gymName,
    updateGymName,
    isFirebaseSyncing,
  } = useWorkout();

  // Gym Name setting state
  const [isGymNameModalOpen, setIsGymNameModalOpen] = useState(false);
  const [tempGymName, setTempGymName] = useState(gymName);

  // Dashboard top tabs: 'routines' (Manage Student Routines) vs 'monitor' (Active Students in Gym)
  const [dashboardTab, setDashboardTab] = useState<'routines' | 'monitor'>('routines');

  // Search filter for students
  const [studentSearch, setStudentSearch] = useState('');

  // Active student selected for routine management
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    clients[0]?.id || ''
  );

  // Register Modal state (for Students and Coaches)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerInitialTab, setRegisterInitialTab] = useState<'student' | 'coach'>('student');

  // New Student modal legacy compatibility
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [newDni, setNewDni] = useState('');
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('Hipertrofia & Fuerza');
  const [newLevel, setNewLevel] = useState<ClientProfile['level']>('Intermedio');
  const [newWeight, setNewWeight] = useState('75');
  const [newHeight, setNewHeight] = useState('175');
  const [newNotes, setNewNotes] = useState('');

  // Add Day modal
  const [isAddDayModalOpen, setIsAddDayModalOpen] = useState(false);
  const [dayNameInput, setDayNameInput] = useState('Lunes');
  const [dayTitleInput, setDayTitleInput] = useState('Día 1: Empuje');
  const [dayFocusInput, setDayFocusInput] = useState('Pecho & Hombros');

  // Add Exercise to Student Day modal
  const [isAddExModalOpen, setIsAddExModalOpen] = useState(false);
  const [targetDayId, setTargetDayId] = useState('');
  const [selectedCatalogId, setSelectedCatalogId] = useState(EXERCISE_CATALOG[0].id);
  const [exSets, setExSets] = useState('4');
  const [exReps, setExReps] = useState('8-10');
  const [exWeight, setExWeight] = useState('60');
  const [exRest, setExRest] = useState('90');
  const [exCoachNotes, setExCoachNotes] = useState('');

  // Live Coach message/feedback modal
  const [feedbackStudent, setFeedbackStudent] = useState<ClientProfile | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackSentToast, setFeedbackSentToast] = useState(false);

  const currentStudent = clients.find((c) => c.id === selectedStudentId) || clients[0];
  const studentRoutines: RoutineDay[] = currentStudent
    ? allRoutinesMap[currentStudent.id] || []
    : [];

  const studentCompletedSessions = completedWorkouts.filter(
    (w) => w.clientId === currentStudent?.id
  );

  // Handle Create Student
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const dniClean = (newDni ?? '').trim();
    const nameClean = (newName ?? '').trim();
    if (!dniClean || !nameClean) return;

    const created = addNewClient({
      dni: dniClean,
      name: nameClean,
      goal: (newGoal ?? '').trim() || 'Fuerza',
      level: newLevel,
      bodyWeightKg: parseFloat(newWeight) || 70,
      heightCm: parseFloat(newHeight) || 170,
      notesFromCoach: (newNotes ?? '').trim(),
    });

    setSelectedStudentId(created.id);
    setIsNewStudentModalOpen(false);
    setNewDni('');
    setNewName('');
    setNewNotes('');
    setDashboardTab('routines');
  };

  // Handle Add Day
  const handleAddDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent || !dayNameInput.trim() || !dayTitleInput.trim()) return;

    addDayToClientRoutine(
      currentStudent.id,
      dayNameInput.trim(),
      dayTitleInput.trim(),
      dayFocusInput.trim()
    );
    setIsAddDayModalOpen(false);
  };

  // Handle Add Exercise to student day
  const handleAddExerciseToStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const catalogItem = EXERCISE_CATALOG.find((ex) => ex.id === selectedCatalogId);
    if (!catalogItem || !currentStudent || !targetDayId) return;

    const newExercise: RoutineExercise = {
      id: `re-coach-${Date.now()}`,
      exerciseId: catalogItem.id,
      name: catalogItem.name,
      muscleGroup: catalogItem.muscleGroup,
      targetSets: parseInt(exSets, 10) || 3,
      targetReps: exReps || '8-10',
      targetWeightKg: parseFloat(exWeight) || 20,
      restSec: parseInt(exRest, 10) || 90,
      notes: exCoachNotes || catalogItem.tips,
    };

    addExerciseToSpecificClient(currentStudent.id, targetDayId, newExercise);
    setIsAddExModalOpen(false);
    setExCoachNotes('');
  };

  const handleTestAsStudent = (student: ClientProfile) => {
    selectClient(student.id);
    onBackToClientView();
  };

  const handleSendLiveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackStudent || !feedbackNote.trim()) return;
    sendCoachFeedbackToStudent(feedbackStudent.id, feedbackNote.trim());
    setFeedbackSentToast(true);
    setTimeout(() => {
      setFeedbackSentToast(false);
      setFeedbackStudent(null);
      setFeedbackNote('');
    }, 1500);
  };

  // Calculations for live monitor header
  const totalFloorVolume = activeFloorStudents.reduce(
    (sum, s) => sum + (s.currentLiveVolumeKg || 0),
    0
  );
  const totalPRsToday = liveFloorActivities.filter((a) => a.isPR).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Coach Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
              Sector Profesores & Entrenadores
            </span>
            <span className="text-neutral-600">·</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
              <Cloud className="w-3 h-3 text-emerald-400" />
              <span>Firebase Conectado</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setTempGymName(gymName);
                setIsGymNameModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition-colors cursor-pointer"
              title="Cambiar nombre del gimnasio"
            >
              <Edit3 className="w-3 h-3 text-amber-400" />
              <span>Gym: {gymName ? `${gymName} Gym Tracker` : 'Personalizar nombre'}</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-wide uppercase">
            Sala de Musculación & Rutinas
          </h1>
          <p className="text-xs text-neutral-400 max-w-xl">
            Sincronización en tiempo real con Firebase: los alumnos registran sus ejercicios desde sus celulares o las tablets con su DNI y se sincronizan al instante en la sala.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setRegisterInitialTab('student');
              setIsRegisterModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Alumno / Profesor</span>
          </button>

          <button
            onClick={() => onBackToClientView(selectedStudentId)}
            className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            title="Ver la interfaz del alumno seleccionado"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Vista Alumno</span>
          </button>
        </div>
      </div>

      {/* Main Switcher: Gestión de Rutinas vs Alumnos en Sala */}
      <div className="flex items-center gap-2 p-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl w-full sm:w-fit">
        <button
          onClick={() => setDashboardTab('routines')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            dashboardTab === 'routines'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Gestión & Carga de Rutinas</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              dashboardTab === 'routines'
                ? 'bg-neutral-950 text-amber-400'
                : 'bg-neutral-800 text-neutral-300'
            }`}
          >
            {clients.length} alumnos
          </span>
        </button>

        <button
          onClick={() => setDashboardTab('monitor')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            dashboardTab === 'monitor'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Alumnos en Sala Ahora</span>
          {activeFloorStudents.length > 0 ? (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                dashboardTab === 'monitor'
                  ? 'bg-neutral-950 text-amber-400'
                  : 'bg-emerald-500 text-neutral-950'
              }`}
            >
              {activeFloorStudents.length} activos
            </span>
          ) : (
            <span className="text-[10px] text-neutral-500 font-mono">0</span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALUMNOS EN SALA (MONITOR REAL) */}
      {/* ========================================================================= */}
      {dashboardTab === 'monitor' && (
        <div className="space-y-6">
          {/* Key Floor Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Alumnos en Sala Ahora
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                  {activeFloorStudents.length}
                </span>
                <span className="text-xs text-neutral-400">alumnos entrenando</span>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                Alumnos Totales
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-amber-400">
                  {clients.length}
                </span>
                <span className="text-xs text-neutral-400">registrados</span>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                Volumen Levantado en Sala
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                  {totalFloorVolume.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-400">kg</span>
              </div>
            </div>
          </div>

          {/* Active Students in Floor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>Alumnos con Entrenamiento en Curso ({activeFloorStudents.length})</span>
              </h2>
            </div>

            {activeFloorStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeFloorStudents.map((student) => {
                  const percent =
                    student.totalSetsPlanned > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (student.setsCompleted / student.totalSetsPlanned) * 100
                          )
                        )
                      : 0;

                  return (
                    <div
                      key={student.clientId}
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md hover:border-neutral-700 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={student.clientAvatar}
                            alt={student.clientName}
                            className="w-11 h-11 rounded-full object-cover border border-neutral-700 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                                {student.clientName}
                              </h3>
                              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                DNI: {student.clientDni}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400 truncate">
                              {student.routineTitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              const found = clients.find((c) => c.id === student.clientId);
                              if (found) {
                                setFeedbackStudent(found);
                                setFeedbackNote(found.notesFromCoach || '');
                              }
                            }}
                            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-amber-400 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title="Enviar indicación"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Indicación</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedStudentId(student.clientId);
                              setDashboardTab('routines');
                            }}
                            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Ver rutina y cargar ejercicios"
                          >
                            <span>Ver Rutina</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar & Current Activity */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-400">
                            Progreso de series:{' '}
                            <strong className="text-white">
                              {student.setsCompleted} de {student.totalSetsPlanned}
                            </strong>
                          </span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {percent}%
                          </span>
                        </div>
                        <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                          <div
                            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Exercise details */}
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="bg-neutral-950 p-2 rounded-xl border border-neutral-800/80">
                          <span className="text-[10px] text-neutral-500 block">
                            Último Ejercicio
                          </span>
                          <span className="font-semibold text-neutral-200 truncate block">
                            {student.lastExerciseName || 'Iniciando sesión...'}
                          </span>
                        </div>

                        <div className="bg-neutral-950 p-2 rounded-xl border border-neutral-800/80">
                          <span className="text-[10px] text-neutral-500 block">
                            Volumen Levantado
                          </span>
                          <span className="font-mono font-bold text-amber-400 block">
                            {student.currentLiveVolumeKg.toLocaleString()} kg
                          </span>
                        </div>
                      </div>

                      {/* Series tildadas en vivo por el alumno */}
                      {activeWorkoutsMap[student.clientId]?.exercises && (
                        <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            <span>Series Marcadas por el Alumno:</span>
                            <span className="text-emerald-400 font-mono">
                              {student.setsCompleted} de {student.totalSetsPlanned} listas
                            </span>
                          </div>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {activeWorkoutsMap[student.clientId].exercises.map((ex, exI) => (
                              <div
                                key={exI}
                                className="bg-neutral-950 p-2 rounded-xl text-xs space-y-1 border border-neutral-800/60"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-neutral-200 text-xs truncate">
                                    {ex.name}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 font-mono">
                                    {ex.sets.filter((s) => s.completed).length}/{ex.sets.length}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {ex.sets.map((s, sI) => (
                                    <span
                                      key={sI}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                                        s.completed
                                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                          : 'bg-neutral-800 text-neutral-500 border border-neutral-700/40'
                                      }`}
                                      title={s.completed ? 'Serie tildada como completada' : 'Serie pendiente'}
                                    >
                                      <span>
                                        S{s.setNumber}: {s.actualWeightKg}k×{s.actualReps}
                                      </span>
                                      {s.completed ? '✓' : '○'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-500 mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  No hay alumnos entrenando en este momento
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Cuando un alumno ingrese con su DNI desde su teléfono o desde una tablet del gimnasio y comience su rutina, figurará aquí con su progreso.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ROUTINE MANAGEMENT & ASSIGNMENT (CARGA DE EJERCICIOS POR ALUMNO) */}
      {/* ========================================================================= */}
      {dashboardTab === 'routines' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Alumnos List (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Alumnos del Gimnasio ({clients.length})</span>
              </h2>
              <span className="text-[11px] text-neutral-500">Toca para gestionar</span>
            </div>

            {/* Search Filter */}
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
            />

            <div className="space-y-2.5">
              {clients
                .filter((student) => {
                  if (!studentSearch.trim()) return true;
                  const term = studentSearch.toLowerCase().trim();
                  return (
                    student.name.toLowerCase().includes(term) ||
                    (student.dni && student.dni.includes(term))
                  );
                })
                .map((student) => {
                  const isSelected = student.id === currentStudent?.id;
                  const daysCount = (allRoutinesMap[student.id] || []).length;
                  const isTrainingNow = activeFloorStudents.some(
                    (s) => s.clientId === student.id
                  );

                  return (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/5'
                          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover border border-neutral-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-sm font-bold truncate ${
                                isSelected ? 'text-amber-400' : 'text-white'
                              }`}
                            >
                              {student.name}
                            </span>
                            {isTrainingNow && (
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1 py-0.2 rounded">
                                En sala
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                            <span className="text-neutral-300 font-semibold">
                              DNI: {student.dni}
                            </span>
                            <span>·</span>
                            <span>{student.level}</span>
                          </div>
                          <span className="text-[10px] text-neutral-500 truncate block">
                            {daysCount} días cargados · {student.goal}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <ChevronRight
                          className={`w-4 h-4 ${
                            isSelected ? 'text-amber-400' : 'text-neutral-600'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>


          {/* Right Column: Selected Student Routine Editor (8 cols) */}
          {currentStudent ? (
            <div className="lg:col-span-8 space-y-6">
              {/* Student summary card */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentStudent.avatar}
                      alt={currentStudent.name}
                      className="w-12 h-12 rounded-full object-cover border border-neutral-700"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">
                          {currentStudent.name}
                        </h3>
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          DNI: {currentStudent.dni}
                        </span>
                        {activeFloorStudents.some((s) => s.clientId === currentStudent.id) && (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Entrenando ahora
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Objetivo:{' '}
                        <strong className="text-neutral-200">
                          {currentStudent.goal}
                        </strong>{' '}
                        · Peso:{' '}
                        <strong className="text-neutral-200">
                          {currentStudent.bodyWeightKg}kg
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestAsStudent(currentStudent)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Probar pantalla del alumno con este DNI"
                    >
                      <span>Ver como Alumno</span>
                    </button>
                    {clients.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar al alumno ${currentStudent.name}?`)) {
                            deleteClient(currentStudent.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                        title="Eliminar alumno"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Coach notes if any */}
                {currentStudent.notesFromCoach && (
                  <div className="text-xs bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-neutral-300">
                    <span className="font-bold text-amber-400 block mb-0.5">
                      Indicaciones del Entrenador para el Alumno:
                    </span>
                    {currentStudent.notesFromCoach}
                  </div>
                )}

                {/* Sesión en Curso y Series Tildadas por el Alumno */}
                {activeWorkoutsMap[currentStudent?.id] && (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <h4 className="text-sm font-bold text-emerald-400">
                          Sesión en Curso del Alumno: {activeWorkoutsMap[currentStudent.id].routineTitle}
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
                        {activeWorkoutsMap[currentStudent.id].exercises.reduce(
                          (sum, e) => sum + e.sets.filter((s) => s.completed).length,
                          0
                        )}{' '}
                        series marcadas por el alumno
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300">
                      El alumno está entrenando ahora. Cuando marca y tilda una serie en su dispositivo, se actualiza en verde aquí abajo en tiempo real:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeWorkoutsMap[currentStudent.id].exercises.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white truncate">{ex.name}</span>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold">
                              {ex.sets.filter((s) => s.completed).length}/{ex.sets.length} completadas
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {ex.sets.map((s, sIdx) => (
                              <div
                                key={sIdx}
                                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                                  s.completed
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                                }`}
                              >
                                <span>
                                  S{s.setNumber}: {s.actualWeightKg}k×{s.actualReps}
                                </span>
                                {s.completed ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <span className="text-neutral-600">○</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Routine Days Header & Add Day Button */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Rutina Semanal Asignada
                    </h4>
                    <p className="text-xs text-neutral-400">
                      {studentRoutines.length} días de entrenamiento programados
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddDayModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold flex items-center gap-1 border border-neutral-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Día</span>
                  </button>
                </div>

                {/* Days Accordion / List */}
                <div className="space-y-4">
                  {studentRoutines.length > 0 ? (
                    studentRoutines.map((day) => (
                      <div
                        key={day.id}
                        className="border border-neutral-800 bg-neutral-950 rounded-2xl p-4 sm:p-5 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800/80">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                                {day.dayName}
                              </span>
                              <span className="text-neutral-600">·</span>
                              <h5 className="text-sm font-bold text-white">
                                {day.title}
                              </h5>
                            </div>
                            <span className="text-xs text-neutral-400">
                              Enfoque: {day.focus}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setTargetDayId(day.id);
                                setIsAddExModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1 transition-all"
                            >
                              <Plus className="w-3 h-3 stroke-[3]" />
                              <span>Cargar Ejercicio</span>
                            </button>

                            <button
                              onClick={() =>
                                deleteDayFromClientRoutine(currentStudent.id, day.id)
                              }
                              className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors"
                              title="Eliminar este día de rutina"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Exercises inside Day */}
                        <div className="space-y-2">
                          {day.exercises.length > 0 ? (
                            day.exercises.map((ex, exIdx) => (
                              <div
                                key={ex.id}
                                className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                              >
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-neutral-800 font-mono font-bold text-neutral-300 flex items-center justify-center text-[10px]">
                                      {exIdx + 1}
                                    </span>
                                    <span className="font-bold text-white truncate">
                                      {ex.name}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded">
                                      {ex.muscleGroup}
                                    </span>
                                  </div>
                                  {ex.notes && (
                                    <span className="text-[11px] text-neutral-400 italic block">
                                      💡 {ex.notes}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 font-mono tabular-nums text-neutral-300 pl-4 sm:pl-0">
                                  <span>{ex.targetSets} series</span>
                                  <span>·</span>
                                  <span>{ex.targetReps} reps</span>
                                  <span>·</span>
                                  <span className="text-amber-400 font-bold">
                                    {ex.targetWeightKg} kg
                                  </span>
                                  <span>·</span>
                                  <span>{ex.restSec}s desc.</span>

                                  <button
                                    onClick={() =>
                                      deleteExerciseForSpecificClient(
                                        currentStudent.id,
                                        day.id,
                                        ex.id
                                      )
                                    }
                                    className="text-neutral-500 hover:text-red-400 p-1 transition-colors ml-1"
                                    title="Quitar ejercicio"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-4 text-center text-xs text-neutral-500 italic">
                              No hay ejercicios cargados en este día. Pulsa "Cargar Ejercicio" arriba.
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-neutral-500 italic bg-neutral-950 rounded-2xl border border-neutral-800">
                      El alumno aún no tiene días de rutina configurados. Pulsa "Añadir Día" para comenzar.
                    </div>
                  )}
                </div>
              </div>

              {/* Student past training logs preview */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Últimos Entrenamientos Registrados por {currentStudent.name}</span>
                </h4>

                {studentCompletedSessions.length > 0 ? (
                  <div className="divide-y divide-neutral-800/80">
                    {studentCompletedSessions.slice(0, 3).map((w) => (
                      <div
                        key={w.id}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-white block">
                            {w.routineTitle}
                          </span>
                          <span className="text-neutral-400 text-[11px] font-mono">
                            {w.date} · {w.durationMinutes} min · Sensación:{' '}
                            {w.feeling}
                          </span>
                        </div>
                        <div className="text-right font-mono tabular-nums">
                          <span className="text-amber-400 font-bold block">
                            {w.totalVolumeKg} kg
                          </span>
                          <span className="text-neutral-500 text-[10px]">
                            {w.totalSetsCompleted} series
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic py-2">
                    El alumno todavía no ha registrado sesiones en vivo desde su teléfono o tablet.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 p-12 text-center text-neutral-400 text-sm">
              Selecciona un alumno para revisar su rutina.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LIVE COACH FEEDBACK / MESSAGE TO ATHLETE */}
      {/* ========================================================================= */}
      {feedbackStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={feedbackStudent.avatar}
                alt={feedbackStudent.name}
                className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="text-base font-bold text-white">
                  Indicación en Vivo para {feedbackStudent.name}
                </h3>
                <span className="text-xs font-mono text-amber-400">
                  DNI: {feedbackStudent.dni}
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400">
              Este mensaje aparecerá en la parte superior de la pantalla del alumno (sea en su celular o en la tablet de sala).
            </p>

            <form onSubmit={handleSendLiveFeedback} className="space-y-4">
              <textarea
                rows={3}
                required
                value={feedbackNote ?? ''}
                onChange={(e) => setFeedbackNote(e.target.value ?? '')}
                placeholder="ej. ¡Excelente ritmo hoy! En la sentadilla cuida no juntar las rodillas al subir..."
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />

              {feedbackSentToast && (
                <p className="text-xs text-emerald-400 font-bold text-center">
                  ✓ ¡Indicación enviada al alumno con éxito!
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setFeedbackStudent(null)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Indicación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NEW STUDENT REGISTRATION */}
      {/* ========================================================================= */}
      {isNewStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              Dar de Alta Nuevo Alumno
            </h3>
            <p className="text-xs text-neutral-400">
              El alumno podrá ingresar inmediatamente a la webapp (en tablet pública o celular) utilizando su número de DNI.
            </p>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Número de DNI *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={newDni ?? ''}
                    onChange={(e) => setNewDni(e.target.value ?? '')}
                    placeholder="ej. 39120456"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName ?? ''}
                    onChange={(e) => setNewName(e.target.value ?? '')}
                    placeholder="ej. Martín Pérez"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Objetivo
                  </label>
                  <input
                    type="text"
                    value={newGoal ?? ''}
                    onChange={(e) => setNewGoal(e.target.value ?? '')}
                    placeholder="ej. Hipertrofia & Fuerza"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Nivel del Alumno
                  </label>
                  <select
                    value={newLevel ?? 'Intermedio'}
                    onChange={(e) => setNewLevel(e.target.value as ClientProfile['level'])}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Peso Corporal (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newWeight ?? ''}
                    onChange={(e) => setNewWeight(e.target.value ?? '')}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Estatura (cm)
                  </label>
                  <input
                    type="number"
                    value={newHeight ?? ''}
                    onChange={(e) => setNewHeight(e.target.value ?? '')}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Indicaciones / Mensaje del Entrenador para el Alumno
                </label>
                <textarea
                  rows={2}
                  value={newNotes ?? ''}
                  onChange={(e) => setNewNotes(e.target.value ?? '')}
                  placeholder="ej. Semana 1 de adaptación. Calentar bien hombros antes de la banca..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer"
                >
                  Guardar Alumno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD DAY TO ROUTINE */}
      {/* ========================================================================= */}
      {isAddDayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              Añadir Día de Entrenamiento
            </h3>

            <form onSubmit={handleAddDay} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Día de la semana
                </label>
                <input
                  type="text"
                  required
                  value={dayNameInput ?? ''}
                  onChange={(e) => setDayNameInput(e.target.value ?? '')}
                  placeholder="ej. Lunes, Miércoles, o Día 1"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Título del Día
                </label>
                <input
                  type="text"
                  required
                  value={dayTitleInput ?? ''}
                  onChange={(e) => setDayTitleInput(e.target.value ?? '')}
                  placeholder="ej. Día A: Pecho & Bíceps"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Enfoque Muscular
                </label>
                <input
                  type="text"
                  value={dayFocusInput ?? ''}
                  onChange={(e) => setDayFocusInput(e.target.value ?? '')}
                  placeholder="ej. Pectoral, Tríceps & Deltoides"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDayModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                >
                  Crear Día
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD EXERCISE TO STUDENT DAY */}
      {/* ========================================================================= */}
      {isAddExModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              Cargar Ejercicio para {currentStudent.name}
            </h3>

            <form onSubmit={handleAddExerciseToStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Seleccionar Ejercicio
                </label>
                <select
                  value={selectedCatalogId}
                  onChange={(e) => setSelectedCatalogId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
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
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Series Programadas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={exSets ?? ''}
                    onChange={(e) => setExSets(e.target.value ?? '')}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Reps Objetivo
                  </label>
                  <input
                    type="text"
                    value={exReps ?? ''}
                    onChange={(e) => setExReps(e.target.value ?? '')}
                    placeholder="ej. 8-10 o 12"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Peso Sugerido (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={exWeight ?? ''}
                    onChange={(e) => setExWeight(e.target.value ?? '')}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Descanso (segundos)
                  </label>
                  <input
                    type="number"
                    step="15"
                    value={exRest ?? ''}
                    onChange={(e) => setExRest(e.target.value ?? '')}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Indicación o Nota Técnica para el Alumno
                </label>
                <textarea
                  rows={2}
                  value={exCoachNotes ?? ''}
                  onChange={(e) => setExCoachNotes(e.target.value ?? '')}
                  placeholder="ej. Enfocarse en pausa de 1s en la parte baja, no arquear la espalda..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                >
                  Guardar Ejercicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unified Register Modal for Students & Coaches */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        initialTab={registerInitialTab}
        onStudentRegistered={(student) => {
          setSelectedStudentId(student.id);
          setDashboardTab('routines');
        }}
      />

      {/* Modal for Setting Custom Gym Name */}
      {isGymNameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
                  Nombre de tu Gimnasio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGymNameModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-neutral-300 block">
                Ingresa el nombre del gimnasio para mostrarlo en toda la aplicación:
              </label>
              <input
                type="text"
                value={tempGymName}
                onChange={(e) => setTempGymName(e.target.value)}
                placeholder="Ej: Spartan, IronTrack, Fitness Club..."
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-white font-semibold outline-none"
              />
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs text-neutral-400">
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Título de la app resultante:</span>
                <span className="text-amber-400 font-bold text-sm block mt-0.5">
                  "{tempGymName.trim() ? tempGymName.trim() : 'Nombre'} Gym Tracker"
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsGymNameModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  updateGymName(tempGymName);
                  setIsGymNameModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Guardar Nombre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
