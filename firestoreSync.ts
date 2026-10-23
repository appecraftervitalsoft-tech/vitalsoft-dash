import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  ClientProfile,
  CoachProfile,
  CompletedWorkout,
  RoutineDay,
  ActiveWorkout,
} from '../types/fitness';

export interface GymSettingsDoc {
  id: string;
  gymName: string;
  updatedAt?: string;
}

// 1. Gym Settings
export async function saveGymSettings(settings: GymSettingsDoc): Promise<void> {
  const path = `gymSettings/${settings.id}`;
  try {
    await setDoc(doc(db, 'gymSettings', settings.id), {
      id: settings.id,
      gymName: settings.gymName,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToGymSettings(
  callback: (settings: GymSettingsDoc | null) => void
): Unsubscribe {
  const path = 'gymSettings/general';
  return onSnapshot(
    doc(db, 'gymSettings', 'general'),
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as GymSettingsDoc);
      } else {
        callback(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// 2. Clients
export async function saveClientToFirestore(client: ClientProfile): Promise<void> {
  const path = `clients/${client.id}`;
  try {
    await setDoc(doc(db, 'clients', client.id), {
      id: client.id,
      dni: String(client.dni).trim(),
      name: client.name,
      avatar: client.avatar || '⚡',
      goal: client.goal || 'Fuerza',
      level: (['principiante', 'intermedio', 'avanzado'].includes(String(client.level).toLowerCase())
        ? String(client.level).toLowerCase()
        : 'intermedio'),
      bodyWeightKg: client.bodyWeightKg || 70,
      heightCm: client.heightCm || 170,
      coach: client.coach || '',
      notesFromCoach: client.notesFromCoach || '',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteClientFromFirestore(clientId: string): Promise<void> {
  const path = `clients/${clientId}`;
  try {
    await deleteDoc(doc(db, 'clients', clientId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToClients(callback: (clients: ClientProfile[]) => void): Unsubscribe {
  const path = 'clients';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: ClientProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: data.id,
          dni: data.dni,
          name: data.name,
          avatar: data.avatar || '⚡',
          goal: data.goal || 'Entrenamiento',
          level: data.level || 'intermedio',
          bodyWeightKg: data.bodyWeightKg || 70,
          heightCm: data.heightCm || 170,
          coach: data.coach || '',
          notesFromCoach: data.notesFromCoach || '',
          membershipId: `GYM-${data.dni}`,
          activeRoutineId: `routine-${data.id}`,
        });
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// 3. Coaches
export async function saveCoachToFirestore(coach: CoachProfile): Promise<void> {
  const path = `coaches/${coach.id}`;
  try {
    await setDoc(doc(db, 'coaches', coach.id), {
      id: coach.id,
      dni: String(coach.dni).trim(),
      name: coach.name,
      specialty: coach.specialty || 'General',
      phone: coach.phone || '',
      avatar: coach.avatar || '🏋️‍♂️',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCoachFromFirestore(coachId: string): Promise<void> {
  const path = `coaches/${coachId}`;
  try {
    await deleteDoc(doc(db, 'coaches', coachId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToCoaches(callback: (coaches: CoachProfile[]) => void): Unsubscribe {
  const path = 'coaches';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: CoachProfile[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as CoachProfile);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// 4. Client Routines
export async function saveClientRoutineToFirestore(
  clientId: string,
  routines: RoutineDay[]
): Promise<void> {
  const safeId = clientId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `clientRoutines/${safeId}`;
  try {
    await setDoc(doc(db, 'clientRoutines', safeId), {
      id: safeId,
      clientId: clientId,
      dayName: routines[0]?.dayName || 'Dia 1',
      title: routines[0]?.title || 'Rutina',
      focus: routines[0]?.focus || 'Fuerza',
      exercises: routines,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToClientRoutines(
  callback: (routinesMap: Record<string, RoutineDay[]>) => void
): Unsubscribe {
  const path = 'clientRoutines';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const map: Record<string, RoutineDay[]> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.clientId && Array.isArray(data.exercises)) {
          map[data.clientId] = data.exercises as RoutineDay[];
        }
      });
      callback(map);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// 5. Live Active Sessions (Real-time student progress visible to coaches)
export async function saveLiveActiveSession(
  session: {
    id: string;
    clientId: string;
    clientName: string;
    clientDni: string;
    routineDayId: string;
    routineTitle: string;
    startedAt: string;
    lastActiveAt: string;
    durationSec: number;
    completedSetsCount: number;
    totalSetsCount: number;
    completedExerciseIds: string[];
    currentExerciseIndex: number;
  }
): Promise<void> {
  const path = `liveActiveSessions/${session.id}`;
  try {
    await setDoc(doc(db, 'liveActiveSessions', session.id), session);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeLiveActiveSession(sessionId: string): Promise<void> {
  const path = `liveActiveSessions/${sessionId}`;
  try {
    await deleteDoc(doc(db, 'liveActiveSessions', sessionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToLiveActiveSessions(
  callback: (sessions: Record<string, any>) => void
): Unsubscribe {
  const path = 'liveActiveSessions';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const sessionsMap: Record<string, any> = {};
      snapshot.forEach((docSnap) => {
        sessionsMap[docSnap.id] = docSnap.data();
      });
      callback(sessionsMap);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// 6. Completed Workouts History
export async function saveCompletedWorkoutToFirestore(workout: CompletedWorkout): Promise<void> {
  const path = `completedWorkouts/${workout.id}`;
  try {
    await setDoc(doc(db, 'completedWorkouts', workout.id), {
      id: workout.id,
      clientId: workout.clientId,
      routineTitle: workout.routineTitle,
      date: workout.date,
      durationMinutes: workout.durationMinutes,
      totalVolumeKg: workout.totalVolumeKg,
      totalSetsCompleted: workout.totalSetsCompleted,
      prsAchieved: workout.prsAchieved,
      notes: workout.notes || '',
      feeling: workout.feeling,
      exercises: workout.exercises || [],
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToCompletedWorkouts(
  callback: (workouts: CompletedWorkout[]) => void
): Unsubscribe {
  const path = 'completedWorkouts';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: CompletedWorkout[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as CompletedWorkout);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
