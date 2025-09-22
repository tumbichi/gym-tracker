"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader as ConfirmationDialogHeader,
  AlertDialogTitle as ConfirmationDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Play, Pause, Square, Plus, Check, X, Timer, ArrowLeft, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveWorkoutSession } from "@/app/actions/workoutActions";
import { ExerciseForm } from "@/components/exercise-form";
import { Exercise } from "@prisma/client";

export interface SetEntry {
  id: string;
  exerciseId: number;
  exerciseName: string;
  setNumber: number;
  targetReps?: string;
  targetWeight?: number;
  repsDone: number;
  weightKg: number;
  rpe?: number;
  notes?: string;
  completed: boolean;
}

export interface WorkoutExercise {
  id: number;
  name: string;
  targetSeries: number;
  targetReps: string;
  targetWeight?: number;
  notes?: string;
  sets: SetEntry[];
}

export function WorkoutSessionClient({
  initialExercises,
  allExercises: initialAllExercises,
  routineId,
  dayId,
}: {
  initialExercises: WorkoutExercise[];
  allExercises: Exercise[];
  routineId?: number;
  dayId?: number;
}) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exercises, setExercises] = useState<WorkoutExercise[]>(initialExercises);
  const [allExercises, setAllExercises] = useState<Exercise[]>(initialAllExercises);
  const [sessionNotes, setSessionNotes] = useState("");
  const [isAddExerciseDrawerOpen, setIsAddExerciseDrawerOpen] = useState(false);
  const [isCreateExerciseDialogOpen, setIsCreateExerciseDialogOpen] = useState(false);
  const [newExerciseSets, setNewExerciseSets] = useState(3);
  const [search, setSearch] = useState("");

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const startWorkout = () => {
    setIsActive(true);
    setStartTime(new Date());
  };

  const pauseWorkout = () => {
    setIsActive(false);
  };

  const finishWorkout = async () => {
    const completedSets = exercises.flatMap((ex) => ex.sets.filter((set) => set.completed));

    await saveWorkoutSession({
      startTime: startTime!,
      routineId: routineId,
      notes: sessionNotes,
      setEntries: completedSets.map((s) => ({ ...s, rpe: s.rpe ? Number(s.rpe) : undefined })),
    });

    router.push("/log-workout");
  };

  const updateSet = (exerciseId: number, setId: string, updates: Partial<SetEntry>) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) => (set.id === setId ? { ...set, ...updates } : set)),
            }
          : exercise
      )
    );
  };

  const handleAddExercise = (exerciseId: number) => {
    const exerciseToAdd = allExercises.find((ex) => ex.id === exerciseId);
    if (!exerciseToAdd) return;

    const newWorkoutExercise: WorkoutExercise = {
      id: exerciseToAdd.id,
      name: exerciseToAdd.name,
      targetSeries: newExerciseSets,
      targetReps: "8-12", // Default reps
      sets: Array.from({ length: newExerciseSets }, (_, i) => ({
        id: `set-${exerciseToAdd.id}-${i + 1}`,
        exerciseId: exerciseToAdd.id,
        exerciseName: exerciseToAdd.name,
        setNumber: i + 1,
        repsDone: 0,
        weightKg: 0,
        completed: false,
      })),
    };

    setExercises((prev) => [...prev, newWorkoutExercise]);
    setIsAddExerciseDrawerOpen(false);
    setNewExerciseSets(3);
    setSearch("");
  };

  const handleExerciseCreated = (newExercise: Exercise) => {
    setAllExercises((prev) => [...prev, newExercise]);
    handleAddExercise(newExercise.id);
    setIsCreateExerciseDialogOpen(false);
  };

  const removeExercise = (exerciseId: number) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
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

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center h-16 gap-2 px-4 border-b shrink-0">
        <SidebarTrigger className="-ml-1" />
        <Button variant="ghost" size="sm" asChild className="bg-transparent">
          <Link href="/log-workout">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5" />
          <h1 className="text-lg font-semibold">Sesión de Entrenamiento</h1>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="secondary" className="font-mono">
            {formatTime(elapsedTime)}
          </Badge>
          {!isActive && !startTime && (
            <Button onClick={startWorkout}>
              <Play className="w-4 h-4 mr-2" />
              Iniciar
            </Button>
          )}
          {isActive && (
            <Button variant="outline" onClick={pauseWorkout} className="bg-transparent">
              <Pause className="w-4 h-4 mr-2" />
              Pausar
            </Button>
          )}
          {startTime && (
            <Button variant="destructive" onClick={finishWorkout}>
              <Square className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {exercises.map((exercise, exerciseIndex) => (
          <Card key={exercise.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{exercise.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {exercise.sets.filter((s) => s.completed).length}/{exercise.sets.length} series
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveExercise(exerciseIndex, "up")}
                    disabled={exerciseIndex === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveExercise(exerciseIndex, "down")}
                    disabled={exerciseIndex === exercises.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <ConfirmationDialogHeader>
                        <ConfirmationDialogTitle>¿Estás seguro?</ConfirmationDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará el ejercicio de esta sesión de entrenamiento.
                        </AlertDialogDescription>
                      </ConfirmationDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeExercise(exercise.id)}>Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {exercise.notes && <p className="text-sm text-muted-foreground">{exercise.notes}</p>}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sets Table Header */}
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground">
                  <div>Serie</div>
                  <div>Peso (kg)</div>
                  <div>Reps</div>
                  <div>RPE</div>
                  <div>Notas</div>
                  <div>Estado</div>
                </div>

                {/* Sets */}
                {exercise.sets.map((set) => (
                  <div key={set.id} className="grid items-center grid-cols-6 gap-4">
                    <div className="font-medium">
                      {set.setNumber}
                      {set.targetWeight && (
                        <div className="text-xs text-muted-foreground">
                          {set.targetReps} @ {set.targetWeight}kg
                        </div>
                      )}
                    </div>

                    <Input
                      type="number"
                      step="0.5"
                      value={set.weightKg}
                      onChange={(e) =>
                        updateSet(exercise.id, set.id, {
                          weightKg: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-9"
                    />

                    <Input
                      type="number"
                      value={set.repsDone}
                      onChange={(e) =>
                        updateSet(exercise.id, set.id, {
                          repsDone: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      className="h-9"
                    />

                    <Select
                      value={set.rpe?.toString() || ""}
                      onValueChange={(value) =>
                        updateSet(exercise.id, set.id, {
                          rpe: value ? Number.parseInt(value) : undefined,
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="RPE" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((rpe) => (
                          <SelectItem key={rpe} value={rpe.toString()}>
                            {rpe}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Notas..."
                      value={set.notes || ""}
                      onChange={(e) => updateSet(exercise.id, set.id, { notes: e.target.value })}
                      className="h-9"
                    />

                    <Button
                      variant={set.completed ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSet(exercise.id, set.id, { completed: !set.completed })}
                      className={set.completed ? "" : "bg-transparent"}
                    >
                      {set.completed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Exercise */}
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <Drawer open={isAddExerciseDrawerOpen} onOpenChange={setIsAddExerciseDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" className="bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Ejercicio
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Agregar Ejercicio</DrawerTitle>
                  <DrawerDescription>Añade un ejercicio adicional a tu sesión</DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                  <Command>
                    <CommandInput
                      placeholder="Busca un ejercicio o crea uno nuevo..."
                      value={search}
                      onValueChange={setSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        <Dialog open={isCreateExerciseDialogOpen} onOpenChange={setIsCreateExerciseDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full">Crear "{search}"</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Crear Nuevo Ejercicio</DialogTitle>
                              <DialogDescription>Agrega un nuevo ejercicio a tu biblioteca personal</DialogDescription>
                            </DialogHeader>
                            <ExerciseForm
                              exercise={{ name: search }}
                              onSuccess={handleExerciseCreated}
                              onFormSubmit={() => setIsCreateExerciseDialogOpen(false)}
                            />
                          </DialogContent>
                        </Dialog>
                      </CommandEmpty>
                      <CommandGroup heading="Ejercicios">
                        {allExercises.map((ex) => (
                          <CommandItem key={ex.id} value={ex.name} onSelect={() => handleAddExercise(ex.id)}>
                            {ex.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
                <DrawerFooter>
                  <Input
                    type="number"
                    placeholder="Número de series"
                    value={newExerciseSets}
                    onChange={(e) => setNewExerciseSets(Number(e.target.value) || 3)}
                  />
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </CardContent>
        </Card>

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
              rows={3}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
