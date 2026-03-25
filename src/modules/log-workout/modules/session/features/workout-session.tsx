"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@core/components/ui/card";
import { Button } from "@core/components/ui/button";
import { Textarea } from "@core/components/ui/textarea";
import { Square, ArrowLeft, Clock, SkipForward, Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@core/components/ui/sidebar";
import { WorkoutExercise } from "@core/types";
import {
  useWorkoutSessionContext,
  useWorkoutSessionActions,
} from "../contexts/WorkoutSessionContext";
import WorkoutExerciseItem from "../components/WorkoutExerciseItem";
import { WorkoutExerciseCompactItem } from "../components/WorkoutExerciseCompactItem";
import AddExerciseToWorkout, { LastSessionData } from "../components/AddExerciseToWorkout";
import formatTime from "@core/lib/utils/formatters/formatTime";
import { toast } from "sonner";
import { DraftRecoveryModal } from "../components/DraftRecoveryModal";
import { getLastSessionForExercise } from "@modules/log-workout/actions/log-workout.actions";

// Clean loading state component - visual only, no text
function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="relative">
        {/* Outer ring */}
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary" />
        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-primary animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function WorkoutSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lastSessionDataByExercise, setLastSessionDataByExercise] = useState<Map<number, LastSessionData>>(new Map());
  
  // Unified loading state - true until we know the final state
  // This replaces the confusing multiple loading states
  const [isLoading, setIsLoading] = useState(true);

  const {
    exercises,
    routineDay,
    timer,
    restTimer,
    sessionNotes,
    draftStatus,
    loadedDraft,
    isRecoveredDraft,
    canUndo,
    availableExercises,
  } = useWorkoutSessionContext();

  // Check if we should auto-recover (navigated from "Reanudar sesión activa" button)
  const shouldAutoRecover = searchParams.get("recover") === "true";
  // Check if user is trying to start a new session despite having an existing draft
  const isForcingNew = searchParams.get("forceNew") === "true";

  // CRITICAL: All hooks must be declared BEFORE any useEffect that uses them
  // Move useWorkoutSessionActions here, before any useEffect
  const {
    finishWorkout,
    moveExercise,
    removeExercise,
    addExercise,
    updateSet,
    addSet,
    removeSet,
    undoLastChange,
    setSessionNotes,
    recoverDraft,
    discardDraft,
    startWorkout,
  } = useWorkoutSessionActions();

  // Use ref to track auto-recovery to avoid hooks order issues
  const hasAutoRecoveredRef = useRef(false);

  // Show modal when:
  // 1. We have a recovered draft (isRecoveredDraft = true, meaning it came from localStorage)
  //    AND user is NOT auto-recovering (navigated with ?recover=true)
  // OR
  // 2. User is forcing a new session (?forceNew=true) but there's an existing draft
  const shouldShowRecoveryModal = (isRecoveredDraft && !shouldAutoRecover) || (isForcingNew && isRecoveredDraft);

  // Unified loading logic: wait for Provider to determine state before showing anything
  // CRITICAL: Keep showing loading while Provider is determining if there's a draft
  // BUT: If we should show the recovery modal, we need to show it even during "recovering" state
  // This prevents the flash of "No hay entrenamiento activo" before the draft is detected
  useEffect(() => {
    // If we should show the recovery modal, don't show loading - show the modal instead
    if (shouldShowRecoveryModal) {
      setIsLoading(false);
      return;
    }
    // Only exit loading when we have a definitive state:
    // - "idle" means no draft exists (confirmed by Provider)
    // - "active" means draft was recovered successfully
    // - "recovering" means draft was found but NOT yet recovered - KEEP LOADING (unless modal should show)
    if (/* draftStatus === "idle" || */ draftStatus === "active") {
      const timer = setTimeout(() => setIsLoading(false), 100);
      return () => clearTimeout(timer);
    }
    // If draftStatus is "recovering", keep showing loading until it's resolved
  }, [draftStatus, shouldShowRecoveryModal]);

  // Fetch last session data for all available exercises on mount
  useEffect(() => {
    if (availableExercises.length === 0) return;

    const fetchLastSessionData = async () => {
      const newMap = new Map<number, LastSessionData>();
      
      // Fetch in parallel for all exercises
      const promises = availableExercises.map(async (exercise) => {
        try {
          const data = await getLastSessionForExercise(exercise.id);
          if (data) {
            newMap.set(exercise.id, {
              weightKg: data.weightKg,
              repsDone: data.repsDone,
            });
          }
        } catch (error) {
          // Silently fail - we don't want to block the UI
          console.warn(`Failed to fetch last session for exercise ${exercise.id}`, error);
        }
      });

      await Promise.all(promises);
      setLastSessionDataByExercise(newMap);
    };

    fetchLastSessionData();
  }, [availableExercises]);

  // Auto-recover draft when navigating from dashboard with ?recover=true
  useEffect(() => {
    if (draftStatus === "recovering" && shouldAutoRecover && loadedDraft && !hasAutoRecoveredRef.current) {
      // Automatically recover without showing modal
      recoverDraft();
      hasAutoRecoveredRef.current = true;
    }
  }, [draftStatus, shouldAutoRecover, loadedDraft, recoverDraft]);

  const handleFinishWorkout = () => {
    const allCompleted = exercises.every((ex) =>
      ex.sets.every((set) => set.completed)
    );
    if (!allCompleted) {
      toast.error("No has completado todos los ejercicios.");
      return;
    }

    finishWorkout(sessionNotes).then((result) => {
      if (result?.success) {
        toast.success("Sesión guardada con éxito");
        router.push("/log-workout");
      } else {
        toast.error(
          `Error al guardar: ${result?.error || "Error desconocido"}`
        );
      }
    });
  };

  const isExerciseCompleted = (exercise: WorkoutExercise) =>
    exercise.sets.every((set) => set.completed);
  const isExerciseStarted = (exercise: WorkoutExercise) =>
    exercise.sets.some((set) => set.completed);

  const sortedExercises = useMemo(() => {
    return [...exercises].sort((a, b) => {
      const aCompleted = isExerciseCompleted(a);
      const bCompleted = isExerciseCompleted(b);
      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;
      return 0;
    });
  }, [exercises]);

  const activeExerciseIndex = useMemo(() => {
    const firstIncomplete = sortedExercises.findIndex(
      (ex) => !isExerciseCompleted(ex)
    );
    return firstIncomplete === -1 ? 0 : firstIncomplete;
  }, [sortedExercises]);

  const nextExercise = sortedExercises[activeExerciseIndex + 1];

  // IMPORTANT: All hooks must be called BEFORE any return statement
  // Now we can safely return based on state conditions

  // Show modal when:
  // 1. We have a recovered draft (isRecoveredDraft = true, meaning it came from localStorage)
  //    AND user is NOT auto-recovering (navigated with ?recover=true)
  // OR
  // 2. User is forcing a new session (?forceNew=true) but there's an existing draft
  // 
  // This prevents showing the modal when:
  // - User starts a new session (no existing draft in localStorage)
  // - startWorkout creates a new draft internally (isRecoveredDraft stays false)
  // 
  // NOTE: We show the modal EVEN during loading to handle the case where user
  // wants to start new but there's an existing draft
  
  if (shouldShowRecoveryModal) {
    // When user clicks "Discard" and they were trying to start a new session,
    // we need to start a new session instead of just discarding
    const handleDiscardAndNew = () => {
      // discardDraft now handles starting the new workout directly (for both free and routine)
      // No navigation needed - the state is updated in place
      discardDraft();
    };

    return (
      <DraftRecoveryModal
        draft={loadedDraft}
        onRecover={recoverDraft}
        onDiscard={isForcingNew ? handleDiscardAndNew : discardDraft}
      />
    );
  }

  // Unified loading state - single clean loader without text
  // This prevents the confusing sequence of multiple loading messages
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Only show "No hay entrenamiento activo" after we've confirmed no draft exists
  if (exercises.length === 0 && draftStatus === "idle") {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-bold">No hay entrenamiento activo</h2>
        <p className="text-muted-foreground">
          Selecciona una rutina o inicia un entrenamiento libre.
        </p>
        <Button asChild className="mt-4">
          <Link href="/log-workout">Volver al dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card border-border">
        <div className="flex items-center justify-between p-2 sm:p-4">
          <div className="flex items-center">
            <SidebarTrigger className="-ml-1" />
            <Button variant="ghost" size="sm" asChild className="w-9 h-9 sm:w-10 sm:h-10 p-0">
              <Link href="/log-workout">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
          </div>
          <div className="text-center min-w-0 px-2">
            <h1 className="text-base sm:text-lg font-bold truncate">
              {routineDay ? routineDay.name : "Entrenamiento Libre"}
            </h1>
            <div className="font-mono text-xs sm:text-sm text-muted-foreground">
              {formatTime(timer.elapsedTime)}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {timer.startDate && (
              <Button
                variant="destructive"
                onClick={handleFinishWorkout}
                size="lg"
                className="h-10 w-10 sm:h-12 sm:w-auto sm:px-4 p-0 sm:py-0"
              >
                <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline sm:ml-2">Finalizar</span>
              </Button>
            )}
          </div>
        </div>
        {restTimer.isResting && (
          <div className="p-3 sm:p-4 text-center bg-primary text-primary-foreground animate-pulse">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-mono font-bold">
                Descanso: {formatTime(restTimer.restTimer)}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => restTimer.stop()}
                className="ml-2 h-8"
              >
                <SkipForward className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Saltar</span>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="p-3 sm:p-4 pb-24 sm:pb-20 space-y-3 sm:space-y-4">
        {/* Empty state for free workout */}
        {exercises.length === 0 && (
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="py-6 sm:py-8 text-center">
              <p className="text-base sm:text-lg font-medium text-muted-foreground mb-2">
                Sesión de entrenamiento en curso
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Agrega tu primer ejercicio para comenzar
              </p>
            </CardContent>
          </Card>
        )}

        {sortedExercises.map((exercise, index) => {
          const originalIndex = exercises.findIndex((e) => e.id === exercise.id);
          const isActive = index === activeExerciseIndex;

          return (
            <WorkoutExerciseItem
              key={exercise.id}
              exercise={exercise}
              exerciseIndex={originalIndex}
              isLastItem={index === sortedExercises.length - 1}
              isActive={isActive}
              completedSets={exercise.sets.filter((s) => s.completed).length}
              totalSets={exercise.sets.length}
              canUndo={canUndo}
              onUpdateSet={(setId, updates) => updateSet(exercise.id, setId, updates)}
              onAddSet={() => addSet(exercise.id)}
              onRemoveSet={(setId) => removeSet(exercise.id, setId)}
              onMoveUp={() => moveExercise(originalIndex, "up")}
              onMoveDown={() => moveExercise(originalIndex, "down")}
              onRemove={() => removeExercise(exercise.id)}
              onUndo={undoLastChange}
            />
          );
        })}

        {nextExercise && (
          <Card className="border-dashed opacity-70">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">
                Siguiente: {nextExercise.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {nextExercise.targetSeries} series
              </p>
            </CardHeader>
          </Card>
        )}

        <AddExerciseToWorkout
          availableExercises={availableExercises.filter(
            (e) => !exercises.some((ex) => ex.id === e.id)
          )}
          lastSessionData={lastSessionDataByExercise}
          onCreateExercise={() => {
            /* TODO */
          }}
          onAddExercise={addExercise}
        />

        <Card>
          <CardHeader>
            <CardTitle>Notas de la Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="¿Cómo te sentiste hoy? ¿Alguna observación?"
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
