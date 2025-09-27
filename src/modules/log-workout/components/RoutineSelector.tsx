'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/components/ui/card";
import { Dumbbell } from "lucide-react";
import { WorkoutSelector } from "@core/components/workout-selector";
import { Routine, RoutineDay } from "@modules/log-workout/actions/log-workout.actions";

interface RoutineSelectorProps {
  routines: Routine[];
}

export default function RoutineSelector({ routines }: RoutineSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Elegir de Rutinas
        </CardTitle>
        <CardDescription>Selecciona cualquier día de tus rutinas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {routines.map((routine: Routine) => (
            <div key={routine.id} className="space-y-3">
              <h4 className="font-medium">{routine.name}</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {routine.days
                  .filter((day: RoutineDay) => day.items.length > 0)
                  .map((day: RoutineDay) => (
                    <div key={day.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{day.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {day.items.length} ejercicio{day.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <WorkoutSelector
                        routineId={routine.id}
                        dayId={day.id}
                        buttonText="Iniciar"
                        variant="outline"
                        size="sm"
                      />
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {routines.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No tienes rutinas creadas</p>
              <p className="text-sm">Crea una rutina primero para usar esta opción</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
