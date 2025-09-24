import { Exercise, RoutineDay as PrismaRoutineDay, RoutineExercise } from "@prisma/client";

export interface SetEntry {
  id: string;
  exerciseId: number;
  exerciseName: string;
  setNumber: number;
  targetReps?: string;
  targetWeight?: number | null;
  repsDone: number;
  weightKg: number;
  rpe?: number;
  notes?: string | null;
  completed: boolean;
}

export interface WorkoutExercise {
  id: number;
  name: string;
  targetSeries: number;
  targetReps: string;
  targetWeight?: number | null;
  notes?: string | null;
  sets: SetEntry[];
}

export type RoutineDay = PrismaRoutineDay & {
  items: (RoutineExercise & {
    exercise: Exercise;
  })[];
};
