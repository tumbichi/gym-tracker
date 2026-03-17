import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/components/ui/card";
import { Badge } from "@core/components/ui/badge";
import { Separator } from "@core/components/ui/separator";
import type { Routine } from "@modules/routines/types"; // Asumimos que este tipo existirá
import RoutineExerciseDetailsItem from "./RoutineExerciseDetailsItem";

interface RoutineDetailsDisplayProps {
  routine: Routine;
}

export default function RoutineDetailsDisplay({ routine }: RoutineDetailsDisplayProps) {
  const activeDaysCount = routine.days.filter((day) => day.items.length > 0).length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">{routine.name}</CardTitle>
          <CardDescription>
            {activeDaysCount} día{activeDaysCount !== 1 ? "s" : ""} de entrenamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Creada el {new Date(routine.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Detalle Semanal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {routine.days.map((day) => (
            <div key={day.id} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{day.name}</h3>
                <Badge variant="secondary">
                  {day.items.length} ejercicio{day.items.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <Separator />
              {day.items.length > 0 ? (
                <div className="grid gap-4 pt-2">
                  {day.items.map((item) => (
                    <RoutineExerciseDetailsItem key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Día de descanso.</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
