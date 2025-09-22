import { database } from "@/lib/database";
import { ExercisesClient } from "./client";

async function getExercises() {
  return await database.exercise.findMany();
}

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return <ExercisesClient initialExercises={exercises} />;
}
