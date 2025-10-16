
import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/components/ui/card";
import { Badge } from "@core/components/ui/badge";
import { Button } from "@core/components/ui/button";
import { Plus } from "lucide-react";
import type { Exercise } from "@prisma/client";
import type { RoutineDay } from "@modules/routines/actions/routines.actions";
import { RoutineExerciseItem } from "./RoutineExerciseItem";

interface RoutineDayCardProps {
  day: RoutineDay;
  dayIndex: number;
  allExercises: Exercise[];
  onDayItemChange: (itemIndex: number, field: string, value: any) => void;
  onAddExercise: () => void;
  onRemoveExercise: (itemIndex: number) => void;
  onMoveExercise: (itemIndex: number, direction: "up" | "down") => void; // New prop
  onCreateExercise: (name: string, itemIndex: number) => void;
}

export function RoutineDayCard({
  day,
  dayIndex,
  allExercises,
  onDayItemChange,
  onAddExercise,
  onRemoveExercise,
  onMoveExercise, // New prop
  onCreateExercise,
}: RoutineDayCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{day.name}</CardTitle>
          <Badge variant="secondary">
            {day.items.length} ejercicio{day.items.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        {day.items.map((item, itemIndex) => (
          <RoutineExerciseItem
            key={item.order} // Use order for stable key
            item={item}
            itemIndex={itemIndex}
            isFirst={itemIndex === 0}
            isLast={itemIndex === day.items.length - 1}
            allExercises={allExercises}
            onItemChange={(field, value) => onDayItemChange(itemIndex, field, value)}
            onRemove={() => onRemoveExercise(itemIndex)}
            onMove={(direction) => onMoveExercise(itemIndex, direction)} // Pass handler
            onCreateExercise={(name) => onCreateExercise(name, itemIndex)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddExercise}
          className="w-full bg-transparent mt-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Ejercicio
        </Button>
      </CardContent>
    </Card>
  );
}
