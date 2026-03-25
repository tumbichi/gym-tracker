"use server";

import { prisma } from "@core/lib/prisma";
import {
  Exercise,
  Routine as PrismaRoutine,
  RoutineDay as PrismaRoutineDay,
  RoutineExercise as PrismaRoutineExercise,
  WorkoutSession as PrismaWorkoutSession,
  SetEntry as PrismaSetEntry,
} from "@prisma/client";

// Section: Routine Types
export type RoutineExercise = PrismaRoutineExercise & { exercise: Exercise };
export type RoutineDay = PrismaRoutineDay & { items: RoutineExercise[] };
export type Routine = PrismaRoutine & { days: RoutineDay[] };
export type WorkoutExerciseWithSets = {
  id: number;
  exerciseId: number;
  order: number;
  notes: string | null;
  exercise: Exercise;
  sets: PrismaSetEntry[];
};

export type RecentSession = PrismaWorkoutSession & {
  routine: PrismaRoutine | null;
  workoutExercises: WorkoutExerciseWithSets[];
};

// Section: Data Fetching Functions
export async function getRoutines(): Promise<Routine[]> {
  return (await prisma.routine.findMany({
    include: {
      days: {
        include: {
          items: {
            include: {
              exercise: true,
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { name: "asc" },
  })) as Routine[];
}

export async function getRecentSessions(): Promise<RecentSession[]> {
  return await prisma.workoutSession.findMany({
    take: 7,
    include: {
      routine: true,
      workoutExercises: {
        include: {
          exercise: true,
          sets: true,
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { date: "desc" },
  }) as RecentSession[];
}

// Get the last session data for a specific exercise (for pre-filling weight/reps)
export type ExerciseLastSessionData = {
  exerciseId: number;
  weightKg: number;
  repsDone: number;
  setNumber: number;
} | null;

export async function getLastSessionForExercise(exerciseId: number): Promise<ExerciseLastSessionData> {
  // Find the last SetEntry for this exercise (ordered by session date)
  // Then get the session date to order by
  const lastSet = await prisma.setEntry.findFirst({
    where: {
      exerciseId: exerciseId,
    },
    include: {
      workoutExercise: {
        include: {
          session: true,
        },
      },
    },
    orderBy: {
      workoutExercise: {
        session: {
          date: 'desc',
        },
      },
    },
    take: 1,
  });

  if (!lastSet) {
    return null;
  }

  return {
    exerciseId: exerciseId,
    weightKg: lastSet.weightKg,
    repsDone: lastSet.repsDone,
    setNumber: lastSet.setNumber,
  };
}
