'use server';

import { database } from "@core/lib/database";
import { Exercise } from "@prisma/client";

export async function getExercises(): Promise<Exercise[]> {
  return await database.exercise.findMany({
    orderBy: { name: "asc" },
  });
}
