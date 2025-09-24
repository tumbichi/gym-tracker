"use client";

import React, { PropsWithChildren, useEffect, useState } from "react";
import WorkoutSessionContext from ".";
import { Exercise, RoutineDay as PrismaRoutineDay, RoutineExercise } from "@prisma/client";
import { SetEntry, WorkoutExercise } from "@core/types";
import { saveWorkoutSession } from "@app/actions/workoutActions";
import useRestTimer from "../../hooks/useRestTimer";
import useTimer from "../../hooks/useElapsedTime";

type RoutineDay = PrismaRoutineDay & {
  items: (RoutineExercise & {
    exercise: Exercise;
  })[];
};

interface WorkoutSessionProviderProps extends PropsWithChildren {
  routineDay?: RoutineDay | null;
  initialAvailableExercises: Exercise[];
}

function WorkoutSessionProvider({ children, initialAvailableExercises, routineDay }: WorkoutSessionProviderProps) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>(initialAvailableExercises);
  const timer = useTimer();
  const restTimer = useRestTimer();

  const startWorkout = () => {
    timer.start(new Date());
  };
  const finishWorkout = async (sessionNotes: string) => {
    const completedSets = exercises.flatMap((ex) => ex.sets.filter((set) => set.completed));

    if (!timer.startDate) {
      console.error("Workout has not started");
      return;
    }

    await saveWorkoutSession({
      startTime: timer.startDate,
      notes: sessionNotes,
      routineId: routineDay?.routineId,
      setEntries: completedSets.map((set: SetEntry) => ({
        exerciseId: set.exerciseId,
        setNumber: set.setNumber,
        repsDone: set.repsDone,
        weightKg: set.weightKg,
        rpe: set.rpe,
        notes: set.notes ?? undefined,
      })),
    });
  };

  const addAvailableExercise = (newExercise: Exercise) => setAvailableExercises((prev) => [...prev, newExercise]);

  const addExercise = (exerciseId: number, targetSeries = 3) => {
    const exerciseToAdd = availableExercises.find((ex) => ex.id === exerciseId);
    if (!exerciseToAdd) throw new Error("Exercise not found");

    const newWorkoutExercise: WorkoutExercise = {
      id: exerciseToAdd.id,
      name: exerciseToAdd.name,
      targetSeries: targetSeries,
      targetReps: "8-12",
      sets: Array.from({ length: targetSeries }, (_, i) => ({
        id: `set-${exerciseToAdd.id}-${i + 1}-${Date.now()}`,
        exerciseId: exerciseToAdd.id,
        exerciseName: exerciseToAdd.name,
        setNumber: i + 1,
        repsDone: 0,
        weightKg: 0,
        completed: false,
      })),
    };

    setExercises((prev) => [...prev, newWorkoutExercise]);
  };

  const adjustReps = (exerciseId: number, setId: string, increment: number) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set: SetEntry) =>
                set.id === setId ? { ...set, repsDone: Math.max(0, set.repsDone + increment) } : set
              ),
            }
          : exercise
      )
    );
  };

  const adjustWeight = (exerciseId: number, setId: string, increment: number) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set: SetEntry) =>
                set.id === setId ? { ...set, weightKg: Math.max(0, set.weightKg + increment) } : set
              ),
            }
          : exercise
      )
    );
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === exercises.length - 1) return;

    const newExercises = [...exercises];
    const exerciseToMove = newExercises[index];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    newExercises[index] = newExercises[swapIndex];
    newExercises[swapIndex] = exerciseToMove;
    setExercises(newExercises);
  };

  const removeExercise = (exerciseId: number) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const updateSet = (exerciseId: number, setId: string, updates: Partial<SetEntry>) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set: SetEntry) => (set.id === setId ? { ...set, ...updates } : set)),
            }
          : exercise
      )
    );

    if (updates.completed === true) {
      restTimer.start();
    }
  };

  useEffect(
    function initializeExercisesFromRoutine() {
      if (routineDay) {
        const workoutExercises: WorkoutExercise[] = routineDay.items.map((item) => {
          const repsArray = item.reps
            ? String(item.reps)
                .split("-")
                .map((r) => Number.parseInt(r.trim()))
            : [];

          return {
            id: item.exercise.id,
            name: item.exercise.name,
            targetSeries: item.series,
            targetReps: item.reps,
            targetWeight: item.targetWeight || undefined,
            notes: item.notes || "",
            sets: Array.from({ length: item.series }, (_, i) => {
              let repsForSet = 0;
              if (repsArray.length > 1) {
                repsForSet = repsArray[i] || 0;
              } else if (repsArray.length === 1) {
                repsForSet = repsArray[0] || 0;
              }

              return {
                id: `set-${item.exercise.id}-${i + 1}`,
                exerciseId: item.exercise.id,
                exerciseName: item.exercise.name,
                setNumber: i + 1,
                targetReps: item.reps,
                targetWeight: item.targetWeight || undefined,
                repsDone: repsForSet,
                weightKg: item.targetWeight || 0,
                rpe: undefined,
                notes: "",
                completed: false,
              };
            }),
          };
        });
        setExercises(workoutExercises);
      }
    },
    [routineDay]
  );

  return (
    <WorkoutSessionContext.Provider
      value={{
        actions: {
          addAvailableExercise,
          addExercise,
          adjustReps,
          adjustWeight,
          finishWorkout,
          moveExercise,
          removeExercise,
          startWorkout,
          updateSet,
        },
        availableExercises,
        timer: { elapsedTime: timer.elapsedTime, isActive: timer.isActive, startDate: timer.startDate },
        exercises,
        restTimer,
        routineDay,
      }}
    >
      {children}
    </WorkoutSessionContext.Provider>
  );
}

export default WorkoutSessionProvider;
