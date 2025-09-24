import { ExerciseForm } from "@core/components/exercise-form";
import { Button } from "@core/components/ui/button";
import { Card, CardContent } from "@core/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@core/components/ui/dialog";
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  Drawer,
} from "@core/components/ui/drawer";
import { Input } from "@core/components/ui/input";
import { Exercise } from "@prisma/client";
import { Plus, Search, Minus } from "lucide-react";
import React, { useState } from "react";

interface AddExerciseToWorkoutProps {
  onCreateExercise: (newExercise: Exercise) => void;
  onAddExercise: (exerciseId: number, sets: number) => void;
  availableExercises: Exercise[];
}

function AddExerciseToWorkout({ availableExercises, onAddExercise, onCreateExercise }: AddExerciseToWorkoutProps) {
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isCreateExerciseDialogOpen, setIsCreateExerciseDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newExerciseSets, setNewExerciseSets] = useState(3);

  const handleAddExercise = (exerciseId: number) => {
    try {
      onAddExercise(exerciseId, newExerciseSets);
      setIsAddExerciseOpen(false);
      setNewExerciseSets(3);
      setSearch("");
    } catch (error) {
      console.error("Error adding exercise:", error);
    }
  };

  const handleExerciseCreated = (newExercise: Exercise) => {
    onCreateExercise(newExercise);
    handleAddExercise(newExercise.id);
    setIsCreateExerciseDialogOpen(false);
  };

  const filteredExercises = availableExercises.filter((ex) => ex.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center justify-center py-8">
        <Drawer open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="lg" className="px-8 bg-transparent h-14">
              <Plus className="w-5 h-5 mr-2" />
              Agregar Ejercicio
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle>Agregar Ejercicio</DrawerTitle>
              <DrawerDescription>Busca un ejercicio existente o crea uno nuevo</DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 p-4 overflow-hidden">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar ejercicio..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-12 pl-10 text-base"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium">Series:</label>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewExerciseSets(Math.max(1, newExerciseSets - 1))}
                      className="w-10 h-10 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={newExerciseSets}
                      onChange={(e) => setNewExerciseSets(Math.max(1, Number.parseInt(e.target.value) || 1))}
                      className="w-16 h-10 text-center"
                      min="1"
                      max="10"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewExerciseSets(Math.min(10, newExerciseSets + 1))}
                      className="w-10 h-10 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="overflow-y-auto border rounded-lg max-h-60">
                  {filteredExercises.length > 0 ? (
                    <div className="divide-y">
                      {filteredExercises.map((exercise) => (
                        <button
                          key={exercise.id}
                          onClick={() => handleAddExercise(exercise.id)}
                          className="w-full p-4 text-left transition-colors hover:bg-muted/50"
                        >
                          <div className="font-medium">{exercise.name}</div>
                          {exercise.primaryGroup && (
                            <div className="text-sm text-muted-foreground">
                              {exercise.primaryGroup}
                              {exercise.equipment && ` • ${exercise.equipment}`}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="mb-4 text-muted-foreground">
                        {search ? `No se encontró "${search}"` : "No hay ejercicios disponibles"}
                      </div>
                      {search && (
                        <Dialog open={isCreateExerciseDialogOpen} onOpenChange={setIsCreateExerciseDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>Crear "{search}"</Button>
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
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>
  );
}

export default AddExerciseToWorkout;
