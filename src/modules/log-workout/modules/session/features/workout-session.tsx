"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/components/ui/card";
import { Button } from "@core/components/ui/button";
import { Textarea } from "@core/components/ui/textarea";

import { Play, Square, ArrowLeft, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@core/components/ui/sidebar";
import { WorkoutExercise } from "@core/types";
import { useWorkoutSessionContext, useWorkoutSessionActions } from "../contexts/WorkoutSessionContext";
import WorkoutExerciseItem from "../components/WorkoutExerciseItem";
import { WorkoutExerciseCompactItem } from "../components/WorkoutExerciseCompactItem";
import AddExerciseToWorkout from "../components/AddExerciseToWorkout";
import formatTime from "@core/lib/utils/formatters/formatTime";
import { toast } from "sonner";

// // Define a more specific type for RoutineDay based on the prisma query

interface WorkoutSessionClientProps {}

export function WorkoutSession({}: WorkoutSessionClientProps) {
  const router = useRouter();
  const {
    actions: { addAvailableExercise, addExercise, startWorkout, finishWorkout },
    availableExercises,
    timer,
    exercises,
    routineDay,
    restTimer: { isResting, restTimer, stop: stopRestTimer },
  } = useWorkoutSessionContext();
  const { moveExercise, removeExercise } = useWorkoutSessionActions();

  // const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionNotes, setSessionNotes] = useState("");

  const handleFinishWorkout = () => {
    // verificar que todos los ejercicios esten completados
    if (!exercises.every((ex) => ex.sets.every((set) => set.completed))) {
      toast.error("No has completado todos los ejercicios");
      return;
    }

    finishWorkout(sessionNotes).then(() => {
      router.push("/log-workout");
    });
  };

  // #region --- NEW LOGIC FOR SORTING AND DISPLAY ---
  const isExerciseCompleted = (exercise: WorkoutExercise) => exercise.sets.every((set) => set.completed);
  const isExerciseStarted = (exercise: WorkoutExercise) => exercise.sets.some((set) => set.completed);

  const sortedExercises = useMemo(() => {
    return [...exercises].sort((a, b) => {
      const aCompleted = isExerciseCompleted(a);
      const bCompleted = isExerciseCompleted(b);
      const aStarted = isExerciseStarted(a);
      const bStarted = isExerciseStarted(b);

      if (aCompleted && !bCompleted) return -1;
      if (!aCompleted && bCompleted) return 1;

      if (aStarted && !bStarted) return -1;
      if (!aStarted && bStarted) return 1;

      return 0; // Mantener el orden original si el estado es el mismo
    });
  }, [exercises]);

  const activeExerciseIndex = useMemo(() => {
    const anyExerciseStarted = sortedExercises.some(isExerciseStarted);
    if (!anyExerciseStarted) {
      // Si nada ha comenzado, el primer ejercicio es el activo
      return sortedExercises.length > 0 ? 0 : -1;
    }
    // El activo es el primero que no está completamente terminado
    return sortedExercises.findIndex((ex) => !isExerciseCompleted(ex));
  }, [sortedExercises]);
  // #endregion --- END OF NEW LOGIC ---

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card border-border">
        <div className="flex items-center justify-between p-4">
          <div>
            <SidebarTrigger className="-ml-1" />
            <Button variant="ghost" size="sm" asChild className="w-10 h-10 p-0">
              <Link href="/log-workout">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold">{routineDay ? routineDay.name : "Entrenamiento Libre"}</h1>
              <div className="font-mono text-sm text-muted-foreground">{formatTime(timer.elapsedTime)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!timer.isActive && !timer.startDate && (
              <Button onClick={startWorkout} size="lg" className="h-12 px-6">
                <Play className="w-5 h-5 mr-2" />
                Iniciar
              </Button>
            )}

            {timer.startDate && (
              <Button variant="destructive" onClick={handleFinishWorkout} size="lg" className="h-12 px-4">
                <Square className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {isResting && (
          <div className="p-4 text-center bg-primary text-primary-foreground">
            <div className="flex items-center justify-center gap-3">
              <Clock className="w-5 h-5" />
              <div>
                <div className="text-lg font-bold">{formatTime(restTimer)}</div>
                <div className="text-sm opacity-90">Tiempo de descanso</div>
              </div>
              <Button variant="secondary" size="sm" onClick={stopRestTimer} className="ml-4">
                Finalizar
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="p-4 pb-20 space-y-4">
        {sortedExercises.map((exercise, index) => {
          const isCompleted = isExerciseCompleted(exercise);
          // El índice para las acciones debe ser el del array original, no el del ordenado
          const originalIndex = exercises.findIndex((e) => e.id === exercise.id);

          if (index === activeExerciseIndex) {
            return (
              <WorkoutExerciseItem
                key={exercise.id}
                exercise={exercise}
                exerciseIndex={originalIndex}
                isLastItem={index === sortedExercises.length - 1}
              />
            );
          }
          return (
            <WorkoutExerciseCompactItem
              key={exercise.id}
              exercise={exercise}
              isCompleted={isCompleted}
              isLastItem={index === sortedExercises.length - 1}
              onMoveUp={() => moveExercise(originalIndex, "up")}
              onMoveDown={() => moveExercise(originalIndex, "down")}
              onRemove={() => removeExercise(exercise.id)}
            />
          );
        })}

        <AddExerciseToWorkout
          availableExercises={availableExercises.filter((e) => !exercises.some((ex) => ex.id === e.id))}
          onCreateExercise={addAvailableExercise}
          onAddExercise={addExercise}
        />

        {/* Session Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notas de la Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="¿Cómo te sentiste hoy? ¿Alguna observación sobre el entrenamiento?"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={4}
              className="text-base"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
