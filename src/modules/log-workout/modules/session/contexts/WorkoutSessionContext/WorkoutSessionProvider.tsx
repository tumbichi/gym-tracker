"use client";

import * as React from "react";
import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useState } from "react";
import { Exercise } from "@prisma/client";
import type { RoutineDay, SetEntry, WorkoutExercise } from "@core/types";

import useRestTimer from "../../hooks/useRestTimer";
import useTimer from "../../hooks/useElapsedTime";
import {
  CommitSessionPayload,
  CommitWorkoutExercisePayload,
} from "../../types/commit-payload";
import { CommitSessionResult } from "../../types/commit-result";
import { commitWorkoutSession } from "@modules/log-workout/actions/commit-workout-session.actions";
import WorkoutSessionContext from ".";
import { useDraftSession } from "./hooks/useDraftSession";
import {
  DraftSession,
  DRAFT_SESSION_VERSION,
} from "../../types/draft-session";

import { ExerciseLastSessionData } from "@modules/log-workout/actions/log-workout.actions";

export interface WorkoutSessionProviderProps extends PropsWithChildren {
  routineDay?: RoutineDay | null;
  initialAvailableExercises?: Exercise[];
  isFreeWorkout?: boolean;
  forceNew?: boolean;
  lastSessionDataByExercise?: Map<number, ExerciseLastSessionData>;
}

function WorkoutSessionProvider({ 
  children, 
  routineDay: routineDayProp = null, 
  initialAvailableExercises: initialExercises = [],
  isFreeWorkout: isFreeWorkoutProp = false,
  forceNew: forceNewProp = false,
  lastSessionDataByExercise: lastSessionDataProp = new Map(),
}: WorkoutSessionProviderProps) {
  // State
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [history, setHistory] = useState<WorkoutExercise[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [routineDay, setRoutineDay] = useState<RoutineDay | null>(routineDayProp);
  const [availableExercises] = useState<Exercise[]>(initialExercises);
  const [draftStatus, setDraftStatus] = useState<"idle" | "recovering" | "active" | "committing">("idle");
  const [loadedDraft, setLoadedDraft] = useState<DraftSession | null>(null);
  // Flag to distinguish between a draft recovered from localStorage vs created by startWorkout
  // This is critical: we should only show recovery modal when recovering an EXISTING draft
  const [isRecoveredDraft, setIsRecoveredDraft] = useState(false);
  const [lastSessionDataByExercise, setLastSessionDataByExercise] = useState<Map<number, ExerciseLastSessionData>>(lastSessionDataProp);

  // Hooks
  const timer = useTimer();
  const restTimer = useRestTimer();
  const { getDraft, saveDraft, clearDraft } = useDraftSession();

// Check for existing draft on mount
  useEffect(() => {
    if (draftStatus !== "idle") return;
    
    const existingDraft = getDraft();
    if (existingDraft) {
      setLoadedDraft(existingDraft);
      setIsRecoveredDraft(true); // Mark as recovered from localStorage
      setDraftStatus("recovering");
    }
  }, [draftStatus, getDraft]);

  // Auto-save draft when exercises change
  useEffect(() => {
    if (draftStatus !== "active" || exercises.length === 0 || !loadedDraft) return;

    const draftToSave: DraftSession = {
      ...loadedDraft,
      updatedAt: new Date().toISOString(),
      exercises,
      sessionNotes,
      activeExerciseId: null,
      lastCompletedSetId: null,
      timer: {
        startDate: timer.startDate?.toISOString() ?? null,
        elapsedTime: timer.elapsedTime,
      },
    };
    saveDraft(draftToSave);
  }, [exercises, sessionNotes, draftStatus, loadedDraft, saveDraft, timer]);

  // History management
  const setExercisesWithHistory = useCallback((newExercises: WorkoutExercise[] | ((prev: WorkoutExercise[]) => WorkoutExercise[])) => {
    setExercises(prev => {
      const newValue = typeof newExercises === 'function' ? newExercises(prev) : newExercises;
      setHistory(prevHistory => [...prevHistory, prev]);
      setCanUndo(true);
      return newValue;
    });
  }, []);

  // Actions
  const startWorkout = useCallback((newExercises: WorkoutExercise[]) => {
    // Initialize or update loadedDraft to ensure consistent draft ID across saves
    const draftId = loadedDraft?.id || `draft-${Date.now()}`;
    const initialDraft: DraftSession = {
      id: draftId,
      version: DRAFT_SESSION_VERSION,
      createdAt: loadedDraft?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: routineDay
        ? {
            type: "routine" as const,
            routineId: routineDay.routineId ?? undefined,
            routineDayId: routineDay.id ?? undefined,
            routineDayName: routineDay.name ?? undefined,
          }
        : { type: "free" },
      timer: {
        startDate: new Date().toISOString(),
        elapsedTime: 0,
      },
      exercises: newExercises,
      sessionNotes: "",
      activeExerciseId: null,
      lastCompletedSetId: null,
    };

    setLoadedDraft(initialDraft);
    setExercises(newExercises);
    setHistory([]);
    setCanUndo(false);
    timer.start(new Date());
    setDraftStatus("active");
  }, [timer, routineDay]);

  const cancelWorkout = useCallback(() => {
    setExercises([]);
    setSessionNotes("");
    timer.reset();
    setHistory([]);
    setCanUndo(false);
    setDraftStatus("idle");
  }, [timer]);

  const recoverDraft = useCallback(() => {
    // Use loadedDraft directly instead of calling getDraft() again
    // loadedDraft was already set by the mount effect
    if (loadedDraft) {
      setExercises(loadedDraft.exercises);
      setSessionNotes(loadedDraft.sessionNotes || "");
      // Resume timer from draft if available
      if (loadedDraft.timer?.startDate) {
        timer.start(new Date(loadedDraft.timer.startDate));
      }
      setDraftStatus("active");
      // Clear the recovered flag so modal doesn't show again
      setIsRecoveredDraft(false);
    } else {
      // Fallback: try to load from localStorage directly
      const draft = getDraft();
      if (draft) {
        setLoadedDraft(draft);
        setExercises(draft.exercises);
        setSessionNotes(draft.sessionNotes || "");
        // Resume timer from draft if available
        if (draft.timer?.startDate) {
          timer.start(new Date(draft.timer.startDate));
        }
        setDraftStatus("active");
        // Clear the recovered flag so modal doesn't show again
        setIsRecoveredDraft(false);
      } else {
        setDraftStatus("idle");
      }
    }
  }, [getDraft, loadedDraft, timer]);

  const discardDraft = useCallback(() => {
    clearDraft();
    setLoadedDraft(null);
    setIsRecoveredDraft(false);
    
    // When discarding a draft, automatically start a new session
    // For free workout: start empty session
    // For routine workout: start session with routine exercises
    if (!routineDay) {
      // Start a new empty free workout session immediately
      const newDraft: DraftSession = {
        id: `draft-${Date.now()}`,
        version: DRAFT_SESSION_VERSION,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: { type: "free" },
        timer: {
          startDate: new Date().toISOString(),
          elapsedTime: 0,
        },
        exercises: [],
        sessionNotes: "",
        activeExerciseId: null,
        lastCompletedSetId: null,
      };
      setLoadedDraft(newDraft);
      setExercises([]);
      timer.start(new Date());
      setDraftStatus("active");
    } else {
      // For routine workouts, build exercises from the routine and start immediately
      // This avoids timing issues with page navigation that could cause the modal to reappear
      // Pre-fill with last session data if available
      const workoutExercises: WorkoutExercise[] = routineDay.items.map(
        (item) => {
          // Get last session data for this exercise
          const lastData = lastSessionDataByExercise.get(item.exercise.id);
          const defaultWeight = lastData?.weightKg ?? 0;
          const defaultReps = lastData?.repsDone ?? 0;

          return {
            id: item.exercise.id,
            name: item.exercise.name,
            targetSeries: item.series,
            targetReps: item.reps,
            notes: item.notes ?? undefined,
            sets: Array.from({ length: item.series }, (_, i) => ({
              id: `set-${item.exercise.id}-${i + 1}`,
              exerciseId: item.exercise.id,
              exerciseName: item.exercise.name,
              setNumber: i + 1,
              targetReps: item.reps,
              repsDone: defaultReps,
              weightKg: defaultWeight,
              rpe: undefined,
              notes: "",
              completed: false,
            })),
          };
        }
      );
      
      const newDraft: DraftSession = {
        id: `draft-${Date.now()}`,
        version: DRAFT_SESSION_VERSION,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: {
          type: "routine" as const,
          routineId: routineDay.routineId ?? undefined,
          routineDayId: routineDay.id ?? undefined,
          routineDayName: routineDay.name ?? undefined,
        },
        timer: {
          startDate: new Date().toISOString(),
          elapsedTime: 0,
        },
        exercises: workoutExercises,
        sessionNotes: "",
        activeExerciseId: null,
        lastCompletedSetId: null,
      };
      
      setLoadedDraft(newDraft);
      setExercises(workoutExercises);
      timer.start(new Date());
      setDraftStatus("active");
    }
  }, [clearDraft, routineDay, timer]);

  const undoLastChange = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.length === 0) return prevHistory;
      
      const previousState = prevHistory[prevHistory.length - 1];
      setExercises(previousState);
      setCanUndo(prevHistory.length > 1);
      return prevHistory.slice(0, -1);
    });
  }, []);

  const finishWorkout = async (
    notes: string
  ): Promise<CommitSessionResult> => {
    if (!timer.startDate) {
      const errorMsg = "Workout has not started";
      console.error(errorMsg);
      return {
        success: false,
        error: errorMsg,
        code: "VALIDATION_ERROR",
      };
    }

    setDraftStatus("committing");

    const finishedAt = new Date();
    const payload: CommitSessionPayload = {
      startedAt: timer.startDate,
      finishedAt: finishedAt,
      durationSeconds: (finishedAt.getTime() - timer.startDate.getTime()) / 1000,
      routineId: routineDay?.routineId,
      notes: notes,
      exercises: exercises
        .filter((ex: WorkoutExercise) => ex.sets.some((set: SetEntry) => set.completed))
        .map((ex: WorkoutExercise, index: number): CommitWorkoutExercisePayload => ({
          exerciseId: ex.id,
          order: index,
          notes: ex.notes ?? undefined,
          sets: ex.sets
            .filter((set: SetEntry) => set.completed)
            .map((set: SetEntry) => ({
              exerciseId: set.exerciseId,
              setNumber: set.setNumber,
              repsDone: set.repsDone,
              weightKg: set.weightKg,
              rpe: set.rpe ?? undefined,
              notes: set.notes ?? undefined,
            })),
        })),
    };

    const result = await commitWorkoutSession(payload);

    if (result.success) {
      clearDraft();
      // Reset state
      setExercises([]);
      setSessionNotes("");
      timer.reset();
      setHistory([]);
      setCanUndo(false);
      setDraftStatus("idle");
    } else {
      // On failure, allow user to try again
      setDraftStatus("active");
    }

    return result;
  };

  const addExercise = (
    exerciseId: number,
    targetSeries = 3,
    lastSessionData?: { weightKg: number; repsDone: number } | null
  ) => {
    const exerciseToAdd = availableExercises.find((ex: Exercise) => ex.id === exerciseId);
    if (!exerciseToAdd) throw new Error("Exercise not found");

    const defaultWeight = lastSessionData?.weightKg ?? 0;
    const defaultReps = lastSessionData?.repsDone ?? 0;

    const newWorkoutExercise: WorkoutExercise = {
      id: exerciseToAdd.id,
      name: exerciseToAdd.name,
      targetSeries: targetSeries,
      targetReps: "8-12",
      sets: Array.from({ length: targetSeries }, (_, i: number) => ({
        id: `set-${exerciseToAdd.id}-${i + 1}-${Date.now()}`,
        exerciseId: exerciseToAdd.id,
        exerciseName: exerciseToAdd.name,
        setNumber: i + 1,
        repsDone: defaultReps,
        weightKg: defaultWeight,
        completed: false,
      })),
    };

    setExercisesWithHistory((prev) => [...prev, newWorkoutExercise]);
  };

  const removeExercise = (exerciseId: number) => {
    setExercisesWithHistory((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === exercises.length - 1)
    )
      return;

    setExercisesWithHistory((prev) => {
      const newExercises = [...prev];
      const exerciseToMove = newExercises[index];
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      newExercises[index] = newExercises[swapIndex];
      newExercises[swapIndex] = exerciseToMove;
      return newExercises;
    });
  };

  const updateSet = (
    exerciseId: number,
    setId: string,
    updates: Partial<SetEntry>
  ) => {
    setExercisesWithHistory((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set: SetEntry) =>
                set.id === setId ? { ...set, ...updates } : set
              ),
            }
          : exercise
      )
    );

    if (updates.completed === true) {
      restTimer.start();
    }
  };

  const addSet = (exerciseId: number) => {
    setExercisesWithHistory((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        const newSetNumber = exercise.sets.length + 1;
        const newSet: SetEntry = {
          id: `set-${exerciseId}-${newSetNumber}-${Date.now()}`,
          exerciseId: exerciseId,
          exerciseName: exercise.name,
          setNumber: newSetNumber,
          repsDone: 0,
          weightKg: 0,
          completed: false,
        };
        return { ...exercise, sets: [...exercise.sets, newSet] };
      })
    );
  };

  const removeSet = (exerciseId: number, setId: string) => {
    setExercisesWithHistory((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            }
          : exercise
      )
    );
  };

  // --- Initializer ---
  // IMPORTANT: This effect runs when draftStatus changes. We need to be careful
  // about the order of operations with the mount effect that detects existing drafts.
  // The mount effect sets draftStatus to "recovering" when it finds a draft,
  // so we should only initialize when draftStatus is "idle" AND there's no draft
  // in localStorage AND no loaded draft in memory.
  useEffect(
    function initializeExercisesFromRoutine() {
      // CRITICAL: Never initialize if we're in the middle of recovering a draft
      // or if there's already a loaded draft in memory
      if (draftStatus !== "idle") return;
      if (loadedDraft) return;
      
      // Don't initialize if there's an existing draft in localStorage
      // This check prevents the initializer from starting a new workout
      // when there's a draft that should be recovered
      const existingDraft = getDraft();
      if (existingDraft) return;
      
      if (routineDay) {
        // Initialize from routine - pre-fill with last session data if available
        const workoutExercises: WorkoutExercise[] = routineDay.items.map(
          (item) => {
            // Get last session data for this exercise
            const lastData = lastSessionDataByExercise.get(item.exercise.id);
            const defaultWeight = lastData?.weightKg ?? 0;
            const defaultReps = lastData?.repsDone ?? 0;

            return {
              id: item.exercise.id,
              name: item.exercise.name,
              targetSeries: item.series,
              targetReps: item.reps,
              notes: item.notes ?? undefined,
              sets: Array.from({ length: item.series }, (_, i) => ({
                id: `set-${item.exercise.id}-${i + 1}`,
                exerciseId: item.exercise.id,
                exerciseName: item.exercise.name,
                setNumber: i + 1,
                targetReps: item.reps,
                repsDone: defaultReps,
                weightKg: defaultWeight,
                rpe: undefined,
                notes: "",
                completed: false,
              })),
            };
          }
        );
        startWorkout(workoutExercises);
      } else if (isFreeWorkoutProp) {
        // Initialize free workout session (empty, user will add exercises)
        startWorkout([]);
      }
    },
    [routineDay, draftStatus, isFreeWorkoutProp, getDraft, loadedDraft]
  );

  const contextValue = {
    // State
    exercises,
    availableExercises,
    routineDay,
    timer: {
      elapsedTime: timer.elapsedTime,
      isActive: timer.isActive,
      startDate: timer.startDate,
    },
    restTimer,
    sessionNotes,
    // Draft
    draftStatus,
    loadedDraft,
    isRecoveredDraft,
    // Undo
    canUndo,
    // Actions
    actions: {
      // Old actions to be removed/refactored
      adjustReps: () => {},
      adjustWeight: () => {},
      addAvailableExercise: () => {},
      // Draft actions
      saveDraft: (draft: DraftSession) => saveDraft(draft),
      // New/refactored actions
      startWorkout,
      finishWorkout,
      cancelWorkout,
      recoverDraft,
      discardDraft,
      addExercise,
      removeExercise,
      moveExercise,
      updateSet,
      addSet,
      removeSet,
      undoLastChange,
      setSessionNotes,
    },
  };

  return (
    <WorkoutSessionContext.Provider value={contextValue}>
      {children}
    </WorkoutSessionContext.Provider>
  );
}

export default WorkoutSessionProvider;
