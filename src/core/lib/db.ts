export interface Exercise {
  id: number;
  name: string;
  slug: string;
  primaryGroup: string | null;
  equipment: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface Routine {
  id: number;
  name: string;
  userId: number;
  weeks: number;
  createdAt: Date;
  days: RoutineDay[];
}

export interface RoutineDay {
  id: number;
  routineId: number;
  name: string;
  order: number;
  items: RoutineExercise[];
}

export interface RoutineExercise {
  id: number;
  routineDayId: number;
  exerciseId: number;
  order: number;
  series: number;
  reps: string;
  targetWeight: number | null;
  notes: string | null;
  exercise?: Exercise;
}

export interface WorkoutExercise {
  id: number;
  sessionId: number;
  exerciseId: number;
  order: number;
  notes: string | null;
  exercise?: Exercise;
  sets: SetEntry[];
  session?: WorkoutSession;
}

export interface WorkoutSession {
  id: number;
  userId: number;
  date: Date;
  routineId: number | null;
  notes: string | null;
  workoutExercises: WorkoutExercise[];
  createdAt: Date;
  routine?: Routine;
}

export interface SetEntry {
  id: number;
  workoutExerciseId: number;
  exerciseId: number;
  setNumber: number;
  repsDone: number;
  weightKg: number;
  rpe: number | null;
  notes: string | null;
  createdAt: Date;
  exercise?: Exercise;
  workoutExercise?: WorkoutExercise;
}

// Mock data for v0 environment
const mockExercises: Exercise[] = [
  {
    id: 1,
    name: "Press de Banca",
    slug: "press-de-banca",
    primaryGroup: "Pecho",
    equipment: "Barra",
    notes: "Ejercicio básico para pecho",
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Sentadilla",
    slug: "sentadilla",
    primaryGroup: "Piernas",
    equipment: "Barra",
    notes: "Ejercicio básico para piernas",
    createdAt: new Date(),
  },
  {
    id: 3,
    name: "Peso Muerto",
    slug: "peso-muerto",
    primaryGroup: "Espalda",
    equipment: "Barra",
    notes: "Ejercicio básico para espalda",
    createdAt: new Date(),
  },
];

const mockRoutines: Routine[] = [
  {
    id: 1,
    name: "Push/Pull/Legs",
    userId: 1,
    weeks: 1,
    createdAt: new Date(),
    days: [
      {
        id: 1,
        routineId: 1,
        name: "Push (Lunes)",
        order: 1,
        items: [
          {
            id: 1,
            routineDayId: 1,
            exerciseId: 1,
            order: 1,
            series: 4,
            reps: "8-10",
            targetWeight: 80,
            notes: "Calentar bien",
            exercise: mockExercises[0],
          },
        ],
      },
      {
        id: 2,
        routineId: 1,
        name: "Pull (Martes)",
        order: 2,
        items: [
          {
            id: 2,
            routineDayId: 2,
            exerciseId: 3,
            order: 1,
            series: 4,
            reps: "6-8",
            targetWeight: 100,
            notes: "Mantener espalda recta",
            exercise: mockExercises[2],
          },
        ],
      },
      {
        id: 3,
        routineId: 1,
        name: "Legs (Miércoles)",
        order: 3,
        items: [
          {
            id: 3,
            routineDayId: 3,
            exerciseId: 2,
            order: 1,
            series: 4,
            reps: "10-12",
            targetWeight: 90,
            notes: "Profundidad completa",
            exercise: mockExercises[1],
          },
        ],
      },
      {
        id: 4,
        routineId: 1,
        name: "Descanso (Jueves)",
        order: 4,
        items: [],
      },
      {
        id: 5,
        routineId: 1,
        name: "Push (Viernes)",
        order: 5,
        items: [
          {
            id: 4,
            routineDayId: 5,
            exerciseId: 1,
            order: 1,
            series: 3,
            reps: "10-12",
            targetWeight: 75,
            notes: "Volumen más alto",
            exercise: mockExercises[0],
          },
        ],
      },
      {
        id: 6,
        routineId: 1,
        name: "Descanso (Sábado)",
        order: 6,
        items: [],
      },
      {
        id: 7,
        routineId: 1,
        name: "Descanso (Domingo)",
        order: 7,
        items: [],
      },
    ],
  },
];

const mockSessions: WorkoutSession[] = [
  {
    id: 1,
    userId: 1,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    routineId: 1,
    notes: "Buen entrenamiento",
    createdAt: new Date(),
    routine: mockRoutines[0],
    workoutExercises: [],
  },
  {
    id: 2,
    userId: 1,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    routineId: 1,
    notes: "Sesión intensa",
    createdAt: new Date(),
    routine: mockRoutines[0],
    workoutExercises: [],
  },
];

const mockWorkoutExercises: WorkoutExercise[] = [
  {
    id: 1,
    sessionId: 1,
    exerciseId: 1,
    order: 0,
    notes: null,
    exercise: mockExercises[0],
    sets: [],
    session: mockSessions[0],
  },
  {
    id: 2,
    sessionId: 1,
    exerciseId: 3,
    order: 1,
    notes: null,
    exercise: mockExercises[2],
    sets: [],
    session: mockSessions[0],
  },
  {
    id: 3,
    sessionId: 2,
    exerciseId: 2,
    order: 0,
    notes: null,
    exercise: mockExercises[1],
    sets: [],
    session: mockSessions[1],
  },
];

const mockSetEntries: SetEntry[] = [
  {
    id: 1,
    workoutExerciseId: 1,
    exerciseId: 1,
    setNumber: 1,
    repsDone: 10,
    weightKg: 80,
    rpe: 8,
    notes: null,
    createdAt: new Date(),
    exercise: mockExercises[0],
    workoutExercise: mockWorkoutExercises[0],
  },
  {
    id: 2,
    workoutExerciseId: 2,
    exerciseId: 3,
    setNumber: 1,
    repsDone: 8,
    weightKg: 100,
    rpe: 9,
    notes: null,
    createdAt: new Date(),
    exercise: mockExercises[2],
    workoutExercise: mockWorkoutExercises[1],
  },
  {
    id: 3,
    workoutExerciseId: 3,
    exerciseId: 2,
    setNumber: 1,
    repsDone: 12,
    weightKg: 90,
    rpe: 7,
    notes: null,
    createdAt: new Date(),
    exercise: mockExercises[1],
    workoutExercise: mockWorkoutExercises[2],
  },
];

// Update workout exercises to include sets
mockWorkoutExercises[0].sets = [mockSetEntries[0]];
mockWorkoutExercises[1].sets = [mockSetEntries[1]];
mockWorkoutExercises[2].sets = [mockSetEntries[2]];

// Update sessions to include workout exercises
mockSessions[0].workoutExercises = [mockWorkoutExercises[0], mockWorkoutExercises[1]];
mockSessions[1].workoutExercises = [mockWorkoutExercises[2]];

// Database abstraction layer
export const db = {
  exercise: {
    findMany: async () => mockExercises,
    findUnique: async ({ where }: { where: { id: number } }) => mockExercises.find((e) => e.id === where.id) || null,
    create: async ({ data }: { data: Omit<Exercise, "id" | "createdAt"> }) => {
      const newExercise: Exercise = {
        ...data,
        id: Math.max(...mockExercises.map((e) => e.id)) + 1,
        createdAt: new Date(),
      };
      mockExercises.push(newExercise);
      return newExercise;
    },
    update: async ({ where, data }: { where: { id: number }; data: Partial<Exercise> }) => {
      const index = mockExercises.findIndex((e) => e.id === where.id);
      if (index !== -1) {
        mockExercises[index] = { ...mockExercises[index], ...data };
        return mockExercises[index];
      }
      throw new Error("Exercise not found");
    },
    delete: async ({ where }: { where: { id: number } }) => {
      const index = mockExercises.findIndex((e) => e.id === where.id);
      if (index !== -1) {
        return mockExercises.splice(index, 1)[0];
      }
      throw new Error("Exercise not found");
    },
  },
  routine: {
    findMany: async () => mockRoutines,
    findUnique: async ({ where, include }: { where: { id: number }; include?: any }) =>
      mockRoutines.find((r) => r.id === where.id) || null,
    create: async ({ data }: { data: any }) => {
      const newRoutine: Routine = {
        ...data,
        id: Math.max(...mockRoutines.map((r) => r.id)) + 1,
        createdAt: new Date(),
        days: [],
      };
      mockRoutines.push(newRoutine);
      return newRoutine;
    },
  },
  workoutSession: {
    findMany: async ({ include }: { include?: any } = {}) => mockSessions,
    count: async ({ where }: { where?: any } = {}) => mockSessions.length,
    create: async ({ data }: { data: any }) => {
      const newSession: WorkoutSession = {
        ...data,
        id: Math.max(...mockSessions.map((s) => s.id)) + 1,
        createdAt: new Date(),
        workoutExercises: [],
      };
      mockSessions.push(newSession);
      return newSession;
    },
  },
  setEntry: {
    findMany: async ({ where, include }: { where?: any; include?: any } = {}) => {
      return mockSetEntries;
    },
    aggregate: async ({ where, _sum }: { where?: any; _sum?: any } = {}) => {
      const totalWeight = mockSetEntries.reduce((sum, entry) => sum + entry.weightKg, 0);
      return {
        _sum: {
          weightKg: totalWeight,
        },
      };
    },
    groupBy: async () => {
      const uniqueExercises = [...new Set(mockSetEntries.map((entry) => entry.exerciseId))];
      return uniqueExercises.map((exerciseId) => ({ exerciseId }));
    },
  },
  routineDay: {
    findMany: async ({ where }: { where: { routineId: number } } = { where: { routineId: 1 } }) => {
      return mockRoutines.find((r) => r.id === where.routineId)?.days || [];
    },
  },
};
