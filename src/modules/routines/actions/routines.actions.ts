"use server";

import { database } from "@core/lib/database";
import { prisma } from "@core/lib/prisma";

export async function getAllExercises() {
  return prisma.exercise.findMany();
}

import {
  Exercise,
  Prisma,
  Routine as PrismaRoutine,
  RoutineDay as PrismaRoutineDay,
  RoutineExercise as PrismaRoutineExercise,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

// Section: Routine Types
export type RoutineExercise = PrismaRoutineExercise & { exercise: Exercise };
export type RoutineDay = PrismaRoutineDay & { items: RoutineExercise[] };
export type Routine = PrismaRoutine & { days: RoutineDay[] };

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

export async function getRoutineById(id: number): Promise<Routine | null> {
  return (await database.routine.findUnique({
    where: { id },
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
  })) as Routine | null;
}

// Section: Data Mutation Functions

// This type is needed for the form
export type RoutineFormData = Omit<Prisma.RoutineCreateInput, "user"> & {
  days: (Omit<Prisma.RoutineDayCreateInput, "routine"> & {
    items: (Omit<Prisma.RoutineExerciseCreateInput, "routineDay" | "exercise"> & { exerciseId: number | null })[];
  })[];
};

export async function createRoutine(data: RoutineFormData): Promise<Routine> {
  // Assuming a hardcoded user for now
  const userId = 1;

  const { name, weeks, days } = data;

  const newRoutine = await database.routine.create({
    data: {
      name,
      weeks,
      user: { connect: { id: userId } },
      days: {
        create: days.map((day) => ({
          name: day.name,
          order: day.order,
          items: {
            create: day.items
              .filter((item) => item.exerciseId !== null)
              .map((item) => ({
                order: item.order,
                series: item.series,
                reps: item.reps,
                targetWeight: item.targetWeight,
                notes: item.notes,
                exercise: { connect: { id: item.exerciseId as number } },
              })),
          },
        })),
      },
    },
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
  });

  revalidatePath("/routines");

  return newRoutine as Routine;
}

export async function updateRoutine(id: number, data: RoutineFormData): Promise<Routine> {
  const { name, weeks, days } = data;

  // 1. Find existing RoutineDay IDs for the routine being updated
  const existingDays = await database.routineDay.findMany({
    where: { routineId: id },
    select: { id: true },
  });
  const existingDayIds = existingDays.map((day) => day.id);

  // 2. Delete all associated RoutineExercise items
  if (existingDayIds.length > 0) {
    await database.routineExercise.deleteMany({
      where: { routineDayId: { in: existingDayIds } },
    });
  }

  // 3. Delete all associated RoutineDay records
  await database.routineDay.deleteMany({
    where: { routineId: id },
  });

  // 4. Update the Routine and create new days and their items
  const updatedRoutine = await database.routine.update({
    where: { id },
    data: {
      name,
      weeks,
      days: {
        create: days.map((day) => ({
          name: day.name,
          order: day.order,
          items: {
            create: day.items
              .filter((item) => item.exerciseId !== null)
              .map((item) => ({
                order: item.order,
                series: item.series,
                reps: item.reps,
                targetWeight: item.targetWeight,
                notes: item.notes,
                exercise: { connect: { id: item.exerciseId as number } },
              })),
          },
        })),
      },
    },
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
  });

  revalidatePath("/routines");
  revalidatePath(`/routines/${id}`);

  return updatedRoutine as Routine;
}

export async function deleteRoutine(id: number) {
  // Workaround for a bug in some Prisma versions with $transaction in server actions.
  // We execute delete operations sequentially instead.

  const daysToDelete = await database.routineDay.findMany({
    where: { routineId: id },
    select: { id: true },
  });
  const dayIds = daysToDelete?.map((day) => day.id);

  // 1. Delete all the exercise items within those days
  if (dayIds && dayIds.length > 0) {
    await database.routineExercise.deleteMany({
      where: { routineDayId: { in: dayIds } },
    });
  }

  // 2. Delete all the days
  await database.routineDay.deleteMany({
    where: { routineId: id },
  });

  // 3. Finally, delete the routine itself
  await database.routine.delete({
    where: { id },
  });

  revalidatePath("/routines");
}
