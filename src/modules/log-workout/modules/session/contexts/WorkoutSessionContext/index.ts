"use client";

import { createContext, Dispatch } from "react";
import { Exercise, RoutineDay } from "@prisma/client";
import { SetEntry, WorkoutExercise } from "@core/types";
import { UseRestTimerReturn } from "../../hooks/useRestTimer";
import { UseTimerReturn } from "../../hooks/useElapsedTime";

export interface WorkoutSessionContext {
  availableExercises: Exercise[];
  routineDay?: RoutineDay | null;
  exercises: WorkoutExercise[];
  restTimer: UseRestTimerReturn;
  timer: Omit<UseTimerReturn, "start" | "reset">;
  actions: {
    addAvailableExercise: (newExercise: Exercise) => void;
    addExercise: (exerciseId: number, targetSeries?: number) => void;
    adjustReps: (exerciseId: number, setId: string, increment: number) => void;
    adjustWeight: (exerciseId: number, setId: string, increment: number) => void;
    finishWorkout: (notes: string) => Promise<void>;
    moveExercise: (index: number, direction: "up" | "down") => void;
    removeExercise: (exerciseId: number) => void;
    startWorkout: () => void;
    updateSet: (exerciseId: number, setId: string, updates: Partial<SetEntry>) => void;
  };
}
export { default as WorkoutSessionProvider } from "./WorkoutSessionProvider";
export { default as useWorkoutSessionContext } from "./hooks/useWorkoutSessionContext";
export { default as useWorkoutSessionActions } from "./hooks/useWorkoutSessionActions";

export default createContext<WorkoutSessionContext | undefined>(undefined);
