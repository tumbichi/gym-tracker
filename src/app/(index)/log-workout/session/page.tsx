"use server";

import { getRoutineDay } from "@app/actions/workouts";
import { database } from "@core/lib/database";
import {
  useWorkoutSessionContext,
  WorkoutSessionProvider,
} from "@modules/log-workout/modules/session/contexts/WorkoutSessionContext";
import { WorkoutSession } from "@modules/log-workout/modules/session/features/workout-session";
import { notFound } from "next/navigation";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";

interface WorkoutSessionPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function WorkoutSessionPage({ searchParams }: WorkoutSessionPageProps) {
  const { routineId: _routineId, dayId: _dayId } = await searchParams;

  const routineId = _routineId ? Number.parseInt(_routineId as string) : null;
  const dayId = _dayId ? Number.parseInt(_dayId as string) : null;

  let routineDay = null;
  if (routineId && dayId) {
    try {
      routineDay = await getRoutineDay(routineId, dayId);
      console.log("fetched routine day", routineDay);
    } catch (error) {
      return notFound();
    }
  }

  const allExercises = await database.exercise.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <WorkoutSessionProvider routineDay={routineDay} initialAvailableExercises={allExercises}>
      <WorkoutSession />;
    </WorkoutSessionProvider>
  );
}
