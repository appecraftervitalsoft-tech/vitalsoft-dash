export type MuscleGroup =
  | 'Pecho'
  | 'Espalda'
  | 'Piernas'
  | 'Hombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Core'
  | 'Glúteos'
  | 'Cuerpo Completo';

export type Equipment =
  | 'Barra'
  | 'Mancuernas'
  | 'Polea'
  | 'Máquina'
  | 'Peso Corporal'
  | 'Kettlebell'
  | 'Banco';

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: string[];
  equipment: Equipment;
  tips: string;
  defaultRestSec: number;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  targetSets: number;
  targetReps: string; // e.g. "8-10" or "12"
  targetWeightKg: number;
  restSec: number;
  notes?: string;
}

export interface RoutineDay {
  id: string;
  dayName: string; // e.g. "Día 1", "Lunes"
  title: string; // e.g. "Empuje: Pecho, Hombro & Tríceps"
  focus: string;
  image?: string;
  exercises: RoutineExercise[];
}

export interface ClientProfile {
  id: string;
  dni: string; // DNI del alumno para inicio de sesión directo
  name: string;
  avatar: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  goal: string;
  coach: string;
  bodyWeightKg: number;
  heightCm: number;
  membershipId: string;
  activeRoutineId: string;
  notesFromCoach?: string;
}

export interface CoachProfile {
  id: string;
  dni: string; // DNI del profesor para acceso exclusivo
  name: string;
  avatar: string;
  specialty: string;
  phone?: string;
}

export interface LoggedSet {
  id: string;
  setNumber: number;
  isWarmup: boolean;
  targetReps: string;
  targetWeightKg: number;
  actualReps: number;
  actualWeightKg: number;
  rpe?: number; // 6 - 10
  completed: boolean;
  completedAt?: string;
  isPR?: boolean;
}

export interface ActiveExerciseSession {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  restSec: number;
  notes?: string;
  userNotes?: string;
  sets: LoggedSet[];
  previousBest?: {
    weightKg: number;
    reps: number;
    estimated1RM: number;
    date: string;
  };
}

export interface ActiveWorkout {
  clientId?: string;
  routineDayId?: string;
  routineTitle: string;
  startedAt: string;
  exercises: ActiveExerciseSession[];
  isPaused: boolean;
}

export interface CompletedWorkout {
  id: string;
  clientId: string;
  routineTitle: string;
  date: string;
  durationMinutes: number;
  totalVolumeKg: number;
  totalSetsCompleted: number;
  prsAchieved: number;
  notes?: string;
  feeling: 'fuerte' | 'excelente' | 'normal' | 'fatigado';
  exercises: {
    name: string;
    muscleGroup: MuscleGroup;
    sets: {
      weightKg: number;
      reps: number;
      isPR?: boolean;
      rpe?: number;
    }[];
  }[];
}

export interface ExercisePR {
  exerciseId: string;
  exerciseName: string;
  maxWeightKg: number;
  maxWeightReps: number;
  maxEstimated1RM: number;
  achievedAt: string;
}

export interface ExerciseHistoryPoint {
  date: string;
  weightKg: number;
  reps: number;
  estimated1RM: number;
  workoutTitle: string;
}

export type DeviceMode = 'personal' | 'tablet_kiosk';

export interface LiveFloorActivity {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  clientDni: string;
  exerciseName: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe?: number;
  isPR?: boolean;
  time: string;
}

export interface StudentActiveSessionInfo {
  clientId: string;
  clientName: string;
  clientAvatar: string;
  clientDni: string;
  routineTitle: string;
  startedAt: string;
  totalSetsPlanned: number;
  setsCompleted: number;
  currentLiveVolumeKg: number;
  lastExerciseName?: string;
  prsAchieved: number;
}
