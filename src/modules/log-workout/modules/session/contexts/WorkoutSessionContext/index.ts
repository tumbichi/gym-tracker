"use client";

import { createContext } from "react";
import { Exercise } from "@prisma/client";
import { RoutineDay, SetEntry, WorkoutExercise } from "@core/types";
import { UseRestTimerReturn } from "../../hooks/useRestTimer";
import { UseTimerReturn } from "../../hooks/useElapsedTime";
import { DraftSession } from "../../types/draft-session";
import { CommitSessionResult } from "../../types/commit-result";

export interface WorkoutSessionContext {
  // State
  exercises: WorkoutExercise[];
  availableExercises: Exercise[];
  routineDay?: RoutineDay | null;
  timer: Omit<UseTimerReturn, "start" | "reset">;
  restTimer: UseRestTimerReturn;
  sessionNotes: string;

  // Draft State
  draftStatus: "idle" | "recovering" | "active" | "committing";
  loadedDraft: DraftSession | null;
  /** Whether the loaded draft was recovered from localStorage vs created by startWorkout */
  isRecoveredDraft: boolean;

  // Undo State
  canUndo: boolean;

  // Actions
  actions: {
    startWorkout: (newExercises: WorkoutExercise[]) => void;
    finishWorkout: (notes: string) => Promise<CommitSessionResult | void>;
    cancelWorkout: () => void;
    recoverDraft: () => void;
    discardDraft: () => void;
    saveDraft: (draft: DraftSession) => void;
    addExercise: (exerciseId: number, targetSeries?: number) => void;
    removeExercise: (exerciseId: number) => void;
    moveExercise: (index: number, direction: "up" | "down") => void;
    updateSet: (
      exerciseId: number,
      setId: string,
      updates: Partial<SetEntry>
    ) => void;
    addSet: (exerciseId: number) => void;
    removeSet: (exerciseId: number, setId: string) => void;
    undoLastChange: () => void;
    setSessionNotes: (notes: string) => void;

    // Deprecated actions
    addAvailableExercise: (newExercise: Exercise) => void;
    adjustReps: (exerciseId: number, setId: string, increment: number) => void;
    adjustWeight: (
      exerciseId: number,
      setId: string,
      increment: number
    ) => void;
  };
}
export { default as WorkoutSessionProvider } from "./WorkoutSessionProvider";
export type { WorkoutSessionProviderProps } from "./WorkoutSessionProvider";
export { default as useWorkoutSessionContext } from "./hooks/useWorkoutSessionContext";
export { default as useWorkoutSessionActions } from "./hooks/useWorkoutSessionActions";

export default createContext<WorkoutSessionContext | undefined>(undefined);
