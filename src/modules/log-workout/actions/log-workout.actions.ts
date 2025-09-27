"use server";

import { database } from "@core/lib/database";
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
export type RecentSession = PrismaWorkoutSession & {
  routine: PrismaRoutine | null;
  setEntries: (PrismaSetEntry & { exercise: Exercise })[];
};

// Section: Data Fetching Functions
export async function getRoutines(): Promise<Routine[]> {
  return (await database.routine.findMany({
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
      setEntries: {
        include: {
          exercise: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });
}
