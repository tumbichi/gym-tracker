"use client";

import { useState } from "react";
import { Card, CardContent } from "@core/components/ui/card";
import { Button } from "@core/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { Routine, deleteRoutine } from "@modules/routines/actions/routines.actions";
import RoutineCard from "../components/RoutineCard";
import CreateRoutineDialog from "../components/CreateRoutineDialog";
import type { Exercise } from "@prisma/client";

interface RoutineListProps {
  initialRoutines: Routine[];
  initialExercises: Exercise[];
}

export default function RoutineList({ initialRoutines, initialExercises }: RoutineListProps) {
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [allExercises, setAllExercises] = useState<Exercise[]>(initialExercises);

  const handleDeleteRoutine = async (routineId: number) => {
    try {
      await deleteRoutine(routineId);
      setRoutines((currentRoutines) => currentRoutines.filter((r) => r.id !== routineId));
    } catch (error: any) {
      console.error("Error deleting routine:", error);
      // Optionally show a toast error here
    }
  };

  const handleRoutineCreated = (newRoutine: Routine) => {
    console.log('New routine created:', newRoutine);
    setRoutines((currentRoutines) => [newRoutine, ...currentRoutines]);
  };

  const handleRoutineUpdated = (updatedRoutine: Routine) => {
    console.log('Routine received by handleRoutineUpdated:', updatedRoutine);
    setRoutines((currentRoutines) =>
      currentRoutines.map((r) => {
        if (r.id === updatedRoutine.id) {
          console.log('Replacing routine:', r.name, 'with', updatedRoutine.name);
          return updatedRoutine;
        }
        return r;
      })
    );
  };

  const handleExerciseCreated = (newExercise: Exercise) => {
    setAllExercises((currentExercises) => [...currentExercises, newExercise]);
  };

  return (
    <div className="container mx-auto p-6 space-y-">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Rutinas</h1>
        <CreateRoutineDialog 
          allExercises={allExercises} 
          onExercisesUpdate={handleExerciseCreated} 
          onRoutineCreated={handleRoutineCreated} 
        />
      </div>

      {/* Routines Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {routines.map((routine) => {
          // console.log('Mapping routine:', routine); // Remove debug log
          return (
            <RoutineCard 
              key={routine.id} 
              routine={routine} 
              allExercises={allExercises} 
              onDelete={handleDeleteRoutine} 
              onRoutineUpdated={handleRoutineUpdated} // Pass the new prop
            />
          );
        })}

        {/* Empty State */}
        {routines.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tienes rutinas creadas</h3>
              <p className="text-muted-foreground text-center mb-4">
                Crea tu primera rutina de entrenamiento para comenzar a organizar tus sesiones
              </p>
              <CreateRoutineDialog
                allExercises={allExercises}
                onExercisesUpdate={handleExerciseCreated}
                onRoutineCreated={handleRoutineCreated}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
