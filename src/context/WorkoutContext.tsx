import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  ActiveWorkout,
  ClientProfile,
  CoachProfile,
  CompletedWorkout,
  DeviceMode,
  ExerciseDefinition,
  ExercisePR,
  LiveFloorActivity,
  LoggedSet,
  RoutineDay,
  RoutineExercise,
  StudentActiveSessionInfo,
} from '../types/fitness';
import {
  EXERCISE_CATALOG,
  INITIAL_CLIENTS,
  INITIAL_COACHES,
  INITIAL_COMPLETED_WORKOUTS,
  INITIAL_PRS,
  INITIAL_ROUTINES,
} from '../data/initialData';
import { sound } from '../utils/audio';
import { calculate1RM } from '../utils/calculator';
import { syncBus, SyncMessage } from '../utils/syncChannel';
import {
  subscribeToGymSettings,
  saveGymSettings,
  subscribeToClients,
  saveClientToFirestore,
  deleteClientFromFirestore,
  subscribeToCoaches,
  saveCoachToFirestore,
  deleteCoachFromFirestore,
  subscribeToClientRoutines,
  saveClientRoutineToFirestore,
  subscribeToCompletedWorkouts,
  saveCompletedWorkoutToFirestore,
  subscribeToLiveActiveSessions,
  saveLiveActiveSession,
  removeLiveActiveSession,
} from '../services/firestoreSync';

interface RestTimerState {
  active: boolean;
  remainingSec: number;
  totalSec: number;
  exerciseName?: string;
}

export type UserRole = 'client' | 'coach' | null;

export const INITIAL_LIVE_ACTIVITIES: LiveFloorActivity[] = [];

export const INITIAL_ACTIVE_FLOOR: StudentActiveSessionInfo[] = [];

interface WorkoutContextType {
  // Gym Branding & Cloud Sync
  gymName: string;
  updateGymName: (name: string) => Promise<void>;
  isFirebaseSyncing: boolean;

  // Authentication & Role
  currentUserRole: UserRole;
  loginWithDni: (dni: string) => { success: boolean; client?: ClientProfile; message?: string };
  loginAsCoachWithDni: (dni: string) => { success: boolean; coach?: CoachProfile; message?: string };
  loginAsCoach: () => void;
  switchToClientRole: (clientId?: string) => void;
  logout: () => void;
  quickRegisterAndLoginStudent: (dni: string, name?: string) => ClientProfile;
  quickRegisterAndLoginCoach: (dni: string, name?: string) => CoachProfile;

  // Coaches
  coaches: CoachProfile[];
  currentCoach: CoachProfile | null;
  addNewCoach: (data: {
    dni: string;
    name: string;
    specialty: string;
    phone?: string;
    avatar?: string;
  }) => CoachProfile;
  deleteCoach: (coachId: string) => void;

  // Clients
  clients: ClientProfile[];
  currentClient: ClientProfile;
  selectClient: (clientId: string) => void;
  updateClient: (updated: Partial<ClientProfile>) => void;
  addNewClient: (data: {
    dni: string;
    name: string;
    goal: string;
    level: ClientProfile['level'];
    bodyWeightKg: number;
    heightCm: number;
    coach?: string;
    notesFromCoach?: string;
  }) => ClientProfile;
  deleteClient: (clientId: string) => void;

  // Coach inspection
  coachSelectedClientId: string;
  setCoachSelectedClientId: (id: string) => void;

  // Routines
  routines: RoutineDay[];
  allRoutinesMap: Record<string, RoutineDay[]>;
  updateRoutineExercise: (dayId: string, exercise: RoutineExercise) => void;
  addExerciseToRoutineDay: (dayId: string, exercise: RoutineExercise) => void;
  deleteExerciseFromRoutineDay: (dayId: string, exerciseId: string) => void;
  addDayToClientRoutine: (clientId: string, dayName: string, title: string, focus: string) => void;
  deleteDayFromClientRoutine: (clientId: string, dayId: string) => void;
  addExerciseToSpecificClient: (clientId: string, dayId: string, exercise: RoutineExercise) => void;
  updateExerciseForSpecificClient: (clientId: string, dayId: string, exercise: RoutineExercise) => void;
  deleteExerciseForSpecificClient: (clientId: string, dayId: string, exerciseId: string) => void;

  // Active workout
  activeWorkout: ActiveWorkout | null;
  activeWorkoutsMap: Record<string, ActiveWorkout>;
  workoutDurationSec: number;
  startWorkout: (routineDay: RoutineDay) => void;
  updateLoggedSet: (exerciseIndex: number, setIndex: number, fields: Partial<LoggedSet>) => void;
  toggleCompleteSet: (exerciseIndex: number, setIndex: number) => void;
  addSetToActiveExercise: (exerciseIndex: number) => void;
  removeSetFromActiveExercise: (exerciseIndex: number, setIndex: number) => void;
  addExerciseToLiveWorkout: (exerciseDef: ExerciseDefinition) => void;
  finishWorkout: (feeling: 'fuerte' | 'excelente' | 'normal' | 'fatigado', notes?: string) => void;
  cancelWorkout: () => void;
  getStudentTodayExerciseStatus: (
    clientId: string,
    exerciseName: string
  ) => { completedSets: number; totalSets: number; isFullyCompleted: boolean };

  // Rest Timer
  restTimer: RestTimerState;
  startRestTimer: (seconds: number, exerciseName?: string) => void;
  stopRestTimer: () => void;
  addRestTimerSeconds: (seconds: number) => void;

  // Progress & PRs
  completedWorkouts: CompletedWorkout[];
  prs: ExercisePR[];
  lastCompletedWorkout: CompletedWorkout | null;
  clearLastCompletedWorkout: () => void;

  // Device Mode: Personal Phone vs Gym Tablet Kiosk
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;

  // Real-time Gym Floor Monitor for Coaches & Tablets
  activeFloorStudents: StudentActiveSessionInfo[];
  liveFloorActivities: LiveFloorActivity[];
  sendCoachFeedbackToStudent: (clientId: string, note: string) => void;
  simulateLiveFloorActivity: (studentId?: string) => void;

  // Audio
  isMuted: boolean;
  toggleMute: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clients state with robust fallback and DNI hydration
  const [clients, setClients] = useState<ClientProfile[]>(() => {
    try {
      const saved = localStorage.getItem('irontrack_clients');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: Partial<ClientProfile>, idx: number): ClientProfile => {
            const fallback = INITIAL_CLIENTS.find((ic) => ic.id === c.id) || INITIAL_CLIENTS[idx] || INITIAL_CLIENTS[0];
            return {
              id: c.id || fallback.id || `client-${idx + 1}`,
              dni: c.dni ? String(c.dni) : (fallback.dni || `3845219${idx}`),
              name: c.name || fallback.name || `Alumno ${idx + 1}`,
              avatar: c.avatar || fallback.avatar || '',
              level: c.level || fallback.level || 'Intermedio',
              goal: c.goal || fallback.goal || 'Fuerza & Salud',
              coach: c.coach || fallback.coach || 'Prof. Marcos V.',
              bodyWeightKg: typeof c.bodyWeightKg === 'number' ? c.bodyWeightKg : fallback.bodyWeightKg,
              heightCm: typeof c.heightCm === 'number' ? c.heightCm : fallback.heightCm,
              membershipId: c.membershipId || fallback.membershipId || `GYM-${1000 + idx}`,
              activeRoutineId: c.activeRoutineId || fallback.activeRoutineId || `routine-${idx + 1}`,
              notesFromCoach: c.notesFromCoach || fallback.notesFromCoach,
            };
          });
        }
      }
    } catch {
      // If parsing fails, fall back to initial
    }
    return INITIAL_CLIENTS;
  });

  const [currentClientId, setCurrentClientId] = useState<string>(() => {
    const saved = localStorage.getItem('irontrack_current_client_id');
    return saved || 'client-1';
  });

  // Coaches state with robust fallback and DNI hydration
  const [coaches, setCoaches] = useState<CoachProfile[]>(() => {
    try {
      const saved = localStorage.getItem('irontrack_coaches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_COACHES;
  });

  const [currentCoachId, setCurrentCoachId] = useState<string | null>(() => {
    return localStorage.getItem('irontrack_current_coach_id') || null;
  });

  // Current User Role: null (needs DNI login or role selection), 'client', or 'coach'
  // Defaults to null so every new visit or fresh tab always shows the Login / DNI Portal first!
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    // Check sessionStorage only (lasts during active browser tab, never forces a profile on fresh visits)
    const sessionRole = sessionStorage.getItem('irontrack_role');
    if (sessionRole === 'client' || sessionRole === 'coach') return sessionRole;
    // Clear any lingering localStorage role to avoid unintended auto-login
    try {
      localStorage.removeItem('irontrack_role');
    } catch {
      // Ignore
    }
    return null;
  });

  // Coach currently selected student
  const [coachSelectedClientId, setCoachSelectedClientId] = useState<string>(() => {
    return 'client-1';
  });

  const [allRoutinesMap, setAllRoutinesMap] = useState<Record<string, RoutineDay[]>>(() => {
    const saved = localStorage.getItem('irontrack_routines');
    return saved ? JSON.parse(saved) : INITIAL_ROUTINES;
  });

  const [allPrsMap, setAllPrsMap] = useState<Record<string, ExercisePR[]>>(() => {
    const saved = localStorage.getItem('irontrack_prs');
    return saved ? JSON.parse(saved) : INITIAL_PRS;
  });

  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>(() => {
    const saved = localStorage.getItem('irontrack_history');
    return saved ? JSON.parse(saved) : INITIAL_COMPLETED_WORKOUTS;
  });

  // Active workouts strictly keyed by clientId to ensure complete separation between students
  const [activeWorkoutsMap, setActiveWorkoutsMap] = useState<Record<string, ActiveWorkout>>(() => {
    try {
      const savedMap = localStorage.getItem('irontrack_active_workouts_map');
      if (savedMap) {
        return JSON.parse(savedMap);
      }
      // Clean legacy global active workout to prevent one student's workout showing on others
      localStorage.removeItem('irontrack_active_workout');
      localStorage.removeItem('irontrack_floor_students');
      localStorage.removeItem('irontrack_floor_activities');
      return {};
    } catch {
      return {};
    }
  });

  // Active workout strictly for the current logged-in client
  const activeWorkout = activeWorkoutsMap[currentClientId] || null;

  const [workoutDurationSec, setWorkoutDurationSec] = useState<number>(0);

  const [restTimer, setRestTimer] = useState<RestTimerState>({
    active: false,
    remainingSec: 0,
    totalSec: 0,
  });

  const [lastCompletedWorkout, setLastCompletedWorkout] = useState<CompletedWorkout | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('irontrack_muted') === 'true';
  });

  // Device Mode: Personal Phone vs Gym Tablet Kiosk
  const [deviceMode, setDeviceModeState] = useState<DeviceMode>(() => {
    const saved = localStorage.getItem('irontrack_device_mode');
    return saved === 'tablet_kiosk' ? 'tablet_kiosk' : 'personal';
  });

  const setDeviceMode = (mode: DeviceMode) => {
    setDeviceModeState(mode);
    localStorage.setItem('irontrack_device_mode', mode);
  };

  const [gymName, setGymName] = useState<string>(() => {
    return localStorage.getItem('irontrack_gym_name') || 'IronTrack';
  });
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(true);
  const [remoteLiveSessions, setRemoteLiveSessions] = useState<Record<string, any>>({});

  const updateGymName = async (name: string) => {
    const trimmed = name.trim() || 'IronTrack';
    setGymName(trimmed);
    localStorage.setItem('irontrack_gym_name', trimmed);
    try {
      await saveGymSettings({ id: 'general', gymName: trimmed });
    } catch {
      // Handled
    }
  };

  // Real active students on floor derived from both local active workout and Firestore remote sessions
  const activeFloorStudents: StudentActiveSessionInfo[] = useMemo(() => {
    const combined: Record<string, StudentActiveSessionInfo> = {};

    // 1. From local active workouts
    Object.entries(activeWorkoutsMap).forEach(([clientId, workout]) => {
      const student = clients.find((c) => c.id === clientId) || {
        id: clientId,
        name: 'Alumno',
        avatar: '',
        dni: '---',
      };
      const totalPlanned = workout.exercises ? workout.exercises.reduce((sum, e) => sum + e.sets.length, 0) : 0;
      let completed = 0;
      let vol = 0;
      let lastEx = workout.exercises?.[0]?.name || '';
      let prsCount = 0;

      if (workout.exercises) {
        workout.exercises.forEach((e) => {
          e.sets.forEach((s) => {
            if (s.completed) {
              completed++;
              vol += s.actualWeightKg * s.actualReps;
              lastEx = `${e.name} (${s.actualWeightKg} kg × ${s.actualReps})`;
              if (s.isPR) prsCount++;
            }
          });
        });
      }

      combined[clientId] = {
        clientId,
        clientName: student.name,
        clientAvatar: student.avatar,
        clientDni: student.dni,
        routineTitle: workout.routineTitle,
        startedAt: workout.startedAt,
        totalSetsPlanned: totalPlanned,
        setsCompleted: completed,
        currentLiveVolumeKg: vol,
        lastExerciseName: lastEx,
        prsAchieved: prsCount,
      };
    });

    // 2. From remote live sessions in Firestore (from student phones or other terminals)
    Object.entries(remoteLiveSessions).forEach(([clientId, session]) => {
      if (!combined[clientId]) {
        const student = clients.find((c) => c.id === clientId) || {
          id: clientId,
          name: session.clientName || 'Alumno',
          avatar: '',
          dni: session.clientDni || '---',
        };
        combined[clientId] = {
          clientId,
          clientName: session.clientName || student.name,
          clientAvatar: student.avatar,
          clientDni: session.clientDni || student.dni,
          routineTitle: session.routineTitle || 'Rutina',
          startedAt: session.startedAt || new Date().toISOString(),
          totalSetsPlanned: session.totalSetsCount || 10,
          setsCompleted: session.completedSetsCount || 0,
          currentLiveVolumeKg: 0,
          lastExerciseName: 'En entrenamiento...',
          prsAchieved: 0,
        };
      }
    });

    return Object.values(combined);
  }, [activeWorkoutsMap, remoteLiveSessions, clients]);

  const [liveFloorActivities, setLiveFloorActivities] = useState<LiveFloorActivity[]>([]);

  // Current client and coach
  const currentClient = clients.find((c) => c.id === currentClientId) || clients[0];
  const currentCoach = coaches.find((c) => c.id === currentCoachId) || coaches[0] || null;
  const routines = allRoutinesMap[currentClientId] || [];
  const prs = allPrsMap[currentClientId] || [];

  // Firestore real-time sync and automatic initialization
  useEffect(() => {
    const unsubGym = subscribeToGymSettings((settings) => {
      if (settings && settings.gymName) {
        setGymName(settings.gymName);
        localStorage.setItem('irontrack_gym_name', settings.gymName);
      }
    });

    const unsubClients = subscribeToClients((remoteClients) => {
      if (remoteClients.length > 0) {
        setClients(remoteClients);
      } else {
        INITIAL_CLIENTS.forEach((c) => {
          saveClientToFirestore(c).catch(() => {});
        });
      }
      setIsFirebaseSyncing(false);
    });

    const unsubCoaches = subscribeToCoaches((remoteCoaches) => {
      if (remoteCoaches.length > 0) {
        setCoaches(remoteCoaches);
      } else {
        INITIAL_COACHES.forEach((coach) => {
          saveCoachToFirestore(coach).catch(() => {});
        });
      }
    });

    const unsubRoutines = subscribeToClientRoutines((remoteRoutinesMap) => {
      if (Object.keys(remoteRoutinesMap).length > 0) {
        setAllRoutinesMap((prev) => ({ ...prev, ...remoteRoutinesMap }));
      } else {
        Object.entries(INITIAL_ROUTINES).forEach(([cId, dayList]) => {
          saveClientRoutineToFirestore(cId, dayList).catch(() => {});
        });
      }
    });

    const unsubWorkouts = subscribeToCompletedWorkouts((remoteWorkouts) => {
      if (remoteWorkouts.length > 0) {
        setCompletedWorkouts(remoteWorkouts);
      }
    });

    const unsubLive = subscribeToLiveActiveSessions((sessions) => {
      setRemoteLiveSessions(sessions);
    });

    return () => {
      unsubGym();
      unsubClients();
      unsubCoaches();
      unsubRoutines();
      unsubWorkouts();
      unsubLive();
    };
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('irontrack_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('irontrack_coaches', JSON.stringify(coaches));
  }, [coaches]);

  useEffect(() => {
    localStorage.setItem('irontrack_current_client_id', currentClientId);
  }, [currentClientId]);

  useEffect(() => {
    if (currentCoachId) {
      localStorage.setItem('irontrack_current_coach_id', currentCoachId);
    } else {
      localStorage.removeItem('irontrack_current_coach_id');
    }
  }, [currentCoachId]);

  useEffect(() => {
    if (currentUserRole) {
      sessionStorage.setItem('irontrack_role', currentUserRole);
    } else {
      sessionStorage.removeItem('irontrack_role');
      localStorage.removeItem('irontrack_role');
    }
  }, [currentUserRole]);

  useEffect(() => {
    localStorage.setItem('irontrack_routines', JSON.stringify(allRoutinesMap));
  }, [allRoutinesMap]);

  useEffect(() => {
    localStorage.setItem('irontrack_prs', JSON.stringify(allPrsMap));
  }, [allPrsMap]);

  useEffect(() => {
    localStorage.setItem('irontrack_history', JSON.stringify(completedWorkouts));
  }, [completedWorkouts]);

  useEffect(() => {
    localStorage.setItem('irontrack_active_workouts_map', JSON.stringify(activeWorkoutsMap));
  }, [activeWorkoutsMap]);

  useEffect(() => {
    sound.isMuted = isMuted;
    localStorage.setItem('irontrack_muted', String(isMuted));
  }, [isMuted]);

  // Workout duration counter
  useEffect(() => {
    if (!activeWorkout) {
      setWorkoutDurationSec(0);
      return;
    }

    const startTimestamp = new Date(activeWorkout.startedAt).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.max(0, Math.floor((now - startTimestamp) / 1000));
      setWorkoutDurationSec(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Rest Timer countdown interval
  useEffect(() => {
    if (!restTimer.active) return;

    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (!prev.active) return prev;
        if (prev.remainingSec <= 1) {
          sound.playRestFinished();
          return { ...prev, active: false, remainingSec: 0 };
        }
        if (prev.remainingSec <= 4 && prev.remainingSec > 1) {
          sound.playCountdownBeep(prev.remainingSec === 2 ? 800 : 660);
        }
        return { ...prev, remainingSec: prev.remainingSec - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.active]);

  // Clean DNI string (removes dots, spaces, dashes) safely
  const cleanDni = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    try {
      return String(val).replace(/[.\s-]/g, '').trim();
    } catch {
      return '';
    }
  };

  const loginWithDni = (rawDni: unknown) => {
    const cleaned = cleanDni(rawDni);
    if (!cleaned) {
      return { success: false, message: 'Por favor ingresa un número de DNI válido.' };
    }

    const found = clients.find((c) => c && cleanDni(c.dni) === cleaned);
    if (found) {
      setCurrentClientId(found.id);
      setCurrentUserRole('client');
      return { success: true, client: found };
    }

    return {
      success: false,
      message: `No se encontró ningún alumno con DNI: ${String(rawDni ?? '')}. Puedes consultar al profesor para darte de alta.`,
    };
  };

  const sendCoachFeedbackToStudent = (clientId: string, note: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, notesFromCoach: note } : c))
    );
  };

  const simulateLiveFloorActivity = () => {
    // Sencillez y datos reales: no transmitimos datos simulados en vivo
  };

  const loginAsCoachWithDni = (rawDni: unknown) => {
    const cleaned = cleanDni(rawDni);
    if (!cleaned) {
      return { success: false, message: 'Por favor ingresa tu número de DNI de profesor.' };
    }

    const found = coaches.find((c) => c && cleanDni(c.dni) === cleaned);
    if (found) {
      setCurrentCoachId(found.id);
      setCurrentUserRole('coach');
      return { success: true, coach: found };
    }

    return {
      success: false,
      message: `DNI no registrado como profesor: ${String(rawDni ?? '')}. Verifica el número o regístrate en el panel.`,
    };
  };

  const loginAsCoach = () => {
    setCurrentUserRole('coach');
  };

  const switchToClientRole = (clientId?: string) => {
    if (clientId) {
      setCurrentClientId(clientId);
    }
    setCurrentUserRole('client');
  };

  const logout = () => {
    setCurrentUserRole(null);
    try {
      sessionStorage.removeItem('irontrack_role');
      localStorage.removeItem('irontrack_role');
    } catch {
      // Ignore
    }
  };

  const addNewCoach = (data: {
    dni: string;
    name: string;
    specialty: string;
    phone?: string;
    avatar?: string;
  }): CoachProfile => {
    const newId = `coach-${Date.now()}`;
    const newCoach: CoachProfile = {
      id: newId,
      dni: cleanDni(data.dni),
      name: data.name,
      specialty: data.specialty || 'Profesor de Sala',
      phone: data.phone || '',
      avatar:
        data.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          data.name
        )}&backgroundColor=0f172a&textColor=f59e0b`,
    };
    setCoaches((prev) => [...prev, newCoach]);
    saveCoachToFirestore(newCoach).catch(() => {});
    return newCoach;
  };

  const deleteCoach = (coachId: string) => {
    setCoaches((prev) => prev.filter((c) => c.id !== coachId));
    deleteCoachFromFirestore(coachId).catch(() => {});
  };

  const getStudentTodayExerciseStatus = (
    clientId: string,
    exerciseName: string
  ): { completedSets: number; totalSets: number; isFullyCompleted: boolean } => {
    const targetName = exerciseName.toLowerCase().trim();

    // 1. Check in local active workout
    const active = activeWorkoutsMap[clientId];
    if (active?.exercises) {
      const activeEx = active.exercises.find(
        (e) => e.name.toLowerCase().trim() === targetName
      );
      if (activeEx) {
        const completedSets = activeEx.sets.filter((s) => s.completed).length;
        const totalSets = activeEx.sets.length;
        return {
          completedSets,
          totalSets,
          isFullyCompleted: completedSets > 0 && completedSets >= totalSets,
        };
      }
    }

    // 2. Check in remote live sessions from Firestore (other devices)
    const remote = remoteLiveSessions[clientId];
    if (remote && Array.isArray(remote.completedExerciseIds)) {
      if (remote.completedExerciseIds.some((id: string) => id.toLowerCase().includes(targetName) || targetName.includes(id.toLowerCase()))) {
        return {
          completedSets: 3,
          totalSets: 3,
          isFullyCompleted: true,
        };
      }
    }

    // 3. Check in completed workouts today
    const todayStr = new Date().toISOString().split('T')[0];
    const todayWorkouts = completedWorkouts.filter(
      (w) => w.clientId === clientId && w.date.startsWith(todayStr)
    );
    for (const tw of todayWorkouts) {
      const foundInCompleted = tw.exercises?.find(
        (e) => e.name.toLowerCase().trim() === targetName
      );
      if (foundInCompleted) {
        const completedSets = foundInCompleted.sets?.length || 0;
        return {
          completedSets,
          totalSets: completedSets,
          isFullyCompleted: completedSets > 0,
        };
      }
    }

    return { completedSets: 0, totalSets: 0, isFullyCompleted: false };
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const selectClient = (clientId: string) => {
    setCurrentClientId(clientId);
  };

  const updateClient = (updated: Partial<ClientProfile>) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === currentClientId) {
          const merged = { ...c, ...updated };
          saveClientToFirestore(merged).catch(() => {});
          return merged;
        }
        return c;
      })
    );
  };

  const addNewClient = (data: {
    dni: string;
    name: string;
    goal: string;
    level: ClientProfile['level'];
    bodyWeightKg: number;
    heightCm: number;
    coach?: string;
    notesFromCoach?: string;
  }): ClientProfile => {
    const newId = `client-${Date.now()}`;
    const newClient: ClientProfile = {
      id: newId,
      dni: cleanDni(data.dni),
      name: data.name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=171717&textColor=f59e0b`,
      level: data.level,
      goal: data.goal,
      coach: data.coach || 'Prof. Marcos V.',
      bodyWeightKg: data.bodyWeightKg,
      heightCm: data.heightCm,
      membershipId: `GYM-${Math.floor(1000 + Math.random() * 9000)}`,
      activeRoutineId: `routine-${newId}`,
      notesFromCoach: data.notesFromCoach,
    };

    // Default template routine for new client
    const defaultDays: RoutineDay[] = [
      {
        id: `day-a-${Date.now()}`,
        dayName: 'Día 1',
        title: 'Fuerza Básica & Torso',
        focus: 'Pecho, Espalda & Brazos',
        exercises: [
          {
            id: `re-init-1-${Date.now()}`,
            exerciseId: 'bench-press',
            name: 'Press de Banca Plano',
            muscleGroup: 'Pecho',
            targetSets: 3,
            targetReps: '8-10',
            targetWeightKg: 40,
            restSec: 90,
            notes: 'Aprender la técnica y retracción escapular.',
          },
          {
            id: `re-init-2-${Date.now()}`,
            exerciseId: 'lat-pulldown',
            name: 'Jalón al Pecho en Polea',
            muscleGroup: 'Espalda',
            targetSets: 3,
            targetReps: '10-12',
            targetWeightKg: 35,
            restSec: 75,
            notes: 'Jalar hacia clavículas sin encoger hombros.',
          },
        ],
      },
      {
        id: `day-b-${Date.now()}`,
        dayName: 'Día 2',
        title: 'Pierna & Core',
        focus: 'Sentadillas & Glúteos',
        exercises: [
          {
            id: `re-init-3-${Date.now()}`,
            exerciseId: 'barbell-squat',
            name: 'Sentadilla Trasera con Barra',
            muscleGroup: 'Piernas',
            targetSets: 3,
            targetReps: '8-10',
            targetWeightKg: 45,
            restSec: 120,
            notes: 'Mantener la espalda firme y rodillas alineadas.',
          },
        ],
      },
    ];

    setClients((prev) => [...prev, newClient]);
    setAllRoutinesMap((prev) => ({ ...prev, [newId]: defaultDays }));
    setAllPrsMap((prev) => ({ ...prev, [newId]: [] }));

    // Sync to Firestore
    saveClientToFirestore(newClient).catch(() => {});
    saveClientRoutineToFirestore(newId, defaultDays).catch(() => {});

    return newClient;
  };

  const deleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    setAllRoutinesMap((prev) => {
      const copy = { ...prev };
      delete copy[clientId];
      return copy;
    });
    deleteClientFromFirestore(clientId).catch(() => {});
    if (currentClientId === clientId) {
      const remaining = clients.filter((c) => c.id !== clientId);
      if (remaining.length > 0) {
        setCurrentClientId(remaining[0].id);
      }
    }
  };

  const quickRegisterAndLoginStudent = (rawDni: string, name?: string): ClientProfile => {
    const cleaned = cleanDni(rawDni) || String(Math.floor(10000000 + Math.random() * 89999999));
    const student = addNewClient({
      dni: cleaned,
      name: name?.trim() || `Alumno (DNI ${cleaned})`,
      goal: 'Acondicionamiento & Fuerza',
      level: 'Intermedio',
      bodyWeightKg: 75,
      heightCm: 175,
      coach: coaches[0]?.name || 'Prof. Marcos Valenzuela',
      notesFromCoach: 'Bienvenido. Rutina inicial asignada.',
    });
    setCurrentClientId(student.id);
    setCurrentUserRole('client');
    return student;
  };

  const quickRegisterAndLoginCoach = (rawDni: string, name?: string): CoachProfile => {
    const cleaned = cleanDni(rawDni) || String(Math.floor(20000000 + Math.random() * 89999999));
    const coach = addNewCoach({
      dni: cleaned,
      name: name?.trim() || `Profesor (DNI ${cleaned})`,
      specialty: 'Profesor de Sala & Musculación',
    });
    setCurrentCoachId(coach.id);
    setCurrentUserRole('coach');
    return coach;
  };

  const addDayToClientRoutine = (
    clientId: string,
    dayName: string,
    title: string,
    focus: string
  ) => {
    const newDay: RoutineDay = {
      id: `day-${Date.now()}`,
      dayName,
      title,
      focus,
      exercises: [],
    };

    setAllRoutinesMap((prev) => {
      const list = prev[clientId] || [];
      const updated = [...list, newDay];
      saveClientRoutineToFirestore(clientId, updated).catch(() => {});
      return { ...prev, [clientId]: updated };
    });
  };

  const deleteDayFromClientRoutine = (clientId: string, dayId: string) => {
    setAllRoutinesMap((prev) => {
      const list = prev[clientId] || [];
      const updated = list.filter((d) => d.id !== dayId);
      saveClientRoutineToFirestore(clientId, updated).catch(() => {});
      return { ...prev, [clientId]: updated };
    });
  };

  const addExerciseToSpecificClient = (
    clientId: string,
    dayId: string,
    exercise: RoutineExercise
  ) => {
    setAllRoutinesMap((prev) => {
      const list = prev[clientId] || [];
      const updated = list.map((day) => {
        if (day.id !== dayId) return day;
        return { ...day, exercises: [...day.exercises, exercise] };
      });
      saveClientRoutineToFirestore(clientId, updated).catch(() => {});
      return { ...prev, [clientId]: updated };
    });
  };

  const updateExerciseForSpecificClient = (
    clientId: string,
    dayId: string,
    exercise: RoutineExercise
  ) => {
    setAllRoutinesMap((prev) => {
      const list = prev[clientId] || [];
      const updated = list.map((day) => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          exercises: day.exercises.map((ex) => (ex.id === exercise.id ? exercise : ex)),
        };
      });
      saveClientRoutineToFirestore(clientId, updated).catch(() => {});
      return { ...prev, [clientId]: updated };
    });
  };

  const deleteExerciseForSpecificClient = (
    clientId: string,
    dayId: string,
    exerciseId: string
  ) => {
    setAllRoutinesMap((prev) => {
      const list = prev[clientId] || [];
      const updated = list.map((day) => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
        };
      });
      saveClientRoutineToFirestore(clientId, updated).catch(() => {});
      return { ...prev, [clientId]: updated };
    });
  };

  const updateRoutineExercise = (dayId: string, exercise: RoutineExercise) => {
    updateExerciseForSpecificClient(currentClientId, dayId, exercise);
  };

  const addExerciseToRoutineDay = (dayId: string, exercise: RoutineExercise) => {
    addExerciseToSpecificClient(currentClientId, dayId, exercise);
  };

  const deleteExerciseFromRoutineDay = (dayId: string, exerciseId: string) => {
    deleteExerciseForSpecificClient(currentClientId, dayId, exerciseId);
  };

  const startRestTimer = (seconds: number, exerciseName?: string) => {
    setRestTimer({
      active: true,
      remainingSec: seconds,
      totalSec: seconds,
      exerciseName,
    });
  };

  const stopRestTimer = () => {
    setRestTimer((prev) => ({ ...prev, active: false, remainingSec: 0 }));
  };

  const addRestTimerSeconds = (seconds: number) => {
    setRestTimer((prev) => ({
      ...prev,
      remainingSec: Math.max(5, prev.remainingSec + seconds),
      totalSec: Math.max(prev.totalSec, prev.remainingSec + seconds),
    }));
  };

  // Start live workout strictly for current client
  const startWorkout = (routineDay: RoutineDay) => {
    const activeExercises = routineDay.exercises.map((re) => {
      const sets: LoggedSet[] = [];
      const numSets = re.targetSets || 3;

      for (let i = 1; i <= numSets; i++) {
        sets.push({
          id: `set-${re.id}-${i}-${Date.now()}`,
          setNumber: i,
          isWarmup: i === 1 && numSets >= 4 && re.targetWeightKg >= 80,
          targetReps: re.targetReps,
          targetWeightKg: re.targetWeightKg,
          actualReps: parseInt(re.targetReps.split('-')[0], 10) || 10,
          actualWeightKg: re.targetWeightKg,
          rpe: 8,
          completed: false,
        });
      }

      const existingPR = prs.find((p) => p.exerciseId === re.exerciseId);

      return {
        exerciseId: re.exerciseId,
        name: re.name,
        muscleGroup: re.muscleGroup,
        restSec: re.restSec || 90,
        notes: re.notes,
        sets,
        previousBest: existingPR
          ? {
              weightKg: existingPR.maxWeightKg,
              reps: existingPR.maxWeightReps,
              estimated1RM: existingPR.maxEstimated1RM,
              date: existingPR.achievedAt,
            }
          : undefined,
      };
    });

    const session: ActiveWorkout = {
      clientId: currentClientId,
      routineDayId: routineDay.id,
      routineTitle: routineDay.title,
      startedAt: new Date().toISOString(),
      exercises: activeExercises,
      isPaused: false,
    };

    setActiveWorkoutsMap((prev) => ({
      ...prev,
      [currentClientId]: session,
    }));

    // Broadcast session start to Firestore
    const student = clients.find((c) => c.id === currentClientId);
    saveLiveActiveSession({
      id: currentClientId,
      clientId: currentClientId,
      clientName: student?.name || 'Alumno',
      clientDni: student?.dni || '',
      routineDayId: routineDay.id,
      routineTitle: routineDay.title,
      startedAt: session.startedAt,
      lastActiveAt: new Date().toISOString(),
      durationSec: 0,
      completedSetsCount: 0,
      totalSetsCount: activeExercises.reduce((sum, e) => sum + e.sets.length, 0),
      completedExerciseIds: [],
      currentExerciseIndex: 0,
    }).catch(() => {});
  };

  const updateLoggedSet = (
    exerciseIndex: number,
    setIndex: number,
    fields: Partial<LoggedSet>
  ) => {
    setActiveWorkoutsMap((prev) => {
      const current = prev[currentClientId];
      if (!current) return prev;
      const newExercises = [...current.exercises];
      const targetEx = { ...newExercises[exerciseIndex] };
      const newSets = [...targetEx.sets];
      newSets[setIndex] = { ...newSets[setIndex], ...fields };
      targetEx.sets = newSets;
      newExercises[exerciseIndex] = targetEx;
      return {
        ...prev,
        [currentClientId]: { ...current, exercises: newExercises },
      };
    });
  };

  const toggleCompleteSet = (exerciseIndex: number, setIndex: number) => {
    const currentWorkout = activeWorkoutsMap[currentClientId];
    if (!currentWorkout) return;

    const currentEx = currentWorkout.exercises[exerciseIndex];
    const currentSet = currentEx.sets[setIndex];
    const willBeCompleted = !currentSet.completed;

    let isPR = false;
    if (willBeCompleted) {
      const set1RM = calculate1RM(currentSet.actualWeightKg, currentSet.actualReps);
      const existingPR = prs.find((p) => p.exerciseId === currentEx.exerciseId);

      if (
        (!existingPR && currentSet.actualWeightKg > 0) ||
        (existingPR &&
          (currentSet.actualWeightKg > existingPR.maxWeightKg ||
            set1RM > existingPR.maxEstimated1RM))
      ) {
        isPR = true;
        sound.playPRCelebration();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      } else {
        sound.playSetComplete();
      }

      if (currentEx.restSec && currentEx.restSec > 0) {
        startRestTimer(currentEx.restSec, currentEx.name);
      }
    }

    updateLoggedSet(exerciseIndex, setIndex, {
      completed: willBeCompleted,
      completedAt: willBeCompleted ? new Date().toISOString() : undefined,
      isPR,
    });

    // Sync live progress to Firestore so coaches see sets marked in real-time
    const updatedExercises = currentWorkout.exercises.map((ex, exIdx) => {
      if (exIdx !== exerciseIndex) return ex;
      const updatedSets = ex.sets.map((s, sIdx) => {
        if (sIdx !== setIndex) return s;
        return {
          ...s,
          completed: willBeCompleted,
          completedAt: willBeCompleted ? new Date().toISOString() : undefined,
          isPR,
        };
      });
      return { ...ex, sets: updatedSets };
    });

    const student = clients.find((c) => c.id === currentClientId);
    const totalPlanned = updatedExercises.reduce((sum, e) => sum + e.sets.length, 0);
    const completedSets = updatedExercises.reduce(
      (sum, e) => sum + e.sets.filter((s) => s.completed).length,
      0
    );
    const completedExerciseIds = updatedExercises
      .filter((e) => e.sets.length > 0 && e.sets.every((s) => s.completed))
      .map((e) => e.exerciseId);

    saveLiveActiveSession({
      id: currentClientId,
      clientId: currentClientId,
      clientName: student?.name || 'Alumno',
      clientDni: student?.dni || '',
      routineDayId: currentWorkout.routineDayId || 'day-1',
      routineTitle: currentWorkout.routineTitle,
      startedAt: currentWorkout.startedAt,
      lastActiveAt: new Date().toISOString(),
      durationSec: workoutDurationSec,
      completedSetsCount: completedSets,
      totalSetsCount: totalPlanned,
      completedExerciseIds,
      currentExerciseIndex: exerciseIndex,
    }).catch(() => {});
  };

  const addSetToActiveExercise = (exerciseIndex: number) => {
    const current = activeWorkoutsMap[currentClientId];
    if (!current) return;
    const targetEx = current.exercises[exerciseIndex];
    const lastSet = targetEx.sets[targetEx.sets.length - 1];

    const newSet: LoggedSet = {
      id: `set-extra-${Date.now()}`,
      setNumber: targetEx.sets.length + 1,
      isWarmup: false,
      targetReps: lastSet ? lastSet.targetReps : '8-10',
      targetWeightKg: lastSet ? lastSet.actualWeightKg : 20,
      actualReps: lastSet ? lastSet.actualReps : 10,
      actualWeightKg: lastSet ? lastSet.actualWeightKg : 20,
      rpe: 8,
      completed: false,
    };

    setActiveWorkoutsMap((prev) => {
      const curr = prev[currentClientId];
      if (!curr) return prev;
      const newExercises = [...curr.exercises];
      newExercises[exerciseIndex] = {
        ...newExercises[exerciseIndex],
        sets: [...newExercises[exerciseIndex].sets, newSet],
      };
      return {
        ...prev,
        [currentClientId]: { ...curr, exercises: newExercises },
      };
    });
  };

  const removeSetFromActiveExercise = (exerciseIndex: number, setIndex: number) => {
    setActiveWorkoutsMap((prev) => {
      const curr = prev[currentClientId];
      if (!curr) return prev;
      const newExercises = [...curr.exercises];
      const filtered = newExercises[exerciseIndex].sets.filter((_, idx) => idx !== setIndex);
      const renumbered = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      newExercises[exerciseIndex] = {
        ...newExercises[exerciseIndex],
        sets: renumbered,
      };
      return {
        ...prev,
        [currentClientId]: { ...curr, exercises: newExercises },
      };
    });
  };

  const addExerciseToLiveWorkout = (exerciseDef: ExerciseDefinition) => {
    const current = activeWorkoutsMap[currentClientId];
    if (!current) return;
    const existingPR = prs.find((p) => p.exerciseId === exerciseDef.id);

    const initialSets: LoggedSet[] = [
      {
        id: `set-${exerciseDef.id}-1-${Date.now()}`,
        setNumber: 1,
        isWarmup: false,
        targetReps: '8-12',
        targetWeightKg: existingPR ? existingPR.maxWeightKg * 0.8 : 20,
        actualReps: 10,
        actualWeightKg: existingPR ? existingPR.maxWeightKg * 0.8 : 20,
        rpe: 8,
        completed: false,
      },
      {
        id: `set-${exerciseDef.id}-2-${Date.now()}`,
        setNumber: 2,
        isWarmup: false,
        targetReps: '8-12',
        targetWeightKg: existingPR ? existingPR.maxWeightKg * 0.8 : 20,
        actualReps: 10,
        actualWeightKg: existingPR ? existingPR.maxWeightKg * 0.8 : 20,
        rpe: 8,
        completed: false,
      },
      {
        id: `set-${exerciseDef.id}-3-${Date.now()}`,
        setNumber: 3,
        isWarmup: false,
        targetReps: '8-12',
        targetWeightKg: existingPR ? existingPR.maxWeightKg * 0.8 : 20,
        actualReps: 10,
        actualWeightKg: existingPR ? existingPR.maxWeightKg * 0.8 : 20,
        rpe: 8,
        completed: false,
      },
    ];

    setActiveWorkoutsMap((prev) => {
      const curr = prev[currentClientId];
      if (!curr) return prev;
      return {
        ...prev,
        [currentClientId]: {
          ...curr,
          exercises: [
            ...curr.exercises,
            {
              exerciseId: exerciseDef.id,
              name: exerciseDef.name,
              muscleGroup: exerciseDef.muscleGroup,
              restSec: exerciseDef.defaultRestSec,
              notes: exerciseDef.tips,
              sets: initialSets,
              previousBest: existingPR
                ? {
                    weightKg: existingPR.maxWeightKg,
                    reps: existingPR.maxWeightReps,
                    estimated1RM: existingPR.maxEstimated1RM,
                    date: existingPR.achievedAt,
                  }
                : undefined,
            },
          ],
        },
      };
    });
  };

  const finishWorkout = (
    feeling: 'fuerte' | 'excelente' | 'normal' | 'fatigado',
    notes?: string
  ) => {
    const current = activeWorkoutsMap[currentClientId];
    if (!current) return;

    let totalVolumeKg = 0;
    let totalSetsCompleted = 0;
    let prsAchieved = 0;
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    const completedExerciseData = current.exercises.map((ex) => {
      const completedSets = ex.sets.filter((s) => s.completed);
      totalSetsCompleted += completedSets.length;

      completedSets.forEach((s) => {
        totalVolumeKg += s.actualWeightKg * s.actualReps;
        if (s.isPR) prsAchieved++;
      });

      return {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: completedSets.map((s) => ({
          weightKg: s.actualWeightKg,
          reps: s.actualReps,
          isPR: s.isPR,
          rpe: s.rpe,
        })),
      };
    });

    const durationMins = Math.max(1, Math.round(workoutDurationSec / 60));

    const finishedRecord: CompletedWorkout = {
      id: `cw-${Date.now()}`,
      clientId: currentClientId,
      routineTitle: current.routineTitle,
      date: todayStr,
      durationMinutes: durationMins,
      totalVolumeKg,
      totalSetsCompleted,
      prsAchieved,
      notes,
      feeling,
      exercises: completedExerciseData,
    };

    setAllPrsMap((prevMap) => {
      const clientPRs = [...(prevMap[currentClientId] || [])];

      current.exercises.forEach((ex) => {
        ex.sets.forEach((s) => {
          if (!s.completed) return;
          const calculated1RM = calculate1RM(s.actualWeightKg, s.actualReps);
          const prIdx = clientPRs.findIndex((p) => p.exerciseId === ex.exerciseId);

          if (prIdx >= 0) {
            const currentPR = clientPRs[prIdx];
            if (
              s.actualWeightKg > currentPR.maxWeightKg ||
              calculated1RM > currentPR.maxEstimated1RM
            ) {
              clientPRs[prIdx] = {
                ...currentPR,
                maxWeightKg: Math.max(currentPR.maxWeightKg, s.actualWeightKg),
                maxWeightReps: s.actualWeightKg >= currentPR.maxWeightKg ? s.actualReps : currentPR.maxWeightReps,
                maxEstimated1RM: Math.max(currentPR.maxEstimated1RM, calculated1RM),
                achievedAt: todayStr,
              };
            }
          } else if (s.actualWeightKg > 0) {
            clientPRs.push({
              exerciseId: ex.exerciseId,
              exerciseName: ex.name,
              maxWeightKg: s.actualWeightKg,
              maxWeightReps: s.actualReps,
              maxEstimated1RM: calculated1RM,
              achievedAt: todayStr,
            });
          }
        });
      });

      return { ...prevMap, [currentClientId]: clientPRs };
    });

    setCompletedWorkouts((prev) => [finishedRecord, ...prev]);
    setLastCompletedWorkout(finishedRecord);

    // Save completed workout and remove live session from Firestore
    saveCompletedWorkoutToFirestore(finishedRecord).catch(() => {});
    removeLiveActiveSession(currentClientId).catch(() => {});

    // Strictly remove ONLY this student's active workout!
    setActiveWorkoutsMap((prev) => {
      const copy = { ...prev };
      delete copy[currentClientId];
      return copy;
    });

    stopRestTimer();

    sound.playPRCelebration();
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }
  };

  const cancelWorkout = () => {
    removeLiveActiveSession(currentClientId).catch(() => {});
    setActiveWorkoutsMap((prev) => {
      const copy = { ...prev };
      delete copy[currentClientId];
      return copy;
    });
    stopRestTimer();
  };

  const clearLastCompletedWorkout = () => {
    setLastCompletedWorkout(null);
  };

  return (
    <WorkoutContext.Provider
      value={{
        gymName,
        updateGymName,
        isFirebaseSyncing,
        currentUserRole,
        loginWithDni,
        loginAsCoachWithDni,
        loginAsCoach,
        switchToClientRole,
        logout,
        quickRegisterAndLoginStudent,
        quickRegisterAndLoginCoach,
        coaches,
        currentCoach,
        addNewCoach,
        deleteCoach,
        clients,
        currentClient,
        selectClient,
        updateClient,
        addNewClient,
        deleteClient,
        coachSelectedClientId,
        setCoachSelectedClientId,
        routines,
        allRoutinesMap,
        updateRoutineExercise,
        addExerciseToRoutineDay,
        deleteExerciseFromRoutineDay,
        addDayToClientRoutine,
        deleteDayFromClientRoutine,
        addExerciseToSpecificClient,
        updateExerciseForSpecificClient,
        deleteExerciseForSpecificClient,
        activeWorkout,
        activeWorkoutsMap,
        workoutDurationSec,
        startWorkout,
        updateLoggedSet,
        toggleCompleteSet,
        addSetToActiveExercise,
        removeSetFromActiveExercise,
        addExerciseToLiveWorkout,
        finishWorkout,
        cancelWorkout,
        getStudentTodayExerciseStatus,
        restTimer,
        startRestTimer,
        stopRestTimer,
        addRestTimerSeconds,
        completedWorkouts,
        prs,
        lastCompletedWorkout,
        clearLastCompletedWorkout,
        deviceMode,
        setDeviceMode,
        activeFloorStudents,
        liveFloorActivities,
        sendCoachFeedbackToStudent,
        simulateLiveFloorActivity,
        isMuted,
        toggleMute,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
